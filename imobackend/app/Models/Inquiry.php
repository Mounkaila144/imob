<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Inquiry extends Model
{
    use HasFactory;

    protected $fillable = [
        'listing_id',
        'client_id',
        'type',
        'message',
        'status',
        'handled_by',
        'handled_at',
        'closed_at',
    ];

    protected $casts = [
        'handled_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    // Relationships
    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }

    public function deal(): HasOne
    {
        return $this->hasOne(Deal::class);
    }

    // Scopes
    public function scopeNew($query)
    {
        return $query->where('status', 'new');
    }

    public function scopeForPurchase($query)
    {
        return $query->where('type', 'purchase');
    }

    public function scopeForRent($query)
    {
        return $query->where('type', 'rent');
    }

    public function scopeHandled($query)
    {
        return $query->whereNotNull('handled_by');
    }

    public function scopeUnhandled($query)
    {
        return $query->whereNull('handled_by');
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

    public function isHandled(): bool
    {
        return !is_null($this->handled_by);
    }

    public function isForPurchase(): bool
    {
        return $this->type === 'purchase';
    }

    public function isForRent(): bool
    {
        return $this->type === 'rent';
    }

    public function markAsHandled(User $handler): void
    {
        $this->update([
            'handled_by' => $handler->id,
            'handled_at' => now(),
            'status' => 'contacted',
        ]);
    }
}