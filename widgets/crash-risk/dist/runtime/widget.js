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
    useEffect(() => {
        if (config === null || config === void 0 ? void 0 : config.lrsServiceUrl) {
            lrsServiceRef.current = new _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_2__.LrsService(config.lrsServiceUrl);
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
        if (!((_a = jimuMapViewRef.current) === null || _a === void 0 ? void 0 : _a.view) || !lrsServiceRef.current || !routeGeometriesRef.current.has(rid))
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
        const routeData = routeGeometriesRef.current.get(rid);
        if (!routeData)
            return;
        // Reconstruct paths from geometry query (refetch for paths structure)
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
        for (const cfg of eventConfigs) {
            const layerUrl = `${config.lrsServiceUrl}/eventLayers/${cfg.layerId}/query`;
            for (const rid of routeIds) {
                const where = `${cfg.routeIdField} = '${rid.replace(/'/g, "''")}'`;
                const params = {
                    where,
                    outFields: '*',
                    returnGeometry: 'false',
                    resultRecordCount: '5000',
                    f: 'json'
                };
                const data = yield lrsServiceRef.current.queryFeaturesDirect(layerUrl, params);
                for (const f of (data.features || [])) {
                    const measureField = cfg.measureField || cfg.fromMeasureField || 'Measure';
                    allEntries.push(Object.assign({ Feature: cfg.name, RouteID: f.attributes[cfg.routeIdField], Measure: (_a = f.attributes[measureField]) !== null && _a !== void 0 ? _a : f.attributes[cfg.fromMeasureField] }, Object.fromEntries((cfg.attributes || []).map(a => [a, f.attributes[a]]))));
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
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '10px', fontWeight: 400, color: '#999' } }, "(v2026.05.13 19:12)")),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jcmFzaC1yaXNrL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxZQUFZLEdBQUcsQ0FBQztBQUVwQjs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBRSxHQUFXLEVBQUUsTUFBOEI7SUFDaEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLFlBQVksR0FBRyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxZQUFZLEVBQUUsRUFBRTtRQUM5RCxNQUFNLENBQUMsUUFBUSxHQUFHLFlBQVk7UUFFOUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2pELE1BQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUVoQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLE9BQVEsTUFBYyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLE1BQU0sQ0FBQyxVQUFVO2dCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxDQUFDLENBRUE7UUFBQyxNQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUM3QyxPQUFPLEVBQUU7WUFDVCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FB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QUMsT0FBTyxHQUFHLEdBQUcsRUFBRSxVQUFVLENBQUM7b0JBQ2pELE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7b0JBQ2xDLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQztvQkFDdEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzdDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3JDLElBQUksSUFBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLElBQUksRUFBRSxFQUFFLENBQUM7NEJBQzdCLE1BQU0sSUFBSSxHQUFHLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNwRCxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNwRSxJQUFJLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNwRSxNQUFLO3dCQUNQLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxNQUFNLElBQUksR0FBZSxFQUFFO29CQUMzQixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQzt3QkFDN0MsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ2pDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDckMsSUFBSSxFQUFFLEdBQUcsT0FBTzs0QkFBRSxTQUFRO3dCQUMxQixJQUFJLEVBQUUsR0FBRyxLQUFLOzRCQUFFLE1BQUs7d0JBQ3JCLElBQUksRUFBRSxJQUFJLE9BQU8sSUFBSSxFQUFFLElBQUksS0FBSyxFQUFFLENBQUM7NEJBQ2pDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQ0FBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNuSCxDQUFDOzZCQUFNLElBQUksRUFBRSxHQUFHLE9BQU8sSUFBSSxFQUFFLEdBQUcsT0FBTyxFQUFFLENBQUM7NEJBQ3hDLE1BQU0sSUFBSSxHQUFHLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs0QkFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzNJLENBQUM7d0JBQ0QsSUFBSSxFQUFFLElBQUksT0FBTyxJQUFJLEVBQUUsSUFBSSxLQUFLOzRCQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs2QkFDaEYsSUFBSSxFQUFFLEdBQUcsS0FBSyxJQUFJLEVBQUUsR0FBRyxLQUFLLEVBQUUsQ0FBQzs0QkFDbEMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDOzRCQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMs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QUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbkgsQ0FBQzs0QkFDRCxJQUFJLEVBQUUsSUFBSSxHQUFHLElBQUksRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dDQUMzQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO2dDQUNyQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbkgsQ0FBQzt3QkFDSCxDQUFDO29CQUNILENBQUM7b0JBQ0QsSUFBSSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUM7d0JBQUUsU0FBUTtvQkFFN0IsTUFBTSxTQUFTLEdBQUcsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNB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QSxPQUFPLElBQUksU0FBUyxFQUFFLENBQ25CLENBQ1A7UUFHQSxNQUFNLElBQUksUUFBUSxFQUFFLENBQ2pCLENBQ1A7QUFDSCxDQUFDO0FBRUQsaUVBQWUsTUFBTTtBQUViLFNBQVMsMkJBQTJCLENBQUMsR0FBRyxJQUFJLHFCQUF1QixHQUFHLEdBQUcsRUFBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL2NyYXNoLXJpc2svc3JjL2xycy11dGlscy9scnMtc2VydmljZS50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtYXJjZ2lzXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL2NyYXNoLXJpc2svc3JjL3J1bnRpbWUvd2lkZ2V0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBMUlMgUkVTVCBBUEkgU2VydmljZSB3cmFwcGVyXHJcbi8vIFVzZXMgSlNPTlAgdG8gYnlwYXNzIENPUlMgaXNzdWVzIHdpdGggbWlzY29uZmlndXJlZCBzZXJ2ZXJzIChkdXBsaWNhdGUgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIGhlYWRlcnMpXHJcbmltcG9ydCB0eXBlIHtcclxuICBMcnNTZXJ2aWNlSW5mbyxcclxuICBOZXR3b3JrTGF5ZXJJbmZvLFxyXG4gIEV2ZW50TGF5ZXJJbmZvLFxyXG4gIE1lYXN1cmVUb0dlb21ldHJ5TG9jYXRpb24sXHJcbiAgTWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQsXHJcbiAgR2VvbWV0cnlUb01lYXN1cmVSZXN1bHQsXHJcbiAgUXVlcnlBdHRyaWJ1dGVTZXRQYXJhbXMsXHJcbiAgRmVhdHVyZVNldFJlc3VsdFxyXG59IGZyb20gJy4vdHlwZXMnXHJcblxyXG5sZXQganNvbnBDb3VudGVyID0gMFxyXG5cclxuLyoqXHJcbiAqIEpTT05QIHJlcXVlc3Qg4oCUIGJ5cGFzc2VzIENPUlMgZW50aXJlbHkgYnkgaW5qZWN0aW5nIGEgPHNjcmlwdD4gdGFnLlxyXG4gKiBBcmNHSVMgUkVTVCBBUEkgc3VwcG9ydHMgSlNPTlAgdmlhIHRoZSAnY2FsbGJhY2snIHBhcmFtZXRlci5cclxuICovXHJcbmZ1bmN0aW9uIGpzb25wUmVxdWVzdCAodXJsOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8YW55PiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IGNhbGxiYWNrTmFtZSA9IGBfbHJzX2NiXyR7RGF0ZS5ub3coKX1fJHtqc29ucENvdW50ZXIrK31gXHJcbiAgICBwYXJhbXMuY2FsbGJhY2sgPSBjYWxsYmFja05hbWVcclxuXHJcbiAgICBjb25zdCBxcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocGFyYW1zKS50b1N0cmluZygpXHJcbiAgICBjb25zdCBzY3JpcHRVcmwgPSBgJHt1cmx9PyR7cXN9YFxyXG5cclxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXHJcbiAgICBzY3JpcHQuc3JjID0gc2NyaXB0VXJsXHJcblxyXG4gICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcclxuICAgICAgZGVsZXRlICh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdXHJcbiAgICAgIGlmIChzY3JpcHQucGFyZW50Tm9kZSkgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KVxyXG4gICAgfVxyXG5cclxuICAgIDsod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yLm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZXJyb3InKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0pTT05QIHJlcXVlc3QgZmFpbGVkJykpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdKSB7XHJcbiAgICAgICAgY2xlYW51cCgpXHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUmVxdWVzdCB0aW1lb3V0JykpXHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwKVxyXG5cclxuICAgIDsod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKGRhdGEuZXJyb3IubWVzc2FnZSB8fCAnUmVxdWVzdCBlcnJvcicpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxyXG4gIH0pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBXcmFwcGVyIGFyb3VuZCBBcmNHSVMgTFJTIFJFU1QgQVBJIChMUlNlcnZlciBleHRlbnNpb24pLlxyXG4gKiBVc2VzIEpTT05QIGZvciBhbGwgcmVxdWVzdHMgdG8gYXZvaWQgQ09SUyBpc3N1ZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTHJzU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBiYXNlVXJsOiBzdHJpbmdcclxuICBwcml2YXRlIHRva2VuOiBzdHJpbmcgfCBudWxsXHJcblxyXG4gIGNvbnN0cnVjdG9yIChiYXNlVXJsOiBzdHJpbmcsIHRva2VuPzogc3RyaW5nKSB7XHJcbiAgICAvLyBFbnN1cmUgbm8gdHJhaWxpbmcgc2xhc2hcclxuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJylcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlbiB8fCBudWxsXHJcbiAgfVxyXG5cclxuICBzZXRUb2tlbiAodG9rZW46IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy50b2tlbiA9IHRva2VuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBMUlMgc2VydmljZSBtZXRhZGF0YSAobmV0d29yayBsYXllcnMsIGV2ZW50IGxheWVycywgZXRjLilcclxuICAgKi9cclxuICBhc3luYyBnZXRTZXJ2aWNlSW5mbyAoKTogUHJvbWlzZTxMcnNTZXJ2aWNlSW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxMcnNTZXJ2aWNlSW5mbz4oJycpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBkZXRhaWxlZCBpbmZvIGZvciBhIG5ldHdvcmsgbGF5ZXIgKGZpZWxkcywgbWVhc3VyZSBwcmVjaXNpb24sIGV0Yy4pXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0TmV0d29ya0xheWVySW5mbyAobGF5ZXJJZDogbnVtYmVyKTogUHJvbWlzZTxOZXR3b3JrTGF5ZXJJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PE5ldHdvcmtMYXllckluZm8+KGAvbmV0d29ya0xheWVycy8ke2xheWVySWR9YClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGRldGFpbGVkIGluZm8gZm9yIGFuIGV2ZW50IGxheWVyXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0RXZlbnRMYXllckluZm8gKGxheWVySWQ6IG51bWJlcik6IFByb21pc2U8RXZlbnRMYXllckluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8RXZlbnRMYXllckluZm8+KGAvZXZlbnRMYXllcnMvJHtsYXllcklkfWApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHJvdXRlIElEICsgbWVhc3VyZXMgdG8gbWFwIGdlb21ldHJ5XHJcbiAgICovXHJcbiAgYXN5bmMgbWVhc3VyZVRvR2VvbWV0cnkgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIGxvY2F0aW9uczogTWVhc3VyZVRvR2VvbWV0cnlMb2NhdGlvbltdLFxyXG4gICAgb3V0U1I/OiBhbnlcclxuICApOiBQcm9taXNlPE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0PiB7XHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkobG9jYXRpb25zKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAob3V0U1IpIHtcclxuICAgICAgcGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkob3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L21lYXN1cmVUb0dlb21ldHJ5YCxcclxuICAgICAgcGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IG1hcCBnZW9tZXRyeSAocG9pbnQpIHRvIHJvdXRlICsgbWVhc3VyZVxyXG4gICAqL1xyXG4gIGFzeW5jIGdlb21ldHJ5VG9NZWFzdXJlIChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBsb2NhdGlvbnM6IEFycmF5PHsgZ2VvbWV0cnk6IGFueSB9PixcclxuICAgIG91dFNSPzogYW55XHJcbiAgKTogUHJvbWlzZTxHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdD4ge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucyksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKG91dFNSKSB7XHJcbiAgICAgIHBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KG91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9nZW9tZXRyeVRvTWVhc3VyZWAsXHJcbiAgICAgIHBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHluYW1pYyBzZWdtZW50YXRpb24gb3ZlcmxheSDigJQgcXVlcnlBdHRyaWJ1dGVTZXRcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUF0dHJpYnV0ZVNldCAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgcGFyYW1zOiBRdWVyeUF0dHJpYnV0ZVNldFBhcmFtc1xyXG4gICk6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgY29uc3QgcmVxdWVzdFBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShwYXJhbXMubG9jYXRpb25zKSxcclxuICAgICAgYXR0cmlidXRlU2V0OiBKU09OLnN0cmluZ2lmeShwYXJhbXMuYXR0cmlidXRlU2V0KSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAocGFyYW1zLm91dFNSKSB7XHJcbiAgICAgIHJlcXVlc3RQYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShwYXJhbXMub3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEZlYXR1cmVTZXRSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vcXVlcnlBdHRyaWJ1dGVTZXRgLFxyXG4gICAgICByZXF1ZXN0UGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFuZGFyZCBmZWF0dXJlIHF1ZXJ5IGFnYWluc3QgYSBtYXAgc2VydmljZSBsYXllciAoZm9yIFJvYWQgTG9nIGluZGl2aWR1YWwgZXZlbnQgcXVlcmllcylcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUZlYXR1cmVzIChcclxuICAgIG1hcFNlcnZpY2VVcmw6IHN0cmluZyxcclxuICAgIGxheWVySWQ6IG51bWJlcixcclxuICAgIHdoZXJlOiBzdHJpbmcsXHJcbiAgICBvdXRGaWVsZHM6IHN0cmluZ1tdID0gWycqJ11cclxuICApOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIC8vIFRoZSBtYXAgc2VydmljZSBVUkwgaXMgdGhlIHBhcmVudCBvZiBMUlNlcnZlciBleHRlbnNpb25cclxuICAgIC8vIGUuZy4gLi4uL01hcFNlcnZlci8wL3F1ZXJ5XHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gdGhpcy5iYXNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgd2hlcmUsXHJcbiAgICAgIG91dEZpZWxkczogb3V0RmllbGRzLmpvaW4oJywnKSxcclxuICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXJlY3QgcXVlcnkgd2l0aCBhcmJpdHJhcnkgcGFyYW1zIChmb3Igc3BhdGlhbCBxdWVyaWVzIHZpYSBKU09OUClcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUZlYXR1cmVzRGlyZWN0ICh1cmw6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcbiAgICBwYXJhbXMuZiA9IHBhcmFtcy5mIHx8ICdqc29uJ1xyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFF1ZXJ5IHJvdXRlcyBvbiBhIG5ldHdvcmsgbGF5ZXIgKGZvciByb3V0ZSBwaWNrZXIgYXV0b2NvbXBsZXRlKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5Um91dGVzIChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBzZWFyY2hUZXh0OiBzdHJpbmcsXHJcbiAgICByb3V0ZUlkRmllbGQ6IHN0cmluZyxcclxuICAgIHJvdXRlTmFtZUZpZWxkOiBzdHJpbmcgfCBudWxsLFxyXG4gICAgbWF4UmVzdWx0czogbnVtYmVyID0gMTBcclxuICApOiBQcm9taXNlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB8IG51bGwgfT4+IHtcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSB0aGlzLmJhc2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7bmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgIGNvbnN0IHNlYXJjaEZpZWxkID0gcm91dGVOYW1lRmllbGQgfHwgcm91dGVJZEZpZWxkXHJcbiAgICBjb25zdCB3aGVyZSA9IGBVUFBFUigke3NlYXJjaEZpZWxkfSkgTElLRSBVUFBFUignJHtzZWFyY2hUZXh0LnJlcGxhY2UoLycvZywgXCInJ1wiKX0lJylgXHJcbiAgICBjb25zdCBvdXRGaWVsZHMgPSByb3V0ZU5hbWVGaWVsZFxyXG4gICAgICA/IFtyb3V0ZUlkRmllbGQsIHJvdXRlTmFtZUZpZWxkXVxyXG4gICAgICA6IFtyb3V0ZUlkRmllbGRdXHJcblxyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICB3aGVyZSxcclxuICAgICAgb3V0RmllbGRzOiBvdXRGaWVsZHMuam9pbignLCcpLFxyXG4gICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6IG1heFJlc3VsdHMudG9TdHJpbmcoKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QganNvbiA9IGF3YWl0IGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuXHJcbiAgICBjb25zdCBhbGwgPSAoanNvbi5mZWF0dXJlcyB8fCBbXSkubWFwKChmOiBhbnkpID0+ICh7XHJcbiAgICAgIHJvdXRlSWQ6IGYuYXR0cmlidXRlc1tyb3V0ZUlkRmllbGRdLFxyXG4gICAgICByb3V0ZU5hbWU6IHJvdXRlTmFtZUZpZWxkID8gZi5hdHRyaWJ1dGVzW3JvdXRlTmFtZUZpZWxkXSA6IG51bGxcclxuICAgIH0pKVxyXG4gICAgLy8gRGVkdXBsaWNhdGUgYnkgcm91dGVJZFxyXG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXHJcbiAgICByZXR1cm4gYWxsLmZpbHRlcigocjogYW55KSA9PiB7XHJcbiAgICAgIGlmIChzZWVuLmhhcyhyLnJvdXRlSWQpKSByZXR1cm4gZmFsc2VcclxuICAgICAgc2Vlbi5hZGQoci5yb3V0ZUlkKVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vIC0tLSBQcml2YXRlIGhlbHBlcnMgLS0tXHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVxdWVzdDxUPiAocGF0aDogc3RyaW5nLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxUPiB7XHJcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmJhc2VVcmx9JHtwYXRofWBcclxuICAgIGNvbnN0IGFsbFBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgZjogJ2pzb24nLFxyXG4gICAgICAuLi5wYXJhbXNcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIGFsbFBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgYWxsUGFyYW1zKSBhcyBQcm9taXNlPFQ+XHJcbiAgfVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X2FyY2dpc19fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X2NvcmVfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBleGlzdHMgKGRldmVsb3BtZW50IG9ubHkpXG5cdGlmIChfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsIi8qKiBAanN4UnVudGltZSBjbGFzc2ljICovXHJcbmltcG9ydCB7IFJlYWN0LCB0eXBlIEFsbFdpZGdldFByb3BzLCBTZXNzaW9uTWFuYWdlciB9IGZyb20gJ2ppbXUtY29yZSdcclxuaW1wb3J0IHsgSmltdU1hcFZpZXdDb21wb25lbnQsIHR5cGUgSmltdU1hcFZpZXcgfSBmcm9tICdqaW11LWFyY2dpcydcclxuaW1wb3J0IHR5cGUgeyBJTUNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHsgTHJzU2VydmljZSB9IGZyb20gJy4uL2xycy11dGlscy9scnMtc2VydmljZSdcclxuXHJcbmNvbnN0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VSZWYsIHVzZUVmZmVjdCB9ID0gUmVhY3RcclxuXHJcbnR5cGUgV29ya2Zsb3dNb2RlID0gJ2Nob29zZScgfCAnYWknIHwgJ21sJ1xyXG5cclxuY29uc3QgV2lkZ2V0ID0gKHByb3BzOiBBbGxXaWRnZXRQcm9wczxJTUNvbmZpZz4pID0+IHtcclxuICBjb25zdCBjb25maWcgPSBwcm9wcy5jb25maWdcclxuICBjb25zdCBoYXNNYXBXaWRnZXQgPSBCb29sZWFuKHByb3BzLnVzZU1hcFdpZGdldElkcyAmJiAoKHByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpLmxlbmd0aCA+IDAgfHwgKHByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpPy5zaXplID4gMCkpXHJcblxyXG4gIC8vIFdvcmtmbG93IHN0YXRlXHJcbiAgY29uc3QgW21vZGUsIHNldE1vZGVdID0gdXNlU3RhdGU8V29ya2Zsb3dNb2RlPignY2hvb3NlJylcclxuICBjb25zdCBbc2hvd0FJSGVscCwgc2V0U2hvd0FJSGVscF0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbc2hvd01MSGVscCwgc2V0U2hvd01MSGVscF0gPSB1c2VTdGF0ZShmYWxzZSlcclxuXHJcbiAgLy8gUm91dGUgc2VsZWN0aW9uIHN0YXRlXHJcbiAgY29uc3QgW3JvdXRlSWQsIHNldFJvdXRlSWRdID0gdXNlU3RhdGUoJycpXHJcbiAgY29uc3QgW3JvdXRlTmFtZSwgc2V0Um91dGVOYW1lXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtmcm9tTWVhc3VyZSwgc2V0RnJvbU1lYXN1cmVdID0gdXNlU3RhdGUoJycpXHJcbiAgY29uc3QgW3RvTWVhc3VyZSwgc2V0VG9NZWFzdXJlXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtyb3V0ZU1lYXN1cmVSYW5nZSwgc2V0Um91dGVNZWFzdXJlUmFuZ2VdID0gdXNlU3RhdGU8eyBtaW46IG51bWJlcjsgbWF4OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgW3NlYXJjaE1vZGUsIHNldFNlYXJjaE1vZGVdID0gdXNlU3RhdGU8J2lkJyB8ICduYW1lJyB8ICdtYXAnPignaWQnKVxyXG4gIGNvbnN0IFtyb3V0ZVN1Z2dlc3Rpb25zLCBzZXRSb3V0ZVN1Z2dlc3Rpb25zXSA9IHVzZVN0YXRlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB8IG51bGwgfT4+KFtdKVxyXG4gIGNvbnN0IFtzaG93U3VnZ2VzdGlvbnMsIHNldFNob3dTdWdnZXN0aW9uc10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbcGlja2luZ0Zyb21NYXAsIHNldFBpY2tpbmdGcm9tTWFwXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtwaWNraW5nTWVhc3VyZSwgc2V0UGlja2luZ01lYXN1cmVdID0gdXNlU3RhdGU8J2Zyb20nIHwgJ3RvJyB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgW2RyYXdpbmcsIHNldERyYXdpbmddID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW21hcFJvdXRlcywgc2V0TWFwUm91dGVzXSA9IHVzZVN0YXRlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB8IG51bGw7IGZyb21NZWFzdXJlOiBudW1iZXI7IHRvTWVhc3VyZTogbnVtYmVyIH0+PihbXSlcclxuICBjb25zdCBbc2VsZWN0ZWRNYXBSb3V0ZUlkcywgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkc10gPSB1c2VTdGF0ZTxTZXQ8c3RyaW5nPj4obmV3IFNldCgpKVxyXG4gIGNvbnN0IFtyb3V0ZVBpY2tDYW5kaWRhdGVzLCBzZXRSb3V0ZVBpY2tDYW5kaWRhdGVzXSA9IHVzZVN0YXRlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB9PiB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgW3NlbGVjdGVkRm9sZGVySWQsIHNldFNlbGVjdGVkRm9sZGVySWRdID0gdXNlU3RhdGU8c3RyaW5nPignJylcclxuXHJcbiAgLy8gUHJlZGljdGlvbiBzdGF0ZVxyXG4gIGNvbnN0IFtydW5uaW5nLCBzZXRSdW5uaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtwcm9ncmVzcywgc2V0UHJvZ3Jlc3NdID0gdXNlU3RhdGUoJycpXHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtyZXN1bHQsIHNldFJlc3VsdF0gPSB1c2VTdGF0ZTx7IGxheWVyVXJsPzogc3RyaW5nOyBpdGVtVXJsPzogc3RyaW5nIH0gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzaG93RXhwbGFuYXRpb24sIHNldFNob3dFeHBsYW5hdGlvbl0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbZmFjdG9ycywgc2V0RmFjdG9yc10gPSB1c2VTdGF0ZTxhbnk+KG51bGwpXHJcbiAgY29uc3QgW21vZGVsSW5mbywgc2V0TW9kZWxJbmZvXSA9IHVzZVN0YXRlPGFueT4obnVsbClcclxuXHJcbiAgLy8gUmVmc1xyXG4gIGNvbnN0IGppbXVNYXBWaWV3UmVmID0gdXNlUmVmPEppbXVNYXBWaWV3IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBscnNTZXJ2aWNlUmVmID0gdXNlUmVmPExyc1NlcnZpY2UgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHJvdXRlR2VvbWV0cmllc1JlZiA9IHVzZVJlZjxNYXA8c3RyaW5nLCB7IHZlcnRpY2VzOiBudW1iZXJbXVtdOyBtSWR4OiBudW1iZXIgfT4+KG5ldyBNYXAoKSlcclxuICBjb25zdCBwaWNrSGFuZGxlclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja0hvdmVySGFuZGxlclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja1Rvb2x0aXBSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHBpY2tTbmFwR3JhcGhpY1JlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja0hvdmVyVGltZW91dFJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3Qgc2tldGNoVk1SZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IGdyYXBoaWNzTGF5ZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHNlYXJjaFRpbWVvdXRSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIC8vIFJvdXRlIHByZXZpZXcgKyBtZWFzdXJlIHBpY2tpbmcgcmVmc1xyXG4gIGNvbnN0IHJvdXRlUHJldmlld0dyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHJvdXRlUHJldmlld0xheWVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBmcm9tTWVhc3VyZUdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHRvTWVhc3VyZUdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHJvdXRlUHJldmlld1ZlcnRzUmVmID0gdXNlUmVmPHsgdmVydGljZXM6IG51bWJlcltdW107IG1JZHg6IG51bWJlciB9IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBtZWFzdXJlUGlja0hhbmRsZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IG1lYXN1cmVQaWNrSG92ZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IG1lYXN1cmVTbmFwR3JhcGhpY1JlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgbWVhc3VyZVRvb2x0aXBSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHNob3dSb3V0ZVByZXZpZXdSZWYgPSB1c2VSZWY8KHJpZDogc3RyaW5nKSA9PiB2b2lkPigoKSA9PiB7fSlcclxuICBjb25zdCBzaG93TWVhc3VyZVBvaW50UmVmID0gdXNlUmVmPCh3aGljaDogJ2Zyb20nIHwgJ3RvJywgbWVhc3VyZVZhbDogc3RyaW5nKSA9PiB2b2lkPigoKSA9PiB7fSlcclxuXHJcbiAgLy8gSW5pdGlhbGl6ZSBMcnNTZXJ2aWNlIChKU09OUC1iYXNlZCwgYnlwYXNzZXMgQ09SUylcclxuICB1c2VFZmZlY3QoKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpZz8ubHJzU2VydmljZVVybCkge1xyXG4gICAgICBscnNTZXJ2aWNlUmVmLmN1cnJlbnQgPSBuZXcgTHJzU2VydmljZShjb25maWcubHJzU2VydmljZVVybClcclxuICAgIH1cclxuICB9LCBbY29uZmlnPy5scnNTZXJ2aWNlVXJsXSlcclxuXHJcbiAgLy8gSGFuZGxlIG1hcCB2aWV3IHJlYWR5XHJcbiAgY29uc3Qgb25BY3RpdmVWaWV3Q2hhbmdlID0gdXNlQ2FsbGJhY2soKGptdjogSmltdU1hcFZpZXcpID0+IHtcclxuICAgIGppbXVNYXBWaWV3UmVmLmN1cnJlbnQgPSBqbXZcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gUk9VVEUgU0VMRUNUSU9OIChzYW1lIGFzIHJvYWQtbG9nKSA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBoYW5kbGVSb3V0ZVNlYXJjaCA9IHVzZUNhbGxiYWNrKCh2YWx1ZTogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoc2VhcmNoTW9kZSA9PT0gJ2lkJykge1xyXG4gICAgICBzZXRSb3V0ZUlkKHZhbHVlKVxyXG4gICAgICBzZXRSb3V0ZU5hbWUoJycpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzZXRSb3V0ZU5hbWUodmFsdWUpXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlYXJjaFRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHNlYXJjaFRpbWVvdXRSZWYuY3VycmVudClcclxuICAgIGlmICh2YWx1ZS5sZW5ndGggPCAyIHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHtcclxuICAgICAgc2V0Um91dGVTdWdnZXN0aW9ucyhbXSlcclxuICAgICAgc2V0U2hvd1N1Z2dlc3Rpb25zKGZhbHNlKVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgICAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgICAgIGNvbnN0IHNlYXJjaEZpZWxkID0gc2VhcmNoTW9kZSA9PT0gJ25hbWUnID8gbmFtZUZpZWxkIDogcm91dGVGaWVsZFxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIHdoZXJlOiBgVVBQRVIoJHtzZWFyY2hGaWVsZH0pIExJS0UgVVBQRVIoJyUke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0lJylgLFxyXG4gICAgICAgICAgb3V0RmllbGRzOiBgJHtyb3V0ZUZpZWxkfSwke25hbWVGaWVsZH1gLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdCh1cmwsIHBhcmFtcylcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gKGRhdGEuZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnLFxyXG4gICAgICAgICAgcm91dGVOYW1lOiBmLmF0dHJpYnV0ZXNbbmFtZUZpZWxkXSB8fCBudWxsXHJcbiAgICAgICAgfSkpXHJcbiAgICAgICAgc2V0Um91dGVTdWdnZXN0aW9ucyhyZXN1bHRzKVxyXG4gICAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhyZXN1bHRzLmxlbmd0aCA+IDApXHJcbiAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMoW10pXHJcbiAgICAgICAgc2V0U2hvd1N1Z2dlc3Rpb25zKGZhbHNlKVxyXG4gICAgICB9XHJcbiAgICB9LCAzMDApXHJcbiAgfSwgW2NvbmZpZywgc2VhcmNoTW9kZV0pXHJcblxyXG4gIGNvbnN0IHNlbGVjdFJvdXRlID0gdXNlQ2FsbGJhY2soKHJvdXRlOiB7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0pID0+IHtcclxuICAgIHNldFJvdXRlSWQocm91dGUucm91dGVJZClcclxuICAgIHNldFJvdXRlTmFtZShyb3V0ZS5yb3V0ZU5hbWUgfHwgJycpXHJcbiAgICBzZXRTaG93U3VnZ2VzdGlvbnMoZmFsc2UpXHJcbiAgICBmZXRjaFJvdXRlTWVhc3VyZXMocm91dGUucm91dGVJZClcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gRmV0Y2ggcm91dGUgZ2VvbWV0cnkgKyBtZWFzdXJlIHJhbmdlICsgc2hvdyBwcmV2aWV3XHJcbiAgY29uc3QgZmV0Y2hSb3V0ZU1lYXN1cmVzID0gdXNlQ2FsbGJhY2soYXN5bmMgKHJpZDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWxyc1NlcnZpY2VSZWYuY3VycmVudCB8fCAhcmlkKSByZXR1cm5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJvdXRlRmllbGQgPSBjb25maWcubmV0d29ya1JvdXRlSWRGaWVsZCB8fCAnY3VzdG9tcm91dGVmaWVsZCdcclxuICAgICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICAgIGNvbnN0IHZpZXdXa2lkID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldz8uc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtjb25maWcubmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgIHdoZXJlOiBgJHtyb3V0ZUZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AsXHJcbiAgICAgICAgb3V0RmllbGRzOiByb3V0ZUZpZWxkLFxyXG4gICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMScsXHJcbiAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgIGlmICghZGF0YS5mZWF0dXJlcz8ubGVuZ3RoKSByZXR1cm5cclxuXHJcbiAgICAgIGNvbnN0IHBhdGhzID0gZGF0YS5mZWF0dXJlc1swXS5nZW9tZXRyeT8ucGF0aHMgfHwgW11cclxuICAgICAgY29uc3QgYWxsVmVydHM6IG51bWJlcltdW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IHBhdGggb2YgcGF0aHMpIGFsbFZlcnRzLnB1c2goLi4ucGF0aClcclxuICAgICAgY29uc3QgaGFzWiA9IGRhdGEuZmVhdHVyZXNbMF0uZ2VvbWV0cnk/Lmhhc1pcclxuICAgICAgY29uc3QgbUlkeCA9IGhhc1ogPyAzIDogMlxyXG4gICAgICBhbGxWZXJ0cy5zb3J0KChhLCBiKSA9PiAoYVttSWR4XSB8fCAwKSAtIChiW21JZHhdIHx8IDApKVxyXG5cclxuICAgICAgaWYgKGFsbFZlcnRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBtaW5NID0gYWxsVmVydHNbMF1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IG1heE0gPSBhbGxWZXJ0c1thbGxWZXJ0cy5sZW5ndGggLSAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgc2V0RnJvbU1lYXN1cmUobWluTS50b0ZpeGVkKDMpKVxyXG4gICAgICAgIHNldFRvTWVhc3VyZShtYXhNLnRvRml4ZWQoMykpXHJcbiAgICAgICAgc2V0Um91dGVNZWFzdXJlUmFuZ2UoeyBtaW46IG1pbk0sIG1heDogbWF4TSB9KVxyXG4gICAgICAgIHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LnNldChyaWQsIHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH0pXHJcbiAgICAgICAgcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCA9IHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH1cclxuXHJcbiAgICAgICAgLy8gU2hvdyByb3V0ZSBwcmV2aWV3IG9uIG1hcFxyXG4gICAgICAgIHNob3dSb3V0ZVByZXZpZXdSZWYuY3VycmVudChyaWQpXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0NyYXNoUmlza10gZmV0Y2hSb3V0ZU1lYXN1cmVzIGZhaWxlZDonLCBlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWddKVxyXG5cclxuICAvLyBTaG93IHNlbGVjdGVkIHJvdXRlIGFzIGEgZGFzaGVkIGxpbmUgb24gdGhlIG1hcCAobGlrZSByb2FkLWxvZylcclxuICBjb25zdCBzaG93Um91dGVQcmV2aWV3ID0gdXNlQ2FsbGJhY2soYXN5bmMgKHJpZDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCB8fCAhcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnQuaGFzKHJpZCkpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICAvLyBFbnN1cmUgcHJldmlldyBHcmFwaGljc0xheWVyIGV4aXN0c1xyXG4gICAgaWYgKCFyb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IEdyYXBoaWNzTGF5ZXIgPSBhd2FpdCAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2xheWVycy9HcmFwaGljc0xheWVyJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSlcclxuICAgICAgY29uc3QgZ2wgPSBuZXcgR3JhcGhpY3NMYXllcih7IGlkOiAnX19jcmFzaHJpc2tfcm91dGVfcHJldmlld19fJywgdGl0bGU6ICdSb3V0ZSBQcmV2aWV3JyB9KVxyXG4gICAgICB2aWV3Lm1hcC5hZGQoZ2wsIDApXHJcbiAgICAgIHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnQgPSBnbFxyXG4gICAgfVxyXG4gICAgY29uc3QgcHJldmlld0xheWVyID0gcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudFxyXG5cclxuICAgIC8vIFJlbW92ZSBwcmV2aW91c1xyXG4gICAgaWYgKHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCkgeyBwcmV2aWV3TGF5ZXIucmVtb3ZlKHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCk7IHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSkgZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQuZm9yRWFjaCgoZzogYW55KSA9PiBwcmV2aWV3TGF5ZXIucmVtb3ZlKGcpKVxyXG4gICAgICBlbHNlIHByZXZpZXdMYXllci5yZW1vdmUoZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpXHJcbiAgICAgIGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgfVxyXG4gICAgaWYgKHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpKSB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQuZm9yRWFjaCgoZzogYW55KSA9PiBwcmV2aWV3TGF5ZXIucmVtb3ZlKGcpKVxyXG4gICAgICBlbHNlIHByZXZpZXdMYXllci5yZW1vdmUodG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KVxyXG4gICAgICB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyaWQpIHJldHVyblxyXG5cclxuICAgIGNvbnN0IHJvdXRlRGF0YSA9IHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LmdldChyaWQpXHJcbiAgICBpZiAoIXJvdXRlRGF0YSkgcmV0dXJuXHJcblxyXG4gICAgLy8gUmVjb25zdHJ1Y3QgcGF0aHMgZnJvbSBnZW9tZXRyeSBxdWVyeSAocmVmZXRjaCBmb3IgcGF0aHMgc3RydWN0dXJlKVxyXG4gICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHVybCwge1xyXG4gICAgICAgIHdoZXJlOiBgJHtyb3V0ZUZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AsXHJcbiAgICAgICAgb3V0RmllbGRzOiByb3V0ZUZpZWxkLFxyXG4gICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMScsXHJcbiAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgIH0pXHJcbiAgICAgIGlmICghanNvbi5mZWF0dXJlcz8ubGVuZ3RoKSByZXR1cm5cclxuICAgICAgY29uc3QgcGF0aHMgPSBqc29uLmZlYXR1cmVzWzBdLmdlb21ldHJ5Py5wYXRoc1xyXG4gICAgICBpZiAoIXBhdGhzPy5sZW5ndGgpIHJldHVyblxyXG5cclxuICAgICAgY29uc3QgW0dyYXBoaWMsIFBvbHlsaW5lLCBTaW1wbGVMaW5lU3ltYm9sXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL0dyYXBoaWMnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvbHlsaW5lJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1NpbXBsZUxpbmVTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgICBdKVxyXG5cclxuICAgICAgY29uc3Qgcm91dGVHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9seWxpbmUoeyBwYXRocywgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkOiB2aWV3V2tpZCB9IH0pLFxyXG4gICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZUxpbmVTeW1ib2woeyBjb2xvcjogWzIyMCwgNjAsIDYwLCAxODBdLCB3aWR0aDogMywgc3R5bGU6ICdkYXNoJyB9KVxyXG4gICAgICB9KVxyXG4gICAgICByb3V0ZVByZXZpZXdHcmFwaGljUmVmLmN1cnJlbnQgPSByb3V0ZUdyYXBoaWNcclxuICAgICAgcHJldmlld0xheWVyLmFkZChyb3V0ZUdyYXBoaWMpXHJcblxyXG4gICAgICAvLyBab29tIHRvIHJvdXRlXHJcbiAgICAgIHRyeSB7IHZpZXcuZ29Ubyhyb3V0ZUdyYXBoaWMuZ2VvbWV0cnkuZXh0ZW50LmV4cGFuZCgxLjMpLCB7IGR1cmF0aW9uOiA4MDAgfSkgfSBjYXRjaCAoXykge31cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ3Nob3dSb3V0ZVByZXZpZXcgZmFpbGVkOicsIGVycilcclxuICAgIH1cclxuICB9LCBbY29uZmlnXSlcclxuICBzaG93Um91dGVQcmV2aWV3UmVmLmN1cnJlbnQgPSBzaG93Um91dGVQcmV2aWV3XHJcblxyXG4gIC8vIFNob3cgYSBtZWFzdXJlIHBvaW50IChncmVlbj1mcm9tLCByZWQ9dG8pIG9uIHRoZSBtYXBcclxuICBjb25zdCBzaG93TWVhc3VyZVBvaW50ID0gdXNlQ2FsbGJhY2soYXN5bmMgKHdoaWNoOiAnZnJvbScgfCAndG8nLCBtZWFzdXJlVmFsOiBzdHJpbmcpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG4gICAgY29uc3QgbSA9IHBhcnNlRmxvYXQobWVhc3VyZVZhbClcclxuICAgIGlmIChpc05hTihtKSkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgcmVmID0gd2hpY2ggPT09ICdmcm9tJyA/IGZyb21NZWFzdXJlR3JhcGhpY1JlZiA6IHRvTWVhc3VyZUdyYXBoaWNSZWZcclxuICAgIGlmIChyZWYuY3VycmVudCkge1xyXG4gICAgICBjb25zdCBsYXllciA9IHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnRcclxuICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVmLmN1cnJlbnQpKSByZWYuY3VycmVudC5mb3JFYWNoKChnOiBhbnkpID0+IGxheWVyLnJlbW92ZShnKSlcclxuICAgICAgICBlbHNlIGxheWVyLnJlbW92ZShyZWYuY3VycmVudClcclxuICAgICAgfVxyXG4gICAgICByZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IHZlcnRpY2VzLCBtSWR4IH0gPSByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50XHJcblxyXG4gICAgLy8gSW50ZXJwb2xhdGUgcG9pbnQgYXQgbWVhc3VyZVxyXG4gICAgbGV0IHB0OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsID0gbnVsbFxyXG4gICAgaWYgKG0gPD0gKHZlcnRpY2VzWzBdW21JZHhdIHx8IDApKSB7XHJcbiAgICAgIHB0ID0geyB4OiB2ZXJ0aWNlc1swXVswXSwgeTogdmVydGljZXNbMF1bMV0gfVxyXG4gICAgfSBlbHNlIGlmIChtID49ICh2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVttSWR4XSB8fCAwKSkge1xyXG4gICAgICBwdCA9IHsgeDogdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bMF0sIHk6IHZlcnRpY2VzW3ZlcnRpY2VzLmxlbmd0aCAtIDFdWzFdIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGlmIChtID49IG0xICYmIG0gPD0gbTIpIHtcclxuICAgICAgICAgIGNvbnN0IGZyYWMgPSBtMiAhPT0gbTEgPyAobSAtIG0xKSAvIChtMiAtIG0xKSA6IDBcclxuICAgICAgICAgIHB0ID0geyB4OiB2ZXJ0aWNlc1tpXVswXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzBdIC0gdmVydGljZXNbaV1bMF0pLCB5OiB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pIH1cclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIXB0KSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBbR3JhcGhpYywgUG9pbnQsIFNpbXBsZU1hcmtlclN5bWJvbCwgVGV4dFN5bWJvbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvaW50JykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1RleHRTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgXSlcclxuXHJcbiAgICBjb25zdCBjb2xvciA9IHdoaWNoID09PSAnZnJvbScgPyBbMzQsIDEzOSwgMzQsIDI1NV0gOiBbMTgwLCAwLCAwLCAyNTVdXHJcbiAgICBjb25zdCBsYWJlbCA9IHdoaWNoID09PSAnZnJvbScgPyBgRnJvbTogJHttLnRvRml4ZWQoMyl9YCA6IGBUbzogJHttLnRvRml4ZWQoMyl9YFxyXG5cclxuICAgIGNvbnN0IHBvaW50R3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHB0LngsIHk6IHB0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3IsIHNpemU6IDEyLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgIH0pXHJcbiAgICBjb25zdCBsYWJlbEdyYXBoaWMgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBwdC54LCB5OiBwdC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgIHN5bWJvbDogbmV3IFRleHRTeW1ib2woeyB0ZXh0OiBsYWJlbCwgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgaGFsb0NvbG9yOiBbMCwgMCwgMF0sIGhhbG9TaXplOiAxLjUsIGZvbnQ6IHsgc2l6ZTogMTEsIHdlaWdodDogJ2JvbGQnIH0sIHlvZmZzZXQ6IDE0IH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHJlZi5jdXJyZW50ID0gW3BvaW50R3JhcGhpYywgbGFiZWxHcmFwaGljXVxyXG4gICAgY29uc3QgbGF5ZXIgPSByb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50XHJcbiAgICBpZiAobGF5ZXIpIHsgbGF5ZXIuYWRkKHBvaW50R3JhcGhpYyk7IGxheWVyLmFkZChsYWJlbEdyYXBoaWMpIH1cclxuICAgIGVsc2UgeyB2aWV3LmdyYXBoaWNzLmFkZChwb2ludEdyYXBoaWMpOyB2aWV3LmdyYXBoaWNzLmFkZChsYWJlbEdyYXBoaWMpIH1cclxuICB9LCBbXSlcclxuICBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQgPSBzaG93TWVhc3VyZVBvaW50XHJcblxyXG4gIC8vIFBpY2sgZnJvbS90byBtZWFzdXJlIG9uIG1hcCAoc25hcCB0byByb3V0ZSBnZW9tZXRyeSlcclxuICBjb25zdCBzdGFydFBpY2tNZWFzdXJlID0gdXNlQ2FsbGJhY2soKHdoaWNoOiAnZnJvbScgfCAndG8nKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBpZiAoIXJvdXRlSWQudHJpbSgpKSB7IHNldEVycm9yKCdTZWxlY3QgYSByb3V0ZSBmaXJzdCcpOyByZXR1cm4gfVxyXG4gICAgaWYgKCFyb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50KSB7IHNldEVycm9yKCdSb3V0ZSBnZW9tZXRyeSBub3QgbG9hZGVkJyk7IHJldHVybiB9XHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG5cclxuICAgIGlmIChtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudCkgeyBtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICBzZXRQaWNraW5nTWVhc3VyZSh3aGljaClcclxuICAgIHZpZXcuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXHJcblxyXG4gICAgY29uc3QgbW9kdWxlc1Byb21pc2UgPSBQcm9taXNlLmFsbChbXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL3N5bWJvbHMvU2ltcGxlTWFya2VyU3ltYm9sJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvZ2VvbWV0cnkvUG9pbnQnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgXSlcclxuXHJcbiAgICBpZiAoIW1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgdGlwLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7cG9pbnRlci1ldmVudHM6bm9uZTtiYWNrZ3JvdW5kOiMzMzM7Y29sb3I6I2ZmZjtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3otaW5kZXg6OTk5OTk7ZGlzcGxheTpub25lO2JveC1zaGFkb3c6MCAycHggNnB4IHJnYmEoMCwwLDAsMC4zKTsnXHJcbiAgICAgIHZpZXcuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpcClcclxuICAgICAgbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCA9IHRpcFxyXG4gICAgfVxyXG4gICAgY29uc3QgdG9vbHRpcCA9IG1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQhXHJcbiAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbiAgICBjb25zdCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9ID0gcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCFcclxuXHJcbiAgICBmdW5jdGlvbiBuZWFyZXN0TU9uUm91dGUgKHB4OiBudW1iZXIsIHB5OiBudW1iZXIpOiB7IG06IG51bWJlcjsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xyXG4gICAgICBsZXQgYmVzdERpc3QgPSBJbmZpbml0eSwgYmVzdFggPSBweCwgYmVzdFkgPSBweSwgYmVzdE0gPSAwXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsVmVydHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgW2F4LCBheV0gPSBhbGxWZXJ0c1tpXVxyXG4gICAgICAgIGNvbnN0IFtieCwgYnldID0gYWxsVmVydHNbaSArIDFdXHJcbiAgICAgICAgY29uc3QgbUEgPSBhbGxWZXJ0c1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbUIgPSBhbGxWZXJ0c1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5XHJcbiAgICAgICAgY29uc3QgbGVuU3EgPSBkeCAqIGR4ICsgZHkgKiBkeVxyXG4gICAgICAgIGlmIChsZW5TcSA9PT0gMCkgY29udGludWVcclxuICAgICAgICBsZXQgdCA9ICgocHggLSBheCkgKiBkeCArIChweSAtIGF5KSAqIGR5KSAvIGxlblNxXHJcbiAgICAgICAgdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHQpKVxyXG4gICAgICAgIGNvbnN0IGN4ID0gYXggKyB0ICogZHgsIGN5ID0gYXkgKyB0ICogZHlcclxuICAgICAgICBjb25zdCBkID0gKHB4IC0gY3gpICogKHB4IC0gY3gpICsgKHB5IC0gY3kpICogKHB5IC0gY3kpXHJcbiAgICAgICAgaWYgKGQgPCBiZXN0RGlzdCkgeyBiZXN0RGlzdCA9IGQ7IGJlc3RYID0gY3g7IGJlc3RZID0gY3k7IGJlc3RNID0gbUEgKyB0ICogKG1CIC0gbUEpIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmVzdERpc3QgPCBJbmZpbml0eSA/IHsgbTogYmVzdE0sIHg6IGJlc3RYLCB5OiBiZXN0WSB9IDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBvaW50ZXItbW92ZTogc25hcCBhbmQgc2hvdyBNIHZhbHVlXHJcbiAgICBtb2R1bGVzUHJvbWlzZS50aGVuKChbR3JhcGhpYywgU2ltcGxlTWFya2VyU3ltYm9sLCBQb2ludF0pID0+IHtcclxuICAgICAgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50ID0gdmlldy5vbigncG9pbnRlci1tb3ZlJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICBjb25zdCBtYXBQb2ludCA9IHZpZXcudG9NYXAoeyB4OiBldmVudC54LCB5OiBldmVudC55IH0pXHJcbiAgICAgICAgaWYgKCFtYXBQb2ludCkgcmV0dXJuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmVhcmVzdE1PblJvdXRlKG1hcFBvaW50LngsIG1hcFBvaW50LnkpXHJcbiAgICAgICAgaWYgKCFyZXN1bHQpIHJldHVyblxyXG5cclxuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHtldmVudC54ICsgMTR9cHhgXHJcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSBgJHtldmVudC55IC0gNDB9cHhgXHJcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGBNOiAke3Jlc3VsdC5tLnRvRml4ZWQoMyl9YFxyXG4gICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgaWYgKG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgICBtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHJlc3VsdC54LCB5OiByZXN1bHQueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGcgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiByZXN1bHQueCwgeTogcmVzdWx0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3I6IFsyNTUsIDg3LCAzNCwgMjU1XSwgc2l6ZTogMTAsIG91dGxpbmU6IHsgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgd2lkdGg6IDIgfSB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gZ1xyXG4gICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoZylcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBDbGljazogc2V0IHRoZSBtZWFzdXJlIHZhbHVlXHJcbiAgICAgIG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gdmlldy5vbignY2xpY2snLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1hcFBvaW50ID0gdmlldy50b01hcCh7IHg6IGV2ZW50LngsIHk6IGV2ZW50LnkgfSlcclxuICAgICAgICBpZiAoIW1hcFBvaW50KSByZXR1cm5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZWFyZXN0TU9uUm91dGUobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICBjb25zdCBtVmFsID0gcmVzdWx0Lm0udG9GaXhlZCgzKVxyXG4gICAgICAgICAgaWYgKHdoaWNoID09PSAnZnJvbScpIHtcclxuICAgICAgICAgICAgc2V0RnJvbU1lYXN1cmUobVZhbClcclxuICAgICAgICAgICAgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCdmcm9tJywgbVZhbClcclxuICAgICAgICAgICAgY2FuY2VsUGlja01lYXN1cmUoKVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHN0YXJ0UGlja01lYXN1cmUoJ3RvJyksIDUwKVxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRvTWVhc3VyZShtVmFsKVxyXG4gICAgICAgICAgICBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgbVZhbClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2FuY2VsUGlja01lYXN1cmUoKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9LCBbY29uZmlnLCByb3V0ZUlkXSlcclxuXHJcbiAgY29uc3QgY2FuY2VsUGlja01lYXN1cmUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAobWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAobWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50KSB7IG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAobWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCkgbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBpZiAobWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQgJiYgamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldykge1xyXG4gICAgICAoamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueSkuZ3JhcGhpY3MucmVtb3ZlKG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50KVxyXG4gICAgICBtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuICAgIGlmIChqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3KSB7XHJcbiAgICAgIChqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55KS5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJydcclxuICAgIH1cclxuICAgIHNldFBpY2tpbmdNZWFzdXJlKG51bGwpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIENsZWFyIGFsbCByb3V0ZSBwcmV2aWV3IGdyYXBoaWNzXHJcbiAgY29uc3QgY2xlYXJSb3V0ZVByZXZpZXcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAocm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudCkgcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG4gICAgcm91dGVQcmV2aWV3R3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyBQaWNrIHJvdXRlIGZyb20gbWFwICh3aXRoIGhvdmVyIHRvb2x0aXAgKyBzbmFwIGdyYXBoaWMgbGlrZSByb2FkLWxvZylcclxuICBjb25zdCBzdGFydFBpY2tGcm9tTWFwID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICBpZiAocGlja0hhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAocGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcblxyXG4gICAgc2V0UGlja2luZ0Zyb21NYXAodHJ1ZSlcclxuICAgIHZpZXcuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXHJcblxyXG4gICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgcXVlcnlVcmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcbiAgICBjb25zdCBvdXRGaWVsZHMgPSBgJHtyb3V0ZUZpZWxkfSwke25hbWVGaWVsZH1gXHJcbiAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuXHJcbiAgICAvLyBDcmVhdGUgdG9vbHRpcFxyXG4gICAgaWYgKCFwaWNrVG9vbHRpcFJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIHRpcC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlO3BvaW50ZXItZXZlbnRzOm5vbmU7YmFja2dyb3VuZDojMzMzO2NvbG9yOiNmZmY7cGFkZGluZzo0cHggOHB4O2JvcmRlci1yYWRpdXM6NHB4O2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt6LWluZGV4Ojk5OTk5O2Rpc3BsYXk6bm9uZTtib3gtc2hhZG93OjAgMnB4IDZweCByZ2JhKDAsMCwwLDAuMyk7J1xyXG4gICAgICB2aWV3LmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXApXHJcbiAgICAgIHBpY2tUb29sdGlwUmVmLmN1cnJlbnQgPSB0aXBcclxuICAgIH1cclxuICAgIGNvbnN0IHRvb2x0aXAgPSBwaWNrVG9vbHRpcFJlZi5jdXJyZW50IVxyXG4gICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG4gICAgbGV0IGxhc3RRdWVyeUlkID0gMFxyXG4gICAgbGV0IGNhY2hlZFBhdGhzOiBudW1iZXJbXVtdW11bXSA9IFtdXHJcbiAgICBsZXQgY2FjaGVkTGFiZWxzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICBsZXQgbGFzdFF1ZXJ5UHQ6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwgPSBudWxsXHJcbiAgICBjb25zdCBSRVFVRVJZX0RJU1QgPSA4MFxyXG5cclxuICAgIC8vIExvYWQgQXJjR0lTIG1vZHVsZXMgZm9yIHNuYXAgZ3JhcGhpY1xyXG4gICAgY29uc3QgbW9kdWxlc1Byb21pc2UgPSBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9HcmFwaGljJywgJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnLCAnZXNyaS9nZW9tZXRyeS9Qb2ludCddLCAoLi4ubTogYW55W10pID0+IHJlc29sdmUobSkpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIEhlbHBlcjogc25hcCB0byBuZWFyZXN0IHBvaW50IG9uIGNhY2hlZCBwYXRoc1xyXG4gICAgZnVuY3Rpb24gc25hcFRvTmVhcmVzdCAocHg6IG51bWJlciwgcHk6IG51bWJlcik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xyXG4gICAgICBsZXQgYmVzdERpc3QgPSBJbmZpbml0eSwgYmVzdFggPSBweCwgYmVzdFkgPSBweVxyXG4gICAgICBmb3IgKGNvbnN0IHBhdGhzIG9mIGNhY2hlZFBhdGhzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtheCwgYXldID0gcGF0aFtpXVxyXG4gICAgICAgICAgICBjb25zdCBbYngsIGJ5XSA9IHBhdGhbaSArIDFdXHJcbiAgICAgICAgICAgIGNvbnN0IGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5XHJcbiAgICAgICAgICAgIGNvbnN0IGxlblNxID0gZHggKiBkeCArIGR5ICogZHlcclxuICAgICAgICAgICAgaWYgKGxlblNxID09PSAwKSBjb250aW51ZVxyXG4gICAgICAgICAgICBsZXQgdCA9ICgocHggLSBheCkgKiBkeCArIChweSAtIGF5KSAqIGR5KSAvIGxlblNxXHJcbiAgICAgICAgICAgIHQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB0KSlcclxuICAgICAgICAgICAgY29uc3QgY3ggPSBheCArIHQgKiBkeCwgY3kgPSBheSArIHQgKiBkeVxyXG4gICAgICAgICAgICBjb25zdCBkID0gKHB4IC0gY3gpICogKHB4IC0gY3gpICsgKHB5IC0gY3kpICogKHB5IC0gY3kpXHJcbiAgICAgICAgICAgIGlmIChkIDwgYmVzdERpc3QpIHsgYmVzdERpc3QgPSBkOyBiZXN0WCA9IGN4OyBiZXN0WSA9IGN5IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGJlc3REaXN0IDwgSW5maW5pdHkgPyB7IHg6IGJlc3RYLCB5OiBiZXN0WSB9IDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhvdmVyOiBzaG93IHJvdXRlIG5hbWUgdG9vbHRpcCArIHNuYXAgZ3JhcGhpY1xyXG4gICAgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gdmlldy5vbigncG9pbnRlci1tb3ZlJywgYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7ZXZlbnQueCArIDE0fXB4YFxyXG4gICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IGAke2V2ZW50LnkgLSA0MH1weGBcclxuXHJcbiAgICAgIGNvbnN0IG1hcFBvaW50ID0gdmlldy50b01hcCh7IHg6IGV2ZW50LngsIHk6IGV2ZW50LnkgfSlcclxuICAgICAgaWYgKCFtYXBQb2ludCkgcmV0dXJuXHJcblxyXG4gICAgICAvLyBTbmFwIHVzaW5nIGNhY2hlZCBnZW9tZXRyeVxyXG4gICAgICBpZiAoY2FjaGVkUGF0aHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHNuYXAgPSBzbmFwVG9OZWFyZXN0KG1hcFBvaW50LngsIG1hcFBvaW50LnkpXHJcbiAgICAgICAgaWYgKHNuYXApIHtcclxuICAgICAgICAgIGNvbnN0IFtHcmFwaGljLCBTaW1wbGVNYXJrZXJTeW1ib2wsIFBvaW50XSA9IGF3YWl0IG1vZHVsZXNQcm9taXNlXHJcbiAgICAgICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQuZ2VvbWV0cnkgPSBuZXcgUG9pbnQoeyB4OiBzbmFwLngsIHk6IHNuYXAueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzbmFwR3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgICBzeW1ib2w6IG5ldyBTaW1wbGVNYXJrZXJTeW1ib2woeyBjb2xvcjogWzAsIDEyMiwgMjU1LCAyNTVdLCBzaXplOiAxMCwgb3V0bGluZTogeyBjb2xvcjogWzI1NSwgMjU1LCAyNTVdLCB3aWR0aDogMiB9IH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gc25hcEdyYXBoaWNcclxuICAgICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoc25hcEdyYXBoaWMpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBjdXJzb3IgbW92ZWQgZmFyIGVub3VnaCB0byByZS1xdWVyeVxyXG4gICAgICBpZiAobGFzdFF1ZXJ5UHQpIHtcclxuICAgICAgICBjb25zdCBkeCA9IG1hcFBvaW50LnggLSBsYXN0UXVlcnlQdC54XHJcbiAgICAgICAgY29uc3QgZHkgPSBtYXBQb2ludC55IC0gbGFzdFF1ZXJ5UHQueVxyXG4gICAgICAgIGlmIChNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpIDwgUkVRVUVSWV9ESVNUKSByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudClcclxuICAgICAgcGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcXVlcnlJZCA9ICsrbGFzdFF1ZXJ5SWRcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgICBnZW9tZXRyeTogSlNPTi5zdHJpbmdpZnkobWFwUG9pbnQudG9KU09OKCkpLFxyXG4gICAgICAgICAgICBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2ludCcsXHJcbiAgICAgICAgICAgIHNwYXRpYWxSZWw6ICdlc3JpU3BhdGlhbFJlbEludGVyc2VjdHMnLFxyXG4gICAgICAgICAgICBkaXN0YW5jZTogJzUwJyxcclxuICAgICAgICAgICAgdW5pdHM6ICdlc3JpU1JVbml0X01ldGVyJyxcclxuICAgICAgICAgICAgb3V0RmllbGRzLFxyXG4gICAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICc1JyxcclxuICAgICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHF1ZXJ5VXJsLCBwYXJhbXMpXHJcbiAgICAgICAgICBpZiAocXVlcnlJZCAhPT0gbGFzdFF1ZXJ5SWQpIHJldHVyblxyXG4gICAgICAgICAgbGFzdFF1ZXJ5UHQgPSB7IHg6IG1hcFBvaW50LngsIHk6IG1hcFBvaW50LnkgfVxyXG5cclxuICAgICAgICAgIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNhY2hlZFBhdGhzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4gZi5nZW9tZXRyeT8ucGF0aHMgfHwgW10pXHJcbiAgICAgICAgICAgIGNhY2hlZExhYmVscyA9IGpzb24uZmVhdHVyZXMubWFwKChmOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCByaWQgPSBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF0gfHwgJydcclxuICAgICAgICAgICAgICBjb25zdCBybmFtZSA9IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJuYW1lID8gYCR7cm5hbWV9ICgke3JpZH0pYCA6IHJpZFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gY2FjaGVkTGFiZWxzLmpvaW4oJ1xcbicpXHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUud2hpdGVTcGFjZSA9IGNhY2hlZExhYmVscy5sZW5ndGggPiAxID8gJ3ByZS1saW5lJyA6ICdub3dyYXAnXHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBzbmFwIHdpdGggZnJlc2ggZ2VvbWV0cnlcclxuICAgICAgICAgICAgY29uc3Qgc25hcCA9IHNuYXBUb05lYXJlc3QobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICAgICAgaWYgKHNuYXApIHtcclxuICAgICAgICAgICAgICBjb25zdCBbR3JhcGhpYywgU2ltcGxlTWFya2VyU3ltYm9sLCBQb2ludF0gPSBhd2FpdCBtb2R1bGVzUHJvbWlzZVxyXG4gICAgICAgICAgICAgIGlmIChxdWVyeUlkICE9PSBsYXN0UXVlcnlJZCkgcmV0dXJuXHJcbiAgICAgICAgICAgICAgaWYgKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSlcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgICAgICAgICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yOiBbMCwgMTIyLCAyNTUsIDI1NV0sIHNpemU6IDEwLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IGdcclxuICAgICAgICAgICAgICAgIHZpZXcuZ3JhcGhpY3MuYWRkKGcpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgY2FjaGVkUGF0aHMgPSBbXVxyXG4gICAgICAgICAgICBjYWNoZWRMYWJlbHMgPSBbXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgfVxyXG4gICAgICB9LCAxMDApXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIENsaWNrOiBzZWxlY3Qgcm91dGVcclxuICAgIHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdjbGljaycsIGFzeW5jIChldmVudDogYW55KSA9PiB7XHJcbiAgICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgICAgaWYgKHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgICBpZiAocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KVxyXG4gICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgdmlldy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJydcclxuICAgICAgc2V0UGlja2luZ0Zyb21NYXAoZmFsc2UpXHJcbiAgICAgIC8vIFJlbW92ZSBzbmFwIGdyYXBoaWNcclxuICAgICAgaWYgKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7IHZpZXcuZ3JhcGhpY3MucmVtb3ZlKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KTsgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgZ2VvbWV0cnk6IEpTT04uc3RyaW5naWZ5KGV2ZW50Lm1hcFBvaW50LnRvSlNPTigpKSxcclxuICAgICAgICAgIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvaW50JyxcclxuICAgICAgICAgIHNwYXRpYWxSZWw6ICdlc3JpU3BhdGlhbFJlbEludGVyc2VjdHMnLFxyXG4gICAgICAgICAgZGlzdGFuY2U6ICc1MCcsXHJcbiAgICAgICAgICB1bml0czogJ2VzcmlTUlVuaXRfTWV0ZXInLFxyXG4gICAgICAgICAgb3V0RmllbGRzLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHF1ZXJ5VXJsLCBwYXJhbXMpXHJcblxyXG4gICAgICAgIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnLFxyXG4gICAgICAgICAgICByb3V0ZU5hbWU6IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcclxuICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IGNhbmRpZGF0ZXMuZmlsdGVyKChjOiBhbnkpID0+IHsgaWYgKHNlZW4uaGFzKGMucm91dGVJZCkpIHJldHVybiBmYWxzZTsgc2Vlbi5hZGQoYy5yb3V0ZUlkKTsgcmV0dXJuIHRydWUgfSlcclxuICAgICAgICAgIGlmICh1bmlxdWUubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzZXRSb3V0ZVBpY2tDYW5kaWRhdGVzKHVuaXF1ZSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFJvdXRlSWQodW5pcXVlWzBdLnJvdXRlSWQpXHJcbiAgICAgICAgICAgIHNldFJvdXRlTmFtZSh1bmlxdWVbMF0ucm91dGVOYW1lKVxyXG4gICAgICAgICAgICBmZXRjaFJvdXRlTWVhc3VyZXModW5pcXVlWzBdLnJvdXRlSWQpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGF0dHJzID0ganNvbi5mZWF0dXJlc1swXS5hdHRyaWJ1dGVzXHJcbiAgICAgICAgICBjb25zdCByaWQgPSBhdHRyc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgY29uc3Qgcm5hbWUgPSBhdHRyc1tuYW1lRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICBzZXRSb3V0ZUlkKHJpZClcclxuICAgICAgICAgIHNldFJvdXRlTmFtZShybmFtZSB8fCByaWQpXHJcbiAgICAgICAgICBmZXRjaFJvdXRlTWVhc3VyZXMocmlkKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZXRFcnJvcignTm8gcm91dGUgZm91bmQgYXQgdGhhdCBsb2NhdGlvbicpXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gaWRlbnRpZnkgcm91dGU6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9LCBbY29uZmlnLCBmZXRjaFJvdXRlTWVhc3VyZXNdKVxyXG5cclxuICBjb25zdCBjYW5jZWxQaWNrRnJvbU1hcCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICBpZiAocGlja1Rvb2x0aXBSZWYuY3VycmVudCkgcGlja1Rvb2x0aXBSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBpZiAoamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldykge1xyXG4gICAgICBjb25zdCB2ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG4gICAgICB2LmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJ1xyXG4gICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHsgdi5ncmFwaGljcy5yZW1vdmUocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpOyBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgfVxyXG4gICAgc2V0UGlja2luZ0Zyb21NYXAoZmFsc2UpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIERyYXcgcG9seWdvbiB0byBzZWxlY3QgbXVsdGlwbGUgcm91dGVzXHJcbiAgY29uc3Qgc3RhcnREcmF3QXJlYSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSByZXR1cm5cclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcblxyXG4gICAgc2V0RHJhd2luZyh0cnVlKVxyXG4gICAgc2V0TWFwUm91dGVzKFtdKVxyXG4gICAgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkcyhuZXcgU2V0KCkpXHJcblxyXG4gICAgY29uc3QgW0dyYXBoaWNzTGF5ZXIsIFNrZXRjaFZpZXdNb2RlbF0gPSBhd2FpdCBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9sYXllcnMvR3JhcGhpY3NMYXllcicsICdlc3JpL3dpZGdldHMvU2tldGNoL1NrZXRjaFZpZXdNb2RlbCddLCAoLi4ubTogYW55W10pID0+IHJlc29sdmUobSkpXHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCA9IG5ldyBHcmFwaGljc0xheWVyKHsgdGl0bGU6ICdDcmFzaFJpc2sgRHJhdycgfSlcclxuICAgICAgdmlldy5tYXAuYWRkKGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudClcclxuICAgIH1cclxuICAgIGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG5cclxuICAgIGlmICghc2tldGNoVk1SZWYuY3VycmVudCkge1xyXG4gICAgICBza2V0Y2hWTVJlZi5jdXJyZW50ID0gbmV3IFNrZXRjaFZpZXdNb2RlbCh7IHZpZXcsIGxheWVyOiBncmFwaGljc0xheWVyUmVmLmN1cnJlbnQgfSlcclxuICAgIH1cclxuXHJcbiAgICBza2V0Y2hWTVJlZi5jdXJyZW50LmNyZWF0ZSgncG9seWdvbicpXHJcbiAgICBza2V0Y2hWTVJlZi5jdXJyZW50Lm9uKCdjcmVhdGUnLCBhc3luYyAoZXZ0OiBhbnkpID0+IHtcclxuICAgICAgaWYgKGV2dC5zdGF0ZSAhPT0gJ2NvbXBsZXRlJykgcmV0dXJuXHJcbiAgICAgIHNldERyYXdpbmcoZmFsc2UpXHJcblxyXG4gICAgICBjb25zdCBwb2x5Z29uID0gZXZ0LmdyYXBoaWMuZ2VvbWV0cnlcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgICAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgICAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgICAgIC8vIFVzZSBlbnZlbG9wZSBnZW9tZXRyeSBmb3IgSlNPTlAgKHBvbHlnb24gSlNPTiBpcyB0b28gbGFyZ2UgZm9yIEdFVClcclxuICAgICAgICBjb25zdCBleHQgPSBwb2x5Z29uLmV4dGVudFxyXG4gICAgICAgIGNvbnN0IGVudmVsb3BlSnNvbiA9IHsgeG1pbjogZXh0LnhtaW4sIHltaW46IGV4dC55bWluLCB4bWF4OiBleHQueG1heCwgeW1heDogZXh0LnltYXgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZDogdmlld1draWQgfSB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIGdlb21ldHJ5OiBKU09OLnN0cmluZ2lmeShlbnZlbG9wZUpzb24pLFxyXG4gICAgICAgICAgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5RW52ZWxvcGUnLFxyXG4gICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICBvdXRGaWVsZHM6IGAke3JvdXRlRmllbGR9LCR7bmFtZUZpZWxkfWAsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgICAgb3V0U1I6IFN0cmluZyh2aWV3V2tpZCksXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzIwMCcsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgICAgY29uc3Qgcm91dGVzID0gKGRhdGEuZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByaWQgPSBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF1cclxuICAgICAgICAgIGNvbnN0IHBhdGhzID0gZi5nZW9tZXRyeT8ucGF0aHMgfHwgW11cclxuICAgICAgICAgIGNvbnN0IGFsbFZlcnRzOiBudW1iZXJbXVtdID0gcGF0aHMuZmxhdCgpXHJcbiAgICAgICAgICBjb25zdCBoYXNaID0gZi5nZW9tZXRyeT8uaGFzWlxyXG4gICAgICAgICAgY29uc3QgbUlkeCA9IGhhc1ogPyAzIDogMlxyXG4gICAgICAgICAgbGV0IG1pbk0gPSAwLCBtYXhNID0gMFxyXG4gICAgICAgICAgaWYgKGFsbFZlcnRzLmxlbmd0aCA+IDAgJiYgbUlkeCA8IGFsbFZlcnRzWzBdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBtZWFzdXJlcyA9IGFsbFZlcnRzLm1hcCh2ID0+IHZbbUlkeF0pLmZpbHRlcihtID0+IG0gIT0gbnVsbCAmJiAhaXNOYU4obSkpXHJcbiAgICAgICAgICAgIGlmIChtZWFzdXJlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgbWluTSA9IE1hdGgubWluKC4uLm1lYXN1cmVzKVxyXG4gICAgICAgICAgICAgIG1heE0gPSBNYXRoLm1heCguLi5tZWFzdXJlcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5zZXQocmlkLCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHsgcm91dGVJZDogcmlkLCByb3V0ZU5hbWU6IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8IG51bGwsIGZyb21NZWFzdXJlOiBtaW5NLCB0b01lYXN1cmU6IG1heE0gfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgc2V0TWFwUm91dGVzKHJvdXRlcylcclxuICAgICAgICBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQocm91dGVzLm1hcCgocjogYW55KSA9PiByLnJvdXRlSWQpKSlcclxuICAgICAgICBzZXRTZWFyY2hNb2RlKCdtYXAnKVxyXG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgICAgICBzZXRFcnJvcignQXJlYSBxdWVyeSBmYWlsZWQ6ICcgKyAoZS5tZXNzYWdlIHx8IGUpKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0sIFtjb25maWddKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBRVUVSWSBFVkVOVCBEQVRBIChpbnRlcm5hbCwgdHJpZ2dlcmVkIGJ5IFJ1bikgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgcXVlcnlFdmVudERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKTogUHJvbWlzZTxhbnlbXT4gPT4ge1xyXG4gICAgaWYgKCFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHRocm93IG5ldyBFcnJvcignTm8gTFJTIHNlcnZpY2UgY29uZmlndXJlZCcpXHJcblxyXG4gICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcblxyXG4gICAgbGV0IHJvdXRlSWRzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICBpZiAoc2VhcmNoTW9kZSA9PT0gJ21hcCcpIHtcclxuICAgICAgcm91dGVJZHMgPSBBcnJheS5mcm9tKHNlbGVjdGVkTWFwUm91dGVJZHMpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXJvdXRlSWQudHJpbSgpKSB0aHJvdyBuZXcgRXJyb3IoJ0VudGVyIGEgUm91dGUgSUQgb3Igc2VsZWN0IGZyb20gbWFwLicpXHJcbiAgICAgIHJvdXRlSWRzID0gW3JvdXRlSWQudHJpbSgpXVxyXG4gICAgfVxyXG4gICAgaWYgKHJvdXRlSWRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyByb3V0ZXMgc2VsZWN0ZWQuJylcclxuXHJcbiAgICBjb25zdCBhbGxFbnRyaWVzOiBhbnlbXSA9IFtdXHJcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBldmVudENvbmZpZ3MpIHtcclxuICAgICAgY29uc3QgbGF5ZXJVcmwgPSBgJHtjb25maWcubHJzU2VydmljZVVybH0vZXZlbnRMYXllcnMvJHtjZmcubGF5ZXJJZH0vcXVlcnlgXHJcbiAgICAgIGZvciAoY29uc3QgcmlkIG9mIHJvdXRlSWRzKSB7XHJcbiAgICAgICAgY29uc3Qgd2hlcmUgPSBgJHtjZmcucm91dGVJZEZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2BcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICB3aGVyZSxcclxuICAgICAgICAgIG91dEZpZWxkczogJyonLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzUwMDAnLFxyXG4gICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QobGF5ZXJVcmwsIHBhcmFtcylcclxuICAgICAgICBmb3IgKGNvbnN0IGYgb2YgKGRhdGEuZmVhdHVyZXMgfHwgW10pKSB7XHJcbiAgICAgICAgICBjb25zdCBtZWFzdXJlRmllbGQgPSBjZmcubWVhc3VyZUZpZWxkIHx8IGNmZy5mcm9tTWVhc3VyZUZpZWxkIHx8ICdNZWFzdXJlJ1xyXG4gICAgICAgICAgYWxsRW50cmllcy5wdXNoKHtcclxuICAgICAgICAgICAgRmVhdHVyZTogY2ZnLm5hbWUsXHJcbiAgICAgICAgICAgIFJvdXRlSUQ6IGYuYXR0cmlidXRlc1tjZmcucm91dGVJZEZpZWxkXSxcclxuICAgICAgICAgICAgTWVhc3VyZTogZi5hdHRyaWJ1dGVzW21lYXN1cmVGaWVsZF0gPz8gZi5hdHRyaWJ1dGVzW2NmZy5mcm9tTWVhc3VyZUZpZWxkXSxcclxuICAgICAgICAgICAgLi4uT2JqZWN0LmZyb21FbnRyaWVzKChjZmcuYXR0cmlidXRlcyB8fCBbXSkubWFwKGEgPT4gW2EsIGYuYXR0cmlidXRlc1thXV0pKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBFbnN1cmUgcm91dGUgZ2VvbWV0cmllcyBhcmUgY2FjaGVkXHJcbiAgICBmb3IgKGNvbnN0IHJpZCBvZiByb3V0ZUlkcykge1xyXG4gICAgICBpZiAoIXJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LmhhcyhyaWQpKSB7XHJcbiAgICAgICAgYXdhaXQgZmV0Y2hSb3V0ZU1lYXN1cmVzKHJpZClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhbGxFbnRyaWVzXHJcbiAgfSwgW2NvbmZpZywgcm91dGVJZCwgc2VhcmNoTW9kZSwgc2VsZWN0ZWRNYXBSb3V0ZUlkcywgZmV0Y2hSb3V0ZU1lYXN1cmVzXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gRElTUExBWSBPTiBNQVAgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgZGlzcGxheVByZWRpY3Rpb25Pbk1hcCA9IHVzZUNhbGxiYWNrKGFzeW5jIChsYXllclVybDogc3RyaW5nLCB0b2tlbjogc3RyaW5nLCB3a2lkOiBudW1iZXIpID0+IHtcclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IGFzIGFueVxyXG4gICAgaWYgKCF2aWV3KSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBbRmVhdHVyZUxheWVyXSA9IGF3YWl0IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL2xheWVycy9GZWF0dXJlTGF5ZXInXSwgKC4uLm1vZHM6IGFueVtdKSA9PiByZXNvbHZlKG1vZHMpKVxyXG4gICAgfSlcclxuXHJcbiAgICBjb25zdCBleGlzdGluZ0xheWVyID0gdmlldy5tYXAuYWxsTGF5ZXJzLmZpbmQoKGw6IGFueSkgPT4gbC50aXRsZSA9PT0gJ0NyYXNoIFJpc2sgUHJlZGljdGlvbicpXHJcbiAgICBpZiAoZXhpc3RpbmdMYXllcikgdmlldy5tYXAucmVtb3ZlKGV4aXN0aW5nTGF5ZXIpXHJcblxyXG4gICAgY29uc3QgcHJlZGljdGlvbkxheWVyID0gbmV3IEZlYXR1cmVMYXllcih7XHJcbiAgICAgIHVybDogbGF5ZXJVcmwsXHJcbiAgICAgIHRpdGxlOiAnQ3Jhc2ggUmlzayBQcmVkaWN0aW9uJyxcclxuICAgICAgY3VzdG9tUGFyYW1ldGVyczogeyB0b2tlbiB9LFxyXG4gICAgICBkZWZpbml0aW9uRXhwcmVzc2lvbjogJ3Jpc2tfc2NvcmUgPiAwJyxcclxuICAgICAgcmVuZGVyZXI6IHtcclxuICAgICAgICB0eXBlOiAnY2xhc3MtYnJlYWtzJyxcclxuICAgICAgICBmaWVsZDogJ3Jpc2tfc2NvcmUnLFxyXG4gICAgICAgIGNsYXNzQnJlYWtJbmZvczogW1xyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogMSwgbWF4VmFsdWU6IDI1LCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFs1NiwgMTY4LCAwLCAyMDBdLCB3aWR0aDogMyB9LCBsYWJlbDogJ0xvdyBSaXNrICgxLTI1KScgfSxcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDI2LCBtYXhWYWx1ZTogNTAsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzI1NSwgMjU1LCAwLCAyMjBdLCB3aWR0aDogNCB9LCBsYWJlbDogJ01lZGl1bSBSaXNrICgyNi01MCknIH0sXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiA1MSwgbWF4VmFsdWU6IDc1LCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFsyNTUsIDEyOCwgMCwgMjMwXSwgd2lkdGg6IDUgfSwgbGFiZWw6ICdNZWRpdW0tSGlnaCBSaXNrICg1MS03NSknIH0sXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiA3NiwgbWF4VmFsdWU6IDEwMCwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbMjU1LCAwLCAwLCAyNTVdLCB3aWR0aDogNiB9LCBsYWJlbDogJ0hpZ2ggUmlzayAoNzYtMTAwKScgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgcG9wdXBUZW1wbGF0ZToge1xyXG4gICAgICAgIHRpdGxlOiAnQ3Jhc2ggUmlzazoge3Jpc2tfbGV2ZWx9JyxcclxuICAgICAgICBjb250ZW50OiBgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxM3B4XCI+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTo4cHg7cGFkZGluZy1ib3R0b206OHB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNlMGUwZTBcIj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MjRweDtmb250LXdlaWdodDo3MDA7Y29sb3I6e2V4cHJlc3Npb24vcmlza0NvbG9yfVwiPntyaXNrX3Njb3JlfTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJjb2xvcjojNjY2O2ZvbnQtc2l6ZToxMnB4XCI+LzEwMCByaXNrIHNjb3JlPC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8dGFibGUgc3R5bGU9XCJib3JkZXItY29sbGFwc2U6Y29sbGFwc2U7d2lkdGg6MTAwJVwiPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+Um91dGU8L3RkPjx0ZD57cm91dGVpZH08L3RkPjwvdHI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5TZWdtZW50PC90ZD48dGQ+TSB7ZnJvbV9tfSBcXHUyMDEzIHt0b19tfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPlJpc2sgTGV2ZWw8L3RkPjx0ZCBzdHlsZT1cImZvbnQtd2VpZ2h0OjcwMFwiPntyaXNrX2xldmVsfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPkNvbnRyaWJ1dGluZyBGYWN0b3JzPC90ZD48dGQ+e2NvbnRyaWJ1dGluZ19mYWN0b3JzfTwvdGQ+PC90cj5cclxuICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBleHByZXNzaW9uSW5mb3M6IFt7XHJcbiAgICAgICAgICBuYW1lOiAncmlza0NvbG9yJyxcclxuICAgICAgICAgIGV4cHJlc3Npb246IGB2YXIgcyA9ICRmZWF0dXJlLnJpc2tfc2NvcmU7IFdoZW4ocyA+IDc1LCAnI2QzMmYyZicsIHMgPiA1MCwgJyNmNTdjMDAnLCBzID4gMjUsICcjZmJjMDJkJywgcyA+IDAsICcjMzg4ZTNjJywgJyM5OTknKWBcclxuICAgICAgICB9XVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgdmlldy5tYXAuYWRkKHByZWRpY3Rpb25MYXllcilcclxuICAgIHByZWRpY3Rpb25MYXllci53aGVuKCgpID0+IHtcclxuICAgICAgcHJlZGljdGlvbkxheWVyLnF1ZXJ5RXh0ZW50KCkudGhlbigocjogYW55KSA9PiB7XHJcbiAgICAgICAgaWYgKHIuZXh0ZW50KSB2aWV3LmdvVG8oci5leHRlbnQuZXhwYW5kKDEuMikpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBOWSBTVEFURSBDUkFTSCBNT0RFTCA9PT09PT09PT09PT09PT09PT09PVxyXG4gIGNvbnN0IE5ZX1NUQVRFX0NSQVNIX01PREVMID0ge1xyXG4gICAgdG90YWxDcmFzaGVzOiAxNTI1MTIzLFxyXG4gICAgdG90YWxGYXRhbDogNDIwOCxcclxuICAgIHllYXJzOiAnMjAyMS0yMDI0JyxcclxuICAgIHNvdXJjZTogJ05ZIFN0YXRlIERNViB2aWEgZGF0YS5ueS5nb3YnLFxyXG4gICAgcm9hZEdlb21ldHJ5OiB7XHJcbiAgICAgICdTdHJhaWdodCBhbmQgTGV2ZWwnOiB7IGNyYXNoZXM6IDExNzgyMjgsIGZhdGFsOiAyODM0LCB3ZWlnaHQ6IDEuMCB9LFxyXG4gICAgICAnU3RyYWlnaHQgYW5kIEdyYWRlJzogeyBjcmFzaGVzOiAxMjY0NjQsIGZhdGFsOiA0MjksIHdlaWdodDogMS40MSB9LFxyXG4gICAgICAnQ3VydmUgYW5kIExldmVsJzogeyBjcmFzaGVzOiA3MjM0OSwgZmF0YWw6IDQ5Nywgd2VpZ2h0OiAyLjg2IH0sXHJcbiAgICAgICdDdXJ2ZSBhbmQgR3JhZGUnOiB7IGNyYXNoZXM6IDQ3NDk3LCBmYXRhbDogMzE2LCB3ZWlnaHQ6IDIuNzcgfSxcclxuICAgICAgJ0N1cnZlIGF0IEhpbGwgQ3Jlc3QnOiB7IGNyYXNoZXM6IDY4NjAsIGZhdGFsOiA1NCwgd2VpZ2h0OiAzLjI4IH0sXHJcbiAgICAgICdTdHJhaWdodCBhdCBIaWxsIENyZXN0JzogeyBjcmFzaGVzOiAyMTU5NywgZmF0YWw6IDc1LCB3ZWlnaHQ6IDEuNDUgfVxyXG4gICAgfSxcclxuICAgIHRyYWZmaWNDb250cm9sOiB7XHJcbiAgICAgICdOb25lJzogeyBjcmFzaGVzOiA4NzIwNTYsIGZhdGFsOiAyNDU3LCB3ZWlnaHQ6IDEuMTcgfSxcclxuICAgICAgJ1RyYWZmaWMgU2lnbmFsJzogeyBjcmFzaGVzOiAzMTgwNjUsIGZhdGFsOiA4MjYsIHdlaWdodDogMS4wOCB9LFxyXG4gICAgICAnU3RvcCBTaWduJzogeyBjcmFzaGVzOiAxMzE2NjQsIGZhdGFsOiAyNjYsIHdlaWdodDogMC44NCB9LFxyXG4gICAgICAnTm8gUGFzc2luZyBab25lJzogeyBjcmFzaGVzOiA4NTM5NiwgZmF0YWw6IDU1Nywgd2VpZ2h0OiAyLjcyIH0sXHJcbiAgICAgICdZaWVsZCBTaWduJzogeyBjcmFzaGVzOiAxMjg4MCwgZmF0YWw6IDgsIHdlaWdodDogMC4yNiB9LFxyXG4gICAgICAnQ29uc3RydWN0aW9uIFdvcmsgQXJlYSc6IHsgY3Jhc2hlczogNDQyOSwgZmF0YWw6IDksIHdlaWdodDogMC44NSB9LFxyXG4gICAgICAnRmxhc2hpbmcgTGlnaHQnOiB7IGNyYXNoZXM6IDMwNjMsIGZhdGFsOiAxMCwgd2VpZ2h0OiAxLjM2IH0sXHJcbiAgICAgICdSUiBDcm9zc2luZyBHYXRlcyc6IHsgY3Jhc2hlczogODc4LCBmYXRhbDogNywgd2VpZ2h0OiAzLjMyIH0sXHJcbiAgICAgICdTY2hvb2wgWm9uZSc6IHsgY3Jhc2hlczogNjM3LCBmYXRhbDogMSwgd2VpZ2h0OiAwLjY1IH1cclxuICAgIH0sXHJcbiAgICByb2FkU3VyZmFjZToge1xyXG4gICAgICAnRHJ5JzogeyBjcmFzaGVzOiAxMTMwMjExLCBmYXRhbDogMzEwMiwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ1dldCc6IHsgY3Jhc2hlczogMjM0NjAzLCBmYXRhbDogNjUxLCB3ZWlnaHQ6IDEuMDEgfSxcclxuICAgICAgJ1Nub3cvSWNlJzogeyBjcmFzaGVzOiA3MjY3NiwgZmF0YWw6IDIyMiwgd2VpZ2h0OiAxLjExIH0sXHJcbiAgICAgICdTbHVzaCc6IHsgY3Jhc2hlczogNTc1NywgZmF0YWw6IDE0LCB3ZWlnaHQ6IDAuODkgfSxcclxuICAgICAgJ0Zsb29kZWQgV2F0ZXInOiB7IGNyYXNoZXM6IDUwOCwgZmF0YWw6IDMsIHdlaWdodDogMi4xNSB9LFxyXG4gICAgICAnTXVkZHknOiB7IGNyYXNoZXM6IDY0OCwgZmF0YWw6IDMsIHdlaWdodDogMS42OSB9XHJcbiAgICB9LFxyXG4gICAgbGlnaHRpbmc6IHtcclxuICAgICAgJ0RheWxpZ2h0JzogeyBjcmFzaGVzOiA5MzMyMTAsIGZhdGFsOiAxODY3LCB3ZWlnaHQ6IDAuODMgfSxcclxuICAgICAgJ0RhcmstUm9hZCBMaWdodGVkJzogeyBjcmFzaGVzOiAyNzg5ODIsIGZhdGFsOiA4NzYsIHdlaWdodDogMS4zMSB9LFxyXG4gICAgICAnRGFyay1Sb2FkIFVubGlnaHRlZCc6IHsgY3Jhc2hlczogMTQ4NjM1LCBmYXRhbDogMTAwNSwgd2VpZ2h0OiAyLjgyIH0sXHJcbiAgICAgICdEdXNrJzogeyBjcmFzaGVzOiA0ODc0MCwgZmF0YWw6IDIyMSwgd2VpZ2h0OiAxLjg5IH0sXHJcbiAgICAgICdEYXduJzogeyBjcmFzaGVzOiAzNzg0OCwgZmF0YWw6IDIzOSwgd2VpZ2h0OiAyLjYzIH1cclxuICAgIH0sXHJcbiAgICB3ZWF0aGVyOiB7XHJcbiAgICAgICdDbGVhcic6IHsgY3Jhc2hlczogOTM1ODk3LCBmYXRhbDogMjY3OSwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ0Nsb3VkeSc6IHsgY3Jhc2hlczogMjk1NzMyLCBmYXRhbDogNzAwLCB3ZWlnaHQ6IDAuODMgfSxcclxuICAgICAgJ1JhaW4nOiB7IGNyYXNoZXM6IDEzOTU1OSwgZmF0YWw6IDQxOSwgd2VpZ2h0OiAxLjA1IH0sXHJcbiAgICAgICdTbm93JzogeyBjcmFzaGVzOiA1ODc2MywgZmF0YWw6IDE4Mywgd2VpZ2h0OiAxLjA5IH0sXHJcbiAgICAgICdTbGVldC9IYWlsL0ZyZWV6aW5nIFJhaW4nOiB7IGNyYXNoZXM6IDk0ODMsIGZhdGFsOiAyOCwgd2VpZ2h0OiAxLjAzIH0sXHJcbiAgICAgICdGb2cvU21vZy9TbW9rZSc6IHsgY3Jhc2hlczogNDc5MiwgZmF0YWw6IDQ1LCB3ZWlnaHQ6IDMuOTEgfVxyXG4gICAgfSxcclxuICAgIGxyc01hcHBpbmc6IHtcclxuICAgICAgJ0N1cnZlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xlZnQnOiAnQ3VydmUgYW5kIExldmVsJywgJ1JpZ2h0JzogJ0N1cnZlIGFuZCBMZXZlbCcsICdDb21wb3VuZCc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnUmV2ZXJzZSc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnU2ltcGxlJzogJ0N1cnZlIGFuZCBMZXZlbCcgfSB9LFxyXG4gICAgICAnR3JhZGUnOiB7IHN0YXRlRmllbGQ6ICdyb2FkR2VvbWV0cnknLCB2YWx1ZU1hcDogeyAnTGV2ZWwnOiAnU3RyYWlnaHQgYW5kIExldmVsJywgJ0ZsYXQnOiAnU3RyYWlnaHQgYW5kIExldmVsJywgJ1JvbGxpbmcnOiAnU3RyYWlnaHQgYW5kIEdyYWRlJywgJ01vdW50YWlub3VzJzogJ0N1cnZlIGFuZCBHcmFkZScsICdTdGVlcCc6ICdTdHJhaWdodCBhbmQgR3JhZGUnIH0gfSxcclxuICAgICAgJ1NwZWVkIExpbWl0JzogeyBzdGF0ZUZpZWxkOiAnc3BlZWQnLCBjdXN0b21XZWlnaHRzOiB7ICcyNSc6IDAuNywgJzMwJzogMC44LCAnMzUnOiAwLjksICc0MCc6IDEuMSwgJzQ1JzogMS4zLCAnNTAnOiAxLjYsICc1NSc6IDIuMCwgJzYwJzogMi4zLCAnNjUnOiAyLjYgfSB9LFxyXG4gICAgICAnRnVuY3Rpb25hbCBDbGFzcyc6IHsgc3RhdGVGaWVsZDogJ2Z1bmNDbGFzcycsIGN1c3RvbVdlaWdodHM6IHsgJ0ludGVyc3RhdGUnOiAxLjMsICdQcmluY2lwYWwgQXJ0ZXJpYWwnOiAxLjUsICdNaW5vciBBcnRlcmlhbCc6IDEuMiwgJ01ham9yIENvbGxlY3Rvcic6IDEuMCwgJ01pbm9yIENvbGxlY3Rvcic6IDAuOCwgJ0xvY2FsJzogMC42IH0gfSxcclxuICAgICAgJ01lZGlhbiBUeXBlJzogeyBzdGF0ZUZpZWxkOiAnbWVkaWFuJywgY3VzdG9tV2VpZ2h0czogeyAnTm9uZSc6IDEuOCwgJ1BhaW50ZWQnOiAxLjMsICdDdXJiZWQnOiAxLjAsICdQb3NpdGl2ZSBCYXJyaWVyJzogMC42LCAnRGVwcmVzc2VkJzogMC43LCAnR3Jhc3MnOiAwLjkgfSB9LFxyXG4gICAgICAnVGhyb3VnaCBMYW5lJzogeyBzdGF0ZUZpZWxkOiAnbGFuZXMnLCBjdXN0b21XZWlnaHRzOiB7ICcxJzogMC44LCAnMic6IDEuMCwgJzMnOiAxLjMsICc0JzogMS4xLCAnNSc6IDEuNCwgJzYnOiAxLjIgfSB9LFxyXG4gICAgICAnU2hvdWxkZXIgVHlwZSc6IHsgc3RhdGVGaWVsZDogJ3Nob3VsZGVyJywgY3VzdG9tV2VpZ2h0czogeyAnTm9uZSc6IDEuNiwgJ0dyYXZlbCc6IDEuMSwgJ1BhdmVkJzogMC44LCAnR3Jhc3MnOiAxLjIsICdDdXJiJzogMS4wIH0gfSxcclxuICAgICAgJ1BhdmVtZW50IFR5cGUnOiB7IHN0YXRlRmllbGQ6ICdwYXZlbWVudCcsIGN1c3RvbVdlaWdodHM6IHsgJ0FzcGhhbHQnOiAwLjksICdDb25jcmV0ZSc6IDEuMCwgJ0dyYXZlbCc6IDEuNSwgJ0JyaWNrJzogMS4yLCAnRGlydCc6IDEuOCwgJ0NvbXBvc2l0ZSc6IDAuOTUgfSB9LFxyXG4gICAgICAnVGVycmFpbiBUeXBlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xldmVsJzogJ1N0cmFpZ2h0IGFuZCBMZXZlbCcsICdSb2xsaW5nJzogJ1N0cmFpZ2h0IGFuZCBHcmFkZScsICdNb3VudGFpbm91cyc6ICdDdXJ2ZSBhbmQgR3JhZGUnIH0gfSxcclxuICAgICAgJ1BlcmNlbnQgUGFzc2luZyBTaWdodCc6IHsgc3RhdGVGaWVsZDogJ3Bhc3NTaWdodCcsIGN1c3RvbVdlaWdodHM6IHsgJzAnOiAyLjUsICcxMCc6IDIuMiwgJzIwJzogMS45LCAnMzAnOiAxLjYsICc0MCc6IDEuMywgJzUwJzogMS4xLCAnNjAnOiAxLjAsICc3MCc6IDAuOSwgJzgwJzogMC44NSwgJzkwJzogMC44LCAnMTAwJzogMC43NSB9IH0sXHJcbiAgICAgICdBY2Nlc3MgQ29udHJvbCc6IHsgc3RhdGVGaWVsZDogJ2FjY2VzcycsIGN1c3RvbVdlaWdodHM6IHsgJ0Z1bGwnOiAwLjYsICdQYXJ0aWFsJzogMS4wLCAnTm9uZSc6IDEuNSB9IH0sXHJcbiAgICAgICdPd25lcnNoaXAnOiB7IHN0YXRlRmllbGQ6ICdvd25lcnNoaXAnLCBjdXN0b21XZWlnaHRzOiB7ICdTdGF0ZSc6IDEuMCwgJ0NvdW50eSc6IDEuMSwgJ0NpdHknOiAxLjIsICdGZWRlcmFsJzogMC45LCAnUHJpdmF0ZSc6IDEuNCB9IH1cclxuICAgIH0gYXMgUmVjb3JkPHN0cmluZywgYW55PlxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gQUkgUFJFRElDVElPTiA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBydW5BSVByZWRpY3Rpb24gPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRSdW5uaW5nKHRydWUpXHJcbiAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIHNldFJlc3VsdChudWxsKVxyXG4gICAgc2V0U2hvd0V4cGxhbmF0aW9uKGZhbHNlKVxyXG4gICAgc2V0RmFjdG9ycyhudWxsKVxyXG4gICAgc2V0RXJyb3IobnVsbClcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZXNzaW9uID0gU2Vzc2lvbk1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5nZXRNYWluU2Vzc2lvbigpIGFzIGFueVxyXG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignTm90IHNpZ25lZCBpbi4nKVxyXG4gICAgICBjb25zdCB0b2tlbiA9IHNlc3Npb24udG9rZW5cclxuICAgICAgY29uc3QgcG9ydGFsVXJsID0gKHNlc3Npb24ucG9ydGFsIHx8ICcnKS5yZXBsYWNlKC9cXC9zaGFyaW5nXFwvcmVzdFxcLz8kLywgJycpXHJcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gc2Vzc2lvbi51c2VybmFtZVxyXG4gICAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgICAgY29uc3Qgd2tpZCA9IHZpZXc/LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcblxyXG4gICAgICAvLyBTdGVwIDE6IFF1ZXJ5IGV2ZW50IGRhdGFcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1F1ZXJ5aW5nIGV2ZW50IGRhdGEgZnJvbSBMUlMuLi4nKVxyXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCBxdWVyeUV2ZW50RGF0YSgpXHJcbiAgICAgIGlmIChldmVudERhdGEubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGV2ZW50IGRhdGEgZm91bmQgZm9yIHNlbGVjdGVkIHJvdXRlcy4nKVxyXG5cclxuICAgICAgLy8gU3RlcCAyOiBTZWdtZW50IHJvdXRlc1xyXG4gICAgICBzZXRQcm9ncmVzcygnU2VnbWVudGluZyByb3V0ZXMgaW50byAwLjUtbWlsZSBpbnRlcnZhbHMuLi4nKVxyXG4gICAgICBjb25zdCByb3V0ZUdlb21ldHJpZXMgPSByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudFxyXG4gICAgICBpZiAocm91dGVHZW9tZXRyaWVzLnNpemUgPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gcm91dGUgZ2VvbWV0cmllcyBjYWNoZWQuJylcclxuXHJcbiAgICAgIGNvbnN0IHNlZ21lbnRzOiBhbnlbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgW3JpZCwgcm91dGVEYXRhXSBvZiByb3V0ZUdlb21ldHJpZXMpIHtcclxuICAgICAgICBjb25zdCB7IHZlcnRpY2VzLCBtSWR4IH0gPSByb3V0ZURhdGFcclxuICAgICAgICBpZiAodmVydGljZXMubGVuZ3RoIDwgMikgY29udGludWVcclxuICAgICAgICBjb25zdCBtaW5NZWFzdXJlID0gdmVydGljZXNbMF1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IG1heE1lYXN1cmUgPSB2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3Qgcm91dGVMZW4gPSBtYXhNZWFzdXJlIC0gbWluTWVhc3VyZVxyXG4gICAgICAgIGlmIChyb3V0ZUxlbiA8PSAwKSBjb250aW51ZVxyXG5cclxuICAgICAgICBsZXQgc2VnRnJvbSA9IG1pbk1lYXN1cmVcclxuICAgICAgICBsZXQgc2VnSWR4ID0gMFxyXG4gICAgICAgIHdoaWxlIChzZWdGcm9tIDwgbWF4TWVhc3VyZSkge1xyXG4gICAgICAgICAgY29uc3Qgc2VnVG8gPSBNYXRoLm1pbihzZWdGcm9tICsgMC41LCBtYXhNZWFzdXJlKVxyXG4gICAgICAgICAgY29uc3QgbWlkTSA9IChzZWdGcm9tICsgc2VnVG8pIC8gMlxyXG4gICAgICAgICAgbGV0IG1pZFggPSAwLCBtaWRZID0gMFxyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGNvbnN0IG0yID0gdmVydGljZXNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgaWYgKG1pZE0gPj0gbTEgJiYgbWlkTSA8PSBtMikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZyYWMgPSBtMiAhPT0gbTEgPyAobWlkTSAtIG0xKSAvIChtMiAtIG0xKSA6IDBcclxuICAgICAgICAgICAgICBtaWRYID0gdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKVxyXG4gICAgICAgICAgICAgIG1pZFkgPSB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgcGF0aDogbnVtYmVyW11bXSA9IFtdXHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBtMSA9IHZlcnRpY2VzW2ldW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgY29uc3QgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBpZiAobTIgPCBzZWdGcm9tKSBjb250aW51ZVxyXG4gICAgICAgICAgICBpZiAobTEgPiBzZWdUbykgYnJlYWtcclxuICAgICAgICAgICAgaWYgKG0xID49IHNlZ0Zyb20gJiYgbTEgPD0gc2VnVG8pIHtcclxuICAgICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDAgfHwgcGF0aFtwYXRoLmxlbmd0aCAtIDFdWzBdICE9PSB2ZXJ0aWNlc1tpXVswXSkgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpXVswXSwgdmVydGljZXNbaV1bMV1dKVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG0xIDwgc2VnRnJvbSAmJiBtMiA+IHNlZ0Zyb20pIHtcclxuICAgICAgICAgICAgICBjb25zdCBmcmFjID0gKHNlZ0Zyb20gLSBtMSkgLyAobTIgLSBtMSlcclxuICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSksIHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSldKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtMiA+PSBzZWdGcm9tICYmIG0yIDw9IHNlZ1RvKSBwYXRoLnB1c2goW3ZlcnRpY2VzW2kgKyAxXVswXSwgdmVydGljZXNbaSArIDFdWzFdXSlcclxuICAgICAgICAgICAgZWxzZSBpZiAobTEgPCBzZWdUbyAmJiBtMiA+IHNlZ1RvKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZnJhYyA9IChzZWdUbyAtIG0xKSAvIChtMiAtIG0xKVxyXG4gICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKSwgdmVydGljZXNbaV1bMV0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVsxXSAtIHZlcnRpY2VzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+PSAyKSBzZWdtZW50cy5wdXNoKHsgcm91dGVJZDogcmlkLCBzZWdJZHgsIGZyb21NOiBzZWdGcm9tLCB0b006IHNlZ1RvLCBtaWRYLCBtaWRZLCBwYXRoLCBjcmFzaENvdW50OiAwLCBhdHRyczoge30gYXMgUmVjb3JkPHN0cmluZywgYW55PiB9KVxyXG4gICAgICAgICAgc2VnRnJvbSA9IHNlZ1RvXHJcbiAgICAgICAgICBzZWdJZHgrK1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlZ21lbnRzIGdlbmVyYXRlZC4nKVxyXG5cclxuICAgICAgLy8gU3RlcCAzOiBDb3VudCBjcmFzaGVzIHBlciBzZWdtZW50XHJcbiAgICAgIHNldFByb2dyZXNzKGBDb3VudGluZyBjcmFzaGVzIGFjcm9zcyAke3NlZ21lbnRzLmxlbmd0aH0gc2VnbWVudHMuLi5gKVxyXG4gICAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuICAgICAgY29uc3QgY3Jhc2hMYXllck5hbWVzID0gbmV3IFNldChldmVudENvbmZpZ3MuZmlsdGVyKGNmZyA9PiAvY3Jhc2h8YWNjaWRlbnR8Y29sbGlzaW9uL2kudGVzdChjZmcubmFtZSkpLm1hcChjZmcgPT4gY2ZnLm5hbWUpKVxyXG5cclxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBldmVudERhdGEpIHtcclxuICAgICAgICBpZiAoIWNyYXNoTGF5ZXJOYW1lcy5oYXMoZW50cnkuRmVhdHVyZSkpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYgKGVudHJ5Lk1lYXN1cmUgPT0gbnVsbCkgY29udGludWVcclxuICAgICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgICAgaWYgKHNlZy5yb3V0ZUlkID09PSBlbnRyeS5Sb3V0ZUlEICYmIGVudHJ5Lk1lYXN1cmUgPj0gc2VnLmZyb21NICYmIGVudHJ5Lk1lYXN1cmUgPCBzZWcudG9NKSB7XHJcbiAgICAgICAgICAgIHNlZy5jcmFzaENvdW50KytcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0ZXAgNDogRW5yaWNoIHdpdGggcm9hZCBhdHRyaWJ1dGVzXHJcbiAgICAgIHNldFByb2dyZXNzKCdFbnJpY2hpbmcgc2VnbWVudHMgd2l0aCByb2FkIGF0dHJpYnV0ZXMuLi4nKVxyXG4gICAgICBjb25zdCBub25DcmFzaExheWVycyA9IGV2ZW50Q29uZmlncy5maWx0ZXIoY2ZnID0+ICFjcmFzaExheWVyTmFtZXMuaGFzKGNmZy5uYW1lKSlcclxuICAgICAgY29uc3QgZW5yaWNoRmllbGRzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgY2ZnIG9mIG5vbkNyYXNoTGF5ZXJzKSB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXJFbnRyaWVzID0gZXZlbnREYXRhLmZpbHRlcihlID0+IGUuRmVhdHVyZSA9PT0gY2ZnLm5hbWUpXHJcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIChjZmcuYXR0cmlidXRlcyB8fCBbXSkpIHtcclxuICAgICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGAke2NmZy5uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnXycpLnN1YnN0cmluZygwLCAxNSl9XyR7YXR0ci5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJ18nKS5zdWJzdHJpbmcoMCwgMTUpfWAuc3Vic3RyaW5nKDAsIDMxKVxyXG4gICAgICAgICAgaWYgKCFlbnJpY2hGaWVsZHMuaW5jbHVkZXMoZmllbGROYW1lKSkgZW5yaWNoRmllbGRzLnB1c2goZmllbGROYW1lKVxyXG4gICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsYXllckVudHJpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudHJ5LlJvdXRlSUQgPT0gbnVsbCB8fCBlbnRyeS5NZWFzdXJlID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNlZy5yb3V0ZUlkID09PSBlbnRyeS5Sb3V0ZUlEICYmIGVudHJ5Lk1lYXN1cmUgPj0gc2VnLmZyb21NICYmIGVudHJ5Lk1lYXN1cmUgPCBzZWcudG9NKSB7XHJcbiAgICAgICAgICAgICAgICBzZWcuYXR0cnNbZmllbGROYW1lXSA9IGVudHJ5W2F0dHJdID8/ICcnXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RlcCA1OiBLZXJuZWwgZGVuc2l0eSBzY29yaW5nXHJcbiAgICAgIHNldFByb2dyZXNzKCdDb21wdXRpbmcgcmlzayBzY29yZXMuLi4nKVxyXG4gICAgICBjb25zdCBLRVJORUxfUkFESVVTID0gNVxyXG4gICAgICBjb25zdCBERUNBWSA9IDAuNVxyXG4gICAgICBjb25zdCBzZWdzQnlSb3V0ZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnlbXT4oKVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGlmICghc2Vnc0J5Um91dGUuaGFzKHNlZy5yb3V0ZUlkKSkgc2Vnc0J5Um91dGUuc2V0KHNlZy5yb3V0ZUlkLCBbXSlcclxuICAgICAgICBzZWdzQnlSb3V0ZS5nZXQoc2VnLnJvdXRlSWQpIS5wdXNoKHNlZylcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcmlza1Njb3JlczogbnVtYmVyW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlU2VncyA9IHNlZ3NCeVJvdXRlLmdldChzZWcucm91dGVJZCkgfHwgW11cclxuICAgICAgICBsZXQgc2NvcmUgPSBzZWcuY3Jhc2hDb3VudCAqIDJcclxuICAgICAgICBmb3IgKGNvbnN0IG5laWdoYm9yIG9mIHJvdXRlU2Vncykge1xyXG4gICAgICAgICAgaWYgKG5laWdoYm9yID09PSBzZWcpIGNvbnRpbnVlXHJcbiAgICAgICAgICBjb25zdCBkID0gTWF0aC5hYnMobmVpZ2hib3Iuc2VnSWR4IC0gc2VnLnNlZ0lkeClcclxuICAgICAgICAgIGlmIChkIDw9IEtFUk5FTF9SQURJVVMpIHNjb3JlICs9IG5laWdoYm9yLmNyYXNoQ291bnQgKiBNYXRoLnBvdyhERUNBWSwgZClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmlza1Njb3Jlcy5wdXNoKHNjb3JlKVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG1heFJpc2tTY29yZSA9IE1hdGgubWF4KC4uLnJpc2tTY29yZXMsIDEpXHJcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRTY29yZXMgPSByaXNrU2NvcmVzLm1hcChzID0+IE1hdGgucm91bmQoKHMgLyBtYXhSaXNrU2NvcmUpICogMTAwKSlcclxuXHJcbiAgICAgIC8vIFN0b3JlIGZhY3RvcnMgZm9yIGV4cGxhbmF0aW9uXHJcbiAgICAgIGNvbnN0IGhpZ2hSaXNrU2VncyA9IHNlZ21lbnRzLmZpbHRlcigoXywgaWR4KSA9PiBub3JtYWxpemVkU2NvcmVzW2lkeF0gPj0gNzUpXHJcbiAgICAgIGNvbnN0IHRvcEhpZ2hSaXNrID0gaGlnaFJpc2tTZWdzLm1hcChzZWcgPT4gKHsgLi4uc2VnLCByaXNrU2NvcmU6IG5vcm1hbGl6ZWRTY29yZXNbc2VnbWVudHMuaW5kZXhPZihzZWcpXSB9KSkuc29ydCgoYSwgYikgPT4gYi5yaXNrU2NvcmUgLSBhLnJpc2tTY29yZSkuc2xpY2UoMCwgNSlcclxuICAgICAgc2V0RmFjdG9ycyh7IHRvdGFsU2VnbWVudHM6IHNlZ21lbnRzLmxlbmd0aCwgc2VnbWVudHNXaXRoQ3Jhc2hlczogc2VnbWVudHMuZmlsdGVyKHMgPT4gcy5jcmFzaENvdW50ID4gMCkubGVuZ3RoLCBoaWdoUmlza0NvdW50OiBoaWdoUmlza1NlZ3MubGVuZ3RoLCBtYXhDcmFzaENvdW50OiBNYXRoLm1heCguLi5zZWdtZW50cy5tYXAocyA9PiBzLmNyYXNoQ291bnQpLCAxKSwgZW5yaWNoTGF5ZXJzOiBub25DcmFzaExheWVycy5tYXAobCA9PiBsLm5hbWUpLCBlbnJpY2hGaWVsZHMsIGtlcm5lbFJhZGl1czogS0VSTkVMX1JBRElVUywgdG9wSGlnaFJpc2tTZWdtZW50czogdG9wSGlnaFJpc2sgfSlcclxuXHJcbiAgICAgIC8vIFN0ZXAgNjogVXBsb2FkIGFzIGZlYXR1cmUgc2VydmljZVxyXG4gICAgICBzZXRQcm9ncmVzcygnVXBsb2FkaW5nIHByZWRpY3Rpb24gbGF5ZXIuLi4nKVxyXG4gICAgICBjb25zdCBjb250ZW50VXJsID0gYCR7cG9ydGFsVXJsfS9zaGFyaW5nL3Jlc3QvY29udGVudC91c2Vycy8ke3VzZXJuYW1lfWBcclxuICAgICAgY29uc3QgZm9sZGVyVXJsID0gc2VsZWN0ZWRGb2xkZXJJZCA/IGAke2NvbnRlbnRVcmx9LyR7c2VsZWN0ZWRGb2xkZXJJZH1gIDogY29udGVudFVybFxyXG4gICAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IGBDcmFzaFJpc2tfQUlfJHtEYXRlLm5vdygpfWBcclxuXHJcbiAgICAgIGNvbnN0IGZpZWxkcyA9IFtcclxuICAgICAgICB7IG5hbWU6ICdPQkpFQ1RJRCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlT0lEJywgYWxpYXM6ICdPYmplY3RJRCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdyb3V0ZWlkJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1JvdXRlIElEJywgbGVuZ3RoOiAxMDAgfSxcclxuICAgICAgICB7IG5hbWU6ICdmcm9tX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnRnJvbSBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3RvX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnVG8gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICdjcmFzaF9jb3VudCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnQ3Jhc2ggQ291bnQnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19zY29yZScsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnUmlzayBTY29yZSAoMC0xMDApJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfbGV2ZWwnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUmlzayBMZXZlbCcsIGxlbmd0aDogMjAgfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250cmlidXRpbmdfZmFjdG9ycycsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdDb250cmlidXRpbmcgRmFjdG9ycycsIGxlbmd0aDogNTAwIH1cclxuICAgICAgXVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2NyZWF0ZVBhcmFtZXRlcnMnLCBKU09OLnN0cmluZ2lmeSh7IG5hbWU6IHNlcnZpY2VOYW1lLCBzZXJ2aWNlRGVzY3JpcHRpb246ICdBSSBjcmFzaCByaXNrIHByZWRpY3Rpb24nLCBoYXNTdGF0aWNEYXRhOiBmYWxzZSwgbWF4UmVjb3JkQ291bnQ6IDEwMDAwLCBzdXBwb3J0ZWRRdWVyeUZvcm1hdHM6ICdKU09OJywgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZycsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9LCBpbml0aWFsRXh0ZW50OiB7IHhtaW46IC0yMDAzNzUwOCwgeW1pbjogLTIwMDM3NTA4LCB4bWF4OiAyMDAzNzUwOCwgeW1heDogMjAwMzc1MDgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGFsbG93R2VvbWV0cnlVcGRhdGVzOiB0cnVlIH0pKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0YXJnZXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnb3V0cHV0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGlmIChzZWxlY3RlZEZvbGRlcklkKSBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmb2xkZXJJZCcsIHNlbGVjdGVkRm9sZGVySWQpXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwID0gYXdhaXQgZmV0Y2goYCR7Zm9sZGVyVXJsfS9jcmVhdGVTZXJ2aWNlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogY3JlYXRlUGFyYW1zIH0pXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3VsdCA9IGF3YWl0IGNyZWF0ZVJlc3AuanNvbigpXHJcbiAgICAgIGlmICghY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMICYmICFjcmVhdGVSZXN1bHQuc2VydmljZXVybCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlcnZpY2U6ICcgKyBKU09OLnN0cmluZ2lmeShjcmVhdGVSZXN1bHQpKVxyXG4gICAgICBjb25zdCBzZXJ2aWNlVXJsID0gY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMIHx8IGNyZWF0ZVJlc3VsdC5zZXJ2aWNldXJsXHJcbiAgICAgIGNvbnN0IHRlbXBJdGVtSWQgPSBjcmVhdGVSZXN1bHQuaXRlbUlkXHJcblxyXG4gICAgICBjb25zdCBhZG1pblVybCA9IHNlcnZpY2VVcmwucmVwbGFjZSgnL3Jlc3Qvc2VydmljZXMvJywgJy9yZXN0L2FkbWluL3NlcnZpY2VzLycpXHJcbiAgICAgIGNvbnN0IGFkZERlZlBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdhZGRUb0RlZmluaXRpb24nLCBKU09OLnN0cmluZ2lmeSh7IGxheWVyczogW3sgaWQ6IDAsIG5hbWU6ICdBSSBDcmFzaCBSaXNrJywgdHlwZTogJ0ZlYXR1cmUgTGF5ZXInLCBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2x5bGluZScsIGRpc3BsYXlGaWVsZDogJ3JvdXRlaWQnLCBmaWVsZHMsIG9iamVjdElkRmllbGQ6ICdPQkpFQ1RJRCcsIGhhc0F0dGFjaG1lbnRzOiBmYWxzZSwgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZyxDcmVhdGUsVXBkYXRlLERlbGV0ZScgfV0gfSkpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2FkbWluVXJsfS9hZGRUb0RlZmluaXRpb25gLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGREZWZQYXJhbXMgfSlcclxuXHJcbiAgICAgIC8vIFVwbG9hZCBmZWF0dXJlc1xyXG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHNlZ21lbnRzLmZpbHRlcigoXywgaWR4KSA9PiBub3JtYWxpemVkU2NvcmVzW2lkeF0gPiAwKS5tYXAoKHNlZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkeCA9IHNlZ21lbnRzLmluZGV4T2Yoc2VnKVxyXG4gICAgICAgIGNvbnN0IHJpc2tTY29yZSA9IG5vcm1hbGl6ZWRTY29yZXNbaWR4XVxyXG4gICAgICAgIGNvbnN0IHJpc2tMZXZlbCA9IHJpc2tTY29yZSA+PSA3NSA/ICdIaWdoJyA6IHJpc2tTY29yZSA+PSA0MCA/ICdNZWRpdW0nIDogcmlza1Njb3JlID4gMCA/ICdMb3cnIDogJ01pbmltYWwnXHJcbiAgICAgICAgY29uc3QgZmN0cnMgPSBPYmplY3QuZW50cmllcyhzZWcuYXR0cnMpLmZpbHRlcigoWywgdl0pID0+IHYgJiYgU3RyaW5nKHYpLnRyaW0oKSkuc2xpY2UoMCwgNSkubWFwKChbaywgdl0pID0+IGAke2t9PSR7dn1gKS5qb2luKCc7ICcpXHJcbiAgICAgICAgcmV0dXJuIHsgZ2VvbWV0cnk6IHsgcGF0aHM6IFtzZWcucGF0aF0sIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGF0dHJpYnV0ZXM6IHsgcm91dGVpZDogc2VnLnJvdXRlSWQsIGZyb21fbTogc2VnLmZyb21NLCB0b19tOiBzZWcudG9NLCBjcmFzaF9jb3VudDogc2VnLmNyYXNoQ291bnQsIHJpc2tfc2NvcmU6IHJpc2tTY29yZSwgcmlza19sZXZlbDogcmlza0xldmVsLCBjb250cmlidXRpbmdfZmFjdG9yczogZmN0cnMgfHwgJ0RlbnNpdHkgY2x1c3RlcicgfSB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSArPSAxMDAwKSB7XHJcbiAgICAgICAgY29uc3QgYmF0Y2ggPSBmZWF0dXJlcy5zbGljZShpLCBpICsgMTAwMClcclxuICAgICAgICBzZXRQcm9ncmVzcyhgVXBsb2FkaW5nLi4uICR7TWF0aC5taW4oaSArIDEwMDAsIGZlYXR1cmVzLmxlbmd0aCl9LyR7ZmVhdHVyZXMubGVuZ3RofWApXHJcbiAgICAgICAgY29uc3QgYWRkRmVhdFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmZWF0dXJlcycsIEpTT04uc3RyaW5naWZ5KGJhdGNoKSlcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgICBhd2FpdCBmZXRjaChgJHtzZXJ2aWNlVXJsfS8wL2FkZEZlYXR1cmVzYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRmVhdFBhcmFtcyB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaGFyZVxyXG4gICAgICBjb25zdCBzaGFyZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2V2ZXJ5b25lJywgJ2ZhbHNlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdvcmcnLCAndHJ1ZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnaXRlbXMnLCB0ZW1wSXRlbUlkKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7Y29udGVudFVybH0vaXRlbXMvJHt0ZW1wSXRlbUlkfS9zaGFyZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IHNoYXJlUGFyYW1zIH0pXHJcblxyXG4gICAgICBzZXRQcm9ncmVzcygnRGlzcGxheWluZyBvbiBtYXAuLi4nKVxyXG4gICAgICBhd2FpdCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwKGAke3NlcnZpY2VVcmx9LzBgLCB0b2tlbiwgd2tpZClcclxuICAgICAgc2V0UmVzdWx0KHsgbGF5ZXJVcmw6IHNlcnZpY2VVcmwsIGl0ZW1Vcmw6IGAke3BvcnRhbFVybH0vaG9tZS9pdGVtLmh0bWw/aWQ9JHt0ZW1wSXRlbUlkfWAgfSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdbQ3Jhc2hSaXNrIEFJXSBGYWlsZWQ6JywgZXJyKVxyXG4gICAgICBzZXRFcnJvcignQUkgcHJlZGljdGlvbiBmYWlsZWQ6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRSdW5uaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWcsIHF1ZXJ5RXZlbnREYXRhLCBzZWxlY3RlZEZvbGRlcklkLCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gTUwgUFJFRElDVElPTiA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBydW5NTFByZWRpY3Rpb24gPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRSdW5uaW5nKHRydWUpXHJcbiAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIHNldFJlc3VsdChudWxsKVxyXG4gICAgc2V0U2hvd0V4cGxhbmF0aW9uKGZhbHNlKVxyXG4gICAgc2V0TW9kZWxJbmZvKG51bGwpXHJcbiAgICBzZXRFcnJvcihudWxsKVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBTZXNzaW9uTWFuYWdlci5nZXRJbnN0YW5jZSgpLmdldE1haW5TZXNzaW9uKCkgYXMgYW55XHJcbiAgICAgIGlmICghc2Vzc2lvbikgdGhyb3cgbmV3IEVycm9yKCdOb3Qgc2lnbmVkIGluLicpXHJcbiAgICAgIGNvbnN0IHRva2VuID0gc2Vzc2lvbi50b2tlblxyXG4gICAgICBjb25zdCBwb3J0YWxVcmwgPSAoc2Vzc2lvbi5wb3J0YWwgfHwgJycpLnJlcGxhY2UoL1xcL3NoYXJpbmdcXC9yZXN0XFwvPyQvLCAnJylcclxuICAgICAgY29uc3QgdXNlcm5hbWUgPSBzZXNzaW9uLnVzZXJuYW1lXHJcbiAgICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IGFzIGFueVxyXG4gICAgICBpZiAoIXZpZXcpIHRocm93IG5ldyBFcnJvcignTm8gbWFwIHZpZXcgYXZhaWxhYmxlLicpXHJcbiAgICAgIGNvbnN0IHdraWQgPSB2aWV3LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcblxyXG4gICAgICAvLyBTdGVwIDE6IFF1ZXJ5IGV2ZW50IGRhdGFcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1F1ZXJ5aW5nIHJvYWQgYXR0cmlidXRlIGRhdGEgZnJvbSBMUlMuLi4nKVxyXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCBxdWVyeUV2ZW50RGF0YSgpXHJcblxyXG4gICAgICAvLyBTdGVwIDI6IFNlZ21lbnQgcm91dGVzXHJcbiAgICAgIHNldFByb2dyZXNzKCdTZWdtZW50aW5nIHJvdXRlcyBhdCAwLjUtbWlsZSBpbnRlcnZhbHMuLi4nKVxyXG4gICAgICBjb25zdCByb3V0ZUdlb21ldHJpZXMgPSByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudFxyXG4gICAgICBpZiAocm91dGVHZW9tZXRyaWVzLnNpemUgPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gcm91dGUgZ2VvbWV0cmllcy4gU2VsZWN0IHJvdXRlcyBmaXJzdC4nKVxyXG5cclxuICAgICAgY29uc3QgbW9kZWwgPSBOWV9TVEFURV9DUkFTSF9NT0RFTFxyXG5cclxuICAgICAgLy8gQnVpbGQgZXZlbnQgbG9va3VwXHJcbiAgICAgIGNvbnN0IGV2ZW50TG9va3VwID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxudW1iZXIsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+PigpXHJcbiAgICAgIGNvbnN0IGV2ZW50Q29uZmlncyA9IGNvbmZpZy5ldmVudExheWVyQ29uZmlncyB8fCBbXVxyXG4gICAgICBmb3IgKGNvbnN0IGNmZyBvZiBldmVudENvbmZpZ3MpIHtcclxuICAgICAgICBjb25zdCBsYXllckVudHJpZXMgPSBldmVudERhdGEuZmlsdGVyKGUgPT4gZS5GZWF0dXJlID09PSBjZmcubmFtZSlcclxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxheWVyRW50cmllcykge1xyXG4gICAgICAgICAgaWYgKGVudHJ5LlJvdXRlSUQgPT0gbnVsbCB8fCBlbnRyeS5NZWFzdXJlID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICBjb25zdCByaWQgPSBlbnRyeS5Sb3V0ZUlEXHJcbiAgICAgICAgICBpZiAoIWV2ZW50TG9va3VwLmhhcyhyaWQpKSBldmVudExvb2t1cC5zZXQocmlkLCBuZXcgTWFwKCkpXHJcbiAgICAgICAgICBjb25zdCBtS2V5ID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KGVudHJ5Lk1lYXN1cmUpICogMikgLyAyXHJcbiAgICAgICAgICBjb25zdCByb3V0ZU1hcCA9IGV2ZW50TG9va3VwLmdldChyaWQpIVxyXG4gICAgICAgICAgaWYgKCFyb3V0ZU1hcC5oYXMobUtleSkpIHJvdXRlTWFwLnNldChtS2V5LCB7fSlcclxuICAgICAgICAgIGNvbnN0IHNlZ0RhdGEgPSByb3V0ZU1hcC5nZXQobUtleSkhXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgKGNmZy5hdHRyaWJ1dGVzIHx8IFtdKSkge1xyXG4gICAgICAgICAgICBpZiAoZW50cnlbYXR0cl0gIT0gbnVsbCAmJiBTdHJpbmcoZW50cnlbYXR0cl0pLnRyaW0oKSkge1xyXG4gICAgICAgICAgICAgIHNlZ0RhdGFbYCR7Y2ZnLm5hbWV9Ojoke2F0dHJ9YF0gPSBTdHJpbmcoZW50cnlbYXR0cl0pLnRyaW0oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGVwIDM6IFNjb3JlIHNlZ21lbnRzXHJcbiAgICAgIHNldFByb2dyZXNzKCdBcHBseWluZyBzdGF0ZSBjcmFzaCBtb2RlbCB3ZWlnaHRzLi4uJylcclxuICAgICAgY29uc3Qgc2VnbWVudHM6IGFueVtdID0gW11cclxuICAgICAgZm9yIChjb25zdCBbcmlkLCByZF0gb2Ygcm91dGVHZW9tZXRyaWVzLmVudHJpZXMoKSkge1xyXG4gICAgICAgIGNvbnN0IHZlcnRzID0gcmQudmVydGljZXNcclxuICAgICAgICBpZiAodmVydHMubGVuZ3RoIDwgMikgY29udGludWVcclxuICAgICAgICBjb25zdCBzdGFydE0gPSB2ZXJ0c1swXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgZW5kTSA9IHZlcnRzW3ZlcnRzLmxlbmd0aCAtIDFdW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCB0b3RhbExlbiA9IE1hdGguYWJzKGVuZE0gLSBzdGFydE0pXHJcbiAgICAgICAgaWYgKHRvdGFsTGVuIDwgMC4xKSBjb250aW51ZVxyXG5cclxuICAgICAgICBjb25zdCBudW1TZWdzID0gTWF0aC5jZWlsKHRvdGFsTGVuIC8gMC41KVxyXG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgbnVtU2VnczsgcysrKSB7XHJcbiAgICAgICAgICBjb25zdCBmcm9tTSA9IHN0YXJ0TSArIHMgKiAwLjVcclxuICAgICAgICAgIGNvbnN0IHRvTSA9IE1hdGgubWluKHN0YXJ0TSArIChzICsgMSkgKiAwLjUsIGVuZE0pXHJcbiAgICAgICAgICBjb25zdCBtaWRNID0gKGZyb21NICsgdG9NKSAvIDJcclxuICAgICAgICAgIGNvbnN0IG1LZXkgPSBNYXRoLnJvdW5kKG1pZE0gKiAyKSAvIDJcclxuXHJcbiAgICAgICAgICBjb25zdCByb3V0ZU1hcCA9IGV2ZW50TG9va3VwLmdldChyaWQpXHJcbiAgICAgICAgICBjb25zdCBzZWdBdHRycyA9IHJvdXRlTWFwPy5nZXQobUtleSkgfHwge31cclxuXHJcbiAgICAgICAgICBsZXQgY29tcG9zaXRlU2NvcmUgPSAxLjBcclxuICAgICAgICAgIGNvbnN0IHNlZ0ZhY3RvcnM6IHN0cmluZ1tdID0gW11cclxuICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHNlZ0F0dHJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBsYXllck5hbWUgPSBrZXkuc3BsaXQoJzo6JylbMF1cclxuICAgICAgICAgICAgY29uc3QgbWFwcGluZyA9IG1vZGVsLmxyc01hcHBpbmdbbGF5ZXJOYW1lXVxyXG4gICAgICAgICAgICBpZiAoIW1hcHBpbmcpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGxldCB3ZWlnaHQgPSAxLjBcclxuICAgICAgICAgICAgaWYgKG1hcHBpbmcuY3VzdG9tV2VpZ2h0cykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWwgPSB2YWx1ZS5yZXBsYWNlKC9bXjAtOS5dL2csICcnKS5zcGxpdCgnLicpWzBdXHJcbiAgICAgICAgICAgICAgd2VpZ2h0ID0gbWFwcGluZy5jdXN0b21XZWlnaHRzW25vcm1hbGl6ZWRWYWxdIHx8IG1hcHBpbmcuY3VzdG9tV2VpZ2h0c1t2YWx1ZV0gfHwgMS4wXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWFwcGluZy52YWx1ZU1hcCkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZENvbmRpdGlvbiA9IG1hcHBpbmcudmFsdWVNYXBbdmFsdWVdXHJcbiAgICAgICAgICAgICAgaWYgKG1hcHBlZENvbmRpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVDYXRlZ29yeSA9IChtb2RlbCBhcyBhbnkpW21hcHBpbmcuc3RhdGVGaWVsZF1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZUNhdGVnb3J5ICYmIHN0YXRlQ2F0ZWdvcnlbbWFwcGVkQ29uZGl0aW9uXSkge1xyXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQgPSBzdGF0ZUNhdGVnb3J5W21hcHBlZENvbmRpdGlvbl0ud2VpZ2h0XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3ZWlnaHQgIT09IDEuMCkge1xyXG4gICAgICAgICAgICAgIGNvbXBvc2l0ZVNjb3JlICo9IHdlaWdodFxyXG4gICAgICAgICAgICAgIGlmICh3ZWlnaHQgPiAxLjIpIHNlZ0ZhY3RvcnMucHVzaChgJHtsYXllck5hbWV9OiAke3ZhbHVlfSAoJHt3ZWlnaHQudG9GaXhlZCgxKX14KWApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCByaXNrU2NvcmUgPSBNYXRoLm1pbihNYXRoLnJvdW5kKE1hdGgubG9nKGNvbXBvc2l0ZVNjb3JlICsgMSkgKiA0MCksIDEwMClcclxuXHJcbiAgICAgICAgICAvLyBCdWlsZCBwYXRoXHJcbiAgICAgICAgICBjb25zdCBwYXRoOiBudW1iZXJbXVtdID0gW11cclxuICAgICAgICAgIGZvciAoY29uc3QgdiBvZiB2ZXJ0cykge1xyXG4gICAgICAgICAgICBjb25zdCB2bSA9IHZbcmQubUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBpZiAodm0gPj0gZnJvbU0gJiYgdm0gPD0gdG9NKSBwYXRoLnB1c2goW3ZbMF0sIHZbMV1dKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHBhdGgubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG0xID0gdmVydHNbaV1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgICAgICAgIGNvbnN0IG0yID0gdmVydHNbaSArIDFdW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICAgICAgICBpZiAobTEgPD0gZnJvbU0gJiYgbTIgPj0gZnJvbU0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSAoZnJvbU0gLSBtMSkgLyAobTIgLSBtMSB8fCAxKVxyXG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKFt2ZXJ0c1tpXVswXSArIHQgKiAodmVydHNbaSArIDFdWzBdIC0gdmVydHNbaV1bMF0pLCB2ZXJ0c1tpXVsxXSArIHQgKiAodmVydHNbaSArIDFdWzFdIC0gdmVydHNbaV1bMV0pXSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKG0xIDw9IHRvTSAmJiBtMiA+PSB0b00pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSAodG9NIC0gbTEpIC8gKG0yIC0gbTEgfHwgMSlcclxuICAgICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydHNbaV1bMF0gKyB0ICogKHZlcnRzW2kgKyAxXVswXSAtIHZlcnRzW2ldWzBdKSwgdmVydHNbaV1bMV0gKyB0ICogKHZlcnRzW2kgKyAxXVsxXSAtIHZlcnRzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPCAyKSBjb250aW51ZVxyXG5cclxuICAgICAgICAgIGNvbnN0IHJpc2tMZXZlbCA9IHJpc2tTY29yZSA+PSA3NSA/ICdIaWdoJyA6IHJpc2tTY29yZSA+PSA0MCA/ICdNZWRpdW0nIDogcmlza1Njb3JlID4gMCA/ICdMb3cnIDogJ01pbmltYWwnXHJcbiAgICAgICAgICBzZWdtZW50cy5wdXNoKHsgcm91dGVJZDogcmlkLCBmcm9tTSwgdG9NLCBwYXRoLCByaXNrU2NvcmUsIHJpc2tMZXZlbCwgY29udHJpYnV0aW5nRmFjdG9yczogc2VnRmFjdG9ycyB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlZ21lbnRzIGdlbmVyYXRlZC4nKVxyXG5cclxuICAgICAgLy8gU3RvcmUgbW9kZWwgaW5mb1xyXG4gICAgICBjb25zdCB3ZWlnaHRzU3VtbWFyeTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgbnVtYmVyPj4gPSB7fVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiBzZWcuY29udHJpYnV0aW5nRmFjdG9ycykge1xyXG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBmLm1hdGNoKC9eKC4rPyk6ICguKz8pIFxcKCguKz8peFxcKSQvKVxyXG4gICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGlmICghd2VpZ2h0c1N1bW1hcnlbbWF0Y2hbMV1dKSB3ZWlnaHRzU3VtbWFyeVttYXRjaFsxXV0gPSB7fVxyXG4gICAgICAgICAgICB3ZWlnaHRzU3VtbWFyeVttYXRjaFsxXV1bbWF0Y2hbMl1dID0gcGFyc2VGbG9hdChtYXRjaFszXSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2V0TW9kZWxJbmZvKHsgd2VpZ2h0czogd2VpZ2h0c1N1bW1hcnksIHRvdGFsQ3Jhc2hlczogbW9kZWwudG90YWxDcmFzaGVzLCB5ZWFyczogbW9kZWwueWVhcnMgfSlcclxuXHJcbiAgICAgIC8vIFN0ZXAgNDogVXBsb2FkXHJcbiAgICAgIHNldFByb2dyZXNzKCdVcGxvYWRpbmcgc3RhdGUgTUwgcHJlZGljdGlvbiBsYXllci4uLicpXHJcbiAgICAgIGNvbnN0IGNvbnRlbnRVcmwgPSBgJHtwb3J0YWxVcmx9L3NoYXJpbmcvcmVzdC9jb250ZW50L3VzZXJzLyR7dXNlcm5hbWV9YFxyXG4gICAgICBjb25zdCBmb2xkZXJVcmwgPSBzZWxlY3RlZEZvbGRlcklkID8gYCR7Y29udGVudFVybH0vJHtzZWxlY3RlZEZvbGRlcklkfWAgOiBjb250ZW50VXJsXHJcbiAgICAgIGNvbnN0IHNlcnZpY2VOYW1lID0gYFN0YXRlTUxfQ3Jhc2hSaXNrXyR7RGF0ZS5ub3coKX1gXHJcblxyXG4gICAgICBjb25zdCBmaWVsZHMgPSBbXHJcbiAgICAgICAgeyBuYW1lOiAnT0JKRUNUSUQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZU9JRCcsIGFsaWFzOiAnT2JqZWN0SUQnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncm91dGVpZCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdSb3V0ZSBJRCcsIGxlbmd0aDogMTAwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnZnJvbV9tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ0Zyb20gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICd0b19tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ1RvIE1lYXN1cmUnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19zY29yZScsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnUmlzayBTY29yZSAoMC0xMDApJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfbGV2ZWwnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUmlzayBMZXZlbCcsIGxlbmd0aDogMjAgfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250cmlidXRpbmdfZmFjdG9ycycsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdDb250cmlidXRpbmcgRmFjdG9ycycsIGxlbmd0aDogNTAwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnbW9kZWxfY29uZmlkZW5jZScsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdNb2RlbCBDb25maWRlbmNlJywgbGVuZ3RoOiA1MCB9XHJcbiAgICAgIF1cclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdjcmVhdGVQYXJhbWV0ZXJzJywgSlNPTi5zdHJpbmdpZnkoeyBuYW1lOiBzZXJ2aWNlTmFtZSwgc2VydmljZURlc2NyaXB0aW9uOiAnQ3Jhc2ggcmlzayBmcm9tIE5ZIHN0YXRlIGNyYXNoIGRhdGFiYXNlIE1MIG1vZGVsJywgaGFzU3RhdGljRGF0YTogZmFsc2UsIG1heFJlY29yZENvdW50OiAxMDAwMCwgc3VwcG9ydGVkUXVlcnlGb3JtYXRzOiAnSlNPTicsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcnLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSwgaW5pdGlhbEV4dGVudDogeyB4bWluOiAtMjAwMzc1MDgsIHltaW46IC0yMDAzNzUwOCwgeG1heDogMjAwMzc1MDgsIHltYXg6IDIwMDM3NTA4LCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LCBhbGxvd0dlb21ldHJ5VXBkYXRlczogdHJ1ZSB9KSlcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgndGFyZ2V0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ291dHB1dFR5cGUnLCAnZmVhdHVyZVNlcnZpY2UnKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBpZiAoc2VsZWN0ZWRGb2xkZXJJZCkgY3JlYXRlUGFyYW1zLmFwcGVuZCgnZm9sZGVySWQnLCBzZWxlY3RlZEZvbGRlcklkKVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUmVzcCA9IGF3YWl0IGZldGNoKGAke2ZvbGRlclVybH0vY3JlYXRlU2VydmljZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGNyZWF0ZVBhcmFtcyB9KVxyXG4gICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCBjcmVhdGVSZXNwLmpzb24oKVxyXG4gICAgICBpZiAoIWNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlcnZpY2U6ICcgKyBKU09OLnN0cmluZ2lmeShjcmVhdGVSZXN1bHQpKVxyXG4gICAgICBjb25zdCBzZXJ2aWNlVXJsID0gY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMXHJcbiAgICAgIGNvbnN0IHRlbXBJdGVtSWQgPSBjcmVhdGVSZXN1bHQuaXRlbUlkXHJcblxyXG4gICAgICBjb25zdCBhZG1pblVybCA9IHNlcnZpY2VVcmwucmVwbGFjZSgnL3Jlc3Qvc2VydmljZXMvJywgJy9yZXN0L2FkbWluL3NlcnZpY2VzLycpXHJcbiAgICAgIGNvbnN0IGFkZERlZlBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdhZGRUb0RlZmluaXRpb24nLCBKU09OLnN0cmluZ2lmeSh7IGxheWVyczogW3sgaWQ6IDAsIG5hbWU6ICdTdGF0ZSBNTCBSaXNrJywgdHlwZTogJ0ZlYXR1cmUgTGF5ZXInLCBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2x5bGluZScsIGRpc3BsYXlGaWVsZDogJ3JvdXRlaWQnLCBmaWVsZHMsIG9iamVjdElkRmllbGQ6ICdPQkpFQ1RJRCcsIGhhc0F0dGFjaG1lbnRzOiBmYWxzZSwgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZyxDcmVhdGUsVXBkYXRlLERlbGV0ZScgfV0gfSkpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2FkbWluVXJsfS9hZGRUb0RlZmluaXRpb25gLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGREZWZQYXJhbXMgfSlcclxuXHJcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gc2VnbWVudHMuZmlsdGVyKHMgPT4gcy5yaXNrU2NvcmUgPiAwKS5tYXAoc2VnID0+ICh7XHJcbiAgICAgICAgZ2VvbWV0cnk6IHsgcGF0aHM6IFtzZWcucGF0aF0sIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sXHJcbiAgICAgICAgYXR0cmlidXRlczogeyByb3V0ZWlkOiBzZWcucm91dGVJZCwgZnJvbV9tOiBzZWcuZnJvbU0sIHRvX206IHNlZy50b00sIHJpc2tfc2NvcmU6IHNlZy5yaXNrU2NvcmUsIHJpc2tfbGV2ZWw6IHNlZy5yaXNrTGV2ZWwsIGNvbnRyaWJ1dGluZ19mYWN0b3JzOiBzZWcuY29udHJpYnV0aW5nRmFjdG9ycy5qb2luKCc7ICcpLCBtb2RlbF9jb25maWRlbmNlOiBgSGlnaCAoJHttb2RlbC50b3RhbENyYXNoZXMudG9Mb2NhbGVTdHJpbmcoKX0gdHJhaW5pbmcgY3Jhc2hlcylgIH1cclxuICAgICAgfSkpXHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSArPSAxMDAwKSB7XHJcbiAgICAgICAgY29uc3QgYmF0Y2ggPSBmZWF0dXJlcy5zbGljZShpLCBpICsgMTAwMClcclxuICAgICAgICBzZXRQcm9ncmVzcyhgVXBsb2FkaW5nLi4uICR7TWF0aC5taW4oaSArIDEwMDAsIGZlYXR1cmVzLmxlbmd0aCl9LyR7ZmVhdHVyZXMubGVuZ3RofWApXHJcbiAgICAgICAgY29uc3QgYWRkRmVhdFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmZWF0dXJlcycsIEpTT04uc3RyaW5naWZ5KGJhdGNoKSlcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgICBhd2FpdCBmZXRjaChgJHtzZXJ2aWNlVXJsfS8wL2FkZEZlYXR1cmVzYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRmVhdFBhcmFtcyB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaGFyZVxyXG4gICAgICBjb25zdCBzaGFyZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2V2ZXJ5b25lJywgJ2ZhbHNlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdvcmcnLCAndHJ1ZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnaXRlbXMnLCB0ZW1wSXRlbUlkKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7Y29udGVudFVybH0vaXRlbXMvJHt0ZW1wSXRlbUlkfS9zaGFyZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IHNoYXJlUGFyYW1zIH0pXHJcblxyXG4gICAgICBzZXRQcm9ncmVzcygnRGlzcGxheWluZyBvbiBtYXAuLi4nKVxyXG4gICAgICBhd2FpdCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwKGAke3NlcnZpY2VVcmx9LzBgLCB0b2tlbiwgd2tpZClcclxuICAgICAgc2V0UmVzdWx0KHsgbGF5ZXJVcmw6IHNlcnZpY2VVcmwsIGl0ZW1Vcmw6IGAke3BvcnRhbFVybH0vaG9tZS9pdGVtLmh0bWw/aWQ9JHt0ZW1wSXRlbUlkfWAgfSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdbU3RhdGVNTF0gRmFpbGVkOicsIGVycilcclxuICAgICAgc2V0RXJyb3IoJ01MIHByZWRpY3Rpb24gZmFpbGVkOiAnICsgKGVyci5tZXNzYWdlIHx8IGVycikpXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0UnVubmluZyhmYWxzZSlcclxuICAgIH1cclxuICB9LCBbY29uZmlnLCBxdWVyeUV2ZW50RGF0YSwgc2VsZWN0ZWRGb2xkZXJJZCwgZGlzcGxheVByZWRpY3Rpb25Pbk1hcF0pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFJFTkRFUiA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCByb3V0ZVNlbGVjdGlvblVJID0gKCkgPT4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTJweCcsIGJhY2tncm91bmQ6ICcjZjhmOWZhJywgYm9yZGVyUmFkaXVzOiAnNnB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMGUwZTAnIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCwgbWFyZ2luQm90dG9tOiAnOHB4JywgY29sb3I6ICcjMzMzJyB9fT5TZWxlY3QgUm91dGVzPC9kaXY+XHJcblxyXG4gICAgICB7LyogU2VhcmNoIG1vZGUgdGFicyAqL31cclxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzRweCcsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoTW9kZSgnaWQnKX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCcsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlcjogc2VhcmNoTW9kZSA9PT0gJ2lkJyA/ICcycHggc29saWQgIzAwNzljMScgOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzZWFyY2hNb2RlID09PSAnaWQnID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJyB9fT5CeSBSb3V0ZSBJRDwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaE1vZGUoJ25hbWUnKX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCcsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlcjogc2VhcmNoTW9kZSA9PT0gJ25hbWUnID8gJzJweCBzb2xpZCAjMDA3OWMxJyA6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNlYXJjaE1vZGUgPT09ICduYW1lJyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicgfX0+QnkgTmFtZTwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaE1vZGUoJ21hcCcpfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4JywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyOiBzZWFyY2hNb2RlID09PSAnbWFwJyA/ICcycHggc29saWQgIzAwNzljMScgOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzZWFyY2hNb2RlID09PSAnbWFwJyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicgfX0+RHJhdyBBcmVhPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgey8qIFJvdXRlIElEIC8gTmFtZSBzZWFyY2ggKi99XHJcbiAgICAgIHsoc2VhcmNoTW9kZSA9PT0gJ2lkJyB8fCBzZWFyY2hNb2RlID09PSAnbmFtZScpICYmIChcclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzRweCcsIG1hcmdpbkJvdHRvbTogJzRweCcgfX0+XHJcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPXtzZWFyY2hNb2RlID09PSAnaWQnID8gcm91dGVJZCA6IHJvdXRlTmFtZX0gb25DaGFuZ2U9e2UgPT4gaGFuZGxlUm91dGVTZWFyY2goZS50YXJnZXQudmFsdWUpfSBwbGFjZWhvbGRlcj17c2VhcmNoTW9kZSA9PT0gJ2lkJyA/ICdSb3V0ZSBJRC4uLicgOiAnUm91dGUgbmFtZS4uLid9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc2cHggOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnIH19IC8+XHJcbiAgICAgICAgICAgIHtoYXNNYXBXaWRnZXQgJiYgKFxyXG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3BpY2tpbmdGcm9tTWFwID8gY2FuY2VsUGlja0Zyb21NYXAgOiBzdGFydFBpY2tGcm9tTWFwfSBzdHlsZT17eyBwYWRkaW5nOiAnNnB4IDEwcHgnLCBib3JkZXI6ICcxcHggc29saWQgIzAwNzljMScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHBpY2tpbmdGcm9tTWFwID8gJyMwMDc5YzEnIDogJyNmZmYnLCBjb2xvcjogcGlja2luZ0Zyb21NYXAgPyAnI2ZmZicgOiAnIzAwNzljMScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzExcHgnIH19PlxyXG4gICAgICAgICAgICAgICAge3BpY2tpbmdGcm9tTWFwID8gJ0NhbmNlbCcgOiAnUGljayd9XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogQXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zICovfVxyXG4gICAgICAgICAge3Nob3dTdWdnZXN0aW9ucyAmJiByb3V0ZVN1Z2dlc3Rpb25zLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgbWF4SGVpZ2h0OiAnMTAwcHgnLCBvdmVyZmxvdzogJ2F1dG8nLCBiYWNrZ3JvdW5kOiAnI2ZmZicgfX0+XHJcbiAgICAgICAgICAgICAge3JvdXRlU3VnZ2VzdGlvbnMubWFwKChyLCBpKSA9PiAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gb25DbGljaz17KCkgPT4gc2VsZWN0Um91dGUocil9IHN0eWxlPXt7IHBhZGRpbmc6ICc0cHggOHB4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZWVlJyB9fSBvbk1vdXNlT3Zlcj17ZSA9PiAoZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmQgPSAnI2YwZjBmMCcpfSBvbk1vdXNlT3V0PXtlID0+IChlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZCA9ICcjZmZmJyl9PlxyXG4gICAgICAgICAgICAgICAgICB7ci5yb3V0ZUlkfSB7ci5yb3V0ZU5hbWUgPyBgKCR7ci5yb3V0ZU5hbWV9KWAgOiAnJ31cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgey8qIFJvdXRlIHBpY2sgZGlzYW1iaWd1YXRpb24gKi99XHJcbiAgICAgICAgICB7cm91dGVQaWNrQ2FuZGlkYXRlcyAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBwYWRkaW5nOiAnOHB4JywgYmFja2dyb3VuZDogJyNlOGY0ZmQnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgZm9udFdlaWdodDogNjAwLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19Pk11bHRpcGxlIHJvdXRlcyBmb3VuZCDigJQgc2VsZWN0IG9uZTo8L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1heEhlaWdodDogJzE0MHB4Jywgb3ZlcmZsb3c6ICdhdXRvJyB9fT5cclxuICAgICAgICAgICAgICAgIHtyb3V0ZVBpY2tDYW5kaWRhdGVzLm1hcCgoYywgaSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGtleT17aX0gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0Um91dGVJZChjLnJvdXRlSWQpOyBzZXRSb3V0ZU5hbWUoYy5yb3V0ZU5hbWUpOyBzZXRSb3V0ZVBpY2tDYW5kaWRhdGVzKG51bGwpOyBmZXRjaFJvdXRlTWVhc3VyZXMoYy5yb3V0ZUlkKSB9fSBvbk1vdXNlRW50ZXI9eygpID0+IHsgc2hvd1JvdXRlUHJldmlld1JlZi5jdXJyZW50KGMucm91dGVJZCkgfX0gb25Nb3VzZUxlYXZlPXsoKSA9PiB7IGNsZWFyUm91dGVQcmV2aWV3KCkgfX0gc3R5bGU9e3sgZGlzcGxheTogJ2Jsb2NrJywgd2lkdGg6ICcxMDAlJywgdGV4dEFsaWduOiAnbGVmdCcsIHBhZGRpbmc6ICc2cHggMTBweCcsIG1hcmdpbkJvdHRvbTogJzNweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZGRkJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEycHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDUwMCB9fT57Yy5yb3V0ZU5hbWV9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIHtjLnJvdXRlTmFtZSAhPT0gYy5yb3V0ZUlkICYmIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnIzg4OCcsIG1hcmdpbkxlZnQ6ICc4cHgnIH19PntjLnJvdXRlSWR9PC9zcGFuPn1cclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIHsvKiBNZWFzdXJlIHJhbmdlIGlucHV0cyAqL31cclxuICAgICAgICAgIHtyb3V0ZUlkICYmIHJvdXRlTWVhc3VyZVJhbmdlICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICc4cHgnLCBwYWRkaW5nOiAnOHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2UwZTBlMCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBtYXJnaW5Cb3R0b206ICc2cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMzMzMnIH19Pk1lYXN1cmUgUmFuZ2U8L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IHNldEZyb21NZWFzdXJlKHJvdXRlTWVhc3VyZVJhbmdlLm1pbi50b0ZpeGVkKDMpKTsgc2V0VG9NZWFzdXJlKHJvdXRlTWVhc3VyZVJhbmdlLm1heC50b0ZpeGVkKDMpKTsgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCdmcm9tJywgcm91dGVNZWFzdXJlUmFuZ2UubWluLnRvRml4ZWQoMykpOyBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgcm91dGVNZWFzdXJlUmFuZ2UubWF4LnRvRml4ZWQoMykpIH19IHN0eWxlPXt7IHBhZGRpbmc6ICczcHggOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICczcHgnLCBiYWNrZ3JvdW5kOiAnI2U4ZjRmZCcsIGNvbG9yOiAnIzAwNzljMScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEwcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+V2hvbGUgUm91dGU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgey8qIEZyb20gbWVhc3VyZSAqL31cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8bGFiZWwgc3R5bGU9e3sgZm9udFNpemU6ICcxMHB4JywgY29sb3I6ICcjNjY2JywgZGlzcGxheTogJ2Jsb2NrJywgbWFyZ2luQm90dG9tOiAnMnB4JyB9fT5Gcm9te3JvdXRlTWVhc3VyZVJhbmdlID8gPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjYWFhJywgbWFyZ2luTGVmdDogJzRweCcgfX0+KHtyb3V0ZU1lYXN1cmVSYW5nZS5taW4udG9GaXhlZCgzKX0pPC9zcGFuPiA6IG51bGx9PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBpZiAocGlja2luZ01lYXN1cmUgPT09ICdmcm9tJykgY2FuY2VsUGlja01lYXN1cmUoKTsgZWxzZSBzdGFydFBpY2tNZWFzdXJlKCdmcm9tJykgfX0gdGl0bGU9e3BpY2tpbmdNZWFzdXJlID09PSAnZnJvbScgPyAnQ2FuY2VsJyA6ICdQaWNrIGZyb20gbWFwJ30gc3R5bGU9e3sgd2lkdGg6ICcyOHB4JywgaGVpZ2h0OiAnMjhweCcsIHBhZGRpbmc6IDAsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiBwaWNraW5nTWVhc3VyZSA9PT0gJ2Zyb20nID8gJyNmZmYzZTAnIDogJyNmZmYnLCBmbGV4U2hyaW5rOiAwLCBmb250U2l6ZTogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHtwaWNraW5nTWVhc3VyZSA9PT0gJ2Zyb20nID8gJ1xcdTIzMTYnIDogJ1xcdTIxQTUnfVxyXG4gICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJudW1iZXJcIiB2YWx1ZT17ZnJvbU1lYXN1cmV9IG9uQ2hhbmdlPXtlID0+IHNldEZyb21NZWFzdXJlKGUudGFyZ2V0LnZhbHVlKX0gb25CbHVyPXsoKSA9PiB7IGlmIChmcm9tTWVhc3VyZSkgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCdmcm9tJywgZnJvbU1lYXN1cmUpIH19IG9uS2V5RG93bj17ZSA9PiB7IGlmIChlLmtleSA9PT0gJ0VudGVyJyAmJiBmcm9tTWVhc3VyZSkgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCdmcm9tJywgZnJvbU1lYXN1cmUpIH19IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHggOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnIH19IHBsYWNlaG9sZGVyPXtyb3V0ZU1lYXN1cmVSYW5nZSA/IHJvdXRlTWVhc3VyZVJhbmdlLm1pbi50b0ZpeGVkKDMpIDogJ1N0YXJ0J30gLz5cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICB7LyogVG8gbWVhc3VyZSAqL31cclxuICAgICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIGNvbG9yOiAnIzY2NicsIGRpc3BsYXk6ICdibG9jaycsIG1hcmdpbkJvdHRvbTogJzJweCcgfX0+VG97cm91dGVNZWFzdXJlUmFuZ2UgPyA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyNhYWEnLCBtYXJnaW5MZWZ0OiAnNHB4JyB9fT4oe3JvdXRlTWVhc3VyZVJhbmdlLm1heC50b0ZpeGVkKDMpfSk8L3NwYW4+IDogbnVsbH08L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IGlmIChwaWNraW5nTWVhc3VyZSA9PT0gJ3RvJykgY2FuY2VsUGlja01lYXN1cmUoKTsgZWxzZSBzdGFydFBpY2tNZWFzdXJlKCd0bycpIH19IHRpdGxlPXtwaWNraW5nTWVhc3VyZSA9PT0gJ3RvJyA/ICdDYW5jZWwnIDogJ1BpY2sgZnJvbSBtYXAnfSBzdHlsZT17eyB3aWR0aDogJzI4cHgnLCBoZWlnaHQ6ICcyOHB4JywgcGFkZGluZzogMCwgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInLCBiYWNrZ3JvdW5kQ29sb3I6IHBpY2tpbmdNZWFzdXJlID09PSAndG8nID8gJyNmZmYzZTAnIDogJyNmZmYnLCBmbGV4U2hyaW5rOiAwLCBmb250U2l6ZTogJzE0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIHtwaWNraW5nTWVhc3VyZSA9PT0gJ3RvJyA/ICdcXHUyMzE2JyA6ICdcXHUyMUE1J31cclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgdmFsdWU9e3RvTWVhc3VyZX0gb25DaGFuZ2U9e2UgPT4gc2V0VG9NZWFzdXJlKGUudGFyZ2V0LnZhbHVlKX0gb25CbHVyPXsoKSA9PiB7IGlmICh0b01lYXN1cmUpIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgndG8nLCB0b01lYXN1cmUpIH19IG9uS2V5RG93bj17ZSA9PiB7IGlmIChlLmtleSA9PT0gJ0VudGVyJyAmJiB0b01lYXN1cmUpIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgndG8nLCB0b01lYXN1cmUpIH19IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHggOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnIH19IHBsYWNlaG9sZGVyPXtyb3V0ZU1lYXN1cmVSYW5nZSA/IHJvdXRlTWVhc3VyZVJhbmdlLm1heC50b0ZpeGVkKDMpIDogJ0VuZCd9IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qIERyYXcgcG9seWdvbiBtb2RlICovfVxyXG4gICAgICB7c2VhcmNoTW9kZSA9PT0gJ21hcCcgJiYgKFxyXG4gICAgICAgIDxkaXY+XHJcbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtzdGFydERyYXdBcmVhfSBkaXNhYmxlZD17ZHJhd2luZ30gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogZHJhd2luZyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY29sb3I6ICcjMDA3OWMxJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDUwMCB9fT5cclxuICAgICAgICAgICAge2RyYXdpbmcgPyAnRHJhd2luZy4uLiBjbGljayB0byBjb21wbGV0ZScgOiBgRHJhdyBQb2x5Z29uIG9uIE1hcCR7bWFwUm91dGVzLmxlbmd0aCA+IDAgPyBgICgke21hcFJvdXRlcy5sZW5ndGh9IHJvdXRlcyBmb3VuZClgIDogJyd9YH1cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAge21hcFJvdXRlcy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICc2cHgnLCBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyMzMzMnIH19PlxyXG4gICAgICAgICAgICAgIDxzdHJvbmc+e3NlbGVjdGVkTWFwUm91dGVJZHMuc2l6ZX08L3N0cm9uZz4gb2Yge21hcFJvdXRlcy5sZW5ndGh9IHJvdXRlcyBzZWxlY3RlZFxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcblxyXG4gIC8vIFJlc3VsdCB2aWV3XHJcbiAgY29uc3QgcmVzdWx0VUkgPSAoKSA9PiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMnB4JyB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyB0ZXh0QWxpZ246ICdjZW50ZXInLCBtYXJnaW5Cb3R0b206ICcxMnB4JyB9fT5cclxuICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzM2cHgnIH19PnsnXFx1MjcwNSd9PC9zcGFuPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgPHAgc3R5bGU9e3sgZm9udFNpemU6ICcxM3B4JywgY29sb3I6ICcjMzMzJywgdGV4dEFsaWduOiAnY2VudGVyJywgbWFyZ2luOiAnMCAwIDEycHgnIH19PlxyXG4gICAgICAgIFByZWRpY3Rpb24gY29tcGxldGUhIFJpc2sgbGF5ZXIgYWRkZWQgdG8gbWFwLlxyXG4gICAgICA8L3A+XHJcblxyXG4gICAgICB7LyogTGVnZW5kICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4JywgYmFja2dyb3VuZDogJyNmNWY1ZjUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICcxMnB4JyB9fT5cclxuICAgICAgICB7W3sgY29sb3I6ICcjMzg4ZTNjJywgd2lkdGg6IDMsIGxhYmVsOiAnTG93ICgxLTI1KScgfSwgeyBjb2xvcjogJyNmYmMwMmQnLCB3aWR0aDogMywgbGFiZWw6ICdNZWRpdW0gKDI2LTUwKScgfSwgeyBjb2xvcjogJyNmNTdjMDAnLCB3aWR0aDogNCwgbGFiZWw6ICdNZWRpdW0tSGlnaCAoNTEtNzUpJyB9LCB7IGNvbG9yOiAnI2QzMmYyZicsIHdpZHRoOiA1LCBsYWJlbDogJ0hpZ2ggKDc2LTEwMCknIH1dLm1hcCgoaXRlbSwgaSkgPT4gKFxyXG4gICAgICAgICAgPGRpdiBrZXk9e2l9IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzZweCcsIG1hcmdpbkJvdHRvbTogaSA8IDMgPyAnNHB4JyA6IDAgfX0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgd2lkdGg6ICcyMHB4JywgaGVpZ2h0OiBgJHtpdGVtLndpZHRofXB4YCwgYmFja2dyb3VuZDogaXRlbS5jb2xvciB9fSAvPlxyXG4gICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnIH19PntpdGVtLmxhYmVsfTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICkpfVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHtyZXN1bHQ/Lml0ZW1VcmwgJiYgPGEgaHJlZj17cmVzdWx0Lml0ZW1Vcmx9IHRhcmdldD1cIl9ibGFua1wiIHJlbD1cIm5vb3BlbmVyIG5vcmVmZXJyZXJcIiBzdHlsZT17eyBkaXNwbGF5OiAnYmxvY2snLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBmb250U2l6ZTogJzEycHgnLCBjb2xvcjogJyMwMDc5YzEnLCBtYXJnaW5Cb3R0b206ICcxMnB4JyB9fT5PcGVuIGluIFBvcnRhbDwvYT59XHJcblxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZ2FwOiAnOHB4JywganVzdGlmeUNvbnRlbnQ6ICdjZW50ZXInIH19PlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dFeHBsYW5hdGlvbighc2hvd0V4cGxhbmF0aW9uKX0gc3R5bGU9e3sgcGFkZGluZzogJzhweCAxNnB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM2YTFiOWEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzaG93RXhwbGFuYXRpb24gPyAnI2YzZTVmNScgOiAnI2ZmZicsIGNvbG9yOiAnIzZhMWI5YScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICB7c2hvd0V4cGxhbmF0aW9uID8gJ0hpZGUnIDogJ1doeT8nfVxyXG4gICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0TW9kZSgnY2hvb3NlJyk7IHNldFJlc3VsdChudWxsKTsgc2V0UHJvZ3Jlc3MoJycpOyBzZXRTaG93RXhwbGFuYXRpb24oZmFsc2UpIH19IHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMjBweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnIzZhMWI5YScsIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+RG9uZTwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBFeHBsYW5hdGlvbiBwYW5lbCAqL31cclxuICAgICAge3Nob3dFeHBsYW5hdGlvbiAmJiBtb2RlID09PSAnYWknICYmIGZhY3RvcnMgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnMTJweCcsIHBhZGRpbmc6ICcxMnB4JywgYmFja2dyb3VuZDogJyNmOGY5ZmEnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCBmb250U2l6ZTogJzExcHgnLCBtYXhIZWlnaHQ6ICcyNTBweCcsIG92ZXJmbG93WTogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA3MDAsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+UmlzayBGYWN0b3IgQW5hbHlzaXM8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgS2VybmVsLWRlbnNpdHkgc2NvcmluZyAocmFkaXVzOiB7ZmFjdG9ycy5rZXJuZWxSYWRpdXN9IHNlZ21lbnRzKS4gU2VnbWVudHM6IHtmYWN0b3JzLnRvdGFsU2VnbWVudHN9IHRvdGFsLCB7ZmFjdG9ycy5zZWdtZW50c1dpdGhDcmFzaGVzfSB3aXRoIGNyYXNoZXMsIHtmYWN0b3JzLmhpZ2hSaXNrQ291bnR9IGhpZ2gtcmlzay5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAge2ZhY3RvcnMudG9wSGlnaFJpc2tTZWdtZW50cz8ubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPHN0cm9uZz5Ub3AgSGlnaC1SaXNrIFNlZ21lbnRzOjwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJywgZm9udFNpemU6ICcxMHB4JywgbWFyZ2luVG9wOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDx0aGVhZD48dHIgc3R5bGU9e3sgYmFja2dyb3VuZDogJyNlZWUnIH19Pjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAnbGVmdCcgfX0+Um91dGU8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19Pk1pbGVzPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5DcmFzaGVzPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5TY29yZTwvdGg+PC90cj48L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRib2R5PntmYWN0b3JzLnRvcEhpZ2hSaXNrU2VnbWVudHMuc2xpY2UoMCwgNSkubWFwKChzOiBhbnksIGk6IG51bWJlcikgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8dHIga2V5PXtpfT48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnIH19PntzLnJvdXRlSWQ/LnN1YnN0cmluZygwLCAxNSl9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+e3MuZnJvbU0/LnRvRml4ZWQoMSl9LXtzLnRvTT8udG9GaXhlZCgxKX08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT57cy5jcmFzaENvdW50fTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnLCBjb2xvcjogJyNkMzJmMmYnLCBmb250V2VpZ2h0OiA3MDAgfX0+e3Mucmlza1Njb3JlfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgICAgICkpfTwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAge3Nob3dFeHBsYW5hdGlvbiAmJiBtb2RlID09PSAnbWwnICYmIG1vZGVsSW5mbyAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICcxMnB4JywgcGFkZGluZzogJzEycHgnLCBiYWNrZ3JvdW5kOiAnI2ZhZjVmYycsIGJvcmRlclJhZGl1czogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIG1heEhlaWdodDogJzI4MHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDcwMCwgbWFyZ2luQm90dG9tOiAnOHB4JywgY29sb3I6ICcjNGExNDhjJyB9fT5TdGF0ZSBEYXRhIE1vZGVsIEV4cGxhbmF0aW9uPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+TWV0aG9kOjwvc3Ryb25nPiBXZWlnaHQtb2YtRXZpZGVuY2Ugc2NvcmluZyBmcm9tIHttb2RlbEluZm8udG90YWxDcmFzaGVzPy50b0xvY2FsZVN0cmluZygpfSByZWFsIE5ZIHN0YXRlIGNyYXNoIHJlY29yZHMgKHttb2RlbEluZm8ueWVhcnN9KS4gRWFjaCByb2FkIGNvbmRpdGlvbiBnZXRzIGEgY3Jhc2ggbXVsdGlwbGllciBiYXNlZCBvbiBpdHMgc3RhdGlzdGljYWwgYXNzb2NpYXRpb24gd2l0aCBmYXRhbCBjcmFzaGVzLlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+dnMuIEFJIChEZW5zaXR5KTo8L3N0cm9uZz4gQUkgZmluZHMgZXhpc3RpbmcgaG90c3BvdHMuIE1MIHByZWRpY3RzIDxlbT5uZXc8L2VtPiByaXNrIGZyb20gcm9hZCBjaGFyYWN0ZXJpc3RpY3MgYWxvbmUg4oCUIGRhbmdlcm91cyBjb25kaXRpb25zIHdoZXJlIG5vIGNyYXNoZXMgaGF2ZSBiZWVuIHJlcG9ydGVkIHlldC5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAge09iamVjdC5rZXlzKG1vZGVsSW5mby53ZWlnaHRzIHx8IHt9KS5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8c3Ryb25nPlRvcCBSaXNrIE11bHRpcGxpZXJzIEZvdW5kOjwvc3Ryb25nPlxyXG4gICAgICAgICAgICAgIDx0YWJsZSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBib3JkZXJDb2xsYXBzZTogJ2NvbGxhcHNlJywgZm9udFNpemU6ICcxMHB4JywgbWFyZ2luVG9wOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDx0aGVhZD48dHIgc3R5bGU9e3sgYmFja2dyb3VuZDogJyNlZWUnIH19Pjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAnbGVmdCcgfX0+RmFjdG9yPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ2xlZnQnIH19PlZhbHVlPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5XZWlnaHQ8L3RoPjwvdHI+PC90aGVhZD5cclxuICAgICAgICAgICAgICAgIDx0Ym9keT57T2JqZWN0LmVudHJpZXMobW9kZWxJbmZvLndlaWdodHMpLmZsYXRNYXAoKFtmaWVsZCwgdmFsc106IFtzdHJpbmcsIGFueV0pID0+IE9iamVjdC5lbnRyaWVzKHZhbHMpLm1hcCgoW3ZhbCwgd106IFtzdHJpbmcsIGFueV0pID0+ICh7IGZpZWxkLCB2YWwsIHcgfSkpKS5maWx0ZXIoKHg6IGFueSkgPT4geC53ID4gMS4wKS5zb3J0KChhOiBhbnksIGI6IGFueSkgPT4gYi53IC0gYS53KS5zbGljZSgwLCAxMCkubWFwKCh4OiBhbnksIGk6IG51bWJlcikgPT4gKFxyXG4gICAgICAgICAgICAgICAgICA8dHIga2V5PXtpfT48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnIH19Pnt4LmZpZWxkfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgZm9udFdlaWdodDogNjAwIH19Pnt4LnZhbH08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JywgY29sb3I6IHgudyA+PSAyID8gJyNkMzJmMmYnIDogJyNmNTdjMDAnLCBmb250V2VpZ2h0OiA3MDAgfX0+e3gudy50b0ZpeGVkKDEpfXg8L3RkPjwvdHI+XHJcbiAgICAgICAgICAgICAgICApKX08L3Rib2R5PlxyXG4gICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnOHB4JywgcGFkZGluZzogJzZweCcsIGJhY2tncm91bmQ6ICcjZmZmM2NkJywgYm9yZGVyUmFkaXVzOiAnM3B4JywgZm9udFNpemU6ICcxMHB4JywgY29sb3I6ICcjODU2NDA0JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz5Ob3RlOjwvc3Ryb25nPiBTZWdtZW50cyB3aXRoIG11bHRpcGxlIGhpZ2gtd2VpZ2h0IGZhY3RvcnMgY29tcG91bmQgKG11bHRpcGx5KS4gQSBjdXJ2ZSArIGhpZ2ggc3BlZWQgKyBubyBzaG91bGRlciA9IHZlcnkgaGlnaCByaXNrIGV2ZW4gd2l0aCBubyBsb2NhbCBjcmFzaCBoaXN0b3J5LlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcblxyXG4gIC8vIFJ1bm5pbmcgc3RhdGUgVUlcclxuICBjb25zdCBydW5uaW5nVUkgPSAoKSA9PiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcyMHB4JywgdGV4dEFsaWduOiAnY2VudGVyJyB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM1NTUnLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19Pntwcm9ncmVzc308L2Rpdj5cclxuICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnI2UwZTBlMCcsIGJvcmRlclJhZGl1czogJzJweCcsIG92ZXJmbG93OiAnaGlkZGVuJyB9fT5cclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogJzEwMCUnLCBiYWNrZ3JvdW5kOiBtb2RlID09PSAnYWknID8gJyM3YjFmYTInIDogJyM2YTFiOWEnLCB3aWR0aDogJzYwJScsIGFuaW1hdGlvbjogJ3B1bHNlIDEuNXMgaW5maW5pdGUnIH19IC8+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBNQUlOIExBWU9VVCA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICByZXR1cm4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBoZWlnaHQ6ICcxMDAlJywgb3ZlcmZsb3c6ICdhdXRvJywgZm9udFNpemU6ICcxM3B4JywgcGFkZGluZzogJzEycHgnLCBib3hTaXppbmc6ICdib3JkZXItYm94JyB9fT5cclxuXHJcbiAgICAgIHtoYXNNYXBXaWRnZXQgJiYgKFxyXG4gICAgICAgIDxKaW11TWFwVmlld0NvbXBvbmVudCB1c2VNYXBXaWRnZXRJZD17KHByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpPy5bMF0gfHwgKHByb3BzLnVzZU1hcFdpZGdldElkcyBhcyBhbnkpPy5maXJzdD8uKCl9IG9uQWN0aXZlVmlld0NoYW5nZT17b25BY3RpdmVWaWV3Q2hhbmdlfSAvPlxyXG4gICAgICApfVxyXG5cclxuICAgICAgPGg1IHN0eWxlPXt7IG1hcmdpbjogJzAgMCAxMnB4JywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNjAwIH19PkNyYXNoIFJpc2sgUHJlZGljdGlvbiA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBmb250V2VpZ2h0OiA0MDAsIGNvbG9yOiAnIzk5OScgfX0+KHYyMDI2LjA1LjEzIDE5OjEyKTwvc3Bhbj48L2g1PlxyXG5cclxuICAgICAgey8qIEVycm9yIGRpc3BsYXkgKi99XHJcbiAgICAgIHtlcnJvciAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnLCBwYWRkaW5nOiAnOHB4IDEwcHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZWJlZScsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnI2M2MjgyOCcgfX0+XHJcbiAgICAgICAgICB7ZXJyb3J9XHJcbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRFcnJvcihudWxsKX0gc3R5bGU9e3sgZmxvYXQ6ICdyaWdodCcsIGJhY2tncm91bmQ6ICdub25lJywgYm9yZGVyOiAnbm9uZScsIGNvbG9yOiAnI2M2MjgyOCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250V2VpZ2h0OiA3MDAgfX0+eydcXHUwMEQ3J308L2J1dHRvbj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiA9PT09PT09PT09PT09PT09PT09PSBDSE9PU0UgTU9ERSA9PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAge21vZGUgPT09ICdjaG9vc2UnICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzEycHgnIH19PlxyXG5cclxuICAgICAgICAgIHsvKiBBSSBPcHRpb24gKi99XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYmFja2dyb3VuZDogJyNmM2U1ZjUnLCBib3JkZXJSYWRpdXM6ICc4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NlOTNkOCcgfX0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzIwcHgnIH19PnsnXFx1RDgzRVxcdURERTAnfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjNGExNDhjJyB9fT5BSSBQcmVkaWN0aW9uPC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dBSUhlbHAoIXNob3dBSUhlbHApfSBzdHlsZT17eyB3aWR0aDogJzI0cHgnLCBoZWlnaHQ6ICcyNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM3YjFmYTInLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiBzaG93QUlIZWxwID8gJyM3YjFmYTInIDogJyNmZmYnLCBjb2xvcjogc2hvd0FJSGVscCA/ICcjZmZmJyA6ICcjN2IxZmEyJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDcwMCwgbGluZUhlaWdodDogJzIycHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAwIH19Pj88L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzY2NicsIG1hcmdpbjogJzAgMCAxMHB4JyB9fT5LZXJuZWwtZGVuc2l0eSBzY29yaW5nIGZyb20gY3Jhc2ggY2x1c3RlcnMgKyByb2FkIGF0dHJpYnV0ZXM8L3A+XHJcbiAgICAgICAgICAgIHtzaG93QUlIZWxwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzExcHgnLCBsaW5lSGVpZ2h0OiAnMS43JywgbWFyZ2luQm90dG9tOiAnMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZTFiZWU3JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+SG93IGl0IHdvcmtzOjwvc3Ryb25nPjxiciAvPlxyXG4gICAgICAgICAgICAgICAgMS4gWW91IHNlbGVjdCByb3V0ZXMgKGJ5IElELCBuYW1lLCBtYXAgY2xpY2ssIG9yIGRyYXcgYXJlYSk8YnIgLz5cclxuICAgICAgICAgICAgICAgIDIuIFRoZSB3aWRnZXQgcXVlcmllcyA8ZW0+Y3Jhc2ggZXZlbnRzPC9lbT4gYW5kIDxlbT5yb2FkIGF0dHJpYnV0ZSBldmVudHM8L2VtPiBmcm9tIHlvdXIgTFJTPGJyIC8+XHJcbiAgICAgICAgICAgICAgICAzLiBSb3V0ZXMgYXJlIGRpdmlkZWQgaW50byAwLjUtbWlsZSBzZWdtZW50czxiciAvPlxyXG4gICAgICAgICAgICAgICAgNC4gQ3Jhc2ggY291bnRzIHBlciBzZWdtZW50IGFyZSBjb21wdXRlZDxiciAvPlxyXG4gICAgICAgICAgICAgICAgNS4gQSBrZXJuZWwtZGVuc2l0eSBhbGdvcml0aG0gc3ByZWFkcyBpbmZsdWVuY2UgZnJvbSBoaWdoLWNyYXNoIHNlZ21lbnRzIHRvIG5laWdoYm9yczxiciAvPlxyXG4gICAgICAgICAgICAgICAgNi4gUm9hZCBhdHRyaWJ1dGVzIChjdXJ2ZXMsIGdyYWRlcywgZXRjLikgZW5yaWNoIHRoZSBhbmFseXNpczxiciAvPlxyXG4gICAgICAgICAgICAgICAgNy4gQSBjb2xvci1jb2RlZCByaXNrIGxheWVyIGlzIHB1Ymxpc2hlZCB0byB5b3VyIHBvcnRhbCBhbmQgYWRkZWQgdG8gdGhlIG1hcDxiciAvPlxyXG4gICAgICAgICAgICAgICAgPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8c3Ryb25nPkJlc3QgZm9yOjwvc3Ryb25nPiBGaW5kaW5nIGV4aXN0aW5nIGNyYXNoIGhvdHNwb3RzIGFuZCBuZWFyYnkgcmlzayB6b25lcy5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnYWknKX0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzEwcHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyM3YjFmYTInLCBjb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNjAwIH19PlxyXG4gICAgICAgICAgICAgIFJ1biBBSSBQcmVkaWN0aW9uXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgey8qIE1MIE9wdGlvbiAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBiYWNrZ3JvdW5kOiAnI2VkZTdmNicsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjYjM5ZGRiJyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMjBweCcgfX0+eydcXHVEODNEXFx1RENDQSd9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNzAwLCBjb2xvcjogJyMzMTFiOTInIH19Pk1MIFByZWRpY3Rpb248L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd01MSGVscCghc2hvd01MSGVscCl9IHN0eWxlPXt7IHdpZHRoOiAnMjRweCcsIGhlaWdodDogJzI0cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzZhMWI5YScsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmQ6IHNob3dNTEhlbHAgPyAnIzZhMWI5YScgOiAnI2ZmZicsIGNvbG9yOiBzaG93TUxIZWxwID8gJyNmZmYnIDogJyM2YTFiOWEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNzAwLCBsaW5lSGVpZ2h0OiAnMjJweCcsIHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6IDAgfX0+PzwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNjY2JywgbWFyZ2luOiAnMCAwIDEwcHgnIH19PlByZS1jb21wdXRlZCB3ZWlnaHRzIGZyb20gMS41TSBOWSBTdGF0ZSBjcmFzaCByZWNvcmRzPC9wPlxyXG4gICAgICAgICAgICB7c2hvd01MSGVscCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTBweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMXB4JywgbGluZUhlaWdodDogJzEuNycsIG1hcmdpbkJvdHRvbTogJzEwcHgnLCBib3JkZXI6ICcxcHggc29saWQgI2QxYzRlOScgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3Ryb25nPkhvdyBpdCB3b3Jrczo8L3N0cm9uZz48YnIgLz5cclxuICAgICAgICAgICAgICAgIDEuIFlvdSBzZWxlY3Qgcm91dGVzIChieSBJRCwgbmFtZSwgbWFwIGNsaWNrLCBvciBkcmF3IGFyZWEpPGJyIC8+XHJcbiAgICAgICAgICAgICAgICAyLiBUaGUgd2lkZ2V0IHF1ZXJpZXMgPGVtPnJvYWQgY2hhcmFjdGVyaXN0aWMgZXZlbnRzPC9lbT4gZnJvbSB5b3VyIExSUyAoY3VydmVzLCBncmFkZXMsIHNwZWVkIGxpbWl0cywgbGFuZSBjb3VudHMsIHNob3VsZGVycywgZXRjLik8YnIgLz5cclxuICAgICAgICAgICAgICAgIDMuIEVhY2ggMC41LW1pbGUgc2VnbWVudCdzIHJvYWQgY29uZGl0aW9ucyBhcmUgbWF0Y2hlZCB0byBwcmUtY29tcHV0ZWQgcmlzayBtdWx0aXBsaWVycyBmcm9tIDEsNTI1LDEyMyByZWFsIE5ZIHN0YXRlIGNyYXNoIHJlY29yZHM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDQuIEZhY3RvcnMgY29tcG91bmQg4oCUIGEgY3VydmUgKyBoaWdoIHNwZWVkICsgbm8gc2hvdWxkZXIgPSB2ZXJ5IGhpZ2ggcmlzazxiciAvPlxyXG4gICAgICAgICAgICAgICAgNS4gQSBjb2xvci1jb2RlZCBwcmVkaWN0aW9uIGxheWVyIGlzIHB1Ymxpc2hlZCBhbmQgYWRkZWQgdG8gdGhlIG1hcDxiciAvPlxyXG4gICAgICAgICAgICAgICAgPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8c3Ryb25nPkJlc3QgZm9yOjwvc3Ryb25nPiBQcmVkaWN0aW5nIDxlbT5uZXc8L2VtPiByaXNrIGZyb20gcm9hZCBjaGFyYWN0ZXJpc3RpY3MgYWxvbmUg4oCUIGZpbmRpbmcgZGFuZ2Vyb3VzIGNvbmRpdGlvbnMgZXZlbiB3aGVyZSBubyBjcmFzaGVzIGhhdmUgYmVlbiByZXBvcnRlZCB5ZXQuXHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ21sJyl9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcxMHB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjNmExYjlhJywgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgICAgICBSdW4gTUwgUHJlZGljdGlvblxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09IEFJIC8gTUwgV09SS0ZMT1cgPT09PT09PT09PT09PT09PT09PT0gKi99XHJcbiAgICAgIHsobW9kZSA9PT0gJ2FpJyB8fCBtb2RlID09PSAnbWwnKSAmJiAhcmVzdWx0ICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGdhcDogJzEycHgnIH19PlxyXG5cclxuICAgICAgICAgIHsvKiBCYWNrIGJ1dHRvbiAqL31cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgc2V0TW9kZSgnY2hvb3NlJyk7IHNldEVycm9yKG51bGwpOyBzZXRQcm9ncmVzcygnJykgfX0gZGlzYWJsZWQ9e3J1bm5pbmd9IHN0eWxlPXt7IGFsaWduU2VsZjogJ2ZsZXgtc3RhcnQnLCBwYWRkaW5nOiAnNHB4IDEwcHgnLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzU1NScgfX0+XHJcbiAgICAgICAgICAgIHsnXFx1MjE5MCd9IEJhY2tcclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzhweCAxMnB4JywgYmFja2dyb3VuZDogbW9kZSA9PT0gJ2FpJyA/ICcjZjNlNWY1JyA6ICcjZWRlN2Y2JywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogbW9kZSA9PT0gJ2FpJyA/ICcjNGExNDhjJyA6ICcjMzExYjkyJyB9fT5cclxuICAgICAgICAgICAge21vZGUgPT09ICdhaScgPyAnXFx1RDgzRVxcdURERTAgQUkgUHJlZGljdGlvbicgOiAnXFx1RDgzRFxcdURDQ0EgTUwgUHJlZGljdGlvbid9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogUm91dGUgc2VsZWN0aW9uICovfVxyXG4gICAgICAgICAgeyFydW5uaW5nICYmIHJvdXRlU2VsZWN0aW9uVUkoKX1cclxuXHJcbiAgICAgICAgICB7LyogUnVuIGJ1dHRvbiAqL31cclxuICAgICAgICAgIHshcnVubmluZyAmJiAoXHJcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e21vZGUgPT09ICdhaScgPyBydW5BSVByZWRpY3Rpb24gOiBydW5NTFByZWRpY3Rpb259IGRpc2FibGVkPXtydW5uaW5nIHx8IChzZWFyY2hNb2RlICE9PSAnbWFwJyAmJiAhcm91dGVJZC50cmltKCkpIHx8IChzZWFyY2hNb2RlID09PSAnbWFwJyAmJiBzZWxlY3RlZE1hcFJvdXRlSWRzLnNpemUgPT09IDApfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMTJweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAocnVubmluZyB8fCAoc2VhcmNoTW9kZSAhPT0gJ21hcCcgJiYgIXJvdXRlSWQudHJpbSgpKSB8fCAoc2VhcmNoTW9kZSA9PT0gJ21hcCcgJiYgc2VsZWN0ZWRNYXBSb3V0ZUlkcy5zaXplID09PSAwKSkgPyAnI2FhYScgOiAobW9kZSA9PT0gJ2FpJyA/ICcjN2IxZmEyJyA6ICcjNmExYjlhJyksIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICAgICAge21vZGUgPT09ICdhaScgPyAnUnVuIEFJIFByZWRpY3Rpb24nIDogJ1J1biBNTCBQcmVkaWN0aW9uJ31cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIHsvKiBQcm9ncmVzcyAqL31cclxuICAgICAgICAgIHtydW5uaW5nICYmIHJ1bm5pbmdVSSgpfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09IFJFU1VMVCA9PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAge3Jlc3VsdCAmJiByZXN1bHRVSSgpfVxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBXaWRnZXRcclxuXG4gZXhwb3J0IGZ1bmN0aW9uIF9fc2V0X3dlYnBhY2tfcHVibGljX3BhdGhfXyh1cmwpIHsgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB1cmwgfSJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==