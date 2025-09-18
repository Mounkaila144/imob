<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'user_id',
        'reason',
        'message',
        'status',
    ];

    // Relationships
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Helpers
    public function isNew(): bool
    {
        return $this->status === 'new';
    }

    public function isReviewed(): bool
    {
        return $this->status === 'reviewed';
    }

    public function markAsReviewed(): void
    {
        $this->update(['status' => 'reviewed']);
    }
}