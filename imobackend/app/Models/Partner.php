<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'logo_path',
        'disk',
        'sort_order',
        'is_active',
        'website_url',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order');
    }

    // Helpers
    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo_path) {
            return null;
        }
        return asset('storage/' . $this->logo_path);
    }

    // Boot method to handle model events
    protected static function boot()
    {
        parent::boot();

        // Quand un partenaire est supprimé
        static::deleting(function ($partner) {
            // Supprimer le fichier logo physique
            $partner->deleteLogoFile();
        });
    }

    /**
     * Supprimer le fichier logo associé à ce partenaire
     */
    public function deleteLogoFile(): bool
    {
        if ($this->logo_path && Storage::disk($this->disk)->exists($this->logo_path)) {
            $result = Storage::disk($this->disk)->delete($this->logo_path);

            // Supprimer le dossier s'il est vide
            $this->deleteEmptyDirectory(dirname($this->logo_path), $this->disk);

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
            if (!Storage::disk($disk)->exists($directory)) {
                return;
            }

            $files = Storage::disk($disk)->files($directory);
            $directories = Storage::disk($disk)->directories($directory);

            if (empty($files) && empty($directories)) {
                Storage::disk($disk)->deleteDirectory($directory);
            }
        } catch (\Exception $e) {
            \Log::warning("Impossible de supprimer le dossier vide {$directory}: " . $e->getMessage());
        }
    }
}
