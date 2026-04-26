import { describe, expect, test } from "bun:test"
import {
  buildNotificationsFallbackSummary,
  formatNotification,
  type NotificationTranslationFn,
} from "@/lib/notifications"

const t: NotificationTranslationFn = (key, values) => {
  const translations: Record<string, string> = {
    "feed.titles.new_application": "Nouvelle candidature",
    "feed.messages.new_application.withOfferTitle":
      "Un étudiant a postulé à {offerTitle}.",
    "feed.titles.new_message": "Nouveau message",
    "fallbackSummary.unreadStatus":
      "{unread} non lues sur {total} notifications.",
    "fallbackSummary.typeCount": "{type} : {count}",
    "fallbackSummary.actions.reviewUnread":
      "Consultez les notifications non lues.",
    "fallbackSummary.actions.prioritizeMessages":
      "Traitez les messages d'abord.",
    "fallbackSummary.actions.upToDate": "Vous êtes à jour.",
  }

  let text = translations[key] ?? key
  for (const [name, value] of Object.entries(values ?? {})) {
    text = text.replace(`{${name}}`, String(value))
  }
  return text
}

describe("src/lib/notifications", () => {
  test("formats localized notification copy when a translator is provided", () => {
    const result = formatNotification(
      {
        type: "new_application",
        payload: { offerTitle: "Platform Engineer Intern" },
      },
      t,
    )

    expect(result).toEqual({
      title: "Nouvelle candidature",
      message: "Un étudiant a postulé à Platform Engineer Intern.",
    })
  })

  test("builds a localized fallback summary", () => {
    const result = buildNotificationsFallbackSummary(
      [
        { type: "new_application", readAt: null },
        { type: "new_message", readAt: "2030-01-01T00:00:00.000Z" },
      ],
      t,
    )

    expect(result.summaryBullets[0]).toBe("1 non lues sur 2 notifications.")
    expect(result.summaryBullets[1]).toBe("Nouvelle candidature : 1")
    expect(result.suggestedNextActions).toEqual([
      "Consultez les notifications non lues.",
      "Traitez les messages d'abord.",
    ])
  })
})
