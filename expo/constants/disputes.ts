export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';
export type DisputeCategory = 'payment' | 'quality' | 'no_show' | 'safety' | 'communication' | 'other';
export type DisputeResolution = 'refund_full' | 'refund_partial' | 'no_refund' | 'task_redo' | 'warning_issued';

export interface Dispute {
  id: string;
  taskId: string;
  reporterId: string;
  reportedUserId: string;
  category: DisputeCategory;
  title: string;
  description: string;
  evidence: DisputeEvidence[];
  status: DisputeStatus;
  resolution?: DisputeResolution;
  resolutionNotes?: string;
  mediatorId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface DisputeEvidence {
  id: string;
  type: 'photo' | 'screenshot' | 'message' | 'document';
  url: string;
  description?: string;
  uploadedAt: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  message: string;
  isMediator: boolean;
  timestamp: string;
}

export const DISPUTE_CATEGORIES = [
  {
    id: 'payment' as DisputeCategory,
    name: 'Payment Issue',
    description: 'Disputes related to payment, pricing, or refunds',
    icon: '💰',
    color: '#10B981',
  },
  {
    id: 'quality' as DisputeCategory,
    name: 'Work Quality',
    description: 'Task not completed as agreed or poor quality',
    icon: '⭐',
    color: '#F59E0B',
  },
  {
    id: 'no_show' as DisputeCategory,
    name: 'No Show',
    description: 'Worker or poster did not show up',
    icon: '🚫',
    color: '#EF4444',
  },
  {
    id: 'safety' as DisputeCategory,
    name: 'Safety Concern',
    description: 'Safety or security issues during task',
    icon: '🛡️',
    color: '#8B5CF6',
  },
  {
    id: 'communication' as DisputeCategory,
    name: 'Communication',
    description: 'Poor communication or unresponsive user',
    icon: '💬',
    color: '#3B82F6',
  },
  {
    id: 'other' as DisputeCategory,
    name: 'Other',
    description: 'Other issues not listed above',
    icon: '📋',
    color: '#6B7280',
  },
];

export const DISPUTE_RESOLUTIONS = [
  {
    id: 'refund_full' as DisputeResolution,
    name: 'Full Refund',
    description: 'Full payment refunded to poster',
    icon: '💵',
  },
  {
    id: 'refund_partial' as DisputeResolution,
    name: 'Partial Refund',
    description: 'Partial payment refunded to poster',
    icon: '💸',
  },
  {
    id: 'no_refund' as DisputeResolution,
    name: 'No Refund',
    description: 'Payment stays with worker',
    icon: '🚫',
  },
  {
    id: 'task_redo' as DisputeResolution,
    name: 'Task Redo',
    description: 'Worker must redo the task',
    icon: '🔄',
  },
  {
    id: 'warning_issued' as DisputeResolution,
    name: 'Warning Issued',
    description: 'Warning issued to user',
    icon: '⚠️',
  },
];

export function getDisputeStatusColor(status: DisputeStatus): string {
  switch (status) {
    case 'open':
      return '#F59E0B';
    case 'under_review':
      return '#3B82F6';
    case 'resolved':
      return '#10B981';
    case 'closed':
      return '#6B7280';
    default:
      return '#6B7280';
  }
}

export function getDisputeStatusLabel(status: DisputeStatus): string {
  switch (status) {
    case 'open':
      return 'Open';
    case 'under_review':
      return 'Under Review';
    case 'resolved':
      return 'Resolved';
    case 'closed':
      return 'Closed';
    default:
      return 'Unknown';
  }
}
