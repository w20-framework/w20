The W20 UI fragment bundles the [UI Select](https://github.com/angular-ui/ui-select/wiki) library which is a pure AngularJS
implementation of a advanced select component (also known as a combo box). To add this component to your application
just add the `select` module to the `w20-ui` fragment configuration:

    "resources/w20-ui/w20-ui.w20.json": {
        "modules": {
            "select": {}
        }
    }

Please refer to the UI Select documentation for usage. Please note that W20 impose the bootstrap theme of the UI Select
component.