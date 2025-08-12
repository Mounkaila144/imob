'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchFilters as SearchFiltersType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFiltersType) => void;
  initialFilters?: SearchFiltersType;
}

const propertyTypes = [
  { value: 'house', label: 'Maison' },
  { value: 'apartment', label: 'Appartement' },
  { value: 'office', label: 'Bureau' },
  { value: 'land', label: 'Terrain' },
];

const transactionTypes = [
  { value: 'sale', label: 'Vente' },
  { value: 'rent', label: 'Location' },
];

const features = [
  'Balcony', 'Parking', 'Garden', 'Terrace', 'Pool', 'Garage', 
  'Elevator', 'Air Conditioning', 'Fireplace', 'Basement'
];

export function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (newFilters: Partial<SearchFiltersType>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          params.set(key, value.join(','));
        } else {
          params.set(key, value.toString());
        }
      } else {
        params.delete(key);
      }
    });
    
    router.push(`/properties?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = { query: filters.query };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    router.push('/properties', { scroll: false });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'query' && value !== undefined && value !== null && value !== ''
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Recherche
          </CardTitle>
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
                {hasActiveFilters && (
                  <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                    {Object.values(filters).filter(v => v !== undefined && v !== null && v !== '').length - (filters.query ? 1 : 0)}
                  </span>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="query">Recherche générale</Label>
          <Input
            id="query"
            placeholder="Ville, titre, description..."
            value={filters.query || ''}
            onChange={(e) => updateFilters({ query: e.target.value })}
          />
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="space-y-4">
            {/* Transaction Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="transactionType">Type de transaction</Label>
                <Select 
                  value={filters.transactionType || ''} 
                  onValueChange={(value) => updateFilters({ transactionType: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    {transactionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Type de bien</Label>
                <Select 
                  value={filters.type || ''} 
                  onValueChange={(value) => updateFilters({ type: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous</SelectItem>
                    {propertyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label>Prix (€)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Prix min"
                  value={filters.priceMin || ''}
                  onChange={(e) => updateFilters({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Prix max"
                  value={filters.priceMax || ''}
                  onChange={(e) => updateFilters({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Surface Range */}
            <div className="space-y-2">
              <Label>Surface (m²)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Surface min"
                  value={filters.surfaceMin || ''}
                  onChange={(e) => updateFilters({ surfaceMin: e.target.value ? Number(e.target.value) : undefined })}
                />
                <Input
                  type="number"
                  placeholder="Surface max"
                  value={filters.surfaceMax || ''}
                  onChange={(e) => updateFilters({ surfaceMax: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* Rooms */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Pièces min.</Label>
                <Select 
                  value={filters.rooms?.toString() || ''} 
                  onValueChange={(value) => updateFilters({ rooms: value ? Number(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chambres min.</Label>
                <Select 
                  value={filters.bedrooms?.toString() || ''} 
                  onValueChange={(value) => updateFilters({ bedrooms: value ? Number(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>SdB min.</Label>
                <Select 
                  value={filters.bathrooms?.toString() || ''} 
                  onValueChange={(value) => updateFilters({ bathrooms: value ? Number(value) : undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes</SelectItem>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}+
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Ville de recherche"
                value={filters.city || ''}
                onChange={(e) => updateFilters({ city: e.target.value })}
              />
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Équipements</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={filters.features?.includes(feature) || false}
                      onCheckedChange={(checked) => {
                        const currentFeatures = filters.features || [];
                        const updatedFeatures = checked
                          ? [...currentFeatures, feature]
                          : currentFeatures.filter(f => f !== feature);
                        updateFilters({ features: updatedFeatures.length > 0 ? updatedFeatures : undefined });
                      }}
                    />
                    <Label htmlFor={feature} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={applyFilters} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}