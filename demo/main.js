define(['../dist/src/loader/loader'], function (loader) {

    loader.fragment('w20-core').enable({
        modules: {
            application: {
                id: 'appId',
                home: '/'
            }
        }
    });

    loader.init();
});