<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AboutPageSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'title',
        'description',
        'content',
        'order',
        'is_active',
    ];

    protected $casts = [
        'content' => 'array',
        'is_active' => 'boolean',
        'order' => 'integer',
    ];
}