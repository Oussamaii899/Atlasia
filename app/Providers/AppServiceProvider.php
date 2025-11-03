<?php

namespace App\Providers;

use Inertia\Inertia;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
         Inertia::share([
        'flash' => function () {
            return [
                'fragment' => session()->get('fragment'),
            ];
        },
        'auth' => function () {
            return [
                'user' => Auth::user(),
            ];
        },
    ]);
    }
}
