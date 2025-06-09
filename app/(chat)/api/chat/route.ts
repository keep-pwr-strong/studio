import { type UIMessage, LangChainAdapter } from 'ai';
import { auth, type UserType } from '@/app/(auth)/auth';
import {
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import { generateUUID, getMostRecentUserMessage } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import type { Chat } from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';
import { generateStreamingLLMResponse } from '@/lib/ai/chat-stream-executor';
import { UserIntent } from '@/lib/ai/types';

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      selectedChatModel,
      initialIntent,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
      initialIntent?: UserIntent;
    } = await request.json();

    const session = await auth();

    if (!session?.user) {
      return new ChatSDKError('unauthorized:chat').toResponse();
    }

    const userType: UserType = session.user.type;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    if (messageCount > entitlementsByUserType[userType].maxMessagesPerDay) {
      return new ChatSDKError('rate_limit:chat').toResponse();
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      console.error('No user message found');
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = userMessage.content.substring(0, 100) || 'New Chat';

      await saveChat({
        id,
        userId: session.user.id,
        title,
        visibility: 'private', // default to private
      });
    } else {
      if (chat.userId !== session.user.id) {
        return new ChatSDKError('forbidden:chat').toResponse();
      }
    }

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: userMessage.parts,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    const stream = await generateStreamingLLMResponse(
      messages,
      selectedChatModel,
      initialIntent,
    );

    const assistantId = generateUUID();

    return LangChainAdapter.toDataStreamResponse(stream, {
      callbacks: {
        onFinal: async (content) => {
          await saveMessages({
            messages: [
              {
                id: assistantId,
                chatId: id,
                role: 'assistant',
                parts: [{ type: 'text', content }],
                createdAt: new Date(),
                attachments: [],
              },
            ],
          });
        },
      },
    });
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Error in POST', error);
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  const chat = await getChatById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  const deletedChat = await deleteChatById({ id });

  return Response.json(deletedChat, { status: 200 });
}
