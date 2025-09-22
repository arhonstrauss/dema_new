import { searchPerson } from './personSearch.js';
import { synthesizeToJSON } from './jsonSynthesis.js';
import { writeFileSync, readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
export async function processCsvFile(inputPath, outputPath) {
    console.log(`Reading CSV file: ${inputPath}`);
    // Read and parse the input CSV
    const csvContent = readFileSync(inputPath, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });
    console.log(`Found ${records.length} people to process`);
    const processedRows = [];
    for (let i = 0; i < records.length; i++) {
        const person = records[i];
        console.log(`\nProcessing ${i + 1}/${records.length}: ${person.name}`);
        try {
            // Search for the person
            const searchResult = await searchPerson({
                name: person.name,
                address: person.address,
                context: person.context,
                stream: false,
                includeInstagram: false,
                includeFacebook: false,
                includeNews: true
            });
            // Extract the raw content
            let rawContent = '';
            if (searchResult.choices && searchResult.choices[0] && searchResult.choices[0].message) {
                rawContent = searchResult.choices[0].message.content;
            }
            else if (searchResult.output && searchResult.output[0] && searchResult.output[0].content && searchResult.output[0].content[0]) {
                rawContent = searchResult.output[0].content[0].text;
            }
            if (!rawContent) {
                console.log(`  No content found for ${person.name}`);
                processedRows.push({
                    ...person,
                    fullOutput: 'No information found',
                    topIssues: []
                });
                continue;
            }
            // Synthesize to JSON
            console.log(`  Synthesizing results for ${person.name}...`);
            const analysis = await synthesizeToJSON(rawContent);
            // Extract top 5 issues
            const topIssues = analysis.keyIssues
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 5)
                .map(issue => ({
                issue: issue.issue,
                stance: issue.stance,
                reasoning: issue.reasoning
            }));
            processedRows.push({
                ...person,
                fullOutput: analysis.fullOutput,
                topIssues
            });
            console.log(`  ✓ Completed ${person.name}`);
            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        catch (error) {
            console.error(`  ✗ Error processing ${person.name}:`, error instanceof Error ? error.message : String(error));
            processedRows.push({
                ...person,
                fullOutput: `Error: ${error instanceof Error ? error.message : String(error)}`,
                topIssues: []
            });
        }
    }
    // Convert to CSV format
    const csvData = processedRows.map(row => {
        const csvRow = {
            name: row.name,
            address: row.address || '',
            context: row.context || '',
            fullOutput: row.fullOutput.replace(/\n/g, ' ').replace(/\r/g, ' '), // Clean newlines for CSV
        };
        // Add top 5 issues as separate columns
        for (let i = 1; i <= 5; i++) {
            const issue = row.topIssues[i - 1];
            if (issue) {
                csvRow[`issue_${i}`] = issue.issue;
                csvRow[`stance_${i}`] = issue.stance;
                csvRow[`reasoning_${i}`] = issue.reasoning.replace(/\n/g, ' ').replace(/\r/g, ' ');
            }
            else {
                csvRow[`issue_${i}`] = '';
                csvRow[`stance_${i}`] = '';
                csvRow[`reasoning_${i}`] = '';
            }
        }
        return csvRow;
    });
    // Write the output CSV
    const outputCsv = stringify(csvData, {
        header: true,
        columns: [
            'name', 'address', 'context', 'fullOutput',
            'issue_1', 'stance_1', 'reasoning_1',
            'issue_2', 'stance_2', 'reasoning_2',
            'issue_3', 'stance_3', 'reasoning_3',
            'issue_4', 'stance_4', 'reasoning_4',
            'issue_5', 'stance_5', 'reasoning_5'
        ]
    });
    writeFileSync(outputPath, outputCsv);
    console.log(`\n✓ Processed CSV saved to: ${outputPath}`);
    console.log(`Processed ${processedRows.length} people total`);
}
//# sourceMappingURL=processCsv.js.map