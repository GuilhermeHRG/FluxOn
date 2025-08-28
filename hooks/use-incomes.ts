"use client"

import { useEffect, useState } from "react"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, onSnapshot, serverTimestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

type RecurrenceMode = "none" | "installments" | "fixed"
type RecurrenceMeta = {
  mode: RecurrenceMode
  startMonth: string
  installments?: number
  active?: boolean
}

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

function expandForMonth(
  items: any[],
  targetMonth: string
) {
  const out: any[] = []
  for (const item of items) {
    const d = toDateObj(item.date)
    const baseMonth = item.recurrence?.startMonth ?? monthFromDate(d)
    const mode = item.recurrence?.mode ?? "none"
    const active = item.recurrence?.active ?? true
    if (!active) continue

    if (mode === "none" && monthFromDate(d) === targetMonth) {
      out.push({ ...item, _virtualId: item.id, _virtualDate: d })
    }

    if (mode === "installments") {
      const n = Math.max(1, item.recurrence?.installments ?? 1)
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

    if (mode === "fixed" && compareMonth(targetMonth, baseMonth) >= 0) {
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
  return out
}

export function useIncomes() {
  const { user } = useAuth()
  const [incomes, setIncomes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setIncomes([]); setLoading(false); return }
    const q = query(collection(db, "incomes"), where("userId", "==", user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setIncomes(list)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  async function addIncome(payload: any & { recurrence?: RecurrenceMeta }) {
    if (!user) throw new Error("Not authenticated")
    await addDoc(collection(db, "incomes"), {
      ...payload,
      userId: user.uid,
      recurrence: payload.recurrence ? {
        ...payload.recurrence,
        active: payload.recurrence.active ?? true,
        startMonth: payload.recurrence.startMonth ?? monthFromDate(payload.date),
      } : undefined,
      createdAt: serverTimestamp(),
    })
  }

  async function updateIncome(id: string, payload: Partial<any>) {
    await updateDoc(doc(db, "incomes", id), payload as any)
  }

  async function deleteIncome(id: string) {
    await deleteDoc(doc(db, "incomes", id))
  }

  function getIncomesByMonth(month: string) {
    return expandForMonth(incomes, month)
  }

  return { incomes, loading, addIncome, updateIncome, deleteIncome, getIncomesByMonth }
}
