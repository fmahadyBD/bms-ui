import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../features/auth/services/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the token from localStorage
    const token = localStorage.getItem('jwt_token');
    
    console.log('Interceptor - Request URL:', req.url);
    console.log('Interceptor - Token exists:', !!token);
    
    // Clone the request and add the Authorization header if token exists
    if (token && !req.url.includes('/auth/')) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('Interceptor - Added Authorization header to:', req.url);
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            console.log('Interceptor - Unauthorized, logging out...');
            this.authService.logout().subscribe();
            this.router.navigate(['/']);
          }
          return throwError(() => error);
        })
      );
    }
    
    // If no token or auth endpoint, pass the request as is
    return next.handle(req);
  }
}