// Cookie utility functions for secure token storage
export const cookieUtils = {
  // Set a cookie with optional expiration days
  setCookie: (name: string, value: string, days = 30): void => {
    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure=${window.location.protocol === "https:"}`
  },

  // Get a cookie value by name
  getCookie: (name: string): string | null => {
    const nameEQ = name + "="
    const ca = document.cookie.split(";")
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === " ") c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  },

  // Delete a cookie by setting it to expire
  deleteCookie: (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
  },

  // Check if a cookie exists
  hasCookie: (name: string): boolean => {
    return cookieUtils.getCookie(name) !== null
  },
}
