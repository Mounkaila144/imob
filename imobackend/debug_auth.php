<?php

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Config;

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test JWT auth resolver
echo "Testing JWT Auth...\n";

// Check JWT configuration
echo "JWT Config:\n";
echo "Secret: " . (Config::get('jwt.secret') ? 'Set' : 'Not set') . "\n";
echo "TTL: " . Config::get('jwt.ttl') . "\n";
echo "Provider: " . Config::get('jwt.providers.auth') . "\n";

// Check auth configuration
echo "\nAuth Config:\n";
echo "Default guard: " . Config::get('auth.defaults.guard') . "\n";
echo "API guard driver: " . Config::get('auth.guards.api.driver') . "\n";
echo "API guard provider: " . Config::get('auth.guards.api.provider') . "\n";
echo "User provider model: " . Config::get('auth.providers.users.model') . "\n";

echo "\nCompleted debug check.\n";