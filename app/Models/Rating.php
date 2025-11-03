<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    /*         Schema::create('rating', function (Blueprint $table) {
            $table->id();
            $table->foreignId('place_id')
                ->constrained('places')
                ->onDelete('cascade');
            $table->foreignId('user_id')
                ->constrained('users')
                ->onDelete('cascade');
            $table->integer('rating')->comment('Rating value from 1 to 5');
            $table->unique(['place_id', 'user_id'], 'unique_place_user_rating');
            $table->timestamps();
        }); */

    protected $table = 'rating';
    protected $fillable = [
        'place_id',
        'user_id',
        'rating',
    ];
    public function place()
    {
        return $this->belongsTo(Place::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public $timestamps = true;
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
    protected $attributes = [
        'rating' => 0, // Default rating value
    ];
    protected $primaryKey = 'id';
}
