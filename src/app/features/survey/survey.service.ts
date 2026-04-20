import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Question {
  id?: number;
  questionText: string;
  questionType: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';
  options?: string;
  displayOrder: number;
  required: boolean;
}

export interface Survey {
  id?: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active?: boolean;
  questions: Question[];
}

export interface SurveyResponse {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  active: boolean;
  questions: Question[];
  createdAt?: string;
}


export interface SurveyResponseData {
  id: number;
  surveyId: number;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  selectedRouteId: number;
  selectedSlotId: number;
  responseData: string;
  submittedAt: string;
}

export interface Route {
  id: number;
  routeName: string;
  busNo: string;
  startPoint: string;
  endPoint: string;
}

export interface Slot {
  id: number;
  slotName: string;
  pickupTime: string;
  dropTime: string;
  fromLocation: string;
  toLocation: string;
}



export interface SubmissionData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  selectedRouteId: number;
  selectedSlotId: number;
  answers: { [key: string]: any };
}

@Injectable({ providedIn: 'root' })
export class SurveyService {
  private baseUrl = 'http://localhost:8080/api/v1/surveys';

  constructor(private http: HttpClient) {}

  // Manager endpoints
  createSurvey(data: Survey): Observable<SurveyResponse> {
    return this.http.post<SurveyResponse>(this.baseUrl, data);
  }

  updateSurvey(id: number, data: Survey): Observable<SurveyResponse> {
    return this.http.put<SurveyResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllSurveys(): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>(this.baseUrl);
  }

  getSurveyById(id: number): Observable<SurveyResponse> {
    return this.http.get<SurveyResponse>(`${this.baseUrl}/${id}`);
  }

  // Student endpoints
  getActiveSurveys(): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>(`${this.baseUrl}/active`);
  }

  submitResponse(surveyId: number, data: SubmissionData): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${surveyId}/submit`, data);
  }

  getSurveyResponses(surveyId: number): Observable<SurveyResponseData[]> {
  return this.http.get<SurveyResponseData[]>(`${this.baseUrl}/${surveyId}/responses`);
}

getAllResponses(): Observable<SurveyResponseData[]> {
  return this.http.get<SurveyResponseData[]>(`${this.baseUrl}/all-responses`);
}
}