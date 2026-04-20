import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BusRequest {
  id?: number;
  studentId: number;
  routeId: number;
  pickupPointId: number;
  requestedFrom: string;
  requestedTo: string;
  reason: string;
}

export interface BusRequestResponse {
  id: number;
  student: {
    id: number;
    studentId: string;
    name: string;
    email: string;
    phoneNumber: string;
    department: string;
    batch: string;
  };
  route: {
    id: number;
    routeName: string;
    busNo: string;
    routeLine: string;
  };
  pickupPoint: {
    id: number;
    placeName: string;
    placeDetails: string;
    pickupTime: string;
    stopOrder: number;
  };
  requestedFrom: string;
  requestedTo: string;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminRemarks: string;
  approvalDate: string;
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface BusRequestSummary {
  id: number;
  studentName: string;
  studentId: string;
  studentEmail: string;
  routeName: string;
  busNo: string;
  pickupPointName: string;
  requestedFrom: string;
  requestedTo: string;
  status: string;
  createdAt: string;
}

export interface BusRequestStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  activeRequests: number;
}

export interface StatusUpdateRequest {
  status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminRemarks: string;
}

@Injectable({
  providedIn: 'root'
})
export class BusRequestService {
  private baseUrl = 'http://localhost:8080/api/v1/bus-requests';

  constructor(private http: HttpClient) {}

  // Student: Create new request
  createRequest(request: BusRequest): Observable<BusRequestResponse> {
    return this.http.post<BusRequestResponse>(this.baseUrl, request);
  }

  // Student: Get my requests
  getMyRequests(studentId: number): Observable<BusRequestSummary[]> {
    return this.http.get<BusRequestSummary[]>(`${this.baseUrl}/student/${studentId}`);
  }

  // Student: Cancel my request
  cancelRequest(id: number): Observable<BusRequestResponse> {
    return this.http.patch<BusRequestResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }

  // Admin: Get all requests
  getAllRequests(): Observable<BusRequestResponse[]> {
    return this.http.get<BusRequestResponse[]>(this.baseUrl);
  }

  // Admin: Get pending requests
  getPendingRequests(): Observable<BusRequestResponse[]> {
    return this.http.get<BusRequestResponse[]>(`${this.baseUrl}/pending`);
  }

  // Admin: Get requests by status
  getRequestsByStatus(status: string): Observable<BusRequestResponse[]> {
    return this.http.get<BusRequestResponse[]>(`${this.baseUrl}/status/${status}`);
  }

  // Admin: Get requests by route
  getRequestsByRoute(routeId: number): Observable<BusRequestResponse[]> {
    return this.http.get<BusRequestResponse[]>(`${this.baseUrl}/route/${routeId}`);
  }

  // Admin: Update request status
  updateRequestStatus(id: number, update: StatusUpdateRequest): Observable<BusRequestResponse> {
    return this.http.patch<BusRequestResponse>(`${this.baseUrl}/${id}/status`, update);
  }

  // Admin: Get statistics
  getStatistics(): Observable<BusRequestStatistics> {
    return this.http.get<BusRequestStatistics>(`${this.baseUrl}/statistics`);
  }

  // Admin: Delete request
  deleteRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}