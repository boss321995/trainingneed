<template>
  <div class="min-h-screen bg-white">
    <div class="relative">
      <div class="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
        <div class="h-48 w-full max-w-6xl bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 blur-3xl opacity-40"></div>
      </div>
      <div class="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        <section class="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div class="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          <div class="p-6 sm:p-8 lg:p-10">
            <div class="grid gap-10 lg:grid-cols-[2fr,1fr] xl:grid-cols-[3fr,2fr]">
              <div class="space-y-6">
                <div class="space-y-3">
                  <span class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    <span class="h-2 w-2 rounded-full bg-blue-500"></span>
                    ระบบฝึกอบรมประจำปี
                  </span>
                  <h1 class="text-3xl sm:text-4xl font-semibold text-gray-900 leading-tight">
                    ระบบขอให้จัดทำแผนการฝึกอบรมประจำปี
                  </h1>
                  <p class="text-base sm:text-lg text-gray-600 leading-relaxed">
                    ยินดีต้อนรับ {{ user?.fullname || 'ผู้ใช้งาน' }} — จัดการแผนฝึกอบรมให้สอดคล้องกับยุทธศาสตร์องค์กรได้ครบทุกขั้นตอนในพื้นที่เดียว
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-3">
                  <div
                    v-if="accessRole === 'assigned' && assignmentInfo"
                    class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
                  >
                    <span class="text-base">🤝</span>
                    <span>คุณได้รับสิทธิ์จาก {{ assignmentInfo.name }} เพื่อจัดทำแผนฝึกอบรม</span>
                  </div>
                  <div
                    v-if="isManager"
                    class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700"
                  >
                    <span class="text-base">🎯</span>
                    <span>ผู้บังคับบัญชาระดับผู้จัดการส่วน ดูแลการจัดทำแผนทั้งทีม</span>
                  </div>
                  <div
                    v-else
                    class="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm text-indigo-700"
                  >
                    <span class="text-base">📚</span>
                    <span>ผู้ได้รับมอบหมายให้กรอกข้อมูลแผนการฝึกอบรม</span>
                  </div>
                </div>
                <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  
                  <NuxtLink
                    to="/my-requests"
                    class="group flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-100"
                  >
                    <span>ดูแผนการขอฝึกอบรมทั้งส่วน</span>
                    <span class="text-lg opacity-0 transition group-hover:opacity-100">→</span>
                  </NuxtLink>
                  <button
                    type="button"
                    @click="showProfile = true"
                    class="group flex items-center justify-between rounded-2xl border border-purple-100 bg-purple-50/70 px-4 py-3 text-sm font-medium text-purple-700 transition hover:border-purple-200 hover:bg-purple-100"
                  >
                    <span>ดูข้อมูลโปรไฟล์</span>
                    <span class="text-lg opacity-0 transition group-hover:opacity-100">→</span>
                  </button>
                </div>
              </div>
              <div class="space-y-6">
                <div class="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 shadow-inner">
                  <div class="flex items-center gap-3">
                    <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <span class="text-2xl text-indigo-600">👤</span>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-indigo-700 uppercase tracking-wide">โปรไฟล์ผู้ใช้งาน</p>
                      <p class="text-lg font-semibold text-gray-900">{{ user?.fullname || 'ไม่ทราบชื่อ' }}</p>
                      <p class="text-sm text-gray-600">{{ user?.position || 'ไม่ระบุตำแหน่ง' }}</p>
                    </div>
                  </div>
                  <dl class="mt-5 space-y-3 text-sm text-gray-600">
                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-gray-500">ส่วนงาน</dt>
                      <dd class="text-right font-medium text-gray-900">{{ user?.section || 'ไม่ระบุส่วนงาน' }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-gray-500">หน่วยงาน</dt>
                      <dd class="text-right font-medium text-gray-900">{{ user?.department || 'ไม่ระบุหน่วยงาน' }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-gray-500">ระดับ</dt>
                      <dd class="text-right font-medium text-gray-900">{{ user?.level || '-' }}</dd>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <dt class="text-gray-500">บทบาท</dt>
                      <dd class="text-right font-medium text-gray-900">{{ user?.role || '-' }}</dd>
                    </div>
                  </dl>
                  <div class="mt-6 grid gap-2 text-xs text-gray-500">
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>สถานะระบบ: {{ authReady ? 'พร้อมใช้งาน' : 'กำลังโหลด...' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                      <span>สิทธิ์การใช้งาน: {{ accessRole || 'ไม่ระบุ' }}</span>
                    </div>
                  </div>
                </div>
                <button
                  v-if="!showProfile"
                  @click="showProfile = true"
                  type="button"
                  class="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
                >
                  ดูรายละเอียดโปรไฟล์เพิ่มเติม
                </button>
              </div>
            </div>
          </div>
        </section>

      

        <section class="space-y-6">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-semibold text-gray-900">เมนูจัดการหลัก</h2>
              <p class="text-sm text-gray-500">เริ่มต้นสร้างคำขอใหม่ ติดตามสถานะ และจัดการทีมของคุณ</p>
            </div>
            <span v-if="trainingPlanLoading" class="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600">
              <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6l4 2" />
              </svg>
              กำลังตรวจสอบสถานะแผนฝึกอบรม
            </span>
          </div>

          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <!-- Training Plan Management Card -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div class="p-6 flex flex-col h-full">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 shadow-sm">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-indigo-500">{{ isManager ? 'วางแผนระดับส่วนงาน' : 'บันทึกของฉัน' }}</p>
                    <h3 class="text-xl font-semibold text-gray-900 leading-snug">
                      {{ isManager ? 'กำหนดหัวข้อการขอฝึกอบรมประจำปี' : 'กรอกข้อมูลความต้องการฝึกอบรม' }}
                    </h3>
                    <p class="text-sm text-gray-500 max-w-sm">
                      {{ isManager ? 'สรุปหัวข้อฝึกอบรมและจำนวนผู้เข้าอบรมของส่วนงานให้ครบในครั้งเดียว' : 'เลือกแพ็คเกจและหลักสูตรที่ได้รับมอบหมาย พร้อมระบุจำนวนผู้เข้าอบรม' }}
                    </p>
                  </div>
                </div>

                <div class="mt-6 flex-1 flex flex-col">
                  <button
                    :disabled="hasSubmittedTrainingPlan"
                    @click="goToTrainingPlan"
                    type="button"
                    class="inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2"
                    :class="hasSubmittedTrainingPlan
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed focus:ring-gray-200'
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 focus:ring-indigo-500'"
                  >
                    <span class="mr-2 text-lg">{{ isManager ? '🎯' : '📝' }}</span>
                    <span class="tracking-wide">{{ isManager ? 'จัดทำแผนฝึกอบรม' : 'เริ่มกรอกแบบฟอร์ม' }}</span>
                  </button>

                  <div v-if="hasSubmittedTrainingPlan" class="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
                    ✅ คุณได้จัดทำแผนฝึกอบรมแล้ว หากต้องการปรับแก้ ให้ไปที่เมนู <strong>"แผนฝึกอบรมของส่วน"</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Team Management Card (Manager only) -->
            <div v-if="isManager" class="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div class="p-6 flex h-full flex-col">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 shadow-sm">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-purple-500">จัดการทีม</p>
                    <h3 class="text-xl font-semibold text-gray-900 leading-snug">มอบหมายให้ผู้ใต้บังคับบัญชาจัดทำแผนขอฝึกอบรม</h3>
                    <p class="text-sm text-gray-500">ระบุผู้รับผิดชอบแต่ละส่วนงานและติดตามความคืบหน้าการจัดทำแผน</p>
                  </div>
                </div>
                <NuxtLink
                  to="/team-management"
                  class="mt-6 inline-flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-purple-600 hover:to-indigo-600"
                >
                  👥 มอบหมายให้ผู้ใต้บังคับบัญชาจัดทำแผนขอฝึกอบรม
                </NuxtLink>
              </div>
            </div>

            <!-- My Training Status Card -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div class="p-6 flex h-full flex-col">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 shadow-sm">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-blue-500">สถานะแผน</p>
                    <h3 class="text-xl font-semibold text-gray-900 leading-snug">{{ isManager ? 'ดูแผนการขอฝึกอบรมทั้งส่วน' : 'ดูสถานะการขอแผนฝึกอบรม' }}</h3>
                    <p class="text-sm text-gray-500">ตรวจสอบความคืบหน้าและรายละเอียดคำขอฝึกอบรมทั้งหมด</p>
                  </div>
                </div>
                <NuxtLink
                  to="/my-requests"
                  class="mt-6 inline-flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-600 hover:to-indigo-600"
                >
                  {{ isManager ? '📊 ดูแผนส่วนงาน' : '📋 ดูแผนของฉัน' }}
                </NuxtLink>
              </div>
            </div>

            <!-- Reports Card (Authorized sections only) -->
            <div v-if="canViewOrgReport" class="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div class="p-6 flex h-full flex-col">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 shadow-sm">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-emerald-500">รายงานและสถิติ</p>
                    <h3 class="text-xl font-semibold text-gray-900 leading-snug">{{ user?.role === 'hrd_admin' ? 'รายงานทั้งองค์กร' : 'รายงานผลการขอจัดทำแผนฝึกอบรม' }}</h3>
                    <p class="text-sm text-gray-500">ดูภาพรวมคำขอฝึกอบรม เปรียบเทียบหน่วยงาน และดาวน์โหลดข้อมูล</p>
                  </div>
                </div>
                <NuxtLink
                  to="/reports"
                  class="mt-6 inline-flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-emerald-600 hover:to-teal-600"
                >
                  ดูรายงาน
                </NuxtLink>
              </div>
            </div>

            <!-- Profile Card -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div class="p-6 flex h-full flex-col">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 text-purple-600 shadow-sm">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-purple-500">ข้อมูลส่วนตัว</p>
                    <h3 class="text-xl font-semibold text-gray-900 leading-snug">ดูรายละเอียดโปรไฟล์</h3>
                    <p class="text-sm text-gray-500">ตรวจสอบและยืนยันข้อมูลพนักงานก่อนเริ่มจัดทำแผน</p>
                  </div>
                </div>
                <button
                  @click="showProfile = !showProfile"
                  class="mt-6 inline-flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-purple-500 to-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-purple-600 hover:to-indigo-600"
                >
                  {{ showProfile ? 'ซ่อนข้อมูล' : 'แสดงข้อมูล' }}
                </button>
              </div>
            </div>

            <!-- Logout Card -->
            <div class="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition">
              <div class="p-6 flex h-full flex-col">
                <div class="flex items-start gap-4">
                  <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 text-rose-600 shadow-sm">
                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <p class="text-xs font-semibold uppercase tracking-wide text-rose-500">ออกจากระบบ</p>
                    <h3 class="text-xl font-semibold text-gray-900 leading-snug">Logout</h3>
                    <p class="text-sm text-gray-500">ออกจากระบบอย่างปลอดภัยเมื่อดำเนินงานเสร็จสิ้น</p>
                  </div>
                </div>
                <button
                  @click="logout"
                  class="mt-6 inline-flex items-center justify-center rounded-xl border border-transparent bg-gradient-to-r from-rose-500 to-red-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-rose-600 hover:to-red-600"
                >
                  ออกจากระบบ
                </button>
              </div>
            </div>
          </div>
        </section>

        <section v-if="showProfile && user" class="bg-white border border-gray-100 rounded-3xl shadow-sm">
          <div class="px-6 py-6 sm:px-8 sm:py-8">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 class="text-xl font-semibold text-gray-900">ข้อมูลพนักงาน</h3>
              <span class="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                <span class="h-2 w-2 rounded-full bg-indigo-500"></span>
                ข้อมูลถูกดึงจากระบบผู้ใช้งาน
              </span>
            </div>
            <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">รหัสพนักงาน</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ user.employee_id }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">ชื่อ-นามสกุล</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ user.fullname }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">ตำแหน่ง</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ user.position }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">ระดับ</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ user.level }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">ส่วนงาน</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ user.section }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">หน่วยงาน</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ user.department }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">อีเมล</dt>
                <dd class="mt-1 text-sm font-semibold text-gray-900">{{ user.email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">บทบาท</dt>
                <dd class="mt-1">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    :class="{
                      'bg-green-100 text-green-800': user.role === 'hrd_admin',
                      'bg-blue-100 text-blue-800': user.role === 'manager',
                      'bg-gray-100 text-gray-800': user.role === 'user'
                    }"
                  >
                    {{ user.role === 'hrd_admin' ? 'ผู้ดูแลระบบ HRD' : user.role === 'manager' ? 'ผู้จัดการ' : 'พนักงาน' }}
                  </span>
                </dd>
              </div>
            </div>
          </div>
        </section>
      </div>
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
const assignmentInfo = computed(() => authStore.assignmentInfo)
const showProfile = ref(false)
const authReady = ref(authStore.isInitialized)
const hasSubmittedTrainingPlan = ref(false)
const trainingPlanLoading = ref(false)

// Check if user is a manager (Level 8 or higher)  
const isManager = computed(() => {
  return user.value && user.value.level >= 8
})

const sectionCode = computed(() => {
  const candidateSources = [
    user.value?.section_full_code,
    user.value?.sectionFullCode,
    user.value?.section_code,
    user.value?.sectionCode,
    user.value?.section,
    user.value?.department_short,
    user.value?.departmentShort
  ]

  for (const candidate of candidateSources) {
    if (candidate === null || candidate === undefined) {
      continue
    }

    const value = typeof candidate === 'string' ? candidate.trim() : String(candidate)
    if (value.length > 0) {
      return value
    }
  }

  return ''
})

const canViewOrgReport = computed(() => {
  if (user.value?.role === 'hrd_admin') {
    return true
  }
  const digits = sectionCode.value.replace(/[^0-9]/g, '')
  if (!digits) {
    return false
  }
  return digits.includes('0010332601')
})

onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  authReady.value = true
  await checkTrainingPlanStatus()
})

watch(
  () => authStore.isInitialized,
  (initialized) => {
    if (initialized) {
      authReady.value = true
    }
  },
  { immediate: true }
)

watch(user, async (newUser, oldUser) => {
  if (newUser && newUser !== oldUser) {
    await checkTrainingPlanStatus()
  }
})

const checkTrainingPlanStatus = async () => {
  if (!authStore.isAuthenticated) {
    hasSubmittedTrainingPlan.value = false
    return
  }

  try {
    trainingPlanLoading.value = true
    const response = await fetch('http://localhost:4001/api/training-needs/plan-status', {
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('ไม่สามารถตรวจสอบสถานะแผนฝึกอบรมได้')
    }

    const data = await response.json()
    hasSubmittedTrainingPlan.value = !!data?.hasSubmitted
  } catch (error) {
    console.error('Failed to check training plan status:', error)
    hasSubmittedTrainingPlan.value = false
  } finally {
    trainingPlanLoading.value = false
  }
}

const goToTrainingPlan = () => {
  if (hasSubmittedTrainingPlan.value) {
    return
  }
  navigateTo('/training/new')
}

const logout = async () => {
  await authStore.logout()
  navigateTo('/login')
}
</script>
