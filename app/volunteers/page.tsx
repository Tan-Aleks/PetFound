'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { Database } from '@/lib/database.types'
import { Heart, Plus, Trash2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState } from 'react'

type Volunteer = Database['public']['Tables']['volunteers']['Row']

const MOSCOW_DISTRICTS = [
  'Центральный округ',
  'Северный округ',
  'Северо-Восточный округ',
  'Восточный округ',
  'Юго-Восточный округ',
  'Южный округ',
  'Юго-Западный округ',
  'Западный округ',
  'Северо-Западный округ',
  'Зеленоградский округ',
]

export default function VolunteersPage() {
  const { data: session, status } = useSession()
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [newDistrict, setNewDistrict] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
    if (status === 'authenticated') {
      fetchVolunteer()
    }
  }, [status])

  async function fetchVolunteer() {
    try {
      const res = await fetch('/api/volunteers')
      if (res.ok) {
        const data = await res.json()
        setVolunteer(data.volunteer)
        setSelectedDistricts(data.volunteer?.districts || [])
      }
    } catch (error) {
      console.error('Failed to fetch volunteer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddDistrict = (district: string) => {
    if (district && !selectedDistricts.includes(district)) {
      setSelectedDistricts([...selectedDistricts, district])
      setNewDistrict('')
    }
  }

  const handleRemoveDistrict = (district: string) => {
    setSelectedDistricts(selectedDistricts.filter((d) => d !== district))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ districts: selectedDistricts }),
      })
      if (res.ok) {
        const data = await res.json()
        setVolunteer(data.volunteer)
      }
    } catch (error) {
      console.error('Failed to save volunteer:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUnregister = async () => {
    if (!confirm('Вы уверены, что хотите перестать быть волонтером?')) return
    try {
      const res = await fetch('/api/volunteers', { method: 'DELETE' })
      if (res.ok) {
        setVolunteer(null)
        setSelectedDistricts([])
      }
    } catch (error) {
      console.error('Failed to unregister:', error)
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Волонтеры</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {volunteer ? 'Вы волонтер' : 'Стать волонтером'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Волонтеры помогают искать пропавших питомцев в своем районе. Вы
              будете получать уведомления о новых объявлениях в выбранных
              районах и сможете помочь с поиском.
            </p>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="volunteer-district"
                  className="text-sm font-medium mb-2 block"
                >
                  Районы помощи
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedDistricts.map((district) => (
                    <Badge
                      key={district}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {district}
                      <button
                        type="button"
                        onClick={() => handleRemoveDistrict(district)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    id="volunteer-district"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="Введите район"
                    list="districts"
                    className="flex-1"
                  />
                  <datalist id="districts">
                    {MOSCOW_DISTRICTS.filter(
                      (d) => !selectedDistricts.includes(d),
                    ).map((district) => (
                      <option key={district} value={district} />
                    ))}
                  </datalist>
                  <Button
                    variant="outline"
                    onClick={() => handleAddDistrict(newDistrict)}
                    disabled={!newDistrict}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                {volunteer && (
                  <Button variant="outline" onClick={handleUnregister}>
                    Перестать быть волонтером
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
