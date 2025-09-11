const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
// Add after other route imports
const careerInsightsRoutes = require("./routes/careerInsights")
const coldEmailRoutes = require("./routes/coldEmail")
require("dotenv").config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const resumeRoutes = require("./routes/resumes")
const aiRoutes = require("./routes/aiRoutes")
const ai = require("./routes/ai")
const skillGapHFRoutes = require("./routes/skillGapHF")
// const growthRoutes = require("./routes/growthRoutes")
const growthPlannerRoutes = require("./routes/growthPlannerRoutes")
const { protect } = require("./middleware/auth")




const app = express()

// Security middleware
app.use(helmet())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
})
app.use(limiter)

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Logging middleware
app.use(morgan("combined"))

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB")
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/resumes", resumeRoutes)
app.use("/uploads", express.static("uploads"));
app.use("/api/ai",ai);
app.use("/api/career-insights", skillGapHFRoutes);
app.use("/api/cold-email", coldEmailRoutes);
// app.use("/api/growth-planner", growthRoutes);
app.use("/api/growth-planner",protect, growthPlannerRoutes);


// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Resume Builder API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  })
})



// Add after other route uses
app.use("/api/career-insights", careerInsightsRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  })
})


// Global error handler
app.use((error, req, res, next) => {
  console.error("Error:", error)

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(error.errors).map((err) => err.message),
    })
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
    })
  }

  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    })
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
