SystemJS.config({
    baseURL: '.',
    defaultJSExtensions: true
});

SystemJS.import("main")
    .then(function () {
        console.info("W20 loaded");
    })
    .catch(function (e:Error) {
        console.error("Error loading W20 ", e);
    });
