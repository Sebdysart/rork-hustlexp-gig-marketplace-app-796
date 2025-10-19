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
    taskHistory: false,
    nearbyTasks: false,
    earningsHistory: false,
    disputeAI: false,
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
    const response = await fetch('https://lunch-garden-dycejr.replit.app/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user-123',
        taskId: 'test-task-123',
        action: 'task_view',
        taskDetails: {
          category: 'delivery',
          payAmount: 50,
        },
      }),
    });
    const feedback = await response.json();
    console.log('✅ Feedback recorded:', feedback.success);
    results.feedback = feedback.success || false;
  } catch (error) {
    console.error('❌ Feedback failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n4️⃣ Testing AI User Profile...');
    const response = await fetch('https://lunch-garden-dycejr.replit.app/api/users/test-user-123/profile/ai', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) {
      console.error('❌ AI Profile HTTP error:', response.status, response.statusText);
      results.aiProfile = false;
    } else {
      const data = await response.json();
      console.log('✅ AI Profile response:', JSON.stringify(data).substring(0, 200));
      
      if (data && data.success && data.aiProfile) {
        const categories = data.aiProfile.preferredCategories;
        const categoriesCount = Array.isArray(categories) ? categories.length : 0;
        console.log('   Categories count:', categoriesCount);
        results.aiProfile = true;
      } else {
        console.warn('⚠️ AI Profile: Unexpected response structure');
        results.aiProfile = false;
      }
    }
  } catch (error) {
    console.error('❌ AI Profile failed:', error instanceof Error ? error.message : String(error));
    results.aiProfile = false;
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

  try {
    console.log('\n6️⃣ Testing Task History (Safety Scanner)...');
    const response = await fetch('https://lunch-garden-dycejr.replit.app/api/users/test-user-123/task-history');
    const taskHistory = await response.json();
    console.log('✅ Task History:', JSON.stringify(taskHistory).substring(0, 150));
    results.taskHistory = taskHistory.tasksPosted !== undefined;
  } catch (error) {
    console.error('❌ Task History failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n7️⃣ Testing Nearby Tasks (Smart Bundling)...');
    const response = await fetch('https://lunch-garden-dycejr.replit.app/api/tasks/nearby?lat=40.7128&lng=-74.0060&radius=5&status=open');
    const nearbyTasks = await response.json();
    console.log('✅ Nearby Tasks:', nearbyTasks.tasks?.length || 0, 'tasks found');
    results.nearbyTasks = Array.isArray(nearbyTasks.tasks);
  } catch (error) {
    console.error('❌ Nearby Tasks failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n8️⃣ Testing Earnings History (Predictive Earnings)...');
    const response = await fetch('https://lunch-garden-dycejr.replit.app/api/users/test-user-123/earnings-history?days=30');
    const earningsHistory = await response.json();
    console.log('✅ Earnings History:', Array.isArray(earningsHistory.earnings) ? earningsHistory.earnings.length : 0, 'days of data');
    results.earningsHistory = Array.isArray(earningsHistory.earnings);
  } catch (error) {
    console.error('❌ Earnings History failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    console.log('\n9️⃣ Testing Dispute AI Analysis...');
    const createDisputeResponse = await fetch('https://lunch-garden-dycejr.replit.app/api/disputes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskId: 'test-task-123',
        reporterId: 'test-user-123',
        reportedUserId: 'test-user-456',
        category: 'payment_dispute',
        title: 'Payment not received',
        description: 'Task was completed but payment is pending',
      }),
    });
    const dispute = await createDisputeResponse.json();
    
    if (dispute.id) {
      const aiAnalysisResponse = await fetch(`https://lunch-garden-dycejr.replit.app/api/disputes/${dispute.id}/ai-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: 'AI suggests investigating payment processing logs',
          suggestedResolution: 'manual_review',
          confidence: 0.85,
        }),
      });
      const aiResult = await aiAnalysisResponse.json();
      console.log('✅ Dispute AI Analysis:', aiResult.success ? 'stored successfully' : 'failed');
      results.disputeAI = aiResult.success || false;
    } else {
      console.log('⚠️ Dispute creation failed, skipping AI analysis test');
      results.disputeAI = false;
    }
  } catch (error) {
    console.error('❌ Dispute AI failed:', error instanceof Error ? error.message : 'Unknown error');
  }

  console.log('\n📊 Test Results Summary:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 Core AI Features:');
  console.log(`  Health Check:        ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  AI Chat:             ${results.chat ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Feedback Loop:       ${results.feedback ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  AI User Profile:     ${results.aiProfile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Experiment Tracking: ${results.experiments ? '✅ PASS' : '❌ FAIL'}`);
  console.log('\n🚀 Phase 3 Mobile Features:');
  console.log(`  Task History:        ${results.taskHistory ? '✅ PASS' : '❌ FAIL'} (Safety Scanner)`);
  console.log(`  Nearby Tasks:        ${results.nearbyTasks ? '✅ PASS' : '❌ FAIL'} (Smart Bundling)`);
  console.log(`  Earnings History:    ${results.earningsHistory ? '✅ PASS' : '❌ FAIL'} (Predictive Earnings)`);
  console.log(`  Dispute AI:          ${results.disputeAI ? '✅ PASS' : '❌ FAIL'} (AI Dispute Assistant)`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
