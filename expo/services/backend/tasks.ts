import { api } from '@/utils/api';
import { Task } from '@/types';

export interface CreateTaskRequest {
  title: string;
  description: string;
  category: string;
  payAmount: number;
  xpReward: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  estimatedDuration?: string;
  skillsRequired?: string[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TaskFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'disputed';
  category?: string;
  minPay?: number;
  maxPay?: number;
  radius?: number;
  lat?: number;
  lng?: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}

export class TaskService {
  async createTask(data: CreateTaskRequest): Promise<Task> {
    return api.post<Task>('/tasks', data);
  }

  async getTasks(filters?: TaskFilters): Promise<TasksResponse> {
    return api.get<TasksResponse>('/tasks', filters);
  }

  async getTask(taskId: string): Promise<Task> {
    return api.get<Task>(`/tasks/${taskId}`);
  }

  async acceptTask(taskId: string): Promise<Task> {
    return api.post<Task>(`/tasks/${taskId}/accept`);
  }

  async startTask(taskId: string): Promise<Task> {
    return api.post<Task>(`/tasks/${taskId}/start`);
  }

  async submitCompletion(
    taskId: string,
    proofPhotos: string[],
    notes?: string
  ): Promise<Task> {
    return api.post<Task>(`/tasks/${taskId}/submit`, {
      proofPhotos,
      notes,
    });
  }

  async approveCompletion(taskId: string, rating?: number): Promise<Task> {
    return api.post<Task>(`/tasks/${taskId}/approve`, { rating });
  }

  async requestRevision(taskId: string, reason: string): Promise<Task> {
    return api.post<Task>(`/tasks/${taskId}/revise`, { reason });
  }

  async cancelTask(taskId: string, reason: string): Promise<Task> {
    return api.post<Task>(`/tasks/${taskId}/cancel`, { reason });
  }

  async getMyTasks(): Promise<Task[]> {
    return api.get<Task[]>('/tasks/my-tasks');
  }

  async getMyPostedTasks(): Promise<Task[]> {
    return api.get<Task[]>('/tasks/my-posted-tasks');
  }

  async getNearbyTasks(lat: number, lng: number, radius: number = 10): Promise<Task[]> {
    return api.get<Task[]>('/tasks/nearby', { lat, lng, radius });
  }

  async parseTaskFromVoice(audioFile: File): Promise<CreateTaskRequest> {
    return api.uploadFile<CreateTaskRequest>('/tasks/parse-voice', audioFile as any);
  }
}

export const taskService = new TaskService();
