import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/sonner"
import { SettingsProvider } from '@/lib/settings/settings-provider';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import '@/sentry.client.config'
import '@/lib/global-error-handler'
import { AccountProvider } from '@/contexts/AccountContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'HSEmulator',
    template: '%s – HSEmulator',
  },
  description:
    'Local runtime and execution engine for HubSpot custom code actions',
  applicationName: 'HSEmulator',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          'bg-background text-foreground antialiased',
        ].join(' ')}
      >
        <Analytics />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AccountProvider>
            <SettingsProvider>
              {children}
            </SettingsProvider>
          </AccountProvider>

          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}