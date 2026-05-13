System.register(["jimu-core","jimu-arcgis"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_arcgis__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_arcgis__, "__esModule", { value: true });
	return {
		setters: [
			function(module) {
				__WEBPACK_EXTERNAL_MODULE_jimu_core__["default"] = module["default"] || module;
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_core__[key] = module[key];
				});
			},
			function(module) {
				__WEBPACK_EXTERNAL_MODULE_jimu_arcgis__["default"] = module["default"] || module;
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE_jimu_arcgis__[key] = module[key];
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

/***/ "jimu-arcgis"
/*!******************************!*\
  !*** external "jimu-arcgis" ***!
  \******************************/
(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_arcgis__;

/***/ },

/***/ "jimu-core"
/*!****************************!*\
  !*** external "jimu-core" ***!
  \****************************/
(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_core__;

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
/*!*******************************************************************!*\
  !*** ./your-extensions/widgets/crash-risk/src/runtime/widget.tsx ***!
  \*******************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-arcgis */ "jimu-arcgis");
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



const { useState, useCallback, useRef, useEffect } = jimu_core__WEBPACK_IMPORTED_MODULE_0__.React;
const Widget = (props) => {
    var _a, _b, _c, _d;
    const config = props.config;
    const hasMapWidget = Boolean(props.useMapWidgetIds && (props.useMapWidgetIds.length > 0 || ((_a = props.useMapWidgetIds) === null || _a === void 0 ? void 0 : _a.size) > 0));
    // Workflow state
    const [mode, setMode] = useState('choose');
    const [showAIHelp, setShowAIHelp] = useState(false);
    const [showMLHelp, setShowMLHelp] = useState(false);
    // Route selection state
    const [routeId, setRouteId] = useState('');
    const [routeName, setRouteName] = useState('');
    const [fromMeasure, setFromMeasure] = useState('');
    const [toMeasure, setToMeasure] = useState('');
    const [routeMeasureRange, setRouteMeasureRange] = useState(null);
    const [searchMode, setSearchMode] = useState('id');
    const [routeSuggestions, setRouteSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pickingFromMap, setPickingFromMap] = useState(false);
    const [pickingMeasure, setPickingMeasure] = useState(null);
    const [drawing, setDrawing] = useState(false);
    const [mapRoutes, setMapRoutes] = useState([]);
    const [selectedMapRouteIds, setSelectedMapRouteIds] = useState(new Set());
    const [routePickCandidates, setRoutePickCandidates] = useState(null);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    // Prediction state
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [factors, setFactors] = useState(null);
    const [modelInfo, setModelInfo] = useState(null);
    const [crashStats, setCrashStats] = useState(null);
    // Refs
    const jimuMapViewRef = useRef(null);
    const lrsServiceRef = useRef(null);
    const routeGeometriesRef = useRef(new Map());
    const pickHandlerRef = useRef(null);
    const pickHoverHandlerRef = useRef(null);
    const pickTooltipRef = useRef(null);
    const pickSnapGraphicRef = useRef(null);
    const pickHoverTimeoutRef = useRef(null);
    const sketchVMRef = useRef(null);
    const graphicsLayerRef = useRef(null);
    const routeGraphicsLayerRef = useRef(null);
    const searchTimeoutRef = useRef(null);
    // Route preview + measure picking refs
    const routePreviewGraphicRef = useRef(null);
    const routePreviewLayerRef = useRef(null);
    const fromMeasureGraphicRef = useRef(null);
    const toMeasureGraphicRef = useRef(null);
    const routePreviewVertsRef = useRef(null);
    const measurePickHandlerRef = useRef(null);
    const measurePickHoverRef = useRef(null);
    const measureSnapGraphicRef = useRef(null);
    const measureTooltipRef = useRef(null);
    const showRoutePreviewRef = useRef(() => { });
    const showMeasurePointRef = useRef(() => { });
    const crashEventsLayerRef = useRef(null);
    const predictionLayerRef = useRef(null);
    // Initialize LrsService (JSONP-based, bypasses CORS)
    // Cache discovered routeIdFieldName per event layer from LRS metadata
    const eventFieldNamesRef = useRef(new Map());
    useEffect(() => {
        if (config === null || config === void 0 ? void 0 : config.lrsServiceUrl) {
            lrsServiceRef.current = new _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_2__.LrsService(config.lrsServiceUrl);
            // Discover correct field names from LRS event layer metadata
            const lrs = lrsServiceRef.current;
            const eventConfigs = config.eventLayerConfigs || [];
            for (const cfg of eventConfigs) {
                lrs.getEventLayerInfo(cfg.layerId).then((detail) => {
                    eventFieldNamesRef.current.set(cfg.layerId, {
                        routeIdField: detail.routeIdFieldName || cfg.routeIdField || 'routeid',
                        measureField: detail.measureFieldName || cfg.measureField || 'measure',
                        fromMeasureField: detail.fromMeasureFieldName || cfg.fromMeasureField || 'from_measure',
                        toMeasureField: detail.toMeasureFieldName || cfg.toMeasureField || 'to_measure'
                    });
                }).catch(() => { });
            }
        }
    }, [config === null || config === void 0 ? void 0 : config.lrsServiceUrl]);
    // Handle map view ready
    const onActiveViewChange = useCallback((jmv) => {
        jimuMapViewRef.current = jmv;
    }, []);
    // ==================== ROUTE SELECTION (same as road-log) ====================
    const handleRouteSearch = useCallback((value) => {
        if (searchMode === 'id') {
            setRouteId(value);
            setRouteName('');
        }
        else {
            setRouteName(value);
        }
        if (searchTimeoutRef.current)
            clearTimeout(searchTimeoutRef.current);
        if (value.length < 2 || !lrsServiceRef.current) {
            setRouteSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        searchTimeoutRef.current = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const routeField = config.networkRouteIdField || 'customroutefield';
                const nameField = config.networkRouteNameField || 'route_name';
                const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '');
                const url = `${baseMapUrl}/${config.networkLayerId}/query`;
                const searchField = searchMode === 'name' ? nameField : routeField;
                const params = {
                    where: `UPPER(${searchField}) LIKE UPPER('%${value.replace(/'/g, "''")}%')`,
                    outFields: `${routeField},${nameField}`,
                    returnGeometry: 'false',
                    resultRecordCount: '10',
                    f: 'json'
                };
                const data = yield lrsServiceRef.current.queryFeaturesDirect(url, params);
                const results = (data.features || []).map((f) => ({
                    routeId: f.attributes[routeField] || '',
                    routeName: f.attributes[nameField] || null
                }));
                setRouteSuggestions(results);
                setShowSuggestions(results.length > 0);
            }
            catch (_a) {
                setRouteSuggestions([]);
                setShowSuggestions(false);
            }
        }), 300);
    }, [config, searchMode]);
    const selectRoute = useCallback((route) => {
        setRouteId(route.routeId);
        setRouteName(route.routeName || '');
        setShowSuggestions(false);
        fetchRouteMeasures(route.routeId);
    }, []);
    // Fetch route geometry + measure range + show preview
    const fetchRouteMeasures = useCallback((rid) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if (!lrsServiceRef.current || !rid)
            return;
        try {
            const routeField = config.networkRouteIdField || 'customroutefield';
            const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '');
            const viewWkid = ((_c = (_b = (_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) === null || _b === void 0 ? void 0 : _b.spatialReference) === null || _c === void 0 ? void 0 : _c.wkid) || 102100;
            const url = `${baseMapUrl}/${config.networkLayerId}/query`;
            const params = {
                where: `${routeField} = '${rid.replace(/'/g, "''")}'`,
                outFields: routeField,
                returnGeometry: 'true',
                returnM: 'true',
                outSR: String(viewWkid),
                resultRecordCount: '1',
                f: 'json'
            };
            const data = yield lrsServiceRef.current.queryFeaturesDirect(url, params);
            if (!((_d = data.features) === null || _d === void 0 ? void 0 : _d.length))
                return;
            const paths = ((_e = data.features[0].geometry) === null || _e === void 0 ? void 0 : _e.paths) || [];
            const allVerts = [];
            for (const path of paths)
                allVerts.push(...path);
            const hasZ = (_f = data.features[0].geometry) === null || _f === void 0 ? void 0 : _f.hasZ;
            const mIdx = hasZ ? 3 : 2;
            allVerts.sort((a, b) => (a[mIdx] || 0) - (b[mIdx] || 0));
            if (allVerts.length > 0) {
                const minM = allVerts[0][mIdx] || 0;
                const maxM = allVerts[allVerts.length - 1][mIdx] || 0;
                setFromMeasure(minM.toFixed(3));
                setToMeasure(maxM.toFixed(3));
                setRouteMeasureRange({ min: minM, max: maxM });
                routeGeometriesRef.current.set(rid, { vertices: allVerts, mIdx });
                routePreviewVertsRef.current = { vertices: allVerts, mIdx };
                // Show route preview on map
                showRoutePreviewRef.current(rid);
            }
        }
        catch (e) {
            console.error('[CrashRisk] fetchRouteMeasures failed:', e);
        }
    }), [config]);
    // Show selected route as a dashed line on the map (like road-log)
    const showRoutePreview = useCallback((rid) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) || !lrsServiceRef.current)
            return;
        const view = jimuMapViewRef.current.view;
        // Ensure preview GraphicsLayer exists
        if (!routePreviewLayerRef.current) {
            const GraphicsLayer = yield window.SystemJS.import('esri/layers/GraphicsLayer').then((m) => m.default || m);
            const gl = new GraphicsLayer({ id: '__crashrisk_route_preview__', title: 'Route Preview' });
            view.map.add(gl, 0);
            routePreviewLayerRef.current = gl;
        }
        const previewLayer = routePreviewLayerRef.current;
        // Remove previous
        if (routePreviewGraphicRef.current) {
            previewLayer.remove(routePreviewGraphicRef.current);
            routePreviewGraphicRef.current = null;
        }
        if (fromMeasureGraphicRef.current) {
            if (Array.isArray(fromMeasureGraphicRef.current))
                fromMeasureGraphicRef.current.forEach((g) => previewLayer.remove(g));
            else
                previewLayer.remove(fromMeasureGraphicRef.current);
            fromMeasureGraphicRef.current = null;
        }
        if (toMeasureGraphicRef.current) {
            if (Array.isArray(toMeasureGraphicRef.current))
                toMeasureGraphicRef.current.forEach((g) => previewLayer.remove(g));
            else
                previewLayer.remove(toMeasureGraphicRef.current);
            toMeasureGraphicRef.current = null;
        }
        if (!rid)
            return;
        // Fetch geometry (don't require cache — needed for disambiguation hover)
        const routeField = config.networkRouteIdField || 'customroutefield';
        const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '');
        const viewWkid = ((_b = view.spatialReference) === null || _b === void 0 ? void 0 : _b.wkid) || 102100;
        const url = `${baseMapUrl}/${config.networkLayerId}/query`;
        try {
            const json = yield lrsServiceRef.current.queryFeaturesDirect(url, {
                where: `${routeField} = '${rid.replace(/'/g, "''")}'`,
                outFields: routeField,
                returnGeometry: 'true',
                returnM: 'true',
                outSR: String(viewWkid),
                resultRecordCount: '1',
                f: 'json'
            });
            if (!((_c = json.features) === null || _c === void 0 ? void 0 : _c.length))
                return;
            const paths = (_d = json.features[0].geometry) === null || _d === void 0 ? void 0 : _d.paths;
            if (!(paths === null || paths === void 0 ? void 0 : paths.length))
                return;
            const [Graphic, Polyline, SimpleLineSymbol] = yield Promise.all([
                window.SystemJS.import('esri/Graphic').then((m) => m.default || m),
                window.SystemJS.import('esri/geometry/Polyline').then((m) => m.default || m),
                window.SystemJS.import('esri/symbols/SimpleLineSymbol').then((m) => m.default || m)
            ]);
            const routeGraphic = new Graphic({
                geometry: new Polyline({ paths, spatialReference: { wkid: viewWkid } }),
                symbol: new SimpleLineSymbol({ color: [220, 60, 60, 180], width: 3, style: 'dash' })
            });
            routePreviewGraphicRef.current = routeGraphic;
            previewLayer.add(routeGraphic);
            // Zoom to route
            try {
                view.goTo(routeGraphic.geometry.extent.expand(1.3), { duration: 800 });
            }
            catch (_) { }
        }
        catch (err) {
            console.warn('showRoutePreview failed:', err);
        }
    }), [config]);
    showRoutePreviewRef.current = showRoutePreview;
    // Show a measure point (green=from, red=to) on the map
    const showMeasurePoint = useCallback((which, measureVal) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) || !routePreviewVertsRef.current)
            return;
        const view = jimuMapViewRef.current.view;
        const m = parseFloat(measureVal);
        if (isNaN(m))
            return;
        const ref = which === 'from' ? fromMeasureGraphicRef : toMeasureGraphicRef;
        if (ref.current) {
            const layer = routePreviewLayerRef.current;
            if (layer) {
                if (Array.isArray(ref.current))
                    ref.current.forEach((g) => layer.remove(g));
                else
                    layer.remove(ref.current);
            }
            ref.current = null;
        }
        const { vertices, mIdx } = routePreviewVertsRef.current;
        // Interpolate point at measure
        let pt = null;
        if (m <= (vertices[0][mIdx] || 0)) {
            pt = { x: vertices[0][0], y: vertices[0][1] };
        }
        else if (m >= (vertices[vertices.length - 1][mIdx] || 0)) {
            pt = { x: vertices[vertices.length - 1][0], y: vertices[vertices.length - 1][1] };
        }
        else {
            for (let i = 0; i < vertices.length - 1; i++) {
                const m1 = vertices[i][mIdx] || 0;
                const m2 = vertices[i + 1][mIdx] || 0;
                if (m >= m1 && m <= m2) {
                    const frac = m2 !== m1 ? (m - m1) / (m2 - m1) : 0;
                    pt = { x: vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]), y: vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1]) };
                    break;
                }
            }
        }
        if (!pt)
            return;
        const [Graphic, Point, SimpleMarkerSymbol, TextSymbol] = yield Promise.all([
            window.SystemJS.import('esri/Graphic').then((m) => m.default || m),
            window.SystemJS.import('esri/geometry/Point').then((m) => m.default || m),
            window.SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((m) => m.default || m),
            window.SystemJS.import('esri/symbols/TextSymbol').then((m) => m.default || m)
        ]);
        const color = which === 'from' ? [34, 139, 34, 255] : [180, 0, 0, 255];
        const label = which === 'from' ? `From: ${m.toFixed(3)}` : `To: ${m.toFixed(3)}`;
        const pointGraphic = new Graphic({
            geometry: new Point({ x: pt.x, y: pt.y, spatialReference: view.spatialReference }),
            symbol: new SimpleMarkerSymbol({ color, size: 12, outline: { color: [255, 255, 255], width: 2 } })
        });
        const labelGraphic = new Graphic({
            geometry: new Point({ x: pt.x, y: pt.y, spatialReference: view.spatialReference }),
            symbol: new TextSymbol({ text: label, color: [255, 255, 255], haloColor: [0, 0, 0], haloSize: 1.5, font: { size: 11, weight: 'bold' }, yoffset: 14 })
        });
        ref.current = [pointGraphic, labelGraphic];
        const layer = routePreviewLayerRef.current;
        if (layer) {
            layer.add(pointGraphic);
            layer.add(labelGraphic);
        }
        else {
            view.graphics.add(pointGraphic);
            view.graphics.add(labelGraphic);
        }
    }), []);
    showMeasurePointRef.current = showMeasurePoint;
    // Pick from/to measure on map (snap to route geometry)
    const startPickMeasure = useCallback((which) => {
        var _a;
        if (!((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) || !lrsServiceRef.current)
            return;
        if (!routeId.trim()) {
            setError('Select a route first');
            return;
        }
        if (!routePreviewVertsRef.current) {
            setError('Route geometry not loaded');
            return;
        }
        const view = jimuMapViewRef.current.view;
        if (measurePickHandlerRef.current) {
            measurePickHandlerRef.current.remove();
            measurePickHandlerRef.current = null;
        }
        if (measurePickHoverRef.current) {
            measurePickHoverRef.current.remove();
            measurePickHoverRef.current = null;
        }
        setPickingMeasure(which);
        view.container.style.cursor = 'crosshair';
        const modulesPromise = Promise.all([
            window.SystemJS.import('esri/Graphic').then((m) => m.default || m),
            window.SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((m) => m.default || m),
            window.SystemJS.import('esri/geometry/Point').then((m) => m.default || m)
        ]);
        if (!measureTooltipRef.current) {
            const tip = document.createElement('div');
            tip.style.cssText = 'position:absolute;pointer-events:none;background:#333;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;z-index:99999;display:none;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
            view.container.appendChild(tip);
            measureTooltipRef.current = tip;
        }
        const tooltip = measureTooltipRef.current;
        tooltip.style.display = 'none';
        const { vertices: allVerts, mIdx } = routePreviewVertsRef.current;
        function nearestMOnRoute(px, py) {
            let bestDist = Infinity, bestX = px, bestY = py, bestM = 0;
            for (let i = 0; i < allVerts.length - 1; i++) {
                const [ax, ay] = allVerts[i];
                const [bx, by] = allVerts[i + 1];
                const mA = allVerts[i][mIdx] || 0;
                const mB = allVerts[i + 1][mIdx] || 0;
                const dx = bx - ax, dy = by - ay;
                const lenSq = dx * dx + dy * dy;
                if (lenSq === 0)
                    continue;
                let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
                t = Math.max(0, Math.min(1, t));
                const cx = ax + t * dx, cy = ay + t * dy;
                const d = (px - cx) * (px - cx) + (py - cy) * (py - cy);
                if (d < bestDist) {
                    bestDist = d;
                    bestX = cx;
                    bestY = cy;
                    bestM = mA + t * (mB - mA);
                }
            }
            return bestDist < Infinity ? { m: bestM, x: bestX, y: bestY } : null;
        }
        // Pointer-move: snap and show M value
        modulesPromise.then(([Graphic, SimpleMarkerSymbol, Point]) => {
            measurePickHoverRef.current = view.on('pointer-move', (event) => {
                const mapPoint = view.toMap({ x: event.x, y: event.y });
                if (!mapPoint)
                    return;
                const result = nearestMOnRoute(mapPoint.x, mapPoint.y);
                if (!result)
                    return;
                tooltip.style.left = `${event.x + 14}px`;
                tooltip.style.top = `${event.y - 40}px`;
                tooltip.textContent = `M: ${result.m.toFixed(3)}`;
                tooltip.style.display = 'block';
                if (measureSnapGraphicRef.current) {
                    measureSnapGraphicRef.current.geometry = new Point({ x: result.x, y: result.y, spatialReference: view.spatialReference });
                }
                else {
                    const g = new Graphic({
                        geometry: new Point({ x: result.x, y: result.y, spatialReference: view.spatialReference }),
                        symbol: new SimpleMarkerSymbol({ color: [255, 87, 34, 255], size: 10, outline: { color: [255, 255, 255], width: 2 } })
                    });
                    measureSnapGraphicRef.current = g;
                    view.graphics.add(g);
                }
            });
            // Click: set the measure value
            measurePickHandlerRef.current = view.on('click', (event) => {
                const mapPoint = view.toMap({ x: event.x, y: event.y });
                if (!mapPoint)
                    return;
                const result = nearestMOnRoute(mapPoint.x, mapPoint.y);
                if (result) {
                    const mVal = result.m.toFixed(3);
                    if (which === 'from') {
                        setFromMeasure(mVal);
                        showMeasurePointRef.current('from', mVal);
                        cancelPickMeasure();
                        setTimeout(() => startPickMeasure('to'), 50);
                        return;
                    }
                    else {
                        setToMeasure(mVal);
                        showMeasurePointRef.current('to', mVal);
                    }
                }
                cancelPickMeasure();
            });
        });
    }, [config, routeId]);
    const cancelPickMeasure = useCallback(() => {
        var _a, _b;
        if (measurePickHandlerRef.current) {
            measurePickHandlerRef.current.remove();
            measurePickHandlerRef.current = null;
        }
        if (measurePickHoverRef.current) {
            measurePickHoverRef.current.remove();
            measurePickHoverRef.current = null;
        }
        if (measureTooltipRef.current)
            measureTooltipRef.current.style.display = 'none';
        if (measureSnapGraphicRef.current && ((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view)) {
            jimuMapViewRef.current.view.graphics.remove(measureSnapGraphicRef.current);
            measureSnapGraphicRef.current = null;
        }
        if ((_b = jimuMapViewRef.current) === null || _b === void 0 ? void 0 : _b.view) {
            jimuMapViewRef.current.view.container.style.cursor = '';
        }
        setPickingMeasure(null);
    }, []);
    // Clear all route preview graphics
    const clearRoutePreview = useCallback(() => {
        if (routePreviewLayerRef.current)
            routePreviewLayerRef.current.removeAll();
        routePreviewGraphicRef.current = null;
        fromMeasureGraphicRef.current = null;
        toMeasureGraphicRef.current = null;
        routePreviewVertsRef.current = null;
    }, []);
    // Clear everything (prediction layer, crash events, route preview, state)
    const clearAll = useCallback(() => {
        var _a;
        const view = (_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view;
        if (view) {
            // Remove prediction layer
            if (predictionLayerRef.current) {
                view.map.remove(predictionLayerRef.current);
                predictionLayerRef.current = null;
            }
            const existingPred = view.map.allLayers.find((l) => l.title === 'Crash Risk Prediction');
            if (existingPred)
                view.map.remove(existingPred);
            // Remove crash events layer
            if (crashEventsLayerRef.current) {
                view.map.remove(crashEventsLayerRef.current);
                crashEventsLayerRef.current = null;
            }
            // Remove draw graphics
            if (graphicsLayerRef.current)
                graphicsLayerRef.current.removeAll();
            // Remove route highlight graphics
            if (routeGraphicsLayerRef.current)
                routeGraphicsLayerRef.current.removeAll();
        }
        clearRoutePreview();
        setRouteId('');
        setRouteName('');
        setFromMeasure('');
        setToMeasure('');
        setRouteMeasureRange(null);
        setRouteSuggestions([]);
        setShowSuggestions(false);
        setMapRoutes([]);
        setSelectedMapRouteIds(new Set());
        setResult(null);
        setFactors(null);
        setModelInfo(null);
        setCrashStats(null);
        setProgress('');
        setError(null);
        setShowExplanation(false);
        setMode('choose');
        routeGeometriesRef.current.clear();
    }, [clearRoutePreview]);
    // Toggle individual route selection (with map visibility)
    const toggleMapRoute = useCallback((routeId) => {
        setSelectedMapRouteIds(prev => {
            var _a, _b;
            const next = new Set(prev);
            if (next.has(routeId))
                next.delete(routeId);
            else
                next.add(routeId);
            if (routeGraphicsLayerRef.current) {
                const graphics = ((_a = routeGraphicsLayerRef.current.graphics) === null || _a === void 0 ? void 0 : _a.toArray()) || [];
                for (const g of graphics) {
                    if (((_b = g.attributes) === null || _b === void 0 ? void 0 : _b.routeId) === routeId)
                        g.visible = next.has(routeId);
                }
            }
            return next;
        });
    }, []);
    // Pick route from map (with hover tooltip + snap graphic like road-log)
    const startPickFromMap = useCallback(() => {
        var _a, _b;
        if (!((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) || !lrsServiceRef.current)
            return;
        const view = jimuMapViewRef.current.view;
        if (pickHandlerRef.current) {
            pickHandlerRef.current.remove();
            pickHandlerRef.current = null;
        }
        if (pickHoverHandlerRef.current) {
            pickHoverHandlerRef.current.remove();
            pickHoverHandlerRef.current = null;
        }
        setPickingFromMap(true);
        view.container.style.cursor = 'crosshair';
        const routeField = config.networkRouteIdField || 'customroutefield';
        const nameField = config.networkRouteNameField || 'route_name';
        const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '');
        const queryUrl = `${baseMapUrl}/${config.networkLayerId}/query`;
        const outFields = `${routeField},${nameField}`;
        const viewWkid = ((_b = view.spatialReference) === null || _b === void 0 ? void 0 : _b.wkid) || 102100;
        // Create tooltip
        if (!pickTooltipRef.current) {
            const tip = document.createElement('div');
            tip.style.cssText = 'position:absolute;pointer-events:none;background:#333;color:#fff;padding:4px 8px;border-radius:4px;font-size:12px;white-space:nowrap;z-index:99999;display:none;box-shadow:0 2px 6px rgba(0,0,0,0.3);';
            view.container.appendChild(tip);
            pickTooltipRef.current = tip;
        }
        const tooltip = pickTooltipRef.current;
        tooltip.style.display = 'none';
        let lastQueryId = 0;
        let cachedPaths = [];
        let cachedLabels = [];
        let lastQueryPt = null;
        const REQUERY_DIST = 80;
        // Load ArcGIS modules for snap graphic
        const modulesPromise = new Promise(resolve => {
            window.require(['esri/Graphic', 'esri/symbols/SimpleMarkerSymbol', 'esri/geometry/Point'], (...m) => resolve(m));
        });
        // Helper: snap to nearest point on cached paths
        function snapToNearest(px, py) {
            let bestDist = Infinity, bestX = px, bestY = py;
            for (const paths of cachedPaths) {
                for (const path of paths) {
                    for (let i = 0; i < path.length - 1; i++) {
                        const [ax, ay] = path[i];
                        const [bx, by] = path[i + 1];
                        const dx = bx - ax, dy = by - ay;
                        const lenSq = dx * dx + dy * dy;
                        if (lenSq === 0)
                            continue;
                        let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
                        t = Math.max(0, Math.min(1, t));
                        const cx = ax + t * dx, cy = ay + t * dy;
                        const d = (px - cx) * (px - cx) + (py - cy) * (py - cy);
                        if (d < bestDist) {
                            bestDist = d;
                            bestX = cx;
                            bestY = cy;
                        }
                    }
                }
            }
            return bestDist < Infinity ? { x: bestX, y: bestY } : null;
        }
        // Hover: show route name tooltip + snap graphic
        pickHoverHandlerRef.current = view.on('pointer-move', (event) => __awaiter(void 0, void 0, void 0, function* () {
            tooltip.style.left = `${event.x + 14}px`;
            tooltip.style.top = `${event.y - 40}px`;
            const mapPoint = view.toMap({ x: event.x, y: event.y });
            if (!mapPoint)
                return;
            // Snap using cached geometry
            if (cachedPaths.length > 0) {
                const snap = snapToNearest(mapPoint.x, mapPoint.y);
                if (snap) {
                    const [Graphic, SimpleMarkerSymbol, Point] = yield modulesPromise;
                    if (pickSnapGraphicRef.current) {
                        pickSnapGraphicRef.current.geometry = new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference });
                    }
                    else {
                        const snapGraphic = new Graphic({
                            geometry: new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference }),
                            symbol: new SimpleMarkerSymbol({ color: [0, 122, 255, 255], size: 10, outline: { color: [255, 255, 255], width: 2 } })
                        });
                        pickSnapGraphicRef.current = snapGraphic;
                        view.graphics.add(snapGraphic);
                    }
                }
            }
            // Check if cursor moved far enough to re-query
            if (lastQueryPt) {
                const dx = mapPoint.x - lastQueryPt.x;
                const dy = mapPoint.y - lastQueryPt.y;
                if (Math.sqrt(dx * dx + dy * dy) < REQUERY_DIST)
                    return;
            }
            if (pickHoverTimeoutRef.current)
                clearTimeout(pickHoverTimeoutRef.current);
            pickHoverTimeoutRef.current = setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const queryId = ++lastQueryId;
                try {
                    const params = {
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
                    };
                    const json = yield lrsServiceRef.current.queryFeaturesDirect(queryUrl, params);
                    if (queryId !== lastQueryId)
                        return;
                    lastQueryPt = { x: mapPoint.x, y: mapPoint.y };
                    if (((_a = json.features) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                        cachedPaths = json.features.map((f) => { var _a; return ((_a = f.geometry) === null || _a === void 0 ? void 0 : _a.paths) || []; });
                        cachedLabels = json.features.map((f) => {
                            const rid = f.attributes[routeField] || '';
                            const rname = f.attributes[nameField] || '';
                            return rname ? `${rname} (${rid})` : rid;
                        });
                        tooltip.textContent = cachedLabels.join('\n');
                        tooltip.style.whiteSpace = cachedLabels.length > 1 ? 'pre-line' : 'nowrap';
                        tooltip.style.display = 'block';
                        // Update snap with fresh geometry
                        const snap = snapToNearest(mapPoint.x, mapPoint.y);
                        if (snap) {
                            const [Graphic, SimpleMarkerSymbol, Point] = yield modulesPromise;
                            if (queryId !== lastQueryId)
                                return;
                            if (pickSnapGraphicRef.current) {
                                pickSnapGraphicRef.current.geometry = new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference });
                            }
                            else {
                                const g = new Graphic({
                                    geometry: new Point({ x: snap.x, y: snap.y, spatialReference: view.spatialReference }),
                                    symbol: new SimpleMarkerSymbol({ color: [0, 122, 255, 255], size: 10, outline: { color: [255, 255, 255], width: 2 } })
                                });
                                pickSnapGraphicRef.current = g;
                                view.graphics.add(g);
                            }
                        }
                    }
                    else {
                        tooltip.style.display = 'none';
                        cachedPaths = [];
                        cachedLabels = [];
                    }
                }
                catch (_b) {
                    tooltip.style.display = 'none';
                }
            }), 100);
        }));
        // Click: select route
        pickHandlerRef.current = view.on('click', (event) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            if (pickHandlerRef.current) {
                pickHandlerRef.current.remove();
                pickHandlerRef.current = null;
            }
            if (pickHoverHandlerRef.current) {
                pickHoverHandlerRef.current.remove();
                pickHoverHandlerRef.current = null;
            }
            if (pickHoverTimeoutRef.current)
                clearTimeout(pickHoverTimeoutRef.current);
            tooltip.style.display = 'none';
            view.container.style.cursor = '';
            setPickingFromMap(false);
            // Remove snap graphic
            if (pickSnapGraphicRef.current) {
                view.graphics.remove(pickSnapGraphicRef.current);
                pickSnapGraphicRef.current = null;
            }
            try {
                const params = {
                    geometry: JSON.stringify(event.mapPoint.toJSON()),
                    geometryType: 'esriGeometryPoint',
                    spatialRel: 'esriSpatialRelIntersects',
                    distance: '50',
                    units: 'esriSRUnit_Meter',
                    outFields,
                    returnGeometry: 'false',
                    resultRecordCount: '10',
                    f: 'json'
                };
                const json = yield lrsServiceRef.current.queryFeaturesDirect(queryUrl, params);
                if (((_a = json.features) === null || _a === void 0 ? void 0 : _a.length) > 1) {
                    const candidates = json.features.map((f) => ({
                        routeId: f.attributes[routeField] || '',
                        routeName: f.attributes[nameField] || f.attributes[routeField] || ''
                    }));
                    const seen = new Set();
                    const unique = candidates.filter((c) => { if (seen.has(c.routeId))
                        return false; seen.add(c.routeId); return true; });
                    if (unique.length > 1) {
                        setRoutePickCandidates(unique);
                    }
                    else {
                        setRouteId(unique[0].routeId);
                        setRouteName(unique[0].routeName);
                        fetchRouteMeasures(unique[0].routeId);
                    }
                }
                else if (((_b = json.features) === null || _b === void 0 ? void 0 : _b.length) === 1) {
                    const attrs = json.features[0].attributes;
                    const rid = attrs[routeField] || '';
                    const rname = attrs[nameField] || '';
                    setRouteId(rid);
                    setRouteName(rname || rid);
                    fetchRouteMeasures(rid);
                }
                else {
                    setError('No route found at that location');
                }
            }
            catch (err) {
                setError('Failed to identify route: ' + (err.message || err));
            }
        }));
    }, [config, fetchRouteMeasures]);
    const cancelPickFromMap = useCallback(() => {
        var _a;
        if (pickHandlerRef.current) {
            pickHandlerRef.current.remove();
            pickHandlerRef.current = null;
        }
        if (pickHoverHandlerRef.current) {
            pickHoverHandlerRef.current.remove();
            pickHoverHandlerRef.current = null;
        }
        if (pickHoverTimeoutRef.current)
            clearTimeout(pickHoverTimeoutRef.current);
        if (pickTooltipRef.current)
            pickTooltipRef.current.style.display = 'none';
        if ((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) {
            const v = jimuMapViewRef.current.view;
            v.container.style.cursor = '';
            if (pickSnapGraphicRef.current) {
                v.graphics.remove(pickSnapGraphicRef.current);
                pickSnapGraphicRef.current = null;
            }
        }
        setPickingFromMap(false);
    }, []);
    // Draw polygon to select multiple routes (same pattern as road-log)
    const startDrawArea = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) || !lrsServiceRef.current)
            return;
        const view = jimuMapViewRef.current.view;
        setDrawing(true);
        setMapRoutes([]);
        setSelectedMapRouteIds(new Set());
        const [GraphicsLayer, SketchViewModel] = yield new Promise(resolve => {
            window.require(['esri/layers/GraphicsLayer', 'esri/widgets/Sketch/SketchViewModel'], (...m) => resolve(m));
        });
        if (!graphicsLayerRef.current) {
            graphicsLayerRef.current = new GraphicsLayer({ id: 'crashrisk-draw', listMode: 'hide' });
            view.map.add(graphicsLayerRef.current);
        }
        graphicsLayerRef.current.removeAll();
        if (!routeGraphicsLayerRef.current) {
            routeGraphicsLayerRef.current = new GraphicsLayer({ id: 'crashrisk-routes', listMode: 'hide' });
            view.map.add(routeGraphicsLayerRef.current);
        }
        routeGraphicsLayerRef.current.removeAll();
        if (sketchVMRef.current)
            sketchVMRef.current.destroy();
        const svm = new SketchViewModel({
            view,
            layer: graphicsLayerRef.current,
            polygonSymbol: { type: 'simple-fill', color: [0, 121, 193, 0.15], outline: { color: [0, 121, 193], width: 2 } }
        });
        sketchVMRef.current = svm;
        svm.on('create', (evt) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if (evt.state !== 'complete')
                return;
            setDrawing(false);
            const polygon = evt.graphic.geometry;
            try {
                const routeField = config.networkRouteIdField || 'customroutefield';
                const nameField = config.networkRouteNameField || 'route_name';
                const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '');
                const viewWkid = ((_a = view.spatialReference) === null || _a === void 0 ? void 0 : _a.wkid) || 102100;
                const url = `${baseMapUrl}/${config.networkLayerId}/query`;
                // Use envelope geometry for JSONP (polygon JSON too large for GET)
                const ext = polygon.extent;
                const envelopeStr = `${ext.xmin},${ext.ymin},${ext.xmax},${ext.ymax}`;
                const params = {
                    geometry: envelopeStr,
                    geometryType: 'esriGeometryEnvelope',
                    inSR: String(((_b = ext.spatialReference) === null || _b === void 0 ? void 0 : _b.wkid) || ((_c = ext.spatialReference) === null || _c === void 0 ? void 0 : _c.latestWkid) || viewWkid),
                    spatialRel: 'esriSpatialRelIntersects',
                    outFields: `${routeField},${nameField}`,
                    returnGeometry: 'true',
                    returnM: 'true',
                    outSR: String(viewWkid),
                    resultRecordCount: '200',
                    f: 'json'
                };
                const data = yield lrsServiceRef.current.queryFeaturesDirect(url, params);
                const features = data.features || [];
                if (features.length === 0) {
                    setError('No routes found within the drawn polygon');
                    return;
                }
                // Load geometry modules for clipping route polylines to actual polygon
                const [geometryEngine, Polyline, Polygon, Graphic, SimpleLineSymbol] = yield Promise.all([
                    window.SystemJS.import('esri/geometry/geometryEngine').then((m) => m.default || m),
                    window.SystemJS.import('esri/geometry/Polyline').then((m) => m.default || m),
                    window.SystemJS.import('esri/geometry/Polygon').then((m) => m.default || m),
                    window.SystemJS.import('esri/Graphic').then((m) => m.default || m),
                    window.SystemJS.import('esri/symbols/SimpleLineSymbol').then((m) => m.default || m)
                ]);
                // Reconstruct polygon for clip operations
                const clipPolygon = new Polygon({ rings: polygon.rings, spatialReference: polygon.spatialReference });
                const routeMap = new Map();
                const routeNameMap = new Map();
                const routeDisplayPaths = new Map();
                const precision = 3;
                for (const f of features) {
                    const rid = String(f.attributes[routeField] || Object.values(f.attributes)[0]);
                    if (!routeNameMap.has(rid) && f.attributes[nameField])
                        routeNameMap.set(rid, String(f.attributes[nameField]));
                    if ((_d = f.geometry) === null || _d === void 0 ? void 0 : _d.paths) {
                        try {
                            const polyline = new Polyline({
                                paths: f.geometry.paths,
                                spatialReference: f.geometry.spatialReference,
                                hasM: f.geometry.hasM !== false,
                                hasZ: f.geometry.hasZ === true
                            });
                            const clipped = geometryEngine.intersect(polyline, clipPolygon);
                            if (clipped === null || clipped === void 0 ? void 0 : clipped.paths) {
                                const mIdx = clipped.hasZ ? 3 : 2;
                                const existing = routeMap.get(rid) || { minM: Infinity, maxM: -Infinity };
                                for (const path of clipped.paths) {
                                    for (const pt of path) {
                                        if (pt.length > mIdx) {
                                            const m = pt[mIdx];
                                            if (m != null && !isNaN(m)) {
                                                existing.minM = Math.min(existing.minM, m);
                                                existing.maxM = Math.max(existing.maxM, m);
                                            }
                                        }
                                    }
                                }
                                routeMap.set(rid, existing);
                                // Store clipped paths for display
                                const clippedJson = clipped.toJSON ? clipped.toJSON() : clipped;
                                const clippedPaths = (clippedJson.paths || []).map((path) => path.map((pt) => [pt[0], pt[1]]));
                                const prev = routeDisplayPaths.get(rid) || [];
                                prev.push(...clippedPaths);
                                routeDisplayPaths.set(rid, prev);
                                // Store full vertices for later measure interpolation in analysis
                                const allVerts = f.geometry.paths.flat();
                                if (!routeGeometriesRef.current.has(rid))
                                    routeGeometriesRef.current.set(rid, { vertices: allVerts, mIdx });
                            }
                        }
                        catch ( /* clip failed, skip */_g) { /* clip failed, skip */ }
                    }
                }
                if (routeMap.size === 0) {
                    setError('No routes found within the drawn polygon');
                    return;
                }
                // Add clipped route graphics as red dashed lines
                const routeSymbol = new SimpleLineSymbol({ color: [255, 0, 0, 0.85], width: 3, style: 'dash' });
                const querySR = ((_f = (_e = features[0]) === null || _e === void 0 ? void 0 : _e.geometry) === null || _f === void 0 ? void 0 : _f.spatialReference) || polygon.spatialReference;
                for (const [rid, paths] of routeDisplayPaths.entries()) {
                    const displayPolyline = new Polyline({ paths, spatialReference: querySR });
                    routeGraphicsLayerRef.current.add(new Graphic({
                        geometry: displayPolyline,
                        symbol: routeSymbol,
                        attributes: { routeId: rid }
                    }));
                }
                const routes = Array.from(routeMap.entries()).map(([rid, mr]) => ({
                    routeId: rid,
                    routeName: routeNameMap.get(rid) || null,
                    fromMeasure: mr.minM === Infinity ? 0 : parseFloat(mr.minM.toFixed(precision)),
                    toMeasure: mr.maxM === -Infinity || mr.maxM === Infinity ? 0 : parseFloat(mr.maxM.toFixed(precision))
                }));
                setMapRoutes(routes);
                setSelectedMapRouteIds(new Set(routes.map(r => r.routeId)));
                setSearchMode('map');
            }
            catch (e) {
                setError('Area query failed: ' + (e.message || e));
            }
        }));
        svm.create('polygon');
    }), [config]);
    // ==================== QUERY EVENT DATA (internal, triggered by Run) ====================
    const queryEventData = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        if (!lrsServiceRef.current)
            throw new Error('No LRS service configured');
        const eventConfigs = config.eventLayerConfigs || [];
        let routeIds = [];
        if (searchMode === 'map') {
            routeIds = Array.from(selectedMapRouteIds);
        }
        else {
            if (!routeId.trim())
                throw new Error('Enter a Route ID or select from map.');
            routeIds = [routeId.trim()];
        }
        if (routeIds.length === 0)
            throw new Error('No routes selected.');
        const allEntries = [];
        const baseMapUrl = config.lrsServiceUrl.replace(/\/exts\/LRServer$/i, '');
        for (const cfg of eventConfigs) {
            const layerUrl = `${baseMapUrl}/${cfg.layerId}/query`;
            // Use discovered field names from LRS metadata (fall back to config, then defaults)
            const discovered = eventFieldNamesRef.current.get(cfg.layerId);
            const routeIdField = (discovered === null || discovered === void 0 ? void 0 : discovered.routeIdField) || cfg.routeIdField || 'routeid';
            const measureField = (discovered === null || discovered === void 0 ? void 0 : discovered.measureField) || cfg.measureField || cfg.fromMeasureField || 'measure';
            const fromMeasureField = (discovered === null || discovered === void 0 ? void 0 : discovered.fromMeasureField) || cfg.fromMeasureField || 'from_measure';
            for (const rid of routeIds) {
                const where = `${routeIdField} = '${rid.replace(/'/g, "''")}'`;
                const params = {
                    where,
                    outFields: '*',
                    returnGeometry: 'false',
                    f: 'json'
                };
                const data = yield lrsServiceRef.current.queryFeaturesDirect(layerUrl, params);
                for (const f of (data.features || [])) {
                    allEntries.push(Object.assign({ Feature: cfg.name, RouteID: f.attributes[routeIdField] || f.attributes['routeid'], Measure: (_a = f.attributes[measureField]) !== null && _a !== void 0 ? _a : f.attributes[fromMeasureField] }, Object.fromEntries((cfg.attributes || []).map(a => [a, f.attributes[a]]))));
                }
            }
        }
        // Ensure route geometries are cached
        for (const rid of routeIds) {
            if (!routeGeometriesRef.current.has(rid)) {
                yield fetchRouteMeasures(rid);
            }
        }
        return allEntries;
    }), [config, routeId, searchMode, selectedMapRouteIds, fetchRouteMeasures]);
    // ==================== DISPLAY ON MAP ====================
    const displayPredictionOnMap = useCallback((layerUrl, token, wkid) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const view = (_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view;
        if (!view)
            return;
        const [FeatureLayer] = yield new Promise(resolve => {
            window.require(['esri/layers/FeatureLayer'], (...mods) => resolve(mods));
        });
        const existingLayer = view.map.allLayers.find((l) => l.title === 'Crash Risk Prediction');
        if (existingLayer)
            view.map.remove(existingLayer);
        const predictionLayer = new FeatureLayer({
            url: layerUrl,
            title: 'Crash Risk Prediction',
            customParameters: { token },
            definitionExpression: 'risk_score > 0',
            renderer: {
                type: 'class-breaks',
                field: 'risk_score',
                classBreakInfos: [
                    { minValue: 1, maxValue: 25, symbol: { type: 'simple-line', color: [56, 168, 0, 200], width: 3 }, label: 'Low Risk (1-25)' },
                    { minValue: 26, maxValue: 50, symbol: { type: 'simple-line', color: [255, 255, 0, 220], width: 4 }, label: 'Medium Risk (26-50)' },
                    { minValue: 51, maxValue: 75, symbol: { type: 'simple-line', color: [255, 128, 0, 230], width: 5 }, label: 'Medium-High Risk (51-75)' },
                    { minValue: 76, maxValue: 100, symbol: { type: 'simple-line', color: [255, 0, 0, 255], width: 6 }, label: 'High Risk (76-100)' }
                ]
            },
            popupTemplate: {
                title: 'Crash Risk: {risk_level}',
                content: `<div style="font-size:13px">
          <div style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #e0e0e0">
            <span style="font-size:24px;font-weight:700;color:{expression/riskColor}">{risk_score}</span>
            <span style="color:#666;font-size:12px">/100 risk score</span>
          </div>
          <table style="border-collapse:collapse;width:100%">
            <tr><td style="padding:3px 8px 3px 0;font-weight:600;color:#444">Route</td><td>{routeid}</td></tr>
            <tr><td style="padding:3px 8px 3px 0;font-weight:600;color:#444">Segment</td><td>M {from_m} \u2013 {to_m}</td></tr>
            <tr><td style="padding:3px 8px 3px 0;font-weight:600;color:#444">Risk Level</td><td style="font-weight:700">{risk_level}</td></tr>
            <tr><td style="padding:3px 8px 3px 0;font-weight:600;color:#444">Contributing Factors</td><td>{contributing_factors}</td></tr>
          </table>
        </div>`,
                expressionInfos: [{
                        name: 'riskColor',
                        expression: `var s = $feature.risk_score; When(s > 75, '#d32f2f', s > 50, '#f57c00', s > 25, '#fbc02d', s > 0, '#388e3c', '#999')`
                    }]
            }
        });
        view.map.add(predictionLayer);
        predictionLayerRef.current = predictionLayer;
        predictionLayer.when(() => {
            predictionLayer.queryExtent().then((r) => {
                if (r.extent)
                    view.goTo(r.extent.expand(1.2));
            });
        });
    }), []);
    // Display crash event points on map
    const displayCrashEventsOnMap = useCallback((crashEntries, routeGeometries) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const view = (_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view;
        if (!view || crashEntries.length === 0)
            return;
        const [GraphicsLayer, Graphic, Point, SimpleMarkerSymbol] = yield Promise.all([
            window.SystemJS.import('esri/layers/GraphicsLayer').then((m) => m.default || m),
            window.SystemJS.import('esri/Graphic').then((m) => m.default || m),
            window.SystemJS.import('esri/geometry/Point').then((m) => m.default || m),
            window.SystemJS.import('esri/symbols/SimpleMarkerSymbol').then((m) => m.default || m)
        ]);
        if (crashEventsLayerRef.current) {
            view.map.remove(crashEventsLayerRef.current);
            crashEventsLayerRef.current = null;
        }
        const gl = new GraphicsLayer({ id: '__crashrisk_events__', title: 'Crash Events (AI Input)' });
        for (const entry of crashEntries) {
            if (entry.Measure == null || entry.RouteID == null)
                continue;
            const rd = routeGeometries.get(entry.RouteID);
            if (!rd)
                continue;
            const { vertices, mIdx } = rd;
            const m = parseFloat(entry.Measure);
            if (isNaN(m))
                continue;
            // Interpolate point
            let px = 0, py = 0, found = false;
            if (m <= (vertices[0][mIdx] || 0)) {
                px = vertices[0][0];
                py = vertices[0][1];
                found = true;
            }
            else if (m >= (vertices[vertices.length - 1][mIdx] || 0)) {
                px = vertices[vertices.length - 1][0];
                py = vertices[vertices.length - 1][1];
                found = true;
            }
            else {
                for (let i = 0; i < vertices.length - 1; i++) {
                    const m1 = vertices[i][mIdx] || 0, m2 = vertices[i + 1][mIdx] || 0;
                    if (m >= m1 && m <= m2) {
                        const frac = m2 !== m1 ? (m - m1) / (m2 - m1) : 0;
                        px = vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]);
                        py = vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1]);
                        found = true;
                        break;
                    }
                }
            }
            if (!found)
                continue;
            gl.add(new Graphic({
                geometry: new Point({ x: px, y: py, spatialReference: view.spatialReference }),
                symbol: new SimpleMarkerSymbol({ color: [200, 30, 30, 180], size: 7, outline: { color: [255, 255, 255, 200], width: 1 } }),
                attributes: entry,
                popupTemplate: { title: 'Crash Event', content: `Route: ${entry.RouteID}, M: ${m.toFixed(3)}` }
            }));
        }
        view.map.add(gl, 0);
        crashEventsLayerRef.current = gl;
    }), []);
    // ==================== NY STATE CRASH MODEL ====================
    const NY_STATE_CRASH_MODEL = {
        totalCrashes: 1525123,
        totalFatal: 4208,
        years: '2021-2024',
        source: 'NY State DMV via data.ny.gov',
        roadGeometry: {
            'Straight and Level': { crashes: 1178228, fatal: 2834, weight: 1.0 },
            'Straight and Grade': { crashes: 126464, fatal: 429, weight: 1.41 },
            'Curve and Level': { crashes: 72349, fatal: 497, weight: 2.86 },
            'Curve and Grade': { crashes: 47497, fatal: 316, weight: 2.77 },
            'Curve at Hill Crest': { crashes: 6860, fatal: 54, weight: 3.28 },
            'Straight at Hill Crest': { crashes: 21597, fatal: 75, weight: 1.45 }
        },
        trafficControl: {
            'None': { crashes: 872056, fatal: 2457, weight: 1.17 },
            'Traffic Signal': { crashes: 318065, fatal: 826, weight: 1.08 },
            'Stop Sign': { crashes: 131664, fatal: 266, weight: 0.84 },
            'No Passing Zone': { crashes: 85396, fatal: 557, weight: 2.72 },
            'Yield Sign': { crashes: 12880, fatal: 8, weight: 0.26 },
            'Construction Work Area': { crashes: 4429, fatal: 9, weight: 0.85 },
            'Flashing Light': { crashes: 3063, fatal: 10, weight: 1.36 },
            'RR Crossing Gates': { crashes: 878, fatal: 7, weight: 3.32 },
            'School Zone': { crashes: 637, fatal: 1, weight: 0.65 }
        },
        roadSurface: {
            'Dry': { crashes: 1130211, fatal: 3102, weight: 1.0 },
            'Wet': { crashes: 234603, fatal: 651, weight: 1.01 },
            'Snow/Ice': { crashes: 72676, fatal: 222, weight: 1.11 },
            'Slush': { crashes: 5757, fatal: 14, weight: 0.89 },
            'Flooded Water': { crashes: 508, fatal: 3, weight: 2.15 },
            'Muddy': { crashes: 648, fatal: 3, weight: 1.69 }
        },
        lighting: {
            'Daylight': { crashes: 933210, fatal: 1867, weight: 0.83 },
            'Dark-Road Lighted': { crashes: 278982, fatal: 876, weight: 1.31 },
            'Dark-Road Unlighted': { crashes: 148635, fatal: 1005, weight: 2.82 },
            'Dusk': { crashes: 48740, fatal: 221, weight: 1.89 },
            'Dawn': { crashes: 37848, fatal: 239, weight: 2.63 }
        },
        weather: {
            'Clear': { crashes: 935897, fatal: 2679, weight: 1.0 },
            'Cloudy': { crashes: 295732, fatal: 700, weight: 0.83 },
            'Rain': { crashes: 139559, fatal: 419, weight: 1.05 },
            'Snow': { crashes: 58763, fatal: 183, weight: 1.09 },
            'Sleet/Hail/Freezing Rain': { crashes: 9483, fatal: 28, weight: 1.03 },
            'Fog/Smog/Smoke': { crashes: 4792, fatal: 45, weight: 3.91 }
        },
        lrsMapping: {
            'Curve': { stateField: 'roadGeometry', valueMap: { 'Left': 'Curve and Level', 'Right': 'Curve and Level', 'Compound': 'Curve and Grade', 'Reverse': 'Curve and Grade', 'Simple': 'Curve and Level' } },
            'Grade': { stateField: 'roadGeometry', valueMap: { 'Level': 'Straight and Level', 'Flat': 'Straight and Level', 'Rolling': 'Straight and Grade', 'Mountainous': 'Curve and Grade', 'Steep': 'Straight and Grade' } },
            'Speed Limit': { stateField: 'speed', customWeights: { '25': 0.7, '30': 0.8, '35': 0.9, '40': 1.1, '45': 1.3, '50': 1.6, '55': 2.0, '60': 2.3, '65': 2.6 } },
            'Functional Class': { stateField: 'funcClass', customWeights: { 'Interstate': 1.3, 'Principal Arterial': 1.5, 'Minor Arterial': 1.2, 'Major Collector': 1.0, 'Minor Collector': 0.8, 'Local': 0.6 } },
            'Median Type': { stateField: 'median', customWeights: { 'None': 1.8, 'Painted': 1.3, 'Curbed': 1.0, 'Positive Barrier': 0.6, 'Depressed': 0.7, 'Grass': 0.9 } },
            'Through Lane': { stateField: 'lanes', customWeights: { '1': 0.8, '2': 1.0, '3': 1.3, '4': 1.1, '5': 1.4, '6': 1.2 } },
            'Shoulder Type': { stateField: 'shoulder', customWeights: { 'None': 1.6, 'Gravel': 1.1, 'Paved': 0.8, 'Grass': 1.2, 'Curb': 1.0 } },
            'Pavement Type': { stateField: 'pavement', customWeights: { 'Asphalt': 0.9, 'Concrete': 1.0, 'Gravel': 1.5, 'Brick': 1.2, 'Dirt': 1.8, 'Composite': 0.95 } },
            'Terrain Type': { stateField: 'roadGeometry', valueMap: { 'Level': 'Straight and Level', 'Rolling': 'Straight and Grade', 'Mountainous': 'Curve and Grade' } },
            'Percent Passing Sight': { stateField: 'passSight', customWeights: { '0': 2.5, '10': 2.2, '20': 1.9, '30': 1.6, '40': 1.3, '50': 1.1, '60': 1.0, '70': 0.9, '80': 0.85, '90': 0.8, '100': 0.75 } },
            'Access Control': { stateField: 'access', customWeights: { 'Full': 0.6, 'Partial': 1.0, 'None': 1.5 } },
            'Ownership': { stateField: 'ownership', customWeights: { 'State': 1.0, 'County': 1.1, 'City': 1.2, 'Federal': 0.9, 'Private': 1.4 } }
        }
    };
    // ==================== AI PREDICTION ====================
    const runAIPrediction = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        setRunning(true);
        setProgress('');
        setResult(null);
        setShowExplanation(false);
        setFactors(null);
        setError(null);
        try {
            const session = jimu_core__WEBPACK_IMPORTED_MODULE_0__.SessionManager.getInstance().getMainSession();
            if (!session)
                throw new Error('Not signed in.');
            const token = session.token;
            const portalUrl = (session.portal || '').replace(/\/sharing\/rest\/?$/, '');
            const username = session.username;
            const view = (_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view;
            const wkid = ((_b = view === null || view === void 0 ? void 0 : view.spatialReference) === null || _b === void 0 ? void 0 : _b.wkid) || 102100;
            // Step 1: Query event data
            setProgress('Querying event data from LRS...');
            const eventData = yield queryEventData();
            if (eventData.length === 0)
                throw new Error('No event data found for selected routes.');
            // Step 2: Segment routes
            setProgress('Segmenting routes into 0.5-mile intervals...');
            const routeGeometries = routeGeometriesRef.current;
            if (routeGeometries.size === 0)
                throw new Error('No route geometries cached.');
            const segments = [];
            for (const [rid, routeData] of routeGeometries) {
                const { vertices, mIdx } = routeData;
                if (vertices.length < 2)
                    continue;
                const minMeasure = vertices[0][mIdx] || 0;
                const maxMeasure = vertices[vertices.length - 1][mIdx] || 0;
                const routeLen = maxMeasure - minMeasure;
                if (routeLen <= 0)
                    continue;
                let segFrom = minMeasure;
                let segIdx = 0;
                while (segFrom < maxMeasure) {
                    const segTo = Math.min(segFrom + 0.5, maxMeasure);
                    const midM = (segFrom + segTo) / 2;
                    let midX = 0, midY = 0;
                    for (let i = 0; i < vertices.length - 1; i++) {
                        const m1 = vertices[i][mIdx] || 0;
                        const m2 = vertices[i + 1][mIdx] || 0;
                        if (midM >= m1 && midM <= m2) {
                            const frac = m2 !== m1 ? (midM - m1) / (m2 - m1) : 0;
                            midX = vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]);
                            midY = vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1]);
                            break;
                        }
                    }
                    const path = [];
                    for (let i = 0; i < vertices.length - 1; i++) {
                        const m1 = vertices[i][mIdx] || 0;
                        const m2 = vertices[i + 1][mIdx] || 0;
                        if (m2 < segFrom)
                            continue;
                        if (m1 > segTo)
                            break;
                        if (m1 >= segFrom && m1 <= segTo) {
                            if (path.length === 0 || path[path.length - 1][0] !== vertices[i][0])
                                path.push([vertices[i][0], vertices[i][1]]);
                        }
                        else if (m1 < segFrom && m2 > segFrom) {
                            const frac = (segFrom - m1) / (m2 - m1);
                            path.push([vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]), vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1])]);
                        }
                        if (m2 >= segFrom && m2 <= segTo)
                            path.push([vertices[i + 1][0], vertices[i + 1][1]]);
                        else if (m1 < segTo && m2 > segTo) {
                            const frac = (segTo - m1) / (m2 - m1);
                            path.push([vertices[i][0] + frac * (vertices[i + 1][0] - vertices[i][0]), vertices[i][1] + frac * (vertices[i + 1][1] - vertices[i][1])]);
                        }
                    }
                    if (path.length >= 2)
                        segments.push({ routeId: rid, segIdx, fromM: segFrom, toM: segTo, midX, midY, path, crashCount: 0, attrs: {} });
                    segFrom = segTo;
                    segIdx++;
                }
            }
            if (segments.length === 0)
                throw new Error('No segments generated.');
            // Step 3: Count crashes per segment
            setProgress(`Counting crashes across ${segments.length} segments...`);
            const eventConfigs = config.eventLayerConfigs || [];
            const crashLayerNames = new Set(eventConfigs.filter(cfg => /crash|accident|collision/i.test(cfg.name)).map(cfg => cfg.name));
            for (const entry of eventData) {
                if (!crashLayerNames.has(entry.Feature))
                    continue;
                if (entry.Measure == null)
                    continue;
                for (const seg of segments) {
                    if (seg.routeId === entry.RouteID && entry.Measure >= seg.fromM && entry.Measure < seg.toM) {
                        seg.crashCount++;
                        break;
                    }
                }
            }
            // Step 4: Enrich with road attributes
            setProgress('Enriching segments with road attributes...');
            const nonCrashLayers = eventConfigs.filter(cfg => !crashLayerNames.has(cfg.name));
            const enrichFields = [];
            for (const cfg of nonCrashLayers) {
                const layerEntries = eventData.filter(e => e.Feature === cfg.name);
                for (const attr of (cfg.attributes || [])) {
                    const fieldName = `${cfg.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15)}_${attr.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15)}`.substring(0, 31);
                    if (!enrichFields.includes(fieldName))
                        enrichFields.push(fieldName);
                    for (const entry of layerEntries) {
                        if (entry.RouteID == null || entry.Measure == null)
                            continue;
                        for (const seg of segments) {
                            if (seg.routeId === entry.RouteID && entry.Measure >= seg.fromM && entry.Measure < seg.toM) {
                                seg.attrs[fieldName] = (_c = entry[attr]) !== null && _c !== void 0 ? _c : '';
                                break;
                            }
                        }
                    }
                }
            }
            // Step 5: Kernel density scoring
            setProgress('Computing risk scores...');
            const KERNEL_RADIUS = 5;
            const DECAY = 0.5;
            const segsByRoute = new Map();
            for (const seg of segments) {
                if (!segsByRoute.has(seg.routeId))
                    segsByRoute.set(seg.routeId, []);
                segsByRoute.get(seg.routeId).push(seg);
            }
            const riskScores = [];
            for (const seg of segments) {
                const routeSegs = segsByRoute.get(seg.routeId) || [];
                let score = seg.crashCount * 2;
                for (const neighbor of routeSegs) {
                    if (neighbor === seg)
                        continue;
                    const d = Math.abs(neighbor.segIdx - seg.segIdx);
                    if (d <= KERNEL_RADIUS)
                        score += neighbor.crashCount * Math.pow(DECAY, d);
                }
                riskScores.push(score);
            }
            const maxRiskScore = Math.max(...riskScores, 1);
            const normalizedScores = riskScores.map(s => Math.round((s / maxRiskScore) * 100));
            // Store factors for explanation
            const highRiskSegs = segments.filter((_, idx) => normalizedScores[idx] >= 75);
            const topHighRisk = highRiskSegs.map(seg => (Object.assign(Object.assign({}, seg), { riskScore: normalizedScores[segments.indexOf(seg)] }))).sort((a, b) => b.riskScore - a.riskScore).slice(0, 5);
            setFactors({ totalSegments: segments.length, segmentsWithCrashes: segments.filter(s => s.crashCount > 0).length, highRiskCount: highRiskSegs.length, maxCrashCount: Math.max(...segments.map(s => s.crashCount), 1), enrichLayers: nonCrashLayers.map(l => l.name), enrichFields, kernelRadius: KERNEL_RADIUS, topHighRiskSegments: topHighRisk });
            // Display crash events on map and compute correlations
            const crashEntries = eventData.filter(e => crashLayerNames.has(e.Feature));
            displayCrashEventsOnMap(crashEntries, routeGeometriesRef.current);
            // Compute top correlating event layer attributes for high-risk segments
            const highRiskSegSet = new Set(highRiskSegs);
            const attrCorrelations = [];
            for (const cfg of nonCrashLayers) {
                for (const attr of (cfg.attributes || [])) {
                    const fieldName = `${cfg.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15)}_${attr.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 15)}`.substring(0, 31);
                    const valueCounts = new Map();
                    for (const seg of highRiskSegs) {
                        const v = seg.attrs[fieldName];
                        if (v != null && v !== '')
                            valueCounts.set(String(v), (valueCounts.get(String(v)) || 0) + 1);
                    }
                    for (const [value, count] of valueCounts) {
                        attrCorrelations.push({ layer: cfg.name, value: `${attr}: ${value}`, count, pct: Math.round((count / highRiskSegs.length) * 100) });
                    }
                }
            }
            attrCorrelations.sort((a, b) => b.pct - a.pct);
            setCrashStats({ totalCrashes: crashEntries.length, topCorrelations: attrCorrelations.slice(0, 4) });
            // Step 6: Upload as feature service
            setProgress('Uploading prediction layer...');
            const contentUrl = `${portalUrl}/sharing/rest/content/users/${username}`;
            const folderUrl = selectedFolderId ? `${contentUrl}/${selectedFolderId}` : contentUrl;
            const serviceName = `CrashRisk_AI_${Date.now()}`;
            const fields = [
                { name: 'OBJECTID', type: 'esriFieldTypeOID', alias: 'ObjectID' },
                { name: 'routeid', type: 'esriFieldTypeString', alias: 'Route ID', length: 100 },
                { name: 'from_m', type: 'esriFieldTypeDouble', alias: 'From Measure' },
                { name: 'to_m', type: 'esriFieldTypeDouble', alias: 'To Measure' },
                { name: 'crash_count', type: 'esriFieldTypeInteger', alias: 'Crash Count' },
                { name: 'risk_score', type: 'esriFieldTypeInteger', alias: 'Risk Score (0-100)' },
                { name: 'risk_level', type: 'esriFieldTypeString', alias: 'Risk Level', length: 20 },
                { name: 'contributing_factors', type: 'esriFieldTypeString', alias: 'Contributing Factors', length: 500 }
            ];
            const createParams = new URLSearchParams();
            createParams.append('createParameters', JSON.stringify({ name: serviceName, serviceDescription: 'AI crash risk prediction', hasStaticData: false, maxRecordCount: 10000, supportedQueryFormats: 'JSON', capabilities: 'Query,Editing', spatialReference: { wkid }, initialExtent: { xmin: -20037508, ymin: -20037508, xmax: 20037508, ymax: 20037508, spatialReference: { wkid } }, allowGeometryUpdates: true }));
            createParams.append('targetType', 'featureService');
            createParams.append('outputType', 'featureService');
            createParams.append('f', 'json');
            createParams.append('token', token);
            if (selectedFolderId)
                createParams.append('folderId', selectedFolderId);
            const createResp = yield fetch(`${folderUrl}/createService`, { method: 'POST', body: createParams });
            const createResult = yield createResp.json();
            if (!createResult.encodedServiceURL && !createResult.serviceurl)
                throw new Error('Failed to create service: ' + JSON.stringify(createResult));
            const serviceUrl = createResult.encodedServiceURL || createResult.serviceurl;
            const tempItemId = createResult.itemId;
            const adminUrl = serviceUrl.replace('/rest/services/', '/rest/admin/services/');
            const addDefParams = new URLSearchParams();
            addDefParams.append('addToDefinition', JSON.stringify({ layers: [{ id: 0, name: 'AI Crash Risk', type: 'Feature Layer', geometryType: 'esriGeometryPolyline', displayField: 'routeid', fields, objectIdField: 'OBJECTID', hasAttachments: false, capabilities: 'Query,Editing,Create,Update,Delete' }] }));
            addDefParams.append('f', 'json');
            addDefParams.append('token', token);
            yield fetch(`${adminUrl}/addToDefinition`, { method: 'POST', body: addDefParams });
            // Upload features
            const features = segments.filter((_, idx) => normalizedScores[idx] > 0).map((seg) => {
                const idx = segments.indexOf(seg);
                const riskScore = normalizedScores[idx];
                const riskLevel = riskScore >= 75 ? 'High' : riskScore >= 40 ? 'Medium' : riskScore > 0 ? 'Low' : 'Minimal';
                const fctrs = Object.entries(seg.attrs).filter(([, v]) => v && String(v).trim()).slice(0, 5).map(([k, v]) => `${k}=${v}`).join('; ');
                return { geometry: { paths: [seg.path], spatialReference: { wkid } }, attributes: { routeid: seg.routeId, from_m: seg.fromM, to_m: seg.toM, crash_count: seg.crashCount, risk_score: riskScore, risk_level: riskLevel, contributing_factors: fctrs || 'Density cluster' } };
            });
            for (let i = 0; i < features.length; i += 1000) {
                const batch = features.slice(i, i + 1000);
                setProgress(`Uploading... ${Math.min(i + 1000, features.length)}/${features.length}`);
                const addFeatParams = new URLSearchParams();
                addFeatParams.append('features', JSON.stringify(batch));
                addFeatParams.append('f', 'json');
                addFeatParams.append('token', token);
                yield fetch(`${serviceUrl}/0/addFeatures`, { method: 'POST', body: addFeatParams });
            }
            // Share
            const shareParams = new URLSearchParams();
            shareParams.append('everyone', 'false');
            shareParams.append('org', 'true');
            shareParams.append('items', tempItemId);
            shareParams.append('f', 'json');
            shareParams.append('token', token);
            yield fetch(`${contentUrl}/items/${tempItemId}/share`, { method: 'POST', body: shareParams });
            setProgress('Displaying on map...');
            yield displayPredictionOnMap(`${serviceUrl}/0`, token, wkid);
            setResult({ layerUrl: serviceUrl, itemUrl: `${portalUrl}/home/item.html?id=${tempItemId}` });
            setProgress('');
        }
        catch (err) {
            console.error('[CrashRisk AI] Failed:', err);
            setError('AI prediction failed: ' + (err.message || err));
            setProgress('');
        }
        finally {
            setRunning(false);
        }
    }), [config, queryEventData, selectedFolderId, displayPredictionOnMap, displayCrashEventsOnMap]);
    // ==================== ML PREDICTION ====================
    const runMLPrediction = useCallback(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        setRunning(true);
        setProgress('');
        setResult(null);
        setShowExplanation(false);
        setModelInfo(null);
        setError(null);
        try {
            const session = jimu_core__WEBPACK_IMPORTED_MODULE_0__.SessionManager.getInstance().getMainSession();
            if (!session)
                throw new Error('Not signed in.');
            const token = session.token;
            const portalUrl = (session.portal || '').replace(/\/sharing\/rest\/?$/, '');
            const username = session.username;
            const view = (_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view;
            if (!view)
                throw new Error('No map view available.');
            const wkid = ((_b = view.spatialReference) === null || _b === void 0 ? void 0 : _b.wkid) || 102100;
            // Step 1: Query event data
            setProgress('Querying road attribute data from LRS...');
            const eventData = yield queryEventData();
            // Step 2: Segment routes
            setProgress('Segmenting routes at 0.5-mile intervals...');
            const routeGeometries = routeGeometriesRef.current;
            if (routeGeometries.size === 0)
                throw new Error('No route geometries. Select routes first.');
            const model = NY_STATE_CRASH_MODEL;
            // Build event lookup
            const eventLookup = new Map();
            const eventConfigs = config.eventLayerConfigs || [];
            for (const cfg of eventConfigs) {
                const layerEntries = eventData.filter(e => e.Feature === cfg.name);
                for (const entry of layerEntries) {
                    if (entry.RouteID == null || entry.Measure == null)
                        continue;
                    const rid = entry.RouteID;
                    if (!eventLookup.has(rid))
                        eventLookup.set(rid, new Map());
                    const mKey = Math.round(parseFloat(entry.Measure) * 2) / 2;
                    const routeMap = eventLookup.get(rid);
                    if (!routeMap.has(mKey))
                        routeMap.set(mKey, {});
                    const segData = routeMap.get(mKey);
                    for (const attr of (cfg.attributes || [])) {
                        if (entry[attr] != null && String(entry[attr]).trim()) {
                            segData[`${cfg.name}::${attr}`] = String(entry[attr]).trim();
                        }
                    }
                }
            }
            // Step 3: Score segments
            setProgress('Applying state crash model weights...');
            const segments = [];
            for (const [rid, rd] of routeGeometries.entries()) {
                const verts = rd.vertices;
                if (verts.length < 2)
                    continue;
                const startM = verts[0][rd.mIdx] || 0;
                const endM = verts[verts.length - 1][rd.mIdx] || 0;
                const totalLen = Math.abs(endM - startM);
                if (totalLen < 0.1)
                    continue;
                const numSegs = Math.ceil(totalLen / 0.5);
                for (let s = 0; s < numSegs; s++) {
                    const fromM = startM + s * 0.5;
                    const toM = Math.min(startM + (s + 1) * 0.5, endM);
                    const midM = (fromM + toM) / 2;
                    const mKey = Math.round(midM * 2) / 2;
                    const routeMap = eventLookup.get(rid);
                    const segAttrs = (routeMap === null || routeMap === void 0 ? void 0 : routeMap.get(mKey)) || {};
                    let compositeScore = 1.0;
                    const segFactors = [];
                    for (const [key, value] of Object.entries(segAttrs)) {
                        const layerName = key.split('::')[0];
                        const mapping = model.lrsMapping[layerName];
                        if (!mapping)
                            continue;
                        let weight = 1.0;
                        if (mapping.customWeights) {
                            const normalizedVal = value.replace(/[^0-9.]/g, '').split('.')[0];
                            weight = mapping.customWeights[normalizedVal] || mapping.customWeights[value] || 1.0;
                        }
                        else if (mapping.valueMap) {
                            const mappedCondition = mapping.valueMap[value];
                            if (mappedCondition) {
                                const stateCategory = model[mapping.stateField];
                                if (stateCategory && stateCategory[mappedCondition]) {
                                    weight = stateCategory[mappedCondition].weight;
                                }
                            }
                        }
                        if (weight !== 1.0) {
                            compositeScore *= weight;
                            if (weight > 1.2)
                                segFactors.push(`${layerName}: ${value} (${weight.toFixed(1)}x)`);
                        }
                    }
                    const riskScore = Math.min(Math.round(Math.log(compositeScore + 1) * 40), 100);
                    // Build path
                    const path = [];
                    for (const v of verts) {
                        const vm = v[rd.mIdx] || 0;
                        if (vm >= fromM && vm <= toM)
                            path.push([v[0], v[1]]);
                    }
                    if (path.length < 2) {
                        for (let i = 0; i < verts.length - 1; i++) {
                            const m1 = verts[i][rd.mIdx] || 0;
                            const m2 = verts[i + 1][rd.mIdx] || 0;
                            if (m1 <= fromM && m2 >= fromM) {
                                const t = (fromM - m1) / (m2 - m1 || 1);
                                path.push([verts[i][0] + t * (verts[i + 1][0] - verts[i][0]), verts[i][1] + t * (verts[i + 1][1] - verts[i][1])]);
                            }
                            if (m1 <= toM && m2 >= toM) {
                                const t = (toM - m1) / (m2 - m1 || 1);
                                path.push([verts[i][0] + t * (verts[i + 1][0] - verts[i][0]), verts[i][1] + t * (verts[i + 1][1] - verts[i][1])]);
                            }
                        }
                    }
                    if (path.length < 2)
                        continue;
                    const riskLevel = riskScore >= 75 ? 'High' : riskScore >= 40 ? 'Medium' : riskScore > 0 ? 'Low' : 'Minimal';
                    segments.push({ routeId: rid, fromM, toM, path, riskScore, riskLevel, contributingFactors: segFactors });
                }
            }
            if (segments.length === 0)
                throw new Error('No segments generated.');
            // Store model info
            const weightsSummary = {};
            for (const seg of segments) {
                for (const f of seg.contributingFactors) {
                    const match = f.match(/^(.+?): (.+?) \((.+?)x\)$/);
                    if (match) {
                        if (!weightsSummary[match[1]])
                            weightsSummary[match[1]] = {};
                        weightsSummary[match[1]][match[2]] = parseFloat(match[3]);
                    }
                }
            }
            setModelInfo({ weights: weightsSummary, totalCrashes: model.totalCrashes, years: model.years });
            // Step 4: Upload
            setProgress('Uploading state ML prediction layer...');
            const contentUrl = `${portalUrl}/sharing/rest/content/users/${username}`;
            const folderUrl = selectedFolderId ? `${contentUrl}/${selectedFolderId}` : contentUrl;
            const serviceName = `StateML_CrashRisk_${Date.now()}`;
            const fields = [
                { name: 'OBJECTID', type: 'esriFieldTypeOID', alias: 'ObjectID' },
                { name: 'routeid', type: 'esriFieldTypeString', alias: 'Route ID', length: 100 },
                { name: 'from_m', type: 'esriFieldTypeDouble', alias: 'From Measure' },
                { name: 'to_m', type: 'esriFieldTypeDouble', alias: 'To Measure' },
                { name: 'risk_score', type: 'esriFieldTypeInteger', alias: 'Risk Score (0-100)' },
                { name: 'risk_level', type: 'esriFieldTypeString', alias: 'Risk Level', length: 20 },
                { name: 'contributing_factors', type: 'esriFieldTypeString', alias: 'Contributing Factors', length: 500 },
                { name: 'model_confidence', type: 'esriFieldTypeString', alias: 'Model Confidence', length: 50 }
            ];
            const createParams = new URLSearchParams();
            createParams.append('createParameters', JSON.stringify({ name: serviceName, serviceDescription: 'Crash risk from NY state crash database ML model', hasStaticData: false, maxRecordCount: 10000, supportedQueryFormats: 'JSON', capabilities: 'Query,Editing', spatialReference: { wkid }, initialExtent: { xmin: -20037508, ymin: -20037508, xmax: 20037508, ymax: 20037508, spatialReference: { wkid } }, allowGeometryUpdates: true }));
            createParams.append('targetType', 'featureService');
            createParams.append('outputType', 'featureService');
            createParams.append('f', 'json');
            createParams.append('token', token);
            if (selectedFolderId)
                createParams.append('folderId', selectedFolderId);
            const createResp = yield fetch(`${folderUrl}/createService`, { method: 'POST', body: createParams });
            const createResult = yield createResp.json();
            if (!createResult.encodedServiceURL)
                throw new Error('Failed to create service: ' + JSON.stringify(createResult));
            const serviceUrl = createResult.encodedServiceURL;
            const tempItemId = createResult.itemId;
            const adminUrl = serviceUrl.replace('/rest/services/', '/rest/admin/services/');
            const addDefParams = new URLSearchParams();
            addDefParams.append('addToDefinition', JSON.stringify({ layers: [{ id: 0, name: 'State ML Risk', type: 'Feature Layer', geometryType: 'esriGeometryPolyline', displayField: 'routeid', fields, objectIdField: 'OBJECTID', hasAttachments: false, capabilities: 'Query,Editing,Create,Update,Delete' }] }));
            addDefParams.append('f', 'json');
            addDefParams.append('token', token);
            yield fetch(`${adminUrl}/addToDefinition`, { method: 'POST', body: addDefParams });
            const features = segments.filter(s => s.riskScore > 0).map(seg => ({
                geometry: { paths: [seg.path], spatialReference: { wkid } },
                attributes: { routeid: seg.routeId, from_m: seg.fromM, to_m: seg.toM, risk_score: seg.riskScore, risk_level: seg.riskLevel, contributing_factors: seg.contributingFactors.join('; '), model_confidence: `High (${model.totalCrashes.toLocaleString()} training crashes)` }
            }));
            for (let i = 0; i < features.length; i += 1000) {
                const batch = features.slice(i, i + 1000);
                setProgress(`Uploading... ${Math.min(i + 1000, features.length)}/${features.length}`);
                const addFeatParams = new URLSearchParams();
                addFeatParams.append('features', JSON.stringify(batch));
                addFeatParams.append('f', 'json');
                addFeatParams.append('token', token);
                yield fetch(`${serviceUrl}/0/addFeatures`, { method: 'POST', body: addFeatParams });
            }
            // Share
            const shareParams = new URLSearchParams();
            shareParams.append('everyone', 'false');
            shareParams.append('org', 'true');
            shareParams.append('items', tempItemId);
            shareParams.append('f', 'json');
            shareParams.append('token', token);
            yield fetch(`${contentUrl}/items/${tempItemId}/share`, { method: 'POST', body: shareParams });
            setProgress('Displaying on map...');
            yield displayPredictionOnMap(`${serviceUrl}/0`, token, wkid);
            setResult({ layerUrl: serviceUrl, itemUrl: `${portalUrl}/home/item.html?id=${tempItemId}` });
            setProgress('');
        }
        catch (err) {
            console.error('[StateML] Failed:', err);
            setError('ML prediction failed: ' + (err.message || err));
            setProgress('');
        }
        finally {
            setRunning(false);
        }
    }), [config, queryEventData, selectedFolderId, displayPredictionOnMap]);
    // ==================== RENDER ====================
    const routeSelectionUI = () => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '12px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e0e0e0' } },
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontSize: '12px', fontWeight: 600, marginBottom: '8px', color: '#333' } }, "Select Routes"),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', gap: '4px', marginBottom: '8px' } },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setSearchMode('id'), style: { flex: 1, padding: '5px', fontSize: '11px', border: searchMode === 'id' ? '2px solid #0079c1' : '1px solid #ccc', borderRadius: '4px', background: searchMode === 'id' ? '#e8f4fd' : '#fff', cursor: 'pointer' } }, "By Route ID"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setSearchMode('name'), style: { flex: 1, padding: '5px', fontSize: '11px', border: searchMode === 'name' ? '2px solid #0079c1' : '1px solid #ccc', borderRadius: '4px', background: searchMode === 'name' ? '#e8f4fd' : '#fff', cursor: 'pointer' } }, "By Name"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setSearchMode('map'), style: { flex: 1, padding: '5px', fontSize: '11px', border: searchMode === 'map' ? '2px solid #0079c1' : '1px solid #ccc', borderRadius: '4px', background: searchMode === 'map' ? '#e8f4fd' : '#fff', cursor: 'pointer' } }, "Draw Area")),
        (searchMode === 'id' || searchMode === 'name') && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", null,
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', gap: '4px', marginBottom: '4px' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "text", value: searchMode === 'id' ? routeId : routeName, onChange: e => handleRouteSearch(e.target.value), placeholder: searchMode === 'id' ? 'Route ID...' : 'Route name...', style: { flex: 1, padding: '6px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' } }),
                hasMapWidget && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: pickingFromMap ? cancelPickFromMap : startPickFromMap, style: { padding: '6px 10px', border: '1px solid #0079c1', borderRadius: '4px', background: pickingFromMap ? '#0079c1' : '#fff', color: pickingFromMap ? '#fff' : '#0079c1', cursor: 'pointer', fontSize: '11px' } }, pickingFromMap ? 'Cancel' : 'Pick'))),
            showSuggestions && routeSuggestions.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { border: '1px solid #ccc', borderRadius: '4px', maxHeight: '100px', overflow: 'auto', background: '#fff' } }, routeSuggestions.map((r, i) => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { key: i, onClick: () => selectRoute(r), style: { padding: '4px 8px', cursor: 'pointer', fontSize: '11px', borderBottom: '1px solid #eee' }, onMouseOver: e => (e.currentTarget.style.background = '#f0f0f0'), onMouseOut: e => (e.currentTarget.style.background = '#fff') },
                r.routeId,
                " ",
                r.routeName ? `(${r.routeName})` : ''))))),
            routePickCandidates && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { border: '1px solid #0079c1', borderRadius: '4px', padding: '8px', background: '#e8f4fd', marginTop: '4px' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontSize: '11px', fontWeight: 600, marginBottom: '4px' } }, "Multiple routes found \u2014 select one:"),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { maxHeight: '140px', overflow: 'auto' } }, routePickCandidates.map((c, i) => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { key: i, type: "button", onClick: () => { setRouteId(c.routeId); setRouteName(c.routeName); setRoutePickCandidates(null); fetchRouteMeasures(c.routeId); }, onMouseEnter: () => { showRoutePreviewRef.current(c.routeId); }, onMouseLeave: () => { clearRoutePreview(); }, style: { display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', marginBottom: '3px', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontWeight: 500 } }, c.routeName),
                    c.routeName !== c.routeId && jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: '#888', marginLeft: '8px' } }, c.routeId))))))),
            routeId && routeMeasureRange && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginTop: '8px', padding: '8px', background: '#fff', borderRadius: '4px', border: '1px solid #e0e0e0' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '11px', fontWeight: 600, color: '#333' } }, "Measure Range"),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => { setFromMeasure(routeMeasureRange.min.toFixed(3)); setToMeasure(routeMeasureRange.max.toFixed(3)); showMeasurePointRef.current('from', routeMeasureRange.min.toFixed(3)); showMeasurePointRef.current('to', routeMeasureRange.max.toFixed(3)); }, style: { padding: '3px 8px', border: '1px solid #0079c1', borderRadius: '3px', background: '#e8f4fd', color: '#0079c1', cursor: 'pointer', fontSize: '10px', fontWeight: 600 } }, "Whole Route")),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '4px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: { fontSize: '10px', color: '#666', display: 'block', marginBottom: '2px' } },
                        "From",
                        routeMeasureRange ? jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: '#aaa', marginLeft: '4px' } },
                            "(",
                            routeMeasureRange.min.toFixed(3),
                            ")") : null),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => { if (pickingMeasure === 'from')
                                cancelPickMeasure();
                            else
                                startPickMeasure('from'); }, title: pickingMeasure === 'from' ? 'Cancel' : 'Pick from map', style: { width: '28px', height: '28px', padding: 0, border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: pickingMeasure === 'from' ? '#fff3e0' : '#fff', flexShrink: 0, fontSize: '14px' } }, pickingMeasure === 'from' ? '\u2316' : '\u21A5'),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "number", value: fromMeasure, onChange: e => setFromMeasure(e.target.value), onBlur: () => { if (fromMeasure)
                                showMeasurePointRef.current('from', fromMeasure); }, onKeyDown: e => { if (e.key === 'Enter' && fromMeasure)
                                showMeasurePointRef.current('from', fromMeasure); }, style: { flex: 1, padding: '5px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }, placeholder: routeMeasureRange ? routeMeasureRange.min.toFixed(3) : 'Start' }))),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", null,
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: { fontSize: '10px', color: '#666', display: 'block', marginBottom: '2px' } },
                        "To",
                        routeMeasureRange ? jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: '#aaa', marginLeft: '4px' } },
                            "(",
                            routeMeasureRange.max.toFixed(3),
                            ")") : null),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => { if (pickingMeasure === 'to')
                                cancelPickMeasure();
                            else
                                startPickMeasure('to'); }, title: pickingMeasure === 'to' ? 'Cancel' : 'Pick from map', style: { width: '28px', height: '28px', padding: 0, border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: pickingMeasure === 'to' ? '#fff3e0' : '#fff', flexShrink: 0, fontSize: '14px' } }, pickingMeasure === 'to' ? '\u2316' : '\u21A5'),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "number", value: toMeasure, onChange: e => setToMeasure(e.target.value), onBlur: () => { if (toMeasure)
                                showMeasurePointRef.current('to', toMeasure); }, onKeyDown: e => { if (e.key === 'Enter' && toMeasure)
                                showMeasurePointRef.current('to', toMeasure); }, style: { flex: 1, padding: '5px 8px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '12px' }, placeholder: routeMeasureRange ? routeMeasureRange.max.toFixed(3) : 'End' }))))))),
        searchMode === 'map' && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", null,
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '6px' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: startDrawArea, disabled: drawing, style: { flex: 1, padding: '8px', border: '1px solid #0079c1', borderRadius: '4px', background: drawing ? '#e8f4fd' : '#fff', color: '#0079c1', cursor: 'pointer', fontSize: '12px', fontWeight: 500 } }, drawing ? 'Drawing... click to complete' : `Draw Polygon on Map${mapRoutes.length > 0 ? ` (${mapRoutes.length} routes)` : ''}`),
                mapRoutes.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => {
                        if (graphicsLayerRef.current)
                            graphicsLayerRef.current.removeAll();
                        if (routeGraphicsLayerRef.current)
                            routeGraphicsLayerRef.current.removeAll();
                        setMapRoutes([]);
                        setSelectedMapRouteIds(new Set());
                        setError(null);
                    }, style: { width: '32px', height: '32px', border: 'none', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffebee', cursor: 'pointer', flexShrink: 0 } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '16px', fontWeight: 'bold', color: '#c62828' } }, '\u00d7')))),
            mapRoutes.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginTop: '6px', fontSize: '12px', color: '#333' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null,
                        selectedMapRouteIds.size,
                        "/",
                        mapRoutes.length,
                        " route",
                        mapRoutes.length > 1 ? 's' : '',
                        " selected"),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', gap: '4px' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => {
                                var _a, _b;
                                setSelectedMapRouteIds(new Set(mapRoutes.map(r => r.routeId)));
                                if (routeGraphicsLayerRef.current)
                                    (_b = (_a = routeGraphicsLayerRef.current.graphics) === null || _a === void 0 ? void 0 : _a.toArray()) === null || _b === void 0 ? void 0 : _b.forEach((g) => { g.visible = true; });
                            }, style: { fontSize: '10px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', backgroundColor: '#f5f5f5' } }, "All"),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => {
                                var _a, _b;
                                setSelectedMapRouteIds(new Set());
                                if (routeGraphicsLayerRef.current)
                                    (_b = (_a = routeGraphicsLayerRef.current.graphics) === null || _a === void 0 ? void 0 : _a.toArray()) === null || _b === void 0 ? void 0 : _b.forEach((g) => { g.visible = false; });
                            }, style: { fontSize: '10px', padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer', backgroundColor: '#f5f5f5' } }, "None"))),
                (() => {
                    const classifyRoute = (r) => {
                        const name = (r.routeName || '').trim();
                        if (/^I\d/i.test(name) || /^0?I\d/i.test(name))
                            return 'Interstate';
                        if (/^US\s?\d/i.test(name))
                            return 'US Route';
                        if (/^NY\d/i.test(name) || /^SR\s?\d/i.test(name))
                            return 'State Route';
                        if (/^\d{3}[A-Z]/.test(name) || /to\s+(I|NY|US)\d/i.test(name) || /\b(NB|SB|EB|WB)\b/.test(name))
                            return 'Ramp';
                        if (!name || /^\d/.test(name) || /\b(ST|AVE|RD|DR|BLVD|PL|LN|CT|CIR|WAY|PKY|HWY)\b/i.test(name))
                            return 'Local';
                        return 'Local';
                    };
                    const typeGroups = new Map();
                    for (const r of mapRoutes) {
                        const type = classifyRoute(r);
                        const ids = typeGroups.get(type) || [];
                        ids.push(r.routeId);
                        typeGroups.set(type, ids);
                    }
                    if (typeGroups.size <= 1)
                        return null;
                    const typeOrder = ['Interstate', 'US Route', 'State Route', 'Ramp', 'Local'];
                    const typeColors = { Interstate: '#1565c0', 'US Route': '#c62828', 'State Route': '#2e7d32', Ramp: '#6a1b9a', Local: '#757575' };
                    return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' } }, typeOrder.filter(t => typeGroups.has(t)).map(type => {
                        const ids = typeGroups.get(type);
                        const allSelected = ids.every(id => selectedMapRouteIds.has(id));
                        const someSelected = ids.some(id => selectedMapRouteIds.has(id));
                        return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { key: type, type: "button", onClick: () => {
                                setSelectedMapRouteIds(prev => {
                                    var _a, _b;
                                    const next = new Set(prev);
                                    if (allSelected) {
                                        ids.forEach(id => next.delete(id));
                                    }
                                    else {
                                        ids.forEach(id => next.add(id));
                                    }
                                    if (routeGraphicsLayerRef.current) {
                                        (_b = (_a = routeGraphicsLayerRef.current.graphics) === null || _a === void 0 ? void 0 : _a.toArray()) === null || _b === void 0 ? void 0 : _b.forEach((g) => {
                                            var _a;
                                            if (ids.includes((_a = g.attributes) === null || _a === void 0 ? void 0 : _a.routeId))
                                                g.visible = !allSelected;
                                        });
                                    }
                                    return next;
                                });
                            }, style: {
                                fontSize: '10px', padding: '2px 8px', border: `1px solid ${typeColors[type] || '#999'}`,
                                borderRadius: '10px', cursor: 'pointer',
                                backgroundColor: allSelected ? (typeColors[type] || '#999') : someSelected ? '#e3f2fd' : '#fff',
                                color: allSelected ? '#fff' : (typeColors[type] || '#333'),
                                fontWeight: 600, lineHeight: '1.4'
                            }, title: `${allSelected ? 'Deselect' : 'Select'} all ${type} routes (${ids.length})` },
                            type,
                            " (",
                            ids.length,
                            ")"));
                    })));
                })(),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { maxHeight: '120px', overflow: 'auto', padding: '4px', border: '1px solid #e0e0e0', borderRadius: '4px' } }, mapRoutes.map((r, i) => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { key: i, style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '2px 0', cursor: 'pointer' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "checkbox", checked: selectedMapRouteIds.has(r.routeId), onChange: () => toggleMapRoute(r.routeId), style: { margin: 0 } }),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: selectedMapRouteIds.has(r.routeId) ? '#333' : '#999' } },
                        r.routeName ? `${r.routeName} (${r.routeId})` : r.routeId,
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: selectedMapRouteIds.has(r.routeId) ? '#666' : '#bbb', marginLeft: '6px' } },
                            "(M: ",
                            r.fromMeasure,
                            " - ",
                            r.toMeasure,
                            ")"))))))))))));
    // Result view
    const resultUI = () => {
        var _a, _b, _c;
        return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '12px' } },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { textAlign: 'center', marginBottom: '12px' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '36px' } }, '\u2705')),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: { fontSize: '13px', color: '#333', textAlign: 'center', margin: '0 0 12px' } }, "Prediction complete! Risk layer added to map."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '10px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '12px' } }, [{ color: '#388e3c', width: 3, label: 'Low (1-25)' }, { color: '#fbc02d', width: 3, label: 'Medium (26-50)' }, { color: '#f57c00', width: 4, label: 'Medium-High (51-75)' }, { color: '#d32f2f', width: 5, label: 'High (76-100)' }].map((item, i) => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: i < 3 ? '4px' : 0 } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { width: '20px', height: `${item.width}px`, background: item.color } }),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '11px' } }, item.label))))),
            (result === null || result === void 0 ? void 0 : result.itemUrl) && jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("a", { href: result.itemUrl, target: "_blank", rel: "noopener noreferrer", style: { display: 'block', textAlign: 'center', fontSize: '12px', color: '#0079c1', marginBottom: '12px' } }, "Open in Portal"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setShowExplanation(!showExplanation), style: { padding: '8px 16px', border: '1px solid #6a1b9a', borderRadius: '4px', background: showExplanation ? '#f3e5f5' : '#fff', color: '#6a1b9a', cursor: 'pointer', fontSize: '12px', fontWeight: 600 } }, showExplanation ? 'Hide' : 'Why?'),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: clearAll, style: { padding: '8px 16px', border: '1px solid #d32f2f', borderRadius: '4px', background: '#fff', color: '#d32f2f', cursor: 'pointer', fontSize: '12px', fontWeight: 600 } }, "Clear"),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => { setMode('choose'); setResult(null); setProgress(''); setShowExplanation(false); }, style: { padding: '8px 20px', border: 'none', borderRadius: '4px', background: '#6a1b9a', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 } }, "Done")),
            showExplanation && mode === 'ai' && factors && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', fontSize: '11px', maxHeight: '320px', overflowY: 'auto' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontWeight: 700, marginBottom: '8px' } }, "Risk Factor Analysis"),
                crashStats && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '10px', padding: '8px', background: '#fff3e0', borderRadius: '4px', borderLeft: '3px solid #e65100' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontWeight: 600, marginBottom: '4px' } },
                        "\uD83D\uDCCD ",
                        crashStats.totalCrashes,
                        " crash events analyzed"))),
                ((_a = crashStats === null || crashStats === void 0 ? void 0 : crashStats.topCorrelations) === null || _a === void 0 ? void 0 : _a.length) > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '10px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontWeight: 600, marginBottom: '6px' } }, "Top Contributing Factors:"),
                    crashStats.topCorrelations.slice(0, 2).map((c, i) => {
                        const icon = /curve|align/i.test(c.layer) ? '🔄' : /speed/i.test(c.layer) ? '⚡' : /grade|slope/i.test(c.layer) ? '⛰️' : /shoulder|width/i.test(c.layer) ? '📏' : /surface|pavement/i.test(c.layer) ? '🛣️' : /sign|signal/i.test(c.layer) ? '🚦' : /lane/i.test(c.layer) ? '🛤️' : /bridge|struct/i.test(c.layer) ? '🌉' : i === 0 ? '🔴' : '🟠';
                        return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', background: i === 0 ? '#fce4ec' : '#fff8e1', borderRadius: '4px', marginBottom: '4px' } },
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '18px' } }, icon),
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { flex: 1 } },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontWeight: 600, fontSize: '11px' } }, c.layer),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontSize: '10px', color: '#555' } }, c.value)),
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { textAlign: 'right' } },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontWeight: 700, fontSize: '13px', color: '#d32f2f' } },
                                    c.pct,
                                    "%"),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontSize: '9px', color: '#777' } }, "of high-risk"))));
                    }))),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '8px', fontSize: '10px', color: '#555' } },
                    "Kernel-density scoring (radius: ",
                    factors.kernelRadius,
                    " segments). Segments: ",
                    factors.totalSegments,
                    " total, ",
                    factors.segmentsWithCrashes,
                    " with crashes, ",
                    factors.highRiskCount,
                    " high-risk."),
                ((_b = factors.topHighRiskSegments) === null || _b === void 0 ? void 0 : _b.length) > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", null,
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "Top High-Risk Segments:"),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '4px' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("thead", null,
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("tr", { style: { background: '#eee' } },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("th", { style: { padding: '3px', textAlign: 'left' } }, "Route"),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("th", { style: { padding: '3px', textAlign: 'right' } }, "Miles"),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("th", { style: { padding: '3px', textAlign: 'right' } }, "Crashes"),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("th", { style: { padding: '3px', textAlign: 'right' } }, "Score"))),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("tbody", null, factors.topHighRiskSegments.slice(0, 5).map((s, i) => {
                            var _a, _b, _c;
                            return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("tr", { key: i },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("td", { style: { padding: '2px 3px' } }, (_a = s.routeId) === null || _a === void 0 ? void 0 : _a.substring(0, 15)),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("td", { style: { padding: '2px 3px', textAlign: 'right' } }, (_b = s.fromM) === null || _b === void 0 ? void 0 :
                                    _b.toFixed(1),
                                    "-", (_c = s.toM) === null || _c === void 0 ? void 0 :
                                    _c.toFixed(1)),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("td", { style: { padding: '2px 3px', textAlign: 'right' } }, s.crashCount),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("td", { style: { padding: '2px 3px', textAlign: 'right', color: '#d32f2f', fontWeight: 700 } }, s.riskScore)));
                        }))))))),
            showExplanation && mode === 'ml' && modelInfo && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginTop: '12px', padding: '12px', background: '#faf5fc', borderRadius: '6px', fontSize: '11px', maxHeight: '280px', overflowY: 'auto' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontWeight: 700, marginBottom: '8px', color: '#4a148c' } }, "State Data Model Explanation"),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '8px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "Method:"),
                    " Weight-of-Evidence scoring from ", (_c = modelInfo.totalCrashes) === null || _c === void 0 ? void 0 :
                    _c.toLocaleString(),
                    " real NY state crash records (",
                    modelInfo.years,
                    "). Each road condition gets a crash multiplier based on its statistical association with fatal crashes."),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '8px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "vs. AI (Density):"),
                    " AI finds existing hotspots. ML predicts ",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("em", null, "new"),
                    " risk from road characteristics alone \u2014 dangerous conditions where no crashes have been reported yet."),
                Object.keys(modelInfo.weights || {}).length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", null,
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "Top Risk Multipliers Found:"),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginTop: '4px' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("thead", null,
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("tr", { style: { background: '#eee' } },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("th", { style: { padding: '3px', textAlign: 'left' } }, "Factor"),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("th", { style: { padding: '3px', textAlign: 'left' } }, "Value"),
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("th", { style: { padding: '3px', textAlign: 'right' } }, "Weight"))),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("tbody", null, Object.entries(modelInfo.weights).flatMap(([field, vals]) => Object.entries(vals).map(([val, w]) => ({ field, val, w }))).filter((x) => x.w > 1.0).sort((a, b) => b.w - a.w).slice(0, 10).map((x, i) => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("tr", { key: i },
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("td", { style: { padding: '2px 3px' } }, x.field),
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("td", { style: { padding: '2px 3px', fontWeight: 600 } }, x.val),
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("td", { style: { padding: '2px 3px', textAlign: 'right', color: x.w >= 2 ? '#d32f2f' : '#f57c00', fontWeight: 700 } },
                                x.w.toFixed(1),
                                "x")))))))),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginTop: '8px', padding: '6px', background: '#fff3cd', borderRadius: '3px', fontSize: '10px', color: '#856404' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "Note:"),
                    " Segments with multiple high-weight factors compound (multiply). A curve + high speed + no shoulder = very high risk even with no local crash history.")))));
    };
    // Running state UI
    const runningUI = () => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '20px', textAlign: 'center' } },
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontSize: '11px', color: '#555', marginBottom: '8px' } }, progress),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { height: '4px', background: '#e0e0e0', borderRadius: '2px', overflow: 'hidden' } },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { height: '100%', background: mode === 'ai' ? '#7b1fa2' : '#6a1b9a', width: '60%', animation: 'pulse 1.5s infinite' } }))));
    // ==================== MAIN LAYOUT ====================
    return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto', fontSize: '13px', padding: '12px', boxSizing: 'border-box' } },
        hasMapWidget && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__.JimuMapViewComponent, { useMapWidgetId: ((_b = props.useMapWidgetIds) === null || _b === void 0 ? void 0 : _b[0]) || ((_d = (_c = props.useMapWidgetIds) === null || _c === void 0 ? void 0 : _c.first) === null || _d === void 0 ? void 0 : _d.call(_c)), onActiveViewChange: onActiveViewChange })),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("h5", { style: { margin: '0 0 12px', fontSize: '14px', fontWeight: 600 } },
            "Crash Risk Prediction ",
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '10px', fontWeight: 400, color: '#999' } }, "(v2026.05.14 09:15)")),
        error && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '8px', padding: '8px 10px', background: '#ffebee', borderRadius: '4px', fontSize: '11px', color: '#c62828' } },
            error,
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setError(null), style: { float: 'right', background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 700 } }, '\u00D7'))),
        mode === 'choose' && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '16px', background: '#f3e5f5', borderRadius: '8px', border: '1px solid #ce93d8' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '20px' } }, '\uD83E\uDDE0'),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '14px', fontWeight: 700, color: '#4a148c' } }, "AI Prediction")),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setShowAIHelp(!showAIHelp), style: { width: '24px', height: '24px', border: '1px solid #7b1fa2', borderRadius: '50%', background: showAIHelp ? '#7b1fa2' : '#fff', color: showAIHelp ? '#fff' : '#7b1fa2', cursor: 'pointer', fontSize: '13px', fontWeight: 700, lineHeight: '22px', textAlign: 'center', padding: 0 } }, "?")),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: { fontSize: '11px', color: '#666', margin: '0 0 10px' } }, "Kernel-density scoring from crash clusters + road attributes"),
                showAIHelp && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '10px', background: '#fff', borderRadius: '4px', fontSize: '11px', lineHeight: '1.7', marginBottom: '10px', border: '1px solid #e1bee7' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "How it works:"),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "1. You select routes (by ID, name, map click, or draw area)",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "2. The widget queries ",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("em", null, "crash events"),
                    " and ",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("em", null, "road attribute events"),
                    " from your LRS",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "3. Routes are divided into 0.5-mile segments",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "4. Crash counts per segment are computed",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "5. A kernel-density algorithm spreads influence from high-crash segments to neighbors",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "6. Road attributes (curves, grades, etc.) enrich the analysis",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "7. A color-coded risk layer is published to your portal and added to the map",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "Best for:"),
                    " Finding existing crash hotspots and nearby risk zones.")),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setMode('ai'), style: { width: '100%', padding: '10px', border: 'none', borderRadius: '4px', background: '#7b1fa2', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 } }, "Run AI Prediction")),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '16px', background: '#ede7f6', borderRadius: '8px', border: '1px solid #b39ddb' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '20px' } }, '\uD83D\uDCCA'),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '14px', fontWeight: 700, color: '#311b92' } }, "ML Prediction")),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setShowMLHelp(!showMLHelp), style: { width: '24px', height: '24px', border: '1px solid #6a1b9a', borderRadius: '50%', background: showMLHelp ? '#6a1b9a' : '#fff', color: showMLHelp ? '#fff' : '#6a1b9a', cursor: 'pointer', fontSize: '13px', fontWeight: 700, lineHeight: '22px', textAlign: 'center', padding: 0 } }, "?")),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: { fontSize: '11px', color: '#666', margin: '0 0 10px' } }, "Pre-computed weights from 1.5M NY State crash records"),
                showMLHelp && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '10px', background: '#fff', borderRadius: '4px', fontSize: '11px', lineHeight: '1.7', marginBottom: '10px', border: '1px solid #d1c4e9' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "How it works:"),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "1. You select routes (by ID, name, map click, or draw area)",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "2. The widget queries ",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("em", null, "road characteristic events"),
                    " from your LRS (curves, grades, speed limits, lane counts, shoulders, etc.)",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "3. Each 0.5-mile segment's road conditions are matched to pre-computed risk multipliers from 1,525,123 real NY state crash records",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "4. Factors compound \u2014 a curve + high speed + no shoulder = very high risk",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    "5. A color-coded prediction layer is published and added to the map",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("br", null),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, "Best for:"),
                    " Predicting ",
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("em", null, "new"),
                    " risk from road characteristics alone \u2014 finding dangerous conditions even where no crashes have been reported yet.")),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setMode('ml'), style: { width: '100%', padding: '10px', border: 'none', borderRadius: '4px', background: '#6a1b9a', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 } }, "Run ML Prediction")))),
        (mode === 'ai' || mode === 'ml') && !result && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => { setMode('choose'); setError(null); setProgress(''); }, disabled: running, style: { alignSelf: 'flex-start', padding: '4px 10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#555' } },
                '\u2190',
                " Back"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '8px 12px', background: mode === 'ai' ? '#f3e5f5' : '#ede7f6', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: mode === 'ai' ? '#4a148c' : '#311b92' } }, mode === 'ai' ? '\uD83E\uDDE0 AI Prediction' : '\uD83D\uDCCA ML Prediction'),
            !running && routeSelectionUI(),
            !running && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: mode === 'ai' ? runAIPrediction : runMLPrediction, disabled: running || (searchMode !== 'map' && !routeId.trim()) || (searchMode === 'map' && selectedMapRouteIds.size === 0), style: { width: '100%', padding: '12px', border: 'none', borderRadius: '4px', background: (running || (searchMode !== 'map' && !routeId.trim()) || (searchMode === 'map' && selectedMapRouteIds.size === 0)) ? '#aaa' : (mode === 'ai' ? '#7b1fa2' : '#6a1b9a'), color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 } }, mode === 'ai' ? 'Run AI Prediction' : 'Run ML Prediction')),
            running && runningUI())),
        result && resultUI()));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Widget);
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jcmFzaC1yaXNrL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxZQUFZLEdBQUcsQ0FBQztBQUVwQjs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBRSxHQUFXLEVBQUUsTUFBOEI7SUFDaEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLFlBQVksR0FBRyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxZQUFZLEVBQUUsRUFBRTtRQUM5RCxNQUFNLENBQUMsUUFBUSxHQUFHLFlBQVk7UUFFOUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2pELE1BQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUVoQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLE9BQVEsTUFBYyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLE1BQU0sQ0FBQyxVQUFVO2dCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxDQUFDLENBRUE7UUFBQyxNQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUM3QyxPQUFPLEVBQUU7WUFDVCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FB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TSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNyQyxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDOzRCQUM3QixNQUFNLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEQsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsTUFBSzt3QkFDUCxDQUFDO29CQUNILENBQUM7b0JBQ0QsTUFBTSxJQUFJLEdBQWUsRUFBRTtvQkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzdDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3JDLElBQUksRUFBRSxHQUFHLE9B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SSxLQUFLLEVBQUUsQ0FBQztnQ0FDL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILENBQUM7NEJBQ0QsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQ0FDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENB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QUFJLENBQUMsVUFBVSxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUNqaEIsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUNuRCxDQUNWO1lBR0EsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUNuQixDQUNQO1FBR0EsTUFBTSxJQUFJLFFBQVEsRUFBRSxDQUNqQixDQUNQO0FBQ0gsQ0FBQztBQUVELGlFQUFlLE1BQU07QUFFYixTQUFTLDJCQUEyQixDQUFDLEdBQUcsSUFBSSxxQkFBdUIsR0FBRyxHQUFHLEVBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9scnMtdXRpbHMvbHJzLXNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWFyY2dpc1wiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9ydW50aW1lL3dpZGdldC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gTFJTIFJFU1QgQVBJIFNlcnZpY2Ugd3JhcHBlclxyXG4vLyBVc2VzIEpTT05QIHRvIGJ5cGFzcyBDT1JTIGlzc3VlcyB3aXRoIG1pc2NvbmZpZ3VyZWQgc2VydmVycyAoZHVwbGljYXRlIEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiBoZWFkZXJzKVxyXG5pbXBvcnQgdHlwZSB7XHJcbiAgTHJzU2VydmljZUluZm8sXHJcbiAgTmV0d29ya0xheWVySW5mbyxcclxuICBFdmVudExheWVySW5mbyxcclxuICBNZWFzdXJlVG9HZW9tZXRyeUxvY2F0aW9uLFxyXG4gIE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0LFxyXG4gIEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0LFxyXG4gIFF1ZXJ5QXR0cmlidXRlU2V0UGFyYW1zLFxyXG4gIEZlYXR1cmVTZXRSZXN1bHRcclxufSBmcm9tICcuL3R5cGVzJ1xyXG5cclxubGV0IGpzb25wQ291bnRlciA9IDBcclxuXHJcbi8qKlxyXG4gKiBKU09OUCByZXF1ZXN0IOKAlCBieXBhc3NlcyBDT1JTIGVudGlyZWx5IGJ5IGluamVjdGluZyBhIDxzY3JpcHQ+IHRhZy5cclxuICogQXJjR0lTIFJFU1QgQVBJIHN1cHBvcnRzIEpTT05QIHZpYSB0aGUgJ2NhbGxiYWNrJyBwYXJhbWV0ZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBqc29ucFJlcXVlc3QgKHVybDogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPGFueT4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCBjYWxsYmFja05hbWUgPSBgX2xyc19jYl8ke0RhdGUubm93KCl9XyR7anNvbnBDb3VudGVyKyt9YFxyXG4gICAgcGFyYW1zLmNhbGxiYWNrID0gY2FsbGJhY2tOYW1lXHJcblxyXG4gICAgY29uc3QgcXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykudG9TdHJpbmcoKVxyXG4gICAgY29uc3Qgc2NyaXB0VXJsID0gYCR7dXJsfT8ke3FzfWBcclxuXHJcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxyXG4gICAgc2NyaXB0LnNyYyA9IHNjcmlwdFVybFxyXG5cclxuICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XHJcbiAgICAgIGRlbGV0ZSAod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXVxyXG4gICAgICBpZiAoc2NyaXB0LnBhcmVudE5vZGUpIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdClcclxuICAgIH1cclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlIHx8ICdSZXF1ZXN0IGVycm9yJykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdKU09OUCByZXF1ZXN0IGZhaWxlZCcpKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICgod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSkge1xyXG4gICAgICAgIGNsZWFudXAoKVxyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKVxyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMClcclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcilcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yLm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZXJyb3InKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcclxuICB9KVxyXG59XHJcblxyXG4vKipcclxuICogV3JhcHBlciBhcm91bmQgQXJjR0lTIExSUyBSRVNUIEFQSSAoTFJTZXJ2ZXIgZXh0ZW5zaW9uKS5cclxuICogVXNlcyBKU09OUCBmb3IgYWxsIHJlcXVlc3RzIHRvIGF2b2lkIENPUlMgaXNzdWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExyc1NlcnZpY2Uge1xyXG4gIHByaXZhdGUgYmFzZVVybDogc3RyaW5nXHJcbiAgcHJpdmF0ZSB0b2tlbjogc3RyaW5nIHwgbnVsbFxyXG5cclxuICBjb25zdHJ1Y3RvciAoYmFzZVVybDogc3RyaW5nLCB0b2tlbj86IHN0cmluZykge1xyXG4gICAgLy8gRW5zdXJlIG5vIHRyYWlsaW5nIHNsYXNoXHJcbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgJycpXHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW4gfHwgbnVsbFxyXG4gIH1cclxuXHJcbiAgc2V0VG9rZW4gKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggTFJTIHNlcnZpY2UgbWV0YWRhdGEgKG5ldHdvcmsgbGF5ZXJzLCBldmVudCBsYXllcnMsIGV0Yy4pXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0U2VydmljZUluZm8gKCk6IFByb21pc2U8THJzU2VydmljZUluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8THJzU2VydmljZUluZm8+KCcnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggZGV0YWlsZWQgaW5mbyBmb3IgYSBuZXR3b3JrIGxheWVyIChmaWVsZHMsIG1lYXN1cmUgcHJlY2lzaW9uLCBldGMuKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldE5ldHdvcmtMYXllckluZm8gKGxheWVySWQ6IG51bWJlcik6IFByb21pc2U8TmV0d29ya0xheWVySW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxOZXR3b3JrTGF5ZXJJbmZvPihgL25ldHdvcmtMYXllcnMvJHtsYXllcklkfWApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBkZXRhaWxlZCBpbmZvIGZvciBhbiBldmVudCBsYXllclxyXG4gICAqL1xyXG4gIGFzeW5jIGdldEV2ZW50TGF5ZXJJbmZvIChsYXllcklkOiBudW1iZXIpOiBQcm9taXNlPEV2ZW50TGF5ZXJJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEV2ZW50TGF5ZXJJbmZvPihgL2V2ZW50TGF5ZXJzLyR7bGF5ZXJJZH1gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCByb3V0ZSBJRCArIG1lYXN1cmVzIHRvIG1hcCBnZW9tZXRyeVxyXG4gICAqL1xyXG4gIGFzeW5jIG1lYXN1cmVUb0dlb21ldHJ5IChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBsb2NhdGlvbnM6IE1lYXN1cmVUb0dlb21ldHJ5TG9jYXRpb25bXSxcclxuICAgIG91dFNSPzogYW55XHJcbiAgKTogUHJvbWlzZTxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4ge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucyksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKG91dFNSKSB7XHJcbiAgICAgIHBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KG91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9tZWFzdXJlVG9HZW9tZXRyeWAsXHJcbiAgICAgIHBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBtYXAgZ2VvbWV0cnkgKHBvaW50KSB0byByb3V0ZSArIG1lYXN1cmVcclxuICAgKi9cclxuICBhc3luYyBnZW9tZXRyeVRvTWVhc3VyZSAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgbG9jYXRpb25zOiBBcnJheTx7IGdlb21ldHJ5OiBhbnkgfT4sXHJcbiAgICBvdXRTUj86IGFueVxyXG4gICk6IFByb21pc2U8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChvdXRTUikge1xyXG4gICAgICBwYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShvdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vZ2VvbWV0cnlUb01lYXN1cmVgLFxyXG4gICAgICBwYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIER5bmFtaWMgc2VnbWVudGF0aW9uIG92ZXJsYXkg4oCUIHF1ZXJ5QXR0cmlidXRlU2V0XHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlBdHRyaWJ1dGVTZXQgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIHBhcmFtczogUXVlcnlBdHRyaWJ1dGVTZXRQYXJhbXNcclxuICApOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmxvY2F0aW9ucyksXHJcbiAgICAgIGF0dHJpYnV0ZVNldDogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmF0dHJpYnV0ZVNldCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHBhcmFtcy5vdXRTUikge1xyXG4gICAgICByZXF1ZXN0UGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zLm91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxGZWF0dXJlU2V0UmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L3F1ZXJ5QXR0cmlidXRlU2V0YCxcclxuICAgICAgcmVxdWVzdFBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhbmRhcmQgZmVhdHVyZSBxdWVyeSBhZ2FpbnN0IGEgbWFwIHNlcnZpY2UgbGF5ZXIgKGZvciBSb2FkIExvZyBpbmRpdmlkdWFsIGV2ZW50IHF1ZXJpZXMpXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlcyAoXHJcbiAgICBtYXBTZXJ2aWNlVXJsOiBzdHJpbmcsXHJcbiAgICBsYXllcklkOiBudW1iZXIsXHJcbiAgICB3aGVyZTogc3RyaW5nLFxyXG4gICAgb3V0RmllbGRzOiBzdHJpbmdbXSA9IFsnKiddXHJcbiAgKTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICAvLyBUaGUgbWFwIHNlcnZpY2UgVVJMIGlzIHRoZSBwYXJlbnQgb2YgTFJTZXJ2ZXIgZXh0ZW5zaW9uXHJcbiAgICAvLyBlLmcuIC4uLi9NYXBTZXJ2ZXIvMC9xdWVyeVxyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IHRoaXMuYmFzZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtsYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIHdoZXJlLFxyXG4gICAgICBvdXRGaWVsZHM6IG91dEZpZWxkcy5qb2luKCcsJyksXHJcbiAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlyZWN0IHF1ZXJ5IHdpdGggYXJiaXRyYXJ5IHBhcmFtcyAoZm9yIHNwYXRpYWwgcXVlcmllcyB2aWEgSlNPTlApXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlc0RpcmVjdCAodXJsOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG4gICAgcGFyYW1zLmYgPSBwYXJhbXMuZiB8fCAnanNvbidcclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBRdWVyeSByb3V0ZXMgb24gYSBuZXR3b3JrIGxheWVyIChmb3Igcm91dGUgcGlja2VyIGF1dG9jb21wbGV0ZSlcclxuICAgKi9cclxuICBhc3luYyBxdWVyeVJvdXRlcyAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgc2VhcmNoVGV4dDogc3RyaW5nLFxyXG4gICAgcm91dGVJZEZpZWxkOiBzdHJpbmcsXHJcbiAgICByb3V0ZU5hbWVGaWVsZDogc3RyaW5nIHwgbnVsbCxcclxuICAgIG1heFJlc3VsdHM6IG51bWJlciA9IDEwXHJcbiAgKTogUHJvbWlzZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0+PiB7XHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gdGhpcy5iYXNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke25ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBzZWFyY2hGaWVsZCA9IHJvdXRlTmFtZUZpZWxkIHx8IHJvdXRlSWRGaWVsZFxyXG4gICAgY29uc3Qgd2hlcmUgPSBgVVBQRVIoJHtzZWFyY2hGaWVsZH0pIExJS0UgVVBQRVIoJyR7c2VhcmNoVGV4dC5yZXBsYWNlKC8nL2csIFwiJydcIil9JScpYFxyXG4gICAgY29uc3Qgb3V0RmllbGRzID0gcm91dGVOYW1lRmllbGRcclxuICAgICAgPyBbcm91dGVJZEZpZWxkLCByb3V0ZU5hbWVGaWVsZF1cclxuICAgICAgOiBbcm91dGVJZEZpZWxkXVxyXG5cclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgd2hlcmUsXHJcbiAgICAgIG91dEZpZWxkczogb3V0RmllbGRzLmpvaW4oJywnKSxcclxuICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgIHJlc3VsdFJlY29yZENvdW50OiBtYXhSZXN1bHRzLnRvU3RyaW5nKCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGpzb24gPSBhd2FpdCBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcblxyXG4gICAgY29uc3QgYWxsID0gKGpzb24uZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVJZEZpZWxkXSxcclxuICAgICAgcm91dGVOYW1lOiByb3V0ZU5hbWVGaWVsZCA/IGYuYXR0cmlidXRlc1tyb3V0ZU5hbWVGaWVsZF0gOiBudWxsXHJcbiAgICB9KSlcclxuICAgIC8vIERlZHVwbGljYXRlIGJ5IHJvdXRlSWRcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxyXG4gICAgcmV0dXJuIGFsbC5maWx0ZXIoKHI6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoc2Vlbi5oYXMoci5yb3V0ZUlkKSkgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHNlZW4uYWRkKHIucm91dGVJZClcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvLyAtLS0gUHJpdmF0ZSBoZWxwZXJzIC0tLVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHJlcXVlc3Q8VD4gKHBhdGg6IHN0cmluZywgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8VD4ge1xyXG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfSR7cGF0aH1gXHJcbiAgICBjb25zdCBhbGxQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGY6ICdqc29uJyxcclxuICAgICAgLi4ucGFyYW1zXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBhbGxQYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIGFsbFBhcmFtcykgYXMgUHJvbWlzZTxUPlxyXG4gIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9hcmNnaXNfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCIvKiogQGpzeFJ1bnRpbWUgY2xhc3NpYyAqL1xyXG5pbXBvcnQgeyBSZWFjdCwgdHlwZSBBbGxXaWRnZXRQcm9wcywgU2Vzc2lvbk1hbmFnZXIgfSBmcm9tICdqaW11LWNvcmUnXHJcbmltcG9ydCB7IEppbXVNYXBWaWV3Q29tcG9uZW50LCB0eXBlIEppbXVNYXBWaWV3IH0gZnJvbSAnamltdS1hcmNnaXMnXHJcbmltcG9ydCB0eXBlIHsgSU1Db25maWcgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IExyc1NlcnZpY2UgfSBmcm9tICcuLi9scnMtdXRpbHMvbHJzLXNlcnZpY2UnXHJcblxyXG5jb25zdCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSA9IFJlYWN0XHJcblxyXG50eXBlIFdvcmtmbG93TW9kZSA9ICdjaG9vc2UnIHwgJ2FpJyB8ICdtbCdcclxuXHJcbmNvbnN0IFdpZGdldCA9IChwcm9wczogQWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+KSA9PiB7XHJcbiAgY29uc3QgY29uZmlnID0gcHJvcHMuY29uZmlnXHJcbiAgY29uc3QgaGFzTWFwV2lkZ2V0ID0gQm9vbGVhbihwcm9wcy51c2VNYXBXaWRnZXRJZHMgJiYgKChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KS5sZW5ndGggPiAwIHx8IChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uc2l6ZSA+IDApKVxyXG5cclxuICAvLyBXb3JrZmxvdyBzdGF0ZVxyXG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPFdvcmtmbG93TW9kZT4oJ2Nob29zZScpXHJcbiAgY29uc3QgW3Nob3dBSUhlbHAsIHNldFNob3dBSUhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3Nob3dNTEhlbHAsIHNldFNob3dNTEhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcblxyXG4gIC8vIFJvdXRlIHNlbGVjdGlvbiBzdGF0ZVxyXG4gIGNvbnN0IFtyb3V0ZUlkLCBzZXRSb3V0ZUlkXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtyb3V0ZU5hbWUsIHNldFJvdXRlTmFtZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbZnJvbU1lYXN1cmUsIHNldEZyb21NZWFzdXJlXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFt0b01lYXN1cmUsIHNldFRvTWVhc3VyZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbcm91dGVNZWFzdXJlUmFuZ2UsIHNldFJvdXRlTWVhc3VyZVJhbmdlXSA9IHVzZVN0YXRlPHsgbWluOiBudW1iZXI7IG1heDogbnVtYmVyIH0gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzZWFyY2hNb2RlLCBzZXRTZWFyY2hNb2RlXSA9IHVzZVN0YXRlPCdpZCcgfCAnbmFtZScgfCAnbWFwJz4oJ2lkJylcclxuICBjb25zdCBbcm91dGVTdWdnZXN0aW9ucywgc2V0Um91dGVTdWdnZXN0aW9uc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0+PihbXSlcclxuICBjb25zdCBbc2hvd1N1Z2dlc3Rpb25zLCBzZXRTaG93U3VnZ2VzdGlvbnNdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3BpY2tpbmdGcm9tTWFwLCBzZXRQaWNraW5nRnJvbU1hcF0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbcGlja2luZ01lYXN1cmUsIHNldFBpY2tpbmdNZWFzdXJlXSA9IHVzZVN0YXRlPCdmcm9tJyB8ICd0bycgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtkcmF3aW5nLCBzZXREcmF3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFttYXBSb3V0ZXMsIHNldE1hcFJvdXRlc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsOyBmcm9tTWVhc3VyZTogbnVtYmVyOyB0b01lYXN1cmU6IG51bWJlciB9Pj4oW10pXHJcbiAgY29uc3QgW3NlbGVjdGVkTWFwUm91dGVJZHMsIHNldFNlbGVjdGVkTWFwUm91dGVJZHNdID0gdXNlU3RhdGU8U2V0PHN0cmluZz4+KG5ldyBTZXQoKSlcclxuICBjb25zdCBbcm91dGVQaWNrQ2FuZGlkYXRlcywgc2V0Um91dGVQaWNrQ2FuZGlkYXRlc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfT4gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzZWxlY3RlZEZvbGRlcklkLCBzZXRTZWxlY3RlZEZvbGRlcklkXSA9IHVzZVN0YXRlPHN0cmluZz4oJycpXHJcblxyXG4gIC8vIFByZWRpY3Rpb24gc3RhdGVcclxuICBjb25zdCBbcnVubmluZywgc2V0UnVubmluZ10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbcHJvZ3Jlc3MsIHNldFByb2dyZXNzXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbcmVzdWx0LCBzZXRSZXN1bHRdID0gdXNlU3RhdGU8eyBsYXllclVybD86IHN0cmluZzsgaXRlbVVybD86IHN0cmluZyB9IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbc2hvd0V4cGxhbmF0aW9uLCBzZXRTaG93RXhwbGFuYXRpb25dID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW2ZhY3RvcnMsIHNldEZhY3RvcnNdID0gdXNlU3RhdGU8YW55PihudWxsKVxyXG4gIGNvbnN0IFttb2RlbEluZm8sIHNldE1vZGVsSW5mb10gPSB1c2VTdGF0ZTxhbnk+KG51bGwpXHJcbiAgY29uc3QgW2NyYXNoU3RhdHMsIHNldENyYXNoU3RhdHNdID0gdXNlU3RhdGU8eyB0b3RhbENyYXNoZXM6IG51bWJlcjsgdG9wQ29ycmVsYXRpb25zOiBBcnJheTx7IGxheWVyOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmc7IGNvdW50OiBudW1iZXI7IHBjdDogbnVtYmVyIH0+IH0gfCBudWxsPihudWxsKVxyXG5cclxuICAvLyBSZWZzXHJcbiAgY29uc3QgamltdU1hcFZpZXdSZWYgPSB1c2VSZWY8SmltdU1hcFZpZXcgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IGxyc1NlcnZpY2VSZWYgPSB1c2VSZWY8THJzU2VydmljZSB8IG51bGw+KG51bGwpXHJcbiAgY29uc3Qgcm91dGVHZW9tZXRyaWVzUmVmID0gdXNlUmVmPE1hcDxzdHJpbmcsIHsgdmVydGljZXM6IG51bWJlcltdW107IG1JZHg6IG51bWJlciB9Pj4obmV3IE1hcCgpKVxyXG4gIGNvbnN0IHBpY2tIYW5kbGVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBwaWNrSG92ZXJIYW5kbGVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBwaWNrVG9vbHRpcFJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudCB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgcGlja1NuYXBHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBwaWNrSG92ZXJUaW1lb3V0UmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBza2V0Y2hWTVJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgZ3JhcGhpY3NMYXllclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3Qgcm91dGVHcmFwaGljc0xheWVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBzZWFyY2hUaW1lb3V0UmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICAvLyBSb3V0ZSBwcmV2aWV3ICsgbWVhc3VyZSBwaWNraW5nIHJlZnNcclxuICBjb25zdCByb3V0ZVByZXZpZXdHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCByb3V0ZVByZXZpZXdMYXllclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgZnJvbU1lYXN1cmVHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCB0b01lYXN1cmVHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCByb3V0ZVByZXZpZXdWZXJ0c1JlZiA9IHVzZVJlZjx7IHZlcnRpY2VzOiBudW1iZXJbXVtdOyBtSWR4OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgbWVhc3VyZVBpY2tIYW5kbGVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBtZWFzdXJlUGlja0hvdmVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBtZWFzdXJlU25hcEdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IG1lYXN1cmVUb29sdGlwUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBzaG93Um91dGVQcmV2aWV3UmVmID0gdXNlUmVmPChyaWQ6IHN0cmluZykgPT4gdm9pZD4oKCkgPT4ge30pXHJcbiAgY29uc3Qgc2hvd01lYXN1cmVQb2ludFJlZiA9IHVzZVJlZjwod2hpY2g6ICdmcm9tJyB8ICd0bycsIG1lYXN1cmVWYWw6IHN0cmluZykgPT4gdm9pZD4oKCkgPT4ge30pXHJcbiAgY29uc3QgY3Jhc2hFdmVudHNMYXllclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcHJlZGljdGlvbkxheWVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBMcnNTZXJ2aWNlIChKU09OUC1iYXNlZCwgYnlwYXNzZXMgQ09SUylcclxuICAvLyBDYWNoZSBkaXNjb3ZlcmVkIHJvdXRlSWRGaWVsZE5hbWUgcGVyIGV2ZW50IGxheWVyIGZyb20gTFJTIG1ldGFkYXRhXHJcbiAgY29uc3QgZXZlbnRGaWVsZE5hbWVzUmVmID0gdXNlUmVmPE1hcDxudW1iZXIsIHsgcm91dGVJZEZpZWxkOiBzdHJpbmc7IG1lYXN1cmVGaWVsZDogc3RyaW5nOyBmcm9tTWVhc3VyZUZpZWxkOiBzdHJpbmc7IHRvTWVhc3VyZUZpZWxkOiBzdHJpbmcgfT4+KG5ldyBNYXAoKSlcclxuXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChjb25maWc/Lmxyc1NlcnZpY2VVcmwpIHtcclxuICAgICAgbHJzU2VydmljZVJlZi5jdXJyZW50ID0gbmV3IExyc1NlcnZpY2UoY29uZmlnLmxyc1NlcnZpY2VVcmwpXHJcblxyXG4gICAgICAvLyBEaXNjb3ZlciBjb3JyZWN0IGZpZWxkIG5hbWVzIGZyb20gTFJTIGV2ZW50IGxheWVyIG1ldGFkYXRhXHJcbiAgICAgIGNvbnN0IGxycyA9IGxyc1NlcnZpY2VSZWYuY3VycmVudFxyXG4gICAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuICAgICAgZm9yIChjb25zdCBjZmcgb2YgZXZlbnRDb25maWdzKSB7XHJcbiAgICAgICAgbHJzLmdldEV2ZW50TGF5ZXJJbmZvKGNmZy5sYXllcklkKS50aGVuKChkZXRhaWw6IGFueSkgPT4ge1xyXG4gICAgICAgICAgZXZlbnRGaWVsZE5hbWVzUmVmLmN1cnJlbnQuc2V0KGNmZy5sYXllcklkLCB7XHJcbiAgICAgICAgICAgIHJvdXRlSWRGaWVsZDogZGV0YWlsLnJvdXRlSWRGaWVsZE5hbWUgfHwgY2ZnLnJvdXRlSWRGaWVsZCB8fCAncm91dGVpZCcsXHJcbiAgICAgICAgICAgIG1lYXN1cmVGaWVsZDogZGV0YWlsLm1lYXN1cmVGaWVsZE5hbWUgfHwgY2ZnLm1lYXN1cmVGaWVsZCB8fCAnbWVhc3VyZScsXHJcbiAgICAgICAgICAgIGZyb21NZWFzdXJlRmllbGQ6IGRldGFpbC5mcm9tTWVhc3VyZUZpZWxkTmFtZSB8fCBjZmcuZnJvbU1lYXN1cmVGaWVsZCB8fCAnZnJvbV9tZWFzdXJlJyxcclxuICAgICAgICAgICAgdG9NZWFzdXJlRmllbGQ6IGRldGFpbC50b01lYXN1cmVGaWVsZE5hbWUgfHwgY2ZnLnRvTWVhc3VyZUZpZWxkIHx8ICd0b19tZWFzdXJlJ1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KS5jYXRjaCgoKSA9PiB7IC8qIHVzZSBjb25maWcgZGVmYXVsdHMgKi8gfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWc/Lmxyc1NlcnZpY2VVcmxdKVxyXG5cclxuICAvLyBIYW5kbGUgbWFwIHZpZXcgcmVhZHlcclxuICBjb25zdCBvbkFjdGl2ZVZpZXdDaGFuZ2UgPSB1c2VDYWxsYmFjaygoam12OiBKaW11TWFwVmlldykgPT4ge1xyXG4gICAgamltdU1hcFZpZXdSZWYuY3VycmVudCA9IGptdlxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBST1VURSBTRUxFQ1RJT04gKHNhbWUgYXMgcm9hZC1sb2cpID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IGhhbmRsZVJvdXRlU2VhcmNoID0gdXNlQ2FsbGJhY2soKHZhbHVlOiBzdHJpbmcpID0+IHtcclxuICAgIGlmIChzZWFyY2hNb2RlID09PSAnaWQnKSB7XHJcbiAgICAgIHNldFJvdXRlSWQodmFsdWUpXHJcbiAgICAgIHNldFJvdXRlTmFtZSgnJylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHNldFJvdXRlTmFtZSh2YWx1ZSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2VhcmNoVGltZW91dFJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQoc2VhcmNoVGltZW91dFJlZi5jdXJyZW50KVxyXG4gICAgaWYgKHZhbHVlLmxlbmd0aCA8IDIgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkge1xyXG4gICAgICBzZXRSb3V0ZVN1Z2dlc3Rpb25zKFtdKVxyXG4gICAgICBzZXRTaG93U3VnZ2VzdGlvbnMoZmFsc2UpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHNlYXJjaFRpbWVvdXRSZWYuY3VycmVudCA9IHNldFRpbWVvdXQoYXN5bmMgKCkgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlSWRGaWVsZCB8fCAnY3VzdG9tcm91dGVmaWVsZCdcclxuICAgICAgICBjb25zdCBuYW1lRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlTmFtZUZpZWxkIHx8ICdyb3V0ZV9uYW1lJ1xyXG4gICAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICAgICAgY29uc3Qgc2VhcmNoRmllbGQgPSBzZWFyY2hNb2RlID09PSAnbmFtZScgPyBuYW1lRmllbGQgOiByb3V0ZUZpZWxkXHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgd2hlcmU6IGBVUFBFUigke3NlYXJjaEZpZWxkfSkgTElLRSBVUFBFUignJSR7dmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpfSUnKWAsXHJcbiAgICAgICAgICBvdXRGaWVsZHM6IGAke3JvdXRlRmllbGR9LCR7bmFtZUZpZWxkfWAsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMTAnLFxyXG4gICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHVybCwgcGFyYW1zKVxyXG4gICAgICAgIGNvbnN0IHJlc3VsdHMgPSAoZGF0YS5mZWF0dXJlcyB8fCBbXSkubWFwKChmOiBhbnkpID0+ICh7XHJcbiAgICAgICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF0gfHwgJycsXHJcbiAgICAgICAgICByb3V0ZU5hbWU6IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8IG51bGxcclxuICAgICAgICB9KSlcclxuICAgICAgICBzZXRSb3V0ZVN1Z2dlc3Rpb25zKHJlc3VsdHMpXHJcbiAgICAgICAgc2V0U2hvd1N1Z2dlc3Rpb25zKHJlc3VsdHMubGVuZ3RoID4gMClcclxuICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgc2V0Um91dGVTdWdnZXN0aW9ucyhbXSlcclxuICAgICAgICBzZXRTaG93U3VnZ2VzdGlvbnMoZmFsc2UpXHJcbiAgICAgIH1cclxuICAgIH0sIDMwMClcclxuICB9LCBbY29uZmlnLCBzZWFyY2hNb2RlXSlcclxuXHJcbiAgY29uc3Qgc2VsZWN0Um91dGUgPSB1c2VDYWxsYmFjaygocm91dGU6IHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB8IG51bGwgfSkgPT4ge1xyXG4gICAgc2V0Um91dGVJZChyb3V0ZS5yb3V0ZUlkKVxyXG4gICAgc2V0Um91dGVOYW1lKHJvdXRlLnJvdXRlTmFtZSB8fCAnJylcclxuICAgIHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgIGZldGNoUm91dGVNZWFzdXJlcyhyb3V0ZS5yb3V0ZUlkKVxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyBGZXRjaCByb3V0ZSBnZW9tZXRyeSArIG1lYXN1cmUgcmFuZ2UgKyBzaG93IHByZXZpZXdcclxuICBjb25zdCBmZXRjaFJvdXRlTWVhc3VyZXMgPSB1c2VDYWxsYmFjayhhc3luYyAocmlkOiBzdHJpbmcpID0+IHtcclxuICAgIGlmICghbHJzU2VydmljZVJlZi5jdXJyZW50IHx8ICFyaWQpIHJldHVyblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgICAgY29uc3Qgdmlld1draWQgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3Py5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG4gICAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgd2hlcmU6IGAke3JvdXRlRmllbGR9ID0gJyR7cmlkLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYCxcclxuICAgICAgICBvdXRGaWVsZHM6IHJvdXRlRmllbGQsXHJcbiAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICd0cnVlJyxcclxuICAgICAgICByZXR1cm5NOiAndHJ1ZScsXHJcbiAgICAgICAgb3V0U1I6IFN0cmluZyh2aWV3V2tpZCksXHJcbiAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICcxJyxcclxuICAgICAgICBmOiAnanNvbidcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdCh1cmwsIHBhcmFtcylcclxuICAgICAgaWYgKCFkYXRhLmZlYXR1cmVzPy5sZW5ndGgpIHJldHVyblxyXG5cclxuICAgICAgY29uc3QgcGF0aHMgPSBkYXRhLmZlYXR1cmVzWzBdLmdlb21ldHJ5Py5wYXRocyB8fCBbXVxyXG4gICAgICBjb25zdCBhbGxWZXJ0czogbnVtYmVyW11bXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgcGF0aCBvZiBwYXRocykgYWxsVmVydHMucHVzaCguLi5wYXRoKVxyXG4gICAgICBjb25zdCBoYXNaID0gZGF0YS5mZWF0dXJlc1swXS5nZW9tZXRyeT8uaGFzWlxyXG4gICAgICBjb25zdCBtSWR4ID0gaGFzWiA/IDMgOiAyXHJcbiAgICAgIGFsbFZlcnRzLnNvcnQoKGEsIGIpID0+IChhW21JZHhdIHx8IDApIC0gKGJbbUlkeF0gfHwgMCkpXHJcblxyXG4gICAgICBpZiAoYWxsVmVydHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IG1pbk0gPSBhbGxWZXJ0c1swXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbWF4TSA9IGFsbFZlcnRzW2FsbFZlcnRzLmxlbmd0aCAtIDFdW21JZHhdIHx8IDBcclxuICAgICAgICBzZXRGcm9tTWVhc3VyZShtaW5NLnRvRml4ZWQoMykpXHJcbiAgICAgICAgc2V0VG9NZWFzdXJlKG1heE0udG9GaXhlZCgzKSlcclxuICAgICAgICBzZXRSb3V0ZU1lYXN1cmVSYW5nZSh7IG1pbjogbWluTSwgbWF4OiBtYXhNIH0pXHJcbiAgICAgICAgcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnQuc2V0KHJpZCwgeyB2ZXJ0aWNlczogYWxsVmVydHMsIG1JZHggfSlcclxuICAgICAgICByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50ID0geyB2ZXJ0aWNlczogYWxsVmVydHMsIG1JZHggfVxyXG5cclxuICAgICAgICAvLyBTaG93IHJvdXRlIHByZXZpZXcgb24gbWFwXHJcbiAgICAgICAgc2hvd1JvdXRlUHJldmlld1JlZi5jdXJyZW50KHJpZClcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdbQ3Jhc2hSaXNrXSBmZXRjaFJvdXRlTWVhc3VyZXMgZmFpbGVkOicsIGUpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZ10pXHJcblxyXG4gIC8vIFNob3cgc2VsZWN0ZWQgcm91dGUgYXMgYSBkYXNoZWQgbGluZSBvbiB0aGUgbWFwIChsaWtlIHJvYWQtbG9nKVxyXG4gIGNvbnN0IHNob3dSb3V0ZVByZXZpZXcgPSB1c2VDYWxsYmFjayhhc3luYyAocmlkOiBzdHJpbmcpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSByZXR1cm5cclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcblxyXG4gICAgLy8gRW5zdXJlIHByZXZpZXcgR3JhcGhpY3NMYXllciBleGlzdHNcclxuICAgIGlmICghcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudCkge1xyXG4gICAgICBjb25zdCBHcmFwaGljc0xheWVyID0gYXdhaXQgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9sYXllcnMvR3JhcGhpY3NMYXllcicpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pXHJcbiAgICAgIGNvbnN0IGdsID0gbmV3IEdyYXBoaWNzTGF5ZXIoeyBpZDogJ19fY3Jhc2hyaXNrX3JvdXRlX3ByZXZpZXdfXycsIHRpdGxlOiAnUm91dGUgUHJldmlldycgfSlcclxuICAgICAgdmlldy5tYXAuYWRkKGdsLCAwKVxyXG4gICAgICByb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50ID0gZ2xcclxuICAgIH1cclxuICAgIGNvbnN0IHByZXZpZXdMYXllciA9IHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnRcclxuXHJcbiAgICAvLyBSZW1vdmUgcHJldmlvdXNcclxuICAgIGlmIChyb3V0ZVByZXZpZXdHcmFwaGljUmVmLmN1cnJlbnQpIHsgcHJldmlld0xheWVyLnJlbW92ZShyb3V0ZVByZXZpZXdHcmFwaGljUmVmLmN1cnJlbnQpOyByb3V0ZVByZXZpZXdHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChmcm9tTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShmcm9tTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCkpIGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50LmZvckVhY2goKGc6IGFueSkgPT4gcHJldmlld0xheWVyLnJlbW92ZShnKSlcclxuICAgICAgZWxzZSBwcmV2aWV3TGF5ZXIucmVtb3ZlKGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KVxyXG4gICAgICBmcm9tTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuICAgIGlmICh0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkodG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSkgdG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50LmZvckVhY2goKGc6IGFueSkgPT4gcHJldmlld0xheWVyLnJlbW92ZShnKSlcclxuICAgICAgZWxzZSBwcmV2aWV3TGF5ZXIucmVtb3ZlKHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudClcclxuICAgICAgdG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmlkKSByZXR1cm5cclxuXHJcbiAgICAvLyBGZXRjaCBnZW9tZXRyeSAoZG9uJ3QgcmVxdWlyZSBjYWNoZSDigJQgbmVlZGVkIGZvciBkaXNhbWJpZ3VhdGlvbiBob3ZlcilcclxuICAgIGNvbnN0IHJvdXRlRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlSWRGaWVsZCB8fCAnY3VzdG9tcm91dGVmaWVsZCdcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3Qgdmlld1draWQgPSB2aWV3LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QganNvbiA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdCh1cmwsIHtcclxuICAgICAgICB3aGVyZTogYCR7cm91dGVGaWVsZH0gPSAnJHtyaWQucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgLFxyXG4gICAgICAgIG91dEZpZWxkczogcm91dGVGaWVsZCxcclxuICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgIHJldHVybk06ICd0cnVlJyxcclxuICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEnLFxyXG4gICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICB9KVxyXG4gICAgICBpZiAoIWpzb24uZmVhdHVyZXM/Lmxlbmd0aCkgcmV0dXJuXHJcbiAgICAgIGNvbnN0IHBhdGhzID0ganNvbi5mZWF0dXJlc1swXS5nZW9tZXRyeT8ucGF0aHNcclxuICAgICAgaWYgKCFwYXRocz8ubGVuZ3RoKSByZXR1cm5cclxuXHJcbiAgICAgIGNvbnN0IFtHcmFwaGljLCBQb2x5bGluZSwgU2ltcGxlTGluZVN5bWJvbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9HcmFwaGljJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9nZW9tZXRyeS9Qb2x5bGluZScpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2Vzcmkvc3ltYm9scy9TaW1wbGVMaW5lU3ltYm9sJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSlcclxuICAgICAgXSlcclxuXHJcbiAgICAgIGNvbnN0IHJvdXRlR3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICBnZW9tZXRyeTogbmV3IFBvbHlsaW5lKHsgcGF0aHMsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZDogdmlld1draWQgfSB9KSxcclxuICAgICAgICBzeW1ib2w6IG5ldyBTaW1wbGVMaW5lU3ltYm9sKHsgY29sb3I6IFsyMjAsIDYwLCA2MCwgMTgwXSwgd2lkdGg6IDMsIHN0eWxlOiAnZGFzaCcgfSlcclxuICAgICAgfSlcclxuICAgICAgcm91dGVQcmV2aWV3R3JhcGhpY1JlZi5jdXJyZW50ID0gcm91dGVHcmFwaGljXHJcbiAgICAgIHByZXZpZXdMYXllci5hZGQocm91dGVHcmFwaGljKVxyXG5cclxuICAgICAgLy8gWm9vbSB0byByb3V0ZVxyXG4gICAgICB0cnkgeyB2aWV3LmdvVG8ocm91dGVHcmFwaGljLmdlb21ldHJ5LmV4dGVudC5leHBhbmQoMS4zKSwgeyBkdXJhdGlvbjogODAwIH0pIH0gY2F0Y2ggKF8pIHt9XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS53YXJuKCdzaG93Um91dGVQcmV2aWV3IGZhaWxlZDonLCBlcnIpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZ10pXHJcbiAgc2hvd1JvdXRlUHJldmlld1JlZi5jdXJyZW50ID0gc2hvd1JvdXRlUHJldmlld1xyXG5cclxuICAvLyBTaG93IGEgbWVhc3VyZSBwb2ludCAoZ3JlZW49ZnJvbSwgcmVkPXRvKSBvbiB0aGUgbWFwXHJcbiAgY29uc3Qgc2hvd01lYXN1cmVQb2ludCA9IHVzZUNhbGxiYWNrKGFzeW5jICh3aGljaDogJ2Zyb20nIHwgJ3RvJywgbWVhc3VyZVZhbDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIXJvdXRlUHJldmlld1ZlcnRzUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuICAgIGNvbnN0IG0gPSBwYXJzZUZsb2F0KG1lYXN1cmVWYWwpXHJcbiAgICBpZiAoaXNOYU4obSkpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IHJlZiA9IHdoaWNoID09PSAnZnJvbScgPyBmcm9tTWVhc3VyZUdyYXBoaWNSZWYgOiB0b01lYXN1cmVHcmFwaGljUmVmXHJcbiAgICBpZiAocmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgbGF5ZXIgPSByb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50XHJcbiAgICAgIGlmIChsYXllcikge1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlZi5jdXJyZW50KSkgcmVmLmN1cnJlbnQuZm9yRWFjaCgoZzogYW55KSA9PiBsYXllci5yZW1vdmUoZykpXHJcbiAgICAgICAgZWxzZSBsYXllci5yZW1vdmUocmVmLmN1cnJlbnQpXHJcbiAgICAgIH1cclxuICAgICAgcmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyB2ZXJ0aWNlcywgbUlkeCB9ID0gcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudFxyXG5cclxuICAgIC8vIEludGVycG9sYXRlIHBvaW50IGF0IG1lYXN1cmVcclxuICAgIGxldCBwdDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCA9IG51bGxcclxuICAgIGlmIChtIDw9ICh2ZXJ0aWNlc1swXVttSWR4XSB8fCAwKSkge1xyXG4gICAgICBwdCA9IHsgeDogdmVydGljZXNbMF1bMF0sIHk6IHZlcnRpY2VzWzBdWzFdIH1cclxuICAgIH0gZWxzZSBpZiAobSA+PSAodmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bbUlkeF0gfHwgMCkpIHtcclxuICAgICAgcHQgPSB7IHg6IHZlcnRpY2VzW3ZlcnRpY2VzLmxlbmd0aCAtIDFdWzBdLCB5OiB2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVsxXSB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IG0xID0gdmVydGljZXNbaV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IG0yID0gdmVydGljZXNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICBpZiAobSA+PSBtMSAmJiBtIDw9IG0yKSB7XHJcbiAgICAgICAgICBjb25zdCBmcmFjID0gbTIgIT09IG0xID8gKG0gLSBtMSkgLyAobTIgLSBtMSkgOiAwXHJcbiAgICAgICAgICBwdCA9IHsgeDogdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKSwgeTogdmVydGljZXNbaV1bMV0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVsxXSAtIHZlcnRpY2VzW2ldWzFdKSB9XHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKCFwdCkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgW0dyYXBoaWMsIFBvaW50LCBTaW1wbGVNYXJrZXJTeW1ib2wsIFRleHRTeW1ib2xdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL0dyYXBoaWMnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9nZW9tZXRyeS9Qb2ludCcpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL3N5bWJvbHMvU2ltcGxlTWFya2VyU3ltYm9sJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2Vzcmkvc3ltYm9scy9UZXh0U3ltYm9sJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSlcclxuICAgIF0pXHJcblxyXG4gICAgY29uc3QgY29sb3IgPSB3aGljaCA9PT0gJ2Zyb20nID8gWzM0LCAxMzksIDM0LCAyNTVdIDogWzE4MCwgMCwgMCwgMjU1XVxyXG4gICAgY29uc3QgbGFiZWwgPSB3aGljaCA9PT0gJ2Zyb20nID8gYEZyb206ICR7bS50b0ZpeGVkKDMpfWAgOiBgVG86ICR7bS50b0ZpeGVkKDMpfWBcclxuXHJcbiAgICBjb25zdCBwb2ludEdyYXBoaWMgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBwdC54LCB5OiBwdC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yLCBzaXplOiAxMiwgb3V0bGluZTogeyBjb2xvcjogWzI1NSwgMjU1LCAyNTVdLCB3aWR0aDogMiB9IH0pXHJcbiAgICB9KVxyXG4gICAgY29uc3QgbGFiZWxHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogcHQueCwgeTogcHQueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pLFxyXG4gICAgICBzeW1ib2w6IG5ldyBUZXh0U3ltYm9sKHsgdGV4dDogbGFiZWwsIGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIGhhbG9Db2xvcjogWzAsIDAsIDBdLCBoYWxvU2l6ZTogMS41LCBmb250OiB7IHNpemU6IDExLCB3ZWlnaHQ6ICdib2xkJyB9LCB5b2Zmc2V0OiAxNCB9KVxyXG4gICAgfSlcclxuXHJcbiAgICByZWYuY3VycmVudCA9IFtwb2ludEdyYXBoaWMsIGxhYmVsR3JhcGhpY11cclxuICAgIGNvbnN0IGxheWVyID0gcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudFxyXG4gICAgaWYgKGxheWVyKSB7IGxheWVyLmFkZChwb2ludEdyYXBoaWMpOyBsYXllci5hZGQobGFiZWxHcmFwaGljKSB9XHJcbiAgICBlbHNlIHsgdmlldy5ncmFwaGljcy5hZGQocG9pbnRHcmFwaGljKTsgdmlldy5ncmFwaGljcy5hZGQobGFiZWxHcmFwaGljKSB9XHJcbiAgfSwgW10pXHJcbiAgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50ID0gc2hvd01lYXN1cmVQb2ludFxyXG5cclxuICAvLyBQaWNrIGZyb20vdG8gbWVhc3VyZSBvbiBtYXAgKHNuYXAgdG8gcm91dGUgZ2VvbWV0cnkpXHJcbiAgY29uc3Qgc3RhcnRQaWNrTWVhc3VyZSA9IHVzZUNhbGxiYWNrKCh3aGljaDogJ2Zyb20nIHwgJ3RvJykgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgaWYgKCFyb3V0ZUlkLnRyaW0oKSkgeyBzZXRFcnJvcignU2VsZWN0IGEgcm91dGUgZmlyc3QnKTsgcmV0dXJuIH1cclxuICAgIGlmICghcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCkgeyBzZXRFcnJvcignUm91dGUgZ2VvbWV0cnkgbm90IGxvYWRlZCcpOyByZXR1cm4gfVxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICBpZiAobWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAobWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50KSB7IG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcblxyXG4gICAgc2V0UGlja2luZ01lYXN1cmUod2hpY2gpXHJcbiAgICB2aWV3LmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnY3Jvc3NoYWlyJ1xyXG5cclxuICAgIGNvbnN0IG1vZHVsZXNQcm9taXNlID0gUHJvbWlzZS5hbGwoW1xyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL0dyYXBoaWMnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1NpbXBsZU1hcmtlclN5bWJvbCcpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvaW50JykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSlcclxuICAgIF0pXHJcblxyXG4gICAgaWYgKCFtZWFzdXJlVG9vbHRpcFJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIHRpcC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlO3BvaW50ZXItZXZlbnRzOm5vbmU7YmFja2dyb3VuZDojMzMzO2NvbG9yOiNmZmY7cGFkZGluZzo0cHggOHB4O2JvcmRlci1yYWRpdXM6NHB4O2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt6LWluZGV4Ojk5OTk5O2Rpc3BsYXk6bm9uZTtib3gtc2hhZG93OjAgMnB4IDZweCByZ2JhKDAsMCwwLDAuMyk7J1xyXG4gICAgICB2aWV3LmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXApXHJcbiAgICAgIG1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQgPSB0aXBcclxuICAgIH1cclxuICAgIGNvbnN0IHRvb2x0aXAgPSBtZWFzdXJlVG9vbHRpcFJlZi5jdXJyZW50IVxyXG4gICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG4gICAgY29uc3QgeyB2ZXJ0aWNlczogYWxsVmVydHMsIG1JZHggfSA9IHJvdXRlUHJldmlld1ZlcnRzUmVmLmN1cnJlbnQhXHJcblxyXG4gICAgZnVuY3Rpb24gbmVhcmVzdE1PblJvdXRlIChweDogbnVtYmVyLCBweTogbnVtYmVyKTogeyBtOiBudW1iZXI7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsIHtcclxuICAgICAgbGV0IGJlc3REaXN0ID0gSW5maW5pdHksIGJlc3RYID0gcHgsIGJlc3RZID0gcHksIGJlc3RNID0gMFxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFZlcnRzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IFtheCwgYXldID0gYWxsVmVydHNbaV1cclxuICAgICAgICBjb25zdCBbYngsIGJ5XSA9IGFsbFZlcnRzW2kgKyAxXVxyXG4gICAgICAgIGNvbnN0IG1BID0gYWxsVmVydHNbaV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IG1CID0gYWxsVmVydHNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBkeCA9IGJ4IC0gYXgsIGR5ID0gYnkgLSBheVxyXG4gICAgICAgIGNvbnN0IGxlblNxID0gZHggKiBkeCArIGR5ICogZHlcclxuICAgICAgICBpZiAobGVuU3EgPT09IDApIGNvbnRpbnVlXHJcbiAgICAgICAgbGV0IHQgPSAoKHB4IC0gYXgpICogZHggKyAocHkgLSBheSkgKiBkeSkgLyBsZW5TcVxyXG4gICAgICAgIHQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB0KSlcclxuICAgICAgICBjb25zdCBjeCA9IGF4ICsgdCAqIGR4LCBjeSA9IGF5ICsgdCAqIGR5XHJcbiAgICAgICAgY29uc3QgZCA9IChweCAtIGN4KSAqIChweCAtIGN4KSArIChweSAtIGN5KSAqIChweSAtIGN5KVxyXG4gICAgICAgIGlmIChkIDwgYmVzdERpc3QpIHsgYmVzdERpc3QgPSBkOyBiZXN0WCA9IGN4OyBiZXN0WSA9IGN5OyBiZXN0TSA9IG1BICsgdCAqIChtQiAtIG1BKSB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGJlc3REaXN0IDwgSW5maW5pdHkgPyB7IG06IGJlc3RNLCB4OiBiZXN0WCwgeTogYmVzdFkgfSA6IG51bGxcclxuICAgIH1cclxuXHJcbiAgICAvLyBQb2ludGVyLW1vdmU6IHNuYXAgYW5kIHNob3cgTSB2YWx1ZVxyXG4gICAgbW9kdWxlc1Byb21pc2UudGhlbigoW0dyYXBoaWMsIFNpbXBsZU1hcmtlclN5bWJvbCwgUG9pbnRdKSA9PiB7XHJcbiAgICAgIG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudCA9IHZpZXcub24oJ3BvaW50ZXItbW92ZScsIChldmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgY29uc3QgbWFwUG9pbnQgPSB2aWV3LnRvTWFwKHsgeDogZXZlbnQueCwgeTogZXZlbnQueSB9KVxyXG4gICAgICAgIGlmICghbWFwUG9pbnQpIHJldHVyblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5lYXJlc3RNT25Sb3V0ZShtYXBQb2ludC54LCBtYXBQb2ludC55KVxyXG4gICAgICAgIGlmICghcmVzdWx0KSByZXR1cm5cclxuXHJcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7ZXZlbnQueCArIDE0fXB4YFxyXG4gICAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0gYCR7ZXZlbnQueSAtIDQwfXB4YFxyXG4gICAgICAgIHRvb2x0aXAudGV4dENvbnRlbnQgPSBgTTogJHtyZXN1bHQubS50b0ZpeGVkKDMpfWBcclxuICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snXHJcblxyXG4gICAgICAgIGlmIChtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICAgICAgbWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQuZ2VvbWV0cnkgPSBuZXcgUG9pbnQoeyB4OiByZXN1bHQueCwgeTogcmVzdWx0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBnID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogcmVzdWx0LngsIHk6IHJlc3VsdC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yOiBbMjU1LCA4NywgMzQsIDI1NV0sIHNpemU6IDEwLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICBtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IGdcclxuICAgICAgICAgIHZpZXcuZ3JhcGhpY3MuYWRkKGcpXHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgLy8gQ2xpY2s6IHNldCB0aGUgbWVhc3VyZSB2YWx1ZVxyXG4gICAgICBtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudCA9IHZpZXcub24oJ2NsaWNrJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICBjb25zdCBtYXBQb2ludCA9IHZpZXcudG9NYXAoeyB4OiBldmVudC54LCB5OiBldmVudC55IH0pXHJcbiAgICAgICAgaWYgKCFtYXBQb2ludCkgcmV0dXJuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmVhcmVzdE1PblJvdXRlKG1hcFBvaW50LngsIG1hcFBvaW50LnkpXHJcbiAgICAgICAgaWYgKHJlc3VsdCkge1xyXG4gICAgICAgICAgY29uc3QgbVZhbCA9IHJlc3VsdC5tLnRvRml4ZWQoMylcclxuICAgICAgICAgIGlmICh3aGljaCA9PT0gJ2Zyb20nKSB7XHJcbiAgICAgICAgICAgIHNldEZyb21NZWFzdXJlKG1WYWwpXHJcbiAgICAgICAgICAgIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgnZnJvbScsIG1WYWwpXHJcbiAgICAgICAgICAgIGNhbmNlbFBpY2tNZWFzdXJlKClcclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiBzdGFydFBpY2tNZWFzdXJlKCd0bycpLCA1MClcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBzZXRUb01lYXN1cmUobVZhbClcclxuICAgICAgICAgICAgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCd0bycsIG1WYWwpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhbmNlbFBpY2tNZWFzdXJlKClcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfSwgW2NvbmZpZywgcm91dGVJZF0pXHJcblxyXG4gIGNvbnN0IGNhbmNlbFBpY2tNZWFzdXJlID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudCkgeyBtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKG1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQpIG1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgaWYgKG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50ICYmIGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcpIHtcclxuICAgICAgKGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnkpLmdyYXBoaWNzLnJlbW92ZShtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudClcclxuICAgICAgbWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB9XHJcbiAgICBpZiAoamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldykge1xyXG4gICAgICAoamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueSkuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICcnXHJcbiAgICB9XHJcbiAgICBzZXRQaWNraW5nTWVhc3VyZShudWxsKVxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyBDbGVhciBhbGwgcm91dGUgcHJldmlldyBncmFwaGljc1xyXG4gIGNvbnN0IGNsZWFyUm91dGVQcmV2aWV3ID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnQpIHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnQucmVtb3ZlQWxsKClcclxuICAgIHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgdG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCA9IG51bGxcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gQ2xlYXIgZXZlcnl0aGluZyAocHJlZGljdGlvbiBsYXllciwgY3Jhc2ggZXZlbnRzLCByb3V0ZSBwcmV2aWV3LCBzdGF0ZSlcclxuICBjb25zdCBjbGVhckFsbCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IGFzIGFueVxyXG4gICAgaWYgKHZpZXcpIHtcclxuICAgICAgLy8gUmVtb3ZlIHByZWRpY3Rpb24gbGF5ZXJcclxuICAgICAgaWYgKHByZWRpY3Rpb25MYXllclJlZi5jdXJyZW50KSB7IHZpZXcubWFwLnJlbW92ZShwcmVkaWN0aW9uTGF5ZXJSZWYuY3VycmVudCk7IHByZWRpY3Rpb25MYXllclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nUHJlZCA9IHZpZXcubWFwLmFsbExheWVycy5maW5kKChsOiBhbnkpID0+IGwudGl0bGUgPT09ICdDcmFzaCBSaXNrIFByZWRpY3Rpb24nKVxyXG4gICAgICBpZiAoZXhpc3RpbmdQcmVkKSB2aWV3Lm1hcC5yZW1vdmUoZXhpc3RpbmdQcmVkKVxyXG4gICAgICAvLyBSZW1vdmUgY3Jhc2ggZXZlbnRzIGxheWVyXHJcbiAgICAgIGlmIChjcmFzaEV2ZW50c0xheWVyUmVmLmN1cnJlbnQpIHsgdmlldy5tYXAucmVtb3ZlKGNyYXNoRXZlbnRzTGF5ZXJSZWYuY3VycmVudCk7IGNyYXNoRXZlbnRzTGF5ZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgICAvLyBSZW1vdmUgZHJhdyBncmFwaGljc1xyXG4gICAgICBpZiAoZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KSBncmFwaGljc0xheWVyUmVmLmN1cnJlbnQucmVtb3ZlQWxsKClcclxuICAgICAgLy8gUmVtb3ZlIHJvdXRlIGhpZ2hsaWdodCBncmFwaGljc1xyXG4gICAgICBpZiAocm91dGVHcmFwaGljc0xheWVyUmVmLmN1cnJlbnQpIHJvdXRlR3JhcGhpY3NMYXllclJlZi5jdXJyZW50LnJlbW92ZUFsbCgpXHJcbiAgICB9XHJcbiAgICBjbGVhclJvdXRlUHJldmlldygpXHJcbiAgICBzZXRSb3V0ZUlkKCcnKTsgc2V0Um91dGVOYW1lKCcnKTsgc2V0RnJvbU1lYXN1cmUoJycpOyBzZXRUb01lYXN1cmUoJycpXHJcbiAgICBzZXRSb3V0ZU1lYXN1cmVSYW5nZShudWxsKTsgc2V0Um91dGVTdWdnZXN0aW9ucyhbXSk7IHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgIHNldE1hcFJvdXRlcyhbXSk7IHNldFNlbGVjdGVkTWFwUm91dGVJZHMobmV3IFNldCgpKVxyXG4gICAgc2V0UmVzdWx0KG51bGwpOyBzZXRGYWN0b3JzKG51bGwpOyBzZXRNb2RlbEluZm8obnVsbCk7IHNldENyYXNoU3RhdHMobnVsbClcclxuICAgIHNldFByb2dyZXNzKCcnKTsgc2V0RXJyb3IobnVsbCk7IHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSlcclxuICAgIHNldE1vZGUoJ2Nob29zZScpXHJcbiAgICByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5jbGVhcigpXHJcbiAgfSwgW2NsZWFyUm91dGVQcmV2aWV3XSlcclxuXHJcbiAgLy8gVG9nZ2xlIGluZGl2aWR1YWwgcm91dGUgc2VsZWN0aW9uICh3aXRoIG1hcCB2aXNpYmlsaXR5KVxyXG4gIGNvbnN0IHRvZ2dsZU1hcFJvdXRlID0gdXNlQ2FsbGJhY2soKHJvdXRlSWQ6IHN0cmluZykgPT4ge1xyXG4gICAgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkcyhwcmV2ID0+IHtcclxuICAgICAgY29uc3QgbmV4dCA9IG5ldyBTZXQocHJldilcclxuICAgICAgaWYgKG5leHQuaGFzKHJvdXRlSWQpKSBuZXh0LmRlbGV0ZShyb3V0ZUlkKVxyXG4gICAgICBlbHNlIG5leHQuYWRkKHJvdXRlSWQpXHJcbiAgICAgIGlmIChyb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCkge1xyXG4gICAgICAgIGNvbnN0IGdyYXBoaWNzID0gcm91dGVHcmFwaGljc0xheWVyUmVmLmN1cnJlbnQuZ3JhcGhpY3M/LnRvQXJyYXkoKSB8fCBbXVxyXG4gICAgICAgIGZvciAoY29uc3QgZyBvZiBncmFwaGljcykge1xyXG4gICAgICAgICAgaWYgKGcuYXR0cmlidXRlcz8ucm91dGVJZCA9PT0gcm91dGVJZCkgZy52aXNpYmxlID0gbmV4dC5oYXMocm91dGVJZClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5leHRcclxuICAgIH0pXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIFBpY2sgcm91dGUgZnJvbSBtYXAgKHdpdGggaG92ZXIgdG9vbHRpcCArIHNuYXAgZ3JhcGhpYyBsaWtlIHJvYWQtbG9nKVxyXG4gIGNvbnN0IHN0YXJ0UGlja0Zyb21NYXAgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG5cclxuICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICBzZXRQaWNraW5nRnJvbU1hcCh0cnVlKVxyXG4gICAgdmlldy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJ2Nyb3NzaGFpcidcclxuXHJcbiAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICBjb25zdCBuYW1lRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlTmFtZUZpZWxkIHx8ICdyb3V0ZV9uYW1lJ1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCBxdWVyeVVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuICAgIGNvbnN0IG91dEZpZWxkcyA9IGAke3JvdXRlRmllbGR9LCR7bmFtZUZpZWxkfWBcclxuICAgIGNvbnN0IHZpZXdXa2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG5cclxuICAgIC8vIENyZWF0ZSB0b29sdGlwXHJcbiAgICBpZiAoIXBpY2tUb29sdGlwUmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgdGlwLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7cG9pbnRlci1ldmVudHM6bm9uZTtiYWNrZ3JvdW5kOiMzMzM7Y29sb3I6I2ZmZjtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3otaW5kZXg6OTk5OTk7ZGlzcGxheTpub25lO2JveC1zaGFkb3c6MCAycHggNnB4IHJnYmEoMCwwLDAsMC4zKTsnXHJcbiAgICAgIHZpZXcuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpcClcclxuICAgICAgcGlja1Rvb2x0aXBSZWYuY3VycmVudCA9IHRpcFxyXG4gICAgfVxyXG4gICAgY29uc3QgdG9vbHRpcCA9IHBpY2tUb29sdGlwUmVmLmN1cnJlbnQhXHJcbiAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbiAgICBsZXQgbGFzdFF1ZXJ5SWQgPSAwXHJcbiAgICBsZXQgY2FjaGVkUGF0aHM6IG51bWJlcltdW11bXVtdID0gW11cclxuICAgIGxldCBjYWNoZWRMYWJlbHM6IHN0cmluZ1tdID0gW11cclxuICAgIGxldCBsYXN0UXVlcnlQdDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCA9IG51bGxcclxuICAgIGNvbnN0IFJFUVVFUllfRElTVCA9IDgwXHJcblxyXG4gICAgLy8gTG9hZCBBcmNHSVMgbW9kdWxlcyBmb3Igc25hcCBncmFwaGljXHJcbiAgICBjb25zdCBtb2R1bGVzUHJvbWlzZSA9IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL0dyYXBoaWMnLCAnZXNyaS9zeW1ib2xzL1NpbXBsZU1hcmtlclN5bWJvbCcsICdlc3JpL2dlb21ldHJ5L1BvaW50J10sICguLi5tOiBhbnlbXSkgPT4gcmVzb2x2ZShtKSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gSGVscGVyOiBzbmFwIHRvIG5lYXJlc3QgcG9pbnQgb24gY2FjaGVkIHBhdGhzXHJcbiAgICBmdW5jdGlvbiBzbmFwVG9OZWFyZXN0IChweDogbnVtYmVyLCBweTogbnVtYmVyKTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCB7XHJcbiAgICAgIGxldCBiZXN0RGlzdCA9IEluZmluaXR5LCBiZXN0WCA9IHB4LCBiZXN0WSA9IHB5XHJcbiAgICAgIGZvciAoY29uc3QgcGF0aHMgb2YgY2FjaGVkUGF0aHMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgW2F4LCBheV0gPSBwYXRoW2ldXHJcbiAgICAgICAgICAgIGNvbnN0IFtieCwgYnldID0gcGF0aFtpICsgMV1cclxuICAgICAgICAgICAgY29uc3QgZHggPSBieCAtIGF4LCBkeSA9IGJ5IC0gYXlcclxuICAgICAgICAgICAgY29uc3QgbGVuU3EgPSBkeCAqIGR4ICsgZHkgKiBkeVxyXG4gICAgICAgICAgICBpZiAobGVuU3EgPT09IDApIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGxldCB0ID0gKChweCAtIGF4KSAqIGR4ICsgKHB5IC0gYXkpICogZHkpIC8gbGVuU3FcclxuICAgICAgICAgICAgdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHQpKVxyXG4gICAgICAgICAgICBjb25zdCBjeCA9IGF4ICsgdCAqIGR4LCBjeSA9IGF5ICsgdCAqIGR5XHJcbiAgICAgICAgICAgIGNvbnN0IGQgPSAocHggLSBjeCkgKiAocHggLSBjeCkgKyAocHkgLSBjeSkgKiAocHkgLSBjeSlcclxuICAgICAgICAgICAgaWYgKGQgPCBiZXN0RGlzdCkgeyBiZXN0RGlzdCA9IGQ7IGJlc3RYID0gY3g7IGJlc3RZID0gY3kgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmVzdERpc3QgPCBJbmZpbml0eSA/IHsgeDogYmVzdFgsIHk6IGJlc3RZIH0gOiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSG92ZXI6IHNob3cgcm91dGUgbmFtZSB0b29sdGlwICsgc25hcCBncmFwaGljXHJcbiAgICBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdwb2ludGVyLW1vdmUnLCBhc3luYyAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHtldmVudC54ICsgMTR9cHhgXHJcbiAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0gYCR7ZXZlbnQueSAtIDQwfXB4YFxyXG5cclxuICAgICAgY29uc3QgbWFwUG9pbnQgPSB2aWV3LnRvTWFwKHsgeDogZXZlbnQueCwgeTogZXZlbnQueSB9KVxyXG4gICAgICBpZiAoIW1hcFBvaW50KSByZXR1cm5cclxuXHJcbiAgICAgIC8vIFNuYXAgdXNpbmcgY2FjaGVkIGdlb21ldHJ5XHJcbiAgICAgIGlmIChjYWNoZWRQYXRocy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3Qgc25hcCA9IHNuYXBUb05lYXJlc3QobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICBpZiAoc25hcCkge1xyXG4gICAgICAgICAgY29uc3QgW0dyYXBoaWMsIFNpbXBsZU1hcmtlclN5bWJvbCwgUG9pbnRdID0gYXdhaXQgbW9kdWxlc1Byb21pc2VcclxuICAgICAgICAgIGlmIChwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNuYXBHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBzbmFwLngsIHk6IHNuYXAueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pLFxyXG4gICAgICAgICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yOiBbMCwgMTIyLCAyNTUsIDI1NV0sIHNpemU6IDEwLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBzbmFwR3JhcGhpY1xyXG4gICAgICAgICAgICB2aWV3LmdyYXBoaWNzLmFkZChzbmFwR3JhcGhpYylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGN1cnNvciBtb3ZlZCBmYXIgZW5vdWdoIHRvIHJlLXF1ZXJ5XHJcbiAgICAgIGlmIChsYXN0UXVlcnlQdCkge1xyXG4gICAgICAgIGNvbnN0IGR4ID0gbWFwUG9pbnQueCAtIGxhc3RRdWVyeVB0LnhcclxuICAgICAgICBjb25zdCBkeSA9IG1hcFBvaW50LnkgLSBsYXN0UXVlcnlQdC55XHJcbiAgICAgICAgaWYgKE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSkgPCBSRVFVRVJZX0RJU1QpIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KVxyXG4gICAgICBwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgICAgICBjb25zdCBxdWVyeUlkID0gKytsYXN0UXVlcnlJZFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBKU09OLnN0cmluZ2lmeShtYXBQb2ludC50b0pTT04oKSksXHJcbiAgICAgICAgICAgIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvaW50JyxcclxuICAgICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnNTAnLFxyXG4gICAgICAgICAgICB1bml0czogJ2VzcmlTUlVuaXRfTWV0ZXInLFxyXG4gICAgICAgICAgICBvdXRGaWVsZHMsXHJcbiAgICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzUnLFxyXG4gICAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QocXVlcnlVcmwsIHBhcmFtcylcclxuICAgICAgICAgIGlmIChxdWVyeUlkICE9PSBsYXN0UXVlcnlJZCkgcmV0dXJuXHJcbiAgICAgICAgICBsYXN0UXVlcnlQdCA9IHsgeDogbWFwUG9pbnQueCwgeTogbWFwUG9pbnQueSB9XHJcblxyXG4gICAgICAgICAgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY2FjaGVkUGF0aHMgPSBqc29uLmZlYXR1cmVzLm1hcCgoZjogYW55KSA9PiBmLmdlb21ldHJ5Py5wYXRocyB8fCBbXSlcclxuICAgICAgICAgICAgY2FjaGVkTGFiZWxzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJpZCA9IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJuYW1lID0gZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgJydcclxuICAgICAgICAgICAgICByZXR1cm4gcm5hbWUgPyBgJHtybmFtZX0gKCR7cmlkfSlgIDogcmlkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRvb2x0aXAudGV4dENvbnRlbnQgPSBjYWNoZWRMYWJlbHMuam9pbignXFxuJylcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS53aGl0ZVNwYWNlID0gY2FjaGVkTGFiZWxzLmxlbmd0aCA+IDEgPyAncHJlLWxpbmUnIDogJ25vd3JhcCdcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNuYXAgd2l0aCBmcmVzaCBnZW9tZXRyeVxyXG4gICAgICAgICAgICBjb25zdCBzbmFwID0gc25hcFRvTmVhcmVzdChtYXBQb2ludC54LCBtYXBQb2ludC55KVxyXG4gICAgICAgICAgICBpZiAoc25hcCkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IFtHcmFwaGljLCBTaW1wbGVNYXJrZXJTeW1ib2wsIFBvaW50XSA9IGF3YWl0IG1vZHVsZXNQcm9taXNlXHJcbiAgICAgICAgICAgICAgaWYgKHF1ZXJ5SWQgIT09IGxhc3RRdWVyeUlkKSByZXR1cm5cclxuICAgICAgICAgICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50Lmdlb21ldHJ5ID0gbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3I6IFswLCAxMjIsIDI1NSwgMjU1XSwgc2l6ZTogMTAsIG91dGxpbmU6IHsgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgd2lkdGg6IDIgfSB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gZ1xyXG4gICAgICAgICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoZylcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBjYWNoZWRQYXRocyA9IFtdXHJcbiAgICAgICAgICAgIGNhY2hlZExhYmVscyA9IFtdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDEwMClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQ2xpY2s6IHNlbGVjdCByb3V0ZVxyXG4gICAgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IHZpZXcub24oJ2NsaWNrJywgYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgaWYgKHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgICBpZiAocGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICAgIGlmIChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICB2aWV3LmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJ1xyXG4gICAgICBzZXRQaWNraW5nRnJvbU1hcChmYWxzZSlcclxuICAgICAgLy8gUmVtb3ZlIHNuYXAgZ3JhcGhpY1xyXG4gICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHsgdmlldy5ncmFwaGljcy5yZW1vdmUocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpOyBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICBnZW9tZXRyeTogSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFwUG9pbnQudG9KU09OKCkpLFxyXG4gICAgICAgICAgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5UG9pbnQnLFxyXG4gICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICBkaXN0YW5jZTogJzUwJyxcclxuICAgICAgICAgIHVuaXRzOiAnZXNyaVNSVW5pdF9NZXRlcicsXHJcbiAgICAgICAgICBvdXRGaWVsZHMsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMTAnLFxyXG4gICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QocXVlcnlVcmwsIHBhcmFtcylcclxuXHJcbiAgICAgICAgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBqc29uLmZlYXR1cmVzLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICAgICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF0gfHwgJycsXHJcbiAgICAgICAgICAgIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxyXG4gICAgICAgICAgY29uc3QgdW5pcXVlID0gY2FuZGlkYXRlcy5maWx0ZXIoKGM6IGFueSkgPT4geyBpZiAoc2Vlbi5oYXMoYy5yb3V0ZUlkKSkgcmV0dXJuIGZhbHNlOyBzZWVuLmFkZChjLnJvdXRlSWQpOyByZXR1cm4gdHJ1ZSB9KVxyXG4gICAgICAgICAgaWYgKHVuaXF1ZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHNldFJvdXRlUGlja0NhbmRpZGF0ZXModW5pcXVlKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2V0Um91dGVJZCh1bmlxdWVbMF0ucm91dGVJZClcclxuICAgICAgICAgICAgc2V0Um91dGVOYW1lKHVuaXF1ZVswXS5yb3V0ZU5hbWUpXHJcbiAgICAgICAgICAgIGZldGNoUm91dGVNZWFzdXJlcyh1bmlxdWVbMF0ucm91dGVJZClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgYXR0cnMgPSBqc29uLmZlYXR1cmVzWzBdLmF0dHJpYnV0ZXNcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IGF0dHJzW3JvdXRlRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICBjb25zdCBybmFtZSA9IGF0dHJzW25hbWVGaWVsZF0gfHwgJydcclxuICAgICAgICAgIHNldFJvdXRlSWQocmlkKVxyXG4gICAgICAgICAgc2V0Um91dGVOYW1lKHJuYW1lIHx8IHJpZClcclxuICAgICAgICAgIGZldGNoUm91dGVNZWFzdXJlcyhyaWQpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNldEVycm9yKCdObyByb3V0ZSBmb3VuZCBhdCB0aGF0IGxvY2F0aW9uJylcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBpZGVudGlmeSByb3V0ZTogJyArIChlcnIubWVzc2FnZSB8fCBlcnIpKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0sIFtjb25maWcsIGZldGNoUm91dGVNZWFzdXJlc10pXHJcblxyXG4gIGNvbnN0IGNhbmNlbFBpY2tGcm9tTWFwID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudClcclxuICAgIGlmIChwaWNrVG9vbHRpcFJlZi5jdXJyZW50KSBwaWNrVG9vbHRpcFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIGlmIChqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3KSB7XHJcbiAgICAgIGNvbnN0IHYgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcbiAgICAgIHYuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICcnXHJcbiAgICAgIGlmIChwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCkgeyB2LmdyYXBoaWNzLnJlbW92ZShwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCk7IHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICB9XHJcbiAgICBzZXRQaWNraW5nRnJvbU1hcChmYWxzZSlcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gRHJhdyBwb2x5Z29uIHRvIHNlbGVjdCBtdWx0aXBsZSByb3V0ZXMgKHNhbWUgcGF0dGVybiBhcyByb2FkLWxvZylcclxuICBjb25zdCBzdGFydERyYXdBcmVhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICBzZXREcmF3aW5nKHRydWUpXHJcbiAgICBzZXRNYXBSb3V0ZXMoW10pXHJcbiAgICBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQoKSlcclxuXHJcbiAgICBjb25zdCBbR3JhcGhpY3NMYXllciwgU2tldGNoVmlld01vZGVsXSA9IGF3YWl0IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL2xheWVycy9HcmFwaGljc0xheWVyJywgJ2Vzcmkvd2lkZ2V0cy9Ta2V0Y2gvU2tldGNoVmlld01vZGVsJ10sICguLi5tOiBhbnlbXSkgPT4gcmVzb2x2ZShtKSlcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKCFncmFwaGljc0xheWVyUmVmLmN1cnJlbnQpIHtcclxuICAgICAgZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50ID0gbmV3IEdyYXBoaWNzTGF5ZXIoeyBpZDogJ2NyYXNocmlzay1kcmF3JywgbGlzdE1vZGU6ICdoaWRlJyB9KVxyXG4gICAgICB2aWV3Lm1hcC5hZGQoZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KVxyXG4gICAgfVxyXG4gICAgZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50LnJlbW92ZUFsbCgpXHJcblxyXG4gICAgaWYgKCFyb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCkge1xyXG4gICAgICByb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCA9IG5ldyBHcmFwaGljc0xheWVyKHsgaWQ6ICdjcmFzaHJpc2stcm91dGVzJywgbGlzdE1vZGU6ICdoaWRlJyB9KVxyXG4gICAgICB2aWV3Lm1hcC5hZGQocm91dGVHcmFwaGljc0xheWVyUmVmLmN1cnJlbnQpXHJcbiAgICB9XHJcbiAgICByb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG5cclxuICAgIGlmIChza2V0Y2hWTVJlZi5jdXJyZW50KSBza2V0Y2hWTVJlZi5jdXJyZW50LmRlc3Ryb3koKVxyXG4gICAgY29uc3Qgc3ZtID0gbmV3IFNrZXRjaFZpZXdNb2RlbCh7XHJcbiAgICAgIHZpZXcsXHJcbiAgICAgIGxheWVyOiBncmFwaGljc0xheWVyUmVmLmN1cnJlbnQsXHJcbiAgICAgIHBvbHlnb25TeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1maWxsJywgY29sb3I6IFswLCAxMjEsIDE5MywgMC4xNV0sIG91dGxpbmU6IHsgY29sb3I6IFswLCAxMjEsIDE5M10sIHdpZHRoOiAyIH0gfVxyXG4gICAgfSlcclxuICAgIHNrZXRjaFZNUmVmLmN1cnJlbnQgPSBzdm1cclxuXHJcbiAgICBzdm0ub24oJ2NyZWF0ZScsIGFzeW5jIChldnQ6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoZXZ0LnN0YXRlICE9PSAnY29tcGxldGUnKSByZXR1cm5cclxuICAgICAgc2V0RHJhd2luZyhmYWxzZSlcclxuXHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBldnQuZ3JhcGhpYy5nZW9tZXRyeVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlSWRGaWVsZCB8fCAnY3VzdG9tcm91dGVmaWVsZCdcclxuICAgICAgICBjb25zdCBuYW1lRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlTmFtZUZpZWxkIHx8ICdyb3V0ZV9uYW1lJ1xyXG4gICAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICAgIGNvbnN0IHZpZXdXa2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICAgICAgLy8gVXNlIGVudmVsb3BlIGdlb21ldHJ5IGZvciBKU09OUCAocG9seWdvbiBKU09OIHRvbyBsYXJnZSBmb3IgR0VUKVxyXG4gICAgICAgIGNvbnN0IGV4dCA9IHBvbHlnb24uZXh0ZW50XHJcbiAgICAgICAgY29uc3QgZW52ZWxvcGVTdHIgPSBgJHtleHQueG1pbn0sJHtleHQueW1pbn0sJHtleHQueG1heH0sJHtleHQueW1heH1gXHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIGdlb21ldHJ5OiBlbnZlbG9wZVN0cixcclxuICAgICAgICAgIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeUVudmVsb3BlJyxcclxuICAgICAgICAgIGluU1I6IFN0cmluZyhleHQuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCBleHQuc3BhdGlhbFJlZmVyZW5jZT8ubGF0ZXN0V2tpZCB8fCB2aWV3V2tpZCksXHJcbiAgICAgICAgICBzcGF0aWFsUmVsOiAnZXNyaVNwYXRpYWxSZWxJbnRlcnNlY3RzJyxcclxuICAgICAgICAgIG91dEZpZWxkczogYCR7cm91dGVGaWVsZH0sJHtuYW1lRmllbGR9YCxcclxuICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgICByZXR1cm5NOiAndHJ1ZScsXHJcbiAgICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMjAwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdCh1cmwsIHBhcmFtcylcclxuICAgICAgICBjb25zdCBmZWF0dXJlcyA9IGRhdGEuZmVhdHVyZXMgfHwgW11cclxuICAgICAgICBpZiAoZmVhdHVyZXMubGVuZ3RoID09PSAwKSB7IHNldEVycm9yKCdObyByb3V0ZXMgZm91bmQgd2l0aGluIHRoZSBkcmF3biBwb2x5Z29uJyk7IHJldHVybiB9XHJcblxyXG4gICAgICAgIC8vIExvYWQgZ2VvbWV0cnkgbW9kdWxlcyBmb3IgY2xpcHBpbmcgcm91dGUgcG9seWxpbmVzIHRvIGFjdHVhbCBwb2x5Z29uXHJcbiAgICAgICAgY29uc3QgW2dlb21ldHJ5RW5naW5lLCBQb2x5bGluZSwgUG9seWdvbiwgR3JhcGhpYywgU2ltcGxlTGluZVN5bWJvbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L2dlb21ldHJ5RW5naW5lJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvbHlsaW5lJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvbHlnb24nKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1NpbXBsZUxpbmVTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgICAgIF0pXHJcblxyXG4gICAgICAgIC8vIFJlY29uc3RydWN0IHBvbHlnb24gZm9yIGNsaXAgb3BlcmF0aW9uc1xyXG4gICAgICAgIGNvbnN0IGNsaXBQb2x5Z29uID0gbmV3IFBvbHlnb24oeyByaW5nczogcG9seWdvbi5yaW5ncywgc3BhdGlhbFJlZmVyZW5jZTogcG9seWdvbi5zcGF0aWFsUmVmZXJlbmNlIH0pXHJcblxyXG4gICAgICAgIGNvbnN0IHJvdXRlTWFwID0gbmV3IE1hcDxzdHJpbmcsIHsgbWluTTogbnVtYmVyOyBtYXhNOiBudW1iZXIgfT4oKVxyXG4gICAgICAgIGNvbnN0IHJvdXRlTmFtZU1hcCA9IG5ldyBNYXA8c3RyaW5nLCBzdHJpbmc+KClcclxuICAgICAgICBjb25zdCByb3V0ZURpc3BsYXlQYXRocyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXJbXVtdW10+KClcclxuICAgICAgICBjb25zdCBwcmVjaXNpb24gPSAzXHJcblxyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiBmZWF0dXJlcykge1xyXG4gICAgICAgICAgY29uc3QgcmlkID0gU3RyaW5nKGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCBPYmplY3QudmFsdWVzKGYuYXR0cmlidXRlcylbMF0pXHJcbiAgICAgICAgICBpZiAoIXJvdXRlTmFtZU1hcC5oYXMocmlkKSAmJiBmLmF0dHJpYnV0ZXNbbmFtZUZpZWxkXSkgcm91dGVOYW1lTWFwLnNldChyaWQsIFN0cmluZyhmLmF0dHJpYnV0ZXNbbmFtZUZpZWxkXSkpXHJcblxyXG4gICAgICAgICAgaWYgKGYuZ2VvbWV0cnk/LnBhdGhzKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgcG9seWxpbmUgPSBuZXcgUG9seWxpbmUoe1xyXG4gICAgICAgICAgICAgICAgcGF0aHM6IGYuZ2VvbWV0cnkucGF0aHMsXHJcbiAgICAgICAgICAgICAgICBzcGF0aWFsUmVmZXJlbmNlOiBmLmdlb21ldHJ5LnNwYXRpYWxSZWZlcmVuY2UsXHJcbiAgICAgICAgICAgICAgICBoYXNNOiBmLmdlb21ldHJ5Lmhhc00gIT09IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgaGFzWjogZi5nZW9tZXRyeS5oYXNaID09PSB0cnVlXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICBjb25zdCBjbGlwcGVkID0gZ2VvbWV0cnlFbmdpbmUuaW50ZXJzZWN0KHBvbHlsaW5lLCBjbGlwUG9seWdvbilcclxuICAgICAgICAgICAgICBpZiAoY2xpcHBlZD8ucGF0aHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IG1JZHggPSBjbGlwcGVkLmhhc1ogPyAzIDogMlxyXG4gICAgICAgICAgICAgICAgY29uc3QgZXhpc3RpbmcgPSByb3V0ZU1hcC5nZXQocmlkKSB8fCB7IG1pbk06IEluZmluaXR5LCBtYXhNOiAtSW5maW5pdHkgfVxyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIGNsaXBwZWQucGF0aHMpIHtcclxuICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBwdCBvZiBwYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHB0Lmxlbmd0aCA+IG1JZHgpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG0gPSBwdFttSWR4XVxyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKG0gIT0gbnVsbCAmJiAhaXNOYU4obSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXhpc3RpbmcubWluTSA9IE1hdGgubWluKGV4aXN0aW5nLm1pbk0sIG0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nLm1heE0gPSBNYXRoLm1heChleGlzdGluZy5tYXhNLCBtKVxyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcm91dGVNYXAuc2V0KHJpZCwgZXhpc3RpbmcpXHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3RvcmUgY2xpcHBlZCBwYXRocyBmb3IgZGlzcGxheVxyXG4gICAgICAgICAgICAgICAgY29uc3QgY2xpcHBlZEpzb24gPSBjbGlwcGVkLnRvSlNPTiA/IGNsaXBwZWQudG9KU09OKCkgOiBjbGlwcGVkXHJcbiAgICAgICAgICAgICAgICBjb25zdCBjbGlwcGVkUGF0aHMgPSAoY2xpcHBlZEpzb24ucGF0aHMgfHwgW10pLm1hcCgocGF0aDogbnVtYmVyW11bXSkgPT4gcGF0aC5tYXAoKHB0OiBudW1iZXJbXSkgPT4gW3B0WzBdLCBwdFsxXV0pKVxyXG4gICAgICAgICAgICAgICAgY29uc3QgcHJldiA9IHJvdXRlRGlzcGxheVBhdGhzLmdldChyaWQpIHx8IFtdXHJcbiAgICAgICAgICAgICAgICBwcmV2LnB1c2goLi4uY2xpcHBlZFBhdGhzKVxyXG4gICAgICAgICAgICAgICAgcm91dGVEaXNwbGF5UGF0aHMuc2V0KHJpZCwgcHJldilcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdG9yZSBmdWxsIHZlcnRpY2VzIGZvciBsYXRlciBtZWFzdXJlIGludGVycG9sYXRpb24gaW4gYW5hbHlzaXNcclxuICAgICAgICAgICAgICAgIGNvbnN0IGFsbFZlcnRzOiBudW1iZXJbXVtdID0gZi5nZW9tZXRyeS5wYXRocy5mbGF0KClcclxuICAgICAgICAgICAgICAgIGlmICghcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnQuaGFzKHJpZCkpIHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LnNldChyaWQsIHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH0pXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogY2xpcCBmYWlsZWQsIHNraXAgKi8gfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJvdXRlTWFwLnNpemUgPT09IDApIHsgc2V0RXJyb3IoJ05vIHJvdXRlcyBmb3VuZCB3aXRoaW4gdGhlIGRyYXduIHBvbHlnb24nKTsgcmV0dXJuIH1cclxuXHJcbiAgICAgICAgLy8gQWRkIGNsaXBwZWQgcm91dGUgZ3JhcGhpY3MgYXMgcmVkIGRhc2hlZCBsaW5lc1xyXG4gICAgICAgIGNvbnN0IHJvdXRlU3ltYm9sID0gbmV3IFNpbXBsZUxpbmVTeW1ib2woeyBjb2xvcjogWzI1NSwgMCwgMCwgMC44NV0sIHdpZHRoOiAzLCBzdHlsZTogJ2Rhc2gnIH0pXHJcbiAgICAgICAgY29uc3QgcXVlcnlTUiA9IGZlYXR1cmVzWzBdPy5nZW9tZXRyeT8uc3BhdGlhbFJlZmVyZW5jZSB8fCBwb2x5Z29uLnNwYXRpYWxSZWZlcmVuY2VcclxuICAgICAgICBmb3IgKGNvbnN0IFtyaWQsIHBhdGhzXSBvZiByb3V0ZURpc3BsYXlQYXRocy5lbnRyaWVzKCkpIHtcclxuICAgICAgICAgIGNvbnN0IGRpc3BsYXlQb2x5bGluZSA9IG5ldyBQb2x5bGluZSh7IHBhdGhzLCBzcGF0aWFsUmVmZXJlbmNlOiBxdWVyeVNSIH0pXHJcbiAgICAgICAgICByb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudC5hZGQobmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICBnZW9tZXRyeTogZGlzcGxheVBvbHlsaW5lLFxyXG4gICAgICAgICAgICBzeW1ib2w6IHJvdXRlU3ltYm9sLFxyXG4gICAgICAgICAgICBhdHRyaWJ1dGVzOiB7IHJvdXRlSWQ6IHJpZCB9XHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IHJvdXRlcyA9IEFycmF5LmZyb20ocm91dGVNYXAuZW50cmllcygpKS5tYXAoKFtyaWQsIG1yXSkgPT4gKHtcclxuICAgICAgICAgIHJvdXRlSWQ6IHJpZCxcclxuICAgICAgICAgIHJvdXRlTmFtZTogcm91dGVOYW1lTWFwLmdldChyaWQpIHx8IG51bGwsXHJcbiAgICAgICAgICBmcm9tTWVhc3VyZTogbXIubWluTSA9PT0gSW5maW5pdHkgPyAwIDogcGFyc2VGbG9hdChtci5taW5NLnRvRml4ZWQocHJlY2lzaW9uKSksXHJcbiAgICAgICAgICB0b01lYXN1cmU6IG1yLm1heE0gPT09IC1JbmZpbml0eSB8fCBtci5tYXhNID09PSBJbmZpbml0eSA/IDAgOiBwYXJzZUZsb2F0KG1yLm1heE0udG9GaXhlZChwcmVjaXNpb24pKVxyXG4gICAgICAgIH0pKVxyXG5cclxuICAgICAgICBzZXRNYXBSb3V0ZXMocm91dGVzKVxyXG4gICAgICAgIHNldFNlbGVjdGVkTWFwUm91dGVJZHMobmV3IFNldChyb3V0ZXMubWFwKHIgPT4gci5yb3V0ZUlkKSkpXHJcbiAgICAgICAgc2V0U2VhcmNoTW9kZSgnbWFwJylcclxuICAgICAgfSBjYXRjaCAoZTogYW55KSB7XHJcbiAgICAgICAgc2V0RXJyb3IoJ0FyZWEgcXVlcnkgZmFpbGVkOiAnICsgKGUubWVzc2FnZSB8fCBlKSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICBzdm0uY3JlYXRlKCdwb2x5Z29uJylcclxuICB9LCBbY29uZmlnXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gUVVFUlkgRVZFTlQgREFUQSAoaW50ZXJuYWwsIHRyaWdnZXJlZCBieSBSdW4pID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IHF1ZXJ5RXZlbnREYXRhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCk6IFByb21pc2U8YW55W10+ID0+IHtcclxuICAgIGlmICghbHJzU2VydmljZVJlZi5jdXJyZW50KSB0aHJvdyBuZXcgRXJyb3IoJ05vIExSUyBzZXJ2aWNlIGNvbmZpZ3VyZWQnKVxyXG5cclxuICAgIGNvbnN0IGV2ZW50Q29uZmlncyA9IGNvbmZpZy5ldmVudExheWVyQ29uZmlncyB8fCBbXVxyXG5cclxuICAgIGxldCByb3V0ZUlkczogc3RyaW5nW10gPSBbXVxyXG4gICAgaWYgKHNlYXJjaE1vZGUgPT09ICdtYXAnKSB7XHJcbiAgICAgIHJvdXRlSWRzID0gQXJyYXkuZnJvbShzZWxlY3RlZE1hcFJvdXRlSWRzKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKCFyb3V0ZUlkLnRyaW0oKSkgdGhyb3cgbmV3IEVycm9yKCdFbnRlciBhIFJvdXRlIElEIG9yIHNlbGVjdCBmcm9tIG1hcC4nKVxyXG4gICAgICByb3V0ZUlkcyA9IFtyb3V0ZUlkLnRyaW0oKV1cclxuICAgIH1cclxuICAgIGlmIChyb3V0ZUlkcy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gcm91dGVzIHNlbGVjdGVkLicpXHJcblxyXG4gICAgY29uc3QgYWxsRW50cmllczogYW55W10gPSBbXVxyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBldmVudENvbmZpZ3MpIHtcclxuICAgICAgY29uc3QgbGF5ZXJVcmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NmZy5sYXllcklkfS9xdWVyeWBcclxuICAgICAgLy8gVXNlIGRpc2NvdmVyZWQgZmllbGQgbmFtZXMgZnJvbSBMUlMgbWV0YWRhdGEgKGZhbGwgYmFjayB0byBjb25maWcsIHRoZW4gZGVmYXVsdHMpXHJcbiAgICAgIGNvbnN0IGRpc2NvdmVyZWQgPSBldmVudEZpZWxkTmFtZXNSZWYuY3VycmVudC5nZXQoY2ZnLmxheWVySWQpXHJcbiAgICAgIGNvbnN0IHJvdXRlSWRGaWVsZCA9IGRpc2NvdmVyZWQ/LnJvdXRlSWRGaWVsZCB8fCBjZmcucm91dGVJZEZpZWxkIHx8ICdyb3V0ZWlkJ1xyXG4gICAgICBjb25zdCBtZWFzdXJlRmllbGQgPSBkaXNjb3ZlcmVkPy5tZWFzdXJlRmllbGQgfHwgY2ZnLm1lYXN1cmVGaWVsZCB8fCBjZmcuZnJvbU1lYXN1cmVGaWVsZCB8fCAnbWVhc3VyZSdcclxuICAgICAgY29uc3QgZnJvbU1lYXN1cmVGaWVsZCA9IGRpc2NvdmVyZWQ/LmZyb21NZWFzdXJlRmllbGQgfHwgY2ZnLmZyb21NZWFzdXJlRmllbGQgfHwgJ2Zyb21fbWVhc3VyZSdcclxuXHJcbiAgICAgIGZvciAoY29uc3QgcmlkIG9mIHJvdXRlSWRzKSB7XHJcbiAgICAgICAgY29uc3Qgd2hlcmUgPSBgJHtyb3V0ZUlkRmllbGR9ID0gJyR7cmlkLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYFxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIHdoZXJlLFxyXG4gICAgICAgICAgb3V0RmllbGRzOiAnKicsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KGxheWVyVXJsLCBwYXJhbXMpXHJcbiAgICAgICAgZm9yIChjb25zdCBmIG9mIChkYXRhLmZlYXR1cmVzIHx8IFtdKSkge1xyXG4gICAgICAgICAgYWxsRW50cmllcy5wdXNoKHtcclxuICAgICAgICAgICAgRmVhdHVyZTogY2ZnLm5hbWUsXHJcbiAgICAgICAgICAgIFJvdXRlSUQ6IGYuYXR0cmlidXRlc1tyb3V0ZUlkRmllbGRdIHx8IGYuYXR0cmlidXRlc1sncm91dGVpZCddLFxyXG4gICAgICAgICAgICBNZWFzdXJlOiBmLmF0dHJpYnV0ZXNbbWVhc3VyZUZpZWxkXSA/PyBmLmF0dHJpYnV0ZXNbZnJvbU1lYXN1cmVGaWVsZF0sXHJcbiAgICAgICAgICAgIC4uLk9iamVjdC5mcm9tRW50cmllcygoY2ZnLmF0dHJpYnV0ZXMgfHwgW10pLm1hcChhID0+IFthLCBmLmF0dHJpYnV0ZXNbYV1dKSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRW5zdXJlIHJvdXRlIGdlb21ldHJpZXMgYXJlIGNhY2hlZFxyXG4gICAgZm9yIChjb25zdCByaWQgb2Ygcm91dGVJZHMpIHtcclxuICAgICAgaWYgKCFyb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5oYXMocmlkKSkge1xyXG4gICAgICAgIGF3YWl0IGZldGNoUm91dGVNZWFzdXJlcyhyaWQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYWxsRW50cmllc1xyXG4gIH0sIFtjb25maWcsIHJvdXRlSWQsIHNlYXJjaE1vZGUsIHNlbGVjdGVkTWFwUm91dGVJZHMsIGZldGNoUm91dGVNZWFzdXJlc10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IERJU1BMQVkgT04gTUFQID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IGRpc3BsYXlQcmVkaWN0aW9uT25NYXAgPSB1c2VDYWxsYmFjayhhc3luYyAobGF5ZXJVcmw6IHN0cmluZywgdG9rZW46IHN0cmluZywgd2tpZDogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgIGlmICghdmlldykgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgW0ZlYXR1cmVMYXllcl0gPSBhd2FpdCBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9sYXllcnMvRmVhdHVyZUxheWVyJ10sICguLi5tb2RzOiBhbnlbXSkgPT4gcmVzb2x2ZShtb2RzKSlcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgZXhpc3RpbmdMYXllciA9IHZpZXcubWFwLmFsbExheWVycy5maW5kKChsOiBhbnkpID0+IGwudGl0bGUgPT09ICdDcmFzaCBSaXNrIFByZWRpY3Rpb24nKVxyXG4gICAgaWYgKGV4aXN0aW5nTGF5ZXIpIHZpZXcubWFwLnJlbW92ZShleGlzdGluZ0xheWVyKVxyXG5cclxuICAgIGNvbnN0IHByZWRpY3Rpb25MYXllciA9IG5ldyBGZWF0dXJlTGF5ZXIoe1xyXG4gICAgICB1cmw6IGxheWVyVXJsLFxyXG4gICAgICB0aXRsZTogJ0NyYXNoIFJpc2sgUHJlZGljdGlvbicsXHJcbiAgICAgIGN1c3RvbVBhcmFtZXRlcnM6IHsgdG9rZW4gfSxcclxuICAgICAgZGVmaW5pdGlvbkV4cHJlc3Npb246ICdyaXNrX3Njb3JlID4gMCcsXHJcbiAgICAgIHJlbmRlcmVyOiB7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzLWJyZWFrcycsXHJcbiAgICAgICAgZmllbGQ6ICdyaXNrX3Njb3JlJyxcclxuICAgICAgICBjbGFzc0JyZWFrSW5mb3M6IFtcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDEsIG1heFZhbHVlOiAyNSwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbNTYsIDE2OCwgMCwgMjAwXSwgd2lkdGg6IDMgfSwgbGFiZWw6ICdMb3cgUmlzayAoMS0yNSknIH0sXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiAyNiwgbWF4VmFsdWU6IDUwLCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFsyNTUsIDI1NSwgMCwgMjIwXSwgd2lkdGg6IDQgfSwgbGFiZWw6ICdNZWRpdW0gUmlzayAoMjYtNTApJyB9LFxyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogNTEsIG1heFZhbHVlOiA3NSwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbMjU1LCAxMjgsIDAsIDIzMF0sIHdpZHRoOiA1IH0sIGxhYmVsOiAnTWVkaXVtLUhpZ2ggUmlzayAoNTEtNzUpJyB9LFxyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogNzYsIG1heFZhbHVlOiAxMDAsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzI1NSwgMCwgMCwgMjU1XSwgd2lkdGg6IDYgfSwgbGFiZWw6ICdIaWdoIFJpc2sgKDc2LTEwMCknIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHBvcHVwVGVtcGxhdGU6IHtcclxuICAgICAgICB0aXRsZTogJ0NyYXNoIFJpc2s6IHtyaXNrX2xldmVsfScsXHJcbiAgICAgICAgY29udGVudDogYDxkaXYgc3R5bGU9XCJmb250LXNpemU6MTNweFwiPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206OHB4O3BhZGRpbmctYm90dG9tOjhweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZTBlMGUwXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjI0cHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOntleHByZXNzaW9uL3Jpc2tDb2xvcn1cIj57cmlza19zY29yZX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiY29sb3I6IzY2Njtmb250LXNpemU6MTJweFwiPi8xMDAgcmlzayBzY29yZTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPHRhYmxlIHN0eWxlPVwiYm9yZGVyLWNvbGxhcHNlOmNvbGxhcHNlO3dpZHRoOjEwMCVcIj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPlJvdXRlPC90ZD48dGQ+e3JvdXRlaWR9PC90ZD48L3RyPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+U2VnbWVudDwvdGQ+PHRkPk0ge2Zyb21fbX0gXFx1MjAxMyB7dG9fbX08L3RkPjwvdHI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5SaXNrIExldmVsPC90ZD48dGQgc3R5bGU9XCJmb250LXdlaWdodDo3MDBcIj57cmlza19sZXZlbH08L3RkPjwvdHI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5Db250cmlidXRpbmcgRmFjdG9yczwvdGQ+PHRkPntjb250cmlidXRpbmdfZmFjdG9yc308L3RkPjwvdHI+XHJcbiAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgZXhwcmVzc2lvbkluZm9zOiBbe1xyXG4gICAgICAgICAgbmFtZTogJ3Jpc2tDb2xvcicsXHJcbiAgICAgICAgICBleHByZXNzaW9uOiBgdmFyIHMgPSAkZmVhdHVyZS5yaXNrX3Njb3JlOyBXaGVuKHMgPiA3NSwgJyNkMzJmMmYnLCBzID4gNTAsICcjZjU3YzAwJywgcyA+IDI1LCAnI2ZiYzAyZCcsIHMgPiAwLCAnIzM4OGUzYycsICcjOTk5JylgXHJcbiAgICAgICAgfV1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIHZpZXcubWFwLmFkZChwcmVkaWN0aW9uTGF5ZXIpXHJcbiAgICBwcmVkaWN0aW9uTGF5ZXJSZWYuY3VycmVudCA9IHByZWRpY3Rpb25MYXllclxyXG4gICAgcHJlZGljdGlvbkxheWVyLndoZW4oKCkgPT4ge1xyXG4gICAgICBwcmVkaWN0aW9uTGF5ZXIucXVlcnlFeHRlbnQoKS50aGVuKChyOiBhbnkpID0+IHtcclxuICAgICAgICBpZiAoci5leHRlbnQpIHZpZXcuZ29UbyhyLmV4dGVudC5leHBhbmQoMS4yKSlcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIERpc3BsYXkgY3Jhc2ggZXZlbnQgcG9pbnRzIG9uIG1hcFxyXG4gIGNvbnN0IGRpc3BsYXlDcmFzaEV2ZW50c09uTWFwID0gdXNlQ2FsbGJhY2soYXN5bmMgKGNyYXNoRW50cmllczogYW55W10sIHJvdXRlR2VvbWV0cmllczogTWFwPHN0cmluZywgeyB2ZXJ0aWNlczogbnVtYmVyW11bXTsgbUlkeDogbnVtYmVyIH0+KSA9PiB7XHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgIGlmICghdmlldyB8fCBjcmFzaEVudHJpZXMubGVuZ3RoID09PSAwKSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBbR3JhcGhpY3NMYXllciwgR3JhcGhpYywgUG9pbnQsIFNpbXBsZU1hcmtlclN5bWJvbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvbGF5ZXJzL0dyYXBoaWNzTGF5ZXInKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9HcmFwaGljJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvZ2VvbWV0cnkvUG9pbnQnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1NpbXBsZU1hcmtlclN5bWJvbCcpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pXHJcbiAgICBdKVxyXG5cclxuICAgIGlmIChjcmFzaEV2ZW50c0xheWVyUmVmLmN1cnJlbnQpIHsgdmlldy5tYXAucmVtb3ZlKGNyYXNoRXZlbnRzTGF5ZXJSZWYuY3VycmVudCk7IGNyYXNoRXZlbnRzTGF5ZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG5cclxuICAgIGNvbnN0IGdsID0gbmV3IEdyYXBoaWNzTGF5ZXIoeyBpZDogJ19fY3Jhc2hyaXNrX2V2ZW50c19fJywgdGl0bGU6ICdDcmFzaCBFdmVudHMgKEFJIElucHV0KScgfSlcclxuXHJcbiAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGNyYXNoRW50cmllcykge1xyXG4gICAgICBpZiAoZW50cnkuTWVhc3VyZSA9PSBudWxsIHx8IGVudHJ5LlJvdXRlSUQgPT0gbnVsbCkgY29udGludWVcclxuICAgICAgY29uc3QgcmQgPSByb3V0ZUdlb21ldHJpZXMuZ2V0KGVudHJ5LlJvdXRlSUQpXHJcbiAgICAgIGlmICghcmQpIGNvbnRpbnVlXHJcbiAgICAgIGNvbnN0IHsgdmVydGljZXMsIG1JZHggfSA9IHJkXHJcbiAgICAgIGNvbnN0IG0gPSBwYXJzZUZsb2F0KGVudHJ5Lk1lYXN1cmUpXHJcbiAgICAgIGlmIChpc05hTihtKSkgY29udGludWVcclxuXHJcbiAgICAgIC8vIEludGVycG9sYXRlIHBvaW50XHJcbiAgICAgIGxldCBweCA9IDAsIHB5ID0gMCwgZm91bmQgPSBmYWxzZVxyXG4gICAgICBpZiAobSA8PSAodmVydGljZXNbMF1bbUlkeF0gfHwgMCkpIHsgcHggPSB2ZXJ0aWNlc1swXVswXTsgcHkgPSB2ZXJ0aWNlc1swXVsxXTsgZm91bmQgPSB0cnVlIH1cclxuICAgICAgZWxzZSBpZiAobSA+PSAodmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bbUlkeF0gfHwgMCkpIHsgcHggPSB2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVswXTsgcHkgPSB2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVsxXTsgZm91bmQgPSB0cnVlIH1cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgIGNvbnN0IG0xID0gdmVydGljZXNbaV1bbUlkeF0gfHwgMCwgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgaWYgKG0gPj0gbTEgJiYgbSA8PSBtMikge1xyXG4gICAgICAgICAgICBjb25zdCBmcmFjID0gbTIgIT09IG0xID8gKG0gLSBtMSkgLyAobTIgLSBtMSkgOiAwXHJcbiAgICAgICAgICAgIHB4ID0gdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKVxyXG4gICAgICAgICAgICBweSA9IHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSlcclxuICAgICAgICAgICAgZm91bmQgPSB0cnVlXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmICghZm91bmQpIGNvbnRpbnVlXHJcblxyXG4gICAgICBnbC5hZGQobmV3IEdyYXBoaWMoe1xyXG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBweCwgeTogcHksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICBzeW1ib2w6IG5ldyBTaW1wbGVNYXJrZXJTeW1ib2woeyBjb2xvcjogWzIwMCwgMzAsIDMwLCAxODBdLCBzaXplOiA3LCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NSwgMjAwXSwgd2lkdGg6IDEgfSB9KSxcclxuICAgICAgICBhdHRyaWJ1dGVzOiBlbnRyeSxcclxuICAgICAgICBwb3B1cFRlbXBsYXRlOiB7IHRpdGxlOiAnQ3Jhc2ggRXZlbnQnLCBjb250ZW50OiBgUm91dGU6ICR7ZW50cnkuUm91dGVJRH0sIE06ICR7bS50b0ZpeGVkKDMpfWAgfVxyXG4gICAgICB9KSlcclxuICAgIH1cclxuXHJcbiAgICB2aWV3Lm1hcC5hZGQoZ2wsIDApXHJcbiAgICBjcmFzaEV2ZW50c0xheWVyUmVmLmN1cnJlbnQgPSBnbFxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBOWSBTVEFURSBDUkFTSCBNT0RFTCA9PT09PT09PT09PT09PT09PT09PVxyXG4gIGNvbnN0IE5ZX1NUQVRFX0NSQVNIX01PREVMID0ge1xyXG4gICAgdG90YWxDcmFzaGVzOiAxNTI1MTIzLFxyXG4gICAgdG90YWxGYXRhbDogNDIwOCxcclxuICAgIHllYXJzOiAnMjAyMS0yMDI0JyxcclxuICAgIHNvdXJjZTogJ05ZIFN0YXRlIERNViB2aWEgZGF0YS5ueS5nb3YnLFxyXG4gICAgcm9hZEdlb21ldHJ5OiB7XHJcbiAgICAgICdTdHJhaWdodCBhbmQgTGV2ZWwnOiB7IGNyYXNoZXM6IDExNzgyMjgsIGZhdGFsOiAyODM0LCB3ZWlnaHQ6IDEuMCB9LFxyXG4gICAgICAnU3RyYWlnaHQgYW5kIEdyYWRlJzogeyBjcmFzaGVzOiAxMjY0NjQsIGZhdGFsOiA0MjksIHdlaWdodDogMS40MSB9LFxyXG4gICAgICAnQ3VydmUgYW5kIExldmVsJzogeyBjcmFzaGVzOiA3MjM0OSwgZmF0YWw6IDQ5Nywgd2VpZ2h0OiAyLjg2IH0sXHJcbiAgICAgICdDdXJ2ZSBhbmQgR3JhZGUnOiB7IGNyYXNoZXM6IDQ3NDk3LCBmYXRhbDogMzE2LCB3ZWlnaHQ6IDIuNzcgfSxcclxuICAgICAgJ0N1cnZlIGF0IEhpbGwgQ3Jlc3QnOiB7IGNyYXNoZXM6IDY4NjAsIGZhdGFsOiA1NCwgd2VpZ2h0OiAzLjI4IH0sXHJcbiAgICAgICdTdHJhaWdodCBhdCBIaWxsIENyZXN0JzogeyBjcmFzaGVzOiAyMTU5NywgZmF0YWw6IDc1LCB3ZWlnaHQ6IDEuNDUgfVxyXG4gICAgfSxcclxuICAgIHRyYWZmaWNDb250cm9sOiB7XHJcbiAgICAgICdOb25lJzogeyBjcmFzaGVzOiA4NzIwNTYsIGZhdGFsOiAyNDU3LCB3ZWlnaHQ6IDEuMTcgfSxcclxuICAgICAgJ1RyYWZmaWMgU2lnbmFsJzogeyBjcmFzaGVzOiAzMTgwNjUsIGZhdGFsOiA4MjYsIHdlaWdodDogMS4wOCB9LFxyXG4gICAgICAnU3RvcCBTaWduJzogeyBjcmFzaGVzOiAxMzE2NjQsIGZhdGFsOiAyNjYsIHdlaWdodDogMC44NCB9LFxyXG4gICAgICAnTm8gUGFzc2luZyBab25lJzogeyBjcmFzaGVzOiA4NTM5NiwgZmF0YWw6IDU1Nywgd2VpZ2h0OiAyLjcyIH0sXHJcbiAgICAgICdZaWVsZCBTaWduJzogeyBjcmFzaGVzOiAxMjg4MCwgZmF0YWw6IDgsIHdlaWdodDogMC4yNiB9LFxyXG4gICAgICAnQ29uc3RydWN0aW9uIFdvcmsgQXJlYSc6IHsgY3Jhc2hlczogNDQyOSwgZmF0YWw6IDksIHdlaWdodDogMC44NSB9LFxyXG4gICAgICAnRmxhc2hpbmcgTGlnaHQnOiB7IGNyYXNoZXM6IDMwNjMsIGZhdGFsOiAxMCwgd2VpZ2h0OiAxLjM2IH0sXHJcbiAgICAgICdSUiBDcm9zc2luZyBHYXRlcyc6IHsgY3Jhc2hlczogODc4LCBmYXRhbDogNywgd2VpZ2h0OiAzLjMyIH0sXHJcbiAgICAgICdTY2hvb2wgWm9uZSc6IHsgY3Jhc2hlczogNjM3LCBmYXRhbDogMSwgd2VpZ2h0OiAwLjY1IH1cclxuICAgIH0sXHJcbiAgICByb2FkU3VyZmFjZToge1xyXG4gICAgICAnRHJ5JzogeyBjcmFzaGVzOiAxMTMwMjExLCBmYXRhbDogMzEwMiwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ1dldCc6IHsgY3Jhc2hlczogMjM0NjAzLCBmYXRhbDogNjUxLCB3ZWlnaHQ6IDEuMDEgfSxcclxuICAgICAgJ1Nub3cvSWNlJzogeyBjcmFzaGVzOiA3MjY3NiwgZmF0YWw6IDIyMiwgd2VpZ2h0OiAxLjExIH0sXHJcbiAgICAgICdTbHVzaCc6IHsgY3Jhc2hlczogNTc1NywgZmF0YWw6IDE0LCB3ZWlnaHQ6IDAuODkgfSxcclxuICAgICAgJ0Zsb29kZWQgV2F0ZXInOiB7IGNyYXNoZXM6IDUwOCwgZmF0YWw6IDMsIHdlaWdodDogMi4xNSB9LFxyXG4gICAgICAnTXVkZHknOiB7IGNyYXNoZXM6IDY0OCwgZmF0YWw6IDMsIHdlaWdodDogMS42OSB9XHJcbiAgICB9LFxyXG4gICAgbGlnaHRpbmc6IHtcclxuICAgICAgJ0RheWxpZ2h0JzogeyBjcmFzaGVzOiA5MzMyMTAsIGZhdGFsOiAxODY3LCB3ZWlnaHQ6IDAuODMgfSxcclxuICAgICAgJ0RhcmstUm9hZCBMaWdodGVkJzogeyBjcmFzaGVzOiAyNzg5ODIsIGZhdGFsOiA4NzYsIHdlaWdodDogMS4zMSB9LFxyXG4gICAgICAnRGFyay1Sb2FkIFVubGlnaHRlZCc6IHsgY3Jhc2hlczogMTQ4NjM1LCBmYXRhbDogMTAwNSwgd2VpZ2h0OiAyLjgyIH0sXHJcbiAgICAgICdEdXNrJzogeyBjcmFzaGVzOiA0ODc0MCwgZmF0YWw6IDIyMSwgd2VpZ2h0OiAxLjg5IH0sXHJcbiAgICAgICdEYXduJzogeyBjcmFzaGVzOiAzNzg0OCwgZmF0YWw6IDIzOSwgd2VpZ2h0OiAyLjYzIH1cclxuICAgIH0sXHJcbiAgICB3ZWF0aGVyOiB7XHJcbiAgICAgICdDbGVhcic6IHsgY3Jhc2hlczogOTM1ODk3LCBmYXRhbDogMjY3OSwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ0Nsb3VkeSc6IHsgY3Jhc2hlczogMjk1NzMyLCBmYXRhbDogNzAwLCB3ZWlnaHQ6IDAuODMgfSxcclxuICAgICAgJ1JhaW4nOiB7IGNyYXNoZXM6IDEzOTU1OSwgZmF0YWw6IDQxOSwgd2VpZ2h0OiAxLjA1IH0sXHJcbiAgICAgICdTbm93JzogeyBjcmFzaGVzOiA1ODc2MywgZmF0YWw6IDE4Mywgd2VpZ2h0OiAxLjA5IH0sXHJcbiAgICAgICdTbGVldC9IYWlsL0ZyZWV6aW5nIFJhaW4nOiB7IGNyYXNoZXM6IDk0ODMsIGZhdGFsOiAyOCwgd2VpZ2h0OiAxLjAzIH0sXHJcbiAgICAgICdGb2cvU21vZy9TbW9rZSc6IHsgY3Jhc2hlczogNDc5MiwgZmF0YWw6IDQ1LCB3ZWlnaHQ6IDMuOTEgfVxyXG4gICAgfSxcclxuICAgIGxyc01hcHBpbmc6IHtcclxuICAgICAgJ0N1cnZlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xlZnQnOiAnQ3VydmUgYW5kIExldmVsJywgJ1JpZ2h0JzogJ0N1cnZlIGFuZCBMZXZlbCcsICdDb21wb3VuZCc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnUmV2ZXJzZSc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnU2ltcGxlJzogJ0N1cnZlIGFuZCBMZXZlbCcgfSB9LFxyXG4gICAgICAnR3JhZGUnOiB7IHN0YXRlRmllbGQ6ICdyb2FkR2VvbWV0cnknLCB2YWx1ZU1hcDogeyAnTGV2ZWwnOiAnU3RyYWlnaHQgYW5kIExldmVsJywgJ0ZsYXQnOiAnU3RyYWlnaHQgYW5kIExldmVsJywgJ1JvbGxpbmcnOiAnU3RyYWlnaHQgYW5kIEdyYWRlJywgJ01vdW50YWlub3VzJzogJ0N1cnZlIGFuZCBHcmFkZScsICdTdGVlcCc6ICdTdHJhaWdodCBhbmQgR3JhZGUnIH0gfSxcclxuICAgICAgJ1NwZWVkIExpbWl0JzogeyBzdGF0ZUZpZWxkOiAnc3BlZWQnLCBjdXN0b21XZWlnaHRzOiB7ICcyNSc6IDAuNywgJzMwJzogMC44LCAnMzUnOiAwLjksICc0MCc6IDEuMSwgJzQ1JzogMS4zLCAnNTAnOiAxLjYsICc1NSc6IDIuMCwgJzYwJzogMi4zLCAnNjUnOiAyLjYgfSB9LFxyXG4gICAgICAnRnVuY3Rpb25hbCBDbGFzcyc6IHsgc3RhdGVGaWVsZDogJ2Z1bmNDbGFzcycsIGN1c3RvbVdlaWdodHM6IHsgJ0ludGVyc3RhdGUnOiAxLjMsICdQcmluY2lwYWwgQXJ0ZXJpYWwnOiAxLjUsICdNaW5vciBBcnRlcmlhbCc6IDEuMiwgJ01ham9yIENvbGxlY3Rvcic6IDEuMCwgJ01pbm9yIENvbGxlY3Rvcic6IDAuOCwgJ0xvY2FsJzogMC42IH0gfSxcclxuICAgICAgJ01lZGlhbiBUeXBlJzogeyBzdGF0ZUZpZWxkOiAnbWVkaWFuJywgY3VzdG9tV2VpZ2h0czogeyAnTm9uZSc6IDEuOCwgJ1BhaW50ZWQnOiAxLjMsICdDdXJiZWQnOiAxLjAsICdQb3NpdGl2ZSBCYXJyaWVyJzogMC42LCAnRGVwcmVzc2VkJzogMC43LCAnR3Jhc3MnOiAwLjkgfSB9LFxyXG4gICAgICAnVGhyb3VnaCBMYW5lJzogeyBzdGF0ZUZpZWxkOiAnbGFuZXMnLCBjdXN0b21XZWlnaHRzOiB7ICcxJzogMC44LCAnMic6IDEuMCwgJzMnOiAxLjMsICc0JzogMS4xLCAnNSc6IDEuNCwgJzYnOiAxLjIgfSB9LFxyXG4gICAgICAnU2hvdWxkZXIgVHlwZSc6IHsgc3RhdGVGaWVsZDogJ3Nob3VsZGVyJywgY3VzdG9tV2VpZ2h0czogeyAnTm9uZSc6IDEuNiwgJ0dyYXZlbCc6IDEuMSwgJ1BhdmVkJzogMC44LCAnR3Jhc3MnOiAxLjIsICdDdXJiJzogMS4wIH0gfSxcclxuICAgICAgJ1BhdmVtZW50IFR5cGUnOiB7IHN0YXRlRmllbGQ6ICdwYXZlbWVudCcsIGN1c3RvbVdlaWdodHM6IHsgJ0FzcGhhbHQnOiAwLjksICdDb25jcmV0ZSc6IDEuMCwgJ0dyYXZlbCc6IDEuNSwgJ0JyaWNrJzogMS4yLCAnRGlydCc6IDEuOCwgJ0NvbXBvc2l0ZSc6IDAuOTUgfSB9LFxyXG4gICAgICAnVGVycmFpbiBUeXBlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xldmVsJzogJ1N0cmFpZ2h0IGFuZCBMZXZlbCcsICdSb2xsaW5nJzogJ1N0cmFpZ2h0IGFuZCBHcmFkZScsICdNb3VudGFpbm91cyc6ICdDdXJ2ZSBhbmQgR3JhZGUnIH0gfSxcclxuICAgICAgJ1BlcmNlbnQgUGFzc2luZyBTaWdodCc6IHsgc3RhdGVGaWVsZDogJ3Bhc3NTaWdodCcsIGN1c3RvbVdlaWdodHM6IHsgJzAnOiAyLjUsICcxMCc6IDIuMiwgJzIwJzogMS45LCAnMzAnOiAxLjYsICc0MCc6IDEuMywgJzUwJzogMS4xLCAnNjAnOiAxLjAsICc3MCc6IDAuOSwgJzgwJzogMC44NSwgJzkwJzogMC44LCAnMTAwJzogMC43NSB9IH0sXHJcbiAgICAgICdBY2Nlc3MgQ29udHJvbCc6IHsgc3RhdGVGaWVsZDogJ2FjY2VzcycsIGN1c3RvbVdlaWdodHM6IHsgJ0Z1bGwnOiAwLjYsICdQYXJ0aWFsJzogMS4wLCAnTm9uZSc6IDEuNSB9IH0sXHJcbiAgICAgICdPd25lcnNoaXAnOiB7IHN0YXRlRmllbGQ6ICdvd25lcnNoaXAnLCBjdXN0b21XZWlnaHRzOiB7ICdTdGF0ZSc6IDEuMCwgJ0NvdW50eSc6IDEuMSwgJ0NpdHknOiAxLjIsICdGZWRlcmFsJzogMC45LCAnUHJpdmF0ZSc6IDEuNCB9IH1cclxuICAgIH0gYXMgUmVjb3JkPHN0cmluZywgYW55PlxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gQUkgUFJFRElDVElPTiA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBydW5BSVByZWRpY3Rpb24gPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRSdW5uaW5nKHRydWUpXHJcbiAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIHNldFJlc3VsdChudWxsKVxyXG4gICAgc2V0U2hvd0V4cGxhbmF0aW9uKGZhbHNlKVxyXG4gICAgc2V0RmFjdG9ycyhudWxsKVxyXG4gICAgc2V0RXJyb3IobnVsbClcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZXNzaW9uID0gU2Vzc2lvbk1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5nZXRNYWluU2Vzc2lvbigpIGFzIGFueVxyXG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignTm90IHNpZ25lZCBpbi4nKVxyXG4gICAgICBjb25zdCB0b2tlbiA9IHNlc3Npb24udG9rZW5cclxuICAgICAgY29uc3QgcG9ydGFsVXJsID0gKHNlc3Npb24ucG9ydGFsIHx8ICcnKS5yZXBsYWNlKC9cXC9zaGFyaW5nXFwvcmVzdFxcLz8kLywgJycpXHJcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gc2Vzc2lvbi51c2VybmFtZVxyXG4gICAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgICAgY29uc3Qgd2tpZCA9IHZpZXc/LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcblxyXG4gICAgICAvLyBTdGVwIDE6IFF1ZXJ5IGV2ZW50IGRhdGFcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1F1ZXJ5aW5nIGV2ZW50IGRhdGEgZnJvbSBMUlMuLi4nKVxyXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCBxdWVyeUV2ZW50RGF0YSgpXHJcbiAgICAgIGlmIChldmVudERhdGEubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGV2ZW50IGRhdGEgZm91bmQgZm9yIHNlbGVjdGVkIHJvdXRlcy4nKVxyXG5cclxuICAgICAgLy8gU3RlcCAyOiBTZWdtZW50IHJvdXRlc1xyXG4gICAgICBzZXRQcm9ncmVzcygnU2VnbWVudGluZyByb3V0ZXMgaW50byAwLjUtbWlsZSBpbnRlcnZhbHMuLi4nKVxyXG4gICAgICBjb25zdCByb3V0ZUdlb21ldHJpZXMgPSByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudFxyXG4gICAgICBpZiAocm91dGVHZW9tZXRyaWVzLnNpemUgPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gcm91dGUgZ2VvbWV0cmllcyBjYWNoZWQuJylcclxuXHJcbiAgICAgIGNvbnN0IHNlZ21lbnRzOiBhbnlbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgW3JpZCwgcm91dGVEYXRhXSBvZiByb3V0ZUdlb21ldHJpZXMpIHtcclxuICAgICAgICBjb25zdCB7IHZlcnRpY2VzLCBtSWR4IH0gPSByb3V0ZURhdGFcclxuICAgICAgICBpZiAodmVydGljZXMubGVuZ3RoIDwgMikgY29udGludWVcclxuICAgICAgICBjb25zdCBtaW5NZWFzdXJlID0gdmVydGljZXNbMF1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IG1heE1lYXN1cmUgPSB2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3Qgcm91dGVMZW4gPSBtYXhNZWFzdXJlIC0gbWluTWVhc3VyZVxyXG4gICAgICAgIGlmIChyb3V0ZUxlbiA8PSAwKSBjb250aW51ZVxyXG5cclxuICAgICAgICBsZXQgc2VnRnJvbSA9IG1pbk1lYXN1cmVcclxuICAgICAgICBsZXQgc2VnSWR4ID0gMFxyXG4gICAgICAgIHdoaWxlIChzZWdGcm9tIDwgbWF4TWVhc3VyZSkge1xyXG4gICAgICAgICAgY29uc3Qgc2VnVG8gPSBNYXRoLm1pbihzZWdGcm9tICsgMC41LCBtYXhNZWFzdXJlKVxyXG4gICAgICAgICAgY29uc3QgbWlkTSA9IChzZWdGcm9tICsgc2VnVG8pIC8gMlxyXG4gICAgICAgICAgbGV0IG1pZFggPSAwLCBtaWRZID0gMFxyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGNvbnN0IG0yID0gdmVydGljZXNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgaWYgKG1pZE0gPj0gbTEgJiYgbWlkTSA8PSBtMikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZyYWMgPSBtMiAhPT0gbTEgPyAobWlkTSAtIG0xKSAvIChtMiAtIG0xKSA6IDBcclxuICAgICAgICAgICAgICBtaWRYID0gdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKVxyXG4gICAgICAgICAgICAgIG1pZFkgPSB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgcGF0aDogbnVtYmVyW11bXSA9IFtdXHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBtMSA9IHZlcnRpY2VzW2ldW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgY29uc3QgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBpZiAobTIgPCBzZWdGcm9tKSBjb250aW51ZVxyXG4gICAgICAgICAgICBpZiAobTEgPiBzZWdUbykgYnJlYWtcclxuICAgICAgICAgICAgaWYgKG0xID49IHNlZ0Zyb20gJiYgbTEgPD0gc2VnVG8pIHtcclxuICAgICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDAgfHwgcGF0aFtwYXRoLmxlbmd0aCAtIDFdWzBdICE9PSB2ZXJ0aWNlc1tpXVswXSkgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpXVswXSwgdmVydGljZXNbaV1bMV1dKVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG0xIDwgc2VnRnJvbSAmJiBtMiA+IHNlZ0Zyb20pIHtcclxuICAgICAgICAgICAgICBjb25zdCBmcmFjID0gKHNlZ0Zyb20gLSBtMSkgLyAobTIgLSBtMSlcclxuICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSksIHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSldKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtMiA+PSBzZWdGcm9tICYmIG0yIDw9IHNlZ1RvKSBwYXRoLnB1c2goW3ZlcnRpY2VzW2kgKyAxXVswXSwgdmVydGljZXNbaSArIDFdWzFdXSlcclxuICAgICAgICAgICAgZWxzZSBpZiAobTEgPCBzZWdUbyAmJiBtMiA+IHNlZ1RvKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZnJhYyA9IChzZWdUbyAtIG0xKSAvIChtMiAtIG0xKVxyXG4gICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKSwgdmVydGljZXNbaV1bMV0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVsxXSAtIHZlcnRpY2VzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+PSAyKSBzZWdtZW50cy5wdXNoKHsgcm91dGVJZDogcmlkLCBzZWdJZHgsIGZyb21NOiBzZWdGcm9tLCB0b006IHNlZ1RvLCBtaWRYLCBtaWRZLCBwYXRoLCBjcmFzaENvdW50OiAwLCBhdHRyczoge30gYXMgUmVjb3JkPHN0cmluZywgYW55PiB9KVxyXG4gICAgICAgICAgc2VnRnJvbSA9IHNlZ1RvXHJcbiAgICAgICAgICBzZWdJZHgrK1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlZ21lbnRzIGdlbmVyYXRlZC4nKVxyXG5cclxuICAgICAgLy8gU3RlcCAzOiBDb3VudCBjcmFzaGVzIHBlciBzZWdtZW50XHJcbiAgICAgIHNldFByb2dyZXNzKGBDb3VudGluZyBjcmFzaGVzIGFjcm9zcyAke3NlZ21lbnRzLmxlbmd0aH0gc2VnbWVudHMuLi5gKVxyXG4gICAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuICAgICAgY29uc3QgY3Jhc2hMYXllck5hbWVzID0gbmV3IFNldChldmVudENvbmZpZ3MuZmlsdGVyKGNmZyA9PiAvY3Jhc2h8YWNjaWRlbnR8Y29sbGlzaW9uL2kudGVzdChjZmcubmFtZSkpLm1hcChjZmcgPT4gY2ZnLm5hbWUpKVxyXG5cclxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBldmVudERhdGEpIHtcclxuICAgICAgICBpZiAoIWNyYXNoTGF5ZXJOYW1lcy5oYXMoZW50cnkuRmVhdHVyZSkpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYgKGVudHJ5Lk1lYXN1cmUgPT0gbnVsbCkgY29udGludWVcclxuICAgICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgICAgaWYgKHNlZy5yb3V0ZUlkID09PSBlbnRyeS5Sb3V0ZUlEICYmIGVudHJ5Lk1lYXN1cmUgPj0gc2VnLmZyb21NICYmIGVudHJ5Lk1lYXN1cmUgPCBzZWcudG9NKSB7XHJcbiAgICAgICAgICAgIHNlZy5jcmFzaENvdW50KytcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0ZXAgNDogRW5yaWNoIHdpdGggcm9hZCBhdHRyaWJ1dGVzXHJcbiAgICAgIHNldFByb2dyZXNzKCdFbnJpY2hpbmcgc2VnbWVudHMgd2l0aCByb2FkIGF0dHJpYnV0ZXMuLi4nKVxyXG4gICAgICBjb25zdCBub25DcmFzaExheWVycyA9IGV2ZW50Q29uZmlncy5maWx0ZXIoY2ZnID0+ICFjcmFzaExheWVyTmFtZXMuaGFzKGNmZy5uYW1lKSlcclxuICAgICAgY29uc3QgZW5yaWNoRmllbGRzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgY2ZnIG9mIG5vbkNyYXNoTGF5ZXJzKSB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXJFbnRyaWVzID0gZXZlbnREYXRhLmZpbHRlcihlID0+IGUuRmVhdHVyZSA9PT0gY2ZnLm5hbWUpXHJcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIChjZmcuYXR0cmlidXRlcyB8fCBbXSkpIHtcclxuICAgICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGAke2NmZy5uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnXycpLnN1YnN0cmluZygwLCAxNSl9XyR7YXR0ci5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJ18nKS5zdWJzdHJpbmcoMCwgMTUpfWAuc3Vic3RyaW5nKDAsIDMxKVxyXG4gICAgICAgICAgaWYgKCFlbnJpY2hGaWVsZHMuaW5jbHVkZXMoZmllbGROYW1lKSkgZW5yaWNoRmllbGRzLnB1c2goZmllbGROYW1lKVxyXG4gICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsYXllckVudHJpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudHJ5LlJvdXRlSUQgPT0gbnVsbCB8fCBlbnRyeS5NZWFzdXJlID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNlZy5yb3V0ZUlkID09PSBlbnRyeS5Sb3V0ZUlEICYmIGVudHJ5Lk1lYXN1cmUgPj0gc2VnLmZyb21NICYmIGVudHJ5Lk1lYXN1cmUgPCBzZWcudG9NKSB7XHJcbiAgICAgICAgICAgICAgICBzZWcuYXR0cnNbZmllbGROYW1lXSA9IGVudHJ5W2F0dHJdID8/ICcnXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RlcCA1OiBLZXJuZWwgZGVuc2l0eSBzY29yaW5nXHJcbiAgICAgIHNldFByb2dyZXNzKCdDb21wdXRpbmcgcmlzayBzY29yZXMuLi4nKVxyXG4gICAgICBjb25zdCBLRVJORUxfUkFESVVTID0gNVxyXG4gICAgICBjb25zdCBERUNBWSA9IDAuNVxyXG4gICAgICBjb25zdCBzZWdzQnlSb3V0ZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnlbXT4oKVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGlmICghc2Vnc0J5Um91dGUuaGFzKHNlZy5yb3V0ZUlkKSkgc2Vnc0J5Um91dGUuc2V0KHNlZy5yb3V0ZUlkLCBbXSlcclxuICAgICAgICBzZWdzQnlSb3V0ZS5nZXQoc2VnLnJvdXRlSWQpIS5wdXNoKHNlZylcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcmlza1Njb3JlczogbnVtYmVyW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlU2VncyA9IHNlZ3NCeVJvdXRlLmdldChzZWcucm91dGVJZCkgfHwgW11cclxuICAgICAgICBsZXQgc2NvcmUgPSBzZWcuY3Jhc2hDb3VudCAqIDJcclxuICAgICAgICBmb3IgKGNvbnN0IG5laWdoYm9yIG9mIHJvdXRlU2Vncykge1xyXG4gICAgICAgICAgaWYgKG5laWdoYm9yID09PSBzZWcpIGNvbnRpbnVlXHJcbiAgICAgICAgICBjb25zdCBkID0gTWF0aC5hYnMobmVpZ2hib3Iuc2VnSWR4IC0gc2VnLnNlZ0lkeClcclxuICAgICAgICAgIGlmIChkIDw9IEtFUk5FTF9SQURJVVMpIHNjb3JlICs9IG5laWdoYm9yLmNyYXNoQ291bnQgKiBNYXRoLnBvdyhERUNBWSwgZClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmlza1Njb3Jlcy5wdXNoKHNjb3JlKVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG1heFJpc2tTY29yZSA9IE1hdGgubWF4KC4uLnJpc2tTY29yZXMsIDEpXHJcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRTY29yZXMgPSByaXNrU2NvcmVzLm1hcChzID0+IE1hdGgucm91bmQoKHMgLyBtYXhSaXNrU2NvcmUpICogMTAwKSlcclxuXHJcbiAgICAgIC8vIFN0b3JlIGZhY3RvcnMgZm9yIGV4cGxhbmF0aW9uXHJcbiAgICAgIGNvbnN0IGhpZ2hSaXNrU2VncyA9IHNlZ21lbnRzLmZpbHRlcigoXywgaWR4KSA9PiBub3JtYWxpemVkU2NvcmVzW2lkeF0gPj0gNzUpXHJcbiAgICAgIGNvbnN0IHRvcEhpZ2hSaXNrID0gaGlnaFJpc2tTZWdzLm1hcChzZWcgPT4gKHsgLi4uc2VnLCByaXNrU2NvcmU6IG5vcm1hbGl6ZWRTY29yZXNbc2VnbWVudHMuaW5kZXhPZihzZWcpXSB9KSkuc29ydCgoYSwgYikgPT4gYi5yaXNrU2NvcmUgLSBhLnJpc2tTY29yZSkuc2xpY2UoMCwgNSlcclxuICAgICAgc2V0RmFjdG9ycyh7IHRvdGFsU2VnbWVudHM6IHNlZ21lbnRzLmxlbmd0aCwgc2VnbWVudHNXaXRoQ3Jhc2hlczogc2VnbWVudHMuZmlsdGVyKHMgPT4gcy5jcmFzaENvdW50ID4gMCkubGVuZ3RoLCBoaWdoUmlza0NvdW50OiBoaWdoUmlza1NlZ3MubGVuZ3RoLCBtYXhDcmFzaENvdW50OiBNYXRoLm1heCguLi5zZWdtZW50cy5tYXAocyA9PiBzLmNyYXNoQ291bnQpLCAxKSwgZW5yaWNoTGF5ZXJzOiBub25DcmFzaExheWVycy5tYXAobCA9PiBsLm5hbWUpLCBlbnJpY2hGaWVsZHMsIGtlcm5lbFJhZGl1czogS0VSTkVMX1JBRElVUywgdG9wSGlnaFJpc2tTZWdtZW50czogdG9wSGlnaFJpc2sgfSlcclxuXHJcbiAgICAgIC8vIERpc3BsYXkgY3Jhc2ggZXZlbnRzIG9uIG1hcCBhbmQgY29tcHV0ZSBjb3JyZWxhdGlvbnNcclxuICAgICAgY29uc3QgY3Jhc2hFbnRyaWVzID0gZXZlbnREYXRhLmZpbHRlcihlID0+IGNyYXNoTGF5ZXJOYW1lcy5oYXMoZS5GZWF0dXJlKSlcclxuICAgICAgZGlzcGxheUNyYXNoRXZlbnRzT25NYXAoY3Jhc2hFbnRyaWVzLCByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudClcclxuXHJcbiAgICAgIC8vIENvbXB1dGUgdG9wIGNvcnJlbGF0aW5nIGV2ZW50IGxheWVyIGF0dHJpYnV0ZXMgZm9yIGhpZ2gtcmlzayBzZWdtZW50c1xyXG4gICAgICBjb25zdCBoaWdoUmlza1NlZ1NldCA9IG5ldyBTZXQoaGlnaFJpc2tTZWdzKVxyXG4gICAgICBjb25zdCBhdHRyQ29ycmVsYXRpb25zOiBBcnJheTx7IGxheWVyOiBzdHJpbmc7IHZhbHVlOiBzdHJpbmc7IGNvdW50OiBudW1iZXI7IHBjdDogbnVtYmVyIH0+ID0gW11cclxuICAgICAgZm9yIChjb25zdCBjZmcgb2Ygbm9uQ3Jhc2hMYXllcnMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgKGNmZy5hdHRyaWJ1dGVzIHx8IFtdKSkge1xyXG4gICAgICAgICAgY29uc3QgZmllbGROYW1lID0gYCR7Y2ZnLm5hbWUucmVwbGFjZSgvW15hLXpBLVowLTldL2csICdfJykuc3Vic3RyaW5nKDAsIDE1KX1fJHthdHRyLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnXycpLnN1YnN0cmluZygwLCAxNSl9YC5zdWJzdHJpbmcoMCwgMzEpXHJcbiAgICAgICAgICBjb25zdCB2YWx1ZUNvdW50cyA9IG5ldyBNYXA8c3RyaW5nLCBudW1iZXI+KClcclxuICAgICAgICAgIGZvciAoY29uc3Qgc2VnIG9mIGhpZ2hSaXNrU2Vncykge1xyXG4gICAgICAgICAgICBjb25zdCB2ID0gc2VnLmF0dHJzW2ZpZWxkTmFtZV1cclxuICAgICAgICAgICAgaWYgKHYgIT0gbnVsbCAmJiB2ICE9PSAnJykgdmFsdWVDb3VudHMuc2V0KFN0cmluZyh2KSwgKHZhbHVlQ291bnRzLmdldChTdHJpbmcodikpIHx8IDApICsgMSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZvciAoY29uc3QgW3ZhbHVlLCBjb3VudF0gb2YgdmFsdWVDb3VudHMpIHtcclxuICAgICAgICAgICAgYXR0ckNvcnJlbGF0aW9ucy5wdXNoKHsgbGF5ZXI6IGNmZy5uYW1lLCB2YWx1ZTogYCR7YXR0cn06ICR7dmFsdWV9YCwgY291bnQsIHBjdDogTWF0aC5yb3VuZCgoY291bnQgLyBoaWdoUmlza1NlZ3MubGVuZ3RoKSAqIDEwMCkgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgYXR0ckNvcnJlbGF0aW9ucy5zb3J0KChhLCBiKSA9PiBiLnBjdCAtIGEucGN0KVxyXG4gICAgICBzZXRDcmFzaFN0YXRzKHsgdG90YWxDcmFzaGVzOiBjcmFzaEVudHJpZXMubGVuZ3RoLCB0b3BDb3JyZWxhdGlvbnM6IGF0dHJDb3JyZWxhdGlvbnMuc2xpY2UoMCwgNCkgfSlcclxuXHJcbiAgICAgIC8vIFN0ZXAgNjogVXBsb2FkIGFzIGZlYXR1cmUgc2VydmljZVxyXG4gICAgICBzZXRQcm9ncmVzcygnVXBsb2FkaW5nIHByZWRpY3Rpb24gbGF5ZXIuLi4nKVxyXG4gICAgICBjb25zdCBjb250ZW50VXJsID0gYCR7cG9ydGFsVXJsfS9zaGFyaW5nL3Jlc3QvY29udGVudC91c2Vycy8ke3VzZXJuYW1lfWBcclxuICAgICAgY29uc3QgZm9sZGVyVXJsID0gc2VsZWN0ZWRGb2xkZXJJZCA/IGAke2NvbnRlbnRVcmx9LyR7c2VsZWN0ZWRGb2xkZXJJZH1gIDogY29udGVudFVybFxyXG4gICAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IGBDcmFzaFJpc2tfQUlfJHtEYXRlLm5vdygpfWBcclxuXHJcbiAgICAgIGNvbnN0IGZpZWxkcyA9IFtcclxuICAgICAgICB7IG5hbWU6ICdPQkpFQ1RJRCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlT0lEJywgYWxpYXM6ICdPYmplY3RJRCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdyb3V0ZWlkJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1JvdXRlIElEJywgbGVuZ3RoOiAxMDAgfSxcclxuICAgICAgICB7IG5hbWU6ICdmcm9tX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnRnJvbSBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3RvX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnVG8gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICdjcmFzaF9jb3VudCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnQ3Jhc2ggQ291bnQnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19zY29yZScsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnUmlzayBTY29yZSAoMC0xMDApJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfbGV2ZWwnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUmlzayBMZXZlbCcsIGxlbmd0aDogMjAgfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250cmlidXRpbmdfZmFjdG9ycycsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdDb250cmlidXRpbmcgRmFjdG9ycycsIGxlbmd0aDogNTAwIH1cclxuICAgICAgXVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2NyZWF0ZVBhcmFtZXRlcnMnLCBKU09OLnN0cmluZ2lmeSh7IG5hbWU6IHNlcnZpY2VOYW1lLCBzZXJ2aWNlRGVzY3JpcHRpb246ICdBSSBjcmFzaCByaXNrIHByZWRpY3Rpb24nLCBoYXNTdGF0aWNEYXRhOiBmYWxzZSwgbWF4UmVjb3JkQ291bnQ6IDEwMDAwLCBzdXBwb3J0ZWRRdWVyeUZvcm1hdHM6ICdKU09OJywgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZycsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9LCBpbml0aWFsRXh0ZW50OiB7IHhtaW46IC0yMDAzNzUwOCwgeW1pbjogLTIwMDM3NTA4LCB4bWF4OiAyMDAzNzUwOCwgeW1heDogMjAwMzc1MDgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGFsbG93R2VvbWV0cnlVcGRhdGVzOiB0cnVlIH0pKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0YXJnZXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnb3V0cHV0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGlmIChzZWxlY3RlZEZvbGRlcklkKSBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmb2xkZXJJZCcsIHNlbGVjdGVkRm9sZGVySWQpXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwID0gYXdhaXQgZmV0Y2goYCR7Zm9sZGVyVXJsfS9jcmVhdGVTZXJ2aWNlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogY3JlYXRlUGFyYW1zIH0pXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3VsdCA9IGF3YWl0IGNyZWF0ZVJlc3AuanNvbigpXHJcbiAgICAgIGlmICghY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMICYmICFjcmVhdGVSZXN1bHQuc2VydmljZXVybCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlcnZpY2U6ICcgKyBKU09OLnN0cmluZ2lmeShjcmVhdGVSZXN1bHQpKVxyXG4gICAgICBjb25zdCBzZXJ2aWNlVXJsID0gY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMIHx8IGNyZWF0ZVJlc3VsdC5zZXJ2aWNldXJsXHJcbiAgICAgIGNvbnN0IHRlbXBJdGVtSWQgPSBjcmVhdGVSZXN1bHQuaXRlbUlkXHJcblxyXG4gICAgICBjb25zdCBhZG1pblVybCA9IHNlcnZpY2VVcmwucmVwbGFjZSgnL3Jlc3Qvc2VydmljZXMvJywgJy9yZXN0L2FkbWluL3NlcnZpY2VzLycpXHJcbiAgICAgIGNvbnN0IGFkZERlZlBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdhZGRUb0RlZmluaXRpb24nLCBKU09OLnN0cmluZ2lmeSh7IGxheWVyczogW3sgaWQ6IDAsIG5hbWU6ICdBSSBDcmFzaCBSaXNrJywgdHlwZTogJ0ZlYXR1cmUgTGF5ZXInLCBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2x5bGluZScsIGRpc3BsYXlGaWVsZDogJ3JvdXRlaWQnLCBmaWVsZHMsIG9iamVjdElkRmllbGQ6ICdPQkpFQ1RJRCcsIGhhc0F0dGFjaG1lbnRzOiBmYWxzZSwgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZyxDcmVhdGUsVXBkYXRlLERlbGV0ZScgfV0gfSkpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2FkbWluVXJsfS9hZGRUb0RlZmluaXRpb25gLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGREZWZQYXJhbXMgfSlcclxuXHJcbiAgICAgIC8vIFVwbG9hZCBmZWF0dXJlc1xyXG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHNlZ21lbnRzLmZpbHRlcigoXywgaWR4KSA9PiBub3JtYWxpemVkU2NvcmVzW2lkeF0gPiAwKS5tYXAoKHNlZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkeCA9IHNlZ21lbnRzLmluZGV4T2Yoc2VnKVxyXG4gICAgICAgIGNvbnN0IHJpc2tTY29yZSA9IG5vcm1hbGl6ZWRTY29yZXNbaWR4XVxyXG4gICAgICAgIGNvbnN0IHJpc2tMZXZlbCA9IHJpc2tTY29yZSA+PSA3NSA/ICdIaWdoJyA6IHJpc2tTY29yZSA+PSA0MCA/ICdNZWRpdW0nIDogcmlza1Njb3JlID4gMCA/ICdMb3cnIDogJ01pbmltYWwnXHJcbiAgICAgICAgY29uc3QgZmN0cnMgPSBPYmplY3QuZW50cmllcyhzZWcuYXR0cnMpLmZpbHRlcigoWywgdl0pID0+IHYgJiYgU3RyaW5nKHYpLnRyaW0oKSkuc2xpY2UoMCwgNSkubWFwKChbaywgdl0pID0+IGAke2t9PSR7dn1gKS5qb2luKCc7ICcpXHJcbiAgICAgICAgcmV0dXJuIHsgZ2VvbWV0cnk6IHsgcGF0aHM6IFtzZWcucGF0aF0sIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGF0dHJpYnV0ZXM6IHsgcm91dGVpZDogc2VnLnJvdXRlSWQsIGZyb21fbTogc2VnLmZyb21NLCB0b19tOiBzZWcudG9NLCBjcmFzaF9jb3VudDogc2VnLmNyYXNoQ291bnQsIHJpc2tfc2NvcmU6IHJpc2tTY29yZSwgcmlza19sZXZlbDogcmlza0xldmVsLCBjb250cmlidXRpbmdfZmFjdG9yczogZmN0cnMgfHwgJ0RlbnNpdHkgY2x1c3RlcicgfSB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSArPSAxMDAwKSB7XHJcbiAgICAgICAgY29uc3QgYmF0Y2ggPSBmZWF0dXJlcy5zbGljZShpLCBpICsgMTAwMClcclxuICAgICAgICBzZXRQcm9ncmVzcyhgVXBsb2FkaW5nLi4uICR7TWF0aC5taW4oaSArIDEwMDAsIGZlYXR1cmVzLmxlbmd0aCl9LyR7ZmVhdHVyZXMubGVuZ3RofWApXHJcbiAgICAgICAgY29uc3QgYWRkRmVhdFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmZWF0dXJlcycsIEpTT04uc3RyaW5naWZ5KGJhdGNoKSlcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgICBhd2FpdCBmZXRjaChgJHtzZXJ2aWNlVXJsfS8wL2FkZEZlYXR1cmVzYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRmVhdFBhcmFtcyB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaGFyZVxyXG4gICAgICBjb25zdCBzaGFyZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2V2ZXJ5b25lJywgJ2ZhbHNlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdvcmcnLCAndHJ1ZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnaXRlbXMnLCB0ZW1wSXRlbUlkKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7Y29udGVudFVybH0vaXRlbXMvJHt0ZW1wSXRlbUlkfS9zaGFyZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IHNoYXJlUGFyYW1zIH0pXHJcblxyXG4gICAgICBzZXRQcm9ncmVzcygnRGlzcGxheWluZyBvbiBtYXAuLi4nKVxyXG4gICAgICBhd2FpdCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwKGAke3NlcnZpY2VVcmx9LzBgLCB0b2tlbiwgd2tpZClcclxuICAgICAgc2V0UmVzdWx0KHsgbGF5ZXJVcmw6IHNlcnZpY2VVcmwsIGl0ZW1Vcmw6IGAke3BvcnRhbFVybH0vaG9tZS9pdGVtLmh0bWw/aWQ9JHt0ZW1wSXRlbUlkfWAgfSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdbQ3Jhc2hSaXNrIEFJXSBGYWlsZWQ6JywgZXJyKVxyXG4gICAgICBzZXRFcnJvcignQUkgcHJlZGljdGlvbiBmYWlsZWQ6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRSdW5uaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWcsIHF1ZXJ5RXZlbnREYXRhLCBzZWxlY3RlZEZvbGRlcklkLCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwLCBkaXNwbGF5Q3Jhc2hFdmVudHNPbk1hcF0pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IE1MIFBSRURJQ1RJT04gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgcnVuTUxQcmVkaWN0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0UnVubmluZyh0cnVlKVxyXG4gICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICBzZXRSZXN1bHQobnVsbClcclxuICAgIHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSlcclxuICAgIHNldE1vZGVsSW5mbyhudWxsKVxyXG4gICAgc2V0RXJyb3IobnVsbClcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZXNzaW9uID0gU2Vzc2lvbk1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5nZXRNYWluU2Vzc2lvbigpIGFzIGFueVxyXG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignTm90IHNpZ25lZCBpbi4nKVxyXG4gICAgICBjb25zdCB0b2tlbiA9IHNlc3Npb24udG9rZW5cclxuICAgICAgY29uc3QgcG9ydGFsVXJsID0gKHNlc3Npb24ucG9ydGFsIHx8ICcnKS5yZXBsYWNlKC9cXC9zaGFyaW5nXFwvcmVzdFxcLz8kLywgJycpXHJcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gc2Vzc2lvbi51c2VybmFtZVxyXG4gICAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgICAgaWYgKCF2aWV3KSB0aHJvdyBuZXcgRXJyb3IoJ05vIG1hcCB2aWV3IGF2YWlsYWJsZS4nKVxyXG4gICAgICBjb25zdCB3a2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG5cclxuICAgICAgLy8gU3RlcCAxOiBRdWVyeSBldmVudCBkYXRhXHJcbiAgICAgIHNldFByb2dyZXNzKCdRdWVyeWluZyByb2FkIGF0dHJpYnV0ZSBkYXRhIGZyb20gTFJTLi4uJylcclxuICAgICAgY29uc3QgZXZlbnREYXRhID0gYXdhaXQgcXVlcnlFdmVudERhdGEoKVxyXG5cclxuICAgICAgLy8gU3RlcCAyOiBTZWdtZW50IHJvdXRlc1xyXG4gICAgICBzZXRQcm9ncmVzcygnU2VnbWVudGluZyByb3V0ZXMgYXQgMC41LW1pbGUgaW50ZXJ2YWxzLi4uJylcclxuICAgICAgY29uc3Qgcm91dGVHZW9tZXRyaWVzID0gcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnRcclxuICAgICAgaWYgKHJvdXRlR2VvbWV0cmllcy5zaXplID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHJvdXRlIGdlb21ldHJpZXMuIFNlbGVjdCByb3V0ZXMgZmlyc3QuJylcclxuXHJcbiAgICAgIGNvbnN0IG1vZGVsID0gTllfU1RBVEVfQ1JBU0hfTU9ERUxcclxuXHJcbiAgICAgIC8vIEJ1aWxkIGV2ZW50IGxvb2t1cFxyXG4gICAgICBjb25zdCBldmVudExvb2t1cCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8bnVtYmVyLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pj4oKVxyXG4gICAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuICAgICAgZm9yIChjb25zdCBjZmcgb2YgZXZlbnRDb25maWdzKSB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXJFbnRyaWVzID0gZXZlbnREYXRhLmZpbHRlcihlID0+IGUuRmVhdHVyZSA9PT0gY2ZnLm5hbWUpXHJcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsYXllckVudHJpZXMpIHtcclxuICAgICAgICAgIGlmIChlbnRyeS5Sb3V0ZUlEID09IG51bGwgfHwgZW50cnkuTWVhc3VyZSA9PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgY29uc3QgcmlkID0gZW50cnkuUm91dGVJRFxyXG4gICAgICAgICAgaWYgKCFldmVudExvb2t1cC5oYXMocmlkKSkgZXZlbnRMb29rdXAuc2V0KHJpZCwgbmV3IE1hcCgpKVxyXG4gICAgICAgICAgY29uc3QgbUtleSA9IE1hdGgucm91bmQocGFyc2VGbG9hdChlbnRyeS5NZWFzdXJlKSAqIDIpIC8gMlxyXG4gICAgICAgICAgY29uc3Qgcm91dGVNYXAgPSBldmVudExvb2t1cC5nZXQocmlkKSFcclxuICAgICAgICAgIGlmICghcm91dGVNYXAuaGFzKG1LZXkpKSByb3V0ZU1hcC5zZXQobUtleSwge30pXHJcbiAgICAgICAgICBjb25zdCBzZWdEYXRhID0gcm91dGVNYXAuZ2V0KG1LZXkpIVxyXG4gICAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIChjZmcuYXR0cmlidXRlcyB8fCBbXSkpIHtcclxuICAgICAgICAgICAgaWYgKGVudHJ5W2F0dHJdICE9IG51bGwgJiYgU3RyaW5nKGVudHJ5W2F0dHJdKS50cmltKCkpIHtcclxuICAgICAgICAgICAgICBzZWdEYXRhW2Ake2NmZy5uYW1lfTo6JHthdHRyfWBdID0gU3RyaW5nKGVudHJ5W2F0dHJdKS50cmltKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RlcCAzOiBTY29yZSBzZWdtZW50c1xyXG4gICAgICBzZXRQcm9ncmVzcygnQXBwbHlpbmcgc3RhdGUgY3Jhc2ggbW9kZWwgd2VpZ2h0cy4uLicpXHJcbiAgICAgIGNvbnN0IHNlZ21lbnRzOiBhbnlbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgW3JpZCwgcmRdIG9mIHJvdXRlR2VvbWV0cmllcy5lbnRyaWVzKCkpIHtcclxuICAgICAgICBjb25zdCB2ZXJ0cyA9IHJkLnZlcnRpY2VzXHJcbiAgICAgICAgaWYgKHZlcnRzLmxlbmd0aCA8IDIpIGNvbnRpbnVlXHJcbiAgICAgICAgY29uc3Qgc3RhcnRNID0gdmVydHNbMF1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IGVuZE0gPSB2ZXJ0c1t2ZXJ0cy5sZW5ndGggLSAxXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgdG90YWxMZW4gPSBNYXRoLmFicyhlbmRNIC0gc3RhcnRNKVxyXG4gICAgICAgIGlmICh0b3RhbExlbiA8IDAuMSkgY29udGludWVcclxuXHJcbiAgICAgICAgY29uc3QgbnVtU2VncyA9IE1hdGguY2VpbCh0b3RhbExlbiAvIDAuNSlcclxuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IG51bVNlZ3M7IHMrKykge1xyXG4gICAgICAgICAgY29uc3QgZnJvbU0gPSBzdGFydE0gKyBzICogMC41XHJcbiAgICAgICAgICBjb25zdCB0b00gPSBNYXRoLm1pbihzdGFydE0gKyAocyArIDEpICogMC41LCBlbmRNKVxyXG4gICAgICAgICAgY29uc3QgbWlkTSA9IChmcm9tTSArIHRvTSkgLyAyXHJcbiAgICAgICAgICBjb25zdCBtS2V5ID0gTWF0aC5yb3VuZChtaWRNICogMikgLyAyXHJcblxyXG4gICAgICAgICAgY29uc3Qgcm91dGVNYXAgPSBldmVudExvb2t1cC5nZXQocmlkKVxyXG4gICAgICAgICAgY29uc3Qgc2VnQXR0cnMgPSByb3V0ZU1hcD8uZ2V0KG1LZXkpIHx8IHt9XHJcblxyXG4gICAgICAgICAgbGV0IGNvbXBvc2l0ZVNjb3JlID0gMS4wXHJcbiAgICAgICAgICBjb25zdCBzZWdGYWN0b3JzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZWdBdHRycykpIHtcclxuICAgICAgICAgICAgY29uc3QgbGF5ZXJOYW1lID0ga2V5LnNwbGl0KCc6OicpWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IG1hcHBpbmcgPSBtb2RlbC5scnNNYXBwaW5nW2xheWVyTmFtZV1cclxuICAgICAgICAgICAgaWYgKCFtYXBwaW5nKSBjb250aW51ZVxyXG4gICAgICAgICAgICBsZXQgd2VpZ2h0ID0gMS4wXHJcbiAgICAgICAgICAgIGlmIChtYXBwaW5nLmN1c3RvbVdlaWdodHMpIHtcclxuICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkVmFsID0gdmFsdWUucmVwbGFjZSgvW14wLTkuXS9nLCAnJykuc3BsaXQoJy4nKVswXVxyXG4gICAgICAgICAgICAgIHdlaWdodCA9IG1hcHBpbmcuY3VzdG9tV2VpZ2h0c1tub3JtYWxpemVkVmFsXSB8fCBtYXBwaW5nLmN1c3RvbVdlaWdodHNbdmFsdWVdIHx8IDEuMFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1hcHBpbmcudmFsdWVNYXApIHtcclxuICAgICAgICAgICAgICBjb25zdCBtYXBwZWRDb25kaXRpb24gPSBtYXBwaW5nLnZhbHVlTWFwW3ZhbHVlXVxyXG4gICAgICAgICAgICAgIGlmIChtYXBwZWRDb25kaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlQ2F0ZWdvcnkgPSAobW9kZWwgYXMgYW55KVttYXBwaW5nLnN0YXRlRmllbGRdXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVDYXRlZ29yeSAmJiBzdGF0ZUNhdGVnb3J5W21hcHBlZENvbmRpdGlvbl0pIHtcclxuICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gc3RhdGVDYXRlZ29yeVttYXBwZWRDb25kaXRpb25dLndlaWdodFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2VpZ2h0ICE9PSAxLjApIHtcclxuICAgICAgICAgICAgICBjb21wb3NpdGVTY29yZSAqPSB3ZWlnaHRcclxuICAgICAgICAgICAgICBpZiAod2VpZ2h0ID4gMS4yKSBzZWdGYWN0b3JzLnB1c2goYCR7bGF5ZXJOYW1lfTogJHt2YWx1ZX0gKCR7d2VpZ2h0LnRvRml4ZWQoMSl9eClgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3Qgcmlza1Njb3JlID0gTWF0aC5taW4oTWF0aC5yb3VuZChNYXRoLmxvZyhjb21wb3NpdGVTY29yZSArIDEpICogNDApLCAxMDApXHJcblxyXG4gICAgICAgICAgLy8gQnVpbGQgcGF0aFxyXG4gICAgICAgICAgY29uc3QgcGF0aDogbnVtYmVyW11bXSA9IFtdXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgdmVydHMpIHtcclxuICAgICAgICAgICAgY29uc3Qgdm0gPSB2W3JkLm1JZHhdIHx8IDBcclxuICAgICAgICAgICAgaWYgKHZtID49IGZyb21NICYmIHZtIDw9IHRvTSkgcGF0aC5wdXNoKFt2WzBdLCB2WzFdXSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgICBjb25zdCBtMSA9IHZlcnRzW2ldW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICAgICAgICBjb25zdCBtMiA9IHZlcnRzW2kgKyAxXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgICAgICAgaWYgKG0xIDw9IGZyb21NICYmIG0yID49IGZyb21NKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gKGZyb21NIC0gbTEpIC8gKG0yIC0gbTEgfHwgMSlcclxuICAgICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydHNbaV1bMF0gKyB0ICogKHZlcnRzW2kgKyAxXVswXSAtIHZlcnRzW2ldWzBdKSwgdmVydHNbaV1bMV0gKyB0ICogKHZlcnRzW2kgKyAxXVsxXSAtIHZlcnRzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChtMSA8PSB0b00gJiYgbTIgPj0gdG9NKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gKHRvTSAtIG0xKSAvIChtMiAtIG0xIHx8IDEpXHJcbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRzW2ldWzBdICsgdCAqICh2ZXJ0c1tpICsgMV1bMF0gLSB2ZXJ0c1tpXVswXSksIHZlcnRzW2ldWzFdICsgdCAqICh2ZXJ0c1tpICsgMV1bMV0gLSB2ZXJ0c1tpXVsxXSldKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHBhdGgubGVuZ3RoIDwgMikgY29udGludWVcclxuXHJcbiAgICAgICAgICBjb25zdCByaXNrTGV2ZWwgPSByaXNrU2NvcmUgPj0gNzUgPyAnSGlnaCcgOiByaXNrU2NvcmUgPj0gNDAgPyAnTWVkaXVtJyA6IHJpc2tTY29yZSA+IDAgPyAnTG93JyA6ICdNaW5pbWFsJ1xyXG4gICAgICAgICAgc2VnbWVudHMucHVzaCh7IHJvdXRlSWQ6IHJpZCwgZnJvbU0sIHRvTSwgcGF0aCwgcmlza1Njb3JlLCByaXNrTGV2ZWwsIGNvbnRyaWJ1dGluZ0ZhY3RvcnM6IHNlZ0ZhY3RvcnMgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyBzZWdtZW50cyBnZW5lcmF0ZWQuJylcclxuXHJcbiAgICAgIC8vIFN0b3JlIG1vZGVsIGluZm9cclxuICAgICAgY29uc3Qgd2VpZ2h0c1N1bW1hcnk6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIG51bWJlcj4+ID0ge31cclxuICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGYgb2Ygc2VnLmNvbnRyaWJ1dGluZ0ZhY3RvcnMpIHtcclxuICAgICAgICAgIGNvbnN0IG1hdGNoID0gZi5tYXRjaCgvXiguKz8pOiAoLis/KSBcXCgoLis/KXhcXCkkLylcclxuICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICBpZiAoIXdlaWdodHNTdW1tYXJ5W21hdGNoWzFdXSkgd2VpZ2h0c1N1bW1hcnlbbWF0Y2hbMV1dID0ge31cclxuICAgICAgICAgICAgd2VpZ2h0c1N1bW1hcnlbbWF0Y2hbMV1dW21hdGNoWzJdXSA9IHBhcnNlRmxvYXQobWF0Y2hbM10pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNldE1vZGVsSW5mbyh7IHdlaWdodHM6IHdlaWdodHNTdW1tYXJ5LCB0b3RhbENyYXNoZXM6IG1vZGVsLnRvdGFsQ3Jhc2hlcywgeWVhcnM6IG1vZGVsLnllYXJzIH0pXHJcblxyXG4gICAgICAvLyBTdGVwIDQ6IFVwbG9hZFxyXG4gICAgICBzZXRQcm9ncmVzcygnVXBsb2FkaW5nIHN0YXRlIE1MIHByZWRpY3Rpb24gbGF5ZXIuLi4nKVxyXG4gICAgICBjb25zdCBjb250ZW50VXJsID0gYCR7cG9ydGFsVXJsfS9zaGFyaW5nL3Jlc3QvY29udGVudC91c2Vycy8ke3VzZXJuYW1lfWBcclxuICAgICAgY29uc3QgZm9sZGVyVXJsID0gc2VsZWN0ZWRGb2xkZXJJZCA/IGAke2NvbnRlbnRVcmx9LyR7c2VsZWN0ZWRGb2xkZXJJZH1gIDogY29udGVudFVybFxyXG4gICAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IGBTdGF0ZU1MX0NyYXNoUmlza18ke0RhdGUubm93KCl9YFxyXG5cclxuICAgICAgY29uc3QgZmllbGRzID0gW1xyXG4gICAgICAgIHsgbmFtZTogJ09CSkVDVElEJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVPSUQnLCBhbGlhczogJ09iamVjdElEJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3JvdXRlaWQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUm91dGUgSUQnLCBsZW5ndGg6IDEwMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2Zyb21fbScsIHR5cGU6ICdlc3JpRmllbGRUeXBlRG91YmxlJywgYWxpYXM6ICdGcm9tIE1lYXN1cmUnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAndG9fbScsIHR5cGU6ICdlc3JpRmllbGRUeXBlRG91YmxlJywgYWxpYXM6ICdUbyBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfc2NvcmUnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZUludGVnZXInLCBhbGlhczogJ1Jpc2sgU2NvcmUgKDAtMTAwKScgfSxcclxuICAgICAgICB7IG5hbWU6ICdyaXNrX2xldmVsJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1Jpc2sgTGV2ZWwnLCBsZW5ndGg6IDIwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udHJpYnV0aW5nX2ZhY3RvcnMnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnQ29udHJpYnV0aW5nIEZhY3RvcnMnLCBsZW5ndGg6IDUwMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ21vZGVsX2NvbmZpZGVuY2UnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnTW9kZWwgQ29uZmlkZW5jZScsIGxlbmd0aDogNTAgfVxyXG4gICAgICBdXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnY3JlYXRlUGFyYW1ldGVycycsIEpTT04uc3RyaW5naWZ5KHsgbmFtZTogc2VydmljZU5hbWUsIHNlcnZpY2VEZXNjcmlwdGlvbjogJ0NyYXNoIHJpc2sgZnJvbSBOWSBzdGF0ZSBjcmFzaCBkYXRhYmFzZSBNTCBtb2RlbCcsIGhhc1N0YXRpY0RhdGE6IGZhbHNlLCBtYXhSZWNvcmRDb3VudDogMTAwMDAsIHN1cHBvcnRlZFF1ZXJ5Rm9ybWF0czogJ0pTT04nLCBjYXBhYmlsaXRpZXM6ICdRdWVyeSxFZGl0aW5nJywgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0sIGluaXRpYWxFeHRlbnQ6IHsgeG1pbjogLTIwMDM3NTA4LCB5bWluOiAtMjAwMzc1MDgsIHhtYXg6IDIwMDM3NTA4LCB5bWF4OiAyMDAzNzUwOCwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0gfSwgYWxsb3dHZW9tZXRyeVVwZGF0ZXM6IHRydWUgfSkpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3RhcmdldFR5cGUnLCAnZmVhdHVyZVNlcnZpY2UnKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdvdXRwdXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgaWYgKHNlbGVjdGVkRm9sZGVySWQpIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2ZvbGRlcklkJywgc2VsZWN0ZWRGb2xkZXJJZClcclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3AgPSBhd2FpdCBmZXRjaChgJHtmb2xkZXJVcmx9L2NyZWF0ZVNlcnZpY2VgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBjcmVhdGVQYXJhbXMgfSlcclxuICAgICAgY29uc3QgY3JlYXRlUmVzdWx0ID0gYXdhaXQgY3JlYXRlUmVzcC5qc29uKClcclxuICAgICAgaWYgKCFjcmVhdGVSZXN1bHQuZW5jb2RlZFNlcnZpY2VVUkwpIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBzZXJ2aWNlOiAnICsgSlNPTi5zdHJpbmdpZnkoY3JlYXRlUmVzdWx0KSlcclxuICAgICAgY29uc3Qgc2VydmljZVVybCA9IGNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTFxyXG4gICAgICBjb25zdCB0ZW1wSXRlbUlkID0gY3JlYXRlUmVzdWx0Lml0ZW1JZFxyXG5cclxuICAgICAgY29uc3QgYWRtaW5VcmwgPSBzZXJ2aWNlVXJsLnJlcGxhY2UoJy9yZXN0L3NlcnZpY2VzLycsICcvcmVzdC9hZG1pbi9zZXJ2aWNlcy8nKVxyXG4gICAgICBjb25zdCBhZGREZWZQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgnYWRkVG9EZWZpbml0aW9uJywgSlNPTi5zdHJpbmdpZnkoeyBsYXllcnM6IFt7IGlkOiAwLCBuYW1lOiAnU3RhdGUgTUwgUmlzaycsIHR5cGU6ICdGZWF0dXJlIExheWVyJywgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5UG9seWxpbmUnLCBkaXNwbGF5RmllbGQ6ICdyb3V0ZWlkJywgZmllbGRzLCBvYmplY3RJZEZpZWxkOiAnT0JKRUNUSUQnLCBoYXNBdHRhY2htZW50czogZmFsc2UsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcsQ3JlYXRlLFVwZGF0ZSxEZWxldGUnIH1dIH0pKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBhd2FpdCBmZXRjaChgJHthZG1pblVybH0vYWRkVG9EZWZpbml0aW9uYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRGVmUGFyYW1zIH0pXHJcblxyXG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHNlZ21lbnRzLmZpbHRlcihzID0+IHMucmlza1Njb3JlID4gMCkubWFwKHNlZyA9PiAoe1xyXG4gICAgICAgIGdlb21ldHJ5OiB7IHBhdGhzOiBbc2VnLnBhdGhdLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LFxyXG4gICAgICAgIGF0dHJpYnV0ZXM6IHsgcm91dGVpZDogc2VnLnJvdXRlSWQsIGZyb21fbTogc2VnLmZyb21NLCB0b19tOiBzZWcudG9NLCByaXNrX3Njb3JlOiBzZWcucmlza1Njb3JlLCByaXNrX2xldmVsOiBzZWcucmlza0xldmVsLCBjb250cmlidXRpbmdfZmFjdG9yczogc2VnLmNvbnRyaWJ1dGluZ0ZhY3RvcnMuam9pbignOyAnKSwgbW9kZWxfY29uZmlkZW5jZTogYEhpZ2ggKCR7bW9kZWwudG90YWxDcmFzaGVzLnRvTG9jYWxlU3RyaW5nKCl9IHRyYWluaW5nIGNyYXNoZXMpYCB9XHJcbiAgICAgIH0pKVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkgKz0gMTAwMCkge1xyXG4gICAgICAgIGNvbnN0IGJhdGNoID0gZmVhdHVyZXMuc2xpY2UoaSwgaSArIDEwMDApXHJcbiAgICAgICAgc2V0UHJvZ3Jlc3MoYFVwbG9hZGluZy4uLiAke01hdGgubWluKGkgKyAxMDAwLCBmZWF0dXJlcy5sZW5ndGgpfS8ke2ZlYXR1cmVzLmxlbmd0aH1gKVxyXG4gICAgICAgIGNvbnN0IGFkZEZlYXRQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZmVhdHVyZXMnLCBKU09OLnN0cmluZ2lmeShiYXRjaCkpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgICAgYXdhaXQgZmV0Y2goYCR7c2VydmljZVVybH0vMC9hZGRGZWF0dXJlc2AsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGFkZEZlYXRQYXJhbXMgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2hhcmVcclxuICAgICAgY29uc3Qgc2hhcmVQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdldmVyeW9uZScsICdmYWxzZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnb3JnJywgJ3RydWUnKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2l0ZW1zJywgdGVtcEl0ZW1JZClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2NvbnRlbnRVcmx9L2l0ZW1zLyR7dGVtcEl0ZW1JZH0vc2hhcmVgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBzaGFyZVBhcmFtcyB9KVxyXG5cclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0Rpc3BsYXlpbmcgb24gbWFwLi4uJylcclxuICAgICAgYXdhaXQgZGlzcGxheVByZWRpY3Rpb25Pbk1hcChgJHtzZXJ2aWNlVXJsfS8wYCwgdG9rZW4sIHdraWQpXHJcbiAgICAgIHNldFJlc3VsdCh7IGxheWVyVXJsOiBzZXJ2aWNlVXJsLCBpdGVtVXJsOiBgJHtwb3J0YWxVcmx9L2hvbWUvaXRlbS5odG1sP2lkPSR7dGVtcEl0ZW1JZH1gIH0pXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW1N0YXRlTUxdIEZhaWxlZDonLCBlcnIpXHJcbiAgICAgIHNldEVycm9yKCdNTCBwcmVkaWN0aW9uIGZhaWxlZDogJyArIChlcnIubWVzc2FnZSB8fCBlcnIpKVxyXG4gICAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldFJ1bm5pbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZywgcXVlcnlFdmVudERhdGEsIHNlbGVjdGVkRm9sZGVySWQsIGRpc3BsYXlQcmVkaWN0aW9uT25NYXBdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBSRU5ERVIgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3Qgcm91dGVTZWxlY3Rpb25VSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnLCBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsIGJvcmRlclJhZGl1czogJzZweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZTBlMGUwJyB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzhweCcsIGNvbG9yOiAnIzMzMycgfX0+U2VsZWN0IFJvdXRlczwvZGl2PlxyXG5cclxuICAgICAgey8qIFNlYXJjaCBtb2RlIHRhYnMgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaE1vZGUoJ2lkJyl9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHgnLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXI6IHNlYXJjaE1vZGUgPT09ICdpZCcgPyAnMnB4IHNvbGlkICMwMDc5YzEnIDogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogc2VhcmNoTW9kZSA9PT0gJ2lkJyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicgfX0+QnkgUm91dGUgSUQ8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWFyY2hNb2RlKCduYW1lJyl9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHgnLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXI6IHNlYXJjaE1vZGUgPT09ICduYW1lJyA/ICcycHggc29saWQgIzAwNzljMScgOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzZWFyY2hNb2RlID09PSAnbmFtZScgPyAnI2U4ZjRmZCcgOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInIH19PkJ5IE5hbWU8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWFyY2hNb2RlKCdtYXAnKX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCcsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlcjogc2VhcmNoTW9kZSA9PT0gJ21hcCcgPyAnMnB4IHNvbGlkICMwMDc5YzEnIDogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogc2VhcmNoTW9kZSA9PT0gJ21hcCcgPyAnI2U4ZjRmZCcgOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInIH19PkRyYXcgQXJlYTwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBSb3V0ZSBJRCAvIE5hbWUgc2VhcmNoICovfVxyXG4gICAgICB7KHNlYXJjaE1vZGUgPT09ICdpZCcgfHwgc2VhcmNoTW9kZSA9PT0gJ25hbWUnKSAmJiAoXHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19PlxyXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB2YWx1ZT17c2VhcmNoTW9kZSA9PT0gJ2lkJyA/IHJvdXRlSWQgOiByb3V0ZU5hbWV9IG9uQ2hhbmdlPXtlID0+IGhhbmRsZVJvdXRlU2VhcmNoKGUudGFyZ2V0LnZhbHVlKX0gcGxhY2Vob2xkZXI9e3NlYXJjaE1vZGUgPT09ICdpZCcgPyAnUm91dGUgSUQuLi4nIDogJ1JvdXRlIG5hbWUuLi4nfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNnB4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fSAvPlxyXG4gICAgICAgICAgICB7aGFzTWFwV2lkZ2V0ICYmIChcclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtwaWNraW5nRnJvbU1hcCA/IGNhbmNlbFBpY2tGcm9tTWFwIDogc3RhcnRQaWNrRnJvbU1hcH0gc3R5bGU9e3sgcGFkZGluZzogJzZweCAxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBwaWNraW5nRnJvbU1hcCA/ICcjMDA3OWMxJyA6ICcjZmZmJywgY29sb3I6IHBpY2tpbmdGcm9tTWFwID8gJyNmZmYnIDogJyMwMDc5YzEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JyB9fT5cclxuICAgICAgICAgICAgICAgIHtwaWNraW5nRnJvbU1hcCA/ICdDYW5jZWwnIDogJ1BpY2snfVxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgey8qIEF1dG9jb21wbGV0ZSBzdWdnZXN0aW9ucyAqL31cclxuICAgICAgICAgIHtzaG93U3VnZ2VzdGlvbnMgJiYgcm91dGVTdWdnZXN0aW9ucy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIG1heEhlaWdodDogJzEwMHB4Jywgb3ZlcmZsb3c6ICdhdXRvJywgYmFja2dyb3VuZDogJyNmZmYnIH19PlxyXG4gICAgICAgICAgICAgIHtyb3V0ZVN1Z2dlc3Rpb25zLm1hcCgociwgaSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IG9uQ2xpY2s9eygpID0+IHNlbGVjdFJvdXRlKHIpfSBzdHlsZT17eyBwYWRkaW5nOiAnNHB4IDhweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2VlZScgfX0gb25Nb3VzZU92ZXI9e2UgPT4gKGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kID0gJyNmMGYwZjAnKX0gb25Nb3VzZU91dD17ZSA9PiAoZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmQgPSAnI2ZmZicpfT5cclxuICAgICAgICAgICAgICAgICAge3Iucm91dGVJZH0ge3Iucm91dGVOYW1lID8gYCgke3Iucm91dGVOYW1lfSlgIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIHsvKiBSb3V0ZSBwaWNrIGRpc2FtYmlndWF0aW9uICovfVxyXG4gICAgICAgICAge3JvdXRlUGlja0NhbmRpZGF0ZXMgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgcGFkZGluZzogJzhweCcsIGJhY2tncm91bmQ6ICcjZThmNGZkJywgbWFyZ2luVG9wOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGZvbnRXZWlnaHQ6IDYwMCwgbWFyZ2luQm90dG9tOiAnNHB4JyB9fT5NdWx0aXBsZSByb3V0ZXMgZm91bmQg4oCUIHNlbGVjdCBvbmU6PC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXhIZWlnaHQ6ICcxNDBweCcsIG92ZXJmbG93OiAnYXV0bycgfX0+XHJcbiAgICAgICAgICAgICAgICB7cm91dGVQaWNrQ2FuZGlkYXRlcy5tYXAoKGMsIGkpID0+IChcclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9e2l9IHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IHNldFJvdXRlSWQoYy5yb3V0ZUlkKTsgc2V0Um91dGVOYW1lKGMucm91dGVOYW1lKTsgc2V0Um91dGVQaWNrQ2FuZGlkYXRlcyhudWxsKTsgZmV0Y2hSb3V0ZU1lYXN1cmVzKGMucm91dGVJZCkgfX0gb25Nb3VzZUVudGVyPXsoKSA9PiB7IHNob3dSb3V0ZVByZXZpZXdSZWYuY3VycmVudChjLnJvdXRlSWQpIH19IG9uTW91c2VMZWF2ZT17KCkgPT4geyBjbGVhclJvdXRlUHJldmlldygpIH19IHN0eWxlPXt7IGRpc3BsYXk6ICdibG9jaycsIHdpZHRoOiAnMTAwJScsIHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnNnB4IDEwcHgnLCBtYXJnaW5Cb3R0b206ICczcHgnLCBib3JkZXI6ICcxcHggc29saWQgI2RkZCcsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmRDb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250V2VpZ2h0OiA1MDAgfX0+e2Mucm91dGVOYW1lfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICB7Yy5yb3V0ZU5hbWUgIT09IGMucm91dGVJZCAmJiA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyM4ODgnLCBtYXJnaW5MZWZ0OiAnOHB4JyB9fT57Yy5yb3V0ZUlkfTwvc3Bhbj59XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICB7LyogTWVhc3VyZSByYW5nZSBpbnB1dHMgKi99XHJcbiAgICAgICAgICB7cm91dGVJZCAmJiByb3V0ZU1lYXN1cmVSYW5nZSAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnOHB4JywgcGFkZGluZzogJzhweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMGUwZTAnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgbWFyZ2luQm90dG9tOiAnNnB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGZvbnRXZWlnaHQ6IDYwMCwgY29sb3I6ICcjMzMzJyB9fT5NZWFzdXJlIFJhbmdlPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRGcm9tTWVhc3VyZShyb3V0ZU1lYXN1cmVSYW5nZS5taW4udG9GaXhlZCgzKSk7IHNldFRvTWVhc3VyZShyb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKSk7IHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgnZnJvbScsIHJvdXRlTWVhc3VyZVJhbmdlLm1pbi50b0ZpeGVkKDMpKTsgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCd0bycsIHJvdXRlTWVhc3VyZVJhbmdlLm1heC50b0ZpeGVkKDMpKSB9fSBzdHlsZT17eyBwYWRkaW5nOiAnM3B4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnM3B4JywgYmFja2dyb3VuZDogJyNlOGY0ZmQnLCBjb2xvcjogJyMwMDc5YzEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMHB4JywgZm9udFdlaWdodDogNjAwIH19Pldob2xlIFJvdXRlPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIHsvKiBGcm9tIG1lYXN1cmUgKi99XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIGNvbG9yOiAnIzY2NicsIGRpc3BsYXk6ICdibG9jaycsIG1hcmdpbkJvdHRvbTogJzJweCcgfX0+RnJvbXtyb3V0ZU1lYXN1cmVSYW5nZSA/IDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnI2FhYScsIG1hcmdpbkxlZnQ6ICc0cHgnIH19Pih7cm91dGVNZWFzdXJlUmFuZ2UubWluLnRvRml4ZWQoMyl9KTwvc3Bhbj4gOiBudWxsfTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgaWYgKHBpY2tpbmdNZWFzdXJlID09PSAnZnJvbScpIGNhbmNlbFBpY2tNZWFzdXJlKCk7IGVsc2Ugc3RhcnRQaWNrTWVhc3VyZSgnZnJvbScpIH19IHRpdGxlPXtwaWNraW5nTWVhc3VyZSA9PT0gJ2Zyb20nID8gJ0NhbmNlbCcgOiAnUGljayBmcm9tIG1hcCd9IHN0eWxlPXt7IHdpZHRoOiAnMjhweCcsIGhlaWdodDogJzI4cHgnLCBwYWRkaW5nOiAwLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogcGlja2luZ01lYXN1cmUgPT09ICdmcm9tJyA/ICcjZmZmM2UwJyA6ICcjZmZmJywgZmxleFNocmluazogMCwgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7cGlja2luZ01lYXN1cmUgPT09ICdmcm9tJyA/ICdcXHUyMzE2JyA6ICdcXHUyMUE1J31cclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgdmFsdWU9e2Zyb21NZWFzdXJlfSBvbkNoYW5nZT17ZSA9PiBzZXRGcm9tTWVhc3VyZShlLnRhcmdldC52YWx1ZSl9IG9uQmx1cj17KCkgPT4geyBpZiAoZnJvbU1lYXN1cmUpIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgnZnJvbScsIGZyb21NZWFzdXJlKSB9fSBvbktleURvd249e2UgPT4geyBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgZnJvbU1lYXN1cmUpIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgnZnJvbScsIGZyb21NZWFzdXJlKSB9fSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fSBwbGFjZWhvbGRlcj17cm91dGVNZWFzdXJlUmFuZ2UgPyByb3V0ZU1lYXN1cmVSYW5nZS5taW4udG9GaXhlZCgzKSA6ICdTdGFydCd9IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgey8qIFRvIG1lYXN1cmUgKi99XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM2NjYnLCBkaXNwbGF5OiAnYmxvY2snLCBtYXJnaW5Cb3R0b206ICcycHgnIH19PlRve3JvdXRlTWVhc3VyZVJhbmdlID8gPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjYWFhJywgbWFyZ2luTGVmdDogJzRweCcgfX0+KHtyb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKX0pPC9zcGFuPiA6IG51bGx9PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBpZiAocGlja2luZ01lYXN1cmUgPT09ICd0bycpIGNhbmNlbFBpY2tNZWFzdXJlKCk7IGVsc2Ugc3RhcnRQaWNrTWVhc3VyZSgndG8nKSB9fSB0aXRsZT17cGlja2luZ01lYXN1cmUgPT09ICd0bycgPyAnQ2FuY2VsJyA6ICdQaWNrIGZyb20gbWFwJ30gc3R5bGU9e3sgd2lkdGg6ICcyOHB4JywgaGVpZ2h0OiAnMjhweCcsIHBhZGRpbmc6IDAsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiBwaWNraW5nTWVhc3VyZSA9PT0gJ3RvJyA/ICcjZmZmM2UwJyA6ICcjZmZmJywgZmxleFNocmluazogMCwgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7cGlja2luZ01lYXN1cmUgPT09ICd0bycgPyAnXFx1MjMxNicgOiAnXFx1MjFBNSd9XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIHZhbHVlPXt0b01lYXN1cmV9IG9uQ2hhbmdlPXtlID0+IHNldFRvTWVhc3VyZShlLnRhcmdldC52YWx1ZSl9IG9uQmx1cj17KCkgPT4geyBpZiAodG9NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgdG9NZWFzdXJlKSB9fSBvbktleURvd249e2UgPT4geyBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgdG9NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgdG9NZWFzdXJlKSB9fSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fSBwbGFjZWhvbGRlcj17cm91dGVNZWFzdXJlUmFuZ2UgPyByb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKSA6ICdFbmQnfSAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiBEcmF3IHBvbHlnb24gbW9kZSAqL31cclxuICAgICAge3NlYXJjaE1vZGUgPT09ICdtYXAnICYmIChcclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnIH19PlxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtzdGFydERyYXdBcmVhfSBkaXNhYmxlZD17ZHJhd2luZ30gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogZHJhd2luZyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY29sb3I6ICcjMDA3OWMxJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDUwMCB9fT5cclxuICAgICAgICAgICAgICB7ZHJhd2luZyA/ICdEcmF3aW5nLi4uIGNsaWNrIHRvIGNvbXBsZXRlJyA6IGBEcmF3IFBvbHlnb24gb24gTWFwJHttYXBSb3V0ZXMubGVuZ3RoID4gMCA/IGAgKCR7bWFwUm91dGVzLmxlbmd0aH0gcm91dGVzKWAgOiAnJ31gfVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAge21hcFJvdXRlcy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KSBncmFwaGljc0xheWVyUmVmLmN1cnJlbnQucmVtb3ZlQWxsKClcclxuICAgICAgICAgICAgICAgIGlmIChyb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCkgcm91dGVHcmFwaGljc0xheWVyUmVmLmN1cnJlbnQucmVtb3ZlQWxsKClcclxuICAgICAgICAgICAgICAgIHNldE1hcFJvdXRlcyhbXSk7IHNldFNlbGVjdGVkTWFwUm91dGVJZHMobmV3IFNldCgpKTsgc2V0RXJyb3IobnVsbClcclxuICAgICAgICAgICAgICB9fSBzdHlsZT17eyB3aWR0aDogJzMycHgnLCBoZWlnaHQ6ICczMnB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZWJlZScsIGN1cnNvcjogJ3BvaW50ZXInLCBmbGV4U2hyaW5rOiAwIH19PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNnB4JywgZm9udFdlaWdodDogJ2JvbGQnLCBjb2xvcjogJyNjNjI4MjgnIH19PnsnXFx1MDBkNyd9PC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7bWFwUm91dGVzLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzZweCcsIGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzMzMycgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHN0cm9uZz57c2VsZWN0ZWRNYXBSb3V0ZUlkcy5zaXplfS97bWFwUm91dGVzLmxlbmd0aH0gcm91dGV7bWFwUm91dGVzLmxlbmd0aCA+IDEgPyAncycgOiAnJ30gc2VsZWN0ZWQ8L3N0cm9uZz5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkcyhuZXcgU2V0KG1hcFJvdXRlcy5tYXAociA9PiByLnJvdXRlSWQpKSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGVHcmFwaGljc0xheWVyUmVmLmN1cnJlbnQpIHJvdXRlR3JhcGhpY3NMYXllclJlZi5jdXJyZW50LmdyYXBoaWNzPy50b0FycmF5KCk/LmZvckVhY2goKGc6IGFueSkgPT4geyBnLnZpc2libGUgPSB0cnVlIH0pXHJcbiAgICAgICAgICAgICAgICAgIH19IHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIHBhZGRpbmc6ICcycHggNnB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICczcHgnLCBjdXJzb3I6ICdwb2ludGVyJywgYmFja2dyb3VuZENvbG9yOiAnI2Y1ZjVmNScgfX0+QWxsPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQoKSlcclxuICAgICAgICAgICAgICAgICAgICBpZiAocm91dGVHcmFwaGljc0xheWVyUmVmLmN1cnJlbnQpIHJvdXRlR3JhcGhpY3NMYXllclJlZi5jdXJyZW50LmdyYXBoaWNzPy50b0FycmF5KCk/LmZvckVhY2goKGc6IGFueSkgPT4geyBnLnZpc2libGUgPSBmYWxzZSB9KVxyXG4gICAgICAgICAgICAgICAgICB9fSBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBwYWRkaW5nOiAnMnB4IDZweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnM3B4JywgY3Vyc29yOiAncG9pbnRlcicsIGJhY2tncm91bmRDb2xvcjogJyNmNWY1ZjUnIH19Pk5vbmU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIHsvKiBSb3V0ZSBjbGFzcyB0eXBlIGZpbHRlciBjaGlwcyAqL31cclxuICAgICAgICAgICAgICB7KCgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNsYXNzaWZ5Um91dGUgPSAocjogeyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IG5hbWUgPSAoci5yb3V0ZU5hbWUgfHwgJycpLnRyaW0oKVxyXG4gICAgICAgICAgICAgICAgICBpZiAoL15JXFxkL2kudGVzdChuYW1lKSB8fCAvXjA/SVxcZC9pLnRlc3QobmFtZSkpIHJldHVybiAnSW50ZXJzdGF0ZSdcclxuICAgICAgICAgICAgICAgICAgaWYgKC9eVVNcXHM/XFxkL2kudGVzdChuYW1lKSkgcmV0dXJuICdVUyBSb3V0ZSdcclxuICAgICAgICAgICAgICAgICAgaWYgKC9eTllcXGQvaS50ZXN0KG5hbWUpIHx8IC9eU1JcXHM/XFxkL2kudGVzdChuYW1lKSkgcmV0dXJuICdTdGF0ZSBSb3V0ZSdcclxuICAgICAgICAgICAgICAgICAgaWYgKC9eXFxkezN9W0EtWl0vLnRlc3QobmFtZSkgfHwgL3RvXFxzKyhJfE5ZfFVTKVxcZC9pLnRlc3QobmFtZSkgfHwgL1xcYihOQnxTQnxFQnxXQilcXGIvLnRlc3QobmFtZSkpIHJldHVybiAnUmFtcCdcclxuICAgICAgICAgICAgICAgICAgaWYgKCFuYW1lIHx8IC9eXFxkLy50ZXN0KG5hbWUpIHx8IC9cXGIoU1R8QVZFfFJEfERSfEJMVkR8UEx8TE58Q1R8Q0lSfFdBWXxQS1l8SFdZKVxcYi9pLnRlc3QobmFtZSkpIHJldHVybiAnTG9jYWwnXHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiAnTG9jYWwnXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0eXBlR3JvdXBzID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpXHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHIgb2YgbWFwUm91dGVzKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBjbGFzc2lmeVJvdXRlKHIpXHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGlkcyA9IHR5cGVHcm91cHMuZ2V0KHR5cGUpIHx8IFtdXHJcbiAgICAgICAgICAgICAgICAgIGlkcy5wdXNoKHIucm91dGVJZClcclxuICAgICAgICAgICAgICAgICAgdHlwZUdyb3Vwcy5zZXQodHlwZSwgaWRzKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVHcm91cHMuc2l6ZSA8PSAxKSByZXR1cm4gbnVsbFxyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZU9yZGVyID0gWydJbnRlcnN0YXRlJywgJ1VTIFJvdXRlJywgJ1N0YXRlIFJvdXRlJywgJ1JhbXAnLCAnTG9jYWwnXVxyXG4gICAgICAgICAgICAgICAgY29uc3QgdHlwZUNvbG9yczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHsgSW50ZXJzdGF0ZTogJyMxNTY1YzAnLCAnVVMgUm91dGUnOiAnI2M2MjgyOCcsICdTdGF0ZSBSb3V0ZSc6ICcjMmU3ZDMyJywgUmFtcDogJyM2YTFiOWEnLCBMb2NhbDogJyM3NTc1NzUnIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4V3JhcDogJ3dyYXAnLCBnYXA6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICc2cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHt0eXBlT3JkZXIuZmlsdGVyKHQgPT4gdHlwZUdyb3Vwcy5oYXModCkpLm1hcCh0eXBlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkcyA9IHR5cGVHcm91cHMuZ2V0KHR5cGUpIVxyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3QgYWxsU2VsZWN0ZWQgPSBpZHMuZXZlcnkoaWQgPT4gc2VsZWN0ZWRNYXBSb3V0ZUlkcy5oYXMoaWQpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc29tZVNlbGVjdGVkID0gaWRzLnNvbWUoaWQgPT4gc2VsZWN0ZWRNYXBSb3V0ZUlkcy5oYXMoaWQpKVxyXG4gICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9e3R5cGV9IHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkcyhwcmV2ID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG5leHQgPSBuZXcgU2V0KHByZXYpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWxsU2VsZWN0ZWQpIHsgaWRzLmZvckVhY2goaWQgPT4gbmV4dC5kZWxldGUoaWQpKSB9IGVsc2UgeyBpZHMuZm9yRWFjaChpZCA9PiBuZXh0LmFkZChpZCkpIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3V0ZUdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudC5ncmFwaGljcz8udG9BcnJheSgpPy5mb3JFYWNoKChnOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWRzLmluY2x1ZGVzKGcuYXR0cmlidXRlcz8ucm91dGVJZCkpIGcudmlzaWJsZSA9ICFhbGxTZWxlY3RlZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9fSBzdHlsZT17e1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTaXplOiAnMTBweCcsIHBhZGRpbmc6ICcycHggOHB4JywgYm9yZGVyOiBgMXB4IHNvbGlkICR7dHlwZUNvbG9yc1t0eXBlXSB8fCAnIzk5OSd9YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6ICcxMHB4JywgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBhbGxTZWxlY3RlZCA/ICh0eXBlQ29sb3JzW3R5cGVdIHx8ICcjOTk5JykgOiBzb21lU2VsZWN0ZWQgPyAnI2UzZjJmZCcgOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6IGFsbFNlbGVjdGVkID8gJyNmZmYnIDogKHR5cGVDb2xvcnNbdHlwZV0gfHwgJyMzMzMnKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiA2MDAsIGxpbmVIZWlnaHQ6ICcxLjQnXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH19IHRpdGxlPXtgJHthbGxTZWxlY3RlZCA/ICdEZXNlbGVjdCcgOiAnU2VsZWN0J30gYWxsICR7dHlwZX0gcm91dGVzICgke2lkcy5sZW5ndGh9KWB9PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHt0eXBlfSAoe2lkcy5sZW5ndGh9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICB9KX1cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgfSkoKX1cclxuICAgICAgICAgICAgICB7LyogSW5kaXZpZHVhbCByb3V0ZSBjaGVja2JveGVzICovfVxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWF4SGVpZ2h0OiAnMTIwcHgnLCBvdmVyZmxvdzogJ2F1dG8nLCBwYWRkaW5nOiAnNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMGUwZTAnLCBib3JkZXJSYWRpdXM6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAge21hcFJvdXRlcy5tYXAoKHIsIGkpID0+IChcclxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17aX0gc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JywgZm9udFNpemU6ICcxMXB4JywgcGFkZGluZzogJzJweCAwJywgY3Vyc29yOiAncG9pbnRlcicgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGNoZWNrZWQ9e3NlbGVjdGVkTWFwUm91dGVJZHMuaGFzKHIucm91dGVJZCl9IG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGVNYXBSb3V0ZShyLnJvdXRlSWQpfSBzdHlsZT17eyBtYXJnaW46IDAgfX0gLz5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogc2VsZWN0ZWRNYXBSb3V0ZUlkcy5oYXMoci5yb3V0ZUlkKSA/ICcjMzMzJyA6ICcjOTk5JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtyLnJvdXRlTmFtZSA/IGAke3Iucm91dGVOYW1lfSAoJHtyLnJvdXRlSWR9KWAgOiByLnJvdXRlSWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogc2VsZWN0ZWRNYXBSb3V0ZUlkcy5oYXMoci5yb3V0ZUlkKSA/ICcjNjY2JyA6ICcjYmJiJywgbWFyZ2luTGVmdDogJzZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIChNOiB7ci5mcm9tTWVhc3VyZX0gLSB7ci50b01lYXN1cmV9KVxyXG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcblxyXG4gIC8vIFJlc3VsdCB2aWV3XHJcbiAgY29uc3QgcmVzdWx0VUkgPSAoKSA9PiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4JyB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICcxMnB4JyB9fT5cclxuICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzM2cHgnIH19PnsnXFx1MjcwNSd9PC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPHAgc3R5bGU9e3sgZm9udFNpemU6ICcxM3B4JywgY29sb3I6ICcjMzMzJywgdGV4dEFsaWduOiAnY2VudGVyJywgbWFyZ2luOiAnMCAwIDEycHgnIH19PlxyXG4gICAgICAgIFByZWRpY3Rpb24gY29tcGxldGUhIFJpc2sgbGF5ZXIgYWRkZWQgdG8gbWFwLlxyXG4gICAgICA8L3A+XHJcblxyXG4gICAgICB7LyogTGVnZW5kICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4JywgYmFja2dyb3VuZDogJyNmNWY1ZjUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICcxMnB4JyB9fT5cclxuICAgICAgICB7W3sgY29sb3I6ICcjMzg4ZTNjJywgd2lkdGg6IDMsIGxhYmVsOiAnTG93ICgxLTI1KScgfSwgeyBjb2xvcjogJyNmYmMwMmQnLCB3aWR0aDogMywgbGFiZWw6ICdNZWRpdW0gKDI2LTUwKScgfSwgeyBjb2xvcjogJyNmNTdjMDAnLCB3aWR0aDogNCwgbGFiZWw6ICdNZWRpdW0tSGlnaCAoNTEtNzUpJyB9LCB7IGNvbG9yOiAnI2QzMmYyZicsIHdpZHRoOiA1LCBsYWJlbDogJ0hpZ2ggKDc2LTEwMCknIH1dLm1hcCgoaXRlbSwgaSkgPT4gKFxyXG4gICAgICAgICAgPGRpdiBrZXk9e2l9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcsIG1hcmdpbkJvdHRvbTogaSA8IDMgPyAnNHB4JyA6IDAgfX0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICcyMHB4JywgaGVpZ2h0OiBgJHtpdGVtLndpZHRofXB4YCwgYmFja2dyb3VuZDogaXRlbS5jb2xvciB9fSAvPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnIH19PntpdGVtLmxhYmVsfTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICkpfVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHtyZXN1bHQ/Lml0ZW1VcmwgJiYgPGEgaHJlZj17cmVzdWx0Lml0ZW1Vcmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiBzdHlsZT17eyBkaXNwbGF5OiAnYmxvY2snLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyMwMDc5YzEnLCBtYXJnaW5Cb3R0b206ICcxMnB4JyB9fT5PcGVuIGluIFBvcnRhbDwvYT59XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnOHB4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBmbGV4V3JhcDogJ3dyYXAnIH19PlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dFeHBsYW5hdGlvbighc2hvd0V4cGxhbmF0aW9uKX0gc3R5bGU9e3sgcGFkZGluZzogJzhweCAxNnB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM2YTFiOWEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzaG93RXhwbGFuYXRpb24gPyAnI2YzZTVmNScgOiAnI2ZmZicsIGNvbG9yOiAnIzZhMWI5YScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICB7c2hvd0V4cGxhbmF0aW9uID8gJ0hpZGUnIDogJ1doeT8nfVxyXG4gICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2NsZWFyQWxsfSBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDE2cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2QzMmYyZicsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgY29sb3I6ICcjZDMyZjJmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5DbGVhcjwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0TW9kZSgnY2hvb3NlJyk7IHNldFJlc3VsdChudWxsKTsgc2V0UHJvZ3Jlc3MoJycpOyBzZXRTaG93RXhwbGFuYXRpb24oZmFsc2UpIH19IHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMjBweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnIzZhMWI5YScsIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+RG9uZTwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBFeHBsYW5hdGlvbiBwYW5lbCAqL31cclxuICAgICAge3Nob3dFeHBsYW5hdGlvbiAmJiBtb2RlID09PSAnYWknICYmIGZhY3RvcnMgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnMTJweCcsIHBhZGRpbmc6ICcxMnB4JywgYmFja2dyb3VuZDogJyNmOGY5ZmEnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCBmb250U2l6ZTogJzExcHgnLCBtYXhIZWlnaHQ6ICczMjBweCcsIG92ZXJmbG93WTogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA3MDAsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+UmlzayBGYWN0b3IgQW5hbHlzaXM8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogQ3Jhc2ggc3RhdHMgc3VtbWFyeSAqL31cclxuICAgICAgICAgIHtjcmFzaFN0YXRzICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICcxMHB4JywgcGFkZGluZzogJzhweCcsIGJhY2tncm91bmQ6ICcjZmZmM2UwJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYm9yZGVyTGVmdDogJzNweCBzb2xpZCAjZTY1MTAwJyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCwgbWFyZ2luQm90dG9tOiAnNHB4JyB9fT7wn5ONIHtjcmFzaFN0YXRzLnRvdGFsQ3Jhc2hlc30gY3Jhc2ggZXZlbnRzIGFuYWx5emVkPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICB7LyogVG9wIGNvcnJlbGF0aW5nIGV2ZW50IHR5cGVzICovfVxyXG4gICAgICAgICAge2NyYXNoU3RhdHM/LnRvcENvcnJlbGF0aW9ucz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTBweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzZweCcgfX0+VG9wIENvbnRyaWJ1dGluZyBGYWN0b3JzOjwvZGl2PlxyXG4gICAgICAgICAgICAgIHtjcmFzaFN0YXRzLnRvcENvcnJlbGF0aW9ucy5zbGljZSgwLCAyKS5tYXAoKGMsIGkpID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGljb24gPSAvY3VydmV8YWxpZ24vaS50ZXN0KGMubGF5ZXIpID8gJ/CflIQnIDogL3NwZWVkL2kudGVzdChjLmxheWVyKSA/ICfimqEnIDogL2dyYWRlfHNsb3BlL2kudGVzdChjLmxheWVyKSA/ICfim7DvuI8nIDogL3Nob3VsZGVyfHdpZHRoL2kudGVzdChjLmxheWVyKSA/ICfwn5OPJyA6IC9zdXJmYWNlfHBhdmVtZW50L2kudGVzdChjLmxheWVyKSA/ICfwn5uj77iPJyA6IC9zaWdufHNpZ25hbC9pLnRlc3QoYy5sYXllcikgPyAn8J+apicgOiAvbGFuZS9pLnRlc3QoYy5sYXllcikgPyAn8J+bpO+4jycgOiAvYnJpZGdlfHN0cnVjdC9pLnRlc3QoYy5sYXllcikgPyAn8J+MiScgOiBpID09PSAwID8gJ/CflLQnIDogJ/Cfn6AnXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JywgcGFkZGluZzogJzZweCA4cHgnLCBiYWNrZ3JvdW5kOiBpID09PSAwID8gJyNmY2U0ZWMnIDogJyNmZmY4ZTEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMThweCcgfX0+e2ljb259PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZmxleDogMSB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwLCBmb250U2l6ZTogJzExcHgnIH19PntjLmxheWVyfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM1NTUnIH19PntjLnZhbHVlfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAncmlnaHQnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA3MDAsIGZvbnRTaXplOiAnMTNweCcsIGNvbG9yOiAnI2QzMmYyZicgfX0+e2MucGN0fSU8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICc5cHgnLCBjb2xvcjogJyM3NzcnIH19Pm9mIGhpZ2gtcmlzazwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICB9KX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgZm9udFNpemU6ICcxMHB4JywgY29sb3I6ICcjNTU1JyB9fT5cclxuICAgICAgICAgICAgS2VybmVsLWRlbnNpdHkgc2NvcmluZyAocmFkaXVzOiB7ZmFjdG9ycy5rZXJuZWxSYWRpdXN9IHNlZ21lbnRzKS4gU2VnbWVudHM6IHtmYWN0b3JzLnRvdGFsU2VnbWVudHN9IHRvdGFsLCB7ZmFjdG9ycy5zZWdtZW50c1dpdGhDcmFzaGVzfSB3aXRoIGNyYXNoZXMsIHtmYWN0b3JzLmhpZ2hSaXNrQ291bnR9IGhpZ2gtcmlzay5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAge2ZhY3RvcnMudG9wSGlnaFJpc2tTZWdtZW50cz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPHN0cm9uZz5Ub3AgSGlnaC1SaXNrIFNlZ21lbnRzOjwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJywgZm9udFNpemU6ICcxMHB4JywgbWFyZ2luVG9wOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDx0aGVhZD48dHIgc3R5bGU9e3sgYmFja2dyb3VuZDogJyNlZWUnIH19Pjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAnbGVmdCcgfX0+Um91dGU8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19Pk1pbGVzPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5DcmFzaGVzPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5TY29yZTwvdGg+PC90cj48L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRib2R5PntmYWN0b3JzLnRvcEhpZ2hSaXNrU2VnbWVudHMuc2xpY2UoMCwgNSkubWFwKChzOiBhbnksIGk6IG51bWJlcikgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8dHIga2V5PXtpfT48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnIH19PntzLnJvdXRlSWQ/LnN1YnN0cmluZygwLCAxNSl9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+e3MuZnJvbU0/LnRvRml4ZWQoMSl9LXtzLnRvTT8udG9GaXhlZCgxKX08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT57cy5jcmFzaENvdW50fTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnLCBjb2xvcjogJyNkMzJmMmYnLCBmb250V2VpZ2h0OiA3MDAgfX0+e3Mucmlza1Njb3JlfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgICAgICkpfTwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAge3Nob3dFeHBsYW5hdGlvbiAmJiBtb2RlID09PSAnbWwnICYmIG1vZGVsSW5mbyAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICcxMnB4JywgcGFkZGluZzogJzEycHgnLCBiYWNrZ3JvdW5kOiAnI2ZhZjVmYycsIGJvcmRlclJhZGl1czogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIG1heEhlaWdodDogJzI4MHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDcwMCwgbWFyZ2luQm90dG9tOiAnOHB4JywgY29sb3I6ICcjNGExNDhjJyB9fT5TdGF0ZSBEYXRhIE1vZGVsIEV4cGxhbmF0aW9uPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+TWV0aG9kOjwvc3Ryb25nPiBXZWlnaHQtb2YtRXZpZGVuY2Ugc2NvcmluZyBmcm9tIHttb2RlbEluZm8udG90YWxDcmFzaGVzPy50b0xvY2FsZVN0cmluZygpfSByZWFsIE5ZIHN0YXRlIGNyYXNoIHJlY29yZHMgKHttb2RlbEluZm8ueWVhcnN9KS4gRWFjaCByb2FkIGNvbmRpdGlvbiBnZXRzIGEgY3Jhc2ggbXVsdGlwbGllciBiYXNlZCBvbiBpdHMgc3RhdGlzdGljYWwgYXNzb2NpYXRpb24gd2l0aCBmYXRhbCBjcmFzaGVzLlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+dnMuIEFJIChEZW5zaXR5KTo8L3N0cm9uZz4gQUkgZmluZHMgZXhpc3RpbmcgaG90c3BvdHMuIE1MIHByZWRpY3RzIDxlbT5uZXc8L2VtPiByaXNrIGZyb20gcm9hZCBjaGFyYWN0ZXJpc3RpY3MgYWxvbmUg4oCUIGRhbmdlcm91cyBjb25kaXRpb25zIHdoZXJlIG5vIGNyYXNoZXMgaGF2ZSBiZWVuIHJlcG9ydGVkIHlldC5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAge09iamVjdC5rZXlzKG1vZGVsSW5mby53ZWlnaHRzIHx8IHt9KS5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8c3Ryb25nPlRvcCBSaXNrIE11bHRpcGxpZXJzIEZvdW5kOjwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJywgZm9udFNpemU6ICcxMHB4JywgbWFyZ2luVG9wOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDx0aGVhZD48dHIgc3R5bGU9e3sgYmFja2dyb3VuZDogJyNlZWUnIH19Pjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAnbGVmdCcgfX0+RmFjdG9yPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ2xlZnQnIH19PlZhbHVlPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5XZWlnaHQ8L3RoPjwvdHI+PC90aGVhZD5cclxuICAgICAgICAgICAgICAgIDx0Ym9keT57T2JqZWN0LmVudHJpZXMobW9kZWxJbmZvLndlaWdodHMpLmZsYXRNYXAoKFtmaWVsZCwgdmFsc106IFtzdHJpbmcsIGFueV0pID0+IE9iamVjdC5lbnRyaWVzKHZhbHMpLm1hcCgoW3ZhbCwgd106IFtzdHJpbmcsIGFueV0pID0+ICh7IGZpZWxkLCB2YWwsIHcgfSkpKS5maWx0ZXIoKHg6IGFueSkgPT4geC53ID4gMS4wKS5zb3J0KChhOiBhbnksIGI6IGFueSkgPT4gYi53IC0gYS53KS5zbGljZSgwLCAxMCkubWFwKCh4OiBhbnksIGk6IG51bWJlcikgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8dHIga2V5PXtpfT48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnIH19Pnt4LmZpZWxkfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgZm9udFdlaWdodDogNjAwIH19Pnt4LnZhbH08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JywgY29sb3I6IHgudyA+PSAyID8gJyNkMzJmMmYnIDogJyNmNTdjMDAnLCBmb250V2VpZ2h0OiA3MDAgfX0+e3gudy50b0ZpeGVkKDEpfXg8L3RkPjwvdHI+XHJcbiAgICAgICAgICAgICAgICApKX08L3Rib2R5PlxyXG4gICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnOHB4JywgcGFkZGluZzogJzZweCcsIGJhY2tncm91bmQ6ICcjZmZmM2NkJywgYm9yZGVyUmFkaXVzOiAnM3B4JywgZm9udFNpemU6ICcxMHB4JywgY29sb3I6ICcjODU2NDA0JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz5Ob3RlOjwvc3Ryb25nPiBTZWdtZW50cyB3aXRoIG11bHRpcGxlIGhpZ2gtd2VpZ2h0IGZhY3RvcnMgY29tcG91bmQgKG11bHRpcGx5KS4gQSBjdXJ2ZSArIGhpZ2ggc3BlZWQgKyBubyBzaG91bGRlciA9IHZlcnkgaGlnaCByaXNrIGV2ZW4gd2l0aCBubyBsb2NhbCBjcmFzaCBoaXN0b3J5LlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcblxyXG4gIC8vIFJ1bm5pbmcgc3RhdGUgVUlcclxuICBjb25zdCBydW5uaW5nVUkgPSAoKSA9PiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcyMHB4JywgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM1NTUnLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19Pntwcm9ncmVzc308L2Rpdj5cclxuICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnI2UwZTBlMCcsIGJvcmRlclJhZGl1czogJzJweCcsIG92ZXJmbG93OiAnaGlkZGVuJyB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogJzEwMCUnLCBiYWNrZ3JvdW5kOiBtb2RlID09PSAnYWknID8gJyM3YjFmYTInIDogJyM2YTFiOWEnLCB3aWR0aDogJzYwJScsIGFuaW1hdGlvbjogJ3B1bHNlIDEuNXMgaW5maW5pdGUnIH19IC8+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBNQUlOIExBWU9VVCA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBoZWlnaHQ6ICcxMDAlJywgb3ZlcmZsb3c6ICdhdXRvJywgZm9udFNpemU6ICcxM3B4JywgcGFkZGluZzogJzEycHgnLCBib3hTaXppbmc6ICdib3JkZXItYm94JyB9fT5cclxuXHJcbiAgICAgIHtoYXNNYXBXaWRnZXQgJiYgKFxyXG4gICAgICAgIDxKaW11TWFwVmlld0NvbXBvbmVudCB1c2VNYXBXaWRnZXRJZD17KHByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpPy5bMF0gfHwgKHByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpPy5maXJzdD8uKCl9IG9uQWN0aXZlVmlld0NoYW5nZT17b25BY3RpdmVWaWV3Q2hhbmdlfSAvPlxyXG4gICAgICApfVxyXG5cclxuICAgICAgPGg1IHN0eWxlPXt7IG1hcmdpbjogJzAgMCAxMnB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNjAwIH19PkNyYXNoIFJpc2sgUHJlZGljdGlvbiA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBmb250V2VpZ2h0OiA0MDAsIGNvbG9yOiAnIzk5OScgfX0+KHYyMDI2LjA1LjE0IDA5OjE1KTwvc3Bhbj48L2g1PlxyXG5cclxuICAgICAgey8qIEVycm9yIGRpc3BsYXkgKi99XHJcbiAgICAgIHtlcnJvciAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBwYWRkaW5nOiAnOHB4IDEwcHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZWJlZScsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnI2M2MjgyOCcgfX0+XHJcbiAgICAgICAgICB7ZXJyb3J9XHJcbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRFcnJvcihudWxsKX0gc3R5bGU9e3sgZmxvYXQ6ICdyaWdodCcsIGJhY2tncm91bmQ6ICdub25lJywgYm9yZGVyOiAnbm9uZScsIGNvbG9yOiAnI2M2MjgyOCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250V2VpZ2h0OiA3MDAgfX0+eydcXHUwMEQ3J308L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiA9PT09PT09PT09PT09PT09PT09PSBDSE9PU0UgTU9ERSA9PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAge21vZGUgPT09ICdjaG9vc2UnICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzEycHgnIH19PlxyXG5cclxuICAgICAgICAgIHsvKiBBSSBPcHRpb24gKi99XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYmFja2dyb3VuZDogJyNmM2U1ZjUnLCBib3JkZXJSYWRpdXM6ICc4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NlOTNkOCcgfX0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzIwcHgnIH19PnsnXFx1RDgzRVxcdURERTAnfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjNGExNDhjJyB9fT5BSSBQcmVkaWN0aW9uPC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dBSUhlbHAoIXNob3dBSUhlbHApfSBzdHlsZT17eyB3aWR0aDogJzI0cHgnLCBoZWlnaHQ6ICcyNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM3YjFmYTInLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiBzaG93QUlIZWxwID8gJyM3YjFmYTInIDogJyNmZmYnLCBjb2xvcjogc2hvd0FJSGVscCA/ICcjZmZmJyA6ICcjN2IxZmEyJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDcwMCwgbGluZUhlaWdodDogJzIycHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAwIH19Pj88L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzY2NicsIG1hcmdpbjogJzAgMCAxMHB4JyB9fT5LZXJuZWwtZGVuc2l0eSBzY29yaW5nIGZyb20gY3Jhc2ggY2x1c3RlcnMgKyByb2FkIGF0dHJpYnV0ZXM8L3A+XHJcbiAgICAgICAgICAgIHtzaG93QUlIZWxwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzExcHgnLCBsaW5lSGVpZ2h0OiAnMS43JywgbWFyZ2luQm90dG9tOiAnMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZTFiZWU3JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+SG93IGl0IHdvcmtzOjwvc3Ryb25nPjxiciAvPlxyXG4gICAgICAgICAgICAgICAgMS4gWW91IHNlbGVjdCByb3V0ZXMgKGJ5IElELCBuYW1lLCBtYXAgY2xpY2ssIG9yIGRyYXcgYXJlYSk8YnIgLz5cclxuICAgICAgICAgICAgICAgIDIuIFRoZSB3aWRnZXQgcXVlcmllcyA8ZW0+Y3Jhc2ggZXZlbnRzPC9lbT4gYW5kIDxlbT5yb2FkIGF0dHJpYnV0ZSBldmVudHM8L2VtPiBmcm9tIHlvdXIgTFJTPGJyIC8+XHJcbiAgICAgICAgICAgICAgICAzLiBSb3V0ZXMgYXJlIGRpdmlkZWQgaW50byAwLjUtbWlsZSBzZWdtZW50czxiciAvPlxyXG4gICAgICAgICAgICAgICAgNC4gQ3Jhc2ggY291bnRzIHBlciBzZWdtZW50IGFyZSBjb21wdXRlZDxiciAvPlxyXG4gICAgICAgICAgICAgICAgNS4gQSBrZXJuZWwtZGVuc2l0eSBhbGdvcml0aG0gc3ByZWFkcyBpbmZsdWVuY2UgZnJvbSBoaWdoLWNyYXNoIHNlZ21lbnRzIHRvIG5laWdoYm9yczxiciAvPlxyXG4gICAgICAgICAgICAgICAgNi4gUm9hZCBhdHRyaWJ1dGVzIChjdXJ2ZXMsIGdyYWRlcywgZXRjLikgZW5yaWNoIHRoZSBhbmFseXNpczxiciAvPlxyXG4gICAgICAgICAgICAgICAgNy4gQSBjb2xvci1jb2RlZCByaXNrIGxheWVyIGlzIHB1Ymxpc2hlZCB0byB5b3VyIHBvcnRhbCBhbmQgYWRkZWQgdG8gdGhlIG1hcDxiciAvPlxyXG4gICAgICAgICAgICAgICAgPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8c3Ryb25nPkJlc3QgZm9yOjwvc3Ryb25nPiBGaW5kaW5nIGV4aXN0aW5nIGNyYXNoIGhvdHNwb3RzIGFuZCBuZWFyYnkgcmlzayB6b25lcy5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnYWknKX0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzEwcHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyM3YjFmYTInLCBjb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNjAwIH19PlxyXG4gICAgICAgICAgICAgIFJ1biBBSSBQcmVkaWN0aW9uXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgey8qIE1MIE9wdGlvbiAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBiYWNrZ3JvdW5kOiAnI2VkZTdmNicsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjYjM5ZGRiJyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMjBweCcgfX0+eydcXHVEODNEXFx1RENDQSd9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNzAwLCBjb2xvcjogJyMzMTFiOTInIH19Pk1MIFByZWRpY3Rpb248L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd01MSGVscCghc2hvd01MSGVscCl9IHN0eWxlPXt7IHdpZHRoOiAnMjRweCcsIGhlaWdodDogJzI0cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzZhMWI5YScsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmQ6IHNob3dNTEhlbHAgPyAnIzZhMWI5YScgOiAnI2ZmZicsIGNvbG9yOiBzaG93TUxIZWxwID8gJyNmZmYnIDogJyM2YTFiOWEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNzAwLCBsaW5lSGVpZ2h0OiAnMjJweCcsIHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6IDAgfX0+PzwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNjY2JywgbWFyZ2luOiAnMCAwIDEwcHgnIH19PlByZS1jb21wdXRlZCB3ZWlnaHRzIGZyb20gMS41TSBOWSBTdGF0ZSBjcmFzaCByZWNvcmRzPC9wPlxyXG4gICAgICAgICAgICB7c2hvd01MSGVscCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTBweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMXB4JywgbGluZUhlaWdodDogJzEuNycsIG1hcmdpbkJvdHRvbTogJzEwcHgnLCBib3JkZXI6ICcxcHggc29saWQgI2QxYzRlOScgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3Ryb25nPkhvdyBpdCB3b3Jrczo8L3N0cm9uZz48YnIgLz5cclxuICAgICAgICAgICAgICAgIDEuIFlvdSBzZWxlY3Qgcm91dGVzIChieSBJRCwgbmFtZSwgbWFwIGNsaWNrLCBvciBkcmF3IGFyZWEpPGJyIC8+XHJcbiAgICAgICAgICAgICAgICAyLiBUaGUgd2lkZ2V0IHF1ZXJpZXMgPGVtPnJvYWQgY2hhcmFjdGVyaXN0aWMgZXZlbnRzPC9lbT4gZnJvbSB5b3VyIExSUyAoY3VydmVzLCBncmFkZXMsIHNwZWVkIGxpbWl0cywgbGFuZSBjb3VudHMsIHNob3VsZGVycywgZXRjLik8YnIgLz5cclxuICAgICAgICAgICAgICAgIDMuIEVhY2ggMC41LW1pbGUgc2VnbWVudCdzIHJvYWQgY29uZGl0aW9ucyBhcmUgbWF0Y2hlZCB0byBwcmUtY29tcHV0ZWQgcmlzayBtdWx0aXBsaWVycyBmcm9tIDEsNTI1LDEyMyByZWFsIE5ZIHN0YXRlIGNyYXNoIHJlY29yZHM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDQuIEZhY3RvcnMgY29tcG91bmQg4oCUIGEgY3VydmUgKyBoaWdoIHNwZWVkICsgbm8gc2hvdWxkZXIgPSB2ZXJ5IGhpZ2ggcmlzazxiciAvPlxyXG4gICAgICAgICAgICAgICAgNS4gQSBjb2xvci1jb2RlZCBwcmVkaWN0aW9uIGxheWVyIGlzIHB1Ymxpc2hlZCBhbmQgYWRkZWQgdG8gdGhlIG1hcDxiciAvPlxyXG4gICAgICAgICAgICAgICAgPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8c3Ryb25nPkJlc3QgZm9yOjwvc3Ryb25nPiBQcmVkaWN0aW5nIDxlbT5uZXc8L2VtPiByaXNrIGZyb20gcm9hZCBjaGFyYWN0ZXJpc3RpY3MgYWxvbmUg4oCUIGZpbmRpbmcgZGFuZ2Vyb3VzIGNvbmRpdGlvbnMgZXZlbiB3aGVyZSBubyBjcmFzaGVzIGhhdmUgYmVlbiByZXBvcnRlZCB5ZXQuXHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ21sJyl9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcxMHB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjNmExYjlhJywgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgICAgICBSdW4gTUwgUHJlZGljdGlvblxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09IEFJIC8gTUwgV09SS0ZMT1cgPT09PT09PT09PT09PT09PT09PT0gKi99XHJcbiAgICAgIHsobW9kZSA9PT0gJ2FpJyB8fCBtb2RlID09PSAnbWwnKSAmJiAhcmVzdWx0ICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzEycHgnIH19PlxyXG5cclxuICAgICAgICAgIHsvKiBCYWNrIGJ1dHRvbiAqL31cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0TW9kZSgnY2hvb3NlJyk7IHNldEVycm9yKG51bGwpOyBzZXRQcm9ncmVzcygnJykgfX0gZGlzYWJsZWQ9e3J1bm5pbmd9IHN0eWxlPXt7IGFsaWduU2VsZjogJ2ZsZXgtc3RhcnQnLCBwYWRkaW5nOiAnNHB4IDEwcHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzU1NScgfX0+XHJcbiAgICAgICAgICAgIHsnXFx1MjE5MCd9IEJhY2tcclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzhweCAxMnB4JywgYmFja2dyb3VuZDogbW9kZSA9PT0gJ2FpJyA/ICcjZjNlNWY1JyA6ICcjZWRlN2Y2JywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogbW9kZSA9PT0gJ2FpJyA/ICcjNGExNDhjJyA6ICcjMzExYjkyJyB9fT5cclxuICAgICAgICAgICAge21vZGUgPT09ICdhaScgPyAnXFx1RDgzRVxcdURERTAgQUkgUHJlZGljdGlvbicgOiAnXFx1RDgzRFxcdURDQ0EgTUwgUHJlZGljdGlvbid9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogUm91dGUgc2VsZWN0aW9uICovfVxyXG4gICAgICAgICAgeyFydW5uaW5nICYmIHJvdXRlU2VsZWN0aW9uVUkoKX1cclxuXHJcbiAgICAgICAgICB7LyogUnVuIGJ1dHRvbiAqL31cclxuICAgICAgICAgIHshcnVubmluZyAmJiAoXHJcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e21vZGUgPT09ICdhaScgPyBydW5BSVByZWRpY3Rpb24gOiBydW5NTFByZWRpY3Rpb259IGRpc2FibGVkPXtydW5uaW5nIHx8IChzZWFyY2hNb2RlICE9PSAnbWFwJyAmJiAhcm91dGVJZC50cmltKCkpIHx8IChzZWFyY2hNb2RlID09PSAnbWFwJyAmJiBzZWxlY3RlZE1hcFJvdXRlSWRzLnNpemUgPT09IDApfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMTJweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAocnVubmluZyB8fCAoc2VhcmNoTW9kZSAhPT0gJ21hcCcgJiYgIXJvdXRlSWQudHJpbSgpKSB8fCAoc2VhcmNoTW9kZSA9PT0gJ21hcCcgJiYgc2VsZWN0ZWRNYXBSb3V0ZUlkcy5zaXplID09PSAwKSkgPyAnI2FhYScgOiAobW9kZSA9PT0gJ2FpJyA/ICcjN2IxZmEyJyA6ICcjNmExYjlhJyksIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICAgICAge21vZGUgPT09ICdhaScgPyAnUnVuIEFJIFByZWRpY3Rpb24nIDogJ1J1biBNTCBQcmVkaWN0aW9uJ31cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIHsvKiBQcm9ncmVzcyAqL31cclxuICAgICAgICAgIHtydW5uaW5nICYmIHJ1bm5pbmdVSSgpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09IFJFU1VMVCA9PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAge3Jlc3VsdCAmJiByZXN1bHRVSSgpfVxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRcclxuXG4gZXhwb3J0IGZ1bmN0aW9uIF9fc2V0X3dlYnBhY2tfcHVibGljX3BhdGhfXyh1cmwpIHsgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB1cmwgfSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==