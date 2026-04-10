import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public landing page
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule)
  },
  
  // Auth routes (will add later)
//   {
//     path: 'auth',
//     loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
//   },
  
//   // Student routes (will add later)
//   {
//     path: 'student',
//     loadChildren: () => import('./layouts/student-layout/student-layout.module').then(m => m.StudentLayoutModule)
//   },
  
//   // Manager routes (will add later)
//   {
//     path: 'manager',
//     loadChildren: () => import('./layouts/manager-layout/manager-layout.module').then(m => m.ManagerLayoutModule)
//   },
  
  // Redirect all other routes to landing
  { path: '**', redirectTo: '' }
];