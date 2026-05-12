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

/***/ "./your-extensions/widgets/road-log/src/lrs-utils/lrs-service.ts"
/*!***********************************************************************!*\
  !*** ./your-extensions/widgets/road-log/src/lrs-utils/lrs-service.ts ***!
  \***********************************************************************/
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

/***/ "./your-extensions/widgets/road-log/src/lrs-utils/utils/known-domains.ts"
/*!*******************************************************************************!*\
  !*** ./your-extensions/widgets/road-log/src/lrs-utils/utils/known-domains.ts ***!
  \*******************************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   KNOWN_DOMAINS: () => (/* binding */ KNOWN_DOMAINS),
/* harmony export */   resolveKnownDomain: () => (/* binding */ resolveKnownDomain)
/* harmony export */ });
// Well-known coded value domains for common LRS fields.
// These provide human-readable labels when the service lacks coded value domains.
/**
 * FHWA Functional Classification System
 * https://www.fhwa.dot.gov/planning/processes/statewide/related/highway_functional_classifications/
 */
const FHWA_FUNCTIONAL_CLASS = {
    '0': 'Unknown',
    '1': 'Rural Interstate',
    '2': 'Rural Principal Arterial',
    '3': 'Rural Minor Arterial',
    '4': 'Rural Major Collector',
    '5': 'Rural Minor Collector',
    '6': 'Rural Local',
    '7': 'Urban Interstate',
    '8': 'Urban Freeway/Expressway',
    '9': 'Urban Principal Arterial',
    '10': 'Urban Minor Arterial',
    '11': 'Urban Collector',
    '12': 'Urban Local'
};
/**
 * Map of field names to their known domain lookups.
 * Field name matching is case-sensitive.
 */
const KNOWN_DOMAINS = {
    functionalclasstype: FHWA_FUNCTIONAL_CLASS,
    functionalclass: FHWA_FUNCTIONAL_CLASS,
    functional_class: FHWA_FUNCTIONAL_CLASS,
    func_class: FHWA_FUNCTIONAL_CLASS,
    FunctionalClassType: FHWA_FUNCTIONAL_CLASS,
    FunctionalClass: FHWA_FUNCTIONAL_CLASS
};
/**
 * Resolve a raw code to a display label using known domains.
 * Returns null if no mapping exists.
 */
function resolveKnownDomain(fieldName, code) {
    var _a;
    const domain = KNOWN_DOMAINS[fieldName];
    if (!domain)
        return null;
    const key = String(code);
    return (_a = domain[key]) !== null && _a !== void 0 ? _a : null;
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
/*!******************************************************************!*\
  !*** ./your-extensions/widgets/road-log/src/setting/setting.tsx ***!
  \******************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-ui/advanced/setting-components */ "jimu-ui/advanced/setting-components");
/* harmony import */ var _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lrs-utils/lrs-service */ "./your-extensions/widgets/road-log/src/lrs-utils/lrs-service.ts");
/* harmony import */ var _lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lrs-utils/utils/known-domains */ "./your-extensions/widgets/road-log/src/lrs-utils/utils/known-domains.ts");
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
    var _a, _b;
    const config = props.config;
    const [networkLayers, setNetworkLayers] = useState([]);
    const [discoveredLayers, setDiscoveredLayers] = useState([]);
    const [loadingService, setLoadingService] = useState(false);
    const [serviceError, setServiceError] = useState(null);
    // System fields that shouldn't appear in the attribute picker
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
    // Load service info when URL changes
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
            // Discover network layer route ID field
            if (nets.length > 0) {
                const selectedNetId = (_b = (_a = props.config) === null || _a === void 0 ? void 0 : _a.networkLayerId) !== null && _b !== void 0 ? _b : nets[0].id;
                try {
                    const netDetail = yield lrs.getNetworkLayerInfo(selectedNetId);
                    const netRouteField = netDetail.routeIdFieldName || 'routeid';
                    const netRouteNameField = netDetail.routeNameFieldName || null;
                    updateConfig('networkRouteIdField', netRouteField);
                    if (netRouteNameField) {
                        updateConfig('networkRouteNameField', netRouteNameField);
                    }
                }
                catch (_f) {
                    // fallback
                }
            }
            // Fetch field info for each event layer, filtering out all-null fields
            const layers = [];
            for (const el of (info.eventLayers || [])) {
                try {
                    const detail = yield lrs.getEventLayerInfo(el.id);
                    const userFields = (detail.fields || []).filter(f => !SYSTEM_FIELDS.includes(f.name) &&
                        f.type !== 'esriFieldTypeOID' &&
                        f.type !== 'esriFieldTypeGeometry');
                    // Query a sample of features to find which fields actually have data
                    let fieldsWithData = null;
                    try {
                        const baseMapUrl = (((_c = props.config) === null || _c === void 0 ? void 0 : _c.lrsServiceUrl) || '').replace(/\/exts\/LRServer$/i, '');
                        const sampleUrl = `${baseMapUrl}/${el.id}/query`;
                        const sampleParams = { where: '1=1', outFields: '*', returnGeometry: 'false', resultRecordCount: '50', f: 'json' };
                        const sample = yield lrs.queryFeaturesDirect(sampleUrl, sampleParams);
                        if (((_d = sample === null || sample === void 0 ? void 0 : sample.features) === null || _d === void 0 ? void 0 : _d.length) > 0) {
                            fieldsWithData = new Set();
                            for (const feat of sample.features) {
                                for (const [key, val] of Object.entries(feat.attributes || {})) {
                                    if (val !== null && val !== undefined && val !== '') {
                                        fieldsWithData.add(key);
                                    }
                                }
                            }
                        }
                    }
                    catch ( /* ignore sample query failure */_g) { /* ignore sample query failure */ }
                    const filteredFields = fieldsWithData
                        ? userFields.filter(f => fieldsWithData.has(f.name))
                        : userFields;
                    layers.push({
                        id: el.id,
                        name: el.name,
                        type: el.type,
                        fields: filteredFields.map(f => ({ name: f.name, alias: f.alias || f.name, type: f.type })),
                        routeIdFieldName: detail.routeIdFieldName || 'routeid',
                        fromMeasureFieldName: detail.fromMeasureFieldName || 'frommeasure',
                        toMeasureFieldName: detail.toMeasureFieldName || null
                    });
                }
                catch (_h) {
                    layers.push({
                        id: el.id, name: el.name, type: el.type, fields: [],
                        routeIdFieldName: 'routeid', fromMeasureFieldName: 'frommeasure', toMeasureFieldName: null
                    });
                }
            }
            setDiscoveredLayers(layers);
            // Auto-enable default layers if no event layers configured yet
            const existing = ((_e = props.config) === null || _e === void 0 ? void 0 : _e.eventLayerConfigs) || [];
            if (existing.length === 0 && layers.length > 0) {
                const DEFAULT_LAYERS = ['functional class', 'median type', 'speed limit', 'crash', 'grade', 'curve'];
                const autoConfigs = [];
                for (const layer of layers) {
                    const nameLower = layer.name.toLowerCase();
                    if (DEFAULT_LAYERS.some(d => nameLower.includes(d))) {
                        const overrides = {};
                        for (const f of layer.fields) {
                            if (_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name]) {
                                overrides[f.name] = _lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name];
                            }
                        }
                        autoConfigs.push(Object.assign(Object.assign({ layerId: layer.id, name: layer.name, type: layer.type, attributes: layer.fields.filter(f => !!_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name]).map(f => f.name), routeIdField: layer.routeIdFieldName }, (layer.type.includes('Point')
                            ? { measureField: layer.fromMeasureFieldName }
                            : { fromMeasureField: layer.fromMeasureFieldName, toMeasureField: layer.toMeasureFieldName || undefined })), (Object.keys(overrides).length > 0 ? { domainOverrides: overrides } : {})));
                    }
                }
                if (autoConfigs.length > 0) {
                    updateConfig('eventLayerConfigs', autoConfigs);
                }
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
    // Auto-load service info on mount if URL is set
    useEffect(() => {
        if ((config === null || config === void 0 ? void 0 : config.lrsServiceUrl) && discoveredLayers.length === 0) {
            loadServiceInfo(config.lrsServiceUrl);
        }
    }, []);
    const handleUrlChange = useCallback((e) => {
        updateConfig('lrsServiceUrl', e.target.value);
    }, [updateConfig]);
    const handleUrlBlur = useCallback(() => {
        if (config === null || config === void 0 ? void 0 : config.lrsServiceUrl) {
            loadServiceInfo(config.lrsServiceUrl);
        }
    }, [config === null || config === void 0 ? void 0 : config.lrsServiceUrl, loadServiceInfo]);
    const handleNetworkChange = useCallback((e) => {
        updateConfig('networkLayerId', parseInt(e.target.value, 10));
    }, [updateConfig]);
    // Toggle an event layer on/off — auto-select all user fields when enabling
    const toggleEventLayer = useCallback((layer) => {
        const current = (config === null || config === void 0 ? void 0 : config.eventLayerConfigs) ? [...config.eventLayerConfigs] : [];
        const idx = current.findIndex(e => e.layerId === layer.id);
        if (idx >= 0) {
            current.splice(idx, 1);
        }
        else {
            // Build domainOverrides from known domains
            const overrides = {};
            for (const f of layer.fields) {
                if (_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name]) {
                    overrides[f.name] = _lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name];
                }
            }
            const newLayer = Object.assign(Object.assign({ layerId: layer.id, name: layer.name, type: layer.type, attributes: layer.fields.filter(f => !!_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name]).map(f => f.name), routeIdField: layer.routeIdFieldName }, (layer.type.includes('Point')
                ? { measureField: layer.fromMeasureFieldName }
                : { fromMeasureField: layer.fromMeasureFieldName, toMeasureField: layer.toMeasureFieldName || undefined })), (Object.keys(overrides).length > 0 ? { domainOverrides: overrides } : {}));
            current.push(newLayer);
        }
        updateConfig('eventLayerConfigs', current);
    }, [config === null || config === void 0 ? void 0 : config.eventLayerConfigs, updateConfig]);
    // Toggle an individual attribute field within an event layer
    const toggleAttribute = useCallback((layerId, fieldName) => {
        const current = (config === null || config === void 0 ? void 0 : config.eventLayerConfigs) ? [...config.eventLayerConfigs] : [];
        const idx = current.findIndex(e => e.layerId === layerId);
        if (idx < 0)
            return;
        const attrs = [...current[idx].attributes];
        const attrIdx = attrs.indexOf(fieldName);
        if (attrIdx >= 0) {
            attrs.splice(attrIdx, 1);
        }
        else {
            attrs.push(fieldName);
        }
        current[idx] = Object.assign(Object.assign({}, current[idx]), { attributes: attrs });
        updateConfig('eventLayerConfigs', current);
    }, [config === null || config === void 0 ? void 0 : config.eventLayerConfigs, updateConfig]);
    // Select all / Clear all for a layer
    const selectAllAttributes = useCallback((layerId, allFieldNames) => {
        const current = (config === null || config === void 0 ? void 0 : config.eventLayerConfigs) ? [...config.eventLayerConfigs] : [];
        const idx = current.findIndex(e => e.layerId === layerId);
        if (idx < 0)
            return;
        current[idx] = Object.assign(Object.assign({}, current[idx]), { attributes: [...allFieldNames] });
        updateConfig('eventLayerConfigs', current);
    }, [config === null || config === void 0 ? void 0 : config.eventLayerConfigs, updateConfig]);
    const clearAllAttributes = useCallback((layerId) => {
        const current = (config === null || config === void 0 ? void 0 : config.eventLayerConfigs) ? [...config.eventLayerConfigs] : [];
        const idx = current.findIndex(e => e.layerId === layerId);
        if (idx < 0)
            return;
        current[idx] = Object.assign(Object.assign({}, current[idx]), { attributes: [] });
        updateConfig('eventLayerConfigs', current);
    }, [config === null || config === void 0 ? void 0 : config.eventLayerConfigs, updateConfig]);
    // Per-layer field search
    const [fieldSearch, setFieldSearch] = useState({});
    const getFieldSearch = (layerId) => fieldSearch[layerId] || '';
    const setLayerFieldSearch = (layerId, val) => {
        setFieldSearch(prev => (Object.assign(Object.assign({}, prev), { [layerId]: val })));
    };
    const handlePrecisionChange = useCallback((e) => {
        const val = parseInt(e.target.value, 10);
        updateConfig('measurePrecision', isNaN(val) ? 3 : val);
    }, [updateConfig]);
    const handleMapWidgetChange = useCallback((useMapWidgetIds) => {
        props.onSettingChange({
            id: props.id,
            useMapWidgetIds
        });
    }, [props]);
    // Get the config entry for a discovered layer
    const getLayerConfig = (layerId) => {
        return ((config === null || config === void 0 ? void 0 : config.eventLayerConfigs) || [])
            .find(e => e.layerId === layerId);
    };
    return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "p-3", style: { fontSize: '13px', color: '#fff' } },
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("h5", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#fff' } }, "Road Log Settings"),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "LRS Service URL"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "The REST endpoint for your Linear Referencing System (LRS) service. Click \"Load Service\" to discover available network and event layers."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "text", value: (config === null || config === void 0 ? void 0 : config.lrsServiceUrl) || '', onChange: handleUrlChange, onBlur: handleUrlBlur, style: inputStyle, placeholder: "https://.../MapServer/exts/LRServer" }),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: handleUrlBlur, style: loadBtnStyle },
                loadingService ? 'Loading...' : 'Load Service',
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "Map Widget (for polygon select)"),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "Choose the map widget used for spatial selection. This enables the polygon-select tool to pick routes from the map."),
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_1__.MapWidgetSelector, { onSelect: handleMapWidgetChange, useMapWidgetIds: props.useMapWidgetIds }))),
            serviceError && jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: errorStyle }, serviceError)),
        networkLayers.length > 1 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "Network Layer"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "Select which LRS network to query routes from. Only needed if your service has multiple networks."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("select", { value: (_a = config === null || config === void 0 ? void 0 : config.networkLayerId) !== null && _a !== void 0 ? _a : '', onChange: handleNetworkChange, style: inputStyle },
                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("option", { value: "" }, "-- Select Network --"),
                networkLayers.map(n => (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("option", { key: n.id, value: n.id }, n.name)))))),
        discoveredLayers.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "Event Layers & Attributes"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "Check a layer to include it in the road log report. When enabled, choose which attribute fields to display. Fields marked with \u2605 have domain labels that will show descriptive text instead of codes."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: eventListStyle }, discoveredLayers.map(layer => {
                const layerCfg = getLayerConfig(layer.id);
                const isSelected = !!layerCfg;
                const typeTag = layer.type.includes('Point') ? '(Marker)' : '(Linear)';
                return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { key: layer.id, style: { marginBottom: '10px' } },
                    jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center' } },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "checkbox", checked: isSelected, onChange: () => toggleEventLayer(layer) }),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { marginLeft: '4px', fontSize: '12px', fontWeight: 600, color: '#000' } }, layer.name),
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: '#555', marginLeft: '6px', fontSize: '11px' } }, typeTag)),
                    isSelected && layer.fields.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldPickerStyle },
                        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' } },
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "text", placeholder: "Search fields...", value: getFieldSearch(layer.id), onChange: (e) => setLayerFieldSearch(layer.id, e.target.value), style: { flex: 1, padding: '2px 6px', fontSize: '11px', border: '1px solid #ccc', borderRadius: '3px', color: '#000', backgroundColor: '#fff' } }),
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => selectAllAttributes(layer.id, layer.fields.map(f => f.name)), style: miniBtn }, "All"),
                            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("button", { type: "button", onClick: () => clearAllAttributes(layer.id), style: miniBtn }, "None")),
                        layer.fields
                            .filter(f => {
                            const q = getFieldSearch(layer.id).toLowerCase();
                            if (!q)
                                return true;
                            return (f.alias || f.name).toLowerCase().includes(q) || f.name.toLowerCase().includes(q);
                        })
                            .map(f => {
                            var _a, _b;
                            const isAttrSelected = (_b = (_a = layerCfg === null || layerCfg === void 0 ? void 0 : layerCfg.attributes) === null || _a === void 0 ? void 0 : _a.includes(f.name)) !== null && _b !== void 0 ? _b : false;
                            const hasDomain = !!(_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name]);
                            return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { key: f.name, style: { display: 'block', fontSize: '11px', padding: '2px 0', cursor: 'pointer', color: '#000' } },
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "checkbox", checked: isAttrSelected, onChange: () => toggleAttribute(layer.id, f.name), style: { marginRight: '4px' } }),
                                f.alias || f.name,
                                jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: '#555', marginLeft: '4px', fontSize: '10px' } }, typeTag),
                                hasDomain && jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("span", { style: { color: '#0079c1', marginLeft: '4px', fontSize: '10px' } }, "\u2605 labels")));
                        }))),
                    isSelected && layer.fields.length === 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: Object.assign(Object.assign({}, fieldPickerStyle), { color: '#888', fontStyle: 'italic' }) }, "No user attributes available"))));
            })))),
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldGroupStyle },
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("label", { style: labelStyle }, "Measure Precision (decimal places)"),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("p", { style: descStyle }, "Number of decimal places to display for measure values (e.g. 3 = 12.345 miles)."),
            jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("input", { type: "number", min: 0, max: 10, value: (_b = config === null || config === void 0 ? void 0 : config.measurePrecision) !== null && _b !== void 0 ? _b : 3, onChange: handlePrecisionChange, style: Object.assign(Object.assign({}, inputStyle), { width: '80px' }) }))));
};
// Styles
const fieldGroupStyle = {
    marginBottom: '14px'
};
const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '4px',
    color: '#fff'
};
const descStyle = {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.75)',
    margin: '0 0 6px 0',
    lineHeight: '1.4'
};
const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    fontSize: '12px',
    border: '1px solid #999',
    borderRadius: '4px',
    boxSizing: 'border-box',
    color: '#000',
    backgroundColor: '#fff'
};
const miniBtn = {
    padding: '2px 6px',
    fontSize: '10px',
    border: '1px solid #999',
    borderRadius: '3px',
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
};
const loadBtnStyle = {
    marginTop: '4px',
    padding: '4px 12px',
    fontSize: '12px',
    border: '1px solid #999',
    borderRadius: '3px',
    backgroundColor: '#fff',
    color: '#000',
    cursor: 'pointer'
};
const eventListStyle = {
    maxHeight: '300px',
    overflow: 'auto',
    border: '1px solid #999',
    borderRadius: '4px',
    padding: '6px',
    backgroundColor: '#fff',
    color: '#000'
};
const fieldPickerStyle = {
    marginLeft: '20px',
    marginTop: '4px',
    padding: '4px 8px',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '3px',
    color: '#000'
};
const errorStyle = {
    marginTop: '4px',
    fontSize: '11px',
    color: '#d83020'
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Setting);
function __set_webpack_public_path__(url) { __webpack_require__.p = url; }

})();

