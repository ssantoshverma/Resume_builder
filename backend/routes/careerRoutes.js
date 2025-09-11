const express = require("express");
const router = express.Router();
const { getAIResponse } = require("../services/hfClient");

// POST /api/career/query
router.post("/query", async (req, res) => {
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: "Message is required" });

  const aiResponse = await getAIResponse(message);
  res.json({ reply: aiResponse });
});

module.exports = router;
