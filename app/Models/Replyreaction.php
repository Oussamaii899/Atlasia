<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Replyreaction extends Model
{
    use HasFactory;
    protected $table = 'repliesreaction';

    protected $fillable = [
        'reply_id',
        'user_id',
        'reaction'
    ];

    public function reply(){
        return $this->belongTo(Reply::class);
    }

    public function user(){
        return $this->belongsTo(User::class);
    }
}
