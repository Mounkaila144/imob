'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Home,
  Bed,
  Bath,
  Car,
  Ruler,
  Calendar,
  Eye,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useSingleListing } from '@/hooks/useListings';
import { useState } from 'react';
import { listingsApi } from '@/lib/api';
import { toast } from 'sonner';

export default function ViewPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = parseInt(params.id as string);
  const [deleting, setDeleting] = useState(false);

  const { listing, loading, error, refetch } = useSingleListing(listingId);

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette propriété ?')) {
      return;
    }

    setDeleting(true);
    try {
      await listingsApi.deleteListing(listingId);
      toast.success('Propriété supprimée avec succès');
      router.push('/dashboard/properties');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la propriété...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert variant="destructive">
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
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Propriété introuvable
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="secondary" className={getStatusColor(listing.status)}>
                  {getStatusLabel(listing.status)}
                </Badge>
                <Badge variant="outline">
                  {getTypeLabel(listing.property_type)}
                </Badge>
                <Badge variant="outline">
                  {listing.type === 'sale' ? 'Vente' : 'Location'}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/properties/${listing.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Supprimer
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prix */}
          <Card>
            <CardHeader>
              <CardTitle>Prix</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {listing.price?.formatted || 'Prix non défini'}
              </div>
              {listing.type === 'rent' && listing.price?.rent_period && (
                <p className="text-gray-600">par {listing.price.rent_period}</p>
              )}
              {listing.price?.deposit_amount && (
                <p className="text-sm text-gray-600 mt-2">
                  Dépôt de garantie : {listing.price.deposit_amount.toLocaleString()} {listing.price.currency}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {listing.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Caractéristiques */}
          <Card>
            <CardHeader>
              <CardTitle>Caractéristiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {listing.area_size && (
                  <div className="flex items-center space-x-2">
                    <Ruler className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{listing.area_size} {listing.area_unit}</p>
                      <p className="text-sm text-gray-600">Superficie</p>
                    </div>
                  </div>
                )}
                {listing.rooms && (
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{listing.rooms}</p>
                      <p className="text-sm text-gray-600">Pièces</p>
                    </div>
                  </div>
                )}
                {listing.bedrooms && (
                  <div className="flex items-center space-x-2">
                    <Bed className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{listing.bedrooms}</p>
                      <p className="text-sm text-gray-600">Chambres</p>
                    </div>
                  </div>
                )}
                {listing.bathrooms && (
                  <div className="flex items-center space-x-2">
                    <Bath className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{listing.bathrooms}</p>
                      <p className="text-sm text-gray-600">Salles de bain</p>
                    </div>
                  </div>
                )}
                {listing.parking_spaces && (
                  <div className="flex items-center space-x-2">
                    <Car className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{listing.parking_spaces}</p>
                      <p className="text-sm text-gray-600">Parking</p>
                    </div>
                  </div>
                )}
                {listing.floor && (
                  <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">{listing.floor}</p>
                      <p className="text-sm text-gray-600">Étage</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{listing.location.address_line1}</p>
                <p className="text-gray-600">{listing.location.city}</p>
                {listing.location.postal_code && (
                  <p className="text-gray-600">{listing.location.postal_code}</p>
                )}
                <div className="text-sm text-gray-500 mt-3">
                  <p>Coordonnées GPS:</p>
                  <p>{listing.location.coordinates.lat}, {listing.location.coordinates.lng}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Vues</span>
                  <span className="font-medium">{listing.views_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créé le</span>
                  <span className="font-medium">
                    {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {listing.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modifié le</span>
                    <span className="font-medium">
                      {new Date(listing.updated_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Propriétaire */}
          <Card>
            <CardHeader>
              <CardTitle>Propriétaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{listing.owner.name}</p>
                <p className="text-gray-600">{listing.owner.role}</p>
                {listing.owner.phone && (
                  <p className="text-gray-600">{listing.owner.phone}</p>
                )}
                {listing.owner.company && (
                  <p className="text-gray-600">{listing.owner.company}</p>
                )}
                {listing.owner.member_since && (
                  <p className="text-sm text-gray-500">
                    Membre depuis {new Date(listing.owner.member_since).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}