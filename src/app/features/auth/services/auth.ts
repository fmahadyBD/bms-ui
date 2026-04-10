import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080';
  private tokenKey = 'jwt_token';
  private userTypeKey = 'user_type';

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  registerStudent(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/student`, userData, {
      responseType: 'text'
    });
  }

  registerManager(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register/manager`, userData, {
      responseType: 'text'
    });
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/authenticate`, credentials)
      .pipe(
        tap((response: any) => {
          if (response.token && isPlatformBrowser(this.platformId)) {
            this.setToken(response.token);
            this.setUserType(response.userType);
          }
        })
      );
  }

  logout(): Observable<any> {
    const token = this.getToken();
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        if (isPlatformBrowser(this.platformId)) {
          this.clearStorage();
        }
        this.router.navigate(['/']);
      })
    );
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private setUserType(userType: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.userTypeKey, userType);
    }
  }

  getUserType(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return localStorage.getItem(this.userTypeKey);
  }

  isLoggedIn(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    return !!this.getToken();
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userTypeKey);
    localStorage.removeItem('user_email');
  }
}