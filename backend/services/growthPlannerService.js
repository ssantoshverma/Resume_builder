const { OpenAI } = require('openai');
const UserRoadmap = require('../models/UserRoadmap'); // Using UserRoadmap instead of UserProgress

const client = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

// Helper function to clean and attempt to repair JSON response
function cleanResponse(responseText) {
  let cleaned = responseText
    .trim()
    .replace(/^```json\s*|\s*```$/g, '') // Remove markdown code fences
    .replace(/[\r\n]+/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();

  // Remove non-JSON text before or after the JSON object
  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    console.error('No valid JSON object found in response:', cleaned);
    return null;
  }
  cleaned = cleaned.slice(jsonStart, jsonEnd + 1);

  // Attempt to repair incomplete JSON
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    console.warn('Initial JSON parse failed:', error.message);
    let repaired = cleaned;
    if (!repaired.endsWith('}')) {
      let openBraces = (repaired.match(/{/g) || []).length;
      let closeBraces = (repaired.match(/}/g) || []).length;
      while (openBraces > closeBraces) {
        repaired += '}';
        closeBraces++;
      }
    }
    if (repaired.match(/"[^"]*$/)) {
      repaired += '"';
    }
    repaired = repaired.replace(/,\s*([\]}])/g, '$1'); // Remove trailing commas
    repaired = repaired.replace(/}\s*{/g, '},{'); // Add commas between objects
    repaired = repaired.replace(/\[\s*([^\]]*)$/g, '[$1]'); // Ensure arrays are closed
    try {
      return JSON.parse(repaired);
    } catch (repairError) {
      console.error('Failed to repair JSON:', repairError.message, repaired);
      return null;
    }
  }
}

// Helper function to calculate level based on points
function calculateLevel(points) {
  if (points >= 1000) return 5;
  if (points >= 500) return 4;
  if (points >= 250) return 3;
  if (points >= 100) return 2;
  return 1;
}

// Helper function to assign badges
async function assignBadges(userRoadmap, skill) {
  const badges = userRoadmap.progress.badges || [];
  const badgeMap = {
    'Prompt Design': 'Prompt Master',
    'NLP Fundamentals': 'NLP Novice',
    'LLM Fundamentals': 'LLM Learner',
    'API Usage (OpenAI, Hugging Face)': 'API Integrator',
    'Evaluation Metrics for LLMs': 'Metrics Maestro',
    'Data Preprocessing': 'Data Wrangler',
    'SQL': 'SQL Specialist',
    'Python programming': 'Python Pro',
    'Data visualization': 'Viz Virtuoso',
    'Statistical analysis': 'Stats Sage',
    'Algorithms': 'Algorithm Ace',
    'OOP': 'OOP Expert',
  };
  if (skill in badgeMap && !badges.includes(badgeMap[skill])) {
    badges.push(badgeMap[skill]);
    await UserRoadmap.updateOne({ _id: userRoadmap._id }, { 'progress.badges': badges });
  }
  return badges;
}

