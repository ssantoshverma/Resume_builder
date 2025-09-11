// backend/models/RoleRequirement.js
const mongoose = require('mongoose');
const RoleRequirementSchema = new mongoose.Schema({
  role: { type: String, required: true, unique: true, index: true },
  normalizedRole: { type: String, index: true }, // lowercased normalized name
  requiredSkills: [
    {
      name: { type: String, required: true },
      importance: { type: String, enum: ['critical','important','nice-to-have'], default: 'important' },
      synonyms: [String],
    }
  ],
  lastUpdatedAt: { type: Date, default: Date.now },
  source: { type: String } // 'db' or 'llm'
});
module.exports = mongoose.model('RoleRequirement', RoleRequirementSchema);
