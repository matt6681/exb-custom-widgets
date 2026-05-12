// Domain utility — resolves coded value domains to display names
import type { FieldInfo, CodedValueDomain } from '../types'

/**
 * Get coded values for a field, considering subtypes if applicable.
 */
export function getCodedValues (
  field: FieldInfo | undefined,
  _eventLayer?: any,
  _attributes?: Record<string, any>
): Array<{ name: string; code: string | number }> | null {
  if (!field || !field.domain) return null
  if (field.domain.type !== 'codedValue') return null
  return (field.domain as CodedValueDomain).codedValues || null
}

/**
 * Find the display name for a code in a coded value list.
 */
export function findCodedValueName (
  codedValues: Array<{ name: string; code: string | number }>,
  code: any
): string | null {
  if (!codedValues || code === null || code === undefined) return null
  const match = codedValues.find(cv => cv.code === code || String(cv.code) === String(code))
  return match ? match.name : null
}

/**
 * Apply coded value domain resolution to a feature set.
 * Replaces raw codes with their display names in-place.
 */
export function applyDomains (
  features: Array<{ attributes: Record<string, any> }>,
  fields: FieldInfo[]
): void {
  for (const feature of features) {
    for (const field of fields) {
      if (!field.domain || field.domain.type !== 'codedValue') continue
      const fieldName = field.name
      if (!(fieldName in feature.attributes)) continue

      const code = feature.attributes[fieldName]
      const codedValues = (field.domain as CodedValueDomain).codedValues
      const name = findCodedValueName(codedValues, code)
      if (name !== null && name !== code) {
        feature.attributes[fieldName] = name
      }
    }
  }
}

/**
 * Apply field aliases to feature attributes.
 * Replaces field names with their alias as the key.
 */
export function applyAliases (
  features: Array<{ attributes: Record<string, any> }>,
  fieldAliases: Record<string, string>,
  extraFields?: Record<string, any>
): void {
  for (const feature of features) {
    const updatedAttr: Record<string, any> = { ...extraFields }
    for (const [fieldName, value] of Object.entries(feature.attributes)) {
      if (fieldName.startsWith('OBJECTID')) continue
      const alias = fieldAliases[fieldName] || fieldName
      updatedAttr[alias] = value
    }
    feature.attributes = updatedAttr
  }
}

/**
 * Apply measure precision rounding to measure fields.
 */
export function applyMeasurePrecision (
  features: Array<{ attributes: Record<string, any> }>,
  measureFields: string[],
  precision: number
): void {
  const factor = Math.pow(10, precision)
  for (const feature of features) {
    for (const field of measureFields) {
      if (field in feature.attributes && feature.attributes[field] !== null) {
        feature.attributes[field] = Math.round(feature.attributes[field] * factor) / factor
      }
    }
  }
}
