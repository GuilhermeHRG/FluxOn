"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type PaymentMethod, usePaymentMethods } from "@/hooks/use-payment-methods"
import { MoreHorizontal, Edit, Trash2, Star, CreditCard, Banknote, Smartphone, Building2, Wallet } from "lucide-react"

interface PaymentMethodCardProps {
  method: PaymentMethod
  onEdit: () => void
}

const iconMap = {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Wallet,
}

export function PaymentMethodCard({ method, onEdit }: PaymentMethodCardProps) {
  const { deletePaymentMethod, updatePaymentMethod } = usePaymentMethods()

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta forma de pagamento?")) {
      await deletePaymentMethod(method.id)
    }
  }

  const handleToggleDefault = async () => {
    await updatePaymentMethod(method.id, { isDefault: !method.isDefault })
  }

  const IconComponent = iconMap[method.icon as keyof typeof iconMap] || CreditCard

  return (
    <Card className="relative group hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: method.color }}
          >
            <IconComponent className="h-6 w-6" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleDefault}>
                <Star className={`h-4 w-4 mr-2 ${method.isDefault ? "fill-current" : ""}`} />
                {method.isDefault ? "Remover padrão" : "Definir como padrão"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{method.name}</h3>
            {method.isDefault && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {method.type === "credit" && "Cartão de Crédito"}
            {method.type === "debit" && "Cartão de Débito"}
            {method.type === "cash" && "Dinheiro"}
            {method.type === "pix" && "PIX"}
            {method.type === "bank_transfer" && "Transferência"}
            {method.type === "other" && "Outro"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
