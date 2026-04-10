import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/api/v1/students';

  constructor(private http: HttpClient) {}

  getAllStudents(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getStudentById(studentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${studentId}`);
  }

  searchByEmail(email: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/email`, {
      params: new HttpParams().set('email', email)
    });
  }

  searchByPhone(phone: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/search/phone`, {
      params: new HttpParams().set('phone', phone)
    });
  }

  getStudentsByDeptAndBatch(department: string, batch: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/department/${department}/batch/${batch}`);
  }

  getStudentsByRoute(routeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/route/${routeId}`);
  }

  updateStudent(studentId: string, studentData: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}`, studentData);
  }

  assignRoute(studentId: string, routeId: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/assign-route/${routeId}`, {});
  }

  removeRoute(studentId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/remove-route`, {});
  }

  getStudentRoutines(studentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${studentId}/routines`);
  }

  blockStudent(studentId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/block`, {});
  }

  unblockStudent(studentId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/unblock`, {});
  }

  changePassword(studentId: string, passwords: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${studentId}/change-password`, passwords);
  }

  deleteStudent(studentId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${studentId}`);
  }
}