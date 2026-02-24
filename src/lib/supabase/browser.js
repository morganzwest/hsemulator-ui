import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!url) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY environment variable');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
  }

  console.log('Initializing Supabase client with URL:', url);

  const client = createBrowserClient(url, key, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  // Test connection
  client
    .from('profiles')
    .select('count')
    .then(({ error }) => {
      if (error) {
        console.warn('Supabase connection test failed:', error);
      } else {
        console.log('Supabase connection test successful');
      }
    })
    .catch((err) => {
      console.warn('Supabase connection test error:', err);
    });

  return client;
}
