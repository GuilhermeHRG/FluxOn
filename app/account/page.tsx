"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { auth, db } from "@/lib/firebase"
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
} from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, LogOut, KeyRound, Mail, Loader2, Upload } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"

export default function AccountPage() {
    const { user, loading, signOutUser } = useAuth()

    // form de troca de senha direta
    const [currentPass, setCurrentPass] = useState("")
    const [newPass, setNewPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")
    const [saving, setSaving] = useState(false)

    // avatar (novo)
    const [avatarUploading, setAvatarUploading] = useState(false)
    const [localPhotoURL, setLocalPhotoURL] = useState<string | null>(null)

    const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm text-gray-800">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Carregando…
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Acesso necessário</CardTitle>
                        <CardDescription>Faça login para acessar seu painel de usuário.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button className="w-full">Ir para a página inicial</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const providerId = user.providerData?.[0]?.providerId || "password"
    const isEmailPassword = providerId.includes("password")

    async function handleChangePasswordDirect(e: React.FormEvent) {
        e.preventDefault()
        setMsg(null)
        if (!isEmailPassword) {
            setMsg({ type: "error", text: "Sua conta não usa senha (login social). Utilize 'Enviar link por e-mail'." })
            return
        }
        if (newPass.length < 6) {
            setMsg({ type: "error", text: "A nova senha deve ter pelo menos 6 caracteres." })
            return
        }
        if (newPass !== confirmPass) {
            setMsg({ type: "error", text: "A confirmação precisa ser igual à nova senha." })
            return
        }
        try {
            setSaving(true)
            // @ts-ignore (email pode ser null no tipo, mas você já garante user logado)
            const cred = EmailAuthProvider.credential(user.email as string, currentPass)
            await reauthenticateWithCredential(auth.currentUser!, cred)
            await updatePassword(auth.currentUser!, newPass)
            setMsg({ type: "success", text: "Senha alterada com sucesso!" })
            setCurrentPass("")
            setNewPass("")
            setConfirmPass("")
        } catch (err: any) {
            let text = "Não foi possível alterar a senha."
            if (err?.code === "auth/wrong-password") text = "Senha atual incorreta."
            if (err?.code === "auth/too-many-requests") text = "Muitas tentativas. Tente novamente mais tarde."
            setMsg({ type: "error", text })
        } finally {
            setSaving(false)
        }
    }

    async function handleSendResetLink() {
        setMsg(null)
        try {
            // @ts-ignore
            await sendPasswordResetEmail(auth, user.email as string)
            setMsg({ type: "success", text: "Enviamos um e-mail com o link para redefinir sua senha." })
        } catch (err: any) {
            setMsg({ type: "error", text: "Não foi possível enviar o e-mail de redefinição." })
        }
    }

    // ⬇️ NOVO: trocar foto sem Storage, salvando Base64 no Firestore e no Auth
    async function handleAvatarChange(file: File) {
        if (!file || !auth.currentUser) return

        // tamanho máximo recomendado para Base64 no Firestore (ex: 200 KB)
        const MAX_BYTES = 200 * 1024
        if (file.size > MAX_BYTES) {
            setMsg({ type: "error", text: "Imagem muito grande. Tente uma foto menor (até ~200KB)." })
            return
        }

        const reader = new FileReader()
        reader.onloadend = async () => {
            const base64 = reader.result as string
            try {
                setAvatarUploading(true)
                setMsg(null)

                // 1) salva em users/{uid} no Firestore
                const userRef = doc(db, "users", auth.currentUser!.uid)
                await setDoc(userRef, { photoURL: base64 }, { merge: true })

                // 2) atualiza o Auth profile (para outros lugares que leem user.photoURL)
                await updateProfile(auth.currentUser!, { photoURL: base64 })

                // 3) re-render imediato nesta página
                setLocalPhotoURL(base64)
                setMsg({ type: "success", text: "Foto de perfil atualizada!" })
            } catch (e) {
                console.error(e)
                setMsg({ type: "error", text: "Erro ao atualizar a foto." })
            } finally {
                setAvatarUploading(false)
            }
        }
        reader.readAsDataURL(file) // converte em Data URL (Base64)
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-[#202224] text-gray-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between max-sm:justify-around">
                    <div className="flex items-center gap-2">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Voltar
                            </Button>
                        </Link>
                        <h1 className="text-xl font-semibold">Meu perfil</h1>
                    </div>
                    <Button variant="destructive" className="gap-2" onClick={signOutUser}>
                        <LogOut className="h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Perfil */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Perfil</CardTitle>
                            <CardDescription>Informações básicas da sua conta</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="flex items-center gap-4">
                                <UserAvatar
                                    photoURL={localPhotoURL ?? user.photoURL}
                                    displayName={user.displayName || user.email}
                                    size={72}
                                />
                                <div>
                                    <p className="font-semibold">{user.displayName || "Usuário"}</p>
                                    <p className="text-sm text-gray-800">{user.email}</p>
                                </div>
                            </div>

                            

                            <div className="grid grid-cols-2 gap-3">
                                <div className="text-sm col-span-2">
                                    <p className="text-gray-800">UID</p>
                                    <p className="font-mono text-xs break-all">{user.uid}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Troca de senha */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Segurança</CardTitle>
                            <CardDescription>Altere sua senha</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            
                            

                            {/* Método 2: Troca direta (somente email/senha) */}
                            <div className="p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-4">
                                    <KeyRound className="h-5 w-5" />
                                    <p className="font-medium">Alterar senha agora</p>
                                </div>

                                {!isEmailPassword ? (
                                    <p className="text-sm text-gray-800">
                                        Sua conta foi criada via login social (<span className="font-medium">{providerId}</span>).
                                        Use a opção “Redefinir por e-mail” acima para definir uma senha.
                                    </p>
                                ) : (
                                    <form onSubmit={handleChangePasswordDirect} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Senha atual</Label>
                                            <Input
                                                type="password"
                                                value={currentPass}
                                                onChange={(e) => setCurrentPass(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Nova senha</Label>
                                            <Input
                                                type="password"
                                                value={newPass}
                                                onChange={(e) => setNewPass(e.target.value)}
                                                required
                                                placeholder="Mínimo de 6 caracteres"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Confirmar nova senha</Label>
                                            <Input
                                                type="password"
                                                value={confirmPass}
                                                onChange={(e) => setConfirmPass(e.target.value)}
                                                required
                                                placeholder="Repita a nova senha"
                                            />
                                        </div>
                                        <div className="md:col-span-3 flex justify-end">
                                            <Button type="submit" disabled={saving} className="min-w-32">
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando…
                                                    </>
                                                ) : (
                                                    "Salvar"
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {msg && (
                                <div
                                    className={`text-sm rounded-md p-3 border ${msg.type === "success"
                                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                            : "bg-red-50 border-red-200 text-red-800"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
