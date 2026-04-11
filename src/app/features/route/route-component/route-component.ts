// route-component.ts (updated)
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouteService, RouteResponse, CreateRouteRequest, PickupPointRequest } from '../route.service';

@Component({
  selector: 'app-route',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './route-component.html',
  styleUrls: ['./route-component.css']
})
export class RouteComponent implements OnInit {
  routes: RouteResponse[] = [];
  loading = false;

  showAddModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  selectedRoute: RouteResponse | null = null;

  routeFormData: CreateRouteRequest = {
    busNo: '',
    routeName: '',
    routeLine: '',
    operatingDays: [],
    pickupPoints: []
  };

  operatingDaysOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  statusOptions = ['ACTIVE', 'INACTIVE'];
  actionLoading = false;
  submitted = false;

  newPickupPoint: PickupPointRequest = {
    placeName: '',
    placeDetails: '',
    pickupTime: '',
    stopOrder: 1
  };

  constructor(
    private routeService: RouteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadRoutes();
  }

  loadRoutes() {
    this.loading = true;
    this.routeService.getAllRoutes().subscribe({
      next: (data) => {
        this.routes = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading routes:', error);
        this.loading = false;
        this.showError('Failed to load routes');
      }
    });
  }

  openAddModal() {
    this.routeFormData = {
      busNo: '',
      routeName: '',
      routeLine: '',
      operatingDays: [],
      pickupPoints: []
    };
    this.newPickupPoint = { placeName: '', placeDetails: '', pickupTime: '', stopOrder: 1 };
    this.submitted = false;
    this.showAddModal = true;
    this.cdr.detectChanges();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.actionLoading = false;
    this.submitted = false;
  }

  toggleOperatingDay(day: string) {
    const index = this.routeFormData.operatingDays.indexOf(day);
    if (index > -1) this.routeFormData.operatingDays.splice(index, 1);
    else this.routeFormData.operatingDays.push(day);
  }

  isOperatingDaySelected(day: string): boolean {
    return this.routeFormData.operatingDays.includes(day);
  }

  addPickupPoint() {
    if (this.newPickupPoint.placeName && this.newPickupPoint.pickupTime) {
      // Validate pickup time format
      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timePattern.test(this.newPickupPoint.pickupTime)) {
        this.showError('Pickup time must be in format HH:MM');
        return;
      }
      
      this.newPickupPoint.stopOrder = this.routeFormData.pickupPoints.length + 1;
      this.routeFormData.pickupPoints.push({ ...this.newPickupPoint });
      this.newPickupPoint = {
        placeName: '',
        placeDetails: '',
        pickupTime: '',
        stopOrder: this.routeFormData.pickupPoints.length + 1
      };
    } else {
      this.showError('Please fill in Place Name and Pickup Time');
    }
  }

  removePickupPoint(index: number) {
    this.routeFormData.pickupPoints.splice(index, 1);
    this.routeFormData.pickupPoints.forEach((point, idx) => point.stopOrder = idx + 1);
  }

  // Validate bus number format
  isValidBusNumber(busNo: string): boolean {
    const pattern = /^BUS-\d{3}$/;
    return pattern.test(busNo);
  }

  // Validate all fields before saving
  validateForm(): boolean {
    // Check bus number
    if (!this.routeFormData.busNo) {
      this.showError('Bus number is required');
      return false;
    }
    if (!this.isValidBusNumber(this.routeFormData.busNo)) {
      this.showError('Bus number must follow format: BUS-001, BUS-002, etc.');
      return false;
    }

    // Check route name
    if (!this.routeFormData.routeName) {
      this.showError('Route name is required');
      return false;
    }
    if (this.routeFormData.routeName.length < 3) {
      this.showError('Route name must be at least 3 characters');
      return false;
    }

    // Check route line
    if (!this.routeFormData.routeLine) {
      this.showError('Route line is required');
      return false;
    }
    if (this.routeFormData.routeLine.length < 5) {
      this.showError('Route line must be at least 5 characters');
      return false;
    }

    // Check operating days
    if (this.routeFormData.operatingDays.length === 0) {
      this.showError('Please select at least one operating day');
      return false;
    }

    // Check pickup points
    if (this.routeFormData.pickupPoints.length === 0) {
      this.showError('At least one pickup point is required');
      return false;
    }

    return true;
  }

  saveRouteWithValidation() {
    this.submitted = true;
    
    if (!this.validateForm()) {
      return;
    }

    this.actionLoading = true;
    this.routeService.createRoute(this.routeFormData).subscribe({
      next: () => {
        this.showSuccess('Route added successfully!');
        this.closeAddModal();
        this.loadRoutes();
        this.actionLoading = false;
      },
      error: (error) => {
        let errorMessage = 'Failed to add route';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.errors) {
          errorMessage = error.error.errors.map((e: any) => e.message).join(', ');
        }
        this.showError(errorMessage);
        this.actionLoading = false;
      }
    });
  }

  // Original save method (keep for compatibility)
  saveRoute() {
    this.saveRouteWithValidation();
  }

  viewDetails(route: RouteResponse) {
    this.selectedRoute = route;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedRoute = null;
  }

  editRoute(route: RouteResponse) {
    this.selectedRoute = route;
    this.routeFormData = {
      busNo: route.busNo,
      routeName: route.routeName,
      routeLine: route.routeLine,
      operatingDays: [...route.operatingDays],
      pickupPoints: route.pickupPoints.map(pp => ({
        placeName: pp.placeName,
        placeDetails: pp.placeDetails,
        pickupTime: pp.pickupTime,
        stopOrder: pp.stopOrder
      }))
    };
    this.newPickupPoint = { placeName: '', placeDetails: '', pickupTime: '', stopOrder: 1 };
    this.submitted = false;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedRoute = null;
    this.actionLoading = false;
    this.submitted = false;
  }

  updateRouteWithValidation() {
    if (!this.selectedRoute) return;
    
    if (!this.validateForm()) {
      return;
    }
    
    this.actionLoading = true;
    this.routeService.updateRoute(this.selectedRoute.id, this.routeFormData).subscribe({
      next: () => {
        this.showSuccess('Route updated successfully!');
        this.closeEditModal();
        this.loadRoutes();
        this.actionLoading = false;
      },
      error: (error) => {
        let errorMessage = 'Failed to update route';
        if (error.error?.message) {
          errorMessage = error.error.message;
        }
        this.showError(errorMessage);
        this.actionLoading = false;
      }
    });
  }

  updateRoute() {
    this.updateRouteWithValidation();
  }

  updateStatus(route: RouteResponse, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    if (confirm(`Change status of "${route.routeName}" to ${newStatus}?`)) {
      this.routeService.updateRouteStatus(route.id, newStatus).subscribe({
        next: () => {
          this.showSuccess('Status updated!');
          this.loadRoutes();
        },
        error: () => this.showError('Failed to update status')
      });
    }
  }

  confirmDelete(route: RouteResponse) {
    this.selectedRoute = route;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedRoute = null;
    this.actionLoading = false;
  }

  deleteRoute() {
    if (!this.selectedRoute) return;
    this.actionLoading = true;
    this.routeService.deleteRoute(this.selectedRoute.id).subscribe({
      next: () => {
        this.showSuccess('Route deleted successfully!');
        this.closeDeleteModal();
        this.loadRoutes();
        this.actionLoading = false;
      },
      error: (error) => {
        this.showError('Failed to delete route: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }

  getDayShort(day: string): string {
    return day.substring(0, 3);
  }

  private showSuccess(message: string) { 
    alert(message); 
  }
  
  private showError(message: string) { 
    alert(message); 
  }
}