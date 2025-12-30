<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('logo_path')->nullable();
            $table->string('disk')->default('public');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('website_url')->nullable();
            $table->timestamps();

            $table->index('sort_order');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('partners');
    }
};
