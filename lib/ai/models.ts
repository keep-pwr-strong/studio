export const DEFAULT_CHAT_MODEL: string = 'do-agent';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Gemini by Google',
  },
  {
    id: 'claude',
    name: 'Claude',
    description: 'Claude AI by Anthropic',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    description: 'ChatGPT by OpenAI',
  },
  {
    id: 'do-agent',
    name: 'DigitalOcean Agent',
    description: 'Your DigitalOcean AI Agent with custom knowledge base',
  },
];
