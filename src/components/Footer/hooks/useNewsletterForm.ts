"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

export function useNewsletterForm() {
  const t = useTranslations("footer")
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const email = newsletterEmail.trim()

    if (!email) {
      setError(t("newsletter.errorEmpty"))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(t("newsletter.errorInvalid"))
      return
    }

    setError("")

    toast.success(t("newsletter.successTitle"), {
      description: t("newsletter.successDescription"),
      position: "bottom-center",
      duration: 3000,
    })

    setNewsletterEmail("")
  }

  const handleChange = (value: string) => {
    setNewsletterEmail(value)
    if (error) setError("")
  }

  return {
    newsletterEmail,
    error,
    handleSubmit,
    handleChange,
  }
}
