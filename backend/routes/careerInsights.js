const express = require("express")
const SkillsGap = require("../models/SkillsGap")
const GrowthPath = require("../models/GrowthPath")
const User = require("../models/User")
const mistralService = require("../services/mistralService")
const { protect } = require("../middleware/auth")
// Temporarily remove activity logging to fix the immediate issue
// const ActivityLog = require("../models/ActivityLog")

const router = express.Router()

// @desc    Analyze skills gap for target role
// @route   POST /api/career-insights/analyze-gap
// @access  Private
router.post("/analyze-gap", protect, async (req, res) => {
  try {
    const { targetRole } = req.body

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: "Target role is required"
      })
    }

    // Get user's current skills from profile
    const user = await User.findById(req.user.id)
    const userSkills = user.skills || []

    if (userSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please update your skills in your profile before analyzing skills gap"
      })
    }

    // Analyze skills gap using Mistral AI or fallback
    let analysisResult
    try {
      analysisResult = await mistralService.analyzeSkillsGap(userSkills, targetRole)
    } catch (aiError) {
      console.warn("AI analysis failed, using fallback:", aiError.message)
      analysisResult = mistralService.getFallbackSkillsAnalysis(userSkills, targetRole)
    }

    // Deactivate previous analyses
    await SkillsGap.updateMany(
      { user: req.user.id },
      { isActive: false }
    )

    // Save analysis to database
    const skillsGap = await SkillsGap.createAnalysis(req.user.id, analysisResult)

    // TODO: Add activity logging back after fixing ActivityLog model
    // await ActivityLog.logActivity({
    //   user: req.user.id,
    //   action: "skills_gap_analysis",
    //   resource: "career_insights",
    //   resourceId: skillsGap._id,
    //   details: {
    //     targetRole,
    //     matchedSkillsCount: analysisResult.matchedSkills.length,
    //     missingSkillsCount: analysisResult.missingSkills.length,
    //     overallMatch: analysisResult.overallMatch
    //   },
    //   ipAddress: req.ip,
    //   userAgent: req.get("User-Agent")
    // })

    res.status(200).json({
      success: true,
      message: "Skills gap analysis completed successfully",
      data: {
        id: skillsGap._id,
        targetRole: skillsGap.targetRole,
        matchedSkills: skillsGap.matchedSkills,
        missingSkills: skillsGap.missingSkills,
        roleRequirements: skillsGap.roleRequirements,
        overallMatch: skillsGap.overallMatch,
        skillsGapPercentage: skillsGap.skillsGapPercentage,
        analysisDate: skillsGap.analysisDate
      }
    })

  } catch (error) {
    console.error("Skills gap analysis error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to analyze skills gap"
    })
  }
})

// @desc    Get latest skills gap analysis
// @route   GET /api/career-insights/skills-gap
// @access  Private
router.get("/skills-gap", protect, async (req, res) => {
  try {
    const skillsGap = await SkillsGap.getLatestAnalysis(req.user.id)

    if (!skillsGap) {
      return res.status(404).json({
        success: false,
        message: "No skills gap analysis found. Please create one first."
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: skillsGap._id,
        targetRole: skillsGap.targetRole,
        matchedSkills: skillsGap.matchedSkills,
        missingSkills: skillsGap.missingSkills,
        roleRequirements: skillsGap.roleRequirements,
        overallMatch: skillsGap.overallMatch,
        skillsGapPercentage: skillsGap.skillsGapPercentage,
        analysisDate: skillsGap.analysisDate
      }
    })

  } catch (error) {
    console.error("Get skills gap error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve skills gap analysis"
    })
  }
})

