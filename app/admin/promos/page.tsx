'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { A, ACard, EmptyState, LoadingSkeleton, PageHeader, PrimaryBtn } from '@/lib/admin-ui'
import { toast } from 'sonner'
import { Plus, Trash2, Tag, GraduationCap, UserPlus, Cake, Settings } from 'lucide-react'

type PromoType = 'student_pass' | 'new_member' | 'birthday' | 'custom'
type DiscountType = 'percent' | 'fixed'

interface Promo {
  id: string
  name: string
  type: PromoType
  description: string | null
  discount_type: DiscountType
  discount_value: number
  plan_id: string | null
  valid_from: string | null
  valid_until: string | null
  is_active: boolean | null
}

interface Plan {
  id: string
  name: string
  price: number
}

const PROMO_PRESETS: Record<PromoType, { label: string; icon: React.ReactNode; description: string; discount_type: DiscountType; discount_value: number }> = {
  student_pass: {
    label: 'Student Pass',
    icon: <GraduationCap size={18} />,
    description: 'Discounted rate for students with valid school ID',
    discount_type: 'percent',
    discount_value: 20,
  },
  new_member: {
    label: 'New Member',
    icon: <UserPlus size={18} />,
    description: 'Welcome discount for first-time members',
    discount_type: 'percent',
    discount_value: 10,
  },
  birthday: {
    label: 'Birthday Promo',
    icon: <Cake size={18} />,
    description: 'Special rate for members celebrating their birthday month',
    discount_type: 'percent',
    discount_value: 15,
  },
  custom: {
    label: 'Custom Promo',
    icon: <Settings size={18} />,
    description: '',
    discount_type: 'fixed',
    discount_value: 0,
  },
}

const EMPTY_FORM = {
  name: '',
  type: 'custom' as PromoType,
  description: '',
  discount_type: 'percent' as DiscountType,
  discount_value: '',
  plan_id: '',
  valid_from: '',
  valid_until: '',
}

