
import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { PaperAirplaneIcon, ClockIcon, EnvelopeIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import AppLayout from "../layouts/AppLayout"

export default function ScheduleEmailForm() {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [time, setTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Convert HH:mm to UTC ISO timestamp
    const [hours, minutes] = time.split(":").map(Number)
    const now = new Date()
    now.setHours(hours, minutes, 0, 0)

    // If time already passed today, schedule for tomorrow
    if (now < new Date()) {
      now.setDate(now.getDate() + 1)
    }

    const payload = {
      to,
      subject,
      body,
      schedule: now.toISOString(),
    }

    console.log("Sending payload:", payload)

    try {
      const response = await fetch("http://localhost:5000/api/cold-email/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Reset form
        setTo("")
        setSubject("")
        setBody("")
        setTime("")
        setTimeout(() => setSuccess(false), 5000)
      } else {
        alert("Error: " + (result.message || "Failed to schedule email"))
      }
    } catch (error) {
      alert("Network error: " + error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
            <PaperAirplaneIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Schedule Email
          </h1>
          <p className="text-muted-foreground text-lg">Schedule your cold emails to be sent at the perfect time</p>
        </motion.div>

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success-light border border-success/20 text-success px-6 py-4 rounded-xl mb-6 flex items-center space-x-3"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Email scheduled successfully!</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-enhanced"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="to"
                className="block text-sm font-medium text-foreground mb-2 flex items-center space-x-2"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>Recipient Email</span>
              </label>
              <input
                id="to"
                type="email"
                placeholder="Enter recipient's email address"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                required
                className="input-enhanced w-full"
              />
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-foreground mb-2 flex items-center space-x-2"
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span>Subject Line</span>
              </label>
              <input
                id="subject"
                type="text"
                placeholder="Enter email subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-enhanced w-full"
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-foreground mb-2">
                Email Content
              </label>
              <textarea
                id="body"
                placeholder="Write your email message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="input-enhanced w-full resize-none"
              />
            </div>

            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-foreground mb-2 flex items-center space-x-2"
              >
                <ClockIcon className="w-4 h-4" />
                <span>Schedule Time</span>
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="input-enhanced w-full"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Email will be sent today at the specified time, or tomorrow if the time has already passed.
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Scheduling Email...</span>
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span>Schedule Email</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AppLayout>
  )
}
