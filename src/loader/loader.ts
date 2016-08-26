/// <amd-dependency name="tv4" path="./lib/tv4" />
import {FragmentDef, FragmentConfig, FragmentDSL, MapFragmentId, Fragment, ModuleDef} from './model';
import {mergeObjects, keysOf} from './utils';
import {fetch} from './network';
import {loadConfiguration} from './configuration';
import TV4 = tv4.TV4;
import MultiResult = tv4.MultiResult;

declare let tv4: TV4;

const reservedFragments: MapFragmentId<string> = {
    'w20-core': 'node_modules/w20-core/w20-core.w20.json'
};

export = new Loader();

class Loader {
    private definedFragments: MapFragmentId<FragmentDef> = {};
    private fragmentConfigs: MapFragmentId<FragmentConfig> = {};
    private promiseOfDefinedFragments: Promise<MapFragmentId<FragmentDef>>;
    private promiseOfFragmentConfigs: Promise<MapFragmentId<FragmentConfig>>;

    private FragmentDSL(id: string): FragmentDSL {
        return {
            /**
             * Merge or set a fragment definition.
             * @param def The fragment definition or the path/url to its definition in json format.
             * @param merge Merge the definition with any existing one. Default to true.
             * @returns {FragmentDSL}
             */
            definition: (def: FragmentDef|string, merge: boolean = true): FragmentDSL => {
                return this.definition(id, def, merge);
            },
            /**
             * Set fragment configuration and activate it.
             * @param conf The fragment configuration
             * @param merge Specify if the configuration should be merged with any existing one or if
             * it should replace it. Default to true.
             * @returns {FragmentDSL}
             */
            enable: (conf?: FragmentConfig|string, merge: boolean = true): FragmentDSL => {
                return this.enable(id, conf, merge);
            },
            /**
             * Entry point for creating or getting a fragment. Following method(s) call(s) will
             * use the supplied fragment id to act on it.
             * @param id The fragment unique identifier.
             * @returns {FragmentDSL}
             */
            fragment: (fragmentId: string): FragmentDSL => {
                return this.fragment(fragmentId);
            },
            /**
             * Get the fragment definition and configuration
             * @returns {FragmentDef}
             */
            get: (): Promise<Fragment> => {
                return this.getFragmentAsync(id);
            }
        };
    }

    /**
     * Entry point for defining and/or configuring a/multiples fragment(s).
     * @param id Fragment to create or modify
     * @returns FragmentDSL
     */
    public fragment(id: string): FragmentDSL {
        this.promiseOfDefinedFragments = Promise.resolve(this.definedFragments);
        this.promiseOfFragmentConfigs = Promise.resolve(this.fragmentConfigs);
        return this.FragmentDSL(id);
    }

    /**
     * Get all fragments configuration and definition.
     * @returns {Promise<MapFragmentId<Promise<{definition: FragmentDef, configuration: FragmentConfig}>>>}
     */
    public getFragmentsAsync(): Promise<MapFragmentId<Fragment>> {
        return this.promiseOfDefinedFragments.then(definedFragments => {
            let fragmentIds = keysOf(definedFragments);
            let promisesOfFragments: Promise<Fragment>[] = [];

            fragmentIds.forEach(fragmentId => {
                promisesOfFragments.push(this.getFragmentAsync(fragmentId));
            });

            return Promise.all(promisesOfFragments).then(resolvedFragments => {
                let fragments: MapFragmentId<{ definition: FragmentDef, configuration: FragmentConfig }> = {};
                resolvedFragments.forEach((resolvedFragment, i) => {
                    fragments[fragmentIds[i]] = resolvedFragment;
                });
                return fragments;
            });
        });
    }

    private definition(fragmentId: string, fragmentDef: FragmentDef|string, merge: boolean = true): FragmentDSL {
        if (this.isReservedFragment(fragmentId)) {
            throw new Error(`The fragment '${fragmentId}' is a reserved fragment. Cannot override such definition.`);
        }

        let promiseOfFragmentDef = Promise.resolve(fragmentDef);
        if (typeof fragmentDef === 'string') {
            promiseOfFragmentDef = this.loadJSON(fragmentDef);
        }

        // todo: Push promises into array instead
        this.promiseOfDefinedFragments = promiseOfFragmentDef.then((definition: FragmentDef) => {
            if (!definition.id) {
                definition.id = fragmentId;
            }
            if (!this.definedFragments[fragmentId]) {
                this.definedFragments[fragmentId] = {};
            }
            if (merge) {
                mergeObjects(this.definedFragments[fragmentId], definition);
            } else {
                this.definedFragments[fragmentId] = definition;
            }
            return this.definedFragments;
        });

        return this.FragmentDSL(fragmentId);
    }

