# 🗄️ Schéma de base de données - Estate Hub

Documentation complète du schéma de base de données pour la plateforme immobilière.

## 📋 Vue d'ensemble

### Technologies
- **SGBD** : MySQL 8.0+
- **ORM** : Eloquent (Laravel 10)
- **Migration** : Laravel Migrations
- **Indexation** : Index composés + FULLTEXT

### Caractéristiques
- ✅ **Relations** : Foreign Keys avec contraintes
- ✅ **Soft Deletes** : Suppression logique pour `listings`
- ✅ **Timestamps** : `created_at` / `updated_at` avec timezone
- ✅ **Index** : Performance optimisée
- ✅ **Enums** : Types stricts MySQL 8
- ✅ **JSON** : Champs flexibles pour features

---

## 🗂️ Migrations par ordre d'exécution

### Vue d'ensemble des migrations
Les migrations sont exécutées dans l'ordre chronologique pour respecter les dépendances entre tables.

| Ordre | Migration | Utilité |
|-------|-----------|---------|
| 1 | `add_real_estate_fields_to_users_table` | Ajoute les champs immobilier à la table users existante |
| 2 | `create_user_profiles_table` | Profils étendus des utilisateurs |
| 3 | `create_listings_table` | Annonces immobilières (cœur de l'app) |
| 4 | `create_listing_photos_table` | Photos des annonces |
| 5 | `create_amenities_table` | Équipements disponibles |
| 6 | `create_amenity_listing_table` | Liaison annonces ↔ équipements |
| 7 | `create_inquiries_table` | Demandes clients |
| 8 | `create_deals_table` | Transactions immobilières |
| 9 | `create_deal_payments_table` | Paiements des transactions |
| 10 | `create_favorites_table` | Favoris des utilisateurs |
| 11 | `create_listing_reports_table` | Signalements d'annonces |
| 12 | `create_activity_logs_table` | Journal d'activité |

---

### 🔧 Migration 1: `add_real_estate_fields_to_users_table`

**Fichier** : `2025_09_17_165319_add_real_estate_fields_to_users_table.php`

**Utilité** : Étend la table `users` existante de Laravel avec les champs spécifiques à l'immobilier.

**Pourquoi cette approche** :
- La table `users` existe déjà dans Laravel
- Évite les conflits de migration
- Ajoute uniquement les champs nécessaires

**Champs ajoutés** :
```php
$table->string('phone', 30)->nullable()->index();
$table->enum('role', ['admin', 'lister', 'client'])->default('client')->index();
$table->enum('status', ['active', 'suspended', 'pending'])->default('pending')->index();
$table->string('last_login_ip', 45)->nullable();
$table->index(['role', 'status']); // Index composite
```

**Impact** :
- ✅ Système de rôles pour l'immobilier
- ✅ Gestion des statuts utilisateur
- ✅ Traçabilité des connexions
- ✅ Performance avec index composé

---

### 👤 Migration 2: `create_user_profiles_table`

**Fichier** : `2024_01_01_000002_create_user_profiles_table.php`

**Utilité** : Profils étendus des utilisateurs avec informations complémentaires.

**Pourquoi séparer** :
- Table `users` reste légère
- Évite les colonnes NULL nombreuses
- Flexibilité pour ajouter des champs métier

**Champs clés** :
```php
$table->foreignId('user_id')->unique()->constrained();
$table->string('avatar_path', 255)->nullable();
$table->string('company', 150)->nullable();
$table->text('about')->nullable();
```

**Cas d'usage** :
- **Agents immobiliers** : Nom d'agence, description professionnelle
- **Clients** : Photo de profil, présentation
- **Admins** : Informations de contact étendues

---

### 🏠 Migration 3: `create_listings_table`

**Fichier** : `2024_01_01_000003_create_listings_table.php`

**Utilité** : **Table centrale** - Stocke toutes les annonces immobilières.

**Complexité justifiée** :
- Gère vente ET location
- Informations géographiques précises
- Métadonnées riches (JSON features)
- Système de statuts complet

**Sections principales** :

#### **Prix/Location**
```php
$table->decimal('price', 15,2);                    // Prix principal
$table->enum('rent_period', ['monthly', 'weekly', 'daily']);  // Période location
$table->decimal('deposit_amount', 15,2);           // Dépôt de garantie
$table->smallInteger('lease_min_months');          // Durée minimum
```

#### **Caractéristiques physiques**
```php
$table->decimal('area_size', 10,2);               // Surface
$table->tinyInteger('rooms')->unsigned();         // Nombre pièces
$table->tinyInteger('bedrooms')->unsigned();      // Chambres
$table->smallInteger('floor');                    // Étage
```

#### **Géolocalisation**
```php
$table->decimal('latitude', 10,7);               // Coordonnées GPS
$table->decimal('longitude', 10,7);              // pour carte interactive
$table->string('city', 120)->index();            // Recherche par ville
```

#### **Soft Deletes**
```php
$table->softDeletesTz();  // Suppression logique pour historique
```

**Index stratégiques** :
- **Composite** : `(type, status)` pour filtres fréquents
- **Géographique** : `(latitude, longitude)` pour recherche proximité
- **FULLTEXT** : `(title, description, city)` pour recherche textuelle

---

### 📸 Migration 4: `create_listing_photos_table`

**Fichier** : `2024_01_01_000004_create_listing_photos_table.php`

**Utilité** : Gestion des photos d'annonces avec métadonnées.

**Fonctionnalités** :
```php
$table->boolean('is_cover')->default(false);     // Photo principale
$table->smallInteger('sort_order')->default(0);  // Ordre d'affichage
$table->integer('width')->nullable();            // Dimensions
$table->bigInteger('size_bytes')->nullable();    // Optimisation stockage
```

**Avantages** :
- ✅ Galeries ordonnées
- ✅ Photo de couverture automatique
- ✅ Métadonnées pour optimisation
- ✅ Gestion multi-disques (local/cloud)

---

### 🏷️ Migration 5: `create_amenities_table`

**Fichier** : `2024_01_01_000005_create_amenities_table.php`

**Utilité** : Référentiel des équipements/commodités.

**Design pattern** :
```php
$table->string('code', 60)->unique();  // Identifiant technique
$table->string('label', 120);          // Libellé affiché
```

**Exemples** :
- `parking` → "Parking privé"
- `swimming_pool` → "Piscine"
- `elevator` → "Ascenseur"

**Avantages** :
- ✅ Évite la duplication
- ✅ Facilite la traduction
- ✅ Filtres de recherche standardisés
- ✅ Évolutif (ajout facile d'équipements)

---

### 🔗 Migration 6: `create_amenity_listing_table`

**Fichier** : `2024_01_01_000006_create_amenity_listing_table.php`

**Utilité** : Table pivot Many-to-Many entre annonces et équipements.

**Relation** : `listings` ↔ `amenities`

```php
$table->foreignId('listing_id')->constrained();
$table->foreignId('amenity_id')->constrained();
$table->primary(['listing_id', 'amenity_id']); // Clé composite
```

**Pourquoi cette approche** :
- Une annonce a plusieurs équipements
- Un équipement concerne plusieurs annonces
- Recherche efficace : "Appartements avec parking + piscine"

**Performance** :
- Index sur chaque FK pour requêtes rapides
- Pas de timestamps (données statiques)

---

### 📞 Migration 7: `create_inquiries_table`

**Fichier** : `2024_01_01_000007_create_inquiries_table.php`

**Utilité** : Gestion des demandes clients sur les annonces.

**Workflow métier** :
```php
$table->enum('status', [
    'new',          // Nouvelle demande
    'contacted',    // Client contacté
    'in_review',    // Dossier en cours
    'approved',     // Demande validée
    'rejected',     // Demande refusée
    'cancelled',    // Annulée par client
    'converted'     // Transformée en transaction
]);
```

**Traçabilité** :
```php
$table->foreignId('handled_by')->nullable();  // Qui traite
$table->dateTime('handled_at')->nullable();   // Quand
$table->dateTime('closed_at')->nullable();    // Clôture
```

**Contrôle cohérence** :
- `inquiry.type` doit correspondre à `listing.type`
- Évite les demandes de vente sur une location

---

### 🤝 Migration 8: `create_deals_table`

**Fichier** : `2024_01_01_000008_create_deals_table.php`

**Utilité** : Transactions immobilières (ventes/locations signées).

**Cycle de vie** :
```php
$table->enum('status', [
    'draft',              // Brouillon
    'pending_signature',  // En attente signature
    'signed',            // Signé
    'paid',              // Payé
    'cancelled',         // Annulé
    'failed',            // Échoué
    'completed'          // Terminé
]);
```

**Spécificités location** :
```php
$table->smallInteger('lease_months');    // Durée bail
$table->date('start_date');              // Début location
$table->date('end_date');                // Fin location
```

**Gestion documents** :
```php
$table->string('contract_file', 255);    // Contrat signé
$table->text('notes');                   // Notes internes
```

**Relation 1:1** avec `inquiries` : une demande = max 1 transaction

---

### 💰 Migration 9: `create_deal_payments_table`

**Fichier** : `2024_01_01_000009_create_deal_payments_table.php`

**Utilité** : Historique des paiements pour chaque transaction.

**Types de paiement** :
```php
$table->enum('type', ['deposit', 'rent', 'sale', 'fee', 'other']);
```

**Traçabilité complète** :
```php
$table->dateTime('paid_at');                    // Date/heure exacte
$table->enum('method', ['bank_transfer', 'cash', 'card']);
$table->string('reference', 120)->nullable();   // Référence bancaire
```

**Cas d'usage** :
- **Vente** : Acompte → Solde
- **Location** : Dépôt → Loyers mensuels
- **Commissions** : Frais d'agence

**Avantages** :
- ✅ Suivi financier précis
- ✅ Rapports comptables
- ✅ Preuves de paiement

---

### ⭐ Migration 10: `create_favorites_table`

**Fichier** : `2024_01_01_000010_create_favorites_table.php`

**Utilité** : Système de favoris/wishlist pour les utilisateurs.

**Design minimaliste** :
```php
$table->foreignId('user_id');
$table->foreignId('listing_id');
$table->timestampTz('created_at');  // Quand ajouté
$table->primary(['user_id', 'listing_id']);
```

**Fonctionnalités** :
- ✅ Sauvegarde d'annonces intéressantes
- ✅ Notification si prix baisse
- ✅ Historique des préférences
- ✅ Recommandations personnalisées

**Performance** :
- Clé primaire composite évite les doublons
- Index optimisés pour requêtes fréquentes

---

### 🚨 Migration 11: `create_listing_reports_table`

**Fichier** : `2024_01_01_000011_create_listing_reports_table.php`

**Utilité** : Modération - Signalements d'annonces problématiques.

**Workflow modération** :
```php
$table->enum('status', [
    'new',        // Nouveau signalement
    'reviewed',   // Examiné par admin
    'dismissed',  // Signalement rejeté
    'removed'     // Annonce supprimée
]);
```

**Flexibilité** :
```php
$table->string('reason', 180);           // Motif court
$table->text('message')->nullable();     // Détails
$table->foreignId('user_id')->nullable(); // Signaleur (peut être anonyme)
```

**Exemples de signalements** :
- Photos trompeuses
- Prix incorrect
- Contenu inapproprié
- Doublon d'annonce

---

### 📊 Migration 12: `create_activity_logs_table`

**Fichier** : `2024_01_01_000012_create_activity_logs_table.php`

**Utilité** : Journal d'audit complet de toutes les actions.

**Design polymorphe** :
```php
$table->string('subject_type', 120);     // Classe du modèle
$table->bigInteger('subject_id');        // ID de l'objet
$table->json('properties')->nullable();  // Données contextuelles
```

**Exemples d'événements** :
```php
ActivityLog::log('listing_created', $listing, $user, [
    'property_type' => 'apartment',
    'city' => 'Paris',
    'price' => 350000
]);
```

**Avantages** :
- ✅ Traçabilité complète
- ✅ Détection de fraude
- ✅ Analyse comportementale
- ✅ Conformité RGPD

---

## 🔄 Ordre d'exécution et dépendances

### Graphique des dépendances
```
users (existant)
└── add_real_estate_fields (1)
    ├── user_profiles (2)
    └── listings (3)
        ├── listing_photos (4)
        ├── amenity_listing (6) ← amenities (5)
        ├── inquiries (7)
        │   └── deals (8)
        │       └── deal_payments (9)
        ├── favorites (10)
        ├── listing_reports (11)
        └── activity_logs (12)
```

### Points critiques
1. **Users d'abord** : Base de l'authentification
2. **Listings ensuite** : Cœur métier
3. **Relations après** : Évite les erreurs FK
4. **Logs en dernier** : Capture tout l'historique

---

## 🎯 Avantages de cette architecture

### **Séparation des responsabilités**
- Chaque table a un rôle précis
- Évite les "god tables" monolithiques
- Facilite la maintenance

### **Performance optimisée**
- Index stratégiques sur les colonnes critiques
- Relations bien définies
- Requêtes efficaces

### **Évolutivité**
- Ajout facile de nouvelles fonctionnalités
- Schema flexible avec JSON
- Migrations versionnées

### **Intégrité des données**
- Foreign keys avec contraintes
- Enums pour valeurs contrôlées
- Validation au niveau base

---

**💡 Cette architecture supporte une plateforme immobilière complète et scalable !**

---

## 👥 Table: `users`

Utilisateurs de la plateforme avec système de rôles.

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(191) UNIQUE NOT NULL,
    phone VARCHAR(30) NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'lister', 'client') DEFAULT 'client',
    status ENUM('active', 'suspended', 'pending') DEFAULT 'pending',
    email_verified_at TIMESTAMP NULL,
    last_login_ip VARCHAR(45) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_phone (phone),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_role_status (role, status)
);
```

### Rôles utilisateur
- **`admin`** : Administration complète
- **`lister`** : Agent immobilier (création d'annonces)
- **`client`** : Client final (recherche/demandes)

### Statuts utilisateur
- **`active`** : Compte actif
- **`pending`** : En attente d'activation
- **`suspended`** : Compte suspendu

---

## 📄 Table: `user_profiles`

Profils étendus des utilisateurs.

```sql
CREATE TABLE user_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED UNIQUE NOT NULL,
    avatar_path VARCHAR(255) NULL,
    company VARCHAR(150) NULL,
    about TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Relation** : `users` 1:1 `user_profiles`

