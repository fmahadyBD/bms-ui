import { Component } from '@angular/core';
import { LandingNavbar } from '../../components/landing-navbar/landing-navbar';
import { HeroSlider } from '../../components/hero-slider/hero-slider';
import { FeaturesSection } from '../../components/features-section/features-section';
import { StatsSection } from '../../components/stats-section/stats-section';
import { CtaSection } from '../../components/cta-section/cta-section';
import { Footer } from '../../../../shared/components/footer/footer';

@Component({
  selector: 'app-landing-page',
  imports: [
    LandingNavbar,
    HeroSlider,
    FeaturesSection,
    StatsSection,
    CtaSection,
    Footer
  ],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {}