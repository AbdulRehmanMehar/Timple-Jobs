import { NextResponse } from 'next/server'
import { headers } from 'next/headers';

export async function GET() {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host');
  const baseUrl = `${proto}://${host}`;
  const res = await fetch(`${baseUrl}/api/bullhorn/jobs`)
  const result = await res.json()
  const jobs = result.jobs || []

  const staticRoutes = [
    `${baseUrl}/`,
    `${baseUrl}/jobs`,
  ]

  const jobRoutes = jobs.map(job => `${baseUrl}/job/${job.id}`)

  const urls = [...staticRoutes, ...jobRoutes]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls
      .map(
        url => `
      <url>
        <loc>${url}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`
      )
      .join('')}
  </urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
