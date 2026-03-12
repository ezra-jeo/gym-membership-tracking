'use client';

import { LandingNav } from '@/components/landing/landing-nav';
import { LandingHero } from '@/components/landing/landing-hero';
import { FeatureShowcase } from '@/components/landing/feature-showcase';
import { WhatYouCanDo } from '@/components/landing/what-you-can-do';
import { WhyItWorks } from '@/components/landing/why-it-works';
import { CommunityStatement } from '@/components/landing/community-statement';
import { TrustSection } from '@/components/landing/trust-section';
import { LandingCTA } from '@/components/landing/landing-cta';
import { LandingFooter } from '@/components/landing/landing-footer';
import { ScrollReveal } from '@/components/landing/scroll-reveal';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-background)' }}>
      <LandingNav />
      <LandingHero />

      <ScrollReveal>
        <FeatureShowcase />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <WhatYouCanDo />
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <WhyItWorks />
      </ScrollReveal>

      <CommunityStatement />

      <ScrollReveal delay={100}>
        <TrustSection />
      </ScrollReveal>

      <ScrollReveal>
        <LandingCTA />
      </ScrollReveal>

      <LandingFooter />
    </div>
  );
}