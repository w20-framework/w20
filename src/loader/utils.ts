// Merge objects recursively concatenating arrays if present (original objects are modified).
export function merge(...sources:Object[]):Object {
    let r = (previous:any, current:any) => {
        this.keysOf(current).forEach((p:string) => {
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

export let keysOf = Object.keys;

export let valuesOf = (object:{[key: string]: any}) => this.keysOf(object).map((k:string) => object[k]);

