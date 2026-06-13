import { useAuthStore } from "../stores/auth-store";
import type { ApiError } from "../types/api";

const BASE_URL = import.meta.env.VITE_API_URL || "";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

  private createHeaders(_includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    return headers;
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "GET",
      headers: this.createHeaders(includeAuth),
      credentials: "include",
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.createHeaders(includeAuth),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.createHeaders(includeAuth),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    includeAuth: boolean = true,
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.createHeaders(includeAuth),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.createHeaders(includeAuth),
      credentials: "include",
    });
    return this.handleResponse<T>(response);
  }

  async postForm<T>(
    endpoint: string,
    formData: FormData,
    _includeAuth: boolean = true,
  ): Promise<T> {
    const headers: HeadersInit = {};

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });
    return this.handleResponse<T>(response);
  }

  async upload<T>(
    endpoint: string,
    file: File,
    fieldName: string = "file",
    _includeAuth: boolean = true,
  ): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const headers: HeadersInit = {};

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });
    return this.handleResponse<T>(response);
  }
}

export const api = new ApiClient(BASE_URL);
export { ApiClient };
