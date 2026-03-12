import { LandingNav } from '@/components/landing/landing-nav';
import { LandingHero } from '@/components/landing/landing-hero';
import { AboutSection } from '@/components/landing/about-section';
import { FeatureTabViewer } from '@/components/landing/feature-tab-viewer';
import { CTAOverlay } from '@/components/landing/cta-overlay';
import { ContactFooter } from '@/components/landing/contact-footer';
import { ScrollReveal } from '@/components/landing/scroll-reveal';

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-background)' }}>
      <LandingNav />
      <LandingHero />

      <ScrollReveal section="about">
        <AboutSection />
      </ScrollReveal>

      <ScrollReveal delay={100} section="features">
        <FeatureTabViewer />
      </ScrollReveal>

      <ScrollReveal delay={100} section="cta">
        <CTAOverlay />
      </ScrollReveal>

      <ContactFooter />
    </div>
  );
}