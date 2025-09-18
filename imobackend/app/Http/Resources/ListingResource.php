<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'type' => $this->type,
            'property_type' => $this->property_type,
            'status' => $this->status,

            // Prix
            'price' => [
                'amount' => (float) $this->price,
                'currency' => $this->currency,
                'formatted' => $this->formatPrice(),
                'rent_period' => $this->rent_period,
            ],

            // Caractéristiques principales
            'area_size' => $this->area_size ? (float) $this->area_size : null,
            'area_unit' => $this->area_unit,
            'rooms' => $this->rooms,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'parking_spaces' => $this->parking_spaces,
            'floor' => $this->floor,

            // Localisation
            'location' => [
                'address_line1' => $this->address_line1,
                'city' => $this->city,
                'state' => $this->state,
                'postal_code' => $this->postal_code,
                'country_code' => $this->country_code,
                'coordinates' => [
                    'lat' => (float) $this->latitude,
                    'lng' => (float) $this->longitude,
                ],
            ],

            // Dates
            'available_from' => $this->available_from?->format('Y-m-d'),
            'expires_at' => $this->expires_at?->format('Y-m-d H:i:s'),

            // Métadonnées
            'views_count' => $this->views_count,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),

            // Photo de couverture
            'cover_photo' => $this->when(
                $this->relationLoaded('photos') && $this->photos->where('is_cover', true)->first(),
                function () {
                    $coverPhoto = $this->photos->where('is_cover', true)->first();
                    return $coverPhoto ? [
                        'id' => $coverPhoto->id,
                        'url' => $coverPhoto->full_url,
                        'width' => $coverPhoto->width,
                        'height' => $coverPhoto->height,
                    ] : null;
                }
            ),

            // Toutes les photos
            'photos' => $this->when(
                $this->relationLoaded('photos'),
                function () {
                    return $this->photos->map(function ($photo) {
                        return [
                            'id' => $photo->id,
                            'url' => $photo->full_url,
                            'is_cover' => $photo->is_cover,
                            'sort_order' => $photo->sort_order,
                        ];
                    });
                }
            ),

            // Propriétaire (informations limitées)
            'owner' => $this->when(
                $this->relationLoaded('user'),
                function () {
                    return [
                        'id' => $this->user->id,
                        'name' => $this->user->name,
                        'company' => $this->user->profile?->company,
                        'phone' => $this->user->phone,
                    ];
                }
            ),

            // Équipements (codes seulement pour la liste)
            'amenities' => $this->when(
                $this->relationLoaded('amenities'),
                $this->amenities->pluck('code')->toArray()
            ),

            // Distance (si recherche géographique)
            'distance' => $this->when(
                isset($this->distance),
                round($this->distance, 2)
            ),
        ];
    }

    /**
     * Format the price for display
     */
    private function formatPrice(): string
    {
        $symbol = match($this->currency) {
            'EUR' => 'CFA',
            'USD' => '$',
            'GBP' => '£',
            default => $this->currency
        };

        $formattedAmount = number_format($this->price, 0, ',', ' ');

        if ($this->type === 'rent' && $this->rent_period) {
            $period = match($this->rent_period) {
                'monthly' => '/mois',
                'weekly' => '/semaine',
                'daily' => '/jour',
                default => ''
            };
            return $formattedAmount . ' ' . $symbol . $period;
        }

        return $formattedAmount . ' ' . $symbol;
    }
}
