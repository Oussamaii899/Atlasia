<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Replyreaction>
 */
class ReplyreactionFactory extends Factory
{
    protected static $usedCombinations;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        /* 
        
         'reply_id',
        'user_id',
        'reaction'
        */
        static::$usedCombinations = static::$usedCombinations ?? collect();
        
        do {
            $reply_id = \App\Models\Reply::pluck('id')->random();
            $user_id = \App\Models\User::pluck('id')->random();
            $combination = $reply_id . '-' . $user_id;
        } while (
            static::$usedCombinations->contains($combination) || 
            \App\Models\Replyreaction::where('reply_id', $reply_id)
            ->where('user_id', $user_id)
            ->exists()
        );
        
        static::$usedCombinations->push($combination);

        return [
            'reply_id' => $reply_id,
            'user_id' => $user_id,
            'reaction' => fake()->randomElement(['like', 'dislike']),
        ];
    }
}
