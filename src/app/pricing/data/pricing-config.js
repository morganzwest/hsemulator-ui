export const pricingPlans = {
  monthly: [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Perfect for individual developers',
      price: 29,
      yearlyPrice: 278,
      features: [
        'Manual Execution testing',
        'Hosted emulator runtime',
        'Infrastructure (Shared)',
        'Test execution logs',
        'Execution history and retention (Limited)',
        'Users (Only 1)',
        'Portals (Only 1)',
        'Access to Code Templates',
        'Save your own templates',
        'Store Secrets securely',
        'Import code from HubSpot',
        'AI credits (15 per month)',
        'Action executions (Up to 1,000 per month)',
        'Guided Onboarding',
        'Video Knowledge base'
      ],
      notIncluded: [
        'CI/CD deployment directly to hubspot',
        'Live log streaming from production',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'Version control',
        'SSO'
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
        'Manual Execution testing',
        'Hosted emulator runtime',
        'Infrastructure (Priority)',
        'Test execution logs',
        'Execution history and retention (FULL)',
        'Users (Up to 5)',
        'Portals (Up to 3)',
        'Access to Code Templates',
        'Save your own templates',
        'Store Secrets securely',
        'CI/CD deployment directly to hubspot',
        'Import code from HubSpot',
        'Live log streaming from production',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'AI credits (75 per month)',
        'Version control',
        'Action executions (Up to 10,000 per month)',
        'Guided Onboarding',
        'Video Knowledge base',
        'SSO'
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
        'Manual Execution testing',
        'Hosted emulator runtime',
        'Infrastructure (Shared)',
        'Test execution logs',
        'Execution history and retention (Limited)',
        'Users (Only 1)',
        'Portals (Only 1)',
        'Access to Code Templates',
        'Save your own templates',
        'Store Secrets securely',
        'Import code from HubSpot',
        'AI credits (15 per month)',
        'Action executions (Up to 1,000 per month)',
        'Guided Onboarding',
        'Video Knowledge base'
      ],
      notIncluded: [
        'CI/CD deployment directly to hubspot',
        'Live log streaming from production',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'Version control',
        'SSO'
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
        'Manual Execution testing',
        'Hosted emulator runtime',
        'Infrastructure (Priority)',
        'Test execution logs',
        'Execution history and retention (FULL)',
        'Users (Up to 5)',
        'Portals (Up to 3)',
        'Access to Code Templates',
        'Save your own templates',
        'Store Secrets securely',
        'CI/CD deployment directly to hubspot',
        'Import code from HubSpot',
        'Live log streaming from production',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'AI credits (75 per month)',
        'Version control',
        'Action executions (Up to 10,000 per month)',
        'Guided Onboarding',
        'Video Knowledge base',
        'SSO'
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
