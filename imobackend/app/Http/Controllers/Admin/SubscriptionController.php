<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends ApiController
{
    /**
     * List all subscriptions with pagination and filtering
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'status' => 'sometimes|in:active,expired,cancelled',
            'plan_id' => 'sometimes|integer|exists:subscription_plans,id',
            'search' => 'sometimes|string|max:255',
            'expiring_soon' => 'sometimes|boolean',
            'per_page' => 'sometimes|integer|min:1|max:100',
            'sort_by' => 'sometimes|in:id,starts_at,ends_at,status,created_at',
            'sort_order' => 'sometimes|in:asc,desc',
        ]);

        $query = Subscription::with(['user.profile', 'plan']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('expiring_soon')) {
            $query->expiringSoon();
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $subscriptions = $query->paginate($perPage);

        $transformed = $subscriptions->getCollection()->map(function ($sub) {
            return $this->formatSubscription($sub);
        });

        $subscriptions->setCollection($transformed);

        return $this->paginatedResponse($subscriptions, 'Liste des abonnements récupérée avec succès');
    }

    /**
     * Get subscription statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Subscription::count(),
            'active' => Subscription::active()->count(),
            'expired' => Subscription::where('status', 'expired')
                ->orWhere(function ($q) {
                    $q->where('status', 'active')->where('ends_at', '<=', now());
                })->count(),
            'cancelled' => Subscription::where('status', 'cancelled')->count(),
            'expiring_soon' => Subscription::expiringSoon()->count(),
            'revenue' => Subscription::join('subscription_plans', 'subscriptions.plan_id', '=', 'subscription_plans.id')
                ->sum('subscription_plans.price'),
        ];

        return $this->successResponse($stats, 'Statistiques des abonnements récupérées avec succès');
    }

    /**
     * Get all subscription plans (including inactive)
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::orderBy('duration_months')->get();

        return $this->successResponse($plans, 'Plans récupérés avec succès');
    }

    /**
     * Update a subscription plan
     */
    public function updatePlan(Request $request, SubscriptionPlan $plan): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'price' => 'sometimes|numeric|min:0',
            'currency' => 'sometimes|string|max:10',
            'is_active' => 'sometimes|boolean',
        ]);

        $plan->update($request->only(['name', 'price', 'currency', 'is_active']));

        return $this->successResponse($plan->fresh(), 'Plan mis à jour avec succès');
    }

    /**
     * Create a subscription for a user
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'plan_id' => 'required|integer|exists:subscription_plans,id',
            'starts_at' => 'required|date',
        ]);

        $user = User::findOrFail($request->user_id);

        if ($user->role !== 'lister') {
            return $this->errorResponse('Seuls les agents (lister) peuvent avoir un abonnement', 422);
        }

        // Check for existing active subscription
        $existing = Subscription::where('user_id', $user->id)
            ->active()
            ->first();

        if ($existing) {
            return $this->errorResponse('Cet utilisateur a déjà un abonnement actif', 422);
        }

        $plan = SubscriptionPlan::findOrFail($request->plan_id);
        $startsAt = \Carbon\Carbon::parse($request->starts_at);
        $endsAt = $startsAt->copy()->addMonths($plan->duration_months);

        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
        ]);

        $subscription->load(['user.profile', 'plan']);

        return $this->successResponse(
            $this->formatSubscription($subscription),
            'Abonnement créé avec succès',
            201
        );
    }

    /**
     * Extend a subscription with a new plan
     */
    public function extend(Request $request, Subscription $subscription): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|integer|exists:subscription_plans,id',
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        // Extend from current ends_at or from now if already expired
        $startFrom = $subscription->ends_at->isFuture()
            ? $subscription->ends_at
            : now();

        $subscription->update([
            'plan_id' => $plan->id,
            'status' => 'active',
            'ends_at' => $startFrom->copy()->addMonths($plan->duration_months),
        ]);

        $subscription->load(['user.profile', 'plan']);

        return $this->successResponse(
            $this->formatSubscription($subscription->fresh()->load(['user.profile', 'plan'])),
            'Abonnement prolongé avec succès'
        );
    }

    /**
     * Cancel a subscription
     */
    public function cancel(Subscription $subscription): JsonResponse
    {
        if ($subscription->status === 'cancelled') {
            return $this->errorResponse('Cet abonnement est déjà annulé', 422);
        }

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $subscription->load(['user.profile', 'plan']);

        return $this->successResponse(
            $this->formatSubscription($subscription),
            'Abonnement annulé avec succès'
        );
    }

    /**
     * Format subscription for API response
     */
    private function formatSubscription(Subscription $subscription): array
    {
        return [
            'id' => $subscription->id,
            'user_id' => $subscription->user_id,
            'user' => [
                'id' => $subscription->user->id,
                'name' => $subscription->user->name,
                'email' => $subscription->user->email,
                'phone' => $subscription->user->phone,
                'role' => $subscription->user->role,
                'status' => $subscription->user->status,
                'profile' => [
                    'avatar_path' => $subscription->user->profile?->avatar_path,
                    'company' => $subscription->user->profile?->company,
                ],
            ],
            'plan' => [
                'id' => $subscription->plan->id,
                'name' => $subscription->plan->name,
                'slug' => $subscription->plan->slug,
                'duration_months' => $subscription->plan->duration_months,
                'price' => $subscription->plan->price,
                'currency' => $subscription->plan->currency,
                'is_active' => $subscription->plan->is_active,
            ],
            'plan_id' => $subscription->plan_id,
            'status' => $subscription->status,
            'starts_at' => $subscription->starts_at->toISOString(),
            'ends_at' => $subscription->ends_at->toISOString(),
            'cancelled_at' => $subscription->cancelled_at?->toISOString(),
            'created_at' => $subscription->created_at->toISOString(),
            'updated_at' => $subscription->updated_at->toISOString(),
        ];
    }
}
