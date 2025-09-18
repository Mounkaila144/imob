<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $userData = $request->validated();
        $userData['password'] = Hash::make($userData['password']);
        $userData['status'] = 'pending';

        $user = User::create($userData);

        // Create user profile
        $user->profile()->create([
            'company' => $request->company,
            'about' => $request->about,
        ]);

        // Log activity
        ActivityLog::log('user_registered', $user, $user);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès',
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Identifiants incorrects',
            ], 401);
        }

        $user = auth()->user();

        // Update last login IP
        $user->update([
            'last_login_ip' => $request->ip(),
        ]);

        // Log activity
        ActivityLog::log('user_login', $user, $user, [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie',
            'user' => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(): JsonResponse
    {
        $user = auth()->user();

        return response()->json([
            'success' => true,
            'user' => $this->formatUser($user),
        ]);
    }

    /**
     * Logout user
     */
    public function logout(): JsonResponse
    {
        $user = auth()->user();

        // Log activity
        ActivityLog::log('user_logout', $user, $user);

        JWTAuth::logout();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie',
        ]);
    }

    /**
     * Refresh token
     */
    public function refresh(): JsonResponse
    {
        try {
            $token = JWTAuth::refresh();

            return response()->json([
                'success' => true,
                'token' => $token,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalide',
            ], 401);
        }
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = auth()->user();

        $request->validate([
            'name' => 'sometimes|string|max:150',
            'phone' => 'sometimes|string|max:30',
            'company' => 'sometimes|string|max:150',
            'about' => 'sometimes|string',
        ]);

        // Update user fields
        $user->update($request->only(['name', 'phone']));

        // Update profile fields
        if ($request->has(['company', 'about'])) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $request->only(['company', 'about'])
            );
        }

        // Log activity
        ActivityLog::log('profile_updated', $user, $user, [
            'updated_fields' => array_keys($request->only(['name', 'phone', 'company', 'about']))
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'user' => $this->formatUser($user->fresh()),
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        // Log activity
        ActivityLog::log('password_changed', $user, $user);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès',
        ]);
    }

    /**
     * Format user data for response
     */
    private function formatUser(User $user): array
    {
        $user->load('profile');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'status' => $user->status,
            'email_verified_at' => $user->email_verified_at,
            'profile' => [
                'avatar_path' => $user->profile?->avatar_path,
                'company' => $user->profile?->company,
                'about' => $user->profile?->about,
            ],
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }
}