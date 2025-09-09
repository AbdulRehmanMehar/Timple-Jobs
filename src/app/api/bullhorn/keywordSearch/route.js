import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { keyword, selectedCategories = [], selectedStates = [], selectedCities = [], selectedTypes = [] } = body;

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required.' }, { status: 400 });
    }

    const staticRestUrl = "https://public-rest41.bullhornstaffing.com/rest-services/4NF2TD";
    const filterParts = ["(isOpen:1)", "(isDeleted:0)"];

    if (selectedCategories.length > 0) {
      filterParts.push(`(${selectedCategories.map((cat) => `publishedCategory.id:${cat}`).join(" OR ")})`);
    }
    if (selectedStates.length > 0) {
      filterParts.push(`(${selectedStates.map((state) => `address.state:\"${state}\"`).join(" OR ")})`);
    }
    if (selectedCities.length > 0) {
      filterParts.push(`(${selectedCities.map((city) => `address.city:\"${city}\"`).join(" OR ")})`);
    }
    if (selectedTypes.length > 0) {
      filterParts.push(`(${selectedTypes.map((type) => `employmentType:\"${type}\"`).join(" OR ")})`);
    }
    // Use the keyword as-is, just append *
    const kw = `${keyword}*`;
    filterParts.push(`(publicDescription:${kw} OR title:${kw})`);
    const bullhornQuery = filterParts.join(" AND ");
    const jobUrl = `${staticRestUrl}/search/JobOrder?query=${encodeURIComponent(bullhornQuery)}&count=500&fields=id&sort=id`;

  const res = await fetch(jobUrl);
  const data = await res.json();
  // Extract only the IDs from the data
  const ids = Array.isArray(data.data) ? data.data.map(item => item.id) : [];
  return NextResponse.json(ids);
  } catch (e) {
    console.error("[Keyword+Filters] error:", e);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
