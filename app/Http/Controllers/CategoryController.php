<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Category;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('categories', [
            'categories' => Category::when($request->search, function ($query, $search) {
                $query->where('nom', 'like', "%$search%")
                      ->orWhere('description', 'like', "%$search%");
            })->paginate(14)->withQueryString()
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
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'position' => 'string',
            'publier' => 'boolean',
            'created_at' => 'datetime',
        ]);

        $data = $request->only(['nom', 'description', 'position', 'publier', 'created_at']);
        Category::create($data);
        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
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
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'position' => 'string',
            'publier' => 'boolean',
            'updated_at' => 'datetime',
        ]);

        $data = $request->only(['nom', 'description', 'position', 'publier', 'updated_at']);
        $category->update($data);
        return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();
        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);
        Category::whereIn('id', $ids)->delete();
    }

    public function togglePublish(Request $request, Category $category)
        {
            $category->update([
                'publier' => $request->input('publier'),
            ]);
        
            return back();
        }

    

}
