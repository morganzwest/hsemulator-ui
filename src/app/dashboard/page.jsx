import { Suspense } from 'react';
import DashboardClient from './dashboard-client';

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardClient />
    </Suspense>
  );
}
