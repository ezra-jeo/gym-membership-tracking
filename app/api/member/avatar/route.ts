import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import { createServerSupabaseClient } from "@/lib/supabase-server"

interface AvatarCooldownResult {
  updated?: boolean
  nextAllowedAt?: string | null
  next_allowed_at?: string | null
  message?: string | null
}

const AVATAR_BUCKET_CANDIDATES = ["member-avatars", "gym-assets"] as const

function isBucketNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const maybeMessage = "message" in error ? String((error as { message?: unknown }).message ?? "") : ""
  const maybeCode = "statusCode" in error ? String((error as { statusCode?: unknown }).statusCode ?? "") : ""
  return maybeCode === "404" || /bucket not found/i.test(maybeMessage)
}

function parseDataUrl(dataUrl: string): { contentType: string; buffer: Buffer } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) {
    throw new Error("Invalid avatar image payload.")
  }

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64"),
  }
}

function buildAvatarPath(userId: string): string {
  const random = Math.random().toString(36).slice(2)
  return `avatars/${userId}/${Date.now()}-${random}.jpg`
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const admin = createAdminClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  let body: { avatarUrl?: string; avatarDataUrl?: string }
  try {
    body = (await request.json()) as { avatarUrl?: string; avatarDataUrl?: string }
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 })
  }

  const avatarDataUrl = typeof body.avatarDataUrl === "string" ? body.avatarDataUrl.trim() : ""
  const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : ""

  let publicUrl = avatarUrl
  let uploadedPath: string | null = null

  if (avatarDataUrl) {
    const { contentType, buffer } = parseDataUrl(avatarDataUrl)
    const uploadPath = buildAvatarPath(user.id)

    for (const bucket of AVATAR_BUCKET_CANDIDATES) {
      const { error: uploadError } = await admin.storage.from(bucket).upload(uploadPath, buffer, {
        upsert: true,
        contentType,
      })

      if (!uploadError) {
        uploadedPath = uploadPath
        publicUrl = admin.storage.from(bucket).getPublicUrl(uploadPath).data.publicUrl
        break
      }

      if (!isBucketNotFoundError(uploadError)) {
        return NextResponse.json({ error: uploadError.message }, { status: 400 })
      }
    }

    if (!publicUrl) {
      return NextResponse.json({ error: "Avatar storage bucket is missing. Please create member-avatars or gym-assets." }, { status: 500 })
    }
  }

  const { data, error } = await (supabase as any).rpc('set_member_avatar_with_cooldown', {
    p_member_id: user.id,
    p_avatar_url: publicUrl,
    p_lock_days: 14,
  });

  if (error) {
    console.error("RPC Error:", error.message);
  } else {
    console.log("Success:", data);
  }

  if (error) {
    if (uploadedPath) {
      for (const bucket of AVATAR_BUCKET_CANDIDATES) {
        void admin.storage.from(bucket).remove([uploadedPath])
      }
    }
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const payload = Array.isArray(data) ? (data[0] as AvatarCooldownResult | undefined) : (data as AvatarCooldownResult | null)
  const updated = typeof payload?.updated === "boolean" ? payload.updated : true
  const nextAllowedAt = payload?.nextAllowedAt ?? payload?.next_allowed_at ?? null
  const message = payload?.message ?? (updated ? "Avatar updated successfully." : "Avatar change is on cooldown.")

  return NextResponse.json({
    updated,
    nextAllowedAt,
    message,
    avatarUrl: publicUrl,
  })
}
