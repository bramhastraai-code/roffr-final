export const WHATSAPP = '917035844444'

// Canonical group-buy discount claim.
//
// This same claim was previously written six different ways across the site
// (5–15%, 10–30%, 15%, 20%, 25%, 30%, "2 to 10%"). Anything that states the
// range as a CLAIM should read it from here so it can't drift again.
//
// Note the distinction: a case study saying "Anuj saved 10%" is a fact about
// one deal and stays as written. These constants are for general claims only.
export const DISCOUNT_MIN = 5
export const DISCOUNT_MAX = 15
export const DISCOUNT_RANGE = `${DISCOUNT_MIN}–${DISCOUNT_MAX}%`
export const DISCOUNT_UPTO = `up to ${DISCOUNT_MAX}%`

export function calcEMI(price, downPct, years, rate) {
  const down = price * downPct / 100
  const loan = price - down
  const r = rate / 12 / 100
  const n = years * 12
  const emi = r === 0 ? loan / n : (loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  return Math.round(emi)
}

export function fmtINRShort(n) {
  if (!n) return '₹0'
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2) + ' Cr'
  if (n >= 100000) return '₹' + (n / 100000).toFixed(1) + ' L'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}
