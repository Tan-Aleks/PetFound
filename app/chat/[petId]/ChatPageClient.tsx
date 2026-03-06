'use client'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useMessages } from '@/hooks/useMessages'
import { type Pet, supabase } from '@/lib/supabase'
import { Loader2, MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface ChatPageClientProps {
  petId: string
}

type ChatPetInfo = Pick<
  Pet,
  'id' | 'name' | 'user_id' | 'status' | 'contact_name'
>

export default function ChatPageClient({ petId }: ChatPageClientProps) {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const counterpartFromQuery = searchParams.get('with')

  const {
    messages,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markPetMessagesAsRead,
    subscribeToPetMessages,
  } = useMessages()

  const [pet, setPet] = useState<ChatPetInfo | null>(null)
  const [petLoading, setPetLoading] = useState(true)
  const [input, setInput] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSending, setIsSending] = useState(false)

  const userId = (session?.user as { id?: string } | undefined)?.id

  useEffect(() => {
    const loadPet = async () => {
      try {
        setPetLoading(true)
        const { data, error } = await supabase
          .from('pets')
          .select('id,name,user_id,status,contact_name')
          .eq('id', petId)
          .single()

        if (error) {
          throw error
        }

        setPet(data)
      } catch (err) {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить информацию об объявлении',
        )
      } finally {
        setPetLoading(false)
      }
    }

    void loadPet()
  }, [petId])

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    void fetchMessages(petId)
    return subscribeToPetMessages(petId, setSubmitError)
  }, [fetchMessages, petId, status, subscribeToPetMessages])

  useEffect(() => {
    if (!userId || messages.length === 0) {
      return
    }

    void markPetMessagesAsRead(petId, userId).catch((err) => {
      setSubmitError(err instanceof Error ? err.message : 'Ошибка чтения чата')
    })
  }, [markPetMessagesAsRead, messages, petId, userId])

  const receiverId = useMemo(() => {
    if (!pet || !userId) {
      return null
    }

    if (userId !== pet.user_id) {
      return pet.user_id
    }

    if (counterpartFromQuery) {
      return counterpartFromQuery
    }

    const lastDialogMessage = [...messages].reverse().find((message) => {
      const senderId = message.sender_id
      const receiverId = message.receiver_id
      return senderId !== userId || receiverId !== userId
    })

    if (!lastDialogMessage) {
      return null
    }

    return lastDialogMessage.sender_id === userId
      ? lastDialogMessage.receiver_id
      : lastDialogMessage.sender_id
  }, [counterpartFromQuery, messages, pet, userId])

  const handleSend = async () => {
    if (!userId || !receiverId) {
      setSubmitError('Не удалось определить получателя сообщения')
      return
    }

    setIsSending(true)
    setSubmitError('')

    try {
      await sendMessage({
        petId,
        senderId: userId,
        receiverId,
        content: input,
      })
      setInput('')
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Ошибка при отправке сообщения',
      )
    } finally {
      setIsSending(false)
    }
  }

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
                Чтобы написать владельцу объявления, выполните вход.
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
              <CardTitle>Чат по объявлению</CardTitle>
            </CardHeader>
            <CardContent>
              {petLoading ? (
                <p className="text-muted-foreground">Загружаем объявление...</p>
              ) : pet ? (
                <div className="text-sm text-muted-foreground">
                  <p>
                    Питомец:{' '}
                    <span className="font-medium text-foreground">
                      {pet.name || 'Без имени'}
                    </span>
                  </p>
                  <p>
                    Статус:{' '}
                    <span className="font-medium text-foreground">
                      {pet.status === 'lost' ? 'Пропал' : 'Найден'}
                    </span>
                  </p>
                  <p>
                    Контакт в объявлении:{' '}
                    <span className="font-medium text-foreground">
                      {pet.contact_name}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-destructive">Объявление не найдено</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Сообщения
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground">Загружаем сообщения...</p>
              ) : messages.length === 0 ? (
                <p className="text-muted-foreground">
                  Сообщений пока нет. Начните диалог первым.
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMine = message.sender_id === userId
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${
                            isMine
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p
                            className={`mt-1 text-xs ${
                              isMine
                                ? 'text-primary-foreground/80'
                                : 'text-secondary-foreground/70'
                            }`}
                          >
                            {message.created_at
                              ? new Date(message.created_at).toLocaleString(
                                  'ru-RU',
                                )
                              : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {(error || submitError) && (
                <div className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {submitError || error}
                </div>
              )}

              <div className="mt-5 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Введите сообщение..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      void handleSend()
                    }
                  }}
                />
                <Button
                  onClick={() => void handleSend()}
                  disabled={isSending || !input.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Отправить'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
