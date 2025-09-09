import { NextResponse } from "next/server"
import { htmlToText } from "html-to-text"

export const dynamic = "force-dynamic"

// Escape Lucene special characters
function escapeBullhornKeyword(str) {
  return str.replace(/([+\-!():{}[\]^"~*?\\/])/g, "\\$1")
}

// Improved keyword formatting - more lenient for multi-word searches
function formatKeyword(keyword) {
  // Remove punctuation completely
  const normalized = keyword
    .replace(/[^a-zA-Z0-9\s]/g, " ") // remove everything except letters/numbers/spaces
    .replace(/\s+/g, " ") // collapse spaces
    .trim()

  const escaped = escapeBullhornKeyword(normalized)

  // If multiple words, use a more lenient approach
  if (escaped.includes(" ")) {
    const terms = escaped.split(/\s+/).map((t) => `${t}*`)
    const exactPhrase = `"${escaped}"`

    // Create multiple search strategies:
    // 1. Exact phrase match
    // 2. First word + any other word
    // 3. All words present (AND)
    // 4. Any word present (OR) - as fallback
    const firstWord = terms[0]
    const otherWords = terms.slice(1)

    const strategies = [
      exactPhrase, // "electrical eng"
      firstWord, // electrical* (most important - ensures we get at least as many as single word)
    ]

    // Add combinations with other words
    if (otherWords.length > 0) {
      const firstWordWithOthers = otherWords.map((word) => `(${firstWord} AND ${word})`).join(" OR ")
      strategies.push(`(${firstWordWithOthers})`)

      // Also add OR combination as fallback
      strategies.push(`(${terms.join(" OR ")})`)
    }

    return `(${strategies.join(" OR ")})`
  }

  return `${escaped}*`
}

// Alternative more aggressive approach - if the above doesn't work
function formatKeywordAggressive(keyword) {
  const normalized = keyword
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  const escaped = escapeBullhornKeyword(normalized)

  if (escaped.includes(" ")) {
    const terms = escaped.split(/\s+/).map((t) => `${t}*`)
    const exactPhrase = `"${escaped}"`
    const firstWord = terms[0] // Most important term
    const allWords = `(${terms.join(" AND ")})`
    const anyWord = `(${terms.join(" OR ")})`

    // Priority order: exact phrase, first word (ensures minimum results), all words, any word
    return `(${exactPhrase} OR ${firstWord} OR ${allWords} OR ${anyWord})`
  }

  return `${escaped}*`
}

// Build Bullhorn query string for initial job fetch
function buildBullhornQuery({ selectedCategories, selectedTypes, selectedCities, selectedStates, keyword }) {
  const queryParts = ["(isOpen:1)", "(isDeleted:0)"]

  if (selectedCategories.length > 0) {
    const categoryConditions = selectedCategories.map((cat) => `publishedCategory.id:${cat}`).join(" OR ")
    queryParts.push(`(${categoryConditions})`)
  }

  if (selectedTypes.length > 0) {
    const typeConditions = selectedTypes.map((t) => `employmentType:"${t}"`).join(" OR ")
    queryParts.push(`(${typeConditions})`)
  }

  if (selectedCities.length > 0) {
    const cityConditions = selectedCities.map((city) => `address.city:"${city}"`).join(" OR ")
    queryParts.push(`(${cityConditions})`)
  }

  if (selectedStates.length > 0) {
    const stateConditions = selectedStates.map((state) => `address.state:"${state}"`).join(" OR ")
    queryParts.push(`(${stateConditions})`)
  }

  if (keyword) {
    const kw = formatKeywordAggressive(keyword) // Use the more aggressive approach
    const keywordCondition = `(title:${kw} OR publicDescription:${kw} OR address.city:${kw} OR address.state:${kw} OR employmentType:${kw})`
    queryParts.push(keywordCondition)
  }

  return queryParts.join(" AND ")
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const parseParam = (param) =>
    (param || "")
      .split(",")
      .map((v) => decodeURIComponent(v.trim().toLowerCase()))
      .filter(Boolean)

  const selectedCategories = parseParam(searchParams.get("categories"))
  const selectedTypes = parseParam(searchParams.get("types"))
  const selectedCities = parseParam(searchParams.get("cities"))
  const selectedStates = parseParam(searchParams.get("states"))
  const selectedSalaryOption = (searchParams.get("salaryOption") || "").trim().toLowerCase()
  const keyword = (searchParams.get("keyword") || "").trim().toLowerCase()
  const dateRangeParam = searchParams.get("dateModified") || ""
  const searchedJobIdsParam = searchParams.get("searchedJobIds") || ""
  const keywordOnlyIds = searchedJobIdsParam
    ? searchedJobIdsParam
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
    : []


  const now = Date.now()

  const isAnyFilterSelected = () =>
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedCities.length > 0 ||
    selectedStates.length > 0 ||
    selectedSalaryOption ||
    dateRangeParam

  const getStartDateFromRange = (rangeString) => {
    const lower = rangeString.toLowerCase()
    const now = new Date()

    if (lower.includes("last 24 hours")) return new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const daysMatch = lower.match(/last\s+(\d+)\s+(day|days)/)
    const weeksMatch = lower.match(/last\s+(\d+)\s+(week|weeks)/)
    const monthsMatch = lower.match(/last\s+(\d+)\s+(month|months)/)

    if (daysMatch) return new Date(now.getTime() - Number.parseInt(daysMatch[1]) * 24 * 60 * 60 * 1000)
    if (weeksMatch) return new Date(now.getTime() - Number.parseInt(weeksMatch[1]) * 7 * 24 * 60 * 60 * 1000)
    if (monthsMatch) return new Date(now.setMonth(now.getMonth() - Number.parseInt(monthsMatch[1])))

    return null
  }

  const startDate = getStartDateFromRange(dateRangeParam)
  const stripTime = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const getDynamicDateLabel = (modifiedDate) => {
    const diff = now - new Date(modifiedDate).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days >= 365) return `Last ${Math.floor(days / 365)} year`
    if (days >= 30) return `Last ${Math.floor(days / 30)} month`
    if (days >= 1) return `Last ${days} day`
    return "Today"
  }

  try {
    const staticRestUrl = "https://public-rest41.bullhornstaffing.com/rest-services/4NF2TD"
    let jobUrl
    let bullhornQuery

    if (keyword && !isAnyFilterSelected()) {
      const kw = formatKeywordAggressive(keyword)
      bullhornQuery = `(isOpen:1) AND (isDeleted:0) AND (title:${kw} OR publicDescription:${kw} OR address.city:${kw} OR address.state:${kw} OR employmentType:${kw})`
      jobUrl = `${staticRestUrl}/search/JobOrder?start=0&query=${encodeURIComponent(bullhornQuery)}&fields=id,title,employmentType,address(city,state),clientCorporation(id,name),customText1,customFloat1,publicDescription,publishedCategory(id,name),salary,salaryUnit,dateAdded,dateLastPublished&count=500&sort=-dateLastPublished&showTotalMatched=true`
    } else if (keyword && isAnyFilterSelected() && keywordOnlyIds.length > 0) {
      // If keyword and at least one filter exist, add keywordOnlyIds to the query
      bullhornQuery = buildBullhornQuery({
        selectedCategories,
        selectedTypes,
        selectedCities,
        selectedStates,
        keyword,
      })
      // Add keywordOnlyIds to the query
      const keywordIdsQuery = keywordOnlyIds.map((id) => `id:${id}`).join(" OR ")
      bullhornQuery = `(${bullhornQuery}) AND (${keywordIdsQuery})`
      jobUrl = `${staticRestUrl}/search/JobOrder?start=0&query=${encodeURIComponent(bullhornQuery)}&fields=id,title,employmentType,address(city,state),clientCorporation(id,name),customText1,customFloat1,publicDescription,publishedCategory(id,name),salary,salaryUnit,dateAdded,dateLastPublished&count=500&sort=-dateLastPublished&showTotalMatched=true`
    } else {
      bullhornQuery = buildBullhornQuery({
        selectedCategories,
        selectedTypes,
        selectedCities,
        selectedStates,
        keyword,
      })
      jobUrl = `${staticRestUrl}/search/JobOrder?start=0&query=${encodeURIComponent(bullhornQuery)}&fields=id,title,employmentType,address(city,state),clientCorporation(id,name),customText1,customFloat1,publicDescription,publishedCategory(id,name),salary,salaryUnit,dateAdded,dateLastPublished&count=500&sort=-dateLastPublished&showTotalMatched=true`
    }

    const jobRes = await fetch(jobUrl)
    const jobData = await jobRes.json()
    const allJobs = jobData.data || []

    const jobs = allJobs.map((job) => {
      const publicDescriptionText = htmlToText(job.publicDescription || "", { wordwrap: false }).replace(/\n+/g, " ")
      const categoryName = job.publishedCategory?.name?.trim().toLowerCase() || ""
      const categoryId = job.publishedCategory?.id?.toString().trim() || ""

      return {
        id: job.id,
        title: job.title,
        type: job.employmentType?.trim() || "",
        typeNormalized: job.employmentType?.trim().toLowerCase() || "",
        city: job.address?.city?.trim().toLowerCase() || "",
        state: job.address?.state?.trim().toLowerCase() || "",
        salaryUnit: job.salaryUnit?.trim().toLowerCase() || "",
        salary: job.salary || "",
        customFloat1: job.customFloat1 || "",
        publicDescription: publicDescriptionText,
        publishedCategory: categoryName,
        publishedCategoryId: categoryId,
        dateModified: job.dateLastPublished,
        datePostedLabel: getDynamicDateLabel(job.dateLastPublished),
        dateLastModifiedFormatted: job.dateLastPublished ? new Date(job.dateLastPublished).toLocaleString() : "",
      }
    })

    // Helper to normalize strings for flexible matching
    const normalizeForMatch = (str) => {
      return (str || "")
        .toString()
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase()
    }

    const filterJobsExcluding = (excludeKey) => {
      return jobs.filter((job) => {
        const match = (cond, skip) => skip || cond

        const matchCategory = match(
          selectedCategories.length === 0 || selectedCategories.includes(job.publishedCategoryId),
          excludeKey === "category",
        )

        const matchType = match(
          selectedTypes.length === 0 || selectedTypes.some((sel) => job.typeNormalized.includes(sel)),
          excludeKey === "type",
        )

        const matchCities = match(
          selectedCities.length === 0 || selectedCities.some((sel) => job.city.includes(sel)),
          excludeKey === "city",
        )

        const matchStates = match(
          selectedStates.length === 0 || selectedStates.some((sel) => job.state.includes(sel)),
          excludeKey === "state",
        )

        const matchSalaryOption =
          !selectedSalaryOption || (job.salaryUnit && job.salaryUnit.includes(selectedSalaryOption))
        const matchDate =
          !startDate || (job.dateModified && stripTime(new Date(job.dateModified)) >= stripTime(startDate))

        // More lenient keyword matching for multi-word searches
        const matchKeyword =
          !keyword ||
          (() => {
            const normalizedKeyword = normalizeForMatch(keyword)
            const jobText = normalizeForMatch(
              `${job.title} ${job.publicDescription} ${job.city} ${job.state} ${job.type}`,
            )

            // For multi-word keywords, use more lenient matching
            if (normalizedKeyword.includes(" ")) {
              const keywordTerms = normalizedKeyword.split(/\s+/)
              const firstTerm = keywordTerms[0]

              // Must contain the first term (primary keyword)
              const hasFirstTerm = jobText.includes(firstTerm)

              // Check if any other terms are present (bonus, but not required)
              const hasOtherTerms = keywordTerms.slice(1).some(
                (term) => jobText.includes(term) || jobText.includes(term.substring(0, 3)), // partial match
              )

              // Accept if has first term, bonus points for other terms
              return hasFirstTerm
            } else {
              // Single word search - check if it exists in any field
              return jobText.includes(normalizedKeyword)
            }
          })()

        return (
          matchCategory && matchType && matchCities && matchStates && matchSalaryOption && matchDate && matchKeyword
        )
      })
    }

    const filteredJobs = filterJobsExcluding(null)

    if (isAnyFilterSelected() && keyword) {
      const filterMap = {
        categories: selectedCategories,
        types: selectedTypes,
        cities: selectedCities,
        states: selectedStates,
      }

      const activeFilters = Object.entries(filterMap).filter(([k, v]) => v.length > 0)
      const presentFilterKeys = Object.keys(filterMap).filter((key) => filterMap[key].length > 0)

      const separateResults = {}

      // Helper: add keywordOnlyIds to the query parts
      const addKeywordIdFilter = (parts) => {
        if (keywordOnlyIds?.length) {
          const keywordConditions = keywordOnlyIds.map((id) => `id:${id}`).join(" OR ")
          parts.push(`(${keywordConditions})`)
        }
      }

      const filterKeys = ["categories", "types", "cities", "states"]

      if (activeFilters.length === 1) {
        filterKeys.forEach((filterKey) => {
          const queryParts = ["(isOpen:1)", "(isDeleted:0)"]

          presentFilterKeys.forEach((presentKey) => {
            if (presentKey === filterKey) return
            if (presentKey === "categories") {
              queryParts.push(`(${selectedCategories.map((cat) => `publishedCategory.id:${cat}`).join(" OR ")})`)
            }
            if (presentKey === "types") {
              queryParts.push(`(${selectedTypes.map((t) => `employmentType:\"${t}\"`).join(" OR ")})`)
            }
            if (presentKey === "cities") {
              queryParts.push(`(${selectedCities.map((city) => `address.city:\"${city}\"`).join(" OR ")})`)
            }
            if (presentKey === "states") {
              queryParts.push(`(${selectedStates.map((state) => `address.state:\"${state}\"`).join(" OR ")})`)
            }
          })

          // Always restrict to keywordOnlyIds
          addKeywordIdFilter(queryParts)

          const filterQuery = queryParts.join(" AND ")
          const filterUrl = `${staticRestUrl}/search/JobOrder?query=${encodeURIComponent(filterQuery)}&count=500&fields=id&sort=id`
          separateResults[filterKey] = filterUrl
        })
      } else if (activeFilters.length > 1) {
        filterKeys.forEach((filterKey) => {
          const queryParts = ["(isOpen:1)", "(isDeleted:0)"]
          const isActive = presentFilterKeys.includes(filterKey)

          presentFilterKeys.forEach((presentKey) => {
            if (isActive && presentKey === filterKey) return
            if (presentKey === "categories") {
              queryParts.push(`(${selectedCategories.map((cat) => `publishedCategory.id:${cat}`).join(" OR ")})`)
            }
            if (presentKey === "types") {
              queryParts.push(`(${selectedTypes.map((t) => `employmentType:\"${t}\"`).join(" OR ")})`)
            }
            if (presentKey === "cities") {
              queryParts.push(`(${selectedCities.map((city) => `address.city:\"${city}\"`).join(" OR ")})`)
            }
            if (presentKey === "states") {
              queryParts.push(`(${selectedStates.map((state) => `address.state:\"${state}\"`).join(" OR ")})`)
            }
          })

          // Always restrict to keywordOnlyIds
          addKeywordIdFilter(queryParts)

          const filterQuery = queryParts.join(" AND ")
          const filterUrl = `${staticRestUrl}/search/JobOrder?query=${encodeURIComponent(filterQuery)}&count=500&fields=id&sort=id`
          separateResults[filterKey] = filterUrl
        })
      }

      if (Object.keys(separateResults).length > 0) {
        const fetchResults = async () => {
          const resultData = {}
          for (const [key, url] of Object.entries(separateResults)) {
            try {
              const res = await fetch(url)
              const data = await res.json()
              resultData[key] = {
                total: data.total || 0,
                start: data.start || 0,
                count: data.count || (data.data ? data.data.length : 0),
                data: data.data || [],
              }
            } catch (e) {
              resultData[key] = { error: e.message }
            }
          }
          return resultData
        }

        const allResults = await fetchResults()
        const categories = (allResults["categories"]?.data || []).map((job) => job.id)
        const types = (allResults["types"]?.data || []).map((job) => job.id)
        const cities = (allResults["cities"]?.data || []).map((job) => job.id)
        const states = (allResults["states"]?.data || []).map((job) => job.id)

        return NextResponse.json({ jobs: filteredJobs, categories, types, cities, states })
      }
    }

    const filterMap = {
      categories: selectedCategories,
      types: selectedTypes,
      cities: selectedCities,
      states: selectedStates,
    }
    const activeFilters = Object.entries(filterMap).filter(([k, v]) => v.length > 0)
    // If only one filter is present, run only starting url and 3 queries (with each filter)
    const separateResults = {}
    const presentFilterKeys = Object.keys(filterMap).filter((key) => filterMap[key].length > 0)
    if (activeFilters.length === 1) {
      // For each filter, build a query that excludes that filter if it is present, and includes all other present filters
      ;["categories", "types", "cities", "states"].forEach((filterKey) => {
        const queryParts = ["(isOpen:1)", "(isDeleted:0)"]
        presentFilterKeys.forEach((presentKey) => {
          if (presentKey === filterKey) return
          if (presentKey === "categories") {
            const categoryConditions = selectedCategories.map((cat) => `publishedCategory.id:${cat}`).join(" OR ")
            queryParts.push(`(${categoryConditions})`)
          }
          if (presentKey === "types") {
            const typeConditions = selectedTypes.map((t) => `employmentType:\"${t}\"`).join(" OR ")
            queryParts.push(`(${typeConditions})`)
          }
          if (presentKey === "cities") {
            const cityConditions = selectedCities.map((city) => `address.city:\"${city}\"`).join(" OR ")
            queryParts.push(`(${cityConditions})`)
          }
          if (presentKey === "states") {
            const stateConditions = selectedStates.map((state) => `address.state:\"${state}\"`).join(" OR ")
            queryParts.push(`(${stateConditions})`)
          }
        })
        const filterQuery = queryParts.join(" AND ")
        const filterUrl = `${staticRestUrl}/search/JobOrder?query=${encodeURIComponent(filterQuery)}&count=500&fields=id&sort=id`
        separateResults[filterKey] = filterUrl
      })
    } else if (activeFilters.length > 1) {
      // For each filter, build a query:
      // - If the filter is active, exclude itself and include all other active filters
      // - If the filter is inactive, include all active filters
      ;["categories", "types", "cities", "states"].forEach((filterKey) => {
        const queryParts = ["(isOpen:1)", "(isDeleted:0)"]
        // Check if this filter is active
        const isActive = presentFilterKeys.includes(filterKey)
        presentFilterKeys.forEach((presentKey) => {
          if (isActive && presentKey === filterKey) return // Exclude itself if active
          if (presentKey === "categories") {
            const categoryConditions = selectedCategories.map((cat) => `publishedCategory.id:${cat}`).join(" OR ")
            queryParts.push(`(${categoryConditions})`)
          }
          if (presentKey === "types") {
            const typeConditions = selectedTypes.map((t) => `employmentType:\"${t}\"`).join(" OR ")
            queryParts.push(`(${typeConditions})`)
          }
          if (presentKey === "cities") {
            const cityConditions = selectedCities.map((city) => `address.city:\"${city}\"`).join(" OR ")
            queryParts.push(`(${cityConditions})`)
          }
          if (presentKey === "states") {
            const stateConditions = selectedStates.map((state) => `address.state:\"${state}\"`).join(" OR ")
            queryParts.push(`(${stateConditions})`)
          }
        })
        const filterQuery = queryParts.join(" AND ")
        const filterUrl = `${staticRestUrl}/search/JobOrder?query=${encodeURIComponent(filterQuery)}&count=500&fields=id&sort=id`
        separateResults[filterKey] = filterUrl
      })
    }

    // For demonstration, return the separateResults object if it exists
    if (Object.keys(separateResults).length > 0) {
      // Fetch results for each query and return them in the response, including total, start, count
      const fetchResults = async () => {
        const resultData = {}
        for (const [key, url] of Object.entries(separateResults)) {
          try {
            const res = await fetch(url)
            const data = await res.json()
            resultData[key] = {
              total: data.total || 0,
              start: data.start || 0,
              count: data.count || (data.data ? data.data.length : 0),
              data: data.data || [],
            }
          } catch (e) {
            resultData[key] = { error: e.message }
          }
        }
        return resultData
      }
      const allResults = await fetchResults()
      // Build response with only ids for each filter, each as a separate key
      const categories = (allResults["categories"]?.data || []).map((job) => job.id)
      const types = (allResults["types"]?.data || []).map((job) => job.id)
      const cities = (allResults["cities"]?.data || []).map((job) => job.id)
      const states = (allResults["states"]?.data || []).map((job) => job.id)
      return NextResponse.json({ jobs: filteredJobs, categories, types, cities, states })
    }
    return NextResponse.json({ jobs: filteredJobs })
  } catch (error) {
    console.error("Error filtering jobs:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
