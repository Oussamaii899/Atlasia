<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Place;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use App\Models\Image;
use App\Models\User;



use App\Mail\SendEmail;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class PlaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('places', [
            'places' => Place::with(['category', 'images'])->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%$search%")
                      ->orWhere('description', 'like', "%$search%")
                      ->orWhere('slug', 'like', "%$search%")
                      ->orWhere('id', $search);
            })->paginate(14)->withQueryString(),
            'filters' => $request->only('search'),
            'categories' => Category::select('id', 'nom')->get(),
            'images' => Image::select('id', 'url', 'alt_text')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('CreatePlace', [
            'categories' => Category::select('id', 'nom')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:places,slug',
            'description' => 'required|string',
            'lng' => 'string',
            'lat' => 'string',
            'publier' => 'boolean',
            'email' => 'email',
            'phone' => 'string',
            'address' => 'string',
            'website' => 'string',
            'city' => 'string',
            'category_id' => 'integer|exists:categories,id',
            'rating' => 'numeric',
            'review_count' => 'integer',
            'amenities' => 'array',
            'created_at' => 'datetime',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);
        $user = auth()->user();
        $request->merge(['user_id' => $user->id, 'publier' => false]);
        $data = $request->only(['name','slug', 'description', 'lng','lat', 'publier','email','phone','address','website','city','category_id' , 'created_at', 'rating', 'review_count', 'amenities','user_id']);
        if(Place::where('slug',$request->slug)){
            return back(303)->with('error','slug is already exist');
        }
        $place = Place::create($data);

        if ($request->hasFile('images')) {
        foreach ($request->file('images') as $imageFile) {
            $path = $imageFile->store('Images', 'public');
            $place->images()->create([
                'url' => Storage::url($path),
                'alt_text' => $imageFile->getClientOriginalName(),
            ]);
        }
        }

        $img = Image::where('place_id', $place->id)->first();
        $maildata = [
            'user' => User::where('id',$place->user_id)->first(),
            'place' => $place,
            'image' =>  $img->url,
            'category'=>Category::where('id',$place->category_id)->first() ,
            'link' => route('places.index', ['search' => $place->slug])
        ];
    
        $admin = User::where('role','admin')->get();
        foreach ($admin as $a) {
            Mail::to($a->email)->send(new SendEmail($maildata));
        }

        Mail::to($user->email)->send(new \App\Mail\responseEmail($maildata));
        return back(303)->with('success', 'Place created successfully.');


    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
    public function update(Request $request, Place $place)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255',
            'description' => 'required|string',
            'lng' => 'string',
            'lat' => 'string',
            'publier' => 'boolean',
            'email' => 'email',
            'phone' => 'string',
            'address' => 'string',
            'website' => 'string',
            'city' => 'string',
            'category_id' => 'integer|exists:categories,id',
            'rating' => 'numeric',
            'review_count' => 'integer',
            'amenities' => 'array',
            'updated_at' => 'datetime',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data = $request->only(['name','slug', 'description', 'lng','lat', 'publier','email','phone','address','website','city','category_id' , 'updated_at', 'rating', 'review_count', 'amenities']);
        $place->update($data);

        if ($request->hasFile('images')) {
        foreach ($request->file('images') as $imageFile) {
            $path = $imageFile->store('Images', 'public');
            $place->images()->create([
                'url' => Storage::url($path),
                'alt_text' => $imageFile->getClientOriginalName(),
                'created_at' => now(),
            ]);
        }
    }

        return redirect()->route('places.index')->with('success', 'Place updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Place $place)
    {
        $place->delete();
        return redirect()->route('places.index')->with('success', 'Place deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        Place::whereIn('id', $ids)->delete();
    }

    public function togglePublish(Request $request, Place $place)
        {
            $place->update([
                'publier' => $request->input('publier'),
            ]);
        
            return back();
        }

    public function updateStatus(Request $request, Place $place)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:queue,approved,rejected'
        ]);
        
        $place->update($validated);
        $user = User::where('id',$place->user_id)->first();
        
        $maildata = [
            'user' => User::where('id',$place->user_id)->first(),
            'category'=>Category::where('id',$place->category_id)->first() ,
            'place' => $place
        ];
        Mail::to($user->email)->send(new \App\Mail\responseEmail($maildata));
        return back()->with('success', 'Status updated successfully');
    }

    public function deleteImage(Image $image)
    {
        // Remove file from storage
        if ($image->url) {
            $path = str_replace('/storage/', '', $image->url);
            Storage::disk('public')->delete($path);
        }

        // Remove from database
        $image->delete();

        return back()->with('success', 'Image deleted.');
    }

}
