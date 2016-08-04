import {FragmentDef, FragmentConfig} from "model.ts";

export default class Loader {
    private fragments:{ [fragmentId:string]:FragmentDef } = {};
    private fragmentConfigs:{ [fragmentId:string]:FragmentConfig } = {};

    public registerFragment(fragment:FragmentDef):Loader {
        this.fragments[fragment.id] = fragment;
        return this;
    }

    public enableFragment(fragmentId:string, fragmentConfig?:FragmentConfig):Loader {
        this.fragmentConfigs[fragmentId] = fragmentConfig;
        return this;
    }

    public init() {

    }
}
