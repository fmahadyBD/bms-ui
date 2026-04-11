// src/app/features/bus-slot/bus-slot/bus-slot.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusSlotService, BusSlot, BusSlotRequest, BusSlotStatistics } from '../bus-slot.service'
import { RouteService } from '../../route/route.service';
import { BusService } from '../../bus/bus.service';
import { Subscription } from 'rxjs';

interface Route {
  id: number;
  routeName: string;
  busNo: string;
  fromLocation: string;
  toLocation: string;
}

interface Bus {
  id: number;
  busName: string;
  busNumber: string;
  status: string;
}

@Component({
  selector: 'app-bus-slot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bus-slot.html',
  styleUrls: ['./bus-slot.css']
})
export class BusSlotComponent implements OnInit, OnDestroy {
  slots: BusSlot[] = [];
  routes: Route[] = [];
  buses: Bus[] = [];
  loading = false;
  actionLoading = false;
  
  // Modal visibility flags
  showAddModal = false;
  showEditModal = false;
  showDetailsModal = false;
  showDeleteModal = false;
  showFilterModal = false;
  
  selectedSlot: BusSlot | null = null;
  
  // Statistics
  statistics: BusSlotStatistics | null = null;
  
  // Form model
  slotForm: BusSlotRequest = {
    routeId: 0,
    busId: undefined,
    slotName: '',
    pickupTime: '',
    dropTime: '',
    fromLocation: '',
    toLocation: '',
    status: 'ACTIVE',
    description: '',
    isRegular: true,
    regularDays: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'
  };
  
  // Filter model
  filterForm: any = {
    routeId: undefined,
    busId: undefined,
    status: undefined,
    fromTime: '',
    toTime: '',
    isRegular: undefined
  };
  
  // Status options
  statusOptions = ['ACTIVE', 'INACTIVE', 'FULL', 'CANCELLED'];
  
  // Regular days options
  regularDaysOptions = [
    { value: 'Monday,Tuesday,Wednesday,Thursday,Friday', label: 'Weekdays' },
    { value: 'Saturday,Sunday', label: 'Weekends' },
    { value: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', label: 'Everyday' },
    { value: 'Monday,Wednesday,Friday', label: 'Monday, Wednesday, Friday' },
    { value: 'Tuesday,Thursday,Saturday', label: 'Tuesday, Thursday, Saturday' }
  ];
  
  private subscriptions: Subscription = new Subscription();

  constructor(
    private busSlotService: BusSlotService,
    private routeService: RouteService,
    private busService: BusService
  ) {}

  ngOnInit(): void {
    this.loadSlots();
    this.loadRoutes();
    this.loadBuses();
    this.loadStatistics();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadSlots(): void {
    this.loading = true;
    this.subscriptions.add(
      this.busSlotService.getAllSlots().subscribe({
        next: (data) => {
          this.slots = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading slots:', error);
          this.loading = false;
        }
      })
    );
  }

  loadRoutes(): void {
    this.subscriptions.add(
      this.routeService.getAllRoutes().subscribe({
        next: (data) => {
          this.routes = data.map((route: any) => ({
            id: route.id,
            routeName: route.routeName,
            busNo: route.busNo,
            fromLocation: route.fromLocation ?? '',
            toLocation: route.toLocation ?? ''
          }));
        },
        error: (error) => {
          console.error('Error loading routes:', error);
        }
      })
    );
  }

  loadBuses(): void {
    this.subscriptions.add(
      this.busService.getAllBuses().subscribe({
        next: (data) => {
          this.buses = data;
        },
        error: (error) => {
          console.error('Error loading buses:', error);
        }
      })
    );
  }

  loadStatistics(): void {
    this.subscriptions.add(
      this.busSlotService.getStatistics().subscribe({
        next: (data) => {
          this.statistics = data;
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
        }
      })
    );
  }

  // Open Add Modal
  openAddModal(): void {
    this.resetForm();
    this.showAddModal = true;
  }

  // Close Add Modal
  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  // Save new slot
  saveSlot(): void {
    if (!this.slotForm.routeId || !this.slotForm.slotName || !this.slotForm.pickupTime || 
        !this.slotForm.fromLocation || !this.slotForm.toLocation) {
      alert('Please fill in all required fields');
      return;
    }
    
    this.actionLoading = true;
    this.subscriptions.add(
      this.busSlotService.createSlot(this.slotForm).subscribe({
        next: () => {
          this.loadSlots();
          this.loadStatistics();
          this.closeAddModal();
          this.actionLoading = false;
        },
        error: (error) => {
          console.error('Error creating slot:', error);
          alert('Failed to create bus slot');
          this.actionLoading = false;
        }
      })
    );
  }

  // Open Edit Modal
  editSlot(slot: BusSlot): void {
    this.selectedSlot = slot;
    this.slotForm = {
      routeId: slot.route.id,
      busId: slot.bus?.id,
      slotName: slot.slotName,
      pickupTime: slot.pickupTime,
      dropTime: slot.dropTime,
      fromLocation: slot.fromLocation,
      toLocation: slot.toLocation,
      status: slot.status,
      description: slot.description,
      isRegular: slot.isRegular,
      regularDays: slot.regularDays
    };
    this.showEditModal = true;
  }

  // Close Edit Modal
  closeEditModal(): void {
    this.showEditModal = false;
    this.resetForm();
    this.selectedSlot = null;
  }

  // Update slot
  updateSlot(): void {
    if (!this.selectedSlot) return;
    
    this.actionLoading = true;
    this.subscriptions.add(
      this.busSlotService.updateSlot(this.selectedSlot.id, this.slotForm).subscribe({
        next: () => {
          this.loadSlots();
          this.loadStatistics();
          this.closeEditModal();
          this.actionLoading = false;
        },
        error: (error) => {
          console.error('Error updating slot:', error);
          alert('Failed to update bus slot');
          this.actionLoading = false;
        }
      })
    );
  }

  // Update slot status
  updateStatus(slot: BusSlot, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    
    this.subscriptions.add(
      this.busSlotService.updateSlotStatus(slot.id, newStatus).subscribe({
        next: () => {
          slot.status = newStatus as any;
          this.loadStatistics();
        },
        error: (error) => {
          console.error('Error updating status:', error);
          alert('Failed to update status');
          select.value = slot.status;
        }
      })
    );
  }

  // View slot details
  viewDetails(slot: BusSlot): void {
    this.selectedSlot = slot;
    this.showDetailsModal = true;
  }

  // Close Details Modal
  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedSlot = null;
  }

  // Confirm delete
  confirmDelete(slot: BusSlot): void {
    this.selectedSlot = slot;
    this.showDeleteModal = true;
  }

  // Close Delete Modal
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedSlot = null;
  }

