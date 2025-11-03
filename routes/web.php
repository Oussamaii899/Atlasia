<?php

use Illuminate\Support\Facades\Route;
use App\Models\User;
use App\Models\Category;
use App\Models\Place;
use Inertia\Inertia;
use App\Http\Middleware\Admin;

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\CollectionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SaveController;
use App\Http\Controllers\HistoireController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\SupportController;
use App\Http\Middleware\UpdateLastActivity;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserReportController;
use App\Http\Controllers\MatchController;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');
Route::get('/support', function () {
    return Inertia::render('supportPage');
})->name('support');

Route::resource('posts', PostController::class);
Route::get('/posts', [PostController::class, 'index'])->name('post.index');
Route::get('/places/{slug}', [PostController::class, 'show']);




Route::middleware(['auth', 'verified', UpdateLastActivity::class])->group(function () {
    

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/saves', function(){return Inertia::render('saves');});
    Route::post('/places/{place}/toggle-save', [SaveController::class, 'toggle'])->middleware('auth');
    Route::get('/saves', [SaveController::class, 'index'])->middleware('auth')->name('saves.index');
    Route::post('/collections', [CollectionController::class, 'store']);
    Route::post('/saves/assign', [SaveController::class, 'assign']);
    Route::delete('/saves/{place}', [SaveController::class, 'destroy'])->name('saves.destroy');
    Route::get('/history', [HistoireController::class, 'index'])->name('history');
    Route::post('/histoire', [HistoireController::class, 'store']);
    Route::delete('/history/{place}', [HistoireController::class, 'destroy'])->name('history.destroy');



    Route::post('/places/{place}/comments', [PostController::class, 'storeComment'])->name('places.comments.store');
    Route::post('/comments/{comment}/{user}/{reaction}/', [PostController::class, 'likeComment'])
        ->where('reaction', 'like|dislike')
        ->name('comments.reaction');
    Route::post('/replies/{reply}/{user}/{reaction}/', [PostController::class, 'likeReply'])
        ->where('reaction', 'like|dislike')
        ->name('replies.reaction');
    Route::post('/comments/{comment}/reply', [PostController::class, 'storeReply']);

    Route::patch('/commentss/{comment}', [PostController::class, 'editComment'])->name('comments.update');
    Route::patch('/repliess/{reply}', [PostController::class, 'editReply'])->name('replies.update');

    Route::delete('/comments/{comment}', [PostController::class, 'destroyComment'])->name('comments.destroy');
    Route::delete('/replies/{reply}', [PostController::class, 'destroyReply'])->name('replies.destroy');

    Route::post('/places/{place}/rate', [PostController::class, 'rate'])->name('places.rate');
    Route::delete('/places/{place}/rating', [PostController::class, 'destroyRating'])->name('places.rating.destroy');

    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/chat/{user}', [ChatController::class, 'chatPage'])->name('chat.page');
    Route::get('/messages/{user}', [ChatController::class, 'getMessages'])->name('chat.messages');
    Route::post('/messages', [ChatController::class, 'store'])->name('chat.store');
    Route::post('/messages/{chat}/seen', [ChatController::class, 'markAsSeen']);
    Route::post('/messages/mark-seen', [ChatController::class, 'markAsSeen']);
    Route::put('/messages/{id}', [ChatController::class, 'update']);
    Route::delete('/messages/{id}', [ChatController::class, 'destroy']);
    Route::post('/chat/toggle-seen/{user}', [ChatController::class, 'toggleSeen']);
/*     Route::get('/support-ticket', [SupportController::class, 'index']);
    Route::post('/supportStore', [SupportController::class, 'store'])->name('support.store'); */


    Route::get('/my-reports', [UserReportController::class, 'index'])->name('user.reports.index');
    Route::get('/my-reports/create', [UserReportController::class, 'create'])->name('user.reports.create');
    Route::post('/my-reports', [UserReportController::class, 'store'])->name('user.reports.store');
    Route::get('/my-reports/{report}', [UserReportController::class, 'show'])->name('user.reports.show');
    Route::post('/my-reports/{report}/reply', [UserReportController::class, 'addReply'])->name('user.reports.reply');
    Route::post('/my-reports/{report}/close', [UserReportController::class, 'closeReport'])->name('user.reports.close');
    Route::get('/matches', [MatchController::class, 'index']);
/* 
    Route::get('/user/{id}', function (User $user) {
        return Inertia::render('profil', [
            'user' => $user->where('id', $user->id)
                ->select('id', 'name', 'email', 'avatar', 'last_activity')
                ->with(['savedPlaces' => function ($query) {
                    $query->select('places.id', 'places.name', 'places.publier')
                        ->with('category:id,name');
                }])
                ->first(),
        ]);
    })->name('user.profile'); */
    Route::get('/user/{slug?}', [UserController::class, 'profile'])->name('profile');

    Route::get('/place/create', [PlaceController::class, 'create'])->name('places.create');
    Route::post('/place', [PlaceController::class, 'store'])->name('places.store');

    
});

Route::middleware(['auth', Admin::class])->group(function (){
    Route::resource('users', UserController::class);
    Route::resource('categories', CategoryController::class);
    Route::resource('places', PlaceController::class);
    Route::resource('comments', CommentController::class);
    Route::resource('reports', ReportController::class);

    Route::put('/places/{place}/status', [PlaceController::class, 'updateStatus'])->name('places.update-status');

    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/report/{report}', [ReportController::class, 'show'])->name('reports.show');
    Route::post('/reports/{report}/assign', [ReportController::class, 'assign'])->name('reports.assign');
    Route::get('/reports/statistics', [ReportController::class, 'statistics'])->name('reports.statistics');


        // Bulk operations
    Route::post('/reports/bulk-delete', [ReportController::class, 'bulkDelete'])->name('reports.bulk-delete');
    
    // Status and priority management
    Route::put('/reports/{report}/status', [ReportController::class, 'updateStatus'])->name('reports.update-status');
    Route::put('/reports/{report}/priority', [ReportController::class, 'updatePriority'])->name('reports.update-priority');
    
    // Assignment
    Route::put('/reports/{report}/assign', [ReportController::class, 'assign'])->name('reports.assign');
    
    // Responses
    Route::post('/reports/{report}/responses', [ReportController::class, 'addResponse'])->name('reports.add-response');
    


    

    Route::post('/users/bulk-delete', [UserController::class, 'bulkDelete']); 
    Route::post('/categories/bulk-delete', [CategoryController::class, 'bulkDelete']); 
    Route::post('/places/bulk-delete', [PlaceController::class, 'bulkDelete']); 
    Route::post('/comments/bulk-delete', [CommentController::class, 'bulkDelete']);

    Route::put('/categories/{category}/toggle-publish', [CategoryController::class, 'togglePublish']);
    Route::put('/places/{place}/toggle-publish', [PlaceController::class, 'togglePublish']);
    Route::put('/comments/{comment}/toggle-publish', [CommentController::class, 'togglePublish']); 
    Route::put('/replies/{reply}/toggle-publish', [CommentController::class, 'togglePublishR'])->name('replies.toggle-publish');; 

    Route::delete('/places/images/{image}', [PlaceController::class, 'deleteImage'])->name('places.images.delete');

    Route::get('/reload', [PostController::class, 'reload'])->name('posts.reload');
    
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
