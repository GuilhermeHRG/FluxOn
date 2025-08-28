"use client"

import { useState, useEffect } from "react"
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./use-auth"
import type { Category } from "@/lib/types"

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setCategories([])
      setLoading(false)
      return
    }

    const q = query(collection(db, "categories"), where("userId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Category[]

      categoriesData.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return b.createdAt.getTime() - a.createdAt.getTime()
      })

      setCategories(categoriesData)
      setLoading(false)
    })

    return unsubscribe
  }, [user])

  const addCategory = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("User not authenticated")

    const now = new Date()
    await addDoc(collection(db, "categories"), {
      ...categoryData,
      userId: user.uid,
      createdAt: now,
      updatedAt: now,
    })
  }

  const updateCategory = async (id: string, categoryData: Partial<Category>) => {
    if (!user) throw new Error("User not authenticated")

    const categoryRef = doc(db, "categories", id)
    await updateDoc(categoryRef, {
      ...categoryData,
      updatedAt: new Date(),
    })
  }

  const deleteCategory = async (id: string) => {
    if (!user) throw new Error("User not authenticated")

    await deleteDoc(doc(db, "categories", id))
  }

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
  }
}
