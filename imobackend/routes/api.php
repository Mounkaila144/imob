<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ListingController;
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

// Protected Routes
Route::middleware(['auth:api', 'active.user'])->group(function () {

    // Admin only routes
    Route::middleware('role:admin')->group(function () {
        // Admin can manage all listings
        Route::put('listings/{listing}/status', [ListingController::class, 'updateStatus']);
    });

    // Lister routes (agents immobiliers)
    Route::middleware('role:admin,lister')->group(function () {
        Route::post('listings', [ListingController::class, 'store']);
        Route::put('listings/{listing}', [ListingController::class, 'update']);
        Route::delete('listings/{listing}', [ListingController::class, 'destroy']);
        Route::get('my-listings', [ListingController::class, 'myListings']);
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
