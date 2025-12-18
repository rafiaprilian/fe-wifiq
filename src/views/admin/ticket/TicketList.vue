<script setup>
import { onMounted, ref, watch } from 'vue';
import { useTicketStore } from '@/stores/ticket';
import { storeToRefs } from 'pinia';
import { capitalize, debounce } from 'lodash';
import feather from 'feather-icons';
import { DateTime } from 'luxon';
import Pagination from '@/components/Pagination.vue';

const ticketStore = useTicketStore()
const { tickets, success, error, loading, pagination } = storeToRefs(ticketStore)
const { fetchTickets, deleteTicket } = ticketStore

const showDeleteModal = ref(false)
const ticketToDelete = ref(null)
// TODO: Create filters ref with search fields
// Hint: You'll need search, status, priority, and date
const filters = ref({
    search: '',
    status: '',
    priority: '',
    date: '',
    page: 1,
    per_page: 10
})

// TODO: Implement watch effect on filters
// Hint: Use debounce and call fetchTickets with updated filters
watch(filters, debounce(async () => {
    await fetchTickets(filters.value)
}, 300), { deep: true })

const confirmDelete = (ticket) => {
    ticketToDelete.value = ticket
    showDeleteModal.value = true
}

const handleDelete = async () => {
    if (ticketToDelete.value) {
        await deleteTicket(ticketToDelete.value.code)
        showDeleteModal.value = false
        ticketToDelete.value = null
        await fetchTickets()
        setTimeout(() => {
            success.value = null
        }, 3000)
    }
}

const closeDeleteModal = () => {
    showDeleteModal.value = false
    ticketToDelete.value = null
}

const updateStatus = async (code, newStatus) => {
    try {
        await ticketStore.updateTicketStatusPut(code, { status: newStatus })
        await fetchTickets()
        setTimeout(() => {
            success.value = null
        }, 3000)
    } catch (error) {
        console.error('Error updating status:', error)
        // Refresh data to restore original status
        await fetchTickets()
    }
}

const handlePageChange = async (page) => {
    filters.value.page = page
}

const handlePerPageChange = async (perPage) => {
    filters.value.per_page = perPage
    filters.value.page = 1 // Reset to first page when changing per page
}

// TODO: Implement onMounted hook
// Hint: Fetch initial tickets and initialize feather icons
onMounted(async () => {
    await fetchTickets()

    feather.replace()
})

// Watch for changes and reinitialize feather icons
import { nextTick } from 'vue'
const reinitializeIcons = () => {
    nextTick(() => {
        feather.replace()
    })
}

watch([showDeleteModal, success, error], () => {
    reinitializeIcons()
})

</script>

<template>
    <div class="p-6">
        <!-- Filters and Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <!-- Search -->
                    <div class="relative">
                        <input type="text" v-model="filters.search" placeholder="Cari tiket..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <i data-feather="search" class="w-4 h-4 text-gray-400 absolute left-3 top-2.5"></i>
                    </div>
                    <!-- Status Filter -->
                    <select v-model="filters.status"
                        class="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="">Semua Status</option>
                        <option value="open">Open</option>
                        <option value="onprogress">On Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <!-- Priority Filter -->
                    <select v-model="filters.priority"
                        class="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="">Semua Prioritas</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                    <!-- Date Filter -->
                    <select
                        class="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <option value="">Semua Tanggal</option>
                        <option value="today">Hari Ini</option>
                        <option value="week">Minggu Ini</option>
                        <option value="month">Bulan Ini</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Tickets Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID Tiket</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Judul</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pelapor</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ubah Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prioritas</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tanggal</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-100">
                        <tr v-for="ticket in tickets" :key="ticket.code" class="hover:bg-gray-50">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                #{{ ticket.code }}</td>
                            <td class="px-6 py-4">
                                <div class="text-sm text-gray-800">{{ ticket.title }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <img :src="`https://ui-avatars.com/api/?name=${ticket.user.name}&background=0D8ABC&color=fff`"
                                        :alt="ticket.user.name" class="w-6 h-6 rounded-full">
                                    <span class="ml-2 text-sm text-gray-800">{{ ticket.user.name }}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-3 py-1 text-xs font-medium rounded-full" :class="{
                                    'text-blue-700 bg-blue-100': ticket.status === 'open',
                                    'text-yellow-700 bg-yellow-100': ticket.status === 'onprogress',
    'text-green-700 bg-green-100': ticket.status === 'resolved',
                                    'text-gray-700 bg-gray-100': ticket.status === 'closed',
                                    'text-red-700 bg-red-100': ticket.status === 'rejected'
                                }">
                                    {{ capitalize(ticket.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center space-x-2">
                                    <select @change="updateStatus(ticket.code, $event.target.value)" 
                                        :value="ticket.status"
                                        class="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                        <option value="open">Open</option>
                                        <option value="onprogress">On Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-3 py-1 text-xs font-medium rounded-full" :class="{
                                    'text-red-700 bg-red-100': ticket.priority === 'high',
                                    'text-yellow-700 bg-yellow-100': ticket.priority === 'medium',
                                    'text-green-700 bg-green-100': ticket.priority === 'low'
                                }">
                                    {{ capitalize(ticket.priority) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {{ DateTime.fromISO(ticket.created_at).toFormat('dd MMMM yyyy HH:mm') }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm">
                                <div class="flex items-center space-x-2">
                                    <RouterLink :to="{ name: 'admin.ticket.detail', params: { code: ticket.code } }"
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <i data-feather="message-square" class="w-4 h-4 mr-2"></i>
                                        Jawab
                                    </RouterLink>
                                    <button @click="confirmDelete(ticket)"
                                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                                        <i data-feather="trash-2" class="w-4 h-4 mr-2"></i>
                                        Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" @click="closeDeleteModal">
                    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div class="sm:flex sm:items-start">
                            <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <i data-feather="alert-triangle" class="w-6 h-6 text-red-600"></i>
                            </div>
                            <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 class="text-lg leading-6 font-medium text-gray-900">
                                    Hapus Tiket
                                </h3>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-500">
                                        Apakah Anda yakin ingin menghapus tiket <span class="font-semibold">#{{ ticketToDelete?.code }}</span>? Tindakan ini tidak dapat dibatalkan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="handleDelete" :disabled="loading"
                            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50">
                            <span v-if="loading">Menghapus...</span>
                            <span v-else>Hapus</span>
                        </button>
                        <button @click="closeDeleteModal"
                            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                            Batal
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Alert -->
        <div v-if="success" class="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <div class="flex items-center">
                <i data-feather="check-circle" class="w-5 h-5 mr-2"></i>
                <span>{{ success }}</span>
            </div>
            <button @click="success = null" class="ml-4">
                <i data-feather="x" class="w-4 h-4 text-green-600"></i>
            </button>
        </div>

        <!-- Error Alert -->
        <div v-if="error" class="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
            <div class="flex items-center">
                <i data-feather="alert-circle" class="w-5 h-5 mr-2"></i>
                <span>{{ error }}</span>
            </div>
            <button @click="error = null" class="ml-4">
                <i data-feather="x" class="w-4 h-4 text-red-600"></i>
            </button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > 0" class="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
            <Pagination 
                :current-page="pagination.current_page"
                :total-pages="pagination.last_page"
                :per-page="pagination.per_page"
                :total="pagination.total"
                @page-changed="handlePageChange"
                @per-page-changed="handlePerPageChange" />
        </div>
    </div>
</template>