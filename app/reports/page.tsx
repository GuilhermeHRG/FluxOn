"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, Target, BarChart3, PieChart } from "lucide-react"
import Link from "next/link"
import { CategoryChart } from "@/components/category-chart"
import { MonthlyChart } from "@/components/monthly-chart"
import { TrendChart } from "@/components/trend-chart"

interface MonthlyData {
  month: string
  income: number
  expenses: number
  savings: number
}

interface CategoryData {
  category: string
  amount: number
  color: string
  percentage: number
}

const monthlyData: MonthlyData[] = [
  { month: "Set", income: 5000, expenses: 2800, savings: 2200 },
  { month: "Out", income: 5000, expenses: 3100, savings: 1900 },
  { month: "Nov", income: 5000, expenses: 2950, savings: 2050 },
  { month: "Dez", income: 5000, expenses: 3400, savings: 1600 },
  { month: "Jan", income: 5000, expenses: 3250, savings: 1750 },
]

const categoryData: CategoryData[] = [
  { category: "Alimentação", amount: 850, color: "#f97316", percentage: 26.2 },
  { category: "Moradia", amount: 1200, color: "#22c55e", percentage: 36.9 },
  { category: "Transporte", amount: 420, color: "#3b82f6", percentage: 12.9 },
  { category: "Entretenimento", amount: 180, color: "#a855f7", percentage: 5.5 },
  { category: "Saúde", amount: 320, color: "#ef4444", percentage: 9.8 },
  { category: "Compras", amount: 280, color: "#ec4899", percentage: 8.6 },
]

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedChart, setSelectedChart] = useState("category")

  const currentMonth = monthlyData[monthlyData.length - 1]
  const previousMonth = monthlyData[monthlyData.length - 2]
  const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
  const savingsChange = ((currentMonth.savings - previousMonth.savings) / previousMonth.savings) * 100

  const totalExpenses = categoryData.reduce((sum, cat) => sum + cat.amount, 0)
  const highestCategory = categoryData.reduce((max, cat) => (cat.amount > max.amount ? cat : max))
  const projectedMonthlyExpense = (totalExpenses / 27) * 30 // Projeção baseada em 27 dias

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
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
                <h1 className="text-2xl font-bold text-foreground">Relatórios e Análises</h1>
                <p className="text-sm text-muted-foreground">Insights detalhados sobre seus gastos</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Mês Atual</SelectItem>
                  <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
                  <SelectItem value="last-6-months">Últimos 6 Meses</SelectItem>
                  <SelectItem value="current-year">Ano Atual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gastos Este Mês</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {currentMonth.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p
                className={`text-xs flex items-center gap-1 ${expenseChange > 0 ? "text-destructive" : "text-green-600"}`}
              >
                {expenseChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(expenseChange).toFixed(1)}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Economia Este Mês</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                R$ {currentMonth.savings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p
                className={`text-xs flex items-center gap-1 ${savingsChange > 0 ? "text-green-600" : "text-destructive"}`}
              >
                {savingsChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(savingsChange).toFixed(1)}% vs mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maior Categoria</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{highestCategory.category}</div>
              <p className="text-xs text-muted-foreground">
                R$ {highestCategory.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (
                {highestCategory.percentage}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projeção Mensal</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {projectedMonthlyExpense.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">Baseado no padrão atual</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart Selection */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedChart === "category" ? "default" : "outline"}
            onClick={() => setSelectedChart("category")}
            size="sm"
          >
            Por Categoria
          </Button>
          <Button
            variant={selectedChart === "monthly" ? "default" : "outline"}
            onClick={() => setSelectedChart("monthly")}
            size="sm"
          >
            Evolução Mensal
          </Button>
          <Button
            variant={selectedChart === "trend" ? "default" : "outline"}
            onClick={() => setSelectedChart("trend")}
            size="sm"
          >
            Tendências
          </Button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {selectedChart === "category" && (
            <>
              <CategoryChart data={categoryData} />
              <Card>
                <CardHeader>
                  <CardTitle>Análise por Categoria</CardTitle>
                  <CardDescription>Detalhamento dos gastos por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: category.color }} />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            R$ {category.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-muted-foreground">{category.percentage}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {selectedChart === "monthly" && (
            <>
              <MonthlyChart data={monthlyData} />
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal</CardTitle>
                  <CardDescription>Comparação de receitas, gastos e economia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.slice(-3).map((month) => (
                      <div key={month.month} className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">{month.month}/2025</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Receita</p>
                            <p className="font-medium text-green-600">
                              R$ {month.income.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Gastos</p>
                            <p className="font-medium text-destructive">
                              R$ {month.expenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Economia</p>
                            <p className="font-medium text-accent">
                              R$ {month.savings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {selectedChart === "trend" && (
            <>
              <TrendChart data={monthlyData} />
              <Card>
                <CardHeader>
                  <CardTitle>Insights e Tendências</CardTitle>
                  <CardDescription>Análise inteligente dos seus padrões de gastos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-200">Ponto Positivo</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Você conseguiu economizar R$ 1.750 este mês, mantendo 35% do seu salário.
                      </p>
                    </div>

                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-semibold text-orange-800 dark:text-orange-200">Atenção</span>
                      </div>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Gastos com {highestCategory.category} representam {highestCategory.percentage}% do total.
                        Considere revisar esta categoria.
                      </p>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-800 dark:text-blue-200">Recomendação</span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Baseado no seu padrão, você pode economizar mais R$ 200 reduzindo gastos supérfluos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Goals vs Reality */}
        <Card>
          <CardHeader>
            <CardTitle>Metas vs Realidade</CardTitle>
            <CardDescription>Compare seus gastos reais com as metas estabelecidas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Necessidades (Meta: 50%)</span>
                  <span className="text-sm text-muted-foreground">62%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full bg-destructive" style={{ width: "62%" }} />
                </div>
                <p className="text-xs text-destructive">12% acima da meta</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Desejos (Meta: 30%)</span>
                  <span className="text-sm text-muted-foreground">23%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: "23%" }} />
                </div>
                <p className="text-xs text-green-600">7% abaixo da meta</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Poupança (Meta: 20%)</span>
                  <span className="text-sm text-muted-foreground">35%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="h-2 rounded-full bg-accent" style={{ width: "35%" }} />
                </div>
                <p className="text-xs text-accent">15% acima da meta</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
