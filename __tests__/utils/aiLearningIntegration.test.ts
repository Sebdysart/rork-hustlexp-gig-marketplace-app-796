import { useAILearning } from '@/utils/aiLearningIntegration';
import { renderHook } from '@testing-library/react-native';

jest.mock('@/utils/aiFeedbackService', () => ({
  aiFeedbackService: {
    submitMatchFeedback: jest.fn(() => Promise.resolve({ success: true })),
    submitCompletionFeedback: jest.fn(() => Promise.resolve({ success: true })),
    submitTradeFeedback: jest.fn(() => Promise.resolve({ success: true })),
  },
}));

jest.mock('@/utils/abTestingService', () => ({
  abTestingService: {
    trackExperimentOutcome: jest.fn(() => Promise.resolve()),
  },
}));

import { aiFeedbackService } from '@/utils/aiFeedbackService';
import { abTestingService } from '@/utils/abTestingService';

describe('AI Learning Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitMatchAcceptance', () => {
    it('should submit match acceptance feedback', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitMatchAcceptance(
        'user-1',
        'task-1',
        85,
        90
      );

      expect(aiFeedbackService.submitMatchFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          taskId: 'task-1',
          action: 'match_accept',
          taskDetails: expect.objectContaining({
            matchAccepted: true,
            matchScore: 85,
            aiConfidence: 90,
          }),
        })
      );
    });

    it('should track A/B test outcome', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitMatchAcceptance(
        'user-1',
        'task-1',
        85,
        90
      );

      expect(abTestingService.trackExperimentOutcome).toHaveBeenCalledWith(
        'user-1',
        'match_score_threshold_v1',
        'acceptance_rate',
        1,
        expect.objectContaining({
          taskId: 'task-1',
          matchScore: 85,
        })
      );
    });
  });

  describe('submitMatchRejection', () => {
    it('should submit match rejection feedback', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitMatchRejection(
        'user-1',
        'task-1',
        75,
        80,
        'Distance too far'
      );

      expect(aiFeedbackService.submitMatchFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          taskId: 'task-1',
          action: 'match_reject',
          taskDetails: expect.objectContaining({
            matchAccepted: false,
            matchScore: 75,
            aiConfidence: 80,
            rejectionReason: 'Distance too far',
          }),
        })
      );
    });

    it('should track rejection in A/B test', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitMatchRejection(
        'user-1',
        'task-1',
        75,
        80
      );

      expect(abTestingService.trackExperimentOutcome).toHaveBeenCalledWith(
        'user-1',
        'match_score_threshold_v1',
        'acceptance_rate',
        0,
        expect.any(Object)
      );
    });
  });

  describe('submitTaskCompletion', () => {
    it('should submit task completion feedback', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitTaskCompletion(
        'user-1',
        'task-1',
        5,
        90,
        2.5,
        true,
        2,
        50,
        55
      );

      expect(aiFeedbackService.submitCompletionFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          taskId: 'task-1',
          action: 'task_complete',
          taskDetails: expect.objectContaining({
            rating: 5,
            matchScore: 90,
            actualScore: 100,
            completionTime: 2.5,
            pricingFair: true,
            predictedDuration: 2,
            predictedPrice: 50,
            actualPrice: 55,
          }),
        })
      );
    });

    it('should calculate actual score correctly from rating', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitTaskCompletion(
        'user-1',
        'task-1',
        3,
        90,
        2.5,
        true
      );

      const call = (aiFeedbackService.submitCompletionFeedback as jest.Mock).mock.calls[0][0];
      expect(call.taskDetails.actualScore).toBe(60);
    });

    it('should track completion in A/B test', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitTaskCompletion(
        'user-1',
        'task-1',
        4,
        90,
        2.5,
        true
      );

      expect(abTestingService.trackExperimentOutcome).toHaveBeenCalledWith(
        'user-1',
        'pricing_suggestion_v1',
        'completion_rate',
        1,
        expect.any(Object)
      );
    });

    it('should track poor rating in A/B test', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitTaskCompletion(
        'user-1',
        'task-1',
        2,
        90,
        2.5,
        false
      );

      expect(abTestingService.trackExperimentOutcome).toHaveBeenCalledWith(
        'user-1',
        'pricing_suggestion_v1',
        'completion_rate',
        0,
        expect.any(Object)
      );
    });
  });

  describe('submitTradeCompletion', () => {
    it('should submit trade completion feedback', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitTradeCompletion(
        'user-1',
        'task-1',
        8,
        true,
        'plumbing-license',
        3,
        7,
        500,
        450
      );

      expect(aiFeedbackService.submitTradeFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          taskId: 'task-1',
          action: 'trade_complete',
          taskDetails: expect.objectContaining({
            completionTime: 8,
            pricingFair: true,
            certificationUsed: 'plumbing-license',
            squadSize: 3,
            metadata: expect.objectContaining({
              aiEstimatedDuration: 7,
              actualDuration: 8,
              aiEstimatedPrice: 450,
              actualPrice: 500,
            }),
          }),
        })
      );
    });

    it('should handle optional parameters', async () => {
      const { result } = renderHook(() => useAILearning());

      await result.current.submitTradeCompletion(
        'user-1',
        'task-1',
        8,
        true
      );

      expect(aiFeedbackService.submitTradeFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          taskDetails: expect.objectContaining({
            completionTime: 8,
            pricingFair: true,
            metadata: expect.objectContaining({
              actualPrice: 0,
            }),
          }),
        })
      );
    });
  });
});
