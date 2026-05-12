/** @jsxRuntime classic */
import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import type { IMConfig, EventLayerConfig } from '../config'
import { LrsService } from '../lrs-utils/lrs-service'
import { KNOWN_DOMAINS } from '../lrs-utils/utils/known-domains'

const { useState, useCallback, useEffect } = React

interface DiscoveredLayer {
  id: number
  name: string
  type: string
  fields: Array<{ name: string; alias: string; type: string }>
  routeIdFieldName: string
  fromMeasureFieldName: string
  toMeasureFieldName: string | null
}

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const config = props.config

  const [networkLayers, setNetworkLayers] = useState<Array<{ id: number; name: string }>>([])
  const [discoveredLayers, setDiscoveredLayers] = useState<DiscoveredLayer[]>([])
  const [loadingService, setLoadingService] = useState(false)
  const [serviceError, setServiceError] = useState<string | null>(null)

  // System fields that shouldn't appear in the attribute picker
  const SYSTEM_FIELDS = [
    'OBJECTID', 'Shape', 'shape', 'routeid', 'rid', 'frommeasure', 'tomeasure',
    'meas', 'fromdate', 'todate', 'eventid', 'LocError', 'locerror',
    'Shape_Length', 'shape.STLength()', 'recorddate'
  ]

  const updateConfig = useCallback((key: string, value: any) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.set(key, value)
    })
  }, [props])

  // Load service info when URL changes
  const loadServiceInfo = useCallback(async (url: string) => {
    if (!url.trim()) return
    setLoadingService(true)
    setServiceError(null)

    try {
      const lrs = new LrsService(url.trim())
      const info = await lrs.getServiceInfo()

      const nets = (info.networkLayers || []).map(n => ({ id: n.id, name: n.name }))
      setNetworkLayers(nets)

      // Discover network layer route ID field
      if (nets.length > 0) {
        const selectedNetId = (props.config as any)?.networkLayerId ?? nets[0].id
        try {
          const netDetail = await lrs.getNetworkLayerInfo(selectedNetId)
          const netRouteField = (netDetail as any).routeIdFieldName || 'routeid'
          const netRouteNameField = (netDetail as any).routeNameFieldName || null
          updateConfig('networkRouteIdField', netRouteField)
          if (netRouteNameField) {
            updateConfig('networkRouteNameField', netRouteNameField)
          }
        } catch {
          // fallback
        }
      }

      // Fetch field info for each event layer, filtering out all-null fields
      const layers: DiscoveredLayer[] = []
      for (const el of (info.eventLayers || [])) {
        try {
          const detail = await lrs.getEventLayerInfo(el.id)
          const userFields = (detail.fields || []).filter(
            f => !SYSTEM_FIELDS.includes(f.name) &&
                 f.type !== 'esriFieldTypeOID' &&
                 f.type !== 'esriFieldTypeGeometry'
          )

          // Query a sample of features to find which fields actually have data
          let fieldsWithData: Set<string> | null = null
          try {
            const baseMapUrl = (props.config?.lrsServiceUrl || '').replace(/\/exts\/LRServer$/i, '')
            const sampleUrl = `${baseMapUrl}/${el.id}/query`
            const sampleParams: Record<string, string> = { where: '1=1', outFields: '*', returnGeometry: 'false', resultRecordCount: '50', f: 'json' }
            const sample = await lrs.queryFeaturesDirect(sampleUrl, sampleParams)
            if (sample?.features?.length > 0) {
              fieldsWithData = new Set<string>()
              for (const feat of sample.features) {
                for (const [key, val] of Object.entries(feat.attributes || {})) {
                  if (val !== null && val !== undefined && val !== '') {
                    fieldsWithData.add(key)
                  }
                }
              }
            }
          } catch { /* ignore sample query failure */ }

          const filteredFields = fieldsWithData
            ? userFields.filter(f => fieldsWithData.has(f.name))
            : userFields

          layers.push({
            id: el.id,
            name: el.name,
            type: el.type,
            fields: filteredFields.map(f => ({ name: f.name, alias: f.alias || f.name, type: f.type })),
            routeIdFieldName: (detail as any).routeIdFieldName || 'routeid',
            fromMeasureFieldName: (detail as any).fromMeasureFieldName || 'frommeasure',
            toMeasureFieldName: (detail as any).toMeasureFieldName || null
          })
        } catch {
          layers.push({
            id: el.id, name: el.name, type: el.type, fields: [],
            routeIdFieldName: 'routeid', fromMeasureFieldName: 'frommeasure', toMeasureFieldName: null
          })
        }
      }
      setDiscoveredLayers(layers)

      // Auto-enable default layers if no event layers configured yet
      const existing = props.config?.eventLayerConfigs as any as EventLayerConfig[] || []
      if (existing.length === 0 && layers.length > 0) {
        const DEFAULT_LAYERS = ['functional class', 'median type', 'speed limit', 'crash', 'grade', 'curve']
        const autoConfigs: EventLayerConfig[] = []
        for (const layer of layers) {
          const nameLower = layer.name.toLowerCase()
          if (DEFAULT_LAYERS.some(d => nameLower.includes(d))) {
            const overrides: { [fieldName: string]: { [code: string]: string } } = {}
            for (const f of layer.fields) {
              if (KNOWN_DOMAINS[f.name]) {
                overrides[f.name] = KNOWN_DOMAINS[f.name]
              }
            }
            autoConfigs.push({
              layerId: layer.id,
              name: layer.name,
              type: layer.type as any,
              attributes: layer.fields.filter(f => !!KNOWN_DOMAINS[f.name]).map(f => f.name),
              routeIdField: layer.routeIdFieldName,
              ...(layer.type.includes('Point')
                ? { measureField: layer.fromMeasureFieldName }
                : { fromMeasureField: layer.fromMeasureFieldName, toMeasureField: layer.toMeasureFieldName || undefined }),
              ...(Object.keys(overrides).length > 0 ? { domainOverrides: overrides } : {})
            })
          }
        }
        if (autoConfigs.length > 0) {
          updateConfig('eventLayerConfigs', autoConfigs)
        }
      }
    } catch (err: any) {
      setServiceError(err.message || 'Failed to load service info')
      setNetworkLayers([])
      setDiscoveredLayers([])
    } finally {
      setLoadingService(false)
    }
  }, [])

  // Auto-load service info on mount if URL is set
  useEffect(() => {
    if (config?.lrsServiceUrl && discoveredLayers.length === 0) {
      loadServiceInfo(config.lrsServiceUrl)
    }
  }, [])

  const handleUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig('lrsServiceUrl', e.target.value)
  }, [updateConfig])

  const handleUrlBlur = useCallback(() => {
    if (config?.lrsServiceUrl) {
      loadServiceInfo(config.lrsServiceUrl)
    }
  }, [config?.lrsServiceUrl, loadServiceInfo])

  const handleNetworkChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    updateConfig('networkLayerId', parseInt(e.target.value, 10))
  }, [updateConfig])

  // Toggle an event layer on/off — auto-select all user fields when enabling
  const toggleEventLayer = useCallback((layer: DiscoveredLayer) => {
    const current: EventLayerConfig[] = config?.eventLayerConfigs ? [...config.eventLayerConfigs as any] : []
    const idx = current.findIndex(e => e.layerId === layer.id)

    if (idx >= 0) {
      current.splice(idx, 1)
    } else {
      // Build domainOverrides from known domains
      const overrides: { [fieldName: string]: { [code: string]: string } } = {}
      for (const f of layer.fields) {
        if (KNOWN_DOMAINS[f.name]) {
          overrides[f.name] = KNOWN_DOMAINS[f.name]
        }
      }

      const newLayer: EventLayerConfig = {
        layerId: layer.id,
        name: layer.name,
        type: layer.type as any,
        attributes: layer.fields.filter(f => !!KNOWN_DOMAINS[f.name]).map(f => f.name),
        routeIdField: layer.routeIdFieldName,
        ...(layer.type.includes('Point')
          ? { measureField: layer.fromMeasureFieldName }
          : { fromMeasureField: layer.fromMeasureFieldName, toMeasureField: layer.toMeasureFieldName || undefined }),
        ...(Object.keys(overrides).length > 0 ? { domainOverrides: overrides } : {})
      }
      current.push(newLayer)
    }

    updateConfig('eventLayerConfigs', current)
  }, [config?.eventLayerConfigs, updateConfig])

  // Toggle an individual attribute field within an event layer
  const toggleAttribute = useCallback((layerId: number, fieldName: string) => {
    const current: EventLayerConfig[] = config?.eventLayerConfigs ? [...config.eventLayerConfigs as any] : []
    const idx = current.findIndex(e => e.layerId === layerId)
    if (idx < 0) return

    const attrs = [...current[idx].attributes]
    const attrIdx = attrs.indexOf(fieldName)
    if (attrIdx >= 0) {
      attrs.splice(attrIdx, 1)
    } else {
      attrs.push(fieldName)
    }
    current[idx] = { ...current[idx], attributes: attrs }
    updateConfig('eventLayerConfigs', current)
  }, [config?.eventLayerConfigs, updateConfig])

  // Select all / Clear all for a layer
  const selectAllAttributes = useCallback((layerId: number, allFieldNames: string[]) => {
    const current: EventLayerConfig[] = config?.eventLayerConfigs ? [...config.eventLayerConfigs as any] : []
    const idx = current.findIndex(e => e.layerId === layerId)
    if (idx < 0) return
    current[idx] = { ...current[idx], attributes: [...allFieldNames] }
    updateConfig('eventLayerConfigs', current)
  }, [config?.eventLayerConfigs, updateConfig])

  const clearAllAttributes = useCallback((layerId: number) => {
    const current: EventLayerConfig[] = config?.eventLayerConfigs ? [...config.eventLayerConfigs as any] : []
    const idx = current.findIndex(e => e.layerId === layerId)
    if (idx < 0) return
    current[idx] = { ...current[idx], attributes: [] }
    updateConfig('eventLayerConfigs', current)
  }, [config?.eventLayerConfigs, updateConfig])

  // Per-layer field search
  const [fieldSearch, setFieldSearch] = useState<Record<number, string>>({})
  const getFieldSearch = (layerId: number) => fieldSearch[layerId] || ''
  const setLayerFieldSearch = (layerId: number, val: string) => {
    setFieldSearch(prev => ({ ...prev, [layerId]: val }))
  }

  const handlePrecisionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10)
    updateConfig('measurePrecision', isNaN(val) ? 3 : val)
  }, [updateConfig])

  const handleMapWidgetChange = useCallback((useMapWidgetIds: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds
    })
  }, [props])

  // Get the config entry for a discovered layer
  const getLayerConfig = (layerId: number): EventLayerConfig | undefined => {
    return (config?.eventLayerConfigs as any as EventLayerConfig[] || [])
      .find(e => e.layerId === layerId)
  }

  return (
    <div className="p-3" style={{ fontSize: '13px', color: '#fff' }}>
      <h5 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#fff' }}>Road Log Settings</h5>

      {/* LRS Service URL */}
      <div style={fieldGroupStyle}>
        <label style={labelStyle}>LRS Service URL</label>
        <p style={descStyle}>The REST endpoint for your Linear Referencing System (LRS) service. Click "Load Service" to discover available network and event layers.</p>
        <input
          type="text"
          value={config?.lrsServiceUrl || ''}
          onChange={handleUrlChange}
          onBlur={handleUrlBlur}
          style={inputStyle}
          placeholder="https://.../MapServer/exts/LRServer"
        />
        <button type="button" onClick={handleUrlBlur} style={loadBtnStyle}>
          {loadingService ? 'Loading...' : 'Load Service'}

      {/* Map Widget (for polygon select mode) */}
      <div style={fieldGroupStyle}>
        <label style={labelStyle}>Map Widget (for polygon select)</label>
        <p style={descStyle}>Choose the map widget used for spatial selection. This enables the polygon-select tool to pick routes from the map.</p>
        <MapWidgetSelector
          onSelect={handleMapWidgetChange}
          useMapWidgetIds={props.useMapWidgetIds}
        />
      </div>
        </button>
        {serviceError && <div style={errorStyle}>{serviceError}</div>}
      </div>

      {/* Network Layer (auto-select first if only one) */}
      {networkLayers.length > 1 && (
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Network Layer</label>
          <p style={descStyle}>Select which LRS network to query routes from. Only needed if your service has multiple networks.</p>
          <select
            value={config?.networkLayerId ?? ''}
            onChange={handleNetworkChange}
            style={inputStyle}
          >
            <option value="">-- Select Network --</option>
            {networkLayers.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Event Layers — always expanded with all fields visible */}
      {discoveredLayers.length > 0 && (
        <div style={fieldGroupStyle}>
          <label style={labelStyle}>Event Layers &amp; Attributes</label>
          <p style={descStyle}>
            Check a layer to include it in the road log report. When enabled, choose which attribute fields to display. Fields marked with ★ have domain labels that will show descriptive text instead of codes.
          </p>
          <div style={eventListStyle}>
            {discoveredLayers.map(layer => {
              const layerCfg = getLayerConfig(layer.id)
              const isSelected = !!layerCfg
              const typeTag = layer.type.includes('Point') ? '(Marker)' : '(Linear)'

              return (
                <div key={layer.id} style={{ marginBottom: '10px' }}>
                  {/* Layer checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEventLayer(layer)}
                    />
                    <span style={{ marginLeft: '4px', fontSize: '12px', fontWeight: 600, color: '#000' }}>
                      {layer.name}
                    </span>
                    <span style={{ color: '#555', marginLeft: '6px', fontSize: '11px' }}>{typeTag}</span>
                  </div>

                  {/* Always-visible attribute field list */}
                  {isSelected && layer.fields.length > 0 && (
                    <div style={fieldPickerStyle}>
                      {/* Search + Select/Clear All */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={getFieldSearch(layer.id)}
                          onChange={(e) => setLayerFieldSearch(layer.id, e.target.value)}
                          style={{ flex: 1, minWidth: 0, padding: '2px 4px', fontSize: '10px', border: '1px solid #ccc', borderRadius: '3px', color: '#000', backgroundColor: '#fff' }}
                        />
                        <button type="button" onClick={() => selectAllAttributes(layer.id, layer.fields.map(f => f.name))} style={miniBtn}>All</button>
                        <button type="button" onClick={() => clearAllAttributes(layer.id)} style={miniBtn}>None</button>
                      </div>
                      {layer.fields
                        .filter(f => {
                          const q = getFieldSearch(layer.id).toLowerCase()
                          if (!q) return true
                          return (f.alias || f.name).toLowerCase().includes(q) || f.name.toLowerCase().includes(q)
                        })
                        .map(f => {
                        const isAttrSelected = layerCfg?.attributes?.includes(f.name) ?? false
                        const hasDomain = !!(KNOWN_DOMAINS[f.name])
                        return (
                          <label key={f.name} style={{ display: 'block', fontSize: '11px', padding: '2px 0', cursor: 'pointer', color: '#000' }}>
                            <input
                              type="checkbox"
                              checked={isAttrSelected}
                              onChange={() => toggleAttribute(layer.id, f.name)}
                              style={{ marginRight: '4px' }}
                            />
                            {f.alias || f.name}
                            <span style={{ color: '#555', marginLeft: '4px', fontSize: '10px' }}>{typeTag}</span>
                            {hasDomain && <span style={{ color: '#0079c1', marginLeft: '4px', fontSize: '10px' }}>★ labels</span>}
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {isSelected && layer.fields.length === 0 && (
                    <div style={{ ...fieldPickerStyle, color: '#888', fontStyle: 'italic' }}>
                      No user attributes available
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Measure Precision */}
      <div style={fieldGroupStyle}>
        <label style={labelStyle}>Measure Precision (decimal places)</label>
        <p style={descStyle}>Number of decimal places to display for measure values (e.g. 3 = 12.345 miles).</p>
        <input
          type="number"
          min={0}
          max={10}
          value={config?.measurePrecision ?? 3}
          onChange={handlePrecisionChange}
          style={{ ...inputStyle, width: '80px' }}
        />
      </div>
    </div>
  )
}

// Styles
const fieldGroupStyle: React.CSSProperties = {
  marginBottom: '14px'
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  marginBottom: '4px',
  color: '#fff'
}

const descStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'rgba(255,255,255,0.75)',
  margin: '0 0 6px 0',
  lineHeight: '1.4'
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 8px',
  fontSize: '12px',
  border: '1px solid #999',
  borderRadius: '4px',
  boxSizing: 'border-box',
  color: '#000',
  backgroundColor: '#fff'
}

const miniBtn: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: '10px',
  border: '1px solid #999',
  borderRadius: '3px',
  backgroundColor: '#fff',
  color: '#000',
  cursor: 'pointer',
  whiteSpace: 'nowrap'
}

const loadBtnStyle: React.CSSProperties = {
  marginTop: '4px',
  padding: '4px 12px',
  fontSize: '12px',
  border: '1px solid #999',
  borderRadius: '3px',
  backgroundColor: '#fff',
  color: '#000',
  cursor: 'pointer'
}

const eventListStyle: React.CSSProperties = {
  maxHeight: '300px',
  overflow: 'auto',
  border: '1px solid #999',
  borderRadius: '4px',
  padding: '6px',
  backgroundColor: '#fff',
  color: '#000'
}

const fieldPickerStyle: React.CSSProperties = {
  marginLeft: '20px',
  marginTop: '4px',
  padding: '4px 6px',
  backgroundColor: '#f0f0f0',
  border: '1px solid #ccc',
  borderRadius: '3px',
  color: '#000',
  overflow: 'hidden',
  boxSizing: 'border-box'
}

const errorStyle: React.CSSProperties = {
  marginTop: '4px',
  fontSize: '11px',
  color: '#d83020'
}

export default Setting
