import React, { Suspense, lazy } from 'react';
import { GenericSkeleton } from './skeletons';

interface LazyComponentProps {
  component: React.ComponentType<any>;
  fallback?: React.ComponentType;
  props?: any;
}

const LazyComponent: React.FC<LazyComponentProps> = ({ 
  component: Component, 
  fallback: Fallback = GenericSkeleton,
  props = {}
}) => {
  return (
    <Suspense fallback={<Fallback />}>
      <Component {...props} />
    </Suspense>
  );
};

// Pre-defined lazy components for common use cases
export const LazyCostCalculator = lazy(() => import('./cost-calculator'));
export const LazyAccounting = lazy(() => import('./accounting/Accounting'));
export const LazyProjectManager = lazy(() => import('./ProjectManager'));
export const LazyAdvancedStatistics = lazy(() => import('./AdvancedStatistics'));

// DashboardHome with props wrapper
const DashboardHomeWithProps = React.lazy(() => import('./DashboardHome'));
export const LazyDashboardHome = (props: any) => (
  <Suspense fallback={<GenericSkeleton />}>
    <DashboardHomeWithProps {...props} />
  </Suspense>
);

export default LazyComponent; 