'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFilters } from '@/components/properties/SearchFilters';
import { PropertyGrid } from '@/components/properties/PropertyGrid';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { useProperties } from '@/hooks/useProperties';
import { SearchFilters as SearchFiltersType } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Grid, Map, SlidersHorizontal } from 'lucide-react';

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const [selectedProperty, setSelectedProperty] = useState<string | undefined>();
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

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'query' && value !== undefined && value !== null && value !== ''
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Annonces immobilières</h1>
            <p className="text-gray-600 mt-2">
              {loading ? 'Recherche en cours...' : `${properties.length} bien${properties.length > 1 ? 's' : ''} trouvé${properties.length > 1 ? 's' : ''}`}
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  <SlidersHorizontal className="h-3 w-3 mr-1" />
                  {getActiveFiltersCount()} filtre{getActiveFiltersCount() > 1 ? 's' : ''}
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* Search Filters */}
        <div className="mb-8">
          <SearchFilters
            onFiltersChange={handleFiltersChange}
            initialFilters={filters}
          />
        </div>

        {/* Results */}
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
            <PropertyGrid properties={properties} loading={loading} />
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
    </div>
  );
}