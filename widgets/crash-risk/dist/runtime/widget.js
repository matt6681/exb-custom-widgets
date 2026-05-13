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
    // Draw polygon to select multiple routes
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
            graphicsLayerRef.current = new GraphicsLayer({ title: 'CrashRisk Draw' });
            view.map.add(graphicsLayerRef.current);
        }
        graphicsLayerRef.current.removeAll();
        if (!sketchVMRef.current) {
            sketchVMRef.current = new SketchViewModel({ view, layer: graphicsLayerRef.current });
        }
        sketchVMRef.current.create('polygon');
        sketchVMRef.current.on('create', (evt) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
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
                // Use envelope geometry for JSONP (polygon JSON is too large for GET)
                const ext = polygon.extent;
                const envelopeJson = { xmin: ext.xmin, ymin: ext.ymin, xmax: ext.xmax, ymax: ext.ymax, spatialReference: { wkid: viewWkid } };
                const params = {
                    geometry: JSON.stringify(envelopeJson),
                    geometryType: 'esriGeometryEnvelope',
                    spatialRel: 'esriSpatialRelIntersects',
                    outFields: `${routeField},${nameField}`,
                    returnGeometry: 'true',
                    returnM: 'true',
                    outSR: String(viewWkid),
                    resultRecordCount: '200',
                    f: 'json'
                };
                const data = yield lrsServiceRef.current.queryFeaturesDirect(url, params);
                const routes = (data.features || []).map((f) => {
                    var _a, _b;
                    const rid = f.attributes[routeField];
                    const paths = ((_a = f.geometry) === null || _a === void 0 ? void 0 : _a.paths) || [];
                    const allVerts = paths.flat();
                    const hasZ = (_b = f.geometry) === null || _b === void 0 ? void 0 : _b.hasZ;
                    const mIdx = hasZ ? 3 : 2;
                    let minM = 0, maxM = 0;
                    if (allVerts.length > 0 && mIdx < allVerts[0].length) {
                        const measures = allVerts.map(v => v[mIdx]).filter(m => m != null && !isNaN(m));
                        if (measures.length > 0) {
                            minM = Math.min(...measures);
                            maxM = Math.max(...measures);
                        }
                        routeGeometriesRef.current.set(rid, { vertices: allVerts, mIdx });
                    }
                    return { routeId: rid, routeName: f.attributes[nameField] || null, fromMeasure: minM, toMeasure: maxM };
                });
                setMapRoutes(routes);
                setSelectedMapRouteIds(new Set(routes.map((r) => r.routeId)));
                setSearchMode('map');
            }
            catch (e) {
                setError('Area query failed: ' + (e.message || e));
            }
        }));
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
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: startDrawArea, disabled: drawing, style: { width: '100%', padding: '8px', border: '1px solid #0079c1', borderRadius: '4px', background: drawing ? '#e8f4fd' : '#fff', color: '#0079c1', cursor: 'pointer', fontSize: '12px', fontWeight: 500 } }, drawing ? 'Drawing... click to complete' : `Draw Polygon on Map${mapRoutes.length > 0 ? ` (${mapRoutes.length} routes found)` : ''}`),
            mapRoutes.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginTop: '6px', fontSize: '11px', color: '#333' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("strong", null, selectedMapRouteIds.size),
                " of ",
                mapRoutes.length,
                " routes selected"))))));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jcmFzaC1yaXNrL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxZQUFZLEdBQUcsQ0FBQztBQUVwQjs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBRSxHQUFXLEVBQUUsTUFBOEI7SUFDaEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLFlBQVksR0FBRyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxZQUFZLEVBQUUsRUFBRTtRQUM5RCxNQUFNLENBQUMsUUFBUSxHQUFHLFlBQVk7UUFFOUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2pELE1BQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUVoQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLE9BQVEsTUFBYyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLE1BQU0sQ0FBQyxVQUFVO2dCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxDQUFDLENBRUE7UUFBQyxNQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUM3QyxPQUFPLEVBQUU7WUFDVCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FB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T0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDeEQsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDbkQsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDekQsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7U0FDbEQ7UUFDRCxRQUFRLEVBQUU7WUFDUixVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtZQUMxRCxtQkFBbUIsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ2xFLHFCQUFxQixFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDckUsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDcEQsTUFBTSxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7U0FDckQ7UUFDRCxPQUFPLEVBQUU7WUFDUCxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtZQUN0RCxRQUFRLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxF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QyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3BELElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3BFLElBQUksR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ3BFLE1BQUs7d0JBQ1AsQ0FBQztvQkFDSCxDQUFDO29CQUNELE1BQU0sSUFBSSxHQUFlLEVBQUU7b0JBQzNCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM3QyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDakMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNyQyxJQUFJLEVBQUUsR0FBRyxPQUFPOzRCQUFFLFNBQVE7d0JBQzFCLElBQUksRUFBRSxHQUFHLEtBQUs7NEJBQUUsTUFBSzt3QkFDckIsSUFBSSxFQUFFLElBQUksT0FBTyxJQUFJLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQzs0QkFDakMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dDQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ25ILENBQUM7NkJBQU0sSUFBSSxFQUFFLEdBQUcsT0FBTyxJQUFJLEVBQUUsR0FBRyxPQUFPLEVBQUUsQ0FBQzs0QkFDeEMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDOzRCQUN2QyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDM0ksQ0FBQzt3QkFDRCxJQUFJLEVBQUUsSUFBSSxPQUFPLElBQUksRUFBRSxJQUFJLEtBQUs7NEJBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzZCQUNoRixJQUFJLEVBQUUsR0FBRyxLQUFL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QyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNuSCxDQUFDOzRCQUNELElBQUksRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFFLElBQUksR0FBRyxFQUFFLENBQUM7Z0NBQzNCLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0NBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNuSCxDQUFDO3dCQUNILENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQzt3QkFBRSxTQUFRO29CQUU3QixNQUFNLFNBQVMsR0FBRyxTQUFTLElBQUksRUFBRSxDQUFDLENBQUMsQ0FB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QUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWTtnQ0FBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsWUFBWTtnQ0FBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYztnQ0FBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsWUFBWSxDQUFLLENBQVE7d0JBQzVTLDBFQUFRLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQU0sRUFBRSxDQUFTLEVBQUUsRUFBRTs7NEJBQUMsUUFDekUsbUVBQUksR0FBRyxFQUFFLENBQUM7Z0NBQUUsbUVBQUksS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFHLE9BQUMsQ0FBQyxPQUFPLDBDQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQU07Z0NBQUEsbUVBQUksS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUcsT0FBQyxDQUFDLEtBQUs7dUNBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzt5Q0FBRyxPQUFDLENBQUMsR0FBRzt1Q0FBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQU07Z0NBQUEsbUVBQUksS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLElBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBTTtnQ0FBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUcsQ0FBQyxDQUFD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Q0FBQyxVQUFVLEtBQUssS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLEtBQUssS0FBSyxJQUFJLG1CQUFtQixDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFDamhCLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FDbkQsQ0FDVjtZQUdBLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FDbkIsQ0FDUDtRQUdBLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FDakIsQ0FDUDtBQUNILENBQUM7QUFFRCxpRUFBZSxNQUFNO0FBRWIsU0FBUywyQkFBMkIsQ0FBQyxHQUFHLElBQUkscUJBQXVCLEdBQUcsR0FBRyxFQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvY3Jhc2gtcmlzay9zcmMvbHJzLXV0aWxzL2xycy1zZXJ2aWNlLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1hcmNnaXNcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi9qaW11LWNvcmUvbGliL3NldC1wdWJsaWMtcGF0aC50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvY3Jhc2gtcmlzay9zcmMvcnVudGltZS93aWRnZXQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIExSUyBSRVNUIEFQSSBTZXJ2aWNlIHdyYXBwZXJcclxuLy8gVXNlcyBKU09OUCB0byBieXBhc3MgQ09SUyBpc3N1ZXMgd2l0aCBtaXNjb25maWd1cmVkIHNlcnZlcnMgKGR1cGxpY2F0ZSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4gaGVhZGVycylcclxuaW1wb3J0IHR5cGUge1xyXG4gIExyc1NlcnZpY2VJbmZvLFxyXG4gIE5ldHdvcmtMYXllckluZm8sXHJcbiAgRXZlbnRMYXllckluZm8sXHJcbiAgTWVhc3VyZVRvR2VvbWV0cnlMb2NhdGlvbixcclxuICBNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdCxcclxuICBHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdCxcclxuICBRdWVyeUF0dHJpYnV0ZVNldFBhcmFtcyxcclxuICBGZWF0dXJlU2V0UmVzdWx0XHJcbn0gZnJvbSAnLi90eXBlcydcclxuXHJcbmxldCBqc29ucENvdW50ZXIgPSAwXHJcblxyXG4vKipcclxuICogSlNPTlAgcmVxdWVzdCDigJQgYnlwYXNzZXMgQ09SUyBlbnRpcmVseSBieSBpbmplY3RpbmcgYSA8c2NyaXB0PiB0YWcuXHJcbiAqIEFyY0dJUyBSRVNUIEFQSSBzdXBwb3J0cyBKU09OUCB2aWEgdGhlICdjYWxsYmFjaycgcGFyYW1ldGVyLlxyXG4gKi9cclxuZnVuY3Rpb24ganNvbnBSZXF1ZXN0ICh1cmw6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxhbnk+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgY2FsbGJhY2tOYW1lID0gYF9scnNfY2JfJHtEYXRlLm5vdygpfV8ke2pzb25wQ291bnRlcisrfWBcclxuICAgIHBhcmFtcy5jYWxsYmFjayA9IGNhbGxiYWNrTmFtZVxyXG5cclxuICAgIGNvbnN0IHFzID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhwYXJhbXMpLnRvU3RyaW5nKClcclxuICAgIGNvbnN0IHNjcmlwdFVybCA9IGAke3VybH0/JHtxc31gXHJcblxyXG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcclxuICAgIHNjcmlwdC5zcmMgPSBzY3JpcHRVcmxcclxuXHJcbiAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xyXG4gICAgICBkZWxldGUgKHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV1cclxuICAgICAgaWYgKHNjcmlwdC5wYXJlbnROb2RlKSBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXHJcbiAgICB9XHJcblxyXG4gICAgOyh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKGRhdGEuZXJyb3IubWVzc2FnZSB8fCAnUmVxdWVzdCBlcnJvcicpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4ge1xyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgcmVqZWN0KG5ldyBFcnJvcignSlNPTlAgcmVxdWVzdCBmYWlsZWQnKSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0pIHtcclxuICAgICAgICBjbGVhbnVwKClcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdSZXF1ZXN0IHRpbWVvdXQnKSlcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDApXHJcblxyXG4gICAgOyh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpXHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlIHx8ICdSZXF1ZXN0IGVycm9yJykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXHJcbiAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFdyYXBwZXIgYXJvdW5kIEFyY0dJUyBMUlMgUkVTVCBBUEkgKExSU2VydmVyIGV4dGVuc2lvbikuXHJcbiAqIFVzZXMgSlNPTlAgZm9yIGFsbCByZXF1ZXN0cyB0byBhdm9pZCBDT1JTIGlzc3Vlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBMcnNTZXJ2aWNlIHtcclxuICBwcml2YXRlIGJhc2VVcmw6IHN0cmluZ1xyXG4gIHByaXZhdGUgdG9rZW46IHN0cmluZyB8IG51bGxcclxuXHJcbiAgY29uc3RydWN0b3IgKGJhc2VVcmw6IHN0cmluZywgdG9rZW4/OiBzdHJpbmcpIHtcclxuICAgIC8vIEVuc3VyZSBubyB0cmFpbGluZyBzbGFzaFxyXG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKVxyXG4gICAgdGhpcy50b2tlbiA9IHRva2VuIHx8IG51bGxcclxuICB9XHJcblxyXG4gIHNldFRva2VuICh0b2tlbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIExSUyBzZXJ2aWNlIG1ldGFkYXRhIChuZXR3b3JrIGxheWVycywgZXZlbnQgbGF5ZXJzLCBldGMuKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldFNlcnZpY2VJbmZvICgpOiBQcm9taXNlPExyc1NlcnZpY2VJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PExyc1NlcnZpY2VJbmZvPignJylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGRldGFpbGVkIGluZm8gZm9yIGEgbmV0d29yayBsYXllciAoZmllbGRzLCBtZWFzdXJlIHByZWNpc2lvbiwgZXRjLilcclxuICAgKi9cclxuICBhc3luYyBnZXROZXR3b3JrTGF5ZXJJbmZvIChsYXllcklkOiBudW1iZXIpOiBQcm9taXNlPE5ldHdvcmtMYXllckluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8TmV0d29ya0xheWVySW5mbz4oYC9uZXR3b3JrTGF5ZXJzLyR7bGF5ZXJJZH1gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggZGV0YWlsZWQgaW5mbyBmb3IgYW4gZXZlbnQgbGF5ZXJcclxuICAgKi9cclxuICBhc3luYyBnZXRFdmVudExheWVySW5mbyAobGF5ZXJJZDogbnVtYmVyKTogUHJvbWlzZTxFdmVudExheWVySW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxFdmVudExheWVySW5mbz4oYC9ldmVudExheWVycy8ke2xheWVySWR9YClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgcm91dGUgSUQgKyBtZWFzdXJlcyB0byBtYXAgZ2VvbWV0cnlcclxuICAgKi9cclxuICBhc3luYyBtZWFzdXJlVG9HZW9tZXRyeSAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgbG9jYXRpb25zOiBNZWFzdXJlVG9HZW9tZXRyeUxvY2F0aW9uW10sXHJcbiAgICBvdXRTUj86IGFueVxyXG4gICk6IFByb21pc2U8TWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChvdXRTUikge1xyXG4gICAgICBwYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShvdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8TWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vbWVhc3VyZVRvR2VvbWV0cnlgLFxyXG4gICAgICBwYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgbWFwIGdlb21ldHJ5IChwb2ludCkgdG8gcm91dGUgKyBtZWFzdXJlXHJcbiAgICovXHJcbiAgYXN5bmMgZ2VvbWV0cnlUb01lYXN1cmUgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIGxvY2F0aW9uczogQXJyYXk8eyBnZW9tZXRyeTogYW55IH0+LFxyXG4gICAgb3V0U1I/OiBhbnlcclxuICApOiBQcm9taXNlPEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0PiB7XHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkobG9jYXRpb25zKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAob3V0U1IpIHtcclxuICAgICAgcGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkob3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L2dlb21ldHJ5VG9NZWFzdXJlYCxcclxuICAgICAgcGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEeW5hbWljIHNlZ21lbnRhdGlvbiBvdmVybGF5IOKAlCBxdWVyeUF0dHJpYnV0ZVNldFxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5QXR0cmlidXRlU2V0IChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBwYXJhbXM6IFF1ZXJ5QXR0cmlidXRlU2V0UGFyYW1zXHJcbiAgKTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0UGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5sb2NhdGlvbnMpLFxyXG4gICAgICBhdHRyaWJ1dGVTZXQ6IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5hdHRyaWJ1dGVTZXQpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChwYXJhbXMub3V0U1IpIHtcclxuICAgICAgcmVxdWVzdFBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5vdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8RmVhdHVyZVNldFJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9xdWVyeUF0dHJpYnV0ZVNldGAsXHJcbiAgICAgIHJlcXVlc3RQYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YW5kYXJkIGZlYXR1cmUgcXVlcnkgYWdhaW5zdCBhIG1hcCBzZXJ2aWNlIGxheWVyIChmb3IgUm9hZCBMb2cgaW5kaXZpZHVhbCBldmVudCBxdWVyaWVzKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5RmVhdHVyZXMgKFxyXG4gICAgbWFwU2VydmljZVVybDogc3RyaW5nLFxyXG4gICAgbGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgd2hlcmU6IHN0cmluZyxcclxuICAgIG91dEZpZWxkczogc3RyaW5nW10gPSBbJyonXVxyXG4gICk6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgLy8gVGhlIG1hcCBzZXJ2aWNlIFVSTCBpcyB0aGUgcGFyZW50IG9mIExSU2VydmVyIGV4dGVuc2lvblxyXG4gICAgLy8gZS5nLiAuLi4vTWFwU2VydmVyLzAvcXVlcnlcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSB0aGlzLmJhc2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7bGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICB3aGVyZSxcclxuICAgICAgb3V0RmllbGRzOiBvdXRGaWVsZHMuam9pbignLCcpLFxyXG4gICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpcmVjdCBxdWVyeSB3aXRoIGFyYml0cmFyeSBwYXJhbXMgKGZvciBzcGF0aWFsIHF1ZXJpZXMgdmlhIEpTT05QKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5RmVhdHVyZXNEaXJlY3QgKHVybDogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuICAgIHBhcmFtcy5mID0gcGFyYW1zLmYgfHwgJ2pzb24nXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUXVlcnkgcm91dGVzIG9uIGEgbmV0d29yayBsYXllciAoZm9yIHJvdXRlIHBpY2tlciBhdXRvY29tcGxldGUpXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlSb3V0ZXMgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIHNlYXJjaFRleHQ6IHN0cmluZyxcclxuICAgIHJvdXRlSWRGaWVsZDogc3RyaW5nLFxyXG4gICAgcm91dGVOYW1lRmllbGQ6IHN0cmluZyB8IG51bGwsXHJcbiAgICBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMFxyXG4gICk6IFByb21pc2U8QXJyYXk8eyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9Pj4ge1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IHRoaXMuYmFzZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtuZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgY29uc3Qgc2VhcmNoRmllbGQgPSByb3V0ZU5hbWVGaWVsZCB8fCByb3V0ZUlkRmllbGRcclxuICAgIGNvbnN0IHdoZXJlID0gYFVQUEVSKCR7c2VhcmNoRmllbGR9KSBMSUtFIFVQUEVSKCcke3NlYXJjaFRleHQucmVwbGFjZSgvJy9nLCBcIicnXCIpfSUnKWBcclxuICAgIGNvbnN0IG91dEZpZWxkcyA9IHJvdXRlTmFtZUZpZWxkXHJcbiAgICAgID8gW3JvdXRlSWRGaWVsZCwgcm91dGVOYW1lRmllbGRdXHJcbiAgICAgIDogW3JvdXRlSWRGaWVsZF1cclxuXHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIHdoZXJlLFxyXG4gICAgICBvdXRGaWVsZHM6IG91dEZpZWxkcy5qb2luKCcsJyksXHJcbiAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICByZXN1bHRSZWNvcmRDb3VudDogbWF4UmVzdWx0cy50b1N0cmluZygpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBqc29uID0gYXdhaXQganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG5cclxuICAgIGNvbnN0IGFsbCA9IChqc29uLmZlYXR1cmVzIHx8IFtdKS5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlSWRGaWVsZF0sXHJcbiAgICAgIHJvdXRlTmFtZTogcm91dGVOYW1lRmllbGQgPyBmLmF0dHJpYnV0ZXNbcm91dGVOYW1lRmllbGRdIDogbnVsbFxyXG4gICAgfSkpXHJcbiAgICAvLyBEZWR1cGxpY2F0ZSBieSByb3V0ZUlkXHJcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcclxuICAgIHJldHVybiBhbGwuZmlsdGVyKChyOiBhbnkpID0+IHtcclxuICAgICAgaWYgKHNlZW4uaGFzKHIucm91dGVJZCkpIHJldHVybiBmYWxzZVxyXG4gICAgICBzZWVuLmFkZChyLnJvdXRlSWQpXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLy8gLS0tIFByaXZhdGUgaGVscGVycyAtLS1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyByZXF1ZXN0PFQ+IChwYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPFQ+IHtcclxuICAgIGNvbnN0IHVybCA9IGAke3RoaXMuYmFzZVVybH0ke3BhdGh9YFxyXG4gICAgY29uc3QgYWxsUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBmOiAnanNvbicsXHJcbiAgICAgIC4uLnBhcmFtc1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgYWxsUGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBhbGxQYXJhbXMpIGFzIFByb21pc2U8VD5cclxuICB9XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfYXJjZ2lzX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfY29yZV9fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGV4aXN0cyAoZGV2ZWxvcG1lbnQgb25seSlcblx0aWYgKF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiLyoqIEBqc3hSdW50aW1lIGNsYXNzaWMgKi9cclxuaW1wb3J0IHsgUmVhY3QsIHR5cGUgQWxsV2lkZ2V0UHJvcHMsIFNlc3Npb25NYW5hZ2VyIH0gZnJvbSAnamltdS1jb3JlJ1xyXG5pbXBvcnQgeyBKaW11TWFwVmlld0NvbXBvbmVudCwgdHlwZSBKaW11TWFwVmlldyB9IGZyb20gJ2ppbXUtYXJjZ2lzJ1xyXG5pbXBvcnQgdHlwZSB7IElNQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5pbXBvcnQgeyBMcnNTZXJ2aWNlIH0gZnJvbSAnLi4vbHJzLXV0aWxzL2xycy1zZXJ2aWNlJ1xyXG5cclxuY29uc3QgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiwgdXNlRWZmZWN0IH0gPSBSZWFjdFxyXG5cclxudHlwZSBXb3JrZmxvd01vZGUgPSAnY2hvb3NlJyB8ICdhaScgfCAnbWwnXHJcblxyXG5jb25zdCBXaWRnZXQgPSAocHJvcHM6IEFsbFdpZGdldFByb3BzPElNQ29uZmlnPikgPT4ge1xyXG4gIGNvbnN0IGNvbmZpZyA9IHByb3BzLmNvbmZpZ1xyXG4gIGNvbnN0IGhhc01hcFdpZGdldCA9IEJvb2xlYW4ocHJvcHMudXNlTWFwV2lkZ2V0SWRzICYmICgocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSkubGVuZ3RoID4gMCB8fCAocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LnNpemUgPiAwKSlcclxuXHJcbiAgLy8gV29ya2Zsb3cgc3RhdGVcclxuICBjb25zdCBbbW9kZSwgc2V0TW9kZV0gPSB1c2VTdGF0ZTxXb3JrZmxvd01vZGU+KCdjaG9vc2UnKVxyXG4gIGNvbnN0IFtzaG93QUlIZWxwLCBzZXRTaG93QUlIZWxwXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtzaG93TUxIZWxwLCBzZXRTaG93TUxIZWxwXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG5cclxuICAvLyBSb3V0ZSBzZWxlY3Rpb24gc3RhdGVcclxuICBjb25zdCBbcm91dGVJZCwgc2V0Um91dGVJZF0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbcm91dGVOYW1lLCBzZXRSb3V0ZU5hbWVdID0gdXNlU3RhdGUoJycpXHJcbiAgY29uc3QgW2Zyb21NZWFzdXJlLCBzZXRGcm9tTWVhc3VyZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbdG9NZWFzdXJlLCBzZXRUb01lYXN1cmVdID0gdXNlU3RhdGUoJycpXHJcbiAgY29uc3QgW3JvdXRlTWVhc3VyZVJhbmdlLCBzZXRSb3V0ZU1lYXN1cmVSYW5nZV0gPSB1c2VTdGF0ZTx7IG1pbjogbnVtYmVyOyBtYXg6IG51bWJlciB9IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbc2VhcmNoTW9kZSwgc2V0U2VhcmNoTW9kZV0gPSB1c2VTdGF0ZTwnaWQnIHwgJ25hbWUnIHwgJ21hcCc+KCdpZCcpXHJcbiAgY29uc3QgW3JvdXRlU3VnZ2VzdGlvbnMsIHNldFJvdXRlU3VnZ2VzdGlvbnNdID0gdXNlU3RhdGU8QXJyYXk8eyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9Pj4oW10pXHJcbiAgY29uc3QgW3Nob3dTdWdnZXN0aW9ucywgc2V0U2hvd1N1Z2dlc3Rpb25zXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtwaWNraW5nRnJvbU1hcCwgc2V0UGlja2luZ0Zyb21NYXBdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3BpY2tpbmdNZWFzdXJlLCBzZXRQaWNraW5nTWVhc3VyZV0gPSB1c2VTdGF0ZTwnZnJvbScgfCAndG8nIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbZHJhd2luZywgc2V0RHJhd2luZ10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbbWFwUm91dGVzLCBzZXRNYXBSb3V0ZXNdID0gdXNlU3RhdGU8QXJyYXk8eyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbDsgZnJvbU1lYXN1cmU6IG51bWJlcjsgdG9NZWFzdXJlOiBudW1iZXIgfT4+KFtdKVxyXG4gIGNvbnN0IFtzZWxlY3RlZE1hcFJvdXRlSWRzLCBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzXSA9IHVzZVN0YXRlPFNldDxzdHJpbmc+PihuZXcgU2V0KCkpXHJcbiAgY29uc3QgW3JvdXRlUGlja0NhbmRpZGF0ZXMsIHNldFJvdXRlUGlja0NhbmRpZGF0ZXNdID0gdXNlU3RhdGU8QXJyYXk8eyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIH0+IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbc2VsZWN0ZWRGb2xkZXJJZCwgc2V0U2VsZWN0ZWRGb2xkZXJJZF0gPSB1c2VTdGF0ZTxzdHJpbmc+KCcnKVxyXG5cclxuICAvLyBQcmVkaWN0aW9uIHN0YXRlXHJcbiAgY29uc3QgW3J1bm5pbmcsIHNldFJ1bm5pbmddID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3Byb2dyZXNzLCBzZXRQcm9ncmVzc10gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgW3Jlc3VsdCwgc2V0UmVzdWx0XSA9IHVzZVN0YXRlPHsgbGF5ZXJVcmw/OiBzdHJpbmc7IGl0ZW1Vcmw/OiBzdHJpbmcgfSB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgW3Nob3dFeHBsYW5hdGlvbiwgc2V0U2hvd0V4cGxhbmF0aW9uXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtmYWN0b3JzLCBzZXRGYWN0b3JzXSA9IHVzZVN0YXRlPGFueT4obnVsbClcclxuICBjb25zdCBbbW9kZWxJbmZvLCBzZXRNb2RlbEluZm9dID0gdXNlU3RhdGU8YW55PihudWxsKVxyXG4gIGNvbnN0IFtjcmFzaFN0YXRzLCBzZXRDcmFzaFN0YXRzXSA9IHVzZVN0YXRlPHsgdG90YWxDcmFzaGVzOiBudW1iZXI7IHRvcENvcnJlbGF0aW9uczogQXJyYXk8eyBsYXllcjogc3RyaW5nOyB2YWx1ZTogc3RyaW5nOyBjb3VudDogbnVtYmVyOyBwY3Q6IG51bWJlciB9PiB9IHwgbnVsbD4obnVsbClcclxuXHJcbiAgLy8gUmVmc1xyXG4gIGNvbnN0IGppbXVNYXBWaWV3UmVmID0gdXNlUmVmPEppbXVNYXBWaWV3IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBscnNTZXJ2aWNlUmVmID0gdXNlUmVmPExyc1NlcnZpY2UgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHJvdXRlR2VvbWV0cmllc1JlZiA9IHVzZVJlZjxNYXA8c3RyaW5nLCB7IHZlcnRpY2VzOiBudW1iZXJbXVtdOyBtSWR4OiBudW1iZXIgfT4+KG5ldyBNYXAoKSlcclxuICBjb25zdCBwaWNrSGFuZGxlclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja0hvdmVySGFuZGxlclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja1Rvb2x0aXBSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHBpY2tTbmFwR3JhcGhpY1JlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja0hvdmVyVGltZW91dFJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3Qgc2tldGNoVk1SZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IGdyYXBoaWNzTGF5ZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHNlYXJjaFRpbWVvdXRSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIC8vIFJvdXRlIHByZXZpZXcgKyBtZWFzdXJlIHBpY2tpbmcgcmVmc1xyXG4gIGNvbnN0IHJvdXRlUHJldmlld0dyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHJvdXRlUHJldmlld0xheWVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBmcm9tTWVhc3VyZUdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHRvTWVhc3VyZUdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHJvdXRlUHJldmlld1ZlcnRzUmVmID0gdXNlUmVmPHsgdmVydGljZXM6IG51bWJlcltdW107IG1JZHg6IG51bWJlciB9IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBtZWFzdXJlUGlja0hhbmRsZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IG1lYXN1cmVQaWNrSG92ZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IG1lYXN1cmVTbmFwR3JhcGhpY1JlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgbWVhc3VyZVRvb2x0aXBSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHNob3dSb3V0ZVByZXZpZXdSZWYgPSB1c2VSZWY8KHJpZDogc3RyaW5nKSA9PiB2b2lkPigoKSA9PiB7fSlcclxuICBjb25zdCBzaG93TWVhc3VyZVBvaW50UmVmID0gdXNlUmVmPCh3aGljaDogJ2Zyb20nIHwgJ3RvJywgbWVhc3VyZVZhbDogc3RyaW5nKSA9PiB2b2lkPigoKSA9PiB7fSlcclxuICBjb25zdCBjcmFzaEV2ZW50c0xheWVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBwcmVkaWN0aW9uTGF5ZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG5cclxuICAvLyBJbml0aWFsaXplIExyc1NlcnZpY2UgKEpTT05QLWJhc2VkLCBieXBhc3NlcyBDT1JTKVxyXG4gIC8vIENhY2hlIGRpc2NvdmVyZWQgcm91dGVJZEZpZWxkTmFtZSBwZXIgZXZlbnQgbGF5ZXIgZnJvbSBMUlMgbWV0YWRhdGFcclxuICBjb25zdCBldmVudEZpZWxkTmFtZXNSZWYgPSB1c2VSZWY8TWFwPG51bWJlciwgeyByb3V0ZUlkRmllbGQ6IHN0cmluZzsgbWVhc3VyZUZpZWxkOiBzdHJpbmc7IGZyb21NZWFzdXJlRmllbGQ6IHN0cmluZzsgdG9NZWFzdXJlRmllbGQ6IHN0cmluZyB9Pj4obmV3IE1hcCgpKVxyXG5cclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpZz8ubHJzU2VydmljZVVybCkge1xyXG4gICAgICBscnNTZXJ2aWNlUmVmLmN1cnJlbnQgPSBuZXcgTHJzU2VydmljZShjb25maWcubHJzU2VydmljZVVybClcclxuXHJcbiAgICAgIC8vIERpc2NvdmVyIGNvcnJlY3QgZmllbGQgbmFtZXMgZnJvbSBMUlMgZXZlbnQgbGF5ZXIgbWV0YWRhdGFcclxuICAgICAgY29uc3QgbHJzID0gbHJzU2VydmljZVJlZi5jdXJyZW50XHJcbiAgICAgIGNvbnN0IGV2ZW50Q29uZmlncyA9IGNvbmZpZy5ldmVudExheWVyQ29uZmlncyB8fCBbXVxyXG4gICAgICBmb3IgKGNvbnN0IGNmZyBvZiBldmVudENvbmZpZ3MpIHtcclxuICAgICAgICBscnMuZ2V0RXZlbnRMYXllckluZm8oY2ZnLmxheWVySWQpLnRoZW4oKGRldGFpbDogYW55KSA9PiB7XHJcbiAgICAgICAgICBldmVudEZpZWxkTmFtZXNSZWYuY3VycmVudC5zZXQoY2ZnLmxheWVySWQsIHtcclxuICAgICAgICAgICAgcm91dGVJZEZpZWxkOiBkZXRhaWwucm91dGVJZEZpZWxkTmFtZSB8fCBjZmcucm91dGVJZEZpZWxkIHx8ICdyb3V0ZWlkJyxcclxuICAgICAgICAgICAgbWVhc3VyZUZpZWxkOiBkZXRhaWwubWVhc3VyZUZpZWxkTmFtZSB8fCBjZmcubWVhc3VyZUZpZWxkIHx8ICdtZWFzdXJlJyxcclxuICAgICAgICAgICAgZnJvbU1lYXN1cmVGaWVsZDogZGV0YWlsLmZyb21NZWFzdXJlRmllbGROYW1lIHx8IGNmZy5mcm9tTWVhc3VyZUZpZWxkIHx8ICdmcm9tX21lYXN1cmUnLFxyXG4gICAgICAgICAgICB0b01lYXN1cmVGaWVsZDogZGV0YWlsLnRvTWVhc3VyZUZpZWxkTmFtZSB8fCBjZmcudG9NZWFzdXJlRmllbGQgfHwgJ3RvX21lYXN1cmUnXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pLmNhdGNoKCgpID0+IHsgLyogdXNlIGNvbmZpZyBkZWZhdWx0cyAqLyB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZz8ubHJzU2VydmljZVVybF0pXHJcblxyXG4gIC8vIEhhbmRsZSBtYXAgdmlldyByZWFkeVxyXG4gIGNvbnN0IG9uQWN0aXZlVmlld0NoYW5nZSA9IHVzZUNhbGxiYWNrKChqbXY6IEppbXVNYXBWaWV3KSA9PiB7XHJcbiAgICBqaW11TWFwVmlld1JlZi5jdXJyZW50ID0gam12XHJcbiAgfSwgW10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFJPVVRFIFNFTEVDVElPTiAoc2FtZSBhcyByb2FkLWxvZykgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgaGFuZGxlUm91dGVTZWFyY2ggPSB1c2VDYWxsYmFjaygodmFsdWU6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKHNlYXJjaE1vZGUgPT09ICdpZCcpIHtcclxuICAgICAgc2V0Um91dGVJZCh2YWx1ZSlcclxuICAgICAgc2V0Um91dGVOYW1lKCcnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0Um91dGVOYW1lKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICBpZiAodmFsdWUubGVuZ3RoIDwgMiB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSB7XHJcbiAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMoW10pXHJcbiAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgc2VhcmNoVGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgICAgIGNvbnN0IG5hbWVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVOYW1lRmllbGQgfHwgJ3JvdXRlX25hbWUnXHJcbiAgICAgICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtjb25maWcubmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgICAgICBjb25zdCBzZWFyY2hGaWVsZCA9IHNlYXJjaE1vZGUgPT09ICduYW1lJyA/IG5hbWVGaWVsZCA6IHJvdXRlRmllbGRcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICB3aGVyZTogYFVQUEVSKCR7c2VhcmNoRmllbGR9KSBMSUtFIFVQUEVSKCclJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9JScpYCxcclxuICAgICAgICAgIG91dEZpZWxkczogYCR7cm91dGVGaWVsZH0sJHtuYW1lRmllbGR9YCxcclxuICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICcxMCcsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IChkYXRhLmZlYXR1cmVzIHx8IFtdKS5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgICAgIHJvdXRlSWQ6IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJyxcclxuICAgICAgICAgIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgbnVsbFxyXG4gICAgICAgIH0pKVxyXG4gICAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMocmVzdWx0cylcclxuICAgICAgICBzZXRTaG93U3VnZ2VzdGlvbnMocmVzdWx0cy5sZW5ndGggPiAwKVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBzZXRSb3V0ZVN1Z2dlc3Rpb25zKFtdKVxyXG4gICAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgICAgfVxyXG4gICAgfSwgMzAwKVxyXG4gIH0sIFtjb25maWcsIHNlYXJjaE1vZGVdKVxyXG5cclxuICBjb25zdCBzZWxlY3RSb3V0ZSA9IHVzZUNhbGxiYWNrKChyb3V0ZTogeyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9KSA9PiB7XHJcbiAgICBzZXRSb3V0ZUlkKHJvdXRlLnJvdXRlSWQpXHJcbiAgICBzZXRSb3V0ZU5hbWUocm91dGUucm91dGVOYW1lIHx8ICcnKVxyXG4gICAgc2V0U2hvd1N1Z2dlc3Rpb25zKGZhbHNlKVxyXG4gICAgZmV0Y2hSb3V0ZU1lYXN1cmVzKHJvdXRlLnJvdXRlSWQpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIEZldGNoIHJvdXRlIGdlb21ldHJ5ICsgbWVhc3VyZSByYW5nZSArIHNob3cgcHJldmlld1xyXG4gIGNvbnN0IGZldGNoUm91dGVNZWFzdXJlcyA9IHVzZUNhbGxiYWNrKGFzeW5jIChyaWQ6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFscnNTZXJ2aWNlUmVmLmN1cnJlbnQgfHwgIXJpZCkgcmV0dXJuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICBjb25zdCB2aWV3V2tpZCA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXc/LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcbiAgICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICB3aGVyZTogYCR7cm91dGVGaWVsZH0gPSAnJHtyaWQucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgLFxyXG4gICAgICAgIG91dEZpZWxkczogcm91dGVGaWVsZCxcclxuICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgIHJldHVybk06ICd0cnVlJyxcclxuICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEnLFxyXG4gICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHVybCwgcGFyYW1zKVxyXG4gICAgICBpZiAoIWRhdGEuZmVhdHVyZXM/Lmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gICAgICBjb25zdCBwYXRocyA9IGRhdGEuZmVhdHVyZXNbMF0uZ2VvbWV0cnk/LnBhdGhzIHx8IFtdXHJcbiAgICAgIGNvbnN0IGFsbFZlcnRzOiBudW1iZXJbXVtdID0gW11cclxuICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSBhbGxWZXJ0cy5wdXNoKC4uLnBhdGgpXHJcbiAgICAgIGNvbnN0IGhhc1ogPSBkYXRhLmZlYXR1cmVzWzBdLmdlb21ldHJ5Py5oYXNaXHJcbiAgICAgIGNvbnN0IG1JZHggPSBoYXNaID8gMyA6IDJcclxuICAgICAgYWxsVmVydHMuc29ydCgoYSwgYikgPT4gKGFbbUlkeF0gfHwgMCkgLSAoYlttSWR4XSB8fCAwKSlcclxuXHJcbiAgICAgIGlmIChhbGxWZXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3QgbWluTSA9IGFsbFZlcnRzWzBdW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBtYXhNID0gYWxsVmVydHNbYWxsVmVydHMubGVuZ3RoIC0gMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIHNldEZyb21NZWFzdXJlKG1pbk0udG9GaXhlZCgzKSlcclxuICAgICAgICBzZXRUb01lYXN1cmUobWF4TS50b0ZpeGVkKDMpKVxyXG4gICAgICAgIHNldFJvdXRlTWVhc3VyZVJhbmdlKHsgbWluOiBtaW5NLCBtYXg6IG1heE0gfSlcclxuICAgICAgICByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5zZXQocmlkLCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9KVxyXG4gICAgICAgIHJvdXRlUHJldmlld1ZlcnRzUmVmLmN1cnJlbnQgPSB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9XHJcblxyXG4gICAgICAgIC8vIFNob3cgcm91dGUgcHJldmlldyBvbiBtYXBcclxuICAgICAgICBzaG93Um91dGVQcmV2aWV3UmVmLmN1cnJlbnQocmlkKVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDcmFzaFJpc2tdIGZldGNoUm91dGVNZWFzdXJlcyBmYWlsZWQ6JywgZSlcclxuICAgIH1cclxuICB9LCBbY29uZmlnXSlcclxuXHJcbiAgLy8gU2hvdyBzZWxlY3RlZCByb3V0ZSBhcyBhIGRhc2hlZCBsaW5lIG9uIHRoZSBtYXAgKGxpa2Ugcm9hZC1sb2cpXHJcbiAgY29uc3Qgc2hvd1JvdXRlUHJldmlldyA9IHVzZUNhbGxiYWNrKGFzeW5jIChyaWQ6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICAvLyBFbnN1cmUgcHJldmlldyBHcmFwaGljc0xheWVyIGV4aXN0c1xyXG4gICAgaWYgKCFyb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IEdyYXBoaWNzTGF5ZXIgPSBhd2FpdCAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2xheWVycy9HcmFwaGljc0xheWVyJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSlcclxuICAgICAgY29uc3QgZ2wgPSBuZXcgR3JhcGhpY3NMYXllcih7IGlkOiAnX19jcmFzaHJpc2tfcm91dGVfcHJldmlld19fJywgdGl0bGU6ICdSb3V0ZSBQcmV2aWV3JyB9KVxyXG4gICAgICB2aWV3Lm1hcC5hZGQoZ2wsIDApXHJcbiAgICAgIHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnQgPSBnbFxyXG4gICAgfVxyXG4gICAgY29uc3QgcHJldmlld0xheWVyID0gcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudFxyXG5cclxuICAgIC8vIFJlbW92ZSBwcmV2aW91c1xyXG4gICAgaWYgKHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCkgeyBwcmV2aWV3TGF5ZXIucmVtb3ZlKHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCk7IHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSkgZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQuZm9yRWFjaCgoZzogYW55KSA9PiBwcmV2aWV3TGF5ZXIucmVtb3ZlKGcpKVxyXG4gICAgICBlbHNlIHByZXZpZXdMYXllci5yZW1vdmUoZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpXHJcbiAgICAgIGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgfVxyXG4gICAgaWYgKHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpKSB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQuZm9yRWFjaCgoZzogYW55KSA9PiBwcmV2aWV3TGF5ZXIucmVtb3ZlKGcpKVxyXG4gICAgICBlbHNlIHByZXZpZXdMYXllci5yZW1vdmUodG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KVxyXG4gICAgICB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyaWQpIHJldHVyblxyXG5cclxuICAgIC8vIEZldGNoIGdlb21ldHJ5IChkb24ndCByZXF1aXJlIGNhY2hlIOKAlCBuZWVkZWQgZm9yIGRpc2FtYmlndWF0aW9uIGhvdmVyKVxyXG4gICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHVybCwge1xyXG4gICAgICAgIHdoZXJlOiBgJHtyb3V0ZUZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AsXHJcbiAgICAgICAgb3V0RmllbGRzOiByb3V0ZUZpZWxkLFxyXG4gICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMScsXHJcbiAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgIH0pXHJcbiAgICAgIGlmICghanNvbi5mZWF0dXJlcz8ubGVuZ3RoKSByZXR1cm5cclxuICAgICAgY29uc3QgcGF0aHMgPSBqc29uLmZlYXR1cmVzWzBdLmdlb21ldHJ5Py5wYXRoc1xyXG4gICAgICBpZiAoIXBhdGhzPy5sZW5ndGgpIHJldHVyblxyXG5cclxuICAgICAgY29uc3QgW0dyYXBoaWMsIFBvbHlsaW5lLCBTaW1wbGVMaW5lU3ltYm9sXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL0dyYXBoaWMnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvbHlsaW5lJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1NpbXBsZUxpbmVTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgICBdKVxyXG5cclxuICAgICAgY29uc3Qgcm91dGVHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9seWxpbmUoeyBwYXRocywgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkOiB2aWV3V2tpZCB9IH0pLFxyXG4gICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZUxpbmVTeW1ib2woeyBjb2xvcjogWzIyMCwgNjAsIDYwLCAxODBdLCB3aWR0aDogMywgc3R5bGU6ICdkYXNoJyB9KVxyXG4gICAgICB9KVxyXG4gICAgICByb3V0ZVByZXZpZXdHcmFwaGljUmVmLmN1cnJlbnQgPSByb3V0ZUdyYXBoaWNcclxuICAgICAgcHJldmlld0xheWVyLmFkZChyb3V0ZUdyYXBoaWMpXHJcblxyXG4gICAgICAvLyBab29tIHRvIHJvdXRlXHJcbiAgICAgIHRyeSB7IHZpZXcuZ29Ubyhyb3V0ZUdyYXBoaWMuZ2VvbWV0cnkuZXh0ZW50LmV4cGFuZCgxLjMpLCB7IGR1cmF0aW9uOiA4MDAgfSkgfSBjYXRjaCAoXykge31cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ3Nob3dSb3V0ZVByZXZpZXcgZmFpbGVkOicsIGVycilcclxuICAgIH1cclxuICB9LCBbY29uZmlnXSlcclxuICBzaG93Um91dGVQcmV2aWV3UmVmLmN1cnJlbnQgPSBzaG93Um91dGVQcmV2aWV3XHJcblxyXG4gIC8vIFNob3cgYSBtZWFzdXJlIHBvaW50IChncmVlbj1mcm9tLCByZWQ9dG8pIG9uIHRoZSBtYXBcclxuICBjb25zdCBzaG93TWVhc3VyZVBvaW50ID0gdXNlQ2FsbGJhY2soYXN5bmMgKHdoaWNoOiAnZnJvbScgfCAndG8nLCBtZWFzdXJlVmFsOiBzdHJpbmcpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG4gICAgY29uc3QgbSA9IHBhcnNlRmxvYXQobWVhc3VyZVZhbClcclxuICAgIGlmIChpc05hTihtKSkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgcmVmID0gd2hpY2ggPT09ICdmcm9tJyA/IGZyb21NZWFzdXJlR3JhcGhpY1JlZiA6IHRvTWVhc3VyZUdyYXBoaWNSZWZcclxuICAgIGlmIChyZWYuY3VycmVudCkge1xyXG4gICAgICBjb25zdCBsYXllciA9IHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnRcclxuICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVmLmN1cnJlbnQpKSByZWYuY3VycmVudC5mb3JFYWNoKChnOiBhbnkpID0+IGxheWVyLnJlbW92ZShnKSlcclxuICAgICAgICBlbHNlIGxheWVyLnJlbW92ZShyZWYuY3VycmVudClcclxuICAgICAgfVxyXG4gICAgICByZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IHZlcnRpY2VzLCBtSWR4IH0gPSByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50XHJcblxyXG4gICAgLy8gSW50ZXJwb2xhdGUgcG9pbnQgYXQgbWVhc3VyZVxyXG4gICAgbGV0IHB0OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsID0gbnVsbFxyXG4gICAgaWYgKG0gPD0gKHZlcnRpY2VzWzBdW21JZHhdIHx8IDApKSB7XHJcbiAgICAgIHB0ID0geyB4OiB2ZXJ0aWNlc1swXVswXSwgeTogdmVydGljZXNbMF1bMV0gfVxyXG4gICAgfSBlbHNlIGlmIChtID49ICh2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVttSWR4XSB8fCAwKSkge1xyXG4gICAgICBwdCA9IHsgeDogdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bMF0sIHk6IHZlcnRpY2VzW3ZlcnRpY2VzLmxlbmd0aCAtIDFdWzFdIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGlmIChtID49IG0xICYmIG0gPD0gbTIpIHtcclxuICAgICAgICAgIGNvbnN0IGZyYWMgPSBtMiAhPT0gbTEgPyAobSAtIG0xKSAvIChtMiAtIG0xKSA6IDBcclxuICAgICAgICAgIHB0ID0geyB4OiB2ZXJ0aWNlc1tpXVswXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzBdIC0gdmVydGljZXNbaV1bMF0pLCB5OiB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pIH1cclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIXB0KSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBbR3JhcGhpYywgUG9pbnQsIFNpbXBsZU1hcmtlclN5bWJvbCwgVGV4dFN5bWJvbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvaW50JykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1RleHRTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgXSlcclxuXHJcbiAgICBjb25zdCBjb2xvciA9IHdoaWNoID09PSAnZnJvbScgPyBbMzQsIDEzOSwgMzQsIDI1NV0gOiBbMTgwLCAwLCAwLCAyNTVdXHJcbiAgICBjb25zdCBsYWJlbCA9IHdoaWNoID09PSAnZnJvbScgPyBgRnJvbTogJHttLnRvRml4ZWQoMyl9YCA6IGBUbzogJHttLnRvRml4ZWQoMyl9YFxyXG5cclxuICAgIGNvbnN0IHBvaW50R3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHB0LngsIHk6IHB0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3IsIHNpemU6IDEyLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgIH0pXHJcbiAgICBjb25zdCBsYWJlbEdyYXBoaWMgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBwdC54LCB5OiBwdC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgIHN5bWJvbDogbmV3IFRleHRTeW1ib2woeyB0ZXh0OiBsYWJlbCwgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgaGFsb0NvbG9yOiBbMCwgMCwgMF0sIGhhbG9TaXplOiAxLjUsIGZvbnQ6IHsgc2l6ZTogMTEsIHdlaWdodDogJ2JvbGQnIH0sIHlvZmZzZXQ6IDE0IH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHJlZi5jdXJyZW50ID0gW3BvaW50R3JhcGhpYywgbGFiZWxHcmFwaGljXVxyXG4gICAgY29uc3QgbGF5ZXIgPSByb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50XHJcbiAgICBpZiAobGF5ZXIpIHsgbGF5ZXIuYWRkKHBvaW50R3JhcGhpYyk7IGxheWVyLmFkZChsYWJlbEdyYXBoaWMpIH1cclxuICAgIGVsc2UgeyB2aWV3LmdyYXBoaWNzLmFkZChwb2ludEdyYXBoaWMpOyB2aWV3LmdyYXBoaWNzLmFkZChsYWJlbEdyYXBoaWMpIH1cclxuICB9LCBbXSlcclxuICBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQgPSBzaG93TWVhc3VyZVBvaW50XHJcblxyXG4gIC8vIFBpY2sgZnJvbS90byBtZWFzdXJlIG9uIG1hcCAoc25hcCB0byByb3V0ZSBnZW9tZXRyeSlcclxuICBjb25zdCBzdGFydFBpY2tNZWFzdXJlID0gdXNlQ2FsbGJhY2soKHdoaWNoOiAnZnJvbScgfCAndG8nKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBpZiAoIXJvdXRlSWQudHJpbSgpKSB7IHNldEVycm9yKCdTZWxlY3QgYSByb3V0ZSBmaXJzdCcpOyByZXR1cm4gfVxyXG4gICAgaWYgKCFyb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50KSB7IHNldEVycm9yKCdSb3V0ZSBnZW9tZXRyeSBub3QgbG9hZGVkJyk7IHJldHVybiB9XHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG5cclxuICAgIGlmIChtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudCkgeyBtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICBzZXRQaWNraW5nTWVhc3VyZSh3aGljaClcclxuICAgIHZpZXcuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXHJcblxyXG4gICAgY29uc3QgbW9kdWxlc1Byb21pc2UgPSBQcm9taXNlLmFsbChbXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL3N5bWJvbHMvU2ltcGxlTWFya2VyU3ltYm9sJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvZ2VvbWV0cnkvUG9pbnQnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgXSlcclxuXHJcbiAgICBpZiAoIW1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgdGlwLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7cG9pbnRlci1ldmVudHM6bm9uZTtiYWNrZ3JvdW5kOiMzMzM7Y29sb3I6I2ZmZjtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3otaW5kZXg6OTk5OTk7ZGlzcGxheTpub25lO2JveC1zaGFkb3c6MCAycHggNnB4IHJnYmEoMCwwLDAsMC4zKTsnXHJcbiAgICAgIHZpZXcuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpcClcclxuICAgICAgbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCA9IHRpcFxyXG4gICAgfVxyXG4gICAgY29uc3QgdG9vbHRpcCA9IG1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQhXHJcbiAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbiAgICBjb25zdCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9ID0gcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCFcclxuXHJcbiAgICBmdW5jdGlvbiBuZWFyZXN0TU9uUm91dGUgKHB4OiBudW1iZXIsIHB5OiBudW1iZXIpOiB7IG06IG51bWJlcjsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xyXG4gICAgICBsZXQgYmVzdERpc3QgPSBJbmZpbml0eSwgYmVzdFggPSBweCwgYmVzdFkgPSBweSwgYmVzdE0gPSAwXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsVmVydHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgW2F4LCBheV0gPSBhbGxWZXJ0c1tpXVxyXG4gICAgICAgIGNvbnN0IFtieCwgYnldID0gYWxsVmVydHNbaSArIDFdXHJcbiAgICAgICAgY29uc3QgbUEgPSBhbGxWZXJ0c1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbUIgPSBhbGxWZXJ0c1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5XHJcbiAgICAgICAgY29uc3QgbGVuU3EgPSBkeCAqIGR4ICsgZHkgKiBkeVxyXG4gICAgICAgIGlmIChsZW5TcSA9PT0gMCkgY29udGludWVcclxuICAgICAgICBsZXQgdCA9ICgocHggLSBheCkgKiBkeCArIChweSAtIGF5KSAqIGR5KSAvIGxlblNxXHJcbiAgICAgICAgdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHQpKVxyXG4gICAgICAgIGNvbnN0IGN4ID0gYXggKyB0ICogZHgsIGN5ID0gYXkgKyB0ICogZHlcclxuICAgICAgICBjb25zdCBkID0gKHB4IC0gY3gpICogKHB4IC0gY3gpICsgKHB5IC0gY3kpICogKHB5IC0gY3kpXHJcbiAgICAgICAgaWYgKGQgPCBiZXN0RGlzdCkgeyBiZXN0RGlzdCA9IGQ7IGJlc3RYID0gY3g7IGJlc3RZID0gY3k7IGJlc3RNID0gbUEgKyB0ICogKG1CIC0gbUEpIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmVzdERpc3QgPCBJbmZpbml0eSA/IHsgbTogYmVzdE0sIHg6IGJlc3RYLCB5OiBiZXN0WSB9IDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBvaW50ZXItbW92ZTogc25hcCBhbmQgc2hvdyBNIHZhbHVlXHJcbiAgICBtb2R1bGVzUHJvbWlzZS50aGVuKChbR3JhcGhpYywgU2ltcGxlTWFya2VyU3ltYm9sLCBQb2ludF0pID0+IHtcclxuICAgICAgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50ID0gdmlldy5vbigncG9pbnRlci1tb3ZlJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICBjb25zdCBtYXBQb2ludCA9IHZpZXcudG9NYXAoeyB4OiBldmVudC54LCB5OiBldmVudC55IH0pXHJcbiAgICAgICAgaWYgKCFtYXBQb2ludCkgcmV0dXJuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmVhcmVzdE1PblJvdXRlKG1hcFBvaW50LngsIG1hcFBvaW50LnkpXHJcbiAgICAgICAgaWYgKCFyZXN1bHQpIHJldHVyblxyXG5cclxuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHtldmVudC54ICsgMTR9cHhgXHJcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSBgJHtldmVudC55IC0gNDB9cHhgXHJcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGBNOiAke3Jlc3VsdC5tLnRvRml4ZWQoMyl9YFxyXG4gICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgaWYgKG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgICBtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHJlc3VsdC54LCB5OiByZXN1bHQueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGcgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiByZXN1bHQueCwgeTogcmVzdWx0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3I6IFsyNTUsIDg3LCAzNCwgMjU1XSwgc2l6ZTogMTAsIG91dGxpbmU6IHsgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgd2lkdGg6IDIgfSB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gZ1xyXG4gICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoZylcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBDbGljazogc2V0IHRoZSBtZWFzdXJlIHZhbHVlXHJcbiAgICAgIG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gdmlldy5vbignY2xpY2snLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1hcFBvaW50ID0gdmlldy50b01hcCh7IHg6IGV2ZW50LngsIHk6IGV2ZW50LnkgfSlcclxuICAgICAgICBpZiAoIW1hcFBvaW50KSByZXR1cm5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZWFyZXN0TU9uUm91dGUobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICBjb25zdCBtVmFsID0gcmVzdWx0Lm0udG9GaXhlZCgzKVxyXG4gICAgICAgICAgaWYgKHdoaWNoID09PSAnZnJvbScpIHtcclxuICAgICAgICAgICAgc2V0RnJvbU1lYXN1cmUobVZhbClcclxuICAgICAgICAgICAgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCdmcm9tJywgbVZhbClcclxuICAgICAgICAgICAgY2FuY2VsUGlja01lYXN1cmUoKVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHN0YXJ0UGlja01lYXN1cmUoJ3RvJyksIDUwKVxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRvTWVhc3VyZShtVmFsKVxyXG4gICAgICAgICAgICBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgbVZhbClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2FuY2VsUGlja01lYXN1cmUoKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9LCBbY29uZmlnLCByb3V0ZUlkXSlcclxuXHJcbiAgY29uc3QgY2FuY2VsUGlja01lYXN1cmUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAobWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAobWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50KSB7IG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAobWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCkgbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBpZiAobWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQgJiYgamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldykge1xyXG4gICAgICAoamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueSkuZ3JhcGhpY3MucmVtb3ZlKG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50KVxyXG4gICAgICBtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuICAgIGlmIChqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3KSB7XHJcbiAgICAgIChqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55KS5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJydcclxuICAgIH1cclxuICAgIHNldFBpY2tpbmdNZWFzdXJlKG51bGwpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIENsZWFyIGFsbCByb3V0ZSBwcmV2aWV3IGdyYXBoaWNzXHJcbiAgY29uc3QgY2xlYXJSb3V0ZVByZXZpZXcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAocm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudCkgcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG4gICAgcm91dGVQcmV2aWV3R3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyBDbGVhciBldmVyeXRoaW5nIChwcmVkaWN0aW9uIGxheWVyLCBjcmFzaCBldmVudHMsIHJvdXRlIHByZXZpZXcsIHN0YXRlKVxyXG4gIGNvbnN0IGNsZWFyQWxsID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICBpZiAodmlldykge1xyXG4gICAgICAvLyBSZW1vdmUgcHJlZGljdGlvbiBsYXllclxyXG4gICAgICBpZiAocHJlZGljdGlvbkxheWVyUmVmLmN1cnJlbnQpIHsgdmlldy5tYXAucmVtb3ZlKHByZWRpY3Rpb25MYXllclJlZi5jdXJyZW50KTsgcHJlZGljdGlvbkxheWVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgICAgY29uc3QgZXhpc3RpbmdQcmVkID0gdmlldy5tYXAuYWxsTGF5ZXJzLmZpbmQoKGw6IGFueSkgPT4gbC50aXRsZSA9PT0gJ0NyYXNoIFJpc2sgUHJlZGljdGlvbicpXHJcbiAgICAgIGlmIChleGlzdGluZ1ByZWQpIHZpZXcubWFwLnJlbW92ZShleGlzdGluZ1ByZWQpXHJcbiAgICAgIC8vIFJlbW92ZSBjcmFzaCBldmVudHMgbGF5ZXJcclxuICAgICAgaWYgKGNyYXNoRXZlbnRzTGF5ZXJSZWYuY3VycmVudCkgeyB2aWV3Lm1hcC5yZW1vdmUoY3Jhc2hFdmVudHNMYXllclJlZi5jdXJyZW50KTsgY3Jhc2hFdmVudHNMYXllclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICAgIC8vIFJlbW92ZSBkcmF3IGdyYXBoaWNzXHJcbiAgICAgIGlmIChncmFwaGljc0xheWVyUmVmLmN1cnJlbnQpIGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG4gICAgfVxyXG4gICAgY2xlYXJSb3V0ZVByZXZpZXcoKVxyXG4gICAgc2V0Um91dGVJZCgnJyk7IHNldFJvdXRlTmFtZSgnJyk7IHNldEZyb21NZWFzdXJlKCcnKTsgc2V0VG9NZWFzdXJlKCcnKVxyXG4gICAgc2V0Um91dGVNZWFzdXJlUmFuZ2UobnVsbCk7IHNldFJvdXRlU3VnZ2VzdGlvbnMoW10pOyBzZXRTaG93U3VnZ2VzdGlvbnMoZmFsc2UpXHJcbiAgICBzZXRNYXBSb3V0ZXMoW10pOyBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQoKSlcclxuICAgIHNldFJlc3VsdChudWxsKTsgc2V0RmFjdG9ycyhudWxsKTsgc2V0TW9kZWxJbmZvKG51bGwpOyBzZXRDcmFzaFN0YXRzKG51bGwpXHJcbiAgICBzZXRQcm9ncmVzcygnJyk7IHNldEVycm9yKG51bGwpOyBzZXRTaG93RXhwbGFuYXRpb24oZmFsc2UpXHJcbiAgICBzZXRNb2RlKCdjaG9vc2UnKVxyXG4gICAgcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnQuY2xlYXIoKVxyXG4gIH0sIFtjbGVhclJvdXRlUHJldmlld10pXHJcblxyXG4gIC8vIFBpY2sgcm91dGUgZnJvbSBtYXAgKHdpdGggaG92ZXIgdG9vbHRpcCArIHNuYXAgZ3JhcGhpYyBsaWtlIHJvYWQtbG9nKVxyXG4gIGNvbnN0IHN0YXJ0UGlja0Zyb21NYXAgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG5cclxuICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICBzZXRQaWNraW5nRnJvbU1hcCh0cnVlKVxyXG4gICAgdmlldy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJ2Nyb3NzaGFpcidcclxuXHJcbiAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICBjb25zdCBuYW1lRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlTmFtZUZpZWxkIHx8ICdyb3V0ZV9uYW1lJ1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCBxdWVyeVVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuICAgIGNvbnN0IG91dEZpZWxkcyA9IGAke3JvdXRlRmllbGR9LCR7bmFtZUZpZWxkfWBcclxuICAgIGNvbnN0IHZpZXdXa2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG5cclxuICAgIC8vIENyZWF0ZSB0b29sdGlwXHJcbiAgICBpZiAoIXBpY2tUb29sdGlwUmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgdGlwLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7cG9pbnRlci1ldmVudHM6bm9uZTtiYWNrZ3JvdW5kOiMzMzM7Y29sb3I6I2ZmZjtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3otaW5kZXg6OTk5OTk7ZGlzcGxheTpub25lO2JveC1zaGFkb3c6MCAycHggNnB4IHJnYmEoMCwwLDAsMC4zKTsnXHJcbiAgICAgIHZpZXcuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpcClcclxuICAgICAgcGlja1Rvb2x0aXBSZWYuY3VycmVudCA9IHRpcFxyXG4gICAgfVxyXG4gICAgY29uc3QgdG9vbHRpcCA9IHBpY2tUb29sdGlwUmVmLmN1cnJlbnQhXHJcbiAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbiAgICBsZXQgbGFzdFF1ZXJ5SWQgPSAwXHJcbiAgICBsZXQgY2FjaGVkUGF0aHM6IG51bWJlcltdW11bXVtdID0gW11cclxuICAgIGxldCBjYWNoZWRMYWJlbHM6IHN0cmluZ1tdID0gW11cclxuICAgIGxldCBsYXN0UXVlcnlQdDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCA9IG51bGxcclxuICAgIGNvbnN0IFJFUVVFUllfRElTVCA9IDgwXHJcblxyXG4gICAgLy8gTG9hZCBBcmNHSVMgbW9kdWxlcyBmb3Igc25hcCBncmFwaGljXHJcbiAgICBjb25zdCBtb2R1bGVzUHJvbWlzZSA9IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL0dyYXBoaWMnLCAnZXNyaS9zeW1ib2xzL1NpbXBsZU1hcmtlclN5bWJvbCcsICdlc3JpL2dlb21ldHJ5L1BvaW50J10sICguLi5tOiBhbnlbXSkgPT4gcmVzb2x2ZShtKSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gSGVscGVyOiBzbmFwIHRvIG5lYXJlc3QgcG9pbnQgb24gY2FjaGVkIHBhdGhzXHJcbiAgICBmdW5jdGlvbiBzbmFwVG9OZWFyZXN0IChweDogbnVtYmVyLCBweTogbnVtYmVyKTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCB7XHJcbiAgICAgIGxldCBiZXN0RGlzdCA9IEluZmluaXR5LCBiZXN0WCA9IHB4LCBiZXN0WSA9IHB5XHJcbiAgICAgIGZvciAoY29uc3QgcGF0aHMgb2YgY2FjaGVkUGF0aHMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgW2F4LCBheV0gPSBwYXRoW2ldXHJcbiAgICAgICAgICAgIGNvbnN0IFtieCwgYnldID0gcGF0aFtpICsgMV1cclxuICAgICAgICAgICAgY29uc3QgZHggPSBieCAtIGF4LCBkeSA9IGJ5IC0gYXlcclxuICAgICAgICAgICAgY29uc3QgbGVuU3EgPSBkeCAqIGR4ICsgZHkgKiBkeVxyXG4gICAgICAgICAgICBpZiAobGVuU3EgPT09IDApIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGxldCB0ID0gKChweCAtIGF4KSAqIGR4ICsgKHB5IC0gYXkpICogZHkpIC8gbGVuU3FcclxuICAgICAgICAgICAgdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHQpKVxyXG4gICAgICAgICAgICBjb25zdCBjeCA9IGF4ICsgdCAqIGR4LCBjeSA9IGF5ICsgdCAqIGR5XHJcbiAgICAgICAgICAgIGNvbnN0IGQgPSAocHggLSBjeCkgKiAocHggLSBjeCkgKyAocHkgLSBjeSkgKiAocHkgLSBjeSlcclxuICAgICAgICAgICAgaWYgKGQgPCBiZXN0RGlzdCkgeyBiZXN0RGlzdCA9IGQ7IGJlc3RYID0gY3g7IGJlc3RZID0gY3kgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmVzdERpc3QgPCBJbmZpbml0eSA/IHsgeDogYmVzdFgsIHk6IGJlc3RZIH0gOiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSG92ZXI6IHNob3cgcm91dGUgbmFtZSB0b29sdGlwICsgc25hcCBncmFwaGljXHJcbiAgICBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdwb2ludGVyLW1vdmUnLCBhc3luYyAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHtldmVudC54ICsgMTR9cHhgXHJcbiAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0gYCR7ZXZlbnQueSAtIDQwfXB4YFxyXG5cclxuICAgICAgY29uc3QgbWFwUG9pbnQgPSB2aWV3LnRvTWFwKHsgeDogZXZlbnQueCwgeTogZXZlbnQueSB9KVxyXG4gICAgICBpZiAoIW1hcFBvaW50KSByZXR1cm5cclxuXHJcbiAgICAgIC8vIFNuYXAgdXNpbmcgY2FjaGVkIGdlb21ldHJ5XHJcbiAgICAgIGlmIChjYWNoZWRQYXRocy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3Qgc25hcCA9IHNuYXBUb05lYXJlc3QobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICBpZiAoc25hcCkge1xyXG4gICAgICAgICAgY29uc3QgW0dyYXBoaWMsIFNpbXBsZU1hcmtlclN5bWJvbCwgUG9pbnRdID0gYXdhaXQgbW9kdWxlc1Byb21pc2VcclxuICAgICAgICAgIGlmIChwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNuYXBHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBzbmFwLngsIHk6IHNuYXAueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pLFxyXG4gICAgICAgICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yOiBbMCwgMTIyLCAyNTUsIDI1NV0sIHNpemU6IDEwLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBzbmFwR3JhcGhpY1xyXG4gICAgICAgICAgICB2aWV3LmdyYXBoaWNzLmFkZChzbmFwR3JhcGhpYylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGN1cnNvciBtb3ZlZCBmYXIgZW5vdWdoIHRvIHJlLXF1ZXJ5XHJcbiAgICAgIGlmIChsYXN0UXVlcnlQdCkge1xyXG4gICAgICAgIGNvbnN0IGR4ID0gbWFwUG9pbnQueCAtIGxhc3RRdWVyeVB0LnhcclxuICAgICAgICBjb25zdCBkeSA9IG1hcFBvaW50LnkgLSBsYXN0UXVlcnlQdC55XHJcbiAgICAgICAgaWYgKE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSkgPCBSRVFVRVJZX0RJU1QpIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KVxyXG4gICAgICBwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgICAgICBjb25zdCBxdWVyeUlkID0gKytsYXN0UXVlcnlJZFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBKU09OLnN0cmluZ2lmeShtYXBQb2ludC50b0pTT04oKSksXHJcbiAgICAgICAgICAgIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvaW50JyxcclxuICAgICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnNTAnLFxyXG4gICAgICAgICAgICB1bml0czogJ2VzcmlTUlVuaXRfTWV0ZXInLFxyXG4gICAgICAgICAgICBvdXRGaWVsZHMsXHJcbiAgICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzUnLFxyXG4gICAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QocXVlcnlVcmwsIHBhcmFtcylcclxuICAgICAgICAgIGlmIChxdWVyeUlkICE9PSBsYXN0UXVlcnlJZCkgcmV0dXJuXHJcbiAgICAgICAgICBsYXN0UXVlcnlQdCA9IHsgeDogbWFwUG9pbnQueCwgeTogbWFwUG9pbnQueSB9XHJcblxyXG4gICAgICAgICAgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY2FjaGVkUGF0aHMgPSBqc29uLmZlYXR1cmVzLm1hcCgoZjogYW55KSA9PiBmLmdlb21ldHJ5Py5wYXRocyB8fCBbXSlcclxuICAgICAgICAgICAgY2FjaGVkTGFiZWxzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJpZCA9IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJuYW1lID0gZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgJydcclxuICAgICAgICAgICAgICByZXR1cm4gcm5hbWUgPyBgJHtybmFtZX0gKCR7cmlkfSlgIDogcmlkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRvb2x0aXAudGV4dENvbnRlbnQgPSBjYWNoZWRMYWJlbHMuam9pbignXFxuJylcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS53aGl0ZVNwYWNlID0gY2FjaGVkTGFiZWxzLmxlbmd0aCA+IDEgPyAncHJlLWxpbmUnIDogJ25vd3JhcCdcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNuYXAgd2l0aCBmcmVzaCBnZW9tZXRyeVxyXG4gICAgICAgICAgICBjb25zdCBzbmFwID0gc25hcFRvTmVhcmVzdChtYXBQb2ludC54LCBtYXBQb2ludC55KVxyXG4gICAgICAgICAgICBpZiAoc25hcCkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IFtHcmFwaGljLCBTaW1wbGVNYXJrZXJTeW1ib2wsIFBvaW50XSA9IGF3YWl0IG1vZHVsZXNQcm9taXNlXHJcbiAgICAgICAgICAgICAgaWYgKHF1ZXJ5SWQgIT09IGxhc3RRdWVyeUlkKSByZXR1cm5cclxuICAgICAgICAgICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50Lmdlb21ldHJ5ID0gbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3I6IFswLCAxMjIsIDI1NSwgMjU1XSwgc2l6ZTogMTAsIG91dGxpbmU6IHsgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgd2lkdGg6IDIgfSB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gZ1xyXG4gICAgICAgICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoZylcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBjYWNoZWRQYXRocyA9IFtdXHJcbiAgICAgICAgICAgIGNhY2hlZExhYmVscyA9IFtdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDEwMClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQ2xpY2s6IHNlbGVjdCByb3V0ZVxyXG4gICAgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IHZpZXcub24oJ2NsaWNrJywgYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgaWYgKHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgICBpZiAocGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICAgIGlmIChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICB2aWV3LmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJ1xyXG4gICAgICBzZXRQaWNraW5nRnJvbU1hcChmYWxzZSlcclxuICAgICAgLy8gUmVtb3ZlIHNuYXAgZ3JhcGhpY1xyXG4gICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHsgdmlldy5ncmFwaGljcy5yZW1vdmUocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpOyBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICBnZW9tZXRyeTogSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFwUG9pbnQudG9KU09OKCkpLFxyXG4gICAgICAgICAgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5UG9pbnQnLFxyXG4gICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICBkaXN0YW5jZTogJzUwJyxcclxuICAgICAgICAgIHVuaXRzOiAnZXNyaVNSVW5pdF9NZXRlcicsXHJcbiAgICAgICAgICBvdXRGaWVsZHMsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMTAnLFxyXG4gICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QocXVlcnlVcmwsIHBhcmFtcylcclxuXHJcbiAgICAgICAgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBqc29uLmZlYXR1cmVzLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICAgICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF0gfHwgJycsXHJcbiAgICAgICAgICAgIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxyXG4gICAgICAgICAgY29uc3QgdW5pcXVlID0gY2FuZGlkYXRlcy5maWx0ZXIoKGM6IGFueSkgPT4geyBpZiAoc2Vlbi5oYXMoYy5yb3V0ZUlkKSkgcmV0dXJuIGZhbHNlOyBzZWVuLmFkZChjLnJvdXRlSWQpOyByZXR1cm4gdHJ1ZSB9KVxyXG4gICAgICAgICAgaWYgKHVuaXF1ZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHNldFJvdXRlUGlja0NhbmRpZGF0ZXModW5pcXVlKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2V0Um91dGVJZCh1bmlxdWVbMF0ucm91dGVJZClcclxuICAgICAgICAgICAgc2V0Um91dGVOYW1lKHVuaXF1ZVswXS5yb3V0ZU5hbWUpXHJcbiAgICAgICAgICAgIGZldGNoUm91dGVNZWFzdXJlcyh1bmlxdWVbMF0ucm91dGVJZClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgYXR0cnMgPSBqc29uLmZlYXR1cmVzWzBdLmF0dHJpYnV0ZXNcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IGF0dHJzW3JvdXRlRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICBjb25zdCBybmFtZSA9IGF0dHJzW25hbWVGaWVsZF0gfHwgJydcclxuICAgICAgICAgIHNldFJvdXRlSWQocmlkKVxyXG4gICAgICAgICAgc2V0Um91dGVOYW1lKHJuYW1lIHx8IHJpZClcclxuICAgICAgICAgIGZldGNoUm91dGVNZWFzdXJlcyhyaWQpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNldEVycm9yKCdObyByb3V0ZSBmb3VuZCBhdCB0aGF0IGxvY2F0aW9uJylcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBpZGVudGlmeSByb3V0ZTogJyArIChlcnIubWVzc2FnZSB8fCBlcnIpKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0sIFtjb25maWcsIGZldGNoUm91dGVNZWFzdXJlc10pXHJcblxyXG4gIGNvbnN0IGNhbmNlbFBpY2tGcm9tTWFwID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudClcclxuICAgIGlmIChwaWNrVG9vbHRpcFJlZi5jdXJyZW50KSBwaWNrVG9vbHRpcFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIGlmIChqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3KSB7XHJcbiAgICAgIGNvbnN0IHYgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcbiAgICAgIHYuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICcnXHJcbiAgICAgIGlmIChwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCkgeyB2LmdyYXBoaWNzLnJlbW92ZShwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCk7IHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICB9XHJcbiAgICBzZXRQaWNraW5nRnJvbU1hcChmYWxzZSlcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gRHJhdyBwb2x5Z29uIHRvIHNlbGVjdCBtdWx0aXBsZSByb3V0ZXNcclxuICBjb25zdCBzdGFydERyYXdBcmVhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICBzZXREcmF3aW5nKHRydWUpXHJcbiAgICBzZXRNYXBSb3V0ZXMoW10pXHJcbiAgICBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQoKSlcclxuXHJcbiAgICBjb25zdCBbR3JhcGhpY3NMYXllciwgU2tldGNoVmlld01vZGVsXSA9IGF3YWl0IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL2xheWVycy9HcmFwaGljc0xheWVyJywgJ2Vzcmkvd2lkZ2V0cy9Ta2V0Y2gvU2tldGNoVmlld01vZGVsJ10sICguLi5tOiBhbnlbXSkgPT4gcmVzb2x2ZShtKSlcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKCFncmFwaGljc0xheWVyUmVmLmN1cnJlbnQpIHtcclxuICAgICAgZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50ID0gbmV3IEdyYXBoaWNzTGF5ZXIoeyB0aXRsZTogJ0NyYXNoUmlzayBEcmF3JyB9KVxyXG4gICAgICB2aWV3Lm1hcC5hZGQoZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KVxyXG4gICAgfVxyXG4gICAgZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50LnJlbW92ZUFsbCgpXHJcblxyXG4gICAgaWYgKCFza2V0Y2hWTVJlZi5jdXJyZW50KSB7XHJcbiAgICAgIHNrZXRjaFZNUmVmLmN1cnJlbnQgPSBuZXcgU2tldGNoVmlld01vZGVsKHsgdmlldywgbGF5ZXI6IGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCB9KVxyXG4gICAgfVxyXG5cclxuICAgIHNrZXRjaFZNUmVmLmN1cnJlbnQuY3JlYXRlKCdwb2x5Z29uJylcclxuICAgIHNrZXRjaFZNUmVmLmN1cnJlbnQub24oJ2NyZWF0ZScsIGFzeW5jIChldnQ6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoZXZ0LnN0YXRlICE9PSAnY29tcGxldGUnKSByZXR1cm5cclxuICAgICAgc2V0RHJhd2luZyhmYWxzZSlcclxuXHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBldnQuZ3JhcGhpYy5nZW9tZXRyeVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlSWRGaWVsZCB8fCAnY3VzdG9tcm91dGVmaWVsZCdcclxuICAgICAgICBjb25zdCBuYW1lRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlTmFtZUZpZWxkIHx8ICdyb3V0ZV9uYW1lJ1xyXG4gICAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICAgIGNvbnN0IHZpZXdXa2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICAgICAgLy8gVXNlIGVudmVsb3BlIGdlb21ldHJ5IGZvciBKU09OUCAocG9seWdvbiBKU09OIGlzIHRvbyBsYXJnZSBmb3IgR0VUKVxyXG4gICAgICAgIGNvbnN0IGV4dCA9IHBvbHlnb24uZXh0ZW50XHJcbiAgICAgICAgY29uc3QgZW52ZWxvcGVKc29uID0geyB4bWluOiBleHQueG1pbiwgeW1pbjogZXh0LnltaW4sIHhtYXg6IGV4dC54bWF4LCB5bWF4OiBleHQueW1heCwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkOiB2aWV3V2tpZCB9IH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgZ2VvbWV0cnk6IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlSnNvbiksXHJcbiAgICAgICAgICBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlFbnZlbG9wZScsXHJcbiAgICAgICAgICBzcGF0aWFsUmVsOiAnZXNyaVNwYXRpYWxSZWxJbnRlcnNlY3RzJyxcclxuICAgICAgICAgIG91dEZpZWxkczogYCR7cm91dGVGaWVsZH0sJHtuYW1lRmllbGR9YCxcclxuICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgICByZXR1cm5NOiAndHJ1ZScsXHJcbiAgICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMjAwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdCh1cmwsIHBhcmFtcylcclxuICAgICAgICBjb25zdCByb3V0ZXMgPSAoZGF0YS5mZWF0dXJlcyB8fCBbXSkubWFwKChmOiBhbnkpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXVxyXG4gICAgICAgICAgY29uc3QgcGF0aHMgPSBmLmdlb21ldHJ5Py5wYXRocyB8fCBbXVxyXG4gICAgICAgICAgY29uc3QgYWxsVmVydHM6IG51bWJlcltdW10gPSBwYXRocy5mbGF0KClcclxuICAgICAgICAgIGNvbnN0IGhhc1ogPSBmLmdlb21ldHJ5Py5oYXNaXHJcbiAgICAgICAgICBjb25zdCBtSWR4ID0gaGFzWiA/IDMgOiAyXHJcbiAgICAgICAgICBsZXQgbWluTSA9IDAsIG1heE0gPSAwXHJcbiAgICAgICAgICBpZiAoYWxsVmVydHMubGVuZ3RoID4gMCAmJiBtSWR4IDwgYWxsVmVydHNbMF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lYXN1cmVzID0gYWxsVmVydHMubWFwKHYgPT4gdlttSWR4XSkuZmlsdGVyKG0gPT4gbSAhPSBudWxsICYmICFpc05hTihtKSlcclxuICAgICAgICAgICAgaWYgKG1lYXN1cmVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICBtaW5NID0gTWF0aC5taW4oLi4ubWVhc3VyZXMpXHJcbiAgICAgICAgICAgICAgbWF4TSA9IE1hdGgubWF4KC4uLm1lYXN1cmVzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LnNldChyaWQsIHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4geyByb3V0ZUlkOiByaWQsIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgbnVsbCwgZnJvbU1lYXN1cmU6IG1pbk0sIHRvTWVhc3VyZTogbWF4TSB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBzZXRNYXBSb3V0ZXMocm91dGVzKVxyXG4gICAgICAgIHNldFNlbGVjdGVkTWFwUm91dGVJZHMobmV3IFNldChyb3V0ZXMubWFwKChyOiBhbnkpID0+IHIucm91dGVJZCkpKVxyXG4gICAgICAgIHNldFNlYXJjaE1vZGUoJ21hcCcpXHJcbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgIHNldEVycm9yKCdBcmVhIHF1ZXJ5IGZhaWxlZDogJyArIChlLm1lc3NhZ2UgfHwgZSkpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSwgW2NvbmZpZ10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFFVRVJZIEVWRU5UIERBVEEgKGludGVybmFsLCB0cmlnZ2VyZWQgYnkgUnVuKSA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBxdWVyeUV2ZW50RGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpOiBQcm9taXNlPGFueVtdPiA9PiB7XHJcbiAgICBpZiAoIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgdGhyb3cgbmV3IEVycm9yKCdObyBMUlMgc2VydmljZSBjb25maWd1cmVkJylcclxuXHJcbiAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuXHJcbiAgICBsZXQgcm91dGVJZHM6IHN0cmluZ1tdID0gW11cclxuICAgIGlmIChzZWFyY2hNb2RlID09PSAnbWFwJykge1xyXG4gICAgICByb3V0ZUlkcyA9IEFycmF5LmZyb20oc2VsZWN0ZWRNYXBSb3V0ZUlkcylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICghcm91dGVJZC50cmltKCkpIHRocm93IG5ldyBFcnJvcignRW50ZXIgYSBSb3V0ZSBJRCBvciBzZWxlY3QgZnJvbSBtYXAuJylcclxuICAgICAgcm91dGVJZHMgPSBbcm91dGVJZC50cmltKCldXHJcbiAgICB9XHJcbiAgICBpZiAocm91dGVJZHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHJvdXRlcyBzZWxlY3RlZC4nKVxyXG5cclxuICAgIGNvbnN0IGFsbEVudHJpZXM6IGFueVtdID0gW11cclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgZm9yIChjb25zdCBjZmcgb2YgZXZlbnRDb25maWdzKSB7XHJcbiAgICAgIGNvbnN0IGxheWVyVXJsID0gYCR7YmFzZU1hcFVybH0vJHtjZmcubGF5ZXJJZH0vcXVlcnlgXHJcbiAgICAgIC8vIFVzZSBkaXNjb3ZlcmVkIGZpZWxkIG5hbWVzIGZyb20gTFJTIG1ldGFkYXRhIChmYWxsIGJhY2sgdG8gY29uZmlnLCB0aGVuIGRlZmF1bHRzKVxyXG4gICAgICBjb25zdCBkaXNjb3ZlcmVkID0gZXZlbnRGaWVsZE5hbWVzUmVmLmN1cnJlbnQuZ2V0KGNmZy5sYXllcklkKVxyXG4gICAgICBjb25zdCByb3V0ZUlkRmllbGQgPSBkaXNjb3ZlcmVkPy5yb3V0ZUlkRmllbGQgfHwgY2ZnLnJvdXRlSWRGaWVsZCB8fCAncm91dGVpZCdcclxuICAgICAgY29uc3QgbWVhc3VyZUZpZWxkID0gZGlzY292ZXJlZD8ubWVhc3VyZUZpZWxkIHx8IGNmZy5tZWFzdXJlRmllbGQgfHwgY2ZnLmZyb21NZWFzdXJlRmllbGQgfHwgJ21lYXN1cmUnXHJcbiAgICAgIGNvbnN0IGZyb21NZWFzdXJlRmllbGQgPSBkaXNjb3ZlcmVkPy5mcm9tTWVhc3VyZUZpZWxkIHx8IGNmZy5mcm9tTWVhc3VyZUZpZWxkIHx8ICdmcm9tX21lYXN1cmUnXHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHJpZCBvZiByb3V0ZUlkcykge1xyXG4gICAgICAgIGNvbnN0IHdoZXJlID0gYCR7cm91dGVJZEZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2BcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICB3aGVyZSxcclxuICAgICAgICAgIG91dEZpZWxkczogJyonLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdChsYXllclVybCwgcGFyYW1zKVxyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiAoZGF0YS5mZWF0dXJlcyB8fCBbXSkpIHtcclxuICAgICAgICAgIGFsbEVudHJpZXMucHVzaCh7XHJcbiAgICAgICAgICAgIEZlYXR1cmU6IGNmZy5uYW1lLFxyXG4gICAgICAgICAgICBSb3V0ZUlEOiBmLmF0dHJpYnV0ZXNbcm91dGVJZEZpZWxkXSB8fCBmLmF0dHJpYnV0ZXNbJ3JvdXRlaWQnXSxcclxuICAgICAgICAgICAgTWVhc3VyZTogZi5hdHRyaWJ1dGVzW21lYXN1cmVGaWVsZF0gPz8gZi5hdHRyaWJ1dGVzW2Zyb21NZWFzdXJlRmllbGRdLFxyXG4gICAgICAgICAgICAuLi5PYmplY3QuZnJvbUVudHJpZXMoKGNmZy5hdHRyaWJ1dGVzIHx8IFtdKS5tYXAoYSA9PiBbYSwgZi5hdHRyaWJ1dGVzW2FdXSkpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEVuc3VyZSByb3V0ZSBnZW9tZXRyaWVzIGFyZSBjYWNoZWRcclxuICAgIGZvciAoY29uc3QgcmlkIG9mIHJvdXRlSWRzKSB7XHJcbiAgICAgIGlmICghcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnQuaGFzKHJpZCkpIHtcclxuICAgICAgICBhd2FpdCBmZXRjaFJvdXRlTWVhc3VyZXMocmlkKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsbEVudHJpZXNcclxuICB9LCBbY29uZmlnLCByb3V0ZUlkLCBzZWFyY2hNb2RlLCBzZWxlY3RlZE1hcFJvdXRlSWRzLCBmZXRjaFJvdXRlTWVhc3VyZXNdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBESVNQTEFZIE9OIE1BUCA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwID0gdXNlQ2FsbGJhY2soYXN5bmMgKGxheWVyVXJsOiBzdHJpbmcsIHRva2VuOiBzdHJpbmcsIHdraWQ6IG51bWJlcikgPT4ge1xyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICBpZiAoIXZpZXcpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IFtGZWF0dXJlTGF5ZXJdID0gYXdhaXQgbmV3IFByb21pc2U8YW55W10+KHJlc29sdmUgPT4ge1xyXG4gICAgICAod2luZG93IGFzIGFueSkucmVxdWlyZShbJ2VzcmkvbGF5ZXJzL0ZlYXR1cmVMYXllciddLCAoLi4ubW9kczogYW55W10pID0+IHJlc29sdmUobW9kcykpXHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IGV4aXN0aW5nTGF5ZXIgPSB2aWV3Lm1hcC5hbGxMYXllcnMuZmluZCgobDogYW55KSA9PiBsLnRpdGxlID09PSAnQ3Jhc2ggUmlzayBQcmVkaWN0aW9uJylcclxuICAgIGlmIChleGlzdGluZ0xheWVyKSB2aWV3Lm1hcC5yZW1vdmUoZXhpc3RpbmdMYXllcilcclxuXHJcbiAgICBjb25zdCBwcmVkaWN0aW9uTGF5ZXIgPSBuZXcgRmVhdHVyZUxheWVyKHtcclxuICAgICAgdXJsOiBsYXllclVybCxcclxuICAgICAgdGl0bGU6ICdDcmFzaCBSaXNrIFByZWRpY3Rpb24nLFxyXG4gICAgICBjdXN0b21QYXJhbWV0ZXJzOiB7IHRva2VuIH0sXHJcbiAgICAgIGRlZmluaXRpb25FeHByZXNzaW9uOiAncmlza19zY29yZSA+IDAnLFxyXG4gICAgICByZW5kZXJlcjoge1xyXG4gICAgICAgIHR5cGU6ICdjbGFzcy1icmVha3MnLFxyXG4gICAgICAgIGZpZWxkOiAncmlza19zY29yZScsXHJcbiAgICAgICAgY2xhc3NCcmVha0luZm9zOiBbXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiAxLCBtYXhWYWx1ZTogMjUsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzU2LCAxNjgsIDAsIDIwMF0sIHdpZHRoOiAzIH0sIGxhYmVsOiAnTG93IFJpc2sgKDEtMjUpJyB9LFxyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogMjYsIG1heFZhbHVlOiA1MCwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbMjU1LCAyNTUsIDAsIDIyMF0sIHdpZHRoOiA0IH0sIGxhYmVsOiAnTWVkaXVtIFJpc2sgKDI2LTUwKScgfSxcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDUxLCBtYXhWYWx1ZTogNzUsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzI1NSwgMTI4LCAwLCAyMzBdLCB3aWR0aDogNSB9LCBsYWJlbDogJ01lZGl1bS1IaWdoIFJpc2sgKDUxLTc1KScgfSxcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDc2LCBtYXhWYWx1ZTogMTAwLCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFsyNTUsIDAsIDAsIDI1NV0sIHdpZHRoOiA2IH0sIGxhYmVsOiAnSGlnaCBSaXNrICg3Ni0xMDApJyB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICBwb3B1cFRlbXBsYXRlOiB7XHJcbiAgICAgICAgdGl0bGU6ICdDcmFzaCBSaXNrOiB7cmlza19sZXZlbH0nLFxyXG4gICAgICAgIGNvbnRlbnQ6IGA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjEzcHhcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOjhweDtwYWRkaW5nLWJvdHRvbTo4cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2UwZTBlMFwiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToyNHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjp7ZXhwcmVzc2lvbi9yaXNrQ29sb3J9XCI+e3Jpc2tfc2NvcmV9PC9zcGFuPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOiM2NjY7Zm9udC1zaXplOjEycHhcIj4vMTAwIHJpc2sgc2NvcmU8L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDx0YWJsZSBzdHlsZT1cImJvcmRlci1jb2xsYXBzZTpjb2xsYXBzZTt3aWR0aDoxMDAlXCI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5Sb3V0ZTwvdGQ+PHRkPntyb3V0ZWlkfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPlNlZ21lbnQ8L3RkPjx0ZD5NIHtmcm9tX219IFxcdTIwMTMge3RvX219PC90ZD48L3RyPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+UmlzayBMZXZlbDwvdGQ+PHRkIHN0eWxlPVwiZm9udC13ZWlnaHQ6NzAwXCI+e3Jpc2tfbGV2ZWx9PC90ZD48L3RyPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+Q29udHJpYnV0aW5nIEZhY3RvcnM8L3RkPjx0ZD57Y29udHJpYnV0aW5nX2ZhY3RvcnN9PC90ZD48L3RyPlxyXG4gICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICA8L2Rpdj5gLFxyXG4gICAgICAgIGV4cHJlc3Npb25JbmZvczogW3tcclxuICAgICAgICAgIG5hbWU6ICdyaXNrQ29sb3InLFxyXG4gICAgICAgICAgZXhwcmVzc2lvbjogYHZhciBzID0gJGZlYXR1cmUucmlza19zY29yZTsgV2hlbihzID4gNzUsICcjZDMyZjJmJywgcyA+IDUwLCAnI2Y1N2MwMCcsIHMgPiAyNSwgJyNmYmMwMmQnLCBzID4gMCwgJyMzODhlM2MnLCAnIzk5OScpYFxyXG4gICAgICAgIH1dXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICB2aWV3Lm1hcC5hZGQocHJlZGljdGlvbkxheWVyKVxyXG4gICAgcHJlZGljdGlvbkxheWVyUmVmLmN1cnJlbnQgPSBwcmVkaWN0aW9uTGF5ZXJcclxuICAgIHByZWRpY3Rpb25MYXllci53aGVuKCgpID0+IHtcclxuICAgICAgcHJlZGljdGlvbkxheWVyLnF1ZXJ5RXh0ZW50KCkudGhlbigocjogYW55KSA9PiB7XHJcbiAgICAgICAgaWYgKHIuZXh0ZW50KSB2aWV3LmdvVG8oci5leHRlbnQuZXhwYW5kKDEuMikpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyBEaXNwbGF5IGNyYXNoIGV2ZW50IHBvaW50cyBvbiBtYXBcclxuICBjb25zdCBkaXNwbGF5Q3Jhc2hFdmVudHNPbk1hcCA9IHVzZUNhbGxiYWNrKGFzeW5jIChjcmFzaEVudHJpZXM6IGFueVtdLCByb3V0ZUdlb21ldHJpZXM6IE1hcDxzdHJpbmcsIHsgdmVydGljZXM6IG51bWJlcltdW107IG1JZHg6IG51bWJlciB9PikgPT4ge1xyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICBpZiAoIXZpZXcgfHwgY3Jhc2hFbnRyaWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgW0dyYXBoaWNzTGF5ZXIsIEdyYXBoaWMsIFBvaW50LCBTaW1wbGVNYXJrZXJTeW1ib2xdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2xheWVycy9HcmFwaGljc0xheWVyJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvaW50JykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgXSlcclxuXHJcbiAgICBpZiAoY3Jhc2hFdmVudHNMYXllclJlZi5jdXJyZW50KSB7IHZpZXcubWFwLnJlbW92ZShjcmFzaEV2ZW50c0xheWVyUmVmLmN1cnJlbnQpOyBjcmFzaEV2ZW50c0xheWVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICBjb25zdCBnbCA9IG5ldyBHcmFwaGljc0xheWVyKHsgaWQ6ICdfX2NyYXNocmlza19ldmVudHNfXycsIHRpdGxlOiAnQ3Jhc2ggRXZlbnRzIChBSSBJbnB1dCknIH0pXHJcblxyXG4gICAgZm9yIChjb25zdCBlbnRyeSBvZiBjcmFzaEVudHJpZXMpIHtcclxuICAgICAgaWYgKGVudHJ5Lk1lYXN1cmUgPT0gbnVsbCB8fCBlbnRyeS5Sb3V0ZUlEID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgIGNvbnN0IHJkID0gcm91dGVHZW9tZXRyaWVzLmdldChlbnRyeS5Sb3V0ZUlEKVxyXG4gICAgICBpZiAoIXJkKSBjb250aW51ZVxyXG4gICAgICBjb25zdCB7IHZlcnRpY2VzLCBtSWR4IH0gPSByZFxyXG4gICAgICBjb25zdCBtID0gcGFyc2VGbG9hdChlbnRyeS5NZWFzdXJlKVxyXG4gICAgICBpZiAoaXNOYU4obSkpIGNvbnRpbnVlXHJcblxyXG4gICAgICAvLyBJbnRlcnBvbGF0ZSBwb2ludFxyXG4gICAgICBsZXQgcHggPSAwLCBweSA9IDAsIGZvdW5kID0gZmFsc2VcclxuICAgICAgaWYgKG0gPD0gKHZlcnRpY2VzWzBdW21JZHhdIHx8IDApKSB7IHB4ID0gdmVydGljZXNbMF1bMF07IHB5ID0gdmVydGljZXNbMF1bMV07IGZvdW5kID0gdHJ1ZSB9XHJcbiAgICAgIGVsc2UgaWYgKG0gPj0gKHZlcnRpY2VzW3ZlcnRpY2VzLmxlbmd0aCAtIDFdW21JZHhdIHx8IDApKSB7IHB4ID0gdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bMF07IHB5ID0gdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bMV07IGZvdW5kID0gdHJ1ZSB9XHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICBjb25zdCBtMSA9IHZlcnRpY2VzW2ldW21JZHhdIHx8IDAsIG0yID0gdmVydGljZXNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICAgIGlmIChtID49IG0xICYmIG0gPD0gbTIpIHtcclxuICAgICAgICAgICAgY29uc3QgZnJhYyA9IG0yICE9PSBtMSA/IChtIC0gbTEpIC8gKG0yIC0gbTEpIDogMFxyXG4gICAgICAgICAgICBweCA9IHZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSlcclxuICAgICAgICAgICAgcHkgPSB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pXHJcbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZVxyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoIWZvdW5kKSBjb250aW51ZVxyXG5cclxuICAgICAgZ2wuYWRkKG5ldyBHcmFwaGljKHtcclxuICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogcHgsIHk6IHB5LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3I6IFsyMDAsIDMwLCAzMCwgMTgwXSwgc2l6ZTogNywgb3V0bGluZTogeyBjb2xvcjogWzI1NSwgMjU1LCAyNTUsIDIwMF0sIHdpZHRoOiAxIH0gfSksXHJcbiAgICAgICAgYXR0cmlidXRlczogZW50cnksXHJcbiAgICAgICAgcG9wdXBUZW1wbGF0ZTogeyB0aXRsZTogJ0NyYXNoIEV2ZW50JywgY29udGVudDogYFJvdXRlOiAke2VudHJ5LlJvdXRlSUR9LCBNOiAke20udG9GaXhlZCgzKX1gIH1cclxuICAgICAgfSkpXHJcbiAgICB9XHJcblxyXG4gICAgdmlldy5tYXAuYWRkKGdsLCAwKVxyXG4gICAgY3Jhc2hFdmVudHNMYXllclJlZi5jdXJyZW50ID0gZ2xcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gTlkgU1RBVEUgQ1JBU0ggTU9ERUwgPT09PT09PT09PT09PT09PT09PT1cclxuICBjb25zdCBOWV9TVEFURV9DUkFTSF9NT0RFTCA9IHtcclxuICAgIHRvdGFsQ3Jhc2hlczogMTUyNTEyMyxcclxuICAgIHRvdGFsRmF0YWw6IDQyMDgsXHJcbiAgICB5ZWFyczogJzIwMjEtMjAyNCcsXHJcbiAgICBzb3VyY2U6ICdOWSBTdGF0ZSBETVYgdmlhIGRhdGEubnkuZ292JyxcclxuICAgIHJvYWRHZW9tZXRyeToge1xyXG4gICAgICAnU3RyYWlnaHQgYW5kIExldmVsJzogeyBjcmFzaGVzOiAxMTc4MjI4LCBmYXRhbDogMjgzNCwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ1N0cmFpZ2h0IGFuZCBHcmFkZSc6IHsgY3Jhc2hlczogMTI2NDY0LCBmYXRhbDogNDI5LCB3ZWlnaHQ6IDEuNDEgfSxcclxuICAgICAgJ0N1cnZlIGFuZCBMZXZlbCc6IHsgY3Jhc2hlczogNzIzNDksIGZhdGFsOiA0OTcsIHdlaWdodDogMi44NiB9LFxyXG4gICAgICAnQ3VydmUgYW5kIEdyYWRlJzogeyBjcmFzaGVzOiA0NzQ5NywgZmF0YWw6IDMxNiwgd2VpZ2h0OiAyLjc3IH0sXHJcbiAgICAgICdDdXJ2ZSBhdCBIaWxsIENyZXN0JzogeyBjcmFzaGVzOiA2ODYwLCBmYXRhbDogNTQsIHdlaWdodDogMy4yOCB9LFxyXG4gICAgICAnU3RyYWlnaHQgYXQgSGlsbCBDcmVzdCc6IHsgY3Jhc2hlczogMjE1OTcsIGZhdGFsOiA3NSwgd2VpZ2h0OiAxLjQ1IH1cclxuICAgIH0sXHJcbiAgICB0cmFmZmljQ29udHJvbDoge1xyXG4gICAgICAnTm9uZSc6IHsgY3Jhc2hlczogODcyMDU2LCBmYXRhbDogMjQ1Nywgd2VpZ2h0OiAxLjE3IH0sXHJcbiAgICAgICdUcmFmZmljIFNpZ25hbCc6IHsgY3Jhc2hlczogMzE4MDY1LCBmYXRhbDogODI2LCB3ZWlnaHQ6IDEuMDggfSxcclxuICAgICAgJ1N0b3AgU2lnbic6IHsgY3Jhc2hlczogMTMxNjY0LCBmYXRhbDogMjY2LCB3ZWlnaHQ6IDAuODQgfSxcclxuICAgICAgJ05vIFBhc3NpbmcgWm9uZSc6IHsgY3Jhc2hlczogODUzOTYsIGZhdGFsOiA1NTcsIHdlaWdodDogMi43MiB9LFxyXG4gICAgICAnWWllbGQgU2lnbic6IHsgY3Jhc2hlczogMTI4ODAsIGZhdGFsOiA4LCB3ZWlnaHQ6IDAuMjYgfSxcclxuICAgICAgJ0NvbnN0cnVjdGlvbiBXb3JrIEFyZWEnOiB7IGNyYXNoZXM6IDQ0MjksIGZhdGFsOiA5LCB3ZWlnaHQ6IDAuODUgfSxcclxuICAgICAgJ0ZsYXNoaW5nIExpZ2h0JzogeyBjcmFzaGVzOiAzMDYzLCBmYXRhbDogMTAsIHdlaWdodDogMS4zNiB9LFxyXG4gICAgICAnUlIgQ3Jvc3NpbmcgR2F0ZXMnOiB7IGNyYXNoZXM6IDg3OCwgZmF0YWw6IDcsIHdlaWdodDogMy4zMiB9LFxyXG4gICAgICAnU2Nob29sIFpvbmUnOiB7IGNyYXNoZXM6IDYzNywgZmF0YWw6IDEsIHdlaWdodDogMC42NSB9XHJcbiAgICB9LFxyXG4gICAgcm9hZFN1cmZhY2U6IHtcclxuICAgICAgJ0RyeSc6IHsgY3Jhc2hlczogMTEzMDIxMSwgZmF0YWw6IDMxMDIsIHdlaWdodDogMS4wIH0sXHJcbiAgICAgICdXZXQnOiB7IGNyYXNoZXM6IDIzNDYwMywgZmF0YWw6IDY1MSwgd2VpZ2h0OiAxLjAxIH0sXHJcbiAgICAgICdTbm93L0ljZSc6IHsgY3Jhc2hlczogNzI2NzYsIGZhdGFsOiAyMjIsIHdlaWdodDogMS4xMSB9LFxyXG4gICAgICAnU2x1c2gnOiB7IGNyYXNoZXM6IDU3NTcsIGZhdGFsOiAxNCwgd2VpZ2h0OiAwLjg5IH0sXHJcbiAgICAgICdGbG9vZGVkIFdhdGVyJzogeyBjcmFzaGVzOiA1MDgsIGZhdGFsOiAzLCB3ZWlnaHQ6IDIuMTUgfSxcclxuICAgICAgJ011ZGR5JzogeyBjcmFzaGVzOiA2NDgsIGZhdGFsOiAzLCB3ZWlnaHQ6IDEuNjkgfVxyXG4gICAgfSxcclxuICAgIGxpZ2h0aW5nOiB7XHJcbiAgICAgICdEYXlsaWdodCc6IHsgY3Jhc2hlczogOTMzMjEwLCBmYXRhbDogMTg2Nywgd2VpZ2h0OiAwLjgzIH0sXHJcbiAgICAgICdEYXJrLVJvYWQgTGlnaHRlZCc6IHsgY3Jhc2hlczogMjc4OTgyLCBmYXRhbDogODc2LCB3ZWlnaHQ6IDEuMzEgfSxcclxuICAgICAgJ0RhcmstUm9hZCBVbmxpZ2h0ZWQnOiB7IGNyYXNoZXM6IDE0ODYzNSwgZmF0YWw6IDEwMDUsIHdlaWdodDogMi44MiB9LFxyXG4gICAgICAnRHVzayc6IHsgY3Jhc2hlczogNDg3NDAsIGZhdGFsOiAyMjEsIHdlaWdodDogMS44OSB9LFxyXG4gICAgICAnRGF3bic6IHsgY3Jhc2hlczogMzc4NDgsIGZhdGFsOiAyMzksIHdlaWdodDogMi42MyB9XHJcbiAgICB9LFxyXG4gICAgd2VhdGhlcjoge1xyXG4gICAgICAnQ2xlYXInOiB7IGNyYXNoZXM6IDkzNTg5NywgZmF0YWw6IDI2NzksIHdlaWdodDogMS4wIH0sXHJcbiAgICAgICdDbG91ZHknOiB7IGNyYXNoZXM6IDI5NTczMiwgZmF0YWw6IDcwMCwgd2VpZ2h0OiAwLjgzIH0sXHJcbiAgICAgICdSYWluJzogeyBjcmFzaGVzOiAxMzk1NTksIGZhdGFsOiA0MTksIHdlaWdodDogMS4wNSB9LFxyXG4gICAgICAnU25vdyc6IHsgY3Jhc2hlczogNTg3NjMsIGZhdGFsOiAxODMsIHdlaWdodDogMS4wOSB9LFxyXG4gICAgICAnU2xlZXQvSGFpbC9GcmVlemluZyBSYWluJzogeyBjcmFzaGVzOiA5NDgzLCBmYXRhbDogMjgsIHdlaWdodDogMS4wMyB9LFxyXG4gICAgICAnRm9nL1Ntb2cvU21va2UnOiB7IGNyYXNoZXM6IDQ3OTIsIGZhdGFsOiA0NSwgd2VpZ2h0OiAzLjkxIH1cclxuICAgIH0sXHJcbiAgICBscnNNYXBwaW5nOiB7XHJcbiAgICAgICdDdXJ2ZSc6IHsgc3RhdGVGaWVsZDogJ3JvYWRHZW9tZXRyeScsIHZhbHVlTWFwOiB7ICdMZWZ0JzogJ0N1cnZlIGFuZCBMZXZlbCcsICdSaWdodCc6ICdDdXJ2ZSBhbmQgTGV2ZWwnLCAnQ29tcG91bmQnOiAnQ3VydmUgYW5kIEdyYWRlJywgJ1JldmVyc2UnOiAnQ3VydmUgYW5kIEdyYWRlJywgJ1NpbXBsZSc6ICdDdXJ2ZSBhbmQgTGV2ZWwnIH0gfSxcclxuICAgICAgJ0dyYWRlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xldmVsJzogJ1N0cmFpZ2h0IGFuZCBMZXZlbCcsICdGbGF0JzogJ1N0cmFpZ2h0IGFuZCBMZXZlbCcsICdSb2xsaW5nJzogJ1N0cmFpZ2h0IGFuZCBHcmFkZScsICdNb3VudGFpbm91cyc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnU3RlZXAnOiAnU3RyYWlnaHQgYW5kIEdyYWRlJyB9IH0sXHJcbiAgICAgICdTcGVlZCBMaW1pdCc6IHsgc3RhdGVGaWVsZDogJ3NwZWVkJywgY3VzdG9tV2VpZ2h0czogeyAnMjUnOiAwLjcsICczMCc6IDAuOCwgJzM1JzogMC45LCAnNDAnOiAxLjEsICc0NSc6IDEuMywgJzUwJzogMS42LCAnNTUnOiAyLjAsICc2MCc6IDIuMywgJzY1JzogMi42IH0gfSxcclxuICAgICAgJ0Z1bmN0aW9uYWwgQ2xhc3MnOiB7IHN0YXRlRmllbGQ6ICdmdW5jQ2xhc3MnLCBjdXN0b21XZWlnaHRzOiB7ICdJbnRlcnN0YXRlJzogMS4zLCAnUHJpbmNpcGFsIEFydGVyaWFsJzogMS41LCAnTWlub3IgQXJ0ZXJpYWwnOiAxLjIsICdNYWpvciBDb2xsZWN0b3InOiAxLjAsICdNaW5vciBDb2xsZWN0b3InOiAwLjgsICdMb2NhbCc6IDAuNiB9IH0sXHJcbiAgICAgICdNZWRpYW4gVHlwZSc6IHsgc3RhdGVGaWVsZDogJ21lZGlhbicsIGN1c3RvbVdlaWdodHM6IHsgJ05vbmUnOiAxLjgsICdQYWludGVkJzogMS4zLCAnQ3VyYmVkJzogMS4wLCAnUG9zaXRpdmUgQmFycmllcic6IDAuNiwgJ0RlcHJlc3NlZCc6IDAuNywgJ0dyYXNzJzogMC45IH0gfSxcclxuICAgICAgJ1Rocm91Z2ggTGFuZSc6IHsgc3RhdGVGaWVsZDogJ2xhbmVzJywgY3VzdG9tV2VpZ2h0czogeyAnMSc6IDAuOCwgJzInOiAxLjAsICczJzogMS4zLCAnNCc6IDEuMSwgJzUnOiAxLjQsICc2JzogMS4yIH0gfSxcclxuICAgICAgJ1Nob3VsZGVyIFR5cGUnOiB7IHN0YXRlRmllbGQ6ICdzaG91bGRlcicsIGN1c3RvbVdlaWdodHM6IHsgJ05vbmUnOiAxLjYsICdHcmF2ZWwnOiAxLjEsICdQYXZlZCc6IDAuOCwgJ0dyYXNzJzogMS4yLCAnQ3VyYic6IDEuMCB9IH0sXHJcbiAgICAgICdQYXZlbWVudCBUeXBlJzogeyBzdGF0ZUZpZWxkOiAncGF2ZW1lbnQnLCBjdXN0b21XZWlnaHRzOiB7ICdBc3BoYWx0JzogMC45LCAnQ29uY3JldGUnOiAxLjAsICdHcmF2ZWwnOiAxLjUsICdCcmljayc6IDEuMiwgJ0RpcnQnOiAxLjgsICdDb21wb3NpdGUnOiAwLjk1IH0gfSxcclxuICAgICAgJ1RlcnJhaW4gVHlwZSc6IHsgc3RhdGVGaWVsZDogJ3JvYWRHZW9tZXRyeScsIHZhbHVlTWFwOiB7ICdMZXZlbCc6ICdTdHJhaWdodCBhbmQgTGV2ZWwnLCAnUm9sbGluZyc6ICdTdHJhaWdodCBhbmQgR3JhZGUnLCAnTW91bnRhaW5vdXMnOiAnQ3VydmUgYW5kIEdyYWRlJyB9IH0sXHJcbiAgICAgICdQZXJjZW50IFBhc3NpbmcgU2lnaHQnOiB7IHN0YXRlRmllbGQ6ICdwYXNzU2lnaHQnLCBjdXN0b21XZWlnaHRzOiB7ICcwJzogMi41LCAnMTAnOiAyLjIsICcyMCc6IDEuOSwgJzMwJzogMS42LCAnNDAnOiAxLjMsICc1MCc6IDEuMSwgJzYwJzogMS4wLCAnNzAnOiAwLjksICc4MCc6IDAuODUsICc5MCc6IDAuOCwgJzEwMCc6IDAuNzUgfSB9LFxyXG4gICAgICAnQWNjZXNzIENvbnRyb2wnOiB7IHN0YXRlRmllbGQ6ICdhY2Nlc3MnLCBjdXN0b21XZWlnaHRzOiB7ICdGdWxsJzogMC42LCAnUGFydGlhbCc6IDEuMCwgJ05vbmUnOiAxLjUgfSB9LFxyXG4gICAgICAnT3duZXJzaGlwJzogeyBzdGF0ZUZpZWxkOiAnb3duZXJzaGlwJywgY3VzdG9tV2VpZ2h0czogeyAnU3RhdGUnOiAxLjAsICdDb3VudHknOiAxLjEsICdDaXR5JzogMS4yLCAnRmVkZXJhbCc6IDAuOSwgJ1ByaXZhdGUnOiAxLjQgfSB9XHJcbiAgICB9IGFzIFJlY29yZDxzdHJpbmcsIGFueT5cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IEFJIFBSRURJQ1RJT04gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgcnVuQUlQcmVkaWN0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0UnVubmluZyh0cnVlKVxyXG4gICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICBzZXRSZXN1bHQobnVsbClcclxuICAgIHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSlcclxuICAgIHNldEZhY3RvcnMobnVsbClcclxuICAgIHNldEVycm9yKG51bGwpXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc2Vzc2lvbiA9IFNlc3Npb25NYW5hZ2VyLmdldEluc3RhbmNlKCkuZ2V0TWFpblNlc3Npb24oKSBhcyBhbnlcclxuICAgICAgaWYgKCFzZXNzaW9uKSB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzaWduZWQgaW4uJylcclxuICAgICAgY29uc3QgdG9rZW4gPSBzZXNzaW9uLnRva2VuXHJcbiAgICAgIGNvbnN0IHBvcnRhbFVybCA9IChzZXNzaW9uLnBvcnRhbCB8fCAnJykucmVwbGFjZSgvXFwvc2hhcmluZ1xcL3Jlc3RcXC8/JC8sICcnKVxyXG4gICAgICBjb25zdCB1c2VybmFtZSA9IHNlc3Npb24udXNlcm5hbWVcclxuICAgICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICAgIGNvbnN0IHdraWQgPSB2aWV3Py5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG5cclxuICAgICAgLy8gU3RlcCAxOiBRdWVyeSBldmVudCBkYXRhXHJcbiAgICAgIHNldFByb2dyZXNzKCdRdWVyeWluZyBldmVudCBkYXRhIGZyb20gTFJTLi4uJylcclxuICAgICAgY29uc3QgZXZlbnREYXRhID0gYXdhaXQgcXVlcnlFdmVudERhdGEoKVxyXG4gICAgICBpZiAoZXZlbnREYXRhLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyBldmVudCBkYXRhIGZvdW5kIGZvciBzZWxlY3RlZCByb3V0ZXMuJylcclxuXHJcbiAgICAgIC8vIFN0ZXAgMjogU2VnbWVudCByb3V0ZXNcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1NlZ21lbnRpbmcgcm91dGVzIGludG8gMC41LW1pbGUgaW50ZXJ2YWxzLi4uJylcclxuICAgICAgY29uc3Qgcm91dGVHZW9tZXRyaWVzID0gcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnRcclxuICAgICAgaWYgKHJvdXRlR2VvbWV0cmllcy5zaXplID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHJvdXRlIGdlb21ldHJpZXMgY2FjaGVkLicpXHJcblxyXG4gICAgICBjb25zdCBzZWdtZW50czogYW55W10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IFtyaWQsIHJvdXRlRGF0YV0gb2Ygcm91dGVHZW9tZXRyaWVzKSB7XHJcbiAgICAgICAgY29uc3QgeyB2ZXJ0aWNlcywgbUlkeCB9ID0gcm91dGVEYXRhXHJcbiAgICAgICAgaWYgKHZlcnRpY2VzLmxlbmd0aCA8IDIpIGNvbnRpbnVlXHJcbiAgICAgICAgY29uc3QgbWluTWVhc3VyZSA9IHZlcnRpY2VzWzBdW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBtYXhNZWFzdXJlID0gdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IHJvdXRlTGVuID0gbWF4TWVhc3VyZSAtIG1pbk1lYXN1cmVcclxuICAgICAgICBpZiAocm91dGVMZW4gPD0gMCkgY29udGludWVcclxuXHJcbiAgICAgICAgbGV0IHNlZ0Zyb20gPSBtaW5NZWFzdXJlXHJcbiAgICAgICAgbGV0IHNlZ0lkeCA9IDBcclxuICAgICAgICB3aGlsZSAoc2VnRnJvbSA8IG1heE1lYXN1cmUpIHtcclxuICAgICAgICAgIGNvbnN0IHNlZ1RvID0gTWF0aC5taW4oc2VnRnJvbSArIDAuNSwgbWF4TWVhc3VyZSlcclxuICAgICAgICAgIGNvbnN0IG1pZE0gPSAoc2VnRnJvbSArIHNlZ1RvKSAvIDJcclxuICAgICAgICAgIGxldCBtaWRYID0gMCwgbWlkWSA9IDBcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG0xID0gdmVydGljZXNbaV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBjb25zdCBtMiA9IHZlcnRpY2VzW2kgKyAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGlmIChtaWRNID49IG0xICYmIG1pZE0gPD0gbTIpIHtcclxuICAgICAgICAgICAgICBjb25zdCBmcmFjID0gbTIgIT09IG0xID8gKG1pZE0gLSBtMSkgLyAobTIgLSBtMSkgOiAwXHJcbiAgICAgICAgICAgICAgbWlkWCA9IHZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSlcclxuICAgICAgICAgICAgICBtaWRZID0gdmVydGljZXNbaV1bMV0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVsxXSAtIHZlcnRpY2VzW2ldWzFdKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IHBhdGg6IG51bWJlcltdW10gPSBbXVxyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGNvbnN0IG0yID0gdmVydGljZXNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgaWYgKG0yIDwgc2VnRnJvbSkgY29udGludWVcclxuICAgICAgICAgICAgaWYgKG0xID4gc2VnVG8pIGJyZWFrXHJcbiAgICAgICAgICAgIGlmIChtMSA+PSBzZWdGcm9tICYmIG0xIDw9IHNlZ1RvKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwIHx8IHBhdGhbcGF0aC5sZW5ndGggLSAxXVswXSAhPT0gdmVydGljZXNbaV1bMF0pIHBhdGgucHVzaChbdmVydGljZXNbaV1bMF0sIHZlcnRpY2VzW2ldWzFdXSlcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChtMSA8IHNlZ0Zyb20gJiYgbTIgPiBzZWdGcm9tKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZnJhYyA9IChzZWdGcm9tIC0gbTEpIC8gKG0yIC0gbTEpXHJcbiAgICAgICAgICAgICAgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpXVswXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzBdIC0gdmVydGljZXNbaV1bMF0pLCB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobTIgPj0gc2VnRnJvbSAmJiBtMiA8PSBzZWdUbykgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpICsgMV1bMF0sIHZlcnRpY2VzW2kgKyAxXVsxXV0pXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG0xIDwgc2VnVG8gJiYgbTIgPiBzZWdUbykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZyYWMgPSAoc2VnVG8gLSBtMSkgLyAobTIgLSBtMSlcclxuICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSksIHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSldKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPj0gMikgc2VnbWVudHMucHVzaCh7IHJvdXRlSWQ6IHJpZCwgc2VnSWR4LCBmcm9tTTogc2VnRnJvbSwgdG9NOiBzZWdUbywgbWlkWCwgbWlkWSwgcGF0aCwgY3Jhc2hDb3VudDogMCwgYXR0cnM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIGFueT4gfSlcclxuICAgICAgICAgIHNlZ0Zyb20gPSBzZWdUb1xyXG4gICAgICAgICAgc2VnSWR4KytcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyBzZWdtZW50cyBnZW5lcmF0ZWQuJylcclxuXHJcbiAgICAgIC8vIFN0ZXAgMzogQ291bnQgY3Jhc2hlcyBwZXIgc2VnbWVudFxyXG4gICAgICBzZXRQcm9ncmVzcyhgQ291bnRpbmcgY3Jhc2hlcyBhY3Jvc3MgJHtzZWdtZW50cy5sZW5ndGh9IHNlZ21lbnRzLi4uYClcclxuICAgICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcbiAgICAgIGNvbnN0IGNyYXNoTGF5ZXJOYW1lcyA9IG5ldyBTZXQoZXZlbnRDb25maWdzLmZpbHRlcihjZmcgPT4gL2NyYXNofGFjY2lkZW50fGNvbGxpc2lvbi9pLnRlc3QoY2ZnLm5hbWUpKS5tYXAoY2ZnID0+IGNmZy5uYW1lKSlcclxuXHJcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZXZlbnREYXRhKSB7XHJcbiAgICAgICAgaWYgKCFjcmFzaExheWVyTmFtZXMuaGFzKGVudHJ5LkZlYXR1cmUpKSBjb250aW51ZVxyXG4gICAgICAgIGlmIChlbnRyeS5NZWFzdXJlID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICAgIGlmIChzZWcucm91dGVJZCA9PT0gZW50cnkuUm91dGVJRCAmJiBlbnRyeS5NZWFzdXJlID49IHNlZy5mcm9tTSAmJiBlbnRyeS5NZWFzdXJlIDwgc2VnLnRvTSkge1xyXG4gICAgICAgICAgICBzZWcuY3Jhc2hDb3VudCsrXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGVwIDQ6IEVucmljaCB3aXRoIHJvYWQgYXR0cmlidXRlc1xyXG4gICAgICBzZXRQcm9ncmVzcygnRW5yaWNoaW5nIHNlZ21lbnRzIHdpdGggcm9hZCBhdHRyaWJ1dGVzLi4uJylcclxuICAgICAgY29uc3Qgbm9uQ3Jhc2hMYXllcnMgPSBldmVudENvbmZpZ3MuZmlsdGVyKGNmZyA9PiAhY3Jhc2hMYXllck5hbWVzLmhhcyhjZmcubmFtZSkpXHJcbiAgICAgIGNvbnN0IGVucmljaEZpZWxkczogc3RyaW5nW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IGNmZyBvZiBub25DcmFzaExheWVycykge1xyXG4gICAgICAgIGNvbnN0IGxheWVyRW50cmllcyA9IGV2ZW50RGF0YS5maWx0ZXIoZSA9PiBlLkZlYXR1cmUgPT09IGNmZy5uYW1lKVxyXG4gICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiAoY2ZnLmF0dHJpYnV0ZXMgfHwgW10pKSB7XHJcbiAgICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSBgJHtjZmcubmFtZS5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJ18nKS5zdWJzdHJpbmcoMCwgMTUpfV8ke2F0dHIucmVwbGFjZSgvW15hLXpBLVowLTldL2csICdfJykuc3Vic3RyaW5nKDAsIDE1KX1gLnN1YnN0cmluZygwLCAzMSlcclxuICAgICAgICAgIGlmICghZW5yaWNoRmllbGRzLmluY2x1ZGVzKGZpZWxkTmFtZSkpIGVucmljaEZpZWxkcy5wdXNoKGZpZWxkTmFtZSlcclxuICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGF5ZXJFbnRyaWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeS5Sb3V0ZUlEID09IG51bGwgfHwgZW50cnkuTWVhc3VyZSA9PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgICAgICAgIGlmIChzZWcucm91dGVJZCA9PT0gZW50cnkuUm91dGVJRCAmJiBlbnRyeS5NZWFzdXJlID49IHNlZy5mcm9tTSAmJiBlbnRyeS5NZWFzdXJlIDwgc2VnLnRvTSkge1xyXG4gICAgICAgICAgICAgICAgc2VnLmF0dHJzW2ZpZWxkTmFtZV0gPSBlbnRyeVthdHRyXSA/PyAnJ1xyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0ZXAgNTogS2VybmVsIGRlbnNpdHkgc2NvcmluZ1xyXG4gICAgICBzZXRQcm9ncmVzcygnQ29tcHV0aW5nIHJpc2sgc2NvcmVzLi4uJylcclxuICAgICAgY29uc3QgS0VSTkVMX1JBRElVUyA9IDVcclxuICAgICAgY29uc3QgREVDQVkgPSAwLjVcclxuICAgICAgY29uc3Qgc2Vnc0J5Um91dGUgPSBuZXcgTWFwPHN0cmluZywgYW55W10+KClcclxuICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICBpZiAoIXNlZ3NCeVJvdXRlLmhhcyhzZWcucm91dGVJZCkpIHNlZ3NCeVJvdXRlLnNldChzZWcucm91dGVJZCwgW10pXHJcbiAgICAgICAgc2Vnc0J5Um91dGUuZ2V0KHNlZy5yb3V0ZUlkKSEucHVzaChzZWcpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJpc2tTY29yZXM6IG51bWJlcltdID0gW11cclxuICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICBjb25zdCByb3V0ZVNlZ3MgPSBzZWdzQnlSb3V0ZS5nZXQoc2VnLnJvdXRlSWQpIHx8IFtdXHJcbiAgICAgICAgbGV0IHNjb3JlID0gc2VnLmNyYXNoQ291bnQgKiAyXHJcbiAgICAgICAgZm9yIChjb25zdCBuZWlnaGJvciBvZiByb3V0ZVNlZ3MpIHtcclxuICAgICAgICAgIGlmIChuZWlnaGJvciA9PT0gc2VnKSBjb250aW51ZVxyXG4gICAgICAgICAgY29uc3QgZCA9IE1hdGguYWJzKG5laWdoYm9yLnNlZ0lkeCAtIHNlZy5zZWdJZHgpXHJcbiAgICAgICAgICBpZiAoZCA8PSBLRVJORUxfUkFESVVTKSBzY29yZSArPSBuZWlnaGJvci5jcmFzaENvdW50ICogTWF0aC5wb3coREVDQVksIGQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJpc2tTY29yZXMucHVzaChzY29yZSlcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBtYXhSaXNrU2NvcmUgPSBNYXRoLm1heCguLi5yaXNrU2NvcmVzLCAxKVxyXG4gICAgICBjb25zdCBub3JtYWxpemVkU2NvcmVzID0gcmlza1Njb3Jlcy5tYXAocyA9PiBNYXRoLnJvdW5kKChzIC8gbWF4Umlza1Njb3JlKSAqIDEwMCkpXHJcblxyXG4gICAgICAvLyBTdG9yZSBmYWN0b3JzIGZvciBleHBsYW5hdGlvblxyXG4gICAgICBjb25zdCBoaWdoUmlza1NlZ3MgPSBzZWdtZW50cy5maWx0ZXIoKF8sIGlkeCkgPT4gbm9ybWFsaXplZFNjb3Jlc1tpZHhdID49IDc1KVxyXG4gICAgICBjb25zdCB0b3BIaWdoUmlzayA9IGhpZ2hSaXNrU2Vncy5tYXAoc2VnID0+ICh7IC4uLnNlZywgcmlza1Njb3JlOiBub3JtYWxpemVkU2NvcmVzW3NlZ21lbnRzLmluZGV4T2Yoc2VnKV0gfSkpLnNvcnQoKGEsIGIpID0+IGIucmlza1Njb3JlIC0gYS5yaXNrU2NvcmUpLnNsaWNlKDAsIDUpXHJcbiAgICAgIHNldEZhY3RvcnMoeyB0b3RhbFNlZ21lbnRzOiBzZWdtZW50cy5sZW5ndGgsIHNlZ21lbnRzV2l0aENyYXNoZXM6IHNlZ21lbnRzLmZpbHRlcihzID0+IHMuY3Jhc2hDb3VudCA+IDApLmxlbmd0aCwgaGlnaFJpc2tDb3VudDogaGlnaFJpc2tTZWdzLmxlbmd0aCwgbWF4Q3Jhc2hDb3VudDogTWF0aC5tYXgoLi4uc2VnbWVudHMubWFwKHMgPT4gcy5jcmFzaENvdW50KSwgMSksIGVucmljaExheWVyczogbm9uQ3Jhc2hMYXllcnMubWFwKGwgPT4gbC5uYW1lKSwgZW5yaWNoRmllbGRzLCBrZXJuZWxSYWRpdXM6IEtFUk5FTF9SQURJVVMsIHRvcEhpZ2hSaXNrU2VnbWVudHM6IHRvcEhpZ2hSaXNrIH0pXHJcblxyXG4gICAgICAvLyBEaXNwbGF5IGNyYXNoIGV2ZW50cyBvbiBtYXAgYW5kIGNvbXB1dGUgY29ycmVsYXRpb25zXHJcbiAgICAgIGNvbnN0IGNyYXNoRW50cmllcyA9IGV2ZW50RGF0YS5maWx0ZXIoZSA9PiBjcmFzaExheWVyTmFtZXMuaGFzKGUuRmVhdHVyZSkpXHJcbiAgICAgIGRpc3BsYXlDcmFzaEV2ZW50c09uTWFwKGNyYXNoRW50cmllcywgcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnQpXHJcblxyXG4gICAgICAvLyBDb21wdXRlIHRvcCBjb3JyZWxhdGluZyBldmVudCBsYXllciBhdHRyaWJ1dGVzIGZvciBoaWdoLXJpc2sgc2VnbWVudHNcclxuICAgICAgY29uc3QgaGlnaFJpc2tTZWdTZXQgPSBuZXcgU2V0KGhpZ2hSaXNrU2VncylcclxuICAgICAgY29uc3QgYXR0ckNvcnJlbGF0aW9uczogQXJyYXk8eyBsYXllcjogc3RyaW5nOyB2YWx1ZTogc3RyaW5nOyBjb3VudDogbnVtYmVyOyBwY3Q6IG51bWJlciB9PiA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgY2ZnIG9mIG5vbkNyYXNoTGF5ZXJzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIChjZmcuYXR0cmlidXRlcyB8fCBbXSkpIHtcclxuICAgICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGAke2NmZy5uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnXycpLnN1YnN0cmluZygwLCAxNSl9XyR7YXR0ci5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJ18nKS5zdWJzdHJpbmcoMCwgMTUpfWAuc3Vic3RyaW5nKDAsIDMxKVxyXG4gICAgICAgICAgY29uc3QgdmFsdWVDb3VudHMgPSBuZXcgTWFwPHN0cmluZywgbnVtYmVyPigpXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IHNlZyBvZiBoaWdoUmlza1NlZ3MpIHtcclxuICAgICAgICAgICAgY29uc3QgdiA9IHNlZy5hdHRyc1tmaWVsZE5hbWVdXHJcbiAgICAgICAgICAgIGlmICh2ICE9IG51bGwgJiYgdiAhPT0gJycpIHZhbHVlQ291bnRzLnNldChTdHJpbmcodiksICh2YWx1ZUNvdW50cy5nZXQoU3RyaW5nKHYpKSB8fCAwKSArIDEpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IFt2YWx1ZSwgY291bnRdIG9mIHZhbHVlQ291bnRzKSB7XHJcbiAgICAgICAgICAgIGF0dHJDb3JyZWxhdGlvbnMucHVzaCh7IGxheWVyOiBjZmcubmFtZSwgdmFsdWU6IGAke2F0dHJ9OiAke3ZhbHVlfWAsIGNvdW50LCBwY3Q6IE1hdGgucm91bmQoKGNvdW50IC8gaGlnaFJpc2tTZWdzLmxlbmd0aCkgKiAxMDApIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGF0dHJDb3JyZWxhdGlvbnMuc29ydCgoYSwgYikgPT4gYi5wY3QgLSBhLnBjdClcclxuICAgICAgc2V0Q3Jhc2hTdGF0cyh7IHRvdGFsQ3Jhc2hlczogY3Jhc2hFbnRyaWVzLmxlbmd0aCwgdG9wQ29ycmVsYXRpb25zOiBhdHRyQ29ycmVsYXRpb25zLnNsaWNlKDAsIDQpIH0pXHJcblxyXG4gICAgICAvLyBTdGVwIDY6IFVwbG9hZCBhcyBmZWF0dXJlIHNlcnZpY2VcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1VwbG9hZGluZyBwcmVkaWN0aW9uIGxheWVyLi4uJylcclxuICAgICAgY29uc3QgY29udGVudFVybCA9IGAke3BvcnRhbFVybH0vc2hhcmluZy9yZXN0L2NvbnRlbnQvdXNlcnMvJHt1c2VybmFtZX1gXHJcbiAgICAgIGNvbnN0IGZvbGRlclVybCA9IHNlbGVjdGVkRm9sZGVySWQgPyBgJHtjb250ZW50VXJsfS8ke3NlbGVjdGVkRm9sZGVySWR9YCA6IGNvbnRlbnRVcmxcclxuICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSBgQ3Jhc2hSaXNrX0FJXyR7RGF0ZS5ub3coKX1gXHJcblxyXG4gICAgICBjb25zdCBmaWVsZHMgPSBbXHJcbiAgICAgICAgeyBuYW1lOiAnT0JKRUNUSUQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZU9JRCcsIGFsaWFzOiAnT2JqZWN0SUQnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncm91dGVpZCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdSb3V0ZSBJRCcsIGxlbmd0aDogMTAwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnZnJvbV9tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ0Zyb20gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICd0b19tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ1RvIE1lYXN1cmUnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY3Jhc2hfY291bnQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZUludGVnZXInLCBhbGlhczogJ0NyYXNoIENvdW50JyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfc2NvcmUnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZUludGVnZXInLCBhbGlhczogJ1Jpc2sgU2NvcmUgKDAtMTAwKScgfSxcclxuICAgICAgICB7IG5hbWU6ICdyaXNrX2xldmVsJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1Jpc2sgTGV2ZWwnLCBsZW5ndGg6IDIwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udHJpYnV0aW5nX2ZhY3RvcnMnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnQ29udHJpYnV0aW5nIEZhY3RvcnMnLCBsZW5ndGg6IDUwMCB9XHJcbiAgICAgIF1cclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdjcmVhdGVQYXJhbWV0ZXJzJywgSlNPTi5zdHJpbmdpZnkoeyBuYW1lOiBzZXJ2aWNlTmFtZSwgc2VydmljZURlc2NyaXB0aW9uOiAnQUkgY3Jhc2ggcmlzayBwcmVkaWN0aW9uJywgaGFzU3RhdGljRGF0YTogZmFsc2UsIG1heFJlY29yZENvdW50OiAxMDAwMCwgc3VwcG9ydGVkUXVlcnlGb3JtYXRzOiAnSlNPTicsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcnLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSwgaW5pdGlhbEV4dGVudDogeyB4bWluOiAtMjAwMzc1MDgsIHltaW46IC0yMDAzNzUwOCwgeG1heDogMjAwMzc1MDgsIHltYXg6IDIwMDM3NTA4LCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LCBhbGxvd0dlb21ldHJ5VXBkYXRlczogdHJ1ZSB9KSlcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgndGFyZ2V0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ291dHB1dFR5cGUnLCAnZmVhdHVyZVNlcnZpY2UnKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBpZiAoc2VsZWN0ZWRGb2xkZXJJZCkgY3JlYXRlUGFyYW1zLmFwcGVuZCgnZm9sZGVySWQnLCBzZWxlY3RlZEZvbGRlcklkKVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUmVzcCA9IGF3YWl0IGZldGNoKGAke2ZvbGRlclVybH0vY3JlYXRlU2VydmljZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGNyZWF0ZVBhcmFtcyB9KVxyXG4gICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCBjcmVhdGVSZXNwLmpzb24oKVxyXG4gICAgICBpZiAoIWNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTCAmJiAhY3JlYXRlUmVzdWx0LnNlcnZpY2V1cmwpIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBzZXJ2aWNlOiAnICsgSlNPTi5zdHJpbmdpZnkoY3JlYXRlUmVzdWx0KSlcclxuICAgICAgY29uc3Qgc2VydmljZVVybCA9IGNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTCB8fCBjcmVhdGVSZXN1bHQuc2VydmljZXVybFxyXG4gICAgICBjb25zdCB0ZW1wSXRlbUlkID0gY3JlYXRlUmVzdWx0Lml0ZW1JZFxyXG5cclxuICAgICAgY29uc3QgYWRtaW5VcmwgPSBzZXJ2aWNlVXJsLnJlcGxhY2UoJy9yZXN0L3NlcnZpY2VzLycsICcvcmVzdC9hZG1pbi9zZXJ2aWNlcy8nKVxyXG4gICAgICBjb25zdCBhZGREZWZQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgnYWRkVG9EZWZpbml0aW9uJywgSlNPTi5zdHJpbmdpZnkoeyBsYXllcnM6IFt7IGlkOiAwLCBuYW1lOiAnQUkgQ3Jhc2ggUmlzaycsIHR5cGU6ICdGZWF0dXJlIExheWVyJywgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5UG9seWxpbmUnLCBkaXNwbGF5RmllbGQ6ICdyb3V0ZWlkJywgZmllbGRzLCBvYmplY3RJZEZpZWxkOiAnT0JKRUNUSUQnLCBoYXNBdHRhY2htZW50czogZmFsc2UsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcsQ3JlYXRlLFVwZGF0ZSxEZWxldGUnIH1dIH0pKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBhd2FpdCBmZXRjaChgJHthZG1pblVybH0vYWRkVG9EZWZpbml0aW9uYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRGVmUGFyYW1zIH0pXHJcblxyXG4gICAgICAvLyBVcGxvYWQgZmVhdHVyZXNcclxuICAgICAgY29uc3QgZmVhdHVyZXMgPSBzZWdtZW50cy5maWx0ZXIoKF8sIGlkeCkgPT4gbm9ybWFsaXplZFNjb3Jlc1tpZHhdID4gMCkubWFwKChzZWcpID0+IHtcclxuICAgICAgICBjb25zdCBpZHggPSBzZWdtZW50cy5pbmRleE9mKHNlZylcclxuICAgICAgICBjb25zdCByaXNrU2NvcmUgPSBub3JtYWxpemVkU2NvcmVzW2lkeF1cclxuICAgICAgICBjb25zdCByaXNrTGV2ZWwgPSByaXNrU2NvcmUgPj0gNzUgPyAnSGlnaCcgOiByaXNrU2NvcmUgPj0gNDAgPyAnTWVkaXVtJyA6IHJpc2tTY29yZSA+IDAgPyAnTG93JyA6ICdNaW5pbWFsJ1xyXG4gICAgICAgIGNvbnN0IGZjdHJzID0gT2JqZWN0LmVudHJpZXMoc2VnLmF0dHJzKS5maWx0ZXIoKFssIHZdKSA9PiB2ICYmIFN0cmluZyh2KS50cmltKCkpLnNsaWNlKDAsIDUpLm1hcCgoW2ssIHZdKSA9PiBgJHtrfT0ke3Z9YCkuam9pbignOyAnKVxyXG4gICAgICAgIHJldHVybiB7IGdlb21ldHJ5OiB7IHBhdGhzOiBbc2VnLnBhdGhdLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LCBhdHRyaWJ1dGVzOiB7IHJvdXRlaWQ6IHNlZy5yb3V0ZUlkLCBmcm9tX206IHNlZy5mcm9tTSwgdG9fbTogc2VnLnRvTSwgY3Jhc2hfY291bnQ6IHNlZy5jcmFzaENvdW50LCByaXNrX3Njb3JlOiByaXNrU2NvcmUsIHJpc2tfbGV2ZWw6IHJpc2tMZXZlbCwgY29udHJpYnV0aW5nX2ZhY3RvcnM6IGZjdHJzIHx8ICdEZW5zaXR5IGNsdXN0ZXInIH0gfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkgKz0gMTAwMCkge1xyXG4gICAgICAgIGNvbnN0IGJhdGNoID0gZmVhdHVyZXMuc2xpY2UoaSwgaSArIDEwMDApXHJcbiAgICAgICAgc2V0UHJvZ3Jlc3MoYFVwbG9hZGluZy4uLiAke01hdGgubWluKGkgKyAxMDAwLCBmZWF0dXJlcy5sZW5ndGgpfS8ke2ZlYXR1cmVzLmxlbmd0aH1gKVxyXG4gICAgICAgIGNvbnN0IGFkZEZlYXRQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZmVhdHVyZXMnLCBKU09OLnN0cmluZ2lmeShiYXRjaCkpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgICAgYXdhaXQgZmV0Y2goYCR7c2VydmljZVVybH0vMC9hZGRGZWF0dXJlc2AsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGFkZEZlYXRQYXJhbXMgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2hhcmVcclxuICAgICAgY29uc3Qgc2hhcmVQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdldmVyeW9uZScsICdmYWxzZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnb3JnJywgJ3RydWUnKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2l0ZW1zJywgdGVtcEl0ZW1JZClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2NvbnRlbnRVcmx9L2l0ZW1zLyR7dGVtcEl0ZW1JZH0vc2hhcmVgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBzaGFyZVBhcmFtcyB9KVxyXG5cclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0Rpc3BsYXlpbmcgb24gbWFwLi4uJylcclxuICAgICAgYXdhaXQgZGlzcGxheVByZWRpY3Rpb25Pbk1hcChgJHtzZXJ2aWNlVXJsfS8wYCwgdG9rZW4sIHdraWQpXHJcbiAgICAgIHNldFJlc3VsdCh7IGxheWVyVXJsOiBzZXJ2aWNlVXJsLCBpdGVtVXJsOiBgJHtwb3J0YWxVcmx9L2hvbWUvaXRlbS5odG1sP2lkPSR7dGVtcEl0ZW1JZH1gIH0pXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0NyYXNoUmlzayBBSV0gRmFpbGVkOicsIGVycilcclxuICAgICAgc2V0RXJyb3IoJ0FJIHByZWRpY3Rpb24gZmFpbGVkOiAnICsgKGVyci5tZXNzYWdlIHx8IGVycikpXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0UnVubmluZyhmYWxzZSlcclxuICAgIH1cclxuICB9LCBbY29uZmlnLCBxdWVyeUV2ZW50RGF0YSwgc2VsZWN0ZWRGb2xkZXJJZCwgZGlzcGxheVByZWRpY3Rpb25Pbk1hcCwgZGlzcGxheUNyYXNoRXZlbnRzT25NYXBdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBNTCBQUkVESUNUSU9OID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IHJ1bk1MUHJlZGljdGlvbiA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIHNldFJ1bm5pbmcodHJ1ZSlcclxuICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgc2V0UmVzdWx0KG51bGwpXHJcbiAgICBzZXRTaG93RXhwbGFuYXRpb24oZmFsc2UpXHJcbiAgICBzZXRNb2RlbEluZm8obnVsbClcclxuICAgIHNldEVycm9yKG51bGwpXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc2Vzc2lvbiA9IFNlc3Npb25NYW5hZ2VyLmdldEluc3RhbmNlKCkuZ2V0TWFpblNlc3Npb24oKSBhcyBhbnlcclxuICAgICAgaWYgKCFzZXNzaW9uKSB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzaWduZWQgaW4uJylcclxuICAgICAgY29uc3QgdG9rZW4gPSBzZXNzaW9uLnRva2VuXHJcbiAgICAgIGNvbnN0IHBvcnRhbFVybCA9IChzZXNzaW9uLnBvcnRhbCB8fCAnJykucmVwbGFjZSgvXFwvc2hhcmluZ1xcL3Jlc3RcXC8/JC8sICcnKVxyXG4gICAgICBjb25zdCB1c2VybmFtZSA9IHNlc3Npb24udXNlcm5hbWVcclxuICAgICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICAgIGlmICghdmlldykgdGhyb3cgbmV3IEVycm9yKCdObyBtYXAgdmlldyBhdmFpbGFibGUuJylcclxuICAgICAgY29uc3Qgd2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuXHJcbiAgICAgIC8vIFN0ZXAgMTogUXVlcnkgZXZlbnQgZGF0YVxyXG4gICAgICBzZXRQcm9ncmVzcygnUXVlcnlpbmcgcm9hZCBhdHRyaWJ1dGUgZGF0YSBmcm9tIExSUy4uLicpXHJcbiAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGF3YWl0IHF1ZXJ5RXZlbnREYXRhKClcclxuXHJcbiAgICAgIC8vIFN0ZXAgMjogU2VnbWVudCByb3V0ZXNcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1NlZ21lbnRpbmcgcm91dGVzIGF0IDAuNS1taWxlIGludGVydmFscy4uLicpXHJcbiAgICAgIGNvbnN0IHJvdXRlR2VvbWV0cmllcyA9IHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50XHJcbiAgICAgIGlmIChyb3V0ZUdlb21ldHJpZXMuc2l6ZSA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyByb3V0ZSBnZW9tZXRyaWVzLiBTZWxlY3Qgcm91dGVzIGZpcnN0LicpXHJcblxyXG4gICAgICBjb25zdCBtb2RlbCA9IE5ZX1NUQVRFX0NSQVNIX01PREVMXHJcblxyXG4gICAgICAvLyBCdWlsZCBldmVudCBsb29rdXBcclxuICAgICAgY29uc3QgZXZlbnRMb29rdXAgPSBuZXcgTWFwPHN0cmluZywgTWFwPG51bWJlciwgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4+KClcclxuICAgICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcbiAgICAgIGZvciAoY29uc3QgY2ZnIG9mIGV2ZW50Q29uZmlncykge1xyXG4gICAgICAgIGNvbnN0IGxheWVyRW50cmllcyA9IGV2ZW50RGF0YS5maWx0ZXIoZSA9PiBlLkZlYXR1cmUgPT09IGNmZy5uYW1lKVxyXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGF5ZXJFbnRyaWVzKSB7XHJcbiAgICAgICAgICBpZiAoZW50cnkuUm91dGVJRCA9PSBudWxsIHx8IGVudHJ5Lk1lYXN1cmUgPT0gbnVsbCkgY29udGludWVcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IGVudHJ5LlJvdXRlSURcclxuICAgICAgICAgIGlmICghZXZlbnRMb29rdXAuaGFzKHJpZCkpIGV2ZW50TG9va3VwLnNldChyaWQsIG5ldyBNYXAoKSlcclxuICAgICAgICAgIGNvbnN0IG1LZXkgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoZW50cnkuTWVhc3VyZSkgKiAyKSAvIDJcclxuICAgICAgICAgIGNvbnN0IHJvdXRlTWFwID0gZXZlbnRMb29rdXAuZ2V0KHJpZCkhXHJcbiAgICAgICAgICBpZiAoIXJvdXRlTWFwLmhhcyhtS2V5KSkgcm91dGVNYXAuc2V0KG1LZXksIHt9KVxyXG4gICAgICAgICAgY29uc3Qgc2VnRGF0YSA9IHJvdXRlTWFwLmdldChtS2V5KSFcclxuICAgICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiAoY2ZnLmF0dHJpYnV0ZXMgfHwgW10pKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeVthdHRyXSAhPSBudWxsICYmIFN0cmluZyhlbnRyeVthdHRyXSkudHJpbSgpKSB7XHJcbiAgICAgICAgICAgICAgc2VnRGF0YVtgJHtjZmcubmFtZX06OiR7YXR0cn1gXSA9IFN0cmluZyhlbnRyeVthdHRyXSkudHJpbSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0ZXAgMzogU2NvcmUgc2VnbWVudHNcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0FwcGx5aW5nIHN0YXRlIGNyYXNoIG1vZGVsIHdlaWdodHMuLi4nKVxyXG4gICAgICBjb25zdCBzZWdtZW50czogYW55W10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IFtyaWQsIHJkXSBvZiByb3V0ZUdlb21ldHJpZXMuZW50cmllcygpKSB7XHJcbiAgICAgICAgY29uc3QgdmVydHMgPSByZC52ZXJ0aWNlc1xyXG4gICAgICAgIGlmICh2ZXJ0cy5sZW5ndGggPCAyKSBjb250aW51ZVxyXG4gICAgICAgIGNvbnN0IHN0YXJ0TSA9IHZlcnRzWzBdW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBlbmRNID0gdmVydHNbdmVydHMubGVuZ3RoIC0gMV1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IHRvdGFsTGVuID0gTWF0aC5hYnMoZW5kTSAtIHN0YXJ0TSlcclxuICAgICAgICBpZiAodG90YWxMZW4gPCAwLjEpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGNvbnN0IG51bVNlZ3MgPSBNYXRoLmNlaWwodG90YWxMZW4gLyAwLjUpXHJcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBudW1TZWdzOyBzKyspIHtcclxuICAgICAgICAgIGNvbnN0IGZyb21NID0gc3RhcnRNICsgcyAqIDAuNVxyXG4gICAgICAgICAgY29uc3QgdG9NID0gTWF0aC5taW4oc3RhcnRNICsgKHMgKyAxKSAqIDAuNSwgZW5kTSlcclxuICAgICAgICAgIGNvbnN0IG1pZE0gPSAoZnJvbU0gKyB0b00pIC8gMlxyXG4gICAgICAgICAgY29uc3QgbUtleSA9IE1hdGgucm91bmQobWlkTSAqIDIpIC8gMlxyXG5cclxuICAgICAgICAgIGNvbnN0IHJvdXRlTWFwID0gZXZlbnRMb29rdXAuZ2V0KHJpZClcclxuICAgICAgICAgIGNvbnN0IHNlZ0F0dHJzID0gcm91dGVNYXA/LmdldChtS2V5KSB8fCB7fVxyXG5cclxuICAgICAgICAgIGxldCBjb21wb3NpdGVTY29yZSA9IDEuMFxyXG4gICAgICAgICAgY29uc3Qgc2VnRmFjdG9yczogc3RyaW5nW10gPSBbXVxyXG4gICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc2VnQXR0cnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxheWVyTmFtZSA9IGtleS5zcGxpdCgnOjonKVswXVxyXG4gICAgICAgICAgICBjb25zdCBtYXBwaW5nID0gbW9kZWwubHJzTWFwcGluZ1tsYXllck5hbWVdXHJcbiAgICAgICAgICAgIGlmICghbWFwcGluZykgY29udGludWVcclxuICAgICAgICAgICAgbGV0IHdlaWdodCA9IDEuMFxyXG4gICAgICAgICAgICBpZiAobWFwcGluZy5jdXN0b21XZWlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFZhbCA9IHZhbHVlLnJlcGxhY2UoL1teMC05Ll0vZywgJycpLnNwbGl0KCcuJylbMF1cclxuICAgICAgICAgICAgICB3ZWlnaHQgPSBtYXBwaW5nLmN1c3RvbVdlaWdodHNbbm9ybWFsaXplZFZhbF0gfHwgbWFwcGluZy5jdXN0b21XZWlnaHRzW3ZhbHVlXSB8fCAxLjBcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChtYXBwaW5nLnZhbHVlTWFwKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbWFwcGVkQ29uZGl0aW9uID0gbWFwcGluZy52YWx1ZU1hcFt2YWx1ZV1cclxuICAgICAgICAgICAgICBpZiAobWFwcGVkQ29uZGl0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZUNhdGVnb3J5ID0gKG1vZGVsIGFzIGFueSlbbWFwcGluZy5zdGF0ZUZpZWxkXVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlQ2F0ZWdvcnkgJiYgc3RhdGVDYXRlZ29yeVttYXBwZWRDb25kaXRpb25dKSB7XHJcbiAgICAgICAgICAgICAgICAgIHdlaWdodCA9IHN0YXRlQ2F0ZWdvcnlbbWFwcGVkQ29uZGl0aW9uXS53ZWlnaHRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHdlaWdodCAhPT0gMS4wKSB7XHJcbiAgICAgICAgICAgICAgY29tcG9zaXRlU2NvcmUgKj0gd2VpZ2h0XHJcbiAgICAgICAgICAgICAgaWYgKHdlaWdodCA+IDEuMikgc2VnRmFjdG9ycy5wdXNoKGAke2xheWVyTmFtZX06ICR7dmFsdWV9ICgke3dlaWdodC50b0ZpeGVkKDEpfXgpYClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHJpc2tTY29yZSA9IE1hdGgubWluKE1hdGgucm91bmQoTWF0aC5sb2coY29tcG9zaXRlU2NvcmUgKyAxKSAqIDQwKSwgMTAwKVxyXG5cclxuICAgICAgICAgIC8vIEJ1aWxkIHBhdGhcclxuICAgICAgICAgIGNvbnN0IHBhdGg6IG51bWJlcltdW10gPSBbXVxyXG4gICAgICAgICAgZm9yIChjb25zdCB2IG9mIHZlcnRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZtID0gdltyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGlmICh2bSA+PSBmcm9tTSAmJiB2bSA8PSB0b00pIHBhdGgucHVzaChbdlswXSwgdlsxXV0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbTEgPSB2ZXJ0c1tpXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgICAgICAgY29uc3QgbTIgPSB2ZXJ0c1tpICsgMV1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgICAgICAgIGlmIChtMSA8PSBmcm9tTSAmJiBtMiA+PSBmcm9tTSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IChmcm9tTSAtIG0xKSAvIChtMiAtIG0xIHx8IDEpXHJcbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRzW2ldWzBdICsgdCAqICh2ZXJ0c1tpICsgMV1bMF0gLSB2ZXJ0c1tpXVswXSksIHZlcnRzW2ldWzFdICsgdCAqICh2ZXJ0c1tpICsgMV1bMV0gLSB2ZXJ0c1tpXVsxXSldKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAobTEgPD0gdG9NICYmIG0yID49IHRvTSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdCA9ICh0b00gLSBtMSkgLyAobTIgLSBtMSB8fCAxKVxyXG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKFt2ZXJ0c1tpXVswXSArIHQgKiAodmVydHNbaSArIDFdWzBdIC0gdmVydHNbaV1bMF0pLCB2ZXJ0c1tpXVsxXSArIHQgKiAodmVydHNbaSArIDFdWzFdIC0gdmVydHNbaV1bMV0pXSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA8IDIpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgY29uc3Qgcmlza0xldmVsID0gcmlza1Njb3JlID49IDc1ID8gJ0hpZ2gnIDogcmlza1Njb3JlID49IDQwID8gJ01lZGl1bScgOiByaXNrU2NvcmUgPiAwID8gJ0xvdycgOiAnTWluaW1hbCdcclxuICAgICAgICAgIHNlZ21lbnRzLnB1c2goeyByb3V0ZUlkOiByaWQsIGZyb21NLCB0b00sIHBhdGgsIHJpc2tTY29yZSwgcmlza0xldmVsLCBjb250cmlidXRpbmdGYWN0b3JzOiBzZWdGYWN0b3JzIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gc2VnbWVudHMgZ2VuZXJhdGVkLicpXHJcblxyXG4gICAgICAvLyBTdG9yZSBtb2RlbCBpbmZvXHJcbiAgICAgIGNvbnN0IHdlaWdodHNTdW1tYXJ5OiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+PiA9IHt9XHJcbiAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBmIG9mIHNlZy5jb250cmlidXRpbmdGYWN0b3JzKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IGYubWF0Y2goL14oLis/KTogKC4rPykgXFwoKC4rPyl4XFwpJC8pXHJcbiAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgaWYgKCF3ZWlnaHRzU3VtbWFyeVttYXRjaFsxXV0pIHdlaWdodHNTdW1tYXJ5W21hdGNoWzFdXSA9IHt9XHJcbiAgICAgICAgICAgIHdlaWdodHNTdW1tYXJ5W21hdGNoWzFdXVttYXRjaFsyXV0gPSBwYXJzZUZsb2F0KG1hdGNoWzNdKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzZXRNb2RlbEluZm8oeyB3ZWlnaHRzOiB3ZWlnaHRzU3VtbWFyeSwgdG90YWxDcmFzaGVzOiBtb2RlbC50b3RhbENyYXNoZXMsIHllYXJzOiBtb2RlbC55ZWFycyB9KVxyXG5cclxuICAgICAgLy8gU3RlcCA0OiBVcGxvYWRcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1VwbG9hZGluZyBzdGF0ZSBNTCBwcmVkaWN0aW9uIGxheWVyLi4uJylcclxuICAgICAgY29uc3QgY29udGVudFVybCA9IGAke3BvcnRhbFVybH0vc2hhcmluZy9yZXN0L2NvbnRlbnQvdXNlcnMvJHt1c2VybmFtZX1gXHJcbiAgICAgIGNvbnN0IGZvbGRlclVybCA9IHNlbGVjdGVkRm9sZGVySWQgPyBgJHtjb250ZW50VXJsfS8ke3NlbGVjdGVkRm9sZGVySWR9YCA6IGNvbnRlbnRVcmxcclxuICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSBgU3RhdGVNTF9DcmFzaFJpc2tfJHtEYXRlLm5vdygpfWBcclxuXHJcbiAgICAgIGNvbnN0IGZpZWxkcyA9IFtcclxuICAgICAgICB7IG5hbWU6ICdPQkpFQ1RJRCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlT0lEJywgYWxpYXM6ICdPYmplY3RJRCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdyb3V0ZWlkJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1JvdXRlIElEJywgbGVuZ3RoOiAxMDAgfSxcclxuICAgICAgICB7IG5hbWU6ICdmcm9tX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnRnJvbSBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3RvX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnVG8gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICdyaXNrX3Njb3JlJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVJbnRlZ2VyJywgYWxpYXM6ICdSaXNrIFNjb3JlICgwLTEwMCknIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19sZXZlbCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdSaXNrIExldmVsJywgbGVuZ3RoOiAyMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRyaWJ1dGluZ19mYWN0b3JzJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ0NvbnRyaWJ1dGluZyBGYWN0b3JzJywgbGVuZ3RoOiA1MDAgfSxcclxuICAgICAgICB7IG5hbWU6ICdtb2RlbF9jb25maWRlbmNlJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ01vZGVsIENvbmZpZGVuY2UnLCBsZW5ndGg6IDUwIH1cclxuICAgICAgXVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2NyZWF0ZVBhcmFtZXRlcnMnLCBKU09OLnN0cmluZ2lmeSh7IG5hbWU6IHNlcnZpY2VOYW1lLCBzZXJ2aWNlRGVzY3JpcHRpb246ICdDcmFzaCByaXNrIGZyb20gTlkgc3RhdGUgY3Jhc2ggZGF0YWJhc2UgTUwgbW9kZWwnLCBoYXNTdGF0aWNEYXRhOiBmYWxzZSwgbWF4UmVjb3JkQ291bnQ6IDEwMDAwLCBzdXBwb3J0ZWRRdWVyeUZvcm1hdHM6ICdKU09OJywgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZycsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9LCBpbml0aWFsRXh0ZW50OiB7IHhtaW46IC0yMDAzNzUwOCwgeW1pbjogLTIwMDM3NTA4LCB4bWF4OiAyMDAzNzUwOCwgeW1heDogMjAwMzc1MDgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGFsbG93R2VvbWV0cnlVcGRhdGVzOiB0cnVlIH0pKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0YXJnZXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnb3V0cHV0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGlmIChzZWxlY3RlZEZvbGRlcklkKSBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmb2xkZXJJZCcsIHNlbGVjdGVkRm9sZGVySWQpXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwID0gYXdhaXQgZmV0Y2goYCR7Zm9sZGVyVXJsfS9jcmVhdGVTZXJ2aWNlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogY3JlYXRlUGFyYW1zIH0pXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3VsdCA9IGF3YWl0IGNyZWF0ZVJlc3AuanNvbigpXHJcbiAgICAgIGlmICghY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMKSB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgc2VydmljZTogJyArIEpTT04uc3RyaW5naWZ5KGNyZWF0ZVJlc3VsdCkpXHJcbiAgICAgIGNvbnN0IHNlcnZpY2VVcmwgPSBjcmVhdGVSZXN1bHQuZW5jb2RlZFNlcnZpY2VVUkxcclxuICAgICAgY29uc3QgdGVtcEl0ZW1JZCA9IGNyZWF0ZVJlc3VsdC5pdGVtSWRcclxuXHJcbiAgICAgIGNvbnN0IGFkbWluVXJsID0gc2VydmljZVVybC5yZXBsYWNlKCcvcmVzdC9zZXJ2aWNlcy8nLCAnL3Jlc3QvYWRtaW4vc2VydmljZXMvJylcclxuICAgICAgY29uc3QgYWRkRGVmUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2FkZFRvRGVmaW5pdGlvbicsIEpTT04uc3RyaW5naWZ5KHsgbGF5ZXJzOiBbeyBpZDogMCwgbmFtZTogJ1N0YXRlIE1MIFJpc2snLCB0eXBlOiAnRmVhdHVyZSBMYXllcicsIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvbHlsaW5lJywgZGlzcGxheUZpZWxkOiAncm91dGVpZCcsIGZpZWxkcywgb2JqZWN0SWRGaWVsZDogJ09CSkVDVElEJywgaGFzQXR0YWNobWVudHM6IGZhbHNlLCBjYXBhYmlsaXRpZXM6ICdRdWVyeSxFZGl0aW5nLENyZWF0ZSxVcGRhdGUsRGVsZXRlJyB9XSB9KSlcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7YWRtaW5Vcmx9L2FkZFRvRGVmaW5pdGlvbmAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGFkZERlZlBhcmFtcyB9KVxyXG5cclxuICAgICAgY29uc3QgZmVhdHVyZXMgPSBzZWdtZW50cy5maWx0ZXIocyA9PiBzLnJpc2tTY29yZSA+IDApLm1hcChzZWcgPT4gKHtcclxuICAgICAgICBnZW9tZXRyeTogeyBwYXRoczogW3NlZy5wYXRoXSwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0gfSxcclxuICAgICAgICBhdHRyaWJ1dGVzOiB7IHJvdXRlaWQ6IHNlZy5yb3V0ZUlkLCBmcm9tX206IHNlZy5mcm9tTSwgdG9fbTogc2VnLnRvTSwgcmlza19zY29yZTogc2VnLnJpc2tTY29yZSwgcmlza19sZXZlbDogc2VnLnJpc2tMZXZlbCwgY29udHJpYnV0aW5nX2ZhY3RvcnM6IHNlZy5jb250cmlidXRpbmdGYWN0b3JzLmpvaW4oJzsgJyksIG1vZGVsX2NvbmZpZGVuY2U6IGBIaWdoICgke21vZGVsLnRvdGFsQ3Jhc2hlcy50b0xvY2FsZVN0cmluZygpfSB0cmFpbmluZyBjcmFzaGVzKWAgfVxyXG4gICAgICB9KSlcclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpICs9IDEwMDApIHtcclxuICAgICAgICBjb25zdCBiYXRjaCA9IGZlYXR1cmVzLnNsaWNlKGksIGkgKyAxMDAwKVxyXG4gICAgICAgIHNldFByb2dyZXNzKGBVcGxvYWRpbmcuLi4gJHtNYXRoLm1pbihpICsgMTAwMCwgZmVhdHVyZXMubGVuZ3RoKX0vJHtmZWF0dXJlcy5sZW5ndGh9YClcclxuICAgICAgICBjb25zdCBhZGRGZWF0UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ2ZlYXR1cmVzJywgSlNPTi5zdHJpbmdpZnkoYmF0Y2gpKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICAgIGF3YWl0IGZldGNoKGAke3NlcnZpY2VVcmx9LzAvYWRkRmVhdHVyZXNgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGRGZWF0UGFyYW1zIH0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNoYXJlXHJcbiAgICAgIGNvbnN0IHNoYXJlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnZXZlcnlvbmUnLCAnZmFsc2UnKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ29yZycsICd0cnVlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdpdGVtcycsIHRlbXBJdGVtSWQpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBhd2FpdCBmZXRjaChgJHtjb250ZW50VXJsfS9pdGVtcy8ke3RlbXBJdGVtSWR9L3NoYXJlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogc2hhcmVQYXJhbXMgfSlcclxuXHJcbiAgICAgIHNldFByb2dyZXNzKCdEaXNwbGF5aW5nIG9uIG1hcC4uLicpXHJcbiAgICAgIGF3YWl0IGRpc3BsYXlQcmVkaWN0aW9uT25NYXAoYCR7c2VydmljZVVybH0vMGAsIHRva2VuLCB3a2lkKVxyXG4gICAgICBzZXRSZXN1bHQoeyBsYXllclVybDogc2VydmljZVVybCwgaXRlbVVybDogYCR7cG9ydGFsVXJsfS9ob21lL2l0ZW0uaHRtbD9pZD0ke3RlbXBJdGVtSWR9YCB9KVxyXG4gICAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTdGF0ZU1MXSBGYWlsZWQ6JywgZXJyKVxyXG4gICAgICBzZXRFcnJvcignTUwgcHJlZGljdGlvbiBmYWlsZWQ6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRSdW5uaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWcsIHF1ZXJ5RXZlbnREYXRhLCBzZWxlY3RlZEZvbGRlcklkLCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gUkVOREVSID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IHJvdXRlU2VsZWN0aW9uVUkgPSAoKSA9PiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4JywgYmFja2dyb3VuZDogJyNmOGY5ZmEnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2UwZTBlMCcgfX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBjb2xvcjogJyMzMzMnIH19PlNlbGVjdCBSb3V0ZXM8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBTZWFyY2ggbW9kZSB0YWJzICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNHB4JywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWFyY2hNb2RlKCdpZCcpfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4JywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyOiBzZWFyY2hNb2RlID09PSAnaWQnID8gJzJweCBzb2xpZCAjMDA3OWMxJyA6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNlYXJjaE1vZGUgPT09ICdpZCcgPyAnI2U4ZjRmZCcgOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInIH19PkJ5IFJvdXRlIElEPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoTW9kZSgnbmFtZScpfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4JywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyOiBzZWFyY2hNb2RlID09PSAnbmFtZScgPyAnMnB4IHNvbGlkICMwMDc5YzEnIDogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogc2VhcmNoTW9kZSA9PT0gJ25hbWUnID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJyB9fT5CeSBOYW1lPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoTW9kZSgnbWFwJyl9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHgnLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXI6IHNlYXJjaE1vZGUgPT09ICdtYXAnID8gJzJweCBzb2xpZCAjMDA3OWMxJyA6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNlYXJjaE1vZGUgPT09ICdtYXAnID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJyB9fT5EcmF3IEFyZWE8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7LyogUm91dGUgSUQgLyBOYW1lIHNlYXJjaCAqL31cclxuICAgICAgeyhzZWFyY2hNb2RlID09PSAnaWQnIHx8IHNlYXJjaE1vZGUgPT09ICduYW1lJykgJiYgKFxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNHB4JywgbWFyZ2luQm90dG9tOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e3NlYXJjaE1vZGUgPT09ICdpZCcgPyByb3V0ZUlkIDogcm91dGVOYW1lfSBvbkNoYW5nZT17ZSA9PiBoYW5kbGVSb3V0ZVNlYXJjaChlLnRhcmdldC52YWx1ZSl9IHBsYWNlaG9sZGVyPXtzZWFyY2hNb2RlID09PSAnaWQnID8gJ1JvdXRlIElELi4uJyA6ICdSb3V0ZSBuYW1lLi4uJ30gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzZweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTJweCcgfX0gLz5cclxuICAgICAgICAgICAge2hhc01hcFdpZGdldCAmJiAoXHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17cGlja2luZ0Zyb21NYXAgPyBjYW5jZWxQaWNrRnJvbU1hcCA6IHN0YXJ0UGlja0Zyb21NYXB9IHN0eWxlPXt7IHBhZGRpbmc6ICc2cHggMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogcGlja2luZ0Zyb21NYXAgPyAnIzAwNzljMScgOiAnI2ZmZicsIGNvbG9yOiBwaWNraW5nRnJvbU1hcCA/ICcjZmZmJyA6ICcjMDA3OWMxJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTFweCcgfX0+XHJcbiAgICAgICAgICAgICAgICB7cGlja2luZ0Zyb21NYXAgPyAnQ2FuY2VsJyA6ICdQaWNrJ31cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBBdXRvY29tcGxldGUgc3VnZ2VzdGlvbnMgKi99XHJcbiAgICAgICAgICB7c2hvd1N1Z2dlc3Rpb25zICYmIHJvdXRlU3VnZ2VzdGlvbnMubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBtYXhIZWlnaHQ6ICcxMDBweCcsIG92ZXJmbG93OiAnYXV0bycsIGJhY2tncm91bmQ6ICcjZmZmJyB9fT5cclxuICAgICAgICAgICAgICB7cm91dGVTdWdnZXN0aW9ucy5tYXAoKHIsIGkpID0+IChcclxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBvbkNsaWNrPXsoKSA9PiBzZWxlY3RSb3V0ZShyKX0gc3R5bGU9e3sgcGFkZGluZzogJzRweCA4cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlZWUnIH19IG9uTW91c2VPdmVyPXtlID0+IChlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZCA9ICcjZjBmMGYwJyl9IG9uTW91c2VPdXQ9e2UgPT4gKGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kID0gJyNmZmYnKX0+XHJcbiAgICAgICAgICAgICAgICAgIHtyLnJvdXRlSWR9IHtyLnJvdXRlTmFtZSA/IGAoJHtyLnJvdXRlTmFtZX0pYCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICB7LyogUm91dGUgcGljayBkaXNhbWJpZ3VhdGlvbiAqL31cclxuICAgICAgICAgIHtyb3V0ZVBpY2tDYW5kaWRhdGVzICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgIzAwNzljMScsIGJvcmRlclJhZGl1czogJzRweCcsIHBhZGRpbmc6ICc4cHgnLCBiYWNrZ3JvdW5kOiAnI2U4ZjRmZCcsIG1hcmdpblRvcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzRweCcgfX0+TXVsdGlwbGUgcm91dGVzIGZvdW5kIOKAlCBzZWxlY3Qgb25lOjwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWF4SGVpZ2h0OiAnMTQwcHgnLCBvdmVyZmxvdzogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgICAgICAge3JvdXRlUGlja0NhbmRpZGF0ZXMubWFwKChjLCBpKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24ga2V5PXtpfSB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRSb3V0ZUlkKGMucm91dGVJZCk7IHNldFJvdXRlTmFtZShjLnJvdXRlTmFtZSk7IHNldFJvdXRlUGlja0NhbmRpZGF0ZXMobnVsbCk7IGZldGNoUm91dGVNZWFzdXJlcyhjLnJvdXRlSWQpIH19IG9uTW91c2VFbnRlcj17KCkgPT4geyBzaG93Um91dGVQcmV2aWV3UmVmLmN1cnJlbnQoYy5yb3V0ZUlkKSB9fSBvbk1vdXNlTGVhdmU9eygpID0+IHsgY2xlYXJSb3V0ZVByZXZpZXcoKSB9fSBzdHlsZT17eyBkaXNwbGF5OiAnYmxvY2snLCB3aWR0aDogJzEwMCUnLCB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzZweCAxMHB4JywgbWFyZ2luQm90dG9tOiAnM3B4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNkZGQnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFdlaWdodDogNTAwIH19PntjLnJvdXRlTmFtZX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAge2Mucm91dGVOYW1lICE9PSBjLnJvdXRlSWQgJiYgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjODg4JywgbWFyZ2luTGVmdDogJzhweCcgfX0+e2Mucm91dGVJZH08L3NwYW4+fVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgey8qIE1lYXN1cmUgcmFuZ2UgaW5wdXRzICovfVxyXG4gICAgICAgICAge3JvdXRlSWQgJiYgcm91dGVNZWFzdXJlUmFuZ2UgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzhweCcsIHBhZGRpbmc6ICc4cHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZicsIGJvcmRlclJhZGl1czogJzRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZTBlMGUwJyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzMzMycgfX0+TWVhc3VyZSBSYW5nZTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0RnJvbU1lYXN1cmUocm91dGVNZWFzdXJlUmFuZ2UubWluLnRvRml4ZWQoMykpOyBzZXRUb01lYXN1cmUocm91dGVNZWFzdXJlUmFuZ2UubWF4LnRvRml4ZWQoMykpOyBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ2Zyb20nLCByb3V0ZU1lYXN1cmVSYW5nZS5taW4udG9GaXhlZCgzKSk7IHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgndG8nLCByb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKSkgfX0gc3R5bGU9e3sgcGFkZGluZzogJzNweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzAwNzljMScsIGJvcmRlclJhZGl1czogJzNweCcsIGJhY2tncm91bmQ6ICcjZThmNGZkJywgY29sb3I6ICcjMDA3OWMxJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTBweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5XaG9sZSBSb3V0ZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICB7LyogRnJvbSBtZWFzdXJlICovfVxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM2NjYnLCBkaXNwbGF5OiAnYmxvY2snLCBtYXJnaW5Cb3R0b206ICcycHgnIH19PkZyb217cm91dGVNZWFzdXJlUmFuZ2UgPyA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyNhYWEnLCBtYXJnaW5MZWZ0OiAnNHB4JyB9fT4oe3JvdXRlTWVhc3VyZVJhbmdlLm1pbi50b0ZpeGVkKDMpfSk8L3NwYW4+IDogbnVsbH08L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IGlmIChwaWNraW5nTWVhc3VyZSA9PT0gJ2Zyb20nKSBjYW5jZWxQaWNrTWVhc3VyZSgpOyBlbHNlIHN0YXJ0UGlja01lYXN1cmUoJ2Zyb20nKSB9fSB0aXRsZT17cGlja2luZ01lYXN1cmUgPT09ICdmcm9tJyA/ICdDYW5jZWwnIDogJ1BpY2sgZnJvbSBtYXAnfSBzdHlsZT17eyB3aWR0aDogJzI4cHgnLCBoZWlnaHQ6ICcyOHB4JywgcGFkZGluZzogMCwgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6IHBpY2tpbmdNZWFzdXJlID09PSAnZnJvbScgPyAnI2ZmZjNlMCcgOiAnI2ZmZicsIGZsZXhTaHJpbms6IDAsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3BpY2tpbmdNZWFzdXJlID09PSAnZnJvbScgPyAnXFx1MjMxNicgOiAnXFx1MjFBNSd9XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIHZhbHVlPXtmcm9tTWVhc3VyZX0gb25DaGFuZ2U9e2UgPT4gc2V0RnJvbU1lYXN1cmUoZS50YXJnZXQudmFsdWUpfSBvbkJsdXI9eygpID0+IHsgaWYgKGZyb21NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ2Zyb20nLCBmcm9tTWVhc3VyZSkgfX0gb25LZXlEb3duPXtlID0+IHsgaWYgKGUua2V5ID09PSAnRW50ZXInICYmIGZyb21NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ2Zyb20nLCBmcm9tTWVhc3VyZSkgfX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTJweCcgfX0gcGxhY2Vob2xkZXI9e3JvdXRlTWVhc3VyZVJhbmdlID8gcm91dGVNZWFzdXJlUmFuZ2UubWluLnRvRml4ZWQoMykgOiAnU3RhcnQnfSAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIHsvKiBUbyBtZWFzdXJlICovfVxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9e3sgZm9udFNpemU6ICcxMHB4JywgY29sb3I6ICcjNjY2JywgZGlzcGxheTogJ2Jsb2NrJywgbWFyZ2luQm90dG9tOiAnMnB4JyB9fT5Ub3tyb3V0ZU1lYXN1cmVSYW5nZSA/IDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnI2FhYScsIG1hcmdpbkxlZnQ6ICc0cHgnIH19Pih7cm91dGVNZWFzdXJlUmFuZ2UubWF4LnRvRml4ZWQoMyl9KTwvc3Bhbj4gOiBudWxsfTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgaWYgKHBpY2tpbmdNZWFzdXJlID09PSAndG8nKSBjYW5jZWxQaWNrTWVhc3VyZSgpOyBlbHNlIHN0YXJ0UGlja01lYXN1cmUoJ3RvJykgfX0gdGl0bGU9e3BpY2tpbmdNZWFzdXJlID09PSAndG8nID8gJ0NhbmNlbCcgOiAnUGljayBmcm9tIG1hcCd9IHN0eWxlPXt7IHdpZHRoOiAnMjhweCcsIGhlaWdodDogJzI4cHgnLCBwYWRkaW5nOiAwLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogcGlja2luZ01lYXN1cmUgPT09ICd0bycgPyAnI2ZmZjNlMCcgOiAnI2ZmZicsIGZsZXhTaHJpbms6IDAsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3BpY2tpbmdNZWFzdXJlID09PSAndG8nID8gJ1xcdTIzMTYnIDogJ1xcdTIxQTUnfVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiB2YWx1ZT17dG9NZWFzdXJlfSBvbkNoYW5nZT17ZSA9PiBzZXRUb01lYXN1cmUoZS50YXJnZXQudmFsdWUpfSBvbkJsdXI9eygpID0+IHsgaWYgKHRvTWVhc3VyZSkgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCd0bycsIHRvTWVhc3VyZSkgfX0gb25LZXlEb3duPXtlID0+IHsgaWYgKGUua2V5ID09PSAnRW50ZXInICYmIHRvTWVhc3VyZSkgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCd0bycsIHRvTWVhc3VyZSkgfX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTJweCcgfX0gcGxhY2Vob2xkZXI9e3JvdXRlTWVhc3VyZVJhbmdlID8gcm91dGVNZWFzdXJlUmFuZ2UubWF4LnRvRml4ZWQoMykgOiAnRW5kJ30gLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogRHJhdyBwb2x5Z29uIG1vZGUgKi99XHJcbiAgICAgIHtzZWFyY2hNb2RlID09PSAnbWFwJyAmJiAoXHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3N0YXJ0RHJhd0FyZWF9IGRpc2FibGVkPXtkcmF3aW5nfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBkcmF3aW5nID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjb2xvcjogJyMwMDc5YzEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNTAwIH19PlxyXG4gICAgICAgICAgICB7ZHJhd2luZyA/ICdEcmF3aW5nLi4uIGNsaWNrIHRvIGNvbXBsZXRlJyA6IGBEcmF3IFBvbHlnb24gb24gTWFwJHttYXBSb3V0ZXMubGVuZ3RoID4gMCA/IGAgKCR7bWFwUm91dGVzLmxlbmd0aH0gcm91dGVzIGZvdW5kKWAgOiAnJ31gfVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICB7bWFwUm91dGVzLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzMzMycgfX0+XHJcbiAgICAgICAgICAgICAgPHN0cm9uZz57c2VsZWN0ZWRNYXBSb3V0ZUlkcy5zaXplfTwvc3Ryb25nPiBvZiB7bWFwUm91dGVzLmxlbmd0aH0gcm91dGVzIHNlbGVjdGVkXHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxuXHJcbiAgLy8gUmVzdWx0IHZpZXdcclxuICBjb25zdCByZXN1bHRVSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PlxyXG4gICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMzZweCcgfX0+eydcXHUyNzA1J308L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzEzcHgnLCBjb2xvcjogJyMzMzMnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBtYXJnaW46ICcwIDAgMTJweCcgfX0+XHJcbiAgICAgICAgUHJlZGljdGlvbiBjb21wbGV0ZSEgUmlzayBsYXllciBhZGRlZCB0byBtYXAuXHJcbiAgICAgIDwvcD5cclxuXHJcbiAgICAgIHsvKiBMZWdlbmQgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEwcHgnLCBiYWNrZ3JvdW5kOiAnI2Y1ZjVmNScsIGJvcmRlclJhZGl1czogJzRweCcsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PlxyXG4gICAgICAgIHtbeyBjb2xvcjogJyMzODhlM2MnLCB3aWR0aDogMywgbGFiZWw6ICdMb3cgKDEtMjUpJyB9LCB7IGNvbG9yOiAnI2ZiYzAyZCcsIHdpZHRoOiAzLCBsYWJlbDogJ01lZGl1bSAoMjYtNTApJyB9LCB7IGNvbG9yOiAnI2Y1N2MwMCcsIHdpZHRoOiA0LCBsYWJlbDogJ01lZGl1bS1IaWdoICg1MS03NSknIH0sIHsgY29sb3I6ICcjZDMyZjJmJywgd2lkdGg6IDUsIGxhYmVsOiAnSGlnaCAoNzYtMTAwKScgfV0ubWFwKChpdGVtLCBpKSA9PiAoXHJcbiAgICAgICAgICA8ZGl2IGtleT17aX0gc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JywgbWFyZ2luQm90dG9tOiBpIDwgMyA/ICc0cHgnIDogMCB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzIwcHgnLCBoZWlnaHQ6IGAke2l0ZW0ud2lkdGh9cHhgLCBiYWNrZ3JvdW5kOiBpdGVtLmNvbG9yIH19IC8+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcgfX0+e2l0ZW0ubGFiZWx9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAge3Jlc3VsdD8uaXRlbVVybCAmJiA8YSBocmVmPXtyZXN1bHQuaXRlbVVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIHN0eWxlPXt7IGRpc3BsYXk6ICdibG9jaycsIHRleHRBbGlnbjogJ2NlbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzAwNzljMScsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19Pk9wZW4gaW4gUG9ydGFsPC9hPn1cclxuXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc4cHgnLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGZsZXhXcmFwOiAnd3JhcCcgfX0+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd0V4cGxhbmF0aW9uKCFzaG93RXhwbGFuYXRpb24pfSBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDE2cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzZhMWI5YScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNob3dFeHBsYW5hdGlvbiA/ICcjZjNlNWY1JyA6ICcjZmZmJywgY29sb3I6ICcjNmExYjlhJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgIHtzaG93RXhwbGFuYXRpb24gPyAnSGlkZScgOiAnV2h5Pyd9XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17Y2xlYXJBbGx9IHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMTZweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZDMyZjJmJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBjb2xvcjogJyNkMzJmMmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwIH19PkNsZWFyPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRNb2RlKCdjaG9vc2UnKTsgc2V0UmVzdWx0KG51bGwpOyBzZXRQcm9ncmVzcygnJyk7IHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSkgfX0gc3R5bGU9e3sgcGFkZGluZzogJzhweCAyMHB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjNmExYjlhJywgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5Eb25lPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgey8qIEV4cGxhbmF0aW9uIHBhbmVsICovfVxyXG4gICAgICB7c2hvd0V4cGxhbmF0aW9uICYmIG1vZGUgPT09ICdhaScgJiYgZmFjdG9ycyAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICcxMnB4JywgcGFkZGluZzogJzEycHgnLCBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsIGJvcmRlclJhZGl1czogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIG1heEhlaWdodDogJzMyMHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDcwMCwgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5SaXNrIEZhY3RvciBBbmFseXNpczwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBDcmFzaCBzdGF0cyBzdW1tYXJ5ICovfVxyXG4gICAgICAgICAge2NyYXNoU3RhdHMgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzEwcHgnLCBwYWRkaW5nOiAnOHB4JywgYmFja2dyb3VuZDogJyNmZmYzZTAnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBib3JkZXJMZWZ0OiAnM3B4IHNvbGlkICNlNjUxMDAnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNjAwLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19PvCfk40ge2NyYXNoU3RhdHMudG90YWxDcmFzaGVzfSBjcmFzaCBldmVudHMgYW5hbHl6ZWQ8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIHsvKiBUb3AgY29ycmVsYXRpbmcgZXZlbnQgdHlwZXMgKi99XHJcbiAgICAgICAgICB7Y3Jhc2hTdGF0cz8udG9wQ29ycmVsYXRpb25zPy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICcxMHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDYwMCwgbWFyZ2luQm90dG9tOiAnNnB4JyB9fT5Ub3AgQ29udHJpYnV0aW5nIEZhY3RvcnM6PC9kaXY+XHJcbiAgICAgICAgICAgICAge2NyYXNoU3RhdHMudG9wQ29ycmVsYXRpb25zLnNsaWNlKDAsIDIpLm1hcCgoYywgaSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaWNvbiA9IC9jdXJ2ZXxhbGlnbi9pLnRlc3QoYy5sYXllcikgPyAn8J+UhCcgOiAvc3BlZWQvaS50ZXN0KGMubGF5ZXIpID8gJ+KaoScgOiAvZ3JhZGV8c2xvcGUvaS50ZXN0KGMubGF5ZXIpID8gJ+KbsO+4jycgOiAvc2hvdWxkZXJ8d2lkdGgvaS50ZXN0KGMubGF5ZXIpID8gJ/Cfk48nIDogL3N1cmZhY2V8cGF2ZW1lbnQvaS50ZXN0KGMubGF5ZXIpID8gJ/Cfm6PvuI8nIDogL3NpZ258c2lnbmFsL2kudGVzdChjLmxheWVyKSA/ICfwn5qmJyA6IC9sYW5lL2kudGVzdChjLmxheWVyKSA/ICfwn5uk77iPJyA6IC9icmlkZ2V8c3RydWN0L2kudGVzdChjLmxheWVyKSA/ICfwn4yJJyA6IGkgPT09IDAgPyAn8J+UtCcgOiAn8J+foCdcclxuICAgICAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnLCBwYWRkaW5nOiAnNnB4IDhweCcsIGJhY2tncm91bmQ6IGkgPT09IDAgPyAnI2ZjZTRlYycgOiAnI2ZmZjhlMScsIGJvcmRlclJhZGl1czogJzRweCcsIG1hcmdpbkJvdHRvbTogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxOHB4JyB9fT57aWNvbn08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmbGV4OiAxIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA2MDAsIGZvbnRTaXplOiAnMTFweCcgfX0+e2MubGF5ZXJ9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIGNvbG9yOiAnIzU1NScgfX0+e2MudmFsdWV9PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdyaWdodCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDcwMCwgZm9udFNpemU6ICcxM3B4JywgY29sb3I6ICcjZDMyZjJmJyB9fT57Yy5wY3R9JTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzlweCcsIGNvbG9yOiAnIzc3NycgfX0+b2YgaGlnaC1yaXNrPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgIH0pfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM1NTUnIH19PlxyXG4gICAgICAgICAgICBLZXJuZWwtZGVuc2l0eSBzY29yaW5nIChyYWRpdXM6IHtmYWN0b3JzLmtlcm5lbFJhZGl1c30gc2VnbWVudHMpLiBTZWdtZW50czoge2ZhY3RvcnMudG90YWxTZWdtZW50c30gdG90YWwsIHtmYWN0b3JzLnNlZ21lbnRzV2l0aENyYXNoZXN9IHdpdGggY3Jhc2hlcywge2ZhY3RvcnMuaGlnaFJpc2tDb3VudH0gaGlnaC1yaXNrLlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7ZmFjdG9ycy50b3BIaWdoUmlza1NlZ21lbnRzPy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8c3Ryb25nPlRvcCBIaWdoLVJpc2sgU2VnbWVudHM6PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLCBmb250U2l6ZTogJzEwcHgnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkPjx0ciBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2VlZScgfX0+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JyB9fT5Sb3V0ZTwvdGg+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+TWlsZXM8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PkNyYXNoZXM8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PlNjb3JlPC90aD48L3RyPjwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8dGJvZHk+e2ZhY3RvcnMudG9wSGlnaFJpc2tTZWdtZW50cy5zbGljZSgwLCA1KS5tYXAoKHM6IGFueSwgaTogbnVtYmVyKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9Pjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcgfX0+e3Mucm91dGVJZD8uc3Vic3RyaW5nKDAsIDE1KX08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT57cy5mcm9tTT8udG9GaXhlZCgxKX0te3MudG9NPy50b0ZpeGVkKDEpfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PntzLmNyYXNoQ291bnR9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcsIGNvbG9yOiAnI2QzMmYyZicsIGZvbnRXZWlnaHQ6IDcwMCB9fT57cy5yaXNrU2NvcmV9PC90ZD48L3RyPlxyXG4gICAgICAgICAgICAgICAgKSl9PC90Ym9keT5cclxuICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7c2hvd0V4cGxhbmF0aW9uICYmIG1vZGUgPT09ICdtbCcgJiYgbW9kZWxJbmZvICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzEycHgnLCBwYWRkaW5nOiAnMTJweCcsIGJhY2tncm91bmQ6ICcjZmFmNWZjJywgYm9yZGVyUmFkaXVzOiAnNnB4JywgZm9udFNpemU6ICcxMXB4JywgbWF4SGVpZ2h0OiAnMjgwcHgnLCBvdmVyZmxvd1k6ICdhdXRvJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNzAwLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBjb2xvcjogJyM0YTE0OGMnIH19PlN0YXRlIERhdGEgTW9kZWwgRXhwbGFuYXRpb248L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz5NZXRob2Q6PC9zdHJvbmc+IFdlaWdodC1vZi1FdmlkZW5jZSBzY29yaW5nIGZyb20ge21vZGVsSW5mby50b3RhbENyYXNoZXM/LnRvTG9jYWxlU3RyaW5nKCl9IHJlYWwgTlkgc3RhdGUgY3Jhc2ggcmVjb3JkcyAoe21vZGVsSW5mby55ZWFyc30pLiBFYWNoIHJvYWQgY29uZGl0aW9uIGdldHMgYSBjcmFzaCBtdWx0aXBsaWVyIGJhc2VkIG9uIGl0cyBzdGF0aXN0aWNhbCBhc3NvY2lhdGlvbiB3aXRoIGZhdGFsIGNyYXNoZXMuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz52cy4gQUkgKERlbnNpdHkpOjwvc3Ryb25nPiBBSSBmaW5kcyBleGlzdGluZyBob3RzcG90cy4gTUwgcHJlZGljdHMgPGVtPm5ldzwvZW0+IHJpc2sgZnJvbSByb2FkIGNoYXJhY3RlcmlzdGljcyBhbG9uZSDigJQgZGFuZ2Vyb3VzIGNvbmRpdGlvbnMgd2hlcmUgbm8gY3Jhc2hlcyBoYXZlIGJlZW4gcmVwb3J0ZWQgeWV0LlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7T2JqZWN0LmtleXMobW9kZWxJbmZvLndlaWdodHMgfHwge30pLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxzdHJvbmc+VG9wIFJpc2sgTXVsdGlwbGllcnMgRm91bmQ6PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLCBmb250U2l6ZTogJzEwcHgnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkPjx0ciBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2VlZScgfX0+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JyB9fT5GYWN0b3I8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAnbGVmdCcgfX0+VmFsdWU8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PldlaWdodDwvdGg+PC90cj48L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRib2R5PntPYmplY3QuZW50cmllcyhtb2RlbEluZm8ud2VpZ2h0cykuZmxhdE1hcCgoW2ZpZWxkLCB2YWxzXTogW3N0cmluZywgYW55XSkgPT4gT2JqZWN0LmVudHJpZXModmFscykubWFwKChbdmFsLCB3XTogW3N0cmluZywgYW55XSkgPT4gKHsgZmllbGQsIHZhbCwgdyB9KSkpLmZpbHRlcigoeDogYW55KSA9PiB4LncgPiAxLjApLnNvcnQoKGE6IGFueSwgYjogYW55KSA9PiBiLncgLSBhLncpLnNsaWNlKDAsIDEwKS5tYXAoKHg6IGFueSwgaTogbnVtYmVyKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9Pjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcgfX0+e3guZmllbGR9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+e3gudmFsfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnLCBjb2xvcjogeC53ID49IDIgPyAnI2QzMmYyZicgOiAnI2Y1N2MwMCcsIGZvbnRXZWlnaHQ6IDcwMCB9fT57eC53LnRvRml4ZWQoMSl9eDwvdGQ+PC90cj5cclxuICAgICAgICAgICAgICAgICkpfTwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICc4cHgnLCBwYWRkaW5nOiAnNnB4JywgYmFja2dyb3VuZDogJyNmZmYzY2QnLCBib3JkZXJSYWRpdXM6ICczcHgnLCBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM4NTY0MDQnIH19PlxyXG4gICAgICAgICAgICA8c3Ryb25nPk5vdGU6PC9zdHJvbmc+IFNlZ21lbnRzIHdpdGggbXVsdGlwbGUgaGlnaC13ZWlnaHQgZmFjdG9ycyBjb21wb3VuZCAobXVsdGlwbHkpLiBBIGN1cnZlICsgaGlnaCBzcGVlZCArIG5vIHNob3VsZGVyID0gdmVyeSBoaWdoIHJpc2sgZXZlbiB3aXRoIG5vIGxvY2FsIGNyYXNoIGhpc3RvcnkuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxuXHJcbiAgLy8gUnVubmluZyBzdGF0ZSBVSVxyXG4gIGNvbnN0IHJ1bm5pbmdVSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzIwcHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzU1NScsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+e3Byb2dyZXNzfTwvZGl2PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogJzRweCcsIGJhY2tncm91bmQ6ICcjZTBlMGUwJywgYm9yZGVyUmFkaXVzOiAnMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAnMTAwJScsIGJhY2tncm91bmQ6IG1vZGUgPT09ICdhaScgPyAnIzdiMWZhMicgOiAnIzZhMWI5YScsIHdpZHRoOiAnNjAlJywgYW5pbWF0aW9uOiAncHVsc2UgMS41cyBpbmZpbml0ZScgfX0gLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IE1BSU4gTEFZT1VUID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGhlaWdodDogJzEwMCUnLCBvdmVyZmxvdzogJ2F1dG8nLCBmb250U2l6ZTogJzEzcHgnLCBwYWRkaW5nOiAnMTJweCcsIGJveFNpemluZzogJ2JvcmRlci1ib3gnIH19PlxyXG5cclxuICAgICAge2hhc01hcFdpZGdldCAmJiAoXHJcbiAgICAgICAgPEppbXVNYXBWaWV3Q29tcG9uZW50IHVzZU1hcFdpZGdldElkPXsocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LlswXSB8fCAocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LmZpcnN0Py4oKX0gb25BY3RpdmVWaWV3Q2hhbmdlPXtvbkFjdGl2ZVZpZXdDaGFuZ2V9IC8+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICA8aDUgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDEycHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+Q3Jhc2ggUmlzayBQcmVkaWN0aW9uIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIGZvbnRXZWlnaHQ6IDQwMCwgY29sb3I6ICcjOTk5JyB9fT4odjIwMjYuMDUuMTQgMDk6MTUpPC9zcGFuPjwvaDU+XHJcblxyXG4gICAgICB7LyogRXJyb3IgZGlzcGxheSAqL31cclxuICAgICAge2Vycm9yICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIHBhZGRpbmc6ICc4cHggMTBweCcsIGJhY2tncm91bmQ6ICcjZmZlYmVlJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjYzYyODI4JyB9fT5cclxuICAgICAgICAgIHtlcnJvcn1cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldEVycm9yKG51bGwpfSBzdHlsZT17eyBmbG9hdDogJ3JpZ2h0JywgYmFja2dyb3VuZDogJ25vbmUnLCBib3JkZXI6ICdub25lJywgY29sb3I6ICcjYzYyODI4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRXZWlnaHQ6IDcwMCB9fT57J1xcdTAwRDcnfTwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09IENIT09TRSBNT0RFID09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7bW9kZSA9PT0gJ2Nob29zZScgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMTJweCcgfX0+XHJcblxyXG4gICAgICAgICAgey8qIEFJIE9wdGlvbiAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBiYWNrZ3JvdW5kOiAnI2YzZTVmNScsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2U5M2Q4JyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMjBweCcgfX0+eydcXHVEODNFXFx1RERFMCd9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNzAwLCBjb2xvcjogJyM0YTE0OGMnIH19PkFJIFByZWRpY3Rpb248L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd0FJSGVscCghc2hvd0FJSGVscCl9IHN0eWxlPXt7IHdpZHRoOiAnMjRweCcsIGhlaWdodDogJzI0cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzdiMWZhMicsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmQ6IHNob3dBSUhlbHAgPyAnIzdiMWZhMicgOiAnI2ZmZicsIGNvbG9yOiBzaG93QUlIZWxwID8gJyNmZmYnIDogJyM3YjFmYTInLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNzAwLCBsaW5lSGVpZ2h0OiAnMjJweCcsIHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6IDAgfX0+PzwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNjY2JywgbWFyZ2luOiAnMCAwIDEwcHgnIH19Pktlcm5lbC1kZW5zaXR5IHNjb3JpbmcgZnJvbSBjcmFzaCBjbHVzdGVycyArIHJvYWQgYXR0cmlidXRlczwvcD5cclxuICAgICAgICAgICAge3Nob3dBSUhlbHAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEwcHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZicsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTFweCcsIGxpbmVIZWlnaHQ6ICcxLjcnLCBtYXJnaW5Cb3R0b206ICcxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMWJlZTcnIH19PlxyXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Ib3cgaXQgd29ya3M6PC9zdHJvbmc+PGJyIC8+XHJcbiAgICAgICAgICAgICAgICAxLiBZb3Ugc2VsZWN0IHJvdXRlcyAoYnkgSUQsIG5hbWUsIG1hcCBjbGljaywgb3IgZHJhdyBhcmVhKTxiciAvPlxyXG4gICAgICAgICAgICAgICAgMi4gVGhlIHdpZGdldCBxdWVyaWVzIDxlbT5jcmFzaCBldmVudHM8L2VtPiBhbmQgPGVtPnJvYWQgYXR0cmlidXRlIGV2ZW50czwvZW0+IGZyb20geW91ciBMUlM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDMuIFJvdXRlcyBhcmUgZGl2aWRlZCBpbnRvIDAuNS1taWxlIHNlZ21lbnRzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA0LiBDcmFzaCBjb3VudHMgcGVyIHNlZ21lbnQgYXJlIGNvbXB1dGVkPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA1LiBBIGtlcm5lbC1kZW5zaXR5IGFsZ29yaXRobSBzcHJlYWRzIGluZmx1ZW5jZSBmcm9tIGhpZ2gtY3Jhc2ggc2VnbWVudHMgdG8gbmVpZ2hib3JzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA2LiBSb2FkIGF0dHJpYnV0ZXMgKGN1cnZlcywgZ3JhZGVzLCBldGMuKSBlbnJpY2ggdGhlIGFuYWx5c2lzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA3LiBBIGNvbG9yLWNvZGVkIHJpc2sgbGF5ZXIgaXMgcHVibGlzaGVkIHRvIHlvdXIgcG9ydGFsIGFuZCBhZGRlZCB0byB0aGUgbWFwPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+QmVzdCBmb3I6PC9zdHJvbmc+IEZpbmRpbmcgZXhpc3RpbmcgY3Jhc2ggaG90c3BvdHMgYW5kIG5lYXJieSByaXNrIHpvbmVzLlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdhaScpfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMTBweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnIzdiMWZhMicsIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICAgICAgUnVuIEFJIFByZWRpY3Rpb25cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogTUwgT3B0aW9uICovfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCcsIGJhY2tncm91bmQ6ICcjZWRlN2Y2JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNiMzlkZGInIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcyMHB4JyB9fT57J1xcdUQ4M0RcXHVEQ0NBJ308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzMxMWI5MicgfX0+TUwgUHJlZGljdGlvbjwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93TUxIZWxwKCFzaG93TUxIZWxwKX0gc3R5bGU9e3sgd2lkdGg6ICcyNHB4JywgaGVpZ2h0OiAnMjRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjNmExYjlhJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZDogc2hvd01MSGVscCA/ICcjNmExYjlhJyA6ICcjZmZmJywgY29sb3I6IHNob3dNTEhlbHAgPyAnI2ZmZicgOiAnIzZhMWI5YScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA3MDAsIGxpbmVIZWlnaHQ6ICcyMnB4JywgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogMCB9fT4/PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM2NjYnLCBtYXJnaW46ICcwIDAgMTBweCcgfX0+UHJlLWNvbXB1dGVkIHdlaWdodHMgZnJvbSAxLjVNIE5ZIFN0YXRlIGNyYXNoIHJlY29yZHM8L3A+XHJcbiAgICAgICAgICAgIHtzaG93TUxIZWxwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzExcHgnLCBsaW5lSGVpZ2h0OiAnMS43JywgbWFyZ2luQm90dG9tOiAnMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZDFjNGU5JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+SG93IGl0IHdvcmtzOjwvc3Ryb25nPjxiciAvPlxyXG4gICAgICAgICAgICAgICAgMS4gWW91IHNlbGVjdCByb3V0ZXMgKGJ5IElELCBuYW1lLCBtYXAgY2xpY2ssIG9yIGRyYXcgYXJlYSk8YnIgLz5cclxuICAgICAgICAgICAgICAgIDIuIFRoZSB3aWRnZXQgcXVlcmllcyA8ZW0+cm9hZCBjaGFyYWN0ZXJpc3RpYyBldmVudHM8L2VtPiBmcm9tIHlvdXIgTFJTIChjdXJ2ZXMsIGdyYWRlcywgc3BlZWQgbGltaXRzLCBsYW5lIGNvdW50cywgc2hvdWxkZXJzLCBldGMuKTxiciAvPlxyXG4gICAgICAgICAgICAgICAgMy4gRWFjaCAwLjUtbWlsZSBzZWdtZW50J3Mgcm9hZCBjb25kaXRpb25zIGFyZSBtYXRjaGVkIHRvIHByZS1jb21wdXRlZCByaXNrIG11bHRpcGxpZXJzIGZyb20gMSw1MjUsMTIzIHJlYWwgTlkgc3RhdGUgY3Jhc2ggcmVjb3JkczxiciAvPlxyXG4gICAgICAgICAgICAgICAgNC4gRmFjdG9ycyBjb21wb3VuZCDigJQgYSBjdXJ2ZSArIGhpZ2ggc3BlZWQgKyBubyBzaG91bGRlciA9IHZlcnkgaGlnaCByaXNrPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA1LiBBIGNvbG9yLWNvZGVkIHByZWRpY3Rpb24gbGF5ZXIgaXMgcHVibGlzaGVkIGFuZCBhZGRlZCB0byB0aGUgbWFwPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+QmVzdCBmb3I6PC9zdHJvbmc+IFByZWRpY3RpbmcgPGVtPm5ldzwvZW0+IHJpc2sgZnJvbSByb2FkIGNoYXJhY3RlcmlzdGljcyBhbG9uZSDigJQgZmluZGluZyBkYW5nZXJvdXMgY29uZGl0aW9ucyBldmVuIHdoZXJlIG5vIGNyYXNoZXMgaGF2ZSBiZWVuIHJlcG9ydGVkIHlldC5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnbWwnKX0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzEwcHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyM2YTFiOWEnLCBjb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNjAwIH19PlxyXG4gICAgICAgICAgICAgIFJ1biBNTCBQcmVkaWN0aW9uXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT0gQUkgLyBNTCBXT1JLRkxPVyA9PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAgeyhtb2RlID09PSAnYWknIHx8IG1vZGUgPT09ICdtbCcpICYmICFyZXN1bHQgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMTJweCcgfX0+XHJcblxyXG4gICAgICAgICAgey8qIEJhY2sgYnV0dG9uICovfVxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRNb2RlKCdjaG9vc2UnKTsgc2V0RXJyb3IobnVsbCk7IHNldFByb2dyZXNzKCcnKSB9fSBkaXNhYmxlZD17cnVubmluZ30gc3R5bGU9e3sgYWxpZ25TZWxmOiAnZmxleC1zdGFydCcsIHBhZGRpbmc6ICc0cHggMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNTU1JyB9fT5cclxuICAgICAgICAgICAgeydcXHUyMTkwJ30gQmFja1xyXG4gICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDEycHgnLCBiYWNrZ3JvdW5kOiBtb2RlID09PSAnYWknID8gJyNmM2U1ZjUnIDogJyNlZGU3ZjYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiBtb2RlID09PSAnYWknID8gJyM0YTE0OGMnIDogJyMzMTFiOTInIH19PlxyXG4gICAgICAgICAgICB7bW9kZSA9PT0gJ2FpJyA/ICdcXHVEODNFXFx1RERFMCBBSSBQcmVkaWN0aW9uJyA6ICdcXHVEODNEXFx1RENDQSBNTCBQcmVkaWN0aW9uJ31cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBSb3V0ZSBzZWxlY3Rpb24gKi99XHJcbiAgICAgICAgICB7IXJ1bm5pbmcgJiYgcm91dGVTZWxlY3Rpb25VSSgpfVxyXG5cclxuICAgICAgICAgIHsvKiBSdW4gYnV0dG9uICovfVxyXG4gICAgICAgICAgeyFydW5uaW5nICYmIChcclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17bW9kZSA9PT0gJ2FpJyA/IHJ1bkFJUHJlZGljdGlvbiA6IHJ1bk1MUHJlZGljdGlvbn0gZGlzYWJsZWQ9e3J1bm5pbmcgfHwgKHNlYXJjaE1vZGUgIT09ICdtYXAnICYmICFyb3V0ZUlkLnRyaW0oKSkgfHwgKHNlYXJjaE1vZGUgPT09ICdtYXAnICYmIHNlbGVjdGVkTWFwUm91dGVJZHMuc2l6ZSA9PT0gMCl9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcxMnB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IChydW5uaW5nIHx8IChzZWFyY2hNb2RlICE9PSAnbWFwJyAmJiAhcm91dGVJZC50cmltKCkpIHx8IChzZWFyY2hNb2RlID09PSAnbWFwJyAmJiBzZWxlY3RlZE1hcFJvdXRlSWRzLnNpemUgPT09IDApKSA/ICcjYWFhJyA6IChtb2RlID09PSAnYWknID8gJyM3YjFmYTInIDogJyM2YTFiOWEnKSwgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgICAgICB7bW9kZSA9PT0gJ2FpJyA/ICdSdW4gQUkgUHJlZGljdGlvbicgOiAnUnVuIE1MIFByZWRpY3Rpb24nfVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgey8qIFByb2dyZXNzICovfVxyXG4gICAgICAgICAge3J1bm5pbmcgJiYgcnVubmluZ1VJKCl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT0gUkVTVUxUID09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7cmVzdWx0ICYmIHJlc3VsdFVJKCl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpZGdldFxyXG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9