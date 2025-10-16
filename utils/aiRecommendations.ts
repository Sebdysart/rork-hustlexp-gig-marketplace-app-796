import { Task, User, TaskCategory } from '@/types';
import { generateObject, generateText } from '@rork/toolkit-sdk';
import { z } from 'zod';

export interface PersonalizedRecommendation {
  taskId: string;
  score: number;
  reasoning: string;
  matchFactors: string[];
  estimatedEarnings: number;
  estimatedTime: string;
}

const recommendationSchema = z.object({
  recommendations: z.array(
    z.object({
      taskId: z.string(),
      score: z.number().min(0).max(100),
      reasoning: z.string(),
      matchFactors: z.array(z.string()),
      estimatedEarnings: z.number(),
      estimatedTime: z.string(),
    })
  ),
});

export async function getPersonalizedRecommendations(
  user: User,
  availableTasks: Task[],
  useAI: boolean = true
): Promise<PersonalizedRecommendation[]> {
  console.log('[AI Recommendations] Generating personalized recommendations for user:', user.name);

  if (availableTasks.length === 0) {
    return [];
  }

  if (!useAI) {
    return availableTasks.slice(0, 5).map((task) => ({
      taskId: task.id,
      score: 70,
      reasoning: 'Based on your location and experience',
      matchFactors: ['Nearby', 'Good pay'],
      estimatedEarnings: task.payAmount,
      estimatedTime: '1-2 hours',
    }));
  }

  try {
    const userProfile = {
      level: user.level,
      tasksCompleted: user.tasksCompleted,
      rating: user.reputationScore,
      badges: user.badges?.slice(0, 5).map((b) => b.name) || [],
      location: user.location.address,
      earnings: user.earnings,
    };

    const taskSummaries = availableTasks.slice(0, 20).map((task) => ({
      id: task.id,
      title: task.title,
      category: task.category,
      pay: task.payAmount,
      xp: task.xpReward,
      location: task.location.address,
    }));

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `You are an AI recommendation engine for HustleXP. Analyze this user and recommend the best tasks.

User Profile:
${JSON.stringify(userProfile, null, 2)}

Available Tasks:
${JSON.stringify(taskSummaries, null, 2)}

Recommend the top 5 tasks for this user. Consider:
- User's experience level and skills
- Task pay and XP rewards
- Location proximity
- Task difficulty vs user capability
- Potential for skill growth

For each recommendation, provide:
- Match score (0-100)
- Clear reasoning
- 2-3 key match factors
- Estimated earnings
- Estimated time to complete

Be personalized and helpful. Focus on tasks that will help the user grow.`,
        },
      ],
      schema: recommendationSchema,
    });

    console.log('[AI Recommendations] Generated', result.recommendations.length, 'recommendations');
    return result.recommendations;
  } catch (error) {
    console.error('[AI Recommendations] Error:', error);
    
    return availableTasks.slice(0, 5).map((task) => ({
      taskId: task.id,
      score: 70,
      reasoning: 'Based on your location and experience',
      matchFactors: ['Nearby', 'Good pay'],
      estimatedEarnings: task.payAmount,
      estimatedTime: '1-2 hours',
    }));
  }
}

