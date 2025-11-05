<template>
  <div class="max-w-3xl mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        {{ isManager ? 'จัดทำแผนการขอฝึกอบรมประจำปี' : 'กรอกข้อมูลความต้องการฝึกอบรม' }}
      </h1>
      <p class="text-gray-600">
        {{ isManager ? 
           'กำหนดหัวข้อและแนวทางการฝึกอบรมสำหรับผู้ใต้บังคับบัญชาในส่วนงานของท่าน' : 
           'บันทึกความต้องการในการฝึกอบรมตามที่ผู้บังคับบัญชากำหนด' }}
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- ระดับปฏิบัติงาน -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <label class="block text-lg font-medium text-gray-700 mb-4">ระดับปฏิบัติงานที่ต้องการฝึกอบรม</label>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            v-for="level in jobLevels" 
            :key="level.id"
            class="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            @click="toggleJobLevel(level.id)"
          >
            <input
              :id="`job_level_${level.id}`"
              v-model="form.job_levels"
              :value="level.id"
              type="checkbox"
              class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded pointer-events-none"
            />
            <div class="flex-1">
              <label :for="`job_level_${level.id}`" class="text-sm font-medium text-gray-700 cursor-pointer">
                {{ level.level_name }}
              </label>
              <p class="text-xs text-gray-500 mt-1">{{ level.description }}</p>
            </div>
          </div>
        </div>
        <p class="mt-3 text-sm text-gray-500">
          เลือกระดับปฏิบัติงานที่ต้องการให้เข้ารับการฝึกอบรม (สามารถเลือกได้หลายระดับ)
        </p>
      </div>

      <!-- เลือกแพ็คเกจหลักสูตร -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <label class="block text-lg font-medium text-gray-700 mb-4">เลือกแพ็คเกจหลักสูตร</label>
        
        <!-- Search Box -->
        <div class="relative mb-4">
          <input
            v-model="packageSearchQuery"
            @input="searchPackages"
            @focus="showPackageDropdown = true"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ค้นหาแพ็คเกจหลักสูตร เช่น บริหารจัดการ, ดิจิทัล, กฎหมาย..."
          />
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <!-- Package Dropdown -->
        <div 
          v-if="showPackageDropdown && (packageSearchResults.length > 0 || packageSearchQuery)"
          class="relative border border-gray-300 rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg z-10"
        >
          <div v-if="packageSearchResults.length === 0 && packageSearchQuery" class="px-4 py-3 text-gray-500">
            ไม่พบแพ็คเกจที่ตรงกับการค้นหา
          </div>
          <div
            v-for="pkg in packageSearchResults"
            :key="pkg.package_code"
            @click="selectPackage(pkg)"
            class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <div class="font-medium text-gray-900">{{ pkg.package_name }}</div>
            <div class="text-sm text-gray-500">รหัส: {{ pkg.package_code }}</div>
          </div>
        </div>

        <!-- Selected Package -->
        <div v-if="selectedPackage" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start justify-between">
            <div>
              <h4 class="font-medium text-blue-900">{{ selectedPackage.package_name }}</h4>
              <p class="text-sm text-blue-700">รหัส: {{ selectedPackage.package_code }}</p>
            </div>
            <button
              type="button"
              @click="clearPackageSelection"
              class="text-blue-600 hover:text-blue-800"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- เลือกหลักสูตร -->
      <div v-if="selectedPackage" class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <label class="block text-lg font-medium text-gray-700">เลือกหลักสูตร</label>
          <span class="text-sm text-gray-500">จากแพ็คเกจ: {{ selectedPackage.package_name }}</span>
        </div>

        <!-- Course Search -->
        <div class="relative mb-4">
          <input
            v-model="courseSearchQuery"
            @input="searchCourses"
            @focus="showCourseDropdown = true"
            type="text"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="ค้นหาหลักสูตรในแพ็คเกจนี้..."
          />
        </div>

        <!-- Course Dropdown -->
        <div 
          v-if="showCourseDropdown && (courseSearchResults.length > 0 || courseSearchQuery)"
          class="relative border border-gray-300 rounded-lg max-h-60 overflow-y-auto bg-white shadow-lg z-10"
        >
          <div v-if="courseSearchResults.length === 0 && courseSearchQuery" class="px-4 py-3 text-gray-500">
            ไม่พบหลักสูตรที่ตรงกับการค้นหา
          </div>
          <div
            v-for="course in courseSearchResults"
            :key="course.id"
            @click="selectCourse(course)"
            class="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          >
            <div class="font-medium text-gray-900">{{ course.course_title }}</div>
            <div class="text-sm text-gray-500">
              รหัส: {{ course.course_code }} | ระยะเวลา: {{ course.duration || 'ไม่ระบุ' }} | ระดับ: {{ course.level }}
            </div>
          </div>
        </div>

        <!-- Selected Course -->
        <div v-if="selectedCourse" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="font-medium text-green-900">{{ selectedCourse.course_title }}</h4>
              <div class="text-sm text-green-700 mt-1 space-y-1">
                <p>รหัส: {{ selectedCourse.course_code }}</p>
                <p v-if="selectedCourse.duration">ระยะเวลา: {{ selectedCourse.duration }}</p>
                <p>ระดับ: {{ selectedCourse.level }}</p>
                <p>ประเภท: {{ selectedCourse.training_type }}</p>
              </div>
            </div>
            <button
              type="button"
              @click="clearCourseSelection"
              class="text-green-600 hover:text-green-800 ml-4"
            >
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ข้อมูลเพิ่มเติม -->
      <div v-if="selectedCourse" class="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        <h3 class="text-lg font-medium text-gray-700">ข้อมูลเพิ่มเติม</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ไตรมาสที่ต้องการฝึกอบรม</label>
            <select
              v-model="form.quarter"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">เลือกไตรมาส</option>
              <option value="Q1">Q1 (มกราคม - มีนาคม)</option>
              <option value="Q2">Q2 (เมษายน - มิถุนายน)</option>
              <option value="Q3">Q3 (กรกฎาคม - กันยายน)</option>
              <option value="Q4">Q4 (ตุลาคม - ธันวาคม)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">จำนวนผู้เข้าอบรม</label>
            <input
              v-model.number="form.participants"
              type="number"
              min="1"
              max="200"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="จำนวนคน"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">วัตถุประสงค์การฝึกอบรม</label>
          <textarea
            v-model="form.training_objective"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="อธิบายวัตถุประสงค์และความจำเป็นในการฝึกอบรม..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">ผลลัพธ์ที่คาดหวัง</label>
          <textarea
            v-model="form.expected_outcome"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="อธิบายผลลัพธ์ที่คาดหวังจากการฝึกอบรม..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">หมายเหตุเพิ่มเติม</label>
          <textarea
            v-model="form.free_text"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="ข้อมูลเพิ่มเติม เช่น ข้อกำหนดพิเศษ, ความต้องการด้านเวลา..."
          ></textarea>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          @click="$router.go(-1)"
          class="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          :disabled="!canSubmit || submitting"
          class="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'กำลังส่ง...' : 'ส่งคำขอ' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
