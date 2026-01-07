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
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputButton,
} from '@/components/ai-elements/prompt-input'
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationSource,
} from '@/components/ai-elements/inline-citation'
import { HoverCardTrigger } from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { Loader } from '@/components/ai-elements/loader'
import { MessageSquare, Send } from 'lucide-react'
import type { PromptInputMessage } from '@/components/ai-elements/prompt-input'

type SourceUrlPart = {
  type: 'source-url'
  sourceId: string
  url: string
  title?: string
}

type SourceDocumentPart = {
  type: 'source-document'
  sourceId: string
  mediaType: string
  title: string
  filename?: string
}

type SourcePart = SourceUrlPart | SourceDocumentPart

type ReasoningPart = {
  type: 'reasoning'
  text: string
}

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
            type DbMessage = {
              id: string
              role: string
              content: string
              sources?: Array<{
                sourceType: 'url' | 'document'
                url?: string
                title?: string
                filename?: string
              }>
            }
            const loadedMessages = data.docs.map((msg: DbMessage) => {
              const parts: Array<
                { type: 'text'; text: string } | SourceUrlPart | SourceDocumentPart
              > = [{ type: 'text' as const, text: msg.content }]

              if (msg.sources?.length) {
                for (const source of msg.sources) {
                  if (source.sourceType === 'url' && source.url) {
                    parts.push({
                      type: 'source-url' as const,
                      sourceId: `${msg.id}-${source.url}`,
                      url: source.url,
                      title: source.title,
                    })
                  } else if (source.sourceType === 'document') {
                    parts.push({
                      type: 'source-document' as const,
                      sourceId: `${msg.id}-${source.title || source.filename}`,
                      mediaType: 'application/octet-stream',
                      title: source.title || source.filename || 'Document',
                      filename: source.filename,
                    })
                  }
                }
              }

              return {
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                parts,
              }
            })
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
            <>
              {messages.map((message) => {
                const sources = message.parts?.filter(
                  (p): p is SourcePart => p.type === 'source-url' || p.type === 'source-document',
                )
                return (
                  <Message key={message.id} from={message.role}>
                    <MessageContent>
                      {message.parts?.map((part, i) => {
                        const isLastMessage = message.id === messages[messages.length - 1]?.id
                        const isStreamingThis = isLoading && isLastMessage

                        if (part.type === 'reasoning') {
                          const reasoningPart = part as ReasoningPart
                          return (
                            <Reasoning
                              key={i}
                              className="w-full"
                              isStreaming={isStreamingThis && i === message.parts!.length - 1}
                            >
                              <ReasoningTrigger />
                              <ReasoningContent>{reasoningPart.text}</ReasoningContent>
                            </Reasoning>
                          )
                        }

                        if (part.type === 'text') {
                          return part.text || isStreamingThis ? (
                            <MessageResponse key={i}>{part.text}</MessageResponse>
                          ) : (
                            <Loader key={i} />
                          )
                        }

                        return null
                      })}
                      {sources && sources.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {sources.map((source, i) => (
                            <InlineCitation key={source.sourceId || i}>
                              <InlineCitationCard>
                                {source.type === 'source-url' ? (
                                  <>
                                    <InlineCitationCardTrigger sources={[source.url]} />
                                    <InlineCitationCardBody>
                                      <div className="p-3">
                                        <InlineCitationSource
                                          title={source.title}
                                          url={source.url}
                                        />
                                      </div>
                                    </InlineCitationCardBody>
                                  </>
                                ) : (
                                  <>
                                    <HoverCardTrigger asChild>
                                      <Badge className="ml-1 rounded-full" variant="secondary">
                                        {source.filename || source.title}
                                      </Badge>
                                    </HoverCardTrigger>
                                    <InlineCitationCardBody>
                                      <div className="p-3">
                                        <InlineCitationSource
                                          title={source.title}
                                          description={source.filename}
                                        />
                                      </div>
                                    </InlineCitationCardBody>
                                  </>
                                )}
                              </InlineCitationCard>
                            </InlineCitation>
                          ))}
                        </div>
                      )}
                    </MessageContent>
                  </Message>
                )
              })}
              {status === 'submitted' && (
                <Message from="assistant">
                  <MessageContent>
                    <Loader />
                  </MessageContent>
                </Message>
              )}
            </>
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
