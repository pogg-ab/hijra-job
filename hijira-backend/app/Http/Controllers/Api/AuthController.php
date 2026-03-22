<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ForeignAgency;
use App\Models\JobSeekerProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['required', 'regex:/^(\\+251|0)[0-9]{9}$/'],
            'preferred_language' => ['nullable', 'in:en,am,ar,or'],
            'profile.full_name' => ['required', 'string', 'max:255'],
            'profile.gender' => ['nullable', 'string', 'max:20'],
            'profile.date_of_birth' => ['nullable', 'date'],
            'profile.education_level' => ['nullable', 'string', 'max:255'],
            'profile.experience_summary' => ['nullable', 'string'],
            'profile.skills' => ['nullable', 'array'],
            'profile.skills.*' => ['string', 'max:100'],
        ]);

        $user = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'phone' => $validated['phone'],
                'role' => 'seeker',
                'preferred_language' => $validated['preferred_language'] ?? 'en',
            ]);

            JobSeekerProfile::create([
                'user_id' => $user->id,
                'full_name' => $validated['profile']['full_name'],
                'gender' => $validated['profile']['gender'] ?? null,
                'date_of_birth' => $validated['profile']['date_of_birth'] ?? null,
                'education_level' => $validated['profile']['education_level'] ?? null,
                'experience_summary' => $validated['profile']['experience_summary'] ?? null,
                'skills' => $validated['profile']['skills'] ?? [],
            ]);

            return $user;
        });

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user->load('profile'),
            'token' => $token,
            'auth' => $this->respondWithToken($token),
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $token = auth('api')->attempt($credentials);

        if (! $token) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        $user = auth('api')->user();

        if (in_array($user->role, ['staff', 'partner'], true) && $user->account_status !== 'active') {
            auth('api')->logout();
            return response()->json([
                'message' => 'Your account is pending approval or inactive.',
            ], 403);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'auth' => $this->respondWithToken($token),
        ]);
    }

    public function logout(Request $request)
    {
        auth('api')->logout();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function refresh()
    {
        $token = JWTAuth::parseToken()->refresh();

        return response()->json($this->respondWithToken($token));
    }

    public function me()
    {
        $user = JWTAuth::parseToken()->authenticate();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        return response()->json($user->load(['profile', 'foreignAgency']));
    }

    public function registerPartner(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['required', 'regex:/^(\\+251|0)[0-9]{9}$/'],
            'company_name' => ['required', 'string', 'max:255'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'country' => ['nullable', 'string', 'max:100'],
            'license_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => $validated['password'],
                'phone' => $validated['phone'],
                'role' => 'partner',
                'account_status' => 'pending_approval',
                'preferred_language' => 'en',
            ]);

            $licensePath = $request->file('license_file')->store('agencies/licenses', 'private');

            $agency = ForeignAgency::create([
                'owner_user_id' => $user->id,
                'company_name' => $validated['company_name'],
                'company_email' => $validated['company_email'] ?? null,
                'company_phone' => $validated['company_phone'] ?? null,
                'country' => $validated['country'] ?? null,
                'license_file_path' => $licensePath,
                'status' => 'pending_approval',
            ]);

            return [$user, $agency];
        });

        [$user, $agency] = $result;

        Mail::raw(
            "Foreign agency registration pending approval: {$agency->company_name} ({$user->email})",
            function ($mail) {
                $mail->to('hijraglobal7@gmail.com')->subject('New Foreign Agency Approval Request');
            }
        );

        return response()->json([
            'message' => 'Partner registration received and pending super admin approval.',
            'agency' => $agency,
        ], 201);
    }

    private function respondWithToken(string $token): array
    {
        return [
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => (int) config('jwt.ttl', 60) * 60,
        ];
    }
}
