export const pricingPlans = {
  monthly: [
    {
      id: 'professional',
      name: 'Professional',
      description: 'For serious individual developers building and validating HubSpot actions',
      price: 75,
      yearlyPrice: 278,
      features: [
        'Hosted emulator runtime',
        'Manual execution testing',
        'Import code from HubSpot',
        'Secure secrets management',
        'Execution logs',
        'Execution history & retention',
        'Included action executions',
        'Included AI credits',
        'Access to code templates',
        'Guided onboarding'
      ],
      notIncluded: [
        'CI/CD deployment to HubSpot',
        'Live production log streaming',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'Version control',
        'SSO'
      ],
      cta: 'Start Professional',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For teams shipping production-grade workflow automation at scale',
      price: 150,
      yearlyPrice: 950,
      features: [
        'CI/CD deployment to HubSpot',
        'Live production log streaming',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'Hosted emulator runtime',
        'Manual execution testing',
        'Import code from HubSpot',
        'Secure secrets management',
        'Version control',
        'Priority infrastructure',
        'Included AI credits',
        'Multi-user access',
        'Multiple portals',
        'SSO',
        'Guided onboarding'
      ],
      notIncluded: [],
      cta: 'Upgrade to Enterprise',
      popular: true
    }
  ],

  annual: [
    {
      id: 'professional',
      name: 'Professional',
      description: 'For individual developers who want lower cost and predictable usage',
      price: 278,
      yearlyPrice: 278,
      monthlyPrice: 23,
      features: [
        'Hosted emulator runtime',
        'Manual execution testing',
        'Import code from HubSpot',
        'Secure secrets management',
        'Execution logs',
        'Execution history & retention',
        'Included action executions',
        'Included AI credits',
        'Access to code templates',
        'Guided onboarding'
      ],
      notIncluded: [
        'CI/CD deployment to HubSpot',
        'Live production log streaming',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'Version control',
        'SSO'
      ],
      cta: 'Start Professional',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For teams standardising development, testing, and deployment workflows',
      price: 950,
      yearlyPrice: 950,
      monthlyPrice: 79,
      features: [
        'CI/CD deployment to HubSpot',
        'Live production log streaming',
        'Real-time execution telemetry',
        'Automatic error alerting',
        'Metrics dashboards & trends',
        'Hosted emulator runtime',
        'Manual execution testing',
        'Import code from HubSpot',
        'Secure secrets management',
        'Version control',
        'Priority infrastructure',
        'Expanded action executions',
        'Included AI credits',
        'Multi-user access',
        'Multiple portals',
        'SSO',
        'Guided onboarding'
      ],
      notIncluded: [],
      cta: 'Upgrade to Enterprise',
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
    role: 'CTO',
    company: 'TechCorp',
    content: 'HSEmulator became critical to our release process. CI/CD and telemetry alone justified the upgrade.',
    avatar: 'SC'
  },
  {
    id: 2,
    name: 'Michael Rodriguez',
    role: 'Lead Developer',
    company: 'StartupXYZ',
    content: 'Professional removed huge friction from testing custom code actions. Fast, predictable, reliable.',
    avatar: 'MR'
  },
  {
    id: 3,
    name: 'Emily Johnson',
    role: 'Engineering Manager',
    company: 'Enterprise Inc',
    content: 'Logs, alerts, deployment — everything we needed to operate HubSpot automation like real software.',
    avatar: 'EJ'
  }
]
