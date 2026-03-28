import { api } from '@/utils/api';

export interface CreateDisputeRequest {
  taskId: string;
  reason: string;
  description: string;
  evidence: string[];
}

export interface Dispute {
  id: string;
  taskId: string;
  initiatorId: string;
  respondentId: string;
  reason: string;
  description: string;
  evidence: string[];
  status: 'open' | 'reviewing' | 'resolved' | 'appealed';
  resolution?: {
    decision: 'favor_worker' | 'favor_poster' | 'split';
    reasoning: string;
    refundAmount?: number;
    payoutAmount?: number;
  };
  createdAt: string;
  resolvedAt?: string;
}

export class DisputeService {
  async createDispute(data: CreateDisputeRequest): Promise<Dispute> {
    return api.post<Dispute>('/disputes', data);
  }

  async getDispute(disputeId: string): Promise<Dispute> {
    return api.get<Dispute>(`/disputes/${disputeId}`);
  }

  async getMyDisputes(): Promise<Dispute[]> {
    return api.get<Dispute[]>('/disputes/my-disputes');
  }

  async addEvidence(disputeId: string, evidence: {
    type: 'photo' | 'message' | 'document';
    content: string;
    description?: string;
  }): Promise<void> {
    await api.post(`/disputes/${disputeId}/evidence`, evidence);
  }

  async respondToDispute(disputeId: string, response: {
    statement: string;
    evidence?: string[];
  }): Promise<void> {
    await api.post(`/disputes/${disputeId}/respond`, response);
  }

  async appealResolution(disputeId: string, reason: string): Promise<void> {
    await api.post(`/disputes/${disputeId}/appeal`, { reason });
  }

  async acceptResolution(disputeId: string): Promise<void> {
    await api.post(`/disputes/${disputeId}/accept`);
  }
}

export const disputeService = new DisputeService();
