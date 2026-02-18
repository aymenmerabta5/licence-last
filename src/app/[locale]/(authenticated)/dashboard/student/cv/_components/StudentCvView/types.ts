export interface StudentCvExperience {
  id: string
  title: string
  organization: string
  description: string | null
  startDate: Date
  endDate: Date | null
  isCurrent: boolean
}

export interface StudentCvProject {
  id: string
  name: string
  summary: string
  projectUrl: string | null
  repositoryUrl: string | null
  startDate: Date | null
  endDate: Date | null
}

export interface StudentCvResume {
  fileKey: string
  fileName: string
  fileUrl: string
  fileSizeBytes: number
  mimeType: string
  uploadedAt: Date
}
