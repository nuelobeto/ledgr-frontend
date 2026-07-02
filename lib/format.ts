// No Currency field exists anywhere in the schema yet (Transaction, RecurringTransaction, User
// all omit it) — the app implicitly assumes a single currency. Hardcoding USD here until a
// real currency field/setting exists; centralizing it in one function makes that a one-line
// change later instead of a find-and-replace.
export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount)
}
