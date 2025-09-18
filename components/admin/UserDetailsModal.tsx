'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Activity,
  Eye,
  X
} from 'lucide-react';

interface UserDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  email_verified_at: string | null;
  last_login_ip: string | null;
  profile: {
    avatar_path: string | null;
    company: string | null;
    about: string | null;
  };
  stats: {
    listings_count: number;
    inquiries_count: number;
    deals_count: number;
  };
  detailed_stats?: {
    total_listings: number;
    active_listings: number;
    total_inquiries: number;
    pending_inquiries: number;
    total_deals: number;
    completed_deals: number;
  };
  recent_activity?: Array<{
    action: string;
    subject_type: string;
    subject_id: number;
    properties: any;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface UserDetailsModalProps {
  user: UserDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'lister': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Détails de l'utilisateur</DialogTitle>
              <DialogDescription>
                Informations complètes et statistiques de {user.name}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Informations personnelles */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informations Personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nom</label>
                    <div className="text-sm font-medium">{user.name}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <div className="text-sm">{user.email}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Téléphone</label>
                    <div className="text-sm">{user.phone || 'Non renseigné'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Entreprise</label>
                    <div className="text-sm">{user.profile.company || 'Non renseignée'}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge className={getRoleColor(user.role)}>
                    {user.role === 'lister' ? 'Agent' : user.role === 'client' ? 'Client' : 'Admin'}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status === 'active' ? 'Actif' :
                     user.status === 'pending' ? 'En attente' : 'Suspendu'}
                  </Badge>
                </div>

                {user.profile.about && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <div className="text-sm mt-1 p-3 bg-gray-50 rounded-lg">
                      {user.profile.about}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiques détaillées */}
            {user.detailed_stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Statistiques Détaillées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {user.detailed_stats.total_listings}
                      </div>
                      <div className="text-sm text-gray-600">Annonces totales</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {user.detailed_stats.active_listings}
                      </div>
                      <div className="text-sm text-gray-600">Annonces actives</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {user.detailed_stats.total_inquiries}
                      </div>
                      <div className="text-sm text-gray-600">Demandes totales</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {user.detailed_stats.pending_inquiries}
                      </div>
                      <div className="text-sm text-gray-600">En attente</div>
                    </div>
                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">
                        {user.detailed_stats.total_deals}
                      </div>
                      <div className="text-sm text-gray-600">Transactions</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {user.detailed_stats.completed_deals}
                      </div>
                      <div className="text-sm text-gray-600">Complétées</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activité récente */}
            {user.recent_activity && user.recent_activity.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {user.recent_activity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <Activity className="h-4 w-4 text-gray-400 mt-1" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">
                            {activity.action.replace('_', ' ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(activity.created_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Informations techniques */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Informations Techniques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Utilisateur</label>
                  <div className="text-sm font-mono">{user.id}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Email vérifié</label>
                  <div className="text-sm">
                    {user.email_verified_at ? (
                      <span className="text-green-600">✓ Vérifié le {formatDate(user.email_verified_at)}</span>
                    ) : (
                      <span className="text-red-600">✗ Non vérifié</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Dernière IP de connexion</label>
                  <div className="text-sm font-mono">{user.last_login_ip || 'Jamais connecté'}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Inscription</label>
                  <div className="text-sm">{formatDate(user.created_at)}</div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Dernière modification</label>
                  <div className="text-sm">{formatDate(user.updated_at)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Annonces</span>
                  <span className="text-sm font-medium">{user.stats.listings_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Demandes</span>
                  <span className="text-sm font-medium">{user.stats.inquiries_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transactions</span>
                  <span className="text-sm font-medium">{user.stats.deals_count}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}