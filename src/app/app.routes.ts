import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { loggedInGuard } from './guards/logged-in.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [loggedInGuard],
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
    data: { role: 'MANAGER' },
    children: [
      { path: '', redirectTo: 'students', pathMatch: 'full' },
      { path: 'students', loadComponent: () => import('./features/dashboard/components/all-student-component/all-student-component').then(m => m.AllStudentComponent) },
      { path: 'buses', loadComponent: () => import('./features/bus/bus-component/bus-component').then(m => m.BusComponent) },
      { path: 'routes', loadComponent: () => import('./features/route/route-component/route-component').then(m => m.RouteComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];