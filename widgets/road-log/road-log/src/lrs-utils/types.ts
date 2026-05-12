// Shared types for LRS utility module

export interface LrsServiceInfo {
  currentVersion: number
  networkLayers: NetworkLayerInfo[]
  eventLayers: EventLayerInfo[]
  intersectionLayers: EventLayerInfo[]
}

export interface NetworkLayerInfo {
  id: number
  name: string
  type: string
  supportsLines: boolean
  routeIdFieldName: string
  routeNameFieldName: string | null
  unitsOfMeasure: string
  measurePrecision: number
  fields: FieldInfo[]
}

export interface EventLayerInfo {
  id: number
  name: string
  type: 'esriLRSPointEventLayer' | 'esriLRSLinearEventLayer' | 'esriLRSIntersectionLayer'
  fromMeasureFieldName?: string
  toMeasureFieldName?: string
  routeIdFieldName: string
  fields: FieldInfo[]
}

export interface FieldInfo {
  name: string
  alias: string
  type: string
  domain?: CodedValueDomain | null
}

export interface CodedValueDomain {
  type: 'codedValue'
  codedValues: Array<{ name: string; code: string | number }>
}

export interface RouteValues {
  routeId: string
  routeName: string | null
  isValid: boolean
}

export interface MeasureValues {
  measure: number | null
  isValid: boolean
}

export interface MeasureToGeometryLocation {
  routeId: string
  fromMeasure: number
  toMeasure?: number
  toRouteId?: string
}

export interface MeasureToGeometryResult {
  locations: Array<{
    status: string
    geometry: any
  }>
  spatialReference: any
}

export interface GeometryToMeasureResult {
  locations: Array<{
    status: string
    results: Array<{
      routeId: string
      measure: number
      geometry: any
    }>
  }>
  spatialReference: any
}

export interface QueryAttributeSetParams {
  locations: Array<{
    routeId: string
    fromMeasure: number
    toMeasure: number
  }>
  attributeSet: Array<{
    layerId: number
    fields: string[]
  }>
  outSR?: any
}

export interface FeatureSetResult {
  features: Array<{
    attributes: Record<string, any>
    geometry?: any
  }>
  fields: FieldInfo[]
  fieldAliases: Record<string, string>
  geometryType?: string
  spatialReference?: any
}

export interface EventLogEntry {
  RouteID: string
  RouteName: string
  Feature: string
  Location: string
  Measure: number
  Referent: string
  offset: string
  _sortMeasure: number
  _sortOrder: number
  [key: string]: any
}
