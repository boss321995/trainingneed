<template>
  <div class="min-h-screen bg-gray-50">
    <div class="border-b border-gray-200 bg-white/70 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-blue-600">โครงร่างหลักสูตร</p>
          <h1 class="text-lg font-semibold text-gray-900 sm:text-xl">{{ pageTitle }}</h1>
          <p v-if="courseData" class="text-xs text-gray-500">
            รหัสหลักสูตร: <span class="font-medium text-gray-700">{{ courseData.cid }}</span>
            <span v-if="courseData.sap_code" class="ml-2">| SAP Code: <span class="font-medium text-gray-700">{{ courseData.sap_code }}</span></span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            @click="handleBack"
          >
            <span class="mr-1.5 text-lg">←</span>
            กลับไปหน้าคำขออบรม
          </button>
          <button
            v-if="!pending && !error"
            type="button"
            class="inline-flex items-center rounded-lg border border-blue-200 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            @click="refresh"
          >
            โหลดข้อมูลใหม่
          </button>
        </div>
      </div>
    </div>

    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="pending" class="flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white/90 p-12 text-sm text-gray-500">
        กำลังดึงข้อมูลโครงร่างหลักสูตร...
      </div>

      <div v-else-if="error || !courseData" class="rounded-xl border border-red-200 bg-red-50/80 p-8 text-center text-sm text-red-600">
        <p class="font-medium">ไม่พบโครงร่างหลักสูตรในระบบ</p>
        <p class="mt-1 text-xs text-red-500">ตรวจสอบว่าหลักสูตรนี้เชื่อมกับข้อมูลในระบบ tn_course แล้วหรือยัง</p>
      </div>

      <div v-else class="space-y-6">
        <section class="grid gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div class="space-y-2">
            <h2 class="text-sm font-semibold text-gray-800">รายละเอียดหลักสูตร</h2>
            <dl class="space-y-1 text-sm text-gray-600">
              <div class="flex gap-2">
                <dt class="basis-32 shrink-0 text-gray-500">ชื่อหลักสูตร</dt>
                <dd class="flex-1 font-medium text-gray-900">{{ courseData.course_name || courseData.cid }}</dd>
              </div>
              <div class="flex gap-2" v-if="courseData.training_type">
                <dt class="basis-32 shrink-0 text-gray-500">ประเภทการอบรม</dt>
                <dd class="flex-1">{{ courseData.training_type }}</dd>
              </div>
              <div class="flex gap-2" v-if="courseData.target_group">
                <dt class="basis-32 shrink-0 text-gray-500">กลุ่มเป้าหมาย</dt>
                <dd class="flex-1">{{ courseData.target_group }}</dd>
              </div>
              <div class="flex gap-2" v-if="courseData.duration">
                <dt class="basis-32 shrink-0 text-gray-500">ระยะเวลา</dt>
                <dd class="flex-1">{{ formatDuration(courseData.duration, courseData.daycount) }}</dd>
              </div>
              <div class="flex gap-2" v-if="courseData.occupy">
                <dt class="basis-32 shrink-0 text-gray-500">จำนวนผู้เข้าร่วม</dt>
                <dd class="flex-1">ประมาณ {{ courseData.occupy }} คน</dd>
              </div>
              <div class="flex gap-2" v-if="courseData.course_section">
                <dt class="basis-32 shrink-0 text-gray-500">หมวดหมู่</dt>
                <dd class="flex-1">{{ courseData.course_section }}</dd>
              </div>
              <div class="flex gap-2" v-if="courseData.job_fam || courseData.job_fam_sub">
                <dt class="basis-32 shrink-0 text-gray-500">สายอาชีพ</dt>
                <dd class="flex-1">
                  <span>{{ courseData.job_fam }}</span>
                  <span v-if="courseData.job_fam_sub" class="text-gray-400"> / {{ courseData.job_fam_sub }}</span>
                </dd>
              </div>
              <div class="flex gap-2" v-if="courseData.g_name">
                <dt class="basis-32 shrink-0 text-gray-500">กลุ่มจัดทำ</dt>
                <dd class="flex-1">{{ courseData.g_name }}</dd>
              </div>
            </dl>
          </div>
          <div class="rounded-lg border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-5">
            <h3 class="text-sm font-semibold text-blue-700">ข้อมูลอ้างอิงระบบ</h3>
            <dl class="mt-4 space-y-2 text-xs text-gray-600">
              <div class="flex justify-between">
                <dt class="text-gray-500">รหัสระบบ tn_course</dt>
                <dd class="font-medium text-gray-900">{{ courseData.id }}</dd>
              </div>
              <div class="flex justify-between" v-if="courseData.cid_ref">
                <dt class="text-gray-500">รหัสอ้างอิงเดิม</dt>
                <dd class="font-medium text-gray-900">{{ courseData.cid_ref }}</dd>
              </div>
              <div class="flex justify-between" v-if="courseData.pid">
                <dt class="text-gray-500">หน่วยงานเจ้าของ</dt>
                <dd class="font-medium text-gray-900">{{ courseData.pid }}</dd>
              </div>
              <div class="flex justify-between" v-if="courseData.course_status">
                <dt class="text-gray-500">สถานะหลักสูตร</dt>
                <dd class="font-medium text-gray-900">{{ courseData.course_status }}</dd>
              </div>
              <div class="flex justify-between" v-if="courseData.app_date">
                <dt class="text-gray-500">วันที่อนุมัติ</dt>
                <dd class="font-medium text-gray-900">{{ formatDate(courseData.app_date) }}</dd>
              </div>
              <div class="flex justify-between" v-if="courseData.source">
                <dt class="text-gray-500">แหล่งที่มา</dt>
                <dd class="font-medium text-gray-900">{{ courseData.source }}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section v-for="section in contentSections" :key="section.key" class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 class="text-base font-semibold text-gray-900">{{ section.title }}</h2>
          <p v-if="section.value" class="mt-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{{ section.value }}</p>
          <p v-else class="mt-3 text-xs text-gray-400">ยังไม่มีข้อมูลในหัวข้อนี้</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const identifier = computed(() => String(route.params.identifier || '').trim())
