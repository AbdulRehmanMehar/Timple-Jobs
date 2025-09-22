import { NextResponse } from 'next/server'
import { htmlToText } from 'html-to-text'

// Simple in-memory cache
let cacheData = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 1000 // 60 seconds

export async function GET() {
  try {
    const now = Date.now()

    // ✅ Serve from cache if fresh
    if (cacheData && now - cacheTimestamp < CACHE_DURATION) {
      console.log("Serving job list from cache")
      return NextResponse.json(cacheData, {
        headers: { 'Cache-Control': 'public, max-age=60' }
      })
    }

    const countPerPage = 500
    const jobsQuery = encodeURIComponent('(isOpen:1) AND (isDeleted:0)')
  const fields = 'id,title,employmentType,customFloat1,address(city,state),clientCorporation(id,name),publicDescription,publishedCategory(id,name),salary,salaryUnit,dateAdded,dateLastPublished,customFloat2'

    const baseUrl = `https://public-rest${process.env.BULLHORN_SWIMLANE}.bullhornstaffing.com/rest-services/${process.env.BULLHORN_CORP_TOKEN}/search/JobOrder`
    const firstUrl = `${baseUrl}?start=0&query=${jobsQuery}&fields=${fields}&count=${countPerPage}&sort=-dateLastPublished&showTotalMatched=true`

    const firstRes = await fetch(firstUrl)
    const firstData = await firstRes.json()

    if (!Array.isArray(firstData.data) || firstData.data.length === 0) {
      console.warn("No jobs returned or invalid response from Bullhorn.")
      return NextResponse.json({ jobs: [] })
    }

    let allJobs = firstData.data || []
    const totalMatched = firstData.totalMatched || allJobs.length
    const totalPages = Math.ceil(totalMatched / countPerPage)

    // Fetch remaining pages in parallel
    const pageUrls = []
    for (let i = 1; i < totalPages; i++) {
      const url = `${baseUrl}?start=${i * countPerPage}&query=${jobsQuery}&fields=${fields}&count=${countPerPage}&sort=-dateLastPublished`
      pageUrls.push(fetch(url).then(res => res.json()))
    }

    const pageResults = await Promise.all(pageUrls)
    pageResults.forEach(page => {
      if (Array.isArray(page.data)) {
        allJobs = allJobs.concat(page.data)
      }
    })

    const getDynamicDateLabel = (modifiedDate) => {
      if (!modifiedDate) return 'Unknown'
      const diffMs = now - new Date(modifiedDate).getTime()

      const seconds = Math.floor(diffMs / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      const months = Math.floor(days / 30)
      const years = Math.floor(days / 365)

      if (years >= 1) return `Last ${years} year${years > 1 ? 's' : ''}`
      if (months >= 1) return `Last ${months} month${months > 1 ? 's' : ''}`
      if (days >= 1) return `Last ${days} day${days > 1 ? 's' : ''}`
      if (hours >= 1) return `Last ${hours} hour${hours > 1 ? 's' : ''}`
      if (minutes >= 1) return `Last ${minutes} minute${minutes > 1 ? 's' : ''}`
      return 'Just now'
    }

  // Filter out jobs that have a value for customFloat2
  allJobs = allJobs.filter(job => job.customFloat2 == null)

  const jobs = allJobs.map(job => {
      const descriptionHtml = job.publicDescription || ''
      const descriptionText = htmlToText(descriptionHtml, { wordwrap: false }).replace(/\n+/g, ' ')

      const publishedCategory = job.publishedCategory?.name || ''
      const datePostedLabel = getDynamicDateLabel(job.dateLastPublished)
      const dateLastModifiedFormatted = job.dateLastPublished
        ? new Date(job.dateLastPublished).toISOString()
        : ''

      return {
        id: job.id,
        title: job.title,
        type: job.employmentType,
        city: job.address?.city || '',
        state: job.address?.state || '',
        customFloat1: job.customFloat1 || '',
        employer: job.clientCorporation?.name || '',
        clientCorporation: job.clientCorporation
          ? { id: job.clientCorporation.id, name: job.clientCorporation.name }
          : { id: '', name: '' },
        salary: job.salary || '',
        salaryUnit: job.salaryUnit || '',
        publicDescription: descriptionText,
        publishedCategory,
        dateModified: job.dateLastPublished || '',
        datePostedLabel,
        dateLastModifiedFormatted
      }
    })

    const result = { jobs }

    // ✅ Save to cache
    cacheData = result
    cacheTimestamp = now

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    })

  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
