// src/app/incomes/page.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ArrowLeft, Search, Calendar, DollarSign, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { MonthNavigator } from "@/components/month-navigator"
import { useIncomes } from "@/hooks/use-incomes"
import { useAuth } from "@/hooks/use-auth"
import { IncomeForm } from "@/components/income-form"
import type { RecurrenceMeta } from "@/lib/types"

export default function IncomesPage() {
    const { user, loading: authLoading } = useAuth()
    // ⬇️ pega getIncomesByMonth do hook (ele já expande recorrências)
    const { incomes, loading: incomesLoading, addIncome, deleteIncome, getIncomesByMonth } = useIncomes()

    const [showForm, setShowForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))

    // Lista expandida do mês selecionado (itens “virtuais” já vêm com _virtualId/_virtualDate)
    const expandedIncomes = getIncomesByMonth(selectedMonth)

    const filteredIncomes = expandedIncomes.filter((inc: any) =>
        (inc.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // --- métricas ---
    const totalIncomes = filteredIncomes.reduce((sum: number, inc: any) => sum + Number(inc.amount || 0), 0)
    const incomeCount = filteredIncomes.length
    const avgIncome = incomeCount > 0 ? totalIncomes / incomeCount : 0

    // --- handlers ---
    async function handleAddIncome(data: { amount: number; description: string; date?: Date; recurrence?: RecurrenceMeta }) {
        await addIncome(data) // use-incomes.ts já trata recurrence/startMonth/active
        setShowForm(false)
    }

    async function handleDelete(id: string) {
        await deleteIncome(id)
    }

    // --- loading/auth guards ---
    if (authLoading || incomesLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Carregando entradas...</span>
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
                        <CardDescription>Você precisa estar logado para gerenciar suas entradas.</CardDescription>
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
        <div className="min-h-screen bg-background text-gray-800">
            {/* Header */}
            <header className="border-b border-border bg-[#202224] text-gray-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between max-sm:justify-around">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                                <Button variant="outline" size="sm" className="gap-2 text-black hover:cursor-pointer hover:bg-blue-300">
                                    <ArrowLeft className="h-4 w-4" />
                                    Voltar
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold max-sm:text-center">Entradas</h1>
                                <p className="text-sm max-sm:hidden">Gerencie todas as suas receitas</p>
                            </div>
                        </div>
                        <Button onClick={() => setShowForm(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Adicionar
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="container mx-auto px-4 py-8">
                {/* Month Navigator */}
                <MonthNavigator currentMonth={selectedMonth} onMonthChange={setSelectedMonth} />

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total do Período</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-700" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700">
                                R$ {totalIncomes.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs">
                                {new Date(selectedMonth + "-01").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Número de Entradas</CardTitle>
                            <Calendar className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{incomeCount}</div>
                            <p className="text-xs">Transações registradas</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Média por Entrada</CardTitle>
                            <Filter className="h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                R$ {avgIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </div>
                            <p className="text-xs">Valor médio</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Income Form */}
                {showForm && (
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Nova Entrada</CardTitle>
                            <CardDescription>Registre uma nova receita</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <IncomeForm onSubmit={handleAddIncome} onCancel={() => setShowForm(false)} />
                        </CardContent>
                    </Card>
                )}

                {/* Filtros */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Filtros</CardTitle>
                        <CardDescription>Filtre suas entradas por descrição</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="md:col-span-3 space-y-2">
                                <label className="text-sm font-medium">Buscar</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                                    <Input
                                        placeholder="Buscar por descrição..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-medium">Ações</label>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchTerm("")
                                        }}
                                        className="w-full"
                                    >
                                        Limpar Filtros
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Lista de Entradas */}
                <div className="space-y-4 capitalize">
                    {filteredIncomes.length > 0 ? (
                        filteredIncomes.map((inc: any) => {
                            const id = inc._virtualId ?? inc.id
                            const d: any = inc._virtualDate ?? inc.date
                            const showDate =
                                typeof d === "string"
                                    ? new Date(d).toLocaleDateString("pt-BR")
                                    : typeof d?.toDate === "function"
                                        ? d.toDate().toLocaleDateString("pt-BR")
                                        : (d as Date)?.toLocaleDateString?.("pt-BR")

                            return (
                                <div key={id} className="flex items-center justify-between p-3 rounded-md border bg-white">
                                    <div>
                                        <p className="font-medium">{inc.description || "Entrada"}</p>
                                        <p className="text-sm text-gray-700">{showDate}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-emerald-700">
                                            + R$ {Number(inc.amount || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        {/* Em item “virtual”, não há id físico para apagar — só mostra o botão se tiver inc.id */}
                                        {inc.id && <Button variant="outline" onClick={() => handleDelete(inc.id)}>Excluir</Button>}
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                        <Card className="text-center py-12">
                            <CardContent>
                                <div className="mb-4">
                                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50 text-emerald-700" />
                                    <p className="text-lg font-medium">Nenhuma entrada encontrada</p>
                                    <p className="text-sm">
                                        {searchTerm ? "Tente ajustar a busca ou" : "Registre sua primeira entrada para começar o controle"}
                                    </p>
                                </div>
                                <Button onClick={() => setShowForm(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    {searchTerm ? "Nova Entrada" : "Registrar Primeira Entrada"}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    )
}
