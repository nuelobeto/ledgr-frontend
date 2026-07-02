import { Frequency } from "./types"

const UNIT_LABELS: Record<Frequency, [singular: string, plural: string]> = {
  Daily: ["day", "days"],
  Weekly: ["week", "weeks"],
  Monthly: ["month", "months"],
  Yearly: ["year", "years"],
}

// "Every day" / "Every week" for interval 1, "Every 2 weeks" for interval > 1 — matches
// RecurringTransaction.Interval's own doc comment ("every N" → fortnightly = Weekly, 2).
export function formatFrequency(frequency: Frequency, interval: number): string {
  const [singular, plural] = UNIT_LABELS[frequency]
  return interval > 1 ? `Every ${interval} ${plural}` : `Every ${singular}`
}
