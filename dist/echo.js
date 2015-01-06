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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBmZWQxNWQzNjU5OWFlMDVlNDEzOSIsIndlYnBhY2s6Ly8vLi9zcmMvZWNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQSxLQUFJLElBQUksR0FBRyxDQUFDLFlBQU07QUFDaEIsT0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDcEMsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RCxHQUFHLENBQUM7O0FBRUwsS0FBTSxNQUFNLEdBQUc7QUFDYixRQUFLLEVBQUUsYUFBYTtBQUNwQixTQUFNLEVBQUUscUJBQXFCO0FBQzdCLE9BQUksRUFBRSxzQkFBc0I7QUFDNUIsTUFBRyxFQUFFLGVBQWU7QUFDcEIsT0FBSSxFQUFFLGVBQWU7RUFDdEIsQ0FBQztBQUNGLEtBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxLQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsRUFBQyxJ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QUN6QixjQUFPLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUN4QixNQUFNO0FBQ0wsY0FBTyxHQUFHLENBQUM7TUFDWjtJQUNGLE1BQU07QUFDTCxZQUFPLEVBQUUsQ0FBQztJQUNYO0VBQ0Y7O0FBRUQsVUFBUyxTQUFTLENBQUMsQ0FBQyxFQUFFO0FBQ3BCLFVBQU8sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJFY2hvXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkVjaG9cIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBmZWQxNWQzNjU5OWFlMDVlNDEzOVxuICoqLyIsIi8qKlxuICogQG5hbWUgZWNob1xuICogQGxpY2Vuc2UgZWNoby5qcyBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIEBjb3B5cmlnaHQgKGMpIDIwMTUgQWxpYW56YSBJbmMuXG4gKiBAYXV0aG9yIEtlbnQgQy4gRG9kZHMgPGtlbnRAZG9kZHNmYW1pbHkudXM+XG4gKi9cblxuLy8gdmFyaWFibGUgYXNzaWdubWVudFxudmFyIGlzSUUgPSAoKCkgPT4ge1xuICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgcmV0dXJuIHVhLmluZGV4T2YoJ01TSUUgJykgPiAwIHx8IHVhLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwO1xufSkoKTtcblxuY29uc3QgQ09MT1JTID0ge1xuICBncmVlbjogJ2NvbG9yOmdyZWVuJyxcbiAgcHVycGxlOiAnY29sb3I6cmViZWNjYXB1cnBsZScsXG4gIGJsdWU6ICdjb2xvcjpjb3JuZmxvd2VyYmx1ZScsXG4gIHJlZDogJ2NvbG9yOmNyaW1zb24nLFxuICBncmF5OiAnY29sb3I6IzkxOTE5MSdcbn07XG5jb25zdCBMT0dfRk5TID0gWydsb2cnLCAnaW5mbycsICdkZWJ1ZycsICd3YXJuJywgJ2Vycm9yJ107XG5cbnZhciBpcyA9IHt9O1xuWyd1bmRlZmluZWQnLCAnc3RyaW5nJywge25hbWU6ICdmbicsIHR5cGU6ICdmdW5jdGlvbid9LCAnYm9vbGVhbicsICdudW1iZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgaXNbbmFtZS5uYW1lIHx8IG5hbWVdID0gKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gKG5hbWUudHlwZSB8fCBuYW1lKTtcbn0pO1xuXG5cbnZhciBwcmVjb25maWdTdGF0ZSA9IGdldFByZWNvbmZpZ3VyZWRMb2dnaW5nU3RhdGUoKTtcblxudmFyIHRlc3RNb2RlID0gcHJlY29uZmlnU3RhdGUudGVzdE1vZGU7XG52YXIgY3VycmVudFJhbmsgPSByYW5rKHByZWNvbmZpZ1N0YXRlLnJhbmsgfHwgNSk7XG52YXIgZ2xvYmFsbHlFbmFibGVkID0gaXMuYm9vbGVhbihwcmVjb25maWdTdGF0ZS5lbmFibGVkKSA/IHByZWNvbmZpZ1N0YXRlLmVuYWJsZWQgOiB0cnVlO1xudmFyIGVjaG9zID0ge307XG52YXIgRWNobyA9IHsgY3JlYXRlLCBnZXQsIHJlbW92ZSwgcmFuaywgZW5hYmxlZCwgdGVzdE1vZGUgfTtcblxuZnVuY3Rpb24gY3JlYXRlKG5hbWUsIHtyYW5rLCBkZWZhdWx0Q29sb3IsIGNvbG9ycywgZW5hYmxlZCwgbG9nZ2VyLCBsb2dGbnN9KSB7XG4gIC8vIG5vdGUsIDZ0bzUgZG9lc24ndCBzdXBwb3J0IGRlc3RydWN0dXJpbmcgYXNzaWdubWVudCBkZWZhdWx0IHZhbHVlc1xuICAvLyBvbmNlIHRoYXQgaGFwcGVucywgdGhpcyB3aWxsIGxvb2sgcHJldHRpZXIgOi0pXG4gIHZhciBwcmVzZXRTdGF0ZSA9IGlzLmJvb2xlYW4ocHJlY29uZmlnU3RhdGUuYWxsKSA/IHByZWNvbmZpZ1N0YXRlLmFsbCA6IHByZWNvbmZpZ1N0YXRlW25hbWVdO1xuICBlbmFibGVkID0gaXMuYm9vbGVhbihwcmVzZXRTdGF0ZSkgPyBwcmVzZXRTdGF0ZSA6IGlzLmJvb2xlYW4oZW5hYmxlZCkgPyBlbmFibGVkIDogdHJ1ZTtcbiAgcmFuayA9ICFpcy51bmRlZmluZWQocmFuaykgPyByYW5rIDogNTtcbiAgY29sb3JzID0gIWlzLnVuZGVmaW5lZChjb2xvcnMpID8gY29sb3JzIDogQ09MT1JTO1xuICBsb2dnZXIgPSAhaXMudW5kZWZpbmVkKGxvZ2dlcikgPyBsb2dnZXIgOiBjb25zb2xlO1xuICBsb2dGbnMgPSAhaXMudW5kZWZpbmVkKGxvZ0ZucykgPyBsb2dGbnMgOiBMT0dfRk5TO1xuXG4gIGNoZWNrQXJncyhuYW1lLCByYW5rLCBkZWZhdWx0Q29sb3IsIGNvbG9ycywgbG9nZ2VyLCBsb2dGbnMpO1xuXG4gIC8vIHZhcmlhYmxlIGluaXRpYWxpemF0aW9uXG4gIHZhciBjb2xvcktleXMgPSBPYmplY3Qua2V5cyhjb2xvcnMpO1xuXG4gIC8vIGNyZWF0ZSBlY2hvXG4gIHZhciBlY2hvID0gd3JhcExvZygnbG9nJyk7XG5cbiAgLy8gYWRkIGZ1bmN0aW9uc1xuICBlY2hvLnJhbmsgPSBlY2hvUmFua0dldHRlclNldHRlcjtcbiAgZWNoby5lbmFibGVkID0gZWNob0VuYWJsZWRHZXR0ZXJTZXR0ZXI7XG5cbiAgLy8gYWRkIGxvZyBmdW5jdGlvbnMgdG8gZWNob1xuICBsb2dGbnMuZm9yRWFjaChmbk5hbWUgPT4gZWNob1tmbk5hbWVdID0gd3JhcExvZyhmbk5hbWUpKTtcblxuICAvLyBtYWtlIGRldmVsb3BlcnMgaGFwcHlcbiAgZWNoby5kaXNwbGF5TmFtZSA9IGBlY2hvOiBcIiR7bmFtZX1cIiBhYnN0cmFjdGlvbiBvbiBjb25zb2xlYDtcbiAgZWNoby5yYW5rLmRpc3BsYXlOYW1lID0gJ2VjaG8ucmFuazogZ2V0dGVyL3NldHRlciBmb3IgdGhlIGN1cnJlbnQgbGV2ZWwgb2YgbG9nZ2luZyAoaGlnaCBpcyBtb3JlKSc7XG4gIGxvZ0l0LmRpc3BsYXlOYW1lID0gJ2VjaG8gbG9nIHdyYXBwZXIgdGhhdCBjaGVja3Mgd2hldGhlciB0aGUgZWNobyBpcyBlbmFibGVkIGFuZCBpZiBpdHMgcmFuayBpcyBoaWdoIGVub3VnaCBjb21wYXJlZCB0byBFY2hvLnJhbmsoKSc7XG4gIGNoZWNrQXJncy5kaXNwbGF5TmFtZSA9ICdFY2hvLmNyZWF0ZSBhcmcgY2hlY2tlciB0aGF0IGVuc3VyZXMgYWxsIGFyZ3VtZW50cyBhcmUgY29ycmVjdCBhbmQgdGhyb3dzIGVycm9ycyBpZiBub3QnO1xuXG4gIC8vIGFkZCBlY2hvIHRvIGVjaG9zXG4gIGVjaG9zW25hbWVdID0gZWNobztcblxuICAvLyByZXR1cm5cbiAgcmV0dXJuIGVjaG87XG5cblxuICAvLyBmdW5jdGlvbiBkZWNsYXJhdGlvbnNcbiAgZnVuY3Rpb24gd3JhcExvZyhmbk5hbWUpIHtcbiAgICBmdW5jdGlvbiBlY2hvTG9nKCkge1xuICAgICAgbG9nSXQoLi4uW2ZuTmFtZSwgY29sb3JzW2RlZmF1bHRDb2xvcl0sIC4uLmFyZ3VtZW50c10pO1xuICAgIH1cbiAgICBlY2hvTG9nLmRpc3BsYXlOYW1lID0gYGNvbnNvbGUgYWJzdHJhY3Rpb24gZm9yICR7bmFtZX06JHtmbk5hbWV9YDtcbiAgICBhZGRBTGl0dGxlQ29sb3IoZm5OYW1lLCBlY2hvTG9nKTtcbiAgICByZXR1cm4gZWNob0xvZztcbiAgfVxuXG4gIGZ1bmN0aW9uIGFkZEFMaXR0bGVDb2xvcihmbk5hbWUsIGZuKSB7XG4gICAgY29sb3JLZXlzLmZvckVhY2goZnVuY3Rpb24oY29sb3JOYW1lKSB7XG4gICAgICBmbltjb2xvck5hbWVdID0gZnVuY3Rpb24gZWNob0NvbG9yZWRMb2coKSB7XG4gICAgICAgIGxvZ0l0KC4uLltmbk5hbWUsIGNvbG9yc1tjb2xvck5hbWVdLCAuLi5hcmd1bWVudHNdKTtcbiAgICAgIH07XG4gICAgICBmbltjb2xvck5hbWVdLmRpc3BsYXlOYW1lID0gYCR7Y29sb3JOYW1lfSBjb2xvcmVkIGNvbnNvbGUgYWJzdHJhY3Rpb24gZm9yICR7bmFtZX06JHtmbk5hbWV9YDtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvZ0l0KGZuTmFtZSwgY29sb3IsIC4uLmFyZ3MpIHtcbiAgICBpZiAoZ2xvYmFsbHlFbmFibGVkICYmIGVuYWJsZWQgJiYgaGlnaEVub3VnaFJhbmsocmFuaykpIHtcbiAgICAgIGFyZ3MgPSBhZGRDb2xvcihhcmdzLCBjb2xvcik7XG4gICAgICByZXR1cm4gbG9nZ2VyW2ZuTmFtZV0uYXBwbHkobG9nZ2VyLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlY2hvUmFua0dldHRlclNldHRlcihuZXdSYW5rKSB7XG4gICAgcmV0dXJuIHJhbmsgPSBzZXRSYW5rKHJhbmssIG5ld1JhbmspO1xuICB9XG5cbiAgZnVuY3Rpb24gZWNob0VuYWJsZWRHZXR0ZXJTZXR0ZXIobmV3U3RhdGUpIHtcbiAgICByZXR1cm4gZW5hYmxlZCA9IHNldEVuYWJsZWQoZW5hYmxlZCwgbmV3U3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tBcmdzKCkge1xuICAgIGlmIChpcy51bmRlZmluZWQobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZWNobyBuYW1lIG11c3QgYmUgZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAoIUVjaG8udGVzdE1vZGUgJiYgIWlzLnVuZGVmaW5lZChlY2hvc1tuYW1lXSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobyBieSB0aGUgbmFtZSBvZiAke25hbWV9IGFscmVhZHkgZXhpc3RzLiBDYW5ub3QgY3JlYXRlIGFub3RoZXIgb2YgdGhlIHNhbWUgbmFtZS5gKTtcbiAgICB9XG4gICAgY2hlY2tSYW5rKHJhbmspO1xuICAgIGlmICghaXMudW5kZWZpbmVkKGRlZmF1bHRDb2xvcikgJiYgIWlzLnN0cmluZyhjb2xvcnNbZGVmYXVsdENvbG9yXSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobyBkZWZhdWx0Q29sb3IgKHZhbHVlOiAke2RlZmF1bHRDb2xvcn0pIG11c3QgYmUgYSBzdHJpbmcgc3BlY2lmaWVkIGluIGNvbG9ycyAoJHtPYmplY3Qua2V5cyhjb2xvcnMpfSlgKTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxvZ0ZucykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbG9nRm5zIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncycpO1xuICAgIH1cbiAgICB2YXIgbWlzc2luZ1NvbWV0aGluZyA9IGxvZ0Zucy5zb21lKGZ1bmN0aW9uKGxvZ0ZuKSB7XG4gICAgICByZXR1cm4gIWlzLnN0cmluZyhsb2dGbikgfHwgIWlzLmZuKGxvZ2dlcltsb2dGbl0pO1xuICAgIH0pO1xuICAgIGlmIChtaXNzaW5nU29tZXRoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVjaG8ncyBsb2dnZXIgKHZhbHVlOiAke2xvZ2dlcn0pIG11c3QgaW1wbGVtZW50IHRoZXNlIGZ1bmN0aW9uczogJHtsb2dGbnMuam9pbignLCAnKX0gKHdoaWNoIG11c3QgYWxsIGJlIGZ1bmN0aW9uIG5hbWVzIGFzIHN0cmluZ3MpYCk7XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gZ2V0KG5hbWUpIHtcbiAgaWYgKGlzLnVuZGVmaW5lZChuYW1lKSkge1xuICAgIHJldHVybiBlY2hvcztcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZWNob3NbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlKG5hbWUpIHtcbiAgaWYgKGlzLnVuZGVmaW5lZChuYW1lKSkge1xuICAgIGVjaG9zID0ge307XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIGVjaG9zW25hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuYWJsZWQobmV3U3RhdGUpIHtcbiAgcmV0dXJuIGdsb2JhbGx5RW5hYmxlZCA9IHNldEVuYWJsZWQoZ2xvYmFsbHlFbmFibGVkLCBuZXdTdGF0ZSk7XG59XG5cbmZ1bmN0aW9uIHJhbmsobmV3UmFuaykge1xuICByZXR1cm4gY3VycmVudFJhbmsgPSBzZXRSYW5rKGN1cnJlbnRSYW5rLCBuZXdSYW5rKTtcbn1cblxuLy8gbWFrZSBkZXZlbG9wZXJzIGhhcHB5XG5jcmVhdGUuZGlzcGxheU5hbWUgPSAnRWNoby5jcmVhdGU6IE1ha2VzIGEgbmV3IGluc3RhbmNlIG9mIEVjaG8nO1xuZ2V0LmRpc3BsYXlOYW1lID0gJ0dldCBhbiBlY2hvIGxvZ2dlciBieSBuYW1lJztcbnJlbW92ZS5kaXNwbGF5TmFtZSA9ICdSZW1vdmUgYW4gZWNobyBsb2dnZXInO1xucmFuay5kaXNwbGF5TmFtZSA9ICdTZXQgdGhlIGdsb2JhbCBFY2hvIHJhbmsuIE11c3QgYmUgYSBudW1iZXIgMC01IGluY2x1c2l2ZS4gMCBpcyBsZXNzIGxvZ3MsIDUgaXMgbW9yZS4nO1xuXG5cbi8vIE1haW4gZXhwb3J0XG5leHBvcnQgZGVmYXVsdCBFY2hvO1xuXG5cblxuLy8gZnVuY3Rpb25zIGRlY2xhcmF0aW9uc1xuZnVuY3Rpb24gYWRkQ29sb3IoYXJncywgY29sb3IpIHtcbiAgaWYgKCFpc0lFICYmIGNvbG9yICYmICFpcy51bmRlZmluZWQoYXJnc1swXSkpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCBjb2xvcik7XG4gICAgYXJnc1swXSA9ICclYycgKyBhcmdzWzBdO1xuICB9XG4gIHJldHVybiBhcmdzO1xufVxuXG5mdW5jdGlvbiBoaWdoRW5vdWdoUmFuayhyYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA+PSByYW5rO1xufVxuXG5mdW5jdGlvbiBzZXRSYW5rKG9yaWdpbmFsUmFuaywgbmV3UmFuaykge1xuICBpZiAoIWlzLnVuZGVmaW5lZChuZXdSYW5rKSkge1xuICAgIGNoZWNrUmFuayhuZXdSYW5rKTtcbiAgICBvcmlnaW5hbFJhbmsgPSBuZXdSYW5rO1xuICB9XG4gIHJldHVybiBvcmlnaW5hbFJhbms7XG59XG5cbmZ1bmN0aW9uIHNldEVuYWJsZWQob3JpZ2luYWxTdGF0ZSwgbmV3U3RhdGUpIHtcbiAgaWYgKCFpcy51bmRlZmluZWQobmV3U3RhdGUpKSB7XG4gICAgaWYgKCFpcy5ib29sZWFuKG5ld1N0YXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvLmVuYWJsZWQgbXVzdCBwYXNzIG5vdGhpbmcgb3IgYSBib29sZWFuLiBcIiR7bmV3U3RhdGV9XCIgd2FzIHBhc3NlZGApO1xuICAgIH1cbiAgICBvcmlnaW5hbFN0YXRlID0gbmV3U3RhdGU7XG4gIH1cbiAgcmV0dXJuIG9yaWdpbmFsU3RhdGU7XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmFuayhyYW5rKSB7XG4gIGlmICghaXMubnVtYmVyKHJhbmspIHx8IHJhbmsgPCAwIHx8IHJhbmsgPiA1KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGVjaG8gcmFuayAodmFsdWU6ICR7cmFua30pIG11c3QgYmUgbnVtYmVycyBiZXR3ZWVuIDAgYW5kIDUgKGluY2x1c2l2ZSkuIDAgaXMgbGVzcyBsb2dzLCA1IGlzIG1vcmUuYFxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJlY29uZmlndXJlZExvZ2dpbmdTdGF0ZSgpIHtcbiAgdmFyIGVuYWJsZUxvZ1ZhbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0VuYWJsZUxvZycpO1xuICB2YXIgZGlzYWJsZUxvZ1ZhbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0Rpc2FibGVMb2cnKTtcbiAgdmFyIGdsb2JhbGx5RW5hYmxlZCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0VuYWJsZWQnKTtcbiAgdmFyIGFsbCA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0FsbCcpO1xuICB2YXIgcmFuayA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob1JhbmsnKTtcbiAgdmFyIGVuYWJsZVF1ZXJ5UGFyYW1Mb2dzID0gaXMuc3RyaW5nKGVuYWJsZUxvZ1ZhbCkgPyBlbmFibGVMb2dWYWwuc3BsaXQoJywnKSA6IFtdO1xuICB2YXIgZGlzYWJsZVF1ZXJ5UGFyYW1Mb2dzID0gaXMuc3RyaW5nKGRpc2FibGVMb2dWYWwpID8gZGlzYWJsZUxvZ1ZhbC5zcGxpdCgnLCcpIDogW107XG4gIHZhciBzdGF0ZSA9IHdpbmRvdy5lY2hvTG9nZ2luZyB8fCB7fTtcbiAgYWxsID0gc3RhdGUudGVzdE1vZGUgPT09IHRydWUgPyBmYWxzZSA6IGFsbDtcbiAgdmFyIGRvQWxsID0gaXMuYm9vbGVhbihhbGwpO1xuICBzdGF0ZS5hbGwgPSBkb0FsbCA/IHN0YXRlLmFsbCA6IGFsbDtcbiAgc3RhdGUuZW5hYmxlZCA9IGRvQWxsID8gc3RhdGUuYWxsIDogaXMuYm9vbGVhbihnbG9iYWxseUVuYWJsZWQpID8gc3RhdGUuZW5hYmxlZCA6IGdsb2JhbGx5RW5hYmxlZDtcbiAgc3RhdGUucmFuayA9IHJhbms7XG5cbiAgZW5hYmxlUXVlcnlQYXJhbUxvZ3MuZm9yRWFjaChmdW5jdGlvbihsb2cpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICBzdGF0ZVtsb2ddID0gZG9BbGwgPyBzdGF0ZS5hbGwgOiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgZGlzYWJsZVF1ZXJ5UGFyYW1Mb2dzLmZvckVhY2goZnVuY3Rpb24obG9nKSB7XG4gICAgaWYgKGxvZykge1xuICAgICAgc3RhdGVbbG9nXSA9IGRvQWxsID8gc3RhdGUuYWxsIDogZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGdldFBhcmFtZXRlckJ5TmFtZShuYW1lKSB7XG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknLCAnaScpO1xuICB2YXIgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoIHx8IGxvY2F0aW9uLmhhc2gpO1xuICBpZiAocmVzdWx0cykge1xuICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4gICAgaWYgKHZhbCA9PT0gJ3RydWUnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSBpZiAoaXNOdW1lcmljKHZhbCkpIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5mdW5jdGlvbiBpc051bWVyaWMobikge1xuICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pO1xufVxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvZWNoby5qc1xuICoqLyJdLCJzb3VyY2VSb290IjoiIiwiZmlsZSI6ImRpc3QvZWNoby5qcyJ9