<template>
  <div :class="containerClass">
    <div v-if="showBackButton" class="mb-4">
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

    <div v-if="showTitle" class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">รายงานผลการขอจัดทำแผนฝึกอบรม</h1>
      <p class="text-gray-600">ดูรายงานและสถิติการร้องขอฝึกอบรมแบ่งตามสายงาน</p>
      <div v-if="currentUser" class="mt-2 text-sm text-blue-600">
        <p>{{ currentUser.fullname }} | {{ currentUser.section }}</p>
      </div>
      <div v-if="currentUser && !isAuthorized" class="mt-2 text-xs text-gray-500">
        <p>รายงานนี้สงวนสิทธิ์สำหรับรหัสส่วนงาน {{ allowedSectionDisplay }} เท่านั้น (รหัสของคุณ: {{ sectionDigits || 'ไม่ทราบ' }})</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

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

    <div v-else>
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">กรองข้อมูล</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">แพ็กเกจ (ชื่อ)</label>
            <select
              v-model="filters.packageName"
              @change="fetchReports"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกแพ็กเกจ</option>
              <template v-if="packagesLoading">
                <option disabled>กำลังโหลดรายการแพ็กเกจ...</option>
              </template>
              <template v-else-if="packageOptionsError">
                <option disabled>{{ packageOptionsError }}</option>
              </template>
              <template v-else>
                <option
                  v-for="option in packageOptions"
                  :key="`package-name-${option.value}`"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </template>
            </select>
          </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">สายงาน (DEP_GROUPNAME)</label>
              <select
                v-model="filters.groupName"
                @change="fetchReports"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">ทุกสายงาน</option>
                <option disabled v-if="!groupOptions.length && loading">กำลังโหลดรายการสายงาน...</option>
                <option
                  v-for="option in groupOptions"
                  :key="`group-${option.value}`"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </div>
          <div class="flex items-end gap-2 flex-wrap">
            <button
              type="button"
              @click="openCourseModal"
              class="w-full md:w-auto px-4 py-2 border border-blue-100 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
            >
              📘 มุมมองหลักสูตร
            </button>
            <button
              type="button"
              @click="exportExcel"
              class="w-full md:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              📊 ส่งออก Excel
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-blue-100 truncate">จำนวนทักษะที่มี</dt>
                <dd class="text-3xl font-bold">{{ summary.skillCount }}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div class="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-purple-100 truncate">จำนวนหลักสูตรที่มี</dt>
                <dd class="text-3xl font-bold">{{ summary.courseCount }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-orange-100 truncate">หลักสูตรยอดนิยม</dt>
                <dd class="text-lg font-bold truncate">{{ summary.topCourse || 'ไม่มีข้อมูล' }}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <svg class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-emerald-100 truncate">ผู้เข้าอบรมจากคำขอ</dt>
                <dd class="text-3xl font-bold">{{ overallDevelopmentStats.total }}</dd>
              </dl>
              <p class="mt-2 text-xs text-emerald-100/90">
                <template v-if="overallDevelopmentStats.hasBreakdown">
                  Upskill {{ overallDevelopmentStats.upskill }} · Reskill {{ overallDevelopmentStats.reskill }}
                </template>
                <template v-else>
                  ยังไม่ระบุประเภท Upskill/Reskill ในคำขอที่เลือก
                </template>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="isAuthorized"
        class="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      >
        <div class="text-sm text-gray-600">
          <template v-if="orgStructureLoaded">
            <span class="font-semibold text-gray-900">{{ orgCoverageSummary.submittedSections }}</span>
            จาก
            <span class="font-semibold text-gray-900">{{ orgCoverageSummary.totalSections }}</span>
            ส่วนงานส่งแผนแล้ว
            <span v-if="orgCoverageSummary.missingSections > 0" class="ml-1 text-amber-600">
              (ยังขาด {{ orgCoverageSummary.missingSections }} ส่วน)
            </span>
          </template>
          <template v-else>
            ตรวจสอบสถานะการส่งแผนฝึกอบรมของทุกส่วนงานในองค์กร
          </template>
        </div>
        <div class="flex flex-wrap items-center gap-3 md:justify-end">
          <button
            type="button"
            @click="openOrgMapModal"
            class="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 21h18M5 21V7a2 2 0 012-2h3V4a2 2 0 012-2h2a2 2 0 012 2v1h3a2 2 0 012 2v14M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
            </svg>
            แผนผังองค์กร &amp; สถานะการส่งคำขอ
          </button>
        </div>
      </div>

      <div
        v-if="hasChartFilters"
        class="mb-6 rounded-xl border border-blue-100 bg-blue-50/80 p-4"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-blue-700">กำลังดูข้อมูลจากการเลือกในกราฟ:</span>
          <button
            v-for="chip in chartFilterChips"
            :key="`chart-filter-${chip.type}`"
            type="button"
            @click="clearChartFilter(chip.type)"
            class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 shadow-sm ring-1 ring-inset ring-blue-200 transition hover:bg-blue-100"
          >
            {{ chip.label }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            type="button"
            @click="clearChartFilters"
            class="ml-auto inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            รีเซ็ตตัวกรองจากกราฟ
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582M20 20v-5h-.581m0 0a7.5 7.5 0 01-11.507-9.057M9.893 5.5A7.5 7.5 0 0119.42 15" />
            </svg>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">การแบ่งตามสายงาน</h3>
          <div class="h-64">
            <canvas
              v-if="groupStats.length > 0"
              ref="groupChartCanvas"
              class="w-full h-full"
            ></canvas>
            <div v-else class="h-full flex items-center justify-center text-gray-500 text-sm">
              ไม่มีข้อมูลเพียงพอสำหรับกราฟนี้
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">หลักสูตรยอดนิยม (Top 5)</h3>
          <p class="text-sm text-gray-500 mb-4">แสดงจำนวนคำขอสูงสุดจากหลักสูตรที่ถูกเลือกในช่วงเวลาที่กรองไว้</p>
          <div class="h-64">
            <canvas
              v-if="hasTopCourseData"
              ref="topCourseChartCanvas"
              class="w-full h-full"
            ></canvas>
            <div v-else class="h-full flex items-center justify-center text-gray-500 text-sm text-center px-6">
              ไม่พบข้อมูลหลักสูตรเพียงพอสำหรับสร้างกราฟแท่งในช่วงเวลานี้
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">รูปแบบการจัดอบรมยอดนิยม</h3>
          <p class="text-sm text-gray-500 mb-4">สรุปจำนวนคนรวมแยกตามรูปแบบการจัดอบรม (On-site, Online, E-Learning)</p>
          <div v-if="learningModeStats.length" class="space-y-4">
            <div
              v-if="topLearningMode"
              class="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700"
            >
              รูปแบบที่ได้รับความนิยมสูงสุดคือ
              <span class="font-semibold">{{ topLearningMode.label }}</span>
              ({{ topLearningMode.participants }} คน)
            </div>
            <div
              v-for="(mode, index) in learningModeStats"
              :key="`learning-mode-${mode.key}`"
              class="space-y-2"
            >
              <div class="flex items-center justify-between text-sm font-medium text-gray-700">
                <span>{{ mode.label }}</span>
                <span class="text-gray-500">{{ mode.participants }} คน · {{ mode.percentage }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${mode.percentage}%`,
                    backgroundColor: getColor(index)
                  }"
                ></div>
              </div>
            </div>
          </div>
          <div v-else class="h-full flex items-center justify-center text-gray-500 text-sm">
            ยังไม่มีข้อมูลรูปแบบการจัดอบรมในช่วงเวลาที่เลือก
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="text-lg font-medium text-gray-900">แพ็คเกจหลักสูตรยอดนิยมตามคำขอ</h3>
            <p class="text-sm text-gray-500">แสดงจำนวนคำขอฝึกอบรมในแต่ละแพ็คเกจ เรียงจากความนิยมสูงสุด</p>
          </div>
          <div
            v-if="packageChartData.remainderCount > 0"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
          >
            แสดง Top {{ PACKAGE_DATASET_LIMIT }} แพ็คเกจ · อื่นๆ {{ packageChartData.remainderCount }} รายการ รวมในหมวด “อื่นๆ”
          </div>
        </div>
        <div class="mt-4 h-96">
          <ClientOnly>
            <template #fallback>
              <div class="h-full flex items-center justify-center text-gray-500 text-sm text-center px-6">
                กำลังเตรียมกราฟแพ็คเกจหลักสูตร...
              </div>
            </template>
            <canvas
              v-if="packageChartData.datasets.length && packageChartData.labels.length"
              ref="packageChartCanvas"
              class="w-full h-full"
            ></canvas>
            <div v-else class="h-full flex items-center justify-center text-gray-500 text-sm text-center px-6">
              ยังไม่มีข้อมูลแพ็คเกจหลักสูตรสำหรับชุดข้อมูลนี้
            </div>
          </ClientOnly>
        </div>
      </div>

      <div class="space-y-6 mb-8">
        <div
          v-for="group in groupStats"
          :key="group.name"
          class="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 class="text-lg md:text-xl font-semibold text-gray-900">
                  {{ group.name }}
                  <span
                    v-if="group.fullName && group.fullName !== group.name"
                    class="ml-2 text-sm font-normal text-gray-500"
                  >
                    ({{ group.fullName }})
                  </span>
                </h3>
                <p class="text-sm text-gray-500">ฝ่าย {{ group.departmentCount }} | {{ group.sectionCount }}</p>
                <div v-if="group.strategicObjectives && group.strategicObjectives.length" class="mt-2">
                  <p class="text-[11px] font-medium uppercase tracking-wide text-indigo-600">เป้าประสงค์เชิงกลยุทธ์ (SO)</p>
                  <div class="mt-1 flex flex-wrap gap-2">
                    <span
                      v-for="objective in group.strategicObjectives"
                      :key="`${group.name}-so-${objective}`"
                      class="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                    >
                      {{ objective }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600">{{ group.total }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide">คำขอทั้งหมด</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-600">{{ group.totalParticipants }}</div>
                  <div class="text-xs text-gray-500 uppercase tracking-wide">ผู้เข้าร่วมรวม</div>
                </div>
               
                <div class="text-center">
                  <div class="text-lg font-semibold text-emerald-600">{{ group.upskillParticipants > 0 ? group.upskillParticipants : '—' }}</div>
                  <div class="text-[11px] text-gray-500 uppercase tracking-wide">Upskill</div>
                  <div class="mt-1 text-lg font-semibold text-amber-600">{{ group.reskillParticipants > 0 ? group.reskillParticipants : '—' }}</div>
                  <div class="text-[11px] text-gray-500 uppercase tracking-wide">Reskill</div>
                </div>
              </div>
            </div>
          </div>
          <div class="px-6 py-6 space-y-5">
            <div
              v-for="department in group.departments"
              :key="`${group.name}-${department.name}`"
              class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
            >
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                <div>
                  <h4 class="text-lg font-medium text-gray-900">
                    {{ department.name }}
                    <span
                      v-if="department.fullName && department.fullName !== department.name"
                      class="ml-2 text-xs font-normal text-gray-500"
                    >
                      ({{ department.fullName }})
                    </span>
                  </h4>
                  <p class="text-sm text-gray-500">ส่วนงาน {{ department.sectionCount }}</p>
                  <p
                    v-if="department.topCourseName"
                    class="mt-1 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    หลักสูตรที่มีผู้สนใจสูงสุด: {{ department.topCourseName }}
                    <span class="text-blue-500/80">{{ department.topCourseParticipants }} คน</span>
                  </p>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div class="text-center">
                    <div class="text-xl font-semibold text-blue-600">{{ department.total }}</div>
                    <div class="text-xs text-gray-500 uppercase tracking-wide">คำขอ</div>
                  </div>
                  <div class="text-center">
                    <div class="text-xl font-semibold text-green-600">{{ department.totalParticipants }}</div>
                    <div class="text-xs text-gray-500 uppercase tracking-wide">ผู้เข้าร่วมรวม</div>
                  </div>
                 
                  <div class="text-center">
                    <div class="text-base font-semibold text-emerald-600">{{ department.upskillParticipants > 0 ? department.upskillParticipants : '—' }}</div>
                    <div class="text-[11px] text-gray-500 uppercase tracking-wide">Upskill</div>
                    <div class="mt-1 text-base font-semibold text-amber-600">{{ department.reskillParticipants > 0 ? department.reskillParticipants : '—' }}</div>
                    <div class="text-[11px] text-gray-500 uppercase tracking-wide">Reskill</div>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div
                  v-for="section in department.sections"
                  :key="`${department.name}-${section.name}`"
                  class="flex items-center justify-between px-3 py-2 rounded bg-gray-50"
                >
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ section.displayName }}
                      <span
                        v-if="section.fullName && section.fullName !== section.name"
                        class="ml-2 text-[11px] font-normal text-gray-500"
                      >
                        ({{ section.fullName }})
                      </span>
                    </p>
                    <p class="text-xs text-gray-500">
                      ผู้เข้าร่วม {{ section.totalParticipants }}
                      <span
                        v-if="section.upskillParticipants || section.reskillParticipants"
                        class="ml-1 inline-flex flex-wrap items-center gap-1 text-[11px]"
                      >
                        <span v-if="section.upskillParticipants" class="text-emerald-600">Upskill {{ section.upskillParticipants }}</span>
                        <span v-if="section.reskillParticipants" class="text-amber-600">Reskill {{ section.reskillParticipants }}</span>
                      </span>
                    </p>
                  </div>
                  <div class="text-sm font-semibold text-gray-900">
                    {{ section.count }} คำขอ
                  </div>
                </div>
              </div>

              <div v-if="department.courseStats.length" class="mt-5">
                <div class="flex items-center justify-between">
                  <h5 class="text-sm font-medium text-gray-700">หลักสูตรที่ร้องขอในฝ่ายนี้</h5>
                  <span class="text-xs text-gray-400">Top {{ Math.min(department.courseStats.length, 5) }}</span>
                </div>
                <div class="mt-3 space-y-2">
                  <div
                    v-for="(course, index) in department.courseStats.slice(0, 5)"
                    :key="`${department.name}-course-${course.name}`"
                    class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <div class="flex items-center justify-between text-sm font-medium text-gray-800">
                      <span class="flex items-center gap-2" :class="{ 'text-blue-700': index === 0 }">
                        <span
                          class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white"
                          :style="{ backgroundColor: getColor(index) }"
                        >
                          {{ index + 1 }}
                        </span>
                        <span class="truncate">{{ course.name }}</span>
                      </span>
                      <span class="text-gray-600">{{ course.totalParticipants }} คน</span>
                    </div>
                    <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white">
                      <div
                        class="h-full rounded-full transition-all duration-500"
                        :style="{
                          width: `${Math.min(100, Math.max(8, course.relativeToTop))}%`,
                          backgroundColor: getColor(index)
                        }"
                      ></div>
                    </div>
                    <p class="mt-1 text-[11px] text-gray-500">
                      คิดเป็น {{ course.participantShare }}% ของผู้เข้าร่วมในฝ่ายนี้
                    </p>
                    <div v-if="course.sections.length" class="mt-2 flex flex-wrap gap-1">
                      <span
                        v-for="section in course.sections"
                        :key="`${department.name}-${course.name}-${section.displayName}`"
                        class="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200"
                      >
                        {{ section.displayName }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="groupStats.length === 0" class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          ไม่มีข้อมูลสำหรับแสดง
        </div>
      </div>

      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">รายละเอียดคำขอฝึกอบรม</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ผู้ร้องขอ</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สายงาน</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ฝ่ายสังกัด</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ส่วนสังกัด</th>
                
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">วันที่ส่ง</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ item.employee_name || item.requested_by || '-' }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-500"
                  :title="item.group_name || 'ไม่ระบุ'"
                >
                  {{ item.group_name || 'ไม่ระบุ' }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-500"
                  :title="item.department || 'ไม่ระบุ'"
                >
                  {{ item.department || 'ไม่ระบุ' }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-500"
                  :title="item.section || 'ไม่ระบุ'"
                >
                  {{ item.section || 'ไม่ระบุ' }}
                </td>
                
                <td class="px-6 py-4 text-sm text-gray-500">
                  {{ formatDate(item.created_at) }}
                </td>
                <td class="px-6 py-4 text-sm text-right">
                  <NuxtLink
                    :to="`/reports/${item.id}`"
                    class="inline-flex items-center px-3 py-2 border border-blue-100 text-blue-600 hover:text-blue-800 hover:border-blue-300 rounded-md text-xs font-medium transition"
                  >
                    ดูรายละเอียด
                    <svg xmlns="http://www.w3.org/2000/svg" class="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="bg-white border border-indigo-100 rounded-3xl shadow-sm p-6 sm:p-8 mt-10">
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div class="max-w-2xl space-y-2">
            <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
              วิเคราะห์ด้วย Gemini
            </div>
            <h3 class="text-xl font-semibold text-gray-900">ศูนย์วิเคราะห์หลักสูตรสำหรับจัดทำแผนการฝึกอบรม</h3>
            <p class="text-sm text-gray-500 leading-relaxed">
              ใช้ Gemini เพื่อคัดกรองหลักสูตรจำนวนมาก สร้างหมวดหมู่ตามประเด็นเชิงกลยุทธ์ พร้อมสรุปโอกาสที่ควรเร่งดำเนินการแบบเข้าใจง่าย
            </p>
            <div class="w-full sm:max-w-md">
              <div
                class="mt-4 flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm"
                :class="aiConnectionStatus.classes"
              >
                <span class="mt-0.5 flex h-5 w-5 items-center justify-center">
                  <svg
                    v-if="aiConnectionStatus.icon === 'success'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg
                    v-else-if="aiConnectionStatus.icon === 'warning'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h18.78a1.5 1.5 0 001.29-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z" />
                  </svg>
                  <svg
                    v-else-if="aiConnectionStatus.icon === 'error'"
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span
                    v-else-if="aiConnectionStatus.icon === 'loading'"
                    class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                  ></span>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M9 21h6a2 2 0 002-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </span>
                <span>{{ aiConnectionStatus.message }}</span>
              </div>
            </div>
            <div v-if="aiResult" class="flex flex-wrap gap-2 text-xs text-gray-500">
              <span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                </svg>
                วิเคราะห์ {{ aiCoverage.analyzedCourses }} / {{ aiCoverage.totalCourses }} รายการ
              </span>
              <span
                v-if="manualSummary"
                class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 12h6m-6 5h10M6 5h12a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 011-1z" />
                </svg>
                โฟกัสแพ็คเกจ “อื่นๆ” {{ manualSummary.totalItems }} รายการ
                <span v-if="manualSummary.analyzedCount !== undefined && manualSummary.analyzedCount !== null">
                  · ส่งเข้า Gemini {{ manualSummary.analyzedCount }} รายการ
                </span>
              </span>
              <span v-if="aiLastRunLabel" class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                อัปเดตล่าสุด {{ aiLastRunLabel }}
              </span>
              <span v-if="aiUsedFallback" class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h18.78a1.5 1.5 0 001.29-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z" />
                </svg>
                แสดงผลจากการจัดกลุ่มสำรอง
              </span>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              type="button"
              @click="runAiClassification"
              :disabled="aiLoading || loading"
              class="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ aiLoading ? 'กำลังวิเคราะห์...' : 'วิเคราะห์ด้วย Gemini' }}
            </button>
            <button
              v-if="aiResult || aiError"
              type="button"
              @click="resetAiInsight"
              class="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12a7.5 7.5 0 1113.356 4.854M4.5 12H3m1.5 0H3m14.356 4.854L21 21m-2.144-4.146L21 21" />
              </svg>
              รีเซ็ตผลวิเคราะห์
            </button>
          </div>
        </div>

        <div v-if="aiError" class="mt-6 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-4 text-sm text-red-700">
          {{ aiError }}
        </div>
        <div v-else-if="aiLoading" class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="h-32 rounded-2xl bg-gradient-to-r from-indigo-100 via-gray-100 to-indigo-100 animate-pulse"></div>
          <div class="h-32 rounded-2xl bg-gradient-to-r from-indigo-100 via-gray-100 to-indigo-100 animate-pulse"></div>
          <div class="h-32 rounded-2xl bg-gradient-to-r from-indigo-100 via-gray-100 to-indigo-100 animate-pulse hidden lg:block"></div>
        </div>
        <div v-else-if="aiResult" class="mt-8 space-y-8">
          <div class="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 p-6 text-white shadow-xl">
            <div class="text-xs font-semibold uppercase tracking-wider text-indigo-100">Executive Brief</div>
            <p class="mt-3 text-base leading-relaxed">{{ aiResult.executiveSummary }}</p>
            <div class="mt-4 flex flex-wrap gap-4 text-xs text-indigo-100/90">
              <span class="inline-flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 01-8 0M12 14v7m-7-7a7 7 0 0114 0v3H5v-3z" />
                </svg>
                ผู้มีส่วนร่วม {{ aiCourseList.length }} หลักสูตรในมุมมองล่าสุด
              </span>
              <span>ครอบคลุม {{ aiCoverage.analyzedCourses }} / {{ aiCoverage.totalCourses }} รายการ</span>
              <span v-if="aiLastRunLabel">ประมวลผล: {{ aiLastRunLabel }}</span>
            </div>
          </div>

          <div v-if="manualSummary" class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                  <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                  แสดงเฉพาะคำขอแพ็คเกจ “อื่นๆ (กำหนดเอง)”
                </div>
                <h4 class="text-lg font-semibold text-gray-900">สรุปคำขอแพ็คเกจ “อื่นๆ (กำหนดเอง)”</h4>
                <p class="mt-1 text-sm text-gray-500">
                  พบ {{ manualSummary.totalItems }} รายการจาก {{ manualSummary.uniqueSections || 0 }} ส่วนงาน
                  <span v-if="manualSummary.uniqueDepartments">
                    และ {{ manualSummary.uniqueDepartments }} กลุ่มงาน
                  </span>
                  <span v-if="manualSummary.analyzedCount !== undefined && manualSummary.analyzedCount !== null">
                    · ส่งวิเคราะห์ {{ manualSummary.analyzedCount }} รายการ
                  </span>
                  <span
                    v-if="manualSummary.originalTotal !== undefined && manualSummary.originalTotal !== manualSummary.totalItems"
                  >
                    · จากคำขอรวมทั้งหมด {{ manualSummary.originalTotal }} รายการ
                  </span>
                </p>
              </div>
              <div class="flex flex-wrap gap-2 text-xs text-gray-500">
                <span
                  v-if="manualSummary.uniqueTopics"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  หัวข้อเฉพาะ {{ manualSummary.uniqueTopics }} หัวข้อ
                </span>
                <span
                  v-if="manualSummary.uniqueDepartments"
                  class="inline-flex items-center gap-1 rounded-full bg-sky-50 px-3 py-1 text-sky-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                  ครอบคลุม {{ manualSummary.uniqueDepartments }} กลุ่มงาน
                </span>
                <span
                  v-if="manualSummary.filteredOut > 0"
                  class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ตัดออก {{ manualSummary.filteredOut }} รายการ (ไม่ใช่แพ็คเกจ “อื่นๆ”)
                </span>
                <span
                  v-if="manualOverlapTopics.length"
                  class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-blue-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  พบหัวข้อที่เกี่ยวข้องหลายส่วนงาน {{ manualOverlapTopics.length }} หัวข้อ
                </span>
              </div>
            </div>

            <div v-if="manualTopicsToDisplay.length" class="mt-6 grid gap-4 md:grid-cols-2">
              <div
                v-for="topic in manualTopicsToDisplay"
                :key="`manual-topic-${topic.key}`"
                class="flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-slate-50/60 p-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ topic.label }}</p>
                    <p v-if="topic.sections?.length" class="mt-1 text-xs text-gray-500">
                      ส่วนงานที่เกี่ยวข้อง: {{ summarizeList(topic.sections) }}
                    </p>
                    <p v-else-if="topic.departments?.length" class="mt-1 text-xs text-gray-500">
                      กลุ่มงาน: {{ summarizeList(topic.departments) }}
                    </p>
                  </div>
                  <span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h13m-7 5h11" />
                    </svg>
                    {{ topic.count }} คำขอ
                  </span>
                </div>
                <div class="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
                  <span
                    v-if="topic.sectionCount > 1"
                    class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-indigo-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H7" />
                    </svg>
                    เชื่อม {{ topic.sectionCount }} ส่วนงาน
                  </span>
                  <span
                    v-if="topic.departmentCount > 1"
                    class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-purple-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
                    </svg>
                    ครอบ {{ topic.departmentCount }} กลุ่มงาน
                  </span>
                </div>
                <div v-if="topic.examples?.length" class="mt-3 space-y-2">
                  <div
                    v-for="(example, exIndex) in topic.examples.slice(0, 2)"
                    :key="`topic-${topic.key}-example-${exIndex}`"
                    class="rounded-xl bg-white px-3 py-2 text-xs text-gray-600"
                  >
                    <div v-if="example.section || example.department" class="mb-1 font-medium text-gray-500">
                      {{ summarizeList([example.section || example.department], 1) }}
                    </div>
                    <p class="italic text-gray-500">“{{ example.snippet }}”</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else
              class="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500"
            >
              ยังไม่มีหัวข้อจากแพ็คเกจ “อื่นๆ (กำหนดเอง)” ในช่วงเวลานี้
            </div>

            <div v-if="manualTopTerms.length" class="mt-6">
              <h5 class="text-xs font-semibold uppercase tracking-wide text-gray-500">คำสำคัญที่ถูกกล่าวถึงบ่อย</h5>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="term in manualTopTerms"
                  :key="`manual-term-${term.term}`"
                  class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-gray-700"
                >
                  {{ term.term }}
                  <span class="text-[10px] text-gray-500">×{{ term.count }}</span>
                </span>
              </div>
            </div>
          </div>

          <div v-if="aiPriorityHighlights.length" class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="(highlight, index) in aiPriorityHighlights"
              :key="`highlight-${index}`"
              class="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-5 text-sm text-gray-700 shadow-sm"
            >
              <div class="flex items-center justify-between gap-3">
                <h4 class="text-sm font-semibold text-indigo-900">{{ highlight.title }}</h4>
                <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium" :class="mapBadgeClass(highlight.impact)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3" />
                  </svg>
                  ผลกระทบ {{ highlight.impact || 'ไม่ระบุ' }}
                </span>
              </div>
              <p class="mt-3 leading-relaxed text-gray-600">{{ highlight.recommendation }}</p>
            </div>
          </div>

          <div>
            <div class="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 class="text-lg font-semibold text-gray-900">หมวดหลักสูตรที่ Gemini จัดกลุ่ม</h4>
                <p class="text-sm text-gray-500">คลิกเลือกหมวดเพื่อดูรายละเอียดหลักสูตรและข้อมูลผู้ร้องขอ</p>
              </div>
              <div v-if="aiSelectedCategory" class="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs text-indigo-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v4h16V8a2 2 0 00-2-2h-4M6 10v8a2 2 0 002 2h8a2 2 0 002-2v-8" />
                </svg>
                {{ aiSelectedCategory.courseIds?.length || 0 }} หลักสูตรในหมวดนี้
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <button
                v-for="category in aiCategories"
                :key="category.id"
                type="button"
                @click="aiSelectedCategoryId = category.id"
                :class="[
                  'group flex h-full flex-col justify-between rounded-2xl border p-5 text-left transition shadow-sm hover:shadow-md',
                  aiSelectedCategoryId === category.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
                ]"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">{{ category.label }}</p>
                    <p class="mt-2 max-h-20 overflow-hidden text-sm text-gray-500">{{ category.description }}</p>
                  </div>
                  <span class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h10M7 12h4m1 5h5" />
                    </svg>
                    {{ category.courseIds?.length || 0 }} หลักสูตร
                  </span>
                </div>
                <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium" :class="mapBadgeClass(category.strategicValue)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
                    </svg>
                    คุณค่าเชิงกลยุทธ์ {{ category.strategicValue || 'ไม่ระบุ' }}
                  </span>
                  <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    ความมั่นใจ {{ Math.round((category.confidence || 0) * 100) }}%
                  </span>
                  <span
                    v-for="term in (category.topTerms || []).slice(0, 3)"
                    :key="`${category.id}-${term}`"
                    class="inline-flex items-center rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-gray-500 border border-gray-200"
                  >
                    #{{ term }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div v-if="aiCourseList.length" class="space-y-4">
            <div class="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <h4 class="text-lg font-semibold text-gray-900">รายละเอียดหลักสูตรในหมวดที่เลือก</h4>
              <span class="text-xs text-gray-500">แสดง {{ aiCourseList.length }} รายการแรกจากชุดข้อมูลล่าสุด</span>
            </div>
            <div class="grid gap-4 lg:grid-cols-2">
              <div
                v-for="course in aiCourseList"
                :key="`ai-course-${course.id}`"
                class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:border-indigo-300"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ course.title }}</p>
                    <p class="mt-1 text-xs text-gray-500">{{ course.department }}</p>
                  </div>
                </div>
                <p v-if="course.objective" class="mt-3 max-h-24 overflow-hidden text-sm text-gray-600">{{ course.objective }}</p>
                <p v-else-if="course.notes" class="mt-3 max-h-24 overflow-hidden text-sm text-gray-600">{{ course.notes }}</p>
                <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span v-if="course.participants" class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                    {{ course.participants }} คน
                  </span>
                  <span v-if="course.requester" class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A4 4 0 017 11h10a4 4 0 011.879 6.804M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {{ course.requester }}
                  </span>
                  <span v-if="course.courseType" class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0l-4 4m4-4l-4-4" />
                    </svg>
                    {{ course.courseType }}
                  </span>
                  <span
                    v-for="tag in course.strategy"
                    :key="`strategy-${course.id}-${tag}`"
                    class="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-1"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mt-6 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/70 p-6 text-sm text-indigo-700">
          กดปุ่ม “วิเคราะห์ด้วย Gemini” เพื่อให้ระบบช่วยจัดกลุ่มและสรุปข้อมูลหลักสูตรสำหรับการตัดสินใจของผู้บริหาร
        </div>
      </div>
    </div>
  </div>
      <Teleport v-if="isClient && showCourseModal" to="body">
        <div class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]" @click="closeCourseModal"></div>
          <div class="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center p-4">
            <div class="relative flex h-full max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" @click.stop>
              <div class="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">มุมมองหลักสูตรตามคำขอฝึกอบรม</h2>
                  <p class="mt-1 text-sm text-gray-500">
                    รวมทั้งหมด {{ courseModalMetrics.totalCourses }} หลักสูตร · แสดง {{ courseModalMetrics.filteredCourses }} รายการตามตัวกรองที่เลือก
                  </p>
                  <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                      👥 ผู้เข้าร่วมรวม {{ courseModalMetrics.totalParticipants }} คน
                    </span>
                    <span class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                      📋 มีรายชื่อชัดเจน {{ courseModalMetrics.rosterCourses }} หลักสูตร
                    </span>
                  </div>
                </div>
                <div class="flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    @click="exportCourseExcel('summary')"
                    class="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    📄 ส่งออกเฉพาะสรุป
                  </button>
                  <button
                    type="button"
                    @click="exportCourseExcel('full')"
                    class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    📥 ส่งออกสรุป + รายชื่อ
                  </button>
                  <button
                    type="button"
                    @click="closeCourseModal"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
                  >
                    <span class="sr-only">ปิดหน้าต่าง</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div class="border-b border-gray-100 px-6 py-3">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div class="relative w-full lg:max-w-sm">
                    <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      v-model="courseSearch"
                      type="search"
                      placeholder="ค้นหาชื่อหลักสูตร / แพ็คเกจ / ฝ่าย"
                      class="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-700 shadow-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span class="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                      ใช้ตัวกรองเดียวกับหน้ารายงานหลัก
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex-1 px-6 py-5 overflow-hidden">
                <div v-if="!filteredCourses.length" class="flex h-full items-center justify-center text-sm text-gray-500">
                  ไม่มีข้อมูลหลักสูตรที่ตรงกับตัวกรองนี้
                </div>
                <div v-else class="grid h-full grid-cols-1 gap-5 overflow-hidden lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
                  <div class="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div class="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
                      รายการหลักสูตร ({{ filteredCourses.length }})
                    </div>
                    <div class="flex-1 overflow-y-auto">
                      <table class="min-w-full divide-y divide-gray-100 text-sm">
                        <thead class="sticky top-0 z-10 bg-gray-50">
                          <tr>
                            <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">#</th>
                            <th class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">หลักสูตร</th>
                            <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">ผู้เข้าร่วม</th>
                            <th class="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">คำขอ</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                          <tr
                            v-for="(course, index) in filteredCourses"
                            :key="course.key"
                            role="button"
                            tabindex="0"
                            @click="selectedCourseKey = course.key"
                            @keydown.enter.prevent="selectedCourseKey = course.key"
                            @keydown.space.prevent="selectedCourseKey = course.key"
                            :class="[
                              'cursor-pointer transition',
                              selectedCourse && selectedCourse.key === course.key
                                ? 'bg-blue-50/70 text-blue-900'
                                : 'hover:bg-blue-50/60'
                            ]"
                          >
                            <td class="px-4 py-3 text-xs font-semibold text-gray-500">{{ index + 1 }}</td>
                            <td class="px-4 py-3">
                              <p class="text-sm font-medium text-gray-900" :class="{ 'text-blue-700': selectedCourse && selectedCourse.key === course.key }">
                                {{ course.courseName }}
                              </p>
                              <p class="mt-1 text-xs text-gray-500 truncate">
                                {{ (course.packages && course.packages.length) ? course.packages.join(', ') : 'ไม่ระบุแพ็คเกจ' }}
                              </p>
                            </td>
                            <td class="px-3 py-3 text-right text-sm font-semibold text-gray-700">{{ course.totalParticipants }}</td>
                            <td class="px-3 py-3 text-right text-sm text-gray-600">{{ course.requestCount }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div class="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div v-if="selectedCourse" class="flex h-full flex-col">
                      <div class="border-b border-gray-100 px-4 py-4">
                        <h3 class="text-xl font-semibold text-gray-900">{{ selectedCourse.courseName }}</h3>
                        <div class="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div class="rounded-lg bg-blue-50 px-3 py-2">
                            <p class="text-xs font-medium uppercase tracking-wide text-blue-600">ผู้เข้าร่วมรวม</p>
                            <p class="text-lg font-semibold text-blue-700">{{ selectedCourse.totalParticipants }}</p>
                          </div>
                          <div class="rounded-lg bg-emerald-50 px-3 py-2">
                            <p class="text-xs font-medium uppercase tracking-wide text-emerald-600">Upskill</p>
                            <p class="text-lg font-semibold text-emerald-700">{{ selectedCourse.upskillParticipants }}</p>
                          </div>
                          <div class="rounded-lg bg-amber-50 px-3 py-2">
                            <p class="text-xs font-medium uppercase tracking-wide text-amber-600">Reskill</p>
                            <p class="text-lg font-semibold text-amber-700">{{ selectedCourse.reskillParticipants }}</p>
                          </div>
                          <div class="rounded-lg bg-slate-50 px-3 py-2">
                            <p class="text-xs font-medium uppercase tracking-wide text-slate-600">จำนวนคำขอ</p>
                            <p class="text-lg font-semibold text-slate-700">{{ selectedCourse.requestCount }}</p>
                          </div>
                        </div>
                        <div class="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            v-for="pkg in selectedCoursePackages"
                            :key="`pkg-${pkg}`"
                            class="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            📦 {{ pkg }}
                          </span>
                          <span
                            v-for="grp in selectedCourseGroups"
                            :key="`grp-${grp}`"
                            class="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700"
                          >
                            🏢 {{ grp }}
                          </span>
                          <span
                            v-for="dept in selectedCourseDepartments"
                            :key="`dept-${dept}`"
                            class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                          >
                            🧩 {{ dept }}
                          </span>
                          <span
                            v-for="section in selectedCourseSections"
                            :key="`sec-${section}`"
                            class="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
                          >
                            📍 {{ section }}
                          </span>
                        </div>
                        <p v-if="selectedCourse.lastRequestedAt" class="mt-2 text-xs text-gray-400">
                          อัปเดตล่าสุด {{ formatDate(selectedCourse.lastRequestedAt) }}
                        </p>
                      </div>
                      <div class="flex-1 space-y-6 overflow-y-auto px-4 py-4">
                        <section>
                          <h4 class="text-sm font-semibold text-gray-800">คำขอที่เกี่ยวข้อง</h4>
                          <div class="mt-2 max-h-56 space-y-3 overflow-y-auto pr-1">
                            <article
                              v-for="request in selectedCourseRequests"
                              :key="`course-request-${request.requestId}`"
                              class="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700"
                            >
                              <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p class="font-medium text-gray-900">คำขอ #{{ request.requestId || '-' }} · {{ toDisplayName(request.departmentName) }}</p>
                                  <p class="text-xs text-gray-500">
                                    {{ toDisplayName(request.sectionName) }} · โดย {{ request.requester || 'ไม่ระบุ' }}
                                  </p>
                                </div>
                                <div class="flex items-center gap-3 text-xs">
                                  <span class="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                                    👥 {{ request.participants }} คน
                                  </span>
                                  <span v-if="request.upskillParticipants" class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                                    U {{ request.upskillParticipants }}
                                  </span>
                                  <span v-if="request.reskillParticipants" class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
                                    R {{ request.reskillParticipants }}
                                  </span>
                                </div>
                              </div>
                              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span class="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                                  แหล่งที่มา: {{ mapDevelopmentSourceLabel(request.source) }}
                                </span>
                                <span v-if="request.quarter" class="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                                  ไตรมาส {{ request.quarter }}
                                </span>
                                <span v-if="request.createdAt" class="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5">
                                  {{ formatDate(request.createdAt) }}
                                </span>
                              </div>
                            </article>
                          </div>
                        </section>
                        <section>
                          <h4 class="text-sm font-semibold text-gray-800">รายชื่อผู้เข้าอบรม</h4>
                          <div v-if="selectedCourseHasRoster" class="mt-2 max-h-64 overflow-y-auto border border-gray-100 shadow-inner">
                            <table class="min-w-full divide-y divide-gray-100 text-sm">
                              <thead class="bg-gray-50">
                                <tr>
                                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ชื่อ - นามสกุล</th>
                                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">รหัสพนักงาน</th>
                                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ตำแหน่ง</th>
                                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ประเภท</th>
                                  <th class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">คำขอ</th>
                                </tr>
                              </thead>
                              <tbody class="divide-y divide-gray-100">
                                <tr v-for="participant in selectedCourseRoster" :key="`participant-${participant.requestId}-${participant.id || participant.employee_id}-${participant.name || participant.participant_name}`">
                                  <td class="px-3 py-2 text-gray-800">{{ toDisplayName(participant.name || participant.participant_name, 'ไม่ระบุ') }}</td>
                                  <td class="px-3 py-2 text-gray-600">{{ participant.employee_id || '—' }}</td>
                                  <td class="px-3 py-2 text-gray-600">{{ participant.position || '—' }}</td>
                                  <td class="px-3 py-2 text-gray-600">{{ toDisplayName(participant.development_type, 'ไม่ระบุ') }}</td>
                                  <td class="px-3 py-2 text-gray-500 text-xs">
                                    #{{ participant.requestId || '-' }} · {{ toDisplayName(participant.departmentName || participant.department, 'ไม่ระบุ') }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div v-else-if="selectedCourseMissingRoster.length" class="mt-2 space-y-3">
                            <div
                              v-for="item in selectedCourseMissingRoster"
                              :key="`missing-${item.requestId}`"
                              class="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm text-amber-700"
                            >
                              <p class="font-medium">คำขอ #{{ item.requestId || '-' }} ยังไม่ได้ระบุรายชื่อผู้เข้าอบรม</p>
                              <p class="text-xs text-amber-600">
                                รวม {{ item.totalParticipants || 0 }} คน · Upskill {{ item.upskillParticipants || 0 }} · Reskill {{ item.reskillParticipants || 0 }} · แหล่งที่มา: {{ mapDevelopmentSourceLabel(item.source) }}
                              </p>
                            </div>
                          </div>
                          <div v-else class="mt-2 text-sm text-gray-500">
                            ยังไม่มีรายชื่อผู้เข้าอบรมที่บันทึกไว้สำหรับหลักสูตรนี้
                          </div>
                        </section>
                      </div>
                    </div>
                    <div v-else class="flex h-full items-center justify-center px-4 py-8 text-center text-sm text-gray-500">
                      เลือกหลักสูตรจากรายการด้านซ้ายเพื่อดูรายละเอียด
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
      <Teleport v-if="isClient && showOrgMapModal" to="body">
        <div class="fixed inset-0 z-50">
          <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-[1px]" @click="closeOrgMapModal"></div>
          <div class="relative mx-auto flex h-full w-full max-w-6xl items-center justify-center p-4">
            <div class="relative flex h-full max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" @click.stop>
              <div class="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">สถานะการส่งแผนฝึกอบรมตามโครงสร้างองค์กร</h2>
                  <p class="mt-1 text-sm text-gray-500">
                    สายงาน {{ orgCoverageSummary.totalGroups }} · ฝ่าย {{ orgCoverageSummary.totalDepartments }} · ส่วนงาน {{ orgCoverageSummary.totalSections }}
                  </p>
                </div>
                <button
                  type="button"
                  @click="closeOrgMapModal"
                  class="inline-flex items-center justify-center rounded-full bg-gray-100 p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2"
                >
                  <span class="sr-only">ปิดหน้าต่าง</span>
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="border-b border-gray-100 px-6 py-3">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div class="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600 sm:text-sm">
                    <span class="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-green-700">
                      ส่งแล้ว {{ orgCoverageSummary.submittedSections }} ส่วนงาน
                    </span>
                    <span class="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
                      ค้างส่ง {{ orgCoverageSummary.missingSections }} ส่วนงาน
                    </span>
                  </div>
                  <label class="inline-flex items-center gap-2 text-sm text-gray-600">
                    <input
                      v-model="orgViewOptions.showMissingOnly"
                      type="checkbox"
                      class="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    />
                    แสดงเฉพาะส่วนงานที่ยังไม่ส่ง
                  </label>
                </div>
              </div>
              <div class="flex-1 overflow-y-auto px-6 py-5">
                <div
                  v-if="orgStructureLoading"
                  class="flex h-full min-h-[220px] items-center justify-center text-gray-500"
                >
                  <div class="h-10 w-10 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600"></div>
                </div>
                <div
                  v-else-if="orgStructureError"
                  class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                >
                  {{ orgStructureError }}
                </div>
                <div
                  v-else-if="!orgStructureLoaded"
                  class="py-10 text-center text-sm text-gray-500"
                >
                  ไม่พบข้อมูลโครงสร้างองค์กรที่จะแสดง
                </div>
                <div
                  v-else-if="orgCoverage.groups.length === 0"
                  class="py-10 text-center text-sm text-gray-500"
                >
                  ไม่มีส่วนงานที่ตรงกับตัวกรองนี้
                </div>
                <div v-else class="space-y-5 pb-4">
                  <div
                    v-for="group in orgCoverage.groups"
                    :key="group.id"
                    class="overflow-hidden rounded-xl border border-gray-200"
                  >
                    <div class="flex flex-col gap-2 border-b border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 class="text-base font-semibold text-gray-900">{{ group.displayName }}</h3>
                        <p class="text-xs text-gray-500">ฝ่าย {{ group.departments.length }} · ส่วนงาน {{ group.totalSections }}</p>
                      </div>
                      <span
                        class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                        :class="group.hasSubmission ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
                      >
                        <span v-if="group.hasSubmission">ส่งแล้ว {{ group.submittedSections }} ส่วนงาน</span>
                        <span v-else>ยังไม่ส่ง</span>
                      </span>
                    </div>
                    <div class="divide-y divide-gray-100">
                      <div
                        v-for="department in group.departments"
                        :key="department.id"
                        class="px-5 py-4"
                      >
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 class="text-sm font-semibold text-gray-800">{{ department.displayName }}</h4>
                            <p class="text-xs text-gray-500">ส่วนงาน {{ department.sections.length }} / ทั้งหมด {{ department.totalSections }}</p>
                          </div>
                          <span
                            class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
                            :class="department.hasSubmission ? 'border-green-200 bg-green-50 text-green-700' : 'border-slate-200 bg-slate-50 text-slate-600'"
                          >
                            <span v-if="department.hasSubmission">ส่งแล้ว {{ department.submittedSections }} ส่วนงาน</span>
                            <span v-else>ยังไม่ส่ง</span>
                          </span>
                        </div>
                        <ul class="mt-3 space-y-2">
                          <li
                            v-for="section in department.sections"
                            :key="section.id"
                            class="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p class="text-sm font-medium text-gray-900">{{ section.displayName }}</p>
                              <p class="text-xs text-gray-500">
                                <span v-if="section.sectionCode">รหัส: {{ section.sectionCode }}</span>
                                <span v-else-if="section.sectionShort && section.sectionShort !== section.displayName">{{ section.sectionShort }}</span>
                              </p>
                            </div>
                            <div class="flex flex-col items-start gap-1 sm:items-end">
                              <span
                                class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                                :class="section.requestCount ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'"
                              >
                                <span v-if="section.requestCount">ส่งแล้ว {{ section.requestCount }} ครั้ง</span>
                                <span v-else>ยังไม่ส่ง</span>
                              </span>
                              <span v-if="section.latestAt" class="text-[11px] text-gray-400">อัปเดต {{ formatDisplayDate(section.latestAt) }}</span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from '#app'
import { useAuthStore } from '~/stores/auth'

let Chart = null
if (process.client) {
  const chartModule = await import('chart.js/auto')
  Chart = chartModule.default
}

const props = defineProps({
  showBackButton: { type: Boolean, default: false },
  showTitle: { type: Boolean, default: true },
  embedded: { type: Boolean, default: false }
})

const router = useRouter()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const filters = reactive({
  packageName: '',
  groupName: ''
})

const summary = reactive({
  total: 0,
  topCourse: '',
  avgParticipants: 0,
  statusCount: {},
  courseCount: 0,
  participantTotal: 0,
  skillCount: 0,
  developmentTypeTotals: {
    upskill: 0,
    reskill: 0
  }
})

const items = ref([])
const rawItems = ref([])
const baseItems = ref([])
const baseRawItems = ref([])
const courseSummary = ref([])
const baseCourseSummary = ref([])
const packageOptions = ref([])
const groupOptions = ref([])
const packagesLoading = ref(false)
const packageOptionsError = ref(null)
const groupStats = ref([])
const loading = ref(true)
const error = ref(null)
const hasFetched = ref(false)

const aiLoading = ref(false)
const aiError = ref(null)
const aiResult = ref(null)
const aiMeta = ref(null)
const aiLastRunAt = ref(null)
const aiSelectedCategoryId = ref('all')
const aiLookup = ref({})
const manualInsights = ref(null)
const isClient = ref(false)

const showOrgMapModal = ref(false)
const orgStructure = ref(null)
const orgStructureLoading = ref(false)
const orgStructureError = ref(null)
const orgViewOptions = reactive({
  showMissingOnly: false
})

const showCourseModal = ref(false)
const courseSearch = ref('')
const selectedCourseKey = ref(null)

const groupChartCanvas = ref(null)
const topCourseChartCanvas = ref(null)
const packageChartCanvas = ref(null)

let groupChartInstance = null
let topCourseChartInstance = null
let packageChartInstance = null

let groupChartLabelLookup = []
let topCourseChartLabelLookup = []

const chartFilters = reactive({
  group: null,
  course: null
})

const hasChartFilters = computed(() =>
  Boolean(chartFilters.group || chartFilters.course)
)

const chartFilterChips = computed(() => {
  const chips = []
  if (chartFilters.group) {
    chips.push({ type: 'group', label: `สายงาน: ${chartFilters.group}` })
  }
  if (chartFilters.course) {
    chips.push({ type: 'course', label: `หลักสูตร: ${chartFilters.course}` })
  }
  return chips
})

const colorPalette = ['#2563eb', '#f97316', '#22c55e', '#a855f7', '#facc15', '#14b8a6', '#ef4444', '#0ea5e9', '#d946ef', '#f87171', '#6366f1', '#fb923c']
const PACKAGE_DATASET_LIMIT = 8
const CUSTOM_PACKAGE_KEYWORDS = ['อื่นๆ', 'อื่น ๆ', 'other', 'custom']
const MATCH_EMPTY_TOKEN = '__empty__'

const simpleNormalize = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  return String(value).trim()
}

const normalizeForComparison = (value) => simpleNormalize(value).toLowerCase()

const normalizeKeyValue = (value) => {
  const normalized = normalizeForComparison(value)
  return normalized || MATCH_EMPTY_TOKEN
}

const buildCandidateList = (...values) => {
  const unique = new Set()
  values.forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(inner => unique.add(normalizeKeyValue(inner)))
    } else {
      unique.add(normalizeKeyValue(value))
    }
  })
  if (!unique.size) {
    unique.add(MATCH_EMPTY_TOKEN)
  }
  return Array.from(unique)
}

const matchesGroupFilter = (record, groupFilter) => {
  if (!groupFilter) {
    return true
  }
  const target = normalizeForComparison(groupFilter)
  if (!target) {
    return true
  }
  const recordGroup = normalizeForComparison(record.group_name || record.employee_group_name)
  return recordGroup === target
}

const buildLocalSummary = (records = []) => {
  const total = records.length

  const courseFrequency = new Map()
  const courseKeySet = new Set()
  const skillSet = new Set()
  let participantSum = 0
  let upskillTotal = 0
  let reskillTotal = 0

  const addSkillTokens = (value) => {
    const normalized = simpleNormalize(value)
    if (!normalized) {
      return
    }

    normalized
      .split(/[\n,;\/|]+/)
      .map(token => token.trim())
      .filter(Boolean)
      .forEach(token => {
        const cleaned = simpleNormalize(token.replace(/^[\[\("]+/, '').replace(/[\]\)"]+$/, ''))
        if (!cleaned) {
          return
        }
        skillSet.add(cleaned.toLowerCase())
      })
  }

  records.forEach(item => {
    const courseNameRaw = simpleNormalize(
      item.course_title ||
      item.selected_course_name ||
      item.course_types
    )
    const courseLabel = courseNameRaw || 'หลักสูตรไม่ระบุชื่อ'
    courseFrequency.set(courseLabel, (courseFrequency.get(courseLabel) || 0) + 1)

    if (courseNameRaw) {
      courseKeySet.add(courseNameRaw.toLowerCase())
    }

    addSkillTokens(item.course_types)
    addSkillTokens(item.course_type)

    const resolvedParticipants = Number(item.participants_resolved) || Number(item.participants) || 0
    const upskillParticipants = Number(item.upskill_participants) || 0
    const reskillParticipants = Number(item.reskill_participants) || 0
    const rosterTotal = upskillParticipants + reskillParticipants

    if (rosterTotal > 0) {
      participantSum += rosterTotal
      upskillTotal += upskillParticipants
      reskillTotal += reskillParticipants
    } else {
      participantSum += resolvedParticipants
    }
  })

  let topCourse = ''
  if (courseFrequency.size > 0) {
    topCourse = Array.from(courseFrequency.entries()).reduce(
      (best, current) => (current[1] > best[1] ? current : best)
    )[0]
  }

  const avgParticipants = total > 0 ? Math.round(participantSum / total) : 0

  const statusCount = {}
  records.forEach(item => {
    const status = simpleNormalize(item.status) || 'ไม่ระบุ'
    statusCount[status] = (statusCount[status] || 0) + 1
  })

  return {
    total,
    topCourse,
    avgParticipants,
    statusCount,
    courseCount: courseKeySet.size,
    skillCount: skillSet.size,
    participantTotal: participantSum,
    developmentTypeTotals: {
      upskill: upskillTotal,
      reskill: reskillTotal
    }
  }
}

const updatePackageChart = async () => {
  if (!process.client || !Chart) return

  const chartData = packageChartData.value
  const labels = chartData.labels
  const datasets = chartData.datasets

  if (!packageChartCanvas.value || labels.length === 0 || datasets.length === 0) {
    if (packageChartInstance) {
      packageChartInstance.destroy()
      packageChartInstance = null
    }
    return
  }

  await nextTick()
  const context = packageChartCanvas.value.getContext('2d')
  if (!context) return

  if (packageChartInstance) {
    packageChartInstance.destroy()
  }

  packageChartInstance = new Chart(context, {
    type: 'bar',
    data: {
      labels,
      datasets
    },
    options: {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const parsedValue = typeof context.parsed === 'number' ? context.parsed : context.parsed?.y
              const value = Number.isFinite(parsedValue) ? parsedValue : 0
              return `${context.label}: ${value} คำขอ`
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#4b5563',
            autoSkip: false,
            maxRotation: 30,
            minRotation: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#4b5563',
            precision: 0
          },
          grid: {
            color: '#e5e7eb'
          }
        }
      }
    }
  })
}

const isCustomPackageItem = (item = {}) => {
  if (!item || typeof item !== 'object') {
    return false
  }

  const code = simpleNormalize(item.selected_package_code || item.package_code || item.package || '').toUpperCase()
  if (code === 'CUSTOM') {
    return true
  }

  const manualFlag = Number(item.is_manual_course) === 1 || simpleNormalize(item.manual_source || item.manualSource)
  if (manualFlag) {
    return true
  }

  const packageName = simpleNormalize(
    item.selected_package_name ||
    item.package_name ||
    item.custom_package_name ||
    ''
  ).toLowerCase()

  if (packageName) {
    return CUSTOM_PACKAGE_KEYWORDS.some(keyword => packageName.includes(keyword))
  }

  return false
}

const summarizeList = (list = [], limit = 3) => {
  if (!Array.isArray(list)) {
    return ''
  }

  const filtered = list.map(value => simpleNormalize(value)).filter(Boolean)
  if (filtered.length === 0) {
    return ''
  }

  if (filtered.length <= limit) {
    return filtered.join(', ')
  }

  const displayed = filtered.slice(0, limit).join(', ')
  const remaining = filtered.length - limit
  return `${displayed} +${remaining}`
}

const containerClass = computed(() =>
  props.embedded ? '' : 'max-w-7xl mx-auto py-8 px-4'
)

const aiCategories = computed(() => Array.isArray(aiResult.value?.categories) ? aiResult.value.categories : [])
const aiSelectedCategory = computed(() => aiCategories.value.find(category => category.id === aiSelectedCategoryId.value) || null)
const aiCourseList = computed(() => {
  const mapping = aiLookup.value || {}
  if (!aiSelectedCategory.value) {
    return Object.values(mapping)
  }
  return (aiSelectedCategory.value.courseIds || []).map(id => mapping[id]).filter(Boolean)
})

const manualSummary = computed(() => manualInsights.value || null)
const manualTopics = computed(() => Array.isArray(manualInsights.value?.topics) ? manualInsights.value.topics : [])
const manualTopicsToDisplay = computed(() => manualTopics.value.slice(0, 6))
const manualTopTerms = computed(() => Array.isArray(manualInsights.value?.topTerms) ? manualInsights.value.topTerms.slice(0, 12) : [])
const manualOverlapTopics = computed(() => manualTopics.value.filter(topic => (topic?.sectionCount || 0) > 1 || (topic?.departmentCount || 0) > 1))

const aiCoverage = computed(() => {
  const coverage = aiResult.value?.dataCoverage || {}
  const manualTotal = manualSummary.value?.totalItems
  const manualAnalyzed = manualSummary.value?.analyzedCount
  const coverageTotal = Number.isFinite(coverage.totalCourses) ? coverage.totalCourses : undefined
  const coverageAnalyzed = Number.isFinite(coverage.analyzedCourses) ? coverage.analyzedCourses : undefined

  const fallbackAnalyzed = aiSelectedCategory.value
    ? aiSelectedCategory.value.courseIds?.length || 0
    : aiCategories.value.reduce((acc, category) => acc + (category.courseIds?.length || 0), 0)

  const totalCourses = manualTotal ?? coverageTotal ?? rawItems.value.length
  const analyzedCourses = manualAnalyzed ?? coverageAnalyzed ?? fallbackAnalyzed

  return {
    totalCourses,
    analyzedCourses
  }
})

const aiPriorityHighlights = computed(() => Array.isArray(aiResult.value?.priorityHighlights) ? aiResult.value.priorityHighlights : [])
const aiUsedFallback = computed(() => Boolean(aiResult.value?.usedFallback || aiMeta.value?.fallback || aiMeta.value?.status === 207))
const aiLastRunLabel = computed(() => {
  if (!aiLastRunAt.value) return ''
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(aiLastRunAt.value)
})

const aiConnectionStatus = computed(() => {
  if (aiLoading.value) {
    return {
      message: 'กำลังเชื่อมต่อกับ Gemini... กรุณารอซักครู่',
      classes: 'border-blue-200 bg-blue-50 text-blue-700',
      icon: 'loading'
    }
  }

  if (aiError.value) {
    return {
      message: 'ไม่สามารถเชื่อมต่อกับ Gemini ได้ ระบบจะแสดงผลสำรอง',
      classes: 'border-red-200 bg-red-50 text-red-700',
      icon: 'error'
    }
  }

  if (manualSummary.value && manualSummary.value.totalItems === 0) {
    return {
      message: 'ยังไม่มีคำขอที่เลือกแพ็คเกจ “อื่นๆ (กำหนดเอง)” ในช่วงที่เลือกไว้',
      classes: 'border-amber-200 bg-amber-50 text-amber-700',
      icon: 'warning'
    }
  }

  if (aiResult.value && !aiUsedFallback.value) {
    return {
      message: 'เชื่อมต่อกับ Gemini สำเร็จ กำลังแสดงผลวิเคราะห์ล่าสุด',
      classes: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      icon: 'success'
    }
  }

  if (aiResult.value && aiUsedFallback.value) {
    return {
      message: 'เชื่อมต่อกับ Gemini ไม่สำเร็จ ระบบใช้การจัดกลุ่มจากข้อมูลเดิมชั่วคราว',
      classes: 'border-amber-200 bg-amber-50 text-amber-700',
      icon: 'warning'
    }
  }

  return {
    message: 'ยังไม่ได้เริ่มการเชื่อมต่อกับ Gemini',
    classes: 'border-gray-200 bg-gray-50 text-gray-500',
    icon: 'idle'
  }
})

const goBack = () => router.back()

const mapBadgeClass = (level) => {
  if (!level) return 'bg-slate-100 text-slate-600'
  const normalized = String(level).toLowerCase()
  if (normalized.includes('สูง') || normalized.includes('high')) {
    return 'bg-rose-100 text-rose-700'
  }
  if (normalized.includes('กลาง') || normalized.includes('medium')) {
    return 'bg-amber-100 text-amber-700'
  }
  if (normalized.includes('ต่ำ') || normalized.includes('low')) {
    return 'bg-emerald-100 text-emerald-700'
  }
  return 'bg-slate-100 text-slate-600'
}

const toDisplayName = (value, fallback = 'ไม่ระบุ') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).trim()
  return text === '' ? fallback : text
}

const mapDevelopmentSourceLabel = (value) => {
  const normalized = normalizeForComparison(value)
  if (normalized === 'roster') {
    return 'รายชื่อจากผู้ร้องขอ'
  }
  if (normalized === 'aggregated') {
    return 'สรุปรวมจากระบบ'
  }
  if (normalized === 'legacy') {
    return 'ข้อมูลตัวเลขจากคำขอรุ่นเก่า'
  }
  return toDisplayName(value, 'ไม่ระบุ')
}

const buildCourseSummary = (records = []) => {
  if (!Array.isArray(records) || records.length === 0) {
    return []
  }

  const map = new Map()

  records.forEach((record, index) => {
    const courseName = toDisplayName(
      record.course_title ||
      record.selected_course_name ||
      record.course_types ||
      record.course_type,
      'หลักสูตรไม่ระบุชื่อ'
    )
    const courseKeyBase = courseName.toLowerCase()
    const courseKey = courseKeyBase || `course-${index + 1}`

    if (!map.has(courseKey)) {
      map.set(courseKey, {
        key: courseKey,
        courseName,
        requestCount: 0,
        totalParticipants: 0,
        upskillParticipants: 0,
        reskillParticipants: 0,
        packages: new Set(),
        groups: new Set(),
        departments: new Set(),
        sections: new Set(),
        requests: [],
        participantRoster: [],
        missingRosterRequests: [],
        lastRequestedAt: null
      })
    }

    const entry = map.get(courseKey)
    entry.requestCount += 1

    const totalParticipants = Number(record.participants_resolved) || Number(record.participants) || 0
    const upskillParticipants = Number(record.upskill_participants) || 0
    const reskillParticipants = Number(record.reskill_participants) || 0

    entry.totalParticipants += totalParticipants
    entry.upskillParticipants += upskillParticipants
    entry.reskillParticipants += reskillParticipants

    const packageName = toDisplayName(
      record.selected_package_name ||
      record.package_name ||
      record.custom_package_name ||
      record.package,
      'ไม่ระบุแพ็คเกจ'
    )
    entry.packages.add(packageName)

    const groupName = toDisplayName(
      record.group_name ||
      record.group_full_name ||
      record.employee_group_name ||
      record.employee_group_line,
      'ไม่ระบุ'
    )
    entry.groups.add(groupName)

    const departmentName = toDisplayName(
      record.department ||
      record.department_full_name ||
      record.employee_department,
      'ไม่ระบุ'
    )
    entry.departments.add(departmentName)

    const sectionName = toDisplayName(
      record.section ||
      record.section_full_name ||
      record.employee_section,
      'ไม่ระบุ'
    )
    entry.sections.add(sectionName)

    if (!entry.lastRequestedAt || new Date(record.created_at) > new Date(entry.lastRequestedAt)) {
      entry.lastRequestedAt = record.created_at
    }

    const requester = toDisplayName(record.employee_name || record.requested_by, '')
    const quarter = simpleNormalize(record.quarter)
    const source = simpleNormalize(record.development_participant_source)

    const requestEntry = {
      requestId: record.id,
      courseName,
      packageName,
      groupName,
      departmentName,
      sectionName,
      requester,
      quarter,
      participants: totalParticipants,
      upskillParticipants,
      reskillParticipants,
      source,
      createdAt: record.created_at,
      status: simpleNormalize(record.status),
      roster: Array.isArray(record.participant_roster) ? record.participant_roster : []
    }

    entry.requests.push(requestEntry)

    if (requestEntry.roster.length) {
      requestEntry.roster.forEach(participant => {
        entry.participantRoster.push({
          ...participant,
          requestId: record.id,
          courseName,
          packageName,
          groupName,
          departmentName,
          sectionName,
          requester,
          quarter,
          source,
          createdAt: record.created_at
        })
      })
    } else if (totalParticipants > 0) {
      entry.missingRosterRequests.push({
        requestId: record.id,
        packageName,
        groupName,
        departmentName,
        sectionName,
        requester,
        totalParticipants,
        upskillParticipants,
        reskillParticipants,
        source,
        quarter,
        createdAt: record.created_at
      })
    }
  })

  return Array.from(map.values()).map(entry => {
    entry.requests.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    entry.participantRoster.sort((a, b) => {
      const courseCompare = toDisplayName(a.courseName).localeCompare(toDisplayName(b.courseName), 'th-TH')
      if (courseCompare !== 0) {
        return courseCompare
      }
      const requestCompare = Number(a.requestId || 0) - Number(b.requestId || 0)
      if (requestCompare !== 0) {
        return requestCompare
      }
      return toDisplayName(a.name || a.participant_name).localeCompare(toDisplayName(b.name || b.participant_name), 'th-TH')
    })

    return {
      key: entry.key,
      courseName: entry.courseName,
      requestCount: entry.requestCount,
      totalParticipants: entry.totalParticipants,
      upskillParticipants: entry.upskillParticipants,
      reskillParticipants: entry.reskillParticipants,
      packages: Array.from(entry.packages).sort((a, b) => a.localeCompare(b, 'th-TH')),
      groups: Array.from(entry.groups).sort((a, b) => a.localeCompare(b, 'th-TH')),
      departments: Array.from(entry.departments).sort((a, b) => a.localeCompare(b, 'th-TH')),
      sections: Array.from(entry.sections).sort((a, b) => a.localeCompare(b, 'th-TH')),
      requests: entry.requests,
      participantRoster: entry.participantRoster,
      missingRosterRequests: entry.missingRosterRequests,
      rosterAvailable: entry.participantRoster.length > 0,
      rosterCount: entry.participantRoster.length,
      lastRequestedAt: entry.lastRequestedAt
    }
  }).sort((a, b) => {
    if (b.totalParticipants !== a.totalParticipants) {
      return b.totalParticipants - a.totalParticipants
    }
    if (b.requestCount !== a.requestCount) {
      return b.requestCount - a.requestCount
    }
    return a.courseName.localeCompare(b.courseName, 'th-TH')
  })
}

const learningModeLabelMap = {
  onsite: 'On-site (อบรมที่สถานที่จริง)',
  online: 'Online (ถ่ายทอดสดผ่านวิดีโอ)',
  elearning: 'E-Learning (เรียนด้วยตนเอง)',
  other: 'รูปแบบอื่น ๆ',
  unknown: 'ไม่ระบุรูปแบบ'
}

const normalizeLearningMode = (value) => {
  if (value === null || value === undefined) return 'unknown'
  const text = String(value).trim().toLowerCase()
  if (!text) return 'unknown'
  if (learningModeLabelMap[text]) {
    return text
  }
  return 'other'
}

const buildCourseLookupEntry = (item = {}, id, index) => {
  const safeId = id || `course-${index + 1}`
  const strategyTags = [
    item.plan_name,
    item.objective_code,
    item.strategy_code,
    item.tactic_code,
    item.action_plan_code
  ]
    .map(value => (value || '').toString().trim())
    .filter(Boolean)

  return {
    id: safeId,
    title: (item.course_title || item.course_types || 'ไม่ระบุหลักสูตร').toString(),
    department: (item.department || item.employee_department || 'ไม่ระบุหน่วยงาน').toString(),
    participants: Number(item.participants) || 0,
    objective: (item.training_objective || '').toString(),
    outcome: (item.expected_outcome || '').toString(),
    notes: (item.free_text || item.custom_request || '').toString(),
    requester: (item.employee_name || item.requested_by || '').toString(),
    createdAt: item.created_at || null,
    strategy: strategyTags,
    courseType: (item.course_type || item.course_types || '').toString()
  }
}

const ALLOWED_SECTION_CODES = ['0010332601']
const allowedSectionDisplay = 'ที่ขึ้นต้นด้วย 0010332601'

const sectionCode = computed(() => {
  const user = currentUser.value
  const candidates = [
    user?.section_full_code,
    user?.sectionFullCode,
    user?.section_code,
    user?.sectionCode,
    user?.section_prefix
  ]
  for (const candidate of candidates) {
    if (candidate !== null && candidate !== undefined && String(candidate).trim() !== '') {
      return String(candidate).trim()
    }
  }
  return ''
})
const sectionDigits = computed(() => sectionCode.value.replace(/[^0-9]/g, ''))
const hasOrgWideAccess = computed(() => {
  const digits = sectionDigits.value
  if (!digits) return false
  return ALLOWED_SECTION_CODES.some(code => digits.includes(code))
})

const isAuthorized = computed(() => {
  if (!currentUser.value) return false
  if (currentUser.value.role === 'hrd_admin') return true
  return hasOrgWideAccess.value
})

const ensureAuth = async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
}

const loadPackageFilters = async () => {
  if (!process.client) {
    packagesLoading.value = false
    return
  }

  packagesLoading.value = true
  packageOptionsError.value = null

  try {
    const response = await fetch('http://localhost:4001/api/courses/packages', {
      credentials: 'include',
      headers: {
        Accept: 'application/json'
      }
    })

    let payload = null
    try {
      payload = await response.json()
    } catch (parseError) {
      payload = null
    }

    if (!response.ok) {
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถโหลดรายการแพ็กเกจได้`
      throw new Error(message)
    }

    const data = Array.isArray(payload) ? payload : []
    const nameMap = new Map()

    data.forEach(pkg => {
      const name = simpleNormalize(pkg.package_name)
      if (name && !nameMap.has(name)) {
        nameMap.set(name, { value: name, label: name })
      }
    })

    packageOptions.value = Array.from(nameMap.values())
      .sort((a, b) => a.label.localeCompare(b.label, 'th-TH'))

    if (rawItems.value.length) {
      updatePackageFiltersFromData(rawItems.value)
      updateGroupOptionsFromData(rawItems.value)
    }
  } catch (err) {
    console.error('Failed to load package filters:', err)
    packageOptions.value = []
    packageOptionsError.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดรายการแพ็กเกจได้'
  } finally {
    packagesLoading.value = false
  }
}

