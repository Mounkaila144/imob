<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the admin user.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@guidacenter.com'],
            [
                'name' => 'Administrateur',
                'email' => 'admin@guidacenter.com',
                'phone' => '+33600000000',
                'password' => Hash::make('Admin@2024!'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );
    }
}