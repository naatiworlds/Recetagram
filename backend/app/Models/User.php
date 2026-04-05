<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_public', // Se reemplaza is_private por is_public
        'notification_tokens',
        'is_verified',
        'verified_at',
        'membership_expires_at',
        'stripe_customer_id',
        'stripe_subscription_id',
        'membership_type'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_public' => 'boolean', // Se usa solo is_public
        'notification_tokens' => 'array',
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
        'membership_expires_at' => 'datetime',
    ];

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    public function isSponsor(): bool
    {
        return $this->role === 'sponsor';
    }

    public function isDonor(): bool
    {
        return $this->role === 'donor';
    }

    public function isVerified(): bool
    {
        return $this->is_verified || $this->role === 'verified';
    }

    public function hasActiveMembership(): bool
    {
        return $this->membership_expires_at && $this->membership_expires_at->isFuture();
    }

    public function canAccessAdminPanel(): bool
    {
        return $this->isAdmin() || $this->isModerator();
    }

    public function canModerate(): bool
    {
        return $this->isAdmin() || $this->isModerator();
    }

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function likedPosts()
    {
        return $this->belongsToMany(Post::class, 'likes');
    }

    public function followers()
    {
        return $this->hasMany(Follow::class, 'following_id');
    }

    public function following()
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function isFollowing(User $user)
    {
        return $this->following()
            ->where('following_id', $user->id)
            ->where('status', 'accepted')
            ->exists();
    }

    public function hasPendingFollowRequest(User $user)
    {
        return $this->following()
            ->where('following_id', $user->id)
            ->where('status', 'pending')
            ->exists();
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($user) {
            $user->posts()->delete();
        });
    }
}
