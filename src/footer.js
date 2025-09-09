import { Facebook, Youtube, Twitter, Linkedin, Instagram } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Component() {
  return (
    <footer className="bg-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Logo at top left */}
        <div className="mb-8">
          <div className="flex items-center space-x-1">
            <div className="w-20">
              <Link href="/">
                <Image
                  src="https://images.squarespace-cdn.com/content/v1/675e3dc411683a20789d2e00/1734229466146-X3XSJ5YJBGRZGSKWJSOZ/Timpl+Logo.png"
                  alt="Alzo logo"
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Home section */}
          <div>
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-lg"><Link href="/">Home</Link></h3>
              <div className="space-y-2">
                <Link href="https://www.timpl.com/about" className="block text-gray-600 hover:text-gray-900">
                  About us
                </Link>
                <Link href="https://www.timpl.com/contact" className="block text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
                <Link href="https://www.timpl.com/success" className="block text-gray-600 hover:text-gray-900">
                  Case Study
                </Link>
                <Link href="https://www.timpl.com/blog" className="block text-gray-600 hover:text-gray-900">
                  Blog
                </Link>
                <Link href="/jobs" className="block text-gray-600 hover:text-gray-900">
                  Jobs
                </Link>
              </div>
            </div>
          </div>

          {/* Staffing section */}
          <div>
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Staffing</h3>
              <div className="space-y-2">
                <Link href="https://www.timpl.com/staffing/temporary" className="block text-gray-600 hover:text-gray-900">
                  Temporary Staffing
                </Link>
                <Link href="https://www.timpl.com/staffing/temp-to-hire" className="block text-gray-600 hover:text-gray-900">
                  Temp-to-Hire
                </Link>
                <Link href="https://www.timpl.com/staffing/on-site" className="block text-gray-600 hover:text-gray-900">
                  On-Site Support
                </Link>
                <Link href="https://www.timpl.com/staffing/safety-compliance" className="block text-gray-600 hover:text-gray-900">
                  Safety & Compliance
                </Link>
              </div>
            </div>
          </div>

          {/* Solution section */}
          <div>
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Solution</h3>
              <div className="space-y-2">
                <Link href="https://www.timpl.com/solution/staffing" className="block text-gray-600 hover:text-gray-900">
                  Staffing
                </Link>
                <Link href="https://www.timpl.com/solution/direct-hire" className="block text-gray-600 hover:text-gray-900">
                  Direct Hire
                </Link>
                <Link href="https://www.timpl.com/solution/rpo" className="block text-gray-600 hover:text-gray-900">
                  RPO
                </Link>
                <Link href="https://www.timpl.com/solution/bpo" className="block text-gray-600 hover:text-gray-900">
                  BPO
                </Link>
                <Link href="https://www.timpl.com/solution/bpo/accounting-bpo" className="block text-gray-600 hover:text-gray-900">
                  Accounting BPO
                </Link>
              </div>
            </div>
          </div>

          {/* Industry section */}
          <div>
            <div className="space-y-3">
              <h3 className="font-bold text-gray-900 text-lg">Industry</h3>
              <div className="space-y-2">
                <Link href="https://www.timpl.com/industry/automotive" className="block text-gray-600 hover:text-gray-900">
                  Automotive
                </Link>
                <Link href="https://www.timpl.com/industry/energy-solution" className="block text-gray-600 hover:text-gray-900">
                  EV Energy Solution
                </Link>
                <Link href="https://www.timpl.com/industry/warehouse-logistics" className="block text-gray-600 hover:text-gray-900">
                  Warehousing & Logistics
                </Link>
                <Link href="https://www.timpl.com/industry/finance-accounting" className="block text-gray-600 hover:text-gray-900">
                  Finance & Accounting
                </Link>
              </div>
            </div>
          </div>

          {/* Award badge */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-48 h-48 relative">
              <Image
                src="/bestof.png"
                alt="Best of Staffing Award"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Social media icons */}
        <div className="flex justify-center space-x-6 mb-8">
          <a
            href="https://www.facebook.com/timplinc"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <Facebook className="w-6 h-6" />
          </a>
          <a
            href="https://www.youtube.com/@TimplCareers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <Youtube className="w-6 h-6" />
          </a>
          <a
            href="https://x.com/timplcareers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <Twitter className="w-6 h-6" />
          </a>
          <a
            href="https://www.linkedin.com/company/timplcareers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <Linkedin className="w-6 h-6" />
          </a>
          <a
            href="https://www.instagram.com/timpl.careers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-gray-900"
          >
            <Instagram className="w-6 h-6" />
          </a>
        </div>


        {/* Copyright */}
        <div className="text-left">
          <p className="text-gray-600">Copyright © 2025 Timpl. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
