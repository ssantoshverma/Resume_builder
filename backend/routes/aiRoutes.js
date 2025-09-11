const express = require("express");
const router = express.Router();
const client = require("../services/hfClient");

// POST /api/ai/ask
router.post("/ask", async (req, res) => {
    const { query } = req.body;

    if (!query || query.trim() === "") {
        return res.status(400).json({ error: "Query is required" });
    }

    try {
        const chatCompletion = await client.chat.completions.create({
            model: "openai/gpt-oss-20b:together",
            messages: [
                {
                    role: "user",
                    content: `
Respond concisely and directly.
Do NOT include any reasoning, internal thoughts, or <think> tags.
Only provide the final answer to the user's question.

Question: ${query}
                    `,
                },
            ],
            max_tokens: 200,
        });

        let reply = chatCompletion.choices[0]?.message?.content || "No response";
        reply = reply.replace(/<think>.*?<\/think>/gs, "").trim();

        res.json({ reply });
    } catch (err) {
        console.error("Error fetching from Hugging Face:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to fetch response from Hugging Face" });
    }
});

module.exports = router;
