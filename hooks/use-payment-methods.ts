"use client"

import { useState, useEffect } from "react"
import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  query, where, onSnapshot, serverTimestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"

export interface PaymentMethod {
  id: string
  name: string
  type: "credit" | "debit" | "cash" | "pix" | "bank_transfer" | "other"
  icon: string
  color: string
  isDefault: boolean
  createdAt: Date
  userId: string
}

function toDateSafe(v: any): Date {
  if (!v) return new Date(0)
  if (v instanceof Date) return v
  if (typeof v?.toDate === "function") return v.toDate()          // Firestore Timestamp
  if (typeof v === "string" || typeof v === "number") return new Date(v)
  return new Date(0)
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setPaymentMethods([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "payment_methods"), where("userId", "==", user.uid))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data() as any
        return {
          id: d.id,
          ...data,
          createdAt: toDateSafe(data.createdAt),
        } as PaymentMethod
      })
      // Ordena do mais recente para o mais antigo, com guardas:
      list.sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0))
      setPaymentMethods(list)
      setLoading(false)
    })

    return () => unsub()
  }, [user])

  const addPaymentMethod = async (payload: Omit<PaymentMethod, "id" | "createdAt" | "userId">) => {
    if (!user) throw new Error("User not authenticated")
    await addDoc(collection(db, "payment_methods"), {
      ...payload,
      userId: user.uid,
      createdAt: serverTimestamp(),     // <-- grava Timestamp do servidor
    })
  }

  const updatePaymentMethod = async (id: string, payload: Partial<PaymentMethod>) => {
    await updateDoc(doc(db, "payment_methods", id), {
      ...payload,
      // opcional: não atualize createdAt aqui; use um updatedAt separado se quiser
    })
  }

  const deletePaymentMethod = async (id: string) => {
    await deleteDoc(doc(db, "payment_methods", id))
  }

  const getDefaultPaymentMethod = () =>
    paymentMethods.find((pm) => pm.isDefault) || paymentMethods[0] || null

  return {
    paymentMethods,
    loading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getDefaultPaymentMethod,
  }
}
