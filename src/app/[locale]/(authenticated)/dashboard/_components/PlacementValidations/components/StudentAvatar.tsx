import Image from "next/image"

function getInitials(name: string | null) {
  return (name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface StudentAvatarProps {
  image: string | null
  name: string | null
}

export function StudentAvatar({ image, name }: StudentAvatarProps) {
  const initials = getInitials(name)

  return (
    <div className="relative shrink-0">
      <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background overflow-hidden bg-muted flex items-center justify-center">
        {image ? (
          <Image
            src={image}
            alt={name || "Student"}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <span className="text-foreground/50 text-xl sm:text-2xl font-serif tracking-tighter">
            {initials}
          </span>
        )}
      </div>
    </div>
  )
}
