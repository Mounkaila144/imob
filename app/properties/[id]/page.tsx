'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  MapPin,
  Home,
  Bed,
  Bath,
  Car,
  Ruler,
  Calendar,
  Eye,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  Building,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useSingleListing } from '@/hooks/useListings';
import Image from 'next/image';
import { useState } from 'react';

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = parseInt(params.id as string);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { listing, loading, error, refetch } = useSingleListing(listingId);

  // Structure: les caractéristiques sont dans listing.characteristics

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
      case 'published': return 'Disponible';
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
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Chargement de la propriété...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
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
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Propriété introuvable
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const photos = listing.photos || [];
  const currentPhoto = photos[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          </div>
        </div>

        {/* Galerie de photos */}
        {photos.length > 0 && (
          <div className="mb-8 space-y-4">
            {/* Photo principale avec navigation */}
            <div className="relative h-96 w-full overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={currentPhoto.url}
                alt={listing.title}
                fill
                className="object-cover"
              />

              {/* Navigation des photos */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>

                  {/* Indicateur de position */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {photos.length}
                  </div>
                </>
              )}
            </div>

            {/* Miniatures */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={`Photo ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

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
                  <p className="text-gray-600">
                    par {listing.price.rent_period === 'monthly' ? 'mois' :
                        listing.price.rent_period === 'weekly' ? 'semaine' : 'jour'}
                  </p>
                )}
                {listing.price?.currency && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p>Prix: {listing.price.amount.toLocaleString()} {listing.price.currency}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {listing.description || 'Aucune description disponible.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Caractéristiques */}
            <Card>
              <CardHeader>
                <CardTitle>Caractéristiques</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const characteristics = [
                    listing.area_size && {
                      icon: <Ruler className="h-5 w-5 text-blue-600" />,
                      bg: "bg-blue-100",
                      value: `${listing.area_size} ${listing.area_unit || 'm²'}`,
                      label: "Superficie"
                    },
                    listing.rooms && {
                      icon: <Home className="h-5 w-5 text-green-600" />,
                      bg: "bg-green-100",
                      value: listing.rooms,
                      label: "Pièces"
                    },
                    listing.bedrooms && {
                      icon: <Bed className="h-5 w-5 text-purple-600" />,
                      bg: "bg-purple-100",
                      value: listing.bedrooms,
                      label: "Chambres"
                    },
                    listing.bathrooms && {
                      icon: <Bath className="h-5 w-5 text-cyan-600" />,
                      bg: "bg-cyan-100",
                      value: listing.bathrooms,
                      label: "Salles de bain"
                    },
                    listing.parking_spaces && {
                      icon: <Car className="h-5 w-5 text-orange-600" />,
                      bg: "bg-orange-100",
                      value: listing.parking_spaces,
                      label: "Places de parking"
                    },
                    listing.floor && {
                      icon: <Building className="h-5 w-5 text-indigo-600" />,
                      bg: "bg-indigo-100",
                      value: listing.floor,
                      label: "Étage"
                    },
                    listing.year_built && {
                      icon: <Calendar className="h-5 w-5 text-yellow-600" />,
                      bg: "bg-yellow-100",
                      value: listing.year_built,
                      label: "Année de construction"
                    }
                  ].filter(Boolean);

                  if (characteristics.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500">
                        <Home className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Aucune caractéristique renseignée</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {characteristics.map((char: any, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${char.bg} rounded-full flex items-center justify-center`}>
                            {char.icon}
                          </div>
                          <div>
                            <p className="font-medium">{char.value}</p>
                            <p className="text-sm text-gray-600">{char.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Informations détaillées */}
            <Card>
              <CardHeader>
                <CardTitle>Informations détaillées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Type de bien</p>
                      <p className="text-lg">{getTypeLabel(listing.property_type)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Type de transaction</p>
                      <p className="text-lg">{listing.type === 'sale' ? 'Vente' : 'Location'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Statut</p>
                      <Badge variant="secondary" className={getStatusColor(listing.status)}>
                        {getStatusLabel(listing.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {(listing as any).available_from && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Disponible à partir du</p>
                        <p className="text-lg">{new Date((listing as any).available_from).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                    {(listing as any).expires_at && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Expire le</p>
                        <p className="text-lg">{new Date((listing as any).expires_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-600">Référence</p>
                      <p className="text-lg">#{listing.id}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Équipements */}
            <Card>
              <CardHeader>
                <CardTitle>Équipements</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.amenities && listing.amenities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity: any) => (
                      <Badge key={amenity.id || amenity.code} variant="outline">
                        {amenity.label || amenity}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucun équipement renseigné</p>
                  </div>
                )}
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
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{listing.location.address_line1}</p>
                    <p className="text-gray-600">{listing.location.city}</p>
                    {listing.location.postal_code && (
                      <p className="text-gray-600">{listing.location.postal_code}</p>
                    )}
                    {(listing.location as any).state && (
                      <p className="text-gray-600">{(listing.location as any).state}</p>
                    )}
                  </div>

                  {listing.location.coordinates && (
                    <div className="text-sm text-gray-500 pt-2 border-t">
                      <p className="font-medium mb-1">Coordonnées GPS:</p>
                      <p>Latitude: {listing.location.coordinates.lat}</p>
                      <p>Longitude: {listing.location.coordinates.lng}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            {listing.owner && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-lg">{listing.owner.name}</p>
                        {listing.owner.company && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Building className="h-4 w-4 mr-1" />
                            {listing.owner.company}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {listing.owner.phone && (
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <a href={`tel:${listing.owner.phone}`}>
                            <Phone className="h-4 w-4 mr-2" />
                            {listing.owner.phone}
                          </a>
                        </Button>
                      )}

                      <Button className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Envoyer un message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <span className="text-gray-600">Publié le</span>
                    <span className="font-medium">
                      {new Date(listing.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {listing.updated_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mis à jour le</span>
                      <span className="font-medium">
                        {new Date(listing.updated_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}