<template>
  <div class="container mx-auto p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">คำขอฝึกอบรมส่วนงาน</h1>
      <p class="text-gray-600">ดูประวัติและสถานะการร้องขอฝึกอบรมทั้งหมดในส่วนงานของคุณ</p>
      <div v-if="currentUser" class="mt-2 text-sm text-blue-600">
        <p>{{ currentUser.fullname }} | {{ currentUser.section }}</p>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-3 print-hidden">
        <button
          type="button"
          :disabled="loading"
          @click="printPage"
          class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16h10M7 12h10m-9 8h8a2 2 0 002-2v-5a2 2 0 012-2h1a1 1 0 001-1V7a2 2 0 00-2-2h-3l-2-2H9L7 5H4a2 2 0 00-2 2v3a1 1 0 001 1h1a2 2 0 012 2v5a2 2 0 002 2z" />
          </svg>
          พิมพ์รายการคำขอ
        </button>
        <p class="text-xs text-gray-500">
          ระบบจะซ่อนปุ่มและแบบฟอร์มอัตโนมัติเมื่อพิมพ์หรือบันทึกเป็น PDF
        </p>
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
          <div class="mt-4">
            <button 
              @click="loadRequests()"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
            >
              ลองใหม่
            </button>
            <NuxtLink 
              to="/login" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              เข้าสู่ระบบ
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else-if="!requests || requests.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">ยังไม่มีคำขอฝึกอบรมในส่วนงาน</h3>
      <p class="mt-1 text-sm text-gray-500">เริ่มต้นโดยการสร้างคำขอฝึกอบรมใหม่สำหรับส่วนงานของคุณ</p>
      <div class="mt-6">
        <NuxtLink 
          to="/training/new" 
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          สร้างคำขอใหม่
        </NuxtLink>
      </div>
    </div>

    <!-- Requests List -->
    <div v-else class="space-y-6">
      <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>

      <div v-if="updateError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ updateError }}
      </div>

      <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-6 py-5">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">ภาพรวมส่วนงาน</h2>
              <p class="text-sm text-gray-600">สรุปคำขอฝึกอบรมและผู้เข้าร่วมของส่วนงานคุณ</p>
            </div>
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
              ผู้เข้าร่วมทั้งหมด {{ sectionSummary.totalParticipants || 0 }} คน
            </div>
          </div>

          <dl class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div class="bg-slate-50 rounded-lg px-4 py-3">
              <dt class="text-xs font-semibold text-slate-500 uppercase tracking-wide">คำขอทั้งหมด</dt>
              <dd class="mt-1 text-lg font-semibold text-slate-900">{{ sectionSummary.totalRequests || 0 }}</dd>
            </div>

            <div class="bg-slate-50 rounded-lg px-4 py-3">
              <dt class="text-xs font-semibold text-slate-500 uppercase tracking-wide">หลักสูตรที่แตกต่าง</dt>
              <dd class="mt-1 text-lg font-semibold text-slate-900">{{ sectionSummary.uniqueCourses || 0 }}</dd>
            </div>

            <div class="bg-slate-50 rounded-lg px-4 py-3">
              <dt class="text-xs font-semibold text-slate-500 uppercase tracking-wide">ผู้เข้าร่วมทั้งหมด</dt>
              <dd class="mt-1 text-lg font-semibold text-slate-900">{{ sectionSummary.totalParticipants || 0 }}</dd>
            </div>

            <div class="bg-emerald-50 rounded-lg px-4 py-3">
              <dt class="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Upskill</dt>
              <dd class="mt-1 text-lg font-semibold text-emerald-700">{{ sectionSummary.upskillParticipants || 0 }} คน</dd>
            </div>

            <div class="bg-indigo-50 rounded-lg px-4 py-3">
              <dt class="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Reskill</dt>
              <dd class="mt-1 text-lg font-semibold text-indigo-700">{{ sectionSummary.reskillParticipants || 0 }} คน</dd>
            </div>

            <div class="bg-amber-50 rounded-lg px-4 py-3">
              <dt class="text-xs font-semibold text-amber-700 uppercase tracking-wide">ระบุรายชื่อแล้ว</dt>
              <dd class="mt-1 text-lg font-semibold text-amber-800">
                {{ sectionSummary.rosterRequests || 0 }}/{{ sectionSummary.totalRequests || 0 }} ({{ rosterCoverage }}%)
              </dd>
            </div>
          </dl>

          <div v-if="sectionSummary.senders && sectionSummary.senders.length" class="mt-5">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">ผู้ส่งคำขอ</p>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="sender in sectionSummary.senders"
                :key="sender"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
              >
                {{ sender }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div class="px-6 py-5">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">รายชื่อผู้เข้าร่วมทั้งหมดในส่วนงาน</h3>
              <p class="text-sm text-gray-600">รวมรายชื่อจากคำขอฝึกอบรมทุกคำขอ</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
              {{ sectionSummary.participants.length }} คน
            </span>
          </div>

          <div v-if="sectionSummary.participants.length > 0" class="mt-4 overflow-x-auto -mx-6">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left font-medium">ชื่อผู้เข้าร่วม</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium">รหัสพนักงาน</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium">ตำแหน่ง</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium">ส่วนงาน</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium">การพัฒนา</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium">หลักสูตร/แพ็คเกจ</th>
                  <th scope="col" class="px-6 py-3 text-left font-medium">ผู้ร้องขอ</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100 text-gray-700">
                <tr
                  v-for="(participant, index) in sectionSummary.participants"
                  :key="`${participant.request_id || 'request'}-${index}`"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-3 font-medium text-gray-900">{{ participant.participant_name || '-' }}</td>
                  <td class="px-6 py-3 text-gray-600">{{ participant.employee_id || '-' }}</td>
                  <td class="px-6 py-3">{{ participant.position || '-' }}</td>
                  <td class="px-6 py-3">{{ participant.section || '-' }}</td>
                  <td class="px-6 py-3">{{ formatDevelopmentType(participant.development_type) }}</td>
                  <td class="px-6 py-3">{{ participant.package_name || participant.course_title || '-' }}</td>
                  <td class="px-6 py-3">{{ participant.requester || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="mt-4 bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-lg"
          >
            <p class="text-sm">ยังไม่ได้กรอกข้อมูลรายชื่อผู้เข้าร่วมในระบบ</p>
            <ul v-if="sectionSummary.fallbackAggregates.length > 0" class="mt-3 space-y-2 text-sm text-gray-700">
              <li
                v-for="aggregate in sectionSummary.fallbackAggregates"
                :key="aggregate.request_id"
                class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
              >
                <span class="font-medium text-gray-900">{{ aggregate.course_title || 'ไม่ระบุหลักสูตร' }}</span>
                <span class="text-gray-600">
                  ผู้ร้องขอ: {{ aggregate.requester || '-' }} | ผู้เข้าร่วม {{ toSafeNumber(aggregate.participants) }} คน
                  <template v-if="toSafeNumber(aggregate.upskill_participants) > 0 || toSafeNumber(aggregate.reskill_participants) > 0">
                    | Upskill {{ toSafeNumber(aggregate.upskill_participants) }} | Reskill {{ toSafeNumber(aggregate.reskill_participants) }}
                  </template>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div 
        v-for="request in requests" 
        :key="request.id"
        class="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden"
      >
        <div class="px-6 py-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-start gap-3">
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900">{{ request.course_title }}</h3>
                <p class="text-sm text-gray-600">
                  {{ request.employee_name || request.employee_id }}
                  <span v-if="getPackageDisplayName(request)" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs bg-indigo-100 text-indigo-700">
                    แพ็คเกจ: {{ getPackageDisplayName(request) }}
                  </span>
                </p>
              </div>
            </div>
            <div class="text-sm text-gray-500 font-medium">
              #{{ request.id }}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">ประเภทที่ต้องการฝึกอบรม</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="type in getCourseTypes(request.course_types)" 
                    :key="type"
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ type }}
                  </span>
                </div>
              </dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">จำนวนผู้เข้าร่วม</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ displayParticipantCount(request) }} คน</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">ฝ่าย</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ request.department }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">ส่วนงาน</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ request.section }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">วันที่ส่งคำขอ</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(request.created_at) }}</dd>
            </div>
          </div>

          <div v-if="request.training_objective" class="mb-4">
            <dt class="text-sm font-medium text-gray-500">วัตถุประสงค์การฝึกอบรม</dt>
            <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
              {{ request.training_objective }}
            </dd>
          </div>

          <div v-if="request.expected_outcome" class="mb-4">
            <dt class="text-sm font-medium text-gray-500">ผลลัพธ์ที่คาดหวัง</dt>
            <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
              {{ request.expected_outcome }}
            </dd>
          </div>

          <div v-if="request.free_text" class="mb-4">
            <dt class="text-sm font-medium text-gray-500">รายละเอียดเพิ่มเติม</dt>
            <dd class="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded-md whitespace-pre-line">
              {{ request.free_text }}
            </dd>
          </div>

          <div class="border-t border-gray-100 pt-4 mt-4">
            <h4 class="text-sm font-semibold text-gray-800 mb-3">
              รายชื่อผู้เข้าร่วม ({{ displayParticipantCount(request) }} คน)
            </h4>

            <div
              v-if="request.participant_roster && request.participant_roster.length > 0"
              class="overflow-x-auto -mx-6"
            >
              <table class="min-w-full divide-y divide-gray-200 text-sm">
                <thead class="bg-gray-50 text-gray-600 uppercase text-xs tracking-wide">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left font-medium">ชื่อผู้เข้าร่วม</th>
                    <th scope="col" class="px-6 py-3 text-left font-medium">รหัสพนักงาน</th>
                    <th scope="col" class="px-6 py-3 text-left font-medium">ตำแหน่ง</th>
                    <th scope="col" class="px-6 py-3 text-left font-medium">การพัฒนา</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-100 text-gray-700">
                  <tr
                    v-for="(participant, index) in request.participant_roster"
                    :key="`${participant.id || participant.employee_id || 'row'}-${index}`"
                    class="hover:bg-gray-50"
                  >
                    <td class="px-6 py-3 font-medium text-gray-900">
                      {{ participant.participant_name || participant.name || '-' }}
                    </td>
                    <td class="px-6 py-3 text-gray-600">
                      {{ participant.employee_id || '-' }}
                    </td>
                    <td class="px-6 py-3">
                      {{ participant.position || '-' }}
                    </td>
                    <td class="px-6 py-3">
                      {{ formatDevelopmentType(participant.development_type) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              v-else
              class="bg-amber-50 border border-amber-100 text-amber-800 px-4 py-3 rounded-lg"
            >
              <p class="text-sm">
                ยังไม่ได้ระบุรายชื่อผู้เข้าร่วมในระบบ
                <template v-if="displayParticipantCount(request) > 0">
                  (รวม {{ displayParticipantCount(request) }} คน
                  <template v-if="toSafeNumber(request.upskill_participants) > 0 || toSafeNumber(request.reskill_participants) > 0">
                    | Upskill {{ toSafeNumber(request.upskill_participants) }} | Reskill {{ toSafeNumber(request.reskill_participants) }}
                  </template>
                  )
                </template>
              </p>
            </div>

            <div
              v-if="toSafeNumber(request.upskill_participants) > 0 || toSafeNumber(request.reskill_participants) > 0"
              class="mt-3 flex flex-wrap gap-2"
            >
              <span
                v-if="toSafeNumber(request.upskill_participants) > 0"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"
              >
                Upskill {{ toSafeNumber(request.upskill_participants) }} คน
              </span>
              <span
                v-if="toSafeNumber(request.reskill_participants) > 0"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
              >
                Reskill {{ toSafeNumber(request.reskill_participants) }} คน
              </span>
            </div>
          </div>

          <div v-if="editingRequestId === request.id" class="border-t border-gray-200 pt-4 mt-4 print-hidden">
            <h4 class="text-sm font-semibold text-gray-800 mb-3">แก้ไขข้อมูลคำขอ</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">จำนวนผู้เข้าร่วม (คน)</label>
                <input
                  type="number"
                  min="1"
                  v-model.number="editForm.participants"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">วัตถุประสงค์การฝึกอบรม</label>
                <textarea
                  v-model="editForm.training_objective"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ระบุเป้าหมายหรือเหตุผลของการฝึกอบรม"
                ></textarea>
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">ผลลัพธ์ที่คาดหวัง</label>
                <textarea
                  v-model="editForm.expected_outcome"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ระบุผลลัพธ์หรือการเปลี่ยนแปลงที่ต้องการให้เกิดขึ้น"
                ></textarea>
              </div>

              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  v-model="editForm.free_text"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="หมายเหตุเพิ่มเติมหรือคำขอพิเศษ"
                ></textarea>
              </div>
            </div>

            <div class="mt-4 flex justify-end gap-3">
              <button
                @click="cancelEdit"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                ยกเลิก
              </button>
              <button
                :disabled="savingRequestId === request.id"
                @click="saveRequest(request.id)"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
                :class="savingRequestId === request.id ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'"
              >
                <svg
                  v-if="savingRequestId === request.id"
                  class="animate-spin -ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                </svg>
                บันทึกการแก้ไข
              </button>
            </div>
          </div>

          <div v-else class="flex justify-end print-hidden">
            <button
              v-if="canEditRequest(request)"
              @click="startEditing(request)"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              แก้ไขข้อมูล
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination (if needed) -->
    <div v-if="requests && requests.length > 0" class="mt-8 flex justify-center print-hidden">
      <button 
        @click="loadMore" 
        v-if="hasMore"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        โหลดเพิ่มเติม
      </button>
    </div>

    <!-- Back Button at Bottom -->
    <div class="mt-12 flex justify-center print-hidden">
      <button 
        @click="$router.go(-1)"
        class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        กลับ
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const authStore = useAuthStore()

const requests = ref([])
const loading = ref(true)
const error = ref(null)
const hasMore = ref(false)
const successMessage = ref('')
const updateError = ref('')
const editingRequestId = ref(null)
const savingRequestId = ref(null)
const defaultSummaryState = () => ({
  totalRequests: 0,
  totalParticipants: 0,
  upskillParticipants: 0,
  reskillParticipants: 0,
  rosterRequests: 0,
  missingRosterRequests: 0,
  uniqueCourses: 0,
  senders: [],
  participants: [],
  fallbackAggregates: []
})
const sectionSummary = ref(defaultSummaryState())
const editForm = reactive({
  participants: 1,
  training_objective: '',
  expected_outcome: '',
  free_text: ''
})

const currentUser = computed(() => authStore.user)
const rosterCoverage = computed(() => {
  const total = Number(sectionSummary.value.totalRequests) || 0
  if (total === 0) return 0
  const rosterRequests = Number(sectionSummary.value.rosterRequests) || 0
  return Math.round((rosterRequests / total) * 100)
})

const ensureAuthReady = async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isValid = await authStore.validateToken({ keepStateOnError: true })

  if (!isValid || !authStore.isAuthenticated) {
    throw new Error('กรุณาเข้าสู่ระบบใหม่เพื่อดูข้อมูลคำขอฝึกอบรม')
  }
}

const normalizeString = (value) => {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim()
}

const formatDevelopmentType = (value) => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'upskill') return 'Upskill (ยกระดับ)'
  if (normalized === 'reskill') return 'Reskill (ทักษะใหม่)'
  return '-'
}

const toSafeNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const displayParticipantCount = (request) => {
  if (!request) return 0
  const rosterCount = Array.isArray(request.participant_roster) ? request.participant_roster.length : 0
  if (rosterCount > 0) return rosterCount
  const participantTotal = Number(request.participant_total)
  if (Number.isFinite(participantTotal) && participantTotal > 0) return participantTotal
  const fallbackParticipants = Number(request.participants)
  if (Number.isFinite(fallbackParticipants) && fallbackParticipants > 0) return fallbackParticipants
  return 0
}

const loadRequests = async (options = {}) => {
  const preserveMessages = options.preserveMessages === true
  try {
    loading.value = true
    error.value = null
    if (!preserveMessages) {
      successMessage.value = ''
      updateError.value = ''
    }

    await ensureAuthReady()

    const response = await fetch('http://localhost:4001/api/training-needs/my-section', {
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status === 404) {
        requests.value = []
        sectionSummary.value = defaultSummaryState()
        return
      }
      throw new Error('ไม่สามารถโหลดข้อมูลคำขอฝึกอบรมได้')
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      requests.value = data
      sectionSummary.value = defaultSummaryState()
    } else {
      requests.value = Array.isArray(data?.records) ? data.records : []
      sectionSummary.value = {
        ...defaultSummaryState(),
        ...(data?.summary || {})
      }
    }
  } catch (err) {
    console.error('Error loading requests:', err)
    error.value = err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล'
    sectionSummary.value = defaultSummaryState()
  } finally {
    loading.value = false
  }
}

