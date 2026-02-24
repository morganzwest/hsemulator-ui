'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function EnhancedCompleteStep({ user, profile, onNext }) {
  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'User';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='space-y-6 max-w-2xl mx-auto'
    >
      {/* Success Message */}
      <div className='text-center space-y-4'>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center'
        >
          <CheckCircle className='w-10 h-10 text-green-600' />
        </motion.div>
        <div>
          <h3 className='text-3xl font-bold mb-2'>
            You&apos;re all set, {userName}!
          </h3>
          <p className='text-muted-foreground text-lg'>
            Your workspace is ready and configured
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <Card>
        <CardContent className='p-6'>
          <h4 className='font-semibold mb-4 text-center'>
            What's been configured:
          </h4>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-600' />
                </div>
                <span className='text-sm'>Personal profile</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-600' />
                </div>
                <span className='text-sm'>Account details</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-600' />
                </div>
                <span className='text-sm'>Portal connection</span>
              </div>
            </div>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-600' />
                </div>
                <span className='text-sm'>Preferences set</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-600' />
                </div>
                <span className='text-sm'>Priority features</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                  <CheckCircle className='w-4 h-4 text-green-600' />
                </div>
                <span className='text-sm'>Notifications configured</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardContent className='p-6'>
          <h4 className='font-semibold mb-3'>Ready to start building</h4>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5'>
                <span className='text-xs font-bold text-primary'>1</span>
              </div>
              <div>
                <h5 className='font-medium'>Create your first action</h5>
                <p className='text-sm text-muted-foreground'>
                  Start building HubSpot custom code actions
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5'>
                <span className='text-xs font-bold text-primary'>2</span>
              </div>
              <div>
                <h5 className='font-medium'>Test and validate</h5>
                <p className='text-sm text-muted-foreground'>
                  Run in the deterministic testing environment
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5'>
                <span className='text-xs font-bold text-primary'>3</span>
              </div>
              <div>
                <h5 className='font-medium'>Deploy and monitor</h5>
                <p className='text-sm text-muted-foreground'>
                  Deploy and track performance metrics
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <div className='text-center space-y-4'>
        <div className='flex items-center justify-center gap-2'>
          <Rocket className='w-5 h-5 text-primary' />
          <Sparkles className='w-5 h-5 text-primary' />
        </div>
        <Button onClick={onNext} size='lg' className='px-8'>
          Go to Dashboard
          <ArrowRight className='w-5 h-5 ml-2' />
        </Button>
        <p className='text-sm text-muted-foreground'>
          Start building amazing HubSpot custom code actions
        </p>
      </div>
    </motion.div>
  );
}
