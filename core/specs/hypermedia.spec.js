/*
 * Copyright (c) 2013-2015 by The SeedStack authors. All rights reserved.
 *
 * This file is part of SeedStack, An enterprise-oriented full development stack.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    '{angular}/angular',

    '{angular-mocks}/angular-mocks',
    '{w20-core}/modules/hypermedia'

], function (angular) {
    'use strict';

    var uriTemplate = {
        '_links': {
            'level1': {
                'href': '/rest/products/{name}',
                'templated': true
            },
            'level2': {
                'href': '/rest/products/{+name}',
                'templated': true
            },
            'self': {
                'href': '/rest/products'
            }
        }
    };

    var noEmbeddedItems = {
        '_links': {
            'aLink': {
                'href': '/rest/aResource'
            },
            'anotherLink': {
                'href': '/rest/anotherResource'
            },
            'self': {
                'href': '/rest/products'
            }
        }
    };

    var fakeProducts = {
        'pages': {
            'current': 0,
            'total': 20
        },
        '_links': {
            'aLink': {
                'href': '/rest/aResource'
            },
            'anotherLink': {
                'href': '/rest/anotherResource'
            },
            'self': {
                'href': '/rest/products'
            },
            'next': {
                'href': '/rest/products?page=2'
            },
            'find': {
                'href': '/rest/products/{name}',
                'templated': true
            }
        },
        '_embedded': {
            'products': [
                {
                    '_links': {
                        'self': {
                            'href': '/rest/products/0'
                        }
                    },
                    'name': 'Neocent',
                    'picture': 'http://placehold.it/700x300',
                    'pricing': 224.29,
                    'description': 'Sint magna eiusmod adipisicing amet enim culpa eu aliqua labore. Mollit magna laborum magna quis aute ullamco. Lorem ex excepteur esse elit.\r\nDeserunt sint laborum ullamco tempor laboris cupidatat. Sint sunt cupidatat consequat cupidatat deserunt amet incididunt. Ea exercitation labore officia mollit enim tempor excepteur cillum esse.\r\n',
                    'details': ['deserunt veniam voluptate voluptate', 'deserunt nulla aliqua aliquip'],
                    'tags': ['tag4', 'tag3', 'tag6']
                },
                {
                    '_links': {
                        'self': {
                            'href': '/rest/products/1'
                        }
                    },
                    'name': 'Quarx',
                    'picture': 'http://placehold.it/700x300',
                    'pricing': 297.8,
                    'description': 'Amet dolor consectetur cupidatat est do eiusmod laborum id ea duis in duis incididunt. Voluptate reprehenderit ipsum duis nostrud. Ad officia enim ipsum voluptate incididunt cillum excepteur ad nisi ad aute ipsum. Nostrud id sit proident non Lorem.\r\nVoluptate commodo eu dolor nostrud sint cillum ad aliqua in sunt sunt sint. Dolore labore et consectetur consectetur culpa culpa cupidatat nulla aliqua est cupidatat ex minim et. Aliquip velit occaecat fugiat proident veniam nisi dolor nostrud ad cillum velit velit. Magna incididunt consequat reprehenderit voluptate officia qui duis amet velit ea id minim officia. Laboris elit ipsum fugiat fugiat pariatur labore eu nulla in.\r\n',
                    'details': ['excepteur mollit aliqua minim', 'id adipisicing non officia'],
                    'tags': ['tag1', 'tag4', 'tag4']
                }
            ]
        }
    };

    var fakeProduct = {
        '_links': {
            'self': {
                'href': '/rest/products/0'
            }
        },
        'picture': 'http://placehold.it/700x300',
        'name': 'Neocent',
        'pricing': 293.66,
        'description': 'Reprehenderit irure quis dolor ex et ipsum culpa et consequat. Aliquip ipsum excepteur enim ipsum cillum dolore occaecat eiusmod mollit pariatur et esse mollit officia. Culpa ullamco minim id dolor id officia dolore enim enim elit. Sunt est ea ullamco laboris amet exercitation commodo irure occaecat nisi veniam adipisicing. Magna cupidatat aliqua et magna sunt veniam et excepteur aute eiusmod deserunt nisi velit',
        'details': ['occaecat duis reprehenderit nostrud', 'aute consectetur aliquip eiusmod'],
        'tags': ['tag3', 'tag5', 'tag3']
    };

    describe('The HypermediaRestAdapter', function () {
        var $rootScope,
            HypermediaRestAdapter,
            $httpBackend,
            $http;

        beforeEach(function () {

            angular.mock.module('w20Hypermedia');

            angular.mock.inject(function ($injector, _$rootScope_, _$http_) {
                $rootScope = _$rootScope_;
                $http = _$http_;
                HypermediaRestAdapter = $injector.get('HypermediaRestAdapter');
                $httpBackend = $injector.get('$httpBackend');

                $rootScope.$digest();
            });

            $httpBackend.whenGET('/api/resources').respond(200, fakeProducts, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/products').respond(200, {response: 'products'}, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/aResource').respond(200, {response: 'aResource'}, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/anotherResource').respond(200, {response: 'anotherResource'}, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/products/0').respond(200, fakeProduct, { 'content-type': 'application/hal+json' });

        });

        afterEach(function () {
            $httpBackend.resetExpectations();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();

        });

        it('should process a promise and returned a processed response', function () {
            var httpPromise = $http.get('/api/resources');
            $httpBackend.flush();

            HypermediaRestAdapter.process(httpPromise).then(function (processedResponse) {
                expect(processedResponse).toBeDefined();
                expect(processedResponse.$links).toBeDefined();
                expect(processedResponse.$embedded).toBeDefined();
                expect(processedResponse._links).toBeDefined();
                expect(processedResponse.pages).toBeDefined();
            });
        });

        it('should add a $links function to the resource', function () {
            var httpPromise = $http.get('/api/resources');
            $httpBackend.flush();

            HypermediaRestAdapter.process(httpPromise).then(function (processedResponse) {
                expect(typeof processedResponse.$links).toBe('function');
            });
        });

        it('should create a resource with the rel passed to the $link function', function () {
            var httpPromise = $http.get('/api/resources');
            $httpBackend.flush();

            HypermediaRestAdapter.process(httpPromise).then(function (processedResponse) {
                var self = processedResponse.$links('self');

                expect(typeof self).toBe('function');
                expect(self.get).toBeDefined();
                expect(self.query).toBeDefined();
                expect(self.save).toBeDefined();
                expect(self.remove).toBeDefined();
                expect(self.delete).toBeDefined();
            });
        });

        it('must call the correct href url if a resource name is passed to the $links method', function () {
            var httpPromise = $http.get('/api/resources');
            HypermediaRestAdapter.process(httpPromise).then(function (processedResponse) {

                var self = processedResponse.$links('self');

                self.get(function (data) {
                    expect(data.response).toBe('products');
                });

            });

            $httpBackend.flush();

        });

        it('should add a $embedded function with the embedded values', function () {
            var httpPromise = $http.get('/api/resources');


            HypermediaRestAdapter.process(httpPromise).then(function (processedResponse) {
                expect(typeof processedResponse.$embedded).toBe('function');
                expect(processedResponse.$embedded('products')[0].name).toBe('Neocent');
            });

            $httpBackend.flush();
        });

        it('should be able to fetch a specified link directly', function () {
            var httpPromise = $http.get('/api/resources');

            HypermediaRestAdapter.process(httpPromise, 'aLink').then(function (processedResponse) {
                expect(processedResponse.aLink).toEqual({response: 'aResource'});
            });

            $httpBackend.flush();
        });

        it('should be able fetch multiple links', function () {
            var httpPromise = $http.get('/api/resources');

            HypermediaRestAdapter.process(httpPromise, ['anotherLink', 'aLink']).then(function (processedResponse) {
                expect(processedResponse.anotherLink).toEqual({response: 'anotherResource'});
                expect(processedResponse.aLink).toEqual({response: 'aResource'});
            });

            $httpBackend.flush();
        });


    });

    describe('The HypermediaRestInterceptor', function () {
        var $rootScope,
            HypermediaRestInterceptor,
            $httpBackend,
            $resource;

        beforeEach(function () {

            angular.mock.module('w20Hypermedia');

            angular.mock.inject(function ($injector, _$rootScope_, _$resource_) {
                $rootScope = _$rootScope_;
                $resource = _$resource_;
                HypermediaRestInterceptor = $injector.get('HypermediaRestInterceptor');
                $httpBackend = $injector.get('$httpBackend');

                $rootScope.$digest();
            });

            $httpBackend.whenGET('/api/resources').respond(200, fakeProducts, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/api/resourcesNoEmbedded').respond(200, noEmbeddedItems, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/products').respond(200, {response: 'products'}, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/aResource').respond(200, {response: 'aResource'}, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/anotherResource').respond(200, {response: 'anotherResource'}, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/uriTemplate').respond(200, uriTemplate, { 'content-type': 'application/hal+json' });
            $httpBackend.whenGET('/rest/products/0').respond(200, fakeProduct, { 'content-type': 'application/hal+json' });

        });

        afterEach(function () {
            $httpBackend.resetExpectations();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });


        it('should be defined', function () {
            expect(HypermediaRestInterceptor).toBeDefined();
        });


        it('should return a resource instance when following links', function () {
            var resource = $resource('/api/resources');

            resource.get(function (data) {
                var firstEmbedded = data.$embedded('products')[0];

                firstEmbedded.$links('self').get(function (item) {

                    expect(item.name).toBe('Neocent');
                    expect(item.$get).toBeDefined();
                    expect(item.$save).toBeDefined();
                    expect(item.$remove).toBeDefined();
                    expect(item.$delete).toBeDefined();
                    expect(item.$query).toBeDefined();
                });
            });

            $httpBackend.flush();
        });

        it('should resolve level 1 uri template', function () {
            var resource = $resource('/rest/uriTemplate');

            resource.get(function (data) {
                var level1 = data.$links('level1', { name: 0 });

                level1.get(function (result) {
                    expect(result.name).toEqual('Neocent');
                });

            });

            $httpBackend.flush();
        });

        it('should resolve level 2 uri template', function () {
            var resource = $resource('/rest/uriTemplate');

            resource.get(function (data) {
                var level2 = data.$links('level2', { name: 0 });

                level2.get(function (result) {
                    expect(result.name).toEqual('Neocent');
                });

            });

            $httpBackend.flush();
        });


    });

    describe('The json-home service', function () {

        var jsonHomeDocument = {
            'resources': {
                'http://example.org/rel/widgets': {
                    'href': '/widgets/'
                },
                'http://example.org/rel/widget': {
                    'href-template': '/widgets/{widget_id}',
                    'href-vars': {
                        'widget_id': 'http://example.org/param/widget'
                    },
                    'hints': {
                        'allow': ['GET', 'PUT', 'DELETE', 'PATCH'],
                        'formats': {
                            'application/json': {}
                        },
                        'accept-patch': ['application/json-patch'],
                        'accept-post': ['application/xml'],
                        'accept-ranges': ['bytes']
                    }
                }
            }
        };

        var $rootScope,
            $httpBackend,
            $http,
            homeService;

        beforeEach(function () {

            angular.mock.module('w20Hypermedia');

            angular.mock.inject(function ($injector, _$rootScope_, _$http_, _HomeService_) {
                $rootScope = _$rootScope_;
                $http = _$http_;
                homeService = _HomeService_;
                $httpBackend = $injector.get('$httpBackend');

                $rootScope.$digest();
            });

            $httpBackend.whenGET('/widgets').respond(200, {widgets: 'blah'}, { 'content-type': 'application/json' });

        });

        afterEach(function () {
            $httpBackend.resetExpectations();
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });


        it('should register a home resource and be able to return its definition', function () {
            var homeResource = {};
            homeResource['http://example.org/rel/widgets'] = jsonHomeDocument.resources['http://example.org/rel/widgets'];
            homeService('mock').register(homeResource);
            expect(homeService('mock').getDefinition('http://example.org/rel/widgets')).toBe(homeResource['http://example.org/rel/widgets']);
        });

        it('should provide a $resource object from a registered home resource', function () {
            var homeResource = {};
            homeResource['http://example.org/rel/widgets'] = jsonHomeDocument.resources['http://example.org/rel/widgets'];
            homeService('mock').register(homeResource);

            var widgets = homeService('mock').resource('http://example.org/rel/widgets');

            expect(widgets).toBeDefined();
            expect(typeof widgets.get).toBe('function');
            expect(typeof widgets.query).toBe('function');

            widgets.get(function (data) {
                expect(data.widgets).toBe('blah');
            });

            $httpBackend.flush();
        });

    });


});
