'use client'

import { Button } from '@/components/ui/button'
import { Camera, Loader2, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface ImageSearchUploaderProps {
  onImageSelected: (file: File) => void
  previewUrl: string | null
  loading?: boolean
  onClear: () => void
}

export default function ImageSearchUploader({
  onImageSelected,
  previewUrl,
  loading = false,
  onClear,
}: ImageSearchUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      const file = e.dataTransfer.files?.[0]
      if (file?.type.startsWith('image/')) {
        onImageSelected(file)
      }
    },
    [onImageSelected],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        onImageSelected(file)
      }
    },
    [onImageSelected],
  )

  const triggerFileInput = () => {
    inputRef.current?.click()
  }

  if (previewUrl) {
    return (
      <div className="relative rounded-lg overflow-hidden border-2 border-blue-500 bg-gray-50 dark:bg-gray-800">
        <img
          src={previewUrl}
          alt="Загруженное фото"
          className="w-full h-48 object-contain"
        />
        {loading ? (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            aria-label="Удалить фото"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {loading && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <p className="text-white text-sm text-center">
              Анализируем изображение с помощью AI...
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        dragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
        Поиск по фотографии
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        AI найдёт визуально похожих питомцев
      </p>

      <Button
        variant="outline"
        size="sm"
        onClick={triggerFileInput}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Анализ...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Загрузить фото
          </>
        )}
      </Button>

      <p className="text-xs text-gray-400 mt-3">JPEG, PNG или WebP до 10 МБ</p>
    </div>
  )
}
