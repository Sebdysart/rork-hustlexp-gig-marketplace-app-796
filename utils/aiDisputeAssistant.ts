import { Dispute, DisputeCategory, DisputeResolution } from '@/constants/disputes';
import { Task, User } from '@/types';

export interface DisputeSuggestion {
  resolution: DisputeResolution;
  confidence: number;
  reasoning: string;
  fairnessScore: number;
  recommendedAction: string;
  alternativeOptions: string[];
}

export interface DisputeAnalysis {
  category: DisputeCategory;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: DisputeSuggestion[];
  mediationPoints: string[];
  precedents: string[];
  estimatedResolutionTime: string;
}

export interface DisputeResponse {
  template: string;
  tone: 'professional' | 'empathetic' | 'firm';
  keyPoints: string[];
}

function analyzePaymentDispute(dispute: Dispute, task?: Task, reporter?: User, reported?: User): DisputeSuggestion[] {
  const suggestions: DisputeSuggestion[] = [];

  if (dispute.description.toLowerCase().includes('not paid') || 
      dispute.description.toLowerCase().includes('no payment')) {
    suggestions.push({
      resolution: 'refund_full',
      confidence: 85,
      reasoning: 'Work completed but payment not received. Full refund warranted.',
      fairnessScore: 90,
      recommendedAction: 'Release full payment to worker immediately',
      alternativeOptions: [
        'Review proof of work completion',
        'Contact poster for payment confirmation'
      ]
    });
  }

  if (dispute.description.toLowerCase().includes('partial') || 
      dispute.description.toLowerCase().includes('some work')) {
    suggestions.push({
      resolution: 'refund_partial',
      confidence: 75,
      reasoning: 'Partial work completed. Proportional payment recommended.',
      fairnessScore: 80,
      recommendedAction: 'Refund 50% based on work completed',
      alternativeOptions: [
        'Review work progress photos',
        'Negotiate completion or adjusted payment'
      ]
    });
  }

  if (task && task.payAmount > 200) {
    suggestions.push({
      resolution: 'refund_partial',
      confidence: 70,
      reasoning: 'High-value task. Consider milestone-based resolution.',
      fairnessScore: 75,
      recommendedAction: 'Split payment based on milestones achieved',
      alternativeOptions: [
        'Establish clear completion criteria',
        'Set up escrow for remaining payment'
      ]
    });
  }

  return suggestions.length > 0 ? suggestions : [{
    resolution: 'refund_partial',
    confidence: 60,
    reasoning: 'Payment dispute requires detailed review.',
    fairnessScore: 70,
    recommendedAction: 'Review evidence and mediate between parties',
    alternativeOptions: [
      'Request additional proof from both parties',
      'Schedule video mediation call'
    ]
  }];
}

function analyzeQualityDispute(dispute: Dispute, task?: Task): DisputeSuggestion[] {
  const suggestions: DisputeSuggestion[] = [];

  if (dispute.description.toLowerCase().includes('poor') || 
      dispute.description.toLowerCase().includes('bad')) {
    suggestions.push({
      resolution: 'task_redo',
      confidence: 80,
      reasoning: 'Quality issues reported. Allow worker to fix or redo work.',
      fairnessScore: 85,
      recommendedAction: 'Offer worker opportunity to redo task within 48 hours',
      alternativeOptions: [
        'Partial refund if redo not possible',
        'Full refund and reassign task'
      ]
    });
  }

  if (dispute.description.toLowerCase().includes('incomplete')) {
    suggestions.push({
      resolution: 'refund_partial',
      confidence: 85,
      reasoning: 'Task incomplete. Partial refund proportional to work done.',
      fairnessScore: 88,
      recommendedAction: 'Refund for incomplete portion, payment for completed work',
      alternativeOptions: [
        'Worker completes remaining work',
        'Hire another worker for completion'
      ]
    });
  }

  if (dispute.evidence.length >= 3) {
    suggestions.push({
      resolution: 'refund_full',
      confidence: 90,
      reasoning: 'Multiple evidence pieces show significant quality issues.',
      fairnessScore: 92,
      recommendedAction: 'Full refund to poster, issue warning to worker',
      alternativeOptions: [
        'Worker redo with supervisor verification',
        'Partial refund with quality improvement'
      ]
    });
  }

  return suggestions.length > 0 ? suggestions : [{
    resolution: 'task_redo',
    confidence: 65,
    reasoning: 'Quality standards not met.',
    fairnessScore: 70,
    recommendedAction: 'Review quality expectations and offer resolution',
    alternativeOptions: [
      'Clarify quality standards',
      'Mediate expectations'
    ]
  }];
}