export default function PromosPage() {
  const { profile } = useAuth()
  const supabase = createClient()

  const [promos, setPromos] = useState<Promo[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [{ data: promosData }, { data: plansData }] = await Promise.all([
      supabase.from('promos').select('*').order('created_at', { ascending: false }),
      supabase.from('membership_plans').select('id, name, price').eq('is_active', true).order('price'),
    ])
    setPromos(
      (promosData ?? []).map((p) => ({
        ...p,
        type: p.type as PromoType,
        discount_type: p.discount_type as DiscountType,
        is_active: p.is_active ?? false,
      }))
    )
    setPlans(plansData ?? [])
    setIsLoading(false)
  }

  function openPreset(type: PromoType) {
    const preset = PROMO_PRESETS[type]
    setForm({
      ...EMPTY_FORM,
      name: preset.label,
      type,
      description: preset.description,
      discount_type: preset.discount_type,
      discount_value: String(preset.discount_value),
    })
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setForm(EMPTY_FORM)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.gymId) return
    setSaving(true)

    const discountVal = parseFloat(form.discount_value)
    if (isNaN(discountVal) || discountVal <= 0) {
      toast.error('Discount value must be greater than 0')
      setSaving(false)
      return
    }

    const { error } = await supabase.from('promos').insert({
      gym_id: profile.gymId,
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: discountVal,
      plan_id: form.plan_id || null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: true,
    })

    if (error) { toast.error('Failed to create promo: ' + error.message); setSaving(false); return }
    toast.success('Promo created!')
    cancel()
    loadData()
    setSaving(false)
  }

  async function toggleActive(promo: Promo) {
    const { error } = await supabase
      .from('promos')
      .update({ is_active: !promo.is_active })
      .eq('id', promo.id)
    if (error) { toast.error('Failed to update promo'); return }
    toast.success(promo.is_active ? 'Promo deactivated' : 'Promo activated')
    loadData()
  }

  async function deletePromo(id: string) {
    const { error } = await supabase.from('promos').delete().eq('id', id)
    if (error) { toast.error('Failed to delete promo'); return }
    toast.success('Promo deleted')
    loadData()
  }

  function formatDiscount(promo: Promo) {
    return promo.discount_type === 'percent'
      ? `${promo.discount_value}% off`
      : `₱${promo.discount_value.toLocaleString()} off`
  }

  const promoIcon = (type: PromoType) => PROMO_PRESETS[type].icon

  if (isLoading) {
    return <LoadingSkeleton rows={5} h={76} />
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: A.bg }}>
      <PageHeader
        title="Promos and Packages"
        subtitle="Create discounts and special offers for your members"
        action={
          <PrimaryBtn onClick={() => openPreset('custom')}>
            <Plus size={16} />
            New Promo
          </PrimaryBtn>
        }
      />

      {!showForm && (
        <div>
          <p className="text-xs mb-2 uppercase tracking-widest font-medium" style={{ color: A.muted }}>Quick add</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(['student_pass', 'new_member', 'birthday', 'custom'] as PromoType[]).map((type) => (
              <button
                key={type}
                onClick={() => openPreset(type)}
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors text-left"
                style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text2 }}
              >
                <span style={{ color: 'var(--color-primary)' }}>{PROMO_PRESETS[type].icon}</span>
                {PROMO_PRESETS[type].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <ACard className="p-4">
          <p className="text-base font-semibold mb-4" style={{ color: A.text }}>Create Promo</p>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Promo Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Student Pass"
                    required
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as PromoType })}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  >
                    <option value="student_pass">Student Pass</option>
                    <option value="new_member">New Member</option>
                    <option value="birthday">Birthday Promo</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Discount Type</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {(['percent', 'fixed'] as DiscountType[]).map((dt) => (
                      <button
                        key={dt}
                        type="button"
                        onClick={() => setForm({ ...form, discount_type: dt })}
                        className="rounded-lg px-3 py-2 text-sm transition-colors"
                        style={{
                          border: form.discount_type === dt ? '1px solid var(--color-primary)' : `1px solid ${A.border}`,
                          backgroundColor: form.discount_type === dt ? 'rgba(212,149,106,0.1)' : A.surface2,
                          color: form.discount_type === dt ? 'var(--color-primary)' : A.text2,
                        }}
                      >
                        {dt === 'percent' ? '% Percent' : '₱ Fixed'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>
                    Discount Value {form.discount_type === 'percent' ? '(%)' : '(₱)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder={form.discount_type === 'percent' ? '20' : '200'}
                    required
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Applies to Plan (optional)</label>
                  <select
                    value={form.plan_id}
                    onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  >
                    <option value="">All plans</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — ₱{p.price.toLocaleString()}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Description (optional)</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="e.g. Requires valid student ID"
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Valid From (optional)</label>
                  <input
                    type="date"
                    value={form.valid_from}
                    onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
                <div>
                  <label className="text-sm" style={{ color: A.text2 }}>Valid Until (optional)</label>
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <PrimaryBtn type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Create Promo'}
                </PrimaryBtn>
                <button
                  type="button"
                  onClick={cancel}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: A.surface2, border: `1px solid ${A.border}`, color: A.text2 }}
                >
                  Cancel
                </button>
              </div>
            </form>
        </ACard>
      )}

      {promos.length === 0 ? (
        <EmptyState
          icon={<Tag size={40} />}
          title="No promos yet"
          subtitle="Use the quick-add buttons above to create your first promo"
        />
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const plan = plans.find((p) => p.id === promo.plan_id)
            return (
              <ACard
                key={promo.id}
                style={{ opacity: promo.is_active ? 1 : 0.5 }}
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className="mt-0.5 shrink-0 rounded-lg p-1.5"
                      style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
                    >
                      {promoIcon(promo.type)}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium" style={{ color: A.text }}>{promo.name}</p>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded font-medium"
                          style={{ backgroundColor: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}
                        >
                          {formatDiscount(promo)}
                        </span>
                        {!promo.is_active && (
                          <span className="text-xs px-1.5 py-0.5 rounded" style={{ border: `1px solid ${A.border}`, color: A.muted }}>
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: A.text2 }}>
                        {plan ? `Applies to: ${plan.name}` : 'Applies to all plans'}
                        {promo.valid_until && ` · Expires ${promo.valid_until}`}
                      </p>
                      {promo.description && (
                        <p className="text-xs" style={{ color: A.muted }}>{promo.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={() => toggleActive(promo)}
                      className="rounded-md px-2 py-1 text-xs"
                      style={{ color: A.text2 }}
                    >
                      {promo.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePromo(promo.id)}
                      className="h-8 w-8 rounded-md grid place-items-center"
                      style={{ color: 'var(--admin-expired-text)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </ACard>
            )
          })}
        </div>
      )}
    </div>
  )
}