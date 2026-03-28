import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Analytics } from './analytics';

const AB_TEST_KEY = 'hustlexp_ab_tests';

export type ABTestVariant = 'A' | 'B';

export type ABTest = {
  id: string;
  name: string;
  variant: ABTestVariant;
  startDate: number;
  endDate?: number;
};

export class ABTesting {
  static async getVariant(testId: string): Promise<ABTestVariant> {
    try {
      const stored = await AsyncStorage.getItem(AB_TEST_KEY);
      const tests: ABTest[] = stored ? JSON.parse(stored) : [];
      
      const existingTest = tests.find(t => t.id === testId);
      if (existingTest) {
        return existingTest.variant;
      }

      const variant: ABTestVariant = Math.random() < 0.5 ? 'A' : 'B';
      
      const newTest: ABTest = {
        id: testId,
        name: testId,
        variant,
        startDate: Date.now(),
      };
      
      tests.push(newTest);
      await AsyncStorage.setItem(AB_TEST_KEY, JSON.stringify(tests));
      
      console.log(`[A/B Test] User assigned to variant ${variant} for test: ${testId}`);
      
      await Analytics.trackEvent({
        type: 'page_view',
        data: { abTest: testId, variant },
      });
      
      return variant;
    } catch (error) {
      console.error('[A/B Test] Error getting variant:', error);
      return 'A';
    }
  }

  static async trackConversion(testId: string, conversionType: string, value?: number): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(AB_TEST_KEY);
      const tests: ABTest[] = stored ? JSON.parse(stored) : [];
      
      const test = tests.find(t => t.id === testId);
      if (!test) {
        console.warn(`[A/B Test] No test found for ID: ${testId}`);
        return;
      }

      await Analytics.trackEvent({
        type: 'quest_complete',
        data: {
          abTest: testId,
          variant: test.variant,
          conversionType,
          value,
        },
      });

      console.log(`[A/B Test] Conversion tracked for ${testId} (${test.variant}): ${conversionType}`);
    } catch (error) {
      console.error('[A/B Test] Error tracking conversion:', error);
    }
  }

  static async getActiveTests(): Promise<ABTest[]> {
    try {
      const stored = await AsyncStorage.getItem(AB_TEST_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[A/B Test] Error getting active tests:', error);
      return [];
    }
  }

  static async endTest(testId: string): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(AB_TEST_KEY);
      const tests: ABTest[] = stored ? JSON.parse(stored) : [];
      
      const test = tests.find(t => t.id === testId);
      if (test) {
        test.endDate = Date.now();
        await AsyncStorage.setItem(AB_TEST_KEY, JSON.stringify(tests));
        console.log(`[A/B Test] Test ended: ${testId}`);
      }
    } catch (error) {
      console.error('[A/B Test] Error ending test:', error);
    }
  }

  static async clearTests(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AB_TEST_KEY);
      console.log('[A/B Test] All tests cleared');
    } catch (error) {
      console.error('[A/B Test] Error clearing tests:', error);
    }
  }
}

export const useABTest = (testId: string): ABTestVariant => {
  const [variant, setVariant] = React.useState<ABTestVariant>('A');

  React.useEffect(() => {
    ABTesting.getVariant(testId).then(setVariant);
  }, [testId]);

  return variant;
};
