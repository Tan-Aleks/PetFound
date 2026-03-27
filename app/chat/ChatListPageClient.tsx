'use client'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMessages } from '@/hooks/useMessages'
import { MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useEffect } from 'react'

export default function ChatListPageClient() {
  const { data: session, status } = useSession()
  const { conversations, conversationsLoading, error, fetchConversations } =
    useMessages()

  const userId = (session?.user as { id?: string } | undefined)?.id

  useEffect(() => {
    if (status === 'authenticated' && userId) {
      void fetchConversations(userId)
    }
  }, [fetchConversations, status, userId])

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
              {conversationsLoading ? (
                <p className="text-muted-foreground">Загружаем диалоги...</p>
              ) : error ? (
                <p className="text-destructive">{error}</p>
              ) : conversations.length === 0 ? (
                <p className="text-muted-foreground">
                  Диалогов пока нет. Перейдите в объявление и нажмите
                  &quot;Написать&quot;.
                </p>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conversation) => (
                    <Link
                      key={conversation.key}
                      href={`/chat/${conversation.petId}?with=${conversation.counterpartId}`}
                      className="block rounded-xl border border-border/70 bg-card/70 p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            {conversation.petName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Собеседник: {conversation.counterpartName}
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
