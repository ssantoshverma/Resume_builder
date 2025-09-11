// backend/models/GrowthPath.js
const mongoose = require('mongoose');

const GrowthPathSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  skillsGap: { type: mongoose.Schema.ObjectId, ref: 'SkillsGap' },
  role: { type: String, required: true },
  plans: [
    {
      skill: String,
      priority: { type: String, enum: ['critical','important','nice-to-have'] },
      estimatedDurationWeeks: { type: Number },
      learningPathType: { type: String, enum: ['fast-track','standard','deep-dive'], default:'standard' },
      resources: [
        {
          type: { type: String, required: true },
          title: { type: String, required: true },
          url: { type: String, required: true },
          authorityScore: { type: Number, default: 0 }
        }
      ],
      milestones: [
        { 
          id: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, default: '' },
          order: { type: Number, required: true },
          completed: { type: Boolean, default: false },
          completedAt: { type: Date, default: null }
        }
      ],
      progressPercent: { type: Number, default: 0 }
    }
  ],
  overallProgress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better performance
GrowthPathSchema.index({ user: 1, createdAt: -1 });
GrowthPathSchema.index({ user: 1, role: 1 });

// Update the updatedAt field on save
GrowthPathSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('GrowthPath', GrowthPathSchema);