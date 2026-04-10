import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/pages/landing-page/landing-page').then(m => m.LandingPage)
  },
  {
    path: 'student-dashboard',
    loadComponent: () => import('./features/dashboard/pages/student-dashboard/student-dashboard').then(m => m.StudentDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'manager-dashboard',
    loadComponent: () => import('./features/dashboard/pages/manager-dashboard/manager-dashboard').then(m => m.ManagerDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { role: 'MANAGER' }
  },
  { path: '**', redirectTo: '' }
];