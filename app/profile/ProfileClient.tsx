'use client'

import PetCard from '@/components/PetCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Database } from '@/lib/database.types'
import { Edit2, LogOut, Save, X } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

type Profile = Database['public']['Tables']['profiles']['Row']
type Pet = Database['public']['Tables']['pets']['Row']

export default function ProfileClient() {
  const { data: session, update: updateSession } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    district: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, petsRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/profile/pets'),
        ])
        const profileData = await profileRes.json()
        const petsData = await petsRes.json()
        setProfile(profileData.profile)
        setPets(petsData.pets || [])
        setFormData({
          name: profileData.profile?.name || '',
          phone: profileData.profile?.phone || '',
          district: profileData.profile?.district || '',
        })
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setEditing(false)
        await updateSession()
      }
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePet = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return
    try {
      const res = await fetch(`/api/profile/pets/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPets(pets.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete pet:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Личный кабинет</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-foreground">{session?.user?.email}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-name"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Имя
                  </label>
                  {editing ? (
                    <Input
                      id="profile-name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ваше имя"
                    />
                  ) : (
                    <p className="text-foreground">{profile?.name || '-'}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="profile-phone"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Телефон
                  </label>
                  {editing ? (
                    <Input
                      id="profile-phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+7 (999) 000-00-00"
                    />
                  ) : (
                    <p className="text-foreground">{profile?.phone || '-'}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="profile-district"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Район
                  </label>
                  {editing ? (
                    <Input
                      id="profile-district"
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                      placeholder="Район проживания"
                    />
                  ) : (
                    <p className="text-foreground">
                      {profile?.district || '-'}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button onClick={handleSave} disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Отмена
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Мои объявления</CardTitle>
          </CardHeader>
          <CardContent>
            {pets.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                У вас пока нет объявлений
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pets.map((pet) => (
                  <div key={pet.id} className="relative group">
                    <PetCard
                      id={pet.id}
                      name={pet.name || 'Без имени'}
                      type={pet.type}
                      breed={pet.breed || undefined}
                      color={pet.color}
                      size={pet.size}
                      district={pet.district}
                      date={pet.date}
                      status={pet.status}
                      photos={pet.photos || []}
                      description={pet.description || ''}
                      contact={{
                        name: pet.contact_name,
                        phone: pet.contact_phone,
                      }}
                      reward={pet.reward || undefined}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePet(pet.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
