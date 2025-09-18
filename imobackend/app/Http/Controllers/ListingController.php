<?php

namespace App\Http\Controllers;

use App\Http\Requests\Listing\CreateListingRequest;
use App\Http\Requests\Listing\UpdateListingRequest;
use App\Http\Resources\ListingResource;
use App\Http\Resources\ListingDetailResource;
use App\Models\Listing;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ListingController extends ApiController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Listing::with(['user.profile', 'photos', 'amenities']);

        // Pour les admins connectés, montrer toutes les propriétés
        // Pour les autres, seulement les propriétés publiées
        $user = auth('api')->user();
        if (!$user || !$user->isAdmin()) {
            $query->where('status', 'published');
        }

        // Filtres de recherche
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('property_type')) {
            $query->where('property_type', $request->property_type);
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('rooms')) {
            $query->where('rooms', $request->rooms);
        }

        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', $request->bedrooms);
        }

        // Recherche textuelle
        if ($request->filled('search')) {
            $query->whereFullText(['title', 'description', 'city'], $request->search);
        }

        // Recherche géographique
        if ($request->filled('lat') && $request->filled('lng')) {
            $radius = $request->filled('radius') ? $request->radius : 10;
            $query->withinRadius($request->lat, $request->lng, $radius);
        }

        // Tri
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'distance' && $request->filled('lat') && $request->filled('lng')) {
            // Le tri par distance est déjà géré dans le scope withinRadius
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = min($request->get('per_page', 15), 50); // Max 50 par page
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Annonces récupérées avec succès',
            'data' => ListingResource::collection($listings),
            'pagination' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
                'from' => $listings->firstItem(),
                'to' => $listings->lastItem(),
                'has_more_pages' => $listings->hasMorePages(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(CreateListingRequest $request): JsonResponse
    {
        $user = auth('api')->user();

        // Vérifier que l'utilisateur peut créer des annonces
        if (!$user->isLister() && !$user->isAdmin()) {
            return $this->forbiddenResponse('Seuls les agents immobiliers peuvent créer des annonces');
        }

        $data = $request->validated();

        // Générer le slug
        $data['slug'] = $this->generateUniqueSlug($data['title']);
        $data['user_id'] = $user->id;
        $data['status'] = $user->isAdmin() ? 'published' : 'pending_review';

        // Traiter les features JSON
        if ($request->has('features')) {
            $data['features_json'] = $request->features;
        }

        $listing = Listing::create($data);

        // Associer les équipements
        if ($request->has('amenity_ids')) {
            $listing->amenities()->sync($request->amenity_ids);
        }

        // Log de l'activité
        ActivityLog::log('listing_created', $listing, $user, [
            'property_type' => $listing->property_type,
            'type' => $listing->type,
            'city' => $listing->city,
            'price' => $listing->price
        ]);

        $listing->load(['user.profile', 'photos', 'amenities']);

        return $this->successResponse(
            new ListingDetailResource($listing),
            'Annonce créée avec succès',
            201
        );
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        $listing = Listing::with(['user.profile', 'photos', 'amenities'])
            ->findOrFail($id);

        // Incrémenter le compteur de vues si l'annonce est publiée
        if ($listing->isPublished()) {
            $listing->incrementViews();
        }

        // Log de consultation
        if (auth('api')->check()) {
            ActivityLog::log('listing_viewed', $listing, auth('api')->user(), [
                'property_type' => $listing->property_type,
                'city' => $listing->city
            ]);
        }

        return $this->successResponse(
            new ListingDetailResource($listing),
            'Détail de l\'annonce récupéré avec succès'
        );
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateListingRequest $request, string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);
        $user = auth('api')->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && $listing->user_id !== $user->id) {
            return $this->forbiddenResponse('Vous ne pouvez modifier que vos propres annonces');
        }

        $data = $request->validated();

        // Régénérer le slug si le titre change
        if (isset($data['title']) && $data['title'] !== $listing->title) {
            $data['slug'] = $this->generateUniqueSlug($data['title'], $listing->id);
        }

        // Traiter les features JSON
        if ($request->has('features')) {
            $data['features_json'] = $request->features;
        }

        // Les non-admins ne peuvent pas modifier le statut
        if (!$user->isAdmin() && isset($data['status'])) {
            unset($data['status']);
        }

        $oldData = $listing->toArray();
        $listing->update($data);

        // Associer les équipements
        if ($request->has('amenity_ids')) {
            $listing->amenities()->sync($request->amenity_ids);
        }

        // Log de l'activité
        $changes = array_diff_assoc($data, $oldData);
        ActivityLog::log('listing_updated', $listing, $user, [
            'changed_fields' => array_keys($changes)
        ]);

        $listing->load(['user.profile', 'photos', 'amenities']);

        return $this->successResponse(
            new ListingDetailResource($listing),
            'Annonce mise à jour avec succès'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);
        $user = auth('api')->user();

        // Vérifier les permissions
        if (!$user->isAdmin() && $listing->user_id !== $user->id) {
            return $this->forbiddenResponse('Vous ne pouvez supprimer que vos propres annonces');
        }

        // Log avant suppression
        ActivityLog::log('listing_deleted', $listing, $user, [
            'property_type' => $listing->property_type,
            'city' => $listing->city,
            'title' => $listing->title
        ]);

        // Soft delete
        $listing->delete();

        return $this->successResponse(
            null,
            'Annonce supprimée avec succès'
        );
    }

    /**
     * Get user's own listings
     */
    public function myListings(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        $query = $user->listings()
            ->with(['photos', 'amenities'])
            ->withTrashed(); // Inclure les supprimées

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = min($request->get('per_page', 15), 50);
        $listings = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Vos annonces récupérées avec succès',
            'data' => ListingResource::collection($listings),
            'pagination' => [
                'current_page' => $listings->currentPage(),
                'last_page' => $listings->lastPage(),
                'per_page' => $listings->perPage(),
                'total' => $listings->total(),
                'from' => $listings->firstItem(),
                'to' => $listings->lastItem(),
                'has_more_pages' => $listings->hasMorePages(),
            ]
        ]);
    }

    /**
     * Generate a unique slug for listing
     */
    private function generateUniqueSlug(string $title, ?int $excludeId = null): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $count = 1;

        $query = Listing::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        while ($query->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;

            $query = Listing::where('slug', $slug);
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }
        }

        return $slug;
    }
}