AngularJS is a web application framework that makes creating complicated web applications much simpler. One of its best
features is the ability to create directives, or reusable web components. It gives you the ability to create new HTML
tags and attributes, which can dynamically display content in response to data changes, as well as update the data when
appropriate.

They’re a big productivity booster because they let you wrap up a complicated interaction with the DOM in a nice,
reusable package.

# Making directives can be confusing at first

It doesn’t take long to realize that directives are useful, and the ones that are bundled with AngularJS are well
designed, but making directives can feel overwhelming at first. The Angular team has done a good job making directives
extremely powerful and flexible, but all that power comes with some complexity.

Specifically, it’s difficult to understand how to create a directive that responds to data changes, updates data,
responds to events, or exposes events. Basically it boils down to this:

<blockquote>How do I talk to a directive?</blockquote>

This article aims to explain and simplify some of the most common problems you will run in to when creating directives.

# Directive design principles

Directives make our lives easier when you can reuse them without needing to read or edit the source code. Then we can
forget how they work, and just remember what they do.

If you’re coming from a view-centric framework, you may be tempted to separate your application into view-like directive
chunks. For example, if you want to display a list of users, you might create a directive that reads $scope.users and
prints them all out:

    <user-list/>

The `user-list` directive works. I mean, look how DRY it is! However, contrast it with ng-repeat, which handles only the
repetition. Which one could be used in more places? What if you need to display users differently in two places?

<blockquote>A good directive only does one job</blockquote>

`ng-repeat` is better than `user-list` because it does only one job: It only does the repetition part, so you can reuse
it many more situations. It’s job is easy to understand. Instead of making one directive that solves everything, split
it up into several focused directives and glue them together.

<blockquote>A good directive is not application specific</blockquote>

Directives are more widely useful the fewer assumptions they make about your application. A directive that allows the
user to say which property to observe, like ng-model is more useful than one that assumes that $scope.users exists.
As a general rule, if your directive could be useful in a completely different application, it’s more likely to be well
designed and useful even if you never publish it.

That’s enough theory for now. Let’s dive in to some specific examples of common ways you can interact with directives.

# How to display bindings
The first thing to learn is how to make a directive that respects a binding: the ones with double curly braces. For
example, let’s make a directive that displays a photo and a caption.

The first step in any directive design is to choose the names of the attributes that will make up your interface.
I’ve chosen to use photo-src for the image src, and caption for the text. Be careful not to use names that other
directives use, like ng-src unless you know how they work.

Secondly, decide if you want to support only attributes and class names, or elements too. In this case we decide we
want photo to be an element.

    <photo photo-src="{{photo.url}}"
             caption="Taken on: {{photo.date}}"/>

Note that I did not give the directive the whole photo object. It’s better design to allow the directive to work with
any data structure.

To read a binding, use `attrs.$observe`. This will call your callback any time the binding changes. We then use element
to make changes to the DOM.

    app.directive('photo', function() {
        return {
            // required to make it work as an element
            restrict: 'E',

            // replace <photo> with this html
            template: '<figure><img/><figcaption/></figure>',
            replace: true,

            // observe and manipulate the DOM
            link: function($scope, element, attrs) {
                attrs.$observe('caption', function(value) {
                    element.find('figcaption').text(value)
                })

                // attribute names change to camel case
                attrs.$observe('photoSrc', function(value) {
                    element.find('img').attr('src', value)
                })
            }
        }
    });

Alternatively, if your component has its own template, you can do all of this with an isolate scope.

    app.directive('photo', function() {
        return {
            restrict: 'E',
            templateUrl: 'photo.html',
            replace: true,
            // pass these two names from attrs into the template scope
            scope: {
                caption: '@',
                photoSrc: '@'
            }
        }
    });

HTML:

    <figure>
        <img ng-src="{{photoSrc}}"/>
        <figcaption>{{caption}}</figcaption>
    </figure>

# How to read and write data

Some directives need to write data too, like `ng-model`.

Let’s make a button toggle directive. This directive will automatically set its toggle state based on some boolean in
the scope, and when clicked, it will set the boolean.

