'use client'

import Header from '@/components/Header'
import PetCard from '@/components/PetCard'
import SearchForm from '@/components/SearchForm'
import { Button } from '@/components/ui/button'
import { Filter, SortAsc } from 'lucide-react'

// Расширенные моковые данные для страницы поиска
const searchResults = [
  {
    id: '1',
    name: 'Барсик',
    type: 'cat' as const,
    breed: 'Британская короткошерстная',
    color: 'Серый',
    size: 'medium' as const,
    district: 'Центральный',
    date: '2026-01-25',
    status: 'lost' as const,
    photos: ['/api/placeholder/300/200'],
    description:
      'Очень дружелюбный кот, откликается на имя. Пропал в районе Красной площади.',
    contact: {
      name: 'Анна',
      phone: '+7 (999) 123-45-67',
    },
    reward: 10000,
  },
  {
    id: '2',
    name: 'Рекс',
    type: 'dog' as const,
    breed: 'Немецкая овчарка',
    color: 'Черно-коричневый',
    size: 'large' as const,
    district: 'Северный',
    date: '2026-01-28',
    status: 'found' as const,
    photos: ['/api/placeholder/300/200'],
    description:
      'Найдена собака в парке Сокольники. Очень воспитанная, в ошейнике.',
    contact: {
      name: 'Михаил',
      phone: '+7 (999) 987-65-43',
    },
  },
  {
    id: '3',
    name: 'Мурка',
    type: 'cat' as const,
    breed: 'Дворовая',
    color: 'Трехцветная',
    size: 'small' as const,
    district: 'Южный',
    date: '2026-01-26',
    status: 'lost' as const,
    photos: ['/api/placeholder/300/200'],
    description:
      'Маленькая трехцветная кошечка, очень пугливая. Пропала возле метро Нагорная.',
    contact: {
      name: 'Елена',
      phone: '+7 (999) 555-12-34',
    },
    reward: 5000,
  },
  {
    id: '4',
    name: 'Хомяк',
    type: 'small' as const,
    breed: 'Джунгарский хомяк',
    color: 'Серо-белый',
    size: 'small' as const,
    district: 'Восточный',
    date: '2026-01-29',
    status: 'found' as const,
    photos: ['/api/placeholder/300/200'],
    description:
      'Найден джунгарский хомяк в районе Измайлово. Очень активный и здоровый.',
    contact: {
      name: 'Дмитрий',
      phone: '+7 (999) 777-88-99',
    },
  },
]

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Заголовок страницы */}
      <section className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Поиск питомцев
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Найдите своего питомца или помогите другим найти их любимцев
          </p>
        </div>
      </section>

      {/* Форма поиска */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <SearchForm />
        </div>
      </section>

      {/* Результаты поиска */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Заголовок результатов и фильтры */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Результаты поиска
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Найдено {searchResults.length} объявлений
              </p>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Сортировка
              </Button>
            </div>
          </div>

          {/* Сетка результатов */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {searchResults.map((pet) => (
              <PetCard key={pet.id} {...pet} />
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                Предыдущая
              </Button>
              <Button variant="default">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Следующая</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
