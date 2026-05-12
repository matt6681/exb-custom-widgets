/** @jsxRuntime classic */
import { React } from 'jimu-core'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { EventLayerConfig } from '../config'

const { useState, useRef, useEffect, useMemo, useCallback } = React

export interface RouteGeometryData {
  vertices: number[][]
  mIdx: number
}

interface StraightLineDiagramProps {
  entries: any[]
  eventLayerConfigs: EventLayerConfig[]
  onClose: () => void
  mapView?: any // __esri.MapView
  routeGeometries?: Map<string, RouteGeometryData>
  disabledLayerNames?: Set<string>
  onToggleLayer?: (layerName: string, visible: boolean) => void
  onExportReport?: () => void
}

const MIN_PANEL_HEIGHT = 48
const DEFAULT_PANEL_HEIGHT = 300
const MAX_PANEL_HEIGHT_RATIO = 0.6

// Interpolate x,y from M value along route polyline
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

// Find nearest M on a route polyline from a map point
function nearestMFromPoint (vertices: number[][], px: number, py: number, mIdx: number): number | null {
  if (vertices.length === 0) return null
  let bestDist = Infinity
  let bestM = vertices[0][mIdx] || 0
  for (const v of vertices) {
    const dx = v[0] - px
    const dy = v[1] - py
    const d = dx * dx + dy * dy
    if (d < bestDist) {
      bestDist = d
      bestM = v[mIdx] || 0
    }
  }
  return bestM
}

// Preferred category fields — must match displayOnMap logic in widget.tsx
const PREFERRED_CATEGORY_FIELDS = ['accident_type', 'functionalclass', 'functional_class', 'functionalclasstype', 'FunctionalClassType', 'FunctionalClass', 'func_class', 'median_type', 'nhs_type', 'ownership_type', 'surface_type', 'speed_limit']
function pickCategoryField (attrs: string[]): string | null {
  return attrs.find(a => PREFERRED_CATEGORY_FIELDS.includes(a)) || attrs[0] || null
}

// Color palettes matching the map symbology
const PALETTES: number[][][] = [
  [[255,59,48],[220,40,30],[180,20,20],[255,105,97],[200,60,50],[255,150,140],[160,10,10],[230,80,65],[140,0,0],[255,180,170]],
  [[0,122,255],[30,80,200],[0,180,235],[65,105,225],[25,25,180],[100,149,237],[0,60,160],[70,130,230],[20,100,190],[135,180,255]],
  [[52,199,89],[34,139,34],[0,128,0],[60,179,113],[46,160,67],[0,168,107],[34,120,60],[85,200,90],[20,100,40],[130,220,150]],
  [[255,149,0],[255,165,80],[230,120,0],[255,180,50],[200,100,0],[245,130,30],[180,80,0],[255,200,100],[210,140,20],[240,160,60]],
  [[175,82,222],[128,0,128],[148,103,189],[186,85,211],[138,43,226],[153,50,204],[106,13,173],[180,120,230],[90,0,150],[200,150,255]],
  [[0,199,190],[0,150,136],[32,178,170],[0,180,160],[20,130,120],[64,224,208],[0,160,150],[100,210,200],[0,110,100],[150,230,220]],
  [[255,45,85],[219,68,85],[199,21,133],[230,50,100],[180,30,80],[255,100,130],[160,20,70],[240,75,110],[140,10,60],[255,140,160]],
  [[162,132,94],[139,90,43],[160,82,45],[185,130,80],[120,70,30],[200,150,100],[100,60,20],[170,120,70],[80,50,10],[210,170,120]]
]

