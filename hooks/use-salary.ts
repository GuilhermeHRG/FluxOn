"use client"

import { useEffect, useMemo, useState } from "react"
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

type Currency =
  | "BRL" | "USD" | "EUR" | "MXN" | "CLP" | "ARS" | "PYG" | "COP" | "BOB" | "UYU" | "PEN"

type SettingsSalaryDoc = {
  salary?: number
  currency?: Currency
  updatedAt?: any
}

type CurrentSalary = {
  id?: string            // compat opcional
  amount: number
  currency: Currency
  month?: string         // compat opcional (exibe mês atual só pra UI)
}

type SalaryListItem = {
  id?: string
  amount: number
  currency: Currency
  month: string
  createdAt?: string | number | Date
}

function toNumberSafe(v: any): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function toCurrencySafe(v: any): Currency {
  const c = String(v || "BRL").toUpperCase() as Currency
  const allowed: Currency[] = ["BRL","USD","EUR","MXN","CLP","ARS","PYG","COP","BOB","UYU","PEN"]
  return allowed.includes(c) ? c : "BRL"
}

/**
 * Hook: salário GLOBAL salvo em `settings/{userId}`.
 * Exponho a mesma interface que sua página usa:
 * - salaries: array de 1 item (sintético) p/ manter compatibilidade
 * - currentSalary: objeto com amount/currency
 * - addSalary(amount), updateSalary(amount, currency?)
 */
export function useSalary() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [docData, setDocData] = useState<SettingsSalaryDoc | null>(null)

  useEffect(() => {
    if (!user) {
      setDocData(null)
      setLoading(false)
      return
    }
    const ref = doc(db, "settings", user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      const data = (snap.data() as SettingsSalaryDoc) || null
      setDocData(data)
      setLoading(false)
    })
    return () => unsub()
  }, [user])

  const currentSalary: CurrentSalary | null = useMemo(() => {
    if (!docData) return null
    return {
      amount: toNumberSafe(docData.salary),
      currency: toCurrencySafe(docData.currency),
      month: new Date().toISOString().slice(0, 7),
    }
  }, [docData])

  // Compat: exponho "salaries" como lista com 1 item
  const salaries: SalaryListItem[] = useMemo(() => {
    if (!currentSalary) return []
    return [{
      amount: currentSalary.amount,
      currency: currentSalary.currency,
      month: currentSalary.month || new Date().toISOString().slice(0, 7),
      createdAt: Date.now(),
    }]
  }, [currentSalary])

  async function addSalary(amount: number, currency: Currency = "BRL") {
    if (!user) throw new Error("Not authenticated")
    const ref = doc(db, "settings", user.uid)
    await setDoc(ref, {
      salary: toNumberSafe(amount),
      currency: toCurrencySafe(currency),
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }

  async function updateSalary(amount: number, currency?: Currency) {
    if (!user) throw new Error("Not authenticated")
    const ref = doc(db, "settings", user.uid)
    const payload: Partial<SettingsSalaryDoc> = {
      salary: toNumberSafe(amount),
      updatedAt: serverTimestamp(),
    }
    if (currency) payload.currency = toCurrencySafe(currency)
    await updateDoc(ref, payload as any)
  }

  return {
    salaries,
    currentSalary,
    loading,
    addSalary,
    updateSalary,
  }
}

