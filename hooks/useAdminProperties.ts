'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface AdminProperty {
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
  };
  area_size?: number;
  area_unit?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  location: {
    address_line1: string;
    city: string;
    postal_code: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  views_count?: number;
  owner: {
    id: number;
    name: string;
    phone?: string;
    company?: string;
    role: string;
  };
  photos?: {
    id: number;
    url: string;
    is_cover: boolean;
  }[];
  created_at: string;
  updated_at?: string;
}

export interface PropertyFilters {
  type?: string;
  property_type?: string;
  status?: string;
  city?: string;
  search?: string;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface PropertyStatistics {
  total_properties: number;
  by_status: {
    published: number;
    draft: number;
    pending: number;
    suspended: number;
    sold: number;
    rented: number;
  };
  by_type: {
    sale: number;
    rent: number;
  };
  by_property_type: {
    apartment: number;
    house: number;
    villa: number;
    land: number;
    office: number;
    shop: number;
    warehouse: number;
    other: number;
  };
  total_views: number;
}

export interface PaginatedProperties {
  data: AdminProperty[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    has_more_pages: boolean;
  };
}

// Déterminer l'URL de base selon l'environnement
const getApiBaseUrl = () => {
  // En production, utiliser l'URL de production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'guidacenter.com' || hostname.includes('guidacenter')) {
      return 'https://guidacenter.com/api';
    }
  }

  // Sinon utiliser la variable d'environnement ou localhost par défaut
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('useAdminProperties - API_BASE_URL:', API_BASE_URL); // Debug logging
console.log('useAdminProperties - Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side'); // Debug logging

export function useAdminProperties() {
  const { user, token } = useAuth();
  const [properties, setProperties] = useState<PaginatedProperties | null>(null);
  const [statistics, setStatistics] = useState<PropertyStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // Si le token est expiré, rediriger vers login
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
        return null;
      }
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  };

  // Récupérer la liste des propriétés
  const fetchProperties = async (filters: PropertyFilters = {}) => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Utiliser l'endpoint public listings pour l'instant
      const url = `/listings?${params.toString()}`;
      const response = await apiCall(url);

      // Adapter la réponse pour avoir le bon format
      if (response && Array.isArray(response)) {
        // Si c'est un tableau direct
        setProperties({
          data: response,
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: response.length,
            total: response.length,
            from: 1,
            to: response.length,
            has_more_pages: false,
          }
        });
      } else if (response && response.data) {
        // Si c'est déjà paginé
        setProperties(response);
      } else {
        setProperties({
          data: [],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 0,
            total: 0,
            from: 0,
            to: 0,
            has_more_pages: false,
          }
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // Définir des données vides en cas d'erreur
      setProperties({
        data: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 0,
          total: 0,
          from: 0,
          to: 0,
          has_more_pages: false,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques (calculées côté client pour l'instant)
  const fetchStatistics = async () => {
    if (!token) return;

    try {
      // Pour l'instant, on calcule les statistiques côté client
      // à partir des données de propriétés
      if (properties && properties.data) {
        const stats = properties.data.reduce((acc, property) => {
          acc.total_properties++;
          acc.by_status[property.status] = (acc.by_status[property.status] || 0) + 1;
          acc.by_type[property.type] = (acc.by_type[property.type] || 0) + 1;
          acc.by_property_type[property.property_type] = (acc.by_property_type[property.property_type] || 0) + 1;
          acc.total_views += property.views_count || 0;
          return acc;
        }, {
          total_properties: 0,
          by_status: {},
          by_type: {},
          by_property_type: {},
          total_views: 0,
        } as any);

        setStatistics(stats);
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
    }
  };

  // Récupérer les détails d'une propriété
  const fetchPropertyDetails = async (propertyId: number): Promise<AdminProperty> => {
    const response = await apiCall(`/listings/${propertyId}`);
    return response.data || response;
  };

  // Modifier le statut d'une propriété
  const updatePropertyStatus = async (propertyId: number, status: string, reason?: string) => {
    // Mapping des statuts frontend vers API
    const statusMapping: { [key: string]: string } = {
      'published': 'published',
      'draft': 'draft',
      'pending': 'pending_review',
      'suspended': 'rejected',
      'sold': 'sold',
      'rented': 'rented'
    };

    const apiStatus = statusMapping[status] || 'draft';

    const response = await apiCall(`/listings/${propertyId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: apiStatus }),
    });

    // Mettre à jour la liste locale avec le statut demandé (pas forcément celui de l'API)
    if (properties) {
      const updatedProperties = properties.data.map(property =>
        property.id === propertyId ? { ...property, status } : property
      );
      setProperties({ ...properties, data: updatedProperties as any });
    }

    return response;
  };

  // Supprimer une propriété
  const deleteProperty = async (propertyId: number) => {
    await apiCall(`/listings/${propertyId}`, {
      method: 'DELETE',
    });

    // Supprimer de la liste locale
    if (properties) {
      const updatedProperties = properties.data.filter(property => property.id !== propertyId);
      setProperties({ ...properties, data: updatedProperties as any });
    }
  };

  // Approuver une propriété
  const approveProperty = async (propertyId: number) => {
    return updatePropertyStatus(propertyId, 'published');
  };

  // Suspendre une propriété
  const suspendProperty = async (propertyId: number, reason?: string) => {
    return updatePropertyStatus(propertyId, 'suspended', reason);
  };

  // Charger les données initiales
  useEffect(() => {
    if (token) {
      fetchProperties();
    }
  }, [token]);

  // Calculer les statistiques quand les propriétés changent
  useEffect(() => {
    if (properties && properties.data.length >= 0) {
      fetchStatistics();
    }
  }, [properties]);

  return {
    properties,
    statistics,
    loading,
    error,
    fetchProperties,
    fetchStatistics,
    fetchPropertyDetails,
    updatePropertyStatus,
    deleteProperty,
    approveProperty,
    suspendProperty,
  };
}