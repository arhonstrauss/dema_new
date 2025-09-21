#!/usr/bin/env node

import { hybridSocialSearch } from './hybridSocialSearch.js';

interface SocialCLIOptions {
  name: string;
  context?: string;
  instagram?: boolean;
  facebook?: boolean;
  news?: boolean;
  max?: number;
  stream?: boolean;
}

function parseArgs(): SocialCLIOptions {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: social-search "Full Name" [options]');
    console.error('');
    console.error('Options:');
    console.error('  --context "Organization"    Focus search on specific organization/context');
    console.error('  --instagram                Include Instagram data via MCP');
    console.error('  --facebook                 Include Facebook data via MCP');
    console.error('  --no-news                  Exclude news sources from search');
    console.error('  --max N                    Maximum number of search results (default: 30)');
    console.error('  --stream                   Stream the response in real-time');
    console.error('');
    console.error('Examples:');
    console.error('  social-search "Elon Musk" --instagram --facebook');
    console.error('  social-search "John Doe" --context "OpenAI" --instagram');
    console.error('  social-search "Jane Smith" --facebook --no-news');
    process.exit(1);
  }

  const name = args[0];
  const options: SocialCLIOptions = { name };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const nextArg = args[i + 1];

    switch (arg) {
      case '--context':
        if (nextArg && !nextArg.startsWith('--')) {
          options.context = nextArg;
          i++; // Skip next argument
        } else {
          console.error('Error: --context requires a value');
          process.exit(1);
        }
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
    
    console.log(`🔍 Hybrid Social Search for: ${options.name}`);
    if (options.context) {
      console.log(`📋 Context: ${options.context}`);
    }
    if (options.instagram) {
      console.log(`📸 Instagram: Enabled`);
    }
    if (options.facebook) {
      console.log(`📘 Facebook: Enabled`);
    }
    if (options.news === false) {
      console.log(`📰 News: Disabled`);
    }
    if (options.max) {
      console.log(`📊 Max results: ${options.max}`);
    }
    console.log('');

    const result = await hybridSocialSearch({
      name: options.name,
      context: options.context,
      includeInstagram: options.instagram || false,
      includeFacebook: options.facebook || false,
      includeNews: options.news !== false,
      maxResults: options.max || 30,
      stream: options.stream || false
    });

    // Display results
    console.log('\n📊 SEARCH RESULTS');
    console.log('==================');
    
    if (result.xaiSearch && result.xaiSearch.choices && result.xaiSearch.choices[0]) {
      console.log('\n🌐 xAI Search Results:');
      console.log(result.xaiSearch.choices[0].message.content);
      
      if (result.xaiSearch.citations && result.xaiSearch.citations.length > 0) {
        console.log('\n📚 Citations:');
        result.xaiSearch.citations.forEach((citation: any, index: number) => {
          console.log(`${index + 1}. ${citation.title || 'Untitled'}`);
          if (citation.url) console.log(`   URL: ${citation.url}`);
          if (citation.snippet) console.log(`   Snippet: ${citation.snippet}`);
          console.log('');
        });
      }
    }

    if (result.instagramData) {
      console.log('\n📸 Instagram Data:');
      if (result.instagramData.error) {
        console.log(`❌ Error: ${result.instagramData.error}`);
      } else {
        console.log('✅ Instagram data retrieved successfully');
        if (result.instagramData.profile) {
          console.log('Profile:', JSON.stringify(result.instagramData.profile, null, 2));
        }
        if (result.instagramData.recentPosts) {
          console.log('Recent Posts:', JSON.stringify(result.instagramData.recentPosts, null, 2));
        }
      }
    }

    if (result.facebookData) {
      console.log('\n📘 Facebook Data:');
      if (result.facebookData.error) {
        console.log(`❌ Error: ${result.facebookData.error}`);
      } else {
        console.log('✅ Facebook data retrieved successfully');
        if (result.facebookData.posts) {
          console.log('Posts:', JSON.stringify(result.facebookData.posts, null, 2));
        }
      }
    }

    if (result.combinedAnalysis && result.combinedAnalysis.text) {
      console.log('\n🤖 Combined Analysis:');
      console.log('=====================');
      console.log(result.combinedAnalysis.text);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
