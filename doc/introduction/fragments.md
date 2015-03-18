The central concept in W20 is the **fragment**, which is a reusable bundle of Web resources described by a manifest. A
W20 application is composed of one or more fragment(s), which can be configured specifically. W20 itself is packaged
and distributed as multiple fragments, W20 Core being the first and most important.

# JSON manifest

As a fragment is only a collection of Web resources, they must be organized and described by a data structure, the fragment
manifest. It is a JSON data structure with the following minimal format:

    {
        "id" : "fragment-identifier"
    }
    
Each fragment loaded in a W20 application must be identified by a unique identifier. It is the only required attribute
of a fragment manifest and the only constraint. Naturally a fragment with such a limited amount of information will not
provide any useful behavior, so additional data structures can be added at will and will eventually trigger additional
behavior. 
 
## Modules section

The W20 loader recognize an additional section in the fragment manifest, under the `modules` attribute: 
 
    "modules": {
        "module1": {
            "path": "{fragment-identifier}/modules/module1",
            "config" : {
                ...
            },
            "schemaConfig": {
                ...
            },
            "autoload" : true|false
        }
    }
    
This section describes the AMD modules contained in the fragment with:

* The path which will be used by RequireJS to load the module if it is required by the application (**mandatory**), 
* The default configuration of the module which can be any object (optional),
* The JSON schema of the configuration options (optional),
* If the module will be loaded automatically or if it must be required explicitly by the application.

The modules described here are standard AMD modules. To know more about modules, please see the 
[corresponding section](#!/w20-doc/core/modules). 

## Other sections

When all the required modules of an application are loaded, each module can examine each fragment manifest to examine
it. Additional sections in the manifest can then be processed to trigger any additional behavior. By convention, each 
module detect its own section(s) and process them, though all the manifest is accessible and scoping is not enforced.

In W20 various modules are using this capability. For instance the `culture` module of `w20-core` will detect the
`i18n` sections in all manifests to register translation bundles to load. Another example is the `application` module
which will detect `routes` sections to register application routes in AngularJS.

If the module corresponding to a specific section is not loaded, it is simply ignored. This allows to declare capabilities
(or potential features) in a reusable fragment manifest, but decide at the application level (in configuration) if it
should be enabled or not.

# Loading 

A fragment is loaded when its manifest URL is referenced from an application configuration. At this point, an alias is
created between the fragment identifier enclosed with curly braces and the location *containing* the fragment manifest.
As an example, if the manifest of the `fragment1` fragment is loaded from `http://myserver.org/w20-fragments/fragment1/fragment1.w20.json`,
the `{fragment1}` alias will resolve to URL `http://myserver.org/w20-fragments/fragment1`.
 
This behavior allows to use the alias not only in the application but also in all fragment resources, including the
manifest. By doing this, you ensure that the paths are always relative to the fragment manifest location, so even if 
the fragment is moved, only a change in application configuration will be needed. **This is particularly important
if a fragment is intended to be reused across applications.**