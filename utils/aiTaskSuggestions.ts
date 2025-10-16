import { TaskCategory } from '@/types';
import { generateObject, generateText } from '@rork/toolkit-sdk';
import { z } from 'zod';

export interface TaskSuggestion {
  title: string;
  description: string;
  category: TaskCategory;
  suggestedPay: number;
  estimatedDuration: string;
  confidence: 'high' | 'medium' | 'low';
  tips: string[];
}

const taskSuggestionSchema = z.object({
  title: z.string().describe('Catchy, engaging task title (e.g., "Epic Clean Quest")'),
  description: z.string().describe('Detailed task description with clear expectations'),
  category: z.enum(['cleaning', 'errands', 'delivery', 'moving', 'handyman', 'tech', 'creative', 'other']).describe('Task category'),
  suggestedPay: z.number().describe('Suggested payment amount in USD'),
  estimatedDuration: z.string().describe('Estimated time to complete (e.g., "2-3 hours")'),
  confidence: z.enum(['high', 'medium', 'low']).describe('AI confidence in suggestion'),
  tips: z.array(z.string()).describe('Helpful tips for the task poster'),
});

export async function generateTaskSuggestion(userInput: string): Promise<TaskSuggestion> {
  try {
    console.log('[AI] Generating task suggestion for:', userInput);

    const suggestion = await generateObject({
      messages: [
        {
          role: 'user',
          content: `You are an AI assistant for HustleXP, a gamified gig economy app. Generate a task suggestion based on this user input: "${userInput}".

Make the title engaging and game-like (e.g., "Epic Clean Quest", "Legendary Move Mission").
Provide a clear, detailed description.
Suggest fair market pay based on typical rates.
Estimate realistic duration.
Give 2-3 helpful tips for the poster.

Be creative but practical. Make it sound exciting!`,
        },
      ],
      schema: taskSuggestionSchema,
    });

    console.log('[AI] Task suggestion generated:', suggestion);
    return suggestion;
  } catch (error) {
    console.error('[AI] Error generating task suggestion:', error);
    
    return {
      title: userInput,
      description: 'Please provide more details about this task.',
      category: 'other',
      suggestedPay: 50,
      estimatedDuration: '1-2 hours',
      confidence: 'low',
      tips: [
        'Add specific details about what you need',
        'Include location and timing requirements',
        'Set a fair price to attract quality workers',
      ],
    };
  }
}

export async function enhanceTaskDescription(
  title: string,
  description: string,
  category: TaskCategory
): Promise<string> {
  try {
    console.log('[AI] Enhancing task description');

    const enhanced = await generateText({
      messages: [
        {
          role: 'user',
          content: `Enhance this task description to be more clear and engaging:

Title: ${title}
Category: ${category}
Current Description: ${description}

Make it:
- Clear and specific
- Professional but friendly
- Include what's expected
- Mention any requirements
- Keep it concise (2-3 sentences)

Return only the enhanced description, nothing else.`,
        },
      ],
    });

    console.log('[AI] Description enhanced');
    return enhanced;
  } catch (error) {
    console.error('[AI] Error enhancing description:', error);
    return description;
  }
}

export async function suggestTaskExtras(
  category: TaskCategory,
  description: string
): Promise<string[]> {
  try {
    console.log('[AI] Suggesting task extras');

    const extrasSchema = z.object({
      extras: z.array(z.string()).describe('Suggested extras or requirements for the task'),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Suggest 3-5 helpful extras or requirements for this task:

Category: ${category}
Description: ${description}

Examples:
- "Tools provided"
- "Parking available"
- "Heavy lifting required"
- "Must have own vehicle"
- "Experience preferred"

Return practical, relevant extras.`,
        },
      ],
      schema: extrasSchema,
    });

    console.log('[AI] Extras suggested:', result.extras);
    return result.extras;
  } catch (error) {
    console.error('[AI] Error suggesting extras:', error);
    return [];
  }
}

export async function estimateTaskPay(
  category: TaskCategory,
  description: string,
  duration?: string
): Promise<{ min: number; max: number; recommended: number }> {
  try {
    console.log('[AI] Estimating task pay');

    const paySchema = z.object({
      min: z.number().describe('Minimum fair pay in USD'),
      max: z.number().describe('Maximum fair pay in USD'),
      recommended: z.number().describe('Recommended pay in USD'),
      reasoning: z.string().describe('Brief explanation of the estimate'),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Estimate fair pay for this task based on market rates:

Category: ${category}
Description: ${description}
${duration ? `Duration: ${duration}` : ''}

Consider:
- Typical market rates for this type of work
- Skill level required
- Time commitment
- Physical demands

Provide min, max, and recommended pay in USD.`,
        },
      ],
      schema: paySchema,
    });

    console.log('[AI] Pay estimated:', result);
    return {
      min: result.min,
      max: result.max,
      recommended: result.recommended,
    };
  } catch (error) {
    console.error('[AI] Error estimating pay:', error);
    
    const basePay: Record<TaskCategory, number> = {
      cleaning: 50,
      errands: 30,
      delivery: 25,
      moving: 100,
      handyman: 75,
      tech: 80,
      creative: 100,
      other: 50,
    };

    const base = basePay[category] || 50;
    return {
      min: Math.floor(base * 0.7),
      max: Math.floor(base * 1.5),
      recommended: base,
    };
  }
}

export async function generateTaskTitle(description: string, category: TaskCategory): Promise<string> {
  try {
    console.log('[AI] Generating task title');

    const title = await generateText({
      messages: [
        {
          role: 'user',
          content: `Generate a catchy, game-like title for this task:

Category: ${category}
Description: ${description}

Make it:
- Engaging and fun (like a video game quest)
- 3-6 words
- Include words like "Quest", "Mission", "Epic", "Legendary" when appropriate
- Professional but exciting

Examples:
- "Epic Clean Quest"
- "Legendary Move Mission"
- "Tech Rescue Operation"
- "Creative Design Challenge"

Return only the title, nothing else.`,
        },
      ],
    });

    console.log('[AI] Title generated:', title);
    return title.trim();
  } catch (error) {
    console.error('[AI] Error generating title:', error);
    return `${category.charAt(0).toUpperCase() + category.slice(1)} Quest`;
  }
}
