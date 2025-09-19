# 🏠 Estate Hub API - Documentation

API REST pour une plateforme immobilière moderne avec authentification JWT.

## 🚀 Démarrage rapide

### Prérequis
- PHP 8.1+
- MySQL 8.0+
- Composer
- Laravel 10

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd imobackend

# Installer les dépendances
composer install

# Configuration
cp .env.example .env
php artisan key:generate
php artisan jwt:secret

# Base de données
php artisan migrate

# Lancer le serveur
php artisan serve
```

## 📋 Structure de l'API

### Base URL
```
http://localhost:8000/api
```

### Format de réponse
Toutes les réponses de l'API suivent ce format :

**Succès :**
```json
{
  "success": true,
  "message": "Message de succès",
  "data": { ... }
}
```

**Erreur :**
```json
{
  "success": false,
  "message": "Message d'erreur",
  "error_code": "CODE_ERRXOF",
  "errors": { ... }
}
```

## 🔐 Authentification

L'API utilise JWT (JSON Web Token) pour l'authentification.

### Headers requis
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

### Rôles utilisateur
- **admin** : Administration complète
- **lister** : Gestion des annonces immobilières
- **client** : Consultation et demandes

### Statuts utilisateur
- **active** : Compte actif
- **pending** : En attente d'activation
- **suspended** : Compte suspendu

---

## 📚 Endpoints

### 🔑 Authentification

#### 1. Inscription
```http
POST /api/auth/register
```

**Body :**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "client",
  "company": "Mon Entreprise",
  "about": "Description du profil"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0123456789",
    "role": "client",
    "status": "pending",
    "profile": {
      "company": "Mon Entreprise",
      "about": "Description du profil"
    }
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 2. Connexion
```http
POST /api/auth/login
```

**Body :**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": { ... },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### 3. Profil utilisateur
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Réponse :**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0123456789",
    "role": "client",
    "status": "pending",
    "profile": {
      "avatar_path": null,
      "company": "Mon Entreprise",
      "about": "Description du profil"
    }
  }
}
```

#### 4. Déconnexion
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

#### 5. Renouvellement du token
```http
POST /api/auth/refresh
Authorization: Bearer {token}
```

#### 6. Mise à jour du profil
```http
PUT /api/auth/profile
Authorization: Bearer {token}
```

**Body :**
```json
{
  "name": "Nouveau nom",
  "phone": "0987654321",
  "company": "Nouvelle entreprise",
  "about": "Nouvelle description"
}
```

#### 7. Changement de mot de passe
```http
PUT /api/auth/password
Authorization: Bearer {token}
```

**Body :**
```json
{
  "current_password": "ancienpassword",
  "new_password": "nouveaupassword",
  "new_password_confirmation": "nouveaupassword"
}
```

---

## 🏘️ Annonces immobilières

### 📋 Liste des annonces
```http
GET /api/listings
```

**Paramètres de requête (optionnels) :**
- `type` : `sale` ou `rent`
- `property_type` : `apartment`, `house`, `villa`, `land`, `office`, `shop`, `warehouse`, `other`
- `city` : Nom de la ville
- `min_price` : Prix minimum
- `max_price` : Prix maximum
- `rooms` : Nombre de pièces
- `bedrooms` : Nombre de chambres
- `search` : Recherche textuelle
- `lat` & `lng` : Coordonnées pour recherche géographique
- `radius` : Rayon de recherche en km (défaut: 10)
- `sort_by` : Champ de tri (défaut: `created_at`)
- `sort_order` : Ordre de tri `asc` ou `desc` (défaut: `desc`)
- `per_page` : Nombre d'éléments par page (max 50, défaut: 15)

**Exemple :**
```http
GET /api/listings?type=rent&city=Paris&min_price=2000&max_price=3000&per_page=20
```

