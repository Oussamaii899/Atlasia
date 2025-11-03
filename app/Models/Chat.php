<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    protected $table = 'messages';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'seen_at',
    ];

    public $timestamps = false;

    protected $dates = ['created_at', 'seen_at']; 
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}

