<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Deal extends Model
{
    use HasFactory;

    protected $fillable = [
        'inquiry_id',
        'listing_id',
        'client_id',
        'admin_id',
        'type',
        'agreed_price',
        'currency',
        'deposit_amount',
        'lease_months',
        'start_date',
        'end_date',
        'status',
        'contract_file',
        'notes',
    ];

    protected $casts = [
        'agreed_price' => 'decimal:2',
        'deposit_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    // Relationships
    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(DealPayment::class);
    }

    // Scopes
    public function scopeForPurchase($query)
    {
        return $query->where('type', 'purchase');
    }

    public function scopeForRent($query)
    {
        return $query->where('type', 'rent');
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSigned($query)
    {
        return $query->where('status', 'signed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Helpers
    public function isForPurchase(): bool
    {
        return $this->type === 'purchase';
    }

    public function isForRent(): bool
    {
        return $this->type === 'rent';
    }

    public function isSigned(): bool
    {
        return $this->status === 'signed';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function getTotalPaidAmount(): float
    {
        return $this->payments()->sum('amount');
    }

    public function getRemainingAmount(): float
    {
        return $this->agreed_price - $this->getTotalPaidAmount();
    }
}