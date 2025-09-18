<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listing_reports', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('listing_id')->index()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->index()->constrained()->onDelete('set null');
            $table->string('reason', 180);
            $table->text('message')->nullable();
            $table->enum('status', ['new', 'reviewed', 'dismissed', 'removed'])->index();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_reports');
    }
};