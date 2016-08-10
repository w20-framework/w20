define(['../dist/loader/loader'], function (Loader) {

    var loader = new Loader();

    Loader.loadConfiguration('main.json');

    loader.fragment('id')
        .define({
            id: 'overrideId',
            prop: 'prop',
            prop1: 1
        })
        .configure({
            prop: 'haha',
            prop1: 2
        })
        .fragment('hihi')
        .define({whatever: 1});

    console.log(loader.getFragments());

    loader.init();
});
