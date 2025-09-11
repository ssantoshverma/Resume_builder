const mongoose = require("mongoose")

// Personal Information Schema
const personalInfoSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please add a valid phone number"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.+/, "Please add a valid website URL"],
    },
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/, "Please add a valid LinkedIn URL"],
    },
  },
  { _id: false },
)

// Work Experience Schema
const experienceSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, "Company name is required"],
    trim: true,
    maxlength: [100, "Company name cannot exceed 100 characters"],
  },
  position: {
    type: String,
    required: [true, "Position is required"],
    trim: true,
    maxlength: [100, "Position cannot exceed 100 characters"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        // If current is true, endDate should not be required
        if (this.current) return true
        // If not current, endDate should be provided and after startDate
        return value && value >= this.startDate
      },
      message: "End date must be after start date",
    },
  },
  current: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, "Location cannot exceed 100 characters"],
  },
  achievements: [
    {
      type: String,
      trim: true,
      maxlength: [200, "Achievement cannot exceed 200 characters"],
    },
  ],
})

// Education Schema
const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, "Institution name is required"],
    trim: true,
    maxlength: [100, "Institution name cannot exceed 100 characters"],
  },
  degree: {
    type: String,
    required: [true, "Degree is required"],
    trim: true,
    maxlength: [100, "Degree cannot exceed 100 characters"],
  },
  field: {
    type: String,
    trim: true,
    maxlength: [100, "Field of study cannot exceed 100 characters"],
  },
  startDate: {
    type: Date,
    required: [true, "Start date is required"],
  },
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value >= this.startDate
      },
      message: "End date must be after start date",
    },
  },
  gpa: {
    type: String,
    trim: true,
    maxlength: [10, "GPA cannot exceed 10 characters"],
  },
  honors: [
    {
      type: String,
      trim: true,
      maxlength: [100, "Honor cannot exceed 100 characters"],
    },
  ],
  location: {
    type: String,
    trim: true,
    maxlength: [100, "Location cannot exceed 100 characters"],
  },
})

// Certification Schema
const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Certification name is required"],
    trim: true,
    maxlength: [100, "Certification name cannot exceed 100 characters"],
  },
  issuer: {
    type: String,
    required: [true, "Issuer is required"],
    trim: true,
    maxlength: [100, "Issuer cannot exceed 100 characters"],
  },
  date: {
    type: Date,
    required: [true, "Issue date is required"],
  },
  expiryDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !value || value >= this.date
      },
      message: "Expiry date must be after issue date",
    },
  },
  credentialId: {
    type: String,
    trim: true,
    maxlength: [100, "Credential ID cannot exceed 100 characters"],
  },
  credentialUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, "Please add a valid credential URL"],
  },
})

// Project Schema
const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Project name is required"],
    trim: true,
    maxlength: [100, "Project name cannot exceed 100 characters"],
  },
  description: {
    type: String,
    required: [true, "Project description is required"],
    trim: true,
    maxlength: [1000, "Description cannot exceed 1000 characters"],
  },
  technologies: [
    {
      type: String,
      trim: true,
      maxlength: [50, "Technology name cannot exceed 50 characters"],
    },
  ],
  link: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, "Please add a valid project URL"],
  },
  githubUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/.+/, "Please add a valid GitHub URL"],
  },
  startDate: Date,
  endDate: {
    type: Date,
    validate: {
      validator: function (value) {
        return !this.startDate || !value || value >= this.startDate
      },
      message: "End date must be after start date",
    },
  },
  status: {
    type: String,
    enum: ["completed", "in-progress", "planned"],
    default: "completed",
  },
})

