import "server-only"

import {
  asRecord,
  getNumber,
  getString,
  getStringProp,
} from "@/lib/ai/tool-output"

const REDACT_KEYS = new Set([
  "email",
  "e-mail",
  "phone",
  "tel",
  "telephone",
  "mobile",
  "cell",
])

function redactPII(value: unknown, depth = 0): unknown {
  if (depth > 6) return null
  if (value === null) return null
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return value

  if (Array.isArray(value)) {
    const capped = value.slice(0, 50)
    return capped.map((v) => redactPII(v, depth + 1))
  }

  const record = asRecord(value)
  if (!record) return null

  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(record)) {
    if (REDACT_KEYS.has(k.toLowerCase())) {
      out[k] = "[REDACTED]"
      continue
    }
    out[k] = redactPII(v, depth + 1)
  }
  return out
}

function pickSkillTags(
  value: unknown,
): Array<{ id: string; name: string; category: string | null }> {
  if (!Array.isArray(value)) return []
  const out: Array<{ id: string; name: string; category: string | null }> = []
  for (const item of value.slice(0, 200)) {
    const rec = asRecord(item)
    if (!rec) continue
    const id = getString(rec.id)
    const name = getString(rec.name)
    if (!id || !name) continue
    out.push({ id, name, category: getString(rec.category) })
  }
  return out
}

function pickSkills(
  value: unknown,
): Array<{ id: string; name: string; category: string | null }> {
  if (!Array.isArray(value)) return []
  const out: Array<{ id: string; name: string; category: string | null }> = []
  for (const item of value.slice(0, 100)) {
    const rec = asRecord(item)
    if (!rec) continue
    const id = getString(rec.id)
    const name = getString(rec.name)
    if (!id || !name) continue
    out.push({ id, name, category: getString(rec.category) })
  }
  return out
}

export function minimizeAssistantContext(context: unknown): unknown {
  const record = asRecord(context)
  if (!record) return null

  const intent = getStringProp(record, "intent")
  if (!intent) return null

  if (
    intent === "offer_generate_draft" ||
    intent === "offer_improve_description" ||
    intent === "offer_suggest_skill_tags"
  ) {
    return {
      intent,
      prompt: getString(record.prompt),
      title: getString(record.title),
      internshipType: getString(record.internshipType),
      workMode: getString(record.workMode),
      wilayaCode: getNumber(record.wilayaCode),
      durationWeeks: getNumber(record.durationWeeks),
      maxPositions: getNumber(record.maxPositions),
      description: getString(record.description),
      availableSkillTags: pickSkillTags(record.availableSkillTags),
    }
  }

  if (intent === "candidate_summarize") {
    const offer = asRecord(record.offer)
    const applicant = asRecord(record.applicant)
    return {
      intent,
      offer: {
        title: getStringProp(offer, "title"),
        skills: pickSkills(offer?.skills),
      },
      applicant: {
        name: getStringProp(applicant, "name"),
        skills: pickSkills(applicant?.skills),
        coverLetter: getStringProp(applicant, "coverLetter") ?? "",
      },
    }
  }

  if (intent === "candidate_draft_refusal_note") {
    const offer = asRecord(record.offer)
    const applicant = asRecord(record.applicant)
    return {
      intent,
      offer: {
        title: getStringProp(offer, "title"),
      },
      applicant: {
        name: getStringProp(applicant, "name"),
      },
    }
  }

  if (intent === "admin_validation_summary") {
    const application = asRecord(record.application)
    const student = asRecord(application?.student)
    const offer = asRecord(application?.offer)
    const company = asRecord(application?.company)
    const university = asRecord(application?.university)
    const profile = asRecord(application?.profile)

    return {
      intent,
      application: {
        id: getStringProp(application, "id"),
        createdAt: getStringProp(application, "createdAt"),
        companyActionAt: getStringProp(application, "companyActionAt"),
        selectedStartDate: getStringProp(application, "selectedStartDate"),
        selectedEndDate: getStringProp(application, "selectedEndDate"),
        coverLetter: getStringProp(application, "coverLetter"),
        student: {
          name: getStringProp(student, "name"),
        },
        profile: {
          level: getStringProp(profile, "level"),
          department: getStringProp(profile, "department"),
        },
        university: {
          name: getStringProp(university, "name"),
          abbreviation: getStringProp(university, "abbreviation"),
        },
        offer: {
          title: getStringProp(offer, "title"),
          internshipType: getStringProp(offer, "internshipType"),
          workMode: getStringProp(offer, "workMode"),
          wilayaCode: getNumber(offer?.wilayaCode),
          durationWeeks: getNumber(offer?.durationWeeks),
        },
        company: {
          name: getStringProp(company, "name"),
        },
        skills: pickSkills(application?.skills),
      },
    }
  }

  if (intent === "student_search_parse") {
    return {
      intent,
      query: getString(record.query),
      availableSkillTags: pickSkillTags(record.availableSkillTags),
    }
  }

  if (intent === "student_cover_letter_draft") {
    const offer = asRecord(record.offer)
    const company = asRecord(record.company)
    return {
      intent,
      offer: {
        title: getStringProp(offer, "title"),
        description: getStringProp(offer, "description"),
        internshipType: getStringProp(offer, "internshipType"),
        workMode: getStringProp(offer, "workMode"),
        wilayaCode: getNumber(offer?.wilayaCode),
        durationWeeks: getNumber(offer?.durationWeeks),
        skills: pickSkills(offer?.skills),
      },
      company: {
        name: getStringProp(company, "name"),
        description: getStringProp(company, "description"),
      },
      currentCoverLetter: getStringProp(record, "currentCoverLetter"),
    }
  }

  if (intent === "notifications_summarize") {
    const notifications = Array.isArray(record.notifications)
      ? record.notifications.slice(0, 50)
      : []
    return {
      intent,
      role: getString(record.role),
      notifications: notifications
        .map((n) => {
          const rec = asRecord(n)
          if (!rec) return null
          return {
            id: getString(rec.id),
            type: getString(rec.type),
            createdAt: getString(rec.createdAt),
            readAt: getString(rec.readAt),
            payload: redactPII(rec.payload),
          }
        })
        .filter(
          (
            v,
          ): v is {
            id: string | null
            type: string | null
            createdAt: string | null
            readAt: string | null
            payload: unknown
          } => v !== null,
        ),
    }
  }

  // Unknown intent — only pass the intent identifier, no arbitrary context
  return { intent }
}

export function assistantContextToJson(context: unknown): string {
  return JSON.stringify(minimizeAssistantContext(context))
}
