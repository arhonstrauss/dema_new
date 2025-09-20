#!/usr/bin/env node

// Simple debug script to test xAI API calls
import { config } from 'dotenv';
import { chatCompletion, askGrok } from './dist/client.js';

config();

async function testAPI() {
  console.log('Testing xAI API...');
  console.log('XAI_API_KEY exists:', !!process.env.XAI_API_KEY);
  console.log('XAI_MODEL:', process.env.XAI_MODEL || 'grok-4');
  
  if (!process.env.XAI_API_KEY) {
    console.error('❌ XAI_API_KEY is not set in environment variables');
    console.log('Please create a .env file with your xAI API key:');
    console.log('XAI_API_KEY=your_api_key_here');
    return;
  }

  try {
    // Test 1: Simple chat completion
    console.log('\n🧪 Test 1: Simple chat completion');
    const result1 = await chatCompletion({
      model: 'grok-4',
      messages: [
        { role: 'user', content: 'Hello, can you say hi back?' }
      ],
      temperature: 0.2
    });
    console.log('✅ Success:', result1.choices?.[0]?.message?.content);

    // Test 2: Using askGrok function
    console.log('\n🧪 Test 2: Using askGrok function');
    const result2 = await askGrok([
      { role: 'user', content: 'What is 2+2?' }
    ]);
    console.log('✅ Success:', result2.text);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testAPI();
