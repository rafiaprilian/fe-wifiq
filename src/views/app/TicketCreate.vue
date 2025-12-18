<script setup>
import { onMounted, ref } from 'vue';
import { useTicketStore } from '@/stores/ticket';
import { storeToRefs } from 'pinia';
import feather from 'feather-icons';

const ticketStore = useTicketStore();
const { success, error, loading } = storeToRefs(ticketStore);
const { createTicket } = ticketStore;

// TODO: Create form ref with ticket fields
// Hint: You'll need title, description, priority, attachments
const form = ref({
    title: '',
    description: '',
    priority: '',
    attachments: []
})

// TODO: Implement handleSubmit function
// Hint: This should call createTicket function from ticket store
// and handle any errors
const handleSubmit = async () => {
    const formData = new FormData();
    
    // Add form fields
    formData.append('title', form.value.title);
    formData.append('description', form.value.description);
    formData.append('priority', form.value.priority);
    
    // Add attachments - backend expects 'attachments' not 'attachments[]'
    if (form.value.attachments && form.value.attachments.length > 0) {
        form.value.attachments.forEach((file) => {
            formData.append('attachments[]', file);
        });
    }

    await createTicket(formData);
}

const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length > 5) {
        alert('Maksimal 5 file yang dapat diupload');
        event.target.value = '';
        return;
    }
    
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
        alert('Maksimal ukuran file adalah 2MB');
        event.target.value = '';
        return;
    }
    
    form.value.attachments = files;
}

const removeAttachment = (index) => {
    form.value.attachments.splice(index, 1);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
        fileInput.value = '';
    }
}

// TODO: Implement onMounted hook
// Hint: Initialize feather icons
onMounted(async () => {
   feather.replace();
   // Reinitialize feather icons when attachments change
   const observer = new MutationObserver(() => {
        feather.replace();
   });
   observer.observe(document.querySelector('.space-y-4'), { 
       childList: true, 
       subtree: true 
   });
})
</script>

