<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    protected $fillable = ['name', 'code', 'lga_id', 'description'];

    public function lga()
    {
        return $this->belongsTo(Lga::class);
    }

    public function pollingUnits()
    {
        return $this->hasMany(PollingUnit::class);
    }
}
