<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load(['profile', 'documents', 'applications.job']);

        return response()->json($user);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'regex:/^(\\+251|0)[0-9]{9}$/'],
            'preferred_language' => ['sometimes', 'in:en,am,ar,or'],
            'profile.full_name' => ['sometimes', 'string', 'max:255'],
            'profile.gender' => ['nullable', 'string', 'max:20'],
            'profile.date_of_birth' => ['nullable', 'date'],
            'profile.education_level' => ['nullable', 'string', 'max:255'],
            'profile.experience_summary' => ['nullable', 'string'],
            'profile.skills' => ['nullable', 'array'],
            'profile.skills.*' => ['string', 'max:100'],
        ]);

        $user = $request->user();

        $userData = array_filter(
            $validated,
            fn ($key) => in_array($key, ['name', 'phone', 'preferred_language'], true),
            ARRAY_FILTER_USE_KEY
        );

        if ($userData !== []) {
            $user->update($userData);
        }

        if (isset($validated['profile'])) {
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $validated['profile']
            );
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->load('profile'),
        ]);
    }
}