---

## 🏠 Table: `listings`

Annonces immobilières (cœur de la plateforme).

```sql
CREATE TABLE listings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type ENUM('sale', 'rent') NOT NULL,
    title VARCHAR(180) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description LONGTEXT NOT NULL,
    property_type ENUM('apartment', 'house', 'villa', 'land', 'office', 'shop', 'warehouse', 'other') NOT NULL,

    -- Prix/Location
    price DECIMAL(15,2) NOT NULL,
    currency CHAR(3) DEFAULT 'XOF',
    rent_period ENUM('monthly', 'weekly', 'daily') NULL,
    deposit_amount DECIMAL(15,2) NULL,
    lease_min_months SMALLINT NULL,

    -- Caractéristiques
    area_size DECIMAL(10,2) NULL,
    area_unit ENUM('m2', 'ha', 'ft2') NULL,
    rooms TINYINT UNSIGNED NULL,
    bedrooms TINYINT UNSIGNED NULL,
    bathrooms TINYINT UNSIGNED NULL,
    parking_spaces TINYINT UNSIGNED NULL,
    floor SMALLINT NULL,
    year_built SMALLINT NULL,

    -- Adresse/Localisation
    address_line1 VARCHAR(180) NOT NULL,
    address_line2 VARCHAR(180) NULL,
    city VARCHAR(120) NOT NULL,
    state VARCHAR(120) NULL,
    postal_code VARCHAR(20) NULL,
    country_code CHAR(2) DEFAULT 'FR',
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,

    -- Statuts/Dates
    available_from DATE NULL,
    status ENUM('draft', 'pending_review', 'published', 'rejected', 'archived', 'sold', 'rented') DEFAULT 'draft',
    expires_at DATETIME NULL,

    -- Métadonnées
    views_count BIGINT UNSIGNED DEFAULT 0,
    features_json JSON NULL,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,

    -- Index
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_property_type (property_type),
    INDEX idx_currency (currency),
    INDEX idx_city (city),
    INDEX idx_state (state),
    INDEX idx_postal_code (postal_code),
    INDEX idx_country_code (country_code),
    INDEX idx_latitude (latitude),
    INDEX idx_longitude (longitude),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    INDEX idx_type_status (type, status),
    INDEX idx_country_city (country_code, city),
    INDEX idx_lat_lng (latitude, longitude),

    FULLTEXT idx_search (title, description, city),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Types d'annonces
- **`sale`** : Vente
- **`rent`** : Location

### Types de propriétés
- **`apartment`** : Appartement
- **`house`** : Maison
- **`villa`** : Villa
- **`land`** : Terrain
- **`office`** : Bureau
- **`shop`** : Commerce
- **`warehouse`** : Entrepôt
- **`other`** : Autre

### Statuts d'annonce
- **`draft`** : Brouillon
- **`pending_review`** : En attente de validation
- **`published`** : Publiée
- **`rejected`** : Rejetée
- **`archived`** : Archivée
- **`sold`** : Vendue
- **`rented`** : Louée

**Relations** :
- `users` 1:N `listings`
- Soft deletes activés

---

## 📸 Table: `listing_photos`

Photos des annonces immobilières.

```sql
CREATE TABLE listing_photos (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT UNSIGNED NOT NULL,
    path VARCHAR(255) NOT NULL,
    disk VARCHAR(50) DEFAULT 'public',
    is_cover BOOLEAN DEFAULT FALSE,
    sort_order SMALLINT UNSIGNED DEFAULT 0,
    width INT NULL,
    height INT NULL,
    size_bytes BIGINT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_listing_id (listing_id),
    INDEX idx_is_cover (is_cover),

    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);
