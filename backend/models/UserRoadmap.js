// backend/models/UserRoadmap.js (new file for persistent roadmaps)
const mongoose = require('mongoose');

const userRoadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true }, // e.g., "Prompt Engineer Roadmap"
  role: { type: String, required: true },
  gap: { type: Object, required: true }, // Stored gap analysis
  growth: { type: Object, required: true }, // Stored growth plans
  progress: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    streak: { type: Number, default: 0 },
    milestonesCompleted: [{ skill: String, milestoneId: Number }],
    skillsCompleted: [{ type: String }],
    lastActivity: { type: Date, default: Date.now },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserRoadmap', userRoadmapSchema);