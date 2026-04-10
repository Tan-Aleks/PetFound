'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAiMatchChat } from '@/hooks/useAiMatchChat'
import { Bot, Loader2, MapPin, Shield, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

type AiMatchChatPanelProps = {
  matchId: string
}

export default function AiMatchChatPanel({ matchId }: AiMatchChatPanelProps) {
  const {
    context,
    error,
    fetchThread,
    loading,
    messages,
    sending,
    sendMessage,
    suggestions,
  } = useAiMatchChat()
  const [input, setInput] = useState('')

  useEffect(() => {
    void fetchThread(matchId)
  }, [fetchThread, matchId])

  const handleSend = async (value: string) => {
    const text = value.trim()
    if (!text) {
      return
    }

    try {
      await sendMessage(matchId, text)
      setInput('')
    } catch {
      return
    }
  }

  return (
    <Card className="border-sky-200/70 bg-gradient-to-br from-sky-50/80 via-background to-cyan-50/50 dark:border-sky-900/60 dark:from-sky-950/20 dark:via-background dark:to-cyan-950/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bot className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          AI-чат по совпадению
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <p className="text-sm text-muted-foreground">Загружаем AI-чат...</p>
        ) : (
          <>
            {context && (
              <div className="grid gap-3 rounded-xl border border-sky-200/70 bg-background/80 p-4 text-sm dark:border-sky-900/60">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
                    <Sparkles className="mr-1 inline h-3.5 w-3.5" />
                    {Math.round(context.similarityScore * 100)}% сходство
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1">
                    {context.source?.name || 'Внешний источник'}
                  </span>
                </div>
                <div className="grid gap-1 text-sm text-muted-foreground">
                  <p>
                    Питомец:{' '}
                    <span className="font-medium text-foreground">
                      {context.internalPet.name ||
                        context.externalPet.name ||
                        'Без имени'}
                    </span>
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Внешний район: {context.externalPet.district}
                  </p>
                  <p>
                    Ссылка:{' '}
                    <a
                      className="text-primary hover:underline"
                      href={context.externalPet.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      открыть внешнее объявление
                    </a>
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <p className="flex items-center gap-2 font-medium">
                <Shield className="h-4 w-4" />
                Этот AI отвечает только по совпадению
              </p>
              <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-200/80">
                Можно спрашивать только про сайт, ссылку, локацию, контакты и
                сведения о питомце. Произвольные задачи и посторонние вопросы AI
                не выполняет.
              </p>
            </div>

            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Сообщений пока нет.
                </p>
              ) : (
                messages.map((message) => {
                  const isAssistant = message.role === 'assistant'

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isAssistant
                            ? 'border border-sky-200/70 bg-white text-foreground dark:border-sky-900/60 dark:bg-slate-950/70'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        {isAssistant && (
                          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700 dark:text-sky-300">
                            AI-помощник
                          </p>
                        )}
                        <p>{message.content}</p>
                        <p
                          className={`mt-2 text-xs ${
                            isAssistant
                              ? 'text-muted-foreground'
                              : 'text-primary-foreground/80'
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
                })
              )}
            </div>

            <div className="space-y-3 rounded-xl border border-border/70 bg-background/80 p-4">
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSend(suggestion)}
                    disabled={sending}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Спросите только про сайт, контакты, локацию или питомца"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void handleSend(input)
                    }
                  }}
                />
                <Button
                  onClick={() => void handleSend(input)}
                  disabled={sending || !input.trim()}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Спросить'
                  )}
                </Button>
              </div>

              {error && (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
