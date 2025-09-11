
import { motion } from "framer-motion"
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, StarIcon } from "@heroicons/react/24/solid"
import { MatchedSkill, MissingSkill } from "../services/careerInsightsService"

interface SkillTagProps {
  skill: MatchedSkill | MissingSkill
  type: "matched" | "missing"
  index: number
}

const categoryColors: Record<string, string> = {
  technical: "bg-blue-100 text-blue-800 border-blue-200",
  soft: "bg-purple-100 text-purple-800 border-purple-200",
  certification: "bg-yellow-100 text-yellow-800 border-yellow-200",
  tool: "bg-green-100 text-green-800 border-green-200",
}

const proficiencyIcons: Record<string, JSX.Element> = {
  beginner: <StarIcon className="h-3 w-3" />,
  intermediate: (
    <div className="flex space-x-0.5">
      <StarIcon className="h-3 w-3" />
      <StarIcon className="h-3 w-3" />
    </div>
  ),
  advanced: (
    <div className="flex space-x-0.5">
      <StarIcon className="h-3 w-3" />
      <StarIcon className="h-3 w-3" />
      <StarIcon className="h-3 w-3" />
    </div>
  ),
  expert: (
    <div className="flex space-x-0.5">
      <StarIcon className="h-3 w-3" />
      <StarIcon className="h-3 w-3" />
      <StarIcon className="h-3 w-3" />
      <StarIcon className="h-3 w-3" />
    </div>
  ),
}

const importanceColors: Record<string, string> = {
  critical: "border-red-300 bg-red-50",
  important: "border-orange-300 bg-orange-50",
  "nice-to-have": "border-gray-300 bg-gray-50",
}

export default function SkillTag({ skill, type, index }: SkillTagProps) {
  const isMatched = type === "matched"
  const categoryColor = categoryColors[skill.category] || categoryColors.technical
  
  // Type guards
  const isMatchedSkill = (skill: MatchedSkill | MissingSkill): skill is MatchedSkill => {
    return 'proficiencyLevel' in skill
  }
  
  const isMissingSkill = (skill: MatchedSkill | MissingSkill): skill is MissingSkill => {
    return 'importance' in skill
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        relative p-4 rounded-xl border transition-all duration-300 hover:shadow-lg group
        ${
          isMatched
            ? "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-green-100"
            : isMissingSkill(skill) && skill.importance
            ? `${importanceColors[skill.importance]} hover:shadow-lg`
            : "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 hover:shadow-red-100"
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-2">
              {isMatched ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
              <h3 className="font-semibold text-gray-900 text-sm">{skill.name}</h3>
            </div>
            
            {!isMatched && isMissingSkill(skill) && skill.importance === "critical" && (
              <div className="flex items-center space-x-1">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                <span className="text-xs text-red-600 font-medium">Critical</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium border ${categoryColor}`}
              >
                {skill.category}
              </span>
              
              {isMatched && isMatchedSkill(skill) && skill.proficiencyLevel && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  {proficiencyIcons[skill.proficiencyLevel]}
                  <span className="text-xs capitalize">{skill.proficiencyLevel}</span>
                </div>
              )}
            </div>

            {!isMatched && isMissingSkill(skill) && skill.estimatedLearningTime && (
              <div className="text-xs text-gray-600 font-medium">
                ~{skill.estimatedLearningTime}
              </div>
            )}
          </div>

          {!isMatched && isMissingSkill(skill) && skill.importance && (
            <div className="mt-3">
              <div
                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                  ${
                    skill.importance === "critical"
                      ? "bg-red-100 text-red-700 border border-red-200"
                      : skill.importance === "important"
                      ? "bg-orange-100 text-orange-700 border border-orange-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }
                `}
              >
                {skill.importance === "critical" && "🔥 "}
                {skill.importance === "important" && "⭐ "}
                {skill.importance === "nice-to-have" && "💡 "}
                <span className="capitalize">{skill.importance.replace("-", " ")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Decorative gradient overlay */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-r opacity-5 group-hover:opacity-10 transition-opacity
          ${isMatched ? "from-green-400 to-emerald-400" : "from-red-400 to-rose-400"}
        `}
      />
      
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity blur-xl
          ${isMatched ? "bg-green-200" : "bg-red-200"}
        `}
      />
    </motion.div>
  )
}