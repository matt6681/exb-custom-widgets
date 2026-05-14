System.register(["jimu-core","jimu-ui/advanced/setting-components"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__, "__esModule", { value: true });
	return {
		setters: [
			function(module) {
				__WEBPACK_EXTERNAL_MODULE_jimu_core__["default"] = module["default"] || module;
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_core__[key] = module[key];
				});
			},
			function(module) {
				__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__["default"] = module["default"] || module;
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__[key] = module[key];
				});
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./your-extensions/widgets/crash-risk/src/lrs-utils/lrs-service.ts"
/*!*************************************************************************!*\
  !*** ./your-extensions/widgets/crash-risk/src/lrs-utils/lrs-service.ts ***!
  \*************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LrsService: () => (/* binding */ LrsService)
/* harmony export */ });
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let jsonpCounter = 0;
/**
 * JSONP request — bypasses CORS entirely by injecting a <script> tag.
 * ArcGIS REST API supports JSONP via the 'callback' parameter.
 */
function jsonpRequest(url, params) {
    return new Promise((resolve, reject) => {
        const callbackName = `_lrs_cb_${Date.now()}_${jsonpCounter++}`;
        params.callback = callbackName;
        const qs = new URLSearchParams(params).toString();
        const scriptUrl = `${url}?${qs}`;
        const script = document.createElement('script');
        script.src = scriptUrl;
        const cleanup = () => {
            delete window[callbackName];
            if (script.parentNode)
                script.parentNode.removeChild(script);
        };
        window[callbackName] = (data) => {
            cleanup();
            if (data.error) {
                reject(new Error(data.error.message || 'Request error'));
            }
            else {
                resolve(data);
            }
        };
        script.onerror = () => {
            cleanup();
            reject(new Error('JSONP request failed'));
        };
        const timer = setTimeout(() => {
            if (window[callbackName]) {
                cleanup();
                reject(new Error('Request timeout'));
            }
        }, 30000);
        window[callbackName] = (data) => {
            clearTimeout(timer);
            cleanup();
            if (data.error) {
                reject(new Error(data.error.message || 'Request error'));
            }
            else {
                resolve(data);
            }
        };
        document.head.appendChild(script);
    });
}
/**
 * Wrapper around ArcGIS LRS REST API (LRServer extension).
 * Uses JSONP for all requests to avoid CORS issues.
 */
class LrsService {
    constructor(baseUrl, token) {
        // Ensure no trailing slash
        this.baseUrl = baseUrl.replace(/\/+$/, '');
        this.token = token || null;
    }
    setToken(token) {
        this.token = token;
    }
    /**
     * Fetch LRS service metadata (network layers, event layers, etc.)
     */
    getServiceInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request('');
        });
    }
    /**
     * Fetch detailed info for a network layer (fields, measure precision, etc.)
     */
    getNetworkLayerInfo(layerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(`/networkLayers/${layerId}`);
        });
    }
    /**
     * Fetch detailed info for an event layer
     */
    getEventLayerInfo(layerId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.request(`/eventLayers/${layerId}`);
        });
    }
    /**
     * Convert route ID + measures to map geometry
     */
    measureToGeometry(networkLayerId, locations, outSR) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                locations: JSON.stringify(locations),
                f: 'json'
            };
            if (outSR) {
                params.outSR = JSON.stringify(outSR);
            }
            return this.request(`/networkLayers/${networkLayerId}/measureToGeometry`, params);
        });
    }
    /**
     * Convert map geometry (point) to route + measure
     */
    geometryToMeasure(networkLayerId, locations, outSR) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                locations: JSON.stringify(locations),
                f: 'json'
            };
            if (outSR) {
                params.outSR = JSON.stringify(outSR);
            }
            return this.request(`/networkLayers/${networkLayerId}/geometryToMeasure`, params);
        });
    }
    /**
     * Dynamic segmentation overlay — queryAttributeSet
     */
    queryAttributeSet(networkLayerId, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const requestParams = {
                locations: JSON.stringify(params.locations),
                attributeSet: JSON.stringify(params.attributeSet),
                f: 'json'
            };
            if (params.outSR) {
                requestParams.outSR = JSON.stringify(params.outSR);
            }
            return this.request(`/networkLayers/${networkLayerId}/queryAttributeSet`, requestParams);
        });
    }
    /**
     * Standard feature query against a map service layer (for Road Log individual event queries)
     */
    queryFeatures(mapServiceUrl_1, layerId_1, where_1) {
        return __awaiter(this, arguments, void 0, function* (mapServiceUrl, layerId, where, outFields = ['*']) {
            // The map service URL is the parent of LRServer extension
            // e.g. .../MapServer/0/query
            const baseMapUrl = this.baseUrl.replace(/\/exts\/LRServer$/i, '');
            const url = `${baseMapUrl}/${layerId}/query`;
            const params = {
                where,
                outFields: outFields.join(','),
                returnGeometry: 'false',
                f: 'json'
            };
            if (this.token) {
                params.token = this.token;
            }
            return jsonpRequest(url, params);
        });
    }
    /**
     * Direct query with arbitrary params (for spatial queries via JSONP)
     */
    queryFeaturesDirect(url, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.token) {
                params.token = this.token;
            }
            params.f = params.f || 'json';
            return jsonpRequest(url, params);
        });
    }
    /**
     * Query routes on a network layer (for route picker autocomplete)
     */
    queryRoutes(networkLayerId_1, searchText_1, routeIdField_1, routeNameField_1) {
        return __awaiter(this, arguments, void 0, function* (networkLayerId, searchText, routeIdField, routeNameField, maxResults = 10) {
            const baseMapUrl = this.baseUrl.replace(/\/exts\/LRServer$/i, '');
            const url = `${baseMapUrl}/${networkLayerId}/query`;
            const searchField = routeNameField || routeIdField;
            const where = `UPPER(${searchField}) LIKE UPPER('${searchText.replace(/'/g, "''")}%')`;
            const outFields = routeNameField
                ? [routeIdField, routeNameField]
                : [routeIdField];
            const params = {
                where,
                outFields: outFields.join(','),
                returnGeometry: 'false',
                resultRecordCount: maxResults.toString(),
                f: 'json'
            };
            if (this.token) {
                params.token = this.token;
            }
            const json = yield jsonpRequest(url, params);
            const all = (json.features || []).map((f) => ({
                routeId: f.attributes[routeIdField],
                routeName: routeNameField ? f.attributes[routeNameField] : null
            }));
            // Deduplicate by routeId
            const seen = new Set();
            return all.filter((r) => {
                if (seen.has(r.routeId))
                    return false;
                seen.add(r.routeId);
                return true;
            });
        });
    }
    // --- Private helpers ---
    request(path, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = `${this.baseUrl}${path}`;
            const allParams = Object.assign({ f: 'json' }, params);
            if (this.token) {
                allParams.token = this.token;
            }
            return jsonpRequest(url, allParams);
        });
    }
}


/***/ },

/***/ "jimu-core"
/*!****************************!*\
  !*** external "jimu-core" ***!
  \****************************/
(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_core__;

/***/ },

/***/ "jimu-ui/advanced/setting-components"
/*!******************************************************!*\
  !*** external "jimu-ui/advanced/setting-components" ***!
  \******************************************************/
(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "";
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!******************************************!*\
  !*** ./jimu-core/lib/set-public-path.ts ***!
  \******************************************/
/**
 * Webpack will replace __webpack_public_path__ with __webpack_require__.p to set the public path dynamically.
 * The reason why we can't set the publicPath in webpack config is: we change the publicPath when download.
 * */
__webpack_require__.p = window.jimuConfig.baseUrl;

})();

// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!********************************************************************!*\
  !*** ./your-extensions/widgets/crash-risk/src/setting/setting.tsx ***!
  \********************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-ui/advanced/setting-components */ "jimu-ui/advanced/setting-components");
/* harmony import */ var _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lrs-utils/lrs-service */ "./your-extensions/widgets/crash-risk/src/lrs-utils/lrs-service.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** @jsxRuntime classic */