When passing data this way, you don’t use curly braces, you use an “Expression”. An Expression is any JS code that would
run if it were on the scope. Use expressions whenever you need to write data, or when passing in an Object or Array
into the directive instead of a string.

    <!-- no double curly braces here -->
    <button toggle="preferences.showDetails">Show Details</button>

First we use `=` on the `scope:` settings to make `scope.toggle` available within our directive. Anywhere in our directive,
`scope.toggle` reads and writes to whatever the user set in the attribute.

    app.directive('toggle', function() {
        return {
            scope: {
                toggle: '=',
            },
            link: function($scope, element, attrs) {

Next we use scope.$watch, which calls your function whenever the expression changes. We’ll add and remove the active css
class whenever it changes.

                $scope.$watch("toggle", function(value) {
                    element.toggleClass('active', value)
                })

Finally, let’s listen to the jQuery click event and update the scope. We need to use `scope.$apply` any time we respond
to changes from outside of Angular.

                element.click(function() {
                    $scope.$apply(function() {
                        $scope.toggle = !$scope.toggle
                    })
                })
            }
        }
    });

# How to expose events

Sometimes you want to allow a controller to respond to events from within a directive, like ng-click. Let’s make a
scroll directive, that can call a function whenever a user scrolls that element. In addition, let’s expose the scroll
offset too.

    <textarea scroll="onScroll(offset)">...</textarea>

Similar to the toggle button, we map whatever function they specify in the attribute to `scroll` in our directive’s scope.

    app.directive('scroll', function() {
        return {
            scope: {
                scroll: "&"
            },
            link: function($scope, element, attrs) {

We’ll use jQuery’s scroll event to get what we need. We still need to call `scope.$apply` here, because even though it
calls the handler either way, the handler on the controller might set data.

                element.scroll(function() {
                    $scope.apply(function() {
                        var offset = element.scrollTop()
                        $scope.scroll({offset:offset})
                    })
                })
            }
        }
    });

Notice that we don’t pass the offset in as the first parameter, we pass a hash of available parameters, and make them
available to the expression `onScroll(offset)` that they passed in to the attribute. This is much more flexible than
passing parameters directly, because they can pass other scope variables into their functions, like the current
item in an `ng-repeat`.

# How to have HTML content
Directives can have html content by default, but the minute you specify a template the content is replaced by the
template.

Let’s make a `modal` component: a popup window with a close button, and we would like to set the body as html.

    <modal>
      <p>Some contents</p>
      <p>Put whatever you want in here</p>
    </modal>

Our modal is more than just one element though. When we make the template, we include everything we need, then we put a
special ng-transclude directive in the div that is supposed to take back over and get all the contents.

    <div class="modal">
        <header>
            <button>Close</button>
            <h2>Modal</h2>
        </header>
        <div class="body" ng-transclude></div>
    </div>

Wiring things up is pretty simple. Just set transclude: true to get this to work:

    app.directive('modal', function() {
        return {
            restrict: 'E',
            templateUrl: 'modal.html',
            replace: true,
            transclude: true,
        }
    });

You can combine this with any of the other techniques in this article to make something more complicated.

# How to respond to events

Sometimes you might want to call a function on your directive, in response to an event in your scope. For example, you
might want to close the open modal if the user hits the escape key.

This is almost always an indication that you are stuck on events, when you should be thinking about data flow.
Controllers don’t just contain data, they hold view state too. It’s totally fine to have a windowShown boolean on
your controller, and use ng-show or pass a boolean into your directive as described above.

There are cases where it does make sense to use `$scope.$on` in a directive, but for beginners, try to think about the
problem in terms of changing state instead. Things get much easier in Angular if you focus on data and state instead of
events.

# More Information

There is a lot more to directives. This article doesn’t nearly cover everything they can do. Please visit the [directive
documentation](http://docs.angularjs.org/guide/directive) page for more information.

# Source article

Article copied from [http://seanhess.github.io/2013/10/14/angularjs-directive-design.html](http://seanhess.github.io/2013/10/14/angularjs-directive-design.html).