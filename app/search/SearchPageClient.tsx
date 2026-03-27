'use client'

import Header from '@/components/Header'
import ImageSearchUploader from '@/components/ImageSearchUploader'
import PetCard from '@/components/PetCard'
import SearchForm from '@/components/SearchForm'
import SortDialog from '@/components/SortDialog'
import { Button } from '@/components/ui/button'
import { useImageSearch } from '@/hooks/useImageSearch'
import { useSearchPets } from '@/hooks/usePets'
import { Filter, Image } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type SearchMode = 'text' | 'image'

interface SearchFilters {
  query?: string
  type?: string
  district?: string
  status?: string
  dateFrom?: string
  dateTo?: string
}

export default function SearchPageClient() {
  const [searchMode, setSearchMode] = useState<SearchMode>('text')
  const [sortBy, setSortBy] = useState('date_desc')
  const [showFilters, setShowFilters] = useState(false)

  const searchParams = useSearchParams()
  const {
    results: textResults,
    loading: textLoading,
    error: textError,
    searchPets,
  } = useSearchPets()
  const {
    results: imageResults,
    loading: imageLoading,
    error: imageError,
    previewUrl,
    searchByImage,
    clearResults,
  } = useImageSearch()

  const searchParamsString = searchParams.toString()

  useEffect(() => {
    if (searchMode === 'text') {
      const params = new URLSearchParams(searchParamsString)
      void searchPets({
        query: params.get('query') ?? undefined,
        type: params.get('type') ?? undefined,
        district: params.get('district') ?? undefined,
        status: params.get('status') ?? undefined,
        dateFrom: params.get('dateFrom') ?? undefined,
      })
    }
  }, [searchParamsString, searchPets, searchMode])

  const handleImageSelect = async (file: File) => {
    setSearchMode('image')
    await searchByImage(file)
  }

  const handleClearImage = () => {
    clearResults()
    setSearchMode('text')
  }

  const handleTextSearch = (params: Parameters<typeof searchPets>[0]) => {
    setSearchMode('text')
    setShowFilters(false)
    void searchPets(params)
  }

  const sortedResults = [
    ...(searchMode === 'text' ? textResults : imageResults),
  ].sort((a, b) => {
    switch (sortBy) {
      case 'date_asc':
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      case 'date_desc':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'reward_desc':
        return (b.reward ?? 0) - (a.reward ?? 0)
      case 'name_asc':
        return (a.name ?? '').localeCompare(b.name ?? '', 'ru')
      default:
        return 0
    }
  })

  const isLoading = searchMode === 'text' ? textLoading : imageLoading
  const error = searchMode === 'text' ? textError : imageError

  const resultsForCards = sortedResults.map((pet) => ({
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
    ai_similarity:
      'ai_similarity' in pet
        ? (pet as { ai_similarity?: number }).ai_similarity
        : undefined,
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

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

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-2 justify-center">
              <Button
                variant={searchMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('text')}
              >
                <Filter className="h-4 w-4 mr-2" />
                Текстовый поиск
              </Button>
              <Button
                variant={searchMode === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('image')}
              >
                <Image className="h-4 w-4 mr-2" />
                Поиск по фото
              </Button>
            </div>

            {searchMode === 'text' ? (
              <SearchForm onSearch={handleTextSearch} loading={textLoading} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <ImageSearchUploader
                  onImageSelected={handleImageSelect}
                  previewUrl={previewUrl}
                  loading={imageLoading}
                  onClear={handleClearImage}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchMode === 'image' ? 'AI-результаты' : 'Результаты поиска'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {isLoading
                  ? searchMode === 'image'
                    ? 'AI анализирует изображение...'
                    : 'Ищем объявления...'
                  : searchMode === 'image'
                    ? `Найдено ${resultsForCards.length} похожих питомцев`
                    : `Найдено ${resultsForCards.length} объявлений`}
              </p>
            </div>

            <div className="flex gap-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Фильтры
              </Button>
              <SortDialog value={sortBy} onChange={setSortBy} />
            </div>
          </div>

          {showFilters && searchMode === 'text' && (
            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="font-medium mb-4 text-gray-900 dark:text-white">
                Дополнительные фильтры
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="filter-date-from"
                    className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Дата от
                  </label>
                  <input
                    id="filter-date-from"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="filter-date-to"
                    className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Дата до
                  </label>
                  <input
                    id="filter-date-to"
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="filter-reward"
                    className="block text-sm text-gray-600 dark:text-gray-400 mb-1"
                  >
                    Только с вознаграждением
                  </label>
                  <input
                    id="filter-reward"
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300"
                  />
                </div>
              </div>
            </div>
          )}

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
            !isLoading && (
              <div className="text-center text-gray-600 dark:text-gray-400 py-12">
                {searchMode === 'image'
                  ? 'Загрузите фото питомца для AI-поиска похожих объявлений'
                  : 'По выбранным параметрам ничего не найдено.'}
              </div>
            )
          )}

          {resultsForCards.length > 0 && (
            <div className="flex justify-center mt-12">
              <Button variant="outline">Загрузить ещё</Button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
