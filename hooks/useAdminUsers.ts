'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  email_verified_at: string | null;
  last_login_ip: string | null;
  profile: {
    avatar_path: string | null;
    company: string | null;
    about: string | null;
  };
  stats: {
    listings_count: number;
    inquiries_count: number;
    deals_count: number;
  };
  created_at: string;
  updated_at: string;
}

export interface UserDetails extends User {
  detailed_stats?: {
    total_listings: number;
    active_listings: number;
    total_inquiries: number;
    pending_inquiries: number;
    total_deals: number;
    completed_deals: number;
  };
  recent_activity?: Array<{
    action: string;
    subject_type: string;
    subject_id: number;
    properties: any;
    created_at: string;
  }>;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
  per_page?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface UserStatistics {
  total_users: number;
  by_role: {
    admin: number;
    lister: number;
    client: number;
  };
  by_status: {
    active: number;
    suspended: number;
    pending: number;
  };
  recent_registrations: number;
}

export interface PaginatedUsers {
  data: User[];
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

console.log('useAdminUsers - API_BASE_URL:', API_BASE_URL); // Debug logging
console.log('useAdminUsers - Hostname:', typeof window !== 'undefined' ? window.location.hostname : 'server-side'); // Debug logging

export function useAdminUsers() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<PaginatedUsers | null>(null);
  const [statistics, setStatistics] = useState<UserStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useAdminUsers - Current user:', user);
  console.log('useAdminUsers - Current token:', !!token);

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

  // Récupérer la liste des utilisateurs
  const fetchUsers = async (filters: UserFilters = {}) => {
    console.log('fetchUsers called with token:', !!token);
    if (!token) {
      console.log('No token available, skipping API call');
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

      const url = `/admin/users?${params.toString()}`;
      console.log('Making API call to:', url);
      const response = await apiCall(url);
      console.log('API response:', response);
      setUsers(response);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les statistiques
  const fetchStatistics = async () => {
    if (!token) return;

    try {
      const response = await apiCall('/admin/users/statistics');
      setStatistics(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
    }
  };

  // Récupérer les détails d'un utilisateur
  const fetchUserDetails = async (userId: number): Promise<UserDetails> => {
    const response = await apiCall(`/admin/users/${userId}`);
    return response.data;
  };

  // Modifier le statut d'un utilisateur
  const updateUserStatus = async (userId: number, status: string, reason?: string) => {
    const response = await apiCall(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });

    // Mettre à jour la liste locale
    if (users) {
      const updatedUsers = users.data.map(user =>
        user.id === userId ? { ...user, status } : user
      );
      setUsers({ ...users, data: updatedUsers });
    }

    return response.data;
  };

  // Modifier le rôle d'un utilisateur
  const updateUserRole = async (userId: number, role: string, reason?: string) => {
    const response = await apiCall(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, reason }),
    });

    // Mettre à jour la liste locale
    if (users) {
      const updatedUsers = users.data.map(user =>
        user.id === userId ? { ...user, role } : user
      );
      setUsers({ ...users, data: updatedUsers });
    }

    return response.data;
  };

  // Supprimer un utilisateur
  const deleteUser = async (userId: number) => {
    await apiCall(`/admin/users/${userId}`, {
      method: 'DELETE',
    });

    // Supprimer de la liste locale
    if (users) {
      const updatedUsers = users.data.filter(user => user.id !== userId);
      setUsers({ ...users, data: updatedUsers });
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchStatistics();
    }
  }, [token]);

  return {
    users,
    statistics,
    loading,
    error,
    fetchUsers,
    fetchStatistics,
    fetchUserDetails,
    updateUserStatus,
    updateUserRole,
    deleteUser,
  };
}