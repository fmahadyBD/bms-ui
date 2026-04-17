import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusService, BusRequest } from '../bus';
// import { NavbarComponent } from '../navbar-component/navbar-component';

@Component({
  selector: 'app-new-bus-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './new-bus-request.ts.html',
  styleUrls: ['./new-bus-request.ts.css']
})
export class NewBusRequestComponent implements OnInit {
  busRequest: BusRequest = {
    busName: '',
    busNumber: '',
    status: 'PENDING',
    driverName: '',
    helperName: '',
    driverPhone: '',
    helperPhone: ''
  };
  
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(private busService: BusService) {}

  ngOnInit() {}

  onSubmit() {
    this.submitted = true;
    
    if (!this.isFormValid()) {
      return;
    }
    
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    
    this.busService.createBus(this.busRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Bus request submitted successfully!';
        this.resetForm();
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Failed to submit bus request. Please try again.';
        setTimeout(() => {
          this.errorMessage = '';
        }, 5000);
      }
    });
  }
  
  isFormValid(): boolean {
    return !!this.busRequest.busName &&
           !!this.busRequest.busNumber &&
           !!this.busRequest.driverName &&
           !!this.busRequest.driverPhone;
  }
  
  resetForm() {
    this.busRequest = {
      busName: '',
      busNumber: '',
      status: 'PENDING',
      driverName: '',
      helperName: '',
      driverPhone: '',
      helperPhone: ''
    };
    this.submitted = false;
  }
}