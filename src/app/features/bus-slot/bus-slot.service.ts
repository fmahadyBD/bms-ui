// src/app/features/bus-slot/services/bus-slot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BusSlot {
  id: number;
  route: {
    id: number;
    routeName: string;
    busNo: string;
    fromLocation: string;
    toLocation: string;
  };
  bus: {
    id: number;
    busName: string;
    busNumber: string;
  } | null;
  slotName: string;
  pickupTime: string;
  dropTime: string;
  fromLocation: string;
  toLocation: string;
  status: 'ACTIVE' | 'INACTIVE' | 'FULL' | 'CANCELLED';
  description: string;
  isRegular: boolean;
  regularDays: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  updatedBy: number;
}

export interface BusSlotRequest {
  routeId: number;
  busId?: number;
  slotName: string;
  pickupTime: string;
  dropTime?: string;
  fromLocation: string;
  toLocation: string;
  status?: string;
  description?: string;
  isRegular?: boolean;
  regularDays?: string;
}

export interface BusSlotFilterRequest {
  routeId?: number;
  busId?: number;
  status?: string;
  fromTime?: string;
  toTime?: string;
  isRegular?: boolean;
}

export interface BusSlotStatistics {
  totalSlots: number;
  activeSlots: number;
  inactiveSlots: number;
  fullSlots: number;
  regularSlots: number;
  slotsByRoute: number;
}

@Injectable({
  providedIn: 'root'
})
export class BusSlotService {
  private apiUrl = 'http://localhost:8080/api/v1/bus-slots';

  constructor(private http: HttpClient) {}

  // Create a new bus slot
  createSlot(slotData: BusSlotRequest): Observable<BusSlot> {
    return this.http.post<BusSlot>(this.apiUrl, slotData);
  }

  // Update an existing bus slot
  updateSlot(id: number, slotData: BusSlotRequest): Observable<BusSlot> {
    return this.http.put<BusSlot>(`${this.apiUrl}/${id}`, slotData);
  }

  // Get all bus slots
  getAllSlots(): Observable<BusSlot[]> {
    return this.http.get<BusSlot[]>(this.apiUrl);
  }

  // Get bus slot by ID
  getSlotById(id: number): Observable<BusSlot> {
    return this.http.get<BusSlot>(`${this.apiUrl}/${id}`);
  }

  // Get slots by route ID
  getSlotsByRoute(routeId: number): Observable<BusSlot[]> {
    return this.http.get<BusSlot[]>(`${this.apiUrl}/route/${routeId}`);
  }

  // Get slots by status
  getSlotsByStatus(status: string): Observable<BusSlot[]> {
    return this.http.get<BusSlot[]>(`${this.apiUrl}/status/${status}`);
  }

  // Get slots by time range
  getSlotsByTimeRange(fromTime: string, toTime: string): Observable<BusSlot[]> {
    const params = new HttpParams()
      .set('fromTime', fromTime)
      .set('toTime', toTime);
    return this.http.get<BusSlot[]>(`${this.apiUrl}/time-range`, { params });
  }

  // Get slots by route and time range
  getSlotsByRouteAndTimeRange(routeId: number, fromTime: string, toTime: string): Observable<BusSlot[]> {
    const params = new HttpParams()
      .set('fromTime', fromTime)
      .set('toTime', toTime);
    return this.http.get<BusSlot[]>(`${this.apiUrl}/route/${routeId}/time-range`, { params });
  }

  // Update slot status
  updateSlotStatus(id: number, status: string, reason?: string): Observable<BusSlot> {
    return this.http.patch<BusSlot>(`${this.apiUrl}/${id}/status`, { status, reason });
  }

  // Delete slot
  deleteSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Filter slots
  filterSlots(filter: BusSlotFilterRequest): Observable<BusSlot[]> {
    return this.http.post<BusSlot[]>(`${this.apiUrl}/filter`, filter);
  }

  // Get statistics
  getStatistics(): Observable<BusSlotStatistics> {
    return this.http.get<BusSlotStatistics>(`${this.apiUrl}/statistics`);
  }

  // Get statistics by route
  getStatisticsByRoute(routeId: number): Observable<BusSlotStatistics> {
    return this.http.get<BusSlotStatistics>(`${this.apiUrl}/statistics/route/${routeId}`);
  }

  // Get slots by bus
  getSlotsByBus(busId: number): Observable<BusSlot[]> {
    return this.http.get<BusSlot[]>(`${this.apiUrl}/bus/${busId}`);
  }

  // Get slots by bus and time range
  getSlotsByBusAndTimeRange(busId: number, fromTime: string, toTime: string): Observable<BusSlot[]> {
    const params = new HttpParams()
      .set('fromTime', fromTime)
      .set('toTime', toTime);
    return this.http.get<BusSlot[]>(`${this.apiUrl}/bus/${busId}/time-range`, { params });
  }

  // Get statistics by bus
  getStatisticsByBus(busId: number): Observable<BusSlotStatistics> {
    return this.http.get<BusSlotStatistics>(`${this.apiUrl}/statistics/bus/${busId}`);
  }
}