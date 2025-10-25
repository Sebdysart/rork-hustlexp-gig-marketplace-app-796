import { api } from '@/utils/api';

export interface CreatePaymentIntentRequest {
  taskId: string;
  amount: number;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  status: string;
}

export interface Transaction {
  id: string;
  taskId: string;
  amount: number;
  type: 'escrow' | 'payout' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Wallet {
  balance: number;
  gritCoins: number;
  pendingPayouts: number;
  totalEarnings: number;
}

export class PaymentService {
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    return api.post<PaymentIntent>('/payments/intents', data);
  }

  async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    return api.post<PaymentIntent>(`/payments/intents/${paymentIntentId}/confirm`);
  }

  async getWallet(): Promise<Wallet> {
    return api.get<Wallet>('/payments/wallet');
  }

  async getTransactions(filters?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    return api.get<Transaction[]>('/payments/transactions', filters);
  }

  async requestPayout(amount: number): Promise<{
    id: string;
    status: string;
    estimatedArrival: string;
  }> {
    return api.post('/payments/payout', { amount });
  }

  async getEscrowStatus(taskId: string): Promise<{
    taskId: string;
    amount: number;
    status: 'held' | 'released' | 'refunded';
    heldAt: string;
    releasedAt?: string;
  }> {
    return api.get(`/payments/escrow/${taskId}`);
  }

  async refundTask(taskId: string, reason: string): Promise<void> {
    await api.post(`/payments/refund`, { taskId, reason });
  }
}

export const paymentService = new PaymentService();
