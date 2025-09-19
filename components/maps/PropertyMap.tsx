'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Property } from '@/types';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface PropertyMapProps {
  properties: Property[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  selectedProperty?: string;
  onPropertySelect?: (propertyId: string) => void;
}

export function PropertyMap({ 
  properties, 
  center = [48.8566, 2.3522], 
  zoom = 10,
  height = '400px',
  selectedProperty,
  onPropertySelect
}: PropertyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    // Load Leaflet JS
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        // Fix for default markers
        delete (window.L.Icon.Default.prototype as any)._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        setLeafletLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  if (!isClient || !leafletLoaded) {
    return (
      <Card className="p-4" style={{ height }}>
        <Loading />
      </Card>
    );
  }

  const formatPrice = (price: number, transactionType: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price) + (transactionType === 'rent' ? '/mois' : '');
  };

  return (
    <Card className="overflow-hidden" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {properties.map((property) => (
          <Marker
            key={property.id}
            position={[property.address.coordinates.lat, property.address.coordinates.lng]}
            eventHandlers={{
              click: () => onPropertySelect?.(property.id),
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                {property.photos[0] && (
                  <img
                    src={property.photos[0].url}
                    alt={property.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  {property.address.city}, {property.address.zipCode}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-600">
                    {formatPrice(property.price, property.transactionType)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {property.surface} m²
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Card>
  );
}