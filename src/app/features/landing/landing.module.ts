import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingRoutingModule } from './landing-routing.module';

import { LandingPage } from './pages/landing-page/landing-page';
import { LandingNavbar } from './components/landing-navbar/landing-navbar';
import { HeroSlider } from './components/hero-slider/hero-slider';
import { FeaturesSection } from './components/features-section/features-section';
import { StatsSection } from './components/stats-section/stats-section';
import { CtaSection } from './components/cta-section/cta-section';
import { Footer } from '../../shared/components/footer/footer';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    LandingRoutingModule,
    LandingPage,
    LandingNavbar,
    HeroSlider,
    FeaturesSection,
    StatsSection,
    CtaSection,
    Footer
  ]
})
export class LandingModule { }