<script setup>
import { onMounted, watch, onUnmounted, ref } from 'vue';
import { Chart } from 'chart.js/auto';
import {useDashboardStore} from '@/stores/dashboard';
import {useTicketStore} from '@/stores/ticket';
import { storeToRefs } from 'pinia';
import feather from 'feather-icons';
import { capitalize} from 'lodash';
import { DateTime } from 'luxon';


const dashboardStore = useDashboardStore()
const { statistic } = storeToRefs(dashboardStore)
const { fetchStatistics } = dashboardStore

const ticketStore = useTicketStore()
const { tickets } = storeToRefs(ticketStore)
const { fetchTickets } = ticketStore

const toggleTicketMenu = (ticket) => {
    ticket.showMenu = !ticket.showMenu
}

let chart = null
let refreshInterval = null
const isLoading = ref(false)

watch(statistic, () => {
    if (statistic.value && chart) {
        chart.data.datasets[0].data = [
            statistic.value.status_distribution?.open,
            statistic.value.status_distribution?.onprogress,
            statistic.value.status_distribution?.resolved,
            statistic.value.status_distribution?.rejected,
            statistic.value.status_distribution?.closed
        ]
        chart.update()
    }
}, { deep: true })

const refreshTickets = async () => {
    if (!isLoading.value) {
        isLoading.value = true
        try {
            await fetchTickets()
        } finally {
            isLoading.value = false
        }
    }
}

onMounted(async () => {
    feather.replace()

    await fetchStatistics()
    await fetchTickets()

    // Auto-refresh setiap 3 detik
    refreshInterval = setInterval(refreshTickets, 3000)

    const statusCtx = document.getElementById('statusChart').getContext('2d')

    if(document.getElementById('statusChart') && statistic.value) {
        chart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['open', 'onprogress', 'resolved', 'rejected', 'closed'],
                datasets: [{
                    label: 'Status Distribution',
                    data: [
                        statistic.value.status_distribution?.open,
                        statistic.value.status_distribution?.onprogress,
                        statistic.value.status_distribution?.resolved,
                        statistic.value.status_distribution?.rejected,
                        statistic.value.status_distribution?.closed
                    ],
                    backgroundColor: [
                        '#3B82F6', 
                        '#F59E0B',  
                        '#10B981', 
                        '#EF4444',
                        '#6B7280'   
                    ],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                },
                cutout: '70%'
            }
        })
    }
    feather.replace()
})

onUnmounted(() => {
    // Cleanup interval saat component di-unmount
    if (refreshInterval) {
        clearInterval(refreshInterval)
    }
})

</script>

