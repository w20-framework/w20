import {FragmentDef, FragmentConfig} from "model";
export = Loader;

type FragmentDsl = {
    fragment: (id:string) => FragmentDsl,
    configure: (conf: FragmentConfig) => FragmentDsl
    define: (def:FragmentDef) => FragmentDsl,
    get: () => {definition: FragmentDef, configuration: FragmentConfig},
}

class Loader {
    private definedFragments:{ [fragmentId:string]:FragmentDef } = {};
    private fragmentConfigs:{ [fragmentId:string]:FragmentConfig } = {};

    private dsl(id:string): FragmentDsl {
        return {
            /**
             * Create or get a fragment.
             * @param id
             * @returns {FragmentDsl}
             */
            fragment: (id:string): FragmentDsl => {
                return this.fragment(id);
            },
            /**
             * Merge or set a fragment definition.
             * @param def The fragment definition
             * @param merge Merge the definition with existing one. Default to true.
             * @returns {FragmentDsl}
             */
            define: (def:FragmentDef, merge:boolean = true): FragmentDsl => {
                return this.define(id, def, merge);
            },
            /**
             * Set fragment configuration.
             * @param conf The fragment configuration
             * @param merge Merge the configuration with existing one. Default to true.
             * @returns {FragmentDsl}
             */
            configure: (conf:FragmentConfig, merge:boolean = true): FragmentDsl => {
                return this.configure(id, conf, merge);
            },
            /**
             * Get the fragment definition and configuration
             * @returns {FragmentDef}
             */
            get:():{definition: FragmentDef, configuration: FragmentConfig} => {
                return this.getFragment(id);
            }
        }
    }

    /**
     * Entry point for defining and/or configuring a/multiples fragment(s).
     * @param id Fragment to create or modify
     * @returns FragmentDsl
     */
    public fragment(id:string): FragmentDsl {
        if (!this.definedFragments[id]) {
            this.definedFragments[id] = {id};
        }
        return this.dsl(id);
    }

    /**
     * Get all fragments configuration and definition.
     * @returns {{}}
     */
    public fragments()  {
        return this.getFragments();
    }


    private define(fragmentId:string, fragmentDef:FragmentDef, merge:boolean = true) {
        if (merge) {
            this.merge(this.definedFragments[fragmentId], fragmentDef);
        } else {
            this.definedFragments[fragmentId] = fragmentDef;
        }
        return this.dsl(fragmentId);
    }

    private configure(fragmentId:string, fragmentConf:FragmentConfig, merge:boolean = true) {
        if (merge) {
            if (!this.fragmentConfigs[fragmentId]) {
                this.fragmentConfigs[fragmentId] = {};
            }
            this.merge(this.fragmentConfigs[fragmentId], fragmentConf);
        } else {
            this.fragmentConfigs[fragmentId] = fragmentConf;
        }
        return this.dsl(fragmentId);
    }

    private getFragments(): { [fragmentId:string]: { definition:FragmentDef, configuration:FragmentConfig } } {
        let fragments: {[k:string]: any} = {};
        this.keysOf(this.definedFragments).forEach(fragmentId => {
            fragments[fragmentId] = this.getFragment(fragmentId);
        });
        return fragments;
    }


    private getFragment(id:string): { definition: FragmentDef, configuration: FragmentConfig } {
        return {
            definition: this.definedFragments[id],
            configuration: this.fragmentConfigs[id]
        }
    }

    /*
    * Utilities
    */
    private keysOf = Object.keys;
    private valuesOf = (object:{[key: string]: any}) => this.keysOf(object).map(k => object[k]);

    /*
    * Merge objects recursively concatenating arrays if present.
    * Note: Original objects are modified.
    */
    private merge(...sources:Object[]):Object {
        let r = (previous:any, current:any) => {
            this.keysOf(current).forEach(p => {
                try {
                    if (current[p].constructor === Object) {
                        previous[p] = r(previous[p], current[p]);
                    } else if (Array.isArray(current[p]) && Array.isArray(previous[p])) {
                        previous[p] = previous[p].concat(current[p]);
                    } else {
                        previous[p] = current[p];
                    }
                } catch (e) {
                    previous[p] = current[p];
                }
            });
            return previous;
        };
        return sources.reduce(r);
    }

    public init() {

    }
}


