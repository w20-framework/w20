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
    'module',
    'w20',
    'require',

    '{angular}/angular',
    '{uri.js}/URITemplate',

    '{angular-resource}/angular-resource'

], function (_module, w20, require, angular, URITemplate) {

    'use strict';

    var HYPERMEDIA_TYPE = 'application/hal+json';

    /**
     * @module w20Hypermedia
     *
     * Module to ease the work with hypermedia api.
     */
    var module = angular.module('w20Hypermedia', ['ngResource']),
        moduleConfig = _module && _module.config() || {};

    /**
     * Default configuration.
     */
    var config = {
        api: moduleConfig.api || {},

        interceptAll: moduleConfig.interceptAll || true,
        linksKey: moduleConfig.linksKey || '_links',
        linksHrefKey: moduleConfig.linksHrefKey || 'href',
        linksSelfLinkName: moduleConfig.linksSelfLinkName || 'self',
        embeddedKey: moduleConfig.embeddedKey || '_embedded',
        embeddedNewKey: moduleConfig.embeddedNewKey || '$embedded',
        resourcesKey: moduleConfig.resourcesKey || '$links',
        metadata: moduleConfig.metadata || '$metadata',

        resourcesFunction: undefined,
        fetchFunction: undefined,
        fetchAllKey: '_allLinks'
    };

    var api = {};

    /**
     * @module w20Hypermedia
     *
     * Apply hypermedia interceptor globally if configured
     */
    module.config(['HypermediaRestInterceptorProvider', function (HypermediaRestInterceptorProvider) {
        if (config.interceptAll) {
            HypermediaRestInterceptorProvider.apply();
        }
    }]);


    /**
     * @module w20Hypermedia
     *
     * Register the json-home endpoints if configured
     */
    module.run(['HomeService', function (homeService) {
        var resource;

        angular.forEach(api, function (apiConfig, endpoint) {
            angular.forEach(apiConfig, function (definition, rel) {
                resource = {};
                resource[rel] = definition;
                homeService(endpoint).register(resource);
            });

        });

    }]);

    /**
     * @module w20Hypermedia
     *
     * Service for registering json-home entry points resources
     */
    module.factory('HomeService', ['$resource', function ($resource) {

        var home = {};

        return function (endpoint) {

            function validate(resource) {
                if (!angular.isObject(resource)) {
                    throw new Error('The given resource configuration is not an object, got ' + typeof resource);
                }
                if (Object.getOwnPropertyNames(resource).length !== 1) {
                    throw new Error('The given resource configuration has not a unique rel');
                }
                var rel = Object.keys(resource)[0];
                if (home[rel]) {
                    throw new Error('The given resource name already exists');
                }
                if (!resource[rel].href && !resource[rel]['href-template']) {
                    throw new Error('The given resource rel must have exactly one of the "href" and "href-vars" properties');
                }
                if (resource[rel]['href-template'] && !resource[rel]['href-vars']) {
                    throw new Error('The given resource rel has an "href-template" properties but no "href-vars"');
                }
            }

            function isRegistered(rel) {
                return home.hasOwnProperty(endpoint) && home[endpoint].hasOwnProperty(rel);
            }


            return {
                /**
                 * Register a new home resource
                 *
                 * @param {object} resource the value of the home resource
                 */
                register: function (resource) {
                    validate(resource);
                    var rel = Object.keys(resource)[0];
                    home[endpoint] = home[endpoint] ? home[endpoint] : {};
                    home[endpoint][rel] = resource[rel];
                },
                /**
                 * Return the home resource definition
                 * @param rel link relation of the resource
                 * @returns {object} the home resource configuration
                 */
                getDefinition: function (rel) {
                    if (isRegistered(rel)) {
                        return home[endpoint][rel];
                    } else {
                        throw new Error('No registered home resources with rel "' + rel + '"');
                    }
                },
                /**
                 * Provide a $resource object configured from a registered home resource.
                 * This method allow to enter an hypermedia endpoint
                 *
                 * @param rel the link relation of the resource
                 * @param {object} parameters the parameters for the resource url
                 * @param {object} actions optional $resource method actions
                 * @param {object} options additional $resource method options
                 * @returns {object} the $resource for this home resource
                 */
                enter: function (rel, parameters, actions, options) {
                    var homeResource = this.getDefinition(rel);

                    // Override the default actions for the entry point $resource
                    // We only use get, other actions will not do anything
                    // Also specify the accepted content-type to be of type hypermedia
                    actions = actions ? actions : {};
                    angular.extend(actions, {
                        query: angular.noop,
                        delete: angular.noop,
                        remove: angular.noop,
                        save: angular.noop,
                        get: {
                            method: 'GET',
                            headers: { 'accept': HYPERMEDIA_TYPE }
                        }
                    });

                    if (homeResource.href) {
                        return $resource(homeResource.href, parameters, actions, options);
                    }
                    else {
                        var url = new URITemplate(homeResource['href-template']);
                        url = url.expand(parameters);
                        return $resource(url, undefined, actions, options);
                    }
                }
            };
        };


    }]);


    /**
     * @module w20Hypermedia
     *
     * Provider for the HypermediaRestAdapter which is the core of this module.
     */
    module.provider('HypermediaRestAdapter', function () {

        return {

            /**
             * Sets and gets the configuration object.
             *
             * @param {object} newConfig the new configuration to be set
             * @returns {object} the configuration object
             */
            config: function (newConfig) {
                // if the configuration object is 'undefined' then return the configuration object
                if (typeof newConfig !== 'undefined') {
                    // throw an error if the given configuration is not an object
                    if (!angular.isObject(newConfig)) {
                        throw new Error('The given configuration "' + newConfig + '" is not an object.');
                    }

                    // check if the given resource function is not undefined and is of type function
                    if (newConfig.resourcesFunction !== undefined && typeof(newConfig.resourcesFunction) !== 'function') {
                        throw new Error('The given resource function "' + newConfig.resourcesFunction + '" is not of type function.');
                    }

                    // check if the given fetch function is not undefined and is of type function
                    if (newConfig.fetchFunction !== undefined && typeof(newConfig.fetchFunction) !== 'function') {
                        throw new Error('The given fetch function "' + newConfig.fetchFunction + '" is not of type function.');
                    }

                    // override the default configuration properties with the given new configuration
                    config = deepExtend(config, newConfig);
                }
                return config;
            },

            $get: ['$injector', function ($injector) {

                /**
                 * Returns the Angular $resource method which is configured with the given parameters.
                 *
                 * @param {object} link the resource object (link property value)
                 * @param {object} parameters $resource method parameters
                 * @param {object} actions optional $resource method actions
                 * @param {object} options additional $resource method options
                 * @returns {*}
                 */
                function resourcesFunction(link, parameters, actions, options) {
                    var url;
                    // process the url and call the resources function with the given parameters
                    if (link.templated) {
                        url = new URITemplate(link[config.linksHrefKey]);
                        url = url.expand(parameters);
                        // set parameters to undefined since they are resolved by the uri template expansion,
                        // otherwise it will duplicate parameters
                        parameters = undefined;
                    } else {
                        url = link[config.linksHrefKey];
                    }

                    if (config.resourcesFunction === undefined) {

                        actions = actions ? actions : {};
                        angular.extend(actions, {
                            'get': { method: 'GET', headers: { 'accept': HYPERMEDIA_TYPE } },
                            'save': { method: 'POST', headers: { 'accept': HYPERMEDIA_TYPE } },
                            'query': { method: 'GET', headers: { 'accept': HYPERMEDIA_TYPE } },
                            'remove': { method: 'DELETE', headers: { 'accept': HYPERMEDIA_TYPE } },
                            'delete': { method: 'DELETE', headers: { 'accept': HYPERMEDIA_TYPE } }
                        });

                        return $injector.get('$resource')(url, parameters, actions, options);
                    } else {
                        return config.resourcesFunction(url, parameters, actions, options);
                    }
                }

                /**
                 * Fetches the given URL and adds the response to the given data object as a property
                 * with the name of the given key.
                 *
                 * @param {string} url the url at which the resource is available
                 * @param {string} key the key inside the data object where to store the returned response
                 * @param {object} data the data object reference in which the response is stored
                 * @param {[string]|string} fetchLinkNames the fetch link names to allow to process the fetched response
                 * @param {boolean} recursive true if the fetched response should be processed recursively with the
                 * adapter, false otherwise
                 */
                function fetchFunction(url, key, data, fetchLinkNames, recursive) {
                    if (config.fetchFunction === undefined) {
                        var promisesArray = [];

                        promisesArray.push($injector.get('$http').get(url)
                            .then(function (responseData) {

                                // wrap the response again with the adapter and return the promise
                                if (recursive) {
                                    return processData(responseData.data, fetchLinkNames, true).then(function (processedData) {
                                        data[key] = processedData;
                                    });
                                } else {
                                    return processData(responseData.data).then(function (processedData) {
                                        data[key] = processedData;
                                    });
                                }
                            }, function (error) {
                                if (error.status !== 404) {
                                    // just reject the error if its not a 404 as there are links which return a 404 which are not set
                                    return $injector.get('$q').reject(error);
                                }
                            }));

                        // wait for all promises to be resolved and return a new promise
                        return $injector.get('$q').all(promisesArray);
                    } else {
                        return config.fetchFunction(url, key, data, fetchLinkNames, recursive);
                    }
                }

                /**
                 * The actual adapter method which processes the given JSON data object and adds
                 * the wrapped resource property to all embedded elements where resources are available.
                 *
                 * @param {object} promiseOrData a promise with the given JSON data or just the JSON data
                 * @param {object|string} fetchLinkNames the link names to be fetched automatically or the
                 * 'fetchAllLinkNamesKey' key from the config object to fetch all links except the 'self' key.
                 * @param {boolean} recursive true if the automatically fetched response should be processed recursively with the
                 * adapter, false otherwise
                 * @returns {object} the processed JSON data
                 */
                var processData = function processDataFunction(promiseOrData, fetchLinkNames, recursive) {

                    /**
                     * Gets the processed URL of the given resource name form the given data object.
                     * @param {object} data the given data object
                     * @param {string} resourceName the resource name from which the URL is retrieved
                     * @returns {string} the processed url
                     */
                    function getProcessedUrl(data, resourceName) {
                        // get the raw URL out of the resource name and check if it is valid
                        var url = data[config.linksKey][resourceName][config.linksHrefKey];

                        if (url === undefined || !url) {
                            throw new Error('The provided resource name "' + resourceName + '" has no valid URL in the "' +
                                config.linksHrefKey + '" property.');
                        }

                        // extract the template parameters of the raw URL
                        return extractUrl(url, data[config.linksKey][resourceName].templated);
                    }

                    // convert the given promise or data to a $q promise
                    return $injector.get('$q').when(promiseOrData).then(function (data) {

                        /**
                         * Wraps the Angular $resource method and adds the ability to retrieve the available resources.
                         * todo If no parameter is given it will return an array with the available resources in this object.
                         *
                         * @param {string|object} resource the resource name to be retrieved or an object which holds the
                         * resource name and the parameters
                         * @param {object} paramDefaults optional $resource method parameter defaults
                         * @param {object} actions optional $resource method actions
                         * @param {object} options additional $resource method options
                         * @returns {object} the result of the $resource method or the available resources as a resource object array
                         *
                         * @see https://docs.angularjs.org/api/ngResource/service/$resource
                         */
                        var resources = function (resource, paramDefaults, actions, options) {
                            var resources = this[config.linksKey],
                                parameters = paramDefaults;

                            if (typeof resource === 'undefined') {
                                // return the available resources as resource object array if the resource object parameter is not set
                                var availableResources = [];
                                angular.forEach(resources, function (value, key) {

                                    // if the URL is templated add the available template parameters to the returned object
                                    if (value.templated) {
                                        var templateParameters = extractTemplateParameters(value[config.linksHrefKey]);
                                        availableResources.push({'name': key, 'parameters': templateParameters});
                                    } else {
                                        availableResources.push({'name': key});
                                    }
                                });
                                return availableResources;
                            }
                            // if a resource object is given process it
                            else if (angular.isObject(resource)) {
                                if (!resource.name) {
                                    throw new Error('The provided resource object must contain a name property.');
                                }

                                var resourceObjectParameters = resource.parameters;

                                // if the default parameters and the resource object parameters are objects, then merge these two objects
                                // if not use the objects themselves as parameters
                                if (paramDefaults && angular.isObject(paramDefaults)) {
                                    if (resourceObjectParameters && angular.isObject(resourceObjectParameters)) {
                                        parameters = angular.extend(angular.copy(paramDefaults), angular.copy(resourceObjectParameters));
                                    } else {
                                        parameters = angular.copy(paramDefaults);
                                    }
                                } else {
                                    if (resourceObjectParameters && angular.isObject(resourceObjectParameters)) {
                                        parameters = angular.copy(resourceObjectParameters);
                                    }
                                }

                                // remove parameters which have an empty string as value
                                angular.forEach(parameters, function (value, key) {
                                    if (value === '') {
                                        delete parameters[key];
                                    }
                                });

                                return resourcesFunction(data[config.linksKey][resource.name], parameters, actions, options);
                            }
                            // if it is a url
                            else if (resource in resources) {

                                return resourcesFunction(data[config.linksKey][resource], parameters, actions, options);

                            }


                        };

                        // if the given data object has a data property use this for the further processing as the
                        // standard httpPromises from the $http functions store the response data in a data property
                        if (data && data.data) {
                            data = data.data;
                        }

                        // throw an exception if given data parameter is not of type object
                        if (!angular.isObject(data) || data instanceof Array) {
                            return $injector.get('$q').reject('Given data "' + data + '" is not of type object.');
                        }

                        // throw an exception if given fetch links parameter is not of type array or string
                        if (fetchLinkNames && !(fetchLinkNames instanceof Array || typeof fetchLinkNames === 'string')) {
                            return $injector.get('$q').reject('Given fetch links "' + fetchLinkNames + '" is not of type array or string.');
                        }

                        var processedData,
                            promisesArray = [];

                        // only add the resource method to the object if the links key is present
                        if (config.linksKey in data) {

                            // add Angular resources property to object
                            var resourcesObject = {};
                            resourcesObject[config.resourcesKey] = resources;
                            processedData = angular.extend(angular.copy(data), resourcesObject);

                            // if there are links to fetch, then process and fetch them
                            if (fetchLinkNames !== undefined) {

                                // process all links
                                angular.forEach(data[config.linksKey], function (linkValue, linkName) {

                                    // if the link name is not 'self' then process the link name
                                    if (linkName !== config.linksSelfLinkName) {

                                        // check if:
                                        // 1. the all link names key is given then fetch the link
                                        // 2. the given key is equal
                                        // 3. the given key is inside the array
                                        if (fetchLinkNames === config.fetchAllKey || (typeof fetchLinkNames === 'string' && linkName === fetchLinkNames) || (fetchLinkNames instanceof Array && fetchLinkNames.indexOf(linkName) >= 0)) {
                                            promisesArray.push(fetchFunction(getProcessedUrl(data, linkName), linkName, processedData, fetchLinkNames, recursive));
                                        }
                                    }
                                });
                            }
                        }

                        // only move the embedded values to a top level property if the embedded key is present
                        if (config.embeddedKey in data) {

                            // make a defensive copy if the processedData variable is undefined
                            if (!processedData) {
                                processedData = angular.copy(data);
                            }

                            var embeddedObject = processedData[config.embeddedKey];

                            // recursively process all contained objects in the embedded value array
                            angular.forEach(embeddedObject, function (value, key) {

                                // if the embeddedResourceName config variable is set to true, process each resource name array
                                if (value instanceof Array && value.length > 0) {
                                    var processedDataArray = [],
                                        processedDataArrayPromise;

                                    angular.forEach(value, function (arrayValue, arrayKey) {
                                        processedDataArrayPromise = processDataFunction({data: arrayValue}, fetchLinkNames, recursive).then(function (processedResponseData) {
                                            processedDataArray[arrayKey] = processedResponseData;
                                        });
                                        promisesArray.push(processedDataArrayPromise);
                                    });

                                    // after the last data array promise has been resolved add the result to the processed data
                                    if (processedDataArrayPromise) {
                                        processedDataArrayPromise.then(function () {
                                            embeddedObject[key] = processedDataArray;
                                        });
                                    }
                                } else {
                                    // single objects are processed directly
                                    promisesArray.push(processDataFunction({data: value}, fetchLinkNames, recursive).then(function (processedResponseData) {
                                        embeddedObject[key] = processedResponseData;
                                    }));
                                }
                            });

                            // add an embedded lookup function and remove the original embedded property on the resource
                            moveEmbedded(processedData, config.embeddedKey, config.embeddedNewKey, embeddedObject);
                        }

                        return $injector.get('$q').all(promisesArray).then(function () {

                            // return the original data object if no processing is done
                            return processedData ? processedData : data;
                        });
                    });


                };

                // return an object with the processData function
                return {process: processData};
            }]
        };

    });

    /**
     * @module w20Hypermedia
     *
     * Provider for the interceptor which wraps the HypermediaRestAdapter around the response object.
     */
    module.provider('HypermediaRestInterceptor', ['$httpProvider', 'HypermediaRestAdapterProvider', function ($httpProvider) {
            return {

                apply: function () {
                    $httpProvider.interceptors.push('HypermediaRestInterceptor');
                },

                $get: ['HypermediaRestAdapter', '$q', function (HypermediaRestAdapter, $q) {

                    return {
                        response: function (response) {

                            // intercept hal resource for client processing, return other content type untouched
                            if (response.headers()['content-type'] === HYPERMEDIA_TYPE) {

                                toAbsoluteLinks(response.data, response.config.url);

                                return HypermediaRestAdapter.process(response.data).then(function (processedResponse) {

                                    response.data = processedResponse;

                                    return response || $q.when(response);
                                });

                            } else {
                                return response;
                            }
                        }
                    };
                }]

            };
        }]
    );

    /**
     * Prefix the links in the data structure with a host prefix
     *
     * @param data the original data structure
     * @param originUrl the url from which the data originated
     */
    function toAbsoluteLinks(data, originUrl) {

        var host = stripTrailingSlash(getHost(originUrl));

        function prefixLinks(links) {
            if (host) {
                angular.forEach(links, function (linkValue, linkKey) {
                    if (linkValue.href.charAt(0) === '/') {
                        linkValue.href = host + linkValue.href;
                        links[linkKey] = linkValue;
                    }
                });
            }
        }

        function walkTree(node, action) {

            action(node[config.linksKey]);

            angular.forEach(node[config.embeddedKey], function (embedded) {
                if (embedded instanceof Array) {
                    angular.forEach(embedded, function (embeddedItem) {
                        walkTree(embeddedItem, action);
                    });

                } else {
                    walkTree(embedded, action);

                }
            });
        }

        walkTree(data, prefixLinks);

    }


    /**
     * Makes a deep extend of the given destination object and the source objects.
     *
     * @param {object} destination the destination object
     * @returns {object} a copy of the extended destination object
     */
    function deepExtend(destination) {
        angular.forEach(arguments, function (obj) {
            if (obj !== destination) {
                angular.forEach(obj, function (value, key) {
                    if (destination[key] && destination[key].constructor && destination[key].constructor === Object) {
                        deepExtend(destination[key], value);
                    } else {
                        destination[key] = value;
                    }
                });
            }
        });
        return angular.copy(destination);
    }

    /**
     * Add an embedded lookup function and remove the original embedded property on the resource
     *
     * @param {object} object the object in which the source key exists and destination key is created
     * @param {string} sourceKey the source key from which the array is moved
     * @param {string} destinationKey the destination key to which the array is moved
     * @param {object} embeddedObject the object representing embedded resources

     * @returns {object} the processed object
     */
    function moveEmbedded(object, sourceKey, destinationKey, embeddedObject) {
        if (embeddedObject) {
            var extender = {};

            extender[destinationKey] = function (key) {
                return key ? embeddedObject[key] : embeddedObject;
            };

            object = angular.extend(object, extender);
            delete object[sourceKey];
        }
    }

    /**
     * Extracts the url out of a url string. If template parameters exist, they will be removed from the
     * returned url.
     *
     * Removes the template parameters of the given url. e.g. from this url
     * 'http://localhost:8080/categories{?page,size,sort}' it will remove the curly braces
     * and everything within.
     *
     * @param {string} url the url string from which to extract the url
     * @param {boolean} templated true if the url is templated
     * @returns {string} the url of the resource object
     */
    function extractUrl(url, templated) {
        if (templated) {
            url = url.replace(/{.*}/g, '');
        }
        return url;
    }


    /**
     * Returns the template parameters of the given url as object. e.g. from this url
     * 'http://localhost:8080/categories{?page,size,sort}' it will return the following object:
     * {'page': '', 'size': '', 'sort': ''}
     *
     * @param {string} url the url with the template parameters
     * @returns {object} the object containing the template parameters
     */
    function extractTemplateParameters(url) {
        var templateParametersObject = {};

        var regexp = /{\?(.*)}/g;
        var templateParametersArray = regexp.exec(url)[1].split(',');

        angular.forEach(templateParametersArray, function (value) {
            templateParametersObject[value] = '';
        });

        return templateParametersObject;
    }

    /**
     * Strip potential trailing slash in url
     *
     * @param url the url to remove potential trailing slash from
     * @returns {string} url the url without trailing slash
     */
    function stripTrailingSlash(url) {
        var arr = url.split('/');
        if (arr[arr.length - 1] === '') {
            arr.pop();
        }
        return arr.join('/');
    }

    /**
     * Return the host of a given url. If the url is not fully absolute use the document domain
     *
     * @param url the url to get the host part from
     * @returns {string} the host part of the url
     */
    function getHost(url) {
        var uri;

        if (url.substring(0, 5) === 'http:' || url.substring(0, 6) === 'https:' || url.charAt(0) === '/') {

            uri = window.document.createElement('a');
            uri.href = url;

            return uri.protocol + '//' + uri.host;

        }
    }


    return {
        angularModules: [ 'w20Hypermedia' ],
        lifecycle: {
            pre: function (modules, fragments, callback) {

                /*
                 * Extract the host (protocol with hostname with port) from a given url and return it
                 *
                 * @param {string} apiUrl the url of the api entry point
                 * @returns {string} host the host part of the apiUrl
                 */
                function setApiHost(apiUrl) {

                    var apiHost = getHost(apiUrl);

                    return apiHost ? apiHost : 'http://localhost:8080';

                }

                /*
                 * Prefix the given url with a host depending on the format of the url
                 *
                 * @param {string} url the url to be prefixed
                 * @param {string} host the host part
                 * @returns {string} url the result
                 */
                function prefixWithApiHost(url, host) {

                    host = stripTrailingSlash(host);

                    // if it is an absolute (non full) url (i.e starting with '/') prefix it with the apiHost
                    if (url.charAt(0) === '/') {

                        return host + url;

                        // if it is not an absolute full url (starting with http or https) it is a relative url to the apiHost
                    } else if (url.substring(0, 5) !== 'http:' || url.substring(0, 6) !== 'https:') {

                        return host + '/' + url;

                        // else it is an absolute url
                    } else {

                        return url;
                    }
                }


                /* Prefix the definition of a json-home Resource href-template and href-vars with the host if
                 * the host was specified and the url are absolute (starting with '/')
                 *
                 * @param {object} definition a json-home Resource
                 * @param {string} host the host (protocol with hostname with port)
                 * @returns {string} definition the modified definition
                 */
                function prefixHomeResourcesWithApiHost(definition, apiHost) {

                    if (definition.href) {

                        definition.href = prefixWithApiHost(definition.href, apiHost);

                    }
                    if (definition['href-template']) {

                        definition['href-template'] = prefixWithApiHost(definition['href-template'], apiHost);

                    }

                    if (definition['href-vars']) {

                        angular.forEach(definition['href-vars'], function (hrefVarsPath, hrefVarsKey) {

                            definition['href-vars'][hrefVarsKey] = prefixWithApiHost(hrefVarsPath, apiHost);

                        });
                    }

                    return definition;
                }

                var $injector = angular.injector(['w20Hypermedia'], true),
                    $http = $injector.get('$http'),
                    $q = $injector.get('$q'),
                    apiPromises = [],
                    apiHost;


                // Collect all fragment api configuration for entry points
                angular.forEach(fragments, function (fragment) {

                    if (typeof fragment.definition.api === 'object') {

                        angular.extend(config.api, fragment.definition.api);
                    }
                });

                // Retrieve all the api before application start
                angular.forEach(config.api, function (apiUrl, apiName) {

                    if (api[apiName]) {

                        throw new Error('Duplicate name in api declaration');
                    }

                    api[apiName] = {};
                    apiHost = setApiHost(apiUrl);

                    apiPromises.push(
                        $http({ method: 'GET', url: apiUrl, headers: { 'accept': 'application/json-home' } })

                            .success(function (home) {

                                if (!home.resources || !angular.isObject(home.resources)) {
                                    throw new Error('Json-home resources does not have a "resources" root element');
                                }

                                angular.forEach(home.resources, function (definition, rel) {
                                    api[apiName][rel] = prefixHomeResourcesWithApiHost(definition, apiHost);
                                });

                            }));
                });

                $q.all(apiPromises)

                    .then(function () {

                        window.console.info('All api endpoints retrieved successfully');

                    }, function () {

                        window.console.error('Some api endpoints were not retrieved successfully');

                    })
                    .finally(function () {

                        callback(module);

                    });

            }
        }
    };


});