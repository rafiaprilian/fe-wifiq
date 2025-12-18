<script setup>
import { onMounted, ref } from 'vue';
import { useTicketStore } from '@/stores/ticket';
import { storeToRefs } from 'pinia';
import { capitalize } from 'lodash';
import feather from 'feather-icons';
import { DateTime } from 'luxon';
import { useRoute } from 'vue-router';

const ticketStore = useTicketStore();
const { success, error, loading } = storeToRefs(ticketStore);
const { fetchTicket, createTicketReply } = ticketStore;

const route = useRoute();

// TODO: Create refs for ticket and form
// Hint: You'll need ticket object and form with content field
const ticket = ref({})
const form = ref({
    content: '',
})

// Modal state
const showAttachmentModal = ref(false)

const fetchTicketDetail = async () => {
    const response = await fetchTicket(route.params.code);

    ticket.value = response;
    form.value.status = response.status;
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

const handleSubmit = async () => {
    await createTicketReply(route.params.code, form.value);

    error.value = null;
    form.value.content = '';

    await fetchTicketDetail();
}


onMounted(async () => {
    await fetchTicketDetail();

    feather.replace();
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
    <!-- Back Button -->
    <div class="mb-6">
        <RouterLink :to="{ name: 'app.dashboard' }"
            class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <i data-feather="arrow-left" class="w-4 h-4 mr-2"></i>
            Kembali ke Daftar Tiket
        </RouterLink>
    </div>

    <!-- Ticket Info -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div class="p-6">
            <div class="flex items-start justify-between">
                <div>
                    <h1 class="text-2xl font-bold text-gray-800">{{ ticket.title || 'Tiket tanpa judul' }}</h1>
                    <div class="mt-2 flex items-center space-x-4">
                        <span class="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full">
                            {{ capitalize(ticket.status || 'unknown') }}
                        </span>
                        <span class="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-full">
                            {{ capitalize(ticket.priority || 'medium') }}
                        </span>
                        <span class="text-sm text-gray-500">#{{ ticket.code || 'N/A' }}</span>
                        <span class="text-sm text-gray-500">
                            Dibuat pada {{ ticket.created_at ? DateTime.fromISO(ticket.created_at).toFormat('dd MMMM yyyy, HH:mm') : 'N/A' }}
                        </span>
                    </div>
                </div>
                <button @click="showAttachmentModal = true" 
                    class="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                    :disabled="!ticket.attachments || ticket.attachments.length === 0">
                    <i data-feather="paperclip" class="w-4 h-4 inline-block mr-2"></i>
                    Lampiran ({{ ticket.attachments?.length || 0 }})
                </button>
            </div>
        </div>
    </div>

    <!-- Discussion Thread -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <!-- Thread Header -->
        <template v-if="ticket.ticket_replies && ticket.ticket_replies.length > 0">
            <div class="p-6 border-b border-gray-100" v-for="reply in ticket.ticket_replies" :key="reply.id">
                <div class="flex items-start space-x-4">
                    <img :src="`https://ui-avatars.com/api/?name=${reply.user?.name || 'User'}&background=0D8ABC&color=fff`" alt="User"
                        class="w-10 h-10 rounded-full">
                    <div class="flex-1">
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="text-sm font-medium text-gray-800">{{ reply.user?.name || 'Unknown User' }}</h4>
                                <p class="text-xs text-gray-500">
                                    {{ reply.created_at ? DateTime.fromISO(reply.created_at).toFormat('dd MMMM yyyy, HH:mm') : 'N/A' }}
                                </p>
                            </div>
                        </div>
                        <div class="mt-3 text-sm text-gray-800">
                            <p>{{ reply.content || 'Tidak ada konten' }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </template>
        
        <!-- No Replies Message -->
        <div v-else class="p-6 text-center text-gray-500">
            <p>Belum ada balasan untuk tiket ini.</p>
        </div>

        <!-- Reply Form -->
        <div class="p-6 border-t border-gray-100">
            <h4 class="text-sm font-medium text-gray-800 mb-4">Tambah Balasan</h4>
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div class="group">
                    <textarea v-model="form.content"
                        class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        :class="{ 'border-red-500 ring-red-500': error?.content }" rows="4"
                        placeholder="Tulis balasan Anda di sini..." minlength="10"></textarea>
                    <p class="mt-1 text-xs text-red-500" v-if="error?.content">
                        {{ error?.content?.join(', ') }}
                    </p>
                </div>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button
                            class="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                            <i data-feather="paperclip" class="w-4 h-4 inline-block mr-2"></i>
                            Lampiran
                        </button>
                    </div>
                    <button class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        <i data-feather="send" class="w-4 h-4 inline-block mr-2"></i>
                        <span v-if="!loading">Kirim Balasan</span>
                        <span v-else>Memproses...</span>
                    </button>
                </div>
            </form>
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