#!/usr/bin/env node

// Simple test without search parameters
import { config } from 'dotenv';
import { askGrok } from './dist/client.js';

config();

async function testSimpleSearch() {
  console.log('Testing simple search without search parameters...');
  
  try {
    const result = await askGrok([
      { role: 'user', content: 'Tell me everything you can find out about Arhon Strauss' }
    ]);
    
    console.log('✅ Success!');
    console.log('Response:', result.text);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testSimpleSearch();
