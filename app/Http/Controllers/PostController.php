<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Place;
use App\Models\Comment;
use App\Models\Reply;
use App\Models\Commentreaction;
use App\Models\Replyreaction;

class PostController extends Controller
{
    
public function index(Request $request)
{
    
    $query = Place::query()
        ->with([
            'category:id,nom',
            'images:id,place_id,url',
            'comments' => function ($q) {
                $q->where('is_published', true)
                  ->withCount(['reactions'])
                  ->with(['user:id,name,slug', 'replies' => function ($qr) {
                      $qr->where('is_published', true)
                         ->withCount(['reactions'])
                         ->with(['user:id,name,slug']);
                  }]);
            },
        ])
        ->where('publier', true);

    // Search filter
    if ($request->filled('search')) {
        $query->where('name', 'like', '%' . $request->search . '%');
    }

    // Category filter
    if (is_array($request->categories) && !empty($request->categories)) {
        $query->whereHas('category', function ($q) use ($request) {
            $q->whereIn('nom', $request->categories);
        });
    } elseif ($request->filled('category')) {
    $query->whereHas('category', function ($q) use ($request) {
        $q->where('nom', $request->category);
    });
    }

    // City filter
    if (is_array($request->cities) && !empty($request->cities)) {
        $query->whereIn('city', $request->cities); // Adjust 'city' column name if needed
    }

    // Minimum rating filter
    if (is_numeric($request->min_rating)) {
        $query->where('rating', '>=', (float) $request->min_rating);
    }

    // Minimum review count filter
    if ($request->filled('min_reviews')) {
        $minReviews = (int) $request->min_reviews;
        $query->where('review_count', '>=', $minReviews);
    }

    // Sorting logic
    switch ($request->sort) {
        case 'latest':
            $query->orderBy('created_at', 'desc');
            break;

        case 'oldest':
            $query->orderBy('created_at', 'asc');
            break;

        case 'most_comments':
            // Count only published comments and published replies (using new relation)
            $query->withCount([
                'comments' => function ($q) {
                    $q->where('is_published', true);
                },
                'publishedReplies',
            ])->orderByRaw('(comments_count + published_replies_count) DESC');
            break;

        case 'rating':
            $query->orderBy('rating', 'desc');
            break;

        case 'popular':
            $query->orderBy('review_count', 'desc');
            break;

        default:
            $query->orderBy('created_at', 'desc');
            break;
    }

    $places = $query->paginate(12)->appends($request->all());
    $search = $request->query('search');
    $category = $request->input('category');


    $savedPlaceIds = auth()->check()
        ? auth()->user()->savedPlaces()->pluck('places.id')
        : collect();

    return Inertia::render('posts', [
        'places' => $places,
        'search' => $search,
        'savedPlaceIds' => $savedPlaceIds,
        'userId' => auth()->id(),
        'filters' => [
            'search' => $request->search,
            'categories' => $request->categories ?? ($request->filled('category') ? [$request->category] : []),
            'cities' => $request->cities ?? [],
            'min_rating' => $request->min_rating ?? 0,
            'min_reviews' => $request->min_reviews ?? 0,
            'sort' => $request->sort ?? '',
        ],
    ]);
}




public function show($slug)
{
    $place = Place::with([
        'images',
        'category',
        'ratings',
        'comments' => function ($query) {
            $query->where('is_published', true)
                  ->with([
                      'user:id,name,avatar,slug',
                      'reactions',
                      'replies' => function ($q) {
                          $q->where('is_published', true)
                            ->with(['user:id,name,avatar'])
                            ->withCount('reactions');
                      }
                  ])
                  ->withCount('reactions');
        },
    ])->where('publier', true)->where('slug', $slug)->firstOrFail();

    $savedPlaceIds = auth()->check()
        ? auth()->user()->savedPlaces()->pluck('places.id')->toArray()
        : [];

    $userRating = auth()->check()
        ? $place->ratings()->where('user_id', auth()->id())->first()
        : null;

    $reviewCount = $place->ratings()->count();

    return Inertia::render('place-detail', [
        'place' => $place,
        'comments' => $place->comments,
        'category' => $place->category,
        'savedPlaceIds' => $savedPlaceIds,
        'user' => auth()->user(),
        'userRating' => $userRating?->rating ?? 0,
        'RCount' => $reviewCount,
    ]);
}


        public function storeComment(Request $request, Place $place)
    {
        $request->validate([
            'content' => 'required|string',
        ]);
        $place->comments()->create([
            'user_id' => auth()->id(),
            'content' => $request->input('content'),
        ]);
        return back(303)->with('fragment', 'comments');
    }

