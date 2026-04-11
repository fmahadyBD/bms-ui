import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StudentSummaryResponse {
  studentId: string;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  batch: string;
  blocked: boolean;
  routeId?: number;
  routeName?: string;
}

export interface StudentResponse {
  studentId: string;
  name: string;
  email: string;
  phoneNumber: string;
  department: string;
  batch: string;
  blocked: boolean;
  routeId?: number;
  routeName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStudentRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  batch?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface StudentRoutineResponse {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = 'http://localhost:8080/api/v1/students';

  constructor(private http: HttpClient) { }

  // ✅ GET: Paginated students (for listing)
  getAllStudents(page: number = 0, size: number = 20): Observable<{
    content: StudentSummaryResponse[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(`${this.baseUrl}`, { params });
  }

  // ✅ GET: Student by ID
  getStudentById(studentId: string): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.baseUrl}/${studentId}`);
  }

  // ✅ GET: Search by email
  searchByEmail(email: string): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.baseUrl}/search/email`, {
      params: new HttpParams().set('email', email)
    });
  }

  // ✅ GET: Search by phone
  searchByPhone(phone: string): Observable<StudentResponse> {
    return this.http.get<StudentResponse>(`${this.baseUrl}/search/phone`, {
      params: new HttpParams().set('phone', phone)
    });
  }

  // ✅ GET: Students by department and batch
  getStudentsByDeptAndBatch(department: string, batch: string): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.baseUrl}/department/${department}/batch/${batch}`);
  }

  // ✅ GET: Students by route
  getStudentsByRoute(routeId: number): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.baseUrl}/route/${routeId}`);
  }

  // ✅ PATCH: Update student
  updateStudent(studentId: string, studentData: UpdateStudentRequest): Observable<StudentResponse> {
    return this.http.patch<StudentResponse>(`${this.baseUrl}/${studentId}`, studentData);
  }

  // ✅ PATCH: Assign route to student
  assignRoute(studentId: string, routeId: number): Observable<StudentResponse> {
    return this.http.patch<StudentResponse>(`${this.baseUrl}/${studentId}/assign-route/${routeId}`, {});
  }

  // ✅ PATCH: Remove route from student
  removeRoute(studentId: string): Observable<StudentResponse> {
    return this.http.patch<StudentResponse>(`${this.baseUrl}/${studentId}/remove-route`, {});
  }

  // ✅ GET: Get student's routines
  getStudentRoutines(studentId: string): Observable<StudentRoutineResponse[]> {
    return this.http.get<StudentRoutineResponse[]>(`${this.baseUrl}/${studentId}/routines`);
  }

  // ✅ PATCH: Block student
  blockStudent(studentId: string): Observable<StudentResponse> {
    return this.http.patch<StudentResponse>(`${this.baseUrl}/${studentId}/block`, {});
  }

  // ✅ PATCH: Unblock student
  unblockStudent(studentId: string): Observable<StudentResponse> {
    return this.http.patch<StudentResponse>(`${this.baseUrl}/${studentId}/unblock`, {});
  }

  // ✅ PATCH: Change password
  changePassword(studentId: string, passwords: ChangePasswordRequest): Observable<string> {
    return this.http.patch(`${this.baseUrl}/${studentId}/change-password`, passwords, { 
      responseType: 'text' 
    });
  }

  // ✅ DELETE: Delete student
  deleteStudent(studentId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${studentId}`);
  }
}