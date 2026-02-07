<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Seeder;

class SubscriptionPlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => '1 Mois',
                'slug' => '1-mois',
                'duration_months' => 1,
                'price' => 5000,
                'currency' => 'FCFA',
                'is_active' => true,
            ],
            [
                'name' => '6 Mois',
                'slug' => '6-mois',
                'duration_months' => 6,
                'price' => 25000,
                'currency' => 'FCFA',
                'is_active' => true,
            ],
            [
                'name' => '1 An',
                'slug' => '1-an',
                'duration_months' => 12,
                'price' => 45000,
                'currency' => 'FCFA',
                'is_active' => true,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
