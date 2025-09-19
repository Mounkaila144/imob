'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminProperties } from '@/hooks/useAdminProperties';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Settings,
  PlayCircle,
  PauseCircle,
  EyeOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';


export default function AdminPropertiesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'publish' | 'unpublish' | 'suspend' | 'delete' | 'change_status'>('publish');
  const [newStatus, setNewStatus] = useState('');
  const { toast } = useToast();

  const {
    properties: propertiesData,
    statistics: apiStatistics,
    loading,
    error,
    fetchProperties,
    fetchStatistics,
    updatePropertyStatus,
    deleteProperty
  } = useAdminProperties();

  // Utiliser uniquement les données de l'API
  const properties = propertiesData?.data || [];
  const finalStatistics = apiStatistics || {
    total_properties: 0,
    by_status: { published: 0, draft: 0, pending: 0, suspended: 0, sold: 0, rented: 0 },
    by_type: { sale: 0, rent: 0 },
    by_property_type: { apartment: 0, house: 0, villa: 0, land: 0, office: 0, shop: 0, warehouse: 0, other: 0 },
    total_views: 0,
  };

  const filteredProperties = properties;

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'villa': return 'Villa';
      case 'office': return 'Bureau';
      case 'land': return 'Terrain';
      case 'shop': return 'Commerce';
      case 'warehouse': return 'Entrepôt';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'pending': return 'En attente';
      case 'draft': return 'Brouillon';
      case 'sold': return 'Vendu';
      case 'rented': return 'Loué';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const formatPrice = (price: any, transactionType: string) => {
    if (typeof price === 'object' && price.formatted) {
      return transactionType === 'rent' && price.rent_period ?
        `${price.formatted}/${price.rent_period}` : price.formatted;
    }

    const formatted = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(typeof price === 'number' ? price : price?.amount || 0);

    return transactionType === 'rent' ? `${formatted}/mois` : formatted;
  };

  const handlePropertyAction = (action: string, propertyId: number) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    setSelectedProperty(property);

    if (action === 'view') {
      setShowDetailsModal(true);
    } else if (action === 'publish') {
      setActionType('publish');
      setShowActionModal(true);
    } else if (action === 'unpublish') {
      setActionType('unpublish');
      setShowActionModal(true);
    } else if (action === 'suspend') {
      setActionType('suspend');
      setShowActionModal(true);
    } else if (action === 'delete') {
      setActionType('delete');
      setShowActionModal(true);
    } else if (action === 'change_status') {
      setActionType('change_status');
      setNewStatus(property.status);
      setShowActionModal(true);
    }
  };

  const handlePublish = async () => {
    if (!selectedProperty) return;

    try {
      await updatePropertyStatus(selectedProperty.id, 'published');
      toast({
        title: 'Propriété publiée',
        description: `${selectedProperty.title} a été publiée et est maintenant visible`,
      });
      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de publier la propriété',
        variant: 'destructive',
      });
    }
  };

  const handleUnpublish = async () => {
    if (!selectedProperty) return;

    try {
      await updatePropertyStatus(selectedProperty.id, 'draft');
      toast({
        title: 'Propriété dépubliée',
        description: `${selectedProperty.title} a été retirée de la publication`,
      });
      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de dépublier la propriété',
        variant: 'destructive',
      });
    }
  };

  const handleSuspend = async () => {
    if (!selectedProperty) return;

    try {
      await updatePropertyStatus(selectedProperty.id, 'suspended');
      toast({
        title: 'Propriété suspendue',
        description: `${selectedProperty.title} a été suspendue`,
      });
      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de suspendre la propriété',
        variant: 'destructive',
      });
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedProperty || !newStatus) {
      return;
    }

    try {
      await updatePropertyStatus(selectedProperty.id, newStatus);

      let description = `Le statut de ${selectedProperty.title} a été changé en ${getStatusLabel(newStatus)}`;

      // Avertir l'utilisateur si le statut a été mappé vers un autre dans l'API
      if (newStatus === 'suspended') {
        description += ' (sauvegardé comme brouillon dans l\'API)';
      } else if (newStatus === 'sold' || newStatus === 'rented') {
        description += ' (maintenu comme publié dans l\'API)';
      }

      toast({
        title: 'Statut mis à jour',
        description,
      });

      // Mettre à jour l'objet selectedProperty pour refléter le changement
      setSelectedProperty({ ...selectedProperty, status: newStatus });

      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de changer le statut',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedProperty) return;

    try {
      await deleteProperty(selectedProperty.id);
      toast({
        title: 'Propriété supprimée',
        description: `${selectedProperty.title} a été supprimée avec succès`,
      });
      await fetchProperties();
      setShowActionModal(false);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de supprimer la propriété',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchProperties({ search: searchTerm, property_type: typeFilter, status: statusFilter, type: transactionFilter });
      await fetchStatistics();
      toast({
        title: 'Données actualisées',
        description: 'La liste des propriétés a été rafraîchie',
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'actualiser les données',
        variant: 'destructive',
      });
    }
  };

  // Appliquer les filtres via l'API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProperties({
        search: searchTerm || undefined,
        property_type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: transactionFilter !== 'all' ? transactionFilter : undefined
      });
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter, statusFilter, transactionFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Propriétés</h1>
            <p className="mt-2 text-gray-600">
              Gérez toutes les annonces immobilières de la plateforme
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Banner d'information si erreur API */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-800 font-medium">Erreur API</span>
          </div>
          <p className="text-red-700 mt-2">
            {error}
          </p>
          <p className="text-red-600 mt-2 text-sm">
            Vérifiez votre connexion ou contactez l'administrateur.
          </p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                {finalStatistics.total_properties}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Total propriétés
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {finalStatistics.by_status.published}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Publiées
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-yellow-600">
                {finalStatistics.by_status.pending}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                En attente
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                {finalStatistics.total_views}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Vues totales
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et actions */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres et Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre, ville ou propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="apartment">Appartement</SelectItem>
                <SelectItem value="house">Maison</SelectItem>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="office">Bureau</SelectItem>
                <SelectItem value="land">Terrain</SelectItem>
                <SelectItem value="shop">Commerce</SelectItem>
                <SelectItem value="warehouse">Entrepôt</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Transaction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="sale">Vente</SelectItem>
                <SelectItem value="rent">Location</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="suspended">Suspendu</SelectItem>
                <SelectItem value="sold">Vendu</SelectItem>
                <SelectItem value="rented">Loué</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des propriétés */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Propriétés</CardTitle>
          <CardDescription>
            {filteredProperties.length} propriété(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriété</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Vues</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin text-gray-400" />
                      <span className="text-gray-500">Chargement des propriétés...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProperties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="text-gray-500">
                      {error ? 'Impossible de charger les propriétés' : 'Aucune propriété trouvée'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProperties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{property.title}</div>
                        <div className="text-sm text-gray-500">{property.location?.city}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(property.property_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatPrice(property.price, property.type)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.type === 'sale' ? 'Vente' : 'Location'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={getStatusColor(property.status)}>
                          {getStatusLabel(property.status)}
                        </Badge>
                        {property.status === 'pending' && (
                          <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            En attente d'approbation
                          </div>
                        )}
                        {property.status === 'published' && (
                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            Visible publiquement
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{property.owner?.name}</TableCell>
                    <TableCell>{property.views_count || 0}</TableCell>
                    <TableCell>{new Date(property.created_at).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePropertyAction('view', property.id)}
                          title="Voir les détails"
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Actions de statut */}
                        {property.status !== 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handlePropertyAction('publish', property.id)}
                            title="Publier"
                          >
                            <PlayCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {property.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700"
                            onClick={() => handlePropertyAction('unpublish', property.id)}
                            title="Dépublier"
                          >
                            <PauseCircle className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handlePropertyAction('change_status', property.id)}
                          title="Changer le statut"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>

                        {property.status !== 'suspended' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600 hover:text-yellow-700"
                            onClick={() => handlePropertyAction('suspend', property.id)}
                            title="Suspendre"
                          >
                            <EyeOff className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handlePropertyAction('delete', property.id)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Détails Propriété */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Détails de la propriété</DialogTitle>
            <DialogDescription>
              Informations complètes sur la propriété sélectionnée
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Titre</Label>
                  <p className="font-medium">{selectedProperty.title}</p>
                </div>
                <div>
                  <Label>Type de propriété</Label>
                  <p>{getTypeLabel(selectedProperty.property_type)}</p>
                </div>
                <div>
                  <Label>Type de transaction</Label>
                  <p>{selectedProperty.type === 'sale' ? 'Vente' : 'Location'}</p>
                </div>
                <div>
                  <Label>Prix</Label>
                  <p className="font-medium">{formatPrice(selectedProperty.price, selectedProperty.type)}</p>
                </div>
                <div>
                  <Label>Statut</Label>
                  <Badge variant="secondary" className={getStatusColor(selectedProperty.status)}>
                    {getStatusLabel(selectedProperty.status)}
                  </Badge>
                </div>
                <div>
                  <Label>Propriétaire</Label>
                  <p>{selectedProperty.owner?.name}</p>
                </div>
                <div>
                  <Label>Ville</Label>
                  <p>{selectedProperty.location?.city}</p>
                </div>
                <div>
                  <Label>Adresse</Label>
                  <p>{selectedProperty.location?.address_line1}</p>
                </div>
                <div>
                  <Label>Surface</Label>
                  <p>{selectedProperty.area_size ? `${selectedProperty.area_size} ${selectedProperty.area_unit || 'm²'}` : '-'}</p>
                </div>
                <div>
                  <Label>Vues</Label>
                  <p>{selectedProperty.views_count || 0}</p>
                </div>
                <div>
                  <Label>Date de création</Label>
                  <p>{new Date(selectedProperty.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <Label>Dernière modification</Label>
                  <p>{selectedProperty.updated_at ? new Date(selectedProperty.updated_at).toLocaleDateString('fr-FR') : '-'}</p>
                </div>
              </div>

              {selectedProperty.description && (
                <div>
                  <Label>Description</Label>
                  <p className="mt-2 text-sm text-gray-600">{selectedProperty.description}</p>
                </div>
              )}

              {selectedProperty.photos && selectedProperty.photos.length > 0 && (
                <div>
                  <Label>Photos ({selectedProperty.photos.length})</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {selectedProperty.photos.slice(0, 8).map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.url}
                        alt="Photo de la propriété"
                        className="w-full h-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
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

      {/* Modal Actions Propriété */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'delete' ? 'Supprimer la propriété' :
               actionType === 'publish' ? 'Publier la propriété' :
               actionType === 'unpublish' ? 'Dépublier la propriété' :
               actionType === 'suspend' ? 'Suspendre la propriété' :
               'Changer le statut de la propriété'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'delete'
                ? 'Cette action est irréversible. La propriété sera définitivement supprimée.'
                : actionType === 'publish'
                ? 'Cette propriété sera publiée et visible par tous les utilisateurs.'
                : actionType === 'unpublish'
                ? 'Cette propriété sera retirée de la publication et ne sera plus visible publiquement.'
                : actionType === 'suspend'
                ? 'Cette propriété sera suspendue et ne sera plus visible.'
                : 'Sélectionnez le nouveau statut pour cette propriété.'
              }
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-4">
              <div>
                <Label>Propriété</Label>
                <p className="font-medium">{selectedProperty.title}</p>
                <p className="text-sm text-gray-500">{selectedProperty.location?.city}</p>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Statut actuel : </span>
                  <Badge variant="secondary" className={getStatusColor(selectedProperty.status)}>
                    {getStatusLabel(selectedProperty.status)}
                  </Badge>
                </div>
              </div>

              {actionType === 'change_status' && (
                <div>
                  <Label htmlFor="status">Nouveau statut</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="suspended">Suspendu *</SelectItem>
                      <SelectItem value="sold">Vendu *</SelectItem>
                      <SelectItem value="rented">Loué *</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500 mt-2">
                    Le changement de statut prendra effet immédiatement.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    * Ces statuts sont adaptés pour l'API (suspendu → brouillon, vendu/loué → publié)
                  </p>
                </div>
              )}

              {actionType === 'delete' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-800 font-medium">Attention</span>
                  </div>
                  <p className="text-red-700 mt-2">
                    Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action supprimera également :
                  </p>
                  <ul className="text-red-600 mt-2 ml-4 list-disc">
                    <li>Toutes les photos ({selectedProperty.photos?.length || 0})</li>
                    <li>L'historique des vues ({selectedProperty.views_count || 0})</li>
                    <li>Toutes les données associées</li>
                  </ul>
                </div>
              )}

              {actionType === 'publish' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-800 font-medium">Publication</span>
                  </div>
                  <p className="text-green-700 mt-2">
                    Cette propriété sera visible sur le site public et accessible à tous les visiteurs.
                  </p>
                </div>
              )}

              {actionType === 'unpublish' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <PauseCircle className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-orange-800 font-medium">Dépublication</span>
                  </div>
                  <p className="text-orange-700 mt-2">
                    Cette propriété sera retirée du site public et sauvegardée en brouillon.
                  </p>
                </div>
              )}

              {actionType === 'suspend' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <EyeOff className="h-5 w-5 text-yellow-500 mr-2" />
                    <span className="text-yellow-800 font-medium">Suspension</span>
                  </div>
                  <p className="text-yellow-700 mt-2">
                    Cette propriété sera suspendue temporairement et ne sera plus visible.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)} disabled={loading}>
              Annuler
            </Button>
            {actionType === 'delete' ? (
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                {loading ? 'Suppression...' : 'Supprimer'}
              </Button>
            ) : actionType === 'publish' ? (
              <Button onClick={handlePublish} disabled={loading}>
                {loading ? 'Publication...' : 'Publier'}
              </Button>
            ) : actionType === 'unpublish' ? (
              <Button variant="secondary" onClick={handleUnpublish} disabled={loading}>
                {loading ? 'Dépublication...' : 'Dépublier'}
              </Button>
            ) : actionType === 'suspend' ? (
              <Button variant="destructive" onClick={handleSuspend} disabled={loading}>
                {loading ? 'Suspension...' : 'Suspendre'}
              </Button>
            ) : actionType === 'change_status' ? (
              <Button onClick={handleChangeStatus} disabled={loading || newStatus === selectedProperty?.status}>
                {loading ? 'Mise à jour...' : 'Changer le statut'}
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}