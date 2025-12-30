'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { listingsApi, CreateListingRequest } from '@/lib/api';
import { ImageUpload } from '@/components/ui/image-upload';
import { toast } from 'sonner';

const createListingSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  type: z.enum(['sale', 'rent']),
  property_type: z.enum(['apartment', 'house', 'villa', 'land', 'office', 'shop', 'warehouse', 'other']),
  price: z.number().min(1, 'Le prix doit être supérieur à 0'),
  currency: z.string().default('XOF'),
  area_size: z.number().min(1, 'La superficie doit être supérieure à 0').optional(),
  area_unit: z.string().default('m2'),
  rooms: z.number().min(0).optional(),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  parking_spaces: z.number().min(0).optional(),
  floor: z.number().optional(),
  year_built: z.number().min(1800).max(new Date().getFullYear()).optional(),
  address_line1: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  postal_code: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  rent_period: z.enum(['monthly', 'weekly', 'daily']).optional(),
  deposit_amount: z.number().min(0).optional(),
  lease_min_duration: z.number().min(1).optional(),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

interface Photo {
  id: number;
  url: string;
  is_cover: boolean;
  sort_order: number;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      currency: 'XOF',
      area_unit: 'm2',
      latitude: 48.8566, // Paris par défaut
      longitude: 2.3522,
    },
  });

  const watchType = watch('type');
  const watchPropertyType = watch('property_type');

  const onSubmit = async (data: CreateListingFormData) => {
    try {
      setLoading(true);
      setError('');

      const listingData: CreateListingRequest = {
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

      // Créer la propriété
      const createdListing = await listingsApi.createListing(listingData);

      // Uploader les photos si il y en a
      if (photos.length > 0) {
        // Convertir les URLs blob en fichiers pour l'upload
        const photoFiles: File[] = [];
        for (const photo of photos) {
          if (photo.url.startsWith('blob:')) {
            try {
              const response = await fetch(photo.url);
              const blob = await response.blob();
              const file = new File([blob], `photo-${photo.id}.jpg`, { type: 'image/jpeg' });
              photoFiles.push(file);
            } catch (err) {
              console.warn('Could not convert photo to file:', err);
            }
          }
        }

        if (photoFiles.length > 0) {
          try {
            await listingsApi.uploadPhotos(createdListing.id, photoFiles);
          } catch (photoErr) {
            console.warn('Photos upload failed:', photoErr);
            toast.error('Propriété créée mais erreur lors de l\'upload des photos');
          }
        }
      }

      toast.success('Propriété créée avec succès !');
      router.push('/dashboard/properties');
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Erreur lors de la création de la propriété');
      toast.error('Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeLabel = (type: string) => {
    switch (type) {
      case 'apartment': return 'Appartement';
      case 'house': return 'Maison';
      case 'villa': return 'Villa';
      case 'land': return 'Terrain';
      case 'office': return 'Bureau';
      case 'shop': return 'Commerce';
      case 'warehouse': return 'Entrepôt';
      case 'other': return 'Autre';
      default: return type;
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Nouvelle Propriété</h1>
            <p className="mt-2 text-gray-600">
              Créez une nouvelle annonce immobilière
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
              Décrivez votre propriété
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
                <Select onValueChange={(value: 'sale' | 'rent') => setValue('type', value)}>
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
                <Select onValueChange={(value) => setValue('property_type', value as any)}>
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
                <Label htmlFor="price">Prix * (CFA)</Label>
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
                    <Select onValueChange={(value) => setValue('rent_period', value)}>
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
                    <Label htmlFor="deposit_amount">Dépôt de garantie (CFA)</Label>
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
              Ajoutez des photos pour rendre votre annonce plus attractive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              photos={photos}
              onPhotosChange={setPhotos}
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer la propriété
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}