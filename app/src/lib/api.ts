/**
 * API Configuration and Global HTTP Request Handler
 * Centralizes all backend communication with error handling, auth, and type safety
 */

// API Base URL - configurable through environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Standard API Response structure
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

/**
 * HTTP Request Options
 */
export interface RequestOptions extends RequestInit {
  useAuth?: boolean;
  contentType?: string;
  timeout?: number;
}

/**
 * API Error class for structured error handling
 */
export class ApiError extends Error {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Get authentication token from storage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

/**
 * Store authentication token
 */
export const setAuthToken = (token: string, remember: boolean = false): void => {
  if (typeof window === 'undefined') return;
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

/**
 * Remove authentication token
 */
export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
};

/**
 * Global HTTP Request Handler
 * Handles all API requests with authentication, error handling, and timeout
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    useAuth = true,
    contentType = 'application/json',
    timeout = 30000,
    headers = {},
    ...fetchOptions
  } = options;

  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Build headers
  const requestHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  // Add Content-Type if not FormData
  if (contentType && !(fetchOptions.body instanceof FormData)) {
    requestHeaders['Content-Type'] = contentType;
  }

  // Add Authorization header if needed
  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-OK responses
    if (!response.ok) {
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        clearAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      throw new ApiError(
        data?.message || data?.error || `HTTP Error ${response.status}`,
        response.status,
        data
      );
    }

    return {
      data,
      status: response.status,
      message: data?.message,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408);
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new ApiError('Network error. Please check your connection.', 0);
    }

    // Re-throw ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown error
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      500
    );
  }
}

/**
 * Convenience methods for common HTTP methods
 */

export const api = {
  /**
   * GET request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * PUT request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  put: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * PATCH request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patch: <T = any>(endpoint: string, data?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /**
   * DELETE request
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Upload file(s) with progress tracking
 */
export async function uploadFile(
  endpoint: string,
  file: File | File[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additionalData?: Record<string, any>,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> {
  const formData = new FormData();

  if (Array.isArray(file)) {
    file.forEach((f, index) => {
      formData.append(`files[${index}]`, f);
    });
  } else {
    formData.append('file', file);
  }

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
  }

  // Use XMLHttpRequest for progress tracking
  if (onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ data, status: xhr.status });
          } catch {
            resolve({ data: xhr.responseText, status: xhr.status });
          }
        } else {
          reject(new ApiError(`Upload failed with status ${xhr.status}`, xhr.status));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new ApiError('Upload failed', 0));
      });

      xhr.open('POST', url);

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  }

  // Standard fetch for files without progress tracking
  return api.post(endpoint, formData, { contentType: '' });
}

/**
 * Query string builder utility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, String(v)));
      } else {
        query.append(key, String(value));
      }
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Example usage:
 * 
 * // Simple GET
 * const { data, error } = await api.get('/users');
 * 
 * // POST with data
 * const { data } = await api.post('/auth/login', { email, password });
 * 
 * // With query params
 * const params = buildQueryString({ page: 1, limit: 10, search: 'test' });
 * const { data } = await api.get(`/products${params}`);
 * 
 * // File upload with progress
 * await uploadFile('/upload', file, { category: 'images' }, (progress) => {
 *   console.log(`Upload progress: ${progress}%`);
 * });
 * 
 * // Without auth
 * const { data } = await api.get('/public/info', { useAuth: false });
 * 
 * // Custom timeout
 * const { data } = await api.get('/slow-endpoint', { timeout: 60000 });
 */
