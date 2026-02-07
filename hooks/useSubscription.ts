'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from './useAuth';
import { Subscription, SubscriptionPlan } from '@/types';

const getApiBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

export function useSubscription() {
  const { token } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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

  const fetchSubscription = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall('/my-subscription');
      setSubscription(response?.data || null);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    if (!token) return;

    try {
      const response = await apiCall('/subscription-plans');
      setPlans(response?.data || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSubscription();
      fetchPlans();
    }
  }, [token]);

  const isActive = useMemo(() => {
    if (!subscription) return false;
    return subscription.status === 'active' && new Date(subscription.ends_at) > new Date();
  }, [subscription]);

  const daysRemaining = useMemo(() => {
    if (!subscription || !subscription.ends_at) return 0;
    const now = new Date();
    const end = new Date(subscription.ends_at);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [subscription]);

  const isExpiringSoon = useMemo(() => {
    return isActive && daysRemaining <= 7;
  }, [isActive, daysRemaining]);

  const isExpired = useMemo(() => {
    if (!subscription) return false;
    return subscription.status === 'expired' || new Date(subscription.ends_at) <= new Date();
  }, [subscription]);

  return {
    subscription,
    plans,
    loading,
    error,
    isActive,
    daysRemaining,
    isExpiringSoon,
    isExpired,
    fetchSubscription,
    fetchPlans,
  };
}
