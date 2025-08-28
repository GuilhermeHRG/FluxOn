"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Calendar, CreditCard } from "lucide-react"
import type { Expense } from "@/lib/types"

interface ExpenseCardProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (expenseId: string) => void
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    } else {
      return date.toLocaleDateString("pt-BR")
    }
  }

  const getFormattedDate = () => {
    if (expense.date instanceof Date) {
      return formatDate(expense.date)
    } else if (typeof expense.date === "string") {
      return formatDate(new Date(expense.date))
    } else {
      //@ts-ignore
      return formatDate(expense.date.toDate ? expense.date.toDate() : new Date())
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow capitalize">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* <div className={`w-3 h-3 rounded-full ${expense.categoryColor}`} /> */}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate ">{expense.description}</h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-800">
                  <div className={`w-3 h-3 rounded-full ${expense.categoryColor}`} />
                  {expense.categoryName}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-800">
                  <Calendar className="h-3 w-3" />
                  {getFormattedDate()}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-800">
                  <CreditCard className="h-3 w-3" />
                  {expense.paymentMethodName}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-destructive text-lg">
                -R$ {expense.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(expense)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(expense.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
