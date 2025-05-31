// Configuration settings for the application
export const config = {
  // Use environment variable if available, fallback to empty string
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
}; 