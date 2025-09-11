const axios = require("axios")

class MistralService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY
    this.baseURL = "https://api.mistral.ai/v1"
    this.hasApiKey = !!this.apiKey
  }

  async analyzeSkillsGap(userSkills, targetRole) {
    // If no API key, use fallback immediately
    if (!this.hasApiKey) {
      console.log("No Mistral API key found, using fallback analysis")
      return this.getFallbackSkillsAnalysis(userSkills, targetRole)
    }

    try {
      const prompt = this.createSkillsGapPrompt(userSkills, targetRole)
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: "You are a career counselor and skills analysis expert. Analyze user skills against target role requirements and provide detailed, actionable insights."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      )

      const analysis = JSON.parse(response.data.choices[0].message.content)
      return this.formatSkillsGapResponse(analysis)
      
    } catch (error) {
      console.error("Mistral API error:", error.response?.data || error.message)
      // Fall back to local analysis
      return this.getFallbackSkillsAnalysis(userSkills, targetRole)
    }
  }

  async generateGrowthPath(missingSkills, targetRole, userExperience = "intermediate") {
    // If no API key, use fallback immediately
    if (!this.hasApiKey) {
      console.log("No Mistral API key found, using fallback growth path")
      return this.getFallbackGrowthPath(missingSkills, targetRole)
    }

    try {
      const prompt = this.createGrowthPathPrompt(missingSkills, targetRole, userExperience)
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: "mistral-large-latest",
          messages: [
            {
              role: "system",
              content: "You are an expert learning path designer. Create comprehensive, practical learning plans with specific resources, timelines, and milestones."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.4,
          max_tokens: 3000
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          }
        }
      )

      const growthPath = JSON.parse(response.data.choices[0].message.content)
      return this.formatGrowthPathResponse(growthPath)
      
    } catch (error) {
      console.error("Mistral API error:", error.response?.data || error.message)
      // Fall back to local generation
      return this.getFallbackGrowthPath(missingSkills, targetRole)
    }
  }

  createSkillsGapPrompt(userSkills, targetRole) {
    return `
Analyze the skills gap for a user targeting the role: "${targetRole}"

Current User Skills: ${userSkills.join(", ")}

Please provide a comprehensive analysis in the following JSON format:
{
  "targetRole": "${targetRole}",
  "roleRequirements": [
    {
      "name": "skill name",
      "category": "technical|soft|certification|tool",
      "required": true|false,
      "description": "why this skill is important for the role"
    }
  ],
  "matchedSkills": [
    {
      "name": "skill name",
      "category": "technical|soft|certification|tool",
      "proficiencyLevel": "beginner|intermediate|advanced|expert"
    }
  ],
  "missingSkills": [
    {
      "name": "skill name",
      "category": "technical|soft|certification|tool",
      "importance": "critical|important|nice-to-have",
      "estimatedLearningTime": "time estimate"
    }
  ],
  "overallMatch": percentage_number,
  "recommendations": "brief career advice"
}

Focus on:
1. Industry-standard skills for ${targetRole}
2. Current market demands
3. Realistic learning timelines
4. Priority-based skill categorization
`
  }

  createGrowthPathPrompt(missingSkills, targetRole, userExperience) {
    return `
Create a detailed learning path for a ${userExperience}-level professional targeting "${targetRole}".

Missing Skills to Learn: ${missingSkills.map(s => s.name).join(", ")}

Generate a comprehensive growth path in JSON format:
{
  "targetRole": "${targetRole}",
  "estimatedCompletionTime": "overall time estimate",
  "skillPlans": [
    {
      "skill": {
        "name": "skill name",
        "category": "technical|soft|certification|tool",
        "priority": "high|medium|low"
      },
      "estimatedDuration": "learning time",
      "resources": [
        {
          "type": "course|book|tutorial|documentation|practice|certification",
          "title": "resource title",
          "url": "https://example.com",
          "description": "brief description",
          "estimatedTime": "time to complete",
          "difficulty": "beginner|intermediate|advanced",
          "free": true|false
        }
      ],
      "milestones": [
        {
          "week": 1,
          "title": "milestone title",
          "description": "what to accomplish",
          "tasks": ["task 1", "task 2", "task 3"]
        }
      ]
    }
  ]
}

Requirements:
1. Include mix of free and paid resources
2. Progressive difficulty levels
3. Practical projects and exercises
4. Industry-relevant certifications where applicable
5. 4-8 week learning paths per skill
6. Specific, measurable milestones
`
  }

  formatSkillsGapResponse(analysis) {
    return {
      targetRole: analysis.targetRole,
      roleRequirements: analysis.roleRequirements || [],
      matchedSkills: analysis.matchedSkills || [],
      missingSkills: analysis.missingSkills || [],
      overallMatch: Math.min(Math.max(analysis.overallMatch || 0, 0), 100),
      recommendations: analysis.recommendations || "",
      analysisDate: new Date()
    }
  }

  formatGrowthPathResponse(growthPath) {
    return {
      targetRole: growthPath.targetRole,
      estimatedCompletionTime: growthPath.estimatedCompletionTime || "3-6 months",
      skillPlans: (growthPath.skillPlans || []).map(plan => ({
        ...plan,
        overallProgress: 0,
        status: "not-started",
        milestones: (plan.milestones || []).map(milestone => ({
          ...milestone,
          completed: false
        }))
      }))
    }
  }

  // Enhanced fallback method that works well without AI
  getFallbackSkillsAnalysis(userSkills, targetRole) {
    const roleSkillsDatabase = {
      "Frontend Developer": {
        critical: ["HTML", "CSS", "JavaScript", "React", "Git"],
        important: ["TypeScript", "Webpack", "Testing", "Responsive Design"],
        niceToHave: ["Vue.js", "Angular", "SASS", "UI/UX Design"]
      },
      "Backend Developer": {
        critical: ["JavaScript", "Node.js", "API Development", "Database", "Git"],
        important: ["Docker", "AWS", "Testing", "Security"],
        niceToHave: ["Microservices", "Redis", "GraphQL"]
      },
      "Full Stack Developer": {
        critical: ["HTML", "CSS", "JavaScript", "React", "Node.js", "Database", "Git"],
        important: ["TypeScript", "Docker", "AWS", "Testing"],
        niceToHave: ["DevOps", "CI/CD", "Monitoring"]
      },
      "Data Scientist": {
        critical: ["Python", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
        important: ["Pandas", "NumPy", "Scikit-learn", "Jupyter"],
        niceToHave: ["TensorFlow", "R", "Big Data", "Cloud Platforms"]
      },
      "DevOps Engineer": {
        critical: ["Linux", "Docker", "Kubernetes", "CI/CD", "Git"],
        important: ["AWS", "Terraform", "Monitoring", "Scripting"],
        niceToHave: ["Ansible", "Jenkins", "Security"]
      },
      "Product Manager": {
        critical: ["Product Strategy", "Market Research", "Analytics", "Communication"],
        important: ["Agile", "User Experience", "Project Management"],
        niceToHave: ["Design Thinking", "Technical Knowledge", "Leadership"]
      },
      "UX Designer": {
        critical: ["User Research", "Wireframing", "Prototyping", "Design Tools"],
        important: ["Usability Testing", "Information Architecture", "Visual Design"],
        niceToHave: ["HTML/CSS", "Psychology", "Accessibility"]
      }
    }

    // Default fallback for unknown roles
    const defaultSkills = {
      critical: ["Communication", "Problem Solving", "Teamwork"],
      important: ["Leadership", "Time Management", "Adaptability"],
      niceToHave: ["Technical Skills", "Industry Knowledge", "Networking"]
    }

    const roleSkills = roleSkillsDatabase[targetRole] || defaultSkills
    const allRequiredSkills = [
      ...roleSkills.critical.map(skill => ({ skill, importance: "critical" })),
      ...roleSkills.important.map(skill => ({ skill, importance: "important" })),
      ...roleSkills.niceToHave.map(skill => ({ skill, importance: "nice-to-have" }))
    ]

    // Normalize skills for comparison (lowercase, remove spaces/punctuation)
    const normalizeSkill = (skill) => skill.toLowerCase().replace(/[^a-z0-9]/g, '')
    const normalizedUserSkills = userSkills.map(normalizeSkill)

    const matched = []
    const missing = []

    allRequiredSkills.forEach(({ skill, importance }) => {
      const normalizedSkill = normalizeSkill(skill)
      const isMatched = normalizedUserSkills.some(userSkill => 
        userSkill.includes(normalizedSkill) || normalizedSkill.includes(userSkill)
      )

      if (isMatched) {
        matched.push({
          name: skill,
          category: this.getSkillCategory(skill),
          proficiencyLevel: "intermediate"
        })
      } else {
        missing.push({
          name: skill,
          category: this.getSkillCategory(skill),
          importance: importance,
          estimatedLearningTime: this.getEstimatedLearningTime(skill, importance)
        })
      }
    })

    const overallMatch = allRequiredSkills.length > 0 
      ? Math.round((matched.length / allRequiredSkills.length) * 100) 
      : 0

    return {
      targetRole,
      roleRequirements: allRequiredSkills.map(({ skill, importance }) => ({
        name: skill,
        category: this.getSkillCategory(skill),
        required: importance === "critical",
        description: `Important for ${targetRole} role`
      })),
      matchedSkills: matched,
      missingSkills: missing,
      overallMatch: overallMatch,
      recommendations: `Focus on the critical skills first: ${missing.filter(s => s.importance === 'critical').map(s => s.name).join(', ')}`,
      analysisDate: new Date()
    }
  }

  getSkillCategory(skill) {
    const technicalSkills = [
      'html', 'css', 'javascript', 'react', 'node.js', 'python', 'sql', 'git', 
      'docker', 'kubernetes', 'aws', 'typescript', 'vue.js', 'angular', 'database',
      'api', 'testing', 'webpack', 'linux', 'mongodb', 'postgresql', 'redis'
    ]
    const toolSkills = [
      'git', 'docker', 'webpack', 'jenkins', 'jira', 'figma', 'sketch', 'adobe',
      'analytics', 'monitoring', 'ci/cd'
    ]
    const certificationSkills = [
      'aws', 'azure', 'google cloud', 'kubernetes', 'scrum', 'pmp'
    ]

    const normalizedSkill = skill.toLowerCase()
    
    if (certificationSkills.some(cert => normalizedSkill.includes(cert))) return 'certification'
    if (toolSkills.some(tool => normalizedSkill.includes(tool))) return 'tool'
    if (technicalSkills.some(tech => normalizedSkill.includes(tech))) return 'technical'
    
    return 'soft'
  }

  getEstimatedLearningTime(skill, importance) {
    const timeMap = {
      critical: {
        technical: '6-8 weeks',
        tool: '2-4 weeks',
        certification: '4-6 weeks',
        soft: '4-6 weeks'
      },
      important: {
        technical: '4-6 weeks',
        tool: '2-3 weeks',
        certification: '3-4 weeks',
        soft: '3-4 weeks'
      },
      'nice-to-have': {
        technical: '2-4 weeks',
        tool: '1-2 weeks',
        certification: '2-3 weeks',
        soft: '2-3 weeks'
      }
    }

    const category = this.getSkillCategory(skill)
    return timeMap[importance]?.[category] || '4-6 weeks'
  }

  getFallbackGrowthPath(missingSkills, targetRole) {
    const resourceDatabase = {
      "JavaScript": {
        type: "course",
        title: "JavaScript Fundamentals Course",
        url: "https://javascript.info/",
        description: "Comprehensive JavaScript tutorial with interactive examples",
        estimatedTime: "40 hours",
        difficulty: "beginner",
        free: true
      },
      "React": {
        type: "course", 
        title: "React Official Documentation",
        url: "https://react.dev/learn",
        description: "Official React tutorial and documentation",
        estimatedTime: "30 hours",
        difficulty: "intermediate",
        free: true
      },
      "Node.js": {
        type: "course",
        title: "Node.js Official Guide",
        url: "https://nodejs.org/en/learn/",
        description: "Official Node.js learning resources and guides",
        estimatedTime: "35 hours",
        difficulty: "intermediate", 
        free: true
      },
      "Python": {
        type: "course",
        title: "Python Official Tutorial",
        url: "https://docs.python.org/3/tutorial/",
        description: "Official Python tutorial for beginners",
        estimatedTime: "30 hours",
        difficulty: "beginner",
        free: true
      },
      "HTML": {
        type: "course",
        title: "HTML MDN Tutorial",
        url: "https://developer.mozilla.org/en-US/docs/Learn/HTML",
        description: "Comprehensive HTML learning resource",
        estimatedTime: "20 hours",
        difficulty: "beginner",
        free: true
      },
      "CSS": {
        type: "course",
        title: "CSS MDN Tutorial", 
        url: "https://developer.mozilla.org/en-US/docs/Learn/CSS",
        description: "Complete CSS learning guide",
        estimatedTime: "25 hours",
        difficulty: "beginner",
        free: true
      }
    }

    return {
      targetRole,
      estimatedCompletionTime: `${Math.max(missingSkills.length * 4, 12)} weeks`,
      skillPlans: missingSkills.map((skill, index) => ({
        skill: {
          name: skill.name,
          category: skill.category,
          priority: skill.importance === "critical" ? "high" : skill.importance === "important" ? "medium" : "low"
        },
        estimatedDuration: skill.estimatedLearningTime || "4-6 weeks",
        resources: [
          resourceDatabase[skill.name] || {
            type: "documentation",
            title: `${skill.name} Learning Resources`,
            url: `https://www.google.com/search?q=${encodeURIComponent(skill.name + " tutorial")}`,
            description: `Comprehensive ${skill.name} learning materials`,
            estimatedTime: "20-30 hours",
            difficulty: "beginner",
            free: true
          },
          {
            type: "practice",
            title: `${skill.name} Practice Projects`,
            url: `https://www.google.com/search?q=${encodeURIComponent(skill.name + " practice projects")}`,
            description: `Hands-on projects to practice ${skill.name}`,
            estimatedTime: "10-15 hours",
            difficulty: "intermediate",
            free: true
          }
        ],
        milestones: this.generateMilestones(skill.name, skill.importance),
        overallProgress: 0,
        status: "not-started"
      }))
    }
  }

  generateMilestones(skillName, importance) {
    const baseMilestones = [
      {
        week: 1,
        title: `${skillName} Fundamentals`,
        description: `Learn the core concepts and syntax of ${skillName}`,
        tasks: [
          "Complete introduction tutorial",
          "Understand basic concepts",
          "Practice simple exercises"
        ],
        completed: false
      },
      {
        week: 2,
        title: `${skillName} Practical Application`,
        description: `Apply ${skillName} in real-world scenarios`,
        tasks: [
          "Build a small project",
          "Practice common patterns",
          "Debug and troubleshoot"
        ],
        completed: false
      },
      {
        week: 3,
        title: `${skillName} Best Practices`,
        description: `Learn industry standards and best practices`,
        tasks: [
          "Study code quality guidelines",
          "Learn testing approaches",
          "Understand security considerations"
        ],
        completed: false
      },
      {
        week: 4,
        title: `${skillName} Portfolio Project`,
        description: `Create a showcase project demonstrating your skills`,
        tasks: [
          "Plan and design project",
          "Implement core features", 
          "Document and deploy"
        ],
        completed: false
      }
    ]

    // Add extra milestones for critical skills
    if (importance === 'critical') {
      baseMilestones.push({
        week: 5,
        title: `Advanced ${skillName} Concepts`,
        description: `Explore advanced features and optimization`,
        tasks: [
          "Study advanced concepts",
          "Optimize existing code",
          "Prepare for interviews"
        ],
        completed: false
      })
    }

    return baseMilestones
  }
}

module.exports = new MistralService()