import axios from 'axios';
import type { SearchRequest, SearchResponse, ErrorResponse } from '../types/api';

// 使用代理URL
const API_BASE_URL = import.meta.env.DEV ? '' : 'https://so.252035.xyz';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 默认插件配置
const DEFAULT_PLUGINS = ['pansearch', 'pan666', 'qupansou', 'hunhepan', 'jikepan'];

export const searchPanSou = async (params: SearchRequest): Promise<SearchResponse> => {
  try {
    const requestParams = {
      ...params,
      plugins: params.plugins || DEFAULT_PLUGINS,
    };
    const response = await api.post<SearchResponse>('/api/search', requestParams);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorResponse = error.response?.data as ErrorResponse;
      throw new Error(errorResponse?.message || '搜索失败，请稍后重试');
    }
    throw new Error('网络错误，请检查网络连接');
  }
};

export const searchPanSouGet = async (keyword: string, params?: Partial<SearchRequest>): Promise<SearchResponse> => {
  try {
    const searchParams = new URLSearchParams({
      kw: keyword,
      refresh: 'false',
      res: 'merge',
      src: 'all',
      plugins: DEFAULT_PLUGINS.join(','),
      ...(params?.refresh !== undefined && { refresh: params.refresh.toString() }),
      ...(params?.res && { res: params.res }),
      ...(params?.src && { src: params.src }),
      ...(params?.plugins && { plugins: params.plugins.join(',') }),
    });

    const url = `/api/search?${searchParams.toString()}`;
    const response = await api.get<SearchResponse>(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorResponse = error.response?.data as ErrorResponse;
      throw new Error(errorResponse?.message || '搜索失败，请稍后重试');
    }
    throw new Error('网络错误，请检查网络连接');
  }
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/api/health');
    return response.data.status === 'ok';
  } catch {
    return false;
  }
}; 