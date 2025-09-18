'use client';

import { useState, useEffect } from 'react';
import { listingsApi, ApiError, ListingResponse, PaginatedListingResponse } from '@/lib/api';

interface UseMyListingsParams {
  status?: string;
  type?: 'sale' | 'rent';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

interface UseMyListingsReturn {
  listings: ListingResponse[];
  pagination: PaginatedListingResponse['pagination'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  deleteListing: (id: number) => Promise<void>;
}

export function useMyListings(params?: UseMyListingsParams): UseMyListingsReturn {
  const [listings, setListings] = useState<ListingResponse[]>([]);
  const [pagination, setPagination] = useState<PaginatedListingResponse['pagination'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = async (page = 1, reset = true) => {
    try {
      setLoading(true);
      setError(null);

      const response = await listingsApi.getMyListings({
        ...params,
        page,
      });

      if (reset) {
        setListings(response.data);
      } else {
        setListings(prev => [...prev, ...response.data]);
      }

      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching listings:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors du chargement des propriétés');
      }
      if (reset) {
        setListings([]);
        setPagination(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchListings(1, true);
  };

  const loadMore = async () => {
    if (pagination && pagination.has_more_pages) {
      await fetchListings(pagination.current_page + 1, false);
    }
  };

  const deleteListing = async (id: number) => {
    try {
      await listingsApi.deleteListing(id);
      // Mettre à jour la liste locale
      setListings(prev => prev.filter(listing => listing.id !== id));

      // Si on a supprimé le dernier élément de la page, recharger
      if (listings.length === 1 && pagination && pagination.current_page > 1) {
        await refetch();
      }
    } catch (err) {
      console.error('Error deleting listing:', err);
      if (err instanceof ApiError) {
        throw new Error(err.message);
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    }
  };

  useEffect(() => {
    fetchListings();
  }, [params?.status, params?.type, params?.sort_by, params?.sort_order, params?.per_page]);

  return {
    listings,
    pagination,
    loading,
    error,
    refetch,
    loadMore,
    deleteListing,
  };
}

// Hook pour les statistiques des listings
interface ListingStats {
  totalListings: number;
  totalViews: number;
  totalMessages: number;
  totalFavorites: number;
  averageViews: number;
}

export function useListingStats(listings: ListingResponse[]): ListingStats {
  if (!listings || !Array.isArray(listings)) {
    return {
      totalListings: 0,
      totalViews: 0,
      totalMessages: 0,
      totalFavorites: 0,
      averageViews: 0,
    };
  }

  return {
    totalListings: listings.length,
    totalViews: listings.reduce((sum, listing) => sum + (listing.metadata?.views_count || 0), 0),
    totalMessages: 0, // Cette donnée n'est pas disponible dans l'API actuelle
    totalFavorites: 0, // Cette donnée n'est pas disponible dans l'API actuelle
    averageViews: listings.length > 0
      ? listings.reduce((sum, listing) => sum + (listing.metadata?.views_count || 0), 0) / listings.length
      : 0,
  };
}

// Hook pour une seule propriété
interface UseSingleListingReturn {
  listing: ListingResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSingleListing(id: number): UseSingleListingReturn {
  const [listing, setListing] = useState<ListingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingsApi.getListing(id);
      setListing(response);
    } catch (err) {
      console.error('Error fetching listing:', err);
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors du chargement de la propriété');
      }
      setListing(null);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchListing();
  };

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  return {
    listing,
    loading,
    error,
    refetch,
  };
}