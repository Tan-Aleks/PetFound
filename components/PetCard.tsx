'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Calendar,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface PetCardProps {
  id: string
  name: string
  type: 'dog' | 'cat' | 'small'
  breed?: string
  color: string
  size: 'small' | 'medium' | 'large'
  district: string
  date: string
  status: 'lost' | 'found'
  photos: string[]
  description: string
  contact: {
    name: string
    phone: string
  }
  reward?: number
  ai_similarity?: number
}

const typeLabels = {
  dog: 'Собака',
  cat: 'Кошка',
  small: 'Мелкое животное',
}

const sizeLabels = {
  small: 'Мелкий',
  medium: 'Средний',
  large: 'Крупный',
}

export default function PetCard({
  id,
  name,
  type,
  breed,
  color,
  size,
  district,
  date,
  status,
  photos,
  description,
  contact,
  reward,
  ai_similarity,
}: PetCardProps) {
  const statusColor = status === 'lost' ? 'text-red-600' : 'text-green-600'
  const statusBg =
    status === 'lost'
      ? 'bg-red-50 dark:bg-red-900/20'
      : 'bg-green-50 dark:bg-green-900/20'
  const statusText = status === 'lost' ? 'Пропал' : 'Найден'

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        {photos.length > 0 && photos[0] ? (
          <div className="relative h-48 w-full">
            <Image
              src={photos[0]}
              alt={`${name} - ${typeLabels[type]}`}
              fill
              className="object-cover"
            />
            {photos.length > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                +{photos.length - 1} фото
              </div>
            )}
          </div>
        ) : (
          <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Статус */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${statusBg} ${statusColor}`}
        >
          {statusText}
        </div>

        {/* Вознаграждение */}
        {reward && status === 'lost' && (
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
            Вознаграждение: {reward.toLocaleString()} ₽
          </div>
        )}

        {/* AI Similarity Badge */}
        {ai_similarity !== undefined && (
          <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {ai_similarity}% сходство
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Основная информация */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
              {name || 'Без имени'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {typeLabels[type]}
              {breed && ` • ${breed}`}
              {` • ${sizeLabels[size]}`}
            </p>
          </div>

          {/* Характеристики */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <span className="font-medium">Окрас:</span>
              <span className="ml-2">{color}</span>
            </div>
          </div>

          {/* Локация и дата */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{district}</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{new Date(date).toLocaleDateString('ru-RU')}</span>
            </div>
          </div>

          {/* Описание */}
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {description}
          </p>

          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/pet/${id}`}>Подробнее</Link>
          </Button>

          {/* Контакты */}
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Контакт: {contact.name}
            </p>
            <div className="flex space-x-2">
              <Button size="sm" className="flex-1" asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-4 w-4 mr-1" />
                  Позвонить
                </a>
              </Button>
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link href={`/chat/${id}`}>
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Написать
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
