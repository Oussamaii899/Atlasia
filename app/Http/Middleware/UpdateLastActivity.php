<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class UpdateLastActivity
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check()) {
            auth()->user()->update(['last_activity' => now()]);
        }

        return $next($request);
    }
}
