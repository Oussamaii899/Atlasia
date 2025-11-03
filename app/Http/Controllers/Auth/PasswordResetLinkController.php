<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Http;
use App\Models\User;

class PasswordResetLinkController extends Controller
{
    /**
     * Show the password reset link request page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/forgot-password', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->firstOrFail();

        $token = Password::createToken($user);
        $resetLink = url("/reset-password/{$token}?email=" . urlencode($user->email));

        $response = Http::withHeaders([
            'accept' => 'application/json',
            'api-key' => env('BREVO_API_KEY'),
            'content-type' => 'application/json',
        ])->post('https://api.brevo.com/v3/smtp/email', [
            'sender' => [
                'name' => 'Atlasia',
                'email' => 'youremail@example.com',
            ],
            'to' => [[
                'email' => $user->email,
                'name' => $user->name,
            ]],
            'subject' => 'Password Reset Request',
            'htmlContent' => '<h1>Reset Your Password</h1><p>Click the link below to reset your password:</p><a href="' . $resetLink . '">' . $resetLink . '</a>',
        ]);
        
        dd($response->body());
        if ($response->successful()) {
            return back()->with('status', 'Password reset link sent successfully!');
        } else {
            \Log::error('Brevo email failed', ['response' => $response->body()]);
            return back()->withErrors(['email' => 'Failed to send password reset link.']);
        }
    }
}
