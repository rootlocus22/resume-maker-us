#!/usr/bin/env node

/**
 * Test script for Gemini fallback mechanism
 * Run with: node scripts/test-gemini-fallback.js
 */

import { generateWithFallback, getAvailableModels, isOverloadError } from '../app/lib/geminiFallback.js';

async function testGeminiFallback() {
  console.log('🧪 Testing Gemini Fallback Mechanism');
  console.log('=====================================\n');

  // Test 1: Check available models
  console.log('📋 Available models:', getAvailableModels());
  console.log('');

  // Test 2: Test with a simple prompt
  const testPrompt = "Generate a professional summary for a software engineer with 5 years of experience in React and Node.js.";
  
  try {
    console.log('🚀 Testing fallback with simple prompt...');
    const result = await generateWithFallback(testPrompt, {
      maxOutputTokens: 150,
      temperature: 0.7
    });
    
    console.log('✅ Success!');
    console.log('📝 Generated text:', result.text);
    console.log('🤖 Model used:', result.model);
    console.log('🔄 Attempted models:', result.attemptedModels);
    console.log('');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('');
  }

  // Test 3: Test error detection
  console.log('🔍 Testing error detection...');
  const testError = new Error('The model is overloaded. Please try again later.');
  console.log('Is overload error?', isOverloadError(testError));
  
  const testError2 = new Error('Some other error');
  console.log('Is overload error?', isOverloadError(testError2));
  console.log('');

  // Test 4: Test with different prompt types
  const prompts = [
    "Suggest 5 skills for a marketing manager",
    "Write a brief experience description for a project manager role",
    "Create a professional summary for a data scientist"
  ];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`🧪 Test ${i + 1}: ${prompt.substring(0, 50)}...`);
    
    try {
      const result = await generateWithFallback(prompt, {
        maxOutputTokens: 100,
        temperature: 0.7
      });
      
      console.log(`✅ Success with model: ${result.model}`);
      console.log(`📝 Response: ${result.text.substring(0, 100)}...`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
      console.log('');
    }
  }

  console.log('🎉 Fallback mechanism test completed!');
}

// Run the test
testGeminiFallback().catch(console.error); 