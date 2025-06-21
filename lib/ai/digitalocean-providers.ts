import { createOpenAI } from '@ai-sdk/openai';
import { customProvider } from 'ai';

// DigitalOcean GenAI Agent Configuration
const DO_AGENT_ENDPOINT = process.env.DO_AGENT_ENDPOINT;
const DO_AGENT_ACCESS_KEY = process.env.DO_AGENT_ACCESS_KEY;
const OPENAI_MODEL_FULL_STREAMING = process.env.OPENAI_MODEL_FULL_STREAMING || 'gpt-4o-mini';

console.log('[DigitalOcean AI] Agent Endpoint:', DO_AGENT_ENDPOINT);
console.log('[DigitalOcean AI] Access Key configured:', !!DO_AGENT_ACCESS_KEY);

// Create custom OpenAI-compatible provider for DigitalOcean
const digitalOceanProvider = createOpenAI({
  baseURL: `${DO_AGENT_ENDPOINT}/api/v1`,
  apiKey: DO_AGENT_ACCESS_KEY,
});

// Export the agent model
export const digitalOceanAgent = digitalOceanProvider(OPENAI_MODEL_FULL_STREAMING);

// Custom provider for compatibility
export const myDigitalOceanProvider = customProvider({
  languageModels: {
    'do-agent': digitalOceanAgent,
    'do-agent-chat': digitalOceanAgent,
    'do-agent-reasoning': digitalOceanAgent,
  }
});

// Alternative direct fetch approach for more control
export async function callDigitalOceanAgent(messages: any[], options: any = {}) {
  const response = await fetch(`${DO_AGENT_ENDPOINT}/api/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DO_AGENT_ACCESS_KEY}`,
    },
    body: JSON.stringify({
      messages,
      stream: options.stream || false,
      include_functions_info: options.include_functions_info || false,
      include_retrieval_info: options.include_retrieval_info || true,
      include_guardrails_info: options.include_guardrails_info || false,
      ...options
    }),
  });

  if (!response.ok) {
    throw new Error(`DigitalOcean Agent API error: ${response.statusText}`);
  }

  return response.json();
} 