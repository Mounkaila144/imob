'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Home,
  Euro,
  Eye,
  MessageSquare,
  Calendar,
  MapPin
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  // Mock data - à remplacer par de vraies données API
  const stats = [
    {
      title: 'Revenus ce mois',
      value: 'CFA24,500',
      change: '+12%',
      trend: 'up',
      icon: Euro,
    },
    {
      title: 'Nouveaux utilisateurs',
      value: '156',
      change: '+8%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Nouvelles propriétés',
      value: '89',
      change: '+15%',
      trend: 'up',
      icon: Home,
    },
    {
      title: 'Vues totales',
      value: '12,340',
      change: '+5%',
      trend: 'up',
      icon: Eye,
    },
  ];

  const topCities = [
    { name: 'Paris', properties: 234, percentage: 45 },
    { name: 'Lyon', properties: 156, percentage: 30 },
    { name: 'Marseille', properties: 89, percentage: 17 },
    { name: 'Toulouse', properties: 67, percentage: 13 },
    { name: 'Nice', properties: 45, percentage: 9 },
  ];

  const propertyTypes = [
    { name: 'Appartements', count: 342, percentage: 65 },
    { name: 'Maisons', count: 123, percentage: 23 },
    { name: 'Bureaux', count: 45, percentage: 9 },
    { name: 'Terrains', count: 16, percentage: 3 },
  ];

  const recentActivity = [
    {
      type: 'user_registration',
      description: 'Nouvel utilisateur inscrit',
      count: 12,
      time: 'Dernière heure',
    },
    {
      type: 'property_published',
      description: 'Propriété publiée',
      count: 5,
      time: 'Dernière heure',
    },
    {
      type: 'visit_request',
      description: 'Demande de visite',
      count: 23,
      time: 'Aujourd\'hui',
    },
    {
      type: 'message_sent',
      description: 'Messages envoyés',
      count: 67,
      time: 'Aujourd\'hui',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Rapports</h1>
        <p className="mt-2 text-gray-600">
          Analysez les performances de votre plateforme immobilière
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendIcon className={`h-4 w-4 mr-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top des villes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Top des Villes
            </CardTitle>
            <CardDescription>
              Répartition des propriétés par ville
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCities.map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{city.name}</p>
                      <p className="text-sm text-gray-500">{city.properties} propriétés</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${city.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{city.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Types de propriétés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Home className="h-5 w-5 mr-2" />
              Types de Propriétés
            </CardTitle>
            <CardDescription>
              Répartition par type de bien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyTypes.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-gray-500">{type.count} biens</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${type.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-600">{type.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activité récente */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Activité en Temps Réel
          </CardTitle>
          <CardDescription>
            Aperçu de l'activité récente sur la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentActivity.map((activity, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {activity.count}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">
                  {activity.description}
                </div>
                <div className="text-xs text-gray-500">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taux de Conversion</CardTitle>
            <CardDescription>Visiteurs → Inscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">3.2%</div>
              <div className="text-sm text-gray-500">+0.5% vs mois dernier</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temps de Réponse Moyen</CardTitle>
            <CardDescription>Messages → Première réponse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2.1h</div>
              <div className="text-sm text-gray-500">-0.3h vs mois dernier</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Satisfaction Client</CardTitle>
            <CardDescription>Note moyenne des avis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">4.8/5</div>
              <div className="text-sm text-gray-500">+0.2 vs mois dernier</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}