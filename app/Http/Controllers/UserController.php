<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('users', [
            'users' => User::when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%$search%")
                      ->orWhere('email', 'like', "%$search%");
            })->paginate(14)->withQueryString(),
            'filters' => $request->only('search'),
        ]);
    }

    public function profile(Request $request, $slug): Response
    {
        $user = User::where('slug', $slug)->firstOrFail();

        $user->load([
            'comments' => function ($query) {
                $query->with(['place', 'reactions'])
                      ->orderBy('created_at', 'desc')
                      ->limit(10);
            },
            'ratings' => function ($query) {
                $query->with('place')->orderBy('created_at', 'desc');
            },
            'savedPlaces' => function ($query) {
                $query->limit(10);
            },
            'collections'
        ]);

        $stats = [
            'placesVisited' => $user->savedPlaces->count(),
            'reviewsWritten' => $user->comments->count(),
            'averageRating' => $user->ratings->avg('rating') ? round($user->ratings->avg('rating'), 1) : 0,
            'totalLikes' => $user->comments->sum(fn($comment) => $comment->reactions->where('type', 'like')->count()),
        ];

        $profileData = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => explode('@', $user->email)[0],
            'email' => $user->email,
            'profileImage' => $user->avatar,
            'location' => 'Morocco',
            'joinDate' => $user->created_at->format('M Y'),
            'bio' => $user->bio,
            'stats' => $stats,
            'isOnline' => $user->isOnline(),
            'role' => $user->role,
            'banner' => $user->banner
        ];

        $reviews = $user->comments->map(fn($comment) => [
            'id' => $comment->id,
            'placeName' => $comment->place->name ?? 'Unknown Place',
            'placeType' => $comment->place->type ?? 'Place',
            'placeImage' => $comment->place->image ?? '/placeholder.svg',
            'rating' => $comment->rating ?? 5,
            'content' => $comment->content,
            'date' => $comment->created_at->format('M d, Y'),
            'likes' => $comment->reactions->where('type', 'like')->count(),
            'replies' => 0
        ]);

        $ratingBreakdown = [
            '5' => $user->ratings->where('rating', 5)->count(),
            '4' => $user->ratings->where('rating', 4)->count(),
            '3' => $user->ratings->where('rating', 3)->count(),
            '2' => $user->ratings->where('rating', 2)->count(),
            '1' => $user->ratings->where('rating', 1)->count(),
        ];

        return Inertia::render('profil', [
            'user' => $profileData,
            'reviews' => $reviews,
            'ratingBreakdown' => $ratingBreakdown,
            'isCurrentUser' => Auth::id() === $user->id,
            'canEdit' => Auth::id() === $user->id || Auth::user()->isAdmin()
        ]);
    }

    public function create() {}

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'role' => 'required|string|in:admin,user',
            'created_at' => 'datetime',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only(['name', 'email', 'role', 'created_at', 'avatar']);
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $filename = time().'_'.$file->getClientOriginalName();
            $path = $file->storeAs('avatars', $filename, 'public');
            $data['avatar'] = '/storage/'.$path;
        }

        User::create($data);
        return redirect()->route('users.index')->with('success', 'User created successfully.');
    }

    public function show(string $id) {
        return $this->profile(request(), $id);
    }

    public function edit(string $id) {}

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:admin,user',
            'updated_at' => 'datetime',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        $data = $request->only(['name', 'email', 'role', 'updated_at', 'avatar']);
    if ($request->hasFile('avatar')) {
        $file = $request->file('avatar');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('avatars', $filename , 'public');
        $data['avatar'] = '/storage/' . $path;

    }

        $user->update($data);
        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        User::whereIn('id', $ids)->delete();
    }
}
