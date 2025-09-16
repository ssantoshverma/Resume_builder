"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"
import AuthLayout from "../layouts/AuthLayout"
import { authService, type LoginCredentials } from "../services/auth"

export default function Login() {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    // Client-side validation
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      const normalizedData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password.trim(),
      }

      console.log("[v0] Login attempt with email:", normalizedData.email)
      const response = await authService.login(normalizedData)

      if (response.success) {
        console.log("[v0] Login successful")
        
        setTimeout(() => {
          console.log("[v0] Navigating to dashboard after delay")
          navigate("/dashboard")
        }, 100)
      } else {
        console.log("[v0] Login failed:", response.message)
        setErrors({ general: response.message || "Login failed" })
      }
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      setErrors({
        general: error.message || "Login failed. Please check your credentials and try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    // Clear error when user starts typing
    if (errors[e.target.name] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
        general: "",
      }))
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
          >
            <p className="text-sm text-destructive">{errors.general}</p>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`input-glass w-full ${errors.email ? "border-destructive" : ""}`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              className={`input-glass w-full pr-10 ${errors.password ? "border-destructive" : ""}`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <EyeIcon className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
        </motion.div>

        <motion.button
          type="submit"
          disabled={isLoading}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Signing in...
            </div>
          ) : (
            "Sign In"
          )}
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </form>
    </AuthLayout>
  )
}
