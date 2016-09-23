/// <amd-dependency name="tv4" path="./lib/tv4" />
import { FragmentDef, FragmentConfig, MapFragmentId, Fragment, ModuleDef } from './model/fragment';
import { FragmentDSL } from './model/dsl';
import { mergeObjects, keysOf } from './utils';
import { fetch } from './network';
import { loadConfiguration } from './configuration';
import reservedFragments from './reserved-fragment';
import TV4 = tv4.TV4;
import MultiResult = tv4.MultiResult;
import System = SystemJSLoader.System;
declare let tv4: TV4;
export = (<any> window).w20 = new Loader();

class Loader {

    private definedFragments: MapFragmentId<FragmentDef> = {};
    private promiseOfDefinedFragments: Promise<MapFragmentId<FragmentDef>> = Promise.resolve(this.definedFragments);

    private fragmentConfigs: MapFragmentId<FragmentConfig> = {};
    private promiseOfFragmentConfigs: Promise<MapFragmentId<FragmentConfig>> = Promise.resolve(this.fragmentConfigs);

    private dsl(fragmentId: string): FragmentDSL {
        return {
            fragment: (id: string): FragmentDSL => {
                return this.fragment(id);
            },

            definition: (fragmentDef: FragmentDef|string, merge: boolean = true): FragmentDSL => {
                if (this.isReservedFragment(fragmentId)) {
                    throw new Error(`The fragment '${fragmentId}' is a reserved fragment. Cannot override such definition.`);
                }
                this.promiseOfDefinedFragments = this.newPromiseOfDefinedFragments(fragmentId, fragmentDef, merge);
                return this.dsl(fragmentId);
            },

            enable: (fragmentConfig?: FragmentConfig|string, merge: boolean = true): FragmentDSL => {
                this.enableFragment(fragmentId, fragmentConfig, merge);
                return this.dsl(fragmentId);
            },

            get: (): Promise<Fragment> => {
                return this.getFragmentAsync(fragmentId);
            }
        };
    }

    /**
     * Entry point for defining and/or configuring a/multiples fragment(s).
     * @param id Fragment to create or modify
     * @returns FragmentDSL
     */
    public fragment(id: string): FragmentDSL {
        if (this.isReservedFragment(id)) {
            this.promiseOfDefinedFragments = this.newPromiseOfDefinedFragments(id, reservedFragments[id]);
        }
        return this.dsl(id);
    }

