'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { PageHeader } from '../../components/page-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  PlayCircle,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

import { Footer } from '../sections/footer';

export default function DemoPage() {
  const meetingsContainerRef = useRef(null);

  const scrollToMeetings = () => {
    const element = document.getElementById('meetings-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Initialize HubSpot meetings embed when script loads
    const initializeMeetings = () => {
      if (
        window.hbspt &&
        window.hbspt.meetings &&
        meetingsContainerRef.current
      ) {
        window.hbspt.meetings.create(meetingsContainerRef.current);
      }
    };

    // Check if script is already loaded
    if (window.hbspt) {
      initializeMeetings();
    } else {
      // Wait for script to load
      const checkScript = setInterval(() => {
        if (window.hbspt) {
          initializeMeetings();
          clearInterval(checkScript);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkScript), 10000);
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  const benefits = [
    {
      icon: PlayCircle,
      title: 'Live Code Execution',
      description:
        'See HubSpot custom code actions running in real-time with our local runtime engine',
    },
    {
      icon: Zap,
      title: 'Event Simulation',
      description:
        'Test your code with realistic HubSpot payloads and see immediate results',
    },
    {
      icon: Shield,
      title: 'Safe Testing Environment',
      description:
        'Develop and debug without affecting your production HubSpot instance',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Share actions and workflows with your team for better collaboration',
    },
  ];

  const whatYoullSee = [
    'Real-time code editor with syntax highlighting',
    'Live execution logs and error diagnostics',
    'HubSpot event payload simulation',
    'Action library and version control',
    'Multi-environment deployment workflow',
  ];

  return (
    <>
      <Script
        src='https://static.hsappstatic.net/MeetingsEmbed/ex/MeetingsEmbedCode.js'
        strategy='afterInteractive'
        onLoad={() => {
          // Re-initialize meetings when script loads
          if (
            window.hbspt &&
            window.hbspt.meetings &&
            meetingsContainerRef.current
          ) {
            window.hbspt.meetings.create(meetingsContainerRef.current);
          }
        }}
      />

      <div className='min-h-screen bg-background'>
        <PageHeader />

        <main className='relative'>
          {/* Hero Section */}
          <section className='py-20 px-6'>
            <div className='mx-auto max-w-4xl text-center'>
              <Badge className='mb-4'>
                <Calendar className='mr-2 h-4 w-4' />
                Book a Personalized Demo
              </Badge>
              <h1 className='text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-6'>
                See Novocode in Action
              </h1>
              <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
                Get a personalized walkthrough of how Novocode can transform
                your HubSpot custom code development. See our local runtime
                engine, testing tools, and deployment workflows live.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center mb-12'>
                <Button
                  size='lg'
                  className='text-lg px-8'
                  onClick={scrollToMeetings}
                >
                  <Calendar className='mr-2 h-5 w-5' />
                  Schedule Your Demo
                </Button>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className='py-16 px-6 bg-muted/30'>
            <div className='mx-auto max-w-6xl'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl font-bold text-foreground mb-4'>
                  What You&apos;ll Experience
                </h2>
                <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                  Discover how Novocode accelerates your HubSpot development
                  workflow
                </p>
              </div>

              <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                {benefits.map((benefit, index) => (
                  <Card key={index} className='text-center'>
                    <CardHeader>
                      <div className='mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4'>
                        <benefit.icon className='h-6 w-6 text-primary' />
                      </div>
                      <CardTitle className='text-lg'>{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{benefit.description}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Demo Features Section */}
          <section className='py-16 px-6'>
            <div className='mx-auto max-w-4xl'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl font-bold text-foreground mb-4'>
                  Live Demo Features
                </h2>
                <p className='text-lg text-muted-foreground'>
                  We&apos;ll walk you through these key capabilities
                </p>
              </div>

              <div className='grid md:grid-cols-2 gap-4 mb-12'>
                {whatYoullSee.map((feature, index) => (
                  <div key={index} className='flex items-start gap-3'>
                    <CheckCircle className='h-5 w-5 text-green-600 mt-0.5 shrink-0' />
                    <span className='text-foreground'>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA and Meetings Embed Section */}
          <section id='meetings-section' className='py-16 px-6 bg-muted/30'>
            <div className='mx-auto max-w-4xl'>
              <div className='text-center mb-8'>
                <h2 className='text-3xl font-bold text-foreground mb-4'>
                  Ready to Transform Your HubSpot Development?
                </h2>
                <p className='text-lg text-muted-foreground mb-8'>
                  Schedule a 30-minute personalized demo with our team
                </p>
              </div>

              {/* HubSpot Meetings Embed */}
              <div className='bg-white rounded-lg shadow-lg p-6'>
                <div
                  ref={meetingsContainerRef}
                  className='meetings-iframe-container'
                  data-src='https://novocy.com/meetings/morgan-west/novocode?embed=true'
                />
              </div>

              <div className='mt-8 text-center'>
                <p className='text-sm text-muted-foreground'>
                  Can&apos;t find a time that works?{' '}
                  <a
                    href='mailto:morgan@novocode.com'
                    className='text-primary hover:underline'
                  >
                    Email us
                  </a>{' '}
                  and we&apos;ll find a slot that fits your schedule.
                </p>
              </div>
            </div>
          </section>

          {/* Trust Section */}
          <section className='py-16 px-6'>
            <div className='mx-auto max-w-4xl text-center'>
              <h3 className='text-2xl font-bold text-foreground mb-8'>
                Trusted by HubSpot Developers
              </h3>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60'>
                {/* Placeholder for trust badges/logos */}
                <div className='h-12 bg-muted rounded flex items-center justify-center text-muted-foreground'>
                  HubSpot
                </div>
                <div className='h-12 bg-muted rounded flex items-center justify-center text-muted-foreground'>
                  Enterprise
                </div>
                <div className='h-12 bg-muted rounded flex items-center justify-center text-muted-foreground'>
                  Agency
                </div>
                <div className='h-12 bg-muted rounded flex items-center justify-center text-muted-foreground'>
                  Startup
                </div>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
