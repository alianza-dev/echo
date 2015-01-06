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
	
	var currentRank = 5;
	var is = {};
	["undefined", "string", { name: "fn", type: "function" }, "boolean", "number"].forEach(function (name) {
	  is[name.name || name] = function (val) {
	    return typeof val === (name.type || name);
	  };
	});
	var enabledByParam = getParameterByName("echoEnabled");
	var globallyEnabled = is.boolean(enabledByParam) ? enabledByParam : true;
	var echos = {};
	var preconfiguredLoggingState = getPreconfiguredLoggingState();
	var Echo = { create: create, get: get, remove: remove, rank: rank, enabled: enabled };
	
	function create(name, _ref) {
	  var rank = _ref.rank;
	  var defaultColor = _ref.defaultColor;
	  var colors = _ref.colors;
	  var enabled = _ref.enabled;
	  var logger = _ref.logger;
	  var logFns = _ref.logFns;
	  // note, 6to5 doesn't support destructuring assignment default values
	  // once that happens, this will look prettier :-)
	  var presetState = preconfiguredLoggingState[name];
	  enabled = !is.undefined(presetState) ? presetState : !is.undefined(enabled) ? enabled : true;
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
	    if (!is.undefined(echos[name])) {
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
	  var enableQueryParamLogs = is.string(enableLogVal) ? enableLogVal.split(",") : [];
	  var disableQueryParamLogs = is.string(disableLogVal) ? disableLogVal.split(",") : [];
	  var state = window.echoLogging || {};
	
	  enableQueryParamLogs.forEach(function (log) {
	    if (log) {
	      state[log] = true;
	    }
	  });
	
	  disableQueryParamLogs.forEach(function (log) {
	    if (log) {
	      state[log] = false;
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
	    } else {
	      return val;
	    }
	  } else {
	    return "";
	  }
	}

/***/ }
/******/ ])
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA1OGZjMGY3Y2U0MzYxYTE4Yjc2MCIsIndlYnBhY2s6Ly8vLi9zcmMvZWNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQSxLQUFJLElBQUksR0FBRyxDQUFDLFlBQU07QUFDaEIsT0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDcEMsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RCxHQUFHLENBQUM7O0FBRUwsS0FBTSxNQUFNLEdBQUc7QUFDYixRQUFLLEVBQUUsYUFBYTtBQUNwQixTQUFNLEVBQUUscUJBQXFCO0FBQzdCLE9BQUksRUFBRSxzQkFBc0I7QUFDNUIsTUFBRyxFQUFFLGVBQWU7QUFDcEIsT0FBSSxFQUFFLGVBQWU7RUFDdEIsQ0FBQztBQUNGLEtBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxLQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDcEIsS0FBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO0FBQ1os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QUFDN0QsU0FBSSxHQUFHLEtBQUssTUFBTSxFQUFFO0FBQ2xCLGNBQU8sSUFBSSxDQUFDO01BQ2IsTUFBTSxJQUFJLEdBQUcsS0FBSyxPQUFPLEVBQUU7QUFDMUIsY0FBTyxLQUFLLENBQUM7TUFDZCxNQUFNO0FBQ0wsY0FBTyxHQUFHLENBQUM7TUFDWjtJQUNGLE1BQU07QUFDTCxZQUFPLEVBQUUsQ0FBQztJQUNYIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJFY2hvXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkVjaG9cIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCA1OGZjMGY3Y2U0MzYxYTE4Yjc2MFxuICoqLyIsIi8qKlxuICogQG5hbWUgZWNob1xuICogQGxpY2Vuc2UgZWNoby5qcyBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIEBjb3B5cmlnaHQgKGMpIDIwMTUgQWxpYW56YSBJbmMuXG4gKiBAYXV0aG9yIEtlbnQgQy4gRG9kZHMgPGtlbnRAZG9kZHNmYW1pbHkudXM+XG4gKi9cblxuLy8gdmFyaWFibGUgYXNzaWdubWVudFxudmFyIGlzSUUgPSAoKCkgPT4ge1xuICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgcmV0dXJuIHVhLmluZGV4T2YoJ01TSUUgJykgPiAwIHx8IHVhLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwO1xufSkoKTtcblxuY29uc3QgQ09MT1JTID0ge1xuICBncmVlbjogJ2NvbG9yOmdyZWVuJyxcbiAgcHVycGxlOiAnY29sb3I6cmViZWNjYXB1cnBsZScsXG4gIGJsdWU6ICdjb2xvcjpjb3JuZmxvd2VyYmx1ZScsXG4gIHJlZDogJ2NvbG9yOmNyaW1zb24nLFxuICBncmF5OiAnY29sb3I6IzkxOTE5MSdcbn07XG5jb25zdCBMT0dfRk5TID0gWydsb2cnLCAnaW5mbycsICdkZWJ1ZycsICd3YXJuJywgJ2Vycm9yJ107XG5cbnZhciBjdXJyZW50UmFuayA9IDU7XG52YXIgaXMgPSB7fTtcblsndW5kZWZpbmVkJywgJ3N0cmluZycsIHtuYW1lOiAnZm4nLCB0eXBlOiAnZnVuY3Rpb24nfSwgJ2Jvb2xlYW4nLCAnbnVtYmVyJ10uZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gIGlzW25hbWUubmFtZSB8fCBuYW1lXSA9ICh2YWwpID0+IHR5cGVvZiB2YWwgPT09IChuYW1lLnR5cGUgfHwgbmFtZSk7XG59KTtcbnZhciBlbmFibGVkQnlQYXJhbSA9IGdldFBhcmFtZXRlckJ5TmFtZSgnZWNob0VuYWJsZWQnKTtcbnZhciBnbG9iYWxseUVuYWJsZWQgPSBpcy5ib29sZWFuKGVuYWJsZWRCeVBhcmFtKSA/IGVuYWJsZWRCeVBhcmFtIDogdHJ1ZTtcbnZhciBlY2hvcyA9IHt9O1xudmFyIHByZWNvbmZpZ3VyZWRMb2dnaW5nU3RhdGUgPSBnZXRQcmVjb25maWd1cmVkTG9nZ2luZ1N0YXRlKCk7XG52YXIgRWNobyA9IHsgY3JlYXRlLCBnZXQsIHJlbW92ZSwgcmFuaywgZW5hYmxlZCB9O1xuXG5mdW5jdGlvbiBjcmVhdGUobmFtZSwge3JhbmssIGRlZmF1bHRDb2xvciwgY29sb3JzLCBlbmFibGVkLCBsb2dnZXIsIGxvZ0Zuc30pIHtcbiAgLy8gbm90ZSwgNnRvNSBkb2Vzbid0IHN1cHBvcnQgZGVzdHJ1Y3R1cmluZyBhc3NpZ25tZW50IGRlZmF1bHQgdmFsdWVzXG4gIC8vIG9uY2UgdGhhdCBoYXBwZW5zLCB0aGlzIHdpbGwgbG9vayBwcmV0dGllciA6LSlcbiAgdmFyIHByZXNldFN0YXRlID0gcHJlY29uZmlndXJlZExvZ2dpbmdTdGF0ZVtuYW1lXTtcbiAgZW5hYmxlZCA9ICFpcy51bmRlZmluZWQocHJlc2V0U3RhdGUpID8gcHJlc2V0U3RhdGUgOiAhaXMudW5kZWZpbmVkKGVuYWJsZWQpID8gZW5hYmxlZCA6IHRydWU7XG4gIHJhbmsgPSAhaXMudW5kZWZpbmVkKHJhbmspID8gcmFuayA6IDU7XG4gIGNvbG9ycyA9ICFpcy51bmRlZmluZWQoY29sb3JzKSA/IGNvbG9ycyA6IENPTE9SUztcbiAgbG9nZ2VyID0gIWlzLnVuZGVmaW5lZChsb2dnZXIpID8gbG9nZ2VyIDogY29uc29sZTtcbiAgbG9nRm5zID0gIWlzLnVuZGVmaW5lZChsb2dGbnMpID8gbG9nRm5zIDogTE9HX0ZOUztcblxuICBjaGVja0FyZ3MobmFtZSwgcmFuaywgZGVmYXVsdENvbG9yLCBjb2xvcnMsIGxvZ2dlciwgbG9nRm5zKTtcblxuICAvLyB2YXJpYWJsZSBpbml0aWFsaXphdGlvblxuICB2YXIgY29sb3JLZXlzID0gT2JqZWN0LmtleXMoY29sb3JzKTtcblxuICAvLyBjcmVhdGUgZWNob1xuICB2YXIgZWNobyA9IHdyYXBMb2coJ2xvZycpO1xuXG4gIC8vIGFkZCBmdW5jdGlvbnNcbiAgZWNoby5yYW5rID0gZWNob1JhbmtHZXR0ZXJTZXR0ZXI7XG4gIGVjaG8uZW5hYmxlZCA9IGVjaG9FbmFibGVkR2V0dGVyU2V0dGVyO1xuXG4gIC8vIGFkZCBsb2cgZnVuY3Rpb25zIHRvIGVjaG9cbiAgbG9nRm5zLmZvckVhY2goZm5OYW1lID0+IGVjaG9bZm5OYW1lXSA9IHdyYXBMb2coZm5OYW1lKSk7XG5cbiAgLy8gbWFrZSBkZXZlbG9wZXJzIGhhcHB5XG4gIGVjaG8uZGlzcGxheU5hbWUgPSBgZWNobzogXCIke25hbWV9XCIgYWJzdHJhY3Rpb24gb24gY29uc29sZWA7XG4gIGVjaG8ucmFuay5kaXNwbGF5TmFtZSA9ICdlY2hvLnJhbms6IGdldHRlci9zZXR0ZXIgZm9yIHRoZSBjdXJyZW50IGxldmVsIG9mIGxvZ2dpbmcgKGhpZ2ggaXMgbW9yZSknO1xuICBsb2dJdC5kaXNwbGF5TmFtZSA9ICdlY2hvIGxvZyB3cmFwcGVyIHRoYXQgY2hlY2tzIHdoZXRoZXIgdGhlIGVjaG8gaXMgZW5hYmxlZCBhbmQgaWYgaXRzIHJhbmsgaXMgaGlnaCBlbm91Z2ggY29tcGFyZWQgdG8gRWNoby5yYW5rKCknO1xuICBjaGVja0FyZ3MuZGlzcGxheU5hbWUgPSAnRWNoby5jcmVhdGUgYXJnIGNoZWNrZXIgdGhhdCBlbnN1cmVzIGFsbCBhcmd1bWVudHMgYXJlIGNvcnJlY3QgYW5kIHRocm93cyBlcnJvcnMgaWYgbm90JztcblxuICAvLyBhZGQgZWNobyB0byBlY2hvc1xuICBlY2hvc1tuYW1lXSA9IGVjaG87XG5cbiAgLy8gcmV0dXJuXG4gIHJldHVybiBlY2hvO1xuXG5cbiAgLy8gZnVuY3Rpb24gZGVjbGFyYXRpb25zXG4gIGZ1bmN0aW9uIHdyYXBMb2coZm5OYW1lKSB7XG4gICAgZnVuY3Rpb24gZWNob0xvZygpIHtcbiAgICAgIGxvZ0l0KC4uLltmbk5hbWUsIGNvbG9yc1tkZWZhdWx0Q29sb3JdLCAuLi5hcmd1bWVudHNdKTtcbiAgICB9XG4gICAgZWNob0xvZy5kaXNwbGF5TmFtZSA9IGBjb25zb2xlIGFic3RyYWN0aW9uIGZvciAke25hbWV9OiR7Zm5OYW1lfWA7XG4gICAgYWRkQUxpdHRsZUNvbG9yKGZuTmFtZSwgZWNob0xvZyk7XG4gICAgcmV0dXJuIGVjaG9Mb2c7XG4gIH1cblxuICBmdW5jdGlvbiBhZGRBTGl0dGxlQ29sb3IoZm5OYW1lLCBmbikge1xuICAgIGNvbG9yS2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGNvbG9yTmFtZSkge1xuICAgICAgZm5bY29sb3JOYW1lXSA9IGZ1bmN0aW9uIGVjaG9Db2xvcmVkTG9nKCkge1xuICAgICAgICBsb2dJdCguLi5bZm5OYW1lLCBjb2xvcnNbY29sb3JOYW1lXSwgLi4uYXJndW1lbnRzXSk7XG4gICAgICB9O1xuICAgICAgZm5bY29sb3JOYW1lXS5kaXNwbGF5TmFtZSA9IGAke2NvbG9yTmFtZX0gY29sb3JlZCBjb25zb2xlIGFic3RyYWN0aW9uIGZvciAke25hbWV9OiR7Zm5OYW1lfWA7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb2dJdChmbk5hbWUsIGNvbG9yLCAuLi5hcmdzKSB7XG4gICAgaWYgKGdsb2JhbGx5RW5hYmxlZCAmJiBlbmFibGVkICYmIGhpZ2hFbm91Z2hSYW5rKHJhbmspKSB7XG4gICAgICBhcmdzID0gYWRkQ29sb3IoYXJncywgY29sb3IpO1xuICAgICAgcmV0dXJuIGxvZ2dlcltmbk5hbWVdLmFwcGx5KGxvZ2dlciwgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZWNob1JhbmtHZXR0ZXJTZXR0ZXIobmV3UmFuaykge1xuICAgIHJldHVybiByYW5rID0gc2V0UmFuayhyYW5rLCBuZXdSYW5rKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVjaG9FbmFibGVkR2V0dGVyU2V0dGVyKG5ld1N0YXRlKSB7XG4gICAgcmV0dXJuIGVuYWJsZWQgPSBzZXRFbmFibGVkKGVuYWJsZWQsIG5ld1N0YXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrQXJncygpIHtcbiAgICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2VjaG8gbmFtZSBtdXN0IGJlIGRlZmluZWQnKTtcbiAgICB9XG4gICAgaWYgKCFpcy51bmRlZmluZWQoZWNob3NbbmFtZV0pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVjaG8gYnkgdGhlIG5hbWUgb2YgJHtuYW1lfSBhbHJlYWR5IGV4aXN0cy4gQ2Fubm90IGNyZWF0ZSBhbm90aGVyIG9mIHRoZSBzYW1lIG5hbWUuYCk7XG4gICAgfVxuICAgIGNoZWNrUmFuayhyYW5rKTtcbiAgICBpZiAoIWlzLnVuZGVmaW5lZChkZWZhdWx0Q29sb3IpICYmICFpcy5zdHJpbmcoY29sb3JzW2RlZmF1bHRDb2xvcl0pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVjaG8gZGVmYXVsdENvbG9yICh2YWx1ZTogJHtkZWZhdWx0Q29sb3J9KSBtdXN0IGJlIGEgc3RyaW5nIHNwZWNpZmllZCBpbiBjb2xvcnMgKCR7T2JqZWN0LmtleXMoY29sb3JzKX0pYCk7XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShsb2dGbnMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2xvZ0ZucyBtdXN0IGJlIGFuIGFycmF5IG9mIHN0cmluZ3MnKTtcbiAgICB9XG4gICAgdmFyIG1pc3NpbmdTb21ldGhpbmcgPSBsb2dGbnMuc29tZShmdW5jdGlvbihsb2dGbikge1xuICAgICAgcmV0dXJuICFpcy5zdHJpbmcobG9nRm4pIHx8ICFpcy5mbihsb2dnZXJbbG9nRm5dKTtcbiAgICB9KTtcbiAgICBpZiAobWlzc2luZ1NvbWV0aGluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvJ3MgbG9nZ2VyICh2YWx1ZTogJHtsb2dnZXJ9KSBtdXN0IGltcGxlbWVudCB0aGVzZSBmdW5jdGlvbnM6ICR7bG9nRm5zLmpvaW4oJywgJyl9ICh3aGljaCBtdXN0IGFsbCBiZSBmdW5jdGlvbiBuYW1lcyBhcyBzdHJpbmdzKWApO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGdldChuYW1lKSB7XG4gIGlmIChpcy51bmRlZmluZWQobmFtZSkpIHtcbiAgICByZXR1cm4gZWNob3M7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVjaG9zW25hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gIGlmIChpcy51bmRlZmluZWQobmFtZSkpIHtcbiAgICBlY2hvcyA9IHt9O1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSBlY2hvc1tuYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmFibGVkKG5ld1N0YXRlKSB7XG4gIHJldHVybiBnbG9iYWxseUVuYWJsZWQgPSBzZXRFbmFibGVkKGdsb2JhbGx5RW5hYmxlZCwgbmV3U3RhdGUpO1xufVxuXG5mdW5jdGlvbiByYW5rKG5ld1JhbmspIHtcbiAgcmV0dXJuIGN1cnJlbnRSYW5rID0gc2V0UmFuayhjdXJyZW50UmFuaywgbmV3UmFuayk7XG59XG5cbi8vIG1ha2UgZGV2ZWxvcGVycyBoYXBweVxuY3JlYXRlLmRpc3BsYXlOYW1lID0gJ0VjaG8uY3JlYXRlOiBNYWtlcyBhIG5ldyBpbnN0YW5jZSBvZiBFY2hvJztcbmdldC5kaXNwbGF5TmFtZSA9ICdHZXQgYW4gZWNobyBsb2dnZXIgYnkgbmFtZSc7XG5yZW1vdmUuZGlzcGxheU5hbWUgPSAnUmVtb3ZlIGFuIGVjaG8gbG9nZ2VyJztcbnJhbmsuZGlzcGxheU5hbWUgPSAnU2V0IHRoZSBnbG9iYWwgRWNobyByYW5rLiBNdXN0IGJlIGEgbnVtYmVyIDAtNSBpbmNsdXNpdmUuIDAgaXMgbGVzcyBsb2dzLCA1IGlzIG1vcmUuJztcblxuXG4vLyBNYWluIGV4cG9ydFxuZXhwb3J0IGRlZmF1bHQgRWNobztcblxuXG5cbi8vIGZ1bmN0aW9ucyBkZWNsYXJhdGlvbnNcbmZ1bmN0aW9uIGFkZENvbG9yKGFyZ3MsIGNvbG9yKSB7XG4gIGlmICghaXNJRSAmJiBjb2xvcikge1xuICAgIGFyZ3Muc3BsaWNlKDEsIDAsIGNvbG9yKTtcbiAgICBhcmdzWzBdID0gJyVjJyArIGFyZ3NbMF07XG4gIH1cbiAgcmV0dXJuIGFyZ3M7XG59XG5cbmZ1bmN0aW9uIGhpZ2hFbm91Z2hSYW5rKHJhbmspIHtcbiAgcmV0dXJuIGN1cnJlbnRSYW5rID49IHJhbms7XG59XG5cbmZ1bmN0aW9uIHNldFJhbmsob3JpZ2luYWxSYW5rLCBuZXdSYW5rKSB7XG4gIGlmICghaXMudW5kZWZpbmVkKG5ld1JhbmspKSB7XG4gICAgY2hlY2tSYW5rKG5ld1JhbmspO1xuICAgIG9yaWdpbmFsUmFuayA9IG5ld1Jhbms7XG4gIH1cbiAgcmV0dXJuIG9yaWdpbmFsUmFuaztcbn1cblxuZnVuY3Rpb24gc2V0RW5hYmxlZChvcmlnaW5hbFN0YXRlLCBuZXdTdGF0ZSkge1xuICBpZiAoIWlzLnVuZGVmaW5lZChuZXdTdGF0ZSkpIHtcbiAgICBpZiAoIWlzLmJvb2xlYW4obmV3U3RhdGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGVjaG8uZW5hYmxlZCBtdXN0IHBhc3Mgbm90aGluZyBvciBhIGJvb2xlYW4uIFwiJHtuZXdTdGF0ZX1cIiB3YXMgcGFzc2VkYCk7XG4gICAgfVxuICAgIG9yaWdpbmFsU3RhdGUgPSBuZXdTdGF0ZTtcbiAgfVxuICByZXR1cm4gb3JpZ2luYWxTdGF0ZTtcbn1cblxuZnVuY3Rpb24gY2hlY2tSYW5rKHJhbmspIHtcbiAgaWYgKCFpcy5udW1iZXIocmFuaykgfHwgcmFuayA8IDAgfHwgcmFuayA+IDUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgZWNobyByYW5rICh2YWx1ZTogJHtyYW5rfSkgbXVzdCBiZSBudW1iZXJzIGJldHdlZW4gMCBhbmQgNSAoaW5jbHVzaXZlKS4gMCBpcyBsZXNzIGxvZ3MsIDUgaXMgbW9yZS5gXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRQcmVjb25maWd1cmVkTG9nZ2luZ1N0YXRlKCkge1xuICB2YXIgZW5hYmxlTG9nVmFsID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdlY2hvRW5hYmxlTG9nJyk7XG4gIHZhciBkaXNhYmxlTG9nVmFsID0gZ2V0UGFyYW1ldGVyQnlOYW1lKCdlY2hvRGlzYWJsZUxvZycpO1xuICB2YXIgZW5hYmxlUXVlcnlQYXJhbUxvZ3MgPSBpcy5zdHJpbmcoZW5hYmxlTG9nVmFsKSA/IGVuYWJsZUxvZ1ZhbC5zcGxpdCgnLCcpIDogW107XG4gIHZhciBkaXNhYmxlUXVlcnlQYXJhbUxvZ3MgPSBpcy5zdHJpbmcoZGlzYWJsZUxvZ1ZhbCkgPyBkaXNhYmxlTG9nVmFsLnNwbGl0KCcsJykgOiBbXTtcbiAgdmFyIHN0YXRlID0gd2luZG93LmVjaG9Mb2dnaW5nIHx8IHt9O1xuXG4gIGVuYWJsZVF1ZXJ5UGFyYW1Mb2dzLmZvckVhY2goZnVuY3Rpb24obG9nKSB7XG4gICAgaWYgKGxvZykge1xuICAgICAgc3RhdGVbbG9nXSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICBkaXNhYmxlUXVlcnlQYXJhbUxvZ3MuZm9yRWFjaChmdW5jdGlvbihsb2cpIHtcbiAgICBpZiAobG9nKSB7XG4gICAgICBzdGF0ZVtsb2ddID0gZmFsc2U7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGdldFBhcmFtZXRlckJ5TmFtZShuYW1lKSB7XG4gIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcbiAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknLCAnaScpO1xuICB2YXIgcmVzdWx0cyA9IHJlZ2V4LmV4ZWMobG9jYXRpb24uc2VhcmNoIHx8IGxvY2F0aW9uLmhhc2gpO1xuICBpZiAocmVzdWx0cykge1xuICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXS5yZXBsYWNlKC9cXCsvZywgJyAnKSk7XG4gICAgaWYgKHZhbCA9PT0gJ3RydWUnKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHZhbCA9PT0gJ2ZhbHNlJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2VjaG8uanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJkaXN0L2VjaG8uanMifQ==