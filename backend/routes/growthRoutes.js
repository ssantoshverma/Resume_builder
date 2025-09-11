const express = require("express");
const { analyzeSkillsGap } = require("../services/skillsGapService");
const { generateGrowthPath } = require("../services/growthPathService");

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { role, userSkills = [], weeklyHours = 5, track = "standard" } = req.body;

    const gap = await analyzeSkillsGap(role, userSkills);
    if (!gap) return res.status(502).json({ success: false, message: "AI failed gap analysis" });

    const growth = await generateGrowthPath(
      role,
      gap.missingSkills?.map((s) => s.name) || [],
      { weeklyHours, track, knownSkills: userSkills }
    );
    if (!growth) return res.status(502).json({ success: false, message: "AI failed growth path" });

    res.json({ success: true, gap, growth });
  } catch (err) {
    console.error("Growth analysis error:", err);
    res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

module.exports = router;
