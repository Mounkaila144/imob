<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\Inquiry;
use App\Models\Deal;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends ApiController
{
    /**
     * Get dashboard statistics for authenticated lister/seller
     */
    public function getStats(): JsonResponse
    {
        $user = auth('api')->user();

        // Vérifier que l'utilisateur peut accéder au dashboard
        if (!$user->isLister() && !$user->isAdmin()) {
            return $this->forbiddenResponse('Accès non autorisé au tableau de bord');
        }

        $stats = [
            'properties' => $this->getPropertiesStats($user),
            'views' => $this->getViewsStats($user),
            'inquiries' => $this->getInquiriesStats($user),
            'revenue' => $this->getRevenueStats($user),
            'recent_activity' => $this->getRecentActivity($user),
            'monthly_performance' => $this->getMonthlyPerformance($user),
        ];

        return $this->successResponse(
            $stats,
            'Statistiques du tableau de bord récupérées avec succès'
        );
    }

    /**
     * Get recent properties for dashboard
     */
    public function getRecentProperties(Request $request): JsonResponse
    {
        $user = auth('api')->user();

        if (!$user->isLister() && !$user->isAdmin()) {
            return $this->forbiddenResponse('Accès non autorisé');
        }

        $limit = min($request->get('limit', 5), 20);

        $properties = Listing::where('user_id', $user->id)
            ->withCount(['inquiries'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($listing) {
                return [
                    'id' => $listing->id,
                    'title' => $listing->title,
                    'price' => $listing->price,
                    'currency' => $listing->currency,
                    'type' => $listing->type,
                    'status' => $listing->status,
                    'views_count' => $listing->views_count,
                    'inquiries_count' => $listing->inquiries_count,
                    'created_at' => $listing->created_at,
                ];
            });

        return $this->successResponse(
            $properties,
            'Propriétés récentes récupérées avec succès'
        );
    }

    /**
     * Get properties statistics
     */
    private function getPropertiesStats($user): array
    {
        $totalProperties = Listing::where('user_id', $user->id)->count();

        $propertiesThisMonth = Listing::where('user_id', $user->id)
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        $propertiesLastMonth = Listing::where('user_id', $user->id)
            ->whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();

        $growth = $propertiesLastMonth > 0
            ? round((($propertiesThisMonth - $propertiesLastMonth) / $propertiesLastMonth) * 100, 1)
            : ($propertiesThisMonth > 0 ? 100 : 0);

        return [
            'total' => $totalProperties,
            'this_month' => $propertiesThisMonth,
            'growth_percentage' => $growth,
            'growth_text' => $growth >= 0 ? "+{$growth}% ce mois" : "{$growth}% ce mois",
        ];
    }

    /**
     * Get views statistics
     */
    private function getViewsStats($user): array
    {
        $totalViews = Listing::where('user_id', $user->id)->sum('views_count');

        // Vues ce mois via activity logs - utilisation d'un join direct pour éviter les problèmes polymorphes
        $viewsThisMonth = ActivityLog::where('subject_type', 'App\\Models\\Listing')
            ->where('action', 'listing_viewed')
            ->whereIn('subject_id', function ($query) use ($user) {
                $query->select('id')
                      ->from('listings')
                      ->where('user_id', $user->id);
            })
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        $viewsLastMonth = ActivityLog::where('subject_type', 'App\\Models\\Listing')
            ->where('action', 'listing_viewed')
            ->whereIn('subject_id', function ($query) use ($user) {
                $query->select('id')
                      ->from('listings')
                      ->where('user_id', $user->id);
            })
            ->whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();

        $growth = $viewsLastMonth > 0
            ? round((($viewsThisMonth - $viewsLastMonth) / $viewsLastMonth) * 100, 1)
            : ($viewsThisMonth > 0 ? 100 : 0);

        return [
            'total' => $totalViews,
            'this_month' => $viewsThisMonth,
            'growth_percentage' => $growth,
            'growth_text' => $growth >= 0 ? "+{$growth}% ce mois" : "{$growth}% ce mois",
        ];
    }

    /**
     * Get inquiries statistics
     */
    private function getInquiriesStats($user): array
    {
        $totalInquiries = Inquiry::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })->count();

        $unreadInquiries = Inquiry::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('status', 'pending')
        ->count();

        $inquiriesThisMonth = Inquiry::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->whereMonth('created_at', Carbon::now()->month)
        ->whereYear('created_at', Carbon::now()->year)
        ->count();

        return [
            'total' => $totalInquiries,
            'unread' => $unreadInquiries,
            'this_month' => $inquiriesThisMonth,
            'description' => $unreadInquiries > 0 ? "{$unreadInquiries} non lus" : "Tout lu",
        ];
    }

    /**
     * Get revenue statistics
     */
    private function getRevenueStats($user): array
    {
        // Calculer les revenus basés sur les deals fermés
        $totalRevenue = Deal::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('status', 'completed')
        ->sum('agreed_price');

        $revenueThisMonth = Deal::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('status', 'completed')
        ->whereMonth('updated_at', Carbon::now()->month)
        ->whereYear('updated_at', Carbon::now()->year)
        ->sum('agreed_price');

        $revenueLastMonth = Deal::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('status', 'completed')
        ->whereMonth('updated_at', Carbon::now()->subMonth()->month)
        ->whereYear('updated_at', Carbon::now()->subMonth()->year)
        ->sum('agreed_price');

        $growth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : ($revenueThisMonth > 0 ? 100 : 0);

        return [
            'total' => $totalRevenue,
            'this_month' => $revenueThisMonth,
            'currency' => 'XOF', // Default currency
            'growth_percentage' => $growth,
            'growth_text' => $growth >= 0 ? "+{$growth}% ce mois" : "{$growth}% ce mois",
        ];
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity($user): array
    {
        $activities = ActivityLog::where(function ($query) use ($user) {
            $query->where('causer_id', $user->id)
                  ->orWhere(function ($subQuery) use ($user) {
                      $subQuery->where('subject_type', 'App\\Models\\Listing')
                               ->whereIn('subject_id', function ($listingQuery) use ($user) {
                                   $listingQuery->select('id')
                                                ->from('listings')
                                                ->where('user_id', $user->id);
                               });
                  });
        })
        ->orderBy('created_at', 'desc')
        ->limit(10)
        ->get()
        ->map(function ($activity) {
            return [
                'action' => $activity->action,
                'description' => $this->getActivityDescription($activity),
                'created_at' => $activity->created_at,
            ];
        });

        return $activities->toArray();
    }

    /**
     * Get monthly performance data
     */
    private function getMonthlyPerformance($user): array
    {
        $currentMonth = Carbon::now();

        // Vues ce mois
        $viewsThisMonth = ActivityLog::where('subject_type', 'App\\Models\\Listing')
            ->where('action', 'listing_viewed')
            ->whereIn('subject_id', function ($query) use ($user) {
                $query->select('id')
                      ->from('listings')
                      ->where('user_id', $user->id);
            })
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        // Messages reçus ce mois
        $inquiriesThisMonth = Inquiry::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->whereMonth('created_at', $currentMonth->month)
        ->whereYear('created_at', $currentMonth->year)
        ->count();

        // Rendez-vous programmés (estimé via deals en négociation)
        $appointmentsThisMonth = Deal::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->where('status', 'in_progress')
        ->whereMonth('created_at', $currentMonth->month)
        ->whereYear('created_at', $currentMonth->year)
        ->count();

        // Taux de réponse (inquiries répondues vs total)
        $totalInquiriesThisMonth = Inquiry::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->whereMonth('created_at', $currentMonth->month)
        ->whereYear('created_at', $currentMonth->year)
        ->count();

        $respondedInquiriesThisMonth = Inquiry::whereHas('listing', function ($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->whereIn('status', ['responded', 'closed'])
        ->whereMonth('created_at', $currentMonth->month)
        ->whereYear('created_at', $currentMonth->year)
        ->count();

        $responseRate = $totalInquiriesThisMonth > 0
            ? round(($respondedInquiriesThisMonth / $totalInquiriesThisMonth) * 100, 1)
            : 0;

        return [
            'views' => $viewsThisMonth,
            'inquiries' => $inquiriesThisMonth,
            'appointments' => $appointmentsThisMonth,
            'response_rate' => $responseRate,
        ];
    }

    /**
     * Generate activity description
     */
    private function getActivityDescription($activity): string
    {
        switch ($activity->action) {
            case 'listing_created':
                return 'Nouvelle propriété créée';
            case 'listing_updated':
                return 'Propriété mise à jour';
            case 'listing_viewed':
                return 'Propriété consultée par un visiteur';
            case 'inquiry_received':
                return 'Nouveau message reçu';
            default:
                return ucfirst(str_replace('_', ' ', $activity->action));
        }
    }
}
