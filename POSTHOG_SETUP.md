# PostHog Analytics Setup Guide for MakerFlow

## Overview
This guide covers the complete PostHog analytics implementation for MakerFlow, including user tracking, feature flags, and event monitoring.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://eu.posthog.com
```

## Features Implemented

### 1. User Identification
- Automatic user identification on login/logout
- User properties tracking (email, name, creation date)
- Session management

### 2. Page View & Page Leave Tracking
- Automatic page view capture with URL and search parameters
- **Page leave tracking** for accurate bounce rate and session duration
- Navigation flow analysis
- Client-side routing support for Next.js

### 3. Event Tracking
The following events are automatically tracked:

#### User Events
- `user_signed_in` - When users log in
- `user_signed_out` - When users log out
- `user_registered` - When new users register

#### Project Events
- `project_created` - When a new project is created
- `project_saved` - When a project is saved/updated
- `project_loaded` - When a project is loaded for editing

#### Calculator Events
- `calculator_used` - When cost calculations are performed
- `cost_calculated` - When costs are calculated
- `price_recommendation_generated` - When price recommendations are generated

#### Sales Events
- `sale_created` - When a new sale is created
- `sale_updated` - When a sale is updated
- `sale_deleted` - When a sale is deleted

#### Client Events
- `client_created` - When a new client is created
- `client_updated` - When a client is updated
- `client_deleted` - When a client is deleted

#### Team Events
- `team_created` - When a new team is created
- `team_joined` - When a user joins a team
- `team_left` - When a user leaves a team

#### Navigation Events
- `$pageview` - When users navigate to different pages
- `$pageleave` - When users leave pages (for accurate bounce rate)
- `page_accessed` - Custom page access tracking
- `dashboard_accessed` - When dashboard is accessed
- `calculator_accessed` - When calculator is accessed
- `projects_accessed` - When projects page is accessed
- `accounting_accessed` - When accounting page is accessed
- `settings_accessed` - When settings page is accessed

### 4. Feature Flags
Available feature flags for A/B testing and gradual rollouts:

- `advanced_statistics` - Enable advanced analytics features
- `team_collaboration` - Enable team collaboration features
- `kanban_board` - Enable Kanban board functionality
- `invoice_generation` - Enable invoice generation
- `export_functionality` - Enable export features
- `beta_features` - Enable beta features

### 5. Session Recording
- Automatic session recording enabled
- Text input masking for privacy
- Canvas recording disabled for performance

### 6. Error Tracking
- Automatic exception capture
- Error boundary integration
- Performance monitoring

## Page Leave Tracking Fix

The implementation includes proper page leave tracking to ensure accurate bounce rate and session duration metrics:

```typescript
// In PostHogProvider.tsx
useEffect(() => {
  if (pathname) {
    const url = searchParams?.size 
      ? `${pathname}?${searchParams.toString()}`
      : pathname
    
    // Track page leave for the previous page
    if (previousPathname.current && previousPathname.current !== pathname) {
      posthog.capture('$pageleave', {
        $current_url: previousPathname.current,
        next_url: url,
      })
    }
    
    // Track page view for the current page
    posthog.capture('$pageview', {
      $current_url: url,
      pathname,
      search_params: searchParams?.toString() || null,
    })
    
    // Update previous pathname
    previousPathname.current = pathname
  }
}, [pathname, searchParams])
```

This ensures that:
- Page leave events are captured when users navigate between pages
- Bounce rate calculations are accurate
- Session duration metrics are precise
- Both client-side navigation and browser events are tracked

## Usage Examples

### Using the Analytics Hook

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const { 
    capture, 
    trackProjectCreated, 
    isFeatureEnabled,
    trackFeatureUsage 
  } = useAnalytics()

  const handleProjectSave = (project) => {
    trackProjectCreated(project.id, project.name, project.teamId)
  }

  const handleFeatureUse = () => {
    trackFeatureUsage('export_pdf', { format: 'pdf', pages: 2 })
  }

  // Check if feature is enabled
  if (isFeatureEnabled(FEATURE_FLAGS.ADVANCED_STATISTICS)) {
    // Show advanced features
  }
}
```

