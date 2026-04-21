import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BusSlot {
  id: number;
  busNumber: string;
  route: string;
  driver: string;
  capacity: number;
  booked: number;
  status: 'active' | 'inactive' | 'full' | 'cancelled';
  departureTime: string;
  description: string;
}

@Component({
  selector: 'app-bus-slot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bus-slot.html',
  styleUrls: ['./bus-slot.css']
})
export class BusSlotComponent implements OnInit {
  busSlots: BusSlot[] = [];
  filteredSlots: BusSlot[] = [];
  currentFilter: string = 'all';
  
  // Modal properties
  isModalOpen: boolean = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedSlot: BusSlot | null = null;
  formData: Partial<BusSlot> = {};
  
  // Statistics
  totalBuses: number = 0;
  activeCount: number = 0;
  inactiveCount: number = 0;
  fullCount: number = 0;
  cancelledCount: number = 0;

  ngOnInit(): void {
    this.loadMockData();
    this.updateStats();
    this.applyFilter();
  }

  loadMockData(): void {
    this.busSlots = [
      { id: 1, busNumber: "BUS-101", route: "Downtown → Airport", driver: "John Carter", capacity: 45, booked: 32, status: "active", departureTime: "08:30 AM", description: "Express AC service" },
      { id: 2, busNumber: "BUS-202", route: "Central Station → Seaside", driver: "Emma Watson", capacity: 50, booked: 50, status: "full", departureTime: "10:15 AM", description: "Beach express" },
      { id: 3, busNumber: "BUS-303", route: "North Hub → South Mall", driver: "Michael Lee", capacity: 40, booked: 12, status: "inactive", departureTime: "01:45 PM", description: "Weekend shuttle" },
      { id: 4, busNumber: "BUS-404", route: "East Terminal → West Park", driver: "Sophia Rodriguez", capacity: 55, booked: 28, status: "active", departureTime: "04:00 PM", description: "City loop" },
      { id: 5, busNumber: "BUS-505", route: "University → Tech Park", driver: "David Kim", capacity: 60, booked: 60, status: "full", departureTime: "07:20 AM", description: "Employee special" },
      { id: 6, busNumber: "BUS-606", route: "Harbor → Hill Station", driver: "Lisa Ray", capacity: 35, booked: 0, status: "cancelled", departureTime: "11:00 AM", description: "Cancelled route" }
    ];
  }

  updateStats(): void {
    this.totalBuses = this.busSlots.length;
    this.activeCount = this.busSlots.filter(s => s.status === 'active').length;
    this.inactiveCount = this.busSlots.filter(s => s.status === 'inactive').length;
    this.fullCount = this.busSlots.filter(s => s.status === 'full').length;
    this.cancelledCount = this.busSlots.filter(s => s.status === 'cancelled').length;
  }

  applyFilter(): void {
    if (this.currentFilter === 'all') {
      this.filteredSlots = [...this.busSlots];
    } else {
      this.filteredSlots = this.busSlots.filter(slot => slot.status === this.currentFilter);
    }
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFilter();
  }

  changeStatus(slotId: number, newStatus: string): void {
    const slot = this.busSlots.find(s => s.id === slotId);
    if (slot) {
      slot.status = newStatus as any;
      this.updateStats();
      this.applyFilter();
    }
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedSlot = null;
    this.formData = {
      busNumber: '',
      route: '',
      driver: '',
      capacity: 40,
      booked: 0,
      status: 'active',
      departureTime: '',
      description: ''
    };
    this.isModalOpen = true;
  }

  openEditModal(slot: BusSlot): void {
    this.modalMode = 'edit';
    this.selectedSlot = slot;
    this.formData = { ...slot };
    this.isModalOpen = true;
  }

  openViewModal(slot: BusSlot): void {
    this.modalMode = 'view';
    this.selectedSlot = slot;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedSlot = null;
    this.formData = {};
  }

  saveSlot(): void {
    if (this.modalMode === 'create') {
      const newId = Math.max(...this.busSlots.map(s => s.id), 0) + 1;
      const newSlot: BusSlot = {
        id: newId,
        busNumber: this.formData.busNumber || '',
        route: this.formData.route || '',
        driver: this.formData.driver || '',
        capacity: this.formData.capacity || 40,
        booked: this.formData.booked || 0,
        status: (this.formData.status as any) || 'active',
        departureTime: this.formData.departureTime || '',
        description: this.formData.description || ''
      };
      this.busSlots.push(newSlot);
    } else if (this.modalMode === 'edit' && this.selectedSlot) {
      const index = this.busSlots.findIndex(s => s.id === this.selectedSlot!.id);
      if (index !== -1) {
        this.busSlots[index] = { ...this.busSlots[index], ...this.formData };
      }
    }
    this.updateStats();
    this.applyFilter();
    this.closeModal();
  }

  deleteSlot(slotId: number): void {
    if (confirm('Are you sure you want to delete this bus slot?')) {
      this.busSlots = this.busSlots.filter(s => s.id !== slotId);
      this.updateStats();
      this.applyFilter();
      if (this.isModalOpen) this.closeModal();
    }
  }
}