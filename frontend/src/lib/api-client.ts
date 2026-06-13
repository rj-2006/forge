import { useAuthStore } from "../stores/auth-store";
import type { ApiError } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "";

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async executeRefresh(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Refresh failed");
      }

      const data = await response.json();
      const newToken = data.token;
      if (!newToken) {
        throw new Error("No token returned");
      }

      // Update the auth store with the new token
      useAuthStore.getState().login(data.user, newToken);
      return newToken;
    } catch (error) {
      useAuthStore.getState().logout();
      throw error;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async getFreshToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }
    this.refreshPromise = this.executeRefresh();
    return this.refreshPromise;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: "An unexpected error occurred",
        status: response.status,
      };

      try {
        const data = await response.json();
        error.message = data.message || data.error || error.message;
        error.code = data.code;
      } catch {
        if (response.status === 401) {
          error.message = "Unauthorized. Please log in again.";
        } else if (response.status === 403) {
          error.message = "You do not have permission to perform this action.";
        } else if (response.status === 404) {
          error.message = "Resource not found.";
        } else if (response.status >= 500) {
          error.message = "Server error. Please try again later.";
        }
      }

      if (response.status === 401) {
        useAuthStore.getState().logout();
      }

      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }
    return response.text() as Promise<T>;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit,
    includeAuth: boolean = true,
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (includeAuth) {
      const token = useAuthStore.getState().token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
    options.headers = headers;

    let response = await fetch(`${this.baseUrl}${endpoint}`, options);

    if (response.status === 401 && includeAuth && !endpoint.includes("/api/auth/refresh")) {
      try {
        const newToken = await this.getFreshToken();
        const retryHeaders = new Headers(options.headers);
        retryHeaders.set("Authorization", `Bearer ${newToken}`);
        const retryOptions = { ...options, headers: retryHeaders };
        response = await fetch(`${this.baseUrl}${endpoint}`, retryOptions);
      } catch (refreshError) {
        throw refreshError;
      }
    }

    return this.handleResponse<T>(response);
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "GET",
        credentials: "include",
      },
      includeAuth,
    );
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        credentials: "include",
        body: data ? JSON.stringify(data) : undefined,
        headers: {
          "Content-Type": "application/json",
        },
      },
      includeAuth,
    );
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        credentials: "include",
        body: data ? JSON.stringify(data) : undefined,
        headers: {
          "Content-Type": "application/json",
        },
      },
      includeAuth,
    );
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        credentials: "include",
        body: data ? JSON.stringify(data) : undefined,
        headers: {
          "Content-Type": "application/json",
        },
      },
      includeAuth,
    );
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "DELETE",
        credentials: "include",
      },
      includeAuth,
    );
  }

  async postForm<T>(
    endpoint: string,
    formData: FormData,
    includeAuth: boolean = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
      includeAuth,
    );
  }

  async upload<T>(
    endpoint: string,
    file: File,
    fieldName: string = "file",
    includeAuth: boolean = true,
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.request<T>(
      endpoint,
      {
        method: "POST",
        credentials: "include",
        body: formData,
      },
      includeAuth,
    );
  }
}

export const api = new ApiClient(BASE_URL);
export { ApiClient };
