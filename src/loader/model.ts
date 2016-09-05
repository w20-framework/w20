import JsonSchema = tv4.JsonSchema;

export type Fragment = {
    definition: FragmentDef,
    configuration: FragmentConfig
};

export interface FragmentDef {
    id?: string;
    description?: string;
    modules?: { [moduleId: string]: ModuleDef };
    paths?: { [alias: string]: string };
}

export interface FragmentConfig {
    optional?: boolean;
    ignore?: boolean;
    modules?: { [moduleName: string]: any };
    vars?: { [varName: string]: string };
}

export interface ModuleDef {
    path: string;
    autoLoad?: boolean;
    configSchema?: JsonSchema;
}

export interface FragmentDSL {
    fragment: (id: string) => FragmentDSL;
    enable: (conf?: FragmentConfig|string) => FragmentDSL;
    definition: (def: FragmentDef|string) => FragmentDSL;
    get: () => Promise<{definition: FragmentDef, configuration: FragmentConfig}>;
}

export type MapFragmentId<T> = { [fragmentId: string]: T };