**Réponse :**
```json
{
  "success": true,
  "message": "Annonces récupérées avec succès",
  "data": [
    {
      "id": 1,
      "title": "Appartement Paris 16e",
      "slug": "appartement-paris-16e",
      "type": "rent",
      "property_type": "apartment",
      "status": "published",
      "price": {
        "amount": 2500,
        "currency": "XOF",
        "formatted": "2 500 CFA",
        "rent_period": "monthly"
      },
      "area_size": 75.5,
      "area_unit": "m2",
      "rooms": 3,
      "bedrooms": 2,
      "bathrooms": 1,
      "location": {
        "address_line1": "15 Avenue Foch",
        "city": "Paris",
        "postal_code": "75116",
        "coordinates": {
          "lat": 48.8647,
          "lng": 2.2736
        }
      },
      "views_count": 45,
      "created_at": "2025-01-15 10:30:00",
      "owner": {
        "name": "Agent Immobilier",
        "company": "Agence Test",
        "phone": "0123456789"
      },
      "amenities": ["parking", "balcony", "elevator"]
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 20,
    "total": 45,
    "has_more_pages": true
  }
}
```

### 🔍 Détail d'une annonce
```http
GET /api/listings/{id}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Détail de l'annonce récupéré avec succès",
  "data": {
    "id": 1,
    "title": "Appartement Paris 16e",
    "slug": "appartement-paris-16e",
    "description": "Superbe appartement de 3 pièces...",
    "type": "rent",
    "property_type": "apartment",
    "status": "published",
    "price": {
      "amount": 2500,
      "currency": "XOF",
      "formatted": "2 500 CFA/mois",
      "rent_period": "monthly",
      "deposit_amount": 5000,
      "lease_min_months": 12
    },
    "characteristics": {
      "area_size": 75.5,
      "area_unit": "m2",
      "rooms": 3,
      "bedrooms": 2,
      "bathrooms": 1,
      "parking_spaces": 1,
      "floor": 4,
      "year_built": 1980
    },
    "location": {
      "address_line1": "15 Avenue Foch",
      "city": "Paris",
      "postal_code": "75116",
      "coordinates": {
        "lat": 48.8647,
        "lng": 2.2736
      },
      "full_address": "15 Avenue Foch, 75116, Paris"
    },
    "metadata": {
      "views_count": 46,
      "features": ["climatisation", "parquet", "cuisine équipée"],
      "is_favorite": false
    },
    "photos": [
      {
        "id": 1,
        "url": "https://example.com/storage/photo1.jpg",
        "is_cover": true,
        "sort_order": 0
      }
    ],
    "owner": {
      "id": 2,
      "name": "Agent Immobilier",
      "phone": "0123456789",
      "company": "Agence Test",
      "role": "lister",
      "member_since": "2024-01-01"
    },
    "amenities": [
      {
        "id": 1,
        "code": "parking",
        "label": "Parking"
      }
    ],
    "permissions": {
      "can_edit": false,
      "can_delete": false,
      "can_contact": true,
      "can_favorite": true
    }
  }
}
```

### ➕ Créer une annonce
```http
POST /api/listings
Authorization: Bearer {token}
```

**Permissions :** Agents immobiliers (`lister`) et administrateurs (`admin`)

**Body :**
```json
{
  "title": "Magnifique appartement Paris 16e",
  "description": "Superbe appartement de 3 pièces situé dans le 16e arrondissement...",
  "type": "rent",
  "property_type": "apartment",
  "price": 2500,
  "currency": "XOF",
  "rent_period": "monthly",
  "deposit_amount": 5000,
  "lease_min_months": 12,
  "area_size": 75.5,
  "area_unit": "m2",
  "rooms": 3,
  "bedrooms": 2,
  "bathrooms": 1,
  "parking_spaces": 1,
  "floor": 4,
  "year_built": 1980,
  "address_line1": "15 Avenue Foch",
  "city": "Paris",
  "postal_code": "75116",
  "country_code": "FR",
  "latitude": 48.8647,
  "longitude": 2.2736,
  "available_from": "2024-02-01",
  "amenity_ids": [1, 2, 6],
  "features": ["climatisation", "parquet", "cuisine équipée"]
}
```

**Champs obligatoires :**
- `title`, `description`, `type`, `property_type`
- `price`, `address_line1`, `city`, `latitude`, `longitude`
- `rent_period` (si `type` = `rent`)

### ✏️ Modifier une annonce
```http
PUT /api/listings/{id}
Authorization: Bearer {token}
```

**Permissions :** Propriétaire de l'annonce ou administrateur

**Body :** Mêmes champs que la création (tous optionnels)

### 🗑️ Supprimer une annonce
```http
DELETE /api/listings/{id}
Authorization: Bearer {token}
```

