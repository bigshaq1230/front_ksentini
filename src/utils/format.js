const LOCALE = 'fr-TN'
const CURRENCY = 'TND'
const TIME_ZONE = 'Africa/Tunis'

// Whole amounts as "1 200 DT", otherwise millimes as "450,500 DT".
const moneyWhole = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })
const moneyExact = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, minimumFractionDigits: 3 })
export function formatMoney(n) {
  if (n === null || n === undefined || n === '') return '—'
  const v = Math.round(Number(n) * 1000) / 1000
  return (Number.isInteger(v) ? moneyWhole : moneyExact).format(v)
}

function parseDate(s) {
  // 'YYYY-MM-DD' (local day) or SQLite 'YYYY-MM-DD HH:MM:SS' (UTC)
  return s.length === 10 ? new Date(`${s}T00:00:00`) : new Date(`${s.replace(' ', 'T')}Z`)
}

export function formatDate(s) {
  if (!s) return '—'
  return parseDate(s).toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIME_ZONE })
}

export function greeting() {
  const now = new Date()
  const hour = Number(now.toLocaleString('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: TIME_ZONE }))
  const date = now.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE })
  return { hello: hour >= 18 ? 'Bonsoir' : 'Bonjour', date }
}

export const today = () => new Date().toLocaleDateString('sv-SE', { timeZone: TIME_ZONE }) // YYYY-MM-DD

export function daysSince(s) {
  if (!s) return null
  return Math.max(0, Math.floor((parseDate(today()) - parseDate(s.slice(0, 10))) / 86400000))
}

export const JOB_STATUSES = {
  quote: { label: 'Devis', color: 'bg-amber-100 text-amber-800', bar: 'bg-amber-400', tile: 'bg-amber-100 text-amber-600' },
  in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800', bar: 'bg-blue-500', tile: 'bg-blue-100 text-blue-600' },
  done: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-800', bar: 'bg-emerald-500', tile: 'bg-emerald-100 text-emerald-600' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700', bar: 'bg-red-400', tile: 'bg-red-100 text-red-500' },
}
// Normal progression of a job, shown as a stepper.
export const STATUS_FLOW = ['quote', 'in_progress', 'done']

export const VEHICLE_TYPES = {
  car: 'Voiture',
  motorcycle: 'Moto',
  bike: 'Vélo',
  other: 'Autre',
}

export const ITEM_KINDS = {
  labor: "Main-d'œuvre",
  part: 'Pièce',
  paint: 'Peinture',
  other: 'Autre',
}

export const PHOTO_PHASES = {
  before: 'Avant',
  during: 'Pendant',
  after: 'Après',
}

export function vehicleTitle(v) {
  const name = [v.make, v.model].filter(Boolean).join(' ') || VEHICLE_TYPES[v.type ?? v.vehicle_type] || 'Véhicule'
  return v.year ? `${name} (${v.year})` : name
}

// --- Tunisian plates: "123 TUN 1234" (series + number) or "TN 12345" --------

export function parsePlate(plate) {
  const s = (plate ?? '').toUpperCase().replace(/[\s-]/g, '')
  const empty = { series: '', number: '', text: '' }
  let m = s.match(/^(\d{1,3})TUN(\d{1,4})$/)
  if (m) return { ...empty, kind: 'tun', series: m[1], number: m[2] }
  m = s.match(/^TN(\d{1,6})$/)
  if (m) return { ...empty, kind: 'tn', number: m[1] }
  return { ...empty, kind: s ? 'other' : 'tun', text: (plate ?? '').toUpperCase().trim() }
}

export function formatPlate(p) {
  if (p.kind === 'tun') return p.series || p.number ? `${p.series} TUN ${p.number}`.trim() : ''
  if (p.kind === 'tn') return p.number ? `TN ${p.number}` : ''
  return (p.text ?? '').toUpperCase().trim()
}

export const normalizePlate = (plate) => (plate ?? '').toUpperCase().replace(/[\s-]/g, '')

// --- Phones (Tunisia: 8 digits, +216) ----------------------------------------

export function whatsappUrl(phone) {
  let digits = (phone ?? '').replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 8) digits = '216' + digits
  return digits.length >= 10 ? `https://wa.me/${digits}` : null
}

// --- Quotes ------------------------------------------------------------------

export const quoteNumber = (job) => `D${(job.date_in ?? job.created_at ?? today()).slice(0, 4)}-${String(job.id).padStart(4, '0')}`

export function quoteTotals(items, vatRate) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const vat = vatRate > 0 ? Math.round(subtotal * vatRate * 10) / 1000 : 0
  return { subtotal, vat, total: subtotal + vat }
}

export function addDays(ymd, days) {
  const d = new Date(`${ymd}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
