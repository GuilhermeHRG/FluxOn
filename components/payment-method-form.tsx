"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { usePaymentMethods, type PaymentMethod } from "@/hooks/use-payment-methods"
import { CreditCard, Banknote, Smartphone, Building2, Wallet, X } from "lucide-react"

interface PaymentMethodFormProps {
  method?: PaymentMethod | null
  onClose: () => void
  onSuccess: () => void
}

const paymentTypeOptions = [
  { value: "credit", label: "Cartão de Crédito", icon: CreditCard },
  { value: "debit", label: "Cartão de Débito", icon: CreditCard },
  { value: "cash", label: "Dinheiro", icon: Banknote },
  { value: "pix", label: "PIX", icon: Smartphone },
  { value: "bank_transfer", label: "Transferência", icon: Building2 },
  { value: "other", label: "Outro", icon: Wallet },
]

const colorOptions = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f59e0b", label: "Amarelo" },
  { value: "#ef4444", label: "Vermelho" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#84cc16", label: "Lima" },
  { value: "#f97316", label: "Laranja" },
]

export function PaymentMethodForm({ method, onClose, onSuccess }: PaymentMethodFormProps) {
  const { addPaymentMethod, updatePaymentMethod } = usePaymentMethods()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: method?.name || "",
    type: method?.type || "credit",
    color: method?.color || "#3b82f6",
    isDefault: method?.isDefault || false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setLoading(true)
    try {
      const selectedType = paymentTypeOptions.find((opt) => opt.value === formData.type)
      const methodData = {
        name: formData.name.trim(),
        type: formData.type as PaymentMethod["type"],
        icon: selectedType?.icon.name || "CreditCard",
        color: formData.color,
        isDefault: formData.isDefault,
      }

      if (method) {
        await updatePaymentMethod(method.id, methodData)
      } else {
        await addPaymentMethod(methodData)
      }

      onSuccess()
    } catch (error) {
      console.error("Error saving payment method:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between ">
          <div>
            <CardTitle>{method ? "Editar" : "Nova"} Forma de Pagamento</CardTitle>
            <CardDescription>
              {method ? "Atualize os dados da forma de pagamento" : "Adicione uma nova forma de pagamento"}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                autoFocus
                placeholder="Ex: Cartão Nubank, PIX, Dinheiro..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, 
              //@ts-ignore
                type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? "border-foreground" : "border-border"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
            />
            <Label htmlFor="isDefault">Definir como padrão</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !formData.name.trim()} className="flex-1">
              {loading ? "Salvando..." : method ? "Atualizar" : "Adicionar"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
