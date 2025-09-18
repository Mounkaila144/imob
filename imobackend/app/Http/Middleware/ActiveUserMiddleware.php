<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ActiveUserMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié',
            ], 401);
        }

        $user = auth()->user();

        if (!$user->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Votre compte n\'est pas actif. Veuillez contacter l\'administrateur.',
            ], 403);
        }

        return $next($request);
    }
}