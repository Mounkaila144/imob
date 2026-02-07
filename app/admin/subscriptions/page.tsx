'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminSubscriptions } from '@/hooks/useAdminSubscriptions';
import { useAuth } from '@/hooks/useAuth';
import { Subscription, SubscriptionPlan } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, Plus, RefreshCw, AlertTriangle, Eye, Clock, XCircle, CalendarPlus, User, Settings, Check, DollarSign,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface SellerResult {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile?: { company?: string | null };
}

export default function AdminSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [editingPlans, setEditingPlans] = useState<Record<number, { name: string; price: string; currency: string; is_active: boolean }>>({});
  const [savingPlanId, setSavingPlanId] = useState<number | null>(null);

  // Create form state
  const [newUserId, setNewUserId] = useState('');
  const [newPlanId, setNewPlanId] = useState('');
  const [newStartsAt, setNewStartsAt] = useState(() => new Date().toISOString().split('T')[0]);

  // Seller search state
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellerResults, setSellerResults] = useState<SellerResult[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<SellerResult | null>(null);
  const [sellerSearchLoading, setSellerSearchLoading] = useState(false);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const sellerDropdownRef = useRef<HTMLDivElement>(null);

  // Extend form state
  const [extendPlanId, setExtendPlanId] = useState('');

  const { toast } = useToast();
  const { token } = useAuth();

  const {
    subscriptions: subscriptionsData,
    statistics,
    plans,
    loading,
    error,
    fetchSubscriptions,
    fetchStatistics,
    fetchPlans,
    createSubscription,
    extendSubscription,
    cancelSubscription,
    updatePlan,
  } = useAdminSubscriptions();

  const subscriptionsList = subscriptionsData?.data || [];
  const finalStatistics = statistics || {
    total: 0,
    active: 0,
    expired: 0,
    cancelled: 0,
    expiring_soon: 0,
    revenue: 0,
  };

  // Seller search
  const searchSellers = useCallback(async (query: string) => {
    if (!token || query.length < 2) {
      setSellerResults([]);
      return;
    }

    setSellerSearchLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const params = new URLSearchParams({ search: query, role: 'lister', per_page: '10' });
      const res = await fetch(`${apiUrl}/admin/users?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const json = await res.json();
      setSellerResults(json.data || []);
    } catch {
      setSellerResults([]);
    } finally {
      setSellerSearchLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (sellerSearch.length >= 2) {
        searchSellers(sellerSearch);
        setShowSellerDropdown(true);
      } else {
        setSellerResults([]);
        setShowSellerDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [sellerSearch, searchSellers]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sellerDropdownRef.current && !sellerDropdownRef.current.contains(e.target as Node)) {
        setShowSellerDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSeller = (seller: SellerResult) => {
    setSelectedSeller(seller);
    setNewUserId(seller.id.toString());
    setSellerSearch('');
    setShowSellerDropdown(false);
  };

  const handleClearSeller = () => {
    setSelectedSeller(null);
    setNewUserId('');
    setSellerSearch('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'expired': return 'Expiré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getDaysRemaining = (endsAt: string) => {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const openPlansModal = () => {
    const initial: Record<number, { name: string; price: string; currency: string; is_active: boolean }> = {};
    plans.forEach((plan) => {
      initial[plan.id] = {
        name: plan.name,
        price: plan.price.toString(),
        currency: plan.currency,
        is_active: plan.is_active,
      };
    });
    setEditingPlans(initial);
    setShowPlansModal(true);
  };

  const handleSavePlan = async (planId: number) => {
    const edited = editingPlans[planId];
    if (!edited) return;

    const price = parseFloat(edited.price);
    if (isNaN(price) || price < 0) {
      toast({ title: 'Erreur', description: 'Le prix doit être un nombre positif', variant: 'destructive' });
      return;
    }

    setSavingPlanId(planId);
    try {
      await updatePlan(planId, {
        name: edited.name,
        price,
        currency: edited.currency,
        is_active: edited.is_active,
      });
      toast({ title: 'Plan mis à jour', description: `Le plan "${edited.name}" a été mis à jour` });
      await fetchPlans();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : 'Impossible de mettre à jour le plan',
        variant: 'destructive',
      });
    } finally {
      setSavingPlanId(null);
    }
  };

  const updateEditingPlan = (planId: number, field: string, value: string | boolean) => {
    setEditingPlans((prev) => ({
      ...prev,
      [planId]: { ...prev[planId], [field]: value },
    }));
  };

  const handleRefresh = async () => {
    try {
      await fetchSubscriptions({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        plan_id: planFilter !== 'all' ? parseInt(planFilter) : undefined,
      });
      await fetchStatistics();
      toast({
        title: 'Données actualisées',
        description: 'La liste des abonnements a été rafraîchie',
      });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible d'actualiser les données",
        variant: 'destructive',
      });
    }
  };

  const handleCreate = async () => {
    if (!selectedSeller || !newPlanId || !newStartsAt) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un vendeur, un plan et une date de début',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createSubscription({
        user_id: selectedSeller.id,
        plan_id: parseInt(newPlanId),
        starts_at: newStartsAt,
      });
      toast({
        title: 'Abonnement créé',
        description: `Abonnement créé pour ${selectedSeller.name}`,
      });
      setShowCreateModal(false);
      setNewUserId('');
      setNewPlanId('');
      setNewStartsAt(new Date().toISOString().split('T')[0]);
      setSelectedSeller(null);
      setSellerSearch('');
      await fetchSubscriptions();
      await fetchStatistics();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : "Impossible de créer l'abonnement",
        variant: 'destructive',
      });
    }
  };

  const handleExtend = async () => {
    if (!selectedSubscription || !extendPlanId) return;

    try {
      await extendSubscription(selectedSubscription.id, parseInt(extendPlanId));
      toast({
        title: 'Abonnement prolongé',
        description: `L'abonnement de ${selectedSubscription.user.name} a été prolongé`,
      });
      setShowExtendModal(false);
      setExtendPlanId('');
      await fetchSubscriptions();
      await fetchStatistics();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : "Impossible de prolonger l'abonnement",
        variant: 'destructive',
      });
    }
  };

  const handleCancel = async () => {
    if (!selectedSubscription) return;

    try {
      await cancelSubscription(selectedSubscription.id);
      toast({
        title: 'Abonnement annulé',
        description: `L'abonnement de ${selectedSubscription.user.name} a été annulé`,
      });
      setShowCancelModal(false);
      await fetchSubscriptions();
      await fetchStatistics();
    } catch (err) {
      toast({
        title: 'Erreur',
        description: err instanceof Error ? err.message : "Impossible d'annuler l'abonnement",
        variant: 'destructive',
      });
    }
  };

  // Debounced filters
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSubscriptions({
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        plan_id: planFilter !== 'all' ? parseInt(planFilter) : undefined,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, planFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Gestion des Abonnements</h1>
            <p className="mt-2 text-gray-400">
              Gérez les abonnements des vendeurs de la plateforme
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="outline" onClick={openPlansModal}>
              <DollarSign className="h-4 w-4 mr-2" />
              Tarifs
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Abonnement
            </Button>
          </div>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-400 font-medium">Erreur API</span>
          </div>
          <p className="text-gray-300 mt-2">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-100">{finalStatistics.total}</div>
              <div className="ml-2 text-sm text-gray-400">Total abonnements</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-400">{finalStatistics.active}</div>
              <div className="ml-2 text-sm text-gray-400">Actifs</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-red-400">{finalStatistics.expired}</div>
              <div className="ml-2 text-sm text-gray-400">Expirés</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-yellow-400">{finalStatistics.expiring_soon}</div>
              <div className="ml-2 text-sm text-gray-400">Expirant bientôt</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou email du vendeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actif</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-gray-700 border-gray-600 text-gray-100">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les plans</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id.toString()}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-100">Liste des Abonnements</CardTitle>
              <CardDescription className="text-gray-400">
                {subscriptionsList.length} abonnement(s) trouvé(s)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Utilisateur</TableHead>
                <TableHead className="text-gray-300">Plan</TableHead>
                <TableHead className="text-gray-300">Statut</TableHead>
                <TableHead className="text-gray-300">Date début</TableHead>
                <TableHead className="text-gray-300">Date fin</TableHead>
                <TableHead className="text-gray-300">Jours restants</TableHead>
                <TableHead className="text-right text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-400">Chargement des abonnements...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : subscriptionsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="text-gray-400">
                      {error ? 'Impossible de charger les abonnements' : 'Aucun abonnement trouvé'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                subscriptionsList.map((sub) => {
                  const days = getDaysRemaining(sub.ends_at);
                  const isExpiringSoon = sub.status === 'active' && days <= 7;
                  return (
                    <TableRow key={sub.id} className="border-gray-700 hover:bg-gray-700">
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-100">{sub.user.name}</div>
                          <div className="text-sm text-gray-400">{sub.user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {sub.plan.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getStatusColor(sub.status)}>
                          {getStatusLabel(sub.status)}
                        </Badge>
                        {isExpiringSoon && (
                          <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                            Bientôt
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(sub.starts_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(sub.ends_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {sub.status === 'active' ? (
                          <span className={isExpiringSoon ? 'text-yellow-400 font-medium' : ''}>
                            {days} jour{days > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSubscription(sub);
                              setShowDetailsModal(true);
                            }}
                            title="Voir les détails"
                            className="text-gray-400 hover:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {sub.status === 'active' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscription(sub);
                                  setExtendPlanId('');
                                  setShowExtendModal(true);
                                }}
                                title="Prolonger"
                                className="text-gray-400 hover:text-green-400"
                              >
                                <CalendarPlus className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubscription(sub);
                                  setShowCancelModal(true);
                                }}
                                title="Annuler"
                                className="text-gray-400 hover:text-red-400"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Nouvel Abonnement</DialogTitle>
            <DialogDescription className="text-gray-400">
              Créer un abonnement pour un vendeur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div ref={sellerDropdownRef}>
              <Label className="text-gray-300">Vendeur</Label>
              {selectedSeller ? (
                <div className="flex items-center justify-between bg-gray-700 border border-gray-600 rounded-md px-3 py-2 mt-1">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-100">{selectedSeller.name}</p>
                      <p className="text-xs text-gray-400">{selectedSeller.email} — ID: {selectedSeller.id}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSeller}
                    className="text-gray-400 hover:text-red-400 h-7 w-7 p-0"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par email, nom..."
                    value={sellerSearch}
                    onChange={(e) => setSellerSearch(e.target.value)}
                    onFocus={() => { if (sellerResults.length > 0) setShowSellerDropdown(true); }}
                    className="pl-10 bg-gray-700 border-gray-600 text-gray-100"
                  />
                  {sellerSearchLoading && (
                    <RefreshCw className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  {showSellerDropdown && sellerResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {sellerResults.map((seller) => (
                        <button
                          key={seller.id}
                          type="button"
                          onClick={() => handleSelectSeller(seller)}
                          className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-600 transition-colors text-left"
                        >
                          <div className="bg-blue-600/20 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-100 truncate">{seller.name}</p>
                            <p className="text-xs text-gray-400 truncate">{seller.email} — ID: {seller.id}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {showSellerDropdown && sellerSearch.length >= 2 && !sellerSearchLoading && sellerResults.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg px-3 py-4 text-center">
                      <p className="text-sm text-gray-400">Aucun vendeur trouvé</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div>
              <Label className="text-gray-300">Plan</Label>
              <Select value={newPlanId} onValueChange={setNewPlanId}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} — {plan.price} {plan.currency} / {plan.duration_months} mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Date de début</Label>
              <Input
                type="date"
                value={newStartsAt}
                onChange={(e) => setNewStartsAt(e.target.value)}
                className="bg-gray-700 border-gray-600 text-gray-100"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Détails de l&apos;abonnement</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informations complètes sur l&apos;abonnement
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Utilisateur</Label>
                  <p className="text-gray-100 font-medium">{selectedSubscription.user.name}</p>
                  <p className="text-sm text-gray-400">{selectedSubscription.user.email}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Plan</Label>
                  <p className="text-gray-100 font-medium">{selectedSubscription.plan.name}</p>
                  <p className="text-sm text-gray-400">
                    {selectedSubscription.plan.price} {selectedSubscription.plan.currency} / {selectedSubscription.plan.duration_months} mois
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">Statut</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className={getStatusColor(selectedSubscription.status)}>
                      {getStatusLabel(selectedSubscription.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-300">Jours restants</Label>
                  <p className="text-gray-100 font-medium">
                    {selectedSubscription.status === 'active'
                      ? `${getDaysRemaining(selectedSubscription.ends_at)} jours`
                      : '-'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">Date de début</Label>
                  <p className="text-gray-100">
                    {new Date(selectedSubscription.starts_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">Date de fin</Label>
                  <p className="text-gray-100">
                    {new Date(selectedSubscription.ends_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              {selectedSubscription.cancelled_at && (
                <div>
                  <Label className="text-gray-300">Annulé le</Label>
                  <p className="text-gray-100">
                    {new Date(selectedSubscription.cancelled_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Dialog */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Prolonger l&apos;abonnement</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedSubscription
                ? `Prolonger l'abonnement de ${selectedSubscription.user.name}`
                : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Nouveau plan</Label>
              <Select value={extendPlanId} onValueChange={setExtendPlanId}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name} — {plan.price} {plan.currency} / {plan.duration_months} mois
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendModal(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleExtend} disabled={loading || !extendPlanId}>
              {loading ? 'Prolongation...' : 'Prolonger'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Annuler l&apos;abonnement</DialogTitle>
            <DialogDescription className="text-gray-400">
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          {selectedSubscription && (
            <div className="space-y-4">
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                  <span className="text-red-400 font-medium">Attention</span>
                </div>
                <p className="text-gray-300 mt-2">
                  Êtes-vous sûr de vouloir annuler l&apos;abonnement de{' '}
                  <strong>{selectedSubscription.user.name}</strong> ?
                </p>
                <p className="text-gray-400 mt-1 text-sm">
                  Plan actuel : {selectedSubscription.plan.name} — Expire le{' '}
                  {new Date(selectedSubscription.ends_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)} disabled={loading}>
              Retour
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? 'Annulation...' : "Confirmer l'annulation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plans Management Dialog */}
      <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
        <DialogContent className="max-w-3xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Gestion des tarifs
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Modifiez les prix et noms des plans d&apos;abonnement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {plans.map((plan) => {
              const edited = editingPlans[plan.id];
              if (!edited) return null;

              const hasChanges =
                edited.name !== plan.name ||
                edited.price !== plan.price.toString() ||
                edited.currency !== plan.currency ||
                edited.is_active !== plan.is_active;

              return (
                <div
                  key={plan.id}
                  className="bg-gray-700/50 border border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-900/40 text-blue-300">
                        {plan.duration_months} mois
                      </Badge>
                      <span className="text-xs text-gray-500">ID: {plan.id}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <span className="text-xs text-gray-400">Actif</span>
                        <button
                          type="button"
                          onClick={() => updateEditingPlan(plan.id, 'is_active', !edited.is_active)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            edited.is_active ? 'bg-green-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              edited.is_active ? 'translate-x-4.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label className="text-xs text-gray-400">Nom du plan</Label>
                      <Input
                        value={edited.name}
                        onChange={(e) => updateEditingPlan(plan.id, 'name', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-gray-100 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Prix</Label>
                      <Input
                        type="number"
                        min="0"
                        step="100"
                        value={edited.price}
                        onChange={(e) => updateEditingPlan(plan.id, 'price', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-gray-100 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-400">Devise</Label>
                      <Input
                        value={edited.currency}
                        onChange={(e) => updateEditingPlan(plan.id, 'currency', e.target.value)}
                        className="bg-gray-700 border-gray-600 text-gray-100 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      Actuel : {plan.price.toLocaleString('fr-FR')} {plan.currency}
                      {edited.price !== plan.price.toString() && (
                        <span className="text-yellow-400 ml-2">
                          → {parseFloat(edited.price || '0').toLocaleString('fr-FR')} {edited.currency}
                        </span>
                      )}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => handleSavePlan(plan.id)}
                      disabled={!hasChanges || savingPlanId === plan.id}
                      className={hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    >
                      {savingPlanId === plan.id ? (
                        <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      {savingPlanId === plan.id ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>
              );
            })}

            {plans.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                Aucun plan trouvé
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlansModal(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
