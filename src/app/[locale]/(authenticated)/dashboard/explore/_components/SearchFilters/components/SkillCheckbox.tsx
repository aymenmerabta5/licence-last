import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface SkillCheckboxProps {
  skill: { id: string; name: string }
  checked: boolean
  onToggle: (id: string) => void
}

export function SkillCheckbox({
  skill,
  checked,
  onToggle,
}: SkillCheckboxProps) {
  return (
    <label
      className={cn(
        "flex items-center gap-2.5 cursor-pointer py-1 px-2 -mx-2 transition-colors",
        checked && "bg-primary/[0.04]",
      )}
    >
      <Checkbox checked={checked} onCheckedChange={() => onToggle(skill.id)} />
      <span className={cn("text-sm", checked && "font-medium")}>
        {skill.name}
      </span>
    </label>
  )
}
