"use client"
import { useState, useEffect, useRef, useMemo } from "react"
import { MapPin, Clock, Search, Filter, X, ChevronDown } from "lucide-react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { Banknote } from "lucide-react"
import BeatLoader from "react-spinners/BeatLoader"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function JobBoardUI() {
  // State declarations (move to top)
  const [filters, setFilters] = useState({
    categories: [],
    cities: [],
    states: [],
    types: [],
    employers: [],
    experience: [],
    salaryOptions: [],
    datePostedOptions: [],
  })
  const [loading, setLoading] = useState(true)
  const [jobListings, setJobListings] = useState([])
  const [jobLoading, setJobLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [sortBy, setSortBy] = useState("new")
  const [jobLength, setJobsLength] = useState(0)
  const keywordInputRef = useRef(null)
  const mobileKeywordInputRef = useRef(null)
  const jobsPerPage = 15

  // filter states
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedCities, setSelectedCities] = useState([])
  const [selectedStates, setSelectedStates] = useState([])

  // LocalStorage-tracked job ID states for each filter
  const [savedCategoriesJobIds, setSavedCategoriesJobIds] = useState([])
  const [savedStatesJobIds, setSavedStatesJobIds] = useState([])
  const [savedCitiesJobIds, setSavedCitiesJobIds] = useState([])
  const [savedTypesJobIds, setSavedTypesJobIds] = useState([])

  const [selectedEmployers, setSelectedEmployers] = useState([])
  const [selectedExperience, setSelectedExperience] = useState([])
  const [selectedDatePosted, setSelectedDatePosted] = useState("")
  const [selectedSalaryOption, setSelectedSalaryOption] = useState("")

  // New state for the hero search input
  const [heroSearchKeyword, setHeroSearchKeyword] = useState("")
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([])
  const [keywordSearchValue, setKeywordSearchValue] = useState("")
  // Mobile search input value state
  const [mobileKeywordValue, setMobileKeywordValue] = useState("")
  const [globalSearchValue, setGlobalSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Always fetch jobs from jobs API on mount (separate from filterJobs)
  useEffect(() => {
    const fetchJobsApi = async () => {
      setJobLoading(true)
      try {
        console.log("Fetching jobs...")
        const res = await fetch("/api/bullhorn/jobs")
        const json = await res.json()
        if (!json.error) {
          setJobListings(json.jobs || [])
          setJobsLength(json.jobs?.length || 0)
        } else {
          console.error("Failed to load jobs:", json.error)
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setJobLoading(false)
      }
    }

    fetchJobsApi()
  }, [])

  useEffect(() => {
    const fetchFilters = async () => {
      setLoading(true)
      try {
        const jobIds = jobListings.map((job) => job.id)
        if (jobIds.length === 0) {
          setLoading(false)
          return
        }

        const res = await fetch("/api/bullhorn/filters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobIds,
            savedCategoriesJobIds,
            savedStatesJobIds,
            savedCitiesJobIds,
            savedTypesJobIds,
          }),
        })
        const json = await res.json()
        console.log("Filtersresponseddd", json)

        if (json.error) {
          console.error("Failed to load filters:", json.error)
          setLoading(false)
          return
        }

        //   const savedFilters = {
        //   states: loadFiltersFromLocalStorage("states") || {},
        //   categories: loadFiltersFromLocalStorage("categories") || {},
        //   cities: loadFiltersFromLocalStorage("cities") || {},
        //   types: loadFiltersFromLocalStorage("types") || {},
        //   employers: loadFiltersFromLocalStorage("employers") || {},
        //   experience: loadFiltersFromLocalStorage("experience") || {},
        // }

        // setFilters({
        //   categories: selectedCategories.length > 0 ? savedFilters.categories.allOptions || [] : json.categories || [],
        //   cities: selectedCities.length > 0 ? savedFilters.cities.allOptions || [] : json.cities || [],
        //   states: selectedStates.length > 0 ? savedFilters.states.allOptions || [] : json.states || [],
        //   types: selectedTypes.length > 0 ? savedFilters.types.allOptions || [] : json.jobTypes || [],
        //   employers: selectedEmployers.length > 0 ? savedFilters.employers.allOptions || [] : json.employers || [],
        //   experience: selectedExperience.length > 0 ? savedFilters.experience.allOptions || [] : json.experience || [],
        //   salaryOptions: json.salaryOptions || [],
        //   datePostedOptions: json.datePostedOptions || [],
        // })

        setFilters({
          categories: json.categories || [],
          cities: json.cities || [],
          states: json.states || [],
          types: json.jobTypes || [],
          employers: json.employers || [],
          experience: json.experience || [],
          salaryOptions: json.salaryOptions || [],
          datePostedOptions: json.datePostedOptions || [],
        })
      } catch (error) {
        console.error("Error fetching filters:", error)
      }
      setLoading(false)
    }

    fetchFilters()
  }, [jobListings, savedCategoriesJobIds, savedStatesJobIds, savedCitiesJobIds, savedTypesJobIds])

  // Function to save filters to localStorage
  const saveFiltersToLocalStorage = (filterType, selectedValue, allOptions) => {
    const filterData = {
      selectedValue: selectedValue,
      allOptions: allOptions,
      timestamp: new Date().toISOString(),
    }
    try {
      localStorage.setItem(`jobBoard_${filterType}`, JSON.stringify(filterData))
      console.log(`Saved ${filterType} to localStorage:`, filterData)
    } catch (error) {
      console.error(`Error saving ${filterType} to localStorage:`, error)
    }
  }

  // Function to load filters from localStorage
  const loadFiltersFromLocalStorage = (filterType) => {
    try {
      const savedData = localStorage.getItem(`jobBoard_${filterType}`)
      if (savedData) {
        const parsedData = JSON.parse(savedData)
        console.log(`Loaded ${filterType} from localStorage:`, parsedData)
        return parsedData
      }
    } catch (error) {
      console.error(`Error loading ${filterType} from localStorage:`, error)
    }
    return null
  }

  // Check if all filters are empty
  const areAllFiltersEmpty = () => {
    const desktopKeyword = keywordInputRef.current ? keywordInputRef.current.value.trim() : ""
    const mobileKeyword = mobileKeywordInputRef.current ? mobileKeywordInputRef.current.value.trim() : ""

    return (
      !desktopKeyword &&
      !mobileKeyword &&
      !globalSearchValue &&
      !keywordSearchValue &&
      !heroSearchKeyword &&
      selectedCategories.length === 0 &&
      selectedTypes.length === 0 &&
      selectedCities.length === 0 &&
      selectedStates.length === 0 &&
      selectedEmployers.length === 0 &&
      selectedExperience.length === 0 &&
      !selectedDatePosted &&
      !selectedSalaryOption
    )
  }

  // Auto-reset when all filters are cleared
  useEffect(() => {
    if (areAllFiltersEmpty() && !jobLoading) {
      // Only auto-reset if we previously had filters applied
      const hadFilters =
        selectedCategories.length > 0 ||
        selectedTypes.length > 0 ||
        selectedCities.length > 0 ||
        selectedStates.length > 0 ||
        selectedEmployers.length > 0 ||
        selectedExperience.length > 0 ||
        selectedDatePosted ||
        selectedSalaryOption

      if (hadFilters) {
        handleResetFilters()
      }
    }
  }, [
    selectedCategories,
    selectedTypes,
    selectedCities,
    selectedStates,
    selectedEmployers,
    selectedExperience,
    selectedDatePosted,
    selectedSalaryOption,
  ])

  // Generic function to handle filter changes
  const handleFilterChange = async (filterType, id, name = null) => {
    setKeywordSearchValue("");

    // Determine which state & setter to use
    const filterMap = {
      states: [selectedStates, setSelectedStates, filters.states],
      categories: [selectedCategories, setSelectedCategories, filters.categories],
      cities: [selectedCities, setSelectedCities, filters.cities],
      types: [selectedTypes, setSelectedTypes, filters.types],
    };

    const [selected, setSelected, availableFilters] = filterMap[filterType];

    // Update selection
    const newSelected = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];

    setSelected(newSelected);

    // Special case for categories: update names
    if (filterType === "categories") {
      const updatedNames = availableFilters
        .filter((cat) => newSelected.includes(cat.id))
        .map((cat) => ({ id: cat.id, name: cat.name }));
      setSelectedCategoryNames(updatedNames);
    }

    // Save to localStorage if newly selected
    // if (!selected.includes(id)) {
    //   const selectedItem = availableFilters.find((item) => item.id === id);
    //   saveFiltersToLocalStorage(filterType, selectedItem, availableFilters);
    // }

    // Build params
    const searchedJobIds = JSON.parse(localStorage.getItem("searchedJobIds") || "[]");
    const params = new URLSearchParams({
      categories: (filterType === "categories" ? newSelected : selectedCategories).join(","),
      types: (filterType === "types" ? newSelected : selectedTypes).join(","),
      cities: (filterType === "cities" ? newSelected : selectedCities).join(","),
      states: (filterType === "states" ? newSelected : selectedStates).join(","),
      salaryOption: selectedSalaryOption,
      dateModified: selectedDatePosted,
      searchedJobIds: searchedJobIds.join(","),
      keyword: keywordSearchValue || heroSearchKeyword || "",
    });

    try {
      if (keywordSearchValue) {
        const res = await fetch(`/api/bullhorn/filterJobs?${params}`);
        console.log("FilterJobs API params:", params.toString());
        console.log("FilterJobs API response:", await res.json());
      } else if (heroSearchKeyword) {
        const res = await fetch(`/api/bullhorn/globalSearch?${params}`);
        console.log("GlobalSearch API params:", params.toString());
        console.log("GlobalSearch API response:", await res.json());

        if (!showMobileFilters) {
          await handleFilterJobsGlobal(false, { [filterType]: newSelected });
        }
      }

      if (!showMobileFilters && !heroSearchKeyword) {
        await handleFilterJobs(false, { [filterType]: newSelected });
      }
    } catch (err) {
      console.error(`Error calling ${keywordSearchValue ? "filterJobs" : "globalSearch"} API:`, err);
    }
  };

  // Usage examples
  const handleStateChange = (id) => handleFilterChange("states", id);
  const handleCategoryChange = (id, name) => handleFilterChange("categories", id, name);
  const handleCityChange = (id) => handleFilterChange("cities", id);
  const handleTypeChange = (id) => handleFilterChange("types", id);


  // Handle salary option change with auto-apply
  const handleSalaryOptionChange = async (salary) => {
    const newSalaryOption = selectedSalaryOption === salary ? "" : salary
    setSelectedSalaryOption(newSalaryOption)

    // On mobile, do NOT auto-fetch jobs
    if (!showMobileFilters) {
      await handleFilterJobs(false, { salaryOption: newSalaryOption })
    }
  }

  // Handle date posted change with auto-apply
  const handleDatePostedChange = async (dateOption) => {
    const newDatePosted = selectedDatePosted === dateOption ? "" : dateOption
    setSelectedDatePosted(newDatePosted)

    // On mobile, do NOT auto-fetch jobs
    if (!showMobileFilters) {
      await handleFilterJobs(false, { datePosted: newDatePosted })
    }
  }

  useEffect(() => {
    // On mount, fetch jobs using filterJobs API with no filters/keyword
    const fetchJobs = async () => {
      setJobLoading(true)
      try {
        const res = await fetch("/api/bullhorn/filterJobs")
        const json = await res.json()
        if (!json.error) {
          setJobListings(json.jobs || [])
          setJobsLength(json.jobs?.length || 0)
        } else {
          console.error("Failed to load jobs:", json.error)
        }
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setJobLoading(false)
      }
    }

    fetchJobs()
  }, [])

  // useEffect for filters fetching reverted/removed as requested
  const handleFilterJobsGlobal = async (isMobile = false, filterOverrides = {}) => {
    console.log("executess")
    // Do NOT clear filters so they remain checked
    setJobLoading(true)

    if (isMobile) {
      setShowMobileFilters(false)
    }

    // Use mobileKeywordValue for mobile, keywordInputRef for desktop
    const keywordValue = isMobile ? mobileKeywordValue : keywordInputRef.current?.value || ""

    const currentSelectedCategories =
      filterOverrides.categories !== undefined ? filterOverrides.categories : selectedCategories
    const currentSelectedTypes = filterOverrides.types !== undefined ? filterOverrides.types : selectedTypes
    const currentSelectedCities = filterOverrides.cities !== undefined ? filterOverrides.cities : selectedCities
    const currentSelectedStates = filterOverrides.states !== undefined ? filterOverrides.states : selectedStates
    const currentSelectedEmployers =
      filterOverrides.employers !== undefined ? filterOverrides.employers : selectedEmployers
    const currentSelectedExperience =
      filterOverrides.experience !== undefined ? filterOverrides.experience : selectedExperience
    const currentSelectedDatePosted =
      filterOverrides.datePosted !== undefined ? filterOverrides.datePosted : selectedDatePosted
    const currentSelectedSalaryOption =
      filterOverrides.salaryOption !== undefined ? filterOverrides.salaryOption : selectedSalaryOption

    // Use heroSearchKeyword from filterOverrides if provided, otherwise from state
    const heroKeyword = filterOverrides.keyword !== undefined ? filterOverrides.keyword : heroSearchKeyword;

    // Always pass selected filters, keyword, and searchedJobIds from localStorage
    const params = new URLSearchParams()

    if (currentSelectedCategories.length > 0) {
      params.append("categories", currentSelectedCategories.map(encodeURIComponent).join(","))
    }
    if (currentSelectedTypes.length > 0) {
      params.append("types", currentSelectedTypes.join(","))
    }
    if (currentSelectedCities.length > 0) {
      params.append("cities", currentSelectedCities.map(encodeURIComponent).join(","))
    }
    if (currentSelectedStates.length > 0) {
      params.append("states", currentSelectedStates.map(encodeURIComponent).join(","))
    }
    if (currentSelectedEmployers.length > 0) {
      params.append("employers", currentSelectedEmployers.join(","))
    }
    if (currentSelectedExperience.length > 0) {
      params.append("experience", currentSelectedExperience.join(","))
    }
    if (currentSelectedDatePosted) {
      params.append("dateModified", currentSelectedDatePosted)
    }
    if (currentSelectedSalaryOption) {
      params.append("salaryOption", currentSelectedSalaryOption)
    }

    // Only append heroKeyword if it's not an explicit empty string (i.e., not removing global search)
    if (heroKeyword && heroKeyword.trim() && filterOverrides.keyword !== "") {
      console.log("heroSearchKeyword", heroKeyword)
      setHeroSearchKeyword(heroKeyword)
      params.append("keyword", heroKeyword)
    }

    // Always pass searchedJobIds from localStorage
    try {
      const res = await fetch(`/api/bullhorn/globalSearch?${params.toString()}`)
      const data = await res.json()

      if (!data.error) {
        console.log("Filtered jobs:", data)
        setJobListings(data.jobs || [])
        setCurrentPage(1)
        // setFilters((prev) => ({
        //   ...prev,
        //   categories: data.categories || prev.categories,
        //   cities: data.cities || prev.cities,
        //   states: data.states || prev.states,
        //   types: data.jobTypes || prev.types,
        // }))

        // If a keyword search was performed, update localStorage with searched job IDs
        if (params.get("keyword")) {
          const keywordParam = params.get("keyword")
          // Only store if no filters are selected (pure keyword search)
          const noFiltersSelected =
            !params.get("categories") &&
            !params.get("types") &&
            !params.get("cities") &&
            !params.get("states") &&
            !params.get("employers") &&
            !params.get("experience") &&
            !params.get("dateModified") &&
            !params.get("salaryOption")
          if (keywordParam && keywordParam.trim() && noFiltersSelected) {
            localStorage.setItem("searchedJobIds", JSON.stringify((data.jobs || []).map((job) => job.id)))
          }
        }
      } else {
        console.error("Filter error:", data.error)
      }
    } catch (err) {
      console.error("Error filtering jobs:", err)
    } finally {
      setJobLoading(false)
    }
  }
  const handleFilterJobs = async (isMobile = false, filterOverrides = {}) => {
    // Do NOT clear filters so they remain checked
    setJobLoading(true)

    if (isMobile) {
      setShowMobileFilters(false)
    }

    // Use mobileKeywordValue for mobile, keywordInputRef for desktop
    const keywordValue = isMobile ? mobileKeywordValue : keywordInputRef.current?.value || ""

    const currentSelectedCategories =
      filterOverrides.categories !== undefined ? filterOverrides.categories : selectedCategories
    const currentSelectedTypes = filterOverrides.types !== undefined ? filterOverrides.types : selectedTypes
    const currentSelectedCities = filterOverrides.cities !== undefined ? filterOverrides.cities : selectedCities
    const currentSelectedStates = filterOverrides.states !== undefined ? filterOverrides.states : selectedStates
    const currentSelectedEmployers =
      filterOverrides.employers !== undefined ? filterOverrides.employers : selectedEmployers
    const currentSelectedExperience =
      filterOverrides.experience !== undefined ? filterOverrides.experience : selectedExperience
    const currentSelectedDatePosted =
      filterOverrides.datePosted !== undefined ? filterOverrides.datePosted : selectedDatePosted
    const currentSelectedSalaryOption =
      filterOverrides.salaryOption !== undefined ? filterOverrides.salaryOption : selectedSalaryOption

    // Always pass selected filters, keyword, and searchedJobIds from localStorage
    const params = new URLSearchParams()

    if (currentSelectedCategories.length > 0) {
      params.append("categories", currentSelectedCategories.map(encodeURIComponent).join(","))
    }
    if (currentSelectedTypes.length > 0) {
      params.append("types", currentSelectedTypes.join(","))
    }
    if (currentSelectedCities.length > 0) {
      params.append("cities", currentSelectedCities.map(encodeURIComponent).join(","))
    }
    if (currentSelectedStates.length > 0) {
      params.append("states", currentSelectedStates.map(encodeURIComponent).join(","))
    }
    if (currentSelectedEmployers.length > 0) {
      params.append("employers", currentSelectedEmployers.join(","))
    }
    if (currentSelectedExperience.length > 0) {
      params.append("experience", currentSelectedExperience.join(","))
    }
    if (currentSelectedDatePosted) {
      params.append("dateModified", currentSelectedDatePosted)
    }
    if (currentSelectedSalaryOption) {
      params.append("salaryOption", currentSelectedSalaryOption)
    }

    if (keywordValue && keywordValue.trim()) {
      setKeywordSearchValue(keywordValue)
      params.append("keyword", keywordValue)
    }

    if (heroSearchKeyword && heroSearchKeyword.trim()) {
      setHeroSearchKeyword(heroSearchKeyword)
      params.append("keyword", heroSearchKeyword)
    }

    // Always pass searchedJobIds from localStorage
    try {
      const res = await fetch(`/api/bullhorn/filterJobs?${params.toString()}`)
      const data = await res.json()

      if (!data.error) {
        console.log("Filtered jobs:", data)
        setJobListings(data.jobs || [])
        setCurrentPage(1)
        setFilters((prev) => ({
          ...prev,
          categories: data.categories || prev.categories,
          cities: data.cities || prev.cities,
          states: data.states || prev.states,
          types: data.jobTypes || prev.types,
        }))
        console.log("filtersdddd", filters)

        // If a keyword search was performed, update localStorage with searched job IDs
        if (params.get("keyword")) {
          const keywordParam = params.get("keyword")
          // Only store if no filters are selected (pure keyword search)
          const noFiltersSelected =
            !params.get("categories") &&
            !params.get("types") &&
            !params.get("cities") &&
            !params.get("states") &&
            !params.get("employers") &&
            !params.get("experience") &&
            !params.get("dateModified") &&
            !params.get("salaryOption")
          if (keywordParam && keywordParam.trim() && noFiltersSelected) {
            localStorage.setItem("searchedJobIds", JSON.stringify((data.jobs || []).map((job) => job.id)))
          }
        }
      } else {
        console.error("Filter error:", data.error)
      }
    } catch (err) {
      console.error("Error filtering jobs:", err)
    } finally {
      setJobLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy])

  const getJobTimestamp = (job) => {
    let timestamp = job.dateLastPublished || job.dateModified || job.dateAdded || job.datePosted || 0
    if (typeof timestamp === "string") {
      timestamp = Number.parseInt(timestamp, 10)
    }
    if (timestamp > 0 && timestamp < 946684800000) {
      timestamp = timestamp * 1000
    }
    return timestamp || 0
  }

  const sortedJobs = useMemo(() => {
    if (!Array.isArray(jobListings)) return []

    const sorted = [...jobListings].sort((a, b) => {
      switch (sortBy) {
        case "new":
          const timestampA = getJobTimestamp(a)
          const timestampB = getJobTimestamp(b)
          return timestampB - timestampA
        case "old":
          const oldTimestampA = getJobTimestamp(a)
          const oldTimestampB = getJobTimestamp(b)
          return oldTimestampA - oldTimestampB
        case "title":
          const titleA = (a.title || "").toLowerCase().trim()
          const titleB = (b.title || "").toLowerCase().trim()
          return titleA.localeCompare(titleB)
        default:
          return 0
      }
    })

    return sorted
  }, [jobListings, sortBy])

