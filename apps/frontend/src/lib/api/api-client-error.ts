import type { ApiError } from "contracts/common/api-error.schema";

type ErrorPayload = ApiError["error"];

interface ApiClientErrorOptions {
    code?: string;
    status: number | null;
    details?: ErrorPayload["details"];
    requestId?: string;
    data?: unknown;
};

export class ApiClientError extends Error {
    readonly code?: string;
    readonly status: number | null;
    readonly details?: ErrorPayload["details"];
    readonly requestId?: string;
    readonly data?: unknown;

    constructor(message: string, options:ApiClientErrorOptions) {
        super(message);

        this.name = "ApiClientError";
        this.code = options.code;
        this.status = options.status;
        this.details = options.details;
        this.requestId = options.requestId;
        this.data = options.data;
    }

};

export const isApiClientError = (error: unknown): error is ApiClientError => error instanceof ApiClientError;