const startEditing = (request) => {
  successMessage.value = ''
  updateError.value = ''
  editingRequestId.value = request.id
  editForm.participants = Number.isFinite(Number(request.participants)) ? Number(request.participants) : 1
  editForm.training_objective = request.training_objective || ''
  editForm.expected_outcome = request.expected_outcome || ''
  editForm.free_text = request.free_text || ''
}

const cancelEdit = () => {
  editingRequestId.value = null
  savingRequestId.value = null
  updateError.value = ''
}

const saveRequest = async (requestId) => {
  if (!editingRequestId.value || requestId !== editingRequestId.value) {
    return
  }

  if (!editForm.participants || editForm.participants < 1) {
    updateError.value = 'จำนวนผู้เข้าร่วมต้องมากกว่าหรือเท่ากับ 1'
    return
  }

  try {
    await ensureAuthReady()
    savingRequestId.value = requestId
    updateError.value = ''
    successMessage.value = ''

    const payload = {
      participants: editForm.participants,
      training_objective: editForm.training_objective?.trim?.() ?? editForm.training_objective,
      expected_outcome: editForm.expected_outcome?.trim?.() ?? editForm.expected_outcome,
      free_text: editForm.free_text?.trim?.() ?? editForm.free_text
    }

    const response = await fetch(`http://localhost:4001/api/training-needs/${requestId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null)
      const message = errorBody?.error || 'ไม่สามารถบันทึกการแก้ไขได้'
      throw new Error(message)
    }

    const result = await response.json()
    if (!result?.ok || !result.data) {
      throw new Error('การบันทึกไม่สำเร็จ กรุณาลองอีกครั้ง')
    }

    const index = requests.value.findIndex((item) => item.id === requestId)
    if (index !== -1) {
      requests.value[index] = {
        ...requests.value[index],
        ...result.data
      }
    }

    editingRequestId.value = null
    successMessage.value = 'บันทึกการแก้ไขเรียบร้อยแล้ว'
    await loadRequests({ preserveMessages: true })
  } catch (err) {
    console.error('Failed to save request:', err)
    updateError.value = err.message || 'ไม่สามารถบันทึกการแก้ไขได้'
  } finally {
    savingRequestId.value = null
  }
}

const canEditRequest = (request) => {
  const user = currentUser.value
  if (!user) return false

  const userLevel = Number(user.level || user.Level || 0)
  const requestSectionCode = normalizeString(request.section_code)
  const requestSection = normalizeString(request.section)

  if (userLevel >= 8) {
    const userSectionCode = normalizeString(user.section_code || user.sectionCode)
    const userSection = normalizeString(user.section)

    if (userSectionCode && requestSectionCode) {
      return userSectionCode === requestSectionCode
    }

    if (!requestSectionCode && userSection) {
      return userSection === requestSection
    }

    return true
  }

  const candidateIds = [
    user.id,
    user.employee_id,
    user.employeeId
  ]
    .filter(Boolean)
    .map((value) => normalizeString(value))

  const requestEmployeeId = normalizeString(request.employee_id)
  return candidateIds.includes(requestEmployeeId)
}

const printPage = () => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.print()
  } catch (err) {
    console.error('Print failed:', err)
  }
}

// Helper functions
const getCourseTypes = (courseTypes) => {
  if (!courseTypes) return []
  return courseTypes
    .split(',')
    .map((type) => type.trim())
    .filter((type) => type.length > 0)
}

const getPackageDisplayName = (request) => {
  if (!request) return ''

  const directName = normalizeString(request.selected_package_name || request.package_name)
  if (directName) return directName

  const customName = normalizeString(request.custom_package_name)
  if (customName) return customName

  if (request.course_types) {
    const match = request.course_types.match(/แพ็คเกจ\s*:\s*([^|]+)/)
    if (match && match[1]) {
      const extracted = match[1].trim()
      if (extracted.length > 0) {
        return extracted
      }
    }
  }

  const fallbackCode = normalizeString(request.selected_package_code)
  return fallbackCode
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadMore = () => {
  // Implementation for pagination if needed
}

onMounted(() => {
  loadRequests()
})

// Set page title
useHead({
  title: 'คำขอฝึกอบรมส่วนงาน - ระบบจัดการความต้องการฝึกอบรม'
})
</script>

<style scoped>
/* Additional custom styles if needed */

@media print {
  .print-hidden {
    display: none !important;
  }

  .container {
    max-width: 100% !important;
    padding: 0 !important;
  }

  .bg-white {
    box-shadow: none !important;
    border-color: #e5e7eb !important;
  }
}
</style>