const handleRemoveFilter = async (filterType, valueToRemove) => {
  // Copy states
  let newSelectedCategories = [...selectedCategories];
  let newSelectedTypes = [...selectedTypes];
  let newSelectedCities = [...selectedCities];
  let newSelectedStates = [...selectedStates];
  let newSelectedEmployers = [...selectedEmployers];
  let newSelectedExperience = [...selectedExperience];
  let newSelectedDatePosted = selectedDatePosted;
  let newSelectedSalaryOption = selectedSalaryOption;
  let newSelectedCategoryNames = [...selectedCategoryNames];

  // Check if all non-global filters are empty
  const areAllNonGlobalFiltersEmpty = () =>
    !newSelectedCategories.length &&
    !newSelectedTypes.length &&
    !newSelectedCities.length &&
    !newSelectedStates.length &&
    !newSelectedEmployers.length &&
    !newSelectedExperience.length &&
    !newSelectedDatePosted &&
    !newSelectedSalaryOption;

  // Helper: call API and update jobs/filters
  const fetchJobs = async (url, params, allEmpty, keyword) => {
    try {
      setJobLoading(true);
      const res = await fetch(`${url}?${params.toString()}`);
      const data = await res.json();

      if (!data.error) {
        setJobListings(data.jobs || []);
        setFilters((prev) => ({
          ...prev,
          categories: data.categories || prev.categories,
          cities: data.cities || prev.cities,
          states: data.states || prev.states,
          types: data.jobTypes || prev.types,
        }));
        if (allEmpty && keyword) {
          localStorage.setItem(
            "searchedJobIds",
            JSON.stringify((data.jobs || []).map((job) => job.id))
          );
        }
      } else {
        console.error("Filter error:", data.error);
      }
    } catch (err) {
      console.error("Error calling API:", err);
    } finally {
      setJobLoading(false);
    }
  };

  // Step 1: Update relevant filter
  switch (filterType) {
    case "type":
      newSelectedTypes = newSelectedTypes.filter((item) => item !== valueToRemove);
      setSelectedTypes(newSelectedTypes);
      break;
    case "city":
      newSelectedCities = newSelectedCities.filter((item) => item !== valueToRemove);
      setSelectedCities(newSelectedCities);
      break;
    case "state":
      newSelectedStates = newSelectedStates.filter((item) => item !== valueToRemove);
      setSelectedStates(newSelectedStates);
      break;
    case "category":
      newSelectedCategories = newSelectedCategories.filter((item) => item !== valueToRemove);
      newSelectedCategoryNames = newSelectedCategoryNames.filter((cat) => cat.id !== valueToRemove);
      setSelectedCategories(newSelectedCategories);
      setSelectedCategoryNames(newSelectedCategoryNames);
      break;
    case "employer":
      newSelectedEmployers = newSelectedEmployers.filter((item) => item !== valueToRemove);
      setSelectedEmployers(newSelectedEmployers);
      break;
    case "experience":
      newSelectedExperience = newSelectedExperience.filter((item) => item !== valueToRemove);
      setSelectedExperience(newSelectedExperience);
      break;
    case "salary":
      newSelectedSalaryOption = "";
      setSelectedSalaryOption("");
      break;
    case "datePosted":
      newSelectedDatePosted = "";
      setSelectedDatePosted("");
      break;
    case "keywordSearch":
      setKeywordSearchValue("");
      if (keywordInputRef.current) keywordInputRef.current.value = "";
      if (mobileKeywordInputRef.current) mobileKeywordInputRef.current.value = "";
      break;
    case "globalSearch":
      setGlobalSearchValue("");
      setHeroSearchKeyword("");
      // If no other filters are active, reset all filters and jobs
      if (areAllNonGlobalFiltersEmpty()) {
        await handleResetFilters();
      } else {
        // If there are still other filters, run global filtering without global search value
        await handleFilterJobsGlobal(false, {
          categories: newSelectedCategories,
          types: newSelectedTypes,
          cities: newSelectedCities,
          states: newSelectedStates,
          employers: newSelectedEmployers,
          experience: newSelectedExperience,
          datePosted: newSelectedDatePosted,
          salaryOption: newSelectedSalaryOption,
          keyword: ""
        });
      }
      return; // stop here for globalSearch
    default:
      break;
  }

  setCurrentPage(1);

  // Step 2: Decide what to do next
  const allFiltersEmpty = areAllNonGlobalFiltersEmpty();
  const searchedJobIds = JSON.parse(localStorage.getItem("searchedJobIds") || "[]");

  // If all filters are empty but global search value exists → run global search
  if (allFiltersEmpty && globalSearchValue) {
    await handleGlobalSearch(globalSearchValue);
    return;
  }

  // Case: Keyword search active
  const handleKeywordSearch = async (keyword, endpoint) => {
    const params = allFiltersEmpty
      ? new URLSearchParams({ keyword })
      : new URLSearchParams({
          categories: newSelectedCategories.join(","),
          types: newSelectedTypes.join(","),
          cities: newSelectedCities.join(","),
          states: newSelectedStates.join(","),
          dateModified: newSelectedDatePosted,
          salaryOption: newSelectedSalaryOption,
          searchedJobIds: searchedJobIds.join(","),
          keyword,
        });

    await fetchJobs(endpoint, params, allFiltersEmpty, keyword);
  };

  if (keywordSearchValue && filterType !== "keywordSearch") {
    await handleKeywordSearch(keywordSearchValue, "/api/bullhorn/filterJobs");
    return;
  }

  if (heroSearchKeyword && filterType !== "globalSearch") {
    await handleKeywordSearch(heroSearchKeyword, "/api/bullhorn/globalSearch");
    return;
  }

  // Default: Apply remaining filters
  await handleFilterJobs(false, {
    categories: newSelectedCategories,
    types: newSelectedTypes,
    cities: newSelectedCities,
    states: newSelectedStates,
    employers: newSelectedEmployers,
    experience: newSelectedExperience,
    datePosted: newSelectedDatePosted,
    salaryOption: newSelectedSalaryOption,
  });
};




  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedTypes([])
    setSelectedCities([])
    setSelectedStates([])
    setSelectedEmployers([])
    setSelectedExperience([])
    setSelectedDatePosted("")
    setSelectedSalaryOption("")
    setSelectedCategoryNames([])
  }

  const handleResetFilters = async () => {
    setGlobalSearchValue("")
    setKeywordSearchValue("")
    setJobLoading(true)

    // Clear all filter states
    clearAllFilters()
    setCurrentPage(1)
    setSortBy("new")
    setShowMobileFilters(false)
    setHeroSearchKeyword("")

    // Clear input fields
    if (keywordInputRef.current) {
      keywordInputRef.current.value = ""
    }
    if (mobileKeywordInputRef.current) {
      mobileKeywordInputRef.current.value = ""
    }

    // Fetch all jobs (reset to original state) using filterJobs API
    try {
      const res = await fetch("/api/bullhorn/filterJobs")
      const json = await res.json()
      if (!json.error) {
        setJobListings(json.jobs || [])
        setJobsLength(json.jobs?.length || 0)
      } else {
        console.error("Failed to load jobs:", json.error)
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
    } finally {
      setJobLoading(false)
    }
  }

  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage)
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage)

  const isFilterDisabled = () => {
    const desktopKeyword = keywordInputRef.current ? keywordInputRef.current.value.trim() : ""
    const mobileKeyword = mobileKeywordInputRef.current ? mobileKeywordInputRef.current.value.trim() : ""

    return (
      !desktopKeyword &&
      !mobileKeyword &&
      selectedCategories.length === 0 &&
      selectedTypes.length === 0 &&
      selectedCities.length === 0 &&
      selectedStates.length === 0 &&
      selectedEmployers.length === 0 &&
      selectedExperience.length === 0 &&
      !selectedDatePosted &&
      !selectedSalaryOption
    )
  }

  const hasActiveFilters = () => {
    return (
      selectedCategories.length > 0 ||
      selectedTypes.length > 0 ||
      selectedCities.length > 0 ||
      selectedStates.length > 0 ||
      selectedEmployers.length > 0 ||
      selectedExperience.length > 0 ||
      !!selectedDatePosted ||
      !!selectedSalaryOption ||
      !!keywordSearchValue ||
      !!globalSearchValue
    )
  }

  // Store active filter options (categories, states, cities, types) in localStorage with current job IDs
  // Track previous jobListings IDs
