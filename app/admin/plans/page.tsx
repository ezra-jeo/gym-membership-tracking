'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { A, ACard, EmptyState, LoadingSkeleton, PageHeader, PrimaryBtn } from '@/lib/admin-ui'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, PackageOpen } from 'lucide-react'

interface Plan {
  id: string
  name: string
  price: number
  duration_days: number
  description: string | null
  is_active: boolean | null
  sort_order: number | null
}

const EMPTY_FORM = { name: '', price: '', duration_days: '', description: '' }

export default function PlansPage() {
  const { profile } = useAuth()
  const supabase = createClient()

  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadPlans() }, [])

  async function loadPlans() {
    const { data } = await supabase
      .from('membership_plans')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('price', { ascending: true })
    setPlans(data ?? [])
    setIsLoading(false)
  }

  function openCreate() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function openEdit(p: Plan) {
    setEditId(p.id)
    setForm({
      name: p.name,
      price: String(p.price),
      duration_days: String(p.duration_days),
      description: p.description ?? '',
    })
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.gymId) return
    setSaving(true)

    const payload = {
      name: form.name.trim(),
      price: parseFloat(form.price),
      duration_days: parseInt(form.duration_days, 10),
      description: form.description.trim() || null,
      gym_id: profile.gymId,
    }

    if (isNaN(payload.price) || isNaN(payload.duration_days)) {
      toast.error('Price and duration must be valid numbers')
      setSaving(false)
      return
    }

    const { error } = editId
      ? await supabase.from('membership_plans').update(payload).eq('id', editId)
      : await supabase.from('membership_plans').insert(payload)

    if (error) { toast.error('Failed to save plan: ' + error.message); setSaving(false); return }
    toast.success(editId ? 'Plan updated!' : 'Plan created!')
    cancel()
    loadPlans()
    setSaving(false)
  }

  async function toggleActive(plan: Plan) {
    const { error } = await supabase
      .from('membership_plans')
      .update({ is_active: !plan.is_active })
      .eq('id', plan.id)
    if (error) { toast.error('Failed to update plan'); return }
    toast.success(plan.is_active ? 'Plan deactivated' : 'Plan activated')
    loadPlans()
  }

  async function deletePlan(id: string) {
    const { error } = await supabase.from('membership_plans').delete().eq('id', id)
    if (error) { toast.error('Cannot delete — plan may be in use'); return }
    toast.success('Plan deleted')
    loadPlans()
  }

  if (isLoading) {
    return <LoadingSkeleton rows={5} h={76} />
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: A.bg }}>
      <PageHeader
        title="Membership Plans"
        subtitle="Configure the plans available to your members"
        action={
          <PrimaryBtn onClick={openCreate}>
            <Plus size={16} />
            New Plan
          </PrimaryBtn>
        }
      />

      {showForm && (
        <ACard className="p-4">
          <p className="text-base font-semibold mb-4" style={{ color: A.text }}>
            {editId ? 'Edit Plan' : 'Create Plan'}
          </p>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Plan Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Monthly"
                    required
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Price (₱)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1500"
                    required
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Duration (days)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.duration_days}
                    onChange={(e) => setForm({ ...form, duration_days: e.target.value })}
                    placeholder="30"
                    required
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Description (optional)</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Full access, unlimited visits"
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Plan'}
                </PrimaryBtn>
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: A.surface2, color: A.text2, border: `1px solid ${A.border}` }}
                >
                  Cancel
                </button>
              </div>
            </form>
        </ACard>
      )}

      {plans.length === 0 ? (
        <EmptyState
          icon={<PackageOpen size={40} />}
          title="No membership plans yet"
          subtitle="Create your first plan to get started"
        />
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <ACard
              key={plan.id}
              style={{ opacity: plan.is_active ? 1 : 0.5 }}
              className="p-4"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium" style={{ color: A.text }}>{plan.name}</p>
                    {!plan.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ border: `1px solid ${A.border}`, color: A.muted }}>
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: A.text2 }}>
                    ₱{plan.price.toLocaleString()} · {plan.duration_days} days
                    {plan.description && ` · ${plan.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <button
                    type="button"
                    onClick={() => openEdit(plan)}
                    className="h-8 w-8 rounded-md grid place-items-center"
                    style={{ color: A.text2 }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(plan)}
                    className="rounded-md px-2 py-1 text-xs"
                    style={{ color: A.text2 }}
                  >
                    {plan.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deletePlan(plan.id)}
                    className="h-8 w-8 rounded-md grid place-items-center"
                    style={{ color: 'var(--admin-expired-text)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </ACard>
          ))}
        </div>
      )}
    </div>
  )
}