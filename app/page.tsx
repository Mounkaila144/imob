'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ListingCard } from '@/components/properties/ListingCard';
import { PartnersCarousel } from '@/components/partners/PartnersCarousel';
import { usePublicListings } from '@/hooks/useListings';
import { Search, Home, SlidersHorizontal, X, Filter } from 'lucide-react';

interface SearchFilters {
  search?: string;
  type?: 'sale' | 'rent';
  property_type?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  rooms?: number;
  bedrooms?: number;
}

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const searchParams = useSearchParams();
  const { listings, loading, error } = usePublicListings(filters);

  // S'assurer que listings est toujours un tableau
  const safeListings = listings || [];

  // Trier les annonces : annonces en vedette en premier
  const sortedListings = [...safeListings].sort((a, b) => {
    // Les annonces en vedette d'abord
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    return 0;
  });

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: SearchFilters = {};

    searchParams.forEach((value, key) => {
      if (key === 'search' || key === 'city' || key === 'property_type') {
        (initialFilters as any)[key] = value;
      } else if (key === 'type' && (value === 'sale' || value === 'rent')) {
        initialFilters.type = value;
      } else if (key === 'min_price' || key === 'max_price' || key === 'rooms' || key === 'bedrooms') {
        const numValue = Number(value);
        if (!isNaN(numValue)) {
          (initialFilters as any)[key] = numValue;
        }
      }
    });

    setFilters(initialFilters);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, search: searchQuery }));
    } else {
      // Si la recherche est vide, supprimer le filtre de recherche
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.search;
        return newFilters;
      });
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Si l'utilisateur efface complètement le champ, supprimer automatiquement le filtre
    if (!value.trim() && filters.search) {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.search;
        return newFilters;
      });
    }
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) =>
      key !== 'search' && value !== undefined && value !== null && value !== ''
    ).length;
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    if (value === '' || value === undefined || value === null || value === 'all') {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters[key];
        return newFilters;
      });
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const clearAllFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const getPropertyTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'apartment': 'Appartement',
      'house': 'Maison',
      'villa': 'Villa',
      'hotel': 'Hôtel',
      'land': 'Terrain',
      'office': 'Bureau',
      'shop': 'Commerce',
      'warehouse': 'Entrepôt',
      'other': 'Autre'
    };
    return labels[type] || type;
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Main Content */}
      <section className="py-6">
        <div className="container mx-auto px-4">
          {/* Search and Filters */}
          <div className="mb-6">
            {/* Search Bar */}
            <div className="flex items-center gap-3 mb-4">
              <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Rechercher par titre, ville..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="h-10 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-10 px-4">
                    <Search className="h-4 w-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              </form>
              <Button
                variant={showFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white text-primary">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Filtres de recherche</h3>
                      {getActiveFiltersCount() > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="text-sm"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Effacer tout
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Type d'annonce */}
                      <div className="space-y-2">
                        <Label htmlFor="filter-type">Type d'annonce</Label>
                        <Select
                          value={filters.type || 'all'}
                          onValueChange={(value) => handleFilterChange('type', value)}
                        >
                          <SelectTrigger id="filter-type">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="sale">Vente</SelectItem>
                            <SelectItem value="rent">Location</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Type de propriété */}
                      <div className="space-y-2">
                        <Label htmlFor="filter-property-type">Type de bien</Label>
                        <Select
                          value={filters.property_type || 'all'}
                          onValueChange={(value) => handleFilterChange('property_type', value)}
                        >
                          <SelectTrigger id="filter-property-type">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="apartment">Appartement</SelectItem>
                            <SelectItem value="house">Maison</SelectItem>
                            <SelectItem value="villa">Villa</SelectItem>
                            <SelectItem value="hotel">Hôtel</SelectItem>
                            <SelectItem value="land">Terrain</SelectItem>
                            <SelectItem value="office">Bureau</SelectItem>
                            <SelectItem value="shop">Commerce</SelectItem>
                            <SelectItem value="warehouse">Entrepôt</SelectItem>
                            <SelectItem value="other">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Ville */}
                      <div className="space-y-2">
                        <Label htmlFor="filter-city">Ville</Label>
                        <Input
                          id="filter-city"
                          type="text"
                          placeholder="Ex: Niamey"
                          value={filters.city || ''}
                          onChange={(e) => handleFilterChange('city', e.target.value || undefined)}
                        />
                      </div>

                      {/* Nombre de pièces */}
                      <div className="space-y-2">
                        <Label htmlFor="filter-rooms">Pièces minimum</Label>
                        <Select
                          value={filters.rooms?.toString() || 'all'}
                          onValueChange={(value) => handleFilterChange('rooms', value === 'all' ? undefined : parseInt(value))}
                        >
                          <SelectTrigger id="filter-rooms">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Nombre de chambres */}
                      <div className="space-y-2">
                        <Label htmlFor="filter-bedrooms">Chambres minimum</Label>
                        <Select
                          value={filters.bedrooms?.toString() || 'all'}
                          onValueChange={(value) => handleFilterChange('bedrooms', value === 'all' ? undefined : parseInt(value))}
                        >
                          <SelectTrigger id="filter-bedrooms">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="1">1+</SelectItem>
                            <SelectItem value="2">2+</SelectItem>
                            <SelectItem value="3">3+</SelectItem>
                            <SelectItem value="4">4+</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Prix minimum */}
                      <div className="space-y-2">
                        <Label htmlFor="filter-min-price">Prix minimum (CFA)</Label>
                        <Input
                          id="filter-min-price"
                          type="number"
                          placeholder="Ex: 50000"
                          value={filters.min_price || ''}
                          onChange={(e) => handleFilterChange('min_price', e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>

                      {/* Prix maximum */}
                      <div className="space-y-2">
                        <Label htmlFor="filter-max-price">Prix maximum (CFA)</Label>
                        <Input
                          id="filter-max-price"
                          type="number"
                          placeholder="Ex: 500000"
                          value={filters.max_price || ''}
                          onChange={(e) => handleFilterChange('max_price', e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Filters Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Recherche en cours...' : `${safeListings.length} bien${safeListings.length > 1 ? 's' : ''}`}
                </h1>

                {/* Active filter badges */}
                {filters.type && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.type === 'sale' ? 'Vente' : 'Location'}
                    <button
                      onClick={() => handleFilterChange('type', undefined)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.property_type && (
                  <Badge variant="secondary" className="text-xs">
                    {getPropertyTypeLabel(filters.property_type)}
                    <button
                      onClick={() => handleFilterChange('property_type', undefined)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.city && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.city}
                    <button
                      onClick={() => handleFilterChange('city', undefined)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.rooms && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.rooms}+ pièces
                    <button
                      onClick={() => handleFilterChange('rooms', undefined)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.bedrooms && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.bedrooms}+ chambres
                    <button
                      onClick={() => handleFilterChange('bedrooms', undefined)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {(filters.min_price || filters.max_price) && (
                  <Badge variant="secondary" className="text-xs">
                    {filters.min_price && `${filters.min_price.toLocaleString()} CFA`}
                    {filters.min_price && filters.max_price && ' - '}
                    {filters.max_price && `${filters.max_price.toLocaleString()} CFA`}
                    <button
                      onClick={() => {
                        handleFilterChange('min_price', undefined);
                        handleFilterChange('max_price', undefined);
                      }}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="w-full">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <div className="h-32 bg-gray-200"></div>
                    <CardContent className="p-3 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-2 bg-gray-200 rounded w-12"></div>
                        <div className="h-2 bg-gray-200 rounded w-12"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : safeListings.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-gray-500 mb-4">
                  <Home className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-lg font-semibold">Aucun bien trouvé</p>
                  <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sortedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Partners Carousel */}
      <PartnersCarousel />

    </div>
  );
}
