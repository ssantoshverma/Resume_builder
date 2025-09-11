const mongoose = require("mongoose")

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Template name is required"],
      unique: true,
      trim: true,
      maxlength: [100, "Template name cannot exceed 100 characters"],
    },
    templateId: {
      type: String,
      required: [true, "Template ID is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, "Template ID can only contain lowercase letters, numbers, and hyphens"],
    },
    description: {
      type: String,
      required: [true, "Template description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Template category is required"],
      enum: ["professional", "creative", "academic", "technical", "executive"],
      default: "professional",
    },
    industry: [
      {
        type: String,
        enum: ["technology", "healthcare", "finance", "education", "marketing", "design", "sales", "general"],
        default: "general",
      },
    ],
    colorScheme: {
      primary: {
        type: String,
        required: true,
        match: [/^#[0-9A-F]{6}$/i, "Primary color must be a valid hex color"],
      },
      secondary: {
        type: String,
        match: [/^#[0-9A-F]{6}$/i, "Secondary color must be a valid hex color"],
      },
      accent: {
        type: String,
        match: [/^#[0-9A-F]{6}$/i, "Accent color must be a valid hex color"],
      },
      text: {
        type: String,
        default: "#000000",
        match: [/^#[0-9A-F]{6}$/i, "Text color must be a valid hex color"],
      },
      background: {
        type: String,
        default: "#FFFFFF",
        match: [/^#[0-9A-F]{6}$/i, "Background color must be a valid hex color"],
      },
    },
    layout: {
      type: {
        type: String,
        enum: ["single-column", "two-column", "sidebar", "modern-grid"],
        default: "single-column",
      },
      headerStyle: {
        type: String,
        enum: ["centered", "left-aligned", "banner", "minimal"],
        default: "centered",
      },
      sectionSpacing: {
        type: String,
        enum: ["compact", "normal", "spacious"],
        default: "normal",
      },
    },
    typography: {
      headingFont: {
        type: String,
        default: "Arial, sans-serif",
      },
      bodyFont: {
        type: String,
        default: "Arial, sans-serif",
      },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
    },
    features: {
      hasPhoto: {
        type: Boolean,
        default: false,
      },
      hasSkillBars: {
        type: Boolean,
        default: false,
      },
      hasIcons: {
        type: Boolean,
        default: true,
      },
      hasColorAccents: {
        type: Boolean,
        default: true,
      },
      supportsSections: [
        {
          type: String,
          enum: [
            "personalInfo",
            "summary",
            "experience",
            "education",
            "skills",
            "certifications",
            "projects",
            "languages",
            "references",
            "hobbies",
            "awards",
            "publications",
          ],
        },
      ],
    },
    previewImage: {
      type: String,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i, "Preview image must be a valid image URL"],
    },
    thumbnailImage: {
      type: String,
      match: [/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i, "Thumbnail image must be a valid image URL"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [30, "Tag cannot exceed 30 characters"],
      },
    ],
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    version: {
      type: String,
      default: "1.0.0",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Indexes
templateSchema.index({ templateId: 1 })
templateSchema.index({ category: 1, isActive: 1 })
templateSchema.index({ isPremium: 1, isActive: 1 })
templateSchema.index({ "rating.average": -1 })
templateSchema.index({ usageCount: -1 })
templateSchema.index({ tags: 1 })

// Virtual for popularity score (combination of usage and rating)
templateSchema.virtual("popularityScore").get(function () {
  const usageWeight = 0.7
  const ratingWeight = 0.3

  // Normalize usage count (assuming max usage of 1000)
  const normalizedUsage = Math.min(this.usageCount / 1000, 1)

  // Normalize rating (0-5 scale to 0-1)
  const normalizedRating = this.rating.average / 5

  return normalizedUsage * usageWeight + normalizedRating * ratingWeight
})

// Static method to get popular templates
templateSchema.statics.getPopularTemplates = function (limit = 10) {
  return this.find({ isActive: true }).sort({ usageCount: -1, "rating.average": -1 }).limit(limit)
}

// Static method to get templates by category
templateSchema.statics.getByCategory = function (category, limit = 20) {
  return this.find({ category, isActive: true }).sort({ "rating.average": -1, usageCount: -1 }).limit(limit)
}

// Instance method to increment usage count
templateSchema.methods.incrementUsage = function () {
  this.usageCount += 1
  return this.save()
}

// Instance method to update rating
templateSchema.methods.updateRating = function (newRating) {
  const totalRating = this.rating.average * this.rating.count + newRating
  this.rating.count += 1
  this.rating.average = totalRating / this.rating.count
  return this.save()
}

module.exports = mongoose.model("Template", templateSchema)
