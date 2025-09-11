import type React from "react"
import html2canvas from "html2canvas"
import type { ResumeData } from "../types/resume"

// Sample data for generating thumbnails
const sampleResumeData: ResumeData = {
  personalInfo: {
    fullName: "John Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    location: "New York, NY",
    website: "johndoe.com",
    linkedin: "linkedin.com/in/johndoe",
  },
  professionalSummary:
    "Experienced professional with a proven track record of delivering high-quality results and driving innovation.",
  jobRole: "Senior Software Engineer",
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
  experience: [
    {
      id: "1",
      company: "Tech Corp",
      position: "Senior Developer",
      startDate: "2020-01-01",
      endDate: "",
      current: true,
      description: "Led development of scalable web applications and mentored junior developers.",
    },
  ],
  education: [
    {
      id: "1",
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2016-09-01",
      endDate: "2020-05-01",
      gpa: "3.8",
    },
  ],
  certifications: [
    {
      id: "1",
      name: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      date: "2021-06-01",
    },
  ],
  projects: [
    {
      id: "1",
      name: "E-commerce Platform",
      description: "Built a full-stack e-commerce solution with React and Node.js",
      technologies: ["React", "Node.js", "MongoDB"],
      link: "github.com/johndoe/ecommerce",
    },
  ],
}

export const generateTemplateThumbnail = async (
  TemplateComponent: React.ComponentType<{ data: ResumeData; templateId: string }>,
  templateId: string,
): Promise<string> => {
  // Create a temporary container
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "-9999px"
  container.style.width = "800px"
  container.style.height = "1000px"
  container.style.backgroundColor = "white"
  container.style.overflow = "hidden"

  document.body.appendChild(container)

  try {
    // Render the template component (this would need React rendering in a real implementation)
    // For now, we'll create a simplified HTML representation
    const templateHTML = createTemplateHTML(templateId)
    container.innerHTML = templateHTML

    // Generate canvas from the container
    const canvas = await html2canvas(container, {
      width: 300,
      height: 400,
      scale: 0.5,
      backgroundColor: "#ffffff",
      useCORS: true,
    })

    // Convert to data URL
    const dataURL = canvas.toDataURL("image/png", 0.8)

    return dataURL
  } finally {
    // Clean up
    document.body.removeChild(container)
  }
}

const createTemplateHTML = (templateId: string): string => {
  const baseStyles = `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .container { padding: 20px; height: 100%; }
      .header { margin-bottom: 16px; }
      .name { font-size: 24px; font-weight: bold; margin-bottom: 4px; }
      .role { font-size: 16px; margin-bottom: 8px; }
      .contact { font-size: 12px; color: #666; }
      .section { margin-bottom: 16px; }
      .section-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
      .content { font-size: 12px; line-height: 1.4; }
      .experience-item { margin-bottom: 8px; }
      .job-title { font-weight: 600; }
      .company { color: #666; }
      .skills { display: flex; flex-wrap: wrap; gap: 4px; }
      .skill { padding: 2px 6px; border-radius: 12px; font-size: 10px; }
    </style>
  `

  switch (templateId) {
    case "modern":
      return `
        ${baseStyles}
        <style>
          .header { border-left: 4px solid #2563eb; padding-left: 16px; }
          .role { color: #2563eb; }
          .section-title { color: #1f2937; border-bottom: 2px solid #2563eb; padding-bottom: 2px; }
          .skill { background: #dbeafe; color: #1e40af; }
        </style>
        <div class="container">
          <div class="header">
            <div class="name">John Doe</div>
            <div class="role">Senior Software Engineer</div>
            <div class="contact">john.doe@email.com • (555) 123-4567 • New York, NY</div>
          </div>
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="content">Experienced professional with a proven track record...</div>
          </div>
          <div class="section">
            <div class="section-title">Work Experience</div>
            <div class="experience-item">
              <div class="job-title">Senior Developer</div>
              <div class="company">Tech Corp</div>
              <div class="content">Led development of scalable web applications...</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
              <span class="skill">JavaScript</span>
              <span class="skill">React</span>
              <span class="skill">Node.js</span>
            </div>
          </div>
        </div>
      `

    case "classic":
      return `
        ${baseStyles}
        <style>
          .header { text-align: center; border-bottom: 2px solid #d1d5db; padding-bottom: 16px; }
          .section-title { text-transform: uppercase; letter-spacing: 1px; font-weight: bold; }
          .skill { background: #f3f4f6; color: #374151; }
        </style>
        <div class="container">
          <div class="header">
            <div class="name">John Doe</div>
            <div class="role">Senior Software Engineer</div>
            <div class="contact">john.doe@email.com • (555) 123-4567 • New York, NY</div>
          </div>
          <div class="section">
            <div class="section-title">Professional Summary</div>
            <div class="content">Experienced professional with a proven track record...</div>
          </div>
          <div class="section">
            <div class="section-title">Professional Experience</div>
            <div class="experience-item">
              <div class="job-title">Senior Developer</div>
              <div class="company">Tech Corp</div>
              <div class="content">Led development of scalable web applications...</div>
            </div>
          </div>
        </div>
      `

    case "creative":
      return `
        ${baseStyles}
        <style>
          .container { display: grid; grid-template-columns: 1fr 2fr; height: 100%; }
          .sidebar { background: #7c3aed; color: white; padding: 16px; }
          .main { padding: 16px; }
          .sidebar .name { color: white; }
          .sidebar .role { color: #c4b5fd; }
          .sidebar .section-title { color: #c4b5fd; }
          .main .section-title { color: #7c3aed; }
          .skill { background: #8b5cf6; color: white; }
        </style>
        <div class="container">
          <div class="sidebar">
            <div class="header">
              <div class="name">John Doe</div>
              <div class="role">Senior Software Engineer</div>
            </div>
            <div class="section">
              <div class="section-title">Contact</div>
              <div class="content">john.doe@email.com<br>(555) 123-4567</div>
            </div>
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills">
                <span class="skill">JavaScript</span>
                <span class="skill">React</span>
              </div>
            </div>
          </div>
          <div class="main">
            <div class="section">
              <div class="section-title">About Me</div>
              <div class="content">Experienced professional with a proven track record...</div>
            </div>
            <div class="section">
              <div class="section-title">Experience</div>
              <div class="experience-item">
                <div class="job-title">Senior Developer</div>
                <div class="company">Tech Corp</div>
              </div>
            </div>
          </div>
        </div>
      `

    case "minimal":
      return `
        ${baseStyles}
        <style>
          .name { font-weight: 300; font-size: 28px; }
          .role { color: #059669; font-weight: 300; }
          .section-title { font-weight: 300; font-size: 18px; }
          .skill { border-bottom: 1px solid #059669; background: none; color: #374151; }
        </style>
        <div class="container">
          <div class="header">
            <div class="name">John Doe</div>
            <div class="role">Senior Software Engineer</div>
            <div class="contact">john.doe@email.com • (555) 123-4567 • New York, NY</div>
          </div>
          <div class="section">
            <div class="content">Experienced professional with a proven track record of delivering high-quality results...</div>
          </div>
          <div class="section">
            <div class="section-title">Experience</div>
            <div class="experience-item">
              <div class="job-title">Senior Developer</div>
              <div class="company">Tech Corp</div>
              <div class="content">Led development of scalable web applications...</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Skills</div>
            <div class="skills">
              <span class="skill">JavaScript</span>
              <span class="skill">React</span>
              <span class="skill">Node.js</span>
            </div>
          </div>
        </div>
      `

    default:
      return "<div>Template not found</div>"
  }
}

