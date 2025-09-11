import { apiService, type ApiResponse } from "./api"
import type { ResumeData } from "../types/resume"

export interface Resume {
  _id: string
  user: string
  title: string
  templateId: string
  personalInfo: ResumeData["personalInfo"]
  professionalSummary: string
  jobRole: string
  skills: string[]
  experience: ResumeData["experience"]
  education: ResumeData["education"]
  certifications: ResumeData["certifications"]
  projects: ResumeData["projects"]
  isPublic: boolean
  status: "draft" | "published" | "archived"
  createdAt: string
  updatedAt: string
  completionPercentage?: number
  downloadCount?: number
  viewCount?: number
}

export interface ResumeListResponse {
  resumes: Resume[]
  total: number
  page: number
  pages: number
  count: number
}

export interface CreateResumeData {
  title: string
  templateId: string
  personalInfo: ResumeData["personalInfo"]
  professionalSummary?: string
  jobRole?: string
  skills?: string[]
  experience?: ResumeData["experience"]
  education?: ResumeData["education"]
  certifications?: ResumeData["certifications"]
  projects?: ResumeData["projects"]
}

class ResumeService {
  async getResumes(page = 1, limit = 10): Promise<ApiResponse<ResumeListResponse>> {
    try {
      return await apiService.get<ResumeListResponse>(`/resumes?page=${page}&limit=${limit}`)
    } catch (error) {
      console.error("Get resumes failed:", error)
      throw error
    }
  }

  async getResume(id: string): Promise<ApiResponse<Resume>> {
    try {
      return await apiService.get<Resume>(`/resumes/${id}`)
    } catch (error) {
      console.error("Get resume failed:", error)
      throw error
    }
  }

  async createResume(resumeData: CreateResumeData): Promise<ApiResponse<Resume>> {
    try {
      return await apiService.post<Resume>("/resumes", resumeData)
    } catch (error) {
      console.error("Create resume failed:", error)
      throw error
    }
  }

  async updateResume(id: string, resumeData: Partial<CreateResumeData>): Promise<ApiResponse<Resume>> {
    try {
      return await apiService.put<Resume>(`/resumes/${id}`, resumeData)
    } catch (error) {
      console.error("Update resume failed:", error)
      throw error
    }
  }

  async deleteResume(id: string): Promise<ApiResponse> {
    try {
      return await apiService.delete(`/resumes/${id}`)
    } catch (error) {
      console.error("Delete resume failed:", error)
      throw error
    }
  }

  async duplicateResume(id: string): Promise<ApiResponse<Resume>> {
    try {
      return await apiService.post<Resume>(`/resumes/${id}/duplicate`)
    } catch (error) {
      console.error("Duplicate resume failed:", error)
      throw error
    }
  }

  // Auto-save functionality
  async autoSave(id: string, resumeData: Partial<CreateResumeData>): Promise<void> {
    try {
      await this.updateResume(id, resumeData)
    } catch (error) {
      console.error("Auto-save failed:", error)
      // Don't throw error for auto-save failures
    }
  }
}

export const resumeService = new ResumeService()
