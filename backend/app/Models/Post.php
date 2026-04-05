<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'imagen',
        'ingredients',
        'visibility',
        'hidden_at',
        'hidden_by'
    ];

    protected $casts = [
        'ingredients' => 'array',
        'hidden_at' => 'datetime'
    ];

    protected $with = ['user'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    public function likedBy()
    {
        return $this->belongsToMany(User::class, 'likes')
            ->select(['users.id', 'users.name']);
    }

    public function isLikedBy(User $user)
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    public function isPublic(): bool
    {
        return $this->visibility === 'public';
    }

    public function isHidden(): bool
    {
        return $this->visibility === 'hidden';
    }

    public function isDeleted(): bool
    {
        return $this->visibility === 'deleted';
    }

    public function hide(User $user): void
    {
        $this->update([
            'visibility' => 'hidden',
            'hidden_at' => now(),
            'hidden_by' => $user->id
        ]);
    }

    public function unhide(): void
    {
        $this->update([
            'visibility' => 'public',
            'hidden_at' => null,
            'hidden_by' => null
        ]);
    }

    public function hiddenBy()
    {
        return $this->belongsTo(User::class, 'hidden_by');
    }
}
