/*
 * Copyright (c) 2013-2016, The SeedStack authors <http://seedstack.org>
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import loader = require('../loader/loader');

describe('The Loader', () => {

    beforeEach(() => {
        loader.clear();
    });

    it('should provide an instance when requiring it', () => {
        expect(loader).toBeDefined();
    });

    it('should allow defining fragment', (done) => {
        loader.fragment('test-fragment').definition({}).get().then(fragment => {
            expect(fragment).toEqual({
                configuration: undefined,
                definition: {id: 'test-fragment'}
            });

            done();
        });
    });

    it('should throw an error if we enable or get an unknown fragment without previously defining it', (done) => {
        loader.fragment('mock1').get().catch(e => {
            expect(e).toBeDefined();
            done();
        });
    });

    it('should register a fragment when given a definition', (done) => {
        const moduleDef = {
            someModule: {
                path: '/a/b'
            }
        };
        const fragmentDef = {
            id: 'test-fragment',
            modules: moduleDef
        };

        loader.fragment('test-fragment').definition({ modules: moduleDef }).get().then(fragment => {
            expect(fragment).toEqual({configuration: undefined, definition: fragmentDef});
            done();
        });
    });

    it('should error if we enable a fragment with a non valid configuration', () => {
        let fragmentDef = {
            modules: {
                aModule: {
                    configSchema: {
                        type: 'string'
                    },
                    path: ''
                }
            }
        };
        let fragmentConf = {
            modules: {
                aModule: 1
            }
        };

        expect(() => loader.validateFragmentConfiguration(fragmentConf, fragmentDef)).toThrowError(/Configuration of module '.*' in fragment '.*' is not valid/);
    });

    it('should error if we try to define a fragment with a reserved id', () => {
        expect(() => { loader.fragment('w20-core').definition({}); }).toThrowError(/is a reserved/);
    });

    it('should get all the defined fragments', (done) => {
        loader.fragment('a').definition({id: 'a'});
        loader.fragment('b').definition({id: 'b'});
        loader.fragment('c').definition({id: 'c'});

        let fragmentsPromise = loader.getFragmentsAsync();

        fragmentsPromise.then(resolvedFragments => {
            expect(resolvedFragments['a'].definition).toEqual({id: 'a'});
            expect(resolvedFragments['b'].definition).toEqual({id: 'b'});
            expect(resolvedFragments['c'].definition).toEqual({id: 'c'});
            done();
        });
    });

    it('should get individual fragment', (done) => {
        loader
            .fragment('one')
            .definition({
                modules: {
                    oneModule: {
                        path: 'one/path'
                    }
                }
            })
            .enable({
                modules: {
                    oneModule: {
                        propOne: 'propOneValue'
                    }
                }
            });

        loader.fragment('one').get().then((fragmentOne: any) => {
            expect(fragmentOne.definition.modules['oneModule'].path).toEqual('one/path');
            expect(fragmentOne.configuration.modules['oneModule']['propOne']).toEqual('propOneValue');
            done();
        });
    });

    it('should get a fragment definition defined with a path', (done) => {
        loader.fragment('remote-definition').definition('/base/src/test/mock/fragment-definition.json').get().then(fragmentDef => {
            expect(fragmentDef.definition.modules['foo']).toBeDefined();
            expect(fragmentDef.definition.modules['xyz']).toBeUndefined();
            done();
        });
    });

    it('should allow chaining multiple fragment definition and configuration', (done) => {
        loader
            .fragment('one')
            .definition({
                modules: {
                    oneModule: {
                        path: 'one/path'
                    }
                }
            })
            .enable({
                modules: {
                    oneModule: {
                        propOne: 'propOneValue'
                    }
                }
            })
            .fragment('two')
            .definition({
                modules: {
                    twoModule: {
                        path: 'two/path'
                    }
                }
            })
            .enable({
                modules: {
                    twoModule: {
                        propTwo: 'propTwoValue'
                    }
                }
            });

        loader.getFragmentsAsync().then(fragments => {
            expect(fragments['one']).toEqual({
                configuration: {
                    modules: {
                        oneModule: {
                            propOne: 'propOneValue'
                        }
                    }
                },
                definition: {
                    id: 'one',
                    modules: {
                        oneModule: {
                            path: 'one/path'
                        }
                    }
                }
            });
            expect(fragments['two']).toEqual({
                definition: {
                    id: 'two',
                    modules: {
                        twoModule: {
                            path: 'two/path'
                        }
                    }
                },
                configuration: {
                    modules: {
                        twoModule: {
                            propTwo: 'propTwoValue'
                        }
                    }
                }
            });

            done();
        });
    });
});
