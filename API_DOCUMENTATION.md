
# Documentation API Guida-Center

**Base URL:** `https://guidacenter.com/api`

Cette documentation couvre toutes les fonctionnalités accessibles aux utilisateurs de l'application mobile (hors fonctions administrateur).

---

## Table des matières

1. [Informations générales](#1-informations-générales)
2. [Authentification](#2-authentification)
3. [Gestion du profil utilisateur](#3-gestion-du-profil-utilisateur)
4. [Annonces (Listings)](#4-annonces-listings)
5. [Favoris](#5-favoris)
6. [Partenaires](#6-partenaires)
7. [Abonnements vendeur](#7-abonnements-vendeur)
8. [Codes d'erreur](#8-codes-derreur)
9. [Modèles de données](#9-modèles-de-données)

---

## 1. Informations générales

### Format des requêtes

Toutes les requêtes doivent inclure les headers suivants :

```http
Content-Type: application/json
Accept: application/json
```

Pour les endpoints protégés, ajouter le header d'autorisation :

```http
Authorization: Bearer {token}
```

### Format des réponses

Toutes les réponses suivent cette structure :

```json
{
  "success": true,
  "message": "Message descriptif",
  "data": { ... }
}
```

En cas d'erreur :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": {
    "field_name": ["Message d'erreur 1", "Message d'erreur 2"]
  }
}
```

### Pagination

Les endpoints paginés retournent :

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "last_page": 10,
    "per_page": 15,
    "total": 150,
    "has_more_pages": true
  }
}
```

---

## 2. Authentification

### 2.1 Inscription

Créer un nouveau compte utilisateur.

**Endpoint:** `POST /auth/register`

**Authentification requise:** Non

**Corps de la requête:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+227 90 00 00 00",
  "password": "MotDePasse123!",
  "password_confirmation": "MotDePasse123!",
  "role": "client",
  "company": "Ma Société",
  "about": "Description de l'utilisateur"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Oui | Nom complet de l'utilisateur |
| `email` | string | Oui | Adresse email unique |
| `phone` | string | Non | Numéro de téléphone |
| `password` | string | Oui | Mot de passe (min. 8 caractères) |
| `password_confirmation` | string | Oui | Confirmation du mot de passe |
| `role` | string | Oui | `client` (acheteur/locataire) ou `lister` (vendeur/propriétaire) |
| `company` | string | Non | Nom de l'entreprise (pour les listers) |
| `about` | string | Non | Description/biographie |

**Réponse succès (201):**

```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "client",
    "phone": "+227 90 00 00 00",
    "status": "active",
    "email_verified_at": null,
    "profile": {
      "avatar_path": null,
      "company": "Ma Société",
      "about": "Description de l'utilisateur"
    },
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Erreurs possibles:**

| Code | Message | Description |
|------|---------|-------------|
| 422 | Validation échouée | Données invalides |
| 409 | Email déjà utilisé | L'email existe déjà |

---

### 2.2 Connexion

Authentifier un utilisateur existant.

**Endpoint:** `POST /auth/login`

**Authentification requise:** Non

**Corps de la requête:**

```json
{
  "email": "john.doe@example.com",
  "password": "MotDePasse123!"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `email` | string | Oui | Adresse email |
| `password` | string | Oui | Mot de passe |

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "client",
    "phone": "+227 90 00 00 00",
    "status": "active",
    "email_verified_at": "2024-01-15T12:00:00.000Z",
    "profile": {
      "avatar_path": "/uploads/avatars/user_1.jpg",
      "company": null,
      "about": null
    },
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Erreurs possibles:**

| Code | Message | Description |
|------|---------|-------------|
| 401 | Identifiants invalides | Email ou mot de passe incorrect |
| 422 | Validation échouée | Données manquantes |

---

### 2.3 Déconnexion

Invalider le token d'authentification.

**Endpoint:** `POST /auth/logout`

**Authentification requise:** Oui

**Headers:**
```http
Authorization: Bearer {token}
```

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 2.4 Rafraîchir le token

Obtenir un nouveau token d'authentification.

**Endpoint:** `POST /auth/refresh`

**Authentification requise:** Oui

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Token rafraîchi",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. Gestion du profil utilisateur

### 3.1 Obtenir le profil

Récupérer les informations de l'utilisateur connecté.

**Endpoint:** `GET /auth/me`

**Authentification requise:** Oui

**Réponse succès (200):**

```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "client",
    "phone": "+227 90 00 00 00",
    "status": "active",
    "email_verified_at": "2024-01-15T12:00:00.000Z",
    "profile": {
      "avatar_path": "/uploads/avatars/user_1.jpg",
      "company": "Ma Société",
      "about": "Description de l'utilisateur"
    },
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3.2 Modifier le profil

Mettre à jour les informations du profil.

**Endpoint:** `PUT /auth/profile`

**Authentification requise:** Oui

**Corps de la requête:**

```json
{
  "name": "John Updated",
  "phone": "+227 91 00 00 00",
  "company": "Nouvelle Société",
  "about": "Nouvelle description"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `name` | string | Non | Nouveau nom |
| `phone` | string | Non | Nouveau numéro de téléphone |
| `company` | string | Non | Nouvelle entreprise |
| `about` | string | Non | Nouvelle description |

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Profil mis à jour",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.doe@example.com",
    "role": "client",
    "phone": "+227 91 00 00 00",
    "status": "active",
    "profile": {
      "avatar_path": "/uploads/avatars/user_1.jpg",
      "company": "Nouvelle Société",
      "about": "Nouvelle description"
    }
  }
}
```

---

### 3.3 Changer le mot de passe

Modifier le mot de passe de l'utilisateur.

**Endpoint:** `PUT /auth/password`

**Authentification requise:** Oui

**Corps de la requête:**

```json
{
  "current_password": "AncienMotDePasse123!",
  "new_password": "NouveauMotDePasse456!",
  "new_password_confirmation": "NouveauMotDePasse456!"
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `current_password` | string | Oui | Mot de passe actuel |
| `new_password` | string | Oui | Nouveau mot de passe (min. 8 caractères) |
| `new_password_confirmation` | string | Oui | Confirmation du nouveau mot de passe |

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Mot de passe modifié avec succès"
}
```

**Erreurs possibles:**

| Code | Message | Description |
|------|---------|-------------|
| 401 | Mot de passe actuel incorrect | Le mot de passe actuel ne correspond pas |
| 422 | Validation échouée | Les nouveaux mots de passe ne correspondent pas |

---

## 4. Annonces (Listings)

### 4.1 Liste des annonces publiques

Récupérer toutes les annonces publiées avec filtres et pagination.

**Endpoint:** `GET /listings`

**Authentification requise:** Non

**Paramètres de requête (Query Parameters):**

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `search` | string | Recherche par titre, ville, type | `?search=appartement paris` |
| `type` | string | Type de transaction | `?type=sale` ou `?type=rent` |
| `property_type` | string | Type de bien | `?property_type=apartment` |
| `city` | string | Filtrer par ville | `?city=Paris` |
| `min_price` | number | Prix minimum | `?min_price=100000` |
| `max_price` | number | Prix maximum | `?max_price=500000` |
| `rooms` | number | Nombre minimum de pièces | `?rooms=3` |
| `bedrooms` | number | Nombre minimum de chambres | `?bedrooms=2` |
| `sort_by` | string | Champ de tri | `?sort_by=price` |
| `sort_order` | string | Ordre de tri | `?sort_order=asc` ou `?sort_order=desc` |
| `per_page` | number | Résultats par page (défaut: 15) | `?per_page=20` |
| `page` | number | Numéro de page | `?page=2` |

**Valeurs possibles pour `property_type`:**
- `apartment` - Appartement
- `house` - Maison
- `villa` - Villa
- `land` - Terrain
- `office` - Bureau
- `shop` - Boutique/Commerce
- `warehouse` - Entrepôt
- `hotel` - Hôtel
- `other` - Autre

**Exemple de requête:**
```
GET /listings?type=rent&property_type=apartment&city=Niamey&min_price=50000&max_price=200000&rooms=2&per_page=10&page=1
```

**Réponse succès (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Bel appartement T3 au centre-ville",
      "description": "Superbe appartement lumineux...",
      "slug": "bel-appartement-t3-centre-ville",
      "type": "rent",
      "property_type": "apartment",
      "status": "published",
      "is_featured": true,
      "price": {
        "amount": 150000,
        "currency": "XOF",
        "formatted": "150 000 FCFA",
        "rent_period": "monthly",
        "deposit_amount": 300000,
        "lease_min_duration": 12
      },
      "area_size": 75,
      "area_unit": "m²",
      "rooms": 3,
      "bedrooms": 2,
      "bathrooms": 1,
      "parking_spaces": 1,
      "floor": 2,
      "year_built": 2020,
      "location": {
        "address_line1": "123 Rue de la République",
        "city": "Niamey",
        "postal_code": "8000",
        "coordinates": {
          "lat": 13.5137,
          "lng": 2.1098
        },
        "full_address": "123 Rue de la République, 8000 Niamey"
      },
      "views_count": 245,
      "photos": [
        {
          "id": 1,
          "url": "https://guidacenter.com/storage/listings/1/photo1.jpg",
          "is_cover": true,
          "sort_order": 1
        },
        {
          "id": 2,
          "url": "https://guidacenter.com/storage/listings/1/photo2.jpg",
          "is_cover": false,
          "sort_order": 2
        }
      ],
      "amenities": [
        {
          "id": 1,
          "code": "air_conditioning",
          "label": "Climatisation"
        },
        {
          "id": 2,
          "code": "balcony",
          "label": "Balcon"
        }
      ],
      "owner": {
        "id": 5,
        "name": "Agence Immo Plus",
        "phone": "+227 90 00 00 00",
        "company": "Immo Plus SARL",
        "role": "lister",
        "member_since": "2023-06-15"
      },
      "permissions": {
        "can_edit": false,
        "can_delete": false,
        "can_contact": true,
        "can_favorite": true
      },
      "created_at": "2024-01-10T08:00:00.000Z",
      "updated_at": "2024-01-14T15:30:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 48,
    "has_more_pages": true
  }
}
```

---

### 4.2 Détail d'une annonce

Récupérer les informations complètes d'une annonce.

**Endpoint:** `GET /listings/{id}`

**Authentification requise:** Non

**Paramètres URL:**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | number | Identifiant de l'annonce |

**Exemple de requête:**
```
GET /listings/1
```

**Réponse succès (200):**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Bel appartement T3 au centre-ville",
    "description": "Superbe appartement lumineux avec vue dégagée. Entièrement rénové avec des finitions haut de gamme. Cuisine équipée, climatisation dans toutes les pièces. Proche de toutes commodités : écoles, commerces, transports.",
    "slug": "bel-appartement-t3-centre-ville",
    "type": "rent",
    "property_type": "apartment",
    "status": "published",
    "is_featured": true,
    "price": {
      "amount": 150000,
      "currency": "XOF",
      "formatted": "150 000 FCFA",
      "rent_period": "monthly",
      "deposit_amount": 300000,
      "lease_min_duration": 12
    },
    "area_size": 75,
    "area_unit": "m²",
    "rooms": 3,
    "bedrooms": 2,
    "bathrooms": 1,
    "parking_spaces": 1,
    "floor": 2,
    "year_built": 2020,
    "location": {
      "address_line1": "123 Rue de la République",
      "city": "Niamey",
      "postal_code": "8000",
      "coordinates": {
        "lat": 13.5137,
        "lng": 2.1098
      },
      "full_address": "123 Rue de la République, 8000 Niamey"
    },
    "views_count": 245,
    "metadata": {
      "features": ["Cuisine équipée", "Climatisation", "Balcon", "Parking"],
      "is_favorite": false
    },
    "photos": [
      {
        "id": 1,
        "url": "https://guidacenter.com/storage/listings/1/photo1.jpg",
        "is_cover": true,
        "sort_order": 1
      },
      {
        "id": 2,
        "url": "https://guidacenter.com/storage/listings/1/photo2.jpg",
        "is_cover": false,
        "sort_order": 2
      },
      {
        "id": 3,
        "url": "https://guidacenter.com/storage/listings/1/photo3.jpg",
        "is_cover": false,
        "sort_order": 3
      }
    ],
    "amenities": [
      {
        "id": 1,
        "code": "air_conditioning",
        "label": "Climatisation"
      },
      {
        "id": 2,
        "code": "balcony",
        "label": "Balcon"
      },
      {
        "id": 3,
        "code": "equipped_kitchen",
        "label": "Cuisine équipée"
      },
      {
        "id": 4,
        "code": "parking",
        "label": "Parking"
      }
    ],
    "owner": {
      "id": 5,
      "name": "Agence Immo Plus",
      "phone": "+227 90 00 00 00",
      "company": "Immo Plus SARL",
      "role": "lister",
      "member_since": "2023-06-15"
    },
    "permissions": {
      "can_edit": false,
      "can_delete": false,
      "can_contact": true,
      "can_favorite": true
    },
    "created_at": "2024-01-10T08:00:00.000Z",
    "updated_at": "2024-01-14T15:30:00.000Z"
  }
}
```

**Erreurs possibles:**

| Code | Message | Description |
|------|---------|-------------|
| 404 | Annonce non trouvée | L'annonce n'existe pas ou n'est pas publiée |

---

### 4.3 Mes annonces (Lister uniquement)

Récupérer les annonces de l'utilisateur connecté (pour les listers).

**Endpoint:** `GET /my-listings`

**Authentification requise:** Oui (rôle: `lister`)

**Paramètres de requête:**

| Paramètre | Type | Description | Exemple |
|-----------|------|-------------|---------|
| `status` | string | Filtrer par statut | `?status=published` |
| `type` | string | Type de transaction | `?type=sale` |
| `sort_by` | string | Champ de tri | `?sort_by=created_at` |
| `sort_order` | string | Ordre de tri | `?sort_order=desc` |
| `per_page` | number | Résultats par page | `?per_page=10` |
| `page` | number | Numéro de page | `?page=1` |

**Valeurs possibles pour `status`:**
- `published` - Publiée
- `draft` - Brouillon
- `pending` - En attente de validation
- `suspended` - Suspendue
- `sold` - Vendue
- `rented` - Louée

**Réponse succès (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Mon appartement T3",
      "status": "published",
      "type": "rent",
      "property_type": "apartment",
      "price": {
        "amount": 150000,
        "currency": "XOF",
        "formatted": "150 000 FCFA",
        "rent_period": "monthly"
      },
      "views_count": 245,
      "photos": [...],
      "created_at": "2024-01-10T08:00:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 2,
    "per_page": 10,
    "total": 15,
    "has_more_pages": true
  }
}
```

---

### 4.4 Créer une annonce (Lister uniquement)

Créer une nouvelle annonce immobilière.

**Endpoint:** `POST /listings`

**Authentification requise:** Oui (rôle: `lister`)

**Corps de la requête:**

```json
{
  "title": "Appartement T3 moderne",
  "description": "Bel appartement entièrement rénové...",
  "type": "rent",
  "property_type": "apartment",
  "price": 150000,
  "currency": "XOF",
  "rent_period": "monthly",
  "deposit_amount": 300000,
  "lease_min_duration": 12,
  "area_size": 75,
  "area_unit": "m²",
  "rooms": 3,
  "bedrooms": 2,
  "bathrooms": 1,
  "parking_spaces": 1,
  "floor": 2,
  "year_built": 2020,
  "address_line1": "123 Rue de la République",
  "city": "Niamey",
  "postal_code": "8000",
  "country_code": "NE",
  "latitude": 13.5137,
  "longitude": 2.1098,
  "available_from": "2024-02-01",
  "amenity_ids": [1, 2, 3, 4],
  "features": ["Cuisine équipée", "Vue dégagée"]
}
```

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| `title` | string | Oui | Titre de l'annonce |
| `description` | string | Oui | Description détaillée |
| `type` | string | Oui | `sale` ou `rent` |
| `property_type` | string | Oui | Type de bien (voir valeurs possibles) |
| `price` | number | Oui | Prix en FCFA |
| `currency` | string | Non | Devise (défaut: `XOF`) |
| `rent_period` | string | Non | Période de location: `monthly`, `weekly`, `daily` |
| `deposit_amount` | number | Non | Montant de la caution |
| `lease_min_duration` | number | Non | Durée minimum du bail |
| `area_size` | number | Non | Surface en m² |
| `area_unit` | string | Non | Unité de surface (défaut: `m²`) |
| `rooms` | number | Non | Nombre de pièces |
| `bedrooms` | number | Non | Nombre de chambres |
| `bathrooms` | number | Non | Nombre de salles de bain |
| `parking_spaces` | number | Non | Places de parking |
| `floor` | number | Non | Étage |
| `year_built` | number | Non | Année de construction |
| `address_line1` | string | Oui | Adresse |
| `city` | string | Oui | Ville |
| `postal_code` | string | Non | Code postal |
| `country_code` | string | Non | Code pays ISO (défaut: `NE`) |
| `latitude` | number | Oui | Latitude GPS |
| `longitude` | number | Oui | Longitude GPS |
| `available_from` | string | Non | Date de disponibilité (format: YYYY-MM-DD) |
| `amenity_ids` | array | Non | IDs des équipements |
| `features` | array | Non | Caractéristiques supplémentaires |

**Réponse succès (201):**

```json
{
  "success": true,
  "message": "Annonce créée avec succès",
  "data": {
    "id": 25,
    "title": "Appartement T3 moderne",
    "slug": "appartement-t3-moderne",
    "status": "draft",
    ...
  }
}
```

---

### 4.5 Modifier une annonce (Lister uniquement)

Modifier une annonce existante.

**Endpoint:** `PUT /listings/{id}`

**Authentification requise:** Oui (propriétaire de l'annonce)

**Corps de la requête:** (mêmes champs que la création, tous optionnels)

```json
{
  "title": "Appartement T3 moderne - RÉNOVÉ",
  "price": 175000
}
```

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Annonce mise à jour",
  "data": {
    "id": 25,
    "title": "Appartement T3 moderne - RÉNOVÉ",
    ...
  }
}
```

---

### 4.6 Supprimer une annonce (Lister uniquement)

Supprimer définitivement une annonce.

**Endpoint:** `DELETE /listings/{id}`

**Authentification requise:** Oui (propriétaire de l'annonce)

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Annonce supprimée avec succès"
}
```

---

### 4.7 Gestion des photos

#### Upload des photos

**Endpoint:** `POST /listings/{id}/photos`

**Authentification requise:** Oui (propriétaire de l'annonce)

**Content-Type:** `multipart/form-data`

**Corps de la requête:**

| Champ | Type | Description |
|-------|------|-------------|
| `photos[0]` | File | Première photo |
| `photos[1]` | File | Deuxième photo |
| ... | ... | ... |

**Formats acceptés:** JPEG, PNG, WebP

**Taille maximale:** 5 Mo par photo

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Photos uploadées avec succès",
  "data": [
    {
      "id": 10,
      "url": "https://guidacenter.com/storage/listings/25/photo1.jpg",
      "is_cover": true,
      "sort_order": 1
    },
    {
      "id": 11,
      "url": "https://guidacenter.com/storage/listings/25/photo2.jpg",
      "is_cover": false,
      "sort_order": 2
    }
  ]
}
```

#### Supprimer une photo

**Endpoint:** `DELETE /listings/{listing_id}/photos/{photo_id}`

**Authentification requise:** Oui (propriétaire de l'annonce)

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Photo supprimée"
}
```

#### Définir la photo de couverture

**Endpoint:** `PUT /listings/{listing_id}/photos/{photo_id}/cover`

**Authentification requise:** Oui (propriétaire de l'annonce)

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Photo de couverture définie"
}
```

#### Réorganiser les photos

**Endpoint:** `PUT /listings/{listing_id}/photos/reorder`

**Authentification requise:** Oui (propriétaire de l'annonce)

**Corps de la requête:**

```json
{
  "photos": [
    { "id": 11, "sort_order": 1 },
    { "id": 10, "sort_order": 2 },
    { "id": 12, "sort_order": 3 }
  ]
}
```

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Ordre des photos mis à jour"
}
```

---

## 5. Favoris

Les favoris permettent aux utilisateurs (clients) de sauvegarder les annonces qui les intéressent.

### 5.1 Liste des favoris

Récupérer toutes les annonces favorites de l'utilisateur.

**Endpoint:** `GET /favorites`

**Authentification requise:** Oui (rôle: `client`)

**Paramètres de requête:**

| Paramètre | Type | Description |
|-----------|------|-------------|
| `per_page` | number | Résultats par page |
| `page` | number | Numéro de page |

**Réponse succès (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "listing_id": 15,
      "listing": {
        "id": 15,
        "title": "Villa avec piscine",
        "price": {
          "amount": 45000000,
          "formatted": "45 000 000 FCFA"
        },
        "photos": [...],
        "location": {
          "city": "Niamey"
        }
      },
      "created_at": "2024-01-12T14:30:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 5,
    "has_more_pages": false
  }
}
```

---

### 5.2 Ajouter aux favoris

Ajouter une annonce aux favoris.

**Endpoint:** `POST /favorites`

**Authentification requise:** Oui (rôle: `client`)

**Corps de la requête:**

```json
{
  "listing_id": 15
}
```

**Réponse succès (201):**

```json
{
  "success": true,
  "message": "Annonce ajoutée aux favoris",
  "data": {
    "id": 10,
    "listing_id": 15,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

**Erreurs possibles:**

| Code | Message | Description |
|------|---------|-------------|
| 404 | Annonce non trouvée | L'annonce n'existe pas |
| 409 | Déjà en favoris | L'annonce est déjà dans les favoris |

---

### 5.3 Retirer des favoris

Retirer une annonce des favoris.

**Endpoint:** `DELETE /favorites/{listing_id}`

**Authentification requise:** Oui (rôle: `client`)

**Réponse succès (200):**

```json
{
  "success": true,
  "message": "Annonce retirée des favoris"
}
```

---

### 5.4 Vérifier si une annonce est en favoris

**Endpoint:** `GET /favorites/check/{listing_id}`

**Authentification requise:** Oui (rôle: `client`)

**Réponse succès (200):**

```json
{
  "success": true,
  "data": {
    "is_favorite": true,
    "favorite_id": 10
  }
}
```

---

## 6. Partenaires

### 6.1 Liste des partenaires

Récupérer la liste des partenaires actifs (pour affichage sur la page d'accueil).

**Endpoint:** `GET /partners`

**Authentification requise:** Non

**Réponse succès (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Banque Atlantique",
      "logo_url": "https://guidacenter.com/storage/partners/banque-atlantique.png",
      "website_url": "https://www.banqueatlantique.net"
    },
    {
      "id": 2,
      "name": "Ecobank",
      "logo_url": "https://guidacenter.com/storage/partners/ecobank.png",
      "website_url": "https://www.ecobank.com"
    }
  ]
}
```

---

## 7. Abonnements vendeur

Les vendeurs (rôle `lister`) doivent avoir un abonnement actif pour que leurs annonces soient visibles sur la plateforme. Quand un abonnement expire ou est annulé, toutes les annonces du vendeur sont automatiquement masquées du site public.

### 7.1 Mon abonnement

Récupérer l'abonnement actuel du vendeur connecté.

**Endpoint:** `GET /my-subscription`

**Authentification requise:** Oui (rôle: `lister` ou `admin`)

**Réponse succès (200) — Abonnement trouvé :**

```json
{
  "success": true,
  "message": "Abonnement récupéré avec succès",
  "data": {
    "id": 12,
    "user_id": 5,
    "plan": {
      "id": 2,
      "name": "6 Mois",
      "slug": "6-mois",
      "duration_months": 6,
      "price": 25000,
      "currency": "FCFA",
      "is_active": true
    },
    "plan_id": 2,
    "status": "active",
    "starts_at": "2025-01-15T00:00:00.000Z",
    "ends_at": "2025-07-15T00:00:00.000Z",
    "cancelled_at": null,
    "created_at": "2025-01-15T10:30:00.000Z",
    "updated_at": "2025-01-15T10:30:00.000Z"
  }
}
```

**Réponse succès (200) — Aucun abonnement :**

```json
{
  "success": true,
  "message": "Aucun abonnement trouvé",
  "data": null
}
```

**Logique d'expiration automatique :**

Lorsque cet endpoint est appelé, si l'abonnement est en statut `active` mais que la date `ends_at` est dépassée, le backend passe automatiquement le statut à `expired` avant de retourner la réponse.

**Propriétés calculées côté client :**

| Propriété | Calcul | Description |
|-----------|--------|-------------|
| `isActive` | `status === 'active' && ends_at > now()` | L'abonnement est-il valide ? |
| `daysRemaining` | `max(0, ceil((ends_at - now) / 86400000))` | Jours restants avant expiration |
| `isExpiringSoon` | `isActive && daysRemaining <= 7` | Expire dans 7 jours ou moins |
| `isExpired` | `status === 'expired' || ends_at <= now()` | L'abonnement est-il expiré ? |

---

### 7.2 Plans d'abonnement disponibles

Récupérer la liste des plans d'abonnement actifs.

**Endpoint:** `GET /subscription-plans`

**Authentification requise:** Oui (rôle: `lister` ou `admin`)

**Réponse succès (200) :**

```json
{
  "success": true,
  "message": "Plans récupérés avec succès",
  "data": [
    {
      "id": 1,
      "name": "1 Mois",
      "slug": "1-mois",
      "duration_months": 1,
      "price": 5000,
      "currency": "FCFA",
      "is_active": true
    },
    {
      "id": 2,
      "name": "6 Mois",
      "slug": "6-mois",
      "duration_months": 6,
      "price": 25000,
      "currency": "FCFA",
      "is_active": true
    },
    {
      "id": 3,
      "name": "1 An",
      "slug": "1-an",
      "duration_months": 12,
      "price": 45000,
      "currency": "FCFA",
      "is_active": true
    }
  ]
}
```

---

### 7.3 Impact sur les annonces

Lorsqu'un vendeur n'a **pas** ou **plus** d'abonnement actif :

| Endpoint | Comportement |
|----------|-------------|
| `GET /listings` | Les annonces du vendeur sont **exclues** des résultats publics |
| `GET /listings/{id}` | Retourne `404 "Cette annonce n'est plus disponible"` |
| `GET /my-listings` | Le vendeur peut toujours voir ses propres annonces (aucun changement) |
| Dashboard admin | L'admin voit toujours toutes les annonces |

Les annonces ne sont **pas supprimées**. Elles redeviennent visibles dès qu'un nouvel abonnement est activé.

---

### 7.4 Statuts d'abonnement

| Statut | Description |
|--------|-------------|
| `active` | Abonnement en cours et valide (`ends_at` dans le futur) |
| `expired` | Abonnement dont la date de fin est dépassée |
| `cancelled` | Abonnement annulé manuellement par l'administrateur |

> **Règle :** Un seul abonnement actif par vendeur à la fois.

---

## 8. Codes d'erreur

### Codes HTTP

| Code | Signification |
|------|---------------|
| 200 | Succès |
| 201 | Créé avec succès |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 409 | Conflit (doublon) |
| 422 | Erreur de validation |
| 429 | Trop de requêtes |
| 500 | Erreur serveur |

### Structure des erreurs de validation

```json
{
  "success": false,
  "message": "Les données fournies sont invalides",
  "errors": {
    "email": [
      "Le champ email est obligatoire",
      "Le format de l'email est invalide"
    ],
    "password": [
      "Le mot de passe doit contenir au moins 8 caractères"
    ]
  }
}
```

---

## 9. Modèles de données

### User (Utilisateur)

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'lister' | 'client';
  phone?: string;
  status: string;
  email_verified_at?: string;
  profile: {
    avatar_path?: string;
    company?: string;
    about?: string;
  };
  created_at: string;
  updated_at: string;
}
```

### Listing (Annonce)

```typescript
interface Listing {
  id: number;
  title: string;
  description?: string;
  slug: string;
  type: 'sale' | 'rent';
  property_type: 'apartment' | 'house' | 'villa' | 'land' | 'office' | 'shop' | 'warehouse' | 'hotel' | 'other';
  status: 'published' | 'draft' | 'pending' | 'suspended' | 'sold' | 'rented';
  is_featured?: boolean;
  price: {
    amount: number;
    currency: string;
    formatted: string;
    rent_period?: 'monthly' | 'weekly' | 'daily';
    deposit_amount?: number;
    lease_min_duration?: number;
  };
  area_size?: number;
  area_unit?: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_spaces?: number;
  floor?: number;
  year_built?: number;
  location: {
    address_line1: string;
    city: string;
    postal_code: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    full_address?: string;
  };
  views_count?: number;
  metadata?: {
    features?: string[];
    is_favorite?: boolean;
  };
  photos?: Photo[];
  owner: Owner;
  amenities?: Amenity[];
  permissions?: {
    can_edit: boolean;
    can_delete: boolean;
    can_contact: boolean;
    can_favorite: boolean;
  };
  created_at: string;
  updated_at?: string;
}
```

### Photo

```typescript
interface Photo {
  id: number;
  url: string;
  is_cover: boolean;
  sort_order: number;
}
```

### Owner (Propriétaire)

```typescript
interface Owner {
  id: number;
  name: string;
  phone?: string;
  company?: string;
  role: string;
  member_since?: string;
}
```

### Amenity (Équipement)

```typescript
interface Amenity {
  id: number;
  code: string;
  label: string;
}
```

### Partner (Partenaire)

```typescript
interface Partner {
  id: number;
  name: string;
  logo_url: string | null;
  website_url: string | null;
}
```

### SubscriptionPlan (Plan d'abonnement)

```typescript
interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  duration_months: 1 | 6 | 12;
  price: number;
  currency: string;
  is_active: boolean;
}
```

### Subscription (Abonnement)

```typescript
interface Subscription {
  id: number;
  user_id: number;
  plan: SubscriptionPlan;
  plan_id: number;
  status: 'active' | 'expired' | 'cancelled';
  starts_at: string;
  ends_at: string;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}
```

### Pagination

```typescript
interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  has_more_pages: boolean;
}
```

---

## Exemples d'utilisation (cURL)

### Inscription

```bash
curl -X POST https://guidacenter.com/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "client"
  }'
```

### Connexion

```bash
curl -X POST https://guidacenter.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Liste des annonces avec filtres

```bash
curl -X GET "https://guidacenter.com/api/listings?type=rent&city=Niamey&min_price=50000&per_page=10" \
  -H "Accept: application/json"
```

### Ajouter aux favoris

```bash
curl -X POST https://guidacenter.com/api/favorites \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "listing_id": 15
  }'
```

### Mon abonnement (vendeur)

```bash
curl -X GET https://guidacenter.com/api/my-subscription \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Plans d'abonnement disponibles

```bash
curl -X GET https://guidacenter.com/api/subscription-plans \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Notes importantes

1. **Tokens JWT** : Les tokens d'authentification expirent après 24 heures. Utilisez l'endpoint `/auth/refresh` pour renouveler le token.

2. **Rate Limiting** : L'API est limitée à 60 requêtes par minute par IP.

3. **CORS** : L'API accepte les requêtes depuis les origines autorisées. Pour les applications mobiles, assurez-vous d'utiliser les bons headers.

4. **Images** : Toutes les URLs d'images sont des URLs complètes (incluant le domaine).

5. **Devise** : La devise par défaut est le Franc CFA (XOF). Les prix sont toujours retournés en centimes.

6. **Timezone** : Toutes les dates sont en UTC au format ISO 8601.

7. **Abonnements** : Les vendeurs (`lister`) doivent avoir un abonnement actif pour que leurs annonces soient visibles publiquement. Sans abonnement actif, les annonces sont masquées de `GET /listings` et `GET /listings/{id}` retourne 404. Le vendeur peut toujours voir ses propres annonces via `GET /my-listings`. Les annonces ne sont jamais supprimées : elles redeviennent visibles automatiquement dès qu'un nouvel abonnement est activé.

---

**Version de l'API:** 1.1
**Dernière mise à jour:** Février 2026