#!/usr/bin/env node

// MCP Setup Helper Script
import { config } from 'dotenv';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';

config();

async function checkEnvironment() {
  console.log('🔍 Checking MCP Environment Setup...\n');
  
  const requiredVars = {
    'Instagram MCP': [
      'INSTAGRAM_MCP_CMD',
      'FACEBOOK_APP_ID', 
      'FACEBOOK_APP_SECRET',
      'INSTAGRAM_ACCESS_TOKEN',
      'INSTAGRAM_BUSINESS_ACCOUNT_ID'
    ],
    'Facebook MCP': [
      'FACEBOOK_MCP_CMD',
      'FACEBOOK_PAGE_ACCESS_TOKEN',
      'FACEBOOK_PAGE_ID'
    ],
    'Twitter MCP': [
      'TWITTER_MCP_CMD',
      'API_KEY',
      'API_SECRET_KEY',
      'ACCESS_TOKEN',
      'ACCESS_TOKEN_SECRET'
    ]
  };

  for (const [service, vars] of Object.entries(requiredVars)) {
    console.log(`📱 ${service}:`);
    let allPresent = true;
    
    for (const varName of vars) {
      const value = process.env[varName];
      if (value && value !== `your_${varName.toLowerCase()}_here`) {
        console.log(`  ✅ ${varName}: Set`);
      } else {
        console.log(`  ❌ ${varName}: Missing`);
        allPresent = false;
      }
    }
    
    if (allPresent) {
      console.log(`  🎉 ${service} is ready!\n`);
    } else {
      console.log(`  ⚠️  ${service} needs configuration\n`);
    }
  }
}

async function testMCPConnection(service, cmd, args) {
  console.log(`🧪 Testing ${service} MCP connection...`);
  
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { 
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true 
    });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`  ✅ ${service} MCP server started successfully`);
        resolve(true);
      } else {
        console.log(`  ❌ ${service} MCP server failed: ${error}`);
        resolve(false);
      }
    });
    
    child.on('error', (err) => {
      console.log(`  ❌ ${service} MCP server error: ${err.message}`);
      resolve(false);
    });
    
    // Kill after 3 seconds
    setTimeout(() => {
      child.kill();
    }, 3000);
  });
}

async function testAllMCPs() {
  console.log('\n🧪 Testing MCP Connections...\n');
  
  const tests = [];
  
  if (process.env.INSTAGRAM_MCP_CMD && process.env.INSTAGRAM_MCP_ARGS) {
    const args = process.env.INSTAGRAM_MCP_ARGS.split(',').map(s => s.trim());
    tests.push(testMCPConnection('Instagram', process.env.INSTAGRAM_MCP_CMD, args));
  }
  
  if (process.env.FACEBOOK_MCP_CMD && process.env.FACEBOOK_MCP_ARGS) {
    const args = process.env.FACEBOOK_MCP_ARGS.split(',').map(s => s.trim());
    tests.push(testMCPConnection('Facebook', process.env.FACEBOOK_MCP_CMD, args));
  }
  
  if (process.env.TWITTER_MCP_CMD && process.env.TWITTER_MCP_ARGS) {
    const args = process.env.TWITTER_MCP_ARGS.split(',').map(s => s.trim());
    tests.push(testMCPConnection('Twitter', process.env.TWITTER_MCP_CMD, args));
  }
  
  if (tests.length === 0) {
    console.log('⚠️  No MCP servers configured for testing');
    return;
  }
  
  const results = await Promise.all(tests);
  const successCount = results.filter(r => r).length;
  
  console.log(`\n📊 Results: ${successCount}/${tests.length} MCP servers working`);
}

async function showNextSteps() {
  console.log('\n📋 Next Steps:');
  console.log('==============');
  console.log('1. Set up your Facebook Developer App');
  console.log('2. Get Instagram Business Account access tokens');
  console.log('3. Create Facebook Page and get Page access token');
  console.log('4. Update your .env file with the tokens');
  console.log('5. Install the MCP servers (see setup-instagram-mcp.md and setup-facebook-mcp.md)');
  console.log('6. Run this script again to test');
  console.log('\n💡 Note: MCP integration accesses YOUR accounts, not public search');
}

async function main() {
  console.log('🚀 MCP Setup Helper\n');
  
  await checkEnvironment();
  await testAllMCPs();
  await showNextSteps();
}

main().catch(console.error);
