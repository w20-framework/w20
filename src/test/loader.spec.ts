/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import Loader = require('../loader/loader');

let loader:Loader;

beforeEach(() => {
    loader = new Loader();
});

describe('The Loader class', () => {

    it('should provide an instance when requiring it', () => {
        expect(loader).toBeDefined();
    });

    it('should register fragment', () => {
        const moduleDef = {someModule: {path: '/a/b'}};
        const fragmentDef = {id: 'test-fragment', modules: moduleDef};

        loader.fragment('test-fragment').define({modules: moduleDef});
        expect(loader.fragment('test-fragment').get()).toEqual({definition: fragmentDef, configuration: undefined});
    });

    it('should allow defining fragment', () => {
        expect(loader.fragment('test-fragment').get()).toEqual({
            definition: {id: 'test-fragment'},
            configuration: undefined
        });
    });

    it('should allow chaining multiple fragment definition and configuration', () => {
        loader
            .fragment('one')
            .define({
                modules: {
                    oneModule: {
                        path: 'one/path'
                    }
                }
            })
            .configure({
                modules: {
                    oneModule: {
                        propOne: 'propOneValue'
                    }
                }
            })
            .fragment('two')
            .define({
                modules: {
                    twoModule: {
                        path: 'two/path'
                    }
                }
            })
            .configure({
                modules: {
                    twoModule: {
                        propTwo: 'propTwoValue'
                    }
                }
            });

        let fragmentOne = loader.fragment('one').get();
        let fragmentTwo = loader.fragment('two').get();

        expect(fragmentOne.definition.modules['oneModule'].path).toEqual('one/path');
        expect(fragmentOne.configuration.modules['oneModule']['propOne']).toEqual('propOneValue');

        expect(fragmentTwo.definition.modules['twoModule'].path).toEqual('two/path');
        expect(fragmentTwo.configuration.modules['twoModule']['propTwo']).toEqual('propTwoValue');
    })

});


