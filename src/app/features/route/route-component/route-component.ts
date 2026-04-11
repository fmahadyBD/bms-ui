import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
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
  
  routeForm: CreateRouteRequest = {
    busNo: '',
    routeName: '',
    routeLine: '',
    operatingDays: [],
    pickupPoints: []
  };
  
  operatingDaysOptions = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  statusOptions = ['ACTIVE', 'INACTIVE'];
  actionLoading = false;
  
  newPickupPoint: PickupPointRequest = {
    placeName: '',
    placeDetails: '',
    pickupTime: '',
    stopOrder: 1
  };

  constructor(
    private routeService: RouteService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
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
    this.routeForm = {
      busNo: '',
      routeName: '',
      routeLine: '',
      operatingDays: [],
      pickupPoints: []
    };
    this.newPickupPoint = { placeName: '', placeDetails: '', pickupTime: '', stopOrder: 1 };
    this.showAddModal = true;
  }

  closeAddModal() {
    this.showAddModal = false;
    this.actionLoading = false;
  }

  toggleOperatingDay(day: string) {
    const index = this.routeForm.operatingDays.indexOf(day);
    if (index > -1) this.routeForm.operatingDays.splice(index, 1);
    else this.routeForm.operatingDays.push(day);
  }

  isOperatingDaySelected(day: string): boolean {
    return this.routeForm.operatingDays.includes(day);
  }

  addPickupPoint() {
    if (this.newPickupPoint.placeName && this.newPickupPoint.pickupTime) {
      this.newPickupPoint.stopOrder = this.routeForm.pickupPoints.length + 1;
      this.routeForm.pickupPoints.push({...this.newPickupPoint});
      this.newPickupPoint = {
        placeName: '',
        placeDetails: '',
        pickupTime: '',
        stopOrder: this.routeForm.pickupPoints.length + 1
      };
    }
  }

  removePickupPoint(index: number) {
    this.routeForm.pickupPoints.splice(index, 1);
    this.routeForm.pickupPoints.forEach((point, idx) => point.stopOrder = idx + 1);
  }

  saveRoute() {
    if (this.routeForm.operatingDays.length === 0) {
      this.showError('Please select at least one operating day');
      return;
    }
    if (this.routeForm.pickupPoints.length === 0) {
      this.showError('Please add at least one pickup point');
      return;
    }
    
    this.actionLoading = true;
    this.routeService.createRoute(this.routeForm).subscribe({
      next: () => {
        this.showSuccess('Route added successfully!');
        this.closeAddModal();
        this.loadRoutes();
        this.actionLoading = false;
      },
      error: (error) => {
        this.showError('Failed to add route: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
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
    this.routeForm = {
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
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedRoute = null;
    this.actionLoading = false;
  }

  updateRoute() {
    if (!this.selectedRoute) return;
    this.actionLoading = true;
    this.routeService.updateRoute(this.selectedRoute.id, this.routeForm).subscribe({
      next: () => {
        this.showSuccess('Route updated successfully!');
        this.closeEditModal();
        this.loadRoutes();
        this.actionLoading = false;
      },
      error: (error) => {
        this.showError('Failed to update route: ' + (error.error?.message || error.message));
        this.actionLoading = false;
      }
    });
  }

  updateStatus(route: RouteResponse, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    if (confirm(`Change status of ${route.routeName} to ${newStatus}?`)) {
      this.routeService.updateRouteStatus(route.id, newStatus).subscribe({
        next: () => {
          this.showSuccess('Status updated successfully!');
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

  private showSuccess(message: string) { alert(message); }
  private showError(message: string) { alert(message); }
}