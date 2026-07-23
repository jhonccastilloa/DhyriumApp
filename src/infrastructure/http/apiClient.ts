import { useLoaderStore } from '@/app/state/useLoaderStore';
import axios, { AxiosError } from 'axios';
import StorageAdapter from '@/infrastructure/storage/StorageAdapter';
import { AUTH_STORAGE_KEYS } from '@/modules/auth/constants/authStorageKeys';
import { toast } from 'sonner-native';

export const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

let requestsCount = 0;

export const showLoader = (noLoader = false) => {
  if (!noLoader && requestsCount === 0) {
    useLoaderStore.getState().showLoader();
  }

  if (!noLoader) requestsCount++;
};

export const hideLoader = (noLoader = false) => {
  if (!noLoader) {
    requestsCount--;

    if (requestsCount <= 0) {
      requestsCount = 0;
      useLoaderStore.getState().hideLoader();
    }
  }
};

api.interceptors.request.use(
  async req => {
    const noLoader = Boolean(req.headers?.noLoader);
    showLoader(noLoader);

    const token = StorageAdapter.getItem(AUTH_STORAGE_KEYS.accessToken);

    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
  },
  err => {
    hideLoader(Boolean(err.config?.headers?.noLoader));
    return Promise.reject(err);
  },
);

api.interceptors.response.use(
  res => {
    hideLoader(Boolean(res.config.headers?.noLoader));
    return res;
  },
  async (err: AxiosError) => {
    const { response, config } = err;
    hideLoader(Boolean(config?.headers?.noLoader));
    toast.error(
      (response?.data as { message?: string } | undefined)?.message ||
        'An error occurred. Please try again later.',
    );

    return Promise.reject(err);
  },
);

export default api;
