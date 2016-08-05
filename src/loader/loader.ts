import {FragmentDef, FragmentConfig} from "model";
export = new Loader();

type FragmentDsl = {
    fragment: (id:string) => FragmentDsl,
    configure: (conf: FragmentConfig) => { fragment: (id:string) => FragmentDsl },
    define: (def:FragmentDef) => {
        configure: (conf:FragmentConfig) => { fragment: (id:string) => FragmentDsl },
        fragment: (id:string) => FragmentDsl
    }
}

class Loader {
    private fragments:{ [fragmentId:string]:FragmentDef } = {};
    private fragmentConfigs:{ [fragmentId:string]:FragmentConfig } = {};

    /**
     * Define and/or configure a/multiples fragment(s).
     *
     * @param id Fragment identifier
     * @returns FragmentDsl
     */
    public fragment(id:string): FragmentDsl {
        if (!this.fragments[id]) {
            this.fragments[id] = {id};
        }
        return {
            define: (def:FragmentDef) => {
                return this.define(id, def);
            },
            configure: (conf:FragmentConfig) => {
                return this.configure(id, conf);
            },
            fragment: (id:string) => {
                return this.fragment(id);
            }
        }
    }

    private define(fragmentId:string, fragmentDef:FragmentDef) {
        this.merge(this.fragments[fragmentId], fragmentDef);
        return {
            configure: (fragmentConf:FragmentConfig) => {
                return this.configure(fragmentId, fragmentConf);
            },
            fragment: (fragmentId:string) => {
                return this.fragment(fragmentId);
            }
        }
    }

    private configure(fragmentId:string, fragmentConf:FragmentConfig) {
        this.fragmentConfigs[fragmentId] = fragmentConf;
        return {
            fragment: (fragmentId:string) => {
                return this.fragment(fragmentId);
            }
        }
    }

    /*
    * Merge objects recursively concatenating arrays if present.
    * Note: Original objects are modified.
    */
    private merge(...sources:Object[]):Object {
        let r = (previous:any, current:any) => {
            Object.keys(current).forEach(p => {
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


