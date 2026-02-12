"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type {
  Member,
  Payment,
  CheckIn,
  MembershipPlan,
  MembershipPlanId,
  MemberStatus,
  PaymentMethod,
} from "./types"
import {
  MEMBERSHIP_PLANS,
  SEED_MEMBERS,
  SEED_PAYMENTS,
  SEED_CHECKINS,
} from "./demo-data"

interface GymContextValue {
  // Data
  members: Member[]
  payments: Payment[]
  checkIns: CheckIn[]
  plans: MembershipPlan[]

  // Member operations
  addMember: (data: {
    name: string
    contactNumber: string
    membershipPlanId: MembershipPlanId
    paymentMethod: PaymentMethod
  }) => Member
  renewMember: (
    memberId: string,
    planId: MembershipPlanId,
    paymentMethod: PaymentMethod
  ) => void
  updateMemberStatus: (memberId: string, status: MemberStatus) => void
  getMember: (id: string) => Member | undefined
  findMemberByContact: (contact: string) => Member | undefined

  // Check-in / Check-out
  checkInMember: (memberId: string) => void
  checkOutMember: (memberId: string) => void
  isCheckedIn: (memberId: string) => boolean
  getCurrentCheckIn: (memberId: string) => CheckIn | undefined

  // Payment operations
  recordPayment: (data: {
    memberId: string
    amount: number
    method: PaymentMethod
    description: string
  }) => void

  // Analytics helpers
  getCheckedInMembers: () => (CheckIn & { member: Member })[]
  getTodayVisitCount: () => number
  getActiveCount: () => number
  getExpiredCount: () => number
  getFrozenCount: () => number
  getTodayRevenue: () => number
  getMonthRevenue: () => number
  getRevenueByDay: (days: number) => { date: string; amount: number }[]
  getAttendanceByDay: (days: number) => { date: string; count: number }[]
}

const GymContext = createContext<GymContextValue | null>(null)

let nextId = 1000

