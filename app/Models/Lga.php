<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lga extends Model
{
    protected $fillable = ['name', 'code', 'description'];

    public function wards()
    {
        return $this->hasMany(Ward::class);
    }

    public function pollingUnits()
    {
        return $this->hasManyThrough(PollingUnit::class, Ward::class);
    }
}
