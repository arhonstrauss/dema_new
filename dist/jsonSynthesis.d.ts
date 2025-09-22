export interface PoliticalAnalysis {
    fullOutput: string;
    politicalLeanings: {
        estimate: string;
        confidence: number;
        reasoning: string;
    };
    keyIssues: Array<{
        issue: string;
        stance: string;
        confidence: number;
        reasoning: string;
    }>;
    summary: string;
}
export declare function synthesizeToJSON(rawOutput: string): Promise<PoliticalAnalysis>;
//# sourceMappingURL=jsonSynthesis.d.ts.map