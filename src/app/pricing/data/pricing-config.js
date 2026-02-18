export const pricingPlans = {
  monthly: [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Perfect for individual developers',
      price: 29,
      yearlyPrice: 278,
      features: [
        'Local Runtime Environment',
        'Code Execution & Validation',
        'Basic Debugging Tools',
        '1,000 Monthly Executions',
        '5 Projects',
        'Basic Analytics'
      ],
      notIncluded: [
        'Team Collaboration',
        'Shared Workspaces',
        'Real-time Collaboration',
        'Advanced Analytics & Reporting',
        'Priority Support',
        '24/7 Support',
        'Custom Integrations',
        'SLA Guarantee',
        'Advanced Security',
        'Custom Contracts'
      ],
      cta: 'Get Professional',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Built for teams and organizations',
      price: 99,
      yearlyPrice: 950,
      features: [
        'Local Runtime Environment',
        'Code Execution & Validation',
        'Basic Debugging Tools',
        'Unlimited Monthly Executions',
        'Unlimited Projects',
        'Team Collaboration',
        'Shared Workspaces',
        'Real-time Collaboration',
        'Basic Analytics',
        'Advanced Analytics & Reporting',
        'Priority Support',
        '24/7 Support',
        'Custom Integrations',
        '99.9% SLA Guarantee',
        'Advanced Security',
        'Custom Contracts Available'
      ],
      notIncluded: [],
      cta: 'Get Enterprise',
      popular: true
    }
  ],
  annual: [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Perfect for individual developers',
      price: 278,
      yearlyPrice: 278,
      monthlyPrice: 23,
      features: [
        'Local Runtime Environment',
        'Code Execution & Validation',
        'Basic Debugging Tools',
        '1,000 Monthly Executions',
        '5 Projects',
        'Basic Analytics'
      ],
      notIncluded: [
        'Team Collaboration',
        'Shared Workspaces',
        'Real-time Collaboration',
        'Advanced Analytics & Reporting',
        'Priority Support',
        '24/7 Support',
        'Custom Integrations',
        'SLA Guarantee',
        'Advanced Security',
        'Custom Contracts'
      ],
      cta: 'Get Professional',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Built for teams and organizations',
      price: 950,
      yearlyPrice: 950,
      monthlyPrice: 79,
      features: [
        'Local Runtime Environment',
        'Code Execution & Validation',
        'Basic Debugging Tools',
        'Unlimited Monthly Executions',
        'Unlimited Projects',
        'Team Collaboration',
        'Shared Workspaces',
        'Real-time Collaboration',
        'Basic Analytics',
        'Advanced Analytics & Reporting',
        'Priority Support',
        '24/7 Support',
        'Custom Integrations',
        '99.9% SLA Guarantee',
        'Advanced Security',
        'Custom Contracts Available'
      ],
      notIncluded: [],
      cta: 'Get Enterprise',
      popular: true
    }
  ]
}

export const trustBadges = [
  { name: 'SOC 2 Type II', icon: '🔒' },
  { name: 'GDPR Compliant', icon: '🛡️' },
  { name: 'ISO 27001', icon: '🏆' },
  { name: 'CCPA Compliant', icon: '⚖️' }
]

export const testimonials = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'CTO at TechCorp',
    company: 'TechCorp',
    content: 'HSEmulator has transformed our development workflow. The enterprise features are exactly what our team needed.',
    avatar: 'SC'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Lead Developer',
    company: 'StartupXYZ',
    content: 'The professional plan gives us everything we need at a great price point. Excellent debugging tools.',
    avatar: 'MR'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    role: 'Engineering Manager',
    company: 'Enterprise Inc',
    content: 'Best investment we made this year. The collaboration features and 24/7 support are game-changers.',
    avatar: 'EJ'
  }
]
