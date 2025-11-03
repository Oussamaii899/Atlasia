<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SupportResponse extends Model
{
    protected $table = 'support_responses';
    
    protected $fillable = [
        'support_id',
        'admin_user_id',
        'message',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function support()
    {
        return $this->belongsTo(Support::class);
    }

    public function adminUser()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }

    // Alias for consistency with frontend
    public function admin_user()
    {
        return $this->adminUser();
    }
}
