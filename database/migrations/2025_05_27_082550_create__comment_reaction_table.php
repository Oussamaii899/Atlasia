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
        Schema::create('commentReaction', function (Blueprint $table) {
            $table->id();
            $table->foreignId('comment_id')
                ->references('id')
                ->on('comment')
                ->onDelete('cascade');
            $table->foreignId('user_id')->references('id')
                ->on('users')
                ->onDelete('cascade');
            $table->enum('reaction', ['like', 'dislike'])->default('like');
            $table->unique(['comment_id', 'user_id'], 'comment_reaction_unique');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commentReaction');
    }
};
