// Well-known coded value domains for common LRS fields.
// These provide human-readable labels when the service lacks coded value domains.

export interface KnownDomainMap {
  [fieldName: string]: { [code: string]: string }
}

/**
 * FHWA Functional Classification System
 * https://www.fhwa.dot.gov/planning/processes/statewide/related/highway_functional_classifications/
 */
const FHWA_FUNCTIONAL_CLASS: { [code: string]: string } = {
  '0': 'Unknown',
  '1': 'Rural Interstate',
  '2': 'Rural Principal Arterial',
  '3': 'Rural Minor Arterial',
  '4': 'Rural Major Collector',
  '5': 'Rural Minor Collector',
  '6': 'Rural Local',
  '7': 'Urban Interstate',
  '8': 'Urban Freeway/Expressway',
  '9': 'Urban Principal Arterial',
  '10': 'Urban Minor Arterial',
  '11': 'Urban Collector',
  '12': 'Urban Local'
}

/**
 * Map of field names to their known domain lookups.
 * Field name matching is case-sensitive.
 */
export const KNOWN_DOMAINS: KnownDomainMap = {
  functionalclasstype: FHWA_FUNCTIONAL_CLASS,
  functionalclass: FHWA_FUNCTIONAL_CLASS,
  functional_class: FHWA_FUNCTIONAL_CLASS,
  func_class: FHWA_FUNCTIONAL_CLASS,
  FunctionalClassType: FHWA_FUNCTIONAL_CLASS,
  FunctionalClass: FHWA_FUNCTIONAL_CLASS
}

/**
 * Resolve a raw code to a display label using known domains.
 * Returns null if no mapping exists.
 */
export function resolveKnownDomain (fieldName: string, code: any): string | null {
  const domain = KNOWN_DOMAINS[fieldName]
  if (!domain) return null
  const key = String(code)
  return domain[key] ?? null
}
