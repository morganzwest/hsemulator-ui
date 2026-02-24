import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }


  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth exchange failed:", error.message);
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  // Check if user has a profile (to determine if they need onboarding)
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_status')
        .eq('id', user.id)
        .single();

      // If no profile exists or onboarding not completed, redirect to onboarding
      if (profileError?.code === 'PGRST116' || !profile || profile.onboarding_status !== 'completed') {
        return NextResponse.redirect(`${origin}/dashboard/onboarding?source=new`);
      }
    }
  } catch (error) {
    console.error("Error checking user profile:", error);
    // If there's an error checking the profile, default to dashboard
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}