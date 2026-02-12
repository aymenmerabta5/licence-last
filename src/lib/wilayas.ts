/**
 * 58 Algerian wilayas indexed by code - 1.
 * wilayaCode 1 → WILAYAS[0] ("Adrar"), etc.
 */
export const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna",
  "Béjaïa", "Biskra", "Béchar", "Blida", "Bouira",
  "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou",
  "Alger", "Djelfa", "Jijel", "Sétif", "Saïda",
  "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma", "Constantine",
  "Médéa", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arréridj", "Boumerdès",
  "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma",
  "Aïn Témouchent", "Ghardaïa", "Relizane",
  "El M'Ghair", "El Meniaa", "Ouled Djellal", "Bordj Badji Mokhtar",
  "Béni Abbès", "Timimoun", "Touggourt", "Djanet",
  "In Salah", "In Guezzam",
] as const

export type WilayaName = typeof WILAYAS[number]

/** Convert a 1-based wilaya code to its name. Returns null for invalid codes. */
export function getWilayaName(code: number | null | undefined): string | null {
  if (code == null || code < 1 || code > WILAYAS.length) return null
  return WILAYAS[code - 1]
}

/** Wilaya select option for form dropdowns — { value: number, label: "01 - Adrar" } */
export interface WilayaOption {
  value: number
  label: string
  disabled?: boolean
}

/**
 * Pre-computed wilaya options for SelectField components.
 * Format: `{ value: 1, label: "01 - Adrar" }`
 */
export const WILAYA_OPTIONS: WilayaOption[] = WILAYAS.map((name, i) => ({
  value: i + 1,
  label: `${String(i + 1).padStart(2, "0")} - ${name}`,
}))

/**
 * Wilaya options with a placeholder option prepended.
 * Useful for optional wilaya selection.
 */
export const WILAYA_OPTIONS_WITH_PLACEHOLDER: WilayaOption[] = [
  { value: 0, label: "Select a wilaya", disabled: true },
  ...WILAYA_OPTIONS,
]
