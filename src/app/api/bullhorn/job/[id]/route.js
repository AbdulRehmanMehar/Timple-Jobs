import { NextResponse } from 'next/server'
import { htmlToText } from 'html-to-text'

export async function GET(request, context) {
  const { id: jobId } = await context.params

  if (!jobId) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400 })
  }

  try {
    const url = `https://public-rest41.bullhornstaffing.com/rest-services/4NF2TD/query/JobBoardPost?where=(id=${jobId})&fields=customFloat1,customFloat2,customFloat3,submissions(id),customText7,id,title,publishedCategory(id,name),address(city,state,zip),employmentType,dateLastPublished,publicDescription,isOpen,isPublic,isDeleted,payRate,publishedZip,salary,salaryUnit`

    const res = await fetch(url)
    const json = await res.json()
    const data = json?.data?.[0]

    if (!data || json.errorMessage) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const descriptionHtml = data.publicDescription || ''
    const descriptionText = htmlToText(descriptionHtml, { wordwrap: false }).replace(/\n+/g, ' ')

    const now = Date.now()
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
    const submissionCount = Array.isArray(data.submissions?.data)
      ? data.submissions.data.length
      : 0
    return NextResponse.json({
      id: data.id,
      title: data.title || 'Untitled',
      type: data.employmentType || 'Unknown',
      location: data.address?.city || 'Not specified',
      state: data.address?.state || 'Not specified',
      zip: data.address?.zip || 'Not specified',
      experience: data.customText7 || '',
      salary: data.salary || '',
      payRate: data.payRate || '',
      customFloat1: data.customFloat1 || '',
      customFloat2: data.customFloat2 || '',
      customFloat3: data.customFloat3 || '',
      description: descriptionHtml,
      descriptionText,
      dateModified: data.dateLastPublished || null,
      datePostedLabel: getDynamicDateLabel(data.dateLastPublished),
      category: data.publishedCategory?.name || 'Uncategorized',
      isOpen: data.isOpen,
      isPublic: data.isPublic,
      isDeleted: data.isDeleted,
      submissions: submissionCount
    })
  } catch (error) {
    console.error("Error fetching job details:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
