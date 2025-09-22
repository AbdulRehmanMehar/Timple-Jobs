import Navbar from "@/components/navbar"
import JobBoardUI from "@/components/JobBoardUI/JobBoardUI"
import Footer from "@/footer"
import { headers } from "next/headers"

// Metadata
export const generateMetadata = async () => {
  const headersList = await headers()
  const proto = headersList.get("x-forwarded-proto") || "http"
  const host = headersList.get("host")
  const baseUrl = `${proto}://${host}`

  return {
    title: "Explore Jobs — Timpl | Optimize Your Workforce",
    description:
      "Discover Timpl's staffing and business process solutions for industries like automotive, logistics, and finance. Browse available job opportunities.",
    keywords: "jobs, employment, staffing, workforce, careers, automotive jobs, logistics jobs, finance jobs, Timpl",
    authors: [{ name: "Timpl" }],
    creator: "Timpl",
    publisher: "Timpl",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: "Explore Jobs — Timpl | Optimize Your Workforce",
      description: "Discover Timpl's staffing and business process solutions for industries like automotive, logistics, and finance. Browse available job opportunities.",
      url: `${baseUrl}/jobs`,
      siteName: "Timpl",
      type: "website",
      images: [
        {
          url: `${baseUrl}/jobsHero.jpg`,
          width: 1200,
          height: 630,
          alt: "Timpl Job Board - Find Your Next Opportunity",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Explore Jobs — Timpl | Optimize Your Workforce",
      description: "Discover Timpl's staffing and business process solutions for industries like automotive, logistics, and finance.",
      images: [`${baseUrl}/jobsHero.jpg`],
    },
    alternates: {
      canonical: `${baseUrl}/jobs`,
    },
    other: {
      'google-site-verification': process.env.GOOGLE_SITE_VERIFICATION || '',
    },
  }
}

export default async function Page() {
  const headersList = await headers()
  const proto = headersList.get("x-forwarded-proto") || "http"
  const host = headersList.get("host")
  const baseUrl = `${proto}://${host}`

  let jobs = []

  try {
    // ✅ Fetch all jobs from Bullhorn API
    const res = await fetch(`${baseUrl}/api/bullhorn/jobs?all=true`, {
      cache: "no-store",
    })

    const contentType = res.headers.get("content-type") || ""

    if (res.ok && contentType.includes("application/json")) {
      const json = await res.json()
      jobs = json.jobs || [] // Use json.jobs
    } else {
      console.error("Jobs API did not return JSON:", await res.text())
    }
  } catch (err) {
    console.error("Failed to fetch jobs:", err)
  }

  // ✅ Build JSON-LD ItemList for all jobs
  const jobsListSchema =
    jobs.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Available Jobs at Timpl",
        description: "Browse current job opportunities at Timpl across various industries",
        numberOfItems: jobs.length,
        itemListElement: jobs.map((job, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "JobPosting",
            "@id": `${baseUrl}/job/${job.id}`,
            title: job.title,
            description: job.publicDescription || job.title || "Job opportunity at Timpl",
            url: `${baseUrl}/job/${job.id}`,
            hiringOrganization: {
              "@type": "Organization",
              name: "Timpl",
              url: baseUrl,
            },
            datePosted: job.dateAdded || new Date().toISOString().split('T')[0],
            validThrough: job.validThrough || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressLocality: job?.location || "Unknown", // city
                addressRegion: job?.state || "", // state/province
                postalCode: job?.zip || "", // ✅ correct property
              },
            },
            employmentType: job.type || "FULL_TIME",
          }
        })),
      }
      : null

  // ✅ Build BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Jobs",
        item: `${baseUrl}/jobs`
      }
    ]
  }

  return (
    <div>
      <div className="min-h-screen bg-white">
        <Navbar />

        {/* Inject JSON-LD */}
        {jobsListSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(jobsListSchema).replace(/</g, "\\u003c"),
            }}
          />
        )}

        {/* Inject Breadcrumb JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema).replace(/</g, "\\u003c"),
          }}
        />

  {/* Job Board UI with server-side jobs */}
  <JobBoardUI initialJobs={jobs} />

        <Footer />
      </div>
    </div>
  )
}
