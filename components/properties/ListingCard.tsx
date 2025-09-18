'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ListingResponse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MapPin, Square, BedDouble, Bath, Car } from 'lucide-react';

interface ListingCardProps {
  listing: ListingResponse;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { user } = useAuth();

  const coverPhoto = listing.photos?.find(p => p.is_cover) || listing.photos?.[0];

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

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/properties/${listing.id}`}>
        <div className="relative">
          {coverPhoto ? (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={coverPhoto.url}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          ) : (
            <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Pas d'image</div>
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant={listing.type === 'sale' ? 'default' : 'secondary'}
              className={`px-3 py-1.5 font-semibold text-xs shadow-lg backdrop-blur-sm ${
                listing.type === 'sale'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0'
              }`}
            >
              {listing.type === 'sale' ? 'Vente' : 'Location'}
            </Badge>
            <Badge variant="outline" className="bg-white/95 backdrop-blur-sm border-white/50 text-gray-700 font-medium px-3 py-1.5">
              {getTypeLabel(listing.property_type)}
            </Badge>
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/properties/${listing.id}`}>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {listing.location.city}
              {listing.location.postal_code && `, ${listing.location.postal_code}`}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {listing.area_size && (
                <div className="flex items-center gap-1">
                  <Square className="h-4 w-4" />
                  {listing.area_size} {listing.area_unit || 'm²'}
                </div>
              )}
              {listing.rooms && (
                <div className="flex items-center gap-1">
                  <BedDouble className="h-4 w-4" />
                  {listing.rooms} pièces
                </div>
              )}
              {listing.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {listing.bathrooms}
                </div>
              )}
            </div>

            {listing.amenities && listing.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {listing.amenities.slice(0, 3).map((amenity) => (
                  <Badge key={amenity} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {listing.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{listing.amenities.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-2xl font-bold text-primary">
                {listing.price?.formatted || 'Prix non défini'}
                {listing.type === 'rent' && listing.price?.rent_period && (
                  <span className="text-sm font-normal text-muted-foreground">
                    /{listing.price.rent_period === 'monthly' ? 'mois' :
                      listing.price.rent_period === 'weekly' ? 'semaine' : 'jour'}
                  </span>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                {listing.views_count || 0} vues
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}