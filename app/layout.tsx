import type { Metadata } from 'next'
import { Montserrat, Poppins, Satisfy } from 'next/font/google'
import Script from 'next/script'
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

const GA_ID = 'G-0WSL7QQQTX'

export const metadata: Metadata = {
  metadataBase: new URL('https://mahmud.dev'),
  title: {
    default: 'Mahmud — Full-Stack Developer',
    template: '%s | Mahmud',
  },
  description:
    'Md. Abdulla Al Mahmud — Full-Stack Developer at Khulna Technologies LLC. Building full-stack web apps with React, Next.js, Node.js, and MongoDB.',
  keywords: [
    'Mahmud',
    'Md. Abdulla Al Mahmud',
    'Full-Stack Developer',
    'React Developer',
    'Next.js Developer',
    'Node.js Developer',
    'MongoDB',
    'Web Developer Bangladesh',
    'Dhaka Developer',
    'Khulna Technologies',
    'UI Developer',
    'JavaScript Developer',
    'TypeScript',
    'Portfolio',
  ],
  authors: [{ name: 'Md. Abdulla Al Mahmud', url: 'https://mahmud.dev' }],
  creator: 'Md. Abdulla Al Mahmud',
  publisher: 'Md. Abdulla Al Mahmud',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Mahmud — Full-Stack Developer',
    description:
      'Md. Abdulla Al Mahmud — Full-Stack Developer building web apps with React, Next.js, Node.js, and MongoDB.',
    url: 'https://mahmud.dev',
    siteName: 'Mahmud Portfolio',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png', // TODO: Add a 1200x630 OG image to /public
        width: 1200,
        height: 630,
        alt: 'Mahmud — Full-Stack Developer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mahmud — Full-Stack Developer',
    description: 'Full-Stack Developer building web apps with React, Next.js, Node.js, and MongoDB.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://mahmud.dev',
  },
  verification: {
    google: '7bTKVfMA9Ne4QaOGURw8QEoBuGcqQ0aWmmBhk4WD3Cs',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Md. Abdulla Al Mahmud',
  alternateName: 'Mahmud',
  url: 'https://mahmud.dev',
  email: 'mahmud.shamim.codes@gmail.com',
  jobTitle: 'Full-Stack Developer',
  worksFor: {
    '@type': 'Organization',
    name: 'Khulna Technologies LLC',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Dhaka',
    addressCountry: 'BD',
  },
  sameAs: [
    'https://github.com/mahmudshamim',
    'https://www.linkedin.com/in/md-abdulla-al-mahmud/',
    'https://www.upwork.com/freelancers/~019aac0b0b5967360a',
  ],
  knowsAbout: [
    'React',
    'Next.js',
    'Node.js',
    'MongoDB',
    'TypeScript',
    'JavaScript',
    'Full-Stack Web Development',
    'UI Design',
    'Figma',
  ],
  description:
    'Full-Stack Developer at Khulna Technologies LLC. Building full-stack web applications with React, Next.js, Node.js, and MongoDB.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${montserrat.variable} ${poppins.variable} ${satisfy.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  )
}