    private enable(fragmentId: string, fragmentConf: string|FragmentConfig = {}, merge: boolean = true) {
        this.promiseOfDefinedFragments.then(definedFragments => {
            try {
                this.validateFragmentConfiguration(fragmentConf, definedFragments[fragmentId]);
            } catch (e) {
                throw e;
            }
        }).catch(e => {
            console.error(e);
        });

        let promiseOfFragmentConfig = Promise.resolve(fragmentConf);
        if (typeof fragmentConf === 'string') {
            promiseOfFragmentConfig = this.loadJSON(fragmentConf);
        }

        this.promiseOfFragmentConfigs = promiseOfFragmentConfig.then(configuration => {
            if (!this.fragmentConfigs[fragmentId]) {
                this.fragmentConfigs[fragmentId] = {};
            }
            if (merge) {
                mergeObjects(this.fragmentConfigs[fragmentId], configuration);
            } else {
                this.fragmentConfigs[fragmentId] = configuration;
            }

            return this.fragmentConfigs;
        });

        return this.FragmentDSL(fragmentId);
    }

    private getFragmentAsync(id: string): Promise<Fragment> {
        return this.promiseOfDefinedFragments.then(definedFragments => {
            let promiseOfFragmentDef: Promise<MapFragmentId<FragmentDef>> = Promise.resolve(definedFragments);

            if (!definedFragments[id]) {
                if (this.isReservedFragment(id)) {
                    promiseOfFragmentDef = this.loadJSON(reservedFragments[id]).then(definition => {
                        this.definedFragments[id] = definition;
                        return this.definedFragments;
                    });
                } else {
                    throw new Error(`Cannot get fragment '${id}'. No definition was found.`);
                }
            }

            return promiseOfFragmentDef.then(resolvedDefinedFragments => {
                return this.promiseOfFragmentConfigs.then(resolvedFragmentConfigs => {
                    return {
                        configuration: resolvedFragmentConfigs[id],
                        definition: resolvedDefinedFragments[id]
                    };
                });
            });
        });
    }

    /**
     * Validate a fragment configuration given a fragment definition. Throw error if validation fails.
     * @param fragmentConf The fragment configuration
     * @param fragmentDef The fragment definition
     * @param validator The JSON Schema validator to use (default to embedded tv4.js)
     */
    public validateFragmentConfiguration(fragmentConf: FragmentConfig, fragmentDef: FragmentDef, validator: TV4 = tv4): void {
        if (fragmentConf.modules) {
            let moduleConf: {[prop: string]: any};
            let moduleDef: ModuleDef;

            keysOf(fragmentConf.modules).forEach((moduleName: string) => {
                moduleDef = fragmentDef.modules[moduleName];
                if (!moduleDef) {
                    throw new Error(`Missing definition for module '${moduleName}' of fragment '${fragmentDef.id}'`);
                }
                if (moduleDef.configSchema) {
                    moduleConf = fragmentConf.modules[moduleName];

                    let result = validator.validateMultiple(moduleConf, moduleDef.configSchema);

                    if (!result.valid) {
                        throw new Error(`Configuration of module '${moduleName}' in fragment '${fragmentDef.id}' is not valid.\n${this.getValidationErrors(result)}`);
                    }
                }
            });
        }
    }

    private getValidationErrors(validationResult: MultiResult): string {
        let result = '';
        for (let i = 0; i < validationResult.errors.length; i++) {
            const currentError = validationResult.errors[i];
            result += `${currentError.dataPath}: ${currentError.message}\n`;
        }
        return result;
    }

    /**
     * Load fragments configuration in json format, parse it and merge/replace it into the fragment configs.
     * @param path Path to the configuration file
     * @param merge Specify if configuration should be merged or replaced. Defaults to merge.
     */
    public loadConfiguration(path: string, merge: boolean = true): void {
        loadConfiguration(path).then(configuration => {
            if (merge) {
                mergeObjects(this.fragmentConfigs, configuration);
            } else {
                this.fragmentConfigs = configuration;
            }
        });
    }

    /**
     * Load and parse JSON data from a given path returning a promise
     * @param path The location of the JSON data
     * @param withCredentials Specify if the withCredentials header should be set in the request header
     * @returns {Promise<TResult>|Promise<U>}
     */
    public loadJSON(path: string, withCredentials: boolean = false): Promise<Object|Array<any>> {
        return fetch(path, withCredentials).then(response => JSON.parse(response));
    }

    private isReservedFragment(id: string): boolean {
        return !!reservedFragments[id];
    };

    /**
     * Clear all defined and configured fragments from the loader. Useful for unit testing.
     */
    public clear(): void {
        this.definedFragments = {};
        this.fragmentConfigs = {};
        this.promiseOfDefinedFragments = null;
        this.promiseOfFragmentConfigs = null;
    }

}
