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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->index()->after('email');
            $table->enum('role', ['admin', 'lister', 'client'])->default('client')->index()->after('password');
            $table->enum('status', ['active', 'suspended', 'pending'])->default('pending')->index()->after('role');
            $table->string('last_login_ip', 45)->nullable()->after('email_verified_at');

            // Index composite
            $table->index(['role', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'status']);
            $table->dropColumn(['phone', 'role', 'status', 'last_login_ip']);
        });
    }
};
