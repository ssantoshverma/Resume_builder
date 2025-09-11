// POST /api/skills/analyze
// Input: { userSkills: ["React", "Node.js"], targetRole: "Backend Developer" }
// Output: { matchedSkills: [...], missingSkills: [...], overallMatch: 70 }
router.post('/analyze', async (req, res) => {
  const { userSkills, targetRole } = req.body;

  let roleReq = await RoleRequirements.findOne({ role: targetRole });
  if (!roleReq) {
    // Fallback: generate requirements dynamically with AI
    roleReq = await generateRoleRequirements(targetRole);
  }

  const matchedSkills = roleReq.requiredSkills.filter(r =>
    userSkills.some(u => u.toLowerCase() === r.name.toLowerCase())
  );

  const missingSkills = roleReq.requiredSkills.filter(r =>
    !userSkills.some(u => u.toLowerCase() === r.name.toLowerCase())
  );

  const overallMatch = Math.round(
    (matchedSkills.length / roleReq.requiredSkills.length) * 100
  );

  const analysis = await SkillsGap.create({
    user: req.user._id,
    targetRole,
    matchedSkills,
    missingSkills,
    overallMatch
  });

  res.json({ matchedSkills, missingSkills, overallMatch, analysisId: analysis._id });
});

// POST /api/skills/growth-path
router.post('/growth-path', async (req, res) => {
  const { missingSkills, targetRole } = req.body;

  const plans = missingSkills.map(skill => ({
    skill: {
      name: skill.name,
      priority: skill.importance,
    },
    estimatedDuration: "4-6 weeks",
    resources: [
      { type: "course", title: `${skill.name} Basics`, url: "https://..." },
      { type: "practice", title: `Mini project using ${skill.name}`, url: "https://..." },
    ],
    milestones: [
      { title: `Learn fundamentals of ${skill.name}`, completed: false },
      { title: `Build a small project with ${skill.name}`, completed: false },
    ]
  }));

  const growthPath = await GrowthPath.create({
    user: req.user._id,
    targetRole,
    skillPlans: plans
  });

  res.json({ growthPath });
});
