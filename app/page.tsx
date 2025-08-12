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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">
              Annonces Immobilières
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Découvrez notre sélection de biens à vendre et à louer
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-xl shadow-lg">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Rechercher par ville, quartier, type de bien..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-0 focus-visible:ring-0 text-gray-900 h-12 bg-transparent"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 bg-blue-600 hover:bg-blue-700">
                  <Search className="h-5 w-5 mr-2" />
                  Rechercher
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {loading ? 'Recherche en cours...' : `${properties.length} bien${properties.length > 1 ? 's' : ''} trouvé${properties.length > 1 ? 's' : ''}`}
                </h2>
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="mt-2">
                    <SlidersHorizontal className="h-3 w-3 mr-1" />
                    {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>

            {/* Search Filters */}
            <div className="mb-8">
              <SearchFilters
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
            </div>

            {/* Property Stats */}
            {!loading && !error && properties.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{propertyStats.sale}</div>
                  <div className="text-sm text-gray-600">À vendre</div>
                  {propertyStats.avgSalePrice > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Moy. {(propertyStats.avgSalePrice / 1000).toFixed(0)}k€
                    </div>
                  )}
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{propertyStats.rent}</div>
                  <div className="text-sm text-gray-600">À louer</div>
                  {propertyStats.avgRentPrice > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Moy. {propertyStats.avgRentPrice}€/mois
                    </div>
                  )}
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{propertyStats.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Biens disponibles
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results with Tabs */}
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex items-center justify-between mb-6">
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
                <div className="text-center py-12">
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

      {/* Quick Stats Footer */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{propertyStats.total}</div>
              <div className="text-sm text-gray-600">Biens disponibles</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{propertyStats.sale}</div>
              <div className="text-sm text-gray-600">À vendre</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{propertyStats.rent}</div>
              <div className="text-sm text-gray-600">À louer</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">2,500+</div>
              <div className="text-sm text-gray-600">Clients satisfaits</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
