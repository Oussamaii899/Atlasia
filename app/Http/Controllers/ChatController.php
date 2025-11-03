<?php

namespace App\Http\Controllers;

use App\Models\Chat;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index()
    {
        $currentUserId = auth()->id();

        $users = User::where('id', '!=', $currentUserId)
            ->whereHas('sentMessages', function($query) use ($currentUserId) {
                $query->where('receiver_id', $currentUserId);
            })
            ->orWhereHas('receivedMessages', function($query) use ($currentUserId) {
                $query->where('sender_id', $currentUserId);
            })
            ->withCount(['sentMessages as unseen_count' => function ($query) use ($currentUserId) {
                $query->where('receiver_id', $currentUserId)
                      ->whereNull('seen_at'); 
            }])
            ->get()
            ->map(function ($user) {
                
                $lastMessage = Chat::where(function ($query) use ($user) {
                    $query->where('sender_id', auth()->id())
                          ->where('receiver_id', $user->id);
                })->orWhere(function ($query) use ($user) {
                    $query->where('sender_id', $user->id)
                          ->where('receiver_id', auth()->id());
                })->latest()->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'isOnline' => $user->isOnline(),
                    'unreadCount' => $user->unseen_count,
                    'lastMessage' => $lastMessage ? $lastMessage->content : 'No messages yet',
                    'timestamp' => $lastMessage ? $lastMessage->created_at : '',
                ];
            });

        return Inertia::render('chat', [
            'users' => $users,
            'allUsers' => User::select('id', 'name', 'email', 'avatar', 'last_activity')
                ->where('id', '!=', $currentUserId) 
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar,
                        'isOnline' => $user->isOnline(),
                    ];
                }),
        ]);
    }

    public function store(Request $request)
    {
        $message = Chat::create([
            'sender_id' => auth()->id(),       
            'receiver_id' => $request->user_id,
            'content' => $request->content,
        ]);

        return response()->json($message);
    }

    public function getMessages(User $user)
    {
        $currentUser = auth()->id();

        $messages = Chat::where(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $currentUser)
                  ->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($currentUser, $user) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', $currentUser);
        })->orderBy('created_at')->get();

        return response()->json($messages);
    }

    public function chatPage(User $user)
    {
        $currentUser = auth()->user();

        $users = User::select('id', 'name', 'email', 'avatar', 'last_activity')
                    ->where('id', '!=', $currentUser->id) 
                    ->get()
                    ->map(function ($u) {
                        $lastMessage = Chat::where(function ($query) use ($u) {
                            $query->where('sender_id', auth()->id())
                                  ->where('receiver_id', $u->id);
                        })->orWhere(function ($query) use ($u) {
                            $query->where('sender_id', $u->id)
                                  ->where('receiver_id', auth()->id());
                        })->latest()->first();

                        $unreadCount = Chat::where('sender_id', $u->id)
                            ->where('receiver_id', auth()->id())
                            ->whereNull('seen_at')
                            ->count();

                        return [
                            'id' => $u->id,
                            'name' => $u->name,
                            'email' => $u->email,
                            'avatar' => $u->avatar,
                            'isOnline' => $u->isOnline(),
                            'unreadCount' => $unreadCount,
                            'lastMessage' => $lastMessage ? $lastMessage->content : 'No messages yet',
                            'timestamp' => $lastMessage ? $lastMessage->created_at : '',
                        ];
                    });

        return Inertia::render('chat', [
            'users' => $users,
            'selectedUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'avatar' => $user->avatar,
                'isOnline' => $user->isOnline(),
            ],
            'allUsers' => User::select('id', 'name', 'email', 'avatar', 'last_activity')
                ->where('id', '!=', $currentUser->id) 
                ->get()
                ->map(function ($u) {
                    return [
                        'id' => $u->id,
                        'name' => $u->name,
                        'email' => $u->email,
                        'avatar' => $u->avatar,
                        'isOnline' => $u->isOnline(),
                    ];
                }),
            'currentUser' => $currentUser,
        ]);
    }

    public function show(User $user)
    {
        $messages = Chat::where(function ($query) use ($user) {
            $query->where('sender_id', auth()->id())
                  ->where('receiver_id', $user->id);
        })->orWhere(function ($query) use ($user) {
            $query->where('sender_id', $user->id)
                  ->where('receiver_id', auth()->id());
        })->orderBy('created_at')->get();

        Chat::where('sender_id', $user->id)
            ->where('receiver_id', auth()->id())
            ->where('seen_at', 0)
            ->update(['seen_at' => 1]); 

        return response()->json($messages);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $request->validate([
         'content' => 'required|string|max:1000',
        ]);

        $message = Chat::findOrFail($id);

        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->content = $request->input('content');
        $message->save();

        return response()->json([
            'id' => $message->id,
            'content' => $message->content,
            'updated_at' => $message->updated_at,
        ]);
    }

    public function destroy($id)
    {
        $user = Auth::user();

        $message = Chat::findOrFail($id);

        if ($message->sender_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->delete();

        return response()->json(['success' => true]);
    }

    public function toggleSeen(User $user)
    {
        $currentUserId = auth()->id();

        $messages = Chat::where('sender_id', $user->id)
            ->where('receiver_id', $currentUserId)
            ->get();

        foreach ($messages as $message) {
            $message->seen_at = $message->seen_at == 1 ? 0 : 1;
            $message->save();
        }

        return response()->json(['success' => true]);
    }
}