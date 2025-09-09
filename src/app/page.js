"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push("/jobs") // or router.push
  }, [router])

  return null // optional: loading spinner
}