    /**
     * Get all fragments configuration and definition.
     * @returns {Promise<MapFragmentId<Promise<{definition: FragmentDef, configuration: FragmentConfig}>>>}
     */
    public getFragmentsAsync(): Promise<MapFragmentId<Fragment>> {
        return this.promiseOfDefinedFragments.then((definedFragments: MapFragmentId<FragmentDef>) => {
            let fragmentIds = keysOf(definedFragments);

            if (fragmentIds.length === 0) {
                return null;
            }

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

    /**
     * Load fragments configuration in json format, parse it and merge/replace it into the fragment configs.
     * @param path Path to the configuration file
     * @param merge Specify if configuration should be merged or replaced. Defaults to merge.
     * @return {Loader}
     */
    public loadConfiguration(path: string, merge: boolean = true): Loader {
        this.promiseOfDefinedFragments = this.promiseOfDefinedFragments.then(() => {

            return loadConfiguration(path).then((configuration: MapFragmentId<FragmentConfig>) => {
                let fragments: Promise<void>[] = [];

                keysOf(configuration).forEach((fragmentPath: string) => {
                    if (this.isReservedFragment(fragmentPath)) {
                        fragmentPath = reservedFragments[fragmentPath];
                    }

                    let promise = this.defineFragment(fragmentPath, fragmentPath, merge).then(() => {
                        return this.enableFragment(fragmentPath, configuration[fragmentPath], merge);
                    });

                    fragments.push(promise);
                });

                return Promise.all(fragments).then(() => {
                    return this.definedFragments;
                });

            }).catch(e => {
                console.error(e);
                return e;
            });
        });

        return this;
    }

    /**
     * Utility to load and parse JSON data from a given path returning a promise
     * @param path The location of the JSON data
     * @param withCredentials Specify if the withCredentials header should be set in the request header
     * @returns {Promise<Object|Array<any>|void>}
     */
    public loadJSON(path: string, withCredentials: boolean = false): Promise<Object|Array<any>|void> {
        return fetch(path, withCredentials).then(response => JSON.parse(response)).catch(e => {
            console.error(e);
        });
    }

    /**
     * Clear all defined and configured fragments from the loader.
     * @return {Loader}
     */
    public clear(): Loader {
        this.definedFragments = {};
        this.fragmentConfigs = {};
        this.promiseOfDefinedFragments = Promise.resolve(this.definedFragments);
        this.promiseOfFragmentConfigs = Promise.resolve(this.promiseOfFragmentConfigs);

        return this;
    }

    /**
     * Initialize and start the application. Collected fragments are used to retrieve modules
     * and create a SystemJS configuration.
     * @param moduleLoader The module loader to use. Default to SystemJS.
     * @return {Promise<any>}
     */
    public init(moduleLoader: System = System): Promise<any> {
        return this.getFragmentsAsync().then(fragments => {
            return this.initializeApplication(moduleLoader, fragments);
        }).catch(e => {
            console.error(e);
            return e;
        });
    }

    /**
     * Allow to override location of reserved fragment definition
     * @param id The id of the reserved fragment
     * @param path The new path
     */
    public setReservedFragmentLocation(id: string, path: string): void {
        if (reservedFragments[id]) {
            reservedFragments[id] = path;
        } else {
            throw new Error(`No reserved fragment with name ${id}`);
        }
    }

    /**
     * Return the location of a reserved fragment
     * @param id The id of the fragment
     * @return {string}
     */
    public getReservedFragmentLocation(id: string): string {
        return reservedFragments[id];
    }

    /**
     * Log the configuration to the console
     */
    public logConfiguration(): void {
        this.getFragmentsAsync().then(fragments => {
            console.log(JSON.stringify(fragments, null, 4));
        });
    }

    private newPromiseOfDefinedFragments(fragmentId: string, fragmentDef: FragmentDef|string, merge: boolean = true) {
        return this.promiseOfDefinedFragments.then(() => {
            return this.defineFragment(fragmentId, fragmentDef, merge);
        });
    }

    private defineFragment(fragmentId: string, fragmentDef: FragmentDef|string, merge: boolean = true): Promise<MapFragmentId<FragmentDef>> {
        let promiseOfFragmentDef = Promise.resolve(fragmentDef);

        if (typeof fragmentDef === 'string') {
            promiseOfFragmentDef = this.loadJSON(fragmentDef).catch(e => {
                console.error(e);
                return e;
            });
        }

        return promiseOfFragmentDef.then((definition: FragmentDef) => {
            if (!definition.id) {
                definition.id = fragmentId;
            } else if (definition.id) {
                if (definition.id !== fragmentId) {
                    // todo handle this case
                }
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
    }

    private enableFragment(fragmentId: string, fragmentConf: string|FragmentConfig = {}, merge: boolean = true): void {
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
    }

    private getFragmentAsync(id: string): Promise<Fragment> {
        return this.promiseOfDefinedFragments.then((definedFragments: MapFragmentId<FragmentDef>) => {

            if (!definedFragments[id]) {
                throw new Error(`Cannot get fragment '${id}'. No definition was found.`);
            }

            let promiseOfFragmentDef: Promise<MapFragmentId<FragmentDef>> = Promise.resolve(definedFragments);

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

    private getValidationErrors(validationResult: MultiResult): string {
        let result = '';
        for (let i = 0; i < validationResult.errors.length; i++) {
            const currentError = validationResult.errors[i];
            result += `${currentError.dataPath}: ${currentError.message}\n`;
        }
        return result;
    }

    private isReservedFragment(id: string): boolean {
        return !!reservedFragments[id];
    }

    private initializeApplication(moduleLoader: System, fragments: MapFragmentId<Fragment>): Promise<any> {
        if (!moduleLoader) {
            throw new Error('No module loader has been provided.');
        }

        console.log(fragments);

        return Promise.resolve(1);
    }
}
