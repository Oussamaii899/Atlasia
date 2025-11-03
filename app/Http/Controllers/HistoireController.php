<?php

namespace App\Http\Controllers;

use App\Models\Histoire;
use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HistoireController extends Controller
{

    public function index()
        {
            $userId = auth()->id(); 

            $histoires = Histoire::where('user_id', $userId)->get();
            
            $places = Place::whereIn('id', $histoires->pluck('place_id'))
                           ->with('images', 'category')
                           ->get();

            return inertia('history', [
                'histoires' => $histoires,
                'places' => $places,
                'category' => $places->pluck('category')->unique(),
                'userId' => $userId,
            ]);
        }

    public function store(Request $request)
        {
            $validated = $request->validate([
                'user_id' => 'required|exists:users,id',
                'place_id' => 'required|exists:places,id',
            ]);

            Histoire::updateOrInsert([
                'user_id' => $validated['user_id'],
                'place_id' => $validated['place_id'],
            ],
            [
                'updated_at' => now(),
                'created_at' => now(), 
            ]
        );
        
            Place::where('id', $validated['place_id'])
                ->increment('review_count', 1); // Increment the history count for the place

            return response()->json(['message' => 'History saved']);
        }
    public function destroy($placeId)
        {
            $userId = auth()->id(); 

            DB::table('histoire')
                ->where('user_id', $userId)
                ->where('place_id', $placeId)
                ->delete();

            return redirect()->back()->with('success', 'History entry deleted successfully.');
        }


}
