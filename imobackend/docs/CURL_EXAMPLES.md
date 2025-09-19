# 🔧 Exemples cURL - Estate Hub API

Ce document contient des exemples pratiques pour tester l'API Estate Hub avec cURL.

## 🔐 Variables d'environnement

Pour simplifier les tests, définissez ces variables :

```bash
export API_BASE="http://localhost:8000/api"
export TOKEN=""  # Sera défini après connexion
```

---

## 📝 1. Inscription

### Inscription basique (client)
```bash
curl -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "0123456789",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "client",
    "company": "Test Company",
    "about": "Je suis un nouveau client"
  }'
```

### Inscription lister
```bash
curl -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Agent Immobilier",
    "email": "agent@agence.fr",
    "phone": "0123456789",
    "password": "password123",
    "password_confirmation": "password123",
    "role": "lister",
    "company": "Agence Immobilière Pro",
    "about": "Agent immobilier expérimenté"
  }'
```

### Réponse attendue (201)
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "client",
    "status": "pending",
    "profile": {
      "company": "Test Company",
      "about": "Je suis un nouveau client"
    }
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## 🔑 2. Connexion

### Connexion standard
```bash
curl -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Sauvegarder le token automatiquement
```bash
response=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }')

export TOKEN=$(echo $response | jq -r '.token')
echo "Token sauvegardé: $TOKEN"
```

---

## 👤 3. Profil utilisateur

### Récupérer le profil
```bash
curl -X GET $API_BASE/auth/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### Réponse attendue (200)
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
      "company": "Test Company",
      "about": "Je suis un nouveau client"
    }
  }
}
```

---

## ✏️ 4. Mise à jour du profil

### Modifier les informations
```bash
curl -X PUT $API_BASE/auth/profile \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe Updated",
    "phone": "0987654321",
    "company": "Updated Company",
    "about": "Profil mis à jour avec de nouvelles informations"
  }'
```

---

## 🔒 5. Changement de mot de passe

```bash
curl -X PUT $API_BASE/auth/password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "current_password": "password123",
    "new_password": "newpassword123",
    "new_password_confirmation": "newpassword123"
  }'
```

---

## 🔄 6. Renouvellement du token

```bash
curl -X POST $API_BASE/auth/refresh \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### Sauvegarder le nouveau token
```bash
response=$(curl -s -X POST $API_BASE/auth/refresh \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

export TOKEN=$(echo $response | jq -r '.token')
```

---

## 🚪 7. Déconnexion

```bash
curl -X POST $API_BASE/auth/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## ❌ 8. Tests d'erreurs

### Identifiants incorrects
```bash
curl -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }'
```

**Réponse (401) :**
```json
{
  "success": false,
  "message": "Identifiants incorrects"
}
```

### Erreurs de validation
```bash
curl -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }'
```

**Réponse (422) :**
```json
{
  "success": false,
  "message": "Erreurs de validation",
  "error_code": "VALIDATION_ERROR",
  "errors": {
    "password": ["Le mot de passe est obligatoire."],
    "role": ["Le rôle est obligatoire."]
  }
}
```

### Accès non autorisé
```bash
curl -X GET $API_BASE/auth/me \
  -H "Accept: application/json"
```

**Réponse (401) :**
```json
{
  "success": false,
  "message": "Non authentifié",
  "error_code": "UNAUTHENTICATED"
}
```

### Token expiré
```bash
curl -X GET $API_BASE/auth/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer expired_token_here"
```

**Réponse (401) :**
```json
{
  "success": false,
  "message": "Token expiré",
  "error_code": "TOKEN_EXPIRED"
}
```

---

## 🛠️ 9. Script de test complet

Créez un fichier `test_api.sh` :

```bash
#!/bin/bash

# Configuration
API_BASE="http://localhost:8000/api"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="password123"

echo "🚀 Test de l'API Estate Hub"
echo "=========================="

# 1. Inscription
echo "📝 Test inscription..."
response=$(curl -s -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$EMAIL\",
    \"phone\": \"0123456789\",
    \"password\": \"$PASSWORD\",
    \"password_confirmation\": \"$PASSWORD\",
    \"role\": \"client\",
    \"company\": \"Test Company\",
    \"about\": \"Utilisateur de test\"
  }")

if echo "$response" | grep -q '"success":true'; then
    echo "✅ Inscription réussie"
    TOKEN=$(echo $response | jq -r '.token')
else
    echo "❌ Échec inscription"
    echo "$response"
    exit 1
fi

