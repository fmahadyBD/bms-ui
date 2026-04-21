import { Injectable, PLATFORM_ID, inject } from '@angular/core';
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
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(private http: HttpClient, private router: Router) {}

  private getItem(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  private setItem(key: string, value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
  }

  private removeItem(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

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
          if (response.token) {
            this.setItem(this.tokenKey, response.token);
            this.setItem(this.userTypeKey, response.userType);
            this.setItem('user_email', credentials.email);

            const userInfo = {
              email: credentials.email,
              name: response.name || credentials.email.split('@')[0],
              userType: response.userType
            };
            this.setItem('user', JSON.stringify(userInfo));
            this.setItem('email', credentials.email);
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
        this.clearStorage();
        this.router.navigate(['/']);
      })
    );
  }

  getToken(): string | null {
    return this.getItem(this.tokenKey);
  }

  getUserType(): string | null {
    return this.getItem(this.userTypeKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private clearStorage(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userTypeKey);
    localStorage.removeItem('user_email');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
  }

  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  getStudentIdFromToken(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.studentId ?? null;
  }

  getManagerIdFromToken(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.managerId ?? null;
  }

  changePassword(passwords: { oldPassword: string; newPassword: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/change-password`, passwords);
  }
}