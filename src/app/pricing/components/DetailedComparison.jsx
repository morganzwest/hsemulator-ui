'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PurchaseButton } from './PurchaseButton';

const detailedFeatures = [
  {
    category: 'User & Portal Limits',
    items: [
      {
        name: 'Users',
        professional: 'Only 1',
        enterprise: 'Up to 5',
        description: 'Number of user accounts',
      },
      {
        name: 'Portals',
        professional: 'Only 1',
        enterprise: 'Up to 3',
        description: 'Number of active portals',
      },
    ],
  },
  {
    category: 'AI & Credits',
    items: [
      {
        name: 'AI credits - Access AI tools for building, reviewing, and troubleshooting actions',
        professional: '15 per month',
        enterprise: '75 per month',
        description: 'Monthly AI credit allowance',
      },
    ],
  },
  {
    category: 'Core Features',
    items: [
      {
        name: 'Manual Execution testing',
        professional: '✓',
        enterprise: '✓',
        description: 'Manual testing capabilities',
      },
      {
        name: 'Hosted emulator runtime',
        professional: '✓',
        enterprise: '✓',
        description: 'Cloud-based emulator environment',
      },
      {
        name: 'Infrastructure',
        professional: 'Shared',
        enterprise: 'Priority',
        description: 'Infrastructure tier level',
      },
      {
        name: 'Test execution logs',
        professional: '✓',
        enterprise: '✓',
        description: 'Detailed execution logs',
      },
      {
        name: 'Execution history and retention',
        professional: 'Limited',
        enterprise: 'FULL',
        description: 'Execution data retention period',
      },
    ],
  },
  {
    category: 'Templates & Security',
    items: [
      {
        name: 'Access to Code Templates',
        professional: '✓',
        enterprise: '✓',
        description: 'Pre-built code templates',
      },
      {
        name: 'Save your own templates',
        professional: '✓',
        enterprise: '✓',
        description: 'Custom template creation',
      },
      {
        name: 'Store Secrets securely',
        professional: '✓',
        enterprise: '✓',
        description: 'Secure secret management',
      },
    ],
  },
  {
    category: 'HubSpot Integration',
    items: [
      {
        name: 'CI/CD deployment directly to hubspot',
        professional: '✗',
        enterprise: '✓',
        description: 'Automated deployment to HubSpot',
      },
      {
        name: 'Import code from HubSpot',
        professional: '✓',
        enterprise: '✓',
        description: 'Code import functionality',
      },
    ],
  },
  {
    category: 'Advanced Features',
    items: [
      {
        name: 'Action executions',
        professional: 'Up to 1,000 per month',
        enterprise: 'Up to 10,000 per month',
        description: 'Monthly action execution limit',
      },
      {
        name: 'Version control',
        professional: '✗',
        enterprise: '✓',
        description: 'Version control system',
      },
      {
        name: 'SSO',
        professional: '✗',
        enterprise: '✓',
        description: 'Single sign-on authentication',
      },
    ],
  },
  {
    category: 'Monitoring & Analytics',
    items: [
      {
        name: 'Live log streaming from production',
        professional: '✗',
        enterprise: '✓',
        description: 'Real-time log streaming',
      },
      {
        name: 'Real-time execution telemetry',
        professional: '✗',
        enterprise: '✓',
        description: 'Live execution metrics',
      },
      {
        name: 'Automatic error alerting',
        professional: '✗',
        enterprise: '✓',
        description: 'Automated error notifications',
      },
      {
        name: 'Metrics dashboards & trends',
        professional: '✗',
        enterprise: '✓',
        description: 'Analytics dashboards',
      },
    ],
  },
  {
    category: 'Support & Training',
    items: [
      {
        name: 'Guided Onboarding',
        professional: '✓',
        enterprise: '✓',
        description: 'Onboarding assistance',
      },
      {
        name: 'Video Knowledge base',
        professional: '✓',
        enterprise: '✓',
        description: 'Video tutorials and documentation',
      },
    ],
  },
];

