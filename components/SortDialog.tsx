'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ArrowUpDown } from 'lucide-react'
import { SortAsc } from 'lucide-react'

interface SortOption {
  value: string
  label: string
}

interface SortDialogProps {
  value: string
  onChange: (value: string) => void
}

const sortOptions: SortOption[] = [
  { value: 'date_desc', label: 'Сначала новые' },
  { value: 'date_asc', label: 'Сначала старые' },
  { value: 'reward_desc', label: 'С вознаграждением' },
  { value: 'name_asc', label: 'По алфавиту' },
]

export default function SortDialog({ value, onChange }: SortDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SortAsc className="h-4 w-4 mr-2" />
          Сортировка
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Сортировка
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                value === option.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {option.label}
              {value === option.value && (
                <span className="text-primary">✓</span>
              )}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
