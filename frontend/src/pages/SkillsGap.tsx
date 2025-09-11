import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import { useNavigate } from "react-router-dom"
import AppLayout from "../layouts/AppLayout"
import SkillTag from "../components/SkillTag"
import { careerInsightsService, SkillsGapAnalysis } from "../services/careerInsightsService"

const popularRoles = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
  "UX Designer",
  "Mobile Developer",
  "Machine Learning Engineer",
  "Cloud Architect"
]

export default function SkillsGap() {
  const navigate = useNavigate()
  const [targetRole, setTargetRole] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [skillsGapData, setSkillsGapData] = useState<SkillsGapAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Load existing analysis on component mount
  useEffect(() => {
    loadExistingAnalysis()
  }, [])

  const loadExistingAnalysis = async () => {
    try {
      const response = await careerInsightsService.getSkillsGap()
      if (response.success && response.data) {
        setSkillsGapData(response.data)
        setTargetRole(response.data.targetRole)
      }
    } catch (error) {
      // No existing analysis, which is fine
      console.log("No existing analysis found")
    }
  }

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      setError("Please enter a target role")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await careerInsightsService.analyzeSkillsGap(targetRole.trim())
      
      if (response.success && response.data) {
        setSkillsGapData(response.data)
      } else {
        setError(response.message || "Failed to analyze skills gap")
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateGrowthPath = async () => {
    if (!skillsGapData) return

    try {
      const response = await careerInsightsService.generateGrowthPath(skillsGapData.id)
      
      if (response.success) {
        navigate("/career-insights/growth-path")
      } else {
        setError(response.message || "Failed to generate growth path")
      }
    } catch (error) {
      setError("Failed to generate growth path")
    }
  }

  const filteredSuggestions = popularRoles.filter(role =>
    role.toLowerCase().includes(targetRole.toLowerCase()) && role.toLowerCase() !== targetRole.toLowerCase()
  )

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-primary rounded-xl shadow-glow mr-4">
              <MagnifyingGlassIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Skills Gap Analysis</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover which skills you already have and what you need to learn for your dream role
          </p>
        </motion.div>

        {/* Analysis Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel"
        >
          <div className="flex items-center space-x-4 mb-4">
            <SparklesIcon className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Target Role Analysis</h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value)
                  setShowSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowSuggestions(targetRole.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Enter your target role (e.g., Frontend Developer, Data Scientist)"
                className="input-glass w-full pr-32"
                disabled={isAnalyzing}
              />
              
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !targetRole.trim()}
                className="absolute right-2 top-2 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Analyze Skills"
                )}
              </button>

              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto"
                  >
                    {filteredSuggestions.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setTargetRole(role)
                          setShowSuggestions(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-muted transition-colors text-foreground"
                      >
                        {role}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Popular Roles */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Popular roles:</p>
              <div className="flex flex-wrap gap-2">
                {popularRoles.slice(0, 5).map((role) => (
                  <button
                    key={role}
                    onClick={() => setTargetRole(role)}
                    className="text-xs bg-muted hover:bg-muted-dark text-muted-foreground hover:text-foreground px-3 py-1 rounded-full transition-colors"
                    disabled={isAnalyzing}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center space-x-2"
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Analysis Results */}
        <AnimatePresence>
          {skillsGapData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="glass-panel text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <ChartBarIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {skillsGapData.overallMatch}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Match</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-panel text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircleIcon className="h-8 w-8 text-success" />
                  </div>
                  <div className="text-3xl font-bold text-success mb-1">
                    {skillsGapData.matchedSkills.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Matched Skills</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="glass-panel text-center"
                >
                  <div className="flex items-center justify-center mb-2">
                    <ExclamationTriangleIcon className="h-8 w-8 text-warning" />
                  </div>
                  <div className="text-3xl font-bold text-warning mb-1">
                    {skillsGapData.missingSkills.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Skills to Learn</div>
                </motion.div>
              </div>

              {/* Matched Skills */}
              {skillsGapData.matchedSkills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-panel"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <CheckCircleIcon className="h-6 w-6 text-success" />
                    <h3 className="text-xl font-semibold text-foreground">
                      Skills You Already Have ({skillsGapData.matchedSkills.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillsGapData.matchedSkills.map((skill, index) => (
                      <SkillTag key={skill.name} skill={skill} type="matched" index={index} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Missing Skills */}
              {skillsGapData.missingSkills.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass-panel"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-warning" />
                      <h3 className="text-xl font-semibold text-foreground">
                        Skills to Learn ({skillsGapData.missingSkills.length})
                      </h3>
                    </div>
                    
                    <button
                      onClick={handleGenerateGrowthPath}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <SparklesIcon className="h-5 w-5" />
                      <span>Generate Growth Path</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillsGapData.missingSkills.map((skill, index) => (
                      <SkillTag key={skill.name} skill={skill} type="missing" index={index} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Analysis Date */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center text-sm text-muted-foreground flex items-center justify-center space-x-2"
              >
                <ClockIcon className="h-4 w-4" />
                <span>
                  Analysis completed on {new Date(skillsGapData.analysisDate).toLocaleDateString()}
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!skillsGapData && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <UserGroupIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Analyze Your Skills?</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Enter your target role above to discover which skills you already have and what you need to learn.
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  )
}