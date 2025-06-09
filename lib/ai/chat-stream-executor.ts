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
import { modelFullStreaming } from './providers';


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

  // Prepend system prompt to the message history
  const messageHistory = [
    new SystemMessage(systemPrompt),
    ...convertUIMessagesToLangChainMessages(messages)
  ];



  try {
    
    
    // Get the raw stream from the model
    let llmResponseStream: ReadableStream<any>;
    if (intent === UserIntent.GenerateCode) {
      let responseText;
      try {
        console.log('chat-stream-executor: invoking model to generate code');
        const codeChunk = await modelFullStreaming.invoke(messageHistory);
        console.log('chat-stream-executor: code generated');
        
        let generatedCode = codeChunk.content?.toString() ?? '';
        console.log('chat-stream-executor: code length:', generatedCode.length);
        
        logContentForDebug(generatedCode, `chat-stream-executor-generated-code.txt`, 'Generated Code');
        
        // The generated code is already in the correct markdown format.
        // There is no need to wrap it in another code block.
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

    // Todo: filter out backticks here?
      

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




