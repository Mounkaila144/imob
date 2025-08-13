'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilters } from '@/components/properties/SearchFilters';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { useProperties } from '@/hooks/useProperties';
import { SearchFilters as SearchFiltersType } from '@/types';
import { Search, Home, Grid, Map, SlidersHorizontal } from 'lucide-react';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>();
  const searchParams = useSearchParams();
  const { properties, loading, error } = useProperties(filters);
  const [showFilters, setShowFilters] = useState(false);

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: SearchFiltersType = {};
    
    searchParams.forEach((value, key) => {
      if (key === 'query' || key === 'type' || key === 'transactionType' || key === 'city') {
        initialFilters[key] = value;
      } else if (key === 'priceMin' || key === 'priceMax' || key === 'surfaceMin' || key === 'surfaceMax' || 
                 key === 'rooms' || key === 'bedrooms' || key === 'bathrooms') {
        initialFilters[key] = Number(value);
      } else if (key === 'features') {
        initialFilters[key] = value.split(',');
      }
    });
    
    setFilters(initialFilters);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, query: searchQuery }));
    }
  };

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'query' && value !== undefined && value !== null && value !== ''
    ).length;
  };

  // Calculate property statistics
  const propertyStats = useMemo(() => {
    const saleProperties = properties.filter(p => p.transactionType === 'sale');
    const rentProperties = properties.filter(p => p.transactionType === 'rent');
    
    return {
      total: properties.length,
      sale: saleProperties.length,
      rent: rentProperties.length,
      avgSalePrice: saleProperties.length > 0 
        ? Math.round(saleProperties.reduce((sum, p) => sum + p.price, 0) / saleProperties.length)
        : 0,
      avgRentPrice: rentProperties.length > 0
        ? Math.round(rentProperties.reduce((sum, p) => sum + p.price, 0) / rentProperties.length)
        : 0
    };
  }, [properties]);

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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 flex-1"
                  />
                  <Button type="submit" size="sm" className="h-10 px-4">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              
              <SearchFilters
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Recherche en cours...' : `${properties.length} bien${properties.length > 1 ? 's' : ''}`}
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

          {/* Results with Tabs */}
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-end mb-4">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="grid" className="flex items-center gap-2">
                  <Grid className="h-4 w-4" />
                  Grille
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Carte
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="flex gap-4">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-24"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-gray-500 mb-4">
                    <Home className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-lg font-semibold">Aucun bien trouvé</p>
                    <p className="text-sm">Essayez de modifier vos critères de recherche</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <div className="space-y-6">
                <PropertyMap
                  properties={properties}
                  height="600px"
                  center={[46.2276, 2.2137]}
                  zoom={6}
                  selectedProperty={selectedProperty}
                  onPropertySelect={setSelectedProperty}
                />
                
                {selectedProperty && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Bien sélectionné :</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {properties
                        .filter(p => p.id === selectedProperty)
                        .map(property => (
                          <div key={property.id} className="border rounded-lg p-4">
                            <h4 className="font-medium">{property.title}</h4>
                            <p className="text-sm text-gray-600">{property.address.city}</p>
                            <p className="font-semibold text-blue-600">
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                minimumFractionDigits: 0,
                              }).format(property.price)}
                            </p>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

    </div>
  );
}
