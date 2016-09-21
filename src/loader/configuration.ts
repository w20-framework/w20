import * as Network from './network';
import { MapFragmentId, FragmentConfig } from "./model/fragment";

function replacePlaceholders(text: string, values?: {[s: string]: string}, placeholderRegexp = new RegExp('\\${([\\w-]+)(:([^:}]*))?}', 'g') /* ${varname:defaultvalue} */): string {
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

function parse(config: string): MapFragmentId<FragmentConfig> {
    return JSON.parse(replacePlaceholders(config));
}

function validate (configuration: any) {
    // todo implement
    return configuration;
}

export function loadConfiguration(path: string): Promise<any> {
    return Network.fetch(path).then(configuration => {
        let parsedConfiguration: MapFragmentId<FragmentConfig>;
        try {
            parsedConfiguration = validate(parse(configuration));
        } catch (e) {
            console.error(e);
        }
        return parsedConfiguration;
    });
}
