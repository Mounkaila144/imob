<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('causer_id')->nullable()->index()->constrained('users')->onDelete('set null');
            $table->string('action', 120);
            $table->string('subject_type', 120);
            $table->bigInteger('subject_id')->index();
            $table->json('properties')->nullable();
            $table->timestampTz('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};