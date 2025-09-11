const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },
    profilePhoto: {
      type: String, // will store the filename or URL
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[1-9][\d]{0,15}$/, "Please add a valid phone number"],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot be more than 100 characters"],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
        "Please add a valid website URL",
      ],
    },
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/, "Please add a valid LinkedIn profile URL"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    skills: [
      {
        type: String,
        trim: true,
        maxlength: [50, "Skill name cannot be more than 50 characters"],
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // add fields in User model
badges: [{ name: String, earnedAt: Date }],
streak: { days: Number, lastActivity: Date },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        marketing: {
          type: Boolean,
          default: false,
        },
      },
      privacy: {
        profilePublic: {
          type: Boolean,
          default: false,
        },
        showEmail: {
          type: Boolean,
          default: false,
        },
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

// Virtual for user's full profile completion percentage
userSchema.virtual("profileCompletion").get(function () {
  let completion = 0
  const fields = ["name", "email", "phone", "location", "bio"]

  fields.forEach((field) => {
    if (this[field] && this[field].toString().trim() !== "") {
      completion += 20
    }
  })

  return Math.min(completion, 100)
})

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

// Index for better query performance
// userSchema.index({ email: 1 })
userSchema.index({ createdAt: -1 })
userSchema.index({ lastLogin: -1 })

// Pre-save middleware to handle login attempts
userSchema.pre("save", function (next) {
  // If we're modifying login attempts and it's not a new document
  if (!this.isNew && this.isModified("loginAttempts")) {
    // If login attempts exceed 5, lock account for 2 hours
    if (this.loginAttempts >= 5) {
      this.lockUntil = Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    }
  }
  next()
})

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    })
  }

  const updates = { $inc: { loginAttempts: 1 } }

  // Lock account after 5 attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }
  }

  return this.updateOne(updates)
}

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  })
}

module.exports = mongoose.model("User", userSchema)
