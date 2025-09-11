import { apiService, tokenManager, type ApiResponse } from "./api"

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  location?: string
  website?: string
  linkedin?: string
  bio?: string
  skills?: string[]
  role: string
  createdAt: string
  updatedAt?: string
  lastLogin?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

class AuthService {
async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
  try {
    console.log("[v0] AuthService - Starting login process")
    const response = await apiService.post<AuthResponse>("/auth/login", credentials)

    console.log("[v0] AuthService - Login response received:")
    console.log("  - Full response:", response)
    console.log("  - response.success:", response.success)
    console.log("  - response.data:", response.data)
    console.log("  - response.token:", (response as any).token)

    if (response.success && (response.data || (response as any).token)) {
      const token = response.data?.token || (response as any).token
      const user = response.data?.user || (response as any).user

      if (token && user) {
        tokenManager.setToken(token)
        localStorage.setItem("user", JSON.stringify(user))
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem("userEmail", user.email)
        localStorage.setItem("userName", user.name)
        console.log("[v0] AuthService - All data stored successfully")
      } else {
        console.log("[v0] AuthService - Missing token or user in response")
      }
    } else {
      console.log("[v0] AuthService - Login condition failed:")
      console.log("  - response.success:", response.success)
      console.log("  - response.data exists:", !!response.data)
      console.log("  - response.token exists:", !!(response as any).token)
    }

    return response
  } catch (error) {
    console.error("Login failed:", error)
    throw error
  }
}

  async register(userData: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiService.post<AuthResponse>("/auth/register", userData)

      if (response.success && (response.data || (response as any).token)) {
        const token = response.data?.token || (response as any).token
        const user = response.data?.user || (response as any).user

        if (token && user) {
          tokenManager.setToken(token)
          localStorage.setItem("user", JSON.stringify(user))
          localStorage.setItem("isAuthenticated", "true")
          localStorage.setItem("userEmail", user.email)
          localStorage.setItem("userName", user.name)
        }
      }

      return response
    } catch (error) {
      console.error("Registration failed:", error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post("/auth/logout")
    } catch (error) {
      console.error("Logout API call failed:", error)
    } finally {
      console.log("[v0] AuthService - Clearing all authentication data")
      tokenManager.removeToken()
      localStorage.removeItem("user")
      localStorage.removeItem("isAuthenticated")
      localStorage.removeItem("userEmail")
      localStorage.removeItem("userName")
      localStorage.removeItem("profileData")
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await apiService.get<User>("/auth/me")
    } catch (error) {
      console.error("Get current user failed:", error)
      throw error
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await apiService.put<User>("/users/profile", profileData)

      if (response.success && response.data) {
        localStorage.setItem("user", JSON.stringify(response.data))
        localStorage.setItem("userName", response.data.name)
      }

      return response
    } catch (error) {
      console.error("Profile update failed:", error)
      throw error
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    try {
      return await apiService.put("/users/change-password", {
        currentPassword,
        newPassword,
      })
    } catch (error) {
      console.error("Password change failed:", error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    const tokenAuth = tokenManager.isAuthenticated()
    const localAuth = localStorage.getItem("isAuthenticated") === "true"
    const result = tokenAuth && localAuth

    console.log("[v0] AuthService - isAuthenticated check:")
    console.log("  - tokenManager.isAuthenticated():", tokenAuth)
    console.log("  - localStorage isAuthenticated:", localAuth)
    console.log("  - final result:", result)

    return result
  }

  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  }
}

export const authService = new AuthService()
