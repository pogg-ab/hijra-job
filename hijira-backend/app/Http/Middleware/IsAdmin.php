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

        // Allow superadmin, staff, partner roles as admin users
        if (! $user || ! in_array($user->role, ['superadmin', 'staff', 'partner'], true)) {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        // staff and partner accounts must be active
        if (in_array($user->role, ['staff', 'partner'], true) && $user->account_status !== 'active') {
            return response()->json([
                'message' => 'Your admin account is pending approval or inactive.',
            ], 403);
        }

        return $next($request);
    }
}
