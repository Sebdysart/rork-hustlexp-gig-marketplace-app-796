import { useCallback } from 'react';
import { aiFeedbackService, MatchFeedback, CompletionFeedback, TradeFeedback } from './aiFeedbackService';
import { abTestingService } from './abTestingService';

export function useAILearning() {
  const submitMatchAcceptance = useCallback(async (
    userId: string,
    taskId: string,
    matchScore: number,
    aiConfidence: number
  ) => {
    console.log('[AILearning] Submitting match acceptance feedback');
    
    const feedback: MatchFeedback = {
      userId,
      taskId,
      action: 'match_accept',
      taskDetails: {
        matchAccepted: true,
        matchScore,
        aiConfidence,
      },
    };

    const result = await aiFeedbackService.submitMatchFeedback(feedback);
    
    await abTestingService.trackExperimentOutcome(
      userId,
      'match_score_threshold_v1',
      'acceptance_rate',
      1,
      { taskId, matchScore }
    );

    return result;
  }, []);

  const submitMatchRejection = useCallback(async (
    userId: string,
    taskId: string,
    matchScore: number,
    aiConfidence: number,
    rejectionReason?: string
  ) => {
    console.log('[AILearning] Submitting match rejection feedback');
    
    const feedback: MatchFeedback = {
      userId,
      taskId,
      action: 'match_reject',
      taskDetails: {
        matchAccepted: false,
        matchScore,
        aiConfidence,
        rejectionReason,
      },
    };

    const result = await aiFeedbackService.submitMatchFeedback(feedback);
    
    await abTestingService.trackExperimentOutcome(
      userId,
      'match_score_threshold_v1',
      'acceptance_rate',
      0,
      { taskId, matchScore, rejectionReason }
    );

    return result;
  }, []);

  const submitTaskCompletion = useCallback(async (
    userId: string,
    taskId: string,
    rating: number,
    matchScore: number,
    completionTimeHours: number,
    pricingFair: boolean,
    predictedDurationHours?: number,
    predictedPrice?: number,
    actualPrice?: number
  ) => {
    console.log('[AILearning] Submitting task completion feedback');
    
    const actualScore = (rating / 5) * 100;
    
    const feedback: CompletionFeedback = {
      userId,
      taskId,
      action: 'task_complete',
      taskDetails: {
        rating,
        matchScore,
        actualScore,
        completionTime: completionTimeHours,
        pricingFair,
        predictedDuration: predictedDurationHours,
        predictedPrice,
        actualPrice,
      },
    };

    const result = await aiFeedbackService.submitCompletionFeedback(feedback);
    
    await abTestingService.trackExperimentOutcome(
      userId,
      'pricing_suggestion_v1',
      'completion_rate',
      rating >= 4 ? 1 : 0,
      { taskId, rating, completionTimeHours, pricingFair }
    );

    return result;
  }, []);

  const submitTradeCompletion = useCallback(async (
    userId: string,
    taskId: string,
    completionTimeHours: number,
    pricingFair: boolean,
    certificationUsed?: string,
    squadSize?: number,
    aiEstimatedDurationHours?: number,
    actualPrice?: number,
    aiEstimatedPrice?: number
  ) => {
    console.log('[AILearning] Submitting trade completion feedback');
    
    const feedback: TradeFeedback = {
      userId,
      taskId,
      action: 'trade_complete',
      taskDetails: {
        completionTime: completionTimeHours,
        pricingFair,
        certificationUsed,
        squadSize,
        metadata: {
          aiEstimatedDuration: aiEstimatedDurationHours,
          actualDuration: completionTimeHours,
          aiEstimatedPrice,
          actualPrice: actualPrice || 0,
        },
      },
    };

    return await aiFeedbackService.submitTradeFeedback(feedback);
  }, []);

  return {
    submitMatchAcceptance,
    submitMatchRejection,
    submitTaskCompletion,
    submitTradeCompletion,
  };
}
