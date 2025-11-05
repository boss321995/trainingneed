<template>
  <form @submit.prevent="$emit('submit', form)" class="space-y-6">
    <div>
      <label class="block text-sm font-medium text-gray-700">Course Type</label>
      <select
        v-model="form.course_type"
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Select course type</option>
        <option value="technical">Technical</option>
        <option value="soft_skills">Soft Skills</option>
        <option value="leadership">Leadership</option>
        <option value="compliance">Compliance</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Course Title</label>
      <input
        v-model="form.course_title"
        type="text"
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter course title"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Quarter</label>
      <select
        v-model="form.quarter"
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Select quarter</option>
        <option value="Q1">Q1 (Jan-Mar)</option>
        <option value="Q2">Q2 (Apr-Jun)</option>
        <option value="Q3">Q3 (Jul-Sep)</option>
        <option value="Q4">Q4 (Oct-Dec)</option>
      </select>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Number of Participants</label>
      <input
        v-model.number="form.participants"
        type="number"
        min="1"
        required
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Additional Information</label>
      <textarea
        v-model="form.free_text"
        rows="4"
        class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="Enter any additional information"
      ></textarea>
    </div>

    <div class="bg-gray-50 p-4 rounded-md">
      <h3 class="text-sm font-medium text-gray-700 mb-2">Employee Information</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span class="font-medium">Name:</span> {{ user?.name || 'N/A' }}
        </div>
        <div>
          <span class="font-medium">Department:</span> {{ user?.department || 'N/A' }}
        </div>
      </div>
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {{ loading ? 'Submitting...' : 'Submit Training Need' }}
      </button>
    </div>

    <div v-if="error" class="text-red-600 text-sm text-center">
      {{ error }}
    </div>
  </form>
</template>

<script setup>
const props = defineProps({
  loading: Boolean,
  error: String,
  user: Object
})

const emit = defineEmits(['submit'])

const form = reactive({
  course_type: '',
  course_title: '',
  quarter: '',
  participants: 1,
  free_text: ''
})
</script>
