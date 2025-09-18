<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inquiries', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('listing_id')->index()->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->index()->constrained('users')->onDelete('cascade');
            $table->enum('type', ['purchase', 'rent'])->index();
            $table->text('message')->nullable();
            $table->enum('status', [
                'new', 'contacted', 'in_review', 'approved',
                'rejected', 'cancelled', 'converted'
            ])->index();
            $table->foreignId('handled_by')->nullable()->index()->constrained('users')->onDelete('set null');
            $table->dateTime('handled_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
    }
};