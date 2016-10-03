/**
 *  !!!! Since this is not transpiled using ES6 features will break in some "browsers"
 */
define(['../dist/src/loader/loader'], function (loader) {

    loader
        .fragment('one')
        .definition({
            modules: {
                oneModule: {
                    path: 'one/path',
                    configSchema: {
                        type: 'integer'
                    }
                }
            }
        })
        .enable({
            modules: {
                oneModule: 1
            }
        })
        .fragment('two')
        .definition({
            modules: {
                twoModule: {
                    path: 'two/path',
                    configSchema: {
                        type: 'integer'
                    }
                }
            }
        })
        .enable({
            modules: {
                twoModule: 3
            }
        })
        .enable({
            modules: {
                twoModule: 1
            }
        });


    loader.fragment('one').get().then(function(fragmentOne) {
       console.log(fragmentOne);
    });

    loader.fragment('two').get().then(function(fragmentOne) {
       console.log(fragmentOne);
    });

    //Loader.loadConfiguration('inexisting.json');

    loader.loadJSON('test-fragment.json').then(function(fragDef) {
      console.log(fragDef);
    });

    loader
        .fragment('test-fragment')
        .definition('test-fragment.json')
        .enable({
            modules: {
                hypermedia: {
                    api: {}
                }
            }
        })
        .fragment('inline')
        .definition({
            modules: {
                aModule: {
                    path: 'path/to/module',
                    configSchema: {
                        type: 'object',
                        properties: {
                            a: {
                                type: 'string'
                            },
                            b: {
                                type: 'integer'
                            }
                        }
                    }
                }
            }
        })
        .enable({
            modules: {
                aModule: {
                    a: 'value',
                    b: 1
                }
            }
        });

    loader.getFragmentsAsync().then(function(fragments) {
        console.log(fragments);
    });

    loader.setReservedFragmentLocation('w20-core', 'fragment-definition.json');
    loader.fragment('w20-core').enable().get().then(function(fragment) {
        //console.log(fragment);
    });

   /* Loader.loadConfiguration('config-test2.json').getFragmentsAsync().then(function(fragments) {
        console.log(fragments);
    });*/

    loader.init();
});
