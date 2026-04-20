import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusRequestService, BusRequest, BusRequestSummary } from '../bus-request.service';
import { RouteService } from '../../route/route.service';
import { BusSlotService } from '../../bus-slot/bus-slot.service';

interface Route {
  id: number;
  routeName: string;
  busNo: string;
  startPoint: string;
  endPoint: string;
}

interface PickupPoint {
  id: number;
  placeName: string;
  placeDetails: string;
  pickupTime: string;
  stopOrder: number;
}

@Component({
  selector: 'app-student-bus-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-bus-request.component.html',
  styleUrls: ['./student-bus-request.component.css']
})
export class StudentBusRequestComponent implements OnInit {
  // Form data
  busRequest: BusRequest = {
    studentId: 0,
    routeId: 0,
    pickupPointId: 0,
    requestedFrom: '',
    requestedTo: '',
    reason: ''
  };
  
  routes: Route[] = [];
  pickupPoints: PickupPoint[] = [];
  myRequests: BusRequestSummary[] = [];
  
  selectedRouteId: number | null = null;
  loading = false;
  submitting = false;
  showForm = true;
  errorMessage = '';
  successMessage = '';
  
  // Status colors
  statusColors: { [key: string]: string } = {
    'REQUESTED': 'warning',
    'APPROVED': 'success',
    'REJECTED': 'danger',
    'CANCELLED': 'secondary'
  };

  constructor(
    private busRequestService: BusRequestService,
    private routeService: RouteService,
    private slotService: BusSlotService
  ) {}

  ngOnInit() {
    this.loadStudentData();
    this.loadRoutes();
    this.loadMyRequests();
  }

  loadStudentData() {
    const studentId = localStorage.getItem('student_id');
    if (studentId) {
      // You'll need to get the actual student ID from your auth service
      this.busRequest.studentId = parseInt(studentId) || 1;
    }
  }

  loadRoutes() {
    this.routeService.getAllRoutes().subscribe({
      next: (response: any) => {
        this.routes = response.data || response;
      },
      error: (error) => {
        console.error('Error loading routes:', error);
      }
    });
  }

  onRouteChange() {
    if (this.selectedRouteId) {
      this.busRequest.routeId = this.selectedRouteId;
      // Load pickup points for this route
      this.loadPickupPoints(this.selectedRouteId);
    }
  }

  loadPickupPoints(routeId: number) {
    this.slotService.getSlotsByRoute(routeId).subscribe({
      next: (response: any) => {
        this.pickupPoints = response.data || response;
      },
      error: (error) => {
        console.error('Error loading pickup points:', error);
        this.pickupPoints = [];
      }
    });
  }

  loadMyRequests() {
    this.loading = true;
    this.busRequestService.getMyRequests(this.busRequest.studentId).subscribe({
      next: (requests) => {
        this.myRequests = requests;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.loading = false;
      }
    });
  }

  submitRequest() {
    // Validation
    if (!this.busRequest.routeId) {
      this.errorMessage = 'Please select a route';
      return;
    }
    if (!this.busRequest.pickupPointId) {
      this.errorMessage = 'Please select a pickup point';
      return;
    }
    if (!this.busRequest.requestedFrom || !this.busRequest.requestedTo) {
      this.errorMessage = 'Please select date range';
      return;
    }
    if (new Date(this.busRequest.requestedFrom) > new Date(this.busRequest.requestedTo)) {
      this.errorMessage = 'Start date must be before end date';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    
    this.busRequestService.createRequest(this.busRequest).subscribe({
      next: (response) => {
        this.successMessage = 'Bus request submitted successfully!';
        this.submitting = false;
        this.resetForm();
        this.loadMyRequests();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to submit request';
        this.submitting = false;
        
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }

  resetForm() {
    this.busRequest = {
      studentId: this.busRequest.studentId,
      routeId: 0,
      pickupPointId: 0,
      requestedFrom: '',
      requestedTo: '',
      reason: ''
    };
    this.selectedRouteId = null;
    this.pickupPoints = [];
  }

  cancelRequest(id: number) {
    if (confirm('Are you sure you want to cancel this request?')) {
      this.busRequestService.cancelRequest(id).subscribe({
        next: () => {
          this.successMessage = 'Request cancelled successfully';
          this.loadMyRequests();
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to cancel request';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    return `badge bg-${this.statusColors[status] || 'secondary'}`;
  }
}