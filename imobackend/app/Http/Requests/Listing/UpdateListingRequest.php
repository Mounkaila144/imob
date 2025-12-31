<?php

namespace App\Http\Requests\Listing;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateListingRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Utiliser explicitement le guard API/JWT
        $user = auth('api')->user();

        if (!$user || !is_object($user)) {
            return false;
        }

        // Autoriser si c'est un admin ou un lister (la vérification de propriété se fait dans le contrôleur)
        return (method_exists($user, 'isAdmin') && $user->isAdmin()) ||
               (method_exists($user, 'isLister') && $user->isLister());
    }

    public function rules(): array
    {
        return [
            // Informations de base
            'title' => 'sometimes|string|max:180',
            'description' => 'sometimes|string',
            'type' => ['sometimes', Rule::in(['sale', 'rent'])],
            'property_type' => [
                'sometimes',
                Rule::in(['apartment', 'house', 'villa', 'land', 'office', 'shop', 'warehouse', 'other'])
            ],

            // Prix
            'price' => 'sometimes|numeric|min:0|max:999999999999.99',
            'currency' => 'sometimes|string|size:3|in:XOF,USD,GBP',
            'rent_period' => 'nullable|in:monthly,weekly,daily',
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
            'address_line1' => 'sometimes|string|max:180',
            'address_line2' => 'nullable|string|max:180',
            'city' => 'sometimes|string|max:120',
            'state' => 'nullable|string|max:120',
            'postal_code' => 'nullable|string|max:20',
            'country_code' => 'sometimes|string|size:2',
            'latitude' => 'sometimes|numeric|between:-90,90',
            'longitude' => 'sometimes|numeric|between:-180,180',

            // Dates
            'available_from' => 'nullable|date|after_or_equal:today',

            // Statut (seulement pour les admins)
            'status' => [
                'sometimes',
                Rule::in(['draft', 'pending_review', 'published', 'rejected', 'archived', 'sold', 'rented'])
            ],

            // Mise en vedette (seulement pour les admins)
            'is_featured' => 'sometimes|boolean',

            // Équipements et features
            'amenity_ids' => 'nullable|array',
            'amenity_ids.*' => 'exists:amenities,id',
            'features' => 'nullable|array',
        ];
    }

    public function messages(): array
    {
        return [
            'title.max' => 'Le titre ne peut pas dépasser 180 caractères.',
            'type.in' => 'Le type doit être "sale" ou "rent".',
            'property_type.in' => 'Type de propriété invalide.',
            'price.numeric' => 'Le prix doit être un nombre.',
            'price.min' => 'Le prix ne peut pas être négatif.',
            'address_line1.max' => 'L\'adresse ne peut pas dépasser 180 caractères.',
            'city.max' => 'La ville ne peut pas dépasser 120 caractères.',
            'latitude.between' => 'La latitude doit être entre -90 et 90.',
            'longitude.between' => 'La longitude doit être entre -180 et 180.',
            'available_from.after_or_equal' => 'La date de disponibilité ne peut pas être dans le passé.',
            'status.in' => 'Statut invalide.',
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
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Vérifier la cohérence rent_period avec type
            if ($this->type === 'rent' && !$this->rent_period) {
                $validator->errors()->add('rent_period', 'La période de location est obligatoire pour les locations.');
            }

            $user = auth('api')->user();
            $isAdmin = $user && is_object($user) && method_exists($user, 'isAdmin') && $user->isAdmin();

            // Seuls les admins peuvent modifier le statut
            if ($this->has('status') && !$isAdmin) {
                $validator->errors()->add('status', 'Seuls les administrateurs peuvent modifier le statut.');
            }

            // Seuls les admins peuvent mettre en vedette
            if ($this->has('is_featured') && !$isAdmin) {
                $validator->errors()->add('is_featured', 'Seuls les administrateurs peuvent mettre une annonce en vedette.');
            }
        });
    }
}
