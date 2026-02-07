'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  Subscription,
  SubscriptionPlan,
  SubscriptionStatistics,
  PaginatedSubscriptions,
  SubscriptionFilters,
} from '@/types';

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

export function useAdminSubscriptions() {
  const { token } = useAuth();
  const [subscriptions, setSubscriptions] = useState<PaginatedSubscriptions | null>(null);
  const [statistics, setStatistics] = useState<SubscriptionStatistics | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
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
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        window.location.href = '/auth/login';
        return null;
      }
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  };

  const fetchSubscriptions = async (filters: SubscriptionFilters = {}) => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await apiCall(`/admin/subscriptions?${params.toString()}`);
      setSubscriptions(response);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!token) return;

    try {
      const response = await apiCall('/admin/subscriptions/statistics');
      setStatistics(response?.data || null);
    } catch (err) {
      console.error('Error fetching subscription statistics:', err);
    }
  };

  const fetchPlans = async () => {
    if (!token) return;

    try {
      const response = await apiCall('/admin/subscription-plans');
      setPlans(response?.data || []);
    } catch (err) {
      console.error('Error fetching subscription plans:', err);
    }
  };

  const createSubscription = async (data: {
    user_id: number;
    plan_id: number;
    starts_at: string;
  }) => {
    const response = await apiCall('/admin/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response?.data;
  };

  const extendSubscription = async (subscriptionId: number, planId: number) => {
    const response = await apiCall(`/admin/subscriptions/${subscriptionId}/extend`, {
      method: 'PUT',
      body: JSON.stringify({ plan_id: planId }),
    });
    return response?.data;
  };

  const updatePlan = async (planId: number, data: {
    name?: string;
    price?: number;
    currency?: string;
    is_active?: boolean;
  }) => {
    const response = await apiCall(`/admin/subscription-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (response?.data) {
      setPlans((prev) =>
        prev.map((p) => (p.id === planId ? { ...p, ...response.data } : p))
      );
    }

    return response?.data;
  };

  const cancelSubscription = async (subscriptionId: number) => {
    const response = await apiCall(`/admin/subscriptions/${subscriptionId}/cancel`, {
      method: 'PUT',
    });

    if (subscriptions) {
      const updatedData = subscriptions.data.map((sub) =>
        sub.id === subscriptionId
          ? { ...sub, status: 'cancelled' as const, cancelled_at: new Date().toISOString() }
          : sub
      );
      setSubscriptions({ ...subscriptions, data: updatedData });
    }

    return response?.data;
  };

  useEffect(() => {
    if (token) {
      fetchSubscriptions();
      fetchStatistics();
      fetchPlans();
    }
  }, [token]);

  return {
    subscriptions,
    statistics,
    plans,
    loading,
    error,
    fetchSubscriptions,
    fetchStatistics,
    fetchPlans,
    createSubscription,
    extendSubscription,
    cancelSubscription,
    updatePlan,
  };
}
