'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, AlertCircle, Loader2 } from 'lucide-react';
import { listingsApi, CreateListingRequest } from '@/lib/api';
import { useSingleListing } from '@/hooks/useListings';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

const editListingSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  type: z.enum(['sale', 'rent']),
  property_type: z.enum(['apartment', 'house', 'villa', 'land', 'office', 'shop', 'warehouse', 'other']),
  price: z.number().min(1, 'Le prix doit être supérieur à 0'),
  currency: z.string().default('EUR'),
  area_size: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().min(1, 'La superficie doit être supérieure à 0').optional()),
  area_unit: z.string().default('m2'),
  rooms: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().min(0).optional()),
  bedrooms: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().min(0).optional()),
  bathrooms: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().min(0).optional()),
  parking_spaces: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().min(0).optional()),
  floor: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().optional()),
  year_built: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().min(1800).max(new Date().getFullYear()).optional()),
  address_line1: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  postal_code: z.preprocess((val) => val === null || val === undefined ? '' : val, z.string().optional()),
  latitude: z.number(),
  longitude: z.number(),
  rent_period: z.string().optional(),
  deposit_amount: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().optional()),
  lease_min_months: z.preprocess((val) => val === "" || val === null || val === undefined ? undefined : Number(val), z.number().optional()),
}).refine((data) => {
  // Pour les locations, certains champs peuvent être requis mais on les laisse optionnels
  // La validation côté serveur se chargera des contraintes métier
  return true;
});

type EditListingFormData = z.infer<typeof editListingSchema>;

