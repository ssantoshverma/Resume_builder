// const mongoose = require("mongoose")

// const skillsGapSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.ObjectId,
//       ref: "User",
//       required: [true, "Skills gap analysis must belong to a user"],
//     },
//     targetRole: {
//       type: String,
//       required: [true, "Target role is required"],
//       trim: true,
//       maxlength: [100, "Target role cannot exceed 100 characters"],
//     },
//     matchedSkills: [
//       {
//         name: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         category: {
//           type: String,
//           enum: ["technical", "soft", "certification", "tool"],
//           default: "technical",
//         },
//         proficiencyLevel: {
//           type: String,
//           enum: ["beginner", "intermediate", "advanced", "expert"],
//           default: "intermediate",
//         },
//       },
//     ],
//     missingSkills: [
//       {
//         name: {
//           type: String,
//           required: true,
//           trim: true,
//         },
//         category: {
//           type: String,
//           enum: ["technical", "soft", "certification", "tool"],
//           default: "technical",
//         },
//         importance: {
//           type: String,
//           enum: ["critical", "important", "nice-to-have"],
//           default: "important",
//         },
//         estimatedLearningTime: {
//           type: String,
//           default: "4-6 weeks",
//         },
//       },
//     ],
//     roleRequirements: [
//       {
//         name: {
//           type: String,
//           required: true,
//         },
//         category: String,
//         required: {
//           type: Boolean,
//           default: true,
//         },
//         description: String,
//       },
//     ],
//     overallMatch: {
//       type: Number,
//       min: 0,
//       max: 100,
//       default: 0,
//     },
//     analysisDate: {
//       type: Date,
//       default: Date.now,
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true },
//   }
// )

// // Indexes for better performance
// skillsGapSchema.index({ user: 1, createdAt: -1 })
// skillsGapSchema.index({ targetRole: 1 })
// skillsGapSchema.index({ isActive: 1 })

// // Virtual for skills gap percentage
// skillsGapSchema.virtual("skillsGapPercentage").get(function () {
//   const totalSkills = this.matchedSkills.length + this.missingSkills.length
//   if (totalSkills === 0) return 0
//   return Math.round((this.missingSkills.length / totalSkills) * 100)
// })

// // Static method to create skills gap analysis
// skillsGapSchema.statics.createAnalysis = function (userId, analysisData) {
//   return this.create({
//     user: userId,
//     ...analysisData,
//   })
// }

// // Static method to get user's latest analysis
// skillsGapSchema.statics.getLatestAnalysis = function (userId) {
//   return this.findOne({ user: userId, isActive: true })
//     .sort({ createdAt: -1 })
//     .populate("user", "name email skills")
// }

// module.exports = mongoose.model("SkillsGap", skillsGapSchema)


// backend/models/SkillsGap.js
const mongoose = require('mongoose');
const SkillsGapSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  matchedSkills: [{ name: String, importance: String }],
  missingSkills: [{ name: String, importance: String }],
  matchPercentage: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('SkillsGap', SkillsGapSchema);
