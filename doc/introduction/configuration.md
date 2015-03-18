The application configuration is one of the first things loaded by the W20 loader. Its role is to reference fragments
through their manifest URL and configured them specifically for the application. Here is a minimal configuration:

    {
        "resources/w20-core/w20-core.w20.json" : {}
    }
    
This configuration will trigger the load of the `w20-core` fragment and its modules defined as automatically loaded in 
the manifest. An alias will be bound from `{w20-core}` to the `resources/w20-core` URL.

# Configuring modules

Adding a fragment to the configuration like previously shown can be enough, although you often need to specify additional
information like the modules to load and their configuration. To do so, add a `modules` section to the empty object:

    {
        "resources/w20-core/w20-core.w20.json" : {
            "modules": {
                "application": {
                    "id": "my-app"
                }
            }
        }
    }

In this configuration, the `application` module of `w20-core` will be configured with the corresponding object (defining
the unique identifier of the application in this case). This module is normally defined as automatically loaded so this
definition will only serve to configure it. To load a module that is not automatically loaded without configuration, just 
specify it with an empty object:
 
    {
        "resources/w20-core/w20-core.w20.json": {
            "modules": {
                "application": {
                    "id": "my-app"
                }
            }
        },
        
        "resources/other-fragment/other-fragment.w20.json": {
            "modules": {
                "my-module": {}
            }
        }
    }

Note that:

* If a configuration JSON schema is provided for a specific module in the fragment manifest, the configuration specified
here will be validated against it.
* If a default configuration is provided for a specific module in the fragment manifest, the configuration specified here
will be merged with it, overriding it. If no default configuration is provided, the configuration is provided as-is to
the module.