# 2. Test profil
echo "👤 Test récupération profil..."
profile_response=$(curl -s -X GET $API_BASE/auth/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

if echo "$profile_response" | grep -q '"success":true'; then
    echo "✅ Profil récupéré"
else
    echo "❌ Échec récupération profil"
    echo "$profile_response"
fi

# 3. Test déconnexion
echo "🚪 Test déconnexion..."
logout_response=$(curl -s -X POST $API_BASE/auth/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

if echo "$logout_response" | grep -q '"success":true'; then
    echo "✅ Déconnexion réussie"
else
    echo "❌ Échec déconnexion"
    echo "$logout_response"
fi

# 4. Test connexion
echo "🔑 Test connexion..."
login_response=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

if echo "$login_response" | grep -q '"success":true'; then
    echo "✅ Connexion réussie"
else
    echo "❌ Échec connexion"
    echo "$login_response"
fi

echo "🎉 Tests terminés !"
```

Exécutez le script :
```bash
chmod +x test_api.sh
./test_api.sh
```

---

## 📊 10. Codes de statut HTTP

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | Succès | Connexion, profil |
| 201 | Créé | Inscription |
| 401 | Non autorisé | Token manquant/invalide |
| 403 | Interdit | Permissions insuffisantes |
| 404 | Non trouvé | Endpoint inexistant |
| 422 | Erreur validation | Données invalides |
| 500 | Erreur serveur | Erreur interne |

---

## 🔍 11. Débogage

### Activer le mode verbose
```bash
curl -v -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Afficher uniquement les headers
```bash
curl -I $API_BASE/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Sauvegarder la réponse dans un fichier
```bash
curl -X GET $API_BASE/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -o response.json
```

---

## 🏘️ 12. Annonces immobilières

### 📋 Liste des annonces (public)
```bash
# Liste simple
curl -X GET $API_BASE/listings \
  -H "Accept: application/json"

# Avec filtres
curl -X GET "$API_BASE/listings?type=rent&city=Paris&min_price=2000&max_price=3000&per_page=20" \
  -H "Accept: application/json"

# Recherche géographique
curl -X GET "$API_BASE/listings?lat=48.8566&lng=2.3522&radius=5&sort_by=distance" \
  -H "Accept: application/json"

# Recherche textuelle
curl -X GET "$API_BASE/listings?search=appartement%20Paris%20balcon" \
  -H "Accept: application/json"
```

### 🔍 Détail d'une annonce (public)
```bash
curl -X GET $API_BASE/listings/1 \
  -H "Accept: application/json"
```

### ➕ Créer une annonce (lister/admin)
```bash
# D'abord, se connecter en tant que lister
login_response=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "agent@agence.fr",
    "password": "password123"
  }')

export LISTER_TOKEN=$(echo $login_response | jq -r '.token')

# Créer l'annonce
curl -X POST $API_BASE/listings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $LISTER_TOKEN" \
  -d '{
    "title": "Magnifique appartement Paris 16e",
    "description": "Superbe appartement de 3 pièces situé dans le 16e arrondissement de Paris. Entièrement rénové avec des finitions de qualité.",
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
  }'
```

### ✏️ Modifier une annonce
```bash
curl -X PUT $API_BASE/listings/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $LISTER_TOKEN" \
  -d '{
    "title": "Appartement Paris 16e - PRIX RÉDUIT",
    "price": 2300,
    "description": "Superbe appartement avec réduction de prix pour location rapide!"
  }'
```

### 🗑️ Supprimer une annonce
```bash
curl -X DELETE $API_BASE/listings/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $LISTER_TOKEN"
```

### 📋 Mes annonces (lister/admin)
```bash
# Toutes mes annonces
curl -X GET $API_BASE/my-listings \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $LISTER_TOKEN"

# Filtrer par statut
curl -X GET "$API_BASE/my-listings?status=published&per_page=10" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $LISTER_TOKEN"
```

### Réponse exemple - Liste des annonces
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

### Erreurs courantes - Listings

#### Accès non autorisé (401)
```bash
curl -X POST $API_BASE/listings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"title": "Test"}'
```

**Réponse :**
```json
{
  "success": false,
  "message": "Non authentifié",
  "error_code": "UNAUTHENTICATED"
}
```

#### Permissions insuffisantes (403)
```bash
# Client essayant de créer une annonce
curl -X POST $API_BASE/listings \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -d '{"title": "Test"}'
```

**Réponse :**
```json
{
  "success": false,
  "message": "Seuls les agents immobiliers peuvent créer des annonces",
  "error_code": "ACCESS_DENIED"
}
```

#### Erreurs de validation (422)
```bash
curl -X POST $API_BASE/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LISTER_TOKEN" \
  -d '{"title": ""}'
