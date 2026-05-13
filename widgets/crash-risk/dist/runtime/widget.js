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
    const [searchMode, setSearchMode] = useState('id');
    const [routeSuggestions, setRouteSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [pickingFromMap, setPickingFromMap] = useState(false);
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
    // Initialize LrsService (JSONP-based, bypasses CORS)
    useEffect(() => {
        if (config === null || config === void 0 ? void 0 : config.lrsServiceUrl) {
            lrsServiceRef.current = new _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_2__.LrsService(config.lrsServiceUrl);
        }
    }, [config === null || config === void 0 ? void 0 : config.lrsServiceUrl]);
    // Keep token fresh
    useEffect(() => {
        const session = jimu_core__WEBPACK_IMPORTED_MODULE_0__.SessionManager.getInstance().getMainSession();
        if ((session === null || session === void 0 ? void 0 : session.token) && lrsServiceRef.current) {
            lrsServiceRef.current.setToken(session.token);
        }
    });
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
    // Fetch route geometry + measure range
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
                routeGeometriesRef.current.set(rid, { vertices: allVerts, mIdx });
            }
        }
        catch (e) {
            console.error('[CrashRisk] fetchRouteMeasures failed:', e);
        }
    }), [config]);
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
                routePickCandidates.map((c, i) => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { key: i, onClick: () => { setRouteId(c.routeId); setRouteName(c.routeName); setRoutePickCandidates(null); fetchRouteMeasures(c.routeId); }, style: { padding: '4px 6px', cursor: 'pointer', fontSize: '11px', borderRadius: '3px' }, onMouseOver: e => (e.currentTarget.style.background = '#cce5f7'), onMouseOut: e => (e.currentTarget.style.background = 'transparent') },
                    c.routeName,
                    " (",
                    c.routeId,
                    ")"))))),
            fromMeasure && toMeasure && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { fontSize: '11px', color: '#555', marginTop: '4px' } },
                "Measures: ",
                fromMeasure,
                " \u2013 ",
                toMeasure)))),
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
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { fontSize: '10px', fontWeight: 400, color: '#999' } }, "(v2026.05.13)")),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9jcmFzaC1yaXNrL2Rpc3QvcnVudGltZS93aWRnZXQuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBYUEsSUFBSSxZQUFZLEdBQUcsQ0FBQztBQUVwQjs7O0dBR0c7QUFDSCxTQUFTLFlBQVksQ0FBRSxHQUFXLEVBQUUsTUFBOEI7SUFDaEUsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUNyQyxNQUFNLFlBQVksR0FBRyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxZQUFZLEVBQUUsRUFBRTtRQUM5RCxNQUFNLENBQUMsUUFBUSxHQUFHLFlBQVk7UUFFOUIsTUFBTSxFQUFFLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsUUFBUSxFQUFFO1FBQ2pELE1BQU0sU0FBUyxHQUFHLEdBQUcsR0FBRyxJQUFJLEVBQUUsRUFBRTtRQUVoQyxNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztRQUMvQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVM7UUFFdEIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFO1lBQ25CLE9BQVEsTUFBYyxDQUFDLFlBQVksQ0FBQztZQUNwQyxJQUFJLE1BQU0sQ0FBQyxVQUFVO2dCQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUM5RCxDQUFDLENBRUE7UUFBQyxNQUFjLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtZQUM3QyxPQUFPLEVBQUU7WUFDVCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFDLENBQUM7WUFDMUQsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLE9BQU8sQ0FB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QUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQzFELG1CQUFtQixFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDbEUscUJBQXFCLEVBQUUsRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNyRSxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtZQUNwRCxNQUFNLEVBQUUsRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtTQUNyRDtRQUNELE9BQU8sRUFBRTtZQUNQLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1lBQ3RELFFBQVEsRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ3ZELE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ3JELE1BQU0sRUFBRSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO1lBQ3BELDBCQUEwQixFQUFFLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7WUFDdEUsZ0JBQWdCLEVBQUUsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksRUFB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R0FBRyxDQUFDO2dCQUNkLE9BQU8sT0FBTyxHQUFHLFVBQVUsRUFBRSxDQUFDO29CQUM1QixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsVUFBVSxDQUFDO29CQUNqRCxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO29CQUNsQyxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUM7b0JBQ3RCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUM3QyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzt3QkFDakMsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNyQyxJQUFJLElBQUksSUFBSSxFQUFFLElBQUksSUFBSSxJQUFJLEVBQUUsRUFBRSxDQUFDOzRCQUM3QixNQUFNLElBQUksR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEQsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsSUFBSSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDcEUsTUFBSzt3QkFDUCxDQUFDO29CQUNILENBQUM7b0JBQ0QsTUFBTSxJQUFJLEdBQWUsRUFBRTtvQkFDM0IsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7d0JBQzdDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO3dCQUNqQyxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQ3JDLElBQUksRUFBRSxHQUFHLE9BQU87NEJBQUUsU0FBUTt3QkFDMUIsSUFBSSxFQUFFLEdBQUcsS0FBSzs0QkFBRSxNQUFLO3dCQUNyQixJQUFJLEVBQUUsSUFBSSxPQUFPLElBQUksRUFBRSxJQUFJLEtBQUssRUFBRSxDQUFDOzRCQUNqQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDbkgsQ0FBQzs2QkFBTSxJQUFJLEVBQUUsR0FBRyxPQUFPLElBQUksRUFBRSxHQUFHLE9BQU8sRUFBRSxDQUFDOzRCQUN4QyxNQUFNLElBQUksR0FBRyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7NEJBQ3ZDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMzSSxDQUFDO3dCQUNELElBQUksRUFBRSxJQUFJLE9BQU8sSUFBSSxFQUFFLElBQUksS0FBSzs0QkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NkJBQ2hGLElBQUksRUFBRSxHQUFHLEtBQUssSUFBSSxFQUFFLEdBQUcsS0FBSyxFQUFFLENBQUM7NEJBQ2xDLE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQzs0QkFDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcs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QUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQztvQkFFOUUsYUFBYTtvQkFDYixNQUFNLElBQUksR0FBZSxFQUFFO29CQUMzQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRSxDQUFDO3dCQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7d0JBQzFCLElBQUksRUFBRSxJQUFJLEtBQUssSUFBSSxFQUFFLElBQUksR0FBRzs0QkFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN2RCxDQUFDO29CQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7NEJBQzFDLE1BQU0sRUFBRSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDakMsTUFBTSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDckMsSUFBSSxFQUFFLElBQUksS0FBSyxJQUFJLEVBQUUsSUFBSSxLQUFLLEVBQUUsQ0FBQztnQ0FDL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDdkMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILENBQUM7NEJBQ0QsSUFBSSxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQ0FDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDckMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILENBQUM7d0JBQ0gsQ0FBQztvQkFDSCxDQUFDO29CQUNELElBQUksSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDO3dCQUFFLFNBQVE7b0JBRTdCLE1BQU0sU0FBUyxHQUFHLFNBQVMsSUFBSSxFQUFFLENB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QUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFnQixFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBTSxFQUFFLENBQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFNLEVBQUUsQ0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUN4USxtRUFBSSxHQUFHLEVBQUUsQ0FBQzs0QkFBRSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLElBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBTTs0QkFBQSxtRUFBSSxLQUFLLEVBQUUsRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsSUFBRyxDQUFDLENBQUMsR0FBRyxDQUFNOzRCQUFBLG1FQUFJLEtBQUssRUFBRSxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUU7Z0NBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29DQUFPLENBQUssQ0FDMVEsQ0FBQyxDQUFTLENBQ0wsQ0FDSixDQUNQO2dCQUNELG9FQUFLLEtBQUssRUFBRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsU0FB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TSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRTt3QkFDL0QscUVBQU0sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFHLGNBQWMsQ0FBUTt3QkFDMUQscUVBQU0sS0FBSyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsb0JBQXNCLENBQ3RGO29CQUNOLHVFQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsbUJBQW1CLEVBQUUsWUFBWSxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFZLENBQ25XO2dCQUNOLGtFQUFHLEtBQUssRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLDREQUEyRDtnQkFDM0gsVUFBVSxJQUFJLENBQ2Isb0VBQUssS0FBSyxFQUFFLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVB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LENBQUMsVUFBVSxLQUFLLEtBQUssSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLEdBQUcsRUFBRSxJQUNqaEIsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUNuRCxDQUNWO1lBR0EsT0FBTyxJQUFJLFNBQVMsRUFBRSxDQUNuQixDQUNQO1FBR0EsTUFBTSxJQUFJLFFBQVEsRUFBRSxDQUNqQixDQUNQO0FBQ0gsQ0FBQztBQUVELGlFQUFlLE1BQU07QUFFYixTQUFTLDJCQUEyQixDQUFDLEdBQUcsSUFBSSxxQkFBdUIsR0FBRyxHQUFHLEVBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9scnMtdXRpbHMvbHJzLXNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWFyY2dpc1wiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9jcmFzaC1yaXNrL3NyYy9ydW50aW1lL3dpZGdldC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiLy8gTFJTIFJFU1QgQVBJIFNlcnZpY2Ugd3JhcHBlclxyXG4vLyBVc2VzIEpTT05QIHRvIGJ5cGFzcyBDT1JTIGlzc3VlcyB3aXRoIG1pc2NvbmZpZ3VyZWQgc2VydmVycyAoZHVwbGljYXRlIEFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbiBoZWFkZXJzKVxyXG5pbXBvcnQgdHlwZSB7XHJcbiAgTHJzU2VydmljZUluZm8sXHJcbiAgTmV0d29ya0xheWVySW5mbyxcclxuICBFdmVudExheWVySW5mbyxcclxuICBNZWFzdXJlVG9HZW9tZXRyeUxvY2F0aW9uLFxyXG4gIE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0LFxyXG4gIEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0LFxyXG4gIFF1ZXJ5QXR0cmlidXRlU2V0UGFyYW1zLFxyXG4gIEZlYXR1cmVTZXRSZXN1bHRcclxufSBmcm9tICcuL3R5cGVzJ1xyXG5cclxubGV0IGpzb25wQ291bnRlciA9IDBcclxuXHJcbi8qKlxyXG4gKiBKU09OUCByZXF1ZXN0IOKAlCBieXBhc3NlcyBDT1JTIGVudGlyZWx5IGJ5IGluamVjdGluZyBhIDxzY3JpcHQ+IHRhZy5cclxuICogQXJjR0lTIFJFU1QgQVBJIHN1cHBvcnRzIEpTT05QIHZpYSB0aGUgJ2NhbGxiYWNrJyBwYXJhbWV0ZXIuXHJcbiAqL1xyXG5mdW5jdGlvbiBqc29ucFJlcXVlc3QgKHVybDogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPGFueT4ge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCBjYWxsYmFja05hbWUgPSBgX2xyc19jYl8ke0RhdGUubm93KCl9XyR7anNvbnBDb3VudGVyKyt9YFxyXG4gICAgcGFyYW1zLmNhbGxiYWNrID0gY2FsbGJhY2tOYW1lXHJcblxyXG4gICAgY29uc3QgcXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHBhcmFtcykudG9TdHJpbmcoKVxyXG4gICAgY29uc3Qgc2NyaXB0VXJsID0gYCR7dXJsfT8ke3FzfWBcclxuXHJcbiAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKVxyXG4gICAgc2NyaXB0LnNyYyA9IHNjcmlwdFVybFxyXG5cclxuICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XHJcbiAgICAgIGRlbGV0ZSAod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXVxyXG4gICAgICBpZiAoc2NyaXB0LnBhcmVudE5vZGUpIHNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHNjcmlwdClcclxuICAgIH1cclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlIHx8ICdSZXF1ZXN0IGVycm9yJykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc2NyaXB0Lm9uZXJyb3IgPSAoKSA9PiB7XHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICByZWplY3QobmV3IEVycm9yKCdKU09OUCByZXF1ZXN0IGZhaWxlZCcpKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICgod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSkge1xyXG4gICAgICAgIGNsZWFudXAoKVxyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1JlcXVlc3QgdGltZW91dCcpKVxyXG4gICAgICB9XHJcbiAgICB9LCAzMDAwMClcclxuXHJcbiAgICA7KHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0gPSAoZGF0YTogYW55KSA9PiB7XHJcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lcilcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yLm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZXJyb3InKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdClcclxuICB9KVxyXG59XHJcblxyXG4vKipcclxuICogV3JhcHBlciBhcm91bmQgQXJjR0lTIExSUyBSRVNUIEFQSSAoTFJTZXJ2ZXIgZXh0ZW5zaW9uKS5cclxuICogVXNlcyBKU09OUCBmb3IgYWxsIHJlcXVlc3RzIHRvIGF2b2lkIENPUlMgaXNzdWVzLlxyXG4gKi9cclxuZXhwb3J0IGNsYXNzIExyc1NlcnZpY2Uge1xyXG4gIHByaXZhdGUgYmFzZVVybDogc3RyaW5nXHJcbiAgcHJpdmF0ZSB0b2tlbjogc3RyaW5nIHwgbnVsbFxyXG5cclxuICBjb25zdHJ1Y3RvciAoYmFzZVVybDogc3RyaW5nLCB0b2tlbj86IHN0cmluZykge1xyXG4gICAgLy8gRW5zdXJlIG5vIHRyYWlsaW5nIHNsYXNoXHJcbiAgICB0aGlzLmJhc2VVcmwgPSBiYXNlVXJsLnJlcGxhY2UoL1xcLyskLywgJycpXHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW4gfHwgbnVsbFxyXG4gIH1cclxuXHJcbiAgc2V0VG9rZW4gKHRva2VuOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlblxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggTFJTIHNlcnZpY2UgbWV0YWRhdGEgKG5ldHdvcmsgbGF5ZXJzLCBldmVudCBsYXllcnMsIGV0Yy4pXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0U2VydmljZUluZm8gKCk6IFByb21pc2U8THJzU2VydmljZUluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8THJzU2VydmljZUluZm8+KCcnKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggZGV0YWlsZWQgaW5mbyBmb3IgYSBuZXR3b3JrIGxheWVyIChmaWVsZHMsIG1lYXN1cmUgcHJlY2lzaW9uLCBldGMuKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldE5ldHdvcmtMYXllckluZm8gKGxheWVySWQ6IG51bWJlcik6IFByb21pc2U8TmV0d29ya0xheWVySW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxOZXR3b3JrTGF5ZXJJbmZvPihgL25ldHdvcmtMYXllcnMvJHtsYXllcklkfWApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBkZXRhaWxlZCBpbmZvIGZvciBhbiBldmVudCBsYXllclxyXG4gICAqL1xyXG4gIGFzeW5jIGdldEV2ZW50TGF5ZXJJbmZvIChsYXllcklkOiBudW1iZXIpOiBQcm9taXNlPEV2ZW50TGF5ZXJJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEV2ZW50TGF5ZXJJbmZvPihgL2V2ZW50TGF5ZXJzLyR7bGF5ZXJJZH1gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCByb3V0ZSBJRCArIG1lYXN1cmVzIHRvIG1hcCBnZW9tZXRyeVxyXG4gICAqL1xyXG4gIGFzeW5jIG1lYXN1cmVUb0dlb21ldHJ5IChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBsb2NhdGlvbnM6IE1lYXN1cmVUb0dlb21ldHJ5TG9jYXRpb25bXSxcclxuICAgIG91dFNSPzogYW55XHJcbiAgKTogUHJvbWlzZTxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4ge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucyksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKG91dFNSKSB7XHJcbiAgICAgIHBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KG91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9tZWFzdXJlVG9HZW9tZXRyeWAsXHJcbiAgICAgIHBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQ29udmVydCBtYXAgZ2VvbWV0cnkgKHBvaW50KSB0byByb3V0ZSArIG1lYXN1cmVcclxuICAgKi9cclxuICBhc3luYyBnZW9tZXRyeVRvTWVhc3VyZSAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgbG9jYXRpb25zOiBBcnJheTx7IGdlb21ldHJ5OiBhbnkgfT4sXHJcbiAgICBvdXRTUj86IGFueVxyXG4gICk6IFByb21pc2U8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChvdXRTUikge1xyXG4gICAgICBwYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShvdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8R2VvbWV0cnlUb01lYXN1cmVSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vZ2VvbWV0cnlUb01lYXN1cmVgLFxyXG4gICAgICBwYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIER5bmFtaWMgc2VnbWVudGF0aW9uIG92ZXJsYXkg4oCUIHF1ZXJ5QXR0cmlidXRlU2V0XHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlBdHRyaWJ1dGVTZXQgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIHBhcmFtczogUXVlcnlBdHRyaWJ1dGVTZXRQYXJhbXNcclxuICApOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHJlcXVlc3RQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmxvY2F0aW9ucyksXHJcbiAgICAgIGF0dHJpYnV0ZVNldDogSlNPTi5zdHJpbmdpZnkocGFyYW1zLmF0dHJpYnV0ZVNldCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHBhcmFtcy5vdXRTUikge1xyXG4gICAgICByZXF1ZXN0UGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkocGFyYW1zLm91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxGZWF0dXJlU2V0UmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L3F1ZXJ5QXR0cmlidXRlU2V0YCxcclxuICAgICAgcmVxdWVzdFBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU3RhbmRhcmQgZmVhdHVyZSBxdWVyeSBhZ2FpbnN0IGEgbWFwIHNlcnZpY2UgbGF5ZXIgKGZvciBSb2FkIExvZyBpbmRpdmlkdWFsIGV2ZW50IHF1ZXJpZXMpXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlcyAoXHJcbiAgICBtYXBTZXJ2aWNlVXJsOiBzdHJpbmcsXHJcbiAgICBsYXllcklkOiBudW1iZXIsXHJcbiAgICB3aGVyZTogc3RyaW5nLFxyXG4gICAgb3V0RmllbGRzOiBzdHJpbmdbXSA9IFsnKiddXHJcbiAgKTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICAvLyBUaGUgbWFwIHNlcnZpY2UgVVJMIGlzIHRoZSBwYXJlbnQgb2YgTFJTZXJ2ZXIgZXh0ZW5zaW9uXHJcbiAgICAvLyBlLmcuIC4uLi9NYXBTZXJ2ZXIvMC9xdWVyeVxyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IHRoaXMuYmFzZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtsYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIHdoZXJlLFxyXG4gICAgICBvdXRGaWVsZHM6IG91dEZpZWxkcy5qb2luKCcsJyksXHJcbiAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRGlyZWN0IHF1ZXJ5IHdpdGggYXJiaXRyYXJ5IHBhcmFtcyAoZm9yIHNwYXRpYWwgcXVlcmllcyB2aWEgSlNPTlApXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlGZWF0dXJlc0RpcmVjdCAodXJsOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG4gICAgcGFyYW1zLmYgPSBwYXJhbXMuZiB8fCAnanNvbidcclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBRdWVyeSByb3V0ZXMgb24gYSBuZXR3b3JrIGxheWVyIChmb3Igcm91dGUgcGlja2VyIGF1dG9jb21wbGV0ZSlcclxuICAgKi9cclxuICBhc3luYyBxdWVyeVJvdXRlcyAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgc2VhcmNoVGV4dDogc3RyaW5nLFxyXG4gICAgcm91dGVJZEZpZWxkOiBzdHJpbmcsXHJcbiAgICByb3V0ZU5hbWVGaWVsZDogc3RyaW5nIHwgbnVsbCxcclxuICAgIG1heFJlc3VsdHM6IG51bWJlciA9IDEwXHJcbiAgKTogUHJvbWlzZTxBcnJheTx7IHJvdXRlSWQ6IHN0cmluZzsgcm91dGVOYW1lOiBzdHJpbmcgfCBudWxsIH0+PiB7XHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gdGhpcy5iYXNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke25ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICBjb25zdCBzZWFyY2hGaWVsZCA9IHJvdXRlTmFtZUZpZWxkIHx8IHJvdXRlSWRGaWVsZFxyXG4gICAgY29uc3Qgd2hlcmUgPSBgVVBQRVIoJHtzZWFyY2hGaWVsZH0pIExJS0UgVVBQRVIoJyR7c2VhcmNoVGV4dC5yZXBsYWNlKC8nL2csIFwiJydcIil9JScpYFxyXG4gICAgY29uc3Qgb3V0RmllbGRzID0gcm91dGVOYW1lRmllbGRcclxuICAgICAgPyBbcm91dGVJZEZpZWxkLCByb3V0ZU5hbWVGaWVsZF1cclxuICAgICAgOiBbcm91dGVJZEZpZWxkXVxyXG5cclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgd2hlcmUsXHJcbiAgICAgIG91dEZpZWxkczogb3V0RmllbGRzLmpvaW4oJywnKSxcclxuICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgIHJlc3VsdFJlY29yZENvdW50OiBtYXhSZXN1bHRzLnRvU3RyaW5nKCksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGpzb24gPSBhd2FpdCBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcblxyXG4gICAgY29uc3QgYWxsID0gKGpzb24uZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiAoe1xyXG4gICAgICByb3V0ZUlkOiBmLmF0dHJpYnV0ZXNbcm91dGVJZEZpZWxkXSxcclxuICAgICAgcm91dGVOYW1lOiByb3V0ZU5hbWVGaWVsZCA/IGYuYXR0cmlidXRlc1tyb3V0ZU5hbWVGaWVsZF0gOiBudWxsXHJcbiAgICB9KSlcclxuICAgIC8vIERlZHVwbGljYXRlIGJ5IHJvdXRlSWRcclxuICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0PHN0cmluZz4oKVxyXG4gICAgcmV0dXJuIGFsbC5maWx0ZXIoKHI6IGFueSkgPT4ge1xyXG4gICAgICBpZiAoc2Vlbi5oYXMoci5yb3V0ZUlkKSkgcmV0dXJuIGZhbHNlXHJcbiAgICAgIHNlZW4uYWRkKHIucm91dGVJZClcclxuICAgICAgcmV0dXJuIHRydWVcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICAvLyAtLS0gUHJpdmF0ZSBoZWxwZXJzIC0tLVxyXG5cclxuICBwcml2YXRlIGFzeW5jIHJlcXVlc3Q8VD4gKHBhdGg6IHN0cmluZywgcGFyYW1zPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8VD4ge1xyXG4gICAgY29uc3QgdXJsID0gYCR7dGhpcy5iYXNlVXJsfSR7cGF0aH1gXHJcbiAgICBjb25zdCBhbGxQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGY6ICdqc29uJyxcclxuICAgICAgLi4ucGFyYW1zXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBhbGxQYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIGFsbFBhcmFtcykgYXMgUHJvbWlzZTxUPlxyXG4gIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9hcmNnaXNfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCIvKiogQGpzeFJ1bnRpbWUgY2xhc3NpYyAqL1xyXG5pbXBvcnQgeyBSZWFjdCwgdHlwZSBBbGxXaWRnZXRQcm9wcywgU2Vzc2lvbk1hbmFnZXIgfSBmcm9tICdqaW11LWNvcmUnXHJcbmltcG9ydCB7IEppbXVNYXBWaWV3Q29tcG9uZW50LCB0eXBlIEppbXVNYXBWaWV3IH0gZnJvbSAnamltdS1hcmNnaXMnXHJcbmltcG9ydCB0eXBlIHsgSU1Db25maWcgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IExyc1NlcnZpY2UgfSBmcm9tICcuLi9scnMtdXRpbHMvbHJzLXNlcnZpY2UnXHJcblxyXG5jb25zdCB7IHVzZVN0YXRlLCB1c2VDYWxsYmFjaywgdXNlUmVmLCB1c2VFZmZlY3QgfSA9IFJlYWN0XHJcblxyXG50eXBlIFdvcmtmbG93TW9kZSA9ICdjaG9vc2UnIHwgJ2FpJyB8ICdtbCdcclxuXHJcbmNvbnN0IFdpZGdldCA9IChwcm9wczogQWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+KSA9PiB7XHJcbiAgY29uc3QgY29uZmlnID0gcHJvcHMuY29uZmlnXHJcbiAgY29uc3QgaGFzTWFwV2lkZ2V0ID0gQm9vbGVhbihwcm9wcy51c2VNYXBXaWRnZXRJZHMgJiYgKChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KS5sZW5ndGggPiAwIHx8IChwcm9wcy51c2VNYXBXaWRnZXRJZHMgYXMgYW55KT8uc2l6ZSA+IDApKVxyXG5cclxuICAvLyBXb3JrZmxvdyBzdGF0ZVxyXG4gIGNvbnN0IFttb2RlLCBzZXRNb2RlXSA9IHVzZVN0YXRlPFdvcmtmbG93TW9kZT4oJ2Nob29zZScpXHJcbiAgY29uc3QgW3Nob3dBSUhlbHAsIHNldFNob3dBSUhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW3Nob3dNTEhlbHAsIHNldFNob3dNTEhlbHBdID0gdXNlU3RhdGUoZmFsc2UpXHJcblxyXG4gIC8vIFJvdXRlIHNlbGVjdGlvbiBzdGF0ZVxyXG4gIGNvbnN0IFtyb3V0ZUlkLCBzZXRSb3V0ZUlkXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFtyb3V0ZU5hbWUsIHNldFJvdXRlTmFtZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbZnJvbU1lYXN1cmUsIHNldEZyb21NZWFzdXJlXSA9IHVzZVN0YXRlKCcnKVxyXG4gIGNvbnN0IFt0b01lYXN1cmUsIHNldFRvTWVhc3VyZV0gPSB1c2VTdGF0ZSgnJylcclxuICBjb25zdCBbc2VhcmNoTW9kZSwgc2V0U2VhcmNoTW9kZV0gPSB1c2VTdGF0ZTwnaWQnIHwgJ25hbWUnIHwgJ21hcCc+KCdpZCcpXHJcbiAgY29uc3QgW3JvdXRlU3VnZ2VzdGlvbnMsIHNldFJvdXRlU3VnZ2VzdGlvbnNdID0gdXNlU3RhdGU8QXJyYXk8eyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9Pj4oW10pXHJcbiAgY29uc3QgW3Nob3dTdWdnZXN0aW9ucywgc2V0U2hvd1N1Z2dlc3Rpb25zXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtwaWNraW5nRnJvbU1hcCwgc2V0UGlja2luZ0Zyb21NYXBdID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW2RyYXdpbmcsIHNldERyYXdpbmddID0gdXNlU3RhdGUoZmFsc2UpXHJcbiAgY29uc3QgW21hcFJvdXRlcywgc2V0TWFwUm91dGVzXSA9IHVzZVN0YXRlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB8IG51bGw7IGZyb21NZWFzdXJlOiBudW1iZXI7IHRvTWVhc3VyZTogbnVtYmVyIH0+PihbXSlcclxuICBjb25zdCBbc2VsZWN0ZWRNYXBSb3V0ZUlkcywgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkc10gPSB1c2VTdGF0ZTxTZXQ8c3RyaW5nPj4obmV3IFNldCgpKVxyXG4gIGNvbnN0IFtyb3V0ZVBpY2tDYW5kaWRhdGVzLCBzZXRSb3V0ZVBpY2tDYW5kaWRhdGVzXSA9IHVzZVN0YXRlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB9PiB8IG51bGw+KG51bGwpXHJcbiAgY29uc3QgW3NlbGVjdGVkRm9sZGVySWQsIHNldFNlbGVjdGVkRm9sZGVySWRdID0gdXNlU3RhdGU8c3RyaW5nPignJylcclxuXHJcbiAgLy8gUHJlZGljdGlvbiBzdGF0ZVxyXG4gIGNvbnN0IFtydW5uaW5nLCBzZXRSdW5uaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtwcm9ncmVzcywgc2V0UHJvZ3Jlc3NdID0gdXNlU3RhdGUoJycpXHJcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtyZXN1bHQsIHNldFJlc3VsdF0gPSB1c2VTdGF0ZTx7IGxheWVyVXJsPzogc3RyaW5nOyBpdGVtVXJsPzogc3RyaW5nIH0gfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtzaG93RXhwbGFuYXRpb24sIHNldFNob3dFeHBsYW5hdGlvbl0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbZmFjdG9ycywgc2V0RmFjdG9yc10gPSB1c2VTdGF0ZTxhbnk+KG51bGwpXHJcbiAgY29uc3QgW21vZGVsSW5mbywgc2V0TW9kZWxJbmZvXSA9IHVzZVN0YXRlPGFueT4obnVsbClcclxuXHJcbiAgLy8gUmVmc1xyXG4gIGNvbnN0IGppbXVNYXBWaWV3UmVmID0gdXNlUmVmPEppbXVNYXBWaWV3IHwgbnVsbD4obnVsbClcclxuICBjb25zdCBscnNTZXJ2aWNlUmVmID0gdXNlUmVmPExyc1NlcnZpY2UgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHJvdXRlR2VvbWV0cmllc1JlZiA9IHVzZVJlZjxNYXA8c3RyaW5nLCB7IHZlcnRpY2VzOiBudW1iZXJbXVtdOyBtSWR4OiBudW1iZXIgfT4+KG5ldyBNYXAoKSlcclxuICBjb25zdCBwaWNrSGFuZGxlclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja0hvdmVySGFuZGxlclJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja1Rvb2x0aXBSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IHBpY2tTbmFwR3JhcGhpY1JlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3QgcGlja0hvdmVyVGltZW91dFJlZiA9IHVzZVJlZjxhbnk+KG51bGwpXHJcbiAgY29uc3Qgc2tldGNoVk1SZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IGdyYXBoaWNzTGF5ZXJSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG4gIGNvbnN0IHNlYXJjaFRpbWVvdXRSZWYgPSB1c2VSZWY8YW55PihudWxsKVxyXG5cclxuICAvLyBJbml0aWFsaXplIExyc1NlcnZpY2UgKEpTT05QLWJhc2VkLCBieXBhc3NlcyBDT1JTKVxyXG4gIHVzZUVmZmVjdCgoKSA9PiB7XHJcbiAgICBpZiAoY29uZmlnPy5scnNTZXJ2aWNlVXJsKSB7XHJcbiAgICAgIGxyc1NlcnZpY2VSZWYuY3VycmVudCA9IG5ldyBMcnNTZXJ2aWNlKGNvbmZpZy5scnNTZXJ2aWNlVXJsKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWc/Lmxyc1NlcnZpY2VVcmxdKVxyXG5cclxuICAvLyBLZWVwIHRva2VuIGZyZXNoXHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGNvbnN0IHNlc3Npb24gPSBTZXNzaW9uTWFuYWdlci5nZXRJbnN0YW5jZSgpLmdldE1haW5TZXNzaW9uKCkgYXMgYW55XHJcbiAgICBpZiAoc2Vzc2lvbj8udG9rZW4gJiYgbHJzU2VydmljZVJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGxyc1NlcnZpY2VSZWYuY3VycmVudC5zZXRUb2tlbihzZXNzaW9uLnRva2VuKVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIC8vIEhhbmRsZSBtYXAgdmlldyByZWFkeVxyXG4gIGNvbnN0IG9uQWN0aXZlVmlld0NoYW5nZSA9IHVzZUNhbGxiYWNrKChqbXY6IEppbXVNYXBWaWV3KSA9PiB7XHJcbiAgICBqaW11TWFwVmlld1JlZi5jdXJyZW50ID0gam12XHJcbiAgfSwgW10pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFJPVVRFIFNFTEVDVElPTiAoc2FtZSBhcyByb2FkLWxvZykgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgaGFuZGxlUm91dGVTZWFyY2ggPSB1c2VDYWxsYmFjaygodmFsdWU6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKHNlYXJjaE1vZGUgPT09ICdpZCcpIHtcclxuICAgICAgc2V0Um91dGVJZCh2YWx1ZSlcclxuICAgICAgc2V0Um91dGVOYW1lKCcnKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0Um91dGVOYW1lKHZhbHVlKVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChzZWFyY2hUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICBpZiAodmFsdWUubGVuZ3RoIDwgMiB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSB7XHJcbiAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMoW10pXHJcbiAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgc2VhcmNoVGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgICAgIGNvbnN0IG5hbWVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVOYW1lRmllbGQgfHwgJ3JvdXRlX25hbWUnXHJcbiAgICAgICAgY29uc3QgYmFzZU1hcFVybCA9IGNvbmZpZy5scnNTZXJ2aWNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICAgICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtjb25maWcubmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgICAgICBjb25zdCBzZWFyY2hGaWVsZCA9IHNlYXJjaE1vZGUgPT09ICduYW1lJyA/IG5hbWVGaWVsZCA6IHJvdXRlRmllbGRcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICB3aGVyZTogYFVQUEVSKCR7c2VhcmNoRmllbGR9KSBMSUtFIFVQUEVSKCclJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9JScpYCxcclxuICAgICAgICAgIG91dEZpZWxkczogYCR7cm91dGVGaWVsZH0sJHtuYW1lRmllbGR9YCxcclxuICAgICAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICcxMCcsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IChkYXRhLmZlYXR1cmVzIHx8IFtdKS5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgICAgIHJvdXRlSWQ6IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJyxcclxuICAgICAgICAgIHJvdXRlTmFtZTogZi5hdHRyaWJ1dGVzW25hbWVGaWVsZF0gfHwgbnVsbFxyXG4gICAgICAgIH0pKVxyXG4gICAgICAgIHNldFJvdXRlU3VnZ2VzdGlvbnMocmVzdWx0cylcclxuICAgICAgICBzZXRTaG93U3VnZ2VzdGlvbnMocmVzdWx0cy5sZW5ndGggPiAwKVxyXG4gICAgICB9IGNhdGNoIHtcclxuICAgICAgICBzZXRSb3V0ZVN1Z2dlc3Rpb25zKFtdKVxyXG4gICAgICAgIHNldFNob3dTdWdnZXN0aW9ucyhmYWxzZSlcclxuICAgICAgfVxyXG4gICAgfSwgMzAwKVxyXG4gIH0sIFtjb25maWcsIHNlYXJjaE1vZGVdKVxyXG5cclxuICBjb25zdCBzZWxlY3RSb3V0ZSA9IHVzZUNhbGxiYWNrKChyb3V0ZTogeyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9KSA9PiB7XHJcbiAgICBzZXRSb3V0ZUlkKHJvdXRlLnJvdXRlSWQpXHJcbiAgICBzZXRSb3V0ZU5hbWUocm91dGUucm91dGVOYW1lIHx8ICcnKVxyXG4gICAgc2V0U2hvd1N1Z2dlc3Rpb25zKGZhbHNlKVxyXG4gICAgZmV0Y2hSb3V0ZU1lYXN1cmVzKHJvdXRlLnJvdXRlSWQpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIEZldGNoIHJvdXRlIGdlb21ldHJ5ICsgbWVhc3VyZSByYW5nZVxyXG4gIGNvbnN0IGZldGNoUm91dGVNZWFzdXJlcyA9IHVzZUNhbGxiYWNrKGFzeW5jIChyaWQ6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCFscnNTZXJ2aWNlUmVmLmN1cnJlbnQgfHwgIXJpZCkgcmV0dXJuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICBjb25zdCB2aWV3V2tpZCA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQ/LnZpZXc/LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcbiAgICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7Y29uZmlnLm5ldHdvcmtMYXllcklkfS9xdWVyeWBcclxuXHJcbiAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICB3aGVyZTogYCR7cm91dGVGaWVsZH0gPSAnJHtyaWQucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgLFxyXG4gICAgICAgIG91dEZpZWxkczogcm91dGVGaWVsZCxcclxuICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgIHJldHVybk06ICd0cnVlJyxcclxuICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEnLFxyXG4gICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHVybCwgcGFyYW1zKVxyXG4gICAgICBpZiAoIWRhdGEuZmVhdHVyZXM/Lmxlbmd0aCkgcmV0dXJuXHJcblxyXG4gICAgICBjb25zdCBwYXRocyA9IGRhdGEuZmVhdHVyZXNbMF0uZ2VvbWV0cnk/LnBhdGhzIHx8IFtdXHJcbiAgICAgIGNvbnN0IGFsbFZlcnRzOiBudW1iZXJbXVtdID0gW11cclxuICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSBhbGxWZXJ0cy5wdXNoKC4uLnBhdGgpXHJcbiAgICAgIGNvbnN0IGhhc1ogPSBkYXRhLmZlYXR1cmVzWzBdLmdlb21ldHJ5Py5oYXNaXHJcbiAgICAgIGNvbnN0IG1JZHggPSBoYXNaID8gMyA6IDJcclxuICAgICAgYWxsVmVydHMuc29ydCgoYSwgYikgPT4gKGFbbUlkeF0gfHwgMCkgLSAoYlttSWR4XSB8fCAwKSlcclxuXHJcbiAgICAgIGlmIChhbGxWZXJ0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY29uc3QgbWluTSA9IGFsbFZlcnRzWzBdW21JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCBtYXhNID0gYWxsVmVydHNbYWxsVmVydHMubGVuZ3RoIC0gMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgIHNldEZyb21NZWFzdXJlKG1pbk0udG9GaXhlZCgzKSlcclxuICAgICAgICBzZXRUb01lYXN1cmUobWF4TS50b0ZpeGVkKDMpKVxyXG4gICAgICAgIHJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LnNldChyaWQsIHsgdmVydGljZXM6IGFsbFZlcnRzLCBtSWR4IH0pXHJcbiAgICAgIH1cclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcignW0NyYXNoUmlza10gZmV0Y2hSb3V0ZU1lYXN1cmVzIGZhaWxlZDonLCBlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWddKVxyXG5cclxuICAvLyBQaWNrIHJvdXRlIGZyb20gbWFwICh3aXRoIGhvdmVyIHRvb2x0aXAgKyBzbmFwIGdyYXBoaWMgbGlrZSByb2FkLWxvZylcclxuICBjb25zdCBzdGFydFBpY2tGcm9tTWFwID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKCFqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IHx8ICFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHJldHVyblxyXG4gICAgY29uc3QgdmlldyA9IGppbXVNYXBWaWV3UmVmLmN1cnJlbnQudmlldyBhcyBhbnlcclxuXHJcbiAgICBpZiAocGlja0hhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcbiAgICBpZiAocGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudC5yZW1vdmUoKTsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gbnVsbCB9XHJcblxyXG4gICAgc2V0UGlja2luZ0Zyb21NYXAodHJ1ZSlcclxuICAgIHZpZXcuY29udGFpbmVyLnN0eWxlLmN1cnNvciA9ICdjcm9zc2hhaXInXHJcblxyXG4gICAgY29uc3Qgcm91dGVGaWVsZCA9IGNvbmZpZy5uZXR3b3JrUm91dGVJZEZpZWxkIHx8ICdjdXN0b21yb3V0ZWZpZWxkJ1xyXG4gICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSBjb25maWcubHJzU2VydmljZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgcXVlcnlVcmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcbiAgICBjb25zdCBvdXRGaWVsZHMgPSBgJHtyb3V0ZUZpZWxkfSwke25hbWVGaWVsZH1gXHJcbiAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuXHJcbiAgICAvLyBDcmVhdGUgdG9vbHRpcFxyXG4gICAgaWYgKCFwaWNrVG9vbHRpcFJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGNvbnN0IHRpcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXHJcbiAgICAgIHRpcC5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlO3BvaW50ZXItZXZlbnRzOm5vbmU7YmFja2dyb3VuZDojMzMzO2NvbG9yOiNmZmY7cGFkZGluZzo0cHggOHB4O2JvcmRlci1yYWRpdXM6NHB4O2ZvbnQtc2l6ZToxMnB4O3doaXRlLXNwYWNlOm5vd3JhcDt6LWluZGV4Ojk5OTk5O2Rpc3BsYXk6bm9uZTtib3gtc2hhZG93OjAgMnB4IDZweCByZ2JhKDAsMCwwLDAuMyk7J1xyXG4gICAgICB2aWV3LmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aXApXHJcbiAgICAgIHBpY2tUb29sdGlwUmVmLmN1cnJlbnQgPSB0aXBcclxuICAgIH1cclxuICAgIGNvbnN0IHRvb2x0aXAgPSBwaWNrVG9vbHRpcFJlZi5jdXJyZW50IVxyXG4gICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcblxyXG4gICAgbGV0IGxhc3RRdWVyeUlkID0gMFxyXG4gICAgbGV0IGNhY2hlZFBhdGhzOiBudW1iZXJbXVtdW11bXSA9IFtdXHJcbiAgICBsZXQgY2FjaGVkTGFiZWxzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICBsZXQgbGFzdFF1ZXJ5UHQ6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwgPSBudWxsXHJcbiAgICBjb25zdCBSRVFVRVJZX0RJU1QgPSA4MFxyXG5cclxuICAgIC8vIExvYWQgQXJjR0lTIG1vZHVsZXMgZm9yIHNuYXAgZ3JhcGhpY1xyXG4gICAgY29uc3QgbW9kdWxlc1Byb21pc2UgPSBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9HcmFwaGljJywgJ2Vzcmkvc3ltYm9scy9TaW1wbGVNYXJrZXJTeW1ib2wnLCAnZXNyaS9nZW9tZXRyeS9Qb2ludCddLCAoLi4ubTogYW55W10pID0+IHJlc29sdmUobSkpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIEhlbHBlcjogc25hcCB0byBuZWFyZXN0IHBvaW50IG9uIGNhY2hlZCBwYXRoc1xyXG4gICAgZnVuY3Rpb24gc25hcFRvTmVhcmVzdCAocHg6IG51bWJlciwgcHk6IG51bWJlcik6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfSB8IG51bGwge1xyXG4gICAgICBsZXQgYmVzdERpc3QgPSBJbmZpbml0eSwgYmVzdFggPSBweCwgYmVzdFkgPSBweVxyXG4gICAgICBmb3IgKGNvbnN0IHBhdGhzIG9mIGNhY2hlZFBhdGhzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBwYXRoIG9mIHBhdGhzKSB7XHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IFtheCwgYXldID0gcGF0aFtpXVxyXG4gICAgICAgICAgICBjb25zdCBbYngsIGJ5XSA9IHBhdGhbaSArIDFdXHJcbiAgICAgICAgICAgIGNvbnN0IGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5XHJcbiAgICAgICAgICAgIGNvbnN0IGxlblNxID0gZHggKiBkeCArIGR5ICogZHlcclxuICAgICAgICAgICAgaWYgKGxlblNxID09PSAwKSBjb250aW51ZVxyXG4gICAgICAgICAgICBsZXQgdCA9ICgocHggLSBheCkgKiBkeCArIChweSAtIGF5KSAqIGR5KSAvIGxlblNxXHJcbiAgICAgICAgICAgIHQgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCB0KSlcclxuICAgICAgICAgICAgY29uc3QgY3ggPSBheCArIHQgKiBkeCwgY3kgPSBheSArIHQgKiBkeVxyXG4gICAgICAgICAgICBjb25zdCBkID0gKHB4IC0gY3gpICogKHB4IC0gY3gpICsgKHB5IC0gY3kpICogKHB5IC0gY3kpXHJcbiAgICAgICAgICAgIGlmIChkIDwgYmVzdERpc3QpIHsgYmVzdERpc3QgPSBkOyBiZXN0WCA9IGN4OyBiZXN0WSA9IGN5IH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGJlc3REaXN0IDwgSW5maW5pdHkgPyB7IHg6IGJlc3RYLCB5OiBiZXN0WSB9IDogbnVsbFxyXG4gICAgfVxyXG5cclxuICAgIC8vIEhvdmVyOiBzaG93IHJvdXRlIG5hbWUgdG9vbHRpcCArIHNuYXAgZ3JhcGhpY1xyXG4gICAgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50ID0gdmlldy5vbigncG9pbnRlci1tb3ZlJywgYXN5bmMgKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgdG9vbHRpcC5zdHlsZS5sZWZ0ID0gYCR7ZXZlbnQueCArIDE0fXB4YFxyXG4gICAgICB0b29sdGlwLnN0eWxlLnRvcCA9IGAke2V2ZW50LnkgLSA0MH1weGBcclxuXHJcbiAgICAgIGNvbnN0IG1hcFBvaW50ID0gdmlldy50b01hcCh7IHg6IGV2ZW50LngsIHk6IGV2ZW50LnkgfSlcclxuICAgICAgaWYgKCFtYXBQb2ludCkgcmV0dXJuXHJcblxyXG4gICAgICAvLyBTbmFwIHVzaW5nIGNhY2hlZCBnZW9tZXRyeVxyXG4gICAgICBpZiAoY2FjaGVkUGF0aHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHNuYXAgPSBzbmFwVG9OZWFyZXN0KG1hcFBvaW50LngsIG1hcFBvaW50LnkpXHJcbiAgICAgICAgaWYgKHNuYXApIHtcclxuICAgICAgICAgIGNvbnN0IFtHcmFwaGljLCBTaW1wbGVNYXJrZXJTeW1ib2wsIFBvaW50XSA9IGF3YWl0IG1vZHVsZXNQcm9taXNlXHJcbiAgICAgICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHtcclxuICAgICAgICAgICAgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQuZ2VvbWV0cnkgPSBuZXcgUG9pbnQoeyB4OiBzbmFwLngsIHk6IHNuYXAueSwgc3BhdGlhbFJlZmVyZW5jZTogdmlldy5zcGF0aWFsUmVmZXJlbmNlIH0pXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCBzbmFwR3JhcGhpYyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICAgICAgICBnZW9tZXRyeTogbmV3IFBvaW50KHsgeDogc25hcC54LCB5OiBzbmFwLnksIHNwYXRpYWxSZWZlcmVuY2U6IHZpZXcuc3BhdGlhbFJlZmVyZW5jZSB9KSxcclxuICAgICAgICAgICAgICBzeW1ib2w6IG5ldyBTaW1wbGVNYXJrZXJTeW1ib2woeyBjb2xvcjogWzAsIDEyMiwgMjU1LCAyNTVdLCBzaXplOiAxMCwgb3V0bGluZTogeyBjb2xvcjogWzI1NSwgMjU1LCAyNTVdLCB3aWR0aDogMiB9IH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50ID0gc25hcEdyYXBoaWNcclxuICAgICAgICAgICAgdmlldy5ncmFwaGljcy5hZGQoc25hcEdyYXBoaWMpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBpZiBjdXJzb3IgbW92ZWQgZmFyIGVub3VnaCB0byByZS1xdWVyeVxyXG4gICAgICBpZiAobGFzdFF1ZXJ5UHQpIHtcclxuICAgICAgICBjb25zdCBkeCA9IG1hcFBvaW50LnggLSBsYXN0UXVlcnlQdC54XHJcbiAgICAgICAgY29uc3QgZHkgPSBtYXBQb2ludC55IC0gbGFzdFF1ZXJ5UHQueVxyXG4gICAgICAgIGlmIChNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpIDwgUkVRVUVSWV9ESVNUKSByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudCkgY2xlYXJUaW1lb3V0KHBpY2tIb3ZlclRpbWVvdXRSZWYuY3VycmVudClcclxuICAgICAgcGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50ID0gc2V0VGltZW91dChhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgcXVlcnlJZCA9ICsrbGFzdFF1ZXJ5SWRcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgICBnZW9tZXRyeTogSlNPTi5zdHJpbmdpZnkobWFwUG9pbnQudG9KU09OKCkpLFxyXG4gICAgICAgICAgICBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2ludCcsXHJcbiAgICAgICAgICAgIHNwYXRpYWxSZWw6ICdlc3JpU3BhdGlhbFJlbEludGVyc2VjdHMnLFxyXG4gICAgICAgICAgICBkaXN0YW5jZTogJzUwJyxcclxuICAgICAgICAgICAgdW5pdHM6ICdlc3JpU1JVbml0X01ldGVyJyxcclxuICAgICAgICAgICAgb3V0RmllbGRzLFxyXG4gICAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgICAgICBvdXRTUjogU3RyaW5nKHZpZXdXa2lkKSxcclxuICAgICAgICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6ICc1JyxcclxuICAgICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHF1ZXJ5VXJsLCBwYXJhbXMpXHJcbiAgICAgICAgICBpZiAocXVlcnlJZCAhPT0gbGFzdFF1ZXJ5SWQpIHJldHVyblxyXG4gICAgICAgICAgbGFzdFF1ZXJ5UHQgPSB7IHg6IG1hcFBvaW50LngsIHk6IG1hcFBvaW50LnkgfVxyXG5cclxuICAgICAgICAgIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGNhY2hlZFBhdGhzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4gZi5nZW9tZXRyeT8ucGF0aHMgfHwgW10pXHJcbiAgICAgICAgICAgIGNhY2hlZExhYmVscyA9IGpzb24uZmVhdHVyZXMubWFwKChmOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICBjb25zdCByaWQgPSBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF0gfHwgJydcclxuICAgICAgICAgICAgICBjb25zdCBybmFtZSA9IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJuYW1lID8gYCR7cm5hbWV9ICgke3JpZH0pYCA6IHJpZFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0b29sdGlwLnRleHRDb250ZW50ID0gY2FjaGVkTGFiZWxzLmpvaW4oJ1xcbicpXHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUud2hpdGVTcGFjZSA9IGNhY2hlZExhYmVscy5sZW5ndGggPiAxID8gJ3ByZS1saW5lJyA6ICdub3dyYXAnXHJcbiAgICAgICAgICAgIHRvb2x0aXAuc3R5bGUuZGlzcGxheSA9ICdibG9jaydcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSBzbmFwIHdpdGggZnJlc2ggZ2VvbWV0cnlcclxuICAgICAgICAgICAgY29uc3Qgc25hcCA9IHNuYXBUb05lYXJlc3QobWFwUG9pbnQueCwgbWFwUG9pbnQueSlcclxuICAgICAgICAgICAgaWYgKHNuYXApIHtcclxuICAgICAgICAgICAgICBjb25zdCBbR3JhcGhpYywgU2ltcGxlTWFya2VyU3ltYm9sLCBQb2ludF0gPSBhd2FpdCBtb2R1bGVzUHJvbWlzZVxyXG4gICAgICAgICAgICAgIGlmIChxdWVyeUlkICE9PSBsYXN0UXVlcnlJZCkgcmV0dXJuXHJcbiAgICAgICAgICAgICAgaWYgKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7XHJcbiAgICAgICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudC5nZW9tZXRyeSA9IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSlcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IG5ldyBHcmFwaGljKHtcclxuICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IG5ldyBQb2ludCh7IHg6IHNuYXAueCwgeTogc25hcC55LCBzcGF0aWFsUmVmZXJlbmNlOiB2aWV3LnNwYXRpYWxSZWZlcmVuY2UgfSksXHJcbiAgICAgICAgICAgICAgICAgIHN5bWJvbDogbmV3IFNpbXBsZU1hcmtlclN5bWJvbCh7IGNvbG9yOiBbMCwgMTIyLCAyNTUsIDI1NV0sIHNpemU6IDEwLCBvdXRsaW5lOiB7IGNvbG9yOiBbMjU1LCAyNTUsIDI1NV0sIHdpZHRoOiAyIH0gfSlcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IGdcclxuICAgICAgICAgICAgICAgIHZpZXcuZ3JhcGhpY3MuYWRkKGcpXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgICAgICAgY2FjaGVkUGF0aHMgPSBbXVxyXG4gICAgICAgICAgICBjYWNoZWRMYWJlbHMgPSBbXVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICAgICAgfVxyXG4gICAgICB9LCAxMDApXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIENsaWNrOiBzZWxlY3Qgcm91dGVcclxuICAgIHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSB2aWV3Lm9uKCdjbGljaycsIGFzeW5jIChldmVudDogYW55KSA9PiB7XHJcbiAgICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgICAgaWYgKHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCkgeyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIb3ZlckhhbmRsZXJSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgICBpZiAocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KSBjbGVhclRpbWVvdXQocGlja0hvdmVyVGltZW91dFJlZi5jdXJyZW50KVxyXG4gICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcclxuICAgICAgdmlldy5jb250YWluZXIuc3R5bGUuY3Vyc29yID0gJydcclxuICAgICAgc2V0UGlja2luZ0Zyb21NYXAoZmFsc2UpXHJcbiAgICAgIC8vIFJlbW92ZSBzbmFwIGdyYXBoaWNcclxuICAgICAgaWYgKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KSB7IHZpZXcuZ3JhcGhpY3MucmVtb3ZlKHBpY2tTbmFwR3JhcGhpY1JlZi5jdXJyZW50KTsgcGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICAgICAgZ2VvbWV0cnk6IEpTT04uc3RyaW5naWZ5KGV2ZW50Lm1hcFBvaW50LnRvSlNPTigpKSxcclxuICAgICAgICAgIGdlb21ldHJ5VHlwZTogJ2VzcmlHZW9tZXRyeVBvaW50JyxcclxuICAgICAgICAgIHNwYXRpYWxSZWw6ICdlc3JpU3BhdGlhbFJlbEludGVyc2VjdHMnLFxyXG4gICAgICAgICAgZGlzdGFuY2U6ICc1MCcsXHJcbiAgICAgICAgICB1bml0czogJ2VzcmlTUlVuaXRfTWV0ZXInLFxyXG4gICAgICAgICAgb3V0RmllbGRzLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzEwJyxcclxuICAgICAgICAgIGY6ICdqc29uJ1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBqc29uID0gYXdhaXQgbHJzU2VydmljZVJlZi5jdXJyZW50IS5xdWVyeUZlYXR1cmVzRGlyZWN0KHF1ZXJ5VXJsLCBwYXJhbXMpXHJcblxyXG4gICAgICAgIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPiAxKSB7XHJcbiAgICAgICAgICBjb25zdCBjYW5kaWRhdGVzID0ganNvbi5mZWF0dXJlcy5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlRmllbGRdIHx8ICcnLFxyXG4gICAgICAgICAgICByb3V0ZU5hbWU6IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8IGYuYXR0cmlidXRlc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgfSkpXHJcbiAgICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcclxuICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IGNhbmRpZGF0ZXMuZmlsdGVyKChjOiBhbnkpID0+IHsgaWYgKHNlZW4uaGFzKGMucm91dGVJZCkpIHJldHVybiBmYWxzZTsgc2Vlbi5hZGQoYy5yb3V0ZUlkKTsgcmV0dXJuIHRydWUgfSlcclxuICAgICAgICAgIGlmICh1bmlxdWUubGVuZ3RoID4gMSkge1xyXG4gICAgICAgICAgICBzZXRSb3V0ZVBpY2tDYW5kaWRhdGVzKHVuaXF1ZSlcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNldFJvdXRlSWQodW5pcXVlWzBdLnJvdXRlSWQpXHJcbiAgICAgICAgICAgIHNldFJvdXRlTmFtZSh1bmlxdWVbMF0ucm91dGVOYW1lKVxyXG4gICAgICAgICAgICBmZXRjaFJvdXRlTWVhc3VyZXModW5pcXVlWzBdLnJvdXRlSWQpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChqc29uLmZlYXR1cmVzPy5sZW5ndGggPT09IDEpIHtcclxuICAgICAgICAgIGNvbnN0IGF0dHJzID0ganNvbi5mZWF0dXJlc1swXS5hdHRyaWJ1dGVzXHJcbiAgICAgICAgICBjb25zdCByaWQgPSBhdHRyc1tyb3V0ZUZpZWxkXSB8fCAnJ1xyXG4gICAgICAgICAgY29uc3Qgcm5hbWUgPSBhdHRyc1tuYW1lRmllbGRdIHx8ICcnXHJcbiAgICAgICAgICBzZXRSb3V0ZUlkKHJpZClcclxuICAgICAgICAgIHNldFJvdXRlTmFtZShybmFtZSB8fCByaWQpXHJcbiAgICAgICAgICBmZXRjaFJvdXRlTWVhc3VyZXMocmlkKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZXRFcnJvcignTm8gcm91dGUgZm91bmQgYXQgdGhhdCBsb2NhdGlvbicpXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICAgIHNldEVycm9yKCdGYWlsZWQgdG8gaWRlbnRpZnkgcm91dGU6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9LCBbY29uZmlnLCBmZXRjaFJvdXRlTWVhc3VyZXNdKVxyXG5cclxuICBjb25zdCBjYW5jZWxQaWNrRnJvbU1hcCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGlmIChwaWNrSGFuZGxlclJlZi5jdXJyZW50KSB7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQucmVtb3ZlKCk7IHBpY2tIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQpIHsgcGlja0hvdmVySGFuZGxlclJlZi5jdXJyZW50LnJlbW92ZSgpOyBwaWNrSG92ZXJIYW5kbGVyUmVmLmN1cnJlbnQgPSBudWxsIH1cclxuICAgIGlmIChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpIGNsZWFyVGltZW91dChwaWNrSG92ZXJUaW1lb3V0UmVmLmN1cnJlbnQpXHJcbiAgICBpZiAocGlja1Rvb2x0aXBSZWYuY3VycmVudCkgcGlja1Rvb2x0aXBSZWYuY3VycmVudC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnXHJcbiAgICBpZiAoamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldykge1xyXG4gICAgICBjb25zdCB2ID0gamltdU1hcFZpZXdSZWYuY3VycmVudC52aWV3IGFzIGFueVxyXG4gICAgICB2LmNvbnRhaW5lci5zdHlsZS5jdXJzb3IgPSAnJ1xyXG4gICAgICBpZiAocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpIHsgdi5ncmFwaGljcy5yZW1vdmUocGlja1NuYXBHcmFwaGljUmVmLmN1cnJlbnQpOyBwaWNrU25hcEdyYXBoaWNSZWYuY3VycmVudCA9IG51bGwgfVxyXG4gICAgfVxyXG4gICAgc2V0UGlja2luZ0Zyb21NYXAoZmFsc2UpXHJcbiAgfSwgW10pXHJcblxyXG4gIC8vIERyYXcgcG9seWdvbiB0byBzZWxlY3QgbXVsdGlwbGUgcm91dGVzXHJcbiAgY29uc3Qgc3RhcnREcmF3QXJlYSA9IHVzZUNhbGxiYWNrKGFzeW5jICgpID0+IHtcclxuICAgIGlmICghamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyB8fCAhbHJzU2VydmljZVJlZi5jdXJyZW50KSByZXR1cm5cclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50LnZpZXcgYXMgYW55XHJcblxyXG4gICAgc2V0RHJhd2luZyh0cnVlKVxyXG4gICAgc2V0TWFwUm91dGVzKFtdKVxyXG4gICAgc2V0U2VsZWN0ZWRNYXBSb3V0ZUlkcyhuZXcgU2V0KCkpXHJcblxyXG4gICAgY29uc3QgW0dyYXBoaWNzTGF5ZXIsIFNrZXRjaFZpZXdNb2RlbF0gPSBhd2FpdCBuZXcgUHJvbWlzZTxhbnlbXT4ocmVzb2x2ZSA9PiB7XHJcbiAgICAgICh3aW5kb3cgYXMgYW55KS5yZXF1aXJlKFsnZXNyaS9sYXllcnMvR3JhcGhpY3NMYXllcicsICdlc3JpL3dpZGdldHMvU2tldGNoL1NrZXRjaFZpZXdNb2RlbCddLCAoLi4ubTogYW55W10pID0+IHJlc29sdmUobSkpXHJcbiAgICB9KVxyXG5cclxuICAgIGlmICghZ3JhcGhpY3NMYXllclJlZi5jdXJyZW50KSB7XHJcbiAgICAgIGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudCA9IG5ldyBHcmFwaGljc0xheWVyKHsgdGl0bGU6ICdDcmFzaFJpc2sgRHJhdycgfSlcclxuICAgICAgdmlldy5tYXAuYWRkKGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudClcclxuICAgIH1cclxuICAgIGdyYXBoaWNzTGF5ZXJSZWYuY3VycmVudC5yZW1vdmVBbGwoKVxyXG5cclxuICAgIGlmICghc2tldGNoVk1SZWYuY3VycmVudCkge1xyXG4gICAgICBza2V0Y2hWTVJlZi5jdXJyZW50ID0gbmV3IFNrZXRjaFZpZXdNb2RlbCh7IHZpZXcsIGxheWVyOiBncmFwaGljc0xheWVyUmVmLmN1cnJlbnQgfSlcclxuICAgIH1cclxuXHJcbiAgICBza2V0Y2hWTVJlZi5jdXJyZW50LmNyZWF0ZSgncG9seWdvbicpXHJcbiAgICBza2V0Y2hWTVJlZi5jdXJyZW50Lm9uKCdjcmVhdGUnLCBhc3luYyAoZXZ0OiBhbnkpID0+IHtcclxuICAgICAgaWYgKGV2dC5zdGF0ZSAhPT0gJ2NvbXBsZXRlJykgcmV0dXJuXHJcbiAgICAgIHNldERyYXdpbmcoZmFsc2UpXHJcblxyXG4gICAgICBjb25zdCBwb2x5Z29uID0gZXZ0LmdyYXBoaWMuZ2VvbWV0cnlcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCByb3V0ZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZUlkRmllbGQgfHwgJ2N1c3RvbXJvdXRlZmllbGQnXHJcbiAgICAgICAgY29uc3QgbmFtZUZpZWxkID0gY29uZmlnLm5ldHdvcmtSb3V0ZU5hbWVGaWVsZCB8fCAncm91dGVfbmFtZSdcclxuICAgICAgICBjb25zdCBiYXNlTWFwVXJsID0gY29uZmlnLmxyc1NlcnZpY2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgICAgICBjb25zdCB2aWV3V2tpZCA9IHZpZXcuc3BhdGlhbFJlZmVyZW5jZT8ud2tpZCB8fCAxMDIxMDBcclxuICAgICAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2NvbmZpZy5uZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgICAgIC8vIFVzZSBlbnZlbG9wZSBnZW9tZXRyeSBmb3IgSlNPTlAgKHBvbHlnb24gSlNPTiBpcyB0b28gbGFyZ2UgZm9yIEdFVClcclxuICAgICAgICBjb25zdCBleHQgPSBwb2x5Z29uLmV4dGVudFxyXG4gICAgICAgIGNvbnN0IGVudmVsb3BlSnNvbiA9IHsgeG1pbjogZXh0LnhtaW4sIHltaW46IGV4dC55bWluLCB4bWF4OiBleHQueG1heCwgeW1heDogZXh0LnltYXgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZDogdmlld1draWQgfSB9XHJcblxyXG4gICAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgICAgIGdlb21ldHJ5OiBKU09OLnN0cmluZ2lmeShlbnZlbG9wZUpzb24pLFxyXG4gICAgICAgICAgZ2VvbWV0cnlUeXBlOiAnZXNyaUdlb21ldHJ5RW52ZWxvcGUnLFxyXG4gICAgICAgICAgc3BhdGlhbFJlbDogJ2VzcmlTcGF0aWFsUmVsSW50ZXJzZWN0cycsXHJcbiAgICAgICAgICBvdXRGaWVsZHM6IGAke3JvdXRlRmllbGR9LCR7bmFtZUZpZWxkfWAsXHJcbiAgICAgICAgICByZXR1cm5HZW9tZXRyeTogJ3RydWUnLFxyXG4gICAgICAgICAgcmV0dXJuTTogJ3RydWUnLFxyXG4gICAgICAgICAgb3V0U1I6IFN0cmluZyh2aWV3V2tpZCksXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzIwMCcsXHJcbiAgICAgICAgICBmOiAnanNvbidcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QodXJsLCBwYXJhbXMpXHJcbiAgICAgICAgY29uc3Qgcm91dGVzID0gKGRhdGEuZmVhdHVyZXMgfHwgW10pLm1hcCgoZjogYW55KSA9PiB7XHJcbiAgICAgICAgICBjb25zdCByaWQgPSBmLmF0dHJpYnV0ZXNbcm91dGVGaWVsZF1cclxuICAgICAgICAgIGNvbnN0IHBhdGhzID0gZi5nZW9tZXRyeT8ucGF0aHMgfHwgW11cclxuICAgICAgICAgIGNvbnN0IGFsbFZlcnRzOiBudW1iZXJbXVtdID0gcGF0aHMuZmxhdCgpXHJcbiAgICAgICAgICBjb25zdCBoYXNaID0gZi5nZW9tZXRyeT8uaGFzWlxyXG4gICAgICAgICAgY29uc3QgbUlkeCA9IGhhc1ogPyAzIDogMlxyXG4gICAgICAgICAgbGV0IG1pbk0gPSAwLCBtYXhNID0gMFxyXG4gICAgICAgICAgaWYgKGFsbFZlcnRzLmxlbmd0aCA+IDAgJiYgbUlkeCA8IGFsbFZlcnRzWzBdLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBjb25zdCBtZWFzdXJlcyA9IGFsbFZlcnRzLm1hcCh2ID0+IHZbbUlkeF0pLmZpbHRlcihtID0+IG0gIT0gbnVsbCAmJiAhaXNOYU4obSkpXHJcbiAgICAgICAgICAgIGlmIChtZWFzdXJlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgbWluTSA9IE1hdGgubWluKC4uLm1lYXN1cmVzKVxyXG4gICAgICAgICAgICAgIG1heE0gPSBNYXRoLm1heCguLi5tZWFzdXJlcylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudC5zZXQocmlkLCB7IHZlcnRpY2VzOiBhbGxWZXJ0cywgbUlkeCB9KVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHsgcm91dGVJZDogcmlkLCByb3V0ZU5hbWU6IGYuYXR0cmlidXRlc1tuYW1lRmllbGRdIHx8IG51bGwsIGZyb21NZWFzdXJlOiBtaW5NLCB0b01lYXN1cmU6IG1heE0gfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgc2V0TWFwUm91dGVzKHJvdXRlcylcclxuICAgICAgICBzZXRTZWxlY3RlZE1hcFJvdXRlSWRzKG5ldyBTZXQocm91dGVzLm1hcCgocjogYW55KSA9PiByLnJvdXRlSWQpKSlcclxuICAgICAgICBzZXRTZWFyY2hNb2RlKCdtYXAnKVxyXG4gICAgICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgICAgICBzZXRFcnJvcignQXJlYSBxdWVyeSBmYWlsZWQ6ICcgKyAoZS5tZXNzYWdlIHx8IGUpKVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH0sIFtjb25maWddKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBRVUVSWSBFVkVOVCBEQVRBIChpbnRlcm5hbCwgdHJpZ2dlcmVkIGJ5IFJ1bikgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgcXVlcnlFdmVudERhdGEgPSB1c2VDYWxsYmFjayhhc3luYyAoKTogUHJvbWlzZTxhbnlbXT4gPT4ge1xyXG4gICAgaWYgKCFscnNTZXJ2aWNlUmVmLmN1cnJlbnQpIHRocm93IG5ldyBFcnJvcignTm8gTFJTIHNlcnZpY2UgY29uZmlndXJlZCcpXHJcblxyXG4gICAgY29uc3QgZXZlbnRDb25maWdzID0gY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIHx8IFtdXHJcblxyXG4gICAgbGV0IHJvdXRlSWRzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICBpZiAoc2VhcmNoTW9kZSA9PT0gJ21hcCcpIHtcclxuICAgICAgcm91dGVJZHMgPSBBcnJheS5mcm9tKHNlbGVjdGVkTWFwUm91dGVJZHMpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoIXJvdXRlSWQudHJpbSgpKSB0aHJvdyBuZXcgRXJyb3IoJ0VudGVyIGEgUm91dGUgSUQgb3Igc2VsZWN0IGZyb20gbWFwLicpXHJcbiAgICAgIHJvdXRlSWRzID0gW3JvdXRlSWQudHJpbSgpXVxyXG4gICAgfVxyXG4gICAgaWYgKHJvdXRlSWRzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCdObyByb3V0ZXMgc2VsZWN0ZWQuJylcclxuXHJcbiAgICBjb25zdCBhbGxFbnRyaWVzOiBhbnlbXSA9IFtdXHJcbiAgICBmb3IgKGNvbnN0IGNmZyBvZiBldmVudENvbmZpZ3MpIHtcclxuICAgICAgY29uc3QgbGF5ZXJVcmwgPSBgJHtjb25maWcubHJzU2VydmljZVVybH0vZXZlbnRMYXllcnMvJHtjZmcubGF5ZXJJZH0vcXVlcnlgXHJcbiAgICAgIGZvciAoY29uc3QgcmlkIG9mIHJvdXRlSWRzKSB7XHJcbiAgICAgICAgY29uc3Qgd2hlcmUgPSBgJHtjZmcucm91dGVJZEZpZWxkfSA9ICcke3JpZC5yZXBsYWNlKC8nL2csIFwiJydcIil9J2BcclxuICAgICAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgICAgICB3aGVyZSxcclxuICAgICAgICAgIG91dEZpZWxkczogJyonLFxyXG4gICAgICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgICAgICByZXN1bHRSZWNvcmRDb3VudDogJzUwMDAnLFxyXG4gICAgICAgICAgZjogJ2pzb24nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBscnNTZXJ2aWNlUmVmLmN1cnJlbnQhLnF1ZXJ5RmVhdHVyZXNEaXJlY3QobGF5ZXJVcmwsIHBhcmFtcylcclxuICAgICAgICBmb3IgKGNvbnN0IGYgb2YgKGRhdGEuZmVhdHVyZXMgfHwgW10pKSB7XHJcbiAgICAgICAgICBjb25zdCBtZWFzdXJlRmllbGQgPSBjZmcubWVhc3VyZUZpZWxkIHx8IGNmZy5mcm9tTWVhc3VyZUZpZWxkIHx8ICdNZWFzdXJlJ1xyXG4gICAgICAgICAgYWxsRW50cmllcy5wdXNoKHtcclxuICAgICAgICAgICAgRmVhdHVyZTogY2ZnLm5hbWUsXHJcbiAgICAgICAgICAgIFJvdXRlSUQ6IGYuYXR0cmlidXRlc1tjZmcucm91dGVJZEZpZWxkXSxcclxuICAgICAgICAgICAgTWVhc3VyZTogZi5hdHRyaWJ1dGVzW21lYXN1cmVGaWVsZF0gPz8gZi5hdHRyaWJ1dGVzW2NmZy5mcm9tTWVhc3VyZUZpZWxkXSxcclxuICAgICAgICAgICAgLi4uT2JqZWN0LmZyb21FbnRyaWVzKChjZmcuYXR0cmlidXRlcyB8fCBbXSkubWFwKGEgPT4gW2EsIGYuYXR0cmlidXRlc1thXV0pKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBFbnN1cmUgcm91dGUgZ2VvbWV0cmllcyBhcmUgY2FjaGVkXHJcbiAgICBmb3IgKGNvbnN0IHJpZCBvZiByb3V0ZUlkcykge1xyXG4gICAgICBpZiAoIXJvdXRlR2VvbWV0cmllc1JlZi5jdXJyZW50LmhhcyhyaWQpKSB7XHJcbiAgICAgICAgYXdhaXQgZmV0Y2hSb3V0ZU1lYXN1cmVzKHJpZClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBhbGxFbnRyaWVzXHJcbiAgfSwgW2NvbmZpZywgcm91dGVJZCwgc2VhcmNoTW9kZSwgc2VsZWN0ZWRNYXBSb3V0ZUlkcywgZmV0Y2hSb3V0ZU1lYXN1cmVzXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gRElTUExBWSBPTiBNQVAgPT09PT09PT09PT09PT09PT09PT1cclxuXHJcbiAgY29uc3QgZGlzcGxheVByZWRpY3Rpb25Pbk1hcCA9IHVzZUNhbGxiYWNrKGFzeW5jIChsYXllclVybDogc3RyaW5nLCB0b2tlbjogc3RyaW5nLCB3a2lkOiBudW1iZXIpID0+IHtcclxuICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IGFzIGFueVxyXG4gICAgaWYgKCF2aWV3KSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBbRmVhdHVyZUxheWVyXSA9IGF3YWl0IG5ldyBQcm9taXNlPGFueVtdPihyZXNvbHZlID0+IHtcclxuICAgICAgKHdpbmRvdyBhcyBhbnkpLnJlcXVpcmUoWydlc3JpL2xheWVycy9GZWF0dXJlTGF5ZXInXSwgKC4uLm1vZHM6IGFueVtdKSA9PiByZXNvbHZlKG1vZHMpKVxyXG4gICAgfSlcclxuXHJcbiAgICBjb25zdCBleGlzdGluZ0xheWVyID0gdmlldy5tYXAuYWxsTGF5ZXJzLmZpbmQoKGw6IGFueSkgPT4gbC50aXRsZSA9PT0gJ0NyYXNoIFJpc2sgUHJlZGljdGlvbicpXHJcbiAgICBpZiAoZXhpc3RpbmdMYXllcikgdmlldy5tYXAucmVtb3ZlKGV4aXN0aW5nTGF5ZXIpXHJcblxyXG4gICAgY29uc3QgcHJlZGljdGlvbkxheWVyID0gbmV3IEZlYXR1cmVMYXllcih7XHJcbiAgICAgIHVybDogbGF5ZXJVcmwsXHJcbiAgICAgIHRpdGxlOiAnQ3Jhc2ggUmlzayBQcmVkaWN0aW9uJyxcclxuICAgICAgY3VzdG9tUGFyYW1ldGVyczogeyB0b2tlbiB9LFxyXG4gICAgICBkZWZpbml0aW9uRXhwcmVzc2lvbjogJ3Jpc2tfc2NvcmUgPiAwJyxcclxuICAgICAgcmVuZGVyZXI6IHtcclxuICAgICAgICB0eXBlOiAnY2xhc3MtYnJlYWtzJyxcclxuICAgICAgICBmaWVsZDogJ3Jpc2tfc2NvcmUnLFxyXG4gICAgICAgIGNsYXNzQnJlYWtJbmZvczogW1xyXG4gICAgICAgICAgeyBtaW5WYWx1ZTogMSwgbWF4VmFsdWU6IDI1LCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFs1NiwgMTY4LCAwLCAyMDBdLCB3aWR0aDogMyB9LCBsYWJlbDogJ0xvdyBSaXNrICgxLTI1KScgfSxcclxuICAgICAgICAgIHsgbWluVmFsdWU6IDI2LCBtYXhWYWx1ZTogNTAsIHN5bWJvbDogeyB0eXBlOiAnc2ltcGxlLWxpbmUnLCBjb2xvcjogWzI1NSwgMjU1LCAwLCAyMjBdLCB3aWR0aDogNCB9LCBsYWJlbDogJ01lZGl1bSBSaXNrICgyNi01MCknIH0sXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiA1MSwgbWF4VmFsdWU6IDc1LCBzeW1ib2w6IHsgdHlwZTogJ3NpbXBsZS1saW5lJywgY29sb3I6IFsyNTUsIDEyOCwgMCwgMjMwXSwgd2lkdGg6IDUgfSwgbGFiZWw6ICdNZWRpdW0tSGlnaCBSaXNrICg1MS03NSknIH0sXHJcbiAgICAgICAgICB7IG1pblZhbHVlOiA3NiwgbWF4VmFsdWU6IDEwMCwgc3ltYm9sOiB7IHR5cGU6ICdzaW1wbGUtbGluZScsIGNvbG9yOiBbMjU1LCAwLCAwLCAyNTVdLCB3aWR0aDogNiB9LCBsYWJlbDogJ0hpZ2ggUmlzayAoNzYtMTAwKScgfVxyXG4gICAgICAgIF1cclxuICAgICAgfSxcclxuICAgICAgcG9wdXBUZW1wbGF0ZToge1xyXG4gICAgICAgIHRpdGxlOiAnQ3Jhc2ggUmlzazoge3Jpc2tfbGV2ZWx9JyxcclxuICAgICAgICBjb250ZW50OiBgPGRpdiBzdHlsZT1cImZvbnQtc2l6ZToxM3B4XCI+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPVwibWFyZ2luLWJvdHRvbTo4cHg7cGFkZGluZy1ib3R0b206OHB4O2JvcmRlci1ib3R0b206MXB4IHNvbGlkICNlMGUwZTBcIj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJmb250LXNpemU6MjRweDtmb250LXdlaWdodDo3MDA7Y29sb3I6e2V4cHJlc3Npb24vcmlza0NvbG9yfVwiPntyaXNrX3Njb3JlfTwvc3Bhbj5cclxuICAgICAgICAgICAgPHNwYW4gc3R5bGU9XCJjb2xvcjojNjY2O2ZvbnQtc2l6ZToxMnB4XCI+LzEwMCByaXNrIHNjb3JlPC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8dGFibGUgc3R5bGU9XCJib3JkZXItY29sbGFwc2U6Y29sbGFwc2U7d2lkdGg6MTAwJVwiPlxyXG4gICAgICAgICAgICA8dHI+PHRkIHN0eWxlPVwicGFkZGluZzozcHggOHB4IDNweCAwO2ZvbnQtd2VpZ2h0OjYwMDtjb2xvcjojNDQ0XCI+Um91dGU8L3RkPjx0ZD57cm91dGVpZH08L3RkPjwvdHI+XHJcbiAgICAgICAgICAgIDx0cj48dGQgc3R5bGU9XCJwYWRkaW5nOjNweCA4cHggM3B4IDA7Zm9udC13ZWlnaHQ6NjAwO2NvbG9yOiM0NDRcIj5TZWdtZW50PC90ZD48dGQ+TSB7ZnJvbV9tfSBcXHUyMDEzIHt0b19tfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPlJpc2sgTGV2ZWw8L3RkPjx0ZCBzdHlsZT1cImZvbnQtd2VpZ2h0OjcwMFwiPntyaXNrX2xldmVsfTwvdGQ+PC90cj5cclxuICAgICAgICAgICAgPHRyPjx0ZCBzdHlsZT1cInBhZGRpbmc6M3B4IDhweCAzcHggMDtmb250LXdlaWdodDo2MDA7Y29sb3I6IzQ0NFwiPkNvbnRyaWJ1dGluZyBGYWN0b3JzPC90ZD48dGQ+e2NvbnRyaWJ1dGluZ19mYWN0b3JzfTwvdGQ+PC90cj5cclxuICAgICAgICAgIDwvdGFibGU+XHJcbiAgICAgICAgPC9kaXY+YCxcclxuICAgICAgICBleHByZXNzaW9uSW5mb3M6IFt7XHJcbiAgICAgICAgICBuYW1lOiAncmlza0NvbG9yJyxcclxuICAgICAgICAgIGV4cHJlc3Npb246IGB2YXIgcyA9ICRmZWF0dXJlLnJpc2tfc2NvcmU7IFdoZW4ocyA+IDc1LCAnI2QzMmYyZicsIHMgPiA1MCwgJyNmNTdjMDAnLCBzID4gMjUsICcjZmJjMDJkJywgcyA+IDAsICcjMzg4ZTNjJywgJyM5OTknKWBcclxuICAgICAgICB9XVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgdmlldy5tYXAuYWRkKHByZWRpY3Rpb25MYXllcilcclxuICAgIHByZWRpY3Rpb25MYXllci53aGVuKCgpID0+IHtcclxuICAgICAgcHJlZGljdGlvbkxheWVyLnF1ZXJ5RXh0ZW50KCkudGhlbigocjogYW55KSA9PiB7XHJcbiAgICAgICAgaWYgKHIuZXh0ZW50KSB2aWV3LmdvVG8oci5leHRlbnQuZXhwYW5kKDEuMikpXHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyA9PT09PT09PT09PT09PT09PT09PSBOWSBTVEFURSBDUkFTSCBNT0RFTCA9PT09PT09PT09PT09PT09PT09PVxyXG4gIGNvbnN0IE5ZX1NUQVRFX0NSQVNIX01PREVMID0ge1xyXG4gICAgdG90YWxDcmFzaGVzOiAxNTI1MTIzLFxyXG4gICAgdG90YWxGYXRhbDogNDIwOCxcclxuICAgIHllYXJzOiAnMjAyMS0yMDI0JyxcclxuICAgIHNvdXJjZTogJ05ZIFN0YXRlIERNViB2aWEgZGF0YS5ueS5nb3YnLFxyXG4gICAgcm9hZEdlb21ldHJ5OiB7XHJcbiAgICAgICdTdHJhaWdodCBhbmQgTGV2ZWwnOiB7IGNyYXNoZXM6IDExNzgyMjgsIGZhdGFsOiAyODM0LCB3ZWlnaHQ6IDEuMCB9LFxyXG4gICAgICAnU3RyYWlnaHQgYW5kIEdyYWRlJzogeyBjcmFzaGVzOiAxMjY0NjQsIGZhdGFsOiA0MjksIHdlaWdodDogMS40MSB9LFxyXG4gICAgICAnQ3VydmUgYW5kIExldmVsJzogeyBjcmFzaGVzOiA3MjM0OSwgZmF0YWw6IDQ5Nywgd2VpZ2h0OiAyLjg2IH0sXHJcbiAgICAgICdDdXJ2ZSBhbmQgR3JhZGUnOiB7IGNyYXNoZXM6IDQ3NDk3LCBmYXRhbDogMzE2LCB3ZWlnaHQ6IDIuNzcgfSxcclxuICAgICAgJ0N1cnZlIGF0IEhpbGwgQ3Jlc3QnOiB7IGNyYXNoZXM6IDY4NjAsIGZhdGFsOiA1NCwgd2VpZ2h0OiAzLjI4IH0sXHJcbiAgICAgICdTdHJhaWdodCBhdCBIaWxsIENyZXN0JzogeyBjcmFzaGVzOiAyMTU5NywgZmF0YWw6IDc1LCB3ZWlnaHQ6IDEuNDUgfVxyXG4gICAgfSxcclxuICAgIHRyYWZmaWNDb250cm9sOiB7XHJcbiAgICAgICdOb25lJzogeyBjcmFzaGVzOiA4NzIwNTYsIGZhdGFsOiAyNDU3LCB3ZWlnaHQ6IDEuMTcgfSxcclxuICAgICAgJ1RyYWZmaWMgU2lnbmFsJzogeyBjcmFzaGVzOiAzMTgwNjUsIGZhdGFsOiA4MjYsIHdlaWdodDogMS4wOCB9LFxyXG4gICAgICAnU3RvcCBTaWduJzogeyBjcmFzaGVzOiAxMzE2NjQsIGZhdGFsOiAyNjYsIHdlaWdodDogMC44NCB9LFxyXG4gICAgICAnTm8gUGFzc2luZyBab25lJzogeyBjcmFzaGVzOiA4NTM5NiwgZmF0YWw6IDU1Nywgd2VpZ2h0OiAyLjcyIH0sXHJcbiAgICAgICdZaWVsZCBTaWduJzogeyBjcmFzaGVzOiAxMjg4MCwgZmF0YWw6IDgsIHdlaWdodDogMC4yNiB9LFxyXG4gICAgICAnQ29uc3RydWN0aW9uIFdvcmsgQXJlYSc6IHsgY3Jhc2hlczogNDQyOSwgZmF0YWw6IDksIHdlaWdodDogMC44NSB9LFxyXG4gICAgICAnRmxhc2hpbmcgTGlnaHQnOiB7IGNyYXNoZXM6IDMwNjMsIGZhdGFsOiAxMCwgd2VpZ2h0OiAxLjM2IH0sXHJcbiAgICAgICdSUiBDcm9zc2luZyBHYXRlcyc6IHsgY3Jhc2hlczogODc4LCBmYXRhbDogNywgd2VpZ2h0OiAzLjMyIH0sXHJcbiAgICAgICdTY2hvb2wgWm9uZSc6IHsgY3Jhc2hlczogNjM3LCBmYXRhbDogMSwgd2VpZ2h0OiAwLjY1IH1cclxuICAgIH0sXHJcbiAgICByb2FkU3VyZmFjZToge1xyXG4gICAgICAnRHJ5JzogeyBjcmFzaGVzOiAxMTMwMjExLCBmYXRhbDogMzEwMiwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ1dldCc6IHsgY3Jhc2hlczogMjM0NjAzLCBmYXRhbDogNjUxLCB3ZWlnaHQ6IDEuMDEgfSxcclxuICAgICAgJ1Nub3cvSWNlJzogeyBjcmFzaGVzOiA3MjY3NiwgZmF0YWw6IDIyMiwgd2VpZ2h0OiAxLjExIH0sXHJcbiAgICAgICdTbHVzaCc6IHsgY3Jhc2hlczogNTc1NywgZmF0YWw6IDE0LCB3ZWlnaHQ6IDAuODkgfSxcclxuICAgICAgJ0Zsb29kZWQgV2F0ZXInOiB7IGNyYXNoZXM6IDUwOCwgZmF0YWw6IDMsIHdlaWdodDogMi4xNSB9LFxyXG4gICAgICAnTXVkZHknOiB7IGNyYXNoZXM6IDY0OCwgZmF0YWw6IDMsIHdlaWdodDogMS42OSB9XHJcbiAgICB9LFxyXG4gICAgbGlnaHRpbmc6IHtcclxuICAgICAgJ0RheWxpZ2h0JzogeyBjcmFzaGVzOiA5MzMyMTAsIGZhdGFsOiAxODY3LCB3ZWlnaHQ6IDAuODMgfSxcclxuICAgICAgJ0RhcmstUm9hZCBMaWdodGVkJzogeyBjcmFzaGVzOiAyNzg5ODIsIGZhdGFsOiA4NzYsIHdlaWdodDogMS4zMSB9LFxyXG4gICAgICAnRGFyay1Sb2FkIFVubGlnaHRlZCc6IHsgY3Jhc2hlczogMTQ4NjM1LCBmYXRhbDogMTAwNSwgd2VpZ2h0OiAyLjgyIH0sXHJcbiAgICAgICdEdXNrJzogeyBjcmFzaGVzOiA0ODc0MCwgZmF0YWw6IDIyMSwgd2VpZ2h0OiAxLjg5IH0sXHJcbiAgICAgICdEYXduJzogeyBjcmFzaGVzOiAzNzg0OCwgZmF0YWw6IDIzOSwgd2VpZ2h0OiAyLjYzIH1cclxuICAgIH0sXHJcbiAgICB3ZWF0aGVyOiB7XHJcbiAgICAgICdDbGVhcic6IHsgY3Jhc2hlczogOTM1ODk3LCBmYXRhbDogMjY3OSwgd2VpZ2h0OiAxLjAgfSxcclxuICAgICAgJ0Nsb3VkeSc6IHsgY3Jhc2hlczogMjk1NzMyLCBmYXRhbDogNzAwLCB3ZWlnaHQ6IDAuODMgfSxcclxuICAgICAgJ1JhaW4nOiB7IGNyYXNoZXM6IDEzOTU1OSwgZmF0YWw6IDQxOSwgd2VpZ2h0OiAxLjA1IH0sXHJcbiAgICAgICdTbm93JzogeyBjcmFzaGVzOiA1ODc2MywgZmF0YWw6IDE4Mywgd2VpZ2h0OiAxLjA5IH0sXHJcbiAgICAgICdTbGVldC9IYWlsL0ZyZWV6aW5nIFJhaW4nOiB7IGNyYXNoZXM6IDk0ODMsIGZhdGFsOiAyOCwgd2VpZ2h0OiAxLjAzIH0sXHJcbiAgICAgICdGb2cvU21vZy9TbW9rZSc6IHsgY3Jhc2hlczogNDc5MiwgZmF0YWw6IDQ1LCB3ZWlnaHQ6IDMuOTEgfVxyXG4gICAgfSxcclxuICAgIGxyc01hcHBpbmc6IHtcclxuICAgICAgJ0N1cnZlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xlZnQnOiAnQ3VydmUgYW5kIExldmVsJywgJ1JpZ2h0JzogJ0N1cnZlIGFuZCBMZXZlbCcsICdDb21wb3VuZCc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnUmV2ZXJzZSc6ICdDdXJ2ZSBhbmQgR3JhZGUnLCAnU2ltcGxlJzogJ0N1cnZlIGFuZCBMZXZlbCcgfSB9LFxyXG4gICAgICAnR3JhZGUnOiB7IHN0YXRlRmllbGQ6ICdyb2FkR2VvbWV0cnknLCB2YWx1ZU1hcDogeyAnTGV2ZWwnOiAnU3RyYWlnaHQgYW5kIExldmVsJywgJ0ZsYXQnOiAnU3RyYWlnaHQgYW5kIExldmVsJywgJ1JvbGxpbmcnOiAnU3RyYWlnaHQgYW5kIEdyYWRlJywgJ01vdW50YWlub3VzJzogJ0N1cnZlIGFuZCBHcmFkZScsICdTdGVlcCc6ICdTdHJhaWdodCBhbmQgR3JhZGUnIH0gfSxcclxuICAgICAgJ1NwZWVkIExpbWl0JzogeyBzdGF0ZUZpZWxkOiAnc3BlZWQnLCBjdXN0b21XZWlnaHRzOiB7ICcyNSc6IDAuNywgJzMwJzogMC44LCAnMzUnOiAwLjksICc0MCc6IDEuMSwgJzQ1JzogMS4zLCAnNTAnOiAxLjYsICc1NSc6IDIuMCwgJzYwJzogMi4zLCAnNjUnOiAyLjYgfSB9LFxyXG4gICAgICAnRnVuY3Rpb25hbCBDbGFzcyc6IHsgc3RhdGVGaWVsZDogJ2Z1bmNDbGFzcycsIGN1c3RvbVdlaWdodHM6IHsgJ0ludGVyc3RhdGUnOiAxLjMsICdQcmluY2lwYWwgQXJ0ZXJpYWwnOiAxLjUsICdNaW5vciBBcnRlcmlhbCc6IDEuMiwgJ01ham9yIENvbGxlY3Rvcic6IDEuMCwgJ01pbm9yIENvbGxlY3Rvcic6IDAuOCwgJ0xvY2FsJzogMC42IH0gfSxcclxuICAgICAgJ01lZGlhbiBUeXBlJzogeyBzdGF0ZUZpZWxkOiAnbWVkaWFuJywgY3VzdG9tV2VpZ2h0czogeyAnTm9uZSc6IDEuOCwgJ1BhaW50ZWQnOiAxLjMsICdDdXJiZWQnOiAxLjAsICdQb3NpdGl2ZSBCYXJyaWVyJzogMC42LCAnRGVwcmVzc2VkJzogMC43LCAnR3Jhc3MnOiAwLjkgfSB9LFxyXG4gICAgICAnVGhyb3VnaCBMYW5lJzogeyBzdGF0ZUZpZWxkOiAnbGFuZXMnLCBjdXN0b21XZWlnaHRzOiB7ICcxJzogMC44LCAnMic6IDEuMCwgJzMnOiAxLjMsICc0JzogMS4xLCAnNSc6IDEuNCwgJzYnOiAxLjIgfSB9LFxyXG4gICAgICAnU2hvdWxkZXIgVHlwZSc6IHsgc3RhdGVGaWVsZDogJ3Nob3VsZGVyJywgY3VzdG9tV2VpZ2h0czogeyAnTm9uZSc6IDEuNiwgJ0dyYXZlbCc6IDEuMSwgJ1BhdmVkJzogMC44LCAnR3Jhc3MnOiAxLjIsICdDdXJiJzogMS4wIH0gfSxcclxuICAgICAgJ1BhdmVtZW50IFR5cGUnOiB7IHN0YXRlRmllbGQ6ICdwYXZlbWVudCcsIGN1c3RvbVdlaWdodHM6IHsgJ0FzcGhhbHQnOiAwLjksICdDb25jcmV0ZSc6IDEuMCwgJ0dyYXZlbCc6IDEuNSwgJ0JyaWNrJzogMS4yLCAnRGlydCc6IDEuOCwgJ0NvbXBvc2l0ZSc6IDAuOTUgfSB9LFxyXG4gICAgICAnVGVycmFpbiBUeXBlJzogeyBzdGF0ZUZpZWxkOiAncm9hZEdlb21ldHJ5JywgdmFsdWVNYXA6IHsgJ0xldmVsJzogJ1N0cmFpZ2h0IGFuZCBMZXZlbCcsICdSb2xsaW5nJzogJ1N0cmFpZ2h0IGFuZCBHcmFkZScsICdNb3VudGFpbm91cyc6ICdDdXJ2ZSBhbmQgR3JhZGUnIH0gfSxcclxuICAgICAgJ1BlcmNlbnQgUGFzc2luZyBTaWdodCc6IHsgc3RhdGVGaWVsZDogJ3Bhc3NTaWdodCcsIGN1c3RvbVdlaWdodHM6IHsgJzAnOiAyLjUsICcxMCc6IDIuMiwgJzIwJzogMS45LCAnMzAnOiAxLjYsICc0MCc6IDEuMywgJzUwJzogMS4xLCAnNjAnOiAxLjAsICc3MCc6IDAuOSwgJzgwJzogMC44NSwgJzkwJzogMC44LCAnMTAwJzogMC43NSB9IH0sXHJcbiAgICAgICdBY2Nlc3MgQ29udHJvbCc6IHsgc3RhdGVGaWVsZDogJ2FjY2VzcycsIGN1c3RvbVdlaWdodHM6IHsgJ0Z1bGwnOiAwLjYsICdQYXJ0aWFsJzogMS4wLCAnTm9uZSc6IDEuNSB9IH0sXHJcbiAgICAgICdPd25lcnNoaXAnOiB7IHN0YXRlRmllbGQ6ICdvd25lcnNoaXAnLCBjdXN0b21XZWlnaHRzOiB7ICdTdGF0ZSc6IDEuMCwgJ0NvdW50eSc6IDEuMSwgJ0NpdHknOiAxLjIsICdGZWRlcmFsJzogMC45LCAnUHJpdmF0ZSc6IDEuNCB9IH1cclxuICAgIH0gYXMgUmVjb3JkPHN0cmluZywgYW55PlxyXG4gIH1cclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gQUkgUFJFRElDVElPTiA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBydW5BSVByZWRpY3Rpb24gPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRSdW5uaW5nKHRydWUpXHJcbiAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIHNldFJlc3VsdChudWxsKVxyXG4gICAgc2V0U2hvd0V4cGxhbmF0aW9uKGZhbHNlKVxyXG4gICAgc2V0RmFjdG9ycyhudWxsKVxyXG4gICAgc2V0RXJyb3IobnVsbClcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBzZXNzaW9uID0gU2Vzc2lvbk1hbmFnZXIuZ2V0SW5zdGFuY2UoKS5nZXRNYWluU2Vzc2lvbigpIGFzIGFueVxyXG4gICAgICBpZiAoIXNlc3Npb24pIHRocm93IG5ldyBFcnJvcignTm90IHNpZ25lZCBpbi4nKVxyXG4gICAgICBjb25zdCB0b2tlbiA9IHNlc3Npb24udG9rZW5cclxuICAgICAgY29uc3QgcG9ydGFsVXJsID0gKHNlc3Npb24ucG9ydGFsIHx8ICcnKS5yZXBsYWNlKC9cXC9zaGFyaW5nXFwvcmVzdFxcLz8kLywgJycpXHJcbiAgICAgIGNvbnN0IHVzZXJuYW1lID0gc2Vzc2lvbi51c2VybmFtZVxyXG4gICAgICBjb25zdCB2aWV3ID0gamltdU1hcFZpZXdSZWYuY3VycmVudD8udmlldyBhcyBhbnlcclxuICAgICAgY29uc3Qgd2tpZCA9IHZpZXc/LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcblxyXG4gICAgICAvLyBTdGVwIDE6IFF1ZXJ5IGV2ZW50IGRhdGFcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1F1ZXJ5aW5nIGV2ZW50IGRhdGEgZnJvbSBMUlMuLi4nKVxyXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCBxdWVyeUV2ZW50RGF0YSgpXHJcbiAgICAgIGlmIChldmVudERhdGEubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIGV2ZW50IGRhdGEgZm91bmQgZm9yIHNlbGVjdGVkIHJvdXRlcy4nKVxyXG5cclxuICAgICAgLy8gU3RlcCAyOiBTZWdtZW50IHJvdXRlc1xyXG4gICAgICBzZXRQcm9ncmVzcygnU2VnbWVudGluZyByb3V0ZXMgaW50byAwLjUtbWlsZSBpbnRlcnZhbHMuLi4nKVxyXG4gICAgICBjb25zdCByb3V0ZUdlb21ldHJpZXMgPSByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudFxyXG4gICAgICBpZiAocm91dGVHZW9tZXRyaWVzLnNpemUgPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gcm91dGUgZ2VvbWV0cmllcyBjYWNoZWQuJylcclxuXHJcbiAgICAgIGNvbnN0IHNlZ21lbnRzOiBhbnlbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgW3JpZCwgcm91dGVEYXRhXSBvZiByb3V0ZUdlb21ldHJpZXMpIHtcclxuICAgICAgICBjb25zdCB7IHZlcnRpY2VzLCBtSWR4IH0gPSByb3V0ZURhdGFcclxuICAgICAgICBpZiAodmVydGljZXMubGVuZ3RoIDwgMikgY29udGludWVcclxuICAgICAgICBjb25zdCBtaW5NZWFzdXJlID0gdmVydGljZXNbMF1bbUlkeF0gfHwgMFxyXG4gICAgICAgIGNvbnN0IG1heE1lYXN1cmUgPSB2ZXJ0aWNlc1t2ZXJ0aWNlcy5sZW5ndGggLSAxXVttSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3Qgcm91dGVMZW4gPSBtYXhNZWFzdXJlIC0gbWluTWVhc3VyZVxyXG4gICAgICAgIGlmIChyb3V0ZUxlbiA8PSAwKSBjb250aW51ZVxyXG5cclxuICAgICAgICBsZXQgc2VnRnJvbSA9IG1pbk1lYXN1cmVcclxuICAgICAgICBsZXQgc2VnSWR4ID0gMFxyXG4gICAgICAgIHdoaWxlIChzZWdGcm9tIDwgbWF4TWVhc3VyZSkge1xyXG4gICAgICAgICAgY29uc3Qgc2VnVG8gPSBNYXRoLm1pbihzZWdGcm9tICsgMC41LCBtYXhNZWFzdXJlKVxyXG4gICAgICAgICAgY29uc3QgbWlkTSA9IChzZWdGcm9tICsgc2VnVG8pIC8gMlxyXG4gICAgICAgICAgbGV0IG1pZFggPSAwLCBtaWRZID0gMFxyXG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB2ZXJ0aWNlcy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbTEgPSB2ZXJ0aWNlc1tpXVttSWR4XSB8fCAwXHJcbiAgICAgICAgICAgIGNvbnN0IG0yID0gdmVydGljZXNbaSArIDFdW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgaWYgKG1pZE0gPj0gbTEgJiYgbWlkTSA8PSBtMikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGZyYWMgPSBtMiAhPT0gbTEgPyAobWlkTSAtIG0xKSAvIChtMiAtIG0xKSA6IDBcclxuICAgICAgICAgICAgICBtaWRYID0gdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKVxyXG4gICAgICAgICAgICAgIG1pZFkgPSB2ZXJ0aWNlc1tpXVsxXSArIGZyYWMgKiAodmVydGljZXNbaSArIDFdWzFdIC0gdmVydGljZXNbaV1bMV0pXHJcbiAgICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgcGF0aDogbnVtYmVyW11bXSA9IFtdXHJcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRpY2VzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICBjb25zdCBtMSA9IHZlcnRpY2VzW2ldW21JZHhdIHx8IDBcclxuICAgICAgICAgICAgY29uc3QgbTIgPSB2ZXJ0aWNlc1tpICsgMV1bbUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBpZiAobTIgPCBzZWdGcm9tKSBjb250aW51ZVxyXG4gICAgICAgICAgICBpZiAobTEgPiBzZWdUbykgYnJlYWtcclxuICAgICAgICAgICAgaWYgKG0xID49IHNlZ0Zyb20gJiYgbTEgPD0gc2VnVG8pIHtcclxuICAgICAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPT09IDAgfHwgcGF0aFtwYXRoLmxlbmd0aCAtIDFdWzBdICE9PSB2ZXJ0aWNlc1tpXVswXSkgcGF0aC5wdXNoKFt2ZXJ0aWNlc1tpXVswXSwgdmVydGljZXNbaV1bMV1dKVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG0xIDwgc2VnRnJvbSAmJiBtMiA+IHNlZ0Zyb20pIHtcclxuICAgICAgICAgICAgICBjb25zdCBmcmFjID0gKHNlZ0Zyb20gLSBtMSkgLyAobTIgLSBtMSlcclxuICAgICAgICAgICAgICBwYXRoLnB1c2goW3ZlcnRpY2VzW2ldWzBdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMF0gLSB2ZXJ0aWNlc1tpXVswXSksIHZlcnRpY2VzW2ldWzFdICsgZnJhYyAqICh2ZXJ0aWNlc1tpICsgMV1bMV0gLSB2ZXJ0aWNlc1tpXVsxXSldKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtMiA+PSBzZWdGcm9tICYmIG0yIDw9IHNlZ1RvKSBwYXRoLnB1c2goW3ZlcnRpY2VzW2kgKyAxXVswXSwgdmVydGljZXNbaSArIDFdWzFdXSlcclxuICAgICAgICAgICAgZWxzZSBpZiAobTEgPCBzZWdUbyAmJiBtMiA+IHNlZ1RvKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgZnJhYyA9IChzZWdUbyAtIG0xKSAvIChtMiAtIG0xKVxyXG4gICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydGljZXNbaV1bMF0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVswXSAtIHZlcnRpY2VzW2ldWzBdKSwgdmVydGljZXNbaV1bMV0gKyBmcmFjICogKHZlcnRpY2VzW2kgKyAxXVsxXSAtIHZlcnRpY2VzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChwYXRoLmxlbmd0aCA+PSAyKSBzZWdtZW50cy5wdXNoKHsgcm91dGVJZDogcmlkLCBzZWdJZHgsIGZyb21NOiBzZWdGcm9tLCB0b006IHNlZ1RvLCBtaWRYLCBtaWRZLCBwYXRoLCBjcmFzaENvdW50OiAwLCBhdHRyczoge30gYXMgUmVjb3JkPHN0cmluZywgYW55PiB9KVxyXG4gICAgICAgICAgc2VnRnJvbSA9IHNlZ1RvXHJcbiAgICAgICAgICBzZWdJZHgrK1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlZ21lbnRzIGdlbmVyYXRlZC4nKVxyXG5cclxuICAgICAgLy8gU3RlcCAzOiBDb3VudCBjcmFzaGVzIHBlciBzZWdtZW50XHJcbiAgICAgIHNldFByb2dyZXNzKGBDb3VudGluZyBjcmFzaGVzIGFjcm9zcyAke3NlZ21lbnRzLmxlbmd0aH0gc2VnbWVudHMuLi5gKVxyXG4gICAgICBjb25zdCBldmVudENvbmZpZ3MgPSBjb25maWcuZXZlbnRMYXllckNvbmZpZ3MgfHwgW11cclxuICAgICAgY29uc3QgY3Jhc2hMYXllck5hbWVzID0gbmV3IFNldChldmVudENvbmZpZ3MuZmlsdGVyKGNmZyA9PiAvY3Jhc2h8YWNjaWRlbnR8Y29sbGlzaW9uL2kudGVzdChjZmcubmFtZSkpLm1hcChjZmcgPT4gY2ZnLm5hbWUpKVxyXG5cclxuICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBldmVudERhdGEpIHtcclxuICAgICAgICBpZiAoIWNyYXNoTGF5ZXJOYW1lcy5oYXMoZW50cnkuRmVhdHVyZSkpIGNvbnRpbnVlXHJcbiAgICAgICAgaWYgKGVudHJ5Lk1lYXN1cmUgPT0gbnVsbCkgY29udGludWVcclxuICAgICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgICAgaWYgKHNlZy5yb3V0ZUlkID09PSBlbnRyeS5Sb3V0ZUlEICYmIGVudHJ5Lk1lYXN1cmUgPj0gc2VnLmZyb21NICYmIGVudHJ5Lk1lYXN1cmUgPCBzZWcudG9NKSB7XHJcbiAgICAgICAgICAgIHNlZy5jcmFzaENvdW50KytcclxuICAgICAgICAgICAgYnJlYWtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIFN0ZXAgNDogRW5yaWNoIHdpdGggcm9hZCBhdHRyaWJ1dGVzXHJcbiAgICAgIHNldFByb2dyZXNzKCdFbnJpY2hpbmcgc2VnbWVudHMgd2l0aCByb2FkIGF0dHJpYnV0ZXMuLi4nKVxyXG4gICAgICBjb25zdCBub25DcmFzaExheWVycyA9IGV2ZW50Q29uZmlncy5maWx0ZXIoY2ZnID0+ICFjcmFzaExheWVyTmFtZXMuaGFzKGNmZy5uYW1lKSlcclxuICAgICAgY29uc3QgZW5yaWNoRmllbGRzOiBzdHJpbmdbXSA9IFtdXHJcbiAgICAgIGZvciAoY29uc3QgY2ZnIG9mIG5vbkNyYXNoTGF5ZXJzKSB7XHJcbiAgICAgICAgY29uc3QgbGF5ZXJFbnRyaWVzID0gZXZlbnREYXRhLmZpbHRlcihlID0+IGUuRmVhdHVyZSA9PT0gY2ZnLm5hbWUpXHJcbiAgICAgICAgZm9yIChjb25zdCBhdHRyIG9mIChjZmcuYXR0cmlidXRlcyB8fCBbXSkpIHtcclxuICAgICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGAke2NmZy5uYW1lLnJlcGxhY2UoL1teYS16QS1aMC05XS9nLCAnXycpLnN1YnN0cmluZygwLCAxNSl9XyR7YXR0ci5yZXBsYWNlKC9bXmEtekEtWjAtOV0vZywgJ18nKS5zdWJzdHJpbmcoMCwgMTUpfWAuc3Vic3RyaW5nKDAsIDMxKVxyXG4gICAgICAgICAgaWYgKCFlbnJpY2hGaWVsZHMuaW5jbHVkZXMoZmllbGROYW1lKSkgZW5yaWNoRmllbGRzLnB1c2goZmllbGROYW1lKVxyXG4gICAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBsYXllckVudHJpZXMpIHtcclxuICAgICAgICAgICAgaWYgKGVudHJ5LlJvdXRlSUQgPT0gbnVsbCB8fCBlbnRyeS5NZWFzdXJlID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc2VnIG9mIHNlZ21lbnRzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHNlZy5yb3V0ZUlkID09PSBlbnRyeS5Sb3V0ZUlEICYmIGVudHJ5Lk1lYXN1cmUgPj0gc2VnLmZyb21NICYmIGVudHJ5Lk1lYXN1cmUgPCBzZWcudG9NKSB7XHJcbiAgICAgICAgICAgICAgICBzZWcuYXR0cnNbZmllbGROYW1lXSA9IGVudHJ5W2F0dHJdID8/ICcnXHJcbiAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU3RlcCA1OiBLZXJuZWwgZGVuc2l0eSBzY29yaW5nXHJcbiAgICAgIHNldFByb2dyZXNzKCdDb21wdXRpbmcgcmlzayBzY29yZXMuLi4nKVxyXG4gICAgICBjb25zdCBLRVJORUxfUkFESVVTID0gNVxyXG4gICAgICBjb25zdCBERUNBWSA9IDAuNVxyXG4gICAgICBjb25zdCBzZWdzQnlSb3V0ZSA9IG5ldyBNYXA8c3RyaW5nLCBhbnlbXT4oKVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGlmICghc2Vnc0J5Um91dGUuaGFzKHNlZy5yb3V0ZUlkKSkgc2Vnc0J5Um91dGUuc2V0KHNlZy5yb3V0ZUlkLCBbXSlcclxuICAgICAgICBzZWdzQnlSb3V0ZS5nZXQoc2VnLnJvdXRlSWQpIS5wdXNoKHNlZylcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgcmlza1Njb3JlczogbnVtYmVyW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGNvbnN0IHJvdXRlU2VncyA9IHNlZ3NCeVJvdXRlLmdldChzZWcucm91dGVJZCkgfHwgW11cclxuICAgICAgICBsZXQgc2NvcmUgPSBzZWcuY3Jhc2hDb3VudCAqIDJcclxuICAgICAgICBmb3IgKGNvbnN0IG5laWdoYm9yIG9mIHJvdXRlU2Vncykge1xyXG4gICAgICAgICAgaWYgKG5laWdoYm9yID09PSBzZWcpIGNvbnRpbnVlXHJcbiAgICAgICAgICBjb25zdCBkID0gTWF0aC5hYnMobmVpZ2hib3Iuc2VnSWR4IC0gc2VnLnNlZ0lkeClcclxuICAgICAgICAgIGlmIChkIDw9IEtFUk5FTF9SQURJVVMpIHNjb3JlICs9IG5laWdoYm9yLmNyYXNoQ291bnQgKiBNYXRoLnBvdyhERUNBWSwgZClcclxuICAgICAgICB9XHJcbiAgICAgICAgcmlza1Njb3Jlcy5wdXNoKHNjb3JlKVxyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IG1heFJpc2tTY29yZSA9IE1hdGgubWF4KC4uLnJpc2tTY29yZXMsIDEpXHJcbiAgICAgIGNvbnN0IG5vcm1hbGl6ZWRTY29yZXMgPSByaXNrU2NvcmVzLm1hcChzID0+IE1hdGgucm91bmQoKHMgLyBtYXhSaXNrU2NvcmUpICogMTAwKSlcclxuXHJcbiAgICAgIC8vIFN0b3JlIGZhY3RvcnMgZm9yIGV4cGxhbmF0aW9uXHJcbiAgICAgIGNvbnN0IGhpZ2hSaXNrU2VncyA9IHNlZ21lbnRzLmZpbHRlcigoXywgaWR4KSA9PiBub3JtYWxpemVkU2NvcmVzW2lkeF0gPj0gNzUpXHJcbiAgICAgIGNvbnN0IHRvcEhpZ2hSaXNrID0gaGlnaFJpc2tTZWdzLm1hcChzZWcgPT4gKHsgLi4uc2VnLCByaXNrU2NvcmU6IG5vcm1hbGl6ZWRTY29yZXNbc2VnbWVudHMuaW5kZXhPZihzZWcpXSB9KSkuc29ydCgoYSwgYikgPT4gYi5yaXNrU2NvcmUgLSBhLnJpc2tTY29yZSkuc2xpY2UoMCwgNSlcclxuICAgICAgc2V0RmFjdG9ycyh7IHRvdGFsU2VnbWVudHM6IHNlZ21lbnRzLmxlbmd0aCwgc2VnbWVudHNXaXRoQ3Jhc2hlczogc2VnbWVudHMuZmlsdGVyKHMgPT4gcy5jcmFzaENvdW50ID4gMCkubGVuZ3RoLCBoaWdoUmlza0NvdW50OiBoaWdoUmlza1NlZ3MubGVuZ3RoLCBtYXhDcmFzaENvdW50OiBNYXRoLm1heCguLi5zZWdtZW50cy5tYXAocyA9PiBzLmNyYXNoQ291bnQpLCAxKSwgZW5yaWNoTGF5ZXJzOiBub25DcmFzaExheWVycy5tYXAobCA9PiBsLm5hbWUpLCBlbnJpY2hGaWVsZHMsIGtlcm5lbFJhZGl1czogS0VSTkVMX1JBRElVUywgdG9wSGlnaFJpc2tTZWdtZW50czogdG9wSGlnaFJpc2sgfSlcclxuXHJcbiAgICAgIC8vIFN0ZXAgNjogVXBsb2FkIGFzIGZlYXR1cmUgc2VydmljZVxyXG4gICAgICBzZXRQcm9ncmVzcygnVXBsb2FkaW5nIHByZWRpY3Rpb24gbGF5ZXIuLi4nKVxyXG4gICAgICBjb25zdCBjb250ZW50VXJsID0gYCR7cG9ydGFsVXJsfS9zaGFyaW5nL3Jlc3QvY29udGVudC91c2Vycy8ke3VzZXJuYW1lfWBcclxuICAgICAgY29uc3QgZm9sZGVyVXJsID0gc2VsZWN0ZWRGb2xkZXJJZCA/IGAke2NvbnRlbnRVcmx9LyR7c2VsZWN0ZWRGb2xkZXJJZH1gIDogY29udGVudFVybFxyXG4gICAgICBjb25zdCBzZXJ2aWNlTmFtZSA9IGBDcmFzaFJpc2tfQUlfJHtEYXRlLm5vdygpfWBcclxuXHJcbiAgICAgIGNvbnN0IGZpZWxkcyA9IFtcclxuICAgICAgICB7IG5hbWU6ICdPQkpFQ1RJRCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlT0lEJywgYWxpYXM6ICdPYmplY3RJRCcgfSxcclxuICAgICAgICB7IG5hbWU6ICdyb3V0ZWlkJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVTdHJpbmcnLCBhbGlhczogJ1JvdXRlIElEJywgbGVuZ3RoOiAxMDAgfSxcclxuICAgICAgICB7IG5hbWU6ICdmcm9tX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnRnJvbSBNZWFzdXJlJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3RvX20nLCB0eXBlOiAnZXNyaUZpZWxkVHlwZURvdWJsZScsIGFsaWFzOiAnVG8gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICdjcmFzaF9jb3VudCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnQ3Jhc2ggQ291bnQnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19zY29yZScsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnUmlzayBTY29yZSAoMC0xMDApJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfbGV2ZWwnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUmlzayBMZXZlbCcsIGxlbmd0aDogMjAgfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250cmlidXRpbmdfZmFjdG9ycycsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdDb250cmlidXRpbmcgRmFjdG9ycycsIGxlbmd0aDogNTAwIH1cclxuICAgICAgXVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcygpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2NyZWF0ZVBhcmFtZXRlcnMnLCBKU09OLnN0cmluZ2lmeSh7IG5hbWU6IHNlcnZpY2VOYW1lLCBzZXJ2aWNlRGVzY3JpcHRpb246ICdBSSBjcmFzaCByaXNrIHByZWRpY3Rpb24nLCBoYXNTdGF0aWNEYXRhOiBmYWxzZSwgbWF4UmVjb3JkQ291bnQ6IDEwMDAwLCBzdXBwb3J0ZWRRdWVyeUZvcm1hdHM6ICdKU09OJywgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZycsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9LCBpbml0aWFsRXh0ZW50OiB7IHhtaW46IC0yMDAzNzUwOCwgeW1pbjogLTIwMDM3NTA4LCB4bWF4OiAyMDAzNzUwOCwgeW1heDogMjAwMzc1MDgsIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGFsbG93R2VvbWV0cnlVcGRhdGVzOiB0cnVlIH0pKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0YXJnZXRUeXBlJywgJ2ZlYXR1cmVTZXJ2aWNlJylcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgnb3V0cHV0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGlmIChzZWxlY3RlZEZvbGRlcklkKSBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmb2xkZXJJZCcsIHNlbGVjdGVkRm9sZGVySWQpXHJcblxyXG4gICAgICBjb25zdCBjcmVhdGVSZXNwID0gYXdhaXQgZmV0Y2goYCR7Zm9sZGVyVXJsfS9jcmVhdGVTZXJ2aWNlYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogY3JlYXRlUGFyYW1zIH0pXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVJlc3VsdCA9IGF3YWl0IGNyZWF0ZVJlc3AuanNvbigpXHJcbiAgICAgIGlmICghY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMICYmICFjcmVhdGVSZXN1bHQuc2VydmljZXVybCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlcnZpY2U6ICcgKyBKU09OLnN0cmluZ2lmeShjcmVhdGVSZXN1bHQpKVxyXG4gICAgICBjb25zdCBzZXJ2aWNlVXJsID0gY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMIHx8IGNyZWF0ZVJlc3VsdC5zZXJ2aWNldXJsXHJcbiAgICAgIGNvbnN0IHRlbXBJdGVtSWQgPSBjcmVhdGVSZXN1bHQuaXRlbUlkXHJcblxyXG4gICAgICBjb25zdCBhZG1pblVybCA9IHNlcnZpY2VVcmwucmVwbGFjZSgnL3Jlc3Qvc2VydmljZXMvJywgJy9yZXN0L2FkbWluL3NlcnZpY2VzLycpXHJcbiAgICAgIGNvbnN0IGFkZERlZlBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdhZGRUb0RlZmluaXRpb24nLCBKU09OLnN0cmluZ2lmeSh7IGxheWVyczogW3sgaWQ6IDAsIG5hbWU6ICdBSSBDcmFzaCBSaXNrJywgdHlwZTogJ0ZlYXR1cmUgTGF5ZXInLCBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2x5bGluZScsIGRpc3BsYXlGaWVsZDogJ3JvdXRlaWQnLCBmaWVsZHMsIG9iamVjdElkRmllbGQ6ICdPQkpFQ1RJRCcsIGhhc0F0dGFjaG1lbnRzOiBmYWxzZSwgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZyxDcmVhdGUsVXBkYXRlLERlbGV0ZScgfV0gfSkpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2FkbWluVXJsfS9hZGRUb0RlZmluaXRpb25gLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGREZWZQYXJhbXMgfSlcclxuXHJcbiAgICAgIC8vIFVwbG9hZCBmZWF0dXJlc1xyXG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHNlZ21lbnRzLmZpbHRlcigoXywgaWR4KSA9PiBub3JtYWxpemVkU2NvcmVzW2lkeF0gPiAwKS5tYXAoKHNlZykgPT4ge1xyXG4gICAgICAgIGNvbnN0IGlkeCA9IHNlZ21lbnRzLmluZGV4T2Yoc2VnKVxyXG4gICAgICAgIGNvbnN0IHJpc2tTY29yZSA9IG5vcm1hbGl6ZWRTY29yZXNbaWR4XVxyXG4gICAgICAgIGNvbnN0IHJpc2tMZXZlbCA9IHJpc2tTY29yZSA+PSA3NSA/ICdIaWdoJyA6IHJpc2tTY29yZSA+PSA0MCA/ICdNZWRpdW0nIDogcmlza1Njb3JlID4gMCA/ICdMb3cnIDogJ01pbmltYWwnXHJcbiAgICAgICAgY29uc3QgZmN0cnMgPSBPYmplY3QuZW50cmllcyhzZWcuYXR0cnMpLmZpbHRlcigoWywgdl0pID0+IHYgJiYgU3RyaW5nKHYpLnRyaW0oKSkuc2xpY2UoMCwgNSkubWFwKChbaywgdl0pID0+IGAke2t9PSR7dn1gKS5qb2luKCc7ICcpXHJcbiAgICAgICAgcmV0dXJuIHsgZ2VvbWV0cnk6IHsgcGF0aHM6IFtzZWcucGF0aF0sIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sIGF0dHJpYnV0ZXM6IHsgcm91dGVpZDogc2VnLnJvdXRlSWQsIGZyb21fbTogc2VnLmZyb21NLCB0b19tOiBzZWcudG9NLCBjcmFzaF9jb3VudDogc2VnLmNyYXNoQ291bnQsIHJpc2tfc2NvcmU6IHJpc2tTY29yZSwgcmlza19sZXZlbDogcmlza0xldmVsLCBjb250cmlidXRpbmdfZmFjdG9yczogZmN0cnMgfHwgJ0RlbnNpdHkgY2x1c3RlcicgfSB9XHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSArPSAxMDAwKSB7XHJcbiAgICAgICAgY29uc3QgYmF0Y2ggPSBmZWF0dXJlcy5zbGljZShpLCBpICsgMTAwMClcclxuICAgICAgICBzZXRQcm9ncmVzcyhgVXBsb2FkaW5nLi4uICR7TWF0aC5taW4oaSArIDEwMDAsIGZlYXR1cmVzLmxlbmd0aCl9LyR7ZmVhdHVyZXMubGVuZ3RofWApXHJcbiAgICAgICAgY29uc3QgYWRkRmVhdFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmZWF0dXJlcycsIEpTT04uc3RyaW5naWZ5KGJhdGNoKSlcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgICBhd2FpdCBmZXRjaChgJHtzZXJ2aWNlVXJsfS8wL2FkZEZlYXR1cmVzYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRmVhdFBhcmFtcyB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaGFyZVxyXG4gICAgICBjb25zdCBzaGFyZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2V2ZXJ5b25lJywgJ2ZhbHNlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdvcmcnLCAndHJ1ZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnaXRlbXMnLCB0ZW1wSXRlbUlkKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7Y29udGVudFVybH0vaXRlbXMvJHt0ZW1wSXRlbUlkfS9zaGFyZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IHNoYXJlUGFyYW1zIH0pXHJcblxyXG4gICAgICBzZXRQcm9ncmVzcygnRGlzcGxheWluZyBvbiBtYXAuLi4nKVxyXG4gICAgICBhd2FpdCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwKGAke3NlcnZpY2VVcmx9LzBgLCB0b2tlbiwgd2tpZClcclxuICAgICAgc2V0UmVzdWx0KHsgbGF5ZXJVcmw6IHNlcnZpY2VVcmwsIGl0ZW1Vcmw6IGAke3BvcnRhbFVybH0vaG9tZS9pdGVtLmh0bWw/aWQ9JHt0ZW1wSXRlbUlkfWAgfSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdbQ3Jhc2hSaXNrIEFJXSBGYWlsZWQ6JywgZXJyKVxyXG4gICAgICBzZXRFcnJvcignQUkgcHJlZGljdGlvbiBmYWlsZWQ6ICcgKyAoZXJyLm1lc3NhZ2UgfHwgZXJyKSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRSdW5uaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtjb25maWcsIHF1ZXJ5RXZlbnREYXRhLCBzZWxlY3RlZEZvbGRlcklkLCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwXSlcclxuXHJcbiAgLy8gPT09PT09PT09PT09PT09PT09PT0gTUwgUFJFRElDVElPTiA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCBydW5NTFByZWRpY3Rpb24gPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XHJcbiAgICBzZXRSdW5uaW5nKHRydWUpXHJcbiAgICBzZXRQcm9ncmVzcygnJylcclxuICAgIHNldFJlc3VsdChudWxsKVxyXG4gICAgc2V0U2hvd0V4cGxhbmF0aW9uKGZhbHNlKVxyXG4gICAgc2V0TW9kZWxJbmZvKG51bGwpXHJcbiAgICBzZXRFcnJvcihudWxsKVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHNlc3Npb24gPSBTZXNzaW9uTWFuYWdlci5nZXRJbnN0YW5jZSgpLmdldE1haW5TZXNzaW9uKCkgYXMgYW55XHJcbiAgICAgIGlmICghc2Vzc2lvbikgdGhyb3cgbmV3IEVycm9yKCdOb3Qgc2lnbmVkIGluLicpXHJcbiAgICAgIGNvbnN0IHRva2VuID0gc2Vzc2lvbi50b2tlblxyXG4gICAgICBjb25zdCBwb3J0YWxVcmwgPSAoc2Vzc2lvbi5wb3J0YWwgfHwgJycpLnJlcGxhY2UoL1xcL3NoYXJpbmdcXC9yZXN0XFwvPyQvLCAnJylcclxuICAgICAgY29uc3QgdXNlcm5hbWUgPSBzZXNzaW9uLnVzZXJuYW1lXHJcbiAgICAgIGNvbnN0IHZpZXcgPSBqaW11TWFwVmlld1JlZi5jdXJyZW50Py52aWV3IGFzIGFueVxyXG4gICAgICBpZiAoIXZpZXcpIHRocm93IG5ldyBFcnJvcignTm8gbWFwIHZpZXcgYXZhaWxhYmxlLicpXHJcbiAgICAgIGNvbnN0IHdraWQgPSB2aWV3LnNwYXRpYWxSZWZlcmVuY2U/LndraWQgfHwgMTAyMTAwXHJcblxyXG4gICAgICAvLyBTdGVwIDE6IFF1ZXJ5IGV2ZW50IGRhdGFcclxuICAgICAgc2V0UHJvZ3Jlc3MoJ1F1ZXJ5aW5nIHJvYWQgYXR0cmlidXRlIGRhdGEgZnJvbSBMUlMuLi4nKVxyXG4gICAgICBjb25zdCBldmVudERhdGEgPSBhd2FpdCBxdWVyeUV2ZW50RGF0YSgpXHJcblxyXG4gICAgICAvLyBTdGVwIDI6IFNlZ21lbnQgcm91dGVzXHJcbiAgICAgIHNldFByb2dyZXNzKCdTZWdtZW50aW5nIHJvdXRlcyBhdCAwLjUtbWlsZSBpbnRlcnZhbHMuLi4nKVxyXG4gICAgICBjb25zdCByb3V0ZUdlb21ldHJpZXMgPSByb3V0ZUdlb21ldHJpZXNSZWYuY3VycmVudFxyXG4gICAgICBpZiAocm91dGVHZW9tZXRyaWVzLnNpemUgPT09IDApIHRocm93IG5ldyBFcnJvcignTm8gcm91dGUgZ2VvbWV0cmllcy4gU2VsZWN0IHJvdXRlcyBmaXJzdC4nKVxyXG5cclxuICAgICAgY29uc3QgbW9kZWwgPSBOWV9TVEFURV9DUkFTSF9NT0RFTFxyXG5cclxuICAgICAgLy8gQnVpbGQgZXZlbnQgbG9va3VwXHJcbiAgICAgIGNvbnN0IGV2ZW50TG9va3VwID0gbmV3IE1hcDxzdHJpbmcsIE1hcDxudW1iZXIsIFJlY29yZDxzdHJpbmcsIHN0cmluZz4+PigpXHJcbiAgICAgIGNvbnN0IGV2ZW50Q29uZmlncyA9IGNvbmZpZy5ldmVudExheWVyQ29uZmlncyB8fCBbXVxyXG4gICAgICBmb3IgKGNvbnN0IGNmZyBvZiBldmVudENvbmZpZ3MpIHtcclxuICAgICAgICBjb25zdCBsYXllckVudHJpZXMgPSBldmVudERhdGEuZmlsdGVyKGUgPT4gZS5GZWF0dXJlID09PSBjZmcubmFtZSlcclxuICAgICAgICBmb3IgKGNvbnN0IGVudHJ5IG9mIGxheWVyRW50cmllcykge1xyXG4gICAgICAgICAgaWYgKGVudHJ5LlJvdXRlSUQgPT0gbnVsbCB8fCBlbnRyeS5NZWFzdXJlID09IG51bGwpIGNvbnRpbnVlXHJcbiAgICAgICAgICBjb25zdCByaWQgPSBlbnRyeS5Sb3V0ZUlEXHJcbiAgICAgICAgICBpZiAoIWV2ZW50TG9va3VwLmhhcyhyaWQpKSBldmVudExvb2t1cC5zZXQocmlkLCBuZXcgTWFwKCkpXHJcbiAgICAgICAgICBjb25zdCBtS2V5ID0gTWF0aC5yb3VuZChwYXJzZUZsb2F0KGVudHJ5Lk1lYXN1cmUpICogMikgLyAyXHJcbiAgICAgICAgICBjb25zdCByb3V0ZU1hcCA9IGV2ZW50TG9va3VwLmdldChyaWQpIVxyXG4gICAgICAgICAgaWYgKCFyb3V0ZU1hcC5oYXMobUtleSkpIHJvdXRlTWFwLnNldChtS2V5LCB7fSlcclxuICAgICAgICAgIGNvbnN0IHNlZ0RhdGEgPSByb3V0ZU1hcC5nZXQobUtleSkhXHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGF0dHIgb2YgKGNmZy5hdHRyaWJ1dGVzIHx8IFtdKSkge1xyXG4gICAgICAgICAgICBpZiAoZW50cnlbYXR0cl0gIT0gbnVsbCAmJiBTdHJpbmcoZW50cnlbYXR0cl0pLnRyaW0oKSkge1xyXG4gICAgICAgICAgICAgIHNlZ0RhdGFbYCR7Y2ZnLm5hbWV9Ojoke2F0dHJ9YF0gPSBTdHJpbmcoZW50cnlbYXR0cl0pLnRyaW0oKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTdGVwIDM6IFNjb3JlIHNlZ21lbnRzXHJcbiAgICAgIHNldFByb2dyZXNzKCdBcHBseWluZyBzdGF0ZSBjcmFzaCBtb2RlbCB3ZWlnaHRzLi4uJylcclxuICAgICAgY29uc3Qgc2VnbWVudHM6IGFueVtdID0gW11cclxuICAgICAgZm9yIChjb25zdCBbcmlkLCByZF0gb2Ygcm91dGVHZW9tZXRyaWVzLmVudHJpZXMoKSkge1xyXG4gICAgICAgIGNvbnN0IHZlcnRzID0gcmQudmVydGljZXNcclxuICAgICAgICBpZiAodmVydHMubGVuZ3RoIDwgMikgY29udGludWVcclxuICAgICAgICBjb25zdCBzdGFydE0gPSB2ZXJ0c1swXVtyZC5tSWR4XSB8fCAwXHJcbiAgICAgICAgY29uc3QgZW5kTSA9IHZlcnRzW3ZlcnRzLmxlbmd0aCAtIDFdW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICBjb25zdCB0b3RhbExlbiA9IE1hdGguYWJzKGVuZE0gLSBzdGFydE0pXHJcbiAgICAgICAgaWYgKHRvdGFsTGVuIDwgMC4xKSBjb250aW51ZVxyXG5cclxuICAgICAgICBjb25zdCBudW1TZWdzID0gTWF0aC5jZWlsKHRvdGFsTGVuIC8gMC41KVxyXG4gICAgICAgIGZvciAobGV0IHMgPSAwOyBzIDwgbnVtU2VnczsgcysrKSB7XHJcbiAgICAgICAgICBjb25zdCBmcm9tTSA9IHN0YXJ0TSArIHMgKiAwLjVcclxuICAgICAgICAgIGNvbnN0IHRvTSA9IE1hdGgubWluKHN0YXJ0TSArIChzICsgMSkgKiAwLjUsIGVuZE0pXHJcbiAgICAgICAgICBjb25zdCBtaWRNID0gKGZyb21NICsgdG9NKSAvIDJcclxuICAgICAgICAgIGNvbnN0IG1LZXkgPSBNYXRoLnJvdW5kKG1pZE0gKiAyKSAvIDJcclxuXHJcbiAgICAgICAgICBjb25zdCByb3V0ZU1hcCA9IGV2ZW50TG9va3VwLmdldChyaWQpXHJcbiAgICAgICAgICBjb25zdCBzZWdBdHRycyA9IHJvdXRlTWFwPy5nZXQobUtleSkgfHwge31cclxuXHJcbiAgICAgICAgICBsZXQgY29tcG9zaXRlU2NvcmUgPSAxLjBcclxuICAgICAgICAgIGNvbnN0IHNlZ0ZhY3RvcnM6IHN0cmluZ1tdID0gW11cclxuICAgICAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHNlZ0F0dHJzKSkge1xyXG4gICAgICAgICAgICBjb25zdCBsYXllck5hbWUgPSBrZXkuc3BsaXQoJzo6JylbMF1cclxuICAgICAgICAgICAgY29uc3QgbWFwcGluZyA9IG1vZGVsLmxyc01hcHBpbmdbbGF5ZXJOYW1lXVxyXG4gICAgICAgICAgICBpZiAoIW1hcHBpbmcpIGNvbnRpbnVlXHJcbiAgICAgICAgICAgIGxldCB3ZWlnaHQgPSAxLjBcclxuICAgICAgICAgICAgaWYgKG1hcHBpbmcuY3VzdG9tV2VpZ2h0cykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRWYWwgPSB2YWx1ZS5yZXBsYWNlKC9bXjAtOS5dL2csICcnKS5zcGxpdCgnLicpWzBdXHJcbiAgICAgICAgICAgICAgd2VpZ2h0ID0gbWFwcGluZy5jdXN0b21XZWlnaHRzW25vcm1hbGl6ZWRWYWxdIHx8IG1hcHBpbmcuY3VzdG9tV2VpZ2h0c1t2YWx1ZV0gfHwgMS4wXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWFwcGluZy52YWx1ZU1hcCkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG1hcHBlZENvbmRpdGlvbiA9IG1hcHBpbmcudmFsdWVNYXBbdmFsdWVdXHJcbiAgICAgICAgICAgICAgaWYgKG1hcHBlZENvbmRpdGlvbikge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGVDYXRlZ29yeSA9IChtb2RlbCBhcyBhbnkpW21hcHBpbmcuc3RhdGVGaWVsZF1cclxuICAgICAgICAgICAgICAgIGlmIChzdGF0ZUNhdGVnb3J5ICYmIHN0YXRlQ2F0ZWdvcnlbbWFwcGVkQ29uZGl0aW9uXSkge1xyXG4gICAgICAgICAgICAgICAgICB3ZWlnaHQgPSBzdGF0ZUNhdGVnb3J5W21hcHBlZENvbmRpdGlvbl0ud2VpZ2h0XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh3ZWlnaHQgIT09IDEuMCkge1xyXG4gICAgICAgICAgICAgIGNvbXBvc2l0ZVNjb3JlICo9IHdlaWdodFxyXG4gICAgICAgICAgICAgIGlmICh3ZWlnaHQgPiAxLjIpIHNlZ0ZhY3RvcnMucHVzaChgJHtsYXllck5hbWV9OiAke3ZhbHVlfSAoJHt3ZWlnaHQudG9GaXhlZCgxKX14KWApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBjb25zdCByaXNrU2NvcmUgPSBNYXRoLm1pbihNYXRoLnJvdW5kKE1hdGgubG9nKGNvbXBvc2l0ZVNjb3JlICsgMSkgKiA0MCksIDEwMClcclxuXHJcbiAgICAgICAgICAvLyBCdWlsZCBwYXRoXHJcbiAgICAgICAgICBjb25zdCBwYXRoOiBudW1iZXJbXVtdID0gW11cclxuICAgICAgICAgIGZvciAoY29uc3QgdiBvZiB2ZXJ0cykge1xyXG4gICAgICAgICAgICBjb25zdCB2bSA9IHZbcmQubUlkeF0gfHwgMFxyXG4gICAgICAgICAgICBpZiAodm0gPj0gZnJvbU0gJiYgdm0gPD0gdG9NKSBwYXRoLnB1c2goW3ZbMF0sIHZbMV1dKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHBhdGgubGVuZ3RoIDwgMikge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHZlcnRzLmxlbmd0aCAtIDE7IGkrKykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IG0xID0gdmVydHNbaV1bcmQubUlkeF0gfHwgMFxyXG4gICAgICAgICAgICAgIGNvbnN0IG0yID0gdmVydHNbaSArIDFdW3JkLm1JZHhdIHx8IDBcclxuICAgICAgICAgICAgICBpZiAobTEgPD0gZnJvbU0gJiYgbTIgPj0gZnJvbU0pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSAoZnJvbU0gLSBtMSkgLyAobTIgLSBtMSB8fCAxKVxyXG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKFt2ZXJ0c1tpXVswXSArIHQgKiAodmVydHNbaSArIDFdWzBdIC0gdmVydHNbaV1bMF0pLCB2ZXJ0c1tpXVsxXSArIHQgKiAodmVydHNbaSArIDFdWzFdIC0gdmVydHNbaV1bMV0pXSlcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKG0xIDw9IHRvTSAmJiBtMiA+PSB0b00pIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSAodG9NIC0gbTEpIC8gKG0yIC0gbTEgfHwgMSlcclxuICAgICAgICAgICAgICAgIHBhdGgucHVzaChbdmVydHNbaV1bMF0gKyB0ICogKHZlcnRzW2kgKyAxXVswXSAtIHZlcnRzW2ldWzBdKSwgdmVydHNbaV1bMV0gKyB0ICogKHZlcnRzW2kgKyAxXVsxXSAtIHZlcnRzW2ldWzFdKV0pXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAocGF0aC5sZW5ndGggPCAyKSBjb250aW51ZVxyXG5cclxuICAgICAgICAgIGNvbnN0IHJpc2tMZXZlbCA9IHJpc2tTY29yZSA+PSA3NSA/ICdIaWdoJyA6IHJpc2tTY29yZSA+PSA0MCA/ICdNZWRpdW0nIDogcmlza1Njb3JlID4gMCA/ICdMb3cnIDogJ01pbmltYWwnXHJcbiAgICAgICAgICBzZWdtZW50cy5wdXNoKHsgcm91dGVJZDogcmlkLCBmcm9tTSwgdG9NLCBwYXRoLCByaXNrU2NvcmUsIHJpc2tMZXZlbCwgY29udHJpYnV0aW5nRmFjdG9yczogc2VnRmFjdG9ycyB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAwKSB0aHJvdyBuZXcgRXJyb3IoJ05vIHNlZ21lbnRzIGdlbmVyYXRlZC4nKVxyXG5cclxuICAgICAgLy8gU3RvcmUgbW9kZWwgaW5mb1xyXG4gICAgICBjb25zdCB3ZWlnaHRzU3VtbWFyeTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgbnVtYmVyPj4gPSB7fVxyXG4gICAgICBmb3IgKGNvbnN0IHNlZyBvZiBzZWdtZW50cykge1xyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiBzZWcuY29udHJpYnV0aW5nRmFjdG9ycykge1xyXG4gICAgICAgICAgY29uc3QgbWF0Y2ggPSBmLm1hdGNoKC9eKC4rPyk6ICguKz8pIFxcKCguKz8peFxcKSQvKVxyXG4gICAgICAgICAgaWYgKG1hdGNoKSB7XHJcbiAgICAgICAgICAgIGlmICghd2VpZ2h0c1N1bW1hcnlbbWF0Y2hbMV1dKSB3ZWlnaHRzU3VtbWFyeVttYXRjaFsxXV0gPSB7fVxyXG4gICAgICAgICAgICB3ZWlnaHRzU3VtbWFyeVttYXRjaFsxXV1bbWF0Y2hbMl1dID0gcGFyc2VGbG9hdChtYXRjaFszXSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2V0TW9kZWxJbmZvKHsgd2VpZ2h0czogd2VpZ2h0c1N1bW1hcnksIHRvdGFsQ3Jhc2hlczogbW9kZWwudG90YWxDcmFzaGVzLCB5ZWFyczogbW9kZWwueWVhcnMgfSlcclxuXHJcbiAgICAgIC8vIFN0ZXAgNDogVXBsb2FkXHJcbiAgICAgIHNldFByb2dyZXNzKCdVcGxvYWRpbmcgc3RhdGUgTUwgcHJlZGljdGlvbiBsYXllci4uLicpXHJcbiAgICAgIGNvbnN0IGNvbnRlbnRVcmwgPSBgJHtwb3J0YWxVcmx9L3NoYXJpbmcvcmVzdC9jb250ZW50L3VzZXJzLyR7dXNlcm5hbWV9YFxyXG4gICAgICBjb25zdCBmb2xkZXJVcmwgPSBzZWxlY3RlZEZvbGRlcklkID8gYCR7Y29udGVudFVybH0vJHtzZWxlY3RlZEZvbGRlcklkfWAgOiBjb250ZW50VXJsXHJcbiAgICAgIGNvbnN0IHNlcnZpY2VOYW1lID0gYFN0YXRlTUxfQ3Jhc2hSaXNrXyR7RGF0ZS5ub3coKX1gXHJcblxyXG4gICAgICBjb25zdCBmaWVsZHMgPSBbXHJcbiAgICAgICAgeyBuYW1lOiAnT0JKRUNUSUQnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZU9JRCcsIGFsaWFzOiAnT2JqZWN0SUQnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncm91dGVpZCcsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdSb3V0ZSBJRCcsIGxlbmd0aDogMTAwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnZnJvbV9tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ0Zyb20gTWVhc3VyZScgfSxcclxuICAgICAgICB7IG5hbWU6ICd0b19tJywgdHlwZTogJ2VzcmlGaWVsZFR5cGVEb3VibGUnLCBhbGlhczogJ1RvIE1lYXN1cmUnIH0sXHJcbiAgICAgICAgeyBuYW1lOiAncmlza19zY29yZScsIHR5cGU6ICdlc3JpRmllbGRUeXBlSW50ZWdlcicsIGFsaWFzOiAnUmlzayBTY29yZSAoMC0xMDApJyB9LFxyXG4gICAgICAgIHsgbmFtZTogJ3Jpc2tfbGV2ZWwnLCB0eXBlOiAnZXNyaUZpZWxkVHlwZVN0cmluZycsIGFsaWFzOiAnUmlzayBMZXZlbCcsIGxlbmd0aDogMjAgfSxcclxuICAgICAgICB7IG5hbWU6ICdjb250cmlidXRpbmdfZmFjdG9ycycsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdDb250cmlidXRpbmcgRmFjdG9ycycsIGxlbmd0aDogNTAwIH0sXHJcbiAgICAgICAgeyBuYW1lOiAnbW9kZWxfY29uZmlkZW5jZScsIHR5cGU6ICdlc3JpRmllbGRUeXBlU3RyaW5nJywgYWxpYXM6ICdNb2RlbCBDb25maWRlbmNlJywgbGVuZ3RoOiA1MCB9XHJcbiAgICAgIF1cclxuXHJcbiAgICAgIGNvbnN0IGNyZWF0ZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdjcmVhdGVQYXJhbWV0ZXJzJywgSlNPTi5zdHJpbmdpZnkoeyBuYW1lOiBzZXJ2aWNlTmFtZSwgc2VydmljZURlc2NyaXB0aW9uOiAnQ3Jhc2ggcmlzayBmcm9tIE5ZIHN0YXRlIGNyYXNoIGRhdGFiYXNlIE1MIG1vZGVsJywgaGFzU3RhdGljRGF0YTogZmFsc2UsIG1heFJlY29yZENvdW50OiAxMDAwMCwgc3VwcG9ydGVkUXVlcnlGb3JtYXRzOiAnSlNPTicsIGNhcGFiaWxpdGllczogJ1F1ZXJ5LEVkaXRpbmcnLCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSwgaW5pdGlhbEV4dGVudDogeyB4bWluOiAtMjAwMzc1MDgsIHltaW46IC0yMDAzNzUwOCwgeG1heDogMjAwMzc1MDgsIHltYXg6IDIwMDM3NTA4LCBzcGF0aWFsUmVmZXJlbmNlOiB7IHdraWQgfSB9LCBhbGxvd0dlb21ldHJ5VXBkYXRlczogdHJ1ZSB9KSlcclxuICAgICAgY3JlYXRlUGFyYW1zLmFwcGVuZCgndGFyZ2V0VHlwZScsICdmZWF0dXJlU2VydmljZScpXHJcbiAgICAgIGNyZWF0ZVBhcmFtcy5hcHBlbmQoJ291dHB1dFR5cGUnLCAnZmVhdHVyZVNlcnZpY2UnKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCdmJywgJ2pzb24nKVxyXG4gICAgICBjcmVhdGVQYXJhbXMuYXBwZW5kKCd0b2tlbicsIHRva2VuKVxyXG4gICAgICBpZiAoc2VsZWN0ZWRGb2xkZXJJZCkgY3JlYXRlUGFyYW1zLmFwcGVuZCgnZm9sZGVySWQnLCBzZWxlY3RlZEZvbGRlcklkKVxyXG5cclxuICAgICAgY29uc3QgY3JlYXRlUmVzcCA9IGF3YWl0IGZldGNoKGAke2ZvbGRlclVybH0vY3JlYXRlU2VydmljZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IGNyZWF0ZVBhcmFtcyB9KVxyXG4gICAgICBjb25zdCBjcmVhdGVSZXN1bHQgPSBhd2FpdCBjcmVhdGVSZXNwLmpzb24oKVxyXG4gICAgICBpZiAoIWNyZWF0ZVJlc3VsdC5lbmNvZGVkU2VydmljZVVSTCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gY3JlYXRlIHNlcnZpY2U6ICcgKyBKU09OLnN0cmluZ2lmeShjcmVhdGVSZXN1bHQpKVxyXG4gICAgICBjb25zdCBzZXJ2aWNlVXJsID0gY3JlYXRlUmVzdWx0LmVuY29kZWRTZXJ2aWNlVVJMXHJcbiAgICAgIGNvbnN0IHRlbXBJdGVtSWQgPSBjcmVhdGVSZXN1bHQuaXRlbUlkXHJcblxyXG4gICAgICBjb25zdCBhZG1pblVybCA9IHNlcnZpY2VVcmwucmVwbGFjZSgnL3Jlc3Qvc2VydmljZXMvJywgJy9yZXN0L2FkbWluL3NlcnZpY2VzLycpXHJcbiAgICAgIGNvbnN0IGFkZERlZlBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBhZGREZWZQYXJhbXMuYXBwZW5kKCdhZGRUb0RlZmluaXRpb24nLCBKU09OLnN0cmluZ2lmeSh7IGxheWVyczogW3sgaWQ6IDAsIG5hbWU6ICdTdGF0ZSBNTCBSaXNrJywgdHlwZTogJ0ZlYXR1cmUgTGF5ZXInLCBnZW9tZXRyeVR5cGU6ICdlc3JpR2VvbWV0cnlQb2x5bGluZScsIGRpc3BsYXlGaWVsZDogJ3JvdXRlaWQnLCBmaWVsZHMsIG9iamVjdElkRmllbGQ6ICdPQkpFQ1RJRCcsIGhhc0F0dGFjaG1lbnRzOiBmYWxzZSwgY2FwYWJpbGl0aWVzOiAnUXVlcnksRWRpdGluZyxDcmVhdGUsVXBkYXRlLERlbGV0ZScgfV0gfSkpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIGFkZERlZlBhcmFtcy5hcHBlbmQoJ3Rva2VuJywgdG9rZW4pXHJcbiAgICAgIGF3YWl0IGZldGNoKGAke2FkbWluVXJsfS9hZGRUb0RlZmluaXRpb25gLCB7IG1ldGhvZDogJ1BPU1QnLCBib2R5OiBhZGREZWZQYXJhbXMgfSlcclxuXHJcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gc2VnbWVudHMuZmlsdGVyKHMgPT4gcy5yaXNrU2NvcmUgPiAwKS5tYXAoc2VnID0+ICh7XHJcbiAgICAgICAgZ2VvbWV0cnk6IHsgcGF0aHM6IFtzZWcucGF0aF0sIHNwYXRpYWxSZWZlcmVuY2U6IHsgd2tpZCB9IH0sXHJcbiAgICAgICAgYXR0cmlidXRlczogeyByb3V0ZWlkOiBzZWcucm91dGVJZCwgZnJvbV9tOiBzZWcuZnJvbU0sIHRvX206IHNlZy50b00sIHJpc2tfc2NvcmU6IHNlZy5yaXNrU2NvcmUsIHJpc2tfbGV2ZWw6IHNlZy5yaXNrTGV2ZWwsIGNvbnRyaWJ1dGluZ19mYWN0b3JzOiBzZWcuY29udHJpYnV0aW5nRmFjdG9ycy5qb2luKCc7ICcpLCBtb2RlbF9jb25maWRlbmNlOiBgSGlnaCAoJHttb2RlbC50b3RhbENyYXNoZXMudG9Mb2NhbGVTdHJpbmcoKX0gdHJhaW5pbmcgY3Jhc2hlcylgIH1cclxuICAgICAgfSkpXHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZlYXR1cmVzLmxlbmd0aDsgaSArPSAxMDAwKSB7XHJcbiAgICAgICAgY29uc3QgYmF0Y2ggPSBmZWF0dXJlcy5zbGljZShpLCBpICsgMTAwMClcclxuICAgICAgICBzZXRQcm9ncmVzcyhgVXBsb2FkaW5nLi4uICR7TWF0aC5taW4oaSArIDEwMDAsIGZlYXR1cmVzLmxlbmd0aCl9LyR7ZmVhdHVyZXMubGVuZ3RofWApXHJcbiAgICAgICAgY29uc3QgYWRkRmVhdFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICAgIGFkZEZlYXRQYXJhbXMuYXBwZW5kKCdmZWF0dXJlcycsIEpTT04uc3RyaW5naWZ5KGJhdGNoKSlcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgnZicsICdqc29uJylcclxuICAgICAgICBhZGRGZWF0UGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgICBhd2FpdCBmZXRjaChgJHtzZXJ2aWNlVXJsfS8wL2FkZEZlYXR1cmVzYCwgeyBtZXRob2Q6ICdQT1NUJywgYm9keTogYWRkRmVhdFBhcmFtcyB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBTaGFyZVxyXG4gICAgICBjb25zdCBzaGFyZVBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2V2ZXJ5b25lJywgJ2ZhbHNlJylcclxuICAgICAgc2hhcmVQYXJhbXMuYXBwZW5kKCdvcmcnLCAndHJ1ZScpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgnaXRlbXMnLCB0ZW1wSXRlbUlkKVxyXG4gICAgICBzaGFyZVBhcmFtcy5hcHBlbmQoJ2YnLCAnanNvbicpXHJcbiAgICAgIHNoYXJlUGFyYW1zLmFwcGVuZCgndG9rZW4nLCB0b2tlbilcclxuICAgICAgYXdhaXQgZmV0Y2goYCR7Y29udGVudFVybH0vaXRlbXMvJHt0ZW1wSXRlbUlkfS9zaGFyZWAsIHsgbWV0aG9kOiAnUE9TVCcsIGJvZHk6IHNoYXJlUGFyYW1zIH0pXHJcblxyXG4gICAgICBzZXRQcm9ncmVzcygnRGlzcGxheWluZyBvbiBtYXAuLi4nKVxyXG4gICAgICBhd2FpdCBkaXNwbGF5UHJlZGljdGlvbk9uTWFwKGAke3NlcnZpY2VVcmx9LzBgLCB0b2tlbiwgd2tpZClcclxuICAgICAgc2V0UmVzdWx0KHsgbGF5ZXJVcmw6IHNlcnZpY2VVcmwsIGl0ZW1Vcmw6IGAke3BvcnRhbFVybH0vaG9tZS9pdGVtLmh0bWw/aWQ9JHt0ZW1wSXRlbUlkfWAgfSlcclxuICAgICAgc2V0UHJvZ3Jlc3MoJycpXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKCdbU3RhdGVNTF0gRmFpbGVkOicsIGVycilcclxuICAgICAgc2V0RXJyb3IoJ01MIHByZWRpY3Rpb24gZmFpbGVkOiAnICsgKGVyci5tZXNzYWdlIHx8IGVycikpXHJcbiAgICAgIHNldFByb2dyZXNzKCcnKVxyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgc2V0UnVubmluZyhmYWxzZSlcclxuICAgIH1cclxuICB9LCBbY29uZmlnLCBxdWVyeUV2ZW50RGF0YSwgc2VsZWN0ZWRGb2xkZXJJZCwgZGlzcGxheVByZWRpY3Rpb25Pbk1hcF0pXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IFJFTkRFUiA9PT09PT09PT09PT09PT09PT09PVxyXG5cclxuICBjb25zdCByb3V0ZVNlbGVjdGlvblVJID0gKCkgPT4gKFxyXG4gICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTJweCcsIGJhY2tncm91bmQ6ICcjZjhmOWZhJywgYm9yZGVyUmFkaXVzOiAnNnB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMGUwZTAnIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCwgbWFyZ2luQm90dG9tOiAnOHB4JywgY29sb3I6ICcjMzMzJyB9fT5TZWxlY3QgUm91dGVzPC9kaXY+XHJcblxyXG4gICAgICB7LyogU2VhcmNoIG1vZGUgdGFicyAqL31cclxuICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzRweCcsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2VhcmNoTW9kZSgnaWQnKX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCcsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlcjogc2VhcmNoTW9kZSA9PT0gJ2lkJyA/ICcycHggc29saWQgIzAwNzljMScgOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzZWFyY2hNb2RlID09PSAnaWQnID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJyB9fT5CeSBSb3V0ZSBJRDwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaE1vZGUoJ25hbWUnKX0gc3R5bGU9e3sgZmxleDogMSwgcGFkZGluZzogJzVweCcsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlcjogc2VhcmNoTW9kZSA9PT0gJ25hbWUnID8gJzJweCBzb2xpZCAjMDA3OWMxJyA6ICcxcHggc29saWQgI2NjYycsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNlYXJjaE1vZGUgPT09ICduYW1lJyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicgfX0+QnkgTmFtZTwvYnV0dG9uPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldFNlYXJjaE1vZGUoJ21hcCcpfSBzdHlsZT17eyBmbGV4OiAxLCBwYWRkaW5nOiAnNXB4JywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyOiBzZWFyY2hNb2RlID09PSAnbWFwJyA/ICcycHggc29saWQgIzAwNzljMScgOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBzZWFyY2hNb2RlID09PSAnbWFwJyA/ICcjZThmNGZkJyA6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicgfX0+RHJhdyBBcmVhPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgey8qIFJvdXRlIElEIC8gTmFtZSBzZWFyY2ggKi99XHJcbiAgICAgIHsoc2VhcmNoTW9kZSA9PT0gJ2lkJyB8fCBzZWFyY2hNb2RlID09PSAnbmFtZScpICYmIChcclxuICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGdhcDogJzRweCcsIG1hcmdpbkJvdHRvbTogJzRweCcgfX0+XHJcbiAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPXtzZWFyY2hNb2RlID09PSAnaWQnID8gcm91dGVJZCA6IHJvdXRlTmFtZX0gb25DaGFuZ2U9e2UgPT4gaGFuZGxlUm91dGVTZWFyY2goZS50YXJnZXQudmFsdWUpfSBwbGFjZWhvbGRlcj17c2VhcmNoTW9kZSA9PT0gJ2lkJyA/ICdSb3V0ZSBJRC4uLicgOiAnUm91dGUgbmFtZS4uLid9IHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICc2cHggOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnIH19IC8+XHJcbiAgICAgICAgICAgIHtoYXNNYXBXaWRnZXQgJiYgKFxyXG4gICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3BpY2tpbmdGcm9tTWFwID8gY2FuY2VsUGlja0Zyb21NYXAgOiBzdGFydFBpY2tGcm9tTWFwfSBzdHlsZT17eyBwYWRkaW5nOiAnNnB4IDEwcHgnLCBib3JkZXI6ICcxcHggc29saWQgIzAwNzljMScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHBpY2tpbmdGcm9tTWFwID8gJyMwMDc5YzEnIDogJyNmZmYnLCBjb2xvcjogcGlja2luZ0Zyb21NYXAgPyAnI2ZmZicgOiAnIzAwNzljMScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzExcHgnIH19PlxyXG4gICAgICAgICAgICAgICAge3BpY2tpbmdGcm9tTWFwID8gJ0NhbmNlbCcgOiAnUGljayd9XHJcbiAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogQXV0b2NvbXBsZXRlIHN1Z2dlc3Rpb25zICovfVxyXG4gICAgICAgICAge3Nob3dTdWdnZXN0aW9ucyAmJiByb3V0ZVN1Z2dlc3Rpb25zLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgbWF4SGVpZ2h0OiAnMTAwcHgnLCBvdmVyZmxvdzogJ2F1dG8nLCBiYWNrZ3JvdW5kOiAnI2ZmZicgfX0+XHJcbiAgICAgICAgICAgICAge3JvdXRlU3VnZ2VzdGlvbnMubWFwKChyLCBpKSA9PiAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17aX0gb25DbGljaz17KCkgPT4gc2VsZWN0Um91dGUocil9IHN0eWxlPXt7IHBhZGRpbmc6ICc0cHggOHB4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTFweCcsIGJvcmRlckJvdHRvbTogJzFweCBzb2xpZCAjZWVlJyB9fSBvbk1vdXNlT3Zlcj17ZSA9PiAoZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmQgPSAnI2YwZjBmMCcpfSBvbk1vdXNlT3V0PXtlID0+IChlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZCA9ICcjZmZmJyl9PlxyXG4gICAgICAgICAgICAgICAgICB7ci5yb3V0ZUlkfSB7ci5yb3V0ZU5hbWUgPyBgKCR7ci5yb3V0ZU5hbWV9KWAgOiAnJ31cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgey8qIFJvdXRlIHBpY2sgZGlzYW1iaWd1YXRpb24gKi99XHJcbiAgICAgICAgICB7cm91dGVQaWNrQ2FuZGlkYXRlcyAmJiAoXHJcbiAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBwYWRkaW5nOiAnOHB4JywgYmFja2dyb3VuZDogJyNlOGY0ZmQnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgZm9udFdlaWdodDogNjAwLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19Pk11bHRpcGxlIHJvdXRlcyBmb3VuZCDigJQgc2VsZWN0IG9uZTo8L2Rpdj5cclxuICAgICAgICAgICAgICB7cm91dGVQaWNrQ2FuZGlkYXRlcy5tYXAoKGMsIGkpID0+IChcclxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBvbkNsaWNrPXsoKSA9PiB7IHNldFJvdXRlSWQoYy5yb3V0ZUlkKTsgc2V0Um91dGVOYW1lKGMucm91dGVOYW1lKTsgc2V0Um91dGVQaWNrQ2FuZGlkYXRlcyhudWxsKTsgZmV0Y2hSb3V0ZU1lYXN1cmVzKGMucm91dGVJZCkgfX0gc3R5bGU9e3sgcGFkZGluZzogJzRweCA2cHgnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyUmFkaXVzOiAnM3B4JyB9fSBvbk1vdXNlT3Zlcj17ZSA9PiAoZS5jdXJyZW50VGFyZ2V0LnN0eWxlLmJhY2tncm91bmQgPSAnI2NjZTVmNycpfSBvbk1vdXNlT3V0PXtlID0+IChlLmN1cnJlbnRUYXJnZXQuc3R5bGUuYmFja2dyb3VuZCA9ICd0cmFuc3BhcmVudCcpfT5cclxuICAgICAgICAgICAgICAgICAge2Mucm91dGVOYW1lfSAoe2Mucm91dGVJZH0pXHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICApKX1cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgIHsvKiBNZWFzdXJlIHJhbmdlIGRpc3BsYXkgKi99XHJcbiAgICAgICAgICB7ZnJvbU1lYXN1cmUgJiYgdG9NZWFzdXJlICYmIChcclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM1NTUnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgIE1lYXN1cmVzOiB7ZnJvbU1lYXN1cmV9IOKAkyB7dG9NZWFzdXJlfVxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogRHJhdyBwb2x5Z29uIG1vZGUgKi99XHJcbiAgICAgIHtzZWFyY2hNb2RlID09PSAnbWFwJyAmJiAoXHJcbiAgICAgICAgPGRpdj5cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e3N0YXJ0RHJhd0FyZWF9IGRpc2FibGVkPXtkcmF3aW5nfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICMwMDc5YzEnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiBkcmF3aW5nID8gJyNlOGY0ZmQnIDogJyNmZmYnLCBjb2xvcjogJyMwMDc5YzEnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNTAwIH19PlxyXG4gICAgICAgICAgICB7ZHJhd2luZyA/ICdEcmF3aW5nLi4uIGNsaWNrIHRvIGNvbXBsZXRlJyA6IGBEcmF3IFBvbHlnb24gb24gTWFwJHttYXBSb3V0ZXMubGVuZ3RoID4gMCA/IGAgKCR7bWFwUm91dGVzLmxlbmd0aH0gcm91dGVzIGZvdW5kKWAgOiAnJ31gfVxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICB7bWFwUm91dGVzLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzMzMycgfX0+XHJcbiAgICAgICAgICAgICAgPHN0cm9uZz57c2VsZWN0ZWRNYXBSb3V0ZUlkcy5zaXplfTwvc3Ryb25nPiBvZiB7bWFwUm91dGVzLmxlbmd0aH0gcm91dGVzIHNlbGVjdGVkXHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxuXHJcbiAgLy8gUmVzdWx0IHZpZXdcclxuICBjb25zdCByZXN1bHRVSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEycHgnIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PlxyXG4gICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMzZweCcgfX0+eydcXHUyNzA1J308L3NwYW4+XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzEzcHgnLCBjb2xvcjogJyMzMzMnLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBtYXJnaW46ICcwIDAgMTJweCcgfX0+XHJcbiAgICAgICAgUHJlZGljdGlvbiBjb21wbGV0ZSEgUmlzayBsYXllciBhZGRlZCB0byBtYXAuXHJcbiAgICAgIDwvcD5cclxuXHJcbiAgICAgIHsvKiBMZWdlbmQgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEwcHgnLCBiYWNrZ3JvdW5kOiAnI2Y1ZjVmNScsIGJvcmRlclJhZGl1czogJzRweCcsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PlxyXG4gICAgICAgIHtbeyBjb2xvcjogJyMzODhlM2MnLCB3aWR0aDogMywgbGFiZWw6ICdMb3cgKDEtMjUpJyB9LCB7IGNvbG9yOiAnI2ZiYzAyZCcsIHdpZHRoOiAzLCBsYWJlbDogJ01lZGl1bSAoMjYtNTApJyB9LCB7IGNvbG9yOiAnI2Y1N2MwMCcsIHdpZHRoOiA0LCBsYWJlbDogJ01lZGl1bS1IaWdoICg1MS03NSknIH0sIHsgY29sb3I6ICcjZDMyZjJmJywgd2lkdGg6IDUsIGxhYmVsOiAnSGlnaCAoNzYtMTAwKScgfV0ubWFwKChpdGVtLCBpKSA9PiAoXHJcbiAgICAgICAgICA8ZGl2IGtleT17aX0gc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnNnB4JywgbWFyZ2luQm90dG9tOiBpIDwgMyA/ICc0cHgnIDogMCB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyB3aWR0aDogJzIwcHgnLCBoZWlnaHQ6IGAke2l0ZW0ud2lkdGh9cHhgLCBiYWNrZ3JvdW5kOiBpdGVtLmNvbG9yIH19IC8+XHJcbiAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcgfX0+e2l0ZW0ubGFiZWx9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgKSl9XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAge3Jlc3VsdD8uaXRlbVVybCAmJiA8YSBocmVmPXtyZXN1bHQuaXRlbVVybH0gdGFyZ2V0PVwiX2JsYW5rXCIgcmVsPVwibm9vcGVuZXIgbm9yZWZlcnJlclwiIHN0eWxlPXt7IGRpc3BsYXk6ICdibG9jaycsIHRleHRBbGlnbjogJ2NlbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzAwNzljMScsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19Pk9wZW4gaW4gUG9ydGFsPC9hPn1cclxuXHJcbiAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBnYXA6ICc4cHgnLCBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd0V4cGxhbmF0aW9uKCFzaG93RXhwbGFuYXRpb24pfSBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDE2cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzZhMWI5YScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IHNob3dFeHBsYW5hdGlvbiA/ICcjZjNlNWY1JyA6ICcjZmZmJywgY29sb3I6ICcjNmExYjlhJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgIHtzaG93RXhwbGFuYXRpb24gPyAnSGlkZScgOiAnV2h5Pyd9XHJcbiAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRNb2RlKCdjaG9vc2UnKTsgc2V0UmVzdWx0KG51bGwpOyBzZXRQcm9ncmVzcygnJyk7IHNldFNob3dFeHBsYW5hdGlvbihmYWxzZSkgfX0gc3R5bGU9e3sgcGFkZGluZzogJzhweCAyMHB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6ICcjNmExYjlhJywgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5Eb25lPC9idXR0b24+XHJcbiAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgey8qIEV4cGxhbmF0aW9uIHBhbmVsICovfVxyXG4gICAgICB7c2hvd0V4cGxhbmF0aW9uICYmIG1vZGUgPT09ICdhaScgJiYgZmFjdG9ycyAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICcxMnB4JywgcGFkZGluZzogJzEycHgnLCBiYWNrZ3JvdW5kOiAnI2Y4ZjlmYScsIGJvcmRlclJhZGl1czogJzZweCcsIGZvbnRTaXplOiAnMTFweCcsIG1heEhlaWdodDogJzI1MHB4Jywgb3ZlcmZsb3dZOiAnYXV0bycgfX0+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRXZWlnaHQ6IDcwMCwgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5SaXNrIEZhY3RvciBBbmFseXNpczwvZGl2PlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICBLZXJuZWwtZGVuc2l0eSBzY29yaW5nIChyYWRpdXM6IHtmYWN0b3JzLmtlcm5lbFJhZGl1c30gc2VnbWVudHMpLiBTZWdtZW50czoge2ZhY3RvcnMudG90YWxTZWdtZW50c30gdG90YWwsIHtmYWN0b3JzLnNlZ21lbnRzV2l0aENyYXNoZXN9IHdpdGggY3Jhc2hlcywge2ZhY3RvcnMuaGlnaFJpc2tDb3VudH0gaGlnaC1yaXNrLlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7ZmFjdG9ycy50b3BIaWdoUmlza1NlZ21lbnRzPy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8c3Ryb25nPlRvcCBIaWdoLVJpc2sgU2VnbWVudHM6PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLCBmb250U2l6ZTogJzEwcHgnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkPjx0ciBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2VlZScgfX0+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JyB9fT5Sb3V0ZTwvdGg+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcgfX0+TWlsZXM8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PkNyYXNoZXM8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PlNjb3JlPC90aD48L3RyPjwvdGhlYWQ+XHJcbiAgICAgICAgICAgICAgICA8dGJvZHk+e2ZhY3RvcnMudG9wSGlnaFJpc2tTZWdtZW50cy5zbGljZSgwLCA1KS5tYXAoKHM6IGFueSwgaTogbnVtYmVyKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9Pjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcgfX0+e3Mucm91dGVJZD8uc3Vic3RyaW5nKDAsIDE1KX08L3RkPjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcsIHRleHRBbGlnbjogJ3JpZ2h0JyB9fT57cy5mcm9tTT8udG9GaXhlZCgxKX0te3MudG9NPy50b0ZpeGVkKDEpfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PntzLmNyYXNoQ291bnR9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCB0ZXh0QWxpZ246ICdyaWdodCcsIGNvbG9yOiAnI2QzMmYyZicsIGZvbnRXZWlnaHQ6IDcwMCB9fT57cy5yaXNrU2NvcmV9PC90ZD48L3RyPlxyXG4gICAgICAgICAgICAgICAgKSl9PC90Ym9keT5cclxuICAgICAgICAgICAgICA8L3RhYmxlPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7c2hvd0V4cGxhbmF0aW9uICYmIG1vZGUgPT09ICdtbCcgJiYgbW9kZWxJbmZvICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpblRvcDogJzEycHgnLCBwYWRkaW5nOiAnMTJweCcsIGJhY2tncm91bmQ6ICcjZmFmNWZjJywgYm9yZGVyUmFkaXVzOiAnNnB4JywgZm9udFNpemU6ICcxMXB4JywgbWF4SGVpZ2h0OiAnMjgwcHgnLCBvdmVyZmxvd1k6ICdhdXRvJyB9fT5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZm9udFdlaWdodDogNzAwLCBtYXJnaW5Cb3R0b206ICc4cHgnLCBjb2xvcjogJyM0YTE0OGMnIH19PlN0YXRlIERhdGEgTW9kZWwgRXhwbGFuYXRpb248L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz5NZXRob2Q6PC9zdHJvbmc+IFdlaWdodC1vZi1FdmlkZW5jZSBzY29yaW5nIGZyb20ge21vZGVsSW5mby50b3RhbENyYXNoZXM/LnRvTG9jYWxlU3RyaW5nKCl9IHJlYWwgTlkgc3RhdGUgY3Jhc2ggcmVjb3JkcyAoe21vZGVsSW5mby55ZWFyc30pLiBFYWNoIHJvYWQgY29uZGl0aW9uIGdldHMgYSBjcmFzaCBtdWx0aXBsaWVyIGJhc2VkIG9uIGl0cyBzdGF0aXN0aWNhbCBhc3NvY2lhdGlvbiB3aXRoIGZhdGFsIGNyYXNoZXMuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgPHN0cm9uZz52cy4gQUkgKERlbnNpdHkpOjwvc3Ryb25nPiBBSSBmaW5kcyBleGlzdGluZyBob3RzcG90cy4gTUwgcHJlZGljdHMgPGVtPm5ldzwvZW0+IHJpc2sgZnJvbSByb2FkIGNoYXJhY3RlcmlzdGljcyBhbG9uZSDigJQgZGFuZ2Vyb3VzIGNvbmRpdGlvbnMgd2hlcmUgbm8gY3Jhc2hlcyBoYXZlIGJlZW4gcmVwb3J0ZWQgeWV0LlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICB7T2JqZWN0LmtleXMobW9kZWxJbmZvLndlaWdodHMgfHwge30pLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgICAgICA8ZGl2PlxyXG4gICAgICAgICAgICAgIDxzdHJvbmc+VG9wIFJpc2sgTXVsdGlwbGllcnMgRm91bmQ6PC9zdHJvbmc+XHJcbiAgICAgICAgICAgICAgPHRhYmxlIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIGJvcmRlckNvbGxhcHNlOiAnY29sbGFwc2UnLCBmb250U2l6ZTogJzEwcHgnLCBtYXJnaW5Ub3A6ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHRoZWFkPjx0ciBzdHlsZT17eyBiYWNrZ3JvdW5kOiAnI2VlZScgfX0+PHRoIHN0eWxlPXt7IHBhZGRpbmc6ICczcHgnLCB0ZXh0QWxpZ246ICdsZWZ0JyB9fT5GYWN0b3I8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAnbGVmdCcgfX0+VmFsdWU8L3RoPjx0aCBzdHlsZT17eyBwYWRkaW5nOiAnM3B4JywgdGV4dEFsaWduOiAncmlnaHQnIH19PldlaWdodDwvdGg+PC90cj48L3RoZWFkPlxyXG4gICAgICAgICAgICAgICAgPHRib2R5PntPYmplY3QuZW50cmllcyhtb2RlbEluZm8ud2VpZ2h0cykuZmxhdE1hcCgoW2ZpZWxkLCB2YWxzXTogW3N0cmluZywgYW55XSkgPT4gT2JqZWN0LmVudHJpZXModmFscykubWFwKChbdmFsLCB3XTogW3N0cmluZywgYW55XSkgPT4gKHsgZmllbGQsIHZhbCwgdyB9KSkpLmZpbHRlcigoeDogYW55KSA9PiB4LncgPiAxLjApLnNvcnQoKGE6IGFueSwgYjogYW55KSA9PiBiLncgLSBhLncpLnNsaWNlKDAsIDEwKS5tYXAoKHg6IGFueSwgaTogbnVtYmVyKSA9PiAoXHJcbiAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9Pjx0ZCBzdHlsZT17eyBwYWRkaW5nOiAnMnB4IDNweCcgfX0+e3guZmllbGR9PC90ZD48dGQgc3R5bGU9e3sgcGFkZGluZzogJzJweCAzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+e3gudmFsfTwvdGQ+PHRkIHN0eWxlPXt7IHBhZGRpbmc6ICcycHggM3B4JywgdGV4dEFsaWduOiAncmlnaHQnLCBjb2xvcjogeC53ID49IDIgPyAnI2QzMmYyZicgOiAnI2Y1N2MwMCcsIGZvbnRXZWlnaHQ6IDcwMCB9fT57eC53LnRvRml4ZWQoMSl9eDwvdGQ+PC90cj5cclxuICAgICAgICAgICAgICAgICkpfTwvdGJvZHk+XHJcbiAgICAgICAgICAgICAgPC90YWJsZT5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICApfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBtYXJnaW5Ub3A6ICc4cHgnLCBwYWRkaW5nOiAnNnB4JywgYmFja2dyb3VuZDogJyNmZmYzY2QnLCBib3JkZXJSYWRpdXM6ICczcHgnLCBmb250U2l6ZTogJzEwcHgnLCBjb2xvcjogJyM4NTY0MDQnIH19PlxyXG4gICAgICAgICAgICA8c3Ryb25nPk5vdGU6PC9zdHJvbmc+IFNlZ21lbnRzIHdpdGggbXVsdGlwbGUgaGlnaC13ZWlnaHQgZmFjdG9ycyBjb21wb3VuZCAobXVsdGlwbHkpLiBBIGN1cnZlICsgaGlnaCBzcGVlZCArIG5vIHNob3VsZGVyID0gdmVyeSBoaWdoIHJpc2sgZXZlbiB3aXRoIG5vIGxvY2FsIGNyYXNoIGhpc3RvcnkuXHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuICAgIDwvZGl2PlxyXG4gIClcclxuXHJcbiAgLy8gUnVubmluZyBzdGF0ZSBVSVxyXG4gIGNvbnN0IHJ1bm5pbmdVSSA9ICgpID0+IChcclxuICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzIwcHgnLCB0ZXh0QWxpZ246ICdjZW50ZXInIH19PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTFweCcsIGNvbG9yOiAnIzU1NScsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+e3Byb2dyZXNzfTwvZGl2PlxyXG4gICAgICA8ZGl2IHN0eWxlPXt7IGhlaWdodDogJzRweCcsIGJhY2tncm91bmQ6ICcjZTBlMGUwJywgYm9yZGVyUmFkaXVzOiAnMnB4Jywgb3ZlcmZsb3c6ICdoaWRkZW4nIH19PlxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgaGVpZ2h0OiAnMTAwJScsIGJhY2tncm91bmQ6IG1vZGUgPT09ICdhaScgPyAnIzdiMWZhMicgOiAnIzZhMWI5YScsIHdpZHRoOiAnNjAlJywgYW5pbWF0aW9uOiAncHVsc2UgMS41cyBpbmZpbml0ZScgfX0gLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApXHJcblxyXG4gIC8vID09PT09PT09PT09PT09PT09PT09IE1BSU4gTEFZT1VUID09PT09PT09PT09PT09PT09PT09XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsIGhlaWdodDogJzEwMCUnLCBvdmVyZmxvdzogJ2F1dG8nLCBmb250U2l6ZTogJzEzcHgnLCBwYWRkaW5nOiAnMTJweCcsIGJveFNpemluZzogJ2JvcmRlci1ib3gnIH19PlxyXG5cclxuICAgICAge2hhc01hcFdpZGdldCAmJiAoXHJcbiAgICAgICAgPEppbXVNYXBWaWV3Q29tcG9uZW50IHVzZU1hcFdpZGdldElkPXsocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LlswXSB8fCAocHJvcHMudXNlTWFwV2lkZ2V0SWRzIGFzIGFueSk/LmZpcnN0Py4oKX0gb25BY3RpdmVWaWV3Q2hhbmdlPXtvbkFjdGl2ZVZpZXdDaGFuZ2V9IC8+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICA8aDUgc3R5bGU9e3sgbWFyZ2luOiAnMCAwIDEycHgnLCBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+Q3Jhc2ggUmlzayBQcmVkaWN0aW9uIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMTBweCcsIGZvbnRXZWlnaHQ6IDQwMCwgY29sb3I6ICcjOTk5JyB9fT4odjIwMjYuMDUuMTMpPC9zcGFuPjwvaDU+XHJcblxyXG4gICAgICB7LyogRXJyb3IgZGlzcGxheSAqL31cclxuICAgICAge2Vycm9yICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzhweCcsIHBhZGRpbmc6ICc4cHggMTBweCcsIGJhY2tncm91bmQ6ICcjZmZlYmVlJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjYzYyODI4JyB9fT5cclxuICAgICAgICAgIHtlcnJvcn1cclxuICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9eygpID0+IHNldEVycm9yKG51bGwpfSBzdHlsZT17eyBmbG9hdDogJ3JpZ2h0JywgYmFja2dyb3VuZDogJ25vbmUnLCBib3JkZXI6ICdub25lJywgY29sb3I6ICcjYzYyODI4JywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRXZWlnaHQ6IDcwMCB9fT57J1xcdTAwRDcnfTwvYnV0dG9uPlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qID09PT09PT09PT09PT09PT09PT09IENIT09TRSBNT0RFID09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7bW9kZSA9PT0gJ2Nob29zZScgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMTJweCcgfX0+XHJcblxyXG4gICAgICAgICAgey8qIEFJIE9wdGlvbiAqL31cclxuICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzE2cHgnLCBiYWNrZ3JvdW5kOiAnI2YzZTVmNScsIGJvcmRlclJhZGl1czogJzhweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2U5M2Q4JyB9fT5cclxuICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBqdXN0aWZ5Q29udGVudDogJ3NwYWNlLWJldHdlZW4nLCBtYXJnaW5Cb3R0b206ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJywgZ2FwOiAnOHB4JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGZvbnRTaXplOiAnMjBweCcgfX0+eydcXHVEODNFXFx1RERFMCd9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNzAwLCBjb2xvcjogJyM0YTE0OGMnIH19PkFJIFByZWRpY3Rpb248L3NwYW4+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0U2hvd0FJSGVscCghc2hvd0FJSGVscCl9IHN0eWxlPXt7IHdpZHRoOiAnMjRweCcsIGhlaWdodDogJzI0cHgnLCBib3JkZXI6ICcxcHggc29saWQgIzdiMWZhMicsIGJvcmRlclJhZGl1czogJzUwJScsIGJhY2tncm91bmQ6IHNob3dBSUhlbHAgPyAnIzdiMWZhMicgOiAnI2ZmZicsIGNvbG9yOiBzaG93QUlIZWxwID8gJyNmZmYnIDogJyM3YjFmYTInLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNzAwLCBsaW5lSGVpZ2h0OiAnMjJweCcsIHRleHRBbGlnbjogJ2NlbnRlcicsIHBhZGRpbmc6IDAgfX0+PzwvYnV0dG9uPlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPHAgc3R5bGU9e3sgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNjY2JywgbWFyZ2luOiAnMCAwIDEwcHgnIH19Pktlcm5lbC1kZW5zaXR5IHNjb3JpbmcgZnJvbSBjcmFzaCBjbHVzdGVycyArIHJvYWQgYXR0cmlidXRlczwvcD5cclxuICAgICAgICAgICAge3Nob3dBSUhlbHAgJiYgKFxyXG4gICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzEwcHgnLCBiYWNrZ3JvdW5kOiAnI2ZmZicsIGJvcmRlclJhZGl1czogJzRweCcsIGZvbnRTaXplOiAnMTFweCcsIGxpbmVIZWlnaHQ6ICcxLjcnLCBtYXJnaW5Cb3R0b206ICcxMHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNlMWJlZTcnIH19PlxyXG4gICAgICAgICAgICAgICAgPHN0cm9uZz5Ib3cgaXQgd29ya3M6PC9zdHJvbmc+PGJyIC8+XHJcbiAgICAgICAgICAgICAgICAxLiBZb3Ugc2VsZWN0IHJvdXRlcyAoYnkgSUQsIG5hbWUsIG1hcCBjbGljaywgb3IgZHJhdyBhcmVhKTxiciAvPlxyXG4gICAgICAgICAgICAgICAgMi4gVGhlIHdpZGdldCBxdWVyaWVzIDxlbT5jcmFzaCBldmVudHM8L2VtPiBhbmQgPGVtPnJvYWQgYXR0cmlidXRlIGV2ZW50czwvZW0+IGZyb20geW91ciBMUlM8YnIgLz5cclxuICAgICAgICAgICAgICAgIDMuIFJvdXRlcyBhcmUgZGl2aWRlZCBpbnRvIDAuNS1taWxlIHNlZ21lbnRzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA0LiBDcmFzaCBjb3VudHMgcGVyIHNlZ21lbnQgYXJlIGNvbXB1dGVkPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA1LiBBIGtlcm5lbC1kZW5zaXR5IGFsZ29yaXRobSBzcHJlYWRzIGluZmx1ZW5jZSBmcm9tIGhpZ2gtY3Jhc2ggc2VnbWVudHMgdG8gbmVpZ2hib3JzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA2LiBSb2FkIGF0dHJpYnV0ZXMgKGN1cnZlcywgZ3JhZGVzLCBldGMuKSBlbnJpY2ggdGhlIGFuYWx5c2lzPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA3LiBBIGNvbG9yLWNvZGVkIHJpc2sgbGF5ZXIgaXMgcHVibGlzaGVkIHRvIHlvdXIgcG9ydGFsIGFuZCBhZGRlZCB0byB0aGUgbWFwPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+QmVzdCBmb3I6PC9zdHJvbmc+IEZpbmRpbmcgZXhpc3RpbmcgY3Jhc2ggaG90c3BvdHMgYW5kIG5lYXJieSByaXNrIHpvbmVzLlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICApfVxyXG4gICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRNb2RlKCdhaScpfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBwYWRkaW5nOiAnMTBweCcsIGJvcmRlcjogJ25vbmUnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBiYWNrZ3JvdW5kOiAnIzdiMWZhMicsIGNvbG9yOiAnI2ZmZicsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA2MDAgfX0+XHJcbiAgICAgICAgICAgICAgUnVuIEFJIFByZWRpY3Rpb25cclxuICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuXHJcbiAgICAgICAgICB7LyogTUwgT3B0aW9uICovfVxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnMTZweCcsIGJhY2tncm91bmQ6ICcjZWRlN2Y2JywgYm9yZGVyUmFkaXVzOiAnOHB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNiMzlkZGInIH19PlxyXG4gICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnc3BhY2UtYmV0d2VlbicsIG1hcmdpbkJvdHRvbTogJzhweCcgfX0+XHJcbiAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc4cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgZm9udFNpemU6ICcyMHB4JyB9fT57J1xcdUQ4M0RcXHVEQ0NBJ308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA3MDAsIGNvbG9yOiAnIzMxMWI5MicgfX0+TUwgUHJlZGljdGlvbjwvc3Bhbj5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZXRTaG93TUxIZWxwKCFzaG93TUxIZWxwKX0gc3R5bGU9e3sgd2lkdGg6ICcyNHB4JywgaGVpZ2h0OiAnMjRweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjNmExYjlhJywgYm9yZGVyUmFkaXVzOiAnNTAlJywgYmFja2dyb3VuZDogc2hvd01MSGVscCA/ICcjNmExYjlhJyA6ICcjZmZmJywgY29sb3I6IHNob3dNTEhlbHAgPyAnI2ZmZicgOiAnIzZhMWI5YScsIGN1cnNvcjogJ3BvaW50ZXInLCBmb250U2l6ZTogJzEzcHgnLCBmb250V2VpZ2h0OiA3MDAsIGxpbmVIZWlnaHQ6ICcyMnB4JywgdGV4dEFsaWduOiAnY2VudGVyJywgcGFkZGluZzogMCB9fT4/PC9idXR0b24+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8cCBzdHlsZT17eyBmb250U2l6ZTogJzExcHgnLCBjb2xvcjogJyM2NjYnLCBtYXJnaW46ICcwIDAgMTBweCcgfX0+UHJlLWNvbXB1dGVkIHdlaWdodHMgZnJvbSAxLjVNIE5ZIFN0YXRlIGNyYXNoIHJlY29yZHM8L3A+XHJcbiAgICAgICAgICAgIHtzaG93TUxIZWxwICYmIChcclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IHBhZGRpbmc6ICcxMHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzExcHgnLCBsaW5lSGVpZ2h0OiAnMS43JywgbWFyZ2luQm90dG9tOiAnMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjZDFjNGU5JyB9fT5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+SG93IGl0IHdvcmtzOjwvc3Ryb25nPjxiciAvPlxyXG4gICAgICAgICAgICAgICAgMS4gWW91IHNlbGVjdCByb3V0ZXMgKGJ5IElELCBuYW1lLCBtYXAgY2xpY2ssIG9yIGRyYXcgYXJlYSk8YnIgLz5cclxuICAgICAgICAgICAgICAgIDIuIFRoZSB3aWRnZXQgcXVlcmllcyA8ZW0+cm9hZCBjaGFyYWN0ZXJpc3RpYyBldmVudHM8L2VtPiBmcm9tIHlvdXIgTFJTIChjdXJ2ZXMsIGdyYWRlcywgc3BlZWQgbGltaXRzLCBsYW5lIGNvdW50cywgc2hvdWxkZXJzLCBldGMuKTxiciAvPlxyXG4gICAgICAgICAgICAgICAgMy4gRWFjaCAwLjUtbWlsZSBzZWdtZW50J3Mgcm9hZCBjb25kaXRpb25zIGFyZSBtYXRjaGVkIHRvIHByZS1jb21wdXRlZCByaXNrIG11bHRpcGxpZXJzIGZyb20gMSw1MjUsMTIzIHJlYWwgTlkgc3RhdGUgY3Jhc2ggcmVjb3JkczxiciAvPlxyXG4gICAgICAgICAgICAgICAgNC4gRmFjdG9ycyBjb21wb3VuZCDigJQgYSBjdXJ2ZSArIGhpZ2ggc3BlZWQgKyBubyBzaG91bGRlciA9IHZlcnkgaGlnaCByaXNrPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA1LiBBIGNvbG9yLWNvZGVkIHByZWRpY3Rpb24gbGF5ZXIgaXMgcHVibGlzaGVkIGFuZCBhZGRlZCB0byB0aGUgbWFwPGJyIC8+XHJcbiAgICAgICAgICAgICAgICA8YnIgLz5cclxuICAgICAgICAgICAgICAgIDxzdHJvbmc+QmVzdCBmb3I6PC9zdHJvbmc+IFByZWRpY3RpbmcgPGVtPm5ldzwvZW0+IHJpc2sgZnJvbSByb2FkIGNoYXJhY3RlcmlzdGljcyBhbG9uZSDigJQgZmluZGluZyBkYW5nZXJvdXMgY29uZGl0aW9ucyBldmVuIHdoZXJlIG5vIGNyYXNoZXMgaGF2ZSBiZWVuIHJlcG9ydGVkIHlldC5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gc2V0TW9kZSgnbWwnKX0gc3R5bGU9e3sgd2lkdGg6ICcxMDAlJywgcGFkZGluZzogJzEwcHgnLCBib3JkZXI6ICdub25lJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyM2YTFiOWEnLCBjb2xvcjogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxM3B4JywgZm9udFdlaWdodDogNjAwIH19PlxyXG4gICAgICAgICAgICAgIFJ1biBNTCBQcmVkaWN0aW9uXHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT0gQUkgLyBNTCBXT1JLRkxPVyA9PT09PT09PT09PT09PT09PT09PSAqL31cclxuICAgICAgeyhtb2RlID09PSAnYWknIHx8IG1vZGUgPT09ICdtbCcpICYmICFyZXN1bHQgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJywgZ2FwOiAnMTJweCcgfX0+XHJcblxyXG4gICAgICAgICAgey8qIEJhY2sgYnV0dG9uICovfVxyXG4gICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4geyBzZXRNb2RlKCdjaG9vc2UnKTsgc2V0RXJyb3IobnVsbCk7IHNldFByb2dyZXNzKCcnKSB9fSBkaXNhYmxlZD17cnVubmluZ30gc3R5bGU9e3sgYWxpZ25TZWxmOiAnZmxleC1zdGFydCcsIHBhZGRpbmc6ICc0cHggMTBweCcsIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJywgYm9yZGVyUmFkaXVzOiAnNHB4JywgYmFja2dyb3VuZDogJyNmZmYnLCBjdXJzb3I6ICdwb2ludGVyJywgZm9udFNpemU6ICcxMXB4JywgY29sb3I6ICcjNTU1JyB9fT5cclxuICAgICAgICAgICAgeydcXHUyMTkwJ30gQmFja1xyXG4gICAgICAgICAgPC9idXR0b24+XHJcblxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17eyBwYWRkaW5nOiAnOHB4IDEycHgnLCBiYWNrZ3JvdW5kOiBtb2RlID09PSAnYWknID8gJyNmM2U1ZjUnIDogJyNlZGU3ZjYnLCBib3JkZXJSYWRpdXM6ICc0cHgnLCBmb250U2l6ZTogJzEycHgnLCBmb250V2VpZ2h0OiA2MDAsIGNvbG9yOiBtb2RlID09PSAnYWknID8gJyM0YTE0OGMnIDogJyMzMTFiOTInIH19PlxyXG4gICAgICAgICAgICB7bW9kZSA9PT0gJ2FpJyA/ICdcXHVEODNFXFx1RERFMCBBSSBQcmVkaWN0aW9uJyA6ICdcXHVEODNEXFx1RENDQSBNTCBQcmVkaWN0aW9uJ31cclxuICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgIHsvKiBSb3V0ZSBzZWxlY3Rpb24gKi99XHJcbiAgICAgICAgICB7IXJ1bm5pbmcgJiYgcm91dGVTZWxlY3Rpb25VSSgpfVxyXG5cclxuICAgICAgICAgIHsvKiBSdW4gYnV0dG9uICovfVxyXG4gICAgICAgICAgeyFydW5uaW5nICYmIChcclxuICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17bW9kZSA9PT0gJ2FpJyA/IHJ1bkFJUHJlZGljdGlvbiA6IHJ1bk1MUHJlZGljdGlvbn0gZGlzYWJsZWQ9e3J1bm5pbmcgfHwgKHNlYXJjaE1vZGUgIT09ICdtYXAnICYmICFyb3V0ZUlkLnRyaW0oKSkgfHwgKHNlYXJjaE1vZGUgPT09ICdtYXAnICYmIHNlbGVjdGVkTWFwUm91dGVJZHMuc2l6ZSA9PT0gMCl9IHN0eWxlPXt7IHdpZHRoOiAnMTAwJScsIHBhZGRpbmc6ICcxMnB4JywgYm9yZGVyOiAnbm9uZScsIGJvcmRlclJhZGl1czogJzRweCcsIGJhY2tncm91bmQ6IChydW5uaW5nIHx8IChzZWFyY2hNb2RlICE9PSAnbWFwJyAmJiAhcm91dGVJZC50cmltKCkpIHx8IChzZWFyY2hNb2RlID09PSAnbWFwJyAmJiBzZWxlY3RlZE1hcFJvdXRlSWRzLnNpemUgPT09IDApKSA/ICcjYWFhJyA6IChtb2RlID09PSAnYWknID8gJyM3YjFmYTInIDogJyM2YTFiOWEnKSwgY29sb3I6ICcjZmZmJywgY3Vyc29yOiAncG9pbnRlcicsIGZvbnRTaXplOiAnMTNweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgICAgICB7bW9kZSA9PT0gJ2FpJyA/ICdSdW4gQUkgUHJlZGljdGlvbicgOiAnUnVuIE1MIFByZWRpY3Rpb24nfVxyXG4gICAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgey8qIFByb2dyZXNzICovfVxyXG4gICAgICAgICAge3J1bm5pbmcgJiYgcnVubmluZ1VJKCl9XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogPT09PT09PT09PT09PT09PT09PT0gUkVTVUxUID09PT09PT09PT09PT09PT09PT09ICovfVxyXG4gICAgICB7cmVzdWx0ICYmIHJlc3VsdFVJKCl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFdpZGdldFxyXG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9