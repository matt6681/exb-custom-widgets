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
        var _a, _b;
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
                if (_lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name]) {
                    overrides[f.name] = _lrs_utils_utils_known_domains__WEBPACK_IMPORTED_MODULE_3__.KNOWN_DOMAINS[f.name];
                }
            }
            const newLayer = Object.assign(Object.assign({ layerId: layer.id, name: layer.name, type: layer.type, attributes: [], routeIdField: layer.routeIdFieldName }, (layer.type.includes('Point')
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
    return (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { className: "p-3", style: { fontSize: '13px', color: '#000' } },
        jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("h5", { style: { fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#000' } }, "Road Log Settings"),
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
                    isSelected && layer.fields.length > 0 && (jimu_core__WEBPACK_IMPORTED_MODULE_0__.React.createElement("div", { style: fieldPickerStyle }, layer.fields.map(f => {
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
    color: '#000'
};
const descStyle = {
    fontSize: '11px',
    color: '#000',
    margin: '0 0 6px 0',
    lineHeight: '1.4',
    opacity: 0.75
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9yb2FkLWxvZy9kaXN0L3NldHRpbmcvc2V0dGluZy5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxJQUFJLFlBQVksR0FBRyxDQUFDO0FBRXBCOzs7R0FHRztBQUNILFNBQVMsWUFBWSxDQUFFLEdBQVcsRUFBRSxNQUE4QjtJQUNoRSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1FBQ3JDLE1BQU0sWUFBWSxHQUFHLFdBQVcsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLFlBQVksRUFBRSxFQUFFO1FBQzlELE1BQU0sQ0FBQyxRQUFRLEdBQUcsWUFBWTtRQUU5QixNQUFNLEVBQUUsR0FBRyxJQUFJLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLEVBQUU7UUFDakQsTUFBTSxTQUFTLEdBQUcsR0FBRyxHQUFHLElBQUksRUFBRSxFQUFFO1FBRWhDLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDO1FBQy9DLE1BQU0sQ0FBQyxHQUFHLEdBQUcsU0FBUztRQUV0QixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUU7WUFDbkIsT0FBUSxNQUFjLENBQUMsWUFBWSxDQUFDO1lBQ3BDLElBQUksTUFBTSxDQUFDLFVBQVU7Z0JBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDO1FBQzlELENBQUMsQ0FFQTtRQUFDLE1BQWMsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFO1lBQzdDLE9BQU8sRUFBRTtZQUNULElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNmLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxlQUFlLENBQUMsQ0FBQztZQUMxRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxDQUFD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TUFBTTtDQUNkO0FBRUQsTUFBTSxVQUFVLEdBQXdCO0lBQ3RDLFNBQVMsRUFBRSxLQUFLO0lBQ2hCLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLEtBQUssRUFBRSxTQUFTO0NBQ2pCO0FBRUQsaUVBQWUsT0FBTztBQUVkLFNBQVMsMkJBQTJCLENBQUMsR0FBRyxJQUFJLHFCQUF1QixHQUFHLEdBQUcsRUFBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3JvYWQtbG9nL3NyYy9scnMtdXRpbHMvbHJzLXNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3JvYWQtbG9nL3NyYy9scnMtdXRpbHMvdXRpbHMva25vd24tZG9tYWlucy50cyIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZVwiIiwid2VicGFjazovL2V4Yi1jbGllbnQvZXh0ZXJuYWwgc3lzdGVtIFwiamltdS11aS9hZHZhbmNlZC9zZXR0aW5nLWNvbXBvbmVudHNcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly9leGItY2xpZW50Ly4vamltdS1jb3JlL2xpYi9zZXQtcHVibGljLXBhdGgudHMiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL3JvYWQtbG9nL3NyYy9zZXR0aW5nL3NldHRpbmcudHN4Il0sInNvdXJjZXNDb250ZW50IjpbIi8vIExSUyBSRVNUIEFQSSBTZXJ2aWNlIHdyYXBwZXJcclxuLy8gVXNlcyBKU09OUCB0byBieXBhc3MgQ09SUyBpc3N1ZXMgd2l0aCBtaXNjb25maWd1cmVkIHNlcnZlcnMgKGR1cGxpY2F0ZSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4gaGVhZGVycylcclxuaW1wb3J0IHR5cGUge1xyXG4gIExyc1NlcnZpY2VJbmZvLFxyXG4gIE5ldHdvcmtMYXllckluZm8sXHJcbiAgRXZlbnRMYXllckluZm8sXHJcbiAgTWVhc3VyZVRvR2VvbWV0cnlMb2NhdGlvbixcclxuICBNZWFzdXJlVG9HZW9tZXRyeVJlc3VsdCxcclxuICBHZW9tZXRyeVRvTWVhc3VyZVJlc3VsdCxcclxuICBRdWVyeUF0dHJpYnV0ZVNldFBhcmFtcyxcclxuICBGZWF0dXJlU2V0UmVzdWx0XHJcbn0gZnJvbSAnLi90eXBlcydcclxuXHJcbmxldCBqc29ucENvdW50ZXIgPSAwXHJcblxyXG4vKipcclxuICogSlNPTlAgcmVxdWVzdCDigJQgYnlwYXNzZXMgQ09SUyBlbnRpcmVseSBieSBpbmplY3RpbmcgYSA8c2NyaXB0PiB0YWcuXHJcbiAqIEFyY0dJUyBSRVNUIEFQSSBzdXBwb3J0cyBKU09OUCB2aWEgdGhlICdjYWxsYmFjaycgcGFyYW1ldGVyLlxyXG4gKi9cclxuZnVuY3Rpb24ganNvbnBSZXF1ZXN0ICh1cmw6IHN0cmluZywgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxhbnk+IHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgY29uc3QgY2FsbGJhY2tOYW1lID0gYF9scnNfY2JfJHtEYXRlLm5vdygpfV8ke2pzb25wQ291bnRlcisrfWBcclxuICAgIHBhcmFtcy5jYWxsYmFjayA9IGNhbGxiYWNrTmFtZVxyXG5cclxuICAgIGNvbnN0IHFzID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhwYXJhbXMpLnRvU3RyaW5nKClcclxuICAgIGNvbnN0IHNjcmlwdFVybCA9IGAke3VybH0/JHtxc31gXHJcblxyXG4gICAgY29uc3Qgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JylcclxuICAgIHNjcmlwdC5zcmMgPSBzY3JpcHRVcmxcclxuXHJcbiAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4ge1xyXG4gICAgICBkZWxldGUgKHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV1cclxuICAgICAgaWYgKHNjcmlwdC5wYXJlbnROb2RlKSBzY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHQpXHJcbiAgICB9XHJcblxyXG4gICAgOyh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgaWYgKGRhdGEuZXJyb3IpIHtcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKGRhdGEuZXJyb3IubWVzc2FnZSB8fCAnUmVxdWVzdCBlcnJvcicpKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJlc29sdmUoZGF0YSlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHNjcmlwdC5vbmVycm9yID0gKCkgPT4ge1xyXG4gICAgICBjbGVhbnVwKClcclxuICAgICAgcmVqZWN0KG5ldyBFcnJvcignSlNPTlAgcmVxdWVzdCBmYWlsZWQnKSlcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAoKHdpbmRvdyBhcyBhbnkpW2NhbGxiYWNrTmFtZV0pIHtcclxuICAgICAgICBjbGVhbnVwKClcclxuICAgICAgICByZWplY3QobmV3IEVycm9yKCdSZXF1ZXN0IHRpbWVvdXQnKSlcclxuICAgICAgfVxyXG4gICAgfSwgMzAwMDApXHJcblxyXG4gICAgOyh3aW5kb3cgYXMgYW55KVtjYWxsYmFja05hbWVdID0gKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpXHJcbiAgICAgIGNsZWFudXAoKVxyXG4gICAgICBpZiAoZGF0YS5lcnJvcikge1xyXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvci5tZXNzYWdlIHx8ICdSZXF1ZXN0IGVycm9yJykpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzb2x2ZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChzY3JpcHQpXHJcbiAgfSlcclxufVxyXG5cclxuLyoqXHJcbiAqIFdyYXBwZXIgYXJvdW5kIEFyY0dJUyBMUlMgUkVTVCBBUEkgKExSU2VydmVyIGV4dGVuc2lvbikuXHJcbiAqIFVzZXMgSlNPTlAgZm9yIGFsbCByZXF1ZXN0cyB0byBhdm9pZCBDT1JTIGlzc3Vlcy5cclxuICovXHJcbmV4cG9ydCBjbGFzcyBMcnNTZXJ2aWNlIHtcclxuICBwcml2YXRlIGJhc2VVcmw6IHN0cmluZ1xyXG4gIHByaXZhdGUgdG9rZW46IHN0cmluZyB8IG51bGxcclxuXHJcbiAgY29uc3RydWN0b3IgKGJhc2VVcmw6IHN0cmluZywgdG9rZW4/OiBzdHJpbmcpIHtcclxuICAgIC8vIEVuc3VyZSBubyB0cmFpbGluZyBzbGFzaFxyXG4gICAgdGhpcy5iYXNlVXJsID0gYmFzZVVybC5yZXBsYWNlKC9cXC8rJC8sICcnKVxyXG4gICAgdGhpcy50b2tlbiA9IHRva2VuIHx8IG51bGxcclxuICB9XHJcblxyXG4gIHNldFRva2VuICh0b2tlbjogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLnRva2VuID0gdG9rZW5cclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIExSUyBzZXJ2aWNlIG1ldGFkYXRhIChuZXR3b3JrIGxheWVycywgZXZlbnQgbGF5ZXJzLCBldGMuKVxyXG4gICAqL1xyXG4gIGFzeW5jIGdldFNlcnZpY2VJbmZvICgpOiBQcm9taXNlPExyc1NlcnZpY2VJbmZvPiB7XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PExyc1NlcnZpY2VJbmZvPignJylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEZldGNoIGRldGFpbGVkIGluZm8gZm9yIGEgbmV0d29yayBsYXllciAoZmllbGRzLCBtZWFzdXJlIHByZWNpc2lvbiwgZXRjLilcclxuICAgKi9cclxuICBhc3luYyBnZXROZXR3b3JrTGF5ZXJJbmZvIChsYXllcklkOiBudW1iZXIpOiBQcm9taXNlPE5ldHdvcmtMYXllckluZm8+IHtcclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8TmV0d29ya0xheWVySW5mbz4oYC9uZXR3b3JrTGF5ZXJzLyR7bGF5ZXJJZH1gKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogRmV0Y2ggZGV0YWlsZWQgaW5mbyBmb3IgYW4gZXZlbnQgbGF5ZXJcclxuICAgKi9cclxuICBhc3luYyBnZXRFdmVudExheWVySW5mbyAobGF5ZXJJZDogbnVtYmVyKTogUHJvbWlzZTxFdmVudExheWVySW5mbz4ge1xyXG4gICAgcmV0dXJuIHRoaXMucmVxdWVzdDxFdmVudExheWVySW5mbz4oYC9ldmVudExheWVycy8ke2xheWVySWR9YClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgcm91dGUgSUQgKyBtZWFzdXJlcyB0byBtYXAgZ2VvbWV0cnlcclxuICAgKi9cclxuICBhc3luYyBtZWFzdXJlVG9HZW9tZXRyeSAoXHJcbiAgICBuZXR3b3JrTGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgbG9jYXRpb25zOiBNZWFzdXJlVG9HZW9tZXRyeUxvY2F0aW9uW10sXHJcbiAgICBvdXRTUj86IGFueVxyXG4gICk6IFByb21pc2U8TWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQ+IHtcclxuICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcclxuICAgICAgbG9jYXRpb25zOiBKU09OLnN0cmluZ2lmeShsb2NhdGlvbnMpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChvdXRTUikge1xyXG4gICAgICBwYXJhbXMub3V0U1IgPSBKU09OLnN0cmluZ2lmeShvdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8TWVhc3VyZVRvR2VvbWV0cnlSZXN1bHQ+KFxyXG4gICAgICBgL25ldHdvcmtMYXllcnMvJHtuZXR3b3JrTGF5ZXJJZH0vbWVhc3VyZVRvR2VvbWV0cnlgLFxyXG4gICAgICBwYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnZlcnQgbWFwIGdlb21ldHJ5IChwb2ludCkgdG8gcm91dGUgKyBtZWFzdXJlXHJcbiAgICovXHJcbiAgYXN5bmMgZ2VvbWV0cnlUb01lYXN1cmUgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIGxvY2F0aW9uczogQXJyYXk8eyBnZW9tZXRyeTogYW55IH0+LFxyXG4gICAgb3V0U1I/OiBhbnlcclxuICApOiBQcm9taXNlPEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0PiB7XHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIGxvY2F0aW9uczogSlNPTi5zdHJpbmdpZnkobG9jYXRpb25zKSxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAob3V0U1IpIHtcclxuICAgICAgcGFyYW1zLm91dFNSID0gSlNPTi5zdHJpbmdpZnkob3V0U1IpXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5yZXF1ZXN0PEdlb21ldHJ5VG9NZWFzdXJlUmVzdWx0PihcclxuICAgICAgYC9uZXR3b3JrTGF5ZXJzLyR7bmV0d29ya0xheWVySWR9L2dlb21ldHJ5VG9NZWFzdXJlYCxcclxuICAgICAgcGFyYW1zXHJcbiAgICApXHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBEeW5hbWljIHNlZ21lbnRhdGlvbiBvdmVybGF5IOKAlCBxdWVyeUF0dHJpYnV0ZVNldFxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5QXR0cmlidXRlU2V0IChcclxuICAgIG5ldHdvcmtMYXllcklkOiBudW1iZXIsXHJcbiAgICBwYXJhbXM6IFF1ZXJ5QXR0cmlidXRlU2V0UGFyYW1zXHJcbiAgKTogUHJvbWlzZTxGZWF0dXJlU2V0UmVzdWx0PiB7XHJcbiAgICBjb25zdCByZXF1ZXN0UGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBsb2NhdGlvbnM6IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5sb2NhdGlvbnMpLFxyXG4gICAgICBhdHRyaWJ1dGVTZXQ6IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5hdHRyaWJ1dGVTZXQpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmIChwYXJhbXMub3V0U1IpIHtcclxuICAgICAgcmVxdWVzdFBhcmFtcy5vdXRTUiA9IEpTT04uc3RyaW5naWZ5KHBhcmFtcy5vdXRTUilcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLnJlcXVlc3Q8RmVhdHVyZVNldFJlc3VsdD4oXHJcbiAgICAgIGAvbmV0d29ya0xheWVycy8ke25ldHdvcmtMYXllcklkfS9xdWVyeUF0dHJpYnV0ZVNldGAsXHJcbiAgICAgIHJlcXVlc3RQYXJhbXNcclxuICAgIClcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YW5kYXJkIGZlYXR1cmUgcXVlcnkgYWdhaW5zdCBhIG1hcCBzZXJ2aWNlIGxheWVyIChmb3IgUm9hZCBMb2cgaW5kaXZpZHVhbCBldmVudCBxdWVyaWVzKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5RmVhdHVyZXMgKFxyXG4gICAgbWFwU2VydmljZVVybDogc3RyaW5nLFxyXG4gICAgbGF5ZXJJZDogbnVtYmVyLFxyXG4gICAgd2hlcmU6IHN0cmluZyxcclxuICAgIG91dEZpZWxkczogc3RyaW5nW10gPSBbJyonXVxyXG4gICk6IFByb21pc2U8RmVhdHVyZVNldFJlc3VsdD4ge1xyXG4gICAgLy8gVGhlIG1hcCBzZXJ2aWNlIFVSTCBpcyB0aGUgcGFyZW50IG9mIExSU2VydmVyIGV4dGVuc2lvblxyXG4gICAgLy8gZS5nLiAuLi4vTWFwU2VydmVyLzAvcXVlcnlcclxuICAgIGNvbnN0IGJhc2VNYXBVcmwgPSB0aGlzLmJhc2VVcmwucmVwbGFjZSgvXFwvZXh0c1xcL0xSU2VydmVyJC9pLCAnJylcclxuICAgIGNvbnN0IHVybCA9IGAke2Jhc2VNYXBVcmx9LyR7bGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICB3aGVyZSxcclxuICAgICAgb3V0RmllbGRzOiBvdXRGaWVsZHMuam9pbignLCcpLFxyXG4gICAgICByZXR1cm5HZW9tZXRyeTogJ2ZhbHNlJyxcclxuICAgICAgZjogJ2pzb24nXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy50b2tlbikge1xyXG4gICAgICBwYXJhbXMudG9rZW4gPSB0aGlzLnRva2VuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGpzb25wUmVxdWVzdCh1cmwsIHBhcmFtcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIERpcmVjdCBxdWVyeSB3aXRoIGFyYml0cmFyeSBwYXJhbXMgKGZvciBzcGF0aWFsIHF1ZXJpZXMgdmlhIEpTT05QKVxyXG4gICAqL1xyXG4gIGFzeW5jIHF1ZXJ5RmVhdHVyZXNEaXJlY3QgKHVybDogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPEZlYXR1cmVTZXRSZXN1bHQ+IHtcclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuICAgIHBhcmFtcy5mID0gcGFyYW1zLmYgfHwgJ2pzb24nXHJcbiAgICByZXR1cm4ganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogUXVlcnkgcm91dGVzIG9uIGEgbmV0d29yayBsYXllciAoZm9yIHJvdXRlIHBpY2tlciBhdXRvY29tcGxldGUpXHJcbiAgICovXHJcbiAgYXN5bmMgcXVlcnlSb3V0ZXMgKFxyXG4gICAgbmV0d29ya0xheWVySWQ6IG51bWJlcixcclxuICAgIHNlYXJjaFRleHQ6IHN0cmluZyxcclxuICAgIHJvdXRlSWRGaWVsZDogc3RyaW5nLFxyXG4gICAgcm91dGVOYW1lRmllbGQ6IHN0cmluZyB8IG51bGwsXHJcbiAgICBtYXhSZXN1bHRzOiBudW1iZXIgPSAxMFxyXG4gICk6IFByb21pc2U8QXJyYXk8eyByb3V0ZUlkOiBzdHJpbmc7IHJvdXRlTmFtZTogc3RyaW5nIHwgbnVsbCB9Pj4ge1xyXG4gICAgY29uc3QgYmFzZU1hcFVybCA9IHRoaXMuYmFzZVVybC5yZXBsYWNlKC9cXC9leHRzXFwvTFJTZXJ2ZXIkL2ksICcnKVxyXG4gICAgY29uc3QgdXJsID0gYCR7YmFzZU1hcFVybH0vJHtuZXR3b3JrTGF5ZXJJZH0vcXVlcnlgXHJcblxyXG4gICAgY29uc3Qgc2VhcmNoRmllbGQgPSByb3V0ZU5hbWVGaWVsZCB8fCByb3V0ZUlkRmllbGRcclxuICAgIGNvbnN0IHdoZXJlID0gYFVQUEVSKCR7c2VhcmNoRmllbGR9KSBMSUtFIFVQUEVSKCcke3NlYXJjaFRleHQucmVwbGFjZSgvJy9nLCBcIicnXCIpfSUnKWBcclxuICAgIGNvbnN0IG91dEZpZWxkcyA9IHJvdXRlTmFtZUZpZWxkXHJcbiAgICAgID8gW3JvdXRlSWRGaWVsZCwgcm91dGVOYW1lRmllbGRdXHJcbiAgICAgIDogW3JvdXRlSWRGaWVsZF1cclxuXHJcbiAgICBjb25zdCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XHJcbiAgICAgIHdoZXJlLFxyXG4gICAgICBvdXRGaWVsZHM6IG91dEZpZWxkcy5qb2luKCcsJyksXHJcbiAgICAgIHJldHVybkdlb21ldHJ5OiAnZmFsc2UnLFxyXG4gICAgICByZXN1bHRSZWNvcmRDb3VudDogbWF4UmVzdWx0cy50b1N0cmluZygpLFxyXG4gICAgICBmOiAnanNvbidcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnRva2VuKSB7XHJcbiAgICAgIHBhcmFtcy50b2tlbiA9IHRoaXMudG9rZW5cclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBqc29uID0gYXdhaXQganNvbnBSZXF1ZXN0KHVybCwgcGFyYW1zKVxyXG5cclxuICAgIGNvbnN0IGFsbCA9IChqc29uLmZlYXR1cmVzIHx8IFtdKS5tYXAoKGY6IGFueSkgPT4gKHtcclxuICAgICAgcm91dGVJZDogZi5hdHRyaWJ1dGVzW3JvdXRlSWRGaWVsZF0sXHJcbiAgICAgIHJvdXRlTmFtZTogcm91dGVOYW1lRmllbGQgPyBmLmF0dHJpYnV0ZXNbcm91dGVOYW1lRmllbGRdIDogbnVsbFxyXG4gICAgfSkpXHJcbiAgICAvLyBEZWR1cGxpY2F0ZSBieSByb3V0ZUlkXHJcbiAgICBjb25zdCBzZWVuID0gbmV3IFNldDxzdHJpbmc+KClcclxuICAgIHJldHVybiBhbGwuZmlsdGVyKChyOiBhbnkpID0+IHtcclxuICAgICAgaWYgKHNlZW4uaGFzKHIucm91dGVJZCkpIHJldHVybiBmYWxzZVxyXG4gICAgICBzZWVuLmFkZChyLnJvdXRlSWQpXHJcbiAgICAgIHJldHVybiB0cnVlXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLy8gLS0tIFByaXZhdGUgaGVscGVycyAtLS1cclxuXHJcbiAgcHJpdmF0ZSBhc3luYyByZXF1ZXN0PFQ+IChwYXRoOiBzdHJpbmcsIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPFQ+IHtcclxuICAgIGNvbnN0IHVybCA9IGAke3RoaXMuYmFzZVVybH0ke3BhdGh9YFxyXG4gICAgY29uc3QgYWxsUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xyXG4gICAgICBmOiAnanNvbicsXHJcbiAgICAgIC4uLnBhcmFtc1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMudG9rZW4pIHtcclxuICAgICAgYWxsUGFyYW1zLnRva2VuID0gdGhpcy50b2tlblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBqc29ucFJlcXVlc3QodXJsLCBhbGxQYXJhbXMpIGFzIFByb21pc2U8VD5cclxuICB9XHJcbn1cclxuIiwiLy8gV2VsbC1rbm93biBjb2RlZCB2YWx1ZSBkb21haW5zIGZvciBjb21tb24gTFJTIGZpZWxkcy5cclxuLy8gVGhlc2UgcHJvdmlkZSBodW1hbi1yZWFkYWJsZSBsYWJlbHMgd2hlbiB0aGUgc2VydmljZSBsYWNrcyBjb2RlZCB2YWx1ZSBkb21haW5zLlxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBLbm93bkRvbWFpbk1hcCB7XHJcbiAgW2ZpZWxkTmFtZTogc3RyaW5nXTogeyBbY29kZTogc3RyaW5nXTogc3RyaW5nIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEZIV0EgRnVuY3Rpb25hbCBDbGFzc2lmaWNhdGlvbiBTeXN0ZW1cclxuICogaHR0cHM6Ly93d3cuZmh3YS5kb3QuZ292L3BsYW5uaW5nL3Byb2Nlc3Nlcy9zdGF0ZXdpZGUvcmVsYXRlZC9oaWdod2F5X2Z1bmN0aW9uYWxfY2xhc3NpZmljYXRpb25zL1xyXG4gKi9cclxuY29uc3QgRkhXQV9GVU5DVElPTkFMX0NMQVNTOiB7IFtjb2RlOiBzdHJpbmddOiBzdHJpbmcgfSA9IHtcclxuICAnMCc6ICdVbmtub3duJyxcclxuICAnMSc6ICdSdXJhbCBJbnRlcnN0YXRlJyxcclxuICAnMic6ICdSdXJhbCBQcmluY2lwYWwgQXJ0ZXJpYWwnLFxyXG4gICczJzogJ1J1cmFsIE1pbm9yIEFydGVyaWFsJyxcclxuICAnNCc6ICdSdXJhbCBNYWpvciBDb2xsZWN0b3InLFxyXG4gICc1JzogJ1J1cmFsIE1pbm9yIENvbGxlY3RvcicsXHJcbiAgJzYnOiAnUnVyYWwgTG9jYWwnLFxyXG4gICc3JzogJ1VyYmFuIEludGVyc3RhdGUnLFxyXG4gICc4JzogJ1VyYmFuIEZyZWV3YXkvRXhwcmVzc3dheScsXHJcbiAgJzknOiAnVXJiYW4gUHJpbmNpcGFsIEFydGVyaWFsJyxcclxuICAnMTAnOiAnVXJiYW4gTWlub3IgQXJ0ZXJpYWwnLFxyXG4gICcxMSc6ICdVcmJhbiBDb2xsZWN0b3InLFxyXG4gICcxMic6ICdVcmJhbiBMb2NhbCdcclxufVxyXG5cclxuLyoqXHJcbiAqIE1hcCBvZiBmaWVsZCBuYW1lcyB0byB0aGVpciBrbm93biBkb21haW4gbG9va3Vwcy5cclxuICogRmllbGQgbmFtZSBtYXRjaGluZyBpcyBjYXNlLXNlbnNpdGl2ZS5cclxuICovXHJcbmV4cG9ydCBjb25zdCBLTk9XTl9ET01BSU5TOiBLbm93bkRvbWFpbk1hcCA9IHtcclxuICBmdW5jdGlvbmFsY2xhc3N0eXBlOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1MsXHJcbiAgZnVuY3Rpb25hbGNsYXNzOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1MsXHJcbiAgZnVuY3Rpb25hbF9jbGFzczogRkhXQV9GVU5DVElPTkFMX0NMQVNTLFxyXG4gIGZ1bmNfY2xhc3M6IEZIV0FfRlVOQ1RJT05BTF9DTEFTUyxcclxuICBGdW5jdGlvbmFsQ2xhc3NUeXBlOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1MsXHJcbiAgRnVuY3Rpb25hbENsYXNzOiBGSFdBX0ZVTkNUSU9OQUxfQ0xBU1NcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlc29sdmUgYSByYXcgY29kZSB0byBhIGRpc3BsYXkgbGFiZWwgdXNpbmcga25vd24gZG9tYWlucy5cclxuICogUmV0dXJucyBudWxsIGlmIG5vIG1hcHBpbmcgZXhpc3RzLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVLbm93bkRvbWFpbiAoZmllbGROYW1lOiBzdHJpbmcsIGNvZGU6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gIGNvbnN0IGRvbWFpbiA9IEtOT1dOX0RPTUFJTlNbZmllbGROYW1lXVxyXG4gIGlmICghZG9tYWluKSByZXR1cm4gbnVsbFxyXG4gIGNvbnN0IGtleSA9IFN0cmluZyhjb2RlKVxyXG4gIHJldHVybiBkb21haW5ba2V5XSA/PyBudWxsXHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfY29yZV9fOyIsIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9qaW11X3VpX2FkdmFuY2VkX3NldHRpbmdfY29tcG9uZW50c19fOyIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGV4aXN0cyAoZGV2ZWxvcG1lbnQgb25seSlcblx0aWYgKF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdID09PSB1bmRlZmluZWQpIHtcblx0XHR2YXIgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiOyIsIi8qKlxyXG4gKiBXZWJwYWNrIHdpbGwgcmVwbGFjZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB3aXRoIF9fd2VicGFja19yZXF1aXJlX18ucCB0byBzZXQgdGhlIHB1YmxpYyBwYXRoIGR5bmFtaWNhbGx5LlxyXG4gKiBUaGUgcmVhc29uIHdoeSB3ZSBjYW4ndCBzZXQgdGhlIHB1YmxpY1BhdGggaW4gd2VicGFjayBjb25maWcgaXM6IHdlIGNoYW5nZSB0aGUgcHVibGljUGF0aCB3aGVuIGRvd25sb2FkLlxyXG4gKiAqL1xyXG5fX3dlYnBhY2tfcHVibGljX3BhdGhfXyA9IHdpbmRvdy5qaW11Q29uZmlnLmJhc2VVcmxcclxuIiwiLyoqIEBqc3hSdW50aW1lIGNsYXNzaWMgKi9cclxuaW1wb3J0IHsgUmVhY3QgfSBmcm9tICdqaW11LWNvcmUnXHJcbmltcG9ydCB0eXBlIHsgQWxsV2lkZ2V0U2V0dGluZ1Byb3BzIH0gZnJvbSAnamltdS1mb3ItYnVpbGRlcidcclxuaW1wb3J0IHsgTWFwV2lkZ2V0U2VsZWN0b3IgfSBmcm9tICdqaW11LXVpL2FkdmFuY2VkL3NldHRpbmctY29tcG9uZW50cydcclxuaW1wb3J0IHR5cGUgeyBJTUNvbmZpZywgRXZlbnRMYXllckNvbmZpZyB9IGZyb20gJy4uL2NvbmZpZydcclxuaW1wb3J0IHsgTHJzU2VydmljZSB9IGZyb20gJy4uL2xycy11dGlscy9scnMtc2VydmljZSdcclxuaW1wb3J0IHsgS05PV05fRE9NQUlOUyB9IGZyb20gJy4uL2xycy11dGlscy91dGlscy9rbm93bi1kb21haW5zJ1xyXG5cclxuY29uc3QgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZUVmZmVjdCB9ID0gUmVhY3RcclxuXHJcbmludGVyZmFjZSBEaXNjb3ZlcmVkTGF5ZXIge1xyXG4gIGlkOiBudW1iZXJcclxuICBuYW1lOiBzdHJpbmdcclxuICB0eXBlOiBzdHJpbmdcclxuICBmaWVsZHM6IEFycmF5PHsgbmFtZTogc3RyaW5nOyBhbGlhczogc3RyaW5nOyB0eXBlOiBzdHJpbmcgfT5cclxuICByb3V0ZUlkRmllbGROYW1lOiBzdHJpbmdcclxuICBmcm9tTWVhc3VyZUZpZWxkTmFtZTogc3RyaW5nXHJcbiAgdG9NZWFzdXJlRmllbGROYW1lOiBzdHJpbmcgfCBudWxsXHJcbn1cclxuXHJcbmNvbnN0IFNldHRpbmcgPSAocHJvcHM6IEFsbFdpZGdldFNldHRpbmdQcm9wczxJTUNvbmZpZz4pID0+IHtcclxuICBjb25zdCBjb25maWcgPSBwcm9wcy5jb25maWdcclxuXHJcbiAgY29uc3QgW25ldHdvcmtMYXllcnMsIHNldE5ldHdvcmtMYXllcnNdID0gdXNlU3RhdGU8QXJyYXk8eyBpZDogbnVtYmVyOyBuYW1lOiBzdHJpbmcgfT4+KFtdKVxyXG4gIGNvbnN0IFtkaXNjb3ZlcmVkTGF5ZXJzLCBzZXREaXNjb3ZlcmVkTGF5ZXJzXSA9IHVzZVN0YXRlPERpc2NvdmVyZWRMYXllcltdPihbXSlcclxuICBjb25zdCBbbG9hZGluZ1NlcnZpY2UsIHNldExvYWRpbmdTZXJ2aWNlXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtzZXJ2aWNlRXJyb3IsIHNldFNlcnZpY2VFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKVxyXG5cclxuICAvLyBTeXN0ZW0gZmllbGRzIHRoYXQgc2hvdWxkbid0IGFwcGVhciBpbiB0aGUgYXR0cmlidXRlIHBpY2tlclxyXG4gIGNvbnN0IFNZU1RFTV9GSUVMRFMgPSBbXHJcbiAgICAnT0JKRUNUSUQnLCAnU2hhcGUnLCAnc2hhcGUnLCAncm91dGVpZCcsICdyaWQnLCAnZnJvbW1lYXN1cmUnLCAndG9tZWFzdXJlJyxcclxuICAgICdtZWFzJywgJ2Zyb21kYXRlJywgJ3RvZGF0ZScsICdldmVudGlkJywgJ0xvY0Vycm9yJywgJ2xvY2Vycm9yJyxcclxuICAgICdTaGFwZV9MZW5ndGgnLCAnc2hhcGUuU1RMZW5ndGgoKScsICdyZWNvcmRkYXRlJ1xyXG4gIF1cclxuXHJcbiAgY29uc3QgdXBkYXRlQ29uZmlnID0gdXNlQ2FsbGJhY2soKGtleTogc3RyaW5nLCB2YWx1ZTogYW55KSA9PiB7XHJcbiAgICBwcm9wcy5vblNldHRpbmdDaGFuZ2Uoe1xyXG4gICAgICBpZDogcHJvcHMuaWQsXHJcbiAgICAgIGNvbmZpZzogcHJvcHMuY29uZmlnLnNldChrZXksIHZhbHVlKVxyXG4gICAgfSlcclxuICB9LCBbcHJvcHNdKVxyXG5cclxuICAvLyBMb2FkIHNlcnZpY2UgaW5mbyB3aGVuIFVSTCBjaGFuZ2VzXHJcbiAgY29uc3QgbG9hZFNlcnZpY2VJbmZvID0gdXNlQ2FsbGJhY2soYXN5bmMgKHVybDogc3RyaW5nKSA9PiB7XHJcbiAgICBpZiAoIXVybC50cmltKCkpIHJldHVyblxyXG4gICAgc2V0TG9hZGluZ1NlcnZpY2UodHJ1ZSlcclxuICAgIHNldFNlcnZpY2VFcnJvcihudWxsKVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IGxycyA9IG5ldyBMcnNTZXJ2aWNlKHVybC50cmltKCkpXHJcbiAgICAgIGNvbnN0IGluZm8gPSBhd2FpdCBscnMuZ2V0U2VydmljZUluZm8oKVxyXG5cclxuICAgICAgY29uc3QgbmV0cyA9IChpbmZvLm5ldHdvcmtMYXllcnMgfHwgW10pLm1hcChuID0+ICh7IGlkOiBuLmlkLCBuYW1lOiBuLm5hbWUgfSkpXHJcbiAgICAgIHNldE5ldHdvcmtMYXllcnMobmV0cylcclxuXHJcbiAgICAgIC8vIERpc2NvdmVyIG5ldHdvcmsgbGF5ZXIgcm91dGUgSUQgZmllbGRcclxuICAgICAgaWYgKG5ldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkTmV0SWQgPSAocHJvcHMuY29uZmlnIGFzIGFueSk/Lm5ldHdvcmtMYXllcklkID8/IG5ldHNbMF0uaWRcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgbmV0RGV0YWlsID0gYXdhaXQgbHJzLmdldE5ldHdvcmtMYXllckluZm8oc2VsZWN0ZWROZXRJZClcclxuICAgICAgICAgIGNvbnN0IG5ldFJvdXRlRmllbGQgPSAobmV0RGV0YWlsIGFzIGFueSkucm91dGVJZEZpZWxkTmFtZSB8fCAncm91dGVpZCdcclxuICAgICAgICAgIGNvbnN0IG5ldFJvdXRlTmFtZUZpZWxkID0gKG5ldERldGFpbCBhcyBhbnkpLnJvdXRlTmFtZUZpZWxkTmFtZSB8fCBudWxsXHJcbiAgICAgICAgICB1cGRhdGVDb25maWcoJ25ldHdvcmtSb3V0ZUlkRmllbGQnLCBuZXRSb3V0ZUZpZWxkKVxyXG4gICAgICAgICAgaWYgKG5ldFJvdXRlTmFtZUZpZWxkKSB7XHJcbiAgICAgICAgICAgIHVwZGF0ZUNvbmZpZygnbmV0d29ya1JvdXRlTmFtZUZpZWxkJywgbmV0Um91dGVOYW1lRmllbGQpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAvLyBmYWxsYmFja1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRmV0Y2ggZmllbGQgaW5mbyBmb3IgZWFjaCBldmVudCBsYXllclxyXG4gICAgICBjb25zdCBsYXllcnM6IERpc2NvdmVyZWRMYXllcltdID0gW11cclxuICAgICAgZm9yIChjb25zdCBlbCBvZiAoaW5mby5ldmVudExheWVycyB8fCBbXSkpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgZGV0YWlsID0gYXdhaXQgbHJzLmdldEV2ZW50TGF5ZXJJbmZvKGVsLmlkKVxyXG4gICAgICAgICAgY29uc3QgdXNlckZpZWxkcyA9IChkZXRhaWwuZmllbGRzIHx8IFtdKS5maWx0ZXIoXHJcbiAgICAgICAgICAgIGYgPT4gIVNZU1RFTV9GSUVMRFMuaW5jbHVkZXMoZi5uYW1lKSAmJlxyXG4gICAgICAgICAgICAgICAgIGYudHlwZSAhPT0gJ2VzcmlGaWVsZFR5cGVPSUQnICYmXHJcbiAgICAgICAgICAgICAgICAgZi50eXBlICE9PSAnZXNyaUZpZWxkVHlwZUdlb21ldHJ5J1xyXG4gICAgICAgICAgKVxyXG4gICAgICAgICAgbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgICBpZDogZWwuaWQsXHJcbiAgICAgICAgICAgIG5hbWU6IGVsLm5hbWUsXHJcbiAgICAgICAgICAgIHR5cGU6IGVsLnR5cGUsXHJcbiAgICAgICAgICAgIGZpZWxkczogdXNlckZpZWxkcy5tYXAoZiA9PiAoeyBuYW1lOiBmLm5hbWUsIGFsaWFzOiBmLmFsaWFzIHx8IGYubmFtZSwgdHlwZTogZi50eXBlIH0pKSxcclxuICAgICAgICAgICAgcm91dGVJZEZpZWxkTmFtZTogKGRldGFpbCBhcyBhbnkpLnJvdXRlSWRGaWVsZE5hbWUgfHwgJ3JvdXRlaWQnLFxyXG4gICAgICAgICAgICBmcm9tTWVhc3VyZUZpZWxkTmFtZTogKGRldGFpbCBhcyBhbnkpLmZyb21NZWFzdXJlRmllbGROYW1lIHx8ICdmcm9tbWVhc3VyZScsXHJcbiAgICAgICAgICAgIHRvTWVhc3VyZUZpZWxkTmFtZTogKGRldGFpbCBhcyBhbnkpLnRvTWVhc3VyZUZpZWxkTmFtZSB8fCBudWxsXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgbGF5ZXJzLnB1c2goe1xyXG4gICAgICAgICAgICBpZDogZWwuaWQsIG5hbWU6IGVsLm5hbWUsIHR5cGU6IGVsLnR5cGUsIGZpZWxkczogW10sXHJcbiAgICAgICAgICAgIHJvdXRlSWRGaWVsZE5hbWU6ICdyb3V0ZWlkJywgZnJvbU1lYXN1cmVGaWVsZE5hbWU6ICdmcm9tbWVhc3VyZScsIHRvTWVhc3VyZUZpZWxkTmFtZTogbnVsbFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgc2V0RGlzY292ZXJlZExheWVycyhsYXllcnMpXHJcbiAgICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgICBzZXRTZXJ2aWNlRXJyb3IoZXJyLm1lc3NhZ2UgfHwgJ0ZhaWxlZCB0byBsb2FkIHNlcnZpY2UgaW5mbycpXHJcbiAgICAgIHNldE5ldHdvcmtMYXllcnMoW10pXHJcbiAgICAgIHNldERpc2NvdmVyZWRMYXllcnMoW10pXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nU2VydmljZShmYWxzZSlcclxuICAgIH1cclxuICB9LCBbXSlcclxuXHJcbiAgLy8gQXV0by1sb2FkIHNlcnZpY2UgaW5mbyBvbiBtb3VudCBpZiBVUkwgaXMgc2V0XHJcbiAgdXNlRWZmZWN0KCgpID0+IHtcclxuICAgIGlmIChjb25maWc/Lmxyc1NlcnZpY2VVcmwgJiYgZGlzY292ZXJlZExheWVycy5sZW5ndGggPT09IDApIHtcclxuICAgICAgbG9hZFNlcnZpY2VJbmZvKGNvbmZpZy5scnNTZXJ2aWNlVXJsKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICBjb25zdCBoYW5kbGVVcmxDaGFuZ2UgPSB1c2VDYWxsYmFjaygoZTogUmVhY3QuQ2hhbmdlRXZlbnQ8SFRNTElucHV0RWxlbWVudD4pID0+IHtcclxuICAgIHVwZGF0ZUNvbmZpZygnbHJzU2VydmljZVVybCcsIGUudGFyZ2V0LnZhbHVlKVxyXG4gIH0sIFt1cGRhdGVDb25maWddKVxyXG5cclxuICBjb25zdCBoYW5kbGVVcmxCbHVyID0gdXNlQ2FsbGJhY2soKCkgPT4ge1xyXG4gICAgaWYgKGNvbmZpZz8ubHJzU2VydmljZVVybCkge1xyXG4gICAgICBsb2FkU2VydmljZUluZm8oY29uZmlnLmxyc1NlcnZpY2VVcmwpXHJcbiAgICB9XHJcbiAgfSwgW2NvbmZpZz8ubHJzU2VydmljZVVybCwgbG9hZFNlcnZpY2VJbmZvXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlTmV0d29ya0NoYW5nZSA9IHVzZUNhbGxiYWNrKChlOiBSZWFjdC5DaGFuZ2VFdmVudDxIVE1MU2VsZWN0RWxlbWVudD4pID0+IHtcclxuICAgIHVwZGF0ZUNvbmZpZygnbmV0d29ya0xheWVySWQnLCBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApKVxyXG4gIH0sIFt1cGRhdGVDb25maWddKVxyXG5cclxuICAvLyBUb2dnbGUgYW4gZXZlbnQgbGF5ZXIgb24vb2ZmIOKAlCBhdXRvLXNlbGVjdCBhbGwgdXNlciBmaWVsZHMgd2hlbiBlbmFibGluZ1xyXG4gIGNvbnN0IHRvZ2dsZUV2ZW50TGF5ZXIgPSB1c2VDYWxsYmFjaygobGF5ZXI6IERpc2NvdmVyZWRMYXllcikgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudDogRXZlbnRMYXllckNvbmZpZ1tdID0gY29uZmlnPy5ldmVudExheWVyQ29uZmlncyA/IFsuLi5jb25maWcuZXZlbnRMYXllckNvbmZpZ3MgYXMgYW55XSA6IFtdXHJcbiAgICBjb25zdCBpZHggPSBjdXJyZW50LmZpbmRJbmRleChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXIuaWQpXHJcblxyXG4gICAgaWYgKGlkeCA+PSAwKSB7XHJcbiAgICAgIGN1cnJlbnQuc3BsaWNlKGlkeCwgMSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIEJ1aWxkIGRvbWFpbk92ZXJyaWRlcyBmcm9tIGtub3duIGRvbWFpbnNcclxuICAgICAgY29uc3Qgb3ZlcnJpZGVzOiB7IFtmaWVsZE5hbWU6IHN0cmluZ106IHsgW2NvZGU6IHN0cmluZ106IHN0cmluZyB9IH0gPSB7fVxyXG4gICAgICBmb3IgKGNvbnN0IGYgb2YgbGF5ZXIuZmllbGRzKSB7XHJcbiAgICAgICAgaWYgKEtOT1dOX0RPTUFJTlNbZi5uYW1lXSkge1xyXG4gICAgICAgICAgb3ZlcnJpZGVzW2YubmFtZV0gPSBLTk9XTl9ET01BSU5TW2YubmFtZV1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IG5ld0xheWVyOiBFdmVudExheWVyQ29uZmlnID0ge1xyXG4gICAgICAgIGxheWVySWQ6IGxheWVyLmlkLFxyXG4gICAgICAgIG5hbWU6IGxheWVyLm5hbWUsXHJcbiAgICAgICAgdHlwZTogbGF5ZXIudHlwZSBhcyBhbnksXHJcbiAgICAgICAgYXR0cmlidXRlczogW10sXHJcbiAgICAgICAgcm91dGVJZEZpZWxkOiBsYXllci5yb3V0ZUlkRmllbGROYW1lLFxyXG4gICAgICAgIC4uLihsYXllci50eXBlLmluY2x1ZGVzKCdQb2ludCcpXHJcbiAgICAgICAgICA/IHsgbWVhc3VyZUZpZWxkOiBsYXllci5mcm9tTWVhc3VyZUZpZWxkTmFtZSB9XHJcbiAgICAgICAgICA6IHsgZnJvbU1lYXN1cmVGaWVsZDogbGF5ZXIuZnJvbU1lYXN1cmVGaWVsZE5hbWUsIHRvTWVhc3VyZUZpZWxkOiBsYXllci50b01lYXN1cmVGaWVsZE5hbWUgfHwgdW5kZWZpbmVkIH0pLFxyXG4gICAgICAgIC4uLihPYmplY3Qua2V5cyhvdmVycmlkZXMpLmxlbmd0aCA+IDAgPyB7IGRvbWFpbk92ZXJyaWRlczogb3ZlcnJpZGVzIH0gOiB7fSlcclxuICAgICAgfVxyXG4gICAgICBjdXJyZW50LnB1c2gobmV3TGF5ZXIpXHJcbiAgICB9XHJcblxyXG4gICAgdXBkYXRlQ29uZmlnKCdldmVudExheWVyQ29uZmlncycsIGN1cnJlbnQpXHJcbiAgfSwgW2NvbmZpZz8uZXZlbnRMYXllckNvbmZpZ3MsIHVwZGF0ZUNvbmZpZ10pXHJcblxyXG4gIC8vIFRvZ2dsZSBhbiBpbmRpdmlkdWFsIGF0dHJpYnV0ZSBmaWVsZCB3aXRoaW4gYW4gZXZlbnQgbGF5ZXJcclxuICBjb25zdCB0b2dnbGVBdHRyaWJ1dGUgPSB1c2VDYWxsYmFjaygobGF5ZXJJZDogbnVtYmVyLCBmaWVsZE5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgY29uc3QgY3VycmVudDogRXZlbnRMYXllckNvbmZpZ1tdID0gY29uZmlnPy5ldmVudExheWVyQ29uZmlncyA/IFsuLi5jb25maWcuZXZlbnRMYXllckNvbmZpZ3MgYXMgYW55XSA6IFtdXHJcbiAgICBjb25zdCBpZHggPSBjdXJyZW50LmZpbmRJbmRleChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXJJZClcclxuICAgIGlmIChpZHggPCAwKSByZXR1cm5cclxuXHJcbiAgICBjb25zdCBhdHRycyA9IFsuLi5jdXJyZW50W2lkeF0uYXR0cmlidXRlc11cclxuICAgIGNvbnN0IGF0dHJJZHggPSBhdHRycy5pbmRleE9mKGZpZWxkTmFtZSlcclxuICAgIGlmIChhdHRySWR4ID49IDApIHtcclxuICAgICAgYXR0cnMuc3BsaWNlKGF0dHJJZHgsIDEpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBhdHRycy5wdXNoKGZpZWxkTmFtZSlcclxuICAgIH1cclxuICAgIGN1cnJlbnRbaWR4XSA9IHsgLi4uY3VycmVudFtpZHhdLCBhdHRyaWJ1dGVzOiBhdHRycyB9XHJcbiAgICB1cGRhdGVDb25maWcoJ2V2ZW50TGF5ZXJDb25maWdzJywgY3VycmVudClcclxuICB9LCBbY29uZmlnPy5ldmVudExheWVyQ29uZmlncywgdXBkYXRlQ29uZmlnXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlUHJlY2lzaW9uQ2hhbmdlID0gdXNlQ2FsbGJhY2soKGU6IFJlYWN0LkNoYW5nZUV2ZW50PEhUTUxJbnB1dEVsZW1lbnQ+KSA9PiB7XHJcbiAgICBjb25zdCB2YWwgPSBwYXJzZUludChlLnRhcmdldC52YWx1ZSwgMTApXHJcbiAgICB1cGRhdGVDb25maWcoJ21lYXN1cmVQcmVjaXNpb24nLCBpc05hTih2YWwpID8gMyA6IHZhbClcclxuICB9LCBbdXBkYXRlQ29uZmlnXSlcclxuXHJcbiAgY29uc3QgaGFuZGxlTWFwV2lkZ2V0Q2hhbmdlID0gdXNlQ2FsbGJhY2soKHVzZU1hcFdpZGdldElkczogc3RyaW5nW10pID0+IHtcclxuICAgIHByb3BzLm9uU2V0dGluZ0NoYW5nZSh7XHJcbiAgICAgIGlkOiBwcm9wcy5pZCxcclxuICAgICAgdXNlTWFwV2lkZ2V0SWRzXHJcbiAgICB9KVxyXG4gIH0sIFtwcm9wc10pXHJcblxyXG4gIC8vIEdldCB0aGUgY29uZmlnIGVudHJ5IGZvciBhIGRpc2NvdmVyZWQgbGF5ZXJcclxuICBjb25zdCBnZXRMYXllckNvbmZpZyA9IChsYXllcklkOiBudW1iZXIpOiBFdmVudExheWVyQ29uZmlnIHwgdW5kZWZpbmVkID0+IHtcclxuICAgIHJldHVybiAoY29uZmlnPy5ldmVudExheWVyQ29uZmlncyBhcyBhbnkgYXMgRXZlbnRMYXllckNvbmZpZ1tdIHx8IFtdKVxyXG4gICAgICAuZmluZChlID0+IGUubGF5ZXJJZCA9PT0gbGF5ZXJJZClcclxuICB9XHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cInAtM1wiIHN0eWxlPXt7IGZvbnRTaXplOiAnMTNweCcsIGNvbG9yOiAnIzAwMCcgfX0+XHJcbiAgICAgIDxoNSBzdHlsZT17eyBmb250U2l6ZTogJzE0cHgnLCBmb250V2VpZ2h0OiA2MDAsIG1hcmdpbkJvdHRvbTogJzEycHgnLCBjb2xvcjogJyMwMDAnIH19PlJvYWQgTG9nIFNldHRpbmdzPC9oNT5cclxuXHJcbiAgICAgIHsvKiBMUlMgU2VydmljZSBVUkwgKi99XHJcbiAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgPGxhYmVsIHN0eWxlPXtsYWJlbFN0eWxlfT5MUlMgU2VydmljZSBVUkw8L2xhYmVsPlxyXG4gICAgICAgIDxwIHN0eWxlPXtkZXNjU3R5bGV9PlRoZSBSRVNUIGVuZHBvaW50IGZvciB5b3VyIExpbmVhciBSZWZlcmVuY2luZyBTeXN0ZW0gKExSUykgc2VydmljZS4gQ2xpY2sgXCJMb2FkIFNlcnZpY2VcIiB0byBkaXNjb3ZlciBhdmFpbGFibGUgbmV0d29yayBhbmQgZXZlbnQgbGF5ZXJzLjwvcD5cclxuICAgICAgICA8aW5wdXRcclxuICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcclxuICAgICAgICAgIHZhbHVlPXtjb25maWc/Lmxyc1NlcnZpY2VVcmwgfHwgJyd9XHJcbiAgICAgICAgICBvbkNoYW5nZT17aGFuZGxlVXJsQ2hhbmdlfVxyXG4gICAgICAgICAgb25CbHVyPXtoYW5kbGVVcmxCbHVyfVxyXG4gICAgICAgICAgc3R5bGU9e2lucHV0U3R5bGV9XHJcbiAgICAgICAgICBwbGFjZWhvbGRlcj1cImh0dHBzOi8vLi4uL01hcFNlcnZlci9leHRzL0xSU2VydmVyXCJcclxuICAgICAgICAvPlxyXG4gICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIG9uQ2xpY2s9e2hhbmRsZVVybEJsdXJ9IHN0eWxlPXtsb2FkQnRuU3R5bGV9PlxyXG4gICAgICAgICAge2xvYWRpbmdTZXJ2aWNlID8gJ0xvYWRpbmcuLi4nIDogJ0xvYWQgU2VydmljZSd9XHJcblxyXG4gICAgICB7LyogTWFwIFdpZGdldCAoZm9yIHBvbHlnb24gc2VsZWN0IG1vZGUpICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXtmaWVsZEdyb3VwU3R5bGV9PlxyXG4gICAgICAgIDxsYWJlbCBzdHlsZT17bGFiZWxTdHlsZX0+TWFwIFdpZGdldCAoZm9yIHBvbHlnb24gc2VsZWN0KTwvbGFiZWw+XHJcbiAgICAgICAgPHAgc3R5bGU9e2Rlc2NTdHlsZX0+Q2hvb3NlIHRoZSBtYXAgd2lkZ2V0IHVzZWQgZm9yIHNwYXRpYWwgc2VsZWN0aW9uLiBUaGlzIGVuYWJsZXMgdGhlIHBvbHlnb24tc2VsZWN0IHRvb2wgdG8gcGljayByb3V0ZXMgZnJvbSB0aGUgbWFwLjwvcD5cclxuICAgICAgICA8TWFwV2lkZ2V0U2VsZWN0b3JcclxuICAgICAgICAgIG9uU2VsZWN0PXtoYW5kbGVNYXBXaWRnZXRDaGFuZ2V9XHJcbiAgICAgICAgICB1c2VNYXBXaWRnZXRJZHM9e3Byb3BzLnVzZU1hcFdpZGdldElkc31cclxuICAgICAgICAvPlxyXG4gICAgICA8L2Rpdj5cclxuICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICB7c2VydmljZUVycm9yICYmIDxkaXYgc3R5bGU9e2Vycm9yU3R5bGV9PntzZXJ2aWNlRXJyb3J9PC9kaXY+fVxyXG4gICAgICA8L2Rpdj5cclxuXHJcbiAgICAgIHsvKiBOZXR3b3JrIExheWVyIChhdXRvLXNlbGVjdCBmaXJzdCBpZiBvbmx5IG9uZSkgKi99XHJcbiAgICAgIHtuZXR3b3JrTGF5ZXJzLmxlbmd0aCA+IDEgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9Pk5ldHdvcmsgTGF5ZXI8L2xhYmVsPlxyXG4gICAgICAgICAgPHAgc3R5bGU9e2Rlc2NTdHlsZX0+U2VsZWN0IHdoaWNoIExSUyBuZXR3b3JrIHRvIHF1ZXJ5IHJvdXRlcyBmcm9tLiBPbmx5IG5lZWRlZCBpZiB5b3VyIHNlcnZpY2UgaGFzIG11bHRpcGxlIG5ldHdvcmtzLjwvcD5cclxuICAgICAgICAgIDxzZWxlY3RcclxuICAgICAgICAgICAgdmFsdWU9e2NvbmZpZz8ubmV0d29ya0xheWVySWQgPz8gJyd9XHJcbiAgICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVOZXR3b3JrQ2hhbmdlfVxyXG4gICAgICAgICAgICBzdHlsZT17aW5wdXRTdHlsZX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgPG9wdGlvbiB2YWx1ZT1cIlwiPi0tIFNlbGVjdCBOZXR3b3JrIC0tPC9vcHRpb24+XHJcbiAgICAgICAgICAgIHtuZXR3b3JrTGF5ZXJzLm1hcChuID0+IChcclxuICAgICAgICAgICAgICA8b3B0aW9uIGtleT17bi5pZH0gdmFsdWU9e24uaWR9PntuLm5hbWV9PC9vcHRpb24+XHJcbiAgICAgICAgICAgICkpfVxyXG4gICAgICAgICAgPC9zZWxlY3Q+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcblxyXG4gICAgICB7LyogRXZlbnQgTGF5ZXJzIOKAlCBhbHdheXMgZXhwYW5kZWQgd2l0aCBhbGwgZmllbGRzIHZpc2libGUgKi99XHJcbiAgICAgIHtkaXNjb3ZlcmVkTGF5ZXJzLmxlbmd0aCA+IDAgJiYgKFxyXG4gICAgICAgIDxkaXYgc3R5bGU9e2ZpZWxkR3JvdXBTdHlsZX0+XHJcbiAgICAgICAgICA8bGFiZWwgc3R5bGU9e2xhYmVsU3R5bGV9PkV2ZW50IExheWVycyAmYW1wOyBBdHRyaWJ1dGVzPC9sYWJlbD5cclxuICAgICAgICAgIDxwIHN0eWxlPXtkZXNjU3R5bGV9PlxyXG4gICAgICAgICAgICBDaGVjayBhIGxheWVyIHRvIGluY2x1ZGUgaXQgaW4gdGhlIHJvYWQgbG9nIHJlcG9ydC4gV2hlbiBlbmFibGVkLCBjaG9vc2Ugd2hpY2ggYXR0cmlidXRlIGZpZWxkcyB0byBkaXNwbGF5LiBGaWVsZHMgbWFya2VkIHdpdGgg4piFIGhhdmUgZG9tYWluIGxhYmVscyB0aGF0IHdpbGwgc2hvdyBkZXNjcmlwdGl2ZSB0ZXh0IGluc3RlYWQgb2YgY29kZXMuXHJcbiAgICAgICAgICA8L3A+XHJcbiAgICAgICAgICA8ZGl2IHN0eWxlPXtldmVudExpc3RTdHlsZX0+XHJcbiAgICAgICAgICAgIHtkaXNjb3ZlcmVkTGF5ZXJzLm1hcChsYXllciA9PiB7XHJcbiAgICAgICAgICAgICAgY29uc3QgbGF5ZXJDZmcgPSBnZXRMYXllckNvbmZpZyhsYXllci5pZClcclxuICAgICAgICAgICAgICBjb25zdCBpc1NlbGVjdGVkID0gISFsYXllckNmZ1xyXG4gICAgICAgICAgICAgIGNvbnN0IHR5cGVUYWcgPSBsYXllci50eXBlLmluY2x1ZGVzKCdQb2ludCcpID8gJyhNYXJrZXIpJyA6ICcoTGluZWFyKSdcclxuXHJcbiAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgIDxkaXYga2V5PXtsYXllci5pZH0gc3R5bGU9e3sgbWFyZ2luQm90dG9tOiAnMTBweCcgfX0+XHJcbiAgICAgICAgICAgICAgICAgIHsvKiBMYXllciBjaGVja2JveCAqL31cclxuICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyBkaXNwbGF5OiAnZmxleCcsIGFsaWduSXRlbXM6ICdjZW50ZXInIH19PlxyXG4gICAgICAgICAgICAgICAgICAgIDxpbnB1dFxyXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcclxuICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2lzU2VsZWN0ZWR9XHJcbiAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gdG9nZ2xlRXZlbnRMYXllcihsYXllcil9XHJcbiAgICAgICAgICAgICAgICAgICAgLz5cclxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBtYXJnaW5MZWZ0OiAnNHB4JywgZm9udFNpemU6ICcxMnB4JywgZm9udFdlaWdodDogNjAwLCBjb2xvcjogJyMwMDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAge2xheWVyLm5hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxyXG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnIzU1NScsIG1hcmdpbkxlZnQ6ICc2cHgnLCBmb250U2l6ZTogJzExcHgnIH19Pnt0eXBlVGFnfTwvc3Bhbj5cclxuICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcblxyXG4gICAgICAgICAgICAgICAgICB7LyogQWx3YXlzLXZpc2libGUgYXR0cmlidXRlIGZpZWxkIGxpc3QgKi99XHJcbiAgICAgICAgICAgICAgICAgIHtpc1NlbGVjdGVkICYmIGxheWVyLmZpZWxkcy5sZW5ndGggPiAwICYmIChcclxuICAgICAgICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtmaWVsZFBpY2tlclN0eWxlfT5cclxuICAgICAgICAgICAgICAgICAgICAgIHtsYXllci5maWVsZHMubWFwKGYgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpc0F0dHJTZWxlY3RlZCA9IGxheWVyQ2ZnPy5hdHRyaWJ1dGVzPy5pbmNsdWRlcyhmLm5hbWUpID8/IGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGhhc0RvbWFpbiA9ICEhKEtOT1dOX0RPTUFJTlNbZi5uYW1lXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICA8bGFiZWwga2V5PXtmLm5hbWV9IHN0eWxlPXt7IGRpc3BsYXk6ICdibG9jaycsIGZvbnRTaXplOiAnMTFweCcsIHBhZGRpbmc6ICcycHggMCcsIGN1cnNvcjogJ3BvaW50ZXInLCBjb2xvcjogJyMwMDAnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrZWQ9e2lzQXR0clNlbGVjdGVkfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZT17KCkgPT4gdG9nZ2xlQXR0cmlidXRlKGxheWVyLmlkLCBmLm5hbWUpfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZT17eyBtYXJnaW5SaWdodDogJzRweCcgfX1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7Zi5hbGlhcyB8fCBmLm5hbWV9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBzdHlsZT17eyBjb2xvcjogJyM1NTUnLCBtYXJnaW5MZWZ0OiAnNHB4JywgZm9udFNpemU6ICcxMHB4JyB9fT57dHlwZVRhZ308L3NwYW4+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7aGFzRG9tYWluICYmIDxzcGFuIHN0eWxlPXt7IGNvbG9yOiAnIzAwNzljMScsIG1hcmdpbkxlZnQ6ICc0cHgnLCBmb250U2l6ZTogJzEwcHgnIH19PuKYhSBsYWJlbHM8L3NwYW4+fVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIClcclxuICAgICAgICAgICAgICAgICAgICAgIH0pfVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG5cclxuICAgICAgICAgICAgICAgICAge2lzU2VsZWN0ZWQgJiYgbGF5ZXIuZmllbGRzLmxlbmd0aCA9PT0gMCAmJiAoXHJcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBzdHlsZT17eyAuLi5maWVsZFBpY2tlclN0eWxlLCBjb2xvcjogJyM4ODgnLCBmb250U3R5bGU6ICdpdGFsaWMnIH19PlxyXG4gICAgICAgICAgICAgICAgICAgICAgTm8gdXNlciBhdHRyaWJ1dGVzIGF2YWlsYWJsZVxyXG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICApfVxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgKVxyXG4gICAgICAgICAgICB9KX1cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZGl2PlxyXG4gICAgICApfVxyXG5cclxuICAgICAgey8qIE1lYXN1cmUgUHJlY2lzaW9uICovfVxyXG4gICAgICA8ZGl2IHN0eWxlPXtmaWVsZEdyb3VwU3R5bGV9PlxyXG4gICAgICAgIDxsYWJlbCBzdHlsZT17bGFiZWxTdHlsZX0+TWVhc3VyZSBQcmVjaXNpb24gKGRlY2ltYWwgcGxhY2VzKTwvbGFiZWw+XHJcbiAgICAgICAgPHAgc3R5bGU9e2Rlc2NTdHlsZX0+TnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIHRvIGRpc3BsYXkgZm9yIG1lYXN1cmUgdmFsdWVzIChlLmcuIDMgPSAxMi4zNDUgbWlsZXMpLjwvcD5cclxuICAgICAgICA8aW5wdXRcclxuICAgICAgICAgIHR5cGU9XCJudW1iZXJcIlxyXG4gICAgICAgICAgbWluPXswfVxyXG4gICAgICAgICAgbWF4PXsxMH1cclxuICAgICAgICAgIHZhbHVlPXtjb25maWc/Lm1lYXN1cmVQcmVjaXNpb24gPz8gM31cclxuICAgICAgICAgIG9uQ2hhbmdlPXtoYW5kbGVQcmVjaXNpb25DaGFuZ2V9XHJcbiAgICAgICAgICBzdHlsZT17eyAuLi5pbnB1dFN0eWxlLCB3aWR0aDogJzgwcHgnIH19XHJcbiAgICAgICAgLz5cclxuICAgICAgPC9kaXY+XHJcbiAgICA8L2Rpdj5cclxuICApXHJcbn1cclxuXHJcbi8vIFN0eWxlc1xyXG5jb25zdCBmaWVsZEdyb3VwU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgbWFyZ2luQm90dG9tOiAnMTRweCdcclxufVxyXG5cclxuY29uc3QgbGFiZWxTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBkaXNwbGF5OiAnYmxvY2snLFxyXG4gIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgZm9udFdlaWdodDogNjAwLFxyXG4gIG1hcmdpbkJvdHRvbTogJzRweCcsXHJcbiAgY29sb3I6ICcjMDAwJ1xyXG59XHJcblxyXG5jb25zdCBkZXNjU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgZm9udFNpemU6ICcxMXB4JyxcclxuICBjb2xvcjogJyMwMDAnLFxyXG4gIG1hcmdpbjogJzAgMCA2cHggMCcsXHJcbiAgbGluZUhlaWdodDogJzEuNCcsXHJcbiAgb3BhY2l0eTogMC43NVxyXG59XHJcblxyXG5jb25zdCBpbnB1dFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIHdpZHRoOiAnMTAwJScsXHJcbiAgcGFkZGluZzogJzZweCA4cHgnLFxyXG4gIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICM5OTknLFxyXG4gIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgYm94U2l6aW5nOiAnYm9yZGVyLWJveCcsXHJcbiAgY29sb3I6ICcjMDAwJyxcclxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJ1xyXG59XHJcblxyXG5jb25zdCBsb2FkQnRuU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgbWFyZ2luVG9wOiAnNHB4JyxcclxuICBwYWRkaW5nOiAnNHB4IDEycHgnLFxyXG4gIGZvbnRTaXplOiAnMTJweCcsXHJcbiAgYm9yZGVyOiAnMXB4IHNvbGlkICM5OTknLFxyXG4gIGJvcmRlclJhZGl1czogJzNweCcsXHJcbiAgYmFja2dyb3VuZENvbG9yOiAnI2ZmZicsXHJcbiAgY29sb3I6ICcjMDAwJyxcclxuICBjdXJzb3I6ICdwb2ludGVyJ1xyXG59XHJcblxyXG5jb25zdCBldmVudExpc3RTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBtYXhIZWlnaHQ6ICczMDBweCcsXHJcbiAgb3ZlcmZsb3c6ICdhdXRvJyxcclxuICBib3JkZXI6ICcxcHggc29saWQgIzk5OScsXHJcbiAgYm9yZGVyUmFkaXVzOiAnNHB4JyxcclxuICBwYWRkaW5nOiAnNnB4JyxcclxuICBiYWNrZ3JvdW5kQ29sb3I6ICcjZmZmJyxcclxuICBjb2xvcjogJyMwMDAnXHJcbn1cclxuXHJcbmNvbnN0IGZpZWxkUGlja2VyU3R5bGU6IFJlYWN0LkNTU1Byb3BlcnRpZXMgPSB7XHJcbiAgbWFyZ2luTGVmdDogJzIwcHgnLFxyXG4gIG1hcmdpblRvcDogJzRweCcsXHJcbiAgcGFkZGluZzogJzRweCA4cHgnLFxyXG4gIGJhY2tncm91bmRDb2xvcjogJyNmMGYwZjAnLFxyXG4gIGJvcmRlcjogJzFweCBzb2xpZCAjY2NjJyxcclxuICBib3JkZXJSYWRpdXM6ICczcHgnLFxyXG4gIGNvbG9yOiAnIzAwMCdcclxufVxyXG5cclxuY29uc3QgZXJyb3JTdHlsZTogUmVhY3QuQ1NTUHJvcGVydGllcyA9IHtcclxuICBtYXJnaW5Ub3A6ICc0cHgnLFxyXG4gIGZvbnRTaXplOiAnMTFweCcsXHJcbiAgY29sb3I6ICcjZDgzMDIwJ1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTZXR0aW5nXHJcblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=