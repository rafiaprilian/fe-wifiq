import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import { handleError } from "@/helpers/errorHelper";
import router from "@/router";
import Cookies from "js-cookie";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    success: null,
  }),

  getters: {
    token: () => Cookies.get("token"),
    isAuthenticated: () => !!Cookies.get("token"),
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      try {
        const res = await axiosInstance.post("/login", credentials);
        Cookies.set("token", res.data.data.token);
        await this.checkAuth();
        if (this.user?.role === "admin") {
          router.push({ name: "admin.dashboard" });
        } else {
          router.push({ name: "app.dashboard" });
        }
      } finally {
        this.loading = false;
      }
      },
      
      async register(credentials) {
        this.loading = true
        this.error = null

        try {
            const response = await axiosInstance.post("/register", credentials)

            const token = response.data.data.token
            Cookies.set("token", token)

      
            await this.checkAuth()

            router.push({ name: "app.dashboard" })
        } catch (error) {
            this.error = handleError(error)
        } finally {
            this.loading = false
        }
        },


    async checkAuth() {
      try {
        const res = await axiosInstance.get("/me");
        this.user = res.data.data;
      } catch {
        Cookies.remove("token");
        this.user = null;
      }
    },

    async logout() {
      await axiosInstance.post("/logout");
      Cookies.remove("token");
      this.user = null;
      router.push({ name: "login" });
    },
  },
});
