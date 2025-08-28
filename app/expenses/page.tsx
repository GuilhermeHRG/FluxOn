"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ArrowLeft, Search, Filter, Calendar, DollarSign, Loader2 } from "lucide-react"
import Link from "next/link"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseCard } from "@/components/expense-card"
import { MonthNavigator } from "@/components/month-navigator"
import { useExpenses } from "@/hooks/use-expenses"
import { useCategories } from "@/hooks/use-categories"
import { usePaymentMethods } from "@/hooks/use-payment-methods"
import { useAuth } from "@/hooks/use-auth"
import type { Expense } from "@/lib/types"

export default function ExpensesPage() {
  // ⬇️ pega getExpensesByMonth (expande parceladas e fixas para o mês)
  const { expenses, loading: expensesLoading, addExpense, updateExpense, deleteExpense, getExpensesByMonth } = useExpenses()
  const { categories, loading: categoriesLoading } = useCategories()
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods()
  const { user, loading: authLoading } = useAuth()

  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("all")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  // ✅ usa a expansão por mês (substitui o filtro por startsWith)
  const expanded = getExpensesByMonth(selectedMonth)

  // filtros (busca + categoria + forma de pagamento) aplicados sobre a lista expandida
  const filteredExpenses = expanded.filter((expense: any) => {
    const matchesSearch = (expense.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || expense.categoryId === selectedCategory
    const matchesPaymentMethod = selectedPaymentMethod === "all" || expense.paymentMethodId === selectedPaymentMethod
    return matchesSearch && matchesCategory && matchesPaymentMethod
  })

  const totalExpenses = filteredExpenses.reduce((sum: number, e: any) => sum + Number(e.amount || 0), 0)
  const expenseCount = filteredExpenses.length

  const handleAddExpense = async (expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    await addExpense(expenseData) // o hook já persiste recurrence/startMonth/active se vier do form
    setShowForm(false)
  }

  const handleEditExpense = async (expenseData: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
    if (!editingExpense) return
    await updateExpense(editingExpense.id, expenseData)
    setEditingExpense(null)
    setShowForm(false)
  }

  const handleDeleteExpense = async (expenseId: string) => {
    await deleteExpense(expenseId)
  }

  if (authLoading || expensesLoading || categoriesLoading || paymentMethodsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando despesas...</span>
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
            <CardDescription>Você precisa estar logado para gerenciar suas despesas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button className="w-full">Voltar ao Início</Button></Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-[#202224] text-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-sm:justify-around">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 text-black bg-white hover:cursor-pointer hover:bg-blue-300">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold ">Despesas</h1>
                <p className="text-sm max-sm:hidden">Gerencie todos os seus gastos</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingExpense(null)
                setShowForm(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Month Navigator */}
        <MonthNavigator currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total do Período</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">
                R$ {totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-800">
                {new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Número de Gastos</CardTitle>
              <Calendar className="h-4 w-4 text-gray-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{expenseCount}</div>
              <p className="text-xs text-gray-800">Transações registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Gasto</CardTitle>
              <Filter className="h-4 w-4 text-gray-800" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                R${" "}
                {expenseCount > 0
                  ? (totalExpenses / expenseCount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                  : "0,00"}
              </div>
              <p className="text-xs text-gray-800">Valor médio</p>
            </CardContent>
          </Card>
        </div>

        {/* Expense Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingExpense ? "Editar Despesa" : "Nova Despesa"}</CardTitle>
              <CardDescription>
                {editingExpense ? "Modifique os dados da despesa" : "Registre uma nova despesa"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm
                expense={editingExpense}
                categories={categories}
                paymentMethods={paymentMethods}
                onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
                onCancel={() => {
                  setShowForm(false)
                  setEditingExpense(null)
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
            <CardDescription>Filtre suas despesas por categoria, forma de pagamento ou descrição</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-800" />
                  <Input
                    placeholder="Buscar por descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Forma de Pagamento</label>
                <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                  <SelectTrigger><SelectValue placeholder="Todas as formas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as formas</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ações</label>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                    setSelectedPaymentMethod("all")
                  }}
                  className="w-full"
                >
                  Limpar Filtros
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gerenciar</label>
                <Link href="/payment-methods">
                  <Button variant="outline" className="w-full bg-transparent">Formas de Pagamento</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <div className="space-y-4 text-gray-800">
          {filteredExpenses.length > 0 ? (
            filteredExpenses.map((expense: any) => {
              // usa _virtualId/_virtualDate quando presentes
              const key = expense._virtualId ?? expense.id
              const displayExpense: Expense = {
                ...expense,
                date: (expense._virtualDate ?? expense.date) as Date, // garante data correta no cartão
              }
              return (
                <ExpenseCard
                  key={key}
                  expense={displayExpense}
                  onEdit={(exp) => { setEditingExpense(exp); setShowForm(true) }}
                  onDelete={handleDeleteExpense}
                />
              )
            })
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-gray-800 mb-4">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Nenhuma despesa encontrada</p>
                  <p className="text-sm">
                    {searchTerm || selectedCategory !== "all" || selectedPaymentMethod !== "all"
                      ? "Tente ajustar os filtros ou"
                      : "Registre sua primeira despesa para começar o controle"}
                  </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {searchTerm || selectedCategory !== "all" || selectedPaymentMethod !== "all"
                    ? "Nova Despesa"
                    : "Registrar Primeira Despesa"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
