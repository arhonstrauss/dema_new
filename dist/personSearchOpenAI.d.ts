export interface PersonSearchOptions {
    name: string;
    address?: string;
    context?: string;
    fromDate?: string;
    toDate?: string;
    maxResults?: number;
    stream?: boolean;
    includeInstagram?: boolean;
    includeFacebook?: boolean;
    includeNews?: boolean;
}
export declare function searchPersonOpenAI(options: PersonSearchOptions): Promise<any>;
//# sourceMappingURL=personSearchOpenAI.d.ts.map