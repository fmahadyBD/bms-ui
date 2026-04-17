import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BusRequest {
  busName: string;
  busNumber: string;
  status: string;
  driverName: string;
  helperName: string;
  driverPhone: string;
  helperPhone: string;
  routeId?: number;
}

export interface BusResponse {
  id: number;
  busName: string;
  busNumber: string;
  status: string;
  driverName: string;
  helperName: string;
  driverPhone: string;
  helperPhone: string;
  routeId: number;
  busSlots: BusSlot[];
  createdAt: string;
  updatedAt: string;
}

export interface BusSlot {
  id: number;
  slotName: string;
  fromLocation: string;
  toLocation: string;
  pickupTime: string;
  status: string;
}

export interface BusStatistics {
  totalBuses: number;
  activeBuses: number;
  inactiveBuses: number;
  maintenanceBuses: number;
  onTripBuses: number;
  outOfServiceBuses: number;
  busesByRoute: number;
  availableBuses: number;
}

@Injectable({
  providedIn: 'root'
})
export class BusService {
  private baseUrl = 'http://localhost:8080/api/v1/buses';

  constructor(private http: HttpClient) {}

  // Get all buses
  getAllBuses(): Observable<BusResponse[]> {
    return this.http.get<BusResponse[]>(`${this.baseUrl}`);
  }

  // Get bus by ID
  getBusById(id: number): Observable<BusResponse> {
    return this.http.get<BusResponse>(`${this.baseUrl}/${id}`);
  }

  // Get bus by number
  getBusByNumber(busNumber: string): Observable<BusResponse> {
    return this.http.get<BusResponse>(`${this.baseUrl}/number/${busNumber}`);
  }

  // Get buses by status
  getBusesByStatus(status: string): Observable<BusResponse[]> {
    return this.http.get<BusResponse[]>(`${this.baseUrl}/status/${status}`);
  }

  // Get buses by route
  getBusesByRoute(routeId: number): Observable<BusResponse[]> {
    return this.http.get<BusResponse[]>(`${this.baseUrl}/route/${routeId}`);
  }

  // Create bus
  createBus(busData: BusRequest): Observable<BusResponse> {
    return this.http.post<BusResponse>(`${this.baseUrl}`, busData);
  }

  // Update bus
  updateBus(id: number, busData: BusRequest): Observable<BusResponse> {
    return this.http.put<BusResponse>(`${this.baseUrl}/${id}`, busData);
  }

  // Partial update bus
  partialUpdateBus(id: number, updates: any): Observable<BusResponse> {
    return this.http.patch<BusResponse>(`${this.baseUrl}/${id}`, updates);
  }

  // Update bus status
  updateBusStatus(id: number, status: string, reason?: string): Observable<BusResponse> {
    return this.http.patch<BusResponse>(`${this.baseUrl}/${id}/status`, { status, reason });
  }

  // Assign bus to route
  assignBusToRoute(busId: number, routeId: number): Observable<BusResponse> {
    return this.http.patch<BusResponse>(`${this.baseUrl}/${busId}/assign-route/${routeId}`, {});
  }

  // Remove bus from route
  removeBusFromRoute(busId: number): Observable<BusResponse> {
    return this.http.patch<BusResponse>(`${this.baseUrl}/${busId}/remove-route`, {});
  }

  // Get bus statistics
  getBusStatistics(): Observable<BusStatistics> {
    return this.http.get<BusStatistics>(`${this.baseUrl}/statistics`);
  }

  // Delete bus
  deleteBus(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}