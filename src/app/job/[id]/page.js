import Navbar from "@/components/navbar"
import { BriefcaseBusiness, Check } from "lucide-react"
import Footer from "@/footer"
import { notFound } from "next/navigation"
import SafeHtml from "@/components/ui/SafeHtml"
import { headers } from "next/headers"
import Link from "next/link"
import { htmlToText } from "html-to-text"

export async function generateMetadata({ params }) {
    const headersList = await headers()
    const proto = headersList.get("x-forwarded-proto") || "http"
    const host = headersList.get("host")
    const baseUrl = `${proto}://${host}`

    const { id } = await params
    const job = await fetch(`${baseUrl}/api/bullhorn/job/${id}`).then((res) =>
        res.json()
    )

    const desc =
        job.description?.slice(0, 160) ||
        job.title ||
        "Explore job openings at Timpl"
    const url = `${baseUrl}/job/${job.id}`
    const defaultOgImage =
        "https://timpl-next-js.vercel.app/og-image.jpg"

    return {
        title: job.title || "Job Opening at Timpl",
        description: desc,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: job.title,
            description: desc,
            url,
            siteName: "Timpl",
            type: "article",
            images: [
                {
                    url: defaultOgImage,
                    width: 1200,
                    height: 630,
                    alt: "Timpl Default Image",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: job.title,
            description: desc,
            images: [defaultOgImage],
        },
    }
}

export default async function JobPage({ params }) {
    try {
        const headersList = await headers()
        const proto = headersList.get("x-forwarded-proto") || "http"
        const host = headersList.get("host")
        const baseUrl = `${proto}://${host}`
        const { id } = await params
        const res = await fetch(`${baseUrl}/api/bullhorn/job/${id}`)
        if (!res.ok) {
            return notFound()
        }
        const job = await res.json()
        console.log("jobsssss", job)

        // ✅ JSON-LD schema
        const jobPostingSchema = {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job?.title || "Job Title",
            description: htmlToText(job?.description || ""),
            identifier: {
                "@type": "PropertyValue",
                name: "Timpl",
                value: job?.id || "N/A",
            },
            datePosted: new Date(
                job?.datePosted || job?.dateModified || new Date()
            ).toISOString(),
            validThrough: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            employmentType: "FULL_TIME",
            hiringOrganization: {
                "@type": "Organization",
                name: "Timpl",
                sameAs: baseUrl,
                logo: "https://images.squarespace-cdn.com/content/v1/675e3dc411683a20789d2e00/32179d29-8419-4e74-b0f8-dda1d212e037/White+Timpl+Drop+Shadow+72.png?format=1500w",
            },
            jobLocation: {
                "@type": "Place",
                address: {
                    "@type": "PostalAddress",
                    addressLocality: job?.location || "Unknown", // city
                    addressRegion: job?.state || "", // state/province
                    postalCode: job?.zip || "", // ✅ correct property
                },
            },
            ...(job?.salary && {
                baseSalary: {
                    "@type": "MonetaryAmount",
                    currency: job?.salaryCurrency || "USD",
                    value: {
                        "@type": "QuantitativeValue",
                        unitText: (job?.salaryUnit || "YEAR").toUpperCase(),
                        ...(job?.customFloat1
                            ? {
                                  minValue: Number(job.salary),
                                  maxValue: Number(job.customFloat1),
                              }
                            : {
                                  value: Number(job.salary),
                              }),
                    },
                },
            }),
        }

        return (
            <div className="min-h-screen">
                <Navbar />

                {/* ✅ Inject JSON-LD for Google */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(jobPostingSchema).replace(
                            /</g,
                            "\\u003c"
                        ),
                    }}
                />

                <div className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8 xl:px-24 bg-white min-h-screen">
                    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 sm:gap-8 lg:gap-12">
                        {/* Left Column */}
                        <div className="space-y-6 sm:space-y-8">
                            <section
                                className="bg-white rounded-lg p-4 sm:p-6 lg:p-8"
                                style={{
                                    boxShadow:
                                        "0 4px 8px rgba(0,0,0,0.1), 0 -4px 8px rgba(0,0,0,0.1)",
                                }}
                            >
                                <SafeHtml html={job.description} />
                            </section>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6 sm:space-y-8 self-start sticky top-24">
                            {/* Job Info */}
                            <div className="border border-solid border-gray-300 p-4 sm:p-6 rounded-lg bg-white shadow-sm">
                                <h2 className="text-lg sm:text-xl font-bold text-indigo-800 mb-4 relative pb-2">
                                    Job Information
                                    <span className="absolute bottom-0 left-0 w-8 sm:w-10 h-0.5 bg-[#23baa1]" />
                                </h2>
                                <ul className="space-y-3 sm:space-y-4">
                                    {job.salary !== "" || job.customFloat1 !== "" ? (
                                        <li className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Salary</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">
                                                    {job.salary && job.customFloat1
                                                        ? `$${job.salary}/yr - $${job.customFloat1}/yr`
                                                        : job.salary
                                                            ? `$${job.salary}/yr`
                                                            : `$${job.customFloat1}/yr`}
                                                </div>
                                            </div>
                                        </li>
                                    ) : (
                                        <li className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Salary</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">Negotiable</div>
                                            </div>
                                        </li>
                                    )}
                                    {job.category !== "" && (
                                        <li className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Category</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">{job.category}</div>
                                            </div>
                                        </li>
                                    )}
                                    {(job.location !== "" || job.state !== "") && (
                                        <li className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Location</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">{job.location},{job.state}</div>
                                            </div>
                                        </li>
                                    )}
                                    {job.zip !== "" && job.zip !== "Not specified" && (
                                        <li className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Zip Code</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">{job.zip}</div>
                                            </div>
                                        </li>
                                    )}
                                    {job.dateModified !== "" && (
                                        <li className="flex items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Posted</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">
                                                    {new Date(job.dateModified).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                    {job.experience !== "" && (
                                        <li className="flex items-start gap-3 sm:gap-4">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Experience</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">{job.experience}</div>
                                            </div>
                                        </li>
                                    )}
                                    {job.submissions !== 0 && (
                                        <li className="flex items-start gap-3 sm:gap-4">
                                            <div className="relative w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 mt-1">
                                                <BriefcaseBusiness className="w-4 h-4 sm:w-6 sm:h-6 text-indigo-800" />
                                                <Check className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2 h-2 sm:w-3 sm:h-3 text-[#23baa1] fill-[#23baa1]" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-semibold text-gray-800 text-sm sm:text-base">Applied</div>
                                                <div className="text-gray-600 text-xs sm:text-sm break-words">{job.submissions}</div>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                                <div className="flex flex-col mt-10 gap-3 w-full">
                                    <a
                                        href={`https://app.ableteams.com/profile/#/joynus/hq/job-apply?signup=true&jobId=${job.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full text-center px-4 py-4 border border-[#23baa1] text-[#23baa1] font-medium rounded-md text-sm sm:text-base transition hover:bg-blue-50"
                                    >
                                        Apply w/o Resume
                                    </a>
                                    <Link
                                        href={{
                                            pathname: "https://www.timpl.com/apply",
                                            query: { id: job.id },
                                        }}
                                        className="w-full text-center px-4 py-4 bg-[#23baa1] hover:bg-[#23baa1]/90 text-white font-medium rounded-md text-sm sm:text-base transition"
                                    >
                                        Apply Now
                                    </Link>
                                </div>
                                {/* ... keep your Job Information UI unchanged ... */}
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        )
    } catch (err) {
        console.error("Failed to fetch job:", err)
        return notFound()
    }
}
