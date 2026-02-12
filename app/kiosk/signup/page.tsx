"use client"

import React, { useState } from "react"
import { useGym } from "@/lib/gym-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import type { MembershipPlanId, PaymentMethod } from "@/lib/types"
import { UserPlus, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const { plans, addMember, findMemberByContact } = useGym()
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [planId, setPlanId] = useState<MembershipPlanId>("monthly")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [success, setSuccess] = useState(false)
  const [createdName, setCreatedName] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !contact.trim()) {
      toast.error("Please fill in all fields.")
      return
    }

    const existing = findMemberByContact(contact.trim())
    if (existing) {
      toast.error(
        "A member with that contact number already exists. Use the Renew page instead."
      )
      return
    }

    const member = addMember({
      name: name.trim(),
      contactNumber: contact.trim(),
      membershipPlanId: planId,
      paymentMethod,
    })
    setCreatedName(member.name)
    setSuccess(true)
    toast.success("Member signed up successfully!")
  }

  function handleReset() {
    setName("")
    setContact("")
    setPlanId("monthly")
    setPaymentMethod("cash")
    setSuccess(false)
    setCreatedName("")
  }

  if (success) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl font-bold text-primary-foreground">
            Welcome, {createdName}!
          </h2>
          <p className="text-muted-foreground">
            Membership is now active. Head to Check-In to start.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-muted-foreground/30 bg-transparent text-primary-foreground hover:bg-muted-foreground/10"
            >
              Sign Up Another
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="/kiosk">Go to Check-In</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground">
            New Member Signup
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Register and pay to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-primary-foreground">Full Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              className="border-muted-foreground/30 bg-muted-foreground/10 text-primary-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-primary-foreground">Contact Number</Label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. 09171234567"
              className="border-muted-foreground/30 bg-muted-foreground/10 text-primary-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-primary-foreground">Membership Plan</Label>
            <RadioGroup
              value={planId}
              onValueChange={(v) => setPlanId(v as MembershipPlanId)}
              className="grid grid-cols-3 gap-3"
            >
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border p-4 text-center transition-colors ${
                    planId === plan.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                  }`}
                >
                  <RadioGroupItem value={plan.id} className="sr-only" />
                  <span className="text-sm font-medium">{plan.name}</span>
                  <span className="text-lg font-bold">
                    {"P" + plan.price.toLocaleString()}
                  </span>
                  <span className="text-xs">
                    {plan.durationDays === 1
                      ? "1 day"
                      : plan.durationDays + " days"}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label className="text-primary-foreground">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
              className="grid grid-cols-2 gap-3"
            >
              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                <RadioGroupItem value="cash" className="sr-only" />
                <span className="text-sm font-medium">Cash</span>
              </label>
              <label
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 transition-colors ${
                  paymentMethod === "gcash"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40"
                }`}
              >
                <RadioGroupItem value="gcash" className="sr-only" />
                <span className="text-sm font-medium">GCash</span>
              </label>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            Sign Up & Record Payment
          </Button>
        </form>
      </div>
    </div>
  )
}
