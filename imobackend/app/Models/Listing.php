<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Listing extends Model
{
    use HasFactory;

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
        'is_featured',
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
        'is_featured' => 'boolean',
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

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
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

    // Boot method to handle model events
    protected static function boot()
    {
        parent::boot();

        // Quand un listing est supprimé (hard delete)
        static::deleting(function ($listing) {
            // Supprimer physiquement les fichiers photos
            $listing->deletePhotoFiles();
        });
    }

    /**
     * Supprimer tous les fichiers photos associés au listing
     */
    public function deletePhotoFiles(): void
    {
        $directories = [];

        foreach ($this->photos as $photo) {
            // Supprimer le fichier physique
            if (Storage::disk($photo->disk)->exists($photo->path)) {
                Storage::disk($photo->disk)->delete($photo->path);

                // Collecter le dossier parent pour nettoyage
                $directory = dirname($photo->path);
                if (!in_array($directory, $directories)) {
                    $directories[] = $directory;
                }
            }
        }

        // Supprimer les dossiers vides
        foreach ($directories as $directory) {
            $this->deleteEmptyDirectory($directory, 'public');
        }
    }

    /**
     * Supprimer un dossier s'il est vide
     */
    private function deleteEmptyDirectory(string $directory, string $disk = 'public'): void
    {
        try {
            // Vérifier si le dossier existe
            if (!Storage::disk($disk)->exists($directory)) {
                return;
            }

            // Lister le contenu du dossier
            $files = Storage::disk($disk)->files($directory);
            $directories = Storage::disk($disk)->directories($directory);

            // Si le dossier est vide (pas de fichiers ni de sous-dossiers)
            if (empty($files) && empty($directories)) {
                Storage::disk($disk)->deleteDirectory($directory);
            }
        } catch (\Exception $e) {
            // Log l'erreur mais ne pas faire échouer la suppression du listing
            \Log::warning("Impossible de supprimer le dossier vide {$directory}: " . $e->getMessage());
        }
    }
}