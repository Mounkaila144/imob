<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Pour une API, on ne redirige jamais, on retourne null
        // Laravel enverra automatiquement une réponse 401 Unauthorized
        return null;
    }
}
