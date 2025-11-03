<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Category;
use App\Models\Comment;
use App\Models\Histoire;
use App\Models\Place;
use App\Models\Save;
use App\Models\Support;
use App\Models\Matche;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;


class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        if ($user->role === 'admin') {
            return $this->adminDashboard();
        }
        
        return $this->userDashboard($user);
    }
    
    private function adminDashboard()
    {
        // Cache expensive queries for 5 minutes
        $dashboardData = Cache::remember('admin_dashboard_data', 300, function () {
            return [
                'totalUsers' => User::count(),
                'totalPlaces' => Place::count(),
                'monthlyUsers' => $this->getMonthlyUserCount(),
                'monthlyPlaces' => $this->getMonthlyPlaceCount(),
                'userTrend' => $this->calculateUserTrend(),
                'placeTrend' => $this->calculatePlaceTrend(),
            ];
        });
        
        // Don't cache real-time data
        $supports = Support::with('user:id,name')
            ->latest()
            ->take(10)
            ->get();
            
        $comments = Comment::with('user:id,name')
            ->latest()
            ->take(5)
            ->get();

        // Add recent users data
        $recentUsers = User::select('id', 'name', 'email', 'role', 'created_at')
            ->latest()
            ->take(8)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'created_at' => $user->created_at->toISOString(),
                    'avatar' => null, // Add avatar logic if you have user avatars
                ];
            });
        
        return Inertia::render('dashboard', array_merge($dashboardData, [
            'user' => auth()->user(),
            'supports' => $supports,
            'comments' => $comments,
            'recentUsers' => $recentUsers,
            'isAdmin' => true,
        ]));
    }
    
    private function userDashboard($user)
    {
        // Optimize user-specific queries
        $userStats = [
            'placesVisited' => Histoire::where('user_id', $user->id)->count(),
            'favorites' => Save::where('user_id', $user->id)->count(),
            'reviews' => Comment::where('user_id', $user->id)->count(),
        ];
        
        // Fix the recent places query to matche your database structure
        $recentPlaces = Histoire::with(['place' => function($query) {
                $query->select('id', 'name', 'city', 'rating', 'category_id')
                      ->with('category:id,nom'); // Load category relationship
            }])
            ->where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($history) {
                if (!$history->place) {
                    return null; // Skip if place doesn't exist
                }
                
                return [
                    'id' => $history->place->id,
                    'name' => $history->place->name,
                    'category' => $history->place->category ? $history->place->category->nom : 'Unknown',
                    'location' => $history->place->city,
                    'rating' => $history->place->rating,
                    'lastViewed' => $history->created_at->diffForHumans(),
                ];
            })
            ->filter() // Remove null values
            ->values(); // Reset array keys
            
        // Fix the favorite spots query
        $favoriteSpots = Save::with(['place' => function($query) {
                $query->select('id', 'name', 'city', 'rating', 'category_id')
                      ->with('category:id,nom'); // Load category relationship
            }])
            ->where('user_id', $user->id)
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($save) {
                if (!$save->place) {
                    return null; // Skip if place doesn't exist
                }
                
                return [
                    'id' => $save->place->id,
                    'name' => $save->place->name,
                    'category' => $save->place->category ? $save->place->category->nom : 'Unknown',
                    'location' => $save->place->city,
                    'rating' => $save->place->rating,
                ];
            })
            ->filter() // Remove null values
            ->values(); // Reset array keys
        $upcomingMatches = Matche::with('place')
            ->where('time_matche', '>=', today())
            ->orderBy('time_matche')
            ->take(5)
            ->get()
            ->map(function ($match) {
                return [
                    'id' => $match->id,
                    'match' => "{$match->team_A} vs {$match->team_B}",
                    'stadium' => $match->place?->name ?? 'Unknown Stadium',
                    'date' => \Carbon\Carbon::parse($match->time_matche)->format('M d, Y'),
                    'time' => '',
                ];
            });
        
        return Inertia::render('dashboard', [
            'user' => $user,
            'userStats' => $userStats,
            'recentPlaces' => $recentPlaces,
            'favoriteSpots' => $favoriteSpots,
            'isAdmin' => false,
            'upcomingMatches' => $upcomingMatches
        ]);
    }
    
    private function getMonthlyUserCount(): int
    {
        return User::whereBetween('created_at', [
            now()->startOfMonth(),
            now()->endOfMonth()
        ])->count();
    }
    
    private function getMonthlyPlaceCount(): int
    {
        return Place::whereBetween('created_at', [
            now()->startOfMonth(),
            now()->endOfMonth()
        ])->count();
    }
    
    private function calculateUserTrend(): float
    {
        $currentMonth = $this->getMonthlyUserCount();
        $previousMonth = User::whereBetween('created_at', [
            now()->subMonth()->startOfMonth(),
            now()->subMonth()->endOfMonth()
        ])->count();
        
        if ($previousMonth === 0) {
            return $currentMonth > 0 ? 100 : 0;
        }
        
        return round((($currentMonth - $previousMonth) / $previousMonth) * 100, 2);
    }
    
    private function calculatePlaceTrend(): float
    {
        $currentMonth = $this->getMonthlyPlaceCount();
        $previousMonth = Place::whereBetween('created_at', [
            now()->subMonth()->startOfMonth(),
            now()->subMonth()->endOfMonth()
        ])->count();
        
        if ($previousMonth === 0) {
            return $currentMonth > 0 ? 100 : 0;
        }
        
        return round((($currentMonth - $previousMonth) / $previousMonth) * 100, 2);
    }
}