import {FragmentDef, FragmentConfig, FragmentDsl} from './model';
import * as Utils from './utils';
import * as Configuration from './configuration';

export = Loader;

class Loader {
    private definedFragments: { [fragmentId: string]: FragmentDef } = {};
    private fragmentConfigs: { [fragmentId: string]: FragmentConfig } = {};

    private dsl(id: string): FragmentDsl {
        return {
            /**
             * Create or get a fragment.
             * @param id
             * @returns {FragmentDsl}
             */
            fragment: (id: string): FragmentDsl => {
                return this.fragment(id);
            },
            /**
             * Merge or set a fragment definition.
             * @param def The fragment definition
             * @param merge Merge the definition with existing one. Default to true.
             * @returns {FragmentDsl}
             */
            define: (def: FragmentDef, merge: boolean = true): FragmentDsl => {
                return this.define(id, def, merge);
            },
            /**
             * Set fragment configuration.
             * @param conf The fragment configuration
             * @param merge Merge the configuration with existing one. Default to true.
             * @returns {FragmentDsl}
             */
            configure: (conf: FragmentConfig, merge: boolean = true): FragmentDsl => {
                return this.configure(id, conf, merge);
            },
            /**
             * Get the fragment definition and configuration
             * @returns {FragmentDef}
             */
            get: (): {definition: FragmentDef, configuration: FragmentConfig} => {
                return this.getFragment(id);
            }
        }
    }

    /**
     * Entry point for defining and/or configuring a/multiples fragment(s).
     * @param id Fragment to create or modify
     * @returns FragmentDsl
     */
    public fragment(id: string): FragmentDsl {
        if (!this.definedFragments[id]) {
            this.definedFragments[id] = {id};
        }
        return this.dsl(id);
    }

    /**
     * Get all fragments configuration and definition.
     * @returns {{}}
     */
    public fragments() {
        return this.getFragments();
    }

    private define(fragmentId: string, fragmentDef: FragmentDef, merge: boolean = true) {
        if (merge) {
            Utils.merge(this.definedFragments[fragmentId], fragmentDef);
        } else {
            this.definedFragments[fragmentId] = fragmentDef;
        }
        return this.dsl(fragmentId);
    }

    private configure(fragmentId: string, fragmentConf: FragmentConfig, merge: boolean = true) {
        if (merge) {
            if (!this.fragmentConfigs[fragmentId]) {
                this.fragmentConfigs[fragmentId] = {};
            }
            Utils.merge(this.fragmentConfigs[fragmentId], fragmentConf);
        } else {
            this.fragmentConfigs[fragmentId] = fragmentConf;
        }
        return this.dsl(fragmentId);
    }

    private getFragments(): { [fragmentId: string]: { definition: FragmentDef, configuration: FragmentConfig } } {
        let fragments: {[k: string]: any} = {};
        Utils.keysOf(this.definedFragments).forEach(fragmentId => {
            fragments[fragmentId] = this.getFragment(fragmentId);
        });
        return fragments;
    }


    private getFragment(id: string): { definition: FragmentDef, configuration: FragmentConfig } {
        return {
            definition: this.definedFragments[id],
            configuration: this.fragmentConfigs[id]
        }
    }

    /**
     * Load fragments configuration from a path in .json format
     * @param path Path to the configuration file
     * @param merge Specify if configuration should be merged or replaced. Defaults to merge.
     */
    public loadConfiguration(path: string, merge:boolean = true):void {
        Configuration.loadConfiguration(path).then(configuration => {
            if (merge) {
                Utils.merge(this.fragmentConfigs, configuration)
            } else {
                this.fragmentConfigs = configuration;
            }
        }).catch(e => {
            // todo report error
        });
    }

    public init() {

    }
}