const fetchReports = async () => {
  if (!isClient.value) {
    return
  }

  await ensureAuth()

  if (!currentUser.value) {
    error.value = 'ไม่พบข้อมูลผู้ใช้งาน'
    loading.value = false
    return
  }

  if (!isAuthorized.value) {
    error.value = 'คุณไม่มีสิทธิ์เข้าถึงรายงานนี้'
    loading.value = false
    return
  }

  try {
    loading.value = true
    error.value = null

    const params = new URLSearchParams()
    if (filters.packageName) params.append('packageName', filters.packageName)
    if (filters.groupName) params.append('groupName', filters.groupName)

    const response = await fetch(`http://localhost:4001/api/reports?${params.toString()}`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json'
      }
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถโหลดรายงานได้`
      throw new Error(message)
    }
    const data = payload || {}
    const uniqueItems = Array.isArray(data.items) ? data.items : []
    const allItems = Array.isArray(data.rawItems) ? data.rawItems : uniqueItems

    updatePackageFiltersFromData(allItems)
    updateGroupOptionsFromData(allItems)

    const appliedUnique = filters.groupName ? uniqueItems.filter(item => matchesGroupFilter(item, filters.groupName)) : uniqueItems
    const appliedAll = filters.groupName ? allItems.filter(item => matchesGroupFilter(item, filters.groupName)) : allItems

    baseItems.value = Array.isArray(appliedUnique) ? [...appliedUnique] : []
    baseRawItems.value = Array.isArray(appliedAll) ? [...appliedAll] : []
  baseCourseSummary.value = buildCourseSummary(appliedAll)

    clearChartFilters()
    hasFetched.value = true

    aiResult.value = null
    aiMeta.value = null
    aiError.value = null
    aiSelectedCategoryId.value = 'all'
    aiLookup.value = {}
    manualInsights.value = null
  } catch (err) {
    console.error('Failed to fetch reports:', err)
    error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดรายงาน'
    baseItems.value = []
    baseRawItems.value = []
    baseCourseSummary.value = []
    courseSummary.value = []
    clearChartFilters()
    groupOptions.value = []
    manualInsights.value = null
  } finally {
    loading.value = false
    await nextTick()
    updateGroupChart()
    updateTopCourseChart()
  updatePackageChart()
  }
}

const fetchOrgStructure = async () => {
  if (orgStructureLoading.value) {
    return
  }

  orgStructureLoading.value = true
  orgStructureError.value = null

  try {
    const response = await fetch('http://localhost:4001/api/reports/org-structure', {
      credentials: 'include',
      headers: {
        Accept: 'application/json'
      }
    })

    const payload = await response.json().catch(() => null)

    if (!response.ok) {
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถโหลดโครงสร้างองค์กรได้`
      throw new Error(message)
    }

    const groups = Array.isArray(payload?.groups) ? payload.groups : []
    const totals = payload?.totals && typeof payload.totals === 'object'
      ? payload.totals
      : {
          groups: groups.length,
          departments: groups.reduce((sum, group) => sum + (Array.isArray(group.departments) ? group.departments.length : 0), 0),
          sections: groups.reduce((sum, group) => sum + (Array.isArray(group.departments)
            ? group.departments.reduce((deptSum, dept) => deptSum + (Array.isArray(dept.sections) ? dept.sections.length : 0), 0)
            : 0), 0)
        }

    orgStructure.value = { groups, totals }
  } catch (err) {
    console.error('Failed to fetch organization structure:', err)
    orgStructureError.value = err instanceof Error ? err.message : 'ไม่สามารถโหลดโครงสร้างองค์กรได้'
  } finally {
    orgStructureLoading.value = false
  }
}

