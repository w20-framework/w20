/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

define([
    'module',
    'require',
    'w20',

    'jquery',
    '{lodash}/lodash',
    '{angular}/angular',
    '{globalize}/globalize',

    '{w20-core}/modules/env'
], function (module, require, w20, $, _, angular, globalize) {
    'use strict';

    var config = module && module.config() || {},
        availableCultures = [],
        availableCultureObjects = [],
        allBundles = {},
        loadedCultures = [],
        defaultCulture = globalize.findClosestCulture('default'),
        activeCulture = defaultCulture,
        persistedCulture;

    function switchCulture(selector, callback) {
        var culture = (typeof selector === 'string' ? globalize.findClosestCulture(selector) : selector);

        function doSwitch(cultureObject, callback) {
            activeCulture = globalize.culture(cultureObject.name);
            w20.console.info('Culture has been set to ' + activeCulture.name);

            if (typeof callback === 'function') {
                callback(activeCulture);
            }
        }

        // Load culture bundles
        if ($.inArray(culture.name, loadedCultures) === -1) {
            loadedCultures.push(culture.name);

            // Build the language dependencies to load
            var modulesToLoad = (allBundles[culture.language] || []).map(function (elt) {
                return '[text]!' + elt;
            });

            // Add the culture specific dependencies to load
            modulesToLoad = modulesToLoad.concat((allBundles[culture.name] || []).map(function (elt) {
                return '[text]!' + elt;
            }));

            // Add the multi-language dependencies (with an empty key)
            if (typeof allBundles[''] !== 'undefined' && allBundles[''].length > 0) {
                modulesToLoad = modulesToLoad.concat(allBundles[''].map(function (elt) {
                    return '[text]!' + elt.replace(':language', culture.language).replace(':culture', culture.name);
                }));
            }

            if (modulesToLoad.length > 0) {
                w20.console.log('Loading i18n bundles: ' + modulesToLoad);

                require(modulesToLoad, function () {
                    var bundlesLoaded = Array.prototype.slice.call(arguments, 0);
                    for (var i = 0; i < bundlesLoaded.length; i++) {
                        try {
                            var messages = angular.fromJson(bundlesLoaded[i]);
                            globalize.addCultureInfo(culture.name, {
                                messages: messages
                            });
                        } catch (e) {
                            throw new Error('Error loading i18n bundle ' + bundlesLoaded[i], e);
                        }
                    }
                    doSwitch(culture, callback);
                });
            } else {
                doSwitch(culture, callback);
            }
        } else {
            doSwitch(culture, callback);
        }
    }

    function buildAngularLocale(culture) {
        var standardCalendar = culture.calendars.standard,
            currency = culture.numberFormat.currency,
            number = culture.numberFormat;

        function buildNumberPattern(patterns) {
            return {
                negPre: patterns[0].substring(0, patterns[0].indexOf('n') - 1),
                negSuf: patterns[0].substring(patterns[0].indexOf('n')),
                posPre: patterns[1] ? patterns[1].substring(0, patterns[0].indexOf('n') - 1).replace('$', '\u00a4') : '',
                posSuf: patterns[1] ? patterns[1].substring(patterns[0].indexOf('n')).replace('$', '\u00a4') : ''
            };
        }

        function buildDateTimePattern(pattern) {
            var result = pattern;

            // day name
            result = result.replace(/dddd/g, 'EEEE');
            result = result.replace(/ddd/g, 'EEE');

            // milliseconds
            result = result.replace(/fff/g, '.sss');

            // AM/PM
            result = result.replace(/tt/g, 'a');

            // Timezone
            result = result.replace(/zzz/g, 'Z');

            return result;
        }

        return {
            'DATETIME_FORMATS': {
                'AMPMS': [
                        standardCalendar.AM && standardCalendar.AM[0] || 'AM',
                        standardCalendar.PM && standardCalendar.PM[0] || 'PM'
                ],
                'DAY': standardCalendar.days.names,
                'MONTH': standardCalendar.months.names,
                'SHORTDAY': standardCalendar.days.namesAbbr,
                'SHORTMONTH': standardCalendar.months.namesAbbr,
                'fullDate': buildDateTimePattern(standardCalendar.patterns.D),
                'longDate': buildDateTimePattern(standardCalendar.patterns.d),
                'medium': buildDateTimePattern(standardCalendar.patterns.F),
                'mediumDate': buildDateTimePattern(standardCalendar.patterns.d),
                'mediumTime': buildDateTimePattern(standardCalendar.patterns.T),
                'short': buildDateTimePattern(standardCalendar.patterns.f),
                'shortDate': buildDateTimePattern(standardCalendar.patterns.d),
                'shortTime': buildDateTimePattern(standardCalendar.patterns.t)
            },
            'NUMBER_FORMATS': {
                'CURRENCY_SYM': currency.symbol,
                'DECIMAL_SEP': number['.'],
                'GROUP_SEP': number[','],
                'PATTERNS': [
                    _.merge({
                        'gSize': number.groupSizes[0],
                        'lgSize': number.groupSizes[0],
                        'maxFrac': number.decimals,
                        'minFrac': 0,
                        'minInt': 1
                    }, buildNumberPattern(number.pattern)),
                    _.merge({
                        'gSize': currency.groupSizes[0],
                        'lgSize': currency.groupSizes[0],
                        'maxFrac': currency.decimals,
                        'minFrac': currency.decimals,
                        'minInt': 1
                    }, buildNumberPattern(currency.pattern))
                ]
            },
            'id': culture.name.toLowerCase(),
            'pluralCat': function () {
                return 'other';
            }
        };
    }


    /**
     * @ngdoc object
     * @name w20CoreCulture
     *
     * @description
     *
     * This module manages the end-user culture. Only one culture can be active at a time in the application but you
     * can format values in any culture supported by the application, without switching the active one. This module
     * handles text internationalization, date and time formatting, currency formatting, number formatting.
     *
     * # Configuration
     *
     *      "culture" : {
     *          // Array of available cultures in the application
     *          "available" : [ "ietf-code-1", "ietf-code-2", ... ],
     *
     *          // Default culture of the application when no user preference is overriding it
     *          "default" : "ietf-code"
     *      }
     *
     * # Fragment definition
     *
     * The fragment "i18n" section allows to declare culture localization bundles. All fragments "i18n" sections are merged
     * on application initialization. Fragment "i18n" definitions cannot be overridden in application configuration. Bundles
     * modules paths will be loaded as a text dependency and parsed as JSON. The empty language code can be used to point
     * to a server-side parameterized url. The :language placeholder will be replaced by the actual IETF language code. This
     * special bundle will always be loaded for any language. If no keys are available for a particular language an empty
     * object can be returned.
     *
     *      "i18n" : {
     *          "" : [ "module/path/of/the/dynamic/bundle" ]
     *          "ietf-language-code-1" : [ "module/path/of/the/bundle/1", "module/path/of/the/bundle/2", ...  ],
     *          "ietf-language-code-2" : [ "module/path/of/the/bundle/1", "module/path/of/the/bundle/2", ...  ]
     *          ...
     *      }
     *
     * # Available IETF cultures codes
     *
     * af-ZA, af, am-ET, am, ar-AE, ar-BH, ar-DZ, ar-EG, ar-IQ, ar-JO, ar-KW, ar-LB, ar-LY, ar-MA, ar-OM, ar-QA,
     * ar-SA, ar-SY, ar-TN, ar-YE, ar, arn-CL, arn, as-IN, as, az-Cyrl-AZ, az-Cyrl, az-Latn-AZ, az-Latn, az, ba-RU,
     * ba, be-BY, be, bg-BG, bg, bn-BD, bn-IN, bn, bo-CN, bo, br-FR, br, bs-Cyrl-BA, bs-Cyrl, bs-Latn-BA, bs-Latn,
     * bs, ca-ES, ca, co-FR, co, cs-CZ, cs, cy-GB, cy, da-DK, da, de-AT, de-CH, de-DE, de-LI, de-LU, de, dsb-DE,
     * dsb, dv-MV, dv, el-GR, el, en-029, en-AU, en-BZ, en-CA, en-GB, en-IE, en-IN, en-JM, en-MY, en-NZ, en-PH, en-SG,
     * en-TT, en-US, en-ZA, en-ZW, es-AR, es-BO, es-CL, es-CO, es-CR, es-DO, es-EC, es-ES, es-GT, es-HN, es-MX, es-NI,
     * es-PA, es-PE, es-PR, es-PY, es-SV, es-US, es-UY, es-VE, es, et-EE, et, eu-ES, eu, fa-IR, fa, fi-FI, fi,
     * fil-PH, fil, fo-FO, fo, fr-BE, fr-CA, fr-CH, fr-FR, fr-LU, fr-MC, fr, fy-NL, fy, ga-IE, ga, gd-GB, gd,
     * gl-ES, gl, gsw-FR, gsw, gu-IN, gu, ha-Latn-NG, ha-Latn, ha, he-IL, he, hi-IN, hi, hr-BA, hr-HR, hr, hsb-DE,
     * hsb, hu-HU, hu, hy-AM, hy, id-ID, id, ig-NG, ig, ii-CN, ii, is-IS, is, it-CH, it-IT, it, iu-Cans-CA, iu-Cans,
     * iu-Latn-CA, iu-Latn, iu, ja-JP, ja, ka-GE, ka, kk-KZ, kk, kl-GL, kl, km-KH, km, kn-IN, kn, ko-KR, ko, kok-IN,
     * kok, ky-KG, ky, lb-LU, lb, lo-LA, lo, lt-LT, lt, lv-LV, lv, mi-NZ, mi, mk-MK, mk, ml-IN, ml, mn-Cyrl, mn-MN,
     * mn-Mong-CN, mn-Mong, mn, moh-CA, moh, mr-IN, mr, ms-BN, ms-MY, ms, mt-MT, mt, nb-NO, nb, ne-NP, ne, nl-BE,
     * nl-NL, nl, nn-NO, nn, no, nso-ZA, nso, oc-FR, oc, or-IN, or, pa-IN, pa, pl-PL, pl, prs-AF, prs, ps-AF, ps,
     * pt-BR, pt-PT, pt, qut-GT, qut, quz-BO, quz-EC, quz-PE, quz, rm-CH, rm, ro-RO, ro, ru-RU, ru, rw-RW, rw,
     * sa-IN, sa, sah-RU, sah, se-FI, se-NO, se-SE, se, si-LK, si, sk-SK, sk, sl-SI, sl, sma-NO, sma-SE, sma, smj-NO,
     * smj-SE, smj, smn-FI, smn, sms-FI, sms, sq-AL, sq, sr-Cyrl-BA, sr-Cyrl-CS, sr-Cyrl-ME, sr-Cyrl-RS, sr-Cyrl, sr-Latn-BA,
     * sr-Latn-CS, sr-Latn-ME, sr-Latn-RS, sr-Latn, sr, sv-FI, sv-SE, sv, sw-KE, sw, syr-SY, syr, ta-IN, ta, te-IN,
     * te, tg-Cyrl-TJ, tg-Cyrl, tg, th-TH, th, tk-TM, tk, tn-ZA, tn, tr-TR, tr, tt-RU, tt, tzm-Latn-DZ, tzm-Latn, tzm,
     * ug-CN, ug, uk-UA, uk, ur-PK, ur, uz-Cyrl-UZ, uz-Cyrl, uz-Latn-UZ, uz-Latn, uz, vi-VN, vi, wo-SN, wo, xh-ZA,
     * xh, yo-NG, yo, zh-CHS, zh-CHT, zh-CN, zh-Hans, zh-Hant, zh-HK, zh-MO, zh-SG, zh-TW, zh, zu-ZA, zu.
     *
     * Structure of the culture object
     * -------------------------------
     *
     *      {
     *          // A unique name for the culture in the form
     *          // <language code>-<country/region code>
     *          name:"en-US",
     *          // the name of the culture in the English language
     *          englishName:"English",
     *          // the name of the culture in its own language
     *          nativeName:"English",
     *          // whether the culture uses right-to-left text
     *          isRTL:false,
     *          // "language" is used for so-called "specific" cultures.
     *          // For example, the culture "es-CL" means Spanish in Chili.
     *          // It represents the Spanish-speaking culture as it is in Chili,
     *          // which might have different formatting rules or even translations
     *          // than Spanish in Spain. A "neutral" culture is one that is not
     *          // specific to a region. For example, the culture "es" is the generic
     *          // Spanish culture, which may be a more generalized version of the language
     *          // that may or may not be what a specific culture expects.
     *          // For a specific culture like "es-CL", the "language" field refers to the
     *          // neutral, generic culture information for the language it is using.
     *          // This is not always a simple matter of the string before the dash.
     *          // For example, the "zh-Hans" culture is neutral (Simplified Chinese).
     *          // And the "zh-SG" culture is Simplified Chinese in Singapore, whose
     *          // language field is "zh-CHS", not "zh".
     *          // This field should be used to navigate from a specific culture to its
     *          // more general, neutral culture. If a culture is already as general as it
     *          // can get, the language may refer to itself.
     *          language:"en",
     *          // "numberFormat" defines general number formatting rules, like the digits
     *          // in each grouping, the group separator, and how negative numbers are
     *          // displayed.
     *          numberFormat:{
     *              // [negativePattern]
     *              // Note, numberFormat.pattern has no "positivePattern" unlike percent
     *              // and currency, but is still defined as an array for consistency with
     *              // them.
     *              //    negativePattern: one of "(n)|-n|- n|n-|n -"
     *              pattern:[ "-n" ],
     *              // number of decimal places normally shown
     *              decimals:2,
     *              // string that separates number groups, as in 1,000,000
     *              ",":",",
     *              // string that separates a number from the fractional portion,
     *              // as in 1.99
     *              ".":".",
     *              // array of numbers indicating the size of each number group.
     *              groupSizes:[ 3 ],
     *              // symbol used for positive numbers
     *              "+":"+",
     *              // symbol used for negative numbers
     *              "-":"-",
     *              percent:{
     *                  // [negativePattern, positivePattern]
     *                  //     negativePattern: one of "-n %|-n%|-%n|%-n|%n-|n-%|n%-|-% n|n %-|% n-|% -n|n- %"
     *                  //     positivePattern: one of "n %|n%|%n|% n"
     *                  pattern:[ "-n %", "n %" ],
     *                  // number of decimal places normally shown
     *                  decimals:2,
     *                  // array of numbers indicating the size of each number group.
     *                  groupSizes:[ 3 ],
     *                  // string that separates number groups, as in 1,000,000
     *                  ",":",",
     *                  // string that separates a number from the fractional portion, as in 1.99
     *                  ".":".",
     *                  // symbol used to represent a percentage
     *                  symbol:"%"
     *              },
     *              currency:{
     *                  // [negativePattern, positivePattern]
     *                  //     negativePattern: one of "($n)|-$n|$-n|$n-|(n$)|-n$|n-$|n$-|-n $|-$ n|n $-|$ n-|$ -n|n- $|($ n)|(n $)"
     *                  //     positivePattern: one of "$n|n$|$ n|n $"
     *                  pattern:[ "($n)", "$n" ],
     *                  // number of decimal places normally shown
     *                  decimals:2,
     *                  // array of numbers indicating the size of each number group.
     *                  groupSizes:[ 3 ],
     *                  // string that separates number groups, as in 1,000,000
     *                  ",":",",
     *                  // string that separates a number from the fractional portion, as in 1.99
     *                  ".":".",
     *                  // symbol used to represent currency
     *                  symbol:"$"
     *              }
     *          },
     *          // "calendars" property defines all the possible calendars used by this
     *          // culture. There should be at least one defined with name "standard" which
     *          // is the default calendar used by the culture.
     *          // A calendar contains information about how dates are formatted,
     *          // information about the calendar's eras, a standard set of the date
     *          // formats, translations for day and month names, and if the calendar is
     *          // not based on the Gregorian calendar, conversion functions to and from
     *          // the Gregorian calendar.
     *          calendars:{
     *              standard:{
     *                  // name that identifies the type of calendar this is
     *                  name:"Gregorian_USEnglish",
     *                  // separator of parts of a date (e.g. "/" in 11/05/1955)
     *                  "/":"/",
     *                  // separator of parts of a time (e.g. ":" in 05:44 PM)
     *                  ":":":",
     *                  // the first day of the week (0 = Sunday, 1 = Monday, etc)
     *                  firstDay:0,
     *                  days:{
     *                      // full day names
     *                      names:[ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
     *                      // abbreviated day names
     *                      namesAbbr:[ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
     *                      // shortest day names
     *                      namesShort:[ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
     *                  },
     *                  months:[
     *                      // full month names (13 months for lunar calendars -- 13th month should be "" if not lunar)
     *                      names: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "" ],
     *                      // abbreviated month names
     *                      namesAbbr: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "" ]
     *                  ],
     *                  // AM and PM designators in one of these forms:
     *                  // The usual view, and the upper and lower case versions
     *                  //      [standard,lowercase,uppercase]
     *                  // The culture does not use AM or PM (likely all standard date
     *                  // formats use 24 hour time)
     *                  //      null
     *                  AM: [ "AM", "am", "AM" ],
     *                  PM: [ "PM", "pm", "PM" ],
     *                  eras: [
     *                  // eras in reverse chronological order.
     *                  // name: the name of the era in this culture (e.g. A.D., C.E.)
     *                  // start: when the era starts in ticks, null if it is the
     *                  //        earliest supported era.
     *                  // offset: offset in years from gregorian calendar
     *                      {"name":"A.D.","start":null,"offset":0}
     *                  ],
     *                  // when a two digit year is given, it will never be parsed as a
     *                  // four digit year greater than this year (in the appropriate era
     *                  // for the culture)
     *                  // Set it as a full year (e.g. 2029) or use an offset format
     *                  // starting from the current year: "+19" would correspond to 2029
     *                  // if the current year is 2010.
     *                  twoDigitYearMax: 2029,
     *                  // set of predefined date and time patterns used by the culture.
     *                  // These represent the format someone in this culture would expect
     *                  // to see given the portions of the date that are shown.
     *                  patterns: {
     *                      // short date pattern
     *                      d: "M/d/yyyy",
     *                      // long date pattern
     *                      D: "dddd, MMMM dd, yyyy",
     *                      // short time pattern
     *                      t: "h:mm tt",
     *                      // long time pattern
     *                      T: "h:mm:ss tt",
     *                      // long date, short time pattern
     *                      f: "dddd, MMMM dd, yyyy h:mm tt",
     *                      // long date, long time pattern
     *                      F: "dddd, MMMM dd, yyyy h:mm:ss tt",
     *                      // month/day pattern
     *                      M: "MMMM dd",
     *                      // month/year pattern
     *                      Y: "yyyy MMMM",
     *                      // S is a sortable format that does not vary by culture
     *                      S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss"
     *                  }
     *                  // optional fields for each calendar:
     *                  monthsGenitive:
     *                      // Same as months but used when the day preceeds the month.
     *                      // Omit if the culture has no genitive distinction in month names.
     *                      // For an explanation of genitive months, see
     *                      // http://blogs.msdn.com/michkap/archive/2004/12/25/332259.aspx
     *                  convert:
     *                      // Allows for the support of non-gregorian based calendars. This
     *                      // "convert" object defines two functions to convert a date to and
     *                      // from a gregorian calendar date:
     *                          // fromGregorian( date )
     *                              // Given the date as a parameter, return an array with
     *                              // parts [ year, month, day ] corresponding to the
     *                              // non-gregorian based year, month, and day for the
     *                              // calendar.
     *                          // toGregorian( year, month, day )
     *                              // Given the non-gregorian year, month, and day, return a
     *                              // new Date() object set to the corresponding date in the
     *                              // gregorian calendar.
     *                  }
     *              },
     *          // Map of messages used by .localize()
     *          messages: {}
     *      }
     */
    var w20CoreCulture = angular.module('w20CoreCulture', ['w20CoreEnv', 'ngResource']);
    var placeholderRegexp = new RegExp('{-?[0-9]+}', 'g');

    var buildDate = function (input) {
        if (input instanceof Date) {
            return input;
        }
        else if (typeof input === 'number' || typeof input === 'string') {
            return new Date(input);
        }
        else {
            return undefined;
        }
    };

    /**
     * @ngdoc service
     * @name w20CoreCulture.service:CultureService
     *
     * @description
     *
     * This service is the façade of the culture module capabilities. It provides all the functions and properties
     * you need to use it.
     */
    w20CoreCulture.factory('CultureService', ['EventService', 'StateService', '$rootScope', '$locale', '$window', function (eventService, stateService, $rootScope, $locale, $window) {

        var cultureState = stateService.state('culture', 'first', defaultCulture);

        var service = {
            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#defaultCulture
             * @methodOf w20CoreCulture.service:CultureService
             * @returns {Object} The default culture object
             *
             * @description
             *
             * Returns the default culture of the application (not necessarily the active one).
             */
            defaultCulture: function () {
                return defaultCulture;
            },

            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#culture
             * @methodOf w20CoreCulture.service:CultureService
             * @param {String} [selector] The selector of the culture to switch to. Examples : "fr", "fr-FR", ["en-US", "fr-FR"], "fr;q=0.4, es;q=0.5, he".
             * @returns {Object} The current culture object if no selector was specified, undefined if new culture selector was specified.
             *
             * @description
             *
             * Getter/setter of the currently active culture in the application. Return the current culture if the
             * selector parameter is undefined, change it otherwise.
             *
             * Automatically load i18n string bundles configured when switching for the first time to a new culture.
             * The <code>w20.culture.culture-changed</code> event is fired when the culture has switched.
             */
            culture: function (selector) {
                if (typeof selector === 'undefined') {
                    return globalize.culture();
                }

                switchCulture(selector, function (newCulture) {
                    // Override $locale values with new ones
                    _.merge($locale, buildAngularLocale(newCulture));

                    // persist culture preference
                    if ($window.localStorage && newCulture && newCulture.name) {
                        cultureState.value(newCulture.name);
                        persistedCulture = cultureState.value();
                    }

                    /**
                     * This event is emitted after the culture has changed successfully.
                     *
                     * @name w20.culture.culture-changed
                     * @w20doc event
                     * @memberOf w20CoreCulture
                     * @argument {Object} The new culture definition.
                     */
                    eventService.emit('w20.culture.culture-changed', newCulture);


                    $rootScope.$safeApply();
                });
            },

            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#availableCultures
             * @methodOf w20CoreCulture.service:CultureService
             * @returns {Object} The array of available cultures (fully detailed culture description).
             *
             * @description
             *
             * Return an array of available cultures in the application.
             */
            availableCultures: function () {
                return availableCultureObjects;
            },
            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#localize
             * @methodOf w20CoreCulture.service:CultureService
             * @param {String} key The i18n key to localize.
             * @param {Array} [values] The localized string placeholder values.
             * @param {String} [defaultValue] A default value to be returned if no localization exists in the language.
             * @param {String} [culture] If specified this culture selector will be used to do the localization.
             * @returns {String} The translated string, with placeholders replaced by their respective values.
             *
             * @description
             *
             * Localize an i18n key in the current culture or the explicitely specified one. An localized string
             * can contain placeholders like {0}, {1}, {2}, ... {n} which will be replaced by the corresponding
             * element in the values array.
             */
            localize: function (key, values, defaultValue, culture) {
                var result = globalize.localize(key, culture || activeCulture.name);
                if (typeof result === 'undefined') {
                    result = globalize.localize(key, defaultCulture.name);
                    if (typeof result === 'undefined') {
                        if (typeof defaultValue === 'undefined') {
                            return '[' + key + ']';
                        }
                        else {
                            return defaultValue;
                        }
                    }
                }

                var typeOfValues = typeof values;
                if (typeOfValues !== 'undefined' && (typeOfValues === 'string' || typeOfValues === 'int' || typeOfValues === 'float')) {
                    values = [values];
                }

                return result.replace(placeholderRegexp, function (item) {
                    return values[parseInt(item.substring(1, item.length - 1))] || '';
                });
            },

            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#format
             * @methodOf w20CoreCulture.service:CultureService
             * @param {*} value The value to format.
             * @param {String} format Pattern used for the formatting.
             * @param {String} [culture] If specified this culture selector will be used to do the formatting.
             * @returns {String} The value formatted.
             *
             * @description
             *
             * Format any value according to the format parameter. The current culture is used for formatting rules,
             * except if a selector is specified as the culture parameter.
             *
             * ##### Number formatting
             *
             * When formatting a number with format(), the main purpose is to convert the
             * number into a human readable string using the culture's standard grouping and
             * decimal rules. The rules between cultures can vary a lot. For example, in some
             * cultures, the grouping of numbers is done unevenly. In the "te-IN" culture
             * (Telugu in India), groups have 3 digits and then 2 digits. The number 1000000
             * (one million) is written as "10,00,000". Some cultures do not group numbers at
             * all.

             * There are four main types of number formatting:
             * <ul>
             * <li><strong>n</strong> for number</li>
             * <li><strong>d</strong> for decimal digits</li>
             * <li><strong>p</strong> for percentage</li>
             * <li><strong>c</strong> for currency</li>
             * </ul>
             *
             * Even within the same culture, the formatting rules can vary between these four
             * types of numbers. For example, the expected number of decimal places may differ
             * from the number format to the currency format. Each format token may also be
             * followed by a number. The number determines how many decimal places to display
             * for all the format types except decimal, for which it means the minimum number
             * of digits to display, zero padding it if necessary. Also note that the way
             * negative numbers are represented in each culture can vary, such as what the
             * negative sign is, and whether the negative sign appears before or after the
             * number. This is especially apparent with currency formatting, where many
             * cultures use parentheses instead of a negative sign.
             *
             *      // just for example - will vary by culture
             *      CultureService.format( 123.45, "n" ); // 123.45
             *      CultureService.format( 123.45, "n0" ); // 123
             *      CultureService.format( 123.45, "n1" ); // 123.5
             *
             *      CultureService.format( 123.45, "d" ); // 123
             *      CultureService.format( 12, "d3" ); // 012
             *
             *      CultureService.format( 123.45, "c" ); // $123.45
             *      CultureService.format( 123.45, "c0" ); // $123
             *      CultureService.format( 123.45, "c1" ); // $123.5
             *      CultureService.format( -123.45, "c" ); // ($123.45)
             *
             *      CultureService.format( 0.12345, "p" ); // 12.35 %
             *      CultureService.format( 0.12345, "p0" ); // 12 %
             *      CultureService.format( 0.12345, "p4" ); // 12.3450 %
             *
             * Parsing with parseInt and parseFloat also accepts any of these formats.
             *
             * ##### Date formatting
             *
             * Date formatting varies wildly by culture, not just in the spelling of month and
             * day names, and the date separator, but by the expected order of the various
             * date components, whether to use a 12 or 24 hour clock, and how months and days
             * are abbreviated. Many cultures even include "genitive" month names, which are
             * different from the typical names and are used only in certain cases.
             *
             * Also, each culture has a set of "standard" or "typical" formats. For example,
             * in "en-US", when displaying a date in its fullest form, it looks like
             * "Saturday, November 05, 1955". Note the non-abbreviated day and month name, the
             * zero padded date, and four digit year. So, the culture service expects a certain set
             * of "standard" formatting strings for dates in the "patterns" property of the
             * "standard" calendar of each culture, that describe specific formats for the
             * culture. The third column shows example values in the neutral English culture
             * "en-US"; see the second table for the meaning tokens used in date formats.
             *
             *      // just for example - will vary by culture
             *      cultureService.format( new Date(2012, 1, 20), 'd' ); // 2/20/2012
             *      cultureService.format( new Date(2012, 1, 20), 'D' ); // Monday, February 20, 2012
             *
             * <table class="table table-striped">
             * <tr>
             * <th>Format</th>
             * <th>Meaning</th>
             * <th>"en-US"</th>
             * </tr>
             * <tr>
             * <td>f</td>
             * <td>Long Date, Short Time</td>
             * <td>dddd, MMMM dd, yyyy h:mm tt</td>
             * </tr>
             * <tr>
             * <td>F</td>
             * <td>Long Date, Long Time</td>
             * <td>dddd, MMMM dd, yyyy h:mm:ss tt</td>
             * </tr>
             * <tr>
             * <td>t</td>
             * <td>Short Time</td>
             * <td>h:mm tt</td>
             * </tr>
             * <tr>
             * <td>T</td>
             * <td>Long Time</td>
             * <td>h:mm:ss tt</td>
             * </tr>
             * <tr>
             * <td>d</td>
             * <td>Short Date</td>
             * <td>M/d/yyyy</td>
             * </tr>
             * <tr>
             * <td>D</td>
             * <td>Long Date</td>
             * <td>dddd, MMMM dd, yyyy</td>
             * </tr>
             * <tr>
             * <td>Y</td>
             * <td>Month/Year</td>
             * <td>MMMM, yyyy</td>
             * </tr>
             * <tr>
             * <td>M</td>
             * <td>Month/Day</td>
             * <td>MMMM dd</td>
             * </tr>
             * </table>
             *
             * In addition to these standard formats, there is the "S" format. This is a
             * sortable format that is identical in every culture:
             * "<strong>yyyy'-'MM'-'dd'T'HH':'mm':'ss</strong>".
             *
             * When more specific control is needed over the formatting, you may use any
             * format you wish by specifying the following custom tokens:
             * <table class="table table-striped">
             * <tr>
             * <th>Token</th>
             * <th>Meaning</th>
             * <th>Example</th>
             * </tr>
             * <tr>
             * <td>d</td>
             * <td>Day of month (no leading zero)</td>
             * <td>5</td>
             * </tr>
             * <tr>
             * <td>dd</td>
             * <td>Day of month (leading zero)</td>
             * <td>05</td>
             * </tr>
             * <tr>
             * <td>ddd</td>
             * <td>Day name (abbreviated)</td>
             * <td>Sat</td>
             * </tr>
             * <tr>
             * <td>dddd</td>
             * <td>Day name (full)</td>
             * <td>Saturday</td>
             * </tr>
             * <tr>
             * <td>M</td>
             * <td>Month of year (no leading zero)</td>
             * <td>9</td>
             * </tr>
             * <tr>
             * <td>MM</td>
             * <td>Month of year (leading zero)</td>
             * <td>09</td>
             * </tr>
             * <tr>
             * <td>MMM</td>
             * <td>Month name (abbreviated)</td>
             * <td>Sep</td>
             * </tr>
             * <tr>
             * <td>MMMM</td>
             * <td>Month name (full)</td>
             * <td>September</td>
             * </tr>
             * <tr>
             * <td>yy</td>
             * <td>Year (two digits)</td>
             * <td>55</td>
             * </tr>
             * <tr>
             * <td>yyyy</td>
             * <td>Year (four digits)</td>
             * <td>1955</td>
             * </tr>
             * <tr>
             * <td>'literal'</td>
             * <td>Literal Text</td>
             * <td>'of the clock'</td>
             * </tr>
             * <tr>
             * <td>\'</td>
             * <td>Single Quote</td>
             * <td>'o'\''clock'</td><!-- o'clock -->
             * </tr>
             * <tr>
             * <td>m</td>
             * <td>Minutes (no leading zero)</td>
             * <td>9</td>
             * </tr>
             * <tr>
             * <td>mm</td>
             * <td>Minutes (leading zero)</td>
             * <td>09</td>
             * </tr>
             * <tr>
             * <td>h</td>
             * <td>Hours (12 hour time, no leading zero)</td>
             * <td>6</td>
             * </tr>
             * <tr>
             * <td>hh</td>
             * <td>Hours (12 hour time, leading zero)</td>
             * <td>06</td>
             * </tr>
             * <tr>
             * <td>H</td>
             * <td>Hours (24 hour time, no leading zero)</td>
             * <td>5 (5am) 15 (3pm)</td>
             * </tr>
             * <tr>
             * <td>HH</td>
             * <td>Hours (24 hour time, leading zero)</td>
             * <td>05 (5am) 15 (3pm)</td>
             * </tr>
             * <tr>
             * <td>s</td>
             * <td>Seconds (no leading zero)</td>
             * <td>9</td>
             * </tr>
             * <tr>
             * <td>ss</td>
             * <td>Seconds (leading zero)</td>
             * <td>09</td>
             * </tr>
             * <tr>
             * <td>f</td>
             * <td>Deciseconds</td>
             * <td>1</td>
             * </tr>
             * <tr>
             * <td>ff</td>
             * <td>Centiseconds</td>
             * <td>11</td>
             * </tr>
             * <tr>
             * <td>fff</td>
             * <td>Milliseconds</td>
             * <td>111</td>
             * </tr>
             * <tr>
             * <td>t</td>
             * <td>AM/PM indicator (first letter)</td>
             * <td>A or P</td>
             * </tr>
             * <tr>
             * <td>tt</td>
             * <td>AM/PM indicator (full)</td>
             * <td>AM or PM</td>
             * </tr>
             * <tr>
             * <td>z</td>
             * <td>Timezone offset (hours only, no leading zero)</td>
             * <td>-8</td>
             * </tr>
             * <tr>
             * <td>zz</td>
             * <td>Timezone offset (hours only, leading zero)</td>
             * <td>-08</td>
             * </tr>
             * <tr>
             * <td>zzz</td>
             * <td>Timezone offset (full hours/minutes)</td>
             * <td>-08:00</td>
             * </tr>
             * <tr>
             * <td>g or gg</td>
             * <td>Era name</td>
             * <td>A.D.</td>
             * </tr>
             * </table>
             */
            format: function (value, format, culture) {
                return globalize.format(value, format, culture || activeCulture);
            },

            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#parseInt
             * @methodOf w20CoreCulture.service:CultureService
             * @param {String} value The value to parse as an integer.
             * @param {int} [radix] The radix used for the conversion (10 by default).
             * @param {String} [culture] If specified this culture selector will be used to do the parsing.
             * @returns {int} The integer parsed.
             *
             * @description
             *
             * Parses a string representing a whole number in the given radix (10 by default),
             * taking into account any formatting rules followed by the given culture (or the
             * current culture, if not specified).
             *
             *      // assuming a culture where "," is the group separator
             *      // and "." is the decimal separator
             *      CultureService.parseInt( "1,234.56" ); // 1234
             *      // assuming a culture where "." is the group separator
             *      // and "," is the decimal separator
             *      CultureService.parseInt( "1.234,56" ); // 1234
             */
            parseInt: function (value, radix, culture) {
                return globalize.parseInt(value, radix, culture || activeCulture);
            },

            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#parseFloat
             * @methodOf w20CoreCulture.service:CultureService
             * @param {String} value The value to parse as a float.
             * @param {int} [radix] The radix used for the conversion (10 by default).
             * @param {String} [culture] If specified this culture selector will be used to do the parsing.
             * @returns {Number} The float parsed.
             *
             * @description
             *
             * Parses a string representing a floating point number in the given radix (10 by
             * default), taking into account any formatting rules followed by the given
             * culture (or the current culture, if not specified).
             *
             *      // assuming a culture where "," is the group separator
             *      // and "." is the decimal separator
             *      CultureService.parseFloat( "1,234.56" ); // 1234.56
             *      // assuming a culture where "." is the group separator
             *      // and "," is the decimal separator
             *      CultureService.parseFloat( "1.234,56" ); // 1234.56
             */
            parseFloat: function (value, radix, culture) {
                return globalize.parseFloat(value, radix, culture || activeCulture);
            },
            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#culture
             * @methodOf w20CoreCulture.service:CultureService
             * @param {String} value The value to parse as a date.
             * @param {String} [formats] The formats used to do the parsing.
             * @param {String} [culture] If specified this culture selector will be used to do the parsing.
             * @returns {Date} The date object parsed.
             *
             * @description
             *
             * Parses a string representing a date into a JavaScript Date object, taking into
             * account the given possible formats (or the given culture's set of default
             * formats if not given). As before, the current culture is used if one is not
             * specified.
             *
             *      cultureService.culture( "en" );
             *      cultureService.parseDate( "1/2/2003" ); // Thu Jan 02 2003
             *      cultureService.culture( "fr" );
             *      cultureService.parseDate( "1/2/2003" ); // Sat Feb 01 2003
             */
            parseDate: function (value, formats, culture) {
                return globalize.parseDate(value, formats, culture || activeCulture);
            },

            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#addCultureInfo
             * @methodOf w20CoreCulture.service:CultureService
             * @param {String} [cultureName] If supplied it will create a culture with this name.
             * @param {String} [baseCultureName] If supplied it will extend this culture to create the new one.
             * @param {String} info The culture information to add, according to the culture object format.
             *
             * @description
             *
             * This method allows you to create a new culture based on an existing culture or add to existing culture info.
             * If the optional argument `baseCultureName` is not supplied, it will extend the existing culture if it
             * exists or create a new culture based on the default culture if it doesn't exist. If `cultureName` is not
             * supplied, it will add the supplied info to the current culture.
             */
            addCultureInfo: function (cultureName, baseCultureName, info) {
                return globalize.addCultureInfo(cultureName, baseCultureName, info);
            },

            /**
             * @ngdoc function
             * @name w20CoreCulture.service:CultureService#displayName
             * @methodOf w20CoreCulture.service:CultureService
             * @param {String} object The object to compute the display name of.
             * @param {String} [values] The values used to localize the i18n key if any.
             * @returns {String} The display name of the object.
             *
             * @description
             *
             * Compute the display name of an object by following these steps:
             *
             * * Return its `label` attribute if it exists, or,
             * * Return the localized form of its `i18n` attribute if it exists, or,
             * * Return an empty string.
             */
            displayName: function (object, values) {
                if (typeof object.label !== 'undefined') {
                    return object.label;
                }
                else if (typeof object.i18n !== 'undefined') {
                    return service.localize(object.i18n, values);
                }
                else {
                    return '';
                }
            }
        };

        return service;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:localize
     * @param {String...} [values] Localized string placeholder replacement values.
     *
     * @description
     *
     * This filter localizes an i18n key by invoking the `CultureService.localize` function.
     */
    w20CoreCulture.filter('localize', ['CultureService', function (cultureService) {
        var filter = function (input) {
            if (typeof input !== 'string') {
                return '';
            }

            // Translate key using active culture
            return cultureService.localize(input, Array.prototype.slice.call(arguments, 1));
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:localizeWithPrefix
     * @param {String} prefix The prefix to use.
     * @param {String...} [values] Localized string placeholder replacement values.
     *
     * @description
     *
     * This filter prefixes an i18n key and localize the resulting key by invoking the `CultureService.localize` function.
     */
    w20CoreCulture.filter('localizeWithPrefix', ['CultureService', function (cultureService) {
        var filter = function (input, prefix) {
            if (typeof input !== 'string') {
                return '';
            }

            if (typeof prefix === 'undefined') {
                prefix = '';
            }

            // Translate key using active culture
            return cultureService.localize(prefix + input, Array.prototype.slice.call(arguments, 2));
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:displayName
     * @param {String...} [values] Localized string placeholder replacement values.
     *
     * @description
     *
     * This filter computes the display name of an object according to the `CultureService.displayName` function.
     */
    w20CoreCulture.filter('displayName', ['CultureService', function (cultureService) {
        var filter = function (input) {
            if (typeof input !== 'object') {
                return '';
            }

            // Extract filter parameters as an array
            var values = Array.prototype.slice.call(arguments);
            values.shift();

            // Translate key using active culture
            return cultureService.displayName(input, values);
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:currency
     * @param {String} [pattern] Pattern used to format the value ('c' by default).
     *
     * @description
     *
     * This filter formats a number into a currency string by invoking the `CultureService.format` function.
     */
    w20CoreCulture.filter('currency', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            if (typeof input !== 'number') {
                return '';
            }

            return cultureService.format(input, format || 'c');
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:datetime
     * @param {String} [pattern] Pattern used to format the value ('F' by default).
     *
     * @description
     *
     * This filter formats a date object into a datetime string by invoking the `CultureService.format` function.
     */
    w20CoreCulture.filter('datetime', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            var theDate = buildDate(input);
            if (typeof theDate === 'undefined') {
                return '';
            }

            return cultureService.format(theDate, format || 'F');
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:date
     * @param {String} [pattern] Pattern used to format the value ('d' by default).
     *
     * @description
     *
     * This filter formats a date object into a date string by invoking the `CultureService.format` function.
     */
    w20CoreCulture.filter('date', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            var theDate = buildDate(input);
            if (typeof theDate === 'undefined') {
                return '';
            }

            return cultureService.format(theDate, format || 'd');
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:time
     * @param {String} [pattern] Pattern used to format the value ('T' by default).
     *
     * @description
     *
     * This filter formats a date into a time string by invoking the `CultureService.format` function.
     */
    w20CoreCulture.filter('time', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            var theDate = buildDate(input);
            if (typeof theDate === 'undefined') {
                return '';
            }

            return cultureService.format(theDate, format || 'T');
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:number
     * @param {String} [pattern] Pattern used to format the value ('n' by default).
     *
     * @description
     *
     * This filter formats a number into a string by invoking the `CultureService.format` function.
     */
    w20CoreCulture.filter('number', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            if (typeof input !== 'number') {
                return '';
            }

            return cultureService.format(input, format || 'n');
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:digit
     * @param {String} [pattern] Pattern used to format the value ('d' by default).
     *
     * @description
     *
     * This filter formats a number integer part into a string by invoking the `CultureService.format` function.
     */
    w20CoreCulture.filter('digit', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            if (typeof input !== 'number') {
                return '';
            }

            return cultureService.format(input, format || 'd');
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:percent
     * @param {String} [pattern] Pattern used to format the value ('p' by default).
     *
     * @description
     *
     * This filter formats a number into a percent string by invoking the `CultureService.format` function.
     */
    w20CoreCulture.filter('percent', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            if (typeof input !== 'number') {
                return '';
            }

            return cultureService.format(input, format || 'p');
        };
        filter.$stateful = true;

        return filter;
    }]);

    /**
     * @ngdoc filter
     * @name w20CoreCulture.filter:format
     * @argument {String} pattern Pattern used to format the value (required).
     *
     * @description
     *
     * This filter formats a value into a string by invoking the `CultureService.format` function.
     * The format argument is required.
     */
    w20CoreCulture.filter('format', ['CultureService', function (cultureService) {
        var filter = function (input, format) {
            if (typeof input === 'undefined') {
                return '';
            }

            return cultureService.format(input, format);
        };
        filter.$stateful = true;

        return filter;
    }]);

    return {
        angularModules: ['w20CoreCulture'],
        lifecycle: {
            pre: function (modules, fragments, callback) {
                allBundles = {};
                availableCultures = [];
                availableCultureObjects = [];
                loadedCultures = [];

                function addBundles(language, newBundles) {
                    if (typeof allBundles[language] === 'undefined') {
                        allBundles[language] = [];
                    }

                    allBundles[language] = allBundles[language].concat(newBundles);
                }

                // gather all fragments bundles and add them to the configuration
                _.each(fragments || {}, function (fragment) {
                    if (typeof fragment.definition.i18n === 'string') {
                        addBundles('', [fragment.definition.i18n]);
                    }
                    else if (typeof fragment.definition.i18n === 'object') {
                        _.each(fragment.definition.i18n || {}, function (fragmentBundles, language) {
                            addBundles(language, fragmentBundles);
                        });
                    }
                });

                // Preload cultures
                require(_.map(_.filter(config.available, function (elt) {
                        // Filter cultures to remove en since it is already in globalize.js
                        return elt !== 'en';
                }), function (elt) {
                        return '{globalize}/cultures/globalize.culture.' + elt;
                }), function () {

                    availableCultures = _.pluck(_.filter(globalize.cultures, function(elt, key) {
                        return key !== 'default' && (key !== 'en' || _.contains(config.available, 'en'));
                    }), 'name');

                    availableCultureObjects = _.map(availableCultures, function (name) {
                        return globalize.cultures[name];
                    });

                    if (window.localStorage) {
                        persistedCulture = localStorage.getItem('w20.state.' + w20.fragments['w20-core'].configuration.modules.application.id + '.culture');
                        if (persistedCulture) {
                            persistedCulture = globalize.findClosestCulture(JSON.parse(persistedCulture).first);
                            persistedCulture = _.contains(availableCultureObjects, persistedCulture) ? persistedCulture : undefined;
                        }
                    }

                    if (typeof config['default'] !== 'undefined') {
                        defaultCulture = globalize.findClosestCulture(config['default']) || defaultCulture;
                    }
                    else {
                        defaultCulture = globalize.findClosestCulture(window.navigator.language || window.navigator.userLanguage) || defaultCulture;
                    }

                    w20.console.log('Available cultures: ' + availableCultures);

                    switchCulture(persistedCulture || defaultCulture, function (culture) {
                        w20CoreCulture.config(['$provide', function ($provide) {
                            // define $locale values based on default culture
                            $provide.value('$locale', buildAngularLocale(culture));
                        }]);
                        callback(module);
                    });
                });
            }
        },
        availableCultures: availableCultures
    };
});
