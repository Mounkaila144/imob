'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, XCircle, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionStatusCard() {
  const { subscription, loading, isActive, isExpired, isExpiringSoon, daysRemaining } = useSubscription();
  const router = useRouter();

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-500">Vérification de l&apos;abonnement...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No subscription
  if (!subscription) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Aucun abonnement actif</p>
                <p className="text-sm text-red-600">
                  Vous devez souscrire à un abonnement pour accéder au dashboard.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/dashboard/subscription')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Voir les plans
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expired subscription
  if (isExpired) {
    return (
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Abonnement expiré</p>
                <p className="text-sm text-red-600">
                  Votre abonnement {subscription.plan.name} a expiré le{' '}
                  {new Date(subscription.ends_at).toLocaleDateString('fr-FR')}.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/dashboard/subscription')}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Renouveler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Expiring soon
  if (isExpiringSoon) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-semibold text-yellow-800">Abonnement expirant bientôt</p>
                <p className="text-sm text-yellow-600">
                  Votre abonnement {subscription.plan.name} expire dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => router.push('/dashboard/subscription')}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Renouveler
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Active subscription
  if (isActive && subscription) {
    const startDate = new Date(subscription.starts_at);
    const endDate = new Date(subscription.ends_at);
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = totalDays - daysRemaining;
    const progressPercent = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">Abonnement actif</p>
                <p className="text-sm text-green-600">
                  Plan {subscription.plan.name} &mdash; {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/subscription')}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Détails
            </Button>
          </div>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-xs text-green-600">
            <span>{startDate.toLocaleDateString('fr-FR')}</span>
            <span>{endDate.toLocaleDateString('fr-FR')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
