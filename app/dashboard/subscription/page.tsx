'use client';

import { useSubscription } from '@/hooks/useSubscription';
import SubscriptionStatusCard from '@/components/dashboard/SubscriptionStatusCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, CheckCircle, Mail } from 'lucide-react';

export default function SubscriptionPage() {
  const { subscription, plans, loading, isActive } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Mon Abonnement</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez votre abonnement et consultez les plans disponibles
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Card */}
        <SubscriptionStatusCard />

        {/* Current subscription details */}
        {subscription && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Détails de l&apos;abonnement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="text-lg font-semibold text-gray-900">{subscription.plan.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <Badge
                    variant="secondary"
                    className={
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                    }
                  >
                    {subscription.status === 'active'
                      ? 'Actif'
                      : subscription.status === 'expired'
                        ? 'Expiré'
                        : 'Annulé'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de début</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(subscription.starts_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date de fin</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(subscription.ends_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available plans */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Plans disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isCurrent = subscription?.plan_id === plan.id && isActive;
              return (
                <Card
                  key={plan.id}
                  className={`relative ${isCurrent ? 'border-2 border-blue-500 shadow-lg' : ''}`}
                >
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Plan actuel
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="mb-4">
                      <Calendar className="h-10 w-10 mx-auto text-blue-600 mb-3" />
                      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-500">
                        {plan.duration_months} mois
                      </p>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price.toLocaleString('fr-FR')}
                      </span>
                      <span className="text-gray-500 ml-1">{plan.currency}</span>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2 mb-6">
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Accès complet au dashboard
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Publication d&apos;annonces
                      </li>
                      <li className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Gestion des messages
                      </li>
                    </ul>
                    {isCurrent ? (
                      <div className="py-2 px-4 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        Votre plan actuel
                      </div>
                    ) : (
                      <div className="py-2 px-4 bg-gray-50 text-gray-500 rounded-lg text-sm">
                        Contactez l&apos;administration
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Contact info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">
                  Besoin de changer de plan ?
                </p>
                <p className="text-sm text-blue-600">
                  Contactez l&apos;administration pour souscrire, renouveler ou changer votre abonnement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
