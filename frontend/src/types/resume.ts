export interface ResumeData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    website: string
    linkedin: string
    github: string
    portfolio: string
    profilePhoto: string
  }
  professionalSummary: string
  jobRole: string
  skills: string[]
  experience: Array<{
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    institution: string
    degree: string
    field: string
    startDate: string
    endDate: string
    gpa?: string
  }>
  certifications: Array<{
    id: string
    name: string
    issuer: string
    date: string
    expiryDate?: string
  }>
  projects: Array<{
    id: string
    name: string
    description: string
    technologies: string[]
    link?: string
  }>
}
