<template>
  <div class="max-w-5xl mx-auto py-8 px-4">
    <div class="mb-4">
      <button
        @click="goBack"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        กลับ
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-start">
        <svg class="h-5 w-5 text-red-400 mt-1" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">เกิดข้อผิดพลาด</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="record" class="space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">{{ record.course_title || 'รายละเอียดคำขอฝึกอบรม' }}</h1>
            <p class="text-sm text-gray-500 mt-1">คำขอเลขที่ #{{ record.id }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold" :class="statusClasses">
              {{ record.status || 'ไม่ระบุสถานะ' }}
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {{ record.quarter || 'ไม่ระบุไตรมาส' }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex flex-col gap-3 mb-4">
          <h2 class="text-lg font-semibold text-gray-900">หลักสูตรที่เกี่ยวข้อง</h2>
          <p class="text-sm text-gray-500">ข้อมูลหลักสูตร 2 รายการ ตามคำขอและหลักสูตรที่เลือกจากฐานข้อมูล</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">หลักสูตรจากฐานข้อมูล</h3>
            <div v-if="selectedCourseLoading" class="flex items-center text-blue-600 text-sm">
              <svg class="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              กำลังโหลดข้อมูลหลักสูตร...
            </div>
            <div v-else-if="selectedCourse" class="space-y-2 text-sm text-gray-700">
              <p class="text-base font-medium text-gray-900">{{ selectedCourseSummary.title || 'ไม่ระบุชื่อหลักสูตร' }}</p>
              <dl class="space-y-2">
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">รหัสหลักสูตร</dt>
                  <dd class="font-medium text-gray-900">{{ selectedCourseSummary.code || 'ไม่ระบุ' }}</dd>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">แพ็กเกจ</dt>
                  <dd class="font-medium text-gray-900">
                    <span v-if="selectedCourseSummary.packageName">{{ selectedCourseSummary.packageName }}</span>
                    <span v-else>ไม่ระบุ</span>
                    <span v-if="selectedCourseSummary.packageCode" class="block text-xs text-gray-500">({{ selectedCourseSummary.packageCode }})</span>
                  </dd>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">ระยะเวลา</dt>
                  <dd class="font-medium text-gray-900">{{ selectedCourseSummary.duration || '-' }}</dd>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">จำนวนผู้เรียนสูงสุด</dt>
                  <dd class="font-medium text-gray-900">{{ selectedCourseSummary.maxParticipants || '-' }}</dd>
                </div>
              </dl>
            </div>
            <div v-else class="text-sm text-gray-500">
              ไม่พบข้อมูลหลักสูตรที่เลือกจากฐานข้อมูล
            </div>
          </div>
          <div class="border border-gray-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">หลักสูตรที่เสนอขอ</h3>
            <div class="space-y-2 text-sm text-gray-700">
              <p class="text-base font-medium text-gray-900">{{ primaryCourse.title || 'ไม่ระบุชื่อหลักสูตร' }}</p>
              <dl class="space-y-2">
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">ประเภทหลักสูตร</dt>
                  <dd class="font-medium text-gray-900">{{ primaryCourse.type || 'ไม่ระบุ' }}</dd>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">แพ็กเกจ (ถ้ามี)</dt>
                  <dd class="font-medium text-gray-900">{{ record.selected_package_code || '-' }}</dd>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">ไตรมาสที่เสนอ</dt>
                  <dd class="font-medium text-gray-900">{{ primaryCourse.quarter || 'ไม่ระบุ' }}</dd>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-gray-500">จำนวนผู้เข้าร่วม</dt>
                  <dd class="font-medium text-gray-900">{{ primaryCourse.participants || '-' }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <div class="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">หลักสูตรที่ขอมาทั้งหมดของส่วนงานนี้</h2>
            <p class="text-sm text-gray-500">รวมทุกคำขอที่ส่งจากส่วนงานเดียวกัน เรียงจากรายการล่าสุด</p>
          </div>
          <div v-if="relatedCourses.length" class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <span class="h-2 w-2 rounded-full bg-blue-500"></span>
            ทั้งหมด {{ relatedCourses.length }} หลักสูตร
          </div>
        </div>

        <div v-if="relatedLoading" class="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          กำลังโหลดรายการหลักสูตรทั้งหมด...
        </div>
        <div v-else-if="relatedError" class="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ relatedError }}
        </div>
        <div v-else-if="relatedCourses.length === 0" class="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
          ยังไม่มีคำขออื่นในส่วนงานนี้
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อหลักสูตร</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">แพ็กเกจ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ไตรมาส</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนผู้เข้าร่วม</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ส่งคำขอ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="course in relatedCourses"
                :key="`related-${course.id}`"
                :class="[
                  'hover:bg-blue-50 transition',
                  currentRecordId !== null && Number(course.id) === currentRecordId ? 'bg-blue-50/70 border-l-4 border-blue-400' : ''
                ]"
              >
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ course.course_title || '-' }}
                  <div class="mt-1 text-xs text-gray-500">
                    {{ course.department || record.department || 'ไม่ระบุฝ่าย' }} · {{ course.section || record.section || 'ไม่ระบุส่วนงาน' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span v-if="course.selected_package_code" class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                    {{ course.selected_package_code }}
                  </span>
                  <span v-else class="text-xs text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span class="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                    {{ course.quarter || '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatParticipantCount(course.participants) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(course.created_at || course.updated_at) }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
                    :class="getStatusBadgeClass(course.status)"
                  >
                    {{ course.status || 'ไม่ระบุ' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm">
                  <NuxtLink
                    :to="`/reports/${course.id}`"
                    class="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:text-blue-700"
                  >
                    ดูรายละเอียด
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">ข้อมูลคำขอ</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="field in detailFields"
            :key="field.label"
            class="flex flex-col"
          >
            <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">{{ field.label }}</span>
            <span class="text-sm text-gray-900 mt-1">{{ field.value || '-' }}</span>
            <span
              v-if="field.hint"
              class="text-xs text-gray-500 mt-0.5"
            >
              {{ field.hint }}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">รายละเอียดคำขอเพิ่มเติม</h2>
        <div
          v-for="section in longTextSections"
          :key="section.label"
          class="mb-4 last:mb-0"
        >
          <h3 class="text-sm font-medium text-gray-700 mb-2">{{ section.label }}</h3>
          <p class="text-sm leading-6 text-gray-800 whitespace-pre-line bg-gray-50 border border-gray-100 rounded-lg p-4">
            {{ formatLongText(section.value) }}
          </p>
        </div>
      </div>

        <div v-if="jobLevels.length > 0" class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">ระดับตำแหน่งที่เกี่ยวข้อง</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="level in jobLevels"
              :key="level"
              class="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
            >
              {{ level }}
            </span>
          </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute, useHead } from '#app'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref(null)
const record = ref(null)
const selectedCourse = ref(null)
const selectedCourseLoading = ref(false)
const relatedCourses = ref([])
const relatedLoading = ref(false)
const relatedError = ref(null)

const pageTitle = computed(() => {
  if (record.value?.course_title) {
    return `${record.value.course_title} - รายละเอียดคำขอฝึกอบรม`
  }
  return 'รายละเอียดคำขอฝึกอบรม'
})

useHead(() => ({
  title: pageTitle.value
}))

const ALLOWED_SECTION_CODES = ['0010332601']
const currentUser = computed(() => authStore.user)
const requestId = computed(() => route.params.id)

const extractDigits = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).replace(/[^0-9]/g, '')
}

const sectionDigits = computed(() => {
  const user = currentUser.value
  if (!user) return ''
  const candidates = [
    user.section_full_code,
    user.sectionCodeFull,
    user.section_code,
    user.sectionCode,
    user.section
  ]

  for (const candidate of candidates) {
    const digits = extractDigits(candidate)
    if (digits) {
      return digits
    }
  }

  return ''
})

const isAuthorized = computed(() => {
  if (!currentUser.value) return false
  if (currentUser.value.role === 'hrd_admin') return true
  const digits = sectionDigits.value
  if (!digits) return false
  return ALLOWED_SECTION_CODES.some(code => digits.includes(code))
})

const ensureAuth = async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isValid = await authStore.validateToken({ keepStateOnError: true })
  return isValid && authStore.isAuthenticated
}

const statusClasses = computed(() => {
  const status = (record.value?.status || '').toLowerCase()
  if (['approved', 'completed', 'อนุมัติ', 'เสร็จสิ้น'].includes(status)) {
    return 'bg-green-100 text-green-700'
  }
  if (['rejected', 'cancelled', 'ปฏิเสธ', 'ยกเลิก'].includes(status)) {
    return 'bg-red-100 text-red-700'
  }
  if (['submitted', 'pending', 'รอดำเนินการ'].includes(status)) {
    return 'bg-yellow-100 text-yellow-700'
  }
  return 'bg-gray-100 text-gray-700'
})

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).trim()
}

