(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["Echo"] = factory();
	else
		root["Echo"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	var _slice = Array.prototype.slice;
	/**
	 * @name echo
	 * @license echo.js may be freely distributed under the MIT license.
	 * @copyright (c) 2015 Alianza Inc.
	 * @author Kent C. Dodds <kent@doddsfamily.us>
	 */
	
	// variable assignment
	var isIE = (function () {
	  var ua = window.navigator.userAgent;
	  return ua.indexOf("MSIE ") > 0 || ua.indexOf("Trident/") > 0;
	})();
	
	var COLORS = {
	  green: "color:green",
	  purple: "color:rebeccapurple",
	  blue: "color:cornflowerblue",
	  red: "color:crimson",
	  gray: "color:#919191"
	};
	var LOG_FNS = ["log", "info", "debug", "warn", "error"];
	
	var is = {};
	["undefined", "string", { name: "fn", type: "function" }, "boolean", "number"].forEach(function (name) {
	  is[name.name || name] = function (val) {
	    return typeof val === (name.type || name);
	  };
	});
	
	
	var preconfigState = getPreconfiguredLoggingState();
	
	var testMode = preconfigState.testMode;
	var currentRank = rank(preconfigState.rank || 5);
	var globallyEnabled = is.boolean(preconfigState.enabled) ? preconfigState.enabled : true;
	var echos = {};
	var Echo = { create: create, get: get, remove: remove, rank: rank, enabled: enabled, testMode: testMode };
	
	function create(name, _ref) {
	  var rank = _ref.rank;
	  var defaultColor = _ref.defaultColor;
	  var colors = _ref.colors;
	  var enabled = _ref.enabled;
	  var logger = _ref.logger;
	  var logFns = _ref.logFns;
	  // note, 6to5 doesn't support destructuring assignment default values
	  // once that happens, this will look prettier :-)
	  var presetState = is.boolean(preconfigState.all) ? preconfigState.all : preconfigState[name];
	  enabled = is.boolean(presetState) ? presetState : is.boolean(enabled) ? enabled : true;
	  rank = !is.undefined(rank) ? rank : 5;
	  colors = !is.undefined(colors) ? colors : COLORS;
	  logger = !is.undefined(logger) ? logger : console;
	  logFns = !is.undefined(logFns) ? logFns : LOG_FNS;
	
	  checkArgs(name, rank, defaultColor, colors, logger, logFns);
	
	  // variable initialization
	  var colorKeys = Object.keys(colors);
	
	  // create echo
	  var echo = wrapLog("log");
	
	  // add functions
	  echo.rank = echoRankGetterSetter;
	  echo.enabled = echoEnabledGetterSetter;
	
	  // add log functions to echo
	  logFns.forEach(function (fnName) {
	    return echo[fnName] = wrapLog(fnName);
	  });
	
	  // make developers happy
	  echo.displayName = "echo: \"" + name + "\" abstraction on console";
	  echo.rank.displayName = "echo.rank: getter/setter for the current level of logging (high is more)";
	  logIt.displayName = "echo log wrapper that checks whether the echo is enabled and if its rank is high enough compared to Echo.rank()";
	  checkArgs.displayName = "Echo.create arg checker that ensures all arguments are correct and throws errors if not";
	
	  // add echo to echos
	  echos[name] = echo;
	
	  // return
	  return echo;
	
	
	  // function declarations
	  function wrapLog(fnName) {
	    function echoLog() {
	      logIt.apply(null, [fnName, colors[defaultColor]].concat(_slice.call(arguments)));
	    }
	    echoLog.displayName = "console abstraction for " + name + ":" + fnName;
	    addALittleColor(fnName, echoLog);
	    return echoLog;
	  }
	
	  function addALittleColor(fnName, fn) {
	    colorKeys.forEach(function (colorName) {
	      fn[colorName] = function echoColoredLog() {
	        logIt.apply(null, [fnName, colors[colorName]].concat(_slice.call(arguments)));
	      };
	      fn[colorName].displayName = "" + colorName + " colored console abstraction for " + name + ":" + fnName;
	    });
	  }
	
	  function logIt(fnName, color) {
	    var args = _slice.call(arguments, 2);
	
	    if (globallyEnabled && enabled && highEnoughRank(rank)) {
	      args = addColor(args, color);
	      return logger[fnName].apply(logger, args);
	    }
	  }
	
	  function echoRankGetterSetter(newRank) {
	    return rank = setRank(rank, newRank);
	  }
	
	  function echoEnabledGetterSetter(newState) {
	    return enabled = setEnabled(enabled, newState);
	  }
	
	  function checkArgs() {
	    if (is.undefined(name)) {
	      throw new Error("echo name must be defined");
	    }
	    if (!Echo.testMode && !is.undefined(echos[name])) {
	      throw new Error("echo by the name of " + name + " already exists. Cannot create another of the same name.");
	    }
	    checkRank(rank);
	    if (!is.undefined(defaultColor) && !is.string(colors[defaultColor])) {
	      throw new Error("echo defaultColor (value: " + defaultColor + ") must be a string specified in colors (" + Object.keys(colors) + ")");
	    }
	    if (!Array.isArray(logFns)) {
	      throw new Error("logFns must be an array of strings");
	    }
	    var missingSomething = logFns.some(function (logFn) {
	      return !is.string(logFn) || !is.fn(logger[logFn]);
	    });
	    if (missingSomething) {
	      throw new Error("echo's logger (value: " + logger + ") must implement these functions: " + logFns.join(", ") + " (which must all be function names as strings)");
	    }
	  }
	}
	
	
	function get(name) {
	  if (is.undefined(name)) {
	    return echos;
	  } else {
	    return echos[name];
	  }
	}
	
	function remove(name) {
	  if (is.undefined(name)) {
	    echos = {};
	  } else {
	    delete echos[name];
	  }
	}
	
	function enabled(newState) {
	  return globallyEnabled = setEnabled(globallyEnabled, newState);
	}
	
	function rank(newRank) {
	  return currentRank = setRank(currentRank, newRank);
	}
	
	// make developers happy
	create.displayName = "Echo.create: Makes a new instance of Echo";
	get.displayName = "Get an echo logger by name";
	remove.displayName = "Remove an echo logger";
	rank.displayName = "Set the global Echo rank. Must be a number 0-5 inclusive. 0 is less logs, 5 is more.";
	
	
	// Main export
	module.exports = Echo;
	
	
	
	
	// functions declarations
	function addColor(args, color) {
	  if (!isIE && color) {
	    args.splice(1, 0, color);
	    args[0] = "%c" + args[0];
	  }
	  return args;
	}
	
	function highEnoughRank(rank) {
	  return currentRank >= rank;
	}
	
	function setRank(originalRank, newRank) {
	  if (!is.undefined(newRank)) {
	    checkRank(newRank);
	    originalRank = newRank;
	  }
	  return originalRank;
	}
	
	function setEnabled(originalState, newState) {
	  if (!is.undefined(newState)) {
	    if (!is.boolean(newState)) {
	      throw new Error("echo.enabled must pass nothing or a boolean. \"" + newState + "\" was passed");
	    }
	    originalState = newState;
	  }
	  return originalState;
	}
	
	function checkRank(rank) {
	  if (!is.number(rank) || rank < 0 || rank > 5) {
	    throw new Error("echo rank (value: " + rank + ") must be numbers between 0 and 5 (inclusive). 0 is less logs, 5 is more.");
	  }
	}
	
	function getPreconfiguredLoggingState() {
	  var enableLogVal = getParameterByName("echoEnableLog");
	  var disableLogVal = getParameterByName("echoDisableLog");
	  var globallyEnabled = getParameterByName("echoEnabled");
	  var all = getParameterByName("echoAll");
	  var rank = getParameterByName("echoRank");
	  var enableQueryParamLogs = is.string(enableLogVal) ? enableLogVal.split(",") : [];
	  var disableQueryParamLogs = is.string(disableLogVal) ? disableLogVal.split(",") : [];
	  var state = window.echoLogging || {};
	  all = state.testMode === true ? false : all;
	  var doAll = is.boolean(all);
	  state.all = doAll ? state.all : all;
	  state.enabled = doAll ? state.all : is.boolean(globallyEnabled) ? state.enabled : globallyEnabled;
	  state.rank = rank;
	
	  enableQueryParamLogs.forEach(function (log) {
	    if (log) {
	      state[log] = doAll ? state.all : true;
	    }
	  });
	
	  disableQueryParamLogs.forEach(function (log) {
	    if (log) {
	      state[log] = doAll ? state.all : false;
	    }
	  });
	
	  return state;
	}
	
	function getParameterByName(name) {
	  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)", "i");
	  var results = regex.exec(location.search || location.hash);
	  if (results) {
	    var val = decodeURIComponent(results[1].replace(/\+/g, " "));
	    if (val === "true") {
	      return true;
	    } else if (val === "false") {
	      return false;
	    } else if (isNumeric(val)) {
	      return parseFloat(val);
	    } else {
	      return val;
	    }
	  } else {
	    return "";
	  }
	}
	
	function isNumeric(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}

/***/ }
/******/ ])
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCAxNTMwZGU1ZGI0ZDA2MTA0ZjBlZiIsIndlYnBhY2s6Ly8vLi9zcmMvZWNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQSxLQUFJLElBQUksR0FBRyxDQUFDLFlBQU07QUFDaEIsT0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDcEMsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RCxHQUFHLENBQUM7O0FBRUwsS0FBTSxNQUFNLEdBQUc7QUFDYixRQUFLLEVBQUUsYUFBYTtBQUNwQixTQUFNLEVBQUUscUJBQXFCO0FBQzdCLE9BQUksRUFBRSxzQkFBc0I7QUFDNUIsTUFBRyxFQUFFLGVBQWU7QUFDcEIsT0FBSSxFQUFFLGVBQWU7RUFDdEIsQ0FBQztBQUNGLEtBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxLQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsRUFBQyxJ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LEdBQUcsQ0FBQztNQUNaO0lBQ0YsTUFBTTtBQUNMLFlBQU8sRUFBRSxDQUFDO0lBQ1g7RUFDRjs7QUFFRCxVQUFTLFNBQVMsQ0FBQyxDQUFDLEVBQUU7QUFDcEIsVUFBTyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIkVjaG9cIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiRWNob1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDE1MzBkZTVkYjRkMDYxMDRmMGVmXG4gKiovIiwiLyoqXG4gKiBAbmFtZSBlY2hvXG4gKiBAbGljZW5zZSBlY2hvLmpzIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogQGNvcHlyaWdodCAoYykgMjAxNSBBbGlhbnphIEluYy5cbiAqIEBhdXRob3IgS2VudCBDLiBEb2RkcyA8a2VudEBkb2Rkc2ZhbWlseS51cz5cbiAqL1xuXG4vLyB2YXJpYWJsZSBhc3NpZ25tZW50XG52YXIgaXNJRSA9ICgoKSA9PiB7XG4gIHZhciB1YSA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50O1xuICByZXR1cm4gdWEuaW5kZXhPZignTVNJRSAnKSA+IDAgfHwgdWEuaW5kZXhPZignVHJpZGVudC8nKSA+IDA7XG59KSgpO1xuXG5jb25zdCBDT0xPUlMgPSB7XG4gIGdyZWVuOiAnY29sb3I6Z3JlZW4nLFxuICBwdXJwbGU6ICdjb2xvcjpyZWJlY2NhcHVycGxlJyxcbiAgYmx1ZTogJ2NvbG9yOmNvcm5mbG93ZXJibHVlJyxcbiAgcmVkOiAnY29sb3I6Y3JpbXNvbicsXG4gIGdyYXk6ICdjb2xvcjojOTE5MTkxJ1xufTtcbmNvbnN0IExPR19GTlMgPSBbJ2xvZycsICdpbmZvJywgJ2RlYnVnJywgJ3dhcm4nLCAnZXJyb3InXTtcblxudmFyIGlzID0ge307XG5bJ3VuZGVmaW5lZCcsICdzdHJpbmcnLCB7bmFtZTogJ2ZuJywgdHlwZTogJ2Z1bmN0aW9uJ30sICdib29sZWFuJywgJ251bWJlciddLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICBpc1tuYW1lLm5hbWUgfHwgbmFtZV0gPSAodmFsKSA9PiB0eXBlb2YgdmFsID09PSAobmFtZS50eXBlIHx8IG5hbWUpO1xufSk7XG5cblxudmFyIHByZWNvbmZpZ1N0YXRlID0gZ2V0UHJlY29uZmlndXJlZExvZ2dpbmdTdGF0ZSgpO1xuXG52YXIgdGVzdE1vZGUgPSBwcmVjb25maWdTdGF0ZS50ZXN0TW9kZTtcbnZhciBjdXJyZW50UmFuayA9IHJhbmsocHJlY29uZmlnU3RhdGUucmFuayB8fCA1KTtcbnZhciBnbG9iYWxseUVuYWJsZWQgPSBpcy5ib29sZWFuKHByZWNvbmZpZ1N0YXRlLmVuYWJsZWQpID8gcHJlY29uZmlnU3RhdGUuZW5hYmxlZCA6IHRydWU7XG52YXIgZWNob3MgPSB7fTtcbnZhciBFY2hvID0geyBjcmVhdGUsIGdldCwgcmVtb3ZlLCByYW5rLCBlbmFibGVkLCB0ZXN0TW9kZSB9O1xuXG5mdW5jdGlvbiBjcmVhdGUobmFtZSwge3JhbmssIGRlZmF1bHRDb2xvciwgY29sb3JzLCBlbmFibGVkLCBsb2dnZXIsIGxvZ0Zuc30pIHtcbiAgLy8gbm90ZSwgNnRvNSBkb2Vzbid0IHN1cHBvcnQgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50IGRlZmF1bHQgdmFsdWVzXG4gIC8vIG9uY2UgdGhhdCBoYXBwZW5zLCB0aGlzIHdpbGwgbG9vayBwcmV0dGllciA6LSlcbiAgdmFyIHByZXNldFN0YXRlID0gaXMuYm9vbGVhbihwcmVjb25maWdTdGF0ZS5hbGwpID8gcHJlY29uZmlnU3RhdGUuYWxsIDogcHJlY29uZmlnU3RhdGVbbmFtZV07XG4gIGVuYWJsZWQgPSBpcy5ib29sZWFuKHByZXNldFN0YXRlKSA/IHByZXNldFN0YXRlIDogaXMuYm9vbGVhbihlbmFibGVkKSA/IGVuYWJsZWQgOiB0cnVlO1xuICByYW5rID0gIWlzLnVuZGVmaW5lZChyYW5rKSA/IHJhbmsgOiA1O1xuICBjb2xvcnMgPSAhaXMudW5kZWZpbmVkKGNvbG9ycykgPyBjb2xvcnMgOiBDT0xPUlM7XG4gIGxvZ2dlciA9ICFpcy51bmRlZmluZWQobG9nZ2VyKSA/IGxvZ2dlciA6IGNvbnNvbGU7XG4gIGxvZ0ZucyA9ICFpcy51bmRlZmluZWQobG9nRm5zKSA/IGxvZ0ZucyA6IExPR19GTlM7XG5cbiAgY2hlY2tBcmdzKG5hbWUsIHJhbmssIGRlZmF1bHRDb2xvciwgY29sb3JzLCBsb2dnZXIsIGxvZ0Zucyk7XG5cbiAgLy8gdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cbiAgdmFyIGNvbG9yS2V5cyA9IE9iamVjdC5rZXlzKGNvbG9ycyk7XG5cbiAgLy8gY3JlYXRlIGVjaG9cbiAgdmFyIGVjaG8gPSB3cmFwTG9nKCdsb2cnKTtcblxuICAvLyBhZGQgZnVuY3Rpb25zXG4gIGVjaG8ucmFuayA9IGVjaG9SYW5rR2V0dGVyU2V0dGVyO1xuICBlY2hvLmVuYWJsZWQgPSBlY2hvRW5hYmxlZEdldHRlclNldHRlcjtcblxuICAvLyBhZGQgbG9nIGZ1bmN0aW9ucyB0byBlY2hvXG4gIGxvZ0Zucy5mb3JFYWNoKGZuTmFtZSA9PiBlY2hvW2ZuTmFtZV0gPSB3cmFwTG9nKGZuTmFtZSkpO1xuXG4gIC8vIG1ha2UgZGV2ZWxvcGVycyBoYXBweVxuICBlY2hvLmRpc3BsYXlOYW1lID0gYGVjaG86IFwiJHtuYW1lfVwiIGFic3RyYWN0aW9uIG9uIGNvbnNvbGVgO1xuICBlY2hvLnJhbmsuZGlzcGxheU5hbWUgPSAnZWNoby5yYW5rOiBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgY3VycmVudCBsZXZlbCBvZiBsb2dnaW5nIChoaWdoIGlzIG1vcmUpJztcbiAgbG9nSXQuZGlzcGxheU5hbWUgPSAnZWNobyBsb2cgd3JhcHBlciB0aGF0IGNoZWNrcyB3aGV0aGVyIHRoZSBlY2hvIGlzIGVuYWJsZWQgYW5kIGlmIGl0cyByYW5rIGlzIGhpZ2ggZW5vdWdoIGNvbXBhcmVkIHRvIEVjaG8ucmFuaygpJztcbiAgY2hlY2tBcmdzLmRpc3BsYXlOYW1lID0gJ0VjaG8uY3JlYXRlIGFyZyBjaGVja2VyIHRoYXQgZW5zdXJlcyBhbGwgYXJndW1lbnRzIGFyZSBjb3JyZWN0IGFuZCB0aHJvd3MgZXJyb3JzIGlmIG5vdCc7XG5cbiAgLy8gYWRkIGVjaG8gdG8gZWNob3NcbiAgZWNob3NbbmFtZV0gPSBlY2hvO1xuXG4gIC8vIHJldHVyblxuICByZXR1cm4gZWNobztcblxuXG4gIC8vIGZ1bmN0aW9uIGRlY2xhcmF0aW9uc1xuICBmdW5jdGlvbiB3cmFwTG9nKGZuTmFtZSkge1xuICAgIGZ1bmN0aW9uIGVjaG9Mb2coKSB7XG4gICAgICBsb2dJdCguLi5bZm5OYW1lLCBjb2xvcnNbZGVmYXVsdENvbG9yXSwgLi4uYXJndW1lbnRzXSk7XG4gICAgfVxuICAgIGVjaG9Mb2cuZGlzcGxheU5hbWUgPSBgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIGFkZEFMaXR0bGVDb2xvcihmbk5hbWUsIGVjaG9Mb2cpO1xuICAgIHJldHVybiBlY2hvTG9nO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQUxpdHRsZUNvbG9yKGZuTmFtZSwgZm4pIHtcbiAgICBjb2xvcktleXMuZm9yRWFjaChmdW5jdGlvbihjb2xvck5hbWUpIHtcbiAgICAgIGZuW2NvbG9yTmFtZV0gPSBmdW5jdGlvbiBlY2hvQ29sb3JlZExvZygpIHtcbiAgICAgICAgbG9nSXQoLi4uW2ZuTmFtZSwgY29sb3JzW2NvbG9yTmFtZV0sIC4uLmFyZ3VtZW50c10pO1xuICAgICAgfTtcbiAgICAgIGZuW2NvbG9yTmFtZV0uZGlzcGxheU5hbWUgPSBgJHtjb2xvck5hbWV9IGNvbG9yZWQgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nSXQoZm5OYW1lLCBjb2xvciwgLi4uYXJncykge1xuICAgIGlmIChnbG9iYWxseUVuYWJsZWQgJiYgZW5hYmxlZCAmJiBoaWdoRW5vdWdoUmFuayhyYW5rKSkge1xuICAgICAgYXJncyA9IGFkZENvbG9yKGFyZ3MsIGNvbG9yKTtcbiAgICAgIHJldHVybiBsb2dnZXJbZm5OYW1lXS5hcHBseShsb2dnZXIsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVjaG9SYW5rR2V0dGVyU2V0dGVyKG5ld1JhbmspIHtcbiAgICByZXR1cm4gcmFuayA9IHNldFJhbmsocmFuaywgbmV3UmFuayk7XG4gIH1cblxuICBmdW5jdGlvbiBlY2hvRW5hYmxlZEdldHRlclNldHRlcihuZXdTdGF0ZSkge1xuICAgIHJldHVybiBlbmFibGVkID0gc2V0RW5hYmxlZChlbmFibGVkLCBuZXdTdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FyZ3MoKSB7XG4gICAgaWYgKGlzLnVuZGVmaW5lZChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdlY2hvIG5hbWUgbXVzdCBiZSBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmICghRWNoby50ZXN0TW9kZSAmJiAhaXMudW5kZWZpbmVkKGVjaG9zW25hbWVdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGJ5IHRoZSBuYW1lIG9mICR7bmFtZX0gYWxyZWFkeSBleGlzdHMuIENhbm5vdCBjcmVhdGUgYW5vdGhlciBvZiB0aGUgc2FtZSBuYW1lLmApO1xuICAgIH1cbiAgICBjaGVja1JhbmsocmFuayk7XG4gICAgaWYgKCFpcy51bmRlZmluZWQoZGVmYXVsdENvbG9yKSAmJiAhaXMuc3RyaW5nKGNvbG9yc1tkZWZhdWx0Q29sb3JdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGRlZmF1bHRDb2xvciAodmFsdWU6ICR7ZGVmYXVsdENvbG9yfSkgbXVzdCBiZSBhIHN0cmluZyBzcGVjaWZpZWQgaW4gY29sb3JzICgke09iamVjdC5rZXlzKGNvbG9ycyl9KWApO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobG9nRm5zKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2dGbnMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHZhciBtaXNzaW5nU29tZXRoaW5nID0gbG9nRm5zLnNvbWUoZnVuY3Rpb24obG9nRm4pIHtcbiAgICAgIHJldHVybiAhaXMuc3RyaW5nKGxvZ0ZuKSB8fCAhaXMuZm4obG9nZ2VyW2xvZ0ZuXSk7XG4gICAgfSk7XG4gICAgaWYgKG1pc3NpbmdTb21ldGhpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobydzIGxvZ2dlciAodmFsdWU6ICR7bG9nZ2VyfSkgbXVzdCBpbXBsZW1lbnQgdGhlc2UgZnVuY3Rpb25zOiAke2xvZ0Zucy5qb2luKCcsICcpfSAod2hpY2ggbXVzdCBhbGwgYmUgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncylgKTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBnZXQobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgcmV0dXJuIGVjaG9zO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlY2hvc1tuYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgZWNob3MgPSB7fTtcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgZWNob3NbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5hYmxlZChuZXdTdGF0ZSkge1xuICByZXR1cm4gZ2xvYmFsbHlFbmFibGVkID0gc2V0RW5hYmxlZChnbG9iYWxseUVuYWJsZWQsIG5ld1N0YXRlKTtcbn1cblxuZnVuY3Rpb24gcmFuayhuZXdSYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA9IHNldFJhbmsoY3VycmVudFJhbmssIG5ld1JhbmspO1xufVxuXG4vLyBtYWtlIGRldmVsb3BlcnMgaGFwcHlcbmNyZWF0ZS5kaXNwbGF5TmFtZSA9ICdFY2hvLmNyZWF0ZTogTWFrZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRWNobyc7XG5nZXQuZGlzcGxheU5hbWUgPSAnR2V0IGFuIGVjaG8gbG9nZ2VyIGJ5IG5hbWUnO1xucmVtb3ZlLmRpc3BsYXlOYW1lID0gJ1JlbW92ZSBhbiBlY2hvIGxvZ2dlcic7XG5yYW5rLmRpc3BsYXlOYW1lID0gJ1NldCB0aGUgZ2xvYmFsIEVjaG8gcmFuay4gTXVzdCBiZSBhIG51bWJlciAwLTUgaW5jbHVzaXZlLiAwIGlzIGxlc3MgbG9ncywgNSBpcyBtb3JlLic7XG5cblxuLy8gTWFpbiBleHBvcnRcbmV4cG9ydCBkZWZhdWx0IEVjaG87XG5cblxuXG4vLyBmdW5jdGlvbnMgZGVjbGFyYXRpb25zXG5mdW5jdGlvbiBhZGRDb2xvcihhcmdzLCBjb2xvcikge1xuICBpZiAoIWlzSUUgJiYgY29sb3IpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCBjb2xvcik7XG4gICAgYXJnc1swXSA9ICclYycgKyBhcmdzWzBdO1xuICB9XG4gIHJldHVybiBhcmdzO1xufVxuXG5mdW5jdGlvbiBoaWdoRW5vdWdoUmFuayhyYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA+PSByYW5rO1xufVxuXG5mdW5jdGlvbiBzZXRSYW5rKG9yaWdpbmFsUmFuaywgbmV3UmFuaykge1xuICBpZiAoIWlzLnVuZGVmaW5lZChuZXdSYW5rKSkge1xuICAgIGNoZWNrUmFuayhuZXdSYW5rKTtcbiAgICBvcmlnaW5hbFJhbmsgPSBuZXdSYW5rO1xuICB9XG4gIHJldHVybiBvcmlnaW5hbFJhbms7XG59XG5cbmZ1bmN0aW9uIHNldEVuYWJsZWQob3JpZ2luYWxTdGF0ZSwgbmV3U3RhdGUpIHtcbiAgaWYgKCFpcy51bmRlZmluZWQobmV3U3RhdGUpKSB7XG4gICAgaWYgKCFpcy5ib29sZWFuKG5ld1N0YXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvLmVuYWJsZWQgbXVzdCBwYXNzIG5vdGhpbmcgb3IgYSBib29sZWFuLiBcIiR7bmV3U3RhdGV9XCIgd2FzIHBhc3NlZGApO1xuICAgIH1cbiAgICBvcmlnaW5hbFN0YXRlID0gbmV3U3RhdGU7XG4gIH1cbiAgcmV0dXJuIG9yaWdpbmFsU3RhdGU7XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmFuayhyYW5rKSB7XG4gIGlmICghaXMubnVtYmVyKHJhbmspIHx8IHJhbmsgPCAwIHx8IHJhbmsgPiA1KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGVjaG8gcmFuayAodmFsdWU6ICR7cmFua30pIG11c3QgYmUgbnVtYmVycyBiZXR3ZWVuIDAgYW5kIDUgKGluY2x1c2l2ZSkuIDAgaXMgbGVzcyBsb2dzLCA1IGlzIG1vcmUuYFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJlY29uZmlndXJlZExvZ2dpbmdTdGF0ZSgpIHtcbiAgdmFyIGVuYWJsZUxvZ1ZhbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0VuYWJsZUxvZycpO1xuICB2YXIgZGlzYWJsZUxvZ1ZhbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0Rpc2FibGVMb2cnKTtcbiAgdmFyIGdsb2JhbGx5RW5hYmxlZCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0VuYWJsZWQnKTtcbiAgdmFyIGFsbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0FsbCcpO1xuICB2YXIgcmFuayA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob1JhbmsnKTtcbiAgdmFyIGVuYWJsZVF1ZXJ5UGFyYW1Mb2dzID0gaXMuc3RyaW5nKGVuYWJsZUxvZ1ZhbCkgPyBlbmFibGVMb2dWYWwuc3BsaXQoJywnKSA6IFtdO1xuICB2YXIgZGlzYWJsZVF1ZXJ5UGFyYW1Mb2dzID0gaXMuc3RyaW5nKGRpc2FibGVMb2dWYWwpID8gZGlzYWJsZUxvZ1ZhbC5zcGxpdCgnLCcpIDogW107XG4gIHZhciBzdGF0ZSA9IHdpbmRvdy5lY2hvTG9nZ2luZyB8fCB7fTtcbiAgYWxsID0gc3RhdGUudGVzdE1vZGUgPT09IHRydWUgPyBmYWxzZSA6IGFsbDtcbiAgdmFyIGRvQWxsID0gaXMuYm9vbGVhbihhbGwpO1xuICBzdGF0ZS5hbGwgPSBkb0FsbCA/IHN0YXRlLmFsbCA6IGFsbDtcbiAgc3RhdGUuZW5hYmxlZCA9IGRvQWxsID8gc3RhdGUuYWxsIDogaXMuYm9vbGVhbihnbG9iYWxseUVuYWJsZWQpID8gc3RhdGUuZW5hYmxlZCA6IGdsb2JhbGx5RW5hYmxlZDtcbiAgc3RhdGUucmFuayA9IHJhbms7XG5cbiAgZW5hYmxlUXVlcnlQYXJhbUxvZ3MuZm9yRWFjaChmdW5jdGlvbihsb2cpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICBzdGF0ZVtsb2ddID0gZG9BbGwgPyBzdGF0ZS5hbGwgOiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgZGlzYWJsZVF1ZXJ5UGFyYW1Mb2dzLmZvckVhY2goZnVuY3Rpb24obG9nKSB7XG4gICAgaWYgKGxvZykge1xuICAgICAgc3RhdGVbbG9nXSA9IGRvQWxsID8gc3RhdGUuYWxsIDogZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGdldFBhcmFtZXRlckJ5TmFtZShuYW1lKSB7XG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknLCAnaScpO1xuICB2YXIgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoIHx8IGxvY2F0aW9uLmhhc2gpO1xuICBpZiAocmVzdWx0cykge1xuICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4gICAgaWYgKHZhbCA9PT0gJ3RydWUnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljKHZhbCkpIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBpc051bWVyaWMobikge1xuICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZWNoby5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImRpc3QvZWNoby5qcyJ9