<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Reply>
 */
class ReplyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    /* 
    protected $fillable = ['comment_id', 'user_id', 'content', 'likes', 'dislikes', 'created_at', 'updated_at'];
    */
    {
        return [
            'comment_id' => \App\Models\Comment::pluck('id')->random(),
            'user_id' => \App\Models\User::pluck('id')->random(),
            'content' => fake()->paragraph(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
