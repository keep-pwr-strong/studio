import { z } from 'zod';
import { modelLiteGenerative } from '@/lib/ai/providers';
import { callDigitalOceanAgent } from '@/lib/ai/digitalocean-providers';
import type { UIMessage } from 'ai';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { UserIntent } from './types'; // Import from the new file

// Schema for the intent classification output
const IntentClassificationSchema = z.object({
  intent: z.enum([
    UserIntent.RefineIdea,
    UserIntent.GenerateDesign, 
    UserIntent.GenerateTaskList, 
    UserIntent.GenerateCode,
    UserIntent.Other
  ]).describe("The classified intent of the user's messages")
});

// First LLM: classify intent
export async function classifyUserIntent(messages: UIMessage[], selectedChatModel?: string): Promise<UserIntent> {

  const systemPrompt = `
    You are a classifier.
    Given the user's recent messages, determine:
    1) Refine idea
    2) Generate design
    3) Generate task list
    4) Generate code
    5) Other
    Classify the intent based on the conversation.

    If the user's response to the question "Would you like to proceed with the code generation for these tasks?" is "Yes", then classify the intent as "Generate code".
    
    Respond with ONLY the intent name: "RefineIdea", "GenerateDesign", "GenerateTaskList", "GenerateCode", or "Other".
  `;

  const userText = messages.map(m => m.content).join("\n");

  try {
    // Use DigitalOcean agent if selected
    if (selectedChatModel === 'do-agent' && process.env.DO_AGENT_ENDPOINT && process.env.DO_AGENT_ACCESS_KEY) {
      console.log('intentManager: using DigitalOcean agent for intent classification');
      
      const agentMessages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText }
      ];
      
      const response = await callDigitalOceanAgent(agentMessages, { stream: false });
      const intentText = response.choices[0]?.message?.content?.trim() || '';
      
      // Map response to enum
      switch (intentText) {
        case 'RefineIdea': return UserIntent.RefineIdea;
        case 'GenerateDesign': return UserIntent.GenerateDesign;
        case 'GenerateTaskList': return UserIntent.GenerateTaskList;
        case 'GenerateCode': return UserIntent.GenerateCode;
        default: return UserIntent.Other;
      }
    }
    
    // Fallback to OpenAI if available
    if (process.env.OPENAI_API_KEY || process.env.OPENAI_MODEL_LITE_GENERATIVE) {
      console.log('intentManager: using OpenAI for intent classification');
      
      const structuredModel = modelLiteGenerative.withStructuredOutput(IntentClassificationSchema);
      const result = await structuredModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(userText)
      ]);
      
      return result.intent;
    }
    
    // No API keys available - skip classification
    console.log('intentManager: no API keys available, defaulting to Other intent');
    return UserIntent.Other;
    
  } catch (error) {
    console.error("Intent classification failed:", error);
    return UserIntent.Other; // Fallback to Other on error
  }
}
