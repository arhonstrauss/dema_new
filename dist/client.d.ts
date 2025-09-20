export declare function chatCompletion(body: any): Promise<any>;
export declare function chatCompletionStream(body: any, onToken: (token: string) => void): Promise<{
    citations?: any;
    usage?: any;
}>;
export declare function askGrok(messages: any[], opts?: {
    stream?: boolean;
    searchParams?: any;
}): Promise<{
    text: any;
    citations: any;
    usage: any;
} | {
    text: string;
    citations?: undefined;
    usage?: undefined;
}>;
//# sourceMappingURL=client.d.ts.map