import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PickupPointRequest {
  placeName: string;
  placeDetails: string;
  pickupTime: string;
  stopOrder: number;
}

export interface PickupPointResponse {
  id: number;
  placeName: string;
  placeDetails: string;
  pickupTime: string;
  stopOrder: number;
}

export interface CreateRouteRequest {
  busNo: string;
  routeName: string;
  routeLine: string;
  startPoint: string;   // ADD THIS
  endPoint: string;     // ADD THIS
  operatingDays: string[];
  pickupPoints: PickupPointRequest[];
}

export interface RouteResponse {
  id: number;
  busNo: string;
  routeName: string;
  routeLine: string;
  startPoint: string;   // ADD THIS
  endPoint: string;     // ADD THIS
  status: string;
  pickupPoints: PickupPointResponse[];
  operatingDays: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RouteStatistics {
  routeId: number;
  routeName: string;
  busNo: string;
  status: string;
  totalBuses: number;
  activeBuses: number;
  totalSlots: number;
  activeSlots: number;
  totalPickupPoints: number;
  operatingDays: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private baseUrl = 'http://localhost:8080/api/v1/routes';

  constructor(private http: HttpClient) {}

  getAllRoutes(): Observable<RouteResponse[]> {
    return this.http.get<RouteResponse[]>(`${this.baseUrl}`);
  }

  getRouteById(id: number): Observable<RouteResponse> {
    return this.http.get<RouteResponse>(`${this.baseUrl}/${id}`);
  }

  getRouteByBusNo(busNo: string): Observable<RouteResponse> {
    return this.http.get<RouteResponse>(`${this.baseUrl}/bus/${busNo}`);
  }

  createRoute(routeData: CreateRouteRequest): Observable<RouteResponse> {
    return this.http.post<RouteResponse>(`${this.baseUrl}`, routeData);
  }

  updateRoute(id: number, routeData: CreateRouteRequest): Observable<RouteResponse> {
    return this.http.put<RouteResponse>(`${this.baseUrl}/${id}`, routeData);
  }

  partialUpdateRoute(id: number, updates: any): Observable<RouteResponse> {
    return this.http.patch<RouteResponse>(`${this.baseUrl}/${id}`, updates);
  }

  updateRouteStatus(id: number, status: string): Observable<RouteResponse> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<RouteResponse>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  getRouteStatistics(id: number): Observable<RouteStatistics> {
    return this.http.get<RouteStatistics>(`${this.baseUrl}/${id}/statistics`);
  }

  deleteRoute(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}