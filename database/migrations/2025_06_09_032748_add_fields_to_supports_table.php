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
            // Add missing fields if they don't exist
            if (!Schema::hasColumn('supports', 'status')) {
                $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open');
            }
            
            if (!Schema::hasColumn('supports', 'priority')) {
                $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            }
            
            if (!Schema::hasColumn('supports', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable();
            }
            
            if (!Schema::hasColumn('supports', 'assigned_to')) {
                $table->foreignId('assigned_to')->nullable()->constrained('users')->onDelete('set null');
            }

            // Add indexes for better performance
            $table->index(['status', 'created_at']);
            $table->index(['category', 'created_at']);
            $table->index(['priority', 'created_at']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('supports', function (Blueprint $table) {
            $table->dropColumn(['status', 'priority', 'resolved_at', 'assigned_to']);
        });
    }
};
