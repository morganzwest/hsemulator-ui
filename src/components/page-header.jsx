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
  Cloud,
  GitBranch,
  Activity,
  AlertTriangle,
  FolderTree,
  Users,
  Code,
  Crown,
  BookOpen,
  FileText,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';

export function PageHeader() {
  return (
    <header className='sticky top-0 z-50 border-b bg-background/80 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-6'>
        <div className='flex items-center py-2'>
          <video
            src='/wordmark.mp4'
            className='h-8 w-auto'
            autoPlay
            muted
            playsInline
            loop={false}
            onError={(e) => {
              console.error('Video failed to load:', e);
              // Could implement fallback image here
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        <div className='flex items-center gap-6'>
          <NavigationMenu>
            <NavigationMenuList className='gap-6'>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Features</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className='grid w-[450px] gap-2 p-3 md:w-[550px] md:grid-cols-2 lg:w-[700px]'>
                    <div className='row-span-3 group relative overflow-hidden rounded-lg bg-linear-to-br from-primary/10 via-primary/5 to-background border border-primary/20 hover:border-primary/40 transition-all duration-300'>
                      <div className='absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                      <NavigationMenuLink asChild>
                        <Link
                          href='/features'
                          className='flex h-full w-full select-none flex-col justify-end rounded-md p-3 no-underline outline-none focus:shadow-md relative z-10'
                        >
                          <div className='mb-2'>
                            <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2'>
                              <Sparkles className='h-5 w-5 text-primary' />
                            </div>
                          </div>
                          <div className='mb-1 text-lg font-semibold'>
                            Features
                          </div>
                          <p className='text-sm leading-tight text-muted-foreground'>
                            Powerful tools for HubSpot development
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/features/hosted-runtime'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-300 transition-colors duration-200'>
                            <Cloud className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Hosted Runtime
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Secure cloud execution environment
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/features/hubspot-cicd'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-300 transition-colors duration-200'>
                            <GitBranch className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            HubSpot CI/CD
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Automated deployment pipelines
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/features/telemetry'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-300 transition-colors duration-200'>
                            <Activity className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Realtime Telemetry
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Monitor performance in real-time
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/features/error-logging'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-300 transition-colors duration-200'>
                            <AlertTriangle className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Error Logging
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Comprehensive error tracking
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/features/version-control'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-300 transition-colors duration-200'>
                            <FolderTree className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Version Control
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Track and manage code versions
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Use Cases</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className='grid w-[450px] gap-2 p-3 md:w-[550px] md:grid-cols-2 lg:w-[700px]'>
                    <div className='row-span-3 group relative overflow-hidden rounded-lg bg-linear-to-br from-primary/10 via-primary/5 to-background border border-primary/20 hover:border-primary/40 transition-all duration-300'>
                      <div className='absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                      <NavigationMenuLink asChild>
                        <Link
                          href='/use-cases'
                          className='flex h-full w-full select-none flex-col justify-end rounded-md p-3 no-underline outline-none focus:shadow-md relative z-10'
                        >
                          <div className='mb-2'>
                            <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2'>
                              <Crown className='h-5 w-5 text-primary' />
                            </div>
                          </div>
                          <div className='mb-1 text-lg font-semibold'>
                            Use Cases
                          </div>
                          <p className='text-sm leading-tight text-muted-foreground'>
                            Solutions tailored for every role
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/use-cases/hubspot-admins'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-600 transition-colors duration-200'>
                            <Users className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            HubSpot Admins
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Streamline admin workflows
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/use-cases/developers'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-600 transition-colors duration-200'>
                            <Code className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Developers
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Build and deploy with confidence
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/use-cases/ctos'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-600 transition-colors duration-200'>
                            <Crown className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            CTOs
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Scale your HubSpot operations
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href='/pricing'
                    className='group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  >
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className='grid w-[450px] gap-2 p-3 md:w-[550px] md:grid-cols-2 lg:w-[700px]'>
                    <div className='row-span-3 group relative overflow-hidden rounded-lg bg-linear-to-br from-primary/10 via-primary/5 to-background border border-primary/20 hover:border-primary/40 transition-all duration-300'>
                      <div className='absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                      <NavigationMenuLink asChild>
                        <Link
                          href='/resources'
                          className='flex h-full w-full select-none flex-col justify-end rounded-md p-3 no-underline outline-none focus:shadow-md relative z-10'
                        >
                          <div className='mb-2'>
                            <div className='inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-2'>
                              <BookOpen className='h-5 w-5 text-primary' />
                            </div>
                          </div>
                          <div className='mb-1 text-lg font-semibold'>
                            Resources
                          </div>
                          <p className='text-sm leading-tight text-muted-foreground'>
                            Everything you need to succeed
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/resources/documentation'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-600 transition-colors duration-200'>
                            <FileText className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Documentation
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              API reference and technical docs
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/resources/roadmap'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-600 transition-colors duration-200'>
                            <Zap className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Roadmap
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              What's coming next
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href='/resources/support'
                        className='group block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-all duration-200 hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5 focus:bg-accent/50 focus:shadow-sm focus:-translate-y-0.5 border border-transparent hover:border-border/50'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-700 text-white group-hover:bg-gray-600 transition-colors duration-200'>
                            <Shield className='h-4 w-4' />
                          </div>
                          <div className='text-sm font-semibold leading-none'>
                            Support
                            <p className='line-clamp-2 text-xs mt-0.5 font-normal leading-snug text-muted-foreground'>
                              Get help when you need it
                            </p>
                          </div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Button size='sm' asChild>
            <Link href='/get-started'>Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
