'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MapPin, Square, BedDouble, Bath, Car } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { user } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const mainPhoto = property.photos.find(p => p.isMain) || property.photos[0];

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user?.role === 'buyer') {
      toggleFavorite(property.id);
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          {mainPhoto && (
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={mainPhoto.url}
                alt={mainPhoto.alt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant={property.transactionType === 'sale' ? 'default' : 'secondary'}>
              {property.transactionType === 'sale' ? 'Vente' : 'Location'}
            </Badge>
            <Badge variant="outline" className="bg-white/90">
              {property.type === 'house' ? 'Maison' : 
               property.type === 'apartment' ? 'Appartement' :
               property.type === 'office' ? 'Bureau' : 'Terrain'}
            </Badge>
          </div>

          {user?.role === 'buyer' && (
            <Button
              size="icon"
              variant="ghost"
              className={`absolute top-2 right-2 h-8 w-8 ${
                isFavorite(property.id) 
                  ? 'text-red-500 bg-white/90 hover:bg-white' 
                  : 'text-gray-600 bg-white/70 hover:bg-white/90'
              }`}
              onClick={handleFavoriteClick}
            >
              <Heart className={`h-4 w-4 ${isFavorite(property.id) ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/properties/${property.id}`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {property.title}
              </h3>
            </div>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address.city}, {property.address.zipCode}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                {property.surface} m²
              </div>
              <div className="flex items-center gap-1">
                <BedDouble className="h-4 w-4" />
                {property.rooms} pièces
              </div>
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="h-4 w-4" />
                  {property.bathrooms}
                </div>
              )}
            </div>

            {property.features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {property.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.features.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(property.price)}
                {property.transactionType === 'rent' && (
                  <span className="text-sm font-normal text-muted-foreground">/mois</span>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                {property.viewCount} vues
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}