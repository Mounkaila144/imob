'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Home,
  Plus,
  Eye,
  TrendingUp,
  MessageSquare,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  Edit,
  Star
} from 'lucide-react';

export default function ListerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { stats, recentProperties, loading: dashboardLoading, error, formatCurrency, formatNumber } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'lister')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'lister') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  const dashboardStats = stats ? [
    {
      title: 'Mes Propriétés',
      value: stats.properties.total.toString(),
      description: stats.properties.growth_text,
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Vues Totales',
      value: formatNumber(stats.views.total),
      description: stats.views.growth_text,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Messages Reçus',
      value: stats.inquiries.total.toString(),
      description: stats.inquiries.description,
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Revenus Estimés',
      value: formatCurrency(stats.revenue.total, stats.revenue.currency),
      description: stats.revenue.growth_text,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ] : [];

  const quickActions = [
    {
      title: 'Nouvelle Propriété',
      description: 'Ajouter une nouvelle annonce',
      icon: Plus,
      action: () => router.push('/dashboard/properties/create'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Mes Propriétés',
      description: 'Gérer mes annonces',
      icon: Home,
      action: () => router.push('/dashboard/properties'),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Messages',
      description: 'Répondre aux clients',
      icon: MessageSquare,
      action: () => router.push('/dashboard/messages'),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Rendez-vous',
      description: 'Gérer les visites',
      icon: Calendar,
      action: () => router.push('/dashboard/appointments'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'pending_review': return 'En attente';
      case 'draft': return 'Brouillon';
      case 'rejected': return 'Rejeté';
      case 'archived': return 'Archivé';
      case 'sold': return 'Vendu';
      case 'rented': return 'Loué';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de Bord
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Bienvenue, {user.name}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => router.push('/')}>
                <Eye className="h-4 w-4 mr-2" />
                Voir le Site
              </Button>
              <Button onClick={() => router.push('/dashboard/properties/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Propriété
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
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-6" onClick={action.action}>
                    <div className={`${action.bgColor} p-3 rounded-lg w-fit mb-4`}>
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Properties */}
          <Card>
            <CardHeader>
              <CardTitle>Mes Propriétés Récentes</CardTitle>
              <CardDescription>
                Dernières annonces publiées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProperties.length > 0 ? recentProperties.map((property) => (
                  <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{property.title}</h4>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(property.price, property.currency)}
                        {property.type === 'rent' ? '/mois' : ''}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                          {getStatusLabel(property.status)}
                        </span>
                        <span className="text-xs text-gray-500">{property.views_count} vues</span>
                        <span className="text-xs text-gray-500">{property.inquiries_count} messages</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/properties/${property.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    <Home className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucune propriété récente</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => router.push('/dashboard/properties/create')}
                    >
                      Créer votre première propriété
                    </Button>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => router.push('/dashboard/properties')}>
                Voir toutes mes propriétés
              </Button>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance ce Mois</CardTitle>
              <CardDescription>
                Vues et interactions sur vos annonces
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.monthly_performance ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Vues ce mois</span>
                    <span className="text-sm font-medium">{formatNumber(stats.monthly_performance.views)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.monthly_performance.views / (stats.views.total || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Messages ce mois</span>
                    <span className="text-sm font-medium">{stats.monthly_performance.inquiries}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min((stats.monthly_performance.inquiries / (stats.inquiries.total || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rendez-vous programmés</span>
                    <span className="text-sm font-medium">{stats.monthly_performance.appointments}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${Math.min(stats.monthly_performance.appointments * 10, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taux de réponse</span>
                    <span className="text-sm font-medium">{stats.monthly_performance.response_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{ width: `${stats.monthly_performance.response_rate}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
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