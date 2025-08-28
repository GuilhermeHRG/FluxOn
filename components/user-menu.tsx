"use client"

import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UserAvatar } from "@/components/user-avatar"

export function UserMenu() {
  const { user, signOutUser } = useAuth()
  if (!user) return null

  const displayName = user.displayName || user.email || "Usuário"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button aria-label="Abrir menu do usuário" className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30">
          <UserAvatar photoURL={user.photoURL} displayName={displayName} size={36} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/account"><DropdownMenuItem className="cursor-pointer hover:bg-blue-500 hover:text-white">Meu perfil</DropdownMenuItem></Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={signOutUser}>
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
