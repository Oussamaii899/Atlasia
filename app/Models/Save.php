<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Save extends Model
{
    use HasFactory;

    protected $table = 'saves'; 

    protected $fillable = [
        'user_id',
        'place_id',
        'collection_id',
    ];

    // Relations

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function place()
    {
        return $this->belongsTo(Place::class); 
    }

    public function collection()
    {
        return $this->belongsTo(Collection::class);
    }
}
