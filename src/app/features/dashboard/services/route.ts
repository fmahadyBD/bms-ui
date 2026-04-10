import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private baseUrl = 'http://localhost:8080/api/v1/routes';

  constructor(private http: HttpClient) {}

  createRoute(routeData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, routeData);
  }

  getAllRoutes(): Observable<any> {
    return this.http.get(`${this.baseUrl}`);
  }

  getRouteById(routeId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${routeId}`);
  }

  getRouteByBusNumber(busNo: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/bus/${busNo}`);
  }

  updateRouteStatus(routeId: number, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${routeId}/status`, null, {
      params: new HttpParams().set('status', status)
    });
  }

  deleteRoute(routeId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${routeId}`);
  }
}