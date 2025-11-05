<template>
  <div class="max-w-7xl mx-auto py-8 px-4">
    <!-- Back Button -->
    <div class="mb-4">
      <button 
        @click="$router.go(-1)"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        กลับ
      </button>
    </div>

    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">รายงานผลการขอจัดทำแผนฝึกอบรม</h1>
      <p class="text-gray-600">ดูรายงานและสถิติการร้องขอฝึกอบรมของส่วนงาน</p>
      <div v-if="currentUser" class="mt-2 text-sm text-blue-600">
        <p>{{ currentUser.fullname }} | {{ currentUser.section }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div v-else class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Quarter</label>
        <select
          v-model="filters.quarter"
          @change="fetchReports"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Quarters</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Department</label>
        <select
          v-model="filters.department"
          @change="fetchReports"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">All Departments</option>
          <option value="IT">IT</option>
          <option value="HR">HR</option>
          <option value="Finance">Finance</option>
          <option value="Operations">Operations</option>
        </select>
      </div>
      <div class="flex items-end">
        <button
          @click="exportCSV"
          class="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>
    </div>

    <!-- Summary Dashboard -->
    <div class="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900">Total Requests</h3>
        <p class="text-3xl font-bold text-indigo-600">{{ summary.total }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900">This Quarter</h3>
        <p class="text-3xl font-bold text-green-600">{{ summary.thisQuarter }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900">Top Course</h3>
        <p class="text-lg font-bold text-blue-600">{{ summary.topCourse }}</p>
      </div>
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-medium text-gray-900">Avg Participants</h3>
        <p class="text-3xl font-bold text-purple-600">{{ summary.avgParticipants }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.employee_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.course_title }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.course_type }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.quarter }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.participants }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.department }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['auth', 'role']
})

const authStore = useAuthStore()
const currentUser = ref(null)

const filters = reactive({
  quarter: '',
  department: ''
})

const summary = reactive({
  total: 0,
  thisQuarter: 0,
  topCourse: '',
  avgParticipants: 0
})

const items = ref([])
const loading = ref(true)
const error = ref(null)

const fetchReports = async () => {
  try {
    loading.value = true
    error.value = null

    const sessionValid = await authStore.validateToken({ keepStateOnError: true })

    if (!sessionValid || !authStore.isAuthenticated) {
      error.value = 'กรุณาเข้าสู่ระบบเพื่อดูรายงาน'
      loading.value = false
      return
    }

    const user = authStore.user
    currentUser.value = user

    const sectionCode = String(user?.section_code ?? user?.sectionCode ?? '').trim()
    if (sectionCode !== '0010332601') {
      error.value = 'คุณไม่มีสิทธิ์เข้าถึงรายงานนี้'
      return
    }

    const params = new URLSearchParams()
    if (filters.quarter) params.append('quarter', filters.quarter)
    if (filters.department) params.append('department', filters.department)
    params.append('employee_id', user.id)

    const response = await fetch(`http://localhost:4001/api/reports?${params}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ไม่สามารถโหลดรายงานได้`)
    }

    const data = await response.json()

    summary.total = data.summary?.total || 0
    summary.thisQuarter = data.summary?.thisQuarter || 0
    summary.topCourse = data.summary?.topCourse || '-'
    summary.avgParticipants = data.summary?.avgParticipants || 0
    items.value = data.items || []

  } catch (err) {
    console.error('Failed to fetch reports:', err)
    error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดรายงาน'
  } finally {
    loading.value = false
  }
}

const exportCSV = async () => {
  try {
    const params = new URLSearchParams()
    if (filters.quarter) params.append('quarter', filters.quarter)
    if (filters.department) params.append('department', filters.department)

    const response = await fetch(`http://localhost:4001/api/reports/export?${params}`, {
      credentials: 'include'
    })
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'training_needs.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export CSV:', error)
  }
}

onMounted(() => {
  fetchReports()
})
</script>
