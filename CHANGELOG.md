# Version 2.5.0 (2018-07-31)

* [fix] Fix missing injection in `security.js`

# Version 2.5.0 (2018-07-31)

* [new] Support for extensible security providers.
* [new] New security provider supporting custom authentication stored in a cookie. 
* [fix] Fix remaining hypermedia promise error after AngularJS 1.6+ migration.

# Version 2.4.5 (2018-07-10)

* [fix] Run grunt on prepare instead of install. 

# Version 2.4.3 (2018-07-10)

* [chg] Switch to Yarn as package manager (will preserve the dependency flat structure)

# Version 2.4.2 (2018-07-09)

* [chg] Update AngularJS to ^1.7.1

# Version 2.4.1 (2018-06-04)

* [fix] Fix hypermedia promise error after AngularJS 1.6+ migration.

# Version 2.4.0 (2018-03-21)

* [new] Move from bower to npm
* [chg] Update AngularJS to ^1.6.9
* [chg] Update jQuery to ^3.0.0

# Version 2.3.4 (2016-12-06)

* [fix] Fix error when invoking `buildLink()` with undefined (it can happen in templates). 

# Version 2.3.3 (2016-12-06)

* [fix] Fix hypermedia link building in IE 11.

# Version 2.3.2 (2016-10-06)

* [chg] Add method `buildLink` to build links in `NavigationService`.

# Version 2.3.1 (2016-05-25)

* [fix] Add missing entries in the angular locale object generated from globalize culture definition.

# Version 2.3.0 (2016-04-26)

* [new] Add support for HTML5 mode (pretty urls).
* [new] Add the ability to specify an `optional` attribute on any fragment configuration, allowing application to load anyway.
* [new] Add the ability to specify an `ignore` attribute on any fragment configuration to avoid loading it (useful for development).
* [new] Implement best-effort credentials cleanup for basic authentication (forcing the browser to forget credentials).
* [chg] Fallback to default culture when a translation is missing in active culture is no longer active by default. Sets `translationFallback` to `true` on the `culture` module configuration to force the fallback behavior.
* [brk] Remove `text` module which has been moved to `w20-extras` add-on.
* [fix] When translation fallback is active, always load default translations even when another culture is stored in preferences (#66).
* [fix] Fix translation of "Close all" notification dismiss link (#67).
* [fix] Catch JSON parsing error when persisted state is corrupted and fallback to default value (#68).
* [fix] Do not prevent `redirectAfterLogin` page to be shown after manual logout (#69).

# Version 2.2.2 (2016-02-15)

* [fix] Remove usage of non-standard `trimLeft` and `trimRight` functions in `w20.js`

# Version 2.2.1 (2016-02-08)

* [fix] Prevent redirection after login from applying if browsing session is already active (like after a full page refresh).

# Version 2.2.0 (2016-01-21)

* [new] Improve error handling when the configuration resource is corrupt.
* [new] The loader can now play nice when the backend resources are protected against XSRF (uses AngularJS XSRF default cookie and header names).
* [new] Add `getContentShift()` accessor on `DisplayService` to retrieve the content shifting values programmaticaly.
* [fix] Fix showdown dependency in `text` module.

# Version 2.1.1 (2015-11-25)

* [fix] Fix i18n data.

# Version 2.1.0 (2015-11-17)

* [brk] Merged w20-ui fragment into w20-core and refactored other fragments as add-ons.

# Version 2.0.0 (2015-07-27)

* [new] Initial Open-Source release.
