"use client"

import { useQuery } from "@tanstack/react-query"
import { Building2, Loader2, Search, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDebounce } from "@/hooks"
import { orpc } from "@/server/orpc/client"

type SearchRole =
  | "student"
  | "company_admin"
  | "university_admin"
  | "department_head"
  | "super_admin"
  | "recruiter"

interface OrganizationSearchFieldProps {
  role: SearchRole
  value: string
  onChange: (id: string, name: string) => void
  onClear: () => void
}

function requiresUniversity(role: SearchRole) {
  return role === "student" || role === "department_head"
}

function requiresCompany(role: SearchRole) {
  return role === "recruiter"
}

export function OrganizationSearchField({
  role,
  value,
  onChange,
  onClear,
}: OrganizationSearchFieldProps) {
  const t = useTranslations("dashboard.superAdmin.users")
  const [searchQuery, setSearchQuery] = useState("")
  const [resultsOpen, setResultsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const isUniversitySearch = requiresUniversity(role)
  const isCompanySearch = requiresCompany(role)

  const universitiesQuery = useQuery({
    ...orpc.universities.list.queryOptions({
      input: { search: debouncedSearch, limit: 10 },
    }),
    enabled: isUniversitySearch && debouncedSearch.length > 0 && resultsOpen,
  })

  const companiesQuery = useQuery({
    ...orpc.companies.list.queryOptions({
      input: { search: debouncedSearch, status: "approved", limit: 10 },
    }),
    enabled: isCompanySearch && debouncedSearch.length > 0 && resultsOpen,
  })

  const searchResults = isUniversitySearch
    ? (universitiesQuery.data?.universities ?? [])
    : isCompanySearch
      ? (companiesQuery.data?.companies ?? [])
      : []

  const searchLoading = isUniversitySearch
    ? universitiesQuery.isLoading
    : isCompanySearch
      ? companiesQuery.isLoading
      : false

  const selectedLabel = isUniversitySearch
    ? universitiesQuery.data?.universities.find((u) => u.id === value)?.name
    : isCompanySearch
      ? companiesQuery.data?.companies.find((c) => c.id === value)?.name
      : undefined

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setResultsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset when role prop changes
  useEffect(() => {
    setSearchQuery("")
    setResultsOpen(false)
  }, [role])

  const handleSelect = (item: { id: string; name: string }) => {
    onChange(item.id, item.name)
    setSearchQuery(item.name)
    setResultsOpen(false)
  }

  const handleClear = () => {
    onClear()
    setSearchQuery("")
  }

  if (!isUniversitySearch && !isCompanySearch) return null

  return (
    <div className="space-y-2" ref={containerRef}>
      <Label>
        {isUniversitySearch ? t("fields.university") : t("fields.company")}
      </Label>
      {selectedLabel ? (
        <div className="flex items-center gap-2 border border-border px-3 py-2 text-sm">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate">{selectedLabel}</span>
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setResultsOpen(true)
            }}
            onFocus={() => setResultsOpen(true)}
            placeholder={
              isUniversitySearch
                ? t("fields.selectUniversity")
                : t("fields.selectCompany")
            }
            className="ps-9"
          />
          {resultsOpen && (
            <div className="absolute z-50 mt-1 w-full border border-border bg-popover shadow-md max-h-60 overflow-auto">
              {searchLoading && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {!searchLoading && searchResults.length === 0 &&
                debouncedSearch.length > 0 && (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {t("fields.noResults")}
                  </div>
                )}
              {!searchLoading &&
                searchResults.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="w-full px-3 py-2 text-start text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
