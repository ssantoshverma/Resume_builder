const express = require("express")
const Resume = require("../models/Resume")
const { protect } = require("../middleware/auth")
const { validateResume } = require("../middleware/validation")

const router = express.Router()

// @desc    Get all user's resumes
// @route   GET /api/resumes
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const resumes = await Resume.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-data") // Exclude full resume data for list view

    const total = await Resume.countDocuments({ user: req.user.id })

    res.status(200).json({
      success: true,
      count: resumes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      resumes,
    })
  } catch (error) {
    console.error("Get resumes error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      })
    }

    res.status(200).json({
      success: true,
      resume,
    })
  } catch (error) {
    console.error("Get resume error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
router.post("/", protect, validateResume, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      user: req.user.id,
    }

    const resume = await Resume.create(resumeData)

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      resume,
    })
  } catch (error) {
    console.error("Create resume error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
router.put("/:id", protect, validateResume, async (req, res) => {
  try {
    let resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      })
    }

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      resume,
    })
  } catch (error) {
    console.error("Update resume error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      })
    }

    await Resume.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    })
  } catch (error) {
    console.error("Delete resume error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Duplicate resume
// @route   POST /api/resumes/:id/duplicate
// @access  Private
router.post("/:id/duplicate", protect, async (req, res) => {
  try {
    const originalResume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id,
    })

    if (!originalResume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      })
    }

    // Create duplicate
    const duplicateData = {
      ...originalResume.toObject(),
      title: `${originalResume.title} (Copy)`,
      user: req.user.id,
    }
    delete duplicateData._id
    delete duplicateData.createdAt
    delete duplicateData.updatedAt

    const duplicateResume = await Resume.create(duplicateData)

    res.status(201).json({
      success: true,
      message: "Resume duplicated successfully",
      resume: duplicateResume,
    })
  } catch (error) {
    console.error("Duplicate resume error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

module.exports = router
