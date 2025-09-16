"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { EyeIcon, EyeSlashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import AuthLayout from "../layouts/AuthLayout"
import { authService, type RegisterData } from "../services/auth"

const STEPS = {
  NAME: 1,
  EMAIL: 2,
  PASSWORD: 3,
  CONFIRM: 4,
}

export default function Signup() {
  const [currentStep, setCurrentStep] = useState(STEPS.NAME)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case STEPS.NAME:
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        break
      case STEPS.EMAIL:
        if (!formData.email) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format"
        break
      case STEPS.PASSWORD:
        if (!formData.password) {
          newErrors.password = "Password is required"
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters"
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
          newErrors.password =
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        }
        break
      case STEPS.CONFIRM:
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords do not match"
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validateStep(STEPS.CONFIRM)) return

    setIsLoading(true)
    setErrors({})

    try {
      const registerData: RegisterData = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      }

      const response = await authService.register(registerData)

      if (response.success) {
        navigate("/profile")
      } else {
        setErrors({ general: response.message || "Registration failed" })
      }
    } catch (error: any) {
      console.error("Registration error:", error)
      setErrors({
        general: error.message || "Registration failed. Please try again.",
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

  const renderStep = () => {
    switch (currentStep) {
      case STEPS.NAME:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">What's your name?</h2>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`input-glass w-full ${errors.firstName ? "border-destructive" : ""}`}
                placeholder="Enter your first name"
              />
              {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`input-glass w-full ${errors.lastName ? "border-destructive" : ""}`}
                placeholder="Enter your last name"
              />
              {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName}</p>}
            </div>
          </div>
        )

      case STEPS.EMAIL:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">What's your email?</h2>
            <div>
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
            </div>
          </div>
        )

      case STEPS.PASSWORD:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">Create a password</h2>
            <div>
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
              <p className="mt-2 text-xs text-muted-foreground">
                Password must be at least 6 characters and contain uppercase, lowercase, and number
              </p>
            </div>
          </div>
        )

      case STEPS.CONFIRM:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center mb-6">Confirm your password</h2>
            {errors.general && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{errors.general}</p>
              </div>
            )}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-glass w-full pr-10 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                step <= currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>

        <div className="flex space-x-3">
          {currentStep > 1 && (
            <button type="button" onClick={handleBack} className="btn-glass flex-1 flex items-center justify-center">
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Back
            </button>
          )}

          {currentStep < STEPS.CONFIRM ? (
            <button type="button" onClick={handleNext} className="btn-primary flex-1 flex items-center justify-center">
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}
