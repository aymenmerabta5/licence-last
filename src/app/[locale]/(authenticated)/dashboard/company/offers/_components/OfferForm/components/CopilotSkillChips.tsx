import { Tag } from "lucide-react"

interface CopilotSkillChipsProps {
  skillTagIds?: string[]
  skillTagNames?: string[]
  skillMap: Map<string, string>
  label: string
}

export function CopilotSkillChips({
  skillTagIds,
  skillTagNames,
  skillMap,
  label,
}: CopilotSkillChipsProps) {
  const hasSkills =
    (skillTagIds && skillTagIds.length > 0) ||
    (skillTagNames && skillTagNames.length > 0)

  if (!hasSkills) {
    return null
  }

  return (
    <div>
      <p className="mb-2 text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/40 [[dir=rtl]_&]:tracking-normal">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {skillTagIds?.map((skillTagId) => (
          <span
            key={skillTagId}
            className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-amber-700 uppercase [[dir=rtl]_&]:tracking-normal dark:text-amber-400"
          >
            <Tag className="h-3 w-3" />
            {skillMap.get(skillTagId) ?? skillTagId}
          </span>
        ))}
        {skillTagNames
          ?.filter((skillTagName) => {
            const normalized = skillTagName.toLowerCase()
            return !skillTagIds?.some(
              (skillTagId) =>
                skillMap.get(skillTagId)?.toLowerCase() === normalized,
            )
          })
          .map((skillTagName) => (
            <span
              key={skillTagName}
              className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-amber-700 uppercase [[dir=rtl]_&]:tracking-normal dark:text-amber-400"
            >
              <Tag className="h-3 w-3" />
              {skillTagName}
            </span>
          ))}
      </div>
    </div>
  )
}
