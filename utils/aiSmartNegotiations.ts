import { Task, User } from '@/types';
import { hustleAI } from './hustleAI';

export interface NegotiationSuggestion {
  suggestedAmount: number;
  confidence: number;
  reasoning: string;
  counterOfferScript: string;
  marketInsights: string[];
  alternatives: {
    option: string;
    amount: number;
    pros: string[];
    cons: string[];
  }[];
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    chanceOfAcceptance: number;
    potentialDownsides: string[];
  };
}

export interface TaskValueAnalysis {
  fairMarketValue: number;
  posterBudgetEstimate: { min: number; max: number };
  yourLeveragePoints: string[];
  posterMotivations: string[];
  urgencyFactor: number;
  competitionLevel: 'low' | 'medium' | 'high';
}

function analyzeTaskValue(task: Task, user: User, similarTasks: Task[]): TaskValueAnalysis {
  console.log('[Smart Negotiations] Analyzing task value for:', task.title);

  const similarPays = similarTasks
    .filter((t) => t.category === task.category)
    .map((t) => t.payAmount);

  const avgPay =
    similarPays.length > 0
      ? similarPays.reduce((a, b) => a + b, 0) / similarPays.length
      : task.payAmount;

  const fairMarketValue = Math.round(avgPay);

  let urgencyMultiplier = 1.0;
  if (task.urgency === 'today') urgencyMultiplier = 1.3;
  else if (task.urgency === '48h') urgencyMultiplier = 1.15;

  const leveragePoints: string[] = [];
  
  if (user.level > 20) {
    leveragePoints.push(`You're Level ${user.level} - experienced hustler`);
  }
  
  if (user.reputationScore >= 4.5) {
    leveragePoints.push(`${user.reputationScore.toFixed(1)}⭐ rating - top performer`);
  }
  
  if (user.tasksCompleted > 50) {
    leveragePoints.push(`${user.tasksCompleted} tasks completed - proven track record`);
  }

  if (user.badges && user.badges.length > 5) {
    leveragePoints.push(`${user.badges.length} badges earned - specialized skills`);
  }

  const posterMotivations: string[] = [];
  
  if (task.urgency === 'today') {
    posterMotivations.push('Needs this done urgently - willing to pay premium');
  }
  
  if (task.proofRequired) {
    posterMotivations.push('Wants documented proof - values quality');
  }

  if (task.payAmount > avgPay * 1.2) {
    posterMotivations.push('Offering above-market rate - serious about getting this done');
  }

  const competitionLevel: 'low' | 'medium' | 'high' =
    similarTasks.length < 3 ? 'low' : similarTasks.length < 10 ? 'medium' : 'high';

  return {
    fairMarketValue: Math.round(fairMarketValue * urgencyMultiplier),
    posterBudgetEstimate: {
      min: Math.round(task.payAmount * 0.9),
      max: Math.round(task.payAmount * 1.3),
    },
    yourLeveragePoints: leveragePoints,
    posterMotivations,
    urgencyFactor: urgencyMultiplier,
    competitionLevel,
  };
}

function calculateSmartCounteroffer(
  task: Task,
  valueAnalysis: TaskValueAnalysis,
  negotiationGoal: 'maximize' | 'balance' | 'quick_win'
): { amount: number; confidence: number } {
  const { fairMarketValue, posterBudgetEstimate, urgencyFactor, competitionLevel } = valueAnalysis;

  let targetAmount = task.payAmount;

  if (negotiationGoal === 'maximize') {
    targetAmount = Math.min(
      posterBudgetEstimate.max,
      task.payAmount * 1.25
    );
  } else if (negotiationGoal === 'balance') {
    targetAmount = Math.round((fairMarketValue + task.payAmount * 1.15) / 2);
  } else {
    targetAmount = Math.round(task.payAmount * 1.08);
  }

  targetAmount = Math.round(targetAmount * urgencyFactor);

  let confidence = 0.7;

  if (competitionLevel === 'low') confidence += 0.15;
  else if (competitionLevel === 'high') confidence -= 0.15;

  if (urgencyFactor > 1.2) confidence += 0.1;

  if (targetAmount <= posterBudgetEstimate.max) confidence += 0.05;

  confidence = Math.max(0.3, Math.min(0.95, confidence));

  return {
    amount: Math.round(targetAmount),
    confidence: Math.round(confidence * 100),
  };
}

