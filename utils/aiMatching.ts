import { User, Task } from '@/types';
import { hustleAI } from './hustleAI';
import { z } from 'zod';

export interface WorkerMatch {
  userId: string;
  score: number;
  reasoning: string;
  estimatedArrival?: string;
  strengths: string[];
  concerns?: string[];
}

const matchSchema = z.object({
  matches: z.array(
    z.object({
      userId: z.string(),
      score: z.number().min(0).max(100).describe('Match score from 0-100'),
      reasoning: z.string().describe('Why this worker is a good match'),
      strengths: z.array(z.string()).describe('Key strengths for this task'),
      concerns: z.array(z.string()).optional().describe('Potential concerns or limitations'),
    })
  ),
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function estimateArrivalTime(distanceKm: number): string {
  const avgSpeedKmh = 40;
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);

  if (timeMinutes < 5) return '5 min';
  if (timeMinutes < 60) return `${timeMinutes} min`;
  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export async function findBestWorkers(
  task: Task,
  availableWorkers: User[],
  useAI: boolean = true
): Promise<WorkerMatch[]> {
  console.log('[AI Matching] Finding best workers for task:', task.title);

  const nearbyWorkers = availableWorkers
    .filter((worker) => {
      if (worker.role === 'poster') return false;
      
      const distance = calculateDistance(
        task.location.lat,
        task.location.lng,
        worker.location.lat,
        worker.location.lng
      );
      
      return distance <= 50;
    })
    .map((worker) => {
      const distance = calculateDistance(
        task.location.lat,
        task.location.lng,
        worker.location.lat,
        worker.location.lng
      );

      const baseScore =
        (worker.reputationScore / 5) * 30 +
        Math.min(worker.tasksCompleted / 100, 1) * 20 +
        Math.max(0, 1 - distance / 50) * 30 +
        (worker.level / 100) * 20;

      return {
        worker,
        distance,
        baseScore: Math.round(baseScore),
      };
    })
    .sort((a, b) => b.baseScore - a.baseScore)
    .slice(0, 10);

  if (nearbyWorkers.length === 0) {
    console.log('[AI Matching] No nearby workers found');
    return [];
  }

  if (!useAI) {
    return nearbyWorkers.map(({ worker, distance, baseScore }) => ({
      userId: worker.id,
      score: baseScore,
      reasoning: `${baseScore}% match based on location, experience, and rating`,
      estimatedArrival: estimateArrivalTime(distance),
      strengths: [
        `${worker.tasksCompleted} tasks completed`,
        `${worker.reputationScore.toFixed(1)}⭐ rating`,
        `Level ${worker.level}`,
      ],
    }));
  }

  try {
    const workerSummaries = nearbyWorkers.map(({ worker, distance }) => ({
      id: worker.id,
      name: worker.name,
      level: worker.level,
      tasksCompleted: worker.tasksCompleted,
      rating: worker.reputationScore,
      distanceKm: Math.round(distance * 10) / 10,
      badges: worker.badges?.slice(0, 3).map((b) => b.name) || [],
    }));

    console.log('[AI Matching] Requesting AI analysis for', workerSummaries.length, 'workers');

    const response = await hustleAI.chat('system', `You are an AI matching assistant for HustleXP. Analyze these workers and rank them for this task.

Task: ${task.title}
Category: ${task.category}
Description: ${task.description}
Pay: ${task.payAmount}

Available Workers:
${JSON.stringify(workerSummaries, null, 2)}

Rank the top 5 workers by match score (0-100). Consider:
- Distance (closer is better)
- Experience (more tasks completed)
- Rating (higher is better)
- Level (higher shows commitment)
- Relevant badges

For each match, provide:
- Match score (0-100)
- Clear reasoning
- 2-3 key strengths
- Any concerns (optional)

Be fair and unbiased. Prioritize quality and reliability.

Return JSON: {matches: Array<{userId, score, reasoning, strengths, concerns?}>}`);

    const result = JSON.parse(response.response);

    console.log('[AI Matching] AI analysis complete:', result.matches.length, 'matches');

    return result.matches.map((match: any) => {
      const workerData = nearbyWorkers.find((w) => w.worker.id === match.userId);
      return {
        ...match,
        estimatedArrival: workerData ? estimateArrivalTime(workerData.distance) : undefined,
      };
    });
  } catch (error) {
    console.error('[AI Matching] Error during AI matching:', error);
    
    return nearbyWorkers.slice(0, 5).map(({ worker, distance, baseScore }) => ({
      userId: worker.id,
      score: baseScore,
      reasoning: `${baseScore}% match based on location, experience, and rating`,
      estimatedArrival: estimateArrivalTime(distance),
      strengths: [
        `${worker.tasksCompleted} tasks completed`,
        `${worker.reputationScore.toFixed(1)}⭐ rating`,
        `Level ${worker.level}`,
      ],
    }));
  }
}

export async function explainMatch(
  worker: User,
  task: Task,
  matchScore: number
): Promise<string> {
  try {
    console.log('[AI Matching] Explaining match for worker:', worker.name);

    const response = await hustleAI.chat('system', `Explain why this worker is a ${matchScore}% match for this task in 1-2 sentences.

Worker: ${worker.name}
- Level ${worker.level}
- ${worker.tasksCompleted} tasks completed
- ${worker.reputationScore.toFixed(1)}⭐ rating

Task: ${task.title}
Category: ${task.category}
Pay: ${task.payAmount}

Be concise and positive. Focus on their strengths.`);

    return response.response;
  } catch (error) {
    console.error('[AI Matching] Error explaining match:', error);
    return `${matchScore}% match based on experience, rating, and location.`;
  }
}

export function getMatchColor(score: number): string {
  if (score >= 80) return '#00FF88';
  if (score >= 60) return '#00D9FF';
  if (score >= 40) return '#FFB800';
  return '#FF6B6B';
}

export function getMatchLabel(score: number): string {
  if (score >= 90) return 'Perfect Match';
  if (score >= 80) return 'Excellent Match';
  if (score >= 70) return 'Great Match';
  if (score >= 60) return 'Good Match';
  if (score >= 50) return 'Fair Match';
  return 'Possible Match';
}
