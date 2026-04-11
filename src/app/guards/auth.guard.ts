import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../features/auth/services/auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // On server (SSR), allow through — browser will re-check
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['']);
};