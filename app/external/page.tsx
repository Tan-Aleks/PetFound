import Header from '@/components/Header'
import { getSupabasePublicServer } from '@/lib/supabase-server'

export const metadata = {
  title: 'Внешние источники - ПетПоиск Москва',
  description:
    'Объявления из внешних источников о пропавших и найденных питомцах',
}

export default async function ExternalPage() {
  const supabase = getSupabasePublicServer()

  const { data: sources } = await supabase
    .from('external_sources')
    .select('id, name, url, active, last_parsed')
    .eq('active', true)
    .order('name')

  const { data: externalPets } = await supabase
    .from('external_pets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const typeLabels: Record<string, string> = {
    dog: 'Собака',
    cat: 'Кошка',
    small: 'Мелкое животное',
  }

  const sizeLabels: Record<string, string> = {
    small: 'Мелкий',
    medium: 'Средний',
    large: 'Крупный',
  }

  const statusLabels: Record<string, string> = {
    lost: 'Пропал',
    found: 'Найден',
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <section className="bg-white dark:bg-gray-800 py-8 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Внешние источники
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Объявления из партнерских сервисов о пропавших и найденных питомцах
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {sources && sources.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Источники
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {source.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {source.last_parsed
                          ? `Обновлено: ${new Date(source.last_parsed).toLocaleDateString('ru-RU')}`
                          : 'Не обновлялось'}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Последние объявления
            </h2>
            {externalPets && externalPets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {externalPets.map((pet) => {
                  const source = sources?.find((s) => s.id === pet.source_id)
                  return (
                    <a
                      key={pet.id}
                      href={pet.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                    >
                      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                        {pet.photos &&
                        pet.photos.length > 0 &&
                        pet.photos[0] ? (
                          <img
                            src={pet.photos[0]}
                            alt={pet.name || 'Питомец'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-gray-400">Нет фото</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                          {statusLabels[pet.status] || pet.status}
                        </div>
                        {source && (
                          <div className="absolute bottom-2 right-2 bg-gray-800/80 text-white px-2 py-1 rounded text-xs">
                            {source.name}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {pet.name || 'Без имени'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {typeLabels[pet.type] || pet.type}
                          {pet.breed && ` • ${pet.breed}`}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
                          {pet.description}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>{pet.district}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(pet.date).toLocaleDateString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 py-12">
                Внешние объявления временно недоступны
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
