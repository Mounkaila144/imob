<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends ApiController
{
    /**
     * Get the current user's active subscription
     */
    public function mySubscription(): JsonResponse
    {
        $user = auth()->user();

        $subscription = Subscription::with('plan')
            ->where('user_id', $user->id)
            ->orderByDesc('ends_at')
            ->first();

        if (!$subscription) {
            return $this->successResponse(null, 'Aucun abonnement trouvé');
        }

        // Auto-expire if past end date
        if ($subscription->status === 'active' && $subscription->ends_at->isPast()) {
            $subscription->update(['status' => 'expired']);
            $subscription->refresh();
        }

        return $this->successResponse([
            'id' => $subscription->id,
            'user_id' => $subscription->user_id,
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
        ], 'Abonnement récupéré avec succès');
    }

    /**
     * Get available subscription plans
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::active()->orderBy('duration_months')->get();

        return $this->successResponse($plans, 'Plans récupérés avec succès');
    }
}
