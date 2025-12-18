import axios from 'axios'
import Cookies from 'js-cookie'

const token = Cookies.get('token')

// Dynamic base URL for development vs production
const getBaseURL = () => {
    // Development: Use localhost
   return import.meta.env.VITE_API_URL;
}

axios.defaults.baseURL = getBaseURL()
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'
axios.defaults.headers.common['Accept'] = 'application/json'
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Helper function to get full storage URL
axios.getStorageUrl = (path) => {
    return `${import.meta.env.VITE_STORAGE_URL}/${path}`;
}

axios.interceptors.request.use(
    config => {
        const token = Cookies.get('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
)


export const axiosInstance = axios
