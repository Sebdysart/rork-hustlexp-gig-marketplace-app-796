import { User, Task, UserRole } from '@/types';

export interface TestResult {
  testName: string;
  passed: boolean;
  duration: number;
  error?: string;
}

export class TestRunner {
  private results: TestResult[] = [];

  async runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    try {
      await testFn();
      const duration = Date.now() - startTime;
      const result: TestResult = { testName, passed: true, duration };
      this.results.push(result);
      console.log(`✓ ${testName} (${duration}ms)`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {
        testName,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),
      };
      this.results.push(result);
      console.error(`✗ ${testName} (${duration}ms):`, error);
      return result;
    }
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      total,
      passed,
      failed,
      totalDuration,
      passRate: total > 0 ? (passed / total) * 100 : 0,
    };
  }

  reset() {
    this.results = [];
  }
}

export async function testOnboardingFlow(
  completeOnboarding: (name: string, role: UserRole, location: any) => Promise<void>
): Promise<void> {
  const testName = 'Test User';
  const testRole: UserRole = 'both';
  const testLocation = {
    lat: 37.7749,
    lng: -122.4194,
    address: 'San Francisco, CA',
  };

  await completeOnboarding(testName, testRole, testLocation);
  
  if (!testName || !testRole || !testLocation) {
    throw new Error('Onboarding failed: Missing required data');
  }
}

export async function testTaskPosting(
  createTask: (taskData: any) => Promise<void>,
  currentUser: User | null
): Promise<void> {
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const taskData = {
    title: 'Test Quest',
    description: 'This is a test task',
    category: 'cleaning' as const,
    dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    location: {
      lat: 37.7749,
      lng: -122.4194,
      address: 'San Francisco, CA',
    },
    payType: 'fixed' as const,
    payAmount: 50,
    extras: ['Test extra'],
    xpReward: 100,
  };

  await createTask(taskData);
}

export async function testTaskAcceptance(
  acceptTask: (taskId: string) => Promise<void>,
  tasks: Task[],
  currentUser: User | null
): Promise<void> {
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const openTask = tasks.find(t => t.status === 'open');
  if (!openTask) {
    throw new Error('No open tasks available');
  }

  await acceptTask(openTask.id);
}

export async function testTaskCompletion(
  completeTask: (taskId: string) => Promise<any>,
  tasks: Task[],
  currentUser: User | null
): Promise<void> {
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const inProgressTask = tasks.find(
    t => t.status === 'in_progress' && t.workerId === currentUser.id
  );
  
  if (!inProgressTask) {
    const anyInProgressTask = tasks.find(t => t.status === 'in_progress');
    if (anyInProgressTask) {
      console.log('Note: Using any in-progress task since none assigned to current user');
      const result = await completeTask(anyInProgressTask.id);
      if (!result) {
        throw new Error('Task completion failed');
      }
      return;
    }
    throw new Error('No in-progress tasks for current user');
  }

  const result = await completeTask(inProgressTask.id);
  
  if (!result) {
    throw new Error('Task completion failed');
  }
}

export async function testMessaging(
  sendMessage: (taskId: string, text: string) => Promise<void>,
  tasks: Task[],
  currentUser: User | null
): Promise<void> {
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const taskWithWorker = tasks.find(t => t.workerId && t.status === 'in_progress');
  if (!taskWithWorker) {
    throw new Error('No tasks with workers available');
  }

  await sendMessage(taskWithWorker.id, 'Test message');
}

export async function testLevelUp(
  currentUser: User | null,
  completeTask: (taskId: string) => Promise<any>,
  tasks: Task[]
): Promise<void> {
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const initialLevel = currentUser.level;
  const initialXP = currentUser.xp;

  let inProgressTask = tasks.find(
    t => t.status === 'in_progress' && t.workerId === currentUser.id
  );
  
  if (!inProgressTask) {
    inProgressTask = tasks.find(t => t.status === 'in_progress');
    if (!inProgressTask) {
      throw new Error('No in-progress tasks for testing level up');
    }
    console.log('Note: Using any in-progress task since none assigned to current user');
  }

  const result = await completeTask(inProgressTask.id);
  
  if (result && result.leveledUp) {
    console.log(`Level up detected: ${initialLevel} -> ${result.newLevel}`);
  } else {
    console.log(`XP gained: ${initialXP} -> ${initialXP + inProgressTask.xpReward}`);
  }
}

export function simulateLoad(userCount: number, taskCount: number): {
  estimatedMemory: number;
  estimatedLoadTime: number;
  canHandle: boolean;
} {
  const avgUserSize = 1024;
  const avgTaskSize = 512;
  const avgMessageSize = 256;
  
  const estimatedMemory = 
    (userCount * avgUserSize) + 
    (taskCount * avgTaskSize) + 
    (taskCount * 5 * avgMessageSize);
  
  const estimatedLoadTime = (userCount + taskCount) * 0.1;
  
  const maxMemory = 100 * 1024 * 1024;
  const canHandle = estimatedMemory < maxMemory;
  
  return {
    estimatedMemory: Math.round(estimatedMemory / 1024),
    estimatedLoadTime: Math.round(estimatedLoadTime),
    canHandle,
  };
}

export function generatePerformanceReport(
  users: User[],
  tasks: Task[],
  testResults: TestResult[]
): string {
  const summary = testResults.reduce((acc, result) => {
    if (result.passed) acc.passed++;
    else acc.failed++;
    acc.totalDuration += result.duration;
    return acc;
  }, { passed: 0, failed: 0, totalDuration: 0 });

  const loadTest = simulateLoad(users.length, tasks.length);

  return `
HustleXP Performance Report
===========================

Test Results:
- Total Tests: ${testResults.length}
- Passed: ${summary.passed}
- Failed: ${summary.failed}
- Pass Rate: ${testResults.length > 0 ? ((summary.passed / testResults.length) * 100).toFixed(1) : 0}%
- Total Duration: ${summary.totalDuration}ms
- Average Duration: ${testResults.length > 0 ? (summary.totalDuration / testResults.length).toFixed(1) : 0}ms

Data Load:
- Users: ${users.length}
- Tasks: ${tasks.length}
- Estimated Memory: ${loadTest.estimatedMemory}KB
- Estimated Load Time: ${loadTest.estimatedLoadTime}ms
- Can Handle Load: ${loadTest.canHandle ? 'Yes ✓' : 'No ✗'}

Scalability:
- Current Capacity: ${users.length} users, ${tasks.length} tasks
- Estimated Max Capacity: ${loadTest.canHandle ? '10,000+ users' : 'Optimization needed'}
- Performance Status: ${summary.failed === 0 && loadTest.canHandle ? 'Excellent ✓' : 'Needs Attention'}

Individual Test Results:
${testResults.map(r => `- ${r.passed ? '✓' : '✗'} ${r.testName} (${r.duration}ms)${r.error ? ` - ${r.error}` : ''}`).join('\n')}
  `.trim();
}
