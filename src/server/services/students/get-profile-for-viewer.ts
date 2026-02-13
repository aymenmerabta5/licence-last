"use cache"

import "server-only"

import { eq } from "drizzle-orm"
import { cacheTag, cacheLife } from "next/cache"

import { db } from "@/server/db"
import { studentProfile, studentSkill } from "@/server/db/schema/students"
import { skillTag } from "@/server/db/schema/skills"
import { getUserById } from "@/server/services/users/get-by-id"
import { CACHE_TAGS } from "@/lib/cache"

export interface ViewerIdentity {
  id: string
  role?: string | null
}

export interface ViewerSafeUser {
  id: string
  name: string | null
  role: string | null
  image: string | null
  universityId: string | null
  createdAt: Date
  email: string | null
}

export interface ViewerSafeStudentProfile {
  bio: string | null
  phone: string | null
  wilayaCode: number | null
  githubUrl: string | null
  portfolioUrl: string | null
  studentNumber: string | null
  department: string | null
  level: string | null
  address: string | null
}

export interface ViewerSafeStudentSkill {
  id: string
  name: string
  slug: string
  category: string | null
}

export interface StudentProfileForViewerResult {
  user: ViewerSafeUser
  profile: ViewerSafeStudentProfile | null
  skills: ViewerSafeStudentSkill[]
}

function canViewPrivateFields(viewer: ViewerIdentity, targetUserId: string) {
  const isOwner = viewer.id === targetUserId
  const isAdmin = viewer.role === "university_admin" || viewer.role === "super_admin"
  return isOwner || isAdmin
}

/**
 * Fetch a user's profile for display at /profile/[userId], applying "public-safe"
 * privacy defaults. Cached for 15 minutes per target user.
 */
export async function getStudentProfileForViewer({
  viewer,
  targetUserId,
}: {
  viewer: ViewerIdentity
  targetUserId: string
}): Promise<StudentProfileForViewerResult | null> {
  cacheLife("minutes")
  cacheTag(CACHE_TAGS.PUBLIC_PROFILE(targetUserId))

  const targetUser = await getUserById(targetUserId)
  if (!targetUser) return null

  const canViewPrivate = canViewPrivateFields(viewer, targetUserId)

  const [profileRow] = await db
    .select({
      bio: studentProfile.bio,
      phone: studentProfile.phone,
      wilayaCode: studentProfile.wilayaCode,
      githubUrl: studentProfile.githubUrl,
      portfolioUrl: studentProfile.portfolioUrl,
      studentNumber: studentProfile.studentNumber,
      department: studentProfile.department,
      level: studentProfile.level,
      address: studentProfile.address,
    })
    .from(studentProfile)
    .where(eq(studentProfile.userId, targetUserId))
    .limit(1)

  if (!profileRow) {
    return {
      user: {
        id: targetUser.id,
        name: targetUser.name,
        role: targetUser.role,
        image: targetUser.image,
        universityId: targetUser.universityId,
        createdAt: targetUser.createdAt,
        email: canViewPrivate ? targetUser.email : null,
      },
      profile: null,
      skills: [],
    }
  }

  const skills = await db
    .select({
      id: skillTag.id,
      name: skillTag.name,
      slug: skillTag.slug,
      category: skillTag.category,
    })
    .from(studentSkill)
    .innerJoin(skillTag, eq(studentSkill.skillTagId, skillTag.id))
    .where(eq(studentSkill.userId, targetUserId))

  return {
    user: {
      id: targetUser.id,
      name: targetUser.name,
      role: targetUser.role,
      image: targetUser.image,
      universityId: targetUser.universityId,
      createdAt: targetUser.createdAt,
      email: canViewPrivate ? targetUser.email : null,
    },
    profile: {
      bio: profileRow.bio,
      phone: canViewPrivate ? profileRow.phone : null,
      wilayaCode: profileRow.wilayaCode,
      githubUrl: profileRow.githubUrl,
      portfolioUrl: profileRow.portfolioUrl,
      studentNumber: canViewPrivate ? profileRow.studentNumber : null,
      department: profileRow.department,
      level: profileRow.level,
      address: canViewPrivate ? profileRow.address : null,
    },
    skills,
  }
}

