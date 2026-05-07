System.register(["jimu-core/emotion","jimu-core"], function(__WEBPACK_DYNAMIC_EXPORT__, __system_context__) {
	var __WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__ = {};
	var __WEBPACK_EXTERNAL_MODULE_jimu_core__ = {};
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE__emotion_react_jsx_runtime__, "__esModule", { value: true });
	Object.defineProperty(__WEBPACK_EXTERNAL_MODULE_jimu_core__, "__esModule", { value: true });
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
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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
/*!************************************************************************!*\
  !*** ./your-extensions/widgets/feature-counter/src/runtime/widget.tsx ***!
  \************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   __set_webpack_public_path__: () => (/* binding */ __set_webpack_public_path__),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/react/jsx-runtime */ "@emotion/react/jsx-runtime");
/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-core */ "jimu-core");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


const { useState, useCallback, useRef } = jimu_core__WEBPACK_IMPORTED_MODULE_1__.React;
const Widget = (props) => {
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshVersion, setRefreshVersion] = useState(0);
    const dsRef = useRef(null);
    // Query the feature count from the data source
    const queryCount = useCallback((ds) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        if (!ds)
            return;
        setLoading(true);
        setError(null);
        try {
            const result = yield ds.query({
                where: '1=1',
                returnGeometry: false,
                returnCountOnly: true
            });
            const featureCount = (_c = (_a = result === null || result === void 0 ? void 0 : result.count) !== null && _a !== void 0 ? _a : (_b = result === null || result === void 0 ? void 0 : result.records) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0;
            setCount(featureCount);
        }
        catch (e) {
            setError('Failed to query feature count.');
            setCount(null);
        }
        finally {
            setLoading(false);
        }
    }), []);
    // Called when the DataSourceComponent has created/loaded the data source
    const onDataSourceCreated = useCallback((ds) => {
        dsRef.current = ds;
        queryCount(ds);
    }, [queryCount]);
    // Refresh button handler — re-queries the stored data source
    const handleRefresh = useCallback(() => {
        if (dsRef.current) {
            queryCount(dsRef.current);
        }
        setRefreshVersion(v => v + 1);
    }, [queryCount]);
    // If no data source is configured, show a message
    const hasDataSource = props.useDataSources && props.useDataSources.length > 0;
    return ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { className: "jimu-widget p-3", style: containerStyle, children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("h5", { style: { margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }, children: "Feature Counter" }), !hasDataSource && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { style: { color: '#6e6e6e', fontSize: '13px' }, children: "Configure a data source in the widget settings." })), hasDataSource && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)(jimu_core__WEBPACK_IMPORTED_MODULE_1__.DataSourceComponent, { useDataSource: props.useDataSources[0], widgetId: props.id, onDataSourceCreated: onDataSourceCreated, forceRefreshVersion: refreshVersion })), hasDataSource && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { style: { textAlign: 'center' }, children: [loading && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { style: { fontSize: '13px', color: '#6e6e6e' }, children: "Loading..." }), error && (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("p", { style: { fontSize: '13px', color: '#d83020' }, children: error }), !loading && !error && count !== null && ((0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", { children: [(0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: countStyle, children: count.toLocaleString() }), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("div", { style: { fontSize: '12px', color: '#6e6e6e', marginBottom: '12px' }, children: "features" })] })), (0,_emotion_react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx)("button", { type: "button", onClick: handleRefresh, style: buttonStyle, children: "Refresh" })] }))] }));
};
const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box'
};
const countStyle = {
    fontSize: '36px',
    fontWeight: 700,
    color: '#0079c1',
    lineHeight: 1.2
};
const buttonStyle = {
    padding: '6px 16px',
    fontSize: '13px',
    color: '#fff',
    backgroundColor: '#0079c1',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0cy9mZWF0dXJlLWNvdW50ZXIvZGlzdC9ydW50aW1lL3dpZGdldC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVEOzs7Ozs7Ozs7OztBQ0FBLHdFOzs7Ozs7VUNBQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQzVCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7O1dDTkEsMkI7Ozs7Ozs7Ozs7QUNBQTs7O0tBR0s7QUFDTCxxQkFBdUIsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU87Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0p5QztBQUc1RixNQUFNLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyw0Q0FBSztBQUUvQyxNQUFNLE1BQU0sR0FBRyxDQUFDLEtBQStCLEVBQUUsRUFBRTtJQUNqRCxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBZ0IsSUFBSSxDQUFDO0lBQ3ZELE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQztJQUM3QyxNQUFNLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxHQUFHLFFBQVEsQ0FBZ0IsSUFBSSxDQUFDO0lBQ3ZELE1BQU0sQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3ZELE1BQU0sS0FBSyxHQUFHLE1BQU0s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LElBQUksSUFBSSxDQUN2QyxxRkFDRSx5RUFBSyxLQUFLLEVBQUUsVUFBVSxZQUFHLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBTyxFQUN0RCx5RUFBSyxLQUFLLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSx5QkFBZ0IsSUFDcEYsQ0FDUCxFQUNELDRFQUNFLElBQUksRUFBQyxRQUFRLEVBQ2IsT0FBTyxFQUFFLGFBQWEsRUFDdEIsS0FBSyxFQUFFLFdBQVcsd0JBR1gsSUFDTCxDQUNQLElBQ0csQ0FDUDtBQUNILENBQUM7QUFFRCxNQUFNLGNBQWMsR0FBd0I7SUFDMUMsT0FBTyxFQUFFLE1BQU07SUFDZixhQUFhLEVBQUUsUUFBUTtJQUN2QixNQUFNLEVBQUUsTUFBTTtJQUNkLFNBQVMsRUFBRSxZQUFZO0NBQ3hCO0FBRUQsTUFBTSxVQUFVLEdBQXdCO0lBQ3RDLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLFVBQVUsRUFBRSxHQUFHO0lBQ2YsS0FBSyxFQUFFLFNBQVM7SUFDaEIsVUFBVSxFQUFFLEdBQUc7Q0FDaEI7QUFFRCxNQUFNLFdBQVcsR0FBd0I7SUFDdkMsT0FBTyxFQUFFLFVBQVU7SUFDbkIsUUFBUSxFQUFFLE1BQU07SUFDaEIsS0FBSyxFQUFFLE1BQU07SUFDYixlQUFlLEVBQUUsU0FBUztJQUMxQixNQUFNLEVBQUUsTUFBTTtJQUNkLFlBQVksRUFBRSxLQUFLO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0NBQ2xCO0FBRUQsaUVBQWUsTUFBTTtBQUViLFNBQVMsMkJBQTJCLENBQUMsR0FBRyxJQUFJLHFCQUF1QixHQUFHLEdBQUcsRUFBQyxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vZXhiLWNsaWVudC9leHRlcm5hbCBzeXN0ZW0gXCJqaW11LWNvcmVcIiIsIndlYnBhY2s6Ly9leGItY2xpZW50L2V4dGVybmFsIHN5c3RlbSBcImppbXUtY29yZS9lbW90aW9uXCIiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9leGItY2xpZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2V4Yi1jbGllbnQvd2VicGFjay9ydW50aW1lL3B1YmxpY1BhdGgiLCJ3ZWJwYWNrOi8vZXhiLWNsaWVudC8uL2ppbXUtY29yZS9saWIvc2V0LXB1YmxpYy1wYXRoLnRzIiwid2VicGFjazovL2V4Yi1jbGllbnQvLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9mZWF0dXJlLWNvdW50ZXIvc3JjL3J1bnRpbWUvd2lkZ2V0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187IiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX19lbW90aW9uX3JlYWN0X2pzeF9ydW50aW1lX187IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDaGVjayBpZiBtb2R1bGUgZXhpc3RzIChkZXZlbG9wbWVudCBvbmx5KVxuXHRpZiAoX193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdHZhciBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7IiwiLyoqXHJcbiAqIFdlYnBhY2sgd2lsbCByZXBsYWNlIF9fd2VicGFja19wdWJsaWNfcGF0aF9fIHdpdGggX193ZWJwYWNrX3JlcXVpcmVfXy5wIHRvIHNldCB0aGUgcHVibGljIHBhdGggZHluYW1pY2FsbHkuXHJcbiAqIFRoZSByZWFzb24gd2h5IHdlIGNhbid0IHNldCB0aGUgcHVibGljUGF0aCBpbiB3ZWJwYWNrIGNvbmZpZyBpczogd2UgY2hhbmdlIHRoZSBwdWJsaWNQYXRoIHdoZW4gZG93bmxvYWQuXHJcbiAqICovXHJcbl9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gd2luZG93LmppbXVDb25maWcuYmFzZVVybFxyXG4iLCJpbXBvcnQgeyBSZWFjdCwgdHlwZSBBbGxXaWRnZXRQcm9wcywgRGF0YVNvdXJjZUNvbXBvbmVudCwgdHlwZSBEYXRhU291cmNlIH0gZnJvbSAnamltdS1jb3JlJ1xyXG5pbXBvcnQgdHlwZSB7IElNQ29uZmlnIH0gZnJvbSAnLi4vY29uZmlnJ1xyXG5cclxuY29uc3QgeyB1c2VTdGF0ZSwgdXNlQ2FsbGJhY2ssIHVzZVJlZiB9ID0gUmVhY3RcclxuXHJcbmNvbnN0IFdpZGdldCA9IChwcm9wczogQWxsV2lkZ2V0UHJvcHM8SU1Db25maWc+KSA9PiB7XHJcbiAgY29uc3QgW2NvdW50LCBzZXRDb3VudF0gPSB1c2VTdGF0ZTxudW1iZXIgfCBudWxsPihudWxsKVxyXG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKGZhbHNlKVxyXG4gIGNvbnN0IFtlcnJvciwgc2V0RXJyb3JdID0gdXNlU3RhdGU8c3RyaW5nIHwgbnVsbD4obnVsbClcclxuICBjb25zdCBbcmVmcmVzaFZlcnNpb24sIHNldFJlZnJlc2hWZXJzaW9uXSA9IHVzZVN0YXRlKDApXHJcbiAgY29uc3QgZHNSZWYgPSB1c2VSZWY8RGF0YVNvdXJjZT4obnVsbClcclxuXHJcbiAgLy8gUXVlcnkgdGhlIGZlYXR1cmUgY291bnQgZnJvbSB0aGUgZGF0YSBzb3VyY2VcclxuICBjb25zdCBxdWVyeUNvdW50ID0gdXNlQ2FsbGJhY2soYXN5bmMgKGRzOiBEYXRhU291cmNlKSA9PiB7XHJcbiAgICBpZiAoIWRzKSByZXR1cm5cclxuICAgIHNldExvYWRpbmcodHJ1ZSlcclxuICAgIHNldEVycm9yKG51bGwpXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCAoZHMgYXMgYW55KS5xdWVyeSh7XHJcbiAgICAgICAgd2hlcmU6ICcxPTEnLFxyXG4gICAgICAgIHJldHVybkdlb21ldHJ5OiBmYWxzZSxcclxuICAgICAgICByZXR1cm5Db3VudE9ubHk6IHRydWVcclxuICAgICAgfSlcclxuICAgICAgY29uc3QgZmVhdHVyZUNvdW50ID0gcmVzdWx0Py5jb3VudCA/PyByZXN1bHQ/LnJlY29yZHM/Lmxlbmd0aCA/PyAwXHJcbiAgICAgIHNldENvdW50KGZlYXR1cmVDb3VudClcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgc2V0RXJyb3IoJ0ZhaWxlZCB0byBxdWVyeSBmZWF0dXJlIGNvdW50LicpXHJcbiAgICAgIHNldENvdW50KG51bGwpXHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBzZXRMb2FkaW5nKGZhbHNlKVxyXG4gICAgfVxyXG4gIH0sIFtdKVxyXG5cclxuICAvLyBDYWxsZWQgd2hlbiB0aGUgRGF0YVNvdXJjZUNvbXBvbmVudCBoYXMgY3JlYXRlZC9sb2FkZWQgdGhlIGRhdGEgc291cmNlXHJcbiAgY29uc3Qgb25EYXRhU291cmNlQ3JlYXRlZCA9IHVzZUNhbGxiYWNrKChkczogRGF0YVNvdXJjZSkgPT4ge1xyXG4gICAgZHNSZWYuY3VycmVudCA9IGRzXHJcbiAgICBxdWVyeUNvdW50KGRzKVxyXG4gIH0sIFtxdWVyeUNvdW50XSlcclxuXHJcbiAgLy8gUmVmcmVzaCBidXR0b24gaGFuZGxlciDigJQgcmUtcXVlcmllcyB0aGUgc3RvcmVkIGRhdGEgc291cmNlXHJcbiAgY29uc3QgaGFuZGxlUmVmcmVzaCA9IHVzZUNhbGxiYWNrKCgpID0+IHtcclxuICAgIGlmIChkc1JlZi5jdXJyZW50KSB7XHJcbiAgICAgIHF1ZXJ5Q291bnQoZHNSZWYuY3VycmVudClcclxuICAgIH1cclxuICAgIHNldFJlZnJlc2hWZXJzaW9uKHYgPT4gdiArIDEpXHJcbiAgfSwgW3F1ZXJ5Q291bnRdKVxyXG5cclxuICAvLyBJZiBubyBkYXRhIHNvdXJjZSBpcyBjb25maWd1cmVkLCBzaG93IGEgbWVzc2FnZVxyXG4gIGNvbnN0IGhhc0RhdGFTb3VyY2UgPSBwcm9wcy51c2VEYXRhU291cmNlcyAmJiBwcm9wcy51c2VEYXRhU291cmNlcy5sZW5ndGggPiAwXHJcblxyXG4gIHJldHVybiAoXHJcbiAgICA8ZGl2IGNsYXNzTmFtZT1cImppbXUtd2lkZ2V0IHAtM1wiIHN0eWxlPXtjb250YWluZXJTdHlsZX0+XHJcbiAgICAgIDxoNSBzdHlsZT17eyBtYXJnaW46ICcwIDAgMTJweCAwJywgZm9udFNpemU6ICcxNHB4JywgZm9udFdlaWdodDogNjAwIH19PkZlYXR1cmUgQ291bnRlcjwvaDU+XHJcblxyXG4gICAgICB7IWhhc0RhdGFTb3VyY2UgJiYgKFxyXG4gICAgICAgIDxwIHN0eWxlPXt7IGNvbG9yOiAnIzZlNmU2ZScsIGZvbnRTaXplOiAnMTNweCcgfX0+XHJcbiAgICAgICAgICBDb25maWd1cmUgYSBkYXRhIHNvdXJjZSBpbiB0aGUgd2lkZ2V0IHNldHRpbmdzLlxyXG4gICAgICAgIDwvcD5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHtoYXNEYXRhU291cmNlICYmIChcclxuICAgICAgICA8RGF0YVNvdXJjZUNvbXBvbmVudFxyXG4gICAgICAgICAgdXNlRGF0YVNvdXJjZT17cHJvcHMudXNlRGF0YVNvdXJjZXNbMF19XHJcbiAgICAgICAgICB3aWRnZXRJZD17cHJvcHMuaWR9XHJcbiAgICAgICAgICBvbkRhdGFTb3VyY2VDcmVhdGVkPXtvbkRhdGFTb3VyY2VDcmVhdGVkfVxyXG4gICAgICAgICAgZm9yY2VSZWZyZXNoVmVyc2lvbj17cmVmcmVzaFZlcnNpb259XHJcbiAgICAgICAgLz5cclxuICAgICAgKX1cclxuXHJcbiAgICAgIHtoYXNEYXRhU291cmNlICYmIChcclxuICAgICAgICA8ZGl2IHN0eWxlPXt7IHRleHRBbGlnbjogJ2NlbnRlcicgfX0+XHJcbiAgICAgICAgICB7bG9hZGluZyAmJiA8cCBzdHlsZT17eyBmb250U2l6ZTogJzEzcHgnLCBjb2xvcjogJyM2ZTZlNmUnIH19PkxvYWRpbmcuLi48L3A+fVxyXG4gICAgICAgICAge2Vycm9yICYmIDxwIHN0eWxlPXt7IGZvbnRTaXplOiAnMTNweCcsIGNvbG9yOiAnI2Q4MzAyMCcgfX0+e2Vycm9yfTwvcD59XHJcbiAgICAgICAgICB7IWxvYWRpbmcgJiYgIWVycm9yICYmIGNvdW50ICE9PSBudWxsICYmIChcclxuICAgICAgICAgICAgPGRpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXtjb3VudFN0eWxlfT57Y291bnQudG9Mb2NhbGVTdHJpbmcoKX08L2Rpdj5cclxuICAgICAgICAgICAgICA8ZGl2IHN0eWxlPXt7IGZvbnRTaXplOiAnMTJweCcsIGNvbG9yOiAnIzZlNmU2ZScsIG1hcmdpbkJvdHRvbTogJzEycHgnIH19PmZlYXR1cmVzPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgKX1cclxuICAgICAgICAgIDxidXR0b25cclxuICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXHJcbiAgICAgICAgICAgIG9uQ2xpY2s9e2hhbmRsZVJlZnJlc2h9XHJcbiAgICAgICAgICAgIHN0eWxlPXtidXR0b25TdHlsZX1cclxuICAgICAgICAgID5cclxuICAgICAgICAgICAgUmVmcmVzaFxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgPC9kaXY+XHJcbiAgICAgICl9XHJcbiAgICA8L2Rpdj5cclxuICApXHJcbn1cclxuXHJcbmNvbnN0IGNvbnRhaW5lclN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIGRpc3BsYXk6ICdmbGV4JyxcclxuICBmbGV4RGlyZWN0aW9uOiAnY29sdW1uJyxcclxuICBoZWlnaHQ6ICcxMDAlJyxcclxuICBib3hTaXppbmc6ICdib3JkZXItYm94J1xyXG59XHJcblxyXG5jb25zdCBjb3VudFN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIGZvbnRTaXplOiAnMzZweCcsXHJcbiAgZm9udFdlaWdodDogNzAwLFxyXG4gIGNvbG9yOiAnIzAwNzljMScsXHJcbiAgbGluZUhlaWdodDogMS4yXHJcbn1cclxuXHJcbmNvbnN0IGJ1dHRvblN0eWxlOiBSZWFjdC5DU1NQcm9wZXJ0aWVzID0ge1xyXG4gIHBhZGRpbmc6ICc2cHggMTZweCcsXHJcbiAgZm9udFNpemU6ICcxM3B4JyxcclxuICBjb2xvcjogJyNmZmYnLFxyXG4gIGJhY2tncm91bmRDb2xvcjogJyMwMDc5YzEnLFxyXG4gIGJvcmRlcjogJ25vbmUnLFxyXG4gIGJvcmRlclJhZGl1czogJzRweCcsXHJcbiAgY3Vyc29yOiAncG9pbnRlcidcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgV2lkZ2V0XHJcblxuIGV4cG9ydCBmdW5jdGlvbiBfX3NldF93ZWJwYWNrX3B1YmxpY19wYXRoX18odXJsKSB7IF9fd2VicGFja19wdWJsaWNfcGF0aF9fID0gdXJsIH0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=