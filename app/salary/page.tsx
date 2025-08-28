"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Target, Loader2 } from "lucide-react"
import Link from "next/link"
import { SalaryForm } from "@/components/salary-form"
import type { Salary } from "@/lib/types"
import { useExpenses } from "@/hooks/use-expenses"
import { useAuth } from "@/hooks/use-auth"
import { useSalary } from "@/hooks/use-salary"

interface SpendingGoal {
  category: string
  percentage: number
  amount: number
}

export default function SalaryPage() {
  const { salaries, currentSalary, loading: salaryLoading, addSalary, updateSalary } = useSalary()
  const { expenses, loading: expensesLoading } = useExpenses()
  const { user, loading: authLoading } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingSalary, setEditingSalary] = useState<{ amount: number } | null>(null)

  const getSpendingGoals = (): SpendingGoal[] => {
    if (!currentSalary) return []
    return [
      { category: "Necessidades", percentage: 50, amount: currentSalary.amount * 0.5 },
      { category: "Desejos", percentage: 30, amount: currentSalary.amount * 0.3 },
      { category: "Poupança", percentage: 20, amount: currentSalary.amount * 0.2 },
    ]
  }

  // Normaliza data (Date | string | Firestore Timestamp) para ISO "YYYY-MM-DD"
  function toISODate10(d: any): string {
    if (!d) return new Date().toISOString().slice(0, 10)
    if (d instanceof Date) return d.toISOString().slice(0, 10)
    if (typeof d === "string") return new Date(d).toISOString().slice(0, 10)
    if (typeof d?.toDate === "function") return d.toDate().toISOString().slice(0, 10)
    return new Date().toISOString().slice(0, 10)
  }

  const getCurrentMonthSpent = () => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return expenses
      .filter((expense) => toISODate10(expense.date).slice(0, 7) === currentMonth)
      .reduce((sum, expense) => sum + expense.amount, 0)
  }

  const currentSpent = getCurrentMonthSpent()
  const remainingAmount = currentSalary ? currentSalary.amount - currentSpent : 0
  const spentPercentage = currentSalary ? (currentSpent / currentSalary.amount) * 100 : 0
  const spendingGoals = getSpendingGoals()

  const handleSaveSalary = async (amount: number) => {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7)
      // Mantido (sem remover) para compatibilidade visual com assinatura antiga,
      // mas comentado para evitar salvar duas vezes:
      // await addSalary({ amount, month: currentMonth })

      // Assinatura nova do hook (salário global):
      await addSalary(amount)

      setShowForm(false)
      setEditingSalary(null)
    } catch (error) {
      console.error("Error saving salary:", error)
    }
  }

  if (authLoading || salaryLoading || expensesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Necessário</CardTitle>
            <CardDescription>Você precisa estar logado para configurar seu salário.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Voltar ao Início</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background ">
      {/* Header */}
      <header className="border-b border-border bg-[#202224] text-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-50">Configuração de Salário</h1>
                <p className="text-xs text-gray-50">Gerencie seu salário e metas de gastos</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingSalary(null)
                setShowForm(true)
              }}
              className="gap-2"
            >
              <DollarSign className="h-4 w-4" />
              {currentSalary ? "Atualizar Salário" : "Definir Salário"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Current Salary Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-700 text-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salário Atual</CardTitle>
              <DollarSign className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                {currentSalary
                  ? `R$ ${currentSalary.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                  : "Não definido"}
              </div>
              <p className="text-xs ">
                {currentSalary ? `Mês: ${currentSalary.month}` : "Configure seu salário"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-700 text-red-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto Atual</CardTitle>
              <TrendingUp className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                R$ {currentSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs ">{spentPercentage.toFixed(1)}% do salário</p>
            </CardContent>
          </Card>

          <Card className="border-blue-700 text-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Restante</CardTitle>
              <Target className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                R$ {remainingAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs ">{(100 - spentPercentage).toFixed(1)}% disponível</p>
            </CardContent>
          </Card>

          <Card className="border-purple-700 text-purple-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Calendar className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {spentPercentage <= 70 ? "Ótimo" : spentPercentage <= 85 ? "Atenção" : "Alerta"}
              </div>
              <p className="text-xs ">Controle de gastos</p>
            </CardContent>
          </Card>
        </div>

        {/* Salary Form */}
        {showForm && (
          <Card className="border-gray-700 text-gray-700 mb-8">
            <CardHeader>
              <CardTitle>{editingSalary ? "Editar Salário" : "Configurar Salário"}</CardTitle>
              <CardDescription>
                {editingSalary
                  ? "Modifique seu salário atual"
                  : "Defina seu salário mensal para acompanhar seus gastos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalaryForm
                //@ts-ignore
                salary={editingSalary}
                onSubmit={handleSaveSalary}
                onCancel={() => {
                  setShowForm(false)
                  setEditingSalary(null)
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Spending Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-gray-700 text-gray-700 mb-8">
            <CardHeader>
              <CardTitle>Metas de Gastos</CardTitle>
              <CardDescription>Distribua seu salário de acordo com suas prioridades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {spendingGoals.length > 0 ? (
                spendingGoals.map((goal) => (
                  <div key={goal.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.category}</span>
                      <span className="text-sm ">
                        {goal.percentage}% • R$ {goal.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div className="h-2 rounded-full bg-purple-500" style={{ width: `${goal.percentage}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Configure seu salário para ver as metas sugeridas
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-700 text-gray-700 mb-8">
            <CardHeader>
              <CardTitle>Histórico de Salários</CardTitle>
              <CardDescription>Acompanhe as mudanças no seu salário ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salaries.length > 0 ? (
                  salaries
                    // proteção para itens sem createdAt (compat com salário global)
                    .sort(
                      (a: any, b: any) =>
                        new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime()
                    )
                    .map((salary: any) => (
                      <div
                        key={salary.id ?? `${salary.month ?? "current"}-${salary.amount}`}
                        className={`p-4 rounded-lg border ${salary.id === (currentSalary as any)?.id ? "bg-gray-400/10 border-primary/20" : "bg-muted/50"
                          }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">
                              R$ {Number(salary.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-sm ">Mês: {salary.month ?? "Atual"}</p>
                          </div>
                          {salary.id === (currentSalary as any)?.id && (
                            <span className="text-xs bg-primary text-white px-2 py-1 rounded">Atual</span>
                          )}
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">Nenhum salário configurado ainda</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="border-gray-700 text-gray-700 mb-8">
          <CardHeader>
            <CardTitle>Dicas de Planejamento Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-100 dark:bg-green-950/20 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Regra 50/30/20</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  50% necessidades, 30% desejos, 20% poupança e investimentos
                </p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-950/20 rounded-lg">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Reserva de Emergência</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Mantenha de 3 a 6 meses de gastos guardados para emergências
                </p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-950/20 rounded-lg">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Acompanhamento</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Revise seus gastos semanalmente para manter o controle
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
