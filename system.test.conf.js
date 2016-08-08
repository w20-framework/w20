System.config({
    transpiler: null,
    defaultJSExtensions: true,
    pluginFirst: true,
    map: {
        'systemjs': 'node_modules/systemjs/dist/system.js',
        'system-polyfills': 'node_modules/systemjs/dist/system-polyfills.js'
    }
});