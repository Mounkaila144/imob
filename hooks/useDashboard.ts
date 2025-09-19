'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { dashboardApi } from '@/lib/api';

interface DashboardStats {
  properties: {
    total: number;
    this_month: number;
    growth_percentage: number;
    growth_text: string;
  };
  views: {
    total: number;
    this_month: number;
    growth_percentage: number;
    growth_text: string;
  };
  inquiries: {
    total: number;
    unread: number;
    this_month: number;
    description: string;
  };
  revenue: {
    total: number;
    this_month: number;
    currency: string;
    growth_percentage: number;
    growth_text: string;
  };
  recent_activity: Array<{
    action: string;
    description: string;
    created_at: string;
  }>;
  monthly_performance: {
    views: number;
    inquiries: number;
    appointments: number;
    response_rate: number;
  };
}

interface RecentProperty {
  id: number;
  title: string;
  price: number;
  currency: string;
  type: string;
  status: string;
  views_count: number;
  inquiries_count: number;
  created_at: string;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchDashboardStats = async () => {
    if (!token) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProperties = async (limit: number = 5) => {
    if (!token) return;

    try {
      const data = await dashboardApi.getRecentProperties();
      setRecentProperties(data);
    } catch (err) {
      console.error('Erreur lors du chargement des propriétés récentes:', err);
    }
  };

  const refreshData = async () => {
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentProperties()
    ]);
  };

  useEffect(() => {
    if (token) {
      refreshData();
    }
  }, [token]);

  // Format currency helper
  const formatCurrency = (amount: number, currency: string = 'XOF') => {
    if (currency === 'XOF') {
      return `CFA ${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} ${currency}`;
  };

  // Format number helper
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return {
    stats,
    recentProperties,
    loading,
    error,
    refreshData,
    formatCurrency,
    formatNumber,
  };
}