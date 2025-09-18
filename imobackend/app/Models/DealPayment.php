<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'deal_id',
        'amount',
        'currency',
        'type',
        'paid_at',
        'method',
        'reference',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    // Relationships
    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    // Scopes
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByMethod($query, $method)
    {
        return $query->where('method', $method);
    }

    public function scopeDeposits($query)
    {
        return $query->where('type', 'deposit');
    }

    public function scopeRentPayments($query)
    {
        return $query->where('type', 'rent');
    }

    public function scopeSalePayments($query)
    {
        return $query->where('type', 'sale');
    }

    // Helpers
    public function isDeposit(): bool
    {
        return $this->type === 'deposit';
    }

    public function isRentPayment(): bool
    {
        return $this->type === 'rent';
    }

    public function isSalePayment(): bool
    {
        return $this->type === 'sale';
    }
}