/******/ 	return __webpack_exports__;
/******/ })()

			);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9yb2FkLWxvZy9kaXN0L3NldHRpbmcvc2V0dGluZy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFJLFlBQVksR0FBRyxDQUFDO0FBRXBCOzs7R0FHRztBQUNILFNBQVMsWUFBWSxDQUFFLEdBQVcsRUFBRSxNQUE4QjtJQUNoRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLE1BQU0sWUFBWSxHQUFHLFdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLFlBQVksRUFBRSxFQUFFO1FBQzlELE1BQU0sQ0FBQyxRQUFRLEdBQUcsWUFBWTtRQUU5QixNQUFNLEVBQUUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUU7UUFDakQsTUFBTSxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxFQUFFO1FBRWhDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxHQUFHLEdBQUcsU0FBUztRQUV0QixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7WUFDbkIsT0FBUSxNQUFjLENBQUMsWUFBWSxDQUFDO1lBQ3BDLElBQUksTUFBTSxDQUFDLFVBQVU7Z0JBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQzlELENBQUMsQ0FFQTtRQUFDLE1BQWMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFO1lBQzdDLE9BQU8sRUFBRTtZQUNULElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNmLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxlQUFlLENBQUMsQ0FBQztZQUMxRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxDQUFD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LE9BQU87QUFFZCxTQUFTLDJCQUEyQixDQUFDLEdBQUcsSUFBSSxxQkFBdUIsR0FBRyxHQUFHLEVBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9yb2FkLWxvZy9zcmMvbHJzLXV0aWxzL2xycy1zZXJ2aWNlLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9yb2FkLWxvZy9zcmMvbHJzLXV0aWxzL3V0aWxzL2tub3duLWRvbWFpbnMudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtdWkvYWR2YW5jZWQvc2V0dGluZy1jb21wb25lbnRzXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9yb2FkLWxvZy9zcmMvc2V0dGluZy9zZXR0aW5nLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBMUlMgUkVTVCBBUEkgU2VydmljZSB3cmFwcGVyXHJcbi8vIFVzZXMgSlNPTlAgdG8gYnlwYXNzIENPUlMgaXNzdWVzIHdpdGggbWlzY29uZmlndXJlZCBzZXJ2ZXJzIChkdXBsaWNhdGUgQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luIGhlYWRlcnMpXHJcbmltcG9ydCB0eXBlIHtcclxuICBMcnNTZXJ2aWNlSW5mbyxcclxuICBOZXR3b3JrTGF5ZXJJbmZvLFxyXG4gIEV2ZW50TGF5ZXJJbmZvLFxyXG4gIE1lYXN1cmVUb0dlb21ldHJ5TG9jYXRpb24sXHJcbiAgTWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQsXHJcbiAgR2VvbWV0cnlUb01lYXN1cmVSZXN1bHQsXHJcbiAgUXVlcnlBdHRyaWJ1dGVTZXRQYXJhbXMsXHJcbiAgRmVhdHVyZVNldFJlc3VsdFxyXG59IGZyb20gJy4vdHlwZXMnXHJcblxyXG5sZXQganNvbnBDb3VudGVyID0gMFxyXG5cclxuLyoqXHJcbiAqIEpTT05QIHJlcXVlc3Qg4oCUIGJ5cGFzc2VzIENPUlMgZW50aXJlbHkgYnkgaW5qZWN0aW5nIGEgPHNjcmlwdD4gdGFnLlxyXG4gKiBBcmNHSVMgUkVTVCBBUEkgc3VwcG9ydHMgSlNPTlAgdmlhIHRoZSAnY2FsbGJhY2snIHBhcmFtZXRlci5cclxuICovXHJcbmZ1bmN0aW9uIGpzb25wUmVxdWVzdCAodXJsOiBzdHJpbmcsIHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8YW55PiB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgIGNvbnN0IGNhbGxiYWNrTmFtZSA9IGBfbHJzX2NiXyR7RGF0ZS5ub3coKX1fJHtqc29ucENvdW50ZXIrK31gXHJcbiAgICBwYXJhbXMuY2FsbGJhY2sgPSBjYWxsYmFja05hbWVcclxuXHJcbiAgICBjb25zdCBxcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocGFyYW1zKS50b1N0cmluZygpXHJcbiAgICBjb25zdCBzY3JpcHRVcmwgPSBgJHt1cmx9PyR7cXN9YFxyXG5cclxuICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpXHJcbiAgICBzY3JpcHQuc3JjID0gc2NyaXB0VXJsXHJcblxyXG4gICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHtcclxuICAgICAgZGVsZXRlICh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdXHJcbiAgICAgIGlmIChzY3JpcHQucGFyZW50Tm9kZSkgc2NyaXB0LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2NyaXB0KVxyXG4gICAgfVxyXG5cclxuICAgIDsod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIGlmIChkYXRhLmVycm9yKSB7XHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yLm1lc3NhZ2UgfHwgJ1JlcXVlc3QgZXJyb3InKSlcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXNvbHZlKGRhdGEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzY3JpcHQub25lcnJvciA9ICgpID0+IHtcclxuICAgICAgY2xlYW51cCgpXHJcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0pTT05QIHJlcXVlc3QgZmFpbGVkJykpXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKCh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdKSB7XHJcbiAgICAgICAgY2xlYW51cCgpXHJcbiAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUmVxdWVzdCB0aW1lb3V0JykpXHJcbiAgICAgIH1cclxuICAgIH0sIDMwMDAwKVxyXG5cclxuICAgIDsod2luZG93IGFzIGFueSlbY2FsbGJhY2tOYW1lXSA9IChkYXRhOiBhbnkpID0+IHtcclxuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVyKVxyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKGRhdGEuZXJyb3IubWVzc2FnZSB8fCAnUmVxdWVzdCBlcnJvcicpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KVxyXG4gIH0pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBXcmFwcGVyIGFyb3VuZCBBcmNHSVMgTFJTIFJFU1QgQVBJIChMUlNlcnZlciBleHRlbnNpb24pLlxyXG4gKiBVc2VzIEpTT05QIGZvciBhbGwgcmVxdWVzdHMgdG8gYXZvaWQgQ09SUyBpc3N1ZXMuXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgTHJzU2VydmljZSB7XHJcbiAgcHJpdmF0ZSBiYXNlVXJsOiBzdHJpbmdcclxuICBwcml2YXRlIHRva2VuOiBzdHJpbmcgfCBudWxsXHJcblxyXG4gIGNvbnN0cnVjdG9yIChiYXNlVXJsOiBzdHJpbmcsIHRva2VuPzogc3RyaW5nKSB7XHJcbiAgICAvLyBFbnN1cmUgbm8gdHJhaWxpbmcgc2xhc2hcclxuICAgIHRoaXMuYmFzZVVybCA9IGJhc2VVcmwucmVwbGFjZSgvXFwvKyQvLCAnJylcclxuICAgIHRoaXMudG9rZW4gPSB0b2tlbiB8fCBudWxsXHJcbiAgfVxyXG5cclxuICBzZXRUb2tlbiAodG9rZW46IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy50b2tlbiA9IHRva2VuXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBMUlMgc2VydmljZSBtZXRhZGF0YSAobmV0d29yayBsYXllcnMsIGV2ZW50IGxheWVycywgZXRjLilcclxuICAgKi9cclxuICBhc3luYyBnZXRTZXJ2aWNlSW5mbyAoKTogUHJvbWlzZTxMcnNTZXJ2aWNlSW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxMcnNTZXJ2aWNlSW5mbz4oJycpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBGZXRjaCBkZXRhaWxlZCBpbmZvIGZvciBhIG5ldHdvcmsgbGF5ZXIgKGZpZWxkcywgbWVhc3VyZSBwcmVjaXNpb24sIGV0Yy4pXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0TmV0d29ya0xheWVySW5mbyAobGF5ZXJJZDogbnVtYmVyKTogUHJvbWlzZTxOZXR3b3JrTGF5ZXJJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PE5ldHdvcmtMYXllckluZm8+KGAvbmV0d29ya0xheWVycy8ke2xheWVySWR9YClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGRldGFpbGVkIGluZm8gZm9yIGFuIGV2ZW50IGxheWVyXHJcbiAgICovXHJcbiAgYXN5bmMgZ2V0RXZlbnRMYXllckluZm8gKGxheWVySWQ6IG51bWJlcik6IFByb21pc2U8RXZlbnRMYXllckluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8RXZlbnRMYXllckluZm8+KGAvZXZlbnRMYXllcnMvJHtsYXllcklkfWApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IHJvdXRlIElEICsgbWVhc3VyZXMgdG8gbWFwIGdlb21ldHJ5XHJcbiAgICovXHJcbiAgYXN5bmMgbWVhc3VyZVRvR2VvbWV0cnkgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIGxvY2F0aW9uczogTWVhc3VyZVRvR2VvbWV0cnlMb2NhdGlvbltdLFxyXG4gICAgb3V0U1I/OiBhbnlcclxuICApOiBQcm9taXNlPE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0PiB7XHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkobG9jYXRpb25zKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAob3V0U1IpIHtcclxuICAgICAgcGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkob3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PE1lYXN1cmVUb0dlb21ldHJ5UmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L21lYXN1cmVUb0dlb21ldHJ5YCxcclxuICAgICAgcGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZXJ0IG1hcCBnZW9tZXRyeSAocG9pbnQpIHRvIHJvdXRlICsgbWVhc3VyZVxyXG4gICAqL1xyXG4gIGFzeW5jIGdlb21ldHJ5VG9NZWFzdXJlIChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBsb2NhdGlvbnM6IEFycmF5PHsgZ2VvbWV0cnk6IGFueSB9PixcclxuICAgIG91dFNSPzogYW55XHJcbiAgKTogUHJvbWlzZTxHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdD4ge1xyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KGxvY2F0aW9ucyksXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKG91dFNSKSB7XHJcbiAgICAgIHBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KG91dFNSKVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9nZW9tZXRyeVRvTWVhc3VyZWAsXHJcbiAgICAgIHBhcmFtc1xyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRHluYW1pYyBzZWdtZW50YXRpb24gb3ZlcmxheSDigJQgcXVlcnlBdHRyaWJ1dGVTZXRcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUF0dHJpYnV0ZVNldCAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgcGFyYW1zOiBRdWVyeUF0dHJpYnV0ZVNldFBhcmFtc1xyXG4gICk6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgY29uc3QgcmVxdWVzdFBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShwYXJhbXMubG9jYXRpb25zKSxcclxuICAgICAgYXR0cmlidXRlU2V0OiBKU09OLnN0cmluZ2lmeShwYXJhbXMuYXR0cmlidXRlU2V0KSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAocGFyYW1zLm91dFNSKSB7XHJcbiAgICAgIHJlcXVlc3RQYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShwYXJhbXMub3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEZlYXR1cmVTZXRSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vcXVlcnlBdHRyaWJ1dGVTZXRgLFxyXG4gICAgICByZXF1ZXN0UGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBTdGFuZGFyZCBmZWF0dXJlIHF1ZXJ5IGFnYWluc3QgYSBtYXAgc2VydmljZSBsYXllciAoZm9yIFJvYWQgTG9nIGluZGl2aWR1YWwgZXZlbnQgcXVlcmllcylcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUZlYXR1cmVzIChcclxuICAgIG1hcFNlcnZpY2VVcmw6IHN0cmluZyxcclxuICAgIGxheWVySWQ6IG51bWJlcixcclxuICAgIHdoZXJlOiBzdHJpbmcsXHJcbiAgICBvdXRGaWVsZHM6IHN0cmluZ1tdID0gWycqJ11cclxuICApOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIC8vIFRoZSBtYXAgc2VydmljZSBVUkwgaXMgdGhlIHBhcmVudCBvZiBMUlNlcnZlciBleHRlbnNpb25cclxuICAgIC8vIGUuZy4gLi4uL01hcFNlcnZlci8wL3F1ZXJ5XHJcbiAgICBjb25zdCBiYXNlTWFwVXJsID0gdGhpcy5iYXNlVXJsLnJlcGxhY2UoL1xcL2V4dHNcXC9MUlNlcnZlciQvaSwgJycpXHJcbiAgICBjb25zdCB1cmwgPSBgJHtiYXNlTWFwVXJsfS8ke2xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgd2hlcmUsXHJcbiAgICAgIG91dEZpZWxkczogb3V0RmllbGRzLmpvaW4oJywnKSxcclxuICAgICAgcmV0dXJuR2VvbWV0cnk6ICdmYWxzZScsXHJcbiAgICAgIGY6ICdqc29uJ1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgcGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBwYXJhbXMpXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEaXJlY3QgcXVlcnkgd2l0aCBhcmJpdHJhcnkgcGFyYW1zIChmb3Igc3BhdGlhbCBxdWVyaWVzIHZpYSBKU09OUClcclxuICAgKi9cclxuICBhc3luYyBxdWVyeUZlYXR1cmVzRGlyZWN0ICh1cmw6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcbiAgICBwYXJhbXMuZiA9IHBhcmFtcy5mIHx8ICdqc29uJ1xyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFF1ZXJ5IHJvdXRlcyBvbiBhIG5ldHdvcmsgbGF5ZXIgKGZvciByb3V0ZSBwaWNrZXIgYXV0b2NvbXBsZXRlKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5Um91dGVzIChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBzZWFyY2hUZXh0OiBzdHJpbmcsXHJcbiAgICByb3V0ZUlkRmllbGQ6IHN0cmluZyxcclxuICAgIHJvdXRlTmFtZUZpZWxkOiBzdHJpbmcgfCBudWxsLFxyXG4gICAgbWF4UmVzdWx0czogbnVtYmVyID0gMTBcclxuICApOiBQcm9taXNlPEFycmF5PHsgcm91dGVJZDogc3RyaW5nOyByb3V0ZU5hbWU6IHN0cmluZyB8IG51bGwgfT4+IHtcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSB0aGlzLmJhc2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7bmV0d29ya0xheWVySWR9L3F1ZXJ5YFxyXG5cclxuICAgIGNvbnN0IHNlYXJjaEZpZWxkID0gcm91dGVOYW1lRmllbGQgfHwgcm91dGVJZEZpZWxkXHJcbiAgICBjb25zdCB3aGVyZSA9IGBVUFBFUigke3NlYXJjaEZpZWxkfSkgTElLRSBVUFBFUignJHtzZWFyY2hUZXh0LnJlcGxhY2UoLycvZywgXCInJ1wiKX0lJylgXHJcbiAgICBjb25zdCBvdXRGaWVsZHMgPSByb3V0ZU5hbWVGaWVsZFxyXG4gICAgICA/IFtyb3V0ZUlkRmllbGQsIHJvdXRlTmFtZUZpZWxkXVxyXG4gICAgICA6IFtyb3V0ZUlkRmllbGRdXHJcblxyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICB3aGVyZSxcclxuICAgICAgb3V0RmllbGRzOiBvdXRGaWVsZHMuam9pbignLCcpLFxyXG4gICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgcmVzdWx0UmVjb3JkQ291bnQ6IG1heFJlc3VsdHMudG9TdHJpbmcoKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QganNvbiA9IGF3YWl0IGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuXHJcbiAgICBjb25zdCBhbGwgPSAoanNvbi5mZWF0dXJlcyB8fCBbXSkubWFwKChmOiBhbnkpID0+ICh7XHJcbiAgICAgIHJvdXRlSWQ6IGYuYXR0cmlidXRlc1tyb3V0ZUlkRmllbGRdLFxyXG4gICAgICByb3V0ZU5hbWU6IHJvdXRlTmFtZUZpZWxkID8gZi5hdHRyaWJ1dGVzW3JvdXRlTmFtZUZpZWxkXSA6IG51bGxcclxuICAgIH0pKVxyXG4gICAgLy8gRGVkdXBsaWNhdGUgYnkgcm91dGVJZFxyXG4gICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQ8c3RyaW5nPigpXHJcbiAgICByZXR1cm4gYWxsLmZpbHRlcigocjogYW55KSA9PiB7XHJcbiAgICAgIGlmIChzZWVuLmhhcyhyLnJvdXRlSWQpKSByZXR1cm4gZmFsc2VcclxuICAgICAgc2Vlbi5hZGQoci5yb3V0ZUlkKVxyXG4gICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIC8vIC0tLSBQcml2YXRlIGhlbHBlcnMgLS0tXHJcblxyXG4gIHByaXZhdGUgYXN5bmMgcmVxdWVzdDxUPiAocGF0aDogc3RyaW5nLCBwYXJhbXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxUPiB7XHJcbiAgICBjb25zdCB1cmwgPSBgJHt0aGlzLmJhc2VVcmx9JHtwYXRofWBcclxuICAgIGNvbnN0IGFsbFBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgZjogJ2pzb24nLFxyXG4gICAgICAuLi5wYXJhbXNcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIGFsbFBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgYWxsUGFyYW1zKSBhcyBQcm9taXNlPFQ+XHJcbiAgfVxyXG59XHJcbiIsIi8vIFdlbGwta25vd24gY29kZWQgdmFsdWUgZG9tYWlucyBmb3IgY29tbW9uIExSUyBmaWVsZHMuXHJcbi8vIFRoZXNlIHByb3ZpZGUgaHVtYW4tcmVhZGFibGUgbGFiZWxzIHdoZW4gdGhlIHNlcnZpY2UgbGFja3MgY29kZWQgdmFsdWUgZG9tYWlucy5cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgS25vd25Eb21haW5NYXAge1xyXG4gIFtmaWVsZE5hbWU6IHN0cmluZ106IHsgW2NvZGU6IHN0cmluZ106IHN0cmluZyB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBGSFdBIEZ1bmN0aW9uYWwgQ2xhc3NpZmljYXRpb24gU3lzdGVtXHJcbiAqIGh0dHBzOi8vd3d3LmZod2EuZG90Lmdvdi9wbGFubmluZy9wcm9jZXNzZXMvc3RhdGV3aWRlL3JlbGF0ZWQvaGlnaHdheV9mdW5jdGlvbmFsX2NsYXNzaWZpY2F0aW9ucy9cclxuICovXHJcbmNvbnN0IEZIV0FfRlVOQ1RJT05BTF9DTEFTUzogeyBbY29kZTogc3RyaW5nXTogc3RyaW5nIH0gPSB7XHJcbiAgJzAnOiAnVW5rbm93bicsXHJcbiAgJzEnOiAnUnVyYWwgSW50ZXJzdGF0ZScsXHJcbiAgJzInOiAnUnVyYWwgUHJpbmNpcGFsIEFydGVyaWFsJyxcclxuICAnMyc6ICdSdXJhbCBNaW5vciBBcnRlcmlhbCcsXHJcbiAgJzQnOiAnUnVyYWwgTWFqb3IgQ29sbGVjdG9yJyxcclxuICAnNSc6ICdSdXJhbCBNaW5vciBDb2xsZWN0b3InLFxyXG4gICc2JzogJ1J1cmFsIExvY2FsJyxcclxuICAnNyc6ICdVcmJhbiBJbnRlcnN0YXRlJyxcclxuICAnOCc6ICdVcmJhbiBGcmVld2F5L0V4cHJlc3N3YXknLFxyXG4gICc5JzogJ1VyYmFuIFByaW5jaXBhbCBBcnRlcmlhbCcsXHJcbiAgJzEwJzogJ1VyYmFuIE1pbm9yIEFydGVyaWFsJyxcclxuICAnMTEnOiAnVXJiYW4gQ29sbGVjdG9yJyxcclxuICAnMTInOiAnVXJiYW4gTG9jYWwnXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYXAgb2YgZmllbGQgbmFtZXMgdG8gdGhlaXIga25vd24gZG9tYWluIGxvb2t1cHMuXHJcbiAqIEZpZWxkIG5hbWUgbWF0Y2hpbmcgaXMgY2FzZS1zZW5zaXRpdmUuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgS05PV05fRE9NQUlOUzogS25vd25Eb21haW5NYXAgPSB7XHJcbiAgZnVuY3Rpb25hbGNsYXNzdHlwZTogRkhXQV9GVU5DVElPTkFMX0NMQVNTLFxyXG4gIGZ1bmN0aW9uYWxjbGFzczogRkhXQV9GVU5DVElPTkFMX0NMQVNTLFxyXG4gIGZ1bmN0aW9uYWxfY2xhc3M6IEZIV0FfRlVOQ1RJT05BTF9DTEFTUyxcclxuICBmdW5jX2NsYXNzOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1MsXHJcbiAgRnVuY3Rpb25hbENsYXNzVHlwZTogRkhXQV9GVU5DVElPTkFMX0NMQVNTLFxyXG4gIEZ1bmN0aW9uYWxDbGFzczogRkhXQV9GVU5DVElPTkFMX0NMQVNTXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXNvbHZlIGEgcmF3IGNvZGUgdG8gYSBkaXNwbGF5IGxhYmVsIHVzaW5nIGtub3duIGRvbWFpbnMuXHJcbiAqIFJldHVybnMgbnVsbCBpZiBubyBtYXBwaW5nIGV4aXN0cy5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlS25vd25Eb21haW4gKGZpZWxkTmFtZTogc3RyaW5nLCBjb2RlOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICBjb25zdCBkb21haW4gPSBLTk9XTl9ET01BSU5TW2ZpZWxkTmFtZV1cclxuICBpZiAoIWRvbWFpbikgcmV0dXJuIG51bGxcclxuICBjb25zdCBrZXkgPSBTdHJpbmcoY29kZSlcclxuICByZXR1cm4gZG9tYWluW2tleV0gPz8gbnVsbFxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X2NvcmVfXzsiLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV91aV9hZHZhbmNlZF9zZXR0aW5nX2NvbXBvbmVudHNfXzsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBleGlzdHMgKGRldmVsb3BtZW50IG9ubHkpXG5cdGlmIChfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFyIGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjsiLCIvKipcclxuICogV2VicGFjayB3aWxsIHJlcGxhY2UgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gd2l0aCBfX3dlYnBhY2tfcmVxdWlyZV9fLnAgdG8gc2V0IHRoZSBwdWJsaWMgcGF0aCBkeW5hbWljYWxseS5cclxuICogVGhlIHJlYXNvbiB3aHkgd2UgY2FuJ3Qgc2V0IHRoZSBwdWJsaWNQYXRoIGluIHdlYnBhY2sgY29uZmlnIGlzOiB3ZSBjaGFuZ2UgdGhlIHB1YmxpY1BhdGggd2hlbiBkb3dubG9hZC5cclxuICogKi9cclxuX193ZWJwYWNrX3B1YmxpY19wYXRoX18gPSB3aW5kb3cuamltdUNvbmZpZy5iYXNlVXJsXHJcbiIsIi8qKiBAanN4UnVudGltZSBjbGFzc2ljICovXHJcbmltcG9ydCB7IFJlYWN0IH0gZnJvbSAnamltdS1jb3JlJ1xyXG5pbXBvcnQgdHlwZSB7IEFsbFdpZGdldFNldHRpbmdQcm9wcyB9IGZyb20gJ2ppbXUtZm9yLWJ1aWxkZXInXHJcbmltcG9ydCB7IE1hcFdpZGdldFNlbGVjdG9yIH0gZnJvbSAnamltdS11aS9hZHZhbmNlZC9zZXR0aW5nLWNvbXBvbmVudHMnXHJcbmltcG9ydCB0eXBlIHsgSU1Db25maWcsIEV2ZW50TGF5ZXJDb25maWcgfSBmcm9tICcuLi9jb25maWcnXHJcbmltcG9ydCB7IExyc1NlcnZpY2UgfSBmcm9tICcuLi9scnMtdXRpbHMvbHJzLXNlcnZpY2UnXHJcbmltcG9ydCB7IEtOT1dOX0RPTUFJTlMgfSBmcm9tICcuLi9scnMtdXRpbHMvdXRpbHMva25vd24tZG9tYWlucydcclxuXHJcbmNvbnN0IHsgdXNlU3RhdGUsIHVzZUNhbGxiYWNrLCB1c2VFZmZlY3QgfSA9IFJlYWN0XHJcblxyXG5pbnRlcmZhY2UgRGlzY292ZXJlZExheWVyIHtcclxuICBpZDogbnVtYmVyXHJcbiAgbmFtZTogc3RyaW5nXHJcbiAgdHlwZTogc3RyaW5nXHJcbiAgZmllbGRzOiBBcnJheTx7IG5hbWU6IHN0cmluZzsgYWxpYXM6IHN0cmluZzsgdHlwZTogc3RyaW5nIH0+XHJcbiAgcm91dGVJZEZpZWxkTmFtZTogc3RyaW5nXHJcbiAgZnJvbU1lYXN1cmVGaWVsZE5hbWU6IHN0cmluZ1xyXG4gIHRvTWVhc3VyZUZpZWxkTmFtZTogc3RyaW5nIHwgbnVsbFxyXG59XHJcblxyXG5jb25zdCBTZXR0aW5nID0gKHByb3BzOiBBbGxXaWRnZXRTZXR0aW5nUHJvcHM8SU1Db25maWc+KSA9PiB7XHJcbiAgY29uc3QgY29uZmlnID0gcHJvcHMuY29uZmlnXHJcblxyXG4gIGNvbnN0IFtuZXR3b3JrTGF5ZXJzLCBzZXROZXR3b3JrTGF5ZXJzXSA9IHVzZVN0YXRlPEFycmF5PHsgaWQ6IG51bWJlcjsgbmFtZTogc3RyaW5nIH0+PihbXSlcclxuICBjb25zdCBbZGlzY292ZXJlZExheWVycywgc2V0RGlzY292ZXJlZExheWVyc10gPSB1c2VTdGF0ZTxEaXNjb3ZlcmVkTGF5ZXJbXT4oW10pXHJcbiAgY29uc3QgW2xvYWRpbmdTZXJ2aWNlLCBzZXRMb2FkaW5nU2VydmljZV0gPSB1c2VTdGF0ZShmYWxzZSlcclxuICBjb25zdCBbc2VydmljZUVycm9yLCBzZXRTZXJ2aWNlRXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuXHJcbiAgLy8gU3lzdGVtIGZpZWxkcyB0aGF0IHNob3VsZG4ndCBhcHBlYXIgaW4gdGhlIGF0dHJpYnV0ZSBwaWNrZXJcclxuICBjb25zdCBTWVNURU1fRklFTERTID0gW1xyXG4gICAgJ09CSkVDVElEJywgJ1NoYXBlJywgJ3NoYXBlJywgJ3JvdXRlaWQnLCAncmlkJywgJ2Zyb21tZWFzdXJlJywgJ3RvbWVhc3VyZScsXHJcbiAgICAnbWVhcycsICdmcm9tZGF0ZScsICd0b2RhdGUnLCAnZXZlbnRpZCcsICdMb2NFcnJvcicsICdsb2NlcnJvcicsXHJcbiAgICAnU2hhcGVfTGVuZ3RoJywgJ3NoYXBlLlNUTGVuZ3RoKCknLCAncmVjb3JkZGF0ZSdcclxuICBdXHJcblxyXG4gIGNvbnN0IHVwZGF0ZUNvbmZpZyA9IHVzZUNhbGxiYWNrKChrZXk6IHN0cmluZywgdmFsdWU6IGFueSkgPT4ge1xyXG4gICAgcHJvcHMub25TZXR0aW5nQ2hhbmdlKHtcclxuICAgICAgaWQ6IHByb3BzLmlkLFxyXG4gICAgICBjb25maWc6IHByb3BzLmNvbmZpZy5zZXQoa2V5LCB2YWx1ZSlcclxuICAgIH0pXHJcbiAgfSwgW3Byb3BzXSlcclxuXHJcbiAgLy8gTG9hZCBzZXJ2aWNlIGluZm8gd2hlbiBVUkwgY2hhbmdlc1xyXG4gIGNvbnN0IGxvYWRTZXJ2aWNlSW5mbyA9IHVzZUNhbGxiYWNrKGFzeW5jICh1cmw6IHN0cmluZykgPT4ge1xyXG4gICAgaWYgKCF1cmwudHJpbSgpKSByZXR1cm5cclxuICAgIHNldExvYWRpbmdTZXJ2aWNlKHRydWUpXHJcbiAgICBzZXRTZXJ2aWNlRXJyb3IobnVsbClcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBscnMgPSBuZXcgTHJzU2VydmljZSh1cmwudHJpbSgpKVxyXG4gICAgICBjb25zdCBpbmZvID0gYXdhaXQgbHJzLmdldFNlcnZpY2VJbmZvKClcclxuXHJcbiAgICAgIGNvbnN0IG5ldHMgPSAoaW5mby5uZXR3b3JrTGF5ZXJzIHx8IFtdKS5tYXAobiA9PiAoeyBpZDogbi5pZCwgbmFtZTogbi5uYW1lIH0pKVxyXG4gICAgICBzZXROZXR3b3JrTGF5ZXJzKG5ldHMpXHJcblxyXG4gICAgICAvLyBEaXNjb3ZlciBuZXR3b3JrIGxheWVyIHJvdXRlIElEIGZpZWxkXHJcbiAgICAgIGlmIChuZXRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBzZWxlY3RlZE5ldElkID0gKHByb3BzLmNvbmZpZyBhcyBhbnkpPy5uZXR3b3JrTGF5ZXJJZCA/PyBuZXRzWzBdLmlkXHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IG5ldERldGFpbCA9IGF3YWl0IGxycy5nZXROZXR3b3JrTGF5ZXJJbmZvKHNlbGVjdGVkTmV0SWQpXHJcbiAgICAgICAgICBjb25zdCBuZXRSb3V0ZUZpZWxkID0gKG5ldERldGFpbCBhcyBhbnkpLnJvdXRlSWRGaWVsZE5hbWUgfHwgJ3JvdXRlaWQnXHJcbiAgICAgICAgICBjb25zdCBuZXRSb3V0ZU5hbWVGaWVsZCA9IChuZXREZXRhaWwgYXMgYW55KS5yb3V0ZU5hbWVGaWVsZE5hbWUgfHwgbnVsbFxyXG4gICAgICAgICAgdXBkYXRlQ29uZmlnKCduZXR3b3JrUm91dGVJZEZpZWxkJywgbmV0Um91dGVGaWVsZClcclxuICAgICAgICAgIGlmIChuZXRSb3V0ZU5hbWVGaWVsZCkge1xyXG4gICAgICAgICAgICB1cGRhdGVDb25maWcoJ25ldHdvcmtSb3V0ZU5hbWVGaWVsZCcsIG5ldFJvdXRlTmFtZUZpZWxkKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgLy8gZmFsbGJhY2tcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEZldGNoIGZpZWxkIGluZm8gZm9yIGVhY2ggZXZlbnQgbGF5ZXIsIGZpbHRlcmluZyBvdXQgYWxsLW51bGwgZmllbGRzXHJcbiAgICAgIGNvbnN0IGxheWVyczogRGlzY292ZXJlZExheWVyW10gPSBbXVxyXG4gICAgICBmb3IgKGNvbnN0IGVsIG9mIChpbmZvLmV2ZW50TGF5ZXJzIHx8IFtdKSkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCBkZXRhaWwgPSBhd2FpdCBscnMuZ2V0RXZlbnRMYXllckluZm8oZWwuaWQpXHJcbiAgICAgICAgICBjb25zdCB1c2VyRmllbGRzID0gKGRldGFpbC5maWVsZHMgfHwgW10pLmZpbHRlcihcclxuICAgICAgICAgICAgZiA9PiAhU1lTVEVNX0ZJRUxEUy5pbmNsdWRlcyhmLm5hbWUpICYmXHJcbiAgICAgICAgICAgICAgICAgZi50eXBlICE9PSAnZXNyaUZpZWxkVHlwZU9JRCcgJiZcclxuICAgICAgICAgICAgICAgICBmLnR5cGUgIT09ICdlc3JpRmllbGRUeXBlR2VvbWV0cnknXHJcbiAgICAgICAgICApXHJcblxyXG4gICAgICAgICAgLy8gUXVlcnkgYSBzYW1wbGUgb2YgZmVhdHVyZXMgdG8gZmluZCB3aGljaCBmaWVsZHMgYWN0dWFsbHkgaGF2ZSBkYXRhXHJcbiAgICAgICAgICBsZXQgZmllbGRzV2l0aERhdGE6IFNldDxzdHJpbmc+IHwgbnVsbCA9IG51bGxcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGJhc2VNYXBVcmwgPSAocHJvcHMuY29uZmlnPy5scnNTZXJ2aWNlVXJsIHx8ICcnKS5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgICAgICAgICBjb25zdCBzYW1wbGVVcmwgPSBgJHtiYXNlTWFwVXJsfS8ke2VsLmlkfS9xdWVyeWBcclxuICAgICAgICAgICAgY29uc3Qgc2FtcGxlUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0geyB3aGVyZTogJzE9MScsIG91dEZpZWxkczogJyonLCByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJywgcmVzdWx0UmVjb3JkQ291bnQ6ICc1MCcsIGY6ICdqc29uJyB9XHJcbiAgICAgICAgICAgIGNvbnN0IHNhbXBsZSA9IGF3YWl0IGxycy5xdWVyeUZlYXR1cmVzRGlyZWN0KHNhbXBsZVVybCwgc2FtcGxlUGFyYW1zKVxyXG4gICAgICAgICAgICBpZiAoc2FtcGxlPy5mZWF0dXJlcz8ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgIGZpZWxkc1dpdGhEYXRhID0gbmV3IFNldDxzdHJpbmc+KClcclxuICAgICAgICAgICAgICBmb3IgKGNvbnN0IGZlYXQgb2Ygc2FtcGxlLmZlYXR1cmVzKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbF0gb2YgT2JqZWN0LmVudHJpZXMoZmVhdC5hdHRyaWJ1dGVzIHx8IHt9KSkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAodmFsICE9PSBudWxsICYmIHZhbCAhPT0gdW5kZWZpbmVkICYmIHZhbCAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWVsZHNXaXRoRGF0YS5hZGQoa2V5KVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlIHNhbXBsZSBxdWVyeSBmYWlsdXJlICovIH1cclxuXHJcbiAgICAgICAgICBjb25zdCBmaWx0ZXJlZEZpZWxkcyA9IGZpZWxkc1dpdGhEYXRhXHJcbiAgICAgICAgICAgID8gdXNlckZpZWxkcy5maWx0ZXIoZiA9PiBmaWVsZHNXaXRoRGF0YS5oYXMoZi5uYW1lKSlcclxuICAgICAgICAgICAgOiB1c2VyRmllbGRzXHJcblxyXG4gICAgICAgICAgbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgICBpZDogZWwuaWQsXHJcbiAgICAgICAgICAgIG5hbWU6IGVsLm5hbWUsXHJcbiAgICAgICAgICAgIHR5cGU6IGVsLnR5cGUsXHJcbiAgICAgICAgICAgIGZpZWxkczogZmlsdGVyZWRGaWVsZHMubWFwKGYgPT4gKHsgbmFtZTogZi5uYW1lLCBhbGlhczogZi5hbGlhcyB8fCBmLm5hbWUsIHR5cGU6IGYudHlwZSB9KSksXHJcbiAgICAgICAgICAgIHJvdXRlSWRGaWVsZE5hbWU6IChkZXRhaWwgYXMgYW55KS5yb3V0ZUlkRmllbGROYW1lIHx8ICdyb3V0ZWlkJyxcclxuICAgICAgICAgICAgZnJvbU1lYXN1cmVGaWVsZE5hbWU6IChkZXRhaWwgYXMgYW55KS5mcm9tTWVhc3VyZUZpZWxkTmFtZSB8fCAnZnJvbW1lYXN1cmUnLFxyXG4gICAgICAgICAgICB0b01lYXN1cmVGaWVsZE5hbWU6IChkZXRhaWwgYXMgYW55KS50b01lYXN1cmVGaWVsZE5hbWUgfHwgbnVsbFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgIGxheWVycy5wdXNoKHtcclxuICAgICAgICAgICAgaWQ6IGVsLmlkLCBuYW1lOiBlbC5uYW1lLCB0eXBlOiBlbC50eXBlLCBmaWVsZHM6IFtdLFxyXG4gICAgICAgICAgICByb3V0ZUlkRmllbGROYW1lOiAncm91dGVpZCcsIGZyb21NZWFzdXJlRmllbGROYW1lOiAnZnJvbW1lYXN1cmUnLCB0b01lYXN1cmVGaWVsZE5hbWU6IG51bGxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHNldERpc2NvdmVyZWRMYXllcnMobGF5ZXJzKVxyXG5cclxuICAgICAgLy8gQXV0by1lbmFibGUgZGVmYXVsdCBsYXllcnMgaWYgbm8gZXZlbnQgbGF5ZXJzIGNvbmZpZ3VyZWQgeWV0XHJcbiAgICAgIGNvbnN0IGV4aXN0aW5nID0gcHJvcHMuY29uZmlnPy5ldmVudExheWVyQ29uZmlncyBhcyBhbnkgYXMgRXZlbnRMYXllckNvbmZpZ1tdIHx8IFtdXHJcbiAgICAgIGlmIChleGlzdGluZy5sZW5ndGggPT09IDAgJiYgbGF5ZXJzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBjb25zdCBERUZBVUxUX0xBWUVSUyA9IFsnZnVuY3Rpb25hbCBjbGFzcycsICdtZWRpYW4gdHlwZScsICdzcGVlZCBsaW1pdCcsICdjcmFzaCcsICdncmFkZScsICdjdXJ2ZSddXHJcbiAgICAgICAgY29uc3QgYXV0b0NvbmZpZ3M6IEV2ZW50TGF5ZXJDb25maWdbXSA9IFtdXHJcbiAgICAgICAgZm9yIChjb25zdCBsYXllciBvZiBsYXllcnMpIHtcclxuICAgICAgICAgIGNvbnN0IG5hbWVMb3dlciA9IGxheWVyLm5hbWUudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgaWYgKERFRkFVTFRfTEFZRVJTLnNvbWUoZCA9PiBuYW1lTG93ZXIuaW5jbHVkZXMoZCkpKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG92ZXJyaWRlczogeyBbZmllbGROYW1lOiBzdHJpbmddOiB7IFtjb2RlOiBzdHJpbmddOiBzdHJpbmcgfSB9ID0ge31cclxuICAgICAgICAgICAgZm9yIChjb25zdCBmIG9mIGxheWVyLmZpZWxkcykge1xyXG4gICAgICAgICAgICAgIGlmIChLTk9XTl9ET01BSU5TW2YubmFtZV0pIHtcclxuICAgICAgICAgICAgICAgIG92ZXJyaWRlc1tmLm5hbWVdID0gS05PV05fRE9NQUlOU1tmLm5hbWVdXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGF1dG9Db25maWdzLnB1c2goe1xyXG4gICAgICAgICAgICAgIGxheWVySWQ6IGxheWVyLmlkLFxyXG4gICAgICAgICAgICAgIG5hbWU6IGxheWVyLm5hbWUsXHJcbiAgICAgICAgICAgICAgdHlwZTogbGF5ZXIudHlwZSBhcyBhbnksXHJcbiAgICAgICAgICAgICAgYXR0cmlidXRlczogbGF5ZXIuZmllbGRzLmZpbHRlcihmID0+ICEhS05PV05fRE9NQUlOU1tmLm5hbWVdKS5tYXAoZiA9PiBmLm5hbWUpLFxyXG4gICAgICAgICAgICAgIHJvdXRlSWRGaWVsZDogbGF5ZXIucm91dGVJZEZpZWxkTmFtZSxcclxuICAgICAgICAgICAgICAuLi4obGF5ZXIudHlwZS5pbmNsdWRlcygnUG9pbnQnKVxyXG4gICAgICAgICAgICAgICAgPyB7IG1lYXN1cmVGaWVsZDogbGF5ZXIuZnJvbU1lYXN1cmVGaWVsZE5hbWUgfVxyXG4gICAgICAgICAgICAgICAgOiB7IGZyb21NZWFzdXJlRmllbGQ6IGxheWVyLmZyb21NZWFzdXJlRmllbGROYW1lLCB0b01lYXN1cmVGaWVsZDogbGF5ZXIudG9NZWFzdXJlRmllbGROYW1lIHx8IHVuZGVmaW5lZCB9KSxcclxuICAgICAgICAgICAgICAuLi4oT2JqZWN0LmtleXMob3ZlcnJpZGVzKS5sZW5ndGggPiAwID8geyBkb21haW5PdmVycmlkZXM6IG92ZXJyaWRlcyB9IDoge30pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChhdXRvQ29uZmlncy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICB1cGRhdGVDb25maWcoJ2V2ZW50TGF5ZXJDb25maWdzJywgYXV0b0NvbmZpZ3MpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBzZXRTZXJ2aWNlRXJyb3IoZXJyLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsb2FkIHNlcnZpY2UgaW5mbycpXHJcbiAgICAgIHNldE5ldHdvcmtMYXllcnMoW10pXHJcbiAgICAgIHNldERpc2NvdmVyZWRMYXllcnMoW10pXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nU2VydmljZShmYWxzZSlcclxuICAgIH1cclxuICB9LCBbXSlcclxuXHJcbiAgLy8gQXV0by1sb2FkIHNlcnZpY2UgaW5mbyBvbiBtb3VudCBpZiBVUkwgaXMgc2V0XHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChjb25maWc/Lmxyc1NlcnZpY2VVcmwgJiYgZGlzY292ZXJlZExheWVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgbG9hZFNlcnZpY2VJbmZvKGNvbmZpZy5scnNTZXJ2aWNlVXJsKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICBjb25zdCBoYW5kbGVVcmxDaGFuZ2UgPSB1c2VDYWxsYmFjaygoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcclxuICAgIHVwZGF0ZUNvbmZpZygnbHJzU2VydmljZVVybCcsIGUudGFyZ2V0LnZhbHVlKVxyXG4gIH0sIFt1cGRhdGVDb25maWddKVxyXG5cclxuICBjb25zdCBoYW5kbGVVcmxCbHVyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpZz8ubHJzU2VydmljZVVybCkge1xyXG4gICAgICBsb2FkU2VydmljZUluZm8oY29uZmlnLmxyc1NlcnZpY2VVcmwpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZz8ubHJzU2VydmljZVVybCwgbG9hZFNlcnZpY2VJbmZvXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlTmV0d29ya0NoYW5nZSA9IHVzZUNhbGxiYWNrKChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MU2VsZWN0RWxlbWVudD4pID0+IHtcclxuICAgIHVwZGF0ZUNvbmZpZygnbmV0d29ya0xheWVySWQnLCBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApKVxyXG4gIH0sIFt1cGRhdGVDb25maWddKVxyXG5cclxuICAvLyBUb2dnbGUgYW4gZXZlbnQgbGF5ZXIgb24vb2ZmIOKAlCBhdXRvLXNlbGVjdCBhbGwgdXNlciBmaWVsZHMgd2hlbiBlbmFibGluZ1xyXG4gIGNvbnN0IHRvZ2dsZUV2ZW50TGF5ZXIgPSB1c2VDYWxsYmFjaygobGF5ZXI6IERpc2NvdmVyZWRMYXllcikgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudDogRXZlbnRMYXllckNvbmZpZ1tdID0gY29uZmlnPy5ldmVudExheWVyQ29uZmlncyA/IFsuLi5jb25maWcuZXZlbnRMYXllckNvbmZpZ3MgYXMgYW55XSA6IFtdXHJcbiAgICBjb25zdCBpZHggPSBjdXJyZW50LmZpbmRJbmRleChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXIuaWQpXHJcblxyXG4gICAgaWYgKGlkeCA+PSAwKSB7XHJcbiAgICAgIGN1cnJlbnQuc3BsaWNlKGlkeCwgMSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEJ1aWxkIGRvbWFpbk92ZXJyaWRlcyBmcm9tIGtub3duIGRvbWFpbnNcclxuICAgICAgY29uc3Qgb3ZlcnJpZGVzOiB7IFtmaWVsZE5hbWU6IHN0cmluZ106IHsgW2NvZGU6IHN0cmluZ106IHN0cmluZyB9IH0gPSB7fVxyXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGF5ZXIuZmllbGRzKSB7XHJcbiAgICAgICAgaWYgKEtOT1dOX0RPTUFJTlNbZi5uYW1lXSkge1xyXG4gICAgICAgICAgb3ZlcnJpZGVzW2YubmFtZV0gPSBLTk9XTl9ET01BSU5TW2YubmFtZV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG5ld0xheWVyOiBFdmVudExheWVyQ29uZmlnID0ge1xyXG4gICAgICAgIGxheWVySWQ6IGxheWVyLmlkLFxyXG4gICAgICAgIG5hbWU6IGxheWVyLm5hbWUsXHJcbiAgICAgICAgdHlwZTogbGF5ZXIudHlwZSBhcyBhbnksXHJcbiAgICAgICAgYXR0cmlidXRlczogbGF5ZXIuZmllbGRzLmZpbHRlcihmID0+ICEhS05PV05fRE9NQUlOU1tmLm5hbWVdKS5tYXAoZiA9PiBmLm5hbWUpLFxyXG4gICAgICAgIHJvdXRlSWRGaWVsZDogbGF5ZXIucm91dGVJZEZpZWxkTmFtZSxcclxuICAgICAgICAuLi4obGF5ZXIudHlwZS5pbmNsdWRlcygnUG9pbnQnKVxyXG4gICAgICAgICAgPyB7IG1lYXN1cmVGaWVsZDogbGF5ZXIuZnJvbU1lYXN1cmVGaWVsZE5hbWUgfVxyXG4gICAgICAgICAgOiB7IGZyb21NZWFzdXJlRmllbGQ6IGxheWVyLmZyb21NZWFzdXJlRmllbGROYW1lLCB0b01lYXN1cmVGaWVsZDogbGF5ZXIudG9NZWFzdXJlRmllbGROYW1lIHx8IHVuZGVmaW5lZCB9KSxcclxuICAgICAgICAuLi4oT2JqZWN0LmtleXMob3ZlcnJpZGVzKS5sZW5ndGggPiAwID8geyBkb21haW5PdmVycmlkZXM6IG92ZXJyaWRlcyB9IDoge30pXHJcbiAgICAgIH1cclxuICAgICAgY3VycmVudC5wdXNoKG5ld0xheWVyKVxyXG4gICAgfVxyXG5cclxuICAgIHVwZGF0ZUNvbmZpZygnZXZlbnRMYXllckNvbmZpZ3MnLCBjdXJyZW50KVxyXG4gIH0sIFtjb25maWc/LmV2ZW50TGF5ZXJDb25maWdzLCB1cGRhdGVDb25maWddKVxyXG5cclxuICAvLyBUb2dnbGUgYW4gaW5kaXZpZHVhbCBhdHRyaWJ1dGUgZmllbGQgd2l0aGluIGFuIGV2ZW50IGxheWVyXHJcbiAgY29uc3QgdG9nZ2xlQXR0cmlidXRlID0gdXNlQ2FsbGJhY2soKGxheWVySWQ6IG51bWJlciwgZmllbGROYW1lOiBzdHJpbmcpID0+IHtcclxuICAgIGNvbnN0IGN1cnJlbnQ6IEV2ZW50TGF5ZXJDb25maWdbXSA9IGNvbmZpZz8uZXZlbnRMYXllckNvbmZpZ3MgPyBbLi4uY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIGFzIGFueV0gOiBbXVxyXG4gICAgY29uc3QgaWR4ID0gY3VycmVudC5maW5kSW5kZXgoZSA9PiBlLmxheWVySWQgPT09IGxheWVySWQpXHJcbiAgICBpZiAoaWR4IDwgMCkgcmV0dXJuXHJcblxyXG4gICAgY29uc3QgYXR0cnMgPSBbLi4uY3VycmVudFtpZHhdLmF0dHJpYnV0ZXNdXHJcbiAgICBjb25zdCBhdHRySWR4ID0gYXR0cnMuaW5kZXhPZihmaWVsZE5hbWUpXHJcbiAgICBpZiAoYXR0cklkeCA+PSAwKSB7XHJcbiAgICAgIGF0dHJzLnNwbGljZShhdHRySWR4LCAxKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYXR0cnMucHVzaChmaWVsZE5hbWUpXHJcbiAgICB9XHJcbiAgICBjdXJyZW50W2lkeF0gPSB7IC4uLmN1cnJlbnRbaWR4XSwgYXR0cmlidXRlczogYXR0cnMgfVxyXG4gICAgdXBkYXRlQ29uZmlnKCdldmVudExheWVyQ29uZmlncycsIGN1cnJlbnQpXHJcbiAgfSwgW2NvbmZpZz8uZXZlbnRMYXllckNvbmZpZ3MsIHVwZGF0ZUNvbmZpZ10pXHJcblxyXG4gIC8vIFNlbGVjdCBhbGwgLyBDbGVhciBhbGwgZm9yIGEgbGF5ZXJcclxuICBjb25zdCBzZWxlY3RBbGxBdHRyaWJ1dGVzID0gdXNlQ2FsbGJhY2soKGxheWVySWQ6IG51bWJlciwgYWxsRmllbGROYW1lczogc3RyaW5nW10pID0+IHtcclxuICAgIGNvbnN0IGN1cnJlbnQ6IEV2ZW50TGF5ZXJDb25maWdbXSA9IGNvbmZpZz8uZXZlbnRMYXllckNvbmZpZ3MgPyBbLi4uY29uZmlnLmV2ZW50TGF5ZXJDb25maWdzIGFzIGFueV0gOiBbXVxyXG4gICAgY29uc3QgaWR4ID0gY3VycmVudC5maW5kSW5kZXgoZSA9PiBlLmxheWVySWQgPT09IGxheWVySWQpXHJcbiAgICBpZiAoaWR4IDwgMCkgcmV0dXJuXHJcbiAgICBjdXJyZW50W2lkeF0gPSB7IC4uLmN1cnJlbnRbaWR4XSwgYXR0cmlidXRlczogWy4uLmFsbEZpZWxkTmFtZXNdIH1cclxuICAgIHVwZGF0ZUNvbmZpZygnZXZlbnRMYXllckNvbmZpZ3MnLCBjdXJyZW50KVxyXG4gIH0sIFtjb25maWc/LmV2ZW50TGF5ZXJDb25maWdzLCB1cGRhdGVDb25maWddKVxyXG5cclxuICBjb25zdCBjbGVhckFsbEF0dHJpYnV0ZXMgPSB1c2VDYWxsYmFjaygobGF5ZXJJZDogbnVtYmVyKSA9PiB7XHJcbiAgICBjb25zdCBjdXJyZW50OiBFdmVudExheWVyQ29uZmlnW10gPSBjb25maWc/LmV2ZW50TGF5ZXJDb25maWdzID8gWy4uLmNvbmZpZy5ldmVudExheWVyQ29uZmlncyBhcyBhbnldIDogW11cclxuICAgIGNvbnN0IGlkeCA9IGN1cnJlbnQuZmluZEluZGV4KGUgPT4gZS5sYXllcklkID09PSBsYXllcklkKVxyXG4gICAgaWYgKGlkeCA8IDApIHJldHVyblxyXG4gICAgY3VycmVudFtpZHhdID0geyAuLi5jdXJyZW50W2lkeF0sIGF0dHJpYnV0ZXM6IFtdIH1cclxuICAgIHVwZGF0ZUNvbmZpZygnZXZlbnRMYXllckNvbmZpZ3MnLCBjdXJyZW50KVxyXG4gIH0sIFtjb25maWc/LmV2ZW50TGF5ZXJDb25maWdzLCB1cGRhdGVDb25maWddKVxyXG5cclxuICAvLyBQZXItbGF5ZXIgZmllbGQgc2VhcmNoXHJcbiAgY29uc3QgW2ZpZWxkU2VhcmNoLCBzZXRGaWVsZFNlYXJjaF0gPSB1c2VTdGF0ZTxSZWNvcmQ8bnVtYmVyLCBzdHJpbmc+Pih7fSlcclxuICBjb25zdCBnZXRGaWVsZFNlYXJjaCA9IChsYXllcklkOiBudW1iZXIpID0+IGZpZWxkU2VhcmNoW2xheWVySWRdIHx8ICcnXHJcbiAgY29uc3Qgc2V0TGF5ZXJGaWVsZFNlYXJjaCA9IChsYXllcklkOiBudW1iZXIsIHZhbDogc3RyaW5nKSA9PiB7XHJcbiAgICBzZXRGaWVsZFNlYXJjaChwcmV2ID0+ICh7IC4uLnByZXYsIFtsYXllcklkXTogdmFsIH0pKVxyXG4gIH1cclxuXHJcbiAgY29uc3QgaGFuZGxlUHJlY2lzaW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XHJcbiAgICBjb25zdCB2YWwgPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApXHJcbiAgICB1cGRhdGVDb25maWcoJ21lYXN1cmVQcmVjaXNpb24nLCBpc05hTih2YWwpID8gMyA6IHZhbClcclxuICB9LCBbdXBkYXRlQ29uZmlnXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlTWFwV2lkZ2V0Q2hhbmdlID0gdXNlQ2FsbGJhY2soKHVzZU1hcFdpZGdldElkczogc3RyaW5nW10pID0+IHtcclxuICAgIHByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgIGlkOiBwcm9wcy5pZCxcclxuICAgICAgdXNlTWFwV2lkZ2V0SWRzXHJcbiAgICB9KVxyXG4gIH0sIFtwcm9wc10pXHJcblxyXG4gIC8vIEdldCB0aGUgY29uZmlnIGVudHJ5IGZvciBhIGRpc2NvdmVyZWQgbGF5ZXJcclxuICBjb25zdCBnZXRMYXllckNvbmZpZyA9IChsYXllcklkOiBudW1iZXIpOiBFdmVudExheWVyQ29uZmlnIHwgdW5kZWZpbmVkID0+IHtcclxuICAgIHJldHVybiAoY29uZmlnPy5ldmVudExheWVyQ29uZmlncyBhcyBhbnkgYXMgRXZlbnRMYXllckNvbmZpZ1tdIHx8IFtdKVxyXG4gICAgICAuZmluZChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXJJZClcclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInAtM1wiIHN0eWxlPXt7IGZvbnRTaXplOiAnMTNweCcsIGNvbG9yOiAnI2ZmZicgfX0+XHJcbiAgICAgIDxoNSBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzEycHgnLCBjb2xvcjogJyNmZmYnIH19PlJvYWQgTG9nIFNldHRpbmdzPC9oNT5cclxuXHJcbiAgICAgIHsvKiBMUlMgU2VydmljZSBVUkwgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT5MUlMgU2VydmljZSBVUkw8L2xhYmVsPlxyXG4gICAgICAgIDxwIHN0eWxlPXtkZXNjU3R5bGV9PlRoZSBSRVNUIGVuZHBvaW50IGZvciB5b3VyIExpbmVhciBSZWZlcmVuY2luZyBTeXN0ZW0gKExSUykgc2VydmljZS4gQ2xpY2sgXCJMb2FkIFNlcnZpY2VcIiB0byBkaXNjb3ZlciBhdmFpbGFibGUgbmV0d29yayBhbmQgZXZlbnQgbGF5ZXJzLjwvcD5cclxuICAgICAgICA8aW5wdXRcclxuICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgIHZhbHVlPXtjb25maWc/Lmxyc1NlcnZpY2VVcmwgfHwgJyd9XHJcbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlVXJsQ2hhbmdlfVxyXG4gICAgICAgICAgb25CbHVyPXtoYW5kbGVVcmxCbHVyfVxyXG4gICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cImh0dHBzOi8vLi4uL01hcFNlcnZlci9leHRzL0xSU2VydmVyXCJcclxuICAgICAgICAvPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2hhbmRsZVVybEJsdXJ9IHN0eWxlPXtsb2FkQnRuU3R5bGV9PlxyXG4gICAgICAgICAge2xvYWRpbmdTZXJ2aWNlID8gJ0xvYWRpbmcuLi4nIDogJ0xvYWQgU2VydmljZSd9XHJcblxyXG4gICAgICB7LyogTWFwIFdpZGdldCAoZm9yIHBvbHlnb24gc2VsZWN0IG1vZGUpICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXtmaWVsZEdyb3VwU3R5bGV9PlxyXG4gICAgICAgIDxsYWJlbCBzdHlsZT17bGFiZWxTdHlsZX0+TWFwIFdpZGdldCAoZm9yIHBvbHlnb24gc2VsZWN0KTwvbGFiZWw+XHJcbiAgICAgICAgPHAgc3R5bGU9e2Rlc2NTdHlsZX0+Q2hvb3NlIHRoZSBtYXAgd2lkZ2V0IHVzZWQgZm9yIHNwYXRpYWwgc2VsZWN0aW9uLiBUaGlzIGVuYWJsZXMgdGhlIHBvbHlnb24tc2VsZWN0IHRvb2wgdG8gcGljayByb3V0ZXMgZnJvbSB0aGUgbWFwLjwvcD5cclxuICAgICAgICA8TWFwV2lkZ2V0U2VsZWN0b3JcclxuICAgICAgICAgIG9uU2VsZWN0PXtoYW5kbGVNYXBXaWRnZXRDaGFuZ2V9XHJcbiAgICAgICAgICB1c2VNYXBXaWRnZXRJZHM9e3Byb3BzLnVzZU1hcFdpZGdldElkc31cclxuICAgICAgICAvPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICB7c2VydmljZUVycm9yICYmIDxkaXYgc3R5bGU9e2Vycm9yU3R5bGV9PntzZXJ2aWNlRXJyb3J9PC9kaXY+fVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBOZXR3b3JrIExheWVyIChhdXRvLXNlbGVjdCBmaXJzdCBpZiBvbmx5IG9uZSkgKi99XHJcbiAgICAgIHtuZXR3b3JrTGF5ZXJzLmxlbmd0aCA+IDEgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9Pk5ldHdvcmsgTGF5ZXI8L2xhYmVsPlxyXG4gICAgICAgICAgPHAgc3R5bGU9e2Rlc2NTdHlsZX0+U2VsZWN0IHdoaWNoIExSUyBuZXR3b3JrIHRvIHF1ZXJ5IHJvdXRlcyBmcm9tLiBPbmx5IG5lZWRlZCBpZiB5b3VyIHNlcnZpY2UgaGFzIG11bHRpcGxlIG5ldHdvcmtzLjwvcD5cclxuICAgICAgICAgIDxzZWxlY3RcclxuICAgICAgICAgICAgdmFsdWU9e2NvbmZpZz8ubmV0d29ya0xheWVySWQgPz8gJyd9XHJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVOZXR3b3JrQ2hhbmdlfVxyXG4gICAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPi0tIFNlbGVjdCBOZXR3b3JrIC0tPC9vcHRpb24+XHJcbiAgICAgICAgICAgIHtuZXR3b3JrTGF5ZXJzLm1hcChuID0+IChcclxuICAgICAgICAgICAgICA8b3B0aW9uIGtleT17bi5pZH0gdmFsdWU9e24uaWR9PntuLm5hbWV9PC9vcHRpb24+XHJcbiAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogRXZlbnQgTGF5ZXJzIOKAlCBhbHdheXMgZXhwYW5kZWQgd2l0aCBhbGwgZmllbGRzIHZpc2libGUgKi99XHJcbiAgICAgIHtkaXNjb3ZlcmVkTGF5ZXJzLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9PkV2ZW50IExheWVycyAmYW1wOyBBdHRyaWJ1dGVzPC9sYWJlbD5cclxuICAgICAgICAgIDxwIHN0eWxlPXtkZXNjU3R5bGV9PlxyXG4gICAgICAgICAgICBDaGVjayBhIGxheWVyIHRvIGluY2x1ZGUgaXQgaW4gdGhlIHJvYWQgbG9nIHJlcG9ydC4gV2hlbiBlbmFibGVkLCBjaG9vc2Ugd2hpY2ggYXR0cmlidXRlIGZpZWxkcyB0byBkaXNwbGF5LiBGaWVsZHMgbWFya2VkIHdpdGgg4piFIGhhdmUgZG9tYWluIGxhYmVscyB0aGF0IHdpbGwgc2hvdyBkZXNjcmlwdGl2ZSB0ZXh0IGluc3RlYWQgb2YgY29kZXMuXHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXtldmVudExpc3RTdHlsZX0+XHJcbiAgICAgICAgICAgIHtkaXNjb3ZlcmVkTGF5ZXJzLm1hcChsYXllciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbGF5ZXJDZmcgPSBnZXRMYXllckNvbmZpZyhsYXllci5pZClcclxuICAgICAgICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gISFsYXllckNmZ1xyXG4gICAgICAgICAgICAgIGNvbnN0IHR5cGVUYWcgPSBsYXllci50eXBlLmluY2x1ZGVzKCdQb2ludCcpID8gJyhNYXJrZXIpJyA6ICcoTGluZWFyKSdcclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtsYXllci5pZH0gc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTBweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsvKiBMYXllciBjaGVja2JveCAqL31cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2lzU2VsZWN0ZWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gdG9nZ2xlRXZlbnRMYXllcihsYXllcil9XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBtYXJnaW5MZWZ0OiAnNHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMwMDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2xheWVyLm5hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnIzU1NScsIG1hcmdpbkxlZnQ6ICc2cHgnLCBmb250U2l6ZTogJzExcHgnIH19Pnt0eXBlVGFnfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICB7LyogQWx3YXlzLXZpc2libGUgYXR0cmlidXRlIGZpZWxkIGxpc3QgKi99XHJcbiAgICAgICAgICAgICAgICAgIHtpc1NlbGVjdGVkICYmIGxheWVyLmZpZWxkcy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtmaWVsZFBpY2tlclN0eWxlfT5cclxuICAgICAgICAgICAgICAgICAgICAgIHsvKiBTZWFyY2ggKyBTZWxlY3QvQ2xlYXIgQWxsICovfVxyXG4gICAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInLCBnYXA6ICc0cHgnLCBtYXJnaW5Cb3R0b206ICc0cHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggZmllbGRzLi4uXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17Z2V0RmllbGRTZWFyY2gobGF5ZXIuaWQpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0TGF5ZXJGaWVsZFNlYXJjaChsYXllci5pZCwgZS50YXJnZXQudmFsdWUpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IGZsZXg6IDEsIHBhZGRpbmc6ICcycHggNnB4JywgZm9udFNpemU6ICcxMXB4JywgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLCBib3JkZXJSYWRpdXM6ICczcHgnLCBjb2xvcjogJyMwMDAnLCBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJyB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBvbkNsaWNrPXsoKSA9PiBzZWxlY3RBbGxBdHRyaWJ1dGVzKGxheWVyLmlkLCBsYXllci5maWVsZHMubWFwKGYgPT4gZi5uYW1lKSl9IHN0eWxlPXttaW5pQnRufT5BbGw8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17KCkgPT4gY2xlYXJBbGxBdHRyaWJ1dGVzKGxheWVyLmlkKX0gc3R5bGU9e21pbmlCdG59Pk5vbmU8L2J1dHRvbj5cclxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2xheWVyLmZpZWxkc1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAuZmlsdGVyKGYgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHEgPSBnZXRGaWVsZFNlYXJjaChsYXllci5pZCkudG9Mb3dlckNhc2UoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcSkgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGYuYWxpYXMgfHwgZi5uYW1lKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpIHx8IGYubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKHEpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlzQXR0clNlbGVjdGVkID0gbGF5ZXJDZmc/LmF0dHJpYnV0ZXM/LmluY2x1ZGVzKGYubmFtZSkgPz8gZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaGFzRG9tYWluID0gISEoS05PV05fRE9NQUlOU1tmLm5hbWVdKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBrZXk9e2YubmFtZX0gc3R5bGU9e3sgZGlzcGxheTogJ2Jsb2NrJywgZm9udFNpemU6ICcxMXB4JywgcGFkZGluZzogJzJweCAwJywgY3Vyc29yOiAncG9pbnRlcicsIGNvbG9yOiAnIzAwMCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hlY2tlZD17aXNBdHRyU2VsZWN0ZWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoKSA9PiB0b2dnbGVBdHRyaWJ1dGUobGF5ZXIuaWQsIGYubmFtZSl9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlPXt7IG1hcmdpblJpZ2h0OiAnNHB4JyB9fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtmLmFsaWFzIHx8IGYubmFtZX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnIzU1NScsIG1hcmdpbkxlZnQ6ICc0cHgnLCBmb250U2l6ZTogJzEwcHgnIH19Pnt0eXBlVGFnfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtoYXNEb21haW4gJiYgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjMDA3OWMxJywgbWFyZ2luTGVmdDogJzRweCcsIGZvbnRTaXplOiAnMTBweCcgfX0+4piFIGxhYmVsczwvc3Bhbj59XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgfSl9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICl9XHJcblxyXG4gICAgICAgICAgICAgICAgICB7aXNTZWxlY3RlZCAmJiBsYXllci5maWVsZHMubGVuZ3RoID09PSAwICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IC4uLmZpZWxkUGlja2VyU3R5bGUsIGNvbG9yOiAnIzg4OCcsIGZvbnRTdHlsZTogJ2l0YWxpYycgfX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICBObyB1c2VyIGF0dHJpYnV0ZXMgYXZhaWxhYmxlXHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICl9XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgIH0pfVxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogTWVhc3VyZSBQcmVjaXNpb24gKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT5NZWFzdXJlIFByZWNpc2lvbiAoZGVjaW1hbCBwbGFjZXMpPC9sYWJlbD5cclxuICAgICAgICA8cCBzdHlsZT17ZGVzY1N0eWxlfT5OdW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgdG8gZGlzcGxheSBmb3IgbWVhc3VyZSB2YWx1ZXMgKGUuZy4gMyA9IDEyLjM0NSBtaWxlcykuPC9wPlxyXG4gICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgdHlwZT1cIm51bWJlclwiXHJcbiAgICAgICAgICBtaW49ezB9XHJcbiAgICAgICAgICBtYXg9ezEwfVxyXG4gICAgICAgICAgdmFsdWU9e2NvbmZpZz8ubWVhc3VyZVByZWNpc2lvbiA/PyAzfVxyXG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVByZWNpc2lvbkNoYW5nZX1cclxuICAgICAgICAgIHN0eWxlPXt7IC4uLmlucHV0U3R5bGUsIHdpZHRoOiAnODBweCcgfX1cclxuICAgICAgICAvPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gIClcclxufVxyXG5cclxuLy8gU3R5bGVzXHJcbmNvbnN0IGZpZWxkR3JvdXBTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBtYXJnaW5Cb3R0b206ICcxNHB4J1xyXG59XHJcblxyXG5jb25zdCBsYWJlbFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgZm9udFNpemU6ICcxMnB4JyxcclxuICBmb250V2VpZ2h0OiA2MDAsXHJcbiAgbWFyZ2luQm90dG9tOiAnNHB4JyxcclxuICBjb2xvcjogJyNmZmYnXHJcbn1cclxuXHJcbmNvbnN0IGRlc2NTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBmb250U2l6ZTogJzExcHgnLFxyXG4gIGNvbG9yOiAncmdiYSgyNTUsMjU1LDI1NSwwLjc1KScsXHJcbiAgbWFyZ2luOiAnMCAwIDZweCAwJyxcclxuICBsaW5lSGVpZ2h0OiAnMS40J1xyXG59XHJcblxyXG5jb25zdCBpbnB1dFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIHdpZHRoOiAnMTAwJScsXHJcbiAgcGFkZGluZzogJzZweCA4cHgnLFxyXG4gIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICM5OTknLFxyXG4gIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXHJcbiAgY29sb3I6ICcjMDAwJyxcclxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJ1xyXG59XHJcblxyXG5jb25zdCBtaW5pQnRuOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIHBhZGRpbmc6ICcycHggNnB4JyxcclxuICBmb250U2l6ZTogJzEwcHgnLFxyXG4gIGJvcmRlcjogJzFweCBzb2xpZCAjOTk5JyxcclxuICBib3JkZXJSYWRpdXM6ICczcHgnLFxyXG4gIGJhY2tncm91bmRDb2xvcjogJyNmZmYnLFxyXG4gIGNvbG9yOiAnIzAwMCcsXHJcbiAgY3Vyc29yOiAncG9pbnRlcicsXHJcbiAgd2hpdGVTcGFjZTogJ25vd3JhcCdcclxufVxyXG5cclxuY29uc3QgbG9hZEJ0blN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIG1hcmdpblRvcDogJzRweCcsXHJcbiAgcGFkZGluZzogJzRweCAxMnB4JyxcclxuICBmb250U2l6ZTogJzEycHgnLFxyXG4gIGJvcmRlcjogJzFweCBzb2xpZCAjOTk5JyxcclxuICBib3JkZXJSYWRpdXM6ICczcHgnLFxyXG4gIGJhY2tncm91bmRDb2xvcjogJyNmZmYnLFxyXG4gIGNvbG9yOiAnIzAwMCcsXHJcbiAgY3Vyc29yOiAncG9pbnRlcidcclxufVxyXG5cclxuY29uc3QgZXZlbnRMaXN0U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgbWF4SGVpZ2h0OiAnMzAwcHgnLFxyXG4gIG92ZXJmbG93OiAnYXV0bycsXHJcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICM5OTknLFxyXG4gIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgcGFkZGluZzogJzZweCcsXHJcbiAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsXHJcbiAgY29sb3I6ICcjMDAwJ1xyXG59XHJcblxyXG5jb25zdCBmaWVsZFBpY2tlclN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIG1hcmdpbkxlZnQ6ICcyMHB4JyxcclxuICBtYXJnaW5Ub3A6ICc0cHgnLFxyXG4gIHBhZGRpbmc6ICc0cHggOHB4JyxcclxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjZjBmMGYwJyxcclxuICBib3JkZXI6ICcxcHggc29saWQgI2NjYycsXHJcbiAgYm9yZGVyUmFkaXVzOiAnM3B4JyxcclxuICBjb2xvcjogJyMwMDAnXHJcbn1cclxuXHJcbmNvbnN0IGVycm9yU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgbWFyZ2luVG9wOiAnNHB4JyxcclxuICBmb250U2l6ZTogJzExcHgnLFxyXG4gIGNvbG9yOiAnI2Q4MzAyMCdcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgU2V0dGluZ1xyXG5cbiBleHBvcnQgZnVuY3Rpb24gX19zZXRfd2VicGFja19wdWJsaWNfcGF0aF9fKHVybCkgeyBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHVybCB9Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9