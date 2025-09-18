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

// Types pour les listings
interface ListingResponse {
  id: number;
  title: string;
  description?: string;
  slug: string;
  type: 'sale' | 'rent';
  property_type: 'apartment' | 'house' | 'villa' | 'land' | 'office' | 'shop' | 'warehouse' | 'other';
  status: 'published' | 'draft' | 'pending' | 'suspended' | 'sold' | 'rented';
  price: {
    amount: number;
    currency: string;
    formatted: string;
    rent_period?: string;
    deposit_amount?: number;
    lease_min_months?: number;
  };
  area_size?: number;
  area_unit?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  floor?: number;
  year_built?: number;
  location: {
    address_line1: string;
    city: string;
    postal_code: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    full_address?: string;
  };
  views_count?: number;
  metadata?: {
    features?: string[];
    is_favorite?: boolean;
  };
  photos?: {
    id: number;
    url: string;
    is_cover: boolean;
    sort_order: number;
  }[];
  owner: {
    id: number;
    name: string;
    phone?: string;
    company?: string;
    role: string;
    member_since?: string;
  };
  amenities?: {
    id: number;
    code: string;
    label: string;
  }[];
  permissions?: {
    can_edit: boolean;
    can_delete: boolean;
    can_contact: boolean;
    can_favorite: boolean;
  };
  created_at: string;
  updated_at?: string;
}

interface PaginatedListingResponse {
  data: ListingResponse[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
  };
}

interface CreateListingRequest {
  title: string;
  description: string;
  type: 'sale' | 'rent';
  property_type: 'apartment' | 'house' | 'villa' | 'land' | 'office' | 'shop' | 'warehouse' | 'other';
  price: number;
  currency?: string;
  rent_period?: string;
  deposit_amount?: number;
  lease_min_months?: number;
  area_size?: number;
  area_unit?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  floor?: number;
  year_built?: number;
  address_line1: string;
  city: string;
  postal_code?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
  available_from?: string;
  amenity_ids?: number[];
  features?: string[];
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

export const listingsApi = {
  // Récupérer toutes les annonces publiques
  async getPublicListings(params?: {
    type?: 'sale' | 'rent';
    property_type?: string;
    city?: string;
    min_price?: number;
    max_price?: number;
    rooms?: number;
    bedrooms?: number;
    search?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<PaginatedListingResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() ? `/listings?${queryParams.toString()}` : '/listings';
    return apiRequest<PaginatedListingResponse>(endpoint);
  },

  // Récupérer les annonces du lister connecté
  async getMyListings(params?: {
    status?: string;
    type?: 'sale' | 'rent';
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<PaginatedListingResponse> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = queryParams.toString() ? `/my-listings?${queryParams.toString()}` : '/my-listings';
    const response = await apiRequest<any>(endpoint);

    // Si l'API retourne directement un tableau, on le structure correctement
    if (Array.isArray(response)) {
      const paginatedResponse: PaginatedListingResponse = {
        data: response,
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: response.length,
          total: response.length,
          has_more_pages: false,
        }
      };
      return paginatedResponse;
    }

    return response as PaginatedListingResponse;
  },

  // Récupérer une annonce spécifique
  async getListing(id: number): Promise<ListingResponse> {
    return apiRequest<ListingResponse>(`/listings/${id}`);
  },

  // Créer une nouvelle annonce
  async createListing(listingData: CreateListingRequest): Promise<ListingResponse> {
    return apiRequest<ListingResponse>('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },

  // Modifier une annonce
  async updateListing(id: number, listingData: Partial<CreateListingRequest>): Promise<ListingResponse> {
    return apiRequest<ListingResponse>(`/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  },

  // Supprimer une annonce
  async deleteListing(id: number): Promise<void> {
    return apiRequest(`/listings/${id}`, {
      method: 'DELETE',
    });
  },

  // Upload des photos
  async uploadPhotos(listingId: number, photos: File[]): Promise<any> {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append(`photos[${index}]`, photo);
    });

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/listings/${listingId}/photos`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Erreur lors de l\'upload',
        response.status,
        data.errors
      );
    }

    return data.data;
  },

  // Supprimer une photo
  async deletePhoto(listingId: number, photoId: number): Promise<void> {
    return apiRequest(`/listings/${listingId}/photos/${photoId}`, {
      method: 'DELETE',
    });
  },

  // Définir photo de couverture
  async setCoverPhoto(listingId: number, photoId: number): Promise<void> {
    return apiRequest(`/listings/${listingId}/photos/${photoId}/cover`, {
      method: 'PUT',
    });
  },

  // Réorganiser les photos
  async reorderPhotos(listingId: number, photos: Array<{id: number; sort_order: number}>): Promise<void> {
    return apiRequest(`/listings/${listingId}/photos/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ photos }),
    });
  },
};

export { ApiError };
export type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ListingResponse,
  PaginatedListingResponse,
  CreateListingRequest
};