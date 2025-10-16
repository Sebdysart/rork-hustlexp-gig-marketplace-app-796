import { generateText, generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

export interface AITaskSuggestion {
  title: string;
  description: string;
  category: string;
  estimatedPay: {
    min: number;
    max: number;
  };
  estimatedDuration: string;
  confidence: 'low' | 'medium' | 'high';
  suggestedSkills: string[];
  safetyNotes?: string;
}

const taskSchema = z.object({
  title: z.string().describe('A catchy, engaging title for the task'),
  description: z.string().describe('Detailed description of what needs to be done'),
  category: z.enum([
    'home_repair',
    'delivery',
    'babysitting',
    'pet_care',
    'tutoring',
    'nursing',
    'virtual',
    'ai_automation',
    'cleaning',
    'moving',
    'errands',
    'other',
  ]).describe('The category that best fits this task'),
  estimatedPayMin: z.number().describe('Minimum fair pay in dollars'),
  estimatedPayMax: z.number().describe('Maximum fair pay in dollars'),
  estimatedDuration: z.string().describe('How long the task will take (e.g., "2-3 hours")'),
  confidence: z.enum(['low', 'medium', 'high']).describe('Confidence in the suggestion'),
  suggestedSkills: z.array(z.string()).describe('Skills needed for this task'),
  safetyNotes: z.string().optional().describe('Any safety or legal considerations'),
});

export async function parseTaskWithAI(userInput: string, category?: string): Promise<AITaskSuggestion> {
  try {
    console.log('[AI Task Parser] Parsing input:', userInput);

    const systemPrompt = `You are an AI assistant for HustleXP, a gig economy platform. 
Your job is to help users create task postings by understanding their needs and suggesting:
- An engaging, clear title
- A detailed description
- Fair pricing based on market rates
- Estimated duration
- Required skills
- Any safety or legal considerations

Be helpful, ethical, and ensure all suggestions are legal and safe.
${category ? `The user has pre-selected the category: ${category}` : ''}`;

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}\n\nUser needs: ${userInput}`,
        },
      ],
      schema: taskSchema,
    });

    console.log('[AI Task Parser] Result:', result);

    return {
      title: result.title,
      description: result.description,
      category: result.category,
      estimatedPay: {
        min: result.estimatedPayMin,
        max: result.estimatedPayMax,
      },
      estimatedDuration: result.estimatedDuration,
      confidence: result.confidence,
      suggestedSkills: result.suggestedSkills,
      safetyNotes: result.safetyNotes,
    };
  } catch (error) {
    console.error('[AI Task Parser] Error:', error);
    
    return {
      title: 'Task: ' + userInput.slice(0, 50),
      description: userInput,
      category: category || 'other',
      estimatedPay: {
        min: 20,
        max: 50,
      },
      estimatedDuration: '1-2 hours',
      confidence: 'low',
      suggestedSkills: ['General'],
      safetyNotes: 'Please review and customize this task before posting.',
    };
  }
}

export async function improveTaskDescription(currentDescription: string): Promise<string> {
  try {
    const improved = await generateText({
      messages: [
        {
          role: 'user',
          content: `Improve this task description to be more clear, detailed, and professional while keeping the same meaning:\n\n${currentDescription}`,
        },
      ],
    });

    return improved;
  } catch (error) {
    console.error('[AI Task Parser] Error improving description:', error);
    return currentDescription;
  }
}

export async function suggestPricing(taskDescription: string, category: string): Promise<{ min: number; max: number }> {
  try {
    const pricingSchema = z.object({
      min: z.number().describe('Minimum fair price in dollars'),
      max: z.number().describe('Maximum fair price in dollars'),
      reasoning: z.string().describe('Brief explanation of pricing'),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Based on current market rates for gig work, suggest fair pricing for this task:\n\nCategory: ${category}\nDescription: ${taskDescription}\n\nConsider complexity, time required, and skill level.`,
        },
      ],
      schema: pricingSchema,
    });

    console.log('[AI Pricing] Suggestion:', result);

    return {
      min: result.min,
      max: result.max,
    };
  } catch (error) {
    console.error('[AI Pricing] Error:', error);
    return { min: 20, max: 50 };
  }
}
