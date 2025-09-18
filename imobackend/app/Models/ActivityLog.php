<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'causer_id',
        'action',
        'subject_type',
        'subject_id',
        'properties',
        'created_at',
    ];

    protected $casts = [
        'properties' => 'array',
        'created_at' => 'datetime',
    ];

    // Relationships
    public function causer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'causer_id');
    }

    public function subject()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeByAction($query, $action)
    {
        return $query->where('action', $action);
    }

    public function scopeBySubjectType($query, $type)
    {
        return $query->where('subject_type', $type);
    }

    public function scopeByCauser($query, $userId)
    {
        return $query->where('causer_id', $userId);
    }

    public function scopeRecent($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }

    // Static methods for logging
    public static function log(string $action, $subject, ?User $causer = null, array $properties = []): self
    {
        return static::create([
            'causer_id' => $causer?->id,
            'action' => $action,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'properties' => $properties,
            'created_at' => now(),
        ]);
    }
}