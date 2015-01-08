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
	
	function create(name) {
	  var _ref = arguments[1] === undefined ? {} : arguments[1];
	  var _ref$rank = _ref.rank;
	  var rank = _ref$rank === undefined ? 5 : _ref$rank;
	  var _ref$colors = _ref.colors;
	  var colors = _ref$colors === undefined ? COLORS : _ref$colors;
	  var _ref$logger = _ref.logger;
	  var logger = _ref$logger === undefined ? console : _ref$logger;
	  var _ref$logFns = _ref.logFns;
	  var logFns = _ref$logFns === undefined ? LOG_FNS : _ref$logFns;
	  var defaultColor = _ref.defaultColor;
	  var enabled = _ref.enabled;
	  // enabled: default to all if all is set, then preconfigState for the logger name
	  // then the provided enabled, then true
	  var presetState = is.boolean(preconfigState.all) ? preconfigState.all : preconfigState[name];
	  enabled = is.boolean(presetState) ? presetState : is.boolean(enabled) ? enabled : true;
	
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
	      logIt.apply(undefined, [fnName, colors[defaultColor]].concat(_slice.call(arguments)));
	    }
	    echoLog.displayName = "console abstraction for " + name + ":" + fnName;
	    addALittleColor(fnName, echoLog);
	    return echoLog;
	  }
	
	  function addALittleColor(fnName, fn) {
	    colorKeys.forEach(function (colorName) {
	      fn[colorName] = function echoColoredLog() {
	        logIt.apply(undefined, [fnName, colors[colorName]].concat(_slice.call(arguments)));
	      };
	      fn[colorName].displayName = "" + colorName + " colored console abstraction for " + name + ":" + fnName;
	    });
	  }
	
	  function logIt(fnName, color) {
	    var args = [];
	
	    for (var _key = 2; _key < arguments.length; _key++) {
	      args[_key - 2] = arguments[_key];
	    }
	
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
	  if (!isIE && color && !is.undefined(args[0])) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA3MThiOGZiNTk2M2JkNDYyYjI3NyIsIndlYnBhY2s6Ly8vLi9zcmMvZWNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQSxLQUFJLElBQUksR0FBRyxDQUFDLFlBQU07QUFDaEIsT0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDcEMsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RCxHQUFHLENBQUM7O0FBRUwsS0FBTSxNQUFNLEdBQUc7QUFDYixRQUFLLEVBQUUsYUFBYTtBQUNwQixTQUFNLEVBQUUscUJBQXFCO0FBQzdCLE9BQUksRUFBRSxzQkFBc0I7QUFDNUIsTUFBRyxFQUFFLGVBQWU7QUFDcEIsT0FBSSxFQUFFLGVBQWU7RUFDdEIsQ0FBQztBQUNGLEtBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxLQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsRUFBQyxJ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c0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJFY2hvXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkVjaG9cIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA3MThiOGZiNTk2M2JkNDYyYjI3N1xuICoqLyIsIi8qKlxuICogQG5hbWUgZWNob1xuICogQGxpY2Vuc2UgZWNoby5qcyBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIEBjb3B5cmlnaHQgKGMpIDIwMTUgQWxpYW56YSBJbmMuXG4gKiBAYXV0aG9yIEtlbnQgQy4gRG9kZHMgPGtlbnRAZG9kZHNmYW1pbHkudXM+XG4gKi9cblxuLy8gdmFyaWFibGUgYXNzaWdubWVudFxudmFyIGlzSUUgPSAoKCkgPT4ge1xuICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgcmV0dXJuIHVhLmluZGV4T2YoJ01TSUUgJykgPiAwIHx8IHVhLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwO1xufSkoKTtcblxuY29uc3QgQ09MT1JTID0ge1xuICBncmVlbjogJ2NvbG9yOmdyZWVuJyxcbiAgcHVycGxlOiAnY29sb3I6cmViZWNjYXB1cnBsZScsXG4gIGJsdWU6ICdjb2xvcjpjb3JuZmxvd2VyYmx1ZScsXG4gIHJlZDogJ2NvbG9yOmNyaW1zb24nLFxuICBncmF5OiAnY29sb3I6IzkxOTE5MSdcbn07XG5jb25zdCBMT0dfRk5TID0gWydsb2cnLCAnaW5mbycsICdkZWJ1ZycsICd3YXJuJywgJ2Vycm9yJ107XG5cbnZhciBpcyA9IHt9O1xuWyd1bmRlZmluZWQnLCAnc3RyaW5nJywge25hbWU6ICdmbicsIHR5cGU6ICdmdW5jdGlvbid9LCAnYm9vbGVhbicsICdudW1iZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgaXNbbmFtZS5uYW1lIHx8IG5hbWVdID0gKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gKG5hbWUudHlwZSB8fCBuYW1lKTtcbn0pO1xuXG5cbnZhciBwcmVjb25maWdTdGF0ZSA9IGdldFByZWNvbmZpZ3VyZWRMb2dnaW5nU3RhdGUoKTtcblxudmFyIHRlc3RNb2RlID0gcHJlY29uZmlnU3RhdGUudGVzdE1vZGU7XG52YXIgY3VycmVudFJhbmsgPSByYW5rKHByZWNvbmZpZ1N0YXRlLnJhbmsgfHwgNSk7XG52YXIgZ2xvYmFsbHlFbmFibGVkID0gaXMuYm9vbGVhbihwcmVjb25maWdTdGF0ZS5lbmFibGVkKSA/IHByZWNvbmZpZ1N0YXRlLmVuYWJsZWQgOiB0cnVlO1xudmFyIGVjaG9zID0ge307XG52YXIgRWNobyA9IHtjcmVhdGUsIGdldCwgcmVtb3ZlLCByYW5rLCBlbmFibGVkLCB0ZXN0TW9kZX07XG5cbmZ1bmN0aW9uIGNyZWF0ZShuYW1lLCB7XG4gIHJhbmsgPSA1LCBjb2xvcnMgPSBDT0xPUlMsIGxvZ2dlciA9IGNvbnNvbGUsIGxvZ0ZucyA9IExPR19GTlMsXG4gIGRlZmF1bHRDb2xvciwgZW5hYmxlZFxuICB9ID0ge30pIHtcbiAgLy8gZW5hYmxlZDogZGVmYXVsdCB0byBhbGwgaWYgYWxsIGlzIHNldCwgdGhlbiBwcmVjb25maWdTdGF0ZSBmb3IgdGhlIGxvZ2dlciBuYW1lXG4gIC8vIHRoZW4gdGhlIHByb3ZpZGVkIGVuYWJsZWQsIHRoZW4gdHJ1ZVxuICB2YXIgcHJlc2V0U3RhdGUgPSBpcy5ib29sZWFuKHByZWNvbmZpZ1N0YXRlLmFsbCkgPyBwcmVjb25maWdTdGF0ZS5hbGwgOiBwcmVjb25maWdTdGF0ZVtuYW1lXTtcbiAgZW5hYmxlZCA9IGlzLmJvb2xlYW4ocHJlc2V0U3RhdGUpID8gcHJlc2V0U3RhdGUgOiBpcy5ib29sZWFuKGVuYWJsZWQpID8gZW5hYmxlZCA6IHRydWU7XG5cbiAgY2hlY2tBcmdzKG5hbWUsIHJhbmssIGRlZmF1bHRDb2xvciwgY29sb3JzLCBsb2dnZXIsIGxvZ0Zucyk7XG5cbiAgLy8gdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cbiAgdmFyIGNvbG9yS2V5cyA9IE9iamVjdC5rZXlzKGNvbG9ycyk7XG5cbiAgLy8gY3JlYXRlIGVjaG9cbiAgdmFyIGVjaG8gPSB3cmFwTG9nKCdsb2cnKTtcblxuICAvLyBhZGQgZnVuY3Rpb25zXG4gIGVjaG8ucmFuayA9IGVjaG9SYW5rR2V0dGVyU2V0dGVyO1xuICBlY2hvLmVuYWJsZWQgPSBlY2hvRW5hYmxlZEdldHRlclNldHRlcjtcblxuICAvLyBhZGQgbG9nIGZ1bmN0aW9ucyB0byBlY2hvXG4gIGxvZ0Zucy5mb3JFYWNoKGZuTmFtZSA9PiBlY2hvW2ZuTmFtZV0gPSB3cmFwTG9nKGZuTmFtZSkpO1xuXG4gIC8vIG1ha2UgZGV2ZWxvcGVycyBoYXBweVxuICBlY2hvLmRpc3BsYXlOYW1lID0gYGVjaG86IFwiJHtuYW1lfVwiIGFic3RyYWN0aW9uIG9uIGNvbnNvbGVgO1xuICBlY2hvLnJhbmsuZGlzcGxheU5hbWUgPSAnZWNoby5yYW5rOiBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgY3VycmVudCBsZXZlbCBvZiBsb2dnaW5nIChoaWdoIGlzIG1vcmUpJztcbiAgbG9nSXQuZGlzcGxheU5hbWUgPSAnZWNobyBsb2cgd3JhcHBlciB0aGF0IGNoZWNrcyB3aGV0aGVyIHRoZSBlY2hvIGlzIGVuYWJsZWQgYW5kIGlmIGl0cyByYW5rIGlzIGhpZ2ggZW5vdWdoIGNvbXBhcmVkIHRvIEVjaG8ucmFuaygpJztcbiAgY2hlY2tBcmdzLmRpc3BsYXlOYW1lID0gJ0VjaG8uY3JlYXRlIGFyZyBjaGVja2VyIHRoYXQgZW5zdXJlcyBhbGwgYXJndW1lbnRzIGFyZSBjb3JyZWN0IGFuZCB0aHJvd3MgZXJyb3JzIGlmIG5vdCc7XG5cbiAgLy8gYWRkIGVjaG8gdG8gZWNob3NcbiAgZWNob3NbbmFtZV0gPSBlY2hvO1xuXG4gIC8vIHJldHVyblxuICByZXR1cm4gZWNobztcblxuXG4gIC8vIGZ1bmN0aW9uIGRlY2xhcmF0aW9uc1xuICBmdW5jdGlvbiB3cmFwTG9nKGZuTmFtZSkge1xuICAgIGZ1bmN0aW9uIGVjaG9Mb2coKSB7XG4gICAgICBsb2dJdCguLi5bZm5OYW1lLCBjb2xvcnNbZGVmYXVsdENvbG9yXSwgLi4uYXJndW1lbnRzXSk7XG4gICAgfVxuICAgIGVjaG9Mb2cuZGlzcGxheU5hbWUgPSBgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIGFkZEFMaXR0bGVDb2xvcihmbk5hbWUsIGVjaG9Mb2cpO1xuICAgIHJldHVybiBlY2hvTG9nO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQUxpdHRsZUNvbG9yKGZuTmFtZSwgZm4pIHtcbiAgICBjb2xvcktleXMuZm9yRWFjaChmdW5jdGlvbihjb2xvck5hbWUpIHtcbiAgICAgIGZuW2NvbG9yTmFtZV0gPSBmdW5jdGlvbiBlY2hvQ29sb3JlZExvZygpIHtcbiAgICAgICAgbG9nSXQoLi4uW2ZuTmFtZSwgY29sb3JzW2NvbG9yTmFtZV0sIC4uLmFyZ3VtZW50c10pO1xuICAgICAgfTtcbiAgICAgIGZuW2NvbG9yTmFtZV0uZGlzcGxheU5hbWUgPSBgJHtjb2xvck5hbWV9IGNvbG9yZWQgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nSXQoZm5OYW1lLCBjb2xvciwgLi4uYXJncykge1xuICAgIGlmIChnbG9iYWxseUVuYWJsZWQgJiYgZW5hYmxlZCAmJiBoaWdoRW5vdWdoUmFuayhyYW5rKSkge1xuICAgICAgYXJncyA9IGFkZENvbG9yKGFyZ3MsIGNvbG9yKTtcbiAgICAgIHJldHVybiBsb2dnZXJbZm5OYW1lXS5hcHBseShsb2dnZXIsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVjaG9SYW5rR2V0dGVyU2V0dGVyKG5ld1JhbmspIHtcbiAgICByZXR1cm4gcmFuayA9IHNldFJhbmsocmFuaywgbmV3UmFuayk7XG4gIH1cblxuICBmdW5jdGlvbiBlY2hvRW5hYmxlZEdldHRlclNldHRlcihuZXdTdGF0ZSkge1xuICAgIHJldHVybiBlbmFibGVkID0gc2V0RW5hYmxlZChlbmFibGVkLCBuZXdTdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FyZ3MoKSB7XG4gICAgaWYgKGlzLnVuZGVmaW5lZChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdlY2hvIG5hbWUgbXVzdCBiZSBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmICghRWNoby50ZXN0TW9kZSAmJiAhaXMudW5kZWZpbmVkKGVjaG9zW25hbWVdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGJ5IHRoZSBuYW1lIG9mICR7bmFtZX0gYWxyZWFkeSBleGlzdHMuIENhbm5vdCBjcmVhdGUgYW5vdGhlciBvZiB0aGUgc2FtZSBuYW1lLmApO1xuICAgIH1cbiAgICBjaGVja1JhbmsocmFuayk7XG4gICAgaWYgKCFpcy51bmRlZmluZWQoZGVmYXVsdENvbG9yKSAmJiAhaXMuc3RyaW5nKGNvbG9yc1tkZWZhdWx0Q29sb3JdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGRlZmF1bHRDb2xvciAodmFsdWU6ICR7ZGVmYXVsdENvbG9yfSkgbXVzdCBiZSBhIHN0cmluZyBzcGVjaWZpZWQgaW4gY29sb3JzICgke09iamVjdC5rZXlzKGNvbG9ycyl9KWApO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobG9nRm5zKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2dGbnMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHZhciBtaXNzaW5nU29tZXRoaW5nID0gbG9nRm5zLnNvbWUoZnVuY3Rpb24obG9nRm4pIHtcbiAgICAgIHJldHVybiAhaXMuc3RyaW5nKGxvZ0ZuKSB8fCAhaXMuZm4obG9nZ2VyW2xvZ0ZuXSk7XG4gICAgfSk7XG4gICAgaWYgKG1pc3NpbmdTb21ldGhpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobydzIGxvZ2dlciAodmFsdWU6ICR7bG9nZ2VyfSkgbXVzdCBpbXBsZW1lbnQgdGhlc2UgZnVuY3Rpb25zOiAke2xvZ0Zucy5qb2luKCcsICcpfSAod2hpY2ggbXVzdCBhbGwgYmUgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncylgKTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBnZXQobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgcmV0dXJuIGVjaG9zO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlY2hvc1tuYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgZWNob3MgPSB7fTtcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgZWNob3NbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5hYmxlZChuZXdTdGF0ZSkge1xuICByZXR1cm4gZ2xvYmFsbHlFbmFibGVkID0gc2V0RW5hYmxlZChnbG9iYWxseUVuYWJsZWQsIG5ld1N0YXRlKTtcbn1cblxuZnVuY3Rpb24gcmFuayhuZXdSYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA9IHNldFJhbmsoY3VycmVudFJhbmssIG5ld1JhbmspO1xufVxuXG4vLyBtYWtlIGRldmVsb3BlcnMgaGFwcHlcbmNyZWF0ZS5kaXNwbGF5TmFtZSA9ICdFY2hvLmNyZWF0ZTogTWFrZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRWNobyc7XG5nZXQuZGlzcGxheU5hbWUgPSAnR2V0IGFuIGVjaG8gbG9nZ2VyIGJ5IG5hbWUnO1xucmVtb3ZlLmRpc3BsYXlOYW1lID0gJ1JlbW92ZSBhbiBlY2hvIGxvZ2dlcic7XG5yYW5rLmRpc3BsYXlOYW1lID0gJ1NldCB0aGUgZ2xvYmFsIEVjaG8gcmFuay4gTXVzdCBiZSBhIG51bWJlciAwLTUgaW5jbHVzaXZlLiAwIGlzIGxlc3MgbG9ncywgNSBpcyBtb3JlLic7XG5cblxuLy8gTWFpbiBleHBvcnRcbmV4cG9ydCBkZWZhdWx0IEVjaG87XG5cblxuXG4vLyBmdW5jdGlvbnMgZGVjbGFyYXRpb25zXG5mdW5jdGlvbiBhZGRDb2xvcihhcmdzLCBjb2xvcikge1xuICBpZiAoIWlzSUUgJiYgY29sb3IgJiYgIWlzLnVuZGVmaW5lZChhcmdzWzBdKSkge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsIGNvbG9yKTtcbiAgICBhcmdzWzBdID0gJyVjJyArIGFyZ3NbMF07XG4gIH1cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbmZ1bmN0aW9uIGhpZ2hFbm91Z2hSYW5rKHJhbmspIHtcbiAgcmV0dXJuIGN1cnJlbnRSYW5rID49IHJhbms7XG59XG5cbmZ1bmN0aW9uIHNldFJhbmsob3JpZ2luYWxSYW5rLCBuZXdSYW5rKSB7XG4gIGlmICghaXMudW5kZWZpbmVkKG5ld1JhbmspKSB7XG4gICAgY2hlY2tSYW5rKG5ld1JhbmspO1xuICAgIG9yaWdpbmFsUmFuayA9IG5ld1Jhbms7XG4gIH1cbiAgcmV0dXJuIG9yaWdpbmFsUmFuaztcbn1cblxuZnVuY3Rpb24gc2V0RW5hYmxlZChvcmlnaW5hbFN0YXRlLCBuZXdTdGF0ZSkge1xuICBpZiAoIWlzLnVuZGVmaW5lZChuZXdTdGF0ZSkpIHtcbiAgICBpZiAoIWlzLmJvb2xlYW4obmV3U3RhdGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVjaG8uZW5hYmxlZCBtdXN0IHBhc3Mgbm90aGluZyBvciBhIGJvb2xlYW4uIFwiJHtuZXdTdGF0ZX1cIiB3YXMgcGFzc2VkYCk7XG4gICAgfVxuICAgIG9yaWdpbmFsU3RhdGUgPSBuZXdTdGF0ZTtcbiAgfVxuICByZXR1cm4gb3JpZ2luYWxTdGF0ZTtcbn1cblxuZnVuY3Rpb24gY2hlY2tSYW5rKHJhbmspIHtcbiAgaWYgKCFpcy5udW1iZXIocmFuaykgfHwgcmFuayA8IDAgfHwgcmFuayA+IDUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgZWNobyByYW5rICh2YWx1ZTogJHtyYW5rfSkgbXVzdCBiZSBudW1iZXJzIGJldHdlZW4gMCBhbmQgNSAoaW5jbHVzaXZlKS4gMCBpcyBsZXNzIGxvZ3MsIDUgaXMgbW9yZS5gXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcmVjb25maWd1cmVkTG9nZ2luZ1N0YXRlKCkge1xuICB2YXIgZW5hYmxlTG9nVmFsID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdlY2hvRW5hYmxlTG9nJyk7XG4gIHZhciBkaXNhYmxlTG9nVmFsID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdlY2hvRGlzYWJsZUxvZycpO1xuICB2YXIgZ2xvYmFsbHlFbmFibGVkID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdlY2hvRW5hYmxlZCcpO1xuICB2YXIgYWxsID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdlY2hvQWxsJyk7XG4gIHZhciByYW5rID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdlY2hvUmFuaycpO1xuICB2YXIgZW5hYmxlUXVlcnlQYXJhbUxvZ3MgPSBpcy5zdHJpbmcoZW5hYmxlTG9nVmFsKSA/IGVuYWJsZUxvZ1ZhbC5zcGxpdCgnLCcpIDogW107XG4gIHZhciBkaXNhYmxlUXVlcnlQYXJhbUxvZ3MgPSBpcy5zdHJpbmcoZGlzYWJsZUxvZ1ZhbCkgPyBkaXNhYmxlTG9nVmFsLnNwbGl0KCcsJykgOiBbXTtcbiAgdmFyIHN0YXRlID0gd2luZG93LmVjaG9Mb2dnaW5nIHx8IHt9O1xuICBhbGwgPSBzdGF0ZS50ZXN0TW9kZSA9PT0gdHJ1ZSA/IGZhbHNlIDogYWxsO1xuICB2YXIgZG9BbGwgPSBpcy5ib29sZWFuKGFsbCk7XG4gIHN0YXRlLmFsbCA9IGRvQWxsID8gc3RhdGUuYWxsIDogYWxsO1xuICBzdGF0ZS5lbmFibGVkID0gZG9BbGwgPyBzdGF0ZS5hbGwgOiBpcy5ib29sZWFuKGdsb2JhbGx5RW5hYmxlZCkgPyBzdGF0ZS5lbmFibGVkIDogZ2xvYmFsbHlFbmFibGVkO1xuICBzdGF0ZS5yYW5rID0gcmFuaztcblxuICBlbmFibGVRdWVyeVBhcmFtTG9ncy5mb3JFYWNoKGZ1bmN0aW9uKGxvZykge1xuICAgIGlmIChsb2cpIHtcbiAgICAgIHN0YXRlW2xvZ10gPSBkb0FsbCA/IHN0YXRlLmFsbCA6IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBkaXNhYmxlUXVlcnlQYXJhbUxvZ3MuZm9yRWFjaChmdW5jdGlvbihsb2cpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICBzdGF0ZVtsb2ddID0gZG9BbGwgPyBzdGF0ZS5hbGwgOiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBzdGF0ZTtcbn1cblxuZnVuY3Rpb24gZ2V0UGFyYW1ldGVyQnlOYW1lKG5hbWUpIHtcbiAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xuICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBuYW1lICsgJz0oW14mI10qKScsICdpJyk7XG4gIHZhciByZXN1bHRzID0gcmVnZXguZXhlYyhsb2NhdGlvbi5zZWFyY2ggfHwgbG9jYXRpb24uaGFzaCk7XG4gIGlmIChyZXN1bHRzKSB7XG4gICAgdmFyIHZhbCA9IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdLnJlcGxhY2UoL1xcKy9nLCAnICcpKTtcbiAgICBpZiAodmFsID09PSAndHJ1ZScpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAodmFsID09PSAnZmFsc2UnKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSBlbHNlIGlmIChpc051bWVyaWModmFsKSkge1xuICAgICAgcmV0dXJuIHBhcnNlRmxvYXQodmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzTnVtZXJpYyhuKSB7XG4gIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XG59XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy9lY2hvLmpzXG4gKiovIl0sInNvdXJjZVJvb3QiOiIiLCJmaWxlIjoiZGlzdC9lY2hvLmpzIn0=