<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">จัดการทีมงาน</h1>
      <p class="text-gray-600">
        เลือกผู้ใต้บังคับบัญชา <strong>คนเดียว</strong> ในส่วนงานของท่านให้สามารถกรอกข้อมูลแผนการฝึกอบรมได้
      </p>
      <div class="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-amber-700">
              <strong>หมายเหตุ:</strong> สามารถมอบหมายได้เพียง 1 คนเท่านั้น ในการมอบหมายคนใหม่ จะยกเลิกการมอบหมายคนเดิมโดยอัตโนมัติ
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Members List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">ผู้ใต้บังคับบัญชาในส่วนงาน {{ user?.section || 'ของท่าน' }}</h2>
          <div class="text-sm text-gray-500">
            {{ assignedCount > 0 ? `มอบหมายแล้ว: ${assignedCount} คน` : 'ยังไม่ได้มอบหมาย' }}
          </div>
        </div>
      </div>
      
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-2 text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="error && !subordinates.length" class="p-6 text-center text-red-600">
        {{ error }}
      </div>
      
      <!-- Message display for assignment feedback -->
      <div v-if="error && subordinates.length > 0" class="p-4 mx-6 my-4 rounded-md">
        <div v-if="error.includes('⚠️') || error.includes('เกิดข้อผิดพลาด')" class="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
          {{ error }}
        </div>
        <div v-else-if="error.includes('✅')" class="bg-green-50 border border-green-200 text-green-800 p-3 rounded">
          {{ error }}
        </div>
        <div v-else-if="error.includes('❌')" class="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded">
          {{ error }}
        </div>
      </div>

      <div v-else-if="subordinates.length === 0" class="p-6 text-center text-gray-500">
        ไม่พบผู้ใต้บังคับบัญชา
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="employee in subordinates"
          :key="employee.id"
          class="p-6 hover:bg-gray-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span class="text-sm font-medium text-indigo-700">
                      {{ employee.fullname?.charAt(0) || 'N' }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ employee.fullname }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ employee.position }} | {{ employee.section }}
                  </div>
                  <div class="text-xs text-gray-400">
                    รหัส: {{ employee.id }} | Level: {{ employee.level }}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <div class="text-sm">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-800': employee.is_assigned,
                    'bg-gray-100 text-gray-800': !employee.is_assigned
                  }"
                >
                  {{ employee.is_assigned ? '✅ มอบหมายแล้ว' : '⏳ ยังไม่ได้มอบหมาย' }}
                </span>
              </div>
              
              <button
                @click="toggleAssignment(employee)"
                :disabled="assignmentLoading[employee.id] || (assignedCount >= 1 && !employee.is_assigned)"
                class="inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                :class="{
                  'border-red-300 text-red-700 bg-red-50 hover:bg-red-100': employee.is_assigned,
                  'border-indigo-300 text-indigo-700 bg-indigo-50 hover:bg-indigo-100': !employee.is_assigned && assignedCount === 0,
                  'border-gray-300 text-gray-500 bg-gray-50': !employee.is_assigned && assignedCount >= 1
                }"
                :title="assignedCount >= 1 && !employee.is_assigned ? 'สามารถมอบหมายได้เพียงคนเดียว กรุณายกเลิกการมอบหมายคนเดิมก่อน' : ''"
              >
                <span v-if="assignmentLoading[employee.id]" class="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1"></span>
                <span v-if="employee.is_assigned">
                  ❌ ยกเลิกมอบหมาย
                </span>
                <span v-else-if="assignedCount >= 1">
                  🚫 เต็มแล้ว
                </span>
                <span v-else>
                  ✅ มอบหมาย
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="error && subordinates.length > 0" class="mt-4">
      <div class="rounded-md p-4" :class="error.includes('✅') ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg v-if="error.includes('✅')" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm" :class="error.includes('✅') ? 'text-green-700' : 'text-red-700'">
              {{ error }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Card -->
    <div v-if="subordinates.length > 0" class="mt-6 rounded-lg p-4" :class="assignedCount > 0 ? 'bg-green-50' : 'bg-amber-50'">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg v-if="assignedCount > 0" class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium" :class="assignedCount > 0 ? 'text-green-800' : 'text-amber-800'">
            {{ assignedCount > 0 ? '✅ การมอบหมายเสร็จสมบูรณ์' : '⚠️ รอการมอบหมาย' }}
          </h3>
          <div class="mt-2 text-sm" :class="assignedCount > 0 ? 'text-green-700' : 'text-amber-700'">
            <p v-if="assignedCount > 0">
              ได้มอบหมายให้ <strong>{{ subordinates.find(emp => emp.is_assigned)?.fullname }}</strong> เป็นผู้กรอกข้อมูลแผนการฝึกอบรมแล้ว
            </p>
            <p v-else>
              กรุณาเลือกผู้ใต้บังคับบัญชา 1 คน เพื่อให้เป็นผู้กรอกข้อมูลแผนการฝึกอบรมสำหรับส่วนงาน
            </p>
            <p class="mt-1 text-xs">
              ทั้งหมด: {{ subordinates.length }} คน | สามารถมอบหมายได้: {{ 1 - assignedCount }} คน
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Back Button -->
    <div class="mt-8">
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        ← กลับหน้าหล้ก
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const accessRole = computed(() => authStore.accessRole)

// Check if user is a manager
const isManager = computed(() => {
  return accessRole.value === 'manager'
})

// Redirect if not a manager
onMounted(async () => {
  // Make sure auth is initialized
  if (!authStore.token) {
    await authStore.initializeAuth()
  }
  
  console.log('Auth check:', {
    hasToken: !!authStore.token,
    user: user.value,
    isManager: isManager.value
  })
  
  if (!isManager.value) {
    navigateTo('/')
  } else {
    fetchSubordinates()
  }
})

const subordinates = ref([])
const loading = ref(false)
const error = ref('')
const assignmentLoading = reactive({})

// Computed properties for summary
const assignedCount = computed(() => subordinates.value.filter(emp => emp.is_assigned).length)
const unassignedCount = computed(() => subordinates.value.filter(emp => !emp.is_assigned).length)

const fetchSubordinates = async () => {
  loading.value = true
  error.value = ''

  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  if (!authStore.isAuthenticated) {
    error.value = 'ไม่พบเซสชัน กรุณาเข้าสู่ระบบใหม่'
    loading.value = false
    navigateTo('/login')
    return
  }

  const isValid = await authStore.validateToken({ keepStateOnError: true })
  if (!isValid) {
    error.value = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
    loading.value = false
    navigateTo('/login')
    return
  }

  try {
    const response = await fetch('http://localhost:4001/api/assignments/subordinates', {
      credentials: 'include'
    })

    const data = await response.json()

    if (response.ok) {
      subordinates.value = data
    } else {
      error.value = data.error || 'ไม่สามารถโหลดข้อมูลผู้ใต้บังคับบัญชาได้'
    }
  } catch (err) {
    error.value = 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
    console.error('Error fetching subordinates:', err)
  } finally {
    loading.value = false
  }
}

const toggleAssignment = async (employee) => {
  // Check if trying to assign when already has one assigned
  if (!employee.is_assigned && assignedCount.value >= 1) {
    error.value = 'สามารถมอบหมายได้เพียงคนเดียวเท่านั้น กรุณายกเลิกการมอบหมายคนเดิมก่อน'
    return
  }

  assignmentLoading[employee.id] = true
  error.value = ''

  try {
    if (!employee.is_assigned) {
      // Check if someone else is already assigned
      const alreadyAssigned = subordinates.value.find(emp => emp.is_assigned && emp.id !== employee.id)
      if (alreadyAssigned) {
        error.value = `⚠️ ไม่สามารถมอบหมายได้ เนื่องจาก ${alreadyAssigned.fullname} ได้รับมอบหมายแล้ว กรุณายกเลิกการมอบหมายเดิมก่อน`
        assignmentLoading[employee.id] = false
        return
      }
    }

    const baseUrl = 'http://localhost:4001/api/assignments/assign'
    let response

    if (employee.is_assigned) {
      response = await fetch(`${baseUrl}/${employee.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
    } else {
      response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          employeeIds: [employee.id]
        })
      })
    }

    let data = null
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    }

    if (response.ok) {
      // Update the local state
      employee.is_assigned = !employee.is_assigned
      
      // Show success message
      if (employee.is_assigned) {
        error.value = data?.message || `✅ มอบหมาย ${employee.fullname} เป็นผู้กรอกข้อมูลแผนการฝึกอบรมเรียบร้อยแล้ว`
      } else {
        error.value = data?.message || `❌ ยกเลิกการมอบหมาย ${employee.fullname} เรียบร้อยแล้ว`
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        error.value = ''
      }, 3000)
    } else {
      error.value = data?.error || 'เกิดข้อผิดพลาดในการอัปเดตการมอบหมาย'
    }
  } catch (err) {
    error.value = 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์'
    console.error('Error toggling assignment:', err)
  } finally {
    assignmentLoading[employee.id] = false
  }
}
</script>