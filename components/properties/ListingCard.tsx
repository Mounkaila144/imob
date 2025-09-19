'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ListingResponse } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Heart, MapPin, Square, BedDouble, Bath, Car, MessageCircle } from 'lucide-react';

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

  const handleWhatsAppContact = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const phoneNumber = '70705560';
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre bien: ${listing.title}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="group overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border-0 rounded-xl">
      <Link href={`/properties/${listing.id}`}>
        <div className="relative">
          {coverPhoto ? (
            <div className="relative h-32 w-full overflow-hidden rounded-t-xl">
              <Image
                src={coverPhoto.url}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-32 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-xl">
              <div className="text-gray-400 text-xs">Pas d'image</div>
            </div>
          )}

          <div className="absolute top-2 left-2 flex gap-1">
            <Badge
              variant={listing.type === 'sale' ? 'default' : 'secondary'}
              className={`px-3 py-1.5 font-bold text-xs shadow-lg backdrop-blur-sm border-0 rounded-full ${
                listing.type === 'sale'
                  ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white'
                  : 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 text-white'
              }`}
            >
              {listing.type === 'sale' ? 'Vente' : 'Location'}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              onClick={handleWhatsAppContact}
              className="h-8 w-8 p-0 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg backdrop-blur-sm rounded-full border-2 border-white"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>

      <CardContent className="p-3">
        <Link href={`/properties/${listing.id}`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              {listing.location.city}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {listing.area_size && (
                <div className="flex items-center gap-1">
                  <Square className="h-3 w-3" />
                  {listing.area_size}m²
                </div>
              )}
              {listing.rooms && (
                <div className="flex items-center gap-1">
                  <BedDouble className="h-3 w-3" />
                  {listing.rooms}
                </div>
              )}
            </div>


            <div className="flex items-center justify-between pt-1">
              <div className="text-sm font-bold text-amber-500">
                {listing.price?.amount ? `${listing.price.amount.toLocaleString()} CFA` : 'Prix non défini'}
                {listing.type === 'rent' && listing.price?.rent_period && (
                  <span className="text-xs font-normal text-muted-foreground">
                    /{listing.price.rent_period === 'monthly' ? 'mois' :
                      listing.price.rent_period === 'weekly' ? 'semaine' : 'jour'}
                  </span>
                )}
              </div>
            </div>

            <Button
              onClick={handleWhatsAppContact}
              size="sm"
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs h-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Contacter
            </Button>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}