"use client"

import { useState, useEffect } from "react"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, onSnapshot, Timestamp, serverTimestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./use-auth"
import type { Expense } from "@/lib/types"

// Tipos de recorrência
type RecurrenceMode = "none" | "installments" | "fixed"
type RecurrenceMeta = {
  mode: RecurrenceMode
  startMonth: string
  installments?: number
  active?: boolean
}

// utils de mês
function monthFromDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}
function addMonths(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number)
  const base = new Date(y, m - 1 + delta, 1)
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`
}
function compareMonth(a: string, b: string) {
  const [ay, am] = a.split("-").map(Number)
  const [by, bm] = b.split("-").map(Number)
  if (ay !== by) return ay < by ? -1 : 1
  if (am !== bm) return am < bm ? -1 : 1
  return 0
}
function diffMonths(a: string, b: string) {
  const [ay, am] = a.split("-").map(Number)
  const [by, bm] = b.split("-").map(Number)
  return (by - ay) * 12 + (bm - am)
}
function toDateObj(v: any): Date {
  if (!v) return new Date()
  if (v instanceof Date) return v
  if (typeof v?.toDate === "function") return v.toDate()
  if (typeof v === "string" || typeof v === "number") return new Date(v)
  return new Date()
}

// Expande uma despesa para o mês alvo
function expandForMonth(
  items: (Expense & { recurrence?: RecurrenceMeta })[],
  targetMonth: string
) {
  const out: (Expense & { _virtualId: string; _virtualDate: Date })[] = []

  for (const item of items) {
    const d = toDateObj(item.date)
    const baseMonth = item.recurrence?.startMonth ?? monthFromDate(d)
    const mode = item.recurrence?.mode ?? "1"
    const active = item.recurrence?.active ?? true
    if (!active) continue

    if (mode === "1") {
      if (monthFromDate(d) === targetMonth) {
        out.push({ ...item, _virtualId: item.id, _virtualDate: d })
      }
    }

    if (mode === "installments") {
      const rawN = item.recurrence?.installments
      const n = Math.max(1, Number.isFinite(rawN as number) ? (rawN as number) : 1)
      for (let i = 0; i < n; i++) {
        const m = addMonths(baseMonth, i)
        if (m === targetMonth) {
          const vd = new Date(d)
          vd.setMonth(vd.getMonth() + i)
          out.push({
            ...item,
            description: `${item.description} (${i + 1}/${n})`,
            _virtualId: `${item.id}#${i + 1}/${n}`,
            _virtualDate: vd,
          })
        }
      }
    }

    if (mode === "fixed") {
      if (compareMonth(targetMonth, baseMonth) >= 0) {
        const monthsDiff = diffMonths(baseMonth, targetMonth)
        const vd = new Date(d)
        vd.setMonth(vd.getMonth() + monthsDiff)
        out.push({
          ...item,
          _virtualId: `${item.id}#fixed@${targetMonth}`,
          _virtualDate: vd,
        })
      }
    }
  }
  return out
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) { setExpenses([]); setLoading(false); return }
    const q = query(collection(db, "expenses"), where("userId", "==", user.uid))
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().date?.toDate?.() ?? docSnap.data().date,
      })) as Expense[]
      setExpenses(data)
      setLoading(false)
    })
    return unsub
  }, [user])

  async function addExpense(
    payload: Omit<Expense, "id" | "createdAt" | "updatedAt"> & { recurrence?: RecurrenceMeta }
  ) {
    if (!user) throw new Error("Not authenticated")

    // 🔒 Sanitize de recorrência: remove 'installments' quando não for parcelada
    const r = payload.recurrence
    const recurrence =
      r
        ? {
            mode: r.mode,
            startMonth: r.startMonth ?? monthFromDate(payload.date),
            active: r.active ?? true,
            ...(r.mode === "installments" && typeof r.installments === "number"
              ? { installments: r.installments }
              : {}), // <- não inclui installments quando não for parcelada
          }
        : undefined

    await addDoc(collection(db, "expenses"), {
      ...payload,
      userId: user.uid,
      date: Timestamp.fromDate(payload.date),
      ...(recurrence ? { recurrence } : {}), // <- não envia campo undefined
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  async function updateExpense(id: string, payload: Partial<Expense & { recurrence?: RecurrenceMeta }>) {
    // 🔒 Sanitize também no update (caso edição mude o modo)
    let patch: any = { ...payload, updatedAt: serverTimestamp() }
    if (payload.recurrence) {
      const r = payload.recurrence
      patch.recurrence = {
        mode: r.mode,
        startMonth: r.startMonth ?? (payload.date instanceof Date ? monthFromDate(payload.date) : undefined),
        active: r.active ?? true,
        ...(r.mode === "installments" && typeof r.installments === "number"
          ? { installments: r.installments }
          : {}),
      }
      // remove startMonth se ficou undefined por não termos date no patch
      if (patch.recurrence.startMonth === undefined) delete patch.recurrence.startMonth
    }
    await updateDoc(doc(db, "expenses", id), patch)
  }

  async function deleteExpense(id: string) {
    await deleteDoc(doc(db, "expenses", id))
  }

  function getExpensesByMonth(month: string) {
    return expandForMonth(expenses as any, month)
  }

  return { expenses, loading, addExpense, updateExpense, deleteExpense, getExpensesByMonth }
}
