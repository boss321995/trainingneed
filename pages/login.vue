<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          เข้าสู่ระบบ Training Need
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          กรอกรหัสพนักงานหรือ JWT token จากระบบ HRD
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="token" class="block text-sm font-medium text-gray-700">
            รหัสพนักงาน / JWT Token
          </label>
          <input
            id="token"
            v-model="token"
            type="text"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="เช่น 01000062 หรือ token-1000062"
          />
        </div>
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </div>
        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>
        
       
      </form>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'guest'
})

const authStore = useAuthStore()
const route = useRoute()
const token = ref('')
const loading = ref(false)
const error = ref('')

const unauthorizedMessage = 'อนุญาตเฉพาะผู้จัดการส่วนหรือพนักงานที่ได้รับมอบหมายเท่านั้น กรุณาติดต่อผู้จัดการส่วนของคุณเพื่อขอสิทธิ์'

const applyRouteReason = () => {
  const reason = route.query.reason

  if (Array.isArray(reason)) {
    error.value = reason[0] === 'unauthorized' ? unauthorizedMessage : ''
    return
  }

  if (reason === 'unauthorized') {
    error.value = unauthorizedMessage
  } else if (reason === 'expired') {
    error.value = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง'
  }
}

watch(() => route.query.reason, applyRouteReason, { immediate: true })

const handleAccessDenied = (message) => {
  error.value = message || unauthorizedMessage
  authStore.logout()
  loading.value = false
}

const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // Call the login endpoint to get a proper JWT token
    const response = await fetch('http://localhost:4001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        employeeId: token.value,
        password: 'dummy'
      })
    })

    const data = await response.json()

    if (response.ok && data?.ok && data.user) {
      authStore.setToken('session')
      authStore.setUser(data.user)

      const isValid = await authStore.validateToken({ keepStateOnError: true })

      if (!isValid) {
        handleAccessDenied('ไม่สามารถตรวจสอบสิทธิ์การเข้าใช้งานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง')
        return
      }

      authStore.isInitialized = true

      await nextTick()
      await navigateTo('/', { replace: true })
    } else {
      error.value = data.error || 'รหัสพนักงานไม่ถูกต้องหรือไม่พบในระบบ'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>
