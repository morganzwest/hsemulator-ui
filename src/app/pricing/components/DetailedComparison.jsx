'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const detailedFeatures = [
  {
    category: 'Core Runtime',
    items: [
      {
        name: 'Local Runtime Environment',
        professional: '✓',
        enterprise: '✓',
        description: 'Full local development environment',
      },
      {
        name: 'Code Execution & Validation',
        professional: '✓',
        enterprise: '✓',
        description: 'Execute and validate code securely',
      },
      {
        name: 'Basic Debugging Tools',
        professional: '✓',
        enterprise: '✓',
        description: 'Essential debugging capabilities',
      },
      {
        name: 'Advanced Debugging Tools',
        professional: '✗',
        enterprise: '✓',
        description: 'Advanced debugging and profiling',
      },
    ],
  },
  {
    category: 'Usage Limits',
    items: [
      {
        name: 'Monthly Executions',
        professional: '1,000',
        enterprise: 'Unlimited',
        description: 'Code executions per month',
      },
      {
        name: 'Team Members',
        professional: '1',
        enterprise: 'Unlimited',
        description: 'Number of team members',
      },
      {
        name: 'Projects',
        professional: '5',
        enterprise: 'Unlimited',
        description: 'Active projects limit',
      },
      {
        name: 'Storage',
        professional: '1 GB',
        enterprise: '100 GB',
        description: 'Cloud storage for projects',
      },
      {
        name: 'API Calls',
        professional: '10,000',
        enterprise: 'Unlimited',
        description: 'Monthly API call limit',
      },
    ],
  },
  {
    category: 'Collaboration',
    items: [
      {
        name: 'Team Collaboration',
        professional: '✗',
        enterprise: '✓',
        description: 'Real-time team collaboration',
      },
      {
        name: 'Shared Workspaces',
        professional: '✗',
        enterprise: '✓',
        description: 'Shared team workspaces',
      },
      {
        name: 'Real-time Collaboration',
        professional: '✗',
        enterprise: '✓',
        description: 'Live collaboration features',
      },
      {
        name: 'Version Control Integration',
        professional: 'Basic',
        enterprise: 'Advanced',
        description: 'Git integration level',
      },
      {
        name: 'Team Permissions',
        professional: '✗',
        enterprise: '✓',
        description: 'Granular user permissions',
      },
    ],
  },
  {
    category: 'Analytics & Support',
    items: [
      {
        name: 'Basic Analytics',
        professional: '✓',
        enterprise: '✓',
        description: 'Usage analytics and insights',
      },
      {
        name: 'Advanced Analytics & Reporting',
        professional: 'Optional Add-on',
        enterprise: '✓',
        description: 'Advanced analytics dashboard',
      },
      {
        name: 'Custom Reports',
        professional: '✗',
        enterprise: '✓',
        description: 'Custom report generation',
      },
      {
        name: 'Priority Support',
        professional: '✗',
        enterprise: '✓',
        description: 'Priority customer support',
      },
      {
        name: '24/7 Support',
        professional: '✗',
        enterprise: '✓',
        description: 'Round-the-clock support',
      },
      {
        name: 'Phone Support',
        professional: '✗',
        enterprise: '✓',
        description: 'Direct phone support',
      },
      {
        name: 'Dedicated Account Manager',
        professional: '✗',
        enterprise: '✓',
        description: 'Personal account manager',
      },
    ],
  },
  {
    category: 'Enterprise Features',
    items: [
      {
        name: 'Custom Integrations',
        professional: '✗',
        enterprise: '✓',
        description: 'Custom API integrations',
      },
      {
        name: 'SLA Guarantee',
        professional: '✗',
        enterprise: '99.9%',
        description: 'Service level agreement',
      },
      {
        name: 'Advanced Security',
        professional: '✗',
        enterprise: '✓',
        description: 'Enterprise-grade security',
      },
      {
        name: 'Custom Contracts',
        professional: '✗',
        enterprise: 'Available',
        description: 'Custom contract terms',
      },
      {
        name: 'SSO/SAML',
        professional: '✗',
        enterprise: '✓',
        description: 'Single sign-on integration',
      },
      {
        name: 'Audit Logs',
        professional: '✗',
        enterprise: '✓',
        description: 'Comprehensive audit trails',
      },
      {
        name: 'Custom Branding',
        professional: '✗',
        enterprise: '✓',
        description: 'White-label options',
      },
    ],
  },
];

export function DetailedComparison({ isAnnual }) {
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
      <div className='grid grid-cols-4 border-b bg-muted/30 p-6'>
        <div className='font-medium text-muted-foreground'>Features</div>
        <div className='text-center'>
          <div className='font-semibold'>Professional</div>
          <div className='text-2xl font-bold mt-2'>
            £{isAnnual ? 23 : 29}
            <span className='text-sm font-normal text-muted-foreground'>
              /month
            </span>
          </div>
          {isAnnual && (
            <div className='text-xs text-muted-foreground'>Billed annually</div>
          )}
        </div>
        <div className='text-center relative'>
          <div className=''>
            {/* <Badge variant='default' className='text-xs font-semibold'>
              Most Popular
            </Badge> */}
          </div>
          <div className='font-semibold'>Enterprise</div>
          <div className='text-2xl font-bold mt-2'>
            £{isAnnual ? 150 : 120}
            <span className='text-sm font-normal text-muted-foreground'>
              /month
            </span>
          </div>
          {isAnnual && (
            <div className='text-xs text-muted-foreground'>Billed annually</div>
          )}
        </div>
        <div className='text-center'>
          <div className='font-semibold'>Custom</div>
          <div className='text-lg font-medium mt-2 text-muted-foreground'>
            Contact Us
          </div>
          <div className='text-xs text-muted-foreground'>
            Tailored solutions
          </div>
        </div>
      </div>

      {/* Features */}
      {detailedFeatures.map((category, categoryIndex) => (
        <motion.div key={categoryIndex} variants={rowVariants}>
          {/* Category Header */}
          <div className='grid grid-cols-4 border-b bg-muted/10 p-4'>
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
                <div className='font-medium text-sm'>{feature.name}</div>
                <div className='text-xs text-muted-foreground mt-1'>
                  {feature.description}
                </div>
              </div>
              <div className='p-4 text-center border-l'>
                {feature.professional === '✓' ? (
                  <Check className='h-5 w-5 text-green-500 mx-auto' />
                ) : feature.professional === '✗' ? (
                  <X className='h-5 w-5 text-muted-foreground/30 mx-auto' />
                ) : (
                  <span className='text-sm font-medium'>
                    {feature.professional}
                  </span>
                )}
              </div>
              <div className='p-4 text-center border-l'>
                {feature.enterprise === '✓' ? (
                  <Check className='h-5 w-5 text-green-500 mx-auto' />
                ) : feature.enterprise === '✗' ? (
                  <X className='h-5 w-5 text-muted-foreground/30 mx-auto' />
                ) : (
                  <span className='text-sm font-medium'>
                    {feature.enterprise}
                  </span>
                )}
              </div>
              <div className='p-4 text-center border-l'>
                <span className='text-sm font-medium text-primary'>✓</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ))}

      {/* Footer with CTAs */}
      <div className='grid grid-cols-4 border-t bg-muted/30 p-6 gap-4'>
        <div></div>
        <div className='text-center'>
          <Button size='sm' className='w-full' asChild>
            <Link href='/get-started?plan=professional'>
              Get Professional
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
        <div className='text-center'>
          <Button size='sm' className='w-full' asChild>
            <Link href='/get-started?plan=enterprise'>
              Get Enterprise
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
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
