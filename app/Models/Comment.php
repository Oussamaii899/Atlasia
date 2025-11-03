<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\User;
use App\Models\Commentreaction;
use App\Models\Place;

class Comment extends Model
{
    use HasFactory;
    protected $table = 'comment';
    protected $fillable = [
        'user_id',
        'place_id',
        'content',
        'likes',
        'dislikes',
        'is_published',
        'created_at',
        'updated_at',
    ];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

    public function replies()
    {
        return $this->hasMany(Reply::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function reactions()
    {
        return $this->hasMany(Commentreaction::class);
    }
}