**Permissions :** Propriétaire de l'annonce ou administrateur

**Réponse :**
```json
{
  "success": true,
  "message": "Annonce supprimée avec succès"
}
```

### 📋 Mes annonces
```http
GET /api/my-listings
Authorization: Bearer {token}
```

**Paramètres :**
- `status` : Filtrer par statut
- `type` : Filtrer par type
- `sort_by`, `sort_order`, `per_page`

**Permissions :** Agents immobiliers et administrateurs

---

## 👥 Gestion des Utilisateurs (Admin)

### 📋 Liste des utilisateurs
```http
GET /api/admin/users
Authorization: Bearer {token}
```

**Permissions :** Administrateurs uniquement

**Paramètres de requête (optionnels) :**
- `role` : `admin`, `lister`, `client`
- `status` : `active`, `suspended`, `pending`
- `search` : Recherche textuelle (nom, email, téléphone, entreprise)
- `sort_by` : Champ de tri (`id`, `name`, `email`, `role`, `status`, `created_at`)
- `sort_order` : Ordre de tri `asc` ou `desc` (défaut: `desc`)
- `per_page` : Nombre d'éléments par page (max 100, défaut: 15)

**Exemple :**
```http
GET /api/admin/users?role=lister&status=active&search=martin&per_page=25
```

**Réponse :**
```json
{
  "success": true,
  "message": "Liste des utilisateurs récupérée avec succès",
  "data": [
    {
      "id": 2,
      "name": "Marie Martin",
      "email": "marie.martin@example.com",
      "phone": "+33123456789",
      "role": "lister",
      "status": "active",
      "email_verified_at": "2024-01-10T10:30:00.000000Z",
      "last_login_ip": "192.168.1.100",
      "profile": {
        "avatar_path": null,
        "company": "Agence Martin Immobilier",
        "about": "Agent immobilier expérimenté"
      },
      "stats": {
        "listings_count": 12,
        "inquiries_count": 5,
        "deals_count": 3
      },
      "created_at": "2024-01-10T09:00:00.000000Z",
      "updated_at": "2024-01-15T14:30:00.000000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 25,
    "total": 67,
    "from": 1,
    "to": 25,
    "has_more_pages": true
  }
}
```

### 🔍 Détail d'un utilisateur
```http
GET /api/admin/users/{id}
Authorization: Bearer {token}
```

**Permissions :** Administrateurs uniquement

**Réponse :**
```json
{
  "success": true,
  "message": "Détails de l'utilisateur récupérés avec succès",
  "data": {
    "id": 2,
    "name": "Marie Martin",
    "email": "marie.martin@example.com",
    "phone": "+33123456789",
    "role": "lister",
    "status": "active",
    "email_verified_at": "2024-01-10T10:30:00.000000Z",
    "last_login_ip": "192.168.1.100",
    "profile": {
      "avatar_path": null,
      "company": "Agence Martin Immobilier",
      "about": "Agent immobilier expérimenté"
    },
    "stats": {
      "listings_count": 12,
      "inquiries_count": 5,
      "deals_count": 3
    },
    "detailed_stats": {
      "total_listings": 12,
      "active_listings": 8,
      "total_inquiries": 5,
      "pending_inquiries": 2,
      "total_deals": 3,
      "completed_deals": 2
    },
    "recent_activity": [
      {
        "action": "listing_created",
        "subject_type": "App\\Models\\Listing",
        "subject_id": 15,
        "properties": {
          "property_type": "apartment",
          "city": "Paris",
          "price": 450000
        },
        "created_at": "2024-01-15T14:30:00.000000Z"
      }
    ],
    "created_at": "2024-01-10T09:00:00.000000Z",
    "updated_at": "2024-01-15T14:30:00.000000Z"
  }
}
```

### ✏️ Modifier le statut d'un utilisateur
```http
PUT /api/admin/users/{id}/status
Authorization: Bearer {token}
```

**Permissions :** Administrateurs uniquement

**Body :**
```json
{
  "status": "suspended",
  "reason": "Violation des conditions d'utilisation"
}
```

**Champs obligatoires :**
- `status` : `active`, `suspended`, `pending`