const openOrgMapModal = async () => {
  if (!isAuthorized.value) {
    return
  }
  showOrgMapModal.value = true
  if (!orgStructure.value && !orgStructureLoading.value) {
    await fetchOrgStructure()
  }
}

const closeOrgMapModal = () => {
  showOrgMapModal.value = false
  orgViewOptions.showMissingOnly = false
}

const openCourseModal = () => {
  if (!Array.isArray(courseSummary.value) || courseSummary.value.length === 0) {
    return
  }
  if (!selectedCourseKey.value && filteredCourses.value.length) {
    selectedCourseKey.value = filteredCourses.value[0].key
  }
  showCourseModal.value = true
}

const closeCourseModal = () => {
  showCourseModal.value = false
}

const runAiClassification = async () => {
  if (!rawItems.value.length) {
    aiError.value = 'ไม่มีข้อมูลคำขอฝึกอบรมสำหรับการวิเคราะห์'
    return
  }

  aiLoading.value = true
  aiError.value = null

  const lookup = Object.create(null)
  let customLookupIndex = 0
  const annotatedItems = rawItems.value.map((item, index) => {
    const id = (item.id || item.training_need_id || item.training_needs_id || item.request_id || item.employee_id || `course-${index + 1}`).toString()
    if (isCustomPackageItem(item) && customLookupIndex < 40) {
      lookup[id] = buildCourseLookupEntry(item, id, customLookupIndex)
      customLookupIndex += 1
    }
    return {
      ...item,
      id
    }
  })

  aiLookup.value = {}
  manualInsights.value = null

  try {
    const response = await fetch('http://localhost:4001/api/reports/classify', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: annotatedItems })
    })

    const payload = await response.json().catch(() => null)
    const isMultiStatus = response.status === 207

    if (payload?.manualInsights) {
      manualInsights.value = payload.manualInsights
    }

    if (!response.ok && !isMultiStatus) {
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถวิเคราะห์ข้อมูลได้`
      throw new Error(message)
    }

    if (!payload?.result) {
      throw new Error('ไม่พบผลลัพธ์จากการวิเคราะห์ด้วย Gemini')
    }

    aiResult.value = payload.result
    aiMeta.value = {
      ...(payload.meta || {}),
      status: response.status,
      fallback: Boolean(payload.meta?.fallback || payload.result?.usedFallback || isMultiStatus),
      total: payload.meta?.sentToGemini || payload.meta?.total || annotatedItems.length
    }
    aiLookup.value = lookup
    aiLastRunAt.value = new Date()
    aiSelectedCategoryId.value = payload.result.categories?.[0]?.id || (Object.keys(lookup)[0] ? Object.keys(lookup)[0] : 'all')
  } catch (err) {
    console.error('Gemini insight failed:', err)
    aiError.value = err instanceof Error ? err.message : 'ไม่สามารถวิเคราะห์ข้อมูลได้'
    aiResult.value = null
    aiMeta.value = null
    aiLookup.value = {}
    aiSelectedCategoryId.value = 'all'
    aiLastRunAt.value = null
  } finally {
    aiLoading.value = false
  }
}

const resetAiInsight = () => {
  aiResult.value = null
  aiMeta.value = null
  aiError.value = null
  aiSelectedCategoryId.value = 'all'
  aiLookup.value = {}
  aiLastRunAt.value = null
  manualInsights.value = null
}

const updatePackageFiltersFromData = (data = []) => {
  packageOptionsError.value = null

  const nameMap = new Map(packageOptions.value.map(option => [option.value, option]))

  data.forEach(item => {
    const rawName = simpleNormalize(item.selected_package_name || item.package_name || item.package || '')
    if (rawName && !nameMap.has(rawName)) {
      nameMap.set(rawName, { value: rawName, label: rawName })
    }
  })

  packageOptions.value = Array.from(nameMap.values())
    .sort((a, b) => a.label.localeCompare(b.label, 'th-TH'))
}

const updateGroupOptionsFromData = (data = []) => {
  const optionsMap = new Map(groupOptions.value.map(option => [option.value, option]))

  data.forEach(item => {
    const groupAbbr = toDisplayName(item.group_name || item.employee_group_short || item.employee_group_name, '')
    if (!groupAbbr) {
      return
    }

    const groupFull = toDisplayName(item.group_full_name || item.employee_group_name || '', '')
    const option = optionsMap.get(groupAbbr)

    if (!option) {
      const label = groupFull && groupFull !== groupAbbr
        ? `${groupAbbr} · ${groupFull}`
        : groupAbbr
      optionsMap.set(groupAbbr, {
        value: groupAbbr,
        label,
        fullName: groupFull
      })
    } else if (!option.fullName && groupFull) {
      option.fullName = groupFull
      option.label = groupFull !== groupAbbr
        ? `${groupAbbr} · ${groupFull}`
        : groupAbbr
    }
  })

  groupOptions.value = Array.from(optionsMap.values())
    .sort((a, b) => a.value.localeCompare(b.value, 'th-TH'))
}

const processGroupStats = (data) => {
  const groups = new Map()

  data.forEach(item => {
    const groupName = toDisplayName(item.group_name)
    const groupFullName = toDisplayName(item.group_full_name || item.group_name)
    const departmentName = toDisplayName(item.department)
    const departmentFullName = toDisplayName(item.department_full_name || item.department)
    const sectionName = toDisplayName(item.section)
    const sectionFullName = toDisplayName(item.section_full_name || item.section)
  const resolvedParticipants = Number(item.participants_resolved) || Number(item.participants) || 0
  const upskillParticipantsRaw = Number(item.upskill_participants) || 0
  const reskillParticipantsRaw = Number(item.reskill_participants) || 0
  const rosterTotal = upskillParticipantsRaw + reskillParticipantsRaw
  const hasRoster = rosterTotal > 0
  const participantCount = hasRoster ? rosterTotal : resolvedParticipants
  const upskillCount = hasRoster ? upskillParticipantsRaw : 0
  const reskillCount = hasRoster ? reskillParticipantsRaw : 0

    if (!groups.has(groupName)) {
      groups.set(groupName, {
        name: groupName,
        fullName: groupFullName,
        total: 0,
        totalParticipants: 0,
        upskillParticipants: 0,
        reskillParticipants: 0,
        departments: new Map(),
        strategicObjectives: new Map()
      })
    }

    const group = groups.get(groupName)
    if (!group.fullName && groupFullName) {
      group.fullName = groupFullName
    }
    group.total += 1
    group.totalParticipants += participantCount
    group.upskillParticipants += upskillCount
    group.reskillParticipants += reskillCount

    const objectiveCode = simpleNormalize(item.strategic_objective_code || item.objective_code || '')
    const objectiveName = simpleNormalize(item.strategic_objective_name || item.objective_name || '')
    const objectiveLabel = (() => {
      if (objectiveCode && objectiveName) {
        const normalizedCode = objectiveCode.toLowerCase()
        const normalizedName = objectiveName.toLowerCase()
        if (normalizedName.startsWith(normalizedCode)) {
          return objectiveName
        }
        return `${objectiveCode} · ${objectiveName}`
      }
      return objectiveCode || objectiveName
    })()

    if (objectiveLabel) {
      const objectiveKey = objectiveLabel.toLowerCase()
      if (!group.strategicObjectives.has(objectiveKey)) {
        group.strategicObjectives.set(objectiveKey, objectiveLabel)
      }
    }

    if (!group.departments.has(departmentName)) {
      group.departments.set(departmentName, {
        name: departmentName,
        fullName: departmentFullName,
        total: 0,
        totalParticipants: 0,
        upskillParticipants: 0,
        reskillParticipants: 0,
        sections: new Map(),
        courseCounts: new Map()
      })
    }

    const department = group.departments.get(departmentName)
    if (!department.fullName && departmentFullName) {
      department.fullName = departmentFullName
    }
    department.total += 1
    department.totalParticipants += participantCount
    department.upskillParticipants += upskillCount
    department.reskillParticipants += reskillCount

    if (!department.sections.has(sectionName)) {
      department.sections.set(sectionName, {
        name: sectionName,
        fullName: sectionFullName,
        count: 0,
        totalParticipants: 0,
        upskillParticipants: 0,
        reskillParticipants: 0
      })
    }

    const section = department.sections.get(sectionName)
    if (!section.fullName && sectionFullName) {
      section.fullName = sectionFullName
    }
    section.count += 1
    section.totalParticipants += participantCount
    section.upskillParticipants += upskillCount
    section.reskillParticipants += reskillCount

    const courseName = toDisplayName(item.course_title || item.course_types, 'หลักสูตรไม่ระบุชื่อ')
    if (!department.courseCounts.has(courseName)) {
      department.courseCounts.set(courseName, {
        name: courseName,
        requestCount: 0,
        totalParticipants: 0,
        sections: new Map()
      })
    }

    const courseEntry = department.courseCounts.get(courseName)
    courseEntry.requestCount += 1
    courseEntry.totalParticipants += participantCount
    if (!courseEntry.sections.has(sectionName)) {
      courseEntry.sections.set(sectionName, {
        name: sectionName,
        fullName: sectionFullName
      })
    }
  })

  groupStats.value = Array.from(groups.values())
    .sort((a, b) => a.name.localeCompare(b.name, 'th-TH'))
    .map(group => {
      const departments = Array.from(group.departments.values())
        .sort((a, b) => a.name.localeCompare(b.name, 'th-TH'))
        .map(department => {
          const sections = Array.from(department.sections.values())
            .sort((a, b) => a.name.localeCompare(b.name, 'th-TH'))
            .map(section => {
              const labelSource = section.fullName && section.fullName !== section.name
                ? section.fullName
                : section.name
              const displayName = labelSource || 'ไม่ระบุ'

              return {
                name: section.name,
                fullName: section.fullName,
                displayName,
                count: section.count,
                totalParticipants: section.totalParticipants,
                avgParticipants: section.count > 0 ? section.totalParticipants / section.count : 0,
                upskillParticipants: section.upskillParticipants,
                reskillParticipants: section.reskillParticipants
              }
            })

          const sortedCourseStats = Array.from(department.courseCounts.values())
            .map(entry => {
              const sectionList = Array.from(entry.sections.values())
                .sort((a, b) => a.name.localeCompare(b.name, 'th-TH'))
                .map(section => ({
                  name: section.name,
                  fullName: section.fullName,
                  displayName: (() => {
                    const labelSource = section.fullName && section.fullName !== section.name
                      ? section.fullName
                      : section.name
                    return labelSource || 'ไม่ระบุ'
                  })()
                }))

              return {
                name: entry.name,
                totalParticipants: entry.totalParticipants,
                requestCount: entry.requestCount,
                participantShare: department.totalParticipants > 0
                  ? Math.round((entry.totalParticipants / department.totalParticipants) * 100)
                  : 0,
                sections: sectionList
              }
            })
            .sort((a, b) => {
              const participantDiff = b.totalParticipants - a.totalParticipants
              if (participantDiff !== 0) {
                return participantDiff
              }
              return b.requestCount - a.requestCount
            })

          const topCourseParticipants = sortedCourseStats[0]?.totalParticipants || 0
          const courseStats = sortedCourseStats.map(entry => ({
            ...entry,
            relativeToTop: topCourseParticipants > 0
              ? Math.round((entry.totalParticipants / topCourseParticipants) * 100)
              : 0
          }))

          return {
            name: department.name,
            fullName: department.fullName,
            total: department.total,
            totalParticipants: department.totalParticipants,
            avgParticipants: department.total > 0 ? department.totalParticipants / department.total : 0,
            sectionCount: sections.length,
            sections,
            courseStats,
            topCourseName: courseStats[0]?.name || '',
            topCourseParticipants,
            upskillParticipants: department.upskillParticipants,
            reskillParticipants: department.reskillParticipants
          }
        })

      const sectionCount = departments.reduce((sum, department) => sum + department.sectionCount, 0)

      return {
        name: group.name,
        fullName: group.fullName,
        total: group.total,
        totalParticipants: group.totalParticipants,
        avgParticipants: group.total > 0 ? group.totalParticipants / group.total : 0,
        upskillParticipants: group.upskillParticipants,
        reskillParticipants: group.reskillParticipants,
        departmentCount: departments.length,
        sectionCount,
        strategicObjectives: Array.from(group.strategicObjectives.values()).sort((a, b) => a.localeCompare(b, 'th-TH')),
        departments
      }
    })
}

const applyDataset = (uniqueRecords = [], allRecords = []) => {
  const uniqueCopy = Array.isArray(uniqueRecords) ? [...uniqueRecords] : []
  const allCopy = Array.isArray(allRecords) ? [...allRecords] : []

  const localSummary = buildLocalSummary(allCopy)
  summary.total = localSummary.total
  summary.topCourse = localSummary.topCourse || '-'
  summary.avgParticipants = localSummary.avgParticipants
  summary.statusCount = localSummary.statusCount
  summary.courseCount = localSummary.courseCount || 0
  summary.participantTotal = localSummary.participantTotal || 0
  summary.skillCount = localSummary.skillCount || 0
  summary.developmentTypeTotals = localSummary.developmentTypeTotals || { upskill: 0, reskill: 0 }

  items.value = uniqueCopy
  rawItems.value = allCopy

  processGroupStats(allCopy)
  courseSummary.value = buildCourseSummary(allCopy)

  nextTick(() => {
    updateGroupChart()
    updateTopCourseChart()
  updatePackageChart()
  })
}

const applyChartFilters = () => {
  const sourceUnique = Array.isArray(baseItems.value) ? baseItems.value : []
  const sourceAll = Array.isArray(baseRawItems.value) ? baseRawItems.value : []

  const matchesFilters = (item) => {
    if (chartFilters.group) {
      const groupName = toDisplayName(item.group_name || item.employee_group_name, 'ไม่ระบุ')
      if (groupName !== chartFilters.group) {
        return false
      }
    }

    if (chartFilters.course) {
      const courseName = toDisplayName(item.course_title || item.course_types, 'หลักสูตรไม่ระบุชื่อ')
      if (courseName !== chartFilters.course) {
        return false
      }
    }

    return true
  }

  if (!hasChartFilters.value) {
    applyDataset(sourceUnique, sourceAll)
    return
  }

  const filteredUnique = sourceUnique.filter(matchesFilters)
  const filteredAll = sourceAll.filter(matchesFilters)

  applyDataset(filteredUnique, filteredAll)
}

const clearChartFilters = () => {
  chartFilters.group = null
  chartFilters.course = null
  applyChartFilters()
}

const clearChartFilter = (type) => {
  if (!Object.prototype.hasOwnProperty.call(chartFilters, type)) {
    return
  }
  chartFilters[type] = null
  applyChartFilters()
}

const toggleGroupChartFilter = (label) => {
  chartFilters.group = chartFilters.group === label ? null : label
  applyChartFilters()
}

const toggleCourseChartFilter = (label) => {
  chartFilters.course = chartFilters.course === label ? null : label
  applyChartFilters()
}

const topCourseEntries = computed(() => {
  if (!Array.isArray(rawItems.value) || rawItems.value.length === 0) {
    return []
  }

  const counts = new Map()
  rawItems.value.forEach(item => {
    const title = toDisplayName(item.course_title || item.course_types, 'หลักสูตรไม่ระบุชื่อ')
    counts.set(title, (counts.get(title) || 0) + 1)
  })

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const hasTopCourseData = computed(() => topCourseEntries.value.length > 0)

const learningModeStats = computed(() => {
  if (!Array.isArray(rawItems.value) || rawItems.value.length === 0) {
    return []
  }

  const aggregates = new Map()
  rawItems.value.forEach(item => {
    const key = normalizeLearningMode(item.learning_mode)
    const participants = Number(item.participants_resolved) || Number(item.participants) || 0
    if (!aggregates.has(key)) {
      aggregates.set(key, { requests: 0, participants: 0 })
    }
    const entry = aggregates.get(key)
    entry.requests += 1
    entry.participants += participants
  })

  if (aggregates.size === 0) {
    return []
  }

  const totalParticipants = Array.from(aggregates.values()).reduce((sum, entry) => sum + entry.participants, 0)

  return Array.from(aggregates.entries())
    .map(([key, entry]) => ({
      key,
      label: learningModeLabelMap[key] || learningModeLabelMap.other,
      participants: entry.participants,
      requests: entry.requests,
      percentage: totalParticipants > 0
        ? Math.round((entry.participants / totalParticipants) * 100)
        : 0
    }))
    .sort((a, b) => b.participants - a.participants)
})

const overallDevelopmentStats = computed(() => {
  const totals = summary.developmentTypeTotals || { upskill: 0, reskill: 0 }
  const upskill = Number(totals.upskill) || 0
  const reskill = Number(totals.reskill) || 0
  const hasBreakdown = upskill + reskill > 0
  const fallbackTotal = Number(summary.participantTotal) || 0
  return {
    upskill,
    reskill,
    total: hasBreakdown ? upskill + reskill : fallbackTotal,
    hasBreakdown
  }
})

const topLearningMode = computed(() => learningModeStats.value[0] || null)

const packageChartData = computed(() => {
  if (!Array.isArray(rawItems.value) || rawItems.value.length === 0) {
    return {
      labels: [],
      datasets: [],
      remainderCount: 0
    }
  }

  const packageMap = new Map()

  rawItems.value.forEach(item => {
    const label = toDisplayName(
      item.selected_package_name ||
      item.package_name ||
      item.custom_package_name ||
      item.package,
      'ไม่ระบุแพ็คเกจ'
    )
    const key = label.toLowerCase()
    if (!packageMap.has(key)) {
      packageMap.set(key, { label, count: 0 })
    }
    packageMap.get(key).count += 1
  })

  const sortedPackages = Array.from(packageMap.values())
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'th-TH'))

  const primaryPackages = sortedPackages.slice(0, PACKAGE_DATASET_LIMIT)
  const remainderPackages = sortedPackages.slice(PACKAGE_DATASET_LIMIT)

  const labels = primaryPackages.map(pkg => pkg.label)
  const data = primaryPackages.map(pkg => pkg.count)
  const backgroundColor = labels.map((_, index) => colorPalette[index % colorPalette.length])

  if (remainderPackages.length) {
    const remainderTotal = remainderPackages.reduce((sum, pkg) => sum + pkg.count, 0)
    if (remainderTotal > 0) {
      labels.push('อื่นๆ (แพ็คเกจเพิ่มเติม)')
      data.push(remainderTotal)
      backgroundColor.push('#94a3b8')
    }
  }

  const datasets = data.length
    ? [{
        label: 'จำนวนคำขอ',
        data,
        backgroundColor,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false
      }]
    : []

  return {
    labels,
    datasets,
    remainderCount: remainderPackages.length
  }
})

const filteredCourses = computed(() => {
  const list = Array.isArray(courseSummary.value) ? courseSummary.value : []
  const keyword = normalizeForComparison(courseSearch.value)
  if (!keyword) {
    return list
  }

  return list.filter(course => {
    const tokens = [
      course.courseName,
      ...(Array.isArray(course.packages) ? course.packages : []),
      ...(Array.isArray(course.groups) ? course.groups : []),
      ...(Array.isArray(course.departments) ? course.departments : []),
      ...(Array.isArray(course.sections) ? course.sections : [])
    ]
      .map(value => normalizeForComparison(value))
      .filter(Boolean)
    if (!tokens.length) {
      return false
    }
    return tokens.some(token => token.includes(keyword))
  })
})

const selectedCourse = computed(() => {
  const list = filteredCourses.value
  if (!list.length) {
    return null
  }
  if (!selectedCourseKey.value) {
    return list[0]
  }
  const matched = list.find(course => course.key === selectedCourseKey.value)
  return matched || list[0]
})

const selectedCourseRequests = computed(() => {
  if (!selectedCourse.value) {
    return []
  }
  return Array.isArray(selectedCourse.value.requests) ? selectedCourse.value.requests : []
})

const selectedCourseRoster = computed(() => {
  if (!selectedCourse.value) {
    return []
  }
  return Array.isArray(selectedCourse.value.participantRoster) ? selectedCourse.value.participantRoster : []
})

const selectedCourseMissingRoster = computed(() => {
  if (!selectedCourse.value) {
    return []
  }
  return Array.isArray(selectedCourse.value.missingRosterRequests) ? selectedCourse.value.missingRosterRequests : []
})

const selectedCoursePackages = computed(() => Array.isArray(selectedCourse.value?.packages) ? selectedCourse.value.packages : [])
const selectedCourseGroups = computed(() => Array.isArray(selectedCourse.value?.groups) ? selectedCourse.value.groups : [])
const selectedCourseDepartments = computed(() => Array.isArray(selectedCourse.value?.departments) ? selectedCourse.value.departments : [])
const selectedCourseSections = computed(() => Array.isArray(selectedCourse.value?.sections) ? selectedCourse.value.sections : [])

const selectedCourseHasRoster = computed(() => selectedCourseRoster.value.length > 0)

const courseModalMetrics = computed(() => {
  const allCourses = Array.isArray(baseCourseSummary.value) ? baseCourseSummary.value : []
  const currentCourses = filteredCourses.value
  const totalParticipants = currentCourses.reduce((sum, course) => sum + (course.totalParticipants || 0), 0)
  const rosterCourses = currentCourses.filter(course => course.rosterAvailable).length
  return {
    totalCourses: allCourses.length,
    filteredCourses: currentCourses.length,
    totalParticipants,
    rosterCourses
  }
})

const coverageLookup = computed(() => {
  const map = new Map()

  rawItems.value.forEach(item => {
    const groupCandidates = buildCandidateList(
      item.group_short,
      item.group_name,
      item.group_full_name,
      item.department_group_short,
      item.department_group,
      item.employee_group_short,
      item.employee_group_name,
      item.employee_group_id,
      item.employee_group_line
    )

    const departmentCandidates = buildCandidateList(
      item.department_short,
      item.department,
      item.department_full_name,
      item.employee_department_short,
      item.employee_department
    )

    const sectionCandidates = buildCandidateList(
      item.section_code,
      item.section_short,
      item.section_prefix,
      item.section_full_name,
      item.section,
      item.employee_section_short,
      item.employee_section,
      item.employee_section_code
    )

    const canonicalKey = `${groupCandidates[0]}::${departmentCandidates[0]}::${sectionCandidates[0]}`
    let entry = map.get(canonicalKey)
    if (!entry) {
      entry = {
        canonicalKey,
        count: 0,
        latestAt: null
      }
      map.set(canonicalKey, entry)
    }

    entry.count += 1

    if (item.created_at) {
      const createdAt = new Date(item.created_at)
      if (!Number.isNaN(createdAt.getTime())) {
        if (!entry.latestAt || createdAt > entry.latestAt) {
          entry.latestAt = createdAt
        }
      }
    }

    const variantKeys = new Set()
    groupCandidates.forEach(groupKey => {
      departmentCandidates.forEach(departmentKey => {
        sectionCandidates.forEach(sectionKey => {
          variantKeys.add(`${groupKey}::${departmentKey}::${sectionKey}`)
        })
      })
    })

    variantKeys.forEach(key => {
      if (!map.has(key)) {
        map.set(key, entry)
      }
    })
  })

  return map
})

const findCoverageEntry = ({
  groupShort,
  groupName,
  departmentShort,
  departmentName,
  sectionShort,
  sectionName,
  sectionCode
}) => {
  const groupCandidates = buildCandidateList(groupShort, groupName)
  const departmentCandidates = buildCandidateList(departmentShort, departmentName)
  const sectionCandidates = buildCandidateList(sectionCode, sectionShort, sectionName)

  for (const groupKey of groupCandidates) {
    for (const departmentKey of departmentCandidates) {
      for (const sectionKey of sectionCandidates) {
        const lookupKey = `${groupKey}::${departmentKey}::${sectionKey}`
        if (coverageLookup.value.has(lookupKey)) {
          return coverageLookup.value.get(lookupKey)
        }
      }
    }
  }

  return null
}

const orgCoverage = computed(() => {
  const groupsSource = Array.isArray(orgStructure.value?.groups) ? orgStructure.value.groups : []
  const groups = []

  let totalDepartments = 0
  let totalSections = 0
  let submittedDepartments = 0
  let submittedSections = 0
  let submittedGroups = 0

  groupsSource.forEach(group => {
    const groupShort = simpleNormalize(group.groupShort)
    const groupName = simpleNormalize(group.groupName)
    const groupId = group.id || `group-${groups.length + 1}`

    const departmentResults = []
    let groupSectionTotal = 0
    let groupSectionSubmitted = 0

    const departmentsSource = Array.isArray(group.departments) ? group.departments : []

    departmentsSource.forEach(department => {
      const departmentShort = simpleNormalize(department.departmentShort)
      const departmentName = simpleNormalize(department.departmentName)
      const departmentId = department.id || `${groupId}-dept-${departmentResults.length + 1}`

      const sectionsSource = Array.isArray(department.sections) ? department.sections : []
      if (sectionsSource.length === 0) {
        return
      }

      const sectionEntries = sectionsSource.map((section, index) => {
        const sectionShort = simpleNormalize(section.sectionShort)
        const sectionName = simpleNormalize(section.sectionName)
        const sectionCode = simpleNormalize(section.sectionCode)
        const sectionId = section.id || `${departmentId}-section-${index}`

        const coverageEntry = findCoverageEntry({
          groupShort,
          groupName,
          departmentShort,
          departmentName,
          sectionShort,
          sectionName,
          sectionCode
        }) || null

        const requestCount = coverageEntry?.count || 0
        const latestAt = coverageEntry?.latestAt || null

        totalSections += 1
        groupSectionTotal += 1

        if (requestCount > 0) {
          submittedSections += 1
          groupSectionSubmitted += 1
        }

        return {
          id: sectionId,
          sectionShort,
          sectionName,
          sectionCode,
          displayName: sectionShort && sectionName && sectionShort !== sectionName
            ? `${sectionShort} · ${sectionName}`
            : (sectionShort || sectionName || sectionCode || 'ส่วนงานไม่ระบุ'),
          requestCount,
          latestAt
        }
      })

      const submittedInDepartment = sectionEntries.filter(section => section.requestCount > 0).length
      if (sectionEntries.length > 0) {
        totalDepartments += 1
        if (submittedInDepartment > 0) {
          submittedDepartments += 1
        }
      }

      const filteredSections = orgViewOptions.showMissingOnly
        ? sectionEntries.filter(section => section.requestCount === 0)
        : sectionEntries

      if (orgViewOptions.showMissingOnly && filteredSections.length === 0) {
        return
      }

      departmentResults.push({
        id: departmentId,
        departmentShort,
        departmentName,
        displayName: departmentShort && departmentName && departmentShort !== departmentName
          ? `${departmentShort} · ${departmentName}`
          : (departmentShort || departmentName || 'ฝ่ายไม่ระบุ'),
        sections: filteredSections,
        totalSections: sectionEntries.length,
        submittedSections: submittedInDepartment,
        hasSubmission: submittedInDepartment > 0
      })
    })

    if (departmentResults.length === 0) {
      return
    }

    if (groupSectionSubmitted > 0) {
      submittedGroups += 1
    }

    groups.push({
      id: groupId,
      groupShort,
      groupName,
      displayName: groupShort && groupName && groupShort !== groupName
        ? `${groupShort} · ${groupName}`
        : (groupShort || groupName || 'สายงานไม่ระบุ'),
      departments: departmentResults,
      totalSections: groupSectionTotal,
      submittedSections: groupSectionSubmitted,
      hasSubmission: groupSectionSubmitted > 0
    })
  })

  const totalGroups = groupsSource.length

  return {
    groups,
    summary: {
      totalGroups,
      submittedGroups,
      missingGroups: Math.max(totalGroups - submittedGroups, 0),
      totalDepartments,
      submittedDepartments,
      missingDepartments: Math.max(totalDepartments - submittedDepartments, 0),
      totalSections,
      submittedSections,
      missingSections: Math.max(totalSections - submittedSections, 0)
    }
  }
})

const orgCoverageSummary = computed(() => orgCoverage.value.summary)

const orgStructureLoaded = computed(() => {
  const groups = orgStructure.value?.groups
  return Array.isArray(groups) && groups.length > 0
})

const formatDisplayDate = (value) => {
  if (!value) {
    return ''
  }
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const destroyCharts = () => {
  if (groupChartInstance) {
    groupChartInstance.destroy()
    groupChartInstance = null
  }
  groupChartLabelLookup = []
  if (topCourseChartInstance) {
    topCourseChartInstance.destroy()
    topCourseChartInstance = null
  }
  topCourseChartLabelLookup = []
  if (packageChartInstance) {
    packageChartInstance.destroy()
    packageChartInstance = null
  }
}

const getColor = (index) => colorPalette[index % colorPalette.length]

const updateGroupChart = async () => {
  if (!process.client || !Chart) return

  const labels = groupStats.value.map(group => group.name)
  const values = groupStats.value.map(group => group.total)

  if (!groupChartCanvas.value || labels.length === 0) {
    if (groupChartInstance) {
      groupChartInstance.destroy()
      groupChartInstance = null
    }
    return
  }

  await nextTick()
  const context = groupChartCanvas.value.getContext('2d')
  if (!context) return

  if (groupChartInstance) {
    groupChartInstance.destroy()
  }

  groupChartLabelLookup = [...labels]

  groupChartInstance = new Chart(context, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'จำนวนคำขอ',
          data: values,
          backgroundColor: labels.map((_, index) => getColor(index)),
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: true
      },
      onHover: (_event, elements, chart) => {
        const target = chart?.canvas
        if (target) {
          target.style.cursor = elements?.length ? 'pointer' : 'default'
        }
      },
      onClick: (_event, elements) => {
        if (!elements?.length) {
          return
        }
        const index = elements[0].index
        const label = groupChartLabelLookup[index]
        if (!label) {
          return
        }
        toggleGroupChartFilter(label)
      },
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#4b5563',
            maxRotation: 45,
            minRotation: 0
          },
          grid: {
            display: false
          }
        },
        y: {
          ticks: {
            color: '#4b5563',
            precision: 0
          },
          grid: {
            color: '#e5e7eb'
          }
        }
      }
    }
  })
}

const updateTopCourseChart = async () => {
  if (!process.client || !Chart) return

  const entries = topCourseEntries.value

  if (!topCourseChartCanvas.value || entries.length === 0) {
    if (topCourseChartInstance) {
      topCourseChartInstance.destroy()
      topCourseChartInstance = null
    }
    return
  }

  await nextTick()
  const context = topCourseChartCanvas.value.getContext('2d')
  if (!context) return

  if (topCourseChartInstance) {
    topCourseChartInstance.destroy()
  }

  const labels = entries.map(entry => entry.label)
  const values = entries.map(entry => entry.count)

  topCourseChartLabelLookup = [...labels]

  topCourseChartInstance = new Chart(context, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'จำนวนคำขอ',
          data: values,
          backgroundColor: labels.map((_, index) => getColor(index)),
          borderRadius: 6
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest',
        intersect: true
      },
      onHover: (_event, elements, chart) => {
        const target = chart?.canvas
        if (target) {
          target.style.cursor = elements?.length ? 'pointer' : 'default'
        }
      },
      onClick: (_event, elements) => {
        if (!elements?.length) {
          return
        }
        const index = elements[0].index
        const label = topCourseChartLabelLookup[index]
        if (!label) {
          return
        }
        toggleCourseChartFilter(label)
      },
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#4b5563',
            precision: 0
          },
          grid: {
            color: '#e5e7eb'
          }
        },
        y: {
          ticks: {
            color: '#4b5563'
          },
          grid: {
            display: false
          }
        }
      }
    }
  })
}

const buildReportQueryParams = () => {
  const params = new URLSearchParams()
  if (filters.packageName) params.append('packageName', filters.packageName)
  if (filters.groupName) params.append('groupName', filters.groupName)
  return params
}

const exportExcel = async () => {
  if (!isAuthorized.value || !currentUser.value) {
    return
  }

  try {
    const params = buildReportQueryParams()

    const response = await fetch(`http://localhost:4001/api/reports/export?${params.toString()}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถส่งออกข้อมูลได้`
      throw new Error(message)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `training_needs_report_${new Date().toISOString().split('T')[0]}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export Excel:', err)
    const message = err instanceof Error ? err.message : 'ไม่สามารถส่งออกไฟล์ได้'
    error.value = message
  }
}

const exportCourseExcel = async (mode = 'full') => {
  if (!isAuthorized.value || !currentUser.value) {
    return
  }

  try {
    const params = buildReportQueryParams()
    const normalizedMode = typeof mode === 'string' && mode ? mode.toLowerCase() : 'full'
    if (normalizedMode) {
      params.append('mode', normalizedMode)
    }

    const response = await fetch(`http://localhost:4001/api/reports/export/course-view?${params.toString()}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      const message = payload?.error || `HTTP ${response.status}: ไม่สามารถส่งออกมุมมองหลักสูตรได้`
      throw new Error(message)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const modeLabel = normalizedMode === 'summary' || normalizedMode === 'detail' ? normalizedMode : 'full'
    const filename = `training_course_view_${modeLabel}_${new Date().toISOString().split('T')[0]}.xlsx`
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Failed to export course view Excel:', err)
    const message = err instanceof Error ? err.message : 'ไม่สามารถส่งออกมุมมองหลักสูตรได้'
    error.value = message
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleOrgModalKeydown = (event) => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    closeOrgMapModal()
  }
}

