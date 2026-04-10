import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient, private router: Router) {}

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
            this.setToken(response.token);
            this.setUserType(response.userType);
            this.setTokenExpiry(); // Store token expiry
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
    // Check if token is expired before returning
    if (this.isTokenExpired()) {
      this.clearStorage();
      this.router.navigate(['/']);
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }

  private setTokenExpiry(): void {
    // JWT tokens typically expire after 24 hours
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('token_expiry', expiryTime.toString());
  }

  private isTokenExpired(): boolean {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return false;
    return Date.now() > parseInt(expiry);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUserType(userType: string): void {
    localStorage.setItem(this.userTypeKey, userType);
  }

  getUserType(): string | null {
    return localStorage.getItem(this.userTypeKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private clearStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userTypeKey);
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('user_email');
  }
}