function analyzeNoShowDispute(dispute: Dispute): DisputeSuggestion[] {
  return [{
    resolution: 'refund_full',
    confidence: 95,
    reasoning: 'No-show incidents warrant full refund to poster.',
    fairnessScore: 98,
    recommendedAction: 'Full refund to poster, strike to worker',
    alternativeOptions: [
      'Warning if first offense',
      'Temporary suspension if repeat offense'
    ]
  }];
}

function analyzeSafetyDispute(dispute: Dispute): DisputeSuggestion[] {
  return [{
    resolution: 'refund_full',
    confidence: 100,
    reasoning: 'Safety concerns require immediate action and full refund.',
    fairnessScore: 100,
    recommendedAction: 'Immediate refund, suspend reported user, escalate to safety team',
    alternativeOptions: [
      'Contact local authorities if necessary',
      'Permanent ban if verified'
    ]
  }];
}

function analyzeCommunicationDispute(dispute: Dispute): DisputeSuggestion[] {
  return [{
    resolution: 'warning_issued',
    confidence: 70,
    reasoning: 'Communication issues typically resolved with warnings.',
    fairnessScore: 75,
    recommendedAction: 'Issue warning, encourage better communication practices',
    alternativeOptions: [
      'No penalty if first offense',
      'Mediation session for both parties'
    ]
  }];
}

export async function analyzeDispute(
  dispute: Dispute,
  task?: Task,
  reporter?: User,
  reported?: User
): Promise<DisputeAnalysis> {
  let suggestions: DisputeSuggestion[] = [];
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
  const mediationPoints: string[] = [];
  const precedents: string[] = [];

  switch (dispute.category) {
    case 'payment':
      suggestions = analyzePaymentDispute(dispute, task, reporter, reported);
      severity = 'high';
      mediationPoints.push('Verify payment method and transaction status');
      mediationPoints.push('Review task completion proof');
      mediationPoints.push('Check platform payment processing logs');
      precedents.push('94% of payment disputes resolved within 24 hours');
      break;

    case 'quality':
      suggestions = analyzeQualityDispute(dispute, task);
      severity = 'medium';
      mediationPoints.push('Compare delivered work to task description');
      mediationPoints.push('Review quality standards for task category');
      mediationPoints.push('Consider poster expectations vs worker deliverables');
      precedents.push('72% of quality disputes resolved with partial refund');
      break;

    case 'no_show':
      suggestions = analyzeNoShowDispute(dispute);
      severity = 'high';
      mediationPoints.push('Verify scheduled time and communication');
      mediationPoints.push('Check for valid cancellation notice');
      mediationPoints.push('Review no-show policy');
      precedents.push('No-show disputes typically result in full refund');
      break;

    case 'safety':
      suggestions = analyzeSafetyDispute(dispute);
      severity = 'critical';
      mediationPoints.push('Escalate to safety team immediately');
      mediationPoints.push('Document all evidence');
      mediationPoints.push('Consider platform ban for reported user');
      precedents.push('Zero tolerance policy for safety violations');
      break;

    case 'communication':
      suggestions = analyzeCommunicationDispute(dispute);
      severity = 'low';
      mediationPoints.push('Review message logs');
      mediationPoints.push('Check response times');
      mediationPoints.push('Provide communication guidelines');
      precedents.push('Communication issues rarely result in refunds');
      break;

    default:
      suggestions = [{
        resolution: 'warning_issued',
        confidence: 50,
        reasoning: 'Dispute requires manual review.',
        fairnessScore: 60,
        recommendedAction: 'Escalate to human mediator for detailed review',
        alternativeOptions: [
          'Request more information from both parties',
          'Schedule mediation call'
        ]
      }];
  }

  const estimatedResolutionTime = severity === 'critical' ? '1-2 hours' :
                                  severity === 'high' ? '4-8 hours' :
                                  severity === 'medium' ? '1-2 days' :
                                  '2-3 days';

  return {
    category: dispute.category,
    severity,
    suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
    mediationPoints,
    precedents,
    estimatedResolutionTime
  };
}

