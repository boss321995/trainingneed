export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  
  if (process.client) {
    // Initialize auth when app starts (client-side only)
    await authStore.initializeAuth()
  }
})