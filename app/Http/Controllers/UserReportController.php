<?php

namespace App\Http\Controllers;

use App\Models\Support;
use App\Models\SupportResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserReportController extends Controller
{
    /**
     * Display a listing of the user's reports
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isUser()) {
            return redirect()->route('reports.index'); 
        }

        $query = Support::with(['responses.adminUser'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%")
                  ->orWhere('reported_user_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $reports = $query->paginate(10)->withQueryString();

        return Inertia::render('UserReports', [
            'reports' => $reports,
            'filters' => $request->only(['search', 'status', 'category']),
            'user' => $user
        ]);
    }

    /**
     * Show the form for creating a new report
     */
    public function create()
    {
        $user = Auth::user();
        
        if (!$user->isUser()) {
            abort(403, 'Access denied.');
        }

        return Inertia::render('CreateUserReport', [
            'user' => $user
        ]);
    }

    /**
     * Store a newly created report
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->isUser()) {
            abort(403, 'Access denied.');
        }

        $rules = [
            'subject' => 'required|string|max:255',
            'category' => 'required|string|in:bug,feature,support,user,abuse,other',
            'message' => 'required|string|max:5000',
            'priority' => 'sometimes|string|in:low,medium,high,urgent'
        ];

        if ($request->category === 'user') {
            $rules['reported_user_name'] = 'required|string|max:255';
        } elseif (in_array($request->category, ['abuse'])) {
            $rules['reported_user_name'] = 'nullable|string|max:255';
        }

        $validated = $request->validate($rules);

        $validated['user_id'] = Auth::id();
        $validated['status'] = 'open';
        $validated['priority'] = $validated['priority'] ?? 'medium';

        $report = Support::create($validated);

        return redirect()->route('user.reports.show', $report)
            ->with('success', 'Report submitted successfully');
    }

    /**
     * Display the specified report
     */
    public function show(Support $report)
    {
        $user = Auth::user();
        
        if ($report->user_id !== Auth::id() || !$user->isUser()) {
            abort(403, 'Unauthorized action.');
        }

        $report->load(['responses.adminUser']);

        return Inertia::render('UserReportDetail', [
            'report' => $report,
            'user' => $user
        ]);
    }

    /**
     * Add a reply to the report
     */
    public function addReply(Request $request, Support $report)
    {
        $user = Auth::user();
        
        if ($report->user_id !== Auth::id() || !$user->isUser()) {
            abort(403, 'Unauthorized action.');
        }

        if ($report->status === 'closed') {
            return back()->with('error', 'Cannot reply to a closed report');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000'
        ]);

        SupportResponse::create([
            'support_id' => $report->id,
            'admin_user_id' => Auth::id(),
            'message' => $validated['message'],
            'is_from_user' => true
        ]);

        if ($report->status === 'resolved') {
            $report->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Reply added successfully');
    }

    /**
     * Close the report (user can close their own report)
     */
    public function closeReport(Support $report)
    {
        $user = Auth::user();
        
        if ($report->user_id !== Auth::id() || !$user->isUser()) {
            abort(403, 'Unauthorized action.');
        }

        $report->update(['status' => 'closed']);

        return back()->with('success', 'Report closed successfully');
    }
}
