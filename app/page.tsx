'use client'

import Header from '@/components/Header'
import PetCard from '@/components/PetCard'
import SearchForm from '@/components/SearchForm'
import { Button } from '@/components/ui/button'
import { usePets } from '@/hooks/usePets'
import { Heart, Search, Shield, Zap } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const { pets, loading, error } = usePets({ limit: 6 })

  const petsForCards = pets.map((pet) => ({
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Главный баннер */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-5xl rounded-3xl border border-border/60 bg-card/70 px-6 py-14 shadow-lg backdrop-blur-sm">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Найдем каждого питомца
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
              Платформа для поиска пропавших и найденных животных в Москве
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <Button size="lg">
                  <Search className="h-5 w-5 mr-2" />
                  Найти питомца
                </Button>
              </Link>
              <Link href="/create">
                <Button size="lg" variant="secondary">
                  <Heart className="h-5 w-5 mr-2" />
                  Разместить объявление
                </Button>
              </Link>
            </div>
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 rounded-3xl border border-border/60 bg-card/80 p-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1,247</div>
              <div className="text-muted-foreground">Питомцев найдено</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">3,891</div>
              <div className="text-muted-foreground">Активных объявлений</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-muted-foreground">
                Успешных воссоединений
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Последние объявления */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Последние объявления
          </h2>
          {error && (
            <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
              Не удалось загрузить объявления: {error}
            </div>
          )}
          {loading ? (
            <div className="mb-8 text-center text-muted-foreground">
              Загружаем объявления...
            </div>
          ) : petsForCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {petsForCards.map((pet) => (
                <PetCard key={pet.id} {...pet} />
              ))}
            </div>
          ) : (
            <div className="mb-8 text-center text-muted-foreground">
              Пока нет объявлений. Добавьте первое на странице создания.
            </div>
          )}
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
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Почему выбирают нас
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center">
              <div className="bg-primary/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-поиск по фото</h3>
              <p className="text-muted-foreground">
                Загрузите фото и найдите визуально похожих питомцев с помощью
                искусственного интеллекта
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center">
              <div className="bg-primary/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрый отклик</h3>
              <p className="text-muted-foreground">
                Мгновенное оповещение владельцев и мгновенная связь через чат
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center">
              <div className="bg-primary/15 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Безопасность</h3>
              <p className="text-muted-foreground">
                Проверенные пользователи и защищенная система общения
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Футер */}
      <footer className="border-t border-border/70 bg-card/70 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">ПетПоиск Москва</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 ПетПоиск Москва. Помогаем найти каждого питомца.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