//  const prevJobIdsRef = useRef([]);

// useEffect(() => {
//   // Always update prevJobIdsRef with current jobListings
//   prevJobIdsRef.current = jobListings.map((job) => job.id);
// }, [jobListings]);

// // Track each filter individually
// useEffect(() => {
//   if (selectedCategories.length > 0) {
//     // <CHANGE> Only store IDs if they don't already exist in localStorage
//     const existingIds = localStorage.getItem('jobBoard_categories');
//     if (!existingIds) {
//       localStorage.setItem('jobBoard_categories', JSON.stringify(prevJobIdsRef.current));
//       setSavedCategoriesJobIds(prevJobIdsRef.current);
//     } else {
//       // Keep existing IDs in state
//       setSavedCategoriesJobIds(JSON.parse(existingIds));
//     }
//   } else {
//     localStorage.removeItem('jobBoard_categories');
//     setSavedCategoriesJobIds([]);
//   }
// }, [selectedCategories]);

// useEffect(() => {
//   if (selectedStates.length > 0) {
//     // <CHANGE> Only store IDs if they don't already exist in localStorage
//     const existingIds = localStorage.getItem('jobBoard_states');
//     if (!existingIds) {
//       localStorage.setItem('jobBoard_states', JSON.stringify(prevJobIdsRef.current));
//       setSavedStatesJobIds(prevJobIdsRef.current);
//     } else {
//       // Keep existing IDs in state
//       setSavedStatesJobIds(JSON.parse(existingIds));
//     }
//   } else {
//     localStorage.removeItem('jobBoard_states');
//     setSavedStatesJobIds([]);
//   }
// }, [selectedStates]);