// Fallback growth plan with provided resources
function getFallbackGrowthPlan(role, missingSkills, weeklyHours, track) {
  const durationMap = {
    'fast-track': 3,
    'standard': 6,
    'deep-dive': 10,
  };
  const plans = missingSkills.slice(0, 5).map((skill) => {
    const isAlgorithms = skill.name.toLowerCase().includes('algorithms');
    const isOOP = skill.name.toLowerCase().includes('oop') || skill.name.toLowerCase().includes('object-oriented');
    return {
      skill: skill.name,
      priority: skill.importance,
      estimatedDurationWeeks: durationMap[track] || 6,
      learningPathType: isAlgorithms || isOOP ? 'online course' : (skill.importance === 'high' ? 'project-based' : 'reading'),
      milestones: [
        { id: 1, title: `Learn core concepts of ${skill.name}` },
        { id: 2, title: `Complete a practice project for ${skill.name}` },
        { id: 3, title: `Master advanced techniques in ${skill.name}` },
      ],
      resources: isAlgorithms
        ? [
            { title: '"Algorithms, Part I" Coursera', url: 'https://www.coursera.org/learn/algorithms-part1', type: 'course' },
            { title: '"Cracking the Coding Interview" book', url: 'https://www.crackingthecodinginterview.com/', type: 'book' },
            { title: '"MIT 6.006 Algorithms Lecture Series" YouTube', url: 'https://www.youtube.com/playlist?list=PLkH0t0P8w9k2YpZ3bN6jN6yYzYl3kPjoO', type: 'video' },
          ]
        : isOOP
        ? [
            { title: '"Design Patterns" book', url: 'https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612', type: 'book' },
            { title: '"Object Oriented Programming in Java" Coursera', url: 'https://www.coursera.org/learn/java-object-oriented-programming', type: 'course' },
            { title: '"Core Java OOP Concepts" YouTube', url: 'https://www.youtube.com/watch?v=8D2A6B4Jv9Q', type: 'video' },
          ]
        : [
            { title: `Intro to ${skill.name}`, url: `https://example.com/${skill.name.toLowerCase().replace(/\s/g, '-')}`, type: 'course' },
            { title: `${skill.name} Guide`, url: `https://example.com/${skill.name.toLowerCase().replace(/\s/g, '-')}-guide`, type: 'article' },
            { title: `${skill.name} Tutorial`, url: `https://example.com/${skill.name.toLowerCase().replace(/\s/g, '-')}-tutorial`, type: 'video' },
          ],
    };
  });
  return { plans };
}

async function analyzeGrowth(req, res) {
  const { role, userSkills, weeklyHours, track } = req.body;
  const userId = req.user?.id;

  console.log('Analyze request:', { userId, role, userSkills, weeklyHours, track });

  if (!role || !userId) {
    return res.status(400).json({ 
      success: false, 
      message: `Missing required fields: ${!role ? 'role' : ''}${!role && !userId ? ', ' : ''}${!userId ? 'userId' : ''}`
    });
  }

  try {
    // Fetch or initialize user roadmap
    let userRoadmap = await UserRoadmap.findOne({ userId, role });
    if (!userRoadmap) {
      userRoadmap = new UserRoadmap({
        userId,
        title: `${role} Roadmap`,
        role,
        gap: {},
        growth: { plans: [] },
        progress: {
          points: 0,
          level: 1,
          badges: [],
          streak: 0,
          milestonesCompleted: [],
          skillsCompleted: [],
        },
      });
    }

    const gapPrompt = `
      You are a career advisor specializing in AI and machine learning roles. Analyze the skills gap for the target role: "${role}".
      User's current skills: ${userSkills.join(', ') || 'None'}.

      Output in JSON format only, with no additional text, markdown, or code fences:
      {
        "role": "${role}",
        "matchPercentage": number,
        "matchedSkills": [{ "name": string, "importance": "high|medium|low" }],
        "missingSkills": [{ "name": string, "importance": "high|medium|low" }]
      }

      Base required skills on industry standards for the role (e.g., Data analyst requires SQL, Python programming, Data visualization, Statistical analysis). Match user skills exactly or closely (e.g., "React" might match "low" for unrelated roles). Limit missingSkills to 3-5 key skills. Ensure JSON is valid and complete.
    `;

    const gapCompletion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:together",
      messages: [{ role: "user", content: gapPrompt }],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const gapResponseText = gapCompletion.choices[0].message.content;
    console.log('Raw gap response:', gapResponseText);
    const gapResult = cleanResponse(gapResponseText);
    if (!gapResult) {
      throw new Error('Failed to extract valid JSON from gap analysis response');
    }

    if (!gapResult.role || !Array.isArray(gapResult.matchedSkills) || !Array.isArray(gapResult.missingSkills)) {
      throw new Error('Invalid gap analysis response structure');
    }

    const growthPrompt = `
      You are a career growth planner for AI and machine learning roles. Create a personalized growth plan for the target role "${role}" focusing on these missing skills: ${gapResult.missingSkills.map(s => s.name).join(', ')}.
      Weekly hours available: ${weeklyHours}.
      Learning track: "${track}" (fast-track: quick and essential, standard: balanced, deep-dive: thorough and advanced).

      Output in JSON format only, with no additional text, markdown, or code fences:
      {
        "plans": [
          {
            "skill": string,
            "priority": "high|medium|low",
            "estimatedDurationWeeks": number,
            "learningPathType": "online course|project-based|reading|practice",
            "milestones": [{ "id": number, "title": string }],
            "resources": [{ "title": string, "url": string, "type": "course|book|video|article" }]
          }
        ]
      }

      Include a plan for each missing skill (up to 5). Ensure 3 milestones and 3 resources per skill. Adjust estimatedDurationWeeks (1-12 weeks) based on track and weekly hours (e.g., fast-track: shorter, deep-dive: longer). Use real, high-quality resources (e.g., Coursera, Udacity, Kaggle, arXiv, YouTube). Ensure JSON is valid and complete. Do not include any non-JSON text or incomplete objects.
    `;

    let growthResult;
    for (let i = 0; i < 3; i++) {
      try {
        const growthCompletion = await client.chat.completions.create({
          model: "openai/gpt-oss-20b:together",
          messages: [{ role: "user", content: growthPrompt }],
          max_tokens: 1500,
          temperature: 0.7,
        });

        const growthResponseText = growthCompletion.choices[0].message.content;
        console.log('Raw growth response:', growthResponseText);
        const cleanedGrowthResponse = cleanResponse(growthResponseText);
        if (!cleanedGrowthResponse) {
          throw new Error('Failed to extract valid JSON from growth response');
        }
        growthResult = cleanedGrowthResponse;
        if (!Array.isArray(growthResult.plans)) {
          throw new Error('Invalid growth path response structure');
        }
        break;
      } catch (error) {
        console.warn(`Retry ${i + 1} for growth response:`, error);
        if (i === 2) {
          console.error('All retries failed, using fallback growth plan');
          growthResult = getFallbackGrowthPlan(role, gapResult.missingSkills, weeklyHours, track);
        }
      }
    }

    // Update user roadmap with new data
    userRoadmap.gap = gapResult;
    userRoadmap.growth = growthResult;
    await userRoadmap.save();

    res.json({
      success: true,
      gap: gapResult,
      growth: growthResult,
      progress: userRoadmap.progress,
    });
  } catch (error) {
    console.error('Error in growth analysis:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to analyze. See server logs.' });
  }
}

