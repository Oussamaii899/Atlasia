<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Histoire extends Model
{
    protected $table = 'histoire';

    protected $fillable = [
        'user_id',
        'place_id',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class);
    }

}
