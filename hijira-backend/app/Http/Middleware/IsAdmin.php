<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        if (($user->admin_type === 'partner' || $user->admin_type === 'staff') && $user->account_status !== 'active') {
            return response()->json([
                'message' => 'Your admin account is pending approval or inactive.',
            ], 403);
        }

        return $next($request);
    }
}
