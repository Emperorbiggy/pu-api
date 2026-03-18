<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PollingUnit extends Model
{
    protected $fillable = ['name', 'code', 'ward_id', 'registered_voters', 'description'];

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function lga()
    {
        return $this->hasOneThrough(Lga::class, Ward::class);
    }
}
