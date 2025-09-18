'use client';

import { useAuth } from '@/hooks/useAuth';
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
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
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

  const stats = [
    {
      title: 'Utilisateurs Total',
      value: '1,234',
      description: '+12% ce mois',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Propriétés Actives',
      value: '856',
      description: '+8% ce mois',
      icon: Home,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Revenus Mensuels',
      value: '€24,500',
      description: '+15% ce mois',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Messages Non Lus',
      value: '42',
      description: 'Nécessite attention',
      icon: MessageSquare,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

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
          {stats.map((stat, index) => {
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
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">Nouveau utilisateur inscrit</p>
                    <p className="text-xs text-gray-500">Il y a 5 minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">Propriété publiée</p>
                    <p className="text-xs text-gray-500">Il y a 12 minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">Demande de visite</p>
                    <p className="text-xs text-gray-500">Il y a 30 minutes</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">Paiement traité</p>
                    <p className="text-xs text-gray-500">Il y a 1 heure</p>
                  </div>
                </div>
              </div>
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Taux de conversion</span>
                  <span className="text-sm font-medium text-gray-200">3.2%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Satisfaction utilisateur</span>
                  <span className="text-sm font-medium text-gray-200">4.8/5</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Temps de réponse moyen</span>
                  <span className="text-sm font-medium text-gray-200">2.1h</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}