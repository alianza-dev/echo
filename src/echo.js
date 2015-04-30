/**
 * @name echo
 * @license echo.js may be freely distributed under the MIT license.
 * @copyright (c) 2015 Alianza Inc.
 * @author Kent C. Dodds <kent@doddsfamily.us>
 */

// variable assignment
var isIE = (() => {
  var ua = window.navigator.userAgent;
  return ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0;
})();

const COLORS = {
  green: 'color:green',
  purple: 'color:rebeccapurple',
  blue: 'color:cornflowerblue',
  red: 'color:crimson',
  gray: 'color:#919191'
};
const LOG_FNS = ['log', 'info', 'debug', 'warn', 'error'];

var is = {};
['undefined', 'string', {name: 'fn', type: 'function'}, 'boolean', 'number'].forEach(function(name) {
  is[name.name || name] = (val) => typeof val === (name.type || name);
});


var preconfigState = getPreconfiguredLoggingState();

var testMode = preconfigState.testMode;
var currentRank = rank(preconfigState.rank || 5);
var globallyEnabled = is.boolean(preconfigState.enabled) ? preconfigState.enabled : true;
var echos = {};
var Echo = {create, get, remove, rank, enabled, testMode};

function create(name, {
  rank = 5, colors = COLORS, logger = console, logFns = LOG_FNS,
  defaultColor, enabled
  } = {}) {
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
  logFns.forEach(fnName => echo[fnName] = wrapLog(fnName));

  // make developers happy
  echo.displayName = `echo: "${name}" abstraction on console`;
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
      logIt(...[fnName, colors[defaultColor], ...arguments]);
    }
    echoLog.displayName = `console abstraction for ${name}:${fnName}`;
    addALittleColor(fnName, echoLog);
    return echoLog;
  }

  function addALittleColor(fnName, fn) {
    colorKeys.forEach(function(colorName) {
      fn[colorName] = function echoColoredLog() {
        logIt(...[fnName, colors[colorName], ...arguments]);
      };
      fn[colorName].displayName = `${colorName} colored console abstraction for ${name}:${fnName}`;
    });
  }

  function logIt(fnName, color, ...args) {
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
      throw new Error(`echo by the name of ${name} already exists. Cannot create another of the same name.`);
    }
    checkRank(rank);
    if (!is.undefined(defaultColor) && !is.string(colors[defaultColor])) {
      throw new Error(`echo defaultColor (value: ${defaultColor}) must be a string specified in colors (${Object.keys(colors)})`);
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
export default Echo;



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
      throw new Error(`echo.enabled must pass nothing or a boolean. "${newState}" was passed`);
    }
    originalState = newState;
  }
  return originalState;
}

function checkRank(rank) {
  if (!is.number(rank) || rank < 0 || rank > 5) {
    throw new Error(
      `echo rank (value: ${rank}) must be numbers between 0 and 5 (inclusive). 0 is less logs, 5 is more.`
    );
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

  enableQueryParamLogs.forEach(function(log) {
    if (log) {
      state[log] = doAll ? state.all : true;
    }
  });

  disableQueryParamLogs.forEach(function(log) {
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

function noop() {
}
