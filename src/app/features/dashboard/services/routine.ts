import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutineService {
  private baseUrl = 'http://localhost:8080/api/v1/routines';

  constructor(private http: HttpClient) {}

  createRoutine(routineData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, routineData);
  }

  assignStudentsToRoutine(routineId: number, studentIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/${routineId}/students`, studentIds);
  }
}