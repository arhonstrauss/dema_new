export interface PersonRow {
    name: string;
    address?: string;
    context?: string;
}
export interface ProcessedPersonRow extends PersonRow {
    fullOutput: string;
    topIssues: Array<{
        issue: string;
        stance: string;
        reasoning: string;
    }>;
}
export declare function processCsvFile(inputPath: string, outputPath: string): Promise<void>;
//# sourceMappingURL=processCsv.d.ts.map