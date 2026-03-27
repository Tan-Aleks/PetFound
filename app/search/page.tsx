import { Suspense } from 'react'
import SearchPageClient from './SearchPageClient'

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-400">
          Загружаем поиск...
        </div>
      }
    >
      <SearchPageClient />
    </Suspense>
  )
}
