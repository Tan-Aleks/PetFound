'use client'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAiMatchChat } from '@/hooks/useAiMatchChat'
import { useMessages } from '@/hooks/useMessages'
import { Bot, MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useMemo } from 'react'

export default function ChatListPageClient() {
  const { data: session, status } = useSession()
  const { conversations, conversationsLoading, error, fetchConversations } =
    useMessages()
  const {
    conversations: aiConversations,
    conversationsLoading: aiConversationsLoading,
    error: aiError,
    fetchConversations: fetchAiConversations,
  } = useAiMatchChat()

  const userId = (session?.user as { id?: string } | undefined)?.id

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      void fetchConversations(userId)
      void fetchAiConversations()
    }
  }, [fetchAiConversations, fetchConversations, status, userId])

  const allConversations = useMemo(
    () =>
      [...aiConversations, ...conversations].sort((a, b) =>
        (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''),
      ),
    [aiConversations, conversations],
  )

  const combinedError = error || aiError
  const isLoading = conversationsLoading || aiConversationsLoading

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Нужен вход в аккаунт</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Чтобы открыть список диалогов, выполните вход.
              </p>
              <Link href="/login">
                <Button>Войти</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Диалоги
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Загружаем диалоги...</p>
              ) : combinedError ? (
                <p className="text-destructive">{combinedError}</p>
              ) : allConversations.length === 0 ? (
                <p className="text-muted-foreground">
                  Диалогов пока нет. Перейдите в объявление и нажмите
                  &quot;Написать&quot;.
                </p>
              ) : (
                <div className="space-y-3">
                  {allConversations.map((conversation) => (
                    <Link
                      key={
                        'kind' in conversation && conversation.kind === 'ai'
                          ? `ai:${conversation.matchId}`
                          : conversation.key
                      }
                      href={
                        'kind' in conversation && conversation.kind === 'ai'
                          ? `/chat/${conversation.petId}?aiMatch=${conversation.matchId}`
                          : `/chat/${conversation.petId}?with=${conversation.counterpartId}`
                      }
                      className="block rounded-xl border border-border/70 bg-card/70 p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {'kind' in conversation &&
                            conversation.kind === 'ai' ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                                <Bot className="h-3.5 w-3.5" />
                                AI
                              </span>
                            ) : null}
                            <p className="font-semibold text-foreground">
                              {conversation.petName}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {'kind' in conversation &&
                            conversation.kind === 'ai'
                              ? `Собеседник: ${conversation.title} · ${conversation.sourceName} · ${conversation.similarityPercent}% сходство`
                              : `Собеседник: ${conversation.counterpartName}`}
                          </p>
                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            {conversation.lastMessage}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {conversation.lastMessageAt
                              ? new Date(
                                  conversation.lastMessageAt,
                                ).toLocaleString('ru-RU')
                              : ''}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="mt-2 inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