// @desc    Generate growth path for missing skills
// @route   POST /api/career-insights/generate-growth-path
// @access  Private
router.post("/generate-growth-path", protect, async (req, res) => {
  try {
    const { skillsGapId } = req.body

    if (!skillsGapId) {
      return res.status(400).json({
        success: false,
        message: "Skills gap analysis ID is required"
      })
    }

    // Get skills gap analysis
    const skillsGap = await SkillsGap.findById(skillsGapId)
    
    if (!skillsGap || skillsGap.user.toString() !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: "Skills gap analysis not found"
      })
    }

    if (skillsGap.missingSkills.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No missing skills found to create growth path"
      })
    }

    // Generate growth path using Mistral AI or fallback
    let growthPathData
    try {
      growthPathData = await mistralService.generateGrowthPath(
        skillsGap.missingSkills,
        skillsGap.targetRole,
        "intermediate" // Default user experience level
      )
    } catch (aiError) {
      console.warn("AI growth path generation failed, using fallback:", aiError.message)
      growthPathData = generateFallbackGrowthPath(skillsGap.missingSkills, skillsGap.targetRole)
    }

    // Deactivate previous growth paths
    await GrowthPath.updateMany(
      { user: req.user.id },
      { isActive: false }
    )

    // Save growth path to database
    const growthPath = await GrowthPath.createGrowthPath(
      req.user.id,
      skillsGapId,
      growthPathData
    )

    // TODO: Add activity logging back after fixing ActivityLog model
    // await ActivityLog.logActivity({
    //   user: req.user.id,
    //   action: "growth_path_generate",
    //   resource: "career_insights",
    //   resourceId: growthPath._id,
    //   details: {
    //     targetRole: skillsGap.targetRole,
    //     skillsCount: skillsGap.missingSkills.length,
    //     estimatedCompletionTime: growthPathData.estimatedCompletionTime
    //   },
    //   ipAddress: req.ip,
    //   userAgent: req.get("User-Agent")
    // })

    res.status(201).json({
      success: true,
      message: "Growth path generated successfully",
      data: {
        id: growthPath._id,
        targetRole: growthPath.targetRole,
        skillPlans: growthPath.skillPlans,
        overallProgress: growthPath.overallProgress,
        estimatedCompletionTime: growthPath.estimatedCompletionTime,
        completedSkillsCount: growthPath.completedSkillsCount,
        inProgressSkillsCount: growthPath.inProgressSkillsCount
      }
    })

  } catch (error) {
    console.error("Growth path generation error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate growth path"
    })
  }
})

// @desc    Get active growth path
// @route   GET /api/career-insights/growth-path
// @access  Private
router.get("/growth-path", protect, async (req, res) => {
  try {
    const growthPath = await GrowthPath.getActiveGrowthPath(req.user.id)

    if (!growthPath) {
      return res.status(404).json({
        success: false,
        message: "No active growth path found. Please generate one first."
      })
    }

    res.status(200).json({
      success: true,
      data: {
        id: growthPath._id,
        targetRole: growthPath.targetRole,
        skillPlans: growthPath.skillPlans,
        overallProgress: growthPath.overallProgress,
        estimatedCompletionTime: growthPath.estimatedCompletionTime,
        completedSkillsCount: growthPath.completedSkillsCount,
        inProgressSkillsCount: growthPath.inProgressSkillsCount,
        notes: growthPath.notes
      }
    })

  } catch (error) {
    console.error("Get growth path error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve growth path"
    })
  }
})

// @desc    Update milestone completion
// @route   PUT /api/career-insights/growth-path/milestone
// @access  Private
router.put("/growth-path/milestone", protect, async (req, res) => {
  try {
    const { skillIndex, milestoneIndex, completed = true } = req.body

    if (skillIndex === undefined || milestoneIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Skill index and milestone index are required"
      })
    }

    const growthPath = await GrowthPath.getActiveGrowthPath(req.user.id)
    
    if (!growthPath) {
      return res.status(404).json({
        success: false,
        message: "No active growth path found"
      })
    }

    // Update milestone
    await growthPath.updateMilestone(skillIndex, milestoneIndex, completed)

    // TODO: Add activity logging back after fixing ActivityLog model
    // await ActivityLog.logActivity({
    //   user: req.user.id,
    //   action: "milestone_update",
    //   resource: "career_insights",
    //   resourceId: growthPath._id,
    //   details: {
    //     skillIndex,
    //     milestoneIndex,
    //     completed,
    //     skillName: growthPath.skillPlans[skillIndex]?.skill.name
    //   },
    //   ipAddress: req.ip,
    //   userAgent: req.get("User-Agent")
    // })

    const updatedGrowthPath = await GrowthPath.getActiveGrowthPath(req.user.id)

    res.status(200).json({
      success: true,
      message: "Milestone updated successfully",
      data: {
        id: updatedGrowthPath._id,
        targetRole: updatedGrowthPath.targetRole,
        skillPlans: updatedGrowthPath.skillPlans,
        overallProgress: updatedGrowthPath.overallProgress,
        completedSkillsCount: updatedGrowthPath.completedSkillsCount,
        inProgressSkillsCount: updatedGrowthPath.inProgressSkillsCount
      }
    })

  } catch (error) {
    console.error("Update milestone error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update milestone"
    })
  }
})

