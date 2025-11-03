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
        Schema::create('support_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_id')->constrained('supports')->onDelete('cascade');
            $table->foreignId('admin_user_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->timestamps();

            $table->index(['support_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_responses');
    }
};
