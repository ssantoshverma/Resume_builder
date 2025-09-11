const express = require("express")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const Resume = require("../models/Resume") // Import Resume model
const { protect } = require("../middleware/auth")
const { validateProfileUpdate } = require("../middleware/validation")
const multer = require("multer");

const router = express.Router()

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        website: user.website,
        linkedin: user.linkedin,
        bio: user.bio,
        skills: user.skills,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", protect, validateProfileUpdate, async (req, res) => {
  try {
    const { name, email, phone, location, website, linkedin, bio, skills } = req.body

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        })
      }
    }

    // Build update object
    const updateFields = {}
    if (name) updateFields.name = name
    if (email) updateFields.email = email
    if (phone) updateFields.phone = phone
    if (location) updateFields.location = location
    if (website) updateFields.website = website
    if (linkedin) updateFields.linkedin = linkedin
    if (bio) updateFields.bio = bio
    if (skills) {
      if (typeof skills === "string") {
        try {
          updateFields.skills = JSON.parse(skills); // parse from JSON string
        } catch {
          updateFields.skills = skills.split(",").map((s) => s.trim());
        }
      } else {
        updateFields.skills = skills;
      }
    }



    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        website: user.website,
        linkedin: user.linkedin,
        bio: user.bio,
        skills: user.skills,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide current and new password",
      })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select("+password")

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Validate new password
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Change password error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete("/account", protect, async (req, res) => {
  try {
    // Delete user's resumes first
    await Resume.deleteMany({ user: req.user.id })

    // Delete user
    await User.findByIdAndDelete(req.user.id)

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})


// configure multer for profile photo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profilePhotos/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Get logged-in user profile
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Update profile (with or without photo)
router.put("/me", protect, upload.single("profilePhoto"), async (req, res) => {
  const updateData = req.body;

  if (req.file) {
    updateData.profilePhoto = `/uploads/profilePhotos/${req.file.filename}`;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updateData, {
    new: true,
  }).select("-password");

  res.json(user);
});


module.exports = router
