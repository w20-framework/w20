As your application grows it becomes harder to assert that all your features are still working correctly. Whether you are
doing some refactoring, upgrading a library version or adding new features, you would want a mechanism to protect yourself
from regression. Testing is well known for Java EE server side application but your front end web application also deserves
unit testing especially when complex logic are involved.

Unit testing as the name implies is about testing individual units of code. Unit tests try to answer questions such as
"Did I think about the logic correctly?" or "Does the sort function order the list in the right order?".

<div class="callout callout-info">
<p>W20 itself is agnostic of the testing framework and the test runner but you may have good results with respectively
<a href="http://jasmine.github.io/">Jasmine</a> and <a href="http://karma-runner.github.io/">Karma</a>.</p>
</div>

# Writing unit tests

Instead of repeating in a less complete way what the documentation on Jasmine [Jasmine](http://jasmine.github.io/2.1/introduction.html)
and [AngularJS](http://docs.angularjs.org/guide/dev_guide.unit-testing) have to offer on testing, we are going
to follow an example and see how we can test our individual unit of code.

## The code to test

We will use the example of a small CRUD application for managing users. The code that we will test consists of a service
'UsersService' that retrieve users and an angular controller which holds some functions : addUser, loadUsers and clearUsers.


    module.factory('UsersService', [ '$resource', function($resource) {
        return {
            usersResource: $resource(require.toUrl('{fragmentRoot}/data/users.json'))
        };
    }]);

    module.controller('UserController', [ '$scope', 'UsersService', function ($scope, usersService) {

        var userId = 0;
        var Users = usersService.usersResource;

        // User array initialization
        $scope.users = [];

        // This function add the current entered user to the user array
        $scope.addUser = function () {
            $scope.users.push({
                id: (++userId).toString(),
                firstName: $scope.firstName,
                lastName: $scope.lastName,
            });
        };

        // This function loads users from a resource
        $scope.loadUsers = function () {
            Users.query(function (result) {
                for (var i = 0; i < result.length; i++)
                    if (result[i].id > userId)
                        userId = result[i].maxid;
                $scope.users = result;
            });
        };

        // This function clears the user array
        $scope.clearUsers = function () {
            $scope.users = [];
        };

    ]);


We can now start writing some tests in our user.test.js file.

## Unit test structure

A <b>test suite</b> begins with a call to the global Jasmine function `describe` with two parameters: a string and a function. The string is a name or title
for a spec suite – usually what is under test. The function is a block of code that implements the suite.

    describe("A suite", function() {
      it("contains spec with an expectation", function() {
        expect(true).toBe(true);
      });
    });

<b>Specs</b> are defined by calling the global Jasmine function `it`, which, like `describe` takes a string and a function.
The string is a title for this spec and the function is the spec, or test. A spec contains one or more expectations that test the state of the code under test.
An expectation in Jasmine is an assertion that can be either true or false. A spec with all true expectations is a passing spec.
A spec with one or more expectations that evaluate to false is a failing spec.

    describe("A suite of spec", function() {
      var a;
      it("is a spec and variable a should be true ", function() {
        a = true;
        expect(a).toBe(true);
      });
    });

Jasmine also provides the global `beforeEach` and `afterEach` functions.
As the name implies the beforeEach function is called once before each spec in the describe is run and the afterEach function is called once after each spec.

    describe("A spec (with setup and tear-down)", function() {
      var foo;

      beforeEach(function() {
        foo = 0;
        foo += 1;
      });

      afterEach(function() {
        foo = 0;
      });

      it("is just a function, so it can contain any code", function() {
        expect(foo).toEqual(1);
      });

      it("can have more than one expectation", function() {
        expect(foo).toEqual(1);
        expect(true).toEqual(true);
      });
    });

# Example

With those basic concepts we can now start writing some tests for our code sample. Before writing the test suite we want
to get our hand on the service and controller inside our test file. We do this by using the `beforeEach` function :

    define([
        '{angular}/angular',
        '{angular-mocks}/angular-mocks'
        '{my-fragment}/modules/user'
    ], function(angular) {
        var userController, $scope;
    
        beforeEach(function () {
            // Load the user module, which contains the service and controller
            module('user');
    
            // inject services that will allow us to get our hands on the required components we want to unit test
            inject(function ($injector, $controller, $rootScope) {
    
                // Create an object 'serviceMock' with a property 'usersResource'.
                // We do this so that later on we can use it as a spy for call on the UsersService.usersResource.query()
                serviceMock = {
                           usersResource: {}
                       };
    
                // Get a new child scope from the root scope which will served in our specs
                $scope = $rootScope.$new();
    
                // Get the 'UserController' and map its $scope dependency to the one defined above and its
                // 'UsersService' dependency as the 'serviceMock' we defined above
                userController = $controller('UserController', {
                    $scope: $scope,
                    UsersService: serviceMock
                });
            });
        });
    });

We now have all our components ready for our test suite. Remember that a test suite is defined with `describe` :

     describe("the user controller", function () { ... }

Inside of this test suite we can write our specs :

    // Check that initialization is correct
    it("should have empty users collection when initialized", function () {
            // assert that $scope.users exists
            expect($scope.users).toBeDefined();
            // assert it is empty
            expect($scope.users.length).toEqual(0);
    });

    // Unit test the adduser() method
    it("should be able to add items to the users collection", function () {
           $scope.firstName = 'Robert';
           $scope.lastName = 'SMITH';

           $scope.addUser();

           expect($scope.users.length).toEqual(1);
           expect($scope.users).toContain({
               id: '1',
               firstName: 'Robert',
               lastName: 'SMITH'
           });
       });

    // Unit test the clearUsers() method
    it("should be able to clear the users collection", function () {
            $scope.users.push({
                id: '1',
                firstName: 'Robert',
                lastName: 'SMITH'
            });
            expect($scope.users.length).toEqual(1);

            $scope.clearUsers();

            expect($scope.users.length).toEqual(0);
        });

    // Unit test the loadUsers() method
    it("should be able to load data to the users collection", function () {

            // We are going to turn query() into a dummy function;
            // The .andCallFake() specify what the call to query()
            // should do. We created a spy. Then we test it (with loadUsers())
            //
            serviceMock.usersResource.query = jasmine.createSpy().andCallFake(function (callback) {
                callback([
                    {
                        id: '1',
                        firstName: 'Robert',
                        lastName: 'SMITH'
                    }
                ]);
            });

            // loadUsers() will trigger a call to usersService.usersResource.query
            // which is mocked by serviceMock.usersResource.query
            $scope.loadUsers();

            expect($scope.users.length).toEqual(1);
            expect($scope.users).toContain({
                id: '1',
                firstName: 'Robert',
                lastName: 'SMITH'
            });

            $scope.firstName = 'Anna';
            $scope.lastName = 'O\'HARA';
            $scope.addUser();

            expect($scope.users.length).toEqual(2);
            expect($scope.users).toContain({
                id: '1',
                firstName: 'Robert',
                lastName: 'SMITH'
            }, {
                id: '2',
                firstName: 'Anna',
                lastName: 'O\'HARA'
            });
        });


# Full code

To conclude here is the entire user.test.js file :

    define([
        '{angular}/angular',
        '{angular-mocks}/angular-mocks'
        '{my-fragment}/modules/user'
    ], function(angular) {
        var userController, $scope;
    
        beforeEach(function () {
            module('user');
            inject(function ($injector, $controller, $rootScope) {
                serviceMock = {
                    usersResource: {}
                };
    
                $scope = $rootScope.$new();
    
                userController = $controller('UserController', {
                    $scope: $scope,
                    UsersService: serviceMock
                });
            });
        });
    
        describe("the user controller", function () {
            it("should have empty users collection when initialized", function () {
                expect($scope.users).toBeDefined();
                expect($scope.users.length).toEqual(0);
            });
    
            it("should be able to add items to the users collection", function () {
                $scope.firstName = 'Robert';
                $scope.lastName = 'SMITH';
                $scope.addUser();
    
                expect($scope.users.length).toEqual(1);
                expect($scope.users).toContain({
                    id: '1',
                    firstName: 'Robert',
                    lastName: 'SMITH'
                });
            });
    
            it("should be able to clear the users collection", function () {
                $scope.users.push({
                    id: '1',
                    firstName: 'Robert',
                    lastName: 'SMITH'
                });
    
                expect($scope.users.length).toEqual(1);
                $scope.clearUsers();
                expect($scope.users.length).toEqual(0);
            });
    
            it("should be able to load data to the users collection", function () {
                serviceMock.usersResource.query = jasmine.createSpy().andCallFake(function (callback) {
                    callback([
                        {
                            id: '1',
                            firstName: 'Robert',
                            lastName: 'SMITH'
                        }
                    ]);
                });
                $scope.loadUsers();
    
                expect($scope.users.length).toEqual(1);
                expect($scope.users).toContain({
                    id: '1',
                    firstName: 'Robert',
                    lastName: 'SMITH'
                });
    
                $scope.firstName = 'Anna';
                $scope.lastName = 'O\'HARA';
                $scope.addUser();
    
                expect($scope.users.length).toEqual(2);
                expect($scope.users).toContain({
                    id: '1',
                    firstName: 'Robert',
                    lastName: 'SMITH'
                }, {
                    id: '2',
                    firstName: 'Anna',
                    lastName: 'O\'HARA'
                });
            });
        });
    });




