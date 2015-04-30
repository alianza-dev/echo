# echo

Echo is a simple abstraction on top of `console` that provides a few nice APIs including:

 - Enabled/disable
 - Log rank
 - Colored output

# Demo

http://jsbin.com/kaqazu

# Installation

`$ bower i --save alianza-dev/echo#LATEST_SHA` <-- put latest SHA there

`$ npm i --save alianza-dev/echo#LATEST_SHA` <-- put latest SHA there

If you want me to actually publish this on bower or npm, then upvote
[this issue](https://github.com/alianza-dev/echo/issues/1)

# Usage

```js
var options = {};
var name = 'networkLog';
// as global
var networkLog = Echo.create(name, options);

// or in CommonJS
var networkLog = require('echo').create(name, options);

// or in AMD
define(['path/to/echo.js', function(Echo) {
  var networkLog = Echo.create(name, options);
}]);
```

# Example

```js
var stateLog = Echo.create('stateLog', {});
stateLog('Just like console.log');
stateLog.log('Just like console.log');
stateLog.log.green('Just like console.log, except this is green now');

var networkLog = Echo.create('networkLog', {
  defaultColor: 'BYUBlue',
  colors: {
    BYUBlue: 'color:#001E4C',
    fuchsia: 'color:#FF0080'
  }
});

networkLog('hey!'); // output in BYUBlue
typeof networkLog.log.green === 'undefined';
networkLog.log.BYUBlue('Go Cougars!');
networkLog.warn.fuchsia('Beware the power of pink!', {some: 'other stuff'});
```

# Echo API

## create(name:string, options:object)

Creates and registers a new `echo` logger and returns that instance.

### name (required, string, undefined)

This is used to register the logger so you can retrieve it from `Echo` using `Echo.get`

### options (required, object, undefined)

Used to control specifics of the instance of the echo. Properties are below:

#### rank (optional, number, 0)

Number from 0 to 5 inclusive that controls the level of logging. Logging rank is controlled by
`Echo.rank(newRank) // <-- getter/setter`. A log will not go through to the logger (i.e. `console`) if the rank of the
logger is too high (must be less than or equal to the `Echo.rank`).

#### defaultColor (optional, number, undefined)

This controls the color to any direct calls (not specifying a color).

#### colors (optional, object, pre-defined)

An object of styles to apply to the logger where the key is the method name (like `green`) and the value is a string of
styles to be applied when it is invoked (like `color:green`).

#### enabled (optional, boolean, true)

Getter/setter to enable/disable the logger

#### logger (optional, object, console)

The logging instance to use. Probably don't need to use this...

#### logFns (optional, Array<string>, pre-defined)

The functions that the given `logger` has that will be invoked.

## get(name:string)

Gets a registered `echo` by name from the given string. If no name is provided, then it returns the entire array.

## remove(name:string)

Removes a registered `echo` by name from the given string. If no name is provided, then it removes all `echos`.

## rank(newRank:number)

Rank getter/setter

## enabled(newState:boolean)

Enabled getter/setter. When set to false, nothing will be logged no matter what!

# echo API

Examples below assume: `var echo = Echo.create('echo', {});`

## echo(arguments:...*)

The returned logger from `Echo.create` is an alias to `echo.log`.

`echo` has all the `logFns` added to it as well. In the default configuration, these are: log, info, debug, warn, and
error. All `logFns` are passed down into the provided `logger` (defaults to `console`) when this `echo` was created.

On top of this, each `echo` function has the keys to all the `colors` added to it as functions as well which will add
the specified color value to the log to provide the desired color.

# Query Params and window.echoLogging

You can enable/disable echos by name via query parameters or `window.echoLogging`. This is mostly useful for debugging
purposes. Query params take priority, and disabled state takes priority. This also takes priority over whatever is
passed into `create`.

```js
window.echoLogging = {
  stateLog: false,
  networkLog: true
};

// url: http://example.com?echoEnableLog=fooLog,barLog&echoDisableLog=foobarLog,networkLog
```

The above state would result in `fooLog`, and `barLog` being enabled by default (overriding what was passed into
`create`) and `foobarLog`, `stateLog` and `networkLog` being disabled by default.

Valid query parameters include:

 - `echoEnableLog` should be a list of echo names separated by commas
 - `echoDisableLog` should be a list of echo names separated by commas
 - `echoRank` should be a number between 0 and 5 - controls initial `Echo.rank()` state
 - `echoEnabled` should be "true" or "false" - controls initial `Echo.enabled()` state
 - `echoAll` should be "true" or "false" - if this is set, the initial enabled state for all loggers will be set to its
 value

In addition, `echoRank`, `echoEnabled`, and `echoAll` can all be set via the `window.echoLogging` variable.

# Rank

Think of rank like this:

 - A high rank means that something is less critical to be logged.
 - A low rank means that it is more critical to be logged.

# Notes

## colors

 - Only the first argument to the log functions will be colored
 - IE 10 doesn't support colors in the console, so `Echo` detects IE and doesn't attempt to add colors in IE.

## IE

 - Internet Explorer has issues with console and doesn't support all the operations that you may wish to (like `debug`
 for example). Echo will do an undefined check before invoking a logger function and call a `noop` instead).

## testMode

I ran into a lot of trouble with loggers being re-registered with tests. Because I didn't want to spend time fixing the
root problem (test context not being reset) you have `testMode` available which will prevent errors being thrown when
an echo is registered with the same mode. Please only use this as a last resort. I'm not going to tell you how to do it.
You'll have to figure it out if you feel like you really need to.

# TODO

 - Write unit tests
