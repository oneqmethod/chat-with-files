'use client'

import type { UIMessage } from '@ai-sdk/react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import { Fragment, useCallback, useMemo, useRef, useState } from 'react'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader } from '@/components/ai-elements/loader'
import { FileWarning, MessageSquare } from 'lucide-react'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'

interface ChatClientProps {
  initialMessages: UIMessage[]
  chatId: string | null
  hasFiles: boolean
}

export function ChatClient({ initialMessages, chatId, hasFiles }: ChatClientProps) {
  const router = useRouter()
  const [inputValue, setInputValue] = useState('')
  const [actualChatId, setActualChatId] = useState<string | null>(chatId)
  const isNewChat = actualChatId === null
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

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <Conversation className="min-h-0 w-full overflow-hidden">
        <ConversationContent className="w-full overflow-x-hidden">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Start a conversation"
              description="Ask questions about your uploaded files"
              icon={<MessageSquare className="h-12 w-12" />}
            />
          ) : (
            <>
              {messages.map((message) => {
                return (
                  <Fragment key={message.id}>
                    {message.parts?.map((part, index) => {
                      if (part.type === 'text') {
                        return (
                          <Message key={`${message.id}-${index}`} from={message.role}>
                            <MessageContent>
                              <MessageResponse>{part.text}</MessageResponse>
                            </MessageContent>
                          </Message>
                        )
                      }

                      if (part.type === 'reasoning') {
                        return (
                          <Reasoning
                            key={`${message.id}-reasoning-${index}`}
                            className="w-full"
                            isStreaming={
                              status === 'streaming' &&
                              index === message.parts.length - 1 &&
                              message.id === messages.at(-1)?.id
                            }
                          >
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        )
                      }

                      return (
                        <pre key={`${message.id}-part-${index}`}>
                          {JSON.stringify(part, null, 2)}
                        </pre>
                      )
                    })}
                  </Fragment>
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
        {!hasFiles && (
          <Alert className="mb-4">
            <FileWarning className="h-4 w-4" />
            <AlertTitle>No files available</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Upload files to continue chatting</span>
              <Button asChild size="sm">
                <Link href="/files">Upload Files</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
        <PromptInput globalDrop multiple onSubmit={handleSubmit}>
          <PromptInputAttachments>
            {(attachment) => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputBody>
            <PromptInputTextarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={hasFiles ? 'Ask about your files...' : 'Upload files to chat...'}
              disabled={!hasFiles}
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
            <PromptInputSubmit status={status} disabled={!hasFiles} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
