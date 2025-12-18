<script setup>
import { ref } from 'vue';
import {useAuthStore} from '@/stores/auth';

const authStore = useAuthStore()
const { logout } = authStore

const isOpen = ref(false)

const toggleSidebar = () => {
    isOpen.value = !isOpen.value
}

const handleLogout = async () => {
    await logout()
}

// Close sidebar when route changes (mobile)
const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768) {
        isOpen.value = false
    }
}
</script>

<template>
    <!-- Mobile sidebar overlay -->
    <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" @click="toggleSidebar"></div>
    
    <!-- Mobile Hamburger Button -->
    <button @click="toggleSidebar" 
        class="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md lg:hidden">
        <i data-feather="menu" class="w-6 h-6 text-gray-600"></i>
    </button>
    
    <!-- Sidebar -->
    <aside :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
        'lg:transform-none lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
    ]">
        <div class="p-6 border-b border-gray-100 flex items-center justify-between">
            <h1 class="text-2xl font-bold text-blue-600 flex items-center">
                <i data-feather="wifi" class="w-8 h-8 mr-2"></i>
                WiFi-Q
            </h1>
            <button @click="toggleSidebar" class="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <i data-feather="x" class="w-5 h-5 text-gray-600"></i>
            </button>
        </div>
        
        <!-- Mobile Navigation Header -->
        <div class="lg:hidden p-4 border-b border-gray-100">
            <div class="flex items-center bg-gray-50 px-3 py-2 rounded-full">
                <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="Profile"
                    class="w-6 h-6 rounded-full">
                <span class="ml-2 text-sm font-medium text-gray-700">Admin</span>
            </div>
        </div>
        
        <nav class="mt-6">
            <RouterLink @click="closeSidebarOnMobile" :to="{ name: 'admin.dashboard' }"
                class="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200"
                :class="{ 'bg-blue-50 border-l-4 border-blue-600': $route.name === 'admin.dashboard' }">
                <i data-feather="home" class="w-5 h-5 mr-3"></i>
                Dashboard
            </RouterLink>
            <RouterLink @click="closeSidebarOnMobile" :to="{ name: 'admin.ticket' }"
                class="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200"
                :class="{ 'bg-blue-50 border-l-4 border-blue-600': $route.name === 'admin.ticket' }">
                <i data-feather="tag" class="w-5 h-5 mr-3"></i>
                Tiket
            </RouterLink>
            <a @click="handleLogout"
                class="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-200 mt-6">
                <i data-feather="log-out" class="w-5 h-5 mr-3"></i>
                Logout
            </a>
        </nav>
    </aside>
</template>