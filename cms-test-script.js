// CMS Test Script
// Run this in your browser console after deploying the fix to verify everything works

console.log('🧪 Starting CMS Test Suite...');

// Import services (adjust path if needed)
import { 
  educationResourceService, 
  reflectionQuestionsService,
  productRecommendationService,
  blogPostService,
  pageContentService 
} from './src/api/services/cms.js';

const runCMSTests = async () => {
  const results = {
    educationResources: { passed: 0, failed: 0, errors: [] },
    reflectionQuestions: { passed: 0, failed: 0, errors: [] },
    productRecommendations: { passed: 0, failed: 0, errors: [] },
    blogPosts: { passed: 0, failed: 0, errors: [] },
    pageContent: { passed: 0, failed: 0, errors: [] }
  };

  // Helper function to test a service operation
  const testOperation = async (serviceName, operationName, operation) => {
    try {
      console.log(`Testing ${serviceName}.${operationName}...`);
      const result = await operation();
      results[serviceName].passed++;
      console.log(`✅ ${serviceName}.${operationName} passed`);
      return result;
    } catch (error) {
      results[serviceName].failed++;
      results[serviceName].errors.push(`${operationName}: ${error.message}`);
      console.error(`❌ ${serviceName}.${operationName} failed:`, error.message);
      return null;
    }
  };

  // Test Education Resources
  console.log('\n📚 Testing Education Resources Service...');
  
  const educationResource = await testOperation('educationResources', 'create', () =>
    educationResourceService.create({
      title: 'Test Education Resource',
      description: 'Test description for education resource',
      resource_type: 'article',
      author: 'Test Author',
      external_url: 'https://example.com/test',
      featured_image: 'https://example.com/image.jpg',
      status: 'draft',
      order_index: 1
    })
  );

  if (educationResource) {
    await testOperation('educationResources', 'get', () =>
      educationResourceService.get(educationResource.id)
    );

    await testOperation('educationResources', 'update', () =>
      educationResourceService.update(educationResource.id, {
        title: 'Updated Education Resource',
        status: 'published'
      })
    );

    await testOperation('educationResources', 'list', () =>
      educationResourceService.list()
    );

    await testOperation('educationResources', 'listPublished', () =>
      educationResourceService.listPublished()
    );

    // Clean up
    await testOperation('educationResources', 'delete', () =>
      educationResourceService.delete(educationResource.id)
    );
  }

  // Test Reflection Questions
  console.log('\n💭 Testing Reflection Questions Service...');
  
  const reflectionQuestion = await testOperation('reflectionQuestions', 'create', () =>
    reflectionQuestionsService.create({
      title: 'Test Reflection Question?',
      content: 'This is a test reflection question content.',
      status: 'draft',
      order_index: 1
    })
  );

  if (reflectionQuestion) {
    await testOperation('reflectionQuestions', 'get', () =>
      reflectionQuestionsService.get(reflectionQuestion.id)
    );

    await testOperation('reflectionQuestions', 'update', () =>
      reflectionQuestionsService.update(reflectionQuestion.id, {
        title: 'Updated Reflection Question?',
        status: 'published'
      })
    );

    await testOperation('reflectionQuestions', 'list', () =>
      reflectionQuestionsService.list()
    );

    await testOperation('reflectionQuestions', 'listPublished', () =>
      reflectionQuestionsService.listPublished()
    );

    await testOperation('reflectionQuestions', 'publish', () =>
      reflectionQuestionsService.publish(reflectionQuestion.id)
    );

    await testOperation('reflectionQuestions', 'unpublish', () =>
      reflectionQuestionsService.unpublish(reflectionQuestion.id)
    );

    // Clean up
    await testOperation('reflectionQuestions', 'delete', () =>
      reflectionQuestionsService.delete(reflectionQuestion.id)
    );
  }

  // Test Product Recommendations
  console.log('\n🛍️ Testing Product Recommendations Service...');
  
  const productRecommendation = await testOperation('productRecommendations', 'create', () =>
    productRecommendationService.create({
      title: 'Test Product Recommendation',
      description: 'Test product description',
      product_type: 'book',
      author: 'Test Author',
      external_url: 'https://example.com/product',
      featured_image: 'https://example.com/product.jpg',
      status: 'active',
      featured: true,
      order_index: 1
    })
  );

  if (productRecommendation) {
    await testOperation('productRecommendations', 'get', () =>
      productRecommendationService.get(productRecommendation.id)
    );

    await testOperation('productRecommendations', 'update', () =>
      productRecommendationService.update(productRecommendation.id, {
        title: 'Updated Product Recommendation'
      })
    );

    await testOperation('productRecommendations', 'list', () =>
      productRecommendationService.list()
    );

    await testOperation('productRecommendations', 'listActive', () =>
      productRecommendationService.listActive()
    );

    await testOperation('productRecommendations', 'listFeatured', () =>
      productRecommendationService.listFeatured()
    );

    // Clean up
    await testOperation('productRecommendations', 'delete', () =>
      productRecommendationService.delete(productRecommendation.id)
    );
  }

  // Test Blog Posts
  console.log('\n📝 Testing Blog Posts Service...');
  
  const blogPost = await testOperation('blogPosts', 'create', () =>
    blogPostService.create({
      title: 'Test Blog Post',
      slug: 'test-blog-post-' + Date.now(),
      content: '<p>This is test blog content.</p>',
      excerpt: 'Test excerpt',
      status: 'draft'
    })
  );

  if (blogPost) {
    await testOperation('blogPosts', 'get', () =>
      blogPostService.get(blogPost.id)
    );

    await testOperation('blogPosts', 'getBySlug', () =>
      blogPostService.getBySlug(blogPost.slug)
    );

    await testOperation('blogPosts', 'update', () =>
      blogPostService.update(blogPost.id, {
        title: 'Updated Blog Post'
      })
    );

    await testOperation('blogPosts', 'list', () =>
      blogPostService.list()
    );

    await testOperation('blogPosts', 'listPublished', () =>
      blogPostService.listPublished()
    );

    await testOperation('blogPosts', 'publish', () =>
      blogPostService.publish(blogPost.id)
    );

    await testOperation('blogPosts', 'unpublish', () =>
      blogPostService.unpublish(blogPost.id)
    );

    // Clean up
    await testOperation('blogPosts', 'delete', () =>
      blogPostService.delete(blogPost.id)
    );
  }

  // Test Page Content
  console.log('\n📄 Testing Page Content Service...');
  
  const pageContent = await testOperation('pageContent', 'create', () =>
    pageContentService.create({
      page_slug: 'test-page-' + Date.now(),
      title: 'Test Page',
      content: { sections: [{ type: 'text', content: 'Test page content' }] },
      status: 'draft'
    })
  );

  if (pageContent) {
    await testOperation('pageContent', 'get', () =>
      pageContentService.get(pageContent.id)
    );

    await testOperation('pageContent', 'getPageContent', () =>
      pageContentService.getPageContent(pageContent.page_slug)
    );

    await testOperation('pageContent', 'updatePageContent', () =>
      pageContentService.updatePageContent(pageContent.page_slug, {
        title: 'Updated Page Title'
      })
    );

    await testOperation('pageContent', 'list', () =>
      pageContentService.list()
    );

    // Clean up
    await testOperation('pageContent', 'delete', () =>
      pageContentService.delete(pageContent.id)
    );
  }

  // Print Results
  console.log('\n📊 CMS Test Results:');
  console.log('='.repeat(50));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  Object.entries(results).forEach(([serviceName, result]) => {
    totalPassed += result.passed;
    totalFailed += result.failed;
    
    console.log(`\n${serviceName}:`);
    console.log(`  ✅ Passed: ${result.passed}`);
    console.log(`  ❌ Failed: ${result.failed}`);
    
    if (result.errors.length > 0) {
      console.log(`  Errors:`);
      result.errors.forEach(error => console.log(`    - ${error}`));
    }
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`Total Tests: ${totalPassed + totalFailed}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
  
  if (totalFailed === 0) {
    console.log('\n🎉 All CMS tests passed! Your schema fix is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above and verify your database migration.');
  }
  
  return results;
};

// Export for manual testing
window.runCMSTests = runCMSTests;

console.log('🔍 CMS Test Suite loaded. Run window.runCMSTests() to execute all tests.');

// Auto-run if this script is executed directly
if (typeof window !== 'undefined' && window.location) {
  console.log('🚀 Auto-running CMS tests...');
  runCMSTests();
}