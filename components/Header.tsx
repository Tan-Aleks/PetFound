'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, Heart, User, Menu } from 'lucide-react'

export default function Header() {
  return (
    <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              ПетПоиск Москва
            </span>
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/search" 
              className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <Search className="h-4 w-4" />
              <span>Поиск</span>
            </Link>
            <Link 
              href="/create" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Разместить объявление
            </Link>
            <Link 
              href="/found" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Найденные
            </Link>
            <Link 
              href="/volunteers" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Волонтеры
            </Link>
          </nav>

          {/* Кнопки авторизации */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Войти
            </Button>
            <Button size="sm">
              Регистрация
            </Button>
          </div>

          {/* Мобильное меню */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}