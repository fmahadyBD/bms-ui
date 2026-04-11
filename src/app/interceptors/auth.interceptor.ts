import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../features/auth/services/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isBrowser) {
      return next.handle(req); // ← skip everything on SSR
    }

    const token = this.authService.getToken();

    if (token && !req.url.includes('/auth/')) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401 || error.status === 403) {
            this.authService.logout().subscribe();
            this.router.navigate(['/']);
          }
          return throwError(() => error);
        })
      );
    }

    return next.handle(req);
  }
}