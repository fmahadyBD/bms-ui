import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/api/v1/students';

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<any> {
    console.log('Fetching all students from:', this.baseUrl);
    return this.http.get(`${this.baseUrl}`).pipe(
      tap(data => console.log('Students received:', data)),
      catchError(this.handleError)
    );
  }

  getStudentById(studentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${studentId}`).pipe(
      catchError(this.handleError)
    );
  }

  searchByEmail(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/email`, {
      params: new HttpParams().set('email', email)
    }).pipe(catchError(this.handleError));
  }

  searchByPhone(phone: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/phone`, {
      params: new HttpParams().set('phone', phone)
    }).pipe(catchError(this.handleError));
  }

  getStudentsByDeptAndBatch(department: string, batch: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/department/${department}/batch/${batch}`).pipe(
      catchError(this.handleError)
    );
  }

  getStudentsByRoute(routeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/route/${routeId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateStudent(studentId: string, studentData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}`, studentData).pipe(
      catchError(this.handleError)
    );
  }

  assignRoute(studentId: string, routeId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/assign-route/${routeId}`, {}).pipe(
      catchError(this.handleError)
    );
  }

  removeRoute(studentId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/remove-route`, {}).pipe(
      catchError(this.handleError)
    );
  }

  getStudentRoutines(studentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${studentId}/routines`).pipe(
      catchError(this.handleError)
    );
  }

  blockStudent(studentId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/block`, {}).pipe(
      catchError(this.handleError)
    );
  }

  unblockStudent(studentId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/unblock`, {}).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(studentId: string, passwords: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/change-password`, passwords).pipe(
      catchError(this.handleError)
    );
  }

  deleteStudent(studentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${studentId}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}