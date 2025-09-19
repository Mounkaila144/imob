'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListingCard } from '@/components/properties/ListingCard';
import { usePublicListings } from '@/hooks/useListings';
import { Search, Home, SlidersHorizontal } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const { listings, loading, error } = usePublicListings(filters);

  // S'assurer que listings est toujours un tableau
  const safeListings = listings || [];

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
          {/* Compact Search Bar */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="h-10 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-10 px-4">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Recherche en cours...' : `${safeListings.length} bien${safeListings.length > 1 ? 's' : ''}`}
                </h1>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    <SlidersHorizontal className="h-3 w-3 mr-1" />
                    {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''}
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
                {safeListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
