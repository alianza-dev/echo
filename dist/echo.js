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
	var globallyEnabled = true;
	var is = {};
	["undefined", "string", { name: "fn", type: "function" }, "boolean", "number"].forEach(function (name) {
	  is[name.name || name] = function (val) {
	    return typeof val === (name.type || name);
	  };
	});
	var echos = {};
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
	  rank = !is.undefined(rank) ? rank : 5;
	  enabled = !is.undefined(enabled) ? enabled : true;
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
	
	  logFns.forEach(logFns, function (fnName) {
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

/***/ }
/******/ ])
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBlYTUwZDc2OTA5YjRlNTk3N2YyMCIsIndlYnBhY2s6Ly8vLi9zcmMvZWNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQSxLQUFJLElBQUksR0FBRyxDQUFDLFlBQU07QUFDaEIsT0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDcEMsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RCxHQUFHLENBQUM7O0FBRUwsS0FBTSxNQUFNLEdBQUc7QUFDYixRQUFLLEVBQUUsYUFBYTtBQUNwQixTQUFNLEVBQUUscUJBQXFCO0FBQzdCLE9BQUksRUFBRSxzQkFBc0I7QUFDNUIsTUFBRyxFQUFFLGVBQWU7QUFDcEIsT0FBSSxFQUFFLGVBQWU7RUFDdEIsQ0FBQztBQUNGLEtBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxLQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFDcEIsS0FBSSxlQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzNCLEtBQUksRUFBRSxHQUFHLEVBQUUsQ0FBQztBQUNaLEVBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBQyxFQUFFLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDbEcsS0FBRSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsVUFBQyxHQUFHO1lBQUssT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUM7SUFBQSxDQUFDO0VBQ3JFLENBQUMsQ0FBQztBQUNILEtBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNmLEtBQUksSUFBSSxHQUFHLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBRSxHQUFHLEVBQUgsR0FBRyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUUsSUFBSSxFQUFKLElBQUksRUFBRSxPQUFPLEVBQVAsT0FBTyxFQUFFLENBQUM7O0FBRWxELFVBQVMsTUFBTSxDQUFDLElBQUksUUFBeUQ7T0FBdEQsSUFBSSxRQUFKLElBQUk7T0FBRSxZQUFZLFFBQVosWUFBWTtPQUFFLE1BQU0sUUFBTixNQUFNO09BQUUsT0FBTyxRQUFQLE9BQU87T0FBRSxNQUFNLFFBQU4sTUFBTTtPQUFFLE1BQU0sUUFBTixNQUFNOzs7QUFHeEUsT0FBSSxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ3RDLFVBQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNsRCxTQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDakQsU0FBTSxHQUFHLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxNQUFNLEdBQUcsT0FBTyxDQUFDO0FBQ2xELFNBQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxHQUFHLE9BQU8sQ0FBQzs7QUFFbEQsWUFBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7OztBQUc1RCxPQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7QUFHcEMsT0FBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDOzs7QUFHMUIsT0FBSSxDQUFDLElBQUksR0FBRyxvQkFBb0IsQ0FBQztBQUNqQyxPQUFJLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDOzs7O0FBSXZDLFNBQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQUMsTUFBTTtZQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO0lBQUEsQ0FBQyxDQUFDOzs7QUFHbkUsT0FBSSxDQUFDLFdBQVcsZ0JBQWEsSUFBSSw4QkFBMEIsQ0FBQztBQUM1RCxPQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsR0FBRywwRUFBMEUsQ0FBQztBQUNuRyxRQUFLLENBQUMsV0FBVyxHQUFHLGlIQUFpSCxDQUFDO0FBQ3RJLFlBQVMsQ0FBQyxXQUFXLEdBQUcseUZBQXlGLENBQUM7OztBQUdsSCxRQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDOzs7QUFHbkIsVUFBTyxJQUFJLENBQUM7Ozs7QUFJWixZQUFTLE9BQU8sQ0FBQyxNQUFNLEVBQUU7QUFDdkIsY0FBUyxPQUFPLEdBQUc7QUFDakIsWUFBSyxjQUFLLE1BQU0sRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLHFCQUFLLFNBQVMsR0FBRSxDQUFDO01BQ3hEO0FBQ0QsWUFBTyxDQUFDLFdBQVcsZ0NBQThCLElBQUksU0FBSSxNQUFRLENBQUM7QUFDbEUsb0JBQWUsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDakMsWUFBTyxPQUFPLENBQUM7SUFDaEI7O0FBRUQsWUFBUyxlQUFlLENBQUMsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUNuQyxjQUFTLENBQUMsT0FBTyxDQUFDLFVBQVMsU0FBUyxFQUFFO0FBQ3BDLFNBQUUsQ0FBQyxTQUFTLENBQUMsR0FBRyxTQUFTLGNBQWMsR0FBRztBQUN4QyxjQUFLLGNBQUssTUFBTSxFQUFFLE1BQU0sQ0FBQyxTQUFTLENBQUMscUJBQUssU0FBUyxHQUFFLENBQUM7UUFDckQsQ0FBQztBQUNGLFNBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLFFBQU0sU0FBUyx5Q0FBb0MsSUFBSSxTQUFJLE1BQVEsQ0FBQztNQUM5RixDQUFDLENBQUM7SUFDSjs7QUFFRCxZQUFTLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFXO1NBQU4sSUFBSTs7QUFDbkMsU0FBSSxlQUFlLElBQUksT0FBTyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0RCxXQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUM3QixjQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO01BQzNDO0lBQ0Y7O0FBRUQsWUFBUyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUU7QUFDckMsWUFBTyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0Qzs7QUFFRCxZQUFTLHVCQUF1QixDQUFDLFFBQVEsRUFBRTtBQUN6QyxZQUFPLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hEOztBQUVELFlBQVMsU0FBUyxHQUFHO0FBQ25CLFNBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0QixhQUFNLElBQUksS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7TUFDOUM7QUFDRCxTQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRTtBQUM5QixhQUFNLElBQUksS0FBSywwQkFBd0IsSUFBSSw4REFBMkQsQ0FBQztNQUN4RztBQUNELGNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNoQixTQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUU7QUFDbkUsYUFBTSxJQUFJLEtBQUssZ0NBQThCLFlBQVksZ0RBQTJDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQUksQ0FBQztNQUM3SDtBQUNELFNBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFO0FBQzFCLGFBQU0sSUFBSSxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztNQUN2RDtBQUNELFNBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFTLEtBQUssRUFBRTtBQUNqRCxjQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7TUFDbkQsQ0FBQyxDQUFDO0FBQ0gsU0FBSSxnQkFBZ0IsRUFBRTtBQUNwQixhQUFNLElBQUksS0FBSyw0QkFBMEIsTUFBTSwwQ0FBcUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsb0RBQWlELENBQUM7TUFDeEo7SUFDRjtFQUNGOzs7QUFHRCxVQUFTLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDakIsT0FBSSxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3RCLFlBQU8sS0FBSyxDQUFDO0lBQ2QsTUFBTTtBQUNMLFlBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BCO0VBQ0Y7O0FBRUQsVUFBUyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ3BCLE9BQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN0QixVQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ1osTUFBTTtBQUNMLFlBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3BCO0VBQ0Y7O0FBRUQsVUFBUyxPQUFPLENBQUMsUUFBUSxFQUFFO0FBQ3pCLFVBQU8sZUFBZSxHQUFHLFVBQVUsQ0FBQyxlQUFlLEVBQUUsUUFBUSxDQUFDLENBQUM7RUFDaEU7O0FBRUQsVUFBUyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ3JCLFVBQU8sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7RUFDcEQ7OztBQUdELE9BQU0sQ0FBQyxXQUFXLEdBQUcsMkNBQTJDLENBQUM7QUFDakUsSUFBRyxDQUFDLFdBQVcsR0FBRyw0QkFBNEIsQ0FBQztBQUMvQyxPQUFNLENBQUMsV0FBVyxHQUFHLHVCQUF1QixDQUFDO0FBQzdDLEtBQUksQ0FBQyxXQUFXLEdBQUcsc0ZBQXNGLENBQUM7Ozs7a0JBSTNGLElBQUk7Ozs7OztBQUtuQixVQUFTLFFBQVEsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFO0FBQzdCLE9BQUksQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFO0FBQ2xCLFNBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztBQUN6QixTQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQjtBQUNELFVBQU8sSUFBSSxDQUFDO0VBQ2I7O0FBRUQsVUFBUyxjQUFjLENBQUMsSUFBSSxFQUFFO0FBQzVCLFVBQU8sV0FBVyxJQUFJLElBQUksQ0FBQztFQUM1Qjs7QUFFRCxVQUFTLE9BQU8sQ0FBQyxZQUFZLEVBQUUsT0FBTyxFQUFFO0FBQ3RDLE9BQUksQ0FBQyxFQUFFLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQzFCLGNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNuQixpQkFBWSxHQUFHLE9BQU8sQ0FBQztJQUN4QjtBQUNELFVBQU8sWUFBWSxDQUFDO0VBQ3JCOztBQUVELFVBQVMsVUFBVSxDQUFDLGFBQWEsRUFBRSxRQUFRLEVBQUU7QUFDM0MsT0FBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDM0IsU0FBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDekIsYUFBTSxJQUFJLEtBQUsscURBQWtELFFBQVEsbUJBQWUsQ0FBQztNQUMxRjtBQUNELGtCQUFhLEdBQUcsUUFBUSxDQUFDO0lBQzFCO0FBQ0QsVUFBTyxhQUFhLENBQUM7RUFDdEI7O0FBRUQsVUFBUyxTQUFTLENBQUMsSUFBSSxFQUFFO0FBQ3ZCLE9BQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsRUFBRTtBQUM1QyxXQUFNLElBQUksS0FBSyx3QkFDUSxJQUFJLCtFQUMxQixDQUFDO0lBQ0giLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIkVjaG9cIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wiRWNob1wiXSA9IGZhY3RvcnkoKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKCkge1xucmV0dXJuIFxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvblxuICoqLyIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIGVhNTBkNzY5MDliNGU1OTc3ZjIwXG4gKiovIiwiLyoqXG4gKiBAbmFtZSBlY2hvXG4gKiBAbGljZW5zZSBlY2hvLmpzIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuICogQGNvcHlyaWdodCAoYykgMjAxNSBBbGlhbnphIEluYy5cbiAqIEBhdXRob3IgS2VudCBDLiBEb2RkcyA8a2VudEBkb2Rkc2ZhbWlseS51cz5cbiAqL1xuXG4vLyB2YXJpYWJsZSBhc3NpZ25tZW50XG52YXIgaXNJRSA9ICgoKSA9PiB7XG4gIHZhciB1YSA9IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50O1xuICByZXR1cm4gdWEuaW5kZXhPZignTVNJRSAnKSA+IDAgfHwgdWEuaW5kZXhPZignVHJpZGVudC8nKSA+IDA7XG59KSgpO1xuXG5jb25zdCBDT0xPUlMgPSB7XG4gIGdyZWVuOiAnY29sb3I6Z3JlZW4nLFxuICBwdXJwbGU6ICdjb2xvcjpyZWJlY2NhcHVycGxlJyxcbiAgYmx1ZTogJ2NvbG9yOmNvcm5mbG93ZXJibHVlJyxcbiAgcmVkOiAnY29sb3I6Y3JpbXNvbicsXG4gIGdyYXk6ICdjb2xvcjojOTE5MTkxJ1xufTtcbmNvbnN0IExPR19GTlMgPSBbJ2xvZycsICdpbmZvJywgJ2RlYnVnJywgJ3dhcm4nLCAnZXJyb3InXTtcblxudmFyIGN1cnJlbnRSYW5rID0gNTtcbnZhciBnbG9iYWxseUVuYWJsZWQgPSB0cnVlO1xudmFyIGlzID0ge307XG5bJ3VuZGVmaW5lZCcsICdzdHJpbmcnLCB7bmFtZTogJ2ZuJywgdHlwZTogJ2Z1bmN0aW9uJ30sICdib29sZWFuJywgJ251bWJlciddLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICBpc1tuYW1lLm5hbWUgfHwgbmFtZV0gPSAodmFsKSA9PiB0eXBlb2YgdmFsID09PSAobmFtZS50eXBlIHx8IG5hbWUpO1xufSk7XG52YXIgZWNob3MgPSB7fTtcbnZhciBFY2hvID0geyBjcmVhdGUsIGdldCwgcmVtb3ZlLCByYW5rLCBlbmFibGVkIH07XG5cbmZ1bmN0aW9uIGNyZWF0ZShuYW1lLCB7cmFuaywgZGVmYXVsdENvbG9yLCBjb2xvcnMsIGVuYWJsZWQsIGxvZ2dlciwgbG9nRm5zfSkge1xuICAvLyBub3RlLCA2dG81IGRvZXNuJ3Qgc3VwcG9ydCBkZXN0cnVjdHVyaW5nIGFzc2lnbm1lbnQgZGVmYXVsdCB2YWx1ZXNcbiAgLy8gb25jZSB0aGF0IGhhcHBlbnMsIHRoaXMgd2lsbCBsb29rIHByZXR0aWVyIDotKVxuICByYW5rID0gIWlzLnVuZGVmaW5lZChyYW5rKSA/IHJhbmsgOiA1O1xuICBlbmFibGVkID0gIWlzLnVuZGVmaW5lZChlbmFibGVkKSA/IGVuYWJsZWQgOiB0cnVlO1xuICBjb2xvcnMgPSAhaXMudW5kZWZpbmVkKGNvbG9ycykgPyBjb2xvcnMgOiBDT0xPUlM7XG4gIGxvZ2dlciA9ICFpcy51bmRlZmluZWQobG9nZ2VyKSA/IGxvZ2dlciA6IGNvbnNvbGU7XG4gIGxvZ0ZucyA9ICFpcy51bmRlZmluZWQobG9nRm5zKSA/IGxvZ0ZucyA6IExPR19GTlM7XG5cbiAgY2hlY2tBcmdzKG5hbWUsIHJhbmssIGRlZmF1bHRDb2xvciwgY29sb3JzLCBsb2dnZXIsIGxvZ0Zucyk7XG5cbiAgLy8gdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cbiAgdmFyIGNvbG9yS2V5cyA9IE9iamVjdC5rZXlzKGNvbG9ycyk7XG5cbiAgLy8gY3JlYXRlIGVjaG9cbiAgdmFyIGVjaG8gPSB3cmFwTG9nKCdsb2cnKTtcblxuICAvLyBhZGQgZnVuY3Rpb25zXG4gIGVjaG8ucmFuayA9IGVjaG9SYW5rR2V0dGVyU2V0dGVyO1xuICBlY2hvLmVuYWJsZWQgPSBlY2hvRW5hYmxlZEdldHRlclNldHRlcjtcblxuICAvLyBhZGQgbG9nIGZ1bmN0aW9ucyB0byBlY2hvXG5cbiAgbG9nRm5zLmZvckVhY2gobG9nRm5zLCAoZm5OYW1lKSA9PiBlY2hvW2ZuTmFtZV0gPSB3cmFwTG9nKGZuTmFtZSkpO1xuXG4gIC8vIG1ha2UgZGV2ZWxvcGVycyBoYXBweVxuICBlY2hvLmRpc3BsYXlOYW1lID0gYGVjaG86IFwiJHtuYW1lfVwiIGFic3RyYWN0aW9uIG9uIGNvbnNvbGVgO1xuICBlY2hvLnJhbmsuZGlzcGxheU5hbWUgPSAnZWNoby5yYW5rOiBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgY3VycmVudCBsZXZlbCBvZiBsb2dnaW5nIChoaWdoIGlzIG1vcmUpJztcbiAgbG9nSXQuZGlzcGxheU5hbWUgPSAnZWNobyBsb2cgd3JhcHBlciB0aGF0IGNoZWNrcyB3aGV0aGVyIHRoZSBlY2hvIGlzIGVuYWJsZWQgYW5kIGlmIGl0cyByYW5rIGlzIGhpZ2ggZW5vdWdoIGNvbXBhcmVkIHRvIEVjaG8ucmFuaygpJztcbiAgY2hlY2tBcmdzLmRpc3BsYXlOYW1lID0gJ0VjaG8uY3JlYXRlIGFyZyBjaGVja2VyIHRoYXQgZW5zdXJlcyBhbGwgYXJndW1lbnRzIGFyZSBjb3JyZWN0IGFuZCB0aHJvd3MgZXJyb3JzIGlmIG5vdCc7XG5cbiAgLy8gYWRkIGVjaG8gdG8gZWNob3NcbiAgZWNob3NbbmFtZV0gPSBlY2hvO1xuXG4gIC8vIHJldHVyblxuICByZXR1cm4gZWNobztcblxuXG4gIC8vIGZ1bmN0aW9uIGRlY2xhcmF0aW9uc1xuICBmdW5jdGlvbiB3cmFwTG9nKGZuTmFtZSkge1xuICAgIGZ1bmN0aW9uIGVjaG9Mb2coKSB7XG4gICAgICBsb2dJdCguLi5bZm5OYW1lLCBjb2xvcnNbZGVmYXVsdENvbG9yXSwgLi4uYXJndW1lbnRzXSk7XG4gICAgfVxuICAgIGVjaG9Mb2cuZGlzcGxheU5hbWUgPSBgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIGFkZEFMaXR0bGVDb2xvcihmbk5hbWUsIGVjaG9Mb2cpO1xuICAgIHJldHVybiBlY2hvTG9nO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQUxpdHRsZUNvbG9yKGZuTmFtZSwgZm4pIHtcbiAgICBjb2xvcktleXMuZm9yRWFjaChmdW5jdGlvbihjb2xvck5hbWUpIHtcbiAgICAgIGZuW2NvbG9yTmFtZV0gPSBmdW5jdGlvbiBlY2hvQ29sb3JlZExvZygpIHtcbiAgICAgICAgbG9nSXQoLi4uW2ZuTmFtZSwgY29sb3JzW2NvbG9yTmFtZV0sIC4uLmFyZ3VtZW50c10pO1xuICAgICAgfTtcbiAgICAgIGZuW2NvbG9yTmFtZV0uZGlzcGxheU5hbWUgPSBgJHtjb2xvck5hbWV9IGNvbG9yZWQgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nSXQoZm5OYW1lLCBjb2xvciwgLi4uYXJncykge1xuICAgIGlmIChnbG9iYWxseUVuYWJsZWQgJiYgZW5hYmxlZCAmJiBoaWdoRW5vdWdoUmFuayhyYW5rKSkge1xuICAgICAgYXJncyA9IGFkZENvbG9yKGFyZ3MsIGNvbG9yKTtcbiAgICAgIHJldHVybiBsb2dnZXJbZm5OYW1lXS5hcHBseShsb2dnZXIsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVjaG9SYW5rR2V0dGVyU2V0dGVyKG5ld1JhbmspIHtcbiAgICByZXR1cm4gcmFuayA9IHNldFJhbmsocmFuaywgbmV3UmFuayk7XG4gIH1cblxuICBmdW5jdGlvbiBlY2hvRW5hYmxlZEdldHRlclNldHRlcihuZXdTdGF0ZSkge1xuICAgIHJldHVybiBlbmFibGVkID0gc2V0RW5hYmxlZChlbmFibGVkLCBuZXdTdGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FyZ3MoKSB7XG4gICAgaWYgKGlzLnVuZGVmaW5lZChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdlY2hvIG5hbWUgbXVzdCBiZSBkZWZpbmVkJyk7XG4gICAgfVxuICAgIGlmICghaXMudW5kZWZpbmVkKGVjaG9zW25hbWVdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGJ5IHRoZSBuYW1lIG9mICR7bmFtZX0gYWxyZWFkeSBleGlzdHMuIENhbm5vdCBjcmVhdGUgYW5vdGhlciBvZiB0aGUgc2FtZSBuYW1lLmApO1xuICAgIH1cbiAgICBjaGVja1JhbmsocmFuayk7XG4gICAgaWYgKCFpcy51bmRlZmluZWQoZGVmYXVsdENvbG9yKSAmJiAhaXMuc3RyaW5nKGNvbG9yc1tkZWZhdWx0Q29sb3JdKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvIGRlZmF1bHRDb2xvciAodmFsdWU6ICR7ZGVmYXVsdENvbG9yfSkgbXVzdCBiZSBhIHN0cmluZyBzcGVjaWZpZWQgaW4gY29sb3JzICgke09iamVjdC5rZXlzKGNvbG9ycyl9KWApO1xuICAgIH1cbiAgICBpZiAoIUFycmF5LmlzQXJyYXkobG9nRm5zKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdsb2dGbnMgbXVzdCBiZSBhbiBhcnJheSBvZiBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHZhciBtaXNzaW5nU29tZXRoaW5nID0gbG9nRm5zLnNvbWUoZnVuY3Rpb24obG9nRm4pIHtcbiAgICAgIHJldHVybiAhaXMuc3RyaW5nKGxvZ0ZuKSB8fCAhaXMuZm4obG9nZ2VyW2xvZ0ZuXSk7XG4gICAgfSk7XG4gICAgaWYgKG1pc3NpbmdTb21ldGhpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobydzIGxvZ2dlciAodmFsdWU6ICR7bG9nZ2VyfSkgbXVzdCBpbXBsZW1lbnQgdGhlc2UgZnVuY3Rpb25zOiAke2xvZ0Zucy5qb2luKCcsICcpfSAod2hpY2ggbXVzdCBhbGwgYmUgZnVuY3Rpb24gbmFtZXMgYXMgc3RyaW5ncylgKTtcbiAgICB9XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBnZXQobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgcmV0dXJuIGVjaG9zO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBlY2hvc1tuYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmUobmFtZSkge1xuICBpZiAoaXMudW5kZWZpbmVkKG5hbWUpKSB7XG4gICAgZWNob3MgPSB7fTtcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgZWNob3NbbmFtZV07XG4gIH1cbn1cblxuZnVuY3Rpb24gZW5hYmxlZChuZXdTdGF0ZSkge1xuICByZXR1cm4gZ2xvYmFsbHlFbmFibGVkID0gc2V0RW5hYmxlZChnbG9iYWxseUVuYWJsZWQsIG5ld1N0YXRlKTtcbn1cblxuZnVuY3Rpb24gcmFuayhuZXdSYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA9IHNldFJhbmsoY3VycmVudFJhbmssIG5ld1JhbmspO1xufVxuXG4vLyBtYWtlIGRldmVsb3BlcnMgaGFwcHlcbmNyZWF0ZS5kaXNwbGF5TmFtZSA9ICdFY2hvLmNyZWF0ZTogTWFrZXMgYSBuZXcgaW5zdGFuY2Ugb2YgRWNobyc7XG5nZXQuZGlzcGxheU5hbWUgPSAnR2V0IGFuIGVjaG8gbG9nZ2VyIGJ5IG5hbWUnO1xucmVtb3ZlLmRpc3BsYXlOYW1lID0gJ1JlbW92ZSBhbiBlY2hvIGxvZ2dlcic7XG5yYW5rLmRpc3BsYXlOYW1lID0gJ1NldCB0aGUgZ2xvYmFsIEVjaG8gcmFuay4gTXVzdCBiZSBhIG51bWJlciAwLTUgaW5jbHVzaXZlLiAwIGlzIGxlc3MgbG9ncywgNSBpcyBtb3JlLic7XG5cblxuLy8gTWFpbiBleHBvcnRcbmV4cG9ydCBkZWZhdWx0IEVjaG87XG5cblxuXG4vLyBmdW5jdGlvbnMgZGVjbGFyYXRpb25zXG5mdW5jdGlvbiBhZGRDb2xvcihhcmdzLCBjb2xvcikge1xuICBpZiAoIWlzSUUgJiYgY29sb3IpIHtcbiAgICBhcmdzLnNwbGljZSgxLCAwLCBjb2xvcik7XG4gICAgYXJnc1swXSA9ICclYycgKyBhcmdzWzBdO1xuICB9XG4gIHJldHVybiBhcmdzO1xufVxuXG5mdW5jdGlvbiBoaWdoRW5vdWdoUmFuayhyYW5rKSB7XG4gIHJldHVybiBjdXJyZW50UmFuayA+PSByYW5rO1xufVxuXG5mdW5jdGlvbiBzZXRSYW5rKG9yaWdpbmFsUmFuaywgbmV3UmFuaykge1xuICBpZiAoIWlzLnVuZGVmaW5lZChuZXdSYW5rKSkge1xuICAgIGNoZWNrUmFuayhuZXdSYW5rKTtcbiAgICBvcmlnaW5hbFJhbmsgPSBuZXdSYW5rO1xuICB9XG4gIHJldHVybiBvcmlnaW5hbFJhbms7XG59XG5cbmZ1bmN0aW9uIHNldEVuYWJsZWQob3JpZ2luYWxTdGF0ZSwgbmV3U3RhdGUpIHtcbiAgaWYgKCFpcy51bmRlZmluZWQobmV3U3RhdGUpKSB7XG4gICAgaWYgKCFpcy5ib29sZWFuKG5ld1N0YXRlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBlY2hvLmVuYWJsZWQgbXVzdCBwYXNzIG5vdGhpbmcgb3IgYSBib29sZWFuLiBcIiR7bmV3U3RhdGV9XCIgd2FzIHBhc3NlZGApO1xuICAgIH1cbiAgICBvcmlnaW5hbFN0YXRlID0gbmV3U3RhdGU7XG4gIH1cbiAgcmV0dXJuIG9yaWdpbmFsU3RhdGU7XG59XG5cbmZ1bmN0aW9uIGNoZWNrUmFuayhyYW5rKSB7XG4gIGlmICghaXMubnVtYmVyKHJhbmspIHx8IHJhbmsgPCAwIHx8IHJhbmsgPiA1KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgYGVjaG8gcmFuayAodmFsdWU6ICR7cmFua30pIG11c3QgYmUgbnVtYmVycyBiZXR3ZWVuIDAgYW5kIDUgKGluY2x1c2l2ZSkuIDAgaXMgbGVzcyBsb2dzLCA1IGlzIG1vcmUuYFxuICAgICk7XG4gIH1cbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2VjaG8uanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJkaXN0L2VjaG8uanMifQ==