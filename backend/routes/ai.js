// routes/ai.js
const express = require("express");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const { askAI } = require("../services/aiService");
const { generateSummary } = require("../services/aiService");

const router = express.Router();

// @route   POST /api/ai/ask
// @desc    Ask AI with personalized profile context
// @access  Private
router.post("/ask", protect, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    // Get logged-in user profile
    const user = await User.findById(req.user.id).select(
      "name role skills bio education experience"
    );

    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    // Ask AI with profile + query
    const reply = await askAI(user, query);

    res.json({ reply });
  } catch (error) {
    console.error("AI route error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
});

// router.post("/generate-summary", protect, async (req, res) => {
//   try {
//     const { role, personalInfo, experience, skills } = req.body

//     const query = `
//    Generate a **unique, professional resume summary** in exactly 30-40 words. 
// The summary must be concise, impactful, and in paragraph form. 
// Highlight generic strengths such as adaptability, problem-solving, and teamwork. 
// Avoid filler phrases or explanations — provide only the summary text. 
// Each output should be different and catchy to impress interviewers.
//  Avoid saying "N/A". 

//     Provided details:
//     - Role: ${role || "Not specified"}
//     - Name: ${personalInfo?.fullName || "Candidate"}
//     - Location: ${personalInfo?.location || "Not specified"}
//     - Skills: ${skills?.length ? skills.join(", ") : "Not specified"}
//     - Experience: ${
//       experience?.length ? experience.map((exp) => exp.title).join(", ") : "Not specified"
//     }`

    
// console.log("AI Summary Query:", query)
//     const summary = await askAI(req.user, query)
//     console.log("AI Summary Response:", summary)
//     res.json({ success: true, summary })
//   } catch (err) {
//     console.error("AI summary error:", err)
//     res.status(500).json({ success: false, message: "AI summary failed" })
//   }
// })





/**
 * @route   POST /api/ai/generate-summary
 * @desc    Generate professional resume summary
 * @access  Private
 */
router.post("/generate-summary", protect, async (req, res) => {
  try {
    const { role, personalInfo} = req.body;

    console.log("📝 Incoming summary request:", req.body);

    const summary = await generateSummary(role, personalInfo);
    console.log("📝 Generated summary:", summary);

    res.json({ success: true, summary });
  } catch (err) {
    console.error("AI summary error:", err);
    res.status(500).json({ success: false, message: "AI summary failed" });
  }
});

module.exports = router;
