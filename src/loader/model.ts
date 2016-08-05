export interface ModuleDef {
    path:string;
    autoLoad:boolean;
}

export interface FragmentDef {
    id?:string;
    description?:string;
    modules?:{ [moduleId:string]:ModuleDef };
    paths?:{ [s:string]:string };
}

export interface FragmentConfig {
    optional:boolean;
    modules:{ [s:string]:{} };
    vars:{ [s:string]:string };
}
