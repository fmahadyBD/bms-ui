import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusRequestService, BusRequestResponse, BusRequestStatistics, StatusUpdateRequest } from '../bus-request.service';
import { RouteService } from '../../route/route.service';

@Component({
  selector: 'app-admin-bus-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bus-requests.component.html',
  styleUrls: ['./admin-bus-requests.component.css']
})
export class AdminBusRequestsComponent implements OnInit {
  requests: BusRequestResponse[] = [];
  filteredRequests: BusRequestResponse[] = [];
  statistics: BusRequestStatistics | null = null;
  
  // Filters
  statusFilter: string = 'ALL';
  routeFilter: number | null = null;
  searchTerm: string = '';
  
  routes: any[] = [];
  
  // Modal
  showModal = false;
  selectedRequest: BusRequestResponse | null = null;
  statusUpdate: StatusUpdateRequest = {
    status: 'APPROVED',
    adminRemarks: ''
  };
  
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private busRequestService: BusRequestService,
    private routeService: RouteService
  ) {}

  ngOnInit() {
    this.loadRoutes();
    this.loadRequests();
    this.loadStatistics();
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

  loadRequests() {
    this.loading = true;
    this.busRequestService.getAllRequests().subscribe({
      next: (requests) => {
        this.requests = requests;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.errorMessage = 'Failed to load requests';
        this.loading = false;
      }
    });
  }

  loadStatistics() {
    this.busRequestService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
      }
    });
  }

  applyFilters() {
    this.filteredRequests = this.requests.filter(request => {
      // Status filter
      if (this.statusFilter !== 'ALL' && request.status !== this.statusFilter) {
        return false;
      }
      
      // Route filter
      if (this.routeFilter && request.route.id !== this.routeFilter) {
        return false;
      }
      
      // Search term
      if (this.searchTerm) {
        const search = this.searchTerm.toLowerCase();
        return request.student.name.toLowerCase().includes(search) ||
               request.student.studentId.toLowerCase().includes(search) ||
               request.route.routeName.toLowerCase().includes(search);
      }
      
      return true;
    });
  }

  clearFilters() {
    this.statusFilter = 'ALL';
    this.routeFilter = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  openStatusModal(request: BusRequestResponse) {
    this.selectedRequest = request;
    this.statusUpdate = {
      status: 'APPROVED',
      adminRemarks: ''
    };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedRequest = null;
    this.statusUpdate = {
      status: 'APPROVED',
      adminRemarks: ''
    };
  }

  updateStatus() {
    if (!this.selectedRequest) return;
    
    this.busRequestService.updateRequestStatus(this.selectedRequest.id, this.statusUpdate).subscribe({
      next: () => {
        this.successMessage = `Request ${this.statusUpdate.status} successfully!`;
        this.loadRequests();
        this.loadStatistics();
        this.closeModal();
        
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to update status';
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  deleteRequest(id: number) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.busRequestService.deleteRequest(id).subscribe({
        next: () => {
          this.successMessage = 'Request deleted successfully';
          this.loadRequests();
          this.loadStatistics();
          
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete request';
          setTimeout(() => {
            this.errorMessage = '';
          }, 3000);
        }
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'REQUESTED': 'badge bg-warning',
      'APPROVED': 'badge bg-success',
      'REJECTED': 'badge bg-danger',
      'CANCELLED': 'badge bg-secondary'
    };
    return classes[status] || 'badge bg-secondary';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'REQUESTED': '⏳',
      'APPROVED': '✅',
      'REJECTED': '❌',
      'CANCELLED': '🗑️'
    };
    return icons[status] || '📋';
  }
}