import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusService, BusResponse, BusRequest } from '..//bus.service';
import { RouteService, RouteResponse } from '../../route/route.service';

@Component({
  selector: 'app-bus',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bus-component.html',
  styleUrls: ['./bus-component.css']
})
export class BusComponent implements OnInit {
  // Data
  buses: BusResponse[] = [];
  routes: RouteResponse[] = [];
  loading = false;
  
  // Modal visibility
  showAddModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  
  // Selected bus
  selectedBus: BusResponse | null = null;
  
  // Form data
  busForm: BusRequest = {
    busName: '',
    busNumber: '',
    status: 'ACTIVE',
    driverName: '',
    helperName: '',
    driverPhone: '',
    helperPhone: '',
    routeId: undefined
  };
  
  // Options
  statusOptions = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ON_TRIP', 'OUT_OF_SERVICE'];
  
  // Loading states
  actionLoading = false;

  constructor(
    private busService: BusService,
    private routeService: RouteService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadBuses();
    this.loadRoutes();
  }

  loadBuses() {
    this.loading = true;
    this.busService.getAllBuses().subscribe({
      next: (data) => {
        this.buses = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading buses:', error);
        this.loading = false;
        this.showError('Failed to load buses');
      }
    });
  }

  loadRoutes() {
    this.routeService.getAllRoutes().subscribe({
      next: (data) => {
        this.routes = data;
      },
      error: (error) => {
        console.error('Error loading routes:', error);
      }
    });
  }

  // Open Add Modal
  openAddModal() {
    this.busForm = {
      busName: '',
      busNumber: '',
      status: 'ACTIVE',
      driverName: '',
      helperName: '',
      driverPhone: '',
      helperPhone: '',
      routeId: undefined
    };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.actionLoading = false;
  }

  saveBus() {
    this.actionLoading = true;
    this.busService.createBus(this.busForm).subscribe({
      next: () => {
        this.showSuccess('Bus added successfully!');
        this.closeAddModal();
        this.loadBuses();
        this.actionLoading = false;
      },
      error: (error) => {
        this.showError('Failed to add bus: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  // View Details
  viewDetails(bus: BusResponse) {
    this.selectedBus = bus;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedBus = null;
  }

  // Edit Bus
  editBus(bus: BusResponse) {
    this.selectedBus = bus;
    this.busForm = {
      busName: bus.busName,
      busNumber: bus.busNumber,
      status: bus.status,
      driverName: bus.driverName,
      helperName: bus.helperName,
      driverPhone: bus.driverPhone,
      helperPhone: bus.helperPhone,
      routeId: bus.routeId
    };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedBus = null;
    this.actionLoading = false;
  }

  updateBus() {
    if (!this.selectedBus) return;
    this.actionLoading = true;
    this.busService.updateBus(this.selectedBus.id, this.busForm).subscribe({
      next: () => {
        this.showSuccess('Bus updated successfully!');
        this.closeEditModal();
        this.loadBuses();
        this.actionLoading = false;
      },
      error: (error) => {
        this.showError('Failed to update bus: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  // Delete Bus
  confirmDelete(bus: BusResponse) {
    this.selectedBus = bus;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedBus = null;
    this.actionLoading = false;
  }

  deleteBus() {
    if (!this.selectedBus) return;
    this.actionLoading = true;
    this.busService.deleteBus(this.selectedBus.id).subscribe({
      next: () => {
        this.showSuccess('Bus deleted successfully!');
        this.closeDeleteModal();
        this.loadBuses();
        this.actionLoading = false;
      },
      error: (error) => {
        this.showError('Failed to delete bus: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  // Update Status
  updateStatus(bus: BusResponse, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    if (confirm(`Change status of ${bus.busName} to ${newStatus}?`)) {
      this.busService.updateBusStatus(bus.id, newStatus).subscribe({
        next: () => {
          this.showSuccess('Status updated successfully!');
          this.loadBuses();
        },
        error: (error) => {
          this.showError('Failed to update status');
        }
      });
    }
  }

  // Helper Methods
  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'status-active';
      case 'INACTIVE': return 'status-inactive';
      case 'MAINTENANCE': return 'status-maintenance';
      case 'ON_TRIP': return 'status-ontrip';
      case 'OUT_OF_SERVICE': return 'status-outofservice';
      default: return '';
    }
  }

  getRouteName(routeId?: number): string {
    if (!routeId) return 'Not Assigned';
    const route = this.routes.find(r => r.id === routeId);
    return route ? route.routeName : 'Unknown Route';
  }

  private showSuccess(message: string) {
    alert(message);
  }

  private showError(message: string) {
    alert(message);
  }
}