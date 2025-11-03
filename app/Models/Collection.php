<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class Collection extends Model
{
    use HasFactory;

    protected $table = 'collection'; 

    protected $fillable = [
        'name',
        'description',
        'user_id',
        'color',
    ];

    // Relationships

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function saves()
    {
        return $this->hasMany(Save::class);
    }
    
}
