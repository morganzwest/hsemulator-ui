'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
} from '@/components/ui/field'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { FaGithub, FaGoogle } from 'react-icons/fa'
import { toast } from 'sonner'

export function LoginForm({
  className,
  mode = 'login', // "login" | "signup"
  ...props
}) {
  const supabase = createSupabaseBrowserClient()
  const isSignup = mode === 'signup'
  const [loading, setLoading] = useState(false)

  async function loginWithProvider(provider) {
    if (loading) return
    setLoading(true)

    toast.info(
      provider === 'github'
        ? 'Redirecting to GitHub…'
        : 'Redirecting to Google…'
    )

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    })

    // If Supabase fails before redirect
    if (error) {
      console.error('[LoginForm] OAuth failed', error)
      toast.error(
        error.message ||
          'Authentication failed. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <div
      className={cn('flex flex-col gap-6', className)}
      {...props}
    >
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
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
                  variant="outline"
                  type="button"
                  disabled={loading}
                  onClick={() => loginWithProvider('github')}
                >
                  <FaGithub className="h-5 w-5" />
                  Login with GitHub
                </Button>

                <Button
                  variant="outline"
                  type="button"
                  disabled={loading}
                  onClick={() => loginWithProvider('google')}
                >
                  <FaGoogle className="h-5 w-5" />
                  Login with Google
                </Button>
              </Field>

              <Field>
                {isSignup ? (
                  <FieldDescription className="text-center">
                    Already have an account?{' '}
                    <a href="/login">Log in</a>
                  </FieldDescription>
                ) : (
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{' '}
                    <a href="/get-started">Sign up</a>
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <a href="#">Terms of Service</a> and{' '}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
