// Generate random string
const generateRandomString = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Format date
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input
  return input.trim().replace(/[<>]/g, "")
}

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Calculate reading time (for future blog features)
const calculateReadingTime = (text) => {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)
  return minutes
}

module.exports = {
  generateRandomString,
  formatDate,
  sanitizeInput,
  generateSlug,
  isValidEmail,
  calculateReadingTime,
}
