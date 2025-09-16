const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"

export interface SkillsGapAnalysis {
  id: string
  targetRole: string
  matchedSkills: MatchedSkill[]
  missingSkills: MissingSkill[]
  roleRequirements: RoleRequirement[]
  overallMatch: number
  skillsGapPercentage: number
  analysisDate: string
}

export interface MatchedSkill {
  name: string
  category: "technical" | "soft" | "certification" | "tool"
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert"
}

export interface MissingSkill {
  name: string
  category: "technical" | "soft" | "certification" | "tool"
  importance: "critical" | "important" | "nice-to-have"
  estimatedLearningTime: string
}

export interface RoleRequirement {
  name: string
  category: string
  required: boolean
  description: string
}

export interface GrowthPath {
  id: string
  targetRole: string
  skillPlans: SkillPlan[]
  overallProgress: number
  estimatedCompletionTime: string
  completedSkillsCount: number
  inProgressSkillsCount: number
  notes?: string
}

export interface SkillPlan {
  skill: {
    name: string
    category: "technical" | "soft" | "certification" | "tool"
    priority: "high" | "medium" | "low"
  }
  estimatedDuration: string
  resources: Resource[]
  milestones: Milestone[]
  overallProgress: number
  status: "not-started" | "in-progress" | "completed" | "paused"
}

export interface Resource {
  type: "course" | "book" | "tutorial" | "documentation" | "practice" | "certification"
  title: string
  url: string
  description: string
  estimatedTime: string
  difficulty: "beginner" | "intermediate" | "advanced"
  free: boolean
}

export interface Milestone {
  week: number
  title: string
  description: string
  tasks: string[]
  completed: boolean
  completedAt?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
}

class CareerInsightsService {
  private baseURL: string

  constructor() {
    this.baseURL = `${API_BASE_URL}/career-insights`
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("authToken")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async analyzeSkillsGap(targetRole: string): Promise<ApiResponse<SkillsGapAnalysis>> {
    try {
      const response = await fetch(`${this.baseURL}/analyze-gap`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ targetRole }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to analyze skills gap")
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error("Skills gap analysis error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to analyze skills gap",
      }
    }
  }

  async getSkillsGap(): Promise<ApiResponse<SkillsGapAnalysis>> {
    try {
      const response = await fetch(`${this.baseURL}/skills-gap`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to get skills gap analysis")
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error("Get skills gap error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get skills gap analysis",
      }
    }
  }

  async generateGrowthPath(skillsGapId: string): Promise<ApiResponse<GrowthPath>> {
    try {
      const response = await fetch(`${this.baseURL}/generate-growth-path`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ skillsGapId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate growth path")
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error("Growth path generation error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate growth path",
      }
    }
  }

  async getGrowthPath(): Promise<ApiResponse<GrowthPath>> {
    try {
      const response = await fetch(`${this.baseURL}/growth-path`, {
        method: "GET",
        headers: this.getAuthHeaders(),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to get growth path")
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error("Get growth path error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get growth path",
      }
    }
  }

  async updateMilestone(
    skillIndex: number,
    milestoneIndex: number,
    completed: boolean = true
  ): Promise<ApiResponse<GrowthPath>> {
    try {
      const response = await fetch(`${this.baseURL}/growth-path/milestone`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          skillIndex,
          milestoneIndex,
          completed,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update milestone")
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error("Update milestone error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update milestone",
      }
    }
  }

  async updateNotes(notes: string): Promise<ApiResponse<{ notes: string }>> {
    try {
      const response = await fetch(`${this.baseURL}/growth-path/notes`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ notes }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update notes")
      }

      return {
        success: true,
        data: data.data,
      }
    } catch (error) {
      console.error("Update notes error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update notes",
      }
    }
  }
}

export const careerInsightsService = new CareerInsightsService()