let loader;

loader.loadConfiguration('path/to/configuration.json');

/**
 configuration.json

 "w20-core": {
	path: 'path/to/w20-core',
	modules: {

	}
}
 **/

// Look in default location for the definition (node_modules)
loader.fragment('w20-core').enable({
    modules: {
        application: {
            title: 'hello'
        }
    }
});

// Override fragment definition location
loader.fragment('w20-core').definition('path/to/definition').enable({
    modules: {
        application: {
            title: 'hello'
        }
    }
})

// Get fragment definition
loader.fragment('w20-core').get().then(definition => {

})

// not allowed - cannot redefine reserved fragment
loader.fragment('w20-core').definition();

// Business fragment can use a path to their definition
loader.fragment('idFragment').definition('path/to/fragmentDef');

// Or a raw object
loader.fragment('myFragment').definition({

}).enable({

});


