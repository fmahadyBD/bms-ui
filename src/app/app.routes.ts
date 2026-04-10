import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public landing page with auth forms
  {
    path: '',
    loadComponent: () => import('./features/landing/pages/landing-page/landing-page').then(m => m.LandingPage)
  },
  
  // Redirect all other routes to landing
  { path: '**', redirectTo: '' }
];