const extractSectionPrefix = (value) => {
  const raw = normalizeValue(value)
  if (!raw) {
    return ''
  }
  const digits = raw.replace(/[^0-9]/g, '')
  if (digits.length >= 4) {
    return digits.slice(0, 4)
  }
  return raw.slice(0, 4)
}

const formatParticipantCount = (value) => {
  const count = Number(value)
  if (!Number.isFinite(count) || count <= 0) {
    return '-'
  }
  return `${count} คน`
}

const getStatusBadgeClass = (value) => {
  const normalized = normalizeValue(value).toLowerCase()
  if (!normalized) {
    return 'bg-gray-100 text-gray-600'
  }
  if (['approved', 'completed', 'อนุมัติ', 'เสร็จสิ้น'].includes(normalized)) {
    return 'bg-green-100 text-green-700'
  }
  if (['submitted', 'pending', 'รอดำเนินการ'].includes(normalized)) {
    return 'bg-yellow-100 text-yellow-700'
  }
  if (['rejected', 'cancelled', 'ปฏิเสธ', 'ยกเลิก'].includes(normalized)) {
    return 'bg-red-100 text-red-700'
  }
  return 'bg-gray-100 text-gray-600'
}

const participantsLabel = computed(() => {
  return formatParticipantCount(record.value?.participants)
})

