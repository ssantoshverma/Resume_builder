import React, { useState } from "react"
import { motion } from "framer-motion"
import {
  CheckCircleIcon,
  PlayCircleIcon,
  ClockIcon,
  BookOpenIcon,
  LinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleIconSolid } from "@heroicons/react/24/solid"
import { SkillPlan, Resource, Milestone } from "../services/careerInsightsService"

interface GrowthPathCardProps {
  skillPlan: SkillPlan
  skillIndex: number
  onMilestoneToggle: (skillIndex: number, milestoneIndex: number, completed: boolean) => void
}

const typeIcons: Record<Resource['type'], string> = {
  course: "🎓",
  book: "📚",
  tutorial: "🎯",
  documentation: "📖",
  practice: "💻",
  certification: "🏆",
}

const priorityColors: Record<string, string> = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
  low: "border-gray-200 bg-gray-50 text-gray-700",
}

const statusColors: Record<string, string> = {
  "not-started": "bg-gray-100 text-gray-700",
  "in-progress": "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  paused: "bg-orange-100 text-orange-700",
}

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-red-100 text-red-700",
}

export default function GrowthPathCard({
  skillPlan,
  skillIndex,
  onMilestoneToggle,
}: GrowthPathCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showResources, setShowResources] = useState(false)

  const completedMilestones = skillPlan.milestones.filter(m => m.completed).length
  const totalMilestones = skillPlan.milestones.length

  const handleMilestoneToggle = (milestoneIndex: number, completed: boolean) => {
    onMilestoneToggle(skillIndex, milestoneIndex, completed)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: skillIndex * 0.1 }}
      className={`glass-panel border-l-4 hover:shadow-lg transition-shadow ${
        skillPlan.skill.priority === 'high' 
          ? 'border-l-red-500' 
          : skillPlan.skill.priority === 'medium' 
          ? 'border-l-yellow-500' 
          : 'border-l-gray-500'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${priorityColors[skillPlan.skill.priority]}`}>
            {skillPlan.skill.priority.toUpperCase()} PRIORITY
          </div>
          <h3 className="text-lg font-semibold text-foreground">{skillPlan.skill.name}</h3>
          <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[skillPlan.status]}`}>
            {skillPlan.status.replace('-', ' ').toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <ClockIcon className="h-4 w-4" />
            {skillPlan.estimatedDuration}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Progress</span>
          <span className="text-sm font-medium text-foreground">
            {skillPlan.overallProgress}% ({completedMilestones}/{totalMilestones} milestones)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary to-primary-light h-3 rounded-full"
            style={{ width: `${skillPlan.overallProgress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${skillPlan.overallProgress}%` }}
            transition={{ duration: 0.8, delay: skillIndex * 0.1 }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-semibold text-primary">{skillPlan.resources.length}</div>
          <div className="text-xs text-muted-foreground">Resources</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-semibold text-success">{completedMilestones}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-lg font-semibold text-warning">{totalMilestones - completedMilestones}</div>
          <div className="text-xs text-muted-foreground">Remaining</div>
        </div>
      </div>

      {/* Expanded Content */}
      <motion.div
        initial={false}
        animate={{ 
          height: isExpanded ? 'auto' : 0, 
          opacity: isExpanded ? 1 : 0 
        }}
        className="overflow-hidden"
      >
        <div className="space-y-6">
          {/* Resources Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-foreground flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Learning Resources ({skillPlan.resources.length})
              </h4>
              <button
                onClick={() => setShowResources(!showResources)}
                className="text-sm text-primary hover:text-primary-dark transition-colors font-medium"
              >
                {showResources ? 'Hide' : 'Show'} Resources
              </button>
            </div>

            <motion.div
              animate={{ 
                height: showResources ? 'auto' : 0, 
                opacity: showResources ? 1 : 0 
              }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {skillPlan.resources.map((resource, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{typeIcons[resource.type]}</span>
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {resource.type}
                        </span>
                        {resource.free && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200">
                            FREE
                          </span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${difficultyColors[resource.difficulty]}`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    
                    <h5 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                      {resource.title}
                    </h5>
                    <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <ClockIcon className="h-3 w-3" />
                        {resource.estimatedTime}
                      </div>
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-xs text-primary hover:text-primary-dark transition-colors"
                        >
                          <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                          <span>View</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Milestones Section */}
          <div>
            <h4 className="font-semibold text-foreground flex items-center mb-4">
              <PlayCircleIcon className="h-5 w-5 mr-2" />
              Learning Milestones
            </h4>
            
            <div className="space-y-3">
              {skillPlan.milestones.map((milestone, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 border rounded-lg transition-all duration-200 ${
                    milestone.completed
                      ? "border-green-200 bg-green-50"
                      : "border-border hover:border-primary"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleMilestoneToggle(idx, !milestone.completed)}
                        className={`mt-0.5 transition-colors ${
                          milestone.completed
                            ? "text-green-600 hover:text-green-700"
                            : "text-gray-400 hover:text-primary"
                        }`}
                      >
                        {milestone.completed ? (
                          <CheckCircleIconSolid className="h-5 w-5" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5" />
                        )}
                      </button>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-xs font-medium text-primary bg-primary-light px-2 py-0.5 rounded">
                            Week {milestone.week}
                          </span>
                          <h5 className={`font-medium ${milestone.completed ? "text-green-700" : "text-foreground"}`}>
                            {milestone.title}
                          </h5>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                        
                        {milestone.tasks.length > 0 && (
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {milestone.tasks.map((task, taskIdx) => (
                              <li key={taskIdx} className="flex items-center space-x-2">
                                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                                <span>{task}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        
                        {milestone.completed && milestone.completedAt && (
                          <div className="text-xs text-green-600 mt-2">
                            Completed on {new Date(milestone.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}