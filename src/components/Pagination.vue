<script setup>
import { computed } from 'vue'
import feather from 'feather-icons'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  perPage: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['page-changed', 'per-page-changed'])

// Computed properties
const showingFrom = computed(() => {
  return props.total === 0 ? 0 : ((props.currentPage - 1) * props.perPage) + 1
})

const showingTo = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.total)
})

const pages = computed(() => {
  const pages = []
  const maxVisiblePages = 5
  
  if (props.totalPages <= maxVisiblePages) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i)
    }
  } else {
    const half = Math.floor(maxVisiblePages / 2)
    let start = Math.max(1, props.currentPage - half)
    let end = Math.min(props.totalPages, start + maxVisiblePages - 1)
    
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }
  
  return pages
})

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-changed', page)
  }
}

const goToFirstPage = () => goToPage(1)

const goToLastPage = () => goToPage(props.totalPages)

const goToPreviousPage = () => goToPage(props.currentPage - 1)

const goToNextPage = () => goToPage(props.currentPage + 1)

const changePerPage = (newPerPage) => {
  emit('per-page-changed', newPerPage)
}

// Initialize feather icons
import { onMounted, nextTick } from 'vue'

onMounted(() => {
  nextTick(() => {
    feather.replace()
  })
})
</script>

<template>
  <div class="flex flex-col lg:flex-row items-center justify-between gap-4 p-4">
    <!-- Mobile layout: showing info and per page selector -->
    <div class="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
      <!-- Showing info -->
      <div class="text-sm text-gray-600 order-2 sm:order-1">
        <span class="hidden sm:inline">Menampilkan</span>
        <span class="font-semibold text-gray-800 mx-1">{{ showingFrom }}-{{ showingTo }}</span>
        <span class="hidden sm:inline">dari</span>
        <span class="font-semibold text-gray-800 mx-1">{{ total }}</span>
        <span class="hidden sm:inline">data</span>
      </div>

      <!-- Per page selector -->
      <div class="order-1 sm:order-2 w-full sm:w-auto">
        <select 
          @change="changePerPage(Number($event.target.value))"
          class="block w-full sm:w-auto px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
          <option :value="5" :selected="perPage === 5">5</option>
          <option :value="10" :selected="perPage === 10">10</option>
          <option :value="25" :selected="perPage === 25">25</option>
          <option :value="50" :selected="perPage === 50">50</option>
        </select>
      </div>
    </div>

    <!-- Pagination buttons -->
    <div class="flex items-center">
      <!-- First page -->
      <button
        @click="goToFirstPage"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center px-2 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg disabled:text-gray-400 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
        <i data-feather="chevrons-left" class="h-4 w-4"></i>
      </button>

      <!-- Previous page -->
      <button
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        class="relative inline-flex items-center px-2 py-1.5 mx-1 text-sm text-teal-600 hover:bg-teal-50 rounded-lg disabled:text-gray-400 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
        <i data-feather="chevron-left" class="h-4 w-4"></i>
      </button>

      <!-- Page numbers -->
      <template v-for="page in pages" :key="page">
        <!-- Active page -->
        <button
          v-if="page === currentPage"
          class="relative inline-flex items-center px-3 py-1.5 text-sm font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg transform scale-105">
          {{ page }}
        </button>
        <!-- Inactive page -->
        <button
          v-else
          @click="goToPage(page)"
          class="relative inline-flex items-center px-2 py-1.5 text-sm text-teal-700 hover:bg-gradient-to-r hover:from-teal-100 hover:to-cyan-100 rounded-lg transition-all duration-200">
          {{ page }}
        </button>
      </template>

      <!-- Next page -->
      <button
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        class="relative inline-flex items-center px-2 py-1.5 mx-1 text-sm text-teal-600 hover:bg-teal-50 rounded-lg disabled:text-gray-400 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
        <i data-feather="chevron-right" class="h-4 w-4"></i>
      </button>

      <!-- Last page -->
      <button
        @click="goToLastPage"
        :disabled="currentPage === totalPages"
        class="relative inline-flex items-center px-2 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg disabled:text-gray-400 disabled:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
        <i data-feather="chevrons-right" class="h-4 w-4"></i>
      </button>
    </div>
  </div>
</template>