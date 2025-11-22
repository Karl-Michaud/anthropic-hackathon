/**
 * Test script for adaptive weighting API
 *
 * Usage:
 * 1. Make sure the dev server is running: npm run dev
 * 2. Run this script: node examples/test-adaptive-weighting.js
 */

async function testAdaptiveWeighting() {
  console.log('Testing Adaptive Weighting API...\n');

  // Example scholarship data
  const testData = {
    ScholarshipName: "Loran Scholars Foundation Award",
    ScholarshipDescription: `The Loran Award is a prestigious four-year undergraduate scholarship valued at $100,000.

    We are looking for students who demonstrate:
    - Character: integrity, courage, compassion, and a commitment to service
    - Service: a meaningful commitment to serving others and making a difference in their communities
    - Leadership potential: evidence of initiative, self-motivation, and the ability to inspire others

    Eligibility:
    - Canadian citizens or permanent residents
    - Graduating high school in the current year
    - Planning to attend a participating university

    Application deadline: October 15, 2025

    The selection process includes school nomination, regional interviews, and national finals. We value sustained commitment over resume padding, and look for authentic alignment with our values. Candidates should demonstrate how they've overcome challenges while maintaining their commitment to service.`,
    EssayPrompt: "Describe a time when you faced significant adversity and how you responded while maintaining your commitment to serving others. What did this experience teach you about leadership and your own values?"
  };

  console.log('Test Data:');
  console.log('- Scholarship Name:', testData.ScholarshipName);
  console.log('- Essay Prompt:', testData.EssayPrompt.substring(0, 100) + '...');
  console.log('\n');

  try {
    const response = await fetch('http://localhost:3000/api/adaptive-weighting', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log('API Response:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    console.log('='.repeat(60));

    if (result.success) {
      console.log('\n✅ Adaptive weighting successful!');

      // Display primary weights
      console.log('\nPrimary Category Weights:');
      console.log('-'.repeat(50));

      let totalWeight = 0;
      for (const [category, data] of Object.entries(result.data)) {
        const weight = data.weight;
        totalWeight += weight;
        console.log(`${category}: ${(weight * 100).toFixed(1)}%`);
      }

      console.log('-'.repeat(50));
      console.log(`Total: ${(totalWeight * 100).toFixed(1)}%`);

      // Show top 3 categories
      const sortedCategories = Object.entries(result.data)
        .sort((a, b) => b[1].weight - a[1].weight)
        .slice(0, 3);

      console.log('\nTop 3 Categories for this Scholarship:');
      sortedCategories.forEach(([category, data], index) => {
        console.log(`${index + 1}. ${category} (${(data.weight * 100).toFixed(1)}%)`);
        console.log('   Subcategory weights:');
        for (const [sub, subWeight] of Object.entries(data.subweights)) {
          console.log(`   - ${sub}: ${(subWeight * 100).toFixed(1)}%`);
        }
      });

    } else {
      console.log('\n❌ Adaptive weighting failed:', result.error);
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('\n⚠️  Make sure the dev server is running: npm run dev');
  }
}

// Run the test
testAdaptiveWeighting();
