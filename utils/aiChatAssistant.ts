import { hustleAI } from './hustleAI';
import { z } from 'zod';

export async function translateMessage(
  message: string,
  targetLanguage: 'en' | 'es' | 'fr' | 'de' | 'zh'
): Promise<string> {
  try {
    console.log('[AI Chat] Translating message to', targetLanguage);

    const languageNames = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      zh: 'Chinese',
    };

    const response = await hustleAI.chat('system', `Translate this message to ${languageNames[targetLanguage]}:

"${message}"

Return only the translation, nothing else. Keep the tone and meaning intact.`);

    return response.response.trim();
  } catch (error) {
    console.error('[AI Chat] Translation error:', error);
    return message;
  }
}

export async function detectLanguage(message: string): Promise<string> {
  try {
    console.log('[AI Chat] Detecting language');

    const response = await hustleAI.chat('system', `Detect the language of this message:

"${message}"

Return JSON: {language: string, confidence: number}`);

    const result = JSON.parse(response.response);

    return result.language;
  } catch (error) {
    console.error('[AI Chat] Language detection error:', error);
    return 'en';
  }
}

export async function generateSmartReply(
  conversationHistory: { sender: string; message: string }[],
  context: { taskTitle: string; taskCategory: string }
): Promise<string[]> {
  try {
    console.log('[AI Chat] Generating smart replies');

    const conversation = conversationHistory
      .slice(-5)
      .map((m) => `${m.sender}: ${m.message}`)
      .join('\n');

    const response = await hustleAI.chat('system', `Generate 3 quick reply suggestions for this conversation:

Task: ${context.taskTitle}
Category: ${context.taskCategory}

Recent Messages:
${conversation}

Provide 3 short, helpful replies (5-10 words each). Be professional and friendly.

Return JSON: {replies: string[]}`);

    const result = JSON.parse(response.response);

    return result.replies;
  } catch (error) {
    console.error('[AI Chat] Smart reply error:', error);
    return ['Sounds good!', 'When can we start?', 'Thanks for the update!'];
  }
}

export async function analyzeSentiment(message: string): Promise<{
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  flags: string[];
}> {
  try {
    console.log('[AI Chat] Analyzing sentiment');

    const response = await hustleAI.chat('system', `Analyze the sentiment of this message:

"${message}"

Detect:
- Overall sentiment (positive/neutral/negative)
- Confidence level (0-1)
- Any red flags (harassment, scams, inappropriate content)

Be accurate and helpful for safety.

Return JSON: {sentiment: 'positive' | 'neutral' | 'negative', confidence: number, flags: string[]}`);

    const result = JSON.parse(response.response);

    return result;
  } catch (error) {
    console.error('[AI Chat] Sentiment analysis error:', error);
    return {
      sentiment: 'neutral',
      confidence: 0.5,
      flags: [],
    };
  }
}

export async function generateIcebreaker(
  taskTitle: string,
  taskCategory: string,
  workerName: string
): Promise<string> {
  try {
    console.log('[AI Chat] Generating icebreaker');

    const response = await hustleAI.chat('system', `Generate a friendly icebreaker message for this task:

Task: ${taskTitle}
Category: ${taskCategory}
Worker: ${workerName}

Create a warm, professional opening message (1-2 sentences). Be friendly and set a positive tone.`);

    return response.response.trim();
  } catch (error) {
    console.error('[AI Chat] Icebreaker error:', error);
    return `Hi ${workerName}! Thanks for accepting this task. Looking forward to working with you!`;
  }
}

export async function summarizeConversation(
  messages: { sender: string; message: string; timestamp: string }[]
): Promise<string> {
  try {
    console.log('[AI Chat] Summarizing conversation');

    const conversation = messages
      .map((m) => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.sender}: ${m.message}`)
      .join('\n');

    const response = await hustleAI.chat('system', `Summarize this conversation in 2-3 sentences:

${conversation}

Focus on key decisions, agreements, and action items.`);

    return response.response.trim();
  } catch (error) {
    console.error('[AI Chat] Summarization error:', error);
    return 'Conversation summary unavailable.';
  }
}

export async function detectSpamOrScam(message: string): Promise<{
  isSpam: boolean;
  isSuspicious: boolean;
  reasoning: string;
}> {
  try {
    console.log('[AI Chat] Detecting spam/scam');

    const response = await hustleAI.chat('system', `Analyze this message for spam or scam indicators:

"${message}"

Check for:
- Spam patterns
- Scam attempts
- Phishing
- Inappropriate requests
- External payment requests

Provide clear reasoning.

Return JSON: {isSpam: boolean, isSuspicious: boolean, reasoning: string}`);

    const result = JSON.parse(response.response);

    return result;
  } catch (error) {
    console.error('[AI Chat] Spam detection error:', error);
    return {
      isSpam: false,
      isSuspicious: false,
      reasoning: 'Unable to analyze',
    };
  }
}
