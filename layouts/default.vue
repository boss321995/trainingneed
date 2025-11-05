<template>
  <div>
    <!-- Loading state while initializing auth -->
    <div v-if="authStore.isLoading" class="min-h-screen flex items-center justify-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
    
    <!-- Main content -->
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
})
</script>