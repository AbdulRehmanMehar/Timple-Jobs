import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const {
      jobIds,
      savedCategoriesJobIds,
      savedStatesJobIds,
      savedCitiesJobIds,
      savedTypesJobIds,
    } = await req.json()

    const isNonEmptyArray = arr => Array.isArray(arr) && arr.length > 0;
    const getIdsString = arr => encodeURIComponent((isNonEmptyArray(arr) ? arr : jobIds).join(','));
    if (!isNonEmptyArray(jobIds)) {
      return NextResponse.json({ error: 'Missing or invalid jobIds for filtering' }, { status: 400 })
    }

    const baseUrl = `https://public-rest${process.env.BULLHORN_SWIMLANE}.bullhornstaffing.com/rest-services/${process.env.BULLHORN_CORP_TOKEN}/query/JobBoardPost`;

    const urls = {
      employmentType: `${baseUrl}?where=id IN (${getIdsString(savedTypesJobIds)})&count=500&fields=employmentType,count(id)&groupBy=employmentType&orderBy=-count.id`,
      publishedCategory: `${baseUrl}?where=id IN (${getIdsString(savedCategoriesJobIds)})&count=500&fields=publishedCategory(id,name),count(id)&groupBy=publishedCategory(id,name)&orderBy=publishedCategory.name`,
      state: `${baseUrl}?where=id IN (${getIdsString(savedStatesJobIds)})&count=500&fields=address(state),count(id)&groupBy=address(state)&orderBy=address.state`,
      city: `${baseUrl}?where=id IN (${getIdsString(savedCitiesJobIds)})&count=500&fields=address(city),count(id)&groupBy=address(city)&orderBy=address.city`
    };

    const responses = await Promise.all([
      fetch(urls.employmentType),
      fetch(urls.publishedCategory),
      fetch(urls.state),
      fetch(urls.city)
    ])


    const [employmentTypeData, publishedCategoryData, stateData, cityData] = await Promise.all(
      responses.map(res => res.json())
    )

    const jobTypes = (employmentTypeData.data || []).map(item => ({
      id: item.employmentType,
      name: item.employmentType,
      count: item.idCount
    }))

    const categories = (publishedCategoryData.data || []).map(item => ({
      id: item.publishedCategory?.id,
      name: item.publishedCategory?.name,
      count: item.idCount
    }))

    const states = (stateData.data || [])
      .filter(item => item.address?.state)
      .map(item => ({
        id: item.address.state,
        name: item.address.state,
        count: item.idCount
      }))

    const cities = (cityData.data || [])
      .filter(item => item.address?.city)
      .map(item => ({
        id: item.address.city,
        name: item.address.city,
        count: item.idCount
      }))

    const datePostedOptions = [
      { name: 'Last 30 Days', count: 0 },
      { name: 'Last 24 Hours', count: 0 },
      { name: 'Last 14 Days', count: 0 },
      { name: 'Last 2 Days', count: 0 },
      { name: 'Last 7 Days', count: 0 }
    ]

    const result = {
      categories,
      cities,
      states,
      jobTypes,
      salaryOptions: ['Per Hour', 'Per Week', 'Per Month', 'Per Year'],
      datePostedOptions
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=60' }
    })

  } catch (error) {
    console.error('Error getting filters:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