interface Photo {
  id: number;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = parseInt(params.id as string);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const { listing, loading: fetchingListing, error: fetchError, refetch } = useSingleListing(listingId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EditListingFormData>({
    resolver: zodResolver(editListingSchema),
  });

  const watchType = watch('type');

  // Populate form when listing data is loaded
  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        description: listing.description || '',
        type: listing.type,
        property_type: listing.property_type,
        price: listing.price.amount,
        currency: listing.price.currency,
        area_size: listing.characteristics?.area_size,
        area_unit: listing.characteristics?.area_unit || 'm2',
        rooms: listing.characteristics?.rooms,
        bedrooms: listing.characteristics?.bedrooms,
        bathrooms: listing.characteristics?.bathrooms,
        parking_spaces: listing.characteristics?.parking_spaces,
        floor: listing.characteristics?.floor,
        year_built: listing.characteristics?.year_built,
        address_line1: listing.location.address_line1,
        city: listing.location.city,
        postal_code: listing.location.postal_code || '',
        latitude: listing.location.coordinates.lat,
        longitude: listing.location.coordinates.lng,
        rent_period: listing.price.rent_period || '',
        deposit_amount: listing.price.deposit_amount || undefined,
        lease_min_months: listing.price.lease_min_months || undefined,
      });

      // Charger les photos existantes
      if (listing.photos) {
        const formattedPhotos: Photo[] = listing.photos.map(photo => ({
          id: photo.id,
          url: photo.url,
          is_cover: photo.is_cover,
          sort_order: photo.sort_order,
        }));
        setPhotos(formattedPhotos);
      }
    }
  }, [listing, reset]);

  // Fonctions pour gérer les photos
  const handlePhotoUpload = async (files: File[]) => {
    return await listingsApi.uploadPhotos(listingId, files);
  };

  const handlePhotoDelete = async (photoId: number) => {
    await listingsApi.deletePhoto(listingId, photoId);
  };

  const handleSetCoverPhoto = async (photoId: number) => {
    await listingsApi.setCoverPhoto(listingId, photoId);
  };

  const onSubmit = async (data: EditListingFormData) => {
    try {
      setLoading(true);
      setError('');

      const listingData: Partial<CreateListingRequest> = {
        title: data.title,
        description: data.description,
        type: data.type,
        property_type: data.property_type,
        price: data.price,
        currency: data.currency,
        area_size: data.area_size,
        area_unit: data.area_unit,
        rooms: data.rooms,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parking_spaces: data.parking_spaces,
        floor: data.floor,
        year_built: data.year_built,
        address_line1: data.address_line1,
        city: data.city,
        postal_code: data.postal_code,
        latitude: data.latitude,
        longitude: data.longitude,
        rent_period: data.type === 'rent' ? data.rent_period : undefined,
        deposit_amount: data.type === 'rent' ? data.deposit_amount : undefined,
        lease_min_months: data.type === 'rent' ? data.lease_min_months : undefined,
      };

      await listingsApi.updateListing(listingId, listingData);
      toast.success('Propriété modifiée avec succès !');
      router.push('/dashboard/properties');
    } catch (err: any) {
      console.error('Error updating listing:', err);
      setError(err.message || 'Erreur lors de la modification de la propriété');
      toast.error('Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingListing) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement de la propriété...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {fetchError}
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
      <div className="p-6 max-w-4xl mx-auto">
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
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
            <h1 className="text-3xl font-bold text-gray-900">Modifier la Propriété</h1>
            <p className="mt-2 text-gray-600">
              Modifiez les informations de votre annonce
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Modifiez les informations de votre propriété
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de l'annonce *</Label>
              <Input
                id="title"
                placeholder="Ex: Bel appartement 3 pièces centre-ville"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre propriété en détail..."
                rows={4}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type d'annonce *</Label>
                <Select
                  value={watchType}
                  onValueChange={(value: 'sale' | 'rent') => setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">Vente</SelectItem>
                    <SelectItem value="rent">Location</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_type">Type de propriété *</Label>
                <Select
                  value={watch('property_type')}
                  onValueChange={(value) => setValue('property_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">Appartement</SelectItem>
                    <SelectItem value="house">Maison</SelectItem>
                    <SelectItem value="villa">Villa</SelectItem>
                    <SelectItem value="land">Terrain</SelectItem>
                    <SelectItem value="office">Bureau</SelectItem>
                    <SelectItem value="shop">Commerce</SelectItem>
                    <SelectItem value="warehouse">Entrepôt</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
                {errors.property_type && (
                  <p className="text-sm text-red-600">{errors.property_type.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prix */}
        <Card>
          <CardHeader>
            <CardTitle>Prix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Prix * (EUR)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="150000"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && (
                  <p className="text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>

              {watchType === 'rent' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rent_period">Période</Label>
                    <Select
                      value={watch('rent_period')}
                      onValueChange={(value) => setValue('rent_period', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensuel</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="daily">Journalier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deposit_amount">Dépôt de garantie (EUR)</Label>
                    <Input
                      id="deposit_amount"
                      type="number"
                      placeholder="1500"
                      {...register('deposit_amount', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lease_min_months">Durée minimum (mois)</Label>
                    <Input
                      id="lease_min_months"
                      type="number"
                      placeholder="12"
                      {...register('lease_min_months', { valueAsNumber: true })}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Caractéristiques */}
        <Card>
          <CardHeader>
            <CardTitle>Caractéristiques</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area_size">Superficie</Label>
                <div className="flex space-x-2">
                  <Input
                    id="area_size"
                    type="number"
                    placeholder="75"
                    className="flex-1"
                    {...register('area_size', { valueAsNumber: true })}
                  />
                  <Select
                    value={watch('area_unit')}
                    onValueChange={(value) => setValue('area_unit', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m2">m²</SelectItem>
                      <SelectItem value="ha">ha</SelectItem>
                      <SelectItem value="ft2">ft²</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.area_size && (
                  <p className="text-sm text-red-600">{errors.area_size.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="rooms">Nombre de pièces</Label>
                <Input
                  id="rooms"
                  type="number"
                  placeholder="3"
                  {...register('rooms', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Chambres</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="2"
                  {...register('bedrooms', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Salles de bain</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="1"
                  {...register('bathrooms', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking_spaces">Places de parking</Label>
                <Input
                  id="parking_spaces"
                  type="number"
                  placeholder="1"
                  {...register('parking_spaces', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Étage</Label>
                <Input
                  id="floor"
                  type="number"
                  placeholder="2"
                  {...register('floor', { valueAsNumber: true })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year_built">Année de construction</Label>
                <Input
                  id="year_built"
                  type="number"
                  placeholder="2010"
                  {...register('year_built', { valueAsNumber: true })}
                />
                {errors.year_built && (
                  <p className="text-sm text-red-600">{errors.year_built.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Localisation */}
        <Card>
          <CardHeader>
            <CardTitle>Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1">Adresse *</Label>
              <Input
                id="address_line1"
                placeholder="123 Rue de la Paix"
                {...register('address_line1')}
              />
              {errors.address_line1 && (
                <p className="text-sm text-red-600">{errors.address_line1.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="Paris"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-sm text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input
                  id="postal_code"
                  placeholder="75001"
                  {...register('postal_code')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="48.8566"
                  {...register('latitude', { valueAsNumber: true })}
                />
                {errors.latitude && (
                  <p className="text-sm text-red-600">{errors.latitude.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="2.3522"
                  {...register('longitude', { valueAsNumber: true })}
                />
                {errors.longitude && (
                  <p className="text-sm text-red-600">{errors.longitude.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Photos de la propriété</CardTitle>
            <CardDescription>
              Gérez les photos de votre propriété
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              listingId={listingId}
              photos={photos}
              onPhotosChange={setPhotos}
              onUpload={handlePhotoUpload}
              onDelete={handlePhotoDelete}
              onSetCover={handleSetCoverPhoto}
              maxPhotos={10}
              disabled={loading}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Modification...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Modifier la propriété
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}