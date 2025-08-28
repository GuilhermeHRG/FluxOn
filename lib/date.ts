// app/lib/date.ts
export function monthFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

export function compareMonth(a: string, b: string): number {
  // retorna -1 se a<b, 0 se igual, 1 se a>b
  const [ay, am] = a.split("-").map(Number)
  const [by, bm] = b.split("-").map(Number)
  if (ay !== by) return ay < by ? -1 : 1
  if (am !== bm) return am < bm ? -1 : 1
  return 0
}

export function addMonths(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number)
  const base = new Date(y, m - 1 + delta, 1)
  const yy = base.getFullYear()
  const mm = String(base.getMonth() + 1).padStart(2, "0")
  return `${yy}-${mm}`
}
