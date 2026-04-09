'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Database } from '@/lib/database.types'
import { Bell, Check } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type Notification = Database['public']['Tables']['notifications']['Row']

type MatchNotificationData = {
  external_pet_id?: string
  external_source_name?: string | null
  external_source_url?: string | null
  internal_pet_id?: string
  match_key?: string
  pet_name?: string | null
  similarity_score?: number
  source_home_url?: string | null
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
                      <button
                        type="button"
                        className="w-full cursor-pointer p-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => {
                          if (!notification.read) {
                            handleMarkAsRead(notification.id)
                          }
                        }}
                      >
                        <div className="flex gap-2">
                          <span className="text-xl">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {notification.title}
                            </p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {notification.content}
                            </p>
                            {notification.type === 'match_found' &&
                              (() => {
                                const matchData =
                                  getMatchNotificationData(notification)

                                if (!matchData?.external_source_url) {
                                  return null
                                }

                                return (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    <a
                                      href={matchData.external_source_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-medium text-primary hover:underline"
                                      onClick={(event) =>
                                        event.stopPropagation()
                                      }
                                    >
                                      Открыть совпадение
                                    </a>
                                    {matchData.source_home_url && (
                                      <a
                                        href={matchData.source_home_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:underline"
                                        onClick={(event) =>
                                          event.stopPropagation()
                                        }
                                      >
                                        {matchData.external_source_name ||
                                          'Сайт источника'}
                                      </a>
                                    )}
                                  </div>
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
                      </button>
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