const { useState, useCallback, useEffect } = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React;
const Setting = (props) => {
    var _a;
    const config = props.config;
    const [networkLayers, setNetworkLayers] = useState([]);
    const [discoveredLayers, setDiscoveredLayers] = useState([]);
    const [loadingService, setLoadingService] = useState(false);
    const [serviceError, setServiceError] = useState(null);
    const SYSTEM_FIELDS = [
        'OBJECTID', 'Shape', 'shape', 'routeid', 'rid', 'frommeasure', 'tomeasure',
        'meas', 'fromdate', 'todate', 'eventid', 'LocError', 'locerror',
        'Shape_Length', 'shape.STLength()', 'recorddate'
    ];
    const updateConfig = useCallback((key, value) => {
        props.onSettingChange({
            id: props.id,
            config: props.config.set(key, value)
        });
    }, [props]);
    const loadServiceInfo = useCallback((url) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        if (!url.trim())
            return;
        setLoadingService(true);
        setServiceError(null);
        try {
            const lrs = new _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_2__.LrsService(url.trim());
            const info = yield lrs.getServiceInfo();
            const nets = (info.networkLayers || []).map(n => ({ id: n.id, name: n.name }));
            setNetworkLayers(nets);
            if (nets.length > 0) {
                const selectedNetId = (_b = (_a = props.config) === null || _a === void 0 ? void 0 : _a.networkLayerId) !== null && _b !== void 0 ? _b : nets[0].id;
                try {
                    const netDetail = yield lrs.getNetworkLayerInfo(selectedNetId);
                    const netRouteField = netDetail.routeIdFieldName || 'routeid';
                    const netRouteNameField = netDetail.routeNameFieldName || null;
                    updateConfig('networkRouteIdField', netRouteField);
                    if (netRouteNameField)
                        updateConfig('networkRouteNameField', netRouteNameField);
                }
                catch ( /* fallback */_f) { /* fallback */ }
            }
            const layers = [];
            for (const el of (info.eventLayers || [])) {
                try {
                    const detail = yield lrs.getEventLayerInfo(el.id);
                    const userFields = (detail.fields || []).filter(f => !SYSTEM_FIELDS.includes(f.name) && f.type !== 'esriFieldTypeOID' && f.type !== 'esriFieldTypeGeometry');
                    let fieldsWithData = null;
                    try {
                        const baseMapUrl = (((_c = props.config) === null || _c === void 0 ? void 0 : _c.lrsServiceUrl) || '').replace(/\/exts\/LRServer$/i, '');
                        const sampleUrl = `${baseMapUrl}/${el.id}/query`;
                        const sample = yield lrs.queryFeaturesDirect(sampleUrl, { where: '1=1', outFields: '*', returnGeometry: 'false', resultRecordCount: '50', f: 'json' });
                        if (((_d = sample === null || sample === void 0 ? void 0 : sample.features) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                            fieldsWithData = new Set();
                            for (const feat of sample.features) {
                                for (const [key, val] of Object.entries(feat.attributes || {})) {
                                    if (val !== null && val !== undefined && val !== '')
                                        fieldsWithData.add(key);
                                }
                            }
                        }
                    }
                    catch ( /* ignore */_g) { /* ignore */ }
                    const filteredFields = fieldsWithData ? userFields.filter(f => fieldsWithData.has(f.name)) : userFields;
                    layers.push({
                        id: el.id, name: el.name, type: el.type,
                        fields: filteredFields.map(f => ({ name: f.name, alias: f.alias || f.name, type: f.type })),
                        routeIdFieldName: detail.routeIdFieldName || 'routeid',
                        fromMeasureFieldName: detail.fromMeasureFieldName || 'frommeasure',
                        toMeasureFieldName: detail.toMeasureFieldName || null
                    });
                }
                catch (_h) {
                    layers.push({ id: el.id, name: el.name, type: el.type, fields: [], routeIdFieldName: 'routeid', fromMeasureFieldName: 'frommeasure', toMeasureFieldName: null });
                }
            }
            setDiscoveredLayers(layers);
            // Auto-enable layers relevant to crash prediction
            const existing = ((_e = props.config) === null || _e === void 0 ? void 0 : _e.eventLayerConfigs) || [];
            if (existing.length === 0 && layers.length > 0) {
                // Enable EVERY discovered event layer that has at least one data-bearing field,
                // with ALL of its fields selected. This maximizes factor coverage for AI/ML/LLM.
                // (System-only layers like Calibration Point will have 0 fields and are skipped.)
                const autoConfigs = [];
                for (const layer of layers) {
                    if (!layer.fields || layer.fields.length === 0)
                        continue;
                    autoConfigs.push(Object.assign({ layerId: layer.id, name: layer.name, type: layer.type, attributes: layer.fields.map(f => f.name), routeIdField: layer.routeIdFieldName }, (layer.type.includes('Point')
                        ? { measureField: layer.fromMeasureFieldName }
                        : { fromMeasureField: layer.fromMeasureFieldName, toMeasureField: layer.toMeasureFieldName || undefined })));
                }
                if (autoConfigs.length > 0)
                    updateConfig('eventLayerConfigs', autoConfigs);
            }
            else if (existing.length > 0 && layers.length > 0) {
                // Top up: ensure every already-enabled layer has ALL of its available data-bearing attributes
                // selected. This catches cases where the saved config has only some attributes ticked.
                let changed = false;
                const merged = existing.map(cfg => {
                    const layer = layers.find(l => l.id === cfg.layerId);
                    if (!layer)
                        return cfg;
                    const allFieldNames = layer.fields.map(f => f.name);
                    const currentAttrs = cfg.attributes || [];
                    const missing = allFieldNames.filter(n => !currentAttrs.includes(n));
                    if (missing.length === 0)
                        return cfg;
                    changed = true;
                    return Object.assign(Object.assign({}, cfg), { attributes: [...currentAttrs, ...missing] });
                });
                if (changed)
                    updateConfig('eventLayerConfigs', merged);
            }
        }
        catch (err) {
            setServiceError(err.message || 'Failed to load service info');
            setNetworkLayers([]);
            setDiscoveredLayers([]);
        }
        finally {
            setLoadingService(false);
        }
    }), []);
    useEffect(() => {
        if ((config === null || config === void 0 ? void 0 : config.lrsServiceUrl) && discoveredLayers.length === 0)
            loadServiceInfo(config.lrsServiceUrl);
    }, []);
    const handleUrlChange = useCallback((e) => { updateConfig('lrsServiceUrl', e.target.value); }, [updateConfig]);
    const handleUrlBlur = useCallback(() => { if (config === null || config === void 0 ? void 0 : config.lrsServiceUrl)
        loadServiceInfo(config.lrsServiceUrl); }, [config === null || config === void 0 ? void 0 : config.lrsServiceUrl, loadServiceInfo]);
    const handleNetworkChange = useCallback((e) => { updateConfig('networkLayerId', parseInt(e.target.value, 10)); }, [updateConfig]);
    const toggleEventLayer = useCallback((layer) => {
        const current = (config === null || config === void 0 ? void 0 : config.eventLayerConfigs) ? [...config.eventLayerConfigs] : [];
        const idx = current.findIndex(e => e.layerId === layer.id);
        if (idx >= 0) {
            current.splice(idx, 1);
        }
        else {
            current.push(Object.assign({ layerId: layer.id, name: layer.name, type: layer.type, attributes: layer.fields.map(f => f.name), routeIdField: layer.routeIdFieldName }, (layer.type.includes('Point') ? { measureField: layer.fromMeasureFieldName } : { fromMeasureField: layer.fromMeasureFieldName, toMeasureField: layer.toMeasureFieldName || undefined })));
        }
        updateConfig('eventLayerConfigs', current);
    }, [config === null || config === void 0 ? void 0 : config.eventLayerConfigs, updateConfig]);
    const toggleAttribute = useCallback((layerId, fieldName) => {
        const current = (config === null || config === void 0 ? void 0 : config.eventLayerConfigs) ? [...config.eventLayerConfigs] : [];
        const idx = current.findIndex(e => e.layerId === layerId);
        if (idx < 0)
            return;
        const attrs = [...current[idx].attributes];
        const attrIdx = attrs.indexOf(fieldName);
        if (attrIdx >= 0)
            attrs.splice(attrIdx, 1);
        else
            attrs.push(fieldName);
        current[idx] = Object.assign(Object.assign({}, current[idx]), { attributes: attrs });
        updateConfig('eventLayerConfigs', current);
    }, [config === null || config === void 0 ? void 0 : config.eventLayerConfigs, updateConfig]);
    const handleMapWidgetChange = useCallback((useMapWidgetIds) => {
        props.onSettingChange({ id: props.id, useMapWidgetIds });
    }, [props]);
    const getLayerConfig = (layerId) => {
        return ((config === null || config === void 0 ? void 0 : config.eventLayerConfigs) || []).find(e => e.layerId === layerId);
    };
    const [fieldSearch, setFieldSearch] = useState({});
    return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "p-3", style: { fontSize: '13px', color: '#fff' } },
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("h5", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#fff' } }, "Crash Risk Prediction Settings"),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "Map Widget"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "Select the map widget for route picking and prediction display."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_1__.MapWidgetSelector, { onSelect: handleMapWidgetChange, useMapWidgetIds: props.useMapWidgetIds })),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "LRS Service URL"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "REST endpoint for the Linear Referencing System service."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "text", value: (config === null || config === void 0 ? void 0 : config.lrsServiceUrl) || '', onChange: handleUrlChange, onBlur: handleUrlBlur, style: inputStyle, placeholder: "https://.../MapServer/exts/LRServer" }),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: handleUrlBlur, style: loadBtnStyle }, loadingService ? 'Loading...' : 'Load Service'),
            serviceError && jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: errorStyle }, serviceError)),
        networkLayers.length > 1 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "Network Layer"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("select", { value: (_a = config === null || config === void 0 ? void 0 : config.networkLayerId) !== null && _a !== void 0 ? _a : '', onChange: handleNetworkChange, style: inputStyle },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("option", { value: "" }, "-- Select Network --"),
                networkLayers.map(n => jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("option", { key: n.id, value: n.id }, n.name))))),
        discoveredLayers.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "Event Layers & Attributes"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "Select layers and attributes to use for crash risk prediction. More layers = more prediction factors."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: eventListStyle }, discoveredLayers.map(layer => {
                const layerCfg = getLayerConfig(layer.id);
                const isSelected = !!layerCfg;
                return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { key: layer.id, style: { marginBottom: '8px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "checkbox", checked: isSelected, onChange: () => toggleEventLayer(layer) }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { marginLeft: '4px', fontSize: '12px', fontWeight: 600, color: '#000' } }, layer.name),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: '#555', marginLeft: '6px', fontSize: '10px' } }, layer.type.includes('Point') ? '(Pt)' : '(Line)')),
                    isSelected && layer.fields.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldPickerStyle },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "text", placeholder: "Search fields...", value: fieldSearch[layer.id] || '', onChange: e => setFieldSearch(p => (Object.assign(Object.assign({}, p), { [layer.id]: e.target.value }))), style: { width: '100%', padding: '2px 4px', fontSize: '10px', border: '1px solid #ccc', borderRadius: '3px', marginBottom: '3px', color: '#000', backgroundColor: '#fff' } }),
                        layer.fields.filter(f => { const q = (fieldSearch[layer.id] || '').toLowerCase(); return !q || f.name.toLowerCase().includes(q) || (f.alias || '').toLowerCase().includes(q); }).map(f => {
                            var _a, _b;
                            return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { key: f.name, style: { display: 'block', fontSize: '11px', padding: '1px 0', cursor: 'pointer', color: '#000' } },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "checkbox", checked: (_b = (_a = layerCfg === null || layerCfg === void 0 ? void 0 : layerCfg.attributes) === null || _a === void 0 ? void 0 : _a.includes(f.name)) !== null && _b !== void 0 ? _b : false, onChange: () => toggleAttribute(layer.id, f.name), style: { marginRight: '4px' } }),
                                f.alias || f.name));
                        })))));
            }))))));
};
const fieldGroupStyle = { marginBottom: '14px' };
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#fff' };
const descStyle = { fontSize: '11px', color: 'rgba(255,255,255,0.75)', margin: '0 0 6px 0', lineHeight: '1.4' };
const inputStyle = { width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #999', borderRadius: '4px', boxSizing: 'border-box', color: '#000', backgroundColor: '#fff' };
const loadBtnStyle = { marginTop: '4px', padding: '4px 12px', fontSize: '12px', border: '1px solid #999', borderRadius: '3px', backgroundColor: '#fff', color: '#000', cursor: 'pointer' };
const eventListStyle = { maxHeight: '300px', overflow: 'auto', border: '1px solid #999', borderRadius: '4px', padding: '6px', backgroundColor: '#fff', color: '#000' };
const fieldPickerStyle = { marginLeft: '20px', marginTop: '4px', padding: '4px 6px', backgroundColor: '#f0f0f0', border: '1px solid #ccc', borderRadius: '3px', color: '#000' };
const errorStyle = { marginTop: '4px', fontSize: '11px', color: '#d83020' };
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Setting);
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jcmFzaC1yaXNrL2Rpc3Qvc2V0dGluZy9zZXR0aW5nLmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWFBLElBQUksWUFBWSxHQUFHLENBQUM7QUFFcEI7OztHQUdHO0FBQ0gsU0FBUyxZQUFZLENBQUUsR0FBVyxFQUFFLE1BQThCO0lBQ2hFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsTUFBTSxZQUFZLEdBQUcsV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksWUFBWSxFQUFFLEVBQUU7UUFDOUQsTUFBTSxDQUFDLFFBQVEsR0FBRyxZQUFZO1FBRTlCLE1BQU0sRUFBRSxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRTtRQUNqRCxNQUFNLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLEVBQUU7UUFFaEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7UUFDL0MsTUFBTSxDQUFDLEdBQUcsR0FBRyxTQUFTO1FBRXRCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtZQUNuQixPQUFRLE1BQWMsQ0FBQyxZQUFZLENBQUM7WUFDcEMsSUFBSSxNQUFNLENBQUMsVUFBVTtnQkFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFDOUQsQ0FBQyxDQUVBO1FBQUMsTUFBYyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBUyxFQUFFLEVBQUU7WUFDN0MsT0FBTyxFQUFFO1lBQ1QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2YsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxDQUFDO1lBQzFELENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLENB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UyxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRTtBQUNwTSxNQUFNLFVBQVUsR0FBd0IsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRTtBQUVoRyxpRUFBZSxPQUFPO0FBRWQsU0FBUywyQkFBMkIsQ0FBQyxHQUFHLElBQUkscUJBQXVCLEdBQUcsR0FBRyxFQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvY3Jhc2gtcmlzay9zcmMvbHJzLXV0aWxzL2xycy1zZXJ2aWNlLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LXVpL2FkdmFuY2VkL3NldHRpbmctY29tcG9uZW50c1wiIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWNvcmUvbGliL3NldC1wdWJsaWMtcGF0aC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvY3Jhc2gtcmlzay9zcmMvc2V0dGluZy9zZXR0aW5nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBMUlMgUkVTVCBBUEkgU2VydmljZSB3cmFwcGVyXHJcbi8vIFVzZXMgSlNPTlAgdG8gYnlwYXNzIENPUlMgaXNzdWVzIHdpdGggbWlzY29uZmlndXJlZCBzZXJ2ZXJzIChkdXBsaWNhdGUgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIGhlYWRlcnMpXHJcbmltcG9ydCB0eXBlIHtcclxuICBMcnNTZXJ2aWNlSW5mbyxcclxuICBOZXR3b3JrTGF5ZXJJbmZvLFxyXG4gIEV2ZW50TGF5ZXJJbmZvLFxyXG4gIE1lYXN1cmVUb0dlb21ldHJ5TG9jYXRpb24sXHJcbiAgTWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQsXHJcbiAgR2VvbWV0cnlUb01lYXN1cmVSZXN1bHQsXHJcbiAgUXVlcnlBdHRyaWJ1dGVTZXRQYXJhbXMsXHJcbiAgRmVhdHVyZVNldFJlc3VsdFxyXG59IGZyb20gJy4vdHlwZXMnXHJcblxyXG5sZXQganNvbnBDb3VudGVyID0gMFxyXG5cclxuLyoqXHJcbiAqIEpTT05QIHJlcXVlc3Qg4oCUIGJ5cGFzc2VzIENPUlMgZW50aXJlbHkgYnkgaW5qZWN0aW5nIGEgPHNjcmlwdD4gdGFnLlxyXG4gKiBBcmNHSVMgUkVTVCBBUEkgc3VwcG9ydHMgSlNPTlAgdmlhIHRoZSAnY2FsbGJhY2snIHBhcmFtZXRlci5cclxuICovXHJcbmZ1bmN0aW9uIGpzb25wUmVxdWVzdCAodXJsOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8YW55PiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IGNhbGxiYWNrTmFtZSA9IGBfbHJzX2NiXyR7RGF0ZS5ub3coKX1fJHtqc29ucENvdW50ZXIrK31gXHJcbiAgICBwYXJhbXMuY2FsbGJhY2sgPSBjYWxsYmFja05hbWVcclxuXHJcbiAgICBjb25zdCBxcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocGFyYW1zKS50b1N0cmluZygpXHJcbiAgICBjb25zdCBzY3JpcHRVcmwgPSBgJHt1cmx9PyR7cXN9YFxyXG5cclxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXHJcbiAgICBzY3JpcHQuc3JjID0gc2NyaXB0VXJsXHJcblxyXG4gICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcclxuICAgICAgZGVsZXRlICh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdXHJcbiAgICAgIGlmIChzY3JpcHQucGFyZW50Tm9kZSkgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KVxyXG4gICAgfVxyXG5cclxuICAgIDsod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yLm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZXJyb3InKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0pTT05QIHJlcXVlc3QgZmFpbGVkJykpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdKSB7XHJcbiAgICAgICAgY2xlYW51cCgpXHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUmVxdWVzdCB0aW1lb3V0JykpXHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwKVxyXG5cclxuICAgIDsod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKGRhdGEuZXJyb3IubWVzc2FnZSB8fCAnUmVxdWVzdCBlcnJvcicpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxyXG4gIH0pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBXcmFwcGVyIGFyb3VuZCBBcmNHSVMgTFJTIFJFU1QgQVBJIChMUlNlcnZlciBleHRlbnNpb24pLlxyXG4gKiBVc2VzIEpTT05QIGZvciBhbGwgcmVxdWVzdHMgdG8gYXZvaWQgQ09SUyBpc3N1ZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTHJzU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBiYXNlVXJsOiBzdHJpbmdcclxuICBwcml2YXRlIHRva2VuOiBzdHJpbmcgfCBudWxsXHJcblxyXG4gIGNvbnN0cnVjdG9yIChiYXNlVXJsOiBzdHJpbmcsIHRva2VuPzogc3RyaW5nKSB7XHJcbiAgICAvLyBFbnN1cmUgbm8gdHJhaWxpbmcgc2xhc2hcclxuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJylcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlbiB8fCBudWxsXHJcbiAgfVxyXG5cclxuICBzZXRUb2tlbiAodG9rZW46IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy50b2tlbiA9IHRva2VuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBMUlMgc2VydmljZSBtZXRhZGF0YSAobmV0d29yayBsYXllcnMsIGV2ZW50IGxheWVycywgZXRjLilcclxuICAgKi9cclxuICBhc3luYyBnZXRTZXJ2aWNlSW5mbyAoKTogUHJvbWlzZTxMcnNTZXJ2aWNlSW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxMcnNTZXJ2aWNlSW5mbz4oJycpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBkZXRhaWxlZCBpbmZvIGZvciBhIG5ldHdvcmsgbGF5ZXIgKGZpZWxkcywgbWVhc3VyZSBwcmVjaXNpb24sIGV0Yy4pXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0TmV0d29ya0xheWVySW5mbyAobGF5ZXJJZDogbnVtYmVyKTogUHJvbWlzZTxOZXR3b3JrTGF5ZXJJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PE5ldHdvcmtMYXllckluZm8+KGAvbmV0d29ya0xheWVycy8ke2xheWVySWR9YClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGRldGFpbGVkIGluZm8gZm9yIGFuIGV2ZW50IGxheWVyXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0RXZlbnRMYXllckluZm8gKGxheWVySWQ6IG51bWJlcik6IFByb21pc2U8RXZlbnRMYXllckluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8RXZlbnRMYXllckluZm8+KGAvZXZlbnRMYXllcnMvJHtsYXllcklkfWApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHJvdXRlIElEICsgbWVhc3VyZXMgdG8gbWFwIGdlb21ldHJ5XHJcbiAgICovXHJcbiAgYXN5bmMgbWVhc3VyZVRvR2VvbWV0cnkgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIGxvY2F0aW9uczogTWVhc3VyZVRvR2VvbWV0cnlMb2NhdGlvbltdLFxyXG4gICAgb3V0U1I/OiBhbnlcclxuICApOiBQcm9taXNlPE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0PiB7XHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkobG9jYXRpb25zKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAob3V0U1IpIHtcclxuICAgICAgcGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkob3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L21lYXN1cmVUb0dlb21ldHJ5YCxcclxuICAgICAgcGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IG1hcCBnZW9tZXRyeSAocG9pbnQpIHRvIHJvdXRlICsgbWVhc3VyZVxyXG4gICAqL1xyXG4gIGFzeW5jIGdlb21ldHJ5VG9NZWFzdXJlIChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBsb2NhdGlvbnM6IEFycmF5PHsgZ2VvbWV0cnk6IGFueSB9PixcclxuICAgIG91dFNSPzogYW55XHJcbiAgKTogUHJvbWlzZTxHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdD4ge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucyksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKG91dFNSKSB7XHJcbiAgICAgIHBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KG91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9nZW9tZXRyeVRvTWVhc3VyZWAsXHJcbiAgICAgIHBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHluYW1pYyBzZWdtZW50YXRpb24gb3ZlcmxheSDigJQgcXVlcnlBdHRyaWJ1dGVTZXRcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUF0dHJpYnV0ZVNldCAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgcGFyYW1zOiBRdWVyeUF0dHJpYnV0ZVNldFBhcmFtc1xyXG4gICk6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgY29uc3QgcmVxdWVzdFBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShwYXJhbXMubG9jYXRpb25zKSxcclxuICAgICAgYXR0cmlidXRlU2V0OiBKU09OLnN0cmluZ2lmeShwYXJhbXMuYXR0cmlidXRlU2V0KSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAocGFyYW1zLm91dFNSKSB7XHJcbiAgICAgIHJlcXVlc3RQYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShwYXJhbXMub3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEZlYXR1cmVTZXRSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vcXVlcnlBdHRyaWJ1dGVTZXRgLFxyXG4gICAgICByZXF1ZXN0UGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFuZGFyZCBmZWF0dXJlIHF1ZXJ5IGFnYWluc3QgYSBtYXAgc2VydmljZSBsYXllciAoZm9yIFJvYWQgTG9nIGluZGl2aWR1YWwgZXZlbnQgcXVlcmllcylcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUZlYXR1cmVzIChcclxuICAgIG1hcFNlcnZpY2VVcmw6IHN0cmluZyxcclxuICAgIGxheWVySWQ6IG51bWJlcixcclxuICAgIHdoZXJlOiBzdHJpbmcsXHJcbiAgICBvdXRGaWVsZHM6IHN0cmluZ1tdID0gWycqJ11cclxuICApOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIC8vIFRoZSBtYXAgc2VydmljZSBVUkwgaXMgdGhlIHBhcmVudCBvZiBMUlNlcnZlciBleHRlbnNpb25cclxuICAgIC8vIGUuZy4gLi4uL01hcFNlcnZlci8wL3F1ZXJ5XHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gdGhpcy5iYXNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgd2hlcmUsXHJcbiAgICAgIG91dEZpZWxkczogb3V0RmllbGRzLmpvaW4oJywnKSxcclxuICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXJlY3QgcXVlcnkgd2l0aCBhcmJpdHJhcnkgcGFyYW1zIChmb3Igc3BhdGlhbCBxdWVyaWVzIHZpYSBKU09OUClcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUZlYXR1cmVzRGlyZWN0ICh1cmw6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcbiAgICBwYXJhbXMuZiA9IHBhcmFtcy5mIHx8ICdqc29uJ1xyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFF1ZXJ5IHJvdXRlcyBvbiBhIG5ldHdvcmsgbGF5ZXIgKGZvciByb3V0ZSBwaWNrZXIgYXV0b2NvbXBsZXRlKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5Um91dGVzIChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBzZWFyY2hUZXh0OiBzdHJpbmcsXHJcbiAgICByb3V0ZUlkRmllbGQ6IHN0cmluZyxcclxuICAgIHJvdXRlTmFtZUZpZWxkOiBzdHJpbmcgfCBudWxsLFxyXG4gICAgbWF4UmVzdWx0czogbnVtYmVyID0gMTBcclxuICApOiBQcm9taXNlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB8IG51bGwgfT4+IHtcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSB0aGlzLmJhc2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7bmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgIGNvbnN0IHNlYXJjaEZpZWxkID0gcm91dGVOYW1lRmllbGQgfHwgcm91dGVJZEZpZWxkXHJcbiAgICBjb25zdCB3aGVyZSA9IGBVUFBFUigke3NlYXJjaEZpZWxkfSkgTElLRSBVUFBFUignJHtzZWFyY2hUZXh0LnJlcGxhY2UoLycvZywgXCInJ1wiKX0lJylgXHJcbiAgICBjb25zdCBvdXRGaWVsZHMgPSByb3V0ZU5hbWVGaWVsZFxyXG4gICAgICA/IFtyb3V0ZUlkRmllbGQsIHJvdXRlTmFtZUZpZWxkXVxyXG4gICAgICA6IFtyb3V0ZUlkRmllbGRdXHJcblxyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICB3aGVyZSxcclxuICAgICAgb3V0RmllbGRzOiBvdXRGaWVsZHMuam9pbignLCcpLFxyXG4gICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6IG1heFJlc3VsdHMudG9TdHJpbmcoKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QganNvbiA9IGF3YWl0IGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuXHJcbiAgICBjb25zdCBhbGwgPSAoanNvbi5mZWF0dXJlcyB8fCBbXSkubWFwKChmOiBhbnkpID0+ICh7XHJcbiAgICAgIHJvdXRlSWQ6IGYuYXR0cmlidXRlc1tyb3V0ZUlkRmllbGRdLFxyXG4gICAgICByb3V0ZU5hbWU6IHJvdXRlTmFtZUZpZWxkID8gZi5hdHRyaWJ1dGVzW3JvdXRlTmFtZUZpZWxkXSA6IG51bGxcclxuICAgIH0pKVxyXG4gICAgLy8gRGVkdXBsaWNhdGUgYnkgcm91dGVJZFxyXG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXHJcbiAgICByZXR1cm4gYWxsLmZpbHRlcigocjogYW55KSA9PiB7XHJcbiAgICAgIGlmIChzZWVuLmhhcyhyLnJvdXRlSWQpKSByZXR1cm4gZmFsc2VcclxuICAgICAgc2Vlbi5hZGQoci5yb3V0ZUlkKVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vIC0tLSBQcml2YXRlIGhlbHBlcnMgLS0tXHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVxdWVzdDxUPiAocGF0aDogc3RyaW5nLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxUPiB7XHJcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmJhc2VVcmx9JHtwYXRofWBcclxuICAgIGNvbnN0IGFsbFBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgZjogJ2pzb24nLFxyXG4gICAgICAuLi5wYXJhbXNcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIGFsbFBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgYWxsUGFyYW1zKSBhcyBQcm9taXNlPFQ+XHJcbiAgfVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X2NvcmVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV91aV9hZHZhbmNlZF9zZXR0aW5nX2NvbXBvbmVudHNfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBleGlzdHMgKGRldmVsb3BtZW50IG9ubHkpXG5cdGlmIChfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsIi8qKiBAanN4UnVudGltZSBjbGFzc2ljICovXHJcbmltcG9ydCB7IFJlYWN0IH0gZnJvbSAnamltdS1jb3JlJ1xyXG5pbXBvcnQgdHlwZSB7IEFsbFdpZGdldFNldHRpbmdQcm9wcyB9IGZyb20gJ2ppbXUtZm9yLWJ1aWxkZXInXHJcbmltcG9ydCB7IE1hcFdpZGdldFNlbGVjdG9yIH0gZnJvbSAnamltdS11aS9hZHZhbmNlZC9zZXR0aW5nLWNvbXBvbmVudHMnXHJcbmltcG9ydCB0eXBlIHsgSU1Db25maWcsIEV2ZW50TGF5ZXJDb25maWcgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IExyc1NlcnZpY2UgfSBmcm9tICcuLi9scnMtdXRpbHMvbHJzLXNlcnZpY2UnXHJcbmltcG9ydCB7IEtOT1dOX0RPTUFJTlMgfSBmcm9tICcuLi9scnMtdXRpbHMvdXRpbHMva25vd24tZG9tYWlucydcclxuXHJcbmNvbnN0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QgfSA9IFJlYWN0XHJcblxyXG5pbnRlcmZhY2UgRGlzY292ZXJlZExheWVyIHtcclxuICBpZDogbnVtYmVyXHJcbiAgbmFtZTogc3RyaW5nXHJcbiAgdHlwZTogc3RyaW5nXHJcbiAgZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgYWxpYXM6IHN0cmluZzsgdHlwZTogc3RyaW5nIH0+XHJcbiAgcm91dGVJZEZpZWxkTmFtZTogc3RyaW5nXHJcbiAgZnJvbU1lYXN1cmVGaWVsZE5hbWU6IHN0cmluZ1xyXG4gIHRvTWVhc3VyZUZpZWxkTmFtZTogc3RyaW5nIHwgbnVsbFxyXG59XHJcblxyXG5jb25zdCBTZXR0aW5nID0gKHByb3BzOiBBbGxXaWRnZXRTZXR0aW5nUHJvcHM8SU1Db25maWc+KSA9PiB7XHJcbiAgY29uc3QgY29uZmlnID0gcHJvcHMuY29uZmlnXHJcblxyXG4gIGNvbnN0IFtuZXR3b3JrTGF5ZXJzLCBzZXROZXR3b3JrTGF5ZXJzXSA9IHVzZVN0YXRlPEFycmF5PHsgaWQ6IG51bWJlcjsgbmFtZTogc3RyaW5nIH0+PihbXSlcclxuICBjb25zdCBbZGlzY292ZXJlZExheWVycywgc2V0RGlzY292ZXJlZExheWVyc10gPSB1c2VTdGF0ZTxEaXNjb3ZlcmVkTGF5ZXJbXT4oW10pXHJcbiAgY29uc3QgW2xvYWRpbmdTZXJ2aWNlLCBzZXRMb2FkaW5nU2VydmljZV0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbc2VydmljZUVycm9yLCBzZXRTZXJ2aWNlRXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuXHJcbiAgY29uc3QgU1lTVEVNX0ZJRUxEUyA9IFtcclxuICAgICdPQkpFQ1RJRCcsICdTaGFwZScsICdzaGFwZScsICdyb3V0ZWlkJywgJ3JpZCcsICdmcm9tbWVhc3VyZScsICd0b21lYXN1cmUnLFxyXG4gICAgJ21lYXMnLCAnZnJvbWRhdGUnLCAndG9kYXRlJywgJ2V2ZW50aWQnLCAnTG9jRXJyb3InLCAnbG9jZXJyb3InLFxyXG4gICAgJ1NoYXBlX0xlbmd0aCcsICdzaGFwZS5TVExlbmd0aCgpJywgJ3JlY29yZGRhdGUnXHJcbiAgXVxyXG5cclxuICBjb25zdCB1cGRhdGVDb25maWcgPSB1c2VDYWxsYmFjaygoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHtcclxuICAgIHByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgIGlkOiBwcm9wcy5pZCxcclxuICAgICAgY29uZmlnOiBwcm9wcy5jb25maWcuc2V0KGtleSwgdmFsdWUpXHJcbiAgICB9KVxyXG4gIH0sIFtwcm9wc10pXHJcblxyXG4gIGNvbnN0IGxvYWRTZXJ2aWNlSW5mbyA9IHVzZUNhbGxiYWNrKGFzeW5jICh1cmw6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCF1cmwudHJpbSgpKSByZXR1cm5cclxuICAgIHNldExvYWRpbmdTZXJ2aWNlKHRydWUpXHJcbiAgICBzZXRTZXJ2aWNlRXJyb3IobnVsbClcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBscnMgPSBuZXcgTHJzU2VydmljZSh1cmwudHJpbSgpKVxyXG4gICAgICBjb25zdCBpbmZvID0gYXdhaXQgbHJzLmdldFNlcnZpY2VJbmZvKClcclxuXHJcbiAgICAgIGNvbnN0IG5ldHMgPSAoaW5mby5uZXR3b3JrTGF5ZXJzIHx8IFtdKS5tYXAobiA9PiAoeyBpZDogbi5pZCwgbmFtZTogbi5uYW1lIH0pKVxyXG4gICAgICBzZXROZXR3b3JrTGF5ZXJzKG5ldHMpXHJcblxyXG4gICAgICBpZiAobmV0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWROZXRJZCA9IChwcm9wcy5jb25maWcgYXMgYW55KT8ubmV0d29ya0xheWVySWQgPz8gbmV0c1swXS5pZFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBuZXREZXRhaWwgPSBhd2FpdCBscnMuZ2V0TmV0d29ya0xheWVySW5mbyhzZWxlY3RlZE5ldElkKVxyXG4gICAgICAgICAgY29uc3QgbmV0Um91dGVGaWVsZCA9IChuZXREZXRhaWwgYXMgYW55KS5yb3V0ZUlkRmllbGROYW1lIHx8ICdyb3V0ZWlkJ1xyXG4gICAgICAgICAgY29uc3QgbmV0Um91dGVOYW1lRmllbGQgPSAobmV0RGV0YWlsIGFzIGFueSkucm91dGVOYW1lRmllbGROYW1lIHx8IG51bGxcclxuICAgICAgICAgIHVwZGF0ZUNvbmZpZygnbmV0d29ya1JvdXRlSWRGaWVsZCcsIG5ldFJvdXRlRmllbGQpXHJcbiAgICAgICAgICBpZiAobmV0Um91dGVOYW1lRmllbGQpIHVwZGF0ZUNvbmZpZygnbmV0d29ya1JvdXRlTmFtZUZpZWxkJywgbmV0Um91dGVOYW1lRmllbGQpXHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGZhbGxiYWNrICovIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbGF5ZXJzOiBEaXNjb3ZlcmVkTGF5ZXJbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgKGluZm8uZXZlbnRMYXllcnMgfHwgW10pKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IGRldGFpbCA9IGF3YWl0IGxycy5nZXRFdmVudExheWVySW5mbyhlbC5pZClcclxuICAgICAgICAgIGNvbnN0IHVzZXJGaWVsZHMgPSAoZGV0YWlsLmZpZWxkcyB8fCBbXSkuZmlsdGVyKFxyXG4gICAgICAgICAgICBmID0+ICFTWVNURU1fRklFTERTLmluY2x1ZGVzKGYubmFtZSkgJiYgZi50eXBlICE9PSAnZXNyaUZpZWxkVHlwZU9JRCcgJiYgZi50eXBlICE9PSAnZXNyaUZpZWxkVHlwZUdlb21ldHJ5J1xyXG4gICAgICAgICAgKVxyXG5cclxuICAgICAgICAgIGxldCBmaWVsZHNXaXRoRGF0YTogU2V0PHN0cmluZz4gfCBudWxsID0gbnVsbFxyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgYmFzZU1hcFVybCA9IChwcm9wcy5jb25maWc/Lmxyc1NlcnZpY2VVcmwgfHwgJycpLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICAgICAgICAgIGNvbnN0IHNhbXBsZVVybCA9IGAke2Jhc2VNYXBVcmx9LyR7ZWwuaWR9L3F1ZXJ5YFxyXG4gICAgICAgICAgICBjb25zdCBzYW1wbGUgPSBhd2FpdCBscnMucXVlcnlGZWF0dXJlc0RpcmVjdChzYW1wbGVVcmwsIHsgd2hlcmU6ICcxPTEnLCBvdXRGaWVsZHM6ICcqJywgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsIHJlc3VsdFJlY29yZENvdW50OiAnNTAnLCBmOiAnanNvbicgfSlcclxuICAgICAgICAgICAgaWYgKHNhbXBsZT8uZmVhdHVyZXM/Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICBmaWVsZHNXaXRoRGF0YSA9IG5ldyBTZXQ8c3RyaW5nPigpXHJcbiAgICAgICAgICAgICAgZm9yIChjb25zdCBmZWF0IG9mIHNhbXBsZS5mZWF0dXJlcykge1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWxdIG9mIE9iamVjdC5lbnRyaWVzKGZlYXQuYXR0cmlidXRlcyB8fCB7fSkpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKHZhbCAhPT0gbnVsbCAmJiB2YWwgIT09IHVuZGVmaW5lZCAmJiB2YWwgIT09ICcnKSBmaWVsZHNXaXRoRGF0YS5hZGQoa2V5KVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcblxyXG4gICAgICAgICAgY29uc3QgZmlsdGVyZWRGaWVsZHMgPSBmaWVsZHNXaXRoRGF0YSA/IHVzZXJGaWVsZHMuZmlsdGVyKGYgPT4gZmllbGRzV2l0aERhdGEhLmhhcyhmLm5hbWUpKSA6IHVzZXJGaWVsZHNcclxuICAgICAgICAgIGxheWVycy5wdXNoKHtcclxuICAgICAgICAgICAgaWQ6IGVsLmlkLCBuYW1lOiBlbC5uYW1lLCB0eXBlOiBlbC50eXBlLFxyXG4gICAgICAgICAgICBmaWVsZHM6IGZpbHRlcmVkRmllbGRzLm1hcChmID0+ICh7IG5hbWU6IGYubmFtZSwgYWxpYXM6IGYuYWxpYXMgfHwgZi5uYW1lLCB0eXBlOiBmLnR5cGUgfSkpLFxyXG4gICAgICAgICAgICByb3V0ZUlkRmllbGROYW1lOiAoZGV0YWlsIGFzIGFueSkucm91dGVJZEZpZWxkTmFtZSB8fCAncm91dGVpZCcsXHJcbiAgICAgICAgICAgIGZyb21NZWFzdXJlRmllbGROYW1lOiAoZGV0YWlsIGFzIGFueSkuZnJvbU1lYXN1cmVGaWVsZE5hbWUgfHwgJ2Zyb21tZWFzdXJlJyxcclxuICAgICAgICAgICAgdG9NZWFzdXJlRmllbGROYW1lOiAoZGV0YWlsIGFzIGFueSkudG9NZWFzdXJlRmllbGROYW1lIHx8IG51bGxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICBsYXllcnMucHVzaCh7IGlkOiBlbC5pZCwgbmFtZTogZWwubmFtZSwgdHlwZTogZWwudHlwZSwgZmllbGRzOiBbXSwgcm91dGVJZEZpZWxkTmFtZTogJ3JvdXRlaWQnLCBmcm9tTWVhc3VyZUZpZWxkTmFtZTogJ2Zyb21tZWFzdXJlJywgdG9NZWFzdXJlRmllbGROYW1lOiBudWxsIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNldERpc2NvdmVyZWRMYXllcnMobGF5ZXJzKVxyXG5cclxuICAgICAgLy8gQXV0by1lbmFibGUgbGF5ZXJzIHJlbGV2YW50IHRvIGNyYXNoIHByZWRpY3Rpb25cclxuICAgICAgY29uc3QgZXhpc3RpbmcgPSBwcm9wcy5jb25maWc/LmV2ZW50TGF5ZXJDb25maWdzIGFzIGFueSBhcyBFdmVudExheWVyQ29uZmlnW10gfHwgW11cclxuICAgICAgaWYgKGV4aXN0aW5nLmxlbmd0aCA9PT0gMCAmJiBsYXllcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIC8vIEVuYWJsZSBFVkVSWSBkaXNjb3ZlcmVkIGV2ZW50IGxheWVyIHRoYXQgaGFzIGF0IGxlYXN0IG9uZSBkYXRhLWJlYXJpbmcgZmllbGQsXHJcbiAgICAgICAgLy8gd2l0aCBBTEwgb2YgaXRzIGZpZWxkcyBzZWxlY3RlZC4gVGhpcyBtYXhpbWl6ZXMgZmFjdG9yIGNvdmVyYWdlIGZvciBBSS9NTC9MTE0uXHJcbiAgICAgICAgLy8gKFN5c3RlbS1vbmx5IGxheWVycyBsaWtlIENhbGlicmF0aW9uIFBvaW50IHdpbGwgaGF2ZSAwIGZpZWxkcyBhbmQgYXJlIHNraXBwZWQuKVxyXG4gICAgICAgIGNvbnN0IGF1dG9Db25maWdzOiBFdmVudExheWVyQ29uZmlnW10gPSBbXVxyXG4gICAgICAgIGZvciAoY29uc3QgbGF5ZXIgb2YgbGF5ZXJzKSB7XHJcbiAgICAgICAgICBpZiAoIWxheWVyLmZpZWxkcyB8fCBsYXllci5maWVsZHMubGVuZ3RoID09PSAwKSBjb250aW51ZVxyXG4gICAgICAgICAgYXV0b0NvbmZpZ3MucHVzaCh7XHJcbiAgICAgICAgICAgIGxheWVySWQ6IGxheWVyLmlkLFxyXG4gICAgICAgICAgICBuYW1lOiBsYXllci5uYW1lLFxyXG4gICAgICAgICAgICB0eXBlOiBsYXllci50eXBlIGFzIGFueSxcclxuICAgICAgICAgICAgYXR0cmlidXRlczogbGF5ZXIuZmllbGRzLm1hcChmID0+IGYubmFtZSksXHJcbiAgICAgICAgICAgIHJvdXRlSWRGaWVsZDogbGF5ZXIucm91dGVJZEZpZWxkTmFtZSxcclxuICAgICAgICAgICAgLi4uKGxheWVyLnR5cGUuaW5jbHVkZXMoJ1BvaW50JylcclxuICAgICAgICAgICAgICA/IHsgbWVhc3VyZUZpZWxkOiBsYXllci5mcm9tTWVhc3VyZUZpZWxkTmFtZSB9XHJcbiAgICAgICAgICAgICAgOiB7IGZyb21NZWFzdXJlRmllbGQ6IGxheWVyLmZyb21NZWFzdXJlRmllbGROYW1lLCB0b01lYXN1cmVGaWVsZDogbGF5ZXIudG9NZWFzdXJlRmllbGROYW1lIHx8IHVuZGVmaW5lZCB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGF1dG9Db25maWdzLmxlbmd0aCA+IDApIHVwZGF0ZUNvbmZpZygnZXZlbnRMYXllckNvbmZpZ3MnLCBhdXRvQ29uZmlncylcclxuICAgICAgfSBlbHNlIGlmIChleGlzdGluZy5sZW5ndGggPiAwICYmIGxheWVycy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgLy8gVG9wIHVwOiBlbnN1cmUgZXZlcnkgYWxyZWFkeS1lbmFibGVkIGxheWVyIGhhcyBBTEwgb2YgaXRzIGF2YWlsYWJsZSBkYXRhLWJlYXJpbmcgYXR0cmlidXRlc1xyXG4gICAgICAgIC8vIHNlbGVjdGVkLiBUaGlzIGNhdGNoZXMgY2FzZXMgd2hlcmUgdGhlIHNhdmVkIGNvbmZpZyBoYXMgb25seSBzb21lIGF0dHJpYnV0ZXMgdGlja2VkLlxyXG4gICAgICAgIGxldCBjaGFuZ2VkID0gZmFsc2VcclxuICAgICAgICBjb25zdCBtZXJnZWQ6IEV2ZW50TGF5ZXJDb25maWdbXSA9IGV4aXN0aW5nLm1hcChjZmcgPT4ge1xyXG4gICAgICAgICAgY29uc3QgbGF5ZXIgPSBsYXllcnMuZmluZChsID0+IGwuaWQgPT09IGNmZy5sYXllcklkKVxyXG4gICAgICAgICAgaWYgKCFsYXllcikgcmV0dXJuIGNmZ1xyXG4gICAgICAgICAgY29uc3QgYWxsRmllbGROYW1lcyA9IGxheWVyLmZpZWxkcy5tYXAoZiA9PiBmLm5hbWUpXHJcbiAgICAgICAgICBjb25zdCBjdXJyZW50QXR0cnMgPSBjZmcuYXR0cmlidXRlcyB8fCBbXVxyXG4gICAgICAgICAgY29uc3QgbWlzc2luZyA9IGFsbEZpZWxkTmFtZXMuZmlsdGVyKG4gPT4gIWN1cnJlbnRBdHRycy5pbmNsdWRlcyhuKSlcclxuICAgICAgICAgIGlmIChtaXNzaW5nLmxlbmd0aCA9PT0gMCkgcmV0dXJuIGNmZ1xyXG4gICAgICAgICAgY2hhbmdlZCA9IHRydWVcclxuICAgICAgICAgIHJldHVybiB7IC4uLmNmZywgYXR0cmlidXRlczogWy4uLmN1cnJlbnRBdHRycywgLi4ubWlzc2luZ10gfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgaWYgKGNoYW5nZWQpIHVwZGF0ZUNvbmZpZygnZXZlbnRMYXllckNvbmZpZ3MnLCBtZXJnZWQpXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgIHNldFNlcnZpY2VFcnJvcihlcnIubWVzc2FnZSB8fCAnRmFpbGVkIHRvIGxvYWQgc2VydmljZSBpbmZvJylcclxuICAgICAgc2V0TmV0d29ya0xheWVycyhbXSlcclxuICAgICAgc2V0RGlzY292ZXJlZExheWVycyhbXSlcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldExvYWRpbmdTZXJ2aWNlKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpZz8ubHJzU2VydmljZVVybCAmJiBkaXNjb3ZlcmVkTGF5ZXJzLmxlbmd0aCA9PT0gMCkgbG9hZFNlcnZpY2VJbmZvKGNvbmZpZy5scnNTZXJ2aWNlVXJsKVxyXG4gIH0sIFtdKVxyXG5cclxuICBjb25zdCBoYW5kbGVVcmxDaGFuZ2UgPSB1c2VDYWxsYmFjaygoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHsgdXBkYXRlQ29uZmlnKCdscnNTZXJ2aWNlVXJsJywgZS50YXJnZXQudmFsdWUpIH0sIFt1cGRhdGVDb25maWddKVxyXG4gIGNvbnN0IGhhbmRsZVVybEJsdXIgPSB1c2VDYWxsYmFjaygoKSA9PiB7IGlmIChjb25maWc/Lmxyc1NlcnZpY2VVcmwpIGxvYWRTZXJ2aWNlSW5mbyhjb25maWcubHJzU2VydmljZVVybCkgfSwgW2NvbmZpZz8ubHJzU2VydmljZVVybCwgbG9hZFNlcnZpY2VJbmZvXSlcclxuICBjb25zdCBoYW5kbGVOZXR3b3JrQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxTZWxlY3RFbGVtZW50PikgPT4geyB1cGRhdGVDb25maWcoJ25ldHdvcmtMYXllcklkJywgcGFyc2VJbnQoZS50YXJnZXQudmFsdWUsIDEwKSkgfSwgW3VwZGF0ZUNvbmZpZ10pXHJcblxyXG4gIGNvbnN0IHRvZ2dsZUV2ZW50TGF5ZXIgPSB1c2VDYWxsYmFjaygobGF5ZXI6IERpc2NvdmVyZWRMYXllcikgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudDogRXZlbnRMYXllckNvbmZpZ1tdID0gY29uZmlnPy5ldmVudExheWVyQ29uZmlncyA/IFsuLi5jb25maWcuZXZlbnRMYXllckNvbmZpZ3MgYXMgYW55XSA6IFtdXHJcbiAgICBjb25zdCBpZHggPSBjdXJyZW50LmZpbmRJbmRleChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXIuaWQpXHJcbiAgICBpZiAoaWR4ID49IDApIHsgY3VycmVudC5zcGxpY2UoaWR4LCAxKSB9IGVsc2Uge1xyXG4gICAgICBjdXJyZW50LnB1c2goe1xyXG4gICAgICAgIGxheWVySWQ6IGxheWVyLmlkLCBuYW1lOiBsYXllci5uYW1lLCB0eXBlOiBsYXllci50eXBlIGFzIGFueSxcclxuICAgICAgICBhdHRyaWJ1dGVzOiBsYXllci5maWVsZHMubWFwKGYgPT4gZi5uYW1lKSxcclxuICAgICAgICByb3V0ZUlkRmllbGQ6IGxheWVyLnJvdXRlSWRGaWVsZE5hbWUsXHJcbiAgICAgICAgLi4uKGxheWVyLnR5cGUuaW5jbHVkZXMoJ1BvaW50JykgPyB7IG1lYXN1cmVGaWVsZDogbGF5ZXIuZnJvbU1lYXN1cmVGaWVsZE5hbWUgfSA6IHsgZnJvbU1lYXN1cmVGaWVsZDogbGF5ZXIuZnJvbU1lYXN1cmVGaWVsZE5hbWUsIHRvTWVhc3VyZUZpZWxkOiBsYXllci50b01lYXN1cmVGaWVsZE5hbWUgfHwgdW5kZWZpbmVkIH0pXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcbiAgICB1cGRhdGVDb25maWcoJ2V2ZW50TGF5ZXJDb25maWdzJywgY3VycmVudClcclxuICB9LCBbY29uZmlnPy5ldmVudExheWVyQ29uZmlncywgdXBkYXRlQ29uZmlnXSlcclxuXHJcbiAgY29uc3QgdG9nZ2xlQXR0cmlidXRlID0gdXNlQ2FsbGJhY2soKGxheWVySWQ6IG51bWJlciwgZmllbGROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIGNvbnN0IGN1cnJlbnQ6IEV2ZW50TGF5ZXJDb25maWdbXSA9IGNvbmZpZz8uZXZlbnRMYXllckNvbmZpZ3MgPyBbLi4uY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIGFzIGFueV0gOiBbXVxyXG4gICAgY29uc3QgaWR4ID0gY3VycmVudC5maW5kSW5kZXgoZSA9PiBlLmxheWVySWQgPT09IGxheWVySWQpXHJcbiAgICBpZiAoaWR4IDwgMCkgcmV0dXJuXHJcbiAgICBjb25zdCBhdHRycyA9IFsuLi5jdXJyZW50W2lkeF0uYXR0cmlidXRlc11cclxuICAgIGNvbnN0IGF0dHJJZHggPSBhdHRycy5pbmRleE9mKGZpZWxkTmFtZSlcclxuICAgIGlmIChhdHRySWR4ID49IDApIGF0dHJzLnNwbGljZShhdHRySWR4LCAxKTsgZWxzZSBhdHRycy5wdXNoKGZpZWxkTmFtZSlcclxuICAgIGN1cnJlbnRbaWR4XSA9IHsgLi4uY3VycmVudFtpZHhdLCBhdHRyaWJ1dGVzOiBhdHRycyB9XHJcbiAgICB1cGRhdGVDb25maWcoJ2V2ZW50TGF5ZXJDb25maWdzJywgY3VycmVudClcclxuICB9LCBbY29uZmlnPy5ldmVudExheWVyQ29uZmlncywgdXBkYXRlQ29uZmlnXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlTWFwV2lkZ2V0Q2hhbmdlID0gdXNlQ2FsbGJhY2soKHVzZU1hcFdpZGdldElkczogc3RyaW5nW10pID0+IHtcclxuICAgIHByb3BzLm9uU2V0dGluZ0NoYW5nZSh7IGlkOiBwcm9wcy5pZCwgdXNlTWFwV2lkZ2V0SWRzIH0pXHJcbiAgfSwgW3Byb3BzXSlcclxuXHJcbiAgY29uc3QgZ2V0TGF5ZXJDb25maWcgPSAobGF5ZXJJZDogbnVtYmVyKTogRXZlbnRMYXllckNvbmZpZyB8IHVuZGVmaW5lZCA9PiB7XHJcbiAgICByZXR1cm4gKGNvbmZpZz8uZXZlbnRMYXllckNvbmZpZ3MgYXMgYW55IGFzIEV2ZW50TGF5ZXJDb25maWdbXSB8fCBbXSkuZmluZChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXJJZClcclxuICB9XHJcblxyXG4gIGNvbnN0IFtmaWVsZFNlYXJjaCwgc2V0RmllbGRTZWFyY2hdID0gdXNlU3RhdGU8UmVjb3JkPG51bWJlciwgc3RyaW5nPj4oe30pXHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInAtM1wiIHN0eWxlPXt7IGZvbnRTaXplOiAnMTNweCcsIGNvbG9yOiAnI2ZmZicgfX0+XHJcbiAgICAgIDxoNSBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzEycHgnLCBjb2xvcjogJyNmZmYnIH19PkNyYXNoIFJpc2sgUHJlZGljdGlvbiBTZXR0aW5nczwvaDU+XHJcblxyXG4gICAgICB7LyogTWFwIFdpZGdldCAqL31cclxuICAgICAgPGRpdiBzdHlsZT17ZmllbGRHcm91cFN0eWxlfT5cclxuICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9Pk1hcCBXaWRnZXQ8L2xhYmVsPlxyXG4gICAgICAgIDxwIHN0eWxlPXtkZXNjU3R5bGV9PlNlbGVjdCB0aGUgbWFwIHdpZGdldCBmb3Igcm91dGUgcGlja2luZyBhbmQgcHJlZGljdGlvbiBkaXNwbGF5LjwvcD5cclxuICAgICAgICA8TWFwV2lkZ2V0U2VsZWN0b3Igb25TZWxlY3Q9e2hhbmRsZU1hcFdpZGdldENoYW5nZX0gdXNlTWFwV2lkZ2V0SWRzPXtwcm9wcy51c2VNYXBXaWRnZXRJZHN9IC8+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgey8qIExSUyBTZXJ2aWNlIFVSTCAqL31cclxuICAgICAgPGRpdiBzdHlsZT17ZmllbGRHcm91cFN0eWxlfT5cclxuICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9PkxSUyBTZXJ2aWNlIFVSTDwvbGFiZWw+XHJcbiAgICAgICAgPHAgc3R5bGU9e2Rlc2NTdHlsZX0+UkVTVCBlbmRwb2ludCBmb3IgdGhlIExpbmVhciBSZWZlcmVuY2luZyBTeXN0ZW0gc2VydmljZS48L3A+XHJcbiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e2NvbmZpZz8ubHJzU2VydmljZVVybCB8fCAnJ30gb25DaGFuZ2U9e2hhbmRsZVVybENoYW5nZX0gb25CbHVyPXtoYW5kbGVVcmxCbHVyfSBzdHlsZT17aW5wdXRTdHlsZX0gcGxhY2Vob2xkZXI9XCJodHRwczovLy4uLi9NYXBTZXJ2ZXIvZXh0cy9MUlNlcnZlclwiIC8+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17aGFuZGxlVXJsQmx1cn0gc3R5bGU9e2xvYWRCdG5TdHlsZX0+e2xvYWRpbmdTZXJ2aWNlID8gJ0xvYWRpbmcuLi4nIDogJ0xvYWQgU2VydmljZSd9PC9idXR0b24+XHJcbiAgICAgICAge3NlcnZpY2VFcnJvciAmJiA8ZGl2IHN0eWxlPXtlcnJvclN0eWxlfT57c2VydmljZUVycm9yfTwvZGl2Pn1cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7LyogTmV0d29yayBMYXllciAqL31cclxuICAgICAge25ldHdvcmtMYXllcnMubGVuZ3RoID4gMSAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17ZmllbGRHcm91cFN0eWxlfT5cclxuICAgICAgICAgIDxsYWJlbCBzdHlsZT17bGFiZWxTdHlsZX0+TmV0d29yayBMYXllcjwvbGFiZWw+XHJcbiAgICAgICAgICA8c2VsZWN0IHZhbHVlPXtjb25maWc/Lm5ldHdvcmtMYXllcklkID8/ICcnfSBvbkNoYW5nZT17aGFuZGxlTmV0d29ya0NoYW5nZX0gc3R5bGU9e2lucHV0U3R5bGV9PlxyXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+LS0gU2VsZWN0IE5ldHdvcmsgLS08L29wdGlvbj5cclxuICAgICAgICAgICAge25ldHdvcmtMYXllcnMubWFwKG4gPT4gPG9wdGlvbiBrZXk9e24uaWR9IHZhbHVlPXtuLmlkfT57bi5uYW1lfTwvb3B0aW9uPil9XHJcbiAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiBFdmVudCBMYXllcnMgKi99XHJcbiAgICAgIHtkaXNjb3ZlcmVkTGF5ZXJzLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9PkV2ZW50IExheWVycyAmYW1wOyBBdHRyaWJ1dGVzPC9sYWJlbD5cclxuICAgICAgICAgIDxwIHN0eWxlPXtkZXNjU3R5bGV9PlNlbGVjdCBsYXllcnMgYW5kIGF0dHJpYnV0ZXMgdG8gdXNlIGZvciBjcmFzaCByaXNrIHByZWRpY3Rpb24uIE1vcmUgbGF5ZXJzID0gbW9yZSBwcmVkaWN0aW9uIGZhY3RvcnMuPC9wPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17ZXZlbnRMaXN0U3R5bGV9PlxyXG4gICAgICAgICAgICB7ZGlzY292ZXJlZExheWVycy5tYXAobGF5ZXIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGxheWVyQ2ZnID0gZ2V0TGF5ZXJDb25maWcobGF5ZXIuaWQpXHJcbiAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9ICEhbGF5ZXJDZmdcclxuICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e2xheWVyLmlkfSBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e2lzU2VsZWN0ZWR9IG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGVFdmVudExheWVyKGxheWVyKX0gLz5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBtYXJnaW5MZWZ0OiAnNHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMwMDAnIH19PntsYXllci5uYW1lfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyM1NTUnLCBtYXJnaW5MZWZ0OiAnNnB4JywgZm9udFNpemU6ICcxMHB4JyB9fT57bGF5ZXIudHlwZS5pbmNsdWRlcygnUG9pbnQnKSA/ICcoUHQpJyA6ICcoTGluZSknfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIHtpc1NlbGVjdGVkICYmIGxheWVyLmZpZWxkcy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtmaWVsZFBpY2tlclN0eWxlfT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBsYWNlaG9sZGVyPVwiU2VhcmNoIGZpZWxkcy4uLlwiIHZhbHVlPXtmaWVsZFNlYXJjaFtsYXllci5pZF0gfHwgJyd9IG9uQ2hhbmdlPXtlID0+IHNldEZpZWxkU2VhcmNoKHAgPT4gKHsgLi4ucCwgW2xheWVyLmlkXTogZS50YXJnZXQudmFsdWUgfSkpfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMnB4IDRweCcsIGZvbnRTaXplOiAnMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnM3B4JywgbWFyZ2luQm90dG9tOiAnM3B4JywgY29sb3I6ICcjMDAwJywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgICAgIHtsYXllci5maWVsZHMuZmlsdGVyKGYgPT4geyBjb25zdCBxID0gKGZpZWxkU2VhcmNoW2xheWVyLmlkXSB8fCAnJykudG9Mb3dlckNhc2UoKTsgcmV0dXJuICFxIHx8IGYubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpIHx8IChmLmFsaWFzIHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpIH0pLm1hcChmID0+IChcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17Zi5uYW1lfSBzdHlsZT17eyBkaXNwbGF5OiAnYmxvY2snLCBmb250U2l6ZTogJzExcHgnLCBwYWRkaW5nOiAnMXB4IDAnLCBjdXJzb3I6ICdwb2ludGVyJywgY29sb3I6ICcjMDAwJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgY2hlY2tlZD17bGF5ZXJDZmc/LmF0dHJpYnV0ZXM/LmluY2x1ZGVzKGYubmFtZSkgPz8gZmFsc2V9IG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGVBdHRyaWJ1dGUobGF5ZXIuaWQsIGYubmFtZSl9IHN0eWxlPXt7IG1hcmdpblJpZ2h0OiAnNHB4JyB9fSAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHtmLmFsaWFzIHx8IGYubmFtZX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB9KX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG59XHJcblxyXG5jb25zdCBmaWVsZEdyb3VwU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7IG1hcmdpbkJvdHRvbTogJzE0cHgnIH1cclxuY29uc3QgbGFiZWxTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHsgZGlzcGxheTogJ2Jsb2NrJywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBtYXJnaW5Cb3R0b206ICc0cHgnLCBjb2xvcjogJyNmZmYnIH1cclxuY29uc3QgZGVzY1N0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0geyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMC43NSknLCBtYXJnaW46ICcwIDAgNnB4IDAnLCBsaW5lSGVpZ2h0OiAnMS40JyB9XHJcbmNvbnN0IGlucHV0U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICc2cHggOHB4JywgZm9udFNpemU6ICcxMnB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM5OTknLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBib3hTaXppbmc6ICdib3JkZXItYm94JywgY29sb3I6ICcjMDAwJywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicgfVxyXG5jb25zdCBsb2FkQnRuU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7IG1hcmdpblRvcDogJzRweCcsIHBhZGRpbmc6ICc0cHggMTJweCcsIGZvbnRTaXplOiAnMTJweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjOTk5JywgYm9yZGVyUmFkaXVzOiAnM3B4JywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsIGNvbG9yOiAnIzAwMCcsIGN1cnNvcjogJ3BvaW50ZXInIH1cclxuY29uc3QgZXZlbnRMaXN0U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7IG1heEhlaWdodDogJzMwMHB4Jywgb3ZlcmZsb3c6ICdhdXRvJywgYm9yZGVyOiAnMXB4IHNvbGlkICM5OTknLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBwYWRkaW5nOiAnNnB4JywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsIGNvbG9yOiAnIzAwMCcgfVxyXG5jb25zdCBmaWVsZFBpY2tlclN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0geyBtYXJnaW5MZWZ0OiAnMjBweCcsIG1hcmdpblRvcDogJzRweCcsIHBhZGRpbmc6ICc0cHggNnB4JywgYmFja2dyb3VuZENvbG9yOiAnI2YwZjBmMCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnM3B4JywgY29sb3I6ICcjMDAwJyB9XHJcbmNvbnN0IGVycm9yU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7IG1hcmdpblRvcDogJzRweCcsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnI2Q4MzAyMCcgfVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2V0dGluZ1xyXG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9