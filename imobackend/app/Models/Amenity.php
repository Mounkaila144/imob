<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Amenity extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'label',
    ];

    // Relationships
    public function listings(): BelongsToMany
    {
        return $this->belongsToMany(Listing::class, 'amenity_listing');
    }

    // Scopes
    public function scopeByCode($query, $code)
    {
        return $query->where('code', $code);
    }
}