const handleCourseModalKeydown = (event) => {
  if (event.key === 'Escape' || event.key === 'Esc') {
    closeCourseModal()
  }
}

watch(showOrgMapModal, (visible) => {
  if (!process.client) {
    return
  }

  try {
    if (visible) {
      document.addEventListener('keydown', handleOrgModalKeydown)
      if (document.body) {
        document.body.classList.add('overflow-hidden')
      }
    } else {
      document.removeEventListener('keydown', handleOrgModalKeydown)
      if (document.body && !showCourseModal.value) {
        document.body.classList.remove('overflow-hidden')
      }
    }
  } catch (error) {
    console.warn('Failed to toggle modal listeners:', error)
  }
})

watch(showCourseModal, (visible) => {
  if (!process.client) {
    return
  }

  try {
    if (visible) {
      document.addEventListener('keydown', handleCourseModalKeydown)
      if (document.body) {
        document.body.classList.add('overflow-hidden')
      }
    } else {
      document.removeEventListener('keydown', handleCourseModalKeydown)
      if (document.body && !showOrgMapModal.value) {
        document.body.classList.remove('overflow-hidden')
      }
    }
  } catch (error) {
    console.warn('Failed to toggle course modal listeners:', error)
  }
})

watch(groupStats, () => {
  updateGroupChart()
}, { deep: true, flush: 'post' })

