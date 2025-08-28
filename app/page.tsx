"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, DollarSign, TrendingDown, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useExpenses } from "@/hooks/use-expenses"
import { useSalary } from "@/hooks/use-salary"
import { AuthForm } from "@/components/auth-form"
import { MonthNavigator } from "@/components/month-navigator"
import { useState } from "react"
import { useIncomes } from "@/hooks/use-incomes"
import { UserMenu } from "@/components/user-menu"

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const { expenses, loading: expensesLoading } = useExpenses()
  const { currentSalary, loading: salaryLoading } = useSalary()
  const { incomes, loading: incomesLoading } = useIncomes()

  function getCurrentMonthLocal() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0") 
    return `${year}-${month}`
  }

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthLocal())
  const currency = currentSalary?.currency ?? "BRL"
  const currentSalaryAmount = Number(currentSalary?.amount ?? 0)

  const monthlyExpenses = expenses.filter((e: any) => {
    let dateStr: string
    if (e.date instanceof Date) {
      dateStr = e.date.toISOString().slice(0, 10)
    } else if (typeof e.date === "string") {
      dateStr = e.date
    } else {
      dateStr = e.date.toDate ? e.date.toDate().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    }
    return dateStr.startsWith(selectedMonth)
  })

  const monthlyIncomes = incomes.filter((i: any) => {
    let dateStr: string
    if (i.date instanceof Date) {
      dateStr = i.date.toISOString().slice(0, 10)
    } else if (typeof i.date === "string") {
      dateStr = i.date
    } else {
      dateStr = i.date?.toDate ? i.date.toDate().toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    }
    return dateStr.startsWith(selectedMonth)
  })

  const totalExpenses = monthlyExpenses.reduce((sum: number, expense: any) => sum + expense.amount, 0)
  const totalIncomes = monthlyIncomes.reduce((sum: number, inc: any) => sum + inc.amount, 0)

  const remainingBalance = currentSalaryAmount + totalIncomes - totalExpenses
  const expensePercentage = currentSalaryAmount > 0 ? Math.round((totalExpenses / currentSalaryAmount) * 100) : 0

  function toDateObj(d: any): Date {
    if (d instanceof Date) return d
    if (typeof d === "string") return new Date(d)
    if (typeof d?.toDate === "function") return d.toDate()
    return new Date()
  }

  const monthlyMovements = [
    ...monthlyIncomes.map((i: any) => ({
      id: `income-${i.id}`,
      type: "income" as const,
      description: i.description || "Entrada",
      categoryName: i.categoryName || "Entrada",
      date: toDateObj(i.date),
      amount: Number(i.amount || 0),
    })),
    ...monthlyExpenses.map((e: any) => ({
      id: `expense-${e.id}`,
      type: "expense" as const,
      description: e.description || "Despesa",
      categoryName: e.categoryName || "Despesa",
      date: toDateObj(e.date),
      amount: Number(e.amount || 0),
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime())

  if (authLoading || expensesLoading || salaryLoading || incomesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-[#202224] text-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-sm:justify-center">
            <div>
              <h1 className="text-xl font-bold max-sm:hidden">Controle de Gastos</h1>
              <p className="text-sm max-sm:hidden">Gerencie suas finanças pessoais</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/expenses">
                <Button className="gap-2 hover:bg-gray-500 hover:cursor-pointer hover:text-gray-50 transition-all">
                  <Plus className="h-4 w-4" />
                  Novo Gasto
                </Button>
              </Link>
              <Link href="/incomes">
                <Button className="gap-2 hover:bg-gray-500 hover:cursor-pointer hover:text-gray-50 transition-all">
                  <Plus className="h-4 w-4" />
                  Nova Entrada
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <MonthNavigator currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
          <Card className=" border-green-700 text-green-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
              <CardTitle className="text-sm font-medium ">Salário Mensal</CardTitle>
              <DollarSign className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency,
                  minimumFractionDigits: 2,
                }).format(currentSalaryAmount)}
              </div>
              <p className="text-xs ">
                {currentSalaryAmount > 0 ? "Configurado" : "Não configurado"}
              </p>
            </CardContent>
          </Card>

          <Card className=" border-emerald-700 text-emerald-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entradas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                R$ {totalIncomes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs">Receitas registradas</p>
            </CardContent>
          </Card>

          <Card className=" border-red-700 text-red-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold ">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">{expensePercentage}% do salário</p>
            </CardContent>
          </Card>

          <Card className="text-blue-700 border-blue-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Restante</CardTitle>
              <TrendingUp className="h-4 w-4 " />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${remainingBalance >= 0 ? "" : "text-red-700"}`}>
                R$ {remainingBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs ">{100 - expensePercentage}% disponível</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Configurar Salário</CardTitle>
              <CardDescription>Defina seu salário mensal para acompanhar seus gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/salary">
                <Button variant="outline" className="w-full bg-gray-500/40 text-gray-800 hover:bg-gray-500 hover:cursor-pointer hover:text-gray-50 transition-all">
                  Configurar
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Gerenciar Categorias</CardTitle>
              <CardDescription>Crie e organize categorias para seus gastos</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/categories">
                <Button variant="outline" className="w-full bg-gray-500/40 text-gray-800 hover:bg-gray-500 hover:cursor-pointer hover:text-gray-50 transition-all">
                  Gerenciar
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className=" hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Formas de Pagamento</CardTitle>
              <CardDescription>Configure suas formas de pagamento preferidas</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/payment-methods" className="cursor-pointer">
                <Button variant="outline" className="w-full bg-gray-500/40 text-gray-800 cursor-pointer hover:bg-gray-500 hover:cursor-pointer hover:text-gray-50 transition-all">
                  Configurar
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="cursor-not-allowed hover:shadow-md transition-shadow bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Ver Relatórios</CardTitle>
              <CardDescription>Analise seus gastos com gráficos e relatórios</CardDescription>
            </CardHeader>
            <CardContent>
              {/* <Link href="/reports"> */}
                <Button variant="outline" className="w-full bg-transparent cursor-not-allowed hover:bg-transparent">
              <p className="text-xs text-orange-500 text-end font-semibold ">Em breve!</p>
                </Button>
              {/* </Link> */}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Movimentação do Mês</CardTitle>
            <CardDescription>Entradas e despesas registradas no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 ">
              {monthlyMovements.slice(0, 6).map((mov) => (
                <div
                  key={mov.id}
                  className="flex items-center justify-between p-3 max-sm:px-2 bg-gray-200/40 border border-gray-300 capitalize  rounded-lg"
                >
                  <div>
                    <p className="font-semibold ">
                      {mov.description}
                    </p>
                    <p className="text-sm max-sm:text-xs font-medium text-gray-800">
                      {mov.categoryName} • {mov.date.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  {mov.type === "income" ? (
                    <p className="font-bold text-emerald-600 max-sm:text-sm">
                      + R$ {mov.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="font-bold text-red-500 max-sm:text-sm">
                      - R$ {mov.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              ))}
              {monthlyMovements.length === 0 && (
                <p className="text-center text-gray-800 py-8">Nenhuma movimentação registrada neste período</p>
              )}
            </div>
            <div className="mt-4 pt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Link href="/incomes">
                <Button variant="outline" className="w-full hover:bg-gray-500 hover:cursor-pointer hover:text-gray-50 transition-all">
                  Ver entradas
                </Button>
              </Link>
              <Link href="/expenses">
                <Button variant="outline" className="w-full hover:bg-gray-500 hover:cursor-pointer hover:text-gray-50 transition-all">
                  Ver despesas
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