export function DetailedComparison() {
  const tableVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const rowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      variants={tableVariants}
      initial='hidden'
      animate='visible'
      className='overflow-hidden rounded-2xl border bg-card shadow-sm'
    >
      {/* Header */}
      <div className='grid grid-cols-4 border-b bg-muted/30 p-6 z-99 gap-8'>
        <div className='font-medium text-muted-foreground'>Features</div>
        <div className='text-center'>
          <div className='font-semibold'>Professional</div>
          <div className='text-2xl font-bold mt-2'>
            £50
            <span className='text-sm font-normal text-muted-foreground'>
              /month
            </span>
          </div>
          <div className='mt-7'>
            <PurchaseButton planId='professional' size='sm' />
          </div>
        </div>
        <div className='text-center relative'>
          <div className=''>
            {/* <Badge variant='default' className='text-xs font-semibold'>
              Most Popular
            </Badge> */}
          </div>
          <div className='font-semibold'>Enterprise</div>
          <div className='text-2xl font-bold mt-2'>
            £120
            <span className='text-sm font-normal text-muted-foreground'>
              /month
            </span>
          </div>
          <div className='mt-7'>
            <PurchaseButton planId='enterprise' size='sm' />
          </div>
        </div>
        <div className='text-center'>
          <div className='font-semibold'>Custom</div>
          <div className='text-lg font-medium mt-2 text-muted-foreground'>
            Contact Us
          </div>
          <div className='text-xs text-muted-foreground'>
            Tailored solutions
          </div>
          <div className='mt-4'>
            <Button size='sm' variant='outline' className='w-full' asChild>
              <Link href='/contact-sales'>
                Contact Sales
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      {detailedFeatures.map((category, categoryIndex) => (
        <motion.div key={categoryIndex} variants={rowVariants}>
          {/* Category Header */}
          <div className='grid grid-cols-4 border-b bg-muted/10 p-4 mt-2'>
            <div className='font-semibold text-sm uppercase tracking-wide text-muted-foreground'>
              {category.category}
            </div>
            <div className='col-span-3'></div>
          </div>

          {/* Category Items */}
          {category.items.map((feature, featureIndex) => (
            <motion.div
              key={featureIndex}
              variants={rowVariants}
              className='grid grid-cols-4 border-b hover:bg-muted/20 transition-colors'
            >
              <div className='p-4'>
                <div className='font-medium text-sm text-muted-foreground'>
                  {feature.name}
                </div>
                <div className='text-xs text-muted-foreground/70 mt-1'>
                  {feature.description}
                </div>
              </div>
              <div className='p-4 text-center border-l'>
                {feature.professional === '✓' ? (
                  <Check className='h-5 w-5 text-white mx-auto' />
                ) : feature.professional === '✗' ? (
                  <X className='h-5 w-5 text-muted-foreground/30 mx-auto' />
                ) : (
                  <span className='text-sm font-medium text-muted-foreground'>
                    {feature.professional}
                  </span>
                )}
              </div>
              <div className='p-4 text-center border-l'>
                {feature.enterprise === '✓' ? (
                  <Check className='h-5 w-5 text-white mx-auto' />
                ) : feature.enterprise === '✗' ? (
                  <X className='h-5 w-5 text-muted-foreground/30 mx-auto' />
                ) : (
                  <span className='text-sm font-medium text-muted-foreground'>
                    {feature.enterprise}
                  </span>
                )}
              </div>
              <div className='p-4 text-center border-l'>
                {feature.professional === '✓' || feature.enterprise === '✓' ? (
                  <Check className='h-5 w-5 text-white mx-auto' />
                ) : (
                  <span className='text-sm font-medium text-muted-foreground'>
                    Custom
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      ))}

      {/* Footer with CTAs */}
      <div className='grid grid-cols-4 border-t bg-muted/30 p-6 gap-4'>
        <div></div>
        <div className='text-center'>
          <PurchaseButton planId='professional' size='sm' />
        </div>
        <div className='text-center'>
          <PurchaseButton planId='enterprise' size='sm' />
        </div>
        <div className='text-center'>
          <Button size='sm' variant='outline' className='w-full' asChild>
            <Link href='/contact-sales'>
              Contact Sales
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
