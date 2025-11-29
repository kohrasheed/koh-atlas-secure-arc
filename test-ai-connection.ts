/**
 * Test script to verify Anthropic API connection
 * Run with: node --loader ts-node/esm test-ai-connection.ts
 * Or: tsx test-ai-connection.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

async function testConnection() {
  console.log('🧪 Testing Anthropic API Connection...\n');
  
  // Check API key
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('❌ VITE_ANTHROPIC_API_KEY not found in .env file');
    console.error('   Please add your API key to .env file');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');
  
  // Initialize client
  const anthropic = new Anthropic({
    apiKey,
  });
  
  console.log('✅ Anthropic client initialized\n');
  
  // Test simple request
  console.log('🔄 Sending test request to Claude 3.5 Sonnet...');
  
  try {
    const startTime = Date.now();
    
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: 'Respond with exactly: "API connection successful! 🎉"',
        },
      ],
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('\n✅ SUCCESS! API is working!\n');
    console.log('📊 Response Details:');
    console.log('   Model:', message.model);
    console.log('   Response Time:', responseTime + 'ms');
    console.log('   Input Tokens:', message.usage.input_tokens);
    console.log('   Output Tokens:', message.usage.output_tokens);
    console.log('   Cost: $' + ((message.usage.input_tokens / 1000000 * 3) + (message.usage.output_tokens / 1000000 * 15)).toFixed(6));
    console.log('\n   Claude says:', message.content[0].type === 'text' ? message.content[0].text : '');
    
    console.log('\n🎯 All checks passed! Ready to implement AI recommendations.\n');
    
  } catch (error: any) {
    console.error('\n❌ API Test Failed!\n');
    
    if (error.status === 401) {
      console.error('   Error: Invalid API key');
      console.error('   Solution: Check that your API key is correct in .env file');
    } else if (error.status === 429) {
      console.error('   Error: Rate limit exceeded');
      console.error('   Solution: Wait a moment and try again');
    } else if (error.status === 500) {
      console.error('   Error: Anthropic API server error');
      console.error('   Solution: Try again in a moment');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.error('\n   Full error:', error);
    process.exit(1);
  }
}

// Run test
testConnection().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
