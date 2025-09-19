'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface AdminDashboardStats {
  users: {
    total: number;
    this_month: number;
    growth_percentage: number;
    growth_text: string;
    by_role: Record<string, number>;
    active_users: number;
  };
  listings: {
    total: number;
    active: number;
    pending: number;
    this_month: number;
    growth_percentage: number;
    growth_text: string;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
  };
  revenue: {
    total: number;
    this_month: number;
    currency: string;
    growth_percentage: number;
    growth_text: string;
    deals_by_status: Record<string, number>;
  };
  inquiries: {
    total: number;
    unread: number;
    this_month: number;
    response_rate: number;
    description: string;
  };
  recent_activity: Array<{
    action: string;
    description: string;
    user_name: string;
    created_at: string;
  }>;
  platform_performance: {
    conversion_rate: number;
    satisfaction_rate: number;
    avg_response_time: number;
  };
}

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchAdminStats = async () => {
    if (!token) {
      setError('Non authentifié');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8000/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du chargement des statistiques admin');
      }

      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Erreur lors du chargement des statistiques admin');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du dashboard admin:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchAdminStats();
  };

  useEffect(() => {
    if (token) {
      fetchAdminStats();
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

  // Format time helper
  const formatTime = (hours: number) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}j ${remainingHours.toFixed(1)}h`;
    }
    return `${hours.toFixed(1)}h`;
  };

  // Get role display name
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateurs';
      case 'lister': return 'Agents immobiliers';
      case 'client': return 'Clients';
      default: return role;
    }
  };

  // Get status color for activity
  const getActivityColor = (action: string) => {
    switch (action) {
      case 'user_registered': return 'bg-green-500';
      case 'listing_created': return 'bg-blue-500';
      case 'inquiry_created': return 'bg-yellow-500';
      case 'deal_completed': return 'bg-purple-500';
      case 'user_login': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return {
    stats,
    loading,
    error,
    refreshData,
    formatCurrency,
    formatNumber,
    formatTime,
    getRoleDisplayName,
    getActivityColor,
  };
}