import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../components/navbar-component/navbar-component';
import { AllStudentComponent } from '../../components/all-student-component/all-student-component';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, AllStudentComponent],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
export class ManagerDashboardComponent {
  constructor(public router: Router) {}
}