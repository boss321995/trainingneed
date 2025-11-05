export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  if (!authStore.hasRole('hrd_admin')) {
    return navigateTo('/')
  }
})
