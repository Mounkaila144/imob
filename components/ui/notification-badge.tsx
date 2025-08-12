'use client';

import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count?: number;
  show?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function NotificationBadge({ 
  count = 0, 
  show = true, 
  className,
  children 
}: NotificationBadgeProps) {
  if (!show || count === 0) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-flex">
      {children}
      <div className={cn(
        "absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse",
        "shadow-lg border-2 border-white",
        className
      )}>
        {count > 99 ? '99+' : count}
      </div>
    </div>
  );
}
