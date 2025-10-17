import { hustleAI } from './hustleAI';
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

    const result = await hustleAI.parseTask('current-user', userInput);

    console.log('[AI Task Parser] Result:', result);

    return result;
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
    const response = await hustleAI.chat('system', `Improve this task description to be more clear, detailed, and professional while keeping the same meaning:\n\n${currentDescription}`);

    return response.response;
  } catch (error) {
    console.error('[AI Task Parser] Error improving description:', error);
    return currentDescription;
  }
}

export async function suggestPricing(taskDescription: string, category: string): Promise<{ min: number; max: number }> {
  try {
    const response = await hustleAI.chat('system', `Based on current market rates for gig work, suggest fair pricing for this task:\n\nCategory: ${category}\nDescription: ${taskDescription}\n\nConsider complexity, time required, and skill level.\n\nReturn JSON with {min: number, max: number, reasoning: string}`);

    const result = JSON.parse(response.response);

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
