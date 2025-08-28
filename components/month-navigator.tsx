"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

interface MonthNavigatorProps {
  currentMonth: string // "YYYY-MM"
  onMonthChange: (month: string) => void
}

export function MonthNavigator({ currentMonth, onMonthChange }: MonthNavigatorProps) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // 🔄 mantém estado em sync caso o parent troque currentMonth
  useEffect(() => {
    setSelectedMonth(currentMonth)
  }, [currentMonth])

  // ✅ mês atual LOCAL (evita bug de UTC)
  const currentLocalYYYYMM = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    return `${y}-${m}`
  }, [])

  const isCurrentMonth = selectedMonth === currentLocalYYYYMM

  const formatMonthDisplay = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const [year, month] = selectedMonth.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, 1)

    date.setMonth(date.getMonth() + (direction === "prev" ? -1 : 1))

    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    setSelectedMonth(newMonth)
    onMonthChange(newMonth)
  }

  const goToCurrentMonth = () => {
    setSelectedMonth(currentLocalYYYYMM)
    onMonthChange(currentLocalYYYYMM)
  }

  // 🧭 pulo rápido de mês — aparece no mobile (md:hidden)
  const onPickMobile = (value: string) => {
    if (!value) return
    setSelectedMonth(value)
    onMonthChange(value)
  }

  return (
    <div
      className="
        bg-gray-200/40 border  rounded-lg p-3 md:p-4 mb-6 capitalize
        flex flex-col gap-3
        md:flex-row md:items-center md:justify-between
      "
    >
      {/* Linha 1 (mobile): navegação */}
      <div className="flex gap-2 w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("prev")}
          className="gap-2 flex-1 md:flex-none hover:bg-gray-500 hover:text-gray-50 transition-all"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden xs:inline">Anterior</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateMonth("next")}
          className="gap-2 flex-1 md:flex-none hover:bg-gray-500 hover:text-gray-50 transition-all"
          aria-label="Próximo mês"
        >
          <span className="hidden xs:inline">Próximo</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Linha 2: título + Hoje */}
      <div className="flex items-center justify-between gap-2">
        <div className="text-center md:text-left flex-1">
          <h2 className="font-bold text-lg md:text-xl text-foreground leading-tight">
            {formatMonthDisplay(selectedMonth)}
          </h2>
          <p className="text-xs md:text-sm text-gray-800">
            {isCurrentMonth ? "Mês atual" : "Navegando no histórico"}
          </p>
        </div>

        {!isCurrentMonth && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
            className="gap-2 text-primary hover:bg-gray-500 hover:text-gray-50 transition-all"
            aria-label="Ir para o mês atual"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Hoje</span>
          </Button>
        )}
      </div>

      {/* Linha 3 (mobile): seletor nativo de mês */}
      <div className="md:hidden">
        <label className="text-xs font-medium block mb-1" htmlFor="monthPicker">
          Selecionar mês
        </label>
        <input
          id="monthPicker"
          type="month"
          value={selectedMonth}
          onChange={(e) => onPickMobile(e.target.value)}
          className="
            w-full rounded-md border border-border bg-white px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-primary/30
          "
        />
      </div>
    </div>
  )
}
