
import { toast } from "@/components/ui/sonner";

const API_BASE_URL = 'http://127.0.0.1:8000'; // Updated to specified local URL

type ApiOptions = {
  method: string;
  headers?: Record<string, string>;
  body?: FormData | string;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('brd_auth_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('brd_auth_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('brd_auth_token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const api = async <T>(
  endpoint: string, 
  options: Omit<ApiOptions, 'headers'> & { headers?: Record<string, string> } = { method: 'GET' }
): Promise<T> => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      clearAuthToken();
      toast.error("Session expired. Please log in again");
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Safely extract error message, avoiding passing objects directly
      const errorMessage = typeof errorData.detail === 'string' 
        ? errorData.detail 
        : 'Something went wrong';
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Check if the response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json() as T;
    } else {
      return await response.text() as unknown as T;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Error: ${error.message}`);
      if (error.message !== 'Unauthorized') { // Avoid duplicate error message
        // Ensure we're only passing strings to toast
        const errorMsg = typeof error.message === 'string' ? error.message : 'Request failed';
        toast.error(errorMsg);
      }
    } else {
      // Handle non-Error objects
      toast.error('An unexpected error occurred');
      console.error('Unexpected error:', error);
    }
    throw error;
  }
};

export const apiGet = <T>(endpoint: string): Promise<T> => {
  return api<T>(endpoint);
};

export const apiPost = <T>(endpoint: string, data: unknown): Promise<T> => {
  return api<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const apiUpload = <T>(endpoint: string, formData: FormData): Promise<T> => {
  return api<T>(endpoint, {
    method: 'POST',
    body: formData
  });
};
