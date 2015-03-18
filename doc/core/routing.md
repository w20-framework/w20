AngularJS provides powerful routing capabilities which consists in a matching between a portion of the window URL and 
a route definition. This route definition define the contents and behavior of the view that will be displayed inside the 
HTML tag containing the `ngView` attribute. To learn more about AngularJS routing, please check 
[this documentation](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider).

# Fragment-declared routes

Although the AngularJS programmatic way of defining the application routing can be used unaltered in any W20 application,
a simpler declarative way of defining the routing is available. It is done through the `routes` section of fragment
manifests:

    "routes": {
        "/route1": {
            ...
        },
        "/route2": {
            ...
        }
    }

The `application` module will process the `routes` section of all fragments and register the valid routes in the AngularJS
routing system. The two components of a W20 route definition are:

* The route paths which are specified by the keys of the `routes` object. To ensure route uniqueness in an application,
 the fragment identifier is used as a route path prefix. For example, if the fragment identifier is `fragment1` the full
 route path registered in AngularJS routing for `/route1` is `/fragment1/route1`. 
* The route definitions which are specified as an object for each route path.  

## Route types

A route definition should contain a `type` attribute. If it is not present, a route type of `view` is assumed which is
a standard AngularJS route.

### View route type
 
A `view` route is a standard AngularJS route, which is minimally processed by W20. If it contains a `templateUrl`, its
value is resolved into a full URL by the RequireJS function `toUrl()`. As such, every fragment alias (like `{fragment1}`)
is resolved.

### Sandbox route type

A `sandbox` route type is a W20-specific route type which encapsulate the page denoted by the `url` attribute into an
iframe. It is useful to add any pre-existing HTML pages into a W20 application such as legacy application screens. The
`url` attribute is resolved into a full URL by the RequireJS function `toUrl()`.

### Custom route types

Any custom route type can be registered by using the `registerRouteHandler()` function of the `application` module public
definition:

    define([
        '{w20-core}/modules/application'
    ], function(application) {
        ...
        
        application.registerRouteHandler('myCustomType', function (route) {
            // analyze and transform the route object here        
        
            return route;
        });
        
        ...
    });
    
The handler will be invoked for each detected route of type `myCustomType`. It is required that the returned route
object is a valid AngularJS route definition.

# Additional route metadata

Additional attributes can be attached to route definition and will be ignored by AngularJS. When retrieving the route through
the AngularJS `$route` service, these attributes will be preserved, allow for further processing during the execution
of the application.

## W20 route metadata

W20 adds a limited set of attributes on all routes:

* `type`: the type attribute is automatically added if not present (with the `view` value),
* `path`: the full path of the route,
* `category`: the category of the route (which can be used to classify the routes for navigation) is added with a default value of `__top`. 
* `i18n`: the i18n key for the route name is added with a default value of `application.view.normalized.route.path`. Path
normalization consists of replacing slashes with dots. As such, the `/fragment1/route1` fragments will have a default i18n
key of `application.view.fragment1.route1`.
* `resolve`: a resolve object will be added to check for route security and for any additional custom check defined by the
`check` attribute on the route definition (which must reference by name a custom check function registered with AngularJS
injector through a `module.value('myCheck', function checkFn() { ... });` and returning a promise). The routing is suspended
until the promise is resolved (or rejected).

## Custom metadata

Any additional metadata can be added to the route for custom purposes, but be aware to not interfere with W20 route metadata
as any custom attribute of the same name will be overwritten before any custom route handler is called.