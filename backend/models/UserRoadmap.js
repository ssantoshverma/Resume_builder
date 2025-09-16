const mongoose = require('mongoose');

const userRoadmapSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  role: { type: String, required: true },
  gap: { type: Object, required: true },
  growth: { type: Object, required: true },
  progress: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    streak: { type: Number, default: 0 },
    milestonesCompleted: [{ skill: String, milestoneId: Number }],
    skillsCompleted: [{ type: String }],
    quizzes: [{ // New field for stored quizzes
      skill: String,
      milestoneId: Number,
      questions: [{
        question: String,
        options: [String],
        answer: String
      }]
    }]
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserRoadmap', userRoadmapSchema);