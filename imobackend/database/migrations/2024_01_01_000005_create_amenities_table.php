<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('amenities', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('code', 60)->unique();
            $table->string('label', 120);
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amenities');
    }
};