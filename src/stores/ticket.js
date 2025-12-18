import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import { handleError } from "@/helpers/errorHelper";
import router from "@/router";

export const useTicketStore = defineStore("ticket", {
  state: () => ({
    tickets: [],
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
      from: null,
      to: null,
    },
    loading: false,
    error: null,
    success: null,
  }),

  actions: {
    async fetchTickets(params) {
        this.loading = true;
        try {
            const response = await axiosInstance.get("/ticket", { params })
            
            this.tickets = response.data.data
            this.pagination = response.data.meta || this.pagination
        } catch (error) {
            this.error = handleError(error)
        } finally {
            this.loading = false
        }
    },

    async fetchTicket(code) {
      this.loading = true;
      try {
        const response = await axiosInstance.get(`/ticket/${code}`)

        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async createTicket(payload) {
      this.loading = true;
      
      try {
        const response = await axiosInstance.post("/ticket", payload)

        this.success = response.data.message
        
        router.push({ name: 'app.dashboard' })
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async createTicketReply(code, payload) {
      this.loading = true;
      try {
        const response = await axiosInstance.post(`/ticket-reply/${code}`, payload)

        this.success = response.data.message
        
        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async updateTicketStatus(code, payload) {
      this.loading = true;
      try {
        const response = await axiosInstance.post(`/ticket/${code}/status`, payload)

        this.success = response.data.message
        
        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async updateTicketStatusPut(code, payload) {
      this.loading = true;
      try {
        const response = await axiosInstance.put(`/ticket/${code}/status`, payload)

        this.success = response.data.message
        
        return response.data.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },

    async deleteTicket(code) {
      this.loading = true;
      try {
        const response = await axiosInstance.delete(`/ticket/${code}`)

        this.success = response.data.message
        
        return response.data
      } catch (error) {
        this.error = handleError(error)
      } finally {
        this.loading = false
      }
    },
  },
});
