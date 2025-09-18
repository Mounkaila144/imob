<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('amenity_listing', function (Blueprint $table) {
            $table->foreignId('listing_id')->index()->constrained()->onDelete('cascade');
            $table->foreignId('amenity_id')->index()->constrained()->onDelete('cascade');

            $table->primary(['listing_id', 'amenity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amenity_listing');
    }
};