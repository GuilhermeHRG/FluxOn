// app/lib/recurrence.ts
import { addMonths, compareMonth, monthFromDate } from "./date"

type BaseItem = {
  id: string
  amount: number
  description?: string
  date: Date | string | { toDate?: () => Date }
  recurrence?: {
    mode: "none" | "installments" | "fixed"
    startMonth: string
    installments?: number
    active?: boolean
  }
}

function toDateObj(d: any): Date {
  if (d instanceof Date) return d
  if (typeof d === "string") return new Date(d)
  if (d?.toDate) return d.toDate()
  return new Date()
}

export function expandForMonth<T extends BaseItem>(
  items: T[],
  targetMonth: string,
  kind: "expense" | "income"
): (T & { _virtualId: string; _virtualDate: Date })[] {
  const result: (T & { _virtualId: string; _virtualDate: Date })[] = []

  for (const item of items) {
    const d = toDateObj(item.date)
    const baseMonth = item.recurrence?.startMonth ?? monthFromDate(d)
    const mode = item.recurrence?.mode ?? "none"
    const active = item.recurrence?.active ?? true

    if (!active) continue

    if (mode === "none") {
      // só cai se for do mês alvo
      if (monthFromDate(d) === targetMonth) {
        result.push({
          ...item,
          _virtualId: `${item.id}`,
          _virtualDate: d,
        })
      }
      continue
    }

    if (mode === "installments") {
      const n = Math.max(1, item.recurrence?.installments ?? 1)
      // gera todos os meses de 0..n-1 e vê se targetMonth bate
      for (let i = 0; i < n; i++) {
        const m = addMonths(baseMonth, i)
        if (m === targetMonth) {
          // data visual: usa o dia da despesa original
          const vd = new Date(toDateObj(item.date))
          vd.setMonth(vd.getMonth() + i)
          result.push({
            ...item,
            description: withInstallmentLabel(item.description, i + 1, n),
            _virtualId: `${item.id}#${i + 1}/${n}`,
            _virtualDate: vd,
          })
        }
      }
      continue
    }

    if (mode === "fixed") {
      // aparece em todos os meses >= startMonth
      if (compareMonth(targetMonth, baseMonth) >= 0) {
        const monthsDiff = diffMonths(baseMonth, targetMonth)
        const vd = new Date(toDateObj(item.date))
        vd.setMonth(vd.getMonth() + monthsDiff)
        result.push({
          ...item,
          _virtualId: `${item.id}#fixed@${targetMonth}`,
          _virtualDate: vd,
        })
      }
      continue
    }
  }

  return result
}

function diffMonths(a: string, b: string): number {
  // b - a
  const [ay, am] = a.split("-").map(Number)
  const [by, bm] = b.split("-").map(Number)
  return (by - ay) * 12 + (bm - am)
}

function withInstallmentLabel(desc: string | undefined, i: number, n: number) {
  const base = desc?.trim() || ""
  const tag = `(${i}/${n})`
  return base ? `${base} ${tag}` : tag
}
