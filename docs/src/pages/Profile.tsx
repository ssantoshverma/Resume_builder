"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { PlusIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline"
import AppLayout from "../layouts/AppLayout"
import { authService, type User } from "../services/auth"

/* ---------------------------
   Types
   --------------------------- */
interface Education {
  id: string
  degree: string
  institution: string
  year: string
}

interface Experience {
  id: string
  title: string
  company: string
  duration: string
  description: string
}

type ProfileFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  linkedin: string
  github: string
  portfolio: string
  skills: string
  profilePhoto: string // URL returned from backend (or empty)
}

const Profile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState<ProfileFormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    linkedin: "",
    github: "",
    portfolio: "",
    skills: "",
    profilePhoto: "",
  })

  const [education, setEducation] = useState<Education[]>([{ id: "1", degree: "", institution: "", year: "" }])
  const [experience, setExperience] = useState<Experience[]>([
    { id: "1", title: "", company: "", duration: "", description: "" },
  ])

  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleCircleClick = () => {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    loadUserProfile()
    const savedPhoto = localStorage.getItem("profilePhoto")
    if (savedPhoto) setPreview(savedPhoto)
  }, [])

  const loadUserProfile = async () => {
    try {
      const resp = (await authService.getCurrentUser()) as unknown as {
        success: boolean
        data?: User
        message?: string
      }

      if (resp && resp.success && resp.data) {
        const user = resp.data
        const [firstName, ...rest] = (user.name || "").split(" ")
        const lastName = rest.length ? rest.join(" ") : ""

        setFormData({
          firstName: firstName || "",
          lastName: lastName || "",
          email: user.email || "",
          phone: (user as any).phone || "",
          linkedin: (user as any).linkedin || "",
          github: (user as any).github || "",
          portfolio: (user as any).website || "",
          skills: Array.isArray(user.skills) ? (user.skills as string[]).join(", ") : "",
          profilePhoto: (user as any).profilePhoto || "",
        })

        const saved = localStorage.getItem("profileData")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed.education)) setEducation(parsed.education)
            if (Array.isArray(parsed.experience)) setExperience(parsed.experience)
          } catch {
            // ignore parse errors
          }
        }
      } else {
        const saved = localStorage.getItem("profileData")
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (parsed.formData) {
              setFormData((prev) => ({ ...prev, ...(parsed.formData as Partial<ProfileFormState>) }))
            }
            if (Array.isArray(parsed.education)) setEducation(parsed.education)
            if (Array.isArray(parsed.experience)) setExperience(parsed.experience)
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error("loadUserProfile error:", err)
      const saved = localStorage.getItem("profileData")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed.formData) {
            setFormData((prev) => ({ ...prev, ...(parsed.formData as Partial<ProfileFormState>) }))
          }
          if (Array.isArray(parsed.education)) setEducation(parsed.education)
          if (Array.isArray(parsed.experience)) setExperience(parsed.experience)
        } catch {
          // ignore
        }
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name as keyof ProfileFormState]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      const objectUrl = URL.createObjectURL(selected)
      setPreview(objectUrl)
      localStorage.setItem("profilePhoto", objectUrl)
    }
  }

  const addEducation = () =>
    setEducation((prev) => [...prev, { id: Date.now().toString(), degree: "", institution: "", year: "" }])

  const removeEducation = (id: string) => setEducation((prev) => prev.filter((e) => e.id !== id))

  const updateEducation = (id: string, field: keyof Education, value: string) =>
    setEducation((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)))

  const addExperience = () =>
    setExperience((prev) => [
      ...prev,
      { id: Date.now().toString(), title: "", company: "", duration: "", description: "" },
    ])

  const removeExperience = (id: string) => setExperience((prev) => prev.filter((e) => e.id !== id))

  const updateExperience = (id: string, field: keyof Experience, value: string) =>
    setExperience((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)))

  const handleSave = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      let resp: { success: boolean; data?: any; message?: string } | null = null

      if (file) {
        const fd = new FormData()
        fd.append("name", `${formData.firstName} ${formData.lastName}`.trim())
        fd.append("email", formData.email)
        fd.append("phone", formData.phone)
        fd.append("linkedin", formData.linkedin)
        fd.append("github", formData.github)
        fd.append("website", formData.portfolio)
        const skillsArr = formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
        skillsArr.forEach((skill) => {
          fd.append("skills[]", skill)
        })
        fd.append("profilePhoto", file)

        resp = (await (authService as any).updateProfile(fd, {
          headers: { "Content-Type": "multipart/form-data" },
        })) as {
          success: boolean
          data?: any
          message?: string
        }
      } else {
        const payload = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          linkedin: formData.linkedin,
          github: formData.github,
          website: formData.portfolio,
          skills: formData.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }
        resp = (await (authService as any).updateProfile(payload)) as {
          success: boolean
          data?: any
          message?: string
        }
      }

      if (resp && resp.success) {
        if (resp.data) {
          const updatedUser = resp.data as Partial<User>
          const [firstName, ...rest] = (updatedUser.name || "").split(" ")
          const lastName = rest.length ? rest.join(" ") : ""

          setFormData((prev) => ({
            ...prev,
            firstName: firstName || prev.firstName,
            lastName: lastName || prev.lastName,
            email: updatedUser.email || prev.email,
            phone: (updatedUser as any).phone || prev.phone,
            linkedin: (updatedUser as any).linkedin || prev.linkedin,
            github: (updatedUser as any).github || prev.github,
            portfolio: (updatedUser as any).website || prev.portfolio,
            skills: Array.isArray(updatedUser.skills) ? (updatedUser.skills as string[]).join(", ") : prev.skills,
            profilePhoto: (updatedUser as any).profilePhoto || prev.profilePhoto,
          }))
        }

        localStorage.setItem("profileData", JSON.stringify({ formData, education, experience }))

        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
        setFile(null)
        setPreview(null)
      } else {
        setErrorMessage(resp?.message || "Failed to update profile")
      }
    } catch (err: unknown) {
      console.error("handleSave error:", err)
      setErrorMessage((err as Error)?.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const avatarInitials = (): string => {
    const f = formData.firstName.trim()
    const l = formData.lastName.trim()
    if (f && l) return `${f[0].toUpperCase()}${l[0].toUpperCase()}`
    if (f) return f[0].toUpperCase()
    if (l) return l[0].toUpperCase()
    return "JD"
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Profile</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Build your professional profile to create better resumes
          </p>
        </motion.div>

        {/* Error Message */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-100 border border-red-300 rounded-lg"
          >
            <p className="text-sm text-red-700">{errorMessage}</p>
          </motion.div>
        )}

        {/* Profile Header with Photo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white bg-opacity-30 backdrop-blur-md shadow-lg rounded-2xl p-6 flex items-center space-x-6"
        >
          <div
            className="relative w-20 h-20 rounded-full bg-gray-100 cursor-pointer flex items-center justify-center overflow-hidden shadow-md"
            onClick={handleCircleClick}
            aria-label="Upload profile photo"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleCircleClick()}
          >
            {preview ? (
              <img src={preview || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
            ) : formData.profilePhoto ? (
              <img
                src={formData.profilePhoto || "/placeholder.svg"}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-3xl font-extrabold text-gray-400 select-none">{avatarInitials()}</span>
            )}
            <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 shadow-md">
              <PlusIcon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {formData.firstName && formData.lastName
                ? `${formData.firstName} ${formData.lastName}`
                : "Complete your profile"}
            </h2>
            <p className="text-muted-foreground">{formData.email || "Add your email"}</p>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </motion.div>

        {/* Basic Information */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white bg-opacity-30 backdrop-blur-md shadow-lg rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["firstName", "lastName", "email", "phone"].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-sm font-medium text-foreground mb-1">
                  {field === "firstName"
                    ? "First Name"
                    : field === "lastName"
                      ? "Last Name"
                      : field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "email" ? "email" : "text"}
                  id={field}
                  name={field}
                  value={formData[field as keyof ProfileFormState]}
                  onChange={handleInputChange}
                  className="input-glass w-full"
                  placeholder={`Enter your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Professional Links */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white bg-opacity-30 backdrop-blur-md shadow-lg rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Professional Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "linkedin", label: "LinkedIn" },
              { name: "github", label: "GitHub" },
              { name: "portfolio", label: "Portfolio" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-foreground mb-1">
                  {label}
                </label>
                <input
                  type="url"
                  id={name}
                  name={name}
                  value={formData[name as keyof ProfileFormState]}
                  onChange={handleInputChange}
                  className="input-glass w-full"
                  placeholder={`https://${label.toLowerCase()}.com/yourprofile`}
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
        </motion.section>

        {/* Education */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-white bg-opacity-30 backdrop-blur-md shadow-lg rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Education</h3>
            <button
              onClick={addEducation}
              className="btn-glass flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-sm text-sm font-semibold transition hover:bg-indigo-600 hover:text-white"
              aria-label="Add Education"
              type="button"
            >
              <PlusIcon className="h-4 w-4" />
              Add Education
            </button>
          </div>
          <div className="space-y-4">
            {education.map(({ id, degree, institution, year }) => (
              <div key={id} className="border border-border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: "Degree", value: degree, field: "degree" },
                    { label: "Institution", value: institution, field: "institution" },
                    { label: "Year", value: year, field: "year" },
                  ].map(({ label, value, field }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateEducation(id, field as keyof Education, e.target.value)}
                        className="input-glass w-full"
                        placeholder={label}
                      />
                    </div>
                  ))}
                  {education.length > 1 && (
                    <button
                      onClick={() => removeEducation(id)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      aria-label="Remove education"
                      type="button"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Experience */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white bg-opacity-30 backdrop-blur-md shadow-lg rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Experience</h3>
            <button
              onClick={addExperience}
              className="btn-glass flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-sm text-sm font-semibold transition hover:bg-indigo-600 hover:text-white"
              aria-label="Add Experience"
              type="button"
            >
              <PlusIcon className="h-4 w-4" />
              Add Experience
            </button>
          </div>
          <div className="space-y-4">
            {experience.map(({ id, title, company, duration, description }) => (
              <div key={id} className="border border-border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {[
                    { label: "Job Title", value: title, field: "title" },
                    { label: "Company", value: company, field: "company" },
                  ].map(({ label, value, field }) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateExperience(id, field as keyof Experience, e.target.value)}
                        className="input-glass w-full"
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => updateExperience(id, "duration", e.target.value)}
                      className="input-glass w-full"
                      placeholder="Jan 2020 - Present"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => updateExperience(id, "description", e.target.value)}
                      className="input-glass w-full h-20 resize-none"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                  {experience.length > 1 && (
                    <button
                      onClick={() => removeExperience(id)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      aria-label="Remove experience"
                      type="button"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Skills */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="bg-white bg-opacity-30 backdrop-blur-md shadow-lg rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Skills</h3>
          <textarea
            name="skills"
            value={formData.skills}
            onChange={handleInputChange}
            className="input-glass w-full h-28 resize-none"
            placeholder="List your skills, separated by commas (e.g., JavaScript, React, Node.js, Python)"
            aria-label="Skills"
          />
        </motion.section>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`btn-primary px-10 py-3 rounded-xl font-semibold text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              isSaved ? "bg-green-600 hover:bg-green-700" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : isSaved ? (
              <div className="flex items-center justify-center space-x-2">
                <CheckIcon className="h-5 w-5 text-white" />
                <span>Updated!</span>
              </div>
            ) : (
              "Update Profile"
            )}
          </button>
        </motion.div>
      </div>
    </AppLayout>
  )
}

export default Profile
