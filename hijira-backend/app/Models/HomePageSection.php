<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomePageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'title',
        'subtitle',
        'description',
        'content',
        'is_active',
    ];

    protected $casts = [
        'content' => 'array',
        'is_active' => 'boolean',
    ];
}
