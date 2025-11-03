<?php 

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reply extends Model
{
    use HasFactory;

    protected $fillable = ['comment_id', 'user_id', 'content', 'likes', 'dislikes', 'created_at', 'updated_at', 'is_published'];

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function reactions(){
        return $this->hasMany(Replyreaction::class);
    }
}
