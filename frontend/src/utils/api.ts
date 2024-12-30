// frontend/src/utils/api.ts
type ApiOptions = {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
};

export class Api {
  private static instance: Api;
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  private constructor() {
    // Replace process.env with import.meta.env
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    this.timeout = 30000;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  public static getInstance(): Api {
    if (!Api.instance) {
      Api.instance = new Api();
    }
    return Api.instance;
  }

  public setAuthToken(token: string | null) {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = {
      ...this.headers,
      ...headers,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  public get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, headers);
  }

  public post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('POST', endpoint, data, headers);
  }

  public put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PUT', endpoint, data, headers);
  }

  public delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, headers);
  }

  public patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, headers);
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('token', response.token);
    return response;
  }

  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', {
      email,
      password,
      name,
    });
    localStorage.setItem('token', response.token);
    return response;
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
  }

  // Projects endpoints
  async getProjects() {
    return this.get('/projects');
  }

  async getProject(id: string) {
    return this.get(`/projects/${id}`);
  }

  async createProject(data: any) {
    return this.post('/projects', data);
  }

  async updateProject(id: string, data: any) {
    return this.put(`/projects/${id}`, data);
  }

  async deleteProject(id: string) {
    return this.delete(`/projects/${id}`);
  }

  // AI endpoints
  async generateCode(prompt: string, options: any) {
    return this.post('/ai/generate', { prompt, ...options });
  }

  // Payment endpoints
  async getPlans() {
    return this.get('/payment/plans');
  }

  async createSubscription(planId: string) {
    return this.post('/payment/create-subscription', { planId });
  }
}

// Create and export API instance
export const api = Api.getInstance();