export async function generateNegotiationStrategy(
  task: Task,
  user: User,
  similarTasks: Task[],
  negotiationGoal: 'maximize' | 'balance' | 'quick_win' = 'balance',
  useAI: boolean = true
): Promise<NegotiationSuggestion> {
  console.log('[Smart Negotiations] Generating strategy for task:', task.title);

  const valueAnalysis = analyzeTaskValue(task, user, similarTasks);
  const counterofferCalc = calculateSmartCounteroffer(task, valueAnalysis, negotiationGoal);

  const baseReasoning = `Based on market analysis, your ${user.tasksCompleted} completed tasks, and ${user.reputationScore.toFixed(1)}⭐ rating, you can ask for $${counterofferCalc.amount} (${((counterofferCalc.amount / task.payAmount - 1) * 100).toFixed(0)}% increase).`;

  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  if (counterofferCalc.confidence >= 75) riskLevel = 'low';
  else if (counterofferCalc.confidence < 50) riskLevel = 'high';

  const baseSuggestion: NegotiationSuggestion = {
    suggestedAmount: counterofferCalc.amount,
    confidence: counterofferCalc.confidence,
    reasoning: baseReasoning,
    counterOfferScript: `Hi! I'd love to help with "${task.title}". Given my ${user.reputationScore.toFixed(1)}⭐ rating and ${user.tasksCompleted} completed tasks, I can deliver excellent results. Would you consider $${counterofferCalc.amount} for this? Happy to discuss!`,
    marketInsights: [
      `Similar ${task.category} tasks pay $${valueAnalysis.fairMarketValue} on average`,
      `Your experience level justifies premium pricing`,
      valueAnalysis.competitionLevel === 'low'
        ? 'Low competition - you have negotiating power'
        : valueAnalysis.competitionLevel === 'high'
        ? 'High competition - be strategic with pricing'
        : 'Moderate competition - fair pricing recommended',
    ],
    alternatives: [
      {
        option: 'Quick Accept',
        amount: task.payAmount,
        pros: ['Guaranteed acceptance', 'Start immediately', 'Build momentum'],
        cons: ['Leave money on the table', 'Lower earnings per hour'],
      },
      {
        option: 'Balanced Counter',
        amount: Math.round(task.payAmount * 1.12),
        pros: ['Reasonable increase', 'High acceptance rate', 'Shows value'],
        cons: ['Modest gain', 'May still be negotiable'],
      },
      {
        option: 'Premium Counter',
        amount: counterofferCalc.amount,
        pros: ['Maximizes earnings', 'Reflects your experience', 'Tests budget'],
        cons: ['May be rejected', 'Requires negotiation', 'Takes more time'],
      },
    ],
    riskAssessment: {
      riskLevel,
      chanceOfAcceptance: counterofferCalc.confidence,
      potentialDownsides: [
        riskLevel === 'high' ? 'Poster may choose another worker' : 'Low risk of rejection',
        'May need to negotiate down slightly',
        'Could delay task start time',
      ],
    },
  };

  if (!useAI) {
    return baseSuggestion;
  }

  try {
    const prompt = `You are an expert negotiation coach for gig workers. Analyze this task and provide strategic negotiation advice.

TASK DETAILS:
- Title: ${task.title}
- Category: ${task.category}
- Original Pay: $${task.payAmount}
- Urgency: ${task.urgency || 'flexible'}
- ${task.distance ? `Distance: ${task.distance.toFixed(1)} km` : ''}

WORKER PROFILE:
- Level: ${user.level}
- Tasks Completed: ${user.tasksCompleted}
- Rating: ${user.reputationScore.toFixed(1)}⭐
- Badges: ${user.badges?.length || 0}

MARKET ANALYSIS:
- Fair Market Value: $${valueAnalysis.fairMarketValue}
- Competition Level: ${valueAnalysis.competitionLevel}
- Urgency Factor: ${valueAnalysis.urgencyFactor}x

LEVERAGE POINTS:
${valueAnalysis.yourLeveragePoints.map((p) => `- ${p}`).join('\n')}

POSTER MOTIVATIONS:
${valueAnalysis.posterMotivations.map((m) => `- ${m}`).join('\n')}

Based on this, provide:
1. Suggested counteroffer amount (be strategic but realistic)
2. Confidence level (0-100)
3. Detailed reasoning (2-3 sentences)
4. Professional counteroffer script (friendly, confident, value-focused)
5. 3 key market insights
6. Risk assessment (low/medium/high) and acceptance probability

Return JSON:
{
  "suggestedAmount": number,
  "confidence": number,
  "reasoning": string,
  "counterOfferScript": string,
  "marketInsights": string[],
  "riskLevel": "low" | "medium" | "high",
  "chanceOfAcceptance": number
}`;

    console.log('[Smart Negotiations] Requesting AI analysis...');

    const response = await hustleAI.chat('system', prompt);
    const aiResult = JSON.parse(response.response);

    console.log('[Smart Negotiations] AI analysis complete');

    return {
      ...baseSuggestion,
      suggestedAmount: aiResult.suggestedAmount || baseSuggestion.suggestedAmount,
      confidence: aiResult.confidence || baseSuggestion.confidence,
      reasoning: aiResult.reasoning || baseSuggestion.reasoning,
      counterOfferScript: aiResult.counterOfferScript || baseSuggestion.counterOfferScript,
      marketInsights: aiResult.marketInsights || baseSuggestion.marketInsights,
      riskAssessment: {
        riskLevel: aiResult.riskLevel || baseSuggestion.riskAssessment.riskLevel,
        chanceOfAcceptance: aiResult.chanceOfAcceptance || baseSuggestion.riskAssessment.chanceOfAcceptance,
        potentialDownsides: baseSuggestion.riskAssessment.potentialDownsides,
      },
    };
  } catch (error) {
    console.error('[Smart Negotiations] AI analysis failed, using base strategy:', error);
    return baseSuggestion;
  }
}

