import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Question, StudentResponse, SurveyStatistics } from '../student/survey';
// survey.ts - Add these interfaces and update SurveyResponse
export interface RouteBasicResponse {
  id: number;
  routeName: string;
  busNo: string;
  startPoint: string;
  endPoint: string;
}

export interface BusSlotResponse {
  id: number;
  slotName: string;
  pickupTime: string;
  dropTime: string;
  fromLocation: string;
  toLocation: string;
  status: string;
  description?: string;
  isRegular: boolean;
  regularDays?: string;
}

export interface SurveyResponse {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semester: string;
  targetResponses: number;
  status: string;
  isActive?: boolean;
  questions?: Question[];
  availableRoutes?: RouteBasicResponse[];  // ADD THIS
  availableSlots?: BusSlotResponse[];      // ADD THIS
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface SurveyRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  academicYear: string;
  semester: string;
  targetResponses: number;
  status: string;
  questions: Question[];
  availableRouteIds?: number[];  // ADD THIS
  availableSlotIds?: number[];   // ADD THIS
}

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private baseUrl = 'http://localhost:8080/api/v1/surveys';

  constructor(private http: HttpClient) {}

  createSurvey(surveyData: SurveyRequest): Observable<SurveyResponse> {
    return this.http.post<SurveyResponse>(this.baseUrl, surveyData);
  }

  getAllSurveys(): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>(this.baseUrl);
  }

  getSurveyById(id: number): Observable<SurveyResponse> {
    return this.http.get<SurveyResponse>(`${this.baseUrl}/${id}`);
  }

  getActiveSurveys(): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>(`${this.baseUrl}/active`);
  }

  getCurrentSurveys(): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>(`${this.baseUrl}/current`);
  }

  updateSurveyStatus(id: number, status: string): Observable<SurveyResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<SurveyResponse>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  updateSurvey(id: number, surveyData: SurveyRequest): Observable<SurveyResponse> {
    return this.http.put<SurveyResponse>(`${this.baseUrl}/${id}`, surveyData);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  submitResponse(surveyId: number, response: any): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(`${this.baseUrl}/${surveyId}/responses`, response);
  }

  getSurveyResponses(surveyId: number): Observable<StudentResponse[]> {
    return this.http.get<StudentResponse[]>(`${this.baseUrl}/${surveyId}/responses`);
  }

  updateResponseStatus(responseId: number, status: string, reason?: string): Observable<StudentResponse> {
    let params = new HttpParams().set('status', status);
    if (reason) {
      params = params.set('reason', reason);
    }
    return this.http.patch<StudentResponse>(`${this.baseUrl}/responses/${responseId}/status`, null, { params });
  }

  getSurveyStatistics(surveyId: number): Observable<SurveyStatistics> {
    return this.http.get<SurveyStatistics>(`${this.baseUrl}/${surveyId}/statistics`);
  }

  exportSurveyResponses(surveyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${surveyId}/export`, { responseType: 'blob' });
  }
}

export type { StudentResponse, SurveyStatistics };
