// src/app/features/student/survey/survey.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Question {
  questionText: string;
  questionType: string;
  options?: string | string[] | null;
  displayOrder: number;
  required: boolean;
}

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
  availableRoutes?: RouteBasicResponse[];
  availableSlots?: BusSlotResponse[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
  totalResponses?: number;
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
  totalResponses: number;
  confirmedResponses: number;
  waitlistedResponses: number;
  pendingResponses: number;
  rejectedResponses: number;
  targetProgress: number;
  routeDistribution: { [key: string]: number };
  pickupTimeDistribution: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class SurveyService {
  private baseUrl = 'http://localhost:8080/api/v1/surveys';

  constructor(private http: HttpClient) {}

  getActiveSurveys(): Observable<SurveyResponse[]> {
    return this.http.get<SurveyResponse[]>(`${this.baseUrl}/active`);
  }

  getSurveyById(id: number): Observable<SurveyResponse> {
    return this.http.get<SurveyResponse>(`${this.baseUrl}/${id}`);
  }

  submitResponse(surveyId: number, response: any): Observable<StudentResponse> {
    return this.http.post<StudentResponse>(`${this.baseUrl}/${surveyId}/responses`, response);
  }
}