```

**Relation** : `listings` 1:N `listing_photos`

---

## 🏷️ Table: `amenities`

Équipements et commodités.

```sql
CREATE TABLE amenities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(60) UNIQUE NOT NULL,
    label VARCHAR(120) NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Exemples d'équipements
```sql
INSERT INTO amenities (code, label) VALUES
('parking', 'Parking'),
('balcony', 'Balcon'),
('terrace', 'Terrasse'),
('garden', 'Jardin'),
('swimming_pool', 'Piscine'),
('elevator', 'Ascenseur'),
('air_conditioning', 'Climatisation'),
('heating', 'Chauffage'),
('fireplace', 'Cheminée'),
('garage', 'Garage');
```

---

## 🔗 Table: `amenity_listing`

Table pivot pour les équipements des annonces.

```sql
CREATE TABLE amenity_listing (
    listing_id BIGINT UNSIGNED NOT NULL,
    amenity_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (listing_id, amenity_id),
    INDEX idx_listing_id (listing_id),
    INDEX idx_amenity_id (amenity_id),

    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
);
```

**Relation** : `listings` N:M `amenities`

---

## 📞 Table: `inquiries`

Demandes clients pour les annonces.

```sql
CREATE TABLE inquiries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT UNSIGNED NOT NULL,
    client_id BIGINT UNSIGNED NOT NULL,
    type ENUM('purchase', 'rent') NOT NULL,
    message TEXT NULL,
    status ENUM('new', 'contacted', 'in_review', 'approved', 'rejected', 'cancelled', 'converted') DEFAULT 'new',
    handled_by BIGINT UNSIGNED NULL,
    handled_at DATETIME NULL,
    closed_at DATETIME NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_listing_id (listing_id),
    INDEX idx_client_id (client_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_handled_by (handled_by),

    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### Statuts de demande
- **`new`** : Nouvelle
- **`contacted`** : Client contacté
- **`in_review`** : En cours d'examen
- **`approved`** : Approuvée
- **`rejected`** : Rejetée
- **`cancelled`** : Annulée
- **`converted`** : Convertie en transaction

**Relations** :
- `listings` 1:N `inquiries`
- `users` (client) 1:N `inquiries`
- `users` (handler) 1:N `inquiries`

---

## 🤝 Table: `deals`

Transactions immobilières.

```sql
CREATE TABLE deals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    inquiry_id BIGINT UNSIGNED UNIQUE NOT NULL,
    listing_id BIGINT UNSIGNED NOT NULL,
    client_id BIGINT UNSIGNED NOT NULL,
    admin_id BIGINT UNSIGNED NOT NULL,
    type ENUM('purchase', 'rent') NOT NULL,
    agreed_price DECIMAL(15,2) NULL,
    currency CHAR(3) DEFAULT 'XOF',
    deposit_amount DECIMAL(15,2) NULL,
    lease_months SMALLINT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    status ENUM('draft', 'pending_signature', 'signed', 'paid', 'cancelled', 'failed', 'completed') DEFAULT 'draft',
    contract_file VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_listing_id (listing_id),
    INDEX idx_client_id (client_id),
    INDEX idx_admin_id (admin_id),
    INDEX idx_type (type),
    INDEX idx_status (status),

    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Statuts de transaction
