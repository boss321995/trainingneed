<template>
  <div class="max-w-4xl mx-auto py-10 px-4">
    <div class="mb-10 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div class="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
      <div class="p-6 sm:p-8 flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-semibold text-gray-900 tracking-tight">
              {{ isManager ? 'จัดทำแผนการขอฝึกอบรมประจำปี' : 'กรอกข้อมูลความต้องการฝึกอบรม' }}
            </h1>
            <p class="text-gray-600 mt-2 max-w-2xl leading-relaxed">
              {{ isManager ? 
                 'กำหนดหัวข้อ กลยุทธ์ และรายละเอียดการฝึกอบรมสำหรับผู้ใต้บังคับบัญชาได้ในที่เดียว พร้อมติดตามข้อมูลสำคัญแบบเป็นขั้นตอน' : 
                 'บันทึกความต้องการฝึกอบรมตามแผนกลยุทธ์ที่ได้รับ พร้อมแนบข้อมูลหลักสูตรและรายละเอียดที่จำเป็น' }}
            </p>
          </div>
          <div class="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800 shadow-inner">
            <div class="font-medium">สถานะผู้ใช้งาน</div>
            <div class="mt-1 text-blue-700">
              {{ user?.fullname || user?.name || 'ไม่ทราบชื่อ' }}
            </div>
            <div class="text-xs text-blue-600 mt-1">
              {{ user?.section || 'ไม่ระบุส่วนงาน' }}
            </div>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-500">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold shadow-sm">i</span>
            <span>กรอกข้อมูลให้ครบทุกขั้นตอนก่อนกด “ส่งคำขอ” ระบบจะแจ้งเตือนหากมีส่วนที่ยังขาด</span>
          </div>
          <div class="flex items-center gap-2 text-xs text-emerald-600">
            <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ข้อมูลจะถูกบันทึกลงฐานข้อมูลอัตโนมัติหลังส่ง</span>
          </div>
        </div>
      </div>
    </div>

      <div class="hidden sm:grid grid-cols-1 sm:grid-cols-5 gap-3 mb-8">
      <div
        v-for="(step, index) in stepGuide"
        :key="step.label"
        :class="['flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition',
                  index === 0 ? 'border-blue-500 bg-blue-50 text-blue-700' :
                  index === 1 ? 'border-indigo-500 bg-indigo-50 text-indigo-700' :
                  index === 2 ? 'border-purple-500 bg-purple-50 text-purple-700' :
                  index === 3 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                  'border-slate-300 bg-slate-50 text-slate-600']"
      >
        <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-semibold shadow" :class="[
          index === 0 ? 'text-blue-600' :
          index === 1 ? 'text-indigo-600' :
          index === 2 ? 'text-purple-600' :
          index === 3 ? 'text-emerald-600' :
          'text-slate-500'
        ]">
          {{ index + 1 }}
        </span>
        <div>
          <div>{{ step.label }}</div>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- แผนยุทธศาสตร์ที่เกี่ยวข้อง -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold shadow-md">1</span>
            <div>
              <h3 class="text-lg sm:text-xl font-semibold text-gray-900">กำหนดแผนยุทธศาสตร์ที่เกี่ยวข้อง</h3>
              <p class="text-sm text-gray-500 mt-1">เลือกเป้าประสงค์ (SO) → กลยุทธ์ → กลยุทธ์ย่อย → Action Plan ให้ครบก่อน จากนั้นจึงกรอกชื่อแผนหรือโครงการ</p>
            </div>
          </div>
          <div class="hidden sm:block text-xs text-gray-400">เลือก SO → Strategy → Tactic → Action Plan ให้ครบก่อน แล้วจึงกรอกชื่อแผน</div>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">1.1 เป้าประสงค์เชิงกลยุทธ์ (SO)</label>
              <select
                v-model="selectedObjectiveCode"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">เลือกเป้าประสงค์ (SO)</option>
                <option
                  v-for="objective in strategicPlans"
                  :key="objective.code"
                  :value="objective.code"
                >
                  {{ objective.code }} - {{ objective.name }}
                </option>
              </select>
              <p v-if="selectedObjective?.description" class="mt-1 text-xs text-gray-500">
                {{ selectedObjective.description }}
              </p>
              <p v-if="selectedObjective?.owner" class="text-xs text-gray-400">
                ผู้รับผิดชอบ: {{ selectedObjective.owner }}
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">1.2 กลยุทธ์ (Strategy)</label>
              <select
                v-model="selectedStrategyCode"
                :disabled="strategyOptions.length === 0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">เลือกกลยุทธ์ (S)</option>
                <option
                  v-for="strategy in strategyOptions"
                  :key="strategy.code"
                  :value="strategy.code"
                >
                  {{ strategy.code }} - {{ strategy.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">1.3 กลยุทธ์ย่อย (Tactic)</label>
              <select
                v-model="selectedTacticCode"
                :disabled="tacticOptions.length === 0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">เลือกกลยุทธ์ย่อย (T)</option>
                <option
                  v-for="tactic in tacticOptions"
                  :key="tactic.code"
                  :value="tactic.code"
                >
                  {{ tactic.code }} - {{ tactic.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">1.4 แผนปฏิบัติการ (Action Plan)</label>
              <select
                v-model="selectedActionPlanCode"
                :disabled="actionPlanOptions.length === 0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">เลือกแผนปฏิบัติการ (AP)</option>
                <option
                  v-for="plan in actionPlanOptions"
                  :key="plan.code"
                  :value="plan.code"
                >
                  {{ plan.code }} - {{ plan.name }}
                </option>
              </select>
              <p v-if="selectedActionPlan?.owner" class="mt-1 text-xs text-gray-400">
                เจ้าภาพหลัก: {{ selectedActionPlan.owner }}
              </p>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อแผนหรือโครงการที่ต้องการพัฒนาบุคลากร</label>
            <input
              v-model="strategicPlanName"
              type="text"
              :disabled="!hasCompletePlanPath"
              placeholder="กรอกชื่อแผน/โครงการ เช่น โครงการพัฒนาทักษะดิจิทัล"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
            />
            <p class="mt-1 text-xs text-gray-500">
              {{ hasCompletePlanPath ? 'ข้อมูลนี้จะถูกใช้ประกอบในรายงานและช่วยให้ค้นหาแผนได้ง่ายขึ้น' : 'กรุณาเลือก SO → Strategy → Tactic → Action Plan ให้ครบก่อนจึงจะกรอกชื่อแผนได้' }}
            </p>
          </div>

        </div>
      </div>

      <!-- ระดับปฏิบัติงาน -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div class="flex items-center gap-3 mb-4">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold shadow-md">2</span>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">กลุ่มเป้าหมายที่ต้องการส่งเข้าอบรม</h3>
        </div>
        <p class="text-sm text-gray-500 mb-5">เลือกได้มากกว่าหนึ่งระดับเพื่อให้ครอบคลุมกลุ่มเป้าหมายที่ต้องการพัฒนา</p>
        <div class="space-y-3">
          <div 
            v-for="level in jobLevels" 
            :key="level.id"
            class="flex items-center space-x-3 rounded-xl border border-gray-200/70 px-4 py-3 hover:border-indigo-300 transition"
          >
            <input
              :id="`job_level_${level.id}`"
              v-model="form.job_levels"
              :value="level.id"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              @change="onJobLevelChange"
            />
            <label :for="`job_level_${level.id}`" class="text-sm text-gray-700 cursor-pointer">
              <span class="font-medium">{{ level.level_name }}</span>
              <span class="text-gray-500 ml-2">{{ level.description }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- เลือกแพ็คเกจและหลักสูตร -->
      <div class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
        <div class="flex items-center gap-3 mb-4">
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white font-semibold shadow-md">3</span>
          <h3 class="text-lg sm:text-xl font-semibold text-gray-900">เลือกทักษะและหลักสูตรที่ต้องการ</h3>
        </div>
        <p class="text-sm text-gray-500 mb-6">ค้นหาทักษะที่จัดเตรียมไว้ หรือเพิ่มหลักสูตรใหม่ด้วยตัวเองหากไม่พบในระบบ</p>
        
        <!-- เลือกแพ็คเกจ -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">1. เลือกทักษะหลักสูตร</label>
          <div class="relative package-dropdown">
            <input
              ref="packageSearchInput"
              v-model="packageSearchTerm"
              @input="searchPackages"
              @focus="handlePackageFocus"
              type="text"
              placeholder="ค้นหาทักษะของหลักสูตร..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
            <!-- Package Dropdown -->
            <div 
              v-if="showPackageDropdown && searchedPackages.length > 0" 
              class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              <div 
                v-for="pkg in searchedPackages" 
                :key="pkg.aggregateKey"
                @click="selectPackage(pkg)"
                class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
              >
                <div class="font-medium text-gray-900">{{ pkg.package_name }}</div>
                <div v-if="pkg.course_count" class="text-xs text-gray-500">{{ pkg.course_count }} หลักสูตรทั้งหมด</div>
                <div v-if="pkg.allPackageIds && pkg.allPackageIds.length > 1" class="text-[11px] text-gray-400">
                  รวม {{ pkg.allPackageIds.length }} ทักษะที่ชื่อซ้ำ
                </div>
              </div>
            </div>
            
            <!-- Selected Package -->
            <div v-if="selectedPackage" class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-sm font-medium text-blue-800">{{ selectedPackage.package_name }}</span>
                  <span v-if="selectedPackage.course_count" class="text-xs text-blue-600 ml-2">
                    {{ selectedPackage.course_count }} หลักสูตร
                  </span>
                </div>
                <button 
                  @click="clearPackageSelection"
                  type="button"
                  class="text-blue-600 hover:text-blue-800"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <p class="mt-1 text-xs text-gray-500">ใส่ชื่อทักษะหลักสูตรเพื่อค้นหา (สามารถเลือกได้หลายทักษะและเลือกหลายหลักสูตรในแต่ละทักษะ)</p>
        </div>

        <!-- เลือกหลักสูตรจากแพ็คเกจ -->
        <div v-if="selectedPackage" class="space-y-4">
          <template v-if="isCustomPackage">
            <div class="border-t border-gray-200 pt-4 space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อทักษะหรือหัวข้อหลัก</label>
                <input
                  v-model="customPackageName"
                  type="text"
                  placeholder="เช่น แผนพัฒนาทักษะดิจิทัลเฉพาะกิจ"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p class="mt-1 text-xs text-gray-500">หากไม่ระบุ ระบบจะใช้ชื่อว่า "{{ selectedPackage.package_name }}"</p>
              </div>

              <div class="space-y-4">
                <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">ยังไม่มีหลักสูตรในระบบสำหรับหัวข้อนี้</h4>
                    <p class="text-xs text-gray-500 mt-1">คลิกปุ่มด้านขวาเพื่อเพิ่มหลักสูตรที่ต้องการ พร้อมระบุรายละเอียดเพิ่มเติม</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="openCustomCourseModal"
                      :disabled="hasReachedCourseLimit"
                      :class="['inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2', hasReachedCourseLimit ? 'bg-blue-400 text-white cursor-not-allowed opacity-70' : 'bg-blue-600 text-white hover:bg-blue-700']"
                    >
                      เพิ่มหลักสูตรที่ต้องการ
                    </button>
                  </div>
                </div>

                <div v-if="manualCoursesForCurrentPackage.length > 0" class="space-y-3">
                  <div
                    v-for="course in manualCoursesForCurrentPackage"
                    :key="course.id"
                    class="border border-blue-200 bg-blue-50 rounded-lg p-4"
                  >
                    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                      <h4 class="text-sm font-semibold text-blue-900">หลักสูตรกำหนดเอง</h4>
                      <button
                        type="button"
                        @click="removeCourse(course.id)"
                        class="text-xs text-red-500 hover:text-red-700"
                      >
                        ลบออก
                      </button>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อหลักสูตร *</label>
                        <input
                          v-model="course.course_title"
                          type="text"
                          placeholder="กรอกชื่อหลักสูตร"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">รหัสหลักสูตร</label>
                        <input
                          v-model="course.course_code"
                          type="text"
                          placeholder="ถ้ามี"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">รูปแบบการเรียนรู้</label>
                        <select
                          v-model="course.learning_mode"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option v-for="option in LEARNING_MODE_OPTIONS" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="mt-3 space-y-3">
                      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label class="text-xs font-medium text-gray-700">ผู้เข้าอบรมที่คาดว่าจะเข้าร่วม</label>
                        <button
                          type="button"
                          class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                          @click="addAttendeeToCourse(course)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                          </svg>
                          เพิ่มผู้เข้าอบรม
                        </button>
                      </div>
                      <div v-if="course.attendees && course.attendees.length" class="space-y-3">
                        <div
                          v-for="(attendee, attendeeIndex) in course.attendees"
                          :key="`${course.id}-manual-attendee-${attendeeIndex}`"
                          class="rounded-lg border border-blue-200 bg-white p-3"
                        >
                          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div class="flex-1 space-y-3">
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">ชื่อ-สกุล *</label>
                                  <input
                                    v-model="attendee.name"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="ระบุชื่อผู้เข้าอบรม"
                                  />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">รหัสพนักงาน</label>
                                  <input
                                    v-model="attendee.employee_id"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="กรณีไม่มีในระบบ"
                                  />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">ตำแหน่ง</label>
                                  <input
                                    v-model="attendee.position"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="กรณีไม่อยู่ในรายการที่ระบบแนะนำ"
                                  />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">สังกัด/ฝ่าย</label>
                                  <input
                                    v-model="attendee.section"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="ระบุหน่วยงานที่สังกัด"
                                  />
                                </div>
                              </div>
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">เลือกจากรายชื่อพนักงาน</label>
                                <select
                                  v-model="attendee.employee_id"
                                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  @change="handleAttendeeSelection(course, attendeeIndex)"
                                >
                                  <option value="">-- เลือกชื่อจากระบบ --</option>
                                  <option
                                    v-for="option in participantOptions"
                                    :key="`${course.id}-manual-option-${option.employee_id || option.display}`"
                                    :value="option.employee_id"
                                  >
                                    {{ option.display }}
                                  </option>
                                </select>
                              </div>
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">ประเภทการพัฒนา</label>
                                <select
                                  v-model="attendee.development_type"
                                  class="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option
                                    v-for="devOption in DEVELOPMENT_TYPE_OPTIONS"
                                    :key="`${course.id}-manual-type-${devOption.value}`"
                                    :value="devOption.value"
                                  >
                                    {{ devOption.label }}
                                  </option>
                                </select>
                              </div>
                            </div>
                            <button
                              type="button"
                              class="self-start text-xs font-medium text-red-500 hover:text-red-700"
                              @click="removeAttendeeFromCourse(course, attendeeIndex)"
                            >
                              ลบผู้เข้าอบรม
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 px-4 py-3 text-xs text-blue-700"
                      >
                        ยังไม่ได้ระบุผู้เข้าอบรมสำหรับหลักสูตรนี้ กรุณาเพิ่มรายชื่อเพื่อให้ระบบบันทึกข้อมูลผู้เรียน
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ข้อมูลเพิ่มเติมสำหรับ สกบ.</label>
                        <textarea
                          v-model="course.custom_request"
                          rows="2"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="รายละเอียดเพิ่มเติม เช่น กลุ่มผู้เรียน, สถานที่, ประเด็นสำคัญ"
                        ></textarea>
                      </div>
                      <div class="text-[11px] text-gray-400">
                        * เพิ่มผู้เข้าอบรมและเลือกประเภท Upskill หรือ Reskill ให้ครบถ้วนสำหรับแต่ละหลักสูตร
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                  <p>ยังไม่มีหลักสูตรที่เพิ่มสำหรับทักษะนี้ กรุณากดปุ่ม “เพิ่มหลักสูตรที่ต้องการ”</p>
                  <p v-if="hasReachedCourseLimit" class="mt-2 text-red-500">จำกัดการเลือกไว้ที่ {{ MAX_COURSE_SELECTION }} หลักสูตรต่อคำขอ</p>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="border-t border-gray-200 pt-4 space-y-4">
              <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <label class="text-sm font-medium text-gray-700">2. เลือกหลักสูตรจากทักษะ: {{ selectedPackage.package_name }}</label>
                <span v-if="availableCourses.length > 0" class="text-xs text-gray-500">
                  พบ {{ filteredCourses.length }} / {{ availableCourses.length }} หลักสูตร
                </span>
              </div>

              <input
                v-model="courseFilterTerm"
                type="text"
                placeholder="ค้นหาหลักสูตรในทักษะนี้..."
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p class="mt-1 text-xs text-gray-500">กรอกชื่อหลักสูตรหรือรหัสเพื่อลดรายการ</p>
              <p class="text-xs text-gray-500">เลือกได้ไม่เกิน {{ MAX_COURSE_SELECTION }} หลักสูตรต่อคำขอ</p>

              <div v-if="isLoadingCourses" class="text-sm text-gray-500 italic">
                กำลังดึงข้อมูลหลักสูตร...
              </div>
              <div v-else-if="availableCourses.length === 0" class="text-sm text-gray-500 italic">
                ไม่พบหลักสูตรในทักษะนี้
              </div>
              <div v-else-if="filteredCourses.length === 0" class="text-sm text-gray-500 italic">
                ไม่พบหลักสูตรตามคำค้นหา
              </div>
              <div v-else class="space-y-3 max-h-96 overflow-y-auto pr-1">
                <div 
                  v-for="course in filteredCourses" 
                  :key="course.id"
                  class="border border-gray-200 bg-gray-50 rounded-lg p-3"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ course.course_title }}</div>
                      <div class="text-xs text-gray-500">{{ course.course_code }} • {{ formatCourseDuration(course) }}</div>
                      <div class="mt-2">
                        <button
                          v-if="hasCourseOutline(course)"
                          type="button"
                          class="inline-flex items-center px-2.5 py-1 rounded-full border border-blue-200 bg-white text-xs font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          @click.stop="openCourseOutline(course)"
                        >
                        โครงร่างหลักสูตร
                        </button>
                        <span v-else class="text-[11px] text-gray-400">ไม่มีข้อมูลโครงร่างในระบบ</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <label :for="`course_${course.id}`" class="text-xs font-medium text-gray-600">เลือก</label>
                      <input
                        :id="`course_${course.id}`"
                        type="checkbox"
                        :checked="isCourseSelected(course.id)"
                        :disabled="!isCourseSelected(course.id) && hasReachedCourseLimit"
                        @change="toggleCourseSelection(course)"
                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div 
                    v-if="selectedCoursesById[course.id]" 
                    class="mt-3 space-y-3 bg-white border border-blue-100 rounded-md p-3"
                  >
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">จำนวนผู้เข้าอบรม</label>
                        <div class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700">
                          {{ selectedCoursesById[course.id].attendees?.length || 0 }} คน
                        </div>
                        <p class="mt-1 text-[11px] text-gray-500">เพิ่มผู้เข้าอบรมเพื่ออัปเดตจำนวนอัตโนมัติ</p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">ทักษะ</label>
                        <div class="text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-md">
                          {{ selectedCoursesById[course.id].package_name || selectedPackage.package_name }}
                        </div>
                      </div>
                      <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">รูปแบบการเรียนรู้</label>
                        <select
                          v-model="selectedCoursesById[course.id].learning_mode"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option v-for="option in LEARNING_MODE_OPTIONS" :key="option.value" :value="option.value">
                            {{ option.label }}
                          </option>
                        </select>
                      </div>
                    </div>
                    <div class="mt-3 space-y-3">
                      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label class="text-xs font-medium text-gray-700">ผู้เข้าอบรมที่คาดว่าจะเข้าร่วม</label>
                        <button
                          type="button"
                          class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                          @click="addAttendeeToCourse(selectedCoursesById[course.id])"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                          </svg>
                          เพิ่มผู้เข้าอบรม
                        </button>
                      </div>
                      <div
                        v-if="selectedCoursesById[course.id].attendees && selectedCoursesById[course.id].attendees.length"
                        class="space-y-3"
                      >
                        <div
                          v-for="(attendee, attendeeIndex) in selectedCoursesById[course.id].attendees"
                          :key="`${course.id}-attendee-${attendeeIndex}`"
                          class="rounded-lg border border-blue-200 bg-blue-50/60 p-3"
                        >
                          <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div class="flex-1 space-y-3">
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">เลือกจากรายชื่อในระบบ</label>
                                <select
                                  v-model="attendee.employee_id"
                                  @change="handleAttendeeSelection(selectedCoursesById[course.id], attendeeIndex)"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">-- ระบุรายชื่อด้วยตนเอง --</option>
                                  <option
                                    v-for="option in participantOptions"
                                    :key="`option-${course.id}-${option.employee_id || option.fullname}`"
                                    :value="option.employee_id"
                                  >
                                    {{ option.label }}
                                  </option>
                                </select>
                              </div>
                              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">ชื่อ-สกุล *</label>
                                  <input
                                    v-model="attendee.name"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="ระบุชื่อผู้เข้าอบรม"
                                  />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">รหัสพนักงาน</label>
                                  <input
                                    v-model="attendee.employee_id"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="กรณีไม่มีในระบบ"
                                  />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">ตำแหน่ง</label>
                                  <input
                                    v-model="attendee.position"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="เช่น เจ้าหน้าที่อาวุโส"
                                  />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">ส่วนงาน</label>
                                  <input
                                    v-model="attendee.section"
                                    type="text"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="เช่น ส่วนวางแผนยุทธศาสตร์"
                                  />
                                </div>
                                <div>
                                  <label class="block text-[11px] font-medium text-gray-600 mb-1">ประเภทการพัฒนา *</label>
                                  <select
                                    v-model="attendee.development_type"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option
                                      v-for="option in DEVELOPMENT_TYPE_OPTIONS"
                                      :key="`dev-type-${course.id}-${option.value}`"
                                      :value="option.value"
                                    >
                                      {{ option.label }}
                                    </option>
                                  </select>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              class="self-start text-xs font-medium text-red-500 hover:text-red-700"
                              @click="removeAttendeeFromCourse(selectedCoursesById[course.id], attendeeIndex)"
                            >
                              ลบผู้เข้าอบรม
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 px-4 py-3 text-xs text-blue-700"
                      >
                        ยังไม่ได้ระบุผู้เข้าอบรมสำหรับหลักสูตรนี้ กรุณาเพิ่มรายชื่อเพื่อให้ระบบบันทึกข้อมูลผู้เรียน
                      </div>
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ข้อมูลที่ต้องการให้ สกบ. จัดหลักสูตร</label>
                      <textarea
                        v-model="selectedCoursesById[course.id].custom_request"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="รายละเอียดเพิ่มเติมสำหรับ สกบ. เช่น กลุ่มผู้เรียน, สถานที่, ประเด็นสำคัญ"
                      ></textarea>
                    </div>
                    <div class="text-[11px] text-gray-400">
                      * เพิ่มผู้เข้าอบรมและเลือกประเภท Upskill หรือ Reskill ให้ครบถ้วนสำหรับแต่ละหลักสูตร
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="manualCoursesForCurrentPackage.length > 0" class="space-y-3">
                <div
                  v-for="course in manualCoursesForCurrentPackage"
                  :key="course.id"
                  class="border border-blue-200 bg-blue-50 rounded-lg p-4"
                >
                  <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                    <h4 class="text-sm font-semibold text-blue-900">หลักสูตรที่เพิ่มเอง</h4>
                    <button
                      type="button"
                      @click="removeCourse(course.id)"
                      class="text-xs text-red-500 hover:text-red-700"
                    >
                      ลบออก
                    </button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">ชื่อหลักสูตร *</label>
                      <input
                        v-model="course.course_title"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">รหัสหลักสูตร</label>
                      <input
                        v-model="course.course_code"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-700 mb-1">รูปแบบการเรียนรู้</label>
                      <select
                        v-model="course.learning_mode"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option v-for="option in LEARNING_MODE_OPTIONS" :key="option.value" :value="option.value">
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="mt-3 space-y-3">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <label class="text-xs font-medium text-gray-700">ผู้เข้าอบรมที่คาดว่าจะเข้าร่วม</label>
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        @click="addAttendeeToCourse(course)"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                        </svg>
                        เพิ่มผู้เข้าอบรม
                      </button>
                    </div>
                    <div v-if="course.attendees && course.attendees.length" class="space-y-3">
                      <div
                        v-for="(attendee, attendeeIndex) in course.attendees"
                        :key="`${course.id}-manual-attendee-${attendeeIndex}`"
                        class="rounded-lg border border-blue-200 bg-white p-3"
                      >
                        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div class="flex-1 space-y-3">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">ชื่อ-สกุล *</label>
                                <input
                                  v-model="attendee.name"
                                  type="text"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="ระบุชื่อผู้เข้าอบรม"
                                />
                              </div>
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">รหัสพนักงาน</label>
                                <input
                                  v-model="attendee.employee_id"
                                  type="text"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="กรณีไม่มีในระบบ"
                                />
                              </div>
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">ตำแหน่ง</label>
                                <input
                                  v-model="attendee.position"
                                  type="text"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">ส่วนงาน</label>
                                <input
                                  v-model="attendee.section"
                                  type="text"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label class="block text-[11px] font-medium text-gray-600 mb-1">ประเภทการพัฒนา *</label>
                                <select
                                  v-model="attendee.development_type"
                                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option
                                    v-for="option in DEVELOPMENT_TYPE_OPTIONS"
                                    :key="`manual-dev-${course.id}-${option.value}`"
                                    :value="option.value"
                                  >
                                    {{ option.label }}
                                  </option>
                                </select>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            class="self-start text-xs font-medium text-red-500 hover:text-red-700"
                            @click="removeAttendeeFromCourse(course, attendeeIndex)"
                          >
                            ลบผู้เข้าอบรม
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else class="rounded-lg border border-dashed border-blue-200 bg-blue-50/60 px-4 py-3 text-xs text-blue-700">
                      ยังไม่ได้ระบุผู้เข้าอบรมสำหรับหลักสูตรนี้ กรุณาเพิ่มรายชื่อเพื่อให้ระบบบันทึกข้อมูลผู้เรียน
                    </div>
                  </div>
                  <div class="mt-3">
                    <label class="block text-xs font-medium text-gray-700 mb-1">ข้อมูลเพิ่มเติมสำหรับ สกบ.</label>
                    <textarea
                      v-model="course.custom_request"
                      rows="2"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- แสดงหลักสูตรที่เลือกทั้งหมด -->
        <div v-if="selectedCourses.length > 0" class="mt-6 p-4 bg-blue-50 rounded-lg">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h4 class="font-medium text-blue-900">หลักสูตรที่เลือก ({{ selectedCourses.length }} / {{ MAX_COURSE_SELECTION }} หลักสูตร)</h4>
            <span v-if="hasReachedCourseLimit" class="text-xs text-red-600">เลือกได้ไม่เกิน {{ MAX_COURSE_SELECTION }} หลักสูตรต่อคำขอ</span>
          </div>
          <p class="text-xs text-blue-700 mb-2">
            แผนยุทธศาสตร์: {{ planSummary || 'กรุณาเลือกแผนปฏิบัติการก่อนบันทึก' }}
          </p>
          <p v-if="selectedPackageNames.length > 0" class="mb-3 text-xs text-blue-700">
            ทักษะที่รวมอยู่ในคำขอนี้: {{ selectedPackageNames.join(', ') }}
          </p>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div 
              v-for="course in selectedCourses" 
              :key="course.id" 
              class="flex items-start justify-between gap-3 bg-white p-3 rounded border"
            >
              <div class="flex-1 space-y-1">
                <div class="text-sm font-medium text-gray-900">{{ course.course_title }}</div>
                <div class="text-xs text-gray-500">
                  รหัส: {{ course.course_code || 'ไม่ระบุ' }} | ทักษะ: {{ course.package_name || 'ไม่ระบุ' }}
                  <span v-if="course.isManual" class="ml-1 text-blue-600">(เพิ่มเอง)</span>
                </div>
                <div class="pt-1">
                  <button
                    v-if="hasCourseOutline(course)"
                    type="button"
                    class="inline-flex items-center px-2.5 py-1 rounded-full border border-blue-200 bg-white text-xs font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    @click.stop="openCourseOutline(course)"
                  >
                    โครงร่างหลักสูตร
                  </button>
                  <span v-else class="text-[11px] text-gray-400">ไม่มีข้อมูลโครงร่างในระบบ</span>
                </div>
                <div v-if="!course.isManual" class="text-xs text-gray-600">จำนวนผู้เข้าอบรม: <span class="font-semibold text-gray-900">{{ course.participants }}</span> คน</div>
                <div class="text-xs text-gray-600">
                  รูปแบบการเรียนรู้: <span class="font-semibold text-gray-900">{{ getLearningModeLabel(course.learning_mode) }}</span>
                </div>
                <div
                  v-if="course.attendees && course.attendees.length > 0 && course.attendees.some(att => att && (att.name || att.employee_id || att.raw))"
                  class="text-xs text-gray-600"
                >
                  ผู้เข้าอบรม:
                  <span class="font-medium text-gray-900">
                    {{ course.attendees.map(formatAttendeeSummary).filter(Boolean).join(', ') || 'ไม่ระบุ' }}
                  </span>
                </div>
                <div v-if="course.custom_request" class="text-xs text-gray-600">
                  คำขอถึง สกบ.: {{ course.custom_request }}
                </div>
              </div>
              <button
                @click="removeCourse(course.id)"
                class="text-red-500 hover:text-red-700 text-sm"
                type="button"
              >
                ลบ
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ข้อมูลเพิ่มเติม -->
      <div v-if="selectedCourses.length > 0" class="bg-white border border-gray-200 rounded-lg p-6">
        <h3 class="text-sm font-medium text-gray-700 mb-4">4. ข้อมูลเพิ่มเติม</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ข้อเสนอแนะ</label>
            <textarea
              v-model="form.free_text"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="ข้อเสนอแนะเพิ่มเติมที่ต้องการให้ สกบ. พิจารณา..."
            ></textarea>
          </div>
        </div>
      </div>

        <div v-if="hasSummaryData" class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sm:p-8">
          <div class="flex items-center gap-3 mb-4">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white font-semibold shadow-md">5</span>
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900">สรุปการเลือกทั้งหมด</h3>
          </div>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2 text-sm text-gray-700">
            <div class="space-y-1">
              <div class="font-medium text-gray-900">แผนยุทธศาสตร์</div>
              <p class="text-gray-600">{{ planSummary || 'ยังไม่ระบุแผนที่เกี่ยวข้อง' }}</p>
            </div>
            <div class="space-y-1">
              <div class="font-medium text-gray-900">ระดับปฏิบัติงาน</div>
              <p class="text-gray-600">{{ jobLevelSummary || 'ยังไม่เลือกกลุ่มเป้าหมาย' }}</p>
            </div>
            <div class="space-y-1">
              <div class="font-medium text-gray-900">ทักษะ / แพ็คเกจ</div>
              <p class="text-gray-600">{{ packageSummary || 'ยังไม่เลือกทักษะหลักสูตร' }}</p>
            </div>
            <div class="space-y-1">
              <div class="font-medium text-gray-900">หลักสูตรที่เลือก</div>
              <p v-if="selectedCourseTitles.length" class="text-gray-600">
                <span class="font-semibold text-gray-900">{{ selectedCourseTitles.length }}</span>
                หลักสูตร:
                <span>{{ selectedCourseTitles.slice(0, 4).join(', ') }}</span>
                <span v-if="selectedCourseTitles.length > 4" class="text-gray-400">
                  และอีก {{ selectedCourseTitles.length - 4 }} หลักสูตร
                </span>
              </p>
              <p v-else class="text-gray-600">ยังไม่เลือกหลักสูตร</p>
            </div>
            <div class="space-y-1">
              <div class="font-medium text-gray-900">ข้อเสนอแนะ</div>
              <p class="text-gray-600">{{ suggestionSummary || 'ยังไม่มีข้อเสนอแนะเพิ่มเติม' }}</p>
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

    <transition name="fade">
      <div
        v-if="showCustomCourseModal"
        class="fixed inset-0 z-50 flex items-center justify-center px-4"
        aria-modal="true"
        role="dialog"
      >
        <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" @click="closeCustomCourseModal"></div>
        <div class="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">เพิ่มหลักสูตร/หัวข้อ ที่สนใจ</h2>
              <p class="text-sm text-gray-500 mt-1">ระบุรายละเอียดหลักสูตรอื่น ๆ ที่ต้องการพัฒนาหรือจัดอบรม</p>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600"
              @click="closeCustomCourseModal"
              aria-label="ปิดหน้าต่าง"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form class="mt-6 space-y-5" @submit.prevent="handleAddManualCourseFromModal">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักสูตร *</label>
                <input
                  v-model="manualCourseDraft.title"
                  type="text"
                  required
                  placeholder="กรอกชื่อหลักสูตร"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">รหัสหลักสูตร (ถ้ามี)</label>
                <input
                  v-model="manualCourseDraft.code"
                  type="text"
                  placeholder="เช่น CUSTOM-001"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">รูปแบบการเรียนรู้</label>
                <select
                  v-model="manualCourseDraft.learning_mode"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option v-for="option in LEARNING_MODE_OPTIONS" :key="`modal-learning-${option.value}`" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ข้อมูลที่ต้องการให้ สกบ. จัดหลักสูตร</label>
              <textarea
                v-model="manualCourseDraft.custom_request"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="รายละเอียดเพิ่มเติม เช่น กลุ่มผู้เรียน, สถานที่, ประเด็นสำคัญ"
              ></textarea>
            </div>

            <div class="flex flex-col gap-3 pt-4 border-t border-gray-200 md:flex-row md:justify-end">
              <button
                type="button"
                class="px-5 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                @click="closeCustomCourseModal"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                :disabled="hasReachedCourseLimit"
                :class="['px-5 py-2 rounded-md text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500', hasReachedCourseLimit ? 'bg-blue-400 cursor-not-allowed opacity-70' : 'bg-blue-600 hover:bg-blue-700']"
              >
                บันทึกหลักสูตร
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { strategicPlanHierarchy } from '~/utils/strategicPlan'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const isManager = computed(() => (Number(user.value?.level) || 0) >= 8)

const form = reactive({
  job_levels: [],
  training_objective: '',
  expected_outcome: '',
  free_text: ''
})

const jobLevels = ref([])
const submitting = ref(false)
const DEFAULT_PACKAGE_LIMIT = 20
const MAX_COURSE_SELECTION = 3
const LEARNING_MODE_OPTIONS = [
  { value: 'onsite', label: 'On-site (อบรมที่สถานที่จริง)' },
  { value: 'online', label: 'Online (ถ่ายทอดสดผ่านวิดีโอ)' },
  { value: 'elearning', label: 'E-Learning (เรียนด้วยตนเอง)' }
]
const DEVELOPMENT_TYPE_OPTIONS = [
  { value: '', label: '— เลือกประเภทการพัฒนา —' },
  { value: 'upskill', label: 'Upskill' },
  { value: 'reskill', label: 'Reskill' }
]
const LEARNING_MODE_VALUES = LEARNING_MODE_OPTIONS.map(option => option.value)
const DEFAULT_LEARNING_MODE = LEARNING_MODE_OPTIONS[0].value
const DEFAULT_DEVELOPMENT_TYPE = ''
const subordinates = ref([])
const stepGuide = [
  {
    label: 'แผนยุทธศาสตร์',
    description: 'กำหนดชื่อแผน/โครงการ และเลือก SO, Strategy, Tactic, Action Plan ที่เกี่ยวข้อง'
  },
  {
    label: 'ระดับปฏิบัติงาน',
    description: 'ระบุระดับพนักงานที่จะเข้ารับการพัฒนา สามารถเลือกได้มากกว่าหนึ่ง'
  },
  {
    label: 'ทักษะ & หลักสูตร',
    description: 'ค้นหาหลักสูตรจากฐานข้อมูลหรือเพิ่มหลักสูตรใหม่ที่ต้องการ'
  },
  {
    label: 'ข้อมูลเพิ่มเติม',
    description: 'บันทึกวัตถุประสงค์ ผลลัพธ์ที่คาดหวัง หมายเหตุ และรายละเอียดต่อหลักสูตร'
  }
]

const customPackageName = ref('')
const strategicPlanName = ref('')

const safeTrim = (value) => (typeof value === 'string' ? value.trim() : '')

const createEmptyAttendeeSlot = () => ({
  employee_id: '',
  name: '',
  position: '',
  section: '',
  display: '',
  raw: '',
  development_type: DEFAULT_DEVELOPMENT_TYPE
})

const manualCourseDraft = reactive({
  title: '',
  code: '',
  duration: '',
  learning_mode: DEFAULT_LEARNING_MODE,
  custom_request: ''
})

let manualCourseCounter = 0

const generateManualCourseId = () => {
  manualCourseCounter += 1
  return `manual-${Date.now()}-${manualCourseCounter}`
}

// Live search for packages
const packageSearchTerm = ref('')
const searchedPackages = ref([])
const showPackageDropdown = ref(false)
const selectedPackage = ref(null)
const showCustomCourseModal = ref(false)
const packageSearchInput = ref(null)

// Courses within selected package
const availableCourses = ref([])
const isLoadingCourses = ref(false)
const courseFilterTerm = ref('')
const selectedCourses = ref([])

let packageSearchTimeout = null

const strategicPlans = strategicPlanHierarchy
const trimmedPlanName = computed(() => strategicPlanName.value.trim())
const hasPlanName = computed(() => trimmedPlanName.value.length > 0)

const selectedObjectiveCode = ref('')
const selectedStrategyCode = ref('')
const selectedTacticCode = ref('')
const selectedActionPlanCode = ref('')

const selectedObjective = computed(() => strategicPlans.find(obj => obj.code === selectedObjectiveCode.value) || null)
const strategyOptions = computed(() => selectedObjective.value?.strategies ?? [])
const selectedStrategy = computed(() => strategyOptions.value.find(strategy => strategy.code === selectedStrategyCode.value) || null)
const tacticOptions = computed(() => selectedStrategy.value?.tactics ?? [])
const selectedTactic = computed(() => tacticOptions.value.find(tactic => tactic.code === selectedTacticCode.value) || null)
const actionPlanOptions = computed(() => selectedTactic.value?.actionPlans ?? [])
const selectedActionPlan = computed(() => actionPlanOptions.value.find(plan => plan.code === selectedActionPlanCode.value) || null)
const hasCompletePlanPath = computed(() => Boolean(selectedObjective.value && selectedStrategy.value && selectedTactic.value && selectedActionPlan.value))

watch(selectedObjectiveCode, () => {
  selectedStrategyCode.value = ''
  selectedTacticCode.value = ''
  selectedActionPlanCode.value = ''
  strategicPlanName.value = ''
})

watch(selectedStrategyCode, () => {
  selectedTacticCode.value = ''
  selectedActionPlanCode.value = ''
  strategicPlanName.value = ''
})

watch(selectedTacticCode, () => {
  selectedActionPlanCode.value = ''
  strategicPlanName.value = ''
})

watch(selectedActionPlanCode, (code, previous) => {
  if (!code && previous) {
    strategicPlanName.value = ''
  }
})

const planSummaryParts = computed(() => {
  const parts = []
  if (trimmedPlanName.value) {
    parts.push(trimmedPlanName.value)
  }
  if (selectedObjective.value) {
    parts.push(`${selectedObjective.value.code} ${selectedObjective.value.name}`)
  }
  if (selectedStrategy.value) {
    parts.push(`${selectedStrategy.value.code} ${selectedStrategy.value.name}`)
  }
  if (selectedTactic.value) {
    parts.push(`${selectedTactic.value.code} ${selectedTactic.value.name}`)
  }
  if (selectedActionPlan.value) {
    parts.push(`${selectedActionPlan.value.code} ${selectedActionPlan.value.name}`)
  }
  return parts
})

const planSummary = computed(() => planSummaryParts.value.join(' > '))

const isCustomPackage = computed(() => {
  const name = selectedPackage.value?.package_name
  if (!name) return false
  const normalized = name.trim().toLowerCase()
  if (normalized.length === 0) return false
  return normalized === 'อื่นๆ' || normalized === 'other' || normalized.includes('อื่นๆ') || normalized.includes('other')
})

const customPackageDisplayName = computed(() => {
  if (!isCustomPackage.value) return ''
  const draft = customPackageName.value?.trim() || ''
  if (draft.length > 0) {
    return draft
  }
  return selectedPackage.value?.package_name || 'อื่นๆ'
})

const hasReachedCourseLimit = computed(() => selectedCourses.value.length >= MAX_COURSE_SELECTION)

const manualCourses = computed(() => selectedCourses.value.filter(course => course.isManual))

const getLearningModeLabel = (value) => {
  const match = LEARNING_MODE_OPTIONS.find(option => option.value === value)
  return match ? match.label : 'ไม่ระบุ'
}

const participantOptions = computed(() => {
  const options = []
  const seen = new Set()

  const addOption = (person) => {
    if (!person) return
    const id = safeTrim(person.employee_id || person.id || person.employeeId || person.ID8 || '')
    const name = safeTrim(person.fullname || person.full_name || person.name || '')
    const key = id || name
    if (!key || seen.has(key)) {
      return
    }
    seen.add(key)
    options.push({
      employee_id: id,
      fullname: name,
      position: safeTrim(person.position || person.position_n || ''),
      section: safeTrim(person.section || person.section_n || ''),
      label: [id, name].filter(Boolean).join(' • '),
      display: [id, name].filter(Boolean).join(' | ')
    })
  }

  if (user.value) {
    addOption({
      employee_id: user.value.employee_id || user.value.id,
      fullname: user.value.fullname || user.value.name,
      position: user.value.position,
      section: user.value.section
    })
  }

  if (Array.isArray(subordinates.value)) {
    subordinates.value.forEach(addOption)
  }

  return options.sort((a, b) => a.fullname.localeCompare(b.fullname, 'th') || a.fullname.localeCompare(b.fullname, 'en'))
})

const participantLookup = computed(() => participantOptions.value.reduce((acc, option) => {
  if (option.employee_id) {
    acc[option.employee_id] = option
  }
  return acc
}, {}))

const manualCoursesForCurrentPackage = computed(() => {
  if (!selectedPackage.value) return []
  const key = selectedPackage.value.aggregateKey || selectedPackage.value.primaryPackageId || selectedPackage.value.id || selectedPackage.value.package_name
  return manualCourses.value.filter(course => {
    if (course.manualSource === 'custom-other') {
      return isCustomPackage.value
    }
    return course.basePackageKey === key
  })
})

const ensureCourseLearningMode = (course) => {
  if (!course) return
  if (!LEARNING_MODE_VALUES.includes(course.learning_mode)) {
    course.learning_mode = DEFAULT_LEARNING_MODE
  }
}

const updateCourseParticipantCount = (course) => {
  if (!course) return
  const attendeeCount = Array.isArray(course.attendees) ? course.attendees.length : 0
  course.participants = Math.max(1, attendeeCount || parseInt(course.participants, 10) || 0)
}

const ensureCourseAttendees = (course) => {
  if (!course) return

  if (!Array.isArray(course.attendees)) {
    course.attendees = []
  }

  course.attendees.forEach(att => {
    if (!att) {
      return
    }
    att.employee_id = safeTrim(att.employee_id || att.id)
    att.name = safeTrim(att.name || att.fullname)
    att.position = safeTrim(att.position || att.position_n)
    att.section = safeTrim(att.section || att.section_n)
    att.raw = safeTrim(att.raw || att.display)
    att.display = safeTrim(att.display) || [att.employee_id, att.name].filter(Boolean).join(' | ')
    if (!att.development_type) {
      att.development_type = DEFAULT_DEVELOPMENT_TYPE
    }
  })

  updateCourseParticipantCount(course)
  ensureCourseLearningMode(course)
}

const findCourseById = (courseId) => selectedCourses.value.find(course => course.id === courseId)

const getDevelopmentTypeLabel = (value) => {
  if (!value) {
    return 'ไม่ระบุ'
  }
  const match = DEVELOPMENT_TYPE_OPTIONS.find(option => option.value === value)
  return match ? match.label : 'ไม่ระบุ'
}

const formatAttendeeSummary = (attendee) => {
  if (!attendee) return ''
  const id = (attendee.employee_id || '').trim()
  const name = (attendee.name || '').trim()
  const base = name || id || (attendee.raw || '').trim()
  const typeLabel = getDevelopmentTypeLabel(attendee.development_type)
  if (base && typeLabel && typeLabel !== 'ไม่ระบุ') {
    if (id && name) {
      return `${id} ${name} (${typeLabel})`
    }
    return `${base} (${typeLabel})`
  }
  if (id && name) return `${id} ${name}`
  return base
}

const addAttendeeToCourse = (course) => {
  if (!course) return
  if (!Array.isArray(course.attendees)) {
    course.attendees = []
  }
  course.attendees.push(createEmptyAttendeeSlot())
  updateCourseParticipantCount(course)
}

const removeAttendeeFromCourse = (course, index) => {
  if (!course || !Array.isArray(course.attendees)) return
  if (index < 0 || index >= course.attendees.length) return
  course.attendees.splice(index, 1)
  updateCourseParticipantCount(course)
}

const handleAttendeeSelection = (course, index) => {
  if (!course || !Array.isArray(course.attendees)) return
  const attendee = course.attendees[index]
  if (!attendee) return
  const option = attendee.employee_id ? participantLookup.value[attendee.employee_id] : null
  if (option) {
    attendee.name = option.fullname
    attendee.position = option.position
    attendee.section = option.section
    attendee.display = option.display
    attendee.raw = option.display
  }
  ensureCourseAttendees(course)
}

watch(() => manualCourseDraft.learning_mode, () => {
  ensureCourseLearningMode(manualCourseDraft)
}, { immediate: true })

watch(selectedCourses, (courses) => {
  courses.forEach(course => {
    ensureCourseAttendees(course)
    ensureCourseLearningMode(course)
  })
}, { deep: true })

watch(isCustomPackage, (isCustom, wasCustom) => {
  if (isCustom) {
    availableCourses.value = []
    courseFilterTerm.value = ''
  } else if (wasCustom) {
    resetManualCourseDraft()
  }
  if (!isCustom) {
    showCustomCourseModal.value = false
  }
})

watch(customPackageDisplayName, (name) => {
  if (!isCustomPackage.value) return
  selectedCourses.value.forEach(course => {
    if (course.isManual && course.manualSource === 'custom-other') {
      course.package_name = name
      course.custom_package_name = name
    }
  })
})

const aggregatePackagesByName = (packages) => {
  const groups = new Map()

  packages.forEach(pkg => {
    const rawName = (pkg.package_name || '').trim()
    const packageName = rawName.length > 0 ? rawName : 'ไม่ระบุชื่อทักษะ'
    const key = packageName.toLowerCase()

    if (!groups.has(key)) {
      groups.set(key, {
        package_name: packageName,
        course_count: Number(pkg.course_count) || 0,
        allPackageIds: pkg.id ? [pkg.id] : [],
        allPackageCodes: pkg.package_code ? [pkg.package_code] : [],
        primaryPackageId: pkg.id ?? null,
        primaryPackageCode: pkg.package_code ?? null
      })
    } else {
      const entry = groups.get(key)
      entry.course_count += Number(pkg.course_count) || 0

      if (pkg.id && !entry.allPackageIds.includes(pkg.id)) {
        entry.allPackageIds.push(pkg.id)
      }

      if (pkg.package_code && !entry.allPackageCodes.includes(pkg.package_code)) {
        entry.allPackageCodes.push(pkg.package_code)
      }

      if (!entry.primaryPackageId && pkg.id) {
        entry.primaryPackageId = pkg.id
      }

      if (!entry.primaryPackageCode && pkg.package_code) {
        entry.primaryPackageCode = pkg.package_code
      }
    }
  })

  return Array.from(groups.entries())
    .map(([key, entry]) => ({
      id: entry.primaryPackageId,
      package_name: entry.package_name,
      package_code: entry.primaryPackageCode,
      course_count: entry.course_count,
      aggregateKey: key,
      allPackageIds: entry.allPackageIds,
      allPackageCodes: entry.allPackageCodes,
      primaryPackageId: entry.primaryPackageId,
      primaryPackageCode: entry.primaryPackageCode
    }))
    .sort((a, b) => a.package_name.localeCompare(b.package_name, 'th') || a.package_name.localeCompare(b.package_name, 'en'))
}

const fetchPackages = async (term = '') => {
  try {
    const params = new URLSearchParams()
    params.append('limit', DEFAULT_PACKAGE_LIMIT.toString())
    if (term) {
      params.append('search', term)
    }
    const query = params.toString()
    const response = await fetch(`http://localhost:4001/api/courses/packages${query ? `?${query}` : ''}`, {
      credentials: 'include'
    })
    const data = await response.json()
    const aggregated = Array.isArray(data) ? aggregatePackagesByName(data) : []

    const otherOption = {
      id: 'manual-other',
      package_name: 'อื่นๆ (กำหนดเอง)',
      package_code: 'CUSTOM',
      course_count: 0,
      aggregateKey: '__manual_other__',
      allPackageIds: [],
      allPackageCodes: [],
      primaryPackageId: null,
      primaryPackageCode: null
    }

  searchedPackages.value = [...aggregated, otherOption]
  } catch (error) {
    console.error('Error fetching packages:', error)
    searchedPackages.value = []
  }
}

// Computed
const canSubmit = computed(() => {
  return (
    form.job_levels.length > 0 &&
    selectedCourses.value.length > 0 &&
    hasPlanName.value &&
    !!selectedActionPlan.value &&
    selectedCourses.value.every(course => {
      const title = (course.course_title || '').trim()
      const filledAttendees = Array.isArray(course.attendees)
        ? course.attendees.filter(att => safeTrim(att?.name || att?.employee_id || att?.raw))
        : []
      const attendeeCount = filledAttendees.length
      const hasMissingDevelopmentType = filledAttendees.some(att => !safeTrim(att?.development_type))
      return (
        attendeeCount > 0 &&
        Number(course.participants) > 0 &&
        title.length > 0 &&
        LEARNING_MODE_VALUES.includes(course.learning_mode) &&
        !hasMissingDevelopmentType
      )
    })
  )
})

// Methods
const onJobLevelChange = () => {
  // Reset selections when job level changes
  clearPackageSelection()
  clearCourseSelection()
}

const loadSubordinates = async () => {
  if (!authStore.isAuthenticated) {
    subordinates.value = []
    return
  }

  const isValid = await authStore.validateToken({ keepStateOnError: true })
  if (!isValid) {
    subordinates.value = []
    return
  }

  try {
    const response = await fetch('http://localhost:4001/api/assignments/subordinates', {
      credentials: 'include'
    })

    if (!response.ok) {
      if (response.status !== 403) {
        console.warn('Unable to load subordinates:', response.status)
      }
      subordinates.value = []
      return
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      subordinates.value = data.map(person => ({
        employee_id: person.employee_id || person.id || '',
        fullname: person.fullname || person.name || '',
        position: person.position || person.position_n || '',
        section: person.section || person.section_n || '',
        level: person.level || person.LEVEL || null
      }))
    } else {
      subordinates.value = []
    }
  } catch (error) {
    console.error('Error loading subordinates:', error)
    subordinates.value = []
  }
}

// Package search methods
const searchPackages = () => {
  clearTimeout(packageSearchTimeout)
  packageSearchTimeout = setTimeout(async () => {
    const term = packageSearchTerm.value.trim()
    await fetchPackages(term)
  }, 300)
}

const handlePackageFocus = async () => {
  showPackageDropdown.value = true
  const term = packageSearchTerm.value.trim()
  await fetchPackages(term)
}

onBeforeUnmount(() => {
  clearTimeout(packageSearchTimeout)
})

const selectPackage = async (pkg) => {
  selectedPackage.value = { ...pkg }
  packageSearchTerm.value = pkg.package_name
  showPackageDropdown.value = false
  searchedPackages.value = []
  resetManualCourseDraft()

  if (isCustomPackage.value) {
    customPackageName.value = ''
    availableCourses.value = []
    if (hasReachedCourseLimit.value) {
      showCustomCourseModal.value = false
      alert(`สามารถเลือกหลักสูตรได้ไม่เกิน ${MAX_COURSE_SELECTION} หลักสูตรต่อคำขอ`)
    } else {
      showCustomCourseModal.value = true
    }
  } else {
    showCustomCourseModal.value = false
    await loadCoursesForPackage(pkg)
  }
}

const clearPackageSelection = () => {
  selectedPackage.value = null
  packageSearchTerm.value = ''
  availableCourses.value = []
  courseFilterTerm.value = ''
  customPackageName.value = ''
  showCustomCourseModal.value = false
  resetManualCourseDraft()
  clearCourseSelection()

  searchedPackages.value = []
  showPackageDropdown.value = true
  fetchPackages()

  nextTick(() => {
    packageSearchInput.value?.focus()
  })
}

const loadCoursesForPackage = async (pkg) => {
  if (!pkg) return

  const rawName = pkg.package_name ? String(pkg.package_name).trim().toLowerCase() : ''
  if (rawName && (rawName === 'อื่นๆ' || rawName === 'other' || rawName.includes('อื่นๆ') || rawName.includes('other'))) {
    availableCourses.value = []
    return
  }
  
  isLoadingCourses.value = true
  courseFilterTerm.value = ''
  
  try {
    const courseMap = new Map()

    const fetchByParams = async (params) => {
      const queryString = params.toString()
      try {
        const response = await fetch(`http://localhost:4001/api/courses/courses?${queryString}`, {
          credentials: 'include'
        })
        if (!response.ok) {
          console.error('Failed to load courses for query:', queryString, response.status)
          return
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          data.forEach(course => {
            const normalizedCourse = {
              ...course,
              package_name: course.package_name || pkg.package_name,
              package_code: course.package_code || pkg.package_code || pkg.primaryPackageCode
            }
            courseMap.set(normalizedCourse.id, normalizedCourse)
          })
        }
      } catch (err) {
        console.error('Error loading courses for query:', queryString, err)
      }
    }

    const packageIdList = Array.isArray(pkg.allPackageIds) && pkg.allPackageIds.length > 0
      ? pkg.allPackageIds
      : (pkg.primaryPackageId ? [pkg.primaryPackageId] : [])

    const packageCodeList = Array.isArray(pkg.allPackageCodes) && pkg.allPackageCodes.length > 0
      ? pkg.allPackageCodes
      : (pkg.primaryPackageCode ? [pkg.primaryPackageCode] : [])

    const fetchTasks = []

    if (packageIdList.length > 0) {
      packageIdList.forEach(id => {
        const params = new URLSearchParams()
        params.append('package_id', id)
        fetchTasks.push(fetchByParams(params))
      })
    } else if (pkg.package_name) {
      const params = new URLSearchParams()
      params.append('package_name', pkg.package_name)
      fetchTasks.push(fetchByParams(params))
    } else if (packageCodeList.length > 0) {
      packageCodeList.forEach(code => {
        const params = new URLSearchParams()
        params.append('package_code', code)
        fetchTasks.push(fetchByParams(params))
      })
    }

    if (fetchTasks.length === 0) {
      availableCourses.value = []
      return
    }

    await Promise.all(fetchTasks)

    availableCourses.value = Array.from(courseMap.values())
      .sort((a, b) => (a.course_title || '').localeCompare(b.course_title || '', 'th') || (a.course_title || '').localeCompare(b.course_title || '', 'en'))
  } catch (error) {
    console.error('Error loading courses for package:', error)
    availableCourses.value = []
  } finally {
    isLoadingCourses.value = false
  }
}

const clearCourseSelection = () => {
  selectedCourses.value = []
}

const openCustomCourseModal = () => {
  if (hasReachedCourseLimit.value) {
    alert(`สามารถเลือกหลักสูตรได้ไม่เกิน ${MAX_COURSE_SELECTION} หลักสูตรต่อคำขอ`)
    return
  }
  showCustomCourseModal.value = true
}

const closeCustomCourseModal = () => {
  showCustomCourseModal.value = false
}

const handleAddManualCourseFromModal = () => {
  const success = addManualCourse()
  if (success) {
    showCustomCourseModal.value = false
  }
}

const resetManualCourseDraft = () => {
  manualCourseDraft.title = ''
  manualCourseDraft.code = ''
  manualCourseDraft.duration = ''
  manualCourseDraft.learning_mode = DEFAULT_LEARNING_MODE
  manualCourseDraft.custom_request = ''
}

const formatCourseDuration = (course) => {
  if (!course) return 'ไม่ระบุระยะเวลา'

  const rawDuration = course.duration ?? course.duration_hours

  if (rawDuration === null || rawDuration === undefined) {
    return 'ไม่ระบุระยะเวลา'
  }

  const numericDuration = Number(rawDuration)
  if (Number.isFinite(numericDuration) && numericDuration > 0) {
    return `${numericDuration} ชั่วโมง`
  }

  if (typeof rawDuration === 'string' && rawDuration.trim().length > 0) {
    return rawDuration.trim()
  }

  return 'ไม่ระบุระยะเวลา'
}

const filteredCourses = computed(() => {
  if (!courseFilterTerm.value.trim()) {
    return availableCourses.value
  }

  const term = courseFilterTerm.value.trim().toLowerCase()
  return availableCourses.value.filter(course => {
    const title = (course.course_title || '').toLowerCase()
    const code = (course.course_code || '').toLowerCase()
    return title.includes(term) || code.includes(term)
  })
})

const selectedCoursesById = computed(() => {
  return selectedCourses.value.reduce((acc, course) => {
    acc[course.id] = course
    return acc
  }, {})
})

const selectedPackageNames = computed(() => {
  const names = new Set(
    selectedCourses.value
      .map(course => course.package_name || course.custom_package_name || selectedPackage.value?.package_name || 'ไม่ระบุทักษะ')
      .filter(Boolean)
  )
  return Array.from(names)
})

const selectedJobLevelNames = computed(() => {
  const picked = new Set(form.job_levels)
  return jobLevels.value
    .filter(level => picked.has(level.id))
    .map(level => level.level_name)
})

const jobLevelSummary = computed(() => selectedJobLevelNames.value.join(', '))
const packageSummary = computed(() => selectedPackageNames.value.join(', '))

const selectedCourseTitles = computed(() =>
  selectedCourses.value
    .map(course => safeTrim(course.course_title || course.title || course.name || ''))
    .filter(Boolean)
)

const suggestionSummary = computed(() => safeTrim(form.free_text))

const hasSummaryData = computed(() =>
  Boolean(planSummary.value) ||
  Boolean(jobLevelSummary.value) ||
  Boolean(packageSummary.value) ||
  selectedCourseTitles.value.length > 0 ||
  Boolean(suggestionSummary.value)
)

const buildCourseOutlineUrl = (course) => {
  if (!course || course.isManual) return null

  const tnId = course.tn_course_id
  if (Number.isInteger(tnId) && tnId > 0) {
    return `/training/outline/${tnId}?lookup=id`
  }

  const tnCodeRaw = course.tn_course_code || course.course_code
  if (tnCodeRaw && typeof tnCodeRaw === 'string') {
    const normalized = tnCodeRaw.split(':')[0].trim()
    if (normalized.length > 0) {
      return `/training/outline/${encodeURIComponent(normalized)}`
    }
  }

  return null
}

const hasCourseOutline = (course) => Boolean(buildCourseOutlineUrl(course))

const openCourseOutline = (course) => {
  const url = buildCourseOutlineUrl(course)
  if (!url) {
    alert('ไม่พบข้อมูลโครงร่างของหลักสูตรนี้ในระบบ')
    return
  }

  if (typeof window !== 'undefined') {
    const absoluteUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer')
  }
}

const isCourseSelected = (courseId) => Boolean(selectedCoursesById.value[courseId])

const toggleCourseSelection = (course) => {
  const existingIndex = selectedCourses.value.findIndex(c => c.id === course.id)
  
  if (existingIndex !== -1) {
    selectedCourses.value.splice(existingIndex, 1)
    return
  }

  if (hasReachedCourseLimit.value) {
    alert(`สามารถเลือกหลักสูตรได้ไม่เกิน ${MAX_COURSE_SELECTION} หลักสูตรต่อคำขอ`)
    return
  }

  const courseToAdd = {
    ...course,
    package_name: course.package_name || selectedPackage.value?.package_name || '',
    package_code: course.package_code || selectedPackage.value?.package_code || selectedPackage.value?.primaryPackageCode || '',
    isManual: false,
    participants: 1,
    custom_request: '',
    learning_mode: DEFAULT_LEARNING_MODE,
    attendees: [createEmptyAttendeeSlot()]
  }

  ensureCourseAttendees(courseToAdd)
  selectedCourses.value.push(courseToAdd)
}

const addManualCourse = () => {
  if (!selectedPackage.value) {
    alert('กรุณาเลือกทักษะก่อนเพิ่มหลักสูตร')
    return false
  }

  if (hasReachedCourseLimit.value) {
    alert(`สามารถเลือกหลักสูตรได้ไม่เกิน ${MAX_COURSE_SELECTION} หลักสูตรต่อคำขอ`)
    return false
  }

  const title = (manualCourseDraft.title || '').trim()
  if (title.length === 0) {
    alert('กรุณากรอกชื่อหลักสูตร')
    return false
  }
  const baseKey = selectedPackage.value.aggregateKey || selectedPackage.value.primaryPackageId || selectedPackage.value.id || selectedPackage.value.package_name || 'manual'
  const packageName = isCustomPackage.value
    ? (customPackageDisplayName.value || selectedPackage.value?.package_name || 'อื่นๆ')
    : (selectedPackage.value?.package_name || 'ไม่ระบุทักษะ')
  const packageCode = isCustomPackage.value
    ? 'CUSTOM'
    : (selectedPackage.value?.package_code || selectedPackage.value?.primaryPackageCode || 'MANUAL')

  const manualCourse = {
    id: generateManualCourseId(),
    isManual: true,
    manualSource: isCustomPackage.value ? 'custom-other' : 'package-manual',
    basePackageKey: baseKey,
    course_title: title,
    course_code: (manualCourseDraft.code || '').trim() || null,
    package_name: packageName,
    custom_package_name: isCustomPackage.value ? packageName : null,
    package_code: packageCode,
    participants: 1,
    learning_mode: LEARNING_MODE_VALUES.includes(manualCourseDraft.learning_mode) ? manualCourseDraft.learning_mode : DEFAULT_LEARNING_MODE,
    custom_request: (manualCourseDraft.custom_request || '').trim(),
    duration: (manualCourseDraft.duration || '').trim() || null,
    attendees: [createEmptyAttendeeSlot()]
  }

  ensureCourseAttendees(manualCourse)
  selectedCourses.value.push(manualCourse)

  resetManualCourseDraft()
  return true
}

const removeCourse = (courseId) => {
  selectedCourses.value = selectedCourses.value.filter(c => c.id !== courseId)
}

// Click outside handlers
const handleClickOutside = (event) => {
  const packageDropdown = event.target.closest('.package-dropdown')

  if (!packageDropdown) {
    showPackageDropdown.value = false
  }
}

const buildCourseFreeText = (course) => {
  const sections = []

  if (trimmedPlanName.value) {
    sections.push(`ชื่อแผน/โครงการ: ${trimmedPlanName.value}`)
  }

  const planPath = planSummary.value
  const summaryParts = planSummaryParts.value
  const baseCount = trimmedPlanName.value ? 1 : 0

  if (summaryParts.length > baseCount && planPath) {
    sections.push(`แผนยุทธศาสตร์: ${planPath}`)
  }

  if (course.custom_request && course.custom_request.trim().length > 0) {
    sections.push(`คำขอถึง สกบ.: ${course.custom_request.trim()}`)
  }

  if (form.free_text && form.free_text.trim().length > 0) {
    sections.push(`ข้อเสนอแนะ: ${form.free_text.trim()}`)
  }

  const learningModeLabel = getLearningModeLabel(course.learning_mode)
  if (learningModeLabel && learningModeLabel !== 'ไม่ระบุ') {
    sections.push(`รูปแบบการเรียนรู้: ${learningModeLabel}`)
  }

  if (Array.isArray(course.attendees) && course.attendees.length > 0) {
    const attendeeSummary = course.attendees.map(formatAttendeeSummary).filter(Boolean)
    if (attendeeSummary.length > 0) {
      sections.push(`ผู้เข้าอบรม: ${attendeeSummary.join(', ')}`)
    }
  }

  return sections.join('\n\n')
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  submitting.value = true
  
  try {
    const sessionValid = await authStore.validateToken({ keepStateOnError: true })

    if (!sessionValid || !user.value) {
      throw new Error('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่')
    }

    const currentUser = user.value
    const employeeId = currentUser.employee_id || currentUser.id
    const requesterName = currentUser.fullname || currentUser.name || ''
    const requesterDepartment = currentUser.department || currentUser.department_short || ''
    const requesterSection = currentUser.section || ''
    const requesterPosition = currentUser.position || ''
    const sectionCode = currentUser.section_code || currentUser.sectionCode || null
    const departmentShort = currentUser.department_short || null

    if (!employeeId) {
      throw new Error('ไม่พบรหัสพนักงาน กรุณาติดต่อผู้ดูแลระบบ')
    }
    
    // ส่งคำขอแยกรายการต่อหลักสูตร
    const jobLevelSummaryForSubmit = selectedJobLevelNames.value.length > 0
      ? selectedJobLevelNames.value.join(', ')
      : form.job_levels.join(', ')

    const planSummaryText = planSummary.value || ''
    const strategicObjectiveCode = selectedObjective.value?.code || null
    const strategicStrategyCode = selectedStrategy.value?.code || null
    const strategicTacticCode = selectedTactic.value?.code || null
    const strategicActionPlanCode = selectedActionPlan.value?.code || null

    const courseMissingDevType = selectedCourses.value.find(course => {
      const filledAttendees = Array.isArray(course.attendees)
        ? course.attendees.filter(att => safeTrim(att?.name || att?.employee_id || att?.raw))
        : []
      return filledAttendees.some(att => !safeTrim(att?.development_type))
    })

    if (courseMissingDevType) {
      const courseLabel = safeTrim(courseMissingDevType.course_title) || safeTrim(courseMissingDevType.package_name) || 'หลักสูตรที่เลือก'
      alert(`กรุณาเลือกประเภทการพัฒนาสำหรับผู้เข้าอบรมทุกคนในหลักสูตร "${courseLabel}"`)
      submitting.value = false
      return
    }

    const promises = selectedCourses.value.map(course => {
      const courseFreeText = buildCourseFreeText(course)
      const packageLabel = course.isManual
        ? (course.package_name || 'ทักษะเพิ่มเอง')
        : (course.package_code
            ? `${course.package_name} (${course.package_code})`
            : course.package_name)
      const learningModeLabel = getLearningModeLabel(course.learning_mode)
      const participantPayload = Array.isArray(course.attendees)
        ? course.attendees
            .filter(att => att && (att.employee_id || att.name || att.raw || att.display))
            .map(att => ({
              employee_id: att?.employee_id || '',
              name: att?.name || '',
              position: att?.position || '',
              section: att?.section || '',
              raw: att?.raw || att?.display || '',
              display: att?.display || '',
              development_type: att?.development_type || ''
            }))
        : []
      const participants = Math.max(1, participantPayload.length || parseInt(course.participants, 10) || 0)
      const courseTypesSummaryParts = [
        `ระดับ: ${jobLevelSummaryForSubmit || 'ไม่ระบุ'}`,
        `ทักษะ: ${packageLabel || 'ไม่ระบุ'}`,
        `แผน: ${planSummaryText || 'ไม่ระบุ'}`
      ]
      courseTypesSummaryParts.push(`รูปแบบการเรียนรู้: ${learningModeLabel}`)
      courseTypesSummaryParts.push(`ผู้เข้าอบรม: ${participants} คน`)
      const courseTypesSummary = courseTypesSummaryParts.join(' | ')

      const submitData = {
        employee_id: employeeId,
        employee_name: requesterName,
        department: requesterDepartment,
        section: requesterSection,
        position: requesterPosition,
        job_levels: JSON.stringify(form.job_levels),
        selected_package_code: course.package_code || (course.isManual ? 'CUSTOM' : null),
        selected_package_name: course.package_name || null,
        selected_course_id: course.isManual ? null : course.id,
        custom_package_name: course.custom_package_name || null,
        is_manual_course: course.isManual ? 1 : 0,
    course_duration: course.duration || null,
    course_title: course.course_title,
        participants,
        training_objective: form.training_objective,
        expected_outcome: form.expected_outcome,
        free_text: courseFreeText,
        course_types: courseTypesSummary,
        strategic_plan_path: planSummaryText,
  strategic_plan_name: trimmedPlanName.value || null,
        strategic_objective_code: strategicObjectiveCode,
        strategic_strategy_code: strategicStrategyCode,
        strategic_tactic_code: strategicTacticCode,
        strategic_action_plan_code: strategicActionPlanCode,
        requested_by: requesterName,
        requested_by_level: currentUser.level || 0,
        department_short: departmentShort,
    section_code: sectionCode,
    learning_mode: course.learning_mode,
        participant_details: participantPayload
      }
      
      return fetch('http://localhost:4001/api/training-needs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      })
    })
    
    const responses = await Promise.all(promises)
    
    // ตรวจสอบว่าทุก request สำเร็จหรือไม่
    for (const response of responses) {
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'เกิดข้อผิดพลาดในการส่งข้อมูล')
      }
    }
    
    // สำเร็จ - กลับไปหน้าหลัก
    alert(`ส่งคำขอสำเร็จ ${selectedCourses.value.length} หลักสูตร`)
    await navigateTo('/')
    
  } catch (error) {
    console.error('Submit error:', error)
    alert('เกิดข้อผิดพลาด: ' + error.message)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const sessionValid = await authStore.validateToken({ keepStateOnError: true })

  if (!sessionValid || !authStore.isAuthenticated) {
    await navigateTo('/login?reason=expired')
    return
  }

  // โหลดระดับงาน
  try {
    const response = await fetch('http://localhost:4001/api/courses/job-levels', {
      credentials: 'include'
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    jobLevels.value = await response.json()
  } catch (error) {
    console.error('Error loading job levels:', error)
    jobLevels.value = []
  }

  await loadSubordinates()
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Clean up event listener
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(packageSearchTimeout)
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