const lookup = computed(() => (route.query.lookup === 'id' ? 'id' : 'code'))

const { data: courseData, pending, error, refresh } = await useAsyncData(
  () => `tn-course-outline-${identifier.value}-${lookup.value}`,
  () =>
    $fetch(`/api/courses/tn-courses/${identifier.value}`, {
      query: lookup.value === 'id' ? { lookup: 'id' } : undefined
    }),
  {
    watch: [identifier, lookup],
    server: false
  }
)

const pageTitle = computed(() => {
  if (pending.value) {
    return 'กำลังโหลดโครงร่างหลักสูตร'
  }
  if (!courseData.value) {
    return 'ไม่พบโครงร่างหลักสูตร'
  }
  return courseData.value.course_name || courseData.value.cid || 'โครงร่างหลักสูตร'
})

const contentSections = computed(() => {
  const course = courseData.value
  if (!course) return []

  return [
    { key: 'intro', title: 'บทนำ (Introduction)', value: course.intro },
    { key: 'objective', title: 'วัตถุประสงค์ (Objectives)', value: course.objective },
    { key: 'headsubject', title: 'หัวข้อหลัก (Main Subjects)', value: course.headsubject },
    { key: 'htraining', title: 'วิธีการอบรม (Training Methods)', value: course.htraining },
    { key: 'evaluation_criteria', title: 'เกณฑ์การประเมินผล (Evaluation Criteria)', value: course.evaluation_criteria },
    { key: 'qualification_participants', title: 'คุณสมบัติผู้เข้าอบรม', value: course.qualification_participants },
    { key: 'competency', title: 'สมรรถนะที่คาดหวัง (Expected Competency)', value: course.competency },
    { key: 'commitee', title: 'คณะทำงาน/ผู้รับผิดชอบ', value: course.commitee },
    { key: 'com_list', title: 'กรรมการ/วิทยากรเพิ่มเติม', value: course.com_list }
  ]
})

function handleBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/training/new')
  }
}

function formatDuration(hours, daycount) {
  if (!hours && !daycount) return 'ไม่ระบุ'

  const parts = []
  if (Number.isFinite(Number(daycount)) && Number(daycount) > 0) {
    parts.push(`${Number(daycount)} วัน`)
  }
  if (Number.isFinite(Number(hours)) && Number(hours) > 0) {
    parts.push(`${Number(hours)} ชั่วโมง`)
  }
  return parts.join(' • ') || 'ไม่ระบุ'
}

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
