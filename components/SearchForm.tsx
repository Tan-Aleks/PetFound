'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Camera, MapPin, Search } from 'lucide-react'
import { useState } from 'react'

export default function SearchForm() {
  const [searchType, setSearchType] = useState<'lost' | 'found'>('lost')
  const [animalType, setAnimalType] = useState('')
  const [district, setDistrict] = useState('')

  const moscowDistricts = [
    'Центральный',
    'Северный',
    'Северо-Восточный',
    'Восточный',
    'Юго-Восточный',
    'Южный',
    'Юго-Западный',
    'Западный',
    'Северо-Западный',
    'Зеленоград',
    'Новомосковский',
    'Троицкий',
  ]

  const animalTypes = [
    { value: 'dog', label: 'Собака' },
    { value: 'cat', label: 'Кошка' },
    { value: 'small', label: 'Мелкие животные' },
  ]

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Переключатель типа поиска */}
          <div className="flex justify-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setSearchType('lost')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'lost'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Пропавшие
              </button>
              <button
                onClick={() => setSearchType('found')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchType === 'found'
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Найденные
              </button>
            </div>
          </div>

          {/* Основная форма поиска */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Тип животного */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Тип животного
              </label>
              <select
                value={animalType}
                onChange={(e) =>
                  setAnimalType((e.target as HTMLSelectElement).value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все животные</option>
                {animalTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Район */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Район Москвы
              </label>
              <select
                value={district}
                onChange={(e) =>
                  setDistrict((e.target as HTMLSelectElement).value)
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Все районы</option>
                {moscowDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            {/* Дата */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Дата пропажи/находки
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* AI поиск по фото */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Поиск по фотографии
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Загрузите фото питомца для поиска визуально похожих животных
            </p>
            <Button variant="outline">
              <Camera className="h-4 w-4 mr-2" />
              Загрузить фото
            </Button>
          </div>

          {/* Кнопка поиска */}
          <div className="flex justify-center">
            <Button size="lg" className="px-8">
              <Search className="h-5 w-5 mr-2" />
              Найти питомца
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
