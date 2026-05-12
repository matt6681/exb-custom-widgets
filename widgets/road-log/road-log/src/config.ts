import type { ImmutableObject } from 'seamless-immutable'

export interface DomainMapping {
  [code: string]: string
}

export interface EventLayerConfig {
  layerId: number
  name: string
  type: 'esriLRSPointEventLayer' | 'esriLRSLinearEventLayer' | 'esriLRSIntersectionLayer'
  attributes: string[]
  routeIdField: string
  measureField?: string
  fromMeasureField?: string
  toMeasureField?: string
  domainOverrides?: { [fieldName: string]: DomainMapping }
}

export interface Config {
  lrsServiceUrl: string
  networkLayerId: number
  networkRouteIdField: string
  networkRouteNameField: string
  eventLayerConfigs: EventLayerConfig[]
  measurePrecision: number
}

export type IMConfig = ImmutableObject<Config>
