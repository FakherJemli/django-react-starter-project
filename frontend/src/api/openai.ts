import { client } from './client';

// Local storage key for the OpenAI API key
export const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

// Local storage key for conversation state (to track if system prompt was sent)
export const CONVERSATION_STATE_KEY = 'conversation_state';

/**
 * Get the OpenAI API key from localStorage
 */
export const getOpenAIApiKey = (): string | null => {
  return localStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
};

/**
 * Check if an OpenAI API key is available in localStorage
 */
export const hasOpenAIApiKey = (): boolean => {
  return !!getOpenAIApiKey();
};

/**
 * Check if we've already sent the system prompt in this session
 */
export const isSystemPromptSent = (): boolean => {
  const state = localStorage.getItem(CONVERSATION_STATE_KEY);
  return state === 'true';
};

/**
 * Mark that we've sent the system prompt
 */
export const markSystemPromptSent = (): void => {
  localStorage.setItem(CONVERSATION_STATE_KEY, 'true');
};

/**
 * Get a thought analysis prompt based on the user's entries
 */
export const getThoughtAnalysis = async (): Promise<string> => {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }
  
  // Check if we need to send the system prompt
  const systemPromptSent = isSystemPromptSent();
  
  // Mark system prompt as sent
  if (!systemPromptSent) {
    markSystemPromptSent();
  }
  
  try {
    const response = await client.post('/openai-proxy/', {
      api_key: apiKey,
      model: 'gpt-3.5-turbo',
      max_tokens: 200, // ~50 words maximum (average English word is ~1.5 tokens)
      include_entries: true, // Signal to include user entries from the backend
      reset_conversation: !systemPromptSent, // Only reset if system prompt hasn't been sent
    });
    
    return response.data.prompt;
  } catch (error) {
    console.error('Error getting thought analysis:', error);
    throw error;
  }
};

/**
 * Make a general OpenAI API call through our proxy
 */
export const callOpenAI = async (messages: any[], maxTokens: number = 100) => {
  const apiKey = getOpenAIApiKey();
  
  if (!apiKey) {
    throw new Error('OpenAI API key not found');
  }
  
  // Check if we need to send the system prompt
  const systemPromptSent = isSystemPromptSent();
  
  // Mark system prompt as sent
  if (!systemPromptSent) {
    markSystemPromptSent();
  }
  
  try {
    const response = await client.post('/openai-proxy/', {
      api_key: apiKey,
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: maxTokens,
      reset_conversation: !systemPromptSent, // Only reset if system prompt hasn't been sent
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}; 