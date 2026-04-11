import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../features/auth/services/auth';

export const loggedInGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // On server (SSR), never redirect — just show landing page
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (!authService.isLoggedIn()) {
    return true;
  }

  const userType = authService.getUserType();

  if (userType === 'MANAGER') {
    return router.createUrlTree(['/manager-dashboard']);
  } else if (userType === 'STUDENT') {
    return router.createUrlTree(['/student-dashboard']);
  }

  return true;
};