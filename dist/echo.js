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

	'use strict';
	
	var _slice = Array.prototype.slice;
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	/**
	 * @name echo
	 * @license echo.js may be freely distributed under the MIT license.
	 * @copyright (c) 2015 Alianza Inc.
	 * @author Kent C. Dodds <kent@doddsfamily.us>
	 */
	
	// variable assignment
	var isIE = (function () {
	  var ua = window.navigator.userAgent;
	  return ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0;
	})();
	
	var COLORS = {
	  green: 'color:green',
	  purple: 'color:rebeccapurple',
	  blue: 'color:cornflowerblue',
	  red: 'color:crimson',
	  gray: 'color:#919191'
	};
	var LOG_FNS = ['log', 'info', 'debug', 'warn', 'error'];
	
	var is = {};
	['undefined', 'string', { name: 'fn', type: 'function' }, 'boolean', 'number'].forEach(function (name) {
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
	  var echo = wrapLog('log');
	
	  // add functions
	  echo.rank = echoRankGetterSetter;
	  echo.enabled = echoEnabledGetterSetter;
	
	  // add log functions to echo
	  logFns.forEach(function (fnName) {
	    return echo[fnName] = wrapLog(fnName);
	  });
	
	  // make developers happy
	  echo.displayName = 'echo: "' + name + '" abstraction on console';
	  echo.rank.displayName = 'echo.rank: getter/setter for the current level of logging (high is more)';
	  logIt.displayName = 'echo log wrapper that checks whether the echo is enabled and if its rank is high enough compared to Echo.rank()';
	  checkArgs.displayName = 'Echo.create arg checker that ensures all arguments are correct and throws errors if not';
	
	  // add echo to echos
	  echos[name] = echo;
	
	  // return
	  return echo;
	
	  // function declarations
	  function wrapLog(fnName) {
	    function echoLog() {
	      logIt.apply(undefined, [fnName, colors[defaultColor]].concat(_slice.call(arguments)));
	    }
	    echoLog.displayName = 'console abstraction for ' + name + ':' + fnName;
	    addALittleColor(fnName, echoLog);
	    return echoLog;
	  }
	
	  function addALittleColor(fnName, fn) {
	    colorKeys.forEach(function (colorName) {
	      fn[colorName] = function echoColoredLog() {
	        logIt.apply(undefined, [fnName, colors[colorName]].concat(_slice.call(arguments)));
	      };
	      fn[colorName].displayName = '' + colorName + ' colored console abstraction for ' + name + ':' + fnName;
	    });
	  }
	
	  function logIt(fnName, color) {
	    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	      args[_key - 2] = arguments[_key];
	    }
	
	    if (globallyEnabled && enabled && highEnoughRank(rank)) {
	      args = addColor(args, color);
	      return (logger[fnName] || noop).apply(logger, args);
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
	      throw new Error('echo name must be defined');
	    }
	    if (!Echo.testMode && !is.undefined(echos[name])) {
	      throw new Error('echo by the name of ' + name + ' already exists. Cannot create another of the same name.');
	    }
	    checkRank(rank);
	    if (!is.undefined(defaultColor) && !is.string(colors[defaultColor])) {
	      throw new Error('echo defaultColor (value: ' + defaultColor + ') must be a string specified in colors (' + Object.keys(colors) + ')');
	    }
	    if (!Array.isArray(logFns)) {
	      throw new Error('logFns must be an array of strings');
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
	create.displayName = 'Echo.create: Makes a new instance of Echo';
	get.displayName = 'Get an echo logger by name';
	remove.displayName = 'Remove an echo logger';
	rank.displayName = 'Set the global Echo rank. Must be a number 0-5 inclusive. 0 is less logs, 5 is more.';
	
	// Main export
	exports['default'] = Echo;
	
	// functions declarations
	function addColor(args, color) {
	  if (!isIE && color && !is.undefined(args[0])) {
	    args.splice(1, 0, color);
	    args[0] = '%c' + args[0];
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
	      throw new Error('echo.enabled must pass nothing or a boolean. "' + newState + '" was passed');
	    }
	    originalState = newState;
	  }
	  return originalState;
	}
	
	function checkRank(rank) {
	  if (!is.number(rank) || rank < 0 || rank > 5) {
	    throw new Error('echo rank (value: ' + rank + ') must be numbers between 0 and 5 (inclusive). 0 is less logs, 5 is more.');
	  }
	}
	
	function getPreconfiguredLoggingState() {
	  var enableLogVal = getParameterByName('echoEnableLog');
	  var disableLogVal = getParameterByName('echoDisableLog');
	  var globallyEnabled = getParameterByName('echoEnabled');
	  var all = getParameterByName('echoAll');
	  var rank = getParameterByName('echoRank');
	  var enableQueryParamLogs = is.string(enableLogVal) ? enableLogVal.split(',') : [];
	  var disableQueryParamLogs = is.string(disableLogVal) ? disableLogVal.split(',') : [];
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
	  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)', 'i');
	  var results = regex.exec(location.search || location.hash);
	  if (results) {
	    var val = decodeURIComponent(results[1].replace(/\+/g, ' '));
	    if (val === 'true') {
	      return true;
	    } else if (val === 'false') {
	      return false;
	    } else if (isNumeric(val)) {
	      return parseFloat(val);
	    } else {
	      return val;
	    }
	  } else {
	    return '';
	  }
	}
	
	function isNumeric(n) {
	  return !isNaN(parseFloat(n)) && isFinite(n);
	}
	
	function noop() {}
	module.exports = exports['default'];

/***/ }
/******/ ])
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCBhYTZlYWIxZGIxMDZmNDBhNDRkNSIsIndlYnBhY2s6Ly8vLi9zcmMvZWNoby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QsTztBQ1ZBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esd0M7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlCQSxLQUFJLElBQUksR0FBRyxDQUFDLFlBQU07QUFDaEIsT0FBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUM7QUFDcEMsVUFBTyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM5RCxHQUFHLENBQUM7O0FBRUwsS0FBTSxNQUFNLEdBQUc7QUFDYixRQUFLLEVBQUUsYUFBYTtBQUNwQixTQUFNLEVBQUUscUJBQXFCO0FBQzdCLE9BQUksRUFBRSxzQkFBc0I7QUFDNUIsTUFBRyxFQUFFLGVBQWU7QUFDcEIsT0FBSSxFQUFFLGVBQWU7RUFDdEIsQ0FBQztBQUNGLEtBQU0sT0FBTyxHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUUxRCxLQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixFQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsRUFB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QUcsSUFBSSxHQUFHLFdBQVcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMzRCxPQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNELE9BQUksT0FBTyxFQUFFO0FBQ1gsU0FBSSxHQUFHLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM3RCxTQUFJLEdBQUcsS0FBSyxNQUFNLEVBQUU7QUFDbEIsY0FBTyxJQUFJLENBQUM7TUFDYixNQUFNLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtBQUMxQixjQUFPLEtBQUssQ0FBQztNQUNkLE1BQU0sSUFBSSxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDekIsY0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7TUFDeEIsTUFBTTtBQUNMLGNBQU8sR0FBRyxDQUFDO01BQ1o7SUFDRixNQUFNO0FBQ0wsWUFBTyxFQUFFLENBQUM7SUFDWDtFQUNGOztBQUVELFVBQVMsU0FBUyxDQUFDLENBQUMsRUFBRTtBQUNwQixVQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUM3Qzs7QUFFRCxVQUFTLElBQUksR0FBRyxFQUNmIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIHdlYnBhY2tVbml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uKHJvb3QsIGZhY3RvcnkpIHtcblx0aWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnKVxuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRlbHNlIGlmKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJFY2hvXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcIkVjaG9cIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBhYTZlYWIxZGIxMDZmNDBhNDRkNVxuICoqLyIsIi8qKlxuICogQG5hbWUgZWNob1xuICogQGxpY2Vuc2UgZWNoby5qcyBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cbiAqIEBjb3B5cmlnaHQgKGMpIDIwMTUgQWxpYW56YSBJbmMuXG4gKiBAYXV0aG9yIEtlbnQgQy4gRG9kZHMgPGtlbnRAZG9kZHNmYW1pbHkudXM+XG4gKi9cblxuLy8gdmFyaWFibGUgYXNzaWdubWVudFxudmFyIGlzSUUgPSAoKCkgPT4ge1xuICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbiAgcmV0dXJuIHVhLmluZGV4T2YoJ01TSUUgJykgPiAwIHx8IHVhLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAwO1xufSkoKTtcblxuY29uc3QgQ09MT1JTID0ge1xuICBncmVlbjogJ2NvbG9yOmdyZWVuJyxcbiAgcHVycGxlOiAnY29sb3I6cmViZWNjYXB1cnBsZScsXG4gIGJsdWU6ICdjb2xvcjpjb3JuZmxvd2VyYmx1ZScsXG4gIHJlZDogJ2NvbG9yOmNyaW1zb24nLFxuICBncmF5OiAnY29sb3I6IzkxOTE5MSdcbn07XG5jb25zdCBMT0dfRk5TID0gWydsb2cnLCAnaW5mbycsICdkZWJ1ZycsICd3YXJuJywgJ2Vycm9yJ107XG5cbnZhciBpcyA9IHt9O1xuWyd1bmRlZmluZWQnLCAnc3RyaW5nJywge25hbWU6ICdmbicsIHR5cGU6ICdmdW5jdGlvbid9LCAnYm9vbGVhbicsICdudW1iZXInXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgaXNbbmFtZS5uYW1lIHx8IG5hbWVdID0gKHZhbCkgPT4gdHlwZW9mIHZhbCA9PT0gKG5hbWUudHlwZSB8fCBuYW1lKTtcbn0pO1xuXG5cbnZhciBwcmVjb25maWdTdGF0ZSA9IGdldFByZWNvbmZpZ3VyZWRMb2dnaW5nU3RhdGUoKTtcblxudmFyIHRlc3RNb2RlID0gcHJlY29uZmlnU3RhdGUudGVzdE1vZGU7XG52YXIgY3VycmVudFJhbmsgPSByYW5rKHByZWNvbmZpZ1N0YXRlLnJhbmsgfHwgNSk7XG52YXIgZ2xvYmFsbHlFbmFibGVkID0gaXMuYm9vbGVhbihwcmVjb25maWdTdGF0ZS5lbmFibGVkKSA/IHByZWNvbmZpZ1N0YXRlLmVuYWJsZWQgOiB0cnVlO1xudmFyIGVjaG9zID0ge307XG52YXIgRWNobyA9IHtjcmVhdGUsIGdldCwgcmVtb3ZlLCByYW5rLCBlbmFibGVkLCB0ZXN0TW9kZX07XG5cbmZ1bmN0aW9uIGNyZWF0ZShuYW1lLCB7XG4gIHJhbmsgPSA1LCBjb2xvcnMgPSBDT0xPUlMsIGxvZ2dlciA9IGNvbnNvbGUsIGxvZ0ZucyA9IExPR19GTlMsXG4gIGRlZmF1bHRDb2xvciwgZW5hYmxlZFxuICB9ID0ge30pIHtcbiAgLy8gZW5hYmxlZDogZGVmYXVsdCB0byBhbGwgaWYgYWxsIGlzIHNldCwgdGhlbiBwcmVjb25maWdTdGF0ZSBmb3IgdGhlIGxvZ2dlciBuYW1lXG4gIC8vIHRoZW4gdGhlIHByb3ZpZGVkIGVuYWJsZWQsIHRoZW4gdHJ1ZVxuICB2YXIgcHJlc2V0U3RhdGUgPSBpcy5ib29sZWFuKHByZWNvbmZpZ1N0YXRlLmFsbCkgPyBwcmVjb25maWdTdGF0ZS5hbGwgOiBwcmVjb25maWdTdGF0ZVtuYW1lXTtcbiAgZW5hYmxlZCA9IGlzLmJvb2xlYW4ocHJlc2V0U3RhdGUpID8gcHJlc2V0U3RhdGUgOiBpcy5ib29sZWFuKGVuYWJsZWQpID8gZW5hYmxlZCA6IHRydWU7XG5cbiAgY2hlY2tBcmdzKG5hbWUsIHJhbmssIGRlZmF1bHRDb2xvciwgY29sb3JzLCBsb2dnZXIsIGxvZ0Zucyk7XG5cbiAgLy8gdmFyaWFibGUgaW5pdGlhbGl6YXRpb25cbiAgdmFyIGNvbG9yS2V5cyA9IE9iamVjdC5rZXlzKGNvbG9ycyk7XG5cbiAgLy8gY3JlYXRlIGVjaG9cbiAgdmFyIGVjaG8gPSB3cmFwTG9nKCdsb2cnKTtcblxuICAvLyBhZGQgZnVuY3Rpb25zXG4gIGVjaG8ucmFuayA9IGVjaG9SYW5rR2V0dGVyU2V0dGVyO1xuICBlY2hvLmVuYWJsZWQgPSBlY2hvRW5hYmxlZEdldHRlclNldHRlcjtcblxuICAvLyBhZGQgbG9nIGZ1bmN0aW9ucyB0byBlY2hvXG4gIGxvZ0Zucy5mb3JFYWNoKGZuTmFtZSA9PiBlY2hvW2ZuTmFtZV0gPSB3cmFwTG9nKGZuTmFtZSkpO1xuXG4gIC8vIG1ha2UgZGV2ZWxvcGVycyBoYXBweVxuICBlY2hvLmRpc3BsYXlOYW1lID0gYGVjaG86IFwiJHtuYW1lfVwiIGFic3RyYWN0aW9uIG9uIGNvbnNvbGVgO1xuICBlY2hvLnJhbmsuZGlzcGxheU5hbWUgPSAnZWNoby5yYW5rOiBnZXR0ZXIvc2V0dGVyIGZvciB0aGUgY3VycmVudCBsZXZlbCBvZiBsb2dnaW5nIChoaWdoIGlzIG1vcmUpJztcbiAgbG9nSXQuZGlzcGxheU5hbWUgPSAnZWNobyBsb2cgd3JhcHBlciB0aGF0IGNoZWNrcyB3aGV0aGVyIHRoZSBlY2hvIGlzIGVuYWJsZWQgYW5kIGlmIGl0cyByYW5rIGlzIGhpZ2ggZW5vdWdoIGNvbXBhcmVkIHRvIEVjaG8ucmFuaygpJztcbiAgY2hlY2tBcmdzLmRpc3BsYXlOYW1lID0gJ0VjaG8uY3JlYXRlIGFyZyBjaGVja2VyIHRoYXQgZW5zdXJlcyBhbGwgYXJndW1lbnRzIGFyZSBjb3JyZWN0IGFuZCB0aHJvd3MgZXJyb3JzIGlmIG5vdCc7XG5cbiAgLy8gYWRkIGVjaG8gdG8gZWNob3NcbiAgZWNob3NbbmFtZV0gPSBlY2hvO1xuXG4gIC8vIHJldHVyblxuICByZXR1cm4gZWNobztcblxuXG4gIC8vIGZ1bmN0aW9uIGRlY2xhcmF0aW9uc1xuICBmdW5jdGlvbiB3cmFwTG9nKGZuTmFtZSkge1xuICAgIGZ1bmN0aW9uIGVjaG9Mb2coKSB7XG4gICAgICBsb2dJdCguLi5bZm5OYW1lLCBjb2xvcnNbZGVmYXVsdENvbG9yXSwgLi4uYXJndW1lbnRzXSk7XG4gICAgfVxuICAgIGVjaG9Mb2cuZGlzcGxheU5hbWUgPSBgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIGFkZEFMaXR0bGVDb2xvcihmbk5hbWUsIGVjaG9Mb2cpO1xuICAgIHJldHVybiBlY2hvTG9nO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkQUxpdHRsZUNvbG9yKGZuTmFtZSwgZm4pIHtcbiAgICBjb2xvcktleXMuZm9yRWFjaChmdW5jdGlvbihjb2xvck5hbWUpIHtcbiAgICAgIGZuW2NvbG9yTmFtZV0gPSBmdW5jdGlvbiBlY2hvQ29sb3JlZExvZygpIHtcbiAgICAgICAgbG9nSXQoLi4uW2ZuTmFtZSwgY29sb3JzW2NvbG9yTmFtZV0sIC4uLmFyZ3VtZW50c10pO1xuICAgICAgfTtcbiAgICAgIGZuW2NvbG9yTmFtZV0uZGlzcGxheU5hbWUgPSBgJHtjb2xvck5hbWV9IGNvbG9yZWQgY29uc29sZSBhYnN0cmFjdGlvbiBmb3IgJHtuYW1lfToke2ZuTmFtZX1gO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9nSXQoZm5OYW1lLCBjb2xvciwgLi4uYXJncykge1xuICAgIGlmIChnbG9iYWxseUVuYWJsZWQgJiYgZW5hYmxlZCAmJiBoaWdoRW5vdWdoUmFuayhyYW5rKSkge1xuICAgICAgYXJncyA9IGFkZENvbG9yKGFyZ3MsIGNvbG9yKTtcbiAgICAgIHJldHVybiAobG9nZ2VyW2ZuTmFtZV0gfHwgbm9vcCkuYXBwbHkobG9nZ2VyLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBlY2hvUmFua0dldHRlclNldHRlcihuZXdSYW5rKSB7XG4gICAgcmV0dXJuIHJhbmsgPSBzZXRSYW5rKHJhbmssIG5ld1JhbmspO1xuICB9XG5cbiAgZnVuY3Rpb24gZWNob0VuYWJsZWRHZXR0ZXJTZXR0ZXIobmV3U3RhdGUpIHtcbiAgICByZXR1cm4gZW5hYmxlZCA9IHNldEVuYWJsZWQoZW5hYmxlZCwgbmV3U3RhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tBcmdzKCkge1xuICAgIGlmIChpcy51bmRlZmluZWQobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignZWNobyBuYW1lIG11c3QgYmUgZGVmaW5lZCcpO1xuICAgIH1cbiAgICBpZiAoIUVjaG8udGVzdE1vZGUgJiYgIWlzLnVuZGVmaW5lZChlY2hvc1tuYW1lXSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobyBieSB0aGUgbmFtZSBvZiAke25hbWV9IGFscmVhZHkgZXhpc3RzLiBDYW5ub3QgY3JlYXRlIGFub3RoZXIgb2YgdGhlIHNhbWUgbmFtZS5gKTtcbiAgICB9XG4gICAgY2hlY2tSYW5rKHJhbmspO1xuICAgIGlmICghaXMudW5kZWZpbmVkKGRlZmF1bHRDb2xvcikgJiYgIWlzLnN0cmluZyhjb2xvcnNbZGVmYXVsdENvbG9yXSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNobyBkZWZhdWx0Q29sb3IgKHZhbHVlOiAke2RlZmF1bHRDb2xvcn0pIG11c3QgYmUgYSBzdHJpbmcgc3BlY2lmaWVkIGluIGNvbG9ycyAoJHtPYmplY3Qua2V5cyhjb2xvcnMpfSlgKTtcbiAgICB9XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGxvZ0ZucykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignbG9nRm5zIG11c3QgYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncycpO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIGdldChuYW1lKSB7XG4gIGlmIChpcy51bmRlZmluZWQobmFtZSkpIHtcbiAgICByZXR1cm4gZWNob3M7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGVjaG9zW25hbWVdO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZShuYW1lKSB7XG4gIGlmIChpcy51bmRlZmluZWQobmFtZSkpIHtcbiAgICBlY2hvcyA9IHt9O1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSBlY2hvc1tuYW1lXTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmFibGVkKG5ld1N0YXRlKSB7XG4gIHJldHVybiBnbG9iYWxseUVuYWJsZWQgPSBzZXRFbmFibGVkKGdsb2JhbGx5RW5hYmxlZCwgbmV3U3RhdGUpO1xufVxuXG5mdW5jdGlvbiByYW5rKG5ld1JhbmspIHtcbiAgcmV0dXJuIGN1cnJlbnRSYW5rID0gc2V0UmFuayhjdXJyZW50UmFuaywgbmV3UmFuayk7XG59XG5cbi8vIG1ha2UgZGV2ZWxvcGVycyBoYXBweVxuY3JlYXRlLmRpc3BsYXlOYW1lID0gJ0VjaG8uY3JlYXRlOiBNYWtlcyBhIG5ldyBpbnN0YW5jZSBvZiBFY2hvJztcbmdldC5kaXNwbGF5TmFtZSA9ICdHZXQgYW4gZWNobyBsb2dnZXIgYnkgbmFtZSc7XG5yZW1vdmUuZGlzcGxheU5hbWUgPSAnUmVtb3ZlIGFuIGVjaG8gbG9nZ2VyJztcbnJhbmsuZGlzcGxheU5hbWUgPSAnU2V0IHRoZSBnbG9iYWwgRWNobyByYW5rLiBNdXN0IGJlIGEgbnVtYmVyIDAtNSBpbmNsdXNpdmUuIDAgaXMgbGVzcyBsb2dzLCA1IGlzIG1vcmUuJztcblxuXG4vLyBNYWluIGV4cG9ydFxuZXhwb3J0IGRlZmF1bHQgRWNobztcblxuXG5cbi8vIGZ1bmN0aW9ucyBkZWNsYXJhdGlvbnNcbmZ1bmN0aW9uIGFkZENvbG9yKGFyZ3MsIGNvbG9yKSB7XG4gIGlmICghaXNJRSAmJiBjb2xvciAmJiAhaXMudW5kZWZpbmVkKGFyZ3NbMF0pKSB7XG4gICAgYXJncy5zcGxpY2UoMSwgMCwgY29sb3IpO1xuICAgIGFyZ3NbMF0gPSAnJWMnICsgYXJnc1swXTtcbiAgfVxuICByZXR1cm4gYXJncztcbn1cblxuZnVuY3Rpb24gaGlnaEVub3VnaFJhbmsocmFuaykge1xuICByZXR1cm4gY3VycmVudFJhbmsgPj0gcmFuaztcbn1cblxuZnVuY3Rpb24gc2V0UmFuayhvcmlnaW5hbFJhbmssIG5ld1JhbmspIHtcbiAgaWYgKCFpcy51bmRlZmluZWQobmV3UmFuaykpIHtcbiAgICBjaGVja1JhbmsobmV3UmFuayk7XG4gICAgb3JpZ2luYWxSYW5rID0gbmV3UmFuaztcbiAgfVxuICByZXR1cm4gb3JpZ2luYWxSYW5rO1xufVxuXG5mdW5jdGlvbiBzZXRFbmFibGVkKG9yaWdpbmFsU3RhdGUsIG5ld1N0YXRlKSB7XG4gIGlmICghaXMudW5kZWZpbmVkKG5ld1N0YXRlKSkge1xuICAgIGlmICghaXMuYm9vbGVhbihuZXdTdGF0ZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgZWNoby5lbmFibGVkIG11c3QgcGFzcyBub3RoaW5nIG9yIGEgYm9vbGVhbi4gXCIke25ld1N0YXRlfVwiIHdhcyBwYXNzZWRgKTtcbiAgICB9XG4gICAgb3JpZ2luYWxTdGF0ZSA9IG5ld1N0YXRlO1xuICB9XG4gIHJldHVybiBvcmlnaW5hbFN0YXRlO1xufVxuXG5mdW5jdGlvbiBjaGVja1JhbmsocmFuaykge1xuICBpZiAoIWlzLm51bWJlcihyYW5rKSB8fCByYW5rIDwgMCB8fCByYW5rID4gNSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBlY2hvIHJhbmsgKHZhbHVlOiAke3Jhbmt9KSBtdXN0IGJlIG51bWJlcnMgYmV0d2VlbiAwIGFuZCA1IChpbmNsdXNpdmUpLiAwIGlzIGxlc3MgbG9ncywgNSBpcyBtb3JlLmBcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldFByZWNvbmZpZ3VyZWRMb2dnaW5nU3RhdGUoKSB7XG4gIHZhciBlbmFibGVMb2dWYWwgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2VjaG9FbmFibGVMb2cnKTtcbiAgdmFyIGRpc2FibGVMb2dWYWwgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2VjaG9EaXNhYmxlTG9nJyk7XG4gIHZhciBnbG9iYWxseUVuYWJsZWQgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2VjaG9FbmFibGVkJyk7XG4gIHZhciBhbGwgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2VjaG9BbGwnKTtcbiAgdmFyIHJhbmsgPSBnZXRQYXJhbWV0ZXJCeU5hbWUoJ2VjaG9SYW5rJyk7XG4gIHZhciBlbmFibGVRdWVyeVBhcmFtTG9ncyA9IGlzLnN0cmluZyhlbmFibGVMb2dWYWwpID8gZW5hYmxlTG9nVmFsLnNwbGl0KCcsJykgOiBbXTtcbiAgdmFyIGRpc2FibGVRdWVyeVBhcmFtTG9ncyA9IGlzLnN0cmluZyhkaXNhYmxlTG9nVmFsKSA/IGRpc2FibGVMb2dWYWwuc3BsaXQoJywnKSA6IFtdO1xuICB2YXIgc3RhdGUgPSB3aW5kb3cuZWNob0xvZ2dpbmcgfHwge307XG4gIGFsbCA9IHN0YXRlLnRlc3RNb2RlID09PSB0cnVlID8gZmFsc2UgOiBhbGw7XG4gIHZhciBkb0FsbCA9IGlzLmJvb2xlYW4oYWxsKTtcbiAgc3RhdGUuYWxsID0gZG9BbGwgPyBzdGF0ZS5hbGwgOiBhbGw7XG4gIHN0YXRlLmVuYWJsZWQgPSBkb0FsbCA/IHN0YXRlLmFsbCA6IGlzLmJvb2xlYW4oZ2xvYmFsbHlFbmFibGVkKSA/IHN0YXRlLmVuYWJsZWQgOiBnbG9iYWxseUVuYWJsZWQ7XG4gIHN0YXRlLnJhbmsgPSByYW5rO1xuXG4gIGVuYWJsZVF1ZXJ5UGFyYW1Mb2dzLmZvckVhY2goZnVuY3Rpb24obG9nKSB7XG4gICAgaWYgKGxvZykge1xuICAgICAgc3RhdGVbbG9nXSA9IGRvQWxsID8gc3RhdGUuYWxsIDogdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIGRpc2FibGVRdWVyeVBhcmFtTG9ncy5mb3JFYWNoKGZ1bmN0aW9uKGxvZykge1xuICAgIGlmIChsb2cpIHtcbiAgICAgIHN0YXRlW2xvZ10gPSBkb0FsbCA/IHN0YXRlLmFsbCA6IGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJCeU5hbWUobmFtZSkge1xuICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XG4gIHZhciByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIG5hbWUgKyAnPShbXiYjXSopJywgJ2knKTtcbiAgdmFyIHJlc3VsdHMgPSByZWdleC5leGVjKGxvY2F0aW9uLnNlYXJjaCB8fCBsb2NhdGlvbi5oYXNoKTtcbiAgaWYgKHJlc3VsdHMpIHtcbiAgICB2YXIgdmFsID0gZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0ucmVwbGFjZSgvXFwrL2csICcgJykpO1xuICAgIGlmICh2YWwgPT09ICd0cnVlJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmICh2YWwgPT09ICdmYWxzZScpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGlzTnVtZXJpYyh2YWwpKSB7XG4gICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNOdW1lcmljKG4pIHtcbiAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHtcbn1cblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIC4vc3JjL2VjaG8uanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiIsImZpbGUiOiJkaXN0L2VjaG8uanMifQ==