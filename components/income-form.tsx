// src/components/income-form.tsx
"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RecurrenceMeta } from "@/lib/types"

type RecurrenceMode = "none" | "installments" | "fixed"

type Props = {
  onSubmit: (data: { amount: number; description: string; date?: Date; recurrence?: RecurrenceMeta }) => Promise<void> | void
  onCancel?: () => void
}

export function IncomeForm({ onSubmit, onCancel }: Props) {
  const [amount, setAmount] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  // --- Recorrência ---
  const [recMode, setRecMode] = useState<RecurrenceMode>("none")
  const defaultStartMonth = useMemo(() => date.slice(0, 7), [date])
  const [startMonth, setStartMonth] = useState<string>(defaultStartMonth)
  const [installments, setInstallments] = useState<string>("2")

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
          const amt = Number(amount.replace(",", "."))
          const payload: { amount: number; description: string; date?: Date; recurrence?: RecurrenceMeta } = {
            amount: amt,
            description,
            date: new Date(date),
          }
          if (recMode !== "none") {
            payload.recurrence = {
              mode: recMode,
              startMonth: startMonth || defaultStartMonth,
              installments: recMode === "installments" ? Math.max(2, Number(installments || 2)) : undefined,
              active: true,
            }
          }
          await onSubmit(payload)
          setAmount("")
          setDescription("")
        } finally {
          setSaving(false)
        }
      }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label>Valor (R$)</Label>
        <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>

      <div className="grid gap-2">
        <Label>Descrição</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Freelance" />
      </div>

      <div className="grid gap-2">
        <Label>Data</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            if (recMode !== "none") setStartMonth(e.target.value.slice(0, 7))
          }}
          required
        />
      </div>

      {/* Recorrência */}
      <div className="grid gap-2">
        <Label>Recorrência</Label>
        <Select value={recMode} onValueChange={(v: RecurrenceMode) => setRecMode(v)}>
          <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="installments">Parcelada</SelectItem>
            <SelectItem value="fixed">Fixa (todo mês)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {recMode !== "none" && (
        <>
          <div className="grid gap-2">
            <Label>Mês inicial</Label>
            <Input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
          </div>

          {recMode === "installments" && (
            <div className="grid gap-2">
              <Label>Parcelas</Label>
              <Input
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

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button disabled={saving} type="submit">
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </form>
  )
}
