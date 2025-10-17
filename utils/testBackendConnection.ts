import { hustleAI } from './hustleAI';

export async function testBackendConnection() {
  console.log('🧪 Testing HustleAI Backend Connection...');
  console.log('📍 Target URL: https://lunch-garden-dycejr.replit.app/api');
  
  const results = {
    health: false,
    chat: false,
    feedback: false,
    aiProfile: false,
    experiments: false,
  };

  try {
    console.log('\n1️⃣ Testing Health Check...');
    const health = await hustleAI.checkHealth();
    console.log('✅ Health:', health);
    results.health = true;
  } catch (error) {
    console.error('❌ Health check failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n2️⃣ Testing AI Chat...');
    const chat = await hustleAI.chat('test-user', 'Hello, can you help me find tasks?');
    console.log('✅ Chat response:', chat.response.substring(0, 100) + '...');
    results.chat = true;
  } catch (error) {
    console.error('❌ Chat failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n3️⃣ Testing Feedback Submission...');
    const feedback = await hustleAI.submitFeedback({
      userId: 'test-user-123',
      taskId: 'test-task-123',
      predictionType: 'completion',
      predictedValue: 85,
      actualValue: 92,
      context: {
        category: 'delivery',
        payAmount: 50,
      },
    });
    console.log('✅ Feedback recorded:', feedback.recorded);
    results.feedback = feedback.recorded;
  } catch (error) {
    console.error('❌ Feedback failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n4️⃣ Testing AI User Profile...');
    const profile = await hustleAI.getUserProfileAI('test-user-123');
    console.log('✅ AI Profile fetched. Categories:', profile.preferredCategories.length);
    results.aiProfile = true;
  } catch (error) {
    console.error('❌ AI Profile failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n5️⃣ Testing Experiment Tracking...');
    const experiment = await hustleAI.trackExperiment({
      experimentId: 'task_acceptance_test',
      userId: 'test-user-123',
      variant: 'control',
      outcome: 'success',
      metrics: {
        taskPrice: 50,
        userLevel: 10,
      },
    });
    console.log('✅ Experiment tracked:', experiment.success);
    results.experiments = experiment.success;
  } catch (error) {
    console.error('❌ Experiment tracking failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n📊 Test Results Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Health Check:        ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`AI Chat:             ${results.chat ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Feedback Loop:       ${results.feedback ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`AI User Profile:     ${results.aiProfile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Experiment Tracking: ${results.experiments ? '✅ PASS' : '❌ FAIL'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const passCount = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passCount}/${totalTests} tests passed`);

  if (passCount === totalTests) {
    console.log('✅ All systems operational! Backend is ready.');
  } else if (passCount > 0) {
    console.log('⚠️ Partial functionality - some endpoints working');
  } else {
    console.log('❌ Backend not responding - check if Replit deployment is active');
  }

  return results;
}
