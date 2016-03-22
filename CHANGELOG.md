# Version 2.3.0 (?)

* [new] Add support for HTML5 mode (pretty urls)
* [new] Add the ability to specify an `optional` attribute on any fragment configuration, allowing application to load anyway.
* [new] Add the ability to specify an `ignore` attribute on any fragment configuration to avoid loading it.
* [brk] Remove `text` module which has been moved to `w20-extras` add-on.

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
