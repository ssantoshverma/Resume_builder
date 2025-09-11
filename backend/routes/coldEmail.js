const express = require("express");
const router = express.Router();
const axios = require("axios"); // ✅ use axios instead of fetch

const N8N_WEBHOOK_URL =
  "https://riteshnew.app.n8n.cloud/webhook/schedule-cold-email";

router.post("/schedule", async (req, res) => {
  try {
    const response = await axios.post(N8N_WEBHOOK_URL, req.body, {
      headers: { "Content-Type": "application/json" },
    });

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Proxy error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: "Proxy failed",
      error: err.response?.data || err.message,
    });
  }
});

module.exports = router;
