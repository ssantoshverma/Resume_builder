const express = require('express');
const router = express.Router();
const growthPlannerService = require('../services/growthPlannerService');
const { protect } = require('../middleware/auth'); // Use destructuring for protect

// Validate service functions are loaded
if (!growthPlannerService.analyzeGrowth || typeof growthPlannerService.analyzeGrowth !== 'function') {
  console.error('Error: analyzeGrowth is not a function. Check growthPlannerService.js');
  process.exit(1); // Exit if invalid
}

// Existing routes (standardized names)
router.post('/analyze', protect, growthPlannerService.analyzeGrowth);
router.post('/update-progress', protect, growthPlannerService.updateProgress);
router.post('/generate-quiz', protect, growthPlannerService.generateQuiz);
router.post('/save-roadmap', protect, growthPlannerService.saveRoadmap);
router.get('/user-roadmaps', protect, growthPlannerService.getUserRoadmaps);
router.get('/roadmaps/:id', protect, growthPlannerService.getRoadmapById);
router.delete('/roadmaps/:id', protect, growthPlannerService.deleteRoadmap);

module.exports = router;