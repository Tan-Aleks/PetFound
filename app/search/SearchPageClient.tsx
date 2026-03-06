'use client'

import Header from '@/components/Header'
import PetCard from '@/components/PetCard'
import SearchForm from '@/components/SearchForm'
import { Button } from '@/components/ui/button'
import { useSearchPets } from '@/hooks/usePets'
import { Filter, SortAsc } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function SearchPageClient() {
  const searchParams = useSearchParams()
  const { results, loading, error, searchPets } = useSearchPets()
  const searchParamsString = searchParams.toString()

  useEffect(() => {
    const params = new URLSearchParams(searchParamsString)
    void searchPets({
      query: params.get('query') ?? undefined,
      type: params.get('type') ?? undefined,
      district: params.get('district') ?? undefined,
      status: params.get('status') ?? undefined,
      dateFrom: params.get('dateFrom') ?? undefined,
    })
  }, [searchParamsString, searchPets])

  const resultsForCards = results.map((pet) => ({
    id: pet.id,
    name: pet.name ?? 'Без имени',
    type: pet.type,
    breed: pet.breed ?? undefined,
    color: pet.color,
    size: pet.size,
    district: pet.district,
    date: pet.date,
    status: pet.status,
    photos: pet.photos ?? [],
    description: pet.description ?? 'Описание отсутствует',
    contact: {
      name: pet.contact_name,
      phone: pet.contact_phone,
    },
    reward: pet.reward ?? undefined,
  }))

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
          <SearchForm onSearch={searchPets} loading={loading} />
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
                {loading
                  ? 'Ищем объявления...'
                  : `Найдено ${resultsForCards.length} объявлений`}
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

          {error && (
            <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              Ошибка поиска: {error}
            </div>
          )}
          {resultsForCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {resultsForCards.map((pet) => (
                <PetCard key={pet.id} {...pet} />
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center text-gray-600 dark:text-gray-400">
                По выбранным параметрам ничего не найдено.
              </div>
            )
          )}

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
