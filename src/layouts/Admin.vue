<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/admin/Sidebar.vue'

const isMobile = ref(false)
const showMobileProfile = ref(false)

const checkMobile = () => {
    isMobile.value = window.innerWidth < 1024
}

const toggleMobileProfile = () => {
    showMobileProfile.value = !showMobileProfile.value
}

onMounted(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
})
</script>

<template>
    <div class="flex h-screen">
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Content -->
        <main class="flex-1 overflow-x-hidden overflow-y-auto lg:ml-0">
            <!-- Topbar -->
            <div class="bg-white shadow-sm sticky top-0 z-30">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center space-x-4">
                        <!-- Mobile spacer for hamburger menu -->
                        <div class="lg:hidden w-12"></div>
                        <h2 class="text-xl font-semibold text-gray-800">{{ $route.meta.title }}</h2>
                    </div>
                    
                    <!-- Desktop Profile -->
                    <div class="hidden lg:flex items-center space-x-4">
                        <div class="flex items-center bg-gray-50 px-4 py-2 rounded-full">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Profile"
                                class="w-8 h-8 rounded-full">
                            <span class="ml-2 text-sm font-medium text-gray-700">Admin</span>
                        </div>
                    </div>
                    
                    <!-- Mobile Profile Button -->
                    <div class="lg:hidden relative">
                        <button @click="toggleMobileProfile" class="p-2 hover:bg-gray-100 rounded-full">
                            <i data-feather="user" class="w-5 h-5 text-gray-600"></i>
                        </button>
                        
                        <!-- Mobile Profile Dropdown -->
                        <div v-if="showMobileProfile" 
                            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-40">
                            <div class="px-4 py-2 border-b border-gray-100">
                                <div class="flex items-center">
                                    <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Profile"
                                        class="w-8 h-8 rounded-full">
                                    <div class="ml-3">
                                        <p class="text-sm font-medium text-gray-800">Admin</p>
                                        <p class="text-xs text-gray-500">Administrator</p>
                                    </div>
                                </div>
                            </div>
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                Profil
                            </a>
                            <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                Pengaturan
                            </a>
                            <div class="border-t border-gray-100 my-1"></div>
                            <a href="#" class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                                Keluar
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="p-4 lg:p-6 space-y-6">
                <router-view></router-view>
            </div>
        </main>
    </div>
</template>