export interface HybridSearchOptions {
    name: string;
    context?: string;
    includeInstagram?: boolean;
    includeFacebook?: boolean;
    includeNews?: boolean;
    maxResults?: number;
    stream?: boolean;
}
export declare function hybridSocialSearch(options: HybridSearchOptions): Promise<any>;
export declare function searchPersonWithSocialMedia(name: string, options?: {
    instagram?: boolean;
    facebook?: boolean;
    context?: string;
}): Promise<any>;
//# sourceMappingURL=hybridSocialSearch.d.ts.map