<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Exceptions\TokenExpiredException;
use Tymon\JWTAuth\Exceptions\TokenInvalidException;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Handle API requests
        if ($request->is('api/*') || $request->expectsJson()) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Handle API exceptions
     */
    private function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        // JWT Exceptions
        if ($e instanceof TokenExpiredException) {
            return response()->json([
                'success' => false,
                'message' => 'Token expiré',
                'error_code' => 'TOKEN_EXPIRED',
            ], 401);
        }

        if ($e instanceof TokenInvalidException) {
            return response()->json([
                'success' => false,
                'message' => 'Token invalide',
                'error_code' => 'TOKEN_INVALID',
            ], 401);
        }

        if ($e instanceof JWTException) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur d\'authentification',
                'error_code' => 'JWT_ERROR',
            ], 401);
        }

        // Authentication Exception
        if ($e instanceof AuthenticationException) {
            return response()->json([
                'success' => false,
                'message' => 'Non authentifié',
                'error_code' => 'UNAUTHENTICATED',
            ], 401);
        }

        // Access Denied Exception
        if ($e instanceof AccessDeniedHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Accès interdit',
                'error_code' => 'ACCESS_DENIED',
            ], 403);
        }

        // Model Not Found Exception
        if ($e instanceof ModelNotFoundException) {
            return response()->json([
                'success' => false,
                'message' => 'Ressource non trouvée',
                'error_code' => 'RESOURCE_NOT_FOUND',
            ], 404);
        }

        // Not Found Exception
        if ($e instanceof NotFoundHttpException) {
            return response()->json([
                'success' => false,
                'message' => 'Endpoint non trouvé',
                'error_code' => 'ENDPOINT_NOT_FOUND',
            ], 404);
        }

        // Validation Exception
        if ($e instanceof ValidationException) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'error_code' => 'VALIDATION_ERROR',
                'errors' => $e->errors(),
            ], 422);
        }

        // Default error response for production
        if (config('app.env') === 'production') {
            return response()->json([
                'success' => false,
                'message' => 'Erreur interne du serveur',
                'error_code' => 'INTERNAL_SERVER_ERROR',
            ], 500);
        }

        // Detailed error for development
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
            'error_code' => 'INTERNAL_SERVER_ERROR',
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
}
