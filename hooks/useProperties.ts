'use client';

import { useState, useEffect } from 'react';
import { Property, SearchFilters } from '@/types';

// Mock data
const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Apartment in City Center',
    description: 'Beautiful modern apartment with great city views and premium amenities.',
    price: 350000,
    type: 'apartment',
    transactionType: 'sale',
    surface: 85,
    rooms: 3,
    bathrooms: 2,
    bedrooms: 2,
    floor: 5,
    totalFloors: 10,
    yearBuilt: 2019,
    energyRating: 'A',
    address: {
      street: '123 Main Street',
      city: 'Paris',
      zipCode: '75001',
      country: 'France',
      coordinates: { lat: 48.8566, lng: 2.3522 }
    },
    features: ['Balcony', 'Parking', 'Elevator', 'Air Conditioning'],
    photos: [
      { id: '1', url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', alt: 'Living room', order: 1, isMain: true },
      { id: '2', url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg', alt: 'Kitchen', order: 2, isMain: false },
    ],
    documents: [],
    sellerId: '1',
    seller: {
      id: 1,
      email: 'seller@example.com',
      name: 'John Seller',
      role: 'lister',
      status: 'active',
      profile: { avatar_path: '', company: '', about: '' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    status: 'active',
    viewCount: 156,
    favoriteCount: 23,
    createdAt: new Date(2024, 0, 15).toISOString(),
    updatedAt: new Date(2024, 0, 20).toISOString(),
  },
  {
    id: '2',
    title: 'Charming House with Garden',
    description: 'Lovely family house with a beautiful garden and quiet neighborhood.',
    price: 2800,
    type: 'house',
    transactionType: 'rent',
    surface: 120,
    rooms: 4,
    bathrooms: 2,
    bedrooms: 3,
    yearBuilt: 2010,
    energyRating: 'B',
    address: {
      street: '456 Oak Avenue',
      city: 'Lyon',
      zipCode: '69001',
      country: 'France',
      coordinates: { lat: 45.7640, lng: 4.8357 }
    },
    features: ['Garden', 'Garage', 'Fireplace', 'Terrace'],
    photos: [
      { id: '3', url: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg', alt: 'House exterior', order: 1, isMain: true },
      { id: '4', url: 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg', alt: 'Living room', order: 2, isMain: false },
    ],
    documents: [],
    sellerId: '2',
    seller: { id: 2, email: 'seller2@example.com', name: 'Jane Seller', role: 'lister', status: 'active', profile: {}, created_at: '', updated_at: '' } as any,
    status: 'active',
    viewCount: 89,
    favoriteCount: 12,
    createdAt: new Date(2024, 0, 10).toISOString(),
    updatedAt: new Date(2024, 0, 18).toISOString(),
  }
];

export function useProperties(filters?: SearchFilters) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let filteredProperties = [...mockProperties];

        if (filters) {
          if (filters.query) {
            filteredProperties = filteredProperties.filter(p => 
              p.title.toLowerCase().includes(filters.query!.toLowerCase()) ||
              p.description.toLowerCase().includes(filters.query!.toLowerCase()) ||
              p.address.city.toLowerCase().includes(filters.query!.toLowerCase())
            );
          }

          if (filters.type) {
            filteredProperties = filteredProperties.filter(p => p.type === filters.type);
          }

          if (filters.transactionType) {
            filteredProperties = filteredProperties.filter(p => p.transactionType === filters.transactionType);
          }

          if (filters.priceMin) {
            filteredProperties = filteredProperties.filter(p => p.price >= filters.priceMin!);
          }

          if (filters.priceMax) {
            filteredProperties = filteredProperties.filter(p => p.price <= filters.priceMax!);
          }

          if (filters.surfaceMin) {
            filteredProperties = filteredProperties.filter(p => p.surface >= filters.surfaceMin!);
          }

          if (filters.surfaceMax) {
            filteredProperties = filteredProperties.filter(p => p.surface <= filters.surfaceMax!);
          }

          if (filters.rooms) {
            filteredProperties = filteredProperties.filter(p => p.rooms >= filters.rooms!);
          }

          if (filters.city) {
            filteredProperties = filteredProperties.filter(p => 
              p.address.city.toLowerCase().includes(filters.city!.toLowerCase())
            );
          }
        }

        setProperties(filteredProperties);
      } catch (err) {
        setError('Failed to fetch properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters]);

  return { properties, loading, error };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const found = mockProperties.find(p => p.id === id);
        if (!found) {
          throw new Error('Property not found');
        }
        
        setProperty(found);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch property');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  return { property, loading, error };
}