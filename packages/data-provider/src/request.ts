/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import * as endpoints from './api-endpoints';
import { setTokenHeader } from './headers-helpers';
import type * as t from './types';

async function _get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
  const response = await axios.get(url, { ...options });
  return response.data;
}

async function _getResponse<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
  return await axios.get(url, { ...options });
}

async function _post(url: string, data?: any) {
  const response = await axios.post(url, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

async function _postMultiPart(url: string, formData: FormData, options?: AxiosRequestConfig) {
  console.log('🌐 [postMultiPart] Making HTTP request to:', url);
  const file = formData.get('file') as File | null;
  console.log('📊 [postMultiPart] FormData contents:', {
    file: file?.name || 'no file',
    fileType: file?.type || 'no type',
    fileSize: file?.size || 'no size',
    endpoint: formData.get('endpoint'),
    file_id: formData.get('file_id'),
    tool_resource: formData.get('tool_resource'),
  });

  // Check if it's an Excel file
  const isExcelFile = file?.type?.includes('spreadsheetml') || file?.name?.endsWith('.xlsx');
  console.log('📊 [postMultiPart] Is Excel file:', isExcelFile);

  // Check file size and type for debugging
  if (isExcelFile) {
    console.log('🔍 [postMultiPart] Excel file details:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      lastModified: file?.lastModified,
    });

    // Check if the file object has any special properties
    console.log('🔍 [postMultiPart] File object properties:', Object.keys(file || {}));
    console.log('🔍 [postMultiPart] File constructor:', file?.constructor?.name);
    console.log('🔍 [postMultiPart] File instanceof File:', file instanceof File);
    console.log('🔍 [postMultiPart] File instanceof Blob:', file instanceof Blob);
  }

  try {
    console.log('🔧 [postMultiPart] Axios config:', {
      url,
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: options?.timeout,
      withCredentials: options?.withCredentials,
    });

    console.log('🔧 [postMultiPart] Original options:', options);

    // For Excel files, try using axios with minimal configuration
    if (isExcelFile) {
      console.log('🔧 [postMultiPart] Using axios for Excel file with minimal config');
      console.log('🔧 [postMultiPart] Excel URL:', url);

      // Test: Try to create a new FormData with just the file
      console.log('🧪 [postMultiPart] Testing FormData creation...');
      const testFormData = new FormData();
      testFormData.append('file', file as File);
      testFormData.append('endpoint', formData.get('endpoint') as string);
      testFormData.append('file_id', formData.get('file_id') as string);
      testFormData.append('tool_resource', formData.get('tool_resource') as string);

      console.log('🧪 [postMultiPart] Test FormData entries:');
      const entries = Array.from(testFormData.entries());
      entries.forEach(([key, value]) => {
        console.log(`  ${key}:`, value);
      });

      // Test: Check if the problem is with the file size
      console.log('🧪 [postMultiPart] File size check:', {
        size: file?.size,
        sizeInMB: file?.size ? (file.size / 1024 / 1024).toFixed(2) + ' MB' : 'unknown',
        isLargeFile: file?.size ? file.size > 1000000 : false,
      });

      // Test: Check if the problem is with the MIME type
      console.log('🧪 [postMultiPart] MIME type check:', {
        type: file?.type,
        isExcelMime: file?.type?.includes('spreadsheetml'),
        isOfficeMime: file?.type?.includes('officedocument'),
      });

      try {
        // Use axios with minimal configuration for Excel files
        const response = await axios.post(url, formData, {
          ...options,
          // Don't set any headers, let axios handle everything
        });

        console.log('✅ [postMultiPart] Axios Excel request SUCCESS:', response.status);
        return response.data;
      } catch (axiosError) {
        console.log('❌ [postMultiPart] Axios Excel request FAILED:', axiosError);
        throw axiosError;
      }
    }

    // For other files, use axios with explicit Content-Type
    const requestConfig = {
      ...options,
      headers: { 'Content-Type': 'multipart/form-data' },
    };
    console.log('🔧 [postMultiPart] Using axios for regular file');
    console.log('🔧 [postMultiPart] Final request config:', requestConfig);

    const response = await axios.post(url, formData, requestConfig);
    console.log('✅ [postMultiPart] HTTP request SUCCESS:', response.status);
    return response.data;
  } catch (error: any) {
    console.log('❌ [postMultiPart] HTTP request FAILED:', error);
    console.log('🔍 [postMultiPart] Error details:', {
      message: error?.message,
      code: error?.code,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      config: {
        url: error?.config?.url,
        method: error?.config?.method,
        timeout: error?.config?.timeout,
        headers: error?.config?.headers,
      },
    });
    throw error;
  }
}

async function _postTTS(url: string, formData: FormData, options?: AxiosRequestConfig) {
  const response = await axios.post(url, formData, {
    ...options,
    headers: { 'Content-Type': 'multipart/form-data' },
    responseType: 'arraybuffer',
  });
  return response.data;
}

async function _put(url: string, data?: any) {
  const response = await axios.put(url, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

async function _delete<T>(url: string): Promise<T> {
  const response = await axios.delete(url);
  return response.data;
}

async function _deleteWithOptions<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
  const response = await axios.delete(url, { ...options });
  return response.data;
}

async function _patch(url: string, data?: any) {
  const response = await axios.patch(url, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = [];

const refreshToken = (retry?: boolean): Promise<t.TRefreshTokenResponse | undefined> =>
  _post(endpoints.refreshToken(retry));

const dispatchTokenUpdatedEvent = (token: string) => {
  setTokenHeader(token);
  window.dispatchEvent(new CustomEvent('tokenUpdated', { detail: token }));
};

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

if (typeof window !== 'undefined') {
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (!error.response) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes('/api/auth/2fa') === true) {
        return Promise.reject(error);
      }
      if (originalRequest.url?.includes('/api/auth/logout') === true) {
        return Promise.reject(error);
      }

      if (error.response.status === 401 && !originalRequest._retry) {
        console.warn('401 error, refreshing token');
        originalRequest._retry = true;

        if (isRefreshing) {
          try {
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return await axios(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        isRefreshing = true;

        try {
          const response = await refreshToken(
            // Handle edge case where we get a blank screen if the initial 401 error is from a refresh token request
            originalRequest.url?.includes('api/auth/refresh') === true ? true : false,
          );

          const token = response?.token ?? '';

          if (token) {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            dispatchTokenUpdatedEvent(token);
            processQueue(null, token);
            return await axios(originalRequest);
          } else if (window.location.href.includes('share/')) {
            console.log(
              `Refresh token failed from shared link, attempting request to ${originalRequest.url}`,
            );
          } else {
            window.location.href = '/login';
          }
        } catch (err) {
          processQueue(err as AxiosError, null);
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
}

export default {
  get: _get,
  getResponse: _getResponse,
  post: _post,
  postMultiPart: _postMultiPart,
  postTTS: _postTTS,
  put: _put,
  delete: _delete,
  deleteWithOptions: _deleteWithOptions,
  patch: _patch,
  refreshToken,
  dispatchTokenUpdatedEvent,
};
