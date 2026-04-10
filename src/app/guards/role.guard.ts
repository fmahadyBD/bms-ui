import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../features/auth/services/auth';

@Injectable({ providedIn: 'root' })
export class roleGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredRole = route.data['role'];
    const userType = this.authService.getUserType();

    if (userType === requiredRole) {
      return true;
    }
    
    // Redirect based on user type
    if (userType === 'STUDENT') {
      this.router.navigate(['/student-dashboard']);
    } else {
      this.router.navigate(['/']);
    }
    return false;
  }
}