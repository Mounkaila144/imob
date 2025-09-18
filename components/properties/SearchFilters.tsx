'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SearchFilters as SearchFiltersType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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

export function SearchFilters({ onFiltersChange, initialFilters = {} }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Debug logs
  console.log('SearchFilters render - isOpen:', isOpen);
  console.log('SearchFilters render - filters:', filters);

  const updateFilters = (newFilters: Partial<SearchFiltersType>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
  };

  const applyFilters = () => {
    onFiltersChange(filters);
    setIsOpen(false);
    
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
    
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFiltersType = {};
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setIsOpen(false);
    router.push('/', { scroll: false });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'query' && value !== undefined && value !== null && value !== ''
  );

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      console.log('Popover onOpenChange called with:', open);
      setIsOpen(open);
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-10 px-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres
          {hasActiveFilters && (
            <span className="ml-2 bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
              {Object.values(filters).filter(v => v !== undefined && v !== null && v !== '').length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-4 z-[9999]" align="end">
        <div className="space-y-4">
          {/* Transaction Type & Property Type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="transactionType" className="text-sm font-medium">Transaction</Label>
              <Select 
                value={filters.transactionType || ''} 
                onValueChange={(value) => updateFilters({ transactionType: value || undefined })}
              >
                <SelectTrigger className="h-9">
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

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">Type</Label>
              <Select 
                value={filters.type || ''} 
                onValueChange={(value) => updateFilters({ type: value || undefined })}
              >
                <SelectTrigger className="h-9">
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
            <Label className="text-sm font-medium">Prix (CFA)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin || ''}
                onChange={(e) => updateFilters({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
                className="h-9 text-sm"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax || ''}
                onChange={(e) => updateFilters({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Surface Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Surface (m²)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.surfaceMin || ''}
                onChange={(e) => updateFilters({ surfaceMin: e.target.value ? Number(e.target.value) : undefined })}
                className="h-9 text-sm"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.surfaceMax || ''}
                onChange={(e) => updateFilters({ surfaceMax: e.target.value ? Number(e.target.value) : undefined })}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label className="text-xs">Pièces</Label>
              <Select 
                value={filters.rooms?.toString() || ''} 
                onValueChange={(value) => updateFilters({ rooms: value ? Number(value) : undefined })}
              >
                <SelectTrigger className="h-9">
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
              <Label className="text-xs">Chambres</Label>
              <Select 
                value={filters.bedrooms?.toString() || ''} 
                onValueChange={(value) => updateFilters({ bedrooms: value ? Number(value) : undefined })}
              >
                <SelectTrigger className="h-9">
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
              <Label className="text-xs">SdB</Label>
              <Select 
                value={filters.bathrooms?.toString() || ''} 
                onValueChange={(value) => updateFilters({ bathrooms: value ? Number(value) : undefined })}
              >
                <SelectTrigger className="h-9">
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
            <Label htmlFor="city" className="text-sm font-medium">Ville</Label>
            <Input
              id="city"
              placeholder="Rechercher une ville"
              value={filters.city || ''}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="h-9"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyFilters} size="sm" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Appliquer
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}