// @desc    Update growth path notes
// @route   PUT /api/career-insights/growth-path/notes
// @access  Private
router.put("/growth-path/notes", protect, async (req, res) => {
  try {
    const { notes } = req.body

    const growthPath = await GrowthPath.findOneAndUpdate(
      { user: req.user.id, isActive: true },
      { notes },
      { new: true }
    )

    if (!growthPath) {
      return res.status(404).json({
        success: false,
        message: "No active growth path found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Notes updated successfully",
      data: {
        notes: growthPath.notes
      }
    })

  } catch (error) {
    console.error("Update notes error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update notes"
    })
  }
})

// Helper function for fallback growth path generation
function generateFallbackGrowthPath(missingSkills, targetRole) {
  const fallbackResources = {
    "JavaScript": [
      {
        type: "course",
        title: "JavaScript Fundamentals",
        url: "https://javascript.info/",
        description: "Comprehensive JavaScript tutorial",
        estimatedTime: "40 hours",
        difficulty: "beginner",
        free: true
      }
    ],
    "React": [
      {
        type: "course",
        title: "React Official Tutorial",
        url: "https://react.dev/learn",
        description: "Official React documentation and tutorial",
        estimatedTime: "30 hours",
        difficulty: "intermediate",
        free: true
      }
    ],
    "Node.js": [
      {
        type: "course",
        title: "Node.js Guide",
        url: "https://nodejs.org/en/learn/",
        description: "Official Node.js learning resources",
        estimatedTime: "35 hours",
        difficulty: "intermediate",
        free: true
      }
    ],
    "TypeScript": [
      {
        type: "course",
        title: "TypeScript Handbook",
        url: "https://www.typescriptlang.org/docs/",
        description: "Official TypeScript documentation",
        estimatedTime: "25 hours",
        difficulty: "intermediate",
        free: true
      }
    ],
    "Python": [
      {
        type: "course",
        title: "Python Official Tutorial",
        url: "https://docs.python.org/3/tutorial/",
        description: "Official Python tutorial",
        estimatedTime: "30 hours",
        difficulty: "beginner",
        free: true
      }
    ]
  }

  return {
    targetRole,
    estimatedCompletionTime: `${missingSkills.length * 6} weeks`,
    skillPlans: missingSkills.map(skill => ({
      skill: {
        name: skill.name,
        category: skill.category,
        priority: skill.importance === "critical" ? "high" : "medium"
      },
      estimatedDuration: skill.estimatedLearningTime || "4-6 weeks",
      resources: fallbackResources[skill.name] || [
        {
          type: "documentation",
          title: `${skill.name} Learning Resources`,
          url: `https://www.google.com/search?q=${encodeURIComponent(skill.name + " tutorial")}`,
          description: `Learn ${skill.name} fundamentals`,
          estimatedTime: "20 hours",
          difficulty: "beginner",
          free: true
        }
      ],
      milestones: [
        {
          week: 1,
          title: `${skill.name} Fundamentals`,
          description: `Learn the basics of ${skill.name}`,
          tasks: [
            "Complete basic tutorial", 
            "Practice exercises", 
            "Build simple project"
          ]
        },
        {
          week: 2,
          title: `${skill.name} Intermediate Concepts`,
          description: `Explore advanced features of ${skill.name}`,
          tasks: [
            "Advanced tutorials", 
            "Complex exercises", 
            "Real-world project"
          ]
        },
        {
          week: 3,
          title: `${skill.name} Best Practices`,
          description: `Learn industry best practices`,
          tasks: [
            "Code review", 
            "Optimization techniques", 
            "Testing"
          ]
        },
        {
          week: 4,
          title: `${skill.name} Portfolio Project`,
          description: `Create a portfolio project using ${skill.name}`,
          tasks: [
            "Project planning", 
            "Implementation", 
            "Documentation"
          ]
        }
      ]
    }))
  }
}

module.exports = router