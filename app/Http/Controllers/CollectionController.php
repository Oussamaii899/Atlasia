<?php

namespace App\Http\Controllers;

use App\Models\Collection;
use Illuminate\Http\Request;


class CollectionController extends Controller
{
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'color' => 'required|string',
    ]);

    $validated['user_id'] = $request->user()->id;

    $collection = Collection::create($validated);

    return response()->json($collection, 201);
}

}