  // Delete slot
  deleteSlot(): void {
    if (!this.selectedSlot) return;
    
    this.actionLoading = true;
    this.subscriptions.add(
      this.busSlotService.deleteSlot(this.selectedSlot.id).subscribe({
        next: () => {
          this.loadSlots();
          this.loadStatistics();
          this.closeDeleteModal();
          this.actionLoading = false;
        },
        error: (error) => {
          console.error('Error deleting slot:', error);
          alert('Failed to delete bus slot');
          this.actionLoading = false;
        }
      })
    );
  }

  // Open Filter Modal
  openFilterModal(): void {
    this.showFilterModal = true;
  }

  // Close Filter Modal
  closeFilterModal(): void {
    this.showFilterModal = false;
    this.resetFilter();
  }

  // Apply filters
  applyFilters(): void {
    this.loading = true;
    this.subscriptions.add(
      this.busSlotService.filterSlots(this.filterForm).subscribe({
        next: (data) => {
          this.slots = data;
          this.loading = false;
          this.closeFilterModal();
        },
        error: (error) => {
          console.error('Error filtering slots:', error);
          this.loading = false;
        }
      })
    );
  }

  // Clear filters
  clearFilters(): void {
    this.resetFilter();
    this.loadSlots();
  }

  // Reset form
  resetForm(): void {
    this.slotForm = {
      routeId: 0,
      busId: undefined,
      slotName: '',
      pickupTime: '',
      dropTime: '',
      fromLocation: '',
      toLocation: '',
      status: 'ACTIVE',
      description: '',
      isRegular: true,
      regularDays: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday'
    };
  }

  // Reset filter
  resetFilter(): void {
    this.filterForm = {
      routeId: undefined,
      busId: undefined,
      status: undefined,
      fromTime: '',
      toTime: '',
      isRegular: undefined
    };
  }

  // Get route name by ID
  getRouteName(routeId: number): string {
    const route = this.routes.find(r => r.id === routeId);
    return route ? `${route.routeName} (${route.busNo})` : 'Not Assigned';
  }

  // Get bus name by ID
  getBusName(busId: number | undefined): string {
    if (!busId) return 'Not Assigned';
    const bus = this.buses.find(b => b.id === busId);
    return bus ? `${bus.busName} (${bus.busNumber})` : 'Not Assigned';
  }

  // Get status class for styling
  getStatusClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'status-active';
      case 'INACTIVE': return 'status-inactive';
      case 'FULL': return 'status-full';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  }

  // Format time for display
  formatTime(time: string): string {
    if (!time) return 'N/A';
    return time.substring(0, 5);
  }
}