<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

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

    // Boot method to handle model events
    protected static function boot()
    {
        parent::boot();

        // Quand une photo est supprimée
        static::deleting(function ($photo) {
            // Supprimer le fichier physique
            if (Storage::disk($photo->disk)->exists($photo->path)) {
                Storage::disk($photo->disk)->delete($photo->path);

                // Supprimer le dossier s'il est vide
                $photo->deleteEmptyDirectory(dirname($photo->path), $photo->disk);
            }
        });
    }

    /**
     * Supprimer le fichier physique associé à cette photo
     */
    public function deleteFile(): bool
    {
        if (Storage::disk($this->disk)->exists($this->path)) {
            $result = Storage::disk($this->disk)->delete($this->path);

            // Supprimer le dossier s'il est vide
            $this->deleteEmptyDirectory(dirname($this->path), $this->disk);

            return $result;
        }
        return true;
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
            // Log l'erreur mais ne pas faire échouer la suppression
            \Log::warning("Impossible de supprimer le dossier vide {$directory}: " . $e->getMessage());
        }
    }
}