"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, User, Menu, X } from "lucide-react"
import { SheetTitle } from "@/components/ui/sheet"

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const dropdowns = [
        {
            label: "Staffing",
            key: "staffing",
            items: [
                { label: "Temporary", href: "https://www.timpl.com/staffing/temporary" },
                { label: "Temp-to-Hire", href: "https://www.timpl.com/staffing/temp-to-hire" },
                { label: "On Site Support", href: "https://www.timpl.com/staffing/on-site" },
                { label: "Safety & Compliance", href: "https://www.timpl.com/staffing/safety-compliance" },
            ],
        },
        {
            label: "Solutions",
            key: "solutions",
            items: [
                { label: "Staffing", href: "https://www.timpl.com/solution/staffing" },
                { label: "Direct Hire", href: "https://www.timpl.com/solution/direct-hire" },
                { label: "RPO", href: "https://www.timpl.com/solution/rpo" },
                { label: "BPO", href: "https://www.timpl.com/solution/bpo" },
                { label: "Accounting BPO", href: "https://www.timpl.com/solution/bpo/accounting-bpo" },
            ],
        },
        {
            label: "Industry",
            key: "industry",
            items: [
                { label: "Automotive", href: "https://www.timpl.com/industry/automotive" },
                { label: "Warehousing & Logistics", href: "https://www.timpl.com/industry/warehouse-logistics" },
                { label: "EV Energy Solution", href: "https://www.timpl.com/industry/energy-solution" },
                { label: "Finance & Accounting", href: "https://www.timpl.com/industry/finance-accounting" },
            ],
        },
    ]

    const [desktopDropdowns, setDesktopDropdowns] = useState({
        staffing: false,
        solutions: false,
        industry: false,
    })

    const dropdownTimeoutRefs = {
        staffing: useRef(null),
        solutions: useRef(null),
        industry: useRef(null),
    }

    const [mobileDropdownStates, setMobileDropdownStates] = useState({
        staffing: false,
        solutions: false,
        industry: false,
    })

    const toggleMobileDropdown = (key) => {
        setMobileDropdownStates((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const handleMouseEnter = (key) => {
        if (dropdownTimeoutRefs[key].current) clearTimeout(dropdownTimeoutRefs[key].current)
        setDesktopDropdowns((prev) => ({ ...prev, [key]: true }))
    }

    const handleMouseLeave = (key) => {
        dropdownTimeoutRefs[key].current = setTimeout(() => {
            setDesktopDropdowns((prev) => ({ ...prev, [key]: false }))
        }, 150)
    }

    const navItemClass =
        "cursor-pointer text-timpl-dark-blue font-medium text-lg px-3 py-2 hover:bg-timpl-light-purple transition rounded-md"

    const renderDesktopDropdown = ({ label, key, items }) => (
        <div key={key} className="group relative">
            <DropdownMenu
                open={desktopDropdowns[key]}
                onOpenChange={(val) => setDesktopDropdowns((prev) => ({ ...prev, [key]: val }))}
            >
                <DropdownMenuTrigger
                    asChild
                    onMouseEnter={() => handleMouseEnter(key)}
                    onMouseLeave={() => handleMouseLeave(key)}
                >
                    <Button variant="ghost" className={`${navItemClass} relative`}>
                        {label} <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="bg-[#221668] text-white border-l-4 border-transparent group-hover:border-[#23baa1] rounded-md min-w-[200px] p-1"
                    onMouseEnter={() => handleMouseEnter(key)}
                    onMouseLeave={() => handleMouseLeave(key)}
                >
                    {items.map(({ label, href }, i) => (
                        <Link key={i} href={href} target="_blank">
                            <DropdownMenuItem
                                className="cursor-pointer bg-[#221668] text-base text-white border-l-4 border-transparent 
                                data-[highlighted]:text-[#23baa1] data-[highlighted]:border-[#23baa1] 
                                data-[highlighted]:bg-transparent transition-all duration-200 transform data-[highlighted]:-translate-x-1"
                            >
                                {label}
                            </DropdownMenuItem>
                        </Link>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )

    return (
        <nav className="w-full bg-white shadow-md px-4 sm:px-6 sticky top-0 z-50 lg:static">
            <div className="flex items-center justify-between h-[60px] md:h-[70px] lg:h-[100px]">
                <Link href="#" className="flex items-center space-x-2 cursor-pointer">
                    <Image
                        src="https://images.squarespace-cdn.com/content/v1/675e3dc411683a20789d2e00/32179d29-8419-4e74-b0f8-dda1d212e037/White+Timpl+Drop+Shadow+72.png?format=1500w"
                        alt="Timpl logo"
                        width={100}
                        height={100}
                        className="object-contain"
                    />
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex flex-grow justify-end items-center space-x-2">
                    {dropdowns.map(renderDesktopDropdown)}
                    <Link href="https://www.timpl.com/success" className={navItemClass}>
                        Case Study
                    </Link>
                    <Link href="https://www.timpl.com/about" className={navItemClass}>
                        About
                    </Link>
                    <Link href="https://www.timpl.com/blog" className={navItemClass}>
                        News
                    </Link>
                    <Link href="https://www.timpl.com/contact" className={navItemClass}>
                        Contact
                    </Link>
                    <Link href="/jobs" className={navItemClass}>
                        Explore Jobs
                    </Link>
                </div>

                {/* Mobile Menu Trigger */}
                <div className="lg:hidden flex items-center">
                    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Toggle mobile menu">
                                {mobileMenuOpen ? (
                                    <X className="h-16 w-16 text-timpl-dark-blue" />
                                ) : (
                                    <Menu className="h-16 w-16 text-timpl-dark-blue" />
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-white p-0 overflow-y-auto">
                            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
                            <div className="flex flex-col py-4 px-4 space-y-1 mt-10">
                                {dropdowns.map(({ label, key, items }) => (
                                    <div key={key} className="border-b border-gray-100 last:border-b-0">
                                        <Collapsible open={mobileDropdownStates[key]} onOpenChange={() => toggleMobileDropdown(key)}>
                                            <CollapsibleTrigger className="cursor-pointer w-full text-left flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-md transition-colors">
                                                <span className="text-timpl-dark-blue font-medium text-base">{label}</span>
                                                <ChevronDown
                                                    className={`h-4 w-4 text-timpl-dark-blue transition-transform duration-200 ${mobileDropdownStates[key] ? "rotate-180" : ""
                                                        }`}
                                                />
                                            </CollapsibleTrigger>
                                            <CollapsibleContent className="overflow-hidden">
                                                <div className="pb-2">
                                                    {items.map(({ label, href }, i) => (
                                                        <Link
                                                            key={i}
                                                            href={href}
                                                            target="_blank"
                                                            className="block py-2 px-6 text-timpl-dark-blue font-medium text-sm hover:bg-timpl-light-purple hover:text-timpl-dark-blue transition-colors rounded-md mx-2"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {label}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </div>
                                ))}

                                <div className="pt-2 space-y-1">
                                    <Link
                                        href="https://www.timpl.com/success"
                                        className="block py-3 px-2 text-timpl-dark-blue font-medium text-base hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Case Study
                                    </Link>
                                    <Link
                                        href="https://www.timpl.com/about"
                                        className="block py-3 px-2 text-timpl-dark-blue font-medium text-base hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        About
                                    </Link>
                                    <Link
                                        href="https://www.timpl.com/blog"
                                        className="block py-3 px-2 text-timpl-dark-blue font-medium text-base hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        News
                                    </Link>
                                    <Link
                                        href="https://www.timpl.com/contact"
                                        className="block py-3 px-2 text-timpl-dark-blue font-medium text-base hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Contact
                                    </Link>
                                    <Link
                                        href="/jobs"
                                        className="block py-3 px-2 text-timpl-dark-blue font-medium text-base hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Explore Jobs
                                    </Link>
                                    <Link
                                        href="#"
                                        className="flex items-center space-x-2 py-3 px-2 text-timpl-dark-blue hover:text-timpl-red hover:bg-gray-50 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <User className="h-5 w-5" />
                                        <span className="font-medium text-base">Login/Register</span>
                                    </Link>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </nav>
    )
}
