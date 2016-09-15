define(['../dist/loader/loader'], function (Loader) {

    // todo Fix definition with load json

    Loader
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


    Loader.fragment('one').get().then(function(fragmentOne) {
       // console.log(fragmentOne);
    });

    Loader.fragment('two').get().then(function(fragmentOne) {
       // console.log(fragmentOne);
    });

    //Loader.loadConfiguration('inexisting.json');

    Loader.loadJSON('test-fragment.json').then(function(fragDef) {
      //  console.log(fragDef);
    });

    Loader
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

    /*Loader.getFragmentsAsync().then(function(fragments) {
        console.log(fragments);
    });*/

    Loader.init();
});
