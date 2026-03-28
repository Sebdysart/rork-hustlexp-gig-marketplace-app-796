import { generateObject, generateText } from '@rork/toolkit-sdk';
import { z } from 'zod';

export interface ProofAnalysis {
  isValid: boolean;
  confidence: number;
  findings: string[];
  concerns: string[];
  recommendation: 'approve' | 'review' | 'reject';
  reasoning: string;
}

const proofAnalysisSchema = z.object({
  isValid: z.boolean().describe('Whether the proof appears valid'),
  confidence: z.number().min(0).max(100).describe('Confidence level 0-100'),
  findings: z.array(z.string()).describe('Positive findings in the proof'),
  concerns: z.array(z.string()).describe('Any concerns or issues'),
  recommendation: z.enum(['approve', 'review', 'reject']).describe('Recommended action'),
  reasoning: z.string().describe('Explanation of the analysis'),
});

export async function analyzeProofImage(
  imageBase64: string,
  taskDescription: string,
  taskCategory: string
): Promise<ProofAnalysis> {
  try {
    console.log('[AI Proof] Analyzing proof image');

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this task completion proof:

Task: ${taskDescription}
Category: ${taskCategory}

Verify:
- Does the image show task completion?
- Is the quality sufficient?
- Are there any red flags?
- Does it match the task description?

Provide:
- Validity assessment
- Confidence level (0-100)
- Positive findings
- Any concerns
- Recommendation (approve/review/reject)
- Clear reasoning

Be thorough but fair.`,
            },
            {
              type: 'image',
              image: imageBase64,
            },
          ],
        },
      ],
      schema: proofAnalysisSchema,
    });

    console.log('[AI Proof] Analysis complete:', result.recommendation);
    return result;
  } catch (error) {
    console.error('[AI Proof] Analysis error:', error);
    return {
      isValid: false,
      confidence: 0,
      findings: [],
      concerns: ['Unable to analyze proof automatically'],
      recommendation: 'review',
      reasoning: 'AI analysis failed. Manual review required.',
    };
  }
}

export async function analyzeProofText(
  proofText: string,
  taskDescription: string,
  taskCategory: string
): Promise<ProofAnalysis> {
  try {
    console.log('[AI Proof] Analyzing proof text');

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Analyze this task completion proof:

Task: ${taskDescription}
Category: ${taskCategory}

Proof Description:
"${proofText}"

Verify:
- Does the description indicate completion?
- Is it detailed enough?
- Are there any inconsistencies?
- Does it match the task requirements?

Provide:
- Validity assessment
- Confidence level (0-100)
- Positive findings
- Any concerns
- Recommendation (approve/review/reject)
- Clear reasoning`,
        },
      ],
      schema: proofAnalysisSchema,
    });

    console.log('[AI Proof] Analysis complete:', result.recommendation);
    return result;
  } catch (error) {
    console.error('[AI Proof] Analysis error:', error);
    return {
      isValid: false,
      confidence: 0,
      findings: [],
      concerns: ['Unable to analyze proof automatically'],
      recommendation: 'review',
      reasoning: 'AI analysis failed. Manual review required.',
    };
  }
}

export async function generateProofSuggestions(
  taskDescription: string,
  taskCategory: string
): Promise<string[]> {
  try {
    console.log('[AI Proof] Generating proof suggestions');

    const suggestionsSchema = z.object({
      suggestions: z.array(z.string()).describe('Proof submission suggestions'),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Suggest what proof should be submitted for this task:

Task: ${taskDescription}
Category: ${taskCategory}

Provide 3-5 specific suggestions for what to include in proof (photos, descriptions, etc.).

Be practical and helpful.`,
        },
      ],
      schema: suggestionsSchema,
    });

    return result.suggestions;
  } catch (error) {
    console.error('[AI Proof] Suggestion error:', error);
    return [
      'Take clear photos of completed work',
      'Include before and after shots if applicable',
      'Write a brief description of what was done',
      'Show any relevant details or specifics',
    ];
  }
}

export async function compareProofToTask(
  proofDescription: string,
  taskDescription: string,
  taskExtras: string[]
): Promise<{
  matchScore: number;
  completedItems: string[];
  missingItems: string[];
  additionalWork: string[];
}> {
  try {
    console.log('[AI Proof] Comparing proof to task requirements');

    const comparisonSchema = z.object({
      matchScore: z.number().min(0).max(100),
      completedItems: z.array(z.string()),
      missingItems: z.array(z.string()),
      additionalWork: z.array(z.string()),
    });

    const result = await generateObject({
      messages: [
        {
          role: 'user',
          content: `Compare this proof to the task requirements:

Task Description:
${taskDescription}

Task Extras:
${taskExtras.join('\n')}

Proof Submitted:
${proofDescription}

Analyze:
- Match score (0-100)
- What was completed
- What's missing
- Any additional work done

Be thorough and fair.`,
        },
      ],
      schema: comparisonSchema,
    });

    return result;
  } catch (error) {
    console.error('[AI Proof] Comparison error:', error);
    return {
      matchScore: 50,
      completedItems: ['Task appears partially complete'],
      missingItems: ['Unable to verify all requirements'],
      additionalWork: [],
    };
  }
}

export async function detectFraudulentProof(
  proofImageBase64?: string,
  proofText?: string
): Promise<{
  isFraudulent: boolean;
  confidence: number;
  redFlags: string[];
  reasoning: string;
}> {
  try {
    console.log('[AI Proof] Detecting fraudulent proof');

    const fraudSchema = z.object({
      isFraudulent: z.boolean(),
      confidence: z.number().min(0).max(100),
      redFlags: z.array(z.string()),
      reasoning: z.string(),
    });

    const messages: any[] = [
      {
        role: 'user',
        content: proofImageBase64
          ? [
              {
                type: 'text',
                text: `Analyze this proof for fraud indicators:

${proofText ? `Text: ${proofText}` : ''}

Check for:
- Stock photos
- Manipulated images
- Inconsistencies
- Suspicious patterns
- Copied content

Be thorough but not overly suspicious.`,
              },
              {
                type: 'image',
                image: proofImageBase64,
              },
            ]
          : `Analyze this proof text for fraud indicators:

"${proofText}"

Check for:
- Generic descriptions
- Copied content
- Inconsistencies
- Suspicious patterns

Be thorough but not overly suspicious.`,
      },
    ];

    const result = await generateObject({
      messages,
      schema: fraudSchema,
    });

    return result;
  } catch (error) {
    console.error('[AI Proof] Fraud detection error:', error);
    return {
      isFraudulent: false,
      confidence: 0,
      redFlags: [],
      reasoning: 'Unable to analyze for fraud',
    };
  }
}
