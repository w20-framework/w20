import { FragmentConfig, FragmentDef } from './fragment';

export interface FragmentDSL {
    /**
     * Entry point for creating or getting a fragment. Following method(s) call(s) will
     * use the supplied fragment id to act on it.
     * @param id The fragment unique identifier.
     * @returns {FragmentDSL}
     */
    fragment: (id: string) => FragmentDSL;
    /**
     * Set fragment configuration and activate it.
     * @param conf The fragment configuration
     * @param merge Specify if the configuration should be merged with any existing one or if
     * it should replace it. Default to true.
     * @returns {FragmentDSL}
     */
    enable: (conf?: FragmentConfig|string, merge?: boolean) => FragmentDSL;
    /**
     * Merge or set a fragment definition.
     * @param def The fragment definition or the path/url to its definition in json format.
     * @param merge Merge the definition with any existing one. Default to true.
     * @returns {FragmentDSL}
     */
    definition: (def: FragmentDef|string, merge?: boolean) => FragmentDSL;
    /**
     * Get the fragment definition and configuration
     * @returns {FragmentDef}
     */
    get: () => Promise<{definition: FragmentDef, configuration: FragmentConfig}>;
}
