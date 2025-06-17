import { ChatOpenAI } from '@langchain/openai';
import { openai } from '@ai-sdk/openai';

import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';

// Import DigitalOcean GenAI providers
import { digitalOceanAgent } from './digitalocean-providers';

const OPENAI_MODEL_FULL_STREAMING = process.env.OPENAI_MODEL_FULL_STREAMING;
const OPENAI_MODEL_LITE_GENERATIVE = process.env.OPENAI_MODEL_LITE_GENERATIVE;

console.log('[AI Providers] OPENAI_MODEL_FULL_STREAMING:', OPENAI_MODEL_FULL_STREAMING);
console.log('[AI Providers] OPENAI_MODEL_LITE_GENERATIVE:', OPENAI_MODEL_LITE_GENERATIVE);

// Higher quality, streaming model
export const modelFullStreaming = new ChatOpenAI({
  streaming: true,
  model: OPENAI_MODEL_FULL_STREAMING,
  cache: true,
  modelKwargs: { max_tokens: 16000 },
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  }
});

// Fast, inexpensive, non-streaming model.
export const modelLiteGenerative = new ChatOpenAI({
  streaming: false, // Switch to non-streaming for classification since we only need the final result
  model: OPENAI_MODEL_LITE_GENERATIVE,
  cache: true,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  }
});

// DigitalOcean GenAI Agent as LangChain-compatible model
export const digitalOceanChatModel = new ChatOpenAI({
  streaming: true,
  model: 'gpt-3.5-turbo', // Model is handled by the agent
  cache: true,
  modelKwargs: { max_tokens: 16000 },
  configuration: {
    baseURL: `${process.env.DO_AGENT_ENDPOINT}/api/v1`,
    apiKey: process.env.DO_AGENT_ACCESS_KEY,
  }
});

export const myProvider = customProvider({
  languageModels: {
    'chat-model': openai('OPENAI_MODEL_LITE_GENERATIVE'),
    'chat-model-reasoning': wrapLanguageModel({
      model: openai('OPENAI_MODEL_LITE_GENERATIVE'),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
    'title-model': openai('OPENAI_MODEL_LITE_GENERATIVE'),
    'artifact-model': openai('OPENAI_MODEL_LITE_GENERATIVE'),
    // Add DigitalOcean GenAI agent models
    'do-agent': digitalOceanAgent,
    'do-agent-reasoning': wrapLanguageModel({
      model: digitalOceanAgent,
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    }),
  }
});