    public function likeComment(Request $request, Comment $comment)
    {
        $request->validate([
            'reaction' => 'required|in:like,dislike',
        ]);

        $existingReaction = $comment->reactions()
            ->where('user_id', auth()->id())
            ->first();

        if ($existingReaction) {
            if ($existingReaction->reaction === $request->input('reaction')) {
                
                $existingReaction->delete();
            } else {
               
                $existingReaction->update(['reaction' => $request->input('reaction')]);
            }
        } else {
            
            $comment->reactions()->create([
                'user_id' => auth()->id(),
                'reaction' => $request->input('reaction')
            ]);
        }

        $comment->update([
            'likes' => $comment->reactions()->where('reaction', 'like')->count(),
            'dislikes' => $comment->reactions()->where('reaction', 'dislike')->count()
        ]);

       

        return back(303)->with('fragment', 'comment-' . $comment->id);
    }
    
    public function storeReply(Request $request, Comment $comment)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $comment->replies()->create([
            'user_id' => auth()->id(),
            'content' => $request->input('content'),
        ]);

        return back(303)->with('fragment', 'comment-' . $comment->id);
    }

    public function likeReply(Request $request, Reply $reply)
    {
        $request->validate([
            'reaction' => 'required|in:like,dislike',
        ]);

        $existingReaction = $reply->reactions()
            ->where('user_id', auth()->id())
            ->first();

        if ($existingReaction) {
            if ($existingReaction->reaction === $request->input('reaction')) {
                
                $existingReaction->delete();
            } else {
               
                $existingReaction->update(['reaction' => $request->input('reaction')]);
            }
        } else {
            
            $reply->reactions()->create([
                'user_id' => auth()->id(),
                'reaction' => $request->input('reaction')
            ]);
        }

        $reply->update([
            'likes' => $reply->reactions()->where('reaction', 'like')->count(),
            'dislikes' => $reply->reactions()->where('reaction', 'dislike')->count()
        ]);

       

        return back(303)->with('fragment', 'reply-'.$reply->id);
    }


    public function reload(){
        // Update comment reactions
        $comments = Comment::all();
        foreach($comments as $comment) {
            $comment->update([
                'likes' => $comment->reactions()->where('reaction', 'like')->count(),
                'dislikes' => $comment->reactions()->where('reaction', 'dislike')->count()
            ]);
        }

        // Update reply reactions
        $replies = Reply::all();
        foreach($replies as $reply) {
            $reply->update([
                'likes' => $reply->reactions()->where('reaction', 'like')->count(),
                'dislikes' => $reply->reactions()->where('reaction', 'dislike')->count()
            ]);
        }

        $places = Place::all();
        foreach($places as $place) {
            $slug = \Str::slug($place->name);
            $place->slug = $slug;
            $status = 'approved';
            $place->status = $status;
            $place->save();
        }

        $users = \App\Models\User::all();
        foreach($users as $user) {
            $slug = \Str::slug($user->name);
            $user->slug = $slug;
            $user->save();
        }

        return back(303);
    }

    public function destroyComment(Comment $comment)
    {
        $comment->delete();
        return back(303)->with('fragment', 'comments');
    }
    //destory reply
    public function destroyReply(Reply $reply)
    {
        $reply->delete();
        return back(303)->with('fragment', 'comment-' . $reply->comment_id);
    }

    //edit comment
    public function editComment(Request $request, Comment $comment)
    {
        $request->validate([
            'content' => 'required|string',
        ]);
        $comment->update([
            'content' => $request->input('content'),
        ]);
        return back(303)->with('fragment', 'comment-' . $comment->id);
    }
    //edit reply
    public function editReply(Request $request, Reply $reply)
    {
        $request->validate([
            'content' => 'required|string',
        ]);
        $reply->update([
            'content' => $request->input('content'),
        ]);
        return back(303)->with('fragment', 'reply-' . $reply->id);
    }


 public function rate(Request $request, Place $place)
{
    $request->validate([
        'rating' => 'required|integer|min:1|max:5',
    ]);

    // Create or update the user's rating
    $place->ratings()->updateOrCreate(
        ['user_id' => auth()->id()],
        ['rating' => $request->input('rating')]
    );

    $avgRating = $place->ratings()->avg('rating');
    $reviewCount = $place->ratings()->count();
    
    $place->update([
        'rating' => round($avgRating, 2),
    ]);

    // Return the updated place data
    return back()->with([
        'success' => 'Rating submitted successfully',
        'place' => $place->fresh(['ratings']),
        'Rcount' => $reviewCount,
    ]);
}

public function destroyRating(Place $place)
{
    $place->ratings()->where('user_id', auth()->id())->delete();

    // Recalculate the average rating and review count
    $avgRating = $place->ratings()->avg('rating') ?: 0;
    $reviewCount = $place->ratings()->count();
    
    $place->update([
        'rating' => round($avgRating, 2),
    ]);

    return back()->with([
        'success' => 'Rating removed successfully',
        'place' => $place->fresh(['ratings']),
        'Rcount' => $reviewCount
    ]);
}

}