async function updateProgress(req, res) {
  const { role, skill, milestoneId } = req.body;
  const userId = req.user?.id;

  console.log('Update progress request:', { userId, role, skill, milestoneId });

  if (!userId || !role || !skill) {
    return res.status(400).json({ 
      success: false, 
      message: `Missing required fields: ${!userId ? 'userId' : ''}${!userId && !role ? ', ' : ''}${!role ? 'role' : ''}${(!userId || !role) && !skill ? ', ' : ''}${!skill ? 'skill' : ''}`
    });
  }

  try {
    let userRoadmap = await UserRoadmap.findOne({ userId, role });
    if (!userRoadmap) {
      userRoadmap = new UserRoadmap({
        userId,
        title: `${role} Roadmap`,
        role,
        gap: {},
        growth: { plans: [] },
        progress: {
          points: 0,
          level: 1,
          badges: [],
          streak: 0,
          milestonesCompleted: [],
          skillsCompleted: [],
        },
      });
    }

    if (milestoneId !== undefined) {
      const milestoneKey = `${skill}:${milestoneId}`;
      if (!userRoadmap.progress.milestonesCompleted.some(m => m.skill === skill && m.milestoneId === milestoneId)) {
        userRoadmap.progress.milestonesCompleted.push({ skill, milestoneId });
        userRoadmap.progress.points += 50;
      }
    } else {
      if (!userRoadmap.progress.skillsCompleted.includes(skill)) {
        userRoadmap.progress.skillsCompleted.push(skill);
        userRoadmap.progress.points += 200;
        await assignBadges(userRoadmap, skill);
      }
    }

    const now = new Date();
    const last = new Date(userRoadmap.progress.lastActivity);
    const isSameDay = now.toDateString() === last.toDateString();
    const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === last.toDateString();
    if (!isSameDay && isYesterday) {
      userRoadmap.progress.streak += 1;
      userRoadmap.progress.points += userRoadmap.progress.streak * 10;
    } else if (!isSameDay && !isYesterday) {
      userRoadmap.progress.streak = 1;
    }
    userRoadmap.progress.lastActivity = new Date();

    userRoadmap.progress.level = calculateLevel(userRoadmap.progress.points);
    await userRoadmap.save();

    res.json({
      success: true,
      progress: userRoadmap.progress,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ success: false, message: 'Failed to update progress' });
  }
}

