// API Configuration and Base Service
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// Token management
import { cookieUtils } from "../utils/cookies"

export const tokenManager = {
  getToken: () => {
    // Try cookies first, then localStorage as fallback
    const cookieToken = cookieUtils.getCookie("token")
    if (cookieToken) {
      console.log("[v0] Token found in cookies")
      return cookieToken
    }

    const localToken = localStorage.getItem("token")
    if (localToken) {
      console.log("[v0] Token found in localStorage")
      // Migrate to cookies
      cookieUtils.setCookie("token", localToken, 30)
      localStorage.removeItem("token")
      return localToken
    }

    console.log("[v0] No token found")
    return null
  },

  setToken: (token: string) => {
    console.log("[v0] Setting token in cookies and localStorage")
    // Store in both cookies (primary) and localStorage (fallback)
    cookieUtils.setCookie("token", token, 30)
    localStorage.setItem("token", token)
    console.log("[v0] Token stored successfully")
  },

  removeToken: () => {
    console.log("[v0] Removing token from cookies and localStorage")
    cookieUtils.deleteCookie("token")
    localStorage.removeItem("token")
  },

  isAuthenticated: () => {
    const hasToken = !!(cookieUtils.getCookie("token") || localStorage.getItem("token"))
    console.log("[v0] TokenManager isAuthenticated:", hasToken)
    return hasToken
  },
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  errors?: string[]
}

// Base API class with common functionality
class ApiService {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const token = tokenManager.getToken()

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiService = new ApiService(API_BASE_URL)
