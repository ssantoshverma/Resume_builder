"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DocumentTextIcon,
  SparklesIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CogIcon,
} from "@heroicons/react/24/outline"
import AppLayout from "../layouts/AppLayout"
import type { ResumeData } from "../types/resume"
import { ModernTemplate, ClassicTemplate, CreativeTemplate, MinimalTemplate } from "../components/ResumeTemplates"
import { generatePDF, previewPDF } from "../utils/pdfGenerator"

const templates = [
  {
    id: "modern",
    name: "Modern Professional",
    preview: "/api/placeholder/300/400",
    description: "Clean and contemporary design perfect for tech roles",
    color: "blue",
    component: ModernTemplate,
  },
  {
    id: "classic",
    name: "Classic Executive",
    preview: "/api/placeholder/300/400",
    description: "Traditional format ideal for corporate positions",
    color: "gray",
    component: ClassicTemplate,
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    preview: "/api/placeholder/300/400",
    description: "Eye-catching design for creative professionals",
    color: "purple",
    component: CreativeTemplate,
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    preview: "/api/placeholder/300/400",
    description: "Simple and elegant with focus on content",
    color: "green",
    component: MinimalTemplate,
  },
]

export default function ResumeBuilder() {
  const [currentStep, setCurrentStep] = useState("method")
  const [selectedMethod, setSelectedMethod] = useState<"scratch" | "ai" | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [formStep, setFormStep] = useState(0)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [loading, setLoading] = useState(false)
  
  //////////////////////////////////////////////////


// inside ResumeBuilder.tsx component

const [skillsGapResult, setSkillsGapResult] = useState<any | null>(null);
const [analyzing, setAnalyzing] = useState(false);
const [error, setError] = useState<string | null>(null);

async function analyzeSkillsGap() {
  try {
    setAnalyzing(true);
    setError(null);
    setSkillsGapResult(null);

    const token = localStorage.getItem("token"); // your auth system
    if (!token) {
      setError("Please log in first");
      return;
    }

    const payload = {
      skills: resumeData.skills || [], // from Skills section
      targetRole: resumeData.jobRole || "", // from Job Role input
    };

    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/career-insights/analyze-gap-hf`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    if (!json.success) throw new Error(json.message || "Failed");

    setSkillsGapResult(json.data);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setAnalyzing(false);
  }
}



  //////////////////////////////////////////////////

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
    },
    professionalSummary: "",
    jobRole: "",
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
  })

  const [newSkill, setNewSkill] = useState("")

  const formSteps = [
    { id: "personal", title: "Personal Information", icon: UserIcon, required: true },
    { id: "role", title: "Job Role & Summary", icon: BriefcaseIcon, required: false },
    { id: "experience", title: "Work Experience", icon: BriefcaseIcon, required: false },
    { id: "education", title: "Education", icon: AcademicCapIcon, required: false },
    { id: "skills", title: "Skills & Certifications", icon: CogIcon, required: false },
  ]

  const addExperience = () => {
    const newExp = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    }
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }))
  }

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }))
  }

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
    }))
  }

  const addEducation = () => {
    const newEdu = {
      id: Date.now().toString(),
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    }
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }))
  }

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }))
  }

  const updateEducation = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)),
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const addCertification = () => {
    const newCert = {
      id: Date.now().toString(),
      name: "",
      issuer: "",
      date: "",
      expiryDate: "",
    }
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert],
    }))
  }

  const removeCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }))
  }

  const updateCertification = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert) => (cert.id === id ? { ...cert, [field]: value } : cert)),
    }))
  }

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
      link: "",
    }
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }))
  }

  const removeProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((proj) => proj.id !== id),
    }))
  }

  const updateProject = (id: string, field: string, value: any) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)),
    }))
  }

const generateAIContent = async () => {
  setLoading(true);
  try {
    const response = await fetch("http://localhost:5000/api/ai/generate-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        role: resumeData.jobRole,
        personalInfo: resumeData.personalInfo,
        experience: resumeData.experience,
        skills: resumeData.skills,
      }),
    });

    const data = await response.json();
    console.log("AI Summary response:", data);

    if (data.success) {
      // ✅ Insert AI-generated text into the professional summary field
      setResumeData((prev) => ({
        ...prev,
        professionalSummary: data.summary,
      }));
    } else {
      console.error("AI failed:", data.message);
    }
  } catch (err) {
    console.error("AI Summary generation failed:", err);
  } finally {
    setLoading(false);
  }
};



  const downloadPDF = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first")
      return
    }

    setIsGeneratingPDF(true)
    try {
      const filename = `${resumeData.personalInfo.fullName || "resume"}_${selectedTemplate}.pdf`
      await generatePDF("resume-content", filename)
    } catch (error) {
      console.error("PDF generation failed:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handlePreview = async () => {
    if (!selectedTemplate) {
      alert("Please select a template first")
      return
    }

    try {
      await previewPDF("resume-content")
    } catch (error) {
      console.error("PDF preview failed:", error)
      alert("Failed to preview PDF. Please try again.")
    }
  }

  const handleMethodSelect = (method: "scratch" | "ai") => {
    setSelectedMethod(method)
    if (method === "scratch") {
      setCurrentStep("template")
    } else {
      setCurrentStep("ai-wizard")
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setCurrentStep("editor")
    setFormStep(0)
  }

  const nextFormStep = () => {
    if (formStep < formSteps.length - 1) {
      setFormStep(formStep + 1)
    }
  }

  const prevFormStep = () => {
    if (formStep > 0) {
      setFormStep(formStep - 1)
    }
  }

  const renderMethodSelection = () => (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl font-bold text-foreground mb-4">Choose Your Method</h1>
        <p className="text-muted-foreground text-lg">Select how you want to build your resume</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleMethodSelect("scratch")}
          className="glass-card cursor-pointer hover:shadow-glow transition-all duration-300 group border-2 border-transparent hover:border-primary"
        >
          <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            <DocumentTextIcon className="h-16 w-16 text-muted-foreground relative z-10" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Build from Scratch</h3>
          <p className="text-sm text-muted-foreground">Manually enter your information</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleMethodSelect("ai")}
          className="glass-card cursor-pointer hover:shadow-glow transition-all duration-300 group border-2 border-transparent hover:border-primary"
        >
          <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            <SparklesIcon className="h-16 w-16 text-muted-foreground relative z-10" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">AI Assisted</h3>
          <p className="text-sm text-muted-foreground">Let AI suggest content for you</p>
        </motion.div>
      </div>
    </div>
  )

  const renderTemplateSelection = () => (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <button onClick={() => setCurrentStep("method")} className="btn-glass mb-6 flex items-center mx-auto">
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Back to Methods
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-4">Choose Your Template</h1>
        <p className="text-muted-foreground text-lg">
          Select a professional design that matches your industry and style
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleTemplateSelect(template.id)}
            className={`glass-card cursor-pointer hover:shadow-glow transition-all duration-300 group border-2 ${
              selectedTemplate === template.id ? "border-primary" : "border-transparent"
            }`}
          >
            <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  template.color === "blue"
                    ? "from-blue-500/10 to-blue-600/20"
                    : template.color === "gray"
                      ? "from-gray-500/10 to-gray-600/20"
                      : template.color === "purple"
                        ? "from-purple-500/10 to-purple-600/20"
                        : "from-green-500/10 to-green-600/20"
                }`}
              />
              <DocumentTextIcon className="h-16 w-16 text-muted-foreground relative z-10" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )

  const renderEditor = () => (
    <div className="max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setCurrentStep("template")} className="btn-glass flex items-center">
              <ChevronLeftIcon className="h-4 w-4 mr-2" />
              Templates
            </button>
            <h1 className="text-2xl font-bold text-foreground">Resume Builder</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={handlePreview} className="btn-glass flex items-center">
              <EyeIcon className="h-4 w-4 mr-2" />
              Preview
            </button>
            <button
              onClick={downloadPDF}
              disabled={isGeneratingPDF}
              className="btn-primary flex items-center disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {formSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    index === formStep
                      ? "border-primary bg-primary text-white"
                      : index < formStep
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p
                    className={`text-sm font-medium ${index <= formStep ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.title}
                  </p>
                  {step.required && <p className="text-xs text-red-500">Required</p>}
                </div>
                {index < formSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${index < formStep ? "bg-green-500" : "bg-gray-300"}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">{formSteps[formStep].title}</h2>
            <div className="flex space-x-2">
              <button
                onClick={prevFormStep}
                disabled={formStep === 0}
                className="btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={nextFormStep}
                disabled={formStep === formSteps.length - 1}
                className="btn-glass disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={formStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderFormStep()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Live Preview Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Live Preview</h2>
          <div className="bg-white rounded-lg shadow-lg min-h-[600px] border overflow-y-auto max-h-[600px]">
            {renderLivePreview()}
          </div>
        </motion.div>
      </div>
    </div>
  )

  const renderAIWizard = () => (
    <div className="max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <button onClick={() => setCurrentStep("method")} className="btn-glass mb-6 flex items-center mx-auto">
          <ChevronLeftIcon className="h-4 w-4 mr-2" />
          Back to Methods
        </button>
        <h1 className="text-3xl font-bold text-foreground mb-4">AI Assisted Resume Builder</h1>
        <p className="text-muted-foreground text-lg">Let AI suggest content for your resume</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card cursor-pointer hover:shadow-glow transition-all duration-300 group border-2 border-transparent hover:border-primary"
        >
          <div className="w-full h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            <SparklesIcon className="h-16 w-16 text-muted-foreground relative z-10" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Generate AI Content</h3>
          <p className="text-sm text-muted-foreground">Let AI suggest content for your resume</p>
        </motion.div>
      </div>
    </div>
  )

  const renderFormStep = () => {
    switch (formSteps[formStep].id) {
      case "personal":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.fullName}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, fullName: e.target.value },
                    }))
                  }
                  className="input-glass w-full"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                <input
                  type="email"
                  value={resumeData.personalInfo.email}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, email: e.target.value },
                    }))
                  }
                  className="input-glass w-full"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                <input
                  type="tel"
                  value={resumeData.personalInfo.phone}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, phone: e.target.value },
                    }))
                  }
                  className="input-glass w-full"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location *</label>
                <input
                  type="text"
                  value={resumeData.personalInfo.location}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, location: e.target.value },
                    }))
                  }
                  className="input-glass w-full"
                  placeholder="City, State"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Website</label>
                <input
                  type="url"
                  value={resumeData.personalInfo.website}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, website: e.target.value },
                    }))
                  }
                  className="input-glass w-full"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) =>
                    setResumeData((prev) => ({
                      ...prev,
                      personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                    }))
                  }
                  className="input-glass w-full"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
            </div>
          </div>
        )

      case "role":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Job Role</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={resumeData.jobRole}
                  onChange={(e) => setResumeData((prev) => ({ ...prev, jobRole: e.target.value }))}
                  className="input-glass flex-1"
                  placeholder="e.g., Senior Software Engineer"
                />
                
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Professional Summary</label>
              <textarea
                value={resumeData.professionalSummary}
                onChange={(e) => setResumeData((prev) => ({ ...prev, professionalSummary: e.target.value }))}
                className="input-glass w-full h-32 resize-none"
                placeholder="Write a brief professional summary that highlights your key achievements and career goals..."
              />
            </div>
            <button onClick={generateAIContent} className="btn-primary flex items-center px-4">
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  Generate with AI
                </button>
          </div>
        )

      case "experience":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-foreground">Work Experience</h3>
              <button onClick={addExperience} className="btn-glass flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Experience
              </button>
            </div>
            {resumeData.experience.map((exp, index) => (
              <div key={exp.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Experience {index + 1}</h4>
                  <button onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                    className="input-glass"
                    placeholder="Company Name"
                  />
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, "position", e.target.value)}
                    className="input-glass"
                    placeholder="Job Title"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="date"
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                    className="input-glass"
                  />
                  <input
                    type="date"
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                    className="input-glass"
                    disabled={exp.current}
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => updateExperience(exp.id, "current", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-foreground">Current Role</span>
                  </label>
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, "description", e.target.value)}
                  className="input-glass w-full h-20 resize-none"
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
            ))}
          </div>
        )

      case "education":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-foreground">Education</h3>
              <button onClick={addEducation} className="btn-glass flex items-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Education
              </button>
            </div>
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Education {index + 1}</h4>
                  <button onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-700">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                    className="input-glass"
                    placeholder="Institution Name"
                  />
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                    className="input-glass"
                    placeholder="Degree Type"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={edu.field}
                    onChange={(e) => updateEducation(edu.id, "field", e.target.value)}
                    className="input-glass"
                    placeholder="Field of Study"
                  />
                  <input
                    type="date"
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                    className="input-glass"
                  />
                  <input
                    type="date"
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                    className="input-glass"
                  />
                </div>
                <input
                  type="text"
                  value={edu.gpa || ""}
                  onChange={(e) => updateEducation(edu.id, "gpa", e.target.value)}
                  className="input-glass"
                  placeholder="GPA (optional)"
                />
              </div>
            ))}
          </div>
        )

      case "skills":
        return (
          <div className="space-y-6">
            {/* Skills Section */}
            <div>
              <h3 className="text-md font-medium text-foreground mb-3">Skills</h3>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  className="input-glass flex-1"
                  placeholder="Add a skill"
                />
                <button onClick={addSkill} className="btn-glass">
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-2 text-primary/60 hover:text-primary">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>




            {/* Certifications Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-foreground">Certifications</h3>
                <button onClick={addCertification} className="btn-glass flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Certification
                </button>
              </div>
              {resumeData.certifications.map((cert, index) => (
                <div key={cert.id} className="border border-gray-200 rounded-lg p-4 space-y-3 mb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Certification {index + 1}</h4>
                    <button onClick={() => removeCertification(cert.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, "name", e.target.value)}
                      className="input-glass"
                      placeholder="Certification Name"
                    />
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(cert.id, "issuer", e.target.value)}
                      className="input-glass"
                      placeholder="Issuing Organization"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={cert.date}
                      onChange={(e) => updateCertification(cert.id, "date", e.target.value)}
                      className="input-glass"
                    />
                    <input
                      type="date"
                      value={cert.expiryDate || ""}
                      onChange={(e) => updateCertification(cert.id, "expiryDate", e.target.value)}
                      className="input-glass"
                      placeholder="Expiry Date (optional)"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-medium text-foreground">Projects</h3>
                <button onClick={addProject} className="btn-glass flex items-center">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Project
                </button>
              </div>
              {resumeData.projects.map((project, index) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 space-y-3 mb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-foreground">Project {index + 1}</h4>
                    <button onClick={() => removeProject(project.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={project.name}
                    onChange={(e) => updateProject(project.id, "name", e.target.value)}
                    className="input-glass w-full"
                    placeholder="Project Name"
                  />
                  <textarea
                    value={project.description}
                    onChange={(e) => updateProject(project.id, "description", e.target.value)}
                    className="input-glass w-full h-20 resize-none"
                    placeholder="Project description..."
                  />
                  <input
                    type="url"
                    value={project.link || ""}
                    onChange={(e) => updateProject(project.id, "link", e.target.value)}
                    className="input-glass w-full"
                    placeholder="Project URL (optional)"
                  />
                </div>
              ))}


              
            /************************************************* */





<div className="mt-4">
  <button
    onClick={analyzeSkillsGap}
    disabled={analyzing}
    className="px-4 py-2 bg-indigo-600 text-white rounded"
  >
    {analyzing ? "Analyzing..." : "Analyze Skills"}
  </button>

  {error && <p className="text-red-600 mt-2">{error}</p>}

  {skillsGapResult && (
    <div className="mt-4 p-4 border rounded bg-white shadow">
      <h3 className="font-bold">Skill Gap Analysis — {skillsGapResult.targetRole}</h3>
      <p>Overall Match: {skillsGapResult.overallMatch}%</p>
      <p>Gap: {skillsGapResult.skillsGapPercentage}%</p>

      <h4 className="mt-2 font-semibold">Matched Skills</h4>
      <ul className="list-disc ml-5">
        {skillsGapResult.matchedSkills?.map((s: string, i: number) => <li key={i}>{s}</li>)}
      </ul>

      <h4 className="mt-2 font-semibold">Missing Skills</h4>
      <ul className="list-disc ml-5">
        {skillsGapResult.missingSkills?.map((s: string, i: number) => <li key={i}>{s}</li>)}
      </ul>

      <h4 className="mt-2 font-semibold">Suggested Milestones</h4>
      <ol className="list-decimal ml-5">
        {skillsGapResult.milestones?.map((m: any, idx: number) => (
          <li key={idx}>
            <span className="font-medium">Week {m.week}: {m.title}</span> — {m.description}
          </li>
        ))}
      </ol>
    </div>
  )}
</div>




              /****************************************************** */
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderLivePreview = () => {
    const selectedTemplateData = templates.find((t) => t.id === selectedTemplate)

    if (!selectedTemplateData) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Select a template to see preview</p>
        </div>
      )
    }

    const TemplateComponent = selectedTemplateData.component

    return (
      <div id="resume-content">
        <TemplateComponent data={resumeData} templateId={selectedTemplate!} />
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <AnimatePresence mode="wait">
          {currentStep === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-8"
            >
              {renderMethodSelection()}
            </motion.div>
          )}
          {currentStep === "template" && (
            <motion.div
              key="template"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-8"
            >
              {renderTemplateSelection()}
            </motion.div>
          )}
          {currentStep === "editor" && (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-8"
            >
              {renderEditor()}
            </motion.div>
          )}
          {currentStep === "ai-wizard" && (
            <motion.div
              key="ai-wizard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="container mx-auto px-4 py-8"
            >
              {renderAIWizard()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
