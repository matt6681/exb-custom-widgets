System.register(["jimu-core/emotion","jimu-core","jimu-ui/advanced/setting-components"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_ui_advanced_setting_components__, "__esModule", { value: true });
	return {
		setters: [
			function(module) {
				__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__["default"] = module["default"] || module;
				Object.keys(module).forEach(function(key) {
					__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__[key] = module[key];
				});
			},
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

/***/ "@emotion/react/jsx-runtime"
/*!************************************!*\
  !*** external "jimu-core/emotion" ***!
  \************************************/
(module) {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__;

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
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
/* harmony import */ var jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jimu-ui/advanced/setting-components */ "jimu-ui/advanced/setting-components");
/* harmony import */ var _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../lrs-utils/lrs-service */ "./your-extensions/widgets/road-log/src/lrs-utils/lrs-service.ts");
/* harmony import */ var _lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lrs-utils/utils/known-domains */ "./your-extensions/widgets/road-log/src/lrs-utils/utils/known-domains.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};





const { useState, useCallback, useEffect } = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React;
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
        var _a, _b;
        if (!url.trim())
            return;
        setLoadingService(true);
        setServiceError(null);
        try {
            const lrs = new _lrs_utils_lrs_service__WEBPACK_IMPORTED_MODULE_3__.LrsService(url.trim());
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
                catch (_c) {
                    // fallback
                }
            }
            // Fetch field info for each event layer
            const layers = [];
            for (const el of (info.eventLayers || [])) {
                try {
                    const detail = yield lrs.getEventLayerInfo(el.id);
                    const userFields = (detail.fields || []).filter(f => !SYSTEM_FIELDS.includes(f.name) &&
                        f.type !== 'esriFieldTypeOID' &&
                        f.type !== 'esriFieldTypeGeometry');
                    layers.push({
                        id: el.id,
                        name: el.name,
                        type: el.type,
                        fields: userFields.map(f => ({ name: f.name, alias: f.alias || f.name, type: f.type })),
                        routeIdFieldName: detail.routeIdFieldName || 'routeid',
                        fromMeasureFieldName: detail.fromMeasureFieldName || 'frommeasure',
                        toMeasureFieldName: detail.toMeasureFieldName || null
                    });
                }
                catch (_d) {
                    layers.push({
                        id: el.id, name: el.name, type: el.type, fields: [],
                        routeIdFieldName: 'routeid', fromMeasureFieldName: 'frommeasure', toMeasureFieldName: null
                    });
                }
            }
            setDiscoveredLayers(layers);
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
                if (_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_4__.KNOWN_DOMAINS[f.name]) {
                    overrides[f.name] = _lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_4__.KNOWN_DOMAINS[f.name];
                }
            }
            const newLayer = Object.assign(Object.assign({ layerId: layer.id, name: layer.name, type: layer.type, attributes: layer.fields.map(f => f.name), routeIdField: layer.routeIdFieldName }, (layer.type.includes('Point')
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
    return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "p-3", style: { fontSize: '13px' }, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h5", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '12px' }, children: "Road Log Settings" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: fieldGroupStyle, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { style: labelStyle, children: "LRS Service URL" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "text", value: (config === null || config === void 0 ? void 0 : config.lrsServiceUrl) || '', onChange: handleUrlChange, onBlur: handleUrlBlur, style: inputStyle, placeholder: "https://.../MapServer/exts/LRServer" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", { type: "button", onClick: handleUrlBlur, style: loadBtnStyle, children: [loadingService ? 'Loading...' : 'Load Service', (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: fieldGroupStyle, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { style: labelStyle, children: "Map Widget (for polygon select)" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_ui_advanced_setting_components__WEBPACK_IMPORTED_MODULE_2__.MapWidgetSelector, { onSelect: handleMapWidgetChange, useMapWidgetIds: props.useMapWidgetIds })] })] }), serviceError && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: errorStyle, children: serviceError })] }), networkLayers.length > 1 && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: fieldGroupStyle, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { style: labelStyle, children: "Network Layer" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("select", { value: (_a = config === null || config === void 0 ? void 0 : config.networkLayerId) !== null && _a !== void 0 ? _a : '', onChange: handleNetworkChange, style: inputStyle, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: "", children: "-- Select Network --" }), networkLayers.map(n => ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("option", { value: n.id, children: n.name }, n.id)))] })] })), discoveredLayers.length > 0 && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: fieldGroupStyle, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { style: labelStyle, children: "Event Layers & Attributes" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: eventListStyle, children: discoveredLayers.map(layer => {
                            const layerCfg = getLayerConfig(layer.id);
                            const isSelected = !!layerCfg;
                            const typeTag = layer.type.includes('Point') ? '(Marker)' : '(Linear)';
                            return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: { marginBottom: '10px' }, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: { display: 'flex', alignItems: 'center' }, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", checked: isSelected, onChange: () => toggleEventLayer(layer) }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { style: { marginLeft: '4px', fontSize: '12px', fontWeight: 600 }, children: layer.name }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { style: { color: '#666', marginLeft: '6px', fontSize: '11px' }, children: typeTag })] }), isSelected && layer.fields.length > 0 && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: fieldPickerStyle, children: layer.fields.map(f => {
                                            var _a, _b;
                                            const isAttrSelected = (_b = (_a = layerCfg === null || layerCfg === void 0 ? void 0 : layerCfg.attributes) === null || _a === void 0 ? void 0 : _a.includes(f.name)) !== null && _b !== void 0 ? _b : false;
                                            const hasDomain = !!(_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_4__.KNOWN_DOMAINS[f.name]);
                                            return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("label", { style: { display: 'block', fontSize: '11px', padding: '2px 0', cursor: 'pointer' }, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "checkbox", checked: isAttrSelected, onChange: () => toggleAttribute(layer.id, f.name), style: { marginRight: '4px' } }), f.alias || f.name, (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { style: { color: '#888', marginLeft: '4px', fontSize: '10px' }, children: typeTag }), hasDomain && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("span", { style: { color: '#0079c1', marginLeft: '4px', fontSize: '10px' }, children: "\u2605 labels" })] }, f.name));
                                        }) })), isSelected && layer.fields.length === 0 && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: Object.assign(Object.assign({}, fieldPickerStyle), { color: '#888', fontStyle: 'italic' }), children: "No user attributes available" }))] }, layer.id));
                        }) })] })), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: fieldGroupStyle, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("label", { style: labelStyle, children: "Measure Precision (decimal places)" }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("input", { type: "number", min: 0, max: 10, value: (_b = config === null || config === void 0 ? void 0 : config.measurePrecision) !== null && _b !== void 0 ? _b : 3, onChange: handlePrecisionChange, style: Object.assign(Object.assign({}, inputStyle), { width: '80px' }) })] })] }));
};
// Styles
const fieldGroupStyle = {
    marginBottom: '14px'
};
const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '4px',
    color: '#333'
};
const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    fontSize: '12px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box'
};
const loadBtnStyle = {
    marginTop: '4px',
    padding: '4px 12px',
    fontSize: '12px',
    border: '1px solid #ccc',
    borderRadius: '3px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer'
};
const eventListStyle = {
    maxHeight: '300px',
    overflow: 'auto',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
    padding: '6px'
};
const fieldPickerStyle = {
    marginLeft: '20px',
    marginTop: '4px',
    padding: '4px 8px',
    backgroundColor: '#f9f9f9',
    border: '1px solid #e8e8e8',
    borderRadius: '3px'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9yb2FkLWxvZy9kaXN0L3NldHRpbmcvc2V0dGluZy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWFBLElBQUksWUFBWSxHQUFHLENBQUM7QUFFcEI7OztHQUdHO0FBQ0gsU0FBUyxZQUFZLENBQUUsR0FBVyxFQUFFLE1BQThCO0lBQ2hFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7UUFDckMsTUFBTSxZQUFZLEdBQUcsV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksWUFBWSxFQUFFLEVBQUU7UUFDOUQsTUFBTSxDQUFDLFFBQVEsR0FBRyxZQUFZO1FBRTlCLE1BQU0sRUFBRSxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRTtRQUNqRCxNQUFNLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxFQUFFLEVBQUU7UUFFaEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUM7UUFDL0MsTUFBTSxDQUFDLEdBQUcsR0FBRyxTQUFTO1FBRXRCLE1BQU0sT0FBTyxHQUFHLEdBQUcsRUFBRTtZQUNuQixPQUFRLE1BQWMsQ0FBQyxZQUFZLENBQUM7WUFDcEMsSUFBSSxNQUFNLENBQUMsVUFBVTtnQkFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7UUFDOUQsQ0FBQyxDQUVBO1FBQUMsTUFBYyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBUyxFQUFFLEVBQUU7WUFDN0MsT0FBTyxFQUFFO1lBQ1QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2YsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLGVBQWUsQ0FBQyxDQUFDO1lBQzFELENBQUM7aUJBQU0sQ0FBQztnQkFDTixP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WSxHQUF3QjtJQUN4QyxTQUFTLEVBQUUsS0FBSztJQUNoQixPQUFPLEVBQUUsVUFBVTtJQUNuQixRQUFRLEVBQUUsTUFBTTtJQUNoQixNQUFNLEVBQUUsZ0JBQWdCO0lBQ3hCLFlBQVksRUFBRSxLQUFLO0lBQ25CLGVBQWUsRUFBRSxTQUFTO0lBQzFCLE1BQU0sRUFBRSxTQUFTO0NBQ2xCO0FBRUQsTUFBTSxjQUFjLEdBQXdCO0lBQzFDLFNBQVMsRUFBRSxPQUFPO0lBQ2xCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE1BQU0sRUFBRSxtQkFBbUI7SUFDM0IsWUFBWSxFQUFFLEtBQUs7SUFDbkIsT0FBTyxFQUFFLEtBQUs7Q0FDZjtBQUVELE1BQU0sZ0JBQWdCLEdBQXdCO0lBQzVDLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLGVBQWUsRUFBRSxTQUFTO0lBQzFCLE1BQU0sRUFBRSxtQkFBbUI7SUFDM0IsWUFBWSxFQUFFLEtBQUs7Q0FDcEI7QUFFRCxNQUFNLFVBQVUsR0FBd0I7SUFDdEMsU0FBUyxFQUFFLEtBQUs7SUFDaEIsUUFBUSxFQUFFLE1BQU07SUFDaEIsS0FBSyxFQUFFLFNBQVM7Q0FDakI7QUFFRCxpRUFBZSxPQUFPO0FBRWQsU0FBUywyQkFBMkIsQ0FBQyxHQUFHLElBQUkscUJBQXVCLEdBQUcsR0FBRyxFQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvcm9hZC1sb2cvc3JjL2xycy11dGlscy9scnMtc2VydmljZS50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4veW91ci1leHRlbnNpb25zL3dpZGdldHMvcm9hZC1sb2cvc3JjL2xycy11dGlscy91dGlscy9rbm93bi1kb21haW5zLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS1jb3JlXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmUvZW1vdGlvblwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS11aS9hZHZhbmNlZC9zZXR0aW5nLWNvbXBvbmVudHNcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3JvYWQtbG9nL3NyYy9zZXR0aW5nL3NldHRpbmcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIExSUyBSRVNUIEFQSSBTZXJ2aWNlIHdyYXBwZXJcclxuLy8gVXNlcyBKU09OUCB0byBieXBhc3MgQ09SUyBpc3N1ZXMgd2l0aCBtaXNjb25maWd1cmVkIHNlcnZlcnMgKGR1cGxpY2F0ZSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4gaGVhZGVycylcclxuaW1wb3J0IHR5cGUge1xyXG4gIExyc1NlcnZpY2VJbmZvLFxyXG4gIE5ldHdvcmtMYXllckluZm8sXHJcbiAgRXZlbnRMYXllckluZm8sXHJcbiAgTWVhc3VyZVRvR2VvbWV0cnlMb2NhdGlvbixcclxuICBNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdCxcclxuICBHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdCxcclxuICBRdWVyeUF0dHJpYnV0ZVNldFBhcmFtcyxcclxuICBGZWF0dXJlU2V0UmVzdWx0XHJcbn0gZnJvbSAnLi90eXBlcydcclxuXHJcbmxldCBqc29ucENvdW50ZXIgPSAwXHJcblxyXG4vKipcclxuICogSlNPTlAgcmVxdWVzdCDigJQgYnlwYXNzZXMgQ09SUyBlbnRpcmVseSBieSBpbmplY3RpbmcgYSA8c2NyaXB0PiB0YWcuXHJcbiAqIEFyY0dJUyBSRVNUIEFQSSBzdXBwb3J0cyBKU09OUCB2aWEgdGhlICdjYWxsYmFjaycgcGFyYW1ldGVyLlxyXG4gKi9cclxuZnVuY3Rpb24ganNvbnBSZXF1ZXN0ICh1cmw6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxhbnk+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgY2FsbGJhY2tOYW1lID0gYF9scnNfY2JfJHtEYXRlLm5vdygpfV8ke2pzb25wQ291bnRlcisrfWBcclxuICAgIHBhcmFtcy5jYWxsYmFjayA9IGNhbGxiYWNrTmFtZVxyXG5cclxuICAgIGNvbnN0IHFzID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhwYXJhbXMpLnRvU3RyaW5nKClcclxuICAgIGNvbnN0IHNjcmlwdFVybCA9IGAke3VybH0/JHtxc31gXHJcblxyXG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcclxuICAgIHNjcmlwdC5zcmMgPSBzY3JpcHRVcmxcclxuXHJcbiAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xyXG4gICAgICBkZWxldGUgKHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV1cclxuICAgICAgaWYgKHNjcmlwdC5wYXJlbnROb2RlKSBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXHJcbiAgICB9XHJcblxyXG4gICAgOyh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKGRhdGEuZXJyb3IubWVzc2FnZSB8fCAnUmVxdWVzdCBlcnJvcicpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4ge1xyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgcmVqZWN0KG5ldyBFcnJvcignSlNPTlAgcmVxdWVzdCBmYWlsZWQnKSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0pIHtcclxuICAgICAgICBjbGVhbnVwKClcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdSZXF1ZXN0IHRpbWVvdXQnKSlcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDApXHJcblxyXG4gICAgOyh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpXHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlIHx8ICdSZXF1ZXN0IGVycm9yJykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXHJcbiAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFdyYXBwZXIgYXJvdW5kIEFyY0dJUyBMUlMgUkVTVCBBUEkgKExSU2VydmVyIGV4dGVuc2lvbikuXHJcbiAqIFVzZXMgSlNPTlAgZm9yIGFsbCByZXF1ZXN0cyB0byBhdm9pZCBDT1JTIGlzc3Vlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBMcnNTZXJ2aWNlIHtcclxuICBwcml2YXRlIGJhc2VVcmw6IHN0cmluZ1xyXG4gIHByaXZhdGUgdG9rZW46IHN0cmluZyB8IG51bGxcclxuXHJcbiAgY29uc3RydWN0b3IgKGJhc2VVcmw6IHN0cmluZywgdG9rZW4/OiBzdHJpbmcpIHtcclxuICAgIC8vIEVuc3VyZSBubyB0cmFpbGluZyBzbGFzaFxyXG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKVxyXG4gICAgdGhpcy50b2tlbiA9IHRva2VuIHx8IG51bGxcclxuICB9XHJcblxyXG4gIHNldFRva2VuICh0b2tlbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIExSUyBzZXJ2aWNlIG1ldGFkYXRhIChuZXR3b3JrIGxheWVycywgZXZlbnQgbGF5ZXJzLCBldGMuKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldFNlcnZpY2VJbmZvICgpOiBQcm9taXNlPExyc1NlcnZpY2VJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PExyc1NlcnZpY2VJbmZvPignJylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGRldGFpbGVkIGluZm8gZm9yIGEgbmV0d29yayBsYXllciAoZmllbGRzLCBtZWFzdXJlIHByZWNpc2lvbiwgZXRjLilcclxuICAgKi9cclxuICBhc3luYyBnZXROZXR3b3JrTGF5ZXJJbmZvIChsYXllcklkOiBudW1iZXIpOiBQcm9taXNlPE5ldHdvcmtMYXllckluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8TmV0d29ya0xheWVySW5mbz4oYC9uZXR3b3JrTGF5ZXJzLyR7bGF5ZXJJZH1gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggZGV0YWlsZWQgaW5mbyBmb3IgYW4gZXZlbnQgbGF5ZXJcclxuICAgKi9cclxuICBhc3luYyBnZXRFdmVudExheWVySW5mbyAobGF5ZXJJZDogbnVtYmVyKTogUHJvbWlzZTxFdmVudExheWVySW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxFdmVudExheWVySW5mbz4oYC9ldmVudExheWVycy8ke2xheWVySWR9YClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgcm91dGUgSUQgKyBtZWFzdXJlcyB0byBtYXAgZ2VvbWV0cnlcclxuICAgKi9cclxuICBhc3luYyBtZWFzdXJlVG9HZW9tZXRyeSAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgbG9jYXRpb25zOiBNZWFzdXJlVG9HZW9tZXRyeUxvY2F0aW9uW10sXHJcbiAgICBvdXRTUj86IGFueVxyXG4gICk6IFByb21pc2U8TWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChvdXRTUikge1xyXG4gICAgICBwYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShvdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8TWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vbWVhc3VyZVRvR2VvbWV0cnlgLFxyXG4gICAgICBwYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgbWFwIGdlb21ldHJ5IChwb2ludCkgdG8gcm91dGUgKyBtZWFzdXJlXHJcbiAgICovXHJcbiAgYXN5bmMgZ2VvbWV0cnlUb01lYXN1cmUgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIGxvY2F0aW9uczogQXJyYXk8eyBnZW9tZXRyeTogYW55IH0+LFxyXG4gICAgb3V0U1I/OiBhbnlcclxuICApOiBQcm9taXNlPEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0PiB7XHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkobG9jYXRpb25zKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAob3V0U1IpIHtcclxuICAgICAgcGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkob3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L2dlb21ldHJ5VG9NZWFzdXJlYCxcclxuICAgICAgcGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEeW5hbWljIHNlZ21lbnRhdGlvbiBvdmVybGF5IOKAlCBxdWVyeUF0dHJpYnV0ZVNldFxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5QXR0cmlidXRlU2V0IChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBwYXJhbXM6IFF1ZXJ5QXR0cmlidXRlU2V0UGFyYW1zXHJcbiAgKTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0UGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5sb2NhdGlvbnMpLFxyXG4gICAgICBhdHRyaWJ1dGVTZXQ6IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5hdHRyaWJ1dGVTZXQpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChwYXJhbXMub3V0U1IpIHtcclxuICAgICAgcmVxdWVzdFBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5vdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8RmVhdHVyZVNldFJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9xdWVyeUF0dHJpYnV0ZVNldGAsXHJcbiAgICAgIHJlcXVlc3RQYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YW5kYXJkIGZlYXR1cmUgcXVlcnkgYWdhaW5zdCBhIG1hcCBzZXJ2aWNlIGxheWVyIChmb3IgUm9hZCBMb2cgaW5kaXZpZHVhbCBldmVudCBxdWVyaWVzKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5RmVhdHVyZXMgKFxyXG4gICAgbWFwU2VydmljZVVybDogc3RyaW5nLFxyXG4gICAgbGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgd2hlcmU6IHN0cmluZyxcclxuICAgIG91dEZpZWxkczogc3RyaW5nW10gPSBbJyonXVxyXG4gICk6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgLy8gVGhlIG1hcCBzZXJ2aWNlIFVSTCBpcyB0aGUgcGFyZW50IG9mIExSU2VydmVyIGV4dGVuc2lvblxyXG4gICAgLy8gZS5nLiAuLi4vTWFwU2VydmVyLzAvcXVlcnlcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSB0aGlzLmJhc2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7bGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICB3aGVyZSxcclxuICAgICAgb3V0RmllbGRzOiBvdXRGaWVsZHMuam9pbignLCcpLFxyXG4gICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpcmVjdCBxdWVyeSB3aXRoIGFyYml0cmFyeSBwYXJhbXMgKGZvciBzcGF0aWFsIHF1ZXJpZXMgdmlhIEpTT05QKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5RmVhdHVyZXNEaXJlY3QgKHVybDogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuICAgIHBhcmFtcy5mID0gcGFyYW1zLmYgfHwgJ2pzb24nXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUXVlcnkgcm91dGVzIG9uIGEgbmV0d29yayBsYXllciAoZm9yIHJvdXRlIHBpY2tlciBhdXRvY29tcGxldGUpXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlSb3V0ZXMgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIHNlYXJjaFRleHQ6IHN0cmluZyxcclxuICAgIHJvdXRlSWRGaWVsZDogc3RyaW5nLFxyXG4gICAgcm91dGVOYW1lRmllbGQ6IHN0cmluZyB8IG51bGwsXHJcbiAgICBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMFxyXG4gICk6IFByb21pc2U8QXJyYXk8eyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9Pj4ge1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IHRoaXMuYmFzZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtuZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgY29uc3Qgc2VhcmNoRmllbGQgPSByb3V0ZU5hbWVGaWVsZCB8fCByb3V0ZUlkRmllbGRcclxuICAgIGNvbnN0IHdoZXJlID0gYFVQUEVSKCR7c2VhcmNoRmllbGR9KSBMSUtFIFVQUEVSKCcke3NlYXJjaFRleHQucmVwbGFjZSgvJy9nLCBcIicnXCIpfSUnKWBcclxuICAgIGNvbnN0IG91dEZpZWxkcyA9IHJvdXRlTmFtZUZpZWxkXHJcbiAgICAgID8gW3JvdXRlSWRGaWVsZCwgcm91dGVOYW1lRmllbGRdXHJcbiAgICAgIDogW3JvdXRlSWRGaWVsZF1cclxuXHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIHdoZXJlLFxyXG4gICAgICBvdXRGaWVsZHM6IG91dEZpZWxkcy5qb2luKCcsJyksXHJcbiAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICByZXN1bHRSZWNvcmRDb3VudDogbWF4UmVzdWx0cy50b1N0cmluZygpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBqc29uID0gYXdhaXQganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG5cclxuICAgIGNvbnN0IGFsbCA9IChqc29uLmZlYXR1cmVzIHx8IFtdKS5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlSWRGaWVsZF0sXHJcbiAgICAgIHJvdXRlTmFtZTogcm91dGVOYW1lRmllbGQgPyBmLmF0dHJpYnV0ZXNbcm91dGVOYW1lRmllbGRdIDogbnVsbFxyXG4gICAgfSkpXHJcbiAgICAvLyBEZWR1cGxpY2F0ZSBieSByb3V0ZUlkXHJcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcclxuICAgIHJldHVybiBhbGwuZmlsdGVyKChyOiBhbnkpID0+IHtcclxuICAgICAgaWYgKHNlZW4uaGFzKHIucm91dGVJZCkpIHJldHVybiBmYWxzZVxyXG4gICAgICBzZWVuLmFkZChyLnJvdXRlSWQpXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLy8gLS0tIFByaXZhdGUgaGVscGVycyAtLS1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyByZXF1ZXN0PFQ+IChwYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPFQ+IHtcclxuICAgIGNvbnN0IHVybCA9IGAke3RoaXMuYmFzZVVybH0ke3BhdGh9YFxyXG4gICAgY29uc3QgYWxsUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBmOiAnanNvbicsXHJcbiAgICAgIC4uLnBhcmFtc1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgYWxsUGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBhbGxQYXJhbXMpIGFzIFByb21pc2U8VD5cclxuICB9XHJcbn1cclxuIiwiLy8gV2VsbC1rbm93biBjb2RlZCB2YWx1ZSBkb21haW5zIGZvciBjb21tb24gTFJTIGZpZWxkcy5cclxuLy8gVGhlc2UgcHJvdmlkZSBodW1hbi1yZWFkYWJsZSBsYWJlbHMgd2hlbiB0aGUgc2VydmljZSBsYWNrcyBjb2RlZCB2YWx1ZSBkb21haW5zLlxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBLbm93bkRvbWFpbk1hcCB7XHJcbiAgW2ZpZWxkTmFtZTogc3RyaW5nXTogeyBbY29kZTogc3RyaW5nXTogc3RyaW5nIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZIV0EgRnVuY3Rpb25hbCBDbGFzc2lmaWNhdGlvbiBTeXN0ZW1cclxuICogaHR0cHM6Ly93d3cuZmh3YS5kb3QuZ292L3BsYW5uaW5nL3Byb2Nlc3Nlcy9zdGF0ZXdpZGUvcmVsYXRlZC9oaWdod2F5X2Z1bmN0aW9uYWxfY2xhc3NpZmljYXRpb25zL1xyXG4gKi9cclxuY29uc3QgRkhXQV9GVU5DVElPTkFMX0NMQVNTOiB7IFtjb2RlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAnMCc6ICdVbmtub3duJyxcclxuICAnMSc6ICdSdXJhbCBJbnRlcnN0YXRlJyxcclxuICAnMic6ICdSdXJhbCBQcmluY2lwYWwgQXJ0ZXJpYWwnLFxyXG4gICczJzogJ1J1cmFsIE1pbm9yIEFydGVyaWFsJyxcclxuICAnNCc6ICdSdXJhbCBNYWpvciBDb2xsZWN0b3InLFxyXG4gICc1JzogJ1J1cmFsIE1pbm9yIENvbGxlY3RvcicsXHJcbiAgJzYnOiAnUnVyYWwgTG9jYWwnLFxyXG4gICc3JzogJ1VyYmFuIEludGVyc3RhdGUnLFxyXG4gICc4JzogJ1VyYmFuIEZyZWV3YXkvRXhwcmVzc3dheScsXHJcbiAgJzknOiAnVXJiYW4gUHJpbmNpcGFsIEFydGVyaWFsJyxcclxuICAnMTAnOiAnVXJiYW4gTWlub3IgQXJ0ZXJpYWwnLFxyXG4gICcxMSc6ICdVcmJhbiBDb2xsZWN0b3InLFxyXG4gICcxMic6ICdVcmJhbiBMb2NhbCdcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hcCBvZiBmaWVsZCBuYW1lcyB0byB0aGVpciBrbm93biBkb21haW4gbG9va3Vwcy5cclxuICogRmllbGQgbmFtZSBtYXRjaGluZyBpcyBjYXNlLXNlbnNpdGl2ZS5cclxuICovXHJcbmV4cG9ydCBjb25zdCBLTk9XTl9ET01BSU5TOiBLbm93bkRvbWFpbk1hcCA9IHtcclxuICBmdW5jdGlvbmFsY2xhc3N0eXBlOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1MsXHJcbiAgZnVuY3Rpb25hbGNsYXNzOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1MsXHJcbiAgZnVuY3Rpb25hbF9jbGFzczogRkhXQV9GVU5DVElPTkFMX0NMQVNTLFxyXG4gIGZ1bmNfY2xhc3M6IEZIV0FfRlVOQ1RJT05BTF9DTEFTUyxcclxuICBGdW5jdGlvbmFsQ2xhc3NUeXBlOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1MsXHJcbiAgRnVuY3Rpb25hbENsYXNzOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1NcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc29sdmUgYSByYXcgY29kZSB0byBhIGRpc3BsYXkgbGFiZWwgdXNpbmcga25vd24gZG9tYWlucy5cclxuICogUmV0dXJucyBudWxsIGlmIG5vIG1hcHBpbmcgZXhpc3RzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVLbm93bkRvbWFpbiAoZmllbGROYW1lOiBzdHJpbmcsIGNvZGU6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gIGNvbnN0IGRvbWFpbiA9IEtOT1dOX0RPTUFJTlNbZmllbGROYW1lXVxyXG4gIGlmICghZG9tYWluKSByZXR1cm4gbnVsbFxyXG4gIGNvbnN0IGtleSA9IFN0cmluZyhjb2RlKVxyXG4gIHJldHVybiBkb21haW5ba2V5XSA/PyBudWxsXHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfY29yZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9fZW1vdGlvbl9yZWFjdF9qc3hfcnVudGltZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X3VpX2FkdmFuY2VkX3NldHRpbmdfY29tcG9uZW50c19fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGV4aXN0cyAoZGV2ZWxvcG1lbnQgb25seSlcblx0aWYgKF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiaW1wb3J0IHsgUmVhY3QgfSBmcm9tICdqaW11LWNvcmUnXHJcbmltcG9ydCB0eXBlIHsgQWxsV2lkZ2V0U2V0dGluZ1Byb3BzIH0gZnJvbSAnamltdS1mb3ItYnVpbGRlcidcclxuaW1wb3J0IHsgTWFwV2lkZ2V0U2VsZWN0b3IgfSBmcm9tICdqaW11LXVpL2FkdmFuY2VkL3NldHRpbmctY29tcG9uZW50cydcclxuaW1wb3J0IHR5cGUgeyBJTUNvbmZpZywgRXZlbnRMYXllckNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHsgTHJzU2VydmljZSB9IGZyb20gJy4uL2xycy11dGlscy9scnMtc2VydmljZSdcclxuaW1wb3J0IHsgS05PV05fRE9NQUlOUyB9IGZyb20gJy4uL2xycy11dGlscy91dGlscy9rbm93bi1kb21haW5zJ1xyXG5cclxuY29uc3QgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCB9ID0gUmVhY3RcclxuXHJcbmludGVyZmFjZSBEaXNjb3ZlcmVkTGF5ZXIge1xyXG4gIGlkOiBudW1iZXJcclxuICBuYW1lOiBzdHJpbmdcclxuICB0eXBlOiBzdHJpbmdcclxuICBmaWVsZHM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBhbGlhczogc3RyaW5nOyB0eXBlOiBzdHJpbmcgfT5cclxuICByb3V0ZUlkRmllbGROYW1lOiBzdHJpbmdcclxuICBmcm9tTWVhc3VyZUZpZWxkTmFtZTogc3RyaW5nXHJcbiAgdG9NZWFzdXJlRmllbGROYW1lOiBzdHJpbmcgfCBudWxsXHJcbn1cclxuXHJcbmNvbnN0IFNldHRpbmcgPSAocHJvcHM6IEFsbFdpZGdldFNldHRpbmdQcm9wczxJTUNvbmZpZz4pID0+IHtcclxuICBjb25zdCBjb25maWcgPSBwcm9wcy5jb25maWdcclxuXHJcbiAgY29uc3QgW25ldHdvcmtMYXllcnMsIHNldE5ldHdvcmtMYXllcnNdID0gdXNlU3RhdGU8QXJyYXk8eyBpZDogbnVtYmVyOyBuYW1lOiBzdHJpbmcgfT4+KFtdKVxyXG4gIGNvbnN0IFtkaXNjb3ZlcmVkTGF5ZXJzLCBzZXREaXNjb3ZlcmVkTGF5ZXJzXSA9IHVzZVN0YXRlPERpc2NvdmVyZWRMYXllcltdPihbXSlcclxuICBjb25zdCBbbG9hZGluZ1NlcnZpY2UsIHNldExvYWRpbmdTZXJ2aWNlXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtzZXJ2aWNlRXJyb3IsIHNldFNlcnZpY2VFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxyXG5cclxuICAvLyBTeXN0ZW0gZmllbGRzIHRoYXQgc2hvdWxkbid0IGFwcGVhciBpbiB0aGUgYXR0cmlidXRlIHBpY2tlclxyXG4gIGNvbnN0IFNZU1RFTV9GSUVMRFMgPSBbXHJcbiAgICAnT0JKRUNUSUQnLCAnU2hhcGUnLCAnc2hhcGUnLCAncm91dGVpZCcsICdyaWQnLCAnZnJvbW1lYXN1cmUnLCAndG9tZWFzdXJlJyxcclxuICAgICdtZWFzJywgJ2Zyb21kYXRlJywgJ3RvZGF0ZScsICdldmVudGlkJywgJ0xvY0Vycm9yJywgJ2xvY2Vycm9yJyxcclxuICAgICdTaGFwZV9MZW5ndGgnLCAnc2hhcGUuU1RMZW5ndGgoKScsICdyZWNvcmRkYXRlJ1xyXG4gIF1cclxuXHJcbiAgY29uc3QgdXBkYXRlQ29uZmlnID0gdXNlQ2FsbGJhY2soKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB7XHJcbiAgICBwcm9wcy5vblNldHRpbmdDaGFuZ2Uoe1xyXG4gICAgICBpZDogcHJvcHMuaWQsXHJcbiAgICAgIGNvbmZpZzogcHJvcHMuY29uZmlnLnNldChrZXksIHZhbHVlKVxyXG4gICAgfSlcclxuICB9LCBbcHJvcHNdKVxyXG5cclxuICAvLyBMb2FkIHNlcnZpY2UgaW5mbyB3aGVuIFVSTCBjaGFuZ2VzXHJcbiAgY29uc3QgbG9hZFNlcnZpY2VJbmZvID0gdXNlQ2FsbGJhY2soYXN5bmMgKHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIXVybC50cmltKCkpIHJldHVyblxyXG4gICAgc2V0TG9hZGluZ1NlcnZpY2UodHJ1ZSlcclxuICAgIHNldFNlcnZpY2VFcnJvcihudWxsKVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxycyA9IG5ldyBMcnNTZXJ2aWNlKHVybC50cmltKCkpXHJcbiAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBscnMuZ2V0U2VydmljZUluZm8oKVxyXG5cclxuICAgICAgY29uc3QgbmV0cyA9IChpbmZvLm5ldHdvcmtMYXllcnMgfHwgW10pLm1hcChuID0+ICh7IGlkOiBuLmlkLCBuYW1lOiBuLm5hbWUgfSkpXHJcbiAgICAgIHNldE5ldHdvcmtMYXllcnMobmV0cylcclxuXHJcbiAgICAgIC8vIERpc2NvdmVyIG5ldHdvcmsgbGF5ZXIgcm91dGUgSUQgZmllbGRcclxuICAgICAgaWYgKG5ldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTmV0SWQgPSAocHJvcHMuY29uZmlnIGFzIGFueSk/Lm5ldHdvcmtMYXllcklkID8/IG5ldHNbMF0uaWRcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgbmV0RGV0YWlsID0gYXdhaXQgbHJzLmdldE5ldHdvcmtMYXllckluZm8oc2VsZWN0ZWROZXRJZClcclxuICAgICAgICAgIGNvbnN0IG5ldFJvdXRlRmllbGQgPSAobmV0RGV0YWlsIGFzIGFueSkucm91dGVJZEZpZWxkTmFtZSB8fCAncm91dGVpZCdcclxuICAgICAgICAgIGNvbnN0IG5ldFJvdXRlTmFtZUZpZWxkID0gKG5ldERldGFpbCBhcyBhbnkpLnJvdXRlTmFtZUZpZWxkTmFtZSB8fCBudWxsXHJcbiAgICAgICAgICB1cGRhdGVDb25maWcoJ25ldHdvcmtSb3V0ZUlkRmllbGQnLCBuZXRSb3V0ZUZpZWxkKVxyXG4gICAgICAgICAgaWYgKG5ldFJvdXRlTmFtZUZpZWxkKSB7XHJcbiAgICAgICAgICAgIHVwZGF0ZUNvbmZpZygnbmV0d29ya1JvdXRlTmFtZUZpZWxkJywgbmV0Um91dGVOYW1lRmllbGQpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAvLyBmYWxsYmFja1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmV0Y2ggZmllbGQgaW5mbyBmb3IgZWFjaCBldmVudCBsYXllclxyXG4gICAgICBjb25zdCBsYXllcnM6IERpc2NvdmVyZWRMYXllcltdID0gW11cclxuICAgICAgZm9yIChjb25zdCBlbCBvZiAoaW5mby5ldmVudExheWVycyB8fCBbXSkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgZGV0YWlsID0gYXdhaXQgbHJzLmdldEV2ZW50TGF5ZXJJbmZvKGVsLmlkKVxyXG4gICAgICAgICAgY29uc3QgdXNlckZpZWxkcyA9IChkZXRhaWwuZmllbGRzIHx8IFtdKS5maWx0ZXIoXHJcbiAgICAgICAgICAgIGYgPT4gIVNZU1RFTV9GSUVMRFMuaW5jbHVkZXMoZi5uYW1lKSAmJlxyXG4gICAgICAgICAgICAgICAgIGYudHlwZSAhPT0gJ2VzcmlGaWVsZFR5cGVPSUQnICYmXHJcbiAgICAgICAgICAgICAgICAgZi50eXBlICE9PSAnZXNyaUZpZWxkVHlwZUdlb21ldHJ5J1xyXG4gICAgICAgICAgKVxyXG4gICAgICAgICAgbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgICBpZDogZWwuaWQsXHJcbiAgICAgICAgICAgIG5hbWU6IGVsLm5hbWUsXHJcbiAgICAgICAgICAgIHR5cGU6IGVsLnR5cGUsXHJcbiAgICAgICAgICAgIGZpZWxkczogdXNlckZpZWxkcy5tYXAoZiA9PiAoeyBuYW1lOiBmLm5hbWUsIGFsaWFzOiBmLmFsaWFzIHx8IGYubmFtZSwgdHlwZTogZi50eXBlIH0pKSxcclxuICAgICAgICAgICAgcm91dGVJZEZpZWxkTmFtZTogKGRldGFpbCBhcyBhbnkpLnJvdXRlSWRGaWVsZE5hbWUgfHwgJ3JvdXRlaWQnLFxyXG4gICAgICAgICAgICBmcm9tTWVhc3VyZUZpZWxkTmFtZTogKGRldGFpbCBhcyBhbnkpLmZyb21NZWFzdXJlRmllbGROYW1lIHx8ICdmcm9tbWVhc3VyZScsXHJcbiAgICAgICAgICAgIHRvTWVhc3VyZUZpZWxkTmFtZTogKGRldGFpbCBhcyBhbnkpLnRvTWVhc3VyZUZpZWxkTmFtZSB8fCBudWxsXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgICBpZDogZWwuaWQsIG5hbWU6IGVsLm5hbWUsIHR5cGU6IGVsLnR5cGUsIGZpZWxkczogW10sXHJcbiAgICAgICAgICAgIHJvdXRlSWRGaWVsZE5hbWU6ICdyb3V0ZWlkJywgZnJvbU1lYXN1cmVGaWVsZE5hbWU6ICdmcm9tbWVhc3VyZScsIHRvTWVhc3VyZUZpZWxkTmFtZTogbnVsbFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2V0RGlzY292ZXJlZExheWVycyhsYXllcnMpXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBzZXRTZXJ2aWNlRXJyb3IoZXJyLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsb2FkIHNlcnZpY2UgaW5mbycpXHJcbiAgICAgIHNldE5ldHdvcmtMYXllcnMoW10pXHJcbiAgICAgIHNldERpc2NvdmVyZWRMYXllcnMoW10pXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nU2VydmljZShmYWxzZSlcclxuICAgIH1cclxuICB9LCBbXSlcclxuXHJcbiAgLy8gQXV0by1sb2FkIHNlcnZpY2UgaW5mbyBvbiBtb3VudCBpZiBVUkwgaXMgc2V0XHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChjb25maWc/Lmxyc1NlcnZpY2VVcmwgJiYgZGlzY292ZXJlZExheWVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgbG9hZFNlcnZpY2VJbmZvKGNvbmZpZy5scnNTZXJ2aWNlVXJsKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICBjb25zdCBoYW5kbGVVcmxDaGFuZ2UgPSB1c2VDYWxsYmFjaygoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcclxuICAgIHVwZGF0ZUNvbmZpZygnbHJzU2VydmljZVVybCcsIGUudGFyZ2V0LnZhbHVlKVxyXG4gIH0sIFt1cGRhdGVDb25maWddKVxyXG5cclxuICBjb25zdCBoYW5kbGVVcmxCbHVyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpZz8ubHJzU2VydmljZVVybCkge1xyXG4gICAgICBsb2FkU2VydmljZUluZm8oY29uZmlnLmxyc1NlcnZpY2VVcmwpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZz8ubHJzU2VydmljZVVybCwgbG9hZFNlcnZpY2VJbmZvXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlTmV0d29ya0NoYW5nZSA9IHVzZUNhbGxiYWNrKChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MU2VsZWN0RWxlbWVudD4pID0+IHtcclxuICAgIHVwZGF0ZUNvbmZpZygnbmV0d29ya0xheWVySWQnLCBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApKVxyXG4gIH0sIFt1cGRhdGVDb25maWddKVxyXG5cclxuICAvLyBUb2dnbGUgYW4gZXZlbnQgbGF5ZXIgb24vb2ZmIOKAlCBhdXRvLXNlbGVjdCBhbGwgdXNlciBmaWVsZHMgd2hlbiBlbmFibGluZ1xyXG4gIGNvbnN0IHRvZ2dsZUV2ZW50TGF5ZXIgPSB1c2VDYWxsYmFjaygobGF5ZXI6IERpc2NvdmVyZWRMYXllcikgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudDogRXZlbnRMYXllckNvbmZpZ1tdID0gY29uZmlnPy5ldmVudExheWVyQ29uZmlncyA/IFsuLi5jb25maWcuZXZlbnRMYXllckNvbmZpZ3MgYXMgYW55XSA6IFtdXHJcbiAgICBjb25zdCBpZHggPSBjdXJyZW50LmZpbmRJbmRleChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXIuaWQpXHJcblxyXG4gICAgaWYgKGlkeCA+PSAwKSB7XHJcbiAgICAgIGN1cnJlbnQuc3BsaWNlKGlkeCwgMSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEJ1aWxkIGRvbWFpbk92ZXJyaWRlcyBmcm9tIGtub3duIGRvbWFpbnNcclxuICAgICAgY29uc3Qgb3ZlcnJpZGVzOiB7IFtmaWVsZE5hbWU6IHN0cmluZ106IHsgW2NvZGU6IHN0cmluZ106IHN0cmluZyB9IH0gPSB7fVxyXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGF5ZXIuZmllbGRzKSB7XHJcbiAgICAgICAgaWYgKEtOT1dOX0RPTUFJTlNbZi5uYW1lXSkge1xyXG4gICAgICAgICAgb3ZlcnJpZGVzW2YubmFtZV0gPSBLTk9XTl9ET01BSU5TW2YubmFtZV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG5ld0xheWVyOiBFdmVudExheWVyQ29uZmlnID0ge1xyXG4gICAgICAgIGxheWVySWQ6IGxheWVyLmlkLFxyXG4gICAgICAgIG5hbWU6IGxheWVyLm5hbWUsXHJcbiAgICAgICAgdHlwZTogbGF5ZXIudHlwZSBhcyBhbnksXHJcbiAgICAgICAgYXR0cmlidXRlczogbGF5ZXIuZmllbGRzLm1hcChmID0+IGYubmFtZSksXHJcbiAgICAgICAgcm91dGVJZEZpZWxkOiBsYXllci5yb3V0ZUlkRmllbGROYW1lLFxyXG4gICAgICAgIC4uLihsYXllci50eXBlLmluY2x1ZGVzKCdQb2ludCcpXHJcbiAgICAgICAgICA/IHsgbWVhc3VyZUZpZWxkOiBsYXllci5mcm9tTWVhc3VyZUZpZWxkTmFtZSB9XHJcbiAgICAgICAgICA6IHsgZnJvbU1lYXN1cmVGaWVsZDogbGF5ZXIuZnJvbU1lYXN1cmVGaWVsZE5hbWUsIHRvTWVhc3VyZUZpZWxkOiBsYXllci50b01lYXN1cmVGaWVsZE5hbWUgfHwgdW5kZWZpbmVkIH0pLFxyXG4gICAgICAgIC4uLihPYmplY3Qua2V5cyhvdmVycmlkZXMpLmxlbmd0aCA+IDAgPyB7IGRvbWFpbk92ZXJyaWRlczogb3ZlcnJpZGVzIH0gOiB7fSlcclxuICAgICAgfVxyXG4gICAgICBjdXJyZW50LnB1c2gobmV3TGF5ZXIpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ29uZmlnKCdldmVudExheWVyQ29uZmlncycsIGN1cnJlbnQpXHJcbiAgfSwgW2NvbmZpZz8uZXZlbnRMYXllckNvbmZpZ3MsIHVwZGF0ZUNvbmZpZ10pXHJcblxyXG4gIC8vIFRvZ2dsZSBhbiBpbmRpdmlkdWFsIGF0dHJpYnV0ZSBmaWVsZCB3aXRoaW4gYW4gZXZlbnQgbGF5ZXJcclxuICBjb25zdCB0b2dnbGVBdHRyaWJ1dGUgPSB1c2VDYWxsYmFjaygobGF5ZXJJZDogbnVtYmVyLCBmaWVsZE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudDogRXZlbnRMYXllckNvbmZpZ1tdID0gY29uZmlnPy5ldmVudExheWVyQ29uZmlncyA/IFsuLi5jb25maWcuZXZlbnRMYXllckNvbmZpZ3MgYXMgYW55XSA6IFtdXHJcbiAgICBjb25zdCBpZHggPSBjdXJyZW50LmZpbmRJbmRleChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXJJZClcclxuICAgIGlmIChpZHggPCAwKSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBhdHRycyA9IFsuLi5jdXJyZW50W2lkeF0uYXR0cmlidXRlc11cclxuICAgIGNvbnN0IGF0dHJJZHggPSBhdHRycy5pbmRleE9mKGZpZWxkTmFtZSlcclxuICAgIGlmIChhdHRySWR4ID49IDApIHtcclxuICAgICAgYXR0cnMuc3BsaWNlKGF0dHJJZHgsIDEpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhdHRycy5wdXNoKGZpZWxkTmFtZSlcclxuICAgIH1cclxuICAgIGN1cnJlbnRbaWR4XSA9IHsgLi4uY3VycmVudFtpZHhdLCBhdHRyaWJ1dGVzOiBhdHRycyB9XHJcbiAgICB1cGRhdGVDb25maWcoJ2V2ZW50TGF5ZXJDb25maWdzJywgY3VycmVudClcclxuICB9LCBbY29uZmlnPy5ldmVudExheWVyQ29uZmlncywgdXBkYXRlQ29uZmlnXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlUHJlY2lzaW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XHJcbiAgICBjb25zdCB2YWwgPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApXHJcbiAgICB1cGRhdGVDb25maWcoJ21lYXN1cmVQcmVjaXNpb24nLCBpc05hTih2YWwpID8gMyA6IHZhbClcclxuICB9LCBbdXBkYXRlQ29uZmlnXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlTWFwV2lkZ2V0Q2hhbmdlID0gdXNlQ2FsbGJhY2soKHVzZU1hcFdpZGdldElkczogc3RyaW5nW10pID0+IHtcclxuICAgIHByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgIGlkOiBwcm9wcy5pZCxcclxuICAgICAgdXNlTWFwV2lkZ2V0SWRzXHJcbiAgICB9KVxyXG4gIH0sIFtwcm9wc10pXHJcblxyXG4gIC8vIEdldCB0aGUgY29uZmlnIGVudHJ5IGZvciBhIGRpc2NvdmVyZWQgbGF5ZXJcclxuICBjb25zdCBnZXRMYXllckNvbmZpZyA9IChsYXllcklkOiBudW1iZXIpOiBFdmVudExheWVyQ29uZmlnIHwgdW5kZWZpbmVkID0+IHtcclxuICAgIHJldHVybiAoY29uZmlnPy5ldmVudExheWVyQ29uZmlncyBhcyBhbnkgYXMgRXZlbnRMYXllckNvbmZpZ1tdIHx8IFtdKVxyXG4gICAgICAuZmluZChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXJJZClcclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInAtM1wiIHN0eWxlPXt7IGZvbnRTaXplOiAnMTNweCcgfX0+XHJcbiAgICAgIDxoNSBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PlJvYWQgTG9nIFNldHRpbmdzPC9oNT5cclxuXHJcbiAgICAgIHsvKiBMUlMgU2VydmljZSBVUkwgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT5MUlMgU2VydmljZSBVUkw8L2xhYmVsPlxyXG4gICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgdHlwZT1cInRleHRcIlxyXG4gICAgICAgICAgdmFsdWU9e2NvbmZpZz8ubHJzU2VydmljZVVybCB8fCAnJ31cclxuICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVVcmxDaGFuZ2V9XHJcbiAgICAgICAgICBvbkJsdXI9e2hhbmRsZVVybEJsdXJ9XHJcbiAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cclxuICAgICAgICAgIHBsYWNlaG9sZGVyPVwiaHR0cHM6Ly8uLi4vTWFwU2VydmVyL2V4dHMvTFJTZXJ2ZXJcIlxyXG4gICAgICAgIC8+XHJcbiAgICAgICAgPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgb25DbGljaz17aGFuZGxlVXJsQmx1cn0gc3R5bGU9e2xvYWRCdG5TdHlsZX0+XHJcbiAgICAgICAgICB7bG9hZGluZ1NlcnZpY2UgPyAnTG9hZGluZy4uLicgOiAnTG9hZCBTZXJ2aWNlJ31cclxuXHJcbiAgICAgIHsvKiBNYXAgV2lkZ2V0IChmb3IgcG9seWdvbiBzZWxlY3QgbW9kZSkgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT5NYXAgV2lkZ2V0IChmb3IgcG9seWdvbiBzZWxlY3QpPC9sYWJlbD5cclxuICAgICAgICA8TWFwV2lkZ2V0U2VsZWN0b3JcclxuICAgICAgICAgIG9uU2VsZWN0PXtoYW5kbGVNYXBXaWRnZXRDaGFuZ2V9XHJcbiAgICAgICAgICB1c2VNYXBXaWRnZXRJZHM9e3Byb3BzLnVzZU1hcFdpZGdldElkc31cclxuICAgICAgICAvPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICB7c2VydmljZUVycm9yICYmIDxkaXYgc3R5bGU9e2Vycm9yU3R5bGV9PntzZXJ2aWNlRXJyb3J9PC9kaXY+fVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBOZXR3b3JrIExheWVyIChhdXRvLXNlbGVjdCBmaXJzdCBpZiBvbmx5IG9uZSkgKi99XHJcbiAgICAgIHtuZXR3b3JrTGF5ZXJzLmxlbmd0aCA+IDEgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9Pk5ldHdvcmsgTGF5ZXI8L2xhYmVsPlxyXG4gICAgICAgICAgPHNlbGVjdFxyXG4gICAgICAgICAgICB2YWx1ZT17Y29uZmlnPy5uZXR3b3JrTGF5ZXJJZCA/PyAnJ31cclxuICAgICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZU5ldHdvcmtDaGFuZ2V9XHJcbiAgICAgICAgICAgIHN0eWxlPXtpbnB1dFN0eWxlfVxyXG4gICAgICAgICAgPlxyXG4gICAgICAgICAgICA8b3B0aW9uIHZhbHVlPVwiXCI+LS0gU2VsZWN0IE5ldHdvcmsgLS08L29wdGlvbj5cclxuICAgICAgICAgICAge25ldHdvcmtMYXllcnMubWFwKG4gPT4gKFxyXG4gICAgICAgICAgICAgIDxvcHRpb24ga2V5PXtuLmlkfSB2YWx1ZT17bi5pZH0+e24ubmFtZX08L29wdGlvbj5cclxuICAgICAgICAgICAgKSl9XHJcbiAgICAgICAgICA8L3NlbGVjdD5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiBFdmVudCBMYXllcnMg4oCUIGFsd2F5cyBleHBhbmRlZCB3aXRoIGFsbCBmaWVsZHMgdmlzaWJsZSAqL31cclxuICAgICAge2Rpc2NvdmVyZWRMYXllcnMubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgPGRpdiBzdHlsZT17ZmllbGRHcm91cFN0eWxlfT5cclxuICAgICAgICAgIDxsYWJlbCBzdHlsZT17bGFiZWxTdHlsZX0+RXZlbnQgTGF5ZXJzICZhbXA7IEF0dHJpYnV0ZXM8L2xhYmVsPlxyXG4gICAgICAgICAgPGRpdiBzdHlsZT17ZXZlbnRMaXN0U3R5bGV9PlxyXG4gICAgICAgICAgICB7ZGlzY292ZXJlZExheWVycy5tYXAobGF5ZXIgPT4ge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGxheWVyQ2ZnID0gZ2V0TGF5ZXJDb25maWcobGF5ZXIuaWQpXHJcbiAgICAgICAgICAgICAgY29uc3QgaXNTZWxlY3RlZCA9ICEhbGF5ZXJDZmdcclxuICAgICAgICAgICAgICBjb25zdCB0eXBlVGFnID0gbGF5ZXIudHlwZS5pbmNsdWRlcygnUG9pbnQnKSA/ICcoTWFya2VyKScgOiAnKExpbmVhciknXHJcblxyXG4gICAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgICA8ZGl2IGtleT17bGF5ZXIuaWR9IHN0eWxlPXt7IG1hcmdpbkJvdHRvbTogJzEwcHgnIH19PlxyXG4gICAgICAgICAgICAgICAgICB7LyogTGF5ZXIgY2hlY2tib3ggKi99XHJcbiAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgZGlzcGxheTogJ2ZsZXgnLCBhbGlnbkl0ZW1zOiAnY2VudGVyJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICA8aW5wdXRcclxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc1NlbGVjdGVkfVxyXG4gICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eygpID0+IHRvZ2dsZUV2ZW50TGF5ZXIobGF5ZXIpfVxyXG4gICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgbWFyZ2luTGVmdDogJzRweCcsIGZvbnRTaXplOiAnMTJweCcsIGZvbnRXZWlnaHQ6IDYwMCB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtsYXllci5uYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyM2NjYnLCBtYXJnaW5MZWZ0OiAnNnB4JywgZm9udFNpemU6ICcxMXB4JyB9fT57dHlwZVRhZ308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG5cclxuICAgICAgICAgICAgICAgICAgey8qIEFsd2F5cy12aXNpYmxlIGF0dHJpYnV0ZSBmaWVsZCBsaXN0ICovfVxyXG4gICAgICAgICAgICAgICAgICB7aXNTZWxlY3RlZCAmJiBsYXllci5maWVsZHMubGVuZ3RoID4gMCAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17ZmllbGRQaWNrZXJTdHlsZX0+XHJcbiAgICAgICAgICAgICAgICAgICAgICB7bGF5ZXIuZmllbGRzLm1hcChmID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaXNBdHRyU2VsZWN0ZWQgPSBsYXllckNmZz8uYXR0cmlidXRlcz8uaW5jbHVkZXMoZi5uYW1lKSA/PyBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBoYXNEb21haW4gPSAhIShLTk9XTl9ET01BSU5TW2YubmFtZV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGtleT17Zi5uYW1lfSBzdHlsZT17eyBkaXNwbGF5OiAnYmxvY2snLCBmb250U2l6ZTogJzExcHgnLCBwYWRkaW5nOiAnMnB4IDAnLCBjdXJzb3I6ICdwb2ludGVyJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGVja2VkPXtpc0F0dHJTZWxlY3RlZH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eygpID0+IHRvZ2dsZUF0dHJpYnV0ZShsYXllci5pZCwgZi5uYW1lKX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgbWFyZ2luUmlnaHQ6ICc0cHgnIH19XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2YuYWxpYXMgfHwgZi5uYW1lfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4gc3R5bGU9e3sgY29sb3I6ICcjODg4JywgbWFyZ2luTGVmdDogJzRweCcsIGZvbnRTaXplOiAnMTBweCcgfX0+e3R5cGVUYWd9PC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge2hhc0RvbWFpbiAmJiA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyMwMDc5YzEnLCBtYXJnaW5MZWZ0OiAnNHB4JywgZm9udFNpemU6ICcxMHB4JyB9fT7imIUgbGFiZWxzPC9zcGFuPn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICApXHJcbiAgICAgICAgICAgICAgICAgICAgICB9KX1cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgKX1cclxuXHJcbiAgICAgICAgICAgICAgICAgIHtpc1NlbGVjdGVkICYmIGxheWVyLmZpZWxkcy5sZW5ndGggPT09IDAgJiYgKFxyXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgc3R5bGU9e3sgLi4uZmllbGRQaWNrZXJTdHlsZSwgY29sb3I6ICcjODg4JywgZm9udFN0eWxlOiAnaXRhbGljJyB9fT5cclxuICAgICAgICAgICAgICAgICAgICAgIE5vIHVzZXIgYXR0cmlidXRlcyBhdmFpbGFibGVcclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgKX1cclxuICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgfSl9XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICA8L2Rpdj5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHsvKiBNZWFzdXJlIFByZWNpc2lvbiAqL31cclxuICAgICAgPGRpdiBzdHlsZT17ZmllbGRHcm91cFN0eWxlfT5cclxuICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9Pk1lYXN1cmUgUHJlY2lzaW9uIChkZWNpbWFsIHBsYWNlcyk8L2xhYmVsPlxyXG4gICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgdHlwZT1cIm51bWJlclwiXHJcbiAgICAgICAgICBtaW49ezB9XHJcbiAgICAgICAgICBtYXg9ezEwfVxyXG4gICAgICAgICAgdmFsdWU9e2NvbmZpZz8ubWVhc3VyZVByZWNpc2lvbiA/PyAzfVxyXG4gICAgICAgICAgb25DaGFuZ2U9e2hhbmRsZVByZWNpc2lvbkNoYW5nZX1cclxuICAgICAgICAgIHN0eWxlPXt7IC4uLmlucHV0U3R5bGUsIHdpZHRoOiAnODBweCcgfX1cclxuICAgICAgICAvPlxyXG4gICAgICA8L2Rpdj5cclxuICAgIDwvZGl2PlxyXG4gIClcclxufVxyXG5cclxuLy8gU3R5bGVzXHJcbmNvbnN0IGZpZWxkR3JvdXBTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBtYXJnaW5Cb3R0b206ICcxNHB4J1xyXG59XHJcblxyXG5jb25zdCBsYWJlbFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIGRpc3BsYXk6ICdibG9jaycsXHJcbiAgZm9udFNpemU6ICcxMnB4JyxcclxuICBmb250V2VpZ2h0OiA1MDAsXHJcbiAgbWFyZ2luQm90dG9tOiAnNHB4JyxcclxuICBjb2xvcjogJyMzMzMnXHJcbn1cclxuXHJcbmNvbnN0IGlucHV0U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgd2lkdGg6ICcxMDAlJyxcclxuICBwYWRkaW5nOiAnNnB4IDhweCcsXHJcbiAgZm9udFNpemU6ICcxMnB4JyxcclxuICBib3JkZXI6ICcxcHggc29saWQgI2NjYycsXHJcbiAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICBib3hTaXppbmc6ICdib3JkZXItYm94J1xyXG59XHJcblxyXG5jb25zdCBsb2FkQnRuU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgbWFyZ2luVG9wOiAnNHB4JyxcclxuICBwYWRkaW5nOiAnNHB4IDEycHgnLFxyXG4gIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICNjY2MnLFxyXG4gIGJvcmRlclJhZGl1czogJzNweCcsXHJcbiAgYmFja2dyb3VuZENvbG9yOiAnI2Y1ZjVmNScsXHJcbiAgY3Vyc29yOiAncG9pbnRlcidcclxufVxyXG5cclxuY29uc3QgZXZlbnRMaXN0U3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgbWF4SGVpZ2h0OiAnMzAwcHgnLFxyXG4gIG92ZXJmbG93OiAnYXV0bycsXHJcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICNlMGUwZTAnLFxyXG4gIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgcGFkZGluZzogJzZweCdcclxufVxyXG5cclxuY29uc3QgZmllbGRQaWNrZXJTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBtYXJnaW5MZWZ0OiAnMjBweCcsXHJcbiAgbWFyZ2luVG9wOiAnNHB4JyxcclxuICBwYWRkaW5nOiAnNHB4IDhweCcsXHJcbiAgYmFja2dyb3VuZENvbG9yOiAnI2Y5ZjlmOScsXHJcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICNlOGU4ZTgnLFxyXG4gIGJvcmRlclJhZGl1czogJzNweCdcclxufVxyXG5cclxuY29uc3QgZXJyb3JTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBtYXJnaW5Ub3A6ICc0cHgnLFxyXG4gIGZvbnRTaXplOiAnMTFweCcsXHJcbiAgY29sb3I6ICcjZDgzMDIwJ1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTZXR0aW5nXHJcblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=