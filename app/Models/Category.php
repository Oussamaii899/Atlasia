<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'nom',
        'description',
        'position',
        'publier',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'publier' => 'boolean',
    ];
}