<template>
    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="stat-card bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Total Tiket</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ statistic?.total_tickets }}</h3>
                </div>
                <div class="p-3 bg-blue-400 rounded-lg">
                    <i data-feather="tag" class="w-6 h-6 text-white"></i>
                </div>
            </div>
            <!-- <div class="mt-4 flex items-center text-sm">
                <span class="text-blue-500 flex items-center">
                    <i data-feather="trending-up" class="w-4 h-4 mr-1"></i>
                    12%
                </span>
                <span class="text-gray-500 ml-2">vs bulan lalu</span>
            </div> -->
        </div>

        <div class="stat-card bg-gradient-to-br from-yellow-50 to-white rounded-xl shadow-lg p-6 border border-yellow-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between">
            <div>
                <p class="text-sm font-medium text-gray-600">Tiket Aktif</p>
                <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ statistic?.active_tickets }}</h3>
            </div>
            <div class="p-3 bg-yellow-100 rounded-lg">
                <i data-feather="clock" class="w-6 h-6 text-yellow-600"></i>
            </div>
            </div>
            <!-- <div class="mt-4 flex items-center text-sm">
                <span class="text-red-500 flex items-center">
                    <i data-feather="trending-down" class="w-4 h-4 mr-1"></i>
                    3%
                </span>
                <span class="text-gray-500 ml-2">vs bulan lalu</span>
            </div> -->
        </div>

        <div class="stat-card bg-gradient-to-br from-green-50 to-white rounded-xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Selesai</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ statistic?.resolved_tickets }}</h3>
                </div>
                <div class="p-3 bg-green-100 rounded-lg">
                    <i data-feather="check-circle" class="w-6 h-6 text-green-600"></i>
                </div>
            </div>
            <!-- <div class="mt-4 flex items-center text-sm">
                <span class="text-green-500 flex items-center">
                    <i data-feather="trending-up" class="w-4 h-4 mr-1"></i>
                    8%
                </span>
                <span class="text-gray-500 ml-2">vs bulan lalu</span>
            </div> -->
        </div>

        <div class="stat-card bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Ditutup</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ statistic?.closed_tickets || statistic?.status_distribution?.closed || 0 }}</h3>
                </div>
                <div class="p-3 bg-gray-100 rounded-lg">
                    <i data-feather="archive" class="w-6 h-6 text-gray-600"></i>
                </div>
            </div>
            <!-- <div class="mt-4 flex items-center text-sm">
                <span class="text-green-500 flex items-center">
                    <i data-feather="trending-up" class="w-4 h-4 mr-1"></i>
                    5%
                </span>
                <span class="text-gray-500 ml-2">vs bulan lalu</span>
            </div> -->
        </div>

        <div class="stat-card bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Rata-rata Waktu</p>
                    <h3 class="text-2xl font-bold text-gray-800 mt-1">{{ statistic?.avg_resolution_time }} Jam</h3>
                </div>
                <div class="p-3 bg-purple-100 rounded-lg">
                    <i data-feather="clock" class="w-6 h-6 text-purple-600"></i>
                </div>
            </div>
            <!-- <div class="mt-4 flex items-center text-sm">
                <span class="text-green-500 flex items-center">
                    <i data-feather="trending-down" class="w-4 h-4 mr-1"></i>
                    15%
                </span>
                <span class="text-gray-500 ml-2">vs bulan lalu</span>
            </div> -->
        </div>
    </div>

    <!-- Charts and Recent Tickets -->
    <div class="grid grid-cols-12 gap-6">
        <!-- Recent Tickets -->
        <div class="col-span-8 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div class="p-6 border-b border-gray-100">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-800">Tiket Terbaru</h3>
                    <a href="#" class="text-sm text-blue-600 hover:text-blue-800 font-medium">Lihat
                        Semua</a>
                </div>
            </div>
            <div class="divide-y divide-gray-100">
                <!-- Ticket Item 1 -->
                 <div v-for="ticket in tickets" :key="ticket.code" class="p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-white transition-all duration-200 cursor-pointer">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-medium text-gray-800">{{ ticket.title || 'Tiket tanpa judul' }}</h4>
                            <p class="text-xs text-gray-500 mt-1">#{{ ticket.code || 'N/A' }}</p>
                            <div class="flex items-center mt-2 space-x-2">
                                <span class="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                                    {{ capitalize(ticket.status || 'unknown') }}
                                </span>
                                <span class="text-xs text-gray-500">
                                    {{ ticket.created_at ? DateTime.fromISO(ticket.created_at).toRelative() : 'N/A' }}
                                </span>
                            </div>
                        </div>
                        <div class="relative">
                            <button @click="toggleTicketMenu(ticket)" class="text-gray-400 hover:text-gray-600">
                                <i data-feather="more-vertical" class="w-5 h-5"></i>
                            </button>
                            <div v-show="ticket.showMenu"
                                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                                <a :href="`/ticket/${ticket.code}`"
                                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                    <i data-feather="eye" class="w-4 h-4 inline-block mr-2"></i>
                                    Lihat Detail
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Status Distribution Chart -->
        <div class="col-span-4 bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Distribusi Status</h3>
            <canvas id="statusChart" height="300"></canvas>
        </div>
    </div>
</template>