import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080'; // Make sure this matches your backend
  private tokenKey = 'jwt_token';
  private userTypeKey = 'user_type';

  constructor(private http: HttpClient, private router: Router) {}

  registerStudent(userData: any): Observable<any> {
    console.log('Registering student:', userData);
    return this.http.post(`${this.baseUrl}/auth/register/student`, userData, {
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  registerManager(userData: any): Observable<any> {
    console.log('Registering manager:', userData);
    return this.http.post(`${this.baseUrl}/auth/register/manager`, userData, {
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: any): Observable<any> {
    console.log('Logging in with:', credentials.email);
    return this.http.post(`${this.baseUrl}/auth/authenticate`, credentials)
      .pipe(
        tap((response: any) => {
          console.log('Login response:', response);
          if (response.token) {
            this.setToken(response.token);
            this.setUserType(response.userType);
            console.log('Token saved successfully');
          }
        }),
        catchError(this.handleError)
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
      }),
      catchError(this.handleError)
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
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:8080';
      } else {
        errorMessage = `Server returned code ${error.status}: ${error.message}`;
      }
    }
    
    console.error('API Error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}