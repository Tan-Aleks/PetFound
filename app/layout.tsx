import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const nunito = Nunito_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'ПетПоиск Москва - Поиск пропавших питомцев',
  description:
    'Платформа для поиска пропавших домашних питомцев и размещения объявлений о найденных животных в Москве',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={nunito.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
