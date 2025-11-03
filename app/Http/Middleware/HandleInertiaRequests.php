<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
         $quotes = [
            [
                'message' => 'Explore Morocco and celebrate the world’s game.',
                'author' => 'Atlasia ',
            ],
            [
                'message' => 'Every goal begins with a journey.',
                'author' => 'Moroccan Football Federation',
            ],
            [
                'message' => 'More than football. It’s culture.',
                'author' => 'Atlasia ',
            ],
            [
                'message' => 'Feel the spirit of the game and the beauty of Morocco.',
                'author' => 'Atlasia ',
            ],
        ];


        $quote = collect($quotes)->random();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => $quote,
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
