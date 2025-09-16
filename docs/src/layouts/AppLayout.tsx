"use client"

import { type ReactNode, useState } from "react"
import { motion } from "framer-motion"
import Sidebar from "../components/Sidebar"
import ChatAssistant from "../components/ChatAssistant"

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div
        className="absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary) / 0.1) 0%, transparent 50%), 
                              radial-gradient(circle at 75% 75%, hsl(var(--accent) / 0.1) 0%, transparent 50%),
                              url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fillRule="evenodd"%3E%3Cg fill="%23059669" fillOpacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
        }}
      ></div>

      <div className="relative flex">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-64" : "lg:ml-16"} min-h-screen`}>
          <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative z-10"
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Global Chat Assistant */}
      <ChatAssistant />
    </div>
  )
}
