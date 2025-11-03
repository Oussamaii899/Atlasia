<?php

namespace App\Models;


use App\Models\Category;
use App\Models\Comment;
use App\Models\Image;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Place extends Model
{
     use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'lng',
        'lat',
        'email',
        'phone',
        'address',
        'website',
        'city',
        'category_id',
        'publier',
        'created_at',
        'updated_at',
        'rating',
        'review_count',
        'amenities',
        'type',
        'user_id',
        'status'
    ];
    protected $casts = [
        'publier' => 'boolean',
        'amenities' => 'array',
        'rating' => 'float',
        'review_count' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function images()
    {
        return $this->hasMany(Image::class);
    }
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }

    public function publishedReplies()
{
    return $this->hasManyThrough(
        Reply::class,
        Comment::class,
        'place_id',
        'comment_id',
        'id',
        'id'
    )->where('replies.is_published', true);
}

     public function matches()
            {
                return $this->hasMany(Matche::class, 'place_id');
            }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

}
