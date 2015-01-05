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

Gets a registered `echo` by name from the given string

## remove(name:string)

Removes a registered `echo` by name from the given string

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

# Rank

Think of rank like this:

 - A high rank means that something is less critical to be logged.
 - A low rank means that it is more critical to be logged.

# Notes

## colors

 - Only the first argument to the log functions will be colored
 - IE 10 doesn't support colors in the console, so `Echo` detects IE and doesn't attempt to add colors in IE.

