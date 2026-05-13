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
            for (const rid of routeIds) {
                const routeIdField = cfg.routeIdField || 'routeid';
                const where = `${routeIdField} = '${rid.replace(/'/g, "''")}'`;
                const params = {
                    where,
                    outFields: '*',
                    returnGeometry: 'false',
                    resultRecordCount: '5000',
                    f: 'json'
                };
                const data = yield lrsServiceRef.current.queryFeaturesDirect(layerUrl, params);
                for (const f of (data.features || [])) {
                    const measureField = cfg.measureField || cfg.fromMeasureField || 'measure';
                    allEntries.push(Object.assign({ Feature: cfg.name, RouteID: f.attributes[routeIdField] || f.attributes['routeid'], Measure: (_a = f.attributes[measureField]) !== null && _a !== void 0 ? _a : f.attributes[cfg.fromMeasureField] }, Object.fromEntries((cfg.attributes || []).map(a => [a, f.attributes[a]]))));
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
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '10px', fontWeight: 400, color: '#999' } }, "(v2026.05.13 19:38)")),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jcmFzaC1yaXNrL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxZQUFZLEdBQUcsQ0FBQztBQUVwQjs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBRSxHQUFXLEVBQUUsTUFBOEI7SUFDaEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLFlBQVksR0FBRyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxZQUFZLEVBQUUsRUFBRTtRQUM5RCxNQUFNLENBQUMsUUFBUSxHQUFHLFlBQVk7UUFFOUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2pELE1BQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUVoQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLE9BQVEsTUFBYyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLE1BQU0sQ0FBQyxVQUFVO2dCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxDQUFDLENBRUE7UUFBQyxNQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUM3QyxPQUFPLEVBQUU7WUFDVCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FB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QUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUMvQyxDQUFDO2FBQU0sSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQzNELEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDbkYsQ0FBQzthQUFNLENBQUM7WUFDTixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDN0MsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ2pDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDckMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQztvQkFDdkIsTUFBTSxJQUFJLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2pELEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFD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VUFBVSxDQUFDO29CQUNqRCxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO29CQUNsQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUM7b0JBQ3RCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM3QyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDakMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNyQyxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDOzRCQUM3QixNQUFNLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEQsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsTUFBSzt3QkFDUCxDQUFDO29CQUNILENBQUM7b0JBQ0QsTUFBTSxJQUFJLEdBQWUsRUFBRTtvQkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzdDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU87NEJBQUUsU0FBUTt3QkFDMUIsSUFBSSxFQUFFLEdBQUcsS0FBSzs0QkFBRSxNQUFLO3dCQUNyQixJQUFJLEVBQUUsSUFBSSxPQUFPLElBQUksRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDOzRCQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkgsQ0FBQzs2QkFBTSxJQUFJLEVBQUUsR0FBRyxPQUFPLElBQUksRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDOzRCQUN4QyxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7NEJBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMzSSxDQUFDO3dCQUNELElBQUksRUFBRSxJQUFJLE9BQU8sSUFBSSxFQUFFLElBQUksS0FBSzs0QkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ2hGLElBQUksRUFBRSxHQUFHLEtBQUssSUFBSSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUM7NEJBQ2xDLE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs0QkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JB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Q0FBQztvQkFFOUUsYUFBYTtvQkFDYixNQUFNLElBQUksR0FBZSxFQUFFO29CQUMzQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzFCLElBQUksRUFBRSxJQUFJLEtBQUssSUFBSSxFQUFFLElBQUksR0FBRzs0QkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2RCxDQUFDO29CQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQzFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDakMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDckMsSUFBSSxFQUFFLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILENBQUM7NEJBQ0QsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQ0FDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILENBQUM7d0JBQ0gsQ0FBQztvQkFDSCxDQUFDO29CQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO3dCQUFFLFNBQVE7b0JBRTdCLE1BQU0sU0FBUyxHQUFHLFNBQVMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUMs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QUNuQixDQUNQO1FBR0EsTUFBTSxJQUFJLFFBQVEsRUFBRSxDQUNqQixDQUNQO0FBQ0gsQ0FBQztBQUVELGlFQUFlLE1BQU07QUFFYixTQUFTLDJCQUEyQixDQUFDLEdBQUcsSUFBSSxxQkFBdUIsR0FBRyxHQUFHLEVBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9scnMtdXRpbHMvbHJzLXNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWFyY2dpc1wiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9ydW50aW1lL3dpZGdldC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gTFJTIFJFU1QgQVBJIFNlcnZpY2Ugd3JhcHBlclxyXG4vLyBVc2VzIEpTT05QIHRvIGJ5cGFzcyBDT1JTIGlzc3VlcyB3aXRoIG1pc2NvbmZpZ3VyZWQgc2VydmVycyAoZHVwbGljYXRlIEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiBoZWFkZXJzKVxyXG5pbXBvcnQgdHlwZSB7XHJcbiAgTHJzU2VydmljZUluZm8sXHJcbiAgTmV0d29ya0xheWVySW5mbyxcclxuICBFdmVudExheWVySW5mbyxcclxuICBNZWFzdXJlVG9HZW9tZXRyeUxvY2F0aW9uLFxyXG4gIE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0LFxyXG4gIEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0LFxyXG4gIFF1ZXJ5QXR0cmlidXRlU2V0UGFyYW1zLFxyXG4gIEZlYXR1cmVTZXRSZXN1bHRcclxufSBmcm9tICcuL3R5cGVzJ1xyXG5cclxubGV0IGpzb25wQ291bnRlciA9IDBcclxuXHJcbi8qKlxyXG4gKiBKU09OUCByZXF1ZXN0IOKAlCBieXBhc3NlcyBDT1JTIGVudGlyZWx5IGJ5IGluamVjdGluZyBhIDxzY3JpcHQ+IHRhZy5cclxuICogQXJjR0lTIFJFU1QgQVBJIHN1cHBvcnRzIEpTT05QIHZpYSB0aGUgJ2NhbGxiYWNrJyBwYXJhbWV0ZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBqc29ucFJlcXVlc3QgKHVybDogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPGFueT4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCBjYWxsYmFja05hbWUgPSBgX2xyc19jYl8ke0RhdGUubm93KCl9XyR7anNvbnBDb3VudGVyKyt9YFxyXG4gICAgcGFyYW1zLmNhbGxiYWNrID0gY2FsbGJhY2tOYW1lXHJcblxyXG4gICAgY29uc3QgcXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykudG9TdHJpbmcoKVxyXG4gICAgY29uc3Qgc2NyaXB0VXJsID0gYCR7dXJsfT8ke3FzfWBcclxuXHJcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxyXG4gICAgc2NyaXB0LnNyYyA9IHNjcmlwdFVybFxyXG5cclxuICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XHJcbiAgICAgIGRlbGV0ZSAod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXVxyXG4gICAgICBpZiAoc2NyaXB0LnBhcmVudE5vZGUpIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdClcclxuICAgIH1cclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlIHx8ICdSZXF1ZXN0IGVycm9yJykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdKU09OUCByZXF1ZXN0IGZhaWxlZCcpKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICgod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSkge1xyXG4gICAgICAgIGNsZWFudXAoKVxyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKVxyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMClcclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcilcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yLm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZXJyb3InKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcclxuICB9KVxyXG59XHJcblxyXG4vKipcclxuICogV3JhcHBlciBhcm91bmQgQXJjR0lTIExSUyBSRVNUIEFQSSAoTFJTZXJ2ZXIgZXh0ZW5zaW9uKS5cclxuICogVXNlcyBKU09OUCBmb3IgYWxsIHJlcXVlc3RzIHRvIGF2b2lkIENPUlMgaXNzdWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExyc1NlcnZpY2Uge1xyXG4gIHByaXZhdGUgYmFzZVVybDogc3RyaW5nXHJcbiAgcHJpdmF0ZSB0b2tlbjogc3RyaW5nIHwgbnVsbFxyXG5cclxuICBjb25zdHJ1Y3RvciAoYmFzZVVybDogc3RyaW5nLCB0b2tlbj86IHN0cmluZykge1xyXG4gICAgLy8gRW5zdXJlIG5vIHRyYWlsaW5nIHNsYXNoXHJcbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgJycpXHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW4gfHwgbnVsbFxyXG4gIH1cclxuXHJcbiAgc2V0VG9rZW4gKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggTFJTIHNlcnZpY2UgbWV0YWRhdGEgKG5ldHdvcmsgbGF5ZXJzLCBldmVudCBsYXllcnMsIGV0Yy4pXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0U2VydmljZUluZm8gKCk6IFByb21pc2U8THJzU2VydmljZUluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8THJzU2VydmljZUluZm8+KCcnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggZGV0YWlsZWQgaW5mbyBmb3IgYSBuZXR3b3JrIGxheWVyIChmaWVsZHMsIG1lYXN1cmUgcHJlY2lzaW9uLCBldGMuKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldE5ldHdvcmtMYXllckluZm8gKGxheWVySWQ6IG51bWJlcik6IFByb21pc2U8TmV0d29ya0xheWVySW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxOZXR3b3JrTGF5ZXJJbmZvPihgL25ldHdvcmtMYXllcnMvJHtsYXllcklkfWApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBkZXRhaWxlZCBpbmZvIGZvciBhbiBldmVudCBsYXllclxyXG4gICAqL1xyXG4gIGFzeW5jIGdldEV2ZW50TGF5ZXJJbmZvIChsYXllcklkOiBudW1iZXIpOiBQcm9taXNlPEV2ZW50TGF5ZXJJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEV2ZW50TGF5ZXJJbmZvPihgL2V2ZW50TGF5ZXJzLyR7bGF5ZXJJZH1gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCByb3V0ZSBJRCArIG1lYXN1cmVzIHRvIG1hcCBnZW9tZXRyeVxyXG4gICAqL1xyXG4gIGFzeW5jIG1lYXN1cmVUb0dlb21ldHJ5IChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBsb2NhdGlvbnM6IE1lYXN1cmVUb0dlb21ldHJ5TG9jYXRpb25bXSxcclxuICAgIG91dFNSPzogYW55XHJcbiAgKTogUHJvbWlzZTxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4ge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucyksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKG91dFNSKSB7XHJcbiAgICAgIHBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KG91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9tZWFzdXJlVG9HZW9tZXRyeWAsXHJcbiAgICAgIHBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBtYXAgZ2VvbWV0cnkgKHBvaW50KSB0byByb3V0ZSArIG1lYXN1cmVcclxuICAgKi9cclxuICBhc3luYyBnZW9tZXRyeVRvTWVhc3VyZSAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgbG9jYXRpb25zOiBBcnJheTx7IGdlb21ldHJ5OiBhbnkgfT4sXHJcbiAgICBvdXRTUj86IGFueVxyXG4gICk6IFByb21pc2U8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChvdXRTUikge1xyXG4gICAgICBwYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShvdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vZ2VvbWV0cnlUb01lYXN1cmVgLFxyXG4gICAgICBwYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIER5bmFtaWMgc2VnbWVudGF0aW9uIG92ZXJsYXkg4oCUIHF1ZXJ5QXR0cmlidXRlU2V0XHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlBdHRyaWJ1dGVTZXQgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIHBhcmFtczogUXVlcnlBdHRyaWJ1dGVTZXRQYXJhbXNcclxuICApOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmxvY2F0aW9ucyksXHJcbiAgICAgIGF0dHJpYnV0ZVNldDogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmF0dHJpYnV0ZVNldCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHBhcmFtcy5vdXRTUikge1xyXG4gICAgICByZXF1ZXN0UGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zLm91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxGZWF0dXJlU2V0UmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L3F1ZXJ5QXR0cmlidXRlU2V0YCxcclxuICAgICAgcmVxdWVzdFBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhbmRhcmQgZmVhdHVyZSBxdWVyeSBhZ2FpbnN0IGEgbWFwIHNlcnZpY2UgbGF5ZXIgKGZvciBSb2FkIExvZyBpbmRpdmlkdWFsIGV2ZW50IHF1ZXJpZXMpXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlcyAoXHJcbiAgICBtYXBTZXJ2aWNlVXJsOiBzdHJpbmcsXHJcbiAgICBsYXllcklkOiBudW1iZXIsXHJcbiAgICB3aGVyZTogc3RyaW5nLFxyXG4gICAgb3V0RmllbGRzOiBzdHJpbmdbXSA9IFsnKiddXHJcbiAgKTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICAvLyBUaGUgbWFwIHNlcnZpY2UgVVJMIGlzIHRoZSBwYXJlbnQgb2YgTFJTZXJ2ZXIgZXh0ZW5zaW9uXHJcbiAgICAvLyBlLmcuIC4uLi9NYXBTZXJ2ZXIvMC9xdWVyeVxyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IHRoaXMuYmFzZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtsYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIHdoZXJlLFxyXG4gICAgICBvdXRGaWVsZHM6IG91dEZpZWxkcy5qb2luKCcsJyksXHJcbiAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlyZWN0IHF1ZXJ5IHdpdGggYXJiaXRyYXJ5IHBhcmFtcyAoZm9yIHNwYXRpYWwgcXVlcmllcyB2aWEgSlNPTlApXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlc0RpcmVjdCAodXJsOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG4gICAgcGFyYW1zLmYgPSBwYXJhbXMuZiB8fCAnanNvbidcclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBRdWVyeSByb3V0ZXMgb24gYSBuZXR3b3JrIGxheWVyIChmb3Igcm91dGUgcGlja2VyIGF1dG9jb21wbGV0ZSlcclxuICAgKi9cclxuICBhc3luYyBxdWVyeVJvdXRlcyAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgc2VhcmNoVGV4dDogc3RyaW5nLFxyXG4gICAgcm91dGVJZEZpZWxkOiBzdHJpbmcsXHJcbiAgICByb3V0ZU5hbWVGaWVsZDogc3RyaW5nIHwgbnVsbCxcclxuICAgIG1heFJlc3VsdHM6IG51bWJlciA9IDEwXHJcbiAgKTogUHJvbWlzZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0+PiB7XHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gdGhpcy5iYXNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke25ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBzZWFyY2hGaWVsZCA9IHJvdXRlTmFtZUZpZWxkIHx8IHJvdXRlSWRGaWVsZFxyXG4gICAgY29uc3Qgd2hlcmUgPSBgVVBQRVIoJHtzZWFyY2hGaWVsZH0pIExJS0UgVVBQRVIoJyR7c2VhcmNoVGV4dC5yZXBsYWNlKC8nL2csIFwiJydcIil9JScpYFxyXG4gICAgY29uc3Qgb3V0RmllbGRzID0gcm91dGVOYW1lRmllbGRcclxuICAgICAgPyBbcm91dGVJZEZpZWxkLCByb3V0ZU5hbWVGaWVsZF1cclxuICAgICAgOiBbcm91dGVJZEZpZWxkXVxyXG5cclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgd2hlcmUsXHJcbiAgICAgIG91dEZpZWxkczogb3V0RmllbGRzLmpvaW4oJywnKSxcclxuICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgIHJlc3VsdFJlY29yZENvdW50OiBtYXhSZXN1bHRzLnRvU3RyaW5nKCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGpzb24gPSBhd2FpdCBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcblxyXG4gICAgY29uc3QgYWxsID0gKGpzb24uZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVJZEZpZWxkXSxcclxuICAgICAgcm91dGVOYW1lOiByb3V0ZU5hbWVGaWVsZCA/IGYuYXR0cmlidXRlc1tyb3V0ZU5hbWVGaWVsZF0gOiBudWxsXHJcbiAgICB9KSlcclxuICAgIC8vIERlZHVwbGljYXRlIGJ5IHJvdXRlSWRcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxyXG4gICAgcmV0dXJuIGFsbC5maWx0ZXIoKHI6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoc2Vlbi5oYXMoci5yb3V0ZUlkKSkgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHNlZW4uYWRkKHIucm91dGVJZClcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvLyAtLS0gUHJpdmF0ZSBoZWxwZXJzIC0tLVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHJlcXVlc3Q8VD4gKHBhdGg6IHN0cmluZywgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8VD4ge1xyXG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfSR7cGF0aH1gXHJcbiAgICBjb25zdCBhbGxQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGY6ICdqc29uJyxcclxuICAgICAgLi4ucGFyYW1zXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBhbGxQYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIGFsbFBhcmFtcykgYXMgUHJvbWlzZTxUPlxyXG4gIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9hcmNnaXNfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCIvKiogQGpzeFJ1bnRpbWUgY2xhc3NpYyAqL1xyXG5pbXBvcnQgeyBSZWFjdCwgdHlwZSBBbGxXaWRnZXRQcm9wcywgU2Vzc2lvbk1hbmFnZXIgfSBmcm9tICdqaW11LWNvcmUnXHJcbmltcG9ydCB7IEppbXVNYXBWaWV3Q29tcG9uZW50LCB0eXBlIEppbXVNYXBWaWV3IH0gZnJvbSAnamltdS1hcmNnaXMnXHJcbmltcG9ydCB0eXBlIHsgSU1Db25maWcgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IExyc1NlcnZpY2UgfSBmcm9tICcuLi9scnMtdXRpbHMvbHJzLXNlcnZpY2UnXHJcblxyXG5jb25zdCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSA9IFJlYWN0XHJcblxyXG50eXBlIFdvcmtmbG93TW9kZSA9ICdjaG9vc2UnIHwgJ2FpJyB8ICdtbCdcclxuXHJcbmNvbnN0IFdpZGdldCA9IChwcm9wczogQWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+KSA9PiB7XHJcbiAgY29uc3QgY29uZmlnID0gcHJvcHMuY29uZmlnXHJcbiAgY29uc3QgaGFzTWFwV2lkZ2V0ID0gQm9vbGVhbihwcm9wcy51c2VNYXBXaWRnZXRJZHMgJiYgKChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KS5sZW5ndGggPiAwIHx8IChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uc2l6ZSA+IDApKVxyXG5cclxuICAvLyBXb3JrZmxvdyBzdGF0ZVxyXG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPFdvcmtmbG93TW9kZT4oJ2Nob29zZScpXHJcbiAgY29uc3QgW3Nob3dBSUhlbHAsIHNldFNob3dBSUhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3Nob3dNTEhlbHAsIHNldFNob3dNTEhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcblxyXG4gIC8vIFJvdXRlIHNlbGVjdGlvbiBzdGF0ZVxyXG4gIGNvbnN0IFtyb3V0ZUlkLCBzZXRSb3V0ZUlkXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtyb3V0ZU5hbWUsIHNldFJvdXRlTmFtZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbZnJvbU1lYXN1cmUsIHNldEZyb21NZWFzdXJlXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFt0b01lYXN1cmUsIHNldFRvTWVhc3VyZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbcm91dGVNZWFzdXJlUmFuZ2UsIHNldFJvdXRlTWVhc3VyZVJhbmdlXSA9IHVzZVN0YXRlPHsgbWluOiBudW1iZXI7IG1heDogbnVtYmVyIH0gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzZWFyY2hNb2RlLCBzZXRTZWFyY2hNb2RlXSA9IHVzZVN0YXRlPCdpZCcgfCAnbmFtZScgfCAnbWFwJz4oJ2lkJylcclxuICBjb25zdCBbcm91dGVTdWdnZXN0aW9ucywgc2V0Um91dGVTdWdnZXN0aW9uc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0+PihbXSlcclxuICBjb25zdCBbc2hvd1N1Z2dlc3Rpb25zLCBzZXRTaG93U3VnZ2VzdGlvbnNdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3BpY2tpbmdGcm9tTWFwLCBzZXRQaWNraW5nRnJvbU1hcF0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbcGlja2luZ01lYXN1cmUsIHNldFBpY2tpbmdNZWFzdXJlXSA9IHVzZVN0YXRlPCdmcm9tJyB8ICd0bycgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtkcmF3aW5nLCBzZXREcmF3aW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFttYXBSb3V0ZXMsIHNldE1hcFJvdXRlc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsOyBmcm9tTWVhc3VyZTogbnVtYmVyOyB0b01lYXN1cmU6IG51bWJlciB9Pj4oW10pXHJcbiAgY29uc3QgW3NlbGVjdGVkTWFwUm91dGVJZHMsIHNldFNlbGVjdGVkTWFwUm91dGVJZHNdID0gdXNlU3RhdGU8U2V0PHN0cmluZz4+KG5ldyBTZXQoKSlcclxuICBjb25zdCBbcm91dGVQaWNrQ2FuZGlkYXRlcywgc2V0Um91dGVQaWNrQ2FuZGlkYXRlc10gPSB1c2VTdGF0ZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfT4gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzZWxlY3RlZEZvbGRlcklkLCBzZXRTZWxlY3RlZEZvbGRlcklkXSA9IHVzZVN0YXRlPHN0cmluZz4oJycpXHJcblxyXG4gIC8vIFByZWRpY3Rpb24gc3RhdGVcclxuICBjb25zdCBbcnVubmluZywgc2V0UnVubmluZ10gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbcHJvZ3Jlc3MsIHNldFByb2dyZXNzXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbcmVzdWx0LCBzZXRSZXN1bHRdID0gdXNlU3RhdGU8eyBsYXllclVybD86IHN0cmluZzsgaXRlbVVybD86IHN0cmluZyB9IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbc2hvd0V4cGxhbmF0aW9uLCBzZXRTaG93RXhwbGFuYXRpb25dID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW2ZhY3RvcnMsIHNldEZhY3RvcnNdID0gdXNlU3RhdGU8YW55PihudWxsKVxyXG4gIGNvbnN0IFttb2RlbEluZm8sIHNldE1vZGVsSW5mb10gPSB1c2VTdGF0ZTxhbnk+KG51bGwpXHJcblxyXG4gIC8vIFJlZnNcclxuICBjb25zdCBqaW11TWFwVmlld1JlZiA9IHVzZVJlZjxKaW11TWFwVmlldyB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgbHJzU2VydmljZVJlZiA9IHVzZVJlZjxMcnNTZXJ2aWNlIHwgbnVsbD4obnVsbClcclxuICBjb25zdCByb3V0ZUdlb21ldHJpZXNSZWYgPSB1c2VSZWY8TWFwPHN0cmluZywgeyB2ZXJ0aWNlczogbnVtYmVyW11bXTsgbUlkeDogbnVtYmVyIH0+PihuZXcgTWFwKCkpXHJcbiAgY29uc3QgcGlja0hhbmRsZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHBpY2tIb3ZlckhhbmRsZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHBpY2tUb29sdGlwUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBwaWNrU25hcEdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHBpY2tIb3ZlclRpbWVvdXRSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHNrZXRjaFZNUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBncmFwaGljc0xheWVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBzZWFyY2hUaW1lb3V0UmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICAvLyBSb3V0ZSBwcmV2aWV3ICsgbWVhc3VyZSBwaWNraW5nIHJlZnNcclxuICBjb25zdCByb3V0ZVByZXZpZXdHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCByb3V0ZVByZXZpZXdMYXllclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgZnJvbU1lYXN1cmVHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCB0b01lYXN1cmVHcmFwaGljUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCByb3V0ZVByZXZpZXdWZXJ0c1JlZiA9IHVzZVJlZjx7IHZlcnRpY2VzOiBudW1iZXJbXVtdOyBtSWR4OiBudW1iZXIgfSB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgbWVhc3VyZVBpY2tIYW5kbGVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBtZWFzdXJlUGlja0hvdmVyUmVmID0gdXNlUmVmPGFueT4obnVsbClcclxuICBjb25zdCBtZWFzdXJlU25hcEdyYXBoaWNSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IG1lYXN1cmVUb29sdGlwUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBzaG93Um91dGVQcmV2aWV3UmVmID0gdXNlUmVmPChyaWQ6IHN0cmluZykgPT4gdm9pZD4oKCkgPT4ge30pXHJcbiAgY29uc3Qgc2hvd01lYXN1cmVQb2ludFJlZiA9IHVzZVJlZjwod2hpY2g6ICdmcm9tJyB8ICd0bycsIG1lYXN1cmVWYWw6IHN0cmluZykgPT4gdm9pZD4oKCkgPT4ge30pXHJcblxyXG4gIC8vIEluaXRpYWxpemUgTHJzU2VydmljZSAoSlNPTlAtYmFzZWQsIGJ5cGFzc2VzIENPUlMpXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChjb25maWc/Lmxyc1NlcnZpY2VVcmwpIHtcclxuICAgICAgbHJzU2VydmljZVJlZi5jdXJyZW50ID0gbmV3IExyc1NlcnZpY2UoY29uZmlnLmxyc1NlcnZpY2VVcmwpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZz8ubHJzU2VydmljZVVybF0pXHJcblxyXG4gIC8vIEhhbmRsZSBtYXAgdmlldyByZWFkeVxyXG4gIGNvbnN0IG9uQWN0aXZlVmlld0NoYW5nZSA9IHVzZUNhbGxiYWNrKChqbXY6IEppbXVNYXBWaWV3KSA9PiB7XHJcbiAgICBqaW11TWFwVmlld1JlZi5jdXJyZW50ID0gam12XHJcbiAgfSwgW10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFJPVVRFIFNFTEVDVElPTiAoc2FtZSBhcyByb2FkLWxvZykgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgaGFuZGxlUm91dGVTZWFyY2ggPSB1c2VDYWxsYmFjaygodmFsdWU6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKHNlYXJjaE1vZGUgPT09ICdpZCcpIHtcclxuICAgICAgc2V0Um91dGVJZCh2YWx1ZSlcclxuICAgICAgc2V0Um91dGVOYW1lKCcnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0Um91dGVOYW1lKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICBpZiAodmFsdWUubGVuZ3RoIDwgMiB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSB7XHJcbiAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMoW10pXHJcbiAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgc2VhcmNoVGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgICAgIGNvbnN0IG5hbWVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVOYW1lRmllbGQgfHwgJ3JvdXRlX25hbWUnXHJcbiAgICAgICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtjb25maWcubmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgICAgICBjb25zdCBzZWFyY2hGaWVsZCA9IHNlYXJjaE1vZGUgPT09ICduYW1lJyA/IG5hbWVGaWVsZCA6IHJvdXRlRmllbGRcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICB3aGVyZTogYFVQUEVSKCR7c2VhcmNoRmllbGR9KSBMSUtFIFVQUEVSKCclJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9JScpYCxcclxuICAgICAgICAgIG91dEZpZWxkczogYCR7cm91dGVGaWVsZH0sJHtuYW1lRmllbGR9YCxcclxuICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICcxMCcsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IChkYXRhLmZlYXR1cmVzIHx8IFtdKS5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgICAgIHJvdXRlSWQ6IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJyxcclxuICAgICAgICAgIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgbnVsbFxyXG4gICAgICAgIH0pKVxyXG4gICAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMocmVzdWx0cylcclxuICAgICAgICBzZXRTaG93U3VnZ2VzdGlvbnMocmVzdWx0cy5sZW5ndGggPiAwKVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBzZXRSb3V0ZVN1Z2dlc3Rpb25zKFtdKVxyXG4gICAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgICAgfVxyXG4gICAgfSwgMzAwKVxyXG4gIH0sIFtjb25maWcsIHNlYXJjaE1vZGVdKVxyXG5cclxuICBjb25zdCBzZWxlY3RSb3V0ZSA9IHVzZUNhbGxiYWNrKChyb3V0ZTogeyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9KSA9PiB7XHJcbiAgICBzZXRSb3V0ZUlkKHJvdXRlLnJvdXRlSWQpXHJcbiAgICBzZXRSb3V0ZU5hbWUocm91dGUucm91dGVOYW1lIHx8ICcnKVxyXG4gICAgc2V0U2hvd1N1Z2dlc3Rpb25zKGZhbHNlKVxyXG4gICAgZmV0Y2hSb3V0ZU1lYXN1cmVzKHJvdXRlLnJvdXRlSWQpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIEZldGNoIHJvdXRlIGdlb21ldHJ5ICsgbWVhc3VyZSByYW5nZSArIHNob3cgcHJldmlld1xyXG4gIGNvbnN0IGZldGNoUm91dGVNZWFzdXJlcyA9IHVzZUNhbGxiYWNrKGFzeW5jIChyaWQ6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFscnNTZXJ2aWNlUmVmLmN1cnJlbnQgfHwgIXJpZCkgcmV0dXJuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICBjb25zdCB2aWV3V2tpZCA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXc/LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcbiAgICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICB3aGVyZTogYCR7cm91dGVGaWVsZH0gPSAnJHtyaWQucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgLFxyXG4gICAgICAgIG91dEZpZWxkczogcm91dGVGaWVsZCxcclxuICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgIHJldHVybk06ICd0cnVlJyxcclxuICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEnLFxyXG4gICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHVybCwgcGFyYW1zKVxyXG4gICAgICBpZiAoIWRhdGEuZmVhdHVyZXM/Lmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gICAgICBjb25zdCBwYXRocyA9IGRhdGEuZmVhdHVyZXNbMF0uZ2VvbWV0cnk/LnBhdGhzIHx8IFtdXHJcbiAgICAgIGNvbnN0IGFsbFZlcnRzOiBudW1iZXJbXVtdID0gW11cclxuICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSBhbGxWZXJ0cy5wdXNoKC4uLnBhdGgpXHJcbiAgICAgIGNvbnN0IGhhc1ogPSBkYXRhLmZlYXR1cmVzWzBdLmdlb21ldHJ5Py5oYXNaXHJcbiAgICAgIGNvbnN0IG1JZHggPSBoYXNaID8gMyA6IDJcclxuICAgICAgYWxsVmVydHMuc29ydCgoYSwgYikgPT4gKGFbbUlkeF0gfHwgMCkgLSAoYlttSWR4XSB8fCAwKSlcclxuXHJcbiAgICAgIGlmIChhbGxWZXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3QgbWluTSA9IGFsbFZlcnRzWzBdW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBtYXhNID0gYWxsVmVydHNbYWxsVmVydHMubGVuZ3RoIC0gMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIHNldEZyb21NZWFzdXJlKG1pbk0udG9GaXhlZCgzKSlcclxuICAgICAgICBzZXRUb01lYXN1cmUobWF4TS50b0ZpeGVkKDMpKVxyXG4gICAgICAgIHNldFJvdXRlTWVhc3VyZVJhbmdlKHsgbWluOiBtaW5NLCBtYXg6IG1heE0gfSlcclxuICAgICAgICByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5zZXQocmlkLCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9KVxyXG4gICAgICAgIHJvdXRlUHJldmlld1ZlcnRzUmVmLmN1cnJlbnQgPSB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9XHJcblxyXG4gICAgICAgIC8vIFNob3cgcm91dGUgcHJldmlldyBvbiBtYXBcclxuICAgICAgICBzaG93Um91dGVQcmV2aWV3UmVmLmN1cnJlbnQocmlkKVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1tDcmFzaFJpc2tdIGZldGNoUm91dGVNZWFzdXJlcyBmYWlsZWQ6JywgZSlcclxuICAgIH1cclxuICB9LCBbY29uZmlnXSlcclxuXHJcbiAgLy8gU2hvdyBzZWxlY3RlZCByb3V0ZSBhcyBhIGRhc2hlZCBsaW5lIG9uIHRoZSBtYXAgKGxpa2Ugcm9hZC1sb2cpXHJcbiAgY29uc3Qgc2hvd1JvdXRlUHJldmlldyA9IHVzZUNhbGxiYWNrKGFzeW5jIChyaWQ6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICAvLyBFbnN1cmUgcHJldmlldyBHcmFwaGljc0xheWVyIGV4aXN0c1xyXG4gICAgaWYgKCFyb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IEdyYXBoaWNzTGF5ZXIgPSBhd2FpdCAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2xheWVycy9HcmFwaGljc0xheWVyJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSlcclxuICAgICAgY29uc3QgZ2wgPSBuZXcgR3JhcGhpY3NMYXllcih7IGlkOiAnX19jcmFzaHJpc2tfcm91dGVfcHJldmlld19fJywgdGl0bGU6ICdSb3V0ZSBQcmV2aWV3JyB9KVxyXG4gICAgICB2aWV3Lm1hcC5hZGQoZ2wsIDApXHJcbiAgICAgIHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnQgPSBnbFxyXG4gICAgfVxyXG4gICAgY29uc3QgcHJldmlld0xheWVyID0gcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudFxyXG5cclxuICAgIC8vIFJlbW92ZSBwcmV2aW91c1xyXG4gICAgaWYgKHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCkgeyBwcmV2aWV3TGF5ZXIucmVtb3ZlKHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCk7IHJvdXRlUHJldmlld0dyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgaWYgKGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KSkgZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQuZm9yRWFjaCgoZzogYW55KSA9PiBwcmV2aWV3TGF5ZXIucmVtb3ZlKGcpKVxyXG4gICAgICBlbHNlIHByZXZpZXdMYXllci5yZW1vdmUoZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpXHJcbiAgICAgIGZyb21NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgfVxyXG4gICAgaWYgKHRvTWVhc3VyZUdyYXBoaWNSZWYuY3VycmVudCkge1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheSh0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQpKSB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQuZm9yRWFjaCgoZzogYW55KSA9PiBwcmV2aWV3TGF5ZXIucmVtb3ZlKGcpKVxyXG4gICAgICBlbHNlIHByZXZpZXdMYXllci5yZW1vdmUodG9NZWFzdXJlR3JhcGhpY1JlZi5jdXJyZW50KVxyXG4gICAgICB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyaWQpIHJldHVyblxyXG5cclxuICAgIC8vIEZldGNoIGdlb21ldHJ5IChkb24ndCByZXF1aXJlIGNhY2hlIOKAlCBuZWVkZWQgZm9yIGRpc2FtYmlndWF0aW9uIGhvdmVyKVxyXG4gICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHVybCwge1xyXG4gICAgICAgIHdoZXJlOiBgJHtyb3V0ZUZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AsXHJcbiAgICAgICAgb3V0RmllbGRzOiByb3V0ZUZpZWxkLFxyXG4gICAgICAgIHJldHVybkdlb21ldHJ5OiAndHJ1ZScsXHJcbiAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgIG91dFNSOiBTdHJpbmcodmlld1draWQpLFxyXG4gICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnMScsXHJcbiAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgIH0pXHJcbiAgICAgIGlmICghanNvbi5mZWF0dXJlcz8ubGVuZ3RoKSByZXR1cm5cclxuICAgICAgY29uc3QgcGF0aHMgPSBqc29uLmZlYXR1cmVzWzBdLmdlb21ldHJ5Py5wYXRoc1xyXG4gICAgICBpZiAoIXBhdGhzPy5sZW5ndGgpIHJldHVyblxyXG5cclxuICAgICAgY29uc3QgW0dyYXBoaWMsIFBvbHlsaW5lLCBTaW1wbGVMaW5lU3ltYm9sXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL0dyYXBoaWMnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvbHlsaW5lJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1NpbXBsZUxpbmVTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgICBdKVxyXG5cclxuICAgICAgY29uc3Qgcm91dGVHcmFwaGljID0gbmV3IEdyYXBoaWMoe1xyXG4gICAgICAgIGdlb21ldHJ5OiBuZXcgUG9seWxpbmUoeyBwYXRocywgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkOiB2aWV3V2tpZCB9IH0pLFxyXG4gICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZUxpbmVTeW1ib2woeyBjb2xvcjogWzIyMCwgNjAsIDYwLCAxODBdLCB3aWR0aDogMywgc3R5bGU6ICdkYXNoJyB9KVxyXG4gICAgICB9KVxyXG4gICAgICByb3V0ZVByZXZpZXdHcmFwaGljUmVmLmN1cnJlbnQgPSByb3V0ZUdyYXBoaWNcclxuICAgICAgcHJldmlld0xheWVyLmFkZChyb3V0ZUdyYXBoaWMpXHJcblxyXG4gICAgICAvLyBab29tIHRvIHJvdXRlXHJcbiAgICAgIHRyeSB7IHZpZXcuZ29Ubyhyb3V0ZUdyYXBoaWMuZ2VvbWV0cnkuZXh0ZW50LmV4cGFuZCgxLjMpLCB7IGR1cmF0aW9uOiA4MDAgfSkgfSBjYXRjaCAoXykge31cclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBjb25zb2xlLndhcm4oJ3Nob3dSb3V0ZVByZXZpZXcgZmFpbGVkOicsIGVycilcclxuICAgIH1cclxuICB9LCBbY29uZmlnXSlcclxuICBzaG93Um91dGVQcmV2aWV3UmVmLmN1cnJlbnQgPSBzaG93Um91dGVQcmV2aWV3XHJcblxyXG4gIC8vIFNob3cgYSBtZWFzdXJlIHBvaW50IChncmVlbj1mcm9tLCByZWQ9dG8pIG9uIHRoZSBtYXBcclxuICBjb25zdCBzaG93TWVhc3VyZVBvaW50ID0gdXNlQ2FsbGJhY2soYXN5bmMgKHdoaWNoOiAnZnJvbScgfCAndG8nLCBtZWFzdXJlVmFsOiBzdHJpbmcpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG4gICAgY29uc3QgbSA9IHBhcnNlRmxvYXQobWVhc3VyZVZhbClcclxuICAgIGlmIChpc05hTihtKSkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgcmVmID0gd2hpY2ggPT09ICdmcm9tJyA/IGZyb21NZWFzdXJlR3JhcGhpY1JlZiA6IHRvTWVhc3VyZUdyYXBoaWNSZWZcclxuICAgIGlmIChyZWYuY3VycmVudCkge1xyXG4gICAgICBjb25zdCBsYXllciA9IHJvdXRlUHJldmlld0xheWVyUmVmLmN1cnJlbnRcclxuICAgICAgaWYgKGxheWVyKSB7XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmVmLmN1cnJlbnQpKSByZWYuY3VycmVudC5mb3JFYWNoKChnOiBhbnkpID0+IGxheWVyLnJlbW92ZShnKSlcclxuICAgICAgICBlbHNlIGxheWVyLnJlbW92ZShyZWYuY3VycmVudClcclxuICAgICAgfVxyXG4gICAgICByZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IHZlcnRpY2VzLCBtSWR4IH0gPSByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50XHJcblxyXG4gICAgLy8gSW50ZXJwb2xhdGUgcG9pbnQgYXQgbWVhc3VyZVxyXG4gICAgbGV0IHB0OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH0gfCBudWxsID0gbnVsbFxyXG4gICAgaWYgKG0gPD0gKHZlcnRpY2VzWzBdW21JZHhdIHx8IDApKSB7XHJcbiAgICAgIHB0ID0geyB4OiB2ZXJ0aWNlc1swXVswXSwgeTogdmVydGljZXNbMF1bMV0gfVxyXG4gICAgfSBlbHNlIGlmIChtID49ICh2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVttSWR4XSB8fCAwKSkge1xyXG4gICAgICBwdCA9IHsgeDogdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bMF0sIHk6IHZlcnRpY2VzW3ZlcnRpY2VzLmxlbmd0aCAtIDFdWzFdIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGlmIChtID49IG0xICYmIG0gPD0gbTIpIHtcclxuICAgICAgICAgIGNvbnN0IGZyYWMgPSBtMiAhPT0gbTEgPyAobSAtIG0xKSAvIChtMiAtIG0xKSA6IDBcclxuICAgICAgICAgIHB0ID0geyB4OiB2ZXJ0aWNlc1tpXVswXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzBdIC0gdmVydGljZXNbaV1bMF0pLCB5OiB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pIH1cclxuICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIXB0KSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBbR3JhcGhpYywgUG9pbnQsIFNpbXBsZU1hcmtlclN5bWJvbCwgVGV4dFN5bWJvbF0gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL2dlb21ldHJ5L1BvaW50JykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKSxcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLlN5c3RlbUpTLmltcG9ydCgnZXNyaS9zeW1ib2xzL1RleHRTeW1ib2wnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgXSlcclxuXHJcbiAgICBjb25zdCBjb2xvciA9IHdoaWNoID09PSAnZnJvbScgPyBbMzQsIDEzOSwgMzQsIDI1NV0gOiBbMTgwLCAwLCAwLCAyNTVdXHJcbiAgICBjb25zdCBsYWJlbCA9IHdoaWNoID09PSAnZnJvbScgPyBgRnJvbTogJHttLnRvRml4ZWQoMyl9YCA6IGBUbzogJHttLnRvRml4ZWQoMyl9YFxyXG5cclxuICAgIGNvbnN0IHBvaW50R3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHB0LngsIHk6IHB0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3IsIHNpemU6IDEyLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgIH0pXHJcbiAgICBjb25zdCBsYWJlbEdyYXBoaWMgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiBwdC54LCB5OiBwdC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgIHN5bWJvbDogbmV3IFRleHRTeW1ib2woeyB0ZXh0OiBsYWJlbCwgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgaGFsb0NvbG9yOiBbMCwgMCwgMF0sIGhhbG9TaXplOiAxLjUsIGZvbnQ6IHsgc2l6ZTogMTEsIHdlaWdodDogJ2JvbGQnIH0sIHlvZmZzZXQ6IDE0IH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHJlZi5jdXJyZW50ID0gW3BvaW50R3JhcGhpYywgbGFiZWxHcmFwaGljXVxyXG4gICAgY29uc3QgbGF5ZXIgPSByb3V0ZVByZXZpZXdMYXllclJlZi5jdXJyZW50XHJcbiAgICBpZiAobGF5ZXIpIHsgbGF5ZXIuYWRkKHBvaW50R3JhcGhpYyk7IGxheWVyLmFkZChsYWJlbEdyYXBoaWMpIH1cclxuICAgIGVsc2UgeyB2aWV3LmdyYXBoaWNzLmFkZChwb2ludEdyYXBoaWMpOyB2aWV3LmdyYXBoaWNzLmFkZChsYWJlbEdyYXBoaWMpIH1cclxuICB9LCBbXSlcclxuICBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQgPSBzaG93TWVhc3VyZVBvaW50XHJcblxyXG4gIC8vIFBpY2sgZnJvbS90byBtZWFzdXJlIG9uIG1hcCAoc25hcCB0byByb3V0ZSBnZW9tZXRyeSlcclxuICBjb25zdCBzdGFydFBpY2tNZWFzdXJlID0gdXNlQ2FsbGJhY2soKHdoaWNoOiAnZnJvbScgfCAndG8nKSA9PiB7XHJcbiAgICBpZiAoIWppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgfHwgIWxyc1NlcnZpY2VSZWYuY3VycmVudCkgcmV0dXJuXHJcbiAgICBpZiAoIXJvdXRlSWQudHJpbSgpKSB7IHNldEVycm9yKCdTZWxlY3QgYSByb3V0ZSBmaXJzdCcpOyByZXR1cm4gfVxyXG4gICAgaWYgKCFyb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50KSB7IHNldEVycm9yKCdSb3V0ZSBnZW9tZXRyeSBub3QgbG9hZGVkJyk7IHJldHVybiB9XHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG5cclxuICAgIGlmIChtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudCkgeyBtZWFzdXJlUGlja0hhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBtZWFzdXJlUGlja0hvdmVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICBzZXRQaWNraW5nTWVhc3VyZSh3aGljaClcclxuICAgIHZpZXcuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXHJcblxyXG4gICAgY29uc3QgbW9kdWxlc1Byb21pc2UgPSBQcm9taXNlLmFsbChbXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvR3JhcGhpYycpLnRoZW4oKG06IGFueSkgPT4gbS5kZWZhdWx0IHx8IG0pLFxyXG4gICAgICAod2luZG93IGFzIGFueSkuU3lzdGVtSlMuaW1wb3J0KCdlc3JpL3N5bWJvbHMvU2ltcGxlTWFya2VyU3ltYm9sJykudGhlbigobTogYW55KSA9PiBtLmRlZmF1bHQgfHwgbSksXHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5TeXN0ZW1KUy5pbXBvcnQoJ2VzcmkvZ2VvbWV0cnkvUG9pbnQnKS50aGVuKChtOiBhbnkpID0+IG0uZGVmYXVsdCB8fCBtKVxyXG4gICAgXSlcclxuXHJcbiAgICBpZiAoIW1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQpIHtcclxuICAgICAgY29uc3QgdGlwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcclxuICAgICAgdGlwLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7cG9pbnRlci1ldmVudHM6bm9uZTtiYWNrZ3JvdW5kOiMzMzM7Y29sb3I6I2ZmZjtwYWRkaW5nOjRweCA4cHg7Ym9yZGVyLXJhZGl1czo0cHg7Zm9udC1zaXplOjEycHg7d2hpdGUtc3BhY2U6bm93cmFwO3otaW5kZXg6OTk5OTk7ZGlzcGxheTpub25lO2JveC1zaGFkb3c6MCAycHggNnB4IHJnYmEoMCwwLDAsMC4zKTsnXHJcbiAgICAgIHZpZXcuY29udGFpbmVyLmFwcGVuZENoaWxkKHRpcClcclxuICAgICAgbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCA9IHRpcFxyXG4gICAgfVxyXG4gICAgY29uc3QgdG9vbHRpcCA9IG1lYXN1cmVUb29sdGlwUmVmLmN1cnJlbnQhXHJcbiAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuXHJcbiAgICBjb25zdCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9ID0gcm91dGVQcmV2aWV3VmVydHNSZWYuY3VycmVudCFcclxuXHJcbiAgICBmdW5jdGlvbiBuZWFyZXN0TU9uUm91dGUgKHB4OiBudW1iZXIsIHB5OiBudW1iZXIpOiB7IG06IG51bWJlcjsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xyXG4gICAgICBsZXQgYmVzdERpc3QgPSBJbmZpbml0eSwgYmVzdFggPSBweCwgYmVzdFkgPSBweSwgYmVzdE0gPSAwXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsVmVydHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgW2F4LCBheV0gPSBhbGxWZXJ0c1tpXVxyXG4gICAgICAgIGNvbnN0IFtieCwgYnldID0gYWxsVmVydHNbaSArIDFdXHJcbiAgICAgICAgY29uc3QgbUEgPSBhbGxWZXJ0c1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgbUIgPSBhbGxWZXJ0c1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5XHJcbiAgICAgICAgY29uc3QgbGVuU3EgPSBkeCAqIGR4ICsgZHkgKiBkeVxyXG4gICAgICAgIGlmIChsZW5TcSA9PT0gMCkgY29udGludWVcclxuICAgICAgICBsZXQgdCA9ICgocHggLSBheCkgKiBkeCArIChweSAtIGF5KSAqIGR5KSAvIGxlblNxXHJcbiAgICAgICAgdCA9IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHQpKVxyXG4gICAgICAgIGNvbnN0IGN4ID0gYXggKyB0ICogZHgsIGN5ID0gYXkgKyB0ICogZHlcclxuICAgICAgICBjb25zdCBkID0gKHB4IC0gY3gpICogKHB4IC0gY3gpICsgKHB5IC0gY3kpICogKHB5IC0gY3kpXHJcbiAgICAgICAgaWYgKGQgPCBiZXN0RGlzdCkgeyBiZXN0RGlzdCA9IGQ7IGJlc3RYID0gY3g7IGJlc3RZID0gY3k7IGJlc3RNID0gbUEgKyB0ICogKG1CIC0gbUEpIH1cclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmVzdERpc3QgPCBJbmZpbml0eSA/IHsgbTogYmVzdE0sIHg6IGJlc3RYLCB5OiBiZXN0WSB9IDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8vIFBvaW50ZXItbW92ZTogc25hcCBhbmQgc2hvdyBNIHZhbHVlXHJcbiAgICBtb2R1bGVzUHJvbWlzZS50aGVuKChbR3JhcGhpYywgU2ltcGxlTWFya2VyU3ltYm9sLCBQb2ludF0pID0+IHtcclxuICAgICAgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50ID0gdmlldy5vbigncG9pbnRlci1tb3ZlJywgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICBjb25zdCBtYXBQb2ludCA9IHZpZXcudG9NYXAoeyB4OiBldmVudC54LCB5OiBldmVudC55IH0pXHJcbiAgICAgICAgaWYgKCFtYXBQb2ludCkgcmV0dXJuXHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gbmVhcmVzdE1PblJvdXRlKG1hcFBvaW50LngsIG1hcFBvaW50LnkpXHJcbiAgICAgICAgaWYgKCFyZXN1bHQpIHJldHVyblxyXG5cclxuICAgICAgICB0b29sdGlwLnN0eWxlLmxlZnQgPSBgJHtldmVudC54ICsgMTR9cHhgXHJcbiAgICAgICAgdG9vbHRpcC5zdHlsZS50b3AgPSBgJHtldmVudC55IC0gNDB9cHhgXHJcbiAgICAgICAgdG9vbHRpcC50ZXh0Q29udGVudCA9IGBNOiAke3Jlc3VsdC5tLnRvRml4ZWQoMyl9YFxyXG4gICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgaWYgKG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgICBtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHJlc3VsdC54LCB5OiByZXN1bHQueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnN0IGcgPSBuZXcgR3JhcGhpYyh7XHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgUG9pbnQoeyB4OiByZXN1bHQueCwgeTogcmVzdWx0LnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgc3ltYm9sOiBuZXcgU2ltcGxlTWFya2VyU3ltYm9sKHsgY29sb3I6IFsyNTUsIDg3LCAzNCwgMjU1XSwgc2l6ZTogMTAsIG91dGxpbmU6IHsgY29sb3I6IFsyNTUsIDI1NSwgMjU1XSwgd2lkdGg6IDIgfSB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gZ1xyXG4gICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoZylcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBDbGljazogc2V0IHRoZSBtZWFzdXJlIHZhbHVlXHJcbiAgICAgIG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gdmlldy5vbignY2xpY2snLCAoZXZlbnQ6IGFueSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG1hcFBvaW50ID0gdmlldy50b01hcCh7IHg6IGV2ZW50LngsIHk6IGV2ZW50LnkgfSlcclxuICAgICAgICBpZiAoIW1hcFBvaW50KSByZXR1cm5cclxuICAgICAgICBjb25zdCByZXN1bHQgPSBuZWFyZXN0TU9uUm91dGUobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICBpZiAocmVzdWx0KSB7XHJcbiAgICAgICAgICBjb25zdCBtVmFsID0gcmVzdWx0Lm0udG9GaXhlZCgzKVxyXG4gICAgICAgICAgaWYgKHdoaWNoID09PSAnZnJvbScpIHtcclxuICAgICAgICAgICAgc2V0RnJvbU1lYXN1cmUobVZhbClcclxuICAgICAgICAgICAgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCdmcm9tJywgbVZhbClcclxuICAgICAgICAgICAgY2FuY2VsUGlja01lYXN1cmUoKVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHN0YXJ0UGlja01lYXN1cmUoJ3RvJyksIDUwKVxyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFRvTWVhc3VyZShtVmFsKVxyXG4gICAgICAgICAgICBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgbVZhbClcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY2FuY2VsUGlja01lYXN1cmUoKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9LCBbY29uZmlnLCByb3V0ZUlkXSlcclxuXHJcbiAgY29uc3QgY2FuY2VsUGlja01lYXN1cmUgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAobWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQpIHsgbWVhc3VyZVBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IG1lYXN1cmVQaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAobWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50KSB7IG1lYXN1cmVQaWNrSG92ZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgbWVhc3VyZVBpY2tIb3ZlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAobWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudCkgbWVhc3VyZVRvb2x0aXBSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBpZiAobWVhc3VyZVNuYXBHcmFwaGljUmVmLmN1cnJlbnQgJiYgamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldykge1xyXG4gICAgICAoamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueSkuZ3JhcGhpY3MucmVtb3ZlKG1lYXN1cmVTbmFwR3JhcGhpY1JlZi5jdXJyZW50KVxyXG4gICAgICBtZWFzdXJlU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGxcclxuICAgIH1cclxuICAgIGlmIChqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3KSB7XHJcbiAgICAgIChqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55KS5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJydcclxuICAgIH1cclxuICAgIHNldFBpY2tpbmdNZWFzdXJlKG51bGwpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIENsZWFyIGFsbCByb3V0ZSBwcmV2aWV3IGdyYXBoaWNzXHJcbiAgY29uc3QgY2xlYXJSb3V0ZVByZXZpZXcgPSB1c2VDYWxsYmFjaygoKSA9PiB7XHJcbiAgICBpZiAocm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudCkgcm91dGVQcmV2aWV3TGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG4gICAgcm91dGVQcmV2aWV3R3JhcGhpY1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gICAgZnJvbU1lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICB0b01lYXN1cmVHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsXHJcbiAgICByb3V0ZVByZXZpZXdWZXJ0c1JlZi5jdXJyZW50ID0gbnVsbFxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyBQaWNrIHJvdXRlIGZyb20gbWFwICh3aXRoIGhvdmVyIHRvb2x0aXAgKyBzbmFwIGdyYXBoaWMgbGlrZSByb2FkLWxvZylcclxuICBjb25zdCBzdGFydFBpY2tGcm9tTWFwID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICBpZiAocGlja0hhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAocGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcblxyXG4gICAgc2V0UGlja2luZ0Zyb21NYXAodHJ1ZSlcclxuICAgIHZpZXcuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXHJcblxyXG4gICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgcXVlcnlVcmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcbiAgICBjb25zdCBvdXRGaWVsZHMgPSBgJHtyb3V0ZUZpZWxkfSwke25hbWVGaWVsZH1gXHJcbiAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuXHJcbiAgICAvLyBDcmVhdGUgdG9vbHRpcFxyXG4gICAgaWYgKCFwaWNrVG9vbHRpcFJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIHRpcC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlO3BvaW50ZXItZXZlbnRzOm5vbmU7YmFja2dyb3VuZDojMzMzO2NvbG9yOiNmZmY7cGFkZGluZzo0cHggOHB4O2JvcmRlci1yYWRpdXM6NHB4O2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt6LWluZGV4Ojk5OTk5O2Rpc3BsYXk6bm9uZTtib3gtc2hhZG93OjAgMnB4IDZweCByZ2JhKDAsMCwwLDAuMyk7J1xyXG4gICAgICB2aWV3LmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXApXHJcbiAgICAgIHBpY2tUb29sdGlwUmVmLmN1cnJlbnQgPSB0aXBcclxuICAgIH1cclxuICAgIGNvbnN0IHRvb2x0aXAgPSBwaWNrVG9vbHRpcFJlZi5jdXJyZW50IVxyXG4gICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG4gICAgbGV0IGxhc3RRdWVyeUlkID0gMFxyXG4gICAgbGV0IGNhY2hlZFBhdGhzOiBudW1iZXJbXVtdW11bXSA9IFtdXHJcbiAgICBsZXQgY2FjaGVkTGFiZWxzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICBsZXQgbGFzdFF1ZXJ5UHQ6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwgPSBudWxsXHJcbiAgICBjb25zdCBSRVFVRVJZX0RJU1QgPSA4MFxyXG5cclxuICAgIC8vIExvYWQgQXJjR0lTIG1vZHVsZXMgZm9yIHNuYXAgZ3JhcGhpY1xyXG4gICAgY29uc3QgbW9kdWxlc1Byb21pc2UgPSBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9HcmFwaGljJywgJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnLCAnZXNyaS9nZW9tZXRyeS9Qb2ludCddLCAoLi4ubTogYW55W10pID0+IHJlc29sdmUobSkpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIEhlbHBlcjogc25hcCB0byBuZWFyZXN0IHBvaW50IG9uIGNhY2hlZCBwYXRoc1xyXG4gICAgZnVuY3Rpb24gc25hcFRvTmVhcmVzdCAocHg6IG51bWJlciwgcHk6IG51bWJlcik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xyXG4gICAgICBsZXQgYmVzdERpc3QgPSBJbmZpbml0eSwgYmVzdFggPSBweCwgYmVzdFkgPSBweVxyXG4gICAgICBmb3IgKGNvbnN0IHBhdGhzIG9mIGNhY2hlZFBhdGhzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtheCwgYXldID0gcGF0aFtpXVxyXG4gICAgICAgICAgICBjb25zdCBbYngsIGJ5XSA9IHBhdGhbaSArIDFdXHJcbiAgICAgICAgICAgIGNvbnN0IGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5XHJcbiAgICAgICAgICAgIGNvbnN0IGxlblNxID0gZHggKiBkeCArIGR5ICogZHlcclxuICAgICAgICAgICAgaWYgKGxlblNxID09PSAwKSBjb250aW51ZVxyXG4gICAgICAgICAgICBsZXQgdCA9ICgocHggLSBheCkgKiBkeCArIChweSAtIGF5KSAqIGR5KSAvIGxlblNxXHJcbiAgICAgICAgICAgIHQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB0KSlcclxuICAgICAgICAgICAgY29uc3QgY3ggPSBheCArIHQgKiBkeCwgY3kgPSBheSArIHQgKiBkeVxyXG4gICAgICAgICAgICBjb25zdCBkID0gKHB4IC0gY3gpICogKHB4IC0gY3gpICsgKHB5IC0gY3kpICogKHB5IC0gY3kpXHJcbiAgICAgICAgICAgIGlmIChkIDwgYmVzdERpc3QpIHsgYmVzdERpc3QgPSBkOyBiZXN0WCA9IGN4OyBiZXN0WSA9IGN5IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGJlc3REaXN0IDwgSW5maW5pdHkgPyB7IHg6IGJlc3RYLCB5OiBiZXN0WSB9IDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhvdmVyOiBzaG93IHJvdXRlIG5hbWUgdG9vbHRpcCArIHNuYXAgZ3JhcGhpY1xyXG4gICAgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gdmlldy5vbigncG9pbnRlci1tb3ZlJywgYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7ZXZlbnQueCArIDE0fXB4YFxyXG4gICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IGAke2V2ZW50LnkgLSA0MH1weGBcclxuXHJcbiAgICAgIGNvbnN0IG1hcFBvaW50ID0gdmlldy50b01hcCh7IHg6IGV2ZW50LngsIHk6IGV2ZW50LnkgfSlcclxuICAgICAgaWYgKCFtYXBQb2ludCkgcmV0dXJuXHJcblxyXG4gICAgICAvLyBTbmFwIHVzaW5nIGNhY2hlZCBnZW9tZXRyeVxyXG4gICAgICBpZiAoY2FjaGVkUGF0aHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHNuYXAgPSBzbmFwVG9OZWFyZXN0KG1hcFBvaW50LngsIG1hcFBvaW50LnkpXHJcbiAgICAgICAgaWYgKHNuYXApIHtcclxuICAgICAgICAgIGNvbnN0IFtHcmFwaGljLCBTaW1wbGVNYXJrZXJTeW1ib2wsIFBvaW50XSA9IGF3YWl0IG1vZHVsZXNQcm9taXNlXHJcbiAgICAgICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQuZ2VvbWV0cnkgPSBuZXcgUG9pbnQoeyB4OiBzbmFwLngsIHk6IHNuYXAueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzbmFwR3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgICBzeW1ib2w6IG5ldyBTaW1wbGVNYXJrZXJTeW1ib2woeyBjb2xvcjogWzAsIDEyMiwgMjU1LCAyNTVdLCBzaXplOiAxMCwgb3V0bGluZTogeyBjb2xvcjogWzI1NSwgMjU1LCAyNTVdLCB3aWR0aDogMiB9IH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gc25hcEdyYXBoaWNcclxuICAgICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoc25hcEdyYXBoaWMpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBjdXJzb3IgbW92ZWQgZmFyIGVub3VnaCB0byByZS1xdWVyeVxyXG4gICAgICBpZiAobGFzdFF1ZXJ5UHQpIHtcclxuICAgICAgICBjb25zdCBkeCA9IG1hcFBvaW50LnggLSBsYXN0UXVlcnlQdC54XHJcbiAgICAgICAgY29uc3QgZHkgPSBtYXBQb2ludC55IC0gbGFzdFF1ZXJ5UHQueVxyXG4gICAgICAgIGlmIChNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpIDwgUkVRVUVSWV9ESVNUKSByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudClcclxuICAgICAgcGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcXVlcnlJZCA9ICsrbGFzdFF1ZXJ5SWRcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgICBnZW9tZXRyeTogSlNPTi5zdHJpbmdpZnkobWFwUG9pbnQudG9KU09OKCkpLFxyXG4gICAgICAgICAgICBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2ludCcsXHJcbiAgICAgICAgICAgIHNwYXRpYWxSZWw6ICdlc3JpU3BhdGlhbFJlbEludGVyc2VjdHMnLFxyXG4gICAgICAgICAgICBkaXN0YW5jZTogJzUwJyxcclxuICAgICAgICAgICAgdW5pdHM6ICdlc3JpU1JVbml0X01ldGVyJyxcclxuICAgICAgICAgICAgb3V0RmllbGRzLFxyXG4gICAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICc1JyxcclxuICAgICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHF1ZXJ5VXJsLCBwYXJhbXMpXHJcbiAgICAgICAgICBpZiAocXVlcnlJZCAhPT0gbGFzdFF1ZXJ5SWQpIHJldHVyblxyXG4gICAgICAgICAgbGFzdFF1ZXJ5UHQgPSB7IHg6IG1hcFBvaW50LngsIHk6IG1hcFBvaW50LnkgfVxyXG5cclxuICAgICAgICAgIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNhY2hlZFBhdGhzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4gZi5nZW9tZXRyeT8ucGF0aHMgfHwgW10pXHJcbiAgICAgICAgICAgIGNhY2hlZExhYmVscyA9IGpzb24uZmVhdHVyZXMubWFwKChmOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCByaWQgPSBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF0gfHwgJydcclxuICAgICAgICAgICAgICBjb25zdCBybmFtZSA9IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJuYW1lID8gYCR7cm5hbWV9ICgke3JpZH0pYCA6IHJpZFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gY2FjaGVkTGFiZWxzLmpvaW4oJ1xcbicpXHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUud2hpdGVTcGFjZSA9IGNhY2hlZExhYmVscy5sZW5ndGggPiAxID8gJ3ByZS1saW5lJyA6ICdub3dyYXAnXHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBzbmFwIHdpdGggZnJlc2ggZ2VvbWV0cnlcclxuICAgICAgICAgICAgY29uc3Qgc25hcCA9IHNuYXBUb05lYXJlc3QobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICAgICAgaWYgKHNuYXApIHtcclxuICAgICAgICAgICAgICBjb25zdCBbR3JhcGhpYywgU2ltcGxlTWFya2VyU3ltYm9sLCBQb2ludF0gPSBhd2FpdCBtb2R1bGVzUHJvbWlzZVxyXG4gICAgICAgICAgICAgIGlmIChxdWVyeUlkICE9PSBsYXN0UXVlcnlJZCkgcmV0dXJuXHJcbiAgICAgICAgICAgICAgaWYgKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSlcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgICAgICAgICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yOiBbMCwgMTIyLCAyNTUsIDI1NV0sIHNpemU6IDEwLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IGdcclxuICAgICAgICAgICAgICAgIHZpZXcuZ3JhcGhpY3MuYWRkKGcpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgY2FjaGVkUGF0aHMgPSBbXVxyXG4gICAgICAgICAgICBjYWNoZWRMYWJlbHMgPSBbXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgfVxyXG4gICAgICB9LCAxMDApXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIENsaWNrOiBzZWxlY3Qgcm91dGVcclxuICAgIHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdjbGljaycsIGFzeW5jIChldmVudDogYW55KSA9PiB7XHJcbiAgICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgICAgaWYgKHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgICBpZiAocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KVxyXG4gICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgdmlldy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJydcclxuICAgICAgc2V0UGlja2luZ0Zyb21NYXAoZmFsc2UpXHJcbiAgICAgIC8vIFJlbW92ZSBzbmFwIGdyYXBoaWNcclxuICAgICAgaWYgKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7IHZpZXcuZ3JhcGhpY3MucmVtb3ZlKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KTsgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgZ2VvbWV0cnk6IEpTT04uc3RyaW5naWZ5KGV2ZW50Lm1hcFBvaW50LnRvSlNPTigpKSxcclxuICAgICAgICAgIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvaW50JyxcclxuICAgICAgICAgIHNwYXRpYWxSZWw6ICdlc3JpU3BhdGlhbFJlbEludGVyc2VjdHMnLFxyXG4gICAgICAgICAgZGlzdGFuY2U6ICc1MCcsXHJcbiAgICAgICAgICB1bml0czogJ2VzcmlTUlVuaXRfTWV0ZXInLFxyXG4gICAgICAgICAgb3V0RmllbGRzLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHF1ZXJ5VXJsLCBwYXJhbXMpXHJcblxyXG4gICAgICAgIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnLFxyXG4gICAgICAgICAgICByb3V0ZU5hbWU6IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcclxuICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IGNhbmRpZGF0ZXMuZmlsdGVyKChjOiBhbnkpID0+IHsgaWYgKHNlZW4uaGFzKGMucm91dGVJZCkpIHJldHVybiBmYWxzZTsgc2Vlbi5hZGQoYy5yb3V0ZUlkKTsgcmV0dXJuIHRydWUgfSlcclxuICAgICAgICAgIGlmICh1bmlxdWUubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzZXRSb3V0ZVBpY2tDYW5kaWRhdGVzKHVuaXF1ZSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFJvdXRlSWQodW5pcXVlWzBdLnJvdXRlSWQpXHJcbiAgICAgICAgICAgIHNldFJvdXRlTmFtZSh1bmlxdWVbMF0ucm91dGVOYW1lKVxyXG4gICAgICAgICAgICBmZXRjaFJvdXRlTWVhc3VyZXModW5pcXVlWzBdLnJvdXRlSWQpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGF0dHJzID0ganNvbi5mZWF0dXJlc1swXS5hdHRyaWJ1dGVzXHJcbiAgICAgICAgICBjb25zdCByaWQgPSBhdHRyc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgY29uc3Qgcm5hbWUgPSBhdHRyc1tuYW1lRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICBzZXRSb3V0ZUlkKHJpZClcclxuICAgICAgICAgIHNldFJvdXRlTmFtZShybmFtZSB8fCByaWQpXHJcbiAgICAgICAgICBmZXRjaFJvdXRlTWVhc3VyZXMocmlkKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZXRFcnJvcignTm8gcm91dGUgZm91bmQgYXQgdGhhdCBsb2NhdGlvbicpXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gaWRlbnRpZnkgcm91dGU6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9LCBbY29uZmlnLCBmZXRjaFJvdXRlTWVhc3VyZXNdKVxyXG5cclxuICBjb25zdCBjYW5jZWxQaWNrRnJvbU1hcCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICBpZiAocGlja1Rvb2x0aXBSZWYuY3VycmVudCkgcGlja1Rvb2x0aXBSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBpZiAoamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldykge1xyXG4gICAgICBjb25zdCB2ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG4gICAgICB2LmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJ1xyXG4gICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHsgdi5ncmFwaGljcy5yZW1vdmUocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpOyBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgfVxyXG4gICAgc2V0UGlja2luZ0Zyb21NYXAoZmFsc2UpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIERyYXcgcG9seWdvbiB0byBzZWxlY3QgbXVsdGlwbGUgcm91dGVzXHJcbiAgY29uc3Qgc3RhcnREcmF3QXJlYSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSByZXR1cm5cclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcblxyXG4gICAgc2V0RHJhd2luZyh0cnVlKVxyXG4gICAgc2V0TWFwUm91dGVzKFtdKVxyXG4gICAgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkcyhuZXcgU2V0KCkpXHJcblxyXG4gICAgY29uc3QgW0dyYXBoaWNzTGF5ZXIsIFNrZXRjaFZpZXdNb2RlbF0gPSBhd2FpdCBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9sYXllcnMvR3JhcGhpY3NMYXllcicsICdlc3JpL3dpZGdldHMvU2tldGNoL1NrZXRjaFZpZXdNb2RlbCddLCAoLi4ubTogYW55W10pID0+IHJlc29sdmUobSkpXHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCA9IG5ldyBHcmFwaGljc0xheWVyKHsgdGl0bGU6ICdDcmFzaFJpc2sgRHJhdycgfSlcclxuICAgICAgdmlldy5tYXAuYWRkKGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudClcclxuICAgIH1cclxuICAgIGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG5cclxuICAgIGlmICghc2tldGNoVk1SZWYuY3VycmVudCkge1xyXG4gICAgICBza2V0Y2hWTVJlZi5jdXJyZW50ID0gbmV3IFNrZXRjaFZpZXdNb2RlbCh7IHZpZXcsIGxheWVyOiBncmFwaGljc0xheWVyUmVmLmN1cnJlbnQgfSlcclxuICAgIH1cclxuXHJcbiAgICBza2V0Y2hWTVJlZi5jdXJyZW50LmNyZWF0ZSgncG9seWdvbicpXHJcbiAgICBza2V0Y2hWTVJlZi5jdXJyZW50Lm9uKCdjcmVhdGUnLCBhc3luYyAoZXZ0OiBhbnkpID0+IHtcclxuICAgICAgaWYgKGV2dC5zdGF0ZSAhPT0gJ2NvbXBsZXRlJykgcmV0dXJuXHJcbiAgICAgIHNldERyYXdpbmcoZmFsc2UpXHJcblxyXG4gICAgICBjb25zdCBwb2x5Z29uID0gZXZ0LmdyYXBoaWMuZ2VvbWV0cnlcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgICAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgICAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgICAgIC8vIFVzZSBlbnZlbG9wZSBnZW9tZXRyeSBmb3IgSlNPTlAgKHBvbHlnb24gSlNPTiBpcyB0b28gbGFyZ2UgZm9yIEdFVClcclxuICAgICAgICBjb25zdCBleHQgPSBwb2x5Z29uLmV4dGVudFxyXG4gICAgICAgIGNvbnN0IGVudmVsb3BlSnNvbiA9IHsgeG1pbjogZXh0LnhtaW4sIHltaW46IGV4dC55bWluLCB4bWF4OiBleHQueG1heCwgeW1heDogZXh0LnltYXgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZDogdmlld1draWQgfSB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIGdlb21ldHJ5OiBKU09OLnN0cmluZ2lmeShlbnZlbG9wZUpzb24pLFxyXG4gICAgICAgICAgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5RW52ZWxvcGUnLFxyXG4gICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICBvdXRGaWVsZHM6IGAke3JvdXRlRmllbGR9LCR7bmFtZUZpZWxkfWAsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgICAgb3V0U1I6IFN0cmluZyh2aWV3V2tpZCksXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzIwMCcsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgICAgY29uc3Qgcm91dGVzID0gKGRhdGEuZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByaWQgPSBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF1cclxuICAgICAgICAgIGNvbnN0IHBhdGhzID0gZi5nZW9tZXRyeT8ucGF0aHMgfHwgW11cclxuICAgICAgICAgIGNvbnN0IGFsbFZlcnRzOiBudW1iZXJbXVtdID0gcGF0aHMuZmxhdCgpXHJcbiAgICAgICAgICBjb25zdCBoYXNaID0gZi5nZW9tZXRyeT8uaGFzWlxyXG4gICAgICAgICAgY29uc3QgbUlkeCA9IGhhc1ogPyAzIDogMlxyXG4gICAgICAgICAgbGV0IG1pbk0gPSAwLCBtYXhNID0gMFxyXG4gICAgICAgICAgaWYgKGFsbFZlcnRzLmxlbmd0aCA+IDAgJiYgbUlkeCA8IGFsbFZlcnRzWzBdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBtZWFzdXJlcyA9IGFsbFZlcnRzLm1hcCh2ID0+IHZbbUlkeF0pLmZpbHRlcihtID0+IG0gIT0gbnVsbCAmJiAhaXNOYU4obSkpXHJcbiAgICAgICAgICAgIGlmIChtZWFzdXJlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgbWluTSA9IE1hdGgubWluKC4uLm1lYXN1cmVzKVxyXG4gICAgICAgICAgICAgIG1heE0gPSBNYXRoLm1heCguLi5tZWFzdXJlcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5zZXQocmlkLCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHsgcm91dGVJZDogcmlkLCByb3V0ZU5hbWU6IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8IG51bGwsIGZyb21NZWFzdXJlOiBtaW5NLCB0b01lYXN1cmU6IG1heE0gfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgc2V0TWFwUm91dGVzKHJvdXRlcylcclxuICAgICAgICBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQocm91dGVzLm1hcCgocjogYW55KSA9PiByLnJvdXRlSWQpKSlcclxuICAgICAgICBzZXRTZWFyY2hNb2RlKCdtYXAnKVxyXG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgICAgICBzZXRFcnJvcignQXJlYSBxdWVyeSBmYWlsZWQ6ICcgKyAoZS5tZXNzYWdlIHx8IGUpKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0sIFtjb25maWddKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBRVUVSWSBFVkVOVCBEQVRBIChpbnRlcm5hbCwgdHJpZ2dlcmVkIGJ5IFJ1bikgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgcXVlcnlFdmVudERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKTogUHJvbWlzZTxhbnlbXT4gPT4ge1xyXG4gICAgaWYgKCFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHRocm93IG5ldyBFcnJvcignTm8gTFJTIHNlcnZpY2UgY29uZmlndXJlZCcpXHJcblxyXG4gICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcblxyXG4gICAgbGV0IHJvdXRlSWRzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICBpZiAoc2VhcmNoTW9kZSA9PT0gJ21hcCcpIHtcclxuICAgICAgcm91dGVJZHMgPSBBcnJheS5mcm9tKHNlbGVjdGVkTWFwUm91dGVJZHMpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXJvdXRlSWQudHJpbSgpKSB0aHJvdyBuZXcgRXJyb3IoJ0VudGVyIGEgUm91dGUgSUQgb3Igc2VsZWN0IGZyb20gbWFwLicpXHJcbiAgICAgIHJvdXRlSWRzID0gW3JvdXRlSWQudHJpbSgpXVxyXG4gICAgfVxyXG4gICAgaWYgKHJvdXRlSWRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyByb3V0ZXMgc2VsZWN0ZWQuJylcclxuXHJcbiAgICBjb25zdCBhbGxFbnRyaWVzOiBhbnlbXSA9IFtdXHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGZvciAoY29uc3QgY2ZnIG9mIGV2ZW50Q29uZmlncykge1xyXG4gICAgICBjb25zdCBsYXllclVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y2ZnLmxheWVySWR9L3F1ZXJ5YFxyXG4gICAgICBmb3IgKGNvbnN0IHJpZCBvZiByb3V0ZUlkcykge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlSWRGaWVsZCA9IGNmZy5yb3V0ZUlkRmllbGQgfHwgJ3JvdXRlaWQnXHJcbiAgICAgICAgY29uc3Qgd2hlcmUgPSBgJHtyb3V0ZUlkRmllbGR9ID0gJyR7cmlkLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYFxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIHdoZXJlLFxyXG4gICAgICAgICAgb3V0RmllbGRzOiAnKicsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgICAgIHJlc3VsdFJlY29yZENvdW50OiAnNTAwMCcsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IGxyc1NlcnZpY2VSZWYuY3VycmVudCEucXVlcnlGZWF0dXJlc0RpcmVjdChsYXllclVybCwgcGFyYW1zKVxyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiAoZGF0YS5mZWF0dXJlcyB8fCBbXSkpIHtcclxuICAgICAgICAgIGNvbnN0IG1lYXN1cmVGaWVsZCA9IGNmZy5tZWFzdXJlRmllbGQgfHwgY2ZnLmZyb21NZWFzdXJlRmllbGQgfHwgJ21lYXN1cmUnXHJcbiAgICAgICAgICBhbGxFbnRyaWVzLnB1c2goe1xyXG4gICAgICAgICAgICBGZWF0dXJlOiBjZmcubmFtZSxcclxuICAgICAgICAgICAgUm91dGVJRDogZi5hdHRyaWJ1dGVzW3JvdXRlSWRGaWVsZF0gfHwgZi5hdHRyaWJ1dGVzWydyb3V0ZWlkJ10sXHJcbiAgICAgICAgICAgIE1lYXN1cmU6IGYuYXR0cmlidXRlc1ttZWFzdXJlRmllbGRdID8/IGYuYXR0cmlidXRlc1tjZmcuZnJvbU1lYXN1cmVGaWVsZF0sXHJcbiAgICAgICAgICAgIC4uLk9iamVjdC5mcm9tRW50cmllcygoY2ZnLmF0dHJpYnV0ZXMgfHwgW10pLm1hcChhID0+IFthLCBmLmF0dHJpYnV0ZXNbYV1dKSlcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRW5zdXJlIHJvdXRlIGdlb21ldHJpZXMgYXJlIGNhY2hlZFxyXG4gICAgZm9yIChjb25zdCByaWQgb2Ygcm91dGVJZHMpIHtcclxuICAgICAgaWYgKCFyb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5oYXMocmlkKSkge1xyXG4gICAgICAgIGF3YWl0IGZldGNoUm91dGVNZWFzdXJlcyhyaWQpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYWxsRW50cmllc1xyXG4gIH0sIFtjb25maWcsIHJvdXRlSWQsIHNlYXJjaE1vZGUsIHNlbGVjdGVkTWFwUm91dGVJZHMsIGZldGNoUm91dGVNZWFzdXJlc10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IERJU1BMQVkgT04gTUFQID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIGNvbnN0IGRpc3BsYXlQcmVkaWN0aW9uT25NYXAgPSB1c2VDYWxsYmFjayhhc3luYyAobGF5ZXJVcmw6IHN0cmluZywgdG9rZW46IHN0cmluZywgd2tpZDogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgIGlmICghdmlldykgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgW0ZlYXR1cmVMYXllcl0gPSBhd2FpdCBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9sYXllcnMvRmVhdHVyZUxheWVyJ10sICguLi5tb2RzOiBhbnlbXSkgPT4gcmVzb2x2ZShtb2RzKSlcclxuICAgIH0pXHJcblxyXG4gICAgY29uc3QgZXhpc3RpbmdMYXllciA9IHZpZXcubWFwLmFsbExheWVycy5maW5kKChsOiBhbnkpID0+IGwudGl0bGUgPT09ICdDcmFzaCBSaXNrIFByZWRpY3Rpb24nKVxyXG4gICAgaWYgKGV4aXN0aW5nTGF5ZXIpIHZpZXcubWFwLnJlbW92ZShleGlzdGluZ0xheWVyKVxyXG5cclxuICAgIGNvbnN0IHByZWRpY3Rpb25MYXllciA9IG5ldyBGZWF0dXJlTGF5ZXIoe1xyXG4gICAgICB1cmw6IGxheWVyVXJsLFxyXG4gICAgICB0aXRsZTogJ0NyYXNoIFJpc2sgUHJlZGljdGlvbicsXHJcbiAgICAgIGN1c3RvbVBhcmFtZXRlcnM6IHsgdG9rZW4gfSxcclxuICAgICAgZGVmaW5pdGlvbkV4cHJlc3Npb246ICdyaXNrX3Njb3JlID4gMCcsXHJcbiAgICAgIHJlbmRlcmVyOiB7XHJcbiAgICAgICAgdHlwZTogJ2NsYXNzLWJyZWFrcycsXHJcbiAgICAgICAgZmllbGQ6ICdyaXNrX3Njb3JlJyxcclxuICAgICAgICBjbGFzc0JyZWFrSW5mb3M6IFtcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDEsIG1heFZhbHVlOiAyNSwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbNTYsIDE2OCwgMCwgMjAwXSwgd2lkdGg6IDMgfSwgbGFiZWw6ICdMb3cgUmlzayAoMS0yNSknIH0sXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiAyNiwgbWF4VmFsdWU6IDUwLCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFsyNTUsIDI1NSwgMCwgMjIwXSwgd2lkdGg6IDQgfSwgbGFiZWw6ICdNZWRpdW0gUmlzayAoMjYtNTApJyB9LFxyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogNTEsIG1heFZhbHVlOiA3NSwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbMjU1LCAxMjgsIDAsIDIzMF0sIHdpZHRoOiA1IH0sIGxhYmVsOiAnTWVkaXVtLUhpZ2ggUmlzayAoNTEtNzUpJyB9LFxyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogNzYsIG1heFZhbHVlOiAxMDAsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzI1NSwgMCwgMCwgMjU1XSwgd2lkdGg6IDYgfSwgbGFiZWw6ICdIaWdoIFJpc2sgKDc2LTEwMCknIH1cclxuICAgICAgICBdXHJcbiAgICAgIH0sXHJcbiAgICAgIHBvcHVwVGVtcGxhdGU6IHtcclxuICAgICAgICB0aXRsZTogJ0NyYXNoIFJpc2s6IHtyaXNrX2xldmVsfScsXHJcbiAgICAgICAgY29udGVudDogYDxkaXYgc3R5bGU9XCJmb250LXNpemU6MTNweFwiPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT1cIm1hcmdpbi1ib3R0b206OHB4O3BhZGRpbmctYm90dG9tOjhweDtib3JkZXItYm90dG9tOjFweCBzb2xpZCAjZTBlMGUwXCI+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiZm9udC1zaXplOjI0cHg7Zm9udC13ZWlnaHQ6NzAwO2NvbG9yOntleHByZXNzaW9uL3Jpc2tDb2xvcn1cIj57cmlza19zY29yZX08L3NwYW4+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPVwiY29sb3I6IzY2Njtmb250LXNpemU6MTJweFwiPi8xMDAgcmlzayBzY29yZTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPHRhYmxlIHN0eWxlPVwiYm9yZGVyLWNvbGxhcHNlOmNvbGxhcHNlO3dpZHRoOjEwMCVcIj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPlJvdXRlPC90ZD48dGQ+e3JvdXRlaWR9PC90ZD48L3RyPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+U2VnbWVudDwvdGQ+PHRkPk0ge2Zyb21fbX0gXFx1MjAxMyB7dG9fbX08L3RkPjwvdHI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5SaXNrIExldmVsPC90ZD48dGQgc3R5bGU9XCJmb250LXdlaWdodDo3MDBcIj57cmlza19sZXZlbH08L3RkPjwvdHI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5Db250cmlidXRpbmcgRmFjdG9yczwvdGQ+PHRkPntjb250cmlidXRpbmdfZmFjdG9yc308L3RkPjwvdHI+XHJcbiAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgIDwvZGl2PmAsXHJcbiAgICAgICAgZXhwcmVzc2lvbkluZm9zOiBbe1xyXG4gICAgICAgICAgbmFtZTogJ3Jpc2tDb2xvcicsXHJcbiAgICAgICAgICBleHByZXNzaW9uOiBgdmFyIHMgPSAkZmVhdHVyZS5yaXNrX3Njb3JlOyBXaGVuKHMgPiA3NSwgJyNkMzJmMmYnLCBzID4gNTAsICcjZjU3YzAwJywgcyA+IDI1LCAnI2ZiYzAyZCcsIHMgPiAwLCAnIzM4OGUzYycsICcjOTk5JylgXHJcbiAgICAgICAgfV1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIHZpZXcubWFwLmFkZChwcmVkaWN0aW9uTGF5ZXIpXHJcbiAgICBwcmVkaWN0aW9uTGF5ZXIud2hlbigoKSA9PiB7XHJcbiAgICAgIHByZWRpY3Rpb25MYXllci5xdWVyeUV4dGVudCgpLnRoZW4oKHI6IGFueSkgPT4ge1xyXG4gICAgICAgIGlmIChyLmV4dGVudCkgdmlldy5nb1RvKHIuZXh0ZW50LmV4cGFuZCgxLjIpKVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9LCBbXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gTlkgU1RBVEUgQ1JBU0ggTU9ERUwgPT09PT09PT09PT09PT09PT09PT1cclxuICBjb25zdCBOWV9TVEFURV9DUkFTSF9NT0RFTCA9IHtcclxuICAgIHRvdGFsQ3Jhc2hlczogMTUyNTEyMyxcclxuICAgIHRvdGFsRmF0YWw6IDQyMDgsXHJcbiAgICB5ZWFyczogJzIwMjEtMjAyNCcsXHJcbiAgICBzb3VyY2U6ICdOWSBTdGF0ZSBETVYgdmlhIGRhdGEubnkuZ292JyxcclxuICAgIHJvYWRHZW9tZXRyeToge1xyXG4gICAgICAnU3RyYWlnaHQgYW5kIExldmVsJzogeyBjcmFzaGVzOiAxMTc4MjI4LCBmYXRhbDogMjgzNCwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ1N0cmFpZ2h0IGFuZCBHcmFkZSc6IHsgY3Jhc2hlczogMTI2NDY0LCBmYXRhbDogNDI5LCB3ZWlnaHQ6IDEuNDEgfSxcclxuICAgICAgJ0N1cnZlIGFuZCBMZXZlbCc6IHsgY3Jhc2hlczogNzIzNDksIGZhdGFsOiA0OTcsIHdlaWdodDogMi44NiB9LFxyXG4gICAgICAnQ3VydmUgYW5kIEdyYWRlJzogeyBjcmFzaGVzOiA0NzQ5NywgZmF0YWw6IDMxNiwgd2VpZ2h0OiAyLjc3IH0sXHJcbiAgICAgICdDdXJ2ZSBhdCBIaWxsIENyZXN0JzogeyBjcmFzaGVzOiA2ODYwLCBmYXRhbDogNTQsIHdlaWdodDogMy4yOCB9LFxyXG4gICAgICAnU3RyYWlnaHQgYXQgSGlsbCBDcmVzdCc6IHsgY3Jhc2hlczogMjE1OTcsIGZhdGFsOiA3NSwgd2VpZ2h0OiAxLjQ1IH1cclxuICAgIH0sXHJcbiAgICB0cmFmZmljQ29udHJvbDoge1xyXG4gICAgICAnTm9uZSc6IHsgY3Jhc2hlczogODcyMDU2LCBmYXRhbDogMjQ1Nywgd2VpZ2h0OiAxLjE3IH0sXHJcbiAgICAgICdUcmFmZmljIFNpZ25hbCc6IHsgY3Jhc2hlczogMzE4MDY1LCBmYXRhbDogODI2LCB3ZWlnaHQ6IDEuMDggfSxcclxuICAgICAgJ1N0b3AgU2lnbic6IHsgY3Jhc2hlczogMTMxNjY0LCBmYXRhbDogMjY2LCB3ZWlnaHQ6IDAuODQgfSxcclxuICAgICAgJ05vIFBhc3NpbmcgWm9uZSc6IHsgY3Jhc2hlczogODUzOTYsIGZhdGFsOiA1NTcsIHdlaWdodDogMi43MiB9LFxyXG4gICAgICAnWWllbGQgU2lnbic6IHsgY3Jhc2hlczogMTI4ODAsIGZhdGFsOiA4LCB3ZWlnaHQ6IDAuMjYgfSxcclxuICAgICAgJ0NvbnN0cnVjdGlvbiBXb3JrIEFyZWEnOiB7IGNyYXNoZXM6IDQ0MjksIGZhdGFsOiA5LCB3ZWlnaHQ6IDAuODUgfSxcclxuICAgICAgJ0ZsYXNoaW5nIExpZ2h0JzogeyBjcmFzaGVzOiAzMDYzLCBmYXRhbDogMTAsIHdlaWdodDogMS4zNiB9LFxyXG4gICAgICAnUlIgQ3Jvc3NpbmcgR2F0ZXMnOiB7IGNyYXNoZXM6IDg3OCwgZmF0YWw6IDcsIHdlaWdodDogMy4zMiB9LFxyXG4gICAgICAnU2Nob29sIFpvbmUnOiB7IGNyYXNoZXM6IDYzNywgZmF0YWw6IDEsIHdlaWdodDogMC42NSB9XHJcbiAgICB9LFxyXG4gICAgcm9hZFN1cmZhY2U6IHtcclxuICAgICAgJ0RyeSc6IHsgY3Jhc2hlczogMTEzMDIxMSwgZmF0YWw6IDMxMDIsIHdlaWdodDogMS4wIH0sXHJcbiAgICAgICdXZXQnOiB7IGNyYXNoZXM6IDIzNDYwMywgZmF0YWw6IDY1MSwgd2VpZ2h0OiAxLjAxIH0sXHJcbiAgICAgICdTbm93L0ljZSc6IHsgY3Jhc2hlczogNzI2NzYsIGZhdGFsOiAyMjIsIHdlaWdodDogMS4xMSB9LFxyXG4gICAgICAnU2x1c2gnOiB7IGNyYXNoZXM6IDU3NTcsIGZhdGFsOiAxNCwgd2VpZ2h0OiAwLjg5IH0sXHJcbiAgICAgICdGbG9vZGVkIFdhdGVyJzogeyBjcmFzaGVzOiA1MDgsIGZhdGFsOiAzLCB3ZWlnaHQ6IDIuMTUgfSxcclxuICAgICAgJ011ZGR5JzogeyBjcmFzaGVzOiA2NDgsIGZhdGFsOiAzLCB3ZWlnaHQ6IDEuNjkgfVxyXG4gICAgfSxcclxuICAgIGxpZ2h0aW5nOiB7XHJcbiAgICAgICdEYXlsaWdodCc6IHsgY3Jhc2hlczogOTMzMjEwLCBmYXRhbDogMTg2Nywgd2VpZ2h0OiAwLjgzIH0sXHJcbiAgICAgICdEYXJrLVJvYWQgTGlnaHRlZCc6IHsgY3Jhc2hlczogMjc4OTgyLCBmYXRhbDogODc2LCB3ZWlnaHQ6IDEuMzEgfSxcclxuICAgICAgJ0RhcmstUm9hZCBVbmxpZ2h0ZWQnOiB7IGNyYXNoZXM6IDE0ODYzNSwgZmF0YWw6IDEwMDUsIHdlaWdodDogMi44MiB9LFxyXG4gICAgICAnRHVzayc6IHsgY3Jhc2hlczogNDg3NDAsIGZhdGFsOiAyMjEsIHdlaWdodDogMS44OSB9LFxyXG4gICAgICAnRGF3bic6IHsgY3Jhc2hlczogMzc4NDgsIGZhdGFsOiAyMzksIHdlaWdodDogMi42MyB9XHJcbiAgICB9LFxyXG4gICAgd2VhdGhlcjoge1xyXG4gICAgICAnQ2xlYXInOiB7IGNyYXNoZXM6IDkzNTg5NywgZmF0YWw6IDI2NzksIHdlaWdodDogMS4wIH0sXHJcbiAgICAgICdDbG91ZHknOiB7IGNyYXNoZXM6IDI5NTczMiwgZmF0YWw6IDcwMCwgd2VpZ2h0OiAwLjgzIH0sXHJcbiAgICAgICdSYWluJzogeyBjcmFzaGVzOiAxMzk1NTksIGZhdGFsOiA0MTksIHdlaWdodDogMS4wNSB9LFxyXG4gICAgICAnU25vdyc6IHsgY3Jhc2hlczogNTg3NjMsIGZhdGFsOiAxODMsIHdlaWdodDogMS4wOSB9LFxyXG4gICAgICAnU2xlZXQvSGFpbC9GcmVlemluZyBSYWluJzogeyBjcmFzaGVzOiA5NDgzLCBmYXRhbDogMjgsIHdlaWdodDogMS4wMyB9LFxyXG4gICAgICAnRm9nL1Ntb2cvU21va2UnOiB7IGNyYXNoZXM6IDQ3OTIsIGZhdGFsOiA0NSwgd2VpZ2h0OiAzLjkxIH1cclxuICAgIH0sXHJcbiAgICBscnNNYXBwaW5nOiB7XHJcbiAgICAgICdDdXJ2ZSc6IHsgc3RhdGVGaWVsZDogJ3JvYWRHZW9tZXRyeScsIHZhbHVlTWFwOiB7ICdMZWZ0JzogJ0N1cnZlIGFuZCBMZXZlbCcsICdSaWdodCc6ICdDdXJ2ZSBhbmQgTGV2ZWwnLCAnQ29tcG91bmQnOiAnQ3VydmUgYW5kIEdyYWRlJywgJ1JldmVyc2UnOiAnQ3VydmUgYW5kIEdyYWRlJywgJ1NpbXBsZSc6ICdDdXJ2ZSBhbmQgTGV2ZWwnIH0gfSxcclxuICAgICAgJ0dyYWRlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xldmVsJzogJ1N0cmFpZ2h0IGFuZCBMZXZlbCcsICdGbGF0JzogJ1N0cmFpZ2h0IGFuZCBMZXZlbCcsICdSb2xsaW5nJzogJ1N0cmFpZ2h0IGFuZCBHcmFkZScsICdNb3VudGFpbm91cyc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnU3RlZXAnOiAnU3RyYWlnaHQgYW5kIEdyYWRlJyB9IH0sXHJcbiAgICAgICdTcGVlZCBMaW1pdCc6IHsgc3RhdGVGaWVsZDogJ3NwZWVkJywgY3VzdG9tV2VpZ2h0czogeyAnMjUnOiAwLjcsICczMCc6IDAuOCwgJzM1JzogMC45LCAnNDAnOiAxLjEsICc0NSc6IDEuMywgJzUwJzogMS42LCAnNTUnOiAyLjAsICc2MCc6IDIuMywgJzY1JzogMi42IH0gfSxcclxuICAgICAgJ0Z1bmN0aW9uYWwgQ2xhc3MnOiB7IHN0YXRlRmllbGQ6ICdmdW5jQ2xhc3MnLCBjdXN0b21XZWlnaHRzOiB7ICdJbnRlcnN0YXRlJzogMS4zLCAnUHJpbmNpcGFsIEFydGVyaWFsJzogMS41LCAnTWlub3IgQXJ0ZXJpYWwnOiAxLjIsICdNYWpvciBDb2xsZWN0b3InOiAxLjAsICdNaW5vciBDb2xsZWN0b3InOiAwLjgsICdMb2NhbCc6IDAuNiB9IH0sXHJcbiAgICAgICdNZWRpYW4gVHlwZSc6IHsgc3RhdGVGaWVsZDogJ21lZGlhbicsIGN1c3RvbVdlaWdodHM6IHsgJ05vbmUnOiAxLjgsICdQYWludGVkJzogMS4zLCAnQ3VyYmVkJzogMS4wLCAnUG9zaXRpdmUgQmFycmllcic6IDAuNiwgJ0RlcHJlc3NlZCc6IDAuNywgJ0dyYXNzJzogMC45IH0gfSxcclxuICAgICAgJ1Rocm91Z2ggTGFuZSc6IHsgc3RhdGVGaWVsZDogJ2xhbmVzJywgY3VzdG9tV2VpZ2h0czogeyAnMSc6IDAuOCwgJzInOiAxLjAsICczJzogMS4zLCAnNCc6IDEuMSwgJzUnOiAxLjQsICc2JzogMS4yIH0gfSxcclxuICAgICAgJ1Nob3VsZGVyIFR5cGUnOiB7IHN0YXRlRmllbGQ6ICdzaG91bGRlcicsIGN1c3RvbVdlaWdodHM6IHsgJ05vbmUnOiAxLjYsICdHcmF2ZWwnOiAxLjEsICdQYXZlZCc6IDAuOCwgJ0dyYXNzJzogMS4yLCAnQ3VyYic6IDEuMCB9IH0sXHJcbiAgICAgICdQYXZlbWVudCBUeXBlJzogeyBzdGF0ZUZpZWxkOiAncGF2ZW1lbnQnLCBjdXN0b21XZWlnaHRzOiB7ICdBc3BoYWx0JzogMC45LCAnQ29uY3JldGUnOiAxLjAsICdHcmF2ZWwnOiAxLjUsICdCcmljayc6IDEuMiwgJ0RpcnQnOiAxLjgsICdDb21wb3NpdGUnOiAwLjk1IH0gfSxcclxuICAgICAgJ1RlcnJhaW4gVHlwZSc6IHsgc3RhdGVGaWVsZDogJ3JvYWRHZW9tZXRyeScsIHZhbHVlTWFwOiB7ICdMZXZlbCc6ICdTdHJhaWdodCBhbmQgTGV2ZWwnLCAnUm9sbGluZyc6ICdTdHJhaWdodCBhbmQgR3JhZGUnLCAnTW91bnRhaW5vdXMnOiAnQ3VydmUgYW5kIEdyYWRlJyB9IH0sXHJcbiAgICAgICdQZXJjZW50IFBhc3NpbmcgU2lnaHQnOiB7IHN0YXRlRmllbGQ6ICdwYXNzU2lnaHQnLCBjdXN0b21XZWlnaHRzOiB7ICcwJzogMi41LCAnMTAnOiAyLjIsICcyMCc6IDEuOSwgJzMwJzogMS42LCAnNDAnOiAxLjMsICc1MCc6IDEuMSwgJzYwJzogMS4wLCAnNzAnOiAwLjksICc4MCc6IDAuODUsICc5MCc6IDAuOCwgJzEwMCc6IDAuNzUgfSB9LFxyXG4gICAgICAnQWNjZXNzIENvbnRyb2wnOiB7IHN0YXRlRmllbGQ6ICdhY2Nlc3MnLCBjdXN0b21XZWlnaHRzOiB7ICdGdWxsJzogMC42LCAnUGFydGlhbCc6IDEuMCwgJ05vbmUnOiAxLjUgfSB9LFxyXG4gICAgICAnT3duZXJzaGlwJzogeyBzdGF0ZUZpZWxkOiAnb3duZXJzaGlwJywgY3VzdG9tV2VpZ2h0czogeyAnU3RhdGUnOiAxLjAsICdDb3VudHknOiAxLjEsICdDaXR5JzogMS4yLCAnRmVkZXJhbCc6IDAuOSwgJ1ByaXZhdGUnOiAxLjQgfSB9XHJcbiAgICB9IGFzIFJlY29yZDxzdHJpbmcsIGFueT5cclxuICB9XHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IEFJIFBSRURJQ1RJT04gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgcnVuQUlQcmVkaWN0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0UnVubmluZyh0cnVlKVxyXG4gICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICBzZXRSZXN1bHQobnVsbClcclxuICAgIHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSlcclxuICAgIHNldEZhY3RvcnMobnVsbClcclxuICAgIHNldEVycm9yKG51bGwpXHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3Qgc2Vzc2lvbiA9IFNlc3Npb25NYW5hZ2VyLmdldEluc3RhbmNlKCkuZ2V0TWFpblNlc3Npb24oKSBhcyBhbnlcclxuICAgICAgaWYgKCFzZXNzaW9uKSB0aHJvdyBuZXcgRXJyb3IoJ05vdCBzaWduZWQgaW4uJylcclxuICAgICAgY29uc3QgdG9rZW4gPSBzZXNzaW9uLnRva2VuXHJcbiAgICAgIGNvbnN0IHBvcnRhbFVybCA9IChzZXNzaW9uLnBvcnRhbCB8fCAnJykucmVwbGFjZSgvXFwvc2hhcmluZ1xcL3Jlc3RcXC8/JC8sICcnKVxyXG4gICAgICBjb25zdCB1c2VybmFtZSA9IHNlc3Npb24udXNlcm5hbWVcclxuICAgICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXcgYXMgYW55XHJcbiAgICAgIGNvbnN0IHdraWQgPSB2aWV3Py5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG5cclxuICAgICAgLy8gU3RlcCAxOiBRdWVyeSBldmVudCBkYXRhXHJcbiAgICAgIHNldFByb2dyZXNzKCdRdWVyeWluZyBldmVudCBkYXRhIGZyb20gTFJTLi4uJylcclxuICAgICAgY29uc3QgZXZlbnREYXRhID0gYXdhaXQgcXVlcnlFdmVudERhdGEoKVxyXG4gICAgICBpZiAoZXZlbnREYXRhLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyBldmVudCBkYXRhIGZvdW5kIGZvciBzZWxlY3RlZCByb3V0ZXMuJylcclxuXHJcbiAgICAgIC8vIFN0ZXAgMjogU2VnbWVudCByb3V0ZXNcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1NlZ21lbnRpbmcgcm91dGVzIGludG8gMC41LW1pbGUgaW50ZXJ2YWxzLi4uJylcclxuICAgICAgY29uc3Qgcm91dGVHZW9tZXRyaWVzID0gcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnRcclxuICAgICAgaWYgKHJvdXRlR2VvbWV0cmllcy5zaXplID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHJvdXRlIGdlb21ldHJpZXMgY2FjaGVkLicpXHJcblxyXG4gICAgICBjb25zdCBzZWdtZW50czogYW55W10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IFtyaWQsIHJvdXRlRGF0YV0gb2Ygcm91dGVHZW9tZXRyaWVzKSB7XHJcbiAgICAgICAgY29uc3QgeyB2ZXJ0aWNlcywgbUlkeCB9ID0gcm91dGVEYXRhXHJcbiAgICAgICAgaWYgKHZlcnRpY2VzLmxlbmd0aCA8IDIpIGNvbnRpbnVlXHJcbiAgICAgICAgY29uc3QgbWluTWVhc3VyZSA9IHZlcnRpY2VzWzBdW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBtYXhNZWFzdXJlID0gdmVydGljZXNbdmVydGljZXMubGVuZ3RoIC0gMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IHJvdXRlTGVuID0gbWF4TWVhc3VyZSAtIG1pbk1lYXN1cmVcclxuICAgICAgICBpZiAocm91dGVMZW4gPD0gMCkgY29udGludWVcclxuXHJcbiAgICAgICAgbGV0IHNlZ0Zyb20gPSBtaW5NZWFzdXJlXHJcbiAgICAgICAgbGV0IHNlZ0lkeCA9IDBcclxuICAgICAgICB3aGlsZSAoc2VnRnJvbSA8IG1heE1lYXN1cmUpIHtcclxuICAgICAgICAgIGNvbnN0IHNlZ1RvID0gTWF0aC5taW4oc2VnRnJvbSArIDAuNSwgbWF4TWVhc3VyZSlcclxuICAgICAgICAgIGNvbnN0IG1pZE0gPSAoc2VnRnJvbSArIHNlZ1RvKSAvIDJcclxuICAgICAgICAgIGxldCBtaWRYID0gMCwgbWlkWSA9IDBcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdmVydGljZXMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG0xID0gdmVydGljZXNbaV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBjb25zdCBtMiA9IHZlcnRpY2VzW2kgKyAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGlmIChtaWRNID49IG0xICYmIG1pZE0gPD0gbTIpIHtcclxuICAgICAgICAgICAgICBjb25zdCBmcmFjID0gbTIgIT09IG0xID8gKG1pZE0gLSBtMSkgLyAobTIgLSBtMSkgOiAwXHJcbiAgICAgICAgICAgICAgbWlkWCA9IHZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSlcclxuICAgICAgICAgICAgICBtaWRZID0gdmVydGljZXNbaV1bMV0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVsxXSAtIHZlcnRpY2VzW2ldWzFdKVxyXG4gICAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IHBhdGg6IG51bWJlcltdW10gPSBbXVxyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGNvbnN0IG0yID0gdmVydGljZXNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgaWYgKG0yIDwgc2VnRnJvbSkgY29udGludWVcclxuICAgICAgICAgICAgaWYgKG0xID4gc2VnVG8pIGJyZWFrXHJcbiAgICAgICAgICAgIGlmIChtMSA+PSBzZWdGcm9tICYmIG0xIDw9IHNlZ1RvKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHBhdGgubGVuZ3RoID09PSAwIHx8IHBhdGhbcGF0aC5sZW5ndGggLSAxXVswXSAhPT0gdmVydGljZXNbaV1bMF0pIHBhdGgucHVzaChbdmVydGljZXNbaV1bMF0sIHZlcnRpY2VzW2ldWzFdXSlcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChtMSA8IHNlZ0Zyb20gJiYgbTIgPiBzZWdGcm9tKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZnJhYyA9IChzZWdGcm9tIC0gbTEpIC8gKG0yIC0gbTEpXHJcbiAgICAgICAgICAgICAgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpXVswXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzBdIC0gdmVydGljZXNbaV1bMF0pLCB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pXSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobTIgPj0gc2VnRnJvbSAmJiBtMiA8PSBzZWdUbykgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpICsgMV1bMF0sIHZlcnRpY2VzW2kgKyAxXVsxXV0pXHJcbiAgICAgICAgICAgIGVsc2UgaWYgKG0xIDwgc2VnVG8gJiYgbTIgPiBzZWdUbykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZyYWMgPSAoc2VnVG8gLSBtMSkgLyAobTIgLSBtMSlcclxuICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSksIHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSldKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPj0gMikgc2VnbWVudHMucHVzaCh7IHJvdXRlSWQ6IHJpZCwgc2VnSWR4LCBmcm9tTTogc2VnRnJvbSwgdG9NOiBzZWdUbywgbWlkWCwgbWlkWSwgcGF0aCwgY3Jhc2hDb3VudDogMCwgYXR0cnM6IHt9IGFzIFJlY29yZDxzdHJpbmcsIGFueT4gfSlcclxuICAgICAgICAgIHNlZ0Zyb20gPSBzZWdUb1xyXG4gICAgICAgICAgc2VnSWR4KytcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyBzZWdtZW50cyBnZW5lcmF0ZWQuJylcclxuXHJcbiAgICAgIC8vIFN0ZXAgMzogQ291bnQgY3Jhc2hlcyBwZXIgc2VnbWVudFxyXG4gICAgICBzZXRQcm9ncmVzcyhgQ291bnRpbmcgY3Jhc2hlcyBhY3Jvc3MgJHtzZWdtZW50cy5sZW5ndGh9IHNlZ21lbnRzLi4uYClcclxuICAgICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcbiAgICAgIGNvbnN0IGNyYXNoTGF5ZXJOYW1lcyA9IG5ldyBTZXQoZXZlbnRDb25maWdzLmZpbHRlcihjZmcgPT4gL2NyYXNofGFjY2lkZW50fGNvbGxpc2lvbi9pLnRlc3QoY2ZnLm5hbWUpKS5tYXAoY2ZnID0+IGNmZy5uYW1lKSlcclxuXHJcbiAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgZXZlbnREYXRhKSB7XHJcbiAgICAgICAgaWYgKCFjcmFzaExheWVyTmFtZXMuaGFzKGVudHJ5LkZlYXR1cmUpKSBjb250aW51ZVxyXG4gICAgICAgIGlmIChlbnRyeS5NZWFzdXJlID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICAgIGlmIChzZWcucm91dGVJZCA9PT0gZW50cnkuUm91dGVJRCAmJiBlbnRyeS5NZWFzdXJlID49IHNlZy5mcm9tTSAmJiBlbnRyeS5NZWFzdXJlIDwgc2VnLnRvTSkge1xyXG4gICAgICAgICAgICBzZWcuY3Jhc2hDb3VudCsrXHJcbiAgICAgICAgICAgIGJyZWFrXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGVwIDQ6IEVucmljaCB3aXRoIHJvYWQgYXR0cmlidXRlc1xyXG4gICAgICBzZXRQcm9ncmVzcygnRW5yaWNoaW5nIHNlZ21lbnRzIHdpdGggcm9hZCBhdHRyaWJ1dGVzLi4uJylcclxuICAgICAgY29uc3Qgbm9uQ3Jhc2hMYXllcnMgPSBldmVudENvbmZpZ3MuZmlsdGVyKGNmZyA9PiAhY3Jhc2hMYXllck5hbWVzLmhhcyhjZmcubmFtZSkpXHJcbiAgICAgIGNvbnN0IGVucmljaEZpZWxkczogc3RyaW5nW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IGNmZyBvZiBub25DcmFzaExheWVycykge1xyXG4gICAgICAgIGNvbnN0IGxheWVyRW50cmllcyA9IGV2ZW50RGF0YS5maWx0ZXIoZSA9PiBlLkZlYXR1cmUgPT09IGNmZy5uYW1lKVxyXG4gICAgICAgIGZvciAoY29uc3QgYXR0ciBvZiAoY2ZnLmF0dHJpYnV0ZXMgfHwgW10pKSB7XHJcbiAgICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSBgJHtjZmcubmFtZS5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJ18nKS5zdWJzdHJpbmcoMCwgMTUpfV8ke2F0dHIucmVwbGFjZSgvW15hLXpBLVowLTldL2csICdfJykuc3Vic3RyaW5nKDAsIDE1KX1gLnN1YnN0cmluZygwLCAzMSlcclxuICAgICAgICAgIGlmICghZW5yaWNoRmllbGRzLmluY2x1ZGVzKGZpZWxkTmFtZSkpIGVucmljaEZpZWxkcy5wdXNoKGZpZWxkTmFtZSlcclxuICAgICAgICAgIGZvciAoY29uc3QgZW50cnkgb2YgbGF5ZXJFbnRyaWVzKSB7XHJcbiAgICAgICAgICAgIGlmIChlbnRyeS5Sb3V0ZUlEID09IG51bGwgfHwgZW50cnkuTWVhc3VyZSA9PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgICAgICAgIGlmIChzZWcucm91dGVJZCA9PT0gZW50cnkuUm91dGVJRCAmJiBlbnRyeS5NZWFzdXJlID49IHNlZy5mcm9tTSAmJiBlbnRyeS5NZWFzdXJlIDwgc2VnLnRvTSkge1xyXG4gICAgICAgICAgICAgICAgc2VnLmF0dHJzW2ZpZWxkTmFtZV0gPSBlbnRyeVthdHRyXSA/PyAnJ1xyXG4gICAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0ZXAgNTogS2VybmVsIGRlbnNpdHkgc2NvcmluZ1xyXG4gICAgICBzZXRQcm9ncmVzcygnQ29tcHV0aW5nIHJpc2sgc2NvcmVzLi4uJylcclxuICAgICAgY29uc3QgS0VSTkVMX1JBRElVUyA9IDVcclxuICAgICAgY29uc3QgREVDQVkgPSAwLjVcclxuICAgICAgY29uc3Qgc2Vnc0J5Um91dGUgPSBuZXcgTWFwPHN0cmluZywgYW55W10+KClcclxuICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICBpZiAoIXNlZ3NCeVJvdXRlLmhhcyhzZWcucm91dGVJZCkpIHNlZ3NCeVJvdXRlLnNldChzZWcucm91dGVJZCwgW10pXHJcbiAgICAgICAgc2Vnc0J5Um91dGUuZ2V0KHNlZy5yb3V0ZUlkKSEucHVzaChzZWcpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJpc2tTY29yZXM6IG51bWJlcltdID0gW11cclxuICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICBjb25zdCByb3V0ZVNlZ3MgPSBzZWdzQnlSb3V0ZS5nZXQoc2VnLnJvdXRlSWQpIHx8IFtdXHJcbiAgICAgICAgbGV0IHNjb3JlID0gc2VnLmNyYXNoQ291bnQgKiAyXHJcbiAgICAgICAgZm9yIChjb25zdCBuZWlnaGJvciBvZiByb3V0ZVNlZ3MpIHtcclxuICAgICAgICAgIGlmIChuZWlnaGJvciA9PT0gc2VnKSBjb250aW51ZVxyXG4gICAgICAgICAgY29uc3QgZCA9IE1hdGguYWJzKG5laWdoYm9yLnNlZ0lkeCAtIHNlZy5zZWdJZHgpXHJcbiAgICAgICAgICBpZiAoZCA8PSBLRVJORUxfUkFESVVTKSBzY29yZSArPSBuZWlnaGJvci5jcmFzaENvdW50ICogTWF0aC5wb3coREVDQVksIGQpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJpc2tTY29yZXMucHVzaChzY29yZSlcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBtYXhSaXNrU2NvcmUgPSBNYXRoLm1heCguLi5yaXNrU2NvcmVzLCAxKVxyXG4gICAgICBjb25zdCBub3JtYWxpemVkU2NvcmVzID0gcmlza1Njb3Jlcy5tYXAocyA9PiBNYXRoLnJvdW5kKChzIC8gbWF4Umlza1Njb3JlKSAqIDEwMCkpXHJcblxyXG4gICAgICAvLyBTdG9yZSBmYWN0b3JzIGZvciBleHBsYW5hdGlvblxyXG4gICAgICBjb25zdCBoaWdoUmlza1NlZ3MgPSBzZWdtZW50cy5maWx0ZXIoKF8sIGlkeCkgPT4gbm9ybWFsaXplZFNjb3Jlc1tpZHhdID49IDc1KVxyXG4gICAgICBjb25zdCB0b3BIaWdoUmlzayA9IGhpZ2hSaXNrU2Vncy5tYXAoc2VnID0+ICh7IC4uLnNlZywgcmlza1Njb3JlOiBub3JtYWxpemVkU2NvcmVzW3NlZ21lbnRzLmluZGV4T2Yoc2VnKV0gfSkpLnNvcnQoKGEsIGIpID0+IGIucmlza1Njb3JlIC0gYS5yaXNrU2NvcmUpLnNsaWNlKDAsIDUpXHJcbiAgICAgIHNldEZhY3RvcnMoeyB0b3RhbFNlZ21lbnRzOiBzZWdtZW50cy5sZW5ndGgsIHNlZ21lbnRzV2l0aENyYXNoZXM6IHNlZ21lbnRzLmZpbHRlcihzID0+IHMuY3Jhc2hDb3VudCA+IDApLmxlbmd0aCwgaGlnaFJpc2tDb3VudDogaGlnaFJpc2tTZWdzLmxlbmd0aCwgbWF4Q3Jhc2hDb3VudDogTWF0aC5tYXgoLi4uc2VnbWVudHMubWFwKHMgPT4gcy5jcmFzaENvdW50KSwgMSksIGVucmljaExheWVyczogbm9uQ3Jhc2hMYXllcnMubWFwKGwgPT4gbC5uYW1lKSwgZW5yaWNoRmllbGRzLCBrZXJuZWxSYWRpdXM6IEtFUk5FTF9SQURJVVMsIHRvcEhpZ2hSaXNrU2VnbWVudHM6IHRvcEhpZ2hSaXNrIH0pXHJcblxyXG4gICAgICAvLyBTdGVwIDY6IFVwbG9hZCBhcyBmZWF0dXJlIHNlcnZpY2VcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1VwbG9hZGluZyBwcmVkaWN0aW9uIGxheWVyLi4uJylcclxuICAgICAgY29uc3QgY29udGVudFVybCA9IGAke3BvcnRhbFVybH0vc2hhcmluZy9yZXN0L2NvbnRlbnQvdXNlcnMvJHt1c2VybmFtZX1gXHJcbiAgICAgIGNvbnN0IGZvbGRlclVybCA9IHNlbGVjdGVkRm9sZGVySWQgPyBgJHtjb250ZW50VXJsfS8ke3NlbGVjdGVkRm9sZGVySWR9YCA6IGNvbnRlbnRVcmxcclxuICAgICAgY29uc3Qgc2VydmljZU5hbWUgPSBgQ3Jhc2hSaXNrX0FJXyR7RGF0ZS5ub3coKX1gXHJcblxyXG4gICAgICBjb25zdCBmaWVsZHMgPSBbXHJcbiAgICAgICAgeyBuYW1lOiAnT0JKRUNUSUQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZU9JRCcsIGFsaWFzOiAnT2JqZWN0SUQnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncm91dGVpZCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdSb3V0ZSBJRCcsIGxlbmd0aDogMTAwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnZnJvbV9tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ0Zyb20gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICd0b19tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ1RvIE1lYXN1cmUnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY3Jhc2hfY291bnQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZUludGVnZXInLCBhbGlhczogJ0NyYXNoIENvdW50JyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfc2NvcmUnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZUludGVnZXInLCBhbGlhczogJ1Jpc2sgU2NvcmUgKDAtMTAwKScgfSxcclxuICAgICAgICB7IG5hbWU6ICdyaXNrX2xldmVsJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1Jpc2sgTGV2ZWwnLCBsZW5ndGg6IDIwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udHJpYnV0aW5nX2ZhY3RvcnMnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnQ29udHJpYnV0aW5nIEZhY3RvcnMnLCBsZW5ndGg6IDUwMCB9XHJcbiAgICAgIF1cclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdjcmVhdGVQYXJhbWV0ZXJzJywgSlNPTi5zdHJpbmdpZnkoeyBuYW1lOiBzZXJ2aWNlTmFtZSwgc2VydmljZURlc2NyaXB0aW9uOiAnQUkgY3Jhc2ggcmlzayBwcmVkaWN0aW9uJywgaGFzU3RhdGljRGF0YTogZmFsc2UsIG1heFJlY29yZENvdW50OiAxMDAwMCwgc3VwcG9ydGVkUXVlcnlGb3JtYXRzOiAnSlNPTicsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcnLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSwgaW5pdGlhbEV4dGVudDogeyB4bWluOiAtMjAwMzc1MDgsIHltaW46IC0yMDAzNzUwOCwgeG1heDogMjAwMzc1MDgsIHltYXg6IDIwMDM3NTA4LCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LCBhbGxvd0dlb21ldHJ5VXBkYXRlczogdHJ1ZSB9KSlcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgndGFyZ2V0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ291dHB1dFR5cGUnLCAnZmVhdHVyZVNlcnZpY2UnKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBpZiAoc2VsZWN0ZWRGb2xkZXJJZCkgY3JlYXRlUGFyYW1zLmFwcGVuZCgnZm9sZGVySWQnLCBzZWxlY3RlZEZvbGRlcklkKVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUmVzcCA9IGF3YWl0IGZldGNoKGAke2ZvbGRlclVybH0vY3JlYXRlU2VydmljZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGNyZWF0ZVBhcmFtcyB9KVxyXG4gICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCBjcmVhdGVSZXNwLmpzb24oKVxyXG4gICAgICBpZiAoIWNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTCAmJiAhY3JlYXRlUmVzdWx0LnNlcnZpY2V1cmwpIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBzZXJ2aWNlOiAnICsgSlNPTi5zdHJpbmdpZnkoY3JlYXRlUmVzdWx0KSlcclxuICAgICAgY29uc3Qgc2VydmljZVVybCA9IGNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTCB8fCBjcmVhdGVSZXN1bHQuc2VydmljZXVybFxyXG4gICAgICBjb25zdCB0ZW1wSXRlbUlkID0gY3JlYXRlUmVzdWx0Lml0ZW1JZFxyXG5cclxuICAgICAgY29uc3QgYWRtaW5VcmwgPSBzZXJ2aWNlVXJsLnJlcGxhY2UoJy9yZXN0L3NlcnZpY2VzLycsICcvcmVzdC9hZG1pbi9zZXJ2aWNlcy8nKVxyXG4gICAgICBjb25zdCBhZGREZWZQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgnYWRkVG9EZWZpbml0aW9uJywgSlNPTi5zdHJpbmdpZnkoeyBsYXllcnM6IFt7IGlkOiAwLCBuYW1lOiAnQUkgQ3Jhc2ggUmlzaycsIHR5cGU6ICdGZWF0dXJlIExheWVyJywgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5UG9seWxpbmUnLCBkaXNwbGF5RmllbGQ6ICdyb3V0ZWlkJywgZmllbGRzLCBvYmplY3RJZEZpZWxkOiAnT0JKRUNUSUQnLCBoYXNBdHRhY2htZW50czogZmFsc2UsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcsQ3JlYXRlLFVwZGF0ZSxEZWxldGUnIH1dIH0pKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBhd2FpdCBmZXRjaChgJHthZG1pblVybH0vYWRkVG9EZWZpbml0aW9uYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRGVmUGFyYW1zIH0pXHJcblxyXG4gICAgICAvLyBVcGxvYWQgZmVhdHVyZXNcclxuICAgICAgY29uc3QgZmVhdHVyZXMgPSBzZWdtZW50cy5maWx0ZXIoKF8sIGlkeCkgPT4gbm9ybWFsaXplZFNjb3Jlc1tpZHhdID4gMCkubWFwKChzZWcpID0+IHtcclxuICAgICAgICBjb25zdCBpZHggPSBzZWdtZW50cy5pbmRleE9mKHNlZylcclxuICAgICAgICBjb25zdCByaXNrU2NvcmUgPSBub3JtYWxpemVkU2NvcmVzW2lkeF1cclxuICAgICAgICBjb25zdCByaXNrTGV2ZWwgPSByaXNrU2NvcmUgPj0gNzUgPyAnSGlnaCcgOiByaXNrU2NvcmUgPj0gNDAgPyAnTWVkaXVtJyA6IHJpc2tTY29yZSA+IDAgPyAnTG93JyA6ICdNaW5pbWFsJ1xyXG4gICAgICAgIGNvbnN0IGZjdHJzID0gT2JqZWN0LmVudHJpZXMoc2VnLmF0dHJzKS5maWx0ZXIoKFssIHZdKSA9PiB2ICYmIFN0cmluZyh2KS50cmltKCkpLnNsaWNlKDAsIDUpLm1hcCgoW2ssIHZdKSA9PiBgJHtrfT0ke3Z9YCkuam9pbignOyAnKVxyXG4gICAgICAgIHJldHVybiB7IGdlb21ldHJ5OiB7IHBhdGhzOiBbc2VnLnBhdGhdLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LCBhdHRyaWJ1dGVzOiB7IHJvdXRlaWQ6IHNlZy5yb3V0ZUlkLCBmcm9tX206IHNlZy5mcm9tTSwgdG9fbTogc2VnLnRvTSwgY3Jhc2hfY291bnQ6IHNlZy5jcmFzaENvdW50LCByaXNrX3Njb3JlOiByaXNrU2NvcmUsIHJpc2tfbGV2ZWw6IHJpc2tMZXZlbCwgY29udHJpYnV0aW5nX2ZhY3RvcnM6IGZjdHJzIHx8ICdEZW5zaXR5IGNsdXN0ZXInIH0gfVxyXG4gICAgICB9KVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkgKz0gMTAwMCkge1xyXG4gICAgICAgIGNvbnN0IGJhdGNoID0gZmVhdHVyZXMuc2xpY2UoaSwgaSArIDEwMDApXHJcbiAgICAgICAgc2V0UHJvZ3Jlc3MoYFVwbG9hZGluZy4uLiAke01hdGgubWluKGkgKyAxMDAwLCBmZWF0dXJlcy5sZW5ndGgpfS8ke2ZlYXR1cmVzLmxlbmd0aH1gKVxyXG4gICAgICAgIGNvbnN0IGFkZEZlYXRQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZmVhdHVyZXMnLCBKU09OLnN0cmluZ2lmeShiYXRjaCkpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgICAgYXdhaXQgZmV0Y2goYCR7c2VydmljZVVybH0vMC9hZGRGZWF0dXJlc2AsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGFkZEZlYXRQYXJhbXMgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2hhcmVcclxuICAgICAgY29uc3Qgc2hhcmVQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdldmVyeW9uZScsICdmYWxzZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnb3JnJywgJ3RydWUnKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2l0ZW1zJywgdGVtcEl0ZW1JZClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2NvbnRlbnRVcmx9L2l0ZW1zLyR7dGVtcEl0ZW1JZH0vc2hhcmVgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBzaGFyZVBhcmFtcyB9KVxyXG5cclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0Rpc3BsYXlpbmcgb24gbWFwLi4uJylcclxuICAgICAgYXdhaXQgZGlzcGxheVByZWRpY3Rpb25Pbk1hcChgJHtzZXJ2aWNlVXJsfS8wYCwgdG9rZW4sIHdraWQpXHJcbiAgICAgIHNldFJlc3VsdCh7IGxheWVyVXJsOiBzZXJ2aWNlVXJsLCBpdGVtVXJsOiBgJHtwb3J0YWxVcmx9L2hvbWUvaXRlbS5odG1sP2lkPSR7dGVtcEl0ZW1JZH1gIH0pXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0NyYXNoUmlzayBBSV0gRmFpbGVkOicsIGVycilcclxuICAgICAgc2V0RXJyb3IoJ0FJIHByZWRpY3Rpb24gZmFpbGVkOiAnICsgKGVyci5tZXNzYWdlIHx8IGVycikpXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0UnVubmluZyhmYWxzZSlcclxuICAgIH1cclxuICB9LCBbY29uZmlnLCBxdWVyeUV2ZW50RGF0YSwgc2VsZWN0ZWRGb2xkZXJJZCwgZGlzcGxheVByZWRpY3Rpb25Pbk1hcF0pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IE1MIFBSRURJQ1RJT04gPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgcnVuTUxQcmVkaWN0aW9uID0gdXNlQ2FsbGJhY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgc2V0UnVubmluZyh0cnVlKVxyXG4gICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICBzZXRSZXN1bHQobnVsbClcclxuICAgIHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSlcclxuICAgIHNldE1vZGVsSW5mbyhudWxsKVxyXG4gICAgc2V0RXJyb3IobnVsbClcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZXNzaW9uID0gU2Vzc2lvbk1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5nZXRNYWluU2Vzc2lvbigpIGFzIGFueVxyXG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignTm90IHNpZ25lZCBpbi4nKVxyXG4gICAgICBjb25zdCB0b2tlbiA9IHNlc3Npb24udG9rZW5cclxuICAgICAgY29uc3QgcG9ydGFsVXJsID0gKHNlc3Npb24ucG9ydGFsIHx8ICcnKS5yZXBsYWNlKC9cXC9zaGFyaW5nXFwvcmVzdFxcLz8kLywgJycpXHJcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gc2Vzc2lvbi51c2VybmFtZVxyXG4gICAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgICAgaWYgKCF2aWV3KSB0aHJvdyBuZXcgRXJyb3IoJ05vIG1hcCB2aWV3IGF2YWlsYWJsZS4nKVxyXG4gICAgICBjb25zdCB3a2lkID0gdmlldy5zcGF0aWFsUmVmZXJlbmNlPy53a2lkIHx8IDEwMjEwMFxyXG5cclxuICAgICAgLy8gU3RlcCAxOiBRdWVyeSBldmVudCBkYXRhXHJcbiAgICAgIHNldFByb2dyZXNzKCdRdWVyeWluZyByb2FkIGF0dHJpYnV0ZSBkYXRhIGZyb20gTFJTLi4uJylcclxuICAgICAgY29uc3QgZXZlbnREYXRhID0gYXdhaXQgcXVlcnlFdmVudERhdGEoKVxyXG5cclxuICAgICAgLy8gU3RlcCAyOiBTZWdtZW50IHJvdXRlc1xyXG4gICAgICBzZXRQcm9ncmVzcygnU2VnbWVudGluZyByb3V0ZXMgYXQgMC41LW1pbGUgaW50ZXJ2YWxzLi4uJylcclxuICAgICAgY29uc3Qgcm91dGVHZW9tZXRyaWVzID0gcm91dGVHZW9tZXRyaWVzUmVmLmN1cnJlbnRcclxuICAgICAgaWYgKHJvdXRlR2VvbWV0cmllcy5zaXplID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHJvdXRlIGdlb21ldHJpZXMuIFNlbGVjdCByb3V0ZXMgZmlyc3QuJylcclxuXHJcbiAgICAgIGNvbnN0IG1vZGVsID0gTllfU1RBVEVfQ1JBU0hfTU9ERUxcclxuXHJcbiAgICAgIC8vIEJ1aWxkIGV2ZW50IGxvb2t1cFxyXG4gICAgICBjb25zdCBldmVudExvb2t1cCA9IG5ldyBNYXA8c3RyaW5nLCBNYXA8bnVtYmVyLCBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+Pj4oKVxyXG4gICAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuICAgICAgZm9yIChjb25zdCBjZmcgb2YgZXZlbnRDb25maWdzKSB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXJFbnRyaWVzID0gZXZlbnREYXRhLmZpbHRlcihlID0+IGUuRmVhdHVyZSA9PT0gY2ZnLm5hbWUpXHJcbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsYXllckVudHJpZXMpIHtcclxuICAgICAgICAgIGlmIChlbnRyeS5Sb3V0ZUlEID09IG51bGwgfHwgZW50cnkuTWVhc3VyZSA9PSBudWxsKSBjb250aW51ZVxyXG4gICAgICAgICAgY29uc3QgcmlkID0gZW50cnkuUm91dGVJRFxyXG4gICAgICAgICAgaWYgKCFldmVudExvb2t1cC5oYXMocmlkKSkgZXZlbnRMb29rdXAuc2V0KHJpZCwgbmV3IE1hcCgpKVxyXG4gICAgICAgICAgY29uc3QgbUtleSA9IE1hdGgucm91bmQocGFyc2VGbG9hdChlbnRyeS5NZWFzdXJlKSAqIDIpIC8gMlxyXG4gICAgICAgICAgY29uc3Qgcm91dGVNYXAgPSBldmVudExvb2t1cC5nZXQocmlkKSFcclxuICAgICAgICAgIGlmICghcm91dGVNYXAuaGFzKG1LZXkpKSByb3V0ZU1hcC5zZXQobUtleSwge30pXHJcbiAgICAgICAgICBjb25zdCBzZWdEYXRhID0gcm91dGVNYXAuZ2V0KG1LZXkpIVxyXG4gICAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIChjZmcuYXR0cmlidXRlcyB8fCBbXSkpIHtcclxuICAgICAgICAgICAgaWYgKGVudHJ5W2F0dHJdICE9IG51bGwgJiYgU3RyaW5nKGVudHJ5W2F0dHJdKS50cmltKCkpIHtcclxuICAgICAgICAgICAgICBzZWdEYXRhW2Ake2NmZy5uYW1lfTo6JHthdHRyfWBdID0gU3RyaW5nKGVudHJ5W2F0dHJdKS50cmltKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RlcCAzOiBTY29yZSBzZWdtZW50c1xyXG4gICAgICBzZXRQcm9ncmVzcygnQXBwbHlpbmcgc3RhdGUgY3Jhc2ggbW9kZWwgd2VpZ2h0cy4uLicpXHJcbiAgICAgIGNvbnN0IHNlZ21lbnRzOiBhbnlbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgW3JpZCwgcmRdIG9mIHJvdXRlR2VvbWV0cmllcy5lbnRyaWVzKCkpIHtcclxuICAgICAgICBjb25zdCB2ZXJ0cyA9IHJkLnZlcnRpY2VzXHJcbiAgICAgICAgaWYgKHZlcnRzLmxlbmd0aCA8IDIpIGNvbnRpbnVlXHJcbiAgICAgICAgY29uc3Qgc3RhcnRNID0gdmVydHNbMF1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IGVuZE0gPSB2ZXJ0c1t2ZXJ0cy5sZW5ndGggLSAxXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgdG90YWxMZW4gPSBNYXRoLmFicyhlbmRNIC0gc3RhcnRNKVxyXG4gICAgICAgIGlmICh0b3RhbExlbiA8IDAuMSkgY29udGludWVcclxuXHJcbiAgICAgICAgY29uc3QgbnVtU2VncyA9IE1hdGguY2VpbCh0b3RhbExlbiAvIDAuNSlcclxuICAgICAgICBmb3IgKGxldCBzID0gMDsgcyA8IG51bVNlZ3M7IHMrKykge1xyXG4gICAgICAgICAgY29uc3QgZnJvbU0gPSBzdGFydE0gKyBzICogMC41XHJcbiAgICAgICAgICBjb25zdCB0b00gPSBNYXRoLm1pbihzdGFydE0gKyAocyArIDEpICogMC41LCBlbmRNKVxyXG4gICAgICAgICAgY29uc3QgbWlkTSA9IChmcm9tTSArIHRvTSkgLyAyXHJcbiAgICAgICAgICBjb25zdCBtS2V5ID0gTWF0aC5yb3VuZChtaWRNICogMikgLyAyXHJcblxyXG4gICAgICAgICAgY29uc3Qgcm91dGVNYXAgPSBldmVudExvb2t1cC5nZXQocmlkKVxyXG4gICAgICAgICAgY29uc3Qgc2VnQXR0cnMgPSByb3V0ZU1hcD8uZ2V0KG1LZXkpIHx8IHt9XHJcblxyXG4gICAgICAgICAgbGV0IGNvbXBvc2l0ZVNjb3JlID0gMS4wXHJcbiAgICAgICAgICBjb25zdCBzZWdGYWN0b3JzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZWdBdHRycykpIHtcclxuICAgICAgICAgICAgY29uc3QgbGF5ZXJOYW1lID0ga2V5LnNwbGl0KCc6OicpWzBdXHJcbiAgICAgICAgICAgIGNvbnN0IG1hcHBpbmcgPSBtb2RlbC5scnNNYXBwaW5nW2xheWVyTmFtZV1cclxuICAgICAgICAgICAgaWYgKCFtYXBwaW5nKSBjb250aW51ZVxyXG4gICAgICAgICAgICBsZXQgd2VpZ2h0ID0gMS4wXHJcbiAgICAgICAgICAgIGlmIChtYXBwaW5nLmN1c3RvbVdlaWdodHMpIHtcclxuICAgICAgICAgICAgICBjb25zdCBub3JtYWxpemVkVmFsID0gdmFsdWUucmVwbGFjZSgvW14wLTkuXS9nLCAnJykuc3BsaXQoJy4nKVswXVxyXG4gICAgICAgICAgICAgIHdlaWdodCA9IG1hcHBpbmcuY3VzdG9tV2VpZ2h0c1tub3JtYWxpemVkVmFsXSB8fCBtYXBwaW5nLmN1c3RvbVdlaWdodHNbdmFsdWVdIHx8IDEuMFxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1hcHBpbmcudmFsdWVNYXApIHtcclxuICAgICAgICAgICAgICBjb25zdCBtYXBwZWRDb25kaXRpb24gPSBtYXBwaW5nLnZhbHVlTWFwW3ZhbHVlXVxyXG4gICAgICAgICAgICAgIGlmIChtYXBwZWRDb25kaXRpb24pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlQ2F0ZWdvcnkgPSAobW9kZWwgYXMgYW55KVttYXBwaW5nLnN0YXRlRmllbGRdXHJcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGVDYXRlZ29yeSAmJiBzdGF0ZUNhdGVnb3J5W21hcHBlZENvbmRpdGlvbl0pIHtcclxuICAgICAgICAgICAgICAgICAgd2VpZ2h0ID0gc3RhdGVDYXRlZ29yeVttYXBwZWRDb25kaXRpb25dLndlaWdodFxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAod2VpZ2h0ICE9PSAxLjApIHtcclxuICAgICAgICAgICAgICBjb21wb3NpdGVTY29yZSAqPSB3ZWlnaHRcclxuICAgICAgICAgICAgICBpZiAod2VpZ2h0ID4gMS4yKSBzZWdGYWN0b3JzLnB1c2goYCR7bGF5ZXJOYW1lfTogJHt2YWx1ZX0gKCR7d2VpZ2h0LnRvRml4ZWQoMSl9eClgKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgY29uc3Qgcmlza1Njb3JlID0gTWF0aC5taW4oTWF0aC5yb3VuZChNYXRoLmxvZyhjb21wb3NpdGVTY29yZSArIDEpICogNDApLCAxMDApXHJcblxyXG4gICAgICAgICAgLy8gQnVpbGQgcGF0aFxyXG4gICAgICAgICAgY29uc3QgcGF0aDogbnVtYmVyW11bXSA9IFtdXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IHYgb2YgdmVydHMpIHtcclxuICAgICAgICAgICAgY29uc3Qgdm0gPSB2W3JkLm1JZHhdIHx8IDBcclxuICAgICAgICAgICAgaWYgKHZtID49IGZyb21NICYmIHZtIDw9IHRvTSkgcGF0aC5wdXNoKFt2WzBdLCB2WzFdXSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA8IDIpIHtcclxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgICBjb25zdCBtMSA9IHZlcnRzW2ldW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICAgICAgICBjb25zdCBtMiA9IHZlcnRzW2kgKyAxXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgICAgICAgaWYgKG0xIDw9IGZyb21NICYmIG0yID49IGZyb21NKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gKGZyb21NIC0gbTEpIC8gKG0yIC0gbTEgfHwgMSlcclxuICAgICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydHNbaV1bMF0gKyB0ICogKHZlcnRzW2kgKyAxXVswXSAtIHZlcnRzW2ldWzBdKSwgdmVydHNbaV1bMV0gKyB0ICogKHZlcnRzW2kgKyAxXVsxXSAtIHZlcnRzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChtMSA8PSB0b00gJiYgbTIgPj0gdG9NKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gKHRvTSAtIG0xKSAvIChtMiAtIG0xIHx8IDEpXHJcbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRzW2ldWzBdICsgdCAqICh2ZXJ0c1tpICsgMV1bMF0gLSB2ZXJ0c1tpXVswXSksIHZlcnRzW2ldWzFdICsgdCAqICh2ZXJ0c1tpICsgMV1bMV0gLSB2ZXJ0c1tpXVsxXSldKVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHBhdGgubGVuZ3RoIDwgMikgY29udGludWVcclxuXHJcbiAgICAgICAgICBjb25zdCByaXNrTGV2ZWwgPSByaXNrU2NvcmUgPj0gNzUgPyAnSGlnaCcgOiByaXNrU2NvcmUgPj0gNDAgPyAnTWVkaXVtJyA6IHJpc2tTY29yZSA+IDAgPyAnTG93JyA6ICdNaW5pbWFsJ1xyXG4gICAgICAgICAgc2VnbWVudHMucHVzaCh7IHJvdXRlSWQ6IHJpZCwgZnJvbU0sIHRvTSwgcGF0aCwgcmlza1Njb3JlLCByaXNrTGV2ZWwsIGNvbnRyaWJ1dGluZ0ZhY3RvcnM6IHNlZ0ZhY3RvcnMgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyBzZWdtZW50cyBnZW5lcmF0ZWQuJylcclxuXHJcbiAgICAgIC8vIFN0b3JlIG1vZGVsIGluZm9cclxuICAgICAgY29uc3Qgd2VpZ2h0c1N1bW1hcnk6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIG51bWJlcj4+ID0ge31cclxuICAgICAgZm9yIChjb25zdCBzZWcgb2Ygc2VnbWVudHMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGYgb2Ygc2VnLmNvbnRyaWJ1dGluZ0ZhY3RvcnMpIHtcclxuICAgICAgICAgIGNvbnN0IG1hdGNoID0gZi5tYXRjaCgvXiguKz8pOiAoLis/KSBcXCgoLis/KXhcXCkkLylcclxuICAgICAgICAgIGlmIChtYXRjaCkge1xyXG4gICAgICAgICAgICBpZiAoIXdlaWdodHNTdW1tYXJ5W21hdGNoWzFdXSkgd2VpZ2h0c1N1bW1hcnlbbWF0Y2hbMV1dID0ge31cclxuICAgICAgICAgICAgd2VpZ2h0c1N1bW1hcnlbbWF0Y2hbMV1dW21hdGNoWzJdXSA9IHBhcnNlRmxvYXQobWF0Y2hbM10pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNldE1vZGVsSW5mbyh7IHdlaWdodHM6IHdlaWdodHNTdW1tYXJ5LCB0b3RhbENyYXNoZXM6IG1vZGVsLnRvdGFsQ3Jhc2hlcywgeWVhcnM6IG1vZGVsLnllYXJzIH0pXHJcblxyXG4gICAgICAvLyBTdGVwIDQ6IFVwbG9hZFxyXG4gICAgICBzZXRQcm9ncmVzcygnVXBsb2FkaW5nIHN0YXRlIE1MIHByZWRpY3Rpb24gbGF5ZXIuLi4nKVxyXG4gICAgICBjb25zdCBjb250ZW50VXJsID0gYCR7cG9ydGFsVXJsfS9zaGFyaW5nL3Jlc3QvY29udGVudC91c2Vycy8ke3VzZXJuYW1lfWBcclxuICAgICAgY29uc3QgZm9sZGVyVXJsID0gc2VsZWN0ZWRGb2xkZXJJZCA/IGAke2NvbnRlbnRVcmx9LyR7c2VsZWN0ZWRGb2xkZXJJZH1gIDogY29udGVudFVybFxyXG4gICAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IGBTdGF0ZU1MX0NyYXNoUmlza18ke0RhdGUubm93KCl9YFxyXG5cclxuICAgICAgY29uc3QgZmllbGRzID0gW1xyXG4gICAgICAgIHsgbmFtZTogJ09CSkVDVElEJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVPSUQnLCBhbGlhczogJ09iamVjdElEJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3JvdXRlaWQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUm91dGUgSUQnLCBsZW5ndGg6IDEwMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ2Zyb21fbScsIHR5cGU6ICdlc3JpRmllbGRUeXBlRG91YmxlJywgYWxpYXM6ICdGcm9tIE1lYXN1cmUnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAndG9fbScsIHR5cGU6ICdlc3JpRmllbGRUeXBlRG91YmxlJywgYWxpYXM6ICdUbyBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfc2NvcmUnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZUludGVnZXInLCBhbGlhczogJ1Jpc2sgU2NvcmUgKDAtMTAwKScgfSxcclxuICAgICAgICB7IG5hbWU6ICdyaXNrX2xldmVsJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1Jpc2sgTGV2ZWwnLCBsZW5ndGg6IDIwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnY29udHJpYnV0aW5nX2ZhY3RvcnMnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnQ29udHJpYnV0aW5nIEZhY3RvcnMnLCBsZW5ndGg6IDUwMCB9LFxyXG4gICAgICAgIHsgbmFtZTogJ21vZGVsX2NvbmZpZGVuY2UnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnTW9kZWwgQ29uZmlkZW5jZScsIGxlbmd0aDogNTAgfVxyXG4gICAgICBdXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnY3JlYXRlUGFyYW1ldGVycycsIEpTT04uc3RyaW5naWZ5KHsgbmFtZTogc2VydmljZU5hbWUsIHNlcnZpY2VEZXNjcmlwdGlvbjogJ0NyYXNoIHJpc2sgZnJvbSBOWSBzdGF0ZSBjcmFzaCBkYXRhYmFzZSBNTCBtb2RlbCcsIGhhc1N0YXRpY0RhdGE6IGZhbHNlLCBtYXhSZWNvcmRDb3VudDogMTAwMDAsIHN1cHBvcnRlZFF1ZXJ5Rm9ybWF0czogJ0pTT04nLCBjYXBhYmlsaXRpZXM6ICdRdWVyeSxFZGl0aW5nJywgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0sIGluaXRpYWxFeHRlbnQ6IHsgeG1pbjogLTIwMDM3NTA4LCB5bWluOiAtMjAwMzc1MDgsIHhtYXg6IDIwMDM3NTA4LCB5bWF4OiAyMDAzNzUwOCwgc3BhdGlhbFJlZmVyZW5jZTogeyB3a2lkIH0gfSwgYWxsb3dHZW9tZXRyeVVwZGF0ZXM6IHRydWUgfSkpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3RhcmdldFR5cGUnLCAnZmVhdHVyZVNlcnZpY2UnKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdvdXRwdXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgaWYgKHNlbGVjdGVkRm9sZGVySWQpIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2ZvbGRlcklkJywgc2VsZWN0ZWRGb2xkZXJJZClcclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3AgPSBhd2FpdCBmZXRjaChgJHtmb2xkZXJVcmx9L2NyZWF0ZVNlcnZpY2VgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBjcmVhdGVQYXJhbXMgfSlcclxuICAgICAgY29uc3QgY3JlYXRlUmVzdWx0ID0gYXdhaXQgY3JlYXRlUmVzcC5qc29uKClcclxuICAgICAgaWYgKCFjcmVhdGVSZXN1bHQuZW5jb2RlZFNlcnZpY2VVUkwpIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGNyZWF0ZSBzZXJ2aWNlOiAnICsgSlNPTi5zdHJpbmdpZnkoY3JlYXRlUmVzdWx0KSlcclxuICAgICAgY29uc3Qgc2VydmljZVVybCA9IGNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTFxyXG4gICAgICBjb25zdCB0ZW1wSXRlbUlkID0gY3JlYXRlUmVzdWx0Lml0ZW1JZFxyXG5cclxuICAgICAgY29uc3QgYWRtaW5VcmwgPSBzZXJ2aWNlVXJsLnJlcGxhY2UoJy9yZXN0L3NlcnZpY2VzLycsICcvcmVzdC9hZG1pbi9zZXJ2aWNlcy8nKVxyXG4gICAgICBjb25zdCBhZGREZWZQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgYWRkRGVmUGFyYW1zLmFwcGVuZCgnYWRkVG9EZWZpbml0aW9uJywgSlNPTi5zdHJpbmdpZnkoeyBsYXllcnM6IFt7IGlkOiAwLCBuYW1lOiAnU3RhdGUgTUwgUmlzaycsIHR5cGU6ICdGZWF0dXJlIExheWVyJywgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5UG9seWxpbmUnLCBkaXNwbGF5RmllbGQ6ICdyb3V0ZWlkJywgZmllbGRzLCBvYmplY3RJZEZpZWxkOiAnT0JKRUNUSUQnLCBoYXNBdHRhY2htZW50czogZmFsc2UsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcsQ3JlYXRlLFVwZGF0ZSxEZWxldGUnIH1dIH0pKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBhd2FpdCBmZXRjaChgJHthZG1pblVybH0vYWRkVG9EZWZpbml0aW9uYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRGVmUGFyYW1zIH0pXHJcblxyXG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHNlZ21lbnRzLmZpbHRlcihzID0+IHMucmlza1Njb3JlID4gMCkubWFwKHNlZyA9PiAoe1xyXG4gICAgICAgIGdlb21ldHJ5OiB7IHBhdGhzOiBbc2VnLnBhdGhdLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LFxyXG4gICAgICAgIGF0dHJpYnV0ZXM6IHsgcm91dGVpZDogc2VnLnJvdXRlSWQsIGZyb21fbTogc2VnLmZyb21NLCB0b19tOiBzZWcudG9NLCByaXNrX3Njb3JlOiBzZWcucmlza1Njb3JlLCByaXNrX2xldmVsOiBzZWcucmlza0xldmVsLCBjb250cmlidXRpbmdfZmFjdG9yczogc2VnLmNvbnRyaWJ1dGluZ0ZhY3RvcnMuam9pbignOyAnKSwgbW9kZWxfY29uZmlkZW5jZTogYEhpZ2ggKCR7bW9kZWwudG90YWxDcmFzaGVzLnRvTG9jYWxlU3RyaW5nKCl9IHRyYWluaW5nIGNyYXNoZXMpYCB9XHJcbiAgICAgIH0pKVxyXG5cclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmZWF0dXJlcy5sZW5ndGg7IGkgKz0gMTAwMCkge1xyXG4gICAgICAgIGNvbnN0IGJhdGNoID0gZmVhdHVyZXMuc2xpY2UoaSwgaSArIDEwMDApXHJcbiAgICAgICAgc2V0UHJvZ3Jlc3MoYFVwbG9hZGluZy4uLiAke01hdGgubWluKGkgKyAxMDAwLCBmZWF0dXJlcy5sZW5ndGgpfS8ke2ZlYXR1cmVzLmxlbmd0aH1gKVxyXG4gICAgICAgIGNvbnN0IGFkZEZlYXRQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZmVhdHVyZXMnLCBKU09OLnN0cmluZ2lmeShiYXRjaCkpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgICAgYWRkRmVhdFBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgICAgYXdhaXQgZmV0Y2goYCR7c2VydmljZVVybH0vMC9hZGRGZWF0dXJlc2AsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGFkZEZlYXRQYXJhbXMgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2hhcmVcclxuICAgICAgY29uc3Qgc2hhcmVQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdldmVyeW9uZScsICdmYWxzZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnb3JnJywgJ3RydWUnKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2l0ZW1zJywgdGVtcEl0ZW1JZClcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2NvbnRlbnRVcmx9L2l0ZW1zLyR7dGVtcEl0ZW1JZH0vc2hhcmVgLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBzaGFyZVBhcmFtcyB9KVxyXG5cclxuICAgICAgc2V0UHJvZ3Jlc3MoJ0Rpc3BsYXlpbmcgb24gbWFwLi4uJylcclxuICAgICAgYXdhaXQgZGlzcGxheVByZWRpY3Rpb25Pbk1hcChgJHtzZXJ2aWNlVXJsfS8wYCwgdG9rZW4sIHdraWQpXHJcbiAgICAgIHNldFJlc3VsdCh7IGxheWVyVXJsOiBzZXJ2aWNlVXJsLCBpdGVtVXJsOiBgJHtwb3J0YWxVcmx9L2hvbWUvaXRlbS5odG1sP2lkPSR7dGVtcEl0ZW1JZH1gIH0pXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW1N0YXRlTUxdIEZhaWxlZDonLCBlcnIpXHJcbiAgICAgIHNldEVycm9yKCdNTCBwcmVkaWN0aW9uIGZhaWxlZDogJyArIChlcnIubWVzc2FnZSB8fCBlcnIpKVxyXG4gICAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIHNldFJ1bm5pbmcoZmFsc2UpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZywgcXVlcnlFdmVudERhdGEsIHNlbGVjdGVkRm9sZGVySWQsIGRpc3BsYXlQcmVkaWN0aW9uT25NYXBdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBSRU5ERVIgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3Qgcm91dGVTZWxlY3Rpb25VSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnLCBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsIGJvcmRlclJhZGl1czogJzZweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZTBlMGUwJyB9fT5cclxuICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzhweCcsIGNvbG9yOiAnIzMzMycgfX0+U2VsZWN0IFJvdXRlczwvZGl2PlxyXG5cclxuICAgICAgey8qIFNlYXJjaCBtb2RlIHRhYnMgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaE1vZGUoJ2lkJyl9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHgnLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXI6IHNlYXJjaE1vZGUgPT09ICdpZCcgPyAnMnB4IHNvbGlkICMwMDc5YzEnIDogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogc2VhcmNoTW9kZSA9PT0gJ2lkJyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicgfX0+QnkgUm91dGUgSUQ8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWFyY2hNb2RlKCduYW1lJyl9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc1cHgnLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXI6IHNlYXJjaE1vZGUgPT09ICduYW1lJyA/ICcycHggc29saWQgIzAwNzljMScgOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzZWFyY2hNb2RlID09PSAnbmFtZScgPyAnI2U4ZjRmZCcgOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInIH19PkJ5IE5hbWU8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTZWFyY2hNb2RlKCdtYXAnKX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCcsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlcjogc2VhcmNoTW9kZSA9PT0gJ21hcCcgPyAnMnB4IHNvbGlkICMwMDc5YzEnIDogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogc2VhcmNoTW9kZSA9PT0gJ21hcCcgPyAnI2U4ZjRmZCcgOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInIH19PkRyYXcgQXJlYTwvYnV0dG9uPlxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBSb3V0ZSBJRCAvIE5hbWUgc2VhcmNoICovfVxyXG4gICAgICB7KHNlYXJjaE1vZGUgPT09ICdpZCcgfHwgc2VhcmNoTW9kZSA9PT0gJ25hbWUnKSAmJiAoXHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19PlxyXG4gICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiB2YWx1ZT17c2VhcmNoTW9kZSA9PT0gJ2lkJyA/IHJvdXRlSWQgOiByb3V0ZU5hbWV9IG9uQ2hhbmdlPXtlID0+IGhhbmRsZVJvdXRlU2VhcmNoKGUudGFyZ2V0LnZhbHVlKX0gcGxhY2Vob2xkZXI9e3NlYXJjaE1vZGUgPT09ICdpZCcgPyAnUm91dGUgSUQuLi4nIDogJ1JvdXRlIG5hbWUuLi4nfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNnB4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fSAvPlxyXG4gICAgICAgICAgICB7aGFzTWFwV2lkZ2V0ICYmIChcclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXtwaWNraW5nRnJvbU1hcCA/IGNhbmNlbFBpY2tGcm9tTWFwIDogc3RhcnRQaWNrRnJvbU1hcH0gc3R5bGU9e3sgcGFkZGluZzogJzZweCAxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBwaWNraW5nRnJvbU1hcCA/ICcjMDA3OWMxJyA6ICcjZmZmJywgY29sb3I6IHBpY2tpbmdGcm9tTWFwID8gJyNmZmYnIDogJyMwMDc5YzEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JyB9fT5cclxuICAgICAgICAgICAgICAgIHtwaWNraW5nRnJvbU1hcCA/ICdDYW5jZWwnIDogJ1BpY2snfVxyXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgey8qIEF1dG9jb21wbGV0ZSBzdWdnZXN0aW9ucyAqL31cclxuICAgICAgICAgIHtzaG93U3VnZ2VzdGlvbnMgJiYgcm91dGVTdWdnZXN0aW9ucy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIG1heEhlaWdodDogJzEwMHB4Jywgb3ZlcmZsb3c6ICdhdXRvJywgYmFja2dyb3VuZDogJyNmZmYnIH19PlxyXG4gICAgICAgICAgICAgIHtyb3V0ZVN1Z2dlc3Rpb25zLm1hcCgociwgaSkgPT4gKFxyXG4gICAgICAgICAgICAgICAgPGRpdiBrZXk9e2l9IG9uQ2xpY2s9eygpID0+IHNlbGVjdFJvdXRlKHIpfSBzdHlsZT17eyBwYWRkaW5nOiAnNHB4IDhweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzExcHgnLCBib3JkZXJCb3R0b206ICcxcHggc29saWQgI2VlZScgfX0gb25Nb3VzZU92ZXI9e2UgPT4gKGUuY3VycmVudFRhcmdldC5zdHlsZS5iYWNrZ3JvdW5kID0gJyNmMGYwZjAnKX0gb25Nb3VzZU91dD17ZSA9PiAoZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmQgPSAnI2ZmZicpfT5cclxuICAgICAgICAgICAgICAgICAge3Iucm91dGVJZH0ge3Iucm91dGVOYW1lID8gYCgke3Iucm91dGVOYW1lfSlgIDogJyd9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIHsvKiBSb3V0ZSBwaWNrIGRpc2FtYmlndWF0aW9uICovfVxyXG4gICAgICAgICAge3JvdXRlUGlja0NhbmRpZGF0ZXMgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgcGFkZGluZzogJzhweCcsIGJhY2tncm91bmQ6ICcjZThmNGZkJywgbWFyZ2luVG9wOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGZvbnRXZWlnaHQ6IDYwMCwgbWFyZ2luQm90dG9tOiAnNHB4JyB9fT5NdWx0aXBsZSByb3V0ZXMgZm91bmQg4oCUIHNlbGVjdCBvbmU6PC9kaXY+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXhIZWlnaHQ6ICcxNDBweCcsIG92ZXJmbG93OiAnYXV0bycgfX0+XHJcbiAgICAgICAgICAgICAgICB7cm91dGVQaWNrQ2FuZGlkYXRlcy5tYXAoKGMsIGkpID0+IChcclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBrZXk9e2l9IHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IHNldFJvdXRlSWQoYy5yb3V0ZUlkKTsgc2V0Um91dGVOYW1lKGMucm91dGVOYW1lKTsgc2V0Um91dGVQaWNrQ2FuZGlkYXRlcyhudWxsKTsgZmV0Y2hSb3V0ZU1lYXN1cmVzKGMucm91dGVJZCkgfX0gb25Nb3VzZUVudGVyPXsoKSA9PiB7IHNob3dSb3V0ZVByZXZpZXdSZWYuY3VycmVudChjLnJvdXRlSWQpIH19IG9uTW91c2VMZWF2ZT17KCkgPT4geyBjbGVhclJvdXRlUHJldmlldygpIH19IHN0eWxlPXt7IGRpc3BsYXk6ICdibG9jaycsIHdpZHRoOiAnMTAwJScsIHRleHRBbGlnbjogJ2xlZnQnLCBwYWRkaW5nOiAnNnB4IDEwcHgnLCBtYXJnaW5Cb3R0b206ICczcHgnLCBib3JkZXI6ICcxcHggc29saWQgI2RkZCcsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmRDb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250V2VpZ2h0OiA1MDAgfX0+e2Mucm91dGVOYW1lfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICB7Yy5yb3V0ZU5hbWUgIT09IGMucm91dGVJZCAmJiA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyM4ODgnLCBtYXJnaW5MZWZ0OiAnOHB4JyB9fT57Yy5yb3V0ZUlkfTwvc3Bhbj59XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICB7LyogTWVhc3VyZSByYW5nZSBpbnB1dHMgKi99XHJcbiAgICAgICAgICB7cm91dGVJZCAmJiByb3V0ZU1lYXN1cmVSYW5nZSAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnOHB4JywgcGFkZGluZzogJzhweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMGUwZTAnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgbWFyZ2luQm90dG9tOiAnNnB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGZvbnRXZWlnaHQ6IDYwMCwgY29sb3I6ICcjMzMzJyB9fT5NZWFzdXJlIFJhbmdlPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRGcm9tTWVhc3VyZShyb3V0ZU1lYXN1cmVSYW5nZS5taW4udG9GaXhlZCgzKSk7IHNldFRvTWVhc3VyZShyb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKSk7IHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgnZnJvbScsIHJvdXRlTWVhc3VyZVJhbmdlLm1pbi50b0ZpeGVkKDMpKTsgc2hvd01lYXN1cmVQb2ludFJlZi5jdXJyZW50KCd0bycsIHJvdXRlTWVhc3VyZVJhbmdlLm1heC50b0ZpeGVkKDMpKSB9fSBzdHlsZT17eyBwYWRkaW5nOiAnM3B4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjMDA3OWMxJywgYm9yZGVyUmFkaXVzOiAnM3B4JywgYmFja2dyb3VuZDogJyNlOGY0ZmQnLCBjb2xvcjogJyMwMDc5YzEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMHB4JywgZm9udFdlaWdodDogNjAwIH19Pldob2xlIFJvdXRlPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgIHsvKiBGcm9tIG1lYXN1cmUgKi99XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPGxhYmVsIHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIGNvbG9yOiAnIzY2NicsIGRpc3BsYXk6ICdibG9jaycsIG1hcmdpbkJvdHRvbTogJzJweCcgfX0+RnJvbXtyb3V0ZU1lYXN1cmVSYW5nZSA/IDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnI2FhYScsIG1hcmdpbkxlZnQ6ICc0cHgnIH19Pih7cm91dGVNZWFzdXJlUmFuZ2UubWluLnRvRml4ZWQoMyl9KTwvc3Bhbj4gOiBudWxsfTwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHsgaWYgKHBpY2tpbmdNZWFzdXJlID09PSAnZnJvbScpIGNhbmNlbFBpY2tNZWFzdXJlKCk7IGVsc2Ugc3RhcnRQaWNrTWVhc3VyZSgnZnJvbScpIH19IHRpdGxlPXtwaWNraW5nTWVhc3VyZSA9PT0gJ2Zyb20nID8gJ0NhbmNlbCcgOiAnUGljayBmcm9tIG1hcCd9IHN0eWxlPXt7IHdpZHRoOiAnMjhweCcsIGhlaWdodDogJzI4cHgnLCBwYWRkaW5nOiAwLCBib3JkZXI6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGN1cnNvcjogJ3BvaW50ZXInLCBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsIGJhY2tncm91bmRDb2xvcjogcGlja2luZ01lYXN1cmUgPT09ICdmcm9tJyA/ICcjZmZmM2UwJyA6ICcjZmZmJywgZmxleFNocmluazogMCwgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7cGlja2luZ01lYXN1cmUgPT09ICdmcm9tJyA/ICdcXHUyMzE2JyA6ICdcXHUyMUE1J31cclxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwibnVtYmVyXCIgdmFsdWU9e2Zyb21NZWFzdXJlfSBvbkNoYW5nZT17ZSA9PiBzZXRGcm9tTWVhc3VyZShlLnRhcmdldC52YWx1ZSl9IG9uQmx1cj17KCkgPT4geyBpZiAoZnJvbU1lYXN1cmUpIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgnZnJvbScsIGZyb21NZWFzdXJlKSB9fSBvbktleURvd249e2UgPT4geyBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgZnJvbU1lYXN1cmUpIHNob3dNZWFzdXJlUG9pbnRSZWYuY3VycmVudCgnZnJvbScsIGZyb21NZWFzdXJlKSB9fSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fSBwbGFjZWhvbGRlcj17cm91dGVNZWFzdXJlUmFuZ2UgPyByb3V0ZU1lYXN1cmVSYW5nZS5taW4udG9GaXhlZCgzKSA6ICdTdGFydCd9IC8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICAgICAgey8qIFRvIG1lYXN1cmUgKi99XHJcbiAgICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICAgIDxsYWJlbCBzdHlsZT17eyBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM2NjYnLCBkaXNwbGF5OiAnYmxvY2snLCBtYXJnaW5Cb3R0b206ICcycHgnIH19PlRve3JvdXRlTWVhc3VyZVJhbmdlID8gPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjYWFhJywgbWFyZ2luTGVmdDogJzRweCcgfX0+KHtyb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKX0pPC9zcGFuPiA6IG51bGx9PC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBpZiAocGlja2luZ01lYXN1cmUgPT09ICd0bycpIGNhbmNlbFBpY2tNZWFzdXJlKCk7IGVsc2Ugc3RhcnRQaWNrTWVhc3VyZSgndG8nKSB9fSB0aXRsZT17cGlja2luZ01lYXN1cmUgPT09ICd0bycgPyAnQ2FuY2VsJyA6ICdQaWNrIGZyb20gbWFwJ30gc3R5bGU9e3sgd2lkdGg6ICcyOHB4JywgaGVpZ2h0OiAnMjhweCcsIHBhZGRpbmc6IDAsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgY3Vyc29yOiAncG9pbnRlcicsIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJywgYmFja2dyb3VuZENvbG9yOiBwaWNraW5nTWVhc3VyZSA9PT0gJ3RvJyA/ICcjZmZmM2UwJyA6ICcjZmZmJywgZmxleFNocmluazogMCwgZm9udFNpemU6ICcxNHB4JyB9fT5cclxuICAgICAgICAgICAgICAgICAgICB7cGlja2luZ01lYXN1cmUgPT09ICd0bycgPyAnXFx1MjMxNicgOiAnXFx1MjFBNSd9XHJcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cIm51bWJlclwiIHZhbHVlPXt0b01lYXN1cmV9IG9uQ2hhbmdlPXtlID0+IHNldFRvTWVhc3VyZShlLnRhcmdldC52YWx1ZSl9IG9uQmx1cj17KCkgPT4geyBpZiAodG9NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgdG9NZWFzdXJlKSB9fSBvbktleURvd249e2UgPT4geyBpZiAoZS5rZXkgPT09ICdFbnRlcicgJiYgdG9NZWFzdXJlKSBzaG93TWVhc3VyZVBvaW50UmVmLmN1cnJlbnQoJ3RvJywgdG9NZWFzdXJlKSB9fSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4IDhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMnB4JyB9fSBwbGFjZWhvbGRlcj17cm91dGVNZWFzdXJlUmFuZ2UgPyByb3V0ZU1lYXN1cmVSYW5nZS5tYXgudG9GaXhlZCgzKSA6ICdFbmQnfSAvPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiBEcmF3IHBvbHlnb24gbW9kZSAqL31cclxuICAgICAge3NlYXJjaE1vZGUgPT09ICdtYXAnICYmIChcclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17c3RhcnREcmF3QXJlYX0gZGlzYWJsZWQ9e2RyYXdpbmd9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICc4cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzAwNzljMScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IGRyYXdpbmcgPyAnI2U4ZjRmZCcgOiAnI2ZmZicsIGNvbG9yOiAnIzAwNzljMScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA1MDAgfX0+XHJcbiAgICAgICAgICAgIHtkcmF3aW5nID8gJ0RyYXdpbmcuLi4gY2xpY2sgdG8gY29tcGxldGUnIDogYERyYXcgUG9seWdvbiBvbiBNYXAke21hcFJvdXRlcy5sZW5ndGggPiAwID8gYCAoJHttYXBSb3V0ZXMubGVuZ3RofSByb3V0ZXMgZm91bmQpYCA6ICcnfWB9XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIHttYXBSb3V0ZXMubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnNnB4JywgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjMzMzJyB9fT5cclxuICAgICAgICAgICAgICA8c3Ryb25nPntzZWxlY3RlZE1hcFJvdXRlSWRzLnNpemV9PC9zdHJvbmc+IG9mIHttYXBSb3V0ZXMubGVuZ3RofSByb3V0ZXMgc2VsZWN0ZWRcclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG5cclxuICAvLyBSZXN1bHQgdmlld1xyXG4gIGNvbnN0IHJlc3VsdFVJID0gKCkgPT4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTJweCcgfX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgdGV4dEFsaWduOiAnY2VudGVyJywgbWFyZ2luQm90dG9tOiAnMTJweCcgfX0+XHJcbiAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICczNnB4JyB9fT57J1xcdTI3MDUnfTwvc3Bhbj5cclxuICAgICAgPC9kaXY+XHJcbiAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMTNweCcsIGNvbG9yOiAnIzMzMycsIHRleHRBbGlnbjogJ2NlbnRlcicsIG1hcmdpbjogJzAgMCAxMnB4JyB9fT5cclxuICAgICAgICBQcmVkaWN0aW9uIGNvbXBsZXRlISBSaXNrIGxheWVyIGFkZGVkIHRvIG1hcC5cclxuICAgICAgPC9wPlxyXG5cclxuICAgICAgey8qIExlZ2VuZCAqL31cclxuICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTBweCcsIGJhY2tncm91bmQ6ICcjZjVmNWY1JywgYm9yZGVyUmFkaXVzOiAnNHB4JywgbWFyZ2luQm90dG9tOiAnMTJweCcgfX0+XHJcbiAgICAgICAge1t7IGNvbG9yOiAnIzM4OGUzYycsIHdpZHRoOiAzLCBsYWJlbDogJ0xvdyAoMS0yNSknIH0sIHsgY29sb3I6ICcjZmJjMDJkJywgd2lkdGg6IDMsIGxhYmVsOiAnTWVkaXVtICgyNi01MCknIH0sIHsgY29sb3I6ICcjZjU3YzAwJywgd2lkdGg6IDQsIGxhYmVsOiAnTWVkaXVtLUhpZ2ggKDUxLTc1KScgfSwgeyBjb2xvcjogJyNkMzJmMmYnLCB3aWR0aDogNSwgbGFiZWw6ICdIaWdoICg3Ni0xMDApJyB9XS5tYXAoKGl0ZW0sIGkpID0+IChcclxuICAgICAgICAgIDxkaXYga2V5PXtpfSBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc2cHgnLCBtYXJnaW5Cb3R0b206IGkgPCAzID8gJzRweCcgOiAwIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHdpZHRoOiAnMjBweCcsIGhlaWdodDogYCR7aXRlbS53aWR0aH1weGAsIGJhY2tncm91bmQ6IGl0ZW0uY29sb3IgfX0gLz5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JyB9fT57aXRlbS5sYWJlbH08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICApKX1cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7cmVzdWx0Py5pdGVtVXJsICYmIDxhIGhyZWY9e3Jlc3VsdC5pdGVtVXJsfSB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCIgc3R5bGU9e3sgZGlzcGxheTogJ2Jsb2NrJywgdGV4dEFsaWduOiAnY2VudGVyJywgZm9udFNpemU6ICcxMnB4JywgY29sb3I6ICcjMDA3OWMxJywgbWFyZ2luQm90dG9tOiAnMTJweCcgfX0+T3BlbiBpbiBQb3J0YWw8L2E+fVxyXG5cclxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzhweCcsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyB9fT5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93RXhwbGFuYXRpb24oIXNob3dFeHBsYW5hdGlvbil9IHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMTZweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjNmExYjlhJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogc2hvd0V4cGxhbmF0aW9uID8gJyNmM2U1ZjUnIDogJyNmZmYnLCBjb2xvcjogJyM2YTFiOWEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwIH19PlxyXG4gICAgICAgICAge3Nob3dFeHBsYW5hdGlvbiA/ICdIaWRlJyA6ICdXaHk/J31cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IHNldE1vZGUoJ2Nob29zZScpOyBzZXRSZXN1bHQobnVsbCk7IHNldFByb2dyZXNzKCcnKTsgc2V0U2hvd0V4cGxhbmF0aW9uKGZhbHNlKSB9fSBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDIwcHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyM2YTFiOWEnLCBjb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwIH19PkRvbmU8L2J1dHRvbj5cclxuICAgICAgPC9kaXY+XHJcblxyXG4gICAgICB7LyogRXhwbGFuYXRpb24gcGFuZWwgKi99XHJcbiAgICAgIHtzaG93RXhwbGFuYXRpb24gJiYgbW9kZSA9PT0gJ2FpJyAmJiBmYWN0b3JzICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzEycHgnLCBwYWRkaW5nOiAnMTJweCcsIGJhY2tncm91bmQ6ICcjZjhmOWZhJywgYm9yZGVyUmFkaXVzOiAnNnB4JywgZm9udFNpemU6ICcxMXB4JywgbWF4SGVpZ2h0OiAnMjUwcHgnLCBvdmVyZmxvd1k6ICdhdXRvJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNzAwLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlJpc2sgRmFjdG9yIEFuYWx5c2lzPC9kaXY+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgIEtlcm5lbC1kZW5zaXR5IHNjb3JpbmcgKHJhZGl1czoge2ZhY3RvcnMua2VybmVsUmFkaXVzfSBzZWdtZW50cykuIFNlZ21lbnRzOiB7ZmFjdG9ycy50b3RhbFNlZ21lbnRzfSB0b3RhbCwge2ZhY3RvcnMuc2VnbWVudHNXaXRoQ3Jhc2hlc30gd2l0aCBjcmFzaGVzLCB7ZmFjdG9ycy5oaWdoUmlza0NvdW50fSBoaWdoLXJpc2suXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIHtmYWN0b3JzLnRvcEhpZ2hSaXNrU2VnbWVudHM/Lmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxzdHJvbmc+VG9wIEhpZ2gtUmlzayBTZWdtZW50czo8L3N0cm9uZz5cclxuICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScsIGZvbnRTaXplOiAnMTBweCcsIG1hcmdpblRvcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8dGhlYWQ+PHRyIHN0eWxlPXt7IGJhY2tncm91bmQ6ICcjZWVlJyB9fT48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ2xlZnQnIH19PlJvdXRlPC90aD48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT5NaWxlczwvdGg+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+Q3Jhc2hlczwvdGg+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+U2NvcmU8L3RoPjwvdHI+PC90aGVhZD5cclxuICAgICAgICAgICAgICAgIDx0Ym9keT57ZmFjdG9ycy50b3BIaWdoUmlza1NlZ21lbnRzLnNsaWNlKDAsIDUpLm1hcCgoczogYW55LCBpOiBudW1iZXIpID0+IChcclxuICAgICAgICAgICAgICAgICAgPHRyIGtleT17aX0+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JyB9fT57cy5yb3V0ZUlkPy5zdWJzdHJpbmcoMCwgMTUpfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PntzLmZyb21NPy50b0ZpeGVkKDEpfS17cy50b00/LnRvRml4ZWQoMSl9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+e3MuY3Jhc2hDb3VudH08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JywgY29sb3I6ICcjZDMyZjJmJywgZm9udFdlaWdodDogNzAwIH19PntzLnJpc2tTY29yZX08L3RkPjwvdHI+XHJcbiAgICAgICAgICAgICAgICApKX08L3Rib2R5PlxyXG4gICAgICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHtzaG93RXhwbGFuYXRpb24gJiYgbW9kZSA9PT0gJ21sJyAmJiBtb2RlbEluZm8gJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luVG9wOiAnMTJweCcsIHBhZGRpbmc6ICcxMnB4JywgYmFja2dyb3VuZDogJyNmYWY1ZmMnLCBib3JkZXJSYWRpdXM6ICc2cHgnLCBmb250U2l6ZTogJzExcHgnLCBtYXhIZWlnaHQ6ICcyODBweCcsIG92ZXJmbG93WTogJ2F1dG8nIH19PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250V2VpZ2h0OiA3MDAsIG1hcmdpbkJvdHRvbTogJzhweCcsIGNvbG9yOiAnIzRhMTQ4YycgfX0+U3RhdGUgRGF0YSBNb2RlbCBFeHBsYW5hdGlvbjwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICA8c3Ryb25nPk1ldGhvZDo8L3N0cm9uZz4gV2VpZ2h0LW9mLUV2aWRlbmNlIHNjb3JpbmcgZnJvbSB7bW9kZWxJbmZvLnRvdGFsQ3Jhc2hlcz8udG9Mb2NhbGVTdHJpbmcoKX0gcmVhbCBOWSBzdGF0ZSBjcmFzaCByZWNvcmRzICh7bW9kZWxJbmZvLnllYXJzfSkuIEVhY2ggcm9hZCBjb25kaXRpb24gZ2V0cyBhIGNyYXNoIG11bHRpcGxpZXIgYmFzZWQgb24gaXRzIHN0YXRpc3RpY2FsIGFzc29jaWF0aW9uIHdpdGggZmF0YWwgY3Jhc2hlcy5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICA8c3Ryb25nPnZzLiBBSSAoRGVuc2l0eSk6PC9zdHJvbmc+IEFJIGZpbmRzIGV4aXN0aW5nIGhvdHNwb3RzLiBNTCBwcmVkaWN0cyA8ZW0+bmV3PC9lbT4gcmlzayBmcm9tIHJvYWQgY2hhcmFjdGVyaXN0aWNzIGFsb25lIOKAlCBkYW5nZXJvdXMgY29uZGl0aW9ucyB3aGVyZSBubyBjcmFzaGVzIGhhdmUgYmVlbiByZXBvcnRlZCB5ZXQuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIHtPYmplY3Qua2V5cyhtb2RlbEluZm8ud2VpZ2h0cyB8fCB7fSkubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgIDxkaXY+XHJcbiAgICAgICAgICAgICAgPHN0cm9uZz5Ub3AgUmlzayBNdWx0aXBsaWVycyBGb3VuZDo8L3N0cm9uZz5cclxuICAgICAgICAgICAgICA8dGFibGUgc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgYm9yZGVyQ29sbGFwc2U6ICdjb2xsYXBzZScsIGZvbnRTaXplOiAnMTBweCcsIG1hcmdpblRvcDogJzRweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8dGhlYWQ+PHRyIHN0eWxlPXt7IGJhY2tncm91bmQ6ICcjZWVlJyB9fT48dGggc3R5bGU9e3sgcGFkZGluZzogJzNweCcsIHRleHRBbGlnbjogJ2xlZnQnIH19PkZhY3RvcjwvdGg+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JyB9fT5WYWx1ZTwvdGg+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+V2VpZ2h0PC90aD48L3RyPjwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8dGJvZHk+e09iamVjdC5lbnRyaWVzKG1vZGVsSW5mby53ZWlnaHRzKS5mbGF0TWFwKChbZmllbGQsIHZhbHNdOiBbc3RyaW5nLCBhbnldKSA9PiBPYmplY3QuZW50cmllcyh2YWxzKS5tYXAoKFt2YWwsIHddOiBbc3RyaW5nLCBhbnldKSA9PiAoeyBmaWVsZCwgdmFsLCB3IH0pKSkuZmlsdGVyKCh4OiBhbnkpID0+IHgudyA+IDEuMCkuc29ydCgoYTogYW55LCBiOiBhbnkpID0+IGIudyAtIGEudykuc2xpY2UoMCwgMTApLm1hcCgoeDogYW55LCBpOiBudW1iZXIpID0+IChcclxuICAgICAgICAgICAgICAgICAgPHRyIGtleT17aX0+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JyB9fT57eC5maWVsZH08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT57eC52YWx9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcsIGNvbG9yOiB4LncgPj0gMiA/ICcjZDMyZjJmJyA6ICcjZjU3YzAwJywgZm9udFdlaWdodDogNzAwIH19Pnt4LncudG9GaXhlZCgxKX14PC90ZD48L3RyPlxyXG4gICAgICAgICAgICAgICAgKSl9PC90Ym9keT5cclxuICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzhweCcsIHBhZGRpbmc6ICc2cHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZjNjZCcsIGJvcmRlclJhZGl1czogJzNweCcsIGZvbnRTaXplOiAnMTBweCcsIGNvbG9yOiAnIzg1NjQwNCcgfX0+XHJcbiAgICAgICAgICAgIDxzdHJvbmc+Tm90ZTo8L3N0cm9uZz4gU2VnbWVudHMgd2l0aCBtdWx0aXBsZSBoaWdoLXdlaWdodCBmYWN0b3JzIGNvbXBvdW5kIChtdWx0aXBseSkuIEEgY3VydmUgKyBoaWdoIHNwZWVkICsgbm8gc2hvdWxkZXIgPSB2ZXJ5IGhpZ2ggcmlzayBldmVuIHdpdGggbm8gbG9jYWwgY3Jhc2ggaGlzdG9yeS5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG4gICAgPC9kaXY+XHJcbiAgKVxyXG5cclxuICAvLyBSdW5uaW5nIHN0YXRlIFVJXHJcbiAgY29uc3QgcnVubmluZ1VJID0gKCkgPT4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMjBweCcsIHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNTU1JywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT57cHJvZ3Jlc3N9PC9kaXY+XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAnNHB4JywgYmFja2dyb3VuZDogJyNlMGUwZTAnLCBib3JkZXJSYWRpdXM6ICcycHgnLCBvdmVyZmxvdzogJ2hpZGRlbicgfX0+XHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBoZWlnaHQ6ICcxMDAlJywgYmFja2dyb3VuZDogbW9kZSA9PT0gJ2FpJyA/ICcjN2IxZmEyJyA6ICcjNmExYjlhJywgd2lkdGg6ICc2MCUnLCBhbmltYXRpb246ICdwdWxzZSAxLjVzIGluZmluaXRlJyB9fSAvPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gIClcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gTUFJTiBMQVlPVVQgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgcmV0dXJuIChcclxuICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgaGVpZ2h0OiAnMTAwJScsIG92ZXJmbG93OiAnYXV0bycsIGZvbnRTaXplOiAnMTNweCcsIHBhZGRpbmc6ICcxMnB4JywgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcgfX0+XHJcblxyXG4gICAgICB7aGFzTWFwV2lkZ2V0ICYmIChcclxuICAgICAgICA8SmltdU1hcFZpZXdDb21wb25lbnQgdXNlTWFwV2lkZ2V0SWQ9eyhwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uWzBdIHx8IChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uZmlyc3Q/LigpfSBvbkFjdGl2ZVZpZXdDaGFuZ2U9e29uQWN0aXZlVmlld0NoYW5nZX0gLz5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIDxoNSBzdHlsZT17eyBtYXJnaW46ICcwIDAgMTJweCcsIGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5DcmFzaCBSaXNrIFByZWRpY3Rpb24gPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxMHB4JywgZm9udFdlaWdodDogNDAwLCBjb2xvcjogJyM5OTknIH19Pih2MjAyNi4wNS4xMyAxOTozOCk8L3NwYW4+PC9oNT5cclxuXHJcbiAgICAgIHsvKiBFcnJvciBkaXNwbGF5ICovfVxyXG4gICAgICB7ZXJyb3IgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JywgcGFkZGluZzogJzhweCAxMHB4JywgYmFja2dyb3VuZDogJyNmZmViZWUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyNjNjI4MjgnIH19PlxyXG4gICAgICAgICAge2Vycm9yfVxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0RXJyb3IobnVsbCl9IHN0eWxlPXt7IGZsb2F0OiAncmlnaHQnLCBiYWNrZ3JvdW5kOiAnbm9uZScsIGJvcmRlcjogJ25vbmUnLCBjb2xvcjogJyNjNjI4MjgnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFdlaWdodDogNzAwIH19PnsnXFx1MDBENyd9PC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT0gQ0hPT1NFIE1PREUgPT09PT09PT09PT09PT09PT09PT0gKi99XHJcbiAgICAgIHttb2RlID09PSAnY2hvb3NlJyAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICcxMnB4JyB9fT5cclxuXHJcbiAgICAgICAgICB7LyogQUkgT3B0aW9uICovfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCcsIGJhY2tncm91bmQ6ICcjZjNlNWY1JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjZTkzZDgnIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcyMHB4JyB9fT57J1xcdUQ4M0VcXHVEREUwJ308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzRhMTQ4YycgfX0+QUkgUHJlZGljdGlvbjwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93QUlIZWxwKCFzaG93QUlIZWxwKX0gc3R5bGU9e3sgd2lkdGg6ICcyNHB4JywgaGVpZ2h0OiAnMjRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjN2IxZmEyJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZDogc2hvd0FJSGVscCA/ICcjN2IxZmEyJyA6ICcjZmZmJywgY29sb3I6IHNob3dBSUhlbHAgPyAnI2ZmZicgOiAnIzdiMWZhMicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA3MDAsIGxpbmVIZWlnaHQ6ICcyMnB4JywgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogMCB9fT4/PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM2NjYnLCBtYXJnaW46ICcwIDAgMTBweCcgfX0+S2VybmVsLWRlbnNpdHkgc2NvcmluZyBmcm9tIGNyYXNoIGNsdXN0ZXJzICsgcm9hZCBhdHRyaWJ1dGVzPC9wPlxyXG4gICAgICAgICAgICB7c2hvd0FJSGVscCAmJiAoXHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTBweCcsIGJhY2tncm91bmQ6ICcjZmZmJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMXB4JywgbGluZUhlaWdodDogJzEuNycsIG1hcmdpbkJvdHRvbTogJzEwcHgnLCBib3JkZXI6ICcxcHggc29saWQgI2UxYmVlNycgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3Ryb25nPkhvdyBpdCB3b3Jrczo8L3N0cm9uZz48YnIgLz5cclxuICAgICAgICAgICAgICAgIDEuIFlvdSBzZWxlY3Qgcm91dGVzIChieSBJRCwgbmFtZSwgbWFwIGNsaWNrLCBvciBkcmF3IGFyZWEpPGJyIC8+XHJcbiAgICAgICAgICAgICAgICAyLiBUaGUgd2lkZ2V0IHF1ZXJpZXMgPGVtPmNyYXNoIGV2ZW50czwvZW0+IGFuZCA8ZW0+cm9hZCBhdHRyaWJ1dGUgZXZlbnRzPC9lbT4gZnJvbSB5b3VyIExSUzxiciAvPlxyXG4gICAgICAgICAgICAgICAgMy4gUm91dGVzIGFyZSBkaXZpZGVkIGludG8gMC41LW1pbGUgc2VnbWVudHM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDQuIENyYXNoIGNvdW50cyBwZXIgc2VnbWVudCBhcmUgY29tcHV0ZWQ8YnIgLz5cclxuICAgICAgICAgICAgICAgIDUuIEEga2VybmVsLWRlbnNpdHkgYWxnb3JpdGhtIHNwcmVhZHMgaW5mbHVlbmNlIGZyb20gaGlnaC1jcmFzaCBzZWdtZW50cyB0byBuZWlnaGJvcnM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDYuIFJvYWQgYXR0cmlidXRlcyAoY3VydmVzLCBncmFkZXMsIGV0Yy4pIGVucmljaCB0aGUgYW5hbHlzaXM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDcuIEEgY29sb3ItY29kZWQgcmlzayBsYXllciBpcyBwdWJsaXNoZWQgdG8geW91ciBwb3J0YWwgYW5kIGFkZGVkIHRvIHRoZSBtYXA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxiciAvPlxyXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5CZXN0IGZvcjo8L3N0cm9uZz4gRmluZGluZyBleGlzdGluZyBjcmFzaCBob3RzcG90cyBhbmQgbmVhcmJ5IHJpc2sgem9uZXMuXHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldE1vZGUoJ2FpJyl9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcxMHB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjN2IxZmEyJywgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgICAgICBSdW4gQUkgUHJlZGljdGlvblxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBNTCBPcHRpb24gKi99XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxNnB4JywgYmFja2dyb3VuZDogJyNlZGU3ZjYnLCBib3JkZXJSYWRpdXM6ICc4cHgnLCBib3JkZXI6ICcxcHggc29saWQgI2IzOWRkYicgfX0+XHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywganVzdGlmeUNvbnRlbnQ6ICdzcGFjZS1iZXR3ZWVuJywgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGdhcDogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzIwcHgnIH19PnsnXFx1RDgzRFxcdURDQ0EnfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTRweCcsIGZvbnRXZWlnaHQ6IDcwMCwgY29sb3I6ICcjMzExYjkyJyB9fT5NTCBQcmVkaWN0aW9uPC9zcGFuPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNob3dNTEhlbHAoIXNob3dNTEhlbHApfSBzdHlsZT17eyB3aWR0aDogJzI0cHgnLCBoZWlnaHQ6ICcyNHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICM2YTFiOWEnLCBib3JkZXJSYWRpdXM6ICc1MCUnLCBiYWNrZ3JvdW5kOiBzaG93TUxIZWxwID8gJyM2YTFiOWEnIDogJyNmZmYnLCBjb2xvcjogc2hvd01MSGVscCA/ICcjZmZmJyA6ICcjNmExYjlhJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDcwMCwgbGluZUhlaWdodDogJzIycHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBwYWRkaW5nOiAwIH19Pj88L2J1dHRvbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzY2NicsIG1hcmdpbjogJzAgMCAxMHB4JyB9fT5QcmUtY29tcHV0ZWQgd2VpZ2h0cyBmcm9tIDEuNU0gTlkgU3RhdGUgY3Jhc2ggcmVjb3JkczwvcD5cclxuICAgICAgICAgICAge3Nob3dNTEhlbHAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEwcHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZicsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTFweCcsIGxpbmVIZWlnaHQ6ICcxLjcnLCBtYXJnaW5Cb3R0b206ICcxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNkMWM0ZTknIH19PlxyXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Ib3cgaXQgd29ya3M6PC9zdHJvbmc+PGJyIC8+XHJcbiAgICAgICAgICAgICAgICAxLiBZb3Ugc2VsZWN0IHJvdXRlcyAoYnkgSUQsIG5hbWUsIG1hcCBjbGljaywgb3IgZHJhdyBhcmVhKTxiciAvPlxyXG4gICAgICAgICAgICAgICAgMi4gVGhlIHdpZGdldCBxdWVyaWVzIDxlbT5yb2FkIGNoYXJhY3RlcmlzdGljIGV2ZW50czwvZW0+IGZyb20geW91ciBMUlMgKGN1cnZlcywgZ3JhZGVzLCBzcGVlZCBsaW1pdHMsIGxhbmUgY291bnRzLCBzaG91bGRlcnMsIGV0Yy4pPGJyIC8+XHJcbiAgICAgICAgICAgICAgICAzLiBFYWNoIDAuNS1taWxlIHNlZ21lbnQncyByb2FkIGNvbmRpdGlvbnMgYXJlIG1hdGNoZWQgdG8gcHJlLWNvbXB1dGVkIHJpc2sgbXVsdGlwbGllcnMgZnJvbSAxLDUyNSwxMjMgcmVhbCBOWSBzdGF0ZSBjcmFzaCByZWNvcmRzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA0LiBGYWN0b3JzIGNvbXBvdW5kIOKAlCBhIGN1cnZlICsgaGlnaCBzcGVlZCArIG5vIHNob3VsZGVyID0gdmVyeSBoaWdoIHJpc2s8YnIgLz5cclxuICAgICAgICAgICAgICAgIDUuIEEgY29sb3ItY29kZWQgcHJlZGljdGlvbiBsYXllciBpcyBwdWJsaXNoZWQgYW5kIGFkZGVkIHRvIHRoZSBtYXA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxiciAvPlxyXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5CZXN0IGZvcjo8L3N0cm9uZz4gUHJlZGljdGluZyA8ZW0+bmV3PC9lbT4gcmlzayBmcm9tIHJvYWQgY2hhcmFjdGVyaXN0aWNzIGFsb25lIOKAlCBmaW5kaW5nIGRhbmdlcm91cyBjb25kaXRpb25zIGV2ZW4gd2hlcmUgbm8gY3Jhc2hlcyBoYXZlIGJlZW4gcmVwb3J0ZWQgeWV0LlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdtbCcpfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMTBweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnIzZhMWI5YScsIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICAgICAgUnVuIE1MIFByZWRpY3Rpb25cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiA9PT09PT09PT09PT09PT09PT09PSBBSSAvIE1MIFdPUktGTE9XID09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7KG1vZGUgPT09ICdhaScgfHwgbW9kZSA9PT0gJ21sJykgJiYgIXJlc3VsdCAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGZsZXhEaXJlY3Rpb246ICdjb2x1bW4nLCBnYXA6ICcxMnB4JyB9fT5cclxuXHJcbiAgICAgICAgICB7LyogQmFjayBidXR0b24gKi99XHJcbiAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiB7IHNldE1vZGUoJ2Nob29zZScpOyBzZXRFcnJvcihudWxsKTsgc2V0UHJvZ3Jlc3MoJycpIH19IGRpc2FibGVkPXtydW5uaW5nfSBzdHlsZT17eyBhbGlnblNlbGY6ICdmbGV4LXN0YXJ0JywgcGFkZGluZzogJzRweCAxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM1NTUnIH19PlxyXG4gICAgICAgICAgICB7J1xcdTIxOTAnfSBCYWNrXHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuXHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICc4cHggMTJweCcsIGJhY2tncm91bmQ6IG1vZGUgPT09ICdhaScgPyAnI2YzZTVmNScgOiAnI2VkZTdmNicsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCwgY29sb3I6IG1vZGUgPT09ICdhaScgPyAnIzRhMTQ4YycgOiAnIzMxMWI5MicgfX0+XHJcbiAgICAgICAgICAgIHttb2RlID09PSAnYWknID8gJ1xcdUQ4M0VcXHVEREUwIEFJIFByZWRpY3Rpb24nIDogJ1xcdUQ4M0RcXHVEQ0NBIE1MIFByZWRpY3Rpb24nfVxyXG4gICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgey8qIFJvdXRlIHNlbGVjdGlvbiAqL31cclxuICAgICAgICAgIHshcnVubmluZyAmJiByb3V0ZVNlbGVjdGlvblVJKCl9XHJcblxyXG4gICAgICAgICAgey8qIFJ1biBidXR0b24gKi99XHJcbiAgICAgICAgICB7IXJ1bm5pbmcgJiYgKFxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXttb2RlID09PSAnYWknID8gcnVuQUlQcmVkaWN0aW9uIDogcnVuTUxQcmVkaWN0aW9ufSBkaXNhYmxlZD17cnVubmluZyB8fCAoc2VhcmNoTW9kZSAhPT0gJ21hcCcgJiYgIXJvdXRlSWQudHJpbSgpKSB8fCAoc2VhcmNoTW9kZSA9PT0gJ21hcCcgJiYgc2VsZWN0ZWRNYXBSb3V0ZUlkcy5zaXplID09PSAwKX0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzEycHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogKHJ1bm5pbmcgfHwgKHNlYXJjaE1vZGUgIT09ICdtYXAnICYmICFyb3V0ZUlkLnRyaW0oKSkgfHwgKHNlYXJjaE1vZGUgPT09ICdtYXAnICYmIHNlbGVjdGVkTWFwUm91dGVJZHMuc2l6ZSA9PT0gMCkpID8gJyNhYWEnIDogKG1vZGUgPT09ICdhaScgPyAnIzdiMWZhMicgOiAnIzZhMWI5YScpLCBjb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNjAwIH19PlxyXG4gICAgICAgICAgICAgIHttb2RlID09PSAnYWknID8gJ1J1biBBSSBQcmVkaWN0aW9uJyA6ICdSdW4gTUwgUHJlZGljdGlvbid9XHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICB7LyogUHJvZ3Jlc3MgKi99XHJcbiAgICAgICAgICB7cnVubmluZyAmJiBydW5uaW5nVUkoKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiA9PT09PT09PT09PT09PT09PT09PSBSRVNVTFQgPT09PT09PT09PT09PT09PT09PT0gKi99XHJcbiAgICAgIHtyZXN1bHQgJiYgcmVzdWx0VUkoKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2lkZ2V0XHJcblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=