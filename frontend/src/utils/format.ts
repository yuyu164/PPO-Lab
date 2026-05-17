export function formatNumber(n: number, digits: number = 4): string {
  return n.toFixed(digits)
}

export function formatPercent(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export function formatEpoch(n: number): string {
  return `Epoch ${n}`
}
