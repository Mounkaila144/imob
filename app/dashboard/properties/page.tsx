'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  MoreVertical,
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMyListings, useListingStats } from '@/hooks/useListings';
import { toast } from 'sonner';

export default function MyPropertiesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { listings, loading, error, refetch, deleteListing } = useMyListings({
    status: statusFilter === 'all' ? undefined : statusFilter,
    type: typeFilter === 'all' ? undefined : (typeFilter as 'sale' | 'rent'),
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 50,
  });

  const stats = useListingStats(listings);

  // Filtrage côté client pour la recherche
  const filteredListings = (listings || []).filter(listing => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return listing.title.toLowerCase().includes(search) ||
           listing.location.city.toLowerCase().includes(search) ||
           listing.location.address_line1.toLowerCase().includes(search);
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'villa': return 'Villa';
      case 'office': return 'Bureau';
      case 'shop': return 'Commerce';
      case 'warehouse': return 'Entrepôt';
      case 'land': return 'Terrain';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'rented': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Publié';
      case 'pending': return 'En attente';
      case 'draft': return 'Brouillon';
      case 'suspended': return 'Suspendu';
      case 'sold': return 'Vendu';
      case 'rented': return 'Loué';
      default: return status;
    }
  };

  const formatPrice = (listing: any) => {
    if (listing.price && listing.price.formatted) {
      return listing.price.formatted;
    }
    return '---';
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteListing(id);
      toast.success('Propriété supprimée avec succès');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Propriétés</h1>
            <p className="mt-2 text-gray-600">
              Gérez vos annonces immobilières
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/properties/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Propriété
          </Button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              className="ml-2"
              onClick={refetch}
            >
              Réessayer
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-gray-900">
                {loading ? '-' : stats.totalListings}
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
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '-' : stats.totalViews.toLocaleString()}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Vues totales
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '-' : Math.round(stats.averageViews)}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Vues moyennes
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-600">
                {loading ? '-' : (listings || []).filter(l => l.status === 'published').length}
              </div>
              <div className="ml-2 text-sm text-gray-600">
                Publiées
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par titre ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="sale">Vente</SelectItem>
                <SelectItem value="rent">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des propriétés */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            Liste de vos Propriétés
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            {loading ? 'Chargement...' : `${filteredListings.length} propriété(s) trouvée(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && listings.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Chargement des propriétés...</span>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune propriété trouvée</p>
              <Button
                className="mt-4"
                onClick={() => router.push('/dashboard/properties/create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première propriété
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Propriété</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {listing.photos && listing.photos.length > 0 ? (
                          <img
                            src={listing.photos.find(photo => photo.is_cover)?.url || listing.photos[0]?.url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400 text-xs text-center">
                            Pas d'image
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{listing.title}</div>
                        <div className="text-sm text-gray-500">
                          {listing.location.city}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(listing.property_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {formatPrice(listing)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.type === 'sale' ? 'Vente' : 'Location'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(listing.status)}>
                        {getStatusLabel(listing.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{listing.views_count || 0} vues</div>
                        {listing.area_size && (
                          <div>{listing.area_size} {listing.area_unit}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/properties/${listing.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/properties/${listing.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDeleteListing(listing.id)}
                          disabled={deletingId === listing.id}
                        >
                          {deletingId === listing.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}