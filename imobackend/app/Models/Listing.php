<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'slug',
        'description',
        'property_type',
        'price',
        'currency',
        'rent_period',
        'deposit_amount',
        'lease_min_months',
        'area_size',
        'area_unit',
        'rooms',
        'bedrooms',
        'bathrooms',
        'parking_spaces',
        'floor',
        'year_built',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'country_code',
        'latitude',
        'longitude',
        'available_from',
        'status',
        'expires_at',
        'views_count',
        'features_json',
    ];

    protected $casts = [
        'available_from' => 'date',
        'expires_at' => 'datetime',
        'features_json' => 'array',
        'price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'area_size' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function photos(): HasMany
    {
        return $this->hasMany(ListingPhoto::class);
    }

    public function coverPhoto(): HasMany
    {
        return $this->hasMany(ListingPhoto::class)->where('is_cover', true);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'amenity_listing');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class);
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites')
            ->withTimestamps();
    }

    public function reports(): HasMany
    {
        return $this->hasMany(ListingReport::class);
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeForSale($query)
    {
        return $query->where('type', 'sale');
    }

    public function scopeForRent($query)
    {
        return $query->where('type', 'rent');
    }

    public function scopeByPropertyType($query, $type)
    {
        return $query->where('property_type', $type);
    }

    public function scopeInCity($query, $city)
    {
        return $query->where('city', $city);
    }

    public function scopePriceBetween($query, $min, $max)
    {
        return $query->whereBetween('price', [$min, $max]);
    }

    public function scopeWithinRadius($query, $lat, $lng, $radius = 10)
    {
        $haversine = "(6371 * acos(cos(radians(?))
                     * cos(radians(latitude))
                     * cos(radians(longitude) - radians(?))
                     + sin(radians(?))
                     * sin(radians(latitude))))";

        return $query
            ->selectRaw("{$haversine} AS distance", [$lat, $lng, $lat])
            ->whereRaw("{$haversine} < ?", [$lat, $lng, $lat, $radius])
            ->orderBy('distance');
    }

    // Helpers
    public function isForSale(): bool
    {
        return $this->type === 'sale';
    }

    public function isForRent(): bool
    {
        return $this->type === 'rent';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }
}