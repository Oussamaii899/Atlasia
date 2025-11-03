<?php 

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->integer('review_count')->default(0);
            $table->json('amenities')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('places', function (Blueprint $table) {
            $table->dropColumn([
                'type',
                'review_count',
                'amenities',
            ]);
        });
    }
};
