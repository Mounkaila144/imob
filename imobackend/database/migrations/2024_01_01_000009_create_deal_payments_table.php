<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deal_payments', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('deal_id')->index()->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3);
            $table->enum('type', ['deposit', 'rent', 'sale', 'fee', 'other']);
            $table->dateTime('paid_at');
            $table->enum('method', ['bank_transfer', 'cash', 'card', 'other']);
            $table->string('reference', 120)->nullable();
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deal_payments');
    }
};