W20 Core provides the minimum requirements to run a W20 application, mainly: 

* An [AMD](http://en.wikipedia.org/wiki/Asynchronous_module_definition) infrastructure through [RequireJS](http://requirejs.org/),
* An MVC runtime through [AngularJS](https://angularjs.org/),
* Application loading and initialization,
* A permission model which enables to reflect backend security, 
* Extensive culture support,
* Various utilities.

No graphical framework is provided in this fragment so it can serve as a base to build your own or to implement a 
completely custom UI solution in a specific application. You may reserve this possibility for very specific purposes though,
since W20 provide a complete UI solution based on Bootstrap in the W20 UI fragment.

# Application loading

The `w20` module is the JS entry point of a W20 application. Its initialization sequence is as follow:
 
1. Loading and parsing of the application configuration,
2. Loading and parsing of all the required fragment manifests,
3. Preloading of fragment minified builds when present and if enabled,
4. Computing of a global RequireJS configuration along with the list of all modules to load,
5. Loading of all modules needed at startup time at once,
6. Initializing of each loaded module through its lifecycle callbacks (pre -> run -> post). 

# AMD modules public interface
  
It is strongly recommended that you use anonymous AMD modules, each one living in its own JavaScript file. They have the 
following form:
 
    define([
        // list of the dependencies of this module
    ], function(/* list of injected dependencies in the same order*/) {
    
        // module factory function body (private scope of the module)
    
        return {
            // public signature of the module that can be injected when requested as a dependency of another module
        };
    });

## Lifecycle callbacks

To integrate a module into the lifecycle management of the application, you must add the following code to the public
signature of the module:

    return {
        ...
        
        lifecycle: {
            pre: function (modules, fragments, callback) {},
            run: function (modules, fragments, callback) {},
            post: function (modules, fragments, callback) {}
        }
        
        ...
    };
    
You can omit the unsupported callbacks (for instance, just leaving the pre one). If the loader recognize one or more
lifecycle callbacks, they will be invoked during W20 initialization with the following arguments:

* `modules` is an array of all public modules definitions,
* `fragments` an array of all loaded fragment manifests,
* `callback` is a callback that **MUST** be called to notify the loader that any processing in this phase is done for
this module (including asynchronous processing). If a module do not call its callback, the whole initialization process
is blocked for a specified amount of time. After that, it is cancelled and a timeout error message is displayed.
 
# AngularJS initialization

Before AngularJS initialization, it is guaranteed that:

* All AMD modules needed at startup are loaded, 
* Their factory functions have been run in the correct order,
* Their pre lifecycle callbacks have been run and all modules have notified the loader that they have finished loading
 their asynchronous resources if any.
  
AngularJS initialization is done explicitly with the `angular.bootstrap()` function on the document element. It occurs
in the run lifecycle callback of the `application` module. 

# AngularJS modules

For better modularity and code clarity, it is recommended to use [AngularJS modules](https://docs.angularjs.org/guide/module).
But to correctly initialize AngularJS, the `application` module must know all the full list of top-level declared
AngularJS modules. To expose them properly, you must add the following code to the public signature of AMD modules that
declare AngularJS modules:

    return {
        ...
        
        angularModules: [ 'angularModule1', 'angularModule2', ... ]
        
        ...
    };
    
All `angularModules` arrays of AMD public signature modules are concatenated and the resulting array is passed to 
the `angular.bootstrap()` function. Note that you don't need to add the transitive AngularJS modules.
