#!/usr/bin/env node

import { searchPerson } from './personSearch.js';
import { synthesizeToJSON } from './jsonSynthesis.js';
import { processCsvFile } from './processCsv.js';

interface CLIOptions {
  name: string;
  address?: string;
  context?: string;
  allow?: string[];
  x?: string[];
  from?: string;
  to?: string;
  max?: number;
  stream?: boolean;
  instagram?: boolean;
  facebook?: boolean;
  news?: boolean;
  json?: boolean;
  csv?: boolean;
  csvInput?: string;
  csvOutput?: string;
}

function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: people-search "Full Name" [options]');
    console.error('       people-search --csv input.csv output.csv');
    console.error('');
    console.error('Options:');
    console.error('  --address "Address"        Known address to help narrow search');
    console.error('  --context "Organization"    Focus search on specific organization/context');
    console.error('  --allow site1,site2        Comma-separated list of allowed websites');
    console.error('  --x @handle1,@handle2      Comma-separated list of X (Twitter) handles to include');
    console.error('  --from YYYY-MM-DD          Start date for search results');
    console.error('  --to YYYY-MM-DD            End date for search results');
    console.error('  --max N                    Maximum number of search results (default: 25, max: 29)');
    console.error('  --stream                   Stream the response in real-time');
    console.error('  --json                     Output results in structured JSON format');
    console.error('  --csv input.csv output.csv Process CSV file with multiple people');
    console.error('  --instagram                Include Instagram in search sources');
    console.error('  --facebook                 Include Facebook in search sources');
    console.error('  --no-news                  Exclude news sources from search');
    console.error('');
    console.error('Examples:');
    console.error('  people-search "Elon Musk"');
    console.error('  people-search "John Doe" --context "OpenAI" --stream');
    console.error('  people-search "Jane Smith" --address "123 Main St, City" --json');
    console.error('  people-search --csv people.csv results.csv');
    console.error('  people-search "Bob Wilson" --allow linkedin.com,github.com --x @bobwilson --json');
    process.exit(1);
  }

  // Check for CSV processing mode
  if (args[0] === '--csv') {
    if (args.length < 3) {
      console.error('Error: --csv requires input and output file paths');
      console.error('Usage: people-search --csv input.csv output.csv');
      process.exit(1);
    }
    return { name: '', csv: true, csvInput: args[1], csvOutput: args[2] } as any;
  }

  const name = args[0];
  const options: CLIOptions = { name };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--address':
        if (nextArg && !nextArg.startsWith('--')) {
          options.address = nextArg;
          i++; // Skip next argument
        } else {
          console.error('Error: --address requires a value');
          process.exit(1);
        }
        break;
      
      case '--context':
        if (nextArg && !nextArg.startsWith('--')) {
          options.context = nextArg;
          i++; // Skip next argument
        } else {
          console.error('Error: --context requires a value');
          process.exit(1);
        }
        break;
      
      case '--allow':
        if (nextArg && !nextArg.startsWith('--')) {
          options.allow = nextArg.split(',').map(site => site.trim());
          i++; // Skip next argument
        } else {
          console.error('Error: --allow requires a comma-separated list of websites');
          process.exit(1);
        }
        break;
      
      case '--x':
        if (nextArg && !nextArg.startsWith('--')) {
          options.x = nextArg.split(',').map(handle => handle.trim());
          i++; // Skip next argument
        } else {
          console.error('Error: --x requires a comma-separated list of X handles');
          process.exit(1);
        }
        break;
      
      case '--from':
        if (nextArg && !nextArg.startsWith('--')) {
          options.from = nextArg;
          i++; // Skip next argument
        } else {
          console.error('Error: --from requires a date in YYYY-MM-DD format');
          process.exit(1);
        }
        break;
      
      case '--to':
        if (nextArg && !nextArg.startsWith('--')) {
          options.to = nextArg;
          i++; // Skip next argument
        } else {
          console.error('Error: --to requires a date in YYYY-MM-DD format');
          process.exit(1);
        }
        break;
      
      case '--max':
        if (nextArg && !nextArg.startsWith('--')) {
          const max = parseInt(nextArg);
          if (isNaN(max) || max <= 0) {
            console.error('Error: --max requires a positive number');
            process.exit(1);
          }
          options.max = max;
          i++; // Skip next argument
        } else {
          console.error('Error: --max requires a number');
          process.exit(1);
        }
        break;
      
      case '--stream':
        options.stream = true;
        break;
      
      case '--json':
        options.json = true;
        break;
      
      case '--instagram':
        options.instagram = true;
        break;
      
      case '--facebook':
        options.facebook = true;
        break;
      
      case '--no-news':
        options.news = false;
        break;
      
      default:
        console.error(`Error: Unknown option ${arg}`);
        process.exit(1);
    }
  }

  return options;
}