const primaryCourse = computed(() => {
  return {
    title: record.value?.course_title || '',
    type: record.value?.course_types || record.value?.course_type || '',
    quarter: record.value?.quarter || '',
    participants: participantsLabel.value
  }
})

const currentRecordId = computed(() => {
  const rawId = Number(record.value?.id)
  return Number.isFinite(rawId) ? rawId : null
})

const selectedCourseSummary = computed(() => {
  if (!selectedCourse.value) {
    return {
      title: '',
      code: '',
      packageName: '',
      packageCode: '',
      duration: '',
      maxParticipants: ''
    }
  }

  return {
    title: selectedCourse.value.course_title || '',
    code: selectedCourse.value.course_code || '',
    packageName: selectedCourse.value.package_name || '',
    packageCode: selectedCourse.value.package_code || '',
    duration: selectedCourse.value.duration || selectedCourse.value.duration_hours || '',
    maxParticipants: selectedCourse.value.max_participants || ''
  }
})

const jobLevels = computed(() => {
  const raw = record.value?.job_levels
  if (!raw) return []
  try {
    if (Array.isArray(raw)) {
      return raw
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    return []
  }
})

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const detailFields = computed(() => {
  const rec = record.value || {}
  return [
    { label: 'ผู้ร้องขอ', value: rec.employee_name || rec.requested_by || '-' },
    { label: 'รหัสพนักงาน', value: rec.employee_id || '-' },
    {
      label: 'สายงาน',
      value: rec.group_name || rec.group_full_name || rec.department_group || 'ไม่ระบุ',
      hint: rec.group_full_name && rec.group_full_name !== rec.group_name ? rec.group_full_name : null
    },
    {
      label: 'ฝ่ายสังกัด',
      value: rec.department || rec.department_short || 'ไม่ระบุ',
      hint: rec.department_full_name && rec.department_full_name !== rec.department ? rec.department_full_name : null
    },
    {
      label: 'ส่วนสังกัด',
      value: rec.section || rec.section_short || rec.section_code || 'ไม่ระบุ',
      hint: rec.section_full_name && rec.section_full_name !== rec.section ? rec.section_full_name : null
    },
    { label: 'จำนวนผู้เข้าร่วม', value: participantsLabel.value },
    { label: 'วันที่ส่งคำขอ', value: formatDate(rec.created_at) },
    { label: 'ปรับปรุงล่าสุด', value: formatDate(rec.updated_at) },
    { label: 'ประเภทหลักสูตร', value: rec.course_types || rec.course_type || '-' },
    { label: 'รหัสแพ็กเกจ (ถ้ามี)', value: rec.selected_package_code || '-' }
  ]
})

const longTextSections = computed(() => {
  const rec = record.value || {}
  return [
    { label: 'วัตถุประสงค์การฝึกอบรม', value: rec.training_objective || '' },
    { label: 'ผลที่คาดหวัง', value: rec.expected_outcome || '' },
    { label: 'ข้อมูลเพิ่มเติม', value: rec.free_text || '' }
  ]
})

const formatLongText = (value) => {
  if (value === null || value === undefined) {
    return '—'
  }
  const text = String(value).trim()
  return text === '' ? '—' : text
}

const fetchSelectedCourse = async (options = {}) => {
  const { skipAuthCheck = false } = options
  selectedCourse.value = null

  const rawId = record.value?.selected_course_id
  const numericId = Number(rawId)

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return
  }

  try {
    selectedCourseLoading.value = true
    const sessionOk = skipAuthCheck ? true : await ensureAuth()
    if (!sessionOk) {
      selectedCourse.value = null
      return
    }

    const response = await fetch(`http://localhost:4001/api/courses/courses/${numericId}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`ไม่สามารถโหลดข้อมูลหลักสูตร (${response.status})`)
    }

    const payload = await response.json().catch(() => null)
    selectedCourse.value = payload || null
  } catch (err) {
    console.error('Failed to fetch selected course detail:', err)
    selectedCourse.value = null
  } finally {
    selectedCourseLoading.value = false
  }
}

const fetchRelatedCourses = async (baseRecord, options = {}) => {
  const { skipAuthCheck = false } = options

  if (!baseRecord) {
    relatedCourses.value = []
    relatedError.value = null
    return
  }

  try {
    relatedLoading.value = true
    relatedError.value = null

    if (!skipAuthCheck) {
      const sessionOk = await ensureAuth()
      if (!sessionOk) {
        relatedCourses.value = []
        relatedError.value = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'
        return
      }
    }

    const params = new URLSearchParams()
    const department = normalizeValue(baseRecord.department)
    if (department) {
      params.append('department', department)
    }

    const url = params.toString()
      ? `http://localhost:4001/api/reports?${params.toString()}`
      : 'http://localhost:4001/api/reports'

    const response = await fetch(url, {
      credentials: 'include'
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถโหลดรายการคำขอได้`
      throw new Error(message)
    }

    const rawItems = Array.isArray(payload?.rawItems) ? payload.rawItems : []
    const baseSectionCode = normalizeValue(baseRecord.section_code || baseRecord.section)
    const basePrefix = extractSectionPrefix(baseSectionCode)

    const matchesSection = (item) => {
      const candidateCode = normalizeValue(item.section_code || item.section || item.employee_section_code)
      if (!candidateCode) {
        return false
      }
      const candidatePrefix = extractSectionPrefix(candidateCode)
      if (basePrefix && candidatePrefix && candidatePrefix === basePrefix) {
        return true
      }
      return baseSectionCode && candidateCode === baseSectionCode
    }

    const uniqueMap = new Map()
    rawItems.forEach(item => {
      const key = normalizeValue(item.id)
      if (!key) {
        return
      }
      if (matchesSection(item)) {
        uniqueMap.set(key, item)
      }
    })

    if (uniqueMap.size === 0) {
      rawItems.forEach(item => {
        const key = normalizeValue(item.id)
        if (!key) {
          return
        }
        uniqueMap.set(key, item)
      })
    }

    const baseKey = normalizeValue(baseRecord.id)
    if (baseKey && !uniqueMap.has(baseKey)) {
      uniqueMap.set(baseKey, baseRecord)
    }

    const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0)
      const dateB = new Date(b.created_at || b.updated_at || 0)
      return dateB - dateA
    })

    relatedCourses.value = sorted
  } catch (err) {
    console.error('Failed to fetch related courses:', err)
    relatedError.value = err.message || 'เกิดข้อผิดพลาดในการโหลดหลักสูตรที่เกี่ยวข้อง'
    relatedCourses.value = []
  } finally {
    relatedLoading.value = false
  }
}

const fetchDetail = async () => {
  const sessionOk = await ensureAuth()

  if (!sessionOk) {
    error.value = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง'
    loading.value = false
    await router.replace({
      path: '/login',
      query: {
        reason: 'expired',
        redirect: route.fullPath
      }
    })
    return
  }

  if (!currentUser.value) {
    error.value = 'ไม่พบข้อมูลผู้ใช้งาน'
    loading.value = false
    return
  }

  if (!isAuthorized.value) {
    error.value = 'คุณไม่มีสิทธิ์เข้าถึงรายละเอียดคำขอนี้'
    loading.value = false
    return
  }

  const id = requestId.value
  if (!id) {
    error.value = 'ไม่พบรหัสคำขอ'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null
    relatedCourses.value = []
    relatedError.value = null

    const response = await fetch(`http://localhost:4001/api/training-needs/${id}`, {
      credentials: 'include'
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถโหลดรายละเอียดได้`
      throw new Error(message)
    }

    record.value = payload
    await Promise.all([
      fetchSelectedCourse({ skipAuthCheck: true }),
      fetchRelatedCourses(payload, { skipAuthCheck: true })
    ])

    const enrichedRecord = relatedCourses.value.find(item => normalizeValue(item.id) === normalizeValue(payload.id))
    if (enrichedRecord) {
      record.value = { ...payload, ...enrichedRecord }
    }
  } catch (err) {
    console.error('Failed to fetch training need detail:', err)
    error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(fetchDetail)

watch(requestId, (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    fetchDetail()
  }
})

watch(() => record.value?.selected_course_id, () => {
  if (!loading.value) {
    fetchSelectedCourse({ skipAuthCheck: true })
  }
})

watch(
  () => [record.value?.section_code, record.value?.section, record.value?.department],
  (newVal, oldVal) => {
    if (!loading.value && record.value) {
      if (!oldVal || newVal.some((value, index) => value !== oldVal[index])) {
        fetchRelatedCourses(record.value, { skipAuthCheck: true })
      }
    }
  }
)
</script>
