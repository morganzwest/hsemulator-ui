'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function PurchaseButton({ planId, size = 'default' }) {
  const getButtonContent = () => {
    switch (planId) {
      case 'professional':
        return 'Get Professional';
      case 'enterprise':
        return 'Get Enterprise';
      default:
        return 'Get Started';
    }
  };

  const getButtonVariant = () => {
    return planId === 'enterprise' ? 'default' : 'secondary';
  };

  return (
    <Button
      size={size}
      className={`w-full transition-all duration-300 ${
        planId === 'enterprise'
          ? 'bg-primary hover:bg-primary/90'
          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      }`}
      asChild
    >
      <Link href={`/get-started?plan=${planId}`}>
        {getButtonContent()}
        <ArrowRight className='ml-2 h-4 w-4' />
      </Link>
    </Button>
  );
}
