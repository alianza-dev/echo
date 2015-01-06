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
	  enabled = !is.boolean(presetState) ? presetState : !is.boolean(enabled) ? enabled : true;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBiYWU5OWE0Yzg1OWYzYjQ4Nzk5ZSIsIndlYnBhY2s6Ly8vLi9zcmMvZWNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQSxLQUFJLElBQUksR0FBRyxDQUFDLFlBQU07QUFDaEIsT0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDcEMsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RCxHQUFHLENBQUM7O0FBRUwsS0FBTSxNQUFNLEdBQUc7QUFDYixRQUFLLEVBQUUsYUFBYTtBQUNwQixTQUFNLEVBQUUscUJBQXFCO0FBQzdCLE9BQUksRUFBRSxzQkFBc0I7QUFDNUIsTUFBRyxFQUFFLGVBQWU7QUFDcEIsT0FBSSxFQUFFLGVBQWU7RUFDdEIsQ0FBQztBQUNGLEtBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxLQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsRUFBQyxJ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O0FBQ0wsY0FBTyxHQUFHLENBQUM7TUFDWjtJQUNGLE1BQU07QUFDTCxZQUFPLEVBQUUsQ0FBQztJQUNYO0VBQ0Y7O0FBRUQsVUFBUyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLFVBQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJFY2hvXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkVjaG9cIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBiYWU5OWE0Yzg1OWYzYjQ4Nzk5ZVxuICoqLyIsIi8qKlxuICogQG5hbWUgZWNob1xuICogQGxpY2Vuc2UgZWNoby5qcyBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIEBjb3B5cmlnaHQgKGMpIDIwMTUgQWxpYW56YSBJbmMuXG4gKiBAYXV0aG9yIEtlbnQgQy4gRG9kZHMgPGtlbnRAZG9kZHNmYW1pbHkudXM+XG4gKi9cblxuLy8gdmFyaWFibGUgYXNzaWdubWVudFxudmFyIGlzSUUgPSAoKCkgPT4ge1xuICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgcmV0dXJuIHVhLmluZGV4T2YoJ01TSUUgJykgPiAwIHx8IHVhLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwO1xufSkoKTtcblxuY29uc3QgQ09MT1JTID0ge1xuICBncmVlbjogJ2NvbG9yOmdyZWVuJyxcbiAgcHVycGxlOiAnY29sb3I6cmViZWNjYXB1cnBsZScsXG4gIGJsdWU6ICdjb2xvcjpjb3JuZmxvd2VyYmx1ZScsXG4gIHJlZDogJ2NvbG9yOmNyaW1zb24nLFxuICBncmF5OiAnY29sb3I6IzkxOTE5MSdcbn07XG5jb25zdCBMT0dfRk5TID0gWydsb2cnLCAnaW5mbycsICdkZWJ1ZycsICd3YXJuJywgJ2Vycm9yJ107XG5cbnZhciBpcyA9IHt9O1xuWyd1bmRlZmluZWQnLCAnc3RyaW5nJywge25hbWU6ICdmbicsIHR5cGU6ICdmdW5jdGlvbid9LCAnYm9vbGVhbicsICdudW1iZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgaXNbbmFtZS5uYW1lIHx8IG5hbWVdID0gKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gKG5hbWUudHlwZSB8fCBuYW1lKTtcbn0pO1xuXG5cbnZhciBwcmVjb25maWdTdGF0ZSA9IGdldFByZWNvbmZpZ3VyZWRMb2dnaW5nU3RhdGUoKTtcblxudmFyIHRlc3RNb2RlID0gcHJlY29uZmlnU3RhdGUudGVzdE1vZGU7XG52YXIgY3VycmVudFJhbmsgPSByYW5rKHByZWNvbmZpZ1N0YXRlLnJhbmsgfHwgNSk7XG52YXIgZ2xvYmFsbHlFbmFibGVkID0gaXMuYm9vbGVhbihwcmVjb25maWdTdGF0ZS5lbmFibGVkKSA/IHByZWNvbmZpZ1N0YXRlLmVuYWJsZWQgOiB0cnVlO1xudmFyIGVjaG9zID0ge307XG52YXIgRWNobyA9IHsgY3JlYXRlLCBnZXQsIHJlbW92ZSwgcmFuaywgZW5hYmxlZCwgdGVzdE1vZGUgfTtcblxuZnVuY3Rpb24gY3JlYXRlKG5hbWUsIHtyYW5rLCBkZWZhdWx0Q29sb3IsIGNvbG9ycywgZW5hYmxlZCwgbG9nZ2VyLCBsb2dGbnN9KSB7XG4gIC8vIG5vdGUsIDZ0bzUgZG9lc24ndCBzdXBwb3J0IGRlc3RydWN0dXJpbmcgYXNzaWdubWVudCBkZWZhdWx0IHZhbHVlc1xuICAvLyBvbmNlIHRoYXQgaGFwcGVucywgdGhpcyB3aWxsIGxvb2sgcHJldHRpZXIgOi0pXG4gIHZhciBwcmVzZXRTdGF0ZSA9IGlzLmJvb2xlYW4ocHJlY29uZmlnU3RhdGUuYWxsKSA/IHByZWNvbmZpZ1N0YXRlLmFsbCA6IHByZWNvbmZpZ1N0YXRlW25hbWVdO1xuICBlbmFibGVkID0gIWlzLmJvb2xlYW4ocHJlc2V0U3RhdGUpID8gcHJlc2V0U3RhdGUgOiAhaXMuYm9vbGVhbihlbmFibGVkKSA/IGVuYWJsZWQgOiB0cnVlO1xuICByYW5rID0gIWlzLnVuZGVmaW5lZChyYW5rKSA/IHJhbmsgOiA1O1xuICBjb2xvcnMgPSAhaXMudW5kZWZpbmVkKGNvbG9ycykgPyBjb2xvcnMgOiBDT0xPUlM7XG4gIGxvZ2dlciA9ICFpcy51bmRlZmluZWQobG9nZ2VyKSA/IGxvZ2dlciA6IGNvbnNvbGU7XG4gIGxvZ0ZucyA9ICFpcy51bmRlZmluZWQobG9nRm5zKSA/IGxvZ0ZucyA6IExPR19GTlM7XG5cbiAgY2hlY2tBcmdzKG5hbWUsIHJhbmssIGRlZmF1bHRDb2xvciwgY29sb3JzLCBsb2dnZXIsIGxvZ0Zucyk7XG5cbiAgLy8gdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cbiAgdmFyIGNvbG9yS2V5cyA9IE9iamVjdC5rZXlzKGNvbG9ycyk7XG5cbiAgLy8gY3JlYXRlIGVjaG9cbiAgdmFyIGVjaG8gPSB3cmFwTG9nKCdsb2cnKTtcblxuICAvLyBhZGQgZnVuY3Rpb25zXG4gIGVjaG8ucmFuayA9IGVjaG9SYW5rR2V0dGVyU2V0dGVyO1xuICBlY2hvLmVuYWJsZWQgPSBlY2hvRW5hYmxlZEdldHRlclNldHRlcjtcblxuICAvLyBhZGQgbG9nIGZ1bmN0aW9ucyB0byBlY2hvXG4gIGxvZ0Zucy5mb3JFYWNoKGZuTmFtZSA9PiBlY2hvW2ZuTmFtZV0gPSB3cmFwTG9nKGZuTmFtZSkpO1xuXG4gIC8vIG1ha2UgZGV2ZWxvcGVycyBoYXBweVxuICBlY2hvLmRpc3BsYXlOYW1lID0gYGVjaG86IFwiJHtuYW1lfVwiIGFic3RyYWN0aW9uIG9uIGNvbnNvbGVgO1xuICBlY2hvLnJhbmsuZGlzcGxheU5hbWUgPSAnZWNoby5yYW5rOiBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgY3VycmVudCBsZXZlbCBvZiBsb2dnaW5nIChoaWdoIGlzIG1vcmUpJztcbiAgbG9nSXQuZGlzcGxheU5hbWUgPSAnZWNobyBsb2cgd3JhcHBlciB0aGF0IGNoZWNrcyB3aGV0aGVyIHRoZSBlY2hvIGlzIGVuYWJsZWQgYW5kIGlmIGl0cyByYW5rIGlzIGhpZ2ggZW5vdWdoIGNvbXBhcmVkIHRvIEVjaG8ucmFuaygpJztcbiAgY2hlY2tBcmdzLmRpc3BsYXlOYW1lID0gJ0VjaG8uY3JlYXRlIGFyZyBjaGVja2VyIHRoYXQgZW5zdXJlcyBhbGwgYXJndW1lbnRzIGFyZSBjb3JyZWN0IGFuZCB0aHJvd3MgZXJyb3JzIGlmIG5vdCc7XG5cbiAgLy8gYWRkIGVjaG8gdG8gZWNob3NcbiAgZWNob3NbbmFtZV0gPSBlY2hvO1xuXG4gIC8vIHJldHVyblxuICByZXR1cm4gZWNobztcblxuXG4gIC8vIGZ1bmN0aW9uIGRlY2xhcmF0aW9uc1xuICBmdW5jdGlvbiB3cmFwTG9nKGZuTmFtZSkge1xuICAgIGZ1bmN0aW9uIGVjaG9Mb2coKSB7XG4gICAgICBsb2dJdCguLi5bZm5OYW1lLCBjb2xvcnNbZGVmYXVsdENvbG9yXSwgLi4uYXJndW1lbnRzXSk7XG4gICAgfVxuICAgIGVjaG9Mb2cuZGlzcGxheU5hbWUgPSBgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIGFkZEFMaXR0bGVDb2xvcihmbk5hbWUsIGVjaG9Mb2cpO1xuICAgIHJldHVybiBlY2hvTG9nO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQUxpdHRsZUNvbG9yKGZuTmFtZSwgZm4pIHtcbiAgICBjb2xvcktleXMuZm9yRWFjaChmdW5jdGlvbihjb2xvck5hbWUpIHtcbiAgICAgIGZuW2NvbG9yTmFtZV0gPSBmdW5jdGlvbiBlY2hvQ29sb3JlZExvZygpIHtcbiAgICAgICAgbG9nSXQoLi4uW2ZuTmFtZSwgY29sb3JzW2NvbG9yTmFtZV0sIC4uLmFyZ3VtZW50c10pO1xuICAgICAgfTtcbiAgICAgIGZuW2NvbG9yTmFtZV0uZGlzcGxheU5hbWUgPSBgJHtjb2xvck5hbWV9IGNvbG9yZWQgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nSXQoZm5OYW1lLCBjb2xvciwgLi4uYXJncykge1xuICAgIGlmIChnbG9iYWxseUVuYWJsZWQgJiYgZW5hYmxlZCAmJiBoaWdoRW5vdWdoUmFuayhyYW5rKSkge1xuICAgICAgYXJncyA9IGFkZENvbG9yKGFyZ3MsIGNvbG9yKTtcbiAgICAgIHJldHVybiBsb2dnZXJbZm5OYW1lXS5hcHBseShsb2dnZXIsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVjaG9SYW5rR2V0dGVyU2V0dGVyKG5ld1JhbmspIHtcbiAgICByZXR1cm4gcmFuayA9IHNldFJhbmsocmFuaywgbmV3UmFuayk7XG4gIH1cblxuICBmdW5jdGlvbiBlY2hvRW5hYmxlZEdldHRlclNldHRlcihuZXdTdGF0ZSkge1xuICAgIHJldHVybiBlbmFibGVkID0gc2V0RW5hYmxlZChlbmFibGVkLCBuZXdTdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FyZ3MoKSB7XG4gICAgaWYgKGlzLnVuZGVmaW5lZChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdlY2hvIG5hbWUgbXVzdCBiZSBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmICghRWNoby50ZXN0TW9kZSAmJiAhaXMudW5kZWZpbmVkKGVjaG9zW25hbWVdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGJ5IHRoZSBuYW1lIG9mICR7bmFtZX0gYWxyZWFkeSBleGlzdHMuIENhbm5vdCBjcmVhdGUgYW5vdGhlciBvZiB0aGUgc2FtZSBuYW1lLmApO1xuICAgIH1cbiAgICBjaGVja1JhbmsocmFuayk7XG4gICAgaWYgKCFpcy51bmRlZmluZWQoZGVmYXVsdENvbG9yKSAmJiAhaXMuc3RyaW5nKGNvbG9yc1tkZWZhdWx0Q29sb3JdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGRlZmF1bHRDb2xvciAodmFsdWU6ICR7ZGVmYXVsdENvbG9yfSkgbXVzdCBiZSBhIHN0cmluZyBzcGVjaWZpZWQgaW4gY29sb3JzICgke09iamVjdC5rZXlzKGNvbG9ycyl9KWApO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobG9nRm5zKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2dGbnMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHZhciBtaXNzaW5nU29tZXRoaW5nID0gbG9nRm5zLnNvbWUoZnVuY3Rpb24obG9nRm4pIHtcbiAgICAgIHJldHVybiAhaXMuc3RyaW5nKGxvZ0ZuKSB8fCAhaXMuZm4obG9nZ2VyW2xvZ0ZuXSk7XG4gICAgfSk7XG4gICAgaWYgKG1pc3NpbmdTb21ldGhpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobydzIGxvZ2dlciAodmFsdWU6ICR7bG9nZ2VyfSkgbXVzdCBpbXBsZW1lbnQgdGhlc2UgZnVuY3Rpb25zOiAke2xvZ0Zucy5qb2luKCcsICcpfSAod2hpY2ggbXVzdCBhbGwgYmUgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncylgKTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBnZXQobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgcmV0dXJuIGVjaG9zO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlY2hvc1tuYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgZWNob3MgPSB7fTtcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgZWNob3NbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5hYmxlZChuZXdTdGF0ZSkge1xuICByZXR1cm4gZ2xvYmFsbHlFbmFibGVkID0gc2V0RW5hYmxlZChnbG9iYWxseUVuYWJsZWQsIG5ld1N0YXRlKTtcbn1cblxuZnVuY3Rpb24gcmFuayhuZXdSYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA9IHNldFJhbmsoY3VycmVudFJhbmssIG5ld1JhbmspO1xufVxuXG4vLyBtYWtlIGRldmVsb3BlcnMgaGFwcHlcbmNyZWF0ZS5kaXNwbGF5TmFtZSA9ICdFY2hvLmNyZWF0ZTogTWFrZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRWNobyc7XG5nZXQuZGlzcGxheU5hbWUgPSAnR2V0IGFuIGVjaG8gbG9nZ2VyIGJ5IG5hbWUnO1xucmVtb3ZlLmRpc3BsYXlOYW1lID0gJ1JlbW92ZSBhbiBlY2hvIGxvZ2dlcic7XG5yYW5rLmRpc3BsYXlOYW1lID0gJ1NldCB0aGUgZ2xvYmFsIEVjaG8gcmFuay4gTXVzdCBiZSBhIG51bWJlciAwLTUgaW5jbHVzaXZlLiAwIGlzIGxlc3MgbG9ncywgNSBpcyBtb3JlLic7XG5cblxuLy8gTWFpbiBleHBvcnRcbmV4cG9ydCBkZWZhdWx0IEVjaG87XG5cblxuXG4vLyBmdW5jdGlvbnMgZGVjbGFyYXRpb25zXG5mdW5jdGlvbiBhZGRDb2xvcihhcmdzLCBjb2xvcikge1xuICBpZiAoIWlzSUUgJiYgY29sb3IpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCBjb2xvcik7XG4gICAgYXJnc1swXSA9ICclYycgKyBhcmdzWzBdO1xuICB9XG4gIHJldHVybiBhcmdzO1xufVxuXG5mdW5jdGlvbiBoaWdoRW5vdWdoUmFuayhyYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA+PSByYW5rO1xufVxuXG5mdW5jdGlvbiBzZXRSYW5rKG9yaWdpbmFsUmFuaywgbmV3UmFuaykge1xuICBpZiAoIWlzLnVuZGVmaW5lZChuZXdSYW5rKSkge1xuICAgIGNoZWNrUmFuayhuZXdSYW5rKTtcbiAgICBvcmlnaW5hbFJhbmsgPSBuZXdSYW5rO1xuICB9XG4gIHJldHVybiBvcmlnaW5hbFJhbms7XG59XG5cbmZ1bmN0aW9uIHNldEVuYWJsZWQob3JpZ2luYWxTdGF0ZSwgbmV3U3RhdGUpIHtcbiAgaWYgKCFpcy51bmRlZmluZWQobmV3U3RhdGUpKSB7XG4gICAgaWYgKCFpcy5ib29sZWFuKG5ld1N0YXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvLmVuYWJsZWQgbXVzdCBwYXNzIG5vdGhpbmcgb3IgYSBib29sZWFuLiBcIiR7bmV3U3RhdGV9XCIgd2FzIHBhc3NlZGApO1xuICAgIH1cbiAgICBvcmlnaW5hbFN0YXRlID0gbmV3U3RhdGU7XG4gIH1cbiAgcmV0dXJuIG9yaWdpbmFsU3RhdGU7XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmFuayhyYW5rKSB7XG4gIGlmICghaXMubnVtYmVyKHJhbmspIHx8IHJhbmsgPCAwIHx8IHJhbmsgPiA1KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGVjaG8gcmFuayAodmFsdWU6ICR7cmFua30pIG11c3QgYmUgbnVtYmVycyBiZXR3ZWVuIDAgYW5kIDUgKGluY2x1c2l2ZSkuIDAgaXMgbGVzcyBsb2dzLCA1IGlzIG1vcmUuYFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJlY29uZmlndXJlZExvZ2dpbmdTdGF0ZSgpIHtcbiAgdmFyIGVuYWJsZUxvZ1ZhbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0VuYWJsZUxvZycpO1xuICB2YXIgZGlzYWJsZUxvZ1ZhbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0Rpc2FibGVMb2cnKTtcbiAgdmFyIGdsb2JhbGx5RW5hYmxlZCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0VuYWJsZWQnKTtcbiAgdmFyIGFsbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0FsbCcpO1xuICB2YXIgcmFuayA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob1JhbmsnKTtcbiAgdmFyIGVuYWJsZVF1ZXJ5UGFyYW1Mb2dzID0gaXMuc3RyaW5nKGVuYWJsZUxvZ1ZhbCkgPyBlbmFibGVMb2dWYWwuc3BsaXQoJywnKSA6IFtdO1xuICB2YXIgZGlzYWJsZVF1ZXJ5UGFyYW1Mb2dzID0gaXMuc3RyaW5nKGRpc2FibGVMb2dWYWwpID8gZGlzYWJsZUxvZ1ZhbC5zcGxpdCgnLCcpIDogW107XG4gIHZhciBzdGF0ZSA9IHdpbmRvdy5lY2hvTG9nZ2luZyB8fCB7fTtcbiAgYWxsID0gc3RhdGUudGVzdE1vZGUgPT09IHRydWUgPyBmYWxzZSA6IGFsbDtcbiAgdmFyIGRvQWxsID0gaXMuYm9vbGVhbihhbGwpO1xuICBzdGF0ZS5hbGwgPSBkb0FsbCA/IHN0YXRlLmFsbCA6IGFsbDtcbiAgc3RhdGUuZW5hYmxlZCA9IGRvQWxsID8gc3RhdGUuYWxsIDogaXMuYm9vbGVhbihnbG9iYWxseUVuYWJsZWQpID8gc3RhdGUuZW5hYmxlZCA6IGdsb2JhbGx5RW5hYmxlZDtcbiAgc3RhdGUucmFuayA9IHJhbms7XG5cbiAgZW5hYmxlUXVlcnlQYXJhbUxvZ3MuZm9yRWFjaChmdW5jdGlvbihsb2cpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICBzdGF0ZVtsb2ddID0gZG9BbGwgPyBzdGF0ZS5hbGwgOiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgZGlzYWJsZVF1ZXJ5UGFyYW1Mb2dzLmZvckVhY2goZnVuY3Rpb24obG9nKSB7XG4gICAgaWYgKGxvZykge1xuICAgICAgc3RhdGVbbG9nXSA9IGRvQWxsID8gc3RhdGUuYWxsIDogZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGdldFBhcmFtZXRlckJ5TmFtZShuYW1lKSB7XG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknLCAnaScpO1xuICB2YXIgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoIHx8IGxvY2F0aW9uLmhhc2gpO1xuICBpZiAocmVzdWx0cykge1xuICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4gICAgaWYgKHZhbCA9PT0gJ3RydWUnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljKHZhbCkpIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBpc051bWVyaWMobikge1xuICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZWNoby5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImRpc3QvZWNoby5qcyJ9