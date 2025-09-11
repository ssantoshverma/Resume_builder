import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { authService } from "../services/auth"
import { cookieUtils } from "../utils/cookies"

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = authService.isAuthenticated()

  console.log("[v0] ProtectedRoute - isAuthenticated:", isAuthenticated)
  console.log("[v0] ProtectedRoute - localStorage isAuthenticated:", localStorage.getItem("isAuthenticated"))
  console.log("[v0] ProtectedRoute - localStorage authToken:", !!localStorage.getItem("authToken"))
  console.log("[v0] ProtectedRoute - cookie authToken:", !!cookieUtils.getCookie("authToken"))
  console.log("[v0] ProtectedRoute - cookie value:", cookieUtils.getCookie("authToken"))

  if (!isAuthenticated) {
    console.log("[v0] ProtectedRoute - Redirecting to login")
    return <Navigate to="/login" replace />
  }

  console.log("[v0] ProtectedRoute - Allowing access")
  return <>{children}</>
}
