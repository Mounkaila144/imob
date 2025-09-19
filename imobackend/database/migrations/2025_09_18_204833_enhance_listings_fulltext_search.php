<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Supprimer l'ancien index FULLTEXT
        Schema::table('listings', function (Blueprint $table) {
            $table->dropFullText(['title', 'description', 'city']);
        });

        // Créer un nouvel index FULLTEXT plus complet
        Schema::table('listings', function (Blueprint $table) {
            $table->fullText([
                'title',
                'description',
                'city',
                'address_line1',
                'address_line2',
                'state',
                'postal_code'
            ], 'listings_enhanced_fulltext_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer le nouvel index
        Schema::table('listings', function (Blueprint $table) {
            $table->dropFullText(['title', 'description', 'city', 'address_line1', 'address_line2', 'state', 'postal_code']);
        });

        // Restaurer l'ancien index
        Schema::table('listings', function (Blueprint $table) {
            $table->fullText(['title', 'description', 'city']);
        });
    }
};
