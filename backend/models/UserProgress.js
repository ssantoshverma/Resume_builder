// models/UserProgress.js
const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  role: { type: String, required: true },
  skillsCompleted: [{ type: String }],
  milestonesCompleted: [{ skill: String, milestoneId: Number }],
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  badges: [{ type: String }],
  streak: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserProgress', userProgressSchema);