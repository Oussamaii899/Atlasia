<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        return [
            'user_id' => \App\Models\User::pluck('id')->random(),
            'place_id' => \App\Models\Place::pluck('id')->random(),
            'content' => fake()->paragraph(),
            'is_published' => fake()->boolean(),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
