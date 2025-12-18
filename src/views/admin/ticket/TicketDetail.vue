<script setup>
import { onMounted, ref } from 'vue';
import { useTicketStore } from '@/stores/ticket';
import { storeToRefs } from 'pinia';
import { capitalize } from 'lodash';
import feather from 'feather-icons';
import { DateTime } from 'luxon';
import { useRoute } from 'vue-router';

const route = useRoute()

const ticket = ref({})
const form = ref({
    status: '',
    content: '',
})

const showAttachmentModal = ref(false)

const ticketStore = useTicketStore()
const { success, error, loading } = storeToRefs(ticketStore)
const { fetchTicket, createTicketReply, updateTicketStatus, deleteTicket } = ticketStore

const fetchTicketDetail = async () => {
    const response = await fetchTicket(route.params.code)

    ticket.value = response
    form.value.status = response.status
}



const handleSubmit = async () => {
    await createTicketReply(route.params.code, form.value)

    error.value = null;
    form.value.content = '';

    await fetchTicketDetail()
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileExtension = (filename) => {
    return filename.split('.').pop().toUpperCase()
}

const openImageInNewTab = (url) => {
    window.open(url, '_blank')
}

const getImageUrl = (url) => {
    // If URL is relative, convert to full URL
    if (url && !url.startsWith('http')) {
        return `http://localhost:8000${url}`
    }
    return url
}

const handleImageError = (event) => {
    // Fallback if image fails to load
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y5ZmFmYSIvPgogIDx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjE3MjgzIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZSBOb3QgRm91bmQ8L3RleHQ+Cjwvc3ZnPg=='
}

// TODO: Implement onMounted hook
// Hint: Fetch initial ticket details and initialize feather icons
onMounted(async () => {
    await fetchTicketDetail()

    feather.replace()
})

// Watch for modal changes and reinitialize feather icons
import { nextTick, watch } from 'vue'

watch(showAttachmentModal, () => {
    nextTick(() => {
        feather.replace()
    })
})
</script>

<template>
    <div class="p-6">
        <!-- Back Button -->
        <div class="mb-6">
            <RouterLink :to="{ name: 'admin.ticket' }"
                class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
                <i data-feather="arrow-left" class="w-4 h-4 mr-2"></i>
                Kembali ke Daftar Tiket
            </RouterLink>
        </div>

        <!-- Ticket Info -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800">{{ ticket.title }}</h3>
                        <div class="mt-4 flex items-center space-x-4">
                            <span class="px-3 py-1 text-sm  rounded-lg" :class="{
                                'text-blue-700 bg-blue-100': ticket.status === 'open',
                                'text-yellow-700 bg-yellow-100': ticket.status === 'onprogress',
                                'text-green-700 bg-green-100': ticket.status === 'resolved',
                                'text-red-700 bg-red-100': ticket.status === 'rejected',
                                'text-gray-700 bg-gray-100': ticket.status === 'closed'
                            }">
                                {{ capitalize(ticket.status) }}
                            </span>

                            <span class="px-3 py-1 text-sm rounded-lg" :class="{
                                'text-red-700 bg-red-100': ticket.priority === 'high',
                                'text-yellow-700 bg-yellow-100': ticket.priority === 'medium',
                                'text-green-700 bg-green-100': ticket.priority === 'low'
                            }">
                                {{ capitalize(ticket.priority) }}
                            </span>

                            <span class="text-sm text-gray-500">Dilaporkan oleh {{ ticket.user?.name }}</span>
                        </div>
                    </div>
                    <div class="flex items-center justify-end space-x-4">
                        <button @click="showAttachmentModal = true"
                            class="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                            :disabled="!ticket.attachments || ticket.attachments.length === 0">
                            <i data-feather="paperclip" class="w-4 h-4 inline-block mr-2"></i>
                            Lampiran ({{ ticket.attachments?.length || 0 }})
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Discussion Thread -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100">
            <div v-for="reply in ticket.ticket_replies" class="p-6 border-b border-gray-100"
                v-if="ticket.ticket_replies?.length > 0">
                <div class="flex items-start space-x-4">
                    <img :src="`https://ui-avatars.com/api/?name=${reply.user.name}&background=0D8ABC&color=fff`"
                        :alt="reply.user.name" class="w-10 h-10 rounded-full">
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-sm font-medium text-gray-800">{{ reply.user.name }}</h4>
                                <p class="text-xs text-gray-500">
                                    {{ DateTime.fromISO(reply.created_at).toFormat('dd MMMM yyyy, HH:mm') }}
                                </p>
                            </div>
                        </div>
                        <div class="mt-3 text-sm text-gray-800">
                            <p>{{ reply.content }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else>
                <div class="p-6">
                    <p class="text-sm text-gray-500">Belum ada tanggapan</p>
                </div>
            </div>

            <div class="p-6 border-t border-gray-100">
                <h4 class="text-sm font-medium text-gray-800 mb-4">Tambah Jawaban</h4>
                <form @submit.prevent="handleSubmit" class="space-y-4">
                    <div class="grid grid-cols-1 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Status Tiket</label>
                            <select v-model="form.status"
                                class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                                <option value="open" class="text-blue-700">Open</option>
                                <option value="onprogress" class="text-yellow-700">On Progress</option>
                                <option value="resolved" class="text-green-700">Resolved</option>
                                <option value="rejected" class="text-red-700">Rejected</option>
                                <option value="closed" class="text-gray-700">Closed</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <textarea v-model="form.content"
                            class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            :class="{'border-red-500 ring-red-500': error?.content }" rows="4" placeholder="Tulis jawaban Anda di sini..."></textarea>
                            <p class=" mt-1 text-xs text-red-500 " v-if="error?.content">
                                {{ error?.content?.join(', ') }}
                            </p>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            
                        </div>
                        <button type="submit"
                            class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            <i data-feather="send" class="w-4 h-4 inline-block mr-2"></i>
                            <span v-if="!loading">
                                Kirim Jawaban
                            </span>
                            <span v-else>
                                Mengirim...
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Attachments Modal -->
    <div v-if="showAttachmentModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity" @click="showAttachmentModal = false">
                <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">
                            Lampiran Tiket
                        </h3>
                        <button @click="showAttachmentModal = false" class="text-gray-400 hover:text-gray-600">
                            <i data-feather="x" class="w-6 h-6"></i>
                        </button>
                    </div>

                    <div v-if="ticket.attachments && ticket.attachments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div v-for="attachment in ticket.attachments" :key="attachment.id" 
                            class="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <!-- Image Preview -->
                            <div v-if="attachment.mime_type && attachment.mime_type.startsWith('image/')" 
                                class="aspect-square bg-gray-100 relative">
                                <img :src="getImageUrl(attachment.url)" 
                                    :alt="attachment.filename" 
                                    class="w-full h-full object-cover cursor-pointer"
                                    @click="openImageInNewTab(getImageUrl(attachment.url))"
                                    @error="handleImageError">
                                
                                <!-- Image Overlay -->
                                <div class="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                    <i data-feather="maximize-2" class="w-8 h-8 text-white opacity-0 hover:opacity-100"></i>
                                </div>
                            </div>
                            
                            <!-- File Icon for non-images -->
                            <div v-else class="aspect-square bg-gray-100 flex items-center justify-center">
                                <div class="text-center">
                                    <i data-feather="file-text" class="w-12 h-12 text-gray-400 mx-auto mb-2"></i>
                                    <p class="text-xs text-gray-500">{{ getFileExtension(attachment.filename) }}</p>
                                </div>
                            </div>
                            
                            <!-- File Info -->
                            <div class="p-3">
                                <h4 class="text-sm font-medium text-gray-800 truncate" :title="attachment.filename">
                                    {{ attachment.filename }}
                                </h4>
                                <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(attachment.size) }}</p>
                                
                                <div class="mt-3 flex items-center space-x-2">
                                    <a :href="getImageUrl(attachment.url)" 
                                        download 
                                        class="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded text-blue-600 bg-transparent hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                        <i data-feather="download" class="w-3 h-3 mr-1"></i>
                                        Download
                                    </a>
                                    <button v-if="attachment.mime_type && attachment.mime_type.startsWith('image/')"
                                        @click="openImageInNewTab(getImageUrl(attachment.url))"
                                        class="flex-1 inline-flex items-center justify-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                        <i data-feather="external-link" class="w-3 h-3 mr-1"></i>
                                        Buka
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- No Attachments Message -->
                    <div v-else class="text-center py-8">
                        <i data-feather="paperclip" class="w-12 h-12 text-gray-400 mx-auto mb-3"></i>
                        <p class="text-gray-500">Tidak ada lampiran untuk tiket ini</p>
                    </div>
                </div>

                <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button @click="showAttachmentModal = false"
                        class="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm">
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    </div>


</template>