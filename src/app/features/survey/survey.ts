// src/app/features/survey/survey.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Question {
  id?: number;
  questionText: string;
  questionType: string;
  options?: string | string[] | null;
  displayOrder: number;
  required: boolean;
  isActive?: boolean;
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
}

// export interface SurveyResponse {
//   id: number;
//   title: string;
//   description: string;
//   startDate: string;
//   endDate: string;
//   academicYear: string;
//   semester: string;
//   targetResponses: number;
//   totalResponses?: number;  // Make optional since backend might not return it
//   status: string;
//   isActive?: boolean;
//   questions: Question[];
//   createdAt: string;
//   updatedAt: string;
//   createdBy?: number;
//   updatedBy?: number;
// }

// src/app/features/survey/survey.service.ts
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
  questions?: Question[];  // Make this optional
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}


export interface StudentResponse {
  id: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentDepartment: string;
  studentSemester: string;
  boardingPoint: string;
  dropPoint: string;
  pickupTime: string;
  responseData: any;
  additionalNotes: string;
  status: string;
  statusReason: string;
  submittedAt: string;
  surveyId: number;
}

export interface SurveyStatistics {
  surveyId?: number;
  surveyTitle?: string;
  totalResponses: number;
  confirmedResponses?: number;
  waitlistedResponses?: number;
  pendingResponses?: number;
  rejectedResponses?: number;
  targetProgress?: number;
  completionRate?: number;
  targetResponses?: number;
  responsesByStatus?: { [key: string]: number };
  routeDistribution?: { [key: string]: number };
  pickupTimeDistribution?: { [key: string]: number };
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
    return this.http.get(`${this.baseUrl}/${surveyId}/export`);
  }
}