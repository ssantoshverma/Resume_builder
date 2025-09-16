"use client"

import { motion, AnimatePresence } from "framer-motion"
import { NavLink, useNavigate } from "react-router-dom"
import {
  UserIcon,
  HomeIcon,
  DocumentPlusIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  PaperClipIcon,
  ArrowRightOnRectangleIcon,
  AcademicCapIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"
import { authService } from "../services/auth"
import { ThemeToggle } from "./ThemeToggle"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Profile", href: "/profile", icon: UserIcon },
  { name: "Create Resume", href: "/resume-builder", icon: DocumentPlusIcon },
  { name: "ATS Score", href: "/ats-score", icon: ChartBarIcon },
  { name: "Career Insights", href: "/career-insights", icon: AcademicCapIcon },
  { name: "Growth Planner", href: "/growth-planner", icon: AcademicCapIcon },
  { name: "Progress", href: "/progress", icon: ArrowTrendingUpIcon },
  { name: "Cold Email", href: "/cold-email", icon: PaperClipIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authService.logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      navigate("/login")
    }
  }

  const sidebarVariants = {
    open: { width: "16rem" },
    closed: { width: "4rem" },
  }

  const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 },
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-sidebar-background/80 backdrop-blur-md shadow-lg border border-sidebar-border"
      >
        <Bars3Icon className="h-6 w-6 text-sidebar-foreground" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-sidebar-background/95 backdrop-blur-md shadow-xl border-r border-sidebar-border z-30 flex-col ${
          isMobileMenuOpen ? "block" : "hidden lg:flex"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  variants={itemVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center shadow-lg">
                    <svg
                      className="w-4 h-4 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-work-sans font-bold text-sidebar-foreground">ResumeAI</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={onToggle} className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
              {isOpen ? (
                <XMarkIcon className="h-5 w-5 text-sidebar-foreground" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-sidebar-foreground" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`
                  }
                >
                  <item.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isOpen ? "mr-3" : "mx-auto"}`} />
                  <AnimatePresence>
                    {isOpen && (
                      <motion.span
                        variants={itemVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="truncate"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          {/* Theme Toggle */}
          <AnimatePresence>
            {isOpen && (
              <motion.div variants={itemVariants} initial="closed" animate="open" exit="closed">
                <ThemeToggle />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon
              className={`h-5 w-5 flex-shrink-0 transition-colors ${isOpen ? "mr-3" : "mx-auto"}`}
            />
            <AnimatePresence>
              {isOpen && (
                <motion.span variants={itemVariants} initial="closed" animate="open" exit="closed">
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="lg:hidden fixed left-0 top-0 w-64 h-screen bg-sidebar-background shadow-xl border-r border-sidebar-border z-50 flex flex-col"
          >
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-light rounded-lg flex items-center justify-center shadow-lg">
                    <svg
                      className="w-4 h-4 text-primary-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <span className="font-work-sans font-bold text-sidebar-foreground">ResumeAI</span>
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
                >
                  <XMarkIcon className="h-5 w-5 text-sidebar-foreground" />
                </button>
              </div>
            </div>

            <nav className="flex-1 px-4 py-6">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0 mr-3" />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="p-4 border-t border-sidebar-border space-y-2">
              <ThemeToggle />
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0 mr-3" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
