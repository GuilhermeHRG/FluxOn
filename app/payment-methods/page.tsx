"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, CreditCard, Banknote, Smartphone } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { usePaymentMethods } from "@/hooks/use-payment-methods"
import { AuthForm } from "@/components/auth-form"
import { PaymentMethodForm } from "@/components/payment-method-form"
import { PaymentMethodCard } from "@/components/payment-method-card"
import { useState } from "react"

export default function PaymentMethodsPage() {
  const { user, loading: authLoading } = useAuth()
  const { paymentMethods, loading } = usePaymentMethods()
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)

  if (authLoading || loading) {
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

  const handleEdit = (method: any) => {
    setEditingMethod(method)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingMethod(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-[#202224] text-gray-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-sm:justify-around" >
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold max-sm:font-semibold max-sm:text-md ">Formas de Pagamento</h1>
                <p className="text-sm max-sm:hidden">Gerencie suas formas de pagamento</p>
              </div>
            </div>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />

            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {showForm && (
          <div className="mb-8">
            <PaymentMethodForm method={editingMethod} onClose={handleCloseForm} onSuccess={handleCloseForm} />
          </div>
        )}

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paymentMethods.map((method) => (
            <PaymentMethodCard key={method.id} method={method} onEdit={() => handleEdit(method)} />
          ))}
        </div>

        {paymentMethods.length === 0 && !showForm && (
          <Card className="text-center py-12">
            <CardContent>
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma forma de pagamento</h3>
              <p className="text-muted-foreground mb-4">
                Adicione suas formas de pagamento para organizar melhor seus gastos
              </p>
              <Button onClick={() => setShowForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeira Forma
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Setup Cards */}
        {paymentMethods.length === 0 && !showForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Cartão de Crédito</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
              <CardContent className="p-6 text-center">
                <CreditCard className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-sm font-medium">Cartão de Débito</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
              <CardContent className="p-6 text-center">
                <Smartphone className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-sm font-medium">PIX</p>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed">
              <CardContent className="p-6 text-center">
                <Banknote className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Dinheiro</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
