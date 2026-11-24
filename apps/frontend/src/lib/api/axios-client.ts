import { ApiErrorSchema } from "contracts/common/api-error.schema";
import axios, { AxiosError } from "axios";

import { ApiClientError } from "@/lib/api/api-client-error";
import { API_BASE_URL } from "@/lib/api/api-config";

export const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosClient.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
        const result = ApiErrorSchema.safeParse(
            error.response?.data,
        );

        const payload = result.success
            ? result.data.error
            : undefined;

        return Promise.reject(
            new ApiClientError(
                payload?.message ??
                    error.message ??
                    "An unexpected error occurred.",
                {
                    code: payload?.code,
                    status: error.response?.status ?? null,
                    details: payload?.details,
                    requestId: payload?.requestId,
                    data: error.response?.data,
                },
            ),
        );
    },
);
