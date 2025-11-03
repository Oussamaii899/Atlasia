<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class CommentreactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    protected static $usedCombinations;

    public function definition(): array
    {
        /* 
                 'comment_id',
        'user_id',
        'reaction',
        */
        static::$usedCombinations = static::$usedCombinations ?? collect();
        
        do {
            $comment_id = \App\Models\Comment::pluck('id')->random();
            $user_id = \App\Models\User::pluck('id')->random();
            $combination = $comment_id . '-' . $user_id;
        } while (
            static::$usedCombinations->contains($combination) || 
            \App\Models\Commentreaction::where('comment_id', $comment_id)
                ->where('user_id', $user_id)
                ->exists()
        );
        
        static::$usedCombinations->push($combination);

        return [
            'comment_id' => $comment_id,
            'user_id' => $user_id,
            'reaction' => fake()->randomElement(['like','dislike'])
        ];
    }
}
