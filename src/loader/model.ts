export interface ModuleDef {
    path:string;
    autoLoad?:boolean;
}

export interface FragmentDef {
    id?:string;
    description?:string;
    modules?:{ [moduleId:string]:ModuleDef };
    paths?:{ [alias:string]:string };
}

export interface FragmentConfig {
    optional?:boolean;
    modules?:{ [moduleName:string]:any };
    vars?:{ [varName:string]:string };
}

export interface FragmentDsl {
    fragment: (id:string) => FragmentDsl,
    configure: (conf: FragmentConfig) => FragmentDsl
    define: (def:FragmentDef) => FragmentDsl,
    get: () => {definition: FragmentDef, configuration: FragmentConfig},
}
