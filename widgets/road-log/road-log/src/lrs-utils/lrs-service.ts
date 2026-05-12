// LRS REST API Service wrapper
// Uses JSONP to bypass CORS issues with misconfigured servers (duplicate Access-Control-Allow-Origin headers)
import type {
  LrsServiceInfo,
  NetworkLayerInfo,
  EventLayerInfo,
  MeasureToGeometryLocation,
  MeasureToGeometryResult,
  GeometryToMeasureResult,
  QueryAttributeSetParams,
  FeatureSetResult
} from './types'

let jsonpCounter = 0

/**
 * JSONP request — bypasses CORS entirely by injecting a <script> tag.
 * ArcGIS REST API supports JSONP via the 'callback' parameter.
 */
function jsonpRequest (url: string, params: Record<string, string>): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = `_lrs_cb_${Date.now()}_${jsonpCounter++}`
    params.callback = callbackName

    const qs = new URLSearchParams(params).toString()
    const scriptUrl = `${url}?${qs}`

    const script = document.createElement('script')
    script.src = scriptUrl

    const cleanup = () => {
      delete (window as any)[callbackName]
      if (script.parentNode) script.parentNode.removeChild(script)
    }

    ;(window as any)[callbackName] = (data: any) => {
      cleanup()
      if (data.error) {
        reject(new Error(data.error.message || 'Request error'))
      } else {
        resolve(data)
      }
    }

    script.onerror = () => {
      cleanup()
      reject(new Error('JSONP request failed'))
    }

    const timer = setTimeout(() => {
      if ((window as any)[callbackName]) {
        cleanup()
        reject(new Error('Request timeout'))
      }
    }, 30000)

    ;(window as any)[callbackName] = (data: any) => {
      clearTimeout(timer)
      cleanup()
      if (data.error) {
        reject(new Error(data.error.message || 'Request error'))
      } else {
        resolve(data)
      }
    }

    document.head.appendChild(script)
  })
}

/**
 * Wrapper around ArcGIS LRS REST API (LRServer extension).
 * Uses JSONP for all requests to avoid CORS issues.
 */
export class LrsService {
  private baseUrl: string
  private token: string | null

  constructor (baseUrl: string, token?: string) {
    // Ensure no trailing slash
    this.baseUrl = baseUrl.replace(/\/+$/, '')
    this.token = token || null
  }

  setToken (token: string): void {
    this.token = token
  }

  /**
   * Fetch LRS service metadata (network layers, event layers, etc.)
   */
  async getServiceInfo (): Promise<LrsServiceInfo> {
    return this.request<LrsServiceInfo>('')
  }

  /**
   * Fetch detailed info for a network layer (fields, measure precision, etc.)
   */
  async getNetworkLayerInfo (layerId: number): Promise<NetworkLayerInfo> {
    return this.request<NetworkLayerInfo>(`/networkLayers/${layerId}`)
  }

  /**
   * Fetch detailed info for an event layer
   */
  async getEventLayerInfo (layerId: number): Promise<EventLayerInfo> {
    return this.request<EventLayerInfo>(`/eventLayers/${layerId}`)
  }

  /**
   * Convert route ID + measures to map geometry
   */
  async measureToGeometry (
    networkLayerId: number,
    locations: MeasureToGeometryLocation[],
    outSR?: any
  ): Promise<MeasureToGeometryResult> {
    const params: Record<string, string> = {
      locations: JSON.stringify(locations),
      f: 'json'
    }
    if (outSR) {
      params.outSR = JSON.stringify(outSR)
    }
    return this.request<MeasureToGeometryResult>(
      `/networkLayers/${networkLayerId}/measureToGeometry`,
      params
    )
  }

  /**
   * Convert map geometry (point) to route + measure
   */
  async geometryToMeasure (
    networkLayerId: number,
    locations: Array<{ geometry: any }>,
    outSR?: any
  ): Promise<GeometryToMeasureResult> {
    const params: Record<string, string> = {
      locations: JSON.stringify(locations),
      f: 'json'
    }
    if (outSR) {
      params.outSR = JSON.stringify(outSR)
    }
    return this.request<GeometryToMeasureResult>(
      `/networkLayers/${networkLayerId}/geometryToMeasure`,
      params
    )
  }

  /**
   * Dynamic segmentation overlay — queryAttributeSet
   */
  async queryAttributeSet (
    networkLayerId: number,
    params: QueryAttributeSetParams
  ): Promise<FeatureSetResult> {
    const requestParams: Record<string, string> = {
      locations: JSON.stringify(params.locations),
      attributeSet: JSON.stringify(params.attributeSet),
      f: 'json'
    }
    if (params.outSR) {
      requestParams.outSR = JSON.stringify(params.outSR)
    }
    return this.request<FeatureSetResult>(
      `/networkLayers/${networkLayerId}/queryAttributeSet`,
      requestParams
    )
  }

  /**
   * Standard feature query against a map service layer (for Road Log individual event queries)
   */
  async queryFeatures (
    mapServiceUrl: string,
    layerId: number,
    where: string,
    outFields: string[] = ['*']
  ): Promise<FeatureSetResult> {
    // The map service URL is the parent of LRServer extension
    // e.g. .../MapServer/0/query
    const baseMapUrl = this.baseUrl.replace(/\/exts\/LRServer$/i, '')
    const url = `${baseMapUrl}/${layerId}/query`

    const params: Record<string, string> = {
      where,
      outFields: outFields.join(','),
      returnGeometry: 'false',
      f: 'json'
    }
    if (this.token) {
      params.token = this.token
    }

    return jsonpRequest(url, params)
  }

  /**
   * Direct query with arbitrary params (for spatial queries via JSONP)
   */
  async queryFeaturesDirect (url: string, params: Record<string, string>): Promise<FeatureSetResult> {
    if (this.token) {
      params.token = this.token
    }
    params.f = params.f || 'json'
    return jsonpRequest(url, params)
  }

  /**
   * Query routes on a network layer (for route picker autocomplete)
   */
  async queryRoutes (
    networkLayerId: number,
    searchText: string,
    routeIdField: string,
    routeNameField: string | null,
    maxResults: number = 10
  ): Promise<Array<{ routeId: string; routeName: string | null }>> {
    const baseMapUrl = this.baseUrl.replace(/\/exts\/LRServer$/i, '')
    const url = `${baseMapUrl}/${networkLayerId}/query`

    const searchField = routeNameField || routeIdField
    const where = `UPPER(${searchField}) LIKE UPPER('${searchText.replace(/'/g, "''")}%')`
    const outFields = routeNameField
      ? [routeIdField, routeNameField]
      : [routeIdField]

    const params: Record<string, string> = {
      where,
      outFields: outFields.join(','),
      returnGeometry: 'false',
      resultRecordCount: maxResults.toString(),
      f: 'json'
    }
    if (this.token) {
      params.token = this.token
    }

    const json = await jsonpRequest(url, params)

    const all = (json.features || []).map((f: any) => ({
      routeId: f.attributes[routeIdField],
      routeName: routeNameField ? f.attributes[routeNameField] : null
    }))
    // Deduplicate by routeId
    const seen = new Set<string>()
    return all.filter((r: any) => {
      if (seen.has(r.routeId)) return false
      seen.add(r.routeId)
      return true
    })
  }

  // --- Private helpers ---

  private async request<T> (path: string, params?: Record<string, string>): Promise<T> {
    const url = `${this.baseUrl}${path}`
    const allParams: Record<string, string> = {
      f: 'json',
      ...params
    }
    if (this.token) {
      allParams.token = this.token
    }

    return jsonpRequest(url, allParams) as Promise<T>
  }
}