<template>
    <div class="mb-6">
        <RouterLink :to="{ name: 'app.dashboard' }"
            class="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <i data-feather="arrow-left" class="w-4 h-4 mr-2"></i>
            Kembali ke Daftar Tiket
        </RouterLink>
    </div>

    <!-- Create Ticket Form -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="p-6 border-b border-gray-100">
            <h1 class="text-2xl font-bold text-gray-800">Buat Tiket Baru</h1>
            <p class="text-sm text-gray-500 mt-1">Isi form di bawah ini untuk membuat tiket baru</p>
        </div>
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
            <!-- Judul Tiket -->
            <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-2">Judul Tiket</label>
                <input type="text" id="title" v-model="form.title" placeholder="Contoh: Gangguan Jaringan WiFi"
                    class="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <div v-if="error?.title" class="flex items-center mt-2">
                    <p class="text-xs text-red-500">{{ error.title[0] }}</p>
                </div>
            </div>

            <!-- Deskripsi -->
            <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">Deskripsi
                    Masalah</label>
                <textarea id="description" v-model="form.description" rows="6"
                    placeholder="Jelaskan masalah Anda secara detail. Sertakan informasi seperti:&#10;- Kapan masalah mulai terjadi&#10;- Apa yang sudah Anda coba&#10;- Dampak masalah terhadap pekerjaan"
                    class="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
                <div v-if="error?.description" class="flex items-center mt-2">
                    <p class="text-xs text-red-500">{{ error.description[0] }}</p>
                </div>
            </div>

            <!-- Prioritas -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
                <div class="grid grid-cols-3 gap-4">
                    <label class="relative flex cursor-pointer rounded-lg border"
                        :class="[form.priority === 'low' ? 'border-green-200 bg-green-50' : 'border-gray-200']">
                        <input type="radio" v-model="form.priority" value="low" class="sr-only">
                        <div class="flex w-full items-center justify-between p-4">
                            <div class="flex items-center">
                                <div class="text-sm">
                                    <p class="font-medium text-gray-900">Rendah</p>
                                    <p class="text-gray-500">Tidak mendesak</p>
                                </div>
                            </div>
                            <div class="shrink-0 text-green-600" v-show="form.priority === 'low'">
                                <i data-feather="check-circle" class="w-6 h-6"></i>
                            </div>
                        </div>
                    </label>
                    <label class="relative flex cursor-pointer rounded-lg border"
                        :class="[form.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200']">
                        <input type="radio" v-model="form.priority" value="medium" class="sr-only">
                        <div class="flex w-full items-center justify-between p-4">
                            <div class="flex items-center">
                                <div class="text-sm">
                                    <p class="font-medium text-gray-900">Sedang</p>
                                    <p class="text-gray-500">Normal</p>
                                </div>
                            </div>
                            <div class="shrink-0 text-yellow-600" v-show="form.priority === 'medium'">
                                <i data-feather="check-circle" class="w-6 h-6"></i>
                            </div>
                        </div>
                    </label>
                    <label class="relative flex cursor-pointer rounded-lg border"
                        :class="[form.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-gray-200']">
                        <input type="radio" v-model="form.priority" value="high" class="sr-only">
                        <div class="flex w-full items-center justify-between p-4">
                            <div class="flex items-center">
                                <div class="text-sm">
                                    <p class="font-medium text-gray-900">Tinggi</p>
                                    <p class="text-gray-500">Mendesak</p>
                                </div>
                            </div>
                            <div class="shrink-0 text-red-600" v-show="form.priority === 'high'">
                                <i data-feather="check-circle" class="w-6 h-6"></i>
                            </div>
                        </div>
                    </label>
                </div>
                <div v-if="error?.priority" class="flex items-center mt-2">
                    <p class="text-xs text-red-500">{{ error.priority[0] }}</p>
                </div>
            </div>

            <!-- Lampiran -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Lampiran (Opsional)</label>
                <div class="space-y-4">
                    <div class="flex items-center justify-center w-full">
                        <label for="attachments" 
                            class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                <i data-feather="upload-cloud" class="w-8 h-8 mb-3 text-gray-400"></i>
                                <p class="mb-2 text-sm text-gray-500">
                                    <span class="font-semibold">Klik untuk upload</span> atau drag and drop
                                </p>
                                <p class="text-xs text-gray-500">PNG, JPG, JPEG, GIF (MAX. 2MB per file, maksimal 5 file)</p>
                            </div>
                            <input id="attachments" type="file" class="hidden" 
                                accept="image/*" 
                                multiple 
                                @change="handleFileChange" />
                        </label>
                    </div>
                    
                    <!-- File Preview -->
                    <div v-if="form.attachments && form.attachments.length > 0" class="space-y-2">
                        <div v-for="(file, index) in form.attachments" :key="index" 
                            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div class="flex items-center space-x-3">
                                <i data-feather="file-text" class="w-4 h-4 text-gray-500"></i>
                                <div>
                                    <p class="text-sm font-medium text-gray-700">{{ file.name }}</p>
                                    <p class="text-xs text-gray-500">{{ (file.size / 1024 / 1024).toFixed(2) }} MB</p>
                                </div>
                            </div>
                            <button type="button" @click="removeAttachment(index)"
                                class="text-red-500 hover:text-red-700">
                                <i data-feather="x" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-if="error?.attachments" class="flex items-center mt-2">
                    <p class="text-xs text-red-500">{{ error.attachments[0] }}</p>
                </div>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-4">
                <RouterLink :to="{ name: 'app.dashboard' }"
                    class="px-6 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    Batal
                </RouterLink>
                <button type="submit" class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                    :disabled="loading">
                    <i data-feather="send" class="w-4 h-4 inline-block mr-2"></i>
                    {{ loading ? 'Mengirim...' : 'Kirim Tiket' }}
                </button>
            </div>
        </form>
    </div>
</template>