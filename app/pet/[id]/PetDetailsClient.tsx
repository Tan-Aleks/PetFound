'use client'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { type Pet, getSupabase } from '@/lib/supabase'
import { Calendar, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PetDetailsClientProps {
  id: string
}

export default function PetDetailsClient({ id }: PetDetailsClientProps) {
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadPet = async () => {
      try {
        setLoading(true)
        setError('')
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          throw error
        }

        setPet(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить объявление',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadPet()
  }, [id])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <p className="text-muted-foreground">Загружаем объявление...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : !pet ? (
          <p className="text-muted-foreground">Объявление не найдено</p>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <Card>
              <CardContent className="p-0">
                {pet.photos && pet.photos.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {pet.photos.map((photo) => (
                      <div
                        key={photo}
                        className="relative h-44 w-full overflow-hidden rounded-lg"
                      >
                        <Image
                          src={photo}
                          alt={pet.name || 'Питомец'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-72 items-center justify-center text-muted-foreground">
                    Фото отсутствуют
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {pet.status === 'lost'
                      ? 'Пропал питомец'
                      : 'Найден питомец'}
                  </p>
                  <h1 className="text-3xl font-bold text-foreground">
                    {pet.name || 'Без имени'}
                  </h1>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Тип: {pet.type}</p>
                  <p>Порода: {pet.breed || 'Не указана'}</p>
                  <p>Окрас: {pet.color}</p>
                  <p>Размер: {pet.size}</p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {pet.district}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(pet.date).toLocaleDateString('ru-RU')}
                  </p>
                </div>

                {pet.description && (
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Описание
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pet.description}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-foreground">
                    Контакты
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pet.contact_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pet.contact_phone}
                  </p>
                  {pet.contact_email && (
                    <p className="text-sm text-muted-foreground">
                      {pet.contact_email}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/chat/${pet.id}`}>Написать</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={`tel:${pet.contact_phone}`}>Позвонить</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