// Main Resume Schema
const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Resume must belong to a user"],
    },
    title: {
      type: String,
      required: [true, "Resume title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    templateId: {
      type: String,
      required: [true, "Template ID is required"],
      enum: ["modern", "classic", "creative", "minimal"],
      default: "modern",
    },
    personalInfo: {
      type: personalInfoSchema,
      required: [true, "Personal information is required"],
    },
    professionalSummary: {
      type: String,
      trim: true,
      maxlength: [1000, "Professional summary cannot exceed 1000 characters"],
    },
    jobRole: {
      type: String,
      trim: true,
      maxlength: [100, "Job role cannot exceed 100 characters"],
    },
    skills: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Skill name cannot exceed 50 characters"],
      },
    ],
    experience: [experienceSchema],
    education: [educationSchema],
    certifications: [certificationSchema],
    projects: [projectSchema],
    languages: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: [50, "Language name cannot exceed 50 characters"],
        },
        proficiency: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "native"],
          required: true,
        },
      },
    ],
    customSections: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          maxlength: [100, "Section title cannot exceed 100 characters"],
        },
        content: {
          type: String,
          required: true,
          trim: true,
          maxlength: [2000, "Section content cannot exceed 2000 characters"],
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    publicUrl: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple null values
      match: [/^[a-zA-Z0-9-_]+$/, "Public URL can only contain letters, numbers, hyphens, and underscores"],
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: Date,
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    version: {
      type: Number,
      default: 1,
    },
    parentResume: {
      type: mongoose.Schema.ObjectId,
      ref: "Resume",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes for better query performance
resumeSchema.index({ user: 1, createdAt: -1 })
resumeSchema.index({ user: 1, status: 1 })
// resumeSchema.index({ publicUrl: 1 })
resumeSchema.index({ tags: 1 })
resumeSchema.index({ templateId: 1 })

// Virtual for resume completion percentage
resumeSchema.virtual("completionPercentage").get(function () {
  let completion = 0
  const totalSections = 7 // personalInfo, jobRole, summary, skills, experience, education, projects

  // Personal Info (required)
  if (this.personalInfo && this.personalInfo.fullName && this.personalInfo.email) {
    completion += 1
  }

  // Job Role
  if (this.jobRole && this.jobRole.trim() !== "") {
    completion += 1
  }

  // Professional Summary
  if (this.professionalSummary && this.professionalSummary.trim() !== "") {
    completion += 1
  }

  // Skills
  if (this.skills && this.skills.length > 0) {
    completion += 1
  }

  // Experience
  if (this.experience && this.experience.length > 0) {
    completion += 1
  }

  // Education
  if (this.education && this.education.length > 0) {
    completion += 1
  }

  // Projects or Certifications
  if ((this.projects && this.projects.length > 0) || (this.certifications && this.certifications.length > 0)) {
    completion += 1
  }

  return Math.round((completion / totalSections) * 100)
})

// Virtual for total work experience in months
resumeSchema.virtual("totalExperienceMonths").get(function () {
  if (!this.experience || this.experience.length === 0) return 0

  let totalMonths = 0
  this.experience.forEach((exp) => {
    const startDate = new Date(exp.startDate)
    const endDate = exp.current ? new Date() : new Date(exp.endDate)

    if (startDate && endDate) {
      const months =
        (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
      totalMonths += Math.max(0, months)
    }
  })

  return totalMonths
})

// Pre-save middleware to generate public URL if making resume public
resumeSchema.pre("save", function (next) {
  if (this.isPublic && !this.publicUrl) {
    // Generate a unique URL slug
    const slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30)

    this.publicUrl = `${slug}-${Date.now()}`
  }

  if (!this.isPublic) {
    this.publicUrl = undefined
  }

  next()
})

// Static method to find public resumes
resumeSchema.statics.findPublicResumes = function (limit = 10, skip = 0) {
  return this.find({ isPublic: true, status: "published" })
    .populate("user", "name")
    .select("-personalInfo.email -personalInfo.phone")
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
}

// Instance method to increment view count
resumeSchema.methods.incrementViewCount = function () {
  this.viewCount += 1
  this.lastViewedAt = new Date()
  return this.save()
}

// Instance method to increment download count
resumeSchema.methods.incrementDownloadCount = function () {
  this.downloadCount += 1
  return this.save()
}

module.exports = mongoose.model("Resume", resumeSchema)
