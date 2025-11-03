<?php

namespace App\Http\Controllers;

use App\Models\Place;
use App\Models\Save;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;


class SaveController extends Controller
{
public function index()
{
    $user = Auth::user();

    $collections = $user->collections;

    $places = $user->savedPlaces()
        ->where('publier',true)
        ->get()
        ->map(function ($place) {
            return [
                'id' => $place->id,
                'name' => $place->name,
                'description' => $place->description,
                'collectionId' => $place->pivot->collection_id ?? null,
            ];
        });

    return Inertia::render('saves', [
        'places' => $places,
        'collections' => $collections,
        'userId' => $user->id
    ]);
}
public function toggle(Place $place)
{
    $userId = Auth::id();

    $alreadySaved = DB::table('saves')
        ->where('user_id', $userId)
        ->where('place_id', $place->id)
        ->exists();

    if ($alreadySaved) {
        DB::table('saves')
            ->where('user_id', $userId)
            ->where('place_id', $place->id)
            ->delete();

        return back(303)->with('status' , 'unsaved');
    } else {
        DB::table('saves')->insert([
            'user_id' => $userId,
            'place_id' => $place->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back(303)->with('status','saved');
    }
}
public function assign(Request $request)
{
    $validated = $request->validate([
        'user_id' => 'required|exists:users,id',
        'place_id' => 'required|exists:places,id',
        'collection_id' => 'required|exists:collection,id',
    ]);

    $save = Save::updateOrCreate(
        [
            'user_id' => $validated['user_id'],
            'place_id' => $validated['place_id'],
        ],
        [
            'collection_id' => $validated['collection_id'],
        ]
    );

    return response()->json($save);
}
public function savedPlaces()
{
    $user = auth()->user();

    $places = $user->savedPlaces()->latest()->paginate(10);

    return Inertia::render('Places/Saves', [
        'places' => $places,
        'filters' => request()->only('search')
    ]);
}
    public function destroy($placeId, Request $request)
    {
        $user = auth()->user();

        
        $user->places()->detach($placeId); 

        return redirect()->route('saves.index')->with('message' , 'Place unsaved successfully');
    }






}


