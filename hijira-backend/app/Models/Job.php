<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'category',
        'country',
        'salary_range',
        'status',
        'job_status',
        'is_high_level',
        'vacancies_total',
        'vacancies_filled',
        'created_by_user_id',
        'foreign_agency_id',
    ];

    protected $casts = [
        'title' => 'array',
        'description' => 'array',
        'is_high_level' => 'boolean',
    ];

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function foreignAgency()
    {
        return $this->belongsTo(ForeignAgency::class);
    }
}
