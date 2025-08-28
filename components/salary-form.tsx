"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { Salary } from "@/lib/types"

interface SalaryFormProps {
  salary?: Salary | null
  onSubmit: (amount: number) => void
  onCancel: () => void
}

export function SalaryForm({ salary, onSubmit, onCancel }: SalaryFormProps) {
  const [amount, setAmount] = useState(salary?.amount?.toString() || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = Number.parseFloat(amount.replace(/[^\d,]/g, "").replace(",", "."))
    if (numericAmount > 0) {
      onSubmit(numericAmount)
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    if (!numericValue) return ""

    const number = Number.parseInt(numericValue) / 100
    return number.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  const numericAmount = Number.parseFloat(amount.replace(/[^\d,]/g, "").replace(",", "."))
  const isValid = numericAmount > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Salário Mensal</Label>
        <Input id="amount" value={amount} onChange={handleAmountChange} placeholder="R$ 0,00" required />
        <p className="text-xs text-muted-foreground">Digite o valor do seu salário líquido mensal</p>
      </div>

      {/* Preview */}
      {isValid && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4">Prévia das Metas Sugeridas</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Necessidades (50%)</span>
                <span className="font-medium">
                  R$ {(numericAmount * 0.5).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Desejos (30%)</span>
                <span className="font-medium">
                  R$ {(numericAmount * 0.3).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Poupança (20%)</span>
                <span className="font-medium">
                  R$ {(numericAmount * 0.2).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={!isValid}>
          {salary ? "Atualizar Salário" : "Salvar Salário"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
