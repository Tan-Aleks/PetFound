import Header from '@/components/Header'
import PetCard from '@/components/PetCard'
import SearchForm from '@/components/SearchForm'
import { Button } from '@/components/ui/button'
import { Heart, Search, Shield, Users } from 'lucide-react'
import Link from 'next/link'

// Моковые данные для демонстрации
const mockPets = [
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
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Главный баннер */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Найдем каждого питомца
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Платформа для поиска пропавших и найденных животных в Москве
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Search className="h-5 w-5 mr-2" />
                Найти питомца
              </Button>
            </Link>
            <Link href="/create">
              <Button
                size="lg"
                className="bg-red-600 text-white hover:bg-red-700 border-2 border-red-600 hover:border-red-700"
              >
                <Heart className="h-5 w-5 mr-2" />
                Разместить объявление
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Форма поиска */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SearchForm />
        </div>
      </section>

      {/* Статистика */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">1,247</div>
              <div className="text-gray-600 dark:text-gray-400">
                Питомцев найдено
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                3,891
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Активных объявлений
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">567</div>
              <div className="text-gray-600 dark:text-gray-400">Волонтеров</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-600 mb-2">98%</div>
              <div className="text-gray-600 dark:text-gray-400">
                Успешных воссоединений
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Последние объявления */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Последние объявления
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {mockPets.map((pet) => (
              <PetCard key={pet.id} {...pet} />
            ))}
          </div>
          <div className="text-center">
            <Link href="/search">
              <Button variant="outline" size="lg">
                Показать все объявления
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                AI-поиск по фото
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Загрузите фото и найдите визуально похожих питомцев с помощью
                искусственного интеллекта
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Сеть волонтеров
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Активное сообщество волонтеров помогает в поиске по всей Москве
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Безопасность
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Проверенные пользователи и защищенная система общения
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-red-500" />
              <span className="text-lg font-semibold">ПетПоиск Москва</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2026 ПетПоиск Москва. Помогаем найти каждого питомца.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
