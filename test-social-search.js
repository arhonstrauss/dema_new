#!/usr/bin/env node

// Test script for improved Instagram and Facebook scraping
import { config } from 'dotenv';
import { hybridSocialSearch } from './dist/hybridSocialSearch.js';

config();

async function testSocialSearch() {
  console.log('🧪 Testing improved Instagram and Facebook scraping...\n');
  
  try {
    // Test 1: Basic search with Instagram
    console.log('📸 Test 1: Search with Instagram sources');
    const result1 = await hybridSocialSearch({
      name: 'Arhon Strauss',
      includeInstagram: true,
      includeFacebook: false,
      includeNews: true,
      maxResults: 5
    });
    
    console.log('✅ Instagram search completed');
    console.log('XAI Search Results:', result1.xaiSearch ? 'Found' : 'None');
    console.log('Instagram Data:', result1.instagramData ? 'Found' : 'None');
    console.log('Combined Analysis:', result1.combinedAnalysis ? 'Generated' : 'None');
    console.log('');

    // Test 2: Search with Facebook
    console.log('📘 Test 2: Search with Facebook sources');
    const result2 = await hybridSocialSearch({
      name: 'Arhon Strauss',
      includeInstagram: false,
      includeFacebook: true,
      includeNews: true,
      maxResults: 5
    });
    
    console.log('✅ Facebook search completed');
    console.log('XAI Search Results:', result2.xaiSearch ? 'Found' : 'None');
    console.log('Facebook Data:', result2.facebookData ? 'Found' : 'None');
    console.log('Combined Analysis:', result2.combinedAnalysis ? 'Generated' : 'None');
    console.log('');

    // Test 3: Combined social media search
    console.log('🌐 Test 3: Combined Instagram + Facebook search');
    const result3 = await hybridSocialSearch({
      name: 'Arhon Strauss',
      includeInstagram: true,
      includeFacebook: true,
      includeNews: true,
      maxResults: 5
    });
    
    console.log('✅ Combined social media search completed');
    console.log('XAI Search Results:', result3.xaiSearch ? 'Found' : 'None');
    console.log('Instagram Data:', result3.instagramData ? 'Found' : 'None');
    console.log('Facebook Data:', result3.facebookData ? 'Found' : 'None');
    console.log('Combined Analysis:', result3.combinedAnalysis ? 'Generated' : 'None');
    
    // Show the combined analysis
    if (result3.combinedAnalysis && result3.combinedAnalysis.text) {
      console.log('\n📊 Combined Analysis:');
      console.log(result3.combinedAnalysis.text);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testSocialSearch();
