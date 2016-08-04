export class ModuleDef {
    path:string;
    autoLoad:boolean;
}

export class FragmentDef {
    id:string;
    description?:string;
    modules?:{ [moduleId:string]:ModuleDef };
    paths?:{ [s:string]:string };
}

export class FragmentConfig {
    optional:boolean;
    modules:{ [s:string]:{} };
    vars:{ [s:string]:string };
}