```

**Réponse :**
```json
{
  "success": false,
  "message": "Erreurs de validation",
  "error_code": "VALIDATION_ERROR",
  "errors": {
    "title": ["Le titre est obligatoire."],
    "description": ["La description est obligatoire."],
    "type": ["Le type est obligatoire."],
    "property_type": ["Le type de propriété est obligatoire."],
    "price": ["Le prix est obligatoire."]
  }
}
```

#### Annonce non trouvée (404)
```bash
curl -X GET $API_BASE/listings/999999 \
  -H "Accept: application/json"
```

**Réponse :**
```json
{
  "success": false,
  "message": "Ressource non trouvée",
  "error_code": "RESOURCE_NOT_FOUND"
}
```

---

## 🧪 13. Script de test complet avec listings

Créez un fichier `test_listings.sh` :

```bash
#!/bin/bash

# Configuration
API_BASE="http://localhost:8000/api"
EMAIL="lister_$(date +%s)@agence.fr"
PASSWORD="password123"

echo "🏘️ Test des annonces Estate Hub"
echo "==============================="

# 1. Inscription lister
echo "📝 Inscription agent immobilier..."
response=$(curl -s -X POST $API_BASE/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"name\": \"Agent Test\",
    \"email\": \"$EMAIL\",
    \"phone\": \"0123456789\",
    \"password\": \"$PASSWORD\",
    \"password_confirmation\": \"$PASSWORD\",
    \"role\": \"lister\",
    \"company\": \"Agence Test\",
    \"about\": \"Agent immobilier de test\"
  }")

if echo "$response" | grep -q '"success":true'; then
    echo "✅ Inscription lister réussie"
    TOKEN=$(echo $response | jq -r '.token')
else
    echo "❌ Échec inscription lister"
    echo "$response"
    exit 1
fi

# 2. Test liste publique
echo "📋 Test liste publique des annonces..."
listings_response=$(curl -s -X GET $API_BASE/listings \
  -H "Accept: application/json")

if echo "$listings_response" | grep -q '"success":true'; then
    echo "✅ Liste publique récupérée"
else
    echo "❌ Échec liste publique"
    echo "$listings_response"
fi

# 3. Création d'annonce
echo "➕ Test création d'annonce..."
create_response=$(curl -s -X POST $API_BASE/listings \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Appartement Test API",
    "description": "Appartement créé via API de test",
    "type": "rent",
    "property_type": "apartment",
    "price": 1500,
    "currency": "XOF",
    "rent_period": "monthly",
    "area_size": 50,
    "area_unit": "m2",
    "rooms": 2,
    "bedrooms": 1,
    "bathrooms": 1,
    "address_line1": "123 Rue de Test",
    "city": "Paris",
    "postal_code": "75001",
    "country_code": "FR",
    "latitude": 48.8566,
    "longitude": 2.3522
  }')

if echo "$create_response" | grep -q '"success":true'; then
    echo "✅ Annonce créée avec succès"
    LISTING_ID=$(echo $create_response | jq -r '.data.id')
else
    echo "❌ Échec création annonce"
    echo "$create_response"
    exit 1
fi

# 4. Test détail d'annonce
echo "🔍 Test détail d'annonce..."
detail_response=$(curl -s -X GET $API_BASE/listings/$LISTING_ID \
  -H "Accept: application/json")

if echo "$detail_response" | grep -q '"success":true'; then
    echo "✅ Détail d'annonce récupéré"
else
    echo "❌ Échec détail d'annonce"
    echo "$detail_response"
fi

# 5. Test mes annonces
echo "📋 Test mes annonces..."
my_listings_response=$(curl -s -X GET $API_BASE/my-listings \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

if echo "$my_listings_response" | grep -q '"success":true'; then
    echo "✅ Mes annonces récupérées"
else
    echo "❌ Échec mes annonces"
    echo "$my_listings_response"
fi

# 6. Test modification
echo "✏️ Test modification d'annonce..."
update_response=$(curl -s -X PUT $API_BASE/listings/$LISTING_ID \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Appartement Test API - MODIFIÉ",
    "price": 1600
  }')

if echo "$update_response" | grep -q '"success":true'; then
    echo "✅ Annonce modifiée avec succès"
else
    echo "❌ Échec modification annonce"
    echo "$update_response"
fi

# 7. Test suppression
echo "🗑️ Test suppression d'annonce..."
delete_response=$(curl -s -X DELETE $API_BASE/listings/$LISTING_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

if echo "$delete_response" | grep -q '"success":true'; then
    echo "✅ Annonce supprimée avec succès"
else
    echo "❌ Échec suppression annonce"
    echo "$delete_response"
fi

echo "🎉 Tests des annonces terminés !"
```

Exécutez le script :
```bash
chmod +x test_listings.sh
./test_listings.sh
```

---

**✨ Bon testing !**
