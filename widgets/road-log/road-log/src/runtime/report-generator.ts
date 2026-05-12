// Report generation logic for Road Log widget
// Outputs CSV matching route2log format: RouteID, description, Measure, Referent, offset

import { LrsService } from '../lrs-utils/lrs-service'
import { applyMeasurePrecision } from '../lrs-utils/utils/domain-utils'
import { resolveKnownDomain } from '../lrs-utils/utils/known-domains'
import type { EventLayerConfig } from '../config'
import type { EventLogEntry, FieldInfo } from '../lrs-utils/types'

export interface ReportParams {
  routeId: string
  routeName: string | null
  fromMeasure: number
  toMeasure: number | null
  routeTotalLength: number | null
  eventLayers: EventLayerConfig[]
  measurePrecision: number
}

export interface MultiRouteReportParams {
  routes: Array<{ routeId: string; routeName: string | null; fromMeasure: number; toMeasure: number | null }>
  eventLayers: EventLayerConfig[]
  measurePrecision: number
}

export interface ReportResult {
  entries: EventLogEntry[]
}

/**
 * Build the where clause for querying an event layer based on route/measures.
 */
function getWhereClause (
  routeId: string,
  fromMeasure: number,
  toMeasure: number | null,
  eventType: string,
  routeIdField: string,
  measureField: string,
  fromMeasureField: string,
  toMeasureField: string
): string {
  const routeClause = `${routeIdField} = '${routeId.replace(/'/g, "''")}'`

  // If no toMeasure and fromMeasure is 0, return all events on route
  if (toMeasure === null && fromMeasure === 0) {
    return routeClause
  }

  if (eventType === 'esriLRSPointEventLayer' || eventType === 'esriLRSIntersectionLayer') {
    if (toMeasure !== null) {
      return `${routeClause} AND ${measureField} >= ${fromMeasure} AND ${measureField} <= ${toMeasure}`
    }
    return `${routeClause} AND ${measureField} = ${fromMeasure}`
  }

  // Linear events: overlapping range
  if (toMeasure !== null) {
    return `${routeClause} AND ${fromMeasureField} <= ${toMeasure} AND ${toMeasureField} >= ${fromMeasure}`
  }
  return `${routeClause} AND ${fromMeasureField} <= ${fromMeasure} AND ${toMeasureField} >= ${fromMeasure}`
}

/**
 * Resolve a field value to a display string using domain overrides, service domains, or known domains.
 */
function resolveValue (
  fieldName: string,
  value: any,
  domainOverrides?: { [fieldName: string]: { [code: string]: string } },
  layerFields?: FieldInfo[]
): string {
  if (value === null || value === undefined) return ''

  // 0. Date fields — format epoch milliseconds as readable date/time
  const field = layerFields?.find(f => f.name === fieldName)
  if (field?.type === 'esriFieldTypeDate' && typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString()
  }

  // 1. Config-level domainOverrides
  const overrideName = domainOverrides?.[fieldName]?.[String(value)]
  if (overrideName) return overrideName

  // 2. Service coded value domains
  const codedValues = field?.domain?.type === 'codedValue' ? field.domain.codedValues : null
  const codedName = codedValues?.find(cv => String(cv.code) === String(value))?.name
  if (codedName) return codedName

  // 3. Built-in known domains (e.g. FHWA functional class)
  const knownName = resolveKnownDomain(fieldName, value)
  if (knownName) return knownName

  return String(value)
}

/**
 * Generate the Road Log report.
 * Output format: RouteID, description, Measure, Referent, offset
 */
