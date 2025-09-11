const { body, validationResult } = require("express-validator")

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User registration validation
const validateRegister = [
  body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  validate,
]

// User login validation
const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
]

// Profile update validation
const validateProfileUpdate = [
  body("name").optional().trim().isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
  body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  validate,
]

// Resume validation
const validateResume = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Resume title is required and must be less than 100 characters"),
  body("templateId").isIn(["modern", "classic", "creative", "minimal"]).withMessage("Invalid template ID"),
  body("personalInfo.fullName").trim().isLength({ min: 1, max: 100 }).withMessage("Full name is required"),
  body("personalInfo.email").isEmail().withMessage("Valid email is required"),
  validate,
]

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateResume,
}
