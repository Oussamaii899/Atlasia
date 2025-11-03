<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Models\Collection;
use App\Models\Place;
use App\Models\Comment;
use App\Models\Commentreaction;


class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'email',
        'password',
        'role',
        'created_at',
        'updated_at',
        'avatar',
        'last_activity',
        'bio',
        'banner'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_activity' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function savedPlaces()
        {
            return $this->belongsToMany(Place::class, 'saves')
                         ->withTimestamps()
                        ->withPivot('collection_id');
        }

        public function places()
    {
        return $this->savedPlaces();
    }

    public function collections()
        {
            return $this->hasMany(Collection::class);
        }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    
    public function commentReactions()
    {
        return $this->hasMany(Commentreaction::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Chat::class, 'sender_id');
    }
    
    public function receivedMessages()
    {
        return $this->hasMany(Chat::class, 'receiver_id');
    }
    public function ratings()
    {
        return $this->hasMany(Rating::class);
    }


    public function isOnline()
    {
        return $this->last_activity && $this->last_activity->gt(now()->subSeconds(15));
    }


    public function updateLastActivity()
    {
        $this->update(['last_activity' => now()]);
    }


    public function scopeOnline($query)
    {
        return $query->where('last_activity', '>', now()->subSeconds(15));
    }
     public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is regular user
     */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    /**
     * Get user's reports
     */
    public function reports()
    {
        return $this->hasMany(Support::class);
    }

    /**
     * Get user's comments
     */
    /**
     * Get admin responses (for admin users)
     */
    public function adminResponses()
    {
        return $this->hasMany(SupportResponse::class, 'admin_user_id');
    }

    /**
     * Scope to get only admin users
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    /**
     * Scope to get only regular users
     */
    public function scopeUsers($query)
    {
        return $query->where('role', 'user');
    }
}