function generateId(prefix: string) {
  nextId++
  return `${prefix}-${nextId}`
}

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(SEED_MEMBERS)
  const [payments, setPayments] = useState<Payment[]>(SEED_PAYMENTS)
  const [checkIns, setCheckIns] = useState<CheckIn[]>(SEED_CHECKINS)
  const plans = MEMBERSHIP_PLANS

  const getMember = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  )

  const findMemberByContact = useCallback(
    (contact: string) => members.find((m) => m.contactNumber === contact),
    [members]
  )

  const addMember = useCallback(
    (data: {
      name: string
      contactNumber: string
      membershipPlanId: MembershipPlanId
      paymentMethod: PaymentMethod
    }) => {
      const plan = plans.find((p) => p.id === data.membershipPlanId)!
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + plan.durationDays)

      const newMember: Member = {
        id: generateId("m"),
        name: data.name,
        contactNumber: data.contactNumber,
        membershipPlanId: data.membershipPlanId,
        startDate: today.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        status: "active",
        createdAt: today.toISOString().split("T")[0],
      }

      setMembers((prev) => [...prev, newMember])

      const newPayment: Payment = {
        id: generateId("p"),
        memberId: newMember.id,
        amount: plan.price,
        method: data.paymentMethod,
        description: `New signup - ${plan.name}`,
        date: today.toISOString().split("T")[0],
      }
      setPayments((prev) => [...prev, newPayment])

      return newMember
    },
    [plans]
  )

  const renewMember = useCallback(
    (
      memberId: string,
      planId: MembershipPlanId,
      paymentMethod: PaymentMethod
    ) => {
      const plan = plans.find((p) => p.id === planId)!
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + plan.durationDays)

      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? {
                ...m,
                membershipPlanId: planId,
                startDate: today.toISOString().split("T")[0],
                endDate: endDate.toISOString().split("T")[0],
                status: "active" as MemberStatus,
              }
            : m
        )
      )

      const newPayment: Payment = {
        id: generateId("p"),
        memberId,
        amount: plan.price,
        method: paymentMethod,
        description: `Renewal - ${plan.name}`,
        date: today.toISOString().split("T")[0],
      }
      setPayments((prev) => [...prev, newPayment])
    },
    [plans]
  )

  const updateMemberStatus = useCallback(
    (memberId: string, status: MemberStatus) => {
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, status } : m))
      )
    },
    []
  )

  const isCheckedIn = useCallback(
    (memberId: string) =>
      checkIns.some(
        (c) => c.memberId === memberId && c.checkOutTime === null
      ),
    [checkIns]
  )

  const getCurrentCheckIn = useCallback(
    (memberId: string) =>
      checkIns.find(
        (c) => c.memberId === memberId && c.checkOutTime === null
      ),
    [checkIns]
  )

  const checkInMember = useCallback(
    (memberId: string) => {
      if (isCheckedIn(memberId)) return
      const newCheckIn: CheckIn = {
        id: generateId("ci"),
        memberId,
        checkInTime: new Date().toISOString(),
        checkOutTime: null,
      }
      setCheckIns((prev) => [...prev, newCheckIn])
    },
    [isCheckedIn]
  )

  const checkOutMember = useCallback((memberId: string) => {
    setCheckIns((prev) =>
      prev.map((c) =>
        c.memberId === memberId && c.checkOutTime === null
          ? { ...c, checkOutTime: new Date().toISOString() }
          : c
      )
    )
  }, [])

  const recordPayment = useCallback(
    (data: {
      memberId: string
      amount: number
      method: PaymentMethod
      description: string
    }) => {
      const newPayment: Payment = {
        id: generateId("p"),
        memberId: data.memberId,
        amount: data.amount,
        method: data.method,
        description: data.description,
        date: new Date().toISOString().split("T")[0],
      }
      setPayments((prev) => [...prev, newPayment])
    },
    []
  )

  const getCheckedInMembers = useCallback(() => {
    return checkIns
      .filter((c) => c.checkOutTime === null)
      .map((c) => ({
        ...c,
        member: members.find((m) => m.id === c.memberId)!,
      }))
      .filter((c) => c.member)
  }, [checkIns, members])

  const getTodayVisitCount = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]
    return checkIns.filter((c) => c.checkInTime.startsWith(today)).length
  }, [checkIns])

  const getActiveCount = useCallback(
    () => members.filter((m) => m.status === "active").length,
    [members]
  )
  const getExpiredCount = useCallback(
    () => members.filter((m) => m.status === "expired").length,
    [members]
  )
  const getFrozenCount = useCallback(
    () => members.filter((m) => m.status === "frozen").length,
    [members]
  )

  const getTodayRevenue = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]
    return payments
      .filter((p) => p.date === today)
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const getMonthRevenue = useCallback(() => {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0]
    return payments
      .filter((p) => p.date >= monthStart)
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const getRevenueByDay = useCallback(
    (days: number) => {
      const result: { date: string; amount: number }[] = []
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        const total = payments
          .filter((p) => p.date === dateStr)
          .reduce((sum, p) => sum + p.amount, 0)
        result.push({ date: dateStr, amount: total })
      }
      return result
    },
    [payments]
  )

  const getAttendanceByDay = useCallback(
    (days: number) => {
      const result: { date: string; count: number }[] = []
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split("T")[0]
        const count = checkIns.filter((c) =>
          c.checkInTime.startsWith(dateStr)
        ).length
        result.push({ date: dateStr, count })
      }
      return result
    },
    [checkIns]
  )

  return (
    <GymContext.Provider
      value={{
        members,
        payments,
        checkIns,
        plans,
        addMember,
        renewMember,
        updateMemberStatus,
        getMember,
        findMemberByContact,
        checkInMember,
        checkOutMember,
        isCheckedIn,
        getCurrentCheckIn,
        recordPayment,
        getCheckedInMembers,
        getTodayVisitCount,
        getActiveCount,
        getExpiredCount,
        getFrozenCount,
        getTodayRevenue,
        getMonthRevenue,
        getRevenueByDay,
        getAttendanceByDay,
      }}
    >
      {children}
    </GymContext.Provider>
  )
}

export function useGym() {
  const ctx = useContext(GymContext)
  if (!ctx) throw new Error("useGym must be used within GymProvider")
  return ctx
}
