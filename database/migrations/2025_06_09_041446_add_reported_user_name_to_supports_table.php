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
        Schema::table('supports', function (Blueprint $table) {
            if (!Schema::hasColumn('supports', 'reported_user_name')) {
                $table->string('reported_user_name')->nullable()->after('message');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supports', function (Blueprint $table) {
            $table->dropColumn('reported_user_name');
        });
    }
};