export function generateDisputeResponse(
  dispute: Dispute,
  suggestion: DisputeSuggestion,
  toReporter: boolean
): DisputeResponse {
  const keyPoints: string[] = [];
  let template = '';
  let tone: 'professional' | 'empathetic' | 'firm' = 'professional';

  if (dispute.category === 'safety') {
    tone = 'firm';
    if (toReporter) {
      template = `We take safety concerns very seriously. Your report has been escalated to our safety team for immediate review. We will investigate this matter thoroughly and take appropriate action.\n\nYour safety is our top priority. Thank you for bringing this to our attention.`;
      keyPoints.push('Safety concern escalated');
      keyPoints.push('Investigation in progress');
      keyPoints.push('Appropriate action will be taken');
    } else {
      template = `A safety concern has been reported regarding your account. This matter is being reviewed by our safety team. We will contact you shortly to discuss this issue.`;
      keyPoints.push('Safety report filed');
      keyPoints.push('Account under review');
      keyPoints.push('Response required');
    }
  } else if (suggestion.resolution === 'refund_full') {
    tone = 'empathetic';
    if (toReporter) {
      template = `Thank you for your patience. After reviewing your dispute, we've determined that a full refund is appropriate.\n\n${suggestion.reasoning}\n\nThe refund will be processed within 3-5 business days.`;
      keyPoints.push('Full refund approved');
      keyPoints.push('Processing within 3-5 days');
      keyPoints.push('Thank you for your patience');
    } else {
      template = `After reviewing the dispute filed against this task, we've determined that a full refund will be issued to the poster.\n\n${suggestion.reasoning}\n\nIf you have questions or additional evidence, please respond within 48 hours.`;
      keyPoints.push('Full refund issued');
      keyPoints.push('Review completed');
      keyPoints.push('Appeals accepted within 48 hours');
    }
  } else if (suggestion.resolution === 'refund_partial') {
    tone = 'professional';
    template = `After careful review, we've determined that a partial resolution is most fair to both parties.\n\n${suggestion.reasoning}\n\n${suggestion.recommendedAction}`;
    keyPoints.push('Partial resolution approved');
    keyPoints.push('Fair to both parties');
    keyPoints.push('Based on evidence review');
  } else if (suggestion.resolution === 'task_redo') {
    tone = 'empathetic';
    if (toReporter) {
      template = `We understand your concerns about the task quality. We're offering the worker an opportunity to address the issues you've raised.\n\n${suggestion.recommendedAction}\n\nIf quality issues persist, we'll proceed with a refund.`;
      keyPoints.push('Quality concerns acknowledged');
      keyPoints.push('Worker given chance to fix');
      keyPoints.push('Refund if not resolved');
    } else {
      template = `The poster has raised concerns about task quality. We're giving you an opportunity to address these concerns.\n\n${suggestion.recommendedAction}\n\nPlease coordinate with the poster to resolve the issues.`;
      keyPoints.push('Quality concerns raised');
      keyPoints.push('Opportunity to fix');
      keyPoints.push('Coordinate with poster');
    }
  } else {
    template = `Thank you for filing this dispute. ${suggestion.reasoning}\n\n${suggestion.recommendedAction}`;
    keyPoints.push('Dispute reviewed');
    keyPoints.push('Resolution recommended');
    keyPoints.push('Action required');
  }

  return {
    template,
    tone,
    keyPoints
  };
}

export function getDisputePriority(dispute: Dispute): 'urgent' | 'high' | 'normal' | 'low' {
  if (dispute.category === 'safety') return 'urgent';
  if (dispute.category === 'no_show') return 'high';
  if (dispute.category === 'payment') return 'high';
  if (dispute.category === 'quality') return 'normal';
  return 'low';
}

export function suggestEvidence(category: DisputeCategory): string[] {
  const suggestions: string[] = [];

  switch (category) {
    case 'payment':
      suggestions.push('Screenshot of payment confirmation');
      suggestions.push('Bank/payment app transaction record');
      suggestions.push('Chat logs discussing payment');
      break;
    case 'quality':
      suggestions.push('Photos of completed work');
      suggestions.push('Original task requirements');
      suggestions.push('Chat logs about expectations');
      break;
    case 'no_show':
      suggestions.push('Screenshot of scheduled time');
      suggestions.push('Chat logs showing no communication');
      suggestions.push('Photo showing you arrived at location');
      break;
    case 'safety':
      suggestions.push('Photos/videos of safety concern');
      suggestions.push('Chat logs of concerning messages');
      suggestions.push('Police report if applicable');
      break;
    case 'communication':
      suggestions.push('Chat message screenshots');
      suggestions.push('Timeline of response delays');
      suggestions.push('Evidence of attempts to communicate');
      break;
    default:
      suggestions.push('Any relevant screenshots');
      suggestions.push('Chat message history');
      suggestions.push('Photos or documents');
  }

  return suggestions;
}
