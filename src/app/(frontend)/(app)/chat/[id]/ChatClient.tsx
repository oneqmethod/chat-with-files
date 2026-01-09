'use client'

import type { UIMessage } from '@ai-sdk/react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationSource,
} from '@/components/ai-elements/inline-citation'
import { HoverCardTrigger } from '@/components/ui/hover-card'
import { Badge } from '@/components/ui/badge'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { Loader } from '@/components/ai-elements/loader'
import { MessageSquare } from 'lucide-react'

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

interface ChatClientProps {
  initialMessages: UIMessage[]
  chatId: string | null
}

export function ChatClient({ initialMessages, chatId }: ChatClientProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [actualChatId, setActualChatId] = useState<string | null>(chatId)
  const isNewChat = actualChatId === null
  const initializedRef = useRef(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { chatId: actualChatId || undefined },
      }),
    [actualChatId],
  )

  const { messages, status, sendMessage, setMessages } = useChat({
    transport,
    onData: (dataPart) => {
      if (dataPart.type === 'data-chat-id' && isNewChat) {
        const chatIdData = dataPart.data as { chatId: string }
        if (chatIdData?.chatId) {
          window.history.replaceState(null, '', `/chat/${chatIdData.chatId}`)
          setActualChatId(chatIdData.chatId)
        }
      }
    },
    messages: initialMessages,
    onFinish: () => {
      router.refresh()
    },
  })

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (message.text.trim() || message.files.length > 0) {
        sendMessage({
          text: message.text,
          files: message.files.length > 0 ? message.files : undefined,
        })
        setInputValue('')
      }
    },
    [sendMessage],
  )

  const isLoading = status === 'streaming' || status === 'submitted'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Conversation className="min-h-0">
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

      <div className="border-t bg-background p-4">
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your files..."
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputSpeechButton textareaRef={textareaRef} />
            </PromptInputTools>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
