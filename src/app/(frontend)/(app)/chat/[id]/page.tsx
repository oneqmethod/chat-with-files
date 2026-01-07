'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputButton,
} from '@/components/ai-elements/prompt-input'
import { Loader } from '@/components/ai-elements/loader'
import { MessageSquare, Send } from 'lucide-react'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'

export default function ChatPage() {
  const params = useParams()
  const chatId = params.id as string
  const isNewChat = chatId === 'new'
  const [inputValue, setInputValue] = useState('')

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { chatId: isNewChat ? undefined : chatId },
      }),
    [chatId, isNewChat],
  )

  const { messages, status, sendMessage, setMessages } = useChat({
    transport,
  })

  useEffect(() => {
    if (!isNewChat) {
      fetch(`/api/messages?where[chat][equals]=${chatId}&sort=createdAt`)
        .then((res) => res.json())
        .then((data) => {
          if (data.docs) {
            const loadedMessages = data.docs.map(
              (msg: { id: string; role: string; content: string }) => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                parts: [{ type: 'text' as const, text: msg.content }],
              }),
            )
            setMessages(loadedMessages)
          }
        })
        .catch(console.error)
    }
  }, [chatId, isNewChat, setMessages])

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (message.text.trim()) {
        sendMessage({ text: message.text })
        setInputValue('')
      }
    },
    [sendMessage],
  )

  function getMessageContent(message: (typeof messages)[0]): string {
    return (
      message.parts
        ?.filter((part): part is { type: 'text'; text: string } => part.type === 'text')
        .map((part) => part.text)
        .join('') || ''
    )
  }

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex h-full flex-col">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start a conversation"
              description="Ask questions about your uploaded files"
              icon={<MessageSquare className="h-12 w-12" />}
            />
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.role === 'assistant' &&
                  isLoading &&
                  message.id === messages[messages.length - 1]?.id &&
                  !getMessageContent(message) ? (
                    <Loader />
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      {getMessageContent(message)}
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t p-4">
        <PromptInput onSubmit={handleSubmit}>
          <PromptInputTextarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about your files..."
          />
          <PromptInputButton type="submit" disabled={!inputValue.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </PromptInputButton>
        </PromptInput>
      </div>
    </div>
  )
}
