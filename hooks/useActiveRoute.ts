'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export function useActiveRoute() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActiveLink = useMemo(() => {
    return (href: string) => {
      const [basePath, queryString] = href.split('?');
      
      // Check if we're on the same base path
      if (pathname !== basePath) {
        return false;
      }
      
      // If no query string in href, just check path
      if (!queryString) {
        return pathname === basePath;
      }
      
      // Parse query parameters
      const hrefParams = new URLSearchParams(queryString);
      
      // Check if all href params match current URL params
      for (const [key, value] of hrefParams.entries()) {
        if (searchParams.get(key) !== value) {
          return false;
        }
      }
      
      return true;
    };
  }, [pathname, searchParams]);

  const isActiveSection = useMemo(() => {
    return (basePath: string) => {
      return pathname.startsWith(basePath);
    };
  }, [pathname]);

  const getCurrentParams = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    pathname,
    searchParams,
    isActiveLink,
    isActiveSection,
    getCurrentParams
  };
}
