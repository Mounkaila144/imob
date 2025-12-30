'use client';

import { useState, useEffect, useRef } from 'react';
import { partnersApi, PartnerPublicResponse } from '@/lib/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PartnersCarousel() {
  const [partners, setPartners] = useState<PartnerPublicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await partnersApi.getPublicPartners();
        setPartners(data);
      } catch (error) {
        console.error('Error fetching partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (partners.length === 0 || isPaused) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const animate = () => {
      if (scrollContainer && !isPaused) {
        scrollPosition += scrollSpeed;

        // Reset to beginning when reaching the end
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }

        scrollContainer.scrollLeft = scrollPosition;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [partners, isPaused]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <section className="py-8 bg-white border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            Nos Partenaires
          </h2>
          <div className="flex justify-center items-center space-x-8">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 w-24 bg-gray-200 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-white border-t border-b border-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Nos Partenaires
        </h2>

        <div className="relative">
          {/* Left arrow */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-sm"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Carousel container */}
          <div
            ref={scrollRef}
            className="overflow-hidden mx-8"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="flex items-center space-x-12 py-2">
              {/* Duplicate partners for infinite scroll effect */}
              {[...partners, ...partners].map((partner, index) => (
                <a
                  key={`${partner.id}-${index}`}
                  href={partner.website_url || '#'}
                  target={partner.website_url ? '_blank' : undefined}
                  rel={partner.website_url ? 'noopener noreferrer' : undefined}
                  className="flex-shrink-0 transition-transform duration-300 hover:scale-110"
                  title={partner.name}
                >
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="h-12 w-auto max-w-[120px] object-contain transition-transform duration-300"
                    />
                  ) : (
                    <div className="h-12 w-24 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm">
                      {partner.name}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Right arrow */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-sm"
            onClick={scrollRight}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
