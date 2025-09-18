<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends ApiController
{
    /**
     * List all users with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'role' => 'sometimes|in:admin,lister,client',
            'status' => 'sometimes|in:active,suspended,pending',
            'search' => 'sometimes|string|max:255',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'sort_by' => 'sometimes|in:id,name,email,role,status,created_at',
            'sort_order' => 'sometimes|in:asc,desc',
        ]);

        $query = User::with('profile');

        // Apply filters
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('profile', function($subQuery) use ($search) {
                      $subQuery->where('company', 'like', "%{$search}%");
                  });
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Paginate results
        $perPage = $request->get('per_page', 15);
        $users = $query->paginate($perPage);

        // Transform the data
        $transformedUsers = $users->getCollection()->map(function ($user) {
            return $this->formatUserForAdmin($user);
        });

        $users->setCollection($transformedUsers);

        return $this->paginatedResponse($users, 'Liste des utilisateurs récupérée avec succès');
    }

    /**
     * Show specific user details
     */
    public function show(User $user): JsonResponse
    {
        $user->load(['profile', 'listings', 'inquiries', 'dealsAsClient', 'dealsAsAdmin', 'activityLogs' => function($query) {
            $query->latest()->limit(10);
        }]);

        return $this->successResponse(
            $this->formatUserDetailForAdmin($user),
            'Détails de l\'utilisateur récupérés avec succès'
        );
    }

    /**
     * Update user status (activate/suspend)
     */
    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'status' => ['required', Rule::in(['active', 'suspended', 'pending'])],
            'reason' => 'sometimes|string|max:500',
        ]);

        $oldStatus = $user->status;
        $newStatus = $request->status;

        if ($oldStatus === $newStatus) {
            return $this->errorResponse('L\'utilisateur a déjà ce statut', 422);
        }

        // Prevent admin from suspending themselves
        if ($user->id === auth()->id() && $newStatus === 'suspended') {
            return $this->errorResponse('Vous ne pouvez pas vous suspendre vous-même', 422);
        }

        $user->update(['status' => $newStatus]);

        // Log the activity
        ActivityLog::log(
            'user_status_changed',
            $user,
            auth()->user(),
            [
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
                'reason' => $request->reason ?? null,
            ]
        );

        $statusMessages = [
            'active' => 'Utilisateur activé avec succès',
            'suspended' => 'Utilisateur suspendu avec succès',
            'pending' => 'Utilisateur mis en attente avec succès',
        ];

        return $this->successResponse(
            $this->formatUserForAdmin($user->fresh()),
            $statusMessages[$newStatus]
        );
    }

    /**
     * Update user role
     */
    public function updateRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => ['required', Rule::in(['admin', 'lister', 'client'])],
            'reason' => 'sometimes|string|max:500',
        ]);

        $oldRole = $user->role;
        $newRole = $request->role;

        if ($oldRole === $newRole) {
            return $this->errorResponse('L\'utilisateur a déjà ce rôle', 422);
        }

        // Prevent admin from demoting themselves if they are the only admin
        if ($user->id === auth()->id() && $oldRole === 'admin' && $newRole !== 'admin') {
            $adminCount = User::where('role', 'admin')->where('status', 'active')->count();
            if ($adminCount <= 1) {
                return $this->errorResponse('Vous ne pouvez pas modifier votre rôle car vous êtes le seul administrateur actif', 422);
            }
        }

        $user->update(['role' => $newRole]);

        // Log the activity
        ActivityLog::log(
            'user_role_changed',
            $user,
            auth()->user(),
            [
                'old_role' => $oldRole,
                'new_role' => $newRole,
                'reason' => $request->reason ?? null,
            ]
        );

        $roleMessages = [
            'admin' => 'Utilisateur promu administrateur avec succès',
            'lister' => 'Utilisateur défini comme agent immobilier avec succès',
            'client' => 'Utilisateur défini comme client avec succès',
        ];

        return $this->successResponse(
            $this->formatUserForAdmin($user->fresh()),
            $roleMessages[$newRole]
        );
    }

    /**
     * Delete user account
     */
    public function destroy(User $user): JsonResponse
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
            return $this->errorResponse('Vous ne pouvez pas supprimer votre propre compte', 422);
        }

        // Prevent deletion if it's the last active admin
        if ($user->role === 'admin' && $user->status === 'active') {
            $adminCount = User::where('role', 'admin')->where('status', 'active')->count();
            if ($adminCount <= 1) {
                return $this->errorResponse('Impossible de supprimer le dernier administrateur actif', 422);
            }
        }

        // Store user data for logging before deletion
        $userData = [
            'user_id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => $user->status,
        ];

        // Log the activity before deletion
        ActivityLog::log(
            'user_deleted',
            $user,
            auth()->user(),
            $userData
        );

        // Delete the user
        $user->delete();

        return $this->successResponse(
            null,
            'Utilisateur supprimé avec succès'
        );
    }

    /**
     * Get user statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'by_role' => [
                'admin' => User::where('role', 'admin')->count(),
                'lister' => User::where('role', 'lister')->count(),
                'client' => User::where('role', 'client')->count(),
            ],
            'by_status' => [
                'active' => User::where('status', 'active')->count(),
                'suspended' => User::where('status', 'suspended')->count(),
                'pending' => User::where('status', 'pending')->count(),
            ],
            'recent_registrations' => User::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        return $this->successResponse($stats, 'Statistiques des utilisateurs récupérées avec succès');
    }

    /**
     * Format user data for admin view
     */
    private function formatUserForAdmin(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'last_login_ip' => $user->last_login_ip,
            'profile' => [
                'avatar_path' => $user->profile?->avatar_path,
                'company' => $user->profile?->company,
                'about' => $user->profile?->about,
            ],
            'stats' => [
                'listings_count' => $user->listings()->count(),
                'inquiries_count' => $user->inquiries()->count(),
                'deals_count' => $user->dealsAsClient()->count(),
            ],
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    /**
     * Format detailed user data for admin view
     */
    private function formatUserDetailForAdmin(User $user): array
    {
        $basicData = $this->formatUserForAdmin($user);

        return array_merge($basicData, [
            'detailed_stats' => [
                'total_listings' => $user->listings()->count(),
                'active_listings' => $user->listings()->where('status', 'published')->count(),
                'total_inquiries' => $user->inquiries()->count(),
                'pending_inquiries' => $user->inquiries()->where('status', 'new')->count(),
                'total_deals' => $user->dealsAsClient()->count(),
                'completed_deals' => $user->dealsAsClient()->where('status', 'completed')->count(),
            ],
            'recent_activity' => $user->activityLogs->map(function ($log) {
                return [
                    'action' => $log->action,
                    'subject_type' => $log->subject_type,
                    'subject_id' => $log->subject_id,
                    'properties' => $log->properties,
                    'created_at' => $log->created_at,
                ];
            }),
        ]);
    }
}