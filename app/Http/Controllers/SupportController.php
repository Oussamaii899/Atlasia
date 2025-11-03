<?php

namespace App\Http\Controllers;

use App\Models\Support;
use Illuminate\Http\Request;

use Inertia\Inertia;

class SupportController extends Controller
{
    public function index()
    {
        return Inertia::render('support');
    }
    public function store(Request $request)
{
    $validated = $request->validate([
        'subject' => 'required|string|min:5',
        'category' => 'required|string',
        'message' => 'required|string|min:10',
    ]);

    $support = Support::create([
        'user_id' => auth()->id(),
        'subject' => $validated['subject'],
        'category' => $validated['category'],
        'message' => $validated['message'],
    ]);

    return response()->json(['ticketId' => $support->id], 201);
}
}
