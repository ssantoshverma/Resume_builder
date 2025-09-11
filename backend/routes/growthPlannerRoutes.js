const express = require('express');
const { analyzeGrowth, updateProgress, generateQuiz, saveRoadmap, getUserRoadmaps, getRoadmapById } = require('../services/growthPlannerService');

const router = express.Router();

router.post('/analyze', analyzeGrowth);
router.post('/update-progress', updateProgress);
router.post('/generate-quiz', generateQuiz);
router.post('/save-roadmap', saveRoadmap);
router.get('/user-roadmaps', getUserRoadmaps);
router.get('/roadmaps/:id', getRoadmapById); // New endpoint for roadmap details

module.exports = router;