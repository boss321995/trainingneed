<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        {{ isManager ? 'จัดทำแผนการขอฝึกอบรมประจำปี' : 'กรอกข้อมูลความต้องการฝึกอบรม' }}
      </h1>
      <p class="text-gray-600">
        {{ isManager ? 
           'กำหนดหัวข้อและแนวทางการฝึกอบรมสำหรับผู้ใต้บังคับบัญชาในส่วนงานของท่าน เช่น งานช่างสายตอนนอก งานธุรการ หรือทักษะเฉพาะอื่นๆ' : 
           'บันทึกความต้องการในการฝึกอบรมตามที่ผู้บังคับบัญชากำหนด' }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-3">ประเภทการฝึกอบรม (เลือกได้หลายประเภท)</label>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="flex items-center">
            <input
              id="technical_electrical"
              v-model="form.course_types"
              value="technical_electrical"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="technical_electrical" class="ml-2 text-sm text-gray-700">
              ⚡ งานช่างสายตอนนอก
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="technical_maintenance"
              v-model="form.course_types"
              value="technical_maintenance"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="technical_maintenance" class="ml-2 text-sm text-gray-700">
              🔧 งานช่างซ่อมบำรุง
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="administrative"
              v-model="form.course_types"
              value="administrative"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="administrative" class="ml-2 text-sm text-gray-700">
              📋 งานธุรการ
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="financial"
              v-model="form.course_types"
              value="financial"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="financial" class="ml-2 text-sm text-gray-700">
              💰 งานการเงินและบัญชี
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="safety"
              v-model="form.course_types"
              value="safety"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="safety" class="ml-2 text-sm text-gray-700">
              🦺 ความปลอดภัยในการทำงาน
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="leadership"
              v-model="form.course_types"
              value="leadership"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="leadership" class="ml-2 text-sm text-gray-700">
              👑 ภาวะผู้นำและการจัดการ
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="soft_skills"
              v-model="form.course_types"
              value="soft_skills"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="soft_skills" class="ml-2 text-sm text-gray-700">
              💬 ทักษะการสื่อสาร
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="compliance"
              v-model="form.course_types"
              value="compliance"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="compliance" class="ml-2 text-sm text-gray-700">
              📜 กฎระเบียบและข้อบังคับ
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="customer_service"
              v-model="form.course_types"
              value="customer_service"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="customer_service" class="ml-2 text-sm text-gray-700">
              🤝 การบริการลูกค้า
            </label>
          </div>
          <div class="flex items-center">
            <input
              id="digital_literacy"
              v-model="form.course_types"
              value="digital_literacy"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="digital_literacy" class="ml-2 text-sm text-gray-700">
              💻 ทักษะดิจิทัล
            </label>
          </div>
        </div>
        <p class="mt-2 text-xs text-gray-500">
          {{ isManager ? 'เลือกประเภทการฝึกอบรมที่ต้องการให้ผู้ใต้บังคับบัญชาได้รับ' : 'เลือกประเภทการฝึกอบรมที่เกี่ยวข้องกับงานของท่าน' }}
        </p>
      </div>

      <div>
        <div class="flex items-center justify-between mb-3">
          <label class="block text-sm font-medium text-gray-700">หัวข้อ/ชื่อหลักสูตร</label>
          <button
            type="button"
            @click="addCourse"
            class="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            ➕ เพิ่มหลักสูตร
          </button>
        </div>
        
        <div class="space-y-4">
          <div
            v-for="(course, index) in form.courses"
            :key="index"
            class="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div class="flex items-start justify-between mb-3">
              <h4 class="text-sm font-medium text-gray-700">
                หลักสูตรที่ {{ index + 1 }}
              </h4>
              <button
                v-if="form.courses.length > 1"
                type="button"
                @click="removeCourse(index)"
                class="text-red-600 hover:text-red-800 text-sm"
              >
                ❌ ลบ
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">ชื่อหลักสูตร</label>
                <input
                  v-model="course.title"
                  type="text"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="เช่น การใช้งานอุปกรณ์วัดค่าไฟฟ้า, การจัดทำรายงานการเงิน"
                />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">จำนวนผู้เข้าอบรม</label>
                <input
                  v-model.number="course.participants"
                  type="number"
                  min="1"
                  required
                  class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">ไตรมาสที่วางแผนจัดอบรม</label>
        <select
          v-model="form.quarter"
          required
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">เลือกไตรมาส</option>
          <option value="Q1">ไตรมาส 1 (มกราคม-มีนาคม)</option>
          <option value="Q2">ไตรมาส 2 (เมษายน-มิถุนายน)</option>
          <option value="Q3">ไตรมาส 3 (กรกฎาคม-กันยายน)</option>
          <option value="Q4">ไตรมาส 4 (ตุลาคม-ธันวาคม)</option>
        </select>
      </div>



      <div>
        <label class="block text-sm font-medium text-gray-700">รายละเอียดเพิ่มเติม</label>
        <textarea
          v-model="form.free_text"
          rows="4"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="ระบุวัตถุประสงค์ เป้าหมาย แนวทางการฝึกอบรม หรือข้อกำหนดพิเศษ เช่น ต้องการฝึกภาคปฏิบัติในสนาม, ต้องการวิทยากรจากภายนอก"
        ></textarea>
      </div>

      <!-- Summary Section -->
      <div v-if="form.course_types.length > 0 || form.courses.some(c => c.title)" class="bg-green-50 p-4 rounded-md">
        <h3 class="text-sm font-medium text-gray-700 mb-3">📊 สรุปแผนการฝึกอบรม</h3>
        
        <div v-if="form.course_types.length > 0" class="mb-3">
          <span class="text-xs font-medium text-gray-600">ประเภทการฝึกอบรม:</span>
          <div class="flex flex-wrap gap-2 mt-1">
            <span
              v-for="type in form.course_types"
              :key="type"
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {{ getCourseTypeLabel(type) }}
            </span>
          </div>
        </div>

        <div v-if="form.courses.some(c => c.title)" class="mb-3">
          <span class="text-xs font-medium text-gray-600">หลักสูตรทั้งหมด:</span>
          <ul class="mt-1 space-y-1">
            <li
              v-for="(course, index) in form.courses.filter(c => c.title)"
              :key="index"
              class="text-xs text-gray-700 flex justify-between"
            >
              <span>{{ index + 1 }}. {{ course.title }}</span>
              <span class="font-medium text-indigo-600">{{ course.participants }} คน</span>
            </li>
          </ul>
        </div>

        <div class="text-xs text-gray-500">
          รวม {{ form.courses.filter(c => c.title).length }} หลักสูตร |
          ผู้เข้าอบรมทั้งหมด {{ form.courses.reduce((sum, course) => sum + (course.participants || 0), 0) }} คน
        </div>
      </div>

      <div class="bg-blue-50 p-4 rounded-md">
        <h3 class="text-sm font-medium text-gray-700 mb-2">ข้อมูลผู้กรอก</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium">ชื่อ:</span> {{ user?.name || 'N/A' }}
          </div>
          <div>
            <span class="font-medium">หน่วยงาน:</span> {{ user?.department || 'N/A' }}
          </div>
          <div>
            <span class="font-medium">ตำแหน่ง:</span> {{ user?.position || 'N/A' }}
          </div>
          <div>
            <span class="font-medium">สถานะ:</span> 
            <span class="text-blue-600 font-medium">
              {{ isManager ? '🎯 ผู้จัดการส่วน - จัดทำแผน' : '📝 ผู้ได้รับมอบหมาย' }}
            </span>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ loading ? 'กำลังบันทึก...' : (isManager ? '🎯 จัดทำแผนฝึกอบรม' : '📝 บันทึกข้อมูล') }}
        </button>
      </div>

      <div v-if="error" class="text-red-600 text-sm text-center">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Check if user is a manager (Level 8 or higher)
