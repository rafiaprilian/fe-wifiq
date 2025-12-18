import { defineStore } from "pinia";
import { axiosInstance } from "@/plugins/axios";
import { handleError } from "@/helpers/errorHelper";

export const useDashboardStore = defineStore("dashboard", {
    state: () => ({
        statistic: null,
        loading: false,
        error: null,
        success: null,
    }),

    actions: {
        async fetchStatistics() {
            this.loading = true;
            
            try {
                const response = await axiosInstance.get("/dashboard/statistics")

                this.statistic = response.data.data
                
                // Ensure closed_tickets is available
                if (this.statistic && !this.statistic.closed_tickets && this.statistic.status_distribution) {
                    this.statistic.closed_tickets = this.statistic.status_distribution.closed || 0
                }
            } catch (error) {
                this.error = handleError(error)
            } finally {
                this.loading = false
            }
        }
    }
})