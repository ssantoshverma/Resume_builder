const mongoose = require("mongoose")

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Activity must belong to a user"],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      enum: [
        "login",
        "logout",
        "register",
        "profile_update",
        "password_change",
        "resume_create",
        "resume_update",
        "resume_delete",
        "resume_download",
        "resume_view",
        "resume_duplicate",
        "template_use",
        "account_delete",
        // 🆕 Add new career insights actions
        "skills_gap_analysis",
        "growth_path_generate",
        "milestone_update",
      ],
    },
    resource: {
      type: String,
      enum: [
        "user", 
        "resume", 
        "template", 
        "auth",
        // 🆕 Add new resource type
        "career_insights"
      ],
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.ObjectId,
      refPath: "resourceModel",
    },
    resourceModel: {
      type: String,
      enum: ["User", "Resume", "Template", "SkillsGap", "GrowthPath"],
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      // 🔧 Fixed IP validation to handle both IPv4 and IPv6
      match: [/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^127\.0\.0\.1$/, "Invalid IP address"],
    },
    userAgent: {
      type: String,
      maxlength: [500, "User agent cannot exceed 500 characters"],
    },
    location: {
      country: String,
      city: String,
      region: String,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
      maxlength: [500, "Error message cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes for better query performance
activityLogSchema.index({ user: 1, createdAt: -1 })
activityLogSchema.index({ action: 1, createdAt: -1 })
activityLogSchema.index({ resource: 1, resourceId: 1 })
activityLogSchema.index({ createdAt: -1 })
activityLogSchema.index({ ipAddress: 1 })

// TTL index to automatically delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }) // 90 days

// Static method to log activity
activityLogSchema.statics.logActivity = function (activityData) {
  return this.create(activityData)
}

// Static method to get user activity
activityLogSchema.statics.getUserActivity = function (userId, limit = 50, skip = 0) {
  return this.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).skip(skip).populate("resourceId")
}

// Static method to get activity by action
activityLogSchema.statics.getActivityByAction = function (action, startDate, endDate, limit = 100) {
  const query = { action }

  if (startDate || endDate) {
    query.createdAt = {}
    if (startDate) query.createdAt.$gte = new Date(startDate)
    if (endDate) query.createdAt.$lte = new Date(endDate)
  }

  return this.find(query).sort({ createdAt: -1 }).limit(limit).populate("user", "name email")
}

// Static method to get activity statistics
activityLogSchema.statics.getActivityStats = function (startDate, endDate) {
  const matchStage = {}

  if (startDate || endDate) {
    matchStage.createdAt = {}
    if (startDate) matchStage.createdAt.$gte = new Date(startDate)
    if (endDate) matchStage.createdAt.$lte = new Date(endDate)
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: "$action",
        count: { $sum: 1 },
        successCount: {
          $sum: { $cond: ["$success", 1, 0] },
        },
        failureCount: {
          $sum: { $cond: ["$success", 0, 1] },
        },
      },
    },
    { $sort: { count: -1 } },
  ])
}

module.exports = mongoose.model("ActivityLog", activityLogSchema)