export async function analyzeCounterOfferResponse(
  originalOffer: number,
  counterOffer: number,
  posterResponse: string,
  useAI: boolean = true
): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  nextSteps: string[];
  recommendedReply: string;
}> {
  const increase = ((counterOffer / originalOffer - 1) * 100).toFixed(0);

  const baseResponse = {
    sentiment: 'neutral' as const,
    nextSteps: [
      'Wait for poster response',
      'Be open to meet in the middle',
      'Highlight your value if needed',
    ],
    recommendedReply: `Thanks for considering! I'm confident I can deliver great results. Would ${Math.round((originalOffer + counterOffer) / 2)} work?`,
  };

  if (!useAI || !posterResponse) {
    return baseResponse;
  }

  try {
    const prompt = `Analyze this negotiation response and provide strategic next steps.

ORIGINAL OFFER: $${originalOffer}
COUNTER OFFER: $${counterOffer} (+${increase}%)

POSTER'S RESPONSE:
"${posterResponse}"

Analyze the sentiment (positive/neutral/negative) and suggest:
1. Overall sentiment
2. 3 strategic next steps
3. Recommended reply (professional, friendly, solution-oriented)

Return JSON:
{
  "sentiment": "positive" | "neutral" | "negative",
  "nextSteps": string[],
  "recommendedReply": string
}`;

    const response = await hustleAI.chat('system', prompt);
    const aiResult = JSON.parse(response.response);

    return {
      sentiment: aiResult.sentiment || baseResponse.sentiment,
      nextSteps: aiResult.nextSteps || baseResponse.nextSteps,
      recommendedReply: aiResult.recommendedReply || baseResponse.recommendedReply,
    };
  } catch (error) {
    console.error('[Smart Negotiations] Response analysis failed:', error);
    return baseResponse;
  }
}

export function getNegotiationColor(confidence: number): string {
  if (confidence >= 75) return '#00FF88';
  if (confidence >= 60) return '#00D9FF';
  if (confidence >= 40) return '#FFB800';
  return '#FF6B6B';
}

export function getRiskColor(risk: 'low' | 'medium' | 'high'): string {
  switch (risk) {
    case 'low':
      return '#00FF88';
    case 'medium':
      return '#FFB800';
    case 'high':
      return '#FF00A8';
  }
}
