import type { UIMessage } from 'ai';
import type { Session } from 'next-auth';

// External libraries
import { AIMessage, AIMessageChunk, HumanMessage, SystemMessage } from '@langchain/core/messages';


// Internal absolute imports
import { logContentForDebug, logStreamForDebug } from '@/lib/utils/debugUtils';

// Internal relative imports
import { classifyUserIntent } from './intentManager';
import { UserIntent } from './types';
import { basicPrompt, stage1IdeasPrompt, stage2DesignPrompt, stage3TaskListPrompt, stageProgessionPrompt, stage4CodeGenerationPrompt } from './prompts';
import type { CodeFile } from '../code/generate-code-project';
import { modelFullStreaming, digitalOceanChatModel } from './providers';
import { callDigitalOceanAgent } from './digitalocean-providers';


interface ExecuteChatStreamParams {
  dataStream: any; // Using 'any' for now as CoreDataStream seems incorrect
  session: Session;
  messages: UIMessage[];
  selectedChatModel: string;
  systemPrompt: string;
  userMessage: UIMessage;
  id: string; // chat id
  isProductionEnvironment: boolean;
}

// Convert UI messages to LangChain message format
function convertUIMessagesToLangChainMessages(messages: UIMessage[]) {
  return messages.map(message => {
    const content = typeof message.content === 'string' 
      ? message.content 
      : JSON.stringify(message.content);
      
    if (message.role === 'user') {
      return new HumanMessage(content);
    } else if (message.role === 'assistant') {
      return new AIMessage(content);
    }
    // Skip system messages as we'll add a separate system message
    return null;
  }).filter((message): message is HumanMessage | AIMessage => message !== null); // Type guard to remove null values
}


export async function generateStreamingLLMResponse(
  messages: UIMessage[], 
  selectedChatModel?: string,
  initialIntent?: UserIntent
) {

  console.log('chat-stream-executor: initialIntent provided:', initialIntent ?? 'no initial intent provided');
  // Determine intent: Use initialIntent if provided, otherwise classify
  let intent: UserIntent;
  if (initialIntent) {
    intent = initialIntent;
  } else {
    intent = await classifyUserIntent(messages);
  }
  console.log('chat-stream-executor: intent used:', intent);
  

  // Set the system prompt based on the user intent using explicit if-else
  let systemPrompt = basicPrompt;
  if (intent === UserIntent.RefineIdea) {
    systemPrompt = await stage1IdeasPrompt();
  } else if (intent === UserIntent.GenerateDesign) {
    systemPrompt = await stage2DesignPrompt();
  } else if (intent === UserIntent.GenerateTaskList) {
    systemPrompt = await stage3TaskListPrompt();
  } else if (intent === UserIntent.GenerateCode) {
    systemPrompt = await stage4CodeGenerationPrompt();
  } // else, keep the basicPrompt

  // Add the stage progression prompt to the system prompt
  systemPrompt = systemPrompt + stageProgessionPrompt;

  logContentForDebug(systemPrompt, `chat-stream-executor-system-prompt.txt`, 'Chat Stream Executor - System Prompt');

  // Choose the appropriate model based on selectedChatModel
  const useDigitalOceanAgent = selectedChatModel === 'do-agent';
  
  try {
    let llmResponseStream: ReadableStream<any>;
    
    if (useDigitalOceanAgent) {
      // Use DigitalOcean Agent
      console.log('chat-stream-executor: using DigitalOcean Agent');
      
      // Convert UIMessages to the format expected by DO Agent
      const agentMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];
      
      if (intent === UserIntent.GenerateCode) {
        try {
          const response = await callDigitalOceanAgent(agentMessages, {
            include_retrieval_info: true,
            include_functions_info: true
          });
          
          const generatedCode = response.choices[0]?.message?.content || '';
          console.log('chat-stream-executor: DO agent code generated, length:', generatedCode.length);
          
          logContentForDebug(generatedCode, `chat-stream-executor-do-agent-code.txt`, 'DigitalOcean Agent Generated Code');
          
          const responseText = "Here is your generated code:\n\n" + generatedCode + "\n\nYou can copy this code and use it in your project.";
          
          llmResponseStream = new ReadableStream({
            start(controller) {
              controller.enqueue(responseText);
              controller.close();
            }
          });
        } catch (err) {
          console.log('chat-stream-executor: error with DO agent code generation', err);
          const responseText = "Unable to generate code due to DigitalOcean Agent error.\n\nPlease try again or rephrase your request.";
          llmResponseStream = new ReadableStream({
            start(controller) {
              controller.enqueue(responseText);
              controller.close();
            }
          });
        }
      } else {
        // For non-code generation, use streaming with DO agent
        llmResponseStream = await digitalOceanChatModel.stream([
          new SystemMessage(systemPrompt),
          ...convertUIMessagesToLangChainMessages(messages)
        ]);
      }
    } else {
      // Use existing OpenAI logic
      const messageHistory = [
        new SystemMessage(systemPrompt),
        ...convertUIMessagesToLangChainMessages(messages)
      ];

      if (intent === UserIntent.GenerateCode) {
        let responseText;
        try {
          console.log('chat-stream-executor: invoking model to generate code');
          const codeChunk = await modelFullStreaming.invoke(messageHistory);
          console.log('chat-stream-executor: code generated');
          
          let generatedCode = codeChunk.content?.toString() ?? '';
          console.log('chat-stream-executor: code length:', generatedCode.length);
          
          logContentForDebug(generatedCode, `chat-stream-executor-generated-code.txt`, 'Generated Code');
          
          responseText = "Here is your generated code:\n\n" + generatedCode + "\n\nYou can copy this code and use it in your project.";

        } catch (err) {
          console.log('chat-stream-executor: error generating code', err);
          responseText = "Unable to generate code due to AI response processing error.\n\nPlease try again or rephrase your request.";
        }
        
        llmResponseStream = new ReadableStream({
          start(controller) {
            controller.enqueue(responseText);
            controller.close();
          }
        });
      } else {
        llmResponseStream = await modelFullStreaming.stream(messageHistory);
      }
    }

    const [llmResponseStreamCopy1, llmResponseStreamCopy2] = llmResponseStream.tee();
    // log the stream copy without holding up your response
    logStreamForDebug(
      llmResponseStreamCopy1, 
      `llm-stream-${Date.now()}.txt`,
      'Raw LLM response'
    );

    return llmResponseStreamCopy2;

  } catch (error) {
    console.error("LLM response generation failed:", error);
    throw error; // Rethrow to be handled by the POST handler
  }
}




