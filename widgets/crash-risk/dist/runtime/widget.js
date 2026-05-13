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
        predictionLayer.when(() => {
            predictionLayer.queryExtent().then((r) => {
                if (r.extent)
                    view.goTo(r.extent.expand(1.2));
            });
        });
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
    }), [config, queryEventData, selectedFolderId, displayPredictionOnMap]);
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
        var _a, _b;
        return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '12px' } },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { textAlign: 'center', marginBottom: '12px' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '36px' } }, '\u2705')),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: { fontSize: '13px', color: '#333', textAlign: 'center', margin: '0 0 12px' } }, "Prediction complete! Risk layer added to map."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { padding: '10px', background: '#f5f5f5', borderRadius: '4px', marginBottom: '12px' } }, [{ color: '#388e3c', width: 3, label: 'Low (1-25)' }, { color: '#fbc02d', width: 3, label: 'Medium (26-50)' }, { color: '#f57c00', width: 4, label: 'Medium-High (51-75)' }, { color: '#d32f2f', width: 5, label: 'High (76-100)' }].map((item, i) => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: i < 3 ? '4px' : 0 } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { width: '20px', height: `${item.width}px`, background: item.color } }),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '11px' } }, item.label))))),
            (result === null || result === void 0 ? void 0 : result.itemUrl) && jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("a", { href: result.itemUrl, target: "_blank", rel: "noopener noreferrer", style: { display: 'block', textAlign: 'center', fontSize: '12px', color: '#0079c1', marginBottom: '12px' } }, "Open in Portal"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', gap: '8px', justifyContent: 'center' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => setShowExplanation(!showExplanation), style: { padding: '8px 16px', border: '1px solid #6a1b9a', borderRadius: '4px', background: showExplanation ? '#f3e5f5' : '#fff', color: '#6a1b9a', cursor: 'pointer', fontSize: '12px', fontWeight: 600 } }, showExplanation ? 'Hide' : 'Why?'),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => { setMode('choose'); setResult(null); setProgress(''); setShowExplanation(false); }, style: { padding: '8px 20px', border: 'none', borderRadius: '4px', background: '#6a1b9a', color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 600 } }, "Done")),
            showExplanation && mode === 'ai' && factors && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginTop: '12px', padding: '12px', background: '#f8f9fa', borderRadius: '6px', fontSize: '11px', maxHeight: '250px', overflowY: 'auto' } },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontWeight: 700, marginBottom: '8px' } }, "Risk Factor Analysis"),
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { marginBottom: '8px' } },
                    "Kernel-density scoring (radius: ",
                    factors.kernelRadius,
                    " segments). Segments: ",
                    factors.totalSegments,
                    " total, ",
                    factors.segmentsWithCrashes,
                    " with crashes, ",
                    factors.highRiskCount,
                    " high-risk."),
                ((_a = factors.topHighRiskSegments) === null || _a === void 0 ? void 0 : _a.length) > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", null,
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
                    " Weight-of-Evidence scoring from ", (_b = modelInfo.totalCrashes) === null || _b === void 0 ? void 0 :
                    _b.toLocaleString(),
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
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '10px', fontWeight: 400, color: '#999' } }, "(v2026.05.13 19:48)")),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jcmFzaC1yaXNrL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxZQUFZLEdBQUcsQ0FBQztBQUVwQjs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBRSxHQUFXLEVBQUUsTUFBOEI7SUFDaEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLFlBQVksR0FBRyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxZQUFZLEVBQUUsRUFBRTtRQUM5RCxNQUFNLENBQUMsUUFBUSxHQUFHLFlBQVk7UUFFOUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2pELE1BQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUVoQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLE9BQVEsTUFBYyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLE1BQU0sQ0FBQyxVQUFVO2dCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxDQUFDLENBRUE7UUFBQyxNQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUM3QyxPQUFPLEVBQUU7WUFDVCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FB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RyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbkYsQ0FBQzthQUFNLENBQUM7WUFDTixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ2pDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDckMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztvQkFDdkIsTUFBTSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENB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RyxHQUFHLEVBQUUsVUFBVSxDQUFDO29CQUNqRCxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO29CQUNsQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUM7b0JBQ3RCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM3QyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDakMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNyQyxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDOzRCQUM3QixNQUFNLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEQsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsTUFBSzt3QkFDUCxDQUFDO29CQUNILENBQUM7b0JBQ0QsTUFBTSxJQUFJLEdBQWUsRUFBRTtvQkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzdDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU87NEJBQUUsU0FBUTt3QkFDMUIsSUFBSSxFQUFFLEdBQUcsS0FBSzs0QkFBRSxNQUFLO3dCQUNyQixJQUFJLEVBQUUsSUFBSSxPQUFPLElBQUksRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDOzRCQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkgsQ0FBQzs2QkFBTSxJQUFJLEVBQUUsR0FBRyxPQUFPLElBQUksRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDOzRCQUN4QyxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7NEJBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMzSSxDQUFDO3dCQUNELElBQUksRUFBRSxJQUFJLE9BQU8sSUFBSSxFQUFFLElBQUksS0FBSzs0QkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ2hGLElBQUksRUFBRSxHQUFHLEtBQUssSUFBSSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUM7NEJBQ2xDLE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs0QkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxD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QyxFQUFFLEdBQUcsQ0FBQztvQkFFOUUsYUFBYTtvQkFDYixNQUFNLElBQUksR0FBZSxFQUFFO29CQUMzQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzFCLElBQUksRUFBRSxJQUFJLEtBQUssSUFBSSxFQUFFLElBQUksR0FBRzs0QkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2RCxDQUFDO29CQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQzFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDakMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDckMsSUFBSSxFQUFFLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILENBQUM7NEJBQ0QsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQ0FDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILENBQUM7d0JBQ0gsQ0FBQztvQkFDSCxDQUFDO29CQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO3dCQUFFLFNBQVE7b0JBRTdCLE1BQU0sU0FBUyxHQUFHLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVM7b0JBQzNHLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsbUJBQW1CLEVBQUUsVUFBVSxFQUFFLENBQUM7Z0JBQzFHLENBQUM7WUFDSCxDQUFDO1lBQ0QsSUFBSSxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUM7Z0JBQUUsTUFBTSxJQUFJLEtBQUssQ0FBQyx3QkFBd0IsQ0FBQztZQUVwRSxtQkFBbUI7WUFDbkIsTUFBTSxjQUFjLEdBQTJDLEVBQUU7WUFDakUsS0FBSyxNQUFNLEdBQUcsSUFBSSxRQUFRLEVBQUUsQ0FBQztnQkFDM0IsS0FBSyxNQUFNLENBQUMsSUFBSSxHQUFHLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztvQkFDeEMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQztvQkFDbEQsSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDVixJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFBRSxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRTt3QkFDNUQsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNELENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7WUFDRCxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFFL0YsaUJBQWlCO1lBQ2pCLFdBQVcsQ0FBQyx3Q0FBd0MsQ0FBQztZQUNyRCxNQUFNLFVBQVUsR0FBRyxHQUFHLFNBQVMsK0JBQStCLFFBQVEsRUFBRTtZQUN4RSxNQUFNLFNBQVMsR0FBRyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxVQUFVLElBQUksZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVTtZQUNyRixNQUFNLFdBQVcsR0FBRyxxQkFBcUIsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBRXJELE1BQU0sTUFBTSxHQUFHO2dCQUNiLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRTtnQkFDakUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQ2hGLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRTtnQkFDdEUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFO2dCQUNsRSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRTtnQkFDakYsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7Z0JBQ3BGLEVBQUUsSUFBSSxFQUFFLHNCQUFzQixFQUFFLElBQUksRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtnQkFDekcsRUFBRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLHFCQUFxQixFQUFFLEtBQUssRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO2FBQ2pHO1lBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxlQUFlLEVBQUU7WUFDMUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxrQkFBa0IsRUFBRSxrREFBa0QsRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsZ0JBQWdCLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxhQUFhLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUMxYSxZQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQztZQUNuRCxZQUFZLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxnQkFBZ0IsQ0FBQztZQUNuRCxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7WUFDaEMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO1lBQ25DLElBQUksZ0JBQWdCO2dCQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDO1lBRXZFLE1BQU0sVUFBVSxHQUFHLE1BQU0sS0FBSyxDQUFDLEdBQUcsU0FBUyxnQkFBZ0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDO1lBQ3BHLE1BQU0sWUFBWSxHQUFHLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRTtZQUM1QyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQjtnQkFBRSxNQUFNLElBQUksS0FBSyxDQUFDLDRCQUE0QixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDakgsTUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLGlCQUFpQjtZQUNqRCxNQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsTUFBTTtZQUV0QyxNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLHVCQUF1QixDQUFDO1lBQy9FLE1BQU0sWUFBWSxHQUFHLElBQUksZUFBZSxFQUFFO1lBQzFDLFlBQVksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLHNCQUFzQixFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsb0NBQW9DLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMxUyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLENBQUM7WUFDaEMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO1lBQ25DLE1BQU0sS0FBSyxDQUFDLEdBQUcsUUFBUSxrQkFBa0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxDQUFDO1lBRWxGLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLFFBQVEsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFO2dCQUMzRCxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsR0FBRyxDQUFDLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxHQUFHLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLGdCQUFnQixFQUFFLFNBQVMsS0FBSyxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsb0JBQW9CLEVBQUU7YUFDM1EsQ0FBQyxDQUFDO1lBRUgsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUMvQyxNQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDO2dCQUN6QyxXQUFXLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNyRixNQUFNLGFBQWEsR0FBRyxJQUFJLGVBQWUsRUFBRTtnQkFDM0MsYUFBYSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDdkQsYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDO2dCQUNqQyxhQUFhLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUM7Z0JBQ3BDLE1BQU0sS0FBSyxDQUFDLEdBQUcsVUFBVSxnQkFBZ0IsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxDQUFDO1lBQ3JGLENBQUM7WUFFRCxRQUFRO1lBQ1IsTUFBTSxXQUFXLEdBQUcsSUFBSSxlQUFlLEVBQUU7WUFDekMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsT0FBTyxDQUFDO1lBQ3ZDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQztZQUNqQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUM7WUFDdkMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDO1lBQy9CLFdBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQztZQUNsQyxNQUFNLEtBQUssQ0FBQyxHQUFHLFVBQVUsVUFBVSxVQUFVLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBRTdGLFdBQVcsQ0FBQyxzQkFBc0IsQ0FBQztZQUNuQyxNQUFNLHNCQUFzQixDQUFDLEdBQUcsVUFBVSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQztZQUM1RCxTQUFTLENBQUMsRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxHQUFHLFNBQVMsc0JBQXNCLFVBQVUsRUFBRSxFQUFFLENBQUM7WUFDNUYsV0FBVyxDQUFDLEVBQUUsQ0FBQztRQUNqQixDQUFDO1FBQUMsT0FBTyxHQUFRLEVBQUUsQ0FBQztZQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLG1CQUFtQixFQUFFLEdBQUcsQ0FBQztZQUN2QyxRQUFRLENBQUMsd0JBQXdCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ3pELFdBQVcsQ0FBQyxFQUFFLENBQUM7UUFDakIsQ0FBQztnQkFBUyxDQUFDO1lBQ1QsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUNuQixDQUFDO0lBQ0gsQ0FBQyxHQUFFLENBQUMsTUFBTSxFQUFFLGNBQWMsRUFBRSxnQkFBZ0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBRXRFLG1EQUFtRDtJQUVuRCxNQUFNLGdCQUFnQixHQUFHLEdBQUcsRUFBRSxDQUFDLENBQzdCLG9FQUFLLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFBRTtRQUN0RyxvRUFBSyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLG9CQUFxQjtRQUcxRyxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTtZQUM5RCx1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLGtCQUFzQjtZQUN4Uyx1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxVQUFVLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLGNBQWtCO1lBQzFTLHVFQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFVBQVUsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsZ0JBQW9CLENBQ3JTO1FBR0wsQ0FBQyxVQUFVLEtBQUssSUFBSSxJQUFJLFVBQVUsS0FBSyxNQUFNLENBQUMsSUFBSSxDQUNqRDtZQUNFLG9FQUFLLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO2dCQUM5RCxzRUFBTyxJQUFJLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBRSxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLFdBQVcsRUFBRSxVQUFVLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFJO2dCQUNyUyxZQUFZLElBQUksQ0FDZix1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUNyUyxjQUFjLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUM1QixDQUNWLENBQ0c7WUFHTCxlQUFlLElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUNqRCxvRUFBSyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxJQUNwSCxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUM5QixvRUFBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGdCQUFnQixFQUFFLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDO2dCQUMzUSxDQUFDLENBQUMsT0FBTzs7Z0JBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDOUMsQ0FDUCxDQUFDLENBQ0UsQ0FDUDtZQUdBLG1CQUFtQixJQUFJLENBQ3RCLG9FQUFLLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO2dCQUN2SCxvRUFBSyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSwrQ0FBMkM7Z0JBQ2pILG9FQUFLLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUNqRCxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUNqQyx1RUFBUSxHQUFHLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxFQUFFLFlBQVksRUFBRSxHQUFHLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsRUFBRSxZQUFZLEVBQUUsR0FBRyxFQUFFLEdBQUcsaUJBQWlCLEVBQUUsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFO29CQUMvZCxxRUFBTSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBUTtvQkFDckQsQ0FBQyxDQUFDLFNBQVMsS0FBSyxDQUFDLENBQUMsT0FBTyxJQUFJLHFFQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxJQUFHLENBQUMsQ0FBQyxPQUFPLENBQVEsQ0FDNUYsQ0FDVixDQUFDLENBQ0UsQ0FDRixDQUNQO1lBR0EsT0FBTyxJQUFJLGlCQUFpQixJQUFJLENBQy9CLG9FQUFLLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixFQUFFO2dCQUNwSCxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO29CQUN6RyxxRUFBTSxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxvQkFBc0I7b0JBQ3ZGLHVFQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLGNBQWMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsa0JBQXNCLENBQ3ZkO2dCQUdOLG9FQUFLLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7b0JBQ2pDLHNFQUFPLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7O3dCQUFPLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxxRUFBTSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUU7OzRCQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO2dDQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBUztvQkFDak8sb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUU7d0JBQy9ELHVFQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksY0FBYyxLQUFLLE1BQU07Z0NBQUUsaUJBQWlCLEVBQUUsQ0FBQzs7Z0NBQU0sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxjQUFjLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLGVBQWUsRUFBRSxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxjQUFjLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFDamQsY0FBYyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQ3pDO3dCQUNULHNFQUFPLElBQUksRUFBQyxRQUFRLEVBQUMsS0FBSyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxXQUFXO2dDQUFFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEVBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxPQUFPLElBQUksV0FBVztnQ0FBRSxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxFQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFJLENBQzdjLENBQ0Y7Z0JBR047b0JBQ0Usc0VBQU8sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTs7d0JBQUssaUJBQWlCLENBQUMsQ0FBQyxDQUFDLHFFQUFNLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRTs7NEJBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0NBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFTO29CQUMvTixvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTt3QkFDL0QsdUVBQVEsSUFBSSxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxjQUFjLEtBQUssSUFBSTtnQ0FBRSxpQkFBaUIsRUFBRSxDQUFDOztnQ0FBTSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLGNBQWMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsZUFBZSxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsZUFBZSxFQUFFLGNBQWMsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUN6YyxjQUFjLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FDdkM7d0JBQ1Qsc0VBQU8sSUFBSSxFQUFDLFFBQVEsRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxJQUFJLFNBQVM7Z0NBQUUsbUJBQW1CLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsRUFBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLE9BQU8sSUFBSSxTQUFTO2dDQUFFLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUksQ0FDM2IsQ0FDRixDQUNGLENBQ1AsQ0FDRyxDQUNQO1FBR0EsVUFBVSxLQUFLLEtBQUssSUFBSSxDQUN2QjtZQUNFLHVFQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQzFRLE9BQU8sQ0FBQyxDQUFDLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLHNCQUFzQixTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQzlIO1lBQ1IsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FDdkIsb0VBQUssS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7Z0JBQy9ELDJFQUFTLG1CQUFtQixDQUFDLElBQUksQ0FBVTs7Z0JBQUssU0FBUyxDQUFDLE1BQU07bUNBQzVELENBQ1AsQ0FDRyxDQUNQLENBQ0csQ0FDUDtJQUVELGNBQWM7SUFDZCxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7O1FBQUMsUUFDckIsb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRTtZQUM3QixvRUFBSyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUU7Z0JBQ3ZELHFFQUFNLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBRyxRQUFRLENBQVEsQ0FDaEQ7WUFDTixrRUFBRyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLG9EQUVsRjtZQUdKLG9FQUFLLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsSUFDOUYsQ0FBQyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLHFCQUFxQixFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLGVBQWUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDclAsb0VBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7Z0JBQ3hHLG9FQUFLLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUk7Z0JBQ3BGLHFFQUFNLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBRyxJQUFJLENBQUMsS0FBSyxDQUFRLENBQ2xELENBQ1AsQ0FBQyxDQUNFO1lBRUwsT0FBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLE9BQU8sS0FBSSxrRUFBRyxJQUFJLEVBQUUsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUMsUUFBUSxFQUFDLEdBQUcsRUFBQyxxQkFBcUIsRUFBQyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUscUJBQW9CO1lBRXJOLG9FQUFLLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFO2dCQUNuRSx1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUNsUixlQUFlLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUMzQjtnQkFDVCx1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFdBQWUsQ0FDblM7WUFHTCxlQUFlLElBQUksSUFBSSxLQUFLLElBQUksSUFBSSxPQUFPLElBQUksQ0FDOUMsb0VBQUssS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRTtnQkFDckosb0VBQUssS0FBSyxFQUFFLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLDJCQUE0QjtnQkFDaEYsb0VBQUssS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRTs7b0JBQ0EsT0FBTyxDQUFDLFlBQVk7O29CQUF3QixPQUFPLENBQUMsYUFBYTs7b0JBQVUsT0FBTyxDQUFDLG1CQUFtQjs7b0JBQWlCLE9BQU8sQ0FBQyxhQUFhO2tDQUN6SztnQkFDTCxjQUFPLENBQUMsbUJBQW1CLDBDQUFFLE1BQU0sSUFBRyxDQUFDLElBQUksQ0FDMUM7b0JBQ0UscUdBQXdDO29CQUN4QyxzRUFBTyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFO3dCQUM3Rjs0QkFBTyxtRUFBSSxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFO2dDQUFFLG1FQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZO2dDQUFBLG1FQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxZQUFZO2dDQUFBLG1FQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxjQUFjO2dDQUFBLG1FQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUssQ0FBUTt3QkFDNVMsMEVBQVEsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBTSxFQUFFLENBQVMsRUFBRSxFQUFFOzs0QkFBQyxRQUN6RSxtRUFBSSxHQUFHLEVBQUUsQ0FBQztnQ0FBRSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUcsT0FBQyxDQUFDLE9BQU8sMENBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBTTtnQ0FBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBRyxPQUFDLENBQUMsS0FBSzt1Q0FBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO3lDQUFHLE9BQUMsQ0FBQyxHQUFHO3VDQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBTTtnQ0FBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsSUFBRyxDQUFDLENBQUMsVUFBVSxDQUFNO2dDQUFBLG1FQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBRyxDQUFDLENBQUMsU0FBUyxDQUFNLENBQUssQ0FDbFg7eUJBQUEsQ0FBQyxDQUFTLENBQ0wsQ0FDSixDQUNQLENBQ0csQ0FDUDtZQUVBLGVBQWUsSUFBSSxJQUFJLEtBQUssSUFBSSxJQUFJLFNBQVMsSUFBSSxDQUNoRCxvRUFBSyxLQUFLLEVBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFO2dCQUNySixvRUFBSyxLQUFLLEVBQUUsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxtQ0FBb0M7Z0JBQzFHLG9FQUFLLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7b0JBQ2pDLHFGQUF3Qjt5REFBa0MsZUFBUyxDQUFDLFlBQVk7dUJBQUUsY0FBYyxFQUFFOztvQkFBZ0MsU0FBUyxDQUFDLEtBQUs7OEhBQzdJO2dCQUNOLG9FQUFLLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUU7b0JBQ2pDLCtGQUFrQzs7b0JBQXlDLDZFQUFZO2lJQUNuRjtnQkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUNsRDtvQkFDRSx5R0FBNEM7b0JBQzVDLHNFQUFPLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUU7d0JBQzdGOzRCQUFPLG1FQUFJLEtBQUssRUFBRSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUU7Z0NBQUUsbUVBQUksS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLGFBQWE7Z0NBQUEsbUVBQUksS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFlBQVk7Z0NBQUEsbUVBQUksS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBSyxDQUFRO3dCQUM5TywwRUFBUSxNQUFNLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQWdCLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUN4USxtRUFBSSxHQUFHLEVBQUUsQ0FBQzs0QkFBRSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBTTs0QkFBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBRyxDQUFDLENBQUMsR0FBRyxDQUFNOzRCQUFBLG1FQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUU7Z0NBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29DQUFPLENBQUssQ0FDMVEsQ0FBQyxDQUFTLENBQ0wsQ0FDSixDQUNQO2dCQUNELG9FQUFLLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO29CQUM5SCxtRkFBc0I7NktBQ2xCLENBQ0YsQ0FDUCxDQUNHLENBQ1A7S0FBQTtJQUVELG1CQUFtQjtJQUNuQixNQUFNLFNBQVMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUN0QixvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUU7UUFDbEQsb0VBQUssS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsSUFBRyxRQUFRLENBQU87UUFDdEYsb0VBQUssS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTtZQUMzRixvRUFBSyxLQUFLLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxHQUFJLENBQ2pJLENBQ0YsQ0FDUDtJQUVELHdEQUF3RDtJQUV4RCxPQUFPLENBQ0wsb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRTtRQUVuSixZQUFZLElBQUksQ0FDZiwyREFBQyw2REFBb0IsSUFBQyxjQUFjLEVBQUUsT0FBQyxLQUFLLENBQUMsZUFBdUIsMENBQUcsQ0FBQyxDQUFDLE1BQUksWUFBQyxLQUFLLENBQUMsZUFBdUIsMENBQUUsS0FBSyxrREFBSSxHQUFFLGtCQUFrQixFQUFFLGtCQUFrQixHQUFJLENBQ25LO1FBRUQsbUVBQUksS0FBSyxFQUFFLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUU7O1lBQXdCLHFFQUFNLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLDBCQUE0QixDQUFLO1FBRzdMLEtBQUssSUFBSSxDQUNSLG9FQUFLLEtBQUssRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFO1lBQ3JJLEtBQUs7WUFDTix1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBRyxRQUFRLENBQVUsQ0FDekwsQ0FDUDtRQUdBLElBQUksS0FBSyxRQUFRLElBQUksQ0FDcEIsb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7WUFHbkUsb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixFQUFFO2dCQUN0RyxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO29CQUN6RyxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTt3QkFDL0QscUVBQU0sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFHLGNBQWMsQ0FBUTt3QkFDMUQscUVBQU0sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsb0JBQXNCLENBQ3RGO29CQUNOLHVFQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFZLENBQ25XO2dCQUNOLGtFQUFHLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLG1FQUFrRTtnQkFDbEksVUFBVSxJQUFJLENBQ2Isb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixFQUFFO29CQUM5SiwyRkFBOEI7b0JBQUEsc0VBQU07O29CQUN1QixzRUFBTTs7b0JBQzNDLHNGQUFxQjs7b0JBQUssK0ZBQThCOztvQkFBYyxzRUFBTTs7b0JBQ3RELHNFQUFNOztvQkFDVixzRUFBTTs7b0JBQ3VDLHNFQUFNOztvQkFDOUIsc0VBQU07O29CQUNTLHNFQUFNO29CQUNsRixzRUFBTTtvQkFDTix1RkFBMEI7OEVBQ3RCLENBQ1A7Z0JBQ0QsdUVBQVEsSUFBSSxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLHdCQUVyTixDQUNMO1lBR04sb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixFQUFFO2dCQUN0RyxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFO29CQUN6RyxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTt3QkFDL0QscUVBQU0sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFHLGNBQWMsQ0FBUTt3QkFDMUQscUVBQU0sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsb0JBQXNCLENBQ3RGO29CQUNOLHVFQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFZLENBQ25XO2dCQUNOLGtFQUFHLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLDREQUEyRDtnQkFDM0gsVUFBVSxJQUFJLENBQ2Isb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLG1CQUFtQixFQUFFO29CQUM5SiwyRkFBOEI7b0JBQUEsc0VBQU07O29CQUN1QixzRUFBTTs7b0JBQzNDLG9HQUFtQzs7b0JBQTJFLHNFQUFNOztvQkFDUixzRUFBTTs7b0JBQy9ELHNFQUFNOztvQkFDWixzRUFBTTtvQkFDekUsc0VBQU07b0JBQ04sdUZBQTBCOztvQkFBWSw2RUFBWTs4SUFDOUMsQ0FDUDtnQkFDRCx1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsd0JBRXJOLENBQ0wsQ0FDRixDQUNQO1FBR0EsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUM5QyxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRTtZQUduRSx1RUFBUSxJQUFJLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUUsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUU7Z0JBQzNSLFFBQVE7d0JBQ0Y7WUFFVCxvRUFBSyxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsSUFDekwsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsNEJBQTRCLENBQUMsQ0FBQyxDQUFDLDRCQUE0QixDQUN4RTtZQUdMLENBQUMsT0FBTyxJQUFJLGdCQUFnQixFQUFFO1lBRzlCLENBQUMsT0FBTyxJQUFJLENBQ1gsdUVBQVEsSUFBSSxFQUFDLFFBQVEsRUFBQyxPQUFPLEVBQUUsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxlQUFlLEVBQUUsUUFBUSxFQUFFLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSyxLQUFLLElBQUksbUJBQW1CLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLENBQUMsVUFBVSxLQUFLLEtBQUssSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUNqaEIsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUNuRCxDQUNWO1lBR0EsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUNuQixDQUNQO1FBR0EsTUFBTSxJQUFJLFFBQVEsRUFBRSxDQUNqQixDQUNQO0FBQ0gsQ0FBQztBQUVELGlFQUFlLE1BQU07QUFFYixTQUFTLDJCQUEyQixDQUFDLEdBQUcsSUFBSSxxQkFBdUIsR0FBRyxHQUFHLEVBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9scnMtdXRpbHMvbHJzLXNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWFyY2dpc1wiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9ydW50aW1lL3dpZGdldC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gTFJTIFJFU1QgQVBJIFNlcnZpY2Ugd3JhcHBlclxyXG4vLyBVc2VzIEpTT05QIHRvIGJ5cGFzcyBDT1JTIGlzc3VlcyB3aXRoIG1pc2NvbmZpZ3VyZWQgc2VydmVycyAoZHVwbGljYXRlIEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiBoZWFkZXJzKVxyXG5pbXBvcnQgdHlwZSB7XHJcbiAgTHJzU2VydmljZUluZm8sXHJcbiAgTmV0d29ya0xheWVySW5mbyxcclxuICBFdmVudExheWVySW5mbyxcclxuICBNZWFzdXJlVG9HZW9tZXRyeUxvY2F0aW9uLFxyXG4gIE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0LFxyXG4gIEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0LFxyXG4gIFF1ZXJ5QXR0cmlidXRlU2V0UGFyYW1zLFxyXG4gIEZlYXR1cmVTZXRSZXN1bHRcclxufSBmcm9tICcuL3R5cGVzJ1xyXG5cclxubGV0IGpzb25wQ291bnRlciA9IDBcclxuXHJcbi8qKlxyXG4gKiBKU09OUCByZXF1ZXN0IOKAlCBieXBhc3NlcyBDT1JTIGVudGlyZWx5IGJ5IGluamVjdGluZyBhIDxzY3JpcHQ+IHRhZy5cclxuICogQXJjR0lTIFJFU1QgQVBJIHN1cHBvcnRzIEpTT05QIHZpYSB0aGUgJ2NhbGxiYWNrJyBwYXJhbWV0ZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBqc29ucFJlcXVlc3QgKHVybDogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPGFueT4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCBjYWxsYmFja05hbWUgPSBgX2xyc19jYl8ke0RhdGUubm93KCl9XyR7anNvbnBDb3VudGVyKyt9YFxyXG4gICAgcGFyYW1zLmNhbGxiYWNrID0gY2FsbGJhY2tOYW1lXHJcblxyXG4gICAgY29uc3QgcXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykudG9TdHJpbmcoKVxyXG4gICAgY29uc3Qgc2NyaXB0VXJsID0gYCR7dXJsfT8ke3FzfWBcclxuXHJcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxyXG4gICAgc2NyaXB0LnNyYyA9IHNjcmlwdFVybFxyXG5cclxuICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XHJcbiAgICAgIGRlbGV0ZSAod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXVxyXG4gICAgICBpZiAoc2NyaXB0LnBhcmVudE5vZGUpIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdClcclxuICAgIH1cclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlIHx8ICdSZXF1ZXN0IGVycm9yJykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdKU09OUCByZXF1ZXN0IGZhaWxlZCcpKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICgod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSkge1xyXG4gICAgICAgIGNsZWFudXAoKVxyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKVxyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMClcclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcilcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yLm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZXJyb3InKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcclxuICB9KVxyXG59XHJcblxyXG4vKipcclxuICogV3JhcHBlciBhcm91bmQgQXJjR0lTIExSUyBSRVNUIEFQSSAoTFJTZXJ2ZXIgZXh0ZW5zaW9uKS5cclxuICogVXNlcyBKU09OUCBmb3IgYWxsIHJlcXVlc3RzIHRvIGF2b2lkIENPUlMgaXNzdWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExyc1NlcnZpY2Uge1xyXG4gIHByaXZhdGUgYmFzZVVybDogc3RyaW5nXHJcbiAgcHJpdmF0ZSB0b2tlbjogc3RyaW5nIHwgbnVsbFxyXG5cclxuICBjb25zdHJ1Y3RvciAoYmFzZVVybDogc3RyaW5nLCB0b2tlbj86IHN0cmluZykge1xyXG4gICAgLy8gRW5zdXJlIG5vIHRyYWlsaW5nIHNsYXNoXHJcbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgJycpXHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW4gfHwgbnVsbFxyXG4gIH1cclxuXHJcbiAgc2V0VG9rZW4gKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggTFJTIHNlcnZpY2UgbWV0YWRhdGEgKG5ldHdvcmsgbGF5ZXJzLCBldmVudCBsYXllcnMsIGV0Yy4pXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0U2VydmljZUluZm8gKCk6IFByb21pc2U8THJzU2VydmljZUluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8THJzU2VydmljZUluZm8+KCcnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggZGV0YWlsZWQgaW5mbyBmb3IgYSBuZXR3b3JrIGxheWVyIChmaWVsZHMsIG1lYXN1cmUgcHJlY2lzaW9uLCBldGMuKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldE5ldHdvcmtMYXllckluZm8gKGxheWVySWQ6IG51bWJlcik6IFByb21pc2U8TmV0d29ya0xheWVySW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxOZXR3b3JrTGF5ZXJJbmZvPihgL25ldHdvcmtMYXllcnMvJHtsYXllcklkfWApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBkZXRhaWxlZCBpbmZvIGZvciBhbiBldmVudCBsYXllclxyXG4gICAqL1xyXG4gIGFzeW5jIGdldEV2ZW50TGF5ZXJJbmZvIChsYXllcklkOiBudW1iZXIpOiBQcm9taXNlPEV2ZW50TGF5ZXJJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEV2ZW50TGF5ZXJJbmZvPihgL2V2ZW50TGF5ZXJzLyR7bGF5ZXJJZH1gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCByb3V0ZSBJRCArIG1lYXN1cmVzIHRvIG1hcCBnZW9tZXRyeVxyXG4gICAqL1xyXG4gIGFzeW5jIG1lYXN1cmVUb0dlb21ldHJ5IChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBsb2NhdGlvbnM6IE1lYXN1cmVUb0dlb21ldHJ5TG9jYXRpb25bXSxcclxuICAgIG91dFNSPzogYW55XHJcbiAgKTogUHJvbWlzZTxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4ge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucyksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKG91dFNSKSB7XHJcbiAgICAgIHBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KG91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9tZWFzdXJlVG9HZW9tZXRyeWAsXHJcbiAgICAgIHBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBtYXAgZ2VvbWV0cnkgKHBvaW50KSB0byByb3V0ZSArIG1lYXN1cmVcclxuICAgKi9cclxuICBhc3luYyBnZW9tZXRyeVRvTWVhc3VyZSAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgbG9jYXRpb25zOiBBcnJheTx7IGdlb21ldHJ5OiBhbnkgfT4sXHJcbiAgICBvdXRTUj86IGFueVxyXG4gICk6IFByb21pc2U8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChvdXRTUikge1xyXG4gICAgICBwYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShvdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vZ2VvbWV0cnlUb01lYXN1cmVgLFxyXG4gICAgICBwYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIER5bmFtaWMgc2VnbWVudGF0aW9uIG92ZXJsYXkg4oCUIHF1ZXJ5QXR0cmlidXRlU2V0XHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlBdHRyaWJ1dGVTZXQgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIHBhcmFtczogUXVlcnlBdHRyaWJ1dGVTZXRQYXJhbXNcclxuICApOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmxvY2F0aW9ucyksXHJcbiAgICAgIGF0dHJpYnV0ZVNldDogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmF0dHJpYnV0ZVNldCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHBhcmFtcy5vdXRTUikge1xyXG4gICAgICByZXF1ZXN0UGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zLm91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxGZWF0dXJlU2V0UmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L3F1ZXJ5QXR0cmlidXRlU2V0YCxcclxuICAgICAgcmVxdWVzdFBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhbmRhcmQgZmVhdHVyZSBxdWVyeSBhZ2FpbnN0IGEgbWFwIHNlcnZpY2UgbGF5ZXIgKGZvciBSb2FkIExvZyBpbmRpdmlkdWFsIGV2ZW50IHF1ZXJpZXMpXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlcyAoXHJcbiAgICBtYXBTZXJ2aWNlVXJsOiBzdHJpbmcsXHJcbiAgICBsYXllcklkOiBudW1iZXIsXHJcbiAgICB3aGVyZTogc3RyaW5nLFxyXG4gICAgb3V0RmllbGRzOiBzdHJpbmdbXSA9IFsnKiddXHJcbiAgKTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICAvLyBUaGUgbWFwIHNlcnZpY2UgVVJMIGlzIHRoZSBwYXJlbnQgb2YgTFJTZXJ2ZXIgZXh0ZW5zaW9uXHJcbiAgICAvLyBlLmcuIC4uLi9NYXBTZXJ2ZXIvMC9xdWVyeVxyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IHRoaXMuYmFzZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtsYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIHdoZXJlLFxyXG4gICAgICBvdXRGaWVsZHM6IG91dEZpZWxkcy5qb2luKCcsJyksXHJcbiAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlyZWN0IHF1ZXJ5IHdpdGggYXJiaXRyYXJ5IHBhcmFtcyAoZm9yIHNwYXRpYWwgcXVlcmllcyB2aWEgSlNPTlApXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlc0RpcmVjdCAodXJsOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG4gICAgcGFyYW1zLmYgPSBwYXJhbXMuZiB8fCAnanNvbidcclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBRdWVyeSByb3V0ZXMgb24gYSBuZXR3b3JrIGxheWVyIChmb3Igcm91dGUgcGlja2VyIGF1dG9jb21wbGV0ZSlcclxuICAgKi9cclxuICBhc3luYyBxdWVyeVJvdXRlcyAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgc2VhcmNoVGV4dDogc3RyaW5nLFxyXG4gICAgcm91dGVJZEZpZWxkOiBzdHJpbmcsXHJcbiAgICByb3V0ZU5hbWVGaWVsZDogc3RyaW5nIHwgbnVsbCxcclxuICAgIG1heFJlc3VsdHM6IG51bWJlciA9IDEwXHJcbiAgKTogUHJvbWlzZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0+PiB7XHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gdGhpcy5iYXNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke25ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBzZWFyY2hGaWVsZCA9IHJvdXRlTmFtZUZpZWxkIHx8IHJvdXRlSWRGaWVsZFxyXG4gICAgY29uc3Qgd2hlcmUgPSBgVVBQRVIoJHtzZWFyY2hGaWVsZH0pIExJS0UgVVBQRVIoJyR7c2VhcmNoVGV4dC5yZXBsYWNlKC8nL2csIFwiJydcIil9JScpYFxyXG4gICAgY29uc3Qgb3V0RmllbGRzID0gcm91dGVOYW1lRmllbGRcclxuICAgICAgPyBbcm91dGVJZEZpZWxkLCByb3V0ZU5hbWVGaWVsZF1cclxuICAgICAgOiBbcm91dGVJZEZpZWxkXVxyXG5cclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgd2hlcmUsXHJcbiAgICAgIG91dEZpZWxkczogb3V0RmllbGRzLmpvaW4oJywnKSxcclxuICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgIHJlc3VsdFJlY29yZENvdW50OiBtYXhSZXN1bHRzLnRvU3RyaW5nKCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGpzb24gPSBhd2FpdCBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcblxyXG4gICAgY29uc3QgYWxsID0gKGpzb24uZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVJZEZpZWxkXSxcclxuICAgICAgcm91dGVOYW1lOiByb3V0ZU5hbWVGaWVsZCA/IGYuYXR0cmlidXRlc1tyb3V0ZU5hbWVGaWVsZF0gOiBudWxsXHJcbiAgICB9KSlcclxuICAgIC8vIERlZHVwbGljYXRlIGJ5IHJvdXRlSWRcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxyXG4gICAgcmV0dXJuIGFsbC5maWx0ZXIoKHI6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoc2Vlbi5oYXMoci5yb3V0ZUlkKSkgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHNlZW4uYWRkKHIucm91dGVJZClcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvLyAtLS0gUHJpdmF0ZSBoZWxwZXJzIC0tLVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHJlcXVlc3Q8VD4gKHBhdGg6IHN0cmluZywgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8VD4ge1xyXG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfSR7cGF0aH1gXHJcbiAgICBjb25zdCBhbGxQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGY6ICdqc29uJyxcclxuICAgICAgLi4ucGFyYW1zXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBhbGxQYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIGFsbFBhcmFtcykgYXMgUHJvbWlzZTxUPlxyXG4gIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9hcmNnaXNfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCIvKiogQGpzeFJ1bnRpbWUgY2xhc3NpYyAqL1xyXG5pbXBvcnQgeyBSZWFjdCwgdHlwZSBBbGxXaWRnZXRQcm9wcywgU2Vzc2lvbk1hbmFnZXIgfSBmcm9tICdqaW11LWNvcmUnXHJcbmltcG9ydCB7IEppbXVNYXBWaWV3Q29tcG9uZW50LCB0eXBlIEppbXVNYXBWaWV3IH0gZnJvbSAnamltdS1hcmNnaXMnXHJcbmltcG9ydCB0eXBlIHsgSU1Db25maWcgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IExyc1NlcnZpY2UgfSBmcm9tICcuLi9scnMtdXRpbHMvbHJzLXNlcnZpY2UnXHJcblxyXG5jb25zdCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSA9IFJlYWN0XHJcblxyXG50eXBlIFdvcmtmbG93TW9kZSA9ICdjaG9vc2UnIHwgJ2FpJyB8ICdtbCdcclxuXHJcbmNvbnN0IFdpZGdldCA9IChwcm9wczogQWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+KSA9PiB7XHJcbiAgY29uc3QgY29uZmlnID0gcHJvcHMuY29uZmlnXHJcbiAgY29uc3QgaGFzTWFwV2lkZ2V0ID0gQm9vbGVhbihwcm9wcy51c2VNYXBXaWRnZXRJZHMgJiYgKChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KS5sZW5ndGggPiAwIHx8IChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uc2l6ZSA+IDApKVxyXG5cclxuICAvLyBXb3JrZmxvdyBzdGF0ZVxyXG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPFdvcmtmbG93TW9kZT4oJ2Nob29zZScpXHJcbiAgY29uc3QgW3Nob3dBSUhlbHAsIHNldFNob3dBSUhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3Nob3dNTEhlbHAsIHNldFNob3dNTEhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcblxyXG4gIC8vIFJvdXRlIHNlbGVjdGlvbiBzdGF0ZVxyXG4gIGNvbnN0IFtyb3V0ZUlkLCBzZXRSb3V0ZUlkXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtyb3V0ZU5hbWUsIHNldFJvdXRlTmFtZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbZnJvbU1lYXN1cmUsIHNldEZyb21NZWFzdXJlXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFt0b01lYXN1cmUsIHNldFRvTWVhc3VyZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbcm91dGVNZWFzdXJlUmFuZ2UsIHNldFJvdXRlTWVhc3VyZVJhbmdlXSA9IHVzZVN0YXRlPHsgbWluOiBudW1iZXI7IG1heDogbnVtYmVyIH0gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzZWFyY2hNb2RlLCBzZXRTZWFyY2hNb2RlXSA9IHVzZVN0YXRlPCdpZCcgfCAnbmFtZScgfCAnbWFwJz4oJ2lkJylcclxuICBjb25zdCBbcm91dGVTdWdnZXN0aW9ucywgc2V0Um91dGVTdWdnZXN0aW9uc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0+PihbXSlcclxuICBjb25zdCBbc2hvd1N1Z2dlc3Rpb25zLCBzZXRTaG93U3VnZ2VzdGlvbnNdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3BpY2tpbmdGcm9tTWFwLCBzZXRQaWNraW5nRnJvbU1hcF0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbcGlja2luZ01lYXN1cmUsIHNldFBpY2tpbmdNZWFzdXJlXSA9IHVzZVN0YXRlPCdmcm9tJyB8ICd0bycgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtkcmF3aW5nLCBzZXREcmF3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFttYXBSb3V0ZXMsIHNldE1hcFJvdXRlc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsOyBmcm9tTWVhc3VyZTogbnVtYmVyOyB0b01lYXN1cmU6IG51bWJlciB9Pj4oW10pXHJcbiAgY29uc3QgW3NlbGVjdGVkTWFwUm91dGVJZHMsIHNldFNlbGVjdGVkTWFwUm91dGVJZHNdID0gdXNlU3RhdGU8U2V0PHN0cmluZz4+KG5ldyBTZXQoKSlcclxuICBjb25zdCBbcm91dGVQaWNrQ2FuZGlkYXRlcywgc2V0Um91dGVQaWNrQ2FuZGlkYXRlc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfT4gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzZWxlY3RlZEZvbGRlcklkLCBzZXRTZWxlY3RlZEZvbGRlcklkXSA9IHVzZVN0YXRlPHN0cmluZz4oJycpXHJcblxyXG4gIC8vIFByZWRpY3Rpb24gc3RhdGVcclxuICBjb25zdCBbcnVubmluZywgc2V0UnVubmluZ10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbcHJvZ3Jlc3MsIHNldFByb2dyZXNzXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbcmVzdWx0LCBzZXRSZXN1bHRdID0gdXNlU3RhdGU8eyBsYXllclVybD86IHN0cmluZzsgaXRlbVVybD86IHN0cmluZyB9IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbc2hvd0V4cGxhbmF0aW9uLCBzZXRTaG93RXhwbGFuYXRpb25dID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW2ZhY3RvcnMsIHNldEZhY3RvcnNdID0gdXNlU3RhdGU8YW55PihudWxsKVxyXG4gIGNvbnN0IFttb2RlbEluZm8sIHNldE1vZGVsSW5mb10gPSB1c2VTdGF0ZTxhbnk+KG51bGwpXHJcblxyXG4gIC8vIFJlZnNcclxuICBjb25zdCBqaW11TWFwVmlld1JlZiA9IHVzZVJlZjxKaW11TWFwVmlldyB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgbHJzU2VydmljZVJlZiA9IHVzZVJlZjxMcnNTZXJ2aWNlIHwgbnVsbD4obnVsbClcclxuICBjb25zdCByb3V0ZUdlb21ldHJpZXNSZWYgPSB1c2VSZWY8TWFwPHN0cmluZywgeyB2ZXJ0aWNlczogbnVtYmVyW11bXTsgbUlkeDogbnVtYmVyIH0+PihuZXcgTWFwKCkpXHJcbiAgY29uc3QgcGlja0hhbmRsZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHBpY2tIb3ZlckhhbmRsZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHBpY2tUb29sdGlwUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBwaWNrU25hcEdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHBpY2tIb3ZlclRpbWVvdXRSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHNrZXRjaFZNUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBncmFwaGljc0xheWVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBzZWFyY2hUaW1lb3V0UmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICAvLyBSb3V0ZSBwcmV2aWV3ICsgbWVhc3VyZSBwaWNraW5nIHJlZnNcclxuICBjb25zdCByb3V0ZVByZXZpZXdHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCByb3V0ZVByZXZpZXdMYXllclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgZnJvbU1lYXN1cmVHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCB0b01lYXN1cmVHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCByb3V0ZVByZXZpZXdWZXJ0c1JlZiA9IHVzZVJlZjx7IHZlcnRpY2VzOiBudW1iZXJbXVtdOyBtSWR4OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgbWVhc3VyZVBpY2tIYW5kbGVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBtZWFzdXJlUGlja0hvdmVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBtZWFzdXJlU25hcEdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IG1lYXN1cmVUb29sdGlwUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBzaG93Um91dGVQcmV2aWV3UmVmID0gdXNlUmVmPChyaWQ6IHN0cmluZykgPT4gdm9pZD4oKCkgPT4ge30pXHJcbiAgY29uc3Qgc2hvd01lYXN1cmVQb2ludFJlZiA9IHVzZVJlZjwod2hpY2g6ICdmcm9tJyB8ICd0bycsIG1lYXN1cmVWYWw6IHN0cmluZykgPT4gdm9pZD4oKCkgPT4ge30pXHJcblxyXG4gIC8vIEluaXRpYWxpemUgTHJzU2VydmljZSAoSlNPTlAtYmFzZWQsIGJ5cGFzc2VzIENPUlMpXHJcbiAgLy8gQ2FjaGUgZGlzY292ZXJlZCByb3V0ZUlkRmllbGROYW1lIHBlciBldmVudCBsYXllciBmcm9tIExSUyBtZXRhZGF0YVxyXG4gIGNvbnN0IGV2ZW50RmllbGROYW1lc1JlZiA9IHVzZVJlZjxNYXA8bnVtYmVyLCB7IHJvdXRlSWRGaWVsZDogc3RyaW5nOyBtZWFzdXJlRmllbGQ6IHN0cmluZzsgZnJvbU1lYXN1cmVGaWVsZDogc3RyaW5nOyB0b01lYXN1cmVGaWVsZDogc3RyaW5nIH0+PihuZXcgTWFwKCkpXHJcblxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoY29uZmlnPy5scnNTZXJ2aWNlVXJsKSB7XHJcbiAgICAgIGxyc1NlcnZpY2VSZWYuY3VycmVudCA9IG5ldyBMcnNTZXJ2aWNlKGNvbmZpZy5scnNTZXJ2aWNlVXJsKVxyXG5cclxuICAgICAgLy8gRGlzY292ZXIgY29ycmVjdCBmaWVsZCBuYW1lcyBmcm9tIExSUyBldmVudCBsYXllciBtZXRhZGF0YVxyXG4gICAgICBjb25zdCBscnMgPSBscnNTZXJ2aWNlUmVmLmN1cnJlbnRcclxuICAgICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcbiAgICAgIGZvciAoY29uc3QgY2ZnIG9mIGV2ZW50Q29uZmlncykge1xyXG4gICAgICAgIGxycy5nZXRFdmVudExheWVySW5mbyhjZmcubGF5ZXJJZCkudGhlbigoZGV0YWlsOiBhbnkpID0+IHtcclxuICAgICAgICAgIGV2ZW50RmllbGROYW1lc1JlZi5jdXJyZW50LnNldChjZmcubGF5ZXJJZCwge1xyXG4gICAgICAgICAgICByb3V0ZUlkRmllbGQ6IGRldGFpbC5yb3V0ZUlkRmllbGROYW1lIHx8IGNmZy5yb3V0ZUlkRmllbGQgfHwgJ3JvdXRlaWQnLFxyXG4gICAgICAgICAgICBtZWFzdXJlRmllbGQ6IGRldGFpbC5tZWFzdXJlRmllbGROYW1lIHx8IGNmZy5tZWFzdXJlRmllbGQgfHwgJ21lYXN1cmUnLFxyXG4gICAgICAgICAgICBmcm9tTWVhc3VyZUZpZWxkOiBkZXRhaWwuZnJvbU1lYXN1cmVGaWVsZE5hbWUgfHwgY2ZnLmZyb21NZWFzdXJlRmllbGQgfHwgJ2Zyb21fbWVhc3VyZScsXHJcbiAgICAgICAgICAgIHRvTWVhc3VyZUZpZWxkOiBkZXRhaWwudG9NZWFzdXJlRmllbGROYW1lIHx8IGNmZy50b01lYXN1cmVGaWVsZCB8fCAndG9fbWVhc3VyZSdcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSkuY2F0Y2goKCkgPT4geyAvKiB1c2UgY29uZmlnIGRlZmF1bHRzICovIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LCBbY29uZmlnPy5scnNTZXJ2aWNlVXJsXSlcclxuXHJcbiAgLy8gSGFuZGxlIG1hcCB2aWV3IHJlYWR5XHJcbiAgY29uc3Qgb25BY3RpdmVWaWV3Q2hhbmdlID0gdXNlQ2FsbGJhY2soKGptdjogSmltdU1hcFZpZXcpID0+IHtcclxuICAgIGppbXVNYXBWaWV3UmVmLmN1cnJlbnQgPSBqbXZcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gUk9VVEUgU0VMRUNUSU9OIChzYW1lIGFzIHJvYWQtbG9nKSA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBoYW5kbGVSb3V0ZVNlYXJjaCA9IHVzZUNhbGxiYWNrKCh2YWx1ZTogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoc2VhcmNoTW9kZSA9PT0gJ2lkJykge1xyXG4gICAgICBzZXRSb3V0ZUlkKHZhbHVlKVxyXG4gICAgICBzZXRSb3V0ZU5hbWUoJycpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXRSb3V0ZU5hbWUodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlYXJjaFRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHNlYXJjaFRpbWVvdXRSZWYuY3VycmVudClcclxuICAgIGlmICh2YWx1ZS5sZW5ndGggPCAyIHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHtcclxuICAgICAgc2V0Um91dGVTdWdnZXN0aW9ucyhbXSlcclxuICAgICAgc2V0U2hvd1N1Z2dlc3Rpb25zKGZhbHNlKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgICAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgICAgIGNvbnN0IHNlYXJjaEZpZWxkID0gc2VhcmNoTW9kZSA9PT0gJ25hbWUnID8gbmFtZUZpZWxkIDogcm91dGVGaWVsZFxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIHdoZXJlOiBgVVBQRVIoJHtzZWFyY2hGaWVsZH0pIExJS0UgVVBQRVIoJyUke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0lJylgLFxyXG4gICAgICAgICAgb3V0RmllbGRzOiBgJHtyb3V0ZUZpZWxkfSwke25hbWVGaWVsZH1gLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdCh1cmwsIHBhcmFtcylcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gKGRhdGEuZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnLFxyXG4gICAgICAgICAgcm91dGVOYW1lOiBmLmF0dHJpYnV0ZXNbbmFtZUZpZWxkXSB8fCBudWxsXHJcbiAgICAgICAgfSkpXHJcbiAgICAgICAgc2V0Um91dGVTdWdnZXN0aW9ucyhyZXN1bHRzKVxyXG4gICAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhyZXN1bHRzLmxlbmd0aCA+IDApXHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMoW10pXHJcbiAgICAgICAgc2V0U2hvd1N1Z2dlc3Rpb25zKGZhbHNlKVxyXG4gICAgICB9XHJcbiAgICB9LCAzMDApXHJcbiAgfSwgW2NvbmZpZywgc2VhcmNoTW9kZV0pXHJcblxyXG4gIGNvbnN0IHNlbGVjdFJvdXRlID0gdXNlQ2FsbGJhY2soKHJvdXRlOiB7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0pID0+IHtcclxuICAgIHNldFJvdXRlSWQocm91dGUucm91dGVJZClcclxuICAgIHNldFJvdXRlTmFtZShyb3V0ZS5yb3V0ZU5hbWUgfHwgJycpXHJcbiAgICBzZXRTaG93U3VnZ2VzdGlvbnMoZmFsc2UpXHJcbiAgICBmZXRjaFJvdXRlTWVhc3VyZXMocm91dGUucm91dGVJZClcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gRmV0Y2ggcm91dGUgZ2VvbWV0cnkgKyBtZWFzdXJlIHJhbmdlICsgc2hvdyBwcmV2aWV3XHJcbiAgY29uc3QgZmV0Y2hSb3V0ZU1lYXN1cmVzID0gdXNlQ2FsbGJhY2soYXN5bmMgKHJpZDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWxyc1NlcnZpY2VSZWYuY3VycmVudCB8fCAhcmlkKSByZXR1cm5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJvdXRlRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlSWRGaWVsZCB8fCAnY3VzdG9tcm91dGVmaWVsZCdcclxuICAgICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICAgIGNvbnN0IHZpZXdXa2lkID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldz8uc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtjb25maWcubmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgIHdoZXJlOiBgJHtyb3V0ZUZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AsXHJcbiAgICAgICAgb3V0RmllbGRzOiByb3V0ZUZpZWxkLFxyXG4gICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMScsXHJcbiAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgIGlmICghZGF0YS5mZWF0dXJlcz8ubGVuZ3RoKSByZXR1cm5cclxuXHJcbiAgICAgIGNvbnN0IHBhdGhzID0gZGF0YS5mZWF0dXJlc1swXS5nZW9tZXRyeT8ucGF0aHMgfHwgW11cclxuICAgICAgY29uc3QgYWxsVmVydHM6IG51bWJlcltdW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIGFsbFZlcnRzLnB1c2goLi4ucGF0aClcclxuICAgICAgY29uc3QgaGFzWiA9IGRhdGEuZmVhdHVyZXNbMF0uZ2VvbWV0cnk/Lmhhc1pcclxuICAgICAgY29uc3QgbUlkeCA9IGhhc1ogPyAzIDogMlxyXG4gICAgICBhbGxWZXJ0cy5zb3J0KChhLCBiKSA9PiAoYVttSWR4XSB8fCAwKSAtIChiW21JZHhdIHx8IDApKVxyXG5cclxuICAgICAgaWYgKGFsbFZlcnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBtaW5NID0gYWxsVmVydHNbMF1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IG1heE0gPSBhbGxWZXJ0c1thbGxWZXJ0cy5sZW5ndGggLSAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgc2V0RnJvbU1lYXN1cmUobWluTS50b0ZpeGVkKDMpKVxyXG4gICAgICAgIHNldFRvTWVhc3VyZShtYXhNLnRvRml4ZWQoMykpXHJcbiAgICAgICAgc2V0Um91dGVNZWFzdXJlUmFuZ2UoeyBtaW46IG1pbk0sIG1heDogbWF4TSB9KVxyXG4gICAgICAgIHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LnNldChyaWQsIHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH0pXHJcbiAgICAgICAgcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCA9IHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH1cclxuXHJcbiAgICAgICAgLy8gU2hvdyByb3V0ZSBwcmV2aWV3IG9uIG1hcFxyXG4gICAgICAgIHNob3dSb3V0ZVByZXZpZXdSZWYuY3VycmVudChyaWQpXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0NyYXNoUmlza10gZmV0Y2hSb3V0ZU1lYXN1cmVzIGZhaWxlZDonLCBlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWddKVxyXG5cclxuICAvLyBTaG93IHNlbGVjdGVkIHJvdXRlIGFzIGEgZGFzaGVkIGxpbmUgb24gdGhlIG1hcCAobGlrZSByb2FkLWxvZylcclxuICBjb25zdCBzaG93Um91dGVQcmV2aWV3ID0gdXNlQ2FsbGJhY2soYXN5bmMgKHJpZDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG5cclxuICAgIC8vIEVuc3VyZSBwcmV2aWV3IEdyYXBoaWNzTGF5ZXIgZXhpc3RzXHJcbiAgICBpZiAoIXJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgR3JhcGhpY3NMYXllciA9IGF3YWl0ICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvbGF5ZXJzL0dyYXBoaWNzTGF5ZXInKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgICBjb25zdCBnbCA9IG5ldyBHcmFwaGljc0xheWVyKHsgaWQ6ICdfX2NyYXNocmlza19yb3V0ZV9wcmV2aWV3X18nLCB0aXRsZTogJ1JvdXRlIFByZXZpZXcnIH0pXHJcbiAgICAgIHZpZXcubWFwLmFkZChnbCwgMClcclxuICAgICAgcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudCA9IGdsXHJcbiAgICB9XHJcbiAgICBjb25zdCBwcmV2aWV3TGF5ZXIgPSByb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50XHJcblxyXG4gICAgLy8gUmVtb3ZlIHByZXZpb3VzXHJcbiAgICBpZiAocm91dGVQcmV2aWV3R3JhcGhpY1JlZi5jdXJyZW50KSB7IHByZXZpZXdMYXllci5yZW1vdmUocm91dGVQcmV2aWV3R3JhcGhpY1JlZi5jdXJyZW50KTsgcm91dGVQcmV2aWV3R3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAoZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpKSBmcm9tTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudC5mb3JFYWNoKChnOiBhbnkpID0+IHByZXZpZXdMYXllci5yZW1vdmUoZykpXHJcbiAgICAgIGVsc2UgcHJldmlld0xheWVyLnJlbW92ZShmcm9tTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudClcclxuICAgICAgZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB9XHJcbiAgICBpZiAodG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCkpIHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudC5mb3JFYWNoKChnOiBhbnkpID0+IHByZXZpZXdMYXllci5yZW1vdmUoZykpXHJcbiAgICAgIGVsc2UgcHJldmlld0xheWVyLnJlbW92ZSh0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpXHJcbiAgICAgIHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJpZCkgcmV0dXJuXHJcblxyXG4gICAgLy8gRmV0Y2ggZ2VvbWV0cnkgKGRvbid0IHJlcXVpcmUgY2FjaGUg4oCUIG5lZWRlZCBmb3IgZGlzYW1iaWd1YXRpb24gaG92ZXIpXHJcbiAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGNvbnN0IHZpZXdXa2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtjb25maWcubmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCB7XHJcbiAgICAgICAgd2hlcmU6IGAke3JvdXRlRmllbGR9ID0gJyR7cmlkLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYCxcclxuICAgICAgICBvdXRGaWVsZHM6IHJvdXRlRmllbGQsXHJcbiAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICd0cnVlJyxcclxuICAgICAgICByZXR1cm5NOiAndHJ1ZScsXHJcbiAgICAgICAgb3V0U1I6IFN0cmluZyh2aWV3V2tpZCksXHJcbiAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICcxJyxcclxuICAgICAgICBmOiAnanNvbidcclxuICAgICAgfSlcclxuICAgICAgaWYgKCFqc29uLmZlYXR1cmVzPy5sZW5ndGgpIHJldHVyblxyXG4gICAgICBjb25zdCBwYXRocyA9IGpzb24uZmVhdHVyZXNbMF0uZ2VvbWV0cnk/LnBhdGhzXHJcbiAgICAgIGlmICghcGF0aHM/Lmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gICAgICBjb25zdCBbR3JhcGhpYywgUG9seWxpbmUsIFNpbXBsZUxpbmVTeW1ib2xdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvZ2VvbWV0cnkvUG9seWxpbmUnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL3N5bWJvbHMvU2ltcGxlTGluZVN5bWJvbCcpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pXHJcbiAgICAgIF0pXHJcblxyXG4gICAgICBjb25zdCByb3V0ZUdyYXBoaWMgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgICAgZ2VvbWV0cnk6IG5ldyBQb2x5bGluZSh7IHBhdGhzLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQ6IHZpZXdXa2lkIH0gfSksXHJcbiAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTGluZVN5bWJvbCh7IGNvbG9yOiBbMjIwLCA2MCwgNjAsIDE4MF0sIHdpZHRoOiAzLCBzdHlsZTogJ2Rhc2gnIH0pXHJcbiAgICAgIH0pXHJcbiAgICAgIHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCA9IHJvdXRlR3JhcGhpY1xyXG4gICAgICBwcmV2aWV3TGF5ZXIuYWRkKHJvdXRlR3JhcGhpYylcclxuXHJcbiAgICAgIC8vIFpvb20gdG8gcm91dGVcclxuICAgICAgdHJ5IHsgdmlldy5nb1RvKHJvdXRlR3JhcGhpYy5nZW9tZXRyeS5leHRlbnQuZXhwYW5kKDEuMyksIHsgZHVyYXRpb246IDgwMCB9KSB9IGNhdGNoIChfKSB7fVxyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUud2Fybignc2hvd1JvdXRlUHJldmlldyBmYWlsZWQ6JywgZXJyKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWddKVxyXG4gIHNob3dSb3V0ZVByZXZpZXdSZWYuY3VycmVudCA9IHNob3dSb3V0ZVByZXZpZXdcclxuXHJcbiAgLy8gU2hvdyBhIG1lYXN1cmUgcG9pbnQgKGdyZWVuPWZyb20sIHJlZD10bykgb24gdGhlIG1hcFxyXG4gIGNvbnN0IHNob3dNZWFzdXJlUG9pbnQgPSB1c2VDYWxsYmFjayhhc3luYyAod2hpY2g6ICdmcm9tJyB8ICd0bycsIG1lYXN1cmVWYWw6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFyb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50KSByZXR1cm5cclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcbiAgICBjb25zdCBtID0gcGFyc2VGbG9hdChtZWFzdXJlVmFsKVxyXG4gICAgaWYgKGlzTmFOKG0pKSByZXR1cm5cclxuXHJcbiAgICBjb25zdCByZWYgPSB3aGljaCA9PT0gJ2Zyb20nID8gZnJvbU1lYXN1cmVHcmFwaGljUmVmIDogdG9NZWFzdXJlR3JhcGhpY1JlZlxyXG4gICAgaWYgKHJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IGxheWVyID0gcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudFxyXG4gICAgICBpZiAobGF5ZXIpIHtcclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShyZWYuY3VycmVudCkpIHJlZi5jdXJyZW50LmZvckVhY2goKGc6IGFueSkgPT4gbGF5ZXIucmVtb3ZlKGcpKVxyXG4gICAgICAgIGVsc2UgbGF5ZXIucmVtb3ZlKHJlZi5jdXJyZW50KVxyXG4gICAgICB9XHJcbiAgICAgIHJlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgdmVydGljZXMsIG1JZHggfSA9IHJvdXRlUHJldmlld1ZlcnRzUmVmLmN1cnJlbnRcclxuXHJcbiAgICAvLyBJbnRlcnBvbGF0ZSBwb2ludCBhdCBtZWFzdXJlXHJcbiAgICBsZXQgcHQ6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwgPSBudWxsXHJcbiAgICBpZiAobSA8PSAodmVydGljZXNbMF1bbUlkeF0gfHwgMCkpIHtcclxuICAgICAgcHQgPSB7IHg6IHZlcnRpY2VzWzBdWzBdLCB5OiB2ZXJ0aWNlc1swXVsxXSB9XHJcbiAgICB9IGVsc2UgaWYgKG0gPj0gKHZlcnRpY2VzW3ZlcnRpY2VzLmxlbmd0aCAtIDFdW21JZHhdIHx8IDApKSB7XHJcbiAgICAgIHB0ID0geyB4OiB2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVswXSwgeTogdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bMV0gfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICBjb25zdCBtMSA9IHZlcnRpY2VzW2ldW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBtMiA9IHZlcnRpY2VzW2kgKyAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgaWYgKG0gPj0gbTEgJiYgbSA8PSBtMikge1xyXG4gICAgICAgICAgY29uc3QgZnJhYyA9IG0yICE9PSBtMSA/IChtIC0gbTEpIC8gKG0yIC0gbTEpIDogMFxyXG4gICAgICAgICAgcHQgPSB7IHg6IHZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSksIHk6IHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSkgfVxyXG4gICAgICAgICAgYnJlYWtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghcHQpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IFtHcmFwaGljLCBQb2ludCwgU2ltcGxlTWFya2VyU3ltYm9sLCBUZXh0U3ltYm9sXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9HcmFwaGljJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvZ2VvbWV0cnkvUG9pbnQnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1NpbXBsZU1hcmtlclN5bWJvbCcpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL3N5bWJvbHMvVGV4dFN5bWJvbCcpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pXHJcbiAgICBdKVxyXG5cclxuICAgIGNvbnN0IGNvbG9yID0gd2hpY2ggPT09ICdmcm9tJyA/IFszNCwgMTM5LCAzNCwgMjU1XSA6IFsxODAsIDAsIDAsIDI1NV1cclxuICAgIGNvbnN0IGxhYmVsID0gd2hpY2ggPT09ICdmcm9tJyA/IGBGcm9tOiAke20udG9GaXhlZCgzKX1gIDogYFRvOiAke20udG9GaXhlZCgzKX1gXHJcblxyXG4gICAgY29uc3QgcG9pbnRHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogcHQueCwgeTogcHQueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pLFxyXG4gICAgICBzeW1ib2w6IG5ldyBTaW1wbGVNYXJrZXJTeW1ib2woeyBjb2xvciwgc2l6ZTogMTIsIG91dGxpbmU6IHsgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgd2lkdGg6IDIgfSB9KVxyXG4gICAgfSlcclxuICAgIGNvbnN0IGxhYmVsR3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHB0LngsIHk6IHB0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgc3ltYm9sOiBuZXcgVGV4dFN5bWJvbCh7IHRleHQ6IGxhYmVsLCBjb2xvcjogWzI1NSwgMjU1LCAyNTVdLCBoYWxvQ29sb3I6IFswLCAwLCAwXSwgaGFsb1NpemU6IDEuNSwgZm9udDogeyBzaXplOiAxMSwgd2VpZ2h0OiAnYm9sZCcgfSwgeW9mZnNldDogMTQgfSlcclxuICAgIH0pXHJcblxyXG4gICAgcmVmLmN1cnJlbnQgPSBbcG9pbnRHcmFwaGljLCBsYWJlbEdyYXBoaWNdXHJcbiAgICBjb25zdCBsYXllciA9IHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnRcclxuICAgIGlmIChsYXllcikgeyBsYXllci5hZGQocG9pbnRHcmFwaGljKTsgbGF5ZXIuYWRkKGxhYmVsR3JhcGhpYykgfVxyXG4gICAgZWxzZSB7IHZpZXcuZ3JhcGhpY3MuYWRkKHBvaW50R3JhcGhpYyk7IHZpZXcuZ3JhcGhpY3MuYWRkKGxhYmVsR3JhcGhpYykgfVxyXG4gIH0sIFtdKVxyXG4gIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCA9IHNob3dNZWFzdXJlUG9pbnRcclxuXHJcbiAgLy8gUGljayBmcm9tL3RvIG1lYXN1cmUgb24gbWFwIChzbmFwIHRvIHJvdXRlIGdlb21ldHJ5KVxyXG4gIGNvbnN0IHN0YXJ0UGlja01lYXN1cmUgPSB1c2VDYWxsYmFjaygod2hpY2g6ICdmcm9tJyB8ICd0bycpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSByZXR1cm5cclxuICAgIGlmICghcm91dGVJZC50cmltKCkpIHsgc2V0RXJyb3IoJ1NlbGVjdCBhIHJvdXRlIGZpcnN0Jyk7IHJldHVybiB9XHJcbiAgICBpZiAoIXJvdXRlUHJldmlld1ZlcnRzUmVmLmN1cnJlbnQpIHsgc2V0RXJyb3IoJ1JvdXRlIGdlb21ldHJ5IG5vdCBsb2FkZWQnKTsgcmV0dXJuIH1cclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcblxyXG4gICAgaWYgKG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudCkgeyBtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG5cclxuICAgIHNldFBpY2tpbmdNZWFzdXJlKHdoaWNoKVxyXG4gICAgdmlldy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJ2Nyb3NzaGFpcidcclxuXHJcbiAgICBjb25zdCBtb2R1bGVzUHJvbWlzZSA9IFByb21pc2UuYWxsKFtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9HcmFwaGljJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9nZW9tZXRyeS9Qb2ludCcpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pXHJcbiAgICBdKVxyXG5cclxuICAgIGlmICghbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCkge1xyXG4gICAgICBjb25zdCB0aXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICB0aXAuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTtwb2ludGVyLWV2ZW50czpub25lO2JhY2tncm91bmQ6IzMzMztjb2xvcjojZmZmO3BhZGRpbmc6NHB4IDhweDtib3JkZXItcmFkaXVzOjRweDtmb250LXNpemU6MTJweDt3aGl0ZS1zcGFjZTpub3dyYXA7ei1pbmRleDo5OTk5OTtkaXNwbGF5Om5vbmU7Ym94LXNoYWRvdzowIDJweCA2cHggcmdiYSgwLDAsMCwwLjMpOydcclxuICAgICAgdmlldy5jb250YWluZXIuYXBwZW5kQ2hpbGQodGlwKVxyXG4gICAgICBtZWFzdXJlVG9vbHRpcFJlZi5jdXJyZW50ID0gdGlwXHJcbiAgICB9XHJcbiAgICBjb25zdCB0b29sdGlwID0gbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCFcclxuICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG5cclxuICAgIGNvbnN0IHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH0gPSByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50IVxyXG5cclxuICAgIGZ1bmN0aW9uIG5lYXJlc3RNT25Sb3V0ZSAocHg6IG51bWJlciwgcHk6IG51bWJlcik6IHsgbTogbnVtYmVyOyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCB7XHJcbiAgICAgIGxldCBiZXN0RGlzdCA9IEluZmluaXR5LCBiZXN0WCA9IHB4LCBiZXN0WSA9IHB5LCBiZXN0TSA9IDBcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbGxWZXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICBjb25zdCBbYXgsIGF5XSA9IGFsbFZlcnRzW2ldXHJcbiAgICAgICAgY29uc3QgW2J4LCBieV0gPSBhbGxWZXJ0c1tpICsgMV1cclxuICAgICAgICBjb25zdCBtQSA9IGFsbFZlcnRzW2ldW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBtQiA9IGFsbFZlcnRzW2kgKyAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgZHggPSBieCAtIGF4LCBkeSA9IGJ5IC0gYXlcclxuICAgICAgICBjb25zdCBsZW5TcSA9IGR4ICogZHggKyBkeSAqIGR5XHJcbiAgICAgICAgaWYgKGxlblNxID09PSAwKSBjb250aW51ZVxyXG4gICAgICAgIGxldCB0ID0gKChweCAtIGF4KSAqIGR4ICsgKHB5IC0gYXkpICogZHkpIC8gbGVuU3FcclxuICAgICAgICB0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdCkpXHJcbiAgICAgICAgY29uc3QgY3ggPSBheCArIHQgKiBkeCwgY3kgPSBheSArIHQgKiBkeVxyXG4gICAgICAgIGNvbnN0IGQgPSAocHggLSBjeCkgKiAocHggLSBjeCkgKyAocHkgLSBjeSkgKiAocHkgLSBjeSlcclxuICAgICAgICBpZiAoZCA8IGJlc3REaXN0KSB7IGJlc3REaXN0ID0gZDsgYmVzdFggPSBjeDsgYmVzdFkgPSBjeTsgYmVzdE0gPSBtQSArIHQgKiAobUIgLSBtQSkgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBiZXN0RGlzdCA8IEluZmluaXR5ID8geyBtOiBiZXN0TSwgeDogYmVzdFgsIHk6IGJlc3RZIH0gOiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgLy8gUG9pbnRlci1tb3ZlOiBzbmFwIGFuZCBzaG93IE0gdmFsdWVcclxuICAgIG1vZHVsZXNQcm9taXNlLnRoZW4oKFtHcmFwaGljLCBTaW1wbGVNYXJrZXJTeW1ib2wsIFBvaW50XSkgPT4ge1xyXG4gICAgICBtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdwb2ludGVyLW1vdmUnLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1hcFBvaW50ID0gdmlldy50b01hcCh7IHg6IGV2ZW50LngsIHk6IGV2ZW50LnkgfSlcclxuICAgICAgICBpZiAoIW1hcFBvaW50KSByZXR1cm5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZWFyZXN0TU9uUm91dGUobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICBpZiAoIXJlc3VsdCkgcmV0dXJuXHJcblxyXG4gICAgICAgIHRvb2x0aXAuc3R5bGUubGVmdCA9IGAke2V2ZW50LnggKyAxNH1weGBcclxuICAgICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IGAke2V2ZW50LnkgLSA0MH1weGBcclxuICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gYE06ICR7cmVzdWx0Lm0udG9GaXhlZCgzKX1gXHJcbiAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICAgICAgICBpZiAobWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgIG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50Lmdlb21ldHJ5ID0gbmV3IFBvaW50KHsgeDogcmVzdWx0LngsIHk6IHJlc3VsdC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSlcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgY29uc3QgZyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHJlc3VsdC54LCB5OiByZXN1bHQueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pLFxyXG4gICAgICAgICAgICBzeW1ib2w6IG5ldyBTaW1wbGVNYXJrZXJTeW1ib2woeyBjb2xvcjogWzI1NSwgODcsIDM0LCAyNTVdLCBzaXplOiAxMCwgb3V0bGluZTogeyBjb2xvcjogWzI1NSwgMjU1LCAyNTVdLCB3aWR0aDogMiB9IH0pXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgbWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBnXHJcbiAgICAgICAgICB2aWV3LmdyYXBoaWNzLmFkZChnKVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIC8vIENsaWNrOiBzZXQgdGhlIG1lYXN1cmUgdmFsdWVcclxuICAgICAgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdjbGljaycsIChldmVudDogYW55KSA9PiB7XHJcbiAgICAgICAgY29uc3QgbWFwUG9pbnQgPSB2aWV3LnRvTWFwKHsgeDogZXZlbnQueCwgeTogZXZlbnQueSB9KVxyXG4gICAgICAgIGlmICghbWFwUG9pbnQpIHJldHVyblxyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IG5lYXJlc3RNT25Sb3V0ZShtYXBQb2ludC54LCBtYXBQb2ludC55KVxyXG4gICAgICAgIGlmIChyZXN1bHQpIHtcclxuICAgICAgICAgIGNvbnN0IG1WYWwgPSByZXN1bHQubS50b0ZpeGVkKDMpXHJcbiAgICAgICAgICBpZiAod2hpY2ggPT09ICdmcm9tJykge1xyXG4gICAgICAgICAgICBzZXRGcm9tTWVhc3VyZShtVmFsKVxyXG4gICAgICAgICAgICBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ2Zyb20nLCBtVmFsKVxyXG4gICAgICAgICAgICBjYW5jZWxQaWNrTWVhc3VyZSgpXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4gc3RhcnRQaWNrTWVhc3VyZSgndG8nKSwgNTApXHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2V0VG9NZWFzdXJlKG1WYWwpXHJcbiAgICAgICAgICAgIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgndG8nLCBtVmFsKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjYW5jZWxQaWNrTWVhc3VyZSgpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH0sIFtjb25maWcsIHJvdXRlSWRdKVxyXG5cclxuICBjb25zdCBjYW5jZWxQaWNrTWVhc3VyZSA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGlmIChtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudCkgeyBtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChtZWFzdXJlVG9vbHRpcFJlZi5jdXJyZW50KSBtZWFzdXJlVG9vbHRpcFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIGlmIChtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudCAmJiBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3KSB7XHJcbiAgICAgIChqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55KS5ncmFwaGljcy5yZW1vdmUobWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQpXHJcbiAgICAgIG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgfVxyXG4gICAgaWYgKGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcpIHtcclxuICAgICAgKGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnkpLmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJ1xyXG4gICAgfVxyXG4gICAgc2V0UGlja2luZ01lYXN1cmUobnVsbClcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gQ2xlYXIgYWxsIHJvdXRlIHByZXZpZXcgZ3JhcGhpY3NcclxuICBjb25zdCBjbGVhclJvdXRlUHJldmlldyA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGlmIChyb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50KSByb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50LnJlbW92ZUFsbCgpXHJcbiAgICByb3V0ZVByZXZpZXdHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICBmcm9tTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIHJvdXRlUHJldmlld1ZlcnRzUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIFBpY2sgcm91dGUgZnJvbSBtYXAgKHdpdGggaG92ZXIgdG9vbHRpcCArIHNuYXAgZ3JhcGhpYyBsaWtlIHJvYWQtbG9nKVxyXG4gIGNvbnN0IHN0YXJ0UGlja0Zyb21NYXAgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG5cclxuICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICBzZXRQaWNraW5nRnJvbU1hcCh0cnVlKVxyXG4gICAgdmlldy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJ2Nyb3NzaGFpcidcclxuXHJcbiAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICBjb25zdCBuYW1lRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlTmFtZUZpZWxkIHx8ICdyb3V0ZV9uYW1lJ1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCBxdWVyeVVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuICAgIGNvbnN0IG91dEZpZWxkcyA9IGAke3JvdXRlRmllbGR9LCR7bmFtZUZpZWxkfWBcclxuICAgIGNvbnN0IHZpZXdXa2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG5cclxuICAgIC8vIENyZWF0ZSB0b29sdGlwXHJcbiAgICBpZiAoIXBpY2tUb29sdGlwUmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgdGlwLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7cG9pbnRlci1ldmVudHM6bm9uZTtiYWNrZ3JvdW5kOiMzMzM7Y29sb3I6I2ZmZjtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3otaW5kZXg6OTk5OTk7ZGlzcGxheTpub25lO2JveC1zaGFkb3c6MCAycHggNnB4IHJnYmEoMCwwLDAsMC4zKTsnXHJcbiAgICAgIHZpZXcuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpcClcclxuICAgICAgcGlja1Rvb2x0aXBSZWYuY3VycmVudCA9IHRpcFxyXG4gICAgfVxyXG4gICAgY29uc3QgdG9vbHRpcCA9IHBpY2tUb29sdGlwUmVmLmN1cnJlbnQhXHJcbiAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbiAgICBsZXQgbGFzdFF1ZXJ5SWQgPSAwXHJcbiAgICBsZXQgY2FjaGVkUGF0aHM6IG51bWJlcltdW11bXVtdID0gW11cclxuICAgIGxldCBjYWNoZWRMYWJlbHM6IHN0cmluZ1tdID0gW11cclxuICAgIGxldCBsYXN0UXVlcnlQdDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCA9IG51bGxcclxuICAgIGNvbnN0IFJFUVVFUllfRElTVCA9IDgwXHJcblxyXG4gICAgLy8gTG9hZCBBcmNHSVMgbW9kdWxlcyBmb3Igc25hcCBncmFwaGljXHJcbiAgICBjb25zdCBtb2R1bGVzUHJvbWlzZSA9IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL0dyYXBoaWMnLCAnZXNyaS9zeW1ib2xzL1NpbXBsZU1hcmtlclN5bWJvbCcsICdlc3JpL2dlb21ldHJ5L1BvaW50J10sICguLi5tOiBhbnlbXSkgPT4gcmVzb2x2ZShtKSlcclxuICAgIH0pXHJcblxyXG4gICAgLy8gSGVscGVyOiBzbmFwIHRvIG5lYXJlc3QgcG9pbnQgb24gY2FjaGVkIHBhdGhzXHJcbiAgICBmdW5jdGlvbiBzbmFwVG9OZWFyZXN0IChweDogbnVtYmVyLCBweTogbnVtYmVyKTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9IHwgbnVsbCB7XHJcbiAgICAgIGxldCBiZXN0RGlzdCA9IEluZmluaXR5LCBiZXN0WCA9IHB4LCBiZXN0WSA9IHB5XHJcbiAgICAgIGZvciAoY29uc3QgcGF0aHMgb2YgY2FjaGVkUGF0aHMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIHtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgW2F4LCBheV0gPSBwYXRoW2ldXHJcbiAgICAgICAgICAgIGNvbnN0IFtieCwgYnldID0gcGF0aFtpICsgMV1cclxuICAgICAgICAgICAgY29uc3QgZHggPSBieCAtIGF4LCBkeSA9IGJ5IC0gYXlcclxuICAgICAgICAgICAgY29uc3QgbGVuU3EgPSBkeCAqIGR4ICsgZHkgKiBkeVxyXG4gICAgICAgICAgICBpZiAobGVuU3EgPT09IDApIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGxldCB0ID0gKChweCAtIGF4KSAqIGR4ICsgKHB5IC0gYXkpICogZHkpIC8gbGVuU3FcclxuICAgICAgICAgICAgdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHQpKVxyXG4gICAgICAgICAgICBjb25zdCBjeCA9IGF4ICsgdCAqIGR4LCBjeSA9IGF5ICsgdCAqIGR5XHJcbiAgICAgICAgICAgIGNvbnN0IGQgPSAocHggLSBjeCkgKiAocHggLSBjeCkgKyAocHkgLSBjeSkgKiAocHkgLSBjeSlcclxuICAgICAgICAgICAgaWYgKGQgPCBiZXN0RGlzdCkgeyBiZXN0RGlzdCA9IGQ7IGJlc3RYID0gY3g7IGJlc3RZID0gY3kgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmVzdERpc3QgPCBJbmZpbml0eSA/IHsgeDogYmVzdFgsIHk6IGJlc3RZIH0gOiBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgLy8gSG92ZXI6IHNob3cgcm91dGUgbmFtZSB0b29sdGlwICsgc25hcCBncmFwaGljXHJcbiAgICBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdwb2ludGVyLW1vdmUnLCBhc3luYyAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHtldmVudC54ICsgMTR9cHhgXHJcbiAgICAgIHRvb2x0aXAuc3R5bGUudG9wID0gYCR7ZXZlbnQueSAtIDQwfXB4YFxyXG5cclxuICAgICAgY29uc3QgbWFwUG9pbnQgPSB2aWV3LnRvTWFwKHsgeDogZXZlbnQueCwgeTogZXZlbnQueSB9KVxyXG4gICAgICBpZiAoIW1hcFBvaW50KSByZXR1cm5cclxuXHJcbiAgICAgIC8vIFNuYXAgdXNpbmcgY2FjaGVkIGdlb21ldHJ5XHJcbiAgICAgIGlmIChjYWNoZWRQYXRocy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3Qgc25hcCA9IHNuYXBUb05lYXJlc3QobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICBpZiAoc25hcCkge1xyXG4gICAgICAgICAgY29uc3QgW0dyYXBoaWMsIFNpbXBsZU1hcmtlclN5bWJvbCwgUG9pbnRdID0gYXdhaXQgbW9kdWxlc1Byb21pc2VcclxuICAgICAgICAgIGlmIChwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHNuYXBHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBzbmFwLngsIHk6IHNuYXAueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pLFxyXG4gICAgICAgICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yOiBbMCwgMTIyLCAyNTUsIDI1NV0sIHNpemU6IDEwLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBzbmFwR3JhcGhpY1xyXG4gICAgICAgICAgICB2aWV3LmdyYXBoaWNzLmFkZChzbmFwR3JhcGhpYylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENoZWNrIGlmIGN1cnNvciBtb3ZlZCBmYXIgZW5vdWdoIHRvIHJlLXF1ZXJ5XHJcbiAgICAgIGlmIChsYXN0UXVlcnlQdCkge1xyXG4gICAgICAgIGNvbnN0IGR4ID0gbWFwUG9pbnQueCAtIGxhc3RRdWVyeVB0LnhcclxuICAgICAgICBjb25zdCBkeSA9IG1hcFBvaW50LnkgLSBsYXN0UXVlcnlQdC55XHJcbiAgICAgICAgaWYgKE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSkgPCBSRVFVRVJZX0RJU1QpIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KVxyXG4gICAgICBwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgICAgICBjb25zdCBxdWVyeUlkID0gKytsYXN0UXVlcnlJZFxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBKU09OLnN0cmluZ2lmeShtYXBQb2ludC50b0pTT04oKSksXHJcbiAgICAgICAgICAgIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvaW50JyxcclxuICAgICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICAgIGRpc3RhbmNlOiAnNTAnLFxyXG4gICAgICAgICAgICB1bml0czogJ2VzcmlTUlVuaXRfTWV0ZXInLFxyXG4gICAgICAgICAgICBvdXRGaWVsZHMsXHJcbiAgICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzUnLFxyXG4gICAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QocXVlcnlVcmwsIHBhcmFtcylcclxuICAgICAgICAgIGlmIChxdWVyeUlkICE9PSBsYXN0UXVlcnlJZCkgcmV0dXJuXHJcbiAgICAgICAgICBsYXN0UXVlcnlQdCA9IHsgeDogbWFwUG9pbnQueCwgeTogbWFwUG9pbnQueSB9XHJcblxyXG4gICAgICAgICAgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgY2FjaGVkUGF0aHMgPSBqc29uLmZlYXR1cmVzLm1hcCgoZjogYW55KSA9PiBmLmdlb21ldHJ5Py5wYXRocyB8fCBbXSlcclxuICAgICAgICAgICAgY2FjaGVkTGFiZWxzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJpZCA9IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgICAgIGNvbnN0IHJuYW1lID0gZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgJydcclxuICAgICAgICAgICAgICByZXR1cm4gcm5hbWUgPyBgJHtybmFtZX0gKCR7cmlkfSlgIDogcmlkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRvb2x0aXAudGV4dENvbnRlbnQgPSBjYWNoZWRMYWJlbHMuam9pbignXFxuJylcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS53aGl0ZVNwYWNlID0gY2FjaGVkTGFiZWxzLmxlbmd0aCA+IDEgPyAncHJlLWxpbmUnIDogJ25vd3JhcCdcclxuICAgICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJ1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHNuYXAgd2l0aCBmcmVzaCBnZW9tZXRyeVxyXG4gICAgICAgICAgICBjb25zdCBzbmFwID0gc25hcFRvTmVhcmVzdChtYXBQb2ludC54LCBtYXBQb2ludC55KVxyXG4gICAgICAgICAgICBpZiAoc25hcCkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IFtHcmFwaGljLCBTaW1wbGVNYXJrZXJTeW1ib2wsIFBvaW50XSA9IGF3YWl0IG1vZHVsZXNQcm9taXNlXHJcbiAgICAgICAgICAgICAgaWYgKHF1ZXJ5SWQgIT09IGxhc3RRdWVyeUlkKSByZXR1cm5cclxuICAgICAgICAgICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50Lmdlb21ldHJ5ID0gbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3I6IFswLCAxMjIsIDI1NSwgMjU1XSwgc2l6ZTogMTAsIG91dGxpbmU6IHsgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgd2lkdGg6IDIgfSB9KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gZ1xyXG4gICAgICAgICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoZylcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICAgICAgICBjYWNoZWRQYXRocyA9IFtdXHJcbiAgICAgICAgICAgIGNhY2hlZExhYmVscyA9IFtdXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICB9XHJcbiAgICAgIH0sIDEwMClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gQ2xpY2s6IHNlbGVjdCByb3V0ZVxyXG4gICAgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IHZpZXcub24oJ2NsaWNrJywgYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgaWYgKHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgICBpZiAocGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICAgIGlmIChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xyXG4gICAgICB2aWV3LmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJ1xyXG4gICAgICBzZXRQaWNraW5nRnJvbU1hcChmYWxzZSlcclxuICAgICAgLy8gUmVtb3ZlIHNuYXAgZ3JhcGhpY1xyXG4gICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHsgdmlldy5ncmFwaGljcy5yZW1vdmUocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpOyBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICBnZW9tZXRyeTogSlNPTi5zdHJpbmdpZnkoZXZlbnQubWFwUG9pbnQudG9KU09OKCkpLFxyXG4gICAgICAgICAgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5UG9pbnQnLFxyXG4gICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICBkaXN0YW5jZTogJzUwJyxcclxuICAgICAgICAgIHVuaXRzOiAnZXNyaVNSVW5pdF9NZXRlcicsXHJcbiAgICAgICAgICBvdXRGaWVsZHMsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMTAnLFxyXG4gICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGpzb24gPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QocXVlcnlVcmwsIHBhcmFtcylcclxuXHJcbiAgICAgICAgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSBqc29uLmZlYXR1cmVzLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICAgICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF0gfHwgJycsXHJcbiAgICAgICAgICAgIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICB9KSlcclxuICAgICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxyXG4gICAgICAgICAgY29uc3QgdW5pcXVlID0gY2FuZGlkYXRlcy5maWx0ZXIoKGM6IGFueSkgPT4geyBpZiAoc2Vlbi5oYXMoYy5yb3V0ZUlkKSkgcmV0dXJuIGZhbHNlOyBzZWVuLmFkZChjLnJvdXRlSWQpOyByZXR1cm4gdHJ1ZSB9KVxyXG4gICAgICAgICAgaWYgKHVuaXF1ZS5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICAgIHNldFJvdXRlUGlja0NhbmRpZGF0ZXModW5pcXVlKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgc2V0Um91dGVJZCh1bmlxdWVbMF0ucm91dGVJZClcclxuICAgICAgICAgICAgc2V0Um91dGVOYW1lKHVuaXF1ZVswXS5yb3V0ZU5hbWUpXHJcbiAgICAgICAgICAgIGZldGNoUm91dGVNZWFzdXJlcyh1bmlxdWVbMF0ucm91dGVJZClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGpzb24uZmVhdHVyZXM/Lmxlbmd0aCA9PT0gMSkge1xyXG4gICAgICAgICAgY29uc3QgYXR0cnMgPSBqc29uLmZlYXR1cmVzWzBdLmF0dHJpYnV0ZXNcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IGF0dHJzW3JvdXRlRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICBjb25zdCBybmFtZSA9IGF0dHJzW25hbWVGaWVsZF0gfHwgJydcclxuICAgICAgICAgIHNldFJvdXRlSWQocmlkKVxyXG4gICAgICAgICAgc2V0Um91dGVOYW1lKHJuYW1lIHx8IHJpZClcclxuICAgICAgICAgIGZldGNoUm91dGVNZWFzdXJlcyhyaWQpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNldEVycm9yKCdObyByb3V0ZSBmb3VuZCBhdCB0aGF0IGxvY2F0aW9uJylcclxuICAgICAgICB9XHJcbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBpZGVudGlmeSByb3V0ZTogJyArIChlcnIubWVzc2FnZSB8fCBlcnIpKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0sIFtjb25maWcsIGZldGNoUm91dGVNZWFzdXJlc10pXHJcblxyXG4gIGNvbnN0IGNhbmNlbFBpY2tGcm9tTWFwID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudClcclxuICAgIGlmIChwaWNrVG9vbHRpcFJlZi5jdXJyZW50KSBwaWNrVG9vbHRpcFJlZi5jdXJyZW50LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgIGlmIChqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3KSB7XHJcbiAgICAgIGNvbnN0IHYgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcbiAgICAgIHYuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICcnXHJcbiAgICAgIGlmIChwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCkgeyB2LmdyYXBoaWNzLnJlbW92ZShwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCk7IHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICB9XHJcbiAgICBzZXRQaWNraW5nRnJvbU1hcChmYWxzZSlcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gRHJhdyBwb2x5Z29uIHRvIHNlbGVjdCBtdWx0aXBsZSByb3V0ZXNcclxuICBjb25zdCBzdGFydERyYXdBcmVhID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICBzZXREcmF3aW5nKHRydWUpXHJcbiAgICBzZXRNYXBSb3V0ZXMoW10pXHJcbiAgICBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQoKSlcclxuXHJcbiAgICBjb25zdCBbR3JhcGhpY3NMYXllciwgU2tldGNoVmlld01vZGVsXSA9IGF3YWl0IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL2xheWVycy9HcmFwaGljc0xheWVyJywgJ2Vzcmkvd2lkZ2V0cy9Ta2V0Y2gvU2tldGNoVmlld01vZGVsJ10sICguLi5tOiBhbnlbXSkgPT4gcmVzb2x2ZShtKSlcclxuICAgIH0pXHJcblxyXG4gICAgaWYgKCFncmFwaGljc0xheWVyUmVmLmN1cnJlbnQpIHtcclxuICAgICAgZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50ID0gbmV3IEdyYXBoaWNzTGF5ZXIoeyB0aXRsZTogJ0NyYXNoUmlzayBEcmF3JyB9KVxyXG4gICAgICB2aWV3Lm1hcC5hZGQoZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KVxyXG4gICAgfVxyXG4gICAgZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50LnJlbW92ZUFsbCgpXHJcblxyXG4gICAgaWYgKCFza2V0Y2hWTVJlZi5jdXJyZW50KSB7XHJcbiAgICAgIHNrZXRjaFZNUmVmLmN1cnJlbnQgPSBuZXcgU2tldGNoVmlld01vZGVsKHsgdmlldywgbGF5ZXI6IGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCB9KVxyXG4gICAgfVxyXG5cclxuICAgIHNrZXRjaFZNUmVmLmN1cnJlbnQuY3JlYXRlKCdwb2x5Z29uJylcclxuICAgIHNrZXRjaFZNUmVmLmN1cnJlbnQub24oJ2NyZWF0ZScsIGFzeW5jIChldnQ6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoZXZ0LnN0YXRlICE9PSAnY29tcGxldGUnKSByZXR1cm5cclxuICAgICAgc2V0RHJhd2luZyhmYWxzZSlcclxuXHJcbiAgICAgIGNvbnN0IHBvbHlnb24gPSBldnQuZ3JhcGhpYy5nZW9tZXRyeVxyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlSWRGaWVsZCB8fCAnY3VzdG9tcm91dGVmaWVsZCdcclxuICAgICAgICBjb25zdCBuYW1lRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlTmFtZUZpZWxkIHx8ICdyb3V0ZV9uYW1lJ1xyXG4gICAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICAgIGNvbnN0IHZpZXdXa2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG4gICAgICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICAgICAgLy8gVXNlIGVudmVsb3BlIGdlb21ldHJ5IGZvciBKU09OUCAocG9seWdvbiBKU09OIGlzIHRvbyBsYXJnZSBmb3IgR0VUKVxyXG4gICAgICAgIGNvbnN0IGV4dCA9IHBvbHlnb24uZXh0ZW50XHJcbiAgICAgICAgY29uc3QgZW52ZWxvcGVKc29uID0geyB4bWluOiBleHQueG1pbiwgeW1pbjogZXh0LnltaW4sIHhtYXg6IGV4dC54bWF4LCB5bWF4OiBleHQueW1heCwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkOiB2aWV3V2tpZCB9IH1cclxuXHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgZ2VvbWV0cnk6IEpTT04uc3RyaW5naWZ5KGVudmVsb3BlSnNvbiksXHJcbiAgICAgICAgICBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlFbnZlbG9wZScsXHJcbiAgICAgICAgICBzcGF0aWFsUmVsOiAnZXNyaVNwYXRpYWxSZWxJbnRlcnNlY3RzJyxcclxuICAgICAgICAgIG91dEZpZWxkczogYCR7cm91dGVGaWVsZH0sJHtuYW1lRmllbGR9YCxcclxuICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgICByZXR1cm5NOiAndHJ1ZScsXHJcbiAgICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMjAwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdCh1cmwsIHBhcmFtcylcclxuICAgICAgICBjb25zdCByb3V0ZXMgPSAoZGF0YS5mZWF0dXJlcyB8fCBbXSkubWFwKChmOiBhbnkpID0+IHtcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXVxyXG4gICAgICAgICAgY29uc3QgcGF0aHMgPSBmLmdlb21ldHJ5Py5wYXRocyB8fCBbXVxyXG4gICAgICAgICAgY29uc3QgYWxsVmVydHM6IG51bWJlcltdW10gPSBwYXRocy5mbGF0KClcclxuICAgICAgICAgIGNvbnN0IGhhc1ogPSBmLmdlb21ldHJ5Py5oYXNaXHJcbiAgICAgICAgICBjb25zdCBtSWR4ID0gaGFzWiA/IDMgOiAyXHJcbiAgICAgICAgICBsZXQgbWluTSA9IDAsIG1heE0gPSAwXHJcbiAgICAgICAgICBpZiAoYWxsVmVydHMubGVuZ3RoID4gMCAmJiBtSWR4IDwgYWxsVmVydHNbMF0ubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG1lYXN1cmVzID0gYWxsVmVydHMubWFwKHYgPT4gdlttSWR4XSkuZmlsdGVyKG0gPT4gbSAhPSBudWxsICYmICFpc05hTihtKSlcclxuICAgICAgICAgICAgaWYgKG1lYXN1cmVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICBtaW5NID0gTWF0aC5taW4oLi4ubWVhc3VyZXMpXHJcbiAgICAgICAgICAgICAgbWF4TSA9IE1hdGgubWF4KC4uLm1lYXN1cmVzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LnNldChyaWQsIHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4geyByb3V0ZUlkOiByaWQsIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgbnVsbCwgZnJvbU1lYXN1cmU6IG1pbk0sIHRvTWVhc3VyZTogbWF4TSB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICBzZXRNYXBSb3V0ZXMocm91dGVzKVxyXG4gICAgICAgIHNldFNlbGVjdGVkTWFwUm91dGVJZHMobmV3IFNldChyb3V0ZXMubWFwKChyOiBhbnkpID0+IHIucm91dGVJZCkpKVxyXG4gICAgICAgIHNldFNlYXJjaE1vZGUoJ21hcCcpXHJcbiAgICAgIH0gY2F0Y2ggKGU6IGFueSkge1xyXG4gICAgICAgIHNldEVycm9yKCdBcmVhIHF1ZXJ5IGZhaWxlZDogJyArIChlLm1lc3NhZ2UgfHwgZSkpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfSwgW2NvbmZpZ10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFFVRVJZIEVWRU5UIERBVEEgKGludGVybmFsLCB0cmlnZ2VyZWQgYnkgUnVuKSA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBxdWVyeUV2ZW50RGF0YSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpOiBQcm9taXNlPGFueVtdPiA9PiB7XHJcbiAgICBpZiAoIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgdGhyb3cgbmV3IEVycm9yKCdObyBMUlMgc2VydmljZSBjb25maWd1cmVkJylcclxuXHJcbiAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuXHJcbiAgICBsZXQgcm91dGVJZHM6IHN0cmluZ1tdID0gW11cclxuICAgIGlmIChzZWFyY2hNb2RlID09PSAnbWFwJykge1xyXG4gICAgICByb3V0ZUlkcyA9IEFycmF5LmZyb20oc2VsZWN0ZWRNYXBSb3V0ZUlkcylcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICghcm91dGVJZC50cmltKCkpIHRocm93IG5ldyBFcnJvcignRW50ZXIgYSBSb3V0ZSBJRCBvciBzZWxlY3QgZnJvbSBtYXAuJylcclxuICAgICAgcm91dGVJZHMgPSBbcm91dGVJZC50cmltKCldXHJcbiAgICB9XHJcbiAgICBpZiAocm91dGVJZHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHJvdXRlcyBzZWxlY3RlZC4nKVxyXG5cclxuICAgIGNvbnN0IGFsbEVudHJpZXM6IGFueVtdID0gW11cclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgZm9yIChjb25zdCBjZmcgb2YgZXZlbnRDb25maWdzKSB7XHJcbiAgICAgIGNvbnN0IGxheWVyVXJsID0gYCR7YmFzZU1hcFVybH0vJHtjZmcubGF5ZXJJZH0vcXVlcnlgXHJcbiAgICAgIC8vIFVzZSBkaXNjb3ZlcmVkIGZpZWxkIG5hbWVzIGZyb20gTFJTIG1ldGFkYXRhIChmYWxsIGJhY2sgdG8gY29uZmlnLCB0aGVuIGRlZmF1bHRzKVxyXG4gICAgICBjb25zdCBkaXNjb3ZlcmVkID0gZXZlbnRGaWVsZE5hbWVzUmVmLmN1cnJlbnQuZ2V0KGNmZy5sYXllcklkKVxyXG4gICAgICBjb25zdCByb3V0ZUlkRmllbGQgPSBkaXNjb3ZlcmVkPy5yb3V0ZUlkRmllbGQgfHwgY2ZnLnJvdXRlSWRGaWVsZCB8fCAncm91dGVpZCdcclxuICAgICAgY29uc3QgbWVhc3VyZUZpZWxkID0gZGlzY292ZXJlZD8ubWVhc3VyZUZpZWxkIHx8IGNmZy5tZWFzdXJlRmllbGQgfHwgY2ZnLmZyb21NZWFzdXJlRmllbGQgfHwgJ21lYXN1cmUnXHJcbiAgICAgIGNvbnN0IGZyb21NZWFzdXJlRmllbGQgPSBkaXNjb3ZlcmVkPy5mcm9tTWVhc3VyZUZpZWxkIHx8IGNmZy5mcm9tTWVhc3VyZUZpZWxkIHx8ICdmcm9tX21lYXN1cmUnXHJcblxyXG4gICAgICBmb3IgKGNvbnN0IHJpZCBvZiByb3V0ZUlkcykge1xyXG4gICAgICAgIGNvbnN0IHdoZXJlID0gYCR7cm91dGVJZEZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2BcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICB3aGVyZSxcclxuICAgICAgICAgIG91dEZpZWxkczogJyonLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdChsYXllclVybCwgcGFyYW1zKVxyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiAoZGF0YS5mZWF0dXJlcyB8fCBbXSkpIHtcclxuICAgICAgICAgIGFsbEVudHJpZXMucHVzaCh7XHJcbiAgICAgICAgICAgIEZlYXR1cmU6IGNmZy5uYW1lLFxyXG4gICAgICAgICAgICBSb3V0ZUlEOiBmLmF0dHJpYnV0ZXNbcm91dGVJZEZpZWxkXSB8fCBmLmF0dHJpYnV0ZXNbJ3JvdXRlaWQnXSxcclxuICAgICAgICAgICAgTWVhc3VyZTogZi5hdHRyaWJ1dGVzW21lYXN1cmVGaWVsZF0gPz8gZi5hdHRyaWJ1dGVzW2Zyb21NZWFzdXJlRmllbGRdLFxyXG4gICAgICAgICAgICAuLi5PYmplY3QuZnJvbUVudHJpZXMoKGNmZy5hdHRyaWJ1dGVzIHx8IFtdKS5tYXAoYSA9PiBbYSwgZi5hdHRyaWJ1dGVzW2FdXSkpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEVuc3VyZSByb3V0ZSBnZW9tZXRyaWVzIGFyZSBjYWNoZWRcclxuICAgIGZvciAoY29uc3QgcmlkIG9mIHJvdXRlSWRzKSB7XHJcbiAgICAgIGlmICghcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnQuaGFzKHJpZCkpIHtcclxuICAgICAgICBhd2FpdCBmZXRjaFJvdXRlTWVhc3VyZXMocmlkKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGFsbEVudHJpZXNcclxuICB9LCBbY29uZmlnLCByb3V0ZUlkLCBzZWFyY2hNb2RlLCBzZWxlY3RlZE1hcFJvdXRlSWRzLCBmZXRjaFJvdXRlTWVhc3VyZXNdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBESVNQTEFZIE9OIE1BUCA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwID0gdXNlQ2FsbGJhY2soYXN5bmMgKGxheWVyVXJsOiBzdHJpbmcsIHRva2VuOiBzdHJpbmcsIHdraWQ6IG51bWJlcikgPT4ge1xyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICBpZiAoIXZpZXcpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IFtGZWF0dXJlTGF5ZXJdID0gYXdhaXQgbmV3IFByb21pc2U8YW55W10+KHJlc29sdmUgPT4ge1xyXG4gICAgICAod2luZG93IGFzIGFueSkucmVxdWlyZShbJ2VzcmkvbGF5ZXJzL0ZlYXR1cmVMYXllciddLCAoLi4ubW9kczogYW55W10pID0+IHJlc29sdmUobW9kcykpXHJcbiAgICB9KVxyXG5cclxuICAgIGNvbnN0IGV4aXN0aW5nTGF5ZXIgPSB2aWV3Lm1hcC5hbGxMYXllcnMuZmluZCgobDogYW55KSA9PiBsLnRpdGxlID09PSAnQ3Jhc2ggUmlzayBQcmVkaWN0aW9uJylcclxuICAgIGlmIChleGlzdGluZ0xheWVyKSB2aWV3Lm1hcC5yZW1vdmUoZXhpc3RpbmdMYXllcilcclxuXHJcbiAgICBjb25zdCBwcmVkaWN0aW9uTGF5ZXIgPSBuZXcgRmVhdHVyZUxheWVyKHtcclxuICAgICAgdXJsOiBsYXllclVybCxcclxuICAgICAgdGl0bGU6ICdDcmFzaCBSaXNrIFByZWRpY3Rpb24nLFxyXG4gICAgICBjdXN0b21QYXJhbWV0ZXJzOiB7IHRva2VuIH0sXHJcbiAgICAgIGRlZmluaXRpb25FeHByZXNzaW9uOiAncmlza19zY29yZSA+IDAnLFxyXG4gICAgICByZW5kZXJlcjoge1xyXG4gICAgICAgIHR5cGU6ICdjbGFzcy1icmVha3MnLFxyXG4gICAgICAgIGZpZWxkOiAncmlza19zY29yZScsXHJcbiAgICAgICAgY2xhc3NCcmVha0luZm9zOiBbXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiAxLCBtYXhWYWx1ZTogMjUsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzU2LCAxNjgsIDAsIDIwMF0sIHdpZHRoOiAzIH0sIGxhYmVsOiAnTG93IFJpc2sgKDEtMjUpJyB9LFxyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogMjYsIG1heFZhbHVlOiA1MCwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbMjU1LCAyNTUsIDAsIDIyMF0sIHdpZHRoOiA0IH0sIGxhYmVsOiAnTWVkaXVtIFJpc2sgKDI2LTUwKScgfSxcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDUxLCBtYXhWYWx1ZTogNzUsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzI1NSwgMTI4LCAwLCAyMzBdLCB3aWR0aDogNSB9LCBsYWJlbDogJ01lZGl1bS1IaWdoIFJpc2sgKDUxLTc1KScgfSxcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDc2LCBtYXhWYWx1ZTogMTAwLCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFsyNTUsIDAsIDAsIDI1NV0sIHdpZHRoOiA2IH0sIGxhYmVsOiAnSGlnaCBSaXNrICg3Ni0xMDApJyB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICBwb3B1cFRlbXBsYXRlOiB7XHJcbiAgICAgICAgdGl0bGU6ICdDcmFzaCBSaXNrOiB7cmlza19sZXZlbH0nLFxyXG4gICAgICAgIGNvbnRlbnQ6IGA8ZGl2IHN0eWxlPVwiZm9udC1zaXplOjEzcHhcIj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9XCJtYXJnaW4tYm90dG9tOjhweDtwYWRkaW5nLWJvdHRvbTo4cHg7Ym9yZGVyLWJvdHRvbToxcHggc29saWQgI2UwZTBlMFwiPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImZvbnQtc2l6ZToyNHB4O2ZvbnQtd2VpZ2h0OjcwMDtjb2xvcjp7ZXhwcmVzc2lvbi9yaXNrQ29sb3J9XCI+e3Jpc2tfc2NvcmV9PC9zcGFuPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT1cImNvbG9yOiM2NjY7Zm9udC1zaXplOjEycHhcIj4vMTAwIHJpc2sgc2NvcmU8L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDx0YWJsZSBzdHlsZT1cImJvcmRlci1jb2xsYXBzZTpjb2xsYXBzZTt3aWR0aDoxMDAlXCI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5Sb3V0ZTwvdGQ+PHRkPntyb3V0ZWlkfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPlNlZ21lbnQ8L3RkPjx0ZD5NIHtmcm9tX219IFxcdTIwMTMge3RvX219PC90ZD48L3RyPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+UmlzayBMZXZlbDwvdGQ+PHRkIHN0eWxlPVwiZm9udC13ZWlnaHQ6NzAwXCI+e3Jpc2tfbGV2ZWx9PC90ZD48L3RyPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+Q29udHJpYnV0aW5nIEZhY3RvcnM8L3RkPjx0ZD57Y29udHJpYnV0aW5nX2ZhY3RvcnN9PC90ZD48L3RyPlxyXG4gICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICA8L2Rpdj5gLFxyXG4gICAgICAgIGV4cHJlc3Npb25JbmZvczogW3tcclxuICAgICAgICAgIG5hbWU6ICdyaXNrQ29sb3InLFxyXG4gICAgICAgICAgZXhwcmVzc2lvbjogYHZhciBzID0gJGZlYXR1cmUucmlza19zY29yZTsgV2hlbihzID4gNzUsICcjZDMyZjJmJywgcyA+IDUwLCAnI2Y1N2MwMCcsIHMgPiAyNSwgJyNmYmMwMmQnLCBzID4gMCwgJyMzODhlM2MnLCAnIzk5OScpYFxyXG4gICAgICAgIH1dXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICB2aWV3Lm1hcC5hZGQocHJlZGljdGlvbkxheWVyKVxyXG4gICAgcHJlZGljdGlvbkxheWVyLndoZW4oKCkgPT4ge1xyXG4gICAgICBwcmVkaWN0aW9uTGF5ZXIucXVlcnlFeHRlbnQoKS50aGVuKChyOiBhbnkpID0+IHtcclxuICAgICAgICBpZiAoci5leHRlbnQpIHZpZXcuZ29UbyhyLmV4dGVudC5leHBhbmQoMS4yKSlcclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IE5ZIFNUQVRFIENSQVNIIE1PREVMID09PT09PT09PT09PT09PT09PT09XHJcbiAgY29uc3QgTllfU1RBVEVfQ1JBU0hfTU9ERUwgPSB7XHJcbiAgICB0b3RhbENyYXNoZXM6IDE1MjUxMjMsXHJcbiAgICB0b3RhbEZhdGFsOiA0MjA4LFxyXG4gICAgeWVhcnM6ICcyMDIxLTIwMjQnLFxyXG4gICAgc291cmNlOiAnTlkgU3RhdGUgRE1WIHZpYSBkYXRhLm55LmdvdicsXHJcbiAgICByb2FkR2VvbWV0cnk6IHtcclxuICAgICAgJ1N0cmFpZ2h0IGFuZCBMZXZlbCc6IHsgY3Jhc2hlczogMTE3ODIyOCwgZmF0YWw6IDI4MzQsIHdlaWdodDogMS4wIH0sXHJcbiAgICAgICdTdHJhaWdodCBhbmQgR3JhZGUnOiB7IGNyYXNoZXM6IDEyNjQ2NCwgZmF0YWw6IDQyOSwgd2VpZ2h0OiAxLjQxIH0sXHJcbiAgICAgICdDdXJ2ZSBhbmQgTGV2ZWwnOiB7IGNyYXNoZXM6IDcyMzQ5LCBmYXRhbDogNDk3LCB3ZWlnaHQ6IDIuODYgfSxcclxuICAgICAgJ0N1cnZlIGFuZCBHcmFkZSc6IHsgY3Jhc2hlczogNDc0OTcsIGZhdGFsOiAzMTYsIHdlaWdodDogMi43NyB9LFxyXG4gICAgICAnQ3VydmUgYXQgSGlsbCBDcmVzdCc6IHsgY3Jhc2hlczogNjg2MCwgZmF0YWw6IDU0LCB3ZWlnaHQ6IDMuMjggfSxcclxuICAgICAgJ1N0cmFpZ2h0IGF0IEhpbGwgQ3Jlc3QnOiB7IGNyYXNoZXM6IDIxNTk3LCBmYXRhbDogNzUsIHdlaWdodDogMS40NSB9XHJcbiAgICB9LFxyXG4gICAgdHJhZmZpY0NvbnRyb2w6IHtcclxuICAgICAgJ05vbmUnOiB7IGNyYXNoZXM6IDg3MjA1NiwgZmF0YWw6IDI0NTcsIHdlaWdodDogMS4xNyB9LFxyXG4gICAgICAnVHJhZmZpYyBTaWduYWwnOiB7IGNyYXNoZXM6IDMxODA2NSwgZmF0YWw6IDgyNiwgd2VpZ2h0OiAxLjA4IH0sXHJcbiAgICAgICdTdG9wIFNpZ24nOiB7IGNyYXNoZXM6IDEzMTY2NCwgZmF0YWw6IDI2Niwgd2VpZ2h0OiAwLjg0IH0sXHJcbiAgICAgICdObyBQYXNzaW5nIFpvbmUnOiB7IGNyYXNoZXM6IDg1Mzk2LCBmYXRhbDogNTU3LCB3ZWlnaHQ6IDIuNzIgfSxcclxuICAgICAgJ1lpZWxkIFNpZ24nOiB7IGNyYXNoZXM6IDEyODgwLCBmYXRhbDogOCwgd2VpZ2h0OiAwLjI2IH0sXHJcbiAgICAgICdDb25zdHJ1Y3Rpb24gV29yayBBcmVhJzogeyBjcmFzaGVzOiA0NDI5LCBmYXRhbDogOSwgd2VpZ2h0OiAwLjg1IH0sXHJcbiAgICAgICdGbGFzaGluZyBMaWdodCc6IHsgY3Jhc2hlczogMzA2MywgZmF0YWw6IDEwLCB3ZWlnaHQ6IDEuMzYgfSxcclxuICAgICAgJ1JSIENyb3NzaW5nIEdhdGVzJzogeyBjcmFzaGVzOiA4NzgsIGZhdGFsOiA3LCB3ZWlnaHQ6IDMuMzIgfSxcclxuICAgICAgJ1NjaG9vbCBab25lJzogeyBjcmFzaGVzOiA2MzcsIGZhdGFsOiAxLCB3ZWlnaHQ6IDAuNjUgfVxyXG4gICAgfSxcclxuICAgIHJvYWRTdXJmYWNlOiB7XHJcbiAgICAgICdEcnknOiB7IGNyYXNoZXM6IDExMzAyMTEsIGZhdGFsOiAzMTAyLCB3ZWlnaHQ6IDEuMCB9LFxyXG4gICAgICAnV2V0JzogeyBjcmFzaGVzOiAyMzQ2MDMsIGZhdGFsOiA2NTEsIHdlaWdodDogMS4wMSB9LFxyXG4gICAgICAnU25vdy9JY2UnOiB7IGNyYXNoZXM6IDcyNjc2LCBmYXRhbDogMjIyLCB3ZWlnaHQ6IDEuMTEgfSxcclxuICAgICAgJ1NsdXNoJzogeyBjcmFzaGVzOiA1NzU3LCBmYXRhbDogMTQsIHdlaWdodDogMC44OSB9LFxyXG4gICAgICAnRmxvb2RlZCBXYXRlcic6IHsgY3Jhc2hlczogNTA4LCBmYXRhbDogMywgd2VpZ2h0OiAyLjE1IH0sXHJcbiAgICAgICdNdWRkeSc6IHsgY3Jhc2hlczogNjQ4LCBmYXRhbDogMywgd2VpZ2h0OiAxLjY5IH1cclxuICAgIH0sXHJcbiAgICBsaWdodGluZzoge1xyXG4gICAgICAnRGF5bGlnaHQnOiB7IGNyYXNoZXM6IDkzMzIxMCwgZmF0YWw6IDE4NjcsIHdlaWdodDogMC44MyB9LFxyXG4gICAgICAnRGFyay1Sb2FkIExpZ2h0ZWQnOiB7IGNyYXNoZXM6IDI3ODk4MiwgZmF0YWw6IDg3Niwgd2VpZ2h0OiAxLjMxIH0sXHJcbiAgICAgICdEYXJrLVJvYWQgVW5saWdodGVkJzogeyBjcmFzaGVzOiAxNDg2MzUsIGZhdGFsOiAxMDA1LCB3ZWlnaHQ6IDIuODIgfSxcclxuICAgICAgJ0R1c2snOiB7IGNyYXNoZXM6IDQ4NzQwLCBmYXRhbDogMjIxLCB3ZWlnaHQ6IDEuODkgfSxcclxuICAgICAgJ0Rhd24nOiB7IGNyYXNoZXM6IDM3ODQ4LCBmYXRhbDogMjM5LCB3ZWlnaHQ6IDIuNjMgfVxyXG4gICAgfSxcclxuICAgIHdlYXRoZXI6IHtcclxuICAgICAgJ0NsZWFyJzogeyBjcmFzaGVzOiA5MzU4OTcsIGZhdGFsOiAyNjc5LCB3ZWlnaHQ6IDEuMCB9LFxyXG4gICAgICAnQ2xvdWR5JzogeyBjcmFzaGVzOiAyOTU3MzIsIGZhdGFsOiA3MDAsIHdlaWdodDogMC44MyB9LFxyXG4gICAgICAnUmFpbic6IHsgY3Jhc2hlczogMTM5NTU5LCBmYXRhbDogNDE5LCB3ZWlnaHQ6IDEuMDUgfSxcclxuICAgICAgJ1Nub3cnOiB7IGNyYXNoZXM6IDU4NzYzLCBmYXRhbDogMTgzLCB3ZWlnaHQ6IDEuMDkgfSxcclxuICAgICAgJ1NsZWV0L0hhaWwvRnJlZXppbmcgUmFpbic6IHsgY3Jhc2hlczogOTQ4MywgZmF0YWw6IDI4LCB3ZWlnaHQ6IDEuMDMgfSxcclxuICAgICAgJ0ZvZy9TbW9nL1Ntb2tlJzogeyBjcmFzaGVzOiA0NzkyLCBmYXRhbDogNDUsIHdlaWdodDogMy45MSB9XHJcbiAgICB9LFxyXG4gICAgbHJzTWFwcGluZzoge1xyXG4gICAgICAnQ3VydmUnOiB7IHN0YXRlRmllbGQ6ICdyb2FkR2VvbWV0cnknLCB2YWx1ZU1hcDogeyAnTGVmdCc6ICdDdXJ2ZSBhbmQgTGV2ZWwnLCAnUmlnaHQnOiAnQ3VydmUgYW5kIExldmVsJywgJ0NvbXBvdW5kJzogJ0N1cnZlIGFuZCBHcmFkZScsICdSZXZlcnNlJzogJ0N1cnZlIGFuZCBHcmFkZScsICdTaW1wbGUnOiAnQ3VydmUgYW5kIExldmVsJyB9IH0sXHJcbiAgICAgICdHcmFkZSc6IHsgc3RhdGVGaWVsZDogJ3JvYWRHZW9tZXRyeScsIHZhbHVlTWFwOiB7ICdMZXZlbCc6ICdTdHJhaWdodCBhbmQgTGV2ZWwnLCAnRmxhdCc6ICdTdHJhaWdodCBhbmQgTGV2ZWwnLCAnUm9sbGluZyc6ICdTdHJhaWdodCBhbmQgR3JhZGUnLCAnTW91bnRhaW5vdXMnOiAnQ3VydmUgYW5kIEdyYWRlJywgJ1N0ZWVwJzogJ1N0cmFpZ2h0IGFuZCBHcmFkZScgfSB9LFxyXG4gICAgICAnU3BlZWQgTGltaXQnOiB7IHN0YXRlRmllbGQ6ICdzcGVlZCcsIGN1c3RvbVdlaWdodHM6IHsgJzI1JzogMC43LCAnMzAnOiAwLjgsICczNSc6IDAuOSwgJzQwJzogMS4xLCAnNDUnOiAxLjMsICc1MCc6IDEuNiwgJzU1JzogMi4wLCAnNjAnOiAyLjMsICc2NSc6IDIuNiB9IH0sXHJcbiAgICAgICdGdW5jdGlvbmFsIENsYXNzJzogeyBzdGF0ZUZpZWxkOiAnZnVuY0NsYXNzJywgY3VzdG9tV2VpZ2h0czogeyAnSW50ZXJzdGF0ZSc6IDEuMywgJ1ByaW5jaXBhbCBBcnRlcmlhbCc6IDEuNSwgJ01pbm9yIEFydGVyaWFsJzogMS4yLCAnTWFqb3IgQ29sbGVjdG9yJzogMS4wLCAnTWlub3IgQ29sbGVjdG9yJzogMC44LCAnTG9jYWwnOiAwLjYgfSB9LFxyXG4gICAgICAnTWVkaWFuIFR5cGUnOiB7IHN0YXRlRmllbGQ6ICdtZWRpYW4nLCBjdXN0b21XZWlnaHRzOiB7ICdOb25lJzogMS44LCAnUGFpbnRlZCc6IDEuMywgJ0N1cmJlZCc6IDEuMCwgJ1Bvc2l0aXZlIEJhcnJpZXInOiAwLjYsICdEZXByZXNzZWQnOiAwLjcsICdHcmFzcyc6IDAuOSB9IH0sXHJcbiAgICAgICdUaHJvdWdoIExhbmUnOiB7IHN0YXRlRmllbGQ6ICdsYW5lcycsIGN1c3RvbVdlaWdodHM6IHsgJzEnOiAwLjgsICcyJzogMS4wLCAnMyc6IDEuMywgJzQnOiAxLjEsICc1JzogMS40LCAnNic6IDEuMiB9IH0sXHJcbiAgICAgICdTaG91bGRlciBUeXBlJzogeyBzdGF0ZUZpZWxkOiAnc2hvdWxkZXInLCBjdXN0b21XZWlnaHRzOiB7ICdOb25lJzogMS42LCAnR3JhdmVsJzogMS4xLCAnUGF2ZWQnOiAwLjgsICdHcmFzcyc6IDEuMiwgJ0N1cmInOiAxLjAgfSB9LFxyXG4gICAgICAnUGF2ZW1lbnQgVHlwZSc6IHsgc3RhdGVGaWVsZDogJ3BhdmVtZW50JywgY3VzdG9tV2VpZ2h0czogeyAnQXNwaGFsdCc6IDAuOSwgJ0NvbmNyZXRlJzogMS4wLCAnR3JhdmVsJzogMS41LCAnQnJpY2snOiAxLjIsICdEaXJ0JzogMS44LCAnQ29tcG9zaXRlJzogMC45NSB9IH0sXHJcbiAgICAgICdUZXJyYWluIFR5cGUnOiB7IHN0YXRlRmllbGQ6ICdyb2FkR2VvbWV0cnknLCB2YWx1ZU1hcDogeyAnTGV2ZWwnOiAnU3RyYWlnaHQgYW5kIExldmVsJywgJ1JvbGxpbmcnOiAnU3RyYWlnaHQgYW5kIEdyYWRlJywgJ01vdW50YWlub3VzJzogJ0N1cnZlIGFuZCBHcmFkZScgfSB9LFxyXG4gICAgICAnUGVyY2VudCBQYXNzaW5nIFNpZ2h0JzogeyBzdGF0ZUZpZWxkOiAncGFzc1NpZ2h0JywgY3VzdG9tV2VpZ2h0czogeyAnMCc6IDIuNSwgJzEwJzogMi4yLCAnMjAnOiAxLjksICczMCc6IDEuNiwgJzQwJzogMS4zLCAnNTAnOiAxLjEsICc2MCc6IDEuMCwgJzcwJzogMC45LCAnODAnOiAwLjg1LCAnOTAnOiAwLjgsICcxMDAnOiAwLjc1IH0gfSxcclxuICAgICAgJ0FjY2VzcyBDb250cm9sJzogeyBzdGF0ZUZpZWxkOiAnYWNjZXNzJywgY3VzdG9tV2VpZ2h0czogeyAnRnVsbCc6IDAuNiwgJ1BhcnRpYWwnOiAxLjAsICdOb25lJzogMS41IH0gfSxcclxuICAgICAgJ093bmVyc2hpcCc6IHsgc3RhdGVGaWVsZDogJ293bmVyc2hpcCcsIGN1c3RvbVdlaWdodHM6IHsgJ1N0YXRlJzogMS4wLCAnQ291bnR5JzogMS4xLCAnQ2l0eSc6IDEuMiwgJ0ZlZGVyYWwnOiAwLjksICdQcml2YXRlJzogMS40IH0gfVxyXG4gICAgfSBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+XHJcbiAgfVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBBSSBQUkVESUNUSU9OID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IHJ1bkFJUHJlZGljdGlvbiA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIHNldFJ1bm5pbmcodHJ1ZSlcclxuICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgc2V0UmVzdWx0KG51bGwpXHJcbiAgICBzZXRTaG93RXhwbGFuYXRpb24oZmFsc2UpXHJcbiAgICBzZXRGYWN0b3JzKG51bGwpXHJcbiAgICBzZXRFcnJvcihudWxsKVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBTZXNzaW9uTWFuYWdlci5nZXRJbnN0YW5jZSgpLmdldE1haW5TZXNzaW9uKCkgYXMgYW55XHJcbiAgICAgIGlmICghc2Vzc2lvbikgdGhyb3cgbmV3IEVycm9yKCdOb3Qgc2lnbmVkIGluLicpXHJcbiAgICAgIGNvbnN0IHRva2VuID0gc2Vzc2lvbi50b2tlblxyXG4gICAgICBjb25zdCBwb3J0YWxVcmwgPSAoc2Vzc2lvbi5wb3J0YWwgfHwgJycpLnJlcGxhY2UoL1xcL3NoYXJpbmdcXC9yZXN0XFwvPyQvLCAnJylcclxuICAgICAgY29uc3QgdXNlcm5hbWUgPSBzZXNzaW9uLnVzZXJuYW1lXHJcbiAgICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IGFzIGFueVxyXG4gICAgICBjb25zdCB3a2lkID0gdmlldz8uc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuXHJcbiAgICAgIC8vIFN0ZXAgMTogUXVlcnkgZXZlbnQgZGF0YVxyXG4gICAgICBzZXRQcm9ncmVzcygnUXVlcnlpbmcgZXZlbnQgZGF0YSBmcm9tIExSUy4uLicpXHJcbiAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGF3YWl0IHF1ZXJ5RXZlbnREYXRhKClcclxuICAgICAgaWYgKGV2ZW50RGF0YS5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gZXZlbnQgZGF0YSBmb3VuZCBmb3Igc2VsZWN0ZWQgcm91dGVzLicpXHJcblxyXG4gICAgICAvLyBTdGVwIDI6IFNlZ21lbnQgcm91dGVzXHJcbiAgICAgIHNldFByb2dyZXNzKCdTZWdtZW50aW5nIHJvdXRlcyBpbnRvIDAuNS1taWxlIGludGVydmFscy4uLicpXHJcbiAgICAgIGNvbnN0IHJvdXRlR2VvbWV0cmllcyA9IHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50XHJcbiAgICAgIGlmIChyb3V0ZUdlb21ldHJpZXMuc2l6ZSA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyByb3V0ZSBnZW9tZXRyaWVzIGNhY2hlZC4nKVxyXG5cclxuICAgICAgY29uc3Qgc2VnbWVudHM6IGFueVtdID0gW11cclxuICAgICAgZm9yIChjb25zdCBbcmlkLCByb3V0ZURhdGFdIG9mIHJvdXRlR2VvbWV0cmllcykge1xyXG4gICAgICAgIGNvbnN0IHsgdmVydGljZXMsIG1JZHggfSA9IHJvdXRlRGF0YVxyXG4gICAgICAgIGlmICh2ZXJ0aWNlcy5sZW5ndGggPCAyKSBjb250aW51ZVxyXG4gICAgICAgIGNvbnN0IG1pbk1lYXN1cmUgPSB2ZXJ0aWNlc1swXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbWF4TWVhc3VyZSA9IHZlcnRpY2VzW3ZlcnRpY2VzLmxlbmd0aCAtIDFdW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCByb3V0ZUxlbiA9IG1heE1lYXN1cmUgLSBtaW5NZWFzdXJlXHJcbiAgICAgICAgaWYgKHJvdXRlTGVuIDw9IDApIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGxldCBzZWdGcm9tID0gbWluTWVhc3VyZVxyXG4gICAgICAgIGxldCBzZWdJZHggPSAwXHJcbiAgICAgICAgd2hpbGUgKHNlZ0Zyb20gPCBtYXhNZWFzdXJlKSB7XHJcbiAgICAgICAgICBjb25zdCBzZWdUbyA9IE1hdGgubWluKHNlZ0Zyb20gKyAwLjUsIG1heE1lYXN1cmUpXHJcbiAgICAgICAgICBjb25zdCBtaWRNID0gKHNlZ0Zyb20gKyBzZWdUbykgLyAyXHJcbiAgICAgICAgICBsZXQgbWlkWCA9IDAsIG1pZFkgPSAwXHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBtMSA9IHZlcnRpY2VzW2ldW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgY29uc3QgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBpZiAobWlkTSA+PSBtMSAmJiBtaWRNIDw9IG0yKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZnJhYyA9IG0yICE9PSBtMSA/IChtaWRNIC0gbTEpIC8gKG0yIC0gbTEpIDogMFxyXG4gICAgICAgICAgICAgIG1pZFggPSB2ZXJ0aWNlc1tpXVswXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzBdIC0gdmVydGljZXNbaV1bMF0pXHJcbiAgICAgICAgICAgICAgbWlkWSA9IHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSlcclxuICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBwYXRoOiBudW1iZXJbXVtdID0gW11cclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG0xID0gdmVydGljZXNbaV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBjb25zdCBtMiA9IHZlcnRpY2VzW2kgKyAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGlmIChtMiA8IHNlZ0Zyb20pIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGlmIChtMSA+IHNlZ1RvKSBicmVha1xyXG4gICAgICAgICAgICBpZiAobTEgPj0gc2VnRnJvbSAmJiBtMSA8PSBzZWdUbykge1xyXG4gICAgICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA9PT0gMCB8fCBwYXRoW3BhdGgubGVuZ3RoIC0gMV1bMF0gIT09IHZlcnRpY2VzW2ldWzBdKSBwYXRoLnB1c2goW3ZlcnRpY2VzW2ldWzBdLCB2ZXJ0aWNlc1tpXVsxXV0pXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobTEgPCBzZWdGcm9tICYmIG0yID4gc2VnRnJvbSkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZyYWMgPSAoc2VnRnJvbSAtIG0xKSAvIChtMiAtIG0xKVxyXG4gICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKSwgdmVydGljZXNbaV1bMV0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVsxXSAtIHZlcnRpY2VzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG0yID49IHNlZ0Zyb20gJiYgbTIgPD0gc2VnVG8pIHBhdGgucHVzaChbdmVydGljZXNbaSArIDFdWzBdLCB2ZXJ0aWNlc1tpICsgMV1bMV1dKVxyXG4gICAgICAgICAgICBlbHNlIGlmIChtMSA8IHNlZ1RvICYmIG0yID4gc2VnVG8pIHtcclxuICAgICAgICAgICAgICBjb25zdCBmcmFjID0gKHNlZ1RvIC0gbTEpIC8gKG0yIC0gbTEpXHJcbiAgICAgICAgICAgICAgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpXVswXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzBdIC0gdmVydGljZXNbaV1bMF0pLCB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHBhdGgubGVuZ3RoID49IDIpIHNlZ21lbnRzLnB1c2goeyByb3V0ZUlkOiByaWQsIHNlZ0lkeCwgZnJvbU06IHNlZ0Zyb20sIHRvTTogc2VnVG8sIG1pZFgsIG1pZFksIHBhdGgsIGNyYXNoQ291bnQ6IDAsIGF0dHJzOiB7fSBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+IH0pXHJcbiAgICAgICAgICBzZWdGcm9tID0gc2VnVG9cclxuICAgICAgICAgIHNlZ0lkeCsrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gc2VnbWVudHMgZ2VuZXJhdGVkLicpXHJcblxyXG4gICAgICAvLyBTdGVwIDM6IENvdW50IGNyYXNoZXMgcGVyIHNlZ21lbnRcclxuICAgICAgc2V0UHJvZ3Jlc3MoYENvdW50aW5nIGNyYXNoZXMgYWNyb3NzICR7c2VnbWVudHMubGVuZ3RofSBzZWdtZW50cy4uLmApXHJcbiAgICAgIGNvbnN0IGV2ZW50Q29uZmlncyA9IGNvbmZpZy5ldmVudExheWVyQ29uZmlncyB8fCBbXVxyXG4gICAgICBjb25zdCBjcmFzaExheWVyTmFtZXMgPSBuZXcgU2V0KGV2ZW50Q29uZmlncy5maWx0ZXIoY2ZnID0+IC9jcmFzaHxhY2NpZGVudHxjb2xsaXNpb24vaS50ZXN0KGNmZy5uYW1lKSkubWFwKGNmZyA9PiBjZmcubmFtZSkpXHJcblxyXG4gICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGV2ZW50RGF0YSkge1xyXG4gICAgICAgIGlmICghY3Jhc2hMYXllck5hbWVzLmhhcyhlbnRyeS5GZWF0dXJlKSkgY29udGludWVcclxuICAgICAgICBpZiAoZW50cnkuTWVhc3VyZSA9PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgICBpZiAoc2VnLnJvdXRlSWQgPT09IGVudHJ5LlJvdXRlSUQgJiYgZW50cnkuTWVhc3VyZSA+PSBzZWcuZnJvbU0gJiYgZW50cnkuTWVhc3VyZSA8IHNlZy50b00pIHtcclxuICAgICAgICAgICAgc2VnLmNyYXNoQ291bnQrK1xyXG4gICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RlcCA0OiBFbnJpY2ggd2l0aCByb2FkIGF0dHJpYnV0ZXNcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0VucmljaGluZyBzZWdtZW50cyB3aXRoIHJvYWQgYXR0cmlidXRlcy4uLicpXHJcbiAgICAgIGNvbnN0IG5vbkNyYXNoTGF5ZXJzID0gZXZlbnRDb25maWdzLmZpbHRlcihjZmcgPT4gIWNyYXNoTGF5ZXJOYW1lcy5oYXMoY2ZnLm5hbWUpKVxyXG4gICAgICBjb25zdCBlbnJpY2hGaWVsZHM6IHN0cmluZ1tdID0gW11cclxuICAgICAgZm9yIChjb25zdCBjZmcgb2Ygbm9uQ3Jhc2hMYXllcnMpIHtcclxuICAgICAgICBjb25zdCBsYXllckVudHJpZXMgPSBldmVudERhdGEuZmlsdGVyKGUgPT4gZS5GZWF0dXJlID09PSBjZmcubmFtZSlcclxuICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgKGNmZy5hdHRyaWJ1dGVzIHx8IFtdKSkge1xyXG4gICAgICAgICAgY29uc3QgZmllbGROYW1lID0gYCR7Y2ZnLm5hbWUucmVwbGFjZSgvW15hLXpBLVowLTldL2csICdfJykuc3Vic3RyaW5nKDAsIDE1KX1fJHthdHRyLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnXycpLnN1YnN0cmluZygwLCAxNSl9YC5zdWJzdHJpbmcoMCwgMzEpXHJcbiAgICAgICAgICBpZiAoIWVucmljaEZpZWxkcy5pbmNsdWRlcyhmaWVsZE5hbWUpKSBlbnJpY2hGaWVsZHMucHVzaChmaWVsZE5hbWUpXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxheWVyRW50cmllcykge1xyXG4gICAgICAgICAgICBpZiAoZW50cnkuUm91dGVJRCA9PSBudWxsIHx8IGVudHJ5Lk1lYXN1cmUgPT0gbnVsbCkgY29udGludWVcclxuICAgICAgICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICAgICAgICBpZiAoc2VnLnJvdXRlSWQgPT09IGVudHJ5LlJvdXRlSUQgJiYgZW50cnkuTWVhc3VyZSA+PSBzZWcuZnJvbU0gJiYgZW50cnkuTWVhc3VyZSA8IHNlZy50b00pIHtcclxuICAgICAgICAgICAgICAgIHNlZy5hdHRyc1tmaWVsZE5hbWVdID0gZW50cnlbYXR0cl0gPz8gJydcclxuICAgICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGVwIDU6IEtlcm5lbCBkZW5zaXR5IHNjb3JpbmdcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0NvbXB1dGluZyByaXNrIHNjb3Jlcy4uLicpXHJcbiAgICAgIGNvbnN0IEtFUk5FTF9SQURJVVMgPSA1XHJcbiAgICAgIGNvbnN0IERFQ0FZID0gMC41XHJcbiAgICAgIGNvbnN0IHNlZ3NCeVJvdXRlID0gbmV3IE1hcDxzdHJpbmcsIGFueVtdPigpXHJcbiAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgaWYgKCFzZWdzQnlSb3V0ZS5oYXMoc2VnLnJvdXRlSWQpKSBzZWdzQnlSb3V0ZS5zZXQoc2VnLnJvdXRlSWQsIFtdKVxyXG4gICAgICAgIHNlZ3NCeVJvdXRlLmdldChzZWcucm91dGVJZCkhLnB1c2goc2VnKVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByaXNrU2NvcmVzOiBudW1iZXJbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgY29uc3Qgcm91dGVTZWdzID0gc2Vnc0J5Um91dGUuZ2V0KHNlZy5yb3V0ZUlkKSB8fCBbXVxyXG4gICAgICAgIGxldCBzY29yZSA9IHNlZy5jcmFzaENvdW50ICogMlxyXG4gICAgICAgIGZvciAoY29uc3QgbmVpZ2hib3Igb2Ygcm91dGVTZWdzKSB7XHJcbiAgICAgICAgICBpZiAobmVpZ2hib3IgPT09IHNlZykgY29udGludWVcclxuICAgICAgICAgIGNvbnN0IGQgPSBNYXRoLmFicyhuZWlnaGJvci5zZWdJZHggLSBzZWcuc2VnSWR4KVxyXG4gICAgICAgICAgaWYgKGQgPD0gS0VSTkVMX1JBRElVUykgc2NvcmUgKz0gbmVpZ2hib3IuY3Jhc2hDb3VudCAqIE1hdGgucG93KERFQ0FZLCBkKVxyXG4gICAgICAgIH1cclxuICAgICAgICByaXNrU2NvcmVzLnB1c2goc2NvcmUpXHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbWF4Umlza1Njb3JlID0gTWF0aC5tYXgoLi4ucmlza1Njb3JlcywgMSlcclxuICAgICAgY29uc3Qgbm9ybWFsaXplZFNjb3JlcyA9IHJpc2tTY29yZXMubWFwKHMgPT4gTWF0aC5yb3VuZCgocyAvIG1heFJpc2tTY29yZSkgKiAxMDApKVxyXG5cclxuICAgICAgLy8gU3RvcmUgZmFjdG9ycyBmb3IgZXhwbGFuYXRpb25cclxuICAgICAgY29uc3QgaGlnaFJpc2tTZWdzID0gc2VnbWVudHMuZmlsdGVyKChfLCBpZHgpID0+IG5vcm1hbGl6ZWRTY29yZXNbaWR4XSA+PSA3NSlcclxuICAgICAgY29uc3QgdG9wSGlnaFJpc2sgPSBoaWdoUmlza1NlZ3MubWFwKHNlZyA9PiAoeyAuLi5zZWcsIHJpc2tTY29yZTogbm9ybWFsaXplZFNjb3Jlc1tzZWdtZW50cy5pbmRleE9mKHNlZyldIH0pKS5zb3J0KChhLCBiKSA9PiBiLnJpc2tTY29yZSAtIGEucmlza1Njb3JlKS5zbGljZSgwLCA1KVxyXG4gICAgICBzZXRGYWN0b3JzKHsgdG90YWxTZWdtZW50czogc2VnbWVudHMubGVuZ3RoLCBzZWdtZW50c1dpdGhDcmFzaGVzOiBzZWdtZW50cy5maWx0ZXIocyA9PiBzLmNyYXNoQ291bnQgPiAwKS5sZW5ndGgsIGhpZ2hSaXNrQ291bnQ6IGhpZ2hSaXNrU2Vncy5sZW5ndGgsIG1heENyYXNoQ291bnQ6IE1hdGgubWF4KC4uLnNlZ21lbnRzLm1hcChzID0+IHMuY3Jhc2hDb3VudCksIDEpLCBlbnJpY2hMYXllcnM6IG5vbkNyYXNoTGF5ZXJzLm1hcChsID0+IGwubmFtZSksIGVucmljaEZpZWxkcywga2VybmVsUmFkaXVzOiBLRVJORUxfUkFESVVTLCB0b3BIaWdoUmlza1NlZ21lbnRzOiB0b3BIaWdoUmlzayB9KVxyXG5cclxuICAgICAgLy8gU3RlcCA2OiBVcGxvYWQgYXMgZmVhdHVyZSBzZXJ2aWNlXHJcbiAgICAgIHNldFByb2dyZXNzKCdVcGxvYWRpbmcgcHJlZGljdGlvbiBsYXllci4uLicpXHJcbiAgICAgIGNvbnN0IGNvbnRlbnRVcmwgPSBgJHtwb3J0YWxVcmx9L3NoYXJpbmcvcmVzdC9jb250ZW50L3VzZXJzLyR7dXNlcm5hbWV9YFxyXG4gICAgICBjb25zdCBmb2xkZXJVcmwgPSBzZWxlY3RlZEZvbGRlcklkID8gYCR7Y29udGVudFVybH0vJHtzZWxlY3RlZEZvbGRlcklkfWAgOiBjb250ZW50VXJsXHJcbiAgICAgIGNvbnN0IHNlcnZpY2VOYW1lID0gYENyYXNoUmlza19BSV8ke0RhdGUubm93KCl9YFxyXG5cclxuICAgICAgY29uc3QgZmllbGRzID0gW1xyXG4gICAgICAgIHsgbmFtZTogJ09CSkVDVElEJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVPSUQnLCBhbGlhczogJ09iamVjdElEJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3JvdXRlaWQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUm91dGUgSUQnLCBsZW5ndGg6IDEwMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2Zyb21fbScsIHR5cGU6ICdlc3JpRmllbGRUeXBlRG91YmxlJywgYWxpYXM6ICdGcm9tIE1lYXN1cmUnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAndG9fbScsIHR5cGU6ICdlc3JpRmllbGRUeXBlRG91YmxlJywgYWxpYXM6ICdUbyBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NyYXNoX2NvdW50JywgdHlwZTogJ2VzcmlGaWVsZFR5cGVJbnRlZ2VyJywgYWxpYXM6ICdDcmFzaCBDb3VudCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdyaXNrX3Njb3JlJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVJbnRlZ2VyJywgYWxpYXM6ICdSaXNrIFNjb3JlICgwLTEwMCknIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19sZXZlbCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdSaXNrIExldmVsJywgbGVuZ3RoOiAyMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRyaWJ1dGluZ19mYWN0b3JzJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ0NvbnRyaWJ1dGluZyBGYWN0b3JzJywgbGVuZ3RoOiA1MDAgfVxyXG4gICAgICBdXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnY3JlYXRlUGFyYW1ldGVycycsIEpTT04uc3RyaW5naWZ5KHsgbmFtZTogc2VydmljZU5hbWUsIHNlcnZpY2VEZXNjcmlwdGlvbjogJ0FJIGNyYXNoIHJpc2sgcHJlZGljdGlvbicsIGhhc1N0YXRpY0RhdGE6IGZhbHNlLCBtYXhSZWNvcmRDb3VudDogMTAwMDAsIHN1cHBvcnRlZFF1ZXJ5Rm9ybWF0czogJ0pTT04nLCBjYXBhYmlsaXRpZXM6ICdRdWVyeSxFZGl0aW5nJywgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0sIGluaXRpYWxFeHRlbnQ6IHsgeG1pbjogLTIwMDM3NTA4LCB5bWluOiAtMjAwMzc1MDgsIHhtYXg6IDIwMDM3NTA4LCB5bWF4OiAyMDAzNzUwOCwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0gfSwgYWxsb3dHZW9tZXRyeVVwZGF0ZXM6IHRydWUgfSkpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3RhcmdldFR5cGUnLCAnZmVhdHVyZVNlcnZpY2UnKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdvdXRwdXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgaWYgKHNlbGVjdGVkRm9sZGVySWQpIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2ZvbGRlcklkJywgc2VsZWN0ZWRGb2xkZXJJZClcclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3AgPSBhd2FpdCBmZXRjaChgJHtmb2xkZXJVcmx9L2NyZWF0ZVNlcnZpY2VgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBjcmVhdGVQYXJhbXMgfSlcclxuICAgICAgY29uc3QgY3JlYXRlUmVzdWx0ID0gYXdhaXQgY3JlYXRlUmVzcC5qc29uKClcclxuICAgICAgaWYgKCFjcmVhdGVSZXN1bHQuZW5jb2RlZFNlcnZpY2VVUkwgJiYgIWNyZWF0ZVJlc3VsdC5zZXJ2aWNldXJsKSB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgc2VydmljZTogJyArIEpTT04uc3RyaW5naWZ5KGNyZWF0ZVJlc3VsdCkpXHJcbiAgICAgIGNvbnN0IHNlcnZpY2VVcmwgPSBjcmVhdGVSZXN1bHQuZW5jb2RlZFNlcnZpY2VVUkwgfHwgY3JlYXRlUmVzdWx0LnNlcnZpY2V1cmxcclxuICAgICAgY29uc3QgdGVtcEl0ZW1JZCA9IGNyZWF0ZVJlc3VsdC5pdGVtSWRcclxuXHJcbiAgICAgIGNvbnN0IGFkbWluVXJsID0gc2VydmljZVVybC5yZXBsYWNlKCcvcmVzdC9zZXJ2aWNlcy8nLCAnL3Jlc3QvYWRtaW4vc2VydmljZXMvJylcclxuICAgICAgY29uc3QgYWRkRGVmUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2FkZFRvRGVmaW5pdGlvbicsIEpTT04uc3RyaW5naWZ5KHsgbGF5ZXJzOiBbeyBpZDogMCwgbmFtZTogJ0FJIENyYXNoIFJpc2snLCB0eXBlOiAnRmVhdHVyZSBMYXllcicsIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvbHlsaW5lJywgZGlzcGxheUZpZWxkOiAncm91dGVpZCcsIGZpZWxkcywgb2JqZWN0SWRGaWVsZDogJ09CSkVDVElEJywgaGFzQXR0YWNobWVudHM6IGZhbHNlLCBjYXBhYmlsaXRpZXM6ICdRdWVyeSxFZGl0aW5nLENyZWF0ZSxVcGRhdGUsRGVsZXRlJyB9XSB9KSlcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7YWRtaW5Vcmx9L2FkZFRvRGVmaW5pdGlvbmAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGFkZERlZlBhcmFtcyB9KVxyXG5cclxuICAgICAgLy8gVXBsb2FkIGZlYXR1cmVzXHJcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gc2VnbWVudHMuZmlsdGVyKChfLCBpZHgpID0+IG5vcm1hbGl6ZWRTY29yZXNbaWR4XSA+IDApLm1hcCgoc2VnKSA9PiB7XHJcbiAgICAgICAgY29uc3QgaWR4ID0gc2VnbWVudHMuaW5kZXhPZihzZWcpXHJcbiAgICAgICAgY29uc3Qgcmlza1Njb3JlID0gbm9ybWFsaXplZFNjb3Jlc1tpZHhdXHJcbiAgICAgICAgY29uc3Qgcmlza0xldmVsID0gcmlza1Njb3JlID49IDc1ID8gJ0hpZ2gnIDogcmlza1Njb3JlID49IDQwID8gJ01lZGl1bScgOiByaXNrU2NvcmUgPiAwID8gJ0xvdycgOiAnTWluaW1hbCdcclxuICAgICAgICBjb25zdCBmY3RycyA9IE9iamVjdC5lbnRyaWVzKHNlZy5hdHRycykuZmlsdGVyKChbLCB2XSkgPT4gdiAmJiBTdHJpbmcodikudHJpbSgpKS5zbGljZSgwLCA1KS5tYXAoKFtrLCB2XSkgPT4gYCR7a309JHt2fWApLmpvaW4oJzsgJylcclxuICAgICAgICByZXR1cm4geyBnZW9tZXRyeTogeyBwYXRoczogW3NlZy5wYXRoXSwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0gfSwgYXR0cmlidXRlczogeyByb3V0ZWlkOiBzZWcucm91dGVJZCwgZnJvbV9tOiBzZWcuZnJvbU0sIHRvX206IHNlZy50b00sIGNyYXNoX2NvdW50OiBzZWcuY3Jhc2hDb3VudCwgcmlza19zY29yZTogcmlza1Njb3JlLCByaXNrX2xldmVsOiByaXNrTGV2ZWwsIGNvbnRyaWJ1dGluZ19mYWN0b3JzOiBmY3RycyB8fCAnRGVuc2l0eSBjbHVzdGVyJyB9IH1cclxuICAgICAgfSlcclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpICs9IDEwMDApIHtcclxuICAgICAgICBjb25zdCBiYXRjaCA9IGZlYXR1cmVzLnNsaWNlKGksIGkgKyAxMDAwKVxyXG4gICAgICAgIHNldFByb2dyZXNzKGBVcGxvYWRpbmcuLi4gJHtNYXRoLm1pbihpICsgMTAwMCwgZmVhdHVyZXMubGVuZ3RoKX0vJHtmZWF0dXJlcy5sZW5ndGh9YClcclxuICAgICAgICBjb25zdCBhZGRGZWF0UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ2ZlYXR1cmVzJywgSlNPTi5zdHJpbmdpZnkoYmF0Y2gpKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICAgIGF3YWl0IGZldGNoKGAke3NlcnZpY2VVcmx9LzAvYWRkRmVhdHVyZXNgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGRGZWF0UGFyYW1zIH0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNoYXJlXHJcbiAgICAgIGNvbnN0IHNoYXJlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnZXZlcnlvbmUnLCAnZmFsc2UnKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ29yZycsICd0cnVlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdpdGVtcycsIHRlbXBJdGVtSWQpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBhd2FpdCBmZXRjaChgJHtjb250ZW50VXJsfS9pdGVtcy8ke3RlbXBJdGVtSWR9L3NoYXJlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogc2hhcmVQYXJhbXMgfSlcclxuXHJcbiAgICAgIHNldFByb2dyZXNzKCdEaXNwbGF5aW5nIG9uIG1hcC4uLicpXHJcbiAgICAgIGF3YWl0IGRpc3BsYXlQcmVkaWN0aW9uT25NYXAoYCR7c2VydmljZVVybH0vMGAsIHRva2VuLCB3a2lkKVxyXG4gICAgICBzZXRSZXN1bHQoeyBsYXllclVybDogc2VydmljZVVybCwgaXRlbVVybDogYCR7cG9ydGFsVXJsfS9ob21lL2l0ZW0uaHRtbD9pZD0ke3RlbXBJdGVtSWR9YCB9KVxyXG4gICAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDcmFzaFJpc2sgQUldIEZhaWxlZDonLCBlcnIpXHJcbiAgICAgIHNldEVycm9yKCdBSSBwcmVkaWN0aW9uIGZhaWxlZDogJyArIChlcnIubWVzc2FnZSB8fCBlcnIpKVxyXG4gICAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldFJ1bm5pbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZywgcXVlcnlFdmVudERhdGEsIHNlbGVjdGVkRm9sZGVySWQsIGRpc3BsYXlQcmVkaWN0aW9uT25NYXBdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBNTCBQUkVESUNUSU9OID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IHJ1bk1MUHJlZGljdGlvbiA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIHNldFJ1bm5pbmcodHJ1ZSlcclxuICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgc2V0UmVzdWx0KG51bGwpXHJcbiAgICBzZXRTaG93RXhwbGFuYXRpb24oZmFsc2UpXHJcbiAgICBzZXRNb2RlbEluZm8obnVsbClcclxuICAgIHNldEVycm9yKG51bGwpXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc2Vzc2lvbiA9IFNlc3Npb25NYW5hZ2VyLmdldEluc3RhbmNlKCkuZ2V0TWFpblNlc3Npb24oKSBhcyBhbnlcclxuICAgICAgaWYgKCFzZXNzaW9uKSB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzaWduZWQgaW4uJylcclxuICAgICAgY29uc3QgdG9rZW4gPSBzZXNzaW9uLnRva2VuXHJcbiAgICAgIGNvbnN0IHBvcnRhbFVybCA9IChzZXNzaW9uLnBvcnRhbCB8fCAnJykucmVwbGFjZSgvXFwvc2hhcmluZ1xcL3Jlc3RcXC8/JC8sICcnKVxyXG4gICAgICBjb25zdCB1c2VybmFtZSA9IHNlc3Npb24udXNlcm5hbWVcclxuICAgICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICAgIGlmICghdmlldykgdGhyb3cgbmV3IEVycm9yKCdObyBtYXAgdmlldyBhdmFpbGFibGUuJylcclxuICAgICAgY29uc3Qgd2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuXHJcbiAgICAgIC8vIFN0ZXAgMTogUXVlcnkgZXZlbnQgZGF0YVxyXG4gICAgICBzZXRQcm9ncmVzcygnUXVlcnlpbmcgcm9hZCBhdHRyaWJ1dGUgZGF0YSBmcm9tIExSUy4uLicpXHJcbiAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IGF3YWl0IHF1ZXJ5RXZlbnREYXRhKClcclxuXHJcbiAgICAgIC8vIFN0ZXAgMjogU2VnbWVudCByb3V0ZXNcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1NlZ21lbnRpbmcgcm91dGVzIGF0IDAuNS1taWxlIGludGVydmFscy4uLicpXHJcbiAgICAgIGNvbnN0IHJvdXRlR2VvbWV0cmllcyA9IHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50XHJcbiAgICAgIGlmIChyb3V0ZUdlb21ldHJpZXMuc2l6ZSA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyByb3V0ZSBnZW9tZXRyaWVzLiBTZWxlY3Qgcm91dGVzIGZpcnN0LicpXHJcblxyXG4gICAgICBjb25zdCBtb2RlbCA9IE5ZX1NUQVRFX0NSQVNIX01PREVMXHJcblxyXG4gICAgICAvLyBCdWlsZCBldmVudCBsb29rdXBcclxuICAgICAgY29uc3QgZXZlbnRMb29rdXAgPSBuZXcgTWFwPHN0cmluZywgTWFwPG51bWJlciwgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4+KClcclxuICAgICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcbiAgICAgIGZvciAoY29uc3QgY2ZnIG9mIGV2ZW50Q29uZmlncykge1xyXG4gICAgICAgIGNvbnN0IGxheWVyRW50cmllcyA9IGV2ZW50RGF0YS5maWx0ZXIoZSA9PiBlLkZlYXR1cmUgPT09IGNmZy5uYW1lKVxyXG4gICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGF5ZXJFbnRyaWVzKSB7XHJcbiAgICAgICAgICBpZiAoZW50cnkuUm91dGVJRCA9PSBudWxsIHx8IGVudHJ5Lk1lYXN1cmUgPT0gbnVsbCkgY29udGludWVcclxuICAgICAgICAgIGNvbnN0IHJpZCA9IGVudHJ5LlJvdXRlSURcclxuICAgICAgICAgIGlmICghZXZlbnRMb29rdXAuaGFzKHJpZCkpIGV2ZW50TG9va3VwLnNldChyaWQsIG5ldyBNYXAoKSlcclxuICAgICAgICAgIGNvbnN0IG1LZXkgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoZW50cnkuTWVhc3VyZSkgKiAyKSAvIDJcclxuICAgICAgICAgIGNvbnN0IHJvdXRlTWFwID0gZXZlbnRMb29rdXAuZ2V0KHJpZCkhXHJcbiAgICAgICAgICBpZiAoIXJvdXRlTWFwLmhhcyhtS2V5KSkgcm91dGVNYXAuc2V0KG1LZXksIHt9KVxyXG4gICAgICAgICAgY29uc3Qgc2VnRGF0YSA9IHJvdXRlTWFwLmdldChtS2V5KSFcclxuICAgICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiAoY2ZnLmF0dHJpYnV0ZXMgfHwgW10pKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeVthdHRyXSAhPSBudWxsICYmIFN0cmluZyhlbnRyeVthdHRyXSkudHJpbSgpKSB7XHJcbiAgICAgICAgICAgICAgc2VnRGF0YVtgJHtjZmcubmFtZX06OiR7YXR0cn1gXSA9IFN0cmluZyhlbnRyeVthdHRyXSkudHJpbSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0ZXAgMzogU2NvcmUgc2VnbWVudHNcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0FwcGx5aW5nIHN0YXRlIGNyYXNoIG1vZGVsIHdlaWdodHMuLi4nKVxyXG4gICAgICBjb25zdCBzZWdtZW50czogYW55W10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IFtyaWQsIHJkXSBvZiByb3V0ZUdlb21ldHJpZXMuZW50cmllcygpKSB7XHJcbiAgICAgICAgY29uc3QgdmVydHMgPSByZC52ZXJ0aWNlc1xyXG4gICAgICAgIGlmICh2ZXJ0cy5sZW5ndGggPCAyKSBjb250aW51ZVxyXG4gICAgICAgIGNvbnN0IHN0YXJ0TSA9IHZlcnRzWzBdW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBlbmRNID0gdmVydHNbdmVydHMubGVuZ3RoIC0gMV1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IHRvdGFsTGVuID0gTWF0aC5hYnMoZW5kTSAtIHN0YXJ0TSlcclxuICAgICAgICBpZiAodG90YWxMZW4gPCAwLjEpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGNvbnN0IG51bVNlZ3MgPSBNYXRoLmNlaWwodG90YWxMZW4gLyAwLjUpXHJcbiAgICAgICAgZm9yIChsZXQgcyA9IDA7IHMgPCBudW1TZWdzOyBzKyspIHtcclxuICAgICAgICAgIGNvbnN0IGZyb21NID0gc3RhcnRNICsgcyAqIDAuNVxyXG4gICAgICAgICAgY29uc3QgdG9NID0gTWF0aC5taW4oc3RhcnRNICsgKHMgKyAxKSAqIDAuNSwgZW5kTSlcclxuICAgICAgICAgIGNvbnN0IG1pZE0gPSAoZnJvbU0gKyB0b00pIC8gMlxyXG4gICAgICAgICAgY29uc3QgbUtleSA9IE1hdGgucm91bmQobWlkTSAqIDIpIC8gMlxyXG5cclxuICAgICAgICAgIGNvbnN0IHJvdXRlTWFwID0gZXZlbnRMb29rdXAuZ2V0KHJpZClcclxuICAgICAgICAgIGNvbnN0IHNlZ0F0dHJzID0gcm91dGVNYXA/LmdldChtS2V5KSB8fCB7fVxyXG5cclxuICAgICAgICAgIGxldCBjb21wb3NpdGVTY29yZSA9IDEuMFxyXG4gICAgICAgICAgY29uc3Qgc2VnRmFjdG9yczogc3RyaW5nW10gPSBbXVxyXG4gICAgICAgICAgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc2VnQXR0cnMpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxheWVyTmFtZSA9IGtleS5zcGxpdCgnOjonKVswXVxyXG4gICAgICAgICAgICBjb25zdCBtYXBwaW5nID0gbW9kZWwubHJzTWFwcGluZ1tsYXllck5hbWVdXHJcbiAgICAgICAgICAgIGlmICghbWFwcGluZykgY29udGludWVcclxuICAgICAgICAgICAgbGV0IHdlaWdodCA9IDEuMFxyXG4gICAgICAgICAgICBpZiAobWFwcGluZy5jdXN0b21XZWlnaHRzKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgbm9ybWFsaXplZFZhbCA9IHZhbHVlLnJlcGxhY2UoL1teMC05Ll0vZywgJycpLnNwbGl0KCcuJylbMF1cclxuICAgICAgICAgICAgICB3ZWlnaHQgPSBtYXBwaW5nLmN1c3RvbVdlaWdodHNbbm9ybWFsaXplZFZhbF0gfHwgbWFwcGluZy5jdXN0b21XZWlnaHRzW3ZhbHVlXSB8fCAxLjBcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChtYXBwaW5nLnZhbHVlTWFwKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbWFwcGVkQ29uZGl0aW9uID0gbWFwcGluZy52YWx1ZU1hcFt2YWx1ZV1cclxuICAgICAgICAgICAgICBpZiAobWFwcGVkQ29uZGl0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzdGF0ZUNhdGVnb3J5ID0gKG1vZGVsIGFzIGFueSlbbWFwcGluZy5zdGF0ZUZpZWxkXVxyXG4gICAgICAgICAgICAgICAgaWYgKHN0YXRlQ2F0ZWdvcnkgJiYgc3RhdGVDYXRlZ29yeVttYXBwZWRDb25kaXRpb25dKSB7XHJcbiAgICAgICAgICAgICAgICAgIHdlaWdodCA9IHN0YXRlQ2F0ZWdvcnlbbWFwcGVkQ29uZGl0aW9uXS53ZWlnaHRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHdlaWdodCAhPT0gMS4wKSB7XHJcbiAgICAgICAgICAgICAgY29tcG9zaXRlU2NvcmUgKj0gd2VpZ2h0XHJcbiAgICAgICAgICAgICAgaWYgKHdlaWdodCA+IDEuMikgc2VnRmFjdG9ycy5wdXNoKGAke2xheWVyTmFtZX06ICR7dmFsdWV9ICgke3dlaWdodC50b0ZpeGVkKDEpfXgpYClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHJpc2tTY29yZSA9IE1hdGgubWluKE1hdGgucm91bmQoTWF0aC5sb2coY29tcG9zaXRlU2NvcmUgKyAxKSAqIDQwKSwgMTAwKVxyXG5cclxuICAgICAgICAgIC8vIEJ1aWxkIHBhdGhcclxuICAgICAgICAgIGNvbnN0IHBhdGg6IG51bWJlcltdW10gPSBbXVxyXG4gICAgICAgICAgZm9yIChjb25zdCB2IG9mIHZlcnRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHZtID0gdltyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGlmICh2bSA+PSBmcm9tTSAmJiB2bSA8PSB0b00pIHBhdGgucHVzaChbdlswXSwgdlsxXV0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPCAyKSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbTEgPSB2ZXJ0c1tpXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgICAgICAgY29uc3QgbTIgPSB2ZXJ0c1tpICsgMV1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgICAgICAgIGlmIChtMSA8PSBmcm9tTSAmJiBtMiA+PSBmcm9tTSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IChmcm9tTSAtIG0xKSAvIChtMiAtIG0xIHx8IDEpXHJcbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRzW2ldWzBdICsgdCAqICh2ZXJ0c1tpICsgMV1bMF0gLSB2ZXJ0c1tpXVswXSksIHZlcnRzW2ldWzFdICsgdCAqICh2ZXJ0c1tpICsgMV1bMV0gLSB2ZXJ0c1tpXVsxXSldKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAobTEgPD0gdG9NICYmIG0yID49IHRvTSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdCA9ICh0b00gLSBtMSkgLyAobTIgLSBtMSB8fCAxKVxyXG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKFt2ZXJ0c1tpXVswXSArIHQgKiAodmVydHNbaSArIDFdWzBdIC0gdmVydHNbaV1bMF0pLCB2ZXJ0c1tpXVsxXSArIHQgKiAodmVydHNbaSArIDFdWzFdIC0gdmVydHNbaV1bMV0pXSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA8IDIpIGNvbnRpbnVlXHJcblxyXG4gICAgICAgICAgY29uc3Qgcmlza0xldmVsID0gcmlza1Njb3JlID49IDc1ID8gJ0hpZ2gnIDogcmlza1Njb3JlID49IDQwID8gJ01lZGl1bScgOiByaXNrU2NvcmUgPiAwID8gJ0xvdycgOiAnTWluaW1hbCdcclxuICAgICAgICAgIHNlZ21lbnRzLnB1c2goeyByb3V0ZUlkOiByaWQsIGZyb21NLCB0b00sIHBhdGgsIHJpc2tTY29yZSwgcmlza0xldmVsLCBjb250cmlidXRpbmdGYWN0b3JzOiBzZWdGYWN0b3JzIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gc2VnbWVudHMgZ2VuZXJhdGVkLicpXHJcblxyXG4gICAgICAvLyBTdG9yZSBtb2RlbCBpbmZvXHJcbiAgICAgIGNvbnN0IHdlaWdodHNTdW1tYXJ5OiBSZWNvcmQ8c3RyaW5nLCBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+PiA9IHt9XHJcbiAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBmIG9mIHNlZy5jb250cmlidXRpbmdGYWN0b3JzKSB7XHJcbiAgICAgICAgICBjb25zdCBtYXRjaCA9IGYubWF0Y2goL14oLis/KTogKC4rPykgXFwoKC4rPyl4XFwpJC8pXHJcbiAgICAgICAgICBpZiAobWF0Y2gpIHtcclxuICAgICAgICAgICAgaWYgKCF3ZWlnaHRzU3VtbWFyeVttYXRjaFsxXV0pIHdlaWdodHNTdW1tYXJ5W21hdGNoWzFdXSA9IHt9XHJcbiAgICAgICAgICAgIHdlaWdodHNTdW1tYXJ5W21hdGNoWzFdXVttYXRjaFsyXV0gPSBwYXJzZUZsb2F0KG1hdGNoWzNdKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBzZXRNb2RlbEluZm8oeyB3ZWlnaHRzOiB3ZWlnaHRzU3VtbWFyeSwgdG90YWxDcmFzaGVzOiBtb2RlbC50b3RhbENyYXNoZXMsIHllYXJzOiBtb2RlbC55ZWFycyB9KVxyXG5cclxuICAgICAgLy8gU3RlcCA0OiBVcGxvYWRcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1VwbG9hZGluZyBzdGF0ZSBNTCBwcmVkaWN0aW9uIGxheWVyLi4uJylcclxuICAgICAgY29uc3QgY29udGVudFVybCA9IGAke3BvcnRhbFVybH0vc2hhcmluZy9yZXN0L2NvbnRlbnQvdXNlcnMvJHt1c2VybmFtZX1gXHJcbiAgICAgIGNvbnN0IGZvbGRlclVybCA9IHNlbGVjdGVkRm9sZGVySWQgPyBgJHtjb250ZW50VXJsfS8ke3NlbGVjdGVkRm9sZGVySWR9YCA6IGNvbnRlbnRVcmxcclxuICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSBgU3RhdGVNTF9DcmFzaFJpc2tfJHtEYXRlLm5vdygpfWBcclxuXHJcbiAgICAgIGNvbnN0IGZpZWxkcyA9IFtcclxuICAgICAgICB7IG5hbWU6ICdPQkpFQ1RJRCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlT0lEJywgYWxpYXM6ICdPYmplY3RJRCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdyb3V0ZWlkJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1JvdXRlIElEJywgbGVuZ3RoOiAxMDAgfSxcclxuICAgICAgICB7IG5hbWU6ICdmcm9tX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnRnJvbSBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3RvX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnVG8gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICdyaXNrX3Njb3JlJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVJbnRlZ2VyJywgYWxpYXM6ICdSaXNrIFNjb3JlICgwLTEwMCknIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19sZXZlbCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdSaXNrIExldmVsJywgbGVuZ3RoOiAyMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2NvbnRyaWJ1dGluZ19mYWN0b3JzJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ0NvbnRyaWJ1dGluZyBGYWN0b3JzJywgbGVuZ3RoOiA1MDAgfSxcclxuICAgICAgICB7IG5hbWU6ICdtb2RlbF9jb25maWRlbmNlJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ01vZGVsIENvbmZpZGVuY2UnLCBsZW5ndGg6IDUwIH1cclxuICAgICAgXVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2NyZWF0ZVBhcmFtZXRlcnMnLCBKU09OLnN0cmluZ2lmeSh7IG5hbWU6IHNlcnZpY2VOYW1lLCBzZXJ2aWNlRGVzY3JpcHRpb246ICdDcmFzaCByaXNrIGZyb20gTlkgc3RhdGUgY3Jhc2ggZGF0YWJhc2UgTUwgbW9kZWwnLCBoYXNTdGF0aWNEYXRhOiBmYWxzZSwgbWF4UmVjb3JkQ291bnQ6IDEwMDAwLCBzdXBwb3J0ZWRRdWVyeUZvcm1hdHM6ICdKU09OJywgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZycsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9LCBpbml0aWFsRXh0ZW50OiB7IHhtaW46IC0yMDAzNzUwOCwgeW1pbjogLTIwMDM3NTA4LCB4bWF4OiAyMDAzNzUwOCwgeW1heDogMjAwMzc1MDgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGFsbG93R2VvbWV0cnlVcGRhdGVzOiB0cnVlIH0pKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0YXJnZXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnb3V0cHV0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGlmIChzZWxlY3RlZEZvbGRlcklkKSBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmb2xkZXJJZCcsIHNlbGVjdGVkRm9sZGVySWQpXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwID0gYXdhaXQgZmV0Y2goYCR7Zm9sZGVyVXJsfS9jcmVhdGVTZXJ2aWNlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogY3JlYXRlUGFyYW1zIH0pXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3VsdCA9IGF3YWl0IGNyZWF0ZVJlc3AuanNvbigpXHJcbiAgICAgIGlmICghY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMKSB0aHJvdyBuZXcgRXJyb3IoJ0ZhaWxlZCB0byBjcmVhdGUgc2VydmljZTogJyArIEpTT04uc3RyaW5naWZ5KGNyZWF0ZVJlc3VsdCkpXHJcbiAgICAgIGNvbnN0IHNlcnZpY2VVcmwgPSBjcmVhdGVSZXN1bHQuZW5jb2RlZFNlcnZpY2VVUkxcclxuICAgICAgY29uc3QgdGVtcEl0ZW1JZCA9IGNyZWF0ZVJlc3VsdC5pdGVtSWRcclxuXHJcbiAgICAgIGNvbnN0IGFkbWluVXJsID0gc2VydmljZVVybC5yZXBsYWNlKCcvcmVzdC9zZXJ2aWNlcy8nLCAnL3Jlc3QvYWRtaW4vc2VydmljZXMvJylcclxuICAgICAgY29uc3QgYWRkRGVmUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2FkZFRvRGVmaW5pdGlvbicsIEpTT04uc3RyaW5naWZ5KHsgbGF5ZXJzOiBbeyBpZDogMCwgbmFtZTogJ1N0YXRlIE1MIFJpc2snLCB0eXBlOiAnRmVhdHVyZSBMYXllcicsIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvbHlsaW5lJywgZGlzcGxheUZpZWxkOiAncm91dGVpZCcsIGZpZWxkcywgb2JqZWN0SWRGaWVsZDogJ09CSkVDVElEJywgaGFzQXR0YWNobWVudHM6IGZhbHNlLCBjYXBhYmlsaXRpZXM6ICdRdWVyeSxFZGl0aW5nLENyZWF0ZSxVcGRhdGUsRGVsZXRlJyB9XSB9KSlcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7YWRtaW5Vcmx9L2FkZFRvRGVmaW5pdGlvbmAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGFkZERlZlBhcmFtcyB9KVxyXG5cclxuICAgICAgY29uc3QgZmVhdHVyZXMgPSBzZWdtZW50cy5maWx0ZXIocyA9PiBzLnJpc2tTY29yZSA+IDApLm1hcChzZWcgPT4gKHtcclxuICAgICAgICBnZW9tZXRyeTogeyBwYXRoczogW3NlZy5wYXRoXSwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0gfSxcclxuICAgICAgICBhdHRyaWJ1dGVzOiB7IHJvdXRlaWQ6IHNlZy5yb3V0ZUlkLCBmcm9tX206IHNlZy5mcm9tTSwgdG9fbTogc2VnLnRvTSwgcmlza19zY29yZTogc2VnLnJpc2tTY29yZSwgcmlza19sZXZlbDogc2VnLnJpc2tMZXZlbCwgY29udHJpYnV0aW5nX2ZhY3RvcnM6IHNlZy5jb250cmlidXRpbmdGYWN0b3JzLmpvaW4oJzsgJyksIG1vZGVsX2NvbmZpZGVuY2U6IGBIaWdoICgke21vZGVsLnRvdGFsQ3Jhc2hlcy50b0xvY2FsZVN0cmluZygpfSB0cmFpbmluZyBjcmFzaGVzKWAgfVxyXG4gICAgICB9KSlcclxuXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmVhdHVyZXMubGVuZ3RoOyBpICs9IDEwMDApIHtcclxuICAgICAgICBjb25zdCBiYXRjaCA9IGZlYXR1cmVzLnNsaWNlKGksIGkgKyAxMDAwKVxyXG4gICAgICAgIHNldFByb2dyZXNzKGBVcGxvYWRpbmcuLi4gJHtNYXRoLm1pbihpICsgMTAwMCwgZmVhdHVyZXMubGVuZ3RoKX0vJHtmZWF0dXJlcy5sZW5ndGh9YClcclxuICAgICAgICBjb25zdCBhZGRGZWF0UGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ2ZlYXR1cmVzJywgSlNPTi5zdHJpbmdpZnkoYmF0Y2gpKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICAgIGF3YWl0IGZldGNoKGAke3NlcnZpY2VVcmx9LzAvYWRkRmVhdHVyZXNgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGRGZWF0UGFyYW1zIH0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFNoYXJlXHJcbiAgICAgIGNvbnN0IHNoYXJlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnZXZlcnlvbmUnLCAnZmFsc2UnKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ29yZycsICd0cnVlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdpdGVtcycsIHRlbXBJdGVtSWQpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBhd2FpdCBmZXRjaChgJHtjb250ZW50VXJsfS9pdGVtcy8ke3RlbXBJdGVtSWR9L3NoYXJlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogc2hhcmVQYXJhbXMgfSlcclxuXHJcbiAgICAgIHNldFByb2dyZXNzKCdEaXNwbGF5aW5nIG9uIG1hcC4uLicpXHJcbiAgICAgIGF3YWl0IGRpc3BsYXlQcmVkaWN0aW9uT25NYXAoYCR7c2VydmljZVVybH0vMGAsIHRva2VuLCB3a2lkKVxyXG4gICAgICBzZXRSZXN1bHQoeyBsYXllclVybDogc2VydmljZVVybCwgaXRlbVVybDogYCR7cG9ydGFsVXJsfS9ob21lL2l0ZW0uaHRtbD9pZD0ke3RlbXBJdGVtSWR9YCB9KVxyXG4gICAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTdGF0ZU1MXSBGYWlsZWQ6JywgZXJyKVxyXG4gICAgICBzZXRFcnJvcignTUwgcHJlZGljdGlvbiBmYWlsZWQ6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRSdW5uaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWcsIHF1ZXJ5RXZlbnREYXRhLCBzZWxlY3RlZEZvbGRlcklkLCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gUkVOREVSID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IHJvdXRlU2VsZWN0aW9uVUkgPSAoKSA9PiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4JywgYmFja2dyb3VuZDogJyNmOGY5ZmEnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2UwZTBlMCcgfX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBjb2xvcjogJyMzMzMnIH19PlNlbGVjdCBSb3V0ZXM8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBTZWFyY2ggbW9kZSB0YWJzICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNHB4JywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWFyY2hNb2RlKCdpZCcpfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4JywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyOiBzZWFyY2hNb2RlID09PSAnaWQnID8gJzJweCBzb2xpZCAjMDA3OWMxJyA6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNlYXJjaE1vZGUgPT09ICdpZCcgPyAnI2U4ZjRmZCcgOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInIH19PkJ5IFJvdXRlIElEPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoTW9kZSgnbmFtZScpfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4JywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyOiBzZWFyY2hNb2RlID09PSAnbmFtZScgPyAnMnB4IHNvbGlkICMwMDc5YzEnIDogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogc2VhcmNoTW9kZSA9PT0gJ25hbWUnID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJyB9fT5CeSBOYW1lPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoTW9kZSgnbWFwJyl9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHgnLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXI6IHNlYXJjaE1vZGUgPT09ICdtYXAnID8gJzJweCBzb2xpZCAjMDA3OWMxJyA6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNlYXJjaE1vZGUgPT09ICdtYXAnID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJyB9fT5EcmF3IEFyZWE8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7LyogUm91dGUgSUQgLyBOYW1lIHNlYXJjaCAqL31cclxuICAgICAgeyhzZWFyY2hNb2RlID09PSAnaWQnIHx8IHNlYXJjaE1vZGUgPT09ICduYW1lJykgJiYgKFxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnNHB4JywgbWFyZ2luQm90dG9tOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgdmFsdWU9e3NlYXJjaE1vZGUgPT09ICdpZCcgPyByb3V0ZUlkIDogcm91dGVOYW1lfSBvbkNoYW5nZT17ZSA9PiBoYW5kbGVSb3V0ZVNlYXJjaChlLnRhcmdldC52YWx1ZSl9IHBsYWNlaG9sZGVyPXtzZWFyY2hNb2RlID09PSAnaWQnID8gJ1JvdXRlIElELi4uJyA6ICdSb3V0ZSBuYW1lLi4uJ30gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzZweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTJweCcgfX0gLz5cclxuICAgICAgICAgICAge2hhc01hcFdpZGdldCAmJiAoXHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17cGlja2luZ0Zyb21NYXAgPyBjYW5jZWxQaWNrRnJvbU1hcCA6IHN0YXJ0UGlja0Zyb21NYXB9IHN0eWxlPXt7IHBhZGRpbmc6ICc2cHggMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogcGlja2luZ0Zyb21NYXAgPyAnIzAwNzljMScgOiAnI2ZmZicsIGNvbG9yOiBwaWNraW5nRnJvbU1hcCA/ICcjZmZmJyA6ICcjMDA3OWMxJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTFweCcgfX0+XHJcbiAgICAgICAgICAgICAgICB7cGlja2luZ0Zyb21NYXAgPyAnQ2FuY2VsJyA6ICdQaWNrJ31cclxuICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBBdXRvY29tcGxldGUgc3VnZ2VzdGlvbnMgKi99XHJcbiAgICAgICAgICB7c2hvd1N1Z2dlc3Rpb25zICYmIHJvdXRlU3VnZ2VzdGlvbnMubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBtYXhIZWlnaHQ6ICcxMDBweCcsIG92ZXJmbG93OiAnYXV0bycsIGJhY2tncm91bmQ6ICcjZmZmJyB9fT5cclxuICAgICAgICAgICAgICB7cm91dGVTdWdnZXN0aW9ucy5tYXAoKHIsIGkpID0+IChcclxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBvbkNsaWNrPXsoKSA9PiBzZWxlY3RSb3V0ZShyKX0gc3R5bGU9e3sgcGFkZGluZzogJzRweCA4cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyQm90dG9tOiAnMXB4IHNvbGlkICNlZWUnIH19IG9uTW91c2VPdmVyPXtlID0+IChlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZCA9ICcjZjBmMGYwJyl9IG9uTW91c2VPdXQ9e2UgPT4gKGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kID0gJyNmZmYnKX0+XHJcbiAgICAgICAgICAgICAgICAgIHtyLnJvdXRlSWR9IHtyLnJvdXRlTmFtZSA/IGAoJHtyLnJvdXRlTmFtZX0pYCA6ICcnfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICB7LyogUm91dGUgcGljayBkaXNhbWJpZ3VhdGlvbiAqL31cclxuICAgICAgICAgIHtyb3V0ZVBpY2tDYW5kaWRhdGVzICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgIzAwNzljMScsIGJvcmRlclJhZGl1czogJzRweCcsIHBhZGRpbmc6ICc4cHgnLCBiYWNrZ3JvdW5kOiAnI2U4ZjRmZCcsIG1hcmdpblRvcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzRweCcgfX0+TXVsdGlwbGUgcm91dGVzIGZvdW5kIOKAlCBzZWxlY3Qgb25lOjwvZGl2PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWF4SGVpZ2h0OiAnMTQwcHgnLCBvdmVyZmxvdzogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgICAgICAge3JvdXRlUGlja0NhbmRpZGF0ZXMubWFwKChjLCBpKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24ga2V5PXtpfSB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRSb3V0ZUlkKGMucm91dGVJZCk7IHNldFJvdXRlTmFtZShjLnJvdXRlTmFtZSk7IHNldFJvdXRlUGlja0NhbmRpZGF0ZXMobnVsbCk7IGZldGNoUm91dGVNZWFzdXJlcyhjLnJvdXRlSWQpIH19IG9uTW91c2VFbnRlcj17KCkgPT4geyBzaG93Um91dGVQcmV2aWV3UmVmLmN1cnJlbnQoYy5yb3V0ZUlkKSB9fSBvbk1vdXNlTGVhdmU9eygpID0+IHsgY2xlYXJSb3V0ZVByZXZpZXcoKSB9fSBzdHlsZT17eyBkaXNwbGF5OiAnYmxvY2snLCB3aWR0aDogJzEwMCUnLCB0ZXh0QWxpZ246ICdsZWZ0JywgcGFkZGluZzogJzZweCAxMHB4JywgbWFyZ2luQm90dG9tOiAnM3B4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNkZGQnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFdlaWdodDogNTAwIH19PntjLnJvdXRlTmFtZX08L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAge2Mucm91dGVOYW1lICE9PSBjLnJvdXRlSWQgJiYgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjODg4JywgbWFyZ2luTGVmdDogJzhweCcgfX0+e2Mucm91dGVJZH08L3NwYW4+fVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgey8qIE1lYXN1cmUgcmFuZ2UgaW5wdXRzICovfVxyXG4gICAgICAgICAge3JvdXRlSWQgJiYgcm91dGVNZWFzdXJlUmFuZ2UgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzhweCcsIHBhZGRpbmc6ICc4cHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZicsIGJvcmRlclJhZGl1czogJzRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZTBlMGUwJyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzZweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiAnIzMzMycgfX0+TWVhc3VyZSBSYW5nZTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0RnJvbU1lYXN1cmUocm91dGVNZWFzdXJlUmFuZ2UubWluLnRvRml4ZWQoMykpOyBzZXRUb01lYXN1cmUocm91dGVNZWFzdXJlUmFuZ2UubWF4LnRvRml4ZWQoMykpOyBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ2Zyb20nLCByb3V0ZU1lYXN1cmVSYW5nZS5taW4udG9GaXhlZCgzKSk7IHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgndG8nLCByb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKSkgfX0gc3R5bGU9e3sgcGFkZGluZzogJzNweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzAwNzljMScsIGJvcmRlclJhZGl1czogJzNweCcsIGJhY2tncm91bmQ6ICcjZThmNGZkJywgY29sb3I6ICcjMDA3OWMxJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTBweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5XaG9sZSBSb3V0ZTwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICB7LyogRnJvbSBtZWFzdXJlICovfVxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM2NjYnLCBkaXNwbGF5OiAnYmxvY2snLCBtYXJnaW5Cb3R0b206ICcycHgnIH19PkZyb217cm91dGVNZWFzdXJlUmFuZ2UgPyA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyNhYWEnLCBtYXJnaW5MZWZ0OiAnNHB4JyB9fT4oe3JvdXRlTWVhc3VyZVJhbmdlLm1pbi50b0ZpeGVkKDMpfSk8L3NwYW4+IDogbnVsbH08L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IGlmIChwaWNraW5nTWVhc3VyZSA9PT0gJ2Zyb20nKSBjYW5jZWxQaWNrTWVhc3VyZSgpOyBlbHNlIHN0YXJ0UGlja01lYXN1cmUoJ2Zyb20nKSB9fSB0aXRsZT17cGlja2luZ01lYXN1cmUgPT09ICdmcm9tJyA/ICdDYW5jZWwnIDogJ1BpY2sgZnJvbSBtYXAnfSBzdHlsZT17eyB3aWR0aDogJzI4cHgnLCBoZWlnaHQ6ICcyOHB4JywgcGFkZGluZzogMCwgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6IHBpY2tpbmdNZWFzdXJlID09PSAnZnJvbScgPyAnI2ZmZjNlMCcgOiAnI2ZmZicsIGZsZXhTaHJpbms6IDAsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3BpY2tpbmdNZWFzdXJlID09PSAnZnJvbScgPyAnXFx1MjMxNicgOiAnXFx1MjFBNSd9XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIHZhbHVlPXtmcm9tTWVhc3VyZX0gb25DaGFuZ2U9e2UgPT4gc2V0RnJvbU1lYXN1cmUoZS50YXJnZXQudmFsdWUpfSBvbkJsdXI9eygpID0+IHsgaWYgKGZyb21NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ2Zyb20nLCBmcm9tTWVhc3VyZSkgfX0gb25LZXlEb3duPXtlID0+IHsgaWYgKGUua2V5ID09PSAnRW50ZXInICYmIGZyb21NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ2Zyb20nLCBmcm9tTWVhc3VyZSkgfX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTJweCcgfX0gcGxhY2Vob2xkZXI9e3JvdXRlTWVhc3VyZVJhbmdlID8gcm91dGVNZWFzdXJlUmFuZ2UubWluLnRvRml4ZWQoMykgOiAnU3RhcnQnfSAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIHsvKiBUbyBtZWFzdXJlICovfVxyXG4gICAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9e3sgZm9udFNpemU6ICcxMHB4JywgY29sb3I6ICcjNjY2JywgZGlzcGxheTogJ2Jsb2NrJywgbWFyZ2luQm90dG9tOiAnMnB4JyB9fT5Ub3tyb3V0ZU1lYXN1cmVSYW5nZSA/IDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnI2FhYScsIG1hcmdpbkxlZnQ6ICc0cHgnIH19Pih7cm91dGVNZWFzdXJlUmFuZ2UubWF4LnRvRml4ZWQoMyl9KTwvc3Bhbj4gOiBudWxsfTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgaWYgKHBpY2tpbmdNZWFzdXJlID09PSAndG8nKSBjYW5jZWxQaWNrTWVhc3VyZSgpOyBlbHNlIHN0YXJ0UGlja01lYXN1cmUoJ3RvJykgfX0gdGl0bGU9e3BpY2tpbmdNZWFzdXJlID09PSAndG8nID8gJ0NhbmNlbCcgOiAnUGljayBmcm9tIG1hcCd9IHN0eWxlPXt7IHdpZHRoOiAnMjhweCcsIGhlaWdodDogJzI4cHgnLCBwYWRkaW5nOiAwLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogcGlja2luZ01lYXN1cmUgPT09ICd0bycgPyAnI2ZmZjNlMCcgOiAnI2ZmZicsIGZsZXhTaHJpbms6IDAsIGZvbnRTaXplOiAnMTRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAge3BpY2tpbmdNZWFzdXJlID09PSAndG8nID8gJ1xcdTIzMTYnIDogJ1xcdTIxQTUnfVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiB2YWx1ZT17dG9NZWFzdXJlfSBvbkNoYW5nZT17ZSA9PiBzZXRUb01lYXN1cmUoZS50YXJnZXQudmFsdWUpfSBvbkJsdXI9eygpID0+IHsgaWYgKHRvTWVhc3VyZSkgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCd0bycsIHRvTWVhc3VyZSkgfX0gb25LZXlEb3duPXtlID0+IHsgaWYgKGUua2V5ID09PSAnRW50ZXInICYmIHRvTWVhc3VyZSkgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCd0bycsIHRvTWVhc3VyZSkgfX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCA4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTJweCcgfX0gcGxhY2Vob2xkZXI9e3JvdXRlTWVhc3VyZVJhbmdlID8gcm91dGVNZWFzdXJlUmFuZ2UubWF4LnRvRml4ZWQoMykgOiAnRW5kJ30gLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogRHJhdyBwb2x5Z29uIG1vZGUgKi99XHJcbiAgICAgIHtzZWFyY2hNb2RlID09PSAnbWFwJyAmJiAoXHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3N0YXJ0RHJhd0FyZWF9IGRpc2FibGVkPXtkcmF3aW5nfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBkcmF3aW5nID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjb2xvcjogJyMwMDc5YzEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNTAwIH19PlxyXG4gICAgICAgICAgICB7ZHJhd2luZyA/ICdEcmF3aW5nLi4uIGNsaWNrIHRvIGNvbXBsZXRlJyA6IGBEcmF3IFBvbHlnb24gb24gTWFwJHttYXBSb3V0ZXMubGVuZ3RoID4gMCA/IGAgKCR7bWFwUm91dGVzLmxlbmd0aH0gcm91dGVzIGZvdW5kKWAgOiAnJ31gfVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICB7bWFwUm91dGVzLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzMzMycgfX0+XHJcbiAgICAgICAgICAgICAgPHN0cm9uZz57c2VsZWN0ZWRNYXBSb3V0ZUlkcy5zaXplfTwvc3Ryb25nPiBvZiB7bWFwUm91dGVzLmxlbmd0aH0gcm91dGVzIHNlbGVjdGVkXHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxuXHJcbiAgLy8gUmVzdWx0IHZpZXdcclxuICBjb25zdCByZXN1bHRVSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PlxyXG4gICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMzZweCcgfX0+eydcXHUyNzA1J308L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzEzcHgnLCBjb2xvcjogJyMzMzMnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBtYXJnaW46ICcwIDAgMTJweCcgfX0+XHJcbiAgICAgICAgUHJlZGljdGlvbiBjb21wbGV0ZSEgUmlzayBsYXllciBhZGRlZCB0byBtYXAuXHJcbiAgICAgIDwvcD5cclxuXHJcbiAgICAgIHsvKiBMZWdlbmQgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEwcHgnLCBiYWNrZ3JvdW5kOiAnI2Y1ZjVmNScsIGJvcmRlclJhZGl1czogJzRweCcsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PlxyXG4gICAgICAgIHtbeyBjb2xvcjogJyMzODhlM2MnLCB3aWR0aDogMywgbGFiZWw6ICdMb3cgKDEtMjUpJyB9LCB7IGNvbG9yOiAnI2ZiYzAyZCcsIHdpZHRoOiAzLCBsYWJlbDogJ01lZGl1bSAoMjYtNTApJyB9LCB7IGNvbG9yOiAnI2Y1N2MwMCcsIHdpZHRoOiA0LCBsYWJlbDogJ01lZGl1bS1IaWdoICg1MS03NSknIH0sIHsgY29sb3I6ICcjZDMyZjJmJywgd2lkdGg6IDUsIGxhYmVsOiAnSGlnaCAoNzYtMTAwKScgfV0ubWFwKChpdGVtLCBpKSA9PiAoXHJcbiAgICAgICAgICA8ZGl2IGtleT17aX0gc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JywgbWFyZ2luQm90dG9tOiBpIDwgMyA/ICc0cHgnIDogMCB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzIwcHgnLCBoZWlnaHQ6IGAke2l0ZW0ud2lkdGh9cHhgLCBiYWNrZ3JvdW5kOiBpdGVtLmNvbG9yIH19IC8+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcgfX0+e2l0ZW0ubGFiZWx9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAge3Jlc3VsdD8uaXRlbVVybCAmJiA8YSBocmVmPXtyZXN1bHQuaXRlbVVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIHN0eWxlPXt7IGRpc3BsYXk6ICdibG9jaycsIHRleHRBbGlnbjogJ2NlbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzAwNzljMScsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19Pk9wZW4gaW4gUG9ydGFsPC9hPn1cclxuXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc4cHgnLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd0V4cGxhbmF0aW9uKCFzaG93RXhwbGFuYXRpb24pfSBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDE2cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzZhMWI5YScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNob3dFeHBsYW5hdGlvbiA/ICcjZjNlNWY1JyA6ICcjZmZmJywgY29sb3I6ICcjNmExYjlhJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgIHtzaG93RXhwbGFuYXRpb24gPyAnSGlkZScgOiAnV2h5Pyd9XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRNb2RlKCdjaG9vc2UnKTsgc2V0UmVzdWx0KG51bGwpOyBzZXRQcm9ncmVzcygnJyk7IHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSkgfX0gc3R5bGU9e3sgcGFkZGluZzogJzhweCAyMHB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjNmExYjlhJywgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5Eb25lPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgey8qIEV4cGxhbmF0aW9uIHBhbmVsICovfVxyXG4gICAgICB7c2hvd0V4cGxhbmF0aW9uICYmIG1vZGUgPT09ICdhaScgJiYgZmFjdG9ycyAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICcxMnB4JywgcGFkZGluZzogJzEycHgnLCBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsIGJvcmRlclJhZGl1czogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIG1heEhlaWdodDogJzI1MHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDcwMCwgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5SaXNrIEZhY3RvciBBbmFseXNpczwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICBLZXJuZWwtZGVuc2l0eSBzY29yaW5nIChyYWRpdXM6IHtmYWN0b3JzLmtlcm5lbFJhZGl1c30gc2VnbWVudHMpLiBTZWdtZW50czoge2ZhY3RvcnMudG90YWxTZWdtZW50c30gdG90YWwsIHtmYWN0b3JzLnNlZ21lbnRzV2l0aENyYXNoZXN9IHdpdGggY3Jhc2hlcywge2ZhY3RvcnMuaGlnaFJpc2tDb3VudH0gaGlnaC1yaXNrLlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7ZmFjdG9ycy50b3BIaWdoUmlza1NlZ21lbnRzPy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8c3Ryb25nPlRvcCBIaWdoLVJpc2sgU2VnbWVudHM6PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLCBmb250U2l6ZTogJzEwcHgnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkPjx0ciBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2VlZScgfX0+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JyB9fT5Sb3V0ZTwvdGg+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+TWlsZXM8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PkNyYXNoZXM8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PlNjb3JlPC90aD48L3RyPjwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8dGJvZHk+e2ZhY3RvcnMudG9wSGlnaFJpc2tTZWdtZW50cy5zbGljZSgwLCA1KS5tYXAoKHM6IGFueSwgaTogbnVtYmVyKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9Pjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcgfX0+e3Mucm91dGVJZD8uc3Vic3RyaW5nKDAsIDE1KX08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT57cy5mcm9tTT8udG9GaXhlZCgxKX0te3MudG9NPy50b0ZpeGVkKDEpfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PntzLmNyYXNoQ291bnR9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcsIGNvbG9yOiAnI2QzMmYyZicsIGZvbnRXZWlnaHQ6IDcwMCB9fT57cy5yaXNrU2NvcmV9PC90ZD48L3RyPlxyXG4gICAgICAgICAgICAgICAgKSl9PC90Ym9keT5cclxuICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7c2hvd0V4cGxhbmF0aW9uICYmIG1vZGUgPT09ICdtbCcgJiYgbW9kZWxJbmZvICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzEycHgnLCBwYWRkaW5nOiAnMTJweCcsIGJhY2tncm91bmQ6ICcjZmFmNWZjJywgYm9yZGVyUmFkaXVzOiAnNnB4JywgZm9udFNpemU6ICcxMXB4JywgbWF4SGVpZ2h0OiAnMjgwcHgnLCBvdmVyZmxvd1k6ICdhdXRvJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNzAwLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBjb2xvcjogJyM0YTE0OGMnIH19PlN0YXRlIERhdGEgTW9kZWwgRXhwbGFuYXRpb248L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz5NZXRob2Q6PC9zdHJvbmc+IFdlaWdodC1vZi1FdmlkZW5jZSBzY29yaW5nIGZyb20ge21vZGVsSW5mby50b3RhbENyYXNoZXM/LnRvTG9jYWxlU3RyaW5nKCl9IHJlYWwgTlkgc3RhdGUgY3Jhc2ggcmVjb3JkcyAoe21vZGVsSW5mby55ZWFyc30pLiBFYWNoIHJvYWQgY29uZGl0aW9uIGdldHMgYSBjcmFzaCBtdWx0aXBsaWVyIGJhc2VkIG9uIGl0cyBzdGF0aXN0aWNhbCBhc3NvY2lhdGlvbiB3aXRoIGZhdGFsIGNyYXNoZXMuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz52cy4gQUkgKERlbnNpdHkpOjwvc3Ryb25nPiBBSSBmaW5kcyBleGlzdGluZyBob3RzcG90cy4gTUwgcHJlZGljdHMgPGVtPm5ldzwvZW0+IHJpc2sgZnJvbSByb2FkIGNoYXJhY3RlcmlzdGljcyBhbG9uZSDigJQgZGFuZ2Vyb3VzIGNvbmRpdGlvbnMgd2hlcmUgbm8gY3Jhc2hlcyBoYXZlIGJlZW4gcmVwb3J0ZWQgeWV0LlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7T2JqZWN0LmtleXMobW9kZWxJbmZvLndlaWdodHMgfHwge30pLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxzdHJvbmc+VG9wIFJpc2sgTXVsdGlwbGllcnMgRm91bmQ6PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLCBmb250U2l6ZTogJzEwcHgnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkPjx0ciBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2VlZScgfX0+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JyB9fT5GYWN0b3I8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAnbGVmdCcgfX0+VmFsdWU8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PldlaWdodDwvdGg+PC90cj48L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRib2R5PntPYmplY3QuZW50cmllcyhtb2RlbEluZm8ud2VpZ2h0cykuZmxhdE1hcCgoW2ZpZWxkLCB2YWxzXTogW3N0cmluZywgYW55XSkgPT4gT2JqZWN0LmVudHJpZXModmFscykubWFwKChbdmFsLCB3XTogW3N0cmluZywgYW55XSkgPT4gKHsgZmllbGQsIHZhbCwgdyB9KSkpLmZpbHRlcigoeDogYW55KSA9PiB4LncgPiAxLjApLnNvcnQoKGE6IGFueSwgYjogYW55KSA9PiBiLncgLSBhLncpLnNsaWNlKDAsIDEwKS5tYXAoKHg6IGFueSwgaTogbnVtYmVyKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9Pjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcgfX0+e3guZmllbGR9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+e3gudmFsfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnLCBjb2xvcjogeC53ID49IDIgPyAnI2QzMmYyZicgOiAnI2Y1N2MwMCcsIGZvbnRXZWlnaHQ6IDcwMCB9fT57eC53LnRvRml4ZWQoMSl9eDwvdGQ+PC90cj5cclxuICAgICAgICAgICAgICAgICkpfTwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICc4cHgnLCBwYWRkaW5nOiAnNnB4JywgYmFja2dyb3VuZDogJyNmZmYzY2QnLCBib3JkZXJSYWRpdXM6ICczcHgnLCBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM4NTY0MDQnIH19PlxyXG4gICAgICAgICAgICA8c3Ryb25nPk5vdGU6PC9zdHJvbmc+IFNlZ21lbnRzIHdpdGggbXVsdGlwbGUgaGlnaC13ZWlnaHQgZmFjdG9ycyBjb21wb3VuZCAobXVsdGlwbHkpLiBBIGN1cnZlICsgaGlnaCBzcGVlZCArIG5vIHNob3VsZGVyID0gdmVyeSBoaWdoIHJpc2sgZXZlbiB3aXRoIG5vIGxvY2FsIGNyYXNoIGhpc3RvcnkuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxuXHJcbiAgLy8gUnVubmluZyBzdGF0ZSBVSVxyXG4gIGNvbnN0IHJ1bm5pbmdVSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzIwcHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzU1NScsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+e3Byb2dyZXNzfTwvZGl2PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogJzRweCcsIGJhY2tncm91bmQ6ICcjZTBlMGUwJywgYm9yZGVyUmFkaXVzOiAnMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAnMTAwJScsIGJhY2tncm91bmQ6IG1vZGUgPT09ICdhaScgPyAnIzdiMWZhMicgOiAnIzZhMWI5YScsIHdpZHRoOiAnNjAlJywgYW5pbWF0aW9uOiAncHVsc2UgMS41cyBpbmZpbml0ZScgfX0gLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IE1BSU4gTEFZT1VUID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGhlaWdodDogJzEwMCUnLCBvdmVyZmxvdzogJ2F1dG8nLCBmb250U2l6ZTogJzEzcHgnLCBwYWRkaW5nOiAnMTJweCcsIGJveFNpemluZzogJ2JvcmRlci1ib3gnIH19PlxyXG5cclxuICAgICAge2hhc01hcFdpZGdldCAmJiAoXHJcbiAgICAgICAgPEppbXVNYXBWaWV3Q29tcG9uZW50IHVzZU1hcFdpZGdldElkPXsocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LlswXSB8fCAocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LmZpcnN0Py4oKX0gb25BY3RpdmVWaWV3Q2hhbmdlPXtvbkFjdGl2ZVZpZXdDaGFuZ2V9IC8+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICA8aDUgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDEycHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+Q3Jhc2ggUmlzayBQcmVkaWN0aW9uIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIGZvbnRXZWlnaHQ6IDQwMCwgY29sb3I6ICcjOTk5JyB9fT4odjIwMjYuMDUuMTMgMTk6NDgpPC9zcGFuPjwvaDU+XHJcblxyXG4gICAgICB7LyogRXJyb3IgZGlzcGxheSAqL31cclxuICAgICAge2Vycm9yICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIHBhZGRpbmc6ICc4cHggMTBweCcsIGJhY2tncm91bmQ6ICcjZmZlYmVlJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjYzYyODI4JyB9fT5cclxuICAgICAgICAgIHtlcnJvcn1cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldEVycm9yKG51bGwpfSBzdHlsZT17eyBmbG9hdDogJ3JpZ2h0JywgYmFja2dyb3VuZDogJ25vbmUnLCBib3JkZXI6ICdub25lJywgY29sb3I6ICcjYzYyODI4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRXZWlnaHQ6IDcwMCB9fT57J1xcdTAwRDcnfTwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09IENIT09TRSBNT0RFID09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7bW9kZSA9PT0gJ2Nob29zZScgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMTJweCcgfX0+XHJcblxyXG4gICAgICAgICAgey8qIEFJIE9wdGlvbiAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBiYWNrZ3JvdW5kOiAnI2YzZTVmNScsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2U5M2Q4JyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMjBweCcgfX0+eydcXHVEODNFXFx1RERFMCd9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNzAwLCBjb2xvcjogJyM0YTE0OGMnIH19PkFJIFByZWRpY3Rpb248L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd0FJSGVscCghc2hvd0FJSGVscCl9IHN0eWxlPXt7IHdpZHRoOiAnMjRweCcsIGhlaWdodDogJzI0cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzdiMWZhMicsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmQ6IHNob3dBSUhlbHAgPyAnIzdiMWZhMicgOiAnI2ZmZicsIGNvbG9yOiBzaG93QUlIZWxwID8gJyNmZmYnIDogJyM3YjFmYTInLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNzAwLCBsaW5lSGVpZ2h0OiAnMjJweCcsIHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6IDAgfX0+PzwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNjY2JywgbWFyZ2luOiAnMCAwIDEwcHgnIH19Pktlcm5lbC1kZW5zaXR5IHNjb3JpbmcgZnJvbSBjcmFzaCBjbHVzdGVycyArIHJvYWQgYXR0cmlidXRlczwvcD5cclxuICAgICAgICAgICAge3Nob3dBSUhlbHAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEwcHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZicsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTFweCcsIGxpbmVIZWlnaHQ6ICcxLjcnLCBtYXJnaW5Cb3R0b206ICcxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMWJlZTcnIH19PlxyXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Ib3cgaXQgd29ya3M6PC9zdHJvbmc+PGJyIC8+XHJcbiAgICAgICAgICAgICAgICAxLiBZb3Ugc2VsZWN0IHJvdXRlcyAoYnkgSUQsIG5hbWUsIG1hcCBjbGljaywgb3IgZHJhdyBhcmVhKTxiciAvPlxyXG4gICAgICAgICAgICAgICAgMi4gVGhlIHdpZGdldCBxdWVyaWVzIDxlbT5jcmFzaCBldmVudHM8L2VtPiBhbmQgPGVtPnJvYWQgYXR0cmlidXRlIGV2ZW50czwvZW0+IGZyb20geW91ciBMUlM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDMuIFJvdXRlcyBhcmUgZGl2aWRlZCBpbnRvIDAuNS1taWxlIHNlZ21lbnRzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA0LiBDcmFzaCBjb3VudHMgcGVyIHNlZ21lbnQgYXJlIGNvbXB1dGVkPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA1LiBBIGtlcm5lbC1kZW5zaXR5IGFsZ29yaXRobSBzcHJlYWRzIGluZmx1ZW5jZSBmcm9tIGhpZ2gtY3Jhc2ggc2VnbWVudHMgdG8gbmVpZ2hib3JzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA2LiBSb2FkIGF0dHJpYnV0ZXMgKGN1cnZlcywgZ3JhZGVzLCBldGMuKSBlbnJpY2ggdGhlIGFuYWx5c2lzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA3LiBBIGNvbG9yLWNvZGVkIHJpc2sgbGF5ZXIgaXMgcHVibGlzaGVkIHRvIHlvdXIgcG9ydGFsIGFuZCBhZGRlZCB0byB0aGUgbWFwPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+QmVzdCBmb3I6PC9zdHJvbmc+IEZpbmRpbmcgZXhpc3RpbmcgY3Jhc2ggaG90c3BvdHMgYW5kIG5lYXJieSByaXNrIHpvbmVzLlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdhaScpfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMTBweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnIzdiMWZhMicsIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICAgICAgUnVuIEFJIFByZWRpY3Rpb25cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogTUwgT3B0aW9uICovfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCcsIGJhY2tncm91bmQ6ICcjZWRlN2Y2JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNiMzlkZGInIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcyMHB4JyB9fT57J1xcdUQ4M0RcXHVEQ0NBJ308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzMxMWI5MicgfX0+TUwgUHJlZGljdGlvbjwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93TUxIZWxwKCFzaG93TUxIZWxwKX0gc3R5bGU9e3sgd2lkdGg6ICcyNHB4JywgaGVpZ2h0OiAnMjRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjNmExYjlhJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZDogc2hvd01MSGVscCA/ICcjNmExYjlhJyA6ICcjZmZmJywgY29sb3I6IHNob3dNTEhlbHAgPyAnI2ZmZicgOiAnIzZhMWI5YScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA3MDAsIGxpbmVIZWlnaHQ6ICcyMnB4JywgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogMCB9fT4/PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM2NjYnLCBtYXJnaW46ICcwIDAgMTBweCcgfX0+UHJlLWNvbXB1dGVkIHdlaWdodHMgZnJvbSAxLjVNIE5ZIFN0YXRlIGNyYXNoIHJlY29yZHM8L3A+XHJcbiAgICAgICAgICAgIHtzaG93TUxIZWxwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzExcHgnLCBsaW5lSGVpZ2h0OiAnMS43JywgbWFyZ2luQm90dG9tOiAnMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZDFjNGU5JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+SG93IGl0IHdvcmtzOjwvc3Ryb25nPjxiciAvPlxyXG4gICAgICAgICAgICAgICAgMS4gWW91IHNlbGVjdCByb3V0ZXMgKGJ5IElELCBuYW1lLCBtYXAgY2xpY2ssIG9yIGRyYXcgYXJlYSk8YnIgLz5cclxuICAgICAgICAgICAgICAgIDIuIFRoZSB3aWRnZXQgcXVlcmllcyA8ZW0+cm9hZCBjaGFyYWN0ZXJpc3RpYyBldmVudHM8L2VtPiBmcm9tIHlvdXIgTFJTIChjdXJ2ZXMsIGdyYWRlcywgc3BlZWQgbGltaXRzLCBsYW5lIGNvdW50cywgc2hvdWxkZXJzLCBldGMuKTxiciAvPlxyXG4gICAgICAgICAgICAgICAgMy4gRWFjaCAwLjUtbWlsZSBzZWdtZW50J3Mgcm9hZCBjb25kaXRpb25zIGFyZSBtYXRjaGVkIHRvIHByZS1jb21wdXRlZCByaXNrIG11bHRpcGxpZXJzIGZyb20gMSw1MjUsMTIzIHJlYWwgTlkgc3RhdGUgY3Jhc2ggcmVjb3JkczxiciAvPlxyXG4gICAgICAgICAgICAgICAgNC4gRmFjdG9ycyBjb21wb3VuZCDigJQgYSBjdXJ2ZSArIGhpZ2ggc3BlZWQgKyBubyBzaG91bGRlciA9IHZlcnkgaGlnaCByaXNrPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA1LiBBIGNvbG9yLWNvZGVkIHByZWRpY3Rpb24gbGF5ZXIgaXMgcHVibGlzaGVkIGFuZCBhZGRlZCB0byB0aGUgbWFwPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+QmVzdCBmb3I6PC9zdHJvbmc+IFByZWRpY3RpbmcgPGVtPm5ldzwvZW0+IHJpc2sgZnJvbSByb2FkIGNoYXJhY3RlcmlzdGljcyBhbG9uZSDigJQgZmluZGluZyBkYW5nZXJvdXMgY29uZGl0aW9ucyBldmVuIHdoZXJlIG5vIGNyYXNoZXMgaGF2ZSBiZWVuIHJlcG9ydGVkIHlldC5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnbWwnKX0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzEwcHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyM2YTFiOWEnLCBjb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNjAwIH19PlxyXG4gICAgICAgICAgICAgIFJ1biBNTCBQcmVkaWN0aW9uXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT0gQUkgLyBNTCBXT1JLRkxPVyA9PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAgeyhtb2RlID09PSAnYWknIHx8IG1vZGUgPT09ICdtbCcpICYmICFyZXN1bHQgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMTJweCcgfX0+XHJcblxyXG4gICAgICAgICAgey8qIEJhY2sgYnV0dG9uICovfVxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRNb2RlKCdjaG9vc2UnKTsgc2V0RXJyb3IobnVsbCk7IHNldFByb2dyZXNzKCcnKSB9fSBkaXNhYmxlZD17cnVubmluZ30gc3R5bGU9e3sgYWxpZ25TZWxmOiAnZmxleC1zdGFydCcsIHBhZGRpbmc6ICc0cHggMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNTU1JyB9fT5cclxuICAgICAgICAgICAgeydcXHUyMTkwJ30gQmFja1xyXG4gICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDEycHgnLCBiYWNrZ3JvdW5kOiBtb2RlID09PSAnYWknID8gJyNmM2U1ZjUnIDogJyNlZGU3ZjYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiBtb2RlID09PSAnYWknID8gJyM0YTE0OGMnIDogJyMzMTFiOTInIH19PlxyXG4gICAgICAgICAgICB7bW9kZSA9PT0gJ2FpJyA/ICdcXHVEODNFXFx1RERFMCBBSSBQcmVkaWN0aW9uJyA6ICdcXHVEODNEXFx1RENDQSBNTCBQcmVkaWN0aW9uJ31cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBSb3V0ZSBzZWxlY3Rpb24gKi99XHJcbiAgICAgICAgICB7IXJ1bm5pbmcgJiYgcm91dGVTZWxlY3Rpb25VSSgpfVxyXG5cclxuICAgICAgICAgIHsvKiBSdW4gYnV0dG9uICovfVxyXG4gICAgICAgICAgeyFydW5uaW5nICYmIChcclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17bW9kZSA9PT0gJ2FpJyA/IHJ1bkFJUHJlZGljdGlvbiA6IHJ1bk1MUHJlZGljdGlvbn0gZGlzYWJsZWQ9e3J1bm5pbmcgfHwgKHNlYXJjaE1vZGUgIT09ICdtYXAnICYmICFyb3V0ZUlkLnRyaW0oKSkgfHwgKHNlYXJjaE1vZGUgPT09ICdtYXAnICYmIHNlbGVjdGVkTWFwUm91dGVJZHMuc2l6ZSA9PT0gMCl9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcxMnB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IChydW5uaW5nIHx8IChzZWFyY2hNb2RlICE9PSAnbWFwJyAmJiAhcm91dGVJZC50cmltKCkpIHx8IChzZWFyY2hNb2RlID09PSAnbWFwJyAmJiBzZWxlY3RlZE1hcFJvdXRlSWRzLnNpemUgPT09IDApKSA/ICcjYWFhJyA6IChtb2RlID09PSAnYWknID8gJyM3YjFmYTInIDogJyM2YTFiOWEnKSwgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgICAgICB7bW9kZSA9PT0gJ2FpJyA/ICdSdW4gQUkgUHJlZGljdGlvbicgOiAnUnVuIE1MIFByZWRpY3Rpb24nfVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgey8qIFByb2dyZXNzICovfVxyXG4gICAgICAgICAge3J1bm5pbmcgJiYgcnVubmluZ1VJKCl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT0gUkVTVUxUID09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7cmVzdWx0ICYmIHJlc3VsdFVJKCl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpZGdldFxyXG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9