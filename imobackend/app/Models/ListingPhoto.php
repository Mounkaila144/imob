<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'path',
        'disk',
        'is_cover',
        'sort_order',
        'width',
        'height',
        'size_bytes',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
    ];

    // Relationships
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    // Scopes
    public function scopeCover($query)
    {
        return $query->where('is_cover', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    // Helpers
    public function getFullUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
}