- **`draft`** : Brouillon
- **`pending_signature`** : En attente de signature
- **`signed`** : Signé
- **`paid`** : Payé
- **`cancelled`** : Annulé
- **`failed`** : Échoué
- **`completed`** : Terminé

**Relations** :
- `inquiries` 1:1 `deals`
- `listings` 1:N `deals`
- `users` (client) 1:N `deals`
- `users` (admin) 1:N `deals`

---

## 💰 Table: `deal_payments`

Paiements des transactions.

```sql
CREATE TABLE deal_payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    deal_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    type ENUM('deposit', 'rent', 'sale', 'fee', 'other') NOT NULL,
    paid_at DATETIME NOT NULL,
    method ENUM('bank_transfer', 'cash', 'card', 'other') NOT NULL,
    reference VARCHAR(120) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_deal_id (deal_id),

    FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
);
```

### Types de paiement
- **`deposit`** : Dépôt de garantie
- **`rent`** : Loyer
- **`sale`** : Vente
- **`fee`** : Commission
- **`other`** : Autre

### Méthodes de paiement
- **`bank_transfer`** : Virement bancaire
- **`cash`** : Espèces
- **`card`** : Carte bancaire
- **`other`** : Autre

**Relation** : `deals` 1:N `deal_payments`

---

