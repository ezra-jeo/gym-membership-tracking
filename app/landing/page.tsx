import { LandingNav } from '@/components/landing/landing-nav';
import { LandingHero } from '@/components/landing/landing-hero';
import { AboutSection } from '@/components/landing/about-section';
import { FeatureRows } from '@/components/landing/feature-rows';
import { Testimonials } from '@/components/landing/testimonials';
import { CTABand } from '@/components/landing/cta-band';
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
        <FeatureRows />
      </ScrollReveal>

      <ScrollReveal delay={100} section="testimonials">
        <Testimonials />
      </ScrollReveal>

      <CTABand />

      <ContactFooter />
    </div>
  );
}