<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Place>
 */
class PlaceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'description' => fake()->paragraph(),
            'address' => fake()->streetAddress() . ', ' . fake()->randomElement(['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan']),
            'lat' => fake()->latitude(27.6666, 35.9247), // Morocco's latitude bounds
            'lng' => fake()->longitude(-13.1686, -1.0085), // Morocco's longitude bounds
            'email' => fake()->unique()->safeEmail(),
            'phone' => '+212' . fake()->numberBetween(6, 7) . fake()->numerify('########'), // Moroccan phone format
            'website' => fake()->url(),
            'city' => fake()->randomElement(['Casablanca', 'Rabat', 'Marrakech', 'Fes', 'Tangier', 'Agadir', 'Meknes', 'Oujda', 'Kenitra', 'Tetouan']),
            'category_id' => \App\Models\Category::pluck('id')->random(),
            'publier' => fake()->boolean(),
            'review_count' => fake()->numberBetween(0, 100),
            'rating' => fake()->randomFloat(1, 1, 5),
            'amenities' => fake()->randomElements(['spa', 'wifi', 'parking', 'pool', 'gym', 'restaurant', 'bar', 'laundry', 'room_service', 'conference_room', 'beach_access', 'breakfast', 'air_conditioning'], rand(3, 6)),
            'created_at' => fake()->dateTimeBetween('-1 years', 'now'),
        ];
    }
}
