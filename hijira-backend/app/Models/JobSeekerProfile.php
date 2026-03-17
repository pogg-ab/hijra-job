<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobSeekerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'gender',
        'date_of_birth',
        'education_level',
        'experience_summary',
        'skills',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'skills' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
