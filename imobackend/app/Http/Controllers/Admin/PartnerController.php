<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Models\Partner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PartnerController extends ApiController
{
    /**
     * List all partners with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'is_active' => 'sometimes|boolean',
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
        ]);

        $query = Partner::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search by name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Order by sort_order
        $query->ordered();

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $partners = $query->paginate($perPage);

        // Transform the data
        $transformedPartners = $partners->getCollection()->map(function ($partner) {
            return $this->formatPartner($partner);
        });

        $partners->setCollection($transformedPartners);

        return $this->paginatedResponse($partners, 'Liste des partenaires récupérée avec succès');
    }

    /**
     * Get all active partners (public endpoint for homepage)
     */
    public function publicIndex(): JsonResponse
    {
        $partners = Partner::active()
            ->ordered()
            ->get()
            ->map(function ($partner) {
                return [
                    'id' => $partner->id,
                    'name' => $partner->name,
                    'logo_url' => $partner->logo_url,
                    'website_url' => $partner->website_url,
                ];
            });

        return $this->successResponse($partners, 'Liste des partenaires récupérée avec succès');
    }

    /**
     * Show specific partner
     */
    public function show(Partner $partner): JsonResponse
    {
        return $this->successResponse(
            $this->formatPartner($partner),
            'Détails du partenaire récupérés avec succès'
        );
    }

    /**
     * Create a new partner
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'logo' => 'required|image|mimes:jpeg,png,jpg,webp,svg|max:2048', // 2MB max
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'website_url' => 'nullable|url|max:255',
        ]);

        // Upload the logo
        $logo = $request->file('logo');
        $filename = Str::uuid() . '.' . $logo->getClientOriginalExtension();
        $path = $logo->storeAs('partners', $filename, 'public');

        // Create the partner
        $partner = Partner::create([
            'name' => $request->name,
            'logo_path' => $path,
            'disk' => 'public',
            'sort_order' => $request->get('sort_order', Partner::max('sort_order') + 1),
            'is_active' => $request->boolean('is_active', true),
            'website_url' => $request->website_url,
        ]);

        return $this->successResponse(
            $this->formatPartner($partner),
            'Partenaire créé avec succès',
            201
        );
    }

    /**
     * Update a partner
     */
    public function update(Request $request, Partner $partner): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:100',
            'logo' => 'sometimes|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
            'sort_order' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'website_url' => 'nullable|url|max:255',
        ]);

        $data = $request->only(['name', 'sort_order', 'is_active', 'website_url']);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo
            $partner->deleteLogoFile();

            // Upload new logo
            $logo = $request->file('logo');
            $filename = Str::uuid() . '.' . $logo->getClientOriginalExtension();
            $path = $logo->storeAs('partners', $filename, 'public');

            $data['logo_path'] = $path;
        }

        // Handle is_active conversion
        if ($request->has('is_active')) {
            $data['is_active'] = $request->boolean('is_active');
        }

        $partner->update($data);

        return $this->successResponse(
            $this->formatPartner($partner->fresh()),
            'Partenaire mis à jour avec succès'
        );
    }

    /**
     * Delete a partner
     */
    public function destroy(Partner $partner): JsonResponse
    {
        // The model's boot method will handle file deletion
        $partner->delete();

        return $this->successResponse(null, 'Partenaire supprimé avec succès');
    }

    /**
     * Reorder partners
     */
    public function reorder(Request $request): JsonResponse
    {
        $request->validate([
            'partners' => 'required|array',
            'partners.*.id' => 'required|exists:partners,id',
            'partners.*.sort_order' => 'required|integer|min:0',
        ]);

        foreach ($request->partners as $partnerData) {
            Partner::where('id', $partnerData['id'])
                ->update(['sort_order' => $partnerData['sort_order']]);
        }

        return $this->successResponse(null, 'Ordre des partenaires mis à jour avec succès');
    }

    /**
     * Toggle partner active status
     */
    public function toggleActive(Partner $partner): JsonResponse
    {
        $partner->update(['is_active' => !$partner->is_active]);

        $message = $partner->is_active
            ? 'Partenaire activé avec succès'
            : 'Partenaire désactivé avec succès';

        return $this->successResponse(
            $this->formatPartner($partner),
            $message
        );
    }

    /**
     * Format partner data for API response
     */
    private function formatPartner(Partner $partner): array
    {
        return [
            'id' => $partner->id,
            'name' => $partner->name,
            'logo_url' => $partner->logo_url,
            'logo_path' => $partner->logo_path,
            'sort_order' => $partner->sort_order,
            'is_active' => $partner->is_active,
            'website_url' => $partner->website_url,
            'created_at' => $partner->created_at,
            'updated_at' => $partner->updated_at,
        ];
    }
}