export async function generateReport (
  lrsService: LrsService,
  params: ReportParams
): Promise<ReportResult> {
  const {
    routeId, fromMeasure, toMeasure,
    eventLayers, measurePrecision
  } = params

  const effectiveToMeasure = toMeasure
  const entries: EventLogEntry[] = []

  // Query each event layer
  const queryPromises = eventLayers.map(async (eventLayerConfig) => {
    const routeIdField = eventLayerConfig.routeIdField || 'routeid'
    const measureField = eventLayerConfig.measureField || 'measure'
    const fromMeasureField = eventLayerConfig.fromMeasureField || 'from_measure'
    const toMeasureField = eventLayerConfig.toMeasureField || 'to_measure'

    const where = getWhereClause(
      routeId, fromMeasure, effectiveToMeasure,
      eventLayerConfig.type, routeIdField,
      measureField, fromMeasureField, toMeasureField
    )

    try {
      const featureSet = await lrsService.queryFeatures(
        '', eventLayerConfig.layerId, where, ['*']
      )

      if (!featureSet.features) return

      // Apply measure precision
      const measFields = eventLayerConfig.type === 'esriLRSPointEventLayer'
        ? [measureField]
        : [fromMeasureField, toMeasureField]
      applyMeasurePrecision(featureSet.features, measFields, measurePrecision)

      const layerFields = featureSet.fields || []
      const attrFields = eventLayerConfig.attributes

      let eventCounter = 0

      for (const feature of featureSet.features) {
        const attrs = feature.attributes

        // Build detail columns for all configured attributes
        const details: Record<string, string> = {}
        const rawValues: Record<string, any> = {}
        const fieldTypes: Record<string, string> = {}
        for (const fieldName of attrFields) {
          details[fieldName] = resolveValue(fieldName, attrs[fieldName], eventLayerConfig.domainOverrides, layerFields)
          rawValues[fieldName] = attrs[fieldName]
          const fi = layerFields.find(f => f.name === fieldName)
          if (fi) fieldTypes[fieldName] = fi.type
        }

        // Resolve route name: prefer params, then fall back to event layer data
        const rName = params.routeName || details.RouteName || details.routename || details.ROUTENAME || ''

        if (eventLayerConfig.type === 'esriLRSPointEventLayer' ||
            eventLayerConfig.type === 'esriLRSIntersectionLayer') {
          const meas = attrs[measureField] ?? 0
          entries.push({
            ...details,
            RouteID: routeId,
            RouteName: rName,
            Feature: eventLayerConfig.name,
            Location: 'Point',
            Measure: meas,
            Referent: '',
            offset: '',
            _sortMeasure: meas,
            _sortOrder: 2,
            _eventLayer: eventLayerConfig.name,
            _eventType: 'Point',
            _rawValues: rawValues,
            _fieldTypes: fieldTypes
          })
        } else {
          eventCounter++
          const eventId = `${eventLayerConfig.name}-${routeId}-${eventCounter}`
          const rawStart = attrs[fromMeasureField] ?? 0
          const rawEnd = attrs[toMeasureField] ?? 0
          const eventStart = (effectiveToMeasure !== null && rawStart < fromMeasure) ? fromMeasure : rawStart
          const eventEnd = (effectiveToMeasure !== null && rawEnd > effectiveToMeasure) ? effectiveToMeasure : rawEnd

          entries.push({
            ...details,
            RouteID: routeId,
            RouteName: rName,
            Feature: eventLayerConfig.name,
            Location: 'Begin',
            EventID: eventId,
            Measure: eventStart,
            Referent: '',
            offset: '',
            _sortMeasure: eventStart,
            _sortOrder: 1,
            _eventLayer: eventLayerConfig.name,
            _eventType: 'Linear',
            _rawValues: rawValues,
            _fieldTypes: fieldTypes
          })
          entries.push({
            ...details,
            RouteID: routeId,
            RouteName: rName,
            Feature: eventLayerConfig.name,
            Location: 'End',
            EventID: eventId,
            Measure: eventEnd,
            Referent: '',
            offset: '',
            _sortMeasure: eventEnd,
            _sortOrder: 3,
            _eventLayer: eventLayerConfig.name,
            _eventType: 'Linear',
            _rawValues: rawValues,
            _fieldTypes: fieldTypes
          })
        }
      }
    } catch (err) {
      console.warn(`Failed to query event layer ${eventLayerConfig.name}:`, err)
    }
  })

  await Promise.all(queryPromises)

  // Sort by measure, then by sort order
  entries.sort((a, b) => {
    if (a._sortMeasure !== b._sortMeasure) return a._sortMeasure - b._sortMeasure
    return a._sortOrder - b._sortOrder
  })

  return { entries }
}

/**
 * Generate a Road Log report for multiple routes (from polygon select).
 * Queries all events for each route (no measure filter).
 */
export async function generateMultiRouteReport (
  lrsService: LrsService,
  params: MultiRouteReportParams
): Promise<ReportResult> {
  const allEntries: EventLogEntry[] = []

  for (const route of params.routes) {
    const singleParams: ReportParams = {
      routeId: route.routeId,
      routeName: route.routeName,
      fromMeasure: route.fromMeasure,
      toMeasure: route.toMeasure,
      routeTotalLength: null,
      eventLayers: params.eventLayers,
      measurePrecision: params.measurePrecision
    }
    const result = await generateReport(lrsService, singleParams)
    allEntries.push(...result.entries)
  }

  // Sort by RouteID then measure
  allEntries.sort((a, b) => {
    if (a.RouteID !== b.RouteID) return a.RouteID.localeCompare(b.RouteID)
    if (a._sortMeasure !== b._sortMeasure) return a._sortMeasure - b._sortMeasure
    return a._sortOrder - b._sortOrder
  })

  return { entries: allEntries }
}
