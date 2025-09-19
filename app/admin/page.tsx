'use client';

import { useAuth } from '@/hooks/useAuth';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Home,
  TrendingUp,
  MessageSquare,
  Settings,
  BarChart3,
  Plus,
  Eye
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { stats, loading: dashboardLoading, error, formatCurrency, formatNumber, formatTime, getRoleDisplayName, getActivityColor } = useAdminDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Erreur: {error}</p>
          <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const dashboardStats = stats ? [
    {
      title: 'Utilisateurs Total',
      value: formatNumber(stats.users.total),
      description: stats.users.growth_text,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Propriétés Actives',
      value: formatNumber(stats.listings.active),
      description: stats.listings.growth_text,
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Revenus Totaux',
      value: formatCurrency(stats.revenue.total, stats.revenue.currency),
      description: stats.revenue.growth_text,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Messages Non Lus',
      value: stats.inquiries.unread.toString(),
      description: stats.inquiries.description,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ] : [];

  const quickActions = [
    {
      title: 'Gérer les Utilisateurs',
      description: 'Voir et gérer tous les utilisateurs',
      icon: Users,
      action: () => router.push('/admin/users'),
    },
    {
      title: 'Gérer les Propriétés',
      description: 'Modérer les annonces immobilières',
      icon: Home,
      action: () => router.push('/admin/properties'),
    },
    {
      title: 'Rapports et Analytics',
      description: 'Voir les statistiques détaillées',
      icon: BarChart3,
      action: () => router.push('/admin/analytics'),
    },
    {
      title: 'Configuration',
      description: 'Paramètres de la plateforme',
      icon: Settings,
      action: () => router.push('/admin/settings'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Tableau de Bord Admin
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Bienvenue, {user.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => router.push('/')} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white">
                <Eye className="h-4 w-4 mr-2" />
                Voir le Site
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-400">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow bg-gray-800 border-gray-700 hover:bg-gray-750">
                  <CardHeader
                    className="pb-2"
                    onClick={action.action}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5 text-blue-400" />
                      <CardTitle className="text-lg text-white">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent
                    className="pt-0 cursor-pointer"
                    onClick={action.action}
                  >
                    <CardDescription className="text-gray-400">{action.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Activité Récente</CardTitle>
              <CardDescription className="text-gray-400">
                Dernières actions sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent_activity.slice(0, 6).map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className={`w-2 h-2 ${getActivityColor(activity.action)} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-200">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          par {activity.user_name} • {new Date(activity.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>Aucune activité récente</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Statistiques Rapides</CardTitle>
              <CardDescription className="text-gray-400">
                Aperçu des performances
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.platform_performance ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Taux de conversion</span>
                    <span className="text-sm font-medium text-gray-200">{stats.platform_performance.conversion_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(stats.platform_performance.conversion_rate, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Satisfaction utilisateur</span>
                    <span className="text-sm font-medium text-gray-200">{stats.platform_performance.satisfaction_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.platform_performance.satisfaction_rate}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Temps de réponse moyen</span>
                    <span className="text-sm font-medium text-gray-200">
                      {formatTime(stats.platform_performance.avg_response_time)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${Math.max(0, 100 - stats.platform_performance.avg_response_time * 10)}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                  <p>Aucune donnée de performance disponible</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}