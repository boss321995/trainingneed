<template>
  <div class="bg-white shadow overflow-hidden sm:rounded-md">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quarter</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="item in items" :key="item.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.employee_name }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.course_title }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.course_type }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.quarter }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.participants }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.department }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  items: Array
})
</script>
