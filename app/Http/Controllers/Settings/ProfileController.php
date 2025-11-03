<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
public function update(ProfileUpdateRequest $request): RedirectResponse
{
    // Debug what we're receiving
    \Log::info('Request method: ' . $request->method());
    \Log::info('All request data:', $request->all());
    \Log::info('Files in request:', $request->allFiles());
    \Log::info('Has avatar file: ' . ($request->hasFile('avatar') ? 'true' : 'false'));
    \Log::info('Has banner file: ' . ($request->hasFile('banner') ? 'true' : 'false'));
    \Log::info('Content type: ' . $request->header('Content-Type'));
    
    if ($request->hasFile('avatar')) {
        \Log::info('Avatar file details:', [
            'name' => $request->file('avatar')->getClientOriginalName(),
            'size' => $request->file('avatar')->getSize(),
            'mime' => $request->file('avatar')->getMimeType(),
        ]);
    }

    $user = $request->user();
    $data = $request->validated();

    // Handle avatar upload
    if ($request->hasFile('avatar')) {
        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists(str_replace('/storage/', '', $user->avatar))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
        }
        
        $file = $request->file('avatar');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('avatars', $filename, 'public');
        $data['avatar'] = '/storage/' . $path;
    }

    // Handle banner upload
    if ($request->hasFile('banner')) {
        // Delete old banner if exists
        if ($user->banner && Storage::disk('public')->exists(str_replace('/storage/', '', $user->banner))) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $user->banner));
        }
        
        $file = $request->file('banner');
        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('banners', $filename, 'public');
        $data['banner'] = '/storage/' . $path;
    }

    $user->fill($data);

    if ($user->isDirty('email')) {
        $user->email_verified_at = null;
    }

    $user->save();

    return to_route('profile.edit')->with('status', 'profile-updated');
}

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}