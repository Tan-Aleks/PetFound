'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, MapPin, Calendar, Phone, Mail, AlertCircle } from 'lucide-react'

export default function CreatePage() {
  const [adType, setAdType] = useState<'lost' | 'found'>('lost')
  const [animalType, setAnimalType] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    color: '',
    size: '',
    district: '',
    date: '',
    description: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    reward: ''
  })

  const moscowDistricts = [
    'Центральный', 'Северный', 'Северо-Восточный', 'Восточный',
    'Юго-Восточный', 'Южный', 'Юго-Западный', 'Западный',
    'Северо-Западный', 'Зеленоград', 'Новомосковский', 'Троицкий'
  ]

  const animalTypes = [
    { value: 'dog', label: 'Собака' },
    { value: 'cat', label: 'Кошка' },
    { value: 'small', label: 'Мелкое животное' }
  ]

  const sizes = [
    { value: 'small', label: 'Мелкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'large', label: 'Крупный' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Заголовок страницы */}
      <section className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Разместить объявление
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Расскажите о пропавшем или найденном питомце
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Выбор типа объявления */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Тип объявления</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <button
                  onClick={() => setAdType('lost')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    adType === 'lost'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-semibold">Пропал питомец</div>
                  <div className="text-sm opacity-75">Ищу своего питомца</div>
                </button>
                <button
                  onClick={() => setAdType('found')}
                  className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                    adType === 'found'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <div className="font-semibold">Найден питомец</div>
                  <div className="text-sm opacity-75">Нашел чужого питомца</div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Основная форма */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Информация о питомце</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Фотографии */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Фотографии питомца *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Загрузите фотографии питомца (до 5 фото)
                  </p>
                  <Button variant="outline">
                    <Camera className="h-4 w-4 mr-2" />
                    Выбрать фото
                  </Button>
                </div>
              </div>

              {/* Основная информация */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Кличка питомца
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Например: Барсик"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Тип животного *
                  </label>
                  <select
                    value={animalType}
                    onChange={(e) => setAnimalType((e.target as HTMLSelectElement).value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите тип</option>
                    {animalTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Порода
                  </label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Например: Лабрадор"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Размер *
                  </label>
                  <select
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', (e.target as HTMLSelectElement).value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите размер</option>
                    {sizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Окрас *
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Например: Рыжий с белым"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Район Москвы *
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', (e.target as HTMLSelectElement).value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите район</option>
                    {moscowDistricts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Дата {adType === 'lost' ? 'пропажи' : 'находки'} *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {adType === 'lost' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Вознаграждение (₽)
                    </label>
                    <input
                      type="number"
                      value={formData.reward}
                      onChange={(e) => handleInputChange('reward', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Например: 10000"
                    />
                  </div>
                )}
              </div>

              {/* Описание */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Подробное описание *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Опишите особенности питомца, обстоятельства ${adType === 'lost' ? 'пропажи' : 'находки'}, особые приметы...`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Контактная информация */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ваше имя *
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Например: Анна"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Кнопки действий */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" size="lg">
              Отмена
            </Button>
            <Button size="lg" className="px-8">
              Опубликовать объявление
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}