watch(topCourseEntries, () => {
  updateTopCourseChart()
}, { deep: true, flush: 'post' })

watch(packageChartData, () => {
  updatePackageChart()
}, { deep: true, flush: 'post' })

watch(filteredCourses, (list) => {
  if (!Array.isArray(list) || list.length === 0) {
    selectedCourseKey.value = null
    return
  }

  if (!selectedCourseKey.value || !list.some(course => course.key === selectedCourseKey.value)) {
    selectedCourseKey.value = list[0].key
  }
}, { immediate: true })

watch([isAuthorized, currentUser], ([allowed, user], [prevAllowed, prevUser]) => {
  if (!user) {
    return
  }

  if (!allowed) {
    error.value = 'คุณไม่มีสิทธิ์เข้าถึงรายงานนี้'
    loading.value = false
    summary.total = 0
    summary.topCourse = '-'
    summary.avgParticipants = 0
    summary.statusCount = {}
    summary.courseCount = 0
    summary.skillCount = 0
    items.value = []
    rawItems.value = []
  courseSummary.value = []
  baseCourseSummary.value = []
    groupStats.value = []
    packageOptions.value = []
    groupOptions.value = []
    packageOptionsError.value = null
    packagesLoading.value = false
    filters.packageName = ''
    filters.groupName = ''
    manualInsights.value = null
    hasFetched.value = false
    return
  }

  error.value = null

  if (!isClient.value) {
    return
  }

  if (!packagesLoading.value && packageOptions.value.length === 0) {
    loadPackageFilters().catch(() => {})
  }

  const userChanged = user !== prevUser
  const accessChanged = allowed !== prevAllowed

  if (!hasFetched.value || userChanged || accessChanged) {
    hasFetched.value = false
    fetchReports()
  }
}, { immediate: true })

onMounted(async () => {
  if (process.client) {
    isClient.value = true
  }

  await ensureAuth()

  if (!currentUser.value) {
    error.value = 'ไม่พบข้อมูลผู้ใช้งาน'
    loading.value = false
    return
  }

  await loadPackageFilters()

  if (isAuthorized.value) {
    await fetchReports()
  }
})

onBeforeUnmount(() => {
  destroyCharts()
  if (process.client) {
    document.removeEventListener('keydown', handleOrgModalKeydown)
    document.removeEventListener('keydown', handleCourseModalKeydown)
    if (document.body) {
      document.body.classList.remove('overflow-hidden')
    }
  }
  isClient.value = false
})
</script>
