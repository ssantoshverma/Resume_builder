import type React from "react"
import type { ResumeData } from "../types/resume"

interface TemplateProps {
  data: ResumeData
  templateId: string
}

export const ModernTemplate: React.FC<TemplateProps> = ({ data }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg" id="resume-content">
    {/* Header with blue accent */}
    <div className="border-l-4 border-blue-600 pl-6 mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
      {data.jobRole && <p className="text-xl text-blue-600 font-medium mb-3">{data.jobRole}</p>}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        {data.personalInfo.website && <span className="text-blue-600">{data.personalInfo.website}</span>}
      </div>
    </div>

    {/* Professional Summary */}
    {data.professionalSummary && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
          Professional Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">{data.professionalSummary}</p>
      </div>
    )}

    {/* Experience */}
    {data.experience.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">Work Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                  <p className="text-blue-600 font-medium">{exp.company}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {exp.startDate && (
                    <span>
                      {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} -
                      {exp.current
                        ? " Present"
                        : exp.endDate
                          ? ` ${new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                          : " End Date"}
                    </span>
                  )}
                </div>
              </div>
              {exp.description && <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">Education</h2>
        <div className="space-y-3">
          {data.education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </h3>
                <p className="text-gray-600">{edu.institution}</p>
                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
              </div>
              <div className="text-sm text-gray-500">
                {edu.startDate && edu.endDate && (
                  <span>
                    {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Certifications */}
    {data.certifications.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">Certifications</h2>
        <div className="space-y-2">
          {data.certifications.map((cert) => (
            <div key={cert.id} className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{cert.name}</h3>
                <p className="text-gray-600 text-sm">{cert.issuer}</p>
              </div>
              <div className="text-sm text-gray-500">
                {cert.date && new Date(cert.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {data.projects.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">Projects</h2>
        <div className="space-y-3">
          {data.projects.map((project) => (
            <div key={project.id}>
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                {project.link && (
                  <a href={project.link} className="text-blue-600 text-sm hover:underline">
                    View Project
                  </a>
                )}
              </div>
              {project.description && (
                <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
              )}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

export const ClassicTemplate: React.FC<TemplateProps> = ({ data }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg" id="resume-content">
    {/* Header - Classic centered style */}
    <div className="text-center border-b-2 border-gray-300 pb-6 mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
      {data.jobRole && <p className="text-lg text-gray-600 mb-3">{data.jobRole}</p>}
      <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
        {data.personalInfo.phone && <span>•</span>}
        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
        {data.personalInfo.location && <span>•</span>}
        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
      </div>
    </div>

    {/* Professional Summary */}
    {data.professionalSummary && (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Summary</h2>
        <p className="text-gray-700 leading-relaxed">{data.professionalSummary}</p>
      </div>
    )}

    {/* Experience */}
    {data.experience.length > 0 && (
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Experience</h2>
        <div className="space-y-4">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-gray-900">{exp.position}</h3>
                  <p className="text-gray-700 font-medium">{exp.company}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {exp.startDate && (
                    <span>
                      {new Date(exp.startDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })} -
                      {exp.current
                        ? " Present"
                        : exp.endDate
                          ? ` ${new Date(exp.endDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                          : " End Date"}
                    </span>
                  )}
                </div>
              </div>
              {exp.description && <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education & Skills in two columns */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <h3 className="font-bold text-gray-900">
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </h3>
                <p className="text-gray-700">{edu.institution}</p>
                <div className="text-sm text-gray-600">
                  {edu.startDate && edu.endDate && (
                    <span>
                      {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                    </span>
                  )}
                  {edu.gpa && <span className="ml-2">GPA: {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">Skills</h2>
          <div className="space-y-1">
            {data.skills.map((skill, index) => (
              <div key={index} className="text-gray-700">
                • {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)

export const CreativeTemplate: React.FC<TemplateProps> = ({ data }) => (
  <div className="max-w-4xl mx-auto bg-white shadow-lg" id="resume-content">
    <div className="grid grid-cols-3 min-h-screen">
      {/* Left Sidebar */}
      <div className="bg-purple-600 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
          {data.jobRole && <p className="text-purple-200 text-lg">{data.jobRole}</p>}
        </div>

        {/* Contact Info */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-purple-200">Contact</h2>
          <div className="space-y-2 text-sm">
            {data.personalInfo.email && <p>{data.personalInfo.email}</p>}
            {data.personalInfo.phone && <p>{data.personalInfo.phone}</p>}
            {data.personalInfo.location && <p>{data.personalInfo.location}</p>}
            {data.personalInfo.website && <p className="text-purple-200">{data.personalInfo.website}</p>}
          </div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-purple-200">Skills</h2>
            <div className="space-y-2">
              {data.skills.map((skill, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>{skill}</span>
                  </div>
                  <div className="w-full bg-purple-500 rounded-full h-2">
                    <div className="bg-white h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-purple-200">Education</h2>
            <div className="space-y-3 text-sm">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-purple-200">{edu.institution}</p>
                  {edu.startDate && edu.endDate && (
                    <p className="text-purple-300 text-xs">
                      {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="col-span-2 p-8">
        {/* Professional Summary */}
        {data.professionalSummary && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 text-purple-600">About Me</h2>
            <p className="text-gray-700 leading-relaxed">{data.professionalSummary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-purple-600 mb-4">Experience</h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-purple-200">
                  <div className="absolute w-4 h-4 bg-purple-600 rounded-full -left-2 top-0"></div>
                  <div className="mb-2">
                    <h3 className="font-bold text-gray-900 text-lg">{exp.position}</h3>
                    <p className="text-purple-600 font-medium">{exp.company}</p>
                    <p className="text-sm text-gray-500">
                      {exp.startDate && (
                        <span>
                          {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} -
                          {exp.current
                            ? " Present"
                            : exp.endDate
                              ? ` ${new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                              : " End Date"}
                        </span>
                      )}
                    </p>
                  </div>
                  {exp.description && <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-purple-600 mb-4">Projects</h2>
            <div className="space-y-4">
              {data.projects.map((project) => (
                <div key={project.id} className="border-l-4 border-purple-200 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    {project.link && (
                      <a href={project.link} className="text-purple-600 text-sm hover:underline">
                        View
                      </a>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
                  )}
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)

export const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => (
  <div className="max-w-4xl mx-auto bg-white p-8 shadow-lg" id="resume-content">
    {/* Header */}
    <div className="mb-12">
      <h1 className="text-4xl font-light text-gray-900 mb-2">{data.personalInfo.fullName || "Your Name"}</h1>
      {data.jobRole && <p className="text-xl text-green-600 font-light mb-4">{data.jobRole}</p>}
      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
        {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
        {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
        {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
        {data.personalInfo.website && <span className="text-green-600">{data.personalInfo.website}</span>}
      </div>
    </div>

    {/* Professional Summary */}
    {data.professionalSummary && (
      <div className="mb-10">
        <p className="text-gray-700 leading-relaxed text-lg font-light">{data.professionalSummary}</p>
      </div>
    )}

    {/* Experience */}
    {data.experience.length > 0 && (
      <div className="mb-10">
        <h2 className="text-2xl font-light text-gray-900 mb-6">Experience</h2>
        <div className="space-y-8">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{exp.position}</h3>
                  <p className="text-green-600">{exp.company}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {exp.startDate && (
                    <span>
                      {new Date(exp.startDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })} -
                      {exp.current
                        ? " Present"
                        : exp.endDate
                          ? ` ${new Date(exp.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                          : " End Date"}
                    </span>
                  )}
                </div>
              </div>
              {exp.description && <p className="text-gray-700 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Education */}
    {data.education.length > 0 && (
      <div className="mb-10">
        <h2 className="text-2xl font-light text-gray-900 mb-6">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-baseline">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </h3>
                <p className="text-green-600">{edu.institution}</p>
                {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
              </div>
              <div className="text-sm text-gray-500">
                {edu.startDate && edu.endDate && (
                  <span>
                    {new Date(edu.startDate).getFullYear()} - {new Date(edu.endDate).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Skills */}
    {data.skills.length > 0 && (
      <div className="mb-10">
        <h2 className="text-2xl font-light text-gray-900 mb-6">Skills</h2>
        <div className="flex flex-wrap gap-3">
          {data.skills.map((skill, index) => (
            <span key={index} className="text-gray-700 border-b border-green-600 pb-1">
              {skill}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Projects */}
    {data.projects.length > 0 && (
      <div>
        <h2 className="text-2xl font-light text-gray-900 mb-6">Projects</h2>
        <div className="space-y-6">
          {data.projects.map((project) => (
            <div key={project.id}>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                {project.link && (
                  <a href={project.link} className="text-green-600 text-sm hover:underline">
                    View Project
                  </a>
                )}
              </div>
              {project.description && <p className="text-gray-700 leading-relaxed mb-3">{project.description}</p>}
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="text-sm text-gray-600 border-b border-gray-300 pb-1">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)
