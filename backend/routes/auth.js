const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { protect } = require("../middleware/auth")
const { validateRegister, validateLogin } = require("../middleware/validation")

const router = express.Router()

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post("/register", validateRegister, async (req, res) => {
  try {
    const { name, email, password } = req.body

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      })
    }

    // Hash password
    const salt = await bcrypt.genSalt(12)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
})

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body

    const normalizedEmail = email.toLowerCase().trim()
    console.log("[v0] Login attempt for email:", normalizedEmail)

    // Check for user
    const user = await User.findOne({ email: normalizedEmail }).select("+password")
    if (!user) {
      console.log("[v0] User not found for email:", normalizedEmail)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    console.log("[v0] User found, checking password...")

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      console.log("[v0] Password mismatch for user:", normalizedEmail)
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    console.log("[v0] Login successful for user:", normalizedEmail)

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
})

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res) => {
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
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @desc    Logout user / clear token
// @route   POST /api/auth/logout
// @access  Private
router.post("/logout", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  })
})

module.exports = router
