"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Coffee,
  Car,
  Home,
  Gamepad2,
  Heart,
  ShoppingCart,
  Plane,
  Book,
  Dumbbell,
  Phone,
  Shirt,
  Gift,
} from "lucide-react"
import type { Category } from "@/lib/types"

interface CategoryFormProps {
  category?: Category | null
  onSubmit: (data: Omit<Category, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
}

const iconOptions = [
  { value: "Coffee", label: "Alimentação", icon: Coffee },
  { value: "Car", label: "Transporte", icon: Car },
  { value: "Home", label: "Moradia", icon: Home },
  { value: "Gamepad2", label: "Entretenimento", icon: Gamepad2 },
  { value: "Heart", label: "Saúde", icon: Heart },
  { value: "ShoppingCart", label: "Compras", icon: ShoppingCart },
  { value: "Plane", label: "Viagem", icon: Plane },
  { value: "Book", label: "Educação", icon: Book },
  { value: "Dumbbell", label: "Academia", icon: Dumbbell },
  { value: "Phone", label: "Telefone", icon: Phone },
  { value: "Shirt", label: "Roupas", icon: Shirt },
  { value: "Gift", label: "Presentes", icon: Gift },
]

const colorOptions = [
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-green-500", label: "Verde" },
  { value: "bg-red-500", label: "Vermelho" },
  { value: "bg-yellow-500", label: "Amarelo" },
  { value: "bg-purple-500", label: "Roxo" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-orange-500", label: "Laranja" },
  { value: "bg-teal-500", label: "Azul-verde" },
  { value: "bg-indigo-500", label: "Índigo" },
  { value: "bg-gray-500", label: "Cinza" },
]

export function CategoryForm({ category, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [icon, setIcon] = useState(category?.icon || "")
  const [color, setColor] = useState(category?.color || "")
  const [budget, setBudget] = useState(category?.budget?.toString() || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && icon && color) {
      const categoryData: Omit<Category, "id" | "createdAt" | "updatedAt"> = {
        name: name.trim(),
        icon,
        color,
      }

      // Only include budget if it has a valid value
      if (budget && Number.parseFloat(budget) > 0) {
        categoryData.budget = Number.parseFloat(budget)
      }

      onSubmit(categoryData)
    }
  }

  const selectedIcon = iconOptions.find((opt) => opt.value === icon)
  const IconComponent = selectedIcon?.icon

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Categoria</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Alimentação, Transporte..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget">Orçamento Mensal (Opcional)</Label>
          <Input
            id="budget"
            type="number"
            step="0.01"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Ex: 500.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Ícone</Label>
          <Select value={icon} onValueChange={setIcon} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um ícone">
                {IconComponent && (
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    {selectedIcon.label}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((option) => {
                const Icon = option.icon
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Cor</Label>
          <Select value={color} onValueChange={setColor} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma cor">
                {color && (
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${color}`} />
                    {colorOptions.find((opt) => opt.value === color)?.label}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {colorOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${option.value}`} />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="space-y-2 md:col-span-2">
          <Label>Prévia</Label>
          <div className="p-4 border border-border rounded-lg bg-card">
            {name && icon && color ? (
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${color} text-white`}>
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {budget
                      ? `Orçamento: R$ ${Number.parseFloat(budget).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                      : "0 transações"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Preencha os campos para ver a prévia</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={!name.trim() || !icon || !color}>
          {category ? "Salvar Alterações" : "Criar Categoria"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
