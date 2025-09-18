# CLAUDE.md

This file provides Guidadance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Estate Hub API is a French real estate platform backend ("API Plateforme Immobilière Moderne") built with Laravel 10, PHP 8.1+, and MySQL 8. The API provides comprehensive real estate listing management with JWT authentication, role-based access control, and full CRUD operations for properties.

## Development Commands

```bash
# Development server
php artisan serve                    # Start development server on localhost:8000
php artisan serve --host=127.0.0.1 --port=8000  # Start with specific host/port

# Database operations
php artisan migrate                  # Run migrations
php artisan migrate:rollback        # Rollback last migration
php artisan migrate:fresh           # Drop all tables and re-run migrations
php artisan migrate:status          # Show migration status

# JWT Authentication
php artisan jwt:secret               # Generate JWT secret key

# Testing
php artisan test                     # Run PHPUnit tests
php artisan test --filter TestName  # Run specific test

# Cache management
php artisan cache:clear              # Clear application cache
php artisan config:clear            # Clear configuration cache
php artisan route:clear              # Clear route cache

# Development utilities
php artisan tinker                   # Interactive PHP shell
php artisan route:list               # List all routes
composer install                    # Install dependencies
composer dump-autoload              # Regenerate autoloader
```

## Architecture & Structure

### Tech Stack
- **Framework**: Laravel 10 with API-first architecture
- **Authentication**: JWT (tymon/jwt-auth) with custom middleware
- **Database**: MySQL 8 with Eloquent ORM
- **Validation**: Form Request classes with custom rules
- **API Resources**: Structured JSON responses via Eloquent API Resources

### Key Directory Structure
- `app/Http/Controllers/` - API controllers extending ApiController base class
  - `Auth/AuthController.php` - JWT authentication endpoints
  - `ListingController.php` - Real estate listings CRUD operations
- `app/Http/Middleware/` - Custom middleware for roles and user status
- `app/Http/Requests/` - Form request validation classes
- `app/Http/Resources/` - API resource transformers for consistent responses
- `app/Models/` - Eloquent models with relationships and scopes
- `database/migrations/` - Database schema migrations for real estate domain
- `routes/api.php` - API routes with middleware protection
- `docs/` - Comprehensive API documentation and curl examples

### Important Patterns

**API Response Structure**: All controllers extend `ApiController` which provides standardized response methods (`successResponse`, `errorResponse`, `paginatedResponse`). Responses follow a consistent format with `success`, `message`, and `data` fields.

**JWT Authentication**: Uses JWT tokens for stateless authentication with custom claims. The `AuthController` handles registration, login, token refresh, and profile management with role-based validation.

**Role-Based Access Control**: Three user roles implemented via middleware:
- `admin` - Full system access
- `lister` - Real estate agents who can manage listings
- `client` - End users who can browse and favorite listings

**Request Validation**: Dedicated Form Request classes (e.g., `CreateListingRequest`, `UpdateListingRequest`) handle validation and authorization logic separately from controllers.

**API Resources**: Eloquent API Resources provide data transformation layers (`ListingResource` for list views, `ListingDetailResource` for detailed views) with conditional field inclusion based on user permissions.

**Database Design**: Uses Laravel conventions with:
- `bigIncrements()` for primary keys
- `foreignId()->constrained()` for foreign key relationships
- `timestampsTz()` for timezone-aware timestamps
- Soft deletes on critical entities like listings
- Composite indexes for performance optimization

### Real Estate Domain Models

**Core Entities**:
- `User` - JWT-authenticated users with roles and extended profiles
- `Listing` - Property listings with full-text search, geographic search, and filtering
- `UserProfile` - Extended user information (company, avatar, etc.)
- `ListingPhoto` - Property images with cover photo designation
- `Amenity` - Property features (parking, elevator, etc.) with many-to-many relationship
- `Inquiry` - Client inquiries about properties
- `Deal` - Property transactions with payment tracking
- `ActivityLog` - System audit trail for all major actions

**Key Relationships**:
- Users have one profile and many listings (for listers)
- Listings belong to users and have many photos, amenities, inquiries
- Many-to-many relationship between listings and amenities
- Polymorphic activity logging across all major entities

### API Endpoint Structure

**Public Endpoints**:
- `GET /api/listings` - Browse published listings with advanced filtering
- `GET /api/listings/{id}` - View listing details

**Authentication Endpoints** (`/api/auth/`):
- Registration, login, logout, token refresh
- Profile management and password changes

**Protected Endpoints** (require JWT + appropriate role):
- `POST/PUT/DELETE /api/listings` - Listing management (lister/admin only)
- `GET /api/my-listings` - User's own listings (lister/admin only)

### Configuration Notes
- **JWT Configuration**: Custom TTL settings (24h tokens, 2-week refresh)
- **Database**: MySQL 8 with proper charset and collation for international content
- **Middleware Stack**: Custom role and active user middleware for granular access control
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **API Versioning**: All routes prefixed with `/api` for future versioning

### Advanced Features
- **Geographic Search**: Haversine formula implementation for radius-based property search
- **Full-Text Search**: MySQL full-text search on title, description, and location fields
- **Activity Logging**: Comprehensive audit trail for user actions and system events
- **Soft Deletes**: Non-destructive deletion for critical business data
- **Pagination**: Standardized pagination with metadata for all list endpoints
- **Filtering & Sorting**: Advanced filtering by price, location, property type, and amenities