## ⭐ Table: `favorites`

Favoris des utilisateurs.

```sql
CREATE TABLE favorites (
    user_id BIGINT UNSIGNED NOT NULL,
    listing_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NOT NULL,

    PRIMARY KEY (user_id, listing_id),
    INDEX idx_user_id (user_id),
    INDEX idx_listing_id (listing_id),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
);
```

**Relation** : `users` N:M `listings`

---

## 🚨 Table: `listing_reports`

Signalements d'annonces.

```sql
CREATE TABLE listing_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    listing_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NULL,
    reason VARCHAR(180) NOT NULL,
    message TEXT NULL,
    status ENUM('new', 'reviewed', 'dismissed', 'removed') DEFAULT 'new',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX idx_listing_id (listing_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),

    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Statuts de signalement
- **`new`** : Nouveau
- **`reviewed`** : Examiné
- **`dismissed`** : Rejeté
- **`removed`** : Annonce supprimée

**Relations** :
- `listings` 1:N `listing_reports`
- `users` 1:N `listing_reports`

---

## 📊 Table: `activity_logs`

Journal d'activité des utilisateurs.

```sql
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    causer_id BIGINT UNSIGNED NULL,
    action VARCHAR(120) NOT NULL,
    subject_type VARCHAR(120) NOT NULL,
    subject_id BIGINT NOT NULL,
    properties JSON NULL,
    created_at TIMESTAMP NOT NULL,

    INDEX idx_causer_id (causer_id),
    INDEX idx_subject_id (subject_id),

    FOREIGN KEY (causer_id) REFERENCES users(id) ON DELETE SET NULL
);
```

### Exemples d'actions
- `user_registered`
- `user_login`
- `user_logout`
- `listing_created`
- `listing_updated`
- `inquiry_created`
- `deal_signed`

**Relation** : `users` 1:N `activity_logs`

---

## 🔍 Index et performance

### Index composés stratégiques
```sql
-- Recherche d'annonces par type et statut
INDEX idx_type_status ON listings (type, status);

