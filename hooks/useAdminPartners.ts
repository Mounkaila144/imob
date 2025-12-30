'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { PartnerResponse, PaginatedPartnerResponse, ApiError } from '@/lib/api';

export interface PartnerFilters {
  is_active?: boolean;
  search?: string;
  per_page?: number;
  page?: number;
}

// Déterminer l'URL de base selon l'environnement
const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

export function useAdminPartners() {
  const { token } = useAuth();
  const [partners, setPartners] = useState<PaginatedPartnerResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API call helper that uses token from useAuth
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
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
        return null;
      }
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  };

  // Fetch all partners with filters
  const fetchPartners = useCallback(async (filters: PartnerFilters = {}) => {
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

      const url = `/admin/partners?${params.toString()}`;
      const response = await apiCall(url);

      if (response) {
        setPartners(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération des partenaires');
      setPartners({
        data: [],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
          has_more_pages: false,
        },
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Get a specific partner
  const getPartner = async (id: number): Promise<PartnerResponse | null> => {
    try {
      const response = await apiCall(`/admin/partners/${id}`);
      return response?.data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du partenaire');
      return null;
    }
  };

  // Create a new partner (uses FormData for file upload)
  const createPartner = async (data: {
    name: string;
    logo: File;
    sort_order?: number;
    is_active?: boolean;
    website_url?: string;
  }): Promise<PartnerResponse | null> => {
    if (!token) return null;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('logo', data.logo);
      if (data.sort_order !== undefined) {
        formData.append('sort_order', data.sort_order.toString());
      }
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active ? '1' : '0');
      }
      if (data.website_url) {
        formData.append('website_url', data.website_url);
      }

      const response = await fetch(`${API_BASE_URL}/admin/partners`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la création du partenaire');
      }

      // Refresh the list
      await fetchPartners();

      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du partenaire');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a partner
  const updatePartner = async (
    id: number,
    data: {
      name?: string;
      logo?: File;
      sort_order?: number;
      is_active?: boolean;
      website_url?: string | null;
    }
  ): Promise<PartnerResponse | null> => {
    if (!token) return null;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (data.name) {
        formData.append('name', data.name);
      }
      if (data.logo) {
        formData.append('logo', data.logo);
      }
      if (data.sort_order !== undefined) {
        formData.append('sort_order', data.sort_order.toString());
      }
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active ? '1' : '0');
      }
      if (data.website_url !== undefined) {
        formData.append('website_url', data.website_url || '');
      }

      const response = await fetch(`${API_BASE_URL}/admin/partners/${id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erreur lors de la mise à jour du partenaire');
      }

      const updatedPartner = result.data;

      // Update the local state
      if (partners) {
        const updatedData = partners.data.map((p) =>
          p.id === id ? updatedPartner : p
        );
        setPartners({ ...partners, data: updatedData });
      }

      return updatedPartner;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du partenaire');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a partner
  const deletePartner = async (id: number): Promise<boolean> => {
    if (!token) return false;

    setLoading(true);
    setError(null);

    try {
      await apiCall(`/admin/partners/${id}`, {
        method: 'DELETE',
      });

      // Remove from local state
      if (partners) {
        const updatedData = partners.data.filter((p) => p.id !== id);
        setPartners({
          ...partners,
          data: updatedData,
          pagination: {
            ...partners.pagination,
            total: partners.pagination.total - 1,
          },
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du partenaire');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (id: number): Promise<PartnerResponse | null> => {
    if (!token) return null;

    try {
      const response = await apiCall(`/admin/partners/${id}/toggle-active`, {
        method: 'PUT',
      });

      const updatedPartner = response?.data;

      // Update local state
      if (partners && updatedPartner) {
        const updatedData = partners.data.map((p) =>
          p.id === id ? updatedPartner : p
        );
        setPartners({ ...partners, data: updatedData });
      }

      return updatedPartner || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du changement de statut');
      return null;
    }
  };

  // Reorder partners
  const reorderPartners = async (
    orderedPartners: Array<{ id: number; sort_order: number }>
  ): Promise<boolean> => {
    if (!token) return false;

    try {
      await apiCall('/admin/partners/reorder', {
        method: 'PUT',
        body: JSON.stringify({ partners: orderedPartners }),
      });

      // Update local state with new order
      if (partners) {
        const updatedData = [...partners.data].sort((a, b) => {
          const orderA = orderedPartners.find((p) => p.id === a.id)?.sort_order ?? a.sort_order;
          const orderB = orderedPartners.find((p) => p.id === b.id)?.sort_order ?? b.sort_order;
          return orderA - orderB;
        });
        setPartners({ ...partners, data: updatedData });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réorganisation');
      return false;
    }
  };

  // Load initial data when token is available
  useEffect(() => {
    if (token) {
      fetchPartners();
    }
  }, [token, fetchPartners]);

  return {
    partners,
    loading,
    error,
    fetchPartners,
    getPartner,
    createPartner,
    updatePartner,
    deletePartner,
    toggleActive,
    reorderPartners,
  };
}
