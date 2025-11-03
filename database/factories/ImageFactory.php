<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Image>
 */
class ImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        /* 
        
               'place_id',
        'url',
        'alt_text',
        'created_at',
        'updated_at',
        */
        return [
            'place_id' => \App\Models\Place::pluck('id')->random(),
            'url' => 'https://picsum.photos/800/600?random=' . rand(1, 1000), 
            'alt_text' => fake()->sentence(), // Generates a random alt text
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }
}
