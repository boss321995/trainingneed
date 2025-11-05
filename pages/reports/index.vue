<template>
  <ClientOnly>
    <OrgReportDashboard :show-back-button="true" />
    <template #fallback>
      <div class="max-w-7xl mx-auto py-8 px-4">
        <div class="flex justify-center items-center py-12 text-gray-500 text-sm">
          กำลังกำหนดค่ารายงาน...
        </div>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup>
import OrgReportDashboard from '~/components/reports/OrgReportDashboard.vue'

useHead({
  title: 'รายงานผลการขอจัดทำแผนฝึกอบรม - ระบบจัดการความต้องการฝึกอบรม'
})
</script>