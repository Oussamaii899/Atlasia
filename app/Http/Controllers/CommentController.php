<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Comment;
use App\Models\Reply;

class CommentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('comments', [
            'comments' => Comment::when($request->search, function ($query, $search) {
                $query->where('content', 'like', "%$search%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%$search%")
                          ->orWhere('email', 'like', "%$search%");
                    });
            })->with(['user', 'place', 'replies'])
            ->paginate(14)->withQueryString()
            ,
            'filters' => $request->only('search'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $comment = Comment::with(['user', 'place', 'replies', 'replies.user'])->findOrFail($id);
        return Inertia::render('comment-detail', [
            'comment' => $comment,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comment $comment)
    {

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comment $comment)
    {
        $comment->delete();
        return redirect()->route('comments.index')->with('success', 'comment deleted successfully.');
    }
    public function destroyR(Reply $reply)
    {
        $reply->delete();
        return redirect()->back()->with('success', 'reply deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        Comment::whereIn('id', $ids)->delete();
    }
    public function bulkDeleteR(Request $request)
    {
        $ids = $request->input('ids', []);
        Reply::whereIn('id', $ids)->delete();
    }

    public function togglePublish(Request $request, Comment $comment)
        {
            $comment->update([
                'is_published' => $request->input('is_published'),
            ]);
        
            return back();
        }
    public function togglePublishR(Request $request, Reply $reply)
        {
            $reply->update([
                'is_published' => $request->input('is_published'),
            ]);
        
            return back();
        }

    

}
