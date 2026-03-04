'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Code,
  PlayCircle,
  Library,
  Globe,
  Download,
  Upload,
  History,
  Shield,
  Terminal,
  AlertTriangle,
  Clock,
  Eye,
  Zap,
  Users,
  Settings,
  BarChart,
  Calculator,
  Database,
  BookOpen,
  FileText,
  TrendingUp,
  Building,
  UserCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export function PageHeader() {
  return (
    <header className='sticky top-0 z-50 border-b bg-background/80 backdrop-blur transition-all duration-300'>
      <div className='mx-auto flex h-18 max-w-7xl items-center justify-between px-6'>
        <div className='flex items-center py-2'>
          <Link
            href='/'
            className='text-2xl font-bold text-foreground hover:text-primary transition-colors'
          >
            Novocode
          </Link>
        </div>

        <NavigationMenu className='flex-1 justify-center'>
          <NavigationMenuList className='gap-8'>
            {/* Features Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className='text-sm font-medium'>
                Features
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className='space-y-6 p-6 w-[600px]'>
                  {/* Development Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      Development
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/code-editor'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors'>
                            <Code className='h-5 w-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Code Editor
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Write custom code
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/event-simulation'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors'>
                            <PlayCircle className='h-5 w-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Event Simulation
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Test with payloads
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/action-library'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors'>
                            <Library className='h-5 w-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Action Library
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Store reusable code
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>

                  {/* CI/CD Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      CI/CD
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/import-actions'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors'>
                            <Download className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Import Actions
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Pull from HubSpot
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/deploy-to-hubspot'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors'>
                            <Upload className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Deploy to HubSpot
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Push updates
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/version-history'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors'>
                            <History className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Version History
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Track changes
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>

                  {/* Monitoring Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      Monitoring
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/execution-logs'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors'>
                            <Terminal className='h-5 w-5 text-orange-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Execution Logs
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              View runtime output
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/failure-diagnostics'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors'>
                            <AlertTriangle className='h-5 w-5 text-orange-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Failure Diagnostics
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Find root causes
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features/monitoring'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors'>
                            <Eye className='h-5 w-5 text-orange-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Monitoring
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Observe behaviour
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Use Cases Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className='text-sm font-medium'>
                Use Cases
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className='space-y-6 p-6 w-[600px]'>
                  {/* Developers Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      Developers
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/custom-logic'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors'>
                            <Code className='h-5 w-5 text-purple-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Custom Logic
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Build automation
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/workflow-extensions'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors'>
                            <Zap className='h-5 w-5 text-purple-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Workflow Extensions
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Advanced workflows
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/external-integrations'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors'>
                            <Globe className='h-5 w-5 text-purple-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              External Integrations
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Connect systems
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>

                  {/* CRM Teams Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      CRM Teams
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/automation-governance'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors'>
                            <Shield className='h-5 w-5 text-orange-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Automation Governance
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Track custom code
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/change-visibility'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors'>
                            <Eye className='h-5 w-5 text-orange-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Change Visibility
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Track changes
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/production-monitoring'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors'>
                            <BarChart className='h-5 w-5 text-orange-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Production Monitoring
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Find failures
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>

                  {/* Operations Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      Operations
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/process-automation'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors'>
                            <Settings className='h-5 w-5 text-teal-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Process Automation
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Extend workflows
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/pricing-logic'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors'>
                            <Calculator className='h-5 w-5 text-teal-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Pricing Logic
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Complex calculations
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases/data-transformations'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/10 group-hover:bg-teal-500/20 transition-colors'>
                            <Database className='h-5 w-5 text-teal-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Data Transformations
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Advanced data
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Pricing Dropdown */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className='text-sm font-medium'>
                Pricing
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className='grid w-[600px] gap-6 p-8'>
                  {/* Professional Plan */}
                  <div className='space-y-6'>
                    <div>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='text-lg font-semibold text-foreground'>
                          Professional
                        </h3>
                        <span className='rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary border border-primary/20'>
                          Popular
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        For small teams getting started
                      </p>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          1 HubSpot portal
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          Testing environments
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          1,000 action runs / month
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          Up to 3 users
                        </span>
                      </div>
                    </div>
                    <Button
                      asChild
                      variant='outline'
                      className='w-full border-primary/30 hover:bg-primary/10'
                    >
                      <Link
                        href='/pricing#professional'
                        className='flex items-center justify-center gap-2'
                      >
                        View Pricing <ArrowRight className='h-4 w-4' />
                      </Link>
                    </Button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className='space-y-6'>
                    <div>
                      <div className='flex items-center gap-2 mb-2'>
                        <h3 className='text-lg font-semibold text-foreground'>
                          Enterprise
                        </h3>
                        <span className='rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary border border-primary/20'>
                          Advanced
                        </span>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        For larger teams and complex automation
                      </p>
                    </div>
                    <div className='space-y-3'>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          Multi-portal support
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          Production monitoring
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          Version control
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>
                          Higher execution limits
                        </span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <ChevronRight className='h-4 w-4 text-primary' />
                        <span className='text-sm text-foreground'>SSO</span>
                      </div>
                    </div>
                    <Button asChild className='w-full'>
                      <Link
                        href='/pricing#enterprise'
                        className='flex items-center justify-center gap-2'
                      >
                        View Pricing <ArrowRight className='h-4 w-4' />
                      </Link>
                    </Button>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Resources Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className='text-sm font-medium'>
                Resources
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className='space-y-6 p-6 w-[600px]'>
                  {/* Learning Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      Learning
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/documentation'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors'>
                            <BookOpen className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Documentation
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Build custom code
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/getting-started'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors'>
                            <PlayCircle className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Getting Started
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Setup tutorials
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/best-practices'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors'>
                            <Shield className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Best Practices
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Architecture guidance
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>

                  {/* Product Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      Product
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/platform-overview'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors'>
                            <Sparkles className='h-5 w-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Platform Overview
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              How it works
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/feature-updates'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors'>
                            <TrendingUp className='h-5 w-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Feature Updates
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Roadmap & releases
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/security'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors'>
                            <Shield className='h-5 w-5 text-blue-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Security
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Architecture & hosting
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>

                  {/* Company Row */}
                  <div>
                    <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide mb-3'>
                      Company
                    </h3>
                    <div className='grid grid-cols-3 gap-4'>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/about'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors'>
                            <Building className='h-5 w-5 text-purple-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              About Novocode
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Product vision
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/pilot-programme'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors'>
                            <UserCheck className='h-5 w-5 text-purple-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Pilot Programme
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Early access
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources/contact'
                          className='group flex flex-col items-center gap-2 rounded-lg p-4 transition-all hover:bg-accent/50 text-center'
                        >
                          <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors'>
                            <MessageSquare className='h-5 w-5 text-purple-600' />
                          </div>
                          <div>
                            <div className='text-xs font-medium text-foreground'>
                              Contact
                            </div>
                            <div className='text-xs text-muted-foreground mt-1'>
                              Speak with team
                            </div>
                          </div>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className='flex items-center gap-4'>
          <Button variant='ghost' asChild className='text-sm'>
            <Link href='/login'>Login</Link>
          </Button>
          <Button asChild className='bg-primary hover:bg-primary/90'>
            <Link href='/get-started'>Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
