"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, ShoppingCart, Loader2 } from "lucide-react"
import Link from "next/link"
import { CategoryForm } from "@/components/category-form"
import { CategoryCard } from "@/components/category-card"
import { useCategories } from "@/hooks/use-categories"
import { useExpenses } from "@/hooks/use-expenses"
import { useAuth } from "@/hooks/use-auth"
import type { Category } from "@/lib/types"

export default function CategoriesPage() {
  const { categories, loading: categoriesLoading, addCategory, updateCategory, deleteCategory } = useCategories()
  const { expenses, loading: expensesLoading } = useExpenses()
  const { user, loading: authLoading } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const getCategoryStats = (categoryId: string) => {
    const categoryExpenses = expenses.filter((expense) => expense.categoryId === categoryId)
    const totalSpent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    return {
      totalSpent,
      transactionCount: categoryExpenses.length,
    }
  }

  const handleAddCategory = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    try {
      await addCategory(categoryData)
      setShowForm(false)
    } catch (error) {
      console.error("Error adding category:", error)
    }
  }

  const handleEditCategory = async (categoryData: Omit<Category, "id" | "createdAt" | "updatedAt">) => {
    if (editingCategory) {
      try {
        await updateCategory(editingCategory.id, categoryData)
        setEditingCategory(null)
        setShowForm(false)
      } catch (error) {
        console.error("Error updating category:", error)
      }
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId)
    } catch (error) {
      console.error("Error deleting category:", error)
    }
  }

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (authLoading || categoriesLoading || expensesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando categorias...</span>
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
            <CardDescription>Você precisa estar logado para gerenciar suas categorias.</CardDescription>
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
    <div className="min-h-screen ">
      {/* Header */}
      <header className="border-b border-border bg-[#202224] text-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-sm:justify-around">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold  ">Categorias</h1>
                <p className="text-sm  max-sm:hidden">Gerencie suas categorias de gastos</p>
              </div>
            </div>
            <Button
              onClick={() => {
                setEditingCategory(null)
                setShowForm(true)
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Category Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</CardTitle>
              <CardDescription>
                {editingCategory
                  ? "Modifique os dados da categoria"
                  : "Crie uma nova categoria para organizar seus gastos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm
                category={editingCategory}
                onSubmit={editingCategory ? handleEditCategory : handleAddCategory}
                onCancel={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                }}
              />
            </CardContent>
          </Card>
        )}
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Categorias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{categories.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 text-gray-800">
              <CardTitle className="text-sm font-medium ">Total Gasto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Categoria Mais Usada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {categories.length > 0
                  ? categories.reduce((max, cat) => {
                      const maxStats = getCategoryStats(max.id)
                      const catStats = getCategoryStats(cat.id)
                      return catStats.transactionCount > maxStats.transactionCount ? cat : max
                    }, categories[0])?.name || "Nenhuma"
                  : "Nenhuma"}
              </div>
            </CardContent>
          </Card>
        </div>

        

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 capitalize">
          {categories.map((category) => {
            const stats = getCategoryStats(category.id)
            return (
              <CategoryCard
                key={category.id}
                category={{
                  ...category,
                  totalSpent: stats.totalSpent,
                  transactionCount: stats.transactionCount,
                }}
                onEdit={(cat) => {
                  //@ts-ignore
                  setEditingCategory(cat)
                  setShowForm(true)
                }}
                onDelete={handleDeleteCategory}
              />
            )
          })}
        </div>

        {categories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhuma categoria encontrada</p>
                <p className="text-sm">Crie sua primeira categoria para começar a organizar seus gastos</p>
              </div>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira Categoria
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