const isManager = computed(() => {
  return user.value && user.value.level >= 8
})

const form = reactive({
  course_types: [], // เปลี่ยนเป็น array สำหรับ multiple selection
  courses: [{ title: '', participants: 1 }], // array สำหรับหลายหลักสูตร
  quarter: '',
  free_text: ''
})

const loading = ref(false)
const error = ref('')

// Functions for managing multiple courses
const addCourse = () => {
  form.courses.push({ title: '', participants: 1 })
}

const removeCourse = (index) => {
  if (form.courses.length > 1) {
    form.courses.splice(index, 1)
  }
}

// Get course type label
const getCourseTypeLabel = (type) => {
  const labels = {
    'technical_electrical': '⚡ งานช่างสายตอนนอก',
    'technical_maintenance': '🔧 งานช่างซ่อมบำรุง',
    'administrative': '📋 งานธุรการ',
    'financial': '💰 งานการเงินและบัญชี',
    'safety': '🦺 ความปลอดภัยในการทำงาน',
    'leadership': '👑 ภาวะผู้นำและการจัดการ',
    'soft_skills': '💬 ทักษะการสื่อสาร',
    'compliance': '📜 กฎระเบียบและข้อบังคับ',
    'customer_service': '🤝 การบริการลูกค้า',
    'digital_literacy': '💻 ทักษะดิจิทัล'
  }
  return labels[type] || type
}

const handleSubmit = async () => {
  // Validation
  if (form.course_types.length === 0) {
    error.value = 'กรุณาเลือกประเภทการฝึกอบรมอย่างน้อย 1 ประเภท'
    return
  }

  if (form.courses.some(course => !course.title.trim())) {
    error.value = 'กรุณากรอกชื่อหลักสูตรให้ครบทุกรายการ'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const sessionValid = await authStore.validateToken({ keepStateOnError: true })

    if (!sessionValid || !authStore.isAuthenticated) {
      error.value = 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง'
      loading.value = false
      await navigateTo('/login?reason=expired')
      return
    }

    // Submit each course as a separate training need
    const submitPromises = form.courses.map(course => {
      return fetch('http://localhost:4001/api/training-needs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: user.value?.id,
          course_type: form.course_types.join(', '), // Join multiple types
          course_title: course.title,
          quarter: form.quarter,
          participants: course.participants,
          free_text: form.free_text
        })
      })
    })

    const responses = await Promise.all(submitPromises)
    const results = await Promise.all(responses.map(res => res.json()))

    const failedSubmissions = results.filter(result => !result.ok)
    
    if (failedSubmissions.length === 0) {
      await navigateTo('/')
    } else {
      error.value = `บันทึกสำเร็จ ${results.length - failedSubmissions.length}/${results.length} รายการ`
    }
  } catch (err) {
    console.error('Submit error:', err)
    error.value = 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
  } finally {
    loading.value = false
  }
}
</script>
