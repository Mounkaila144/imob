<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\ListingPhotoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\Admin\SubscriptionController as AdminSubscriptionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Authentication Routes
Route::group(['prefix' => 'auth'], function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
        Route::post('refresh', [AuthController::class, 'refresh']);
        Route::put('profile', [AuthController::class, 'updateProfile']);
        Route::put('password', [AuthController::class, 'changePassword']);
    });
});

// Public Listings Routes (no auth required)
Route::get('listings', [ListingController::class, 'index']);
Route::get('listings/{listing}', [ListingController::class, 'show']);

// Public Partners Route (for homepage carousel)
Route::get('partners', [PartnerController::class, 'publicIndex']);

// Protected Routes
Route::middleware(['auth:api', 'active.user'])->group(function () {

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        // Admin can manage all listings
        Route::put('listings/{listing}/status', [ListingController::class, 'updateStatus']);

        // Admin dashboard routes
        Route::get('admin/dashboard/stats', [AdminDashboardController::class, 'getStats']);

        // User management routes
        Route::prefix('admin/users')->group(function () {
            Route::get('/', [UserController::class, 'index']);
            Route::get('/statistics', [UserController::class, 'statistics']);
            Route::get('/{user}', [UserController::class, 'show']);
            Route::put('/{user}/status', [UserController::class, 'updateStatus']);
            Route::put('/{user}/role', [UserController::class, 'updateRole']);
            Route::delete('/{user}', [UserController::class, 'destroy']);
        });

        // Partner management routes
        Route::prefix('admin/partners')->group(function () {
            Route::get('/', [PartnerController::class, 'index']);
            Route::post('/', [PartnerController::class, 'store']);
            Route::get('/{partner}', [PartnerController::class, 'show']);
            Route::post('/{partner}', [PartnerController::class, 'update']); // POST for file upload
            Route::delete('/{partner}', [PartnerController::class, 'destroy']);
            Route::put('/reorder', [PartnerController::class, 'reorder']);
            Route::put('/{partner}/toggle-active', [PartnerController::class, 'toggleActive']);
        });

        // Subscription management routes
        Route::get('admin/subscription-plans', [AdminSubscriptionController::class, 'plans']);
        Route::put('admin/subscription-plans/{plan}', [AdminSubscriptionController::class, 'updatePlan']);
        Route::prefix('admin/subscriptions')->group(function () {
            Route::get('/', [AdminSubscriptionController::class, 'index']);
            Route::get('/statistics', [AdminSubscriptionController::class, 'statistics']);
            Route::post('/', [AdminSubscriptionController::class, 'store']);
            Route::put('/{subscription}/extend', [AdminSubscriptionController::class, 'extend']);
            Route::put('/{subscription}/cancel', [AdminSubscriptionController::class, 'cancel']);
        });
    });

    // Lister routes (agents immobiliers)
    Route::middleware('role:admin,lister')->group(function () {
        // Subscription routes for listers
        Route::get('my-subscription', [SubscriptionController::class, 'mySubscription']);
        Route::get('subscription-plans', [SubscriptionController::class, 'plans']);

        Route::post('listings', [ListingController::class, 'store']);
        Route::put('listings/{listing}', [ListingController::class, 'update']);
        Route::delete('listings/{listing}', [ListingController::class, 'destroy']);
        Route::get('my-listings', [ListingController::class, 'myListings']);

        // Dashboard routes
        Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
        Route::get('dashboard/recent-properties', [DashboardController::class, 'getRecentProperties']);

        // Photo management routes
        Route::post('listings/{listing}/photos', [ListingPhotoController::class, 'store']);
        Route::delete('listings/{listing}/photos/{photo}', [ListingPhotoController::class, 'destroy']);
        Route::put('listings/{listing}/photos/{photo}/cover', [ListingPhotoController::class, 'setCover']);
        Route::put('listings/{listing}/photos/reorder', [ListingPhotoController::class, 'reorder']);
    });

    // Client routes
    Route::middleware('role:client')->group(function () {
        // Client-specific routes will be added here (favorites, inquiries, etc.)
    });

    // Routes accessible by multiple roles
    Route::middleware('role:admin,lister,client')->group(function () {
        // Common routes accessible to all authenticated users
    });
});
