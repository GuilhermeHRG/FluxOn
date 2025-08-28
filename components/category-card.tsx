"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Coffee,
  Car,
  Home,
  Gamepad2,
  Heart,
  ShoppingCart,
  Plane,
  Book,
  Dumbbell,
  Phone,
  Shirt,
  Gift,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react"

interface Category {
  id: string
  name: string
  icon: string
  color: string
  totalSpent: number
  transactionCount: number
}

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

const iconMap = {
  Coffee,
  Car,
  Home,
  Gamepad2,
  Heart,
  ShoppingCart,
  Plane,
  Book,
  Dumbbell,
  Phone,
  Shirt,
  Gift,
}

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const IconComponent = iconMap[category.icon as keyof typeof iconMap]

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${category.color} text-white`}>
              {IconComponent && <IconComponent className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{category.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {category.transactionCount} transações
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(category.id)} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-800">Total gasto:</span>
            <span className="font-bold text-destructive">
              R$ {category.totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`h-2 rounded-full ${category.color}`}
              style={{
                width: `${Math.min((category.totalSpent / 2000) * 100, 100)}%`,
              }}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {((category.totalSpent / 2000) * 100).toFixed(1)}% do limite sugerido
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
