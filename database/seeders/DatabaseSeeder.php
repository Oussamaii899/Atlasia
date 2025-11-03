<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Place;
use App\Models\Comment;
use App\Models\Reply;
use App\Models\Image;
use App\Models\Commentreaction;
use App\Models\Replyreaction;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        /* User::factory(100)->create([]); */
        /* Place::factory(100)->create([]); */

        /* Image::factory(100)->create(); */

       /*  Comment::factory(1000)->create([]);
 */

        /* Reply::factory(1000)->create([]); */

        /* Commentreaction::factory(10000)->create([]); */
        Replyreaction::factory(10000)->create([]);

    }
}
