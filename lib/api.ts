const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    phone?: string;
    status: string;
    email_verified_at?: string;
    profile: {
      avatar_path?: string;
      company?: string;
      about?: string;
    };
    created_at: string;
    updated_at: string;
  };
}

interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
  role: 'client' | 'lister';
  company?: string;
  about?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Une erreur est survenue',
        response.status,
        data.errors
      );
    }

    if (!data.success) {
      throw new ApiError(
        data.message || 'Une erreur est survenue',
        response.status,
        data.errors
      );
    }

    // Pour les endpoints d'auth qui retournent directement les données
    if (data.user && data.token) {
      return data as T;
    }

    // Pour l'endpoint /auth/me qui retourne directement l'utilisateur
    if (endpoint === '/auth/me' && data.user) {
      return data as T;
    }

    // Pour les autres endpoints qui utilisent la structure data
    return data.data !== undefined ? data.data as T : data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError('Erreur de connexion au serveur', 0);
    }

    throw new ApiError('Une erreur inattendue est survenue', 0);
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    localStorage.setItem('auth_token', response.token);
    return response;
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    localStorage.setItem('auth_token', response.token);
    return response;
  },

  async getProfile(): Promise<LoginResponse['user']> {
    const response = await apiRequest<{ user: LoginResponse['user'] }>('/auth/me');
    return response.user || response as any;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
      });
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  async refreshToken(): Promise<{ token: string }> {
    const response = await apiRequest<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });

    localStorage.setItem('auth_token', response.token);
    return response;
  },

  async updateProfile(profileData: Partial<{
    name: string;
    phone: string;
    company: string;
    about: string;
  }>): Promise<LoginResponse['user']> {
    return apiRequest<LoginResponse['user']>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }): Promise<void> {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

export { ApiError };
export type { ApiResponse, LoginRequest, LoginResponse, RegisterRequest };