const isManager = ref(false) // TODO: ตรวจสอบจากระบบ authentication

const form = reactive({
  job_levels: [],
  quarter: '',
  participants: 1,
  training_objective: '',
  expected_outcome: '',
  free_text: ''
})

const jobLevels = ref([])
const packageSearchQuery = ref('')
const courseSearchQuery = ref('')
const packageSearchResults = ref([])
const courseSearchResults = ref([])
const selectedPackage = ref(null)
const selectedCourse = ref(null)
const showPackageDropdown = ref(false)
const showCourseDropdown = ref(false)
const submitting = ref(false)

// Computed
const canSubmit = computed(() => {
  return form.job_levels.length > 0 && 
         selectedCourse.value && 
         form.quarter && 
         form.participants > 0
})

// Methods
const toggleJobLevel = (levelId) => {
  const index = form.job_levels.indexOf(levelId)
  if (index > -1) {
    form.job_levels.splice(index, 1)
  } else {
    form.job_levels.push(levelId)
  }
  // เมื่อเปลี่ยนระดับ ให้รีเซ็ตการเลือกแพ็คเกจ
  if (selectedPackage.value) {
    searchPackages()
  }
}

const searchPackages = async () => {
  if (form.job_levels.length === 0) {
    packageSearchResults.value = []
    return
  }
  
  try {
    const params = new URLSearchParams()
    if (packageSearchQuery.value) {
      params.append('q', packageSearchQuery.value)
    }
    params.append('job_level_ids', form.job_levels.join(','))
    
    const response = await fetch(`http://localhost:4001/api/courses/packages/search?${params}`)
    const data = await response.json()
    packageSearchResults.value = data
  } catch (error) {
    console.error('Error searching packages:', error)
    packageSearchResults.value = []
  }
}

