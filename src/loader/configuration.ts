import * as Network from './network';

function replacePlaceholders(text: string, values?: {[s: string]: string}, placeholderRegexp = new RegExp('\\${([\\w-]+)(:([^:}]*))?}', 'g') /* ${varname:defaultvalue} */):string {
    let fromLocalStorage = (varname: string, defaultValue: string): any => {
        const result = window.localStorage.getItem(varname);

        if (result === null) {
            if (typeof defaultValue === 'undefined') {
                return;
            } else {
                window.localStorage.setItem(varname, defaultValue);
                return defaultValue;
            }
        }
        return result;
    };

    return text.replace(placeholderRegexp, (all, varname, secondpart, defaultvalue) => {
        const replacement = values ? values[varname] : fromLocalStorage(varname, defaultvalue);

        if (typeof replacement === 'undefined' && typeof defaultvalue === 'undefined') {
            throw new Error('unresolved variable: ${' + varname + '}');
        }

        return replacement || defaultvalue || '';
    });
}

function parseConfiguration(config: string):any {
    try {
        return JSON.parse(replacePlaceholders(config));
    } catch (e) {
        // todo report error
    }
}

export function loadConfiguration(path:string):Promise<any> {
    return Network.fetch(path).then(configuration => {
        let parsedConfiguration = parseConfiguration(configuration);
        return Promise.resolve(parsedConfiguration);
    }).catch(e => {
        // todo report error
    });
}