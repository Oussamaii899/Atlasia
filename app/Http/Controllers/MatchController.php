<?php

namespace App\Http\Controllers;

use App\Models\Matche;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatchController extends Controller
{
    public function index()
{
    $matches = Matche::with('place')->orderBy('time_matche')->get();

    return Inertia::render('matches', [
        'matches' => $matches,
    ]);
}
}
