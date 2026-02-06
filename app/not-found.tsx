import Link from "next/link"
import { useTranslations } from "next-intl"

export default function NotFound() {
  const t = useTranslations()

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center px-4">
        <h1 className="font-serif text-6xl mb-4 text-primary">404</h1>
        <p className="text-xl mb-8 text-muted-foreground">
          {t("notFound.title")}
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
        >
          {t("notFound.returnHome")}
        </Link>
      </div>
    </div>
  )
}