async function main() {
  try {
    const options = parseArgs();
    
    // Handle CSV processing mode
    if (options.csv) {
      await processCsvFile(options.csvInput!, options.csvOutput!);
      return;
    }
    
    console.log(`Searching for information about: ${options.name}`);
    if (options.address) {
      console.log(`Address: ${options.address}`);
    }
    if (options.context) {
      console.log(`Context: ${options.context}`);
    }
    if (options.allow && options.allow.length > 0) {
      console.log(`Allowed websites: ${options.allow.join(', ')}`);
    }
    if (options.x && options.x.length > 0) {
      console.log(`X handles: ${options.x.join(', ')}`);
    }
    if (options.from) {
      console.log(`From date: ${options.from}`);
    }
    if (options.to) {
      console.log(`To date: ${options.to}`);
    }
    if (options.max) {
      console.log(`Max results: ${options.max}`);
    }
    console.log('');

    const result = await searchPerson({
      name: options.name,
      address: options.address,
      context: options.context,
      siteAllowList: options.allow,
      xHandles: options.x,
      fromDate: options.from,
      toDate: options.to,
      maxResults: options.max,
      stream: options.stream,
      includeInstagram: options.instagram,
      includeFacebook: options.facebook,
      includeNews: options.news
    });

    if (options.json) {
      // Extract the raw text content for JSON synthesis
      let rawContent = '';
      if (result.choices && result.choices[0] && result.choices[0].message) {
        rawContent = result.choices[0].message.content;
      } else if (result.output && result.output[0] && result.output[0].content && result.output[0].content[0]) {
        rawContent = result.output[0].content[0].text;
      }

      if (rawContent) {
        console.log('\nSynthesizing results into structured JSON...');
        try {
          const jsonAnalysis = await synthesizeToJSON(rawContent);
          console.log('\n' + JSON.stringify(jsonAnalysis, null, 2));
        } catch (error) {
          console.error('Error synthesizing to JSON:', error instanceof Error ? error.message : String(error));
          console.log('\n--- Raw Output ---');
          console.log(rawContent);
        }
      } else {
        console.error('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,No content found to synthesize');
      }
    } else if (!options.stream) {
      // Print the response content
      if (result.choices && result.choices[0] && result.choices[0].message) {
        console.log('\n' + result.choices[0].message.content);
      }

      // Print citations if available
      if (result.citations && result.citations.length > 0) {
        console.log('\n--- Citations ---');
        result.citations.forEach((citation: any, index: number) => {
          console.log(`${index + 1}. ${citation.title || 'Untitled'}`);
          if (citation.url) {
            console.log(`   URL: ${citation.url}`);
          }
          if (citation.snippet) {
            console.log(`   Snippet: ${citation.snippet}`);
          }
          console.log('');
        });
      }

      // Print usage information if available
      if (result.usage) {
        console.log('--- Usage ---');
        console.log(`Total tokens: ${result.usage.total_tokens || 'N/A'}`);
        console.log(`Prompt tokens: ${result.usage.prompt_tokens || 'N/A'}`);
        console.log(`Completion tokens: ${result.usage.completion_tokens || 'N/A'}`);
      }
    } else {
      // For streaming, citations and usage are returned separately
      console.log('\n');
      if (result.citations && result.citations.length > 0) {
        console.log('--- Citations ---');
        result.citations.forEach((citation: any, index: number) => {
          console.log(`${index + 1}. ${citation.title || 'Untitled'}`);
          if (citation.url) {
            console.log(`   URL: ${citation.url}`);
          }
          if (citation.snippet) {
            console.log(`   Snippet: ${citation.snippet}`);
          }
          console.log('');
        });
      }

      if (result.usage) {
        console.log('--- Usage ---');
        console.log(`Total tokens: ${result.usage.total_tokens || 'N/A'}`);
        console.log(`Prompt tokens: ${result.usage.prompt_tokens || 'N/A'}`);
        console.log(`Completion tokens: ${result.usage.completion_tokens || 'N/A'}`);
      }
    }

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
