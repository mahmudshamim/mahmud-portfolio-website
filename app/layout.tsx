import type { Metadata } from 'next'
import { Montserrat, Poppins, Satisfy } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  weight: ['700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const satisfy = Satisfy({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-signature',
  display: 'swap',
})

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mahmud — Full-Stack Developer',
  description:
    'Full-Stack Developer & Creative Technologist based in Dhaka, Bangladesh. Building high-performance web apps and AI-powered products.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${satisfy.variable}`}>
      <body>{children}</body>
    </html>
  )
}
