// app/contexts/auth-context.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { AuthContextType } from "@/lib/types"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth } from "@/lib/firebase" // ajuste o path do seu firebase

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u)
            setLoading(false)
        })
        return () => unsub()
    }, [])

    async function signOutUser() {
        await signOut(auth)
        // opcional: redirecionar aqui com next/navigation -> useRouter().push("/")
    }

    const value: AuthContextType = { user, loading, signOutUser }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error("useAuthContext deve ser usado dentro de <AuthProvider>")
    return ctx
}
