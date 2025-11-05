<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900">Total Requests</h3>
      <p class="text-3xl font-bold text-indigo-600">{{ summary.total }}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900">This Quarter</h3>
      <p class="text-3xl font-bold text-green-600">{{ summary.thisQuarter }}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900">Top Course</h3>
      <p class="text-lg font-bold text-blue-600">{{ summary.topCourse }}</p>
    </div>
    <div class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-medium text-gray-900">Avg Participants</h3>
      <p class="text-3xl font-bold text-purple-600">{{ summary.avgParticipants }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  summary: Object
})
</script>
