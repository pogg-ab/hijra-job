<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/partner/register', [AuthController::class, 'registerPartner']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::get('/jobs', [JobController::class, 'index']);
Route::get('/jobs/{job}', [JobController::class, 'show']);
Route::post('/contact', [ContactController::class, 'store']);

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    Route::post('/documents/upload', [DocumentController::class, 'upload']);

    Route::post('/jobs/{job}/apply', [ApplicationController::class, 'apply']);
    Route::get('/my-applications', [ApplicationController::class, 'myApplications']);

    Route::prefix('partner')->middleware('isPartner')->group(function () {
        Route::post('/jobs', [JobController::class, 'partnerStore']);
        Route::get('/applications/shortlisted', [ApplicationController::class, 'partnerShortlisted']);
        Route::patch('/applications/{application}/action', [ApplicationController::class, 'partnerAction']);
    });

    Route::prefix('admin')->middleware('isAdmin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);

        Route::post('/jobs', [JobController::class, 'store']);
        Route::patch('/jobs/{job}', [JobController::class, 'update']);
        Route::patch('/jobs/{job}/publish', [JobController::class, 'publish']);
        Route::patch('/jobs/{job}/close', [JobController::class, 'close']);

        Route::get('/applications', [ApplicationController::class, 'adminIndex']);
        Route::patch('/applications/{application}/status', [ApplicationController::class, 'updateStatus']);

        Route::get('/documents', [DocumentController::class, 'index']);
        Route::patch('/documents/{document}/status', [DocumentController::class, 'updateStatus']);
        Route::get('/documents/{document}/download', [DocumentController::class, 'download']);
    });

    Route::prefix('super-admin')->middleware('isSuperAdmin')->group(function () {
        Route::post('/staff', [AdminController::class, 'createStaff']);
        Route::get('/foreign-agencies/pending', [AdminController::class, 'pendingAgencies']);
        Route::patch('/foreign-agencies/{foreignAgency}/review', [AdminController::class, 'reviewAgency']);
        Route::get('/foreign-agencies/{foreignAgency}/license', [AdminController::class, 'downloadAgencyLicense']);
    });
});
