<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingDetailResource extends JsonResource
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
            'description' => $this->description,
            'type' => $this->type,
            'property_type' => $this->property_type,
            'status' => $this->status,
            'is_featured' => $this->is_featured ?? false,

            // Prix et conditions
            'price' => [
                'amount' => (float) $this->price,
                'currency' => $this->currency,
                'formatted' => $this->formatPrice(),
                'rent_period' => $this->rent_period,
                'deposit_amount' => $this->deposit_amount ? (float) $this->deposit_amount : null,
                'lease_min_months' => $this->lease_min_months,
            ],

            // Caractéristiques complètes
            'characteristics' => [
                'area_size' => $this->area_size ? (float) $this->area_size : null,
                'area_unit' => $this->area_unit,
                'rooms' => $this->rooms,
                'bedrooms' => $this->bedrooms,
                'bathrooms' => $this->bathrooms,
                'parking_spaces' => $this->parking_spaces,
                'floor' => $this->floor,
                'year_built' => $this->year_built,
            ],

            // Localisation complète
            'location' => [
                'address_line1' => $this->address_line1,
                'address_line2' => $this->address_line2,
                'city' => $this->city,
                'state' => $this->state,
                'postal_code' => $this->postal_code,
                'country_code' => $this->country_code,
                'coordinates' => [
                    'lat' => (float) $this->latitude,
                    'lng' => (float) $this->longitude,
                ],
                'full_address' => $this->getFullAddress(),
            ],

            // Dates
            'dates' => [
                'available_from' => $this->available_from?->format('Y-m-d'),
                'expires_at' => $this->expires_at?->format('Y-m-d H:i:s'),
                'created_at' => $this->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            ],

            // Métadonnées
            'metadata' => [
                'views_count' => $this->views_count,
                'features' => $this->features_json,
                'is_favorite' => $this->when(
                    auth()->check(),
                    function () {
                        return auth()->user()->favorites()
                            ->where('listing_id', $this->id)
                            ->exists();
                    }
                ),
            ],

            // Photos complètes
            'photos' => $this->when(
                $this->relationLoaded('photos'),
                function () {
                    return $this->photos->map(function ($photo) {
                        return [
                            'id' => $photo->id,
                            'url' => $photo->getFullUrlAttribute(),
                            'is_cover' => $photo->is_cover,
                            'sort_order' => $photo->sort_order,
                            'width' => $photo->width,
                            'height' => $photo->height,
                            'size_bytes' => $photo->size_bytes,
                        ];
                    })->sortBy('sort_order')->values();
                }
            ),

            // Propriétaire complet
            'owner' => $this->when(
                $this->relationLoaded('user'),
                function () {
                    return [
                        'id' => $this->user->id,
                        'name' => $this->user->name,
                        'email' => $this->when(
                            auth()->check() && (auth()->user()->isAdmin() || auth()->id() === $this->user_id),
                            $this->user->email
                        ),
                        'phone' => $this->user->phone,
                        'company' => $this->user->profile?->company,
                        'about' => $this->user->profile?->about,
                        'avatar' => $this->user->profile?->avatar_path,
                        'role' => $this->user->role,
                        'member_since' => $this->user->created_at->format('Y-m-d'),
                    ];
                }
            ),

            // Équipements complets
            'amenities' => $this->when(
                $this->relationLoaded('amenities'),
                function () {
                    return $this->amenities->map(function ($amenity) {
                        return [
                            'id' => $amenity->id,
                            'code' => $amenity->code,
                            'label' => $amenity->label,
                        ];
                    });
                }
            ),

            // Distance (si recherche géographique)
            'distance' => $this->when(
                isset($this->distance),
                round($this->distance, 2)
            ),

            // Actions possibles pour l'utilisateur connecté
            'permissions' => $this->when(
                auth()->check(),
                function () {
                    $user = auth()->user();
                    return [
                        'can_edit' => $user->isAdmin() || $this->user_id === $user->id,
                        'can_delete' => $user->isAdmin() || $this->user_id === $user->id,
                        'can_contact' => $user->isClient() && $this->user_id !== $user->id,
                        'can_favorite' => $user->isClient(),
                        'can_report' => $this->user_id !== $user->id,
                    ];
                }
            ),
        ];
    }

    /**
     * Format the price for display
     */
    private function formatPrice(): string
    {
        $symbol = match($this->currency) {
            'XOF' => 'CFA',
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

    /**
     * Get full formatted address
     */
    private function getFullAddress(): string
    {
        $parts = array_filter([
            $this->address_line1,
            $this->address_line2,
            $this->postal_code,
            $this->city,
            $this->state,
        ]);

        return implode(', ', $parts);
    }
}
