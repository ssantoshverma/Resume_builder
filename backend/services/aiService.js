
// services/aiService.js
const OpenAI = require("openai");

// 🔹 Client for general Q&A (career assistant style)
const askClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

// 🔹 Client for resume summary generation (maybe a different model later)
const summaryClient = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

/**
 * Ask AI with user profile + query
 */
async function askAI(profile, query) {
  const systemPrompt = `
You are a career assistant. 
Always respond concisely in clear, well-formatted Markdown (tables, lists, bold text).
Do NOT include internal thoughts or <think> tags.

User profile:
- Name: ${profile.name || "N/A"}
- Role: ${profile.role || "N/A"}
- Skills: ${profile.skills?.join(", ") || "N/A"}
- Bio: ${profile.bio || "N/A"}
- Education: ${profile.education || "N/A"}
- Experience: ${profile.experience || "N/A"}

Question: ${query}
`;

  const completion = await askClient.chat.completions.create({
    model: "openai/gpt-oss-20b:together",
    messages: [{ role: "user", content: systemPrompt }],
    max_tokens: 2000,
  });

  let reply = completion.choices[0]?.message?.content || "No response";
  reply = reply.replace(/<think>.*?<\/think>/gs, "").trim();

  return reply;
}

/**
 * Generate professional resume summary
 */
async function generateSummary(role, personalInfo) {
  const query = `

  You are a career assistant. 
Always respond concisely in clear, well-formatted Markdown (tables, lists, bold text).
Do NOT include internal thoughts or <think> tags.

Provided details:
- Role: ${role || "Not specified"}
- Name: ${personalInfo?.fullName || "Candidate"}
- Location: ${personalInfo?.location || "Not specified"}

Generate a unique, professional resume summary in a single paragraph, exactly 30 to 40 words. Include generic strengths like adaptability, problem-solving, and teamwork. Avoid bullet points, filler phrases, explanations, or placeholders. Make it concise, impactful, and different every time to impress interviewers.

Don't show this text in the output: <think>...</think>
don't show your thinking process in the output.

give only the summary text without any additional explanations or formatting.

`;
// - Skills: ${skills?.length ? skills.join(", ") : "Not specified"}
// - Experience: ${experience?.length ? experience.map((exp) => exp.title).join(", ") : "Not specified"}
// `;

  console.log("🤖 Final query to AI:", query);

  const completion = await summaryClient.chat.completions.create({
    model: "openai/gpt-oss-20b:together",
    messages: [{ role: "user", content: query }],
    max_tokens: 60,
  });

  let summary = completion.choices[0]?.message?.content || "No summary generated";
  summary = summary.replace(/<think>.*?<\/think>/gs, "").trim();

  return summary;
}






const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
  console.error("HF_TOKEN is missing. Set HF_TOKEN in .env");
}

// configure the OpenAI client to point to the Hugging Face router
const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: HF_TOKEN,
});

// helper: ensure AI returns strict JSON, extract JSON substring, parse
function extractJSONFromText(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response");
  }

  // Remove any <think> blocks if present
  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

  // Try exact first (maybe it's already JSON)
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // fallback: find first {...} block and parse
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      const err = new Error("AI did not return JSON");
      err.raw = cleaned;
      throw err;
    }
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e2) {
      const err = new Error("AI returned text that couldn't be parsed as JSON");
      err.raw = cleaned;
      throw err;
    }
  }
}

/**
 * Analyze skills gap — returns the JSON object:
 * {
 *   role: string,
 *   matchedSkills: [{name, importance}],
 *   missingSkills: [{name, importance}],
 *   matchPercentage: number
 * }
 *
 * Throws on any AI or parse error.
 */
async function analyzeSkillsGap(role, userSkills = []) {
  if (!role) throw new Error("Role is required");

  const systemPrompt = `
You are an expert career assistant. Compare the user's skills with the required skills for the role: "${role}".

Return ONLY valid JSON (no explanatory text) with this exact structure:
{
  "role":"${role}",
  "matchedSkills":[{"name":"...","importance":"critical|important|nice-to-have"}],
  "missingSkills":[{"name":"...","importance":"critical|important|nice-to-have"}],
  "matchPercentage": 0
}

UserSkills: [${userSkills.join(", ")}]
`;

  // call the model
  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:together",
      messages: [{ role: "user", content: systemPrompt }],
      max_tokens: 1200,
      temperature: 0.0,
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    // attempt to parse JSON (throws if fails)
    return extractJSONFromText(raw);
  } catch (err) {
    // Attach raw response when available for debugging
    console.error("AI analyzeSkillsGap error:", err?.message || err);
    if (err.raw) {
      console.error("AI raw output:", err.raw);
    }
    throw new Error("AI failed to generate skills gap analysis: " + (err.message || ""));
  }
}

/**
 * Generate growth path for missing skills
 * Expected return:
 * {
 *   role: string,
 *   plans: [
 *     {
 *       skill: string,
 *       priority: "critical|important|nice-to-have",
 *       estimatedDurationWeeks: number,
 *       learningPathType: "fast-track|standard|deep-dive",
 *       resources: [{type,title,url}],
 *       milestones: [{id,title,description,order,completed}],
 *       progressPercent: number
 *     }
 *   ]
 * }
 *
 * Throws if AI returns non-JSON.
 */
async function generateGrowthPath(role, missingSkills = [], options = {}) {
  const { weeklyHours = 5, track = "standard", knownSkills = [] } = options;
  if (!role) throw new Error("Role is required");

  const systemPrompt = `
You are a career mentor. For the role "${role}" produce a personalized growth roadmap for the missing skills.

Return ONLY valid JSON with this exact structure:
{
  "role":"${role}",
  "plans":[
    {
      "skill":"string",
      "priority":"critical|important|nice-to-have",
      "estimatedDurationWeeks": number,
      "learningPathType":"fast-track|standard|deep-dive",
      "resources":[{"type":"course|doc|project","title":"string","url":"string"}],
      "milestones":[{"id":"m1","title":"string","description":"string","order":1,"completed":false}],
      "progressPercent":0
    }
  ]
}

Known skills: [${knownSkills.join(", ")}]
Missing skills: [${missingSkills.join(", ")}]
Weekly hours: ${weeklyHours}
Track: ${track}
`;

  try {
    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:together",
      messages: [{ role: "user", content: systemPrompt }],
      max_tokens: 1800,
      temperature: 0.1,
    });

    const raw = completion.choices?.[0]?.message?.content || "";
    return extractJSONFromText(raw);
  } catch (err) {
    console.error("AI generateGrowthPath error:", err?.message || err);
    if (err.raw) console.error("AI raw output:", err.raw);
    throw new Error("AI failed to generate growth path: " + (err.message || ""));
  }
}





module.exports = { askAI, generateSummary };
