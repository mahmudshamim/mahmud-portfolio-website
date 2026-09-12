import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      /* Shared CVs belong to the people who shared them. */
      disallow: ['/c/', '/cv/view'],
    },
    sitemap: 'https://mahmud.dev/sitemap.xml',
  }
}
