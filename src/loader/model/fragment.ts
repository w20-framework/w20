import JsonSchema = tv4.JsonSchema;
import Config = SystemJSLoader.Config;

export type Fragment = {
    definition: FragmentDef,
    configuration: FragmentConfig
};

export interface FragmentDef {
    id?: string;
    description?: string;
    modules?: { [moduleId: string]: ModuleDef };
    requireConfig?: { map: any, paths: any, shim: any }; // For compatibility
    moduleLoaderConfig?: Config;
}

export interface FragmentConfig {
    optional?: boolean;
    ignore?: boolean;
    modules?: { [moduleName: string]: any };
    vars?: { [varName: string]: string };
}

export interface ModuleDef {
    path: string;
    autoload?: boolean;
    configSchema?: JsonSchema;
}

export type MapFragmentId<T> = { [fragmentId: string]: T };
