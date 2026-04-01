'use client';

import dynamic from 'next/dynamic';
import { LandingNav } from '@/components/landing/landing-nav';
import { LandingHero } from '@/components/landing/landing-hero';
import { AboutSection } from '@/components/landing/about-section';
import { FeatureAccordion } from '@/components/landing/feature-accordion';
import { CTAOverlay } from '@/components/landing/cta-overlay';
import { ContactFooter } from '@/components/landing/contact-footer';
import { GymFinderSection } from '@/components/gym-finder-section';
import '@/styles/swiper-custom.css';

// Lazy load Swiper to reduce initial bundle
const FullPageSwiper = dynamic(
  () => import('@/components/landing/full-page-swiper').then(mod => ({ default: mod.FullPageSwiper })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-screen">
        <LandingHero />
      </div>
    ),
  }
);

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-background)' }}>
      <LandingNav />
      
      <FullPageSwiper>
        {/* Slide 1: Hero */}
        <div className="hero-wrapper">
          <LandingHero />
        </div>

        {/* Slide 2: About */}
        <AboutSection />

        {/* Slide 3: Features */}
        <FeatureAccordion />

        {/* Slide 4: CTA */}
        <CTAOverlay />

        {/* Slide 5: Gym Finder + Footer */}
        <div className="h-screen flex flex-col">
          <div className="flex-1">
            <GymFinderSection />
          </div>
          <ContactFooter />
        </div>
      </FullPageSwiper>
    </div>
  );
}
