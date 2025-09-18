<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\ListingPhoto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ListingPhotoController extends ApiController
{
    /**
     * Upload photos for a listing
     */
    public function store(Request $request, string $listingId): JsonResponse
    {
        $request->validate([
            'photos' => 'required|array|max:10',
            'photos.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // 5MB max
        ]);

        $listing = Listing::findOrFail($listingId);
        $user = auth('api')->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && $listing->user_id !== $user->id) {
            return $this->forbiddenResponse('Vous ne pouvez modifier que vos propres annonces');
        }

        $uploadedPhotos = [];
        $currentPhotoCount = $listing->photos()->count();

        foreach ($request->file('photos') as $index => $photo) {
            // Vérifier la limite totale de photos
            if ($currentPhotoCount + count($uploadedPhotos) >= 10) {
                break;
            }

            // Générer un nom unique pour l'image
            $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();

            // Stocker l'image
            $path = $photo->storeAs('listings/' . $listingId, $filename, 'public');

            // Obtenir les dimensions de l'image
            $imageInfo = getimagesize($photo->getRealPath());
            $width = $imageInfo[0] ?? null;
            $height = $imageInfo[1] ?? null;

            // Créer l'enregistrement en base
            $listingPhoto = ListingPhoto::create([
                'listing_id' => $listing->id,
                'path' => $path,
                'disk' => 'public',
                'is_cover' => $currentPhotoCount === 0 && $index === 0, // Première photo = cover
                'sort_order' => $currentPhotoCount + $index,
                'width' => $width,
                'height' => $height,
                'size_bytes' => $photo->getSize(),
            ]);

            $uploadedPhotos[] = [
                'id' => $listingPhoto->id,
                'url' => $listingPhoto->full_url,
                'is_cover' => $listingPhoto->is_cover,
                'sort_order' => $listingPhoto->sort_order,
            ];
        }

        return $this->successResponse(
            $uploadedPhotos,
            count($uploadedPhotos) . ' photo(s) uploadée(s) avec succès'
        );
    }

    /**
     * Delete a photo
     */
    public function destroy(string $listingId, string $photoId): JsonResponse
    {
        $listing = Listing::findOrFail($listingId);
        $user = auth('api')->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && $listing->user_id !== $user->id) {
            return $this->forbiddenResponse('Vous ne pouvez modifier que vos propres annonces');
        }

        $photo = ListingPhoto::where('listing_id', $listingId)
            ->where('id', $photoId)
            ->firstOrFail();

        // Supprimer le fichier physique
        if ($photo->path && Storage::disk($photo->disk)->exists($photo->path)) {
            Storage::disk($photo->disk)->delete($photo->path);
        }

        // Si c'était la photo de couverture, définir la suivante comme couverture
        if ($photo->is_cover) {
            $nextPhoto = ListingPhoto::where('listing_id', $listingId)
                ->where('id', '!=', $photo->id)
                ->orderBy('sort_order')
                ->first();

            if ($nextPhoto) {
                $nextPhoto->update(['is_cover' => true]);
            }
        }

        $photo->delete();

        return $this->successResponse(null, 'Photo supprimée avec succès');
    }

    /**
     * Set cover photo
     */
    public function setCover(string $listingId, string $photoId): JsonResponse
    {
        $listing = Listing::findOrFail($listingId);
        $user = auth('api')->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && $listing->user_id !== $user->id) {
            return $this->forbiddenResponse('Vous ne pouvez modifier que vos propres annonces');
        }

        // Retirer le statut cover de toutes les photos
        ListingPhoto::where('listing_id', $listingId)
            ->update(['is_cover' => false]);

        // Définir la nouvelle photo de couverture
        $photo = ListingPhoto::where('listing_id', $listingId)
            ->where('id', $photoId)
            ->firstOrFail();

        $photo->update(['is_cover' => true]);

        return $this->successResponse(null, 'Photo de couverture définie avec succès');
    }

    /**
     * Reorder photos
     */
    public function reorder(Request $request, string $listingId): JsonResponse
    {
        $request->validate([
            'photos' => 'required|array',
            'photos.*.id' => 'required|exists:listing_photos,id',
            'photos.*.sort_order' => 'required|integer|min:0',
        ]);

        $listing = Listing::findOrFail($listingId);
        $user = auth('api')->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && $listing->user_id !== $user->id) {
            return $this->forbiddenResponse('Vous ne pouvez modifier que vos propres annonces');
        }

        foreach ($request->photos as $photoData) {
            ListingPhoto::where('listing_id', $listingId)
                ->where('id', $photoData['id'])
                ->update(['sort_order' => $photoData['sort_order']]);
        }

        return $this->successResponse(null, 'Ordre des photos mis à jour avec succès');
    }
}