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

  constructor(private http: HttpClient, private router: Router) { }

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
            // Store email for student dashboard to use
            localStorage.setItem('user_email', credentials.email);
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
    return localStorage.getItem(this.tokenKey);
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
    localStorage.removeItem('user_email');
  }



  // In auth.ts (AuthService)

  getDecodedToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      // JWT payload is the second part, base64 encoded
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      return null;
    }
  }

  getStudentIdFromToken(): string | null {
    const decoded = this.getDecodedToken();
    return decoded?.studentId ?? null;
  }

}