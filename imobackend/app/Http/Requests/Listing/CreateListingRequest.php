<?php

namespace App\Http\Requests\Listing;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = auth('api')->user();

        return auth('api')->check() &&
               $user &&
               is_object($user) &&
               ((method_exists($user, 'isLister') && $user->isLister()) ||
                (method_exists($user, 'isAdmin') && $user->isAdmin()));
    }

    public function rules(): array
    {
        return [
            // Informations de base
            'title' => 'required|string|max:180',
            'description' => 'required|string',
            'type' => ['required', Rule::in(['sale', 'rent'])],
            'property_type' => [
                'required',
                Rule::in(['apartment', 'house', 'villa', 'land', 'office', 'shop', 'warehouse', 'other'])
            ],

            // Prix
            'price' => 'required|numeric|min:0|max:999999999999.99',
            'currency' => 'sometimes|string|size:3|in:EUR,USD,GBP',
            'rent_period' => 'required_if:type,rent|nullable|in:monthly,weekly,daily',
            'deposit_amount' => 'nullable|numeric|min:0|max:999999999999.99',
            'lease_min_months' => 'nullable|integer|min:1|max:120',

            // Caractéristiques
            'area_size' => 'nullable|numeric|min:0|max:99999999.99',
            'area_unit' => 'nullable|in:m2,ha,ft2',
            'rooms' => 'nullable|integer|min:0|max:255',
            'bedrooms' => 'nullable|integer|min:0|max:255',
            'bathrooms' => 'nullable|integer|min:0|max:255',
            'parking_spaces' => 'nullable|integer|min:0|max:255',
            'floor' => 'nullable|integer|min:-50|max:200',
            'year_built' => 'nullable|integer|min:1800|max:' . (date('Y') + 5),

            // Adresse
            'address_line1' => 'required|string|max:180',
            'address_line2' => 'nullable|string|max:180',
            'city' => 'required|string|max:120',
            'state' => 'nullable|string|max:120',
            'postal_code' => 'nullable|string|max:20',
            'country_code' => 'sometimes|string|size:2',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',

            // Dates
            'available_from' => 'nullable|date|after_or_equal:today',

            // Équipements et features
            'amenity_ids' => 'nullable|array',
            'amenity_ids.*' => 'exists:amenities,id',
            'features' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre est obligatoire.',
            'title.max' => 'Le titre ne peut pas dépasser 180 caractères.',
            'description.required' => 'La description est obligatoire.',
            'type.required' => 'Le type d\'annonce est obligatoire.',
            'type.in' => 'Le type doit être "sale" ou "rent".',
            'property_type.required' => 'Le type de propriété est obligatoire.',
            'property_type.in' => 'Type de propriété invalide.',
            'price.required' => 'Le prix est obligatoire.',
            'price.numeric' => 'Le prix doit être un nombre.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'rent_period.required_if' => 'La période de location est obligatoire pour les locations.',
            'address_line1.required' => 'L\'adresse est obligatoire.',
            'city.required' => 'La ville est obligatoire.',
            'latitude.required' => 'La latitude est obligatoire.',
            'longitude.required' => 'La longitude est obligatoire.',
            'latitude.between' => 'La latitude doit être entre -90 et 90.',
            'longitude.between' => 'La longitude doit être entre -180 et 180.',
            'available_from.after_or_equal' => 'La date de disponibilité ne peut pas être dans le passé.',
            'amenity_ids.array' => 'Les équipements doivent être un tableau.',
            'amenity_ids.*.exists' => 'Un ou plusieurs équipements sélectionnés n\'existent pas.',
            'year_built.min' => 'L\'année de construction ne peut pas être antérieure à 1800.',
            'year_built.max' => 'L\'année de construction ne peut pas être dans le futur.',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Nettoyer et formater les données
        if ($this->has('price')) {
            $this->merge([
                'price' => (float) str_replace(',', '', $this->price)
            ]);
        }

        if ($this->has('deposit_amount')) {
            $this->merge([
                'deposit_amount' => (float) str_replace(',', '', $this->deposit_amount)
            ]);
        }

        // Définir la devise par défaut
        if (!$this->has('currency')) {
            $this->merge(['currency' => 'EUR']);
        }

        // Définir le code pays par défaut
        if (!$this->has('country_code')) {
            $this->merge(['country_code' => 'FR']);
        }
    }
}