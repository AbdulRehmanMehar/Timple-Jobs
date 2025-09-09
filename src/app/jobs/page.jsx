
import Navbar from "@/components/navbar"
import JobBoardUI from "@/components/JobBoardUI/JobBoardUI"
import Footer from "@/footer"
import { headers } from 'next/headers';

export const generateMetadata = async () => {
  const headersList = await headers();
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const host = headersList.get('host');
  const baseUrl = `${proto}://${host}`;

  return {
    title: "Explore Jobs — Timpl | Optimize Your Workforce",
    description:
      "Discover Timpl's staffing and business process solutions for industries like automotive, logistics, and finance. Explore case studies and tailored recruitment options.",
    keywords: [
      "Timpl jobs",
      "staffing solutions",
      "business process outsourcing",
      "workforce optimization",
      "industry-specific recruitment"
    ],
    alternates: {
      canonical: `${baseUrl}/jobs`,
    },
    openGraph: {
      title: "Explore Jobs — Timpl | Optimize Your Workforce",
      description:
        "Discover Timpl's staffing and business process solutions for industries like automotive, logistics, and finance. Explore case studies and tailored recruitment options.",
      url: `${baseUrl}/jobs`,
      siteName: "Timpl",
    },
    twitter: {
      card: "summary_large_image",
      title: "Explore Jobs — Timpl | Optimize Your Workforce",
      description:
        "Discover Timpl's staffing and business process solutions for industries like automotive, logistics, and finance. Explore case studies and tailored recruitment options.",
    },
  }
}


export default function Page() {
  return (
    <div>
      <div className="min-h-screen bg-white">
        <Navbar />
        <JobBoardUI />
        <Footer />
      </div>
    </div>
  )
}
