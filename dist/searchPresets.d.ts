export interface SearchPresetOptions {
    allowedWebsites?: string[];
    excludedWebsites?: string[];
    includedXHandles?: string[];
    excludedXHandles?: string[];
    includeRSS?: boolean;
    includeInstagram?: boolean;
    includeFacebook?: boolean;
    includeNews?: boolean;
    forceSearch?: boolean;
}
export declare function peopleLookupPreset(opts?: SearchPresetOptions): any;
//# sourceMappingURL=searchPresets.d.ts.map