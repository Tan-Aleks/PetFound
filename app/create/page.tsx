'use client'

import Header from '@/components/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { usePets } from '@/hooks/usePets'
import { MOSCOW_DISTRICTS } from '@/lib/moscow-districts'
import {
  AlertCircle,
  Calendar,
  Camera,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

type AnimalType = 'dog' | 'cat' | 'small'
type AnimalSize = 'small' | 'medium' | 'large'
type AdType = 'lost' | 'found'

export default function CreatePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { createPet, uploadPetPhotos } = usePets()

  const [adType, setAdType] = useState<AdType>('lost')
  const [animalType, setAnimalType] = useState<AnimalType | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([])
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
    reward: '',
  })

  const previewUrls = useMemo(
    () => selectedPhotos.map((file) => URL.createObjectURL(file)),
    [selectedPhotos],
  )

  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url)
      }
    }
  }, [previewUrls])

  const animalTypes: { value: AnimalType; label: string }[] = [
    { value: 'dog', label: 'Собака' },
    { value: 'cat', label: 'Кошка' },
    { value: 'small', label: 'Мелкое животное' },
  ]

  const sizes: { value: AnimalSize; label: string }[] = [
    { value: 'small', label: 'Мелкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'large', label: 'Крупный' },
  ]

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) {
      return
    }

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith('image/'),
    )
    const limitedFiles = imageFiles.slice(0, 5)

    setSelectedPhotos(limitedFiles)
  }

  const validateForm = (): string | null => {
    if (!animalType) {
      return 'Выберите тип животного'
    }
    if (!formData.size) {
      return 'Выберите размер животного'
    }
    if (!formData.color.trim()) {
      return 'Укажите окрас'
    }
    if (!formData.district) {
      return 'Выберите район Москвы'
    }
    if (!formData.date) {
      return 'Укажите дату пропажи или находки'
    }
    if (!formData.description.trim()) {
      return 'Добавьте подробное описание'
    }
    if (!formData.contactName.trim()) {
      return 'Укажите контактное имя'
    }
    if (!formData.contactPhone.trim()) {
      return 'Укажите контактный телефон'
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setSubmitError(validationError)
      return
    }

    const userId = (session?.user as { id?: string } | undefined)?.id
    if (!userId) {
      setSubmitError('Для публикации объявления необходимо войти в аккаунт')
      router.push('/login')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      let photoUrls: string[] = []

      if (selectedPhotos.length > 0) {
        photoUrls = await uploadPetPhotos(selectedPhotos)
      }

      await createPet({
        user_id: userId,
        name: formData.name.trim() || null,
        type: animalType as AnimalType,
        breed: formData.breed.trim() || null,
        color: formData.color.trim(),
        size: formData.size as AnimalSize,
        district: formData.district,
        date: formData.date,
        status: adType,
        description: formData.description.trim(),
        contact_name: formData.contactName.trim(),
        contact_phone: formData.contactPhone.trim(),
        contact_email: formData.contactEmail.trim() || null,
        reward:
          adType === 'lost' && formData.reward
            ? Number.parseInt(formData.reward, 10)
            : null,
        photos: photoUrls,
      })

      router.push('/search')
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Не удалось опубликовать объявление',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-8 border-b border-border/70 bg-card/60">
        <div className="container mx-auto px-4">
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            Разместить объявление
          </h1>
          <p className="text-muted-foreground">
            Расскажите о пропавшем или найденном питомце
          </p>
          {status !== 'authenticated' && (
            <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
              Для публикации объявления нужно войти в аккаунт.
            </p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Тип объявления</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAdType('lost')}
                  className={`flex-1 rounded-xl border-2 p-4 transition-colors ${
                    adType === 'lost'
                      ? 'border-destructive/60 bg-destructive/10 text-destructive'
                      : 'border-border/80 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                  <div className="font-semibold">Пропал питомец</div>
                  <div className="text-sm opacity-80">Ищу своего питомца</div>
                </button>
                <button
                  type="button"
                  onClick={() => setAdType('found')}
                  className={`flex-1 rounded-xl border-2 p-4 transition-colors ${
                    adType === 'found'
                      ? 'border-primary/60 bg-primary/10 text-primary'
                      : 'border-border/80 text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <MapPin className="mx-auto mb-2 h-8 w-8" />
                  <div className="font-semibold">Найден питомец</div>
                  <div className="text-sm opacity-80">Нашел чужого питомца</div>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Информация о питомце</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label
                  htmlFor="pet-photos"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Фотографии питомца
                </label>
                <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                  <Camera className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-4 text-muted-foreground">
                    Загрузите до 5 фотографий
                  </p>
                  <Input
                    id="pet-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    className="cursor-pointer file:mr-3"
                    onChange={handlePhotoChange}
                  />
                </div>
                {previewUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previewUrls.map((url, index) => (
                      <img
                        key={url}
                        src={url}
                        alt={`Предпросмотр фото ${index + 1}`}
                        className="h-28 w-full rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="pet-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Кличка питомца
                  </label>
                  <Input
                    id="pet-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Например: Барсик"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pet-animal-type"
                    className="mb-2 block text-sm font-medium"
                  >
                    Тип животного *
                  </label>
                  <select
                    id="pet-animal-type"
                    value={animalType}
                    onChange={(e) =>
                      setAnimalType(e.target.value as AnimalType | '')
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  <label
                    htmlFor="pet-breed"
                    className="mb-2 block text-sm font-medium"
                  >
                    Порода
                  </label>
                  <Input
                    id="pet-breed"
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    placeholder="Например: Лабрадор"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pet-size"
                    className="mb-2 block text-sm font-medium"
                  >
                    Размер *
                  </label>
                  <select
                    id="pet-size"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                  <label
                    htmlFor="pet-color"
                    className="mb-2 block text-sm font-medium"
                  >
                    Окрас *
                  </label>
                  <Input
                    id="pet-color"
                    value={formData.color}
                    onChange={(e) => handleInputChange('color', e.target.value)}
                    placeholder="Например: Рыжий с белым"
                  />
                </div>

                <div>
                  <label
                    htmlFor="pet-district"
                    className="mb-2 block text-sm font-medium"
                  >
                    <MapPin className="mr-1 inline h-4 w-4" />
                    Район Москвы *
                  </label>
                  <select
                    id="pet-district"
                    value={formData.district}
                    onChange={(e) =>
                      handleInputChange('district', e.target.value)
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Выберите район</option>
                    {MOSCOW_DISTRICTS.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pet-date"
                    className="mb-2 block text-sm font-medium"
                  >
                    <Calendar className="mr-1 inline h-4 w-4" />
                    Дата {adType === 'lost' ? 'пропажи' : 'находки'} *
                  </label>
                  <Input
                    id="pet-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>

                {adType === 'lost' && (
                  <div>
                    <label
                      htmlFor="pet-reward"
                      className="mb-2 block text-sm font-medium"
                    >
                      Вознаграждение (₽)
                    </label>
                    <Input
                      id="pet-reward"
                      type="number"
                      value={formData.reward}
                      onChange={(e) =>
                        handleInputChange('reward', e.target.value)
                      }
                      placeholder="Например: 10000"
                    />
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="pet-description"
                  className="mb-2 block text-sm font-medium"
                >
                  Подробное описание *
                </label>
                <textarea
                  id="pet-description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={`Опишите особенности питомца, обстоятельства ${adType === 'lost' ? 'пропажи' : 'находки'}, особые приметы...`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Контактная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Ваше имя *
                  </label>
                  <Input
                    id="contact-name"
                    value={formData.contactName}
                    onChange={(e) =>
                      handleInputChange('contactName', e.target.value)
                    }
                    placeholder="Например: Анна"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-2 block text-sm font-medium"
                  >
                    <Phone className="mr-1 inline h-4 w-4" />
                    Телефон *
                  </label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      handleInputChange('contactPhone', e.target.value)
                    }
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-medium"
                  >
                    <Mail className="mr-1 inline h-4 w-4" />
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      handleInputChange('contactEmail', e.target.value)
                    }
                    placeholder="example@email.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {submitError && (
            <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <Button variant="outline" size="lg" onClick={() => router.back()}>
              Отмена
            </Button>
            <Button
              size="lg"
              className="px-8"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Публикуем...
                </>
              ) : (
                'Опубликовать объявление'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