const selectPackage = (pkg) => {
  selectedPackage.value = pkg
  packageSearchQuery.value = pkg.package_name
  showPackageDropdown.value = false
  // รีเซ็ตการเลือกหลักสูตร
  selectedCourse.value = null
  courseSearchQuery.value = ''
  // โหลดหลักสูตรในแพ็คเกจ
  searchCourses()
}

const clearPackageSelection = () => {
  selectedPackage.value = null
  packageSearchQuery.value = ''
  selectedCourse.value = null
  courseSearchQuery.value = ''
  packageSearchResults.value = []
  courseSearchResults.value = []
}

const searchCourses = async () => {
  if (!selectedPackage.value) return
  
  try {
    const params = new URLSearchParams()
    params.append('package_code', selectedPackage.value.package_code)
    if (courseSearchQuery.value) {
      params.append('q', courseSearchQuery.value)
    }
    
    const response = await fetch(`http://localhost:4001/api/courses/courses/search?${params}`)
    const data = await response.json()
    courseSearchResults.value = data
  } catch (error) {
    console.error('Error searching courses:', error)
    courseSearchResults.value = []
  }
}

const selectCourse = (course) => {
  selectedCourse.value = course
  courseSearchQuery.value = course.course_title
  showCourseDropdown.value = false
}

const clearCourseSelection = () => {
  selectedCourse.value = null
  courseSearchQuery.value = ''
  courseSearchResults.value = []
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  
  try {
    // TODO: ดึงข้อมูลผู้ใช้จาก auth store
    const userData = {
      id: '14101074',
      fullname: 'นาย พงษ์ศักดิ์ เอี่ยมประไพ',
      section: 'ส่วนวางแผนพัฒนาบุคลากร',
      department: 'สถาบันวิชาการ',
      position: 'ผู้จัดการส่วน 10'
    }
    
    const submitData = {
      employee_id: userData.id,
      employee_name: userData.fullname,
      department: userData.department,
      section: userData.section,
      position: userData.position,
      job_levels: JSON.stringify(form.job_levels),
      selected_package_code: selectedPackage.value.package_code,
      selected_course_id: selectedCourse.value.id,
      course_title: selectedCourse.value.course_title,
      quarter: form.quarter,
      participants: form.participants,
      training_objective: form.training_objective,
      expected_outcome: form.expected_outcome,
      free_text: form.free_text,
      course_types: `แพ็คเกจ: ${selectedPackage.value.package_name}`, // เก็บข้อมูลเก่าไว้
      requested_by: userData.fullname
    }
    
    const response = await fetch('http://localhost:4001/api/training-needs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(submitData)
    })
    
    if (response.ok) {
      // สำเร็จ - กลับไปหน้าหลัก
      await navigateTo('/')
    } else {
      const error = await response.json()
      throw new Error(error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล')
    }
  } catch (error) {
    console.error('Submit error:', error)
    alert('เกิดข้อผิดพลาด: ' + error.message)
  } finally {
    submitting.value = false
  }
}

// Click outside handlers
const handleClickOutside = (event) => {
  if (!event.target.closest('.relative')) {
    showPackageDropdown.value = false
    showCourseDropdown.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // โหลดระดับงาน
  try {
    const response = await fetch('http://localhost:4001/api/courses/job-levels')
    jobLevels.value = await response.json()
  } catch (error) {
    console.error('Error loading job levels:', error)
  }
  
  // เพิ่ม event listener สำหรับคลิกนอก dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Set page title
useHead({
  title: 'เพิ่มความต้องการฝึกอบรม - ระบบจัดการความต้องการฝึกอบรม'
})
</script>

<style scoped>
/* เพิ่ม transition สำหรับ dropdown */
.relative {
  transition: all 0.2s ease;
}
</style>