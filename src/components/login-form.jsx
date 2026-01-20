'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { FaGithub } from 'react-icons/fa';
import { FaGoogle } from 'react-icons/fa';

export function LoginForm({
  className,
  mode = 'login', // "login" | "signup"
  ...props
}) {
  const supabase = createSupabaseBrowserClient();

  const isSignup = mode === 'signup';

  async function loginWithGithub() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className='text-center'>
          <CardTitle className='text-xl'>
            {' '}
            {isSignup ? 'Create your account' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {isSignup
              ? 'Sign up using one of the providers below'
              : 'Log in using your existing account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <Button
                  variant='outline'
                  type='button'
                  onClick={loginWithGithub}
                >
                  <FaGithub className='h-5 w-5' />
                  Login with GitHub
                </Button>
                <Button
                  variant='outline'
                  type='button'
                  onClick={loginWithGoogle}
                >
                  <FaGoogle className='h-5 w-5' />
                  Login with Google
                </Button>
              </Field>
              <Field>
                {/* <Button type="submit">Login</Button> */}
                {isSignup ? (
                  <>
                    <FieldDescription className='text-center'>
                      Already have an account?{' '}
                      <a variant='link' href='/login'>
                        Log in
                      </a>
                    </FieldDescription>
                  </>
                ) : (
                  <>
                    <FieldDescription className='text-center'>
                      Don&apos;t have an account?{' '}
                      <a variant='link' href='/get-started'>
                        Sign up
                      </a>
                    </FieldDescription>
                  </>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className='px-6 text-center'>
        By clicking continue, you agree to our <a href='#'>Terms of Service</a>{' '}
        and <a href='#'>Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