async function generateQuiz(req, res) {
  const { skill, milestone } = req.body;
  const userId = req.user?.id;

  console.log('Generate quiz request:', { userId, skill, milestone });

  if (!userId || !skill || !milestone) {
    return res.status(400).json({ 
      success: false, 
      message: `Missing required fields: ${!userId ? 'userId' : ''}${!userId && !skill ? ', ' : ''}${!skill ? 'skill' : ''}${(!userId || !skill) && !milestone ? ', ' : ''}${!milestone ? 'milestone' : ''}`
    });
  }

  try {
    const quizPrompt = `
      You are an AI quiz generator for career development. Generate a 3-question quiz for the skill "${skill}" and milestone "${milestone}" relevant to the role of a Prompt Engineer.

      Output in JSON format only, with no additional text, markdown, or code fences:
      {
        "questions": [
          {
            "question": string,
            "options": [string, string, string, string],
            "answer": string
          }
        ]
      }

      Ensure each question has exactly 4 options, one correct answer (matching one of the options exactly), and is directly related to the milestone. Ensure JSON is valid and complete.
    `;

    const quizCompletion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:together",
      messages: [{ role: "user", content: quizPrompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    const quizResponseText = quizCompletion.choices[0].message.content;
    console.log('Raw quiz response:', quizResponseText);
    const quizResult = cleanResponse(quizResponseText);
    if (!quizResult) {
      throw new Error('Failed to extract valid JSON from quiz response');
    }

    if (!Array.isArray(quizResult.questions)) {
      throw new Error('Invalid quiz response structure');
    }

    res.json({ success: true, quiz: quizResult });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ success: false, message: 'Failed to generate quiz' });
  }
}

async function saveRoadmap(req, res) {
  const { title, role, gap, growth } = req.body;
  const userId = req.user?.id;

  console.log('Save roadmap request:', { userId, title, role });

  if (!userId || !title || !role || !gap || !growth) {
    return res.status(400).json({ 
      success: false, 
      message: 'Missing required fields'
    });
  }

  try {
    const newRoadmap = new UserRoadmap({
      userId,
      title,
      role,
      gap,
      growth,
      progress: {
        points: 0,
        level: 1,
        badges: [],
        streak: 0,
        milestonesCompleted: [],
        skillsCompleted: [],
      },
    });
    await newRoadmap.save();

    res.json({ success: true, roadmap: newRoadmap });
  } catch (error) {
    console.error('Error saving roadmap:', error);
    res.status(500).json({ success: false, message: 'Failed to save roadmap' });
  }
}

async function getUserRoadmaps(req, res) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID required' });
  }

  try {
    const roadmaps = await UserRoadmap.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roadmaps' });
  }
}



// ... (previous imports and functions remain the same)

async function getRoadmapById(req, res) {
  const { id } = req.params;
  const userId = req.user?.id;

  console.log('Get roadmap request for id:', id, 'userId:', userId);

  if (!userId) {
    return res.status(400).json({ success: false, message: 'User ID required' });
  }

  try {
    const roadmap = await UserRoadmap.findOne({ _id: id, userId });
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roadmap' });
  }
}



module.exports = { analyzeGrowth, updateProgress, generateQuiz, saveRoadmap, getUserRoadmaps, getRoadmapById };































