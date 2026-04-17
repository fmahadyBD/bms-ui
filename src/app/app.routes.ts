import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loggedInGuard } from './guards/logged-in.guard';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [loggedInGuard],
    loadComponent: () => import('./features/landing/pages/landing-page/landing-page').then(m => m.LandingPage)
  },
  {
    path: 'student-dashboard',
    loadComponent: () => import('./features/student/student-dashboard/student-dashboard').then(m => m.StudentDashboardComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'overview', pathMatch: 'full' },  // Make sure this line is NOT commented
      { 
        path: 'overview', 
        loadComponent: () => import('./features/student/overview-component.ts/overview-component.ts').then(m => m.OverviewComponent)
      },
      { 
        path: 'new-bus-request', 
        loadComponent: () => import('./features/student/new-bus-request.ts/new-bus-request.ts').then(m => m.NewBusRequestComponent)
      },
      { 
        path: 'change-password', 
        loadComponent: () => import('./features/dashboard/components/change-password/change-password').then(m => m.ChangePasswordComponent)
      },
      { 
        path: 'survey', 
        loadComponent: () => import('./features/student/survey-component/survey-component').then(m => m.SurveyComponent)
      },
      { 
        path: 'profile', 
        loadComponent: () => import('./features/student/profile-component/profile-component').then(m => m.ProfileComponent)
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./features/student/settings-component/settings-component').then(m => m.SettingsComponent)
      },
      { 
        path: 'my-route', 
        loadComponent: () => import('./features/student/my-route-component/my-route-component').then(m => m.MyRouteComponent)
      }
    ]
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
      { path: 'routes', loadComponent: () => import('./features/route/route-component/route-component').then(m => m.RouteComponent) },
      { path: 'bus-slots', loadComponent: () => import('./features/bus-slot/bus-slot/bus-slot').then(m => m.BusSlotComponent) },
      { path: 'surveys', loadComponent: () => import('./features/survey/survey-management/survey-management').then(m => m.SurveyManagementComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];