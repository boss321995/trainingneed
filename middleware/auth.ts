export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized || authStore.isLoading) {
    await authStore.initializeAuth()
  } else if (process.client && !authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: to.path !== '/login' ? { redirect: to.fullPath } : undefined
    })
  }

  if (!authStore.canAccessApp) {
    authStore.clearClientState()
    return navigateTo({
      path: '/login',
      query: {
        reason: 'unauthorized',
        redirect: to.fullPath
      }
    })
  }
})
