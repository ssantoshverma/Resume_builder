const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const OpenAI = require("openai");

// Initialize OpenAI client but point it to Hugging Face router
const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN, // Hugging Face token
});

// Improved JSON parser
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting the largest {...} block
    const matches = text.match(/\{[\s\S]*\}/g);
    if (matches && matches.length > 0) {
      for (let m of matches) {
        try {
          return JSON.parse(m);
        } catch {
          continue;
        }
      }
    }
    console.error("Could not parse JSON from:", text);
    return {
      error: "Invalid JSON",
      rawText: text,
    };
  }
}


// POST /api/career-insights/analyze-gap-hf
router.post("/analyze-gap-hf", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills, targetRole } = req.body;

    if (!skills || !Array.isArray(skills) || !skills.length) {
      return res.status(400).json({ success: false, message: "Skills are required" });
    }
    if (!targetRole) {
      return res.status(400).json({ success: false, message: "Target role is required" });
    }

    // Get user profile skills from MongoDB
    const user = await User.findById(userId).lean();
    const profileSkills = user?.skills || [];
    const combinedSkills = [...new Set([...skills, ...profileSkills])];

const prompt = `
You are a JSON-only career assistant.

Compare the user's skills with the required skills for the target role.
Return ONLY a single valid JSON object with the keys:

{
  "targetRole": string,
  "matchedSkills": string[],
  "missingSkills": string[],
  "overallMatch": number,
  "skillsGapPercentage": number,
  "milestones": [
    { "week": number, "title": string, "description": string }
  ]
}

Do not add explanations, markdown, or extra text.
If you run out of tokens, close the JSON properly with brackets.
User skills: ${JSON.stringify(combinedSkills)}
Target role: ${targetRole}
`;
    // Call Hugging Face GPT-OSS model via OpenAI-compatible API
    const completion = await client.chat.completions.create({
      model: process.env.HF_MODEL || "openai/gpt-oss-20b:together",
      messages: [
        { role: "system", content: "You are a JSON-only AI assistant. Respond with strict JSON, no explanations." },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const outputText = completion.choices[0].message.content;
    console.log("HF raw response:", outputText);

    const parsed = safeJsonParse(outputText);

    return res.json({ success: true, data: parsed });
  } catch (err) {
    console.error("Skill gap HF error:", err);
    res.status(500).json({ success: false, message: "Server error analyzing skill gap" });
  }
});

module.exports = router;
