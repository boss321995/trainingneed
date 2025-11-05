<template>
  <div class="max-w-2xl mx-auto py-8 px-4">
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

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- ระดับปฏิบัติงาน -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <label class="block text-sm font-medium text-gray-700 mb-4">ระดับปฏิบัติงานที่ต้องการฝึกอบรม</label>
        <div class="space-y-3">
          <div 
            v-for="level in jobLevels" 
            :key="level.id"
            class="flex items-center space-x-3"
          >
            <input
              :id="`job_level_${level.id}`"
              v-model="form.job_levels"
              :value="level.id"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              @change="onJobLevelChange"
            />
            <label :for="`job_level_${level.id}`" class="text-sm text-gray-700 cursor-pointer">
              <span class="font-medium">{{ level.level_name }}</span>
              <span class="text-gray-500 ml-2">{{ level.description }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- เลือกแพ็คเกจหลักสูตร -->
      <div class="bg-white border border-gray-200 rounded-lg p-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">1. เลือกแพ็คเกจหลักสูตร</label>
        <select
          v-model="selectedPackageCode"
          @change="onPackageChange"
          :disabled="form.job_levels.length === 0"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">-- เลือกแพ็คเกจหลักสูตร --</option>
          <option 
            v-for="pkg in availablePackages" 
            :key="pkg.package_code" 
            :value="pkg.package_code"
          >
            {{ pkg.package_name }} ({{ pkg.package_code }})
          </option>
        </select>
        <p class="mt-1 text-xs text-gray-500">
          {{ form.job_levels.length === 0 ? 'กรุณาเลือกระดับปฏิบัติงานก่อน' : 'เลือกประเภทหลักสูตรที่ต้องการ' }}
        </p>
      </div>

      <!-- เลือกหลักสูตร -->
      <div v-if="selectedPackageCode" class="bg-white border border-gray-200 rounded-lg p-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">2. เลือกหลักสูตรจากแพ็คเกจ</label>
        <select
          v-model="selectedCourseId"
          @change="onCourseChange"
          :disabled="!selectedPackageCode"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">-- เลือกหลักสูตร --</option>
          <option 
            v-for="course in availableCourses" 
            :key="course.id" 
            :value="course.id"
          >
            {{ course.course_title }}
          </option>
        </select>
        <p class="mt-1 text-xs text-gray-500">เลือกหลักสูตรที่ต้องการเข้ารับการฝึกอบรม</p>
        
        <!-- แสดงรายละเอียดหลักสูตร -->
        <div v-if="selectedCourse" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 class="font-medium text-gray-900 mb-2">รายละเอียดหลักสูตร</h4>
          <div class="text-sm text-gray-700 space-y-1">
            <p><strong>รหัสหลักสูตร:</strong> {{ selectedCourse.course_code }}</p>
            <p><strong>ชื่อหลักสูตร:</strong> {{ selectedCourse.course_title }}</p>
            <p v-if="selectedCourse.duration"><strong>ระยะเวลา:</strong> {{ selectedCourse.duration }}</p>
            <p><strong>ระดับ:</strong> {{ selectedCourse.level }}</p>
            <p><strong>ประเภท:</strong> {{ selectedCourse.training_type }}</p>
          </div>
        </div>
      </div>

      <!-- จำนวนผู้เข้าอบรม และไตรมาส -->
      <div v-if="selectedCourse" class="bg-white border border-gray-200 rounded-lg p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">3. จำนวนผู้เข้าอบรม</label>
            <input
              v-model.number="form.participants"
              type="number"
              min="1"
              max="200"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="จำนวนคน"
            />
            <p class="mt-1 text-xs text-gray-500">ระบุจำนวนผู้ที่ต้องการเข้ารับการฝึกอบรม</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">4. ไตรมาสที่ต้องการฝึกอบรม</label>
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
            <p class="mt-1 text-xs text-gray-500">เลือกช่วงเวลาที่ต้องการจัดการฝึกอบรม</p>
          </div>
        </div>
      </div>

      <!-- ข้อมูลเพิ่มเติม -->
      <div v-if="selectedCourse" class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-sm font-medium text-gray-700 mb-4">5. ข้อมูลเพิ่มเติม</h3>
        
        <div class="space-y-4">
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
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          @click="$router.go(-1)"
          class="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          :disabled="!canSubmit || submitting"
          class="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
  participants: 1,
  quarter: '',
  training_objective: '',
  expected_outcome: '',
  free_text: ''
})

const jobLevels = ref([])
const availablePackages = ref([])
const availableCourses = ref([])
const selectedPackageCode = ref('')
const selectedCourseId = ref('')
const selectedCourse = ref(null)
const submitting = ref(false)

// Computed
const canSubmit = computed(() => {
  return form.job_levels.length > 0 && 
         selectedCourse.value && 
         form.quarter && 
         form.participants > 0
})

// Methods
const onJobLevelChange = () => {
  // รีเซ็ตเมื่อเปลี่ยนระดับงาน
  selectedPackageCode.value = ''
  selectedCourseId.value = ''
  selectedCourse.value = null
  availablePackages.value = []
  availableCourses.value = []
  
  if (form.job_levels.length > 0) {
    loadPackages()
  }
}

const loadPackages = async () => {
  try {
    const params = new URLSearchParams()
    params.append('job_level_ids', form.job_levels.join(','))
    
    const response = await fetch(`http://localhost:4001/api/courses/packages?${params}`)
    const data = await response.json()
    availablePackages.value = data
  } catch (error) {
    console.error('Error loading packages:', error)
    availablePackages.value = []
  }
}

const onPackageChange = () => {
  // รีเซ็ตหลักสูตรเมื่อเปลี่ยนแพ็คเกจ
  selectedCourseId.value = ''
  selectedCourse.value = null
  availableCourses.value = []
  
  if (selectedPackageCode.value) {
    loadCourses()
  }
}

const loadCourses = async () => {
  try {
    const params = new URLSearchParams()
    params.append('package_code', selectedPackageCode.value)
    
    const response = await fetch(`http://localhost:4001/api/courses/courses?${params}`)
    const data = await response.json()
    availableCourses.value = data
  } catch (error) {
    console.error('Error loading courses:', error)
    availableCourses.value = []
  }
}

const onCourseChange = () => {
  if (selectedCourseId.value) {
    selectedCourse.value = availableCourses.value.find(c => c.id == selectedCourseId.value)
  } else {
    selectedCourse.value = null
  }
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
      selected_package_code: selectedPackageCode.value,
      selected_course_id: selectedCourse.value.id,
      course_title: selectedCourse.value.course_title,
      quarter: form.quarter,
      participants: form.participants,
      training_objective: form.training_objective,
      expected_outcome: form.expected_outcome,
      free_text: form.free_text,
      course_types: `ระดับ: ${form.job_levels.join(',')} | แพ็คเกจ: ${selectedPackageCode.value}`, // เก็บข้อมูลเก่าไว้
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

// Lifecycle
onMounted(async () => {
  // โหลดระดับงาน
  try {
    const response = await fetch('http://localhost:4001/api/courses/job-levels')
    jobLevels.value = await response.json()
  } catch (error) {
    console.error('Error loading job levels:', error)
  }
})

// Set page title
useHead({
  title: 'เพิ่มความต้องการฝึกอบรม - ระบบจัดการความต้องการฝึกอบรม'
})
</script>

<style scoped>
/* Custom styles for better UX */
select:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
}

.step-number {
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}
</style>