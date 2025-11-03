<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Support extends Model
{
    protected $table = 'supports';
    protected $fillable = [
        'user_id', 
        'subject', 
        'category', 
        'message', 
        'status', 
        'priority', 
        'resolved_at',
        'assigned_to',
        'reported_user_name'
    ];

    protected $casts = [
        'resolved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function responses()
    {
        return $this->hasMany(SupportResponse::class, 'support_id');
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    // Scopes for filtering
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('subject', 'like', "%{$search}%")
              ->orWhere('message', 'like', "%{$search}%")
              ->orWhere('reported_user_name', 'like', "%{$search}%")
              ->orWhereHas('user', function ($userQuery) use ($search) {
                  $userQuery->where('name', 'like', "%{$search}%")
                           ->orWhere('email', 'like', "%{$search}%");
              });
        });
    }

    // Scope for user reports
    public function scopeUserReports($query)
    {
        return $query->where('category', 'user');
    }

    // Scope for abuse reports
    public function scopeAbuseReports($query)
    {
        return $query->whereIn('category', ['user', 'abuse']);
    }
}
