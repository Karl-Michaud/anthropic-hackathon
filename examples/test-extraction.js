/**
 * Test script for scholarship extraction API
 *
 * Usage:
 * 1. Make sure the dev server is running: npm run dev
 * 2. Run this script: node examples/test-extraction.js
 */

const fs = require('fs');
const path = require('path');

// Read the example scholarship file
const exampleFilePath = path.join(__dirname, 'scholarship-example.txt');
const content = fs.readFileSync(exampleFilePath, 'utf-8');

async function testExtraction() {
  console.log('Testing Scholarship Extraction API...\n');
  console.log('Input file:', exampleFilePath);
  console.log('Content length:', content.length, 'characters\n');

  try {
    const response = await fetch('http://localhost:3000/api/extract-scholarship', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: content,
        fileType: 'txt'
      })
    });

    const result = await response.json();

    console.log('API Response:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60));

    if (result.success) {
      console.log('\n✅ Extraction successful!');
      console.log('\nExtracted Data:');
      console.log('- Title:', result.data.title);
      console.log('- Criteria:', result.data.criteria);
      console.log('- Amount:', result.data.amount);
      console.log('- Deadline:', result.data.deadline);
      console.log('- Eligibility:', result.data.eligibility.length, 'requirements');

      result.data.eligibility.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req}`);
      });
    } else {
      console.log('\n❌ Extraction failed:', result.error);
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('\n⚠️  Make sure the dev server is running: npm run dev');
  }
}

// Run the test
testExtraction();
