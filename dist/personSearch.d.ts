export interface PersonSearchOptions {
    name: string;
    context?: string;
    siteAllowList?: string[];
    xHandles?: string[];
    fromDate?: string;
    toDate?: string;
    maxResults?: number;
    stream?: boolean;
    includeInstagram?: boolean;
    includeFacebook?: boolean;
    includeNews?: boolean;
}
export declare function searchPerson(options: PersonSearchOptions): Promise<any>;
//# sourceMappingURL=personSearch.d.ts.map