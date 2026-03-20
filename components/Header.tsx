'use client'

import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Globe, Heart, Menu, Search, User } from 'lucide-react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const NotificationDropdown = dynamic(
  () => import('@/components/NotificationDropdown'),
  { ssr: false },
)

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              ПетПоиск Москва
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/search"
              className="flex items-center space-x-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span>Поиск</span>
            </Link>
            <Link
              href="/external"
              className="flex items-center space-x-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              <Globe className="h-4 w-4" />
              <span>Источники</span>
            </Link>
            <Link
              href="/create"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Разместить объявление
            </Link>
            {session && (
              <Link
                href="/chat"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Диалоги
              </Link>
            )}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {session ? (
              <>
                <NotificationDropdown />
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    {session.user?.name || 'Профиль'}
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Войти</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Регистрация</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
