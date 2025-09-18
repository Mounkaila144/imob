<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listing_photos', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('listing_id')->index()->constrained()->onDelete('cascade');
            $table->string('path', 255);
            $table->string('disk', 50)->default('public');
            $table->boolean('is_cover')->default(false)->index();
            $table->smallInteger('sort_order')->unsigned()->default(0);
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->bigInteger('size_bytes')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_photos');
    }
};