-- Recherche géographique
INDEX idx_country_city ON listings (country_code, city);
INDEX idx_lat_lng ON listings (latitude, longitude);

-- Utilisateurs par rôle et statut
INDEX idx_role_status ON users (role, status);
```

### Index FULLTEXT
```sql
-- Recherche textuelle dans les annonces
FULLTEXT idx_search ON listings (title, description, city);
```

### Utilisation
```sql
-- Recherche d'annonces avec FULLTEXT
SELECT * FROM listings
WHERE MATCH(title, description, city) AGAINST('appartement paris' IN NATURAL LANGUAGE MODE)
AND status = 'published';

-- Recherche géographique avec distance
SELECT *,
  (6371 * acos(cos(radians(48.8566)) * cos(radians(latitude)) * cos(radians(longitude) - radians(2.3522)) + sin(radians(48.8566)) * sin(radians(latitude)))) AS distance
FROM listings
WHERE status = 'published'
HAVING distance < 10
ORDER BY distance;
```

---

## 🔗 Diagramme des relations

```
users (1) -------- (1) user_profiles
  |
  | (1:N)
  |
listings (N) -------- (N) amenities
  |                   (via amenity_listing)
  | (1:N)
  |
inquiries (1) ------- (1) deals
  |                        |
  |                        | (1:N)
  |                        |
  +------------ favorites  deal_payments
  | (N:M)      (N:M)
  |
listing_reports      activity_logs
```

---

## 🛠️ Commandes utiles

### Générer les migrations
```bash
php artisan make:migration create_table_name --create=table_name
```

### Exécuter les migrations
```bash
php artisan migrate
php artisan migrate:rollback
php artisan migrate:fresh
```

### Vérifier le statut
```bash
php artisan migrate:status
```

### Exporter le schéma
```bash
mysqldump -u root -p --no-data estate_hub > schema.sql
```

---

## 📈 Optimisations recommandées

### Pour la production
1. **Partitioning** sur `activity_logs` par date
2. **Archivage** des anciens deals/inquiries
3. **Cache Redis** pour les requêtes fréquentes
4. **Read replicas** pour la lecture
5. **Monitoring** des performances

### Index additionnels selon usage
```sql
-- Si beaucoup de recherches par prix
CREATE INDEX idx_price ON listings (price);

-- Si filtrage fréquent par nombre de pièces
CREATE INDEX idx_rooms ON listings (rooms);

-- Si recherche par période de disponibilité
CREATE INDEX idx_available_from ON listings (available_from);
```

---

**🎯 Base solide pour une plateforme immobilière scalable !**
