<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->index()->constrained()->onDelete('cascade');
            $table->enum('type', ['sale', 'rent'])->index();
            $table->string('title', 180);
            $table->string('slug', 200)->unique();
            $table->longText('description');
            $table->enum('property_type', [
                'apartment', 'house', 'villa', 'land',
                'office', 'shop', 'warehouse', 'other'
            ])->index();

            // Prix/location
            $table->decimal('price', 15, 2);
            $table->char('currency', 3)->default('XOF')->index();
            $table->enum('rent_period', ['monthly', 'weekly', 'daily'])->nullable();
            $table->decimal('deposit_amount', 15, 2)->nullable();
            $table->smallInteger('lease_min_months')->nullable();

            // Surface/pièces
            $table->decimal('area_size', 10, 2)->nullable();
            $table->enum('area_unit', ['m2', 'ha', 'ft2'])->nullable();
            $table->tinyInteger('rooms')->unsigned()->nullable();
            $table->tinyInteger('bedrooms')->unsigned()->nullable();
            $table->tinyInteger('bathrooms')->unsigned()->nullable();
            $table->tinyInteger('parking_spaces')->unsigned()->nullable();
            $table->smallInteger('floor')->nullable();
            $table->smallInteger('year_built')->nullable();

            // Adresse/GPS
            $table->string('address_line1', 180);
            $table->string('address_line2', 180)->nullable();
            $table->string('city', 120)->index();
            $table->string('state', 120)->nullable()->index();
            $table->string('postal_code', 20)->nullable()->index();
            $table->char('country_code', 2)->default('FR')->index();
            $table->decimal('latitude', 10, 7)->index();
            $table->decimal('longitude', 10, 7)->index();

            // Statuts/dates
            $table->date('available_from')->nullable();
            $table->enum('status', [
                'draft', 'pending_review', 'published',
                'rejected', 'archived', 'sold', 'rented'
            ])->index();
            $table->dateTime('expires_at')->nullable()->index();

            // Divers
            $table->bigInteger('views_count')->unsigned()->default(0);
            $table->json('features_json')->nullable();

            $table->timestampsTz();
            $table->softDeletesTz();

            // Index composés
            $table->index(['type', 'status']);
            $table->index(['country_code', 'city']);
            $table->index(['latitude', 'longitude']);

            // FULLTEXT
            $table->fullText(['title', 'description', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
