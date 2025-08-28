"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Expense, Category, RecurrenceMeta } from "@/lib/types"
import type { PaymentMethod } from "@/hooks/use-payment-methods"
import Link from "next/link"

type RecurrenceMode = "none" | "installments" | "fixed"

interface ExpenseFormProps {
  expense?: Expense | null
  categories: Category[]
  paymentMethods: PaymentMethod[]
  onSubmit: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => void
  onCancel: () => void
  loading?: boolean
}

export function ExpenseForm({ expense, categories, paymentMethods, onSubmit, onCancel, loading }: ExpenseFormProps) {
  const [description, setDescription] = useState(expense?.description || "")
  const [amount, setAmount] = useState(expense?.amount?.toString() || "")
  const [categoryId, setCategoryId] = useState(expense?.categoryId || "")
  const [date, setDate] = useState(
    expense?.date ? expense.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  )
  const [paymentMethodId, setPaymentMethodId] = useState(
    expense?.paymentMethodId || paymentMethods.find((pm) => pm.isDefault)?.id || paymentMethods[0]?.id || "",
  )

  // ---- Recorrência ----
  const [recMode, setRecMode] = useState<RecurrenceMode>("none")
  const [installments, setInstallments] = useState<string>("2") // padrão 2x para parceladas
  // startMonth padrão = mês da data escolhida (YYYY-MM)
  const defaultStartMonth = useMemo(() => date.slice(0, 7), [date])
  const [startMonth, setStartMonth] = useState<string>(defaultStartMonth)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numericAmount = Number.parseFloat(amount.replace(/[^\d,]/g, "").replace(",", "."))
    const selectedCategory = categories.find((cat) => cat.id === categoryId)
    const selectedPaymentMethod = paymentMethods.find((pm) => pm.id === paymentMethodId)

    if (
      description.trim() &&
      numericAmount > 0 &&
      categoryId &&
      date &&
      paymentMethodId &&
      selectedCategory &&
      selectedPaymentMethod
    ) {
      // Monta a recorrência conforme o modo
      let recurrence: RecurrenceMeta | undefined = undefined
      if (recMode !== "none") {
        recurrence = {
          mode: recMode,
          startMonth: startMonth || defaultStartMonth,
          installments: recMode === "installments" ? Math.max(2, Number(installments || 2)) : undefined,
          active: true,
        }
      }

      onSubmit({
        description: description.trim(),
        amount: numericAmount,
        categoryId,
        categoryName: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        categoryColor: selectedCategory.color,
        date: new Date(date),
        paymentMethodId,
        paymentMethodName: selectedPaymentMethod.name,
        paymentMethodType: selectedPaymentMethod.type,
        // NOVO: envia para o hook gravar no Firestore
        recurrence,
      } as any) // o seu tipo Expense já tem RecurrenceMeta; o "as any" evita ruído se o tipo estiver parcial
    }
  }

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, "")
    if (!numericValue) return ""
    const number = Number.parseInt(numericValue) / 100
    return number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  const numericAmount = Number.parseFloat(amount.replace(/[^\d,]/g, "").replace(",", "."))
  const selectedCategory = categories.find((cat) => cat.id === categoryId)
  const selectedPaymentMethod = paymentMethods.find((pm) => pm.id === paymentMethodId)
  const isValid = description.trim() && numericAmount > 0 && categoryId && date && paymentMethodId

  return (
    <form onSubmit={handleSubmit} className="space-y-6 ">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Supermercado, Uber, Internet…"
            required
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input id="amount" value={amount} onChange={handleAmountChange} placeholder="R$ 0,00" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value)
                // atualiza startMonth padrão quando a data muda
                if (recMode !== "none") setStartMonth(e.target.value.slice(0, 7))
              }}
              required
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select value={categoryId} onValueChange={setCategoryId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria">
                {selectedCategory && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${selectedCategory.color}`} />
                    {selectedCategory.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`} />
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categories.length === 0 && (
            <p className="text-xs text-gray-800">
              Você precisa criar pelo menos uma categoria antes de registrar despesas.
            </p>
          )}
        </div>

        {/* Forma de pagamento */}
        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
          <Select value={paymentMethodId} onValueChange={setPaymentMethodId} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a forma de pagamento">
                {selectedPaymentMethod && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedPaymentMethod.color }} />
                    {selectedPaymentMethod.name}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: method.color }} />
                    {method.name}
                    {method.isDefault && <span className="text-xs text-gray-800">(Padrão)</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {paymentMethods.length === 0 && (
            <p className="text-xs text-gray-800">
              Você precisa criar pelo menos uma forma de pagamento antes de registrar despesas.
            </p>
          )}
        </div>

        {/* --- Recorrência --- */}
        <div className="space-y-2">
          <Label>Recorrência</Label>
          <Select value={recMode} onValueChange={(v: RecurrenceMode) => setRecMode(v)}>
            <SelectTrigger>
              <SelectValue placeholder="Nenhuma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>
              <SelectItem value="installments">Parcelada</SelectItem>
              <SelectItem value="fixed">Fixa (todo mês)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {recMode !== "none" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="startMonth">Mês inicial</Label>
              <Input
                id="startMonth"
                type="month"
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
              />
            </div>

            {recMode === "installments" && (
              <div className="space-y-2">
                <Label htmlFor="installments">Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min={2}
                  step={1}
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Preview */}
      {isValid && selectedCategory && selectedPaymentMethod && (
        <div className="p-4 border border-gray-300 bg-white text-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">Prévia da Despesa</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${selectedCategory.color}`} />
              <div>
                <p className="font-medium">
                  {description}
                  {recMode === "installments" && ` (${Math.max(2, Number(installments || 2))}x)`}
                  {recMode === "fixed" && " (Fixa)"}
                </p>
                <p className="text-sm ">
                  {selectedCategory.name} • {new Date(date).toLocaleDateString("pt-BR")} • {selectedPaymentMethod.name}
                </p>
              </div>
            </div>
            <p className="font-bold text-destructive">
              -R$ {numericAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={!isValid || categories.length === 0 || paymentMethods.length === 0}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {expense ? "Salvando..." : "Registrando..."}
            </>
          ) : expense ? (
            "Salvar Alterações"
          ) : (
            "Registrar Despesa"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        {categories.length === 0 && (
          <Link href="/categories">
            <Button type="button" variant="ghost" className="text-primary">
              Criar Categorias
            </Button>
          </Link>
        )}
        {paymentMethods.length === 0 && (
          <Link href="/payment-methods">
            <Button type="button" variant="ghost" className="text-primary">
              Criar Formas de Pagamento
            </Button>
          </Link>
        )}
      </div>
    </form>
  )
}
