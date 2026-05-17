# UI Polish Implementation Plan

This plan outlines the steps to take the Kaamlink AI Service Orchestrator mobile UI to the next level, focusing on premium aesthetics, dynamic interactivity, and modern design patterns.

## User Review Required

> [!IMPORTANT]
> Please review the proposed changes below. Once approved, I will systematically implement these upgrades across the mobile codebase.

## Proposed Changes

### Shared Components (KaamilinkUI.tsx)

#### [NEW] AnimatedPressable Component
* Create a reusable wrapper around `Pressable` using `Animated.spring` to implement a scale-down micro-animation (`0.95` scale) on press. This will add a tactile, premium feel to all buttons.

#### [NEW] GlassCard Component
* Replace solid translucent `rgba` views with a true `BlurView` wrapper component. This will apply a dynamic frosted glass effect (`tint="dark"`, `intensity={40}`) over the app's background gradients.

### Screen-Specific Polish

#### [MODIFY] HomeScreen.tsx
* Wrap `inputCard`, `chipCard`, and `traceCard` in the new `GlassCard` component.
* Upgrade the primary "Send" button and Navigation Tabs to use `AnimatedPressable` for interactive scaling.
* Apply subtle staggered fade-in animations for each card to make the initial load feel dynamic.

#### [MODIFY] PricingScreen.tsx
* Wrap `agentCard`, `rangeCard`, `suggestCard`, and `budgetCard` in `GlassCard`.
* Upgrade the "Accept" button to use a rich `LinearGradient` background (e.g., Blue to Accent) wrapped in an `AnimatedPressable`.
* Enhance the probability bar with a subtle animated pulsing glow effect.

#### [MODIFY] BidsScreen.tsx
* Apply `GlassCard` to the `contextCard`, `agentCard`, and inner bid cards.
* Upgrade the "Accept Bid" buttons to use `AnimatedPressable`.
* Add a soft, animated glowing border drop-shadow behind the "Best Value" bid card to make it pop visually against the dark theme.

#### [MODIFY] ConfirmedScreen.tsx & RecoveryScreen.tsx
* Upgrade timeline cards and recovery traces to use `GlassCard`.
* Ensure all action buttons use `AnimatedPressable`.
* Add a subtle continuous pulsing effect to the success/warning icons.

## Verification Plan

### Automated/Manual Verification
* Use the Expo Go app or Metro Bundler preview to verify that true `BlurView` renders without performance degradation.
* Manually click through the 5-screen flow to ensure all `AnimatedPressable` elements feel snappy and responsive.
* Confirm that no existing logic or state transitions are broken by the UI updates.
