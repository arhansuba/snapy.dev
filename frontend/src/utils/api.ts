// frontend/src/utils/api.ts
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { AuthResponse } from '../../../shared/types/auth';

class Api {
  [x: string]: any;
  private api: AxiosInstance;
  private static instance: Api;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.VITE_API_URL || 'http://localhost:3001/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: AxiosError): Error {
    if (error.response?.data) {
      const errorMessage = (error.response?.data as { message?: string })?.message || 'An error occurred';
      return new Error(errorMessage);
    }
    return new Error(error.message || 'Network error');
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });
    localStorage.setItem('token', response.data.token);
    return response.data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  // Projects endpoints
  async getProjects() {
    return this.api.get('/projects').then(res => res.data);
  }

  async getProject(id: string) {
    return this.api.get(`/projects/${id}`).then(res => res.data);
  }

  async createProject(data: any) {
    return this.api.post('/projects', data).then(res => res.data);
  }

  async updateProject(id: string, data: any) {
    return this.api.put(`/projects/${id}`, data).then(res => res.data);
  }

  async deleteProject(id: string) {
    return this.api.delete(`/projects/${id}`).then(res => res.data);
  }

  // AI endpoints
  async generateCode(prompt: string, options: any) {
    return this.api.post('/ai/generate', { prompt, ...options }).then(res => res.data);
  }

  // Payment endpoints
  async getPlans() {
    return this.api.get('/payment/plans').then(res => res.data);
  }

  async createSubscription(planId: string) {
    return this.api.post('/payment/create-subscription', { planId }).then(res => res.data);
  }

  // Generic request method
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.api.request<T>(config);
    return response.data;
  }
}

export const api = Api.getInstance();