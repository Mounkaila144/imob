<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\ApiController;
use App\Models\User;
use App\Models\Listing;
use App\Models\Inquiry;
use App\Models\Deal;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminDashboardController extends ApiController
{
    /**
     * Get admin dashboard statistics
     */
    public function getStats(): JsonResponse
    {
        $user = auth('api')->user();

        // Vérifier que l'utilisateur est admin
        if (!$user || !$user->isAdmin()) {
            return $this->forbiddenResponse('Accès non autorisé au tableau de bord admin');
        }

        $stats = [
            'users' => $this->getUserStats(),
            'listings' => $this->getListingStats(),
            'revenue' => $this->getRevenueStats(),
            'inquiries' => $this->getInquiryStats(),
            'recent_activity' => $this->getRecentActivity(),
            'platform_performance' => $this->getPlatformPerformance(),
        ];

        return $this->successResponse(
            $stats,
            'Statistiques du tableau de bord admin récupérées avec succès'
        );
    }

    /**
     * Get user statistics
     */
    private function getUserStats(): array
    {
        $totalUsers = User::count();

        $usersThisMonth = User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        $usersLastMonth = User::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();

        $growth = $usersLastMonth > 0
            ? round((($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100, 1)
            : ($usersThisMonth > 0 ? 100 : 0);

        // Répartition par rôle
        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // Utilisateurs actifs (connectés dans les 30 derniers jours)
        $activeUsers = User::where('updated_at', '>=', Carbon::now()->subDays(30))->count();

        return [
            'total' => $totalUsers,
            'this_month' => $usersThisMonth,
            'growth_percentage' => $growth,
            'growth_text' => $growth >= 0 ? "+{$growth}% ce mois" : "{$growth}% ce mois",
            'by_role' => $usersByRole,
            'active_users' => $activeUsers,
        ];
    }

    /**
     * Get listing statistics
     */
    private function getListingStats(): array
    {
        $totalListings = Listing::count();
        $activeListings = Listing::where('status', 'published')->count();
        $pendingListings = Listing::where('status', 'pending_review')->count();

        $listingsThisMonth = Listing::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        $listingsLastMonth = Listing::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();

        $growth = $listingsLastMonth > 0
            ? round((($listingsThisMonth - $listingsLastMonth) / $listingsLastMonth) * 100, 1)
            : ($listingsThisMonth > 0 ? 100 : 0);

        // Répartition par type
        $listingsByType = Listing::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Répartition par statut
        $listingsByStatus = Listing::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'total' => $totalListings,
            'active' => $activeListings,
            'pending' => $pendingListings,
            'this_month' => $listingsThisMonth,
            'growth_percentage' => $growth,
            'growth_text' => $growth >= 0 ? "+{$growth}% ce mois" : "{$growth}% ce mois",
            'by_type' => $listingsByType,
            'by_status' => $listingsByStatus,
        ];
    }

    /**
     * Get revenue statistics
     */
    private function getRevenueStats(): array
    {
        $totalRevenue = Deal::where('status', 'completed')->sum('agreed_price');

        $revenueThisMonth = Deal::where('status', 'completed')
            ->whereMonth('updated_at', Carbon::now()->month)
            ->whereYear('updated_at', Carbon::now()->year)
            ->sum('agreed_price');

        $revenueLastMonth = Deal::where('status', 'completed')
            ->whereMonth('updated_at', Carbon::now()->subMonth()->month)
            ->whereYear('updated_at', Carbon::now()->subMonth()->year)
            ->sum('agreed_price');

        $growth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : ($revenueThisMonth > 0 ? 100 : 0);

        // Deals par statut
        $dealsByStatus = Deal::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'total' => $totalRevenue,
            'this_month' => $revenueThisMonth,
            'currency' => 'XOF',
            'growth_percentage' => $growth,
            'growth_text' => $growth >= 0 ? "+{$growth}% ce mois" : "{$growth}% ce mois",
            'deals_by_status' => $dealsByStatus,
        ];
    }

    /**
     * Get inquiry statistics
     */
    private function getInquiryStats(): array
    {
        $totalInquiries = Inquiry::count();
        $unreadInquiries = Inquiry::where('status', 'pending')->count();

        $inquiriesThisMonth = Inquiry::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        // Taux de réponse global
        $respondedInquiries = Inquiry::whereIn('status', ['responded', 'closed'])->count();
        $responseRate = $totalInquiries > 0 ? round(($respondedInquiries / $totalInquiries) * 100, 1) : 0;

        return [
            'total' => $totalInquiries,
            'unread' => $unreadInquiries,
            'this_month' => $inquiriesThisMonth,
            'response_rate' => $responseRate,
            'description' => $unreadInquiries > 0 ? "{$unreadInquiries} non lus" : "Tous traités",
        ];
    }

    /**
     * Get recent platform activity
     */
    private function getRecentActivity(): array
    {
        $activities = ActivityLog::with(['causer'])
            ->orderBy('created_at', 'desc')
            ->limit(15)
            ->get()
            ->map(function ($activity) {
                return [
                    'action' => $activity->action,
                    'description' => $this->getActivityDescription($activity),
                    'user_name' => $activity->causer?->name ?? 'Système',
                    'created_at' => $activity->created_at,
                ];
            });

        return $activities->toArray();
    }

    /**
     * Get platform performance metrics
     */
    private function getPlatformPerformance(): array
    {
        $currentMonth = Carbon::now();

        // Taux de conversion (deals completed / inquiries)
        $totalInquiries = Inquiry::whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $completedDeals = Deal::where('status', 'completed')
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $conversionRate = $totalInquiries > 0 ? round(($completedDeals / $totalInquiries) * 100, 1) : 0;

        // Satisfaction utilisateur (basée sur le ratio de deals completed vs cancelled)
        $totalDeals = Deal::whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $cancelledDeals = Deal::where('status', 'cancelled')
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->count();

        $satisfactionRate = $totalDeals > 0 ? round((($totalDeals - $cancelledDeals) / $totalDeals) * 100, 1) : 0;

        // Temps de réponse moyen (en heures)
        $avgResponseTime = Inquiry::where('status', 'responded')
            ->whereMonth('created_at', $currentMonth->month)
            ->whereYear('created_at', $currentMonth->year)
            ->avg(DB::raw('TIMESTAMPDIFF(HOUR, created_at, updated_at)'));

        return [
            'conversion_rate' => $conversionRate,
            'satisfaction_rate' => $satisfactionRate,
            'avg_response_time' => $avgResponseTime ? round($avgResponseTime, 1) : 0,
        ];
    }

    /**
     * Generate activity description
     */
    private function getActivityDescription($activity): string
    {
        switch ($activity->action) {
            case 'user_registered':
                return 'Nouvel utilisateur inscrit';
            case 'listing_created':
                return 'Nouvelle propriété publiée';
            case 'listing_viewed':
                return 'Propriété consultée';
            case 'inquiry_created':
                return 'Nouvelle demande de visite';
            case 'deal_completed':
                return 'Transaction finalisée';
            case 'user_login':
                return 'Connexion utilisateur';
            default:
                return ucfirst(str_replace('_', ' ', $activity->action));
        }
    }
}
