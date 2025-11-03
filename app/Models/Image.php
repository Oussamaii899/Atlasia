<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model

{

    use HasFactory;

    protected $fillable = [
        'place_id',
        'url',
        'alt_text',
        'created_at',
        'updated_at',
    ];

    public function place()
    {
        return $this->belongsTo(Place::class);
    }
}
