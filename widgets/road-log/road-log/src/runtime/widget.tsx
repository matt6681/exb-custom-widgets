/** @jsxRuntime classic */
import { React, type AllWidgetProps, SessionManager } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { IMConfig } from '../config'
import { LrsService } from '../lrs-utils/lrs-service'
import { exportCSV } from '../lrs-utils/utils/csv-export'
import { KNOWN_DOMAINS } from '../lrs-utils/utils/known-domains'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { generateReport, generateMultiRouteReport, type ReportParams, type MultiRouteReportParams } from './report-generator'
import StraightLineDiagram from './straight-line-diagram'

const { useState, useCallback, useRef, useEffect } = React

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const config = props.config
  const hasMapWidget = Boolean(props.useMapWidgetIds && (props.useMapWidgetIds as any).length > 0 || (props.useMapWidgetIds as any)?.size > 0)

  // State
  const [routeId, setRouteId] = useState('')
  const [routeName, setRouteName] = useState('')
  const [fromMeasure, setFromMeasure] = useState('')
  const [toMeasure, setToMeasure] = useState('')
  const [routeMeasureRange, setRouteMeasureRange] = useState<{ min: number; max: number } | null>(null)
  const [searchMode, setSearchMode] = useState<'name' | 'id' | 'map'>('id')
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastReportEntries, setLastReportEntries] = useState<any[] | null>(null)
  const [showDiagram, setShowDiagram] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLayerName, setShareLayerName] = useState('')
  const [sharing, setSharing] = useState(false)
  const [shareProgress, setShareProgress] = useState('')
  const [shareResultUrl, setShareResultUrl] = useState('')
  const [createCrashDashboard, setCreateCrashDashboard] = useState(false)
  const [routeSuggestions, setRouteSuggestions] = useState<Array<{ routeId: string; routeName: string | null }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Map / polygon draw state
  const [drawing, setDrawing] = useState(false)
  const [pickingFromMap, setPickingFromMap] = useState(false)
  const [pickingMeasure, setPickingMeasure] = useState<'from' | 'to' | null>(null)
  const [routePickCandidates, setRoutePickCandidates] = useState<Array<{ routeId: string; routeName: string }> | null>(null)
  const measurePickHandlerRef = useRef<any>(null)
  const measurePickHoverRef = useRef<any>(null)
  const measureSnapGraphicRef = useRef<any>(null)
  const measureTooltipRef = useRef<HTMLDivElement | null>(null)
  const pickHandlerRef = useRef<any>(null)
  const pickHoverHandlerRef = useRef<any>(null)
  const pickTooltipRef = useRef<HTMLDivElement | null>(null)
  const pickHoverTimeoutRef = useRef<any>(null)
  const pickSnapGraphicRef = useRef<any>(null)
  // Visualization graphics for selected route + measure points
  const routePreviewGraphicRef = useRef<any>(null)
  const routePreviewLayerRef = useRef<any>(null)
  const fromMeasureGraphicRef = useRef<any>(null)
  const toMeasureGraphicRef = useRef<any>(null)
  const routePreviewVertsRef = useRef<{ vertices: number[][]; mIdx: number } | null>(null)
  const showRoutePreviewRef = useRef<(rid: string, autoFillMeasures?: boolean) => void>(() => {})
  const showMeasurePointRef = useRef<(which: 'from' | 'to', measureVal: string) => void>(() => {})
  const [mapRoutes, setMapRoutes] = useState<Array<{ routeId: string; routeName: string | null; fromMeasure: number; toMeasure: number | null }>>([])
  const [selectedMapRouteIds, setSelectedMapRouteIds] = useState<Set<string>>(new Set())
  const jimuMapViewRef = useRef<JimuMapView | null>(null)
  const sketchVMRef = useRef<any>(null)
  const graphicsLayerRef = useRef<any>(null)
  const routeGraphicsLayerRef = useRef<any>(null)
  const eventGraphicsLayersRef = useRef<Map<string, any>>(new Map())
  const layerVisibilityWatchesRef = useRef<any[]>([])
  const [mapDisabledLayers, setMapDisabledLayers] = useState<Set<string>>(new Set())
  const [eventsOnMap, setEventsOnMap] = useState(false)
  const routeGeometriesRef = useRef<Map<string, { vertices: number[][]; mIdx: number }>>(new Map())

  const lrsServiceRef = useRef<LrsService | null>(null)
  const searchTimeoutRef = useRef<any>(null)

  // Initialize LRS service
  useEffect(() => {
    if (config?.lrsServiceUrl) {
      lrsServiceRef.current = new LrsService(config.lrsServiceUrl)
    }
  }, [config?.lrsServiceUrl])

  // Initialize selected events (all selected by default)
  useEffect(() => {
    if (config?.eventLayerConfigs) {
      setSelectedEvents(new Set(config.eventLayerConfigs.map(e => e.layerId)))
    }
  }, [config?.eventLayerConfigs])

  // Route search with debounce
  const handleRouteSearch = useCallback((value: string) => {
    if (searchMode === 'id') {
      setRouteId(value)
      setRouteName('')
    } else {
      setRouteName(value)
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

    if (value.length < 2 || !lrsServiceRef.current) {
      setRouteSuggestions([])
      setShowSuggestions(false)
      return
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await lrsServiceRef.current!.queryRoutes(
          config.networkLayerId,
          value,
          config.networkRouteIdField || 'customroutefield',
          searchMode === 'name' ? (config.networkRouteNameField || 'route_name') : null,
          10
        )
        setRouteSuggestions(results)
        setShowSuggestions(results.length > 0)
      } catch {
        setRouteSuggestions([])
        setShowSuggestions(false)
      }
    }, 300)
  }, [config?.networkLayerId, searchMode])

  const selectRoute = useCallback((route: { routeId: string; routeName: string | null }) => {
    setRouteId(route.routeId)
    setRouteName(route.routeName || '')
    setShowSuggestions(false)
    showRoutePreviewRef.current(route.routeId, true)
  }, [])

  // Pick route from map click
  const startPickFromMap = useCallback(() => {
    if (!jimuMapViewRef.current?.view || !config || !lrsServiceRef.current) return
    const view = jimuMapViewRef.current.view as __esri.MapView

    // Remove any previous handlers
    if (pickHandlerRef.current) { pickHandlerRef.current.remove(); pickHandlerRef.current = null }
    if (pickHoverHandlerRef.current) { pickHoverHandlerRef.current.remove(); pickHoverHandlerRef.current = null }

    setPickingFromMap(true)
    view.container.style.cursor = 'crosshair'

    // Pre-load SystemJS modules for snap graphic
    const modulesPromise = Promise.all([
      (window as any).SystemJS.import('esri/Graphic').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/geometry/Point').then((m: any) => m.default || m)
    ])

    // Create tooltip element
    if (!pickTooltipRef.current) {
      const tip = document.createElement('div')
      tip.style.cssText = 'position:absolute;pointer-events:none;background:#333;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;z-index:99999;display:none;box-shadow:0 2px 6px rgba(0,0,0,0.3);'
      view.container.appendChild(tip)
      pickTooltipRef.current = tip
    }
    const tooltip = pickTooltipRef.current!
    tooltip.style.display = 'none'

    // Pointer-move handler: query routes under cursor and show tooltip
    const routeField = config.networkRouteIdField || 'customroutefield'
    const routeNameField = config.networkRouteNameField || 'route_name'
    const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '')
    const queryUrl = `${baseMapUrl}/${config.networkLayerId}/query`
    const outFields = `${routeField},${routeNameField}`
    const viewWkid = view.spatialReference?.wkid || 102100
    let lastQueryId = 0

    // Cache for route geometries from last query
    let cachedPaths: number[][][][] = [] // array of features' paths
    let cachedLabels: string[] = []
    let lastQueryPt: { x: number; y: number } | null = null
    const REQUERY_DIST = 80 // meters — re-query when cursor moves this far from last query point

    // Helper: snap to nearest point on cached paths
    function snapToNearest (px: number, py: number): { x: number; y: number } | null {
      let bestDist = Infinity, bestX = px, bestY = py
      for (const paths of cachedPaths) {
        for (const path of paths) {
          for (let i = 0; i < path.length - 1; i++) {
            const [ax, ay] = path[i]
            const [bx, by] = path[i + 1]
            const dx = bx - ax, dy = by - ay
            const lenSq = dx * dx + dy * dy
            if (lenSq === 0) continue
            let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
            t = Math.max(0, Math.min(1, t))
            const cx = ax + t * dx, cy = ay + t * dy
            const d = (px - cx) * (px - cx) + (py - cy) * (py - cy)
            if (d < bestDist) { bestDist = d; bestX = cx; bestY = cy }
          }
        }
      }
      return bestDist < Infinity ? { x: bestX, y: bestY } : null
    }

    pickHoverHandlerRef.current = view.on('pointer-move', async (event: any) => {
      // Position tooltip near cursor (top-right)
      tooltip.style.left = `${event.x + 14}px`
      tooltip.style.top = `${event.y - 40}px`

      const mapPoint = view.toMap({ x: event.x, y: event.y })
      if (!mapPoint) return

      // Immediately snap using cached geometry
      if (cachedPaths.length > 0) {
        const snap = snapToNearest(mapPoint.x, mapPoint.y)
        if (snap) {
          const [Graphic, SimpleMarkerSymbol, Point] = await modulesPromise
          if (pickSnapGraphicRef.current) {
            // Update existing graphic's geometry for instant movement
            pickSnapGraphicRef.current.geometry = new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference })
          } else {
            const snapGraphic = new Graphic({
              geometry: new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference }),
              symbol: new SimpleMarkerSymbol({
                color: [0, 122, 255, 255],
                size: 10,
                outline: { color: [255, 255, 255], width: 2 }
              })
            })
            pickSnapGraphicRef.current = snapGraphic
            view.graphics.add(snapGraphic)
          }
        }
      }

      // Check if we need to re-query (cursor moved far from last query point)
      if (lastQueryPt) {
        const dx = mapPoint.x - lastQueryPt.x
        const dy = mapPoint.y - lastQueryPt.y
        if (Math.sqrt(dx * dx + dy * dy) < REQUERY_DIST) return
      }

      // Debounce the server query
      if (pickHoverTimeoutRef.current) clearTimeout(pickHoverTimeoutRef.current)
      pickHoverTimeoutRef.current = setTimeout(async () => {
        const queryId = ++lastQueryId
        try {
          const params: Record<string, string> = {
            geometry: JSON.stringify(mapPoint.toJSON()),
            geometryType: 'esriGeometryPoint',
            spatialRel: 'esriSpatialRelIntersects',
            distance: '50',
            units: 'esriSRUnit_Meter',
            outFields,
            returnGeometry: 'true',
            outSR: String(viewWkid),
            resultRecordCount: '5',
            f: 'json'
          }
          const json = await lrsServiceRef.current!.queryFeaturesDirect(queryUrl, params)
          if (queryId !== lastQueryId) return // stale
          lastQueryPt = { x: mapPoint.x, y: mapPoint.y }

          if (json.features?.length > 0) {
            // Update cache
            cachedPaths = json.features.map((f: any) => f.geometry?.paths || [])
            cachedLabels = json.features.map((f: any) => {
              const rid = f.attributes[routeField] || ''
              let rname = f.attributes[routeNameField] || ''
              if (!rname) {
                const nameKey = Object.keys(f.attributes).find(k => k.toLowerCase() === routeNameField.toLowerCase())
                if (nameKey) rname = f.attributes[nameKey] || ''
              }
              return rname ? `${rname} (${rid})` : rid
            })
            tooltip.textContent = cachedLabels.join('\n')
            tooltip.style.whiteSpace = cachedLabels.length > 1 ? 'pre-line' : 'nowrap'
            tooltip.style.display = 'block'

            // Update snap with fresh geometry
            const snap = snapToNearest(mapPoint.x, mapPoint.y)
            if (snap) {
              const [Graphic, SimpleMarkerSymbol, Point] = await modulesPromise
              if (queryId !== lastQueryId) return
              if (pickSnapGraphicRef.current) {
                pickSnapGraphicRef.current.geometry = new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference })
              } else {
                const snapGraphic = new Graphic({
                  geometry: new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference }),
                  symbol: new SimpleMarkerSymbol({
                    color: [0, 122, 255, 255],
                    size: 10,
                    outline: { color: [255, 255, 255], width: 2 }
                  })
                })
                pickSnapGraphicRef.current = snapGraphic
                view.graphics.add(snapGraphic)
              }
            }
          } else {
            cachedPaths = []
            cachedLabels = []
            tooltip.style.display = 'none'
            if (pickSnapGraphicRef.current) {
              view.graphics.remove(pickSnapGraphicRef.current)
              pickSnapGraphicRef.current = null
            }
          }
        } catch {
          tooltip.style.display = 'none'
        }
      }, 100)
    })

    pickHandlerRef.current = view.on('click', async (event: any) => {
      // Remove handlers after one click
      if (pickHandlerRef.current) { pickHandlerRef.current.remove(); pickHandlerRef.current = null }
      if (pickHoverHandlerRef.current) { pickHoverHandlerRef.current.remove(); pickHoverHandlerRef.current = null }
      if (pickHoverTimeoutRef.current) clearTimeout(pickHoverTimeoutRef.current)
      if (pickSnapGraphicRef.current) { view.graphics.remove(pickSnapGraphicRef.current); pickSnapGraphicRef.current = null }
      tooltip.style.display = 'none'
      view.container.style.cursor = ''
      setPickingFromMap(false)

      // Query the network layer at the click point
      try {
        const params: Record<string, string> = {
          geometry: JSON.stringify(event.mapPoint.toJSON()),
          geometryType: 'esriGeometryPoint',
          spatialRel: 'esriSpatialRelIntersects',
          distance: '50',
          units: 'esriSRUnit_Meter',
          outFields,
          returnGeometry: 'false',
          resultRecordCount: '10',
          f: 'json'
        }

        const json = await lrsServiceRef.current!.queryFeaturesDirect(queryUrl, params)
        if (json.features?.length > 1) {
          // Multiple routes at this point — show disambiguation dialog
          const candidates = json.features.map((f: any) => {
            const attrs = f.attributes
            const rid = attrs[routeField] || ''
            let rname = attrs[routeNameField] || ''
            if (!rname) {
              const nameKey = Object.keys(attrs).find(k => k.toLowerCase() === routeNameField.toLowerCase())
              if (nameKey) rname = attrs[nameKey] || ''
            }
            return { routeId: rid, routeName: rname || rid }
          })
          // De-duplicate by routeId
          const seen = new Set<string>()
          const unique = candidates.filter((c: any) => { if (seen.has(c.routeId)) return false; seen.add(c.routeId); return true })
          if (unique.length > 1) {
            setRoutePickCandidates(unique)
          } else {
            setRouteId(unique[0].routeId)
            setRouteName(unique[0].routeName)
            showRoutePreviewRef.current(unique[0].routeId, false)
          }
        } else if (json.features?.length === 1) {
          const attrs = json.features[0].attributes
          const rid = attrs[routeField] || ''
          let rname = attrs[routeNameField] || ''
          if (!rname) {
            const nameKey = Object.keys(attrs).find(k => k.toLowerCase() === routeNameField.toLowerCase())
            if (nameKey) rname = attrs[nameKey] || ''
          }
          setRouteId(rid)
          setRouteName(rname || rid)
          showRoutePreviewRef.current(rid, false)
        } else {
          setError('No route found at that location')
        }
      } catch (err: any) {
        setError('Failed to identify route: ' + (err.message || err))
      }
    })
  }, [config])

  // Cancel pick from map
  const cancelPickFromMap = useCallback(() => {
    if (pickHandlerRef.current) {
      pickHandlerRef.current.remove()
      pickHandlerRef.current = null
    }
    if (pickHoverHandlerRef.current) {
      pickHoverHandlerRef.current.remove()
      pickHoverHandlerRef.current = null
    }
    if (pickHoverTimeoutRef.current) clearTimeout(pickHoverTimeoutRef.current)
    if (pickTooltipRef.current) pickTooltipRef.current.style.display = 'none'
    if (pickSnapGraphicRef.current && jimuMapViewRef.current?.view) {
      (jimuMapViewRef.current.view as any).graphics.remove(pickSnapGraphicRef.current)
      pickSnapGraphicRef.current = null
    }
    if (jimuMapViewRef.current?.view) {
      (jimuMapViewRef.current.view as any).container.style.cursor = ''
    }
    setPickingFromMap(false)
  }, [])

  // Pick measure from map — click on a route to get its M value at that point
  const startPickMeasure = useCallback((which: 'from' | 'to') => {
    if (!jimuMapViewRef.current?.view || !config || !lrsServiceRef.current) return
    if (!routeId.trim()) { setError('Select a route first'); return }
    const view = jimuMapViewRef.current.view as __esri.MapView

    // Clean up any existing measure pick
    if (measurePickHandlerRef.current) { measurePickHandlerRef.current.remove(); measurePickHandlerRef.current = null }
    if (measurePickHoverRef.current) { measurePickHoverRef.current.remove(); measurePickHoverRef.current = null }

    setPickingMeasure(which)
    view.container.style.cursor = 'crosshair'

    // Pre-load modules
    const modulesPromise = Promise.all([
      (window as any).SystemJS.import('esri/Graphic').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/geometry/Point').then((m: any) => m.default || m)
    ])

    // Create tooltip
    if (!measureTooltipRef.current) {
      const tip = document.createElement('div')
      tip.style.cssText = 'position:absolute;pointer-events:none;background:#333;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;z-index:99999;display:none;box-shadow:0 2px 6px rgba(0,0,0,0.3);'
      view.container.appendChild(tip)
      measureTooltipRef.current = tip
    }
    const tooltip = measureTooltipRef.current!
    tooltip.style.display = 'none'

    // Fetch the route geometry with M values
    const routeField = config.networkRouteIdField || 'customroutefield'
    const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '')
    const viewWkid = view.spatialReference?.wkid || 102100
    const currentRouteId = routeId.trim()

    const geomUrl = `${baseMapUrl}/${config.networkLayerId}/query`
    const geomParams: Record<string, string> = {
      where: `${routeField} = '${currentRouteId.replace(/'/g, "''")}'`,
      outFields: routeField,
      returnGeometry: 'true',
      returnM: 'true',
      outSR: String(viewWkid),
      resultRecordCount: '1',
      f: 'json'
    }

    lrsServiceRef.current.queryFeaturesDirect(geomUrl, geomParams).then(async (json: any) => {
      if (!json.features?.length) { setError('Could not fetch route geometry'); cancelPickMeasure(); return }

      const allVerts: number[][] = []
      for (const f of json.features) {
        if (f.geometry?.paths) {
          for (const path of f.geometry.paths) allVerts.push(...path)
        }
      }
      const hasZ = json.features[0]?.geometry?.hasZ
      const mIdx = hasZ ? 3 : 2
      allVerts.sort((a, b) => (a[mIdx] || 0) - (b[mIdx] || 0))

      if (allVerts.length === 0) { setError('Route has no geometry'); cancelPickMeasure(); return }

      // Helper: find nearest M on route from screen point
      function nearestMOnRoute (px: number, py: number): { m: number; x: number; y: number } | null {
        let bestDist = Infinity, bestX = px, bestY = py, bestM = 0
        for (let i = 0; i < allVerts.length - 1; i++) {
          const [ax, ay] = allVerts[i]
          const [bx, by] = allVerts[i + 1]
          const mA = allVerts[i][mIdx] || 0
          const mB = allVerts[i + 1][mIdx] || 0
          const dx = bx - ax, dy = by - ay
          const lenSq = dx * dx + dy * dy
          if (lenSq === 0) continue
          let t = ((px - ax) * dx + (py - ay) * dy) / lenSq
          t = Math.max(0, Math.min(1, t))
          const cx = ax + t * dx, cy = ay + t * dy
          const d = (px - cx) * (px - cx) + (py - cy) * (py - cy)
          if (d < bestDist) {
            bestDist = d; bestX = cx; bestY = cy
            bestM = mA + t * (mB - mA)
          }
        }
        return bestDist < Infinity ? { m: bestM, x: bestX, y: bestY } : null
      }

      const [Graphic, SimpleMarkerSymbol, Point] = await modulesPromise

      // Pointer-move: snap and show M value
      measurePickHoverRef.current = view.on('pointer-move', (event: any) => {
        const mapPoint = view.toMap({ x: event.x, y: event.y })
        if (!mapPoint) return

        const result = nearestMOnRoute(mapPoint.x, mapPoint.y)
        if (!result) return

        // Update tooltip
        tooltip.style.left = `${event.x + 14}px`
        tooltip.style.top = `${event.y - 40}px`
        tooltip.textContent = `M: ${result.m.toFixed(3)}`
        tooltip.style.display = 'block'

        // Update snap graphic
        if (measureSnapGraphicRef.current) {
          measureSnapGraphicRef.current.geometry = new Point({ x: result.x, y: result.y, spatialReference: view.spatialReference })
        } else {
          const g = new Graphic({
            geometry: new Point({ x: result.x, y: result.y, spatialReference: view.spatialReference }),
            symbol: new SimpleMarkerSymbol({
              color: [255, 87, 34, 255],
              size: 10,
              outline: { color: [255, 255, 255], width: 2 }
            })
          })
          measureSnapGraphicRef.current = g
          view.graphics.add(g)
        }
      })

      // Click: set the measure value
      measurePickHandlerRef.current = view.on('click', (event: any) => {
        const mapPoint = view.toMap({ x: event.x, y: event.y })
        if (!mapPoint) return

        const result = nearestMOnRoute(mapPoint.x, mapPoint.y)
        if (result) {
          const mVal = result.m.toFixed(3)
          if (which === 'from') {
            setFromMeasure(mVal)
            showMeasurePointRef.current('from', mVal)
            // Auto-start picking "to" measure
            cancelPickMeasure()
            setTimeout(() => startPickMeasure('to'), 50)
            return
          } else {
            setToMeasure(mVal)
            showMeasurePointRef.current('to', mVal)
          }
        }
        cancelPickMeasure()
      })
    }).catch(() => { setError('Failed to fetch route geometry'); cancelPickMeasure() })
  }, [config, routeId])

  const cancelPickMeasure = useCallback(() => {
    if (measurePickHandlerRef.current) { measurePickHandlerRef.current.remove(); measurePickHandlerRef.current = null }
    if (measurePickHoverRef.current) { measurePickHoverRef.current.remove(); measurePickHoverRef.current = null }
    if (measureTooltipRef.current) measureTooltipRef.current.style.display = 'none'
    if (measureSnapGraphicRef.current && jimuMapViewRef.current?.view) {
      (jimuMapViewRef.current.view as any).graphics.remove(measureSnapGraphicRef.current)
      measureSnapGraphicRef.current = null
    }
    if (jimuMapViewRef.current?.view) {
      (jimuMapViewRef.current.view as any).container.style.cursor = ''
    }
    setPickingMeasure(null)
  }, [])

  // Show selected route as a dashed line on the map
  const showRoutePreview = useCallback(async (rid: string, autoFillMeasures: boolean = true) => {
    if (!jimuMapViewRef.current?.view || !config || !lrsServiceRef.current) return
    const view = jimuMapViewRef.current.view as __esri.MapView

    // Ensure route preview GraphicsLayer exists at bottom of map
    if (!routePreviewLayerRef.current) {
      const GraphicsLayer = await (window as any).SystemJS.import('esri/layers/GraphicsLayer').then((m: any) => m.default || m)
      const gl = new GraphicsLayer({ id: '__roadlog_route_preview__', title: 'Route Preview' })
      view.map.add(gl, 0)
      routePreviewLayerRef.current = gl
    }
    const previewLayer = routePreviewLayerRef.current

    // Remove previous route preview
    if (routePreviewGraphicRef.current) { previewLayer.remove(routePreviewGraphicRef.current); routePreviewGraphicRef.current = null }
    if (fromMeasureGraphicRef.current) {
      if (Array.isArray(fromMeasureGraphicRef.current)) fromMeasureGraphicRef.current.forEach((g: any) => previewLayer.remove(g))
      else previewLayer.remove(fromMeasureGraphicRef.current)
      fromMeasureGraphicRef.current = null
    }
    if (toMeasureGraphicRef.current) {
      if (Array.isArray(toMeasureGraphicRef.current)) toMeasureGraphicRef.current.forEach((g: any) => previewLayer.remove(g))
      else previewLayer.remove(toMeasureGraphicRef.current)
      toMeasureGraphicRef.current = null
    }
    routePreviewVertsRef.current = null

    if (!rid) return

    const routeField = config.networkRouteIdField || 'customroutefield'
    const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '')
    const viewWkid = view.spatialReference?.wkid || 102100
    const url = `${baseMapUrl}/${config.networkLayerId}/query`

    try {
      const json = await lrsServiceRef.current.queryFeaturesDirect(url, {
        where: `${routeField} = '${rid.replace(/'/g, "''")}'`,
        outFields: routeField,
        returnGeometry: 'true',
        returnM: 'true',
        outSR: String(viewWkid),
        resultRecordCount: '1',
        f: 'json'
      })
      if (!json.features?.length) return

      const paths = json.features[0].geometry?.paths
      if (!paths?.length) return

      // Store vertices for measure point interpolation
      const allVerts: number[][] = []
      for (const path of paths) allVerts.push(...path)
      const hasZ = json.features[0].geometry?.hasZ
      const mIdx = hasZ ? 3 : 2
      allVerts.sort((a, b) => (a[mIdx] || 0) - (b[mIdx] || 0))
      routePreviewVertsRef.current = { vertices: allVerts, mIdx }

      // Set measure range and auto-fill from/to (no graphics yet — user will type/confirm)
      if (allVerts.length > 0) {
        const minM = allVerts[0][mIdx] || 0
        const maxM = allVerts[allVerts.length - 1][mIdx] || 0
        const precision = config.measurePrecision || 3
        setRouteMeasureRange({ min: minM, max: maxM })
        if (autoFillMeasures) {
          setFromMeasure(minM.toFixed(precision))
          setToMeasure(maxM.toFixed(precision))
        }
      }

      const [Graphic, Polyline, SimpleLineSymbol, TextSymbol] = await Promise.all([
        (window as any).SystemJS.import('esri/Graphic').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/geometry/Polyline').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/symbols/SimpleLineSymbol').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/symbols/TextSymbol').then((m: any) => m.default || m)
      ])

      const routeGraphic = new Graphic({
        geometry: new Polyline({ paths, spatialReference: { wkid: viewWkid } }),
        symbol: new SimpleLineSymbol({
          color: [220, 60, 60, 180],
          width: 3,
          style: 'dash'
        })
      })
      routePreviewGraphicRef.current = routeGraphic
      previewLayer.add(routeGraphic)

      // Zoom to the route extent
      try {
        view.goTo(routeGraphic.geometry.extent.expand(1.3), { duration: 800 })
      } catch (_) {}
    } catch (err) {
      console.warn('showRoutePreview failed:', err)
    }
  }, [config])
  showRoutePreviewRef.current = showRoutePreview

  // Show a measure point on the map (from or to)
  const showMeasurePoint = useCallback(async (which: 'from' | 'to', measureVal: string) => {
    if (!jimuMapViewRef.current?.view || !routePreviewVertsRef.current) return
    const view = jimuMapViewRef.current.view as __esri.MapView
    const m = parseFloat(measureVal)
    if (isNaN(m)) return

    // Remove previous graphic for this measure
    const ref = which === 'from' ? fromMeasureGraphicRef : toMeasureGraphicRef
    if (ref.current) {
      const layer = routePreviewLayerRef.current
      if (layer) {
        if (Array.isArray(ref.current)) ref.current.forEach((g: any) => layer.remove(g))
        else layer.remove(ref.current)
      }
      ref.current = null
    }

    const { vertices, mIdx } = routePreviewVertsRef.current

    // Interpolate point at measure
    let pt: { x: number; y: number } | null = null
    if (m <= (vertices[0][mIdx] || 0)) {
      pt = { x: vertices[0][0], y: vertices[0][1] }
    } else if (m >= (vertices[vertices.length - 1][mIdx] || 0)) {
      pt = { x: vertices[vertices.length - 1][0], y: vertices[vertices.length - 1][1] }
    } else {
      for (let i = 0; i < vertices.length - 1; i++) {
        const m1 = vertices[i][mIdx] || 0
        const m2 = vertices[i + 1][mIdx] || 0
        if (m >= m1 && m <= m2) {
          const frac = m2 !== m1 ? (m - m1) / (m2 - m1) : 0
          pt = {
            x: vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]),
            y: vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1])
          }
          break
        }
      }
    }
    if (!pt) return

    const [Graphic, Point, SimpleMarkerSymbol, TextSymbol] = await Promise.all([
      (window as any).SystemJS.import('esri/Graphic').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/geometry/Point').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/symbols/TextSymbol').then((m: any) => m.default || m)
    ])

    const color = which === 'from' ? [34, 139, 34, 255] : [180, 0, 0, 255] // green for from, red for to
    const label = which === 'from' ? `From: ${m.toFixed(3)}` : `To: ${m.toFixed(3)}`

    const pointGraphic = new Graphic({
      geometry: new Point({ x: pt.x, y: pt.y, spatialReference: view.spatialReference }),
      symbol: new SimpleMarkerSymbol({
        color,
        size: 12,
        outline: { color: [255, 255, 255], width: 2 }
      })
    })

    const labelGraphic = new Graphic({
      geometry: new Point({ x: pt.x, y: pt.y, spatialReference: view.spatialReference }),
      symbol: new TextSymbol({
        text: label,
        color: [255, 255, 255],
        haloColor: [0, 0, 0],
        haloSize: 1.5,
        font: { size: 11, weight: 'bold' },
        yoffset: 14
      })
    })

    // Store as array so we can remove both
    ref.current = [pointGraphic, labelGraphic]
    const layer = routePreviewLayerRef.current
    if (layer) {
      layer.add(pointGraphic)
      layer.add(labelGraphic)
    } else {
      view.graphics.add(pointGraphic)
      view.graphics.add(labelGraphic)
    }
  }, [])
  showMeasurePointRef.current = showMeasurePoint

  // Clear all route preview graphics
  const clearRoutePreview = useCallback(() => {
    if (routePreviewLayerRef.current) {
      routePreviewLayerRef.current.removeAll()
    }
    routePreviewGraphicRef.current = null
    fromMeasureGraphicRef.current = null
    toMeasureGraphicRef.current = null
    routePreviewVertsRef.current = null
  }, [])

  // Clear display-on-map event layers
  const clearDisplayOnMap = useCallback(() => {
    if (eventGraphicsLayersRef.current.size > 0 && jimuMapViewRef.current?.view) {
      const v = jimuMapViewRef.current.view as any
      eventGraphicsLayersRef.current.forEach((layer) => { try { v.map.remove(layer) } catch (_) {} })
      eventGraphicsLayersRef.current.clear()
    }
    layerVisibilityWatchesRef.current.forEach(h => { try { h.remove() } catch (_) {} })
    layerVisibilityWatchesRef.current = []
    setMapDisabledLayers(new Set())
    setEventsOnMap(false)
  }, [])

  // Toggle event layer selection
  const toggleEvent = useCallback((layerId: number) => {
    setSelectedEvents(prev => {
      const next = new Set(prev)
      if (next.has(layerId)) next.delete(layerId)
      else next.add(layerId)
      return next
    })
  }, [])

  const selectAllEvents = useCallback(() => {
    if (config?.eventLayerConfigs) {
      setSelectedEvents(new Set(config.eventLayerConfigs.map(e => e.layerId)))
    }
  }, [config?.eventLayerConfigs])

  const clearAllEvents = useCallback(() => {
    setSelectedEvents(new Set())
  }, [])

  // Map view callback
  const onActiveViewChange = useCallback((jmv: JimuMapView) => {
    jimuMapViewRef.current = jmv
  }, [])

  // Start polygon draw on map
  const startPolygonDraw = useCallback(async () => {
    const jmv = jimuMapViewRef.current
    if (!jmv?.view) {
      setError('Map not ready. Select a map widget in settings.')
      return
    }

    setDrawing(true)
    setMapRoutes([])
    setError(null)

    const view = jmv.view as __esri.MapView

    // Lazy-load ArcGIS modules via SystemJS
    const [SketchViewModel, GraphicsLayer] = await Promise.all([
      (window as any).SystemJS.import('esri/widgets/Sketch/SketchViewModel').then((m: any) => m.default || m),
      (window as any).SystemJS.import('esri/layers/GraphicsLayer').then((m: any) => m.default || m)
    ])

    // Create or reuse graphics layers
    if (!graphicsLayerRef.current) {
      graphicsLayerRef.current = new GraphicsLayer({ id: 'road-log-draw', listMode: 'hide' })
      view.map.add(graphicsLayerRef.current)
    }
    graphicsLayerRef.current.removeAll()

    if (!routeGraphicsLayerRef.current) {
      routeGraphicsLayerRef.current = new GraphicsLayer({ id: 'road-log-routes', listMode: 'hide' })
      view.map.add(routeGraphicsLayerRef.current)
    }
    routeGraphicsLayerRef.current.removeAll()

    // Clean up previous sketch VM
    if (sketchVMRef.current) {
      sketchVMRef.current.destroy()
    }

    const svm = new SketchViewModel({
      view,
      layer: graphicsLayerRef.current,
      polygonSymbol: {
        type: 'simple-fill',
        color: [0, 121, 193, 0.15],
        outline: { color: [0, 121, 193], width: 2 }
      }
    })
    sketchVMRef.current = svm

    svm.on('create', async (event: any) => {
      if (event.state === 'complete') {
        setDrawing(false)
        const polygon = event.graphic.geometry

        // Spatial query using the polygon's ENVELOPE (short URL, works with JSONP)
        // Then clip client-side with the actual polygon to get accurate M ranges
        try {
          const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '')
          const url = `${baseMapUrl}/${config.networkLayerId}/query`
          const routeField = config.networkRouteIdField || 'customroutefield'

          // Use envelope geometry — polygon JSON is too large for GET/JSONP
          const ext = polygon.extent
          const envelopeStr = `${ext.xmin},${ext.ymin},${ext.xmax},${ext.ymax}`

          const params: Record<string, string> = {
            geometry: envelopeStr,
            geometryType: 'esriGeometryEnvelope',
            inSR: String(ext.spatialReference?.wkid || ext.spatialReference?.latestWkid || 102100),
            spatialRel: 'esriSpatialRelIntersects',
            outFields: routeField,
            returnGeometry: 'true',
            returnM: 'true',
            outSR: String(polygon.spatialReference?.wkid || 102100),
            f: 'json'
          }

          const json = await lrsServiceRef.current!.queryFeaturesDirect(url, params)
          const features = json.features || []

          if (features.length === 0) {
            setError('No routes found within the drawn polygon')
            return
          }

          // Load geometry modules for clipping route polylines to the actual polygon
          const [geometryEngine, Polyline, Polygon] = await Promise.all([
            (window as any).SystemJS.import('esri/geometry/geometryEngine').then((m: any) => m.default || m),
            (window as any).SystemJS.import('esri/geometry/Polyline').then((m: any) => m.default || m),
            (window as any).SystemJS.import('esri/geometry/Polygon').then((m: any) => m.default || m)
          ])

          // Reconstruct the polygon for intersect operations
          const clipPolygon = new Polygon({
            rings: polygon.rings,
            spatialReference: polygon.spatialReference
          })

          // Group features by routeId and compute clipped M ranges
          const routeMap = new Map<string, { minM: number; maxM: number }>()
          // Store raw feature paths for display graphics (keyed by routeId)
          const routeDisplayPaths = new Map<string, number[][][]>()
          const precision = config.measurePrecision || 3

          for (const f of features) {
            const rid = String(f.attributes[routeField] || Object.values(f.attributes)[0])

            if (f.geometry?.paths) {
              try {
                const polyline = new Polyline({
                  paths: f.geometry.paths,
                  spatialReference: f.geometry.spatialReference,
                  hasM: f.geometry.hasM !== false,
                  hasZ: f.geometry.hasZ === true
                })

                // Clip the route polyline to the actual drawn polygon
                const clipped = geometryEngine.intersect(polyline, clipPolygon)

                if (clipped?.paths) {
                  // M value index: [x, y, z?, m] — if hasZ, m is at index 3; otherwise index 2
                  const mIdx = clipped.hasZ ? 3 : 2
                  const existing = routeMap.get(rid) || { minM: Infinity, maxM: -Infinity }
                  for (const path of clipped.paths) {
                    for (const pt of path) {
                      if (pt.length > mIdx) {
                        const m = pt[mIdx]
                        if (m != null && !isNaN(m)) {
                          existing.minM = Math.min(existing.minM, m)
                          existing.maxM = Math.max(existing.maxM, m)
                        }
                      }
                    }
                  }
                  routeMap.set(rid, existing)

                  // Store clipped paths (x,y only) for display — use toJSON() to get plain arrays
                  const clippedJson = clipped.toJSON ? clipped.toJSON() : clipped
                  const clippedPaths = (clippedJson.paths || []).map((path: number[][]) =>
                    path.map((pt: number[]) => [pt[0], pt[1]])
                  )
                  const prev = routeDisplayPaths.get(rid) || []
                  prev.push(...clippedPaths)
                  routeDisplayPaths.set(rid, prev)
                }
              } catch {
                // Clip failed — skip this route (it was in envelope but not in polygon)
              }
            }
          }

          if (routeMap.size === 0) {
            setError('No routes found within the drawn polygon')
            return
          }

          // Add matched routes as red dashed line graphics using raw query geometry
          const [Graphic, SimpleLineSymbol] = await Promise.all([
            (window as any).SystemJS.import('esri/Graphic').then((m: any) => m.default || m),
            (window as any).SystemJS.import('esri/symbols/SimpleLineSymbol').then((m: any) => m.default || m)
          ])
          const routeSymbol = new SimpleLineSymbol({
            color: [255, 0, 0, 0.85],
            width: 3,
            style: 'dash'
          })

          const querySR = features[0]?.geometry?.spatialReference || polygon.spatialReference
          for (const [rid, paths] of routeDisplayPaths.entries()) {
            const displayPolyline = new Polyline({
              paths: paths,
              spatialReference: querySR
            })
            routeGraphicsLayerRef.current.add(new Graphic({
              geometry: displayPolyline,
              symbol: routeSymbol,
              attributes: { routeId: rid }
            }))
          }

          const routes = Array.from(routeMap.entries()).map(([routeId, mr]) => ({
            routeId,
            routeName: null as string | null,
            fromMeasure: mr.minM === Infinity ? 0 : parseFloat(mr.minM.toFixed(precision)),
            toMeasure: mr.maxM === -Infinity || mr.maxM === Infinity ? null : parseFloat(mr.maxM.toFixed(precision))
          }))

          setMapRoutes(routes)
          setSelectedMapRouteIds(new Set(routes.map(r => r.routeId)))
        } catch (err: any) {
          setError('Failed to query routes: ' + (err.message || err))
        }
      }
    })

    svm.create('polygon')
  }, [config])

  // Toggle a map route selection on/off (show/hide graphic)
  const toggleMapRoute = useCallback((routeId: string) => {
    setSelectedMapRouteIds(prev => {
      const next = new Set(prev)
      if (next.has(routeId)) next.delete(routeId)
      else next.add(routeId)
      // Toggle visibility of the graphic on the map
      if (routeGraphicsLayerRef.current) {
        const graphics = routeGraphicsLayerRef.current.graphics?.toArray() || []
        for (const g of graphics) {
          if (g.attributes?.routeId === routeId) {
            g.visible = next.has(routeId)
          }
        }
      }
      return next
    })
  }, [])

  // Clear map selection
  const clearSelection = useCallback(() => {
    if (graphicsLayerRef.current) graphicsLayerRef.current.removeAll()
    if (routeGraphicsLayerRef.current) routeGraphicsLayerRef.current.removeAll()
    // Remove all per-event-layer graphics layers from the map
    if (eventGraphicsLayersRef.current.size > 0 && jimuMapViewRef.current?.view) {
      const view = jimuMapViewRef.current.view as __esri.MapView
      eventGraphicsLayersRef.current.forEach((layer) => {
        try { view.map.remove(layer) } catch (e) { /* ignore */ }
      })
      eventGraphicsLayersRef.current.clear()
    }
    if (sketchVMRef.current) {
      sketchVMRef.current.destroy()
      sketchVMRef.current = null
    }
    setMapRoutes([])
    setSelectedMapRouteIds(new Set())
    setDrawing(false)
    setError(null)
    setLastReportEntries(null)
    setShowDiagram(false)
  }, [])

  // Search — query event layers and store results
  const runReport = useCallback(async () => {
    if (!lrsServiceRef.current) {
      setError('LRS service not configured')
      return
    }

    if (searchMode !== 'map' && !routeId.trim()) {
      setError('Please enter a Route ID')
      return
    }

    if (searchMode === 'map' && mapRoutes.length === 0) {
      setError('Draw a polygon on the map first to select routes')
      return
    }

    const activeMapRoutes = mapRoutes.filter(r => selectedMapRouteIds.has(r.routeId))
    if (searchMode === 'map' && activeMapRoutes.length === 0) {
      setError('Please select at least one route from the list')
      return
    }

    if (selectedEvents.size === 0) {
      setError('Please select at least one event layer')
      return
    }

    const from = fromMeasure.trim() ? parseFloat(fromMeasure) : null
    const to = toMeasure.trim() ? parseFloat(toMeasure) : null

    if (searchMode !== 'map') {
      if (from === null || isNaN(from)) {
        setError('Please enter a valid From Measure')
        return
      }
      if (toMeasure.trim() && isNaN(to!)) {
        setError('Please enter a valid To Measure')
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const selectedConfigs = config.eventLayerConfigs.filter(e => selectedEvents.has(e.layerId))
      let result

      if (searchMode === 'map') {
        // Multi-route report from polygon selection
        const multiParams: MultiRouteReportParams = {
          routes: activeMapRoutes,
          eventLayers: selectedConfigs,
          measurePrecision: config.measurePrecision || 3
        }
        result = await generateMultiRouteReport(lrsServiceRef.current, multiParams)
      } else {
        // Single route report
        const reportParams: ReportParams = {
          routeId: routeId.trim(),
          routeName: routeName || null,
          fromMeasure: from!,
          toMeasure: to,
          routeTotalLength: null,
          eventLayers: selectedConfigs,
          measurePrecision: config.measurePrecision || 3
        }
        result = await generateReport(lrsServiceRef.current, reportParams)
      }

      if (result.entries.length === 0) {
        setError('No results found for the specified route and measures')
        return
      }

      setLastReportEntries(result.entries)

      // Replace full route preview with clipped segment and zoom
      if (searchMode !== 'map') {
        // Ensure route geometry is loaded (user may have typed ID directly without selecting from dropdown)
        if (!routePreviewVertsRef.current) {
          await showRoutePreviewRef.current(routeId.trim(), false)
        }

        // Remove full route line only (keep from/to measure points)
        const view = jimuMapViewRef.current?.view as any
        if (routePreviewLayerRef.current && routePreviewGraphicRef.current) {
          routePreviewLayerRef.current.remove(routePreviewGraphicRef.current)
          routePreviewGraphicRef.current = null
        }

        const verts = routePreviewVertsRef.current
        if (view && verts && from !== null) {
          const { vertices, mIdx } = verts
          const mFrom = from
          const mTo = to !== null ? to : from
          // Build clipped segment path
          const segPoints: number[][] = []
          const interpolateAt = (m: number): number[] | null => {
            for (let i = 0; i < vertices.length - 1; i++) {
              const m0 = vertices[i][mIdx] || 0
              const m1 = vertices[i + 1][mIdx] || 0
              if ((m >= m0 && m <= m1) || (m >= m1 && m <= m0)) {
                const ratio = m1 !== m0 ? (m - m0) / (m1 - m0) : 0
                const x = vertices[i][0] + ratio * (vertices[i + 1][0] - vertices[i][0])
                const y = vertices[i][1] + ratio * (vertices[i + 1][1] - vertices[i][1])
                return [x, y]
              }
            }
            return null
          }
          const ptFrom = interpolateAt(mFrom)
          if (ptFrom) segPoints.push(ptFrom)
          for (const v of vertices) {
            const vm = v[mIdx] || 0
            if (vm >= Math.min(mFrom, mTo) && vm <= Math.max(mFrom, mTo)) {
              segPoints.push([v[0], v[1]])
            }
          }
          const ptTo = interpolateAt(mTo)
          if (ptTo) segPoints.push(ptTo)

          if (segPoints.length > 1) {
            try {
              const [Graphic, Polyline, SimpleLineSymbol, Extent] = await Promise.all([
                (window as any).SystemJS.import('esri/Graphic').then((m: any) => m.default || m),
                (window as any).SystemJS.import('esri/geometry/Polyline').then((m: any) => m.default || m),
                (window as any).SystemJS.import('esri/symbols/SimpleLineSymbol').then((m: any) => m.default || m),
                (window as any).SystemJS.import('esri/geometry/Extent').then((m: any) => m.default || m)
              ])
              const segGraphic = new Graphic({
                geometry: new Polyline({ paths: [segPoints], spatialReference: view.spatialReference }),
                symbol: new SimpleLineSymbol({ color: [220, 60, 60, 180], width: 3, style: 'dash' })
              })
              if (routePreviewLayerRef.current) routePreviewLayerRef.current.add(segGraphic)
              else view.graphics.add(segGraphic)
              routePreviewGraphicRef.current = segGraphic

              // Zoom to segment extent
              let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity
              for (const p of segPoints) {
                if (p[0] < xmin) xmin = p[0]
                if (p[1] < ymin) ymin = p[1]
                if (p[0] > xmax) xmax = p[0]
                if (p[1] > ymax) ymax = p[1]
              }
              const pad = Math.max((xmax - xmin) * 0.15, (ymax - ymin) * 0.15, 100)
              const ext = new Extent({ xmin: xmin - pad, ymin: ymin - pad, xmax: xmax + pad, ymax: ymax + pad, spatialReference: view.spatialReference })
              view.goTo(ext, { duration: 800 })
            } catch (_) {}
          } else if (segPoints.length === 1) {
            // Point event — just zoom to that point
            try {
              const Extent = await (window as any).SystemJS.import('esri/geometry/Extent').then((m: any) => m.default || m)
              const p = segPoints[0]
              const pad = 200
              const ext = new Extent({ xmin: p[0] - pad, ymin: p[1] - pad, xmax: p[0] + pad, ymax: p[1] + pad, spatialReference: view.spatialReference })
              view.goTo(ext, { duration: 800 })
            } catch (_) {}
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Report generation failed')
    } finally {
      setLoading(false)
    }
  }, [routeId, routeName, fromMeasure, toMeasure, selectedEvents, config, searchMode, mapRoutes, selectedMapRouteIds])

  // Export CSV from last search results
  const exportReport = useCallback(() => {
    if (!lastReportEntries || lastReportEntries.length === 0) return
    const selectedConfigs = config.eventLayerConfigs.filter(e => selectedEvents.has(e.layerId))
    const baseCols = ['RouteID', 'RouteName', 'Feature', 'Location', 'EventID', 'Event', 'Type', 'Measure']
    const attrFieldSet = new Set<string>()
    for (const cfg of selectedConfigs) {
      for (const attr of cfg.attributes) {
        attrFieldSet.add(attr)
      }
    }
    const attrCols = Array.from(attrFieldSet)
    const allCols = [...baseCols, ...attrCols]

    const exportData = lastReportEntries.map(entry => {
      const row: Record<string, any> = {
        RouteID: entry.RouteID,
        RouteName: entry.RouteName || '',
        Feature: entry.Feature,
        Location: entry.Location || '',
        EventID: entry.EventID || '',
        Event: entry._eventLayer || '',
        Type: entry._eventType || '',
        Measure: entry.Measure
      }
      for (const attr of attrCols) {
        row[attr] = entry[attr] ?? ''
      }
      return row
    })

    exportCSV(searchMode === 'map' ? `RoadLog_MapSelect_${selectedMapRouteIds.size}routes` : `RoadLog_${routeId}`, exportData, allCols)
  }, [lastReportEntries, config, selectedEvents, searchMode, selectedMapRouteIds, routeId])

  const [exportingPdf, setExportingPdf] = useState<'all' | 'event' | 'route' | false>(false)

  // Smart table renderer: splits columns into readable groups when too many
  const MAX_COLS_PER_TABLE = 10
  const renderSmartTable = (
    pdf: any,
    baseCols: string[],
    attrCols: string[],
    entries: any[],
    startY: number,
    margin: number,
    headerColor: number[],
    pageH: number
  ): number => {
    let curY = startY
    const allCols = [...baseCols, ...attrCols]

    // If total columns fit, render a single table
    if (allCols.length <= MAX_COLS_PER_TABLE) {
      const head = [allCols]
      const body = entries.map(entry => allCols.map(col => {
        if (col === 'Measure' || col === 'FromMeasure' || col === 'ToMeasure') return String(Math.round((entry[col] ?? 0) * 1000) / 1000)
        return String(entry[col] ?? '')
      }))
      if (curY > pageH - 30) { pdf.addPage(); curY = margin }
      autoTable(pdf, {
        startY: curY,
        head: [head[0]],
        body,
        margin: { left: margin, right: margin },
        styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: headerColor, textColor: 255, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: Object.fromEntries(allCols.map((_, i) => [i, { minCellWidth: 12 }]))
      })
      curY = (pdf as any).lastAutoTable?.finalY ?? curY + 20
      return curY
    }

    // Too many columns — split attribute columns into chunks
    const maxAttrPerChunk = MAX_COLS_PER_TABLE - baseCols.length
    const chunks: string[][] = []
    for (let i = 0; i < attrCols.length; i += maxAttrPerChunk) {
      chunks.push(attrCols.slice(i, i + maxAttrPerChunk))
    }

    for (let ci = 0; ci < chunks.length; ci++) {
      const chunkCols = [...baseCols, ...chunks[ci]]
      if (ci > 0) {
        // Label continuation
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'italic')
        pdf.setTextColor(100, 100, 100)
        pdf.text(`(continued — columns ${ci * maxAttrPerChunk + 1}–${Math.min((ci + 1) * maxAttrPerChunk, attrCols.length)} of ${attrCols.length} attributes)`, margin, curY + 3)
        curY += 6
      }

      const head = [chunkCols]
      const body = entries.map(entry => chunkCols.map(col => {
        if (col === 'Measure' || col === 'FromMeasure' || col === 'ToMeasure') return String(Math.round((entry[col] ?? 0) * 1000) / 1000)
        return String(entry[col] ?? '')
      }))

      if (curY > pageH - 30) { pdf.addPage(); curY = margin }

      autoTable(pdf, {
        startY: curY,
        head: [head[0]],
        body,
        margin: { left: margin, right: margin },
        styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: headerColor, textColor: 255, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        columnStyles: Object.fromEntries(chunkCols.map((_, i) => [i, { minCellWidth: 12 }]))
      })
      curY = ((pdf as any).lastAutoTable?.finalY ?? curY + 20) + 4
    }
    return curY
  }

  // Export PDF with map screenshot + table
  const exportPDF = useCallback(async () => {
    if (!lastReportEntries || lastReportEntries.length === 0) return
    setExportingPdf('all')
    // Full-app overlay so user doesn't see map changes
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.88);display:flex;align-items:center;justify-content:center;z-index:99999;flex-direction:column;gap:10px;'
    overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #0079c1;border-top-color:transparent;border-radius:50%;animation:_pdfspin 1s linear infinite"></div><div style="font-size:14px;color:#333;font-weight:500">Generating PDF...</div><style>@keyframes _pdfspin{to{transform:rotate(360deg)}}</style>'
    document.body.appendChild(overlay)
    try {
      const selectedConfigs = config.eventLayerConfigs.filter(e => selectedEvents.has(e.layerId))
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentW = pageW - margin * 2
      let curY = margin

      // Title
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      const title = searchMode === 'map'
        ? `Road Log Report — Map Selection (${selectedMapRouteIds.size} routes)`
        : `Road Log Report — ${routeName || routeId}`
      pdf.text(title, margin, curY + 5)
      curY += 10
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      const subtitle = searchMode === 'map'
        ? `Routes: ${selectedMapRouteIds.size}  |  Generated: ${new Date().toLocaleString()}`
        : `Measures: ${fromMeasure || '—'} – ${toMeasure || '—'}  |  Generated: ${new Date().toLocaleString()}`
      pdf.text(subtitle, margin, curY + 3)
      curY += 8

      // Map screenshot
      const view = jimuMapViewRef.current?.view as any
      if (view?.takeScreenshot) {
        const savedExtent = view.extent?.clone()
        const hiddenLayers: any[] = []
        try {
          // Hide operational layers (not basemap) except event layers
          const operationalLayers = view.map?.layers?.toArray() || []
          const eventLayerSet = new Set(eventGraphicsLayersRef.current.values())
          for (const lyr of operationalLayers) {
            if (!eventLayerSet.has(lyr) && lyr.visible) {
              lyr.visible = false
              hiddenLayers.push(lyr)
            }
          }
          if (routePreviewLayerRef.current && routePreviewLayerRef.current.visible) {
            routePreviewLayerRef.current.visible = false
            hiddenLayers.push(routePreviewLayerRef.current)
          }

          // Zoom to event layers extent
          const evtLayers = Array.from(eventGraphicsLayersRef.current.values()).filter(l => l.visible)
          if (evtLayers.length > 0) {
            const exts = (await Promise.all(evtLayers.map((l: any) => l.queryExtent().then((r: any) => r.extent).catch(() => null)))).filter(Boolean)
            if (exts.length > 0) {
              let combined = exts[0]
              for (let i = 1; i < exts.length; i++) combined = combined.union(exts[i])
              // Ensure minimum extent size so points aren't clipped
              const extW = combined.xmax - combined.xmin
              const extH = combined.ymax - combined.ymin
              if (extW < 500 || extH < 500) {
                const cx = (combined.xmax + combined.xmin) / 2
                const cy = (combined.ymax + combined.ymin) / 2
                const pad = 500
                combined = combined.clone()
                combined.xmin = cx - pad; combined.xmax = cx + pad
                combined.ymin = cy - pad; combined.ymax = cy + pad
              }
              await view.goTo(combined.expand(1.8), { duration: 0 })
            }
          }
          await new Promise(r => setTimeout(r, 1500))

          const screenshot = await view.takeScreenshot({ format: 'png', width: 1600, height: 900 })
          if (screenshot?.dataUrl) {
            const mapH = contentW * (9 / 16)
            const availH = Math.min(mapH, (pageH - curY - margin) * 0.55)
            const imgW = availH < mapH ? availH * (16 / 9) : contentW
            const imgX = margin + (contentW - imgW) / 2
            pdf.addImage(screenshot.dataUrl, 'PNG', imgX, curY, imgW, availH)
            curY += availH + 4
          }
        } catch (e) { console.warn('Map screenshot failed:', e) } finally {
          for (const lyr of hiddenLayers) lyr.visible = true
          if (savedExtent) { try { await view.goTo(savedExtent, { duration: 0 }) } catch (_) {} }
        }
      }

      // Legend
      const legendPalettes: number[][] = [
        [255,59,48],[0,122,255],[52,199,89],[255,149,0],[175,82,222],[0,199,190],[255,45,85],[162,132,94]
      ]
      const legendItems = selectedConfigs.map((cfg, i) => {
        const cfgIdx = (config.eventLayerConfigs || []).findIndex(c => c.name === cfg.name)
        const color = legendPalettes[(cfgIdx >= 0 ? cfgIdx : i) % legendPalettes.length]
        return { name: cfg.name, color }
      })
      if (legendItems.length > 0) {
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'normal')
        const swatchW = 4, swatchH = 3, gap = 3, itemGap = 8
        let lx = margin
        for (const item of legendItems) {
          const textW = pdf.getTextWidth(item.name)
          if (lx + swatchW + gap + textW > pageW - margin) {
            lx = margin
            curY += swatchH + 2
          }
          pdf.setFillColor(item.color[0], item.color[1], item.color[2])
          pdf.rect(lx, curY - swatchH + 0.5, swatchW, swatchH, 'F')
          pdf.setTextColor(40, 40, 40)
          pdf.text(item.name, lx + swatchW + gap, curY)
          lx += swatchW + gap + textW + itemGap
        }
        curY += swatchH + 3
      }

      // Table
      const baseCols = ['RouteID', 'RouteName', 'Feature', 'Location', 'EventID', 'Measure']
      const attrFieldSet = new Set<string>()
      for (const cfg of selectedConfigs) {
        for (const attr of cfg.attributes) attrFieldSet.add(attr)
      }
      const attrCols = Array.from(attrFieldSet)

      if (curY > pageH - 40) { pdf.addPage(); curY = margin }

      curY = renderSmartTable(pdf, baseCols, attrCols, lastReportEntries, curY, margin, [0, 121, 193], pageH)

      const fileName = searchMode === 'map'
        ? `RoadLog_MapSelect_${selectedMapRouteIds.size}routes_${new Date().toISOString().slice(0, 10)}.pdf`
        : `RoadLog_${routeId}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(fileName)
    } catch (err: any) {
      console.error('PDF export failed:', err)
      setError('PDF export failed: ' + (err.message || err))
    } finally {
      try { document.body.removeChild(overlay) } catch (_) {}
      setExportingPdf(false)
    }
  }, [lastReportEntries, config, selectedEvents, searchMode, selectedMapRouteIds, routeId, routeName, fromMeasure, toMeasure])

  // PDF by Event — one section per event type with header, map (only that layer), and table
  const exportPDFByEvent = useCallback(async () => {
    if (!lastReportEntries || lastReportEntries.length === 0) return
    setExportingPdf('event')
    // Full-app overlay so user doesn't see map changes
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.88);display:flex;align-items:center;justify-content:center;z-index:99999;flex-direction:column;gap:10px;'
    overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #0079c1;border-top-color:transparent;border-radius:50%;animation:_pdfspin 1s linear infinite"></div><div style="font-size:14px;color:#333;font-weight:500">Generating PDF...</div><style>@keyframes _pdfspin{to{transform:rotate(360deg)}}</style>'
    document.body.appendChild(overlay)
    try {
      const selectedConfigs = config.eventLayerConfigs.filter(e => selectedEvents.has(e.layerId))
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentW = pageW - margin * 2

      // Group entries by event layer name (Feature field)
      const entriesByEvent = new Map<string, any[]>()
      for (const entry of lastReportEntries) {
        const name = entry.Feature
        if (!entriesByEvent.has(name)) entriesByEvent.set(name, [])
        entriesByEvent.get(name)!.push(entry)
      }

      const view = jimuMapViewRef.current?.view as any
      const eventLayers = eventGraphicsLayersRef.current

      // Save original visibility state of all event layers and map extent
      const savedExtent = view?.extent?.clone()
      const originalVisibility = new Map<string, boolean>()
      eventLayers.forEach((layer, name) => { originalVisibility.set(name, layer.visible) })

      let isFirstPage = true

      for (const [eventName, entries] of entriesByEvent) {
        // Start a new page for each event type (except the first)
        if (!isFirstPage) pdf.addPage()
        isFirstPage = false
        let curY = margin

        // Section header — event type name
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 121, 193)
        pdf.text(eventName, margin, curY + 6)
        curY += 12
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(60, 60, 60)
        const subInfo = searchMode === 'map'
          ? `${entries.length} records  |  ${selectedMapRouteIds.size} routes  |  ${new Date().toLocaleString()}`
          : `${entries.length} records  |  Route: ${routeName || routeId}  |  M: ${fromMeasure || '—'} – ${toMeasure || '—'}  |  ${new Date().toLocaleString()}`
        pdf.text(subInfo, margin, curY + 3)
        curY += 8

        // Map screenshot showing only this event type (keep basemap, hide operational layers)
        if (view?.takeScreenshot && eventLayers.size > 0) {
          const hiddenLayers: any[] = []
          try {
            // Hide operational layers (not basemap) except this event layer
            const operationalLayers = view.map?.layers?.toArray() || []
            const targetLayer = eventLayers.get(eventName)
            for (const lyr of operationalLayers) {
              if (lyr !== targetLayer && lyr.visible) {
                lyr.visible = false
                hiddenLayers.push(lyr)
              }
            }
            // Hide route preview
            if (routePreviewLayerRef.current && routePreviewLayerRef.current.visible) {
              routePreviewLayerRef.current.visible = false
              hiddenLayers.push(routePreviewLayerRef.current)
            }
            // Ensure only this event layer is visible among event layers
            eventLayers.forEach((layer, name) => { layer.visible = (name === eventName) })

            // Zoom to this layer's extent
            if (targetLayer) {
              try {
                const extResult = await targetLayer.queryExtent()
                if (extResult?.extent) {
                  let ext = extResult.extent
                  // Ensure minimum extent size so points aren't clipped
                  const extW = ext.xmax - ext.xmin
                  const extH = ext.ymax - ext.ymin
                  if (extW < 500 || extH < 500) {
                    const cx = (ext.xmax + ext.xmin) / 2
                    const cy = (ext.ymax + ext.ymin) / 2
                    const pad = 500
                    ext = ext.clone()
                    ext.xmin = cx - pad; ext.xmax = cx + pad
                    ext.ymin = cy - pad; ext.ymax = cy + pad
                  }
                  await view.goTo(ext.expand(1.8), { duration: 0 })
                  await new Promise(r => setTimeout(r, 1200))
                }
              } catch (_) {}
            }

            const screenshot = await view.takeScreenshot({ format: 'png', width: 1600, height: 900 })
            if (screenshot?.dataUrl) {
              const mapH = contentW * (9 / 16)
              const availH = Math.min(mapH, (pageH - curY - margin) * 0.5)
              const imgW = availH < mapH ? availH * (16 / 9) : contentW
              const imgX = margin + (contentW - imgW) / 2
              pdf.addImage(screenshot.dataUrl, 'PNG', imgX, curY, imgW, availH)
              curY += availH + 4
            }
          } catch (e) { console.warn(`Map screenshot failed for ${eventName}:`, e) } finally {
            // Restore hidden operational layers after each screenshot
            for (const lyr of hiddenLayers) lyr.visible = true
          }
        }

        // Legend swatch for this event type
        const cfgIdx = (config.eventLayerConfigs || []).findIndex(c => c.name === eventName)
        const legendPalettes: number[][] = [
          [255,59,48],[0,122,255],[52,199,89],[255,149,0],[175,82,222],[0,199,190],[255,45,85],[162,132,94]
        ]
        const eventColor = legendPalettes[(cfgIdx >= 0 ? cfgIdx : 0) % legendPalettes.length]
        pdf.setFillColor(eventColor[0], eventColor[1], eventColor[2])
        pdf.rect(margin, curY - 2, 5, 3, 'F')
        pdf.setFontSize(8)
        pdf.setTextColor(40, 40, 40)
        pdf.text(eventName, margin + 7, curY)
        curY += 5

        // Table for this event type only
        const eventCfg = selectedConfigs.find(c => c.name === eventName)
        const attrFields = eventCfg?.attributes || []
        const baseCols = ['RouteID', 'RouteName', 'Location', 'EventID', 'Measure']

        if (curY > pageH - 30) { pdf.addPage(); curY = margin }

        curY = renderSmartTable(pdf, baseCols, attrFields, entries, curY, margin, [eventColor[0], eventColor[1], eventColor[2]], pageH)
      }

      // Restore original layer visibility
      eventLayers.forEach((layer, name) => {
        layer.visible = originalVisibility.get(name) ?? true
      })
      // Restore original extent
      if (view && savedExtent) {
        try { await view.goTo(savedExtent, { duration: 0 }) } catch (_) {}
      }

      const fileName = searchMode === 'map'
        ? `RoadLog_ByEvent_${selectedMapRouteIds.size}routes_${new Date().toISOString().slice(0, 10)}.pdf`
        : `RoadLog_ByEvent_${routeId}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(fileName)
    } catch (err: any) {
      console.error('PDF by Event export failed:', err)
      setError('PDF export failed: ' + (err.message || err))
    } finally {
      // Always remove overlay and reset state
      try { document.body.removeChild(overlay) } catch (_) {}
      setExportingPdf(false)
    }
  }, [lastReportEntries, config, selectedEvents, searchMode, selectedMapRouteIds, routeId, routeName, fromMeasure, toMeasure])

  // PDF by Route — one section per route with header, map (zoomed to that route), and table
  const exportPDFByRoute = useCallback(async () => {
    if (!lastReportEntries || lastReportEntries.length === 0) return
    setExportingPdf('route')
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.88);display:flex;align-items:center;justify-content:center;z-index:99999;flex-direction:column;gap:10px;'
    overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #0079c1;border-top-color:transparent;border-radius:50%;animation:_pdfspin 1s linear infinite"></div><div id="_pdfProgress" style="font-size:14px;color:#333;font-weight:500">Generating PDF by Route...</div><div style="width:200px;height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden"><div id="_pdfBar" style="height:100%;width:0%;background:#0079c1;transition:width 0.3s"></div></div><style>@keyframes _pdfspin{to{transform:rotate(360deg)}}</style>'
    document.body.appendChild(overlay)
    try {
      const selectedConfigs = config.eventLayerConfigs.filter(e => selectedEvents.has(e.layerId))
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentW = pageW - margin * 2

      // Group entries by RouteID
      const entriesByRoute = new Map<string, any[]>()
      for (const entry of lastReportEntries) {
        const rid = entry.RouteID || 'Unknown'
        if (!entriesByRoute.has(rid)) entriesByRoute.set(rid, [])
        entriesByRoute.get(rid)!.push(entry)
      }

      const view = jimuMapViewRef.current?.view as any
      const eventLayers = eventGraphicsLayersRef.current
      const routeLayer = routeGraphicsLayerRef.current

      // Save state
      const savedExtent = view?.extent?.clone()
      const originalVisibility = new Map<string, boolean>()
      eventLayers.forEach((layer, name) => { originalVisibility.set(name, layer.visible) })

      let isFirstPage = true
      let routeIdx = 0
      const totalRoutes = entriesByRoute.size

      for (const [rid, entries] of entriesByRoute) {
        routeIdx++
        const progressEl = document.getElementById('_pdfProgress')
        const barEl = document.getElementById('_pdfBar')
        if (progressEl) progressEl.textContent = `Route ${routeIdx} of ${totalRoutes}...`
        if (barEl) barEl.style.width = `${Math.round((routeIdx / totalRoutes) * 100)}%`

        if (!isFirstPage) pdf.addPage()
        isFirstPage = false
        let curY = margin

        const rName = entries[0]?.RouteName || ''
        // Section header
        pdf.setFontSize(16)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0, 121, 193)
        pdf.text(rName ? `${rName} (${rid})` : rid, margin, curY + 6)
        curY += 12
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(60, 60, 60)
        pdf.text(`${entries.length} records  |  Generated: ${new Date().toLocaleString()}`, margin, curY + 3)
        curY += 8

        // Map screenshot zoomed to this route with its events
        if (view?.takeScreenshot && routeLayer) {
          const hiddenLayers: any[] = []
          try {
            // Hide all operational layers except event layers and route layer
            const operationalLayers = view.map?.layers?.toArray() || []
            const eventLayerSet = new Set(eventGraphicsLayersRef.current.values())
            for (const lyr of operationalLayers) {
              if (lyr !== routeLayer && !eventLayerSet.has(lyr) && lyr.visible) {
                lyr.visible = false
                hiddenLayers.push(lyr)
              }
            }
            if (routePreviewLayerRef.current && routePreviewLayerRef.current.visible) {
              routePreviewLayerRef.current.visible = false
              hiddenLayers.push(routePreviewLayerRef.current)
            }

            // Show only the current route graphic
            const routeGraphics = routeLayer.graphics?.toArray() || []
            const hiddenRouteGraphics: any[] = []
            for (const g of routeGraphics) {
              if (g.attributes?.routeId !== rid) {
                g.visible = false
                hiddenRouteGraphics.push(g)
              }
            }

            // Show event layers but filter to only this route's events via definitionExpression
            const savedDefinitions = new Map<string, string>()
            eventLayers.forEach((layer) => {
              layer.visible = true
              savedDefinitions.set(layer.id || layer.title, layer.definitionExpression || '')
              layer.definitionExpression = `routeId = '${rid.replace(/'/g, "''")}'`
              try { layer.refresh() } catch (_) {}
            })

            // Zoom to this route's extent
            const thisRouteGraphic = routeGraphics.find((g: any) => g.attributes?.routeId === rid)
            if (thisRouteGraphic?.geometry) {
              let ext = thisRouteGraphic.geometry.extent?.clone()
              if (ext) {
                const extW = ext.xmax - ext.xmin
                const extH = ext.ymax - ext.ymin
                if (extW < 500 || extH < 500) {
                  const cx = (ext.xmax + ext.xmin) / 2
                  const cy = (ext.ymax + ext.ymin) / 2
                  const pad = 500
                  ext.xmin = cx - pad; ext.xmax = cx + pad
                  ext.ymin = cy - pad; ext.ymax = cy + pad
                }
                await view.goTo(ext.expand(1.8), { duration: 0 })
                await new Promise(r => setTimeout(r, 1200))
              }
            }

            const screenshot = await view.takeScreenshot({ format: 'png', width: 1600, height: 900 })
            if (screenshot?.dataUrl) {
              const mapH = contentW * (9 / 16)
              const availH = Math.min(mapH, (pageH - curY - margin) * 0.5)
              const imgW = availH < mapH ? availH * (16 / 9) : contentW
              const imgX = margin + (contentW - imgW) / 2
              pdf.addImage(screenshot.dataUrl, 'PNG', imgX, curY, imgW, availH)
              curY += availH + 4
            }

            // Restore route graphics visibility
            for (const g of hiddenRouteGraphics) g.visible = true
            // Restore event layer definition expressions
            eventLayers.forEach((layer) => {
              const key = layer.id || layer.title
              layer.definitionExpression = savedDefinitions.get(key) || ''
            })
          } catch (e) { console.warn(`Map screenshot failed for route ${rid}:`, e) } finally {
            for (const lyr of hiddenLayers) lyr.visible = true
          }
        }

        // Legend
        const legendPalettes: number[][] = [
          [255,59,48],[0,122,255],[52,199,89],[255,149,0],[175,82,222],[0,199,190],[255,45,85],[162,132,94]
        ]
        const legendItems = selectedConfigs.map((cfg, i) => {
          const cfgIdx = (config.eventLayerConfigs || []).findIndex(c => c.name === cfg.name)
          const color = legendPalettes[(cfgIdx >= 0 ? cfgIdx : i) % legendPalettes.length]
          return { name: cfg.name, color }
        })
        if (legendItems.length > 0) {
          pdf.setFontSize(7)
          pdf.setFont('helvetica', 'normal')
          const swatchW = 4, swatchH = 3, gap = 3, itemGap = 8
          let lx = margin
          for (const item of legendItems) {
            const textW = pdf.getTextWidth(item.name)
            if (lx + swatchW + gap + textW > pageW - margin) {
              lx = margin
              curY += swatchH + 2
            }
            pdf.setFillColor(item.color[0], item.color[1], item.color[2])
            pdf.rect(lx, curY - swatchH + 0.5, swatchW, swatchH, 'F')
            pdf.setTextColor(40, 40, 40)
            pdf.text(item.name, lx + swatchW + gap, curY)
            lx += swatchW + gap + textW + itemGap
          }
          curY += swatchH + 3
        }

        // Table for this route
        const baseCols = ['Feature', 'Location', 'EventID', 'Measure']
        const attrFieldSet = new Set<string>()
        for (const cfg of selectedConfigs) {
          for (const attr of cfg.attributes) attrFieldSet.add(attr)
        }
        const attrCols = Array.from(attrFieldSet)

        if (curY > pageH - 30) { pdf.addPage(); curY = margin }

        curY = renderSmartTable(pdf, baseCols, attrCols, entries, curY, margin, [0, 121, 193], pageH)
      }

      // Restore original visibility and extent
      eventLayers.forEach((layer, name) => {
        layer.visible = originalVisibility.get(name) ?? true
      })
      if (view && savedExtent) {
        try { await view.goTo(savedExtent, { duration: 0 }) } catch (_) {}
      }

      pdf.save(`RoadLog_ByRoute_${entriesByRoute.size}routes_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err: any) {
      console.error('PDF by Route export failed:', err)
      setError('PDF export failed: ' + (err.message || err))
    } finally {
      try { document.body.removeChild(overlay) } catch (_) {}
      setExportingPdf(false)
    }
  }, [lastReportEntries, config, selectedEvents, searchMode, selectedMapRouteIds])

  // PDF by Route + Event — one section per route+event combination
  const exportPDFByRouteEvent = useCallback(async () => {
    if (!lastReportEntries || lastReportEntries.length === 0) return
    setExportingPdf('route')
    const overlay = document.createElement('div')
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(255,255,255,0.88);display:flex;align-items:center;justify-content:center;z-index:99999;flex-direction:column;gap:10px;'
    overlay.innerHTML = '<div style="width:40px;height:40px;border:3px solid #0079c1;border-top-color:transparent;border-radius:50%;animation:_pdfspin 1s linear infinite"></div><div id="_pdfProgress" style="font-size:14px;color:#333;font-weight:500">Generating PDF by Route &amp; Event...</div><div style="width:200px;height:6px;background:#e0e0e0;border-radius:3px;overflow:hidden"><div id="_pdfBar" style="height:100%;width:0%;background:#0079c1;transition:width 0.3s"></div></div><style>@keyframes _pdfspin{to{transform:rotate(360deg)}}</style>'
    document.body.appendChild(overlay)
    try {
      const selectedConfigs = config.eventLayerConfigs.filter(e => selectedEvents.has(e.layerId))
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentW = pageW - margin * 2

      // Group entries by RouteID then by Event (Feature)
      const entriesByRouteEvent = new Map<string, Map<string, any[]>>()
      for (const entry of lastReportEntries) {
        const rid = entry.RouteID || 'Unknown'
        const evtName = entry.Feature
        if (!entriesByRouteEvent.has(rid)) entriesByRouteEvent.set(rid, new Map())
        const evtMap = entriesByRouteEvent.get(rid)!
        if (!evtMap.has(evtName)) evtMap.set(evtName, [])
        evtMap.get(evtName)!.push(entry)
      }

      const view = jimuMapViewRef.current?.view as any
      const eventLayers = eventGraphicsLayersRef.current
      const routeLayer = routeGraphicsLayerRef.current

      // Save state
      const savedExtent = view?.extent?.clone()
      const originalVisibility = new Map<string, boolean>()
      eventLayers.forEach((layer, name) => { originalVisibility.set(name, layer.visible) })

      const legendPalettes: number[][] = [
        [255,59,48],[0,122,255],[52,199,89],[255,149,0],[175,82,222],[0,199,190],[255,45,85],[162,132,94]
      ]

      let isFirstPage = true
      let sectionIdx = 0
      let totalSections = 0
      for (const [, evtMap] of entriesByRouteEvent) totalSections += evtMap.size

      for (const [rid, evtMap] of entriesByRouteEvent) {
        const rName = evtMap.values().next().value?.[0]?.RouteName || ''

        for (const [eventName, entries] of evtMap) {
          sectionIdx++
          const progressEl = document.getElementById('_pdfProgress')
          const barEl = document.getElementById('_pdfBar')
          if (progressEl) progressEl.textContent = `Section ${sectionIdx} of ${totalSections}...`
          if (barEl) barEl.style.width = `${Math.round((sectionIdx / totalSections) * 100)}%`

          if (!isFirstPage) pdf.addPage()
          isFirstPage = false
          let curY = margin

          // Section header
          pdf.setFontSize(14)
          pdf.setFont('helvetica', 'bold')
          pdf.setTextColor(0, 121, 193)
          pdf.text(rName ? `${rName} (${rid})` : rid, margin, curY + 5)
          curY += 9
          pdf.setFontSize(12)
          pdf.setTextColor(60, 60, 60)
          pdf.text(eventName, margin, curY + 4)
          curY += 9
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${entries.length} records  |  Generated: ${new Date().toLocaleString()}`, margin, curY + 3)
          curY += 8

          // Map screenshot — zoom to route, show only this event layer filtered to this route
          if (view?.takeScreenshot && routeLayer) {
            const hiddenLayers: any[] = []
            try {
              const operationalLayers = view.map?.layers?.toArray() || []
              const eventLayerSet = new Set(eventGraphicsLayersRef.current.values())
              for (const lyr of operationalLayers) {
                if (lyr !== routeLayer && !eventLayerSet.has(lyr) && lyr.visible) {
                  lyr.visible = false
                  hiddenLayers.push(lyr)
                }
              }
              if (routePreviewLayerRef.current && routePreviewLayerRef.current.visible) {
                routePreviewLayerRef.current.visible = false
                hiddenLayers.push(routePreviewLayerRef.current)
              }

              // Show only the current route graphic
              const routeGraphics = routeLayer.graphics?.toArray() || []
              const hiddenRouteGraphics: any[] = []
              for (const g of routeGraphics) {
                if (g.attributes?.routeId !== rid) {
                  g.visible = false
                  hiddenRouteGraphics.push(g)
                }
              }

              // Show only target event layer, filtered to this route
              const savedDefinitions = new Map<string, string>()
              eventLayers.forEach((layer, name) => {
                savedDefinitions.set(layer.id || layer.title, layer.definitionExpression || '')
                if (name === eventName) {
                  layer.visible = true
                  layer.definitionExpression = `routeId = '${rid.replace(/'/g, "''")}'`
                } else {
                  layer.visible = false
                }
                try { layer.refresh() } catch (_) {}
              })

              // Zoom to this route's extent
              const thisRouteGraphic = routeGraphics.find((g: any) => g.attributes?.routeId === rid)
              if (thisRouteGraphic?.geometry) {
                let ext = thisRouteGraphic.geometry.extent?.clone()
                if (ext) {
                  const extW = ext.xmax - ext.xmin
                  const extH = ext.ymax - ext.ymin
                  if (extW < 500 || extH < 500) {
                    const cx = (ext.xmax + ext.xmin) / 2
                    const cy = (ext.ymax + ext.ymin) / 2
                    const pad = 500
                    ext.xmin = cx - pad; ext.xmax = cx + pad
                    ext.ymin = cy - pad; ext.ymax = cy + pad
                  }
                  await view.goTo(ext.expand(1.8), { duration: 0 })
                  await new Promise(r => setTimeout(r, 1200))
                }
              }

              const screenshot = await view.takeScreenshot({ format: 'png', width: 1600, height: 900 })
              if (screenshot?.dataUrl) {
                const mapH = contentW * (9 / 16)
                const availH = Math.min(mapH, (pageH - curY - margin) * 0.5)
                const imgW = availH < mapH ? availH * (16 / 9) : contentW
                const imgX = margin + (contentW - imgW) / 2
                pdf.addImage(screenshot.dataUrl, 'PNG', imgX, curY, imgW, availH)
                curY += availH + 4
              }

              // Restore
              for (const g of hiddenRouteGraphics) g.visible = true
              eventLayers.forEach((layer) => {
                const key = layer.id || layer.title
                layer.definitionExpression = savedDefinitions.get(key) || ''
                try { layer.refresh() } catch (_) {}
              })
            } catch (e) { console.warn(`Map screenshot failed for ${rid}/${eventName}:`, e) } finally {
              for (const lyr of hiddenLayers) lyr.visible = true
            }
          }

          // Legend swatch
          const cfgIdx = (config.eventLayerConfigs || []).findIndex(c => c.name === eventName)
          const eventColor = legendPalettes[(cfgIdx >= 0 ? cfgIdx : 0) % legendPalettes.length]
          pdf.setFillColor(eventColor[0], eventColor[1], eventColor[2])
          pdf.rect(margin, curY - 2, 5, 3, 'F')
          pdf.setFontSize(8)
          pdf.setTextColor(40, 40, 40)
          pdf.text(eventName, margin + 7, curY)
          curY += 5

          // Table
          const eventCfg = selectedConfigs.find(c => c.name === eventName)
          const attrFields = eventCfg?.attributes || []
          const baseCols = ['Location', 'EventID', 'Measure']

          if (curY > pageH - 30) { pdf.addPage(); curY = margin }

          curY = renderSmartTable(pdf, baseCols, attrFields, entries, curY, margin, [eventColor[0], eventColor[1], eventColor[2]], pageH)
        }
      }

      // Restore original visibility and extent
      eventLayers.forEach((layer, name) => {
        layer.visible = originalVisibility.get(name) ?? true
      })
      if (view && savedExtent) {
        try { await view.goTo(savedExtent, { duration: 0 }) } catch (_) {}
      }

      pdf.save(`RoadLog_ByRouteEvent_${entriesByRouteEvent.size}routes_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err: any) {
      console.error('PDF by Route+Event export failed:', err)
      setError('PDF export failed: ' + (err.message || err))
    } finally {
      try { document.body.removeChild(overlay) } catch (_) {}
      setExportingPdf(false)
    }
  }, [lastReportEntries, config, selectedEvents, searchMode, selectedMapRouteIds])

  // Share to ArcGIS — save event layers as a hosted feature layer in My Content
  const saveToArcGIS = useCallback(async (layerName: string) => {
    if (!lastReportEntries || lastReportEntries.length === 0) return
    if (!layerName.trim()) { setError('Please enter a layer name'); return }
    setSharing(true)
    setError(null)
    try {
      // Get session token and portal URL
      const session = SessionManager.getInstance().getMainSession()
      if (!session) throw new Error('Not signed in. Please sign in to ArcGIS to share layers.')
      const token = (session as any).token
      const portalUrl = ((session as any).portal || '').replace(/\/sharing\/rest\/?$/, '')
      if (!token || !portalUrl) throw new Error('Could not retrieve authentication. Please sign in.')
      const username = (session as any).username
      if (!username) throw new Error('Could not determine username.')

      const view = jimuMapViewRef.current?.view as any
      const wkid = view?.spatialReference?.wkid || 102100

      // Build features from all event entries
      const selectedConfigs = config.eventLayerConfigs.filter(e => selectedEvents.has(e.layerId))
      const eventConfigMap = new Map<string, string>()
      for (const cfg of selectedConfigs) {
        eventConfigMap.set(cfg.name, cfg.type || 'esriLRSPointEventLayer')
      }

      // Get route geometries (reuse stored ones)
      const routeGeometries = routeGeometriesRef.current

      // Helper to interpolate point from M
      function interpPoint (vertices: number[][], targetM: number, mIdx: number): { x: number; y: number } | null {
        if (vertices.length === 0) return null
        if (targetM <= (vertices[0][mIdx] || 0)) return { x: vertices[0][0], y: vertices[0][1] }
        if (targetM >= (vertices[vertices.length - 1][mIdx] || 0)) return { x: vertices[vertices.length - 1][0], y: vertices[vertices.length - 1][1] }
        for (let i = 0; i < vertices.length - 1; i++) {
          const m1 = vertices[i][mIdx] || 0
          const m2 = vertices[i + 1][mIdx] || 0
          if (targetM >= m1 && targetM <= m2) {
            const frac = m2 !== m1 ? (targetM - m1) / (m2 - m1) : 0
            return { x: vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]), y: vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1]) }
          }
        }
        return null
      }

      function extractPath (vertices: number[][], fromM: number, toM: number, mIdx: number): number[][] {
        const path: number[][] = []
        const minM = Math.min(fromM, toM)
        const maxM = Math.max(fromM, toM)
        const startPt = interpPoint(vertices, minM, mIdx)
        if (startPt) path.push([startPt.x, startPt.y])
        for (const v of vertices) {
          const m = v[mIdx] || 0
          if (m >= minM && m <= maxM) {
            const last = path[path.length - 1]
            if (!last || v[0] !== last[0] || v[1] !== last[1]) path.push([v[0], v[1]])
          }
        }
        const endPt = interpPoint(vertices, maxM, mIdx)
        if (endPt) {
          const last = path[path.length - 1]
          if (!last || endPt.x !== last[0] || endPt.y !== last[1]) path.push([endPt.x, endPt.y])
        }
        return path
      }

      // Group by event for linear pairing
      const entriesByLayer = new Map<string, any[]>()
      for (const entry of lastReportEntries) {
        const name = entry.Feature
        if (!entriesByLayer.has(name)) entriesByLayer.set(name, [])
        entriesByLayer.get(name)!.push(entry)
      }

      // Color palette matching the map display
      const legendPalettes: number[][] = [
        [255,59,48],[0,122,255],[52,199,89],[255,149,0],[175,82,222],[0,199,190],[255,45,85],[162,132,94]
      ]

      // Build field definitions (base fields shared by all)
      // Use lowercase names — Enterprise GDB normalizes field names to lowercase
      const baseFields = [
        { name: 'routeid', type: 'esriFieldTypeString', alias: 'Route ID', length: 100 },
        { name: 'routename', type: 'esriFieldTypeString', alias: 'Route Name', length: 200 },
        { name: 'eventid', type: 'esriFieldTypeString', alias: 'Event ID', length: 100 }
      ]

      // Map event name -> its specific attribute config
      const eventAttrMap = new Map<string, string[]>()
      for (const cfg of selectedConfigs) {
        eventAttrMap.set(cfg.name, cfg.attributes || [])
      }

      // Helper: build sanitized field defs for a specific event's attributes
      const RESERVED_FIELD_NAMES = new Set(['OBJECTID', 'FID', 'SHAPE', 'SHAPE_LENGTH', 'SHAPE_AREA', 'GLOBALID', 'ROUTEID', 'ROUTENAME', 'EVENTID', 'FROMMEASURE', 'TOMEASURE', 'MEASURE'])
      // GDB reserved words that cause "Creating feature class failed"
      const GDB_RESERVED = new Set(['ADD','ALTER','AND','AS','ASC','BETWEEN','BY','COLUMN','CREATE','DATE','DELETE','DESC','DROP','EXISTS','FOR','FROM','GROUP','IN','INDEX','INSERT','INTO','IS','KEY','LIKE','NOT','NULL','ON','OR','ORDER','SELECT','SET','TABLE','TYPE','UPDATE','VALUES','WHERE','CLASS','NAME','STATUS','LEVEL','POSITION','TIME','TIMESTAMP','VALUE','NUMBER','TEXT','STATE','YEAR','MONTH','DAY','COUNT','SUM','AVG','MIN','MAX'])
      function sanitizeFieldName (rawName: string): string {
        let safeName = rawName.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 31)
        if (/^[0-9]/.test(safeName)) safeName = 'F_' + safeName.substring(0, 29)
        if (GDB_RESERVED.has(safeName.toUpperCase())) safeName = 'F_' + safeName.substring(0, 29)
        return safeName
      }
      function buildAttrFields (attrs: string[], fieldTypes?: Record<string, string>) {
        const usedNames = new Set(RESERVED_FIELD_NAMES)
        return attrs.map(f => {
          let safeName = sanitizeFieldName(f)
          let finalName = safeName
          let counter = 1
          while (usedNames.has(finalName.toUpperCase())) {
            finalName = safeName.substring(0, 28) + '_' + counter
            counter++
          }
          usedNames.add(finalName.toUpperCase())
          const srcType = fieldTypes?.[f]
          const isDate = srcType === 'esriFieldTypeDate'
          return isDate
            ? { name: finalName, type: 'esriFieldTypeDate' as const, alias: f }
            : { name: finalName, type: 'esriFieldTypeString' as const, alias: f, length: 128 }
        })
      }

      // Helper: populate sanitized attribute values from an entry (matches buildAttrFields logic)
      function populateAttrs (attrs: Record<string, any>, entry: any, fieldNames: string[]) {
        const usedNames = new Set(RESERVED_FIELD_NAMES)
        const rawVals = entry._rawValues || {}
        const fTypes = entry._fieldTypes || {}
        for (const attr of fieldNames) {
          let safeName = sanitizeFieldName(attr)
          let finalName = safeName
          let counter = 1
          while (usedNames.has(finalName.toUpperCase())) {
            finalName = safeName.substring(0, 28) + '_' + counter
            counter++
          }
          usedNames.add(finalName.toUpperCase())
          // Use raw epoch value for date fields, string for everything else
          if (fTypes[attr] === 'esriFieldTypeDate') {
            const raw = rawVals[attr]
            attrs[finalName] = (raw != null && typeof raw === 'number') ? raw : null
          } else {
            const val = entry[attr]
            attrs[finalName] = val != null ? String(val) : ''
          }
        }
      }

      // Create feature service via Portal REST API
      const contentUrl = `${portalUrl}/sharing/rest/content/users/${username}`

      // Build one layer per event with its own color and schema
      const layers: any[] = []
      const layerFeatures: Array<{ layerIdx: number; features: any[] }> = []
      let layerIdx = 0

      for (const [eventName, entries] of entriesByLayer) {
        const layerType = eventConfigMap.get(eventName) || 'esriLRSPointEventLayer'
        const isLinear = layerType === 'esriLRSLinearEventLayer'
        const cfgIdx = (config.eventLayerConfigs || []).findIndex(c => c.name === eventName)
        const color = legendPalettes[(cfgIdx >= 0 ? cfgIdx : layerIdx) % legendPalettes.length]
        const eventAttrs = eventAttrMap.get(eventName) || []
        // Get field type info from first entry for date field detection
        const sampleEntry = entries[0]
        const fieldTypes = sampleEntry?._fieldTypes || {}
        const attrFields = buildAttrFields(eventAttrs, fieldTypes)

        // Detect date fields for derived DOWname
        const CRASH_DATE_FIELDS = ['accident_time', 'accident_date', 'crash_date', 'crash_time', 'offense_date', 'incident_date']
        const dateFieldForDOW = eventAttrs.find(a => CRASH_DATE_FIELDS.includes(a.toLowerCase()) && fieldTypes[a] === 'esriFieldTypeDate')
        const hasDOW = !!dateFieldForDOW
        const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        function getDOWname (entry: any): string {
          if (!dateFieldForDOW) return ''
          const raw = entry._rawValues?.[dateFieldForDOW]
          if (raw == null || typeof raw !== 'number') return ''
          const d = new Date(raw)
          return isNaN(d.getTime()) ? '' : DOW_NAMES[d.getUTCDay()] || ''
        }

        const features: any[] = []

        if (isLinear) {
          const beginMap = new Map<string, any>()
          const endMap = new Map<string, any>()
          for (const e of entries) {
            if (e.Location === 'Begin' && e.EventID) beginMap.set(e.EventID, e)
            if (e.Location === 'End' && e.EventID) endMap.set(e.EventID, e)
          }
          for (const [eventId, beginEntry] of beginMap) {
            const endEntry = endMap.get(eventId)
            if (!endEntry) continue
            const routeData = routeGeometries.get(beginEntry.RouteID)
            if (!routeData) continue
            const pathCoords = extractPath(routeData.vertices, beginEntry.Measure, endEntry.Measure, routeData.mIdx)
            if (pathCoords.length < 2) continue
            const attrs: Record<string, any> = {
              routeid: String(beginEntry.RouteID || ''),
              routename: String(beginEntry.RouteName || ''),
              eventid: String(eventId || ''),
              frommeasure: Number(beginEntry.Measure) || 0,
              tomeasure: Number(endEntry.Measure) || 0
            }
            if (features.length === 0) {
              console.log('[ShareToArcGIS] First entry keys:', Object.keys(beginEntry))
              console.log('[ShareToArcGIS] eventAttrs:', eventAttrs)
              console.log('[ShareToArcGIS] First entry sample:', JSON.stringify(beginEntry).substring(0, 500))
            }
            populateAttrs(attrs, beginEntry, eventAttrs)
            if (hasDOW) attrs.downame = getDOWname(beginEntry)
            features.push({ geometry: { paths: [pathCoords], spatialReference: { wkid } }, attributes: attrs })
          }

          if (features.length > 0) {
            layers.push({
              id: layerIdx,
              name: eventName,
              type: 'Feature Layer',
              geometryType: 'esriGeometryPolyline',
              displayField: 'routeid',
              fields: [
                { name: 'OBJECTID', type: 'esriFieldTypeOID', alias: 'ObjectID' },
                ...baseFields,
                { name: 'frommeasure', type: 'esriFieldTypeDouble', alias: 'From Measure' },
                { name: 'tomeasure', type: 'esriFieldTypeDouble', alias: 'To Measure' },
                ...attrFields,
                ...(hasDOW ? [{ name: 'downame', type: 'esriFieldTypeString', alias: 'Day of Week', length: 12 }] : [])
              ],
              objectIdField: 'OBJECTID',
              hasAttachments: false,
              capabilities: 'Query,Editing,Create,Update,Delete',
              drawingInfo: { renderer: { type: 'simple', symbol: { type: 'esriSLS', style: 'esriSLSSolid', color: [...color, 220], width: 3 } } }
            })
            layerFeatures.push({ layerIdx, features })
            layerIdx++
          }
        } else {
          for (const entry of entries) {
            const routeData = routeGeometries.get(entry.RouteID)
            if (!routeData) continue
            const pt = interpPoint(routeData.vertices, entry.Measure, routeData.mIdx)
            if (!pt) continue
            const attrs: Record<string, any> = {
              routeid: String(entry.RouteID || ''),
              routename: String(entry.RouteName || ''),
              eventid: String(entry.EventID || ''),
              measure: Number(entry.Measure) || 0
            }
            if (features.length === 0) {
              console.log('[ShareToArcGIS] First point entry keys:', Object.keys(entry))
              console.log('[ShareToArcGIS] Point eventAttrs:', eventAttrs)
              console.log('[ShareToArcGIS] First point entry:', JSON.stringify(entry).substring(0, 500))
            }
            populateAttrs(attrs, entry, eventAttrs)
            if (hasDOW) attrs.downame = getDOWname(entry)
            features.push({ geometry: { x: pt.x, y: pt.y, spatialReference: { wkid } }, attributes: attrs })
          }

          if (features.length > 0) {
            layers.push({
              id: layerIdx,
              name: eventName,
              type: 'Feature Layer',
              geometryType: 'esriGeometryPoint',
              displayField: 'routeid',
              fields: [
                { name: 'OBJECTID', type: 'esriFieldTypeOID', alias: 'ObjectID' },
                ...baseFields,
                { name: 'measure', type: 'esriFieldTypeDouble', alias: 'Measure' },
                ...attrFields,
                ...(hasDOW ? [{ name: 'downame', type: 'esriFieldTypeString', alias: 'Day of Week', length: 12 }] : [])
              ],
              objectIdField: 'OBJECTID',
              hasAttachments: false,
              capabilities: 'Query,Editing,Create,Update,Delete',
              drawingInfo: { renderer: { type: 'simple', symbol: { type: 'esriSMS', style: 'esriSMSCircle', color: [...color, 255], size: 8, outline: { color: [255,255,255,255], width: 1 } } } }
            })
            layerFeatures.push({ layerIdx, features })
            layerIdx++
          }
        }
      }

      if (layers.length === 0) {
        throw new Error('No features could be created from the current data.')
      }

      const createServiceDef = {
        name: layerName.replace(/[^a-zA-Z0-9_]/g, '_').substring(0, 80) + '_' + Date.now(),
        serviceDescription: `Road Log export: ${layerName}`,
        hasStaticData: false,
        maxRecordCount: 10000,
        supportedQueryFormats: 'JSON',
        capabilities: 'Query,Editing',
        spatialReference: { wkid },
        initialExtent: { xmin: -20037508, ymin: -20037508, xmax: 20037508, ymax: 20037508, spatialReference: { wkid } },
        allowGeometryUpdates: true,
        units: 'esriMeters',
        xssPreventionInfo: { xssPreventionEnabled: true, xssPreventionRule: 'InputOnly', xssInputRule: 'rejectInvalid' }
      }

      // Step 1: Create Feature Service
      const createParams = new URLSearchParams()
      createParams.append('createParameters', JSON.stringify(createServiceDef))
      createParams.append('targetType', 'featureService')
      createParams.append('outputType', 'featureService')
      createParams.append('f', 'json')
      createParams.append('token', token)

      setShareProgress('Creating feature service...')
      console.log('[ShareToArcGIS] v2 - wkid:', wkid)
      console.log('[ShareToArcGIS] Creating service at:', `${contentUrl}/createService`)
      console.log('[ShareToArcGIS] Service name:', createServiceDef.name)
      console.log('[ShareToArcGIS] Portal URL:', portalUrl)
      console.log('[ShareToArcGIS] Username:', username)
      console.log('[ShareToArcGIS] Token present:', !!token)
      let createResult: any
      try {
        const createResp = await fetch(`${contentUrl}/createService?token=${encodeURIComponent(token)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: createParams
        })
        const createText = await createResp.text()
        console.log('[ShareToArcGIS] Create response status:', createResp.status)
        console.log('[ShareToArcGIS] Create response:', createText.substring(0, 500))
        try { createResult = JSON.parse(createText) } catch (e) { throw new Error('Create service returned invalid response: ' + createText.substring(0, 200)) }
      } catch (fetchErr: any) {
        console.error('[ShareToArcGIS] Fetch failed:', fetchErr)
        throw new Error('Network error creating service: ' + (fetchErr.message || fetchErr))
      }
      if (createResult.error) {
        throw new Error('Create Service: ' + (createResult.error.message || JSON.stringify(createResult.error)))
      }
      if (!createResult.serviceurl && !createResult.serviceUrl) {
        throw new Error('Create service failed — no service URL returned: ' + JSON.stringify(createResult).substring(0, 200))
      }
      const serviceUrl = createResult.serviceurl || createResult.serviceUrl
      const itemId = createResult.itemId

      // Step 2: Add layers to the service via admin
      const adminUrl = serviceUrl.replace('/rest/services/', '/rest/admin/services/')
      const addLayerParams = new URLSearchParams()
      addLayerParams.append('addToDefinition', JSON.stringify({ layers }))
      addLayerParams.append('f', 'json')
      addLayerParams.append('token', token)

      setShareProgress('Adding layer definitions...')
      console.log('[ShareToArcGIS] addToDefinition URL:', `${adminUrl}/addToDefinition`)
      console.log('[ShareToArcGIS] Layer def:', JSON.stringify({ layers }).substring(0, 1000))
      const addResp = await fetch(`${adminUrl}/addToDefinition`, { method: 'POST', body: addLayerParams })
      const addText = await addResp.text()
      console.log('[ShareToArcGIS] addToDefinition response:', addText.substring(0, 500))
      let addResult: any
      try { addResult = JSON.parse(addText) } catch (e) { throw new Error('addToDefinition invalid response: ' + addText.substring(0, 300)) }
      if (!addResult.success) {
        throw new Error(addResult.error?.message || 'addToDefinition failed: ' + JSON.stringify(addResult).substring(0, 300))
      }

      // Step 3: Add features to each layer
      const totalFeatures = layerFeatures.reduce((sum, lf) => sum + lf.features.length, 0)
      let uploadedFeatures = 0
      for (const { layerIdx: lIdx, features } of layerFeatures) {
        for (let i = 0; i < features.length; i += 1000) {
          const batch = features.slice(i, i + 1000)
          uploadedFeatures += batch.length
          setShareProgress(`Uploading features... ${uploadedFeatures}/${totalFeatures}`)
          const addFeatParams = new URLSearchParams()
          addFeatParams.append('features', JSON.stringify(batch))
          addFeatParams.append('f', 'json')
          addFeatParams.append('token', token)
          const addFeatResp = await fetch(`${serviceUrl}/${lIdx}/addFeatures`, { method: 'POST', body: addFeatParams })
          const addFeatText = await addFeatResp.text()
          console.log(`[ShareToArcGIS] addFeatures layer ${lIdx} batch ${i}: ${addFeatText.substring(0, 300)}`)
          if (i === 0) console.log('[ShareToArcGIS] Sample feature attrs:', JSON.stringify(batch[0]?.attributes))
        }
      }

      // Step 4: Update item title/description
      setShareProgress('Finalizing...')
      const updateParams = new URLSearchParams()
      updateParams.append('title', layerName)
      updateParams.append('description', `Road Log event data exported on ${new Date().toLocaleString()}`)
      updateParams.append('tags', 'Road Log,Events,LRS')
      updateParams.append('f', 'json')
      updateParams.append('token', token)
      await fetch(`${contentUrl}/items/${itemId}/update`, { method: 'POST', body: updateParams })

      const itemUrl = `${portalUrl}/home/item.html?id=${itemId}`
      setShareProgress('')
      setShareResultUrl(itemUrl)
    } catch (err: any) {
      console.error('Share to ArcGIS failed:', err)
      setShareProgress('')
      setError('Share failed: ' + (err.message || err))
    } finally {
      setSharing(false)
    }
  }, [lastReportEntries, config, selectedEvents])

  // Display events on map — separate layer per event, lines for linear, points for point
  const displayOnMap = useCallback(async () => {
    if (!lastReportEntries || lastReportEntries.length === 0) {
      setError('Run a report first to display events on the map')
      return
    }
    if (!lrsServiceRef.current || !jimuMapViewRef.current?.view) {
      setError('Map not available. Select a map widget in settings.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const view = jimuMapViewRef.current.view as __esri.MapView
      console.log(`[displayOnMap] Starting with ${lastReportEntries.length} entries, Features: ${Array.from(new Set(lastReportEntries.map((e: any) => e.Feature))).join(', ')}`)
      const [FeatureLayer, Graphic, SimpleMarkerSymbol, SimpleLineSymbol, Polyline, UniqueValueRenderer, Point] = await Promise.all([
        (window as any).SystemJS.import('esri/layers/FeatureLayer').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/Graphic').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/symbols/SimpleLineSymbol').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/geometry/Polyline').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/renderers/UniqueValueRenderer').then((m: any) => m.default || m),
        (window as any).SystemJS.import('esri/geometry/Point').then((m: any) => m.default || m)
      ])

      // Remove old event layers from map
      eventGraphicsLayersRef.current.forEach((layer) => {
        try { view.map.remove(layer) } catch (e) { /* ignore */ }
      })
      eventGraphicsLayersRef.current.clear()

      // Generate color ramp via HSL for any number of layers
      function hslToRgb (h: number, s: number, l: number): number[] {
        s /= 100; l /= 100
        const k = (n: number) => (n + h / 30) % 12
        const a = s * Math.min(l, 1 - l)
        const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
      }

      // Build a lookup: event layer name → config (for type info + category field)
      const layerNames = (config.eventLayerConfigs || []).map(e => e.name)
      const uniqueNames = Array.from(new Set(layerNames))
      const eventConfigMap = new Map<string, { type: string; categoryField: string | null }>()
      for (const name of uniqueNames) {
        const elc = (config.eventLayerConfigs || []).find(e => e.name === name)
        // Pick best category field: prefer known domain fields (like accident_type, functionalclass), else first attribute
        const PREFERRED_CATEGORY_FIELDS = ['accident_type', 'functionalclass', 'functional_class', 'functionalclasstype', 'FunctionalClassType', 'FunctionalClass', 'func_class', 'median_type', 'nhs_type', 'ownership_type', 'surface_type', 'speed_limit']
        const attrs = elc?.attributes || []
        const categoryField = attrs.find(a => PREFERRED_CATEGORY_FIELDS.includes(a)) || attrs.find(a => !!KNOWN_DOMAINS[a]) || attrs[0] || null
        eventConfigMap.set(name, { type: elc?.type || 'esriLRSPointEventLayer', categoryField })
      }

      // Group entries by event layer name
      const entriesByLayer = new Map<string, any[]>()
      for (const entry of lastReportEntries) {
        const layerName = entry.Feature
        if (!entriesByLayer.has(layerName)) {
          entriesByLayer.set(layerName, [])
        }
        entriesByLayer.get(layerName)!.push(entry)
      }

      // Get unique route IDs across all entries and fetch their geometries with M values
      const allRouteIds = Array.from(new Set(lastReportEntries.map((e: any) => e.RouteID)))
      const routeField = config.networkRouteIdField || 'customroutefield'
      const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '')
      const viewWkid = view.spatialReference?.wkid || 102100

      const routeGeometries = new Map<string, { vertices: number[][]; mIdx: number }>()
      for (const rid of allRouteIds) {
        try {
          const url = `${baseMapUrl}/${config.networkLayerId}/query`
          const params: Record<string, string> = {
            where: `${routeField} = '${rid.replace(/'/g, "''")}'`,
            outFields: routeField,
            returnGeometry: 'true',
            returnM: 'true',
            outSR: String(viewWkid),
            f: 'json'
          }
          const json = await lrsServiceRef.current!.queryFeaturesDirect(url, params)
          if (json.features?.length > 0) {
            const allVerts: number[][] = []
            for (const f of json.features) {
              if (f.geometry?.paths) {
                for (const path of f.geometry.paths) {
                  allVerts.push(...path)
                }
              }
            }
            const hasZ = json.features[0]?.geometry?.hasZ
            const mIdx = hasZ ? 3 : 2
            allVerts.sort((a, b) => (a[mIdx] || 0) - (b[mIdx] || 0))
            routeGeometries.set(rid, { vertices: allVerts, mIdx })
          }
        } catch (err) {
          console.warn(`Failed to fetch geometry for route ${rid}:`, err)
        }
      }

      // Store route geometries for diagram hover
      routeGeometriesRef.current = routeGeometries

      // Helper: interpolate a single point from M value
      function interpolatePointFromM (vertices: number[][], targetM: number, mIdx: number): { x: number; y: number } | null {
        if (vertices.length === 0) return null
        if (targetM <= (vertices[0][mIdx] || 0)) return { x: vertices[0][0], y: vertices[0][1] }
        if (targetM >= (vertices[vertices.length - 1][mIdx] || 0)) {
          return { x: vertices[vertices.length - 1][0], y: vertices[vertices.length - 1][1] }
        }
        for (let i = 0; i < vertices.length - 1; i++) {
          const m1 = vertices[i][mIdx] || 0
          const m2 = vertices[i + 1][mIdx] || 0
          if (targetM >= m1 && targetM <= m2) {
            const frac = m2 !== m1 ? (targetM - m1) / (m2 - m1) : 0
            return {
              x: vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]),
              y: vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1])
            }
          }
        }
        return null
      }

      // Helper: extract polyline vertices between two M values
      function extractPathBetweenM (vertices: number[][], fromM: number, toM: number, mIdx: number): number[][] {
        const path: number[][] = []
        const minM = Math.min(fromM, toM)
        const maxM = Math.max(fromM, toM)

        // Add interpolated start point
        const startPt = interpolatePointFromM(vertices, minM, mIdx)
        if (startPt) path.push([startPt.x, startPt.y])

        // Add all vertices within the range (inclusive boundaries)
        for (const v of vertices) {
          const m = v[mIdx] || 0
          if (m >= minM && m <= maxM) {
            // Avoid duplicating the interpolated start/end points
            const last = path[path.length - 1]
            if (!last || v[0] !== last[0] || v[1] !== last[1]) {
              path.push([v[0], v[1]])
            }
          }
        }

        // Add interpolated end point
        const endPt = interpolatePointFromM(vertices, maxM, mIdx)
        if (endPt) {
          const last = path[path.length - 1]
          if (!last || endPt.x !== last[0] || endPt.y !== last[1]) {
            path.push([endPt.x, endPt.y])
          }
        }

        return path
      }

      // Process each event layer
      let totalPlotted = 0
      for (const [layerName, entries] of entriesByLayer) {
       try {
        const layerInfo = eventConfigMap.get(layerName) || { type: 'esriLRSPointEventLayer', categoryField: null }
        console.log(`[displayOnMap] Processing "${layerName}": ${entries.length} entries, type=${layerInfo.type}`)
        const isLinear = layerInfo.type === 'esriLRSLinearEventLayer'
        const catField = layerInfo.categoryField
        const graphics: any[] = []
        let oid = 1

        if (isLinear) {
          // Pair Begin/End by EventID and build polyline graphics
          const beginMap = new Map<string, any>()
          const endMap = new Map<string, any>()
          for (const e of entries) {
            if (e.Location === 'Begin' && e.EventID) beginMap.set(e.EventID, e)
            if (e.Location === 'End' && e.EventID) endMap.set(e.EventID, e)
          }
          console.log(`[displayOnMap] "${layerName}": ${beginMap.size} begin, ${endMap.size} end entries`)

          for (const [eventId, beginEntry] of beginMap) {
            const endEntry = endMap.get(eventId)
            if (!endEntry) { console.warn(`[displayOnMap] "${layerName}" event ${eventId}: no matching end entry`); continue }

            const routeData = routeGeometries.get(beginEntry.RouteID)
            if (!routeData) { console.warn(`[displayOnMap] "${layerName}" event ${eventId}: no route geometry for ${beginEntry.RouteID}`); continue }

            const pathCoords = extractPathBetweenM(routeData.vertices, beginEntry.Measure, endEntry.Measure, routeData.mIdx)
            console.log(`[displayOnMap] "${layerName}" event ${eventId}: M ${beginEntry.Measure}(${typeof beginEntry.Measure})-${endEntry.Measure}(${typeof endEntry.Measure}), pathCoords=${pathCoords.length}, mIdx=${routeData.mIdx}`)
            if (pathCoords.length >= 2) {
              console.log(`[displayOnMap] "${layerName}" pathCoords[0]=[${pathCoords[0]}], pathCoords[last]=[${pathCoords[pathCoords.length-1]}]`)
            }
            if (pathCoords.length < 2) { console.warn(`[displayOnMap] "${layerName}" event ${eventId}: pathCoords < 2, skipping`); continue }

            const detailAttrs = Object.keys(beginEntry)
              .filter(k => !k.startsWith('_') && !['RouteID', 'RouteName', 'Feature', 'Location', 'Measure', 'Referent', 'offset', 'EventID'].includes(k))
              .map(k => `${k}: ${beginEntry[k]}`)
              .join(', ')

            const attrs: Record<string, any> = {
              ObjectID: oid++,
              routeId: beginEntry.RouteID,
              fromMeasure: beginEntry.Measure,
              toMeasure: endEntry.Measure,
              details: detailAttrs
            }
            if (catField) attrs.category = String(beginEntry[catField] ?? 'Unknown')

            graphics.push(new Graphic({
              geometry: new Polyline({
                paths: [pathCoords],
                spatialReference: { wkid: viewWkid }
              }),
              attributes: attrs
            }))
            totalPlotted++
          }
        } else {
          // Point events
          for (const entry of entries) {
            const routeData = routeGeometries.get(entry.RouteID)
            if (!routeData) continue

            const pt = interpolatePointFromM(routeData.vertices, entry.Measure, routeData.mIdx)
            if (!pt) continue

            const detailAttrs = Object.keys(entry)
              .filter(k => !k.startsWith('_') && !['RouteID', 'RouteName', 'Feature', 'Location', 'Measure', 'Referent', 'offset', 'EventID'].includes(k))
              .map(k => `${k}: ${entry[k]}`)
              .join(', ')

            const attrs: Record<string, any> = {
              ObjectID: oid++,
              routeId: entry.RouteID,
              measure: entry.Measure,
              details: detailAttrs
            }
            if (catField) attrs.category = String(entry[catField] ?? 'Unknown')

            graphics.push(new Graphic({
              geometry: new Point({
                x: pt.x,
                y: pt.y,
                spatialReference: { wkid: viewWkid }
              }),
              attributes: attrs
            }))
            totalPlotted++
          }
        }

        if (graphics.length === 0) { console.warn(`[displayOnMap] "${layerName}": 0 graphics produced, skipping layer`); continue }
        console.log(`[displayOnMap] "${layerName}": ${graphics.length} graphics to add`)
        graphics.forEach((g: any, i: number) => {
          const geom = g.geometry
          console.log(`[displayOnMap] "${layerName}" graphic[${i}]:`, JSON.stringify(g.attributes), `geomType=${geom?.type}, paths/points=${geom?.paths?.length ?? geom?.x}`)
        })

        // Distinct color palettes per layer — use config index so colors match diagram
        const layerIdx = (config.eventLayerConfigs || []).findIndex(c => c.name === layerName)
        const palettes: number[][][] = [
          // Reds
          [[255,59,48],[220,40,30],[180,20,20],[255,105,97],[200,60,50],[255,150,140],[160,10,10],[230,80,65],[140,0,0],[255,180,170]],
          // Blues
          [[0,122,255],[30,80,200],[0,180,235],[65,105,225],[25,25,180],[100,149,237],[0,60,160],[70,130,230],[20,100,190],[135,180,255]],
          // Greens
          [[52,199,89],[34,139,34],[0,128,0],[60,179,113],[46,160,67],[0,168,107],[34,120,60],[85,200,90],[20,100,40],[130,220,150]],
          // Oranges
          [[255,149,0],[255,165,80],[230,120,0],[255,180,50],[200,100,0],[245,130,30],[180,80,0],[255,200,100],[210,140,20],[240,160,60]],
          // Purples
          [[175,82,222],[128,0,128],[148,103,189],[186,85,211],[138,43,226],[153,50,204],[106,13,173],[180,120,230],[90,0,150],[200,150,255]],
          // Teals
          [[0,199,190],[0,150,136],[32,178,170],[0,180,160],[20,130,120],[64,224,208],[0,160,150],[100,210,200],[0,110,100],[150,230,220]],
          // Magentas
          [[255,45,85],[219,68,85],[199,21,133],[230,50,100],[180,30,80],[255,100,130],[160,20,70],[240,75,110],[140,10,60],[255,140,160]],
          // Browns/Earth
          [[162,132,94],[139,90,43],[160,82,45],[185,130,80],[120,70,30],[200,150,100],[100,60,20],[170,120,70],[80,50,10],[210,170,120]]
        ]
        const palette = palettes[layerIdx % palettes.length]

        const uniqueValues = Array.from(new Set(graphics.map(g => g.attributes.category || 'All')))
        // Sort: try numeric sort, fall back to alphabetical
        uniqueValues.sort((a, b) => {
          const na = Number(a), nb = Number(b)
          if (!isNaN(na) && !isNaN(nb)) return na - nb
          return a.localeCompare(b)
        })

        const uvInfos = uniqueValues.map((val, idx) => {
          const rgb = palette[idx % palette.length]
          const symbol = isLinear
            ? new SimpleLineSymbol({ color: [...rgb, 220], width: 4, style: 'solid' })
            : new SimpleMarkerSymbol({ color: [...rgb, 220], size: 8, outline: { color: [255, 255, 255], width: 1 } })
          return { value: val, symbol, label: String(val) }
        })

        const defaultSymbol = isLinear
          ? new SimpleLineSymbol({ color: [150, 150, 150, 200], width: 3, style: 'solid' })
          : new SimpleMarkerSymbol({ color: [150, 150, 150, 200], size: 7, outline: { color: [255, 255, 255], width: 1 } })

        const renderer = new UniqueValueRenderer({
          field: 'category',
          defaultSymbol,
          defaultLabel: 'Other',
          uniqueValueInfos: uvInfos
        })
        console.log(`[displayOnMap] "${layerName}" renderer: field=category, uvInfos=${uvInfos.length}, values=[${uvInfos.map((u: any) => u.value).join(',')}]`)

        const fields: any[] = [
          { name: 'ObjectID', type: 'oid' },
          { name: 'routeId', type: 'string' },
          { name: 'details', type: 'string' },
          { name: 'category', type: 'string' }
        ]
        if (isLinear) {
          fields.push({ name: 'fromMeasure', type: 'double' })
          fields.push({ name: 'toMeasure', type: 'double' })
        } else {
          fields.push({ name: 'measure', type: 'double' })
        }

        const popupContent = isLinear
          ? `<b>${layerName}</b><br/>${catField ? '{category}<br/>' : ''}M: {fromMeasure} \u2013 {toMeasure}<br/>{details}`
          : `<b>${layerName}</b><br/>${catField ? '{category}<br/>' : ''}M: {measure}<br/>{details}`

        const fLayer = new FeatureLayer({
          source: graphics,
          objectIdField: 'ObjectID',
          geometryType: isLinear ? 'polyline' : 'point',
          spatialReference: { wkid: viewWkid },
          title: layerName,
          fields,
          renderer,
          popupTemplate: {
            title: `{routeId} \u2014 ${layerName}`,
            content: popupContent
          }
        })
        try {
          view.map.add(fLayer)
          eventGraphicsLayersRef.current.set(layerName, fLayer)
          // Watch visibility changes (e.g. from LayerList widget or diagram toggle)
          const visHandle = fLayer.watch('visible', (visible: boolean) => {
            setMapDisabledLayers(prev => {
              const next = new Set(prev)
              if (!visible) next.add(layerName)
              else next.delete(layerName)
              return next
            })
          })
          layerVisibilityWatchesRef.current.push(visHandle)
          console.log(`[displayOnMap] Added layer "${layerName}" with ${graphics.length} graphics`)
          // Verify layer loaded
          fLayer.when(() => {
            console.log(`[displayOnMap] Layer "${layerName}" loaded successfully, featureCount=${fLayer.source?.length}`)
            fLayer.queryExtent().then((r: any) => {
              console.log(`[displayOnMap] Layer "${layerName}" extent:`, r.extent ? `${r.extent.xmin},${r.extent.ymin} - ${r.extent.xmax},${r.extent.ymax}` : 'null')
            }).catch((e: any) => console.error(`[displayOnMap] Layer "${layerName}" queryExtent failed:`, e))
          }).catch((e: any) => console.error(`[displayOnMap] Layer "${layerName}" FAILED to load:`, e))
        } catch (layerErr) {
          console.error(`[displayOnMap] Failed to add layer "${layerName}":`, layerErr)
        }
       } catch (layerProcessErr) {
          console.error(`[displayOnMap] ERROR processing layer "${layerName}":`, layerProcessErr)
       }
      }

      if (totalPlotted === 0) {
        setError('Could not locate any events on the map')
      } else {
        // Zoom to the combined extent of all event layers
        const allLayers = Array.from(eventGraphicsLayersRef.current.values())
        const extentPromises = allLayers.map((l: any) => l.queryExtent().then((r: any) => r.extent).catch(() => null))
        const extents = (await Promise.all(extentPromises)).filter(Boolean)
        if (extents.length > 0) {
          let combined = extents[0]
          for (let i = 1; i < extents.length; i++) {
            combined = combined.union(extents[i])
          }
          view.goTo(combined.expand(1.3))
        }
      }
    } catch (err: any) {
      setError('Failed to display events: ' + (err.message || err))
    } finally {
      setLoading(false)
      setEventsOnMap(true)
    }
  }, [lastReportEntries, config])

  // Ref for displayOnMap so useEffect can call it without stale closure
  const displayOnMapRef = useRef(displayOnMap)
  displayOnMapRef.current = displayOnMap

  // Auto-display events on map when new report results arrive
  const prevReportEntriesRef = useRef<any[] | null>(null)
  useEffect(() => {
    if (lastReportEntries && lastReportEntries.length > 0 && lastReportEntries !== prevReportEntriesRef.current) {
      prevReportEntriesRef.current = lastReportEntries
      displayOnMapRef.current()
    }
  }, [lastReportEntries])

  // Render
  if (!config?.lrsServiceUrl) {
    return (
      <div className="jimu-widget p-3" style={containerStyle}>
        <p style={{ color: '#6e6e6e', fontSize: '13px' }}>
          Configure the LRS service URL in widget settings.
        </p>
      </div>
    )
  }

  return (
    <div className="jimu-widget p-3" style={containerStyle}>
      <h5 style={headerStyle}>Road Log Report (v2026.05.12 15:50)</h5>

      {/* Event layer selection */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Event Layers</label>
        <div style={eventListStyle}>
          {config.eventLayerConfigs?.map(eventLayer => (
            <label key={eventLayer.layerId} style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selectedEvents.has(eventLayer.layerId)}
                onChange={() => toggleEvent(eventLayer.layerId)}
              />
              <span style={{ marginLeft: '4px' }}>
                {eventLayer.name}
                {' '}
                <span style={{ color: '#888', fontSize: '11px' }}>
                  {eventLayer.type === 'esriLRSPointEventLayer' || eventLayer.type === 'esriLRSIntersectionLayer' ? '(point)' : '(line)'}
                </span>
              </span>
            </label>
          ))}
        </div>
        <div style={{ marginTop: '4px' }}>
          <button type="button" onClick={selectAllEvents} style={smallBtnStyle}>Select All</button>
          <button type="button" onClick={clearAllEvents} style={{ ...smallBtnStyle, marginLeft: '4px' }}>Clear</button>
        </div>
      </div>

      {/* Search mode toggle */}
      <div style={sectionStyle}>
        <label style={labelStyle}>Search For Route By:</label>
        <div>
          <button
            type="button"
            onClick={() => { setSearchMode('name'); setRouteId(''); setRouteName(''); setFromMeasure(''); setToMeasure(''); setRouteMeasureRange(null); setLastReportEntries(null); setShowDiagram(false); setError(null); clearRoutePreview(); clearDisplayOnMap() }}
            style={searchMode === 'name' ? activeBtnStyle : smallBtnStyle}
          >Name</button>
          <button
            type="button"
            onClick={() => { setSearchMode('id'); setRouteId(''); setRouteName(''); setFromMeasure(''); setToMeasure(''); setRouteMeasureRange(null); setLastReportEntries(null); setShowDiagram(false); setError(null); clearRoutePreview(); clearDisplayOnMap() }}
            style={{ ...(searchMode === 'id' ? activeBtnStyle : smallBtnStyle), marginLeft: '4px' }}
          >ID</button>
          {hasMapWidget && (
            <button
              type="button"
              onClick={() => { setSearchMode('map'); setRouteId(''); setRouteName(''); setFromMeasure(''); setToMeasure(''); setRouteMeasureRange(null); setLastReportEntries(null); setShowDiagram(false); setError(null); clearRoutePreview(); clearDisplayOnMap() }}
              style={{ ...(searchMode === 'map' ? activeBtnStyle : smallBtnStyle), marginLeft: '4px' }}
            >Map</button>
          )}
        </div>
      </div>

      {/* JimuMapViewComponent (hidden, just for getting map reference) */}
      {hasMapWidget && (
        <JimuMapViewComponent
          useMapWidgetId={props.useMapWidgetIds?.[0] ?? (props.useMapWidgetIds as any)?.get?.(0)}
          onActiveViewChange={onActiveViewChange}
        />
      )}

      {/* Map mode: polygon draw */}
      {searchMode === 'map' && (
        <div style={sectionStyle}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={startPolygonDraw}
              disabled={drawing}
              style={{ ...primaryBtnStyle, backgroundColor: drawing ? '#999' : '#0079c1', flex: 1 }}
            >
              {drawing ? 'Drawing...' : 'Draw Polygon to Select Routes'}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              title="Clear selection"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                backgroundColor: '#e0e0e0',
                color: '#333',
                border: '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              ✕
            </button>
          </div>
          {mapRoutes.length > 0 && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#333' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <strong>{selectedMapRouteIds.size}/{mapRoutes.length} route{mapRoutes.length > 1 ? 's' : ''} selected</strong>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button type="button" onClick={() => {
                    const allIds = new Set(mapRoutes.map(r => r.routeId))
                    setSelectedMapRouteIds(allIds)
                    if (routeGraphicsLayerRef.current) {
                      routeGraphicsLayerRef.current.graphics?.toArray()?.forEach((g: any) => { g.visible = true })
                    }
                  }} style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', backgroundColor: '#f5f5f5' }}>
                    Select All
                  </button>
                  <button type="button" onClick={() => {
                    setSelectedMapRouteIds(new Set())
                    if (routeGraphicsLayerRef.current) {
                      routeGraphicsLayerRef.current.graphics?.toArray()?.forEach((g: any) => { g.visible = false })
                    }
                  }} style={{ fontSize: '10px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', backgroundColor: '#f5f5f5' }}>
                    Clear
                  </button>
                </div>
              </div>
              <div style={{ maxHeight: '120px', overflow: 'auto', padding: '4px', border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                {mapRoutes.map((r, i) => (
                  <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '2px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedMapRouteIds.has(r.routeId)}
                      onChange={() => toggleMapRoute(r.routeId)}
                      style={{ margin: 0 }}
                    />
                    <span style={{ color: selectedMapRouteIds.has(r.routeId) ? '#333' : '#999' }}>
                      {r.routeId}
                      {r.toMeasure != null && (
                        <span style={{ color: selectedMapRouteIds.has(r.routeId) ? '#666' : '#bbb', marginLeft: '6px' }}>
                          (M: {r.fromMeasure} – {r.toMeasure})
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Route input (Name/ID modes only) */}
      {searchMode !== 'map' && (
      <div style={sectionStyle}>
        <label style={labelStyle}>{searchMode === 'name' ? 'Route Name' : 'Route ID'}</label>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={() => {
              if (pickingFromMap) { cancelPickFromMap() }
              else if (routeId) { setRouteId(''); setRouteName(''); setFromMeasure(''); setToMeasure(''); setRouteMeasureRange(null); clearRoutePreview() }
              else { startPickFromMap() }
            }}
            title={pickingFromMap ? 'Cancel map pick' : routeId ? 'Clear selection' : 'Pick route from map'}
            style={{
              width: '32px', height: '32px', padding: 0, border: '1px solid #ccc',
              borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: pickingFromMap ? '#e3f2fd' : routeId ? '#ffebee' : '#fff', flexShrink: 0
            }}
          >
            {pickingFromMap
              ? <calcite-icon icon="cursor-minus" scale="s" style={{ color: '#1976d2' }} />
              : routeId
              ? <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#c62828' }}>✕</span>
              : <calcite-icon icon="cursor-minus" scale="s" />
            }
          </button>
          <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            value={searchMode === 'id' ? routeId : routeName}
            onChange={(e) => handleRouteSearch(e.target.value)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            style={inputStyle}
            placeholder={searchMode === 'id' ? 'Enter route ID...' : 'Enter route name...'}
          />
          {showSuggestions && (
            <div style={suggestionsStyle}>
              {routeSuggestions.map((r, i) => (
                <div
                  key={i}
                  style={suggestionItemStyle}
                  onMouseDown={() => selectRoute(r)}
                >
                  {r.routeName || r.routeId}
                  {r.routeName && <span style={{ color: '#999', marginLeft: '8px' }}>{r.routeId}</span>}
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
      )}

      {/* Route pick disambiguation dialog — positioned under Route input */}
      {routePickCandidates && routePickCandidates.length > 1 && (
        <div style={{
          margin: '4px 0 0 0', padding: '10px', border: '2px solid #0079c1', borderRadius: '6px',
          backgroundColor: '#f0f7ff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <strong style={{ fontSize: '12px', color: '#333' }}>
              {routePickCandidates.length} routes at this location
            </strong>
            <button
              type="button"
              onClick={() => { setRoutePickCandidates(null); clearRoutePreview() }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666', lineHeight: 1 }}
            >✕</button>
          </div>
          <div style={{ maxHeight: '140px', overflow: 'auto' }}>
            {routePickCandidates.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setRouteId(c.routeId)
                  setRouteName(c.routeName)
                  setRoutePickCandidates(null)
                  showRoutePreviewRef.current(c.routeId, false)
                }}
                onMouseEnter={() => { showRoutePreviewRef.current(c.routeId, false) }}
                onMouseLeave={() => { clearRoutePreview() }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px',
                  marginBottom: '3px', border: '1px solid #ddd', borderRadius: '4px',
                  backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px'
                }}
              >
                <span style={{ fontWeight: 500 }}>{c.routeName}</span>
                {c.routeName !== c.routeId && (
                  <span style={{ color: '#888', marginLeft: '8px' }}>{c.routeId}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Measures (hidden in map mode — derived from polygon clipping) */}
      {searchMode !== 'map' && (
        <>
          <div style={sectionStyle}>
            <label style={labelStyle}>From Measure{routeMeasureRange ? <span style={{ fontWeight: 'normal', color: '#888', marginLeft: '6px' }}>({routeMeasureRange.min.toFixed(3)})</span> : null}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  if (pickingMeasure === 'from') { cancelPickMeasure() }
                  else if (fromMeasure) { setFromMeasure(''); if (routePreviewLayerRef.current && fromMeasureGraphicRef.current) { (Array.isArray(fromMeasureGraphicRef.current) ? fromMeasureGraphicRef.current : [fromMeasureGraphicRef.current]).forEach(g => routePreviewLayerRef.current.remove(g)); fromMeasureGraphicRef.current = null } }
                  else { startPickMeasure('from') }
                }}
                title={pickingMeasure === 'from' ? 'Cancel' : fromMeasure ? 'Clear from measure' : 'Pick from map'}
                style={{
                  width: '32px', height: '32px', padding: 0, border: '1px solid #ccc',
                  borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: pickingMeasure === 'from' ? '#fff3e0' : fromMeasure ? '#ffebee' : '#fff', flexShrink: 0
                }}
              >
                {pickingMeasure === 'from'
                  ? <calcite-icon icon="select-range" scale="s" style={{ color: '#e65100' }} />
                  : fromMeasure
                  ? <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#c62828' }}>✕</span>
                  : <calcite-icon icon="select-range" scale="s" />
                }
              </button>
              <input
                type="number"
                value={fromMeasure}
                onChange={(e) => setFromMeasure(e.target.value)}
                onBlur={() => { if (fromMeasure) showMeasurePointRef.current('from', fromMeasure) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && fromMeasure) showMeasurePointRef.current('from', fromMeasure) }}
                style={{ ...inputStyle, flex: 1 }}
                placeholder={routeMeasureRange ? `${routeMeasureRange.min.toFixed(3)}` : 'Start measure'}
              />
            </div>
          </div>

          <div style={sectionStyle}>
            <label style={labelStyle}>To Measure{routeMeasureRange ? <span style={{ fontWeight: 'normal', color: '#888', marginLeft: '6px' }}>({routeMeasureRange.max.toFixed(3)})</span> : null}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  if (pickingMeasure === 'to') { cancelPickMeasure() }
                  else if (toMeasure) { setToMeasure(''); if (routePreviewLayerRef.current && toMeasureGraphicRef.current) { (Array.isArray(toMeasureGraphicRef.current) ? toMeasureGraphicRef.current : [toMeasureGraphicRef.current]).forEach(g => routePreviewLayerRef.current.remove(g)); toMeasureGraphicRef.current = null } }
                  else { startPickMeasure('to') }
                }}
                title={pickingMeasure === 'to' ? 'Cancel' : toMeasure ? 'Clear to measure' : 'Pick from map'}
                style={{
                  width: '32px', height: '32px', padding: 0, border: '1px solid #ccc',
                  borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: pickingMeasure === 'to' ? '#fff3e0' : toMeasure ? '#ffebee' : '#fff', flexShrink: 0
                }}
              >
                {pickingMeasure === 'to'
                  ? <calcite-icon icon="select-range" scale="s" style={{ color: '#e65100' }} />
                  : toMeasure
                  ? <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#c62828' }}>✕</span>
                  : <calcite-icon icon="select-range" scale="s" />
                }
              </button>
              <input
                type="number"
                value={toMeasure}
                onChange={(e) => setToMeasure(e.target.value)}
                onBlur={() => { if (toMeasure) showMeasurePointRef.current('to', toMeasure) }}
                onKeyDown={(e) => { if (e.key === 'Enter' && toMeasure) showMeasurePointRef.current('to', toMeasure) }}
                style={{ ...inputStyle, flex: 1 }}
                placeholder={routeMeasureRange ? `${routeMeasureRange.max.toFixed(3)}` : 'End measure'}
              />
            </div>
          </div>
        </>
      )}

      {/* Action bar */}
      <div style={{ marginTop: '12px' }}>
        {lastReportEntries && lastReportEntries.length > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {/* Diagram */}
            <button
              type="button"
              onClick={() => setShowDiagram(true)}
              disabled={loading}
              title="Straight Line Diagram"
              style={toolbarBtnStyle}
            >
              <calcite-icon icon="graph-bar-side-by-side" scale="s" />
            </button>

            {/* Export dropdown */}
            <div style={{ position: 'relative' }} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setShowExportMenu(false) }}>
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={loading || !!exportingPdf}
                title="Export"
                style={{ ...toolbarBtnStyle, width: 'auto', paddingLeft: '8px', paddingRight: '6px', gap: '3px', opacity: exportingPdf ? 0.6 : 1 }}
              >
                <calcite-icon icon="download" scale="s" />
                {exportingPdf ? <span style={{ fontSize: '11px' }}>…</span> : <calcite-icon icon="chevron-down" scale="s" style={{ width: '10px', height: '10px' }} />}
              </button>
              {showExportMenu && (
                <div style={dropdownMenuStyle}>
                  <button
                    type="button"
                    onClick={() => { setShowExportMenu(false); exportPDF() }}
                    disabled={!!exportingPdf}
                    style={dropdownItemStyle}
                  >
                    <calcite-icon icon="file-pdf" scale="s" /> PDF All
                  </button>
                  {hasMapWidget && (
                    <button
                      type="button"
                      onClick={() => { setShowExportMenu(false); exportPDFByEvent() }}
                      disabled={!!exportingPdf}
                      style={dropdownItemStyle}
                    >
                      <calcite-icon icon="file-pdf" scale="s" /> PDF by Event
                    </button>
                  )}
                  {searchMode === 'map' && hasMapWidget && (
                    <button
                      type="button"
                      onClick={() => { setShowExportMenu(false); exportPDFByRoute() }}
                      disabled={!!exportingPdf}
                      style={dropdownItemStyle}
                    >
                      <calcite-icon icon="file-pdf" scale="s" /> PDF by Route
                    </button>
                  )}
                  {searchMode === 'map' && hasMapWidget && (
                    <button
                      type="button"
                      onClick={() => { setShowExportMenu(false); exportPDFByRouteEvent() }}
                      disabled={!!exportingPdf}
                      style={dropdownItemStyle}
                    >
                      <calcite-icon icon="file-pdf" scale="s" /> PDF by Route &amp; Event
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setShowExportMenu(false); exportReport() }}
                    style={dropdownItemStyle}
                  >
                    <calcite-icon icon="file-csv" scale="s" /> CSV Report
                  </button>
                </div>
              )}
            </div>

            {/* Share to ArcGIS */}
            <button
              type="button"
              onClick={() => { setShowShareModal(true); setShareLayerName(`Road_Log_${new Date().toISOString().slice(0,10)}`); setCreateCrashDashboard(false) }}
              disabled={loading || sharing}
              title="Share to ArcGIS"
              style={toolbarBtnStyle}
            >
              <calcite-icon icon="share" scale="s" />
            </button>

            {/* Show/Hide Events toggle */}
            {hasMapWidget && (
              <button
                type="button"
                onClick={() => { if (eventsOnMap) { clearDisplayOnMap() } else { displayOnMap() } }}
                disabled={loading}
                title={eventsOnMap ? 'Hide events from map' : 'Show events on map'}
                style={{ ...toolbarBtnStyle, width: 'auto', paddingLeft: '8px', paddingRight: '8px', gap: '4px', backgroundColor: eventsOnMap ? '#c62828' : undefined, color: eventsOnMap ? '#fff' : undefined, borderColor: eventsOnMap ? '#c62828' : undefined }}
              >
                <calcite-icon icon={eventsOnMap ? 'view-hide' : 'view-visible'} scale="s" />
                <span style={{ fontSize: '11px', fontWeight: 500 }}>Events</span>
              </button>
            )}

            {/* Clear / Reset */}
            <button
              type="button"
              onClick={() => {
                setRouteId(''); setRouteName(''); setFromMeasure(''); setToMeasure(''); setRouteMeasureRange(null); setLastReportEntries(null); setShowDiagram(false); setError(null); clearRoutePreview(); clearDisplayOnMap(); clearSelection()
              }}
              title="Clear results"
              style={{ ...toolbarBtnStyle, marginLeft: 'auto' }}
            >
              <calcite-icon icon="reset" scale="s" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={runReport}
            disabled={loading}
            style={{ ...primaryBtnStyle, width: '100%' }}
          >
            {loading ? 'Searching...' : '\u25B6 Search'}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div style={errorStyle}>{error}</div>
      )}

      {/* Share to ArcGIS modal */}
      {showShareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '24px', width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', position: 'relative' }}>
            {/* Close X button */}
            <button
              type="button"
              onClick={() => { setShowShareModal(false); setShareLayerName(''); setShareResultUrl(''); setShareProgress('') }}
              style={{ position: 'absolute', top: '8px', right: '12px', background: 'none', border: 'none', fontSize: '20px', color: '#666', cursor: 'pointer', lineHeight: 1 }}
              title="Close"
            >
              {'\u00d7'}
            </button>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#333' }}>Share to ArcGIS</h3>

            {shareResultUrl ? (
              /* Success state */
              <div>
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '36px' }}>{'\u2705'}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#333', textAlign: 'center', margin: '0 0 12px' }}>
                  Layer saved successfully!
                </p>
                <a
                  href={shareResultUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', textAlign: 'center', fontSize: '13px', color: '#0079c1', textDecoration: 'underline', marginBottom: '16px' }}
                >
                  Open in ArcGIS Portal
                </a>
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setShowShareModal(false); setShareLayerName(''); setShareResultUrl('') }}
                    style={{ padding: '8px 20px', border: 'none', borderRadius: '4px', background: '#0079c1', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Input / Progress state */
              <div>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
                  Save all event data ({lastReportEntries?.length || 0} records) as a hosted Feature Layer in your My Content.
                </p>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#444', display: 'block', marginBottom: '4px' }}>Layer Name</label>
                <input
                  type="text"
                  value={shareLayerName}
                  onChange={(e) => setShareLayerName(e.target.value)}
                  disabled={sharing}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px', boxSizing: 'border-box' }}
                  placeholder="Enter layer name..."
                  autoFocus
                />
                {(() => {
                  // Detect if any selected event layer is a crash layer
                  const CRASH_INDICATORS = ['accident_type', 'collision_type', 'crash_severity', 'number_fatalities', 'number_injuries', 'crash_type', 'accident_severity']
                  const selectedConfigs = config.eventLayerConfigs?.filter(e => selectedEvents.has(e.layerId)) || []
                  const hasCrash = selectedConfigs.some(cfg =>
                    /crash|accident|collision/i.test(cfg.name) ||
                    (cfg.attributes || []).some(a => CRASH_INDICATORS.includes(a.toLowerCase()))
                  )
                  if (!hasCrash) return null
                  return (
                    <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#e65100', marginBottom: '6px' }}>
                        {'\u26A0\uFE0F'} Crash Data Detected
                      </div>
                      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: sharing ? 'default' : 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={createCrashDashboard}
                          onChange={(e) => setCreateCrashDashboard(e.target.checked)}
                          disabled={sharing}
                          style={{ marginTop: '2px', accentColor: '#e65100' }}
                        />
                        <span style={{ fontSize: '11px', color: '#555', lineHeight: '1.4' }}>
                          Create a Crash Data Analysis Viewer app from these events
                        </span>
                      </label>
                    </div>
                  )
                })()}
                {shareProgress && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '11px', color: '#555', margin: '0 0 6px' }}>{shareProgress}</p>
                    <div style={{ height: '4px', borderRadius: '2px', background: '#e0e0e0', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#0079c1', borderRadius: '2px', animation: 'shareBarPulse 1.5s infinite', width: '60%' }} />
                    </div>
                    <style>{`@keyframes shareBarPulse { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }`}</style>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => { setShowShareModal(false); setShareLayerName(''); setShareProgress('') }}
                    disabled={sharing}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => saveToArcGIS(shareLayerName)}
                    disabled={sharing || !shareLayerName.trim()}
                    style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: sharing ? '#aaa' : '#0079c1', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}
                  >
                    {sharing ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Straight Line Diagram panel */}
      {showDiagram && lastReportEntries && lastReportEntries.length > 0 && (
        <StraightLineDiagram
          entries={lastReportEntries}
          eventLayerConfigs={config.eventLayerConfigs?.filter(e => selectedEvents.has(e.layerId)) || []}
          onClose={() => setShowDiagram(false)}
          mapView={jimuMapViewRef.current?.view}
          routeGeometries={routeGeometriesRef.current}
          disabledLayerNames={mapDisabledLayers}
          onToggleLayer={(layerName, visible) => {
            const layer = eventGraphicsLayersRef.current.get(layerName)
            if (layer) layer.visible = visible
          }}
          onExportReport={exportReport}
        />
      )}
    </div>
  )
}

// Styles
const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  boxSizing: 'border-box',
  overflow: 'auto',
  fontSize: '13px'
}

const headerStyle: React.CSSProperties = {
  margin: '0 0 12px 0',
  fontSize: '14px',
  fontWeight: 600
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '10px'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  marginBottom: '4px',
  color: '#333'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  fontSize: '13px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  boxSizing: 'border-box'
}

const eventListStyle: React.CSSProperties = {
  maxHeight: '120px',
  overflow: 'auto',
  border: '1px solid #e0e0e0',
  borderRadius: '4px',
  padding: '6px'
}

const checkboxLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  padding: '2px 0',
  cursor: 'pointer'
}

const smallBtnStyle: React.CSSProperties = {
  padding: '3px 10px',
  fontSize: '12px',
  border: '1px solid #ccc',
  borderRadius: '3px',
  backgroundColor: '#f5f5f5',
  cursor: 'pointer'
}

const activeBtnStyle: React.CSSProperties = {
  ...smallBtnStyle,
  backgroundColor: '#0079c1',
  color: '#fff',
  borderColor: '#0079c1'
}

const primaryBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  fontSize: '13px',
  color: '#fff',
  backgroundColor: '#0079c1',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
}

const errorStyle: React.CSSProperties = {
  marginTop: '8px',
  padding: '8px',
  fontSize: '12px',
  color: '#d83020',
  backgroundColor: '#fef0ef',
  borderRadius: '4px'
}

const suggestionsStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  borderRadius: '4px',
  maxHeight: '150px',
  overflow: 'auto',
  zIndex: 1000,
  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
}

const suggestionItemStyle: React.CSSProperties = {
  padding: '6px 8px',
  fontSize: '12px',
  cursor: 'pointer',
  borderBottom: '1px solid #f0f0f0'
}

const toolbarBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '34px',
  height: '34px',
  padding: 0,
  border: '1px solid #d4d4d4',
  borderRadius: '4px',
  backgroundColor: '#fff',
  color: '#333',
  cursor: 'pointer',
  flexShrink: 0
}

const dropdownMenuStyle: React.CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: 0,
  marginTop: '4px',
  backgroundColor: '#fff',
  border: '1px solid #d4d4d4',
  borderRadius: '6px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  zIndex: 1000,
  minWidth: '150px',
  overflow: 'hidden'
}

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
  padding: '8px 12px',
  fontSize: '12px',
  border: 'none',
  backgroundColor: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
  color: '#333'
}

export default Widget
