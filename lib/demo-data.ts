import type { Member, Payment, CheckIn, MembershipPlan } from "./types"

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  { id: "monthly", name: "Monthly", price: 1500, durationDays: 30 },
  { id: "weekly", name: "Weekly", price: 500, durationDays: 7 },
  { id: "walkin", name: "Walk-in", price: 100, durationDays: 1 },
]

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split("T")[0]
}

function hoursAgo(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

let idCounter = 100

function uid(): string {
  idCounter++
  return `id-${idCounter}`
}

export const SEED_MEMBERS: Member[] = [
  {
    id: "m-1",
    name: "Marco Reyes",
    contactNumber: "09171234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(10),
    endDate: daysFromNow(20),
    status: "active",
    createdAt: daysAgo(40),
  },
  {
    id: "m-2",
    name: "Angela Torres",
    contactNumber: "09181234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(5),
    endDate: daysFromNow(25),
    status: "active",
    createdAt: daysAgo(65),
  },
  {
    id: "m-3",
    name: "Jared Santos",
    contactNumber: "09191234567",
    membershipPlanId: "weekly",
    startDate: daysAgo(3),
    endDate: daysFromNow(4),
    status: "active",
    createdAt: daysAgo(30),
  },
  {
    id: "m-4",
    name: "Bea Villanueva",
    contactNumber: "09201234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(35),
    endDate: daysAgo(5),
    status: "expired",
    createdAt: daysAgo(90),
  },
  {
    id: "m-5",
    name: "Carlos Mendoza",
    contactNumber: "09211234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(60),
    endDate: daysAgo(30),
    status: "expired",
    createdAt: daysAgo(120),
  },
  {
    id: "m-6",
    name: "Diana Cruz",
    contactNumber: "09221234567",
    membershipPlanId: "weekly",
    startDate: daysAgo(2),
    endDate: daysFromNow(5),
    status: "active",
    createdAt: daysAgo(50),
  },
  {
    id: "m-7",
    name: "Ethan Lim",
    contactNumber: "09231234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(20),
    endDate: daysFromNow(10),
    status: "active",
    createdAt: daysAgo(80),
  },
  {
    id: "m-8",
    name: "Fiona Garcia",
    contactNumber: "09241234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(15),
    endDate: daysFromNow(15),
    status: "frozen",
    createdAt: daysAgo(100),
  },
  {
    id: "m-9",
    name: "Gabriel Tan",
    contactNumber: "09251234567",
    membershipPlanId: "walkin",
    startDate: daysAgo(0),
    endDate: daysAgo(0),
    status: "active",
    createdAt: daysAgo(0),
  },
  {
    id: "m-10",
    name: "Hannah Ramos",
    contactNumber: "09261234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(28),
    endDate: daysFromNow(2),
    status: "active",
    createdAt: daysAgo(60),
  },
  {
    id: "m-11",
    name: "Ivan Flores",
    contactNumber: "09271234567",
    membershipPlanId: "monthly",
    startDate: daysAgo(45),
    endDate: daysAgo(15),
    status: "expired",
    createdAt: daysAgo(75),
  },
  {
    id: "m-12",
    name: "Julia Navarro",
    contactNumber: "09281234567",
    membershipPlanId: "weekly",
    startDate: daysAgo(1),
    endDate: daysFromNow(6),
    status: "active",
    createdAt: daysAgo(20),
  },
]

export const SEED_PAYMENTS: Payment[] = [
  { id: uid(), memberId: "m-1", amount: 1500, method: "gcash", description: "Monthly renewal", date: daysAgo(10) },
  { id: uid(), memberId: "m-2", amount: 1500, method: "cash", description: "Monthly renewal", date: daysAgo(5) },
  { id: uid(), memberId: "m-3", amount: 500, method: "cash", description: "Weekly membership", date: daysAgo(3) },
  { id: uid(), memberId: "m-4", amount: 1500, method: "gcash", description: "Monthly renewal", date: daysAgo(35) },
  { id: uid(), memberId: "m-5", amount: 1500, method: "cash", description: "Monthly renewal", date: daysAgo(60) },
  { id: uid(), memberId: "m-6", amount: 500, method: "gcash", description: "Weekly membership", date: daysAgo(2) },
  { id: uid(), memberId: "m-7", amount: 1500, method: "cash", description: "Monthly renewal", date: daysAgo(20) },
  { id: uid(), memberId: "m-8", amount: 1500, method: "gcash", description: "Monthly renewal", date: daysAgo(15) },
  { id: uid(), memberId: "m-9", amount: 100, method: "cash", description: "Walk-in", date: daysAgo(0) },
  { id: uid(), memberId: "m-10", amount: 1500, method: "cash", description: "Monthly renewal", date: daysAgo(28) },
  { id: uid(), memberId: "m-11", amount: 1500, method: "gcash", description: "Monthly renewal", date: daysAgo(45) },
  { id: uid(), memberId: "m-12", amount: 500, method: "cash", description: "Weekly membership", date: daysAgo(1) },
  // older payments for revenue history
  { id: uid(), memberId: "m-1", amount: 1500, method: "cash", description: "Monthly renewal", date: daysAgo(40) },
  { id: uid(), memberId: "m-2", amount: 1500, method: "gcash", description: "Monthly renewal", date: daysAgo(35) },
  { id: uid(), memberId: "m-7", amount: 1500, method: "cash", description: "Monthly renewal", date: daysAgo(50) },
  { id: uid(), memberId: "m-10", amount: 1500, method: "gcash", description: "Monthly renewal", date: daysAgo(58) },
]

// some members are currently checked in
const today = new Date().toISOString().split("T")[0]

export const SEED_CHECKINS: CheckIn[] = [
  // currently checked in
  { id: uid(), memberId: "m-1", checkInTime: hoursAgo(1), checkOutTime: null },
  { id: uid(), memberId: "m-3", checkInTime: hoursAgo(2), checkOutTime: null },
  { id: uid(), memberId: "m-6", checkInTime: hoursAgo(0.5), checkOutTime: null },
  { id: uid(), memberId: "m-9", checkInTime: hoursAgo(0.25), checkOutTime: null },
  // already checked out today
  { id: uid(), memberId: "m-2", checkInTime: hoursAgo(5), checkOutTime: hoursAgo(3.5) },
  { id: uid(), memberId: "m-7", checkInTime: hoursAgo(6), checkOutTime: hoursAgo(4.5) },
  { id: uid(), memberId: "m-12", checkInTime: hoursAgo(4), checkOutTime: hoursAgo(2.5) },
  // yesterday
  { id: uid(), memberId: "m-1", checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
  { id: uid(), memberId: "m-2", checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
  { id: uid(), memberId: "m-6", checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
  { id: uid(), memberId: "m-7", checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
  { id: uid(), memberId: "m-10", checkInTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), checkOutTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() },
]
