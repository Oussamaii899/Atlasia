<?php

namespace App\Http\Controllers;

use App\Models\Support;
use App\Models\SupportResponse;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display a listing of reports (Admin only)
     */
    public function index(Request $request)
    {
        // Ensure only admins can access this
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $query = Support::with(['user'])
            ->orderBy('created_at', 'desc');

        // Apply filters using scopes
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('priority')) {
            $query->byPriority($request->priority);
        }

        $reports = $query->paginate(15)->withQueryString();

        // Add computed fields for frontend compatibility
        $reports->getCollection()->transform(function ($report) {
            $report->replies = $report->responses ?? collect();
            $report->likes = 0;
            $report->dislikes = 0;
            return $report;
        });

        return Inertia::render('Reports', [
            'reports' => $reports,
            'filters' => $request->only(['search', 'status', 'category', 'priority']),
            'user' => Auth::user()
        ]);
    }

    /**
     * Display the specified report (Admin only)
     */
    public function show(Support $report)
    {
        // Ensure only admins can access this
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $report->load([
            'user',
            'responses.adminUser',
            'assignedTo'
        ]);

        // Add computed fields for frontend compatibility
        $report->replies = $report->responses;
        $report->likes = 0;
        $report->dislikes = 0;

        // If this is a user report, try to find the reported user
        $reportedUser = null;
        if (in_array($report->category, ['user', 'abuse']) && $report->reported_user_name) {
            $reportedUser = User::where('name', 'like', "%{$report->reported_user_name}%")
                ->orWhere('email', 'like', "%{$report->reported_user_name}%")
                ->first();
        }

        return Inertia::render('ReportDetail', [
            'report' => $report,
            'reportedUser' => $reportedUser,
            'user' => Auth::user()
        ]);
    }

    /**
     * Update report status (Admin only)
     */
    public function updateStatus(Request $request, Support $report)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $validated = $request->validate([
            'status' => 'required|string|in:open,in_progress,resolved,closed'
        ]);

        // Set resolved_at timestamp when status changes to resolved
        if ($validated['status'] === 'resolved' && $report->status !== 'resolved') {
            $validated['resolved_at'] = now();
        }

        $report->update($validated);

        return back()->with('success', 'Status updated successfully');
    }

    /**
     * Update report priority (Admin only)
     */
    public function updatePriority(Request $request, Support $report)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $validated = $request->validate([
            'priority' => 'required|string|in:low,medium,high,urgent'
        ]);

        $report->update($validated);

        return back()->with('success', 'Priority updated successfully');
    }

    /**
     * Remove the specified report (Admin only)
     */
    public function destroy(Support $report)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $report->delete(); // Responses will be deleted automatically due to cascade

        return redirect()->back()
            ->with('success', 'Report deleted successfully');
    }

    /**
     * Bulk delete reports (Admin only)
     */
    public function bulkDelete(Request $request)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:supports,id'
        ]);

        Support::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', 'Selected reports deleted successfully');
    }

    /**
     * Add response to report (Admin only)
     */
    public function addResponse(Request $request, Support $report)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000'
        ]);

        SupportResponse::create([
            'support_id' => $report->id,
            'admin_user_id' => Auth::id(),
            'message' => $validated['message'],
            'is_from_user' => false
        ]);

        // Update report status to in_progress if it's currently open
        if ($report->status === 'open') {
            $report->update(['status' => 'in_progress']);
        }

        return back()->with('success', 'Response added successfully');
    }

    /**
     * Get user reports statistics (Admin only)
     */
    public function userReportsStats()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $stats = [
            'total_user_reports' => Support::whereIn('category', ['user', 'abuse'])->count(),
            'open_user_reports' => Support::whereIn('category', ['user', 'abuse'])
                ->where('status', 'open')->count(),
            'resolved_user_reports' => Support::whereIn('category', ['user', 'abuse'])
                ->where('status', 'resolved')->count(),
            'most_reported_users' => Support::whereIn('category', ['user', 'abuse'])
                ->whereNotNull('reported_user_name')
                ->select('reported_user_name', DB::raw('count(*) as report_count'))
                ->groupBy('reported_user_name')
                ->orderBy('report_count', 'desc')
                ->limit(10)
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Assign report to user (Admin only)
     */
    public function assign(Request $request, Support $report)
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $validated = $request->validate([
            'assigned_to' => 'nullable|exists:users,id'
        ]);

        // Ensure the assigned user is an admin
        if ($validated['assigned_to']) {
            $assignedUser = User::find($validated['assigned_to']);
            if (!$assignedUser->isAdmin()) {
                return back()->with('error', 'Can only assign reports to admin users');
            }
        }

        $report->update($validated);

        return back()->with('success', 'Report assignment updated');
    }

    /**
     * Get report statistics (Admin only)
     */
    public function statistics()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $stats = [
            'total' => Support::count(),
            'open' => Support::where('status', 'open')->count(),
            'in_progress' => Support::where('status', 'in_progress')->count(),
            'resolved' => Support::where('status', 'resolved')->count(),
            'closed' => Support::where('status', 'closed')->count(),
            'by_category' => Support::select('category', DB::raw('count(*) as count'))
                ->groupBy('category')
                ->get(),
            'by_priority' => Support::select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->get(),
            'recent' => Support::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get(),
            'user_reports' => Support::whereIn('category', ['user', 'abuse'])->count(),
        ];

        return response()->json($stats);
    }

    /**
     * Admin dashboard with overview
     */
    public function dashboard()
    {
        if (!Auth::user()->isAdmin()) {
            abort(403, 'Access denied. Admin privileges required.');
        }

        $stats = [
            'total_reports' => Support::count(),
            'open_reports' => Support::where('status', 'open')->count(),
            'in_progress_reports' => Support::where('status', 'in_progress')->count(),
            'resolved_today' => Support::where('status', 'resolved')
                ->whereDate('resolved_at', today())
                ->count(),
            'urgent_reports' => Support::where('priority', 'urgent')
                ->whereIn('status', ['open', 'in_progress'])
                ->count(),
            'user_reports' => Support::whereIn('category', ['user', 'abuse'])
                ->whereIn('status', ['open', 'in_progress'])
                ->count(),
            'recent_reports' => Support::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'assigned_to_me' => Support::where('assigned_to', Auth::id())
                ->whereIn('status', ['open', 'in_progress'])
                ->count(),
        ];

        return Inertia::render('AdminDashboard', [
            'stats' => $stats,
            'user' => Auth::user()
        ]);
    }
}