const StraightLineDiagram = (props: StraightLineDiagramProps) => {
  const { entries, eventLayerConfigs, onClose, mapView, routeGeometries, disabledLayerNames, onToggleLayer, onExportReport } = props
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const hoverGraphicRef = useRef<any>(null)
  const mapHandlerRef = useRef<any>(null)
  const zoomHighlightRef = useRef<any>(null)
  const zoomHighlightLayerRef = useRef<any>(null)
  const [containerWidth, setContainerWidth] = useState(900)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)
  const [crosshairM, setCrosshairM] = useState<number | null>(null)
  const [panelHeight, setPanelHeight] = useState(DEFAULT_PANEL_HEIGHT)
  const [collapsed, setCollapsed] = useState(false)
  const draggingRef = useRef(false)
  const dragStartYRef = useRef(0)
  const dragStartHeightRef = useRef(0)

  // Use the parent-provided disabled set as source of truth
  const disabledLayers = disabledLayerNames || new Set<string>()

  // Zoom state
  const [zoomRange, setZoomRange] = useState<{ start: number; end: number } | null>(null)
  const [zoomSelecting, setZoomSelecting] = useState(false)
  const [zoomStart, setZoomStart] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'diagram' | 'table'>('diagram')
  const [tableSortCol, setTableSortCol] = useState<string>('Measure')
  const [tableSortAsc, setTableSortAsc] = useState(true)
  const [tableFilterLayer, setTableFilterLayer] = useState<string>('All')

  const handleLaneToggle = useCallback((layerName: string) => {
    const isCurrentlyDisabled = disabledLayerNames?.has(layerName)
    onToggleLayer?.(layerName, !!isCurrentlyDisabled) // visible = opposite of disabled
  }, [onToggleLayer, disabledLayerNames])

  // Tell the map that the bottom area is occupied so goTo() centers above the panel
  useEffect(() => {
    if (!mapView) return
    const h = collapsed ? MIN_PANEL_HEIGHT : panelHeight
    const prevBottom = mapView.padding?.bottom || 0
    mapView.padding = { ...(mapView.padding || {}), bottom: h }
    return () => {
      if (mapView) {
        mapView.padding = { ...(mapView.padding || {}), bottom: prevBottom }
      }
    }
  }, [panelHeight, collapsed, mapView])

  // Drag-to-resize handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    draggingRef.current = true
    dragStartYRef.current = e.clientY
    dragStartHeightRef.current = panelHeight
    const handleMouseMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return
      const delta = dragStartYRef.current - ev.clientY
      const maxH = window.innerHeight * MAX_PANEL_HEIGHT_RATIO
      const newH = Math.min(maxH, Math.max(MIN_PANEL_HEIGHT + 30, dragStartHeightRef.current + delta))
      setPanelHeight(newH)
      if (collapsed) setCollapsed(false)
    }
    const handleMouseUp = () => {
      draggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [panelHeight, collapsed])

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev)
  }, [])

  // Measure container width with ResizeObserver
  useEffect(() => {
    const el = svgContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(roEntries => {
      for (const entry of roEntries) {
        const w = entry.contentRect.width
        if (w > 0) setContainerWidth(w)
      }
    })
    ro.observe(el)
    setContainerWidth(el.clientWidth || 900)
    return () => ro.disconnect()
  }, [])

  // Group entries by RouteID
  const routeGroups = useMemo(() => {
    const groups = new Map<string, { routeId: string; routeName: string; entries: any[] }>()
    for (const e of entries) {
      if (!groups.has(e.RouteID)) {
        groups.set(e.RouteID, { routeId: e.RouteID, routeName: e.RouteName || e.RouteID, entries: [] })
      }
      groups.get(e.RouteID)!.entries.push(e)
    }
    return Array.from(groups.values())
  }, [entries])

  const [activeTab, setActiveTab] = useState(0)
  const activeRoute = routeGroups[activeTab] || routeGroups[0]

  // Get event layer order from config (matching selected layers)
  const layerOrder = useMemo(() => {
    if (!activeRoute) return []
    const names = new Set(activeRoute.entries.map(e => e.Feature))
    return eventLayerConfigs.filter(c => names.has(c.name))
  }, [activeRoute, eventLayerConfigs])

  // Compute measure range for this route (full range)
  const { fullMinM, fullMaxM } = useMemo(() => {
    if (!activeRoute) return { fullMinM: 0, fullMaxM: 1 }
    let min = Infinity
    let max = -Infinity
    for (const e of activeRoute.entries) {
      if (e.Measure < min) min = e.Measure
      if (e.Measure > max) max = e.Measure
    }
    if (min === Infinity) { min = 0; max = 1 }
    return { fullMinM: min, fullMaxM: max }
  }, [activeRoute])

  // Effective min/max — zoomed or full
  const minM = zoomRange ? zoomRange.start : fullMinM
  const maxM = zoomRange ? zoomRange.end : fullMaxM

  // Layout constants
  const MARGIN_LEFT = 80
  const MARGIN_RIGHT = 20
  const ROUTE_LINE_Y = 50
  const LANE_HEIGHT = 32
  const LANE_GAP = 4
  const LANE_START_Y = ROUTE_LINE_Y + 40
  const TICK_HEIGHT = 8

  const svgWidth = containerWidth
  const diagramWidth = Math.max(svgWidth - MARGIN_LEFT - MARGIN_RIGHT, 100)
  const svgHeight = LANE_START_Y + layerOrder.length * (LANE_HEIGHT + LANE_GAP) + 30

  // Scale measure → x coordinate
  const range = maxM - minM || 1
  const mToX = useCallback((m: number) => {
    return MARGIN_LEFT + ((m - minM) / range) * diagramWidth
  }, [minM, range, diagramWidth])

  const xToM = useCallback((x: number) => {
    return minM + ((x - MARGIN_LEFT) / diagramWidth) * range
  }, [minM, range, diagramWidth])

  // Generate nice tick marks
  const ticks = useMemo(() => {
    const rawStep = range / 8
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
    const niceSteps = [1, 2, 5, 10]
    let step = niceSteps.find(s => s * magnitude >= rawStep)! * magnitude
    if (!step || step <= 0) step = range / 5

    const result: number[] = []
    const start = Math.ceil(minM / step) * step
    for (let m = start; m <= maxM; m += step) {
      result.push(Math.round(m * 1000) / 1000)
    }
    // Always include endpoints
    if (result.length === 0 || result[0] > minM) result.unshift(Math.round(minM * 1000) / 1000)
    if (result[result.length - 1] < maxM) result.push(Math.round(maxM * 1000) / 1000)
    return result
  }, [minM, maxM, range])

  // Build category color maps per layer (matching map symbology)
  const layerColorMaps = useMemo(() => {
    const maps = new Map<string, Map<string, number[]>>()
    layerOrder.forEach((lc) => {
      // Use the index from the full eventLayerConfigs list so colors match displayOnMap
      const fullIdx = eventLayerConfigs.findIndex(c => c.name === lc.name)
      const paletteIdx = fullIdx >= 0 ? fullIdx : 0
      const palette = PALETTES[paletteIdx % PALETTES.length]
      const layerEntries = activeRoute.entries.filter(e => e.Feature === lc.name)
      const catField = pickCategoryField(lc.attributes || [])
      const uniqueVals = Array.from(new Set(layerEntries.map(e => String(e[catField] ?? 'Unknown'))))
      uniqueVals.sort((a, b) => {
        const na = Number(a), nb = Number(b)
        if (!isNaN(na) && !isNaN(nb)) return na - nb
        return a.localeCompare(b)
      })
      const colorMap = new Map<string, number[]>()
      uniqueVals.forEach((v, i) => colorMap.set(v, palette[i % palette.length]))
      maps.set(lc.name, colorMap)
    })
    return maps
  }, [activeRoute, layerOrder, eventLayerConfigs])

  // Show hover graphic on map at measure M with label
  const showMapHover = useCallback(async (m: number) => {
    if (!mapView || !routeGeometries || !activeRoute) return
    const routeData = routeGeometries.get(activeRoute.routeId)
    if (!routeData) return
    const pt = interpolatePointFromM(routeData.vertices, m, routeData.mIdx)
    if (!pt) return
    try {
      const [Graphic, SimpleMarkerSymbol, TextSymbol, Point] = await Promise.all([
        (window as any).SystemJS.import('esri/Graphic').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/TextSymbol').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/geometry/Point').then((mod: any) => mod.default || mod)
      ])
      // Remove previous hover graphics
      if (hoverGraphicRef.current) {
        for (const g of hoverGraphicRef.current) mapView.graphics.remove(g)
      }
      const geom = new Point({ x: pt.x, y: pt.y, spatialReference: mapView.spatialReference })
      const marker = new Graphic({
        geometry: geom,
        symbol: new SimpleMarkerSymbol({
          color: [255, 0, 0, 200],
          size: 10,
          outline: { color: [255, 255, 255], width: 2 }
        })
      })
      const label = new Graphic({
        geometry: geom,
        symbol: new TextSymbol({
          text: `M: ${Math.round(m * 1000) / 1000}`,
          color: [255, 255, 255],
          haloColor: [0, 0, 0],
          haloSize: 2,
          font: { size: 11, weight: 'bold', family: 'sans-serif' },
          yoffset: 12
        })
      })
      mapView.graphics.addMany([marker, label])
      hoverGraphicRef.current = [marker, label]
    } catch (err) { /* silently fail */ }
  }, [mapView, routeGeometries, activeRoute])

  const clearMapHover = useCallback(() => {
    if (mapView && hoverGraphicRef.current) {
      for (const g of hoverGraphicRef.current) mapView.graphics.remove(g)
      hoverGraphicRef.current = null
    }
  }, [mapView])

  // Zoom to the searched/intersecting section of the route (not the full route)
  const zoomToRoute = useCallback(async (routeId: string) => {
    if (!mapView || !routeGeometries || routeGeometries.size === 0) return
    const routeData = routeGeometries.get(routeId)
    if (!routeData || routeData.vertices.length === 0) return

    // Get the measure range from the report entries for this route
    const routeEntries = entries.filter(e => e.RouteID === routeId)
    if (routeEntries.length === 0) return
    let mMin = Infinity, mMax = -Infinity
    for (const e of routeEntries) {
      if (e.Measure < mMin) mMin = e.Measure
      if (e.Measure > mMax) mMax = e.Measure
    }
    if (mMin === Infinity) return

    // Collect vertices that fall within the report measure range,
    // plus interpolated endpoints at mMin and mMax
    const mIdx = routeData.mIdx
    const sectionVerts: number[][] = []

    // Interpolate start point
    const startPt = interpolatePointFromM(routeData.vertices, mMin, mIdx)
    if (startPt) sectionVerts.push([startPt.x, startPt.y])

    // Include all vertices between mMin and mMax
    for (const v of routeData.vertices) {
      const m = v[mIdx] || 0
      if (m >= mMin && m <= mMax) sectionVerts.push(v)
    }

    // Interpolate end point
    const endPt = interpolatePointFromM(routeData.vertices, mMax, mIdx)
    if (endPt) sectionVerts.push([endPt.x, endPt.y])

    if (sectionVerts.length === 0) return

    let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity
    for (const v of sectionVerts) {
      if (v[0] < xmin) xmin = v[0]
      if (v[1] < ymin) ymin = v[1]
      if (v[0] > xmax) xmax = v[0]
      if (v[1] > ymax) ymax = v[1]
    }
    if (xmin === Infinity) return
    const dx = xmax - xmin
    const dy = ymax - ymin
    const pad = Math.max(dx * 0.2, dy * 0.2, 200)
    try {
      const [Extent, Graphic, Polyline, SimpleLineSymbol] = await Promise.all([
        (window as any).SystemJS.import('esri/geometry/Extent').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/Graphic').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/geometry/Polyline').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/SimpleLineSymbol').then((mod: any) => mod.default || mod)
      ])
      const extent = new Extent({
        xmin: xmin - pad, ymin: ymin - pad, xmax: xmax + pad, ymax: ymax + pad,
        spatialReference: mapView.spatialReference
      })
      await mapView.goTo(extent)

      // Flash the route section on the map
      const pathCoords = sectionVerts.map(v => [v[0], v[1]])
      const flashGraphic = new Graphic({
        geometry: new Polyline({ paths: [pathCoords], spatialReference: mapView.spatialReference }),
        symbol: new SimpleLineSymbol({ color: [255, 255, 0, 255], width: 6, style: 'solid' })
      })
      let flashCount = 0
      const flashInterval = setInterval(() => {
        if (flashCount % 2 === 0) {
          mapView.graphics.add(flashGraphic)
        } else {
          mapView.graphics.remove(flashGraphic)
        }
        flashCount++
        if (flashCount >= 6) {
          clearInterval(flashInterval)
          mapView.graphics.remove(flashGraphic)
        }
      }, 250)
    } catch (err) {
      console.warn('zoomToRoute failed:', err)
    }
  }, [mapView, routeGeometries, entries])

  // Clear zoom highlight from map
  const clearZoomHighlight = useCallback(() => {
    if (zoomHighlightLayerRef.current) {
      zoomHighlightLayerRef.current.removeAll()
    }
    zoomHighlightRef.current = null
  }, [])

  // Zoom map to a measure range segment
  const zoomMapToMeasureRange = useCallback(async (mStart: number, mEnd: number) => {
    if (!mapView || !routeGeometries || !activeRoute) return
    const routeData = routeGeometries.get(activeRoute.routeId)
    if (!routeData || routeData.vertices.length === 0) return
    const mIdx = routeData.mIdx
    const sectionVerts: number[][] = []
    const startPt = interpolatePointFromM(routeData.vertices, mStart, mIdx)
    if (startPt) sectionVerts.push([startPt.x, startPt.y])
    for (const v of routeData.vertices) {
      const m = v[mIdx] || 0
      if (m >= mStart && m <= mEnd) sectionVerts.push(v)
    }
    const endPt = interpolatePointFromM(routeData.vertices, mEnd, mIdx)
    if (endPt) sectionVerts.push([endPt.x, endPt.y])
    if (sectionVerts.length === 0) return
    let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity
    for (const v of sectionVerts) {
      if (v[0] < xmin) xmin = v[0]
      if (v[1] < ymin) ymin = v[1]
      if (v[0] > xmax) xmax = v[0]
      if (v[1] > ymax) ymax = v[1]
    }
    if (xmin === Infinity) return
    const dx = xmax - xmin, dy = ymax - ymin
    const pad = Math.max(dx * 0.2, dy * 0.2, 200)
    try {
      const [Extent, Graphic, Polyline, SimpleLineSymbol] = await Promise.all([
        (window as any).SystemJS.import('esri/geometry/Extent').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/Graphic').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/geometry/Polyline').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/SimpleLineSymbol').then((mod: any) => mod.default || mod)
      ])
      const extent = new Extent({
        xmin: xmin - pad, ymin: ymin - pad, xmax: xmax + pad, ymax: ymax + pad,
        spatialReference: mapView.spatialReference
      })
      await mapView.goTo(extent, { duration: 600 })

      // Draw zoom highlight as a buffered polygon on map — at bottom of draw order
      clearZoomHighlight()
      const pathCoords = sectionVerts.map(v => [v[0], v[1]])

      const [GraphicsLayer, geometryEngine, SimpleFillSymbol, SimpleMarkerSymbol, TextSymbol, Point] = await Promise.all([
        (window as any).SystemJS.import('esri/layers/GraphicsLayer').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/geometry/geometryEngine').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/SimpleFillSymbol').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/TextSymbol').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/geometry/Point').then((mod: any) => mod.default || mod)
      ])

      // Create a dedicated GraphicsLayer at index 0 (below everything)
      if (!zoomHighlightLayerRef.current) {
        const gl = new GraphicsLayer({ id: '__roadlog_zoom_highlight__', title: 'Zoom Highlight' })
        mapView.map.add(gl, 0)
        zoomHighlightLayerRef.current = gl
      }

      const line = new Polyline({ paths: [pathCoords], spatialReference: mapView.spatialReference })
      // Buffer distance in meters — scale with current view resolution for consistent visual size
      const bufferDist = Math.max((mapView.resolution || 5) * 30, 50)
      const buffered = geometryEngine.buffer(line, bufferDist, 'meters')

      if (buffered) {
        const bufferGraphic = new Graphic({
          geometry: buffered,
          symbol: new SimpleFillSymbol({
            color: [0, 121, 193, 0.3],
            outline: { color: [255, 255, 255, 0.7], width: 2 }
          })
        })

        // Start measure point + label
        const startGeom = new Point({ x: sectionVerts[0][0], y: sectionVerts[0][1], spatialReference: mapView.spatialReference })
        const startMarker = new Graphic({
          geometry: startGeom,
          symbol: new SimpleMarkerSymbol({
            color: [0, 121, 193, 220],
            size: 10,
            outline: { color: [255, 255, 255], width: 2 }
          })
        })
        const startLabel = new Graphic({
          geometry: startGeom,
          symbol: new TextSymbol({
            text: `M: ${Math.round(mStart * 1000) / 1000}`,
            color: [255, 255, 255],
            haloColor: [0, 80, 150],
            haloSize: 2,
            font: { size: 11, weight: 'bold', family: 'sans-serif' },
            yoffset: 14
          })
        })

        // End measure point + label
        const endVert = sectionVerts[sectionVerts.length - 1]
        const endGeom = new Point({ x: endVert[0], y: endVert[1], spatialReference: mapView.spatialReference })
        const endMarker = new Graphic({
          geometry: endGeom,
          symbol: new SimpleMarkerSymbol({
            color: [0, 121, 193, 220],
            size: 10,
            outline: { color: [255, 255, 255], width: 2 }
          })
        })
        const endLabel = new Graphic({
          geometry: endGeom,
          symbol: new TextSymbol({
            text: `M: ${Math.round(mEnd * 1000) / 1000}`,
            color: [255, 255, 255],
            haloColor: [0, 80, 150],
            haloSize: 2,
            font: { size: 11, weight: 'bold', family: 'sans-serif' },
            yoffset: 14
          })
        })

        zoomHighlightLayerRef.current.addMany([bufferGraphic, startMarker, startLabel, endMarker, endLabel])
        zoomHighlightRef.current = [bufferGraphic, startMarker, startLabel, endMarker, endLabel]
      }
    } catch (err) {
      console.warn('zoomMapToMeasureRange failed:', err)
    }
  }, [mapView, routeGeometries, activeRoute, clearZoomHighlight])

  // Handle SVG click for zoom selection
  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!zoomSelecting) return
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const svgX = e.clientX - rect.left
    if (svgX < MARGIN_LEFT || svgX > MARGIN_LEFT + diagramWidth) return
    const m = Math.round(xToM(svgX) * 1000) / 1000
    const clampedM = Math.max(minM, Math.min(maxM, m))

    if (zoomStart === null) {
      // First click — set start
      setZoomStart(clampedM)
    } else {
      // Second click — set end and zoom
      const start = Math.min(zoomStart, clampedM)
      const end = Math.max(zoomStart, clampedM)
      if (end - start > 0.001) {
        setZoomRange({ start, end })
        zoomMapToMeasureRange(start, end)
      }
      setZoomStart(null)
      setZoomSelecting(false)
    }
  }, [zoomSelecting, zoomStart, xToM, minM, maxM, diagramWidth, zoomMapToMeasureRange, MARGIN_LEFT])

  // Zoom to a single event on the map
  const zoomToEvent = useCallback(async (entry: any) => {
    if (!mapView || !routeGeometries || !activeRoute) return
    const routeData = routeGeometries.get(activeRoute.routeId)
    if (!routeData) return
    const m = entry.Measure
    if (m == null) return
    const pt = interpolatePointFromM(routeData.vertices, m, routeData.mIdx)
    if (!pt) return
    try {
      const [Point, Graphic, SimpleMarkerSymbol, TextSymbol] = await Promise.all([
        (window as any).SystemJS.import('esri/geometry/Point').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/Graphic').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((mod: any) => mod.default || mod),
        (window as any).SystemJS.import('esri/symbols/TextSymbol').then((mod: any) => mod.default || mod)
      ])
      const geom = new Point({ x: pt.x, y: pt.y, spatialReference: mapView.spatialReference })
      await mapView.goTo({ target: geom, zoom: Math.max(mapView.zoom, 14) }, { duration: 600 })
      // Flash indicator
      const flash = new Graphic({
        geometry: geom,
        symbol: new SimpleMarkerSymbol({ color: [255, 255, 0, 220], size: 14, outline: { color: [255, 0, 0], width: 3 } })
      })
      const label = new Graphic({
        geometry: geom,
        symbol: new TextSymbol({
          text: `M: ${Math.round(m * 1000) / 1000}`,
          color: [255, 255, 255], haloColor: [200, 0, 0], haloSize: 2,
          font: { size: 12, weight: 'bold', family: 'sans-serif' }, yoffset: 16
        })
      })
      mapView.graphics.addMany([flash, label])
      setTimeout(() => { mapView.graphics.remove(flash); mapView.graphics.remove(label) }, 3000)
    } catch (_) {}
  }, [mapView, routeGeometries, activeRoute])

  // Build table columns from active route entries
  const tableColumns = useMemo(() => {
    const baseCols = ['RouteID', 'RouteName', 'Feature', 'Location', 'EventID', 'Measure']
    const attrSet = new Set<string>()
    for (const lc of layerOrder) {
      for (const attr of lc.attributes) attrSet.add(attr)
    }
    return [...baseCols, ...Array.from(attrSet)]
  }, [layerOrder])

  // Table data — sorted and filtered
  const tableData = useMemo(() => {
    if (!activeRoute) return []
    let data = [...activeRoute.entries]
    if (tableFilterLayer !== 'All') {
      data = data.filter(e => e.Feature === tableFilterLayer)
    }
    data.sort((a, b) => {
      const av = a[tableSortCol] ?? ''
      const bv = b[tableSortCol] ?? ''
      const na = Number(av), nb = Number(bv)
      let cmp: number
      if (!isNaN(na) && !isNaN(nb)) cmp = na - nb
      else cmp = String(av).localeCompare(String(bv))
      return tableSortAsc ? cmp : -cmp
    })
    return data
  }, [activeRoute, tableSortCol, tableSortAsc, tableFilterLayer])

  const handleTableSort = useCallback((col: string) => {
    setTableSortCol(prev => {
      if (prev === col) { setTableSortAsc(a => !a); return col }
      setTableSortAsc(true)
      return col
    })
  }, [])

  const [exporting, setExporting] = useState(false)

  // Convert SVG element to a data URL image
  const svgToImage = useCallback((svgEl: SVGSVGElement, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const clone = svgEl.cloneNode(true) as SVGSVGElement
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      clone.setAttribute('width', String(width))
      clone.setAttribute('height', String(height))
      const svgStr = new XMLSerializer().serializeToString(clone)
      const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width * 2
        canvas.height = height * 2
        const ctx = canvas.getContext('2d')!
        ctx.scale(2, 2)
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG render failed')) }
      img.src = url
    })
  }, [])

  // Export PDF: map screenshot + diagram + table
  const exportPDF = useCallback(async () => {
    if (!activeRoute) return
    setExporting(true)
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const margin = 10
      const contentW = pageW - margin * 2
      let curY = margin

      // Title
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Road Log Report — ${activeRoute.routeName || activeRoute.routeId}`, margin, curY + 5)
      curY += 10
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Measure Range: ${Math.round(fullMinM * 1000) / 1000} – ${Math.round(fullMaxM * 1000) / 1000}  |  Generated: ${new Date().toLocaleString()}`, margin, curY + 3)
      curY += 8

      // 1. Map screenshot
      if (mapView?.takeScreenshot) {
        try {
          // Zoom to fit route geometry before screenshot
          const savedExtent = mapView.extent?.clone()
          if (routeGeometries && activeRoute) {
            const routeData = routeGeometries.get(activeRoute.routeId)
            if (routeData?.vertices?.length > 0) {
              try {
                const Point = await (window as any).SystemJS.import('esri/geometry/Point').then((m: any) => m.default || m)
                const sr = mapView.spatialReference
                const allPts = routeData.vertices.map((v: number[]) => new Point({ x: v[0], y: v[1], spatialReference: sr }))
                await mapView.goTo(allPts, { duration: 0 })
                if (mapView.extent) {
                  await mapView.goTo(mapView.extent.expand(1.3), { duration: 0 })
                }
                await new Promise(r => setTimeout(r, 1500))
              } catch (_) {}
            }
          }
          const screenshot = await mapView.takeScreenshot({ format: 'png', width: 1600, height: 900 })
          if (screenshot?.dataUrl) {
            const mapH = contentW * (9 / 16) // 16:9 aspect
            const availH = Math.min(mapH, (pageH - curY - margin) * 0.5)
            const imgW = availH < mapH ? availH * (16 / 9) : contentW
            const imgX = margin + (contentW - imgW) / 2
            pdf.addImage(screenshot.dataUrl, 'PNG', imgX, curY, imgW, availH)
            curY += availH + 4
          }
          // Restore original extent
          if (savedExtent) {
            try { await mapView.goTo(savedExtent, { duration: 0 }) } catch (_) {}
          }
        } catch (e) { console.warn('Map screenshot failed:', e) }
      }

      // Legend
      const legendItems = eventLayerConfigs.map((cfg, i) => {
        const color = PALETTES[i % PALETTES.length][0]
        return { name: cfg.name, color }
      }).filter(item => !disabledLayers.has(item.name))
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

      // 2. Diagram SVG
      if (svgRef.current) {
        try {
          const svgEl = svgRef.current
          const svgW = svgEl.clientWidth || svgEl.getBoundingClientRect().width || 900
          const svgH = svgEl.clientHeight || svgEl.getBoundingClientRect().height || 300
          const imgData = await svgToImage(svgEl, svgW, svgH)
          const diagramH = contentW * (svgH / svgW)
          const availH = Math.min(diagramH, pageH - curY - margin - 20)
          if (curY + availH > pageH - margin) {
            pdf.addPage()
            curY = margin
          }
          pdf.addImage(imgData, 'PNG', margin, curY, contentW, availH)
          curY += availH + 4
        } catch (e) { console.warn('Diagram render failed:', e) }
      }

      // 3. Table
      if (curY > pageH - 40) { pdf.addPage(); curY = margin }
      const allEntries = activeRoute.entries
      const cols = tableColumns
      const head = [cols]
      const body = allEntries.map(entry => cols.map(col => {
        if (col === 'Measure') return String(Math.round((entry[col] ?? 0) * 1000) / 1000)
        return String(entry[col] ?? '')
      }))

      autoTable(pdf, {
        startY: curY,
        head,
        body,
        margin: { left: margin, right: margin },
        styles: { fontSize: 7, cellPadding: 1.5 },
        headStyles: { fillColor: [0, 121, 193], textColor: 255, fontStyle: 'bold', fontSize: 7 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
        didParseCell: (data: any) => {
          if (data.section === 'body' && data.column.index === cols.indexOf('Feature')) {
            const layerName = data.cell.raw
            const colorMap = layerColorMaps.get(layerName)
            if (colorMap) {
              const firstColor = Array.from(colorMap.values())[0]
              if (firstColor) {
                data.cell.styles.textColor = firstColor
                data.cell.styles.fontStyle = 'bold'
              }
            }
          }
        }
      })

      pdf.save(`RoadLog_${activeRoute.routeName || activeRoute.routeId}_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err: any) {
      console.error('PDF export failed:', err)
      alert('PDF export failed: ' + (err.message || err))
    } finally {
      setExporting(false)
    }
  }, [activeRoute, mapView, tableColumns, layerColorMaps, fullMinM, fullMaxM, svgToImage])

  // Handle mouse move on SVG — crosshair + map hover
  const handleSvgMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const svgX = e.clientX - rect.left
    if (svgX < MARGIN_LEFT || svgX > MARGIN_LEFT + diagramWidth) {
      setCrosshairM(null)
      return
    }
    const m = xToM(svgX)
    const clampedM = Math.max(minM, Math.min(maxM, m))
    setCrosshairM(Math.round(clampedM * 1000) / 1000)
    showMapHover(clampedM)
  }, [xToM, minM, maxM, diagramWidth, showMapHover, MARGIN_LEFT])

  const handleSvgMouseLeave = useCallback(() => {
    setCrosshairM(null)
    clearMapHover()
    setTooltip(null)
  }, [clearMapHover])

  // Map pointer-move handler: show crosshair on diagram at nearest M
  useEffect(() => {
    if (!mapView || !routeGeometries || !activeRoute) return
    const routeData = routeGeometries.get(activeRoute.routeId)
    if (!routeData) return
    const handler = mapView.on('pointer-move', (evt: any) => {
      const mapPt = mapView.toMap({ x: evt.x, y: evt.y })
      if (!mapPt) return
      const m = nearestMFromPoint(routeData.vertices, mapPt.x, mapPt.y, routeData.mIdx)
      if (m !== null && m >= minM && m <= maxM) {
        setCrosshairM(Math.round(m * 1000) / 1000)
      }
    })
    mapHandlerRef.current = handler
    return () => {
      if (handler?.remove) handler.remove()
    }
  }, [mapView, routeGeometries, activeRoute, minM, maxM])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearMapHover()
      if (mapHandlerRef.current?.remove) mapHandlerRef.current.remove()
      if (zoomHighlightLayerRef.current && mapView) {
        try { mapView.map.remove(zoomHighlightLayerRef.current) } catch (_) {}
        zoomHighlightLayerRef.current = null
      }
      zoomHighlightRef.current = null
    }
  }, [clearMapHover, mapView])

  const showTooltip = useCallback((e: React.MouseEvent, text: string) => {
    const rect = (e.currentTarget as Element).closest('svg')?.getBoundingClientRect()
    if (!rect) return
    setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top - 20, text })
  }, [])

  const hideTooltip = useCallback(() => setTooltip(null), [])

  if (!activeRoute) return null

  const effectiveHeight = collapsed ? MIN_PANEL_HEIGHT : panelHeight

  return (
    <div style={{ ...panelStyle, height: effectiveHeight }}>
      {/* Drag handle */}
      <div style={dragHandleStyle} onMouseDown={handleDragStart}>
        <div style={dragHandleBarStyle} />
      </div>

      {/* Header */}
      <div style={panelHeaderStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button type="button" onClick={toggleCollapsed} style={toggleBtnStyle}
            title={collapsed ? 'Expand diagram' : 'Collapse diagram'}>
            {collapsed ? '▲' : '▼'}
          </button>
          {/* Master view tabs */}
          <div style={{ display: 'flex', gap: '0', marginLeft: '4px' }}>
            <button type="button" onClick={() => setViewMode('diagram')}
              style={viewMode === 'diagram' ? masterTabActiveStyle : masterTabStyle}>
              Diagram
            </button>
            <button type="button" onClick={() => setViewMode('table')}
              style={viewMode === 'table' ? masterTabActiveStyle : masterTabStyle}>
              Table
            </button>
          </div>
          <span style={{ color: '#999', fontWeight: 400, fontSize: '11px' }}>(Beta)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {viewMode === 'diagram' && (
            zoomSelecting ? (
              <button type="button" onClick={() => { setZoomSelecting(false); setZoomStart(null) }}
                style={{ ...zoomBtnStyle, backgroundColor: '#e04040', color: '#fff' }}
                title="Cancel zoom selection">
                ✕ Cancel Zoom
              </button>
            ) : zoomRange ? (
              <button type="button" onClick={() => {
                setZoomRange(null)
                setZoomStart(null)
                clearZoomHighlight()
                if (activeRoute) zoomToRoute(activeRoute.routeId)
              }}
                style={{ ...zoomBtnStyle, backgroundColor: '#0079c1', color: '#fff' }}
                title="Reset to full extent">
                ↩ Reset Zoom
              </button>
            ) : (
              <button type="button" onClick={() => setZoomSelecting(true)}
                style={zoomBtnStyle}
                title="Click two points on the diagram to zoom in">
                🔍 Zoom
              </button>
            )
          )}
          {onExportReport && (
            <button type="button" onClick={onExportReport}
              style={{ ...zoomBtnStyle, backgroundColor: '#5a6c7d', color: '#fff' }}
              title="Export CSV Road Log Report">
              📋 Road Log Report
            </button>
          )}
          <button type="button" onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
      </div>

      {/* Collapsible content */}
      {!collapsed && (<>
      {/* Tabs for multiple routes */}
      {routeGroups.length > 1 && (
        <div style={tabBarStyle}>
          {routeGroups.map((rg, i) => (
            <button key={rg.routeId} type="button" onClick={() => { setActiveTab(i); setZoomRange(null); setZoomStart(null); setZoomSelecting(false); clearZoomHighlight(); zoomToRoute(rg.routeId) }}
              style={i === activeTab ? activeTabStyle : tabStyle}>
              {rg.routeName || rg.routeId}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'diagram' ? (<>
      {/* Route label */}
      <div style={{ padding: '4px 12px 0', fontSize: '12px', color: '#444' }}>
        <strong>{activeRoute.routeName || activeRoute.routeId}</strong>
        <span style={{ color: '#888', marginLeft: '8px' }}>
          M: {Math.round(minM * 1000) / 1000} – {Math.round(maxM * 1000) / 1000}
          {' '}({Math.round((maxM - minM) * 1000) / 1000}{zoomRange ? ' zoomed' : ' total'})
        </span>
        {zoomSelecting && (
          <span style={{ color: '#0079c1', marginLeft: '12px', fontWeight: 600 }}>
            {zoomStart !== null
              ? `Click end measure (start: ${zoomStart})`
              : 'Click start measure on diagram'}
          </span>
        )}
        {crosshairM !== null && !zoomSelecting && (
          <span style={{ color: '#d00', marginLeft: '12px', fontWeight: 600 }}>
            Measure: {crosshairM}
          </span>
        )}
      </div>

      {/* SVG Diagram — full width */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', flex: 1, padding: '4px 0' }} ref={svgContainerRef}>
        <svg ref={svgRef} width={svgWidth} height={svgHeight}
          style={{ display: 'block', cursor: zoomSelecting ? 'crosshair' : 'default' }}
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={handleSvgMouseLeave}
          onClick={handleSvgClick}>

          {/* Clip path to constrain events within diagram bounds */}
          <defs>
            <clipPath id="diagram-clip">
              <rect x={MARGIN_LEFT} y={0} width={diagramWidth} height={svgHeight} />
            </clipPath>
          </defs>

          {/* Route centerline */}
          <line x1={MARGIN_LEFT} y1={ROUTE_LINE_Y} x2={MARGIN_LEFT + diagramWidth} y2={ROUTE_LINE_Y}
            stroke="#333" strokeWidth={3} />

          {/* Tick marks and labels */}
          {ticks.map((m, i) => {
            const x = mToX(m)
            return (
              <g key={`tick-${i}`}>
                <line x1={x} y1={ROUTE_LINE_Y - TICK_HEIGHT} x2={x} y2={ROUTE_LINE_Y + TICK_HEIGHT}
                  stroke="#333" strokeWidth={1} />
                <text x={x} y={ROUTE_LINE_Y - TICK_HEIGHT - 4} textAnchor="middle"
                  fontSize="10" fill="#333" fontFamily="sans-serif">{m}</text>
                <line x1={x} y1={ROUTE_LINE_Y + TICK_HEIGHT} x2={x} y2={svgHeight - 10}
                  stroke="#e0e0e0" strokeWidth={0.5} strokeDasharray="2,3" />
              </g>
            )
          })}

          {/* Event lanes — clipped to diagram bounds */}
          <g clipPath="url(#diagram-clip)">
          {layerOrder.map((lc, laneIdx) => {
            const laneY = LANE_START_Y + laneIdx * (LANE_HEIGHT + LANE_GAP)
            const isLinear = lc.type === 'esriLRSLinearEventLayer'
            const layerEntries = activeRoute.entries.filter(e => e.Feature === lc.name)
            const colorMap = layerColorMaps.get(lc.name) || new Map()
            const catField = pickCategoryField(lc.attributes || [])
            const isDisabled = disabledLayers.has(lc.name)

            return (
              <g key={lc.name} style={{ opacity: isDisabled ? 0.4 : 1 }}>
                {/* Clickable lane label */}
                <text x={MARGIN_LEFT - 6} y={laneY + LANE_HEIGHT / 2 + 4} textAnchor="end"
                  fontSize="10" fill={isDisabled ? '#aaa' : '#555'} fontFamily="sans-serif" fontWeight={500}
                  style={{ cursor: 'pointer', textDecoration: isDisabled ? 'line-through' : 'none' }}
                  onClick={() => handleLaneToggle(lc.name)}>
                  {lc.name}
                </text>
                {/* Clickable lane background */}
                <rect x={MARGIN_LEFT} y={laneY} width={diagramWidth} height={LANE_HEIGHT}
                  fill={isDisabled ? '#eee' : (laneIdx % 2 === 0 ? '#f8f8f8' : '#fff')}
                  stroke="#e0e0e0" strokeWidth={0.5}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleLaneToggle(lc.name)} />

                {!isDisabled && (isLinear ? (() => {
                  const beginMap = new Map<string, any>()
                  const endMap = new Map<string, any>()
                  for (const e of layerEntries) {
                    if (e.Location === 'Begin' && e.EventID) beginMap.set(e.EventID, e)
                    if (e.Location === 'End' && e.EventID) endMap.set(e.EventID, e)
                  }
                  const segments: React.ReactElement[] = []
                  for (const [eventId, be] of beginMap) {
                    const ee = endMap.get(eventId)
                    if (!ee) continue
                    const x1 = mToX(be.Measure)
                    const x2 = mToX(ee.Measure)
                    const catVal = String(be[catField] ?? 'Unknown')
                    const rgb = colorMap.get(catVal) || [150, 150, 150]
                    const barH = LANE_HEIGHT - 6
                    const barY = laneY + 3
                    const detailText = lc.attributes.map(a => `${a}: ${be[a] ?? ''}`).join(', ')
                    const tipText = `${lc.name}\nM: ${be.Measure} – ${ee.Measure}\n${detailText}`
                    segments.push(
                      <rect key={eventId} x={Math.min(x1, x2)} y={barY}
                        width={Math.max(Math.abs(x2 - x1), 2)} height={barH} rx={2}
                        fill={`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`} fillOpacity={0.85}
                        stroke={`rgb(${Math.max(0,rgb[0]-40)},${Math.max(0,rgb[1]-40)},${Math.max(0,rgb[2]-40)})`}
                        strokeWidth={0.5} style={{ cursor: 'pointer' }}
                        onMouseEnter={(ev) => showTooltip(ev, tipText)}
                        onMouseMove={(ev) => showTooltip(ev, tipText)}
                        onMouseLeave={hideTooltip} />
                    )
                  }
                  return <>{segments}</>
                })() : (
                  layerEntries.map((e, ei) => {
                    const x = mToX(e.Measure)
                    const catVal = String(e[catField] ?? 'Unknown')
                    const rgb = colorMap.get(catVal) || [150, 150, 150]
                    const cy = laneY + LANE_HEIGHT / 2
                    const detailText = lc.attributes.map(a => `${a}: ${e[a] ?? ''}`).join(', ')
                    const tipText = `${lc.name}\nM: ${e.Measure}\n${detailText}`
                    return (
                      <g key={`pt-${ei}`}>
                        <circle cx={x} cy={cy} r={5}
                          fill={`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`}
                          stroke="#fff" strokeWidth={1.5} style={{ cursor: 'pointer' }}
                          onMouseEnter={(ev) => showTooltip(ev, tipText)}
                          onMouseMove={(ev) => showTooltip(ev, tipText)}
                          onMouseLeave={hideTooltip} />
                        <line x1={x} y1={ROUTE_LINE_Y + TICK_HEIGHT} x2={x} y2={laneY}
                          stroke={`rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.3)`}
                          strokeWidth={0.5} strokeDasharray="2,2" />
                      </g>
                    )
                  })
                ))}
              </g>
            )
          })}
          </g>

          {/* Zoom start indicator */}
          {zoomSelecting && zoomStart !== null && (
            <g>
              <line x1={mToX(zoomStart)} y1={ROUTE_LINE_Y - 15} x2={mToX(zoomStart)} y2={svgHeight - 5}
                stroke="#0079c1" strokeWidth={2} strokeDasharray="6,3" pointerEvents="none" />
              <rect x={mToX(zoomStart) - 28} y={ROUTE_LINE_Y - 28} width={56} height={16} rx={3}
                fill="#0079c1" pointerEvents="none" />
              <text x={mToX(zoomStart)} y={ROUTE_LINE_Y - 16} textAnchor="middle"
                fontSize="10" fill="#fff" fontFamily="sans-serif" fontWeight={600} pointerEvents="none">
                Start: {zoomStart}
              </text>
              {/* Shaded selection preview when hovering */}
              {crosshairM !== null && (
                <rect
                  x={Math.min(mToX(zoomStart), mToX(crosshairM))}
                  y={ROUTE_LINE_Y - 15}
                  width={Math.abs(mToX(crosshairM) - mToX(zoomStart))}
                  height={svgHeight - ROUTE_LINE_Y + 10}
                  fill="rgba(0,121,193,0.1)" pointerEvents="none" />
              )}
            </g>
          )}

          {/* Crosshair line */}
          {crosshairM !== null && crosshairM >= minM && crosshairM <= maxM && (
            <g>
              <line x1={mToX(crosshairM)} y1={ROUTE_LINE_Y - 15} x2={mToX(crosshairM)} y2={svgHeight - 5}
                stroke="#d00" strokeWidth={1.5} strokeDasharray="4,3" pointerEvents="none" />
              <rect x={mToX(crosshairM) - 22} y={ROUTE_LINE_Y - 28} width={44} height={16} rx={3}
                fill="#d00" pointerEvents="none" />
              <text x={mToX(crosshairM)} y={ROUTE_LINE_Y - 16} textAnchor="middle"
                fontSize="10" fill="#fff" fontFamily="sans-serif" fontWeight={600} pointerEvents="none">
                {crosshairM}
              </text>
            </g>
          )}

          {/* Tooltip */}
          {tooltip && (
            <foreignObject x={Math.min(tooltip.x + 10, svgWidth - 220)} y={Math.max(tooltip.y - 30, 0)}
              width={220} height={100} pointerEvents="none">
              <div style={tooltipStyle}>
                {tooltip.text.split('\n').map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </foreignObject>
          )}
        </svg>
      </div>

      {/* Legend */}
      <div style={legendContainerStyle}>
        {layerOrder.map((lc, layerIdx) => {
          const colorMap = layerColorMaps.get(lc.name)
          if (!colorMap) return null
          const isLinear = lc.type === 'esriLRSLinearEventLayer'
          const isDisabled = disabledLayers.has(lc.name)
          return (
            <div key={lc.name} style={{ marginRight: '16px', marginBottom: '4px', opacity: isDisabled ? 0.4 : 1, cursor: 'pointer' }}
              onClick={() => handleLaneToggle(lc.name)}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: isDisabled ? '#aaa' : '#333', textDecoration: isDisabled ? 'line-through' : 'none' }}>{lc.name}: </span>
              {Array.from(colorMap.entries()).map(([val, rgb]) => (
                <span key={val} style={{ fontSize: '10px', marginRight: '8px', whiteSpace: 'nowrap' }}>
                  {isLinear ? (
                    <span style={{ display: 'inline-block', width: '14px', height: '8px', backgroundColor: isDisabled ? '#ccc' : `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, borderRadius: '1px', verticalAlign: 'middle', marginRight: '3px' }} />
                  ) : (
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isDisabled ? '#ccc' : `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`, verticalAlign: 'middle', marginRight: '3px' }} />
                  )}
                  {val}
                </span>
              ))}
            </div>
          )
        })}
      </div>
      </>) : (
      /* ===== TABLE VIEW ===== */
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Filter bar */}
        <div style={{ padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e0e0e0', flexShrink: 0, fontSize: '12px' }}>
          <strong>{activeRoute.routeName || activeRoute.routeId}</strong>
          <span style={{ color: '#888' }}>|</span>
          <label style={{ color: '#555' }}>Layer:</label>
          <select value={tableFilterLayer} onChange={e => setTableFilterLayer(e.target.value)}
            style={{ fontSize: '11px', padding: '2px 4px', border: '1px solid #ccc', borderRadius: '3px' }}>
            <option value="All">All Layers</option>
            {layerOrder.map(lc => <option key={lc.name} value={lc.name}>{lc.name}</option>)}
          </select>
          <span style={{ color: '#888', marginLeft: 'auto' }}>{tableData.length} records</span>
        </div>
        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                {tableColumns.map(col => (
                  <th key={col} onClick={() => handleTableSort(col)}
                    style={thStyle}>
                    {col}
                    {tableSortCol === col ? (tableSortAsc ? ' ▲' : ' ▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((entry, idx) => {
                const colorMap = layerColorMaps.get(entry.Feature)
                const catField = pickCategoryField(layerOrder.find(lc => lc.name === entry.Feature)?.attributes || [])
                const catVal = catField ? String(entry[catField] ?? 'Unknown') : 'All'
                const rgb = colorMap?.get(catVal) || [200, 200, 200]
                return (
                  <tr key={idx}
                    onClick={() => zoomToEvent(entry)}
                    style={{ cursor: 'pointer', backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9', borderLeft: `4px solid rgb(${rgb[0]},${rgb[1]},${rgb[2]})` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8f4fd' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    {tableColumns.map(col => (
                      <td key={col} style={tdStyle}>
                        {col === 'Measure' ? (Math.round((entry[col] ?? 0) * 1000) / 1000) : (entry[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}
      </>)}
    </div>
  )
}

// Styles
const panelStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: '#fff',
  borderTop: '2px solid #0079c1',
  boxShadow: '0 -4px 12px rgba(0,0,0,0.15)',
  zIndex: 10000,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  transition: 'height 0.2s ease'
}

const dragHandleStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '8px',
  cursor: 'ns-resize',
  backgroundColor: '#e0e0e0',
  flexShrink: 0,
  userSelect: 'none'
}

const dragHandleBarStyle: React.CSSProperties = {
  width: '40px',
  height: '3px',
  borderRadius: '2px',
  backgroundColor: '#999'
}

const toggleBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '12px',
  cursor: 'pointer',
  color: '#0079c1',
  padding: '2px 4px',
  lineHeight: 1
}

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 12px',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#f5f5f5',
  flexShrink: 0
}

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  color: '#666',
  padding: '2px 6px'
}

const zoomBtnStyle: React.CSSProperties = {
  padding: '2px 10px',
  fontSize: '11px',
  border: '1px solid #bbb',
  borderRadius: '3px',
  cursor: 'pointer',
  backgroundColor: '#f5f5f5',
  color: '#333',
  fontWeight: 500,
  lineHeight: '18px'
}

const tabBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0',
  padding: '0 12px',
  borderBottom: '1px solid #e0e0e0',
  backgroundColor: '#fafafa',
  flexShrink: 0,
  overflowX: 'auto'
}

const tabStyle: React.CSSProperties = {
  padding: '6px 14px',
  fontSize: '11px',
  border: 'none',
  borderBottom: '2px solid transparent',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  color: '#555',
  whiteSpace: 'nowrap'
}

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: '#0079c1',
  fontWeight: 600,
  borderBottomColor: '#0079c1'
}

const tooltipStyle: React.CSSProperties = {
  backgroundColor: 'rgba(0,0,0,0.85)',
  color: '#fff',
  padding: '6px 8px',
  borderRadius: '4px',
  fontSize: '11px',
  lineHeight: '1.4',
  pointerEvents: 'none',
  whiteSpace: 'nowrap'
}

const legendContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  padding: '6px 12px',
  borderTop: '1px solid #e0e0e0',
  backgroundColor: '#fafafa',
  flexShrink: 0
}

const masterTabStyle: React.CSSProperties = {
  padding: '3px 12px',
  fontSize: '12px',
  fontWeight: 600,
  border: '1px solid #ccc',
  borderBottom: 'none',
  borderRadius: '4px 4px 0 0',
  cursor: 'pointer',
  backgroundColor: '#f0f0f0',
  color: '#666',
  marginBottom: '-1px'
}

const masterTabActiveStyle: React.CSSProperties = {
  ...masterTabStyle,
  backgroundColor: '#fff',
  color: '#0079c1',
  borderColor: '#0079c1',
  borderBottomColor: '#fff'
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '11px',
  fontFamily: 'sans-serif'
}

const thStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  padding: '6px 8px',
  textAlign: 'left',
  backgroundColor: '#f0f4f8',
  borderBottom: '2px solid #0079c1',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  fontSize: '11px',
  fontWeight: 600,
  color: '#333',
  userSelect: 'none'
}

const tdStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderBottom: '1px solid #eee',
  whiteSpace: 'nowrap',
  fontSize: '11px',
  color: '#333'
}

export default StraightLineDiagram
