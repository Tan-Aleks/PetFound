'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Database } from '@/lib/database.types'
import { Bell, Check } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type Notification = Database['public']['Tables']['notifications']['Row']

type MatchNotificationData = {
  match_id?: string
  external_pet_id?: string
  external_source_name?: string | null
  external_source_url?: string | null
  internal_pet_id?: string
  match_key?: string
  pet_name?: string | null
  similarity_score?: number
  source_home_url?: string | null
}

type MessageNotificationData = {
  pet_id?: string
  sender_id?: string
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
      }
    }
    fetchNotifications()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PUT' })
      if (res.ok) {
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', { method: 'PUT' })
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleNotificationAction = async (id: string) => {
    if (!open) {
      return
    }

    setOpen(false)

    const notification = notifications.find((item) => item.id === id)
    if (!notification || notification.read) {
      return
    }

    await handleMarkAsRead(id)
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message_received':
        return '💬'
      case 'match_found':
        return '🎯'
      default:
        return '🔔'
    }
  }

  const getMatchNotificationData = (
    notification: Notification,
  ): MatchNotificationData | null => {
    if (!notification.data || typeof notification.data !== 'object') {
      return null
    }

    if (Array.isArray(notification.data)) {
      return null
    }

    return notification.data as MatchNotificationData
  }

  const getMessageNotificationData = (
    notification: Notification,
  ): MessageNotificationData | null => {
    if (!notification.data || typeof notification.data !== 'object') {
      return null
    }

    if (Array.isArray(notification.data)) {
      return null
    }

    return notification.data as MessageNotificationData
  }

  const formatSimilarity = (value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return null
    }

    return `${Math.round(value * 100)}% сходство`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <Card className="absolute right-0 top-full mt-2 w-80 z-50 shadow-lg">
          <div className="flex items-center justify-between p-3 border-b">
            <span className="font-semibold">Уведомления</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Прочитать все
              </Button>
            )}
          </div>
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Нет уведомлений
              </div>
            ) : (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <div
                      className={`border-b last:border-b-0 ${
                        !notification.read ? 'bg-primary/5' : ''
                      }`}
                    >
                      <div className="p-3 transition-colors hover:bg-muted/50">
                        <div className="flex gap-2">
                          <span className="text-xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="truncate text-sm font-medium">
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto px-2 py-1 text-xs"
                                  onClick={() =>
                                    handleMarkAsRead(notification.id)
                                  }
                                >
                                  Прочитано
                                </Button>
                              )}
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {notification.content}
                            </p>
                            {notification.type === 'message_received' &&
                              (() => {
                                const messageData =
                                  getMessageNotificationData(notification)

                                if (!messageData?.pet_id) {
                                  return null
                                }

                                const chatHref = messageData.sender_id
                                  ? `/chat/${messageData.pet_id}?with=${messageData.sender_id}`
                                  : `/chat/${messageData.pet_id}`

                                return (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <Link
                                      href={chatHref}
                                      className="text-xs font-medium text-primary hover:underline"
                                      onClick={() =>
                                        void handleNotificationAction(
                                          notification.id,
                                        )
                                      }
                                    >
                                      Открыть чат
                                    </Link>
                                  </div>
                                )
                              })()}
                            {notification.type === 'match_found' &&
                              (() => {
                                const matchData =
                                  getMatchNotificationData(notification)

                                if (!matchData) {
                                  return null
                                }

                                const similarityLabel = formatSimilarity(
                                  matchData.similarity_score,
                                )

                                return (
                                  <>
                                    {(similarityLabel ||
                                      matchData.external_source_name) && (
                                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                        {similarityLabel && (
                                          <span className="rounded-full bg-muted px-2 py-1">
                                            {similarityLabel}
                                          </span>
                                        )}
                                        {matchData.external_source_name && (
                                          <span className="rounded-full bg-muted px-2 py-1">
                                            {matchData.external_source_name}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {matchData.internal_pet_id && (
                                        <Link
                                          href={`/pet/${matchData.internal_pet_id}`}
                                          className="text-xs font-medium text-primary hover:underline"
                                          onClick={() =>
                                            void handleNotificationAction(
                                              notification.id,
                                            )
                                          }
                                        >
                                          Открыть объявление
                                        </Link>
                                      )}
                                      {matchData.internal_pet_id &&
                                        (matchData.match_id ||
                                          matchData.match_key) && (
                                          <Link
                                            href={`/chat/${matchData.internal_pet_id}?aiMatch=${matchData.match_id || matchData.match_key}`}
                                            className="text-xs font-medium text-primary hover:underline"
                                            onClick={() =>
                                              void handleNotificationAction(
                                                notification.id,
                                              )
                                            }
                                          >
                                            Открыть AI-чат
                                          </Link>
                                        )}
                                      {matchData.external_source_url && (
                                        <a
                                          href={matchData.external_source_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-medium text-primary hover:underline"
                                          onClick={() =>
                                            void handleNotificationAction(
                                              notification.id,
                                            )
                                          }
                                        >
                                          Открыть совпадение
                                        </a>
                                      )}
                                      {matchData.source_home_url && (
                                        <a
                                          href={matchData.source_home_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-muted-foreground hover:underline"
                                          onClick={() =>
                                            void handleNotificationAction(
                                              notification.id,
                                            )
                                          }
                                        >
                                          {matchData.external_source_name ||
                                            'Сайт источника'}
                                        </a>
                                      )}
                                    </div>
                                  </>
                                )
                              })()}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(
                                notification.created_at ??
                                  new Date().toISOString(),
                              ).toLocaleDateString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
