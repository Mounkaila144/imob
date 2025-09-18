<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deals', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('inquiry_id')->unique()->constrained()->onDelete('cascade');
            $table->foreignId('listing_id')->index()->constrained()->onDelete('cascade');
            $table->foreignId('client_id')->index()->constrained('users')->onDelete('cascade');
            $table->foreignId('admin_id')->index()->constrained('users')->onDelete('cascade');
            $table->enum('type', ['purchase', 'rent'])->index();
            $table->decimal('agreed_price', 15, 2)->nullable();
            $table->char('currency', 3)->default('EUR');
            $table->decimal('deposit_amount', 15, 2)->nullable();
            $table->smallInteger('lease_months')->nullable();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', [
                'draft', 'pending_signature', 'signed',
                'paid', 'cancelled', 'failed', 'completed'
            ])->index();
            $table->string('contract_file', 255)->nullable();
            $table->text('notes')->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};