#!/usr/bin/env node

// Test CLI with simplified search parameters
import { config } from 'dotenv';
import { askGrok } from './dist/client.js';

config();

async function testCLISimple() {
  console.log('Testing CLI-style search with simplified parameters...');
  
  try {
    // Use askGrok with minimal search parameters
    const result = await askGrok([
      { 
        role: 'system', 
        content: 'You are a helpful assistant that provides comprehensive information about people. When searching for information about a person, provide accurate, up-to-date details including professional background, notable achievements, recent activities, and social media presence. Always cite your sources when possible.' 
      },
      { 
        role: 'user', 
        content: 'Please search for comprehensive information about Arhon Strauss.' 
      }
    ], {
      stream: false,
      searchParams: {
        sources: [
          { type: 'web', safe_search: true }
        ],
        mode: 'auto',
        return_citations: true,
        max_search_results: 10  // Much smaller number
      }
    });
    
    console.log('✅ Success!');
    console.log('Response:', result.text);
    
    if (result.citations) {
      console.log('\n--- Citations ---');
      result.citations.forEach((citation, index) => {
        console.log(`${index + 1}. ${citation.title || 'Untitled'}`);
        if (citation.url) console.log(`   URL: ${citation.url}`);
        if (citation.snippet) console.log(`   Snippet: ${citation.snippet}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testCLISimple();