### Using Feature Flags

```typescript
import { useAnalytics } from '@/hooks/useAnalytics'
import { FEATURE_FLAGS } from '@/types'

function MyComponent() {
  const { isFeatureEnabled, getFeatureFlag } = useAnalytics()

  const showAdvancedStats = isFeatureEnabled(FEATURE_FLAGS.ADVANCED_STATISTICS)
  const betaFeatureValue = getFeatureFlag(FEATURE_FLAGS.BETA_FEATURES)

  return (
    <div>
      {showAdvancedStats && <AdvancedStats />}
      {betaFeatureValue && <BetaFeature />}
    </div>
  )
}
```

## PostHog Dashboard Setup

### 1. Create Funnels
Set up funnels to track user journeys:

1. **User Registration Funnel**
   - Page view → Sign up → Email verification → Dashboard access

2. **Project Creation Funnel**
   - Calculator access → Project creation → Project save → Project view

3. **Sales Funnel**
   - Project creation → Sale creation → Invoice generation

### 2. Create Cohorts
Define user cohorts for analysis:

- **New Users**: Users who signed up in the last 7 days
- **Active Users**: Users who used the app in the last 30 days
- **Power Users**: Users who created 10+ projects
- **Team Users**: Users who are part of a team

### 3. Set Up Dashboards
Create dashboards for key metrics:

#### User Engagement Dashboard
- Daily/Monthly Active Users
- Session duration
- Pages per session
- User retention rates
- **Bounce rate** (now accurate with page leave tracking)

#### Business Metrics Dashboard
- Projects created per day/week
- Sales volume
- Average project value
- Client acquisition rate

#### Feature Usage Dashboard
- Calculator usage
- Feature adoption rates
- Error rates
- Performance metrics

## Best Practices

### 1. Event Naming
- Use consistent naming conventions
- Include relevant properties
- Avoid sensitive data in event names

### 2. Property Tracking
- Track meaningful properties
- Include user context when relevant
- Use consistent data types

### 3. Privacy
- Mask sensitive input fields
- Don't track personal information
- Respect user privacy preferences

### 4. Performance
- Use debounced tracking for frequent events
- Handle PostHog errors gracefully
- Don't block UI for analytics

## Troubleshooting

### Common Issues

1. **Events not appearing in PostHog**
   - Check API key configuration
   - Verify network connectivity
   - Check browser console for errors

2. **Feature flags not working**
   - Ensure user is identified
   - Check flag configuration in PostHog
   - Verify flag names match exactly

3. **Session recordings not working**
   - Check if recordings are enabled
   - Verify user consent
   - Check browser compatibility

4. **Page leave events not captured**
   - Ensure `capture_pageleave: true` is set
   - Check that the `loaded` callback is working
   - Verify client-side navigation is being tracked

### Debug Mode
Enable debug mode in development:

```typescript
// In PostHogProvider.tsx
debug: process.env.NODE_ENV === "development"
```

This will show PostHog events in the browser console.

## Verification Steps

To verify that page leave tracking is working:

1. **Check Browser Console**: Look for `$pageleave` events in the console
2. **PostHog Dashboard**: Verify that page leave events appear in the events list
3. **Bounce Rate**: Check that bounce rate calculations are now accurate
4. **Session Duration**: Verify that session duration metrics are precise

## Next Steps

1. **Set up PostHog project** and add environment variables
2. **Configure feature flags** in PostHog dashboard
3. **Create funnels and cohorts** for user analysis
4. **Set up alerts** for important metrics
5. **Monitor and optimize** based on analytics data
6. **Verify page leave tracking** is working correctly

## Support

For PostHog-specific issues, refer to the [PostHog documentation](https://posthog.com/docs). 