**Champs optionnels :**
- `reason` : Raison du changement de statut

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur suspendu avec succès",
  "data": {
    "id": 2,
    "name": "Marie Martin",
    "email": "marie.martin@example.com",
    "status": "suspended",
    // ... autres champs
  }
}
```

### 🛡️ Modifier le rôle d'un utilisateur
```http
PUT /api/admin/users/{id}/role
Authorization: Bearer {token}
```

**Permissions :** Administrateurs uniquement

**Body :**
```json
{
  "role": "admin",
  "reason": "Promotion au poste d'administrateur"
}
```

**Champs obligatoires :**
- `role` : `admin`, `lister`, `client`

**Champs optionnels :**
- `reason` : Raison du changement de rôle

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur promu administrateur avec succès",
  "data": {
    "id": 2,
    "name": "Marie Martin",
    "email": "marie.martin@example.com",
    "role": "admin",
    // ... autres champs
  }
}
```

### 🗑️ Supprimer un utilisateur
```http
DELETE /api/admin/users/{id}
Authorization: Bearer {token}
```

**Permissions :** Administrateurs uniquement

**Restrictions :**
- Un administrateur ne peut pas se supprimer lui-même
- Impossible de supprimer le dernier administrateur actif

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur supprimé avec succès"
}
```

### 📊 Statistiques des utilisateurs
```http
GET /api/admin/users/statistics
Authorization: Bearer {token}
```

**Permissions :** Administrateurs uniquement

**Réponse :**
```json
{
  "success": true,
  "message": "Statistiques des utilisateurs récupérées avec succès",
  "data": {
    "total_users": 150,
    "by_role": {
      "admin": 3,
      "lister": 25,
      "client": 122
    },
    "by_status": {
      "active": 140,
      "suspended": 5,
      "pending": 5
    },
    "recent_registrations": 12
  }
}
```

---

## ⚠️ Codes d'erreur

| Code | Message | Description |
|------|---------|-------------|
| `TOKEN_EXPIRED` | Token expiré | Le JWT a expiré |
| `TOKEN_INVALID` | Token invalide | Le JWT est malformé |
| `JWT_ERROR` | Erreur d'authentification | Problème JWT général |
| `UNAUTHENTICATED` | Non authentifié | Token manquant |
| `ACCESS_DENIED` | Accès interdit | Permissions insuffisantes |
| `VALIDATION_ERROR` | Erreurs de validation | Données invalides |
| `RESOURCE_NOT_FOUND` | Ressource non trouvée | Ressource inexistante |
| `ENDPOINT_NOT_FOUND` | Endpoint non trouvé | Route inexistante |

---

## 🧪 Tests avec cURL

### Inscription
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "client",
    "company": "Test Company",
    "about": "Description test"
  }'
```

### Connexion
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Profil (avec token)
```bash
curl -X GET http://localhost:8000/api/auth/me \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🛠️ Configuration

### Variables d'environnement
```env
# Application
APP_NAME="Estate Hub API"
APP_URL=http://localhost:8000

# Base de données
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=estate_hub
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_TTL=1440                # 24 heures
JWT_REFRESH_TTL=20160       # 2 semaines
JWT_BLACKLIST_ENABLED=true
```

### Middleware disponibles
- `auth:api` - Authentification JWT
- `role:admin,lister,client` - Contrôle d'accès par rôle
- `active.user` - Vérification statut utilisateur actif

---

## 📊 Base de données

### Tables principales
- `users` - Utilisateurs avec rôles et statuts
- `user_profiles` - Profils utilisateurs étendus
- `listings` - Annonces immobilières
- `listing_photos` - Photos des annonces
- `amenities` - Équipements/commodités
- `inquiries` - Demandes clients
- `deals` - Transactions immobilières
- `activity_logs` - Journal d'activité

### Schéma complet
Voir les migrations dans `database/migrations/` pour le schéma détaillé.

---

## 🔧 Développement

### Lancer les tests
```bash
php artisan test
```

### Générer la documentation API
```bash
php artisan api:generate
```

### Effacer le cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

---

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur le repository
- Consulter la documentation Laravel : https://laravel.com/docs
- Documentation JWT : https://jwt-auth.readthedocs.io/

---

**Estate Hub API v1.0** - Développé avec ❤️ et Laravel
