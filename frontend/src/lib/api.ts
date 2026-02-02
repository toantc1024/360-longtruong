// api.js
import axios from "axios";
import type { AxiosInstance } from "axios";

interface ApiInstance extends AxiosInstance { }

let apiInstance: ApiInstance | null = null;

export const getApi = () => {
    if (!apiInstance) {
        apiInstance = axios.create({
            baseURL: import.meta.env.VITE_BACKEND_API_URL,
            timeout: 36000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        apiInstance.interceptors.response.use(
            (response) => response,
            (error) => {
                console.error("API Error:", error.response?.data || error.message);
                return Promise.reject(error);
            }
        );
    }

    return apiInstance;
};
