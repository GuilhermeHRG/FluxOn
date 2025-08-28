export type RecurrenceMode = "none" | "installments" | "fixed"

export interface RecurrenceMeta {
  mode: RecurrenceMode
  // mês inicial da recorrência no formato YYYY-MM
  startMonth: string
  // parcelas (apenas quando mode = "installments")
  installments?: number
  // marcar como “cancelado/encerrado” sem apagar (opcional)
  active?: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  budget?: number
  createdAt: Date
  updatedAt: Date
}

export type Income = {
  id: string
  description: string
  amount: number
  date: Date | string | any 
  categoryName?: string
  paymentMethodId?: string
  userId: string
  createdAt: Date
  recurrence?: RecurrenceMeta
}
export interface Expense {
  id: string
  amount: number
  description: string
  categoryId: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  date: Date
  paymentMethodId: string
  paymentMethodName: string
  paymentMethodType: "credit" | "debit" | "cash" | "pix" | "bank_transfer" | "other"
  createdAt: Date
  updatedAt: Date
  recurrence?: RecurrenceMeta
}

export interface Salary {
  id: string
  amount: number
  month: string // formato: "2024-01"
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}


export interface AuthContextType {
  user: any
  loading: boolean
  signOutUser: () => Promise<void>
}