export async function generateDailyQuestSuggestions(
  user: User,
  completedCategories: TaskCategory[]
): Promise<{ category: TaskCategory; title: string; description: string; xp: number }[]> {
  try {
    console.log('[AI Recommendations] Generating daily quest suggestions');

    const suggestionsSchema = z.object({
      quests: z.array(
        z.object({
          category: z.enum(['cleaning', 'errands', 'delivery', 'moving', 'handyman', 'tech', 'creative', 'other']),
          title: z.string(),
          description: z.string(),
          xp: z.number(),
        })
      ),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Generate 3 daily quest suggestions for this user:

User Level: ${user.level}
Tasks Completed: ${user.tasksCompleted}
Current Streak: ${user.streaks.current}
Completed Today: ${completedCategories.join(', ') || 'None'}

Suggest quests that:
- Are achievable in one day
- Vary in difficulty
- Help build streaks
- Offer good XP rewards (50-200 XP)
- Are different from completed categories

Make titles engaging and game-like (e.g., "Epic Clean Quest", "Delivery Dash").`,
        },
      ],
      schema: suggestionsSchema,
    });

    return result.quests;
  } catch (error) {
    console.error('[AI Recommendations] Error generating daily quests:', error);
    return [
      {
        category: 'errands',
        title: 'Quick Errand Run',
        description: 'Complete any errand task',
        xp: 100,
      },
      {
        category: 'cleaning',
        title: 'Clean Sweep Mission',
        description: 'Complete a cleaning task',
        xp: 150,
      },
      {
        category: 'delivery',
        title: 'Delivery Dash',
        description: 'Complete a delivery task',
        xp: 120,
      },
    ];
  }
}

export async function analyzeUserProgress(user: User): Promise<{
  strengths: string[];
  improvements: string[];
  nextMilestone: string;
  tips: string[];
}> {
  try {
    console.log('[AI Recommendations] Analyzing user progress');

    const analysisSchema = z.object({
      strengths: z.array(z.string()).describe('User strengths and achievements'),
      improvements: z.array(z.string()).describe('Areas for improvement'),
      nextMilestone: z.string().describe('Next achievement to work towards'),
      tips: z.array(z.string()).describe('Actionable tips for improvement'),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Analyze this user's progress and provide insights:

Level: ${user.level}
XP: ${user.xp}
Tasks Completed: ${user.tasksCompleted}
Rating: ${user.reputationScore.toFixed(1)}⭐
Earnings: $${user.earnings}
Current Streak: ${user.streaks.current} days
Longest Streak: ${user.streaks.longest} days
Badges: ${user.badges?.length || 0}

Provide:
- 3 key strengths
- 2-3 areas for improvement
- Next milestone to achieve
- 3 actionable tips

Be encouraging and specific. Focus on growth.`,
        },
      ],
      schema: analysisSchema,
    });

    return result;
  } catch (error) {
    console.error('[AI Recommendations] Error analyzing progress:', error);
    return {
      strengths: [
        `Level ${user.level} - Great progress!`,
        `${user.tasksCompleted} tasks completed`,
        `${user.reputationScore.toFixed(1)}⭐ rating`,
      ],
      improvements: [
        'Build longer streaks for bonus XP',
        'Try different task categories',
      ],
      nextMilestone: `Reach Level ${Math.ceil(user.level / 10) * 10}`,
      tips: [
        'Complete daily quests for streak bonuses',
        'Focus on high-XP tasks to level up faster',
        'Maintain your rating by delivering quality work',
      ],
    };
  }
}

export async function predictTaskDemand(
  category: TaskCategory,
  location: string,
  timeOfDay: number
): Promise<{
  demand: 'high' | 'medium' | 'low';
  reasoning: string;
  suggestedPricing: { min: number; max: number };
}> {
  try {
    console.log('[AI Recommendations] Predicting task demand');

    const demandSchema = z.object({
      demand: z.enum(['high', 'medium', 'low']),
      reasoning: z.string(),
      suggestedPricing: z.object({
        min: z.number(),
        max: z.number(),
      }),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Predict demand for this task:

Category: ${category}
Location: ${location}
Time: ${timeOfDay}:00 (24-hour format)

Consider:
- Time of day patterns
- Category popularity
- Location factors
- Typical demand cycles

Provide:
- Demand level (high/medium/low)
- Brief reasoning
- Suggested pricing range

Be realistic and helpful.`,
        },
      ],
      schema: demandSchema,
    });

    return result;
  } catch (error) {
    console.error('[AI Recommendations] Error predicting demand:', error);
    return {
      demand: 'medium',
      reasoning: 'Based on typical patterns for this category',
      suggestedPricing: { min: 30, max: 80 },
    };
  }
}
