export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Initialize auth if not already done
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // If already authenticated, redirect to home
  if (authStore.isAuthenticated && authStore.canAccessApp) {
    return navigateTo('/', { replace: true })
  }

  if (authStore.isAuthenticated && !authStore.canAccessApp) {
    authStore.logout()
  }
})