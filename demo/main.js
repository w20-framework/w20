define(['../dist/loader/loader'], function (loader) {
    loader.fragment('id').define({
        prop: 'prop',
        prop1: 1
    }).configure({
        prop: 'haha',
        prop1: 2
    }).fragment('hihi').define({whatever: 1});


    loader.init();
});