// useEffect(() => {
//   if (selectedCities.length > 0) {
//     // <CHANGE> Only store IDs if they don't already exist in localStorage
//     const existingIds = localStorage.getItem('jobBoard_cities');
//     if (!existingIds) {
//       localStorage.setItem('jobBoard_cities', JSON.stringify(prevJobIdsRef.current));
//       setSavedCitiesJobIds(prevJobIdsRef.current);
//     } else {
//       // Keep existing IDs in state
//       setSavedCitiesJobIds(JSON.parse(existingIds));
//     }
//   } else {
//     localStorage.removeItem('jobBoard_cities');
//     setSavedCitiesJobIds([]);
//   }
// }, [selectedCities]);

// useEffect(() => {
//   if (selectedTypes.length > 0) {
//     // <CHANGE> Only store IDs if they don't already exist in localStorage
//     const existingIds = localStorage.getItem('jobBoard_types');
//     if (!existingIds) {
//       localStorage.setItem('jobBoard_types', JSON.stringify(prevJobIdsRef.current));
//       setSavedTypesJobIds(prevJobIdsRef.current);
//     } else {
//       // Keep existing IDs in state
//       setSavedTypesJobIds(JSON.parse(existingIds));
//     }
//   } else {
//     localStorage.removeItem('jobBoard_types');
//     setSavedTypesJobIds([]);
//   }
// }, [selectedTypes]);

  const handleGlobalSearch = async (keyword) => {
    if (!keyword || !keyword.trim()) {
      // Do not call API if input is empty
      setIsSearching(false)
      return
    }

    console.log("lklnljknlj", keyword)

    setIsSearching(true)


    // Clear keyword search inputs
    if (keywordInputRef.current) {
      keywordInputRef.current.value = ""
    }
    if (mobileKeywordInputRef.current) {
      mobileKeywordInputRef.current.value = ""
    }
    setKeywordSearchValue("")

    try {
      const response = await fetch(`/api/bullhorn/globalSearch?keyword=${encodeURIComponent(keyword)}`)
      const data = await response.json()

      if (!data.error && data.jobs) {
        setJobListings(data.jobs || [])
        setCurrentPage(1)
        setFilters((prev) => ({
          ...prev,
          categories: data.categories || prev.categories,
          cities: data.cities || prev.cities,
          states: data.states || prev.states,
          types: data.jobTypes || prev.types,
        }))
        // Store searched job IDs in localStorage for use in filter handlers
        localStorage.setItem("searchedJobIds", JSON.stringify((data.jobs || []).map((job) => job.id)))
        console.log("Global search results:", data.jobs)
      } else {
        console.error("Global search error:", data.error)
      }
    } catch (error) {
      console.error("Error performing global search:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleHeroSearchSubmit = async (e) => {
    e.preventDefault()
    setKeywordSearchValue("")

    if (!heroSearchKeyword.trim()) {
      // Do not call jobs or filter API if input is empty
      return
    }

    setGlobalSearchValue(heroSearchKeyword)

    // Check if any filters are selected (excluding global/hero search itself)
    const filtersSelected =
      selectedCategories.length > 0 ||
      selectedTypes.length > 0 ||
      selectedCities.length > 0 ||
      selectedStates.length > 0 ||
      selectedEmployers.length > 0 ||
      selectedExperience.length > 0 ||
      !!selectedDatePosted ||
      !!selectedSalaryOption;

    if (filtersSelected) {
      // Call handleFilterJobs with heroSearchKeyword as keyword
      await handleFilterJobs(false, { keyword: heroSearchKeyword.trim() });
    } else {
      await handleGlobalSearch(heroSearchKeyword.trim());
    }
  }

  const handleHeroInputChange = (e) => {
    const newValue = e.target.value
    setHeroSearchKeyword(newValue)

    // Do nothing when global search input is cleared (do not reset jobs or filters)
  }

  const getJobTypeClasses = (type) => {
    switch (type) {
      case "FULL TIME":
        return "bg-[#3CB371] text-white"
      case "FREELANCER":
        return "bg-[#1E90FF] text-white"
      case "PART TIME":
        return "bg-[#DAA520] text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const getCategoryClasses = (category) => {
    switch (category) {
      case "Accounting":
        return "bg-[#DCE6F0] text-[#4A6B8A]"
      case "Broadcasting":
        return "bg-[#E6DCF0] text-[#8A4A8A]"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const FilterSection = ({ isMobile = false }) => (
    <div
      className={`${isMobile ? "p-3 sm:p-4" : "h-screen overflow-y-auto p-0"} space-y-4 sm:space-y-6`}
    >
      {/* Search Filters Section */}
      <div className="border border-solid border-gray-300 rounded-xl p-3 sm:p-4 lg:p-6 bg-white space-y-4 sm:space-y-6 shadow-md">
        {/* Loading spinner */}
        {jobLoading ? (
          <div className="flex justify-center items-center min-h-[150px] sm:min-h-[200px] bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <svg
              className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-[#23baa1]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
          </div>
        ) : (
          <>
            {/* Filters (categories, cities, states, etc.) */}
            {[
              {
                title: "Category",
                data: filters.categories,
                selected: selectedCategories,
                handler: handleCategoryChange,
              },
              { title: "Cities", data: filters.cities, selected: selectedCities, handler: handleCityChange },
              { title: "State", data: filters.states, selected: selectedStates, handler: handleStateChange },
              { title: "Job Type", data: filters.types, selected: selectedTypes, handler: handleTypeChange },
            ].map(({ title, data, selected, handler }) => (
              <div key={title}>
                <h3
                  className={`${isMobile ? "text-lg sm:text-xl" : "text-base lg:text-lg"} font-semibold text-[#333333] mb-3 lg:mb-4`}
                >
                  {title}
                </h3>
                {loading ? (
                  <BeatLoader color="#23baa1" className="text-center" />
                ) : (
                  <div className={`${!isMobile ? "pr-1 sm:pr-2" : ""} pr-1 sm:pr-2`}>
                    {data.map((item) => (
                      <div
                        key={String(item.id || item.name)}
                        className={`flex items-center space-x-2 sm:space-x-3 ${isMobile ? "py-2 sm:py-3" : "py-1"}`}
                      >
                        <input
                          type="checkbox"
                          id={`${title.toLowerCase()}-${item.id || item.name}-${isMobile ? "mobile" : "desktop"}`}
                          className={`${isMobile ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 lg:h-4 lg:w-4"} text-[#23baa1] border-gray-300 rounded focus:ring-[#23baa1] cursor-pointer`}
                          checked={selected.includes(item.id)}
                          onChange={() => handler(item.id, item.name)}
                        />
                        <label
                          htmlFor={`${title.toLowerCase()}-${item.id || item.name}-${isMobile ? "mobile" : "desktop"}`}
                          className={`${isMobile ? "text-sm sm:text-base" : "text-xs lg:text-sm"} font-medium text-[#7d789b] cursor-pointer flex-1 leading-tight`}
                        >
                          {item.name} ({item.count})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Salary Basis */}
            <div>
              <h3
                className={`${isMobile ? "text-lg sm:text-xl" : "text-base lg:text-lg"} font-semibold text-[#333333] mb-3 lg:mb-4`}
              >
                Salary Basis
              </h3>
              {loading ? (
                <BeatLoader color="#23baa1" className="text-center" />
              ) : (
                <div className={`${!isMobile ? "max-h-[150px] lg:max-h-[200px] overflow-y-auto" : ""} pr-1 sm:pr-2`}>
                  {filters.salaryOptions?.map((salary) => (
                    <div
                      key={salary}
                      className={`flex items-center space-x-2 sm:space-x-3 ${isMobile ? "py-2 sm:py-3" : "py-1"}`}
                    >
                      <input
                        type="radio"
                        id={`salary-${salary}-${isMobile ? "mobile" : "desktop"}`}
                        name={`salary-${isMobile ? "mobile" : "desktop"}`}
                        className={`${isMobile ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 lg:h-4 lg:w-4"} text-[#23baa1] border-gray-300 focus:ring-[#23baa1] cursor-pointer`}
                        checked={selectedSalaryOption === salary}
                        onChange={() => handleSalaryOptionChange(salary)}
                      />
                      <label
                        htmlFor={`salary-${salary}-${isMobile ? "mobile" : "desktop"}`}
                        className={`${isMobile ? "text-sm sm:text-base" : "text-xs lg:text-sm"} font-medium text-[#7d789b] cursor-pointer flex-1 leading-tight`}
                      >
                        {salary}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Posted */}
            <div>
              <h3
                className={`${isMobile ? "text-lg sm:text-xl" : "text-base lg:text-lg"} font-semibold text-[#333333] mb-3 lg:mb-4`}
              >
                Date Posted
              </h3>
              {loading ? (
                <BeatLoader color="#23baa1" className="text-center" />
              ) : (
                <div className={`${!isMobile ? "max-h-[150px] lg:max-h-[200px] overflow-y-auto" : ""} pr-1 sm:pr-2`}>
                  {filters.datePostedOptions?.map((option) => (
                    <div
                      key={option.name}
                      className={`flex items-center space-x-2 sm:space-x-3 ${isMobile ? "py-2 sm:py-3" : "py-1"}`}
                    >
                      <input
                        type="radio"
                        id={`date-${option.name}-${isMobile ? "mobile" : "desktop"}`}
                        name={`dateModified-${isMobile ? "mobile" : "desktop"}`}
                        className={`${isMobile ? "h-4 w-4 sm:h-5 sm:w-5" : "h-3 w-3 lg:h-4 lg:w-4"} text-[#23baa1] border-gray-300 rounded focus:ring-[#23baa1] cursor-pointer`}
                        checked={selectedDatePosted === option.name}
                        onChange={() => handleDatePostedChange(option.name)}
                      />
                      <label
                        htmlFor={`date-${option.name}-${isMobile ? "mobile" : "desktop"}`}
                        className={`${isMobile ? "text-sm sm:text-base" : "text-xs lg:text-sm"} font-medium text-[#7d789b] cursor-pointer flex-1 leading-tight`}
                      >
                        {option.name}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )

  // Mobile filter timer logic: only start after filter selection
  const mobileAutoCloseTimeoutRef = useRef(null)
  const mobileTimerActiveRef = useRef(false)
  const mobileInputFocusedRef = useRef(false)

  // Helper: check if any filter is selected
  const isAnyMobileFilterSelected = () =>
    selectedCategories.length > 0 ||
    selectedTypes.length > 0 ||
    selectedCities.length > 0 ||
    selectedStates.length > 0 ||
    selectedEmployers.length > 0 ||
    selectedExperience.length > 0 ||
    selectedDatePosted ||
    selectedSalaryOption

  // Start/restart the timer only if a filter is selected
  const startMobileAutoCloseTimer = () => {
    if (!isAnyMobileFilterSelected() || mobileInputFocusedRef.current) return;

    mobileTimerActiveRef.current = true;

    if (mobileAutoCloseTimeoutRef.current) {
      clearTimeout(mobileAutoCloseTimeoutRef.current);
    }

    mobileAutoCloseTimeoutRef.current = setTimeout(async () => {
      mobileTimerActiveRef.current = false;
      setShowMobileFilters(false);
      await handleFilterJobs(true);
    }, 2000);
  };

  // Cancel timer
  const cancelMobileAutoCloseTimer = () => {
    mobileTimerActiveRef.current = false
    if (mobileAutoCloseTimeoutRef.current) {
      clearTimeout(mobileAutoCloseTimeoutRef.current)
    }
  }

  // Whenever filter selection changes, start timer if any selected
  useEffect(() => {
    if (showMobileFilters && isAnyMobileFilterSelected() && !mobileInputFocusedRef.current) {
      startMobileAutoCloseTimer();
    } else {
      cancelMobileAutoCloseTimer();
    }

    return () => {
      cancelMobileAutoCloseTimer();
    };
  }, [
    selectedCategories,
    selectedTypes,
    selectedCities,
    selectedStates,
    selectedEmployers,
    selectedExperience,
    selectedDatePosted,
    selectedSalaryOption,
    showMobileFilters,
    mobileInputFocusedRef.current,
  ]);

  // Handler for mobile filter overlay touch events
  const handleMobileTouchStart = () => {
    if (!showMobileFilters || !isAnyMobileFilterSelected()) return
    startMobileAutoCloseTimer()
  }

  const handleMobileTouchMove = () => {
    if (!showMobileFilters || !isAnyMobileFilterSelected()) return
    startMobileAutoCloseTimer()
  }

  const handleMobileTouchEnd = () => {
    if (!showMobileFilters || !isAnyMobileFilterSelected()) return
    startMobileAutoCloseTimer()
  }

  return (
    <>
      <div
        className="relative min-h-[40vh] w-full flex items-center justify-center text-black overflow-hidden rounded-lg py-16"
        style={{
          background:
            "linear-gradient(to bottom, #FDFEFF 0%, rgba(208, 224, 255, 1) 70%, rgba(208, 224, 255, 0.6) 85%, rgba(208, 224, 255, 0) 100%)",
        }}
      >
        <div className="relative z-20 p-4 max-w-4xl mx-auto">
          <div className="w-full max-w-2xl mx-auto text-left px-4 sm:px-0">
            <h1 className="mb-6 leading-tight">
              <span className="block text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900">Find the work</span>
              <span className="block text-xl sm:text-2xl md:text-3xl font-semibold text-gray-500">
                That makes you feel good.
              </span>
            </h1>
            <form onSubmit={handleHeroSearchSubmit} className="flex w-full space-x-3">
              <Input
                type="search"
                name="search"
                autoComplete="off"
                placeholder="Search for all keywords..."
                className="flex-1 bg-white text-gray-800 placeholder:text-gray-500 p-7 rounded-lg shadow focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={isSearching}
                value={heroSearchKeyword}
                onChange={handleHeroInputChange}
              />
              <Button
                type="submit"
                disabled={isSearching}
                className="w-14 h-14 sm:w-14 sm:h-14 bg-[#23baa1] hover:bg-[#23baa1]/90 text-white rounded-lg shadow flex items-center justify-center"
              >
                {isSearching ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Mobile Filter Toggle Button */}
        <div className="md:hidden px-6 sm:px-0 mb-4 sm:mb-6">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="w-full mt-7 bg-gradient-to-r from-[#23baa1] to-[#23baa1] hover:from-[#23baa1]/90 hover:to-[#23baa1]/90 text-white font-semibold py-5 sm:py-4 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-lg transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base lg:text-lg"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>
              {showMobileFilters ? "Hide Filters" : "Show Filters"}
              {hasActiveFilters() && (
                <span className="ml-2 bg-white text-[#23baa1] px-2 py-1 rounded-full text-xs font-bold">
                  {selectedCategories.length +
                    selectedTypes.length +
                    selectedCities.length +
                    selectedStates.length +
                    selectedEmployers.length +
                    selectedExperience.length +
                    (selectedDatePosted ? 1 : 0) +
                    (selectedSalaryOption ? 1 : 0) +
                    (keywordSearchValue ? 1 : 0) +
                    (globalSearchValue ? 1 : 0)}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 ${showMobileFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
            onTouchStart={handleMobileTouchStart}
            onTouchEnd={handleMobileTouchEnd}
            onTouchMove={handleMobileTouchMove}
          >
            <div className="bg-white h-full flex flex-col">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex items-center justify-between shadow-sm">
                <h2 className="text-lg sm:text-xl font-bold text-[#333333]">Filter Jobs</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <div className="border ml-3 mr-3 sticky top-0 border-solid border-gray-300 rounded-xl p-3 sm:p-4 lg:p-6 bg-white space-y-4 sm:space-y-6 shadow-md mt-4">
                  <h3 className="text-base lg:text-lg font-semibold text-[#333333] mb-3 lg:mb-4">Search Keywords</h3>
                  <form
                    className="relative flex items-center mb-4 lg:mb-5"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setGlobalSearchValue("");
                      setHeroSearchKeyword("");
                      if (!mobileKeywordValue.trim()) {
                        return;
                      }
                      setKeywordSearchValue(mobileKeywordValue);
                      setJobLoading(true);
                      // Always use current filter state and keyword for mobile
                      const params = new URLSearchParams();
                      if (selectedCategories.length > 0) params.append("categories", selectedCategories.map(encodeURIComponent).join(","));
                      if (selectedTypes.length > 0) params.append("types", selectedTypes.join(","));
                      if (selectedCities.length > 0) params.append("cities", selectedCities.map(encodeURIComponent).join(","));
                      if (selectedStates.length > 0) params.append("states", selectedStates.map(encodeURIComponent).join(","));
                      if (selectedEmployers.length > 0) params.append("employers", selectedEmployers.join(","));
                      if (selectedExperience.length > 0) params.append("experience", selectedExperience.join(","));
                      if (selectedDatePosted) params.append("dateModified", selectedDatePosted);
                      if (selectedSalaryOption) params.append("salaryOption", selectedSalaryOption);
                      params.append("keyword", mobileKeywordValue);
                      try {
                        const res = await fetch(`/api/bullhorn/filterJobs?${params.toString()}`);
                        const data = await res.json();
                        if (!data.error) {
                          setJobListings(data.jobs || []);
                          setCurrentPage(1);
                          setFilters((prev) => ({
                            ...prev,
                            categories: data.categories || prev.categories,
                            cities: data.cities || prev.cities,
                            states: data.states || prev.states,
                            types: data.jobTypes || prev.types,
                          }));
                          localStorage.setItem("searchedJobIds", JSON.stringify((data.jobs || []).map((job) => job.id)));
                        } else {
                          console.error("Filter error:", data.error);
                        }
                      } catch (err) {
                        console.error("Error filtering jobs:", err);
                      } finally {
                        setJobLoading(false);
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={mobileKeywordValue}
                      onChange={e => setMobileKeywordValue(e.target.value)}
                      placeholder="Keyword"
                      className="w-full pl-3 sm:pl-4 pr-12 sm:pr-16 py-2 lg:py-3 text-sm lg:text-base rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#23baa1] focus:border-transparent"
                      onFocus={() => { mobileInputFocusedRef.current = true; cancelMobileAutoCloseTimer(); }}
                      onBlur={() => { mobileInputFocusedRef.current = false; startMobileAutoCloseTimer(); }}
                    />
                    <button
                      type="submit"
                      className="absolute cursor-pointer right-0 w-10 h-10 lg:w-12 lg:h-12 bg-[#23baa1] hover:bg-[#23baa1]/90 rounded-md flex items-center justify-center transition-colors"
                    >
                      <Search className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </button>
                  </form>
                </div>
                <FilterSection isMobile={true} />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 lg:p-8">
          {/* Main Content Area */}
          <div className="min-w-0">
            <div className="mx-4 sm:mx-0 lg:mx-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  {!jobLoading && (
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold">
                      Showing ({paginatedJobs.length}) of {sortedJobs.length} opportunity.
                    </h2>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[#666666] text-sm sm:text-base w-full sm:w-auto">
                  <span className="whitespace-nowrap">Sort By:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full py-6 sm:w-[160px] lg:w-[180px] h-10 sm:h-12 text-sm sm:text-base rounded-lg border border-solid border-gray-300">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="old">Old</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters Display - Updated to show ALL filters */}
            {hasActiveFilters() && (
              <div className="px-4 sm:px-0 mb-3 sm:mb-4">
                <div className="p-3 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs sm:text-sm font-medium text-emerald-700 mb-1 sm:mb-0">
                      Active Filters:
                    </span>

                    {/* Global Search Filter */}
                    {globalSearchValue && (
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                        onClick={() => handleRemoveFilter("globalSearch", globalSearchValue)}
                      >
                        Global Search: {globalSearchValue}
                        <X className="w-3 h-3 ml-1" />
                      </button>
                    )}

                    {/* Keyword Search Filter */}
                    {keywordSearchValue && (
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                        onClick={() => handleRemoveFilter("keywordSearch", keywordSearchValue)}
                      >
                        Keyword Search: {keywordSearchValue}
                        <X className="w-3 h-3 ml-1" />
                      </button>
                    )}

                    {/* Category Filters */}
                    {selectedCategoryNames
                      .filter((cat) => cat?.id && cat?.name)
                      .map((cat) => (
                        <button
                          key={`category-${cat.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                          onClick={() => handleRemoveFilter("category", cat.id)}
                        >
                          Category: {cat.name}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      ))}

                    {/* City Filters */}
                    {selectedCities.map((cityId) => {
                      const city = filters.cities.find((c) => c.id === cityId)
                      return (
                        <button
                          key={`city-${cityId}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                          onClick={() => handleRemoveFilter("city", cityId)}
                        >
                          City: {city?.name || cityId}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      )
                    })}

                    {/* State Filters */}
                    {selectedStates.map((stateId) => {
                      const state = filters.states.find((s) => s.id === stateId)
                      return (
                        <button
                          key={`state-${stateId}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                          onClick={() => handleRemoveFilter("state", stateId)}
                        >
                          State: {state?.name || stateId}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      )
                    })}

                    {/* Job Type Filters */}
                    {selectedTypes.map((typeId) => {
                      const type = filters.types.find((t) => t.id === typeId)
                      return (
                        <button
                          key={`type-${typeId}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                          onClick={() => handleRemoveFilter("type", typeId)}
                        >
                          Type: {type?.name || typeId}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      )
                    })}

                    {/* Employer Filters */}
                    {selectedEmployers.map((employerId) => {
                      const employer = filters.employers.find((e) => e.id === employerId)
                      return (
                        <button
                          key={`employer-${employerId}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                          onClick={() => handleRemoveFilter("employer", employerId)}
                        >
                          Employer: {employer?.name || employerId}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      )
                    })}

                    {/* Experience Filters */}
                    {selectedExperience.map((experienceId) => {
                      const experience = filters.experience.find((e) => e.id === experienceId)
                      return (
                        <button
                          key={`experience-${experienceId}`}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                          onClick={() => handleRemoveFilter("experience", experienceId)}
                        >
                          Experience: {experience?.name || experienceId}
                          <X className="w-3 h-3 ml-1" />
                        </button>
                      )
                    })}

                    {/* Salary Filter */}
                    {selectedSalaryOption && (
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                        onClick={() => handleRemoveFilter("salary", selectedSalaryOption)}
                      >
                        Salary: {selectedSalaryOption}
                        <X className="w-3 h-3 ml-1" />
                      </button>
                    )}

                    {/* Date Posted Filter */}
                    {selectedDatePosted && (
                      <button
                        className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 text-white text-xs rounded-full transition-colors hover:bg-emerald-700"
                        onClick={() => handleRemoveFilter("datePosted", selectedDatePosted)}
                      >
                        Date: {selectedDatePosted}
                        <X className="w-3 h-3 ml-1" />
                      </button>
                    )}
                  </div>
                  <Button
                    variant="link"
                    onClick={handleResetFilters}
                    className="text-emerald-700 hover:text-emerald-900 hover:underline text-xs sm:text-sm font-medium whitespace-nowrap p-0 h-auto mt-2"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-6 sm:space-y-4 lg:space-y-6">
              {jobLoading ? (
                <div className="text-center text-gray-500 py-16 sm:py-20">
                  <div className="text-sm sm:text-base">
                    <BeatLoader color="#23baa1" className="mx-auto" />
                  </div>
                </div>
              ) : paginatedJobs.length === 0 ? (
                <div className="text-center text-gray-500 py-16 sm:py-20">
                  <div className="text-sm sm:text-base">No jobs found.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-y-6 sm:gap-y-4">
                  {paginatedJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/job/${job.id}`}
                      className="block bg-white cursor-pointer border border-gray-200 shadow-sm p-3 sm:p-4 lg:p-5 flex flex-col gap-3 sm:gap-4 rounded-lg hover:shadow-md transition-shadow mx-4 sm:mx-0"
                    >
                      <div className="flex-grow">
                        {/* Header: Title + Job Type */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 sm:mb-3 gap-2">
                          <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#333333] leading-tight">
                            {job.title}
                          </h3>
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${getJobTypeClasses(job.type)}`}
                          >
                            {job.type}
                          </span>
                        </div>

                        {/* Meta info: Location, Salary, Date */}
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 text-[#666666] text-xs sm:text-sm mb-2 sm:mb-3">
                          {job.location !== "" && job.state !== "" && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">
                                {job.city}, {job.state}
                              </span>
                            </div>
                          )}
                          {job.salary !== "" && job.customFloat1 !== "" ? (
                            <div className="flex items-center gap-1">
                              <Banknote className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                              <span className="truncate">
                                ${job.salary}/yr - ${job.customFloat1}/yr
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <Banknote className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                              <span>Negotiable</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                            <span className="whitespace-nowrap">
                              {new Date(getJobTimestamp(job)).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-[#666666] mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed">
                          {job.publicDescription?.trim()
                            ? job.publicDescription
                              .replace(/^.*?is seeking for (an?|the)?/i, "")
                              .replace(/^Timpl.*?(seeking for|looking for)/i, "")
                            : "No description available"}
                        </p>

                        {/* Category Badge */}
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getCategoryClasses(job.employer)}`}
                        >
                          {job.publishedCategory}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {!jobLoading && paginatedJobs.length !== 0 && totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <div className="flex flex-nowrap flex-row items-center gap-1 sm:gap-2 max-w-full px-2">
                    {/* Prev Button */}
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-2 cursor-pointer sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-black disabled:opacity-50 hover:bg-[#23baa1] hover:text-white transition"
                    >
                      Prev
                    </button>

                    {/* First Page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => setCurrentPage(1)}
                          className={`px-2 cursor-pointer sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium border transition-colors ${currentPage === 1
                            ? "bg-[#23baa1] text-white border-[#23baa1]"
                            : "text-black border-gray-300 hover:bg-red-50"
                            }`}
                        >
                          1
                        </button>
                        <span className="text-gray-400 text-sm">...</span>
                      </>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: 5 }, (_, i) => {
                      const startPage = Math.max(1, currentPage - 2)
                      const endPage = Math.min(totalPages, startPage + 4)
                      const page = startPage + i
                      if (page > endPage) return null
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-2 cursor-pointer sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium border transition-colors ${currentPage === page
                            ? "bg-[#23baa1] text-white border-[#23baa1]"
                            : "text-black border-gray-300 hover:bg-[#23baa1] hover:text-white"
                            }`}
                        >
                          {page}
                        </button>
                      )
                    })}

                    {/* Next Button */}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-2 cursor-pointer sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium text-black disabled:opacity-50 hover:bg-[#23baa1] hover:text-white transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Sidebar */}

          <div className="hidden lg:block">
            <div className="flex flex-col gap-6">
              <div className="w-full">
                <div className="sticky top-0 z-50 border border-solid border-gray-300 rounded-xl p-3 sm:p-4 lg:p-6 bg-white space-y-4 sm:space-y-6 shadow-sm mt-4">
                  <h3 className="text-base lg:text-lg font-semibold text-[#333333] mb-3 lg:mb-4">Search Keywords</h3>
                  <form
                    className="relative flex items-center mb-4 lg:mb-5"
                    onSubmit={(e) => {
                      e.preventDefault()
                      setGlobalSearchValue("")
                      setHeroSearchKeyword("")
                      const inputValue = keywordInputRef.current?.value || ""
                      if (!inputValue.trim()) {
                        return
                      }
                      ; (async () => {
                        const res = await handleFilterJobs(false)
                        if (res && res.jobs && Array.isArray(res.jobs)) {
                          localStorage.setItem("searchedJobIds", JSON.stringify(res.jobs.map((job) => job.id)))
                          console.log(
                            "Updated searchedJobIds in localStorage (filter section):",
                            res.jobs.map((job) => job.id),
                          )
                        }
                      })()
                    }}
                  >
                    <input
                      type="text"
                      ref={keywordInputRef}
                      placeholder="Keyword"
                      className="w-full pl-3 sm:pl-4 pr-12 sm:pr-16 py-2 lg:py-3 text-sm lg:text-base rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#23baa1] focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="absolute cursor-pointer right-0 w-10 h-10 lg:w-12 lg:h-12 bg-[#23baa1] hover:bg-[#23baa1]/90 rounded-md flex items-center justify-center transition-colors"
                    >
                      <Search className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </button>
                  </form>
                </div>
              </div>
              <div className="w-full">
                <FilterSection />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}